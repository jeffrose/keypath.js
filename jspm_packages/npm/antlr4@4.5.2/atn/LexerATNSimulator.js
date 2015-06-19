/* */ 
(function(process) {
  var Token = require("../Token").Token;
  var Lexer = require("../Lexer").Lexer;
  var ATN = require("./ATN").ATN;
  var ATNSimulator = require("./ATNSimulator").ATNSimulator;
  var DFAState = require("../dfa/DFAState").DFAState;
  var ATNConfigSet = require("./ATNConfigSet").ATNConfigSet;
  var OrderedATNConfigSet = require("./ATNConfigSet").OrderedATNConfigSet;
  var PredictionContext = require("../PredictionContext").PredictionContext;
  var SingletonPredictionContext = require("../PredictionContext").SingletonPredictionContext;
  var RuleStopState = require("./ATNState").RuleStopState;
  var LexerATNConfig = require("./ATNConfig").LexerATNConfig;
  var Transition = require("./Transition").Transition;
  var LexerActionExecutor = require("./LexerActionExecutor").LexerActionExecutor;
  var LexerNoViableAltException = require("../error/Errors").LexerNoViableAltException;
  function resetSimState(sim) {
    sim.index = -1;
    sim.line = 0;
    sim.column = -1;
    sim.dfaState = null;
  }
  function SimState() {
    resetSimState(this);
    return this;
  }
  SimState.prototype.reset = function() {
    resetSimState(this);
  };
  function LexerATNSimulator(recog, atn, decisionToDFA, sharedContextCache) {
    ATNSimulator.call(this, atn, sharedContextCache);
    this.decisionToDFA = decisionToDFA;
    this.recog = recog;
    this.startIndex = -1;
    this.line = 1;
    this.column = 0;
    this.mode = Lexer.DEFAULT_MODE;
    this.prevAccept = new SimState();
    return this;
  }
  LexerATNSimulator.prototype = Object.create(ATNSimulator.prototype);
  LexerATNSimulator.prototype.constructor = LexerATNSimulator;
  LexerATNSimulator.debug = false;
  LexerATNSimulator.dfa_debug = false;
  LexerATNSimulator.MIN_DFA_EDGE = 0;
  LexerATNSimulator.MAX_DFA_EDGE = 127;
  LexerATNSimulator.match_calls = 0;
  LexerATNSimulator.prototype.copyState = function(simulator) {
    this.column = simulator.column;
    this.line = simulator.line;
    this.mode = simulator.mode;
    this.startIndex = simulator.startIndex;
  };
  LexerATNSimulator.prototype.match = function(input, mode) {
    this.match_calls += 1;
    this.mode = mode;
    var mark = input.mark();
    try {
      this.startIndex = input.index;
      this.prevAccept.reset();
      var dfa = this.decisionToDFA[mode];
      if (dfa.s0 === null) {
        return this.matchATN(input);
      } else {
        return this.execATN(input, dfa.s0);
      }
    } finally {
      input.release(mark);
    }
  };
  LexerATNSimulator.prototype.reset = function() {
    this.prevAccept.reset();
    this.startIndex = -1;
    this.line = 1;
    this.column = 0;
    this.mode = Lexer.DEFAULT_MODE;
  };
  LexerATNSimulator.prototype.matchATN = function(input) {
    var startState = this.atn.modeToStartState[this.mode];
    if (this.debug) {
      console.log("matchATN mode " + this.mode + " start: " + startState);
    }
    var old_mode = this.mode;
    var s0_closure = this.computeStartState(input, startState);
    var suppressEdge = s0_closure.hasSemanticContext;
    s0_closure.hasSemanticContext = false;
    var next = this.addDFAState(s0_closure);
    if (!suppressEdge) {
      this.decisionToDFA[this.mode].s0 = next;
    }
    var predict = this.execATN(input, next);
    if (this.debug) {
      console.log("DFA after matchATN: " + this.decisionToDFA[old_mode].toLexerString());
    }
    return predict;
  };
  LexerATNSimulator.prototype.execATN = function(input, ds0) {
    if (this.debug) {
      console.log("start state closure=" + ds0.configs);
    }
    if (ds0.isAcceptState) {
      this.captureSimState(this.prevAccept, input, ds0);
    }
    var t = input.LA(1);
    var s = ds0;
    while (true) {
      if (this.debug) {
        console.log("execATN loop starting closure: " + s.configs);
      }
      var target = this.getExistingTargetState(s, t);
      if (target === null) {
        target = this.computeTargetState(input, s, t);
      }
      if (target === ATNSimulator.ERROR) {
        break;
      }
      if (t !== Token.EOF) {
        this.consume(input);
      }
      if (target.isAcceptState) {
        this.captureSimState(this.prevAccept, input, target);
        if (t === Token.EOF) {
          break;
        }
      }
      t = input.LA(1);
      s = target;
    }
    return this.failOrAccept(this.prevAccept, input, s.configs, t);
  };
  LexerATNSimulator.prototype.getExistingTargetState = function(s, t) {
    if (s.edges === null || t < LexerATNSimulator.MIN_DFA_EDGE || t > LexerATNSimulator.MAX_DFA_EDGE) {
      return null;
    }
    var target = s.edges[t - LexerATNSimulator.MIN_DFA_EDGE];
    if (target === undefined) {
      target = null;
    }
    if (this.debug && target !== null) {
      console.log("reuse state " + s.stateNumber + " edge to " + target.stateNumber);
    }
    return target;
  };
  LexerATNSimulator.prototype.computeTargetState = function(input, s, t) {
    var reach = new OrderedATNConfigSet();
    this.getReachableConfigSet(input, s.configs, reach, t);
    if (reach.items.length === 0) {
      if (!reach.hasSemanticContext) {
        this.addDFAEdge(s, t, ATNSimulator.ERROR);
      }
      return ATNSimulator.ERROR;
    }
    return this.addDFAEdge(s, t, null, reach);
  };
  LexerATNSimulator.prototype.failOrAccept = function(prevAccept, input, reach, t) {
    if (this.prevAccept.dfaState !== null) {
      var lexerActionExecutor = prevAccept.dfaState.lexerActionExecutor;
      this.accept(input, lexerActionExecutor, this.startIndex, prevAccept.index, prevAccept.line, prevAccept.column);
      return prevAccept.dfaState.prediction;
    } else {
      if (t === Token.EOF && input.index === this.startIndex) {
        return Token.EOF;
      }
      throw new LexerNoViableAltException(this.recog, input, this.startIndex, reach);
    }
  };
  LexerATNSimulator.prototype.getReachableConfigSet = function(input, closure, reach, t) {
    var skipAlt = ATN.INVALID_ALT_NUMBER;
    for (var i = 0; i < closure.items.length; i++) {
      var cfg = closure.items[i];
      var currentAltReachedAcceptState = (cfg.alt === skipAlt);
      if (currentAltReachedAcceptState && cfg.passedThroughNonGreedyDecision) {
        continue;
      }
      if (this.debug) {
        console.log("testing %s at %s\n", this.getTokenName(t), cfg.toString(this.recog, true));
      }
      for (var j = 0; j < cfg.state.transitions.length; j++) {
        var trans = cfg.state.transitions[j];
        var target = this.getReachableTarget(trans, t);
        if (target !== null) {
          var lexerActionExecutor = cfg.lexerActionExecutor;
          if (lexerActionExecutor !== null) {
            lexerActionExecutor = lexerActionExecutor.fixOffsetBeforeMatch(input.index - this.startIndex);
          }
          var treatEofAsEpsilon = (t === Token.EOF);
          var config = new LexerATNConfig({
            state: target,
            lexerActionExecutor: lexerActionExecutor
          }, cfg);
          if (this.closure(input, config, reach, currentAltReachedAcceptState, true, treatEofAsEpsilon)) {
            skipAlt = cfg.alt;
          }
        }
      }
    }
  };
  LexerATNSimulator.prototype.accept = function(input, lexerActionExecutor, startIndex, index, line, charPos) {
    if (this.debug) {
      console.log("ACTION %s\n", lexerActionExecutor);
    }
    input.seek(index);
    this.line = line;
    this.column = charPos;
    if (lexerActionExecutor !== null && this.recog !== null) {
      lexerActionExecutor.execute(this.recog, input, startIndex);
    }
  };
  LexerATNSimulator.prototype.getReachableTarget = function(trans, t) {
    if (trans.matches(t, 0, 0xFFFE)) {
      return trans.target;
    } else {
      return null;
    }
  };
  LexerATNSimulator.prototype.computeStartState = function(input, p) {
    var initialContext = PredictionContext.EMPTY;
    var configs = new OrderedATNConfigSet();
    for (var i = 0; i < p.transitions.length; i++) {
      var target = p.transitions[i].target;
      var cfg = new LexerATNConfig({
        state: target,
        alt: i + 1,
        context: initialContext
      }, null);
      this.closure(input, cfg, configs, false, false, false);
    }
    return configs;
  };
  LexerATNSimulator.prototype.closure = function(input, config, configs, currentAltReachedAcceptState, speculative, treatEofAsEpsilon) {
    var cfg = null;
    if (this.debug) {
      console.log("closure(" + config.toString(this.recog, true) + ")");
    }
    if (config.state instanceof RuleStopState) {
      if (this.debug) {
        if (this.recog !== null) {
          console.log("closure at %s rule stop %s\n", this.recog.getRuleNames()[config.state.ruleIndex], config);
        } else {
          console.log("closure at rule stop %s\n", config);
        }
      }
      if (config.context === null || config.context.hasEmptyPath()) {
        if (config.context === null || config.context.isEmpty()) {
          configs.add(config);
          return true;
        } else {
          configs.add(new LexerATNConfig({
            state: config.state,
            context: PredictionContext.EMPTY
          }, config));
          currentAltReachedAcceptState = true;
        }
      }
      if (config.context !== null && !config.context.isEmpty()) {
        for (var i = 0; i < config.context.length; i++) {
          if (config.context.getReturnState(i) !== PredictionContext.EMPTY_RETURN_STATE) {
            var newContext = config.context.getParent(i);
            var returnState = this.atn.states[config.context.getReturnState(i)];
            cfg = new LexerATNConfig({
              state: returnState,
              context: newContext
            }, config);
            currentAltReachedAcceptState = this.closure(input, cfg, configs, currentAltReachedAcceptState, speculative, treatEofAsEpsilon);
          }
        }
      }
      return currentAltReachedAcceptState;
    }
    if (!config.state.epsilonOnlyTransitions) {
      if (!currentAltReachedAcceptState || !config.passedThroughNonGreedyDecision) {
        configs.add(config);
      }
    }
    for (var j = 0; j < config.state.transitions.length; j++) {
      var trans = config.state.transitions[j];
      cfg = this.getEpsilonTarget(input, config, trans, configs, speculative, treatEofAsEpsilon);
      if (cfg !== null) {
        currentAltReachedAcceptState = this.closure(input, cfg, configs, currentAltReachedAcceptState, speculative, treatEofAsEpsilon);
      }
    }
    return currentAltReachedAcceptState;
  };
  LexerATNSimulator.prototype.getEpsilonTarget = function(input, config, trans, configs, speculative, treatEofAsEpsilon) {
    var cfg = null;
    if (trans.serializationType === Transition.RULE) {
      var newContext = SingletonPredictionContext.create(config.context, trans.followState.stateNumber);
      cfg = new LexerATNConfig({
        state: trans.target,
        context: newContext
      }, config);
    } else if (trans.serializationType === Transition.PRECEDENCE) {
      throw "Precedence predicates are not supported in lexers.";
    } else if (trans.serializationType === Transition.PREDICATE) {
      if (this.debug) {
        console.log("EVAL rule " + trans.ruleIndex + ":" + trans.predIndex);
      }
      configs.hasSemanticContext = true;
      if (this.evaluatePredicate(input, trans.ruleIndex, trans.predIndex, speculative)) {
        cfg = new LexerATNConfig({state: trans.target}, config);
      }
    } else if (trans.serializationType === Transition.ACTION) {
      if (config.context === null || config.context.hasEmptyPath()) {
        var lexerActionExecutor = LexerActionExecutor.append(config.lexerActionExecutor, this.atn.lexerActions[trans.actionIndex]);
        cfg = new LexerATNConfig({
          state: trans.target,
          lexerActionExecutor: lexerActionExecutor
        }, config);
      } else {
        cfg = new LexerATNConfig({state: trans.target}, config);
      }
    } else if (trans.serializationType === Transition.EPSILON) {
      cfg = new LexerATNConfig({state: trans.target}, config);
    } else if (trans.serializationType === Transition.ATOM || trans.serializationType === Transition.RANGE || trans.serializationType === Transition.SET) {
      if (treatEofAsEpsilon) {
        if (trans.matches(Token.EOF, 0, 0xFFFF)) {
          cfg = new LexerATNConfig({state: trans.target}, config);
        }
      }
    }
    return cfg;
  };
  LexerATNSimulator.prototype.evaluatePredicate = function(input, ruleIndex, predIndex, speculative) {
    if (this.recog === null) {
      return true;
    }
    if (!speculative) {
      return this.recog.sempred(null, ruleIndex, predIndex);
    }
    var savedcolumn = this.column;
    var savedLine = this.line;
    var index = input.index;
    var marker = input.mark();
    try {
      this.consume(input);
      return this.recog.sempred(null, ruleIndex, predIndex);
    } finally {
      this.column = savedcolumn;
      this.line = savedLine;
      input.seek(index);
      input.release(marker);
    }
  };
  LexerATNSimulator.prototype.captureSimState = function(settings, input, dfaState) {
    settings.index = input.index;
    settings.line = this.line;
    settings.column = this.column;
    settings.dfaState = dfaState;
  };
  LexerATNSimulator.prototype.addDFAEdge = function(from_, tk, to, cfgs) {
    if (to === undefined) {
      to = null;
    }
    if (cfgs === undefined) {
      cfgs = null;
    }
    if (to === null && cfgs !== null) {
      var suppressEdge = cfgs.hasSemanticContext;
      cfgs.hasSemanticContext = false;
      to = this.addDFAState(cfgs);
      if (suppressEdge) {
        return to;
      }
    }
    if (tk < LexerATNSimulator.MIN_DFA_EDGE || tk > LexerATNSimulator.MAX_DFA_EDGE) {
      return to;
    }
    if (this.debug) {
      console.log("EDGE " + from_ + " -> " + to + " upon " + tk);
    }
    if (from_.edges === null) {
      from_.edges = [];
    }
    from_.edges[tk - LexerATNSimulator.MIN_DFA_EDGE] = to;
    return to;
  };
  LexerATNSimulator.prototype.addDFAState = function(configs) {
    var proposed = new DFAState(null, configs);
    var firstConfigWithRuleStopState = null;
    for (var i = 0; i < configs.items.length; i++) {
      var cfg = configs.items[i];
      if (cfg.state instanceof RuleStopState) {
        firstConfigWithRuleStopState = cfg;
        break;
      }
    }
    if (firstConfigWithRuleStopState !== null) {
      proposed.isAcceptState = true;
      proposed.lexerActionExecutor = firstConfigWithRuleStopState.lexerActionExecutor;
      proposed.prediction = this.atn.ruleToTokenType[firstConfigWithRuleStopState.state.ruleIndex];
    }
    var hash = proposed.hashString();
    var dfa = this.decisionToDFA[this.mode];
    var existing = dfa.states[hash] || null;
    if (existing !== null) {
      return existing;
    }
    var newState = proposed;
    newState.stateNumber = dfa.states.length;
    configs.setReadonly(true);
    newState.configs = configs;
    dfa.states[hash] = newState;
    return newState;
  };
  LexerATNSimulator.prototype.getDFA = function(mode) {
    return this.decisionToDFA[mode];
  };
  LexerATNSimulator.prototype.getText = function(input) {
    return input.getText(this.startIndex, input.index - 1);
  };
  LexerATNSimulator.prototype.consume = function(input) {
    var curChar = input.LA(1);
    if (curChar === "\n".charCodeAt(0)) {
      this.line += 1;
      this.column = 0;
    } else {
      this.column += 1;
    }
    input.consume();
  };
  LexerATNSimulator.prototype.getTokenName = function(tt) {
    if (tt === -1) {
      return "EOF";
    } else {
      return "'" + String.fromCharCode(tt) + "'";
    }
  };
  exports.LexerATNSimulator = LexerATNSimulator;
})(require("process"));
