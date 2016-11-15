import Null from './null';
import * as Character from './character';
import * as Token from './token';

var lexerPrototype;

/**
 * @class Lexer
 * @extends Null
 */
export default function Lexer(){
    /**
     * @member {external:string}
     * @default ''
     */
    this.source = '';
    /**
     * @member {external:number}
     */
    this.index = 0;
    /**
     * @member {external:number}
     */
    this.length = 0;
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
    // Reset the index and tokens
    if( this.index ){
        this.index = 0;
        this.tokens = [];
    }

    this.source = text;
    this.length = text.length;

    var word = '',
        char, token, quote;

    while( !this.eol() ){
        char = this.source[ this.index ];

        // Identifier
        if( Character.isIdentifierStart( char ) ){
            word = this.read( function( char ){
                return !Character.isIdentifierPart( char );
            } );

            token = word === 'null' ?
                new Token.NullLiteral( word ) :
                new Token.Identifier( word );
            this.tokens.push( token );

        // Punctuator
        } else if( Character.isPunctuator( char ) ){
            token = new Token.Punctuator( char );
            this.tokens.push( token );

            this.index++;

        // Quoted String
        } else if( Character.isQuote( char ) ){
            quote = char;

            this.index++;

            word = this.read( function( char ){
                return char === quote;
            } );

            token = new Token.StringLiteral( quote + word + quote );
            this.tokens.push( token );

            this.index++;

        // Numeric
        } else if( Character.isNumeric( char ) ){
            word = this.read( function( char ){
                return !Character.isNumeric( char );
            } );

            token = new Token.NumericLiteral( word );
            this.tokens.push( token );

        // Whitespace
        } else if( Character.isWhitespace( char ) ){
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

    json.source = this.source;
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
    return this.source;
};