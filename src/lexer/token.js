'use strict';

import Null from '../null';

var tokenId = 0;

/**
 * @class Lexer~Token
 * @extends Null
 * @param {external:string} type The type of the token
 * @param {external:string} value The value of the token
 * @throws {external:TypeError} If `type` is not a string
 * @throws {external:TypeError} If `value` is not a string
 */
function Token( type, value ){
    if( typeof type !== 'string' ){
        throw new TypeError( 'type must be a string' );
    }
    
    if( typeof value !== 'string' ){
        throw new TypeError( 'value must be a string' );
    }
    
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
    /**
     * The length of the token value
     * @member {external:number} Lexer~Token#length
     */
    this.length = value.length;
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

export { Token as default };

/**
 * @class Lexer~Identifier
 * @extends Lexer~Token
 * @param {external:string} value
 */
export function Identifier( value ){
    Token.call( this, 'identifier', value );
}

Identifier.prototype = Object.create( Token.prototype );

Identifier.prototype.constructor = Identifier;

/**
 * @class Lexer~Literal
 * @extends Lexer~Token
 * @param {external:string} value
 */
export function Literal( value ){
    Token.call( this, 'literal', value );
}

Literal.prototype = Object.create( Token.prototype );

Literal.prototype.constructor = Literal;

/**
 * @class Lexer~Punctuator
 * @extends Lexer~Token
 * @param {external:string} value
 */
export function Punctuator( value ){
    Token.call( this, 'punctuator', value );
}

Punctuator.prototype = Object.create( Token.prototype );

Punctuator.prototype.constructor = Punctuator;