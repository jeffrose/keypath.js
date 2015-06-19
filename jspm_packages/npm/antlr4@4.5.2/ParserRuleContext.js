/* */ 
var RuleContext = require("./RuleContext").RuleContext;
var Tree = require("./tree/Tree");
var INVALID_INTERVAL = Tree.INVALID_INTERVAL;
var TerminalNode = Tree.TerminalNode;
var TerminalNodeImpl = Tree.TerminalNodeImpl;
var ErrorNodeImpl = Tree.ErrorNodeImpl;
var Interval = require("./IntervalSet").Interval;
function ParserRuleContext(parent, invokingStateNumber) {
  parent = parent || null;
  invokingStateNumber = invokingStateNumber || null;
  RuleContext.call(this, parent, invokingStateNumber);
  this.ruleIndex = -1;
  this.children = null;
  this.start = null;
  this.stop = null;
  this.exception = null;
}
ParserRuleContext.prototype = Object.create(RuleContext.prototype);
ParserRuleContext.prototype.constructor = ParserRuleContext;
ParserRuleContext.prototype.copyFrom = function(ctx) {
  this.parentCtx = ctx.parentCtx;
  this.invokingState = ctx.invokingState;
  this.children = null;
  this.start = ctx.start;
  this.stop = ctx.stop;
};
ParserRuleContext.prototype.enterRule = function(listener) {};
ParserRuleContext.prototype.exitRule = function(listener) {};
ParserRuleContext.prototype.addChild = function(child) {
  if (this.children === null) {
    this.children = [];
  }
  this.children.push(child);
  return child;
};
ParserRuleContext.prototype.removeLastChild = function() {
  if (this.children !== null) {
    this.children.pop();
  }
};
ParserRuleContext.prototype.addTokenNode = function(token) {
  var node = new TerminalNodeImpl(token);
  this.addChild(node);
  node.parentCtx = this;
  return node;
};
ParserRuleContext.prototype.addErrorNode = function(badToken) {
  var node = new ErrorNodeImpl(badToken);
  this.addChild(node);
  node.parentCtx = this;
  return node;
};
ParserRuleContext.prototype.getChild = function(i, type) {
  type = type || null;
  if (type === null) {
    return this.children.length >= i ? this.children[i] : null;
  } else {
    for (var j = 0; j < this.children.length; j++) {
      var child = this.children[j];
      if (child instanceof type) {
        if (i === 0) {
          return child;
        } else {
          i -= 1;
        }
      }
    }
    return null;
  }
};
ParserRuleContext.prototype.getToken = function(ttype, i) {
  for (var j = 0; j < this.children.length; j++) {
    var child = this.children[j];
    if (child instanceof TerminalNode) {
      if (child.symbol.type === ttype) {
        if (i === 0) {
          return child;
        } else {
          i -= 1;
        }
      }
    }
  }
  return null;
};
ParserRuleContext.prototype.getTokens = function(ttype) {
  if (this.children === null) {
    return [];
  } else {
    var tokens = [];
    for (var j = 0; j < this.children.length; j++) {
      var child = this.children[j];
      if (child instanceof TerminalNode) {
        if (child.symbol.type === ttype) {
          tokens.push(child);
        }
      }
    }
    return tokens;
  }
};
ParserRuleContext.prototype.getTypedRuleContext = function(ctxType, i) {
  return this.getChild(i, ctxType);
};
ParserRuleContext.prototype.getTypedRuleContexts = function(ctxType) {
  if (this.children === null) {
    return [];
  } else {
    var contexts = [];
    for (var j = 0; j < this.children.length; j++) {
      var child = this.children[j];
      if (child instanceof ctxType) {
        contexts.push(child);
      }
    }
    return contexts;
  }
};
ParserRuleContext.prototype.getChildCount = function() {
  if (this.children === null) {
    return 0;
  } else {
    return this.children.length;
  }
};
ParserRuleContext.prototype.getSourceInterval = function() {
  if (this.start === null || this.stop === null) {
    return INVALID_INTERVAL;
  } else {
    return Interval(this.start.tokenIndex, this.stop.tokenIndex);
  }
};
RuleContext.EMPTY = new ParserRuleContext();
function InterpreterRuleContext(parent, invokingStateNumber, ruleIndex) {
  ParserRuleContext.call(parent, invokingStateNumber);
  this.ruleIndex = ruleIndex;
  return this;
}
InterpreterRuleContext.prototype = Object.create(ParserRuleContext.prototype);
InterpreterRuleContext.prototype.constructor = InterpreterRuleContext;
exports.ParserRuleContext = ParserRuleContext;
