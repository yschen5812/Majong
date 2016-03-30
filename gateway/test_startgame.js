const http = require('http');

var serverIP = "127.0.0.1";
var serverPort = 8080;
var clientIP = "127.0.0.1";
var clientPort = 80;

// var postData = JSON.stringify({
//   'userip': clientIP,
//   'userport': clientPort
// });

var postData = JSON.stringify({
  'boardId': 'testboard'
});

var options = {
  hostname: serverIP,
  port: serverPort,
  path: '/board_startgame',
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

    setInterval(
      function () {
        var postData2 = JSON.stringify({
          'boardId': 'testboard',
          'boardSessionId': 'testbsid'
        });

        var options2 = {
          hostname: serverIP,
          port: serverPort,
          path: '/board_requestupdate',
          method: 'PUT', // 'POST'
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData2.length
          }
        };

        var req2 = http.request(options2, (res2) => {
          console.log(`STATUS: ${res2.statusCode}`);
          console.log(`HEADERS: ${JSON.stringify(res2.headers)}`);
          res2.setEncoding('utf8');
          res2.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
          });
          res2.on('end', () => {
            console.log('No more data in response.');
          })
        });

        req2.on('error', (e) => {
          console.log(`problem with request: ${e.message}`);
        });

        // write data to request body
        req2.write(postData2);
        req2.end();
      }
      , 5000
    );
  })
});

req.on('error', (e) => {
  console.log(`problem with request: ${e.message}`);
});

// write data to request body
req.write(postData);
req.end();
