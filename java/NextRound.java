import javax.swing.*;
import java.awt.*;
import java.util.*;
import java.util.UUID;
import java.util.concurrent.*;
import java.text.*;
import javax.swing.text.DefaultCaret;
import java.awt.event.*;
import org.json.simple.parser.JSONParser;
import org.json.simple.*;

public class NextRound extends JFrame implements ActionListener {

  public static void main(String[] args) {
    NextRound app = new NextRound();
  }


 // Constructor
  NextRound() {
    super( "進行下一圈" );
    setSize( Global.EVENTWINDOWWIDTH, Global.EVENTWINDOWHEIGHT );
    setDefaultCloseOperation( JFrame.EXIT_ON_CLOSE );
    setLocation();
    setLayout( new GridLayout(0, 1) );

    add(new JLabel("輸入想進入下一圈的牌桌名 (不支援中文字):"));

    d_boardId = new JTextField();
    add(d_boardId);

    JButton submitBtn = new JButton("確定");
    submitBtn.addActionListener(this);
    add(submitBtn);

    setVisible(true);
  }

  public void actionPerformed(ActionEvent evt) {
    JSONObject request = new JSONObject();
    request.put("boardId", d_boardId.getText().trim());
    JSONObject json = Gateway.send("nextround", request);
    System.out.println(json.toString());
    Object rc = json.get("success");
    if (rc == null) {
      System.out.println("ERROR: not success!!");
    }
  }

  private void setLocation() {
    Dimension dim = Toolkit.getDefaultToolkit().getScreenSize();
    super.setLocation(dim.width/2-super.getSize().width/2, dim.height/2-super.getSize().height/2);
  }

  private JTextField d_boardId;
}
