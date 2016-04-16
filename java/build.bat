javac -encoding utf-8 -cp .;./json-simple-1.1.1.jar Gateway.java

javac -encoding utf-8 -cp .;./json-simple-1.1.1.jar Global.java
javac -encoding utf-8 -cp .;./json-simple-1.1.1.jar EqualGridLayout.java
javac -encoding utf-8 -cp .;./json-simple-1.1.1.jar Board.java
javac -encoding utf-8 -cp .;./json-simple-1.1.1.jar Row.java
javac -encoding utf-8 -cp .;./json-simple-1.1.1.jar UserTiles.java
javac -encoding utf-8 -cp .;./json-simple-1.1.1.jar SeaFloor.java
javac -encoding utf-8 -cp .;./json-simple-1.1.1.jar WaitingWindow.java

javac -encoding utf-8 -cp .;./json-simple-1.1.1.jar BoardGUI.java


jar cfm ShengMahjong.jar manifest.mf ./*.class