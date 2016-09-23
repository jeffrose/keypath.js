'use strict';

import Null from './null';
import { CallExpression, ExpressionStatement, Identifier, Literal, MemberExpression, Program, Punctuator } from './builder/node';

/**
 * @class BuilderError
 * @extends SyntaxError
 * @param {external:string} message The error message
 */
function BuilderError( message ){
    SyntaxError.call( this, message );
}

BuilderError.prototype = Object.create( SyntaxError.prototype );

BuilderError.prototype.constructor = BuilderError;

/**
 * @class Builder
 * @extends Null
 * @param {Lexer} lexer
 */
export default function Builder( lexer ){
    this.lexer = lexer;
}

Builder.prototype = new Null();

Builder.prototype.constructor = Builder;

Builder.prototype.arguments = function(){
    const args = [];
    
    if( this.peek().value !== '(' ){
        do {
            args.unshift( this.expression() );
        } while( this.expect( ',' ) );
    }
    
    return args;
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
        next = this.peek();
    
    if( typeof next !== 'undefined' ){
        let args, callee, object, property;
        
        switch( next.type ){
            
            case 'identifier':
                expression = this.identifier();
                next = this.peek();
                
                if( typeof next !== 'undefined' && next.type === 'punctuator' ){
                    next.value === '.' && this.consume( '.' );
                    property = expression;
                    object = this.expression();
                    expression = new MemberExpression( object, property, false );
                }
                break;
            
            case 'literal':
                expression = this.literal();
                break;
                
            case 'punctuator':
                if( next.value === ')' ){
                    this.consume( ')' );
                    args = this.arguments();
                    this.consume( '(' );
                    callee = this.expression();
                    expression = new CallExpression( callee, args );
                } else if( next.value === ']' ){
                    this.consume( ']' );
                    property = this.literal();
                    this.consume( '[' );
                    object = this.expression();
                    expression = new MemberExpression( object, property, true );
                } else {
                    this.throwError( `Unexpected punctuator token: ${ next.value }` );
                }
                break;
            
            default:
                this.throwError( `Unexpected ${ next.type } token: ${ next.value }` );
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

Builder.prototype.peek = function( first, second, third, fourth ){
    const length = this.tokens.length;
    return length ?
        this.peekAt( length - 1, first, second, third, fourth ) :
        undefined;
};

Builder.prototype.peekAt = function( index, first, second, third, fourth ){
    const token = this.tokens[ index ],
        value = token.value;
    
    if( value === first || value === second || value === third || value === fourth || !arguments.length || ( !first && !second && !third && !fourth ) ){
        return token;
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

Builder.prototype.punctuator = function(){
    const token = this.consume();
    
    if( !( token.type === 'punctuator' ) ){
        throw new BuilderError( 'Punctuator expected' );
    }
    
    return new Punctuator( token.value );
};

Builder.prototype.throwError = function( message ){
    throw new BuilderError( message );
};
