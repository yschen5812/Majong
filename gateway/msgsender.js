const http = require('http');
const util = require('util');
const Emitter = require('events');
const Logger = require('../util/logger.js');

var logger;

function MsgSender(logLevel) {
  Emitter.call(this);
  logger = new Logger(logLevel, this);
}
util.inherits(MsgSender, Emitter);


MsgSender.prototype.send = function (user, data) {
  var postData = JSON.stringify({
    loginSessionId: data.loginSessionId
  });

  var options = {
    hostname: user.ip,
    port: user.port,
    path: '/regresponse',
    method: 'PUT', // 'POST'
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  var request = http.request(options, (response) => {
    logger.debug(`STATUS: ${response.statusCode}`);
    logger.debug(`HEADERS: ${JSON.stringify(response.headers)}`);
    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      logger.debug(`BODY: ${chunk}`);
    });
    response.on('end', () => {
      logger.debug('No more data in response.')
    })
  });

  request.on('error', (e) => {
    logger.error(`problem with request: ${e.message}`);
  });

  // write data to request body
  request.write(postData);
  request.end();
}


module.exports = MsgSender;
