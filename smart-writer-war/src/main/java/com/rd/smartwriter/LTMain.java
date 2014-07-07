package com.rd.smartwriter;
import java.util.List;
import java.io.IOException;
import org.languagetool.JLanguageTool;
import org.languagetool.language.BritishEnglish;
import org.languagetool.rules.RuleMatch;
public class LTMain
{
    public static String doCheck(String text) throws IOException
    {   
        String strResults = "";
        JLanguageTool langTool = new JLanguageTool(new BritishEnglish());
        langTool.activateDefaultPatternRules();
        List<RuleMatch> matches = langTool.check(text);
        for (RuleMatch match : matches) {
            strResults += match.getLine() + ", column " + match.getColumn() + ": " + match.getMessage();
            strResults += match.getSuggestedReplacements();
        }   
        return strResults;
    }   
}
