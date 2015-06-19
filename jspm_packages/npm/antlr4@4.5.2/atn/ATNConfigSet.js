/* */ 
var ATN = require("./ATN").ATN;
var Utils = require("../Utils");
var Set = Utils.Set;
var SemanticContext = require("./SemanticContext").SemanticContext;
var merge = require("../PredictionContext").merge;
function hashATNConfig(c) {
  return c.shortHashString();
}
function equalATNConfigs(a, b) {
  if (a === b) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  return a.state.stateNumber === b.state.stateNumber && a.alt === b.alt && a.semanticContext.equals(b.semanticContext);
}
function ATNConfigSet(fullCtx) {
  this.configLookup = new Set(hashATNConfig, equalATNConfigs);
  this.fullCtx = fullCtx === undefined ? true : fullCtx;
  this.readonly = false;
  this.configs = [];
  this.uniqueAlt = 0;
  this.conflictingAlts = null;
  this.hasSemanticContext = false;
  this.dipsIntoOuterContext = false;
  this.cachedHashString = "-1";
  return this;
}
ATNConfigSet.prototype.add = function(config, mergeCache) {
  if (mergeCache === undefined) {
    mergeCache = null;
  }
  if (this.readonly) {
    throw "This set is readonly";
  }
  if (config.semanticContext !== SemanticContext.NONE) {
    this.hasSemanticContext = true;
  }
  if (config.reachesIntoOuterContext > 0) {
    this.dipsIntoOuterContext = true;
  }
  var existing = this.configLookup.add(config);
  if (existing === config) {
    this.cachedHashString = "-1";
    this.configs.push(config);
    return true;
  }
  var rootIsWildcard = !this.fullCtx;
  var merged = merge(existing.context, config.context, rootIsWildcard, mergeCache);
  existing.reachesIntoOuterContext = Math.max(existing.reachesIntoOuterContext, config.reachesIntoOuterContext);
  if (config.precedenceFilterSuppressed) {
    existing.precedenceFilterSuppressed = true;
  }
  existing.context = merged;
  return true;
};
ATNConfigSet.prototype.getStates = function() {
  var states = new Set();
  for (var i = 0; i < this.configs.length; i++) {
    states.add(this.configs[i].state);
  }
  return states;
};
ATNConfigSet.prototype.getPredicates = function() {
  var preds = [];
  for (var i = 0; i < this.configs.length; i++) {
    var c = this.configs[i].semanticContext;
    if (c !== SemanticContext.NONE) {
      preds.push(c.semanticContext);
    }
  }
  return preds;
};
Object.defineProperty(ATNConfigSet.prototype, "items", {get: function() {
    return this.configs;
  }});
ATNConfigSet.prototype.optimizeConfigs = function(interpreter) {
  if (this.readonly) {
    throw "This set is readonly";
  }
  if (this.configLookup.length === 0) {
    return ;
  }
  for (var i = 0; i < this.configs.length; i++) {
    var config = this.configs[i];
    config.context = interpreter.getCachedContext(config.context);
  }
};
ATNConfigSet.prototype.addAll = function(coll) {
  for (var i = 0; i < coll.length; i++) {
    this.add(coll[i]);
  }
  return false;
};
ATNConfigSet.prototype.equals = function(other) {
  if (this === other) {
    return true;
  } else if (!(other instanceof ATNConfigSet)) {
    return false;
  }
  return this.configs !== null && this.configs.equals(other.configs) && this.fullCtx === other.fullCtx && this.uniqueAlt === other.uniqueAlt && this.conflictingAlts === other.conflictingAlts && this.hasSemanticContext === other.hasSemanticContext && this.dipsIntoOuterContext === other.dipsIntoOuterContext;
};
ATNConfigSet.prototype.hashString = function() {
  if (this.readonly) {
    if (this.cachedHashString === "-1") {
      this.cachedHashString = this.hashConfigs();
    }
    return this.cachedHashString;
  } else {
    return this.hashConfigs();
  }
};
ATNConfigSet.prototype.hashConfigs = function() {
  var s = "";
  this.configs.map(function(c) {
    s += c.toString();
  });
  return s;
};
Object.defineProperty(ATNConfigSet.prototype, "length", {get: function() {
    return this.configs.length;
  }});
ATNConfigSet.prototype.isEmpty = function() {
  return this.configs.length === 0;
};
ATNConfigSet.prototype.contains = function(item) {
  if (this.configLookup === null) {
    throw "This method is not implemented for readonly sets.";
  }
  return this.configLookup.contains(item);
};
ATNConfigSet.prototype.containsFast = function(item) {
  if (this.configLookup === null) {
    throw "This method is not implemented for readonly sets.";
  }
  return this.configLookup.containsFast(item);
};
ATNConfigSet.prototype.clear = function() {
  if (this.readonly) {
    throw "This set is readonly";
  }
  this.configs = [];
  this.cachedHashString = "-1";
  this.configLookup = new Set();
};
ATNConfigSet.prototype.setReadonly = function(readonly) {
  this.readonly = readonly;
  if (readonly) {
    this.configLookup = null;
  }
};
ATNConfigSet.prototype.toString = function() {
  return Utils.arrayToString(this.configs) + (this.hasSemanticContext ? ",hasSemanticContext=" + this.hasSemanticContext : "") + (this.uniqueAlt !== ATN.INVALID_ALT_NUMBER ? ",uniqueAlt=" + this.uniqueAlt : "") + (this.conflictingAlts !== null ? ",conflictingAlts=" + this.conflictingAlts : "") + (this.dipsIntoOuterContext ? ",dipsIntoOuterContext" : "");
};
function OrderedATNConfigSet() {
  ATNConfigSet.call(this);
  this.configLookup = new Set();
  return this;
}
OrderedATNConfigSet.prototype = Object.create(ATNConfigSet.prototype);
OrderedATNConfigSet.prototype.constructor = OrderedATNConfigSet;
exports.ATNConfigSet = ATNConfigSet;
exports.OrderedATNConfigSet = OrderedATNConfigSet;
