const Emitter = require('events');
const util = require('util');
const Logger = require('../util/logger.js');
const Guid = require('../util/guid.js');
const global = require('../global.js');

var logger;

function getRandomArbitrary (min, max) {
  return Math.floor(Math.random() * (max - min) + min);
};

function Board (logLevel) {
  Emitter.call(this);
  logger = new Logger(logLevel, this);

  this.d_users = {}; // loginSessionId : { loginSessionId: String, name: String }
  this.d_tiles = this.shuffle(this.getTiles());

  this.d_seaFloor = []; // the tiles in the order of users discard
  this.d_latestSeaFloorTile = null;

  this.d_remainingSeats = ['東', '南', '西', '北']; // should be empty after all users pick up
  this.d_seatTable = {}; // { loginSessionId: '東' }
}
util.inherits(Board, Emitter);


Board.prototype.addUserToBoard = function (user) {
  if (Object.keys(this.d_users).length >= global.maxBoardPlayers) {
    logger.error(`${this.d_boardId} reached the user number limit.`);
    return false;
  }

  if (user.loginSessionId in this.d_users) {
    logger.error(`${user} is already in the board.`);
    return false;
  }
  logger.debug(`addUserToBoard user=${JSON.stringify(user, null, 2)}`);
  this.d_users[user.loginSessionId] = user;
  return true;
};

Board.prototype.removerUserFromBoard = function (user) {
};

Board.prototype.nextround = function () {
  this.d_tiles = this.shuffle(this.getTiles());

  this.d_seaFloor = []; // the tiles in the order of users discard
  this.d_latestSeaFloorTile = null;
  return true;
};

Board.prototype.assignSeatToUser = function (loginSessionId, seat) {
  this.d_seatTable[loginSessionId] = seat;
};

Board.prototype.users = function () {
  return this.d_users;
};

Board.prototype.numOfUser = function () {
  return Object.keys(this.d_users).length;
};

Board.prototype.hasUser = function (loginSessionId) {
  return (loginSessionId in this.d_users);
};

Board.prototype.threeDicesSum = function () {
  var dice1 = getRandomArbitrary(1, 7);
  var dice2 = getRandomArbitrary(1, 7);
  var dice3 = getRandomArbitrary(1, 7);
  return dice1 + dice2 + dice3;
};

/*
  Special functions for events
*/
Board.prototype.drawseat = function (loginSessionId) {
  var num = this.d_remainingSeats.length;
  if (num > 0) {
    var randIdx = getRandomArbitrary(0, num);
    this.assignSeatToUser(loginSessionId, this.d_remainingSeats[randIdx]);
    return this.d_remainingSeats.splice(randIdx, 1)[0];
  }
  return null;
};

Board.prototype.opendoor = function () {
  return this.threeDicesSum();
};

Board.prototype.discard = function (tile) {
  this.d_latestSeaFloorTile = tile;
  this.d_seaFloor.push(tile);
}

Board.prototype.takefront = function () {
  return this.d_tiles.shift();
};

Board.prototype.takeback = function () {
  return this.d_tiles.pop();
};

Board.prototype.eat = function () {
  var tile = this.d_latestSeaFloorTile;
  this.d_latestSeaFloorTile = null;
  return tile;
};
/*******************************/



Board.prototype.getTiles = function () {
  var flowers = ['ts', 'sa', 'ch', 'dn', 'me', 'ln', 'jw', 'ju'];

  var word = ['bf', 'nf', 'df', 'xf', 'jn', 'fa', 'bb'];
  word = word.concat(word, word, word);

  var ti = [], tn = [], wn = [];
  for (var i = 1; i <= 9; ++i) {
    for (var j = 1; j <= 4; ++j) {
      ti.push("ti"+i.toString());
      tn.push("tn"+i.toString());
      wn.push("wn"+i.toString());
    }
  }

  var tiles = flowers.concat(word, ti, tn, wn);
  return tiles;
};

Board.prototype.shuffle = function (tiles) {
  var shuffled = [];
  while (shuffled.length < 144) {
    var randIdx = getRandomArbitrary(0, tiles.length);
    shuffled.push(tiles[randIdx]);
    tiles.splice(randIdx, 1);
  }
  return shuffled;
};



module.exports = Board;
