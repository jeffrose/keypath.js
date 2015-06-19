/* */ 
var DFAState = require("../dfa/DFAState").DFAState;
var ATNConfigSet = require("./ATNConfigSet").ATNConfigSet;
var getCachedPredictionContext = require("../PredictionContext").getCachedPredictionContext;
function ATNSimulator(atn, sharedContextCache) {
  this.atn = atn;
  this.sharedContextCache = sharedContextCache;
  return this;
}
ATNSimulator.ERROR = new DFAState(0x7FFFFFFF, new ATNConfigSet());
ATNSimulator.prototype.getCachedContext = function(context) {
  if (this.sharedContextCache === null) {
    return context;
  }
  var visited = {};
  return getCachedPredictionContext(context, this.sharedContextCache, visited);
};
exports.ATNSimulator = ATNSimulator;
