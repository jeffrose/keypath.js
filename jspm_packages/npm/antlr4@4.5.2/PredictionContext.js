/* */ 
var RuleContext = require("./RuleContext").RuleContext;
function PredictionContext(cachedHashString) {
  this.cachedHashString = cachedHashString;
}
PredictionContext.EMPTY = null;
PredictionContext.EMPTY_RETURN_STATE = 0x7FFFFFFF;
PredictionContext.globalNodeCount = 1;
PredictionContext.id = PredictionContext.globalNodeCount;
PredictionContext.prototype.isEmpty = function() {
  return this === PredictionContext.EMPTY;
};
PredictionContext.prototype.hasEmptyPath = function() {
  return this.getReturnState(this.length - 1) === PredictionContext.EMPTY_RETURN_STATE;
};
PredictionContext.prototype.hashString = function() {
  return this.cachedHashString;
};
function calculateHashString(parent, returnState) {
  return "" + parent + returnState;
}
function calculateEmptyHashString() {
  return "";
}
function PredictionContextCache() {
  this.cache = {};
  return this;
}
PredictionContextCache.prototype.add = function(ctx) {
  if (ctx === PredictionContext.EMPTY) {
    return PredictionContext.EMPTY;
  }
  var existing = this.cache[ctx];
  if (existing !== null) {
    return existing;
  }
  this.cache[ctx] = ctx;
  return ctx;
};
PredictionContextCache.prototype.get = function(ctx) {
  return this.cache[ctx] || null;
};
Object.defineProperty(PredictionContextCache.prototype, "length", {get: function() {
    return this.cache.length;
  }});
function SingletonPredictionContext(parent, returnState) {
  var hashString = parent !== null ? calculateHashString(parent, returnState) : calculateEmptyHashString();
  PredictionContext.call(this, hashString);
  this.parentCtx = parent;
  this.returnState = returnState;
}
SingletonPredictionContext.prototype = Object.create(PredictionContext.prototype);
SingletonPredictionContext.prototype.contructor = SingletonPredictionContext;
SingletonPredictionContext.create = function(parent, returnState) {
  if (returnState === PredictionContext.EMPTY_RETURN_STATE && parent === null) {
    return PredictionContext.EMPTY;
  } else {
    return new SingletonPredictionContext(parent, returnState);
  }
};
Object.defineProperty(SingletonPredictionContext.prototype, "length", {get: function() {
    return 1;
  }});
SingletonPredictionContext.prototype.getParent = function(index) {
  return this.parentCtx;
};
SingletonPredictionContext.prototype.getReturnState = function(index) {
  return this.returnState;
};
SingletonPredictionContext.prototype.equals = function(other) {
  if (this === other) {
    return true;
  } else if (!(other instanceof SingletonPredictionContext)) {
    return false;
  } else if (this.hashString() !== other.hashString()) {
    return false;
  } else {
    if (this.returnState !== other.returnState)
      return false;
    else if (this.parentCtx == null)
      return other.parentCtx == null;
    else
      return this.parentCtx.equals(other.parentCtx);
  }
};
SingletonPredictionContext.prototype.hashString = function() {
  return this.cachedHashString;
};
SingletonPredictionContext.prototype.toString = function() {
  var up = this.parentCtx === null ? "" : this.parentCtx.toString();
  if (up.length === 0) {
    if (this.returnState === this.EMPTY_RETURN_STATE) {
      return "$";
    } else {
      return "" + this.returnState;
    }
  } else {
    return "" + this.returnState + " " + up;
  }
};
function EmptyPredictionContext() {
  SingletonPredictionContext.call(this, null, PredictionContext.EMPTY_RETURN_STATE);
  return this;
}
EmptyPredictionContext.prototype = Object.create(SingletonPredictionContext.prototype);
EmptyPredictionContext.prototype.constructor = EmptyPredictionContext;
EmptyPredictionContext.prototype.isEmpty = function() {
  return true;
};
EmptyPredictionContext.prototype.getParent = function(index) {
  return null;
};
EmptyPredictionContext.prototype.getReturnState = function(index) {
  return this.returnState;
};
EmptyPredictionContext.prototype.equals = function(other) {
  return this === other;
};
EmptyPredictionContext.prototype.toString = function() {
  return "$";
};
PredictionContext.EMPTY = new EmptyPredictionContext();
function ArrayPredictionContext(parents, returnStates) {
  var hash = calculateHashString(parents, returnStates);
  PredictionContext.call(this, hash);
  this.parents = parents;
  this.returnStates = returnStates;
  return this;
}
ArrayPredictionContext.prototype = Object.create(PredictionContext.prototype);
ArrayPredictionContext.prototype.constructor = ArrayPredictionContext;
ArrayPredictionContext.prototype.isEmpty = function() {
  return this.returnStates[0] === PredictionContext.EMPTY_RETURN_STATE;
};
Object.defineProperty(ArrayPredictionContext.prototype, "length", {get: function() {
    return this.returnStates.length;
  }});
ArrayPredictionContext.prototype.getParent = function(index) {
  return this.parents[index];
};
ArrayPredictionContext.prototype.getReturnState = function(index) {
  return this.returnStates[index];
};
ArrayPredictionContext.prototype.equals = function(other) {
  if (this === other) {
    return true;
  } else if (!(other instanceof ArrayPredictionContext)) {
    return false;
  } else if (this.hashString !== other.hashString()) {
    return false;
  } else {
    return this.returnStates === other.returnStates && this.parents === other.parents;
  }
};
ArrayPredictionContext.prototype.toString = function() {
  if (this.isEmpty()) {
    return "[]";
  } else {
    var s = "[";
    for (var i = 0; i < this.returnStates.length; i++) {
      if (i > 0) {
        s = s + ", ";
      }
      if (this.returnStates[i] === PredictionContext.EMPTY_RETURN_STATE) {
        s = s + "$";
        continue;
      }
      s = s + this.returnStates[i];
      if (this.parents[i] !== null) {
        s = s + " " + this.parents[i];
      } else {
        s = s + "null";
      }
    }
    return s + "]";
  }
};
function predictionContextFromRuleContext(atn, outerContext) {
  if (outerContext === undefined || outerContext === null) {
    outerContext = RuleContext.EMPTY;
  }
  if (outerContext.parentCtx === null || outerContext === RuleContext.EMPTY) {
    return PredictionContext.EMPTY;
  }
  var parent = predictionContextFromRuleContext(atn, outerContext.parentCtx);
  var state = atn.states[outerContext.invokingState];
  var transition = state.transitions[0];
  return SingletonPredictionContext.create(parent, transition.followState.stateNumber);
}
function calculateListsHashString(parents, returnStates) {
  var s = "";
  parents.map(function(p) {
    s = s + p;
  });
  returnStates.map(function(r) {
    s = s + r;
  });
  return s;
}
function merge(a, b, rootIsWildcard, mergeCache) {
  if (a === b) {
    return a;
  }
  if (a instanceof SingletonPredictionContext && b instanceof SingletonPredictionContext) {
    return mergeSingletons(a, b, rootIsWildcard, mergeCache);
  }
  if (rootIsWildcard) {
    if (a instanceof EmptyPredictionContext) {
      return a;
    }
    if (b instanceof EmptyPredictionContext) {
      return b;
    }
  }
  if (a instanceof SingletonPredictionContext) {
    a = new ArrayPredictionContext([a.getParent()], [a.returnState]);
  }
  if (b instanceof SingletonPredictionContext) {
    b = new ArrayPredictionContext([b.getParent()], [b.returnState]);
  }
  return mergeArrays(a, b, rootIsWildcard, mergeCache);
}
function mergeSingletons(a, b, rootIsWildcard, mergeCache) {
  if (mergeCache !== null) {
    var previous = mergeCache.get(a, b);
    if (previous !== null) {
      return previous;
    }
    previous = mergeCache.get(b, a);
    if (previous !== null) {
      return previous;
    }
  }
  var rootMerge = mergeRoot(a, b, rootIsWildcard);
  if (rootMerge !== null) {
    if (mergeCache !== null) {
      mergeCache.set(a, b, rootMerge);
    }
    return rootMerge;
  }
  if (a.returnState === b.returnState) {
    var parent = merge(a.parentCtx, b.parentCtx, rootIsWildcard, mergeCache);
    if (parent === a.parentCtx) {
      return a;
    }
    if (parent === b.parentCtx) {
      return b;
    }
    var spc = SingletonPredictionContext.create(parent, a.returnState);
    if (mergeCache !== null) {
      mergeCache.set(a, b, spc);
    }
    return spc;
  } else {
    var singleParent = null;
    if (a === b || (a.parentCtx !== null && a.parentCtx === b.parentCtx)) {
      singleParent = a.parentCtx;
    }
    if (singleParent !== null) {
      var payloads = [a.returnState, b.returnState];
      if (a.returnState > b.returnState) {
        payloads[0] = b.returnState;
        payloads[1] = a.returnState;
      }
      var parents = [singleParent, singleParent];
      var apc = new ArrayPredictionContext(parents, payloads);
      if (mergeCache !== null) {
        mergeCache.set(a, b, apc);
      }
      return apc;
    }
    var payloads = [a.returnState, b.returnState];
    var parents = [a.parentCtx, b.parentCtx];
    if (a.returnState > b.returnState) {
      payloads[0] = b.returnState;
      payloads[1] = a.returnState;
      parents = [b.parentCtx, a.parentCtx];
    }
    var a_ = new ArrayPredictionContext(parents, payloads);
    if (mergeCache !== null) {
      mergeCache.set(a, b, a_);
    }
    return a_;
  }
}
function mergeRoot(a, b, rootIsWildcard) {
  if (rootIsWildcard) {
    if (a === PredictionContext.EMPTY) {
      return PredictionContext.EMPTY;
    }
    if (b === PredictionContext.EMPTY) {
      return PredictionContext.EMPTY;
    }
  } else {
    if (a === PredictionContext.EMPTY && b === PredictionContext.EMPTY) {
      return PredictionContext.EMPTY;
    } else if (a === PredictionContext.EMPTY) {
      var payloads = [b.returnState, PredictionContext.EMPTY_RETURN_STATE];
      var parents = [b.parentCtx, null];
      return new ArrayPredictionContext(parents, payloads);
    } else if (b === PredictionContext.EMPTY) {
      var payloads = [a.returnState, PredictionContext.EMPTY_RETURN_STATE];
      var parents = [a.parentCtx, null];
      return new ArrayPredictionContext(parents, payloads);
    }
  }
  return null;
}
function mergeArrays(a, b, rootIsWildcard, mergeCache) {
  if (mergeCache !== null) {
    var previous = mergeCache.get(a, b);
    if (previous !== null) {
      return previous;
    }
    previous = mergeCache.get(b, a);
    if (previous !== null) {
      return previous;
    }
  }
  var i = 0;
  var j = 0;
  var k = 0;
  var mergedReturnStates = [];
  var mergedParents = [];
  while (i < a.returnStates.length && j < b.returnStates.length) {
    var a_parent = a.parents[i];
    var b_parent = b.parents[j];
    if (a.returnStates[i] === b.returnStates[j]) {
      var payload = a.returnStates[i];
      var bothDollars = payload === PredictionContext.EMPTY_RETURN_STATE && a_parent === null && b_parent === null;
      var ax_ax = (a_parent !== null && b_parent !== null && a_parent === b_parent);
      if (bothDollars || ax_ax) {
        mergedParents[k] = a_parent;
        mergedReturnStates[k] = payload;
      } else {
        var mergedParent = merge(a_parent, b_parent, rootIsWildcard, mergeCache);
        mergedParents[k] = mergedParent;
        mergedReturnStates[k] = payload;
      }
      i += 1;
      j += 1;
    } else if (a.returnStates[i] < b.returnStates[j]) {
      mergedParents[k] = a_parent;
      mergedReturnStates[k] = a.returnStates[i];
      i += 1;
    } else {
      mergedParents[k] = b_parent;
      mergedReturnStates[k] = b.returnStates[j];
      j += 1;
    }
    k += 1;
  }
  if (i < a.returnStates.length) {
    for (var p = i; p < a.returnStates.length; p++) {
      mergedParents[k] = a.parents[p];
      mergedReturnStates[k] = a.returnStates[p];
      k += 1;
    }
  } else {
    for (var p = j; p < b.returnStates.length; p++) {
      mergedParents[k] = b.parents[p];
      mergedReturnStates[k] = b.returnStates[p];
      k += 1;
    }
  }
  if (k < mergedParents.length) {
    if (k === 1) {
      var a_ = SingletonPredictionContext.create(mergedParents[0], mergedReturnStates[0]);
      if (mergeCache !== null) {
        mergeCache.set(a, b, a_);
      }
      return a_;
    }
    mergedParents = mergedParents.slice(0, k);
    mergedReturnStates = mergedReturnStates.slice(0, k);
  }
  var M = new ArrayPredictionContext(mergedParents, mergedReturnStates);
  if (M === a) {
    if (mergeCache !== null) {
      mergeCache.set(a, b, a);
    }
    return a;
  }
  if (M === b) {
    if (mergeCache !== null) {
      mergeCache.set(a, b, b);
    }
    return b;
  }
  combineCommonParents(mergedParents);
  if (mergeCache !== null) {
    mergeCache.set(a, b, M);
  }
  return M;
}
function combineCommonParents(parents) {
  var uniqueParents = {};
  for (var p = 0; p < parents.length; p++) {
    var parent = parents[p];
    if (!(parent in uniqueParents)) {
      uniqueParents[parent] = parent;
    }
  }
  for (var q = 0; q < parents.length; q++) {
    parents[q] = uniqueParents[parents[q]];
  }
}
function getCachedPredictionContext(context, contextCache, visited) {
  if (context.isEmpty()) {
    return context;
  }
  var existing = visited[context] || null;
  if (existing !== null) {
    return existing;
  }
  existing = contextCache.get(context);
  if (existing !== null) {
    visited[context] = existing;
    return existing;
  }
  var changed = false;
  var parents = [];
  for (var i = 0; i < parents.length; i++) {
    var parent = getCachedPredictionContext(context.getParent(i), contextCache, visited);
    if (changed || parent !== context.getParent(i)) {
      if (!changed) {
        parents = [];
        for (var j = 0; j < context.length; j++) {
          parents[j] = context.getParent(j);
        }
        changed = true;
      }
      parents[i] = parent;
    }
  }
  if (!changed) {
    contextCache.add(context);
    visited[context] = context;
    return context;
  }
  var updated = null;
  if (parents.length === 0) {
    updated = PredictionContext.EMPTY;
  } else if (parents.length === 1) {
    updated = SingletonPredictionContext.create(parents[0], context.getReturnState(0));
  } else {
    updated = new ArrayPredictionContext(parents, context.returnStates);
  }
  contextCache.add(updated);
  visited[updated] = updated;
  visited[context] = updated;
  return updated;
}
function getAllContextNodes(context, nodes, visited) {
  if (nodes === null) {
    nodes = [];
    return getAllContextNodes(context, nodes, visited);
  } else if (visited === null) {
    visited = {};
    return getAllContextNodes(context, nodes, visited);
  } else {
    if (context === null || visited[context] !== null) {
      return nodes;
    }
    visited[context] = context;
    nodes.push(context);
    for (var i = 0; i < context.length; i++) {
      getAllContextNodes(context.getParent(i), nodes, visited);
    }
    return nodes;
  }
}
exports.merge = merge;
exports.PredictionContext = PredictionContext;
exports.PredictionContextCache = PredictionContextCache;
exports.SingletonPredictionContext = SingletonPredictionContext;
exports.predictionContextFromRuleContext = predictionContextFromRuleContext;
exports.getCachedPredictionContext = getCachedPredictionContext;
