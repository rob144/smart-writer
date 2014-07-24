package com.rd.smartwriter;

import com.rd.smartwriter.LTMain;

import java.io.IOException;
import javax.servlet.ServletException;
import java.util.Properties;
import java.util.logging.Logger;
import java.util.logging.Level;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class PostServlet extends HttpServlet  {
    private final static Logger LOG = Logger.getLogger(HttpServlet.class.getName());
    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        LOG.log(Level.INFO, "***Post Servlet****");
        
        String lang = req.getParameter("language");
        String text = req.getParameter("text");
        
        LOG.log(Level.INFO, "POSTED TEXT: {0}", text );
        
        resp.setContentType("text/html");

        String results = "";

        try{
            LTMain lt = new LTMain();
            results = lt.doCheck(lang, text);   
        }catch(Exception ex){
            throw new ServletException("Exception thrown in PostServlet doPost()",ex);

        }
        LOG.log(Level.INFO, "RESULTS: {0}", results );
        resp.getWriter().print( results );
  }
}
