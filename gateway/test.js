const http = require('http');

var serverIP = "127.0.0.1";
var serverPort = 8080;
var clientIP = "127.0.0.1";
var clientPort = 80;

var postData = JSON.stringify({
  'user' : {
    'ip': clientIP,
    'port': clientPort
  }
});

var options = {
  hostname: serverIP,
  port: serverPort,
  path: '/reg',
  method: 'PUT', // 'POST'
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length
  }
};

var req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
    http.createServer(function(request, response) {
      // handle error for request stream
      request.on('error', function(err) {
        console.log(err);
        response.statusCode = 400;
        response.end();
      });

      // handle error for response stream
      response.on('error', function(err) {
        console.log(err);
      });

      // process request
      if (request.method === 'GET' && request.url === '/echo')
      {
        request.pipe(response);
      }
      else if (request.method === "PUT")
      {
        var body = [];
        request
          .on('data', function(chunk) {
            // aggregate data into 'body' before receiving 'end' signal
            body.push(chunk);
          })
          .on('end', function() {
            body = JSON.parse(Buffer.concat(body).toString());
            console.log(`Received message body=${JSON.stringify(body, null ,2)}`);
            response.end();
          }.bind(this))
      }
      else
      {
        response.statusCode = 404;
        response.end();
      }
    }.bind(this)).listen(80, "127.0.0.1");
  })
});

req.on('error', (e) => {
  console.log(`problem with request: ${e.message}`);
});

// write data to request body
req.write(postData);
req.end();
