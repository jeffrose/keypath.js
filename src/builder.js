'use strict';

import Null from './null';
import { ArrayExpression, CallExpression, ExpressionStatement, Identifier, Literal, MemberExpression, Program, SequenceExpression /*, Punctuator*/ } from './builder/node';
import Position from './builder/position';
import SourceLocation from './builder/sourceLocation';

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

Builder.prototype.arrayExpression = function( list ){
    var // "+ 1" to take the ']' into account
        end = new Position( this.line, list[ list.length - 1 ].loc.end.column + 1 ),
        location, start;
    
    this.consume( '[' );
    
    start = new Position( this.line, this.column );
    location = new SourceLocation( start, end );
    
    return new ArrayExpression( list, location );
};

/**
 * @function
 * @param {external:string} text
 * @returns {Program} The built abstract syntax tree
 */
Builder.prototype.build = function( text ){
    /**
     * @member {external:string}
     */
    this.text = text;
    /**
     * @member {external:Array<Token>}
     */
    this.tokens = this.lexer.lex( text );
    
    //console.log( 'BUILD' );
    //console.log( '- ', this.text.length, 'CHARS', this.text );
    //console.log( '- ', this.tokens.length, 'TOKENS', this.tokens );
    
    this.column = this.tokens.length;
    
    var program = this.program();
    
    if( this.tokens.length ){
        this.throwError( 'Unexpected token ' + this.tokens[ 0 ] + ' remaining' );
    }
    
    return program;
};

/**
 * @function
 * @returns {CallExpression} The call expression node
 */
Builder.prototype.callExpression = function(){
    var // "+ 1" to take the ')' into account
        end = new Position( this.line, this.column + 1 ),
        args = this.list( '(' ),
        callee, location, start;
        
    this.consume( '(' );
    
    callee = this.expression();
    
    start = callee === null ?
        new Position( this.line, this.column ) :
        callee.loc.start;
    
    //console.log( 'CALL EXPRESSION' );
    //console.log( '- CALLEE', callee );
    //console.log( '- ARGUMENTS', args, args.length );
    
    location = new SourceLocation( start, end );
    
    return new CallExpression( callee, args, location );
};

/**
 * Removes the next token in the token list. If a comparison is provided, the token will only be returned if the value matches. Otherwise an error is thrown.
 * @function
 * @param {external:string} [expected] An expected comparison value
 * @returns {Token} The next token in the list
 * @throws {SyntaxError} If token did not exist
 */
Builder.prototype.consume = function( expected ){
    if( !this.tokens.length ){
        this.throwError( 'Unexpected end of expression' );
    }
    
    var token = this.expect( expected );
    
    if( !token ){
        this.throwError( 'Unexpected token ' + token.value + ' consumed' );
    }
    
    return token;
};

/**
 * Removes the next token in the token list. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.
 * @function
 * @param {external:string} [first] The first comparison value
 * @param {external:string} [second] The second comparison value
 * @param {external:string} [third] The third comparison value
 * @param {external:string} [fourth] The fourth comparison value
 * @returns {Token} The next token in the list or `undefined` if it did not exist
 */
Builder.prototype.expect = function( first, second, third, fourth ){
    var token = this.peek( first, second, third, fourth );
    
    if( token ){
        this.tokens.pop();
        this.column--;
        return token;
    }
    
    return undefined;
};

/**
 * @function
 * @returns {Expression} An expression node
 */
Builder.prototype.expression = function(){
    var expression = null,
        list, next, token;
    
    if( next = this.peek() ){
        if( this.expect( ']' ) ){
            list = this.list( '[' );
            if( this.tokens.length === 1 ){
                expression = this.arrayExpression( list );
            } else if( list.length > 1 ){
                expression = this.sequenceExpression( list );
            } else {
                expression = list[ 0 ];
            }
        } else if( next.type === 'identifier' ){
            expression = this.identifier();
            next = this.peek();
            
            // Implied member expression
            if( next && next.type === 'punctuator' ){
                if( next.value === ')' || next.value === ']' ){
                    expression = this.memberExpression( expression, false );
                }
            }
        } else if( next.type === 'literal' ){
            expression = this.literal();
        }
        
        while( ( token = this.expect( ')', '[', '.' ) ) ){
            if( token.value === ')' ){
                expression = this.callExpression();
            } else if( token.value === '[' ){
                expression = this.memberExpression( expression, true );
            } else if( token.value === '.' ){
                expression = this.memberExpression( expression, false );
            } else {
                this.throwError( 'Unexpected token ' + token );
            }
        }
    }
    
    return expression;
};

/**
 * @function
 * @returns {ExpressionStatement} An expression statement
 */
Builder.prototype.expressionStatement = function(){
    return new ExpressionStatement( this.expression() );
};

/**
 * @function
 * @returns {Identifier} An identifier
 * @throws {SyntaxError} If the token is not an identifier
 */
Builder.prototype.identifier = function(){
    var end = new Position( this.line, this.column ),
        token = this.consume(),
        location, start;
    
    if( !( token.type === 'identifier' ) ){
        this.throwError( 'Identifier expected' );
    }
    
    start = new Position( this.line, this.column );
    location = new SourceLocation( start, end );
    
    return new Identifier( token.value, location );
};

/**
 * @function
 * @returns {Literal} The literal node
 */
Builder.prototype.literal = function(){
    var end = new Position( this.line, this.column ),
        token = this.consume(),
        literal, location, start, value;
    
    if( !( token.type === 'literal' ) ){
        this.throwError( 'Literal expected' );
    }
    
    value = token.value;

    literal = value[ 0 ] === '"' || value[ 0 ] === "'" ?
        // String Literal
        value.substring( 1, value.length - 1 ) :
        // Numeric Literal
        parseFloat( value );
    
    start = new Position( this.line, this.column );
    location = new SourceLocation( start, end );
    
    return new Literal( literal, location );
};

/**
 * @function
 * @param {external:string} terminator
 * @returns {external:Array<Literal>} The list of literals
 */
Builder.prototype.list = function( terminator ){
    var list = [];
    
    if( this.peek().value !== terminator ){
        do {
            list.unshift( this.literal() );
        } while( this.expect( ',' ) );
    }
    
    return list;
};

/**
 * @function
 * @param {Expression} property The expression assigned to the property of the member expression
 * @param {external:boolean} computed Whether or not the member expression is computed
 * @returns {MemberExpression} The member expression
 */
Builder.prototype.memberExpression = function( property, computed ){
    var // "+ 1" to take the ']' into account, but only for computed member expressions
        end = new Position( this.line, property.loc.end.column + ( computed ? 1 : 0 ) ),
        object = this.expression(),
        start = object.loc.start,
        location = new SourceLocation( start, end );
    
    //console.log( 'MEMBER EXPRESSION' );
    //console.log( '- OBJECT', object );
    //console.log( '- PROPERTY', property );
    //console.log( '- COMPUTED', computed );
    
    return new MemberExpression( object, property, computed, location );
};

/**
 * Provides the next token in the token list _without removing it_. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.
 * @function
 * @param {external:string} [first] The first comparison value
 * @param {external:string} [second] The second comparison value
 * @param {external:string} [third] The third comparison value
 * @param {external:string} [fourth] The fourth comparison value
 * @returns {Lexer~Token} The next token in the list or `undefined` if it did not exist
 */
Builder.prototype.peek = function( first, second, third, fourth ){
    return this.tokens.length ?
        this.peekAt( 0, first, second, third, fourth ) :
        undefined;
};

/**
 * Provides the token at the requested position _without removing it_ from the token list. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.
 * @function
 * @param {external:number} position The position where the token will be peeked
 * @param {external:string} [first] The first comparison value
 * @param {external:string} [second] The second comparison value
 * @param {external:string} [third] The third comparison value
 * @param {external:string} [fourth] The fourth comparison value
 * @returns {Lexer~Token} The token at the requested position or `undefined` if it did not exist
 */
Builder.prototype.peekAt = function( position, first, second, third, fourth ){
    var index, length, token, value;
    
    if( typeof position === 'number' && position > -1 ){
        length = this.tokens.length;
        index = length - position - 1;
        
        if( index > -1 && index < length ){
            token = this.tokens[ index ];
            value = token.value;
            
            if( value === first || value === second || value === third || value === fourth || ( !first && !second && !third && !fourth ) ){
                return token;
            }
        }
    }
    
    return undefined;
};

/**
 * @function
 * @returns {Program} A program node
 */
Builder.prototype.program = function(){
    var body = [];
    
    this.line = 1;
    
    while( true ){
        if( this.tokens.length ){
            body.push( this.expressionStatement() );
        } else {
            return new Program( body );
        }
    }
};

Builder.prototype.sequenceExpression = function( list ){
    var // "- 1" to take the '[' into account
        start = new Position( this.line, this.column - 1 ),
        // "+ 1" to take the ']' into account
        end = new Position( this.line, list[ list.length - 1 ].loc.end.column + 1 ),
        location = new SourceLocation( start, end );
    
    return new SequenceExpression( list, location );
};

/**
 * @function
 * @param {external:string} message The error message
 * @throws {external:SyntaxError} When it executes
 */
Builder.prototype.throwError = function( message ){
    throw new SyntaxError( message );
};

export { Builder as default };