import Null from './null';
import map from './map';
import Scanner from './scanner';
import toJSON from './to-json';

var tokensPrototype;

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