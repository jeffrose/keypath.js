/* */ 
(function(process) {
  var Token = require("./Token").Token;
  var ParseTreeListener = require("./tree/Tree").ParseTreeListener;
  var Recognizer = require("./Recognizer").Recognizer;
  var DefaultErrorStrategy = require("./error/ErrorStrategy").DefaultErrorStrategy;
  var ATNDeserializer = require("./atn/ATNDeserializer").ATNDeserializer;
  var ATNDeserializationOptions = require("./atn/ATNDeserializationOptions").ATNDeserializationOptions;
  function TraceListener(parser) {
    ParseTreeListener.call(this);
    this.parser = parser;
    return this;
  }
  TraceListener.prototype = Object.create(ParseTreeListener);
  TraceListener.prototype.constructor = TraceListener;
  TraceListener.prototype.enterEveryRule = function(ctx) {
    console.log("enter   " + this.parser.ruleNames[ctx.ruleIndex] + ", LT(1)=" + this.parser._input.LT(1).text);
  };
  TraceListener.prototype.visitTerminal = function(node) {
    console.log("consume " + node.symbol + " rule " + this.parser.ruleNames[this.parser._ctx.ruleIndex]);
  };
  TraceListener.prototype.exitEveryRule = function(ctx) {
    console.log("exit    " + this.parser.ruleNames[ctx.ruleIndex] + ", LT(1)=" + this.parser._input.LT(1).text);
  };
  function Parser(input) {
    Recognizer.call(this);
    this._input = null;
    this._errHandler = new DefaultErrorStrategy();
    this._precedenceStack = [];
    this._precedenceStack.push(0);
    this._ctx = null;
    this.buildParseTrees = true;
    this._tracer = null;
    this._parseListeners = null;
    this._syntaxErrors = 0;
    this.setInputStream(input);
    return this;
  }
  Parser.prototype = Object.create(Recognizer.prototype);
  Parser.prototype.contructor = Parser;
  Parser.bypassAltsAtnCache = {};
  Parser.prototype.reset = function() {
    if (this._input !== null) {
      this._input.seek(0);
    }
    this._errHandler.reset(this);
    this._ctx = null;
    this._syntaxErrors = 0;
    this.setTrace(false);
    this._precedenceStack = [];
    this._precedenceStack.push(0);
    if (this._interp !== null) {
      this._interp.reset();
    }
  };
  Parser.prototype.match = function(ttype) {
    var t = this.getCurrentToken();
    if (t.type === ttype) {
      this._errHandler.reportMatch(this);
      this.consume();
    } else {
      t = this._errHandler.recoverInline(this);
      if (this.buildParseTrees && t.tokenIndex === -1) {
        this._ctx.addErrorNode(t);
      }
    }
    return t;
  };
  Parser.prototype.matchWildcard = function() {
    var t = this.getCurrentToken();
    if (t.type > 0) {
      this._errHandler.reportMatch(this);
      this.consume();
    } else {
      t = this._errHandler.recoverInline(this);
      if (this._buildParseTrees && t.tokenIndex === -1) {
        this._ctx.addErrorNode(t);
      }
    }
    return t;
  };
  Parser.prototype.getParseListeners = function() {
    return this._parseListeners || [];
  };
  Parser.prototype.addParseListener = function(listener) {
    if (listener === null) {
      throw "listener";
    }
    if (this._parseListeners === null) {
      this._parseListeners = [];
    }
    this._parseListeners.push(listener);
  };
  Parser.prototype.removeParseListener = function(listener) {
    if (this._parseListeners !== null) {
      var idx = this._parseListeners.indexOf(listener);
      if (idx >= 0) {
        this._parseListeners.splice(idx, 1);
      }
      if (this._parseListeners.length === 0) {
        this._parseListeners = null;
      }
    }
  };
  Parser.prototype.removeParseListeners = function() {
    this._parseListeners = null;
  };
  Parser.prototype.triggerEnterRuleEvent = function() {
    if (this._parseListeners !== null) {
      var ctx = this._ctx;
      this._parseListeners.map(function(listener) {
        listener.enterEveryRule(ctx);
        ctx.enterRule(listener);
      });
    }
  };
  Parser.prototype.triggerExitRuleEvent = function() {
    if (this._parseListeners !== null) {
      var ctx = this._ctx;
      this._parseListeners.slice(0).reverse().map(function(listener) {
        ctx.exitRule(listener);
        listener.exitEveryRule(ctx);
      });
    }
  };
  Parser.prototype.getTokenFactory = function() {
    return this._input.tokenSource._factory;
  };
  Parser.prototype.setTokenFactory = function(factory) {
    this._input.tokenSource._factory = factory;
  };
  Parser.prototype.getATNWithBypassAlts = function() {
    var serializedAtn = this.getSerializedATN();
    if (serializedAtn === null) {
      throw "The current parser does not support an ATN with bypass alternatives.";
    }
    var result = this.bypassAltsAtnCache[serializedAtn];
    if (result === null) {
      var deserializationOptions = new ATNDeserializationOptions();
      deserializationOptions.generateRuleBypassTransitions = true;
      result = new ATNDeserializer(deserializationOptions).deserialize(serializedAtn);
      this.bypassAltsAtnCache[serializedAtn] = result;
    }
    return result;
  };
  var Lexer = require("./Lexer").Lexer;
  Parser.prototype.compileParseTreePattern = function(pattern, patternRuleIndex, lexer) {
    lexer = lexer || null;
    if (lexer === null) {
      if (this.getTokenStream() !== null) {
        var tokenSource = this.getTokenStream().getTokenSource();
        if (tokenSource instanceof Lexer) {
          lexer = tokenSource;
        }
      }
    }
    if (lexer === null) {
      throw "Parser can't discover a lexer to use";
    }
    var m = new ParseTreePatternMatcher(lexer, this);
    return m.compile(pattern, patternRuleIndex);
  };
  Parser.prototype.getInputStream = function() {
    return this.getTokenStream();
  };
  Parser.prototype.setInputStream = function(input) {
    this.setTokenStream(input);
  };
  Parser.prototype.getTokenStream = function() {
    return this._input;
  };
  Parser.prototype.setTokenStream = function(input) {
    this._input = null;
    this.reset();
    this._input = input;
  };
  Parser.prototype.getCurrentToken = function() {
    return this._input.LT(1);
  };
  Parser.prototype.notifyErrorListeners = function(msg, offendingToken, err) {
    offendingToken = offendingToken || null;
    err = err || null;
    if (offendingToken === null) {
      offendingToken = this.getCurrentToken();
    }
    this._syntaxErrors += 1;
    var line = offendingToken.line;
    var column = offendingToken.column;
    var listener = this.getErrorListenerDispatch();
    listener.syntaxError(this, offendingToken, line, column, msg, err);
  };
  Parser.prototype.consume = function() {
    var o = this.getCurrentToken();
    if (o.type !== Token.EOF) {
      this.getInputStream().consume();
    }
    var hasListener = this._parseListeners !== null && this._parseListeners.length > 0;
    if (this.buildParseTrees || hasListener) {
      var node;
      if (this._errHandler.inErrorRecoveryMode(this)) {
        node = this._ctx.addErrorNode(o);
      } else {
        node = this._ctx.addTokenNode(o);
      }
      if (hasListener) {
        this._parseListeners.map(function(listener) {
          listener.visitTerminal(node);
        });
      }
    }
    return o;
  };
  Parser.prototype.addContextToParseTree = function() {
    if (this._ctx.parentCtx !== null) {
      this._ctx.parentCtx.addChild(this._ctx);
    }
  };
  Parser.prototype.enterRule = function(localctx, state, ruleIndex) {
    this.state = state;
    this._ctx = localctx;
    this._ctx.start = this._input.LT(1);
    if (this.buildParseTrees) {
      this.addContextToParseTree();
    }
    if (this._parseListeners !== null) {
      this.triggerEnterRuleEvent();
    }
  };
  Parser.prototype.exitRule = function() {
    this._ctx.stop = this._input.LT(-1);
    if (this._parseListeners !== null) {
      this.triggerExitRuleEvent();
    }
    this.state = this._ctx.invokingState;
    this._ctx = this._ctx.parentCtx;
  };
  Parser.prototype.enterOuterAlt = function(localctx, altNum) {
    if (this.buildParseTrees && this._ctx !== localctx) {
      if (this._ctx.parentCtx !== null) {
        this._ctx.parentCtx.removeLastChild();
        this._ctx.parentCtx.addChild(localctx);
      }
    }
    this._ctx = localctx;
  };
  Parser.prototype.getPrecedence = function() {
    if (this._precedenceStack.length === 0) {
      return -1;
    } else {
      return this._precedenceStack[this._precedenceStack.length - 1];
    }
  };
  Parser.prototype.enterRecursionRule = function(localctx, state, ruleIndex, precedence) {
    this.state = state;
    this._precedenceStack.push(precedence);
    this._ctx = localctx;
    this._ctx.start = this._input.LT(1);
    if (this._parseListeners !== null) {
      this.triggerEnterRuleEvent();
    }
  };
  Parser.prototype.pushNewRecursionContext = function(localctx, state, ruleIndex) {
    var previous = this._ctx;
    previous.parentCtx = localctx;
    previous.invokingState = state;
    previous.stop = this._input.LT(-1);
    this._ctx = localctx;
    this._ctx.start = previous.start;
    if (this.buildParseTrees) {
      this._ctx.addChild(previous);
    }
    if (this._parseListeners !== null) {
      this.triggerEnterRuleEvent();
    }
  };
  Parser.prototype.unrollRecursionContexts = function(parentCtx) {
    this._precedenceStack.pop();
    this._ctx.stop = this._input.LT(-1);
    var retCtx = this._ctx;
    if (this._parseListeners !== null) {
      while (this._ctx !== parentCtx) {
        this.triggerExitRuleEvent();
        this._ctx = this._ctx.parentCtx;
      }
    } else {
      this._ctx = parentCtx;
    }
    retCtx.parentCtx = parentCtx;
    if (this.buildParseTrees && parentCtx !== null) {
      parentCtx.addChild(retCtx);
    }
  };
  Parser.prototype.getInvokingContext = function(ruleIndex) {
    var ctx = this._ctx;
    while (ctx !== null) {
      if (ctx.ruleIndex === ruleIndex) {
        return ctx;
      }
      ctx = ctx.parentCtx;
    }
    return null;
  };
  Parser.prototype.precpred = function(localctx, precedence) {
    return precedence >= this._precedenceStack[this._precedenceStack.length - 1];
  };
  Parser.prototype.inContext = function(context) {
    return false;
  };
  Parser.prototype.isExpectedToken = function(symbol) {
    var atn = this._interp.atn;
    var ctx = this._ctx;
    var s = atn.states[this.state];
    var following = atn.nextTokens(s);
    if (following.contains(symbol)) {
      return true;
    }
    if (!following.contains(Token.EPSILON)) {
      return false;
    }
    while (ctx !== null && ctx.invokingState >= 0 && following.contains(Token.EPSILON)) {
      var invokingState = atn.states[ctx.invokingState];
      var rt = invokingState.transitions[0];
      following = atn.nextTokens(rt.followState);
      if (following.contains(symbol)) {
        return true;
      }
      ctx = ctx.parentCtx;
    }
    if (following.contains(Token.EPSILON) && symbol === Token.EOF) {
      return true;
    } else {
      return false;
    }
  };
  Parser.prototype.getExpectedTokens = function() {
    return this._interp.atn.getExpectedTokens(this.state, this._ctx);
  };
  Parser.prototype.getExpectedTokensWithinCurrentRule = function() {
    var atn = this._interp.atn;
    var s = atn.states[this.state];
    return atn.nextTokens(s);
  };
  Parser.prototype.getRuleIndex = function(ruleName) {
    var ruleIndex = this.getRuleIndexMap()[ruleName];
    if (ruleIndex !== null) {
      return ruleIndex;
    } else {
      return -1;
    }
  };
  Parser.prototype.getRuleInvocationStack = function(p) {
    p = p || null;
    if (p === null) {
      p = this._ctx;
    }
    var stack = [];
    while (p !== null) {
      var ruleIndex = p.ruleIndex;
      if (ruleIndex < 0) {
        stack.push("n/a");
      } else {
        stack.push(this.ruleNames[ruleIndex]);
      }
      p = p.parentCtx;
    }
    return stack;
  };
  Parser.prototype.getDFAStrings = function() {
    return this._interp.decisionToDFA.toString();
  };
  Parser.prototype.dumpDFA = function() {
    var seenOne = false;
    for (var i = 0; i < this._interp.decisionToDFA.length; i++) {
      var dfa = this._interp.decisionToDFA[i];
      if (dfa.states.length > 0) {
        if (seenOne) {
          console.log();
        }
        this.printer.println("Decision " + dfa.decision + ":");
        this.printer.print(dfa.toString(this.literalNames, this.symbolicNames));
        seenOne = true;
      }
    }
  };
  Parser.prototype.getSourceName = function() {
    return this._input.sourceName;
  };
  Parser.prototype.setTrace = function(trace) {
    if (!trace) {
      this.removeParseListener(this._tracer);
      this._tracer = null;
    } else {
      if (this._tracer !== null) {
        this.removeParseListener(this._tracer);
      }
      this._tracer = new TraceListener(this);
      this.addParseListener(this._tracer);
    }
  };
  exports.Parser = Parser;
})(require("process"));
