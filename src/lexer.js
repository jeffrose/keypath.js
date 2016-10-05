'use strict';

import Null from './null';
import { Identifier, Literal, Punctuator } from './lexer/token';

/**
 * @function Lexer~isIdentifier
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is an identifier character
 */
function isIdentifier( char ){
    return 'a' <= char && char <= 'z' || 'A' <= char && char <= 'Z' || '_' === char || char === '$';
}

/**
 * @function Lexer~isNumeric
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is a numeric character
 */
function isNumeric( char ){
    return '0' <= char && char <= '9';
}

/**
 * @function Lexer~isPunctuator
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is a punctuator character
 */
function isPunctuator( char ){
    return char === '.' || char === '(' || char === ')' || char === '[' || char === ']' || char === ',' || char === '%';
}

/**
 * @function Lexer~isQuote
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is a quote character
 */
function isQuote( char ){
    return char === '"' || char === "'";
}

/**
 * @function Lexer~isWhitespace
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is a whitespace character
 */
function isWhitespace( char ){
    return char === ' ' || char === '\r' || char === '\t' || char === '\n' || char === '\v' || char === '\u00A0';
}

/**
 * @class Lexer~LexerError
 * @extends external:SyntaxError
 * @param {external:string} message The error message
 */
function LexerError( message ){
    SyntaxError.call( this, message );    
}

LexerError.prototype = Object.create( SyntaxError.prototype );

/**
 * @class Lexer
 * @extends Null
 */
function Lexer(){
    this.buffer = '';
}

Lexer.prototype = new Null();

Lexer.prototype.constructor = Lexer;

/**
 * @function
 * @param {external:string} text
 */
Lexer.prototype.lex = function( text ){
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
        char, quote;
    
    while( this.index < length ){
        char = this.buffer[ this.index ];
        
        // Identifier
        if( isIdentifier( char ) ){
            word = this.read( function( char ){
                return !isIdentifier( char ) && !isNumeric( char );
            } );
            
            this.tokens.push( new Identifier( word ) );
        
        // Punctuator
        } else if( isPunctuator( char ) ){
            this.tokens.push( new Punctuator( char ) );
            this.index++;
        
        // Quoted String
        } else if( isQuote( char ) ){
            quote = char;
            
            this.index++;
            
            word = this.read( function( char ){
                return char === quote;
            } );
            
            this.tokens.push( new Literal( quote + word + quote ) );
            
            this.index++;
        
        // Numeric
        } else if( isNumeric( char ) ){
            word = this.read( function( char ){
                return !isNumeric( char );
            } );
            
            this.tokens.push( new Literal( word ) );
        
        // Whitespace
        } else if( isWhitespace( char ) ){
            this.index++;
        
        // Error
        } else {
            this.throwError( '"' + char + '" is an invalid character' );
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
Lexer.prototype.read = function( until ){
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
 * @throws {Lexer~LexerError} When it executes
 */
Lexer.prototype.throwError = function( message ){
    throw new LexerError( message );
};

/**
 * @function
 * @returns {external:Object} A JSON representation of the lexer
 */
Lexer.prototype.toJSON = function(){
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
Lexer.prototype.toString = function(){
    return this.buffer;
};

export { Lexer as default };