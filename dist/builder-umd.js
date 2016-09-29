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

let id = 0;

function nextId(){
    return ++id;
}

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
        if( !( property instanceof Identifier ) ){
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

function Identifier( name ){
    Expression.call( this, 'Identifier' );
    
    if( typeof name !== 'string' ){
        throw new TypeError( 'name must be a string' );
    }
    
    this.name = name;
}

Identifier.prototype = Object.create( Expression.prototype );

Identifier.prototype.constructor = Identifier;

Identifier.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.name = this.name;
    
    return json;
};

function Literal( value ){
    Expression.call( this, 'Literal' );
    
    const type = typeof value;
    
    if( 'boolean number string'.split( ' ' ).indexOf( type ) === -1 && value !== null && !( value instanceof RegExp ) ){
        throw new TypeError( 'value must be a boolean, number, string, null, or instance of RegExp' );
    }
    
    this.value = value;
}

Literal.prototype = Object.create( Expression.prototype );

Literal.prototype.constructor = Literal;

Literal.prototype.toJSON = function(){
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
    this.buffer = text;
    this.tokens = this.lexer.lex( text );
    
    const program = this.program();
    
    if( this.tokens.length ){
        this.throwError( `Unexpected token ${ this.tokens[ 0 ] } remaining` );
    }
    
    return program;
};

/**
 * @function
 * @returns {CallExpression} The call expression node
 */
Builder.prototype.callExpression = function(){
    const args = this.list( '(' );
    this.consume( '(' );
    const callee = this.expression();
    
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
    
    const token = this.expect( expected );
    
    if( !token ){
        this.throwError( `Unexpected token ${ token.value } consumed` );
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
    const token = this.peek( first, second, third, fourth );
    
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
    let expression = null,
        list;
    
    if( this.peek() ){
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
        } else if( this.peek().is( 'identifier' ) ){
            expression = this.identifier();
            
            // Implied member expression
            if( this.peek() && this.peek().is( 'punctuator' ) ){
                if( this.peek( ')' ) || this.peek( ']' ) ){
                    expression = this.memberExpression( expression, false );
                }
            }
        } else if( this.peek().is( 'literal' ) ){
            expression = this.literal();
        }
        
        let next;
        
        while( ( next = this.expect( ')', '[', '.' ) ) ){
            if( next.value === ')' ){
                expression = this.callExpression();
            } else if( next.value === '[' ){
                expression = this.memberExpression( expression, true );
            } else if( next.value === '.' ){
                expression = this.memberExpression( expression, false );
            } else {
                this.throwError( `Unexpected token ${ next }` );
            }
        }
    }
    
    return expression;
};

Builder.prototype.expressionStatement = function(){
    return new ExpressionStatement( this.expression() );
};

Builder.prototype.identifier = function(){
    const token = this.consume();
    
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
    const token = this.consume();
    
    if( !( token.type === 'literal' ) ){
        this.throwError( 'Literal expected' );
    }
    
    const value = token.value,
    
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
    const list = [];
    
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
    const object = this.expression();
    
    //console.log( 'MEMBER EXPRESSION' );
    //console.log( '- OBJECT', object );
    //console.log( '- PROPERTY', property );
    //console.log( '- COMPUTED', computed );
    
    return new MemberExpression( object, property, computed );
};

Builder.prototype.peek = function( first, second, third, fourth ){
    const length = this.tokens.length;
    return length ?
        this.peekAt( length - 1, first, second, third, fourth ) :
        undefined;
};

Builder.prototype.peekAt = function( index, first, second, third, fourth ){
    if( typeof index === 'number' ){
        const token = this.tokens[ index ],
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
    const body = [];
    
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
    const token = this.consume();
    
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