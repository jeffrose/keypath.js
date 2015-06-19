/* */ 
var Set = require("../Utils").Set;
function SemanticContext() {
  return this;
}
SemanticContext.prototype.evaluate = function(parser, outerContext) {};
SemanticContext.prototype.evalPrecedence = function(parser, outerContext) {
  return this;
};
SemanticContext.andContext = function(a, b) {
  if (a === null || a === SemanticContext.NONE) {
    return b;
  }
  if (b === null || b === SemanticContext.NONE) {
    return a;
  }
  var result = new AND(a, b);
  if (result.opnds.length === 1) {
    return result.opnds[0];
  } else {
    return result;
  }
};
SemanticContext.orContext = function(a, b) {
  if (a === null) {
    return b;
  }
  if (b === null) {
    return a;
  }
  if (a === SemanticContext.NONE || b === SemanticContext.NONE) {
    return SemanticContext.NONE;
  }
  var result = new OR(a, b);
  if (result.opnds.length === 1) {
    return result.opnds[0];
  } else {
    return result;
  }
};
function Predicate(ruleIndex, predIndex, isCtxDependent) {
  SemanticContext.call(this);
  this.ruleIndex = ruleIndex === undefined ? -1 : ruleIndex;
  this.predIndex = predIndex === undefined ? -1 : predIndex;
  this.isCtxDependent = isCtxDependent === undefined ? false : isCtxDependent;
  return this;
}
Predicate.prototype = Object.create(SemanticContext.prototype);
Predicate.prototype.constructor = Predicate;
SemanticContext.NONE = new Predicate();
Predicate.prototype.evaluate = function(parser, outerContext) {
  var localctx = this.isCtxDependent ? outerContext : null;
  return parser.sempred(localctx, this.ruleIndex, this.predIndex);
};
Predicate.prototype.hashString = function() {
  return "" + this.ruleIndex + "/" + this.predIndex + "/" + this.isCtxDependent;
};
Predicate.prototype.equals = function(other) {
  if (this === other) {
    return true;
  } else if (!(other instanceof Predicate)) {
    return false;
  } else {
    return this.ruleIndex === other.ruleIndex && this.predIndex === other.predIndex && this.isCtxDependent === other.isCtxDependent;
  }
};
Predicate.prototype.toString = function() {
  return "{" + this.ruleIndex + ":" + this.predIndex + "}?";
};
function PrecedencePredicate(precedence) {
  SemanticContext.call(this);
  this.precedence = precedence === undefined ? 0 : precedence;
}
PrecedencePredicate.prototype = Object.create(SemanticContext.prototype);
PrecedencePredicate.prototype.constructor = PrecedencePredicate;
PrecedencePredicate.prototype.evaluate = function(parser, outerContext) {
  return parser.precpred(outerContext, this.precedence);
};
PrecedencePredicate.prototype.evalPrecedence = function(parser, outerContext) {
  if (parser.precpred(outerContext, this.precedence)) {
    return SemanticContext.NONE;
  } else {
    return null;
  }
};
PrecedencePredicate.prototype.compareTo = function(other) {
  return this.precedence - other.precedence;
};
PrecedencePredicate.prototype.hashString = function() {
  return "31";
};
PrecedencePredicate.prototype.equals = function(other) {
  if (this === other) {
    return true;
  } else if (!(other instanceof PrecedencePredicate)) {
    return false;
  } else {
    return this.precedence === other.precedence;
  }
};
PrecedencePredicate.prototype.toString = function() {
  return "{" + this.precedence + ">=prec}?";
};
PrecedencePredicate.filterPrecedencePredicates = function(set) {
  var result = [];
  set.values().map(function(context) {
    if (context instanceof PrecedencePredicate) {
      result.push(context);
    }
  });
  return result;
};
function AND(a, b) {
  SemanticContext.call(this);
  var operands = new Set();
  if (a instanceof AND) {
    a.opnds.map(function(o) {
      operands.add(o);
    });
  } else {
    operands.add(a);
  }
  if (b instanceof AND) {
    b.opnds.map(function(o) {
      operands.add(o);
    });
  } else {
    operands.add(b);
  }
  var precedencePredicates = PrecedencePredicate.filterPrecedencePredicates(operands);
  if (precedencePredicates.length > 0) {
    var reduced = null;
    precedencePredicates.map(function(p) {
      if (reduced === null || p.precedence < reduced.precedence) {
        reduced = p;
      }
    });
    operands.add(reduced);
  }
  this.opnds = operands.values();
  return this;
}
AND.prototype = Object.create(SemanticContext.prototype);
AND.prototype.constructor = AND;
AND.prototype.equals = function(other) {
  if (this === other) {
    return true;
  } else if (!(other instanceof AND)) {
    return false;
  } else {
    return this.opnds === other.opnds;
  }
};
AND.prototype.hashString = function() {
  return "" + this.opnds + "/AND";
};
AND.prototype.evaluate = function(parser, outerContext) {
  for (var i = 0; i < this.opnds.length; i++) {
    if (!this.opnds[i].evaluate(parser, outerContext)) {
      return false;
    }
  }
  return true;
};
AND.prototype.evalPrecedence = function(parser, outerContext) {
  var differs = false;
  var operands = [];
  for (var i = 0; i < this.opnds.length; i++) {
    var context = this.opnds[i];
    var evaluated = context.evalPrecedence(parser, outerContext);
    differs |= (evaluated !== context);
    if (evaluated === null) {
      return null;
    } else if (evaluated !== SemanticContext.NONE) {
      operands.push(evaluated);
    }
  }
  if (!differs) {
    return this;
  }
  if (operands.length === 0) {
    return SemanticContext.NONE;
  }
  var result = null;
  operands.map(function(o) {
    result = result === null ? o : SemanticPredicate.andContext(result, o);
  });
  return result;
};
AND.prototype.toString = function() {
  var s = "";
  this.opnds.map(function(o) {
    s += "&& " + o.toString();
  });
  return s.length > 3 ? s.slice(3) : s;
};
function OR(a, b) {
  SemanticContext.call(this);
  var operands = new Set();
  if (a instanceof OR) {
    a.opnds.map(function(o) {
      operands.add(o);
    });
  } else {
    operands.add(a);
  }
  if (b instanceof OR) {
    b.opnds.map(function(o) {
      operands.add(o);
    });
  } else {
    operands.add(b);
  }
  var precedencePredicates = PrecedencePredicate.filterPrecedencePredicates(operands);
  if (precedencePredicates.length > 0) {
    var s = precedencePredicates.sort(function(a, b) {
      return a.compareTo(b);
    });
    var reduced = s[s.length - 1];
    operands.add(reduced);
  }
  this.opnds = operands.values();
  return this;
}
OR.prototype = Object.create(SemanticContext.prototype);
OR.prototype.constructor = OR;
OR.prototype.constructor = function(other) {
  if (this === other) {
    return true;
  } else if (!(other instanceof OR)) {
    return false;
  } else {
    return this.opnds === other.opnds;
  }
};
OR.prototype.hashString = function() {
  return "" + this.opnds + "/OR";
};
OR.prototype.evaluate = function(parser, outerContext) {
  for (var i = 0; i < this.opnds.length; i++) {
    if (this.opnds[i].evaluate(parser, outerContext)) {
      return true;
    }
  }
  return false;
};
OR.prototype.evalPrecedence = function(parser, outerContext) {
  var differs = false;
  var operands = [];
  for (var i = 0; i < this.opnds.length; i++) {
    var context = this.opnds[i];
    var evaluated = context.evalPrecedence(parser, outerContext);
    differs |= (evaluated !== context);
    if (evaluated === SemanticContext.NONE) {
      return SemanticContext.NONE;
    } else if (evaluated !== null) {
      operands.push(evaluated);
    }
  }
  if (!differs) {
    return this;
  }
  if (operands.length === 0) {
    return null;
  }
  var result = null;
  operands.map(function(o) {
    return result === null ? o : SemanticContext.orContext(result, o);
  });
  return result;
};
AND.prototype.toString = function() {
  var s = "";
  this.opnds.map(function(o) {
    s += "|| " + o.toString();
  });
  return s.length > 3 ? s.slice(3) : s;
};
exports.SemanticContext = SemanticContext;
exports.PrecedencePredicate = PrecedencePredicate;
exports.Predicate = Predicate;
