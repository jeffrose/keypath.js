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

var BooleanLiteral$1   = 'Boolean';
var EndOfLine$1        = 'EndOfLine';
var Identifier$1       = 'Identifier';
var NumericLiteral$1   = 'Numeric';
var NullLiteral$1      = 'Null';
var Punctuator$1       = 'Punctuator';
var StringLiteral$1    = 'String';

var tokenId = 0;
var tokenPrototype;

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

tokenPrototype = Token.prototype = new Null();

tokenPrototype.constructor = Token;

/**
 * @function
 * @returns {external:Object} A JSON representation of the token
 */
tokenPrototype.toJSON = function(){
    var json = new Null();

    json.type = this.type;
    json.value = this.value;

    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the token
 */
tokenPrototype.toString = function(){
    return String( this.value );
};

/**
 * @class Lexer~BooleanLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function BooleanLiteral$$1( value ){
    Token.call( this, BooleanLiteral$1, value );
}

BooleanLiteral$$1.prototype = Object.create( tokenPrototype );

BooleanLiteral$$1.prototype.constructor = BooleanLiteral$$1;

function EndOfLine$$1(){
    Token.call( this, EndOfLine$1, '' );
}

EndOfLine$$1.prototype = Object.create( tokenPrototype );

EndOfLine$$1.prototype.constructor = EndOfLine$$1;

/**
 * @class Lexer~Identifier
 * @extends Lexer~Token
 * @param {external:string} value
 */
function Identifier$$1( value ){
    Token.call( this, Identifier$1, value );
}

Identifier$$1.prototype = Object.create( tokenPrototype );

Identifier$$1.prototype.constructor = Identifier$$1;

/**
 * @class Lexer~NumericLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function NumericLiteral$$1( value ){
    Token.call( this, NumericLiteral$1, value );
}

NumericLiteral$$1.prototype = Object.create( tokenPrototype );

NumericLiteral$$1.prototype.constructor = NumericLiteral$$1;

/**
 * @class Lexer~NullLiteral
 * @extends Lexer~Token
 */
function NullLiteral$$1(){
    Token.call( this, NullLiteral$1, 'null' );
}

NullLiteral$$1.prototype = Object.create( tokenPrototype );

NullLiteral$$1.prototype.constructor = NullLiteral$$1;

/**
 * @class Lexer~Punctuator
 * @extends Lexer~Token
 * @param {external:string} value
 */
function Punctuator$$1( value ){
    Token.call( this, Punctuator$1, value );
}

Punctuator$$1.prototype = Object.create( tokenPrototype );

Punctuator$$1.prototype.constructor = Punctuator$$1;

/**
 * @class Lexer~StringLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function StringLiteral$$1( value ){
    Token.call( this, StringLiteral$1, value );
}

StringLiteral$$1.prototype = Object.create( tokenPrototype );

StringLiteral$$1.prototype.constructor = StringLiteral$$1;

var scannerPrototype;

function isNotIdentifier( char ){
    return !isIdentifierPart( char );
}

function isNotNumeric( char ){
    return !isNumeric( char );
}

/**
 * @class Scanner
 * @extends Null
 */
function Scanner( text ){
    /**
     * @member {external:string}
     * @default ''
     */
    this.source = text || '';
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

scannerPrototype.scan = function(){
    if( this.eol() ){
        return new EndOfLine$$1();
    }

    var char = this.source[ this.index ],
        word;

    // Identifier
    if( isIdentifierStart( char ) ){
        word = this.scanUntil( isNotIdentifier );

        switch( word ){
            case 'null':
                return new NullLiteral$$1();
            case 'true':
            case 'false':
                return new BooleanLiteral$$1( word );
            default:
                return new Identifier$$1( word );
        }

    // Punctuator
    } else if( isPunctuator( char ) ){
        this.index++;
        return new Punctuator$$1( char );

    // Quoted String
    } else if( isQuote( char ) ){
        this.index++;

        word = isDoubleQuote( char ) ?
            this.scanUntil( isDoubleQuote ) :
            this.scanUntil( isSingleQuote );

        this.index++;

        return new StringLiteral$$1( char + word + char );

    // Numeric
    } else if( isNumeric( char ) ){
        word = this.scanUntil( isNotNumeric );

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
scannerPrototype.scanUntil = function( until ){
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
        token = scanner.scan();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5zLmpzIiwic291cmNlcyI6WyJudWxsLmpzIiwibWFwLmpzIiwiY2hhcmFjdGVyLmpzIiwiZ3JhbW1hci5qcyIsInRva2VuLmpzIiwic2Nhbm5lci5qcyIsInRvLWpzb24uanMiLCJ0b2tlbnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBIFwiY2xlYW5cIiwgZW1wdHkgY29udGFpbmVyLiBJbnN0YW50aWF0aW5nIHRoaXMgaXMgZmFzdGVyIHRoYW4gZXhwbGljaXRseSBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKCBudWxsIClgLlxuICogQGNsYXNzIE51bGxcbiAqIEBleHRlbmRzIGV4dGVybmFsOm51bGxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTnVsbCgpe31cbk51bGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuTnVsbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgTnVsbDsiLCIvKipcbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpGdW5jdGlvbn0gTWFwQ2FsbGJhY2tcbiAqIEBwYXJhbSB7Kn0gaXRlbVxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4XG4gKi9cblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXktTGlrZX0gbGlzdFxuICogQHBhcmFtIHtNYXBDYWxsYmFja30gY2FsbGJhY2tcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWFwKCBsaXN0LCBjYWxsYmFjayApe1xuICAgIHZhciBsZW5ndGggPSBsaXN0Lmxlbmd0aCxcbiAgICAgICAgaW5kZXgsIHJlc3VsdDtcblxuICAgIHN3aXRjaCggbGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJldHVybiBbIGNhbGxiYWNrKCBsaXN0WyAwIF0sIDAsIGxpc3QgKSBdO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gWyBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICksIGNhbGxiYWNrKCBsaXN0WyAxIF0sIDEsIGxpc3QgKSBdO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gWyBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICksIGNhbGxiYWNrKCBsaXN0WyAxIF0sIDEsIGxpc3QgKSwgY2FsbGJhY2soIGxpc3RbIDIgXSwgMiwgbGlzdCApIF07XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGxlbmd0aCApO1xuICAgICAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gY2FsbGJhY2soIGxpc3RbIGluZGV4IF0sIGluZGV4LCBsaXN0ICk7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn0iLCJleHBvcnQgZnVuY3Rpb24gaXNEb3VibGVRdW90ZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSAnXCInO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJZGVudGlmaWVyUGFydCggY2hhciApe1xuICAgIHJldHVybiBpc0lkZW50aWZpZXJTdGFydCggY2hhciApIHx8IGlzTnVtZXJpYyggY2hhciApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJZGVudGlmaWVyU3RhcnQoIGNoYXIgKXtcbiAgICByZXR1cm4gJ2EnIDw9IGNoYXIgJiYgY2hhciA8PSAneicgfHwgJ0EnIDw9IGNoYXIgJiYgY2hhciA8PSAnWicgfHwgJ18nID09PSBjaGFyIHx8IGNoYXIgPT09ICckJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtZXJpYyggY2hhciApe1xuICAgIHJldHVybiAnMCcgPD0gY2hhciAmJiBjaGFyIDw9ICc5Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHVuY3R1YXRvciggY2hhciApe1xuICAgIHJldHVybiAnLiw/KClbXXt9JX47Jy5pbmRleE9mKCBjaGFyICkgIT09IC0xO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNRdW90ZSggY2hhciApe1xuICAgIHJldHVybiBpc0RvdWJsZVF1b3RlKCBjaGFyICkgfHwgaXNTaW5nbGVRdW90ZSggY2hhciApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTaW5nbGVRdW90ZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSBcIidcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzV2hpdGVzcGFjZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSAnICcgfHwgY2hhciA9PT0gJ1xccicgfHwgY2hhciA9PT0gJ1xcdCcgfHwgY2hhciA9PT0gJ1xcbicgfHwgY2hhciA9PT0gJ1xcdicgfHwgY2hhciA9PT0gJ1xcdTAwQTAnO1xufSIsImV4cG9ydCB2YXIgQm9vbGVhbkxpdGVyYWwgICA9ICdCb29sZWFuJztcbmV4cG9ydCB2YXIgRW5kT2ZMaW5lICAgICAgICA9ICdFbmRPZkxpbmUnO1xuZXhwb3J0IHZhciBJZGVudGlmaWVyICAgICAgID0gJ0lkZW50aWZpZXInO1xuZXhwb3J0IHZhciBOdW1lcmljTGl0ZXJhbCAgID0gJ051bWVyaWMnO1xuZXhwb3J0IHZhciBOdWxsTGl0ZXJhbCAgICAgID0gJ051bGwnO1xuZXhwb3J0IHZhciBQdW5jdHVhdG9yICAgICAgID0gJ1B1bmN0dWF0b3InO1xuZXhwb3J0IHZhciBTdHJpbmdMaXRlcmFsICAgID0gJ1N0cmluZyc7IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIEdyYW1tYXIgZnJvbSAnLi9ncmFtbWFyJztcblxudmFyIHRva2VuSWQgPSAwLFxuXG4gICAgdG9rZW5Qcm90b3R5cGU7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflRva2VuXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdHlwZSBUaGUgdHlwZSBvZiB0aGUgdG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIHRva2VuXG4gKi9cbmZ1bmN0aW9uIFRva2VuKCB0eXBlLCB2YWx1ZSApe1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gTGV4ZXJ+VG9rZW4jaWRcbiAgICAgKi9cbiAgICB0aGlzLmlkID0gKyt0b2tlbklkO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gTGV4ZXJ+VG9rZW4jdHlwZVxuICAgICAqL1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBMZXhlcn5Ub2tlbiN2YWx1ZVxuICAgICAqL1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxudG9rZW5Qcm90b3R5cGUgPSBUb2tlbi5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG50b2tlblByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRva2VuO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlblxuICovXG50b2tlblByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24udHlwZSA9IHRoaXMudHlwZTtcbiAgICBqc29uLnZhbHVlID0gdGhpcy52YWx1ZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlblxuICovXG50b2tlblByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFN0cmluZyggdGhpcy52YWx1ZSApO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+Qm9vbGVhbkxpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJvb2xlYW5MaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuQm9vbGVhbkxpdGVyYWwsIHZhbHVlICk7XG59XG5cbkJvb2xlYW5MaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIHRva2VuUHJvdG90eXBlICk7XG5cbkJvb2xlYW5MaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJvb2xlYW5MaXRlcmFsO1xuXG5leHBvcnQgZnVuY3Rpb24gRW5kT2ZMaW5lKCl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5FbmRPZkxpbmUsICcnICk7XG59XG5cbkVuZE9mTGluZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCB0b2tlblByb3RvdHlwZSApO1xuXG5FbmRPZkxpbmUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW5kT2ZMaW5lO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5JZGVudGlmaWVyXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJZGVudGlmaWVyKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuSWRlbnRpZmllciwgdmFsdWUgKTtcbn1cblxuSWRlbnRpZmllci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCB0b2tlblByb3RvdHlwZSApO1xuXG5JZGVudGlmaWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IElkZW50aWZpZXI7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfk51bWVyaWNMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdW1lcmljTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLk51bWVyaWNMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCB0b2tlblByb3RvdHlwZSApO1xuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdW1lcmljTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+TnVsbExpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdWxsTGl0ZXJhbCgpe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuTnVsbExpdGVyYWwsICdudWxsJyApO1xufVxuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCB0b2tlblByb3RvdHlwZSApO1xuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdWxsTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+UHVuY3R1YXRvclxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gUHVuY3R1YXRvciggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLlB1bmN0dWF0b3IsIHZhbHVlICk7XG59XG5cblB1bmN0dWF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggdG9rZW5Qcm90b3R5cGUgKTtcblxuUHVuY3R1YXRvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQdW5jdHVhdG9yO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5TdHJpbmdMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdHJpbmdMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCB0b2tlblByb3RvdHlwZSApO1xuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0cmluZ0xpdGVyYWw7IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIENoYXJhY3RlciBmcm9tICcuL2NoYXJhY3Rlcic7XG5pbXBvcnQgKiBhcyBUb2tlbiBmcm9tICcuL3Rva2VuJztcblxudmFyIHNjYW5uZXJQcm90b3R5cGU7XG5cbmZ1bmN0aW9uIGlzTm90SWRlbnRpZmllciggY2hhciApe1xuICAgIHJldHVybiAhQ2hhcmFjdGVyLmlzSWRlbnRpZmllclBhcnQoIGNoYXIgKTtcbn1cblxuZnVuY3Rpb24gaXNOb3ROdW1lcmljKCBjaGFyICl7XG4gICAgcmV0dXJuICFDaGFyYWN0ZXIuaXNOdW1lcmljKCBjaGFyICk7XG59XG5cbi8qKlxuICogQGNsYXNzIFNjYW5uZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2Nhbm5lciggdGV4dCApe1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnJ1xuICAgICAqL1xuICAgIHRoaXMuc291cmNlID0gdGV4dCB8fCAnJztcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5pbmRleCA9IDA7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMubGVuZ3RoID0gdGV4dC5sZW5ndGg7XG59XG5cbnNjYW5uZXJQcm90b3R5cGUgPSBTY2FubmVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbnNjYW5uZXJQcm90b3R5cGUuY29uc3RydWN0b3IgPSBTY2FubmVyO1xuXG5zY2FubmVyUHJvdG90eXBlLmVvbCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPj0gdGhpcy5sZW5ndGg7XG59O1xuXG5zY2FubmVyUHJvdG90eXBlLnNjYW4gPSBmdW5jdGlvbigpe1xuICAgIGlmKCB0aGlzLmVvbCgpICl7XG4gICAgICAgIHJldHVybiBuZXcgVG9rZW4uRW5kT2ZMaW5lKCk7XG4gICAgfVxuXG4gICAgdmFyIGNoYXIgPSB0aGlzLnNvdXJjZVsgdGhpcy5pbmRleCBdLFxuICAgICAgICB3b3JkO1xuXG4gICAgLy8gSWRlbnRpZmllclxuICAgIGlmKCBDaGFyYWN0ZXIuaXNJZGVudGlmaWVyU3RhcnQoIGNoYXIgKSApe1xuICAgICAgICB3b3JkID0gdGhpcy5zY2FuVW50aWwoIGlzTm90SWRlbnRpZmllciApO1xuXG4gICAgICAgIHN3aXRjaCggd29yZCApe1xuICAgICAgICAgICAgY2FzZSAnbnVsbCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUb2tlbi5OdWxsTGl0ZXJhbCgpO1xuICAgICAgICAgICAgY2FzZSAndHJ1ZSc6XG4gICAgICAgICAgICBjYXNlICdmYWxzZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUb2tlbi5Cb29sZWFuTGl0ZXJhbCggd29yZCApO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRva2VuLklkZW50aWZpZXIoIHdvcmQgKTtcbiAgICAgICAgfVxuXG4gICAgLy8gUHVuY3R1YXRvclxuICAgIH0gZWxzZSBpZiggQ2hhcmFjdGVyLmlzUHVuY3R1YXRvciggY2hhciApICl7XG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgcmV0dXJuIG5ldyBUb2tlbi5QdW5jdHVhdG9yKCBjaGFyICk7XG5cbiAgICAvLyBRdW90ZWQgU3RyaW5nXG4gICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNRdW90ZSggY2hhciApICl7XG4gICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICB3b3JkID0gQ2hhcmFjdGVyLmlzRG91YmxlUXVvdGUoIGNoYXIgKSA/XG4gICAgICAgICAgICB0aGlzLnNjYW5VbnRpbCggQ2hhcmFjdGVyLmlzRG91YmxlUXVvdGUgKSA6XG4gICAgICAgICAgICB0aGlzLnNjYW5VbnRpbCggQ2hhcmFjdGVyLmlzU2luZ2xlUXVvdGUgKTtcblxuICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBUb2tlbi5TdHJpbmdMaXRlcmFsKCBjaGFyICsgd29yZCArIGNoYXIgKTtcblxuICAgIC8vIE51bWVyaWNcbiAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc051bWVyaWMoIGNoYXIgKSApe1xuICAgICAgICB3b3JkID0gdGhpcy5zY2FuVW50aWwoIGlzTm90TnVtZXJpYyApO1xuXG4gICAgICAgIHJldHVybiBuZXcgVG9rZW4uTnVtZXJpY0xpdGVyYWwoIHdvcmQgKTtcblxuICAgIC8vIFdoaXRlc3BhY2VcbiAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc1doaXRlc3BhY2UoIGNoYXIgKSApe1xuICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAvLyBFcnJvclxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggJ1wiJyArIGNoYXIgKyAnXCIgaXMgYW4gaW52YWxpZCBjaGFyYWN0ZXInICk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6ZnVuY3Rpb259IHVudGlsIEEgY29uZGl0aW9uIHRoYXQgd2hlbiBtZXQgd2lsbCBzdG9wIHRoZSBzY2FubmluZyBvZiB0aGUgc291cmNlXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBUaGUgcG9ydGlvbiBvZiB0aGUgc291cmNlIHNjYW5uZWRcbiAqL1xuc2Nhbm5lclByb3RvdHlwZS5zY2FuVW50aWwgPSBmdW5jdGlvbiggdW50aWwgKXtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4LFxuICAgICAgICBjaGFyO1xuXG4gICAgd2hpbGUoICF0aGlzLmVvbCgpICl7XG4gICAgICAgIGNoYXIgPSB0aGlzLnNvdXJjZVsgdGhpcy5pbmRleCBdO1xuXG4gICAgICAgIGlmKCB1bnRpbCggY2hhciApICl7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zb3VyY2Uuc2xpY2UoIHN0YXJ0LCB0aGlzLmluZGV4ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzY2FubmVyXG4gKi9cbnNjYW5uZXJQcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnNvdXJjZSA9IHRoaXMuc291cmNlO1xuICAgIGpzb24uaW5kZXggID0gdGhpcy5pbmRleDtcbiAgICBqc29uLmxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHNjYW5uZXJcbiAqL1xuc2Nhbm5lclByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlO1xufTsiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0b0pTT04oIHZhbHVlICl7XG4gICAgcmV0dXJuIHZhbHVlLnRvSlNPTigpO1xufSIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgbWFwIGZyb20gJy4vbWFwJztcbmltcG9ydCBTY2FubmVyIGZyb20gJy4vc2Nhbm5lcic7XG5pbXBvcnQgdG9KU09OIGZyb20gJy4vdG8tanNvbic7XG5cbnZhciB0b2tlbnNQcm90b3R5cGU7XG5cbi8qKlxuICogQGNsYXNzIFRva2Vuc1xuICogQGV4dGVuZHMgTnVsbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBUb2tlbnMoIHRleHQgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5zb3VyY2UgPSB0ZXh0O1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxlbmd0aCA9IDA7XG5cbiAgICB2YXIgc2Nhbm5lciA9IG5ldyBTY2FubmVyKCB0ZXh0ICksXG4gICAgICAgIHRva2VuO1xuXG4gICAgd2hpbGUoICFzY2FubmVyLmVvbCgpICl7XG4gICAgICAgIHRva2VuID0gc2Nhbm5lci5zY2FuKCk7XG4gICAgICAgIGlmKCB0b2tlbiApe1xuICAgICAgICAgICAgdGhpc1sgdGhpcy5sZW5ndGgrKyBdID0gdG9rZW47XG4gICAgICAgIH1cbiAgICB9XG59XG5cbnRva2Vuc1Byb3RvdHlwZSA9IFRva2Vucy5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG50b2tlbnNQcm90b3R5cGUuY29uc3RydWN0b3IgPSBUb2tlbnM7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHRva2Vuc1xuICovXG50b2tlbnNQcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uID0gbWFwKCB0aGlzLCB0b0pTT04gKTtcbiAgICBqc29uLnNvdXJjZSA9IHRoaXMuc291cmNlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRva2Vuc1xuICovXG50b2tlbnNQcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbn07Il0sIm5hbWVzIjpbIkJvb2xlYW5MaXRlcmFsIiwiRW5kT2ZMaW5lIiwiSWRlbnRpZmllciIsIk51bWVyaWNMaXRlcmFsIiwiTnVsbExpdGVyYWwiLCJQdW5jdHVhdG9yIiwiU3RyaW5nTGl0ZXJhbCIsIkdyYW1tYXIuQm9vbGVhbkxpdGVyYWwiLCJHcmFtbWFyLkVuZE9mTGluZSIsIkdyYW1tYXIuSWRlbnRpZmllciIsIkdyYW1tYXIuTnVtZXJpY0xpdGVyYWwiLCJHcmFtbWFyLk51bGxMaXRlcmFsIiwiR3JhbW1hci5QdW5jdHVhdG9yIiwiR3JhbW1hci5TdHJpbmdMaXRlcmFsIiwiQ2hhcmFjdGVyLmlzSWRlbnRpZmllclBhcnQiLCJDaGFyYWN0ZXIuaXNOdW1lcmljIiwiVG9rZW4uRW5kT2ZMaW5lIiwiQ2hhcmFjdGVyLmlzSWRlbnRpZmllclN0YXJ0IiwiVG9rZW4uTnVsbExpdGVyYWwiLCJUb2tlbi5Cb29sZWFuTGl0ZXJhbCIsIlRva2VuLklkZW50aWZpZXIiLCJDaGFyYWN0ZXIuaXNQdW5jdHVhdG9yIiwiVG9rZW4uUHVuY3R1YXRvciIsIkNoYXJhY3Rlci5pc1F1b3RlIiwiQ2hhcmFjdGVyLmlzRG91YmxlUXVvdGUiLCJDaGFyYWN0ZXIuaXNTaW5nbGVRdW90ZSIsIlRva2VuLlN0cmluZ0xpdGVyYWwiLCJUb2tlbi5OdW1lcmljTGl0ZXJhbCIsIkNoYXJhY3Rlci5pc1doaXRlc3BhY2UiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7OztBQUtBLEFBQWUsU0FBUyxJQUFJLEVBQUUsRUFBRTtBQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDdkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLElBQUksSUFBSTs7QUNQ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
