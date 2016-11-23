(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.KeypathInterpreter = factory());
}(this, (function () { 'use strict';

var _hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * @function
 * @param {*} object
 * @param {external:string} property
 */
function hasOwnProperty( object, property ){
    return _hasOwnProperty.call( object, property );
}

/**
 * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
 * @class Null
 * @extends external:null
 */
function Null(){}
Null.prototype = Object.create( null );
Null.prototype.constructor =  Null;

/**
 * @typedef {external:Function} MapCallback
 * @param {*} item
 * @param {external:number} index
 */

/**
 * @function
 * @param {Array-Like} list
 * @param {MapCallback} callback
 */
function map( list, callback ){
    var length = list.length,
        index, result;

    switch( length ){
        case 1:
            return [ callback( list[ 0 ], 0, list ) ];
        case 2:
            return [ callback( list[ 0 ], 0, list ), callback( list[ 1 ], 1, list ) ];
        case 3:
            return [ callback( list[ 0 ], 0, list ), callback( list[ 1 ], 1, list ), callback( list[ 2 ], 2, list ) ];
        default:
            index = 0;
            result = new Array( length );
            for( ; index < length; index++ ){
                result[ index ] = callback( list[ index ], index, list );
            }
    }

    return result;
}

var ArrayExpression       = 'ArrayExpression';
var CallExpression        = 'CallExpression';

var Identifier            = 'Identifier';
var Literal               = 'Literal';
var MemberExpression      = 'MemberExpression';

var SequenceExpression    = 'SequenceExpression';

var BlockExpression       = 'BlockExpression';
var ExistentialExpression = 'ExistentialExpression';
var LookupExpression      = 'LookupExpression';
var RangeExpression       = 'RangeExpression';
var RootExpression        = 'RootExpression';

var noop = function(){};
var interpreterPrototype;

/**
 * @function Interpreter~getter
 * @param {external:Object} object
 * @param {external:string} key
 * @returns {*} The value of the 'key' property on 'object'.
 */
function getter( object, key ){
    return object[ key ];
}

/**
 * @function Interpreter~returnValue
 * @param {*} value
 * @param {external:number} depth
 * @returns {*|external:Object} The decided value
 */
function returnValue( value, depth ){
    return !depth ? value : {};
}

/**
 * @function Interpreter~returnZero
 * @returns {external:number} zero
 */
function returnZero(){
    return 0;
}

/**
 * @function Interpreter~setter
 * @param {external:Object} object
 * @param {external:string} key
 * @param {*} value
 * @returns {*} The value of the 'key' property on 'object'.
 */
function setter( object, key, value ){
    if( !hasOwnProperty( object, key ) ){
        object[ key ] = value || {};
    }
    return getter( object, key );
}

/**
 * @class Interpreter
 * @extends Null
 * @param {Builder} builder
 */
function Interpreter( builder ){
    if( !arguments.length ){
        throw new TypeError( 'builder cannot be undefined' );
    }

    /**
     * @member {Builder} Interpreter#builder
     */
    this.builder = builder;
}

interpreterPrototype = Interpreter.prototype = new Null();

interpreterPrototype.constructor = Interpreter;

interpreterPrototype.arrayExpression = function( elements, context, assign ){
    //console.log( 'Composing ARRAY EXPRESSION', elements.length );
    var interpreter = this,
        depth = interpreter.depth,
        list;
    if( Array.isArray( elements ) ){
        list = map( elements, function( element ){
            return interpreter.listExpressionElement( element, false, assign );
        } );

        return function executeArrayExpression( scope, assignment, lookup ){
            //console.log( 'Executing ARRAY EXPRESSION' );
            //console.log( '- executeArrayExpression LIST', list );
            //console.log( '- executeArrayExpression DEPTH', depth );
            var value = returnValue( assignment, depth ),
                result = map( list, function( expression ){
                    return assign( scope, expression( scope, assignment, lookup ), value );
                } );
            result.length === 1 && ( result = result[ 0 ] );
            //console.log( '- executeArrayExpression RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    } else {
        list = interpreter.recurse( elements, false, assign );

        return function executeArrayExpression( scope, assignment, lookup ){
            //console.log( 'Executing ARRAY EXPRESSION' );
            //console.log( '- executeArrayExpression LIST', list.name );
            //console.log( '- executeArrayExpression DEPTH', depth );
            var keys = list( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result = map( keys, function( key ){
                    return assign( scope, key, value );
                } );
            //console.log( '- executeArrayExpression RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    }
};

interpreterPrototype.blockExpression = function( tokens, context, assign ){
    //console.log( 'Composing BLOCK', tokens.join( '' ) );
    var interpreter = this,
        program = interpreter.builder.build( tokens ),
        expression = interpreter.recurse( program.body[ 0 ].expression, false, assign );

    return function executeBlockExpression( scope, assignment, lookup ){
        //console.log( 'Executing BLOCK' );
        //console.log( '- executeBlockExpression SCOPE', scope );
        //console.log( '- executeBlockExpression EXPRESSION', expression.name );
        var result = expression( scope, assignment, lookup );
        //console.log( '- executeBlockExpression RESULT', result );
        return context ?
            { context: scope, name: void 0, value: result } :
            result;
    };
};

interpreterPrototype.callExpression = function( callee, args, context, assign ){
    //console.log( 'Composing CALL EXPRESSION' );
    var interpreter = this,
        isSetting = assign === setter,
        left = interpreter.recurse( callee, true, assign ),
        list = map( args, function( arg ){
            return interpreter.listExpressionElement( arg, false, assign );
        } );

    return function executeCallExpression( scope, assignment, lookup ){
        //console.log( 'Executing CALL EXPRESSION' );
        //console.log( '- executeCallExpression args', args.length );
        var lhs = left( scope, assignment, lookup ),
            args = map( list, function( arg ){
                return arg( scope, assignment, lookup );
            } ),
            result;
        //console.log( '- executeCallExpression LHS', lhs );
        result = lhs.value.apply( lhs.context, args );
        if( isSetting && typeof lhs.value === 'undefined' ){
            throw new Error( 'cannot create call expressions' );
        }
        //console.log( '- executeCallExpression RESULT', result );
        return context ?
            { value: result }:
            result;
    };
};

/**
 * @function
 * @param {external:string} expression
 */
interpreterPrototype.compile = function( expression, create ){
    var interpreter = this,
        program = interpreter.builder.build( expression ),
        body = program.body,

        assign, expressions;

    interpreter.depth = -1;
    interpreter.isSplit = interpreter.isLeftSplit = interpreter.isRightSplit = false;

    if( typeof create !== 'boolean' ){
        create = false;
    }

    assign = create ?
        setter :
        getter;

    /**
     * @member {external:string}
     */
    interpreter.expression = interpreter.builder.text;
    //console.log( '-------------------------------------------------' );
    //console.log( 'Interpreting' );
    //console.log( '-------------------------------------------------' );
    //console.log( 'Program', program.range );
    switch( body.length ){
        case 0:
            return noop;
        case 1:
            return interpreter.recurse( body[ 0 ].expression, false, assign );
        default:
            expressions = map( body, function( statement ){
                return interpreter.recurse( statement.expression, false, assign );
            } );
            return function executeProgram( scope, assignment, lookup ){
                var values = map( expressions, function( expression ){
                        return expression( scope, assignment, lookup );
                    } );
                return values[ values.length - 1 ];
            };
    }
};

interpreterPrototype.computedMemberExpression = function( object, property, context, assign ){
    //console.log( 'Composing COMPUTED MEMBER EXPRESSION', object.type, property.type );
    var interpreter = this,
        depth = interpreter.depth,
        isSafe = object.type === ExistentialExpression,
        left = interpreter.recurse( object, false, assign ),
        right = interpreter.recurse( property, false, assign );

    if( !interpreter.isSplit ){
        return function executeComputedMemberExpression( scope, assignment, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( '- executeComputedMemberExpression LEFT ', left.name );
            //console.log( '- executeComputedMemberExpression RIGHT', right.name );
            var lhs = left( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, assignment, lookup );
                //console.log( '- executeComputedMemberExpression DEPTH', depth );
                //console.log( '- executeComputedMemberExpression LHS', lhs );
                //console.log( '- executeComputedMemberExpression RHS', rhs );
                result = assign( lhs, rhs, value );
            }
            //console.log( '- executeComputedMemberExpression RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else if( interpreter.isLeftSplit && !interpreter.isRightSplit ){
        return function executeComputedMemberExpression( scope, assignment, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( '- executeComputedMemberExpression LEFT ', left.name );
            //console.log( '- executeComputedMemberExpression RIGHT', right.name );
            var lhs = left( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, assignment, lookup );
                //console.log( '- executeComputedMemberExpression DEPTH', depth );
                //console.log( '- executeComputedMemberExpression LHS', lhs );
                //console.log( '- executeComputedMemberExpression RHS', rhs );
                result = map( lhs, function( object ){
                    return assign( object, rhs, value );
                } );
            }
            //console.log( '- executeComputedMemberExpression RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else if( !interpreter.isLeftSplit && interpreter.isRightSplit ){
        return function executeComputedMemberExpression( scope, assignment, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( '- executeComputedMemberExpression LEFT ', left.name );
            //console.log( '- executeComputedMemberExpression RIGHT', right.name );
            var lhs = left( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, assignment, lookup );
                //console.log( '- executeComputedMemberExpression DEPTH', depth );
                //console.log( '- executeComputedMemberExpression LHS', lhs );
                //console.log( '- executeComputedMemberExpression RHS', rhs );
                result = map( rhs, function( key ){
                    return assign( lhs, key, value );
                } );
            }
            //console.log( '- executeComputedMemberExpression RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else {
        return function executeComputedMemberExpression( scope, assignment, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( '- executeComputedMemberExpression LEFT ', left.name );
            //console.log( '- executeComputedMemberExpression RIGHT', right.name );
            var lhs = left( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, assignment, lookup );
                //console.log( '- executeComputedMemberExpression DEPTH', depth );
                //console.log( '- executeComputedMemberExpression LHS', lhs );
                //console.log( '- executeComputedMemberExpression RHS', rhs );
                result = map( lhs, function( object ){
                    return map( rhs, function( key ){
                        return assign( object, key, value );
                    } );
                } );
            }
            //console.log( '- executeComputedMemberExpression RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    }
};

interpreterPrototype.existentialExpression = function( expression, context, assign ){
    //console.log( 'Composing EXISTENTIAL EXPRESSION', expression.type );
    var left = this.recurse( expression, false, assign );

    return function executeExistentialExpression( scope, assignment, lookup ){
        var result;
        //console.log( 'Executing EXISTENTIAL EXPRESSION' );
        //console.log( '- executeExistentialExpression LEFT', left.name );
        if( scope ){
            try {
                result = left( scope, assignment, lookup );
            } catch( e ){
                result = void 0;
            }
        }
        //console.log( '- executeExistentialExpression RESULT', result );
        return context ?
            { value: result } :
            result;
    };
};

interpreterPrototype.identifier = function( name, context, assign ){
    //console.log( 'Composing IDENTIFIER', name );
    var depth = this.depth;

    return function executeIdentifier( scope, assignment, lookup ){
        //console.log( 'Executing IDENTIFIER' );
        //console.log( '- executeIdentifier NAME', name );
        //console.log( '- executeIdentifier VALUE', value );
        var value = returnValue( assignment, depth ),
            result = assign( scope, name, value );
        //console.log( '- executeIdentifier RESULT', result );
        return context ?
            { context: scope, name: name, value: result } :
            result;
    };
};

interpreterPrototype.listExpressionElement = function( element, context, assign ){
    var interpreter = this;

    switch( element.type ){
        case Literal:
            return interpreter.literal( element.value, context );
        case LookupExpression:
            return interpreter.lookupExpression( element.key, false, context, assign );
        case RootExpression:
            return interpreter.rootExpression( element.key, context, assign );
        case BlockExpression:
            return interpreter.blockExpression( element.body, context, assign );
        default:
            throw new SyntaxError( 'Unexpected list element type: ' + element.type );
    }
};

interpreterPrototype.literal = function( value, context ){
    //console.log( 'Composing LITERAL', value );
    return function executeLiteral(){
        //console.log( 'Executing LITERAL' );
        //console.log( '- executeLiteral RESULT', value );
        return context ?
            { context: void 0, name: void 0, value: value } :
            value;
    };
};

interpreterPrototype.lookupExpression = function( key, resolve, context, assign ){
    //console.log( 'Composing LOOKUP EXPRESSION', key );
    var interpreter = this,
        isComputed = false,
        lhs = {},
        left;

    switch( key.type ){
        case Identifier:
            left = interpreter.identifier( key.name, true, assign );
            break;
        case Literal:
            isComputed = true;
            lhs.value = left = key.value;
            break;
        default:
            left = interpreter.recurse( key, true, assign );
    }

    return function executeLookupExpression( scope, assignment, lookup ){
        //console.log( 'Executing LOOKUP EXPRESSION' );
        //console.log( '- executeLookupExpression LEFT', left.name || left );
        var result;
        if( !isComputed ){
            lhs = left( lookup, assignment, scope );
            result = lhs.value;
        } else {
            result = assign( lookup, lhs.value, void 0 );
        }
        // Resolve lookups that are the object of an object-property relationship
        if( resolve ){
            result = assign( scope, result, void 0 );
        }
        //console.log( '- executeLookupExpression LHS', lhs );
        //console.log( '- executeLookupExpression RESULT', result  );
        return context ?
            { context: lookup, name: lhs.value, value: result } :
            result;
    };
};

interpreterPrototype.rangeExpression = function( lowerBound, upperBound, context, assign ){
    //console.log( 'Composing RANGE EXPRESSION' );
    var interpreter = this,
        left = lowerBound !== null ?
            interpreter.recurse( lowerBound, false, assign ) :
            returnZero,
        right = upperBound !== null ?
            interpreter.recurse( upperBound, false, assign ) :
            returnZero,
        index, lhs, middle, result, rhs;

    return function executeRangeExpression( scope, assignment, lookup ){
        //console.log( 'Executing RANGE EXPRESSION' );
        //console.log( '- executeRangeExpression LEFT', left.name );
        //console.log( '- executeRangeExpression RIGHT', right.name );
        lhs = left( scope, assignment, lookup );
        rhs = right( scope, assignment, lookup );
        result = [];
        index = 1;
        //console.log( '- executeRangeExpression LHS', lhs );
        //console.log( '- executeRangeExpression RHS', rhs );
        result[ 0 ] = lhs;
        if( lhs < rhs ){
            middle = lhs + 1;
            while( middle < rhs ){
                result[ index++ ] = middle++;
            }
        } else if( lhs > rhs ){
            middle = lhs - 1;
            while( middle > rhs ){
                result[ index++ ] = middle--;
            }
        }
        result[ result.length ] = rhs;
        //console.log( '- executeRangeExpression RESULT', result );
        return context ?
            { value: result } :
            result;
    };
};

/**
 * @function
 */
interpreterPrototype.recurse = function( node, context, assign ){
    //console.log( 'Recursing', node.type );
    var interpreter = this,
        expression = null;

    interpreter.depth++;

    switch( node.type ){
        case ArrayExpression:
            expression = interpreter.arrayExpression( node.elements, context, assign );
            interpreter.isSplit = interpreter.isLeftSplit = node.elements.length > 1;
            break;
        case CallExpression:
            expression = interpreter.callExpression( node.callee, node.arguments, context, assign );
            break;
        case BlockExpression:
            expression = interpreter.blockExpression( node.body, context, assign );
            break;
        case ExistentialExpression:
            expression = interpreter.existentialExpression( node.expression, context, assign );
            break;
        case Identifier:
            expression = interpreter.identifier( node.name, context, assign );
            break;
        case Literal:
            expression = interpreter.literal( node.value, context );
            break;
        case MemberExpression:
            expression = node.computed ?
                interpreter.computedMemberExpression( node.object, node.property, context, assign ) :
                interpreter.staticMemberExpression( node.object, node.property, context, assign );
            break;
        case LookupExpression:
            expression = interpreter.lookupExpression( node.key, false, context, assign );
            break;
        case RangeExpression:
            expression = interpreter.rangeExpression( node.left, node.right, context, assign );
            break;
        case RootExpression:
            expression = interpreter.rootExpression( node.key, context, assign );
            break;
        case SequenceExpression:
            expression = interpreter.sequenceExpression( node.expressions, context, assign );
            interpreter.isSplit = interpreter.isRightSplit = true;
            break;
        default:
            throw new SyntaxError( 'Unknown node type: ' + node.type );
    }

    interpreter.depth--;

    return expression;
};

interpreterPrototype.rootExpression = function( key, context, assign ){
    //console.log( 'Composing ROOT EXPRESSION' );
    var left = this.recurse( key, false, assign );

    return function executeRootExpression( scope, assignment, lookup ){
        //console.log( 'Executing ROOT EXPRESSION' );
        //console.log( '- executeRootExpression LEFT', left.name || left );
        //console.log( '- executeRootExpression SCOPE', scope );
        var result = left( scope, assignment, lookup );
        //console.log( '- executeRootExpression LHS', lhs );
        //console.log( '- executeRootExpression RESULT', result  );
        return context ?
            { context: lookup, name: result.value, value: result } :
            result;
    };
};

interpreterPrototype.sequenceExpression = function( expressions, context, assign ){
    //console.log( 'Composing SEQUENCE EXPRESSION', expressions.length );
    var interpreter = this,
        depth = interpreter.depth,
        list;
    if( Array.isArray( expressions ) ){
        list = map( expressions, function( expression ){
            return interpreter.listExpressionElement( expression, false, assign );
        } );

        return function executeSequenceExpression( scope, assignment, lookup ){
            //console.log( 'Executing SEQUENCE EXPRESSION' );
            //console.log( '- executeSequenceExpression LIST', list );
            //console.log( '- executeSequenceExpression DEPTH', depth );
            var value = returnValue( assignment, depth ),
                result = map( list, function( expression ){
                    return expression( scope, value, lookup );
                } );
            //console.log( '- executeSequenceExpression RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    } else {
        list = interpreter.recurse( expressions, false, assign );

        return function executeSequenceExpression( scope, assignment, lookup ){
            //console.log( 'Executing SEQUENCE EXPRESSION' );
            //console.log( '- executeSequenceExpression LIST', list.name );
            //console.log( '- executeSequenceExpression DEPTH', depth );
            var value = returnValue( assignment, depth ),
                result = list( scope, value, lookup );
            //console.log( '- executeSequenceExpression RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    }
};

interpreterPrototype.staticMemberExpression = function( object, property, context, assign ){
    //console.log( 'Composing STATIC MEMBER EXPRESSION', object.type, property.type );
    var interpreter = this,
        depth = interpreter.depth,
        isComputed = false,
        isSafe = false,
        left, rhs, right;

    switch( object.type ){
        case LookupExpression:
            left = interpreter.lookupExpression( object.key, true, false, assign );
            break;
        case ExistentialExpression:
            isSafe = true;
        default:
            left = interpreter.recurse( object, false, assign );
    }

    switch( property.type ){
        case Identifier:
            isComputed = true;
            rhs = right = property.name;
            break;
        default:
            right = interpreter.recurse( property, false, assign );
    }

    return interpreter.isSplit ?
        function executeStaticMemberExpression( scope, assignment, lookup ){
            //console.log( 'Executing STATIC MEMBER EXPRESSION' );
            //console.log( '- executeStaticMemberExpression LEFT', left.name );
            //console.log( '- executeStaticMemberExpression RIGHT', rhs || right.name );
            var lhs = left( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result;

            if( !isSafe || lhs ){
                if( !isComputed ){
                    rhs = right( property.type === RootExpression ? scope : lhs, assignment, lookup );
                }
                //console.log( '- executeStaticMemberExpression LHS', lhs );
                //console.log( '- executeStaticMemberExpression RHS', rhs );
                //console.log( '- executeStaticMemberExpression DEPTH', depth );
                result = map( lhs, function( object ){
                    return assign( object, rhs, value );
                } );
            }
            //console.log( '- executeStaticMemberExpression RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        } :
        function executeStaticMemberExpression( scope, assignment, lookup ){
            //console.log( 'Executing STATIC MEMBER EXPRESSION' );
            //console.log( '- executeStaticMemberExpression LEFT', left.name );
            //console.log( '- executeStaticMemberExpression RIGHT', rhs || right.name );
            var lhs = left( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result;

            if( !isSafe || lhs ){
                if( !isComputed ){
                    rhs = right( property.type === RootExpression ? scope : lhs, assignment, lookup );
                }
                //console.log( '- executeStaticMemberExpression LHS', lhs );
                //console.log( '- executeStaticMemberExpression RHS', rhs );
                //console.log( '- executeStaticMemberExpression DEPTH', depth );
                result = assign( lhs, rhs, value );
            }
            //console.log( '- executeStaticMemberExpression RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
};

return Interpreter;

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0ZXIuanMiLCJzb3VyY2VzIjpbImhhcy1vd24tcHJvcGVydHkuanMiLCJudWxsLmpzIiwibWFwLmpzIiwic3ludGF4LmpzIiwia2V5cGF0aC1zeW50YXguanMiLCJpbnRlcnByZXRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX2hhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7Kn0gb2JqZWN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gcHJvcGVydHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaGFzT3duUHJvcGVydHkoIG9iamVjdCwgcHJvcGVydHkgKXtcbiAgICByZXR1cm4gX2hhc093blByb3BlcnR5LmNhbGwoIG9iamVjdCwgcHJvcGVydHkgKTtcbn0iLCIvKipcbiAqIEEgXCJjbGVhblwiLCBlbXB0eSBjb250YWluZXIuIEluc3RhbnRpYXRpbmcgdGhpcyBpcyBmYXN0ZXIgdGhhbiBleHBsaWNpdGx5IGNhbGxpbmcgYE9iamVjdC5jcmVhdGUoIG51bGwgKWAuXG4gKiBAY2xhc3MgTnVsbFxuICogQGV4dGVuZHMgZXh0ZXJuYWw6bnVsbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBOdWxsKCl7fVxuTnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5OdWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBOdWxsOyIsIi8qKlxuICogQHR5cGVkZWYge2V4dGVybmFsOkZ1bmN0aW9ufSBNYXBDYWxsYmFja1xuICogQHBhcmFtIHsqfSBpdGVtXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXhcbiAqL1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtBcnJheS1MaWtlfSBsaXN0XG4gKiBAcGFyYW0ge01hcENhbGxiYWNrfSBjYWxsYmFja1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYXAoIGxpc3QsIGNhbGxiYWNrICl7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3QubGVuZ3RoLFxuICAgICAgICBpbmRleCwgcmVzdWx0O1xuXG4gICAgc3dpdGNoKCBsZW5ndGggKXtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgcmV0dXJuIFsgY2FsbGJhY2soIGxpc3RbIDAgXSwgMCwgbGlzdCApIF07XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBbIGNhbGxiYWNrKCBsaXN0WyAwIF0sIDAsIGxpc3QgKSwgY2FsbGJhY2soIGxpc3RbIDEgXSwgMSwgbGlzdCApIF07XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBbIGNhbGxiYWNrKCBsaXN0WyAwIF0sIDAsIGxpc3QgKSwgY2FsbGJhY2soIGxpc3RbIDEgXSwgMSwgbGlzdCApLCBjYWxsYmFjayggbGlzdFsgMiBdLCAyLCBsaXN0ICkgXTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggbGVuZ3RoICk7XG4gICAgICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KysgKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBjYWxsYmFjayggbGlzdFsgaW5kZXggXSwgaW5kZXgsIGxpc3QgKTtcbiAgICAgICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufSIsImV4cG9ydCB2YXIgQXJyYXlFeHByZXNzaW9uICAgICAgID0gJ0FycmF5RXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIENhbGxFeHByZXNzaW9uICAgICAgICA9ICdDYWxsRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIEV4cHJlc3Npb25TdGF0ZW1lbnQgICA9ICdFeHByZXNzaW9uU3RhdGVtZW50JztcbmV4cG9ydCB2YXIgSWRlbnRpZmllciAgICAgICAgICAgID0gJ0lkZW50aWZpZXInO1xuZXhwb3J0IHZhciBMaXRlcmFsICAgICAgICAgICAgICAgPSAnTGl0ZXJhbCc7XG5leHBvcnQgdmFyIE1lbWJlckV4cHJlc3Npb24gICAgICA9ICdNZW1iZXJFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUHJvZ3JhbSAgICAgICAgICAgICAgID0gJ1Byb2dyYW0nO1xuZXhwb3J0IHZhciBTZXF1ZW5jZUV4cHJlc3Npb24gICAgPSAnU2VxdWVuY2VFeHByZXNzaW9uJzsiLCJleHBvcnQgdmFyIEJsb2NrRXhwcmVzc2lvbiAgICAgICA9ICdCbG9ja0V4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBFeGlzdGVudGlhbEV4cHJlc3Npb24gPSAnRXhpc3RlbnRpYWxFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgTG9va3VwRXhwcmVzc2lvbiAgICAgID0gJ0xvb2t1cEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBSYW5nZUV4cHJlc3Npb24gICAgICAgPSAnUmFuZ2VFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUm9vdEV4cHJlc3Npb24gICAgICAgID0gJ1Jvb3RFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgU2NvcGVFeHByZXNzaW9uICAgICAgID0gJ1Njb3BlRXhwcmVzc2lvbic7IiwiaW1wb3J0IGhhc093blByb3BlcnR5IGZyb20gJy4vaGFzLW93bi1wcm9wZXJ0eSc7XG5pbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0IG1hcCBmcm9tICcuL21hcCc7XG5pbXBvcnQgKiBhcyBTeW50YXggZnJvbSAnLi9zeW50YXgnO1xuaW1wb3J0ICogYXMgS2V5cGF0aFN5bnRheCBmcm9tICcuL2tleXBhdGgtc3ludGF4JztcblxudmFyIG5vb3AgPSBmdW5jdGlvbigpe30sXG5cbiAgICBpbnRlcnByZXRlclByb3RvdHlwZTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gSW50ZXJwcmV0ZXJ+Z2V0dGVyXG4gKiBAcGFyYW0ge2V4dGVybmFsOk9iamVjdH0gb2JqZWN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30ga2V5XG4gKiBAcmV0dXJucyB7Kn0gVGhlIHZhbHVlIG9mIHRoZSAna2V5JyBwcm9wZXJ0eSBvbiAnb2JqZWN0Jy5cbiAqL1xuZnVuY3Rpb24gZ2V0dGVyKCBvYmplY3QsIGtleSApe1xuICAgIHJldHVybiBvYmplY3RbIGtleSBdO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBJbnRlcnByZXRlcn5yZXR1cm5WYWx1ZVxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGRlcHRoXG4gKiBAcmV0dXJucyB7KnxleHRlcm5hbDpPYmplY3R9IFRoZSBkZWNpZGVkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIHJldHVyblZhbHVlKCB2YWx1ZSwgZGVwdGggKXtcbiAgICByZXR1cm4gIWRlcHRoID8gdmFsdWUgOiB7fTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gSW50ZXJwcmV0ZXJ+cmV0dXJuWmVyb1xuICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gemVyb1xuICovXG5mdW5jdGlvbiByZXR1cm5aZXJvKCl7XG4gICAgcmV0dXJuIDA7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEludGVycHJldGVyfnNldHRlclxuICogQHBhcmFtIHtleHRlcm5hbDpPYmplY3R9IG9iamVjdFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGtleVxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybnMgeyp9IFRoZSB2YWx1ZSBvZiB0aGUgJ2tleScgcHJvcGVydHkgb24gJ29iamVjdCcuXG4gKi9cbmZ1bmN0aW9uIHNldHRlciggb2JqZWN0LCBrZXksIHZhbHVlICl7XG4gICAgaWYoICFoYXNPd25Qcm9wZXJ0eSggb2JqZWN0LCBrZXkgKSApe1xuICAgICAgICBvYmplY3RbIGtleSBdID0gdmFsdWUgfHwge307XG4gICAgfVxuICAgIHJldHVybiBnZXR0ZXIoIG9iamVjdCwga2V5ICk7XG59XG5cbi8qKlxuICogQGNsYXNzIEludGVycHJldGVyXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge0J1aWxkZXJ9IGJ1aWxkZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSW50ZXJwcmV0ZXIoIGJ1aWxkZXIgKXtcbiAgICBpZiggIWFyZ3VtZW50cy5sZW5ndGggKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2J1aWxkZXIgY2Fubm90IGJlIHVuZGVmaW5lZCcgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfSBJbnRlcnByZXRlciNidWlsZGVyXG4gICAgICovXG4gICAgdGhpcy5idWlsZGVyID0gYnVpbGRlcjtcbn1cblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUgPSBJbnRlcnByZXRlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEludGVycHJldGVyO1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5hcnJheUV4cHJlc3Npb24gPSBmdW5jdGlvbiggZWxlbWVudHMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQVJSQVkgRVhQUkVTU0lPTicsIGVsZW1lbnRzLmxlbmd0aCApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGRlcHRoID0gaW50ZXJwcmV0ZXIuZGVwdGgsXG4gICAgICAgIGxpc3Q7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIGVsZW1lbnRzICkgKXtcbiAgICAgICAgbGlzdCA9IG1hcCggZWxlbWVudHMsIGZ1bmN0aW9uKCBlbGVtZW50ICl7XG4gICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIubGlzdEV4cHJlc3Npb25FbGVtZW50KCBlbGVtZW50LCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBBUlJBWSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiBMSVNUJywgbGlzdCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiBERVBUSCcsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSByZXR1cm5WYWx1ZSggYXNzaWdubWVudCwgZGVwdGggKSxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIGxpc3QsIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIHNjb3BlLCBleHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICksIHZhbHVlICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgcmVzdWx0Lmxlbmd0aCA9PT0gMSAmJiAoIHJlc3VsdCA9IHJlc3VsdFsgMCBdICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQXJyYXlFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdCA9IGludGVycHJldGVyLnJlY3Vyc2UoIGVsZW1lbnRzLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQVJSQVkgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24gTElTVCcsIGxpc3QubmFtZSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiBERVBUSCcsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIga2V5cyA9IGxpc3QoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1hcCgga2V5cywgZnVuY3Rpb24oIGtleSApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzaWduKCBzY29wZSwga2V5LCB2YWx1ZSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5ibG9ja0V4cHJlc3Npb24gPSBmdW5jdGlvbiggdG9rZW5zLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIEJMT0NLJywgdG9rZW5zLmpvaW4oICcnICkgKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBwcm9ncmFtID0gaW50ZXJwcmV0ZXIuYnVpbGRlci5idWlsZCggdG9rZW5zICksXG4gICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5yZWN1cnNlKCBwcm9ncmFtLmJvZHlbIDAgXS5leHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUJsb2NrRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIEJMT0NLJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQmxvY2tFeHByZXNzaW9uIFNDT1BFJywgc2NvcGUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUJsb2NrRXhwcmVzc2lvbiBFWFBSRVNTSU9OJywgZXhwcmVzc2lvbi5uYW1lICk7XG4gICAgICAgIHZhciByZXN1bHQgPSBleHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVCbG9ja0V4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogc2NvcGUsIG5hbWU6IHZvaWQgMCwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuY2FsbEV4cHJlc3Npb24gPSBmdW5jdGlvbiggY2FsbGVlLCBhcmdzLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIENBTEwgRVhQUkVTU0lPTicgKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBpc1NldHRpbmcgPSBhc3NpZ24gPT09IHNldHRlcixcbiAgICAgICAgbGVmdCA9IGludGVycHJldGVyLnJlY3Vyc2UoIGNhbGxlZSwgdHJ1ZSwgYXNzaWduICksXG4gICAgICAgIGxpc3QgPSBtYXAoIGFyZ3MsIGZ1bmN0aW9uKCBhcmcgKXtcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlci5saXN0RXhwcmVzc2lvbkVsZW1lbnQoIGFyZywgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICB9ICk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUNhbGxFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQ0FMTCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ2FsbEV4cHJlc3Npb24gYXJncycsIGFyZ3MubGVuZ3RoICk7XG4gICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICksXG4gICAgICAgICAgICBhcmdzID0gbWFwKCBsaXN0LCBmdW5jdGlvbiggYXJnICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZyggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApO1xuICAgICAgICAgICAgfSApLFxuICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ2FsbEV4cHJlc3Npb24gTEhTJywgbGhzICk7XG4gICAgICAgIHJlc3VsdCA9IGxocy52YWx1ZS5hcHBseSggbGhzLmNvbnRleHQsIGFyZ3MgKTtcbiAgICAgICAgaWYoIGlzU2V0dGluZyAmJiB0eXBlb2YgbGhzLnZhbHVlID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnY2Fubm90IGNyZWF0ZSBjYWxsIGV4cHJlc3Npb25zJyApO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDYWxsRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH06XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZXhwcmVzc2lvblxuICovXG5pbnRlcnByZXRlclByb3RvdHlwZS5jb21waWxlID0gZnVuY3Rpb24oIGV4cHJlc3Npb24sIGNyZWF0ZSApe1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIHByb2dyYW0gPSBpbnRlcnByZXRlci5idWlsZGVyLmJ1aWxkKCBleHByZXNzaW9uICksXG4gICAgICAgIGJvZHkgPSBwcm9ncmFtLmJvZHksXG5cbiAgICAgICAgYXNzaWduLCBleHByZXNzaW9ucztcblxuICAgIGludGVycHJldGVyLmRlcHRoID0gLTE7XG4gICAgaW50ZXJwcmV0ZXIuaXNTcGxpdCA9IGludGVycHJldGVyLmlzTGVmdFNwbGl0ID0gaW50ZXJwcmV0ZXIuaXNSaWdodFNwbGl0ID0gZmFsc2U7XG5cbiAgICBpZiggdHlwZW9mIGNyZWF0ZSAhPT0gJ2Jvb2xlYW4nICl7XG4gICAgICAgIGNyZWF0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGFzc2lnbiA9IGNyZWF0ZSA/XG4gICAgICAgIHNldHRlciA6XG4gICAgICAgIGdldHRlcjtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKi9cbiAgICBpbnRlcnByZXRlci5leHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuYnVpbGRlci50ZXh0O1xuICAgIC8vY29uc29sZS5sb2coICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyApO1xuICAgIC8vY29uc29sZS5sb2coICdJbnRlcnByZXRpbmcnICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJ1Byb2dyYW0nLCBwcm9ncmFtLnJhbmdlICk7XG4gICAgc3dpdGNoKCBib2R5Lmxlbmd0aCApe1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICByZXR1cm4gbm9vcDtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgcmV0dXJuIGludGVycHJldGVyLnJlY3Vyc2UoIGJvZHlbIDAgXS5leHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBleHByZXNzaW9ucyA9IG1hcCggYm9keSwgZnVuY3Rpb24oIHN0YXRlbWVudCApe1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlci5yZWN1cnNlKCBzdGF0ZW1lbnQuZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVQcm9ncmFtKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlcyA9IG1hcCggZXhwcmVzc2lvbnMsIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlc1sgdmFsdWVzLmxlbmd0aCAtIDEgXTtcbiAgICAgICAgICAgIH07XG4gICAgfVxufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuY29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uID0gZnVuY3Rpb24oIG9iamVjdCwgcHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQ09NUFVURUQgTUVNQkVSIEVYUFJFU1NJT04nLCBvYmplY3QudHlwZSwgcHJvcGVydHkudHlwZSApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGRlcHRoID0gaW50ZXJwcmV0ZXIuZGVwdGgsXG4gICAgICAgIGlzU2FmZSA9IG9iamVjdC50eXBlID09PSBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbixcbiAgICAgICAgbGVmdCA9IGludGVycHJldGVyLnJlY3Vyc2UoIG9iamVjdCwgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICByaWdodCA9IGludGVycHJldGVyLnJlY3Vyc2UoIHByb3BlcnR5LCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICBpZiggIWludGVycHJldGVyLmlzU3BsaXQgKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQ09NUFVURUQgTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIExFRlQgJywgbGVmdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJJR0hUJywgcmlnaHQubmFtZSApO1xuICAgICAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdCwgcmhzO1xuICAgICAgICAgICAgaWYoICFpc1NhZmUgfHwgbGhzICl7XG4gICAgICAgICAgICAgICAgcmhzID0gcmlnaHQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIERFUFRIJywgZGVwdGggKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIExIUycsIGxocyApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkhTJywgcmhzICk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBsaHMsIHJocywgdmFsdWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmKCBpbnRlcnByZXRlci5pc0xlZnRTcGxpdCAmJiAhaW50ZXJwcmV0ZXIuaXNSaWdodFNwbGl0ICl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIENPTVBVVEVEIE1FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBMRUZUICcsIGxlZnQubmFtZSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSSUdIVCcsIHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICksXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXR1cm5WYWx1ZSggYXNzaWdubWVudCwgZGVwdGggKSxcbiAgICAgICAgICAgICAgICByZXN1bHQsIHJocztcbiAgICAgICAgICAgIGlmKCAhaXNTYWZlIHx8IGxocyApe1xuICAgICAgICAgICAgICAgIHJocyA9IHJpZ2h0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBERVBUSCcsIGRlcHRoICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBMSFMnLCBsaHMgKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJIUycsIHJocyApO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1hcCggbGhzLCBmdW5jdGlvbiggb2JqZWN0ICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIG9iamVjdCwgcmhzLCB2YWx1ZSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmKCAhaW50ZXJwcmV0ZXIuaXNMZWZ0U3BsaXQgJiYgaW50ZXJwcmV0ZXIuaXNSaWdodFNwbGl0ICl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIENPTVBVVEVEIE1FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBMRUZUICcsIGxlZnQubmFtZSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSSUdIVCcsIHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICksXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXR1cm5WYWx1ZSggYXNzaWdubWVudCwgZGVwdGggKSxcbiAgICAgICAgICAgICAgICByZXN1bHQsIHJocztcbiAgICAgICAgICAgIGlmKCAhaXNTYWZlIHx8IGxocyApe1xuICAgICAgICAgICAgICAgIHJocyA9IHJpZ2h0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBERVBUSCcsIGRlcHRoICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBMSFMnLCBsaHMgKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJIUycsIHJocyApO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1hcCggcmhzLCBmdW5jdGlvbigga2V5ICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIGxocywga2V5LCB2YWx1ZSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQ09NUFVURUQgTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIExFRlQgJywgbGVmdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJJR0hUJywgcmlnaHQubmFtZSApO1xuICAgICAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdCwgcmhzO1xuICAgICAgICAgICAgaWYoICFpc1NhZmUgfHwgbGhzICl7XG4gICAgICAgICAgICAgICAgcmhzID0gcmlnaHQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIERFUFRIJywgZGVwdGggKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIExIUycsIGxocyApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkhTJywgcmhzICk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbWFwKCBsaHMsIGZ1bmN0aW9uKCBvYmplY3QgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hcCggcmhzLCBmdW5jdGlvbigga2V5ICl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzaWduKCBvYmplY3QsIGtleSwgdmFsdWUgKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuZXhpc3RlbnRpYWxFeHByZXNzaW9uID0gZnVuY3Rpb24oIGV4cHJlc3Npb24sIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgRVhJU1RFTlRJQUwgRVhQUkVTU0lPTicsIGV4cHJlc3Npb24udHlwZSApO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBleHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUV4aXN0ZW50aWFsRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIEVYSVNURU5USUFMIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVFeGlzdGVudGlhbEV4cHJlc3Npb24gTEVGVCcsIGxlZnQubmFtZSApO1xuICAgICAgICBpZiggc2NvcGUgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbGVmdCggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApO1xuICAgICAgICAgICAgfSBjYXRjaCggZSApe1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZvaWQgMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlRXhpc3RlbnRpYWxFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmlkZW50aWZpZXIgPSBmdW5jdGlvbiggbmFtZSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBJREVOVElGSUVSJywgbmFtZSApO1xuICAgIHZhciBkZXB0aCA9IHRoaXMuZGVwdGg7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUlkZW50aWZpZXIoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBJREVOVElGSUVSJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlSWRlbnRpZmllciBOQU1FJywgbmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlSWRlbnRpZmllciBWQUxVRScsIHZhbHVlICk7XG4gICAgICAgIHZhciB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBzY29wZSwgbmFtZSwgdmFsdWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUlkZW50aWZpZXIgUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogc2NvcGUsIG5hbWU6IG5hbWUsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmxpc3RFeHByZXNzaW9uRWxlbWVudCA9IGZ1bmN0aW9uKCBlbGVtZW50LCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzO1xuXG4gICAgc3dpdGNoKCBlbGVtZW50LnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguTGl0ZXJhbDpcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlci5saXRlcmFsKCBlbGVtZW50LnZhbHVlLCBjb250ZXh0ICk7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIGludGVycHJldGVyLmxvb2t1cEV4cHJlc3Npb24oIGVsZW1lbnQua2V5LCBmYWxzZSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbjpcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlci5yb290RXhwcmVzc2lvbiggZWxlbWVudC5rZXksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguQmxvY2tFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIGludGVycHJldGVyLmJsb2NrRXhwcmVzc2lvbiggZWxlbWVudC5ib2R5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggJ1VuZXhwZWN0ZWQgbGlzdCBlbGVtZW50IHR5cGU6ICcgKyBlbGVtZW50LnR5cGUgKTtcbiAgICB9XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5saXRlcmFsID0gZnVuY3Rpb24oIHZhbHVlLCBjb250ZXh0ICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBMSVRFUkFMJywgdmFsdWUgKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUxpdGVyYWwoKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBMSVRFUkFMJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlTGl0ZXJhbCBSRVNVTFQnLCB2YWx1ZSApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IHZvaWQgMCwgbmFtZTogdm9pZCAwLCB2YWx1ZTogdmFsdWUgfSA6XG4gICAgICAgICAgICB2YWx1ZTtcbiAgICB9O1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUubG9va3VwRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXksIHJlc29sdmUsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgTE9PS1VQIEVYUFJFU1NJT04nLCBrZXkgKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBpc0NvbXB1dGVkID0gZmFsc2UsXG4gICAgICAgIGxocyA9IHt9LFxuICAgICAgICBsZWZ0O1xuXG4gICAgc3dpdGNoKCBrZXkudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5JZGVudGlmaWVyOlxuICAgICAgICAgICAgbGVmdCA9IGludGVycHJldGVyLmlkZW50aWZpZXIoIGtleS5uYW1lLCB0cnVlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5MaXRlcmFsOlxuICAgICAgICAgICAgaXNDb21wdXRlZCA9IHRydWU7XG4gICAgICAgICAgICBsaHMudmFsdWUgPSBsZWZ0ID0ga2V5LnZhbHVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZWZ0ID0gaW50ZXJwcmV0ZXIucmVjdXJzZSgga2V5LCB0cnVlLCBhc3NpZ24gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUxvb2t1cEV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBMT09LVVAgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUxvb2t1cEV4cHJlc3Npb24gTEVGVCcsIGxlZnQubmFtZSB8fCBsZWZ0ICk7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmKCAhaXNDb21wdXRlZCApe1xuICAgICAgICAgICAgbGhzID0gbGVmdCggbG9va3VwLCBhc3NpZ25tZW50LCBzY29wZSApO1xuICAgICAgICAgICAgcmVzdWx0ID0gbGhzLnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBsb29rdXAsIGxocy52YWx1ZSwgdm9pZCAwICk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVzb2x2ZSBsb29rdXBzIHRoYXQgYXJlIHRoZSBvYmplY3Qgb2YgYW4gb2JqZWN0LXByb3BlcnR5IHJlbGF0aW9uc2hpcFxuICAgICAgICBpZiggcmVzb2x2ZSApe1xuICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBzY29wZSwgcmVzdWx0LCB2b2lkIDAgKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlTG9va3VwRXhwcmVzc2lvbiBMSFMnLCBsaHMgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUxvb2t1cEV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxvb2t1cCwgbmFtZTogbGhzLnZhbHVlLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5yYW5nZUV4cHJlc3Npb24gPSBmdW5jdGlvbiggbG93ZXJCb3VuZCwgdXBwZXJCb3VuZCwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBSQU5HRSBFWFBSRVNTSU9OJyApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGxlZnQgPSBsb3dlckJvdW5kICE9PSBudWxsID9cbiAgICAgICAgICAgIGludGVycHJldGVyLnJlY3Vyc2UoIGxvd2VyQm91bmQsIGZhbHNlLCBhc3NpZ24gKSA6XG4gICAgICAgICAgICByZXR1cm5aZXJvLFxuICAgICAgICByaWdodCA9IHVwcGVyQm91bmQgIT09IG51bGwgP1xuICAgICAgICAgICAgaW50ZXJwcmV0ZXIucmVjdXJzZSggdXBwZXJCb3VuZCwgZmFsc2UsIGFzc2lnbiApIDpcbiAgICAgICAgICAgIHJldHVyblplcm8sXG4gICAgICAgIGluZGV4LCBsaHMsIG1pZGRsZSwgcmVzdWx0LCByaHM7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFJBTkdFIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVSYW5nZUV4cHJlc3Npb24gTEVGVCcsIGxlZnQubmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlUmFuZ2VFeHByZXNzaW9uIFJJR0hUJywgcmlnaHQubmFtZSApO1xuICAgICAgICBsaHMgPSBsZWZ0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgIHJocyA9IHJpZ2h0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgICBpbmRleCA9IDE7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVSYW5nZUV4cHJlc3Npb24gTEhTJywgbGhzICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVSYW5nZUV4cHJlc3Npb24gUkhTJywgcmhzICk7XG4gICAgICAgIHJlc3VsdFsgMCBdID0gbGhzO1xuICAgICAgICBpZiggbGhzIDwgcmhzICl7XG4gICAgICAgICAgICBtaWRkbGUgPSBsaHMgKyAxO1xuICAgICAgICAgICAgd2hpbGUoIG1pZGRsZSA8IHJocyApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXgrKyBdID0gbWlkZGxlKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiggbGhzID4gcmhzICl7XG4gICAgICAgICAgICBtaWRkbGUgPSBsaHMgLSAxO1xuICAgICAgICAgICAgd2hpbGUoIG1pZGRsZSA+IHJocyApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXgrKyBdID0gbWlkZGxlLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0WyByZXN1bHQubGVuZ3RoIF0gPSByaHM7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVSYW5nZUV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuaW50ZXJwcmV0ZXJQcm90b3R5cGUucmVjdXJzZSA9IGZ1bmN0aW9uKCBub2RlLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnUmVjdXJzaW5nJywgbm9kZS50eXBlICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgZXhwcmVzc2lvbiA9IG51bGw7XG5cbiAgICBpbnRlcnByZXRlci5kZXB0aCsrO1xuXG4gICAgc3dpdGNoKCBub2RlLnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguQXJyYXlFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmFycmF5RXhwcmVzc2lvbiggbm9kZS5lbGVtZW50cywgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBpbnRlcnByZXRlci5pc1NwbGl0ID0gaW50ZXJwcmV0ZXIuaXNMZWZ0U3BsaXQgPSBub2RlLmVsZW1lbnRzLmxlbmd0aCA+IDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguQ2FsbEV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuY2FsbEV4cHJlc3Npb24oIG5vZGUuY2FsbGVlLCBub2RlLmFyZ3VtZW50cywgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LkJsb2NrRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5ibG9ja0V4cHJlc3Npb24oIG5vZGUuYm9keSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5leGlzdGVudGlhbEV4cHJlc3Npb24oIG5vZGUuZXhwcmVzc2lvbiwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5pZGVudGlmaWVyKCBub2RlLm5hbWUsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LkxpdGVyYWw6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIubGl0ZXJhbCggbm9kZS52YWx1ZSwgY29udGV4dCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4Lk1lbWJlckV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gbm9kZS5jb21wdXRlZCA/XG4gICAgICAgICAgICAgICAgaW50ZXJwcmV0ZXIuY29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBub2RlLm9iamVjdCwgbm9kZS5wcm9wZXJ0eSwgY29udGV4dCwgYXNzaWduICkgOlxuICAgICAgICAgICAgICAgIGludGVycHJldGVyLnN0YXRpY01lbWJlckV4cHJlc3Npb24oIG5vZGUub2JqZWN0LCBub2RlLnByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5sb29rdXBFeHByZXNzaW9uKCBub2RlLmtleSwgZmFsc2UsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5SYW5nZUV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIucmFuZ2VFeHByZXNzaW9uKCBub2RlLmxlZnQsIG5vZGUucmlnaHQsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5yb290RXhwcmVzc2lvbiggbm9kZS5rZXksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LlNlcXVlbmNlRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5zZXF1ZW5jZUV4cHJlc3Npb24oIG5vZGUuZXhwcmVzc2lvbnMsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgaW50ZXJwcmV0ZXIuaXNTcGxpdCA9IGludGVycHJldGVyLmlzUmlnaHRTcGxpdCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggJ1Vua25vd24gbm9kZSB0eXBlOiAnICsgbm9kZS50eXBlICk7XG4gICAgfVxuXG4gICAgaW50ZXJwcmV0ZXIuZGVwdGgtLTtcblxuICAgIHJldHVybiBleHByZXNzaW9uO1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUucm9vdEV4cHJlc3Npb24gPSBmdW5jdGlvbigga2V5LCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFJPT1QgRVhQUkVTU0lPTicgKTtcbiAgICB2YXIgbGVmdCA9IHRoaXMucmVjdXJzZSgga2V5LCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZVJvb3RFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgUk9PVCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlUm9vdEV4cHJlc3Npb24gTEVGVCcsIGxlZnQubmFtZSB8fCBsZWZ0ICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVSb290RXhwcmVzc2lvbiBTQ09QRScsIHNjb3BlICk7XG4gICAgICAgIHZhciByZXN1bHQgPSBsZWZ0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVSb290RXhwcmVzc2lvbiBMSFMnLCBsaHMgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJvb3RFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCAgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBsb29rdXAsIG5hbWU6IHJlc3VsdC52YWx1ZSwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuc2VxdWVuY2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIGV4cHJlc3Npb25zLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFNFUVVFTkNFIEVYUFJFU1NJT04nLCBleHByZXNzaW9ucy5sZW5ndGggKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBkZXB0aCA9IGludGVycHJldGVyLmRlcHRoLFxuICAgICAgICBsaXN0O1xuICAgIGlmKCBBcnJheS5pc0FycmF5KCBleHByZXNzaW9ucyApICl7XG4gICAgICAgIGxpc3QgPSBtYXAoIGV4cHJlc3Npb25zLCBmdW5jdGlvbiggZXhwcmVzc2lvbiApe1xuICAgICAgICAgICAgcmV0dXJuIGludGVycHJldGVyLmxpc3RFeHByZXNzaW9uRWxlbWVudCggZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgU0VRVUVOQ0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb24gTElTVCcsIGxpc3QgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb24gREVQVEgnLCBkZXB0aCApO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gcmV0dXJuVmFsdWUoIGFzc2lnbm1lbnQsIGRlcHRoICksXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbWFwKCBsaXN0LCBmdW5jdGlvbiggZXhwcmVzc2lvbiApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdCA9IGludGVycHJldGVyLnJlY3Vyc2UoIGV4cHJlc3Npb25zLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgU0VRVUVOQ0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb24gTElTVCcsIGxpc3QubmFtZSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiBERVBUSCcsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSByZXR1cm5WYWx1ZSggYXNzaWdubWVudCwgZGVwdGggKSxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBsaXN0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLnN0YXRpY01lbWJlckV4cHJlc3Npb24gPSBmdW5jdGlvbiggb2JqZWN0LCBwcm9wZXJ0eSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBTVEFUSUMgTUVNQkVSIEVYUFJFU1NJT04nLCBvYmplY3QudHlwZSwgcHJvcGVydHkudHlwZSApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGRlcHRoID0gaW50ZXJwcmV0ZXIuZGVwdGgsXG4gICAgICAgIGlzQ29tcHV0ZWQgPSBmYWxzZSxcbiAgICAgICAgaXNTYWZlID0gZmFsc2UsXG4gICAgICAgIGxlZnQsIHJocywgcmlnaHQ7XG5cbiAgICBzd2l0Y2goIG9iamVjdC50eXBlICl7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uOlxuICAgICAgICAgICAgbGVmdCA9IGludGVycHJldGVyLmxvb2t1cEV4cHJlc3Npb24oIG9iamVjdC5rZXksIHRydWUsIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgaXNTYWZlID0gdHJ1ZTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxlZnQgPSBpbnRlcnByZXRlci5yZWN1cnNlKCBvYmplY3QsIGZhbHNlLCBhc3NpZ24gKTtcbiAgICB9XG5cbiAgICBzd2l0Y2goIHByb3BlcnR5LnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGlzQ29tcHV0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmhzID0gcmlnaHQgPSBwcm9wZXJ0eS5uYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByaWdodCA9IGludGVycHJldGVyLnJlY3Vyc2UoIHByb3BlcnR5LCBmYWxzZSwgYXNzaWduICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGludGVycHJldGVyLmlzU3BsaXQgP1xuICAgICAgICBmdW5jdGlvbiBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTVEFUSUMgTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiBMRUZUJywgbGVmdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiBSSUdIVCcsIHJocyB8fCByaWdodC5uYW1lICk7XG4gICAgICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gcmV0dXJuVmFsdWUoIGFzc2lnbm1lbnQsIGRlcHRoICksXG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuXG4gICAgICAgICAgICBpZiggIWlzU2FmZSB8fCBsaHMgKXtcbiAgICAgICAgICAgICAgICBpZiggIWlzQ29tcHV0ZWQgKXtcbiAgICAgICAgICAgICAgICAgICAgcmhzID0gcmlnaHQoIHByb3BlcnR5LnR5cGUgPT09IEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb24gPyBzY29wZSA6IGxocywgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIExIUycsIGxocyApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIFJIUycsIHJocyApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIERFUFRIJywgZGVwdGggKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIGxocywgZnVuY3Rpb24oIG9iamVjdCApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzaWduKCBvYmplY3QsIHJocywgdmFsdWUgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IGNvbnRleHQ6IGxocywgbmFtZTogcmhzLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfSA6XG4gICAgICAgIGZ1bmN0aW9uIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFNUQVRJQyBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIExFRlQnLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIFJJR0hUJywgcmhzIHx8IHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICksXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXR1cm5WYWx1ZSggYXNzaWdubWVudCwgZGVwdGggKSxcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG5cbiAgICAgICAgICAgIGlmKCAhaXNTYWZlIHx8IGxocyApe1xuICAgICAgICAgICAgICAgIGlmKCAhaXNDb21wdXRlZCApe1xuICAgICAgICAgICAgICAgICAgICByaHMgPSByaWdodCggcHJvcGVydHkudHlwZSA9PT0gS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiA/IHNjb3BlIDogbGhzLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gTEhTJywgbGhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gUkhTJywgcmhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gREVQVEgnLCBkZXB0aCApO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggbGhzLCByaHMsIHZhbHVlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IGNvbnRleHQ6IGxocywgbmFtZTogcmhzLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbn07Il0sIm5hbWVzIjpbIktleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uIiwiU3ludGF4LkxpdGVyYWwiLCJLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5CbG9ja0V4cHJlc3Npb24iLCJTeW50YXguSWRlbnRpZmllciIsIlN5bnRheC5BcnJheUV4cHJlc3Npb24iLCJTeW50YXguQ2FsbEV4cHJlc3Npb24iLCJTeW50YXguTWVtYmVyRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguUmFuZ2VFeHByZXNzaW9uIiwiU3ludGF4LlNlcXVlbmNlRXhwcmVzc2lvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7Ozs7Ozs7QUFPdEQsQUFBZSxTQUFTLGNBQWMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0lBQ3RELE9BQU8sZUFBZSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUM7OztBQ1JwRDs7Ozs7QUFLQSxBQUFlLFNBQVMsSUFBSSxFQUFFLEVBQUU7QUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxJQUFJLElBQUk7O0FDUGxDOzs7Ozs7Ozs7OztBQVdBLEFBQWUsU0FBUyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtJQUN6QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFB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
