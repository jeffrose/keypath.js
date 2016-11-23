import Null from './null';
import map from './map';
import Scanner from './scanner';
import toJSON from './to-json';
import toString from './to-string';

var lexerPrototype;

/**
 * @class Lexer
 * @extends Null
 */
export default function Lexer(){
    /**
     * @member {Scanner}
     */
    this.scanner = null;
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
    this.scanner = new Scanner( text );
    this.tokens = [];

    var token;

    while( !this.scanner.eol() ){
        token = this.scanner.lex();
        if( token ){
            this.tokens[ this.tokens.length ] = token;
        }
    }

    return this.tokens;
};

/**
 * @function
 * @returns {external:boolean} Whether or not the lexer is at the end of the line
 */
lexerPrototype.eol = function(){
    return this.index >= this.length;
};

/**
 * @function
 * @param {external:function} until A condition that when met will stop the reading of the buffer
 * @returns {external:string} The portion of the buffer read
 */
lexerPrototype.read = function( until ){
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
 * @returns {external:Object} A JSON representation of the lexer
 */
lexerPrototype.toJSON = function(){
    var json = new Null();

    json.scanner = this.scanner && this.scanner.toJSON();
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