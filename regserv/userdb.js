const Emitter = require('events');
const util = require('util');
const Logger = require('../util/logger.js');

var logger;

function UserDB (logLevel) {
  Emitter.call(this);
  logger = new Logger(logLevel, this);

  this.d_userTable = {};
}
util.inherits(UserDB, Emitter);

UserDB.prototype.addUser = function(loginSessionId, user, responseCB) {
  if (loginSessionId in this.d_userTable) {
    responseCB({
      failed: {},
      errmsg: "User " + loginSessionId + " already registered."
    });
    return;
  }

  this.d_userTable[loginSessionId] = user;
  responseCB({success: {}});
};

UserDB.prototype.removeUser = function(loginSessionId, responseCB) {
  if (loginSessionId in this.d_userTable) {
    delete this.d_userTable[loginSessionId];
    responseCB({success: {}});
    return;
  }

  responseCB({
    failed: {},
    errmsg: "User " + loginSessionId + " not registered."
  })
};


module.exports = UserDB;
