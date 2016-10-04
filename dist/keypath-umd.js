(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.KeyPathExp = factory());
}(this, (function () { 'use strict';

/**
 * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
 * @class Null
 * @extends external:null
 */
function Null(){}
Null.prototype = Object.create( null );
Null.prototype.constructor =  Null;

let id = 0;

function nextId(){
    return ++id;
}

/**
 * @class Token
 * @extends Null
 * @param {external:string} type The type of the token
 * @param {*} value The value of the token
 * @throws {external:TypeError} If `type` is not a string
 * @throws {external:TypeError} If `value` is undefined.
 */
function Token( type, value ){
    if( typeof type !== 'string' ){
        throw new TypeError( 'type must be a string' );
    }
    
    if( typeof value === 'undefined' ){
        throw new TypeError( 'value cannot be undefined' );
    }
    
    this.id = nextId();
    this.type = type;
    this.value = value;
    this.length = value.length;
}

Token.prototype = new Null();

Token.prototype.constructor = Token;

Token.prototype.equals = function( token ){
    return token instanceof Token && this.valueOf() === token.valueOf();
};

/**
 * @function
 * @param {external:string} type
 * @returns {external:boolean} Whether or not the token is the `type` provided.
 */
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

function Punctuator( value ){
    Token.call( this, 'punctuator', value );
}

Punctuator.prototype = Object.create( Token.prototype );

Punctuator.prototype.constructor = Punctuator;

/**
 * @class LexerError
 * @extends SyntaxError
 * @param {external:string} message The error message
 */
function LexerError( message ){
    SyntaxError.call( this, message );    
}

LexerError.prototype = Object.create( SyntaxError.prototype );

/**
 * @class Lexer
 * @extends Null
 */
function Lexer(){
    this.buffer = '';
}

Lexer.prototype = new Null();

Lexer.prototype.constructor = Lexer;

Lexer.prototype.lex = function( text ){
    this.buffer = text;
    this.index = 0;
    this.tokens = [];
    
    const length = this.buffer.length;
    let word = '',
        char;
    
    while( this.index < length ){
        char = this.buffer[ this.index ];
        
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
        
        // Quoted String
        } else if( this.isQuote( char ) ){
            let quote = char;
            
            this.index++;
            
            word = this.read( function( char ){
                return char === quote;
            } );
            
            this.tokens.push( new Literal( `${ quote }${ word }${ quote }` ) );
            
            this.index++;
        
        // Numeric
        } else if( this.isNumeric( char ) ){
            word = this.read( function( char ){
                return !this.isNumeric( char );
            } );
            
            this.tokens.push( new Literal( word ) );
        
        // Whitespace
        } else if( this.isWhitespace( char ) ){
            this.index++;
        
        // Error
        } else {
            this.throwError( `"${ char }" is an invalid character` );
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

Lexer.prototype.isQuote = function( char ){
    return char === '"' || char === "'";
};

Lexer.prototype.isNumeric = function( char ){
    return '0' <= char && char <= '9';
};

Lexer.prototype.read = function( until ){
    let start = this.index,
        char;
    
    while( this.index < this.buffer.length ){
        char = this.buffer[ this.index ];
        
        if( until.call( this, char ) ){
            break;
        }
        
        this.index++;
    }
    
    return this.buffer.slice( start, this.index );
};

Lexer.prototype.throwError = function( message ){
    throw new LexerError( message );
};

Lexer.prototype.toJSON = function(){
    const json = new Null();
    
    json.buffer = this.buffer;
    json.tokens = this.tokens.map( function( token ){
        return token.toJSON();
    } );
    
    return json;
};

/**
 * @class Node
 * @extends Null
 * @param {external:string} type The type of node
 */
function Node( type ){
    
    if( typeof type !== 'string' ){
        throw new TypeError( 'type must be a string' );
    }
    
    this.id = nextId();
    this.type = type;
}

Node.prototype = new Null();

Node.prototype.constructor = Node;

Node.prototype.equals = function( node ){
    return node instanceof Node && this.valueOf() === node.valueOf();
};

Node.prototype.is = function( type ){
    return this.type === type;
};

Node.prototype.toJSON = function(){
    const json = new Null();
    
    json.type = this.type;
    
    return json;
};

Node.prototype.toString = function(){
    return String( this.type );
};

Node.prototype.valueOf = function(){
    return this.id;
};

function Statement( statementType ){
    Node.call( this, statementType );
}

Statement.prototype = Object.create( Node.prototype );

Statement.prototype.constructor = Statement;

function Expression( expressionType ){
    Node.call( this, expressionType );
}

Expression.prototype = Object.create( Node.prototype );

Expression.prototype.constructor = Expression;

function Program( body ){
    Node.call( this, 'Program' );
    
    if( !Array.isArray( body ) ){
        throw new TypeError( 'body must be an array' );
    }
    
    this.body = body || [];
}

Program.prototype = Object.create( Node.prototype );

Program.prototype.constructor = Program;

Program.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.body = this.body.map( ( node ) => node.toJSON() );
    
    return json;
};

function ArrayExpression( elements ){
    Expression.call( this, 'ArrayExpression' );
    
    if( !( Array.isArray( elements ) ) ){
        throw new TypeError( 'elements must be a list of expressions' );
    }
    
    this.elements = elements;
}

ArrayExpression.prototype = Object.create( Expression.prototype );

ArrayExpression.prototype.constructor = ArrayExpression;

ArrayExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.elements = this.elements.map( function( element ){
        return element.toJSON();
    } );
    
    return json;
};

function ExpressionStatement( expression ){
    Statement.call( this, 'ExpressionStatement' );
    
    if( !( expression instanceof Expression ) ){
        throw new TypeError( 'argument must be an expression' );
    }
    
    this.expression = expression;
}

ExpressionStatement.prototype = Object.create( Statement.prototype );

ExpressionStatement.prototype.constructor = ExpressionStatement;

ExpressionStatement.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.expression = this.expression.toJSON();
    
    return json;
};

function CallExpression( callee, args ){
    Expression.call( this, 'CallExpression' );
    
    if( !Array.isArray( args ) ){
        throw new TypeError( 'arguments must be an array' );
    }
    
    this.callee = callee;
    this.arguments = args;
}

CallExpression.prototype = Object.create( Expression.prototype );

CallExpression.prototype.constructor = CallExpression;

CallExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.callee    = this.callee.toJSON();
    json.arguments = this.arguments.map( ( node ) => node.toJSON() );
    
    return json;
};

function MemberExpression( object, property, computed ){
    Expression.call( this, 'MemberExpression' );
    
    if( computed ){
        if( !( property instanceof Expression ) ){
            throw new TypeError( 'property must be an expression when computed is true' );
        }
    } else {
        if( !( property instanceof Identifier$1 ) ){
            throw new TypeError( 'property must be an identifier when computed is false' );
        }
    }
    
    this.object = object;
    this.property = property;
    this.computed = computed || false;
}

MemberExpression.prototype = Object.create( Expression.prototype );

MemberExpression.prototype.constructor = MemberExpression;

MemberExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.object   = this.object.toJSON();
    json.property = this.property.toJSON();
    json.computed = this.computed;
    
    return json;
};

function Identifier$1( name ){
    Expression.call( this, 'Identifier' );
    
    if( typeof name !== 'string' ){
        throw new TypeError( 'name must be a string' );
    }
    
    this.name = name;
}

Identifier$1.prototype = Object.create( Expression.prototype );

Identifier$1.prototype.constructor = Identifier$1;

Identifier$1.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.name = this.name;
    
    return json;
};

function Literal$1( value ){
    Expression.call( this, 'Literal' );
    
    const type = typeof value;
    
    if( 'boolean number string'.split( ' ' ).indexOf( type ) === -1 && value !== null && !( value instanceof RegExp ) ){
        throw new TypeError( 'value must be a boolean, number, string, null, or instance of RegExp' );
    }
    
    this.value = value;
}

Literal$1.prototype = Object.create( Expression.prototype );

Literal$1.prototype.constructor = Literal$1;

Literal$1.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.value = this.value;
    
    return json;
};

function SequenceExpression( expressions ){
    Expression.call( this, 'SequenceExpression' );
    
    if( !( Array.isArray( expressions ) ) ){
        throw new TypeError( 'expressions must be a list of expressions' );
    }
    
    this.expressions = expressions;
}

SequenceExpression.prototype = Object.create( Expression.prototype );

SequenceExpression.prototype.constructor = SequenceExpression;

SequenceExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.expressions = this.expressions.map( function( expression ){
        return expression.toJSON();
    } );
    
    return json;
};

/**
 * @class Builder
 * @extends Null
 * @param {Lexer} lexer
 */
function Builder( lexer ){
    if( !arguments.length ){
        throw new TypeError( 'lexer must be provided' );
    }
    
    this.lexer = lexer;
}

Builder.prototype = new Null();

Builder.prototype.constructor = Builder;

/**
 * @function
 * @param {external:string} text
 * @returns {Program} The built abstract syntax tree
 */
Builder.prototype.build = function( text ){
    /**
     * @member {external:string}
     */
    this.text = text;
    /**
     * @member {external:Array<Token>}
     */
    this.tokens = this.lexer.lex( text );
    
    var program = this.program();
    
    if( this.tokens.length ){
        this.throwError( 'Unexpected token ' + this.tokens[ 0 ] + ' remaining' );
    }
    
    return program;
};

/**
 * @function
 * @returns {CallExpression} The call expression node
 */
Builder.prototype.callExpression = function(){
    var args = this.list( '(' );
    this.consume( '(' );
    var callee = this.expression();
    
    //console.log( 'CALL EXPRESSION' );
    //console.log( '- CALLEE', callee );
    //console.log( '- ARGUMENTS', args, args.length );
    
    return new CallExpression( callee, args );
};

/**
 * @function
 * @param {external:string} [expected]
 * @returns {Token} The next token in the list
 */
Builder.prototype.consume = function( expected ){
    if( !this.tokens.length ){
        this.throwError( 'Unexpected end of expression' );
    }
    
    var token = this.expect( expected );
    
    if( !token ){
        this.throwError( 'Unexpected token ' + token.value + ' consumed' );
    }
    
    return token;
};

/**
 * @function
 * @param {external:string} [first]
 * @param {external:string} [second]
 * @param {external:string} [third]
 * @param {external:string} [fourth]
 * @returns {Token} The next token in the list
 */
Builder.prototype.expect = function( first, second, third, fourth ){
    var token = this.peek( first, second, third, fourth );
    
    if( token ){
        this.tokens.pop();
        return token;
    }
    
    return undefined;
};

/**
 * @function
 * @returns {Expression} An expression node
 */
Builder.prototype.expression = function(){
    var expression = null,
        list, next, token;
    
    if( next = this.peek() ){
        if( this.expect( ']' ) ){
            list = this.list( '[' );
            if( this.tokens.length === 1 ){
                expression = new ArrayExpression( list );
                this.consume( '[' );
            } else if( list.length > 1 ){
                expression = new SequenceExpression( list );
            } else {
                expression = list[ 0 ];
            }
        } else if( next.type === 'identifier' ){
            expression = this.identifier();
            next = this.peek();
            
            // Implied member expression
            if( next && next.type === 'punctuator' ){
                if( next.value === ')' || next.value === ']' ){
                    expression = this.memberExpression( expression, false );
                }
            }
        } else if( next.type === 'literal' ){
            expression = this.literal();
        }
        
        while( ( token = this.expect( ')', '[', '.' ) ) ){
            if( token.value === ')' ){
                expression = this.callExpression();
            } else if( token.value === '[' ){
                expression = this.memberExpression( expression, true );
            } else if( token.value === '.' ){
                expression = this.memberExpression( expression, false );
            } else {
                this.throwError( 'Unexpected token ' + token );
            }
        }
    }
    
    return expression;
};

/**
 * @function
 * @returns {ExpressionStatement} An expression statement
 */
Builder.prototype.expressionStatement = function(){
    return new ExpressionStatement( this.expression() );
};

/**
 * @function
 * @returns {Identifier} An identifier
 * @throws {SyntaxError} If the token is not an identifier
 */
Builder.prototype.identifier = function(){
    var token = this.consume();
    
    if( !( token.type === 'identifier' ) ){
        this.throwError( 'Identifier expected' );
    }
    
    return new Identifier$1( token.value );
};

/**
 * @function
 * @returns {Literal} The literal node
 */
Builder.prototype.literal = function(){
    var token = this.consume();
    
    if( !( token.type === 'literal' ) ){
        this.throwError( 'Literal expected' );
    }
    
    var value = token.value,
    
        literal = value[ 0 ] === '"' || value[ 0 ] === "'" ?
            // String Literal
            value.substring( 1, value.length - 1 ) :
            // Numeric Literal
            parseFloat( value );
    
    return new Literal$1( literal );
};

/**
 * @function
 * @param {external:string} terminator
 * @returns {external:Array<Literal>} The list of literals
 */
Builder.prototype.list = function( terminator ){
    var list = [];
    
    if( this.peek().value !== terminator ){
        do {
            list.unshift( this.literal() );
        } while( this.expect( ',' ) );
    }
    
    return list;
};

/**
 * @function
 * @param {Expression} property The expression assigned to the property of the member expression
 * @param {external:boolean} computed Whether or not the member expression is computed
 * @returns {MemberExpression} The member expression
 */
Builder.prototype.memberExpression = function( property, computed ){
    var object = this.expression();
    
    //console.log( 'MEMBER EXPRESSION' );
    //console.log( '- OBJECT', object );
    //console.log( '- PROPERTY', property );
    //console.log( '- COMPUTED', computed );
    
    return new MemberExpression( object, property, computed );
};

Builder.prototype.peek = function( first, second, third, fourth ){
    var length = this.tokens.length;
    return length ?
        this.peekAt( length - 1, first, second, third, fourth ) :
        undefined;
};

Builder.prototype.peekAt = function( index, first, second, third, fourth ){
    if( typeof index === 'number' ){
        var token = this.tokens[ index ],
            value = token.value;
        
        if( value === first || value === second || value === third || value === fourth || !arguments.length || ( !first && !second && !third && !fourth ) ){
            return token;
        }
    }
    
    return undefined;
};

/**
 * @function
 * @returns {Program} A program node
 */
Builder.prototype.program = function(){
    var body = [];
    
    while( true ){
        if( this.tokens.length ){
            body.push( this.expressionStatement() );
        } else {
            return new Program( body );
        }
    }
};

/*
Builder.prototype.punctuator = function(){
    var token = this.consume();
    
    if( !( token.type === 'punctuator' ) ){
        this.throwError( 'Punctuator expected' );
    }
    
    return new Punctuator( token.value );
};
*/

/**
 * @function
 * @param {external:string} message The error message
 * @throws {external:SyntaxError} When it executes
 */
Builder.prototype.throwError = function( message ){
    throw new SyntaxError( message );
};

function forEach( arrayLike, callback ){
    let index = 0,
        length = arrayLike.length,
        item;
    
    for( ; index < length; index++ ){
        item = arrayLike[ index ];
        callback( item, index );
    }
}

const noop = function(){};
const interpret = new Null();

/**
 * @function
 * @param {Interpreter} interpeter
 * @param {Node} node
 * @param {external:boolean} context
 * @returns {external:Function} The interpreted expression.
 */
interpret.ArrayExpression = function( interpreter, node, context ){
    const args = [];
    
    forEach( node.elements, function( expr ){
        args.push( interpreter.recurse( expr, false ) );
    } );
    
    return function( base, value ){
        //console.log( 'ARRAY EXPRESSION' );
        
        let result = [];
        
        forEach( args, function( arg ){
            result.push( base[ arg( base, value ) ] );
        } );
        
        if( result.length === 1 ){
            result = result[ 0 ];
        }
        
        //console.log( '- ARRAY RESULT', result );
        
        return context ?
            { value: result } :
            result;
    };
};

/**
 * @function
 * @param {Interpreter} interpeter
 * @param {Node} node
 * @param {external:boolean} context
 * @returns {external:Function} The interpreted expression.
 */
interpret.CallExpression = function( interpreter, node, context ){
    const args = [];
            
    forEach( node.arguments, function( expr ){
        args.push( interpreter.recurse( expr, false ) );
    } );
    
    const right = interpreter.recurse( node.callee, true );
    
    return function( base, value ){
        //console.log( 'CALL EXPRESSION' );
        const rhs = right( base, value );
        let result;
        
        if( typeof rhs.value === 'function' ){
            const values = args.map( function( arg ){
                return arg( base, value );
            } );
            result = rhs.value.apply( rhs.context, values );
        } else if( typeof value !== 'undefined' ){
            throw new Error( 'cannot create functions' );
        }
        
        //console.log( '- CALL RESULT', result );
        
        return context ?
            { value: result }:
            result;
    };
};

/**
 * @function
 * @param {Interpreter} interpeter
 * @param {Node} node
 * @param {external:boolean} context
 * @returns {external:Function} The interpreted expression.
 */
interpret.Identifier = function( interpreter, node, context ){
    const name = node.name;
    return function( base, value ){
        //console.log( 'IDENTIFIER' );
        let result;
        
        if( typeof base !== 'undefined' ){
            if( typeof value !== 'undefined' && !( name in base ) ){
                base[ name ] = new Null();
            }
            
            result = base[ name ];
        }
        
        //console.log( '- NAME', name );
        //console.log( '- IDENTIFIER RESULT', result );
        
        return context ?
            { context: base, name: name, value: result } :
            result;
    };
};

/**
 * @function
 * @param {Interpreter} interpeter
 * @param {Node} node
 * @param {external:boolean} context
 * @returns {external:Function} The interpreted expression.
 */
interpret.Literal = function( interpreter, node, context ){
    const value = node.value;
    return function(){
        //console.log( 'LITERAL' );
        //console.log( '- LITERAL RESULT', value );
        return context ?
            { context: undefined, name: undefined, value: value } :
            value;
    };
};

/**
 * @function
 * @param {Interpreter} interpeter
 * @param {Node} node
 * @param {external:boolean} context
 * @returns {external:Function} The interpreted expression.
 */
interpret.MemberExpression = function( interpreter, node, context ){
    const left = interpreter.recurse( node.object, false );
    
    let fn, lhs, result, rhs, right;
    
    if( node.computed ){
        right = interpreter.recurse( node.property, false );
        fn = function( base, value ){
            //console.log( 'COMPUTED MEMBER' );
            lhs = left( base, value );
            
            //console.log( '- COMPUTED LHS', lhs );
            
            if( typeof lhs !== 'undefined' ){
                rhs = right( base, value );
                
                if( typeof value !== 'undefined' && !( rhs in lhs ) ){
                    lhs[ rhs ] = new Null();
                }
                
                //console.log( '- COMPUTED RHS', rhs );
                
                if( Array.isArray( lhs ) ){
                    // Sequence expression
                    if( Array.isArray( rhs ) ){
                        result = rhs.map( function( index ){
                            return lhs[ index ];
                        } );
                    // Literal expression
                    } else if( lhs.length === 1 ){
                        result = lhs[ 0 ];
                    // Array expression
                    } else {
                        result = lhs.map( function( index ){
                            return lhs[ index ];
                        } );
                    }
                } else {
                    result = lhs[ rhs ];
                }
            }
            
            //console.log( '- COMPUTED RESULT', result );
            
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else {
        right = node.property.name;
        fn = function( base, value ){
            //console.log( 'NON-COMPUTED MEMBER' );
            lhs = left( base, value );
            
            //console.log( '- NON-COMPUTED LHS', lhs );
            
            if( typeof lhs !== 'undefined' ){
                if( typeof value !== 'undefined' && !( right in lhs ) ){
                    lhs[ right ] = value || new Null();
                }
                
                //console.log( '- NON-COMPUTED RIGHT', right );
                
                if( Array.isArray( lhs ) ){
                    result = lhs.map( function( item ){
                       return item[ right ];
                    } );
                } else {
                    result = lhs[ right ];
                }
            }
            
            //console.log( '- NON-COMPUTED RESULT', result );
            
            return context ?
                { context: lhs, name: right, value: result } :
                result;
        };
    }
    
    return fn;
};

/**
 * @function
 * @param {Interpreter} interpeter
 * @param {Node} node
 * @param {external:boolean} context
 * @returns {external:Function} The interpreted expression.
 */
interpret.SequenceExpression = function( interpreter, node, context ){
    const args = [];
    
    forEach( node.expressions, function( expr ){
        args.push( interpreter.recurse( expr, false ) );
    } );
    
    return function( base, value ){
        //console.log( 'SEQUENCE EXPRESSION' );
        
        const result = [];
        
        forEach( args, function( arg ){
            result.push( arg( base, value ) );
        } );
        
        //console.log( '- SEQUENCE RESULT', result );
        
        return context ?
            { value: result } :
            result;
    };
};

/**
 * @class Interpreter
 * @extends Null
 * @param {Builder} builder
 */
function Interpreter( builder ){
    if( !arguments.length ){
        throw new TypeError( 'builder cannot be undefined' );
    }
    
    this.builder = builder;
}

Interpreter.prototype = new Null();

Interpreter.prototype.constructor = Interpreter;

/**
 * @function
 * @param {external:string} expression
 */
Interpreter.prototype.compile = function( expression ){
    const ast = this.builder.build( expression ),
        body = ast.body,
        interpreter = this;
    
    let fn;
    
    interpreter.expression = expression;
    
    switch( body.length ){
        case 0:
            fn = noop;
            break;
        case 1:
            fn = interpreter.recurse( body[ 0 ].expression, false );
            break;
        default:
            const expressions = [];
            forEach( body, function( statement ){
                expressions.push( interpreter.recurse( statement.expression, false ) );
            } );
            fn = function( base, value ){
                let lastValue;
                
                forEach( expressions, function( expression ){
                    lastValue = expression( base, value );
                } );
                
                return lastValue;
            };
            break;
    }
    
    return fn;
};

Interpreter.prototype.recurse = function( node, context ){
    ////console.log( 'RECURSE', node );
    
    if( !( node.type in interpret ) ){
        this.throwError( `Unknown node type ${ node.type }` );
    }
    
    return interpret[ node.type ]( this, node, context );
};

Interpreter.prototype.throwError = function( message ){
    throw new Error( message );
};

const lexer = new Lexer();
const builder = new Builder( lexer );
const intrepreter = new Interpreter( builder );

/**
 * @class KeyPathExp
 * @extends Null
 * @param {external:string} pattern
 * @param {external:string} flags
 */
function KeyPathExp( pattern, flags ){
    Object.defineProperty( this, 'value', {
        value: intrepreter.compile( pattern ),
        configurable: false,
        enumerable: false,
        writable: false
    } );
}

KeyPathExp.prototype = new Null();

KeyPathExp.prototype.constructor = KeyPathExp;

KeyPathExp.prototype.get = function( target ){
    return this.value( target, false );
};

KeyPathExp.prototype.set = function( target, value ){
    return this.value( target, true, value );
};

return KeyPathExp;

})));

//# sourceMappingURL=keypath-umd.js.map