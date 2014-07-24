<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<html>

	<head>
        <title>Smart Writer</title>
        <link rel="stylesheet" href="//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css"     > 
        <link rel="stylesheet" type="text/css" href="jquery.qtip.css">
        <link rel="stylesheet" type="text/css" href="sm-styles.css">
        <script src="jquery-1.11.1.js"></script>
        <script src="jquery.qtip.min.js"></script>
        <script src="xsltjs/xslt.js"></script>
        <script src="smartwriter.js"></script>
	</head>

	<body>
        <div id="popup" class="popup">This is my popup!</div>
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
                </select>
                <input type='submit' id='btnSubmitPost' value='Check Text'/>
                <div id='loadingDiv'>
                    <div id='loadingImage'><img  src='loading.gif' alt='loading image'/></div>
                    <div id='loadingMessage'>Loading...</div>
                </div>
            </div>
            <div id='actionsRow'>
                <a class='tab' id='editorTab' href='#' onclick='showTab("inputText")'>Editor</a>
                <a class='tab' id='markupTab' href='#' onclick='showTab("textMarked", getPageText(MARKED_TEXT,1))'>Markup</a>
                <a class='tab' id='tableTab' href='#' onclick='showTab("xslOutput")'>Table</a>
                <a class='tab' id='xmlTab' style='display:none;' href='#' onclick='showTab("xmlOutput")'>XML</a>
                <a class='tabRight' id='clearText' href='#' onclick='clearText()'>Clear Text</a>
            </div>
            <div id='textFields'>
                <textarea id='inputText' name='inputText' cols='100' rows='20'></textarea>
                <div id='textMarked'>Text markup.</div>
                <div id='output'>
                    <div id='xslOutput'>Results will be displayed here.</div>
                    <div id='xmlOutput'>
                        <textarea rows='12' id='xmlOutputText' readonly="readonly">Results will be displayed here.</textarea>
                    </div>
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
                </ul>
            </div>
        </div>
	</body>

</html>
