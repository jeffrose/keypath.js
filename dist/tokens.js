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
    var length = list.length,
        index, result;

    switch( length ){
        case 1:
            return [ callback( list[ 0 ], 0, list ) ];
        case 2:
            return [ callback( list[ 0 ], 0, list ), callback( list[ 1 ], 1, list ) ];
        case 3:
            return [ callback( list[ 0 ], 0, list ), callback( list[ 1 ], 1, list ), callback( list[ 2 ], 2, list ) ];
        default:
            index = 0;
            result = new Array( length );
            for( ; index < length; index++ ){
                result[ index ] = callback( list[ index ], index, list );
            }
    }

    return result;
}

function isDoubleQuote( char ){
    return char === '"';
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
    return isDoubleQuote( char ) || isSingleQuote( char );
}

function isSingleQuote( char ){
    return char === "'";
}

function isWhitespace( char ){
    return char === ' ' || char === '\r' || char === '\t' || char === '\n' || char === '\v' || char === '\u00A0';
}

var EndOfLine$1       = 'EndOfLine';
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

function EndOfLine$$1(){
    Token.call( this, EndOfLine$1, '' );
}

EndOfLine$$1.prototype = Object.create( Token.prototype );

EndOfLine$$1.prototype.constructor = EndOfLine$$1;

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

var scannerPrototype;

function isNotIdentifier( char ){
    return !isIdentifierPart( char );
}

function isNotNumeric( char ){
    return !isNumeric( char );
}

function Scanner( text ){
    /**
     * @member {external:string}
     * @default ''
     */
    this.source = text;
    /**
     * @member {external:number}
     */
    this.index = 0;
    /**
     * @member {external:number}
     */
    this.length = text.length;
}

scannerPrototype = Scanner.prototype = new Null();

scannerPrototype.constructor = Scanner;

scannerPrototype.eol = function(){
    return this.index >= this.length;
};

scannerPrototype.lex = function(){
    if( this.eol() ){
        return new EndOfLine$$1();
    }

    var char = this.source[ this.index ],
        word;

    // Identifier
    if( isIdentifierStart( char ) ){
        word = this.scan( isNotIdentifier );

        return word === 'null' ?
            new NullLiteral$$1( word ) :
            new Identifier$$1( word );

    // Punctuator
    } else if( isPunctuator( char ) ){
        this.index++;
        return new Punctuator$$1( char );

    // Quoted String
    } else if( isQuote( char ) ){
        this.index++;

        word = isDoubleQuote( char ) ?
            this.scan( isDoubleQuote ) :
            this.scan( isSingleQuote );

        this.index++;

        return new StringLiteral$$1( char + word + char );

    // Numeric
    } else if( isNumeric( char ) ){
        word = this.scan( isNotNumeric );

        return new NumericLiteral$$1( word );

    // Whitespace
    } else if( isWhitespace( char ) ){
        this.index++;

    // Error
    } else {
        throw new SyntaxError( '"' + char + '" is an invalid character' );
    }
};

/**
 * @function
 * @param {external:function} until A condition that when met will stop the scanning of the source
 * @returns {external:string} The portion of the source scanned
 */
scannerPrototype.scan = function( until ){
    var start = this.index,
        char;

    while( !this.eol() ){
        char = this.source[ this.index ];

        if( until( char ) ){
            break;
        }

        this.index++;
    }

    return this.source.slice( start, this.index );
};

/**
 * @function
 * @returns {external:Object} A JSON representation of the scanner
 */
scannerPrototype.toJSON = function(){
    var json = new Null();

    json.source = this.source;
    json.index  = this.index;
    json.length = this.length;

    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the scanner
 */
scannerPrototype.toString = function(){
    return this.source;
};

function toJSON( value ){
    return value.toJSON();
}

var tokensPrototype;

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

    var scanner = new Scanner( text ),
        token;

    while( !scanner.eol() ){
        token = scanner.lex();
        if( token ){
            this[ this.length++ ] = token;
        }
    }
}

tokensPrototype = Tokens.prototype = new Null();

tokensPrototype.constructor = Tokens;

/**
 * @function
 * @returns {external:Object} A JSON representation of the tokens
 */
tokensPrototype.toJSON = function(){
    var json = new Null();

    json = map( this, toJSON );
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5zLmpzIiwic291cmNlcyI6WyJudWxsLmpzIiwibWFwLmpzIiwiY2hhcmFjdGVyLmpzIiwiZ3JhbW1hci5qcyIsInRva2VuLmpzIiwic2Nhbm5lci5qcyIsInRvLWpzb24uanMiLCJ0b2tlbnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBIFwiY2xlYW5cIiwgZW1wdHkgY29udGFpbmVyLiBJbnN0YW50aWF0aW5nIHRoaXMgaXMgZmFzdGVyIHRoYW4gZXhwbGljaXRseSBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKCBudWxsIClgLlxuICogQGNsYXNzIE51bGxcbiAqIEBleHRlbmRzIGV4dGVybmFsOm51bGxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTnVsbCgpe31cbk51bGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuTnVsbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgTnVsbDsiLCIvKipcbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpGdW5jdGlvbn0gTWFwQ2FsbGJhY2tcbiAqIEBwYXJhbSB7Kn0gaXRlbVxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4XG4gKi9cblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXktTGlrZX0gbGlzdFxuICogQHBhcmFtIHtNYXBDYWxsYmFja30gY2FsbGJhY2tcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWFwKCBsaXN0LCBjYWxsYmFjayApe1xuICAgIHZhciBsZW5ndGggPSBsaXN0Lmxlbmd0aCxcbiAgICAgICAgaW5kZXgsIHJlc3VsdDtcblxuICAgIHN3aXRjaCggbGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJldHVybiBbIGNhbGxiYWNrKCBsaXN0WyAwIF0sIDAsIGxpc3QgKSBdO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gWyBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICksIGNhbGxiYWNrKCBsaXN0WyAxIF0sIDEsIGxpc3QgKSBdO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gWyBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICksIGNhbGxiYWNrKCBsaXN0WyAxIF0sIDEsIGxpc3QgKSwgY2FsbGJhY2soIGxpc3RbIDIgXSwgMiwgbGlzdCApIF07XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGxlbmd0aCApO1xuICAgICAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gY2FsbGJhY2soIGxpc3RbIGluZGV4IF0sIGluZGV4LCBsaXN0ICk7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn0iLCJleHBvcnQgZnVuY3Rpb24gaXNEb3VibGVRdW90ZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSAnXCInO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJZGVudGlmaWVyUGFydCggY2hhciApe1xuICAgIHJldHVybiBpc0lkZW50aWZpZXJTdGFydCggY2hhciApIHx8IGlzTnVtZXJpYyggY2hhciApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJZGVudGlmaWVyU3RhcnQoIGNoYXIgKXtcbiAgICByZXR1cm4gJ2EnIDw9IGNoYXIgJiYgY2hhciA8PSAneicgfHwgJ0EnIDw9IGNoYXIgJiYgY2hhciA8PSAnWicgfHwgJ18nID09PSBjaGFyIHx8IGNoYXIgPT09ICckJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtZXJpYyggY2hhciApe1xuICAgIHJldHVybiAnMCcgPD0gY2hhciAmJiBjaGFyIDw9ICc5Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHVuY3R1YXRvciggY2hhciApe1xuICAgIHJldHVybiAnLiw/KClbXXt9JX47Jy5pbmRleE9mKCBjaGFyICkgIT09IC0xO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNRdW90ZSggY2hhciApe1xuICAgIHJldHVybiBpc0RvdWJsZVF1b3RlKCBjaGFyICkgfHwgaXNTaW5nbGVRdW90ZSggY2hhciApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTaW5nbGVRdW90ZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSBcIidcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzV2hpdGVzcGFjZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSAnICcgfHwgY2hhciA9PT0gJ1xccicgfHwgY2hhciA9PT0gJ1xcdCcgfHwgY2hhciA9PT0gJ1xcbicgfHwgY2hhciA9PT0gJ1xcdicgfHwgY2hhciA9PT0gJ1xcdTAwQTAnO1xufSIsImV4cG9ydCB2YXIgRW5kT2ZMaW5lICAgICAgID0gJ0VuZE9mTGluZSc7XG5leHBvcnQgdmFyIElkZW50aWZpZXIgICAgICA9ICdJZGVudGlmaWVyJztcbmV4cG9ydCB2YXIgTnVtZXJpY0xpdGVyYWwgID0gJ051bWVyaWMnO1xuZXhwb3J0IHZhciBOdWxsTGl0ZXJhbCAgICAgPSAnTnVsbCc7XG5leHBvcnQgdmFyIFB1bmN0dWF0b3IgICAgICA9ICdQdW5jdHVhdG9yJztcbmV4cG9ydCB2YXIgU3RyaW5nTGl0ZXJhbCAgID0gJ1N0cmluZyc7IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIEdyYW1tYXIgZnJvbSAnLi9ncmFtbWFyJztcblxudmFyIHRva2VuSWQgPSAwO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5Ub2tlblxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgdGhlIHRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSB0b2tlblxuICovXG5mdW5jdGlvbiBUb2tlbiggdHlwZSwgdmFsdWUgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IExleGVyflRva2VuI2lkXG4gICAgICovXG4gICAgdGhpcy5pZCA9ICsrdG9rZW5JZDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IExleGVyflRva2VuI3R5cGVcbiAgICAgKi9cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gTGV4ZXJ+VG9rZW4jdmFsdWVcbiAgICAgKi9cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cblRva2VuLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cblRva2VuLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRva2VuO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlblxuICovXG5Ub2tlbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnR5cGUgPSB0aGlzLnR5cGU7XG4gICAganNvbi52YWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xuVG9rZW4ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gU3RyaW5nKCB0aGlzLnZhbHVlICk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gRW5kT2ZMaW5lKCl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5FbmRPZkxpbmUsICcnICk7XG59XG5cbkVuZE9mTGluZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuRW5kT2ZMaW5lLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVuZE9mTGluZTtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+SWRlbnRpZmllclxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gSWRlbnRpZmllciggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLklkZW50aWZpZXIsIHZhbHVlICk7XG59XG5cbklkZW50aWZpZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbklkZW50aWZpZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSWRlbnRpZmllcjtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+TnVtZXJpY0xpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE51bWVyaWNMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWwsIHZhbHVlICk7XG59XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdW1lcmljTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+TnVsbExpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE51bGxMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuTnVsbExpdGVyYWwsIHZhbHVlICk7XG59XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdWxsTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+UHVuY3R1YXRvclxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gUHVuY3R1YXRvciggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLlB1bmN0dWF0b3IsIHZhbHVlICk7XG59XG5cblB1bmN0dWF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cblB1bmN0dWF0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUHVuY3R1YXRvcjtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+U3RyaW5nTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RyaW5nTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLlN0cmluZ0xpdGVyYWwsIHZhbHVlICk7XG59XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RyaW5nTGl0ZXJhbDsiLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgQ2hhcmFjdGVyIGZyb20gJy4vY2hhcmFjdGVyJztcbmltcG9ydCAqIGFzIFRva2VuIGZyb20gJy4vdG9rZW4nO1xuXG52YXIgc2Nhbm5lclByb3RvdHlwZTtcblxuZnVuY3Rpb24gaXNOb3RJZGVudGlmaWVyKCBjaGFyICl7XG4gICAgcmV0dXJuICFDaGFyYWN0ZXIuaXNJZGVudGlmaWVyUGFydCggY2hhciApO1xufVxuXG5mdW5jdGlvbiBpc05vdE51bWVyaWMoIGNoYXIgKXtcbiAgICByZXR1cm4gIUNoYXJhY3Rlci5pc051bWVyaWMoIGNoYXIgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2Nhbm5lciggdGV4dCApe1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnJ1xuICAgICAqL1xuICAgIHRoaXMuc291cmNlID0gdGV4dDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5pbmRleCA9IDA7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMubGVuZ3RoID0gdGV4dC5sZW5ndGg7XG59XG5cbnNjYW5uZXJQcm90b3R5cGUgPSBTY2FubmVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbnNjYW5uZXJQcm90b3R5cGUuY29uc3RydWN0b3IgPSBTY2FubmVyO1xuXG5zY2FubmVyUHJvdG90eXBlLmVvbCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPj0gdGhpcy5sZW5ndGg7XG59O1xuXG5zY2FubmVyUHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKCl7XG4gICAgaWYoIHRoaXMuZW9sKCkgKXtcbiAgICAgICAgcmV0dXJuIG5ldyBUb2tlbi5FbmRPZkxpbmUoKTtcbiAgICB9XG5cbiAgICB2YXIgY2hhciA9IHRoaXMuc291cmNlWyB0aGlzLmluZGV4IF0sXG4gICAgICAgIHdvcmQ7XG5cbiAgICAvLyBJZGVudGlmaWVyXG4gICAgaWYoIENoYXJhY3Rlci5pc0lkZW50aWZpZXJTdGFydCggY2hhciApICl7XG4gICAgICAgIHdvcmQgPSB0aGlzLnNjYW4oIGlzTm90SWRlbnRpZmllciApO1xuXG4gICAgICAgIHJldHVybiB3b3JkID09PSAnbnVsbCcgP1xuICAgICAgICAgICAgbmV3IFRva2VuLk51bGxMaXRlcmFsKCB3b3JkICkgOlxuICAgICAgICAgICAgbmV3IFRva2VuLklkZW50aWZpZXIoIHdvcmQgKTtcblxuICAgIC8vIFB1bmN0dWF0b3JcbiAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc1B1bmN0dWF0b3IoIGNoYXIgKSApe1xuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICAgIHJldHVybiBuZXcgVG9rZW4uUHVuY3R1YXRvciggY2hhciApO1xuXG4gICAgLy8gUXVvdGVkIFN0cmluZ1xuICAgIH0gZWxzZSBpZiggQ2hhcmFjdGVyLmlzUXVvdGUoIGNoYXIgKSApe1xuICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgd29yZCA9IENoYXJhY3Rlci5pc0RvdWJsZVF1b3RlKCBjaGFyICkgP1xuICAgICAgICAgICAgdGhpcy5zY2FuKCBDaGFyYWN0ZXIuaXNEb3VibGVRdW90ZSApIDpcbiAgICAgICAgICAgIHRoaXMuc2NhbiggQ2hhcmFjdGVyLmlzU2luZ2xlUXVvdGUgKTtcblxuICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBUb2tlbi5TdHJpbmdMaXRlcmFsKCBjaGFyICsgd29yZCArIGNoYXIgKTtcblxuICAgIC8vIE51bWVyaWNcbiAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc051bWVyaWMoIGNoYXIgKSApe1xuICAgICAgICB3b3JkID0gdGhpcy5zY2FuKCBpc05vdE51bWVyaWMgKTtcblxuICAgICAgICByZXR1cm4gbmV3IFRva2VuLk51bWVyaWNMaXRlcmFsKCB3b3JkICk7XG5cbiAgICAvLyBXaGl0ZXNwYWNlXG4gICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNXaGl0ZXNwYWNlKCBjaGFyICkgKXtcbiAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgLy8gRXJyb3JcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoICdcIicgKyBjaGFyICsgJ1wiIGlzIGFuIGludmFsaWQgY2hhcmFjdGVyJyApO1xuICAgIH1cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOmZ1bmN0aW9ufSB1bnRpbCBBIGNvbmRpdGlvbiB0aGF0IHdoZW4gbWV0IHdpbGwgc3RvcCB0aGUgc2Nhbm5pbmcgb2YgdGhlIHNvdXJjZVxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gVGhlIHBvcnRpb24gb2YgdGhlIHNvdXJjZSBzY2FubmVkXG4gKi9cbnNjYW5uZXJQcm90b3R5cGUuc2NhbiA9IGZ1bmN0aW9uKCB1bnRpbCApe1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXgsXG4gICAgICAgIGNoYXI7XG5cbiAgICB3aGlsZSggIXRoaXMuZW9sKCkgKXtcbiAgICAgICAgY2hhciA9IHRoaXMuc291cmNlWyB0aGlzLmluZGV4IF07XG5cbiAgICAgICAgaWYoIHVudGlsKCBjaGFyICkgKXtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNvdXJjZS5zbGljZSggc3RhcnQsIHRoaXMuaW5kZXggKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHNjYW5uZXJcbiAqL1xuc2Nhbm5lclByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24uc291cmNlID0gdGhpcy5zb3VyY2U7XG4gICAganNvbi5pbmRleCAgPSB0aGlzLmluZGV4O1xuICAgIGpzb24ubGVuZ3RoID0gdGhpcy5sZW5ndGg7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgc2Nhbm5lclxuICovXG5zY2FubmVyUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2U7XG59OyIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRvSlNPTiggdmFsdWUgKXtcbiAgICByZXR1cm4gdmFsdWUudG9KU09OKCk7XG59IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCBtYXAgZnJvbSAnLi9tYXAnO1xuaW1wb3J0IFNjYW5uZXIgZnJvbSAnLi9zY2FubmVyJztcbmltcG9ydCB0b0pTT04gZnJvbSAnLi90by1qc29uJztcblxudmFyIHRva2Vuc1Byb3RvdHlwZTtcblxuLyoqXG4gKiBAY2xhc3MgVG9rZW5zXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFRva2VucyggdGV4dCApe1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLnNvdXJjZSA9IHRleHQ7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMubGVuZ3RoID0gMDtcblxuICAgIHZhciBzY2FubmVyID0gbmV3IFNjYW5uZXIoIHRleHQgKSxcbiAgICAgICAgdG9rZW47XG5cbiAgICB3aGlsZSggIXNjYW5uZXIuZW9sKCkgKXtcbiAgICAgICAgdG9rZW4gPSBzY2FubmVyLmxleCgpO1xuICAgICAgICBpZiggdG9rZW4gKXtcbiAgICAgICAgICAgIHRoaXNbIHRoaXMubGVuZ3RoKysgXSA9IHRva2VuO1xuICAgICAgICB9XG4gICAgfVxufVxuXG50b2tlbnNQcm90b3R5cGUgPSBUb2tlbnMucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxudG9rZW5zUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVG9rZW5zO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlbnNcbiAqL1xudG9rZW5zUHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbiA9IG1hcCggdGhpcywgdG9KU09OICk7XG4gICAganNvbi5zb3VyY2UgPSB0aGlzLnNvdXJjZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlbnNcbiAqL1xudG9rZW5zUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2U7XG59OyJdLCJuYW1lcyI6WyJFbmRPZkxpbmUiLCJJZGVudGlmaWVyIiwiTnVtZXJpY0xpdGVyYWwiLCJOdWxsTGl0ZXJhbCIsIlB1bmN0dWF0b3IiLCJTdHJpbmdMaXRlcmFsIiwiR3JhbW1hci5FbmRPZkxpbmUiLCJHcmFtbWFyLklkZW50aWZpZXIiLCJHcmFtbWFyLk51bWVyaWNMaXRlcmFsIiwiR3JhbW1hci5OdWxsTGl0ZXJhbCIsIkdyYW1tYXIuUHVuY3R1YXRvciIsIkdyYW1tYXIuU3RyaW5nTGl0ZXJhbCIsIkNoYXJhY3Rlci5pc0lkZW50aWZpZXJQYXJ0IiwiQ2hhcmFjdGVyLmlzTnVtZXJpYyIsIlRva2VuLkVuZE9mTGluZSIsIkNoYXJhY3Rlci5pc0lkZW50aWZpZXJTdGFydCIsIlRva2VuLk51bGxMaXRlcmFsIiwiVG9rZW4uSWRlbnRpZmllciIsIkNoYXJhY3Rlci5pc1B1bmN0dWF0b3IiLCJUb2tlbi5QdW5jdHVhdG9yIiwiQ2hhcmFjdGVyLmlzUXVvdGUiLCJDaGFyYWN0ZXIuaXNEb3VibGVRdW90ZSIsIkNoYXJhY3Rlci5pc1NpbmdsZVF1b3RlIiwiVG9rZW4uU3RyaW5nTGl0ZXJh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
