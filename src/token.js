import Null from './null';
import * as Grammar from './grammar';

var tokenId = 0,

    tokenPrototype;

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
export function BooleanLiteral( value ){
    Token.call( this, Grammar.BooleanLiteral, value );
}

BooleanLiteral.prototype = Object.create( tokenPrototype );

BooleanLiteral.prototype.constructor = BooleanLiteral;

export function EndOfLine(){
    Token.call( this, Grammar.EndOfLine, '' );
}

EndOfLine.prototype = Object.create( tokenPrototype );

EndOfLine.prototype.constructor = EndOfLine;

/**
 * @class Lexer~Identifier
 * @extends Lexer~Token
 * @param {external:string} value
 */
export function Identifier( value ){
    Token.call( this, Grammar.Identifier, value );
}

Identifier.prototype = Object.create( tokenPrototype );

Identifier.prototype.constructor = Identifier;

/**
 * @class Lexer~NumericLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
export function NumericLiteral( value ){
    Token.call( this, Grammar.NumericLiteral, value );
}

NumericLiteral.prototype = Object.create( tokenPrototype );

NumericLiteral.prototype.constructor = NumericLiteral;

/**
 * @class Lexer~NullLiteral
 * @extends Lexer~Token
 */
export function NullLiteral(){
    Token.call( this, Grammar.NullLiteral, 'null' );
}

NullLiteral.prototype = Object.create( tokenPrototype );

NullLiteral.prototype.constructor = NullLiteral;

/**
 * @class Lexer~Punctuator
 * @extends Lexer~Token
 * @param {external:string} value
 */
export function Punctuator( value ){
    Token.call( this, Grammar.Punctuator, value );
}

Punctuator.prototype = Object.create( tokenPrototype );

Punctuator.prototype.constructor = Punctuator;

/**
 * @class Lexer~StringLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
export function StringLiteral( value ){
    Token.call( this, Grammar.StringLiteral, value );
}

StringLiteral.prototype = Object.create( tokenPrototype );

StringLiteral.prototype.constructor = StringLiteral;