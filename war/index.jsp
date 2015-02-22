<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<html>

<head>
	<script src="jquery-1.11.1.js"></script>
	<script src="site.js"></script>
	<link href="bootstrap320/css/bootstrap.min.css" rel="stylesheet">
	<script src="bootstrap320/js/bootstrap.min.js"></script>
	<link href="site.css" rel="stylesheet">
</head>

<body>

	<div id='main-top-menu'>
		<a id='toggle-dev-tools' href='#'>dev tools</a>
	</div>

	<div id="dev-tools">
		<div id="dev-tools-inner">
		<div id="topTools">
			<span id="fontSize">
				<a id="fsDown">- </a>font size<a id="fsUp"> +</a>
			</span>
			<span id="moveCursor">
				<a id="cursorLeft">< </a>cursor<a id="cursorRight"> ></a>
			</span>
		</div>
		<input type="text" id="ghostInput" placeholder="ghost input"/>
		<div id="textPreparer"></div>
		<input type="text" id="textInputLoseFocus" maxlength="0" placeholder="lose focus"/>
		<div id="debugLog"></div>
		<div id="textEditorCloneContainer">
			<div id="textEditorCloneOuter">
				<div id="textEditorClone"></div>
			</div>
		</div>
		<div id="arrCharsContent"></div>
		</div>
	</div>

	<div class="pageMainContent">
		
		<h1>Smart Writer</h1>
		
		<div id="home">
			<div id="textEditorPanel">
				<canvas id="editorTopMeasure" width="400" height="10"></canvas>
				<div id="textEditorContainer">
					<div id="textEditorOuter">
						<div id="textEditor"></div>
					</div>
				</div>
				<div id="message"></div>
				<div id="cursorPosition">
					<span id='cursorPosLabel'>cursor: </span>
					<span id='cursorCoords'></span>
				</div>
				<div id="mousePosition">
					<span id='mousePosLabel'>mouse: </span>
					<span id='mouseCoords'></span>
				</div>	
			</div>
		</div>
		
	</div>
</body>

</html>
