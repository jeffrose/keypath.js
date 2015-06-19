/* */ 
var CommonToken = require("./Token").CommonToken;
function TokenFactory() {
  return this;
}
function CommonTokenFactory(copyText) {
  TokenFactory.call(this);
  this.copyText = copyText === undefined ? false : copyText;
  return this;
}
CommonTokenFactory.prototype = Object.create(TokenFactory.prototype);
CommonTokenFactory.prototype.constructor = CommonTokenFactory;
CommonTokenFactory.DEFAULT = new CommonTokenFactory();
CommonTokenFactory.prototype.create = function(source, type, text, channel, start, stop, line, column) {
  var t = new CommonToken(source, type, channel, start, stop);
  t.line = line;
  t.column = column;
  if (text !== null) {
    t.text = text;
  } else if (this.copyText && source[1] !== null) {
    t.text = source[1].getText(start, stop);
  }
  return t;
};
CommonTokenFactory.prototype.createThin = function(type, text) {
  var t = new CommonToken(null, type);
  t.text = text;
  return t;
};
exports.CommonTokenFactory = CommonTokenFactory;
