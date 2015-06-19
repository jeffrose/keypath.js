/* */ 
var RuleNode = require("./tree/Tree").RuleNode;
var INVALID_INTERVAL = require("./tree/Tree").INVALID_INTERVAL;
function RuleContext(parent, invokingState) {
  RuleNode.call(this);
  this.parentCtx = parent || null;
  this.invokingState = invokingState || -1;
  return this;
}
RuleContext.prototype = Object.create(RuleNode.prototype);
RuleContext.prototype.constructor = RuleContext;
RuleContext.prototype.depth = function() {
  var n = 0;
  var p = this;
  while (p !== null) {
    p = p.parentCtx;
    n += 1;
  }
  return n;
};
RuleContext.prototype.isEmpty = function() {
  return this.invokingState === -1;
};
RuleContext.prototype.getSourceInterval = function() {
  return INVALID_INTERVAL;
};
RuleContext.prototype.getRuleContext = function() {
  return this;
};
RuleContext.prototype.getPayload = function() {
  return this;
};
RuleContext.prototype.getText = function() {
  if (this.getChildCount() === 0) {
    return "";
  } else {
    return this.children.map(function(child) {
      return child.getText();
    }).join("");
  }
};
RuleContext.prototype.getChild = function(i) {
  return null;
};
RuleContext.prototype.getChildCount = function() {
  return 0;
};
RuleContext.prototype.accept = function(visitor) {
  return visitor.visitChildren(this);
};
exports.RuleContext = RuleContext;
var Trees = require("./tree/Trees").Trees;
RuleContext.prototype.toStringTree = function(ruleNames, recog) {
  return Trees.toStringTree(this, ruleNames, recog);
};
RuleContext.prototype.toString = function(ruleNames, stop) {
  ruleNames = ruleNames || null;
  stop = stop || null;
  var p = this;
  var s = "[";
  while (p !== null && p !== stop) {
    if (ruleNames === null) {
      if (!p.isEmpty()) {
        s += p.invokingState;
      }
    } else {
      var ri = p.ruleIndex;
      var ruleName = (ri >= 0 && ri < ruleNames.length) ? ruleNames[ri] : "" + ri;
      s += ruleName;
    }
    if (p.parentCtx !== null && (ruleNames !== null || !p.parentCtx.isEmpty())) {
      s += " ";
    }
    p = p.parentCtx;
  }
  s += "]";
  return s;
};
