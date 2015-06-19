/* */ 
var Token = require("./Token").Token;
var Recognizer = require("./Recognizer").Recognizer;
var CommonTokenFactory = require("./CommonTokenFactory").CommonTokenFactory;
var LexerNoViableAltException = require("./error/Errors").LexerNoViableAltException;
function TokenSource() {
  return this;
}
function Lexer(input) {
  Recognizer.call(this);
  this._input = input;
  this._factory = CommonTokenFactory.DEFAULT;
  this._tokenFactorySourcePair = [this, input];
  this._interp = null;
  this._token = null;
  this._tokenStartCharIndex = -1;
  this._tokenStartLine = -1;
  this._tokenStartColumn = -1;
  this._hitEOF = false;
  this._channel = Token.DEFAULT_CHANNEL;
  this._type = Token.INVALID_TYPE;
  this._modeStack = [];
  this._mode = Lexer.DEFAULT_MODE;
  this._text = null;
  return this;
}
Lexer.prototype = Object.create(Recognizer.prototype);
Lexer.prototype.constructor = Lexer;
Lexer.DEFAULT_MODE = 0;
Lexer.MORE = -2;
Lexer.SKIP = -3;
Lexer.DEFAULT_TOKEN_CHANNEL = Token.DEFAULT_CHANNEL;
Lexer.HIDDEN = Token.HIDDEN_CHANNEL;
Lexer.MIN_CHAR_VALUE = '\u0000';
Lexer.MAX_CHAR_VALUE = '\uFFFE';
Lexer.prototype.reset = function() {
  if (this._input !== null) {
    this._input.seek(0);
  }
  this._token = null;
  this._type = Token.INVALID_TYPE;
  this._channel = Token.DEFAULT_CHANNEL;
  this._tokenStartCharIndex = -1;
  this._tokenStartColumn = -1;
  this._tokenStartLine = -1;
  this._text = null;
  this._hitEOF = false;
  this._mode = Lexer.DEFAULT_MODE;
  this._modeStack = [];
  this._interp.reset();
};
Lexer.prototype.nextToken = function() {
  if (this._input === null) {
    throw "nextToken requires a non-null input stream.";
  }
  var tokenStartMarker = this._input.mark();
  try {
    while (true) {
      if (this._hitEOF) {
        this.emitEOF();
        return this._token;
      }
      this._token = null;
      this._channel = Token.DEFAULT_CHANNEL;
      this._tokenStartCharIndex = this._input.index;
      this._tokenStartColumn = this._interp.column;
      this._tokenStartLine = this._interp.line;
      this._text = null;
      var continueOuter = false;
      while (true) {
        this._type = Token.INVALID_TYPE;
        var ttype = Lexer.SKIP;
        try {
          ttype = this._interp.match(this._input, this._mode);
        } catch (e) {
          this.notifyListeners(e);
          this.recover(e);
        }
        if (this._input.LA(1) === Token.EOF) {
          this._hitEOF = true;
        }
        if (this._type === Token.INVALID_TYPE) {
          this._type = ttype;
        }
        if (this._type === Lexer.SKIP) {
          continueOuter = true;
          break;
        }
        if (this._type !== Lexer.MORE) {
          break;
        }
      }
      if (continueOuter) {
        continue;
      }
      if (this._token === null) {
        this.emit();
      }
      return this._token;
    }
  } finally {
    this._input.release(tokenStartMarker);
  }
};
Lexer.prototype.skip = function() {
  this._type = Lexer.SKIP;
};
Lexer.prototype.more = function() {
  this._type = Lexer.MORE;
};
Lexer.prototype.mode = function(m) {
  this._mode = m;
};
Lexer.prototype.pushMode = function(m) {
  if (this._interp.debug) {
    console.log("pushMode " + m);
  }
  this._modeStack.push(this._mode);
  this.mode(m);
};
Lexer.prototype.popMode = function() {
  if (this._modeStack.length === 0) {
    throw "Empty Stack";
  }
  if (this._interp.debug) {
    console.log("popMode back to " + this._modeStack.slice(0, -1));
  }
  this.mode(this._modeStack.pop());
  return this._mode;
};
Object.defineProperty(Lexer.prototype, "inputStream", {
  get: function() {
    return this._input;
  },
  set: function(input) {
    this._input = null;
    this._tokenFactorySourcePair = [this, this._input];
    this.reset();
    this._input = input;
    this._tokenFactorySourcePair = [this, this._input];
  }
});
Object.defineProperty(Lexer.prototype, "sourceName", {get: function sourceName() {
    return this._input.sourceName;
  }});
Lexer.prototype.emitToken = function(token) {
  this._token = token;
};
Lexer.prototype.emit = function() {
  var t = this._factory.create(this._tokenFactorySourcePair, this._type, this._text, this._channel, this._tokenStartCharIndex, this.getCharIndex() - 1, this._tokenStartLine, this._tokenStartColumn);
  this.emitToken(t);
  return t;
};
Lexer.prototype.emitEOF = function() {
  var cpos = this.column;
  var lpos = this.line;
  var eof = this._factory.create(this._tokenFactorySourcePair, Token.EOF, null, Token.DEFAULT_CHANNEL, this._input.index, this._input.index - 1, lpos, cpos);
  this.emitToken(eof);
  return eof;
};
Object.defineProperty(Lexer.prototype, "type", {
  get: function() {
    return this.type;
  },
  set: function(type) {
    this._type = type;
  }
});
Object.defineProperty(Lexer.prototype, "line", {
  get: function() {
    return this._interp.line;
  },
  set: function(line) {
    this._interp.line = line;
  }
});
Object.defineProperty(Lexer.prototype, "column", {
  get: function() {
    return this._interp.column;
  },
  set: function(column) {
    this._interp.column = column;
  }
});
Lexer.prototype.getCharIndex = function() {
  return this._input.index;
};
Object.defineProperty(Lexer.prototype, "text", {
  get: function() {
    if (this._text !== null) {
      return this._text;
    } else {
      return this._interp.getText(this._input);
    }
  },
  set: function(text) {
    this._text = text;
  }
});
Lexer.prototype.getAllTokens = function() {
  var tokens = [];
  var t = this.nextToken();
  while (t.type !== Token.EOF) {
    tokens.push(t);
    t = this.nextToken();
  }
  return tokens;
};
Lexer.prototype.notifyListeners = function(e) {
  var start = this._tokenStartCharIndex;
  var stop = this._input.index;
  var text = this._input.getText(start, stop);
  var msg = "token recognition error at: '" + this.getErrorDisplay(text) + "'";
  var listener = this.getErrorListenerDispatch();
  listener.syntaxError(this, null, this._tokenStartLine, this._tokenStartColumn, msg, e);
};
Lexer.prototype.getErrorDisplay = function(s) {
  var d = [];
  for (var i = 0; i < s.length; i++) {
    d.push(s[i]);
  }
  return d.join('');
};
Lexer.prototype.getErrorDisplayForChar = function(c) {
  if (c.charCodeAt(0) === Token.EOF) {
    return "<EOF>";
  } else if (c === '\n') {
    return "\\n";
  } else if (c === '\t') {
    return "\\t";
  } else if (c === '\r') {
    return "\\r";
  } else {
    return c;
  }
};
Lexer.prototype.getCharErrorDisplay = function(c) {
  return "'" + this.getErrorDisplayForChar(c) + "'";
};
Lexer.prototype.recover = function(re) {
  if (this._input.LA(1) !== Token.EOF) {
    if (re instanceof LexerNoViableAltException) {
      this._interp.consume(this._input);
    } else {
      this._input.consume();
    }
  }
};
exports.Lexer = Lexer;
