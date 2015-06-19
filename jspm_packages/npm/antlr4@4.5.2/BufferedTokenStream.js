/* */ 
(function(Buffer) {
  var Token = require("./Token").Token;
  var Lexer = require("./Lexer").Lexer;
  var Interval = require("./IntervalSet").Interval;
  function TokenStream() {
    return this;
  }
  function BufferedTokenStream(tokenSource) {
    TokenStream.call(this);
    this.tokenSource = tokenSource;
    this.tokens = [];
    this.index = -1;
    this.fetchedEOF = false;
    return this;
  }
  BufferedTokenStream.prototype = Object.create(TokenStream.prototype);
  BufferedTokenStream.prototype.constructor = BufferedTokenStream;
  BufferedTokenStream.prototype.mark = function() {
    return 0;
  };
  BufferedTokenStream.prototype.release = function(marker) {};
  BufferedTokenStream.prototype.reset = function() {
    this.seek(0);
  };
  BufferedTokenStream.prototype.seek = function(index) {
    this.lazyInit();
    this.index = this.adjustSeekIndex(index);
  };
  BufferedTokenStream.prototype.get = function(index) {
    this.lazyInit();
    return this.tokens[index];
  };
  BufferedTokenStream.prototype.consume = function() {
    var skipEofCheck = false;
    if (this.index >= 0) {
      if (this.fetchedEOF) {
        skipEofCheck = this.index < this.tokens.length - 1;
      } else {
        skipEofCheck = this.index < this.tokens.length;
      }
    } else {
      skipEofCheck = false;
    }
    if (!skipEofCheck && this.LA(1) === Token.EOF) {
      throw "cannot consume EOF";
    }
    if (this.sync(this.index + 1)) {
      this.index = this.adjustSeekIndex(this.index + 1);
    }
  };
  BufferedTokenStream.prototype.sync = function(i) {
    var n = i - this.tokens.length + 1;
    if (n > 0) {
      var fetched = this.fetch(n);
      return fetched >= n;
    }
    return true;
  };
  BufferedTokenStream.prototype.fetch = function(n) {
    if (this.fetchedEOF) {
      return 0;
    }
    for (var i = 0; i < n; i++) {
      var t = this.tokenSource.nextToken();
      t.tokenIndex = this.tokens.length;
      this.tokens.push(t);
      if (t.type === Token.EOF) {
        this.fetchedEOF = true;
        return i + 1;
      }
    }
    return n;
  };
  BufferedTokenStream.prototype.getTokens = function(start, stop, types) {
    if (types === undefined) {
      types = null;
    }
    if (start < 0 || stop < 0) {
      return null;
    }
    this.lazyInit();
    var subset = [];
    if (stop >= this.tokens.length) {
      stop = this.tokens.length - 1;
    }
    for (var i = start; i < stop; i++) {
      var t = this.tokens[i];
      if (t.type === Token.EOF) {
        break;
      }
      if (types === null || types.contains(t.type)) {
        subset.push(t);
      }
    }
    return subset;
  };
  BufferedTokenStream.prototype.LA = function(i) {
    return this.LT(i).type;
  };
  BufferedTokenStream.prototype.LB = function(k) {
    if (this.index - k < 0) {
      return null;
    }
    return this.tokens[this.index - k];
  };
  BufferedTokenStream.prototype.LT = function(k) {
    this.lazyInit();
    if (k === 0) {
      return null;
    }
    if (k < 0) {
      return this.LB(-k);
    }
    var i = this.index + k - 1;
    this.sync(i);
    if (i >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1];
    }
    return this.tokens[i];
  };
  BufferedTokenStream.prototype.adjustSeekIndex = function(i) {
    return i;
  };
  BufferedTokenStream.prototype.lazyInit = function() {
    if (this.index === -1) {
      this.setup();
    }
  };
  BufferedTokenStream.prototype.setup = function() {
    this.sync(0);
    this.index = this.adjustSeekIndex(0);
  };
  BufferedTokenStream.prototype.setTokenSource = function(tokenSource) {
    this.tokenSource = tokenSource;
    this.tokens = [];
    this.index = -1;
  };
  BufferedTokenStream.prototype.nextTokenOnChannel = function(i, channel) {
    this.sync(i);
    if (i >= this.tokens.length) {
      return -1;
    }
    var token = this.tokens[i];
    while (token.channel !== this.channel) {
      if (token.type === Token.EOF) {
        return -1;
      }
      i += 1;
      this.sync(i);
      token = this.tokens[i];
    }
    return i;
  };
  BufferedTokenStream.prototype.previousTokenOnChannel = function(i, channel) {
    while (i >= 0 && this.tokens[i].channel !== channel) {
      i -= 1;
    }
    return i;
  };
  BufferedTokenStream.prototype.getHiddenTokensToRight = function(tokenIndex, channel) {
    if (channel === undefined) {
      channel = -1;
    }
    this.lazyInit();
    if (this.tokenIndex < 0 || tokenIndex >= this.tokens.length) {
      throw "" + tokenIndex + " not in 0.." + this.tokens.length - 1;
    }
    var nextOnChannel = this.nextTokenOnChannel(tokenIndex + 1, Lexer.DEFAULT_TOKEN_CHANNEL);
    var from_ = tokenIndex + 1;
    var to = nextOnChannel === -1 ? this.tokens.length - 1 : nextOnChannel;
    return this.filterForChannel(from_, to, channel);
  };
  BufferedTokenStream.prototype.getHiddenTokensToLeft = function(tokenIndex, channel) {
    if (channel === undefined) {
      channel = -1;
    }
    this.lazyInit();
    if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
      throw "" + tokenIndex + " not in 0.." + this.tokens.length - 1;
    }
    var prevOnChannel = this.previousTokenOnChannel(tokenIndex - 1, Lexer.DEFAULT_TOKEN_CHANNEL);
    if (prevOnChannel === tokenIndex - 1) {
      return null;
    }
    var from_ = prevOnChannel + 1;
    var to = tokenIndex - 1;
    return this.filterForChannel(from_, to, channel);
  };
  BufferedTokenStream.prototype.filterForChannel = function(left, right, channel) {
    var hidden = [];
    for (var i = left; i < right + 1; i++) {
      var t = this.tokens[i];
      if (channel === -1) {
        if (t.channel !== Lexer.DEFAULT_TOKEN_CHANNEL) {
          hidden.push(t);
        }
      } else if (t.channel === channel) {
        hidden.push(t);
      }
    }
    if (hidden.length === 0) {
      return null;
    }
    return hidden;
  };
  BufferedTokenStream.prototype.getSourceName = function() {
    return this.tokenSource.getSourceName();
  };
  BufferedTokenStream.prototype.getText = function(interval) {
    this.lazyInit();
    this.fill();
    if (interval === undefined || interval === null) {
      interval = new Interval(0, this.tokens.length - 1);
    }
    var start = interval.start;
    if (start instanceof Token) {
      start = start.tokenIndex;
    }
    var stop = interval.stop;
    if (stop instanceof Token) {
      stop = stop.tokenIndex;
    }
    if (start === null || stop === null || start < 0 || stop < 0) {
      return "";
    }
    if (stop >= this.tokens.length) {
      stop = this.tokens.length - 1;
    }
    var s = "";
    for (var i = start; i < stop + 1; i++) {
      var t = this.tokens[i];
      if (t.type === Token.EOF) {
        break;
      }
      s = s + t.text;
    }
    return s;
  };
  BufferedTokenStream.prototype.fill = function() {
    this.lazyInit();
    while (this.fetch(1000) === 1000) {
      continue;
    }
  };
  exports.BufferedTokenStream = BufferedTokenStream;
})(require("buffer").Buffer);
