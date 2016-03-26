const Emitter = require('events');
const util = require('util');
const Logger = require('../util/logger.js');

var logger;

function BoardTable (logLevel) {
  Emitter.call(this);
  logger = new Logger(logLevel, this);

  this.d_clientTable = {};
}
util.inherits(BoardTable, Emitter);

BoardTable.prototype.addBoardClient = function(loginSessionId, BoardClient, responseCB) {
  if (loginSessionId in this.d_clientTable) {
    responseCB({
      failed: {},
      errmsg: `Client ${loginSessionId} already registered.`
    });
    return;
  }

  this.d_BoardClientTable[loginSessionId] = BoardClient;
  responseCB({success: {}});
};

BoardTable.prototype.removeBoardClient = function(loginSessionId, responseCB) {
  if (loginSessionId in this.d_clientTable) {
    delete this.d_clientTable[loginSessionId];
    responseCB({success: {}});
    return;
  }

  responseCB({
    failed: {},
    errmsg: `Client ${loginSessionId} not registered.`
  })
};


module.exports = BoardTable;
