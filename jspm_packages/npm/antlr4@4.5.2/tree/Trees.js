/* */ 
var Utils = require("../Utils");
var Token = require("../Token").Token;
var RuleNode = require("./Tree").RuleNode;
var ErrorNode = require("./Tree").ErrorNode;
var TerminalNode = require("./Tree").TerminalNode;
var ParserRuleContext = require("../ParserRuleContext").ParserRuleContext;
function Trees() {}
Trees.toStringTree = function(tree, ruleNames, recog) {
  ruleNames = ruleNames || null;
  recog = recog || null;
  if (recog !== null) {
    ruleNames = recog.ruleNames;
  }
  var s = Trees.getNodeText(tree, ruleNames);
  s = Utils.escapeWhitespace(s, false);
  var c = tree.getChildCount();
  if (c === 0) {
    return s;
  }
  var res = "(" + s + ' ';
  if (c > 0) {
    s = Trees.toStringTree(tree.getChild(0), ruleNames);
    res = res.concat(s);
  }
  for (var i = 1; i < c; i++) {
    s = Trees.toStringTree(tree.getChild(i), ruleNames);
    res = res.concat(' ' + s);
  }
  res = res.concat(")");
  return res;
};
Trees.getNodeText = function(t, ruleNames, recog) {
  ruleNames = ruleNames || null;
  recog = recog || null;
  if (recog !== null) {
    ruleNames = recog.ruleNames;
  }
  if (ruleNames !== null) {
    if (t instanceof RuleNode) {
      return ruleNames[t.getRuleContext().ruleIndex];
    } else if (t instanceof ErrorNode) {
      return t.toString();
    } else if (t instanceof TerminalNode) {
      if (t.symbol !== null) {
        return t.symbol.text;
      }
    }
  }
  var payload = t.getPayload();
  if (payload instanceof Token) {
    return payload.text;
  }
  return t.getPayload().toString();
};
Trees.getChildren = function(t) {
  var list = [];
  for (var i = 0; i < t.getChildCount(); i++) {
    list.push(t.getChild(i));
  }
  return list;
};
Trees.getAncestors = function(t) {
  var ancestors = [];
  t = t.getParent();
  while (t !== null) {
    ancestors = [t].concat(ancestors);
    t = t.getParent();
  }
  return ancestors;
};
Trees.findAllTokenNodes = function(t, ttype) {
  return Trees.findAllNodes(t, ttype, true);
};
Trees.findAllRuleNodes = function(t, ruleIndex) {
  return Trees.findAllNodes(t, ruleIndex, false);
};
Trees.findAllNodes = function(t, index, findTokens) {
  var nodes = [];
  Trees._findAllNodes(t, index, findTokens, nodes);
  return nodes;
};
Trees._findAllNodes = function(t, index, findTokens, nodes) {
  if (findTokens && (t instanceof TerminalNode)) {
    if (t.symbol.type === index) {
      nodes.push(t);
    }
  } else if (!findTokens && (t instanceof ParserRuleContext)) {
    if (t.ruleIndex === index) {
      nodes.push(t);
    }
  }
  for (var i = 0; i < t.getChildCount(); i++) {
    Trees._findAllNodes(t.getChild(i), index, findTokens, nodes);
  }
};
Trees.descendants = function(t) {
  var nodes = [t];
  for (var i = 0; i < t.getChildCount(); i++) {
    nodes = nodes.concat(Trees.descendants(t.getChild(i)));
  }
  return nodes;
};
exports.Trees = Trees;
