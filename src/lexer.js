'use strict';

import EventEmitter from '../node_modules/ee.js/dist/ee-es5';

const 
    ignore = Symbol( '@@ignore' ),
    parsers = Symbol( '@@parsers' ),
    rules = Symbol( '@@rules' );

function Token( type, value ){
    if( typeof type !== 'string' ){
        throw new TypeError( 'type must be a string' );
    }
    
    if( typeof value === 'undefined' ){
        throw new TypeError( 'value cannot be undefined' );
    }
    
    Object.defineProperties( this, {
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
            enumerable: true,
            writable: false
        }
    } );
}

Token.prototype = Object.create( null );

Token.prototype[ Symbol.toStringTag ] = 'Token';

Token.prototype.constructor = Token;

Token.prototype.is = function( type ){
    return this.type === type;
};

Token.prototype.toString = function(){
    return String( this.value );
};

Token.prototype.valueOf = function(){
    return this.value;
};

function Keyword( value ){
    Token.call( this, 'keyword', value );
}

Keyword.prototype = Object.create( Token.prototype );

Keyword.prototype.constructor = Keyword;

function Identifier( value ){
    Token.call( this, 'identifier', value );
}

Identifier.prototype = Object.create( Token.prototype );

Identifier.prototype.constructor = Identifier;

function Literal( value ){
    Token.call( this, 'literal', value );
}

Literal.prototype = Object.create( Token.prototype );

Literal.prototype.constructor = Literal;

function Numeric( value ){
    Token.call( this, 'numeric', value );
}

Numeric.prototype = Object.create( Token.prototype );

Numeric.prototype.constructor = Numeric;

function Punctuator( value ){
    Token.call( this, 'punctuator', value );
}

Punctuator.prototype = Object.create( Token.prototype );

Punctuator.prototype.constructor = Punctuator;

function LexerError( message ){
    SyntaxError.call( this, message );    
}

LexerError.prototype = Object.create( SyntaxError.prototype );

export default function Lexer( ruleSet ){
    EventEmitter.call( this );
    
    this.buffer = '';
    
    this[ ignore ]  = Object.create( null );
    this[ parsers ] = Object.create( null );
    this[ rules ]   = Object.create( null );
    
    if( typeof ruleSet === 'object' ){
        for( let type in ruleSet ){
            this.addRule( type, ruleSet[ type ] );
        }
    }
}

Lexer.prototype = Object.create( EventEmitter.prototype );

Lexer.prototype[ Symbol.toStringTag ] = 'Lexer';

Lexer.prototype.constructor = Lexer;

Lexer.prototype.lex = function( text ){
    this.buffer = text;
    this.index = 0;
    this.tokens = [];
    
    var length = this.buffer.length,
    
        word = '';
    
    while( this.index < length ){
        let char = this.buffer[ this.index ];
        
        // Identifier
        if( this.isIdentifier( char ) ){
            word = this.read( function( char ){
                return !this.isIdentifier( char ) && !this.isNumeric( char );
            } );
            
            this.tokens.push( new Identifier( word ) );
        
        // Punctuator
        } else if( this.isPunctuator( char ) ){
            this.tokens.push( new Punctuator( char ) );
            this.index++;
        
        // Literal
        } else if( char === '"' ){
            this.index++;
            
            word = this.read( function( char ){
                return char === '"';
            } );
            
            this.tokens.push( new Literal( word ) );
            
            this.index++;
        
        // Numeric
        } else if( this.isNumeric( char ) ){
            word = this.read( function( char ){
                return !this.isNumeric( char );
            } );
            
            this.tokens.push( new Numeric( word ) );
        } else if( this.isWhitespace( char ) ){
            this.index++;
        } else {
            console.log( 'NO MATCH', char );
            this.index++;
        }
        
        word = '';
    }
    
    return this.tokens;
};

Lexer.prototype.isIdentifier = function( char ){
    return 'a' <= char && char <= 'z' || 'A' <= char && char <= 'Z' || '_' === char || char === '$';
};

Lexer.prototype.isPunctuator = function( char ){
    return char === '.' || char === '(' || char === ')' || char === '[' || char === ']' || char === ',' || char === '%';
};

Lexer.prototype.isWhitespace = function( char ){
    return char === ' ' || char === '\r' || char === '\t' || char === '\n' || char === '\v' || char === '\u00A0';
};

Lexer.prototype.isNumeric = function( char ){
    return ( '0' <= char && char <= '9' ) && typeof char === 'string';
};

Lexer.prototype.peek = function( number ){
    return this.index + number < this.buffer.length ?
        this.buffer[ this.index + number ] :
        undefined;
};

Lexer.prototype.read = function( until ){
    var start = this.index;
    
    while( this.index < this.buffer.length ){
        let char = this.buffer[ this.index ];
        
        if( until.call( this, char ) ){
            break;
        }
        
        this.index++;
    }
    
    return this.buffer.slice( start, this.index );
};


/*
Lexer.prototype.destroy = function(){
    this.flush();
    
    delete this[ ignore ];
    delete this[ parsers ];
    delete this[ rules ];
    
    EventEmitter.prototype.destroy.call( this );
};

Lexer.prototype.addParser = function( type, parser ){
    this[ parsers ][ type ] = parser;
};

Lexer.prototype.addRule = function( type, test ){
    var isFunction = typeof test === 'function',
    
        rule;
    
    if( !isFunction && !( test instanceof RegExp ) ){
        throw new TypeError( 'test must be a function or regular expression' );
    }
    
    rule = isFunction ?
        test :
        function( value ){
            return test.test( value );
        };
    
    this[ rules ][ type ] = rule;
};

Lexer.prototype.flush = function(){
    if( this.buffer || this.index ){
        this.buffer = '';
        this.index = 0;
        this.emit( 'end' );
    }
};

// TODO Do we unignore?
Lexer.prototype.ignore = function( type ){
    this[ ignore ][ type ] = true;
};

Lexer.prototype.lex = function( data ){
    if( typeof data !== 'string' ){
        throw new TypeError( 'data must be a string' );
    }
    
    this.buffer = data;
    this.index = 0;
    
    var length = data.length,
        word = '',
        
        char, rule, type;
    
    while( this.index < length && !rule ){
        word += data[ this.index ];
        
        char = this.index < length ?
            data[ this.index + 1 ] :
            undefined;
        
        for( type in this[ rules ] ){
            rule = this[ rules ][ type ];
            if( rule.call( this, word, char ) ){
                break;
            }
            rule = type = undefined;
        }
        
        this.index++;
    }
    
    console.log( 'BUFFER', this.buffer );
    
    if( word.length === 0 ){
        throw new SyntaxError( `could not tokenize ${data}` );
    } else {
        if( type && !this[ ignore ][ type ] ){
            let parse = this[ parsers ][ type ],
            
                value = typeof parse === 'function' ?
                    parse.call( this, word, char ) :
                    word,
            
                token = new Token( type, value );
            
            this.emit( type, token );
            
            this.buffer = data.substring( ( data.indexOf( value ) !== -1 ? value : word ).length );
        }
        
        this.buffer.length && this.lex( this.buffer );
    }
    
    if( this.index === length ){
        this.emit( 'finish' );
    }
};
*/