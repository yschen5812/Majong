function Logger(logLevel, obj) {
  this.d_logLevel = logLevel || "debug";
  this.d_className = obj.constructor.name;

  this.priorityTable = {
    "debug" : 5,
    "info"  : 4,
    "warn"  : 3,
    "error" : 2
  };

  this.error = function (msg) {
    if (this.priorityTable[this.d_logLevel] >= this.priorityTable["error"]) {
      console.log(this.constructMessage(this.d_className, msg));
    }
  };

  this.warn = function (msg) {
    if (this.priorityTable[this.d_logLevel] >= this.priorityTable["warn"]) {
      console.log(this.constructMessage(this.d_className, msg));
    }
  };

  this.info = function (msg) {
    if (this.priorityTable[this.d_logLevel] >= this.priorityTable["info"]) {
      console.log(this.constructMessage(this.d_className, msg));
    }
  };

  this.debug = function (msg) {
    if (this.priorityTable[this.d_logLevel] >= this.priorityTable["debug"]) {
      console.log(this.constructMessage(this.d_className, msg));
    }
  };

  this.log = function (msg) {
    console.log(this.constructMessage(this.d_className, msg));
  };

  this.constructMessage = function (where, msg) {
    return "at " + where + ": " + msg;
  };
}

module.exports = Logger;


/************TEST*************/
// var test = new Logger("info");
//
// test.error("error");
// test.warn("warn");
// test.info("info");
// test.debug("debug");
