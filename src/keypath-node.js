'use strict';

import { ComputedMemberExpression, Expression, Identifier, Node, Literal } from './node';
import * as KeypathSyntax from './keypath-syntax';
import hasOwnProperty from './has-own-property'

/**
 * @class Builder~OperatorExpression
 * @extends Builder~Expression
 * @param {external:string} expressionType
 * @param {external:string} operator
 */
function OperatorExpression( expressionType, operator ){
    Expression.call( this, expressionType );

    this.operator = operator;
}

OperatorExpression.prototype = Object.create( Expression.prototype );

OperatorExpression.prototype.constructor = OperatorExpression;

/**
 * @function
 * @returns {external:Object} A JSON representation of the operator expression
 */
OperatorExpression.prototype.toJSON = function(){
    var json = Node.prototype.toJSON.call( this );

    json.operator = this.operator;

    return json;
};

export function BlockExpression( body ){
    Expression.call( this, 'BlockExpression' );

    /*
    if( !( expression instanceof Expression ) ){
        throw new TypeError( 'argument must be an expression' );
    }
    */

    this.body = body;
}

BlockExpression.prototype = Object.create( Expression.prototype );

BlockExpression.prototype.constructor = BlockExpression;

export function ExistentialExpression( expression ){
    OperatorExpression.call( this, KeypathSyntax.ExistentialExpression, '?' );

    this.expression = expression;
}

ExistentialExpression.prototype = Object.create( OperatorExpression.prototype );

ExistentialExpression.prototype.constructor = ExistentialExpression;

ExistentialExpression.prototype.toJSON = function(){
    var json = OperatorExpression.prototype.toJSON.call( this );

    json.expression = this.expression.toJSON();

    return json;
};

export function LookupExpression( key ){
    if( !( key instanceof Literal ) && !( key instanceof Identifier ) && !( key instanceof BlockExpression ) ){
        throw new TypeError( 'key must be a literal, identifier, or eval expression' );
    }

    OperatorExpression.call( this, KeypathSyntax.LookupExpression, '%' );

    this.key = key;
}

LookupExpression.prototype = Object.create( OperatorExpression.prototype );

LookupExpression.prototype.constructor = LookupExpression;

LookupExpression.prototype.toString = function(){
    return this.operator + this.key;
};

LookupExpression.prototype.toJSON = function(){
    var json = OperatorExpression.prototype.toJSON.call( this );

    json.key = this.key;

    return json;
};

/**
 * @class Builder~RangeExpression
 * @extends Builder~OperatorExpression
 * @param {Builder~Expression} left
 * @param {Builder~Expression} right
 */
export function RangeExpression( left, right ){
    OperatorExpression.call( this, KeypathSyntax.RangeExpression, '..' );

    if( !( left instanceof Literal ) && left !== null ){
        throw new TypeError( 'left must be an instance of literal or null' );
    }

    if( !( right instanceof Literal ) && right !== null ){
        throw new TypeError( 'right must be an instance of literal or null' );
    }

    if( left === null && right === null ){
        throw new TypeError( 'left and right cannot equal null at the same time' );
    }

    /**
     * @member {Builder~Literal} Builder~RangeExpression#left
     */
     /**
     * @member {Builder~Literal} Builder~RangeExpression#0
     */
    this[ 0 ] = this.left = left;

    /**
     * @member {Builder~Literal} Builder~RangeExpression#right
     */
     /**
     * @member {Builder~Literal} Builder~RangeExpression#1
     */
    this[ 1 ] = this.right = right;

    /**
     * @member {external:number} Builder~RangeExpression#length=2
     */
    this.length = 2;
}

RangeExpression.prototype = Object.create( Expression.prototype );

RangeExpression.prototype.constructor = RangeExpression;

RangeExpression.prototype.toJSON = function(){
    var json = OperatorExpression.prototype.toJSON.call( this );

    json.left = this.left !== null ?
        this.left.toJSON() :
        this.left;
    json.right = this.right !== null ?
        this.right.toJSON() :
        this.right;

    return json;
};

RangeExpression.prototype.toString = function(){
    return this.left.toString() + this.operator + this.right.toString();
};

export function RelationalMemberExpression( object, property, cardinality ){
    ComputedMemberExpression.call( this, object, property );

    if( !hasOwnProperty( Cardinality, cardinality ) ){
        throw new TypeError( 'Unknown cardinality ' + cardinality );
    }

    this.cardinality = cardinality;
}

RelationalMemberExpression.prototype = Object.create( ComputedMemberExpression.prototype );

RelationalMemberExpression.prototype.constructor = RelationalMemberExpression;

export function RootExpression( key ){
    if( !( key instanceof Literal ) && !( key instanceof Identifier ) && !( key instanceof BlockExpression ) ){
        throw new TypeError( 'key must be a literal, identifier, or eval expression' );
    }

    OperatorExpression.call( this, KeypathSyntax.RootExpression, '~' );

    this.key = key;
}

RootExpression.prototype = Object.create( OperatorExpression.prototype );

RootExpression.prototype.constructor = RootExpression;

RootExpression.prototype.toString = function(){
    return this.operator + this.key;
};

RootExpression.prototype.toJSON = function(){
    var json = OperatorExpression.prototype.toJSON.call( this );

    json.key = this.key;

    return json;
};

export function ScopeExpression( operator, key ){
    //if( !( key instanceof Literal ) && !( key instanceof Identifier ) && !( key instanceof BlockExpression ) ){
    //    throw new TypeError( 'key must be a literal, identifier, or eval expression' );
    //}

    OperatorExpression.call( this, KeypathSyntax.ScopeExpression, operator );

    this.key = key;
}

ScopeExpression.prototype = Object.create( OperatorExpression.prototype );

ScopeExpression.prototype.constructor = ScopeExpression;

ScopeExpression.prototype.toString = function(){
    return this.operator + this.key;
};

ScopeExpression.prototype.toJSON = function(){
    var json = OperatorExpression.prototype.toJSON.call( this );

    json.key = this.key;

    return json;
};