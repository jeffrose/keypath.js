(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.KeypathBuilder = factory());
}(this, (function () { 'use strict';

/**
 * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
 * @class Null
 * @extends external:null
 */
function Null(){}
Null.prototype = Object.create( null );
Null.prototype.constructor =  Null;

var Identifier      = 'Identifier';
var NumericLiteral  = 'Numeric';
var NullLiteral     = 'Null';
var Punctuator      = 'Punctuator';
var StringLiteral   = 'String';

var ArrayExpression$1       = 'ArrayExpression';
var CallExpression$1        = 'CallExpression';
var ExpressionStatement$1   = 'ExpressionStatement';
var Identifier$2            = 'Identifier';
var Literal$1               = 'Literal';
var MemberExpression$1      = 'MemberExpression';
var Program$1               = 'Program';
var SequenceExpression$1    = 'SequenceExpression';

var nodeId = 0;
var literalTypes = 'boolean number string'.split( ' ' );

/**
 * @class Builder~Node
 * @extends Null
 * @param {external:string} type A node type
 */
function Node( type ){

    if( typeof type !== 'string' ){
        this.throwError( 'type must be a string', TypeError );
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

Node.prototype.throwError = function( message, ErrorClass ){
    typeof ErrorClass === 'undefined' && ( ErrorClass = Error );
    throw new ErrorClass( message );
};

/**
 * @function
 * @returns {external:Object} A JSON representation of the node
 */
Node.prototype.toJSON = function(){
    var json = new Null();

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
 * @class Builder~Literal
 * @extends Builder~Expression
 * @param {external:string|external:number} value The value of the literal
 */
function Literal$$1( value, raw ){
    Expression.call( this, Literal$1 );

    if( literalTypes.indexOf( typeof value ) === -1 && value !== null ){
        this.throwError( 'value must be a boolean, number, string, or null', TypeError );
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

Literal$$1.prototype = Object.create( Expression.prototype );

Literal$$1.prototype.constructor = Literal$$1;

/**
 * @function
 * @returns {external:Object} A JSON representation of the literal
 */
Literal$$1.prototype.toJSON = function(){
    var json = Node.prototype.toJSON.call( this );

    json.raw = this.raw;
    json.value = this.value;

    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the literal
 */
Literal$$1.prototype.toString = function(){
    return this.raw;
};

/**
 * @class Builder~MemberExpression
 * @extends Builder~Expression
 * @param {Builder~Expression} object
 * @param {Builder~Expression|Builder~Identifier} property
 * @param {external:boolean} computed=false
 */
function MemberExpression$$1( object, property, computed ){
    Expression.call( this, MemberExpression$1 );

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

MemberExpression$$1.prototype = Object.create( Expression.prototype );

MemberExpression$$1.prototype.constructor = MemberExpression$$1;

/**
 * @function
 * @returns {external:Object} A JSON representation of the member expression
 */
MemberExpression$$1.prototype.toJSON = function(){
    var json = Node.prototype.toJSON.call( this );

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
function Program$$1( body ){
    Node.call( this, Program$1 );

    if( !Array.isArray( body ) ){
        throw new TypeError( 'body must be an array' );
    }

    /**
     * @member {external:Array<Builder~Statement>}
     */
    this.body = body || [];
    this.sourceType = 'script';
}

Program$$1.prototype = Object.create( Node.prototype );

Program$$1.prototype.constructor = Program$$1;

/**
 * @function
 * @returns {external:Object} A JSON representation of the program
 */
Program$$1.prototype.toJSON = function(){
    var json = Node.prototype.toJSON.call( this );

    json.body = this.body.map( function( node ){
        return node.toJSON();
    } );
    json.sourceType = this.sourceType;

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
function ArrayExpression$$1( elements ){
    Expression.call( this, ArrayExpression$1 );

    //if( !( Array.isArray( elements ) ) && !( elements instanceof RangeExpression ) ){
    //    throw new TypeError( 'elements must be a list of expressions or an instance of range expression' );
    //}

    /*
    Object.defineProperty( this, 'elements', {
        get: function(){
            return this;
        },
        set: function( elements ){
            var index = this.length = elements.length;
            while( index-- ){
                this[ index ] = elements[ index ];
            }
        },
        configurable: true,
        enumerable: false
    } );
    */

    /**
     * @member {Array<Builder~Expression>|RangeExpression}
     */
    this.elements = elements;
}

ArrayExpression$$1.prototype = Object.create( Expression.prototype );

ArrayExpression$$1.prototype.constructor = ArrayExpression$$1;

/**
 * @function
 * @returns {external:Object} A JSON representation of the array expression
 */
ArrayExpression$$1.prototype.toJSON = function(){
    var json = Node.prototype.toJSON.call( this );

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
function CallExpression$$1( callee, args ){
    Expression.call( this, CallExpression$1 );

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

CallExpression$$1.prototype = Object.create( Expression.prototype );

CallExpression$$1.prototype.constructor = CallExpression$$1;

/**
 * @function
 * @returns {external:Object} A JSON representation of the call expression
 */
CallExpression$$1.prototype.toJSON = function(){
    var json = Node.prototype.toJSON.call( this );

    json.callee    = this.callee.toJSON();
    json.arguments = this.arguments.map( function( node ){
        return node.toJSON();
    } );

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

    MemberExpression$$1.call( this, object, property, true );

    /**
     * @member Builder~ComputedMemberExpression#computed=true
     */
}

ComputedMemberExpression.prototype = Object.create( MemberExpression$$1.prototype );

ComputedMemberExpression.prototype.constructor = ComputedMemberExpression;

/**
 * @class Builder~ExpressionStatement
 * @extends Builder~Statement
 */
function ExpressionStatement$$1( expression ){
    Statement.call( this, ExpressionStatement$1 );

    if( !( expression instanceof Expression ) ){
        throw new TypeError( 'argument must be an expression' );
    }

    /**
     * @member {Builder~Expression}
     */
    this.expression = expression;
}

ExpressionStatement$$1.prototype = Object.create( Statement.prototype );

ExpressionStatement$$1.prototype.constructor = ExpressionStatement$$1;

/**
 * @function
 * @returns {external:Object} A JSON representation of the expression statement
 */
ExpressionStatement$$1.prototype.toJSON = function(){
    var json = Node.prototype.toJSON.call( this );

    json.expression = this.expression.toJSON();

    return json;
};

/**
 * @class Builder~Identifier
 * @extends Builder~Expression
 * @param {external:string} name The name of the identifier
 */
function Identifier$1( name ){
    Expression.call( this, Identifier$2 );

    if( typeof name !== 'string' ){
        throw new TypeError( 'name must be a string' );
    }

    /**
     * @member {external:string}
     */
    this.name = name;
}

Identifier$1.prototype = Object.create( Expression.prototype );

Identifier$1.prototype.constructor = Identifier$1;

/**
 * @function
 * @returns {external:Object} A JSON representation of the identifier
 */
Identifier$1.prototype.toJSON = function(){
    var json = Node.prototype.toJSON.call( this );

    json.name = this.name;

    return json;
};

function NullLiteral$1( raw ){
    if( raw !== 'null' ){
        throw new TypeError( 'raw is not a null literal' );
    }

    Literal$$1.call( this, null, raw );
}

NullLiteral$1.prototype = Object.create( Literal$$1.prototype );

NullLiteral$1.prototype.constructor = NullLiteral$1;

function NumericLiteral$1( raw ){
    var value = parseFloat( raw );

    if( isNaN( value ) ){
        throw new TypeError( 'raw is not a numeric literal' );
    }

    Literal$$1.call( this, value, raw );
}

NumericLiteral$1.prototype = Object.create( Literal$$1.prototype );

NumericLiteral$1.prototype.constructor = NumericLiteral$1;

/**
 * @class Builder~SequenceExpression
 * @extends Builder~Expression
 * @param {Array<Builder~Expression>|RangeExpression} expressions The expressions in the sequence
 */
function SequenceExpression$$1( expressions ){
    Expression.call( this, SequenceExpression$1 );

    //if( !( Array.isArray( expressions ) ) && !( expressions instanceof RangeExpression ) ){
    //    throw new TypeError( 'expressions must be a list of expressions or an instance of range expression' );
    //}

    /*
    Object.defineProperty( this, 'expressions', {
        get: function(){
            return this;
        },
        set: function( expressions ){
            var index = this.length = expressions.length;
            while( index-- ){
                this[ index ] = expressions[ index ];
            }
        },
        configurable: true,
        enumerable: false
    } );
    */

    /**
     * @member {Array<Builder~Expression>|RangeExpression}
     */
    this.expressions = expressions;
}

SequenceExpression$$1.prototype = Object.create( Expression.prototype );

SequenceExpression$$1.prototype.constructor = SequenceExpression$$1;

/**
 * @function
 * @returns {external:Object} A JSON representation of the sequence expression
 */
SequenceExpression$$1.prototype.toJSON = function(){
    var json = Node.prototype.toJSON.call( this );

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
    //if( !( property instanceof Identifier ) && !( property instanceof LookupExpression ) && !( property instanceof BlockExpression ) ){
    //    throw new TypeError( 'property must be an identifier, eval expression, or lookup expression when computed is false' );
    //}

    MemberExpression$$1.call( this, object, property, false );

    /**
     * @member Builder~StaticMemberExpression#computed=false
     */
}

StaticMemberExpression.prototype = Object.create( MemberExpression$$1.prototype );

StaticMemberExpression.prototype.constructor = StaticMemberExpression;

function StringLiteral$1( raw ){
    if( raw[ 0 ] !== '"' && raw[ 0 ] !== "'" ){
        throw new TypeError( 'raw is not a string literal' );
    }

    var value = raw.substring( 1, raw.length - 1 );

    Literal$$1.call( this, value, raw );
}

StringLiteral$1.prototype = Object.create( Literal$$1.prototype );

StringLiteral$1.prototype.constructor = StringLiteral$1;

var ExistentialExpression$1 = 'ExistentialExpression';
var LookupExpression$1      = 'LookupExpression';
var RangeExpression$1       = 'RangeExpression';
var RootExpression$1        = 'RootExpression';
var ScopeExpression$1       = 'ScopeExpression';

var _hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * @function
 * @param {*} object
 * @param {external:string} property
 */
function hasOwnProperty( object, property ){
    return _hasOwnProperty.call( object, property );
}

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

function BlockExpression$$1( body ){
    Expression.call( this, 'BlockExpression' );

    /*
    if( !( expression instanceof Expression ) ){
        throw new TypeError( 'argument must be an expression' );
    }
    */

    this.body = body;
}

BlockExpression$$1.prototype = Object.create( Expression.prototype );

BlockExpression$$1.prototype.constructor = BlockExpression$$1;

function ExistentialExpression$$1( expression ){
    OperatorExpression.call( this, ExistentialExpression$1, '?' );

    this.expression = expression;
}

ExistentialExpression$$1.prototype = Object.create( OperatorExpression.prototype );

ExistentialExpression$$1.prototype.constructor = ExistentialExpression$$1;

ExistentialExpression$$1.prototype.toJSON = function(){
    var json = OperatorExpression.prototype.toJSON.call( this );

    json.expression = this.expression.toJSON();

    return json;
};

function LookupExpression$$1( key ){
    if( !( key instanceof Literal$$1 ) && !( key instanceof Identifier$1 ) && !( key instanceof BlockExpression$$1 ) ){
        throw new TypeError( 'key must be a literal, identifier, or eval expression' );
    }

    OperatorExpression.call( this, LookupExpression$1, '%' );

    this.key = key;
}

LookupExpression$$1.prototype = Object.create( OperatorExpression.prototype );

LookupExpression$$1.prototype.constructor = LookupExpression$$1;

LookupExpression$$1.prototype.toString = function(){
    return this.operator + this.key;
};

LookupExpression$$1.prototype.toJSON = function(){
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
function RangeExpression$$1( left, right ){
    OperatorExpression.call( this, RangeExpression$1, '..' );

    if( !( left instanceof Literal$$1 ) && left !== null ){
        throw new TypeError( 'left must be an instance of literal or null' );
    }

    if( !( right instanceof Literal$$1 ) && right !== null ){
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

RangeExpression$$1.prototype = Object.create( Expression.prototype );

RangeExpression$$1.prototype.constructor = RangeExpression$$1;

RangeExpression$$1.prototype.toJSON = function(){
    var json = OperatorExpression.prototype.toJSON.call( this );

    json.left = this.left !== null ?
        this.left.toJSON() :
        this.left;
    json.right = this.right !== null ?
        this.right.toJSON() :
        this.right;

    return json;
};

RangeExpression$$1.prototype.toString = function(){
    return this.left.toString() + this.operator + this.right.toString();
};



function RootExpression$$1( key ){
    if( !( key instanceof Literal$$1 ) && !( key instanceof Identifier$1 ) && !( key instanceof BlockExpression$$1 ) ){
        throw new TypeError( 'key must be a literal, identifier, or eval expression' );
    }

    OperatorExpression.call( this, RootExpression$1, '~' );

    this.key = key;
}

RootExpression$$1.prototype = Object.create( OperatorExpression.prototype );

RootExpression$$1.prototype.constructor = RootExpression$$1;

RootExpression$$1.prototype.toString = function(){
    return this.operator + this.key;
};

RootExpression$$1.prototype.toJSON = function(){
    var json = OperatorExpression.prototype.toJSON.call( this );

    json.key = this.key;

    return json;
};

var builderPrototype;

/**
 * @class Builder
 * @extends Null
 * @param {Lexer} lexer
 */
function Builder( lexer ){
    this.lexer = lexer;
}

builderPrototype = Builder.prototype = new Null();

builderPrototype.constructor = Builder;

builderPrototype.arrayExpression = function( list ){
    //console.log( 'ARRAY EXPRESSION' );
    this.consume( '[' );
    return new ArrayExpression$$1( list );
};

builderPrototype.blockExpression = function( terminator ){
    var block = [],
        isolated = false;
    //console.log( 'BLOCK', terminator );
    if( !this.peek( terminator ) ){
        //console.log( '- EXPRESSIONS' );
        do {
            block.unshift( this.consume() );
        } while( !this.peek( terminator ) );
    }
    this.consume( terminator );
    /*if( this.peek( '~' ) ){
        isolated = true;
        this.consume( '~' );
    }*/
    return new BlockExpression$$1( block, isolated );
};

/**
 * @function
 * @param {external:string|Array<Builder~Token>} input
 * @returns {Program} The built abstract syntax tree
 */
builderPrototype.build = function( input ){
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
    this.line = 1;

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
builderPrototype.callExpression = function(){
    var args = this.list( '(' ),
        callee;

    this.consume( '(' );

    callee = this.expression();

    //console.log( 'CALL EXPRESSION' );
    //console.log( '- CALLEE', callee );
    //console.log( '- ARGUMENTS', args, args.length );
    return new CallExpression$$1( callee, args );
};

/**
 * Removes the next token in the token list. If a comparison is provided, the token will only be returned if the value matches. Otherwise an error is thrown.
 * @function
 * @param {external:string} [expected] An expected comparison value
 * @returns {Token} The next token in the list
 * @throws {SyntaxError} If token did not exist
 */
builderPrototype.consume = function( expected ){
    if( !this.tokens.length ){
        this.throwError( 'Unexpected end of expression' );
    }

    var token = this.expect( expected );

    if( !token ){
        this.throwError( 'Unexpected token ' + token.value + ' consumed' );
    }

    return token;
};

builderPrototype.existentialExpression = function(){
    var expression = this.expression();
    //console.log( '- EXIST EXPRESSION', expression );
    return new ExistentialExpression$$1( expression );
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
builderPrototype.expect = function( first, second, third, fourth ){
    var token = this.peek( first, second, third, fourth );

    if( token ){
        this.tokens.pop();
        this.column -= token.value.length;
        return token;
    }

    return void 0;
};

/**
 * @function
 * @returns {Expression} An expression node
 */
builderPrototype.expression = function(){
    var expression = null,
        list, next, token;

    if( this.expect( ';' ) ){
        next = this.peek();
    }

    if( next = this.peek() ){
        //console.log( 'EXPRESSION', next );
        switch( next.type ){
            case Punctuator:
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
                    break;
                } else if( next.value === '}' ){
                    expression = this.lookup( next );
                    next = this.peek();
                } else if( this.expect( '?' ) ){
                    expression = this.existentialExpression();
                    next = this.peek();
                }
                break;
            case NullLiteral:
                expression = this.literal();
                next = this.peek();
                break;
            // Grammar.Identifier
            // Grammar.NumericLiteral
            // Grammar.StringLiteral
            default:
                expression = this.lookup( next );
                next = this.peek();
                // Implied member expression. Should only happen after an Identifier.
                if( next && next.type === Punctuator && ( next.value === ')' || next.value === ']' || next.value === '?' ) ){
                    expression = this.memberExpression( expression, false );
                }
                break;
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
builderPrototype.expressionStatement = function(){
    var expression = this.expression(),
        expressionStatement;
    //console.log( 'EXPRESSION STATEMENT WITH', expression );
    expressionStatement = new ExpressionStatement$$1( expression );

    return expressionStatement;
};

/**
 * @function
 * @returns {Identifier} An identifier
 * @throws {SyntaxError} If the token is not an identifier
 */
builderPrototype.identifier = function(){
    var token = this.consume();

    if( !( token.type === Identifier ) ){
        this.throwError( 'Identifier expected' );
    }

    return new Identifier$1( token.value );
};

/**
 * @function
 * @param {external:string} terminator
 * @returns {external:Array<Expression>|RangeExpression} The list of expressions or range expression
 */
builderPrototype.list = function( terminator ){
    var list = [],
        isNumeric = false,
        expression, next;
    //console.log( 'LIST', terminator );
    if( !this.peek( terminator ) ){
        next = this.peek();
        isNumeric = next.type === NumericLiteral;

        // Examples: [1..3], [5..], [..7]
        if( ( isNumeric || next.value === '.' ) && this.peekAt( 1, '.' ) ){
            //console.log( '- RANGE EXPRESSION' );
            expression = isNumeric ?
                this.lookup( next ) :
                null;
            list = this.rangeExpression( expression );

        // Examples: [1,2,3], ["abc","def"], [foo,bar], [{foo.bar}]
        } else {
            //console.log( '- ARRAY OF EXPRESSIONS' );
            do {
                expression = this.lookup( next );
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
builderPrototype.literal = function(){
    var token = this.consume(),
        raw = token.value,
        expression;

    switch( token.type ){
        case NumericLiteral:
            expression = new NumericLiteral$1( raw );
            break;
        case StringLiteral:
            expression = new StringLiteral$1( raw );
            break;
        case NullLiteral:
            expression = new NullLiteral$1( raw );
            break;
        default:
            this.throwError( 'Literal expected' );
    }

    return expression;
};

builderPrototype.lookup = function( next ){
    var expression;
    //console.log( 'LOOKUP', next );
    switch( next.type ){
        case Identifier:
            expression = this.identifier();
            break;
        case NumericLiteral:
        case StringLiteral:
            expression = this.literal();
            break;
        case Punctuator:
            if( next.value === '}' ){
                this.consume( '}' );
                expression = this.blockExpression( '{' );
                break;
            }
        default:
            this.throwError( 'token cannot be a lookup' );
    }

    next = this.peek();

    if( next && next.value === '%' ){
        expression = this.lookupExpression( expression );
    }
    if( next && next.value === '~' ){
        expression = this.rootExpression( expression );
    }
    //console.log( '- LOOKUP RESULT', expression );
    return expression;
};

builderPrototype.lookupExpression = function( key ){
    this.consume( '%' );
    return new LookupExpression$$1( key );
};

/**
 * @function
 * @param {Expression} property The expression assigned to the property of the member expression
 * @param {external:boolean} computed Whether or not the member expression is computed
 * @returns {MemberExpression} The member expression
 */
builderPrototype.memberExpression = function( property, computed ){
    //console.log( 'MEMBER', property );
    var object = this.expression();
    //console.log( 'MEMBER EXPRESSION' );
    //console.log( '- OBJECT', object );
    //console.log( '- PROPERTY', property );
    //console.log( '- COMPUTED', computed );
    return computed ?
        new ComputedMemberExpression( object, property ) :
        new StaticMemberExpression( object, property );
};

builderPrototype.parse = function( input ){
    this.tokens = this.lexer.lex( input );
    return this.build( this.tokens );
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
builderPrototype.peek = function( first, second, third, fourth ){
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
builderPrototype.peekAt = function( position, first, second, third, fourth ){
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

    return void 0;
};

/**
 * @function
 * @returns {Program} A program node
 */
builderPrototype.program = function(){
    var body = [];
    //console.log( 'PROGRAM' );
    while( true ){
        if( this.tokens.length ){
            body.unshift( this.expressionStatement() );
        } else {
            return new Program$$1( body );
        }
    }
};

builderPrototype.rangeExpression = function( right ){
    var left;

    this.expect( '.' );
    this.expect( '.' );

    left = this.peek().type === NumericLiteral ?
        left = this.literal() :
        null;

    return new RangeExpression$$1( left, right );
};

builderPrototype.rootExpression = function( key ){
    this.consume( '~' );
    return new RootExpression$$1( key );
};

builderPrototype.sequenceExpression = function( list ){
    return new SequenceExpression$$1( list );
};

/**
 * @function
 * @param {external:string} message The error message
 * @throws {external:SyntaxError} When it executes
 */
builderPrototype.throwError = function( message ){
    throw new SyntaxError( message );
};

return Builder;

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci5qcyIsInNvdXJjZXMiOlsibnVsbC5qcyIsImdyYW1tYXIuanMiLCJzeW50YXguanMiLCJub2RlLmpzIiwia2V5cGF0aC1zeW50YXguanMiLCJoYXMtb3duLXByb3BlcnR5LmpzIiwia2V5cGF0aC1ub2RlLmpzIiwiYnVpbGRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEEgXCJjbGVhblwiLCBlbXB0eSBjb250YWluZXIuIEluc3RhbnRpYXRpbmcgdGhpcyBpcyBmYXN0ZXIgdGhhbiBleHBsaWNpdGx5IGNhbGxpbmcgYE9iamVjdC5jcmVhdGUoIG51bGwgKWAuXG4gKiBAY2xhc3MgTnVsbFxuICogQGV4dGVuZHMgZXh0ZXJuYWw6bnVsbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBOdWxsKCl7fVxuTnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5OdWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBOdWxsOyIsImV4cG9ydCB2YXIgSWRlbnRpZmllciAgICAgID0gJ0lkZW50aWZpZXInO1xuZXhwb3J0IHZhciBOdW1lcmljTGl0ZXJhbCAgPSAnTnVtZXJpYyc7XG5leHBvcnQgdmFyIE51bGxMaXRlcmFsICAgICA9ICdOdWxsJztcbmV4cG9ydCB2YXIgUHVuY3R1YXRvciAgICAgID0gJ1B1bmN0dWF0b3InO1xuZXhwb3J0IHZhciBTdHJpbmdMaXRlcmFsICAgPSAnU3RyaW5nJzsiLCJleHBvcnQgdmFyIEFycmF5RXhwcmVzc2lvbiAgICAgICA9ICdBcnJheUV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBDYWxsRXhwcmVzc2lvbiAgICAgICAgPSAnQ2FsbEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBFeHByZXNzaW9uU3RhdGVtZW50ICAgPSAnRXhwcmVzc2lvblN0YXRlbWVudCc7XG5leHBvcnQgdmFyIElkZW50aWZpZXIgICAgICAgICAgICA9ICdJZGVudGlmaWVyJztcbmV4cG9ydCB2YXIgTGl0ZXJhbCAgICAgICAgICAgICAgID0gJ0xpdGVyYWwnO1xuZXhwb3J0IHZhciBNZW1iZXJFeHByZXNzaW9uICAgICAgPSAnTWVtYmVyRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIFByb2dyYW0gICAgICAgICAgICAgICA9ICdQcm9ncmFtJztcbmV4cG9ydCB2YXIgU2VxdWVuY2VFeHByZXNzaW9uICAgID0gJ1NlcXVlbmNlRXhwcmVzc2lvbic7IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIFN5bnRheCBmcm9tICcuL3N5bnRheCc7XG5cbnZhciBub2RlSWQgPSAwLFxuICAgIGxpdGVyYWxUeXBlcyA9ICdib29sZWFuIG51bWJlciBzdHJpbmcnLnNwbGl0KCAnICcgKTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5Ob2RlXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdHlwZSBBIG5vZGUgdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTm9kZSggdHlwZSApe1xuXG4gICAgaWYoIHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJyApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICd0eXBlIG11c3QgYmUgYSBzdHJpbmcnLCBUeXBlRXJyb3IgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEJ1aWxkZXJ+Tm9kZSNpZFxuICAgICAqL1xuICAgIHRoaXMuaWQgPSArK25vZGVJZDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IEJ1aWxkZXJ+Tm9kZSN0eXBlXG4gICAgICovXG4gICAgdGhpcy50eXBlID0gdHlwZTtcbn1cblxuTm9kZS5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5Ob2RlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE5vZGU7XG5cbk5vZGUucHJvdG90eXBlLnRocm93RXJyb3IgPSBmdW5jdGlvbiggbWVzc2FnZSwgRXJyb3JDbGFzcyApe1xuICAgIHR5cGVvZiBFcnJvckNsYXNzID09PSAndW5kZWZpbmVkJyAmJiAoIEVycm9yQ2xhc3MgPSBFcnJvciApO1xuICAgIHRocm93IG5ldyBFcnJvckNsYXNzKCBtZXNzYWdlICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBub2RlXG4gKi9cbk5vZGUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi50eXBlID0gdGhpcy50eXBlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG5vZGVcbiAqL1xuTm9kZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBTdHJpbmcoIHRoaXMudHlwZSApO1xufTtcblxuTm9kZS5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuaWQ7XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+Tm9kZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGV4cHJlc3Npb25UeXBlIEEgbm9kZSB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFeHByZXNzaW9uKCBleHByZXNzaW9uVHlwZSApe1xuICAgIE5vZGUuY2FsbCggdGhpcywgZXhwcmVzc2lvblR5cGUgKTtcbn1cblxuRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBOb2RlLnByb3RvdHlwZSApO1xuXG5FeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEV4cHJlc3Npb247XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+TGl0ZXJhbFxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpudW1iZXJ9IHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgbGl0ZXJhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gTGl0ZXJhbCggdmFsdWUsIHJhdyApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LkxpdGVyYWwgKTtcblxuICAgIGlmKCBsaXRlcmFsVHlwZXMuaW5kZXhPZiggdHlwZW9mIHZhbHVlICkgPT09IC0xICYmIHZhbHVlICE9PSBudWxsICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ3ZhbHVlIG11c3QgYmUgYSBib29sZWFuLCBudW1iZXIsIHN0cmluZywgb3IgbnVsbCcsIFR5cGVFcnJvciApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLnJhdyA9IHJhdztcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuXG5MaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkxpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGl0ZXJhbDtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGl0ZXJhbFxuICovXG5MaXRlcmFsLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ucmF3ID0gdGhpcy5yYXc7XG4gICAganNvbi52YWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGl0ZXJhbFxuICovXG5MaXRlcmFsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMucmF3O1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5NZW1iZXJFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBvYmplY3RcbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufEJ1aWxkZXJ+SWRlbnRpZmllcn0gcHJvcGVydHlcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gY29tcHV0ZWQ9ZmFsc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHksIGNvbXB1dGVkICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguTWVtYmVyRXhwcmVzc2lvbiApO1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5FeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+RXhwcmVzc2lvbnxCdWlsZGVyfklkZW50aWZpZXJ9XG4gICAgICovXG4gICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOmJvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5jb21wdXRlZCA9IGNvbXB1dGVkIHx8IGZhbHNlO1xufVxuXG5NZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbk1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVtYmVyRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWVtYmVyIGV4cHJlc3Npb25cbiAqL1xuTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLm9iamVjdCAgID0gdGhpcy5vYmplY3QudG9KU09OKCk7XG4gICAganNvbi5wcm9wZXJ0eSA9IHRoaXMucHJvcGVydHkudG9KU09OKCk7XG4gICAganNvbi5jb21wdXRlZCA9IHRoaXMuY29tcHV0ZWQ7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+UHJvZ3JhbVxuICogQGV4dGVuZHMgQnVpbGRlcn5Ob2RlXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5PEJ1aWxkZXJ+U3RhdGVtZW50Pn0gYm9keVxuICovXG5leHBvcnQgZnVuY3Rpb24gUHJvZ3JhbSggYm9keSApe1xuICAgIE5vZGUuY2FsbCggdGhpcywgU3ludGF4LlByb2dyYW0gKTtcblxuICAgIGlmKCAhQXJyYXkuaXNBcnJheSggYm9keSApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdib2R5IG11c3QgYmUgYW4gYXJyYXknICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6QXJyYXk8QnVpbGRlcn5TdGF0ZW1lbnQ+fVxuICAgICAqL1xuICAgIHRoaXMuYm9keSA9IGJvZHkgfHwgW107XG4gICAgdGhpcy5zb3VyY2VUeXBlID0gJ3NjcmlwdCc7XG59XG5cblByb2dyYW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTm9kZS5wcm90b3R5cGUgKTtcblxuUHJvZ3JhbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQcm9ncmFtO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwcm9ncmFtXG4gKi9cblByb2dyYW0ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5ib2R5ID0gdGhpcy5ib2R5Lm1hcCggZnVuY3Rpb24oIG5vZGUgKXtcbiAgICAgICAgcmV0dXJuIG5vZGUudG9KU09OKCk7XG4gICAgfSApO1xuICAgIGpzb24uc291cmNlVHlwZSA9IHRoaXMuc291cmNlVHlwZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5TdGF0ZW1lbnRcbiAqIEBleHRlbmRzIEJ1aWxkZXJ+Tm9kZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHN0YXRlbWVudFR5cGUgQSBub2RlIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0YXRlbWVudCggc3RhdGVtZW50VHlwZSApe1xuICAgIE5vZGUuY2FsbCggdGhpcywgc3RhdGVtZW50VHlwZSApO1xufVxuXG5TdGF0ZW1lbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTm9kZS5wcm90b3R5cGUgKTtcblxuU3RhdGVtZW50LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0YXRlbWVudDtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5BcnJheUV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn0gZWxlbWVudHMgQSBsaXN0IG9mIGV4cHJlc3Npb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcnJheUV4cHJlc3Npb24oIGVsZW1lbnRzICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguQXJyYXlFeHByZXNzaW9uICk7XG5cbiAgICAvL2lmKCAhKCBBcnJheS5pc0FycmF5KCBlbGVtZW50cyApICkgJiYgISggZWxlbWVudHMgaW5zdGFuY2VvZiBSYW5nZUV4cHJlc3Npb24gKSApe1xuICAgIC8vICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdlbGVtZW50cyBtdXN0IGJlIGEgbGlzdCBvZiBleHByZXNzaW9ucyBvciBhbiBpbnN0YW5jZSBvZiByYW5nZSBleHByZXNzaW9uJyApO1xuICAgIC8vfVxuXG4gICAgLypcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdlbGVtZW50cycsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oIGVsZW1lbnRzICl7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgdGhpc1sgaW5kZXggXSA9IGVsZW1lbnRzWyBpbmRleCBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSApO1xuICAgICovXG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudHM7XG59XG5cbkFycmF5RXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5BcnJheUV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQXJyYXlFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhcnJheSBleHByZXNzaW9uXG4gKi9cbkFycmF5RXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBpZiggQXJyYXkuaXNBcnJheSggdGhpcy5lbGVtZW50cyApICl7XG4gICAgICAgIGpzb24uZWxlbWVudHMgPSB0aGlzLmVsZW1lbnRzLm1hcCggZnVuY3Rpb24oIGVsZW1lbnQgKXtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnRvSlNPTigpO1xuICAgICAgICB9ICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAganNvbi5lbGVtZW50cyA9IHRoaXMuZWxlbWVudHMudG9KU09OKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkNhbGxFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBjYWxsZWVcbiAqIEBwYXJhbSB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPn0gYXJnc1xuICovXG5leHBvcnQgZnVuY3Rpb24gQ2FsbEV4cHJlc3Npb24oIGNhbGxlZSwgYXJncyApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LkNhbGxFeHByZXNzaW9uICk7XG5cbiAgICBpZiggIUFycmF5LmlzQXJyYXkoIGFyZ3MgKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYXJndW1lbnRzIG11c3QgYmUgYW4gYXJyYXknICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5FeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMuY2FsbGVlID0gY2FsbGVlO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj59XG4gICAgICovXG4gICAgdGhpcy5hcmd1bWVudHMgPSBhcmdzO1xufVxuXG5DYWxsRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5DYWxsRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDYWxsRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgY2FsbCBleHByZXNzaW9uXG4gKi9cbkNhbGxFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uY2FsbGVlICAgID0gdGhpcy5jYWxsZWUudG9KU09OKCk7XG4gICAganNvbi5hcmd1bWVudHMgPSB0aGlzLmFyZ3VtZW50cy5tYXAoIGZ1bmN0aW9uKCBub2RlICl7XG4gICAgICAgIHJldHVybiBub2RlLnRvSlNPTigpO1xuICAgIH0gKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5Db21wdXRlZE1lbWJlckV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+TWVtYmVyRXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IG9iamVjdFxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHkgKXtcbiAgICBpZiggISggcHJvcGVydHkgaW5zdGFuY2VvZiBFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3Byb3BlcnR5IG11c3QgYmUgYW4gZXhwcmVzc2lvbiB3aGVuIGNvbXB1dGVkIGlzIHRydWUnICk7XG4gICAgfVxuXG4gICAgTWVtYmVyRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5LCB0cnVlICk7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIEJ1aWxkZXJ+Q29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uI2NvbXB1dGVkPXRydWVcbiAgICAgKi9cbn1cblxuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb21wdXRlZE1lbWJlckV4cHJlc3Npb247XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+RXhwcmVzc2lvblN0YXRlbWVudFxuICogQGV4dGVuZHMgQnVpbGRlcn5TdGF0ZW1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEV4cHJlc3Npb25TdGF0ZW1lbnQoIGV4cHJlc3Npb24gKXtcbiAgICBTdGF0ZW1lbnQuY2FsbCggdGhpcywgU3ludGF4LkV4cHJlc3Npb25TdGF0ZW1lbnQgKTtcblxuICAgIGlmKCAhKCBleHByZXNzaW9uIGluc3RhbmNlb2YgRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdhcmd1bWVudCBtdXN0IGJlIGFuIGV4cHJlc3Npb24nICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5FeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMuZXhwcmVzc2lvbiA9IGV4cHJlc3Npb247XG59XG5cbkV4cHJlc3Npb25TdGF0ZW1lbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggU3RhdGVtZW50LnByb3RvdHlwZSApO1xuXG5FeHByZXNzaW9uU3RhdGVtZW50LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEV4cHJlc3Npb25TdGF0ZW1lbnQ7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGV4cHJlc3Npb24gc3RhdGVtZW50XG4gKi9cbkV4cHJlc3Npb25TdGF0ZW1lbnQucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5leHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uLnRvSlNPTigpO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfklkZW50aWZpZXJcbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGlkZW50aWZpZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElkZW50aWZpZXIoIG5hbWUgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5JZGVudGlmaWVyICk7XG5cbiAgICBpZiggdHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICduYW1lIG11c3QgYmUgYSBzdHJpbmcnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG59XG5cbklkZW50aWZpZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuSWRlbnRpZmllci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJZGVudGlmaWVyO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBpZGVudGlmaWVyXG4gKi9cbklkZW50aWZpZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5uYW1lID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gTnVsbExpdGVyYWwoIHJhdyApe1xuICAgIGlmKCByYXcgIT09ICdudWxsJyApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncmF3IGlzIG5vdCBhIG51bGwgbGl0ZXJhbCcgKTtcbiAgICB9XG5cbiAgICBMaXRlcmFsLmNhbGwoIHRoaXMsIG51bGwsIHJhdyApO1xufVxuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBMaXRlcmFsLnByb3RvdHlwZSApO1xuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdWxsTGl0ZXJhbDtcblxuZXhwb3J0IGZ1bmN0aW9uIE51bWVyaWNMaXRlcmFsKCByYXcgKXtcbiAgICB2YXIgdmFsdWUgPSBwYXJzZUZsb2F0KCByYXcgKTtcblxuICAgIGlmKCBpc05hTiggdmFsdWUgKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncmF3IGlzIG5vdCBhIG51bWVyaWMgbGl0ZXJhbCcgKTtcbiAgICB9XG5cbiAgICBMaXRlcmFsLmNhbGwoIHRoaXMsIHZhbHVlLCByYXcgKTtcbn1cblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTGl0ZXJhbC5wcm90b3R5cGUgKTtcblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVtZXJpY0xpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+U2VxdWVuY2VFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259IGV4cHJlc3Npb25zIFRoZSBleHByZXNzaW9ucyBpbiB0aGUgc2VxdWVuY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNlcXVlbmNlRXhwcmVzc2lvbiggZXhwcmVzc2lvbnMgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5TZXF1ZW5jZUV4cHJlc3Npb24gKTtcblxuICAgIC8vaWYoICEoIEFycmF5LmlzQXJyYXkoIGV4cHJlc3Npb25zICkgKSAmJiAhKCBleHByZXNzaW9ucyBpbnN0YW5jZW9mIFJhbmdlRXhwcmVzc2lvbiApICl7XG4gICAgLy8gICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2V4cHJlc3Npb25zIG11c3QgYmUgYSBsaXN0IG9mIGV4cHJlc3Npb25zIG9yIGFuIGluc3RhbmNlIG9mIHJhbmdlIGV4cHJlc3Npb24nICk7XG4gICAgLy99XG5cbiAgICAvKlxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ2V4cHJlc3Npb25zJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiggZXhwcmVzc2lvbnMgKXtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoID0gZXhwcmVzc2lvbnMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICB0aGlzWyBpbmRleCBdID0gZXhwcmVzc2lvbnNbIGluZGV4IF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9ICk7XG4gICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMuZXhwcmVzc2lvbnMgPSBleHByZXNzaW9ucztcbn1cblxuU2VxdWVuY2VFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblNlcXVlbmNlRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTZXF1ZW5jZUV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHNlcXVlbmNlIGV4cHJlc3Npb25cbiAqL1xuU2VxdWVuY2VFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGlmKCBBcnJheS5pc0FycmF5KCB0aGlzLmV4cHJlc3Npb25zICkgKXtcbiAgICAgICAganNvbi5leHByZXNzaW9ucyA9IHRoaXMuZXhwcmVzc2lvbnMubWFwKCBmdW5jdGlvbiggZXhwcmVzc2lvbiApe1xuICAgICAgICAgICAgcmV0dXJuIGV4cHJlc3Npb24udG9KU09OKCk7XG4gICAgICAgIH0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBqc29uLmV4cHJlc3Npb25zID0gdGhpcy5leHByZXNzaW9ucy50b0pTT04oKTtcbiAgICB9XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+U3RhdGljTWVtYmVyRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5NZW1iZXJFeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gb2JqZWN0XG4gKiBAcGFyYW0ge0J1aWxkZXJ+SWRlbnRpZmllcn0gcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0YXRpY01lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHkgKXtcbiAgICAvL2lmKCAhKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIElkZW50aWZpZXIgKSAmJiAhKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIExvb2t1cEV4cHJlc3Npb24gKSAmJiAhKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIEJsb2NrRXhwcmVzc2lvbiApICl7XG4gICAgLy8gICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3Byb3BlcnR5IG11c3QgYmUgYW4gaWRlbnRpZmllciwgZXZhbCBleHByZXNzaW9uLCBvciBsb29rdXAgZXhwcmVzc2lvbiB3aGVuIGNvbXB1dGVkIGlzIGZhbHNlJyApO1xuICAgIC8vfVxuXG4gICAgTWVtYmVyRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5LCBmYWxzZSApO1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciBCdWlsZGVyflN0YXRpY01lbWJlckV4cHJlc3Npb24jY29tcHV0ZWQ9ZmFsc2VcbiAgICAgKi9cbn1cblxuU3RhdGljTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5TdGF0aWNNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0YXRpY01lbWJlckV4cHJlc3Npb247XG5cbmV4cG9ydCBmdW5jdGlvbiBTdHJpbmdMaXRlcmFsKCByYXcgKXtcbiAgICBpZiggcmF3WyAwIF0gIT09ICdcIicgJiYgcmF3WyAwIF0gIT09IFwiJ1wiICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyYXcgaXMgbm90IGEgc3RyaW5nIGxpdGVyYWwnICk7XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlID0gcmF3LnN1YnN0cmluZyggMSwgcmF3Lmxlbmd0aCAtIDEgKTtcblxuICAgIExpdGVyYWwuY2FsbCggdGhpcywgdmFsdWUsIHJhdyApO1xufVxuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExpdGVyYWwucHJvdG90eXBlICk7XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RyaW5nTGl0ZXJhbDsiLCJleHBvcnQgdmFyIEJsb2NrRXhwcmVzc2lvbiAgICAgICA9ICdCbG9ja0V4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBFeGlzdGVudGlhbEV4cHJlc3Npb24gPSAnRXhpc3RlbnRpYWxFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgTG9va3VwRXhwcmVzc2lvbiAgICAgID0gJ0xvb2t1cEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBSYW5nZUV4cHJlc3Npb24gICAgICAgPSAnUmFuZ2VFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUm9vdEV4cHJlc3Npb24gICAgICAgID0gJ1Jvb3RFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgU2NvcGVFeHByZXNzaW9uICAgICAgID0gJ1Njb3BlRXhwcmVzc2lvbic7IiwidmFyIF9oYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0geyp9IG9iamVjdFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHByb3BlcnR5XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGhhc093blByb3BlcnR5KCBvYmplY3QsIHByb3BlcnR5ICl7XG4gICAgcmV0dXJuIF9oYXNPd25Qcm9wZXJ0eS5jYWxsKCBvYmplY3QsIHByb3BlcnR5ICk7XG59IiwiaW1wb3J0IHsgQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLCBFeHByZXNzaW9uLCBJZGVudGlmaWVyLCBOb2RlLCBMaXRlcmFsIH0gZnJvbSAnLi9ub2RlJztcbmltcG9ydCAqIGFzIEtleXBhdGhTeW50YXggZnJvbSAnLi9rZXlwYXRoLXN5bnRheCc7XG5pbXBvcnQgaGFzT3duUHJvcGVydHkgZnJvbSAnLi9oYXMtb3duLXByb3BlcnR5JztcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5PcGVyYXRvckV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGV4cHJlc3Npb25UeXBlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gb3BlcmF0b3JcbiAqL1xuZnVuY3Rpb24gT3BlcmF0b3JFeHByZXNzaW9uKCBleHByZXNzaW9uVHlwZSwgb3BlcmF0b3IgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIGV4cHJlc3Npb25UeXBlICk7XG5cbiAgICB0aGlzLm9wZXJhdG9yID0gb3BlcmF0b3I7XG59XG5cbk9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5PcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gT3BlcmF0b3JFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBvcGVyYXRvciBleHByZXNzaW9uXG4gKi9cbk9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLm9wZXJhdG9yID0gdGhpcy5vcGVyYXRvcjtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIEJsb2NrRXhwcmVzc2lvbiggYm9keSApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgJ0Jsb2NrRXhwcmVzc2lvbicgKTtcblxuICAgIC8qXG4gICAgaWYoICEoIGV4cHJlc3Npb24gaW5zdGFuY2VvZiBFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2FyZ3VtZW50IG11c3QgYmUgYW4gZXhwcmVzc2lvbicgKTtcbiAgICB9XG4gICAgKi9cblxuICAgIHRoaXMuYm9keSA9IGJvZHk7XG59XG5cbkJsb2NrRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5CbG9ja0V4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQmxvY2tFeHByZXNzaW9uO1xuXG5leHBvcnQgZnVuY3Rpb24gRXhpc3RlbnRpYWxFeHByZXNzaW9uKCBleHByZXNzaW9uICl7XG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uLCAnPycgKTtcblxuICAgIHRoaXMuZXhwcmVzc2lvbiA9IGV4cHJlc3Npb247XG59XG5cbkV4aXN0ZW50aWFsRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkV4aXN0ZW50aWFsRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFeGlzdGVudGlhbEV4cHJlc3Npb247XG5cbkV4aXN0ZW50aWFsRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvbi50b0pTT04oKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIExvb2t1cEV4cHJlc3Npb24oIGtleSApe1xuICAgIGlmKCAhKCBrZXkgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgISgga2V5IGluc3RhbmNlb2YgSWRlbnRpZmllciApICYmICEoIGtleSBpbnN0YW5jZW9mIEJsb2NrRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdrZXkgbXVzdCBiZSBhIGxpdGVyYWwsIGlkZW50aWZpZXIsIG9yIGV2YWwgZXhwcmVzc2lvbicgKTtcbiAgICB9XG5cbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uLCAnJScgKTtcblxuICAgIHRoaXMua2V5ID0ga2V5O1xufVxuXG5Mb29rdXBFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuTG9va3VwRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMb29rdXBFeHByZXNzaW9uO1xuXG5Mb29rdXBFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0b3IgKyB0aGlzLmtleTtcbn07XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmtleSA9IHRoaXMua2V5O1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflJhbmdlRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5PcGVyYXRvckV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBsZWZ0XG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gcmlnaHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJhbmdlRXhwcmVzc2lvbiggbGVmdCwgcmlnaHQgKXtcbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5SYW5nZUV4cHJlc3Npb24sICcuLicgKTtcblxuICAgIGlmKCAhKCBsZWZ0IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmIGxlZnQgIT09IG51bGwgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xlZnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBsaXRlcmFsIG9yIG51bGwnICk7XG4gICAgfVxuXG4gICAgaWYoICEoIHJpZ2h0IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmIHJpZ2h0ICE9PSBudWxsICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyaWdodCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGxpdGVyYWwgb3IgbnVsbCcgKTtcbiAgICB9XG5cbiAgICBpZiggbGVmdCA9PT0gbnVsbCAmJiByaWdodCA9PT0gbnVsbCApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGVmdCBhbmQgcmlnaHQgY2Fubm90IGVxdWFsIG51bGwgYXQgdGhlIHNhbWUgdGltZScgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uI2xlZnRcbiAgICAgKi9cbiAgICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5MaXRlcmFsfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiMwXG4gICAgICovXG4gICAgdGhpc1sgMCBdID0gdGhpcy5sZWZ0ID0gbGVmdDtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+TGl0ZXJhbH0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jcmlnaHRcbiAgICAgKi9cbiAgICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5MaXRlcmFsfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiMxXG4gICAgICovXG4gICAgdGhpc1sgMSBdID0gdGhpcy5yaWdodCA9IHJpZ2h0O1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiNsZW5ndGg9MlxuICAgICAqL1xuICAgIHRoaXMubGVuZ3RoID0gMjtcbn1cblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblJhbmdlRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSYW5nZUV4cHJlc3Npb247XG5cblJhbmdlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ubGVmdCA9IHRoaXMubGVmdCAhPT0gbnVsbCA/XG4gICAgICAgIHRoaXMubGVmdC50b0pTT04oKSA6XG4gICAgICAgIHRoaXMubGVmdDtcbiAgICBqc29uLnJpZ2h0ID0gdGhpcy5yaWdodCAhPT0gbnVsbCA/XG4gICAgICAgIHRoaXMucmlnaHQudG9KU09OKCkgOlxuICAgICAgICB0aGlzLnJpZ2h0O1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5SYW5nZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5sZWZ0LnRvU3RyaW5nKCkgKyB0aGlzLm9wZXJhdG9yICsgdGhpcy5yaWdodC50b1N0cmluZygpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFJlbGF0aW9uYWxNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5LCBjYXJkaW5hbGl0eSApe1xuICAgIENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5ICk7XG5cbiAgICBpZiggIWhhc093blByb3BlcnR5KCBDYXJkaW5hbGl0eSwgY2FyZGluYWxpdHkgKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnVW5rbm93biBjYXJkaW5hbGl0eSAnICsgY2FyZGluYWxpdHkgKTtcbiAgICB9XG5cbiAgICB0aGlzLmNhcmRpbmFsaXR5ID0gY2FyZGluYWxpdHk7XG59XG5cblJlbGF0aW9uYWxNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb247XG5cbmV4cG9ydCBmdW5jdGlvbiBSb290RXhwcmVzc2lvbigga2V5ICl7XG4gICAgaWYoICEoIGtleSBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISgga2V5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2tleSBtdXN0IGJlIGEgbGl0ZXJhbCwgaWRlbnRpZmllciwgb3IgZXZhbCBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uLCAnficgKTtcblxuICAgIHRoaXMua2V5ID0ga2V5O1xufVxuXG5Sb290RXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJvb3RFeHByZXNzaW9uO1xuXG5Sb290RXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICsgdGhpcy5rZXk7XG59O1xuXG5Sb290RXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ua2V5ID0gdGhpcy5rZXk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBTY29wZUV4cHJlc3Npb24oIG9wZXJhdG9yLCBrZXkgKXtcbiAgICAvL2lmKCAhKCBrZXkgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgISgga2V5IGluc3RhbmNlb2YgSWRlbnRpZmllciApICYmICEoIGtleSBpbnN0YW5jZW9mIEJsb2NrRXhwcmVzc2lvbiApICl7XG4gICAgLy8gICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2tleSBtdXN0IGJlIGEgbGl0ZXJhbCwgaWRlbnRpZmllciwgb3IgZXZhbCBleHByZXNzaW9uJyApO1xuICAgIC8vfVxuXG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguU2NvcGVFeHByZXNzaW9uLCBvcGVyYXRvciApO1xuXG4gICAgdGhpcy5rZXkgPSBrZXk7XG59XG5cblNjb3BlRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblNjb3BlRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTY29wZUV4cHJlc3Npb247XG5cblNjb3BlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICsgdGhpcy5rZXk7XG59O1xuXG5TY29wZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmtleSA9IHRoaXMua2V5O1xuXG4gICAgcmV0dXJuIGpzb247XG59OyIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBHcmFtbWFyIGZyb20gJy4vZ3JhbW1hcic7XG5pbXBvcnQgKiBhcyBOb2RlIGZyb20gJy4vbm9kZSc7XG5pbXBvcnQgKiBhcyBLZXlwYXRoTm9kZSBmcm9tICcuL2tleXBhdGgtbm9kZSc7XG5cbnZhciBidWlsZGVyUHJvdG90eXBlO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge0xleGVyfSBsZXhlclxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBCdWlsZGVyKCBsZXhlciApe1xuICAgIHRoaXMubGV4ZXIgPSBsZXhlcjtcbn1cblxuYnVpbGRlclByb3RvdHlwZSA9IEJ1aWxkZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuYnVpbGRlclByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJ1aWxkZXI7XG5cbmJ1aWxkZXJQcm90b3R5cGUuYXJyYXlFeHByZXNzaW9uID0gZnVuY3Rpb24oIGxpc3QgKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQVJSQVkgRVhQUkVTU0lPTicgKTtcbiAgICB0aGlzLmNvbnN1bWUoICdbJyApO1xuICAgIHJldHVybiBuZXcgTm9kZS5BcnJheUV4cHJlc3Npb24oIGxpc3QgKTtcbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUuYmxvY2tFeHByZXNzaW9uID0gZnVuY3Rpb24oIHRlcm1pbmF0b3IgKXtcbiAgICB2YXIgYmxvY2sgPSBbXSxcbiAgICAgICAgaXNvbGF0ZWQgPSBmYWxzZTtcbiAgICAvL2NvbnNvbGUubG9nKCAnQkxPQ0snLCB0ZXJtaW5hdG9yICk7XG4gICAgaWYoICF0aGlzLnBlZWsoIHRlcm1pbmF0b3IgKSApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBFWFBSRVNTSU9OUycgKTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgYmxvY2sudW5zaGlmdCggdGhpcy5jb25zdW1lKCkgKTtcbiAgICAgICAgfSB3aGlsZSggIXRoaXMucGVlayggdGVybWluYXRvciApICk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZSggdGVybWluYXRvciApO1xuICAgIC8qaWYoIHRoaXMucGVlayggJ34nICkgKXtcbiAgICAgICAgaXNvbGF0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnN1bWUoICd+JyApO1xuICAgIH0qL1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuQmxvY2tFeHByZXNzaW9uKCBibG9jaywgaXNvbGF0ZWQgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ3xBcnJheTxCdWlsZGVyflRva2VuPn0gaW5wdXRcbiAqIEByZXR1cm5zIHtQcm9ncmFtfSBUaGUgYnVpbHQgYWJzdHJhY3Qgc3ludGF4IHRyZWVcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5idWlsZCA9IGZ1bmN0aW9uKCBpbnB1dCApe1xuICAgIGlmKCB0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnICl7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRleHQgPSBpbnB1dDtcblxuICAgICAgICBpZiggdHlwZW9mIHRoaXMubGV4ZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoICdsZXhlciBpcyBub3QgZGVmaW5lZCcgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpBcnJheTxUb2tlbj59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRva2VucyA9IHRoaXMubGV4ZXIubGV4KCBpbnB1dCApO1xuICAgIH0gZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaW5wdXQgKSApe1xuICAgICAgICB0aGlzLnRva2VucyA9IGlucHV0LnNsaWNlKCk7XG4gICAgICAgIHRoaXMudGV4dCA9IGlucHV0LmpvaW4oICcnICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnaW52YWxpZCBpbnB1dCcgKTtcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJ0JVSUxEJyApO1xuICAgIC8vY29uc29sZS5sb2coICctICcsIHRoaXMudGV4dC5sZW5ndGgsICdDSEFSUycsIHRoaXMudGV4dCApO1xuICAgIC8vY29uc29sZS5sb2coICctICcsIHRoaXMudG9rZW5zLmxlbmd0aCwgJ1RPS0VOUycsIHRoaXMudG9rZW5zICk7XG4gICAgdGhpcy5jb2x1bW4gPSB0aGlzLnRleHQubGVuZ3RoO1xuICAgIHRoaXMubGluZSA9IDE7XG5cbiAgICB2YXIgcHJvZ3JhbSA9IHRoaXMucHJvZ3JhbSgpO1xuXG4gICAgaWYoIHRoaXMudG9rZW5zLmxlbmd0aCApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdVbmV4cGVjdGVkIHRva2VuICcgKyB0aGlzLnRva2Vuc1sgMCBdICsgJyByZW1haW5pbmcnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2dyYW07XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0NhbGxFeHByZXNzaW9ufSBUaGUgY2FsbCBleHByZXNzaW9uIG5vZGVcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5jYWxsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGFyZ3MgPSB0aGlzLmxpc3QoICcoJyApLFxuICAgICAgICBjYWxsZWU7XG5cbiAgICB0aGlzLmNvbnN1bWUoICcoJyApO1xuXG4gICAgY2FsbGVlID0gdGhpcy5leHByZXNzaW9uKCk7XG5cbiAgICAvL2NvbnNvbGUubG9nKCAnQ0FMTCBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIENBTExFRScsIGNhbGxlZSApO1xuICAgIC8vY29uc29sZS5sb2coICctIEFSR1VNRU5UUycsIGFyZ3MsIGFyZ3MubGVuZ3RoICk7XG4gICAgcmV0dXJuIG5ldyBOb2RlLkNhbGxFeHByZXNzaW9uKCBjYWxsZWUsIGFyZ3MgKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgbmV4dCB0b2tlbiBpbiB0aGUgdG9rZW4gbGlzdC4gSWYgYSBjb21wYXJpc29uIGlzIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzLiBPdGhlcndpc2UgYW4gZXJyb3IgaXMgdGhyb3duLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2V4cGVjdGVkXSBBbiBleHBlY3RlZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcmV0dXJucyB7VG9rZW59IFRoZSBuZXh0IHRva2VuIGluIHRoZSBsaXN0XG4gKiBAdGhyb3dzIHtTeW50YXhFcnJvcn0gSWYgdG9rZW4gZGlkIG5vdCBleGlzdFxuICovXG5idWlsZGVyUHJvdG90eXBlLmNvbnN1bWUgPSBmdW5jdGlvbiggZXhwZWN0ZWQgKXtcbiAgICBpZiggIXRoaXMudG9rZW5zLmxlbmd0aCApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdVbmV4cGVjdGVkIGVuZCBvZiBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIHZhciB0b2tlbiA9IHRoaXMuZXhwZWN0KCBleHBlY3RlZCApO1xuXG4gICAgaWYoICF0b2tlbiApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdVbmV4cGVjdGVkIHRva2VuICcgKyB0b2tlbi52YWx1ZSArICcgY29uc3VtZWQnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRva2VuO1xufTtcblxuYnVpbGRlclByb3RvdHlwZS5leGlzdGVudGlhbEV4cHJlc3Npb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBleHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uKCk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gRVhJU1QgRVhQUkVTU0lPTicsIGV4cHJlc3Npb24gKTtcbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLkV4aXN0ZW50aWFsRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBuZXh0IHRva2VuIGluIHRoZSB0b2tlbiBsaXN0LiBJZiBjb21wYXJpc29ucyBhcmUgcHJvdmlkZWQsIHRoZSB0b2tlbiB3aWxsIG9ubHkgYmUgcmV0dXJuZWQgaWYgdGhlIHZhbHVlIG1hdGNoZXMgb25lIG9mIHRoZSBjb21wYXJpc29ucy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmaXJzdF0gVGhlIGZpcnN0IGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbc2Vjb25kXSBUaGUgc2Vjb25kIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbdGhpcmRdIFRoZSB0aGlyZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZvdXJ0aF0gVGhlIGZvdXJ0aCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcmV0dXJucyB7VG9rZW59IFRoZSBuZXh0IHRva2VuIGluIHRoZSBsaXN0IG9yIGB1bmRlZmluZWRgIGlmIGl0IGRpZCBub3QgZXhpc3RcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5leHBlY3QgPSBmdW5jdGlvbiggZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApe1xuICAgIHZhciB0b2tlbiA9IHRoaXMucGVlayggZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApO1xuXG4gICAgaWYoIHRva2VuICl7XG4gICAgICAgIHRoaXMudG9rZW5zLnBvcCgpO1xuICAgICAgICB0aGlzLmNvbHVtbiAtPSB0b2tlbi52YWx1ZS5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9XG5cbiAgICByZXR1cm4gdm9pZCAwO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtFeHByZXNzaW9ufSBBbiBleHByZXNzaW9uIG5vZGVcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5leHByZXNzaW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IG51bGwsXG4gICAgICAgIGxpc3QsIG5leHQsIHRva2VuO1xuXG4gICAgaWYoIHRoaXMuZXhwZWN0KCAnOycgKSApe1xuICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuXG4gICAgaWYoIG5leHQgPSB0aGlzLnBlZWsoKSApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRVhQUkVTU0lPTicsIG5leHQgKTtcbiAgICAgICAgc3dpdGNoKCBuZXh0LnR5cGUgKXtcbiAgICAgICAgICAgIGNhc2UgR3JhbW1hci5QdW5jdHVhdG9yOlxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmV4cGVjdCggJ10nICkgKXtcbiAgICAgICAgICAgICAgICAgICAgbGlzdCA9IHRoaXMubGlzdCggJ1snICk7XG4gICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLnRva2Vucy5sZW5ndGggPT09IDEgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmFycmF5RXhwcmVzc2lvbiggbGlzdCApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIGxpc3QubGVuZ3RoID4gMSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuc2VxdWVuY2VFeHByZXNzaW9uKCBsaXN0ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gQXJyYXkuaXNBcnJheSggbGlzdCApID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0WyAwIF0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBuZXh0LnZhbHVlID09PSAnfScgKXtcbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwKCBuZXh0ICk7XG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIHRoaXMuZXhwZWN0KCAnPycgKSApe1xuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5leGlzdGVudGlhbEV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgR3JhbW1hci5OdWxsTGl0ZXJhbDpcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5saXRlcmFsKCk7XG4gICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gR3JhbW1hci5JZGVudGlmaWVyXG4gICAgICAgICAgICAvLyBHcmFtbWFyLk51bWVyaWNMaXRlcmFsXG4gICAgICAgICAgICAvLyBHcmFtbWFyLlN0cmluZ0xpdGVyYWxcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwKCBuZXh0ICk7XG4gICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIC8vIEltcGxpZWQgbWVtYmVyIGV4cHJlc3Npb24uIFNob3VsZCBvbmx5IGhhcHBlbiBhZnRlciBhbiBJZGVudGlmaWVyLlxuICAgICAgICAgICAgICAgIGlmKCBuZXh0ICYmIG5leHQudHlwZSA9PT0gR3JhbW1hci5QdW5jdHVhdG9yICYmICggbmV4dC52YWx1ZSA9PT0gJyknIHx8IG5leHQudmFsdWUgPT09ICddJyB8fCBuZXh0LnZhbHVlID09PSAnPycgKSApe1xuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5tZW1iZXJFeHByZXNzaW9uKCBleHByZXNzaW9uLCBmYWxzZSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlKCAoIHRva2VuID0gdGhpcy5leHBlY3QoICcpJywgJ1snLCAnLicgKSApICl7XG4gICAgICAgICAgICBpZiggdG9rZW4udmFsdWUgPT09ICcpJyApe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmNhbGxFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHRva2VuLnZhbHVlID09PSAnWycgKXtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5tZW1iZXJFeHByZXNzaW9uKCBleHByZXNzaW9uLCB0cnVlICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHRva2VuLnZhbHVlID09PSAnLicgKXtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5tZW1iZXJFeHByZXNzaW9uKCBleHByZXNzaW9uLCBmYWxzZSApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoICdVbmV4cGVjdGVkIHRva2VuICcgKyB0b2tlbiApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0V4cHJlc3Npb25TdGF0ZW1lbnR9IEFuIGV4cHJlc3Npb24gc3RhdGVtZW50XG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuZXhwcmVzc2lvblN0YXRlbWVudCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb24oKSxcbiAgICAgICAgZXhwcmVzc2lvblN0YXRlbWVudDtcbiAgICAvL2NvbnNvbGUubG9nKCAnRVhQUkVTU0lPTiBTVEFURU1FTlQgV0lUSCcsIGV4cHJlc3Npb24gKTtcbiAgICBleHByZXNzaW9uU3RhdGVtZW50ID0gbmV3IE5vZGUuRXhwcmVzc2lvblN0YXRlbWVudCggZXhwcmVzc2lvbiApO1xuXG4gICAgcmV0dXJuIGV4cHJlc3Npb25TdGF0ZW1lbnQ7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0lkZW50aWZpZXJ9IEFuIGlkZW50aWZpZXJcbiAqIEB0aHJvd3Mge1N5bnRheEVycm9yfSBJZiB0aGUgdG9rZW4gaXMgbm90IGFuIGlkZW50aWZpZXJcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5pZGVudGlmaWVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgdG9rZW4gPSB0aGlzLmNvbnN1bWUoKTtcblxuICAgIGlmKCAhKCB0b2tlbi50eXBlID09PSBHcmFtbWFyLklkZW50aWZpZXIgKSApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdJZGVudGlmaWVyIGV4cGVjdGVkJyApO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTm9kZS5JZGVudGlmaWVyKCB0b2tlbi52YWx1ZSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0ZXJtaW5hdG9yXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6QXJyYXk8RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufSBUaGUgbGlzdCBvZiBleHByZXNzaW9ucyBvciByYW5nZSBleHByZXNzaW9uXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uKCB0ZXJtaW5hdG9yICl7XG4gICAgdmFyIGxpc3QgPSBbXSxcbiAgICAgICAgaXNOdW1lcmljID0gZmFsc2UsXG4gICAgICAgIGV4cHJlc3Npb24sIG5leHQ7XG4gICAgLy9jb25zb2xlLmxvZyggJ0xJU1QnLCB0ZXJtaW5hdG9yICk7XG4gICAgaWYoICF0aGlzLnBlZWsoIHRlcm1pbmF0b3IgKSApe1xuICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgIGlzTnVtZXJpYyA9IG5leHQudHlwZSA9PT0gR3JhbW1hci5OdW1lcmljTGl0ZXJhbDtcblxuICAgICAgICAvLyBFeGFtcGxlczogWzEuLjNdLCBbNS4uXSwgWy4uN11cbiAgICAgICAgaWYoICggaXNOdW1lcmljIHx8IG5leHQudmFsdWUgPT09ICcuJyApICYmIHRoaXMucGVla0F0KCAxLCAnLicgKSApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gUkFOR0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpc051bWVyaWMgP1xuICAgICAgICAgICAgICAgIHRoaXMubG9va3VwKCBuZXh0ICkgOlxuICAgICAgICAgICAgICAgIG51bGw7XG4gICAgICAgICAgICBsaXN0ID0gdGhpcy5yYW5nZUV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcblxuICAgICAgICAvLyBFeGFtcGxlczogWzEsMiwzXSwgW1wiYWJjXCIsXCJkZWZcIl0sIFtmb28sYmFyXSwgW3tmb28uYmFyfV1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIEFSUkFZIE9GIEVYUFJFU1NJT05TJyApO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cCggbmV4dCApO1xuICAgICAgICAgICAgICAgIGxpc3QudW5zaGlmdCggZXhwcmVzc2lvbiApO1xuICAgICAgICAgICAgfSB3aGlsZSggdGhpcy5leHBlY3QoICcsJyApICk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJy0gTElTVCBSRVNVTFQnLCBsaXN0ICk7XG4gICAgcmV0dXJuIGxpc3Q7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0xpdGVyYWx9IFRoZSBsaXRlcmFsIG5vZGVcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5saXRlcmFsID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgdG9rZW4gPSB0aGlzLmNvbnN1bWUoKSxcbiAgICAgICAgcmF3ID0gdG9rZW4udmFsdWUsXG4gICAgICAgIGV4cHJlc3Npb247XG5cbiAgICBzd2l0Y2goIHRva2VuLnR5cGUgKXtcbiAgICAgICAgY2FzZSBHcmFtbWFyLk51bWVyaWNMaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IG5ldyBOb2RlLk51bWVyaWNMaXRlcmFsKCByYXcgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBuZXcgTm9kZS5TdHJpbmdMaXRlcmFsKCByYXcgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEdyYW1tYXIuTnVsbExpdGVyYWw6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gbmV3IE5vZGUuTnVsbExpdGVyYWwoIHJhdyApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoICdMaXRlcmFsIGV4cGVjdGVkJyApO1xuICAgIH1cblxuICAgIHJldHVybiBleHByZXNzaW9uO1xufTtcblxuYnVpbGRlclByb3RvdHlwZS5sb29rdXAgPSBmdW5jdGlvbiggbmV4dCApe1xuICAgIHZhciBleHByZXNzaW9uO1xuICAgIC8vY29uc29sZS5sb2coICdMT09LVVAnLCBuZXh0ICk7XG4gICAgc3dpdGNoKCBuZXh0LnR5cGUgKXtcbiAgICAgICAgY2FzZSBHcmFtbWFyLklkZW50aWZpZXI6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5pZGVudGlmaWVyKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBHcmFtbWFyLk51bWVyaWNMaXRlcmFsOlxuICAgICAgICBjYXNlIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxpdGVyYWwoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEdyYW1tYXIuUHVuY3R1YXRvcjpcbiAgICAgICAgICAgIGlmKCBuZXh0LnZhbHVlID09PSAnfScgKXtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWUoICd9JyApO1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmJsb2NrRXhwcmVzc2lvbiggJ3snICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoICd0b2tlbiBjYW5ub3QgYmUgYSBsb29rdXAnICk7XG4gICAgfVxuXG4gICAgbmV4dCA9IHRoaXMucGVlaygpO1xuXG4gICAgaWYoIG5leHQgJiYgbmV4dC52YWx1ZSA9PT0gJyUnICl7XG4gICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcbiAgICB9XG4gICAgaWYoIG5leHQgJiYgbmV4dC52YWx1ZSA9PT0gJ34nICl7XG4gICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLnJvb3RFeHByZXNzaW9uKCBleHByZXNzaW9uICk7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coICctIExPT0tVUCBSRVNVTFQnLCBleHByZXNzaW9uICk7XG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLmxvb2t1cEV4cHJlc3Npb24gPSBmdW5jdGlvbigga2V5ICl7XG4gICAgdGhpcy5jb25zdW1lKCAnJScgKTtcbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLkxvb2t1cEV4cHJlc3Npb24oIGtleSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7RXhwcmVzc2lvbn0gcHJvcGVydHkgVGhlIGV4cHJlc3Npb24gYXNzaWduZWQgdG8gdGhlIHByb3BlcnR5IG9mIHRoZSBtZW1iZXIgZXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBjb21wdXRlZCBXaGV0aGVyIG9yIG5vdCB0aGUgbWVtYmVyIGV4cHJlc3Npb24gaXMgY29tcHV0ZWRcbiAqIEByZXR1cm5zIHtNZW1iZXJFeHByZXNzaW9ufSBUaGUgbWVtYmVyIGV4cHJlc3Npb25cbiAqL1xuYnVpbGRlclByb3RvdHlwZS5tZW1iZXJFeHByZXNzaW9uID0gZnVuY3Rpb24oIHByb3BlcnR5LCBjb21wdXRlZCApe1xuICAgIC8vY29uc29sZS5sb2coICdNRU1CRVInLCBwcm9wZXJ0eSApO1xuICAgIHZhciBvYmplY3QgPSB0aGlzLmV4cHJlc3Npb24oKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gT0JKRUNUJywgb2JqZWN0ICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gUFJPUEVSVFknLCBwcm9wZXJ0eSApO1xuICAgIC8vY29uc29sZS5sb2coICctIENPTVBVVEVEJywgY29tcHV0ZWQgKTtcbiAgICByZXR1cm4gY29tcHV0ZWQgP1xuICAgICAgICBuZXcgTm9kZS5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHkgKSA6XG4gICAgICAgIG5ldyBOb2RlLlN0YXRpY01lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHkgKTtcbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiggaW5wdXQgKXtcbiAgICB0aGlzLnRva2VucyA9IHRoaXMubGV4ZXIubGV4KCBpbnB1dCApO1xuICAgIHJldHVybiB0aGlzLmJ1aWxkKCB0aGlzLnRva2VucyApO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyB0aGUgbmV4dCB0b2tlbiBpbiB0aGUgdG9rZW4gbGlzdCBfd2l0aG91dCByZW1vdmluZyBpdF8uIElmIGNvbXBhcmlzb25zIGFyZSBwcm92aWRlZCwgdGhlIHRva2VuIHdpbGwgb25seSBiZSByZXR1cm5lZCBpZiB0aGUgdmFsdWUgbWF0Y2hlcyBvbmUgb2YgdGhlIGNvbXBhcmlzb25zLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZpcnN0XSBUaGUgZmlyc3QgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtzZWNvbmRdIFRoZSBzZWNvbmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFt0aGlyZF0gVGhlIHRoaXJkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZm91cnRoXSBUaGUgZm91cnRoIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtMZXhlcn5Ub2tlbn0gVGhlIG5leHQgdG9rZW4gaW4gdGhlIGxpc3Qgb3IgYHVuZGVmaW5lZGAgaWYgaXQgZGlkIG5vdCBleGlzdFxuICovXG5idWlsZGVyUHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbiggZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApe1xuICAgIHJldHVybiB0aGlzLnBlZWtBdCggMCwgZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyB0aGUgdG9rZW4gYXQgdGhlIHJlcXVlc3RlZCBwb3NpdGlvbiBfd2l0aG91dCByZW1vdmluZyBpdF8gZnJvbSB0aGUgdG9rZW4gbGlzdC4gSWYgY29tcGFyaXNvbnMgYXJlIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgY29tcGFyaXNvbnMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBwb3NpdGlvbiBUaGUgcG9zaXRpb24gd2hlcmUgdGhlIHRva2VuIHdpbGwgYmUgcGVla2VkXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZpcnN0XSBUaGUgZmlyc3QgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtzZWNvbmRdIFRoZSBzZWNvbmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFt0aGlyZF0gVGhlIHRoaXJkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZm91cnRoXSBUaGUgZm91cnRoIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtMZXhlcn5Ub2tlbn0gVGhlIHRva2VuIGF0IHRoZSByZXF1ZXN0ZWQgcG9zaXRpb24gb3IgYHVuZGVmaW5lZGAgaWYgaXQgZGlkIG5vdCBleGlzdFxuICovXG5idWlsZGVyUHJvdG90eXBlLnBlZWtBdCA9IGZ1bmN0aW9uKCBwb3NpdGlvbiwgZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApe1xuICAgIHZhciBsZW5ndGggPSB0aGlzLnRva2Vucy5sZW5ndGgsXG4gICAgICAgIGluZGV4LCB0b2tlbiwgdmFsdWU7XG5cbiAgICBpZiggbGVuZ3RoICYmIHR5cGVvZiBwb3NpdGlvbiA9PT0gJ251bWJlcicgJiYgcG9zaXRpb24gPiAtMSApe1xuICAgICAgICAvLyBDYWxjdWxhdGUgYSB6ZXJvLWJhc2VkIGluZGV4IHN0YXJ0aW5nIGZyb20gdGhlIGVuZCBvZiB0aGUgbGlzdFxuICAgICAgICBpbmRleCA9IGxlbmd0aCAtIHBvc2l0aW9uIC0gMTtcblxuICAgICAgICBpZiggaW5kZXggPiAtMSAmJiBpbmRleCA8IGxlbmd0aCApe1xuICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRva2Vuc1sgaW5kZXggXTtcbiAgICAgICAgICAgIHZhbHVlID0gdG9rZW4udmFsdWU7XG5cbiAgICAgICAgICAgIGlmKCB2YWx1ZSA9PT0gZmlyc3QgfHwgdmFsdWUgPT09IHNlY29uZCB8fCB2YWx1ZSA9PT0gdGhpcmQgfHwgdmFsdWUgPT09IGZvdXJ0aCB8fCAoICFmaXJzdCAmJiAhc2Vjb25kICYmICF0aGlyZCAmJiAhZm91cnRoICkgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdm9pZCAwO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtQcm9ncmFtfSBBIHByb2dyYW0gbm9kZVxuICovXG5idWlsZGVyUHJvdG90eXBlLnByb2dyYW0gPSBmdW5jdGlvbigpe1xuICAgIHZhciBib2R5ID0gW107XG4gICAgLy9jb25zb2xlLmxvZyggJ1BST0dSQU0nICk7XG4gICAgd2hpbGUoIHRydWUgKXtcbiAgICAgICAgaWYoIHRoaXMudG9rZW5zLmxlbmd0aCApe1xuICAgICAgICAgICAgYm9keS51bnNoaWZ0KCB0aGlzLmV4cHJlc3Npb25TdGF0ZW1lbnQoKSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBOb2RlLlByb2dyYW0oIGJvZHkgKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUucmFuZ2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIHJpZ2h0ICl7XG4gICAgdmFyIGxlZnQ7XG5cbiAgICB0aGlzLmV4cGVjdCggJy4nICk7XG4gICAgdGhpcy5leHBlY3QoICcuJyApO1xuXG4gICAgbGVmdCA9IHRoaXMucGVlaygpLnR5cGUgPT09IEdyYW1tYXIuTnVtZXJpY0xpdGVyYWwgP1xuICAgICAgICBsZWZ0ID0gdGhpcy5saXRlcmFsKCkgOlxuICAgICAgICBudWxsO1xuXG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5SYW5nZUV4cHJlc3Npb24oIGxlZnQsIHJpZ2h0ICk7XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLnJvb3RFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSApe1xuICAgIHRoaXMuY29uc3VtZSggJ34nICk7XG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5Sb290RXhwcmVzc2lvbigga2V5ICk7XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLnNlcXVlbmNlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBsaXN0ICl7XG4gICAgcmV0dXJuIG5ldyBOb2RlLlNlcXVlbmNlRXhwcmVzc2lvbiggbGlzdCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlXG4gKiBAdGhyb3dzIHtleHRlcm5hbDpTeW50YXhFcnJvcn0gV2hlbiBpdCBleGVjdXRlc1xuICovXG5idWlsZGVyUHJvdG90eXBlLnRocm93RXJyb3IgPSBmdW5jdGlvbiggbWVzc2FnZSApe1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggbWVzc2FnZSApO1xufTsiXSwibmFtZXMiOlsiQXJyYXlFeHByZXNzaW9uIiwiQ2FsbEV4cHJlc3Npb24iLCJFeHByZXNzaW9uU3RhdGVtZW50IiwiSWRlbnRpZmllciIsIkxpdGVyYWwiLCJNZW1iZXJFeHByZXNzaW9uIiwiUHJvZ3JhbSIsIlNlcXVlbmNlRXhwcmVzc2lvbiIsIlN5bnRheC5MaXRlcmFsIiwiU3ludGF4Lk1lbWJlckV4cHJlc3Npb24iLCJTeW50YXguUHJvZ3JhbSIsIlN5bnRheC5BcnJheUV4cHJlc3Npb24iLCJTeW50YXguQ2FsbEV4cHJlc3Npb24iLCJTeW50YXguRXhwcmVzc2lvblN0YXRlbWVudCIsIlN5bnRheC5JZGVudGlmaWVyIiwiTnVsbExpdGVyYWwiLCJOdW1lcmljTGl0ZXJhbCIsIlN5bnRheC5TZXF1ZW5jZUV4cHJlc3Npb24iLCJTdHJpbmdMaXRlcmFsIiwiQmxvY2tFeHByZXNzaW9uIiwiRXhpc3RlbnRpYWxFeHByZXNzaW9uIiwiTG9va3VwRXhwcmVzc2lvbiIsIlJhbmdlRXhwcmVzc2lvbiIsIlJvb3RFeHByZXNzaW9uIiwiU2NvcGVFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb24iLCJOb2RlLkFycmF5RXhwcmVzc2lvbiIsIktleXBhdGhOb2RlLkJsb2NrRXhwcmVzc2lvbiIsIk5vZGUuQ2FsbEV4cHJlc3Npb24iLCJLZXlwYXRoTm9kZS5FeGlzdGVudGlhbEV4cHJlc3Npb24iLCJHcmFtbWFyLlB1bmN0dWF0b3IiLCJHcmFtbWFyLk51bGxMaXRlcmFsIiwiTm9kZS5FeHByZXNzaW9uU3RhdGVtZW50IiwiR3JhbW1hci5JZGVudGlmaWVyIiwiTm9kZS5JZGVudGlmaWVyIiwiR3JhbW1hci5OdW1lcmljTGl0ZXJhbCIsIk5vZGUuTnVtZXJpY0xpdGVyYWwiLCJOb2RlLlN0cmluZ0xpdGVyYWwiLCJHcmFtbWFyLlN0cmluZ0xpdGVyYWwiLCJOb2RlLk51bGxMaXRlcmFsIiwiS2V5cGF0aE5vZGUuTG9va3VwRXhwcmVzc2lvbiIsIk5vZGUuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIiwiTm9kZS5TdGF0aWNNZW1iZXJFeHByZXNzaW9uIiwiTm9kZS5Qcm9ncmFtIiwiS2V5cGF0aE5vZGUuUmFuZ2VFeHByZXNzaW9uIiwiS2V5cGF0aE5vZGUuUm9vdEV4cHJlc3Npb24iLCJOb2RlLlNlcXVlbmNlRXhwcmVzc2lvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7O0FBS0EsQUFBZSxTQUFTLElBQUksRUFBRSxFQUFFO0FBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsSUFBSSxJQUFJOztBQ1AzQixJQUFJLFVBQVUsUUFBUSxZQUFZLENBQUM7QUFDMUMsQUFBTyxJQUFJLGNBQWMsSUFBSSxTQUFTLENBQUM7QUFDdkMsQUFBTyxJQUFJLFdBQVcsT0FBTyxNQUFNLENBQUM7QUFDcEMsQUFBTyxJQUFJLFVBQVUsUUFBUSxZQUFZLENBQUM7QUFDMUMsQUFBTyxJQUFJLGFBQWEsS0FBSyxRQUFROztBQ0o5QixJQUFJQSxpQkFBZSxTQUFTLGlCQUFpQixDQUFDO0FBQ3JELEFBQU8sSUFBSUMsZ0JBQWMsVUFBVSxn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
