import java.util.*;
import org.json.simple.parser.JSONParser;
import org.json.simple.JSONObject;

public class Board {
  private HashMap<String, JSONObject> d_seatTable; // { 'tn': User }

  static public int totalNumTiles = 144;

  private int frontIdx;
  private int backIdx;

  public boolean setSeat(JSONObject user, String seat) {
    JSONObject curr = d_seatTable.putIfAbsent(seat, user);
    return curr != null ? true : false;
  }

  public String getSeatByUser(JSONObject user) {
    Set<String> seats = d_seatTable.keySet();
    Iterator<String> it = seats.iterator();
    while (it.hasNext()) {
      String seat = it.next();
      JSONObject u = d_seatTable.get(seat);
      if (u.get("loginSessionId") == user.get("loginSessionId")) {
        return seat;
      }
    }
    return "";
  }

  public void takefront() {
    frontIdx = nextIdx(frontIdx);
  }

  public void takeback() {
    backIdx = prevIdx(backIdx);
  }

  // getters and setters
  public void setFrontEndIdx(int openDoorIdx) {
    frontIdx = openDoorIdx;
    backIdx = prevIdx(openDoorIdx);
  }

  public int getFrontIdx() {
    return frontIdx;
  }

  public int getBackIdx() {
    return backIdx;
  }

  // helper functions
  public int nextIdx(int currIdx) {
    return currIdx==(totalNumTiles-1) ? 0 : currIdx+1;
  }

  public int prevIdx(int currIdx) {
    return currIdx==0 ? totalNumTiles-1 : currIdx-1;
  }
}
