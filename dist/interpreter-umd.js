(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Interpreter = factory());
}(this, (function () { 'use strict';

function forEach( arrayLike, callback ){
    let index = 0,
        length = arrayLike.length,
        item;
    
    for( ; index < length; index++ ){
        item = arrayLike[ index ];
        callback( item, index );
    }
}

/**
 * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
 * @class Null
 * @extends external:null
 */
function Null(){}
Null.prototype = Object.create( null );
Null.prototype.constructor =  Null;

var noop = function(){};

function getValue( target, key, create ){
    if( create && !( key in target ) ){
        target[ key ] = {};
    }
    return target[ key ];
}

function intepretList( interpreter, list, context, create ){
    var result = [];
    forEach( list, function( expression ){
        result.push( interpreter.recurse( expression, context, create ) );
    } );
    return result;
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
     * @member {Builder}
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
    var ast = this.builder.build( expression ),
        body = ast.body,
        interpreter = this,
        fn;
    
    if( typeof create !== 'boolean' ){
        create = false;
    }
    
    /**
     * @member {external:string}
     */
    interpreter.expression = expression;
    
    //console.log( '-------------------------------------------------' );
    //console.log( 'Interpreting ', expression );
    //console.log( '-------------------------------------------------' );
    
    switch( body.length ){
        case 0:
            fn = noop;
            break;
        case 1:
            fn = interpreter.recurse( body[ 0 ].expression, false, create );
            break;
        default:
            var expressions = intepretList( interpreter, body, false, create );
            fn = function( base, value ){
                var lastValue;
                
                forEach( expressions, function( expression ){
                    lastValue = expression( base, value );
                } );
                
                return lastValue;
            };
            break;
    }
    
    return fn;
};

Interpreter.prototype.recurse = function( node, context, create ){
    var interpreter = this,
        
        args, fn, left, lhs, name, rhs, right, value;
    
    switch( node.type ){
        case 'ArrayExpression': {
            args = intepretList( interpreter, node.elements, false );
            value = [];
            
            return function getArrayExpression( base, setValue ){
                //console.log( 'Getting ARRAY EXPRESSION' );
                forEach( args, function( arg, index ){
                    name = arg( base, setValue );
                    value[ index ] = getValue( base, name, create );
                } );
                
                if( value.length === 1 ){
                    value = value[ 0 ];
                }
                //console.log( '- ARRAY EXPRESSION RESULT', value );
                return context ?
                    { value: value } :
                    value;
            };
        }
        case 'CallExpression': {
            args = intepretList( interpreter, node.arguments, false );
            right = interpreter.recurse( node.callee, true, create );
            
            return function getCallExpression( base, setValue ){
                //console.log( 'Getting CALL EXPRESSION' );
                var values = [], value;
                rhs = right( base );
                
                if( typeof rhs.value === 'function' ){
                    values = [];
                    
                    forEach( args, function( arg, index ){
                        values[ index ] = arg( base );
                    } );
                    
                    value = rhs.value.apply( rhs.context, values );
                } else if( create && typeof rhs.value === 'undefined' ){
                    throw new Error( 'cannot create call expressions' );
                } else {
                    throw new TypeError( 'call expression must be a function' );
                }
                //console.log( '- CALL RESULT', value );
                return context ?
                    { value: value }:
                    value;
            };
        }
        case 'Identifier': {
            name = node.name;
            return function getIdentifier( base, setValue ){
                //console.log( 'Getting IDENTIFIER' );
                if( typeof base !== 'undefined' ){
                    value = getValue( base, name, create );
                }
                //console.log( '- NAME', name );
                //console.log( '- IDENTIFIER RESULT', value );
                return context ?
                    { context: base, name: name, value: value } :
                    value;
            };
        }
        case 'Literal': {
            value = node.value;
            return function getLiteral( base, setValue ){
                //console.log( 'Getting LITERAL' );
                //console.log( '- LITERAL RESULT', value );
                return context ?
                    { context: undefined, name: undefined, value: value } :
                    value;
            };
        }
        case 'MemberExpression': {
            left = interpreter.recurse( node.object, false, create );
            
            // Computed
            if( node.computed ){
                right = interpreter.recurse( node.property, false, create );
                fn = function getComputedMember( base, setValue ){
                    //console.log( 'Getting COMPUTED MEMBER' );
                    //console.log( '- COMPUTED LEFT', left.name );
                    //console.log( '- COMPUTED RIGHT', right.name );
                    lhs = left( base, setValue );
                    //console.log( '- COMPUTED LHS', lhs );
                    if( typeof lhs !== 'undefined' ){
                        rhs = right( base, setValue );
                        //console.log( '- COMPUTED RHS', rhs );
                        if( Array.isArray( lhs ) ){
                            value = [];
                            
                            if( Array.isArray( rhs ) ){
                                forEach( rhs, function( item, index ){
                                    value[ index ] = getValue( lhs, item, create );
                                } );
                                //console.log( '-- LIST:LIST', value );
                            } else {
                                if( typeof rhs === 'number' ){
                                    value[ 0 ] = lhs[ rhs ];
                                } else {
                                    forEach( lhs, function( item, index ){
                                        value[ index ] = getValue( item, rhs, create );
                                    } );
                                }
                                //console.log( '-- LIST:VALUE', value );
                            }
                            
                            if( value.length === 1 ){
                                value = value[ 0 ];
                            }
                        } else if( Array.isArray( rhs ) ){
                            value = [];
                            
                            forEach( rhs, function( item, index ){
                                value[ index ] = getValue( lhs, item, create );
                            } );
                            //console.log( '-- VALUE:LIST', value );
                            if( value.length === 1 ){
                                value = value[ 0 ];
                            }
                        } else {
                            value = getValue( lhs, rhs, create );
                            //console.log( '-- VALUE:VALUE', value );
                        }
                    }
                    //console.log( '- COMPUTED RESULT', value );
                    return context ?
                        { context: lhs, name: rhs, value: value } :
                        value;
                };
            
            // Non-computed
            } else {
                right = node.property.name;
                fn = function getNonComputedMember( base, setValue ){
                    //console.log( 'Getting NON-COMPUTED MEMBER' );
                    //console.log( '- NON-COMPUTED LEFT', left.name );
                    //console.log( '- NON-COMPUTED RIGHT', right );
                    lhs = left( base, setValue );
                    //console.log( '- NON-COMPUTED LHS', lhs );
                    if( typeof lhs !== 'undefined' ){
                        if( Array.isArray( lhs ) ){
                            value = [];
                            forEach( lhs, function( item, index ){
                                value[ index ] = getValue( item, right, create );
                            } );
                            //console.log( '-- LIST:VALUE', value );
                        } else {
                            value = getValue( lhs, right, create );
                            //console.log( '-- VALUE:VALUE', value );
                        }
                    }
                    //console.log( '- NON-COMPUTED RESULT', value );
                    return context ?
                        { context: lhs, name: right, value: value } :
                        value;
                };
            }
            
            return fn;
        }
        case 'SequenceExpression': {
            args = intepretList( interpreter, node.expressions, false );
            
            return function getSequenceExpression( base, setValue ){
                //console.log( 'Getting SEQUENCE EXPRESSION' );
                value = [];
                forEach( args, function( arg, index ){
                    value[ index ] = arg( base );
                } );
                //console.log( '- SEQUENCE RESULT', value );
                return context ?
                    { value: value } :
                    value;
            };
        }
        default:
            this.throwError( 'Unknown node type ' + node.type );
    }
};

Interpreter.prototype.throwError = function( message ){
    throw new Error( message );
};

return Interpreter;

})));

//# sourceMappingURL=interpreter-umd.js.map