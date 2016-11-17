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
 * @returns {*} The value of the `key` property on `object`.
 */
function getter( object, key ){
    return object[ key ];
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
 * @returns {*} The value of the `key` property on `object`.
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
    var depth = this.depth,
        fn, list;

    if( Array.isArray( elements ) ){
        list = this.listExpression( elements, false, assign );

        fn = function executeArrayExpression( scope, value, lookup ){
            //console.log( 'Executing ARRAY EXPRESSION' );
            //console.log( `- executeArrayExpression LIST`, list );
            //console.log( `- executeArrayExpression DEPTH`, depth );
            var key,
                result = map( list, function( expression ){
                    key = expression( scope, value, lookup );
                    return assign( scope, key, !depth ? value : {} );
                } );
            result.length === 1 && ( result = result[ 0 ] );
            //console.log( `- executeArrayExpression RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    } else {
        list = this.recurse( elements, false, assign );

        fn = function executeArrayExpressionWithElementRange( scope, value, lookup ){
            //console.log( 'Executing ARRAY EXPRESSION' );
            //console.log( `- executeArrayExpressionWithElementRange LIST`, list.name );
            //console.log( `- executeArrayExpressionWithElementRange DEPTH`, depth );
            var keys = list( scope, value, lookup ),
                result = map( keys, function( key ){
                    return assign( scope, key, !depth ? value : {} );
                } );
            //console.log( `- executeArrayExpressionWithElementRange RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    }

    return fn;
};

interpreterPrototype.blockExpression = function( tokens, context, assign ){
    //console.log( 'Composing BLOCK', tokens.join( '' ) );
    var program = this.builder.build( tokens ),
        expression = this.recurse( program.body[ 0 ].expression, false, assign );

    return function executeBlockExpression( scope, value, lookup ){
        //console.log( 'Executing BLOCK' );
        //console.log( `- executeBlockExpression SCOPE`, scope );
        //console.log( `- executeBlockExpression EXPRESSION`, expression.name );
        var result = expression( scope, value, lookup );
        //console.log( `- executeBlockExpression RESULT`, result );
        return context ?
            { context: scope, name: void 0, value: result } :
            result;
    };
};

interpreterPrototype.callExpression = function( callee, args, context, assign ){
    //console.log( 'Composing CALL EXPRESSION' );
    var isSetting = assign === setter,
        left = this.recurse( callee, true, assign ),
        list = this.listExpression( args, false, assign );

    return function executeCallExpression( scope, value, lookup ){
        //console.log( 'Executing CALL EXPRESSION' );
        //console.log( `- executeCallExpression args`, args.length );
        var lhs = left( scope, value, lookup ),
            args = map( list, function( expression ){
                return expression( scope, value, lookup );
            } ),
            result;
        //console.log( `- executeCallExpression LHS`, lhs );
        result = lhs.value.apply( lhs.context, args );
        if( isSetting && typeof lhs.value === 'undefined' ){
            throw new TypeError( 'cannot create call expressions' );
        }
        //console.log( `- executeCallExpression RESULT`, result );
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
    var program = this.builder.build( expression ),
        body = program.body,
        interpreter = this,
        assign, expressions, fn;

    if( typeof create !== 'boolean' ){
        create = false;
    }

    interpreter.depth = -1;
    interpreter.isLeftSplit = false;
    interpreter.isRightSplit = false;
    interpreter.isSplit = false;

    assign = create ?
        setter :
        getter;

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
            expressions = map( body, function( statement ){
                return interpreter.recurse( statement.expression, false, assign );
            } );
            fn = function executeProgram( scope, value, lookup ){
                var values = map( expressions, function( expression ){
                        return expression( scope, value, lookup );
                    } );

                return values[ values.length - 1 ];
            };
            break;
    }
    //console.log( 'FN', fn.name );
    return fn;
};

interpreterPrototype.computedMemberExpression = function( object, property, context, assign ){
    //console.log( 'Composing COMPUTED MEMBER EXPRESSION', object.type, property.type );
    var depth = this.depth,
        interpreter = this,
        isSafe = object.type === KeypathSyntax.ExistentialExpression,
        left = this.recurse( object, false, assign ),
        right = this.recurse( property, false, assign );

    if( !interpreter.isSplit ){
        return function executeComputedMemberExpression( scope, value, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( `- executeComputedMemberExpression LEFT `, left.name );
            //console.log( `- executeComputedMemberExpression RIGHT`, right.name );
            var lhs = left( scope, value, lookup ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, value, lookup );
                //console.log( `- executeComputedMemberExpression DEPTH`, depth );
                //console.log( `- executeComputedMemberExpression LHS`, lhs );
                //console.log( `- executeComputedMemberExpression RHS`, rhs );
                result = assign( lhs, rhs, !depth ? value : {} );
            }
            //console.log( `- executeComputedMemberExpression RESULT`, result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else if( interpreter.isLeftSplit && !interpreter.isRightSplit ){
        return function executeComputedMemberExpression( scope, value, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( `- executeComputedMemberExpression LEFT `, left.name );
            //console.log( `- executeComputedMemberExpression RIGHT`, right.name );
            var lhs = left( scope, value, lookup ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, value, lookup );
                //console.log( `- executeComputedMemberExpression DEPTH`, depth );
                //console.log( `- executeComputedMemberExpression LHS`, lhs );
                //console.log( `- executeComputedMemberExpression RHS`, rhs );
                result = map( lhs, function( object ){
                    return assign( object, rhs, !depth ? value : {} );
                } );
            }
            //console.log( `- executeComputedMemberExpression RESULT`, result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else if( !interpreter.isLeftSplit && interpreter.isRightSplit ){
        return function executeComputedMemberExpression( scope, value, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( `- executeComputedMemberExpression LEFT `, left.name );
            //console.log( `- executeComputedMemberExpression RIGHT`, right.name );
            var lhs = left( scope, value, lookup ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, value, lookup );
                //console.log( `- executeComputedMemberExpression DEPTH`, depth );
                //console.log( `- executeComputedMemberExpression LHS`, lhs );
                //console.log( `- executeComputedMemberExpression RHS`, rhs );
                result = map( rhs, function( key ){
                    return assign( lhs, key, !depth ? value : {} );
                } );
            }
            //console.log( `- executeComputedMemberExpression RESULT`, result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else {
        return function executeComputedMemberExpression( scope, value, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( `- executeComputedMemberExpression LEFT `, left.name );
            //console.log( `- executeComputedMemberExpression RIGHT`, right.name );
            var lhs = left( scope, value, lookup ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, value, lookup );
                //console.log( `- executeComputedMemberExpression DEPTH`, depth );
                //console.log( `- executeComputedMemberExpression LHS`, lhs );
                //console.log( `- executeComputedMemberExpression RHS`, rhs );
                result = map( lhs, function( object ){
                    return map( rhs, function( key ){
                        return assign( object, key, !depth ? value : {} );
                    } );
                } );
            }
            //console.log( `- executeComputedMemberExpression RESULT`, result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    }
};

interpreterPrototype.existentialExpression = function( expression, context, assign ){
    //console.log( 'Composing EXISTENTIAL EXPRESSION', expression.type );
    var left = this.recurse( expression, false, assign );

    return function executeExistentialExpression( scope, value, lookup ){
        var result;
        //console.log( 'Executing EXISTENTIAL EXPRESSION' );
        //console.log( `- executeExistentialExpression LEFT`, left.name );
        if( scope ){
            try {
                result = left( scope, value, lookup );
            } catch( e ){
                result = void 0;
            }
        }
        //console.log( `- executeExistentialExpression RESULT`, result );
        return context ?
            { value: result } :
            result;
    };
};

interpreterPrototype.identifier = function( name, context, assign ){
    //console.log( 'Composing IDENTIFIER', name );
    var depth = this.depth;

    return function executeIdentifier( scope, value, lookup ){
        //console.log( 'Executing IDENTIFIER' );
        //console.log( `- executeIdentifier NAME`, name );
        //console.log( `- executeIdentifier DEPTH`, depth );
        //console.log( `- executeIdentifier VALUE`, value );
        var result = assign( scope, name, !depth ? value : {} );
        //console.log( `- executeIdentifier RESULT`, result );
        return context ?
            { context: scope, name: name, value: result } :
            result;
    };
};

interpreterPrototype.listExpression = function( items, context, assign ){
    var interpreter = this;
    return map( items, function( item ){
        return interpreter.listExpressionElement( item, context, assign );
    } );
};

interpreterPrototype.listExpressionElement = function( element, context, assign ){
    switch( element.type ){
        case Syntax.Literal:
            return this.literal( element.value, context );
        case KeypathSyntax.LookupExpression:
            return this.lookupExpression( element.key, false, context, assign );
        case KeypathSyntax.RootExpression:
            return this.rootExpression( element.key, context, assign );
        case KeypathSyntax.BlockExpression:
            return this.blockExpression( element.body, context, assign );
        default:
            throw new TypeError( 'Unexpected list element type ' + element.type );
    }
};

interpreterPrototype.literal = function( value, context ){
    //console.log( 'Composing LITERAL', value );
    return function executeLiteral(){
        //console.log( 'Executing LITERAL' );
        //console.log( `- executeLiteral RESULT`, value );
        return context ?
            { context: void 0, name: void 0, value: value } :
            value;
    };
};

interpreterPrototype.lookupExpression = function( key, resolve, context, assign ){
    //console.log( 'Composing LOOKUP EXPRESSION', key );
    var isLeftFunction = false,
        lhs = {},
        left;

    switch( key.type ){
        case Syntax.Identifier:
            left = this.identifier( key.name, true, assign );
            isLeftFunction = true;
            break;
        case Syntax.Literal:
            lhs.value = left = key.value;
            break;
        default:
            left = this.recurse( key, true, assign );
            isLeftFunction = true;
            break;
    }

    return function executeLookupExpression( scope, value, lookup ){
        //console.log( 'Executing LOOKUP EXPRESSION' );
        //console.log( `- executeLookupExpression LEFT`, left.name || left );
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
        //console.log( `- executeLookupExpression LHS`, lhs );
        //console.log( `- executeLookupExpression RESULT`, result  );
        return context ?
            { context: lookup, name: lhs.value, value: result } :
            result;
    };
};

interpreterPrototype.rangeExpression = function( lower, upper, context, assign ){
    //console.log( 'Composing RANGE EXPRESSION' );
    var interpreter = this,
        left = lower !== null ?
            interpreter.recurse( lower, false, assign ) :
            returnZero,
        right = upper !== null ?
            interpreter.recurse( upper, false, assign ) :
            returnZero,
        index, lhs, middle, result, rhs;

    return function executeRangeExpression( scope, value, lookup ){
        //console.log( 'Executing RANGE EXPRESSION' );
        //console.log( `- executeRangeExpression LEFT`, left.name );
        //console.log( `- executeRangeExpression RIGHT`, right.name );
        lhs = left( scope, value, lookup );
        rhs = right( scope, value, lookup );
        result = [];
        index = 1;
        //console.log( `- executeRangeExpression LHS`, lhs );
        //console.log( `- executeRangeExpression RHS`, rhs );
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
        //console.log( `- executeRangeExpression RESULT`, result );
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
            throw new TypeError( 'Unknown node type ' + node.type );
    }

    interpreter.depth--;

    return expression;
};

interpreterPrototype.rootExpression = function( key, context, assign ){
    //console.log( 'Composing ROOT EXPRESSION' );
    var left = this.recurse( key, false, assign );

    return function executeRootExpression( scope, value, lookup ){
        //console.log( 'Executing ROOT EXPRESSION' );
        //console.log( `- executeRootExpression LEFT`, left.name || left );
        //console.log( `- executeRootExpression SCOPE`, scope );
        var lhs, result;
        result = lhs = left( scope, value, lookup );
        //console.log( `- executeRootExpression LHS`, lhs );
        //console.log( `- executeRootExpression RESULT`, result  );
        return context ?
            { context: lookup, name: lhs.value, value: result } :
            result;
    };
};

interpreterPrototype.sequenceExpression = function( expressions, context, assign ){
    var fn, list;
    //console.log( 'Composing SEQUENCE EXPRESSION' );
    if( Array.isArray( expressions ) ){
        list = this.listExpression( expressions, false, assign );

        fn = function executeSequenceExpression( scope, value, lookup ){
            //console.log( 'Executing SEQUENCE EXPRESSION' );
            //console.log( `- executeSequenceExpression LIST`, list );
            var result = map( list, function( expression ){
                    return expression( scope, value, lookup );
                } );
            //console.log( `- executeSequenceExpression RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    } else {
        list = this.recurse( expressions, false, assign );

        fn = function executeSequenceExpressionWithExpressionRange( scope, value, lookup ){
            //console.log( 'Executing SEQUENCE EXPRESSION' );
            //console.log( `- executeSequenceExpressionWithExpressionRange LIST`, list.name );
            var result = list( scope, value, lookup );
            //console.log( `- executeSequenceExpressionWithExpressionRange RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    }

    return fn;
};

interpreterPrototype.staticMemberExpression = function( object, property, context, assign ){
    //console.log( 'Composing STATIC MEMBER EXPRESSION', object.type, property.type );
    var interpreter = this,
        depth = this.depth,
        isRightFunction = false,
        isSafe = false,
        left, rhs, right;

    switch( object.type ){
        case KeypathSyntax.LookupExpression:
            left = this.lookupExpression( object.key, true, false, assign );
            break;
        case KeypathSyntax.ExistentialExpression:
            isSafe = true;
        default:
            left = this.recurse( object, false, assign );
    }

    switch( property.type ){
        case Syntax.Identifier:
            rhs = right = property.name;
            break;
        default:
            right = this.recurse( property, false, assign );
            isRightFunction = true;
    }

    if( !interpreter.isSplit ){
        return function executeStaticMemberExpression( scope, value, lookup ){
            //console.log( 'Executing STATIC MEMBER EXPRESSION' );
            //console.log( `- executeStaticMemberExpression LEFT`, left.name );
            //console.log( `- executeStaticMemberExpression RIGHT`, rhs || right.name );
            var lhs = left( scope, value, lookup ),
                result;

            if( !isSafe || lhs ){
                if( isRightFunction ){
                    rhs = right( property.type === KeypathSyntax.RootExpression ? scope : lhs, value, lookup );
                }
                //console.log( `- executeStaticMemberExpression LHS`, lhs );
                //console.log( `- executeStaticMemberExpression RHS`, rhs );
                //console.log( `- executeStaticMemberExpression DEPTH`, depth );
                result = assign( lhs, rhs, !depth ? value : {} );
            }
            //console.log( `- executeStaticMemberExpression RESULT`, result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else {
        return function executeStaticMemberExpression( scope, value, lookup ){
            //console.log( 'Executing STATIC MEMBER EXPRESSION' );
            //console.log( `- executeStaticMemberExpression LEFT`, left.name );
            //console.log( `- executeStaticMemberExpression RIGHT`, rhs || right.name );
            var lhs = left( scope, value, lookup ),
                result;

            if( !isSafe || lhs ){
                if( isRightFunction ){
                    rhs = right( property.type === KeypathSyntax.RootExpression ? scope : lhs, value, lookup );
                }
                //console.log( `- executeStaticMemberExpression LHS`, lhs );
                //console.log( `- executeStaticMemberExpression RHS`, rhs );
                //console.log( `- executeStaticMemberExpression DEPTH`, depth );
                result = map( lhs, function( object ){
                    return assign( object, rhs, !depth ? value : {} );
                } );
            }
            //console.log( `- executeStaticMemberExpression RESULT`, result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    }
};
