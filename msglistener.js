const http = require('http');
const util = require('util');
const queryStirng = require('querystring');
const Emitter = require('events');
const Logger = require('../util/logger.js');

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

    // process request
    if (request.url.startsWith('/put'))//(request.method === "PUT")
    {
      logger.debug(`Got request from url=${request.url}`);
      if (request.url.indexOf('&') !== -1)
      {
        // request from browser, parse the command
        var fn = request.url.substring(1, request.url.indexOf('&'));
        var body = request.url.substring(request.url.indexOf('&') + 1);
        body = queryStirng.parse(body);
        this.dispatchEvent(fn, body);
        response.write("<html>");
        response.write("<head>");
        response.write("<meta HTTP-EQUIV='Content-Type' CONTENT='text/html; charset=UTF-8'");
        response.write("</head>");
        response.write("<body>");
        response.write("<button>一條</button> <button>一條</button> <button>三條</button> <button>四條</button> <button>五條</button> <button>六筒</button> <button>七筒</button> <button>八筒</button> <button>九萬</button> <button>九萬</button> <button>九萬</button> <button>北風</button> <button>北風</button> <button>北風</button>");
        response.write("</body>");
        response.write("</html>");
        response.end();
      }
      else
      {
        var body = [];
        request
          .on('data', function(chunk) {
            // aggregate data into 'body' before receiving 'end' signal
            body.push(chunk);
          })
          .on('end', function() {
            body = JSON.parse(Buffer.concat(body).toString());
            logger.debug(`Received message body=${JSON.stringify(body, null ,2)}`);

            var fn = request.url.substr(1);
            this.dispatchEvent(fn, body);
            response.end();
          }.bind(this))
      }
    }
    else
    {
      response.statusCode = 404;
      response.end();
    }
  }.bind(this)).listen(8080, "127.0.0.1");
};

MsgListener.prototype.dispatchEvent = function (fn, data) {
  logger.debug(`fn=${fn}, data=${JSON.stringify(data, null, 2)}`);
  if (this.d_events.indexOf(fn) !== -1)
  {
    this.emit(fn, data);
  }
  else
  {
    logger.log(`${fn} is not registered with this listener.`);
  }
};

MsgListener.prototype.registerEvent = function(event) {
  if (this.d_events.indexOf(event) === -1)
  {
    this.d_events.push(event);
  }
  else
  {
    logger.log("event '", event, "' is registered.");
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
