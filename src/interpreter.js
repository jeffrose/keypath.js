'use strict';

import forEach from './for-each';
import hasOwnProperty from './has-own-property';
import Null from './null';
import Syntax from './syntax';

var noop = function(){},

    cache = new Null();

/**
 * @function Interpreter~getValue
 * @param {external:Object} scope
 * @param {external:string} name
 * @returns {*} The value of the `name` in `scope`
 */
function getValue( scope, name ){
    //console.log( '-- GET VALUE' );
    //console.log( '--- SCOPE', scope );
    //console.log( '--- NAME', name );
    var index = scope.length,
        result;
    
    switch( Array.isArray( scope ) && typeof name === 'string' && index ){
        case false:
            //console.log( '--- FALSE', name );
            return scope[ name ];
        
        case 0:
            //console.log( '--- 0', name );
            return;
        
        case 1:
            //console.log( '--- 1', name );
            return scope[ 0 ][ name ];
        
        default:
            //console.log( '--- DEFAULT', name );
            result = new Array( index );
            while( index-- ){
                result[ index ] = scope[ index ][ name ];
            }
            return result;
    }
}

/**
 * @function Interpreter~setValue
 * @param {external:Object} scope
 * @param {external:string} name
 * @param {*} value
 * @returns {*} The value of the `name` in `scope`
 */
function setValue( scope, name, value ){
    //if( !( hasOwnProperty( scope, name ) ) ){
    //    scope[ name ] = value;
    //}
    //return scope[ name ];
    var index = scope.length,
        result;
    
    switch( Array.isArray( scope ) && typeof name === 'string' && index ){
        case false:
            if( !( hasOwnProperty( scope, name ) ) ){
                scope[ name ] = value;
            }
            return scope[ name ];
        
        case 0:
            return;
        
        case 1:
            if( !( hasOwnProperty( scope[ 0 ], name ) ) ){
                scope[ 0 ][ name ] = value;
            }
            return scope[ 0 ][ name ];
        
        default:
            result = new Array( index );
            while( index-- ){
                if( !( hasOwnProperty( scope[ index ], name ) ) ){
                    scope[ index ][ name ] = value;
                }
                result[ index ] = scope[ index ][ name ];
            }
            return result;
    }
}

/**
 * @function Interpreter~returnZero
 * @returns {external:number} zero
 */
function returnZero(){
    return 0;
}

/**
 * @class InterpreterError
 * @extends external:SyntaxError
 * @param {external:string} message
 */
function InterpreterError( message ){
    SyntaxError.call( this, message );
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

Interpreter.prototype.arrayExpression = function( elements, context, assign, isRightMost ){
    var interpreter = this,
        isFunction = false,
        defaultValue, element, fn, index, item, list, name, names, result;
    
    // List of elements
    if( Array.isArray( elements ) ){
        if( elements.length === 1 ){
            element = elements[ 0 ];
            
            switch( element.type ){
                case Syntax.Literal:
                    name = item = element.value;
                    break;
                default:
                    item = interpreter.recurse( element, context, assign );
                    isFunction = true;
                    break;
            }
            
            fn = function getArrayExpression( scope, value, lookup ){
                //console.log( 'Getting ARRAY EXPRESSION' );
                defaultValue = isRightMost ? value : {};
                if( isFunction ){
                    name = item( scope, value, lookup );
                }
                result = assign( scope, name, defaultValue );
                //console.log( '- ARRAY EXPRESSION RESULT', result );
                return context ?
                    { value: result } :
                    result;
            };
        } else {
            index = elements.length;
            list = new Array( index );
            result = new Array( index );
            while( index-- ){
                element = elements[ index ];
                switch( element.type ){
                    case Syntax.Literal:
                        list[ index ] = element.value;
                        break;
                    default:
                        list[ index ] = interpreter.recurse( element, false, assign );
                        isFunction = true;
                        break;
                }
            }
            fn = function getArrayExpressionWithElementList( scope, value, lookup ){
                //console.log( 'Getting ARRAY EXPRESSION' );
                defaultValue = isRightMost ? value : {};
                index = list.length;
                while( index-- ){
                    name = isFunction ?
                        list[ index ]( scope, value, lookup ) :
                        list[ index ];
                    result[ index ] = assign( scope, name, defaultValue );
                }
                //console.log( '- ARRAY EXPRESSION RESULT', result );
                return context ?
                    { value: result } :
                    result;
            };
        }
    // Range of elements
    } else {
        list = interpreter.recurse( elements, false, assign );
        
        fn = function getArrayExpressionWithElementRange( scope, value, lookup ){
            //console.log( 'Getting ARRAY EXPRESSION' );
            result = [];
            defaultValue = isRightMost ? value : {};
            names = list( scope, value, lookup );
            index = names.length;
            if( index === 1 ){
                result[ 0 ] = assign( scope, names[ 0 ], defaultValue );
            } else {
                while( index-- ){
                    result[ index ] = assign( scope, names[ index ], defaultValue );
                }
            }
            //console.log( '- ARRAY EXPRESSION RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    }
    
    return fn;
};

Interpreter.prototype.callExpression = function( callee, args, context, assign ){
    var interpreter = this,
        isSetting = assign === setValue,
        list = interpreter.recurseList( args, false, assign ),
        fn = interpreter.recurse( callee, true, assign );
    
    return function getCallExpression( scope, value, lookup ){
        //console.log( 'Getting CALL EXPRESSION' );
        //console.log( '- CALL FN', fn.name );
        var values = [],
            rhs = fn( scope, value, lookup ),
            result;
        //console.log( '- CALL RHS', rhs );
        if( typeof rhs.value === 'function' ){
            switch( list.length ){
                case 0:
                    break;
                case 1:
                    values[ 0 ] = list[ 0 ]( scope, value, lookup );
                    break;
                default:
                    forEach( list, function( arg, index ){
                        values[ index ] = arg( scope, value, lookup );
                    } );
                    break;
            }
            result = rhs.value.apply( rhs.context, values );
        } else if( isSetting && typeof rhs.value === 'undefined' ){
            this.throwError( 'cannot create call expressions' );
        } else {
            this.throwError( 'call expression must be a function', TypeError );
        }
        //console.log( '- CALL RESULT', result );
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

Interpreter.prototype.computedMemberExpression = function( object, property, context, assign ){
    var interpreter = this,
        isFunction = false,
        isRightMost = property.range[ 1 ] + 1 === interpreter.eol,
        left = interpreter.recurse( object, false, assign ),
        defaultValue, fn, index, lhs, result, rhs, right;
    
    switch( object.type ){
        case Syntax.Identifier:
            left = interpreter.identifier( object.name, false, assign );
            break;
        default:
            left = interpreter.recurse( object, false, assign );
            break;
    }
    
    switch( property.type ){
        case Syntax.Literal:
            rhs = right = property.value;
            break;
        default:
            right = interpreter.recurse( property, false, assign );
            isFunction = true;
            break;
    }
    
    // Sequence property
    if( property.type === Syntax.SequenceExpression ){
        fn = function getComputedMemberExpressionWithSequenceProperty( scope, value, lookup ){
            //console.log( 'Getting COMPUTED MEMBER' );
            //console.log( `- ${ fn.name } LEFT `, left.name );
            //console.log( `- ${ fn.name } RIGHT`, right.name || right );
            lhs = left( scope, value, lookup );
            defaultValue = isRightMost ? value : {};
            result = [];
            //console.log( '- COMPUTED LHS', lhs );
            if( typeof lhs !== 'undefined' ){
                if( isFunction ){
                    rhs = right( scope, value, lookup );
                }
                //console.log( '- COMPUTED RHS', rhs );
                if( Array.isArray( rhs ) ){
                    forEach( rhs, function( item, index ){
                        result[ index ] = assign( lhs, item, defaultValue );
                    } );
                    //console.log( '-- LIST|VALUE:LIST', result );
                }
            }
            //console.log( '- COMPUTED RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    // Property
    } else {
        // Array object
        if( object.type === Syntax.ArrayExpression ){
            fn = function getComputedMemberExpressionWithArrayObject( scope, value, lookup ){
                //console.log( 'Getting COMPUTED MEMBER' );
                //console.log( `- ${ fn.name } LEFT `, left.name );
                //console.log( `- ${ fn.name } RIGHT`, right.name || right );
                lhs = left( scope, value, lookup );
                defaultValue = isRightMost ? value : {};
                //console.log( `- ${ fn.name } LHS`, lhs );
                if( typeof lhs !== 'undefined' ){
                    if( isFunction ){
                        rhs = right( scope, value, lookup );
                    }
                    //console.log( `- ${ fn.name } RHS`, rhs );
                    if( Array.isArray( lhs ) ){
                        index = lhs.length;
                        result = new Array( index );
                        while( index-- ){
                            result[ index ] = assign( lhs[ index ], rhs, defaultValue );
                        }
                    } else {
                        result = assign( lhs, rhs, defaultValue );
                    }
                    //console.log( '-- LIST:VALUE', result );
                }
                //console.log( `- ${ fn.name } RESULT`, result );
                return context ?
                    { context: lhs, name: rhs, value: result } :
                    result;
            };
        // Object
        } else {
            fn = function getComputedMemberExpression( scope, value, lookup ){
                //console.log( 'Getting COMPUTED MEMBER' );
                //console.log( `- ${ fn.name } LEFT `, left.name );
                //console.log( `- ${ fn.name } RIGHT`, right.name || right );
                lhs = left( scope, value, lookup );
                defaultValue = isRightMost ? value : {};
                //console.log( `- ${ fn.name } LHS`, lhs );
                if( typeof lhs !== 'undefined' ){
                    if( isFunction ){
                        rhs = right( scope, value, lookup );
                    }
                    //console.log( `- ${ fn.name } RHS`, rhs );
                    if( Array.isArray( lhs ) ){
                        index = lhs.length;
                        result = new Array( index );
                        while( index-- ){
                            result[ index ] = assign( lhs[ index ], rhs, defaultValue );
                        }
                    } else {
                        result = assign( lhs, rhs, defaultValue );
                    }
                    //result = assign( lhs, rhs, defaultValue );
                    //console.log( '-- VALUE:VALUE', result );
                }
                //console.log( `- ${ fn.name } RESULT`, result );
                return context ?
                    { context: lhs, name: rhs, value: result } :
                    result;
            };
        }
    }
    
    return fn;
};

Interpreter.prototype.evalExpression = function( tokens, context, assign ){
    var interpreter = this,
        text = tokens.join( '' ),
        program = hasOwnProperty( cache, text ) ?
            cache[ text ] :
            cache[ text ] = this.builder.build( tokens ),
        expression = interpreter.recurse( program.body[ 0 ].expression, false, assign ),
        result;
    
    return function getEvalExpression( scope, value, lookup ){
        //console.log( 'Getting EVAL' );
        //console.log( '- EVAL LEFT', expression.name );
        result = expression( scope, value, lookup );
        //console.log( '- EVAL RESULT', result );
        return context ?
            { context: scope, name: undefined, value: result } :
            result;
    };
};

Interpreter.prototype.identifier = function( name, context, assign, isRightMost ){
    var defaultValue, result;
    
    return function getIdentifier( scope, value, lookup ){
        //console.log( 'Getting IDENTIFIER' );
        defaultValue = isRightMost ? value : {};
        if( typeof scope !== 'undefined' ){
            result = assign( scope, name, defaultValue );
        }
        //console.log( '- NAME', name );
        //console.log( '- IDENTIFIER RESULT', result );
        return context ?
            { context: scope, name: name, value: result } :
            result;
    };
};

Interpreter.prototype.literal = function( value, context ){
    return function getLiteral(){
        //console.log( 'Getting LITERAL' );
        //console.log( '- LITERAL RESULT', value );
        return context ?
            { context: undefined, name: undefined, value: value } :
            value;
    };
};

Interpreter.prototype.lookupExpression = function( key, context, assign ){
    var interpreter = this,
        isFunction = false,
        lhs = {},
        left, result;
    
    switch( key.type ){
        case Syntax.Identifier:
            left = interpreter.identifier( key.name, true, assign );
            isFunction = true;
            break;
        case Syntax.Literal:
            lhs.value = left = key.value;
            break;
        default:
            left = interpreter.recurse( key, true, assign );
            isFunction = true;
            break;
    }
            
    return function getLookupExpression( scope, value, lookup ){
        //console.log( 'Getting LOOKUP EXPRESSION' );
        //console.log( '- LOOKUP LEFT', left.name || left );
        if( isFunction ){
            lhs = left( lookup, value, scope );
            result = lhs.value;
        } else {
            result = lookup[ lhs.value ];
        }
        //console.log( '- LOOKUP LHS', lhs );
        //console.log( '- LOOKUP EXPRESSION RESULT', result );
        return context ?
            { value: result } :
            result;
    };
};

Interpreter.prototype.rangeExpression = function( nl, nr, context, assign ){
    var interpreter = this,
        left = nl !== null ?
            interpreter.recurse( nl, false, assign ) :
            returnZero,
        right = nr !== null ?
            interpreter.recurse( nr, false, assign ) :
            returnZero,
        index, lhs, middle, result, rhs;
        
    return function getRangeExpression( scope, value, lookup ){
        //console.log( 'Getting RANGE EXPRESSION' );
        //console.log( '- RANGE LEFT', left.name );
        //console.log( '- RANGE RIGHT', right.name );
        lhs = left( scope, value, lookup );
        rhs = right( scope, value, lookup );
        result = [];
        index = 1;
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
};

/**
 * @function
 */
Interpreter.prototype.recurse = function( node, context, assign ){
    var isRightMost = node.range[ 1 ] === this.eol;
    //console.log( 'Recursing on', node.type );
    switch( node.type ){
        
        case Syntax.ArrayExpression: {
            return this.arrayExpression( node.elements, context, assign, isRightMost );
        }
        
        case Syntax.CallExpression: {
            return this.callExpression( node.callee, node.arguments, context, assign );
        }
        
        case Syntax.EvalExpression: {
            return this.evalExpression( node.body, context, assign );
        }
        
        case Syntax.Identifier: {
            return this.identifier( node.name, context, assign, isRightMost );
        }
        
        case Syntax.Literal: {
            return this.literal( node.value, context );
        }
        
        case Syntax.MemberExpression: {
            return node.computed ?
                this.computedMemberExpression( node.object, node.property, context, assign ) :
                this.staticMemberExpression( node.object, node.property, context, assign );
        }
        
        case Syntax.LookupExpression: {
            return this.lookupExpression( node.key, context, assign );
        }
        
        case Syntax.RangeExpression: {
            return this.rangeExpression( node.left, node.right, context, assign );
        }
        
        case Syntax.SequenceExpression: {
            return this.sequenceExpression( node.expressions, context, assign );
        }
        
        default:
            this.throwError( 'Unknown node type ' + node.type );
    }
};

/**
 * @function
 */
Interpreter.prototype.recurseFast = function( node, context, assign ){
    var isRightMost = node.range[ 1 ] === this.eol;
    //console.log( 'Recursing on', node.type );
    switch( node.type ){
        
        case Syntax.Identifier: {
            return this.identifier( node.name, context, assign, isRightMost );
        }
        
        case Syntax.MemberExpression: {
            return this.staticMemberExpression( node.object, node.property, context, assign );
        }
        
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

Interpreter.prototype.sequenceExpression = function( expressions, context, assign ){
    var interpreter = this,
        isFunction = false,
        expression, fn, index, list, result;
    // Expression List
    if( Array.isArray( expressions ) ){
        index = expressions.length;
        list = new Array( index );
        result = new Array( index );
        while( index-- ){
            expression = expressions[ index ];
            if( expression.type === Syntax.Literal ){
                result[ index ] = list[ index ] = expression.value;
            } else {
                list[ index ] = interpreter.recurse( expression, false, assign );
                isFunction = true;
            }
        }
        
        fn = function getSequenceExpressionWithExpressionList( scope, value, lookup ){
            //console.log( 'Getting SEQUENCE EXPRESSION' );
            if( isFunction ){
                index = list.length;
                while( index-- ){
                    result[ index ] = list[ index ]( scope, value, lookup );
                }
            }
            //console.log( '- SEQUENCE RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    // Expression Range
    } else {
        list = interpreter.recurse( expressions, false, assign );
        
        fn = function getSequenceExpressionWithExpressionRange( scope, value, lookup ){
            //console.log( 'Getting SEQUENCE EXPRESSION' );
            result = list( scope, value, lookup );
            //console.log( '- SEQUENCE RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    }
    
    return fn;
};

Interpreter.prototype.staticMemberExpression = function( object, property, context, assign ){
    var interpreter = this,
        isFunction = false,
        isRightMost = property.range[ 1 ] === interpreter.eol,
        defaultValue, left, lhs, rhs, result, right;
    
    if( object.type === Syntax.Identifier ){
        left = interpreter.identifier( object.name, false, assign );
    } else if( property === Syntax.LookupExpression ){
        left = interpreter.lookupExpression( object, false, assign );
    } else {
        left = interpreter.recurse( object, false, assign );
    }
    
    if( property.type === Syntax.Identifier ){
        rhs = right = property.name;
    } else if( property === Syntax.LookupExpression ){
        right = interpreter.lookupExpression( property, false, assign );
        isFunction = true;
    } else {
        right = interpreter.recurse( property, false, assign );
        isFunction = true;
    }
    
    return function getStaticMemberExpression( scope, value, lookup ){
        //console.log( 'Getting NON-COMPUTED MEMBER' );
        //console.log( '- NON-COMPUTED LEFT', left.name );
        //console.log( '- NON-COMPUTED RIGHT', right.name || right );
        lhs = left( scope, value, lookup );
        if( isFunction ){
            rhs = right( scope, value, lookup );
        }
        defaultValue = isRightMost ? value : {};
        //console.log( '- NON-COMPUTED LHS', lhs );
        //console.log( '- NON-COMPUTED RHS', rhs );
        if( typeof lhs !== 'undefined' ){
            // ?????????
            if( typeof lhs === 'string' ){
                lhs = assign( scope, lhs, defaultValue );
            }
            result = assign( lhs, rhs, defaultValue );
        }
        //console.log( '- NON-COMPUTED RESULT', result );
        return context ?
            { context: lhs, name: rhs, value: result } :
            result;
    };
};

Interpreter.prototype.throwError = function( message, ErrorClass ){
    typeof ErrorClass === 'undefined' && ( ErrorClass = InterpreterError );
    throw new ErrorClass( message );
};

export { Interpreter as default };