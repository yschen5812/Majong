import javax.swing.*;
import java.awt.*;
import java.util.*;

public class SeaFloor extends JPanel {

  public static void main(String[] args) {

  }


  public SeaFloor() {
    d_seaFloorGrids = new ArrayList<JButton>();
    d_allGrids = new ArrayList<JButton>();
    d_unTakenGrids = new ArrayDeque<JButton>();

    setLayout();
    showAllUntakenTiles();
  }

  // Show the green covered tiles
  public void showAllUntakenTiles() {
    // NORTH
    for (int col = 1; col < Global.SEAFLOORGRIDS_H - 2; ++col) {
      int firstRow = 1;
      JButton btn1;
      btn1 = d_allGrids.get(firstRow*Global.SEAFLOORGRIDS_H + col);

      // show button on [row, firstCol]
      btn1.setOpaque(true);
      btn1.setContentAreaFilled(true);
      btn1.setBorderPainted(true);
      btn1.setBackground(Color.GREEN.darker());

      d_unTakenGrids.addLast(btn1);
    }
    // EAST
    for (int row = 1; row < Global.SEAFLOORGRIDS_V - 2; ++row) {
      int lastCol = Global.SEAFLOORGRIDS_H - 2;
      JButton btn2;
      btn2 = d_allGrids.get(row*Global.SEAFLOORGRIDS_H + lastCol);

      // show button on [row, lastCol]
      btn2.setOpaque(true);
      btn2.setContentAreaFilled(true);
      btn2.setBorderPainted(true);
      btn2.setBackground(Color.GREEN.darker());

      d_unTakenGrids.addLast(btn2);
    }
    // SOUTH
    for (int col = Global.SEAFLOORGRIDS_H - 2; col >= 2; --col) {
      int lastRow = Global.SEAFLOORGRIDS_V - 2;
      JButton btn2;
      btn2 = d_allGrids.get(lastRow*Global.SEAFLOORGRIDS_H + col);

      // show button on [row, lastCol]
      btn2.setOpaque(true);
      btn2.setContentAreaFilled(true);
      btn2.setBorderPainted(true);
      btn2.setBackground(Color.GREEN.darker());

      d_unTakenGrids.addLast(btn2);
    }
    // WEST
    for (int row = Global.SEAFLOORGRIDS_V - 2; row >= 2; -- row) {
      int firstCol = 1;
      JButton btn1;
      btn1 = d_allGrids.get(row*Global.SEAFLOORGRIDS_H + firstCol);

      // show button on [row, firstCol]
      btn1.setOpaque(true);
      btn1.setContentAreaFilled(true);
      btn1.setBorderPainted(true);
      btn1.setBackground(Color.GREEN.darker());

      d_unTakenGrids.addLast(btn1);
    }
  }

  // Generate a list of untaken tiles (with order)
  public void onUserOpenDoor(String userSeat, Long openDoorNumber) {
    System.out.println("onUserOpenDoor userSeat=" + userSeat + ", openDoor=" + openDoorNumber);
    int num = openDoorNumber.intValue();
    int mod = (num % 4 == 0) ? 4 : (num % 4);
    System.out.println("mod=" + mod);
    int offset = 18*(mod-1); // offset from current userSeat orientation
    int startIdx = 0;
    switch(userSeat) {
      case Global.NORTH:
        startIdx = 0;
        break;
      case Global.EAST:
        startIdx = 18;
        break;
      case Global.SOUTH:
        startIdx = 36;
        break;
      case Global.WEST:
        startIdx = 54;
        break;
    }

    int absoluteStartIdx = (startIdx + offset + num) % 72;
    for (int i = 0; i < absoluteStartIdx; ++i) {
      d_unTakenGrids.addLast(d_unTakenGrids.removeFirst());
    }
  }

  public void onTakeFront() {
    // ++d_takenCount;

    JButton btn = d_unTakenGrids.getFirst();
    if (btn.getBackground().equals(Color.GREEN.darker())) {
      btn.setBackground(Color.GREEN);
    } else if (btn.getBackground().equals(Color.GREEN)) {
      d_unTakenGrids.removeFirst();
      btn.setOpaque(false);
      btn.setContentAreaFilled(false);
      btn.setBorderPainted(false);
    }
    // if (d_takenCount % 2 == 1) {
    //   btn.setBackground(Color.GREEN);
    // } else {
    //   d_unTakenGrids.removeFirst();
    //   btn.setOpaque(false);
    //   btn.setContentAreaFilled(false);
    //   btn.setBorderPainted(false);
    // }
  }

  public void onTakeBack() {
    // ++d_takenCount;

    JButton btn = d_unTakenGrids.getLast();
    if (btn.getBackground().equals(Color.GREEN.darker())) {
      btn.setBackground(Color.GREEN);
    } else if (btn.getBackground().equals(Color.GREEN)) {
      d_unTakenGrids.removeLast();
      btn.setOpaque(false);
      btn.setContentAreaFilled(false);
      btn.setBorderPainted(false);
    }
    // if (d_takenCount % 2 == 1) {
    //   btn.setBackground(Color.GREEN);
    // } else {
    //   d_unTakenGrids.removeFirst();
    //   btn.setOpaque(false);
    //   btn.setContentAreaFilled(false);
    //   btn.setBorderPainted(false);
    // }
  }

  public void discardToSeaFloor(String tile) {
    JButton btn = null;
    do {
      int rand = (new Random()).nextInt(d_seaFloorGrids.size());
      btn = d_seaFloorGrids.get(rand);
    } while (!btn.getText().isEmpty());

    btn.setText(tile);
    btn.setOpaque(true);
    btn.setContentAreaFilled(true);
    btn.setBorderPainted(true);
    btn.setMargin(new Insets(0,0,0,0)); // use the largest space
    btn.setFont(new Font("標楷體", Font.PLAIN, 20));
    btn.setBackground(new Color(50, 0, 0, 100));

    if (d_prevDiscarded != null) {
      d_prevDiscarded.setBackground(new JButton().getBackground());
    }
    d_prevDiscarded = btn;
  }

  public String eatFromSeaFloor() {
    if (d_prevDiscarded == null) {
      System.out.println("ERROR: no previous discarded tile");
      return null;
    }

    JButton btn = d_prevDiscarded;
    String data = btn.getText();
    btn.setText("");
    btn.setOpaque(false);
    btn.setContentAreaFilled(false);
    btn.setBorderPainted(false);

    return data;
  }

  public void setEastUserName(String name) {
    System.out.println("setEastUserName name=" + name);
    JButton btn = d_allGrids.get((int)(Global.SEAFLOORGRIDS_V/2)*Global.SEAFLOORGRIDS_H + (Global.SEAFLOORGRIDS_H-1));
    btn.setText(name);
    // btn.setOpaque(true);
    // btn.setContentAreaFilled(true);
    // btn.setBorderPainted(true);
    btn.setMargin(new Insets(0,0,0,0)); // use the largest space
    btn.setFont(new Font("Default", Font.PLAIN, 20));
  }

  public void setWestUserName(String name) {
    System.out.println("setWestUserName name=" + name);
    JButton btn = d_allGrids.get((int)(Global.SEAFLOORGRIDS_V/2)*Global.SEAFLOORGRIDS_H + 0);
    btn.setText(name);
    // btn.setOpaque(true);
    // btn.setContentAreaFilled(true);
    // btn.setBorderPainted(true);
    btn.setMargin(new Insets(0,0,0,0)); // use the largest space
    btn.setFont(new Font("Default", Font.PLAIN, 20));
  }

  public void setNorthUserName(String name) {
    System.out.println("setNorthUserName name=" + name);
    JButton btn = d_allGrids.get(0*Global.SEAFLOORGRIDS_H + (int)(Global.SEAFLOORGRIDS_H/2));
    btn.setText(name);
    // btn.setOpaque(false);
    // btn.setContentAreaFilled(false);
    // btn.setBorderPainted(false);
    btn.setMargin(new Insets(0,0,0,0)); // use the largest space
    btn.setFont(new Font("Default", Font.PLAIN, 20));
  }

  public void setSouthUserName(String name) {
    System.out.println("setSouthUserName name=" + name);
    JButton btn = d_allGrids.get((Global.SEAFLOORGRIDS_V-1)*Global.SEAFLOORGRIDS_H + (int)(Global.SEAFLOORGRIDS_H/2));
    btn.setText(name);
    // btn.setOpaque(true);
    // btn.setContentAreaFilled(true);
    // btn.setBorderPainted(true);
    btn.setMargin(new Insets(0,0,0,0)); // use the largest space
    btn.setFont(new Font("Default", Font.PLAIN, 20));
  }


  private void setLayout() {
    super.setLayout(new GridBagLayout());
    for (int row = 0; row < Global.SEAFLOORGRIDS_V; ++row) {
      for (int col = 0; col < Global.SEAFLOORGRIDS_H; ++col) {
        JButton btn = new JButton();
        // set all buttons to transparent
        btn.setOpaque(false);
        btn.setContentAreaFilled(false);
        btn.setBorderPainted(false);

        addComponent(btn, col, row, 1, 1, GridBagConstraints.CENTER, GridBagConstraints.BOTH);

        if ( col >= Global.SEAFLOORMARGIN_H && col < Global.SEAFLOORGRIDS_H-Global.SEAFLOORMARGIN_H
          && row >= Global.SEAFLOORMARGIN_V && row < Global.SEAFLOORGRIDS_V-Global.SEAFLOORMARGIN_V) {
          // those are the sea floor buttons
          d_seaFloorGrids.add(btn);
        }

        d_allGrids.add(btn);
      }
    }
  }

  private void addComponent(Component component, int gridx, int gridy,
                                   int gridwidth, int gridheight, int anchor, int fill) {
    Insets insets = new Insets(2,2,2,2);
    GridBagConstraints gbc =
      new GridBagConstraints(gridx, gridy, gridwidth, gridheight, 1.0, 1.0,
                             anchor, fill, insets, 0, 0);
    add(component, gbc);
  }

  private String getNextUserSeat(String userSeat) {
    switch(userSeat) {
      case Global.EAST:
        return Global.NORTH;
      case Global.SOUTH:
        return Global.EAST;
      case Global.WEST:
        return Global.SOUTH;
      case Global.NORTH:
        return Global.WEST;
      default:
        System.out.println("ERROR: unknown seat=" + userSeat);
        return null;
    }
  }

  private java.util.List<JButton>  d_seaFloorGrids;
  private java.util.Deque<JButton> d_unTakenGrids;
  private java.util.List<JButton>  d_allGrids;
  private JButton d_prevDiscarded;
  private int d_takenCount = 0;
}
