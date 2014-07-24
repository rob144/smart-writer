package com.rd.smartwriter;

import java.util.List;
import java.io.IOException;
import java.io.InputStream;
import org.languagetool.JLanguageTool;
import org.languagetool.Language;
import org.languagetool.language.BritishEnglish;
import org.languagetool.rules.RuleMatch;
import org.languagetool.rules.patterns.PatternRuleLoader;
import org.languagetool.rules.patterns.PatternRule;
import org.languagetool.tools.RuleAsXmlSerializer;

import java.util.logging.Logger;
import java.util.logging.Level;

public class LTMain
{
    private final int CONTEXT_SIZE = 40; // characters
    private final String RULES_FILENAME = "MyRules.xml";
    private final Logger LOG = Logger.getLogger(LTMain.class.getName());

    public String doCheck(String langCode, String text) throws IOException, InstantiationException, IllegalAccessException
    {   
        String strResults = "";
        //langCode e.g. en-GB, en-US.
        Language lang = Language.getLanguageForShortName(langCode).getClass().newInstance();
        JLanguageTool langTool = new JLanguageTool(lang);
       
        try {
            PatternRuleLoader ruleLoader = new PatternRuleLoader();
            List<PatternRule> myRules = ruleLoader.getRules(
                LTMain.class.getResourceAsStream("/com/rd/smartwriter/" + RULES_FILENAME), RULES_FILENAME);
            for (PatternRule rule : myRules) {
                langTool.addRule(rule);
            }
        }catch (NullPointerException ex) { LOG.log(Level.INFO, ex.toString()); }

        langTool.activateDefaultPatternRules();
        List<RuleMatch> matches = langTool.check(text);
        final RuleAsXmlSerializer serializer = new RuleAsXmlSerializer();
        final String xmlResponse = serializer.ruleMatchesToXml(matches, text, CONTEXT_SIZE, lang);
        return xmlResponse;
    }   
}
