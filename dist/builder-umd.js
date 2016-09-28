(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Builder = factory());
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
    return node instanceof Node && this.valueOf() === node.valueOf();
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

Program.prototype.toJSON = function () {
    var json = Node.prototype.toJSON.call(this);

    json.body = this.body.map(function (node) {
        return node.toJSON();
    });

    return json;
};

function ArrayExpression(elements) {
    Expression.call(this, 'ArrayExpression');

    if (!Array.isArray(elements)) {
        throw new TypeError('elements must be a list of expressions');
    }

    this.elements = elements;
}

ArrayExpression.prototype = Object.create(Expression.prototype);

ArrayExpression.prototype.constructor = ArrayExpression;

ArrayExpression.prototype.toJSON = function () {
    var json = Node.prototype.toJSON.call(this);

    json.elements = this.elements.map(function (element) {
        return element.toJSON();
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
        if (!(property instanceof Identifier)) {
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

function Identifier(name) {
    Expression.call(this, 'Identifier');

    if (typeof name !== 'string') {
        throw new TypeError('name must be a string');
    }

    this.name = name;
}

Identifier.prototype = Object.create(Expression.prototype);

Identifier.prototype.constructor = Identifier;

Identifier.prototype.toJSON = function () {
    var json = Node.prototype.toJSON.call(this);

    json.name = this.name;

    return json;
};

function Literal(value) {
    Expression.call(this, 'Literal');

    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

    if ('boolean number string'.split(' ').indexOf(type) === -1 && value !== null && !(value instanceof RegExp)) {
        throw new TypeError('value must be a boolean, number, string, null, or instance of RegExp');
    }

    this.value = value;
}

Literal.prototype = Object.create(Expression.prototype);

Literal.prototype.constructor = Literal;

Literal.prototype.toJSON = function () {
    var json = Node.prototype.toJSON.call(this);

    json.value = this.value;

    return json;
};

function SequenceExpression(expressions) {
    Expression.call(this, 'SequenceExpression');

    if (!Array.isArray(expressions)) {
        throw new TypeError('expressions must be a list of expressions');
    }

    this.expressions = expressions;
}

SequenceExpression.prototype = Object.create(Expression.prototype);

SequenceExpression.prototype.constructor = SequenceExpression;

SequenceExpression.prototype.toJSON = function () {
    var json = Node.prototype.toJSON.call(this);

    json.expressions = this.expressions.map(function (expression) {
        return expression.toJSON();
    });

    return json;
};

/**
 * @class Builder
 * @extends Null
 * @param {Lexer} lexer
 */
function Builder(lexer) {
    if (!arguments.length) {
        throw new TypeError('lexer must be provided');
    }

    this.lexer = lexer;
}

Builder.prototype = new Null();

Builder.prototype.constructor = Builder;

Builder.prototype.arrayExpression = function () {
    var args = this.bracketList();
    return new ArrayExpression(args);
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

Builder.prototype.callExpression = function () {
    var args = this.list('(');
    this.consume('(');
    var callee = this.expression();

    //console.log( 'CALL EXPRESSION' );
    //console.log( '- CALLEE', callee );
    //console.log( '- ARGUMENTS', args, args.length );

    return new CallExpression(callee, args);
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
        list = void 0;

    if (this.peek()) {
        if (this.expect(']')) {
            list = this.list('[');
            if (this.tokens.length === 1) {
                expression = new ArrayExpression(list);
                this.consume('[');
            } else if (list.length > 1) {
                expression = new SequenceExpression(list);
            } else {
                expression = list[0];
            }
        } else if (this.peek().is('identifier')) {
            expression = this.identifier();

            // Implied member expression
            if (this.peek() && this.peek().is('punctuator')) {
                if (this.peek(')') || this.peek(']')) {
                    expression = this.memberExpression(expression, false);
                }
            }
        } else if (this.peek().is('literal')) {
            expression = this.literal();
        }

        var next = void 0;

        while (next = this.expect(')', '[', '.')) {
            if (next.value === ')') {
                expression = this.callExpression();
            } else if (next.value === '[') {
                expression = this.memberExpression(expression, true);
            } else if (next.value === '.') {
                expression = this.memberExpression(expression, false);
            } else {
                this.throwError('Unexpected token ' + next);
            }
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

    return new Identifier(token.value);
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

    return new Literal(literal);
};

Builder.prototype.list = function (terminator) {
    var list = [];

    if (this.peek().value !== terminator) {
        do {
            if (this.peek(terminator)) {
                break;
            }
            list.unshift(this.literal());
        } while (this.expect(','));
    }

    return list;
};

Builder.prototype.memberExpression = function (property, computed) {
    var object = this.expression();

    //console.log( 'MEMBER EXPRESSION' );
    //console.log( '- OBJECT', object );
    //console.log( '- PROPERTY', property );
    //console.log( '- COMPUTED', computed );

    return new MemberExpression(object, property, computed);
};

Builder.prototype.peek = function (first, second, third, fourth) {
    var length = this.tokens.length;
    return length ? this.peekAt(length - 1, first, second, third, fourth) : undefined;
};

Builder.prototype.peekAt = function (index, first, second, third, fourth) {
    if (typeof index === 'number') {
        var token = this.tokens[index],
            value = token.value;

        if (value === first || value === second || value === third || value === fourth || !arguments.length || !first && !second && !third && !fourth) {
            return token;
        }
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

/*
Builder.prototype.punctuator = function(){
    const token = this.consume();
    
    if( !( token.type === 'punctuator' ) ){
        this.throwError( 'Punctuator expected' );
    }
    
    return new Punctuator( token.value );
};
*/

Builder.prototype.sequenceExpression = function () {
    var args = this.bracketList();
    return new SequenceExpression(args);
};

Builder.prototype.throwError = function (message) {
    throw new SyntaxError(message);
};

return Builder;

})));

//# sourceMappingURL=builder-umd.js.map