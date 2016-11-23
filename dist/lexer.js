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
        token = scanner.lex();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VzIjpbIm51bGwuanMiLCJtYXAuanMiLCJjaGFyYWN0ZXIuanMiLCJncmFtbWFyLmpzIiwidG9rZW4uanMiLCJzY2FubmVyLmpzIiwidG8tanNvbi5qcyIsInRvLXN0cmluZy5qcyIsImxleGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQSBcImNsZWFuXCIsIGVtcHR5IGNvbnRhaW5lci4gSW5zdGFudGlhdGluZyB0aGlzIGlzIGZhc3RlciB0aGFuIGV4cGxpY2l0bHkgY2FsbGluZyBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYC5cbiAqIEBjbGFzcyBOdWxsXG4gKiBAZXh0ZW5kcyBleHRlcm5hbDpudWxsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE51bGwoKXt9XG5OdWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbk51bGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIE51bGw7IiwiLyoqXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6RnVuY3Rpb259IE1hcENhbGxiYWNrXG4gKiBAcGFyYW0geyp9IGl0ZW1cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxuICovXG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0FycmF5LUxpa2V9IGxpc3RcbiAqIEBwYXJhbSB7TWFwQ2FsbGJhY2t9IGNhbGxiYWNrXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1hcCggbGlzdCwgY2FsbGJhY2sgKXtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGgsXG4gICAgICAgIGluZGV4LCByZXN1bHQ7XG5cbiAgICBzd2l0Y2goIGxlbmd0aCApe1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICByZXR1cm4gWyBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICkgXTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIFsgY2FsbGJhY2soIGxpc3RbIDAgXSwgMCwgbGlzdCApLCBjYWxsYmFjayggbGlzdFsgMSBdLCAxLCBsaXN0ICkgXTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIFsgY2FsbGJhY2soIGxpc3RbIDAgXSwgMCwgbGlzdCApLCBjYWxsYmFjayggbGlzdFsgMSBdLCAxLCBsaXN0ICksIGNhbGxiYWNrKCBsaXN0WyAyIF0sIDIsIGxpc3QgKSBdO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBsZW5ndGggKTtcbiAgICAgICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGNhbGxiYWNrKCBsaXN0WyBpbmRleCBdLCBpbmRleCwgbGlzdCApO1xuICAgICAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGlzRG91YmxlUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJ1wiJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSWRlbnRpZmllclBhcnQoIGNoYXIgKXtcbiAgICByZXR1cm4gaXNJZGVudGlmaWVyU3RhcnQoIGNoYXIgKSB8fCBpc051bWVyaWMoIGNoYXIgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICl7XG4gICAgcmV0dXJuICdhJyA8PSBjaGFyICYmIGNoYXIgPD0gJ3onIHx8ICdBJyA8PSBjaGFyICYmIGNoYXIgPD0gJ1onIHx8ICdfJyA9PT0gY2hhciB8fCBjaGFyID09PSAnJCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc051bWVyaWMoIGNoYXIgKXtcbiAgICByZXR1cm4gJzAnIDw9IGNoYXIgJiYgY2hhciA8PSAnOSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1B1bmN0dWF0b3IoIGNoYXIgKXtcbiAgICByZXR1cm4gJy4sPygpW117fSV+OycuaW5kZXhPZiggY2hhciApICE9PSAtMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gaXNEb3VibGVRdW90ZSggY2hhciApIHx8IGlzU2luZ2xlUXVvdGUoIGNoYXIgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2luZ2xlUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gXCInXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1doaXRlc3BhY2UoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJyAnIHx8IGNoYXIgPT09ICdcXHInIHx8IGNoYXIgPT09ICdcXHQnIHx8IGNoYXIgPT09ICdcXG4nIHx8IGNoYXIgPT09ICdcXHYnIHx8IGNoYXIgPT09ICdcXHUwMEEwJztcbn0iLCJleHBvcnQgdmFyIEVuZE9mTGluZSAgICAgICA9ICdFbmRPZkxpbmUnO1xuZXhwb3J0IHZhciBJZGVudGlmaWVyICAgICAgPSAnSWRlbnRpZmllcic7XG5leHBvcnQgdmFyIE51bWVyaWNMaXRlcmFsICA9ICdOdW1lcmljJztcbmV4cG9ydCB2YXIgTnVsbExpdGVyYWwgICAgID0gJ051bGwnO1xuZXhwb3J0IHZhciBQdW5jdHVhdG9yICAgICAgPSAnUHVuY3R1YXRvcic7XG5leHBvcnQgdmFyIFN0cmluZ0xpdGVyYWwgICA9ICdTdHJpbmcnOyIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBHcmFtbWFyIGZyb20gJy4vZ3JhbW1hcic7XG5cbnZhciB0b2tlbklkID0gMDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+VG9rZW5cbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlIFRoZSB0eXBlIG9mIHRoZSB0b2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgdG9rZW5cbiAqL1xuZnVuY3Rpb24gVG9rZW4oIHR5cGUsIHZhbHVlICl7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBMZXhlcn5Ub2tlbiNpZFxuICAgICAqL1xuICAgIHRoaXMuaWQgPSArK3Rva2VuSWQ7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBMZXhlcn5Ub2tlbiN0eXBlXG4gICAgICovXG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IExleGVyflRva2VuI3ZhbHVlXG4gICAgICovXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuXG5Ub2tlbi5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5Ub2tlbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUb2tlbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xuVG9rZW4ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi50eXBlID0gdGhpcy50eXBlO1xuICAgIGpzb24udmFsdWUgPSB0aGlzLnZhbHVlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRva2VuXG4gKi9cblRva2VuLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFN0cmluZyggdGhpcy52YWx1ZSApO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIEVuZE9mTGluZSgpe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuRW5kT2ZMaW5lLCAnJyApO1xufVxuXG5FbmRPZkxpbmUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbkVuZE9mTGluZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbmRPZkxpbmU7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfklkZW50aWZpZXJcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElkZW50aWZpZXIoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5JZGVudGlmaWVyLCB2YWx1ZSApO1xufVxuXG5JZGVudGlmaWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5JZGVudGlmaWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IElkZW50aWZpZXI7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfk51bWVyaWNMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdW1lcmljTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLk51bWVyaWNMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVtZXJpY0xpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfk51bGxMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdWxsTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLk51bGxMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuTnVsbExpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVsbExpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflB1bmN0dWF0b3JcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFB1bmN0dWF0b3IoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5QdW5jdHVhdG9yLCB2YWx1ZSApO1xufVxuXG5QdW5jdHVhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5QdW5jdHVhdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFB1bmN0dWF0b3I7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflN0cmluZ0xpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0cmluZ0xpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5TdHJpbmdMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0cmluZ0xpdGVyYWw7IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIENoYXJhY3RlciBmcm9tICcuL2NoYXJhY3Rlcic7XG5pbXBvcnQgKiBhcyBUb2tlbiBmcm9tICcuL3Rva2VuJztcblxudmFyIHNjYW5uZXJQcm90b3R5cGU7XG5cbmZ1bmN0aW9uIGlzTm90SWRlbnRpZmllciggY2hhciApe1xuICAgIHJldHVybiAhQ2hhcmFjdGVyLmlzSWRlbnRpZmllclBhcnQoIGNoYXIgKTtcbn1cblxuZnVuY3Rpb24gaXNOb3ROdW1lcmljKCBjaGFyICl7XG4gICAgcmV0dXJuICFDaGFyYWN0ZXIuaXNOdW1lcmljKCBjaGFyICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNjYW5uZXIoIHRleHQgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJydcbiAgICAgKi9cbiAgICB0aGlzLnNvdXJjZSA9IHRleHQ7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuaW5kZXggPSAwO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxlbmd0aCA9IHRleHQubGVuZ3RoO1xufVxuXG5zY2FubmVyUHJvdG90eXBlID0gU2Nhbm5lci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5zY2FubmVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2Nhbm5lcjtcblxuc2Nhbm5lclByb3RvdHlwZS5lb2wgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmluZGV4ID49IHRoaXMubGVuZ3RoO1xufTtcblxuc2Nhbm5lclByb3RvdHlwZS5sZXggPSBmdW5jdGlvbigpe1xuICAgIGlmKCB0aGlzLmVvbCgpICl7XG4gICAgICAgIHJldHVybiBuZXcgVG9rZW4uRW5kT2ZMaW5lKCk7XG4gICAgfVxuXG4gICAgdmFyIGNoYXIgPSB0aGlzLnNvdXJjZVsgdGhpcy5pbmRleCBdLFxuICAgICAgICB3b3JkO1xuXG4gICAgLy8gSWRlbnRpZmllclxuICAgIGlmKCBDaGFyYWN0ZXIuaXNJZGVudGlmaWVyU3RhcnQoIGNoYXIgKSApe1xuICAgICAgICB3b3JkID0gdGhpcy5zY2FuKCBpc05vdElkZW50aWZpZXIgKTtcblxuICAgICAgICByZXR1cm4gd29yZCA9PT0gJ251bGwnID9cbiAgICAgICAgICAgIG5ldyBUb2tlbi5OdWxsTGl0ZXJhbCggd29yZCApIDpcbiAgICAgICAgICAgIG5ldyBUb2tlbi5JZGVudGlmaWVyKCB3b3JkICk7XG5cbiAgICAvLyBQdW5jdHVhdG9yXG4gICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNQdW5jdHVhdG9yKCBjaGFyICkgKXtcbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICByZXR1cm4gbmV3IFRva2VuLlB1bmN0dWF0b3IoIGNoYXIgKTtcblxuICAgIC8vIFF1b3RlZCBTdHJpbmdcbiAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc1F1b3RlKCBjaGFyICkgKXtcbiAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgIHdvcmQgPSBDaGFyYWN0ZXIuaXNEb3VibGVRdW90ZSggY2hhciApID9cbiAgICAgICAgICAgIHRoaXMuc2NhbiggQ2hhcmFjdGVyLmlzRG91YmxlUXVvdGUgKSA6XG4gICAgICAgICAgICB0aGlzLnNjYW4oIENoYXJhY3Rlci5pc1NpbmdsZVF1b3RlICk7XG5cbiAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgIHJldHVybiBuZXcgVG9rZW4uU3RyaW5nTGl0ZXJhbCggY2hhciArIHdvcmQgKyBjaGFyICk7XG5cbiAgICAvLyBOdW1lcmljXG4gICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNOdW1lcmljKCBjaGFyICkgKXtcbiAgICAgICAgd29yZCA9IHRoaXMuc2NhbiggaXNOb3ROdW1lcmljICk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBUb2tlbi5OdW1lcmljTGl0ZXJhbCggd29yZCApO1xuXG4gICAgLy8gV2hpdGVzcGFjZVxuICAgIH0gZWxzZSBpZiggQ2hhcmFjdGVyLmlzV2hpdGVzcGFjZSggY2hhciApICl7XG4gICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgIC8vIEVycm9yXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAnXCInICsgY2hhciArICdcIiBpcyBhbiBpbnZhbGlkIGNoYXJhY3RlcicgKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpmdW5jdGlvbn0gdW50aWwgQSBjb25kaXRpb24gdGhhdCB3aGVuIG1ldCB3aWxsIHN0b3AgdGhlIHNjYW5uaW5nIG9mIHRoZSBzb3VyY2VcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IFRoZSBwb3J0aW9uIG9mIHRoZSBzb3VyY2Ugc2Nhbm5lZFxuICovXG5zY2FubmVyUHJvdG90eXBlLnNjYW4gPSBmdW5jdGlvbiggdW50aWwgKXtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4LFxuICAgICAgICBjaGFyO1xuXG4gICAgd2hpbGUoICF0aGlzLmVvbCgpICl7XG4gICAgICAgIGNoYXIgPSB0aGlzLnNvdXJjZVsgdGhpcy5pbmRleCBdO1xuXG4gICAgICAgIGlmKCB1bnRpbCggY2hhciApICl7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zb3VyY2Uuc2xpY2UoIHN0YXJ0LCB0aGlzLmluZGV4ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzY2FubmVyXG4gKi9cbnNjYW5uZXJQcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnNvdXJjZSA9IHRoaXMuc291cmNlO1xuICAgIGpzb24uaW5kZXggID0gdGhpcy5pbmRleDtcbiAgICBqc29uLmxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHNjYW5uZXJcbiAqL1xuc2Nhbm5lclByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlO1xufTsiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0b0pTT04oIHZhbHVlICl7XG4gICAgcmV0dXJuIHZhbHVlLnRvSlNPTigpO1xufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRvU3RyaW5nKCB2YWx1ZSApe1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xufSIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgbWFwIGZyb20gJy4vbWFwJztcbmltcG9ydCBTY2FubmVyIGZyb20gJy4vc2Nhbm5lcic7XG5pbXBvcnQgdG9KU09OIGZyb20gJy4vdG8tanNvbic7XG5pbXBvcnQgdG9TdHJpbmcgZnJvbSAnLi90by1zdHJpbmcnO1xuXG52YXIgbGV4ZXJQcm90b3R5cGU7XG5cbi8qKlxuICogQGNsYXNzIExleGVyXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIExleGVyKCl7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8TGV4ZXJ+VG9rZW4+fVxuICAgICAqL1xuICAgIHRoaXMudG9rZW5zID0gW107XG59XG5cbmxleGVyUHJvdG90eXBlID0gTGV4ZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxubGV4ZXJQcm90b3R5cGUuY29uc3RydWN0b3IgPSBMZXhlcjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0ZXh0XG4gKi9cbmxleGVyUHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKCB0ZXh0ICl7XG4gICAgdmFyIHNjYW5uZXIgPSBuZXcgU2Nhbm5lciggdGV4dCApLFxuICAgICAgICB0b2tlbjtcblxuICAgIHRoaXMudG9rZW5zID0gW107XG5cbiAgICB3aGlsZSggIXNjYW5uZXIuZW9sKCkgKXtcbiAgICAgICAgdG9rZW4gPSBzY2FubmVyLmxleCgpO1xuICAgICAgICBpZiggdG9rZW4gKXtcbiAgICAgICAgICAgIHRoaXMudG9rZW5zWyB0aGlzLnRva2Vucy5sZW5ndGggXSA9IHRva2VuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudG9rZW5zO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGV4ZXJcbiAqL1xubGV4ZXJQcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnRva2VucyA9IG1hcCggdGhpcy50b2tlbnMsIHRvSlNPTiApO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGxleGVyXG4gKi9cbmxleGVyUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gbWFwKCB0aGlzLnRva2VucywgdG9TdHJpbmcgKS5qb2luKCAnJyApO1xufTsiXSwibmFtZXMiOlsiRW5kT2ZMaW5lIiwiSWRlbnRpZmllciIsIk51bWVyaWNMaXRlcmFsIiwiTnVsbExpdGVyYWwiLCJQdW5jdHVhdG9yIiwiU3RyaW5nTGl0ZXJhbCIsIkdyYW1tYXIuRW5kT2ZMaW5lIiwiR3JhbW1hci5JZGVudGlmaWVyIiwiR3JhbW1hci5OdW1lcmljTGl0ZXJhbCIsIkdyYW1tYXIuTnVsbExpdGVyYWwiLCJHcmFtbWFyLlB1bmN0dWF0b3IiLCJHcmFtbWFyLlN0cmluZ0xpdGVyYWwiLCJDaGFyYWN0ZXIuaXNJZGVudGlmaWVyUGFydCIsIkNoYXJhY3Rlci5pc051bWVyaWMiLCJUb2tlbi5FbmRPZkxpbmUiLCJDaGFyYWN0ZXIuaXNJZGVudGlmaWVyU3RhcnQiLCJUb2tlbi5OdWxsTGl0ZXJhbCIsIlRva2VuLklkZW50aWZpZXIiLCJDaGFyYWN0ZXIuaXNQdW5jdHVhdG9yIiwiVG9rZW4uUHVuY3R1YXRvciIsIkNoYXJhY3Rlci5pc1F1b3RlIiwiQ2hhcmFjdGVyLmlzRG91YmxlUXVvdGUiLCJDaGFyYWN0ZXIuaXNTaW5nbGVRdW90ZSIsIlRva2VuLlN0cmluZ0xpdGVyYWwiLCJUb2tlbi5OdW1lcmljTGl0ZXJhbCIsIkNoYXJhY3Rlci5pc1doaXRlc3BhY2UiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7OztBQUtBLEFBQWUsU0FBUyxJQUFJLEVBQUUsRUFBRTtBQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDdkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLElBQUksSUFBSTs7QUNQbEM7Ozs7Ozs7Ozs7O0FBV0EsQUFBZSxTQUFTLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO0lBQ3pDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNO1FBQ3BCLEtBQUssRUFBRSxNQUFNLENBQUM7O0lBRWxCLFFBQVEsTUFBTTtRQUNWLEtBQUssQ0FBQztZQUNGLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQzlDLEtBQUssQ0FBQztZQUNGLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQzlFLEtBQUssQ0FBQztZQUNGLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVB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
