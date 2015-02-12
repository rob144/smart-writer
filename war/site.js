var $editor; 
var $editorClone; 
var $input; 
var $message;
var $cursor = $('<div id="cursor"></div>');
var $textPreparer;
var PREPARER_ID = "textPreparer";
var EDITOR_ID = "textEditor";
var EDITOR_CLONE_ID = "textEditorClone";
var INPUT_ID = "ghostInput";
var editorHasFocus = false;
var arrChars = [];
var newLineIndexes = [];
var cursorIndex = 0;

$( document ).ready(function() {
	
	$textPreparer 	= 	$("#" + PREPARER_ID);
	$editor 		= 	$("#" + EDITOR_ID);
	$editorClone 	= 	$("#" + EDITOR_CLONE_ID);
	$input 			= 	$("#" + INPUT_ID);
	$message 		= 	$("#message");
	$input.val('');
	
	$input.bind					( 'focus'	, inputFocus);
	$input.bind					( 'keydown'	, inputKeydown);
	$input.bind					( 'paste'	, editorPaste);
	$(document).bind			( 'click'	, docClick );
	$(document).bind			( 'keydown'	, docKeyDown );
	$(document).bind			( 'mousemove'	, docMouseMove );
	$editor.bind				( 'click'	, editorClick );
	$editor.bind				( 'keydown'	, editorKeyDown );
	$editor.bind				( 'mousemove', editorMouseMove );
	$('#fsDown').bind			( 'click'	, fontSizeDownClick );
	$('#fsUp').bind				( 'click'	, fontSizeUpClick );
	$('#cursorLeft').bind		( 'click'	, cursorLeftClick );
	$('#cursorRight').bind		( 'click'	, cursorRightClick );
	
	$editor.mouseup(function (e){
       $message.text(getSelectionText());
	})
	
	initCursor();
	initMeasure();
});

/*************************************************************************** 
INIT METODS 
****************************************************************************/
function initMeasure(){
	var can = document.getElementById("editorTopMeasure");
	var c = can.getContext("2d");
	c.lineWidth = 1;
	
	for(var i=5; i<can.width; i+=5){
		c.moveTo(i + 0.5, 0);
		var height = 10 - i % 10;
		c.lineTo(i + 0.5, height);
		c.stroke();
	}
}

function initCursor(){
	$cursor.height(16);
	setCursorPostion($editor.offset().top + 3, $editor.offset().left);
	setInterval ('cursorAnimation()', 400);
}

/*************************************************************************** 
EVENT HANDLER METHODS
****************************************************************************/
function fontSizeDownClick(){
	var size = parseInt($editor.css('font-size'));
	if(size>6) size -= 1;
	$editor.css( 'font-size', size );
	log('font-size ' + size);
}
function fontSizeUpClick(){
	var size = parseInt($editor.css('font-size')) + 1;
	$editor.css( 'font-size', size );
	log('font-size ' + size);
}
function cursorLeftClick(){
	$cursor.offset({ 
		top: $cursor.offset().top, 
		left: $cursor.offset().left - 1
	});
}
function cursorRightClick(){
	$cursor.offset({ 
		top: $cursor.offset().top, 
		left: $cursor.offset().left + 1
	});
}

function docClick(e){
	editorHasFocus = false;
	$('#textEditorContainer').css('background-color','grey');
	$message.text("DOC");
}

function docKeyDown(e){
    if(editorHasFocus) editorKeyDown(e);
    if(preventBackspace(e)) e.preventDefault();
}

function docMouseMove(e){
	$('#mouseCoords').text(
		'['+roundAndFix(e.clientX - $editor.offset().left, 1) + ', ' +
		roundAndFix(e.clientY - $editor.offset().top, 1) + ']'
	);
}

function editorMouseMove(e){
	$('#mouseCoords').text(
		'['+roundAndFix(e.clientX - $editor.offset().left, 1) + ', ' +
		roundAndFix(e.clientY - $editor.offset().top, 1) + ']'
	);
}

function editorClick(e){
	editorHasFocus = true;
	$('#textEditorContainer').css('background-color','blue');
	e.stopPropagation();
	$message.text("editor focus");
	return false;
}

function editorKeyDown(e){
	
	var chr = String.fromCharCode(e.keyCode);
	
	if(e.metaKey){
		 $message.text("meta: " + chr);
		 if(chr == "V"){ //Pasting
			 prepareToPaste(e);	 
		 }else if(chr == "C"){ //Copying
			 COPIED_TEXT = getSelectionText(); 
		 }
	} else if(e.keyCode == 8){	//8 = Backspace key
		document.getElementById(INPUT_ID).focus();
		removeCharFromEditor();
	} else if(e.keyCode == 13) { //13 = Enter (Carriage Return)
		addManualLineBreak();
	} else if(e.keyCode == 16) { //16 = Shift key - do nothing
	} else if(e.ctrlKey){ //Control key - do nothing
	} else {
		//It's a char, add it to the editor
		document.getElementById(INPUT_ID).focus();
		inputKeydown({'keyCode': e.keyCode});
	}
}

function prepareToPaste(e){
	document.getElementById(INPUT_ID).focus();
}

function inputFocus(e){
}

function inputKeydown(e){
    // Short pause to wait for char to be added into the input
    setTimeout( function() {
    	var arrText = $input.val().split('');
    	for(var i = 0; i < arrText.length; i++){
    		addCharToEditor(arrText[i]);
    	}
		$textPreparer.html('');
		$input.val('');
    }, 3);
}

function editorPaste(e){
    // Short pause to wait for paste to complete
    setTimeout( function() {
    	var arrText = $input.val().split('');
        for(var i = 0; i < arrText.length; i++){
    		addCharToEditor(arrText[i]);
    	}
        $input.val('');
    }, 50);
}
function charClick(e){
	
	var $clickedElem = $(this);
	var x = e.pageX - $clickedElem.offset().left;
	var y = e.pageY - $clickedElem.offset().top;
	
	if(x < $clickedElem.width() / 2){
		$cursor.insertBefore($clickedElem);
	}else{
		$cursor.insertAfter($clickedElem);
	}
}

function preventBackspace(e){
	
	var preventKeyPress = false;
	var elem = e.srcElement || e.target;
	
	if (e.keyCode == 8) {  
        switch (elem.tagName.toUpperCase()) {
            case 'TEXTAREA':
                preventKeyPress = elem.readOnly || elem.disabled;
                break;
            case 'INPUT':
                preventKeyPress = elem.readOnly || elem.disabled 
                	|| (elem.attributes["type"] 
                	&& $.inArray(elem.attributes["type"].value.toLowerCase(), 
                			["radio", "checkbox", "submit", "button"]) >= 0);
                break;
            case 'DIV':
                preventKeyPress = elem.readOnly || elem.disabled 
                	|| !(elem.attributes["contentEditable"] 
                	&& elem.attributes["contentEditable"].value == "true");
                break;
            default:
                preventKeyPress = true;
                break;
        }
    }
    else
        preventKeyPress = false;
	
	return preventKeyPress;
}

/*************************************************************************** 
MODIFY STATE METODS 
****************************************************************************/
function removeNewlineIndex(index){
	for(var i = 0; i < newLineIndexes.length; i++){
		if(index == newLineIndexes[i].index){
			log('REMOVING NEWLINE AT: ' + newLineIndexes[i].index);
			newLineIndexes.splice(i,1);
			break;
		}
	}
}

function removeCharFromEditor(){
	
	if(cursorIndex >= 1) {
		
		logCursorPos();
		arrChars.splice(cursorIndex-1, 1);
		var top = $cursor.offset().top;
		renderEditorContent();
		
		var chunkStartPos = findCharChunkStartPos();	
		var chunk = arrChars.slice(chunkStartPos, cursorIndex).join('');

		log('chunk: ' + chunk);

		//Check if the current word will jump back to previous line
		//This needs to check if the newline is a wrapped newline not a manual line break.
		if(isWrapBreakIndex(chunkStartPos)){
			$line = measureContent( getLine(chunkStartPos-1) + chunk);
			if($line.width() > 0 && $line.width() < $editor.width()){
				setCursorPostion(top - 20, $editor.offset().left + $line.width());
				log('RNLI 1');
				removeNewlineIndex(chunkStartPos);
			}			
		}
		
		//If cursorIndex was a newline remove it
		if(isNewlineIndex(cursorIndex - 1)){
			log('RNLI 2');
			removeNewlineIndex(cursorIndex - 1);
			setCursorPostion(top - 20, $editor.offset().left);
		}
		
		cursorIndex--;
		calcNewCursorPos();
		printArrChars();
		//logCursorPos();
	}
}

function addCharToEditor(chr){
	
	arrChars.push(chr);
	cursorIndex++;
	
	//Need to know where the cursor is: e.g. index in char array to insert or append char.
	//When the cursor is moved manually the index should adjust
	//On a click event the index would have to be adjusted via geometry calculations e.g. find line, then nearest char position.
	//On arrow key movement the index would increment or decrement
    
    var top = $cursor.offset().top;
    renderEditorContent();
    calcNewCursorPos(top);
    printArrChars();
}

function addManualLineBreak(){
	arrChars.push("<br class='chrElem'/>");
	addNewLineIndex(cursorIndex, false);
	cursorIndex++;
	var currentTop = $cursor.offset().top;
	renderEditorContent();
    setCursorPostion(currentTop + 20, $editor.offset().left);
    printArrChars();
    logCursorPos();
}

function addNewLineIndex(index, isWrapBreak){
	newLineIndexes.push( { 'index': index, 'isWrapBreak': isWrapBreak } );
}

function renderEditorContent(){
	$editor.html(arrChars.join('').replace(/  /g,' &nbsp;'));
}

function setCursorPostion(cursorPosTop, cursorPosLeft){
	
	$cursor.appendTo($editor);
    $cursor.offset({ 
		top: cursorPosTop, 
		left: cursorPosLeft
	});
}

function calcNewCursorPos(currentCursorPosTop){
	
	var cursorPosTop = 0;
	var cursorPosLeft = 0;
	var $contentBefore = getContentBeforeCursor();
	
	cursorPosTop = currentCursorPosTop;
	cursorPosLeft = parseInt($contentBefore.offset().left + $contentBefore.width()) + 1;
	
	//Check if we will move to next line
	if( $contentBefore.width() > $editor.width() ) {
		
		//Detect if current word will be moved to beginning of next line
		if(arrChars[cursorIndex - 1] != ' '){
			findPrevLineBreakPos();
			$contentBefore = getContentBeforeCursor();
			cursorPosLeft = parseInt($contentBefore.offset().left + $contentBefore.width());
		}else{
			alert('Adding New Line Index');
			addNewLineIndex(cursorIndex, true);
			cursorPosLeft = $editor.offset().left + 1;
		}
		cursorPosTop += 20;//TODO: adapt line height to font size.
	}
	setCursorPostion(cursorPosTop, cursorPosLeft);
}

function cursorAnimation() {
	$('#cursorCoords').text(getCursorPos());
    
	/*$('#cursor').animate({ opacity: 0 }, 'fast', 'swing')
    .animate({ opacity: 1 }, 'fast', 'swing');
    */
}

/*************************************************************************** 
GET METODS 
****************************************************************************/
function getLine(charIndex){
	log('getLine ' + charIndex);
	var arrLine = [];
	for(var i = 0; i < newLineIndexes.length; i++){
		var start = 0;
		if(i >= 1) start = newLineIndexes[i-1].index;
		if(charIndex < newLineIndexes[i].index){
			arrLine = arrChars.slice(start,newLineIndexes[i].index);
		}
	}
	return arrLine.join('');
}

function getContentBeforeCursor(){
	
	var contentBefore = '';
	var lineStartPos = getLineStartPos();
	
	contentBefore = arrChars.slice(lineStartPos, cursorIndex).join('');
	//Replace spaces with &nbsp; entities so we can measure width.
	contentBefore = contentBefore.replace(/ /g,'&nbsp;');
	$contentBefore = $('<span id="contentBefore">' + contentBefore + '</span>');
	$editorClone.html('');
	$contentBefore.appendTo($editorClone);
	
	return $contentBefore;
}

function getLineStartPos(){
	var lineStartPos = 0;
	//Find the start position of the current line.
	if(newLineIndexes.length >= 1){
		var newLineIndex = newLineIndexes[newLineIndexes.length-1].index;
		if(newLineIndex > 0 && newLineIndex < cursorIndex){
			lineStartPos = newLineIndex;
		}
	}
	return lineStartPos;
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

function isNewlineIndex(charIndex){
	var result = false;
	for(var i = 0; i < newLineIndexes.length; i++){
		if(charIndex == newLineIndexes[i].index){
			result = true;
			break;
		}
	}
	return result
}

function isWrapBreakIndex(charIndex){
	var result = false;
	for(var i = 0; i < newLineIndexes.length; i++){
		if(charIndex == newLineIndexes[i].index && newLineIndexes[i].isWrapBreak){
			result = true;
			break;
		}
	}
	return result
}

function findCharChunkStartPos(){
	var chunkStart = -1;
	//Track back until find a space then mark the position.
	for(var i = cursorIndex - 1; i > 0; i--){
		//log('i = ' + i + ' ' + arrChars[i]);
		if(arrChars[i] == ' '){
			log('newline at: ' + i);
			chunkStart = i + 1;
			break;
		}
	}
	return chunkStart;
}

function findPrevLineBreakPos(){
	//Track back until find a space then mark the position.
	for(var i = cursorIndex - 1; i > 0; i--){
		//log('i = ' + i + ' ' + arrChars[i]);
		if(arrChars[i] == ' '){
			log('newline at: ' + i);
			addNewLineIndex(i + 1, true);
			break;
		}
	}
}

function getCursorPos(){
	var left = $cursor.offset().left - $editor.offset().left;
	var top = $cursor.offset().top - $editor.offset().top;
	return '['+roundAndFix(left,1) + ', ' + roundAndFix(top, 1) +']';
}

function measureContent(content){
	content = content.replace(/ /g,'&nbsp;');
	var $htmlElem = $('<span id="contentBefore">' + content + '</span>');
	$editorClone.html('');
	$htmlElem.appendTo($editorClone);
	return $htmlElem;
}

function printArrChars(){
	var strChars = '';
	var tableId = 'debugCharTable';
	
	if( !$('#' + tableId).length ) {
		$('#arrCharsContent').html('<table id="' + tableId + '"><tbody></tbody></table>');
	}
	
	html = '<tr>';
	for(var i=0; i< arrChars.length; i++){
		if(isNewlineIndex(i)){
			if(i>=1) html += '</tr>';
			html += '<tr>';
		}
		html += '<td>' + arrChars[i] + '</td>';	
	}
	html += '</tr>';
	$('#' + tableId + ' > tbody:last').html(html);
}

/*************************************************************************** 
HELPER METODS 
****************************************************************************/

function toCodeString(str){
	var codeString = '';
	for(var i=0;i<str.length;i++){
		codeString += '['+str.charCodeAt(i)+']';
	}
	return codeString;
}

function roundAndFix (number, precision) {
    var multiplier = Math.pow (10, precision);
    return Math.round (number * multiplier) / multiplier;
}

function logCursorPos(){
	 log('cursor pos: ' +  $cursor.offset().top + ' ' + $cursor.offset().left);
}

function log(info){
	console.log('[' + getTimeNow() + '] ' + info);
	$('<p class="entry">['+ getTimeNow() + '] ' 
			+ info + '</p>').appendTo($('#debugLog'));
	var logDiv = document.getElementById("debugLog");
	logDiv.scrollTop = logDiv.scrollHeight;
}

function getTimeNow(){
	var d = new Date(); 
	var h = d.getHours();
	var m = d.getMinutes();
	var s = d.getSeconds();
	return h + ':' + m + ':' + s;
}