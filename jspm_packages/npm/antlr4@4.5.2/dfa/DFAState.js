/* */ 
(function(process) {
  var ATNConfigSet = require("../atn/ATNConfigSet").ATNConfigSet;
  function PredPrediction(pred, alt) {
    this.alt = alt;
    this.pred = pred;
    return this;
  }
  PredPrediction.prototype.toString = function() {
    return "(" + this.pred + ", " + this.alt + ")";
  };
  function DFAState(stateNumber, configs) {
    if (stateNumber === null) {
      stateNumber = -1;
    }
    if (configs === null) {
      configs = new ATNConfigSet();
    }
    this.stateNumber = stateNumber;
    this.configs = configs;
    this.edges = null;
    this.isAcceptState = false;
    this.prediction = 0;
    this.lexerActionExecutor = null;
    this.requiresFullContext = false;
    this.predicates = null;
    return this;
  }
  DFAState.prototype.getAltSet = function() {
    var alts = new Set();
    if (this.configs !== null) {
      for (var i = 0; i < this.configs.length; i++) {
        var c = this.configs[i];
        alts.add(c.alt);
      }
    }
    if (alts.length === 0) {
      return null;
    } else {
      return alts;
    }
  };
  DFAState.prototype.equals = function(other) {
    if (this === other) {
      return true;
    } else if (!(other instanceof DFAState)) {
      return false;
    } else {
      return this.configs.equals(other.configs);
    }
  };
  DFAState.prototype.toString = function() {
    return "" + this.stateNumber + ":" + this.hashString();
  };
  DFAState.prototype.hashString = function() {
    return "" + this.configs + (this.isAcceptState ? "=>" + (this.predicates !== null ? this.predicates : this.prediction) : "");
  };
  exports.DFAState = DFAState;
  exports.PredPrediction = PredPrediction;
})(require("process"));
