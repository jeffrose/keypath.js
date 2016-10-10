'use strict';

import forEach from './forEach';
import hasOwnProperty from './hasOwnProperty';
import Null from './null';
import Syntax from './builder/syntax';

var noop = function(){};

function getValue( base, name, create, defaultValue ){
    if( create && !( hasOwnProperty( base, name ) ) ){
        base[ name ] = defaultValue;
    }
    return base[ name ];
}

/**
 * @function Interpreter~intepretList
 * @param {Interpreter} interpreter
 * @param {Array-Like} list
 * @param {external:boolean} context
 * @param {external:boolean} create
 * @returns {Array<external:Function>} The interpreted list
 */
function intepretList( interpreter, list, context, create ){
    var result = [];
    forEach( list, function( expression, index ){
        result[ index ] = interpreter.recurse( expression, context, create );
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
    var program = this.builder.build( expression ),
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
        isRightMost = false,
        
        args, fn, left, right;
    
    //console.log( 'Recursing on', node.type );
    
    switch( node.type ){
        
        case Syntax.ArrayExpression: {
            args = intepretList( interpreter, node.elements, false );
            isRightMost = node.range[ 1 ] === interpreter.eol;
            
            return function getArrayExpression( base, value ){
                //console.log( 'Getting ARRAY EXPRESSION' );
                var result = [], name;
                forEach( args, function( arg, index ){
                    name = arg( base, value );
                    result[ index ] = getValue( base, name, create, isRightMost ? value : {} );
                } );
                //console.log( '- ARRAY EXPRESSION RESULT', result );
                return context ?
                    { value: result } :
                    result;
            };
        }
        
        case Syntax.CallExpression: {
            args = intepretList( interpreter, node.arguments, false );
            right = interpreter.recurse( node.callee, true, create );
            
            return function getCallExpression( base, value ){
                //console.log( 'Getting CALL EXPRESSION' );
                //console.log( '- RIGHT', right.name );
                var values = [],
                    rhs = right( base, value ),
                    result;
                //console.log( '- RHS', rhs );
                if( typeof rhs.value === 'function' ){
                    values = [];
                    
                    forEach( args, function( arg, index ){
                        values[ index ] = arg( base );
                    } );
                    
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
        
        case Syntax.ExpressionStatement: {
            left = interpreter.recurse( node.expression, context, create );
            
            return function getExpressionStatement( base, value ){
                //console.log( 'Getting EXPRESSION STATEMENT' );
                //console.log( '- EXPRESSION STATEMENT LEFT', left.name );
                var result = left( base, value );
                //console.log( '- EXPRESSION STATEMENT RESULT', result );
                return result;
            };
        }
        
        case Syntax.Identifier: {
            isRightMost = node.range[ 1 ] === interpreter.eol;
            
            return function getIdentifier( base, value ){
                //console.log( 'Getting IDENTIFIER' );
                var name = node.name,
                    result;
                if( typeof base !== 'undefined' ){
                    if( create && !( hasOwnProperty( base, name ) ) ){
                        base[ name ] = isRightMost ?
                            value :
                            {};
                    }
                    result = base[ name ];
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
                    fn = function getComputedMember( base, value ){
                        //console.log( 'Getting COMPUTED MEMBER' );
                        //console.log( '- COMPUTED LEFT', left.name );
                        //console.log( '- COMPUTED RIGHT', right.name );
                        var lhs = left( base, value ),
                            result = [],
                            rhs;
                        //console.log( '- COMPUTED LHS', lhs );
                        if( typeof lhs !== 'undefined' ){
                            rhs = right( base, value );
                            //console.log( '- COMPUTED RHS', rhs );
                            if( Array.isArray( rhs ) ){
                                forEach( rhs, function( item, index ){
                                    result[ index ] = getValue( lhs, item, create, isRightMost ? value : {} );
                                } );
                                //console.log( '-- LIST|VALUE:LIST', result );
                                if( result.length === 1 ){
                                    result = result[ 0 ];
                                }
                            }
                        }
                        //console.log( '- COMPUTED RESULT', result );
                        return context ?
                            { context: lhs, name: rhs, value: result } :
                            result;
                    };
                } else {
                    if( node.object.type === Syntax.ArrayExpression ){
                        fn = function getComputedMember( base, value ){
                            //console.log( 'Getting COMPUTED MEMBER' );
                            //console.log( '- COMPUTED LEFT', left.name );
                            //console.log( '- COMPUTED RIGHT', right.name );
                            var lhs = left( base, value ),
                                result = [],
                                rhs;
                            //console.log( '- COMPUTED LHS', lhs );
                            if( Array.isArray( lhs ) ){
                                rhs = right( base, value );
                                //console.log( '- COMPUTED RHS', rhs );
                                if( typeof rhs === 'number' ){
                                    result[ 0 ] = getValue( lhs, rhs, create, isRightMost ? value : {} );
                                } else {
                                    if( lhs.length === 1 ){
                                        result[ 0 ] = getValue( lhs[ 0 ], rhs, create, isRightMost ? value : {} );
                                    } else {
                                        forEach( lhs, function( item, index ){
                                            result[ index ] = getValue( item, rhs, create, isRightMost ? value : {} );
                                        } );
                                    }
                                }
                                //console.log( '-- LIST:VALUE', result );
                                if( result.length === 1 ){
                                    result = result[ 0 ];
                                }
                            }
                            //console.log( '- COMPUTED RESULT', result );
                            return context ?
                                { context: lhs, name: rhs, value: result } :
                                result;
                        };
                    } else {
                        fn = function getComputedMember( base, value ){
                            //console.log( 'Getting COMPUTED MEMBER' );
                            //console.log( '- COMPUTED LEFT', left.name );
                            //console.log( '- COMPUTED RIGHT', right.name );
                            var lhs = left( base, value ),
                                result,
                                rhs;
                            //console.log( '- COMPUTED LHS', lhs );
                            if( typeof lhs !== 'undefined' ){
                                rhs = right( base, value );
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
                right = node.property.name;
                isRightMost = node.property.range[ 1 ] === interpreter.eol;
                fn = function getNonComputedMember( base, value ){
                    //console.log( 'Getting NON-COMPUTED MEMBER' );
                    //console.log( '- NON-COMPUTED LEFT', left.name );
                    //console.log( '- NON-COMPUTED RIGHT', right );
                    var lhs = left( base, value ),
                        result;
                    //console.log( '- NON-COMPUTED LHS', lhs );
                    if( typeof lhs !== 'undefined' ){
                        if( !Array.isArray( lhs ) ){
                            result = getValue( lhs, right, create, isRightMost ? value : {} );
                            //console.log( '-- VALUE:VALUE', result );
                        } else {
                            result = [];
                            if( lhs.length === 1 ){
                                result[ 0 ] = getValue( lhs[ 0 ], right, create, isRightMost ? value : {} );
                            } else {
                                forEach( lhs, function( item, index ){
                                    result[ index ] = getValue( item, right, create, isRightMost ? value : {} );
                                } );
                            }
                            //console.log( '-- LIST:VALUE', result );
                        }
                    }
                    //console.log( '- NON-COMPUTED RESULT', result );
                    return context ?
                        { context: lhs, name: right, value: result } :
                        result;
                };
            }
            
            return fn;
        }
        
        case Syntax.SequenceExpression: {
            args = intepretList( interpreter, node.expressions, false );
            
            return function getSequenceExpression( base, value ){
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
        }
        
        default:
            this.throwError( 'Unknown node type ' + node.type );
    }
};

Interpreter.prototype.throwError = function( message ){
    throw new Error( message );
};

export { Interpreter as default };