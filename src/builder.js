'use strict';

import Null from './null';
import Grammar from './lexer/grammar';
import { ArrayExpression, CallExpression, ComputedMemberExpression, ExpressionStatement, Identifier, Literal, Program, RangeExpression, SequenceExpression, StaticMemberExpression } from './builder/node';

/**
 * @class Builder
 * @extends Null
 * @param {Lexer} lexer
 */
function Builder( lexer ){
    this.lexer = lexer;
}

Builder.prototype = new Null();

Builder.prototype.constructor = Builder;

Builder.prototype.arrayExpression = function( list ){
    var end = ( list.length ? list[ list.length - 1 ].range[ 1 ] : 1 ) + 1,
        node;
        
    this.consume( '[' );
    
    node = new ArrayExpression( list );
    node.range = [ this.column, end ];
    
    return node;
};

/**
 * @function
 * @param {external:string|Array<Builder~Token>} input
 * @returns {Program} The built abstract syntax tree
 */
Builder.prototype.build = function( input ){
    if( typeof input === 'string' ){
        /**
         * @member {external:string}
         */
        this.text = input;
        
        if( typeof this.lexer === 'undefined' ){
            this.throwError( 'lexer is not defined' );
        }
        
        /**
         * @member {external:Array<Token>}
         */
        this.tokens = this.lexer.lex( input );
    } else if( Array.isArray( input ) ){
        this.tokens = input.slice();
        this.text = input.join( '' );
    } else {
        this.throwError( 'invalid input' );
    }
    
    //console.log( 'BUILD' );
    //console.log( '- ', this.text.length, 'CHARS', this.text );
    //console.log( '- ', this.tokens.length, 'TOKENS', this.tokens );
    
    this.column = this.text.length;
    
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
    var end = this.column + 1,
        args = this.list( '(' ),
        callee, node, start;
        
    this.consume( '(' );
    
    callee = this.expression();
    
    start = this.column;
    
    //console.log( 'CALL EXPRESSION' );
    //console.log( '- CALLEE', callee );
    //console.log( '- ARGUMENTS', args, args.length );
    
    node = new CallExpression( callee, args );
    node.range = [ start, end ];
    
    return node;
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
        this.column -= token.length;
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
                expression = Array.isArray( list ) ?
                    list[ 0 ] :
                    list;
            }
        } else if( next.type === Grammar.Identifier ){
            expression = this.identifier();
            next = this.peek();
            
            // Implied member expression
            if( next && next.type === Grammar.Punctuator ){
                if( next.value === ')' || next.value === ']' ){
                    expression = this.memberExpression( expression, false );
                }
            }
        } else if( next.type === Grammar.Literal ){
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
    var end = this.column,
        node = this.expression(),
        start = this.column,
        expressionStatement = new ExpressionStatement( node );
    
    expressionStatement.range = [ start, end ];
    
    return expressionStatement;
};

/**
 * @function
 * @returns {Identifier} An identifier
 * @throws {SyntaxError} If the token is not an identifier
 */
Builder.prototype.identifier = function(){
    var end = this.column,
        token = this.consume(),
        start = this.column,
        node;
    
    if( !( token.type === Grammar.Identifier ) ){
        this.throwError( 'Identifier expected' );
    }
    
    node = new Identifier( token.value );
    node.range = [ start, end ];
    
    return node;
};

/**
 * @function
 * @returns {Literal} The literal node
 */
Builder.prototype.literal = function(){
    var end = this.column,
        token = this.consume(),
        start = this.column,
        node, raw, value;
    
    if( !( token.type === Grammar.Literal ) ){
        this.throwError( 'Literal expected' );
    }
    
    raw = token.value;

    value = raw[ 0 ] === '"' || raw[ 0 ] === "'" ?
        // String Literal
        raw.substring( 1, raw.length - 1 ) :
        // Numeric Literal
        parseFloat( raw );
    
    node = new Literal( value, raw );
    node.range = [ start, end ];
    
    return node;
};

/**
 * @function
 * @param {external:string} terminator
 * @returns {external:Array<Literal>} The list of literals
 */
Builder.prototype.list = function( terminator ){
    var list = [],
        literal;
    
    if( this.peek().value !== terminator ){
        do {
            literal = this.literal();
            if( this.peek().value === '.' ){
                list = this.rangeExpression( literal );
            } else {
                list.unshift( literal );
            }
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
    var end = property.range[ 1 ] + ( computed ? 1 : 0 ),
        object = this.expression(),
        start = this.column,
        node;
    
    //console.log( 'MEMBER EXPRESSION' );
    //console.log( '- OBJECT', object );
    //console.log( '- PROPERTY', property );
    //console.log( '- COMPUTED', computed );
    
    node = computed ?
        new ComputedMemberExpression( object, property ) :
        new StaticMemberExpression( object, property );
    
    node.range = [ start, end ];
    
    return node;
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
    var end = this.column,
        body = [],
        node;
    
    while( true ){
        if( this.tokens.length ){
            body.unshift( this.expressionStatement() );
        } else {
            node = new Program( body );
            node.range = [ this.column, end ];
            return node;
        }
    }
};

Builder.prototype.rangeExpression = function( right ){
    var end = this.column + 1,
        left, node;
    
    this.expect( '.' );
    this.expect( '.' );
    
    left = this.literal();
    
    node = new RangeExpression( left, right );
    node.range = [ this.column, end ];
    
    return node;
};

Builder.prototype.sequenceExpression = function( list ){
    var end, node;
    
    if( Array.isArray( list ) ){
        end = list[ list.length - 1 ].range[ 1 ];
    } else if( list instanceof RangeExpression ){
        end = list.right.range[ 1 ];
    }
    
    node = new SequenceExpression( list );
    
    node.range = [ this.column, end ];
    
    return node;
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