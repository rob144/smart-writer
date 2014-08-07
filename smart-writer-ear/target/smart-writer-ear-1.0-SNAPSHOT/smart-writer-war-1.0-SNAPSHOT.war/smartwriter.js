var MARKED_TEXT = ['Run check first.'];
var XML_ERRORS;
var MAX_PAGE_LINES = 50;
var CURRENT_PAGE = 1;
var TOTAL_PAGES;

function setTestText(){
    $.ajax({
        type: 'GET',
        dataType: 'text',
        url: '/example.txt',
        success: function(textfile){
            $("#inputText").text(textfile);
        },
        error: function(xhr, textStatus, error){
            var errorMessage = 'Error getting text.';
            alert(errorMessage);
            console.log(errorMessage);
        }
    });
}

function clearText(){
    $('#inputText').val('');
}

function showTab(viewId, text){

console.log("showTab text: \n" + text );

    var views = ['textMarkedOuter','inputText','xmlOutput','xslOutput','links'];
    for(var i=0;i<views.length;i++){
        if(views[i] != viewId) $('#'+views[i]).css('display','none');
    }
    $('#'+viewId).css('display','block');

    if(viewId == 'textMarked'){
        $('#textMarkedOuter').css('display','block');
        
        if (typeof text === 'undefined'){  
            $('#textMarked').html(MARKED_TEXT);
        }else{
            if(TOTAL_PAGES >= 1){
                $('#textMarked').html(text);
                $('#pageXofY').text('Page ' + CURRENT_PAGE + ' of ' + TOTAL_PAGES);
                $('#pageXofY').css('display','inline');
                $('#pagination').css('display','block');
                prepareErrorPopups();
            }
        }
    }else{
        $('#pagination').css('display','none');
    }
}

function prepareErrorPopups(){
    //Add the popup messages for the grammar errors
    $('#textMarked').find('span').each(function(){
        var popupText = ''
        var arrErrIds = $(this).attr('id').split('e'); 
        for(var i=1;i<arrErrIds.length;i++){
            if(arrErrIds[i] +'' != ''){
                popupText += '<p>'+$(XML_ERRORS).find('error[ref="'+arrErrIds[i]+'"]').attr('msg') + '</p>';     
            }
        }
        $(this).css('position','relative');
        var popupID = "pop_" + $(this).attr('id');
        $(this).bind('mouseenter mouseleave', function(e){
            $(this).append("<div class='popup' id='" + popupID + "'>"+popupText+"</div>");
            var popup = $("#"+ popupID);
            if(e.type === 'mouseenter'){
                 popup.stop(1).fadeTo(300,0.9)
            }else{
                 popup.stop(1).fadeTo(300,0);
                 popup.css('display','none');
            }
        }); 
    });
}

function addErrorMarkup(textDiv, xmlObj){
    
    var textLines = $(textDiv).val().replace(/(?:\r\n|\r|\n)/g, '<br/>').split('<br/>');
    var offset = 0;
    var previousLine = 0;
    
    var arrXmlErrors = $(xmlObj).find("error");
    var arrMarkupIds = [];

    //For each error reported, insert some markup before and after the relevant position in the text
    for(var i=0;i<arrXmlErrors.length;i++){    
        
        var xmlError = arrXmlErrors[i];
        
        var objErr = { 
                        x: parseInt( $(xmlError).attr('fromx') ),
                        y: parseInt( $(xmlError).attr('fromy') ),
                        ids: [ $(xmlError).attr('ref') ]
                        }  

        if(i>=1){
            var y1 = parseInt($(arrXmlErrors[i-1]).attr('fromy'));
            var x1 = parseInt($(arrXmlErrors[i-1]).attr('fromx'));
            
            if( y1 == objErr.y && x1 == objErr.x ){
                console.log('found match');
                arrMarkupIds[i-1].ids.push( objErr.ids[0] );
            }else{
                arrMarkupIds.push( objErr ); 
            }
        }else{
            arrMarkupIds.push( objErr ); 
        }
    }
    
    var textLines = $(textDiv).val().replace(/(?:\r\n|\r|\n)/g, '<br/>').split('<br/>');
    var offset = 0;
    var previousLine = 0;
    
    for(var i=0;i<arrMarkupIds.length;i++){    

        var idAttribute = '';
        
        for(var j=0;j<arrMarkupIds[i].ids.length;j++){
            idAttribute += 'e'+arrMarkupIds[i].ids[j];
        }

        var markerStart = '<span id="' + idAttribute +'">';
        var markerEnd ="</span>";
        
        var lineIndex = arrMarkupIds[i].y; 
        if (lineIndex != previousLine) offset = 0;
        
        var line = textLines[lineIndex];
        var charIndexStart = arrMarkupIds[i].x + offset; 
        var charIndexEnd = charIndexStart;
        
        while(line.charAt(charIndexEnd).match(/\w|[']/)){
            //This is a word character, find the end of the word.
            charIndexEnd++;
        }
        if(charIndexStart == charIndexEnd) charIndexEnd++;
        textLines[lineIndex] =
            [line.slice(0, charIndexStart),
            markerStart,
            line.slice(charIndexStart, charIndexEnd),
            markerEnd,
            line.substr(charIndexEnd)
            ].join('');
        offset += markerStart.length + markerEnd.length;
        previousLine = lineIndex;
    }
    
    //Insert html formatting for paragraphs and blank lines. 
    var markedLines = [];
    for (var i = 0; i < textLines.length; i++) { 
        if((textLines[i].trim() + "" ) == ""){
            markedLines.push("<br/>");
        }else{
            markedLines.push("<p class='line'>" + textLines[i] +"</p>");
        }
    }

    return markedLines;
}

function getPageText(markedLines, pageNumber){
    
    var pageText = "";
    CURRENT_PAGE = pageNumber;

console.log("Page number: " + pageNumber);
console.log("Lines: " + markedLines.length);
    
    var position = (pageNumber - 1) * MAX_PAGE_LINES;

console.log("position: " + position );

    for(var i = position; i < markedLines.length && i < position + MAX_PAGE_LINES; i++){
        pageText += markedLines[i];
    }

    return pageText;
}

function getTotalPages(markedLines){
    TOTAL_PAGES = Math.ceil(markedLines.length / MAX_PAGE_LINES);
}

$( document ).ready(function() {
    
    setTestText();

    $( "#btnSubmitPost" ).click(function() {
        
        $("#loadingDiv").show();

        $.ajax({
            type: 'POST',
            dataType: 'text',
            url: '/test',
            data: 'language='+ $('#selectLang').val() +'&text=' + encodeURIComponent( $( "#inputText" ).val() ),
            success: function(xml){
                /* remove the <? xml version ... ?> tag */
                xml = xml.substr(xml.indexOf('?>')+2);  
                var $xmlObj = $( $.parseXML('<root>'+ xml +'</root>') );
                XML_ERRORS = $xmlObj; 
                $xmlObj.find('error').each(function(index){
                    $(this).attr('ref', index);
                });
                
                var xmlString = $xmlObj.find('root').html().trim();
                console.log(xmlString);
                $("#xmlOutputText").text(xmlString);
                $("#loadingDiv").hide();
                new Transformation().setXml(xmlString).setXslt("grammar_errors.xsl").transform("xslOutput");
                MARKED_TEXT = addErrorMarkup('#inputText', $xmlObj);
                getTotalPages(MARKED_TEXT);
                showTab('textMarked', getPageText(MARKED_TEXT, 1));
            },
            error: function(xhr, textStatus, error){
                var errorMessage = 'Error connecting to the LanguageTool server.';
                alert(errorMessage);
                console.log(errorMessage);
            }
        });
    });   

});
