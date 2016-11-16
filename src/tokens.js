import Null from './null';
import map from './map';
import * as Character from './character';
import * as Token from './token';

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
        if( Character.isIdentifierStart( char ) ){
            word = scan( text, index, function( char ){
                return !Character.isIdentifierPart( char );
            } );
            index += word.length;
            token = word === 'null' ?
                new Token.NullLiteral( word ) :
                new Token.Identifier( word );

        // Punctuator
        } else if( Character.isPunctuator( char ) ){
            word = '';
            token = new Token.Punctuator( char );
            index += 1;

        // Quoted String
        } else if( Character.isQuote( char ) ){
            quote = char;
            index += 1;
            word = scan( text, index, function( char ){
                return char === quote;
            } );
            index += word.length;
            token = new Token.StringLiteral( quote + word + quote );
            index += 1;

        // Numeric
        } else if( Character.isNumeric( char ) ){
            word = scan( text, index, function( char ){
                return !Character.isNumeric( char );
            } );
            index += word.length;
            token = new Token.NumericLiteral( word );

        // Whitespace
        } else if( Character.isWhitespace( char ) ){
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
export default function Tokens( text ){
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