(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Tokens = factory());
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
 * @typedef {external:Function} MapCallback
 * @param {*} item
 * @param {external:number} index
 */

/**
 * @function
 * @param {Array-Like} list
 * @param {MapCallback} callback
 */
function map( list, callback ){
    var index = 0,
        length = list.length,
        result = new Array( length );

    for( ; index < length; index++ ){
        result[ index ] = callback( list[ index ], index, list );
    }

    return result;
}

function isIdentifierPart( char ){
    return isIdentifierStart( char ) || isNumeric( char );
}

function isIdentifierStart( char ){
    return 'a' <= char && char <= 'z' || 'A' <= char && char <= 'Z' || '_' === char || char === '$';
}

function isNumeric( char ){
    return '0' <= char && char <= '9';
}

function isPunctuator( char ){
    return '.,?()[]{}%~;'.indexOf( char ) !== -1;
}

function isQuote( char ){
    return char === '"' || char === "'";
}

function isWhitespace( char ){
    return char === ' ' || char === '\r' || char === '\t' || char === '\n' || char === '\v' || char === '\u00A0';
}

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

var tokensPrototype;

function scan( text, start, until ){
    var end = start,
        length = text.length,
        char;

    while( end < length ){
        char = text[ end ];
        if( until( char ) ){
            break;
        }
        end++;
    }

    return text.slice( start, end );
}

function tokenize( text, list ){
    var index = 0,
        length = text.length,
        word = '',
        char, token, quote;

    while( index < length ){
        char = text[ index ];

        // Identifier
        if( isIdentifierStart( char ) ){
            word = scan( text, index, function( char ){
                return !isIdentifierPart( char );
            } );
            index += word.length;
            token = word === 'null' ?
                new NullLiteral$$1( word ) :
                new Identifier$$1( word );

        // Punctuator
        } else if( isPunctuator( char ) ){
            word = '';
            token = new Punctuator$$1( char );
            index += 1;

        // Quoted String
        } else if( isQuote( char ) ){
            quote = char;
            index += 1;
            word = scan( text, index, function( char ){
                return char === quote;
            } );
            index += word.length;
            token = new StringLiteral$$1( quote + word + quote );
            index += 1;

        // Numeric
        } else if( isNumeric( char ) ){
            word = scan( text, index, function( char ){
                return !isNumeric( char );
            } );
            index += word.length;
            token = new NumericLiteral$$1( word );

        // Whitespace
        } else if( isWhitespace( char ) ){
            word = '';
            index += 1;

        // Error
        } else {
            throw new SyntaxError( '"' + char + '" is an invalid character' );
        }

        if( token ){
            list[ list.length++ ] = token;
            token = void 0;
        }
    }
}

/**
 * @class Tokens
 * @extends Null
 */
function Tokens( text ){
    /**
     * @member {external:string}
     */
    this.source = text;
    /**
     * @member {external:number}
     */
    this.length = 0;

    tokenize( text, this );
}

tokensPrototype = Tokens.prototype = new Null();

tokensPrototype.constructor = Tokens;

/**
 * @function
 * @returns {external:Object} A JSON representation of the tokens
 */
tokensPrototype.toJSON = function(){
    var json = new Null();

    json = map( this, function( token ){
        return token.toJSON();
    } );
    json.source = this.source;

    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the tokens
 */
tokensPrototype.toString = function(){
    return this.source;
};

return Tokens;

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5zLmpzIiwic291cmNlcyI6WyJudWxsLmpzIiwibWFwLmpzIiwiY2hhcmFjdGVyLmpzIiwiZ3JhbW1hci5qcyIsInRva2VuLmpzIiwidG9rZW5zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQSBcImNsZWFuXCIsIGVtcHR5IGNvbnRhaW5lci4gSW5zdGFudGlhdGluZyB0aGlzIGlzIGZhc3RlciB0aGFuIGV4cGxpY2l0bHkgY2FsbGluZyBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYC5cbiAqIEBjbGFzcyBOdWxsXG4gKiBAZXh0ZW5kcyBleHRlcm5hbDpudWxsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE51bGwoKXt9XG5OdWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbk51bGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIE51bGw7IiwiLyoqXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6RnVuY3Rpb259IE1hcENhbGxiYWNrXG4gKiBAcGFyYW0geyp9IGl0ZW1cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxuICovXG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0FycmF5LUxpa2V9IGxpc3RcbiAqIEBwYXJhbSB7TWFwQ2FsbGJhY2t9IGNhbGxiYWNrXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1hcCggbGlzdCwgY2FsbGJhY2sgKXtcbiAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICBsZW5ndGggPSBsaXN0Lmxlbmd0aCxcbiAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBsZW5ndGggKTtcblxuICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xuICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBjYWxsYmFjayggbGlzdFsgaW5kZXggXSwgaW5kZXgsIGxpc3QgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufSIsImV4cG9ydCBmdW5jdGlvbiBpc0lkZW50aWZpZXJQYXJ0KCBjaGFyICl7XG4gICAgcmV0dXJuIGlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICkgfHwgaXNOdW1lcmljKCBjaGFyICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0lkZW50aWZpZXJTdGFydCggY2hhciApe1xuICAgIHJldHVybiAnYScgPD0gY2hhciAmJiBjaGFyIDw9ICd6JyB8fCAnQScgPD0gY2hhciAmJiBjaGFyIDw9ICdaJyB8fCAnXycgPT09IGNoYXIgfHwgY2hhciA9PT0gJyQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1lcmljKCBjaGFyICl7XG4gICAgcmV0dXJuICcwJyA8PSBjaGFyICYmIGNoYXIgPD0gJzknO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQdW5jdHVhdG9yKCBjaGFyICl7XG4gICAgcmV0dXJuICcuLD8oKVtde30lfjsnLmluZGV4T2YoIGNoYXIgKSAhPT0gLTE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1F1b3RlKCBjaGFyICl7XG4gICAgcmV0dXJuIGNoYXIgPT09ICdcIicgfHwgY2hhciA9PT0gXCInXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1doaXRlc3BhY2UoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJyAnIHx8IGNoYXIgPT09ICdcXHInIHx8IGNoYXIgPT09ICdcXHQnIHx8IGNoYXIgPT09ICdcXG4nIHx8IGNoYXIgPT09ICdcXHYnIHx8IGNoYXIgPT09ICdcXHUwMEEwJztcbn0iLCJleHBvcnQgdmFyIElkZW50aWZpZXIgICAgICA9ICdJZGVudGlmaWVyJztcbmV4cG9ydCB2YXIgTnVtZXJpY0xpdGVyYWwgID0gJ051bWVyaWMnO1xuZXhwb3J0IHZhciBOdWxsTGl0ZXJhbCAgICAgPSAnTnVsbCc7XG5leHBvcnQgdmFyIFB1bmN0dWF0b3IgICAgICA9ICdQdW5jdHVhdG9yJztcbmV4cG9ydCB2YXIgU3RyaW5nTGl0ZXJhbCAgID0gJ1N0cmluZyc7IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIEdyYW1tYXIgZnJvbSAnLi9ncmFtbWFyJztcblxudmFyIHRva2VuSWQgPSAwO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5Ub2tlblxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgdGhlIHRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSB0b2tlblxuICovXG5mdW5jdGlvbiBUb2tlbiggdHlwZSwgdmFsdWUgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IExleGVyflRva2VuI2lkXG4gICAgICovXG4gICAgdGhpcy5pZCA9ICsrdG9rZW5JZDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IExleGVyflRva2VuI3R5cGVcbiAgICAgKi9cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gTGV4ZXJ+VG9rZW4jdmFsdWVcbiAgICAgKi9cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cblRva2VuLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cblRva2VuLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRva2VuO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlblxuICovXG5Ub2tlbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnR5cGUgPSB0aGlzLnR5cGU7XG4gICAganNvbi52YWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xuVG9rZW4ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gU3RyaW5nKCB0aGlzLnZhbHVlICk7XG59O1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5JZGVudGlmaWVyXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJZGVudGlmaWVyKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuSWRlbnRpZmllciwgdmFsdWUgKTtcbn1cblxuSWRlbnRpZmllci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuSWRlbnRpZmllci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJZGVudGlmaWVyO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5OdW1lcmljTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTnVtZXJpY0xpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5OdW1lcmljTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bWVyaWNMaXRlcmFsO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5OdWxsTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTnVsbExpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5OdWxsTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuTnVsbExpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGxMaXRlcmFsO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5QdW5jdHVhdG9yXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQdW5jdHVhdG9yKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuUHVuY3R1YXRvciwgdmFsdWUgKTtcbn1cblxuUHVuY3R1YXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuUHVuY3R1YXRvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQdW5jdHVhdG9yO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5TdHJpbmdMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdHJpbmdMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdHJpbmdMaXRlcmFsOyIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgbWFwIGZyb20gJy4vbWFwJztcbmltcG9ydCAqIGFzIENoYXJhY3RlciBmcm9tICcuL2NoYXJhY3Rlcic7XG5pbXBvcnQgKiBhcyBUb2tlbiBmcm9tICcuL3Rva2VuJztcblxudmFyIHRva2Vuc1Byb3RvdHlwZTtcblxuZnVuY3Rpb24gc2NhbiggdGV4dCwgc3RhcnQsIHVudGlsICl7XG4gICAgdmFyIGVuZCA9IHN0YXJ0LFxuICAgICAgICBsZW5ndGggPSB0ZXh0Lmxlbmd0aCxcbiAgICAgICAgY2hhcjtcblxuICAgIHdoaWxlKCBlbmQgPCBsZW5ndGggKXtcbiAgICAgICAgY2hhciA9IHRleHRbIGVuZCBdO1xuICAgICAgICBpZiggdW50aWwoIGNoYXIgKSApe1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZW5kKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRleHQuc2xpY2UoIHN0YXJ0LCBlbmQgKTtcbn1cblxuZnVuY3Rpb24gdG9rZW5pemUoIHRleHQsIGxpc3QgKXtcbiAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICBsZW5ndGggPSB0ZXh0Lmxlbmd0aCxcbiAgICAgICAgd29yZCA9ICcnLFxuICAgICAgICBjaGFyLCB0b2tlbiwgcXVvdGU7XG5cbiAgICB3aGlsZSggaW5kZXggPCBsZW5ndGggKXtcbiAgICAgICAgY2hhciA9IHRleHRbIGluZGV4IF07XG5cbiAgICAgICAgLy8gSWRlbnRpZmllclxuICAgICAgICBpZiggQ2hhcmFjdGVyLmlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICkgKXtcbiAgICAgICAgICAgIHdvcmQgPSBzY2FuKCB0ZXh0LCBpbmRleCwgZnVuY3Rpb24oIGNoYXIgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gIUNoYXJhY3Rlci5pc0lkZW50aWZpZXJQYXJ0KCBjaGFyICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICBpbmRleCArPSB3b3JkLmxlbmd0aDtcbiAgICAgICAgICAgIHRva2VuID0gd29yZCA9PT0gJ251bGwnID9cbiAgICAgICAgICAgICAgICBuZXcgVG9rZW4uTnVsbExpdGVyYWwoIHdvcmQgKSA6XG4gICAgICAgICAgICAgICAgbmV3IFRva2VuLklkZW50aWZpZXIoIHdvcmQgKTtcblxuICAgICAgICAvLyBQdW5jdHVhdG9yXG4gICAgICAgIH0gZWxzZSBpZiggQ2hhcmFjdGVyLmlzUHVuY3R1YXRvciggY2hhciApICl7XG4gICAgICAgICAgICB3b3JkID0gJyc7XG4gICAgICAgICAgICB0b2tlbiA9IG5ldyBUb2tlbi5QdW5jdHVhdG9yKCBjaGFyICk7XG4gICAgICAgICAgICBpbmRleCArPSAxO1xuXG4gICAgICAgIC8vIFF1b3RlZCBTdHJpbmdcbiAgICAgICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNRdW90ZSggY2hhciApICl7XG4gICAgICAgICAgICBxdW90ZSA9IGNoYXI7XG4gICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICAgICAgd29yZCA9IHNjYW4oIHRleHQsIGluZGV4LCBmdW5jdGlvbiggY2hhciApe1xuICAgICAgICAgICAgICAgIHJldHVybiBjaGFyID09PSBxdW90ZTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIGluZGV4ICs9IHdvcmQubGVuZ3RoO1xuICAgICAgICAgICAgdG9rZW4gPSBuZXcgVG9rZW4uU3RyaW5nTGl0ZXJhbCggcXVvdGUgKyB3b3JkICsgcXVvdGUgKTtcbiAgICAgICAgICAgIGluZGV4ICs9IDE7XG5cbiAgICAgICAgLy8gTnVtZXJpY1xuICAgICAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc051bWVyaWMoIGNoYXIgKSApe1xuICAgICAgICAgICAgd29yZCA9IHNjYW4oIHRleHQsIGluZGV4LCBmdW5jdGlvbiggY2hhciApe1xuICAgICAgICAgICAgICAgIHJldHVybiAhQ2hhcmFjdGVyLmlzTnVtZXJpYyggY2hhciApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgaW5kZXggKz0gd29yZC5sZW5ndGg7XG4gICAgICAgICAgICB0b2tlbiA9IG5ldyBUb2tlbi5OdW1lcmljTGl0ZXJhbCggd29yZCApO1xuXG4gICAgICAgIC8vIFdoaXRlc3BhY2VcbiAgICAgICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNXaGl0ZXNwYWNlKCBjaGFyICkgKXtcbiAgICAgICAgICAgIHdvcmQgPSAnJztcbiAgICAgICAgICAgIGluZGV4ICs9IDE7XG5cbiAgICAgICAgLy8gRXJyb3JcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggJ1wiJyArIGNoYXIgKyAnXCIgaXMgYW4gaW52YWxpZCBjaGFyYWN0ZXInICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiggdG9rZW4gKXtcbiAgICAgICAgICAgIGxpc3RbIGxpc3QubGVuZ3RoKysgXSA9IHRva2VuO1xuICAgICAgICAgICAgdG9rZW4gPSB2b2lkIDA7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQGNsYXNzIFRva2Vuc1xuICogQGV4dGVuZHMgTnVsbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBUb2tlbnMoIHRleHQgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5zb3VyY2UgPSB0ZXh0O1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxlbmd0aCA9IDA7XG5cbiAgICB0b2tlbml6ZSggdGV4dCwgdGhpcyApO1xufVxuXG50b2tlbnNQcm90b3R5cGUgPSBUb2tlbnMucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxudG9rZW5zUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVG9rZW5zO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlbnNcbiAqL1xudG9rZW5zUHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbiA9IG1hcCggdGhpcywgZnVuY3Rpb24oIHRva2VuICl7XG4gICAgICAgIHJldHVybiB0b2tlbi50b0pTT04oKTtcbiAgICB9ICk7XG4gICAganNvbi5zb3VyY2UgPSB0aGlzLnNvdXJjZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlbnNcbiAqL1xudG9rZW5zUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2U7XG59OyJdLCJuYW1lcyI6WyJJZGVudGlmaWVyIiwiTnVtZXJpY0xpdGVyYWwiLCJOdWxsTGl0ZXJhbCIsIlB1bmN0dWF0b3IiLCJTdHJpbmdMaXRlcmFsIiwiR3JhbW1hci5JZGVudGlmaWVyIiwiR3JhbW1hci5OdW1lcmljTGl0ZXJhbCIsIkdyYW1tYXIuTnVsbExpdGVyYWwiLCJHcmFtbWFyLlB1bmN0dWF0b3IiLCJHcmFtbWFyLlN0cmluZ0xpdGVyYWwiLCJDaGFyYWN0ZXIuaXNJZGVudGlmaWVyU3RhcnQiLCJDaGFyYWN0ZXIuaXNJZGVudGlmaWVyUGFydCIsIlRva2VuLk51bGxMaXRlcmFsIiwiVG9rZW4uSWRlbnRpZmllciIsIkNoYXJhY3Rlci5pc1B1bmN0dWF0b3IiLCJUb2tlbi5QdW5jdHVhdG9yIiwiQ2hhcmFjdGVyLmlzUXVvdGUiLCJUb2tlbi5TdHJpbmdMaXRlcmFsIiwiQ2hhcmFjdGVyLmlzTnVtZXJpYyIsIlRva2VuLk51bWVyaWNMaXRlcmFsIiwiQ2hhcmFjdGVyLmlzV2hpdGVzcGFjZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7O0FBS0EsQUFBZSxTQUFTLElBQUksRUFBRSxFQUFFO0FBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsSUFBSSxJQUFJOztBQ1Bs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
