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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5zLmpzIiwic291cmNlcyI6WyJudWxsLmpzIiwibWFwLmpzIiwiY2hhcmFjdGVyLmpzIiwiZ3JhbW1hci5qcyIsInRva2VuLmpzIiwic2Nhbm5lci5qcyIsInRvLWpzb24uanMiLCJ0b2tlbnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBIFwiY2xlYW5cIiwgZW1wdHkgY29udGFpbmVyLiBJbnN0YW50aWF0aW5nIHRoaXMgaXMgZmFzdGVyIHRoYW4gZXhwbGljaXRseSBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKCBudWxsIClgLlxuICogQGNsYXNzIE51bGxcbiAqIEBleHRlbmRzIGV4dGVybmFsOm51bGxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTnVsbCgpe31cbk51bGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuTnVsbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgTnVsbDsiLCIvKipcbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpGdW5jdGlvbn0gTWFwQ2FsbGJhY2tcbiAqIEBwYXJhbSB7Kn0gaXRlbVxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4XG4gKi9cblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXktTGlrZX0gbGlzdFxuICogQHBhcmFtIHtNYXBDYWxsYmFja30gY2FsbGJhY2tcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWFwKCBsaXN0LCBjYWxsYmFjayApe1xuICAgIHZhciBsZW5ndGggPSBsaXN0Lmxlbmd0aCxcbiAgICAgICAgaW5kZXgsIHJlc3VsdDtcblxuICAgIHN3aXRjaCggbGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJldHVybiBbIGNhbGxiYWNrKCBsaXN0WyAwIF0sIDAsIGxpc3QgKSBdO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gWyBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICksIGNhbGxiYWNrKCBsaXN0WyAxIF0sIDEsIGxpc3QgKSBdO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gWyBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICksIGNhbGxiYWNrKCBsaXN0WyAxIF0sIDEsIGxpc3QgKSwgY2FsbGJhY2soIGxpc3RbIDIgXSwgMiwgbGlzdCApIF07XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGxlbmd0aCApO1xuICAgICAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gY2FsbGJhY2soIGxpc3RbIGluZGV4IF0sIGluZGV4LCBsaXN0ICk7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn0iLCJleHBvcnQgZnVuY3Rpb24gaXNEb3VibGVRdW90ZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSAnXCInO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJZGVudGlmaWVyUGFydCggY2hhciApe1xuICAgIHJldHVybiBpc0lkZW50aWZpZXJTdGFydCggY2hhciApIHx8IGlzTnVtZXJpYyggY2hhciApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJZGVudGlmaWVyU3RhcnQoIGNoYXIgKXtcbiAgICByZXR1cm4gJ2EnIDw9IGNoYXIgJiYgY2hhciA8PSAneicgfHwgJ0EnIDw9IGNoYXIgJiYgY2hhciA8PSAnWicgfHwgJ18nID09PSBjaGFyIHx8IGNoYXIgPT09ICckJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtZXJpYyggY2hhciApe1xuICAgIHJldHVybiAnMCcgPD0gY2hhciAmJiBjaGFyIDw9ICc5Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHVuY3R1YXRvciggY2hhciApe1xuICAgIHJldHVybiAnLiw/KClbXXt9JX47Jy5pbmRleE9mKCBjaGFyICkgIT09IC0xO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNRdW90ZSggY2hhciApe1xuICAgIHJldHVybiBpc0RvdWJsZVF1b3RlKCBjaGFyICkgfHwgaXNTaW5nbGVRdW90ZSggY2hhciApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTaW5nbGVRdW90ZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSBcIidcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzV2hpdGVzcGFjZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSAnICcgfHwgY2hhciA9PT0gJ1xccicgfHwgY2hhciA9PT0gJ1xcdCcgfHwgY2hhciA9PT0gJ1xcbicgfHwgY2hhciA9PT0gJ1xcdicgfHwgY2hhciA9PT0gJ1xcdTAwQTAnO1xufSIsImV4cG9ydCB2YXIgRW5kT2ZMaW5lICAgICAgID0gJ0VuZE9mTGluZSc7XG5leHBvcnQgdmFyIElkZW50aWZpZXIgICAgICA9ICdJZGVudGlmaWVyJztcbmV4cG9ydCB2YXIgTnVtZXJpY0xpdGVyYWwgID0gJ051bWVyaWMnO1xuZXhwb3J0IHZhciBOdWxsTGl0ZXJhbCAgICAgPSAnTnVsbCc7XG5leHBvcnQgdmFyIFB1bmN0dWF0b3IgICAgICA9ICdQdW5jdHVhdG9yJztcbmV4cG9ydCB2YXIgU3RyaW5nTGl0ZXJhbCAgID0gJ1N0cmluZyc7IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIEdyYW1tYXIgZnJvbSAnLi9ncmFtbWFyJztcblxudmFyIHRva2VuSWQgPSAwO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5Ub2tlblxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgdGhlIHRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSB0b2tlblxuICovXG5mdW5jdGlvbiBUb2tlbiggdHlwZSwgdmFsdWUgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IExleGVyflRva2VuI2lkXG4gICAgICovXG4gICAgdGhpcy5pZCA9ICsrdG9rZW5JZDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IExleGVyflRva2VuI3R5cGVcbiAgICAgKi9cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gTGV4ZXJ+VG9rZW4jdmFsdWVcbiAgICAgKi9cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cblRva2VuLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cblRva2VuLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRva2VuO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlblxuICovXG5Ub2tlbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnR5cGUgPSB0aGlzLnR5cGU7XG4gICAganNvbi52YWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xuVG9rZW4ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gU3RyaW5nKCB0aGlzLnZhbHVlICk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gRW5kT2ZMaW5lKCl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5FbmRPZkxpbmUsICcnICk7XG59XG5cbkVuZE9mTGluZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuRW5kT2ZMaW5lLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVuZE9mTGluZTtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+SWRlbnRpZmllclxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gSWRlbnRpZmllciggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLklkZW50aWZpZXIsIHZhbHVlICk7XG59XG5cbklkZW50aWZpZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbklkZW50aWZpZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSWRlbnRpZmllcjtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+TnVtZXJpY0xpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE51bWVyaWNMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWwsIHZhbHVlICk7XG59XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdW1lcmljTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+TnVsbExpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE51bGxMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuTnVsbExpdGVyYWwsIHZhbHVlICk7XG59XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdWxsTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+UHVuY3R1YXRvclxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gUHVuY3R1YXRvciggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLlB1bmN0dWF0b3IsIHZhbHVlICk7XG59XG5cblB1bmN0dWF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cblB1bmN0dWF0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUHVuY3R1YXRvcjtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+U3RyaW5nTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RyaW5nTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLlN0cmluZ0xpdGVyYWwsIHZhbHVlICk7XG59XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RyaW5nTGl0ZXJhbDsiLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgQ2hhcmFjdGVyIGZyb20gJy4vY2hhcmFjdGVyJztcbmltcG9ydCAqIGFzIFRva2VuIGZyb20gJy4vdG9rZW4nO1xuXG52YXIgc2Nhbm5lclByb3RvdHlwZTtcblxuZnVuY3Rpb24gaXNOb3RJZGVudGlmaWVyKCBjaGFyICl7XG4gICAgcmV0dXJuICFDaGFyYWN0ZXIuaXNJZGVudGlmaWVyUGFydCggY2hhciApO1xufVxuXG5mdW5jdGlvbiBpc05vdE51bWVyaWMoIGNoYXIgKXtcbiAgICByZXR1cm4gIUNoYXJhY3Rlci5pc051bWVyaWMoIGNoYXIgKTtcbn1cblxuLyoqXG4gKiBAY2xhc3MgU2Nhbm5lclxuICogQGV4dGVuZHMgTnVsbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTY2FubmVyKCB0ZXh0ICl7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0ICcnXG4gICAgICovXG4gICAgdGhpcy5zb3VyY2UgPSB0ZXh0IHx8ICcnO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sZW5ndGggPSB0ZXh0Lmxlbmd0aDtcbn1cblxuc2Nhbm5lclByb3RvdHlwZSA9IFNjYW5uZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuc2Nhbm5lclByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNjYW5uZXI7XG5cbnNjYW5uZXJQcm90b3R5cGUuZW9sID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5pbmRleCA+PSB0aGlzLmxlbmd0aDtcbn07XG5cbnNjYW5uZXJQcm90b3R5cGUubGV4ID0gZnVuY3Rpb24oKXtcbiAgICBpZiggdGhpcy5lb2woKSApe1xuICAgICAgICByZXR1cm4gbmV3IFRva2VuLkVuZE9mTGluZSgpO1xuICAgIH1cblxuICAgIHZhciBjaGFyID0gdGhpcy5zb3VyY2VbIHRoaXMuaW5kZXggXSxcbiAgICAgICAgd29yZDtcblxuICAgIC8vIElkZW50aWZpZXJcbiAgICBpZiggQ2hhcmFjdGVyLmlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICkgKXtcbiAgICAgICAgd29yZCA9IHRoaXMuc2NhbiggaXNOb3RJZGVudGlmaWVyICk7XG5cbiAgICAgICAgcmV0dXJuIHdvcmQgPT09ICdudWxsJyA/XG4gICAgICAgICAgICBuZXcgVG9rZW4uTnVsbExpdGVyYWwoIHdvcmQgKSA6XG4gICAgICAgICAgICBuZXcgVG9rZW4uSWRlbnRpZmllciggd29yZCApO1xuXG4gICAgLy8gUHVuY3R1YXRvclxuICAgIH0gZWxzZSBpZiggQ2hhcmFjdGVyLmlzUHVuY3R1YXRvciggY2hhciApICl7XG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgcmV0dXJuIG5ldyBUb2tlbi5QdW5jdHVhdG9yKCBjaGFyICk7XG5cbiAgICAvLyBRdW90ZWQgU3RyaW5nXG4gICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNRdW90ZSggY2hhciApICl7XG4gICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICB3b3JkID0gQ2hhcmFjdGVyLmlzRG91YmxlUXVvdGUoIGNoYXIgKSA/XG4gICAgICAgICAgICB0aGlzLnNjYW4oIENoYXJhY3Rlci5pc0RvdWJsZVF1b3RlICkgOlxuICAgICAgICAgICAgdGhpcy5zY2FuKCBDaGFyYWN0ZXIuaXNTaW5nbGVRdW90ZSApO1xuXG4gICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICByZXR1cm4gbmV3IFRva2VuLlN0cmluZ0xpdGVyYWwoIGNoYXIgKyB3b3JkICsgY2hhciApO1xuXG4gICAgLy8gTnVtZXJpY1xuICAgIH0gZWxzZSBpZiggQ2hhcmFjdGVyLmlzTnVtZXJpYyggY2hhciApICl7XG4gICAgICAgIHdvcmQgPSB0aGlzLnNjYW4oIGlzTm90TnVtZXJpYyApO1xuXG4gICAgICAgIHJldHVybiBuZXcgVG9rZW4uTnVtZXJpY0xpdGVyYWwoIHdvcmQgKTtcblxuICAgIC8vIFdoaXRlc3BhY2VcbiAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc1doaXRlc3BhY2UoIGNoYXIgKSApe1xuICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAvLyBFcnJvclxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggJ1wiJyArIGNoYXIgKyAnXCIgaXMgYW4gaW52YWxpZCBjaGFyYWN0ZXInICk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6ZnVuY3Rpb259IHVudGlsIEEgY29uZGl0aW9uIHRoYXQgd2hlbiBtZXQgd2lsbCBzdG9wIHRoZSBzY2FubmluZyBvZiB0aGUgc291cmNlXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBUaGUgcG9ydGlvbiBvZiB0aGUgc291cmNlIHNjYW5uZWRcbiAqL1xuc2Nhbm5lclByb3RvdHlwZS5zY2FuID0gZnVuY3Rpb24oIHVudGlsICl7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleCxcbiAgICAgICAgY2hhcjtcblxuICAgIHdoaWxlKCAhdGhpcy5lb2woKSApe1xuICAgICAgICBjaGFyID0gdGhpcy5zb3VyY2VbIHRoaXMuaW5kZXggXTtcblxuICAgICAgICBpZiggdW50aWwoIGNoYXIgKSApe1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc291cmNlLnNsaWNlKCBzdGFydCwgdGhpcy5pbmRleCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgc2Nhbm5lclxuICovXG5zY2FubmVyUHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi5zb3VyY2UgPSB0aGlzLnNvdXJjZTtcbiAgICBqc29uLmluZGV4ICA9IHRoaXMuaW5kZXg7XG4gICAganNvbi5sZW5ndGggPSB0aGlzLmxlbmd0aDtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzY2FubmVyXG4gKi9cbnNjYW5uZXJQcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbn07IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdG9KU09OKCB2YWx1ZSApe1xuICAgIHJldHVybiB2YWx1ZS50b0pTT04oKTtcbn0iLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0IG1hcCBmcm9tICcuL21hcCc7XG5pbXBvcnQgU2Nhbm5lciBmcm9tICcuL3NjYW5uZXInO1xuaW1wb3J0IHRvSlNPTiBmcm9tICcuL3RvLWpzb24nO1xuXG52YXIgdG9rZW5zUHJvdG90eXBlO1xuXG4vKipcbiAqIEBjbGFzcyBUb2tlbnNcbiAqIEBleHRlbmRzIE51bGxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVG9rZW5zKCB0ZXh0ICl7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMuc291cmNlID0gdGV4dDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sZW5ndGggPSAwO1xuXG4gICAgdmFyIHNjYW5uZXIgPSBuZXcgU2Nhbm5lciggdGV4dCApLFxuICAgICAgICB0b2tlbjtcblxuICAgIHdoaWxlKCAhc2Nhbm5lci5lb2woKSApe1xuICAgICAgICB0b2tlbiA9IHNjYW5uZXIubGV4KCk7XG4gICAgICAgIGlmKCB0b2tlbiApe1xuICAgICAgICAgICAgdGhpc1sgdGhpcy5sZW5ndGgrKyBdID0gdG9rZW47XG4gICAgICAgIH1cbiAgICB9XG59XG5cbnRva2Vuc1Byb3RvdHlwZSA9IFRva2Vucy5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG50b2tlbnNQcm90b3R5cGUuY29uc3RydWN0b3IgPSBUb2tlbnM7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHRva2Vuc1xuICovXG50b2tlbnNQcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uID0gbWFwKCB0aGlzLCB0b0pTT04gKTtcbiAgICBqc29uLnNvdXJjZSA9IHRoaXMuc291cmNlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRva2Vuc1xuICovXG50b2tlbnNQcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbn07Il0sIm5hbWVzIjpbIkVuZE9mTGluZSIsIklkZW50aWZpZXIiLCJOdW1lcmljTGl0ZXJhbCIsIk51bGxMaXRlcmFsIiwiUHVuY3R1YXRvciIsIlN0cmluZ0xpdGVyYWwiLCJHcmFtbWFyLkVuZE9mTGluZSIsIkdyYW1tYXIuSWRlbnRpZmllciIsIkdyYW1tYXIuTnVtZXJpY0xpdGVyYWwiLCJHcmFtbWFyLk51bGxMaXRlcmFsIiwiR3JhbW1hci5QdW5jdHVhdG9yIiwiR3JhbW1hci5TdHJpbmdMaXRlcmFsIiwiQ2hhcmFjdGVyLmlzSWRlbnRpZmllclBhcnQiLCJDaGFyYWN0ZXIuaXNOdW1lcmljIiwiVG9rZW4uRW5kT2ZMaW5lIiwiQ2hhcmFjdGVyLmlzSWRlbnRpZmllclN0YXJ0IiwiVG9rZW4uTnVsbExpdGVyYWwiLCJUb2tlbi5JZGVudGlmaWVyIiwiQ2hhcmFjdGVyLmlzUHVuY3R1YXRvciIsIlRva2VuLlB1bmN0dWF0b3IiLCJDaGFyYWN0ZXIuaXNRdW90ZSIsIkNoYXJhY3Rlci5pc0RvdWJsZVF1b3RlIiwiQ2hhcmFjdGVyLmlzU2luZ2xlUXVvdGUiLCJUb2tlbi5TdHJpbmdMaXRlcmFsIiwiVG9rZW4uTnVtZXJpY0xpdGVyYWwiLCJDaGFyYWN0ZXIuaXNXaGl0ZXNwYWNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7QUFLQSxBQUFlLFNBQVMsSUFBSSxFQUFFLEVBQUU7QUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxJQUFJLElBQUk7O0FDUGxDOzs7Ozs7Ozs7OztBQVdBLEFBQWUsU0FBUyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtJQUN6QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTTtRQUNwQixLQUFLLEVBQUUsTUFBTSxDQUFDOztJQUVsQixRQUFRLE1BQU07UUFDVixLQUFLLENBQUM7WUFDRixPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUM5QyxLQUFLLENBQUM7WUFDRixPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUM5RSxLQUFLLENBQUM7WUFDRixPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUM5RztZQUNJLEtBQUssR0FBRyxDQUFDLENB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
