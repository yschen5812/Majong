import javax.swing.*;
import java.awt.*;

public class UserTiles extends JPanel {

  public static void main(String[] args) {

  }

  private static int ROWS_ALINE = 1; // only show the showned tiles for now

  public UserTiles(int direction) {
    d_shownedTiles = new Row(21, direction);

    if (direction == Global.VERTICAL) {
      setLayout( new GridLayout(1, ROWS_ALINE) );
    } else if (direction == Global.HORIZONTAL) {
      setLayout( new GridLayout(ROWS_ALINE, 1) );
    }

    add(d_shownedTiles);
  }

  public void showTile(String tile, int offset) {
    d_shownedTiles.showTile(tile, offset);
  }

  public void coverTile() {
    d_shownedTiles.coverTile();
  }

  private Row d_shownedTiles;

}
