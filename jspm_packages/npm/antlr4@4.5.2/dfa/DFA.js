/* */ 
var DFAState = require("./DFAState").DFAState;
var ATNConfigSet = require("../atn/ATNConfigSet").ATNConfigSet;
var DFASerializer = require("./DFASerializer").DFASerializer;
var LexerDFASerializer = require("./DFASerializer").LexerDFASerializer;
function DFAStatesSet() {
  return this;
}
Object.defineProperty(DFAStatesSet.prototype, "length", {get: function() {
    return Object.keys(this).length;
  }});
function DFA(atnStartState, decision) {
  if (decision === undefined) {
    decision = 0;
  }
  this.atnStartState = atnStartState;
  this.decision = decision;
  this._states = new DFAStatesSet();
  this.s0 = null;
  this.precedenceDfa = false;
  return this;
}
DFA.prototype.getPrecedenceStartState = function(precedence) {
  if (!(this.precedenceDfa)) {
    throw ("Only precedence DFAs may contain a precedence start state.");
  }
  if (precedence < 0 || precedence >= this.s0.edges.length) {
    return null;
  }
  return this.s0.edges[precedence] || null;
};
DFA.prototype.setPrecedenceStartState = function(precedence, startState) {
  if (!(this.precedenceDfa)) {
    throw ("Only precedence DFAs may contain a precedence start state.");
  }
  if (precedence < 0) {
    return ;
  }
  this.s0.edges[precedence] = startState;
};
DFA.prototype.setPrecedenceDfa = function(precedenceDfa) {
  if (this.precedenceDfa !== precedenceDfa) {
    this._states = new DFAStatesSet();
    if (precedenceDfa) {
      var precedenceState = new DFAState(new ATNConfigSet());
      precedenceState.edges = [];
      precedenceState.isAcceptState = false;
      precedenceState.requiresFullContext = false;
      this.s0 = precedenceState;
    } else {
      this.s0 = null;
    }
    this.precedenceDfa = precedenceDfa;
  }
};
Object.defineProperty(DFA.prototype, "states", {get: function() {
    return this._states;
  }});
DFA.prototype.sortedStates = function() {
  var keys = Object.keys(this._states);
  var list = [];
  for (var i = 0; i < keys.length; i++) {
    list.push(this._states[keys[i]]);
  }
  return list.sort(function(a, b) {
    return a.stateNumber - b.stateNumber;
  });
};
DFA.prototype.toString = function(literalNames, symbolicNames) {
  literalNames = literalNames || null;
  symbolicNames = symbolicNames || null;
  if (this.s0 === null) {
    return "";
  }
  var serializer = new DFASerializer(this, literalNames, symbolicNames);
  return serializer.toString();
};
DFA.prototype.toLexerString = function() {
  if (this.s0 === null) {
    return "";
  }
  var serializer = new LexerDFASerializer(this);
  return serializer.toString();
};
exports.DFA = DFA;
