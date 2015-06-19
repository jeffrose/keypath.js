/* */ 
var DecisionState = require("./ATNState").DecisionState;
var SemanticContext = require("./SemanticContext").SemanticContext;
function checkParams(params, isCfg) {
  if (params === null) {
    var result = {
      state: null,
      alt: null,
      context: null,
      semanticContext: null
    };
    if (isCfg) {
      result.reachesIntoOuterContext = 0;
    }
    return result;
  } else {
    var props = {};
    props.state = params.state || null;
    props.alt = params.alt || null;
    props.context = params.context || null;
    props.semanticContext = params.semanticContext || null;
    if (isCfg) {
      props.reachesIntoOuterContext = params.reachesIntoOuterContext || 0;
      props.precedenceFilterSuppressed = params.precedenceFilterSuppressed || false;
    }
    return props;
  }
}
function ATNConfig(params, config) {
  this.checkContext(params, config);
  params = checkParams(params);
  config = checkParams(config, true);
  this.state = params.state !== null ? params.state : config.state;
  this.alt = params.alt !== null ? params.alt : config.alt;
  this.context = params.context !== null ? params.context : config.context;
  this.semanticContext = params.semanticContext !== null ? params.semanticContext : (config.semanticContext !== null ? config.semanticContext : SemanticContext.NONE);
  this.reachesIntoOuterContext = config.reachesIntoOuterContext;
  this.precedenceFilterSuppressed = config.precedenceFilterSuppressed;
  return this;
}
ATNConfig.prototype.checkContext = function(params, config) {
  if ((params.context === null || params.context === undefined) && (config === null || config.context === null || config.context === undefined)) {
    this.context = null;
  }
};
ATNConfig.prototype.equals = function(other) {
  if (this === other) {
    return true;
  } else if (!(other instanceof ATNConfig)) {
    return false;
  } else {
    return this.state.stateNumber === other.state.stateNumber && this.alt === other.alt && (this.context === null ? other.context === null : this.context.equals(other.context)) && this.semanticContext.equals(other.semanticContext) && this.precedenceFilterSuppressed === other.precedenceFilterSuppressed;
  }
};
ATNConfig.prototype.shortHashString = function() {
  return "" + this.state.stateNumber + "/" + this.alt + "/" + this.semanticContext;
};
ATNConfig.prototype.hashString = function() {
  return "" + this.state.stateNumber + "/" + this.alt + "/" + (this.context === null ? "" : this.context.hashString()) + "/" + this.semanticContext.hashString();
};
ATNConfig.prototype.toString = function() {
  return "(" + this.state + "," + this.alt + (this.context !== null ? ",[" + this.context.toString() + "]" : "") + (this.semanticContext !== SemanticContext.NONE ? ("," + this.semanticContext.toString()) : "") + (this.reachesIntoOuterContext > 0 ? (",up=" + this.reachesIntoOuterContext) : "") + ")";
};
function LexerATNConfig(params, config) {
  ATNConfig.call(this, params, config);
  var lexerActionExecutor = params.lexerActionExecutor || null;
  this.lexerActionExecutor = lexerActionExecutor || (config !== null ? config.lexerActionExecutor : null);
  this.passedThroughNonGreedyDecision = config !== null ? this.checkNonGreedyDecision(config, this.state) : false;
  return this;
}
LexerATNConfig.prototype = Object.create(ATNConfig.prototype);
LexerATNConfig.prototype.constructor = LexerATNConfig;
LexerATNConfig.prototype.hashString = function() {
  return "" + this.state.stateNumber + this.alt + this.context + this.semanticContext + (this.passedThroughNonGreedyDecision ? 1 : 0) + this.lexerActionExecutor;
};
LexerATNConfig.prototype.equals = function(other) {
  if (this === other) {
    return true;
  } else if (!(other instanceof LexerATNConfig)) {
    return false;
  } else if (this.passedThroughNonGreedyDecision !== other.passedThroughNonGreedyDecision) {
    return false;
  } else if (this.lexerActionExecutor !== other.lexerActionExecutor) {
    return false;
  } else {
    return ATNConfig.prototype.equals.call(this, other);
  }
};
LexerATNConfig.prototype.checkNonGreedyDecision = function(source, target) {
  return source.passedThroughNonGreedyDecision || (target instanceof DecisionState) && target.nonGreedy;
};
exports.ATNConfig = ATNConfig;
exports.LexerATNConfig = LexerATNConfig;
