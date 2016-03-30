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
  path: '/board_subscribe',
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
  })
});

req.on('error', (e) => {
  console.log(`problem with request: ${e.message}`);
});

// write data to request body
req.write(postData);
req.end();
