import javax.swing.*;
import java.awt.*;
import java.util.*;

public class WaitingWindow extends JDialog {
  public static void main(String[] args) {

  }

  // Constructor
  WaitingWindow(JFrame parent) {
    super(parent);
    setUndecorated(true);
    getRootPane().setWindowDecorationStyle(JRootPane.NONE);
    // setModal(true);
    setLocationRelativeTo(parent);
    setLayout( new GridLayout(1,1) );

    int this_w = 650;
    int this_h = 200;
    setSize(this_w, this_h);
    setDefaultCloseOperation( JDialog.DO_NOTHING_ON_CLOSE );

    Rectangle r = parent.getBounds();
    int h = r.height;
    int w = r.width;

    Point location = parent.getLocation();
    int this_location_x = location.x + w/2 - this_w/2;
    int this_location_y = location.y + h/2 - this_h/2;

    setLocation(this_location_x, this_location_y);

    JTextField text = new JTextField("湊咖中, 請勿關閉視窗...");
    text.setOpaque(false);
    text.setFont(new Font("SansSerif", Font.BOLD, 55));
    text.setEditable(false);
    text.setBorder(BorderFactory.createEmptyBorder());
    add(text);

    setVisible(true);
  }

  public void hideWindow() {
    setVisible(false);
  }
}
