/* */ 
var LL1Analyzer = require("../LL1Analyzer").LL1Analyzer;
var IntervalSet = require("../IntervalSet").IntervalSet;
function ATN(grammarType, maxTokenType) {
  this.grammarType = grammarType;
  this.maxTokenType = maxTokenType;
  this.states = [];
  this.decisionToState = [];
  this.ruleToStartState = [];
  this.ruleToStopState = null;
  this.modeNameToStartState = {};
  this.ruleToTokenType = null;
  this.lexerActions = null;
  this.modeToStartState = [];
  return this;
}
ATN.prototype.nextTokensInContext = function(s, ctx) {
  var anal = new LL1Analyzer(this);
  return anal.LOOK(s, null, ctx);
};
ATN.prototype.nextTokensNoContext = function(s) {
  if (s.nextTokenWithinRule !== null) {
    return s.nextTokenWithinRule;
  }
  s.nextTokenWithinRule = this.nextTokensInContext(s, null);
  s.nextTokenWithinRule.readonly = true;
  return s.nextTokenWithinRule;
};
ATN.prototype.nextTokens = function(s, ctx) {
  if (ctx === undefined) {
    return this.nextTokensNoContext(s);
  } else {
    return this.nextTokensInContext(s, ctx);
  }
};
ATN.prototype.addState = function(state) {
  if (state !== null) {
    state.atn = this;
    state.stateNumber = this.states.length;
  }
  this.states.push(state);
};
ATN.prototype.removeState = function(state) {
  this.states[state.stateNumber] = null;
};
ATN.prototype.defineDecisionState = function(s) {
  this.decisionToState.push(s);
  s.decision = this.decisionToState.length - 1;
  return s.decision;
};
ATN.prototype.getDecisionState = function(decision) {
  if (this.decisionToState.length === 0) {
    return null;
  } else {
    return this.decisionToState[decision];
  }
};
var Token = require("../Token").Token;
ATN.prototype.getExpectedTokens = function(stateNumber, ctx) {
  if (stateNumber < 0 || stateNumber >= this.states.length) {
    throw ("Invalid state number.");
  }
  var s = this.states[stateNumber];
  var following = this.nextTokens(s);
  if (!following.contains(Token.EPSILON)) {
    return following;
  }
  var expected = new IntervalSet();
  expected.addSet(following);
  expected.removeOne(Token.EPSILON);
  while (ctx !== null && ctx.invokingState >= 0 && following.contains(Token.EPSILON)) {
    var invokingState = this.states[ctx.invokingState];
    var rt = invokingState.transitions[0];
    following = this.nextTokens(rt.followState);
    expected.addSet(following);
    expected.removeOne(Token.EPSILON);
    ctx = ctx.parentCtx;
  }
  if (following.contains(Token.EPSILON)) {
    expected.addOne(Token.EOF);
  }
  return expected;
};
ATN.INVALID_ALT_NUMBER = 0;
exports.ATN = ATN;
