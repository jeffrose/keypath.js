'use strict';

import Null from '../null';
import Position from './position';
import SourceLocation from './sourceLocation';

var nodeId = 0;

/**
 * @typedef {external:string} Builder~NodeType
 */

/**
 * @class Builder~Node
 * @extends Null
 * @param {Builder~NodeType} type A node type
 */
function Node( type, location ){
    
    if( typeof type !== 'string' ){
        throw new TypeError( 'type must be a string' );
    }
    
    if( arguments.length > 1 && !( location instanceof SourceLocation ) ){
        throw new TypeError( 'location must be an instance of SourceLocation' );
    }
    
    /**
     * @member {external:number} Builder~Node#id
     */
    this.id = ++nodeId;
    /**
     * @member {Builder~NodeType} Builder~Node#type
     */
    this.type = type;
    
    this.loc = location || null;
}

Node.prototype = new Null();

Node.prototype.constructor = Node;

/**
 * @function
 * @returns {external:Object} A JSON representation of the node
 */
Node.prototype.toJSON = function(){
    const json = new Null();
    
    json.loc = this.loc.toJSON();
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

export { Node as default };

/**
 * @class Builder~Statement
 * @extends Builder~Node
 * @param {Builder~NodeType} statementType A node type
 */
function Statement( statementType, location ){
    Node.call( this, statementType, location );
}

Statement.prototype = Object.create( Node.prototype );

Statement.prototype.constructor = Statement;

/**
 * @class Builder~Expression
 * @extends Builder~Node
 * @param {Builder~NodeType} expressionType A node type
 */
function Expression( expressionType, location ){
    Node.call( this, expressionType, location );
}

Expression.prototype = Object.create( Node.prototype );

Expression.prototype.constructor = Expression;

/**
 * @class Builder~Program
 * @extends Builder~Node
 * @param {external:Array<Builder~Statement>} body
 */
export function Program( body ){
    var start = body.length ?
            body[ 0 ].loc.start :
            new Position( 1, 1 ),
        end = body.length ?
            body[ body.length - 1 ].loc.end :
            new Position( 1, 1 ),
        location = new SourceLocation( start, end );
        
    Node.call( this, 'Program', location );
    
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
export function ArrayExpression( elements, location ){
    Expression.call( this, 'ArrayExpression', location );
    
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
export function ExpressionStatement( expression ){
    var start = expression.loc.start,
        end = expression.loc.end,
        location = new SourceLocation( start, end );
        
    Statement.call( this, 'ExpressionStatement', location );
    
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
export function CallExpression( callee, args, location ){
    Expression.call( this, 'CallExpression', location );
    
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
export function MemberExpression( object, property, computed, location ){
    Expression.call( this, 'MemberExpression', location );
    
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
export function Identifier( name, location ){
    Expression.call( this, 'Identifier', location );
    
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
export function Literal( value, location ){
    Expression.call( this, 'Literal', location );
    
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
export function SequenceExpression( expressions, location ){
    Expression.call( this, 'SequenceExpression', location );
    
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
export function Punctuator( value, location ){
    Node.call( this, 'Punctuator', location );
    
    if( typeof value !== 'string' ){
        throw new TypeError( 'value must be a string' );
    }
    
    /**
     * @member {external:string}
     */
    this.value = value;
}

Punctuator.prototype = Object.create( Node.prototype );

Punctuator.prototype.constructor = Punctuator;

/**
 * @function
 * @returns {external:Object} A JSON representation of the punctuator
 */
Punctuator.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.value = this.value;
    
    return json;
};