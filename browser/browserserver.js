const Emitter = require('events');
const util = require('util');
const queryStirng = require('querystring');
const Logger = require('../util/logger.js');
const TypeConverter = require('../util/typeconverter.js');
const global = require('../global.js');

var logger;

function BrowserServer (logLevel) {
  Emitter.call(this);
  logger = new Logger(logLevel, this);
};
util.inherits(BrowserServer, Emitter);



BrowserServer.prototype.generateStartPage =
                          function (response, loginSessionId, boardId, boardReady) {
  // write html head, body labels
  this.writeHtmlStart(response);
  // write display area (id='displayArea')
  this.writeDisplayArea(response);
  // generate command buttons
  this.writeStartCommandButtons(response, boardReady ?
                                          {drawseat:"", opendoor:"", ready:""} :
                                          {drawseat:"disabled", opendoor:"disabled", ready:"disabled"});
  // <script>
  this.writeScriptStart(response);
  // global varibles
  // this.writeGlobalVariables(response);
  // write onClick handlers for all buttons
  this.writeStartButtonClickedHandlers(response, loginSessionId, boardId);
  // write getAllButtons for browser client to querry all current buttons
  // this.writeGetAllButtons(response, atHandString);
  // write readableToUrl for browser client to convert strings
  // this.writeReadableToUrl(response);
  // </script>
  this.writeScriptEnd(response);
  // write html head, body end labels
  this.writeHtmlEnd(response);
  // must put end to end connection of the request
  response.end();
};

BrowserServer.prototype.generateNextPage =
                          function (data, response, loginSessionId, boardId) {
  var atHand = Object.keys(data);
  var atHandString = "";

  // write html head, body labels
  this.writeHtmlStart(response);
  // write buttons
  atHand.forEach(function (urlUnit) {
    var content = TypeConverter.urlToReadable(urlUnit);
    var num = parseInt(data[urlUnit]);
    logger.debug(`urlUnit=${urlUnit}, content=${content}, num=${num}`);
    for (var count = 0; count < num; ++count) {
      response.write(this.generateTileButtonHtml(content) + "&nbsp;");
    }

    atHandString += `${urlUnit}:${num},`;
  }.bind(this));
  // write display area (id='displayArea')
  this.writeDisplayArea(response);
  // generate command buttons
  this.writeGameCommandButtons(response);
  // <script>
  this.writeScriptStart(response);
  // global varibles
  this.writeGlobalVariables(response);
  // write onClick handlers for all buttons
  this.writeGameButtonClickedHandlers(response, loginSessionId, boardId);
  // write getAllButtons for browser client to querry all current buttons
  this.writeGetAllButtons(response, atHandString);
  // write readableToUrl for browser client to convert strings
  this.writeReadableToUrl(response);
  // </script>
  this.writeScriptEnd(response);
  // write html head, body end labels
  this.writeHtmlEnd(response);
  // must put end to end connection of the request
  response.end();
};

BrowserServer.prototype.startgame = function (data, response) {
  logger.debug(`in startgame, data=${JSON.stringify(data)}`);
  var boardId = data["bid"];
  var loginSessionId = data["lsid"];

  var boardReadyCallback = function (isReady) {
    this.generateStartPage(response, loginSessionId, boardId, isReady);
  }.bind(this);

  this.emit('startgame', boardId, boardReadyCallback);

  logger.debug(`boardId=${boardId}, loginSessionId=${loginSessionId}`);
};

BrowserServer.prototype.drawseat = function (data, response) {
  logger.debug(`in drawseat, data=${JSON.stringify(data)}`);
  var boardId = data["bid"];
  var loginSessionId = data["lsid"];

  this.emit('drawseat', loginSessionId, boardId);

  logger.debug(`boardId=${boardId}, loginSessionId=${loginSessionId}`);

  this.generateStartPage(response, loginSessionId, boardId, true);
};

BrowserServer.prototype.opendoor = function (data, response) {
  logger.debug(`in opendoor, data=${JSON.stringify(data)}`);
  var boardId = data["bid"];
  var loginSessionId = data["lsid"];

  this.emit('opendoor', loginSessionId, boardId);

  logger.debug(`boardId=${boardId}, loginSessionId=${loginSessionId}`);

  this.generateStartPage(response, loginSessionId, boardId, true);
};

BrowserServer.prototype.ready = function (data, response) {
  logger.debug(`in ready, data=${JSON.stringify(data)}`);
  var boardId = data["bid"];
  var loginSessionId = data["lsid"];

  // this.emit('ready', loginSessionId, boardId);

  logger.debug(`boardId=${boardId}, loginSessionId=${loginSessionId}`);

  this.generateNextPage({}, response, loginSessionId, boardId);
};

BrowserServer.prototype.discard = function (data, response) {
  logger.debug(`in discard, data=${JSON.stringify(data)}`);
  var placedUrl = data["placed"];
  var boardId = data["bid"];
  var loginSessionId = data["lsid"];

  this.emit('discard', loginSessionId, boardId, placedUrl);

  delete data["placed"];
  delete data["bid"];
  delete data["lsid"];

  if (parseInt(data[placedUrl]) > 0) {
    data[placedUrl] = (parseInt(data[placedUrl]) - 1).toString();
  } else {
    delete data[placedUrl];
  }

  logger.debug(`placedUrl=${placedUrl}, boardId=${boardId}, ` +
               `loginSessionId=${loginSessionId}, data[${placedUrl}]=${data[placedUrl]}`);

  this.generateNextPage(data, response, loginSessionId, boardId);
};

BrowserServer.prototype.show = function (data, response) {
  logger.debug(`in show, data=${JSON.stringify(data)}`);
  var placedUrl = data["placed"];
  var boardId = data["bid"];
  var loginSessionId = data["lsid"];

  this.emit('show', loginSessionId, boardId, placedUrl);

  delete data["placed"];
  delete data["bid"];
  delete data["lsid"];

  if (parseInt(data[placedUrl]) > 0) {
    data[placedUrl] = (parseInt(data[placedUrl]) - 1).toString();
  } else {
    delete data[placedUrl];
  }

  logger.debug(`placedUrl=${placedUrl}, boardId=${boardId}, ` +
               `loginSessionId=${loginSessionId}, data[${placedUrl}]=${data[placedUrl]}`);

  this.generateNextPage(data, response, loginSessionId, boardId);
};

BrowserServer.prototype.cover = function (data, response) {
  logger.debug(`in cover, data=${JSON.stringify(data)}`);
  var placedUrl = data["placed"];
  var boardId = data["bid"];
  var loginSessionId = data["lsid"];

  this.emit('cover', loginSessionId, boardId, placedUrl);

  delete data["placed"];
  delete data["bid"];
  delete data["lsid"];

  if (parseInt(data[placedUrl]) > 0) {
    data[placedUrl] = (parseInt(data[placedUrl]) - 1).toString();
  } else {
    delete data[placedUrl];
  }

  logger.debug(`placedUrl=${placedUrl}, boardId=${boardId}, ` +
               `loginSessionId=${loginSessionId}, data[${placedUrl}]=${data[placedUrl]}`);

  this.generateNextPage(data, response, loginSessionId, boardId);
};

BrowserServer.prototype.takefront = function (data, response) {
  logger.debug(`in takefront, data=${JSON.stringify(data)}`);
  var placedUrl = data["placed"]; // should be {}, not used
  var boardId = data["bid"];
  var loginSessionId = data["lsid"];

  delete data["placed"];
  delete data["bid"];
  delete data["lsid"];

  this.emit('takefront', loginSessionId, boardId, placedUrl, function (frontTile) {
    data[frontTile] = data[frontTile] ?
                    (parseInt(data[frontTile])+1).toString() : "1";

    logger.debug(`placedUrl=${placedUrl}, boardId=${boardId}, ` +
                 `loginSessionId=${loginSessionId}, data[${placedUrl}]=${data[placedUrl]}`);

    this.generateNextPage(data, response, loginSessionId, boardId);
  }.bind(this));
};

BrowserServer.prototype.takeback = function (data, response) {
  logger.debug(`in takeback, data=${JSON.stringify(data)}`);
  var placedUrl = data["placed"];
  var boardId = data["bid"];
  var loginSessionId = data["lsid"];

  delete data["placed"];
  delete data["bid"];
  delete data["lsid"];

  this.emit('takeback', loginSessionId, boardId, placedUrl, function (backTile) {
    data[backTile] = data[backTile] ?
                    (parseInt(data[backTile])+1).toString() : "1";

    logger.debug(`placedUrl=${placedUrl}, boardId=${boardId}, ` +
                 `loginSessionId=${loginSessionId}, data[${placedUrl}]=${data[placedUrl]}`);

    this.generateNextPage(data, response, loginSessionId, boardId);
  }.bind(this));
};

BrowserServer.prototype.eat = function (data, response) {
  logger.debug(`in eat, data=${JSON.stringify(data)}`);
  var placedUrl = data["placed"];
  var boardId = data["bid"];
  var loginSessionId = data["lsid"];

  this.emit('eat', loginSessionId, boardId, placedUrl);

  delete data["placed"];
  delete data["bid"];
  delete data["lsid"];

  logger.debug(`placedUrl=${placedUrl}, boardId=${boardId}, ` +
               `loginSessionId=${loginSessionId}, data[${placedUrl}]=${data[placedUrl]}`);

  this.generateNextPage(data, response, loginSessionId, boardId);
};


BrowserServer.prototype.writeStartButtonClickedHandlers =
                                function (response, loginSessionId, boardId) {
  this.writeOnDrawSeatClicked(response, loginSessionId, boardId);
  this.writeOnOpenDoorClicked(response, loginSessionId, boardId);
  this.writeOnReadyClicked(response, loginSessionId, boardId);
};

BrowserServer.prototype.writeGameButtonClickedHandlers =
                                function (response, loginSessionId, boardId) {
  this.writeOnTileClicked(response, loginSessionId, boardId);
  this.writeOnShowClicked(response);
  this.writeOnCoverClicked(response);
  this.writeOnDiscardClicked(response);
  this.writeOnTakeFrontClicked(response, loginSessionId, boardId);
  this.writeOnTakeBackClicked(response, loginSessionId, boardId);
  this.writeOnEatClicked(response, loginSessionId, boardId);
};

BrowserServer.prototype.writeHtmlStart = function (response) {
  response.write("<html>");
  response.write("<head>");
  response.write(
    "<style>\
         .button {\
             width:13%;\
             height:10%;\
             font-size:120%;\
         }\
    </style>\
    "
  );
  response.write("<meta HTTP-EQUIV='Content-Type' CONTENT='text/html; charset=UTF-8'");
  response.write("</head>");
  response.write("<body>");
};

BrowserServer.prototype.writeHtmlEnd = function (response) {
  response.write("</body>");
  response.write("</html>");
};

BrowserServer.prototype.writeDisplayArea = function (response) {
  response.write("<br/>");
  response.write("<br/>");
  response.write("<p id=\"displayArea\">請選擇一項動作:</p>");
};

BrowserServer.prototype.writeScriptStart = function (response) {
  response.write("<script>");
};

BrowserServer.prototype.writeScriptEnd = function (response) {
  response.write("</script>");
};

BrowserServer.prototype.writeGlobalVariables = function (response) {
  response.write(
    "var subtypeTable = {                                             \
      '%E4%B8%80' : '1',                                              \
      '%E4%BA%8C' : '2',                                              \
      '%E4%B8%89' : '3',                                              \
      '%E5%9B%9B' : '4',                                              \
      '%E4%BA%94' : '5',                                              \
      '%E5%85%AD' : '6',                                              \
      '%E4%B8%83' : '7',                                              \
      '%E5%85%AB' : '8',                                              \
      '%E4%B9%9D' : '9'                                               \
    };                                                                \
    var typeTable = {                                                 \
      '%E8%90%AC' : 'wn',                                             \
      '%E7%AD%92' : 'tn',                                             \
      '%E6%A2%9D' : 'ti',                                             \
      '%E6%98%A5' : 'ts',                                             \
      '%E5%A4%8F' : 'sa',                                             \
      '%E7%A7%8B' : 'ch',                                             \
      '%E5%86%AC' : 'dn',                                             \
      '%E6%A2%85' : 'me',                                             \
      '%E8%98%AD' : 'ln',                                             \
      '%E7%AB%B9' : 'jw',                                             \
      '%E8%8F%8A' : 'ju',                                             \
      '%E7%99%BD%E6%9D%BF' : 'bb',                                    \
      '%E9%9D%92%E7%99%BC' : 'fa',                                    \
      '%E7%B4%85%E4%B8%AD' : 'jn',                                    \
      '%E5%8C%97%E9%A2%A8' : 'bf',                                    \
      '%E5%8D%97%E9%A2%A8' : 'nf',                                    \
      '%E6%9D%B1%E9%A2%A8' : 'df',                                    \
      '%E8%A5%BF%E9%A2%A8' : 'xf'                                     \
    };                                                                \
    var g_action = null;                                              \
    "
  );
};

BrowserServer.prototype.writeOnDrawSeatClicked = function (response, loginSessionId, boardId) {
  logger.debug(`in writeOnDrawSeatClicked, loginSessionId=${loginSessionId}, boardId=${boardId}`);
  response.write(`function onDrawSeatClicked(objButton) {                         \
    try {                                                                         \
      window.location = \"http://\" +                                             \
        \"${global.publicIP}:${global.publicPort.toString()}/\" +                 \
        \"browser_drawseat\" +                                                    \
        \"&lsid=${loginSessionId}&bid=${boardId}\";                               \
    } catch(e) {                                                                  \
      alert(e);                                                                   \
    }                                                                             \
  }`);
};

BrowserServer.prototype.writeOnOpenDoorClicked = function (response, loginSessionId, boardId) {
  logger.debug(`in writeOnOpenDoorClicked, loginSessionId=${loginSessionId}, boardId=${boardId}`);
  response.write(`function onOpenDoorClicked(objButton) {                         \
    try {                                                                         \
      window.location = \"http://\" +                                             \
        \"${global.publicIP}:${global.publicPort.toString()}/\" +                 \
        \"browser_opendoor\" +                                                    \
        \"&lsid=${loginSessionId}&bid=${boardId}\";                               \
    } catch(e) {                                                                  \
      alert(e);                                                                   \
    }                                                                             \
  }`);
};

BrowserServer.prototype.writeOnReadyClicked = function (response, loginSessionId, boardId) {
  logger.debug(`in writeOnOpenDoorClicked, loginSessionId=${loginSessionId}, boardId=${boardId}`);
  response.write(`function onReadyClicked(objButton) {                            \
    try {                                                                         \
      window.location = \"http://\" +                                             \
        \"${global.publicIP}:${global.publicPort.toString()}/\" +                 \
        \"browser_ready\" +                                                       \
        \"&lsid=${loginSessionId}&bid=${boardId}\";                               \
    } catch(e) {                                                                  \
      alert(e);                                                                   \
    }                                                                             \
  }`);
};

BrowserServer.prototype.writeOnTileClicked = function (response, loginSessionId, boardId) {
  logger.debug(`in writeOnTileClicked, loginSessionId=${loginSessionId}, boardId=${boardId}`);
  response.write(`function onTileClicked(objButton) {                             \
    if (!g_action) { return; }                                                    \
    try {                                                                         \
      var buttons = getAllButtons();                                              \
      var types = Object.keys(buttons);                                           \
      var payload = \"\";                                                         \
      types.forEach(function (type) {                                             \
        payload += \"&\" + type + \"=\" + buttons[type].toString();               \
      });                                                                         \
      var placed = readableToUrl(objButton.innerHTML);                            \
      window.location = \"http://\" +                                             \
        \"${global.publicIP}:${global.publicPort.toString()}/\" +                 \
        \"browser_\" + g_action +                                                 \
        \"&lsid=${loginSessionId}&bid=${boardId}&placed=\" + placed + payload;    \
    } catch(e) {                                                                  \
      alert(e);                                                                   \
    }                                                                             \
  }`);
};

BrowserServer.prototype.writeOnDiscardClicked = function (response) {
  response.write(`function onDiscardClicked(objButton) {                          \
      var msgArea = document.getElementById("displayArea");                       \
      if (g_action === 'discard') {                                               \
        msgArea.innerHTML = "請選擇一項動作:";                                     \
        g_action = null;                                                          \
      } else {                                                                    \
        msgArea.innerHTML = "打出一張牌到海底";                                    \
        g_action = 'discard';                                                     \
      }                                                                           \
  }`);
};

BrowserServer.prototype.writeOnShowClicked = function (response) {
  response.write(`function onShowClicked(objButton) {                             \
      var msgArea = document.getElementById("displayArea");                       \
      if (g_action === 'show') {                                                  \
        msgArea.innerHTML = "請選擇一項動作:";                                     \
        g_action = null;                                                          \
      } else {                                                                    \
        msgArea.innerHTML = "亮出一張牌到你的牌堆前";                               \
        g_action = 'show';                                                        \
      }                                                                           \
  }`);
};

BrowserServer.prototype.writeOnCoverClicked = function (response) {
  response.write(`function onCoverClicked(objButton) {                            \
      var msgArea = document.getElementById("displayArea");                       \
      if (g_action === 'cover') {                                                 \
        msgArea.innerHTML = "請選擇一項動作:";                                     \
        g_action = null;                                                          \
      } else {                                                                    \
        msgArea.innerHTML = "蓋一張牌到你的牌堆前";                                 \
        g_action = 'cover';                                                       \
      }                                                                           \
  }`);
};

BrowserServer.prototype.writeOnTakeFrontClicked = function (response, loginSessionId, boardId) {
  response.write(`function onTakeFrontClicked(objButton) {                        \
      var msgArea = document.getElementById("displayArea");                       \
      msgArea.innerHTML = "請選擇一項動作:";                                       \
      g_action = null;                                                            \
      try {                                                                       \
        var buttons = getAllButtons();                                            \
        var types = Object.keys(buttons);                                         \
        var payload = \"\";                                                       \
        types.forEach(function (type) {                                           \
          payload += \"&\" + type + \"=\" + buttons[type].toString();             \
        });                                                                       \
        window.location = \"http://\" +                                           \
          \"${global.publicIP}:${global.publicPort.toString()}/\" +               \
          \"browser_takefront\" +                                                 \
          \"&lsid=${loginSessionId}&bid=${boardId}&placed=\" + payload;           \
      } catch(e) {                                                                \
        alert(e);                                                                 \
      }                                                                           \
  }`);
};

BrowserServer.prototype.writeOnTakeBackClicked = function (response, loginSessionId, boardId) {
  response.write(`function onTakeBackClicked(objButton) {                        \
      var msgArea = document.getElementById("displayArea");                      \
      msgArea.innerHTML = "請選擇一項動作:";                                       \
      g_action = null;                                                            \
      try {                                                                       \
        var buttons = getAllButtons();                                            \
        var types = Object.keys(buttons);                                         \
        var payload = \"\";                                                       \
        types.forEach(function (type) {                                           \
          payload += \"&\" + type + \"=\" + buttons[type].toString();             \
        });                                                                       \
        window.location = \"http://\" +                                           \
          \"${global.publicIP}:${global.publicPort.toString()}/\" +               \
          \"browser_takeback\" +                                                  \
          \"&lsid=${loginSessionId}&bid=${boardId}&placed=\" + payload;           \
      } catch(e) {                                                                \
        alert(e);                                                                 \
      }                                                                           \
  }`);
};

BrowserServer.prototype.writeOnEatClicked = function (response, loginSessionId, boardId) {
  response.write(`function onEatClicked(objButton) {                             \
      var msgArea = document.getElementById("displayArea");                      \
      msgArea.innerHTML = "請選擇一項動作:";                                       \
      g_action = null;                                                            \
      try {                                                                       \
        var buttons = getAllButtons();                                            \
        var types = Object.keys(buttons);                                         \
        var payload = \"\";                                                       \
        types.forEach(function (type) {                                           \
          payload += \"&\" + type + \"=\" + buttons[type].toString();             \
        });                                                                       \
        window.location = \"http://\" +                                           \
          \"${global.publicIP}:${global.publicPort.toString()}/\" +               \
          \"browser_eat\" +                                                       \
          \"&lsid=${loginSessionId}&bid=${boardId}&placed=\" + payload;           \
      } catch(e) {                                                                \
        alert(e);                                                                 \
      }                                                                           \
  }`);
};

BrowserServer.prototype.writeGetAllButtons = function (response, buttons) {
  logger.debug(`in writeGetAllButtons, buttons=${JSON.stringify(buttons)}`);
  response.write(`function getAllButtons() {                          \
    return {${buttons}};                                              \
  }`);
};

BrowserServer.prototype.writeReadableToUrl = function (response) {
  response.write("function readableToUrl(readable) {                  \
    readable = encodeURI(readable);                                   \
    readable = readable.substring(3, readable.length-3);              \
    if (subtypeTable[readable.substring(0, 9)]) {                     \
      return typeTable[readable.substring(9)] +                       \
             subtypeTable[readable.substring(0, 9)];                  \
    } else {                                                          \
      return typeTable[readable];                                     \
    }                                                                 \
  }");
};

BrowserServer.prototype.generateTileButtonHtml = function (buttonContent) {
  return `<button class='button' onclick='onTileClicked(this)'> ${buttonContent} </button>`;
};

BrowserServer.prototype.writeStartCommandButtons = function (response,  options) {
  var spaces = "&nbsp;&nbsp;&nbsp;&nbsp;";
  response.write(`<button class='button' onclick='onDrawSeatClicked(this)' ${options.drawseat}>抽座位</button>` + spaces);
  response.write(`<button class='button' onclick='onOpenDoorClicked(this)' ${options.opendoor}>骰開門</button>` + spaces);
  response.write(`<button class='button' onclick='onReadyClicked(this)' ${options.ready}>準備好了!</button>` + spaces);
};

BrowserServer.prototype.writeGameCommandButtons = function (response) {
  var spaces = "&nbsp;&nbsp;&nbsp;&nbsp;";
  response.write("<button class='button' onclick='onShowClicked(this)'>亮牌</button>" + spaces);
  response.write("<button class='button' onclick='onCoverClicked(this)'>暗牌</button>" + spaces);
  response.write("<button class='button' onclick='onDiscardClicked(this)'>打牌</button>" + spaces);
  response.write("<button class='button' onclick='onTakeFrontClicked(this)'>摸牌</button>" + spaces);
  response.write("<button class='button' onclick='onTakeBackClicked(this)'>補花</button>" + spaces);
  response.write("<button class='button' onclick='onEatClicked(this)'>吃/碰/槓</button>" + spaces);
};

module.exports = BrowserServer;
