const Emitter = require('events');
const util = require('util');
const RegServer = require('../regserv/regserver.js');
const Board = require('./board.js');
const BoardTable = require('./boardtable.js');
const global = require('../global.js');
const Logger = require('../util/logger.js');
const UrlToReadable = require('../util/typeconverter.js');

var logger;
function BoardEventHandler (logLevel) {
  Emitter.call(this);
  logger = new Logger(logLevel, this);

  this.d_regServer = new RegServer(logLevel);
  this.d_boardTable = new BoardTable(logLevel);
};
util.inherits(BoardEventHandler, Emitter);

BoardEventHandler.prototype.subscribe = function (data, response) {
  var boardId = data.boardId;
  this.d_boardTable.subscribeBoard(boardId, function(res) {
      response.write(JSON.stringify(res));
      response.end();
  });
};

BoardEventHandler.prototype.startgame = function (data, response) {
  var boardId = data.boardId;
  var numUsersInBoard = this.d_boardTable.numUsersInBoard(boardId);

  if (numUsersInBoard < global.maxBoardPlayers) {
    // wait until 4 players in board
    // setup callback
    var callbackId = boardId;
    this.d_boardTable.once(callbackId, this.startgame.bind(this, data, response));
  } else if (numUsersInBoard > global.maxBoardPlayers) {
    // response error
    response.write({
      failed: {},
      errmsg: `${boardId} has ${numUsersInBoard} users`
    });
    response.end();
  } else {
    var users = this.d_boardTable.getUsers(boardId).map( function(user) {
      var obj = {
        name: "username",
        url: "url for browser client to connect"
      };
      return obj;
    });
    var respObj = {
      success: users
    };
    response.write(JSON.stringify(respObj));
    response.end();

    this.d_boardTable.lockNumRegisteredBoards(boardId);
  }
};

BoardEventHandler.prototype.requestupdate = function (data, response) {
  var boardId = data.boardId;
  var boardSessionId = data.boardSessionId;
  var res = this.d_boardTable.retrieveUpdates(boardId, boardSessionId);
  logger.debug(`response=${JSON.stringify(res)}`);
  var respObj = {
    success: res
  };
  response.write(JSON.stringify(respObj));
  response.end();

  // board client is ready after all (4) players registered
  this.d_boardTable.setBoardReady(boardId, boardSessionId);
};

BoardEventHandler.prototype.reguser = function (data, response) {
  this.d_regServer.register(data, response);
};

BoardEventHandler.prototype.userjoin = function (data, response) {
  var boardId = data.boardId;
  var loginSessionId = data.loginSessionId;
  this.d_boardTable.addBoardUser(boardId, loginSessionId, function (res) {
    response.write(JSON.stringify(res));
    response.end();
  });
};


BoardEventHandler.prototype.notifySubscribers =
                                function (loginSessionId, boardId, action) {
  var applyIf = function (bid) {
    var boardHasUser = this.d_boardTable.boardHasUser.bind(this.d_boardTable);
    logger.debug(`in applyIf, bid===boardId->${bid===boardId}, boardHasUser=${this.d_boardTable.boardHasUser(boardId, loginSessionId)}`);
    return (bid === boardId) && this.d_boardTable.boardHasUser(boardId, loginSessionId);
  }.bind(this);

  var doFunc = function (subscriber) {
    this.d_boardTable.updateSubscriber(subscriber, {
      player: loginSessionId,
      action: action
    });
    logger.debug(`executed updateSubscriber subscriber=${JSON.stringify(subscriber)}`);
  }.bind(this);

  this.d_boardTable.forEachSubscriberToUpdate(applyIf, doFunc);
};

BoardEventHandler.prototype.process_userStartGame = function (boardId, callback) {
  logger.debug(`process_userStartGame`);
  var boardReady = this.d_boardTable.boardReady(boardId);
  logger.debug(`boardReady=${boardReady}`);
  callback(boardReady);
};

BoardEventHandler.prototype.process_userDrawSeat =
                                function (loginSessionId, boardId, placedUrl) {
  logger.debug(`process_userDrawSeat loginSessionId=${loginSessionId}, boardId=${boardId},` +
               `placedUrl=${placedUrl}`);
  var seat = this.d_boardTable.gameExecute(boardId, {'drawseat': loginSessionId});
  this.notifySubscribers(loginSessionId, boardId, {drawseat: seat});
};

BoardEventHandler.prototype.process_userOpenDoor =
                                function (loginSessionId, boardId, placedUrl) {
  logger.debug(`process_userOpenDoor loginSessionId=${loginSessionId}, boardId=${boardId},` +
               `placedUrl=${placedUrl}`);
  var door = this.d_boardTable.gameExecute(boardId, {'opendoor': {}});
  this.notifySubscribers(loginSessionId, boardId, {opendoor: door});
};

BoardEventHandler.prototype.process_userDiscard =
                                function (loginSessionId, boardId, placedUrl) {
  logger.debug(`process_userDiscard loginSessionId=${loginSessionId}, boardId=${boardId},` +
               `placedUrl=${placedUrl}`);
  this.d_boardTable.gameExecute(boardId, {'discard': placedUrl});
  this.notifySubscribers(loginSessionId, boardId, {discard: UrlToReadable.urlToReadable(placedUrl)});
};

BoardEventHandler.prototype.process_userShow =
                                function (loginSessionId, boardId, placedUrl) {
  logger.debug(`process_userShow loginSessionId=${loginSessionId}, boardId=${boardId},` +
               `placedUrl=${placedUrl}`);
  this.notifySubscribers(loginSessionId, boardId, {show: UrlToReadable.urlToReadable(placedUrl)});
};

BoardEventHandler.prototype.process_userCover =
                                function (loginSessionId, boardId, placedUrl) {
  logger.debug(`process_userCover loginSessionId=${loginSessionId}, boardId=${boardId},` +
               `placedUrl=${placedUrl}`);
  this.notifySubscribers(loginSessionId, boardId, {cover: UrlToReadable.urlToReadable(placedUrl)});
};

BoardEventHandler.prototype.process_userTakeFront =
              function (loginSessionId, boardId, placedUrl, onGetFrontTileCB) {
  logger.debug(`process_userTakeFront loginSessionId=${loginSessionId}, boardId=${boardId},` +
               `placedUrl=${placedUrl}`);

  onGetFrontTileCB(this.d_boardTable.gameExecute(boardId, {'takefront': {}}));
  this.notifySubscribers(loginSessionId, boardId, {takefront: {}});
};

BoardEventHandler.prototype.process_userTakeBack =
               function (loginSessionId, boardId, placedUrl, onGetBackTileCB) {
  logger.debug(`process_userTakeBack loginSessionId=${loginSessionId}, boardId=${boardId},` +
               `placedUrl=${placedUrl}`);

  onGetBackTileCB(this.d_boardTable.gameExecute(boardId, {'takeback': {}}));
  this.notifySubscribers(loginSessionId, boardId, {takeback: {}});
};

BoardEventHandler.prototype.process_userEat =
                                function (loginSessionId, boardId, placedUrl) {
  logger.debug(`process_userEat loginSessionId=${loginSessionId}, boardId=${boardId},` +
               `placedUrl=${placedUrl}`);
  var eatenUrl = this.d_boardTable.gameExecute(boardId, {'eat': {}});
  if (eatenUrl) {
    this.notifySubscribers(loginSessionId, boardId, {eat: {}});
  }
};


module.exports = BoardEventHandler;
