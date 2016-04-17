javac -encoding utf-8 -cp .;./json-simple-1.1.1.jar Gateway.java

javac -encoding utf-8 -cp .;./json-simple-1.1.1.jar NextRound.java

jar cfm NextRound.jar manifest_nextround.mf Gateway.class NextRound.class