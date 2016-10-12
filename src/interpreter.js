'use strict';

import forEach from './forEach';
import hasOwnProperty from './hasOwnProperty';
import Null from './null';
import Syntax from './builder/syntax';

var noop = function(){},

    cache = new Null();

/**
 * @function Interceptor~getValue
 */
function getValue( base, name, create, defaultValue ){
    if( create && !( hasOwnProperty( base, name ) ) ){
        base[ name ] = defaultValue;
    }
    return base[ name ];
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
        expressions, fn;
    
    if( typeof create !== 'boolean' ){
        create = false;
    }
    
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
            fn = interpreter.recurse( body[ 0 ].expression, false, create );
            break;
        default:
            expressions = [];
            forEach( body, function( expressionStatement, index ){
                expressions[ index ] = interpreter.recurse( expressionStatement.expression, false, create );
            } );
            fn = function( base, value, params ){
                var lastValue;
                
                forEach( expressions, function( expression ){
                    lastValue = expression( base, value, params );
                } );
                
                return lastValue;
            };
            break;
    }
    
    return fn;
};

/**
 * @function
 */
Interpreter.prototype.recurse = function( node, context, create ){
    var interpreter = this,
        isRightMost = false,
        
        args, fn, left, right;
    //console.log( 'Recursing on', node.type );
    switch( node.type ){
        
        case Syntax.ArrayExpression: {
            isRightMost = node.range[ 1 ] === interpreter.eol;
            
            if( Array.isArray( node.elements ) ){
                args = interpreter.recurseList( node.elements, false, create );
                fn = function getArrayExpression( base, value, params ){
                    //console.log( 'Getting ARRAY EXPRESSION' );
                    var result = [], name;
                    switch( args.length ){
                        case 0:
                            break;
                        case 1:
                            name = args[ 0 ]( base, value, params );
                            result[ 0 ] = getValue( base, name, create, isRightMost ? value : {} );
                            break;
                        default:
                            forEach( args, function( arg, index ){
                                name = arg( base, value, params );
                                result[ index ] = getValue( base, name, create, isRightMost ? value : {} );
                            } );
                            break;
                    }
                    //console.log( '- ARRAY EXPRESSION RESULT', result );
                    return context ?
                        { value: result } :
                        result;
                };
            } else {
                args = interpreter.recurse( node.elements, false, create );
                fn = function getArrayExpression( base, value, params ){
                    //console.log( 'Getting ARRAY EXPRESSION' );
                    var result = [],
                        names = args( base, value, params );
                    switch( names.length ){
                        case 0:
                            break;
                        case 1:
                            result[ 0 ] = getValue( base, names[ 0 ], create, isRightMost ? value : {} );
                            break;
                        default:
                            forEach( names, function( name, index ){
                                result[ index ] = getValue( base, name, create, isRightMost ? value : {} );
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
            args = interpreter.recurseList( node.arguments, false, create );
            right = interpreter.recurse( node.callee, true, create );
            
            return function getCallExpression( base, value, params ){
                //console.log( 'Getting CALL EXPRESSION' );
                //console.log( '- RIGHT', right.name );
                var values = [],
                    rhs = right( base, value, params ),
                    result;
                //console.log( '- RHS', rhs );
                if( typeof rhs.value === 'function' ){
                    values = [];
                    switch( args.length ){
                        case 0:
                            break;
                        case 1:
                            values[ 0 ] = args[ 0 ]( base, value, params );
                            break;
                        default:
                            forEach( args, function( arg, index ){
                                values[ index ] = arg( base, value, params );
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
            
            return function getIdentifier( base, value, params ){
                //console.log( 'Getting IDENTIFIER' );
                var name = node.name,
                    result;
                if( typeof base !== 'undefined' ){
                    result = getValue( base, name, create, isRightMost ? value : {} );
                }
                //console.log( '- NAME', name );
                //console.log( '- IDENTIFIER RESULT', result );
                return context ?
                    { context: base, name: name, value: result } :
                    result;
            };
        }
        
        case Syntax.Literal: {
            return function getLiteral( base ){
                var result = node.value;
                //console.log( 'Getting LITERAL' );
                //console.log( '- LITERAL RESULT', result );
                return context ?
                    { context: undefined, name: undefined, value: result } :
                    result;
            };
        }
        
        case Syntax.MemberExpression: {
            left = interpreter.recurse( node.object, false, create );
            isRightMost = node.property.range[ 1 ] + 1 === interpreter.eol;
            
            // Computed
            if( node.computed ){
                right = interpreter.recurse( node.property, false, create );
                
                if( node.property.type === Syntax.SequenceExpression ){
                    fn = function getComputedMember( base, value, params ){
                        //console.log( 'Getting COMPUTED MEMBER' );
                        //console.log( '- COMPUTED LEFT', left.name );
                        //console.log( '- COMPUTED RIGHT', right.name );
                        var lhs = left( base, value, params ),
                            result = [],
                            rhs;
                        //console.log( '- COMPUTED LHS', lhs );
                        if( typeof lhs !== 'undefined' ){
                            rhs = right( base, value, params );
                            //console.log( '- COMPUTED RHS', rhs );
                            if( Array.isArray( rhs ) ){
                                forEach( rhs, function( item, index ){
                                    result[ index ] = getValue( lhs, item, create, isRightMost ? value : {} );
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
                        fn = function getComputedMember( base, value, params ){
                            //console.log( 'Getting COMPUTED MEMBER' );
                            //console.log( '- COMPUTED LEFT', left.name );
                            //console.log( '- COMPUTED RIGHT', right.name );
                            var lhs = left( base, value, params ),
                                result, rhs;
                            //console.log( '- COMPUTED LHS', lhs );
                            if( Array.isArray( lhs ) ){
                                rhs = right( base, value, params );
                                //console.log( '- COMPUTED RHS', rhs );
                                if( typeof rhs === 'number' ){
                                    result = getValue( lhs, rhs, create, isRightMost ? value : {} );
                                } else {
                                    if( lhs.length === 1 ){
                                        result = getValue( lhs[ 0 ], rhs, create, isRightMost ? value : {} );
                                    } else {
                                        result = [];
                                        forEach( lhs, function( item, index ){
                                            result[ index ] = getValue( item, rhs, create, isRightMost ? value : {} );
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
                        fn = function getComputedMember( base, value, params ){
                            //console.log( 'Getting COMPUTED MEMBER' );
                            //console.log( '- COMPUTED LEFT', left.name );
                            //console.log( '- COMPUTED RIGHT', right.name );
                            var lhs = left( base, value, params ),
                                result,
                                rhs;
                            //console.log( '- COMPUTED LHS', lhs );
                            if( typeof lhs !== 'undefined' ){
                                rhs = right( base, value, params );
                                //console.log( '- COMPUTED RHS', rhs );
                                result = getValue( lhs, rhs, create, isRightMost ? value : {} );
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
                right = node.property.name || interpreter.recurse( node.property, false, create );
                isRightMost = node.property.range[ 1 ] === interpreter.eol;
                
                fn = function getNonComputedMember( base, value, params ){
                    //console.log( 'Getting NON-COMPUTED MEMBER' );
                    //console.log( '- NON-COMPUTED LEFT', left.name );
                    //console.log( '- NON-COMPUTED RIGHT', right.name || right );
                    var lhs = left( base, value, params ),
                        rhs = typeof right === 'function' ?
                            right( base, value, params ) :
                            right,
                        result;
                    //console.log( '- NON-COMPUTED LHS', lhs );
                    //console.log( '- NON-COMPUTED RHS', rhs );
                    if( typeof lhs !== 'undefined' ){
                        if( typeof lhs === 'string' ){
                            lhs = getValue( base, lhs, create, isRightMost ? value : {} );
                        }
                        if( !Array.isArray( lhs ) ){
                            result = getValue( lhs, rhs, create, isRightMost ? value : {} );
                            //console.log( '-- VALUE:VALUE', result );
                        } else {
                            if( lhs.length === 1 ){
                                result = getValue( lhs[ 0 ], rhs, create, isRightMost ? value : {} );
                            } else {
                                result = [];
                                forEach( lhs, function( item, index ){
                                    result[ index ] = getValue( item, rhs, create, isRightMost ? value : {} );
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
        
        case Syntax.PlaceholderExpression: {
            left = interpreter.recurse( node.key, true, create );
            
            return function getPlaceholderExpression( base, value, params ){
                //console.log( 'Getting PLACEHOLDER EXPRESSION' );
                var lhs = left( base, value, params ),
                    key = typeof lhs.name !== 'undefined' ?
                        // Identifier
                        lhs.name :
                        // Numeric Literal
                        lhs.value - 1,
                    result = params[ key ];
                //console.log( '- PLACEHOLDER LHS', lhs );
                //console.log( '- PLACEHOLDER EXPRESSION RESULT', result );
                return context ?
                    { value: result } :
                    result;
            };
        }
        
        case Syntax.RangeExpression: {
            left = node.left !== null ?
                interpreter.recurse( node.left, false, create ) :
                returnZero;
            right = node.right !== null ?
                interpreter.recurse( node.right, false, create ) :
                returnZero;
            return function getRangeExpression( base, value, params ){
                 //console.log( 'Getting RANGE EXPRESSION' );
                 //console.log( '- RANGE LEFT', left.name );
                 //console.log( '- RANGE RIGHT', right.name );
                 var lhs = left( base, value, params ),
                    rhs = right( base, value, params ),
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
                args = interpreter.recurseList( node.expressions, false, create );
                fn = function getSequenceExpression( base, value, params ){
                    //console.log( 'Getting SEQUENCE EXPRESSION' );
                    var result = [];
                    forEach( args, function( arg, index ){
                        result[ index ] = arg( base );
                    } );
                    //console.log( '- SEQUENCE RESULT', result );
                    return context ?
                        { value: result } :
                        result;
                };
            } else {
                args = interpreter.recurse( node.expressions, false, create );
                fn = function getSequenceExpression( base, value, params ){
                    //console.log( 'Getting SEQUENCE EXPRESSION' );
                    var result = args( base, value, params );
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

Interpreter.prototype.recurseList = function( nodes, context, create ){
    var interpreter = this,
        result = [];
        
    forEach( nodes, function( expression, index ){
        result[ index ] = interpreter.recurse( expression, context, create );
    } );
    
    return result;
};

Interpreter.prototype.throwError = function( message ){
    throw new Error( message );
};

export { Interpreter as default };