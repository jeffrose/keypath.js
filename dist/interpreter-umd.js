(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Interpreter = factory());
}(this, (function () { 'use strict';

function forEach(arrayLike, callback) {
    var index = 0,
        length = arrayLike.length,
        item = void 0;

    for (; index < length; index++) {
        item = arrayLike[index];
        callback(item);
    }
}

/**
 * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
 * @class Null
 * @extends external:null
 */

function Null() {}
Null.prototype = Object.create(null);
Null.prototype.constructor = Null;

var noop = function noop() {};
var interpret = new Null();

/**
 * @function
 * @param {Interpreter} interpeter
 * @param {Node} node
 * @param {external:boolean} context
 * @returns {external:Function} The interpreted expression.
 */
interpret.ArrayExpression = function (interpreter, node, context) {
    var args = [];

    forEach(node.elements, function (expr) {
        args.push(interpreter.recurse(expr, false));
    });

    return function (base, value) {
        //console.log( 'ARRAY EXPRESSION' );

        var result = [];

        forEach(args, function (arg) {
            result.push(base[arg(base, value)]);
        });

        if (result.length === 1) {
            result = result[0];
        }

        //console.log( '- ARRAY RESULT', result );

        return context ? { value: result } : result;
    };
};

/**
 * @function
 * @param {Interpreter} interpeter
 * @param {Node} node
 * @param {external:boolean} context
 * @returns {external:Function} The interpreted expression.
 */
interpret.CallExpression = function (interpreter, node, context) {
    var args = [];

    forEach(node.arguments, function (expr) {
        args.push(interpreter.recurse(expr, false));
    });

    var right = interpreter.recurse(node.callee, true);

    return function (base, value) {
        //console.log( 'CALL EXPRESSION' );
        var rhs = right(base, value);
        var result = void 0;

        if (typeof rhs.value === 'function') {
            var values = args.map(function (arg) {
                return arg(base, value);
            });
            result = rhs.value.apply(rhs.context, values);
        } else if (typeof value !== 'undefined') {
            throw new Error('cannot create functions');
        }

        //console.log( '- CALL RESULT', result );

        return context ? { value: result } : result;
    };
};

/**
 * @function
 * @param {Interpreter} interpeter
 * @param {Node} node
 * @param {external:boolean} context
 * @returns {external:Function} The interpreted expression.
 */
interpret.Identifier = function (interpreter, node, context) {
    var name = node.name;
    return function (base, value) {
        //console.log( 'IDENTIFIER' );
        var result = void 0;

        if (typeof base !== 'undefined') {
            if (typeof value !== 'undefined' && !(name in base)) {
                base[name] = new Null();
            }

            result = base[name];
        }

        //console.log( '- NAME', name );
        //console.log( '- IDENTIFIER RESULT', result );

        return context ? { context: base, name: name, value: result } : result;
    };
};

/**
 * @function
 * @param {Interpreter} interpeter
 * @param {Node} node
 * @param {external:boolean} context
 * @returns {external:Function} The interpreted expression.
 */
interpret.Literal = function (interpreter, node, context) {
    var value = node.value;
    return function () {
        //console.log( 'LITERAL' );
        //console.log( '- LITERAL RESULT', value );
        return context ? { context: undefined, name: undefined, value: value } : value;
    };
};

/**
 * @function
 * @param {Interpreter} interpeter
 * @param {Node} node
 * @param {external:boolean} context
 * @returns {external:Function} The interpreted expression.
 */
interpret.MemberExpression = function (interpreter, node, context) {
    var left = interpreter.recurse(node.object, false);

    var fn = void 0,
        lhs = void 0,
        result = void 0,
        rhs = void 0,
        right = void 0;

    if (node.computed) {
        right = interpreter.recurse(node.property, false);
        fn = function fn(base, value) {
            //console.log( 'COMPUTED MEMBER' );
            lhs = left(base, value);

            //console.log( '- COMPUTED LHS', lhs );

            if (typeof lhs !== 'undefined') {
                rhs = right(base, value);

                if (typeof value !== 'undefined' && !(rhs in lhs)) {
                    lhs[rhs] = new Null();
                }

                //console.log( '- COMPUTED RHS', rhs );

                if (Array.isArray(lhs)) {
                    // Sequence expression
                    if (Array.isArray(rhs)) {
                        result = rhs.map(function (index) {
                            return lhs[index];
                        });
                        // Literal expression
                    } else if (lhs.length === 1) {
                        result = lhs[0];
                        // Array expression
                    } else {
                        result = lhs.map(function (index) {
                            return lhs[index];
                        });
                    }
                } else {
                    result = lhs[rhs];
                }
            }

            //console.log( '- COMPUTED RESULT', result );

            return context ? { context: lhs, name: rhs, value: result } : result;
        };
    } else {
        right = node.property.name;
        fn = function fn(base, value) {
            //console.log( 'NON-COMPUTED MEMBER' );
            lhs = left(base, value);

            //console.log( '- NON-COMPUTED LHS', lhs );

            if (typeof lhs !== 'undefined') {
                if (typeof value !== 'undefined' && !(right in lhs)) {
                    lhs[right] = value || new Null();
                }

                //console.log( '- NON-COMPUTED RIGHT', right );

                if (Array.isArray(lhs)) {
                    result = lhs.map(function (item) {
                        return item[right];
                    });
                } else {
                    result = lhs[right];
                }
            }

            //console.log( '- NON-COMPUTED RESULT', result );

            return context ? { context: lhs, name: right, value: result } : result;
        };
    }

    return fn;
};

/**
 * @function
 * @param {Interpreter} interpeter
 * @param {Node} node
 * @param {external:boolean} context
 * @returns {external:Function} The interpreted expression.
 */
interpret.SequenceExpression = function (interpreter, node, context) {
    var args = [];

    forEach(node.expressions, function (expr) {
        args.push(interpreter.recurse(expr, false));
    });

    return function (base, value) {
        //console.log( 'SEQUENCE EXPRESSION' );

        var result = [];

        forEach(args, function (arg) {
            result.push(arg(base, value));
        });

        //console.log( '- SEQUENCE RESULT', result );

        return context ? { value: result } : result;
    };
};

/**
 * @class Interpreter
 * @extends Null
 * @param {Builder} builder
 */
function Interpreter(builder) {
    if (!arguments.length) {
        throw new TypeError('builder cannot be undefined');
    }

    this.builder = builder;
}

Interpreter.prototype = new Null();

Interpreter.prototype.constructor = Interpreter;

/**
 * @function
 * @param {external:string} expression
 */
Interpreter.prototype.compile = function (expression) {
    var ast = this.builder.build(expression),
        body = ast.body,
        interpreter = this;

    var fn = void 0;

    interpreter.expression = expression;

    (function () {
        switch (body.length) {
            case 0:
                fn = noop;
                break;
            case 1:
                fn = interpreter.recurse(body[0].expression, false);
                break;
            default:
                var expressions = [];
                forEach(body, function (statement) {
                    expressions.push(interpreter.recurse(statement.expression, false));
                });
                fn = function fn(base, value) {
                    var lastValue = void 0;

                    forEach(expressions, function (expression) {
                        lastValue = expression(base, value);
                    });

                    return lastValue;
                };
                break;
        }
    })();

    return fn;
};

Interpreter.prototype.recurse = function (node, context) {
    ////console.log( 'RECURSE', node );

    if (!(node.type in interpret)) {
        this.throwError('Unknown node type ' + node.type);
    }

    return interpret[node.type](this, node, context);
};

Interpreter.prototype.throwError = function (message) {
    throw new Error(message);
};

return Interpreter;

})));

//# sourceMappingURL=interpreter-umd.js.map