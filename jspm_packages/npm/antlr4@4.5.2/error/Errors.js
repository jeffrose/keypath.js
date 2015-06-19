/* */ 
var PredicateTransition = require("../atn/Transition").PredicateTransition;
function RecognitionException(params) {
  Error.call(this);
  if (!!Error.captureStackTrace) {
    Error.captureStackTrace(this, RecognitionException);
  } else {
    var stack = new Error().stack;
  }
  this.message = params.message;
  this.recognizer = params.recognizer;
  this.input = params.input;
  this.ctx = params.ctx;
  this.offendingToken = null;
  this.offendingState = -1;
  if (this.recognizer !== null) {
    this.offendingState = this.recognizer.state;
  }
  return this;
}
RecognitionException.prototype = Object.create(Error.prototype);
RecognitionException.prototype.constructor = RecognitionException;
RecognitionException.prototype.getExpectedTokens = function() {
  if (this.recognizer !== null) {
    return this.recognizer.atn.getExpectedTokens(this.offendingState, this.ctx);
  } else {
    return null;
  }
};
RecognitionException.prototype.toString = function() {
  return this.message;
};
function LexerNoViableAltException(lexer, input, startIndex, deadEndConfigs) {
  RecognitionException.call(this, {
    message: "",
    recognizer: lexer,
    input: input,
    ctx: null
  });
  this.startIndex = startIndex;
  this.deadEndConfigs = deadEndConfigs;
  return this;
}
LexerNoViableAltException.prototype = Object.create(RecognitionException.prototype);
LexerNoViableAltException.prototype.constructor = LexerNoViableAltException;
LexerNoViableAltException.prototype.toString = function() {
  var symbol = "";
  if (this.startIndex >= 0 && this.startIndex < this.input.size) {
    symbol = this.input.getText((this.startIndex, this.startIndex));
  }
  return "LexerNoViableAltException" + symbol;
};
function NoViableAltException(recognizer, input, startToken, offendingToken, deadEndConfigs, ctx) {
  ctx = ctx || recognizer._ctx;
  offendingToken = offendingToken || recognizer.getCurrentToken();
  startToken = startToken || recognizer.getCurrentToken();
  input = input || recognizer.getInputStream();
  RecognitionException.call(this, {
    message: "",
    recognizer: recognizer,
    input: input,
    ctx: ctx
  });
  this.deadEndConfigs = deadEndConfigs;
  this.startToken = startToken;
  this.offendingToken = offendingToken;
}
NoViableAltException.prototype = Object.create(RecognitionException.prototype);
NoViableAltException.prototype.constructor = NoViableAltException;
function InputMismatchException(recognizer) {
  RecognitionException.call(this, {
    message: "",
    recognizer: recognizer,
    input: recognizer.getInputStream(),
    ctx: recognizer._ctx
  });
  this.offendingToken = recognizer.getCurrentToken();
}
InputMismatchException.prototype = Object.create(RecognitionException.prototype);
InputMismatchException.prototype.constructor = InputMismatchException;
function FailedPredicateException(recognizer, predicate, message) {
  RecognitionException.call(this, {
    message: this.formatMessage(predicate, message || null),
    recognizer: recognizer,
    input: recognizer.getInputStream(),
    ctx: recognizer._ctx
  });
  var s = recognizer._interp.atn.states[recognizer.state];
  var trans = s.transitions[0];
  if (trans instanceof PredicateTransition) {
    this.ruleIndex = trans.ruleIndex;
    this.predicateIndex = trans.predIndex;
  } else {
    this.ruleIndex = 0;
    this.predicateIndex = 0;
  }
  this.predicate = predicate;
  this.offendingToken = recognizer.getCurrentToken();
  return this;
}
FailedPredicateException.prototype = Object.create(RecognitionException.prototype);
FailedPredicateException.prototype.constructor = FailedPredicateException;
FailedPredicateException.prototype.formatMessage = function(predicate, message) {
  if (message !== null) {
    return message;
  } else {
    return "failed predicate: {" + predicate + "}?";
  }
};
function ParseCancellationException() {
  Error.call(this);
  Error.captureStackTrace(this, ParseCancellationException);
  return this;
}
ParseCancellationException.prototype = Object.create(Error.prototype);
ParseCancellationException.prototype.constructor = ParseCancellationException;
exports.RecognitionException = RecognitionException;
exports.NoViableAltException = NoViableAltException;
exports.LexerNoViableAltException = LexerNoViableAltException;
exports.InputMismatchException = InputMismatchException;
exports.FailedPredicateException = FailedPredicateException;
