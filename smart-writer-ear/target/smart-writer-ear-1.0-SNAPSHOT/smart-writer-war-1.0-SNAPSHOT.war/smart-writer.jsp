<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<html>

	<head>
        <title>Smart Writer</title>
        <link rel="stylesheet" href="//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css"     > 
        <link rel="stylesheet" type="text/css" href="jquery.qtip.css">
        <link rel="stylesheet" type="text/css" href="lt-styles.css">
        <script src="jquery-1.11.1.js"></script>
        <script src="jquery.qtip.min.js"></script>
        <script src="xsltjs/xslt.js"></script>
	</head>

	<body>
        <div id='pageContent'>
        <div id='headerRow'>
            <h1 id='headerLeft'>Smart Writer</h1>
            <p id='headerRight'>
	    	</p>
        </div>
		<div id='buttonRow'>
            <select id='selectLang'>
                <option value='en-GB'>English (GB)</option>
                <option value='en-US'>English (US)</option>
                <option value='de-DE'>German (DE)</option>
            </select>
			<input type='submit' id='btnSubmitPost' value='Check Text'/>
	      	<div id='loadingDiv'>
	      		<div id='loadingImage'><img  src='loading.gif' alt='loading image'/></div>
	      		<div id='loadingMessage'>Loading...</div>
	      	</div>
		</div>
        <div id='actionsRow'>
            <a class='tab' id='editorTab' href='#' onclick='showTab("inputText")'>Editor</a>
            <a class='tab' id='markupTab' href='#' onclick='showTab("textMarked")'>Markup</a>
            <a class='tab' id='tableTab' href='#' onclick='showTab("xslOutput")'>Table</a>
            <a class='tab' id='xmlTab' href='#' onclick='showTab("xmlOutput")'>XML</a>
            <a class='tab' id='linksTab' href='#' onclick='showTab("links")'>Links</a>
            <a class='tabRight' id='clearText' href='#' onclick='clearText()'>Clear Text</a>
        </div>
        <div id='textFields'>
            <textarea id='inputText' name='inputText' cols='100' rows='12'></textarea>
            <div id='textMarked'>Text markup.</div>
        </div>
        <div id='output'>
            <div id='xslOutput'>Results will be displayed here.</div>
            <div id='xmlOutput'>
		        <textarea rows='12' id='xmlOutputText' readonly="readonly">Results will be displayed here.</textarea>
            </div>
        </div>
        <div id='links'>
            <ul>
                <li><a target="_blank" href="https://www.languagetool.org/">www.languagetool.org</a></li>
                <li><a target="_blank" href="https://www.danielnaber.de/">www.danielnaber.de</a></li>
                <li><a target="_blank" href="https://github.com/languagetool-org/languagetool">LT on GitHub</a></li>
                <li><a target="_blank" href="http://community.languagetool.org/">LT Community (Text Analysis, Rule Editor, WikiCheck)</a></li>
                <li><a target="_blank" href="http://github.com/kimduho/nlp/wiki/Part-of-Speech-tags/">Example POS Tags</a></li>
                <li><a target="_blank" href="http://languagetool-user-forum.2306527.n4.nabble.com/">LT User Forum</a></li>
                <li><a target="_blank" href="http://wiki.languagetool.org/developing-robust-rules/">Developing robust rules</a></li>
        </div>
        </div>
	</body>

	<script>
        var MARKED_TEXT = 'Run check first.';
        var GRAMMAR_ERRORS = [];
        var XML_ERRORS;

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

            var views = ['textMarked','inputText','xmlOutput','xslOutput','links'];
            for(var i=0;i<views.length;i++){
                if(views[i] != viewId) $('#'+views[i]).css('display','none');
            }
            $('#'+viewId).css('display','block');

            if(viewId == 'textMarked'){
                if (typeof text === 'undefined'){  
                    $('#textMarked').html(MARKED_TEXT);
                }else{
                    $('#textMarked').html(text);
                }
                //Add the popup messages for the grammar errors
                $('#textMarked').find('span').each(function(){
                    var popupText = ''
                    var arrErrIds = $(this).attr('id').split('e'); 
                    for(var i=1;i<arrErrIds.length;i++){
                        if(arrErrIds[i] +'' != ''){
                            popupText += '<p>'+$(XML_ERRORS).find('error[ref="'+arrErrIds[i]+'"]').attr('msg') + '</p>';     
                        }
                    }
                    $(this).qtip({
                        content: {
                            text: popupText
                        },
                        style: { classes: 'myQtipStyle' },
                        position: {
                            my: 'bottom left',  // Position my top left...
                            at: 'top right', // at the bottom right of...
                            target: $(this) // my target
                        }
                    }) 
                });
            }
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
            var markedText = '';
            for (var i = 0; i < textLines.length; i++) { 
                if((textLines[i].trim() + "" ) == ""){
                    markedText += "<br/>";
                }else{
                    markedText += "<p class='line'>" + textLines[i] +"</p>";
                }
            }

            return markedText;
        }

		$( document ).ready(function() {

            setTestText();

			$( "#btnSubmitPost" ).click(function() {
			   	
                $("#loadingDiv").show();

			   	$.ajax({
			  		type: 'POST',
			  		dataType: 'text',
			  		url: 'http://dev5.oak.iparadigms.com:6818',
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
                        showTab('textMarked', MARKED_TEXT);
			  		},
                    error: function(xhr, textStatus, error){
                       var errorMessage = 'Error connecting to the LanguageTool server.';
                       alert(errorMessage);
                       console.log(errorMessage);
                    }
			 	});
			});   

		});

	</script>

</html>
