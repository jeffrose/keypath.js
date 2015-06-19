/* */ 
var Token = require("../Token").Token;
var Errors = require("./Errors");
var NoViableAltException = Errors.NoViableAltException;
var InputMismatchException = Errors.InputMismatchException;
var FailedPredicateException = Errors.FailedPredicateException;
var ParseCancellationException = Errors.ParseCancellationException;
var ATNState = require("../atn/ATNState").ATNState;
var Interval = require("../IntervalSet").Interval;
var IntervalSet = require("../IntervalSet").IntervalSet;
function ErrorStrategy() {}
ErrorStrategy.prototype.reset = function(recognizer) {};
ErrorStrategy.prototype.recoverInline = function(recognizer) {};
ErrorStrategy.prototype.recover = function(recognizer, e) {};
ErrorStrategy.prototype.sync = function(recognizer) {};
ErrorStrategy.prototype.inErrorRecoveryMode = function(recognizer) {};
ErrorStrategy.prototype.reportError = function(recognizer) {};
function DefaultErrorStrategy() {
  ErrorStrategy.call(this);
  this.errorRecoveryMode = false;
  this.lastErrorIndex = -1;
  this.lastErrorStates = null;
  return this;
}
DefaultErrorStrategy.prototype = Object.create(ErrorStrategy.prototype);
DefaultErrorStrategy.prototype.constructor = DefaultErrorStrategy;
DefaultErrorStrategy.prototype.reset = function(recognizer) {
  this.endErrorCondition(recognizer);
};
DefaultErrorStrategy.prototype.beginErrorCondition = function(recognizer) {
  this.errorRecoveryMode = true;
};
DefaultErrorStrategy.prototype.inErrorRecoveryMode = function(recognizer) {
  return this.errorRecoveryMode;
};
DefaultErrorStrategy.prototype.endErrorCondition = function(recognizer) {
  this.errorRecoveryMode = false;
  this.lastErrorStates = null;
  this.lastErrorIndex = -1;
};
DefaultErrorStrategy.prototype.reportMatch = function(recognizer) {
  this.endErrorCondition(recognizer);
};
DefaultErrorStrategy.prototype.reportError = function(recognizer, e) {
  if (this.inErrorRecoveryMode(recognizer)) {
    return ;
  }
  this.beginErrorCondition(recognizer);
  if (e instanceof NoViableAltException) {
    this.reportNoViableAlternative(recognizer, e);
  } else if (e instanceof InputMismatchException) {
    this.reportInputMismatch(recognizer, e);
  } else if (e instanceof FailedPredicateException) {
    this.reportFailedPredicate(recognizer, e);
  } else {
    console.log("unknown recognition error type: " + e.constructor.name);
    console.log(e.stack);
    recognizer.notifyErrorListeners(e.getOffendingToken(), e.getMessage(), e);
  }
};
DefaultErrorStrategy.prototype.recover = function(recognizer, e) {
  if (this.lastErrorIndex === recognizer.getInputStream().index && this.lastErrorStates !== null && this.lastErrorStates.indexOf(recognizer.state) >= 0) {
    recognizer.consume();
  }
  this.lastErrorIndex = recognizer._input.index;
  if (this.lastErrorStates === null) {
    this.lastErrorStates = [];
  }
  this.lastErrorStates.push(recognizer.state);
  var followSet = this.getErrorRecoverySet(recognizer);
  this.consumeUntil(recognizer, followSet);
};
DefaultErrorStrategy.prototype.sync = function(recognizer) {
  if (this.inErrorRecoveryMode(recognizer)) {
    return ;
  }
  var s = recognizer._interp.atn.states[recognizer.state];
  var la = recognizer.getTokenStream().LA(1);
  if (la === Token.EOF || recognizer.atn.nextTokens(s).contains(la)) {
    return ;
  }
  if (recognizer.isExpectedToken(la)) {
    return ;
  }
  switch (s.stateType) {
    case ATNState.BLOCK_START:
    case ATNState.STAR_BLOCK_START:
    case ATNState.PLUS_BLOCK_START:
    case ATNState.STAR_LOOP_ENTRY:
      if (this.singleTokenDeletion(recognizer) !== null) {
        return ;
      } else {
        throw new InputMismatchException(recognizer);
      }
      break;
    case ATNState.PLUS_LOOP_BACK:
    case ATNState.STAR_LOOP_BACK:
      this.reportUnwantedToken(recognizer);
      var expecting = recognizer.getExpectedTokens();
      var whatFollowsLoopIterationOrRule = expecting.addSet(this.getErrorRecoverySet(recognizer));
      this.consumeUntil(recognizer, whatFollowsLoopIterationOrRule);
      break;
    default:
  }
};
DefaultErrorStrategy.prototype.reportNoViableAlternative = function(recognizer, e) {
  var tokens = recognizer.getTokenStream();
  var input;
  if (tokens !== null) {
    if (e.startToken.type === Token.EOF) {
      input = "<EOF>";
    } else {
      input = tokens.getText(new Interval(e.startToken, e.offendingToken));
    }
  } else {
    input = "<unknown input>";
  }
  var msg = "no viable alternative at input " + this.escapeWSAndQuote(input);
  recognizer.notifyErrorListeners(msg, e.offendingToken, e);
};
DefaultErrorStrategy.prototype.reportInputMismatch = function(recognizer, e) {
  var msg = "mismatched input " + this.getTokenErrorDisplay(e.offendingToken) + " expecting " + e.getExpectedTokens().toString(recognizer.literalNames, recognizer.symbolicNames);
  recognizer.notifyErrorListeners(msg, e.offendingToken, e);
};
DefaultErrorStrategy.prototype.reportFailedPredicate = function(recognizer, e) {
  var ruleName = recognizer.ruleNames[recognizer._ctx.ruleIndex];
  var msg = "rule " + ruleName + " " + e.message;
  recognizer.notifyErrorListeners(msg, e.offendingToken, e);
};
DefaultErrorStrategy.prototype.reportUnwantedToken = function(recognizer) {
  if (this.inErrorRecoveryMode(recognizer)) {
    return ;
  }
  this.beginErrorCondition(recognizer);
  var t = recognizer.getCurrentToken();
  var tokenName = this.getTokenErrorDisplay(t);
  var expecting = this.getExpectedTokens(recognizer);
  var msg = "extraneous input " + tokenName + " expecting " + expecting.toString(recognizer.literalNames, recognizer.symbolicNames);
  recognizer.notifyErrorListeners(msg, t, null);
};
DefaultErrorStrategy.prototype.reportMissingToken = function(recognizer) {
  if (this.inErrorRecoveryMode(recognizer)) {
    return ;
  }
  this.beginErrorCondition(recognizer);
  var t = recognizer.getCurrentToken();
  var expecting = this.getExpectedTokens(recognizer);
  var msg = "missing " + expecting.toString(recognizer.literalNames, recognizer.symbolicNames) + " at " + this.getTokenErrorDisplay(t);
  recognizer.notifyErrorListeners(msg, t, null);
};
DefaultErrorStrategy.prototype.recoverInline = function(recognizer) {
  var matchedSymbol = this.singleTokenDeletion(recognizer);
  if (matchedSymbol !== null) {
    recognizer.consume();
    return matchedSymbol;
  }
  if (this.singleTokenInsertion(recognizer)) {
    return this.getMissingSymbol(recognizer);
  }
  throw new InputMismatchException(recognizer);
};
DefaultErrorStrategy.prototype.singleTokenInsertion = function(recognizer) {
  var currentSymbolType = recognizer.getTokenStream().LA(1);
  var atn = recognizer._interp.atn;
  var currentState = atn.states[recognizer.state];
  var next = currentState.transitions[0].target;
  var expectingAtLL2 = atn.nextTokens(next, recognizer._ctx);
  if (expectingAtLL2.contains(currentSymbolType)) {
    this.reportMissingToken(recognizer);
    return true;
  } else {
    return false;
  }
};
DefaultErrorStrategy.prototype.singleTokenDeletion = function(recognizer) {
  var nextTokenType = recognizer.getTokenStream().LA(2);
  var expecting = this.getExpectedTokens(recognizer);
  if (expecting.contains(nextTokenType)) {
    this.reportUnwantedToken(recognizer);
    recognizer.consume();
    var matchedSymbol = recognizer.getCurrentToken();
    this.reportMatch(recognizer);
    return matchedSymbol;
  } else {
    return null;
  }
};
DefaultErrorStrategy.prototype.getMissingSymbol = function(recognizer) {
  var currentSymbol = recognizer.getCurrentToken();
  var expecting = this.getExpectedTokens(recognizer);
  var expectedTokenType = expecting.first();
  var tokenText;
  if (expectedTokenType === Token.EOF) {
    tokenText = "<missing EOF>";
  } else {
    tokenText = "<missing " + recognizer.literalNames[expectedTokenType] + ">";
  }
  var current = currentSymbol;
  var lookback = recognizer.getTokenStream().LT(-1);
  if (current.type === Token.EOF && lookback !== null) {
    current = lookback;
  }
  return recognizer.getTokenFactory().create(current.source, expectedTokenType, tokenText, Token.DEFAULT_CHANNEL, -1, -1, current.line, current.column);
};
DefaultErrorStrategy.prototype.getExpectedTokens = function(recognizer) {
  return recognizer.getExpectedTokens();
};
DefaultErrorStrategy.prototype.getTokenErrorDisplay = function(t) {
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
  return this.escapeWSAndQuote(s);
};
DefaultErrorStrategy.prototype.escapeWSAndQuote = function(s) {
  s = s.replace(/\n/g, "\\n");
  s = s.replace(/\r/g, "\\r");
  s = s.replace(/\t/g, "\\t");
  return "'" + s + "'";
};
DefaultErrorStrategy.prototype.getErrorRecoverySet = function(recognizer) {
  var atn = recognizer._interp.atn;
  var ctx = recognizer._ctx;
  var recoverSet = new IntervalSet();
  while (ctx !== null && ctx.invokingState >= 0) {
    var invokingState = atn.states[ctx.invokingState];
    var rt = invokingState.transitions[0];
    var follow = atn.nextTokens(rt.followState);
    recoverSet.addSet(follow);
    ctx = ctx.parentCtx;
  }
  recoverSet.removeOne(Token.EPSILON);
  return recoverSet;
};
DefaultErrorStrategy.prototype.consumeUntil = function(recognizer, set) {
  var ttype = recognizer.getTokenStream().LA(1);
  while (ttype !== Token.EOF && !set.contains(ttype)) {
    recognizer.consume();
    ttype = recognizer.getTokenStream().LA(1);
  }
};
function BailErrorStrategy() {
  DefaultErrorStrategy.call(this);
  return this;
}
BailErrorStrategy.prototype = Object.create(DefaultErrorStrategy.prototype);
BailErrorStrategy.prototype.constructor = BailErrorStrategy;
BailErrorStrategy.prototype.recover = function(recognizer, e) {
  var context = recognizer._ctx;
  while (context !== null) {
    context.exception = e;
    context = context.parentCtx;
  }
  throw new ParseCancellationException(e);
};
BailErrorStrategy.prototype.recoverInline = function(recognizer) {
  this.recover(recognizer, new InputMismatchException(recognizer));
};
BailErrorStrategy.prototype.sync = function(recognizer) {};
exports.BailErrorStrategy = BailErrorStrategy;
exports.DefaultErrorStrategy = DefaultErrorStrategy;
