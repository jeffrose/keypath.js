'use strict';

import { default as Null } from './null';

function Token( type, value ){
    if( typeof type !== 'string' ){
        throw new TypeError( 'type must be a string' );
    }
    
    if( typeof value === 'undefined' ){
        throw new TypeError( 'value cannot be undefined' );
    }
    
    Object.defineProperties( this, {
        type: {
            value: type,
            configurable: false,
            enumerable: true,
            writable: false
        },
        value: {
            value: value,
            configurable: false,
            enumerable: true,
            writable: false
        },
        length: {
            value: value.length,
            configurable: false,
            enumerable: false,
            writable: false
        }
    } );
}

Token.prototype = new Null();

Token.prototype.constructor = Token;

Token.prototype.is = function( type ){
    return this.type === type;
};

Token.prototype.toJSON = function(){
    var json = Object.create( null );
    
    json.type = this.type;
    json.value = this.value;
    
    return json;
};

Token.prototype.toString = function(){
    return String( this.value );
};

Token.prototype.valueOf = function(){
    return this.value;
};

function Keyword( value ){
    Token.call( this, 'keyword', value );
}

Keyword.prototype = Object.create( Token.prototype );

Keyword.prototype.constructor = Keyword;

function Identifier( value ){
    Token.call( this, 'identifier', value );
}

Identifier.prototype = Object.create( Token.prototype );

Identifier.prototype.constructor = Identifier;

function Literal( value ){
    Token.call( this, 'literal', value );
}

Literal.prototype = Object.create( Token.prototype );

Literal.prototype.constructor = Literal;

function Numeric( value ){
    Token.call( this, 'numeric', value );
}

Numeric.prototype = Object.create( Token.prototype );

Numeric.prototype.constructor = Numeric;

function Punctuator( value ){
    Token.call( this, 'punctuator', value );
}

Punctuator.prototype = Object.create( Token.prototype );

Punctuator.prototype.constructor = Punctuator;

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
    
    var length = this.buffer.length,
    
        word = '';
    
    while( this.index < length ){
        let char = this.buffer[ this.index ];
        
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
    var start = this.index;
    
    while( this.index < this.buffer.length ){
        let char = this.buffer[ this.index ];
        
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
