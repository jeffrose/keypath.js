/* */ 
var InputStream = require("./InputStream").InputStream;
try {
  var fs = require("fs");
} catch (ex) {}
function FileStream(fileName) {
  var data = fs.readFileSync(fileName, "utf8");
  InputStream.call(this, data);
  this.fileName = fileName;
  return this;
}
FileStream.prototype = Object.create(InputStream.prototype);
FileStream.prototype.constructor = FileStream;
exports.FileStream = FileStream;
