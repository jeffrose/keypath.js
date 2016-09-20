'use strict';

import Null from './null';
import { CallExpression, ExpressionStatement, Identifier, Literal, MemberExpression, Numeric, Program, Punctuator } from './builder/node';

function BuilderError( message ){
    SyntaxError.call( this, message );
    console.log( 'BuilderError', message );
}

BuilderError.prototype = Object.create( SyntaxError.prototype );

BuilderError.prototype.constructor = BuilderError;

export default function Builder( lexer ){
    this.lexer = lexer;
}

Builder.prototype = new Null();

Builder.prototype.constructor = Builder;

Builder.prototype.arguments = function(){
    var args = [];
    
    if( this.peek().value !== '(' ){
        do {
            args.push( this.expression() );
        } while( this.expect( ',' ) );
    }
    
    return args;
};

Builder.prototype.build = function( text ){
    this.buffer = text;
    this.tokens = this.lexer.lex( text );
    
    var program = this.program();
    
    if( this.tokens.length ){
        this.throwError( `Unexpected token ${ this.tokens[ 0 ] } remaining` );
    }
    
    return program;
};

Builder.prototype.consume = function( expected ){
    if( !this.tokens.length ){
        this.throwError( 'Unexpected end of expression' );
    }
    
    var token = this.expect( expected );
    
    if( !token ){
        this.throwError( `Unexpected token ${ token.value } consumed` );
    }
    
    return token;
};

Builder.prototype.expect = function( first, second, third, fourth ){
    var token = this.peek( first, second, third, fourth );
    
    if( token ){
        this.tokens.pop();
        return token;
    }
    
    return undefined;
};

// foo.bar[100]qux(123,%,"bleh")baz
// foo.bar.100.qux.123,%,"bleh".baz
Builder.prototype.expression = function(){
    let args, callee, expression, next, object, property;
    
    switch( this.peek().type ){
        case 'identifier':
            expression = this.identifier();
            break;
        case 'literal':
            expression = this.literal();
            break;
        case 'numeric':
            expression = this.numeric();
            break;
        case 'punctuator':
            break;
        default:
            this.throwError( `Unexpected upcoming token ${ this.peek().value }` );
    }
    
    while( next = this.expect( ')', ']', '.' ) ){
        switch( next.value ){
            case '.':
                property = expression;
                object = this.expression();
                expression = new MemberExpression( object, property, false );
                break;
            case ']':
                property = this.numeric();
                this.consume( '[' );
                object = this.expression();
                expression = new MemberExpression( object, property, true );
                break;
            case ')':
                args = this.arguments();
                this.consume( '(' );
                callee = this.expression();
                expression = new CallExpression( callee, args );
                break;
            default:
                this.throwError( `Unexpected token ${ next.value }` );
        }
    }
    
    return expression;
};

Builder.prototype.expressionStatement = function(){
    return new ExpressionStatement( this.expression() );
};

Builder.prototype.identifier = function(){
    var token = this.consume();
    
    if( !( token.type === 'identifier' ) ){
        this.throwError( 'Identifier expected' );
    }
    
    return new Identifier( token.value );
};

Builder.prototype.literal = function(){
    var token = this.consume();
    
    if( !( token.type === 'literal' ) ){
        this.throwError( 'Literal expected' );
    }
    
    return new Literal( token.value );
};

Builder.prototype.numeric = function(){
    var token = this.consume();
    
    if( !( token.type === 'numeric' ) ){
        this.throwError( 'Numeric expected' );
    }
    
    return new Numeric( token.value );
};

Builder.prototype.peek = function( first, second, third, fourth ){
    let length = this.tokens.length;
    if( length ){
        let token = this.tokens[ length - 1 ],
            value = token.value;
        
        if( value === first || value === second || value === third || value === fourth || !arguments.length || ( !first && !second && !third && !fourth ) ){
            return token;
        }
    }
    
    return undefined;
};

Builder.prototype.program = function(){
    var body = [];
    
    while( true ){
        if( this.tokens.length ){
            body.push( this.expressionStatement() );
        } else {
            return new Program( body );
        }
    }
};

Builder.prototype.punctuator = function(){
    var token = this.consume();
    
    if( !( token.type === 'punctuator' ) ){
        throw new BuilderError( 'Punctuator expected' );
    }
    
    return new Punctuator( token.value );
};

Builder.prototype.throwError = function( message ){
    throw new BuilderError( message );
};
