const Guid = {
  genRandString: function(length) {
    return Math.random().toString(36).substr(2, length);
  }
};

module.exports = Guid;
