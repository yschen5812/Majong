const Emitter = require('events');
const util = require('util');
const UserDB = require('./userdb.js');
const Guid = require('../util/guid.js');
const Logger = require('../util/logger.js');

var logger;

function RegServer (logLevel) {
  Emitter.call(this);
  logger = new Logger(logLevel, this);

  this.d_userDB = new UserDB(logLevel);
};
util.inherits(RegServer, Emitter);


RegServer.prototype.register = function (responseCB, data) {
  var loginSessionId = Guid.genRandString(15);
  logger.info(`register user=${JSON.stringify(data.user, null, 2)}`);
  this.d_userDB.addUser(loginSessionId, data.user, function(response) {
    if (response.success) {
      responseCB({
        user: data.user,
        loginSessionId: loginSessionId
      });
    } else {
      responseCB(response);
    }
  });
};

RegServer.prototype.deregister = function (responseCB, loginSessionId) {
  this.d_userDB.removeUser(loginSessionId, function(response) {
    responseCB(response);
  });
};

module.exports = RegServer;
