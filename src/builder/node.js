'use strict';

import Null from '../null';
import nextId from '../uuid';

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

export { Node as default };

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

export function Program( body ){
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

export function ArrayExpression( elements ){
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

export function ExpressionStatement( expression ){
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

export function CallExpression( callee, args ){
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

export function MemberExpression( object, property, computed ){
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

export function Identifier( name ){
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

export function Literal( value ){
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

export function SequenceExpression( expressions ){
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

export function Punctuator( value ){
    Node.call( this, 'Punctuator' );
    
    if( typeof value !== 'string' ){
        throw new TypeError( 'value must be a string' );
    }
    
    this.value = value;
}

Punctuator.prototype = Object.create( Node.prototype );

Punctuator.prototype.constructor = Punctuator;

Punctuator.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.value = this.value;
    
    return json;
};