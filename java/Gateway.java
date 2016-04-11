import java.io.*;
import java.net.*;
import java.util.*;
import org.json.simple.parser.JSONParser;
import org.json.simple.JSONObject;

public class Gateway {
  public static void main(String[] args) {
    HashMap<String, String> request = new HashMap<String, String>();
    request.put("boardId", "testboard");
    JSONObject requestObj = new JSONObject(request);
    JSONObject json = Gateway.send("subscribe", requestObj);
    System.out.println(json.toString());
  }

  static public JSONObject send(String command, JSONObject request) {
    try {
      URL url=new URL("http://" + Global.ServerIP + ":" + Global.ServerPort + "/" + "board_" + command);
      HttpURLConnection huc = (HttpURLConnection)url.openConnection();
      huc.setDoOutput(true);
      huc.setDoInput(true);

      OutputStream os = huc.getOutputStream();
      PrintWriter pw = new PrintWriter(new OutputStreamWriter(os, "UTF-8"));
      pw.write(request.toString());
      pw.close();

      InputStream is = huc.getInputStream();
      BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
      String line = null;
      StringBuffer sb = new StringBuffer();
      while ((line = reader.readLine()) != null) {
          sb.append(line);
      }
      is.close();
      String response = sb.toString();
      JSONObject json = (JSONObject)new JSONParser().parse(response);
      huc.disconnect();
      return json;
    } catch(Exception e) {
      System.out.println(e);
      return new JSONObject();
    }
  }
}
