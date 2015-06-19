/* */ 
var Token = require("./Token").Token;
var ConsoleErrorListener = require("./error/ErrorListener").ConsoleErrorListener;
var ProxyErrorListener = require("./error/ErrorListener").ProxyErrorListener;
function Recognizer() {
  this._listeners = [ConsoleErrorListener.INSTANCE];
  this._interp = null;
  this._stateNumber = -1;
  return this;
}
Recognizer.tokenTypeMapCache = {};
Recognizer.ruleIndexMapCache = {};
Recognizer.prototype.checkVersion = function(toolVersion) {
  var runtimeVersion = "4.5";
  if (runtimeVersion !== toolVersion) {
    console.log("ANTLR runtime and generated code versions disagree: " + runtimeVersion + "!=" + toolVersion);
  }
};
Recognizer.prototype.addErrorListener = function(listener) {
  this._listeners.push(listener);
};
Recognizer.prototype.removeErrorListeners = function() {
  this._listeners = [];
};
Recognizer.prototype.getTokenTypeMap = function() {
  var tokenNames = this.getTokenNames();
  if (tokenNames === null) {
    throw ("The current recognizer does not provide a list of token names.");
  }
  var result = this.tokenTypeMapCache[tokenNames];
  if (result === undefined) {
    result = tokenNames.reduce(function(o, k, i) {
      o[k] = i;
    });
    result.EOF = Token.EOF;
    this.tokenTypeMapCache[tokenNames] = result;
  }
  return result;
};
Recognizer.prototype.getRuleIndexMap = function() {
  var ruleNames = this.getRuleNames();
  if (ruleNames === null) {
    throw ("The current recognizer does not provide a list of rule names.");
  }
  var result = this.ruleIndexMapCache[ruleNames];
  if (result === undefined) {
    result = ruleNames.reduce(function(o, k, i) {
      o[k] = i;
    });
    this.ruleIndexMapCache[ruleNames] = result;
  }
  return result;
};
Recognizer.prototype.getTokenType = function(tokenName) {
  var ttype = this.getTokenTypeMap()[tokenName];
  if (ttype !== undefined) {
    return ttype;
  } else {
    return Token.INVALID_TYPE;
  }
};
Recognizer.prototype.getErrorHeader = function(e) {
  var line = e.getOffendingToken().line;
  var column = e.getOffendingToken().column;
  return "line " + line + ":" + column;
};
Recognizer.prototype.getTokenErrorDisplay = function(t) {
  if (t === null) {
    return "<no token>";
  }
  var s = t.text;
  if (s === null) {
    if (t.type === Token.EOF) {
      s = "<EOF>";
    } else {
      s = "<" + t.type + ">";
    }
  }
  s = s.replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
  return "'" + s + "'";
};
Recognizer.prototype.getErrorListenerDispatch = function() {
  return new ProxyErrorListener(this._listeners);
};
Recognizer.prototype.sempred = function(localctx, ruleIndex, actionIndex) {
  return true;
};
Recognizer.prototype.precpred = function(localctx, precedence) {
  return true;
};
Object.defineProperty(Recognizer.prototype, "state", {
  get: function() {
    return this._stateNumber;
  },
  set: function(state) {
    this._stateNumber = state;
  }
});
exports.Recognizer = Recognizer;
