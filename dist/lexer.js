(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.KeypathLexer = factory());
}(this, (function () { 'use strict';

/**
 * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
 * @class Null
 * @extends external:null
 */
function Null(){}
Null.prototype = Object.create( null );
Null.prototype.constructor =  Null;

var Identifier$1      = 'Identifier';
var NumericLiteral$1  = 'Numeric';
var NullLiteral$1     = 'Null';
var Punctuator$1      = 'Punctuator';
var StringLiteral$1   = 'String';

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
function Identifier$$1( value ){
    Token.call( this, Identifier$1, value );
}

Identifier$$1.prototype = Object.create( Token.prototype );

Identifier$$1.prototype.constructor = Identifier$$1;

/**
 * @class Lexer~NumericLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function NumericLiteral$$1( value ){
    Token.call( this, NumericLiteral$1, value );
}

NumericLiteral$$1.prototype = Object.create( Token.prototype );

NumericLiteral$$1.prototype.constructor = NumericLiteral$$1;

/**
 * @class Lexer~NullLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function NullLiteral$$1( value ){
    Token.call( this, NullLiteral$1, value );
}

NullLiteral$$1.prototype = Object.create( Token.prototype );

NullLiteral$$1.prototype.constructor = NullLiteral$$1;

/**
 * @class Lexer~Punctuator
 * @extends Lexer~Token
 * @param {external:string} value
 */
function Punctuator$$1( value ){
    Token.call( this, Punctuator$1, value );
}

Punctuator$$1.prototype = Object.create( Token.prototype );

Punctuator$$1.prototype.constructor = Punctuator$$1;

/**
 * @class Lexer~StringLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function StringLiteral$$1( value ){
    Token.call( this, StringLiteral$1, value );
}

StringLiteral$$1.prototype = Object.create( Token.prototype );

StringLiteral$$1.prototype.constructor = StringLiteral$$1;

var lexerPrototype;

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
    return char === '.' || char === '(' || char === ')' || char === '[' || char === ']' || char === '{' || char === '}' || char === ',' || char === '%' || char === '?' || char === ';' || char === '~';
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
 * @class Lexer
 * @extends Null
 */
function Lexer(){
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
        if( isIdentifier( char ) ){
            word = this.read( function( char ){
                return !isIdentifier( char ) && !isNumeric( char );
            } );

            token = word === 'null' ?
                new NullLiteral$$1( word ) :
                new Identifier$$1( word );
            this.tokens.push( token );

        // Punctuator
        } else if( isPunctuator( char ) ){
            token = new Punctuator$$1( char );
            this.tokens.push( token );

            this.index++;

        // Quoted String
        } else if( isQuote( char ) ){
            quote = char;

            this.index++;

            word = this.read( function( char ){
                return char === quote;
            } );

            token = new StringLiteral$$1( quote + word + quote );
            this.tokens.push( token );

            this.index++;

        // Numeric
        } else if( isNumeric( char ) ){
            word = this.read( function( char ){
                return !isNumeric( char );
            } );

            token = new NumericLiteral$$1( word );
            this.tokens.push( token );

        // Whitespace
        } else if( isWhitespace( char ) ){
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

return Lexer;

})));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VzIjpbIm51bGwuanMiLCJncmFtbWFyLmpzIiwidG9rZW4uanMiLCJsZXhlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBcImNsZWFuXCIsIGVtcHR5IGNvbnRhaW5lci4gSW5zdGFudGlhdGluZyB0aGlzIGlzIGZhc3RlciB0aGFuIGV4cGxpY2l0bHkgY2FsbGluZyBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYC5cbiAqIEBjbGFzcyBOdWxsXG4gKiBAZXh0ZW5kcyBleHRlcm5hbDpudWxsXG4gKi9cbmZ1bmN0aW9uIE51bGwoKXt9XG5OdWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbk51bGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIE51bGw7XG5cbmV4cG9ydCB7IE51bGwgYXMgZGVmYXVsdCB9OyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IHZhciBJZGVudGlmaWVyICAgICAgPSAnSWRlbnRpZmllcic7XG5leHBvcnQgdmFyIE51bWVyaWNMaXRlcmFsICA9ICdOdW1lcmljJztcbmV4cG9ydCB2YXIgTnVsbExpdGVyYWwgICAgID0gJ051bGwnO1xuZXhwb3J0IHZhciBQdW5jdHVhdG9yICAgICAgPSAnUHVuY3R1YXRvcic7XG5leHBvcnQgdmFyIFN0cmluZ0xpdGVyYWwgICA9ICdTdHJpbmcnOyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIEdyYW1tYXIgZnJvbSAnLi9ncmFtbWFyJztcblxudmFyIHRva2VuSWQgPSAwO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5Ub2tlblxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgdGhlIHRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSB0b2tlblxuICovXG5mdW5jdGlvbiBUb2tlbiggdHlwZSwgdmFsdWUgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IExleGVyflRva2VuI2lkXG4gICAgICovXG4gICAgdGhpcy5pZCA9ICsrdG9rZW5JZDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IExleGVyflRva2VuI3R5cGVcbiAgICAgKi9cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gTGV4ZXJ+VG9rZW4jdmFsdWVcbiAgICAgKi9cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cblRva2VuLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cblRva2VuLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRva2VuO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlblxuICovXG5Ub2tlbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnR5cGUgPSB0aGlzLnR5cGU7XG4gICAganNvbi52YWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xuVG9rZW4ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gU3RyaW5nKCB0aGlzLnZhbHVlICk7XG59O1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5JZGVudGlmaWVyXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJZGVudGlmaWVyKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuSWRlbnRpZmllciwgdmFsdWUgKTtcbn1cblxuSWRlbnRpZmllci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuSWRlbnRpZmllci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJZGVudGlmaWVyO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5OdW1lcmljTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTnVtZXJpY0xpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5OdW1lcmljTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bWVyaWNMaXRlcmFsO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5OdWxsTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTnVsbExpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5OdWxsTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuTnVsbExpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGxMaXRlcmFsO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5QdW5jdHVhdG9yXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQdW5jdHVhdG9yKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuUHVuY3R1YXRvciwgdmFsdWUgKTtcbn1cblxuUHVuY3R1YXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuUHVuY3R1YXRvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQdW5jdHVhdG9yO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5TdHJpbmdMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdHJpbmdMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdHJpbmdMaXRlcmFsOyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIFRva2VuIGZyb20gJy4vdG9rZW4nO1xuXG52YXIgbGV4ZXJQcm90b3R5cGU7XG5cbi8qKlxuICogQGZ1bmN0aW9uIExleGVyfmlzSWRlbnRpZmllclxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGNoYXJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgY2hhcmFjdGVyIGlzIGFuIGlkZW50aWZpZXIgY2hhcmFjdGVyXG4gKi9cbmZ1bmN0aW9uIGlzSWRlbnRpZmllciggY2hhciApe1xuICAgIHJldHVybiAnYScgPD0gY2hhciAmJiBjaGFyIDw9ICd6JyB8fCAnQScgPD0gY2hhciAmJiBjaGFyIDw9ICdaJyB8fCAnXycgPT09IGNoYXIgfHwgY2hhciA9PT0gJyQnO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBMZXhlcn5pc051bWVyaWNcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBjaGFyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGNoYXJhY3RlciBpcyBhIG51bWVyaWMgY2hhcmFjdGVyXG4gKi9cbmZ1bmN0aW9uIGlzTnVtZXJpYyggY2hhciApe1xuICAgIHJldHVybiAnMCcgPD0gY2hhciAmJiBjaGFyIDw9ICc5Jztcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gTGV4ZXJ+aXNQdW5jdHVhdG9yXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gY2hhclxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBjaGFyYWN0ZXIgaXMgYSBwdW5jdHVhdG9yIGNoYXJhY3RlclxuICovXG5mdW5jdGlvbiBpc1B1bmN0dWF0b3IoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJy4nIHx8IGNoYXIgPT09ICcoJyB8fCBjaGFyID09PSAnKScgfHwgY2hhciA9PT0gJ1snIHx8IGNoYXIgPT09ICddJyB8fCBjaGFyID09PSAneycgfHwgY2hhciA9PT0gJ30nIHx8IGNoYXIgPT09ICcsJyB8fCBjaGFyID09PSAnJScgfHwgY2hhciA9PT0gJz8nIHx8IGNoYXIgPT09ICc7JyB8fCBjaGFyID09PSAnfic7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIExleGVyfmlzUXVvdGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBjaGFyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGNoYXJhY3RlciBpcyBhIHF1b3RlIGNoYXJhY3RlclxuICovXG5mdW5jdGlvbiBpc1F1b3RlKCBjaGFyICl7XG4gICAgcmV0dXJuIGNoYXIgPT09ICdcIicgfHwgY2hhciA9PT0gXCInXCI7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIExleGVyfmlzV2hpdGVzcGFjZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGNoYXJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgY2hhcmFjdGVyIGlzIGEgd2hpdGVzcGFjZSBjaGFyYWN0ZXJcbiAqL1xuZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKCBjaGFyICl7XG4gICAgcmV0dXJuIGNoYXIgPT09ICcgJyB8fCBjaGFyID09PSAnXFxyJyB8fCBjaGFyID09PSAnXFx0JyB8fCBjaGFyID09PSAnXFxuJyB8fCBjaGFyID09PSAnXFx2JyB8fCBjaGFyID09PSAnXFx1MDBBMCc7XG59XG5cbi8qKlxuICogQGNsYXNzIExleGVyXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIExleGVyKCl7XG4gICAgdGhpcy5idWZmZXIgPSAnJztcbn1cblxubGV4ZXJQcm90b3R5cGUgPSBMZXhlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5sZXhlclByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExleGVyO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHRleHRcbiAqL1xubGV4ZXJQcm90b3R5cGUubGV4ID0gZnVuY3Rpb24oIHRleHQgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJydcbiAgICAgKi9cbiAgICB0aGlzLmJ1ZmZlciA9IHRleHQ7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuaW5kZXggPSAwO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PExleGVyflRva2VuPn1cbiAgICAgKi9cbiAgICB0aGlzLnRva2VucyA9IFtdO1xuXG4gICAgdmFyIGxlbmd0aCA9IHRoaXMuYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgd29yZCA9ICcnLFxuICAgICAgICBjaGFyLCB0b2tlbiwgcXVvdGU7XG5cbiAgICB3aGlsZSggdGhpcy5pbmRleCA8IGxlbmd0aCApe1xuICAgICAgICBjaGFyID0gdGhpcy5idWZmZXJbIHRoaXMuaW5kZXggXTtcblxuICAgICAgICAvLyBJZGVudGlmaWVyXG4gICAgICAgIGlmKCBpc0lkZW50aWZpZXIoIGNoYXIgKSApe1xuICAgICAgICAgICAgd29yZCA9IHRoaXMucmVhZCggZnVuY3Rpb24oIGNoYXIgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gIWlzSWRlbnRpZmllciggY2hhciApICYmICFpc051bWVyaWMoIGNoYXIgKTtcbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgdG9rZW4gPSB3b3JkID09PSAnbnVsbCcgP1xuICAgICAgICAgICAgICAgIG5ldyBUb2tlbi5OdWxsTGl0ZXJhbCggd29yZCApIDpcbiAgICAgICAgICAgICAgICBuZXcgVG9rZW4uSWRlbnRpZmllciggd29yZCApO1xuICAgICAgICAgICAgdGhpcy50b2tlbnMucHVzaCggdG9rZW4gKTtcblxuICAgICAgICAvLyBQdW5jdHVhdG9yXG4gICAgICAgIH0gZWxzZSBpZiggaXNQdW5jdHVhdG9yKCBjaGFyICkgKXtcbiAgICAgICAgICAgIHRva2VuID0gbmV3IFRva2VuLlB1bmN0dWF0b3IoIGNoYXIgKTtcbiAgICAgICAgICAgIHRoaXMudG9rZW5zLnB1c2goIHRva2VuICk7XG5cbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICAvLyBRdW90ZWQgU3RyaW5nXG4gICAgICAgIH0gZWxzZSBpZiggaXNRdW90ZSggY2hhciApICl7XG4gICAgICAgICAgICBxdW90ZSA9IGNoYXI7XG5cbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICAgICAgd29yZCA9IHRoaXMucmVhZCggZnVuY3Rpb24oIGNoYXIgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hhciA9PT0gcXVvdGU7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHRva2VuID0gbmV3IFRva2VuLlN0cmluZ0xpdGVyYWwoIHF1b3RlICsgd29yZCArIHF1b3RlICk7XG4gICAgICAgICAgICB0aGlzLnRva2Vucy5wdXNoKCB0b2tlbiApO1xuXG4gICAgICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgLy8gTnVtZXJpY1xuICAgICAgICB9IGVsc2UgaWYoIGlzTnVtZXJpYyggY2hhciApICl7XG4gICAgICAgICAgICB3b3JkID0gdGhpcy5yZWFkKCBmdW5jdGlvbiggY2hhciApe1xuICAgICAgICAgICAgICAgIHJldHVybiAhaXNOdW1lcmljKCBjaGFyICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHRva2VuID0gbmV3IFRva2VuLk51bWVyaWNMaXRlcmFsKCB3b3JkICk7XG4gICAgICAgICAgICB0aGlzLnRva2Vucy5wdXNoKCB0b2tlbiApO1xuXG4gICAgICAgIC8vIFdoaXRlc3BhY2VcbiAgICAgICAgfSBlbHNlIGlmKCBpc1doaXRlc3BhY2UoIGNoYXIgKSApe1xuICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgIC8vIEVycm9yXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoICdcIicgKyBjaGFyICsgJ1wiIGlzIGFuIGludmFsaWQgY2hhcmFjdGVyJyApO1xuICAgICAgICB9XG5cbiAgICAgICAgd29yZCA9ICcnO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRva2Vucztcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOmZ1bmN0aW9ufSB1bnRpbCBBIGNvbmRpdGlvbiB0aGF0IHdoZW4gbWV0IHdpbGwgc3RvcCB0aGUgcmVhZGluZyBvZiB0aGUgYnVmZmVyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBUaGUgcG9ydGlvbiBvZiB0aGUgYnVmZmVyIHJlYWRcbiAqL1xubGV4ZXJQcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uKCB1bnRpbCApe1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXgsXG4gICAgICAgIGNoYXI7XG5cbiAgICB3aGlsZSggdGhpcy5pbmRleCA8IHRoaXMuYnVmZmVyLmxlbmd0aCApe1xuICAgICAgICBjaGFyID0gdGhpcy5idWZmZXJbIHRoaXMuaW5kZXggXTtcblxuICAgICAgICBpZiggdW50aWwoIGNoYXIgKSApe1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLnNsaWNlKCBzdGFydCwgdGhpcy5pbmRleCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGV4ZXJcbiAqL1xubGV4ZXJQcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLmJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgIGpzb24udG9rZW5zID0gdGhpcy50b2tlbnMubWFwKCBmdW5jdGlvbiggdG9rZW4gKXtcbiAgICAgICAgcmV0dXJuIHRva2VuLnRvSlNPTigpO1xuICAgIH0gKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsZXhlclxuICovXG5sZXhlclByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyO1xufTsiXSwibmFtZXMiOlsiSWRlbnRpZmllciIsIk51bWVyaWNMaXRlcmFsIiwiTnVsbExpdGVyYWwiLCJQdW5jdHVhdG9yIiwiU3RyaW5nTGl0ZXJhbCIsIkdyYW1tYXIuSWRlbnRpZmllciIsIkdyYW1tYXIuTnVtZXJpY0xpdGVyYWwiLCJHcmFtbWFyLk51bGxMaXRlcmFsIiwiR3JhbW1hci5QdW5jdHVhdG9yIiwiR3JhbW1hci5TdHJpbmdMaXRlcmFsIiwiVG9rZW4uTnVsbExpdGVyYWwiLCJUb2tlbi5JZGVudGlmaWVyIiwiVG9rZW4uUHVuY3R1YXRvciIsIlRva2VuLlN0cmluZ0xpdGVyYWwiLCJUb2tlbi5OdW1lcmljTGl0ZXJhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUE7Ozs7O0FBS0EsU0FBUyxJQUFJLEVBQUUsRUFBRTtBQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDdkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLEFBRW5DOztBQ1RPLElBQUlBLFlBQVUsUUFBUSxZQUFZLENBQUM7QUFDMUMsQUFBTyxJQUFJQyxnQkFBYyxJQUFJLFNBQVMsQ0FBQztBQUN2QyxBQUFPLElBQUlDLGFBQVcsT0FBTyxNQUFNLENBQUM7QUFDcEMsQUFBTyxJQUFJQyxZQUFVLFFBQVEsWUFBWSxDQUFDO0FBQzFDLEFBQU8sSUFBSUMsZUFBYSxLQUFLLFFBQVE7O0FDRHJDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQzs7Ozs7Ozs7QUFRaEIsU0FBUyxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTs7OztJQUl6QixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDOzs7O0lBSXBCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDOzs7O0lBSWpCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0NBQ3RCOztBQUVELEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQzs7QUFFN0IsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFX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