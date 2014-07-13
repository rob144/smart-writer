package com.rd.smartwriter;

import java.util.List;
import java.io.IOException;
import org.languagetool.JLanguageTool;
import org.languagetool.Language;
import org.languagetool.language.BritishEnglish;
import org.languagetool.rules.RuleMatch;
import org.languagetool.tools.RuleAsXmlSerializer;

public class LTMain
{
    private static final int CONTEXT_SIZE = 40; // characters

    public static String doCheck(String langCode, String text) throws IOException, InstantiationException, IllegalAccessException
    {   
        String strResults = "";
        //langCode e.g. en-GB, en-US.
        Language lang = Language.getLanguageForShortName(langCode).getClass().newInstance();
        JLanguageTool langTool = new JLanguageTool(lang);
        langTool.activateDefaultPatternRules();
        List<RuleMatch> matches = langTool.check(text);
        final RuleAsXmlSerializer serializer = new RuleAsXmlSerializer();
        final String xmlResponse = serializer.ruleMatchesToXml(matches, text, CONTEXT_SIZE, lang);
        return xmlResponse;
    }   
}
