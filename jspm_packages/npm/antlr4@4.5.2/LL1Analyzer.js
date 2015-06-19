/* */ 
var Set = require("./Utils").Set;
var BitSet = require("./Utils").BitSet;
var Token = require("./Token").Token;
var ATNConfig = require("./atn/ATNConfig").ATNConfig;
var Interval = require("./IntervalSet").Interval;
var IntervalSet = require("./IntervalSet").IntervalSet;
var RuleStopState = require("./atn/ATNState").RuleStopState;
var RuleTransition = require("./atn/Transition").RuleTransition;
var NotSetTransition = require("./atn/Transition").NotSetTransition;
var WildcardTransition = require("./atn/Transition").WildcardTransition;
var AbstractPredicateTransition = require("./atn/Transition").AbstractPredicateTransition;
var pc = require("./PredictionContext");
var predictionContextFromRuleContext = pc.predictionContextFromRuleContext;
var PredictionContext = pc.PredictionContext;
var SingletonPredictionContext = pc.SingletonPredictionContext;
function LL1Analyzer(atn) {
  this.atn = atn;
}
LL1Analyzer.HIT_PRED = Token.INVALID_TYPE;
LL1Analyzer.prototype.getDecisionLookahead = function(s) {
  if (s === null) {
    return null;
  }
  var count = s.transitions.length;
  var look = [];
  for (var alt = 0; alt < count; alt++) {
    look[alt] = new IntervalSet();
    var lookBusy = new Set();
    var seeThruPreds = false;
    this._LOOK(s.transition(alt).target, null, PredictionContext.EMPTY, look[alt], lookBusy, new BitSet(), seeThruPreds, false);
    if (look[alt].length === 0 || look[alt].contains(LL1Analyzer.HIT_PRED)) {
      look[alt] = null;
    }
  }
  return look;
};
LL1Analyzer.prototype.LOOK = function(s, stopState, ctx) {
  var r = new IntervalSet();
  var seeThruPreds = true;
  ctx = ctx || null;
  var lookContext = ctx !== null ? predictionContextFromRuleContext(s.atn, ctx) : null;
  this._LOOK(s, stopState, lookContext, r, new Set(), new BitSet(), seeThruPreds, true);
  return r;
};
LL1Analyzer.prototype._LOOK = function(s, stopState, ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF) {
  var c = new ATNConfig({
    state: s,
    alt: 0
  }, ctx);
  if (lookBusy.contains(c)) {
    return ;
  }
  lookBusy.add(c);
  if (s === stopState) {
    if (ctx === null) {
      look.addOne(Token.EPSILON);
      return ;
    } else if (ctx.isEmpty() && addEOF) {
      look.addOne(Token.EOF);
      return ;
    }
  }
  if (s instanceof RuleStopState) {
    if (ctx === null) {
      look.addOne(Token.EPSILON);
      return ;
    } else if (ctx.isEmpty() && addEOF) {
      look.addOne(Token.EOF);
      return ;
    }
    if (ctx !== PredictionContext.EMPTY) {
      for (var i = 0; i < ctx.length; i++) {
        var returnState = this.atn.states[ctx.getReturnState(i)];
        var removed = calledRuleStack.contains(returnState.ruleIndex);
        try {
          calledRuleStack.remove(returnState.ruleIndex);
          this._LOOK(returnState, stopState, ctx.getParent(i), look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
        } finally {
          if (removed) {
            calledRuleStack.add(returnState.ruleIndex);
          }
        }
      }
      return ;
    }
  }
  for (var j = 0; j < s.transitions.length; j++) {
    var t = s.transitions[j];
    if (t.constructor === RuleTransition) {
      if (calledRuleStack.contains(t.target.ruleIndex)) {
        continue;
      }
      var newContext = SingletonPredictionContext.create(ctx, t.followState.stateNumber);
      try {
        calledRuleStack.add(t.target.ruleIndex);
        this._LOOK(t.target, stopState, newContext, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
      } finally {
        calledRuleStack.remove(t.target.ruleIndex);
      }
    } else if (t instanceof AbstractPredicateTransition) {
      if (seeThruPreds) {
        this._LOOK(t.target, stopState, ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
      } else {
        look.addOne(LL1Analyzer.HIT_PRED);
      }
    } else if (t.isEpsilon) {
      this._LOOK(t.target, stopState, ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
    } else if (t.constructor === WildcardTransition) {
      look.addRange(Token.MIN_USER_TOKEN_TYPE, this.atn.maxTokenType);
    } else {
      var set = t.label;
      if (set !== null) {
        if (t instanceof NotSetTransition) {
          set = set.complement(Token.MIN_USER_TOKEN_TYPE, this.atn.maxTokenType);
        }
        look.addSet(set);
      }
    }
  }
};
exports.LL1Analyzer = LL1Analyzer;
