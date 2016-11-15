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
var cache = new Null();
var getter = new Null();
var setter = new Null();

function executeList( list, scope, value, lookup ){
    var index = list.length,
        result = new Array( index );
    switch( list.length ){
        case 0:
            break;
        case 1:
            result[ 0 ] = list[ 0 ]( scope, value, lookup );
            break;
        case 2:
            result[ 0 ] = list[ 0 ]( scope, value, lookup );
            result[ 1 ] = list[ 1 ]( scope, value, lookup );
            break;
        case 3:
            result[ 0 ] = list[ 0 ]( scope, value, lookup );
            result[ 1 ] = list[ 1 ]( scope, value, lookup );
            result[ 2 ] = list[ 2 ]( scope, value, lookup );
            break;
        case 4:
            result[ 0 ] = list[ 0 ]( scope, value, lookup );
            result[ 1 ] = list[ 1 ]( scope, value, lookup );
            result[ 2 ] = list[ 2 ]( scope, value, lookup );
            result[ 3 ] = list[ 3 ]( scope, value, lookup );
            break;
        default:
            while( index-- ){
                result[ index ] = list[ index ]( scope, value, lookup );
            }
            break;
    }
    return result;
}

getter.value = function( object, key ){
    return object[ key ];
};

getter.list = function( object, key ){
    var index = object.length,
        result = new Array( index );

    switch( index ){
        case 0:
            return result;
        case 1:
            result[ 0 ] = object[ 0 ][ key ];
            return result;
        case 2:
            result[ 0 ] = object[ 0 ][ key ];
            result[ 1 ] = object[ 1 ][ key ];
            return result;
        case 3:
            result[ 0 ] = object[ 0 ][ key ];
            result[ 1 ] = object[ 1 ][ key ];
            result[ 2 ] = object[ 2 ][ key ];
            return result;
        case 4:
            result[ 0 ] = object[ 0 ][ key ];
            result[ 1 ] = object[ 1 ][ key ];
            result[ 2 ] = object[ 2 ][ key ];
            result[ 3 ] = object[ 3 ][ key ];
            return result;
        default:
            while( index-- ){
                result[ index ] = object[ index ][ key ];
            }
            return result;
    }
};

setter.value = function( object, key, value ){
    if( !hasOwnProperty( object, key ) ){
        object[ key ] = value || {};
    }
    return getter.value( object, key );
};

/**
 * @function Interpreter~returnZero
 * @returns {external:number} zero
 */
function returnZero(){
    return 0;
}

Interpreter.prototype = Object.create( SyntaxError.prototype );

/**
 * @class Interpreter
 * @extends Null
 * @param {Builder} builder
 */
function Interpreter( builder ){
    if( !arguments.length ){
        this.throwError( 'builder cannot be undefined', TypeError );
    }

    /**
     * @member {Builder} Interpreter#builder
     */
    this.builder = builder;
}

Interpreter.prototype = new Null();

Interpreter.prototype.constructor = Interpreter;

Interpreter.prototype.arrayExpression = function( elements, context, assign ){
    //console.log( 'Composing ARRAY EXPRESSION', elements.length );
    //console.log( '- DEPTH', this.depth );
    var depth = this.depth,
        fn, list;
    if( Array.isArray( elements ) ){
        list = this.listExpression( elements, false, assign );

        fn = function executeArrayExpression( scope, value, lookup ){
            //console.log( 'Executing ARRAY EXPRESSION' );
            //console.log( `- ${ fn.name } LIST`, list );
            //console.log( `- ${ fn.name } DEPTH`, depth );
            var index = list.length,
                keys, result;
            switch( index ){
                case 0:
                    break;
                case 1:
                    keys = list[ 0 ]( scope, value, lookup );
                    result = assign( scope, keys, !depth ? value : {} );
                    break;
                default:
                    keys = new Array( index );
                    result = new Array( index );
                    while( index-- ){
                        keys[ index ] = list[ index ]( scope, value, lookup );
                        result[ index ] = assign( scope, keys[ index ], !depth ? value : {} );
                    }
                    break;
            }
            //console.log( `- ${ fn.name } KEYS`, keys );
            //console.log( `- ${ fn.name } RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    } else {
        list = this.recurse( elements, false, assign );

        fn = function executeArrayExpressionWithElementRange( scope, value, lookup ){
            //console.log( 'Executing ARRAY EXPRESSION' );
            //console.log( `- ${ fn.name } LIST`, list.name );
            //console.log( `- ${ fn.name } DEPTH`, depth );
            var keys = list( scope, value, lookup ),
                index = keys.length,
                result = new Array( index );
            if( index === 1 ){
                result[ 0 ] = assign( scope, keys[ 0 ], !depth ? value : {} );
            } else {
                while( index-- ){
                    result[ index ] = assign( scope, keys[ index ], !depth ? value : {} );
                }
            }
            //console.log( `- ${ fn.name } RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    }

    return fn;
};

Interpreter.prototype.blockExpression = function( tokens, context, assign ){
    //console.log( 'Composing BLOCK', tokens.join( '' ) );
    //console.log( '- DEPTH', this.depth );
    var depth = this.depth,
        text = tokens.join( '' ),
        program = hasOwnProperty( cache, text ) ?
            cache[ text ] :
            cache[ text ] = this.builder.build( tokens ),
        expression = this.recurse( program.body[ 0 ].expression, false, assign ),
        fn;
    return fn = function executeBlockExpression( scope, value, lookup ){
        //console.log( 'Executing BLOCK' );
        //console.log( `- ${ fn.name } SCOPE`, scope );
        //console.log( `- ${ fn.name } EXPRESSION`, expression.name );
        //console.log( `- ${ fn.name } DEPTH`, depth );
        var result = expression( scope, value, lookup );
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { context: scope, name: void 0, value: result } :
            result;
    };
};

Interpreter.prototype.callExpression = function( callee, args, context, assign ){
    //console.log( 'Composing CALL EXPRESSION' );
    //console.log( '- DEPTH', this.depth );
    var interpreter = this,
        depth = this.depth,
        isSetting = assign === setter.value,
        left = this.recurse( callee, true, assign ),
        list = this.listExpression( args, false, assign ),
        fn;

    return fn = function executeCallExpression( scope, value, lookup ){
        //console.log( 'Executing CALL EXPRESSION' );
        //console.log( `- ${ fn.name } args`, args.length );
        var lhs = left( scope, value, lookup ),
            values = executeList( list, scope, value, lookup ),
            result;
        //console.log( `- ${ fn.name } LHS`, lhs );
        //console.log( `- ${ fn.name } DEPTH`, depth );
        result = lhs.value.apply( lhs.context, values );
        if( isSetting && typeof lhs.value === 'undefined' ){
            interpreter.throwError( 'cannot create call expressions' );
        }
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { value: result }:
            result;
    };
};

/**
 * @function
 * @param {external:string} expression
 */
Interpreter.prototype.compile = function( expression, create ){
    var program = hasOwnProperty( cache, expression ) ?
            cache[ expression ] :
            cache[ expression ] = this.builder.build( expression ),
        body = program.body,
        interpreter = this,
        assign, expressions, fn, index;

    if( typeof create !== 'boolean' ){
        create = false;
    }
    this.depth = -1;
    this.isLeftList = false;
    this.isRightList = false;
    this.assigner = create ?
        setter :
        getter;

    assign = this.assigner.value;

    /**
     * @member {external:string}
     */
    interpreter.expression = this.builder.text;
    //console.log( '-------------------------------------------------' );
    //console.log( 'Interpreting ', expression );
    //console.log( '-------------------------------------------------' );
    //console.log( 'Program', program.range );

    switch( body.length ){
        case 0:
            fn = noop;
            break;
        case 1:
            fn = interpreter.recurse( body[ 0 ].expression, false, assign );
            break;
        default:
            index = body.length;
            expressions = new Array( index );
            while( index-- ){
                expressions[ index ] = interpreter.recurse( body[ index ].expression, false, assign );
            }
            fn = function executeProgram( scope, value, lookup ){
                var length = expressions.length,
                    lastValue;

                for( index = 0; index < length; index++ ){
                    lastValue = expressions[ index ]( scope, value, lookup );
                }

                return lastValue;
            };
            break;
    }
    //console.log( 'FN', fn.name );
    return fn;
};

Interpreter.prototype.computedMemberExpression = function( object, property, context, assign ){
    //console.log( 'Composing COMPUTED MEMBER EXPRESSION', object.type, property.type );
    //console.log( '- DEPTH', this.depth );
    var depth = this.depth,
        interpreter = this,
        isSafe = object.type === ExistentialExpression,
        left = this.recurse( object, false, assign ),
        right = this.recurse( property, false, assign ),
        fn;

    return fn = function executeComputedMemberExpression( scope, value, lookup ){
        //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
        //console.log( `- ${ fn.name } LEFT `, left.name );
        //console.log( `- ${ fn.name } RIGHT`, right.name );
        var lhs = left( scope, value, lookup ),
            index, length, position, result, rhs;
        if( !isSafe || ( lhs !== void 0 && lhs !== null ) ){
            rhs = right( scope, value, lookup );
            //console.log( `- ${ fn.name } DEPTH`, depth );
            //console.log( `- ${ fn.name } LHS`, lhs );
            //console.log( `- ${ fn.name } RHS`, rhs );
            if( Array.isArray( rhs ) ){
                if( ( interpreter.isLeftList ) && Array.isArray( lhs ) ){
                    length = rhs.length;
                    index = lhs.length;
                    result = new Array( index );
                    while( index-- ){
                        result[ index ] = new Array( length );
                        for( position = 0; position < length; position++ ){
                            result[ index ][ position ] = assign( lhs[ index ], rhs[ position ], !depth ? value : {} );
                        }
                    }
                } else {
                    index = rhs.length;
                    result = new Array( index );
                    while( index-- ){
                        result[ index ] = assign( lhs, rhs[ index ], !depth ? value : {} );
                    }
                }
            } else if( ( interpreter.isLeftList || interpreter.isRightList ) && Array.isArray( lhs ) ){
                index = lhs.length;
                result = new Array( index );
                while( index-- ){
                    result[ index ] = assign( lhs[ index ], rhs, !depth ? value : {} );
                }
            } else {
                result = assign( lhs, rhs, !depth ? value : {} );
            }
        }
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { context: lhs, name: rhs, value: result } :
            result;
    };
};

Interpreter.prototype.existentialExpression = function( expression, context, assign ){
    //console.log( 'Composing EXISTENTIAL EXPRESSION', expression.type );
    //console.log( '- DEPTH', this.depth );
    var left = this.recurse( expression, false, assign ),
        fn;
    return fn = function executeExistentialExpression( scope, value, lookup ){
        var result;
        //console.log( 'Executing EXISTENTIAL EXPRESSION' );
        //console.log( `- ${ fn.name } LEFT`, left.name );
        if( scope !== void 0 && scope !== null ){
            try {
                result = left( scope, value, lookup );
            } catch( e ){
                result = void 0;
            }
        }
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { value: result } :
            result;
    };
};

Interpreter.prototype.identifier = function( name, context, assign ){
    //console.log( 'Composing IDENTIFIER', name );
    //console.log( '- DEPTH', this.depth );
    var depth = this.depth,
        fn;
    return fn = function executeIdentifier( scope, value, lookup ){
        //console.log( 'Executing IDENTIFIER' );
        //console.log( `- ${ fn.name } NAME`, name );
        //console.log( `- ${ fn.name } DEPTH`, depth );
        //console.log( `- ${ fn.name } VALUE`, value );
        var result = assign( scope, name, !depth ? value : {} );
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { context: scope, name: name, value: result } :
            result;
    };
};

Interpreter.prototype.listExpression = function( items, context, assign ){
    var index = items.length,
        list = new Array( index );

    switch( index ){
        case 0:
            break;
        case 1:
            list[ 0 ] = this.listExpressionElement( items[ 0 ], context, assign );
            break;
        default:
            while( index-- ){
                list[ index ] = this.listExpressionElement( items[ index ], context, assign );
            }
    }

    return list;
};

Interpreter.prototype.listExpressionElement = function( element, context, assign ){
    switch( element.type ){
        case Literal:
            return this.literal( element.value, context );
        case LookupExpression:
            return this.lookupExpression( element.key, false, context, assign );
        case RootExpression:
            return this.rootExpression( element.key, context, assign );
        case BlockExpression:
            return this.blockExpression( element.body, context, assign );
        default:
            this.throwError( 'Unexpected list element type', element.type );
    }
};

Interpreter.prototype.literal = function( value, context ){
    //console.log( 'Composing LITERAL', value );
    //console.log( '- DEPTH', this.depth );
    var depth = this.depth,
        fn;
    return fn = function executeLiteral(){
        //console.log( 'Executing LITERAL' );
        //console.log( `- ${ fn.name } DEPTH`, depth );
        //console.log( `- ${ fn.name } RESULT`, value );
        return context ?
            { context: void 0, name: void 0, value: value } :
            value;
    };
};

Interpreter.prototype.lookupExpression = function( key, resolve, context, assign ){
    //console.log( 'Composing LOOKUP EXPRESSION', key );
    //console.log( '- DEPTH', this.depth );
    var isLeftFunction = false,
        depth = this.depth,
        lhs = {},
        fn, left;

    switch( key.type ){
        case Identifier:
            left = this.identifier( key.name, true, assign );
            isLeftFunction = true;
            break;
        case Literal:
            lhs.value = left = key.value;
            break;
        default:
            left = this.recurse( key, true, assign );
            isLeftFunction = true;
            break;
    }

    return fn = function executeLookupExpression( scope, value, lookup ){
        //console.log( 'Executing LOOKUP EXPRESSION' );
        //console.log( `- ${ fn.name } LEFT`, left.name || left );
        var result;
        if( isLeftFunction ){
            lhs = left( lookup, value, scope );
            result = lhs.value;
        } else {
            result = assign( lookup, lhs.value, void 0 );
        }
        // Resolve lookups that are the object of an object-property relationship
        if( resolve ){
            result = assign( scope, result, void 0 );
        }
        //console.log( `- ${ fn.name } LHS`, lhs );
        //console.log( `- ${ fn.name } DEPTH`, depth );
        //console.log( `- ${ fn.name } RESULT`, result  );
        return context ?
            { context: lookup, name: lhs.value, value: result } :
            result;
    };
};

Interpreter.prototype.rangeExpression = function( nl, nr, context, assign ){
    //console.log( 'Composing RANGE EXPRESSION' );
    //console.log( '- DEPTH', this.depth );
    var interpreter = this,
        depth = this.depth,
        left = nl !== null ?
            interpreter.recurse( nl, false, assign ) :
            returnZero,
        right = nr !== null ?
            interpreter.recurse( nr, false, assign ) :
            returnZero,
        fn, index, lhs, middle, result, rhs;

    return fn = function executeRangeExpression( scope, value, lookup ){
        //console.log( 'Executing RANGE EXPRESSION' );
        //console.log( `- ${ fn.name } LEFT`, left.name );
        //console.log( `- ${ fn.name } RIGHT`, right.name );
        lhs = left( scope, value, lookup );
        rhs = right( scope, value, lookup );
        result = [];
        index = 1;
        //console.log( `- ${ fn.name } LHS`, lhs );
        //console.log( `- ${ fn.name } RHS`, rhs );
        //console.log( `- ${ fn.name } DEPTH`, depth );
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
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { value: result } :
            result;
    };
};

/**
 * @function
 */
Interpreter.prototype.recurse = function( node, context, assign ){
    //console.log( 'Recursing', node.type, node.range );
    var expression = null;
    this.depth++;

    switch( node.type ){
        case ArrayExpression:
            expression = this.arrayExpression( node.elements, context, assign );
            this.isLeftList = node.elements.length > 1;
            break;
        case CallExpression:
            expression = this.callExpression( node.callee, node.arguments, context, assign );
            break;
        case BlockExpression:
            expression = this.blockExpression( node.body, context, assign );
            break;
        case ExistentialExpression:
            expression = this.existentialExpression( node.expression, context, assign );
            break;
        case Identifier:
            expression = this.identifier( node.name, context, assign );
            break;
        case Literal:
            expression = this.literal( node.value, context );
            break;
        case MemberExpression:
            expression = node.computed ?
                this.computedMemberExpression( node.object, node.property, context, assign ) :
                this.staticMemberExpression( node.object, node.property, context, assign );
            break;
        case LookupExpression:
            expression = this.lookupExpression( node.key, false, context, assign );
            break;
        case RangeExpression:
            expression = this.rangeExpression( node.left, node.right, context, assign );
            break;
        case RootExpression:
            expression = this.rootExpression( node.key, context, assign );
            break;
        case SequenceExpression:
            expression = this.sequenceExpression( node.expressions, context, assign );
            this.isRightList = true;
            break;
        default:
            this.throwError( 'Unknown node type ' + node.type );
    }
    this.depth--;
    return expression;
};

Interpreter.prototype.rootExpression = function( key, context, assign ){
    //console.log( 'Composing ROOT EXPRESSION' );
    //console.log( '- DEPTH', this.depth );
    var left = this.recurse( key, false, assign ),
        depth = this.depth,
        fn;

    return fn = function executeRootExpression( scope, value, lookup ){
        //console.log( 'Executing ROOT EXPRESSION' );
        //console.log( `- ${ fn.name } LEFT`, left.name || left );
        //console.log( `- ${ fn.name } SCOPE`, scope );
        var lhs, result;
        result = lhs = left( scope, value, lookup );
        //console.log( `- ${ fn.name } LHS`, lhs );
        //console.log( `- ${ fn.name } DEPTH`, depth );
        //console.log( `- ${ fn.name } RESULT`, result  );
        return context ?
            { context: lookup, name: lhs.value, value: result } :
            result;
    };
};

Interpreter.prototype.sequenceExpression = function( expressions, context, assign ){
    var depth = this.depth,
        fn, list;
    //console.log( 'Composing SEQUENCE EXPRESSION' );
    //console.log( '- DEPTH', this.depth );
    if( Array.isArray( expressions ) ){
        list = this.listExpression( expressions, false, assign );

        fn = function executeSequenceExpression( scope, value, lookup ){
            //console.log( 'Executing SEQUENCE EXPRESSION' );
            //console.log( `- ${ fn.name } LIST`, list );
            //console.log( `- ${ fn.name } DEPTH`, depth );
            var result = executeList( list, scope, value, lookup );
            //console.log( `- ${ fn.name } RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    } else {
        list = this.recurse( expressions, false, assign );

        fn = function executeSequenceExpressionWithExpressionRange( scope, value, lookup ){
            //console.log( 'Executing SEQUENCE EXPRESSION' );
            //console.log( `- ${ fn.name } LIST`, list.name );
            //console.log( `- ${ fn.name } DEPTH`, depth );
            var result = list( scope, value, lookup );
            //console.log( `- ${ fn.name } RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    }

    return fn;
};

Interpreter.prototype.staticMemberExpression = function( object, property, context, assign ){
    //console.log( 'Composing STATIC MEMBER EXPRESSION', object.type, property.type );
    //console.log( '- DEPTH', this.depth );
    var interpreter = this,
        depth = this.depth,
        isRightFunction = false,
        isSafe = object.type === ExistentialExpression,
        fn, left, rhs, right;

    switch( object.type ){
        case LookupExpression:
            left = this.lookupExpression( object.key, true, false, assign );
            break;
        default:
            left = this.recurse( object, false, assign );
            break;
    }

    switch( property.type ){
        case Identifier:
            rhs = right = property.name;
            break;
        default:
            right = this.recurse( property, false, assign );
            isRightFunction = true;
    }

    return fn = function executeStaticMemberExpression( scope, value, lookup ){
        //console.log( 'Executing STATIC MEMBER EXPRESSION' );
        //console.log( `- ${ fn.name } LEFT`, left.name );
        //console.log( `- ${ fn.name } RIGHT`, rhs || right.name );
        var lhs = left( scope, value, lookup ),
            index, result;

        if( !isSafe || ( lhs !== void 0 && lhs !== null ) ){
            if( isRightFunction ){
                rhs = right( property.type === RootExpression ? scope : lhs, value, lookup );
            }
            //console.log( `- ${ fn.name } LHS`, lhs );
            //console.log( `- ${ fn.name } RHS`, rhs );
            //console.log( `- ${ fn.name } DEPTH`, depth );
            if( ( interpreter.isLeftList || interpreter.isRightList ) && Array.isArray( lhs ) ){
                index = lhs.length;
                result = new Array( index );
                while( index-- ){
                    result[ index ] = assign( lhs[ index ], rhs, !depth ? value : {} );
                }
            } else {
                result = assign( lhs, rhs, !depth ? value : {} );
            }
        }
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { context: lhs, name: rhs, value: result } :
            result;
    };
};

Interpreter.prototype.throwError = function( message ){
    var e = new Error( message );
    e.columnNumber = this.column;
    throw e;
    //throw new Error( message );
};

return Interpreter;

})));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0ZXIuanMiLCJzb3VyY2VzIjpbImhhcy1vd24tcHJvcGVydHkuanMiLCJudWxsLmpzIiwic3ludGF4LmpzIiwia2V5cGF0aC1zeW50YXguanMiLCJpbnRlcnByZXRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX2hhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7Kn0gb2JqZWN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gcHJvcGVydHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaGFzT3duUHJvcGVydHkoIG9iamVjdCwgcHJvcGVydHkgKXtcbiAgICByZXR1cm4gX2hhc093blByb3BlcnR5LmNhbGwoIG9iamVjdCwgcHJvcGVydHkgKTtcbn0iLCIvKipcbiAqIEEgXCJjbGVhblwiLCBlbXB0eSBjb250YWluZXIuIEluc3RhbnRpYXRpbmcgdGhpcyBpcyBmYXN0ZXIgdGhhbiBleHBsaWNpdGx5IGNhbGxpbmcgYE9iamVjdC5jcmVhdGUoIG51bGwgKWAuXG4gKiBAY2xhc3MgTnVsbFxuICogQGV4dGVuZHMgZXh0ZXJuYWw6bnVsbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBOdWxsKCl7fVxuTnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5OdWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBOdWxsOyIsImV4cG9ydCB2YXIgQXJyYXlFeHByZXNzaW9uICAgICAgID0gJ0FycmF5RXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIENhbGxFeHByZXNzaW9uICAgICAgICA9ICdDYWxsRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIEV4cHJlc3Npb25TdGF0ZW1lbnQgICA9ICdFeHByZXNzaW9uU3RhdGVtZW50JztcbmV4cG9ydCB2YXIgSWRlbnRpZmllciAgICAgICAgICAgID0gJ0lkZW50aWZpZXInO1xuZXhwb3J0IHZhciBMaXRlcmFsICAgICAgICAgICAgICAgPSAnTGl0ZXJhbCc7XG5leHBvcnQgdmFyIE1lbWJlckV4cHJlc3Npb24gICAgICA9ICdNZW1iZXJFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUHJvZ3JhbSAgICAgICAgICAgICAgID0gJ1Byb2dyYW0nO1xuZXhwb3J0IHZhciBTZXF1ZW5jZUV4cHJlc3Npb24gICAgPSAnU2VxdWVuY2VFeHByZXNzaW9uJzsiLCJleHBvcnQgdmFyIEJsb2NrRXhwcmVzc2lvbiAgICAgICA9ICdCbG9ja0V4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBFeGlzdGVudGlhbEV4cHJlc3Npb24gPSAnRXhpc3RlbnRpYWxFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgTG9va3VwRXhwcmVzc2lvbiAgICAgID0gJ0xvb2t1cEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBSYW5nZUV4cHJlc3Npb24gICAgICAgPSAnUmFuZ2VFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUm9vdEV4cHJlc3Npb24gICAgICAgID0gJ1Jvb3RFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgU2NvcGVFeHByZXNzaW9uICAgICAgID0gJ1Njb3BlRXhwcmVzc2lvbic7IiwiaW1wb3J0IGhhc093blByb3BlcnR5IGZyb20gJy4vaGFzLW93bi1wcm9wZXJ0eSc7XG5pbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgU3ludGF4IGZyb20gJy4vc3ludGF4JztcbmltcG9ydCAqIGFzIEtleXBhdGhTeW50YXggZnJvbSAnLi9rZXlwYXRoLXN5bnRheCc7XG5cbnZhciBub29wID0gZnVuY3Rpb24oKXt9LFxuXG4gICAgY2FjaGUgPSBuZXcgTnVsbCgpLFxuICAgIGdldHRlciA9IG5ldyBOdWxsKCksXG4gICAgc2V0dGVyID0gbmV3IE51bGwoKTtcblxuZnVuY3Rpb24gZXhlY3V0ZUxpc3QoIGxpc3QsIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgdmFyIGluZGV4ID0gbGlzdC5sZW5ndGgsXG4gICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICBzd2l0Y2goIGxpc3QubGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IGxpc3RbIDAgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IGxpc3RbIDAgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIHJlc3VsdFsgMSBdID0gbGlzdFsgMSBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gbGlzdFsgMCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgcmVzdWx0WyAxIF0gPSBsaXN0WyAxIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICByZXN1bHRbIDIgXSA9IGxpc3RbIDIgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IGxpc3RbIDAgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIHJlc3VsdFsgMSBdID0gbGlzdFsgMSBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgcmVzdWx0WyAyIF0gPSBsaXN0WyAyIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICByZXN1bHRbIDMgXSA9IGxpc3RbIDMgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBsaXN0WyBpbmRleCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmdldHRlci52YWx1ZSA9IGZ1bmN0aW9uKCBvYmplY3QsIGtleSApe1xuICAgIHJldHVybiBvYmplY3RbIGtleSBdO1xufTtcblxuZ2V0dGVyLmxpc3QgPSBmdW5jdGlvbiggb2JqZWN0LCBrZXkgKXtcbiAgICB2YXIgaW5kZXggPSBvYmplY3QubGVuZ3RoLFxuICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG5cbiAgICBzd2l0Y2goIGluZGV4ICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gb2JqZWN0WyAwIF1bIGtleSBdO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBvYmplY3RbIDAgXVsga2V5IF07XG4gICAgICAgICAgICByZXN1bHRbIDEgXSA9IG9iamVjdFsgMSBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gb2JqZWN0WyAwIF1bIGtleSBdO1xuICAgICAgICAgICAgcmVzdWx0WyAxIF0gPSBvYmplY3RbIDEgXVsga2V5IF07XG4gICAgICAgICAgICByZXN1bHRbIDIgXSA9IG9iamVjdFsgMiBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gb2JqZWN0WyAwIF1bIGtleSBdO1xuICAgICAgICAgICAgcmVzdWx0WyAxIF0gPSBvYmplY3RbIDEgXVsga2V5IF07XG4gICAgICAgICAgICByZXN1bHRbIDIgXSA9IG9iamVjdFsgMiBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJlc3VsdFsgMyBdID0gb2JqZWN0WyAzIF1bIGtleSBdO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gb2JqZWN0WyBpbmRleCBdWyBrZXkgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxuc2V0dGVyLnZhbHVlID0gZnVuY3Rpb24oIG9iamVjdCwga2V5LCB2YWx1ZSApe1xuICAgIGlmKCAhaGFzT3duUHJvcGVydHkoIG9iamVjdCwga2V5ICkgKXtcbiAgICAgICAgb2JqZWN0WyBrZXkgXSA9IHZhbHVlIHx8IHt9O1xuICAgIH1cbiAgICByZXR1cm4gZ2V0dGVyLnZhbHVlKCBvYmplY3QsIGtleSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gSW50ZXJwcmV0ZXJ+cmV0dXJuWmVyb1xuICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gemVyb1xuICovXG5mdW5jdGlvbiByZXR1cm5aZXJvKCl7XG4gICAgcmV0dXJuIDA7XG59XG5cbi8qKlxuICogQGNsYXNzIEludGVycHJldGVyRXJyb3JcbiAqIEBleHRlbmRzIGV4dGVybmFsOlN5bnRheEVycm9yXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gbWVzc2FnZVxuICovXG5mdW5jdGlvbiBJbnRlcnByZXRlckVycm9yKCBtZXNzYWdlICl7XG4gICAgU3ludGF4RXJyb3IuY2FsbCggdGhpcywgbWVzc2FnZSApO1xufVxuXG5JbnRlcnByZXRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBTeW50YXhFcnJvci5wcm90b3R5cGUgKTtcblxuLyoqXG4gKiBAY2xhc3MgSW50ZXJwcmV0ZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7QnVpbGRlcn0gYnVpbGRlclxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBJbnRlcnByZXRlciggYnVpbGRlciApe1xuICAgIGlmKCAhYXJndW1lbnRzLmxlbmd0aCApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdidWlsZGVyIGNhbm5vdCBiZSB1bmRlZmluZWQnLCBUeXBlRXJyb3IgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfSBJbnRlcnByZXRlciNidWlsZGVyXG4gICAgICovXG4gICAgdGhpcy5idWlsZGVyID0gYnVpbGRlcjtcbn1cblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSW50ZXJwcmV0ZXI7XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5hcnJheUV4cHJlc3Npb24gPSBmdW5jdGlvbiggZWxlbWVudHMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQVJSQVkgRVhQUkVTU0lPTicsIGVsZW1lbnRzLmxlbmd0aCApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGZuLCBsaXN0O1xuICAgIGlmKCBBcnJheS5pc0FycmF5KCBlbGVtZW50cyApICl7XG4gICAgICAgIGxpc3QgPSB0aGlzLmxpc3RFeHByZXNzaW9uKCBlbGVtZW50cywgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgICAgIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQVJSQVkgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSVNUYCwgbGlzdCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGxpc3QubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGtleXMsIHJlc3VsdDtcbiAgICAgICAgICAgIHN3aXRjaCggaW5kZXggKXtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAga2V5cyA9IGxpc3RbIDAgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBzY29wZSwga2V5cywgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBrZXlzID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzWyBpbmRleCBdID0gbGlzdFsgaW5kZXggXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGFzc2lnbiggc2NvcGUsIGtleXNbIGluZGV4IF0sICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBLRVlTYCwga2V5cyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdCA9IHRoaXMucmVjdXJzZSggZWxlbWVudHMsIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgICAgICBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVBcnJheUV4cHJlc3Npb25XaXRoRWxlbWVudFJhbmdlKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBBUlJBWSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExJU1RgLCBsaXN0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIga2V5cyA9IGxpc3QoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICksXG4gICAgICAgICAgICAgICAgaW5kZXggPSBrZXlzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICBpZiggaW5kZXggPT09IDEgKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIDAgXSA9IGFzc2lnbiggc2NvcGUsIGtleXNbIDAgXSwgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBhc3NpZ24oIHNjb3BlLCBrZXlzWyBpbmRleCBdLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZuO1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmJsb2NrRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCB0b2tlbnMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQkxPQ0snLCB0b2tlbnMuam9pbiggJycgKSApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIHRleHQgPSB0b2tlbnMuam9pbiggJycgKSxcbiAgICAgICAgcHJvZ3JhbSA9IGhhc093blByb3BlcnR5KCBjYWNoZSwgdGV4dCApID9cbiAgICAgICAgICAgIGNhY2hlWyB0ZXh0IF0gOlxuICAgICAgICAgICAgY2FjaGVbIHRleHQgXSA9IHRoaXMuYnVpbGRlci5idWlsZCggdG9rZW5zICksXG4gICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLnJlY3Vyc2UoIHByb2dyYW0uYm9keVsgMCBdLmV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKSxcbiAgICAgICAgZm47XG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUJsb2NrRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBCTE9DSycgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFNDT1BFYCwgc2NvcGUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IEVYUFJFU1NJT05gLCBleHByZXNzaW9uLm5hbWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBzY29wZSwgbmFtZTogdm9pZCAwLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuY2FsbEV4cHJlc3Npb24gPSBmdW5jdGlvbiggY2FsbGVlLCBhcmdzLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIENBTEwgRVhQUkVTU0lPTicgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGlzU2V0dGluZyA9IGFzc2lnbiA9PT0gc2V0dGVyLnZhbHVlLFxuICAgICAgICBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBjYWxsZWUsIHRydWUsIGFzc2lnbiApLFxuICAgICAgICBsaXN0ID0gdGhpcy5saXN0RXhwcmVzc2lvbiggYXJncywgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICBmbjtcblxuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVDYWxsRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBDQUxMIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBhcmdzYCwgYXJncy5sZW5ndGggKTtcbiAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICksXG4gICAgICAgICAgICB2YWx1ZXMgPSBleGVjdXRlTGlzdCggbGlzdCwgc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExIU2AsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICByZXN1bHQgPSBsaHMudmFsdWUuYXBwbHkoIGxocy5jb250ZXh0LCB2YWx1ZXMgKTtcbiAgICAgICAgaWYoIGlzU2V0dGluZyAmJiB0eXBlb2YgbGhzLnZhbHVlID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgaW50ZXJwcmV0ZXIudGhyb3dFcnJvciggJ2Nhbm5vdCBjcmVhdGUgY2FsbCBleHByZXNzaW9ucycgKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9OlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGV4cHJlc3Npb25cbiAqL1xuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmNvbXBpbGUgPSBmdW5jdGlvbiggZXhwcmVzc2lvbiwgY3JlYXRlICl7XG4gICAgdmFyIHByb2dyYW0gPSBoYXNPd25Qcm9wZXJ0eSggY2FjaGUsIGV4cHJlc3Npb24gKSA/XG4gICAgICAgICAgICBjYWNoZVsgZXhwcmVzc2lvbiBdIDpcbiAgICAgICAgICAgIGNhY2hlWyBleHByZXNzaW9uIF0gPSB0aGlzLmJ1aWxkZXIuYnVpbGQoIGV4cHJlc3Npb24gKSxcbiAgICAgICAgYm9keSA9IHByb2dyYW0uYm9keSxcbiAgICAgICAgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBhc3NpZ24sIGV4cHJlc3Npb25zLCBmbiwgaW5kZXg7XG5cbiAgICBpZiggdHlwZW9mIGNyZWF0ZSAhPT0gJ2Jvb2xlYW4nICl7XG4gICAgICAgIGNyZWF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLmRlcHRoID0gLTE7XG4gICAgdGhpcy5pc0xlZnRMaXN0ID0gZmFsc2U7XG4gICAgdGhpcy5pc1JpZ2h0TGlzdCA9IGZhbHNlO1xuICAgIHRoaXMuYXNzaWduZXIgPSBjcmVhdGUgP1xuICAgICAgICBzZXR0ZXIgOlxuICAgICAgICBnZXR0ZXI7XG5cbiAgICBhc3NpZ24gPSB0aGlzLmFzc2lnbmVyLnZhbHVlO1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqL1xuICAgIGludGVycHJldGVyLmV4cHJlc3Npb24gPSB0aGlzLmJ1aWxkZXIudGV4dDtcbiAgICAvL2NvbnNvbGUubG9nKCAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnSW50ZXJwcmV0aW5nICcsIGV4cHJlc3Npb24gKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnUHJvZ3JhbScsIHByb2dyYW0ucmFuZ2UgKTtcblxuICAgIHN3aXRjaCggYm9keS5sZW5ndGggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgZm4gPSBub29wO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGZuID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggYm9keVsgMCBdLmV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaW5kZXggPSBib2R5Lmxlbmd0aDtcbiAgICAgICAgICAgIGV4cHJlc3Npb25zID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uc1sgaW5kZXggXSA9IGludGVycHJldGVyLnJlY3Vyc2UoIGJvZHlbIGluZGV4IF0uZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlUHJvZ3JhbSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoID0gZXhwcmVzc2lvbnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBsYXN0VmFsdWU7XG5cbiAgICAgICAgICAgICAgICBmb3IoIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KysgKXtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFZhbHVlID0gZXhwcmVzc2lvbnNbIGluZGV4IF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhc3RWYWx1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJ0ZOJywgZm4ubmFtZSApO1xuICAgIHJldHVybiBmbjtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5jb21wdXRlZE1lbWJlckV4cHJlc3Npb24gPSBmdW5jdGlvbiggb2JqZWN0LCBwcm9wZXJ0eSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBDT01QVVRFRCBNRU1CRVIgRVhQUkVTU0lPTicsIG9iamVjdC50eXBlLCBwcm9wZXJ0eS50eXBlICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBpc1NhZmUgPSBvYmplY3QudHlwZSA9PT0gS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb24sXG4gICAgICAgIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIG9iamVjdCwgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICByaWdodCA9IHRoaXMucmVjdXJzZSggcHJvcGVydHksIGZhbHNlLCBhc3NpZ24gKSxcbiAgICAgICAgZm47XG5cbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIENPTVBVVEVEIE1FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEVGVCBgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJJR0hUYCwgcmlnaHQubmFtZSApO1xuICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgIGluZGV4LCBsZW5ndGgsIHBvc2l0aW9uLCByZXN1bHQsIHJocztcbiAgICAgICAgaWYoICFpc1NhZmUgfHwgKCBsaHMgIT09IHZvaWQgMCAmJiBsaHMgIT09IG51bGwgKSApe1xuICAgICAgICAgICAgcmhzID0gcmlnaHQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExIU2AsIGxocyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJIU2AsIHJocyApO1xuICAgICAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIHJocyApICl7XG4gICAgICAgICAgICAgICAgaWYoICggaW50ZXJwcmV0ZXIuaXNMZWZ0TGlzdCApICYmIEFycmF5LmlzQXJyYXkoIGxocyApICl7XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aCA9IHJocy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gbGhzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gbmV3IEFycmF5KCBsZW5ndGggKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciggcG9zaXRpb24gPSAwOyBwb3NpdGlvbiA8IGxlbmd0aDsgcG9zaXRpb24rKyApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXVsgcG9zaXRpb24gXSA9IGFzc2lnbiggbGhzWyBpbmRleCBdLCByaHNbIHBvc2l0aW9uIF0sICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gcmhzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gYXNzaWduKCBsaHMsIHJoc1sgaW5kZXggXSwgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmKCAoIGludGVycHJldGVyLmlzTGVmdExpc3QgfHwgaW50ZXJwcmV0ZXIuaXNSaWdodExpc3QgKSAmJiBBcnJheS5pc0FycmF5KCBsaHMgKSApe1xuICAgICAgICAgICAgICAgIGluZGV4ID0gbGhzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gYXNzaWduKCBsaHNbIGluZGV4IF0sIHJocywgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBsaHMsIHJocywgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmV4aXN0ZW50aWFsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBleHByZXNzaW9uLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIEVYSVNURU5USUFMIEVYUFJFU1NJT04nLCBleHByZXNzaW9uLnR5cGUgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgbGVmdCA9IHRoaXMucmVjdXJzZSggZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICBmbjtcbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlRXhpc3RlbnRpYWxFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIEVYSVNURU5USUFMIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMRUZUYCwgbGVmdC5uYW1lICk7XG4gICAgICAgIGlmKCBzY29wZSAhPT0gdm9pZCAwICYmIHNjb3BlICE9PSBudWxsICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdm9pZCAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuaWRlbnRpZmllciA9IGZ1bmN0aW9uKCBuYW1lLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIElERU5USUZJRVInLCBuYW1lICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgZm47XG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUlkZW50aWZpZXIoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgSURFTlRJRklFUicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IE5BTUVgLCBuYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBWQUxVRWAsIHZhbHVlICk7XG4gICAgICAgIHZhciByZXN1bHQgPSBhc3NpZ24oIHNjb3BlLCBuYW1lLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBzY29wZSwgbmFtZTogbmFtZSwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmxpc3RFeHByZXNzaW9uID0gZnVuY3Rpb24oIGl0ZW1zLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICB2YXIgaW5kZXggPSBpdGVtcy5sZW5ndGgsXG4gICAgICAgIGxpc3QgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG5cbiAgICBzd2l0Y2goIGluZGV4ICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBsaXN0WyAwIF0gPSB0aGlzLmxpc3RFeHByZXNzaW9uRWxlbWVudCggaXRlbXNbIDAgXSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgbGlzdFsgaW5kZXggXSA9IHRoaXMubGlzdEV4cHJlc3Npb25FbGVtZW50KCBpdGVtc1sgaW5kZXggXSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpc3Q7XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUubGlzdEV4cHJlc3Npb25FbGVtZW50ID0gZnVuY3Rpb24oIGVsZW1lbnQsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIHN3aXRjaCggZWxlbWVudC50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LkxpdGVyYWw6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXRlcmFsKCBlbGVtZW50LnZhbHVlLCBjb250ZXh0ICk7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9va3VwRXhwcmVzc2lvbiggZWxlbWVudC5rZXksIGZhbHNlLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucm9vdEV4cHJlc3Npb24oIGVsZW1lbnQua2V5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LkJsb2NrRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJsb2NrRXhwcmVzc2lvbiggZWxlbWVudC5ib2R5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvciggJ1VuZXhwZWN0ZWQgbGlzdCBlbGVtZW50IHR5cGUnLCBlbGVtZW50LnR5cGUgKTtcbiAgICB9XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUubGl0ZXJhbCA9IGZ1bmN0aW9uKCB2YWx1ZSwgY29udGV4dCApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgTElURVJBTCcsIHZhbHVlICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgZm47XG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUxpdGVyYWwoKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBMSVRFUkFMJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgdmFsdWUgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiB2b2lkIDAsIG5hbWU6IHZvaWQgMCwgdmFsdWU6IHZhbHVlIH0gOlxuICAgICAgICAgICAgdmFsdWU7XG4gICAgfTtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5sb29rdXBFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSwgcmVzb2x2ZSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBMT09LVVAgRVhQUkVTU0lPTicsIGtleSApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBpc0xlZnRGdW5jdGlvbiA9IGZhbHNlLFxuICAgICAgICBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGxocyA9IHt9LFxuICAgICAgICBmbiwgbGVmdDtcblxuICAgIHN3aXRjaCgga2V5LnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmlkZW50aWZpZXIoIGtleS5uYW1lLCB0cnVlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGlzTGVmdEZ1bmN0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5MaXRlcmFsOlxuICAgICAgICAgICAgbGhzLnZhbHVlID0gbGVmdCA9IGtleS52YWx1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGVmdCA9IHRoaXMucmVjdXJzZSgga2V5LCB0cnVlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGlzTGVmdEZ1bmN0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVMb29rdXBFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIExPT0tVUCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEVGVGAsIGxlZnQubmFtZSB8fCBsZWZ0ICk7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmKCBpc0xlZnRGdW5jdGlvbiApe1xuICAgICAgICAgICAgbGhzID0gbGVmdCggbG9va3VwLCB2YWx1ZSwgc2NvcGUgKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGxocy52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggbG9va3VwLCBsaHMudmFsdWUsIHZvaWQgMCApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlc29sdmUgbG9va3VwcyB0aGF0IGFyZSB0aGUgb2JqZWN0IG9mIGFuIG9iamVjdC1wcm9wZXJ0eSByZWxhdGlvbnNoaXBcbiAgICAgICAgaWYoIHJlc29sdmUgKXtcbiAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggc2NvcGUsIHJlc3VsdCwgdm9pZCAwICk7XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExIU2AsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxvb2t1cCwgbmFtZTogbGhzLnZhbHVlLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUucmFuZ2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIG5sLCBuciwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBSQU5HRSBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgbGVmdCA9IG5sICE9PSBudWxsID9cbiAgICAgICAgICAgIGludGVycHJldGVyLnJlY3Vyc2UoIG5sLCBmYWxzZSwgYXNzaWduICkgOlxuICAgICAgICAgICAgcmV0dXJuWmVybyxcbiAgICAgICAgcmlnaHQgPSBuciAhPT0gbnVsbCA/XG4gICAgICAgICAgICBpbnRlcnByZXRlci5yZWN1cnNlKCBuciwgZmFsc2UsIGFzc2lnbiApIDpcbiAgICAgICAgICAgIHJldHVyblplcm8sXG4gICAgICAgIGZuLCBpbmRleCwgbGhzLCBtaWRkbGUsIHJlc3VsdCwgcmhzO1xuXG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBSQU5HRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEVGVGAsIGxlZnQubmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUklHSFRgLCByaWdodC5uYW1lICk7XG4gICAgICAgIGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgIHJocyA9IHJpZ2h0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgaW5kZXggPSAxO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEhTYCwgbGhzICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSSFNgLCByaHMgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgcmVzdWx0WyAwIF0gPSBsaHM7XG4gICAgICAgIGlmKCBsaHMgPCByaHMgKXtcbiAgICAgICAgICAgIG1pZGRsZSA9IGxocyArIDE7XG4gICAgICAgICAgICB3aGlsZSggbWlkZGxlIDwgcmhzICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCsrIF0gPSBtaWRkbGUrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmKCBsaHMgPiByaHMgKXtcbiAgICAgICAgICAgIG1pZGRsZSA9IGxocyAtIDE7XG4gICAgICAgICAgICB3aGlsZSggbWlkZGxlID4gcmhzICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCsrIF0gPSBtaWRkbGUtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbIHJlc3VsdC5sZW5ndGggXSA9IHJocztcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbkludGVycHJldGVyLnByb3RvdHlwZS5yZWN1cnNlID0gZnVuY3Rpb24oIG5vZGUsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdSZWN1cnNpbmcnLCBub2RlLnR5cGUsIG5vZGUucmFuZ2UgKTtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IG51bGw7XG4gICAgdGhpcy5kZXB0aCsrO1xuXG4gICAgc3dpdGNoKCBub2RlLnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguQXJyYXlFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuYXJyYXlFeHByZXNzaW9uKCBub2RlLmVsZW1lbnRzLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIHRoaXMuaXNMZWZ0TGlzdCA9IG5vZGUuZWxlbWVudHMubGVuZ3RoID4gMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5DYWxsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmNhbGxFeHByZXNzaW9uKCBub2RlLmNhbGxlZSwgbm9kZS5hcmd1bWVudHMsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5CbG9ja0V4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5ibG9ja0V4cHJlc3Npb24oIG5vZGUuYm9keSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmV4aXN0ZW50aWFsRXhwcmVzc2lvbiggbm9kZS5leHByZXNzaW9uLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5JZGVudGlmaWVyOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuaWRlbnRpZmllciggbm9kZS5uYW1lLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5MaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubGl0ZXJhbCggbm9kZS52YWx1ZSwgY29udGV4dCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4Lk1lbWJlckV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gbm9kZS5jb21wdXRlZCA/XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIG5vZGUub2JqZWN0LCBub2RlLnByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKSA6XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBub2RlLm9iamVjdCwgbm9kZS5wcm9wZXJ0eSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXBFeHByZXNzaW9uKCBub2RlLmtleSwgZmFsc2UsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5SYW5nZUV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5yYW5nZUV4cHJlc3Npb24oIG5vZGUubGVmdCwgbm9kZS5yaWdodCwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMucm9vdEV4cHJlc3Npb24oIG5vZGUua2V5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5TZXF1ZW5jZUV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5zZXF1ZW5jZUV4cHJlc3Npb24oIG5vZGUuZXhwcmVzc2lvbnMsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgdGhpcy5pc1JpZ2h0TGlzdCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvciggJ1Vua25vd24gbm9kZSB0eXBlICcgKyBub2RlLnR5cGUgKTtcbiAgICB9XG4gICAgdGhpcy5kZXB0aC0tO1xuICAgIHJldHVybiBleHByZXNzaW9uO1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLnJvb3RFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBST09UIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIGtleSwgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGZuO1xuXG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZVJvb3RFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFJPT1QgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExFRlRgLCBsZWZ0Lm5hbWUgfHwgbGVmdCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gU0NPUEVgLCBzY29wZSApO1xuICAgICAgICB2YXIgbGhzLCByZXN1bHQ7XG4gICAgICAgIHJlc3VsdCA9IGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSFNgLCBsaHMgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCAgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBsb29rdXAsIG5hbWU6IGxocy52YWx1ZSwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNlcXVlbmNlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBleHByZXNzaW9ucywgY29udGV4dCwgYXNzaWduICl7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgZm4sIGxpc3Q7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBTRVFVRU5DRSBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIGlmKCBBcnJheS5pc0FycmF5KCBleHByZXNzaW9ucyApICl7XG4gICAgICAgIGxpc3QgPSB0aGlzLmxpc3RFeHByZXNzaW9uKCBleHByZXNzaW9ucywgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgICAgIGZuID0gZnVuY3Rpb24gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgU0VRVUVOQ0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSVNUYCwgbGlzdCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBleGVjdXRlTGlzdCggbGlzdCwgc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3QgPSB0aGlzLnJlY3Vyc2UoIGV4cHJlc3Npb25zLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uV2l0aEV4cHJlc3Npb25SYW5nZSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgU0VRVUVOQ0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSVNUYCwgbGlzdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGxpc3QoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZm47XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuc3RhdGljTWVtYmVyRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBvYmplY3QsIHByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFNUQVRJQyBNRU1CRVIgRVhQUkVTU0lPTicsIG9iamVjdC50eXBlLCBwcm9wZXJ0eS50eXBlICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBpc1JpZ2h0RnVuY3Rpb24gPSBmYWxzZSxcbiAgICAgICAgaXNTYWZlID0gb2JqZWN0LnR5cGUgPT09IEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uLFxuICAgICAgICBmbiwgbGVmdCwgcmhzLCByaWdodDtcblxuICAgIHN3aXRjaCggb2JqZWN0LnR5cGUgKXtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5sb29rdXBFeHByZXNzaW9uKCBvYmplY3Qua2V5LCB0cnVlLCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIG9iamVjdCwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgc3dpdGNoKCBwcm9wZXJ0eS50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LklkZW50aWZpZXI6XG4gICAgICAgICAgICByaHMgPSByaWdodCA9IHByb3BlcnR5Lm5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJpZ2h0ID0gdGhpcy5yZWN1cnNlKCBwcm9wZXJ0eSwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgaXNSaWdodEZ1bmN0aW9uID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTVEFUSUMgTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMRUZUYCwgbGVmdC5uYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSSUdIVGAsIHJocyB8fCByaWdodC5uYW1lICk7XG4gICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApLFxuICAgICAgICAgICAgaW5kZXgsIHJlc3VsdDtcblxuICAgICAgICBpZiggIWlzU2FmZSB8fCAoIGxocyAhPT0gdm9pZCAwICYmIGxocyAhPT0gbnVsbCApICl7XG4gICAgICAgICAgICBpZiggaXNSaWdodEZ1bmN0aW9uICl7XG4gICAgICAgICAgICAgICAgcmhzID0gcmlnaHQoIHByb3BlcnR5LnR5cGUgPT09IEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb24gPyBzY29wZSA6IGxocywgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExIU2AsIGxocyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJIU2AsIHJocyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgIGlmKCAoIGludGVycHJldGVyLmlzTGVmdExpc3QgfHwgaW50ZXJwcmV0ZXIuaXNSaWdodExpc3QgKSAmJiBBcnJheS5pc0FycmF5KCBsaHMgKSApe1xuICAgICAgICAgICAgICAgIGluZGV4ID0gbGhzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gYXNzaWduKCBsaHNbIGluZGV4IF0sIHJocywgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBsaHMsIHJocywgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLnRocm93RXJyb3IgPSBmdW5jdGlvbiggbWVzc2FnZSApe1xuICAgIHZhciBlID0gbmV3IEVycm9yKCBtZXNzYWdlICk7XG4gICAgZS5jb2x1bW5OdW1iZXIgPSB0aGlzLmNvbHVtbjtcbiAgICB0aHJvdyBlO1xuICAgIC8vdGhyb3cgbmV3IEVycm9yKCBtZXNzYWdlICk7XG59OyJdLCJuYW1lcyI6WyJLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbiIsIlN5bnRheC5MaXRlcmFsIiwiS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguQmxvY2tFeHByZXNzaW9uIiwiU3ludGF4LklkZW50aWZpZXIiLCJTeW50YXguQXJyYXlFeHByZXNzaW9uIiwiU3ludGF4LkNhbGxFeHByZXNzaW9uIiwiU3ludGF4Lk1lbWJlckV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbiIsIlN5bnRheC5TZXF1ZW5jZUV4cHJlc3Npb24iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDOzs7Ozs7O0FBT3RELEFBQWUsU0FBUyxjQUFjLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTtJQUN0RCxPQUFPLGVBQWUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDOzs7QUNScEQ7Ozs7O0FBS0EsQUFBZSxTQUFTLElBQUksRUFBRSxFQUFFO0FBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsSUFBSSxJQUFJOztBQ1AzQixJQUFJLGVBQWUsU0FBUyxpQkFBaUIsQ0FBQztBQUNyRCxBQUFPLElBQUksY0FBYyxVQUFVLGdCQUFnQixDQUFDO0FBQ3BELEFBQU8sQUFBa0Q7QUFDekQsQUFBTyxJQUFJLFVBQVUsY0FBYyxZQUFZLENBQUM7QUFDaEQsQUFBTyxJQUFJLE9BQU8saUJBQWlCLFNBQVMsQ0FBQztBQUM3QyxBQUFPLElBQUksZ0JBQWdCLFFBQVEsa0JBQWtCLENBQUM7QUFDdEQsQUFBTyxBQUFzQztBQUM3QyxBQUFPLElBQUksa0JBQWtCLE1BQU0sb0JBQW9COztBQ1BoRCxJQUFJLGVBQWUsU0FBUyxpQkFBaUIsQ0FBQztBQUNyRCxBQUFPLElBQUkscUJBQXFCLEdBQUcsdUJBQXVCLENBQUM7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