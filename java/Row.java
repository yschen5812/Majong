import javax.swing.*;
import java.awt.*;
import java.util.*;

public class Row extends JPanel {

  public static void main(String[] args) {

  }


  public Row(int numTiles, int direction) {
    d_currIndex = 0;
    d_usedGrids = new ArrayList<JButton>();

    if (direction == Global.HORIZONTAL) {
      setLayout(new GridLayout(1, numTiles));
    } else if (direction == Global.VERTICAL){
      setLayout(new GridLayout(numTiles, 1));
    }

    for (int i = 0; i < numTiles; ++i) {
      JButton btn = new JButton(); // new JButton("<html>哈<br/>哈</html>")
      // set all buttons to transparent
      btn.setOpaque(false);
      btn.setContentAreaFilled(false);
      btn.setBorderPainted(false);
      if (direction == Global.HORIZONTAL) {
        btn.setMargin(new Insets(0,5,0,5)); // use the largest space
        btn.setFont(new Font("標楷體", Font.PLAIN, 20));
      } else {
        btn.setFont(new Font("標楷體", Font.PLAIN, 20));
      }
      add(btn);
      d_usedGrids.add(btn);
    }
  }

  public void showTile(String tile, int offset) {
    JButton btn = null;
    if (offset > 0) {
      btn = d_usedGrids.get(d_currIndex+1);
    } else {
      do {
        btn = d_usedGrids.get(d_currIndex++);
      } while (!btn.getText().equals(""));
    }
    btn.setText(tile);
    btn.setOpaque(true);
    btn.setContentAreaFilled(true);
    btn.setBorderPainted(true);
  }

  public void coverTile() {
    JButton btn = d_usedGrids.get(d_currIndex++);
    btn.setOpaque(true);
    btn.setContentAreaFilled(true);
    btn.setBorderPainted(true);
    btn.setBackground(Color.GREEN.darker());
  }

  private int d_currIndex;
  private java.util.List<JButton> d_usedGrids;
}
