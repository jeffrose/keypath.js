'use strict';

import Null from './null';
import { ArrayExpression, CallExpression, ExpressionStatement, Identifier, Literal, MemberExpression, Program, SequenceExpression /*, Punctuator*/ } from './builder/node';

/**
 * @class Builder
 * @extends Null
 * @param {Lexer} lexer
 */
function Builder( lexer ){
    if( !arguments.length ){
        throw new TypeError( 'lexer must be provided' );
    }
    
    this.lexer = lexer;
}

Builder.prototype = new Null();

Builder.prototype.constructor = Builder;

Builder.prototype.arrayExpression = function(){
    const args = this.bracketList();
    return new ArrayExpression( args );
};

Builder.prototype.build = function( text ){
    this.buffer = text;
    this.tokens = this.lexer.lex( text );
    
    const program = this.program();
    
    if( this.tokens.length ){
        this.throwError( `Unexpected token ${ this.tokens[ 0 ] } remaining` );
    }
    
    return program;
};

Builder.prototype.callExpression = function(){
    const args = this.list( '(' );
    this.consume( '(' );
    const callee = this.expression();
    
    //console.log( 'CALL EXPRESSION' );
    //console.log( '- CALLEE', callee );
    //console.log( '- ARGUMENTS', args, args.length );
    
    return new CallExpression( callee, args );
};

Builder.prototype.consume = function( expected ){
    if( !this.tokens.length ){
        this.throwError( 'Unexpected end of expression' );
    }
    
    const token = this.expect( expected );
    
    if( !token ){
        this.throwError( `Unexpected token ${ token.value } consumed` );
    }
    
    return token;
};

Builder.prototype.expect = function( first, second, third, fourth ){
    const token = this.peek( first, second, third, fourth );
    
    if( token ){
        this.tokens.pop();
        return token;
    }
    
    return undefined;
};

Builder.prototype.expression = function(){
    let expression = null,
        list;
    
    if( this.peek() ){
        if( this.expect( ']' ) ){
            list = this.list( '[' );
            if( this.tokens.length === 1 ){
                expression = new ArrayExpression( list );
                this.consume( '[' );
            } else if( list.length > 1 ){
                expression = new SequenceExpression( list );
            } else {
                expression = list[ 0 ];
            }
        } else if( this.peek().is( 'identifier' ) ){
            expression = this.identifier();
            
            // Implied member expression
            if( this.peek() && this.peek().is( 'punctuator' ) ){
                if( this.peek( ')' ) || this.peek( ']' ) ){
                    expression = this.memberExpression( expression, false );
                }
            }
        } else if( this.peek().is( 'literal' ) ){
            expression = this.literal();
        }
        
        let next;
        
        while( ( next = this.expect( ')', '[', '.' ) ) ){
            if( next.value === ')' ){
                expression = this.callExpression();
            } else if( next.value === '[' ){
                expression = this.memberExpression( expression, true );
            } else if( next.value === '.' ){
                expression = this.memberExpression( expression, false );
            } else {
                this.throwError( `Unexpected token ${ next }` );
            }
        }
    }
    
    return expression;
};

Builder.prototype.expressionStatement = function(){
    return new ExpressionStatement( this.expression() );
};

Builder.prototype.identifier = function(){
    const token = this.consume();
    
    if( !( token.type === 'identifier' ) ){
        this.throwError( 'Identifier expected' );
    }
    
    return new Identifier( token.value );
};

Builder.prototype.literal = function(){
    const token = this.consume();
    
    if( !( token.type === 'literal' ) ){
        this.throwError( 'Literal expected' );
    }
    
    const value = token.value,
    
        literal = value[ 0 ] === '"' || value[ 0 ] === "'" ?
            // String Literal
            value.substring( 1, value.length - 1 ) :
            // Numeric Literal
            parseFloat( value );
    
    return new Literal( literal );
};

Builder.prototype.list = function( terminator ){
    const list = [];
    
    if( this.peek().value !== terminator ){
        do {
            if( this.peek( terminator ) ){
                break;
            }
            list.unshift( this.literal() );
        } while( this.expect( ',' ) );
    }
    
    return list;
};

Builder.prototype.memberExpression = function( property, computed ){
    const object = this.expression();
    
    //console.log( 'MEMBER EXPRESSION' );
    //console.log( '- OBJECT', object );
    //console.log( '- PROPERTY', property );
    //console.log( '- COMPUTED', computed );
    
    return new MemberExpression( object, property, computed );
};

Builder.prototype.peek = function( first, second, third, fourth ){
    const length = this.tokens.length;
    return length ?
        this.peekAt( length - 1, first, second, third, fourth ) :
        undefined;
};

Builder.prototype.peekAt = function( index, first, second, third, fourth ){
    if( typeof index === 'number' ){
        const token = this.tokens[ index ],
            value = token.value;
        
        if( value === first || value === second || value === third || value === fourth || !arguments.length || ( !first && !second && !third && !fourth ) ){
            return token;
        }
    }
    
    return undefined;
};

Builder.prototype.program = function(){
    const body = [];
    
    while( true ){
        if( this.tokens.length ){
            body.push( this.expressionStatement() );
        } else {
            return new Program( body );
        }
    }
};

/*
Builder.prototype.punctuator = function(){
    const token = this.consume();
    
    if( !( token.type === 'punctuator' ) ){
        this.throwError( 'Punctuator expected' );
    }
    
    return new Punctuator( token.value );
};
*/

Builder.prototype.sequenceExpression = function(){
    const args = this.bracketList();
    return new SequenceExpression( args );
};

Builder.prototype.throwError = function( message ){
    throw new SyntaxError( message );
};

export { Builder as default };