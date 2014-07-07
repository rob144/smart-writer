package com.rd.smartwriter;

import com.rd.smartwriter.LTMain;

import java.io.IOException;
import javax.servlet.ServletException;
import java.util.Properties;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class PostServlet extends HttpServlet  {
  @Override
  public void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
      //TODO: handle a post request, get text as a post parameter 
      String text = req.getParameter("text");
      resp.setContentType("text/html");
      resp.getWriter().print( LTMain.doCheck(text) );
  }
}
