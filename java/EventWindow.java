import javax.swing.*;
import java.awt.*;
import java.util.*;
import java.util.UUID;
import java.util.concurrent.*;
import java.text.*;
import javax.swing.text.DefaultCaret;
import org.json.simple.parser.JSONParser;
import org.json.simple.*;

public class EventWindow extends JFrame {

 public static void main(String[] args) {
 }


 // Constructor
 EventWindow(JFrame mainWindow) {
   super( "Events" );
   setSize( Global.EVENTWINDOWWIDTH, Global.EVENTWINDOWHEIGHT );
   setDefaultCloseOperation( JFrame.DO_NOTHING_ON_CLOSE );
   setLocationAccordingTo(mainWindow);
   setLayout( new BorderLayout() );

   d_textArea = new JTextArea();
   d_textArea.setEditable(false);
   JScrollPane scroll = new JScrollPane (d_textArea,
     JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED, JScrollPane.HORIZONTAL_SCROLLBAR_AS_NEEDED);
   add(scroll, BorderLayout.CENTER);

   // set policy to always scroll to buttom
   DefaultCaret caret = (DefaultCaret)d_textArea.getCaret();
   caret.setUpdatePolicy(DefaultCaret.ALWAYS_UPDATE);

   setVisible(true);
 }

 public void addEvent(String playerName, String event) {
   DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
   Date date = Calendar.getInstance().getTime();
   d_textArea.append("\n" + dateFormat.format(date) + "      '" + playerName + "' " + event);
   d_textArea.validate();
 }

 private void setLocationAccordingTo(JFrame mainWindow) {
   Point mainWindowLocation = mainWindow.getLocation();
   Dimension mainWindowSize = mainWindow.getSize();

   super.setLocation(mainWindowLocation.x + mainWindowSize.width, mainWindowLocation.y);
 }

 private JScrollPane d_scrollPanel;
 private JTextArea d_textArea;
}
