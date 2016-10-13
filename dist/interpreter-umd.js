(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Interpreter = factory());
}(this, (function () { 'use strict';

/**
 * @typedef {external:Function} ForEachCallback
 * @param {*} item
 * @param {external:number} index
 */

/**
 * @function
 * @param {Array-Like} list
 * @param {ForEachCallback} callback
 */
function forEach( list, callback ){
    let index = 0,
        length = list.length,
        item;
    
    for( ; index < length; index++ ){
        item = list[ index ];
        callback( item, index );
    }
}

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

var Syntax = new Null();

Syntax.ArrayExpression       = 'ArrayExpression';
Syntax.CallExpression        = 'CallExpression';
Syntax.ExpressionStatement   = 'ExpressionStatement';
Syntax.Identifier            = 'Identifier';
Syntax.Literal               = 'Literal';
Syntax.MemberExpression      = 'MemberExpression';
Syntax.LookupExpression      = 'LookupExpression';
Syntax.LookupOperator        = '%';
Syntax.Program               = 'Program';
Syntax.RangeExpression       = 'RangeExpression';
Syntax.RangeOperator         = '..';
Syntax.SequenceExpression    = 'SequenceExpression';

var noop = function(){};
var cache = new Null();

/**
 * @function Interceptor~getValue
 */
function getValue( scope, name ){
    return scope[ name ];
}

/**
 * @function Interceptor~setValue
 */
function setValue( scope, name, value ){
    if( !( hasOwnProperty( scope, name ) ) ){
        scope[ name ] = value;
    }
    return scope[ name ];
}

/**
 * @function Interceptor~returnZero
 * @returns {external:number} zero
 */
function returnZero(){
    return 0;
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

Interpreter.prototype = new Null();

Interpreter.prototype.constructor = Interpreter;

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
        assign, expressions, fn;
    
    if( typeof create !== 'boolean' ){
        create = false;
    }
    
    assign = create ?
        setValue :
        getValue;
    
    /**
     * @member {external:string}
     */
    interpreter.expression = this.builder.text;
    //console.log( '-------------------------------------------------' );
    //console.log( 'Interpreting ', expression );
    //console.log( '-------------------------------------------------' );
    //console.log( 'Program', program.range );
    interpreter.eol = program.range[ 1 ];
    
    switch( body.length ){
        case 0:
            fn = noop;
            break;
        case 1:
            fn = interpreter.recurse( body[ 0 ].expression, false, assign );
            break;
        default:
            expressions = [];
            forEach( body, function( expressionStatement, index ){
                expressions[ index ] = interpreter.recurse( expressionStatement.expression, false, assign );
            } );
            fn = function getProgram( scope, value, lookup ){
                var lastValue;
                
                forEach( expressions, function( expression ){
                    lastValue = expression( scope, value, lookup );
                } );
                
                return lastValue;
            };
            break;
    }
    
    //console.log( 'FN', fn.name );
    
    return fn;
};

/**
 * @function
 */
Interpreter.prototype.recurse = function( node, context, assign ){
    var interpreter = this,
        isRightMost = false,
        
        args, fn, left, right;
    //console.log( 'Recursing on', node.type );
    switch( node.type ){
        
        case Syntax.ArrayExpression: {
            isRightMost = node.range[ 1 ] === interpreter.eol;
            
            if( Array.isArray( node.elements ) ){
                args = interpreter.recurseList( node.elements, false, assign );
                fn = function getArrayExpression( scope, value, lookup ){
                    //console.log( 'Getting ARRAY EXPRESSION' );
                    var result = [], name;
                    switch( args.length ){
                        case 0:
                            break;
                        case 1:
                            name = args[ 0 ]( scope, value, lookup );
                            result[ 0 ] = assign( scope, name, isRightMost ? value : {} );
                            break;
                        default:
                            forEach( args, function( arg, index ){
                                name = arg( scope, value, lookup );
                                result[ index ] = assign( scope, name, isRightMost ? value : {} );
                            } );
                            break;
                    }
                    //console.log( '- ARRAY EXPRESSION RESULT', result );
                    return context ?
                        { value: result } :
                        result;
                };
            } else {
                args = interpreter.recurse( node.elements, false, assign );
                fn = function getArrayExpression( scope, value, lookup ){
                    //console.log( 'Getting ARRAY EXPRESSION' );
                    var result = [],
                        names = args( scope, value, lookup );
                    switch( names.length ){
                        case 0:
                            break;
                        case 1:
                            result[ 0 ] = assign( scope, names[ 0 ], isRightMost ? value : {} );
                            break;
                        default:
                            forEach( names, function( name, index ){
                                result[ index ] = assign( scope, name, isRightMost ? value : {} );
                            } );
                            break;
                    }
                    //console.log( '- ARRAY EXPRESSION RESULT', result );
                    return context ?
                        { value: result } :
                        result;
                };
            }
            
            return fn;
        }
        
        case Syntax.CallExpression: {
            args = interpreter.recurseList( node.arguments, false, assign );
            right = interpreter.recurse( node.callee, true, assign );
            
            return function getCallExpression( scope, value, lookup ){
                //console.log( 'Getting CALL EXPRESSION' );
                //console.log( '- RIGHT', right.name );
                var values = [],
                    rhs = right( scope, value, lookup ),
                    result;
                //console.log( '- RHS', rhs );
                if( typeof rhs.value === 'function' ){
                    values = [];
                    switch( args.length ){
                        case 0:
                            break;
                        case 1:
                            values[ 0 ] = args[ 0 ]( scope, value, lookup );
                            break;
                        default:
                            forEach( args, function( arg, index ){
                                values[ index ] = arg( scope, value, lookup );
                            } );
                            break;
                    }
                    result = rhs.value.apply( rhs.context, values );
                } else if( create && typeof rhs.value === 'undefined' ){
                    throw new Error( 'cannot create call expressions' );
                } else {
                    throw new TypeError( 'call expression must be a function' );
                }
                //console.log( '- CALL RESULT', result );
                return context ?
                    { value: result }:
                    result;
            };
        }
        
        case Syntax.Identifier: {
            isRightMost = node.range[ 1 ] === interpreter.eol;
            
            return function getIdentifier( scope, value, lookup ){
                //console.log( 'Getting IDENTIFIER' );
                var name = node.name,
                    result;
                if( typeof scope !== 'undefined' ){
                    result = assign( scope, name, isRightMost ? value : {} );
                }
                //console.log( '- NAME', name );
                //console.log( '- IDENTIFIER RESULT', result );
                return context ?
                    { context: scope, name: name, value: result } :
                    result;
            };
        }
        
        case Syntax.Literal: {
            return function getLiteral( scope ){
                var result = node.value;
                //console.log( 'Getting LITERAL' );
                //console.log( '- LITERAL RESULT', result );
                return context ?
                    { context: undefined, name: undefined, value: result } :
                    result;
            };
        }
        
        case Syntax.MemberExpression: {
            left = interpreter.recurse( node.object, false, assign );
            isRightMost = node.property.range[ 1 ] + 1 === interpreter.eol;
            
            // Computed
            if( node.computed ){
                right = interpreter.recurse( node.property, false, assign );
                
                if( node.property.type === Syntax.SequenceExpression ){
                    fn = function getComputedMember( scope, value, lookup ){
                        //console.log( 'Getting COMPUTED MEMBER' );
                        //console.log( '- COMPUTED LEFT', left.name );
                        //console.log( '- COMPUTED RIGHT', right.name );
                        var lhs = left( scope, value, lookup ),
                            result = [],
                            rhs;
                        //console.log( '- COMPUTED LHS', lhs );
                        if( typeof lhs !== 'undefined' ){
                            rhs = right( scope, value, lookup );
                            //console.log( '- COMPUTED RHS', rhs );
                            if( Array.isArray( rhs ) ){
                                forEach( rhs, function( item, index ){
                                    result[ index ] = assign( lhs, item, isRightMost ? value : {} );
                                } );
                                //console.log( '-- LIST|VALUE:LIST', result );
                            }
                        }
                        //console.log( '- COMPUTED RESULT', result );
                        return context ?
                            { context: lhs, name: rhs, value: result } :
                            result;
                    };
                } else {
                    if( node.object.type === Syntax.ArrayExpression ){
                        fn = function getComputedMember( scope, value, lookup ){
                            //console.log( 'Getting COMPUTED MEMBER' );
                            //console.log( '- COMPUTED LEFT', left.name );
                            //console.log( '- COMPUTED RIGHT', right.name );
                            var lhs = left( scope, value, lookup ),
                                result, rhs;
                            //console.log( '- COMPUTED LHS', lhs );
                            if( Array.isArray( lhs ) ){
                                rhs = right( scope, value, lookup );
                                //console.log( '- COMPUTED RHS', rhs );
                                if( typeof rhs === 'number' ){
                                    result = assign( lhs, rhs, isRightMost ? value : {} );
                                } else {
                                    if( lhs.length === 1 ){
                                        result = assign( lhs[ 0 ], rhs, isRightMost ? value : {} );
                                    } else {
                                        result = [];
                                        forEach( lhs, function( item, index ){
                                            result[ index ] = assign( item, rhs, isRightMost ? value : {} );
                                        } );
                                    }
                                }
                                //console.log( '-- LIST:VALUE', result );
                            }
                            //console.log( '- COMPUTED RESULT', result );
                            return context ?
                                { context: lhs, name: rhs, value: result } :
                                result;
                        };
                    } else {
                        fn = function getComputedMember( scope, value, lookup ){
                            //console.log( 'Getting COMPUTED MEMBER' );
                            //console.log( '- COMPUTED LEFT', left.name );
                            //console.log( '- COMPUTED RIGHT', right.name );
                            var lhs = left( scope, value, lookup ),
                                result,
                                rhs;
                            //console.log( '- COMPUTED LHS', lhs );
                            if( typeof lhs !== 'undefined' ){
                                rhs = right( scope, value, lookup );
                                //console.log( '- COMPUTED RHS', rhs );
                                result = assign( lhs, rhs, isRightMost ? value : {} );
                                //console.log( '-- VALUE:VALUE', result );
                            }
                            //console.log( '- COMPUTED RESULT', result );
                            return context ?
                                { context: lhs, name: rhs, value: result } :
                                result;
                        };
                    }
                }
                
            // Non-computed
            } else {
                right = node.property.name || interpreter.recurse( node.property, false, assign );
                isRightMost = node.property.range[ 1 ] === interpreter.eol;
                
                fn = function getNonComputedMember( scope, value, lookup ){
                    //console.log( 'Getting NON-COMPUTED MEMBER' );
                    //console.log( '- NON-COMPUTED LEFT', left.name );
                    //console.log( '- NON-COMPUTED RIGHT', right.name || right );
                    var lhs = left( scope, value, lookup ),
                        rhs = typeof right === 'function' ?
                            right( scope, value, lookup ) :
                            right,
                        result;
                    //console.log( '- NON-COMPUTED LHS', lhs );
                    //console.log( '- NON-COMPUTED RHS', rhs );
                    if( typeof lhs !== 'undefined' ){
                        if( typeof lhs === 'string' ){
                            lhs = assign( scope, lhs, isRightMost ? value : {} );
                        }
                        if( !Array.isArray( lhs ) ){
                            result = assign( lhs, rhs, isRightMost ? value : {} );
                            //console.log( '-- VALUE:VALUE', result );
                        } else {
                            if( lhs.length === 1 ){
                                result = assign( lhs[ 0 ], rhs, isRightMost ? value : {} );
                            } else {
                                result = [];
                                forEach( lhs, function( item, index ){
                                    result[ index ] = assign( item, rhs, isRightMost ? value : {} );
                                } );
                            }
                            //console.log( '-- LIST:VALUE', result );
                        }
                    }
                    //console.log( '- NON-COMPUTED RESULT', result );
                    return context ?
                        { context: lhs, name: rhs, value: result } :
                        result;
                };
            }
            
            return fn;
        }
        
        case Syntax.LookupExpression: {
            left = interpreter.recurse( node.key, true, assign );
            
            return function getLookupExpression( scope, value, lookup ){
                //console.log( 'Getting PLACEHOLDER EXPRESSION' );
                var lhs = left( scope, value, lookup ),
                    key = typeof lhs.name !== 'undefined' ?
                        // Identifier
                        lhs.name :
                        // Numeric Literal
                        lhs.value - 1,
                    result = lookup[ key ];
                //console.log( '- PLACEHOLDER LHS', lhs );
                //console.log( '- PLACEHOLDER EXPRESSION RESULT', result );
                return context ?
                    { value: result } :
                    result;
            };
        }
        
        case Syntax.RangeExpression: {
            left = node.left !== null ?
                interpreter.recurse( node.left, false, assign ) :
                returnZero;
            right = node.right !== null ?
                interpreter.recurse( node.right, false, assign ) :
                returnZero;
            return function getRangeExpression( scope, value, lookup ){
                 //console.log( 'Getting RANGE EXPRESSION' );
                 //console.log( '- RANGE LEFT', left.name );
                 //console.log( '- RANGE RIGHT', right.name );
                 var lhs = left( scope, value, lookup ),
                    rhs = right( scope, value, lookup ),
                    result = [],
                    index = 1,
                    middle;
                 //console.log( '- RANGE LHS', lhs );
                 //console.log( '- RANGE RHS', rhs );
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
                 //console.log( '- RANGE EXPRESSION RESULT', result );
                 return context ?
                    { value: result } :
                    result;
            };
        }
        
        case Syntax.SequenceExpression: {
            
            if( Array.isArray( node.expressions ) ){
                args = interpreter.recurseList( node.expressions, false, assign );
                fn = function getSequenceExpression( scope, value, lookup ){
                    //console.log( 'Getting SEQUENCE EXPRESSION' );
                    var result = [];
                    forEach( args, function( arg, index ){
                        result[ index ] = arg( scope );
                    } );
                    //console.log( '- SEQUENCE RESULT', result );
                    return context ?
                        { value: result } :
                        result;
                };
            } else {
                args = interpreter.recurse( node.expressions, false, assign );
                fn = function getSequenceExpression( scope, value, lookup ){
                    //console.log( 'Getting SEQUENCE EXPRESSION' );
                    var result = args( scope, value, lookup );
                    //console.log( '- SEQUENCE RESULT', result );
                    return context ?
                        { value: result } :
                        result;
                };
            }
            
            return fn;
        }
        
        default:
            this.throwError( 'Unknown node type ' + node.type );
    }
};

Interpreter.prototype.recurseList = function( nodes, context, assign ){
    var interpreter = this,
        result = [];
        
    forEach( nodes, function( expression, index ){
        result[ index ] = interpreter.recurse( expression, context, assign );
    } );
    
    return result;
};

Interpreter.prototype.throwError = function( message ){
    throw new Error( message );
};

return Interpreter;

})));

//# sourceMappingURL=interpreter-umd.js.map