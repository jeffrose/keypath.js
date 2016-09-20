'use strict';

import Null from '../null';
import nextId from '../uuid';

function toNamedJSON(){
    const json = Node.prototype.toJSON.call( this );
    
    json.name = this.name;
    
    return json;
}

export default function Node( type ){
    this.id = nextId();
    this.type = type;
}

Node.prototype = new Null();

Node.prototype.constructor = Node;

Node.prototype.equals = function( node ){
    return node instanceof Node && this.id === node.id;
};

Node.prototype.is = function( type ){
    return this.type === type;
};

Node.prototype.toJSON = function(){
    const json = new Null();
    
    json.id   = this.id;
    json.type = this.type;
    
    return json;
};

Node.prototype.toString = function(){
    return this.type;
};

Node.prototype.valueOf = function(){
    return this.id;
};

export function Program( body ){
    Node.call( this, 'Program' );
    this.body = body;
}

Program.prototype = Object.create( Node.prototype );

Program.prototype.constructor = Program;

Program.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.body = this.body;
    
    return json;
};

export function ExpressionStatement( expression ){
    Node.call( this, 'ExpressionStatement' );
    this.expression = expression;
}

ExpressionStatement.prototype = Object.create( Node.prototype );

ExpressionStatement.prototype.constructor = ExpressionStatement;

ExpressionStatement.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.expression = this.expression;
    
    return json;
};

export function CallExpression( callee, args ){
    Node.call( this, 'CallExpression' );
    
    this.callee = callee;
    this.args = args;
}

CallExpression.prototype = Object.create( Node.prototype );

CallExpression.prototype.constructor = CallExpression;

CallExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.callee      = this.callee;
    json.args        = this.args;
    
    return json;
};

export function MemberExpression( object, property, computed ){
    Node.call( this, 'MemberExpression' );
    
    this.object = object;
    this.property = property;
    this.computed = computed || false;
}

MemberExpression.prototype = Object.create( Node.prototype );

MemberExpression.prototype.constructor = MemberExpression;

MemberExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.object   = this.object;
    json.property = this.property;
    json.computed = this.computed;
    
    return json;
};

export function Identifier( name ){
    Node.call( this, 'Identifier' );
    this.name = name;
}

Identifier.prototype = Object.create( Node.prototype );

Identifier.prototype.constructor = Identifier;

Identifier.prototype.toJSON = toNamedJSON;

export function Literal( name ){
    Node.call( this, 'Literal' );
    this.name = name;
}

Literal.prototype = Object.create( Node.prototype );

Literal.prototype.constructor = Literal;

Literal.prototype.toJSON = toNamedJSON;

export function Numeric( name ){
    Node.call( this, 'Numeric' );
    this.name = name;
}

Numeric.prototype = Object.create( Node.prototype );

Numeric.prototype.constructor = Numeric;

Numeric.prototype.toJSON = toNamedJSON;

export function Punctuator( name ){
    Node.call( this, 'Punctuator' );
    this.name = name;
}

Punctuator.prototype = Object.create( Node.prototype );

Punctuator.prototype.constructor = Punctuator;

Punctuator.prototype.toJSON = toNamedJSON;