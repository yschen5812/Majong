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

  this.d_users = []; // loginSessionId list
  this.d_tiles = this.shuffle(this.getTiles());

  this.d_seaFloor = []; // the tiles in the order of users discard
  this.d_latestSeaFloorTile = null;
}
util.inherits(Board, Emitter);


Board.prototype.addUserToBoard = function (user) {
  if (this.d_users.length >= global.maxBoardPlayers) {
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
  // if (this.d_numUsers <= 0) {
  //   logger.error(`no user in this board ${this.d_boardId}`);
  //   return false;
  // }
  //
  // if (this.d_users.indexOf(user) === -1) {
  //   logger.error(`${user} not in this board ${this.d_boardId}`);
  //   return false;
  // }
  //
  // var idx = this.d_users.indexOf(user);
  // this.d_users.splice(idx, 1);
  // return true;
};

Board.prototype.users = function () {
  return this.d_users;
};

Board.prototype.numOfUser = function () {
  return this.d_users.length;
};

Board.prototype.hasUser = function (loginSessionId) {
  return this.d_users.indexOf(loginSessionId) !== -1;
};

/*
  Special functions for events
*/
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
  if (this.d_latestSeaFloorTile) {
    var tile = this.d_latestSeaFloorTile;
    this.d_latestSeaFloorTile = null;
    return tile;
  }
};
/*******************************/



Board.prototype.getTiles = function () {
  var flowers = ['ts', 'sa', 'ch', 'tn', 'me', 'ln', 'jw', 'ju'];

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
