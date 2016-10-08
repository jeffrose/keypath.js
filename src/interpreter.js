'use strict';

import forEach from './forEach';
import Null from './null';

var noop = function(){};

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
    interpreter.expression = expression;
    
    //console.log( '-------------------------------------------------' );
    //console.log( 'Interpreting ', expression );
    //console.log( '-------------------------------------------------' );
    
    //console.log( 'Program', program.loc );
    interpreter.eol = program.loc.end.column;
    
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
    
    //console.log( 'NODE', node.type, node.loc.end.column );
        
    switch( node.type ){
        case 'ArrayExpression': {
            args = intepretList( interpreter, node.elements, false );
            
            return function getArrayExpression( base, value ){
                //console.log( 'Getting ARRAY EXPRESSION' );
                var result = [], name;
                forEach( args, function( arg, index ){
                    name = arg( base, value );
                    if( create && !( name in base ) ){
                        base[ name ] = node.order === 1 ?
                            value :
                            {};
                    }
                    result[ index ] = base[ name ];
                } );
                
                if( result.length === 1 ){
                    result = result[ 0 ];
                }
                //console.log( '- ARRAY EXPRESSION RESULT', result );
                return context ?
                    { value: result } :
                    result;
            };
        }
        case 'CallExpression': {
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
        
        case 'ExpressionStatement': {
            left = interpreter.recurse( node.expression, context, create );
            return function getExpressionStatement( base, value ){
                //console.log( 'Getting EXPRESSION STATEMENT' );
                //console.log( '- EXPRESSION STATEMENT LEFT', left.name );
                var result = left( base, value );
                //console.log( '- EXPRESSION STATEMENT RESULT', result );
                return result;
            };
        }
        
        case 'Identifier': {
            return function getIdentifier( base, value ){
                //console.log( 'Getting IDENTIFIER' );
                var name = node.name,
                    result;
                if( typeof base !== 'undefined' ){
                    if( create && !( name in base ) ){
                        base[ name ] = node.order === 1 ?
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
        case 'Literal': {
            return function getLiteral( base ){
                var result = node.value;
                //console.log( 'Getting LITERAL' );
                //console.log( '- LITERAL RESULT', result );
                return context ?
                    { context: undefined, name: undefined, value: result } :
                    result;
            };
        }
        case 'MemberExpression': {
            left = interpreter.recurse( node.object, false, create );
            isRightMost = node.loc.end.column === interpreter.eol;
            // Computed
            if( node.computed ){
                right = interpreter.recurse( node.property, false, create );
                fn = function getComputedMember( base, value ){
                    //console.log( 'Getting COMPUTED MEMBER' );
                    //console.log( '- COMPUTED LEFT', left.name );
                    //console.log( '- COMPUTED RIGHT', right.name );
                    var lhs = left( base, value ),
                        result, rhs;
                    //console.log( '- COMPUTED LHS', lhs );
                    if( typeof lhs !== 'undefined' ){
                        rhs = right( base, value );
                        //console.log( '- COMPUTED RHS', rhs );
                        if( Array.isArray( lhs ) ){
                            result = [];
                            
                            if( Array.isArray( rhs ) ){
                                forEach( rhs, function( item, index ){
                                    if( create && !( item in lhs ) ){
                                        lhs[ item ] = isRightMost ?
                                            value :
                                            {};
                                    }
                                    result[ index ] = lhs[ item ];
                                } );
                                //console.log( '-- LIST:LIST', result );
                            } else {
                                if( typeof rhs === 'number' ){
                                    if( create && !( rhs in lhs ) ){
                                        lhs[ rhs ] = isRightMost ?
                                            value :
                                            {};
                                    }
                                    result[ 0 ] = lhs[ rhs ];
                                } else {
                                    forEach( lhs, function( item, index ){
                                        if( create && !( rhs in item ) ){
                                            item[ rhs ] = isRightMost ?
                                                value :
                                                {};
                                        }
                                        result[ index ] = item[ rhs ];
                                    } );
                                }
                                //console.log( '-- LIST:VALUE', result );
                            }
                            
                            if( result.length === 1 ){
                                result = result[ 0 ];
                            }
                        } else if( Array.isArray( rhs ) ){
                            result = [];
                            
                            forEach( rhs, function( item, index ){
                                if( create && !( item in lhs ) ){
                                    lhs[ item ] = isRightMost ?
                                        value :
                                        {};
                                }
                                result[ index ] = lhs[ item ];
                            } );
                            //console.log( '-- VALUE:LIST', result );
                            if( result.length === 1 ){
                                result = result[ 0 ];
                            }
                        } else {
                            if( create && !( rhs in lhs ) ){
                                lhs[ rhs ] = isRightMost ?
                                    value :
                                    {};
                            }
                            result = lhs[ rhs ];
                            //console.log( '-- VALUE:VALUE', result );
                        }
                    }
                    //console.log( '- COMPUTED RESULT', result );
                    return context ?
                        { context: lhs, name: rhs, value: result } :
                        result;
                };
            
            // Non-computed
            } else {
                right = node.property.name;
                isRightMost = node.property.loc.end.column === interpreter.eol;
                fn = function getNonComputedMember( base, value ){
                    //console.log( 'Getting NON-COMPUTED MEMBER' );
                    //console.log( '- NON-COMPUTED LEFT', left.name );
                    //console.log( '- NON-COMPUTED RIGHT', right );
                    var lhs = left( base, value ),
                        result;
                    //console.log( '- NON-COMPUTED LHS', lhs );
                    if( typeof lhs !== 'undefined' ){
                        if( Array.isArray( lhs ) ){
                            result = [];
                            forEach( lhs, function( item, index ){
                                if( create && !( right in item ) ){
                                    item[ right ] = isRightMost ?
                                        value :
                                        {};
                                }
                                result[ index ] = item[ right ];
                            } );
                            //console.log( '-- LIST:VALUE', result );
                        } else {
                            if( create && !( right in lhs ) ){
                                lhs[ right ] = isRightMost ?
                                    value :
                                    {};
                            }
                            result = lhs[ right ];
                            //console.log( '-- VALUE:VALUE', result );
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
        case 'SequenceExpression': {
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