'use strict';

import Null from './null';
import { default as Token, Identifier, Literal, Punctuator } from './lexer/token';

/**
 * @class LexerError
 * @extends SyntaxError
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
export default function Lexer(){
    this.buffer = '';
}

Lexer.prototype = new Null();

Lexer.prototype.constructor = Lexer;

Lexer.prototype.lex = function( text ){
    this.buffer = text;
    this.index = 0;
    this.tokens = [];
    
    const length = this.buffer.length;
    let word = '',
        char;
    
    while( this.index < length ){
        char = this.buffer[ this.index ];
        
        // Identifier
        if( this.isIdentifier( char ) ){
            word = this.read( function( char ){
                return !this.isIdentifier( char ) && !this.isNumeric( char );
            } );
            
            this.tokens.push( new Identifier( word ) );
        
        // Punctuator
        } else if( this.isPunctuator( char ) ){
            this.tokens.push( new Punctuator( char ) );
            this.index++;
        
        // Quoted String
        } else if( this.isQuote( char ) ){
            let quote = char;
            
            this.index++;
            
            word = this.read( function( char ){
                return char === quote;
            } );
            
            this.tokens.push( new Literal( `${ quote }${ word }${ quote }` ) );
            
            this.index++;
        
        // Numeric
        } else if( this.isNumeric( char ) ){
            word = this.read( function( char ){
                return !this.isNumeric( char );
            } );
            
            this.tokens.push( new Literal( word ) );
        
        // Whitespace
        } else if( this.isWhitespace( char ) ){
            this.index++;
        
        // Error
        } else {
            this.throwError( `"${ char }" is an invalid character` );
        }
        
        word = '';
    }
    
    return this.tokens;
};

Lexer.prototype.isIdentifier = function( char ){
    return 'a' <= char && char <= 'z' || 'A' <= char && char <= 'Z' || '_' === char || char === '$';
};

Lexer.prototype.isPunctuator = function( char ){
    return char === '.' || char === '(' || char === ')' || char === '[' || char === ']' || char === ',' || char === '%';
};

Lexer.prototype.isWhitespace = function( char ){
    return char === ' ' || char === '\r' || char === '\t' || char === '\n' || char === '\v' || char === '\u00A0';
};

Lexer.prototype.isQuote = function( char ){
    return char === '"' || char === "'";
};

Lexer.prototype.isNumeric = function( char ){
    return '0' <= char && char <= '9';
};

Lexer.prototype.read = function( until ){
    let start = this.index,
        char;
    
    while( this.index < this.buffer.length ){
        char = this.buffer[ this.index ];
        
        if( until.call( this, char ) ){
            break;
        }
        
        this.index++;
    }
    
    return this.buffer.slice( start, this.index );
};

Lexer.prototype.throwError = function( message ){
    throw new LexerError( message );
};

Lexer.prototype.toJSON = function(){
    let json = new Null();
    
    json.buffer = this.buffer;
    
    return json;
};
