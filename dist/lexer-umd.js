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

/**
 * @namespace Lexer~Grammar
 */
var Grammar = new Null();

Grammar.Identifier      = 'Identifier';
Grammar.NumericLiteral  = 'Numeric';
Grammar.NullLiteral     = 'Null';
Grammar.Punctuator      = 'Punctuator';
Grammar.StringLiteral   = 'String';

var tokenId = 0;

/**
 * @class Lexer~Token
 * @extends Null
 * @param {external:string} type The type of the token
 * @param {external:string} value The value of the token
 */
function Token( type, value ){
    /**
     * @member {external:number} Lexer~Token#id
     */
    this.id = ++tokenId;
    /**
     * @member {external:string} Lexer~Token#type
     */
    this.type = type;
    /**
     * @member {external:string} Lexer~Token#value
     */
    this.value = value;
}

Token.prototype = new Null();

Token.prototype.constructor = Token;

/**
 * @function
 * @returns {external:Object} A JSON representation of the token
 */
Token.prototype.toJSON = function(){
    var json = new Null();
    
    json.type = this.type;
    json.value = this.value;
    
    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the token
 */
Token.prototype.toString = function(){
    return String( this.value );
};

/**
 * @class Lexer~Identifier
 * @extends Lexer~Token
 * @param {external:string} value
 */
function Identifier( value ){
    Token.call( this, Grammar.Identifier, value );
}

Identifier.prototype = Object.create( Token.prototype );

Identifier.prototype.constructor = Identifier;

/**
 * @class Lexer~NumericLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function NumericLiteral( value ){
    Token.call( this, Grammar.NumericLiteral, value );
}

NumericLiteral.prototype = Object.create( Token.prototype );

NumericLiteral.prototype.constructor = NumericLiteral;

/**
 * @class Lexer~NullLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function NullLiteral( value ){
    Token.call( this, Grammar.NullLiteral, value );
}

NullLiteral.prototype = Object.create( Token.prototype );

NullLiteral.prototype.constructor = NullLiteral;

/**
 * @class Lexer~Punctuator
 * @extends Lexer~Token
 * @param {external:string} value
 */
function Punctuator( value ){
    Token.call( this, Grammar.Punctuator, value );
}

Punctuator.prototype = Object.create( Token.prototype );

Punctuator.prototype.constructor = Punctuator;

/**
 * @class Lexer~StringLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function StringLiteral( value ){
    Token.call( this, Grammar.StringLiteral, value );
}

StringLiteral.prototype = Object.create( Token.prototype );

StringLiteral.prototype.constructor = StringLiteral;

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
    return char === '.' || char === '(' || char === ')' || char === '[' || char === ']' || char === '{' || char === '}' || char === ',' || char === '%';
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
            
            word === 'null' ?
                this.tokens.push( new NullLiteral( word ) ) :
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
            
            this.tokens.push( new StringLiteral( quote + word + quote ) );
            
            this.index++;
        
        // Numeric
        } else if( isNumeric( char ) ){
            word = this.read( function( char ){
                return !isNumeric( char );
            } );
            
            this.tokens.push( new NumericLiteral( word ) );
        
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

return Lexer;

})));

//# sourceMappingURL=lexer-umd.js.map