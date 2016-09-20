'use strict';

import Null from './null';
import { Identifier, Literal, Numeric, Punctuator } from './lexer/token';

function LexerError( message ){
    SyntaxError.call( this, message );    
}

LexerError.prototype = Object.create( SyntaxError.prototype );

export default function Lexer(){
    this.buffer = '';
}

Lexer.prototype = new Null();

Lexer.prototype.constructor = Lexer;

Lexer.prototype.lex = function( text ){
    this.buffer = text;
    this.index = 0;
    this.tokens = [];
    
    let length = this.buffer.length,
        word = '',
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
        
        // Literal
        } else if( char === '"' ){
            this.index++;
            
            word = this.read( function( char ){
                return char === '"';
            } );
            
            this.tokens.push( new Literal( word ) );
            
            this.index++;
        
        // Numeric
        } else if( this.isNumeric( char ) ){
            word = this.read( function( char ){
                return !this.isNumeric( char );
            } );
            
            this.tokens.push( new Numeric( word ) );
        
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

Lexer.prototype.isNumeric = function( char ){
    return ( '0' <= char && char <= '9' ) && typeof char === 'string';
};

Lexer.prototype.peek = function( number ){
    return this.index + number < this.buffer.length ?
        this.buffer[ this.index + number ] :
        undefined;
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
