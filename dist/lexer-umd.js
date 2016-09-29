(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Lexer = factory());
}(this, (function () { 'use strict';

/**
 * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
 * @class Null
 * @extends external:null
 */
function Null(){}
Null.prototype = Object.create( null );
Null.prototype.constructor =  Null;

let id = 0;

function nextId(){
    return ++id;
}

/**
 * @class Token
 * @extends Null
 * @param {external:string} type The type of the token
 * @param {*} value The value of the token
 * @throws {external:TypeError} If `type` is not a string
 * @throws {external:TypeError} If `value` is undefined.
 */
function Token( type, value ){
    if( typeof type !== 'string' ){
        throw new TypeError( 'type must be a string' );
    }
    
    if( typeof value === 'undefined' ){
        throw new TypeError( 'value cannot be undefined' );
    }
    
    this.id = nextId();
    this.type = type;
    this.value = value;
    this.length = value.length;
}

Token.prototype = new Null();

Token.prototype.constructor = Token;

Token.prototype.equals = function( token ){
    return token instanceof Token && this.valueOf() === token.valueOf();
};

/**
 * @function
 * @param {external:string} type
 * @returns {external:boolean} Whether or not the token is the `type` provided.
 */
Token.prototype.is = function( type ){
    return this.type === type;
};

Token.prototype.toJSON = function(){
    var json = new Null();
    
    json.type = this.type;
    json.value = this.value;
    
    return json;
};

Token.prototype.toString = function(){
    return String( this.value );
};

Token.prototype.valueOf = function(){
    return this.id;
};

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

function Punctuator( value ){
    Token.call( this, 'punctuator', value );
}

Punctuator.prototype = Object.create( Token.prototype );

Punctuator.prototype.constructor = Punctuator;

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
function Lexer(){
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
    const json = new Null();
    
    json.buffer = this.buffer;
    json.tokens = this.tokens.map( function( token ){
        return token.toJSON();
    } );
    
    return json;
};

return Lexer;

})));

//# sourceMappingURL=lexer-umd.js.map