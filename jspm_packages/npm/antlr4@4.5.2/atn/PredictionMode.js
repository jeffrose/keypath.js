/* */ 
(function(process) {
  var Set = require("../Utils").Set;
  var BitSet = require("../Utils").BitSet;
  var AltDict = require("../Utils").AltDict;
  var ATN = require("./ATN").ATN;
  var RuleStopState = require("./ATNState").RuleStopState;
  function PredictionMode() {
    return this;
  }
  PredictionMode.SLL = 0;
  PredictionMode.LL = 1;
  PredictionMode.LL_EXACT_AMBIG_DETECTION = 2;
  PredictionMode.hasSLLConflictTerminatingPrediction = function(mode, configs) {
    if (PredictionMode.allConfigsInRuleStopStates(configs)) {
      return true;
    }
    if (mode === PredictionMode.SLL) {
      if (configs.hasSemanticContext) {
        var dup = new ATNConfigSet();
        for (var i = 0; i < configs.items.length; i++) {
          var c = configs.items[i];
          c = new ATNConfig({semanticContext: SemanticContext.NONE}, c);
          dup.add(c);
        }
        configs = dup;
      }
    }
    var altsets = PredictionMode.getConflictingAltSubsets(configs);
    return PredictionMode.hasConflictingAltSet(altsets) && !PredictionMode.hasStateAssociatedWithOneAlt(configs);
  };
  PredictionMode.hasConfigInRuleStopState = function(configs) {
    for (var i = 0; i < configs.items.length; i++) {
      var c = configs.items[i];
      if (c.state instanceof RuleStopState) {
        return true;
      }
    }
    return false;
  };
  PredictionMode.allConfigsInRuleStopStates = function(configs) {
    for (var i = 0; i < configs.items.length; i++) {
      var c = configs.items[i];
      if (!(c.state instanceof RuleStopState)) {
        return false;
      }
    }
    return true;
  };
  PredictionMode.resolvesToJustOneViableAlt = function(altsets) {
    return PredictionMode.getSingleViableAlt(altsets);
  };
  PredictionMode.allSubsetsConflict = function(altsets) {
    return !PredictionMode.hasNonConflictingAltSet(altsets);
  };
  PredictionMode.hasNonConflictingAltSet = function(altsets) {
    for (var i = 0; i < altsets.length; i++) {
      var alts = altsets[i];
      if (alts.length === 1) {
        return true;
      }
    }
    return false;
  };
  PredictionMode.hasConflictingAltSet = function(altsets) {
    for (var i = 0; i < altsets.length; i++) {
      var alts = altsets[i];
      if (alts.length > 1) {
        return true;
      }
    }
    return false;
  };
  PredictionMode.allSubsetsEqual = function(altsets) {
    var first = null;
    for (var i = 0; i < altsets.length; i++) {
      var alts = altsets[i];
      if (first === null) {
        first = alts;
      } else if (alts !== first) {
        return false;
      }
    }
    return true;
  };
  PredictionMode.getUniqueAlt = function(altsets) {
    var all = PredictionMode.getAlts(altsets);
    if (all.length === 1) {
      return all.minValue();
    } else {
      return ATN.INVALID_ALT_NUMBER;
    }
  };
  PredictionMode.getAlts = function(altsets) {
    var all = new BitSet();
    altsets.map(function(alts) {
      all.or(alts);
    });
    return all;
  };
  PredictionMode.getConflictingAltSubsets = function(configs) {
    var configToAlts = {};
    for (var i = 0; i < configs.items.length; i++) {
      var c = configs.items[i];
      var key = "key_" + c.state.stateNumber + "/" + c.context;
      var alts = configToAlts[key] || null;
      if (alts === null) {
        alts = new BitSet();
        configToAlts[key] = alts;
      }
      alts.add(c.alt);
    }
    var values = [];
    for (var k in configToAlts) {
      if (k.indexOf("key_") !== 0) {
        continue;
      }
      values.push(configToAlts[k]);
    }
    return values;
  };
  PredictionMode.getStateToAltMap = function(configs) {
    var m = new AltDict();
    configs.items.map(function(c) {
      var alts = m.get(c.state);
      if (alts === null) {
        alts = new BitSet();
        m.put(c.state, alts);
      }
      alts.add(c.alt);
    });
    return m;
  };
  PredictionMode.hasStateAssociatedWithOneAlt = function(configs) {
    var values = PredictionMode.getStateToAltMap(configs).values();
    for (var i = 0; i < values.length; i++) {
      if (values[i].length === 1) {
        return true;
      }
    }
    return false;
  };
  PredictionMode.getSingleViableAlt = function(altsets) {
    var result = null;
    for (var i = 0; i < altsets.length; i++) {
      var alts = altsets[i];
      var minAlt = alts.minValue();
      if (result === null) {
        result = minAlt;
      } else if (result !== minAlt) {
        return ATN.INVALID_ALT_NUMBER;
      }
    }
    return result;
  };
  exports.PredictionMode = PredictionMode;
})(require("process"));
