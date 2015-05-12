'use strict';

import EventEmitter from '../node_modules/ee.js/dist/ee';

const 
    buffer = Symbol( '@@buffer' ),
    destroyed = Symbol( '@@destroyed' ),
    ignore = Symbol( '@@ignore' ),
    rules = Symbol( '@@rules' ),
    
    some = Array.prototype.some;

function Token( content, type ){
    if( arguments.length !== 2 ){
        throw new Error( 'content and type are required' );
    }
    
    String.call( this );
    
    this.content = content;
    this.type = type;
}

Token.prototype = Object.create( String.prototype );

Token.prototype[ Symbol.toStringTag ] = 'Token';

Token.prototype.toString = function(){
    return String( this.content );    
};

Token.prototype.valueOf = function(){
    return this.content;
};

function Rule( id, test ){
    var isFunction = typeof test === 'function';
    
    if( !isFunction && !( test instanceof RegExp ) ){
        throw new TypeError( 'test must be a function or regular expression' );
    }
    
    this.id = id;
    this.test = isFunction ?
        test :
        function( value ){
            return test.test( value );
        };
}

Rule.prototype = Object.create( null );

Rule.prototype[ Symbol.toStringTag ] = 'Rule';

Rule.prototype.execute = function( value ){
    return this.test( value );
};

export default function Tokenizer(){
    EventEmitter.call( this );
    
    this[ buffer ] = '';
    this[ ignore ] = Object.create( null );
    this[ rules ] = new Set();
    this[ destroyed ] = false;
}

Tokenizer.prototype = Object.create( EventEmitter.prototype );

Tokenizer.prototype[ Symbol.toStringTag ] = 'Tokenizer';

Tokenizer.prototype.addRule = function( id, test ){
    var rule = new Rule( id, test );
    
    this[ rules ].add( rule );
};

Tokenizer.prototype.destroy = function(){
    if( this[ destroyed] ){
        return;
    }
    
    this[ destroyed ] = true;
    
    this.flush();
    delete this[ buffer ];
    delete this[ ignore ];
    delete this[ rules ];
    
    this.destroy = function(){};
};

Tokenizer.prototype.flush = function(){
    this[ buffer ] = '';
    this.emit( 'end' );
};

Tokenizer.prototype.ignore = function( id ){
    this[ ignore ][ id ] = true;
};

Tokenizer.prototype.match = function( value ){
    for( let rule of this[ rules ] ){
        if( rule.execute( value ) ){
            return rule;
        }
    }
    
    return null;
};

Tokenizer.prototype.tokenize = function( data ){
    data = this[ buffer ] + data;
    this[ buffer ] = '';
    
    if( !data.length ){
        return;
    }
    
    console.log( 'DATA', data );
    
    var matchingRule = undefined,
    
        string = '';
    
    some.call( data, function( char ){
        string += char;
        
        matchingRule = this.match( string );
        
        console.log( 'MATCH', string, matchingRule );
        
        return matchingRule !== null;
    }, this );
    
    // TODO handle data remaining in buffer
    // TODO emit "finish" when tokenization is done.
    
    if( string.length === 0 ){
        throw new SyntaxError( `could not tokenize ${data}` );
    } else if( string.length === data.length ){
        this[ buffer ] = data;
        return;
    } else {
        if( !this[ ignore ][ matchingRule.id ] ){
            var token = new Token( string, matchingRule.id );
            this.emit( 'token', token, matchingRule.id );
        }
        this.tokenize( data.substring( string.length ) );
    }
};