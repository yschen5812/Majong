const Emitter = require('events');
const util = require('util');
const Guid = require('../util/guid.js');
const Board = require('./board.js');
const global = require('../global.js');
const Logger = require('../util/logger.js');

var logger;

function BoardTable (logLevel) {
  Emitter.call(this);
  logger = new Logger(logLevel, this);

  this.d_logLevel = logLevel;

  /* this.d_updateTable Structure
   *  {
   *    boardId: {
   *      subscribers: [ { boardSessionId: [updates since last query] }, ],
   *      board: Board Object
   *    }
   *  }
   */
  this.d_updateTable = {};
}
util.inherits(BoardTable, Emitter);

BoardTable.prototype.subscribeBoard = function (boardId, responseCB) {
  var boardSessionId = "testbsid";//Guid.genRandString(5);

  if (!(boardId in this.d_updateTable)) {
    this.d_updateTable[boardId] = {
      subscribers: [],
      board      : new Board(this.d_logLevel)
    };
  }

  // initialize the session with an empty array
  var subscriberRecord = {};
  subscriberRecord[boardSessionId] = [];
  this.d_updateTable[boardId].subscribers.push(subscriberRecord);

  responseCB({
    boardSessionId : boardSessionId
  });
};

BoardTable.prototype.addBoardUser = function (boardId, loginSessionId, responseCB) {
  if (!(boardId in this.d_updateTable)) {
    responseCB({
      failed: {},
      errmsg: `board ${boardId} not exist`
    })
    return;
  }

  var board = this.d_updateTable[boardId].board;
  board.addUserToBoard(loginSessionId);
  if (board.numOfUser() === global.maxBoardPlayers) {
    logger.debug(`fire ${boardId} event in boardTable`);
    this.emit(boardId);
  }
  responseCB({success: `${board.numOfUser()} users in board ${boardId}`});
};

BoardTable.prototype.removeBoardUser = function (boardId, loginSessionId, responseCB) {

};

BoardTable.prototype.retrieveUpdates = function (boardId, boardSessionId) {
  var subscriber = this.d_updateTable[boardId].subscribers
                    .filter( function(obj) {
                      logger.debug(`filtering... current subscriber=${JSON.stringify(obj)}`);
                      return obj.hasOwnProperty(boardSessionId);
                    })

  logger.debug(`boardId=${boardId}, boardSessionId=${boardSessionId}, ` +
               `d_updateTable=${JSON.stringify(this.d_updateTable)}`);

  if (subscriber.length > 1 || subscriber.length < 1) {
    logger.error(`subscriber length=${subscriber.length}, should be 1`);
    return {};
  }

  var records = subscriber[0][boardSessionId];
  // empty the records for this subscriber
  subscriber[0][boardSessionId] = [];
  return records;
};

BoardTable.prototype.getUsers = function (boardId) {
  return this.d_updateTable[boardId].board.users();
};

BoardTable.prototype.numUsersInBoard = function (boardId) {
  return this.d_updateTable[boardId].board.numOfUser();
};

BoardTable.prototype.boardHasUser = function (boardId, loginSessionId) {
  logger.debug(`in boardHasUser, boardId=${boardId}, loginSessionId=${loginSessionId}, ` +
               `d_updateTable=${JSON.stringify(this.d_updateTable)}`);
  return this.d_updateTable[boardId].board.hasUser(loginSessionId);
};

BoardTable.prototype.forEachSubscriberToUpdate = function (applyIf, doFunc) {
  var boardIds = Object.keys(this.d_updateTable);
  boardIds
    .filter( function (boardId) {
      if (applyIf) {
        return applyIf(boardId);
      } else {
        return true;
      }
    })
    .forEach ( function (boardId) {
      var subscribers = this.d_updateTable[boardId].subscribers;
      subscribers.forEach( function (subscriber) {
        doFunc(subscriber);
      });
    }.bind(this))
};

BoardTable.prototype.updateSubscriber = function (subscriber, updateInfo) {
  var boardSessionId = Object.keys(subscriber)[0]; // the only one key is bsid
  subscriber[boardSessionId].push(updateInfo);
};

BoardTable.prototype.gameExecute = function (boardId, command) {
  logger.debug(`in gameExecute: boardId=${boardId}, command=${JSON.stringify(command)}`);
  var action = Object.keys(command)[0];
  return this.d_updateTable[boardId].board[action](command[action]);
}

module.exports = BoardTable;
