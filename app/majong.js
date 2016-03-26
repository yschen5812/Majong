const MsgListener = require('../gateway/msglistener.js');
const MsgSender = require('../gateway/msgsender.js');
const RegServer = require('../regserv/regserver.js');
const Logger = require('../util/logger.js');

var logger;
const logLevel = 'debug';

function Majong () {
  logger = new Logger(logLevel, this);

  this.d_msgListener = new MsgListener(logLevel);
  this.d_msgSender = new MsgSender(logLevel);
  this.d_regServer = new RegServer(logLevel);

  this.d_msgListener.registerEvent('put_reg');
  this.d_msgListener
    .on('put_reg',
        this.d_regServer.register.bind(this.d_regServer, this.onRegisterResponse.bind(this)));

  this.d_msgListener.startServer();
};

Majong.prototype.onRegisterResponse = function (response) {
  logger.debug(JSON.stringify(response));
  var user = response.user;
  this.d_msgSender.send(user, response);
};



var test = new Majong();
