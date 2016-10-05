(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Builder = factory());
}(this, (function () { 'use strict';

/**
 * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
 * @class Null
 * @extends external:null
 */
function Null(){}
Null.prototype = Object.create( null );
Null.prototype.constructor =  Null;

var id = 0;

function nextId(){
    return ++id;
}

/**
 * @typedef {external:string} Builder~NodeType
 */

/**
 * @class Builder~Node
 * @extends Null
 * @param {Builder~NodeType} type A node type
 */
function Node( type ){
    
    if( typeof type !== 'string' ){
        throw new TypeError( 'type must be a string' );
    }
    
    /**
     * @member {external:number} Builder~Node#id
     */
    this.id = nextId();
    /**
     * @member {Builder~NodeType} Builder~Node#type
     */
    this.type = type;
}

Node.prototype = new Null();

Node.prototype.constructor = Node;

/**
 * @function
 * @param {Builder~NodeType} type A node type
 * @returns {external:boolean} Whether or not the node is of the type provided.
 */
Node.prototype.is = function( type ){
    return this.type === type;
};

/**
 * @function
 * @returns {external:Object} A JSON representation of the node
 */
Node.prototype.toJSON = function(){
    const json = new Null();
    
    json.type = this.type;
    
    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the node
 */
Node.prototype.toString = function(){
    return String( this.type );
};

Node.prototype.valueOf = function(){
    return this.id;
};

/**
 * @class Builder~Statement
 * @extends Builder~Node
 * @param {Builder~NodeType} statementType A node type
 */
function Statement( statementType ){
    Node.call( this, statementType );
}

Statement.prototype = Object.create( Node.prototype );

Statement.prototype.constructor = Statement;

/**
 * @class Builder~Expression
 * @extends Builder~Node
 * @param {Builder~NodeType} expressionType A node type
 */
function Expression( expressionType ){
    Node.call( this, expressionType );
}

Expression.prototype = Object.create( Node.prototype );

Expression.prototype.constructor = Expression;

/**
 * @class Builder~Program
 * @extends Builder~Node
 * @param {external:Array<Builder~Statement>} body
 */
function Program( body ){
    Node.call( this, 'Program' );
    
    if( !Array.isArray( body ) ){
        throw new TypeError( 'body must be an array' );
    }
    
    /**
     * @member {external:Array<Builder~Statement>}
     */
    this.body = body || [];
}

Program.prototype = Object.create( Node.prototype );

Program.prototype.constructor = Program;

/**
 * @function
 * @returns {external:Object} A JSON representation of the program
 */
Program.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.body = this.body.map( ( node ) => node.toJSON() );
    
    return json;
};

/**
 * @class Builder~ArrayExpression
 * @extends Builder~Expression
 * @param {external:Array<Builder~Expression>} elements A list of expressions
 */
function ArrayExpression( elements ){
    Expression.call( this, 'ArrayExpression' );
    
    if( !( Array.isArray( elements ) ) ){
        throw new TypeError( 'elements must be a list of expressions' );
    }
    
    /**
     * @member {Array<Builder~Expression>}
     */
    this.elements = elements;
}

ArrayExpression.prototype = Object.create( Expression.prototype );

ArrayExpression.prototype.constructor = ArrayExpression;

/**
 * @function
 * @returns {external:Object} A JSON representation of the array expression
 */
ArrayExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.elements = this.elements.map( function( element ){
        return element.toJSON();
    } );
    
    return json;
};

/**
 * @class Builder~ExpressionStatement
 * @extends Builder~Statement
 */
function ExpressionStatement( expression ){
    Statement.call( this, 'ExpressionStatement' );
    
    if( !( expression instanceof Expression ) ){
        throw new TypeError( 'argument must be an expression' );
    }
    
    /**
     * @member {Builder~Expression}
     */
    this.expression = expression;
}

ExpressionStatement.prototype = Object.create( Statement.prototype );

ExpressionStatement.prototype.constructor = ExpressionStatement;

/**
 * @function
 * @returns {external:Object} A JSON representation of the expression statement
 */
ExpressionStatement.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.expression = this.expression.toJSON();
    
    return json;
};

/**
 * @class Builder~CallExpression
 * @extends Builder~Expression
 * @param {Builder~Expression} callee
 * @param {Array<Builder~Expression>} args
 */
function CallExpression( callee, args ){
    Expression.call( this, 'CallExpression' );
    
    if( !Array.isArray( args ) ){
        throw new TypeError( 'arguments must be an array' );
    }
    
    /**
     * @member {Builder~Expression}
     */
    this.callee = callee;
    /**
     * @member {Array<Builder~Expression>}
     */
    this.arguments = args;
}

CallExpression.prototype = Object.create( Expression.prototype );

CallExpression.prototype.constructor = CallExpression;

/**
 * @function
 * @returns {external:Object} A JSON representation of the call expression
 */
CallExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.callee    = this.callee.toJSON();
    json.arguments = this.arguments.map( ( node ) => node.toJSON() );
    
    return json;
};

/**
 * @class Builder~MemberExpression
 * @extends Builder~Expression
 * @param {Builder~Expression} object
 * @param {Builder~Expression|Builder~Identifier} property
 * @param {external:boolean} computed=false
 */
function MemberExpression( object, property, computed ){
    Expression.call( this, 'MemberExpression' );
    
    if( computed ){
        if( !( property instanceof Expression ) ){
            throw new TypeError( 'property must be an expression when computed is true' );
        }
    } else {
        if( !( property instanceof Identifier ) ){
            throw new TypeError( 'property must be an identifier when computed is false' );
        }
    }
    
    /**
     * @member {Builder~Expression}
     */
    this.object = object;
    /**
     * @member {Builder~Expression|Builder~Identifier}
     */
    this.property = property;
    /**
     * @member {external:boolean}
     */
    this.computed = computed || false;
}

MemberExpression.prototype = Object.create( Expression.prototype );

MemberExpression.prototype.constructor = MemberExpression;

/**
 * @function
 * @returns {external:Object} A JSON representation of the member expression
 */
MemberExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.object   = this.object.toJSON();
    json.property = this.property.toJSON();
    json.computed = this.computed;
    
    return json;
};

/**
 * @class Builder~Identifier
 * @extends Builder~Expression
 * @param {external:string} name The name of the identifier
 */
function Identifier( name ){
    Expression.call( this, 'Identifier' );
    
    if( typeof name !== 'string' ){
        throw new TypeError( 'name must be a string' );
    }
    
    /**
     * @member {external:string}
     */
    this.name = name;
}

Identifier.prototype = Object.create( Expression.prototype );

Identifier.prototype.constructor = Identifier;

/**
 * @function
 * @returns {external:Object} A JSON representation of the identifier
 */
Identifier.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.name = this.name;
    
    return json;
};

/**
 * @class Builder~Literal
 * @extends Builder~Expression
 * @param {external:string|external:number} value The value of the literal
 */
function Literal( value ){
    Expression.call( this, 'Literal' );
    
    const type = typeof value;
    
    if( 'boolean number string'.split( ' ' ).indexOf( type ) === -1 && value !== null && !( value instanceof RegExp ) ){
        throw new TypeError( 'value must be a boolean, number, string, null, or instance of RegExp' );
    }
    
    /**
     * @member {external:string|external:number}
     */
    this.value = value;
}

Literal.prototype = Object.create( Expression.prototype );

Literal.prototype.constructor = Literal;

/**
 * @function
 * @returns {external:Object} A JSON representation of the literal
 */
Literal.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.value = this.value;
    
    return json;
};

/**
 * @class Builder~SequenceExpression
 * @extends Builder~Expression
 * @param {Array<Builder~Expression>} expressions The expressions in the sequence
 */
function SequenceExpression( expressions ){
    Expression.call( this, 'SequenceExpression' );
    
    if( !( Array.isArray( expressions ) ) ){
        throw new TypeError( 'expressions must be a list of expressions' );
    }
    
    /**
     * @member {Array<Builder~Expression>}
     */
    this.expressions = expressions;
}

SequenceExpression.prototype = Object.create( Expression.prototype );

SequenceExpression.prototype.constructor = SequenceExpression;

/**
 * @function
 * @returns {external:Object} A JSON representation of the sequence expression
 */
SequenceExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.expressions = this.expressions.map( function( expression ){
        return expression.toJSON();
    } );
    
    return json;
};

/**
 * @class Builder~Punctuator
 * @extends Builder~Node
 * @param {external:string} value
 */

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
 * Removes the next token in the token list. If a comparison is provided, the token will only be returned if the value matches. Otherwise an error is thrown.
 * @function
 * @param {external:string} [expected] An expected comparison value
 * @returns {Token} The next token in the list
 * @throws {SyntaxError} If token did not exist
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
 * Removes the next token in the token list. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.
 * @function
 * @param {external:string} [first] The first comparison value
 * @param {external:string} [second] The second comparison value
 * @param {external:string} [third] The third comparison value
 * @param {external:string} [fourth] The fourth comparison value
 * @returns {Token} The next token in the list or `undefined` if it did not exist
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
    
    return new Identifier( token.value );
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
    
    return new Literal( literal );
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

/**
 * Provides the next token in the token list _without removing it_. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.
 * @function
 * @param {external:string} [first] The first comparison value
 * @param {external:string} [second] The second comparison value
 * @param {external:string} [third] The third comparison value
 * @param {external:string} [fourth] The fourth comparison value
 * @returns {Lexer~Token} The next token in the list or `undefined` if it did not exist
 */
Builder.prototype.peek = function( first, second, third, fourth ){
    return this.tokens.length ?
        this.peekAt( 0, first, second, third, fourth ) :
        undefined;
};

/**
 * Provides the token at the requested position _without removing it_ from the token list. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.
 * @function
 * @param {external:number} position The position where the token will be peeked
 * @param {external:string} [first] The first comparison value
 * @param {external:string} [second] The second comparison value
 * @param {external:string} [third] The third comparison value
 * @param {external:string} [fourth] The fourth comparison value
 * @returns {Lexer~Token} The token at the requested position or `undefined` if it did not exist
 */
Builder.prototype.peekAt = function( position, first, second, third, fourth ){
    var index, length, token, value;
    
    if( typeof position === 'number' && position > -1 ){
        length = this.tokens.length;
        index = length - position - 1;
        
        if( index > -1 && index < length ){
            token = this.tokens[ index ];
            value = token.value;
            
            if( value === first || value === second || value === third || value === fourth || ( !first && !second && !third && !fourth ) ){
                return token;
            }
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

return Builder;

})));

//# sourceMappingURL=builder-umd.js.map