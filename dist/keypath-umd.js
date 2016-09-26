(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.KeyPathExp = factory());
}(this, (function () { 'use strict';

/**
 * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
 * @class Null
 * @extends external:null
 */

function Null() {}
Null.prototype = Object.create(null);
Null.prototype.constructor = Null;

var id = 0;

function nextId() {
    return ++id;
}

function Token(type, value) {
    if (typeof type !== 'string') {
        throw new TypeError('type must be a string');
    }

    if (typeof value === 'undefined') {
        throw new TypeError('value cannot be undefined');
    }

    this.id = nextId();
    this.type = type;
    this.value = value;
    this.length = value.length;
}

Token.prototype = new Null();

Token.prototype.constructor = Token;

Token.prototype.is = function (type) {
    return this.type === type;
};

Token.prototype.toJSON = function () {
    var json = new Null();

    json.type = this.type;
    json.value = this.value;

    return json;
};

Token.prototype.toString = function () {
    return String(this.value);
};

Token.prototype.valueOf = function () {
    return this.id;
};

function Identifier(value) {
    Token.call(this, 'identifier', value);
}

Identifier.prototype = Object.create(Token.prototype);

Identifier.prototype.constructor = Identifier;

function Literal(value) {
    Token.call(this, 'literal', value);
}

Literal.prototype = Object.create(Token.prototype);

Literal.prototype.constructor = Literal;

function Punctuator(value) {
    Token.call(this, 'punctuator', value);
}

Punctuator.prototype = Object.create(Token.prototype);

Punctuator.prototype.constructor = Punctuator;

/**
 * @class LexerError
 * @extends SyntaxError
 * @param {external:string} message The error message
 */
function LexerError(message) {
    SyntaxError.call(this, message);
}

LexerError.prototype = Object.create(SyntaxError.prototype);

/**
 * @class Lexer
 * @extends Null
 */
function Lexer() {
    this.buffer = '';
}

Lexer.prototype = new Null();

Lexer.prototype.constructor = Lexer;

Lexer.prototype.lex = function (text) {
    var _this = this;

    this.buffer = text;
    this.index = 0;
    this.tokens = [];

    var length = this.buffer.length;
    var word = '',
        char = void 0;

    while (this.index < length) {
        char = this.buffer[this.index];

        // Identifier
        if (this.isIdentifier(char)) {
            word = this.read(function (char) {
                return !this.isIdentifier(char) && !this.isNumeric(char);
            });

            this.tokens.push(new Identifier(word));

            // Punctuator
        } else if (this.isPunctuator(char)) {
            this.tokens.push(new Punctuator(char));
            this.index++;

            // Quoted String
        } else if (this.isQuote(char)) {
            (function () {
                var quote = char;

                _this.index++;

                word = _this.read(function (char) {
                    return char === quote;
                });

                _this.tokens.push(new Literal('' + quote + word + quote));

                _this.index++;

                // Numeric
            })();
        } else if (this.isNumeric(char)) {
            word = this.read(function (char) {
                return !this.isNumeric(char);
            });

            this.tokens.push(new Literal(word));

            // Whitespace
        } else if (this.isWhitespace(char)) {
            this.index++;

            // Error
        } else {
            this.throwError('"' + char + '" is an invalid character');
        }

        word = '';
    }

    return this.tokens;
};

Lexer.prototype.isIdentifier = function (char) {
    return 'a' <= char && char <= 'z' || 'A' <= char && char <= 'Z' || '_' === char || char === '$';
};

Lexer.prototype.isPunctuator = function (char) {
    return char === '.' || char === '(' || char === ')' || char === '[' || char === ']' || char === ',' || char === '%';
};

Lexer.prototype.isWhitespace = function (char) {
    return char === ' ' || char === '\r' || char === '\t' || char === '\n' || char === '\v' || char === ' ';
};

Lexer.prototype.isQuote = function (char) {
    return char === '"' || char === "'";
};

Lexer.prototype.isNumeric = function (char) {
    return '0' <= char && char <= '9';
};

Lexer.prototype.read = function (until) {
    var start = this.index,
        char = void 0;

    while (this.index < this.buffer.length) {
        char = this.buffer[this.index];

        if (until.call(this, char)) {
            break;
        }

        this.index++;
    }

    return this.buffer.slice(start, this.index);
};

Lexer.prototype.throwError = function (message) {
    throw new LexerError(message);
};

Lexer.prototype.toJSON = function () {
    var json = new Null();

    json.buffer = this.buffer;

    return json;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};















var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

/**
 * @class Node
 * @extends Null
 * @param {external:string} type The type of node
 */
function Node(type) {

    if (typeof type !== 'string') {
        throw new TypeError('type must be a string');
    }

    this.id = nextId();
    this.type = type;
}

Node.prototype = new Null();

Node.prototype.constructor = Node;

Node.prototype.equals = function (node) {
    return node instanceof Node && this.id === node.id;
};

Node.prototype.is = function (type) {
    return this.type === type;
};

Node.prototype.toJSON = function () {
    var json = new Null();

    json.type = this.type;

    return json;
};

Node.prototype.toString = function () {
    return String(this.type);
};

Node.prototype.valueOf = function () {
    return this.id;
};

function Statement(statementType) {
    Node.call(this, statementType);
}

Statement.prototype = Object.create(Node.prototype);

Statement.prototype.constructor = Statement;

function Expression(expressionType) {
    Node.call(this, expressionType);
}

Expression.prototype = Object.create(Node.prototype);

Expression.prototype.constructor = Expression;

function Program(body) {
    Node.call(this, 'Program');

    if (!Array.isArray(body)) {
        throw new TypeError('body must be an array');
    }

    this.body = body || [];
}

Program.prototype = Object.create(Node.prototype);

Program.prototype.constructor = Program;

Program.prototype.addStatement = function (statement) {
    if (!(statement instanceof Statement)) {
        throw new TypeError('statement must be a statement');
    }

    this.body.push(statement);
};

Program.prototype.toJSON = function () {
    var json = Node.prototype.toJSON.call(this);

    json.body = this.body.map(function (node) {
        return node.toJSON();
    });

    return json;
};

function ExpressionStatement(expression) {
    Statement.call(this, 'ExpressionStatement');

    if (!(expression instanceof Expression)) {
        throw new TypeError('argument must be an expression');
    }

    this.expression = expression;
}

ExpressionStatement.prototype = Object.create(Statement.prototype);

ExpressionStatement.prototype.constructor = ExpressionStatement;

ExpressionStatement.prototype.toJSON = function () {
    var json = Node.prototype.toJSON.call(this);

    json.expression = this.expression.toJSON();

    return json;
};

function CallExpression(callee, args) {
    Expression.call(this, 'CallExpression');

    if (!Array.isArray(args)) {
        throw new TypeError('arguments must be an array');
    }

    this.callee = callee;
    this.arguments = args;
}

CallExpression.prototype = Object.create(Expression.prototype);

CallExpression.prototype.constructor = CallExpression;

CallExpression.prototype.toJSON = function () {
    var json = Node.prototype.toJSON.call(this);

    json.callee = this.callee.toJSON();
    json.arguments = this.arguments.map(function (node) {
        return node.toJSON();
    });

    return json;
};

function MemberExpression(object, property, computed) {
    Expression.call(this, 'MemberExpression');

    if (computed) {
        if (!(property instanceof Expression)) {
            throw new TypeError('property must be an expression when computed is true');
        }
    } else {
        if (!(property instanceof Identifier$1)) {
            throw new TypeError('property must be an identifier when computed is false');
        }
    }

    this.object = object;
    this.property = property;
    this.computed = computed || false;
}

MemberExpression.prototype = Object.create(Expression.prototype);

MemberExpression.prototype.constructor = MemberExpression;

MemberExpression.prototype.toJSON = function () {
    var json = Node.prototype.toJSON.call(this);

    json.object = this.object.toJSON();
    json.property = this.property.toJSON();
    json.computed = this.computed;

    return json;
};

function Identifier$1(name) {
    Expression.call(this, 'Identifier');

    if (typeof name !== 'string') {
        throw new TypeError('name must be a string');
    }

    this.name = name;
}

Identifier$1.prototype = Object.create(Expression.prototype);

Identifier$1.prototype.constructor = Identifier$1;

Identifier$1.prototype.toJSON = function () {
    var json = Node.prototype.toJSON.call(this);

    json.name = this.name;

    return json;
};

function Literal$1(value) {
    Expression.call(this, 'Literal');

    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

    if ('boolean number string'.split(' ').indexOf(type) === -1 && value !== null && !(value instanceof RegExp)) {
        throw new TypeError('value must be a boolean, number, string, null, or instance of RegExp');
    }

    this.value = value;
}

Literal$1.prototype = Object.create(Expression.prototype);

Literal$1.prototype.constructor = Literal$1;

Literal$1.prototype.toJSON = function () {
    var json = Node.prototype.toJSON.call(this);

    json.value = this.value;

    return json;
};

function Punctuator$1(value) {
    Node.call(this, 'Punctuator');

    if (typeof value !== 'string') {
        throw new TypeError('value must be a string');
    }

    this.value = value;
}

Punctuator$1.prototype = Object.create(Node.prototype);

Punctuator$1.prototype.constructor = Punctuator$1;

Punctuator$1.prototype.toJSON = function () {
    var json = Node.prototype.toJSON.call(this);

    json.value = this.value;

    return json;
};

/**
 * @class BuilderError
 * @extends SyntaxError
 * @param {external:string} message The error message
 */
function BuilderError(message) {
    SyntaxError.call(this, message);
}

BuilderError.prototype = Object.create(SyntaxError.prototype);

BuilderError.prototype.constructor = BuilderError;

/**
 * @class Builder
 * @extends Null
 * @param {Lexer} lexer
 */
function Builder(lexer) {
    this.lexer = lexer;
}

Builder.prototype = new Null();

Builder.prototype.constructor = Builder;

Builder.prototype.arguments = function () {
    var args = [];

    if (this.peek().value !== '(') {
        do {
            args.unshift(this.expression());
        } while (this.expect(','));
    }

    return args;
};

Builder.prototype.build = function (text) {
    this.buffer = text;
    this.tokens = this.lexer.lex(text);

    var program = this.program();

    if (this.tokens.length) {
        this.throwError('Unexpected token ' + this.tokens[0] + ' remaining');
    }

    return program;
};

Builder.prototype.consume = function (expected) {
    if (!this.tokens.length) {
        this.throwError('Unexpected end of expression');
    }

    var token = this.expect(expected);

    if (!token) {
        this.throwError('Unexpected token ' + token.value + ' consumed');
    }

    return token;
};

Builder.prototype.expect = function (first, second, third, fourth) {
    var token = this.peek(first, second, third, fourth);

    if (token) {
        this.tokens.pop();
        return token;
    }

    return undefined;
};

Builder.prototype.expression = function () {
    var expression = null,
        next = this.peek();

    if (typeof next !== 'undefined') {
        var args = void 0,
            callee = void 0,
            object = void 0,
            property = void 0;

        switch (next.type) {

            case 'identifier':
                expression = this.identifier();
                next = this.peek();

                if (typeof next !== 'undefined' && next.type === 'punctuator') {
                    next.value === '.' && this.consume('.');
                    property = expression;
                    object = this.expression();
                    expression = new MemberExpression(object, property, false);
                }
                break;

            case 'literal':
                expression = this.literal();
                break;

            case 'punctuator':
                if (next.value === ')') {
                    this.consume(')');
                    args = this.arguments();
                    this.consume('(');
                    callee = this.expression();
                    expression = new CallExpression(callee, args);
                } else if (next.value === ']') {
                    this.consume(']');
                    property = this.literal();
                    this.consume('[');
                    object = this.expression();
                    expression = new MemberExpression(object, property, true);
                } else {
                    this.throwError('Unexpected punctuator token: ' + next.value);
                }
                break;

            default:
                this.throwError('Unexpected ' + next.type + ' token: ' + next.value);
        }
    }

    return expression;
};

Builder.prototype.expressionStatement = function () {
    return new ExpressionStatement(this.expression());
};

Builder.prototype.identifier = function () {
    var token = this.consume();

    if (!(token.type === 'identifier')) {
        this.throwError('Identifier expected');
    }

    return new Identifier$1(token.value);
};

Builder.prototype.literal = function () {
    var token = this.consume();

    if (!(token.type === 'literal')) {
        this.throwError('Literal expected');
    }

    var value = token.value,
        literal = value[0] === '"' || value[0] === "'" ?
    // String Literal
    value.substring(1, value.length - 1) :
    // Numeric Literal
    parseFloat(value);

    return new Literal$1(literal);
};

Builder.prototype.peek = function (first, second, third, fourth) {
    var length = this.tokens.length;
    return length ? this.peekAt(length - 1, first, second, third, fourth) : undefined;
};

Builder.prototype.peekAt = function (index, first, second, third, fourth) {
    var token = this.tokens[index],
        value = token.value;

    if (value === first || value === second || value === third || value === fourth || !arguments.length || !first && !second && !third && !fourth) {
        return token;
    }

    return undefined;
};

Builder.prototype.program = function () {
    var body = [];

    while (true) {
        if (this.tokens.length) {
            body.push(this.expressionStatement());
        } else {
            return new Program(body);
        }
    }
};

Builder.prototype.punctuator = function () {
    var token = this.consume();

    if (!(token.type === 'punctuator')) {
        throw new BuilderError('Punctuator expected');
    }

    return new Punctuator$1(token.value);
};

Builder.prototype.throwError = function (message) {
    throw new BuilderError(message);
};

function forEach(arrayLike, callback) {
    var index = 0,
        length = arrayLike.length,
        item = void 0;

    for (; index < length; index++) {
        item = arrayLike[index];
        callback(item);
    }
}

var noop = function noop() {};

/**
 * @class Interpreter
 * @extends Null
 * @param {Builder} builder
 */
function Interpreter(builder) {
    this.builder = builder;
}

Interpreter.prototype = new Null();

Interpreter.prototype.constructor = Interpreter;

Interpreter.prototype.compile = function (expression) {
    var ast = this.builder.build(expression),
        body = ast.body,
        expressions = [],
        interpreter = this,
        fn;

    interpreter.expression = expression;

    forEach(body, function (statement) {
        expressions.push(interpreter.recurse(statement.expression, false));
    });

    fn = body.length === 0 ? noop : body.length === 1 ? expressions[0] : function () {
        console.log('FOO', arguments);
        return 'foo';
    };

    return function (target, create, value) {
        return fn(target, create, value);
    };
};

Interpreter.prototype.computedMember = function (left, right, context, expression) {
    return function (base, create) {
        var lhs = left(base, create);
        var rhs = void 0,
            value = void 0;

        if (typeof lhs !== 'undefined') {
            rhs = right(base, create);

            if (create && !(rhs in lhs)) {
                lhs[rhs] = new Null();
            }

            value = lhs[rhs];
        }

        return context ? { context: lhs, name: rhs, value: value } : value;
    };
};

Interpreter.prototype.identifier = function (name, context, expression) {
    return function (base, create) {
        var value = void 0;

        if (typeof base !== 'undefined') {
            if (create && !(name in base)) {
                base[name] = new Null();
            }

            value = base[name];
        }

        return context ? { context: base, name: name, value: value } : value;
    };
};

Interpreter.prototype.nonComputedMember = function (left, right, context, expression) {
    return function (base, create, value) {
        var lhs = left(base, create);
        var returnValue = void 0;

        if (typeof lhs !== 'undefined') {
            if (create && !(right in lhs)) {
                lhs[right] = value || new Null();
            }

            returnValue = lhs[right];
        }

        return context ? { context: lhs, name: right, value: returnValue } : returnValue;
    };
};

Interpreter.prototype.recurse = function (node, context) {
    var interpreter = this;
    var left = void 0,
        right = void 0;

    var _ret = function () {
        switch (node.type) {
            case 'CallExpression':
                var args = [];

                forEach(node.arguments, function (expr) {
                    args.push(interpreter.recurse(expr, false));
                });

                right = interpreter.recurse(node.callee, true);

                return {
                    v: function v(base, create) {
                        var rhs = right(base, create);
                        var value = void 0;

                        if (typeof rhs.value === 'function') {
                            var values = args.map(function (arg) {
                                return arg(base, create);
                            });
                            value = rhs.value.apply(rhs.context, values);
                        } else if (create) {
                            throw new Error('cannot create functions');
                        }

                        return context ? { value: value } : value;
                    }
                };
            case 'Identifier':
                return {
                    v: interpreter.identifier(node.name, context, interpreter.expression)
                };
            case 'Literal':
                return {
                    v: interpreter.value(node.value, context)
                };
            case 'MemberExpression':
                left = interpreter.recurse(node.object, false);
                right = node.computed ? interpreter.recurse(node.property, false) : node.property.name;

                return {
                    v: node.computed ? interpreter.computedMember(left, right, context, interpreter.expression) : interpreter.nonComputedMember(left, right, context, interpreter.expression)
                };
            case 'Program':
                break;
        }
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
};

Interpreter.prototype.value = function (value, context) {
    return function () {
        return context ? { context: undefined, name: undefined, value: value } : value;
    };
};

var lexer = new Lexer();
var builder = new Builder(lexer);
var intrepreter = new Interpreter(builder);

/**
 * @class KeyPathExp
 * @extends Null
 * @param {external:string} pattern
 * @param {external:string} flags
 */
function KeyPathExp(pattern, flags) {
    Object.defineProperty(this, 'value', {
        value: intrepreter.compile(pattern),
        configurable: false,
        enumerable: false,
        writable: false
    });
}

KeyPathExp.prototype = new Null();

KeyPathExp.prototype.constructor = KeyPathExp;

KeyPathExp.prototype.get = function (target) {
    return this.value(target, false);
};

KeyPathExp.prototype.set = function (target, value) {
    return this.value(target, true, value);
};

return KeyPathExp;

})));

//# sourceMappingURL=keypath-umd.js.map