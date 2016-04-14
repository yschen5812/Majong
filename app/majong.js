const MsgListener = require('../gateway/msglistener.js');
const MsgSender = require('../gateway/msgsender.js');
const BrowserServer = require('../browser/browserserver.js');
const BoardEventHandler = require('./boardeventhandler.js');
const Logger = require('../util/logger.js');

var logger;
const logLevel = 'debug';

function Majong () {
  logger = new Logger(logLevel, this);

  this.d_msgListener = new MsgListener(logLevel);
  this.d_msgSender = new MsgSender(logLevel);
  this.d_browserServer = new BrowserServer(logLevel);
  this.d_boardHandler = new BoardEventHandler(logLevel);

  this.d_msgListener.registerEvent('board');
  this.d_msgListener.registerEvent('browser');
  this.d_msgListener
    .on('board',
        this.onBoardEvent.bind(this))
    .on('browser',
        this.onBrowserEvent.bind(this))

  this.d_msgListener.startServer();

  this.d_browserServer
    .on('startgame',
        this.d_boardHandler.process_userStartGame.bind(this.d_boardHandler))
    .on('drawseat',
        this.d_boardHandler.process_userDrawSeat.bind(this.d_boardHandler))
    .on('opendoor',
        this.d_boardHandler.process_userOpenDoor.bind(this.d_boardHandler))
    .on('discard',
        this.d_boardHandler.process_userDiscard.bind(this.d_boardHandler))
    .on('show',
        this.d_boardHandler.process_userShow.bind(this.d_boardHandler))
    .on('cover',
        this.d_boardHandler.process_userCover.bind(this.d_boardHandler))
    .on('takefront',
        this.d_boardHandler.process_userTakeFront.bind(this.d_boardHandler))
    .on('takeback',
        this.d_boardHandler.process_userTakeBack.bind(this.d_boardHandler))
    .on('eat',
        this.d_boardHandler.process_userEat.bind(this.d_boardHandler))
};

Majong.prototype.onRegisterResponse = function (response) {
  logger.debug(`onRegisterResponse ${JSON.stringify(response)}`);
  if (response.failed) {
    logger.error(`register user failed. errmsg=${response.errmsg}`);
    return;
  }

  var user = response.user;
  this.d_msgSender.send(user, response);
};

Majong.prototype.onBrowserEvent = function (data) {
  var eventType = data.event.eventType.substring(8); // after "browser_" prefix
  var eventData = data.event.eventData;
  var response = data.writeResponse;
  logger.debug(`eventType=${eventType}`);
  try {
    this.d_browserServer[eventType](eventData, response);
  } catch (e) {
    logger.error(e);
  }
};

Majong.prototype.onBoardEvent = function (data) {
  var eventType = data.event.eventType.substring(6); // after "board_" prefix
  var eventData = data.event.eventData;
  var response = data.writeResponse;
  logger.debug(`eventType=${eventType}`);
  try {
    this.d_boardHandler[eventType](eventData, response);
  } catch (e) {
    logger.error(e);
  }
};


var test = new Majong();
