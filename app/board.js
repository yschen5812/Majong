const Emitter = require('events');
const util = require('util');
const Logger = require('../util/logger.js');
const Guid = require('../util/guid.js');
const global = require('../global.js');

var logger;

function Board (logLevel, name) {
  Emitter.call(this);
  logger = new Logger(logLevel, this);

  this.d_users = [];
  this.d_numUsers = 0;
  this.d_boardName = name;
  this.d_boardId = "board-" + name + new Date().getTime().toString();
}
util.inherits(Board, Emitter);

Board.prototype.addUserToBoard = function (user) {
  if (this.d_numUsers >= global.maxBoardPlayers) {
    logger.error(`${this.d_boardId} reached the user number limit.`);
    return false;
  }

  if (this.d_users.indexOf(user) !== -1) {
    logger.error(`${user} is already in the board.`);
    return false;
  }

  this.d_users.push(user);
  return true;
};

Board.prototype.removerUserFromBoard = function (user) {
  if (this.d_numUsers <= 0) {
    logger.error()`no user in this board ${this.d_boardId}`);
    return false;
  }

  if (this.d_users.indexOf(user) === -1) {
    logger.error(`${user} not in this board ${this.d_boardId}`);
    return false;
  }

  var idx = this.d_users.indexOf(user);
  this.d_users.splice(idx, 1);
  return true;
}


module.exports = Board;
