package com.rd.smartwriter;

import com.rd.smartwriter.LTMain;

import java.io.IOException;
import javax.servlet.ServletException;
import java.util.Properties;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class MyServlet extends HttpServlet  {
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
      
      req.setAttribute("test", "RESULT: " + LTMain.doCheck("thiss is an sentance wit some errors."));
      req.getRequestDispatcher("smart-writer.jsp").forward(req, resp);
      Properties p = System.getProperties();
      p.list(resp.getWriter());
  }
  @Override
  public void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
      //TODO: handle a post request, get text as a post parameter 
      String text = req.getParameter("text");
      req.setAttribute("test", "RESULT: " + LTMain.doCheck(text));
      req.getRequestDispatcher("smart-writer.jsp").forward(req, resp);
      Properties p = System.getProperties();
      p.list(resp.getWriter());
  }
}
