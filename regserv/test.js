const UserDB = require('./userdb.js');

const userDB = new UserDB();

userDB.on('test', function(msg) {
  console.log('test -> ', msg);
});

userDB.addUser("12345", {name: "lili"}, function(response) {
  console.log('test -> ',response);
});

userDB.addUser("12345", {name: "lili"}, function(response) {
  console.log('test -> ',response);
});
