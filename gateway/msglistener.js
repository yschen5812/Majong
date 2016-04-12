const http = require('http');
const util = require('util');
const queryStirng = require('querystring');
const Emitter = require('events');
const Logger = require('../util/logger.js');
const global = require('../global.js');

var logger;

function MsgListener (logLevel) {
  Emitter.call(this);
  logger = new Logger(logLevel, this);
};
util.inherits(MsgListener, Emitter);

MsgListener.prototype.d_events = [];

MsgListener.prototype.startServer = function () {
  http.createServer(function(request, response) {
    // handle error for request stream
    request.on('error', function(err) {
      logger.error(err);
      response.statusCode = 400;
      response.end();
    });

    // handle error for response stream
    response.on('error', function(err) {
      logger.error(err);
    });


    logger.debug(`Got request from url=${request.url}`);

    // process request
    if (request.url.startsWith('/browser'))
    {
      // request from browser, parse the command
      var cmd = request.url.substring(1, request.url.indexOf('&'));
      var body = request.url.substring(request.url.indexOf('&') + 1);
      body = queryStirng.parse(body);

      logger.debug(`parsed body=${queryStirng.stringify(body)}`);

      this.dispatchEvent('browser', {event: {eventType: cmd, eventData: body}, writeResponse: response});
    }
    else if (request.url.startsWith('/board'))
    {
      var body = [];
      request
        .on('data', function(chunk) {
          // aggregate data into 'body' before receiving 'end' signal
          body.push(chunk);
        })
        .on('end', function() {
          body = JSON.parse(Buffer.concat(body).toString());

          var cmd = request.url.substr(1);
          this.dispatchEvent('board', {event: {eventType: cmd, eventData: body}, writeResponse: response});
        }.bind(this))
    }
    else
    {
      response.statusCode = 404;
      response.end();
    }
  }.bind(this)).listen(global.privatePort, global.privateIp);
};

MsgListener.prototype.dispatchEvent = function (fn, payload) {
  try {
    logger.debug(`fn=${fn}, data=${JSON.stringify(payload, null, 2)}`);
  } catch (e) {

  }

  if (this.d_events.indexOf(fn) !== -1)
  {
    this.emit(fn, payload);
  }
  else
  {
    logger.error(`${fn} is not registered with this listener.`);
  }
};

MsgListener.prototype.registerEvent = function(event) {
  if (this.d_events.indexOf(event) === -1)
  {
    this.d_events.push(event);
  }
  else
  {
    logger.error(`event ${event} is registered.`);
  }
}

module.exports = MsgListener;

/************TEST***********/
// var test = new MsgListener();
// test.registerEvent('put_echo');
// test.on('put_echo', function() {
//   logger.log("successfully get response!");
// })
// test.startServer();
