<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<html>

    <head>
       <script src="//code.jquery.com/jquery-1.11.0.min.js"></script> 
       <style>
            body { padding:10px;font-family: Arial, Helvetica, sans-serif;}
            .titleRow { width:100%; overflow:auto; margin:10px 0 5px 0;}
            h1 { font-size: 14pt; }
            h2 { font-size: 12pt; float:left; margin:0; padding:0; }
            textarea {
                clear:both;
                font-family: "Courier New", Courier, monospace;
                margin:0; 
                padding:8px;
                font-size:11pt;
            }
            input[type=submit] {font-size: 16pt;}
            table { border-collapse:collapse; }
            th { padding: 4px; font-size:11pt; }
            td { padding: 4px; font-size:11pt; }
            #inputTabs { margin: 5px 0 5px 0; }
            #textMarked { 
                display:none; 
                font-family: "Courier New", Courier, monospace;
                font-size:11pt;
                width:900px;  
                border:1px solid black;
                padding:8px; 
            }
            #loadingDiv { display: none; width:200px; float:left; }
            #loadingMessage div { float:left; margin:0 0 0 10px; }
            #loadingImage img { width:18px; float:left; margin:0 0 0 10px; }
            #outputTabs { margin:5px 0 5px 0; }
            #xmlOutput { display:none;  }
            p.line { margin: 0 0 4px 0; }
            span.e { 
                padding:2px 2px 0 2px;
                background: #99ccff;
                border-radius: 4px;
            }
            #testText { display:none; }
        </style>
    </head>

    <body>
        <h1>Smart Writer</h1>
        <p>
            <input type='submit' id='btnSubmitPost' value='Check Text'/>
        </p>
        <div class='titleRow'> 
            <h2>Input Text</h2>
        </div>
        <div id='inputTabs'>
            <a id='editorTab' href='javascript:showInputTab(0)'>Editor</a>
            <a id='markupTab' href='javascript:showInputTab(1)'>Markup</a>
        </div>
        <div id='textFields'>
            <div id='textEditor'>
                <textarea id='inputText' name='inputText' cols='100' rows='12'></textarea>
            </div>
            <div id='textMarked'>Text markup.</div>
        </div>

        <div class='titleRow'>  
            <h2>Results</h2>
            <div id='loadingDiv'>
                <div id='loadingImage'><img  src='loading.gif' alt='loading image'/></div>
                <div id='loadingMessage'>Loading...</div>
            </div>
        </div>
        <div id='outputTabs'>
            <a id='tableTab' href='javascript:showResultsTab(0)'>Table</a>
            <a id='xmlTab' href='javascript:showResultsTab(1)'>XML</a>
        </div>
        <div id='output'>
            <div id='xslOutput'>Results will be displayed here.</div>
            <div id='xmlOutput'>
                <textarea cols='100' rows='12' id='outputText' readonly="readonly">Results will be displayed here.</textarea>
            </div>
    </body>

    <script type='text/javascript'>
        var markText = 'Run check first.';
        function showInputTab(tabId){
           switch(tabId) {
                case 0:
                    $('#textMarked').css('display','none');
                    $('#textEditor').css('display','block');
                    break;
                case 1:
                    $('#textEditor').css('display','none');
                    $('#textMarked').css('display','block');
                    if (typeof text === 'undefined'){  
                        $('#textMarked').html(markText);
                    }else{
                        $('#textMarked').html(text);
                    }
                    //Add the popup events to the errors
                    $('#textMarked').find('span').each(function(){
                        $(this).qtip({
                            content: { text: $(this).attr('title').replace('\n','<br/>').replace(/[#]/g , ', ') },
                            position: {
                                my: 'bottom left',  // Position my top left...
                                at: 'top right', // at the bottom right of...
                                target: $(this) // my target
                            }
                        }) 
                    });
                    break;
                default: break;
            } 
        };
        function showResultsTab(tabId){
            switch(tabId){
                case 0:
                    $('#xmlOutput').css('display','none');
                    $('#xslOutput').css('display','block');
                    break;
                case 1:
                    $('#xslOutput').css('display','none');
                    $('#xmlOutput').css('display','block');
                    break;
                default: break;
            }
        };
        function addErrorMarkup(textDiv, xml){
                
            var $xmlObj = $( $.parseXML( xml ) );
            var textLines = $(textDiv).val().replace(/(?:\r\n|\r|\n)/g, '<br/>').split('<br/>');
            var offset = 0;
            var previousLine = 0;

            $xmlObj.find("error").each(function(errIndex){

                //var markerStart = "<span id='e"+errIndex+"' class='e' title='"+ $(this).attr('msg') +" "+ $(this).attr('replacements') +">";
                var replacements = "";
                if($(this).attr('replacements').length >= 1){
                    replacements = "\nReplacements: " + $(this).attr('replacements'); 
                }
                var markerStart = "<span id='e"+errIndex+"' class='e' title='"+ $(this).attr('msg') + " "+replacements +"'>";
                var markerEnd ="</span>";

                var lineIndex = parseInt( $(this).attr('fromy') ); 
                if (lineIndex != previousLine) offset = 0;
                
                var line = textLines[lineIndex];
                var charIndexStart = parseInt( $(this).attr('fromx') ) + offset; 
                var charIndexEnd = charIndexStart;
                
                while(line.charAt(charIndexEnd).match(/\w/)){
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
            });
            
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
            //Until I get the xsl table working just display the xml. 
            showResultsTab(1);

            $( "#btnSubmitPost" ).click(function() {
                
                $("#loadingDiv").show();

                var url = 'http://dev5.oak.iparadigms.com:6818';
                $.ajax({
                    type: 'POST',
                    dataType: 'text',
                    url: 'http://dev5.oak.iparadigms.com:6818',
                    data: 'language=en-GB&text=' + encodeURIComponent( $( "#inputText" ).val() ),
                    success: function(xml){
                        //remove the <? xml version ... ?> tag
                        xml = xml.substr(xml.indexOf('?>')+2);  
                        var $xmlObj = $( $.parseXML('<root>'+ xml+'</root>') );
                        $xmlObj.find('error').each(function(index){
                           $(this).attr('ref', index);  
                        });
                        var xmlString = $xmlObj.find('root').html().trim();
                        console.log(xmlString);
                        $("#outputText").text(xmlString);
                        $("#loadingDiv").hide();
                       // new Transformation().setXml(xmlString)
                       //     .setXslt("grammar_errors.xsl").transform("xslOutput");
                        markText = addErrorMarkup('#inputText', xmlString);
                        showInputTab(1, markText);
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
