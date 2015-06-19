/* */ 
(function(Buffer) {
  var Token = require("./Token").Token;
  var BufferedTokenStream = require("./BufferedTokenStream").BufferedTokenStream;
  function CommonTokenStream(lexer, channel) {
    BufferedTokenStream.call(this, lexer);
    this.channel = channel === undefined ? Token.DEFAULT_CHANNEL : channel;
    return this;
  }
  CommonTokenStream.prototype = Object.create(BufferedTokenStream.prototype);
  CommonTokenStream.prototype.constructor = CommonTokenStream;
  CommonTokenStream.prototype.adjustSeekIndex = function(i) {
    return this.nextTokenOnChannel(i, this.channel);
  };
  CommonTokenStream.prototype.LB = function(k) {
    if (k === 0 || this.index - k < 0) {
      return null;
    }
    var i = this.index;
    var n = 1;
    while (n <= k) {
      i = this.previousTokenOnChannel(i - 1, this.channel);
      n += 1;
    }
    if (i < 0) {
      return null;
    }
    return this.tokens[i];
  };
  CommonTokenStream.prototype.LT = function(k) {
    this.lazyInit();
    if (k === 0) {
      return null;
    }
    if (k < 0) {
      return this.LB(-k);
    }
    var i = this.index;
    var n = 1;
    while (n < k) {
      if (this.sync(i + 1)) {
        i = this.nextTokenOnChannel(i + 1, this.channel);
      }
      n += 1;
    }
    return this.tokens[i];
  };
  CommonTokenStream.prototype.getNumberOfOnChannelTokens = function() {
    var n = 0;
    this.fill();
    for (var i = 0; i < this.tokens.length; i++) {
      var t = this.tokens[i];
      if (t.channel === this.channel) {
        n += 1;
      }
      if (t.type === Token.EOF) {
        break;
      }
    }
    return n;
  };
  exports.CommonTokenStream = CommonTokenStream;
})(require("buffer").Buffer);
