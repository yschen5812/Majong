import javax.swing.*;
import java.awt.*;
import java.util.*;
import java.util.UUID;
import java.util.concurrent.*;
import org.json.simple.parser.JSONParser;
import org.json.simple.*;

public class BoardGUI extends JFrame {

 public static void main(String[] args) {
   BoardGUI app = new BoardGUI();
 }


 // Constructor
 BoardGUI() {
   super( "Sheng Mahjong" );

   setSize( Global.WINDOWWIDTH, Global.WINDOWHEIGHT );
   setDefaultCloseOperation( JFrame.EXIT_ON_CLOSE );
   setLocation();

   setLayout( new BorderLayout() );

   d_northTiles = new UserTiles(Global.HORIZONTAL);
   d_southTiles = new UserTiles(Global.HORIZONTAL);
   d_westTiles  = new UserTiles(Global.VERTICAL);
   d_eastTiles  = new UserTiles(Global.VERTICAL);
   d_seaFloor  = new SeaFloor();
   add(d_northTiles, BorderLayout.NORTH);
   add(d_southTiles, BorderLayout.SOUTH);
   add(d_westTiles,  BorderLayout.WEST);
   add(d_eastTiles,  BorderLayout.EAST);
   add(d_seaFloor,   BorderLayout.CENTER);

   // initialize data member
   d_userSeatTable = new HashMap<String, String>();;
   d_userNameTable = new HashMap<String, String>();


   // init event window
   d_eventWindow = new EventWindow(this);

   setVisible(true);

   // start UI
   initiateGame();


   // TEST UI
  //  for (int i = 1; i < 40; ++i) {
  //    d_seaFloor.discardToSeaFloor("<html>二<br/>條</html>");
  //  }
   //
  //  for (int i = 0; i < 4; ++i) {
  //    d_northTiles.showTile("<html>二<br/>條</html>");
  //    d_southTiles.showTile("<html>二<br/>條</html>");
  //    d_eastTiles.showTile("<html>二<br/>條</html>");
  //    d_westTiles.showTile("<html>二<br/>條</html>");
  //  }
 }

 private void setLocation() {
   Dimension dim = Toolkit.getDefaultToolkit().getScreenSize();
   super.setLocation(dim.width/2-super.getSize().width/2, dim.height/2-super.getSize().height/2);
 }

 private void initiateGame() {
   JTextField boardId = new JTextField();
   JTextField player1 = new JTextField();
   JTextField player2 = new JTextField();
   JTextField player3 = new JTextField();
   JTextField player4 = new JTextField();
   final JComponent[] inputs = new JComponent[] {
       new JLabel("想進入哪個牌桌? (不支援中文字)"),
       boardId,
       new JLabel("Player1"),
       player1,
       new JLabel("Player2"),
       player2,
       new JLabel("Player3"),
       player3,
       new JLabel("Player4"),
       player4
   };
   int result = JOptionPane.showConfirmDialog(null, inputs, "Control Panel", JOptionPane.PLAIN_MESSAGE);
   if (result == JOptionPane.CLOSED_OPTION) {
     System.out.println("closed");
     System.exit(0);
   }

   String boardIdInput = boardId.getText().trim();
   if (boardIdInput.isEmpty()) {
     JOptionPane.showMessageDialog(null, "牌桌不可空白", "alert", JOptionPane.ERROR_MESSAGE);
     initiateGame();
   }

   // register board to subscribe the updates to the game
   if (!registerBoard(boardIdInput)) {
     JOptionPane.showMessageDialog(null, "無法註冊牌桌, 離開程式", "alert", JOptionPane.ERROR_MESSAGE);
     System.exit(0);
   }

   // register users via this board
   java.util.List<String> players = new ArrayList<String>();
   players.add(player1.getText().trim());
   players.add(player2.getText().trim());
   players.add(player3.getText().trim());
   players.add(player4.getText().trim());
   for (String player : players) {
     if (player.isEmpty()) {
       continue;
     }
     if (!registerUser(boardIdInput, player)) {
       JOptionPane.showMessageDialog(null, "無法註冊" + player + ", 離開程式", "alert", JOptionPane.ERROR_MESSAGE);
       System.exit(0);
     }
   }

   // notify users registered via this board to start browser
   String msg = "<html>請每位使用者在手機瀏覽器配合你被分配的註冊碼輸入以下網址:<br/>";
   msg += "&nbsp;'http://" + Global.ServerIP + ":" + Global.ServerPort + "/browser_startgame&lsid=您的註冊碼&bid=" + boardIdInput + "'&nbsp;&nbsp;<br/><br/>";
   for (String lsid : d_userNameTable.keySet()) {
     msg += "&nbsp;>>>'" + d_userNameTable.get(lsid) + "' 的註冊碼為:" + lsid + "<br/>";
   }
   msg += "<br/>";
   msg += "請等所有使用者都完成此步驟在按'OK'鍵";
   msg += "</html>";
   JOptionPane.showMessageDialog(null, msg, "info", JOptionPane.INFORMATION_MESSAGE);


   // send start game request
   WaitingWindow waiting = new WaitingWindow(this);
   startGame(boardIdInput);
   waiting.hideWindow();

   // set up periodic task to request updates
   setUpdateInterval(boardIdInput);
 }

 private boolean registerBoard(String boardName) {
   HashMap<String, String> request = new HashMap<String, String>();
   request.put("boardId", boardName);
   JSONObject requestObj = new JSONObject(request);
   JSONObject json = Gateway.send("subscribe", requestObj);
   d_boardSid = (String)json.get("boardSessionId");
   return (d_boardSid == null) ? false : true;
 }

 private boolean registerUser(String boardName, String userName) {
   String uuid = UUID.randomUUID().toString().substring(0, 5);

   JSONObject request = new JSONObject();
   JSONObject user = new JSONObject();
   user.put("loginSessionId", uuid);
   user.put("name", userName);
   request.put("boardId", boardName);
   request.put("user", user);
   JSONObject json = Gateway.send("userjoin", request);
   System.out.println(json.toString());
   Object rc = json.get("success");
   if (rc == null) return false;

   // only register success put into the map
   d_userNameTable.put(uuid, userName);
   return true;
 }

 private boolean startGame(String boardName) {
   HashMap<String, String> request = new HashMap<String, String>();
   request.put("boardId", boardName);
   JSONObject requestObj = new JSONObject(request);
   JSONObject json = Gateway.send("startgame", requestObj);
   System.out.println(json.toString());
   Object rc = json.get("success");
   if (rc == null) {
     return false;
   }

   JSONObject users = (JSONObject)rc;
   if (users.size() != 4) {
     System.out.println("ERROR: number of users when startgame should be 4.");
     return false;
   }

   // users = {"28c96":{"name":"2","loginSessionId":"28c96"},"17e17":{"name":"1","loginSessionId":"17e17"},"9f954":{"name":"3","loginSessionId":"9f954"},"c9091":{"name":"4","loginSessionId":"c9091"}}
   Iterator<String> lsids = users.keySet().iterator();
	 while (lsids.hasNext()) {
     String loginSessionId = (String)lsids.next();
	   JSONObject user = (JSONObject)users.get(loginSessionId);
     String name = (String)user.get("name");

     // save to map
     String nameExist = d_userNameTable.putIfAbsent(loginSessionId, name);
     if (nameExist != null && !nameExist.equals(name)) {
       System.out.println("ERROR: name records not match existing=" + nameExist + ", name=" + name);
       return false;
     }
	 }

   return true;
 }

 private void setUpdateInterval(String boardName) {
   HashMap<String, String> request = new HashMap<String, String>();
   request.put("boardId", boardName);
   request.put("boardSessionId", d_boardSid);
   JSONObject requestObj = new JSONObject(request);

   ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();
   Runnable periodicTask = new Runnable() {
     public void run() {
       // put into try-catch or it's hard to debug another thread
       try {
         JSONObject json = Gateway.send("requestupdate", requestObj);
         JSONArray updates = (JSONArray)json.get("success");

         System.out.println(updates.toString());
         for (int i = 0; i < updates.size(); ++i) {
           JSONObject updateJson = (JSONObject)updates.get(i);
           JSONObject action = (JSONObject)updateJson.get("action");
           String playerLsid = (String)updateJson.get("player");

           String event = (String)(action.keySet().iterator().next());
           Object data = action.get(event);
           executeEvent(event, data, playerLsid);

           // record into event window
           d_eventWindow.addEvent(d_userNameTable.get(playerLsid), event);
         }
       } catch(Exception e){
         System.out.println(e.toString());
       }
     }
   };

   executor.scheduleAtFixedRate(periodicTask, 0, 2, TimeUnit.SECONDS);
 }

 private void executeEvent(String event, Object data, String playerLsid) {
   switch (event) {
     case Global.DRAWSEAT:
       handleDrawSeat(data, playerLsid);
       break;
     case Global.OPENDOOR:
       handleOpenDoor(data, playerLsid);
       break;
     case Global.DISCARD:
       handleDiscard(data, playerLsid);
       break;
     case Global.TAKEFRONT:
       handleTakeFront(data, playerLsid);
       break;
     case Global.TAKEBACK:
       handleTakeBack(data, playerLsid);
       break;
     case Global.SHOW:
       handleShow(data, playerLsid);
       break;
     case Global.COVER:
       handleCover(data, playerLsid);
       break;
     case Global.EAT:
       handleEat(data, playerLsid);
       break;
     case Global.NEXTROUND:
       handleNextRound(data);
     default:
       System.out.println("ERROR: unknown event=" + event);
   }
 }

 private void handleDrawSeat(Object data, String playerLsid) {
   String dataStr = (String)data;
   System.out.println("handleDrawSeat data=" + dataStr);

   // save to map
   d_userSeatTable.put(playerLsid, dataStr);

   String name = d_userNameTable.get(playerLsid);
   switch(dataStr) {
     case "東":
       d_seaFloor.setEastUserName(name);
       break;
     case "西":
       d_seaFloor.setWestUserName(name);
       break;
     case "南":
       d_seaFloor.setSouthUserName(name);
       break;
     case "北":
       d_seaFloor.setNorthUserName(name);
       break;
     default:
       System.out.println("ERROR: unknown user loginSessionId=" + playerLsid);
   }
 }

 private void handleOpenDoor(Object data, String playerLsid) {
   Long dataInt = (Long)data;
   System.out.println("handleOpenDoor data=" + dataInt);
   d_seaFloor.onUserOpenDoor(d_userSeatTable.get(playerLsid), dataInt);
 }

 private void handleDiscard(Object data, String playerLsid) {
   String dataStr = (String)data;
   System.out.println("handleDiscard dataStr=" + dataStr);
   String out = "<html>";
   for (int i = 0; i < dataStr.length(); ++i) {
     out += dataStr.substring(i, i+1) + ((i == dataStr.length()-1) ? "" : "<br/>");
   }
   out += "</html>";
   d_seaFloor.discardToSeaFloor(out);
 }

 private void handleTakeFront(Object data, String playerLsid) {
   System.out.println("handleTakeFront data=" + data);
   d_seaFloor.onTakeFront();
 }

 private void handleTakeBack(Object data, String playerLsid) {
   System.out.println("handleTakeBack data=" + data);
   d_seaFloor.onTakeBack();
 }

 private void handleShow(Object data, String playerLsid) {
   System.out.println("handleShow data=" + data);
   String dataStr = (String)data;
   String out = "<html>";
   for (int i = 0; i < dataStr.length(); ++i) {
     out += dataStr.substring(i, i+1) + ((i == dataStr.length()-1) ? "" : "<br/>");
   }
   out += "</html>";

   String seat = d_userSeatTable.get(playerLsid);
   switch(seat) {
     case Global.EAST:
       d_eastTiles.showTile(out, 0);
       break;
     case Global.WEST:
       d_westTiles.showTile(out, 0);
       break;
     case Global.SOUTH:
       d_southTiles.showTile(out, 0);
       break;
     case Global.NORTH:
       d_northTiles.showTile(out, 0);
       break;
     default:
       System.out.println("ERROR: unknown user loginSessionId=" + playerLsid);
   }
 }

 private void handleCover(Object data, String playerLsid) {
   System.out.println("handleCover data=" + data.toString());
   String dataStr = (String)data;

   String seat = d_userSeatTable.get(playerLsid);
   switch(seat) {
     case Global.EAST:
       d_eastTiles.coverTile();
       break;
     case Global.WEST:
       d_westTiles.coverTile();
       break;
     case Global.SOUTH:
       d_southTiles.coverTile();
       break;
     case Global.NORTH:
       d_northTiles.coverTile();
       break;
     default:
       System.out.println("ERROR: unknown user loginSessionId=" + playerLsid);
   }
 }

 private void handleEat(Object data, String playerLsid) {
   System.out.println("handleEat data=" + data.toString());
   String eatenTile = d_seaFloor.eatFromSeaFloor();
   String seat = d_userSeatTable.get(playerLsid);
   switch(seat) {
     case Global.EAST:
       d_eastTiles.showTile(eatenTile, 1);
       break;
     case Global.WEST:
       d_westTiles.showTile(eatenTile, 1);
       break;
     case Global.SOUTH:
       d_southTiles.showTile(eatenTile, 1);
       break;
     case Global.NORTH:
       d_northTiles.showTile(eatenTile, 1);
       break;
     default:
       System.out.println("ERROR: unknown user loginSessionId=" + playerLsid);
   }
 }

 private void handleNextRound(Object data) {
   System.out.println("handleNextRound");
   getContentPane().removeAll();

   d_northTiles = new UserTiles(Global.HORIZONTAL);
   d_southTiles = new UserTiles(Global.HORIZONTAL);
   d_westTiles  = new UserTiles(Global.VERTICAL);
   d_eastTiles  = new UserTiles(Global.VERTICAL);
   d_seaFloor  = new SeaFloor();
   add(d_northTiles, BorderLayout.NORTH);
   add(d_southTiles, BorderLayout.SOUTH);
   add(d_westTiles,  BorderLayout.WEST);
   add(d_eastTiles,  BorderLayout.EAST);
   add(d_seaFloor,   BorderLayout.CENTER);

   for ( String playerLsid : d_userNameTable.keySet() ) {
     try {
       String name = d_userNameTable.get(playerLsid);
       String seat = d_userSeatTable.get(playerLsid);
       switch(seat) {
         case "東":
           d_seaFloor.setEastUserName(name);
           break;
         case "西":
           d_seaFloor.setWestUserName(name);
           break;
         case "南":
           d_seaFloor.setSouthUserName(name);
           break;
         case "北":
           d_seaFloor.setNorthUserName(name);
           break;
         default:
           System.out.println("ERROR: unknown user loginSessionId=" + playerLsid);
       }
     } catch (Exception e) {
       System.out.println("ERROR: failed to reinsert user name for '" + playerLsid + "'");
     }
   }
 }
 // private void addListeners() {
 //   this.addWindowListener(new WindowAdaptor());
 // }


 // data members
 private Board d_board;
 private String d_boardSid;
 private HashMap<String, String> d_userNameTable;
 private HashMap<String, String> d_userSeatTable;

 private UserTiles d_northTiles;
 private UserTiles d_westTiles;
 private UserTiles d_eastTiles;
 private UserTiles d_southTiles;
 private SeaFloor  d_seaFloor;

 private EventWindow d_eventWindow;
}
