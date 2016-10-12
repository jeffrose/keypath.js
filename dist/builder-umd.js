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

/**
 * @namespace Lexer~Grammar
 */
var Grammar = new Null();

Grammar.Identifier      = 'Identifier';
Grammar.NumericLiteral  = 'NumericLiteral';
Grammar.NullLiteral     = 'NullLiteral';
Grammar.Punctuator      = 'Punctuator';
Grammar.StringLiteral   = 'StringLiteral';

var Syntax = new Null();

Syntax.ArrayExpression       = 'ArrayExpression';
Syntax.CallExpression        = 'CallExpression';
Syntax.ExpressionStatement   = 'ExpressionStatement';
Syntax.Identifier            = 'Identifier';
Syntax.Literal               = 'Literal';
Syntax.MemberExpression      = 'MemberExpression';
Syntax.PlaceholderExpression = 'PlaceholderExpression';
Syntax.Program               = 'Program';
Syntax.RangeExpression       = 'RangeExpression';
Syntax.SequenceExpression    = 'SequenceExpression';

var nodeId = 0;
var literalTypes = 'boolean number string'.split( ' ' );
var PlaceholderOperator = '%';
var RangeOperator = '..';

/**
 * @class Builder~Node
 * @extends Null
 * @param {external:string} type A node type
 */
function Node( type ){
    
    if( typeof type !== 'string' ){
        throw new TypeError( 'type must be a string' );
    }
    
    /**
     * @member {external:number} Builder~Node#id
     */
    this.id = ++nodeId;
    /**
     * @member {external:string} Builder~Node#type
     */
    this.type = type;
}

Node.prototype = new Null();

Node.prototype.constructor = Node;

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
 * @class Builder~Expression
 * @extends Builder~Node
 * @param {external:string} expressionType A node type
 */
function Expression( expressionType ){
    Node.call( this, expressionType );
}

Expression.prototype = Object.create( Node.prototype );

Expression.prototype.constructor = Expression;

/**
 * @class Builder~MemberExpression
 * @extends Builder~Expression
 * @param {Builder~Expression} object
 * @param {Builder~Expression|Builder~Identifier} property
 * @param {external:boolean} computed=false
 */
function MemberExpression( object, property, computed ){
    Expression.call( this, Syntax.MemberExpression );
    
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
 * @class Builder~Program
 * @extends Builder~Node
 * @param {external:Array<Builder~Statement>} body
 */
function Program( body ){
    Node.call( this, Syntax.Program );
    
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
 * @class Builder~Statement
 * @extends Builder~Node
 * @param {external:string} statementType A node type
 */
function Statement( statementType ){
    Node.call( this, statementType );
}

Statement.prototype = Object.create( Node.prototype );

Statement.prototype.constructor = Statement;

/**
 * @class Builder~ArrayExpression
 * @extends Builder~Expression
 * @param {external:Array<Builder~Expression>|RangeExpression} elements A list of expressions
 */
function ArrayExpression( elements ){
    Expression.call( this, Syntax.ArrayExpression );
    
    if( !( Array.isArray( elements ) ) && !( elements instanceof RangeExpression ) ){
        throw new TypeError( 'elements must be a list of expressions or an instance of range expression' );
    }
    
    /**
     * @member {Array<Builder~Expression>|RangeExpression}
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
    
    if( Array.isArray( this.elements ) ){
        json.elements = this.elements.map( function( element ){
            return element.toJSON();
        } );
    } else {
        json.elements = this.elements.toJSON();
    }
    
    return json;
};

/**
 * @class Builder~CallExpression
 * @extends Builder~Expression
 * @param {Builder~Expression} callee
 * @param {Array<Builder~Expression>} args
 */
function CallExpression( callee, args ){
    Expression.call( this, Syntax.CallExpression );
    
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
 * @class Builder~ComputedMemberExpression
 * @extends Builder~MemberExpression
 * @param {Builder~Expression} object
 * @param {Builder~Expression} property
 */
function ComputedMemberExpression( object, property ){
    if( !( property instanceof Expression ) ){
        throw new TypeError( 'property must be an expression when computed is true' );
    }
        
    MemberExpression.call( this, object, property, true );
    
    /**
     * @member Builder~ComputedMemberExpression#computed=true
     */
}

ComputedMemberExpression.prototype = Object.create( MemberExpression.prototype );

ComputedMemberExpression.prototype.constructor = ComputedMemberExpression;

/**
 * @class Builder~ExpressionStatement
 * @extends Builder~Statement
 */
function ExpressionStatement( expression ){
    Statement.call( this, Syntax.ExpressionStatement );
    
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
 * @class Builder~Identifier
 * @extends Builder~Expression
 * @param {external:string} name The name of the identifier
 */
function Identifier( name ){
    Expression.call( this, Syntax.Identifier );
    
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
function Literal( value, raw ){
    Expression.call( this, Syntax.Literal );
    
    if( literalTypes.indexOf( typeof value ) === -1 && value !== null ){
        throw new TypeError( 'value must be a boolean, number, string, or null' );
    }
    
    /**
     * @member {external:string}
     */
    this.raw = raw;
    
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
    
    json.raw = this.raw;
    json.value = this.value;
    
    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the literal
 */
Literal.prototype.toString = function(){
    return this.raw;
};

function NullLiteral( raw ){
    if( raw !== 'null' ){
        throw new TypeError( 'raw is not a null literal' );
    }
    
    Literal.call( this, null, raw );
}

NullLiteral.prototype = Object.create( Literal.prototype );

NullLiteral.prototype.constructor = NullLiteral;

function NumericLiteral( raw ){
    var value = parseFloat( raw );
    
    if( isNaN( value ) ){
        throw new TypeError( 'raw is not a numeric literal' );
    }
    
    Literal.call( this, value, raw );
}

NumericLiteral.prototype = Object.create( Literal.prototype );

NumericLiteral.prototype.constructor = NumericLiteral;

function PlaceholderExpression( key ){
    if( !( key instanceof Literal ) && !( key instanceof Identifier ) ){
        throw new TypeError( 'key must be a literal or identifier' );
    }
    
    OperatorExpression.call( this, Syntax.PlaceholderExpression, PlaceholderOperator );
    
    this.key = key;
}

PlaceholderExpression.prototype = Object.create( OperatorExpression.prototype );

PlaceholderExpression.prototype.constructor = PlaceholderExpression;

PlaceholderExpression.prototype.toString = function(){
    return this.operator + this.key;
};

PlaceholderExpression.prototype.toJSON = function(){
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
function RangeExpression( left, right ){
    OperatorExpression.call( this, Syntax.RangeExpression, RangeOperator );
    
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

/**
 * @class Builder~SequenceExpression
 * @extends Builder~Expression
 * @param {Array<Builder~Expression>|RangeExpression} expressions The expressions in the sequence
 */
function SequenceExpression( expressions ){
    Expression.call( this, Syntax.SequenceExpression );
    
    if( !( Array.isArray( expressions ) ) && !( expressions instanceof RangeExpression ) ){
        throw new TypeError( 'expressions must be a list of expressions or an instance of range expression' );
    }
    
    /**
     * @member {Array<Builder~Expression>|RangeExpression}
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
    
    if( Array.isArray( this.expressions ) ){
        json.expressions = this.expressions.map( function( expression ){
            return expression.toJSON();
        } );
    } else {
        json.expressions = this.expressions.toJSON();
    }
    
    return json;
};

/**
 * @class Builder~StaticMemberExpression
 * @extends Builder~MemberExpression
 * @param {Builder~Expression} object
 * @param {Builder~Identifier} property
 */
function StaticMemberExpression( object, property ){
    if( !( property instanceof Identifier ) && !( property instanceof PlaceholderExpression ) ){
        throw new TypeError( 'property must be an identifier or placeholder expression when computed is false' );
    }
        
    MemberExpression.call( this, object, property, false );
    
    /**
     * @member Builder~StaticMemberExpression#computed=false
     */
}

StaticMemberExpression.prototype = Object.create( MemberExpression.prototype );

StaticMemberExpression.prototype.constructor = StaticMemberExpression;

function StringLiteral( raw ){
    if( raw[ 0 ] !== '"' && raw[ 0 ] !== "'" ){
        throw new TypeError( 'raw is not a string literal' );
    }
    
    var value = raw.substring( 1, raw.length - 1 );
    
    Literal.call( this, value, raw );
}

StringLiteral.prototype = Object.create( Literal.prototype );

StringLiteral.prototype.constructor = StringLiteral;

/**
 * @class Builder
 * @extends Null
 * @param {Lexer} lexer
 */
function Builder( lexer ){
    this.lexer = lexer;
}

Builder.prototype = new Null();

Builder.prototype.constructor = Builder;

Builder.prototype.arrayExpression = function( list ){
    //console.log( 'ARRAY EXPRESSION' );
    var end = ( Array.isArray( list ) ? list.length ? list[ list.length - 1 ].range[ 1 ] : 1 : list.range[ 1 ] ) + 1,
        node;
        
    this.consume( '[' );
    
    node = new ArrayExpression( list );
    node.range = [ this.column, end ];
    //console.log( '- RANGE', node.range );
    return node;
};

/**
 * @function
 * @param {external:string|Array<Builder~Token>} input
 * @returns {Program} The built abstract syntax tree
 */
Builder.prototype.build = function( input ){
    if( typeof input === 'string' ){
        /**
         * @member {external:string}
         */
        this.text = input;
        
        if( typeof this.lexer === 'undefined' ){
            this.throwError( 'lexer is not defined' );
        }
        
        /**
         * @member {external:Array<Token>}
         */
        this.tokens = this.lexer.lex( input );
    } else if( Array.isArray( input ) ){
        this.tokens = input.slice();
        this.text = input.join( '' );
    } else {
        this.throwError( 'invalid input' );
    }
    //console.log( 'BUILD' );
    //console.log( '- ', this.text.length, 'CHARS', this.text );
    //console.log( '- ', this.tokens.length, 'TOKENS', this.tokens );
    this.column = this.text.length;
    
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
    var end = this.column + 1,
        args = this.list( '(' ),
        callee, node, start;
        
    this.consume( '(' );
    
    callee = this.expression();
    
    start = this.column;
    //console.log( 'CALL EXPRESSION' );
    //console.log( '- CALLEE', callee );
    //console.log( '- ARGUMENTS', args, args.length );
    node = new CallExpression( callee, args );
    node.range = [ start, end ];
    
    return node;
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
        this.column -= token.length;
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
                expression = this.arrayExpression( list );
            } else if( list.length > 1 ){
                expression = this.sequenceExpression( list );
            } else {
                expression = Array.isArray( list ) ?
                    list[ 0 ] :
                    list;
            }
        } else if( next.type === Grammar.Identifier ){
            expression = this.placeholder();
            next = this.peek();
            // Implied member expression
            if( next && next.type === Grammar.Punctuator && ( next.value === ')' || next.value === ']' ) ){
                expression = this.memberExpression( expression, false );
            }
        } else if( next.type === Grammar.NumericLiteral || next.type === Grammar.StringLiteral ){
            expression = this.placeholder();
            next = this.peek();
        } else if( next.type === Grammar.NullLiteral ){
            expression = this.literal();
            next = this.peek();
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
    var end = this.column,
        node = this.expression(),
        start = this.column,
        expressionStatement;
    //console.log( 'EXPRESSION STATEMENT WITH', node );
    expressionStatement = new ExpressionStatement( node );
    expressionStatement.range = [ start, end ];
    
    return expressionStatement;
};

/**
 * @function
 * @returns {Identifier} An identifier
 * @throws {SyntaxError} If the token is not an identifier
 */
Builder.prototype.identifier = function(){
    var end = this.column,
        token = this.consume(),
        start = this.column,
        node;
    
    if( !( token.type === Grammar.Identifier ) ){
        this.throwError( 'Identifier expected' );
    }
    
    node = new Identifier( token.value );
    node.range = [ start, end ];
    
    return node;
};

/**
 * @function
 * @param {external:string} terminator
 * @returns {external:Array<Expression>|RangeExpression} The list of expressions or range expression
 */
Builder.prototype.list = function( terminator ){
    var list = [],
        isNumeric = false,
        expression, next;
    //console.log( 'LIST', terminator );
    if( !this.peek( terminator ) ){
        next = this.peek();
        isNumeric = next.type === Grammar.NumericLiteral;
        
        // Examples: [1..3], [5..], [..7]
        if( ( isNumeric || next.value === '.' ) && this.peekAt( 1, '.' ) ){
            //console.log( '- RANGE EXPRESSION' );
            expression = isNumeric ?
                this.placeholder() :
                null;
            list = this.rangeExpression( expression );
        
        // Examples: [1,2,3], ["abc","def"], [foo,bar]
        } else {
            //console.log( '- ARRAY OF EXPRESSIONS' );
            do {
                expression = this.placeholder();
                list.unshift( expression );
            } while( this.expect( ',' ) );
        } 
    }
    //console.log( '- LIST RESULT', list );
    return list;
};

/**
 * @function
 * @returns {Literal} The literal node
 */
Builder.prototype.literal = function(){
    var end = this.column,
        token = this.consume(),
        start = this.column,
        node, raw;
    
    raw = token.value;
    
    switch( token.type ){
        case Grammar.NumericLiteral:
            node = new NumericLiteral( raw );
            break;
        case Grammar.StringLiteral:
            node = new StringLiteral( raw );
            break;
        case Grammar.NullLiteral:
            node = new NullLiteral( raw );
            break;
        default:
            this.throwError( 'Literal expected' );
    }
    
    node.range = [ start, end ];
    
    return node;
};

/**
 * @function
 * @param {Expression} property The expression assigned to the property of the member expression
 * @param {external:boolean} computed Whether or not the member expression is computed
 * @returns {MemberExpression} The member expression
 */
Builder.prototype.memberExpression = function( property, computed ){
    var end = property.range[ 1 ] + ( computed ? 1 : 0 ),
        object = this.expression(),
        start = this.column,
        node;
    //console.log( 'MEMBER EXPRESSION' );
    //console.log( '- OBJECT', object );
    //console.log( '- PROPERTY', property );
    //console.log( '- COMPUTED', computed );
    node = computed ?
        new ComputedMemberExpression( object, property ) :
        new StaticMemberExpression( object, property );
    
    node.range = [ start, end ];
    
    return node;
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
    return this.peekAt( 0, first, second, third, fourth );
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
    var length = this.tokens.length,
        index, token, value;
    
    if( length && typeof position === 'number' && position > -1 ){
        // Calculate a zero-based index starting from the end of the list
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
    var end = this.column,
        body = [],
        node;
    //console.log( 'PROGRAM' );
    while( true ){
        if( this.tokens.length ){
            body.unshift( this.expressionStatement() );
        } else {
            node = new Program( body );
            node.range = [ this.column, end ];
            return node;
        }
    }
};

Builder.prototype.placeholder = function(){
    var next = this.peek(),
        expression;
    
    switch( next.type ){
        case Grammar.Identifier:
            expression = this.identifier();
            break;
        case Grammar.NumericLiteral:
        case Grammar.StringLiteral:
            expression = this.literal();
            break;
        default:
            this.throwError( 'token cannot be a placeholder' );
    }
    
    next = this.peek();
    
    if( next && next.value === '%' ){
        expression = this.placeholderExpression( expression );
    }
    
    return expression;
};

Builder.prototype.placeholderExpression = function( key ){
    var end = key.range[ 1 ],
        node, start;
        
    this.consume( '%' );
    
    start = this.column;
    node = new PlaceholderExpression( key );
    node.range = [ start, end ];
    
    return node;
};

Builder.prototype.rangeExpression = function( right ){
    var end = right !== null ? right.range[ 1 ] : this.column,
        left, node;
    
    this.expect( '.' );
    this.expect( '.' );
    
    left = this.peek().type === Grammar.NumericLiteral ?
        left = this.literal() :
        null;
    
    node = new RangeExpression( left, right );
    node.range = [ this.column, end ];
    
    return node;
};

Builder.prototype.sequenceExpression = function( list ){
    var end, node;
    
    if( Array.isArray( list ) ){
        end = list[ list.length - 1 ].range[ 1 ];
    } else if( list instanceof RangeExpression ){
        end = list.range[ 1 ];
    }
    
    node = new SequenceExpression( list );
    node.range = [ this.column, end ];
    
    return node;
};

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