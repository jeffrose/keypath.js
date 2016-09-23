'use strict';

import { default as forEach } from './forEach';
import { default as Null } from './null';

const noop = function(){};

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
        expressions.push( interpreter.recurse( statement.expression ) );
    } );
    
    fn = body.length === 0 ? noop :
        body.length === 1 ? expressions[ 0 ] :
        function(){
            console.log( 'FOO' );
            return 'foo';
        };
    
    return fn;
};

Interpreter.prototype.computedMember = function( left, right, context, create, expression ){
    return function( base ){
        var lhs = left( base ),
            rhs, value;
        
        if( lhs != null ){
            rhs = right( base );
            
            if( create ){
                if( lhs && !( lhs[ rhs ] ) ){
                    lhs[ rhs ] = new Null();
                }
            }
            
            value = lhs[ rhs ];
        }
        
        return context ?
            { context: lhs, name: rhs, value: value } :
            value;
    };
};

Interpreter.prototype.identifier = function( name, context, create, expression ){
    return function( base ){
        var value;
        
        if( base ){
            if( create && !( name in base ) ){
                base[ name ] = new Null();
            }
            
            value = base ?
                base[ name ] :
                undefined;
        }
        
        return context ?
            { context: base, name: name, value: value } :
            value;
    };
};

Interpreter.prototype.nonComputedMember = function( left, right, context, create, expression ){
    return function( base ){
        var lhs = left( base ),
            value;
        
        if( create ){
            if( lhs && !( lhs[ right ] ) ){
                lhs[ right ] = new Null();
            }
        }
        
        value = lhs != null ?
            lhs[ right ] :
            undefined;
        
        return context ?
            { context: lhs, name: right, value: value } :
            value;
    };
};

Interpreter.prototype.recurse = function( node, context, create ){
    var interpreter = this,
        args, left, right;
    
    switch( node.type ){
        case 'CallExpression':
            args = [];
            
            forEach( node.arguments, function( expr ){
                args.push( interpreter.recurse( expr ) );
            } );
            
            right = interpreter.recurse( node.callee, true );
            
            return function( base ){
                let rhs = right( base ),
                    value;
                
                if( rhs.value != null ){
                    let values = [],
                        index = 0,
                        length = args.length;
                    
                    for( ; index < length; ++index ){
                        values.push( args[ index ]( base ) );
                    }
                    
                    value = rhs.value.apply( rhs.context, values );
                }
                
                return context ?
                    { value: value }:
                    value;
            };
        case 'Identifier':
            return interpreter.identifier( node.name, context, create, interpreter.expression );
        case 'Literal':
            return interpreter.value( node.value, context );
        case 'MemberExpression':
            left = interpreter.recurse( node.object, false, create );
            right = node.computed ?
                interpreter.recurse( node.property ) :
                node.property.name;
            
            return node.computed ?
                interpreter.computedMember( left, right, context, create, interpreter.expression ) :
                interpreter.nonComputedMember( left, right, context, create, interpreter.expression );
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