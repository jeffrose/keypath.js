import hasOwnProperty from './has-own-property';
import Null from './null';
import map from './map';
import * as Syntax from './syntax';
import * as KeypathSyntax from './keypath-syntax';

var noop = function(){},

    interpreterPrototype;

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
export default function Interpreter( builder ){
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
        isSafe = object.type === KeypathSyntax.ExistentialExpression,
        left = interpreter.recurse( object, false, assign ),
        right = interpreter.recurse( property, false, assign );

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
            if( !interpreter.isSplit ){
                result = assign( lhs, rhs, value );
            } else if( interpreter.isLeftSplit && !interpreter.isRightSplit ){
                result = map( lhs, function( object ){
                    return assign( object, rhs, value );
                } );
            } else if( !interpreter.isLeftSplit && interpreter.isRightSplit ){
                result = map( rhs, function( key ){
                    return assign( lhs, key, value );
                } );
            } else {
                result = map( lhs, function( object ){
                    return map( rhs, function( key ){
                        return assign( object, key, value );
                    } );
                } );
            }
        }
        //console.log( '- executeComputedMemberExpression RESULT', result );
        return context ?
            { context: lhs, name: rhs, value: result } :
            result;
    };
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
        case Syntax.Literal:
            return interpreter.literal( element.value, context );
        case KeypathSyntax.LookupExpression:
            return interpreter.lookupExpression( element.key, false, context, assign );
        case KeypathSyntax.RootExpression:
            return interpreter.rootExpression( element.key, context, assign );
        case KeypathSyntax.BlockExpression:
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
        case Syntax.Identifier:
            left = interpreter.identifier( key.name, true, assign );
            break;
        case Syntax.Literal:
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
        case Syntax.ArrayExpression:
            expression = interpreter.arrayExpression( node.elements, context, assign );
            interpreter.isSplit = interpreter.isLeftSplit = node.elements.length > 1;
            break;
        case Syntax.CallExpression:
            expression = interpreter.callExpression( node.callee, node.arguments, context, assign );
            break;
        case KeypathSyntax.BlockExpression:
            expression = interpreter.blockExpression( node.body, context, assign );
            break;
        case KeypathSyntax.ExistentialExpression:
            expression = interpreter.existentialExpression( node.expression, context, assign );
            break;
        case Syntax.Identifier:
            expression = interpreter.identifier( node.name, context, assign );
            break;
        case Syntax.Literal:
            expression = interpreter.literal( node.value, context );
            break;
        case Syntax.MemberExpression:
            expression = node.computed ?
                interpreter.computedMemberExpression( node.object, node.property, context, assign ) :
                interpreter.staticMemberExpression( node.object, node.property, context, assign );
            break;
        case KeypathSyntax.LookupExpression:
            expression = interpreter.lookupExpression( node.key, false, context, assign );
            break;
        case KeypathSyntax.RangeExpression:
            expression = interpreter.rangeExpression( node.left, node.right, context, assign );
            break;
        case KeypathSyntax.RootExpression:
            expression = interpreter.rootExpression( node.key, context, assign );
            break;
        case Syntax.SequenceExpression:
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
        case KeypathSyntax.LookupExpression:
            left = interpreter.lookupExpression( object.key, true, false, assign );
            break;
        case KeypathSyntax.ExistentialExpression:
            isSafe = true;
        default:
            left = interpreter.recurse( object, false, assign );
    }

    switch( property.type ){
        case Syntax.Identifier:
            isComputed = true;
            rhs = right = property.name;
            break;
        default:
            right = interpreter.recurse( property, false, assign );
    }

    return function executeStaticMemberExpression( scope, assignment, lookup ){
        //console.log( 'Executing STATIC MEMBER EXPRESSION' );
        //console.log( '- executeStaticMemberExpression LEFT', left.name );
        //console.log( '- executeStaticMemberExpression RIGHT', rhs || right.name );
        var lhs = left( scope, assignment, lookup ),
            value = returnValue( assignment, depth ),
            result;

        if( !isSafe || lhs ){
            if( !isComputed ){
                rhs = right( property.type === KeypathSyntax.RootExpression ? scope : lhs, assignment, lookup );
            }
            //console.log( '- executeStaticMemberExpression LHS', lhs );
            //console.log( '- executeStaticMemberExpression RHS', rhs );
            //console.log( '- executeStaticMemberExpression DEPTH', depth );
            result = interpreter.isSplit ?
                map( lhs, function( object ){
                    return assign( object, rhs, value );
                } ) :
                assign( lhs, rhs, value );
        }
        //console.log( '- executeStaticMemberExpression RESULT', result );
        return context ?
            { context: lhs, name: rhs, value: result } :
            result;
    };
};