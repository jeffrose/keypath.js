'use strict';

import forEach from './forEach';
import Null from './null';

const noop = function(){};

/**
 * @class Interpreter
 * @extends Null
 * @param {Builder} builder
 */
export default function Interpreter( builder ){
    this.builder = builder;
}

Interpreter.prototype = new Null();

Interpreter.prototype.constructor = Interpreter;

Interpreter.prototype.compile = function( expression ){
    var ast = this.builder.build( expression ),
        body = ast.body,
        expressions = [],
        interpreter = this,
        fn;
    
    interpreter.expression = expression;
    
    forEach( body, function( statement ){
        expressions.push( interpreter.recurse( statement.expression, false ) );
    } );
    
    fn = body.length === 0 ? noop :
        body.length === 1 ? expressions[ 0 ] :
        function(){
            console.log( 'FOO', arguments );
            return 'foo';
        };
    
    return function( target, create, value ){
        return fn( target, create, value );
    };
};

Interpreter.prototype.computedMember = function( left, right, context, expression ){
    return function( base, create ){
        const lhs = left( base, create );
        let rhs, value;
        
        if( typeof lhs !== 'undefined' ){
            rhs = right( base, create );
            
            if( create && !( rhs in lhs ) ){
                lhs[ rhs ] = new Null();
            }
            
            value = lhs[ rhs ];
        }
        
        return context ?
            { context: lhs, name: rhs, value: value } :
            value;
    };
};

Interpreter.prototype.identifier = function( name, context, expression ){
    return function( base, create ){
        let value;
        
        if( typeof base !== 'undefined' ){
            if( create && !( name in base ) ){
                base[ name ] = new Null();
            }
            
            value = base[ name ];
        }
        
        return context ?
            { context: base, name: name, value: value } :
            value;
    };
};

Interpreter.prototype.nonComputedMember = function( left, right, context, expression ){
    return function( base, create, value ){
        const lhs = left( base, create );
        let returnValue;
        
        if( typeof lhs !== 'undefined' ){
            if( create && !( right in lhs ) ){
                lhs[ right ] = value || new Null();
            }
            
            returnValue = lhs[ right ];
        }
        
        return context ?
            { context: lhs, name: right, value: returnValue } :
            returnValue;
    };
};

Interpreter.prototype.recurse = function( node, context ){
    const interpreter = this;
    let left, right;
    
    switch( node.type ){
        case 'CallExpression':
            const args = [];
            
            forEach( node.arguments, function( expr ){
                args.push( interpreter.recurse( expr, false ) );
            } );
            
            right = interpreter.recurse( node.callee, true );
            
            return function( base, create ){
                const rhs = right( base, create );
                let value;
                
                if( typeof rhs.value === 'function' ){
                    const values = args.map( function( arg ){
                        return arg( base, create );
                    } );
                    value = rhs.value.apply( rhs.context, values );
                } else if( create ){
                    throw new Error( 'cannot create functions' );
                }
                
                return context ?
                    { value: value }:
                    value;
            };
        case 'Identifier':
            return interpreter.identifier( node.name, context, interpreter.expression );
        case 'Literal':
            return interpreter.value( node.value, context );
        case 'MemberExpression':
            left = interpreter.recurse( node.object, false );
            right = node.computed ?
                interpreter.recurse( node.property, false ) :
                node.property.name;
            
            return node.computed ?
                interpreter.computedMember( left, right, context, interpreter.expression ) :
                interpreter.nonComputedMember( left, right, context, interpreter.expression );
        case 'Program':
            break;
    }
};

Interpreter.prototype.value = function( value, context ){
    return function(){
        return context ?
            { context: undefined, name: undefined, value: value } :
            value;
    };
};