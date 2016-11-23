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

function toString( value ){
    return value.toString();
}

var lexerPrototype;

/**
 * @class Lexer
 * @extends Null
 */
function Lexer(){
    /**
     * @member {Array<Lexer~Token>}
     */
    this.tokens = [];
}

lexerPrototype = Lexer.prototype = new Null();

lexerPrototype.constructor = Lexer;

/**
 * @function
 * @param {external:string} text
 */
lexerPrototype.lex = function( text ){
    var scanner = new Scanner( text ),
        token;

    this.tokens = [];

    while( !scanner.eol() ){
        token = scanner.scan();
        if( token ){
            this.tokens[ this.tokens.length ] = token;
        }
    }

    return this.tokens;
};

/**
 * @function
 * @returns {external:Object} A JSON representation of the lexer
 */
lexerPrototype.toJSON = function(){
    var json = new Null();

    json.tokens = map( this.tokens, toJSON );

    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the lexer
 */
lexerPrototype.toString = function(){
    return map( this.tokens, toString ).join( '' );
};

return Lexer;

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VzIjpbIm51bGwuanMiLCJtYXAuanMiLCJjaGFyYWN0ZXIuanMiLCJncmFtbWFyLmpzIiwidG9rZW4uanMiLCJzY2FubmVyLmpzIiwidG8tanNvbi5qcyIsInRvLXN0cmluZy5qcyIsImxleGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQSBcImNsZWFuXCIsIGVtcHR5IGNvbnRhaW5lci4gSW5zdGFudGlhdGluZyB0aGlzIGlzIGZhc3RlciB0aGFuIGV4cGxpY2l0bHkgY2FsbGluZyBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYC5cbiAqIEBjbGFzcyBOdWxsXG4gKiBAZXh0ZW5kcyBleHRlcm5hbDpudWxsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE51bGwoKXt9XG5OdWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbk51bGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIE51bGw7IiwiLyoqXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6RnVuY3Rpb259IE1hcENhbGxiYWNrXG4gKiBAcGFyYW0geyp9IGl0ZW1cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxuICovXG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0FycmF5LUxpa2V9IGxpc3RcbiAqIEBwYXJhbSB7TWFwQ2FsbGJhY2t9IGNhbGxiYWNrXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1hcCggbGlzdCwgY2FsbGJhY2sgKXtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGgsXG4gICAgICAgIGluZGV4LCByZXN1bHQ7XG5cbiAgICBzd2l0Y2goIGxlbmd0aCApe1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICByZXR1cm4gWyBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICkgXTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIFsgY2FsbGJhY2soIGxpc3RbIDAgXSwgMCwgbGlzdCApLCBjYWxsYmFjayggbGlzdFsgMSBdLCAxLCBsaXN0ICkgXTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIFsgY2FsbGJhY2soIGxpc3RbIDAgXSwgMCwgbGlzdCApLCBjYWxsYmFjayggbGlzdFsgMSBdLCAxLCBsaXN0ICksIGNhbGxiYWNrKCBsaXN0WyAyIF0sIDIsIGxpc3QgKSBdO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBsZW5ndGggKTtcbiAgICAgICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGNhbGxiYWNrKCBsaXN0WyBpbmRleCBdLCBpbmRleCwgbGlzdCApO1xuICAgICAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGlzRG91YmxlUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJ1wiJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSWRlbnRpZmllclBhcnQoIGNoYXIgKXtcbiAgICByZXR1cm4gaXNJZGVudGlmaWVyU3RhcnQoIGNoYXIgKSB8fCBpc051bWVyaWMoIGNoYXIgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICl7XG4gICAgcmV0dXJuICdhJyA8PSBjaGFyICYmIGNoYXIgPD0gJ3onIHx8ICdBJyA8PSBjaGFyICYmIGNoYXIgPD0gJ1onIHx8ICdfJyA9PT0gY2hhciB8fCBjaGFyID09PSAnJCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc051bWVyaWMoIGNoYXIgKXtcbiAgICByZXR1cm4gJzAnIDw9IGNoYXIgJiYgY2hhciA8PSAnOSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1B1bmN0dWF0b3IoIGNoYXIgKXtcbiAgICByZXR1cm4gJy4sPygpW117fSV+OycuaW5kZXhPZiggY2hhciApICE9PSAtMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gaXNEb3VibGVRdW90ZSggY2hhciApIHx8IGlzU2luZ2xlUXVvdGUoIGNoYXIgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2luZ2xlUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gXCInXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1doaXRlc3BhY2UoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJyAnIHx8IGNoYXIgPT09ICdcXHInIHx8IGNoYXIgPT09ICdcXHQnIHx8IGNoYXIgPT09ICdcXG4nIHx8IGNoYXIgPT09ICdcXHYnIHx8IGNoYXIgPT09ICdcXHUwMEEwJztcbn0iLCJleHBvcnQgdmFyIEJvb2xlYW5MaXRlcmFsICAgPSAnQm9vbGVhbic7XG5leHBvcnQgdmFyIEVuZE9mTGluZSAgICAgICAgPSAnRW5kT2ZMaW5lJztcbmV4cG9ydCB2YXIgSWRlbnRpZmllciAgICAgICA9ICdJZGVudGlmaWVyJztcbmV4cG9ydCB2YXIgTnVtZXJpY0xpdGVyYWwgICA9ICdOdW1lcmljJztcbmV4cG9ydCB2YXIgTnVsbExpdGVyYWwgICAgICA9ICdOdWxsJztcbmV4cG9ydCB2YXIgUHVuY3R1YXRvciAgICAgICA9ICdQdW5jdHVhdG9yJztcbmV4cG9ydCB2YXIgU3RyaW5nTGl0ZXJhbCAgICA9ICdTdHJpbmcnOyIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBHcmFtbWFyIGZyb20gJy4vZ3JhbW1hcic7XG5cbnZhciB0b2tlbklkID0gMCxcblxuICAgIHRva2VuUHJvdG90eXBlO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5Ub2tlblxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgdGhlIHRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSB0b2tlblxuICovXG5mdW5jdGlvbiBUb2tlbiggdHlwZSwgdmFsdWUgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IExleGVyflRva2VuI2lkXG4gICAgICovXG4gICAgdGhpcy5pZCA9ICsrdG9rZW5JZDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IExleGVyflRva2VuI3R5cGVcbiAgICAgKi9cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gTGV4ZXJ+VG9rZW4jdmFsdWVcbiAgICAgKi9cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cbnRva2VuUHJvdG90eXBlID0gVG9rZW4ucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxudG9rZW5Qcm90b3R5cGUuY29uc3RydWN0b3IgPSBUb2tlbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xudG9rZW5Qcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnR5cGUgPSB0aGlzLnR5cGU7XG4gICAganNvbi52YWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xudG9rZW5Qcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBTdHJpbmcoIHRoaXMudmFsdWUgKTtcbn07XG5cbi8qKlxuICogQGNsYXNzIExleGVyfkJvb2xlYW5MaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCb29sZWFuTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLkJvb2xlYW5MaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5Cb29sZWFuTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCB0b2tlblByb3RvdHlwZSApO1xuXG5Cb29sZWFuTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCb29sZWFuTGl0ZXJhbDtcblxuZXhwb3J0IGZ1bmN0aW9uIEVuZE9mTGluZSgpe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuRW5kT2ZMaW5lLCAnJyApO1xufVxuXG5FbmRPZkxpbmUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggdG9rZW5Qcm90b3R5cGUgKTtcblxuRW5kT2ZMaW5lLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVuZE9mTGluZTtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+SWRlbnRpZmllclxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gSWRlbnRpZmllciggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLklkZW50aWZpZXIsIHZhbHVlICk7XG59XG5cbklkZW50aWZpZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggdG9rZW5Qcm90b3R5cGUgKTtcblxuSWRlbnRpZmllci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJZGVudGlmaWVyO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5OdW1lcmljTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTnVtZXJpY0xpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5OdW1lcmljTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggdG9rZW5Qcm90b3R5cGUgKTtcblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVtZXJpY0xpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfk51bGxMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICovXG5leHBvcnQgZnVuY3Rpb24gTnVsbExpdGVyYWwoKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLk51bGxMaXRlcmFsLCAnbnVsbCcgKTtcbn1cblxuTnVsbExpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggdG9rZW5Qcm90b3R5cGUgKTtcblxuTnVsbExpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVsbExpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflB1bmN0dWF0b3JcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFB1bmN0dWF0b3IoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5QdW5jdHVhdG9yLCB2YWx1ZSApO1xufVxuXG5QdW5jdHVhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIHRva2VuUHJvdG90eXBlICk7XG5cblB1bmN0dWF0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUHVuY3R1YXRvcjtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+U3RyaW5nTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RyaW5nTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLlN0cmluZ0xpdGVyYWwsIHZhbHVlICk7XG59XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggdG9rZW5Qcm90b3R5cGUgKTtcblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdHJpbmdMaXRlcmFsOyIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBDaGFyYWN0ZXIgZnJvbSAnLi9jaGFyYWN0ZXInO1xuaW1wb3J0ICogYXMgVG9rZW4gZnJvbSAnLi90b2tlbic7XG5cbnZhciBzY2FubmVyUHJvdG90eXBlO1xuXG5mdW5jdGlvbiBpc05vdElkZW50aWZpZXIoIGNoYXIgKXtcbiAgICByZXR1cm4gIUNoYXJhY3Rlci5pc0lkZW50aWZpZXJQYXJ0KCBjaGFyICk7XG59XG5cbmZ1bmN0aW9uIGlzTm90TnVtZXJpYyggY2hhciApe1xuICAgIHJldHVybiAhQ2hhcmFjdGVyLmlzTnVtZXJpYyggY2hhciApO1xufVxuXG4vKipcbiAqIEBjbGFzcyBTY2FubmVyXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNjYW5uZXIoIHRleHQgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJydcbiAgICAgKi9cbiAgICB0aGlzLnNvdXJjZSA9IHRleHQgfHwgJyc7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuaW5kZXggPSAwO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxlbmd0aCA9IHRleHQubGVuZ3RoO1xufVxuXG5zY2FubmVyUHJvdG90eXBlID0gU2Nhbm5lci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5zY2FubmVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2Nhbm5lcjtcblxuc2Nhbm5lclByb3RvdHlwZS5lb2wgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmluZGV4ID49IHRoaXMubGVuZ3RoO1xufTtcblxuc2Nhbm5lclByb3RvdHlwZS5zY2FuID0gZnVuY3Rpb24oKXtcbiAgICBpZiggdGhpcy5lb2woKSApe1xuICAgICAgICByZXR1cm4gbmV3IFRva2VuLkVuZE9mTGluZSgpO1xuICAgIH1cblxuICAgIHZhciBjaGFyID0gdGhpcy5zb3VyY2VbIHRoaXMuaW5kZXggXSxcbiAgICAgICAgd29yZDtcblxuICAgIC8vIElkZW50aWZpZXJcbiAgICBpZiggQ2hhcmFjdGVyLmlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICkgKXtcbiAgICAgICAgd29yZCA9IHRoaXMuc2NhblVudGlsKCBpc05vdElkZW50aWZpZXIgKTtcblxuICAgICAgICBzd2l0Y2goIHdvcmQgKXtcbiAgICAgICAgICAgIGNhc2UgJ251bGwnOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVG9rZW4uTnVsbExpdGVyYWwoKTtcbiAgICAgICAgICAgIGNhc2UgJ3RydWUnOlxuICAgICAgICAgICAgY2FzZSAnZmFsc2UnOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVG9rZW4uQm9vbGVhbkxpdGVyYWwoIHdvcmQgKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUb2tlbi5JZGVudGlmaWVyKCB3b3JkICk7XG4gICAgICAgIH1cblxuICAgIC8vIFB1bmN0dWF0b3JcbiAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc1B1bmN0dWF0b3IoIGNoYXIgKSApe1xuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICAgIHJldHVybiBuZXcgVG9rZW4uUHVuY3R1YXRvciggY2hhciApO1xuXG4gICAgLy8gUXVvdGVkIFN0cmluZ1xuICAgIH0gZWxzZSBpZiggQ2hhcmFjdGVyLmlzUXVvdGUoIGNoYXIgKSApe1xuICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgd29yZCA9IENoYXJhY3Rlci5pc0RvdWJsZVF1b3RlKCBjaGFyICkgP1xuICAgICAgICAgICAgdGhpcy5zY2FuVW50aWwoIENoYXJhY3Rlci5pc0RvdWJsZVF1b3RlICkgOlxuICAgICAgICAgICAgdGhpcy5zY2FuVW50aWwoIENoYXJhY3Rlci5pc1NpbmdsZVF1b3RlICk7XG5cbiAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgIHJldHVybiBuZXcgVG9rZW4uU3RyaW5nTGl0ZXJhbCggY2hhciArIHdvcmQgKyBjaGFyICk7XG5cbiAgICAvLyBOdW1lcmljXG4gICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNOdW1lcmljKCBjaGFyICkgKXtcbiAgICAgICAgd29yZCA9IHRoaXMuc2NhblVudGlsKCBpc05vdE51bWVyaWMgKTtcblxuICAgICAgICByZXR1cm4gbmV3IFRva2VuLk51bWVyaWNMaXRlcmFsKCB3b3JkICk7XG5cbiAgICAvLyBXaGl0ZXNwYWNlXG4gICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNXaGl0ZXNwYWNlKCBjaGFyICkgKXtcbiAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgLy8gRXJyb3JcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoICdcIicgKyBjaGFyICsgJ1wiIGlzIGFuIGludmFsaWQgY2hhcmFjdGVyJyApO1xuICAgIH1cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOmZ1bmN0aW9ufSB1bnRpbCBBIGNvbmRpdGlvbiB0aGF0IHdoZW4gbWV0IHdpbGwgc3RvcCB0aGUgc2Nhbm5pbmcgb2YgdGhlIHNvdXJjZVxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gVGhlIHBvcnRpb24gb2YgdGhlIHNvdXJjZSBzY2FubmVkXG4gKi9cbnNjYW5uZXJQcm90b3R5cGUuc2NhblVudGlsID0gZnVuY3Rpb24oIHVudGlsICl7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleCxcbiAgICAgICAgY2hhcjtcblxuICAgIHdoaWxlKCAhdGhpcy5lb2woKSApe1xuICAgICAgICBjaGFyID0gdGhpcy5zb3VyY2VbIHRoaXMuaW5kZXggXTtcblxuICAgICAgICBpZiggdW50aWwoIGNoYXIgKSApe1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc291cmNlLnNsaWNlKCBzdGFydCwgdGhpcy5pbmRleCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgc2Nhbm5lclxuICovXG5zY2FubmVyUHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi5zb3VyY2UgPSB0aGlzLnNvdXJjZTtcbiAgICBqc29uLmluZGV4ICA9IHRoaXMuaW5kZXg7XG4gICAganNvbi5sZW5ndGggPSB0aGlzLmxlbmd0aDtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzY2FubmVyXG4gKi9cbnNjYW5uZXJQcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbn07IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdG9KU09OKCB2YWx1ZSApe1xuICAgIHJldHVybiB2YWx1ZS50b0pTT04oKTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0b1N0cmluZyggdmFsdWUgKXtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbn0iLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0IG1hcCBmcm9tICcuL21hcCc7XG5pbXBvcnQgU2Nhbm5lciBmcm9tICcuL3NjYW5uZXInO1xuaW1wb3J0IHRvSlNPTiBmcm9tICcuL3RvLWpzb24nO1xuaW1wb3J0IHRvU3RyaW5nIGZyb20gJy4vdG8tc3RyaW5nJztcblxudmFyIGxleGVyUHJvdG90eXBlO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlclxuICogQGV4dGVuZHMgTnVsbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMZXhlcigpe1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PExleGVyflRva2VuPn1cbiAgICAgKi9cbiAgICB0aGlzLnRva2VucyA9IFtdO1xufVxuXG5sZXhlclByb3RvdHlwZSA9IExleGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbmxleGVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGV4ZXI7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdGV4dFxuICovXG5sZXhlclByb3RvdHlwZS5sZXggPSBmdW5jdGlvbiggdGV4dCApe1xuICAgIHZhciBzY2FubmVyID0gbmV3IFNjYW5uZXIoIHRleHQgKSxcbiAgICAgICAgdG9rZW47XG5cbiAgICB0aGlzLnRva2VucyA9IFtdO1xuXG4gICAgd2hpbGUoICFzY2FubmVyLmVvbCgpICl7XG4gICAgICAgIHRva2VuID0gc2Nhbm5lci5zY2FuKCk7XG4gICAgICAgIGlmKCB0b2tlbiApe1xuICAgICAgICAgICAgdGhpcy50b2tlbnNbIHRoaXMudG9rZW5zLmxlbmd0aCBdID0gdG9rZW47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50b2tlbnM7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsZXhlclxuICovXG5sZXhlclByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24udG9rZW5zID0gbWFwKCB0aGlzLnRva2VucywgdG9KU09OICk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGV4ZXJcbiAqL1xubGV4ZXJQcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBtYXAoIHRoaXMudG9rZW5zLCB0b1N0cmluZyApLmpvaW4oICcnICk7XG59OyJdLCJuYW1lcyI6WyJCb29sZWFuTGl0ZXJhbCIsIkVuZE9mTGluZSIsIklkZW50aWZpZXIiLCJOdW1lcmljTGl0ZXJhbCIsIk51bGxMaXRlcmFsIiwiUHVuY3R1YXRvciIsIlN0cmluZ0xpdGVyYWwiLCJHcmFtbWFyLkJvb2xlYW5MaXRlcmFsIiwiR3JhbW1hci5FbmRPZkxpbmUiLCJHcmFtbWFyLklkZW50aWZpZXIiLCJHcmFtbWFyLk51bWVyaWNMaXRlcmFsIiwiR3JhbW1hci5OdWxsTGl0ZXJhbCIsIkdyYW1tYXIuUHVuY3R1YXRvciIsIkdyYW1tYXIuU3RyaW5nTGl0ZXJhbCIsIkNoYXJhY3Rlci5pc0lkZW50aWZpZXJQYXJ0IiwiQ2hhcmFjdGVyLmlzTnVtZXJpYyIsIlRva2VuLkVuZE9mTGluZSIsIkNoYXJhY3Rlci5pc0lkZW50aWZpZXJTdGFydCIsIlRva2VuLk51bGxMaXRlcmFsIiwiVG9rZW4uQm9vbGVhbkxpdGVyYWwiLCJUb2tlbi5JZGVudGlmaWVyIiwiQ2hhcmFjdGVyLmlzUHVuY3R1YXRvciIsIlRva2VuLlB1bmN0dWF0b3IiLCJDaGFyYWN0ZXIuaXNRdW90ZSIsIkNoYXJhY3Rlci5pc0RvdWJsZVF1b3RlIiwiQ2hhcmFjdGVyLmlzU2luZ2xlUXVvdGUiLCJUb2tlbi5TdHJpbmdMaXRlcmFs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
