'use strict';

import nextId from '../uuid';
import Null from '../null';

export default function Token( type, value ){
    if( typeof type !== 'string' ){
        throw new TypeError( 'type must be a string' );
    }
    
    if( typeof value === 'undefined' ){
        throw new TypeError( 'value cannot be undefined' );
    }
    
    Object.defineProperties( this, {
        id: {
            value: nextId(),
            configurable: false,
            enumerable: false,
            writable: false
        },
        type: {
            value: type,
            configurable: false,
            enumerable: true,
            writable: false
        },
        value: {
            value: value,
            configurable: false,
            enumerable: true,
            writable: false
        },
        length: {
            value: value.length,
            configurable: false,
            enumerable: false,
            writable: false
        }
    } );
}

Token.prototype = new Null();

Token.prototype.constructor = Token;

Token.prototype.is = function( type ){
    return this.type === type;
};

Token.prototype.toJSON = function(){
    var json = new Null();
    
    json.type = this.type;
    json.value = this.value;
    
    return json;
};

Token.prototype.toString = function(){
    return String( this.value );
};

Token.prototype.valueOf = function(){
    return this.id;
};

export function Identifier( value ){
    Token.call( this, 'identifier', value );
}

Identifier.prototype = Object.create( Token.prototype );

Identifier.prototype.constructor = Identifier;

export function Literal( value ){
    Token.call( this, 'literal', value );
}

Literal.prototype = Object.create( Token.prototype );

Literal.prototype.constructor = Literal;

export function Numeric( value ){
    Token.call( this, 'numeric', value );
}

Numeric.prototype = Object.create( Token.prototype );

Numeric.prototype.constructor = Numeric;

export function Punctuator( value ){
    Token.call( this, 'punctuator', value );
}

Punctuator.prototype = Object.create( Token.prototype );

Punctuator.prototype.constructor = Punctuator;