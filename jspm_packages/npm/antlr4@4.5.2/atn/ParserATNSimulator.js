/* */ 
(function(process) {
  var Utils = require("../Utils");
  var Set = Utils.Set;
  var BitSet = Utils.BitSet;
  var DoubleDict = Utils.DoubleDict;
  var ATN = require("./ATN").ATN;
  var ATNConfig = require("./ATNConfig").ATNConfig;
  var ATNConfigSet = require("./ATNConfigSet").ATNConfigSet;
  var Token = require("../Token").Token;
  var DFAState = require("../dfa/DFAState").DFAState;
  var PredPrediction = require("../dfa/DFAState").PredPrediction;
  var ATNSimulator = require("./ATNSimulator").ATNSimulator;
  var PredictionMode = require("./PredictionMode").PredictionMode;
  var RuleContext = require("../RuleContext").RuleContext;
  var ParserRuleContext = require("../ParserRuleContext").ParserRuleContext;
  var SemanticContext = require("./SemanticContext").SemanticContext;
  var StarLoopEntryState = require("./ATNState").StarLoopEntryState;
  var RuleStopState = require("./ATNState").RuleStopState;
  var PredictionContext = require("../PredictionContext").PredictionContext;
  var Interval = require("../IntervalSet").Interval;
  var Transitions = require("./Transition");
  var Transition = Transitions.Transition;
  var SetTransition = Transitions.SetTransition;
  var NotSetTransition = Transitions.NotSetTransition;
  var RuleTransition = Transitions.RuleTransition;
  var ActionTransition = Transitions.ActionTransition;
  var NoViableAltException = require("../error/Errors").NoViableAltException;
  var SingletonPredictionContext = require("../PredictionContext").SingletonPredictionContext;
  var predictionContextFromRuleContext = require("../PredictionContext").predictionContextFromRuleContext;
  function ParserATNSimulator(parser, atn, decisionToDFA, sharedContextCache) {
    ATNSimulator.call(this, atn, sharedContextCache);
    this.parser = parser;
    this.decisionToDFA = decisionToDFA;
    this.predictionMode = PredictionMode.LL;
    this._input = null;
    this._startIndex = 0;
    this._outerContext = null;
    this._dfa = null;
    this.mergeCache = null;
    return this;
  }
  ParserATNSimulator.prototype = Object.create(ATNSimulator.prototype);
  ParserATNSimulator.prototype.constructor = ParserATNSimulator;
  ParserATNSimulator.prototype.debug = false;
  ParserATNSimulator.prototype.debug_list_atn_decisions = false;
  ParserATNSimulator.prototype.dfa_debug = false;
  ParserATNSimulator.prototype.retry_debug = false;
  ParserATNSimulator.prototype.reset = function() {};
  ParserATNSimulator.prototype.adaptivePredict = function(input, decision, outerContext) {
    if (this.debug || this.debug_list_atn_decisions) {
      console.log("adaptivePredict decision " + decision + " exec LA(1)==" + this.getLookaheadName(input) + " line " + input.LT(1).line + ":" + input.LT(1).column);
    }
    this._input = input;
    this._startIndex = input.index;
    this._outerContext = outerContext;
    var dfa = this.decisionToDFA[decision];
    this._dfa = dfa;
    var m = input.mark();
    var index = input.index;
    try {
      var s0;
      if (dfa.precedenceDfa) {
        s0 = dfa.getPrecedenceStartState(this.parser.getPrecedence());
      } else {
        s0 = dfa.s0;
      }
      if (s0 === null) {
        if (outerContext === null) {
          outerContext = RuleContext.EMPTY;
        }
        if (this.debug || this.debug_list_atn_decisions) {
          console.log("predictATN decision " + dfa.decision + " exec LA(1)==" + this.getLookaheadName(input) + ", outerContext=" + outerContext.toString(this.parser.ruleNames));
        }
        if (!dfa.precedenceDfa && (dfa.atnStartState instanceof StarLoopEntryState)) {
          if (dfa.atnStartState.precedenceRuleDecision) {
            dfa.setPrecedenceDfa(true);
          }
        }
        var fullCtx = false;
        var s0_closure = this.computeStartState(dfa.atnStartState, RuleContext.EMPTY, fullCtx);
        if (dfa.precedenceDfa) {
          s0_closure = this.applyPrecedenceFilter(s0_closure);
          s0 = this.addDFAState(dfa, new DFAState(null, s0_closure));
          dfa.setPrecedenceStartState(this.parser.getPrecedence(), s0);
        } else {
          s0 = this.addDFAState(dfa, new DFAState(null, s0_closure));
          dfa.s0 = s0;
        }
      }
      var alt = this.execATN(dfa, s0, input, index, outerContext);
      if (this.debug) {
        console.log("DFA after predictATN: " + dfa.toString(this.parser.literalNames));
      }
      return alt;
    } finally {
      this._dfa = null;
      this.mergeCache = null;
      input.seek(index);
      input.release(m);
    }
  };
  ParserATNSimulator.prototype.execATN = function(dfa, s0, input, startIndex, outerContext) {
    if (this.debug || this.debug_list_atn_decisions) {
      console.log("execATN decision " + dfa.decision + " exec LA(1)==" + this.getLookaheadName(input) + " line " + input.LT(1).line + ":" + input.LT(1).column);
    }
    var alt;
    var previousD = s0;
    if (this.debug) {
      console.log("s0 = " + s0);
    }
    var t = input.LA(1);
    while (true) {
      var D = this.getExistingTargetState(previousD, t);
      if (D === null) {
        D = this.computeTargetState(dfa, previousD, t);
      }
      if (D === ATNSimulator.ERROR) {
        var e = this.noViableAlt(input, outerContext, previousD.configs, startIndex);
        input.seek(startIndex);
        alt = this.getSynValidOrSemInvalidAltThatFinishedDecisionEntryRule(previousD.configs, outerContext);
        if (alt !== ATN.INVALID_ALT_NUMBER) {
          return alt;
        } else {
          throw e;
        }
      }
      if (D.requiresFullContext && this.predictionMode !== PredictionMode.SLL) {
        var conflictingAlts = null;
        if (D.predicates !== null) {
          if (this.debug) {
            console.log("DFA state has preds in DFA sim LL failover");
          }
          var conflictIndex = input.index;
          if (conflictIndex !== startIndex) {
            input.seek(startIndex);
          }
          conflictingAlts = this.evalSemanticContext(D.predicates, outerContext, true);
          if (conflictingAlts.length === 1) {
            if (this.debug) {
              console.log("Full LL avoided");
            }
            return conflictingAlts.minValue();
          }
          if (conflictIndex !== startIndex) {
            input.seek(conflictIndex);
          }
        }
        if (this.dfa_debug) {
          console.log("ctx sensitive state " + outerContext + " in " + D);
        }
        var fullCtx = true;
        var s0_closure = this.computeStartState(dfa.atnStartState, outerContext, fullCtx);
        this.reportAttemptingFullContext(dfa, conflictingAlts, D.configs, startIndex, input.index);
        alt = this.execATNWithFullContext(dfa, D, s0_closure, input, startIndex, outerContext);
        return alt;
      }
      if (D.isAcceptState) {
        if (D.predicates === null) {
          return D.prediction;
        }
        var stopIndex = input.index;
        input.seek(startIndex);
        var alts = this.evalSemanticContext(D.predicates, outerContext, true);
        if (alts.length === 0) {
          throw this.noViableAlt(input, outerContext, D.configs, startIndex);
        } else if (alts.length === 1) {
          return alts.minValue();
        } else {
          this.reportAmbiguity(dfa, D, startIndex, stopIndex, false, alts, D.configs);
          return alts.minValue();
        }
      }
      previousD = D;
      if (t !== Token.EOF) {
        input.consume();
        t = input.LA(1);
      }
    }
  };
  ParserATNSimulator.prototype.getExistingTargetState = function(previousD, t) {
    var edges = previousD.edges;
    if (edges === null) {
      return null;
    } else {
      return edges[t + 1] || null;
    }
  };
  ParserATNSimulator.prototype.computeTargetState = function(dfa, previousD, t) {
    var reach = this.computeReachSet(previousD.configs, t, false);
    if (reach === null) {
      this.addDFAEdge(dfa, previousD, t, ATNSimulator.ERROR);
      return ATNSimulator.ERROR;
    }
    var D = new DFAState(null, reach);
    var predictedAlt = this.getUniqueAlt(reach);
    if (this.debug) {
      var altSubSets = PredictionMode.getConflictingAltSubsets(reach);
      console.log("SLL altSubSets=" + Utils.arrayToString(altSubSets) + ", previous=" + previousD.configs + ", configs=" + reach + ", predict=" + predictedAlt + ", allSubsetsConflict=" + PredictionMode.allSubsetsConflict(altSubSets) + ", conflictingAlts=" + this.getConflictingAlts(reach));
    }
    if (predictedAlt !== ATN.INVALID_ALT_NUMBER) {
      D.isAcceptState = true;
      D.configs.uniqueAlt = predictedAlt;
      D.prediction = predictedAlt;
    } else if (PredictionMode.hasSLLConflictTerminatingPrediction(this.predictionMode, reach)) {
      D.configs.conflictingAlts = this.getConflictingAlts(reach);
      D.requiresFullContext = true;
      D.isAcceptState = true;
      D.prediction = D.configs.conflictingAlts.minValue();
    }
    if (D.isAcceptState && D.configs.hasSemanticContext) {
      this.predicateDFAState(D, this.atn.getDecisionState(dfa.decision));
      if (D.predicates !== null) {
        D.prediction = ATN.INVALID_ALT_NUMBER;
      }
    }
    D = this.addDFAEdge(dfa, previousD, t, D);
    return D;
  };
  ParserATNSimulator.prototype.predicateDFAState = function(dfaState, decisionState) {
    var nalts = decisionState.transitions.length;
    var altsToCollectPredsFrom = this.getConflictingAltsOrUniqueAlt(dfaState.configs);
    var altToPred = this.getPredsForAmbigAlts(altsToCollectPredsFrom, dfaState.configs, nalts);
    if (altToPred !== null) {
      dfaState.predicates = this.getPredicatePredictions(altsToCollectPredsFrom, altToPred);
      dfaState.prediction = ATN.INVALID_ALT_NUMBER;
    } else {
      dfaState.prediction = altsToCollectPredsFrom.minValue();
    }
  };
  ParserATNSimulator.prototype.execATNWithFullContext = function(dfa, D, s0, input, startIndex, outerContext) {
    if (this.debug || this.debug_list_atn_decisions) {
      console.log("execATNWithFullContext " + s0);
    }
    var fullCtx = true;
    var foundExactAmbig = false;
    var reach = null;
    var previous = s0;
    input.seek(startIndex);
    var t = input.LA(1);
    var predictedAlt = -1;
    while (true) {
      reach = this.computeReachSet(previous, t, fullCtx);
      if (reach === null) {
        var e = this.noViableAlt(input, outerContext, previous, startIndex);
        input.seek(startIndex);
        var alt = this.getSynValidOrSemInvalidAltThatFinishedDecisionEntryRule(previous, outerContext);
        if (alt !== ATN.INVALID_ALT_NUMBER) {
          return alt;
        } else {
          throw e;
        }
      }
      var altSubSets = PredictionMode.getConflictingAltSubsets(reach);
      if (this.debug) {
        console.log("LL altSubSets=" + altSubSets + ", predict=" + PredictionMode.getUniqueAlt(altSubSets) + ", resolvesToJustOneViableAlt=" + PredictionMode.resolvesToJustOneViableAlt(altSubSets));
      }
      reach.uniqueAlt = this.getUniqueAlt(reach);
      if (reach.uniqueAlt !== ATN.INVALID_ALT_NUMBER) {
        predictedAlt = reach.uniqueAlt;
        break;
      } else if (this.predictionMode !== PredictionMode.LL_EXACT_AMBIG_DETECTION) {
        predictedAlt = PredictionMode.resolvesToJustOneViableAlt(altSubSets);
        if (predictedAlt !== ATN.INVALID_ALT_NUMBER) {
          break;
        }
      } else {
        if (PredictionMode.allSubsetsConflict(altSubSets) && PredictionMode.allSubsetsEqual(altSubSets)) {
          foundExactAmbig = true;
          predictedAlt = PredictionMode.getSingleViableAlt(altSubSets);
          break;
        }
      }
      previous = reach;
      if (t !== Token.EOF) {
        input.consume();
        t = input.LA(1);
      }
    }
    if (reach.uniqueAlt !== ATN.INVALID_ALT_NUMBER) {
      this.reportContextSensitivity(dfa, predictedAlt, reach, startIndex, input.index);
      return predictedAlt;
    }
    this.reportAmbiguity(dfa, D, startIndex, input.index, foundExactAmbig, null, reach);
    return predictedAlt;
  };
  ParserATNSimulator.prototype.computeReachSet = function(closure, t, fullCtx) {
    if (this.debug) {
      console.log("in computeReachSet, starting closure: " + closure);
    }
    if (this.mergeCache === null) {
      this.mergeCache = new DoubleDict();
    }
    var intermediate = new ATNConfigSet(fullCtx);
    var skippedStopStates = null;
    for (var i = 0; i < closure.items.length; i++) {
      var c = closure.items[i];
      if (this.debug) {
        console.log("testing " + this.getTokenName(t) + " at " + c);
      }
      if (c.state instanceof RuleStopState) {
        if (fullCtx || t === Token.EOF) {
          if (skippedStopStates === null) {
            skippedStopStates = [];
          }
          skippedStopStates.push(c);
          if (this.debug) {
            console.log("added " + c + " to skippedStopStates");
          }
        }
        continue;
      }
      for (var j = 0; j < c.state.transitions.length; j++) {
        var trans = c.state.transitions[j];
        var target = this.getReachableTarget(trans, t);
        if (target !== null) {
          var cfg = new ATNConfig({state: target}, c);
          intermediate.add(cfg, this.mergeCache);
          if (this.debug) {
            console.log("added " + cfg + " to intermediate");
          }
        }
      }
    }
    var reach = null;
    if (skippedStopStates === null && t !== Token.EOF) {
      if (intermediate.items.length === 1) {
        reach = intermediate;
      } else if (this.getUniqueAlt(intermediate) !== ATN.INVALID_ALT_NUMBER) {
        reach = intermediate;
      }
    }
    if (reach === null) {
      reach = new ATNConfigSet(fullCtx);
      var closureBusy = new Set();
      var treatEofAsEpsilon = t === Token.EOF;
      for (var k = 0; k < intermediate.items.length; k++) {
        this.closure(intermediate.items[k], reach, closureBusy, false, fullCtx, treatEofAsEpsilon);
      }
    }
    if (t === Token.EOF) {
      reach = this.removeAllConfigsNotInRuleStopState(reach, reach === intermediate);
    }
    if (skippedStopStates !== null && ((!fullCtx) || (!PredictionMode.hasConfigInRuleStopState(reach)))) {
      for (var l = 0; l < skippedStopStates.length; l++) {
        reach.add(skippedStopStates[l], this.mergeCache);
      }
    }
    if (reach.items.length === 0) {
      return null;
    } else {
      return reach;
    }
  };
  ParserATNSimulator.prototype.removeAllConfigsNotInRuleStopState = function(configs, lookToEndOfRule) {
    if (PredictionMode.allConfigsInRuleStopStates(configs)) {
      return configs;
    }
    var result = new ATNConfigSet(configs.fullCtx);
    for (var i = 0; i < configs.items.length; i++) {
      var config = configs.items[i];
      if (config.state instanceof RuleStopState) {
        result.add(config, this.mergeCache);
        continue;
      }
      if (lookToEndOfRule && config.state.epsilonOnlyTransitions) {
        var nextTokens = this.atn.nextTokens(config.state);
        if (nextTokens.contains(Token.EPSILON)) {
          var endOfRuleState = this.atn.ruleToStopState[config.state.ruleIndex];
          result.add(new ATNConfig({state: endOfRuleState}, config), this.mergeCache);
        }
      }
    }
    return result;
  };
  ParserATNSimulator.prototype.computeStartState = function(p, ctx, fullCtx) {
    var initialContext = predictionContextFromRuleContext(this.atn, ctx);
    var configs = new ATNConfigSet(fullCtx);
    for (var i = 0; i < p.transitions.length; i++) {
      var target = p.transitions[i].target;
      var c = new ATNConfig({
        state: target,
        alt: i + 1,
        context: initialContext
      }, null);
      var closureBusy = new Set();
      this.closure(c, configs, closureBusy, true, fullCtx, false);
    }
    return configs;
  };
  ParserATNSimulator.prototype.applyPrecedenceFilter = function(configs) {
    var config;
    var statesFromAlt1 = [];
    var configSet = new ATNConfigSet(configs.fullCtx);
    for (var i = 0; i < configs.items.length; i++) {
      config = configs.items[i];
      if (config.alt !== 1) {
        continue;
      }
      var updatedContext = config.semanticContext.evalPrecedence(this.parser, this._outerContext);
      if (updatedContext === null) {
        continue;
      }
      statesFromAlt1[config.state.stateNumber] = config.context;
      if (updatedContext !== config.semanticContext) {
        configSet.add(new ATNConfig({semanticContext: updatedContext}, config), this.mergeCache);
      } else {
        configSet.add(config, this.mergeCache);
      }
    }
    for (i = 0; i < configs.items.length; i++) {
      config = configs.items[i];
      if (config.alt === 1) {
        continue;
      }
      if (!config.precedenceFilterSuppressed) {
        var context = statesFromAlt1[config.state.stateNumber] || null;
        if (context !== null && context.equals(config.context)) {
          continue;
        }
      }
      configSet.add(config, this.mergeCache);
    }
    return configSet;
  };
  ParserATNSimulator.prototype.getReachableTarget = function(trans, ttype) {
    if (trans.matches(ttype, 0, this.atn.maxTokenType)) {
      return trans.target;
    } else {
      return null;
    }
  };
  ParserATNSimulator.prototype.getPredsForAmbigAlts = function(ambigAlts, configs, nalts) {
    var altToPred = [];
    for (var i = 0; i < configs.items.length; i++) {
      var c = configs.items[i];
      if (ambigAlts.contains(c.alt)) {
        altToPred[c.alt] = SemanticContext.orContext(altToPred[c.alt] || null, c.semanticContext);
      }
    }
    var nPredAlts = 0;
    for (i = 1; i < nalts + 1; i++) {
      var pred = altToPred[i] || null;
      if (pred === null) {
        altToPred[i] = SemanticContext.NONE;
      } else if (pred !== SemanticContext.NONE) {
        nPredAlts += 1;
      }
    }
    if (nPredAlts === 0) {
      altToPred = null;
    }
    if (this.debug) {
      console.log("getPredsForAmbigAlts result " + Utils.arrayToString(altToPred));
    }
    return altToPred;
  };
  ParserATNSimulator.prototype.getPredicatePredictions = function(ambigAlts, altToPred) {
    var pairs = [];
    var containsPredicate = false;
    for (var i = 1; i < altToPred.length; i++) {
      var pred = altToPred[i];
      if (ambigAlts !== null && ambigAlts.contains(i)) {
        pairs.push(new PredPrediction(pred, i));
      }
      if (pred !== SemanticContext.NONE) {
        containsPredicate = true;
      }
    }
    if (!containsPredicate) {
      return null;
    }
    return pairs;
  };
  ParserATNSimulator.prototype.getSynValidOrSemInvalidAltThatFinishedDecisionEntryRule = function(configs, outerContext) {
    var cfgs = this.splitAccordingToSemanticValidity(configs, outerContext);
    var semValidConfigs = cfgs[0];
    var semInvalidConfigs = cfgs[1];
    var alt = this.getAltThatFinishedDecisionEntryRule(semValidConfigs);
    if (alt !== ATN.INVALID_ALT_NUMBER) {
      return alt;
    }
    if (semInvalidConfigs.items.length > 0) {
      alt = this.getAltThatFinishedDecisionEntryRule(semInvalidConfigs);
      if (alt !== ATN.INVALID_ALT_NUMBER) {
        return alt;
      }
    }
    return ATN.INVALID_ALT_NUMBER;
  };
  ParserATNSimulator.prototype.getAltThatFinishedDecisionEntryRule = function(configs) {
    var alts = [];
    for (var i = 0; i < configs.items.length; i++) {
      var c = configs.items[i];
      if (c.reachesIntoOuterContext > 0 || ((c.state instanceof RuleStopState) && c.context.hasEmptyPath())) {
        if (alts.indexOf(c.alt) < 0) {
          alts.push(c.alt);
        }
      }
    }
    if (alts.length === 0) {
      return ATN.INVALID_ALT_NUMBER;
    } else {
      return Math.min.apply(null, alts);
    }
  };
  ParserATNSimulator.prototype.splitAccordingToSemanticValidity = function(configs, outerContext) {
    var succeeded = new ATNConfigSet(configs.fullCtx);
    var failed = new ATNConfigSet(configs.fullCtx);
    for (var i = 0; i < configs.items.length; i++) {
      var c = configs.items[i];
      if (c.semanticContext !== SemanticContext.NONE) {
        var predicateEvaluationResult = c.semanticContext.evaluate(this.parser, outerContext);
        if (predicateEvaluationResult) {
          succeeded.add(c);
        } else {
          failed.add(c);
        }
      } else {
        succeeded.add(c);
      }
    }
    return [succeeded, failed];
  };
  ParserATNSimulator.prototype.evalSemanticContext = function(predPredictions, outerContext, complete) {
    var predictions = new BitSet();
    for (var i = 0; i < predPredictions.length; i++) {
      var pair = predPredictions[i];
      if (pair.pred === SemanticContext.NONE) {
        predictions.add(pair.alt);
        if (!complete) {
          break;
        }
        continue;
      }
      var predicateEvaluationResult = pair.pred.evaluate(this.parser, outerContext);
      if (this.debug || this.dfa_debug) {
        console.log("eval pred " + pair + "=" + predicateEvaluationResult);
      }
      if (predicateEvaluationResult) {
        if (this.debug || this.dfa_debug) {
          console.log("PREDICT " + pair.alt);
        }
        predictions.add(pair.alt);
        if (!complete) {
          break;
        }
      }
    }
    return predictions;
  };
  ParserATNSimulator.prototype.closure = function(config, configs, closureBusy, collectPredicates, fullCtx, treatEofAsEpsilon) {
    var initialDepth = 0;
    this.closureCheckingStopState(config, configs, closureBusy, collectPredicates, fullCtx, initialDepth, treatEofAsEpsilon);
  };
  ParserATNSimulator.prototype.closureCheckingStopState = function(config, configs, closureBusy, collectPredicates, fullCtx, depth, treatEofAsEpsilon) {
    if (this.debug) {
      console.log("closure(" + config.toString(this.parser, true) + ")");
      console.log("configs(" + configs.toString() + ")");
      if (config.reachesIntoOuterContext > 50) {
        throw "problem";
      }
    }
    if (config.state instanceof RuleStopState) {
      if (!config.context.isEmpty()) {
        for (var i = 0; i < config.context.length; i++) {
          if (config.context.getReturnState(i) === PredictionContext.EMPTY_RETURN_STATE) {
            if (fullCtx) {
              configs.add(new ATNConfig({
                state: config.state,
                context: PredictionContext.EMPTY
              }, config), this.mergeCache);
              continue;
            } else {
              if (this.debug) {
                console.log("FALLING off rule " + this.getRuleName(config.state.ruleIndex));
              }
              this.closure_(config, configs, closureBusy, collectPredicates, fullCtx, depth, treatEofAsEpsilon);
            }
            continue;
          }
          returnState = this.atn.states[config.context.getReturnState(i)];
          newContext = config.context.getParent(i);
          var parms = {
            state: returnState,
            alt: config.alt,
            context: newContext,
            semanticContext: config.semanticContext
          };
          c = new ATNConfig(parms, null);
          c.reachesIntoOuterContext = config.reachesIntoOuterContext;
          this.closureCheckingStopState(c, configs, closureBusy, collectPredicates, fullCtx, depth - 1, treatEofAsEpsilon);
        }
        return ;
      } else if (fullCtx) {
        configs.add(config, this.mergeCache);
        return ;
      } else {
        if (this.debug) {
          console.log("FALLING off rule " + this.getRuleName(config.state.ruleIndex));
        }
      }
    }
    this.closure_(config, configs, closureBusy, collectPredicates, fullCtx, depth, treatEofAsEpsilon);
  };
  ParserATNSimulator.prototype.closure_ = function(config, configs, closureBusy, collectPredicates, fullCtx, depth, treatEofAsEpsilon) {
    var p = config.state;
    if (!p.epsilonOnlyTransitions) {
      configs.add(config, this.mergeCache);
    }
    for (var i = 0; i < p.transitions.length; i++) {
      var t = p.transitions[i];
      var continueCollecting = collectPredicates && !(t instanceof ActionTransition);
      var c = this.getEpsilonTarget(config, t, continueCollecting, depth === 0, fullCtx, treatEofAsEpsilon);
      if (c !== null) {
        if (!t.isEpsilon && closureBusy.add(c) !== c) {
          continue;
        }
        var newDepth = depth;
        if (config.state instanceof RuleStopState) {
          if (closureBusy.add(c) !== c) {
            continue;
          }
          if (this._dfa !== null && this._dfa.precedenceDfa) {
            if (t.outermostPrecedenceReturn === this._dfa.atnStartState.ruleIndex) {
              c.precedenceFilterSuppressed = true;
            }
          }
          c.reachesIntoOuterContext += 1;
          configs.dipsIntoOuterContext = true;
          newDepth -= 1;
          if (this.debug) {
            console.log("dips into outer ctx: " + c);
          }
        } else if (t instanceof RuleTransition) {
          if (newDepth >= 0) {
            newDepth += 1;
          }
        }
        this.closureCheckingStopState(c, configs, closureBusy, continueCollecting, fullCtx, newDepth, treatEofAsEpsilon);
      }
    }
  };
  ParserATNSimulator.prototype.getRuleName = function(index) {
    if (this.parser !== null && index >= 0) {
      return this.parser.ruleNames[index];
    } else {
      return "<rule " + index + ">";
    }
  };
  ParserATNSimulator.prototype.getEpsilonTarget = function(config, t, collectPredicates, inContext, fullCtx, treatEofAsEpsilon) {
    switch (t.serializationType) {
      case Transition.RULE:
        return this.ruleTransition(config, t);
      case Transition.PRECEDENCE:
        return this.precedenceTransition(config, t, collectPredicates, inContext, fullCtx);
      case Transition.PREDICATE:
        return this.predTransition(config, t, collectPredicates, inContext, fullCtx);
      case Transition.ACTION:
        return this.actionTransition(config, t);
      case Transition.EPSILON:
        return new ATNConfig({state: t.target}, config);
      case Transition.ATOM:
      case Transition.RANGE:
      case Transition.SET:
        if (treatEofAsEpsilon) {
          if (t.matches(Token.EOF, 0, 1)) {
            return new ATNConfig({state: t.target}, config);
          }
        }
        return null;
      default:
        return null;
    }
  };
  ParserATNSimulator.prototype.actionTransition = function(config, t) {
    if (this.debug) {
      console.log("ACTION edge " + t.ruleIndex + ":" + t.actionIndex);
    }
    return new ATNConfig({state: t.target}, config);
  };
  ParserATNSimulator.prototype.precedenceTransition = function(config, pt, collectPredicates, inContext, fullCtx) {
    if (this.debug) {
      console.log("PRED (collectPredicates=" + collectPredicates + ") " + pt.precedence + ">=_p, ctx dependent=true");
      if (this.parser !== null) {
        console.log("context surrounding pred is " + Utils.arrayToString(this.parser.getRuleInvocationStack()));
      }
    }
    var c = null;
    if (collectPredicates && inContext) {
      if (fullCtx) {
        var currentPosition = this._input.index;
        this._input.seek(this._startIndex);
        var predSucceeds = pt.getPredicate().evaluate(this.parser, this._outerContext);
        this._input.seek(currentPosition);
        if (predSucceeds) {
          c = new ATNConfig({state: pt.target}, config);
        }
      } else {
        newSemCtx = SemanticContext.andContext(config.semanticContext, pt.getPredicate());
        c = new ATNConfig({
          state: pt.target,
          semanticContext: newSemCtx
        }, config);
      }
    } else {
      c = new ATNConfig({state: pt.target}, config);
    }
    if (this.debug) {
      console.log("config from pred transition=" + c);
    }
    return c;
  };
  ParserATNSimulator.prototype.predTransition = function(config, pt, collectPredicates, inContext, fullCtx) {
    if (this.debug) {
      console.log("PRED (collectPredicates=" + collectPredicates + ") " + pt.ruleIndex + ":" + pt.predIndex + ", ctx dependent=" + pt.isCtxDependent);
      if (this.parser !== null) {
        console.log("context surrounding pred is " + Utils.arrayToString(this.parser.getRuleInvocationStack()));
      }
    }
    var c = null;
    if (collectPredicates && ((pt.isCtxDependent && inContext) || !pt.isCtxDependent)) {
      if (fullCtx) {
        var currentPosition = this._input.index;
        this._input.seek(this._startIndex);
        var predSucceeds = pt.getPredicate().evaluate(this.parser, this._outerContext);
        this._input.seek(currentPosition);
        if (predSucceeds) {
          c = new ATNConfig({state: pt.target}, config);
        }
      } else {
        var newSemCtx = SemanticContext.andContext(config.semanticContext, pt.getPredicate());
        c = new ATNConfig({
          state: pt.target,
          semanticContext: newSemCtx
        }, config);
      }
    } else {
      c = new ATNConfig({state: pt.target}, config);
    }
    if (this.debug) {
      console.log("config from pred transition=" + c);
    }
    return c;
  };
  ParserATNSimulator.prototype.ruleTransition = function(config, t) {
    if (this.debug) {
      console.log("CALL rule " + this.getRuleName(t.target.ruleIndex) + ", ctx=" + config.context);
    }
    var returnState = t.followState;
    var newContext = SingletonPredictionContext.create(config.context, returnState.stateNumber);
    return new ATNConfig({
      state: t.target,
      context: newContext
    }, config);
  };
  ParserATNSimulator.prototype.getConflictingAlts = function(configs) {
    var altsets = PredictionMode.getConflictingAltSubsets(configs);
    return PredictionMode.getAlts(altsets);
  };
  ParserATNSimulator.prototype.getConflictingAltsOrUniqueAlt = function(configs) {
    var conflictingAlts = null;
    if (configs.uniqueAlt !== ATN.INVALID_ALT_NUMBER) {
      conflictingAlts = new BitSet();
      conflictingAlts.add(configs.uniqueAlt);
    } else {
      conflictingAlts = configs.conflictingAlts;
    }
    return conflictingAlts;
  };
  ParserATNSimulator.prototype.getTokenName = function(t) {
    if (t === Token.EOF) {
      return "EOF";
    }
    if (this.parser !== null && this.parser.literalNames !== null) {
      if (t >= this.parser.literalNames.length) {
        console.log("" + t + " ttype out of range: " + this.parser.literalNames);
        console.log("" + this.parser.getInputStream().getTokens());
      } else {
        return this.parser.literalNames[t] + "<" + t + ">";
      }
    }
    return "" + t;
  };
  ParserATNSimulator.prototype.getLookaheadName = function(input) {
    return this.getTokenName(input.LA(1));
  };
  ParserATNSimulator.prototype.dumpDeadEndConfigs = function(nvae) {
    console.log("dead end configs: ");
    var decs = nvae.getDeadEndConfigs();
    for (var i = 0; i < decs.length; i++) {
      var c = decs[i];
      var trans = "no edges";
      if (c.state.transitions.length > 0) {
        var t = c.state.transitions[0];
        if (t instanceof AtomTransition) {
          trans = "Atom " + this.getTokenName(t.label);
        } else if (t instanceof SetTransition) {
          var neg = (t instanceof NotSetTransition);
          trans = (neg ? "~" : "") + "Set " + t.set;
        }
      }
      console.error(c.toString(this.parser, true) + ":" + trans);
    }
  };
  ParserATNSimulator.prototype.noViableAlt = function(input, outerContext, configs, startIndex) {
    return new NoViableAltException(this.parser, input, input.get(startIndex), input.LT(1), configs, outerContext);
  };
  ParserATNSimulator.prototype.getUniqueAlt = function(configs) {
    var alt = ATN.INVALID_ALT_NUMBER;
    for (var i = 0; i < configs.items.length; i++) {
      var c = configs.items[i];
      if (alt === ATN.INVALID_ALT_NUMBER) {
        alt = c.alt;
      } else if (c.alt !== alt) {
        return ATN.INVALID_ALT_NUMBER;
      }
    }
    return alt;
  };
  ParserATNSimulator.prototype.addDFAEdge = function(dfa, from_, t, to) {
    if (this.debug) {
      console.log("EDGE " + from_ + " -> " + to + " upon " + this.getTokenName(t));
    }
    if (to === null) {
      return null;
    }
    to = this.addDFAState(dfa, to);
    if (from_ === null || t < -1 || t > this.atn.maxTokenType) {
      return to;
    }
    if (from_.edges === null) {
      from_.edges = [];
    }
    from_.edges[t + 1] = to;
    if (this.debug) {
      var names = this.parser === null ? null : this.parser.literalNames;
      console.log("DFA=\n" + dfa.toString(names));
    }
    return to;
  };
  ParserATNSimulator.prototype.addDFAState = function(dfa, D) {
    if (D == ATNSimulator.ERROR) {
      return D;
    }
    var hash = D.hashString();
    var existing = dfa.states[hash] || null;
    if (existing !== null) {
      return existing;
    }
    D.stateNumber = dfa.states.length;
    if (!D.configs.readonly) {
      D.configs.optimizeConfigs(this);
      D.configs.setReadonly(true);
    }
    dfa.states[hash] = D;
    if (this.debug) {
      console.log("adding new DFA state: " + D);
    }
    return D;
  };
  ParserATNSimulator.prototype.reportAttemptingFullContext = function(dfa, conflictingAlts, configs, startIndex, stopIndex) {
    if (this.debug || this.retry_debug) {
      var interval = new Interval(startIndex, stopIndex + 1);
      console.log("reportAttemptingFullContext decision=" + dfa.decision + ":" + configs + ", input=" + this.parser.getTokenStream().getText(interval));
    }
    if (this.parser !== null) {
      this.parser.getErrorListenerDispatch().reportAttemptingFullContext(this.parser, dfa, startIndex, stopIndex, conflictingAlts, configs);
    }
  };
  ParserATNSimulator.prototype.reportContextSensitivity = function(dfa, prediction, configs, startIndex, stopIndex) {
    if (this.debug || this.retry_debug) {
      var interval = new Interval(startIndex, stopIndex + 1);
      console.log("reportContextSensitivity decision=" + dfa.decision + ":" + configs + ", input=" + this.parser.getTokenStream().getText(interval));
    }
    if (this.parser !== null) {
      this.parser.getErrorListenerDispatch().reportContextSensitivity(this.parser, dfa, startIndex, stopIndex, prediction, configs);
    }
  };
  ParserATNSimulator.prototype.reportAmbiguity = function(dfa, D, startIndex, stopIndex, exact, ambigAlts, configs) {
    if (this.debug || this.retry_debug) {
      var interval = new Interval(startIndex, stopIndex + 1);
      console.log("reportAmbiguity " + ambigAlts + ":" + configs + ", input=" + this.parser.getTokenStream().getText(interval));
    }
    if (this.parser !== null) {
      this.parser.getErrorListenerDispatch().reportAmbiguity(this.parser, dfa, startIndex, stopIndex, exact, ambigAlts, configs);
    }
  };
  exports.ParserATNSimulator = ParserATNSimulator;
})(require("process"));
