'use strict';

import Character from './character';
import Null from './null';
import * as Token from './token';

var lexerPrototype;

/**
 * @class Lexer
 * @extends Null
 */
export default function Lexer(){
    this.buffer = '';
}

lexerPrototype = Lexer.prototype = new Null();

lexerPrototype.constructor = Lexer;

/**
 * @function
 * @param {external:string} text
 */
lexerPrototype.lex = function( text ){
    /**
     * @member {external:string}
     * @default ''
     */
    this.buffer = text;
    /**
     * @member {external:number}
     */
    this.index = 0;
    /**
     * @member {Array<Lexer~Token>}
     */
    this.tokens = [];

    var length = this.buffer.length,
        word = '',
        char, token, quote;

    while( this.index < length ){
        char = this.buffer[ this.index ];

        // Identifier
        if( Character.isIdentifierStart( char ) ){
            word = this.read( function( char ){
                return !Character.isIdentifierPart( char );
            } );

            token = word === 'null' ?
                new Token.NullLiteral( word ) :
                new Token.Identifier( word );
            this.tokens.push( token );

        // Punctuator
        } else if( Character.isPunctuator( char ) ){
            token = new Token.Punctuator( char );
            this.tokens.push( token );

            this.index++;

        // Quoted String
        } else if( Character.isQuote( char ) ){
            quote = char;

            this.index++;

            word = this.read( function( char ){
                return char === quote;
            } );

            token = new Token.StringLiteral( quote + word + quote );
            this.tokens.push( token );

            this.index++;

        // Numeric
        } else if( Character.isNumeric( char ) ){
            word = this.read( function( char ){
                return !Character.isNumeric( char );
            } );

            token = new Token.NumericLiteral( word );
            this.tokens.push( token );

        // Whitespace
        } else if( Character.isWhitespace( char ) ){
            this.index++;

        // Error
        } else {
            throw new SyntaxError( '"' + char + '" is an invalid character' );
        }

        word = '';
    }

    return this.tokens;
};

/**
 * @function
 * @param {external:function} until A condition that when met will stop the reading of the buffer
 * @returns {external:string} The portion of the buffer read
 */
lexerPrototype.read = function( until ){
    var start = this.index,
        char;

    while( this.index < this.buffer.length ){
        char = this.buffer[ this.index ];

        if( until( char ) ){
            break;
        }

        this.index++;
    }

    return this.buffer.slice( start, this.index );
};

/**
 * @function
 * @returns {external:Object} A JSON representation of the lexer
 */
lexerPrototype.toJSON = function(){
    var json = new Null();

    json.buffer = this.buffer;
    json.tokens = this.tokens.map( function( token ){
        return token.toJSON();
    } );

    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the lexer
 */
lexerPrototype.toString = function(){
    return this.buffer;
};