/* */ 
var LexerIndexedCustomAction = require("./LexerAction").LexerIndexedCustomAction;
function LexerActionExecutor(lexerActions) {
  this.lexerActions = lexerActions === null ? [] : lexerActions;
  this.hashString = lexerActions.toString();
  return this;
}
LexerActionExecutor.append = function(lexerActionExecutor, lexerAction) {
  if (lexerActionExecutor === null) {
    return new LexerActionExecutor([lexerAction]);
  }
  var lexerActions = lexerActionExecutor.lexerActions.concat([lexerAction]);
  return new LexerActionExecutor(lexerActions);
};
LexerActionExecutor.prototype.fixOffsetBeforeMatch = function(offset) {
  var updatedLexerActions = null;
  for (var i = 0; i < this.lexerActions.length; i++) {
    if (this.lexerActions[i].isPositionDependent && !(this.lexerActions[i] instanceof LexerIndexedCustomAction)) {
      if (updatedLexerActions === null) {
        updatedLexerActions = this.lexerActions.concat([]);
      }
      updatedLexerActions[i] = new LexerIndexedCustomAction(offset, this.lexerActions[i]);
    }
  }
  if (updatedLexerActions === null) {
    return this;
  } else {
    return new LexerActionExecutor(updatedLexerActions);
  }
};
LexerActionExecutor.prototype.execute = function(lexer, input, startIndex) {
  var requiresSeek = false;
  var stopIndex = input.index;
  try {
    for (var i = 0; i < this.lexerActions.length; i++) {
      var lexerAction = this.lexerActions[i];
      if (lexerAction instanceof LexerIndexedCustomAction) {
        var offset = lexerAction.offset;
        input.seek(startIndex + offset);
        lexerAction = lexerAction.action;
        requiresSeek = (startIndex + offset) !== stopIndex;
      } else if (lexerAction.isPositionDependent) {
        input.seek(stopIndex);
        requiresSeek = false;
      }
      lexerAction.execute(lexer);
    }
  } finally {
    if (requiresSeek) {
      input.seek(stopIndex);
    }
  }
};
LexerActionExecutor.prototype.hashString = function() {
  return this.hashString;
};
LexerActionExecutor.prototype.equals = function(other) {
  if (this === other) {
    return true;
  } else if (!(other instanceof LexerActionExecutor)) {
    return false;
  } else {
    return this.hashString === other.hashString && this.lexerActions === other.lexerActions;
  }
};
exports.LexerActionExecutor = LexerActionExecutor;
