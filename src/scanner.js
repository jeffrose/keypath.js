import Null from './null';
import * as Character from './character';
import * as Token from './token';

var scannerPrototype;

function isNotIdentifier( char ){
    return !Character.isIdentifierPart( char );
}

function isNotNumeric( char ){
    return !Character.isNumeric( char );
}

export default function Scanner( text ){
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
        return new Token.EndOfLine();
    }

    var char = this.source[ this.index ],
        word;

    // Identifier
    if( Character.isIdentifierStart( char ) ){
        word = this.scan( isNotIdentifier );

        return word === 'null' ?
            new Token.NullLiteral( word ) :
            new Token.Identifier( word );

    // Punctuator
    } else if( Character.isPunctuator( char ) ){
        this.index++;
        return new Token.Punctuator( char );

    // Quoted String
    } else if( Character.isQuote( char ) ){
        this.index++;

        word = Character.isDoubleQuote( char ) ?
            this.scan( Character.isDoubleQuote ) :
            this.scan( Character.isSingleQuote );

        this.index++;

        return new Token.StringLiteral( char + word + char );

    // Numeric
    } else if( Character.isNumeric( char ) ){
        word = this.scan( isNotNumeric );

        return new Token.NumericLiteral( word );

    // Whitespace
    } else if( Character.isWhitespace( char ) ){
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