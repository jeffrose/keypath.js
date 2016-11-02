(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.kp = factory());
}(this, (function () { 'use strict';

/**
 * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
 * @class Null
 * @extends external:null
 */
function Null(){}
Null.prototype = Object.create( null );
Null.prototype.constructor =  Null;

var Identifier$1      = 'Identifier';
var NumericLiteral$1  = 'Numeric';
var NullLiteral$1     = 'Null';
var Punctuator$1      = 'Punctuator';
var StringLiteral$1   = 'String';

var tokenId = 0;

/**
 * @class Lexer~Token
 * @extends Null
 * @param {external:string} type The type of the token
 * @param {external:string} value The value of the token
 */
function Token( type, value ){
    /**
     * @member {external:number} Lexer~Token#id
     */
    this.id = ++tokenId;
    /**
     * @member {external:string} Lexer~Token#type
     */
    this.type = type;
    /**
     * @member {external:string} Lexer~Token#value
     */
    this.value = value;
}

Token.prototype = new Null();

Token.prototype.constructor = Token;

/**
 * @function
 * @returns {external:Object} A JSON representation of the token
 */
Token.prototype.toJSON = function(){
    var json = new Null();

    json.type = this.type;
    json.value = this.value;

    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the token
 */
Token.prototype.toString = function(){
    return String( this.value );
};

/**
 * @class Lexer~Identifier
 * @extends Lexer~Token
 * @param {external:string} value
 */
function Identifier$$1( value ){
    Token.call( this, Identifier$1, value );
}

Identifier$$1.prototype = Object.create( Token.prototype );

Identifier$$1.prototype.constructor = Identifier$$1;

/**
 * @class Lexer~NumericLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function NumericLiteral$$1( value ){
    Token.call( this, NumericLiteral$1, value );
}

NumericLiteral$$1.prototype = Object.create( Token.prototype );

NumericLiteral$$1.prototype.constructor = NumericLiteral$$1;

/**
 * @class Lexer~NullLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function NullLiteral$$1( value ){
    Token.call( this, NullLiteral$1, value );
}

NullLiteral$$1.prototype = Object.create( Token.prototype );

NullLiteral$$1.prototype.constructor = NullLiteral$$1;

/**
 * @class Lexer~Punctuator
 * @extends Lexer~Token
 * @param {external:string} value
 */
function Punctuator$$1( value ){
    Token.call( this, Punctuator$1, value );
}

Punctuator$$1.prototype = Object.create( Token.prototype );

Punctuator$$1.prototype.constructor = Punctuator$$1;

/**
 * @class Lexer~StringLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function StringLiteral$$1( value ){
    Token.call( this, StringLiteral$1, value );
}

StringLiteral$$1.prototype = Object.create( Token.prototype );

StringLiteral$$1.prototype.constructor = StringLiteral$$1;

var lexerPrototype;

/**
 * @function Lexer~isIdentifier
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is an identifier character
 */
function isIdentifier( char ){
    return 'a' <= char && char <= 'z' || 'A' <= char && char <= 'Z' || '_' === char || char === '$';
}

/**
 * @function Lexer~isNumeric
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is a numeric character
 */
function isNumeric( char ){
    return '0' <= char && char <= '9';
}

/**
 * @function Lexer~isPunctuator
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is a punctuator character
 */
function isPunctuator( char ){
    return char === '.' || char === '(' || char === ')' || char === '[' || char === ']' || char === '{' || char === '}' || char === ',' || char === '%' || char === '?' || char === ';' || char === '~';
}

/**
 * @function Lexer~isQuote
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is a quote character
 */
function isQuote( char ){
    return char === '"' || char === "'";
}

/**
 * @function Lexer~isWhitespace
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is a whitespace character
 */
function isWhitespace( char ){
    return char === ' ' || char === '\r' || char === '\t' || char === '\n' || char === '\v' || char === '\u00A0';
}

/**
 * @class Lexer
 * @extends Null
 */
function Lexer(){
    this.buffer = '';
}

lexerPrototype = Lexer.prototype = new Null();

lexerPrototype.constructor = Lexer;

/**
 * @function
 * @param {external:string} text
 */
lexerPrototype.lex = function( text ){
    /**
     * @member {external:string}
     * @default ''
     */
    this.buffer = text;
    /**
     * @member {external:number}
     */
    this.index = 0;
    /**
     * @member {Array<Lexer~Token>}
     */
    this.tokens = [];

    var length = this.buffer.length,
        word = '',
        char, token, quote;

    while( this.index < length ){
        char = this.buffer[ this.index ];

        // Identifier
        if( isIdentifier( char ) ){
            word = this.read( function( char ){
                return !isIdentifier( char ) && !isNumeric( char );
            } );

            token = word === 'null' ?
                new NullLiteral$$1( word ) :
                new Identifier$$1( word );
            this.tokens.push( token );

        // Punctuator
        } else if( isPunctuator( char ) ){
            token = new Punctuator$$1( char );
            this.tokens.push( token );

            this.index++;

        // Quoted String
        } else if( isQuote( char ) ){
            quote = char;

            this.index++;

            word = this.read( function( char ){
                return char === quote;
            } );

            token = new StringLiteral$$1( quote + word + quote );
            this.tokens.push( token );

            this.index++;

        // Numeric
        } else if( isNumeric( char ) ){
            word = this.read( function( char ){
                return !isNumeric( char );
            } );

            token = new NumericLiteral$$1( word );
            this.tokens.push( token );

        // Whitespace
        } else if( isWhitespace( char ) ){
            this.index++;

        // Error
        } else {
            throw new SyntaxError( '"' + char + '" is an invalid character' );
        }

        word = '';
    }

    return this.tokens;
};

/**
 * @function
 * @param {external:function} until A condition that when met will stop the reading of the buffer
 * @returns {external:string} The portion of the buffer read
 */
lexerPrototype.read = function( until ){
    var start = this.index,
        char;

    while( this.index < this.buffer.length ){
        char = this.buffer[ this.index ];

        if( until( char ) ){
            break;
        }

        this.index++;
    }

    return this.buffer.slice( start, this.index );
};

/**
 * @function
 * @returns {external:Object} A JSON representation of the lexer
 */
lexerPrototype.toJSON = function(){
    var json = new Null();

    json.buffer = this.buffer;
    json.tokens = this.tokens.map( function( token ){
        return token.toJSON();
    } );

    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the lexer
 */
lexerPrototype.toString = function(){
    return this.buffer;
};

var ArrayExpression$1       = 'ArrayExpression';
var CallExpression$1        = 'CallExpression';
var ExpressionStatement$1   = 'ExpressionStatement';
var Identifier$3            = 'Identifier';
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
function Identifier$2( name ){
    Expression.call( this, Identifier$3 );

    if( typeof name !== 'string' ){
        throw new TypeError( 'name must be a string' );
    }

    /**
     * @member {external:string}
     */
    this.name = name;
}

Identifier$2.prototype = Object.create( Expression.prototype );

Identifier$2.prototype.constructor = Identifier$2;

/**
 * @function
 * @returns {external:Object} A JSON representation of the identifier
 */
Identifier$2.prototype.toJSON = function(){
    var json = Node.prototype.toJSON.call( this );

    json.name = this.name;

    return json;
};

function NullLiteral$2( raw ){
    if( raw !== 'null' ){
        throw new TypeError( 'raw is not a null literal' );
    }

    Literal$$1.call( this, null, raw );
}

NullLiteral$2.prototype = Object.create( Literal$$1.prototype );

NullLiteral$2.prototype.constructor = NullLiteral$2;

function NumericLiteral$2( raw ){
    var value = parseFloat( raw );

    if( isNaN( value ) ){
        throw new TypeError( 'raw is not a numeric literal' );
    }

    Literal$$1.call( this, value, raw );
}

NumericLiteral$2.prototype = Object.create( Literal$$1.prototype );

NumericLiteral$2.prototype.constructor = NumericLiteral$2;

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

function StringLiteral$2( raw ){
    if( raw[ 0 ] !== '"' && raw[ 0 ] !== "'" ){
        throw new TypeError( 'raw is not a string literal' );
    }

    var value = raw.substring( 1, raw.length - 1 );

    Literal$$1.call( this, value, raw );
}

StringLiteral$2.prototype = Object.create( Literal$$1.prototype );

StringLiteral$2.prototype.constructor = StringLiteral$2;

var BlockExpression$1       = 'BlockExpression';
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
    if( !( key instanceof Literal$$1 ) && !( key instanceof Identifier$2 ) && !( key instanceof BlockExpression$$1 ) ){
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
    if( !( key instanceof Literal$$1 ) && !( key instanceof Identifier$2 ) && !( key instanceof BlockExpression$$1 ) ){
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
    this.consume( '[' );
    return new ArrayExpression$$1( list );
};

Builder.prototype.blockExpression = function( terminator ){
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
Builder.prototype.callExpression = function(){
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

Builder.prototype.existentialExpression = function(){
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
Builder.prototype.expect = function( first, second, third, fourth ){
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
Builder.prototype.expression = function(){
    var expression = null,
        list, next, token;

    if( this.expect( ';' ) ){
        next = this.peek();
    }

    if( next = this.peek() ){
        //console.log( 'EXPRESSION', next );
        switch( next.type ){
            case Punctuator$1:
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
            case NullLiteral$1:
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
                if( next && next.type === Punctuator$1 && ( next.value === ')' || next.value === ']' || next.value === '?' ) ){
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
Builder.prototype.expressionStatement = function(){
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
Builder.prototype.identifier = function(){
    var token = this.consume();

    if( !( token.type === Identifier$1 ) ){
        this.throwError( 'Identifier expected' );
    }

    return new Identifier$2( token.value );
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
        isNumeric = next.type === NumericLiteral$1;

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
Builder.prototype.literal = function(){
    var token = this.consume(),
        raw = token.value,
        expression;

    switch( token.type ){
        case NumericLiteral$1:
            expression = new NumericLiteral$2( raw );
            break;
        case StringLiteral$1:
            expression = new StringLiteral$2( raw );
            break;
        case NullLiteral$1:
            expression = new NullLiteral$2( raw );
            break;
        default:
            this.throwError( 'Literal expected' );
    }

    return expression;
};

Builder.prototype.lookup = function( next ){
    var expression;
    //console.log( 'LOOKUP', next );
    switch( next.type ){
        case Identifier$1:
            expression = this.identifier();
            break;
        case NumericLiteral$1:
        case StringLiteral$1:
            expression = this.literal();
            break;
        case Punctuator$1:
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

Builder.prototype.lookupExpression = function( key ){
    this.consume( '%' );
    return new LookupExpression$$1( key );
};

/**
 * @function
 * @param {Expression} property The expression assigned to the property of the member expression
 * @param {external:boolean} computed Whether or not the member expression is computed
 * @returns {MemberExpression} The member expression
 */
Builder.prototype.memberExpression = function( property, computed ){
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

Builder.prototype.parse = function( input ){
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

    return void 0;
};

/**
 * @function
 * @returns {Program} A program node
 */
Builder.prototype.program = function(){
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

Builder.prototype.rangeExpression = function( right ){
    var left;

    this.expect( '.' );
    this.expect( '.' );

    left = this.peek().type === NumericLiteral$1 ?
        left = this.literal() :
        null;

    return new RangeExpression$$1( left, right );
};

Builder.prototype.rootExpression = function( key ){
    this.consume( '~' );
    return new RootExpression$$1( key );
};

Builder.prototype.sequenceExpression = function( list ){
    return new SequenceExpression$$1( list );
};

/**
 * @function
 * @param {external:string} message The error message
 * @throws {external:SyntaxError} When it executes
 */
Builder.prototype.throwError = function( message ){
    throw new SyntaxError( message );
};

var noop = function(){};
var cache$2 = new Null();
var getter = new Null();
var setter = new Null();

function executeList( list, scope, value, lookup ){
    var index = list.length,
        result = new Array( index );
    switch( list.length ){
        case 0:
            break;
        case 1:
            result[ 0 ] = list[ 0 ]( scope, value, lookup );
            break;
        case 2:
            result[ 0 ] = list[ 0 ]( scope, value, lookup );
            result[ 1 ] = list[ 1 ]( scope, value, lookup );
            break;
        case 3:
            result[ 0 ] = list[ 0 ]( scope, value, lookup );
            result[ 1 ] = list[ 1 ]( scope, value, lookup );
            result[ 2 ] = list[ 2 ]( scope, value, lookup );
            break;
        case 4:
            result[ 0 ] = list[ 0 ]( scope, value, lookup );
            result[ 1 ] = list[ 1 ]( scope, value, lookup );
            result[ 2 ] = list[ 2 ]( scope, value, lookup );
            result[ 3 ] = list[ 3 ]( scope, value, lookup );
            break;
        default:
            while( index-- ){
                result[ index ] = list[ index ]( scope, value, lookup );
            }
            break;
    }
    return result;
}

getter.value = function( object, key ){
    return object[ key ];
};

getter.list = function( object, key ){
    var index = object.length,
        result = new Array( index );

    switch( index ){
        case 0:
            return result;
        case 1:
            result[ 0 ] = object[ 0 ][ key ];
            return result;
        case 2:
            result[ 0 ] = object[ 0 ][ key ];
            result[ 1 ] = object[ 1 ][ key ];
            return result;
        case 3:
            result[ 0 ] = object[ 0 ][ key ];
            result[ 1 ] = object[ 1 ][ key ];
            result[ 2 ] = object[ 2 ][ key ];
            return result;
        case 4:
            result[ 0 ] = object[ 0 ][ key ];
            result[ 1 ] = object[ 1 ][ key ];
            result[ 2 ] = object[ 2 ][ key ];
            result[ 3 ] = object[ 3 ][ key ];
            return result;
        default:
            while( index-- ){
                result[ index ] = object[ index ][ key ];
            }
            return result;
    }
};

setter.value = function( object, key, value ){
    if( !hasOwnProperty( object, key ) ){
        object[ key ] = value || {};
    }
    return getter.value( object, key );
};

/**
 * @function Interpreter~returnZero
 * @returns {external:number} zero
 */
function returnZero(){
    return 0;
}

Interpreter.prototype = Object.create( SyntaxError.prototype );

/**
 * @class Interpreter
 * @extends Null
 * @param {Builder} builder
 */
function Interpreter( builder ){
    if( !arguments.length ){
        this.throwError( 'builder cannot be undefined', TypeError );
    }

    /**
     * @member {Builder} Interpreter#builder
     */
    this.builder = builder;
}

Interpreter.prototype = new Null();

Interpreter.prototype.constructor = Interpreter;

Interpreter.prototype.arrayExpression = function( elements, context, assign ){
    //console.log( 'Composing ARRAY EXPRESSION', elements.length );
    //console.log( '- DEPTH', this.depth );
    var depth = this.depth,
        fn, list;
    if( Array.isArray( elements ) ){
        list = this.listExpression( elements, false, assign );

        fn = function executeArrayExpression( scope, value, lookup ){
            //console.log( 'Executing ARRAY EXPRESSION' );
            //console.log( `- ${ fn.name } LIST`, list );
            //console.log( `- ${ fn.name } DEPTH`, depth );
            var index = list.length,
                keys, result;
            switch( index ){
                case 0:
                    break;
                case 1:
                    keys = list[ 0 ]( scope, value, lookup );
                    result = assign( scope, keys, !depth ? value : {} );
                    break;
                default:
                    keys = new Array( index );
                    result = new Array( index );
                    while( index-- ){
                        keys[ index ] = list[ index ]( scope, value, lookup );
                        result[ index ] = assign( scope, keys[ index ], !depth ? value : {} );
                    }
                    break;
            }
            //console.log( `- ${ fn.name } KEYS`, keys );
            //console.log( `- ${ fn.name } RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    } else {
        list = this.recurse( elements, false, assign );

        fn = function executeArrayExpressionWithElementRange( scope, value, lookup ){
            //console.log( 'Executing ARRAY EXPRESSION' );
            //console.log( `- ${ fn.name } LIST`, list.name );
            //console.log( `- ${ fn.name } DEPTH`, depth );
            var keys = list( scope, value, lookup ),
                index = keys.length,
                result = new Array( index );
            if( index === 1 ){
                result[ 0 ] = assign( scope, keys[ 0 ], !depth ? value : {} );
            } else {
                while( index-- ){
                    result[ index ] = assign( scope, keys[ index ], !depth ? value : {} );
                }
            }
            //console.log( `- ${ fn.name } RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    }

    return fn;
};

Interpreter.prototype.blockExpression = function( tokens, context, assign ){
    //console.log( 'Composing BLOCK', tokens.join( '' ) );
    //console.log( '- DEPTH', this.depth );
    var depth = this.depth,
        text = tokens.join( '' ),
        program = hasOwnProperty( cache$2, text ) ?
            cache$2[ text ] :
            cache$2[ text ] = this.builder.build( tokens ),
        expression = this.recurse( program.body[ 0 ].expression, false, assign ),
        fn;
    return fn = function executeBlockExpression( scope, value, lookup ){
        //console.log( 'Executing BLOCK' );
        //console.log( `- ${ fn.name } SCOPE`, scope );
        //console.log( `- ${ fn.name } EXPRESSION`, expression.name );
        //console.log( `- ${ fn.name } DEPTH`, depth );
        var result = expression( scope, value, lookup );
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { context: scope, name: void 0, value: result } :
            result;
    };
};

Interpreter.prototype.callExpression = function( callee, args, context, assign ){
    //console.log( 'Composing CALL EXPRESSION' );
    //console.log( '- DEPTH', this.depth );
    var interpreter = this,
        depth = this.depth,
        isSetting = assign === setter.value,
        left = this.recurse( callee, true, assign ),
        list = this.listExpression( args, false, assign ),
        fn;

    return fn = function executeCallExpression( scope, value, lookup ){
        //console.log( 'Executing CALL EXPRESSION' );
        //console.log( `- ${ fn.name } args`, args.length );
        var lhs = left( scope, value, lookup ),
            values = executeList( list, scope, value, lookup ),
            result;
        //console.log( `- ${ fn.name } LHS`, lhs );
        //console.log( `- ${ fn.name } DEPTH`, depth );
        result = lhs.value.apply( lhs.context, values );
        if( isSetting && typeof lhs.value === 'undefined' ){
            interpreter.throwError( 'cannot create call expressions' );
        }
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { value: result }:
            result;
    };
};

/**
 * @function
 * @param {external:string} expression
 */
Interpreter.prototype.compile = function( expression, create ){
    var program = hasOwnProperty( cache$2, expression ) ?
            cache$2[ expression ] :
            cache$2[ expression ] = this.builder.build( expression ),
        body = program.body,
        interpreter = this,
        assign, expressions, fn, index;

    if( typeof create !== 'boolean' ){
        create = false;
    }
    this.depth = -1;
    this.isLeftList = false;
    this.isRightList = false;
    this.assigner = create ?
        setter :
        getter;

    assign = this.assigner.value;

    /**
     * @member {external:string}
     */
    interpreter.expression = this.builder.text;
    //console.log( '-------------------------------------------------' );
    //console.log( 'Interpreting ', expression );
    //console.log( '-------------------------------------------------' );
    //console.log( 'Program', program.range );

    switch( body.length ){
        case 0:
            fn = noop;
            break;
        case 1:
            fn = interpreter.recurse( body[ 0 ].expression, false, assign );
            break;
        default:
            index = body.length;
            expressions = new Array( index );
            while( index-- ){
                expressions[ index ] = interpreter.recurse( body[ index ].expression, false, assign );
            }
            fn = function executeProgram( scope, value, lookup ){
                var length = expressions.length,
                    lastValue;

                for( index = 0; index < length; index++ ){
                    lastValue = expressions[ index ]( scope, value, lookup );
                }

                return lastValue;
            };
            break;
    }
    //console.log( 'FN', fn.name );
    return fn;
};

Interpreter.prototype.computedMemberExpression = function( object, property, context, assign ){
    //console.log( 'Composing COMPUTED MEMBER EXPRESSION', object.type, property.type );
    //console.log( '- DEPTH', this.depth );
    var depth = this.depth,
        interpreter = this,
        isSafe = object.type === ExistentialExpression$1,
        left = this.recurse( object, false, assign ),
        right = this.recurse( property, false, assign ),
        fn;

    return fn = function executeComputedMemberExpression( scope, value, lookup ){
        //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
        //console.log( `- ${ fn.name } LEFT `, left.name );
        //console.log( `- ${ fn.name } RIGHT`, right.name );
        var lhs = left( scope, value, lookup ),
            index, length, position, result, rhs;
        if( !isSafe || ( lhs !== void 0 && lhs !== null ) ){
            rhs = right( scope, value, lookup );
            //console.log( `- ${ fn.name } DEPTH`, depth );
            //console.log( `- ${ fn.name } LHS`, lhs );
            //console.log( `- ${ fn.name } RHS`, rhs );
            if( Array.isArray( rhs ) ){
                if( ( interpreter.isLeftList ) && Array.isArray( lhs ) ){
                    length = rhs.length;
                    index = lhs.length;
                    result = new Array( index );
                    while( index-- ){
                        result[ index ] = new Array( length );
                        for( position = 0; position < length; position++ ){
                            result[ index ][ position ] = assign( lhs[ index ], rhs[ position ], !depth ? value : {} );
                        }
                    }
                } else {
                    index = rhs.length;
                    result = new Array( index );
                    while( index-- ){
                        result[ index ] = assign( lhs, rhs[ index ], !depth ? value : {} );
                    }
                }
            } else if( ( interpreter.isLeftList || interpreter.isRightList ) && Array.isArray( lhs ) ){
                index = lhs.length;
                result = new Array( index );
                while( index-- ){
                    result[ index ] = assign( lhs[ index ], rhs, !depth ? value : {} );
                }
            } else {
                result = assign( lhs, rhs, !depth ? value : {} );
            }
        }
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { context: lhs, name: rhs, value: result } :
            result;
    };
};

Interpreter.prototype.existentialExpression = function( expression, context, assign ){
    //console.log( 'Composing EXISTENTIAL EXPRESSION', expression.type );
    //console.log( '- DEPTH', this.depth );
    var left = this.recurse( expression, false, assign ),
        fn;
    return fn = function executeExistentialExpression( scope, value, lookup ){
        var result;
        //console.log( 'Executing EXISTENTIAL EXPRESSION' );
        //console.log( `- ${ fn.name } LEFT`, left.name );
        if( scope !== void 0 && scope !== null ){
            try {
                result = left( scope, value, lookup );
            } catch( e ){
                result = void 0;
            }
        }
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { value: result } :
            result;
    };
};

Interpreter.prototype.identifier = function( name, context, assign ){
    //console.log( 'Composing IDENTIFIER', name );
    //console.log( '- DEPTH', this.depth );
    var depth = this.depth,
        fn;
    return fn = function executeIdentifier( scope, value, lookup ){
        //console.log( 'Executing IDENTIFIER' );
        //console.log( `- ${ fn.name } NAME`, name );
        //console.log( `- ${ fn.name } DEPTH`, depth );
        //console.log( `- ${ fn.name } VALUE`, value );
        var result = assign( scope, name, !depth ? value : {} );
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { context: scope, name: name, value: result } :
            result;
    };
};

Interpreter.prototype.listExpression = function( items, context, assign ){
    var index = items.length,
        list = new Array( index );

    switch( index ){
        case 0:
            break;
        case 1:
            list[ 0 ] = this.listExpressionElement( items[ 0 ], context, assign );
            break;
        default:
            while( index-- ){
                list[ index ] = this.listExpressionElement( items[ index ], context, assign );
            }
    }

    return list;
};

Interpreter.prototype.listExpressionElement = function( element, context, assign ){
    switch( element.type ){
        case Literal$1:
            return this.literal( element.value, context );
        case LookupExpression$1:
            return this.lookupExpression( element.key, false, context, assign );
        case RootExpression$1:
            return this.rootExpression( element.key, context, assign );
        case BlockExpression$1:
            return this.blockExpression( element.body, context, assign );
        default:
            this.throwError( 'Unexpected list element type', element.type );
    }
};

Interpreter.prototype.literal = function( value, context ){
    //console.log( 'Composing LITERAL', value );
    //console.log( '- DEPTH', this.depth );
    var depth = this.depth,
        fn;
    return fn = function executeLiteral(){
        //console.log( 'Executing LITERAL' );
        //console.log( `- ${ fn.name } DEPTH`, depth );
        //console.log( `- ${ fn.name } RESULT`, value );
        return context ?
            { context: void 0, name: void 0, value: value } :
            value;
    };
};

Interpreter.prototype.lookupExpression = function( key, resolve, context, assign ){
    //console.log( 'Composing LOOKUP EXPRESSION', key );
    //console.log( '- DEPTH', this.depth );
    var isLeftFunction = false,
        depth = this.depth,
        lhs = {},
        fn, left;

    switch( key.type ){
        case Identifier$3:
            left = this.identifier( key.name, true, assign );
            isLeftFunction = true;
            break;
        case Literal$1:
            lhs.value = left = key.value;
            break;
        default:
            left = this.recurse( key, true, assign );
            isLeftFunction = true;
            break;
    }

    return fn = function executeLookupExpression( scope, value, lookup ){
        //console.log( 'Executing LOOKUP EXPRESSION' );
        //console.log( `- ${ fn.name } LEFT`, left.name || left );
        var result;
        if( isLeftFunction ){
            lhs = left( lookup, value, scope );
            result = lhs.value;
        } else {
            result = assign( lookup, lhs.value, void 0 );
        }
        // Resolve lookups that are the object of an object-property relationship
        if( resolve ){
            result = assign( scope, result, void 0 );
        }
        //console.log( `- ${ fn.name } LHS`, lhs );
        //console.log( `- ${ fn.name } DEPTH`, depth );
        //console.log( `- ${ fn.name } RESULT`, result  );
        return context ?
            { context: lookup, name: lhs.value, value: result } :
            result;
    };
};

Interpreter.prototype.rangeExpression = function( nl, nr, context, assign ){
    //console.log( 'Composing RANGE EXPRESSION' );
    //console.log( '- DEPTH', this.depth );
    var interpreter = this,
        depth = this.depth,
        left = nl !== null ?
            interpreter.recurse( nl, false, assign ) :
            returnZero,
        right = nr !== null ?
            interpreter.recurse( nr, false, assign ) :
            returnZero,
        fn, index, lhs, middle, result, rhs;

    return fn = function executeRangeExpression( scope, value, lookup ){
        //console.log( 'Executing RANGE EXPRESSION' );
        //console.log( `- ${ fn.name } LEFT`, left.name );
        //console.log( `- ${ fn.name } RIGHT`, right.name );
        lhs = left( scope, value, lookup );
        rhs = right( scope, value, lookup );
        result = [];
        index = 1;
        //console.log( `- ${ fn.name } LHS`, lhs );
        //console.log( `- ${ fn.name } RHS`, rhs );
        //console.log( `- ${ fn.name } DEPTH`, depth );
        result[ 0 ] = lhs;
        if( lhs < rhs ){
            middle = lhs + 1;
            while( middle < rhs ){
                result[ index++ ] = middle++;
            }
        } else if( lhs > rhs ){
            middle = lhs - 1;
            while( middle > rhs ){
                result[ index++ ] = middle--;
            }
        }
        result[ result.length ] = rhs;
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { value: result } :
            result;
    };
};

/**
 * @function
 */
Interpreter.prototype.recurse = function( node, context, assign ){
    //console.log( 'Recursing', node.type, node.range );
    var expression = null;
    this.depth++;

    switch( node.type ){
        case ArrayExpression$1:
            expression = this.arrayExpression( node.elements, context, assign );
            this.isLeftList = node.elements.length > 1;
            break;
        case CallExpression$1:
            expression = this.callExpression( node.callee, node.arguments, context, assign );
            break;
        case BlockExpression$1:
            expression = this.blockExpression( node.body, context, assign );
            break;
        case ExistentialExpression$1:
            expression = this.existentialExpression( node.expression, context, assign );
            break;
        case Identifier$3:
            expression = this.identifier( node.name, context, assign );
            break;
        case Literal$1:
            expression = this.literal( node.value, context );
            break;
        case MemberExpression$1:
            expression = node.computed ?
                this.computedMemberExpression( node.object, node.property, context, assign ) :
                this.staticMemberExpression( node.object, node.property, context, assign );
            break;
        case LookupExpression$1:
            expression = this.lookupExpression( node.key, false, context, assign );
            break;
        case RangeExpression$1:
            expression = this.rangeExpression( node.left, node.right, context, assign );
            break;
        case RootExpression$1:
            expression = this.rootExpression( node.key, context, assign );
            break;
        case SequenceExpression$1:
            expression = this.sequenceExpression( node.expressions, context, assign );
            this.isRightList = true;
            break;
        default:
            this.throwError( 'Unknown node type ' + node.type );
    }
    this.depth--;
    return expression;
};

Interpreter.prototype.rootExpression = function( key, context, assign ){
    //console.log( 'Composing ROOT EXPRESSION' );
    //console.log( '- DEPTH', this.depth );
    var left = this.recurse( key, false, assign ),
        depth = this.depth,
        fn;

    return fn = function executeRootExpression( scope, value, lookup ){
        //console.log( 'Executing ROOT EXPRESSION' );
        //console.log( `- ${ fn.name } LEFT`, left.name || left );
        //console.log( `- ${ fn.name } SCOPE`, scope );
        var lhs, result;
        result = lhs = left( scope, value, lookup );
        //console.log( `- ${ fn.name } LHS`, lhs );
        //console.log( `- ${ fn.name } DEPTH`, depth );
        //console.log( `- ${ fn.name } RESULT`, result  );
        return context ?
            { context: lookup, name: lhs.value, value: result } :
            result;
    };
};

Interpreter.prototype.sequenceExpression = function( expressions, context, assign ){
    var depth = this.depth,
        fn, list;
    //console.log( 'Composing SEQUENCE EXPRESSION' );
    //console.log( '- DEPTH', this.depth );
    if( Array.isArray( expressions ) ){
        list = this.listExpression( expressions, false, assign );

        fn = function executeSequenceExpression( scope, value, lookup ){
            //console.log( 'Executing SEQUENCE EXPRESSION' );
            //console.log( `- ${ fn.name } LIST`, list );
            //console.log( `- ${ fn.name } DEPTH`, depth );
            var result = executeList( list, scope, value, lookup );
            //console.log( `- ${ fn.name } RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    } else {
        list = this.recurse( expressions, false, assign );

        fn = function executeSequenceExpressionWithExpressionRange( scope, value, lookup ){
            //console.log( 'Executing SEQUENCE EXPRESSION' );
            //console.log( `- ${ fn.name } LIST`, list.name );
            //console.log( `- ${ fn.name } DEPTH`, depth );
            var result = list( scope, value, lookup );
            //console.log( `- ${ fn.name } RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    }

    return fn;
};

Interpreter.prototype.staticMemberExpression = function( object, property, context, assign ){
    //console.log( 'Composing STATIC MEMBER EXPRESSION', object.type, property.type );
    //console.log( '- DEPTH', this.depth );
    var interpreter = this,
        depth = this.depth,
        isRightFunction = false,
        isSafe = object.type === ExistentialExpression$1,
        fn, left, rhs, right;

    switch( object.type ){
        case LookupExpression$1:
            left = this.lookupExpression( object.key, true, false, assign );
            break;
        default:
            left = this.recurse( object, false, assign );
            break;
    }

    switch( property.type ){
        case Identifier$3:
            rhs = right = property.name;
            break;
        default:
            right = this.recurse( property, false, assign );
            isRightFunction = true;
    }

    return fn = function executeStaticMemberExpression( scope, value, lookup ){
        //console.log( 'Executing STATIC MEMBER EXPRESSION' );
        //console.log( `- ${ fn.name } LEFT`, left.name );
        //console.log( `- ${ fn.name } RIGHT`, rhs || right.name );
        var lhs = left( scope, value, lookup ),
            index, result;

        if( !isSafe || ( lhs !== void 0 && lhs !== null ) ){
            if( isRightFunction ){
                rhs = right( property.type === RootExpression$1 ? scope : lhs, value, lookup );
            }
            //console.log( `- ${ fn.name } LHS`, lhs );
            //console.log( `- ${ fn.name } RHS`, rhs );
            //console.log( `- ${ fn.name } DEPTH`, depth );
            if( ( interpreter.isLeftList || interpreter.isRightList ) && Array.isArray( lhs ) ){
                index = lhs.length;
                result = new Array( index );
                while( index-- ){
                    result[ index ] = assign( lhs[ index ], rhs, !depth ? value : {} );
                }
            } else {
                result = assign( lhs, rhs, !depth ? value : {} );
            }
        }
        //console.log( `- ${ fn.name } RESULT`, result );
        return context ?
            { context: lhs, name: rhs, value: result } :
            result;
    };
};

Interpreter.prototype.throwError = function( message ){
    var e = new Error( message );
    e.columnNumber = this.column;
    throw e;
    //throw new Error( message );
};

var protocol = new Null();

protocol.init    = '@@transducer/init';
protocol.step    = '@@transducer/step';
protocol.reduced = '@@transducer/reduced';
protocol.result  = '@@transducer/result';
protocol.value   = '@@transducer/value';

/**
 * @class Transducer
 * @extends Null
 * @param {external:Function} xf
 */
function Transducer( xf ){
    this.xf = xf;
}

Transducer.prototype = new Null();

Transducer.prototype.constructor = Transducer;

/**
 * @function Transducer#@@transducer/init
 */
Transducer.prototype[ protocol.init ] = function(){
    return this.xfInit();
};

/**
 * @function Transducer#@@transducer/step
 */
Transducer.prototype[ protocol.step ] = function( value, input ){
    return this.xfStep( value, input );
};

/**
 * @function Transducer#@@transducer/result
 */
Transducer.prototype[ protocol.result ] = function( value ){
    return this.xfResult( value );
};

/**
 * @function
 */
Transducer.prototype.xfInit = function(){
    return this.xf[ protocol.init ]();
};

/**
 * @function
 */
Transducer.prototype.xfStep = function( value, input ){
    return this.xf[ protocol.step ]( value, input );
};

/**
 * @function
 */
Transducer.prototype.xfResult = function( value ){
    return this.xf[ protocol.result ]( value );
};

var lexer = new Lexer();
var builder = new Builder( lexer );
var intrepreter = new Interpreter( builder );
var cache$1 = new Null();

/**
 * @class KeypathExp
 * @extends Transducer
 * @param {external:string} pattern
 * @param {external:string} flags
 */
function KeypathExp( pattern, flags ){
    typeof pattern !== 'string' && ( pattern = '' );
    typeof flags !== 'string' && ( flags = '' );

    var tokens = hasOwnProperty( cache$1, pattern ) ?
        cache$1[ pattern ] :
        cache$1[ pattern ] = lexer.lex( pattern );

    Object.defineProperties( this, {
        'flags': {
            value: flags,
            configurable: false,
            enumerable: true,
            writable: false
        },
        'source': {
            value: pattern,
            configurable: false,
            enumerable: true,
            writable: false
        },
        'getter': {
            value: intrepreter.compile( tokens, false ),
            configurable: false,
            enumerable: false,
            writable: false
        },
        'setter': {
            value: intrepreter.compile( tokens, true ),
            configurable: false,
            enumerable: false,
            writable: false
        }
    } );
}

KeypathExp.prototype = Object.create( Transducer.prototype );

KeypathExp.prototype.constructor = KeypathExp;

/**
 * @function
 */
KeypathExp.prototype.get = function( target, lookup ){
    return this.getter( target, undefined, lookup );
};

/**
 * @function
 */
KeypathExp.prototype.has = function( target, lookup ){
    var result = this.getter( target, undefined, lookup );
    return typeof result !== 'undefined';
};

/**
 * @function KeypathExp#@@transducer/step
 */
KeypathExp.prototype[ protocol.step ] = function( value, input ){
    return this.xfStep( value, this.get( input ) );
};

/**
 * @function
 */
KeypathExp.prototype.set = function( target, value, lookup ){
    return this.setter( target, value, lookup );
};

/**
 * @function
 */
KeypathExp.prototype.toJSON = function(){
    var json = new Null();

    json.flags = this.flags;
    json.source = this.source;

    return json;
};

/**
 * @function
 */
KeypathExp.prototype.toString = function(){
    return this.source;
};

KeypathExp.prototype.tr = function(){
    var kpex = this;
    return function( xf ){
        Transducer.call( kpex, xf );
        return kpex;
    };
};

var cache = new Null();

/**
 * @typedef {external:Function} KeypathCallback
 * @param {*} target The object on which the keypath will be executed
 * @param {*} [value] The optional value that will be set at the keypath
 * @returns {*} The value at the end of the keypath or undefined if the value was being set
 */

/**
 * A template literal tag for keypath processing.
 * @function
 * @param {Array<external:string>} literals
 * @param {external:Array} values
 * @returns {KeypathCallback}
 * @example
 * const object = { foo: { bar: { qux: { baz: 'fuz' } } } },
 *  getBaz = ( target ) => kp`foo.bar.qux.baz`( target );
 *
 * console.log( getBaz( object ) ); // "fuz"
 */
function kp( literals/*, ...values*/ ){
    var index, keypath, kpex, length, values;

    if( arguments.length > 1 ){
        index = 0,
        length = arguments.length - 1;

        values = new Array( length );

        for( ; index < length; index++ ){
            values[ index ] = arguments[ index + 1 ];
        }

        keypath = literals.reduce( function( accumulator, part, index ){
            return accumulator + values[ index - 1 ] + part;
        } );
    } else {
        values = [];
        keypath = literals[ 0 ];
    }

    kpex = keypath in cache ?
        cache[ keypath ] :
        cache[ keypath ] = new KeypathExp( keypath );

    return function( target, value, lookup ){
        return arguments.length > 1 ?
            kpex.set( target, value, lookup ) :
            kpex.get( target, lookup );
    };
}

return kp;

})));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3AtdW1kLmpzIiwic291cmNlcyI6WyJudWxsLmpzIiwiZ3JhbW1hci5qcyIsInRva2VuLmpzIiwibGV4ZXIuanMiLCJzeW50YXguanMiLCJub2RlLmpzIiwia2V5cGF0aC1zeW50YXguanMiLCJoYXMtb3duLXByb3BlcnR5LmpzIiwia2V5cGF0aC1ub2RlLmpzIiwiYnVpbGRlci5qcyIsImludGVycHJldGVyLmpzIiwidHJhbnNkdWNlci5qcyIsImtleXBhdGgtZXhwLmpzIiwia3AuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgXCJjbGVhblwiLCBlbXB0eSBjb250YWluZXIuIEluc3RhbnRpYXRpbmcgdGhpcyBpcyBmYXN0ZXIgdGhhbiBleHBsaWNpdGx5IGNhbGxpbmcgYE9iamVjdC5jcmVhdGUoIG51bGwgKWAuXG4gKiBAY2xhc3MgTnVsbFxuICogQGV4dGVuZHMgZXh0ZXJuYWw6bnVsbFxuICovXG5mdW5jdGlvbiBOdWxsKCl7fVxuTnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5OdWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBOdWxsO1xuXG5leHBvcnQgeyBOdWxsIGFzIGRlZmF1bHQgfTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydCB2YXIgSWRlbnRpZmllciAgICAgID0gJ0lkZW50aWZpZXInO1xuZXhwb3J0IHZhciBOdW1lcmljTGl0ZXJhbCAgPSAnTnVtZXJpYyc7XG5leHBvcnQgdmFyIE51bGxMaXRlcmFsICAgICA9ICdOdWxsJztcbmV4cG9ydCB2YXIgUHVuY3R1YXRvciAgICAgID0gJ1B1bmN0dWF0b3InO1xuZXhwb3J0IHZhciBTdHJpbmdMaXRlcmFsICAgPSAnU3RyaW5nJzsiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBHcmFtbWFyIGZyb20gJy4vZ3JhbW1hcic7XG5cbnZhciB0b2tlbklkID0gMDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+VG9rZW5cbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlIFRoZSB0eXBlIG9mIHRoZSB0b2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgdG9rZW5cbiAqL1xuZnVuY3Rpb24gVG9rZW4oIHR5cGUsIHZhbHVlICl7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBMZXhlcn5Ub2tlbiNpZFxuICAgICAqL1xuICAgIHRoaXMuaWQgPSArK3Rva2VuSWQ7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBMZXhlcn5Ub2tlbiN0eXBlXG4gICAgICovXG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IExleGVyflRva2VuI3ZhbHVlXG4gICAgICovXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuXG5Ub2tlbi5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5Ub2tlbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUb2tlbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xuVG9rZW4ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi50eXBlID0gdGhpcy50eXBlO1xuICAgIGpzb24udmFsdWUgPSB0aGlzLnZhbHVlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRva2VuXG4gKi9cblRva2VuLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFN0cmluZyggdGhpcy52YWx1ZSApO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+SWRlbnRpZmllclxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gSWRlbnRpZmllciggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLklkZW50aWZpZXIsIHZhbHVlICk7XG59XG5cbklkZW50aWZpZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbklkZW50aWZpZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSWRlbnRpZmllcjtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+TnVtZXJpY0xpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE51bWVyaWNMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWwsIHZhbHVlICk7XG59XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdW1lcmljTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+TnVsbExpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE51bGxMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuTnVsbExpdGVyYWwsIHZhbHVlICk7XG59XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdWxsTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+UHVuY3R1YXRvclxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gUHVuY3R1YXRvciggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLlB1bmN0dWF0b3IsIHZhbHVlICk7XG59XG5cblB1bmN0dWF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cblB1bmN0dWF0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUHVuY3R1YXRvcjtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+U3RyaW5nTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RyaW5nTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLlN0cmluZ0xpdGVyYWwsIHZhbHVlICk7XG59XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RyaW5nTGl0ZXJhbDsiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBUb2tlbiBmcm9tICcuL3Rva2VuJztcblxudmFyIGxleGVyUHJvdG90eXBlO1xuXG4vKipcbiAqIEBmdW5jdGlvbiBMZXhlcn5pc0lkZW50aWZpZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBjaGFyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGNoYXJhY3RlciBpcyBhbiBpZGVudGlmaWVyIGNoYXJhY3RlclxuICovXG5mdW5jdGlvbiBpc0lkZW50aWZpZXIoIGNoYXIgKXtcbiAgICByZXR1cm4gJ2EnIDw9IGNoYXIgJiYgY2hhciA8PSAneicgfHwgJ0EnIDw9IGNoYXIgJiYgY2hhciA8PSAnWicgfHwgJ18nID09PSBjaGFyIHx8IGNoYXIgPT09ICckJztcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gTGV4ZXJ+aXNOdW1lcmljXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gY2hhclxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBjaGFyYWN0ZXIgaXMgYSBudW1lcmljIGNoYXJhY3RlclxuICovXG5mdW5jdGlvbiBpc051bWVyaWMoIGNoYXIgKXtcbiAgICByZXR1cm4gJzAnIDw9IGNoYXIgJiYgY2hhciA8PSAnOSc7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIExleGVyfmlzUHVuY3R1YXRvclxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGNoYXJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgY2hhcmFjdGVyIGlzIGEgcHVuY3R1YXRvciBjaGFyYWN0ZXJcbiAqL1xuZnVuY3Rpb24gaXNQdW5jdHVhdG9yKCBjaGFyICl7XG4gICAgcmV0dXJuIGNoYXIgPT09ICcuJyB8fCBjaGFyID09PSAnKCcgfHwgY2hhciA9PT0gJyknIHx8IGNoYXIgPT09ICdbJyB8fCBjaGFyID09PSAnXScgfHwgY2hhciA9PT0gJ3snIHx8IGNoYXIgPT09ICd9JyB8fCBjaGFyID09PSAnLCcgfHwgY2hhciA9PT0gJyUnIHx8IGNoYXIgPT09ICc/JyB8fCBjaGFyID09PSAnOycgfHwgY2hhciA9PT0gJ34nO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBMZXhlcn5pc1F1b3RlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gY2hhclxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBjaGFyYWN0ZXIgaXMgYSBxdW90ZSBjaGFyYWN0ZXJcbiAqL1xuZnVuY3Rpb24gaXNRdW90ZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSAnXCInIHx8IGNoYXIgPT09IFwiJ1wiO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBMZXhlcn5pc1doaXRlc3BhY2VcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBjaGFyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGNoYXJhY3RlciBpcyBhIHdoaXRlc3BhY2UgY2hhcmFjdGVyXG4gKi9cbmZ1bmN0aW9uIGlzV2hpdGVzcGFjZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSAnICcgfHwgY2hhciA9PT0gJ1xccicgfHwgY2hhciA9PT0gJ1xcdCcgfHwgY2hhciA9PT0gJ1xcbicgfHwgY2hhciA9PT0gJ1xcdicgfHwgY2hhciA9PT0gJ1xcdTAwQTAnO1xufVxuXG4vKipcbiAqIEBjbGFzcyBMZXhlclxuICogQGV4dGVuZHMgTnVsbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMZXhlcigpe1xuICAgIHRoaXMuYnVmZmVyID0gJyc7XG59XG5cbmxleGVyUHJvdG90eXBlID0gTGV4ZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxubGV4ZXJQcm90b3R5cGUuY29uc3RydWN0b3IgPSBMZXhlcjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0ZXh0XG4gKi9cbmxleGVyUHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKCB0ZXh0ICl7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0ICcnXG4gICAgICovXG4gICAgdGhpcy5idWZmZXIgPSB0ZXh0O1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtBcnJheTxMZXhlcn5Ub2tlbj59XG4gICAgICovXG4gICAgdGhpcy50b2tlbnMgPSBbXTtcblxuICAgIHZhciBsZW5ndGggPSB0aGlzLmJ1ZmZlci5sZW5ndGgsXG4gICAgICAgIHdvcmQgPSAnJyxcbiAgICAgICAgY2hhciwgdG9rZW4sIHF1b3RlO1xuXG4gICAgd2hpbGUoIHRoaXMuaW5kZXggPCBsZW5ndGggKXtcbiAgICAgICAgY2hhciA9IHRoaXMuYnVmZmVyWyB0aGlzLmluZGV4IF07XG5cbiAgICAgICAgLy8gSWRlbnRpZmllclxuICAgICAgICBpZiggaXNJZGVudGlmaWVyKCBjaGFyICkgKXtcbiAgICAgICAgICAgIHdvcmQgPSB0aGlzLnJlYWQoIGZ1bmN0aW9uKCBjaGFyICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFpc0lkZW50aWZpZXIoIGNoYXIgKSAmJiAhaXNOdW1lcmljKCBjaGFyICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHRva2VuID0gd29yZCA9PT0gJ251bGwnID9cbiAgICAgICAgICAgICAgICBuZXcgVG9rZW4uTnVsbExpdGVyYWwoIHdvcmQgKSA6XG4gICAgICAgICAgICAgICAgbmV3IFRva2VuLklkZW50aWZpZXIoIHdvcmQgKTtcbiAgICAgICAgICAgIHRoaXMudG9rZW5zLnB1c2goIHRva2VuICk7XG5cbiAgICAgICAgLy8gUHVuY3R1YXRvclxuICAgICAgICB9IGVsc2UgaWYoIGlzUHVuY3R1YXRvciggY2hhciApICl7XG4gICAgICAgICAgICB0b2tlbiA9IG5ldyBUb2tlbi5QdW5jdHVhdG9yKCBjaGFyICk7XG4gICAgICAgICAgICB0aGlzLnRva2Vucy5wdXNoKCB0b2tlbiApO1xuXG4gICAgICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgLy8gUXVvdGVkIFN0cmluZ1xuICAgICAgICB9IGVsc2UgaWYoIGlzUXVvdGUoIGNoYXIgKSApe1xuICAgICAgICAgICAgcXVvdGUgPSBjaGFyO1xuXG4gICAgICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgICAgIHdvcmQgPSB0aGlzLnJlYWQoIGZ1bmN0aW9uKCBjaGFyICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoYXIgPT09IHF1b3RlO1xuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB0b2tlbiA9IG5ldyBUb2tlbi5TdHJpbmdMaXRlcmFsKCBxdW90ZSArIHdvcmQgKyBxdW90ZSApO1xuICAgICAgICAgICAgdGhpcy50b2tlbnMucHVzaCggdG9rZW4gKTtcblxuICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgIC8vIE51bWVyaWNcbiAgICAgICAgfSBlbHNlIGlmKCBpc051bWVyaWMoIGNoYXIgKSApe1xuICAgICAgICAgICAgd29yZCA9IHRoaXMucmVhZCggZnVuY3Rpb24oIGNoYXIgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gIWlzTnVtZXJpYyggY2hhciApO1xuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB0b2tlbiA9IG5ldyBUb2tlbi5OdW1lcmljTGl0ZXJhbCggd29yZCApO1xuICAgICAgICAgICAgdGhpcy50b2tlbnMucHVzaCggdG9rZW4gKTtcblxuICAgICAgICAvLyBXaGl0ZXNwYWNlXG4gICAgICAgIH0gZWxzZSBpZiggaXNXaGl0ZXNwYWNlKCBjaGFyICkgKXtcbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICAvLyBFcnJvclxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAnXCInICsgY2hhciArICdcIiBpcyBhbiBpbnZhbGlkIGNoYXJhY3RlcicgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdvcmQgPSAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50b2tlbnM7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpmdW5jdGlvbn0gdW50aWwgQSBjb25kaXRpb24gdGhhdCB3aGVuIG1ldCB3aWxsIHN0b3AgdGhlIHJlYWRpbmcgb2YgdGhlIGJ1ZmZlclxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gVGhlIHBvcnRpb24gb2YgdGhlIGJ1ZmZlciByZWFkXG4gKi9cbmxleGVyUHJvdG90eXBlLnJlYWQgPSBmdW5jdGlvbiggdW50aWwgKXtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4LFxuICAgICAgICBjaGFyO1xuXG4gICAgd2hpbGUoIHRoaXMuaW5kZXggPCB0aGlzLmJ1ZmZlci5sZW5ndGggKXtcbiAgICAgICAgY2hhciA9IHRoaXMuYnVmZmVyWyB0aGlzLmluZGV4IF07XG5cbiAgICAgICAgaWYoIHVudGlsKCBjaGFyICkgKXtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmJ1ZmZlci5zbGljZSggc3RhcnQsIHRoaXMuaW5kZXggKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGxleGVyXG4gKi9cbmxleGVyUHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi5idWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICBqc29uLnRva2VucyA9IHRoaXMudG9rZW5zLm1hcCggZnVuY3Rpb24oIHRva2VuICl7XG4gICAgICAgIHJldHVybiB0b2tlbi50b0pTT04oKTtcbiAgICB9ICk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGV4ZXJcbiAqL1xubGV4ZXJQcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlcjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnQgdmFyIEFycmF5RXhwcmVzc2lvbiAgICAgICA9ICdBcnJheUV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBDYWxsRXhwcmVzc2lvbiAgICAgICAgPSAnQ2FsbEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBFeHByZXNzaW9uU3RhdGVtZW50ICAgPSAnRXhwcmVzc2lvblN0YXRlbWVudCc7XG5leHBvcnQgdmFyIElkZW50aWZpZXIgICAgICAgICAgICA9ICdJZGVudGlmaWVyJztcbmV4cG9ydCB2YXIgTGl0ZXJhbCAgICAgICAgICAgICAgID0gJ0xpdGVyYWwnO1xuZXhwb3J0IHZhciBNZW1iZXJFeHByZXNzaW9uICAgICAgPSAnTWVtYmVyRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIFByb2dyYW0gICAgICAgICAgICAgICA9ICdQcm9ncmFtJztcbmV4cG9ydCB2YXIgU2VxdWVuY2VFeHByZXNzaW9uICAgID0gJ1NlcXVlbmNlRXhwcmVzc2lvbic7IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgU3ludGF4IGZyb20gJy4vc3ludGF4JztcblxudmFyIG5vZGVJZCA9IDAsXG4gICAgbGl0ZXJhbFR5cGVzID0gJ2Jvb2xlYW4gbnVtYmVyIHN0cmluZycuc3BsaXQoICcgJyApO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfk5vZGVcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlIEEgbm9kZSB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOb2RlKCB0eXBlICl7XG5cbiAgICBpZiggdHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ3R5cGUgbXVzdCBiZSBhIHN0cmluZycsIFR5cGVFcnJvciApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gQnVpbGRlcn5Ob2RlI2lkXG4gICAgICovXG4gICAgdGhpcy5pZCA9ICsrbm9kZUlkO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gQnVpbGRlcn5Ob2RlI3R5cGVcbiAgICAgKi9cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xufVxuXG5Ob2RlLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbk5vZGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTm9kZTtcblxuTm9kZS5wcm90b3R5cGUudGhyb3dFcnJvciA9IGZ1bmN0aW9uKCBtZXNzYWdlLCBFcnJvckNsYXNzICl7XG4gICAgdHlwZW9mIEVycm9yQ2xhc3MgPT09ICd1bmRlZmluZWQnICYmICggRXJyb3JDbGFzcyA9IEVycm9yICk7XG4gICAgdGhyb3cgbmV3IEVycm9yQ2xhc3MoIG1lc3NhZ2UgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIG5vZGVcbiAqL1xuTm9kZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnR5cGUgPSB0aGlzLnR5cGU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbm9kZVxuICovXG5Ob2RlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFN0cmluZyggdGhpcy50eXBlICk7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5pZDtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5Ob2RlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZXhwcmVzc2lvblR5cGUgQSBub2RlIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEV4cHJlc3Npb24oIGV4cHJlc3Npb25UeXBlICl7XG4gICAgTm9kZS5jYWxsKCB0aGlzLCBleHByZXNzaW9uVHlwZSApO1xufVxuXG5FeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE5vZGUucHJvdG90eXBlICk7XG5cbkV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5MaXRlcmFsXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOm51bWJlcn0gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBsaXRlcmFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMaXRlcmFsKCB2YWx1ZSwgcmF3ICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguTGl0ZXJhbCApO1xuXG4gICAgaWYoIGxpdGVyYWxUeXBlcy5pbmRleE9mKCB0eXBlb2YgdmFsdWUgKSA9PT0gLTEgJiYgdmFsdWUgIT09IG51bGwgKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAndmFsdWUgbXVzdCBiZSBhIGJvb2xlYW4sIG51bWJlciwgc3RyaW5nLCBvciBudWxsJywgVHlwZUVycm9yICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMucmF3ID0gcmF3O1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cbkxpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMaXRlcmFsO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsaXRlcmFsXG4gKi9cbkxpdGVyYWwucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5yYXcgPSB0aGlzLnJhdztcbiAgICBqc29uLnZhbHVlID0gdGhpcy52YWx1ZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsaXRlcmFsXG4gKi9cbkxpdGVyYWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5yYXc7XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfk1lbWJlckV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IG9iamVjdFxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb258QnVpbGRlcn5JZGVudGlmaWVyfSBwcm9wZXJ0eVxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBjb21wdXRlZD1mYWxzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSwgY29tcHV0ZWQgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5NZW1iZXJFeHByZXNzaW9uICk7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5FeHByZXNzaW9ufEJ1aWxkZXJ+SWRlbnRpZmllcn1cbiAgICAgKi9cbiAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmNvbXB1dGVkID0gY29tcHV0ZWQgfHwgZmFsc2U7XG59XG5cbk1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW1iZXJFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtZW1iZXIgZXhwcmVzc2lvblxuICovXG5NZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ub2JqZWN0ICAgPSB0aGlzLm9iamVjdC50b0pTT04oKTtcbiAgICBqc29uLnByb3BlcnR5ID0gdGhpcy5wcm9wZXJ0eS50b0pTT04oKTtcbiAgICBqc29uLmNvbXB1dGVkID0gdGhpcy5jb21wdXRlZDtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5Qcm9ncmFtXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk5vZGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXk8QnVpbGRlcn5TdGF0ZW1lbnQ+fSBib2R5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQcm9ncmFtKCBib2R5ICl7XG4gICAgTm9kZS5jYWxsKCB0aGlzLCBTeW50YXguUHJvZ3JhbSApO1xuXG4gICAgaWYoICFBcnJheS5pc0FycmF5KCBib2R5ICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2JvZHkgbXVzdCBiZSBhbiBhcnJheScgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpBcnJheTxCdWlsZGVyflN0YXRlbWVudD59XG4gICAgICovXG4gICAgdGhpcy5ib2R5ID0gYm9keSB8fCBbXTtcbiAgICB0aGlzLnNvdXJjZVR5cGUgPSAnc2NyaXB0Jztcbn1cblxuUHJvZ3JhbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBOb2RlLnByb3RvdHlwZSApO1xuXG5Qcm9ncmFtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFByb2dyYW07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHByb2dyYW1cbiAqL1xuUHJvZ3JhbS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmJvZHkgPSB0aGlzLmJvZHkubWFwKCBmdW5jdGlvbiggbm9kZSApe1xuICAgICAgICByZXR1cm4gbm9kZS50b0pTT04oKTtcbiAgICB9ICk7XG4gICAganNvbi5zb3VyY2VUeXBlID0gdGhpcy5zb3VyY2VUeXBlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflN0YXRlbWVudFxuICogQGV4dGVuZHMgQnVpbGRlcn5Ob2RlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gc3RhdGVtZW50VHlwZSBBIG5vZGUgdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RhdGVtZW50KCBzdGF0ZW1lbnRUeXBlICl7XG4gICAgTm9kZS5jYWxsKCB0aGlzLCBzdGF0ZW1lbnRUeXBlICk7XG59XG5cblN0YXRlbWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBOb2RlLnByb3RvdHlwZSApO1xuXG5TdGF0ZW1lbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RhdGVtZW50O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkFycmF5RXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufSBlbGVtZW50cyBBIGxpc3Qgb2YgZXhwcmVzc2lvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFycmF5RXhwcmVzc2lvbiggZWxlbWVudHMgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5BcnJheUV4cHJlc3Npb24gKTtcblxuICAgIC8vaWYoICEoIEFycmF5LmlzQXJyYXkoIGVsZW1lbnRzICkgKSAmJiAhKCBlbGVtZW50cyBpbnN0YW5jZW9mIFJhbmdlRXhwcmVzc2lvbiApICl7XG4gICAgLy8gICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2VsZW1lbnRzIG11c3QgYmUgYSBsaXN0IG9mIGV4cHJlc3Npb25zIG9yIGFuIGluc3RhbmNlIG9mIHJhbmdlIGV4cHJlc3Npb24nICk7XG4gICAgLy99XG5cbiAgICAvKlxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ2VsZW1lbnRzJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiggZWxlbWVudHMgKXtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICB0aGlzWyBpbmRleCBdID0gZWxlbWVudHNbIGluZGV4IF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9ICk7XG4gICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50cztcbn1cblxuQXJyYXlFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkFycmF5RXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBcnJheUV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGFycmF5IGV4cHJlc3Npb25cbiAqL1xuQXJyYXlFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGlmKCBBcnJheS5pc0FycmF5KCB0aGlzLmVsZW1lbnRzICkgKXtcbiAgICAgICAganNvbi5lbGVtZW50cyA9IHRoaXMuZWxlbWVudHMubWFwKCBmdW5jdGlvbiggZWxlbWVudCApe1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudG9KU09OKCk7XG4gICAgICAgIH0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBqc29uLmVsZW1lbnRzID0gdGhpcy5lbGVtZW50cy50b0pTT04oKTtcbiAgICB9XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+Q2FsbEV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IGNhbGxlZVxuICogQHBhcmFtIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fSBhcmdzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDYWxsRXhwcmVzc2lvbiggY2FsbGVlLCBhcmdzICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguQ2FsbEV4cHJlc3Npb24gKTtcblxuICAgIGlmKCAhQXJyYXkuaXNBcnJheSggYXJncyApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdhcmd1bWVudHMgbXVzdCBiZSBhbiBhcnJheScgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5jYWxsZWUgPSBjYWxsZWU7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPn1cbiAgICAgKi9cbiAgICB0aGlzLmFyZ3VtZW50cyA9IGFyZ3M7XG59XG5cbkNhbGxFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkNhbGxFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENhbGxFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjYWxsIGV4cHJlc3Npb25cbiAqL1xuQ2FsbEV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5jYWxsZWUgICAgPSB0aGlzLmNhbGxlZS50b0pTT04oKTtcbiAgICBqc29uLmFyZ3VtZW50cyA9IHRoaXMuYXJndW1lbnRzLm1hcCggZnVuY3Rpb24oIG5vZGUgKXtcbiAgICAgICAgcmV0dXJuIG5vZGUudG9KU09OKCk7XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5NZW1iZXJFeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gb2JqZWN0XG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApe1xuICAgIGlmKCAhKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIEV4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncHJvcGVydHkgbXVzdCBiZSBhbiBleHByZXNzaW9uIHdoZW4gY29tcHV0ZWQgaXMgdHJ1ZScgKTtcbiAgICB9XG5cbiAgICBNZW1iZXJFeHByZXNzaW9uLmNhbGwoIHRoaXMsIG9iamVjdCwgcHJvcGVydHksIHRydWUgKTtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIgQnVpbGRlcn5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24jY29tcHV0ZWQ9dHJ1ZVxuICAgICAqL1xufVxuXG5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5FeHByZXNzaW9uU3RhdGVtZW50XG4gKiBAZXh0ZW5kcyBCdWlsZGVyflN0YXRlbWVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gRXhwcmVzc2lvblN0YXRlbWVudCggZXhwcmVzc2lvbiApe1xuICAgIFN0YXRlbWVudC5jYWxsKCB0aGlzLCBTeW50YXguRXhwcmVzc2lvblN0YXRlbWVudCApO1xuXG4gICAgaWYoICEoIGV4cHJlc3Npb24gaW5zdGFuY2VvZiBFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2FyZ3VtZW50IG11c3QgYmUgYW4gZXhwcmVzc2lvbicgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbn1cblxuRXhwcmVzc2lvblN0YXRlbWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBTdGF0ZW1lbnQucHJvdG90eXBlICk7XG5cbkV4cHJlc3Npb25TdGF0ZW1lbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXhwcmVzc2lvblN0YXRlbWVudDtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZXhwcmVzc2lvbiBzdGF0ZW1lbnRcbiAqL1xuRXhwcmVzc2lvblN0YXRlbWVudC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb24udG9KU09OKCk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+SWRlbnRpZmllclxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgaWRlbnRpZmllclxuICovXG5leHBvcnQgZnVuY3Rpb24gSWRlbnRpZmllciggbmFtZSApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LklkZW50aWZpZXIgKTtcblxuICAgIGlmKCB0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ25hbWUgbXVzdCBiZSBhIHN0cmluZycgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbn1cblxuSWRlbnRpZmllci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5JZGVudGlmaWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IElkZW50aWZpZXI7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGlkZW50aWZpZXJcbiAqL1xuSWRlbnRpZmllci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLm5hbWUgPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBOdWxsTGl0ZXJhbCggcmF3ICl7XG4gICAgaWYoIHJhdyAhPT0gJ251bGwnICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyYXcgaXMgbm90IGEgbnVsbCBsaXRlcmFsJyApO1xuICAgIH1cblxuICAgIExpdGVyYWwuY2FsbCggdGhpcywgbnVsbCwgcmF3ICk7XG59XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExpdGVyYWwucHJvdG90eXBlICk7XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGxMaXRlcmFsO1xuXG5leHBvcnQgZnVuY3Rpb24gTnVtZXJpY0xpdGVyYWwoIHJhdyApe1xuICAgIHZhciB2YWx1ZSA9IHBhcnNlRmxvYXQoIHJhdyApO1xuXG4gICAgaWYoIGlzTmFOKCB2YWx1ZSApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyYXcgaXMgbm90IGEgbnVtZXJpYyBsaXRlcmFsJyApO1xuICAgIH1cblxuICAgIExpdGVyYWwuY2FsbCggdGhpcywgdmFsdWUsIHJhdyApO1xufVxuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBMaXRlcmFsLnByb3RvdHlwZSApO1xuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdW1lcmljTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5TZXF1ZW5jZUV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn0gZXhwcmVzc2lvbnMgVGhlIGV4cHJlc3Npb25zIGluIHRoZSBzZXF1ZW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2VxdWVuY2VFeHByZXNzaW9uKCBleHByZXNzaW9ucyApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LlNlcXVlbmNlRXhwcmVzc2lvbiApO1xuXG4gICAgLy9pZiggISggQXJyYXkuaXNBcnJheSggZXhwcmVzc2lvbnMgKSApICYmICEoIGV4cHJlc3Npb25zIGluc3RhbmNlb2YgUmFuZ2VFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnZXhwcmVzc2lvbnMgbXVzdCBiZSBhIGxpc3Qgb2YgZXhwcmVzc2lvbnMgb3IgYW4gaW5zdGFuY2Ugb2YgcmFuZ2UgZXhwcmVzc2lvbicgKTtcbiAgICAvL31cblxuICAgIC8qXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB0aGlzLCAnZXhwcmVzc2lvbnMnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKCBleHByZXNzaW9ucyApe1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5sZW5ndGggPSBleHByZXNzaW9ucy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHRoaXNbIGluZGV4IF0gPSBleHByZXNzaW9uc1sgaW5kZXggXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0gKTtcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5leHByZXNzaW9ucyA9IGV4cHJlc3Npb25zO1xufVxuXG5TZXF1ZW5jZUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuU2VxdWVuY2VFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNlcXVlbmNlRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgc2VxdWVuY2UgZXhwcmVzc2lvblxuICovXG5TZXF1ZW5jZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIHRoaXMuZXhwcmVzc2lvbnMgKSApe1xuICAgICAgICBqc29uLmV4cHJlc3Npb25zID0gdGhpcy5leHByZXNzaW9ucy5tYXAoIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvbi50b0pTT04oKTtcbiAgICAgICAgfSApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGpzb24uZXhwcmVzc2lvbnMgPSB0aGlzLmV4cHJlc3Npb25zLnRvSlNPTigpO1xuICAgIH1cblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5TdGF0aWNNZW1iZXJFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk1lbWJlckV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBvYmplY3RcbiAqIEBwYXJhbSB7QnVpbGRlcn5JZGVudGlmaWVyfSBwcm9wZXJ0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RhdGljTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApe1xuICAgIC8vaWYoICEoIHByb3BlcnR5IGluc3RhbmNlb2YgSWRlbnRpZmllciApICYmICEoIHByb3BlcnR5IGluc3RhbmNlb2YgTG9va3VwRXhwcmVzc2lvbiApICYmICEoIHByb3BlcnR5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncHJvcGVydHkgbXVzdCBiZSBhbiBpZGVudGlmaWVyLCBldmFsIGV4cHJlc3Npb24sIG9yIGxvb2t1cCBleHByZXNzaW9uIHdoZW4gY29tcHV0ZWQgaXMgZmFsc2UnICk7XG4gICAgLy99XG5cbiAgICBNZW1iZXJFeHByZXNzaW9uLmNhbGwoIHRoaXMsIG9iamVjdCwgcHJvcGVydHksIGZhbHNlICk7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIEJ1aWxkZXJ+U3RhdGljTWVtYmVyRXhwcmVzc2lvbiNjb21wdXRlZD1mYWxzZVxuICAgICAqL1xufVxuXG5TdGF0aWNNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblN0YXRpY01lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RhdGljTWVtYmVyRXhwcmVzc2lvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIFN0cmluZ0xpdGVyYWwoIHJhdyApe1xuICAgIGlmKCByYXdbIDAgXSAhPT0gJ1wiJyAmJiByYXdbIDAgXSAhPT0gXCInXCIgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JhdyBpcyBub3QgYSBzdHJpbmcgbGl0ZXJhbCcgKTtcbiAgICB9XG5cbiAgICB2YXIgdmFsdWUgPSByYXcuc3Vic3RyaW5nKCAxLCByYXcubGVuZ3RoIC0gMSApO1xuXG4gICAgTGl0ZXJhbC5jYWxsKCB0aGlzLCB2YWx1ZSwgcmF3ICk7XG59XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTGl0ZXJhbC5wcm90b3R5cGUgKTtcblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdHJpbmdMaXRlcmFsOyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IHZhciBCbG9ja0V4cHJlc3Npb24gICAgICAgPSAnQmxvY2tFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgRXhpc3RlbnRpYWxFeHByZXNzaW9uID0gJ0V4aXN0ZW50aWFsRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIExvb2t1cEV4cHJlc3Npb24gICAgICA9ICdMb29rdXBFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUmFuZ2VFeHByZXNzaW9uICAgICAgID0gJ1JhbmdlRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIFJvb3RFeHByZXNzaW9uICAgICAgICA9ICdSb290RXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIFNjb3BlRXhwcmVzc2lvbiAgICAgICA9ICdTY29wZUV4cHJlc3Npb24nOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9oYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0geyp9IG9iamVjdFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHByb3BlcnR5XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGhhc093blByb3BlcnR5KCBvYmplY3QsIHByb3BlcnR5ICl7XG4gICAgcmV0dXJuIF9oYXNPd25Qcm9wZXJ0eS5jYWxsKCBvYmplY3QsIHByb3BlcnR5ICk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBDb21wdXRlZE1lbWJlckV4cHJlc3Npb24sIEV4cHJlc3Npb24sIElkZW50aWZpZXIsIE5vZGUsIExpdGVyYWwgfSBmcm9tICcuL25vZGUnO1xuaW1wb3J0ICogYXMgS2V5cGF0aFN5bnRheCBmcm9tICcuL2tleXBhdGgtc3ludGF4JztcbmltcG9ydCBoYXNPd25Qcm9wZXJ0eSBmcm9tICcuL2hhcy1vd24tcHJvcGVydHknXG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+T3BlcmF0b3JFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBleHByZXNzaW9uVHlwZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IG9wZXJhdG9yXG4gKi9cbmZ1bmN0aW9uIE9wZXJhdG9yRXhwcmVzc2lvbiggZXhwcmVzc2lvblR5cGUsIG9wZXJhdG9yICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBleHByZXNzaW9uVHlwZSApO1xuXG4gICAgdGhpcy5vcGVyYXRvciA9IG9wZXJhdG9yO1xufVxuXG5PcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE9wZXJhdG9yRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgb3BlcmF0b3IgZXhwcmVzc2lvblxuICovXG5PcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5vcGVyYXRvciA9IHRoaXMub3BlcmF0b3I7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBCbG9ja0V4cHJlc3Npb24oIGJvZHkgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsICdCbG9ja0V4cHJlc3Npb24nICk7XG5cbiAgICAvKlxuICAgIGlmKCAhKCBleHByZXNzaW9uIGluc3RhbmNlb2YgRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdhcmd1bWVudCBtdXN0IGJlIGFuIGV4cHJlc3Npb24nICk7XG4gICAgfVxuICAgICovXG5cbiAgICB0aGlzLmJvZHkgPSBib2R5O1xufVxuXG5CbG9ja0V4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuQmxvY2tFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJsb2NrRXhwcmVzc2lvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIEV4aXN0ZW50aWFsRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApe1xuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbiwgJz8nICk7XG5cbiAgICB0aGlzLmV4cHJlc3Npb24gPSBleHByZXNzaW9uO1xufVxuXG5FeGlzdGVudGlhbEV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5FeGlzdGVudGlhbEV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXhpc3RlbnRpYWxFeHByZXNzaW9uO1xuXG5FeGlzdGVudGlhbEV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb24udG9KU09OKCk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBMb29rdXBFeHByZXNzaW9uKCBrZXkgKXtcbiAgICBpZiggISgga2V5IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmICEoIGtleSBpbnN0YW5jZW9mIElkZW50aWZpZXIgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBCbG9ja0V4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAna2V5IG11c3QgYmUgYSBsaXRlcmFsLCBpZGVudGlmaWVyLCBvciBldmFsIGV4cHJlc3Npb24nICk7XG4gICAgfVxuXG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbiwgJyUnICk7XG5cbiAgICB0aGlzLmtleSA9IGtleTtcbn1cblxuTG9va3VwRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTG9va3VwRXhwcmVzc2lvbjtcblxuTG9va3VwRXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICsgdGhpcy5rZXk7XG59O1xuXG5Mb29rdXBFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5rZXkgPSB0aGlzLmtleTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5SYW5nZUV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+T3BlcmF0b3JFeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gbGVmdFxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IHJpZ2h0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSYW5nZUV4cHJlc3Npb24oIGxlZnQsIHJpZ2h0ICl7XG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguUmFuZ2VFeHByZXNzaW9uLCAnLi4nICk7XG5cbiAgICBpZiggISggbGVmdCBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiBsZWZ0ICE9PSBudWxsICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsZWZ0IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgbGl0ZXJhbCBvciBudWxsJyApO1xuICAgIH1cblxuICAgIGlmKCAhKCByaWdodCBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiByaWdodCAhPT0gbnVsbCApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncmlnaHQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBsaXRlcmFsIG9yIG51bGwnICk7XG4gICAgfVxuXG4gICAgaWYoIGxlZnQgPT09IG51bGwgJiYgcmlnaHQgPT09IG51bGwgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xlZnQgYW5kIHJpZ2h0IGNhbm5vdCBlcXVhbCBudWxsIGF0IHRoZSBzYW1lIHRpbWUnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5MaXRlcmFsfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiNsZWZ0XG4gICAgICovXG4gICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+TGl0ZXJhbH0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jMFxuICAgICAqL1xuICAgIHRoaXNbIDAgXSA9IHRoaXMubGVmdCA9IGxlZnQ7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uI3JpZ2h0XG4gICAgICovXG4gICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+TGl0ZXJhbH0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jMVxuICAgICAqL1xuICAgIHRoaXNbIDEgXSA9IHRoaXMucmlnaHQgPSByaWdodDtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jbGVuZ3RoPTJcbiAgICAgKi9cbiAgICB0aGlzLmxlbmd0aCA9IDI7XG59XG5cblJhbmdlRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5SYW5nZUV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmFuZ2VFeHByZXNzaW9uO1xuXG5SYW5nZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmxlZnQgPSB0aGlzLmxlZnQgIT09IG51bGwgP1xuICAgICAgICB0aGlzLmxlZnQudG9KU09OKCkgOlxuICAgICAgICB0aGlzLmxlZnQ7XG4gICAganNvbi5yaWdodCA9IHRoaXMucmlnaHQgIT09IG51bGwgP1xuICAgICAgICB0aGlzLnJpZ2h0LnRvSlNPTigpIDpcbiAgICAgICAgdGhpcy5yaWdodDtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMubGVmdC50b1N0cmluZygpICsgdGhpcy5vcGVyYXRvciArIHRoaXMucmlnaHQudG9TdHJpbmcoKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBSZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSwgY2FyZGluYWxpdHkgKXtcbiAgICBDb21wdXRlZE1lbWJlckV4cHJlc3Npb24uY2FsbCggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSApO1xuXG4gICAgaWYoICFoYXNPd25Qcm9wZXJ0eSggQ2FyZGluYWxpdHksIGNhcmRpbmFsaXR5ICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ1Vua25vd24gY2FyZGluYWxpdHkgJyArIGNhcmRpbmFsaXR5ICk7XG4gICAgfVxuXG4gICAgdGhpcy5jYXJkaW5hbGl0eSA9IGNhcmRpbmFsaXR5O1xufVxuXG5SZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBDb21wdXRlZE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblJlbGF0aW9uYWxNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlbGF0aW9uYWxNZW1iZXJFeHByZXNzaW9uO1xuXG5leHBvcnQgZnVuY3Rpb24gUm9vdEV4cHJlc3Npb24oIGtleSApe1xuICAgIGlmKCAhKCBrZXkgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgISgga2V5IGluc3RhbmNlb2YgSWRlbnRpZmllciApICYmICEoIGtleSBpbnN0YW5jZW9mIEJsb2NrRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdrZXkgbXVzdCBiZSBhIGxpdGVyYWwsIGlkZW50aWZpZXIsIG9yIGV2YWwgZXhwcmVzc2lvbicgKTtcbiAgICB9XG5cbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiwgJ34nICk7XG5cbiAgICB0aGlzLmtleSA9IGtleTtcbn1cblxuUm9vdEV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5Sb290RXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSb290RXhwcmVzc2lvbjtcblxuUm9vdEV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciArIHRoaXMua2V5O1xufTtcblxuUm9vdEV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmtleSA9IHRoaXMua2V5O1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gU2NvcGVFeHByZXNzaW9uKCBvcGVyYXRvciwga2V5ICl7XG4gICAgLy9pZiggISgga2V5IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmICEoIGtleSBpbnN0YW5jZW9mIElkZW50aWZpZXIgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBCbG9ja0V4cHJlc3Npb24gKSApe1xuICAgIC8vICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdrZXkgbXVzdCBiZSBhIGxpdGVyYWwsIGlkZW50aWZpZXIsIG9yIGV2YWwgZXhwcmVzc2lvbicgKTtcbiAgICAvL31cblxuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4LlNjb3BlRXhwcmVzc2lvbiwgb3BlcmF0b3IgKTtcblxuICAgIHRoaXMua2V5ID0ga2V5O1xufVxuXG5TY29wZUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5TY29wZUV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2NvcGVFeHByZXNzaW9uO1xuXG5TY29wZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciArIHRoaXMua2V5O1xufTtcblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5rZXkgPSB0aGlzLmtleTtcblxuICAgIHJldHVybiBqc29uO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBHcmFtbWFyIGZyb20gJy4vZ3JhbW1hcic7XG5pbXBvcnQgKiBhcyBOb2RlIGZyb20gJy4vbm9kZSc7XG5pbXBvcnQgKiBhcyBLZXlwYXRoTm9kZSBmcm9tICcuL2tleXBhdGgtbm9kZSc7XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7TGV4ZXJ9IGxleGVyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEJ1aWxkZXIoIGxleGVyICl7XG4gICAgdGhpcy5sZXhlciA9IGxleGVyO1xufVxuXG5CdWlsZGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbkJ1aWxkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVpbGRlcjtcblxuQnVpbGRlci5wcm90b3R5cGUuYXJyYXlFeHByZXNzaW9uID0gZnVuY3Rpb24oIGxpc3QgKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQVJSQVkgRVhQUkVTU0lPTicgKTtcbiAgICB0aGlzLmNvbnN1bWUoICdbJyApO1xuICAgIHJldHVybiBuZXcgTm9kZS5BcnJheUV4cHJlc3Npb24oIGxpc3QgKTtcbn07XG5cbkJ1aWxkZXIucHJvdG90eXBlLmJsb2NrRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCB0ZXJtaW5hdG9yICl7XG4gICAgdmFyIGJsb2NrID0gW10sXG4gICAgICAgIGlzb2xhdGVkID0gZmFsc2U7XG4gICAgLy9jb25zb2xlLmxvZyggJ0JMT0NLJywgdGVybWluYXRvciApO1xuICAgIGlmKCAhdGhpcy5wZWVrKCB0ZXJtaW5hdG9yICkgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gRVhQUkVTU0lPTlMnICk7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGJsb2NrLnVuc2hpZnQoIHRoaXMuY29uc3VtZSgpICk7XG4gICAgICAgIH0gd2hpbGUoICF0aGlzLnBlZWsoIHRlcm1pbmF0b3IgKSApO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWUoIHRlcm1pbmF0b3IgKTtcbiAgICAvKmlmKCB0aGlzLnBlZWsoICd+JyApICl7XG4gICAgICAgIGlzb2xhdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb25zdW1lKCAnficgKTtcbiAgICB9Ki9cbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLkJsb2NrRXhwcmVzc2lvbiggYmxvY2ssIGlzb2xhdGVkICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd8QXJyYXk8QnVpbGRlcn5Ub2tlbj59IGlucHV0XG4gKiBAcmV0dXJucyB7UHJvZ3JhbX0gVGhlIGJ1aWx0IGFic3RyYWN0IHN5bnRheCB0cmVlXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmJ1aWxkID0gZnVuY3Rpb24oIGlucHV0ICl7XG4gICAgaWYoIHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgKXtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudGV4dCA9IGlucHV0O1xuXG4gICAgICAgIGlmKCB0eXBlb2YgdGhpcy5sZXhlciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvciggJ2xleGVyIGlzIG5vdCBkZWZpbmVkJyApO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZW1iZXIge2V4dGVybmFsOkFycmF5PFRva2VuPn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudG9rZW5zID0gdGhpcy5sZXhlci5sZXgoIGlucHV0ICk7XG4gICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBpbnB1dCApICl7XG4gICAgICAgIHRoaXMudG9rZW5zID0gaW5wdXQuc2xpY2UoKTtcbiAgICAgICAgdGhpcy50ZXh0ID0gaW5wdXQuam9pbiggJycgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdpbnZhbGlkIGlucHV0JyApO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCAnQlVJTEQnICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gJywgdGhpcy50ZXh0Lmxlbmd0aCwgJ0NIQVJTJywgdGhpcy50ZXh0ICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gJywgdGhpcy50b2tlbnMubGVuZ3RoLCAnVE9LRU5TJywgdGhpcy50b2tlbnMgKTtcbiAgICB0aGlzLmNvbHVtbiA9IHRoaXMudGV4dC5sZW5ndGg7XG4gICAgdGhpcy5saW5lID0gMTtcblxuICAgIHZhciBwcm9ncmFtID0gdGhpcy5wcm9ncmFtKCk7XG5cbiAgICBpZiggdGhpcy50b2tlbnMubGVuZ3RoICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ1VuZXhwZWN0ZWQgdG9rZW4gJyArIHRoaXMudG9rZW5zWyAwIF0gKyAnIHJlbWFpbmluZycgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvZ3JhbTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7Q2FsbEV4cHJlc3Npb259IFRoZSBjYWxsIGV4cHJlc3Npb24gbm9kZVxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5jYWxsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGFyZ3MgPSB0aGlzLmxpc3QoICcoJyApLFxuICAgICAgICBjYWxsZWU7XG5cbiAgICB0aGlzLmNvbnN1bWUoICcoJyApO1xuXG4gICAgY2FsbGVlID0gdGhpcy5leHByZXNzaW9uKCk7XG5cbiAgICAvL2NvbnNvbGUubG9nKCAnQ0FMTCBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIENBTExFRScsIGNhbGxlZSApO1xuICAgIC8vY29uc29sZS5sb2coICctIEFSR1VNRU5UUycsIGFyZ3MsIGFyZ3MubGVuZ3RoICk7XG4gICAgcmV0dXJuIG5ldyBOb2RlLkNhbGxFeHByZXNzaW9uKCBjYWxsZWUsIGFyZ3MgKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgbmV4dCB0b2tlbiBpbiB0aGUgdG9rZW4gbGlzdC4gSWYgYSBjb21wYXJpc29uIGlzIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzLiBPdGhlcndpc2UgYW4gZXJyb3IgaXMgdGhyb3duLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2V4cGVjdGVkXSBBbiBleHBlY3RlZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcmV0dXJucyB7VG9rZW59IFRoZSBuZXh0IHRva2VuIGluIHRoZSBsaXN0XG4gKiBAdGhyb3dzIHtTeW50YXhFcnJvcn0gSWYgdG9rZW4gZGlkIG5vdCBleGlzdFxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5jb25zdW1lID0gZnVuY3Rpb24oIGV4cGVjdGVkICl7XG4gICAgaWYoICF0aGlzLnRva2Vucy5sZW5ndGggKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnVW5leHBlY3RlZCBlbmQgb2YgZXhwcmVzc2lvbicgKTtcbiAgICB9XG5cbiAgICB2YXIgdG9rZW4gPSB0aGlzLmV4cGVjdCggZXhwZWN0ZWQgKTtcblxuICAgIGlmKCAhdG9rZW4gKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnVW5leHBlY3RlZCB0b2tlbiAnICsgdG9rZW4udmFsdWUgKyAnIGNvbnN1bWVkJyApO1xuICAgIH1cblxuICAgIHJldHVybiB0b2tlbjtcbn07XG5cbkJ1aWxkZXIucHJvdG90eXBlLmV4aXN0ZW50aWFsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb24oKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBFWElTVCBFWFBSRVNTSU9OJywgZXhwcmVzc2lvbiApO1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuRXhpc3RlbnRpYWxFeHByZXNzaW9uKCBleHByZXNzaW9uICk7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgdGhlIG5leHQgdG9rZW4gaW4gdGhlIHRva2VuIGxpc3QuIElmIGNvbXBhcmlzb25zIGFyZSBwcm92aWRlZCwgdGhlIHRva2VuIHdpbGwgb25seSBiZSByZXR1cm5lZCBpZiB0aGUgdmFsdWUgbWF0Y2hlcyBvbmUgb2YgdGhlIGNvbXBhcmlzb25zLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZpcnN0XSBUaGUgZmlyc3QgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtzZWNvbmRdIFRoZSBzZWNvbmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFt0aGlyZF0gVGhlIHRoaXJkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZm91cnRoXSBUaGUgZm91cnRoIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtUb2tlbn0gVGhlIG5leHQgdG9rZW4gaW4gdGhlIGxpc3Qgb3IgYHVuZGVmaW5lZGAgaWYgaXQgZGlkIG5vdCBleGlzdFxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5leHBlY3QgPSBmdW5jdGlvbiggZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApe1xuICAgIHZhciB0b2tlbiA9IHRoaXMucGVlayggZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApO1xuXG4gICAgaWYoIHRva2VuICl7XG4gICAgICAgIHRoaXMudG9rZW5zLnBvcCgpO1xuICAgICAgICB0aGlzLmNvbHVtbiAtPSB0b2tlbi52YWx1ZS5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9XG5cbiAgICByZXR1cm4gdm9pZCAwO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtFeHByZXNzaW9ufSBBbiBleHByZXNzaW9uIG5vZGVcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGV4cHJlc3Npb24gPSBudWxsLFxuICAgICAgICBsaXN0LCBuZXh0LCB0b2tlbjtcblxuICAgIGlmKCB0aGlzLmV4cGVjdCggJzsnICkgKXtcbiAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgIH1cblxuICAgIGlmKCBuZXh0ID0gdGhpcy5wZWVrKCkgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0VYUFJFU1NJT04nLCBuZXh0ICk7XG4gICAgICAgIHN3aXRjaCggbmV4dC50eXBlICl7XG4gICAgICAgICAgICBjYXNlIEdyYW1tYXIuUHVuY3R1YXRvcjpcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5leHBlY3QoICddJyApICl7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QgPSB0aGlzLmxpc3QoICdbJyApO1xuICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy50b2tlbnMubGVuZ3RoID09PSAxICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5hcnJheUV4cHJlc3Npb24oIGxpc3QgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBsaXN0Lmxlbmd0aCA+IDEgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLnNlcXVlbmNlRXhwcmVzc2lvbiggbGlzdCApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IEFycmF5LmlzQXJyYXkoIGxpc3QgKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdFsgMCBdIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggbmV4dC52YWx1ZSA9PT0gJ30nICl7XG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cCggbmV4dCApO1xuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCB0aGlzLmV4cGVjdCggJz8nICkgKXtcbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuZXhpc3RlbnRpYWxFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEdyYW1tYXIuTnVsbExpdGVyYWw6XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubGl0ZXJhbCgpO1xuICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIEdyYW1tYXIuSWRlbnRpZmllclxuICAgICAgICAgICAgLy8gR3JhbW1hci5OdW1lcmljTGl0ZXJhbFxuICAgICAgICAgICAgLy8gR3JhbW1hci5TdHJpbmdMaXRlcmFsXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cCggbmV4dCApO1xuICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgICAgICAvLyBJbXBsaWVkIG1lbWJlciBleHByZXNzaW9uLiBTaG91bGQgb25seSBoYXBwZW4gYWZ0ZXIgYW4gSWRlbnRpZmllci5cbiAgICAgICAgICAgICAgICBpZiggbmV4dCAmJiBuZXh0LnR5cGUgPT09IEdyYW1tYXIuUHVuY3R1YXRvciAmJiAoIG5leHQudmFsdWUgPT09ICcpJyB8fCBuZXh0LnZhbHVlID09PSAnXScgfHwgbmV4dC52YWx1ZSA9PT0gJz8nICkgKXtcbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubWVtYmVyRXhwcmVzc2lvbiggZXhwcmVzc2lvbiwgZmFsc2UgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSggKCB0b2tlbiA9IHRoaXMuZXhwZWN0KCAnKScsICdbJywgJy4nICkgKSApe1xuICAgICAgICAgICAgaWYoIHRva2VuLnZhbHVlID09PSAnKScgKXtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5jYWxsRXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0b2tlbi52YWx1ZSA9PT0gJ1snICl7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubWVtYmVyRXhwcmVzc2lvbiggZXhwcmVzc2lvbiwgdHJ1ZSApO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0b2tlbi52YWx1ZSA9PT0gJy4nICl7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubWVtYmVyRXhwcmVzc2lvbiggZXhwcmVzc2lvbiwgZmFsc2UgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnVW5leHBlY3RlZCB0b2tlbiAnICsgdG9rZW4gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBleHByZXNzaW9uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtFeHByZXNzaW9uU3RhdGVtZW50fSBBbiBleHByZXNzaW9uIHN0YXRlbWVudFxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5leHByZXNzaW9uU3RhdGVtZW50ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvbigpLFxuICAgICAgICBleHByZXNzaW9uU3RhdGVtZW50O1xuICAgIC8vY29uc29sZS5sb2coICdFWFBSRVNTSU9OIFNUQVRFTUVOVCBXSVRIJywgZXhwcmVzc2lvbiApO1xuICAgIGV4cHJlc3Npb25TdGF0ZW1lbnQgPSBuZXcgTm9kZS5FeHByZXNzaW9uU3RhdGVtZW50KCBleHByZXNzaW9uICk7XG5cbiAgICByZXR1cm4gZXhwcmVzc2lvblN0YXRlbWVudDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7SWRlbnRpZmllcn0gQW4gaWRlbnRpZmllclxuICogQHRocm93cyB7U3ludGF4RXJyb3J9IElmIHRoZSB0b2tlbiBpcyBub3QgYW4gaWRlbnRpZmllclxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5pZGVudGlmaWVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgdG9rZW4gPSB0aGlzLmNvbnN1bWUoKTtcblxuICAgIGlmKCAhKCB0b2tlbi50eXBlID09PSBHcmFtbWFyLklkZW50aWZpZXIgKSApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdJZGVudGlmaWVyIGV4cGVjdGVkJyApO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTm9kZS5JZGVudGlmaWVyKCB0b2tlbi52YWx1ZSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0ZXJtaW5hdG9yXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6QXJyYXk8RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufSBUaGUgbGlzdCBvZiBleHByZXNzaW9ucyBvciByYW5nZSBleHByZXNzaW9uXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbiggdGVybWluYXRvciApe1xuICAgIHZhciBsaXN0ID0gW10sXG4gICAgICAgIGlzTnVtZXJpYyA9IGZhbHNlLFxuICAgICAgICBleHByZXNzaW9uLCBuZXh0O1xuICAgIC8vY29uc29sZS5sb2coICdMSVNUJywgdGVybWluYXRvciApO1xuICAgIGlmKCAhdGhpcy5wZWVrKCB0ZXJtaW5hdG9yICkgKXtcbiAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICBpc051bWVyaWMgPSBuZXh0LnR5cGUgPT09IEdyYW1tYXIuTnVtZXJpY0xpdGVyYWw7XG5cbiAgICAgICAgLy8gRXhhbXBsZXM6IFsxLi4zXSwgWzUuLl0sIFsuLjddXG4gICAgICAgIGlmKCAoIGlzTnVtZXJpYyB8fCBuZXh0LnZhbHVlID09PSAnLicgKSAmJiB0aGlzLnBlZWtBdCggMSwgJy4nICkgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIFJBTkdFIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaXNOdW1lcmljID9cbiAgICAgICAgICAgICAgICB0aGlzLmxvb2t1cCggbmV4dCApIDpcbiAgICAgICAgICAgICAgICBudWxsO1xuICAgICAgICAgICAgbGlzdCA9IHRoaXMucmFuZ2VFeHByZXNzaW9uKCBleHByZXNzaW9uICk7XG5cbiAgICAgICAgLy8gRXhhbXBsZXM6IFsxLDIsM10sIFtcImFiY1wiLFwiZGVmXCJdLCBbZm9vLGJhcl0sIFt7Zm9vLmJhcn1dXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBBUlJBWSBPRiBFWFBSRVNTSU9OUycgKTtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXAoIG5leHQgKTtcbiAgICAgICAgICAgICAgICBsaXN0LnVuc2hpZnQoIGV4cHJlc3Npb24gKTtcbiAgICAgICAgICAgIH0gd2hpbGUoIHRoaXMuZXhwZWN0KCAnLCcgKSApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coICctIExJU1QgUkVTVUxUJywgbGlzdCApO1xuICAgIHJldHVybiBsaXN0O1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtMaXRlcmFsfSBUaGUgbGl0ZXJhbCBub2RlXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmxpdGVyYWwgPSBmdW5jdGlvbigpe1xuICAgIHZhciB0b2tlbiA9IHRoaXMuY29uc3VtZSgpLFxuICAgICAgICByYXcgPSB0b2tlbi52YWx1ZSxcbiAgICAgICAgZXhwcmVzc2lvbjtcblxuICAgIHN3aXRjaCggdG9rZW4udHlwZSApe1xuICAgICAgICBjYXNlIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWw6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gbmV3IE5vZGUuTnVtZXJpY0xpdGVyYWwoIHJhdyApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR3JhbW1hci5TdHJpbmdMaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IG5ldyBOb2RlLlN0cmluZ0xpdGVyYWwoIHJhdyApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR3JhbW1hci5OdWxsTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBuZXcgTm9kZS5OdWxsTGl0ZXJhbCggcmF3ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvciggJ0xpdGVyYWwgZXhwZWN0ZWQnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG5CdWlsZGVyLnByb3RvdHlwZS5sb29rdXAgPSBmdW5jdGlvbiggbmV4dCApe1xuICAgIHZhciBleHByZXNzaW9uO1xuICAgIC8vY29uc29sZS5sb2coICdMT09LVVAnLCBuZXh0ICk7XG4gICAgc3dpdGNoKCBuZXh0LnR5cGUgKXtcbiAgICAgICAgY2FzZSBHcmFtbWFyLklkZW50aWZpZXI6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5pZGVudGlmaWVyKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBHcmFtbWFyLk51bWVyaWNMaXRlcmFsOlxuICAgICAgICBjYXNlIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxpdGVyYWwoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEdyYW1tYXIuUHVuY3R1YXRvcjpcbiAgICAgICAgICAgIGlmKCBuZXh0LnZhbHVlID09PSAnfScgKXtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWUoICd9JyApO1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmJsb2NrRXhwcmVzc2lvbiggJ3snICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoICd0b2tlbiBjYW5ub3QgYmUgYSBsb29rdXAnICk7XG4gICAgfVxuXG4gICAgbmV4dCA9IHRoaXMucGVlaygpO1xuXG4gICAgaWYoIG5leHQgJiYgbmV4dC52YWx1ZSA9PT0gJyUnICl7XG4gICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcbiAgICB9XG4gICAgaWYoIG5leHQgJiYgbmV4dC52YWx1ZSA9PT0gJ34nICl7XG4gICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLnJvb3RFeHByZXNzaW9uKCBleHByZXNzaW9uICk7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coICctIExPT0tVUCBSRVNVTFQnLCBleHByZXNzaW9uICk7XG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG5CdWlsZGVyLnByb3RvdHlwZS5sb29rdXBFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSApe1xuICAgIHRoaXMuY29uc3VtZSggJyUnICk7XG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5Mb29rdXBFeHByZXNzaW9uKCBrZXkgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0V4cHJlc3Npb259IHByb3BlcnR5IFRoZSBleHByZXNzaW9uIGFzc2lnbmVkIHRvIHRoZSBwcm9wZXJ0eSBvZiB0aGUgbWVtYmVyIGV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gY29tcHV0ZWQgV2hldGhlciBvciBub3QgdGhlIG1lbWJlciBleHByZXNzaW9uIGlzIGNvbXB1dGVkXG4gKiBAcmV0dXJucyB7TWVtYmVyRXhwcmVzc2lvbn0gVGhlIG1lbWJlciBleHByZXNzaW9uXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLm1lbWJlckV4cHJlc3Npb24gPSBmdW5jdGlvbiggcHJvcGVydHksIGNvbXB1dGVkICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ01FTUJFUicsIHByb3BlcnR5ICk7XG4gICAgdmFyIG9iamVjdCA9IHRoaXMuZXhwcmVzc2lvbigpO1xuICAgIC8vY29uc29sZS5sb2coICdNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBPQkpFQ1QnLCBvYmplY3QgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBQUk9QRVJUWScsIHByb3BlcnR5ICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gQ09NUFVURUQnLCBjb21wdXRlZCApO1xuICAgIHJldHVybiBjb21wdXRlZCA/XG4gICAgICAgIG5ldyBOb2RlLkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApIDpcbiAgICAgICAgbmV3IE5vZGUuU3RhdGljTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApO1xufTtcblxuQnVpbGRlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiggaW5wdXQgKXtcbiAgICB0aGlzLnRva2VucyA9IHRoaXMubGV4ZXIubGV4KCBpbnB1dCApO1xuICAgIHJldHVybiB0aGlzLmJ1aWxkKCB0aGlzLnRva2VucyApO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyB0aGUgbmV4dCB0b2tlbiBpbiB0aGUgdG9rZW4gbGlzdCBfd2l0aG91dCByZW1vdmluZyBpdF8uIElmIGNvbXBhcmlzb25zIGFyZSBwcm92aWRlZCwgdGhlIHRva2VuIHdpbGwgb25seSBiZSByZXR1cm5lZCBpZiB0aGUgdmFsdWUgbWF0Y2hlcyBvbmUgb2YgdGhlIGNvbXBhcmlzb25zLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZpcnN0XSBUaGUgZmlyc3QgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtzZWNvbmRdIFRoZSBzZWNvbmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFt0aGlyZF0gVGhlIHRoaXJkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZm91cnRoXSBUaGUgZm91cnRoIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtMZXhlcn5Ub2tlbn0gVGhlIG5leHQgdG9rZW4gaW4gdGhlIGxpc3Qgb3IgYHVuZGVmaW5lZGAgaWYgaXQgZGlkIG5vdCBleGlzdFxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKXtcbiAgICByZXR1cm4gdGhpcy5wZWVrQXQoIDAsIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKTtcbn07XG5cbi8qKlxuICogUHJvdmlkZXMgdGhlIHRva2VuIGF0IHRoZSByZXF1ZXN0ZWQgcG9zaXRpb24gX3dpdGhvdXQgcmVtb3ZpbmcgaXRfIGZyb20gdGhlIHRva2VuIGxpc3QuIElmIGNvbXBhcmlzb25zIGFyZSBwcm92aWRlZCwgdGhlIHRva2VuIHdpbGwgb25seSBiZSByZXR1cm5lZCBpZiB0aGUgdmFsdWUgbWF0Y2hlcyBvbmUgb2YgdGhlIGNvbXBhcmlzb25zLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gcG9zaXRpb24gVGhlIHBvc2l0aW9uIHdoZXJlIHRoZSB0b2tlbiB3aWxsIGJlIHBlZWtlZFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmaXJzdF0gVGhlIGZpcnN0IGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbc2Vjb25kXSBUaGUgc2Vjb25kIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbdGhpcmRdIFRoZSB0aGlyZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZvdXJ0aF0gVGhlIGZvdXJ0aCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcmV0dXJucyB7TGV4ZXJ+VG9rZW59IFRoZSB0b2tlbiBhdCB0aGUgcmVxdWVzdGVkIHBvc2l0aW9uIG9yIGB1bmRlZmluZWRgIGlmIGl0IGRpZCBub3QgZXhpc3RcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUucGVla0F0ID0gZnVuY3Rpb24oIHBvc2l0aW9uLCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICl7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMudG9rZW5zLmxlbmd0aCxcbiAgICAgICAgaW5kZXgsIHRva2VuLCB2YWx1ZTtcblxuICAgIGlmKCBsZW5ndGggJiYgdHlwZW9mIHBvc2l0aW9uID09PSAnbnVtYmVyJyAmJiBwb3NpdGlvbiA+IC0xICl7XG4gICAgICAgIC8vIENhbGN1bGF0ZSBhIHplcm8tYmFzZWQgaW5kZXggc3RhcnRpbmcgZnJvbSB0aGUgZW5kIG9mIHRoZSBsaXN0XG4gICAgICAgIGluZGV4ID0gbGVuZ3RoIC0gcG9zaXRpb24gLSAxO1xuXG4gICAgICAgIGlmKCBpbmRleCA+IC0xICYmIGluZGV4IDwgbGVuZ3RoICl7XG4gICAgICAgICAgICB0b2tlbiA9IHRoaXMudG9rZW5zWyBpbmRleCBdO1xuICAgICAgICAgICAgdmFsdWUgPSB0b2tlbi52YWx1ZTtcblxuICAgICAgICAgICAgaWYoIHZhbHVlID09PSBmaXJzdCB8fCB2YWx1ZSA9PT0gc2Vjb25kIHx8IHZhbHVlID09PSB0aGlyZCB8fCB2YWx1ZSA9PT0gZm91cnRoIHx8ICggIWZpcnN0ICYmICFzZWNvbmQgJiYgIXRoaXJkICYmICFmb3VydGggKSApe1xuICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2b2lkIDA7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge1Byb2dyYW19IEEgcHJvZ3JhbSBub2RlXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnByb2dyYW0gPSBmdW5jdGlvbigpe1xuICAgIHZhciBib2R5ID0gW107XG4gICAgLy9jb25zb2xlLmxvZyggJ1BST0dSQU0nICk7XG4gICAgd2hpbGUoIHRydWUgKXtcbiAgICAgICAgaWYoIHRoaXMudG9rZW5zLmxlbmd0aCApe1xuICAgICAgICAgICAgYm9keS51bnNoaWZ0KCB0aGlzLmV4cHJlc3Npb25TdGF0ZW1lbnQoKSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBOb2RlLlByb2dyYW0oIGJvZHkgKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkJ1aWxkZXIucHJvdG90eXBlLnJhbmdlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCByaWdodCApe1xuICAgIHZhciBsZWZ0O1xuXG4gICAgdGhpcy5leHBlY3QoICcuJyApO1xuICAgIHRoaXMuZXhwZWN0KCAnLicgKTtcblxuICAgIGxlZnQgPSB0aGlzLnBlZWsoKS50eXBlID09PSBHcmFtbWFyLk51bWVyaWNMaXRlcmFsID9cbiAgICAgICAgbGVmdCA9IHRoaXMubGl0ZXJhbCgpIDpcbiAgICAgICAgbnVsbDtcblxuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuUmFuZ2VFeHByZXNzaW9uKCBsZWZ0LCByaWdodCApO1xufTtcblxuQnVpbGRlci5wcm90b3R5cGUucm9vdEV4cHJlc3Npb24gPSBmdW5jdGlvbigga2V5ICl7XG4gICAgdGhpcy5jb25zdW1lKCAnficgKTtcbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLlJvb3RFeHByZXNzaW9uKCBrZXkgKTtcbn07XG5cbkJ1aWxkZXIucHJvdG90eXBlLnNlcXVlbmNlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBsaXN0ICl7XG4gICAgcmV0dXJuIG5ldyBOb2RlLlNlcXVlbmNlRXhwcmVzc2lvbiggbGlzdCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlXG4gKiBAdGhyb3dzIHtleHRlcm5hbDpTeW50YXhFcnJvcn0gV2hlbiBpdCBleGVjdXRlc1xuICovXG5CdWlsZGVyLnByb3RvdHlwZS50aHJvd0Vycm9yID0gZnVuY3Rpb24oIG1lc3NhZ2UgKXtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoIG1lc3NhZ2UgKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgaGFzT3duUHJvcGVydHkgZnJvbSAnLi9oYXMtb3duLXByb3BlcnR5JztcbmltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBTeW50YXggZnJvbSAnLi9zeW50YXgnO1xuaW1wb3J0ICogYXMgS2V5cGF0aFN5bnRheCBmcm9tICcuL2tleXBhdGgtc3ludGF4JztcblxudmFyIG5vb3AgPSBmdW5jdGlvbigpe30sXG5cbiAgICBjYWNoZSA9IG5ldyBOdWxsKCksXG4gICAgZ2V0dGVyID0gbmV3IE51bGwoKSxcbiAgICBzZXR0ZXIgPSBuZXcgTnVsbCgpO1xuXG5mdW5jdGlvbiBleGVjdXRlTGlzdCggbGlzdCwgc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICB2YXIgaW5kZXggPSBsaXN0Lmxlbmd0aCxcbiAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgIHN3aXRjaCggbGlzdC5sZW5ndGggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gbGlzdFsgMCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gbGlzdFsgMCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgcmVzdWx0WyAxIF0gPSBsaXN0WyAxIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBsaXN0WyAwIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICByZXN1bHRbIDEgXSA9IGxpc3RbIDEgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIHJlc3VsdFsgMiBdID0gbGlzdFsgMiBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gbGlzdFsgMCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgcmVzdWx0WyAxIF0gPSBsaXN0WyAxIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICByZXN1bHRbIDIgXSA9IGxpc3RbIDIgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIHJlc3VsdFsgMyBdID0gbGlzdFsgMyBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGxpc3RbIGluZGV4IF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZ2V0dGVyLnZhbHVlID0gZnVuY3Rpb24oIG9iamVjdCwga2V5ICl7XG4gICAgcmV0dXJuIG9iamVjdFsga2V5IF07XG59O1xuXG5nZXR0ZXIubGlzdCA9IGZ1bmN0aW9uKCBvYmplY3QsIGtleSApe1xuICAgIHZhciBpbmRleCA9IG9iamVjdC5sZW5ndGgsXG4gICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcblxuICAgIHN3aXRjaCggaW5kZXggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBvYmplY3RbIDAgXVsga2V5IF07XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IG9iamVjdFsgMCBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJlc3VsdFsgMSBdID0gb2JqZWN0WyAxIF1bIGtleSBdO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBvYmplY3RbIDAgXVsga2V5IF07XG4gICAgICAgICAgICByZXN1bHRbIDEgXSA9IG9iamVjdFsgMSBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJlc3VsdFsgMiBdID0gb2JqZWN0WyAyIF1bIGtleSBdO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBvYmplY3RbIDAgXVsga2V5IF07XG4gICAgICAgICAgICByZXN1bHRbIDEgXSA9IG9iamVjdFsgMSBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJlc3VsdFsgMiBdID0gb2JqZWN0WyAyIF1bIGtleSBdO1xuICAgICAgICAgICAgcmVzdWx0WyAzIF0gPSBvYmplY3RbIDMgXVsga2V5IF07XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBvYmplY3RbIGluZGV4IF1bIGtleSBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5zZXR0ZXIudmFsdWUgPSBmdW5jdGlvbiggb2JqZWN0LCBrZXksIHZhbHVlICl7XG4gICAgaWYoICFoYXNPd25Qcm9wZXJ0eSggb2JqZWN0LCBrZXkgKSApe1xuICAgICAgICBvYmplY3RbIGtleSBdID0gdmFsdWUgfHwge307XG4gICAgfVxuICAgIHJldHVybiBnZXR0ZXIudmFsdWUoIG9iamVjdCwga2V5ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBJbnRlcnByZXRlcn5yZXR1cm5aZXJvXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSB6ZXJvXG4gKi9cbmZ1bmN0aW9uIHJldHVyblplcm8oKXtcbiAgICByZXR1cm4gMDtcbn1cblxuLyoqXG4gKiBAY2xhc3MgSW50ZXJwcmV0ZXJFcnJvclxuICogQGV4dGVuZHMgZXh0ZXJuYWw6U3ludGF4RXJyb3JcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBtZXNzYWdlXG4gKi9cbmZ1bmN0aW9uIEludGVycHJldGVyRXJyb3IoIG1lc3NhZ2UgKXtcbiAgICBTeW50YXhFcnJvci5jYWxsKCB0aGlzLCBtZXNzYWdlICk7XG59XG5cbkludGVycHJldGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFN5bnRheEVycm9yLnByb3RvdHlwZSApO1xuXG4vKipcbiAqIEBjbGFzcyBJbnRlcnByZXRlclxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtCdWlsZGVyfSBidWlsZGVyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEludGVycHJldGVyKCBidWlsZGVyICl7XG4gICAgaWYoICFhcmd1bWVudHMubGVuZ3RoICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ2J1aWxkZXIgY2Fubm90IGJlIHVuZGVmaW5lZCcsIFR5cGVFcnJvciApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ9IEludGVycHJldGVyI2J1aWxkZXJcbiAgICAgKi9cbiAgICB0aGlzLmJ1aWxkZXIgPSBidWlsZGVyO1xufVxuXG5JbnRlcnByZXRlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJbnRlcnByZXRlcjtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmFycmF5RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBlbGVtZW50cywgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBBUlJBWSBFWFBSRVNTSU9OJywgZWxlbWVudHMubGVuZ3RoICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgZm4sIGxpc3Q7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIGVsZW1lbnRzICkgKXtcbiAgICAgICAgbGlzdCA9IHRoaXMubGlzdEV4cHJlc3Npb24oIGVsZW1lbnRzLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlQXJyYXlFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBBUlJBWSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExJU1RgLCBsaXN0ICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gbGlzdC5sZW5ndGgsXG4gICAgICAgICAgICAgICAga2V5cywgcmVzdWx0O1xuICAgICAgICAgICAgc3dpdGNoKCBpbmRleCApe1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICBrZXlzID0gbGlzdFsgMCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIHNjb3BlLCBrZXlzLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGtleXMgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleXNbIGluZGV4IF0gPSBsaXN0WyBpbmRleCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gYXNzaWduKCBzY29wZSwga2V5c1sgaW5kZXggXSwgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IEtFWVNgLCBrZXlzICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0ID0gdGhpcy5yZWN1cnNlKCBlbGVtZW50cywgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgICAgIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbldpdGhFbGVtZW50UmFuZ2UoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIEFSUkFZIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTElTVGAsIGxpc3QubmFtZSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgIHZhciBrZXlzID0gbGlzdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICBpbmRleCA9IGtleXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICAgICAgICAgIGlmKCBpbmRleCA9PT0gMSApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gYXNzaWduKCBzY29wZSwga2V5c1sgMCBdLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGFzc2lnbiggc2NvcGUsIGtleXNbIGluZGV4IF0sICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZm47XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuYmxvY2tFeHByZXNzaW9uID0gZnVuY3Rpb24oIHRva2VucywgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBCTE9DSycsIHRva2Vucy5qb2luKCAnJyApICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgdGV4dCA9IHRva2Vucy5qb2luKCAnJyApLFxuICAgICAgICBwcm9ncmFtID0gaGFzT3duUHJvcGVydHkoIGNhY2hlLCB0ZXh0ICkgP1xuICAgICAgICAgICAgY2FjaGVbIHRleHQgXSA6XG4gICAgICAgICAgICBjYWNoZVsgdGV4dCBdID0gdGhpcy5idWlsZGVyLmJ1aWxkKCB0b2tlbnMgKSxcbiAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMucmVjdXJzZSggcHJvZ3JhbS5ib2R5WyAwIF0uZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICBmbjtcbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlQmxvY2tFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIEJMT0NLJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gU0NPUEVgLCBzY29wZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gRVhQUkVTU0lPTmAsIGV4cHJlc3Npb24ubmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICB2YXIgcmVzdWx0ID0gZXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IHNjb3BlLCBuYW1lOiB2b2lkIDAsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5jYWxsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBjYWxsZWUsIGFyZ3MsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQ0FMTCBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgaXNTZXR0aW5nID0gYXNzaWduID09PSBzZXR0ZXIudmFsdWUsXG4gICAgICAgIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIGNhbGxlZSwgdHJ1ZSwgYXNzaWduICksXG4gICAgICAgIGxpc3QgPSB0aGlzLmxpc3RFeHByZXNzaW9uKCBhcmdzLCBmYWxzZSwgYXNzaWduICksXG4gICAgICAgIGZuO1xuXG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUNhbGxFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIENBTEwgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IGFyZ3NgLCBhcmdzLmxlbmd0aCApO1xuICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgIHZhbHVlcyA9IGV4ZWN1dGVMaXN0KCBsaXN0LCBzY29wZSwgdmFsdWUsIGxvb2t1cCApLFxuICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEhTYCwgbGhzICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgIHJlc3VsdCA9IGxocy52YWx1ZS5hcHBseSggbGhzLmNvbnRleHQsIHZhbHVlcyApO1xuICAgICAgICBpZiggaXNTZXR0aW5nICYmIHR5cGVvZiBsaHMudmFsdWUgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBpbnRlcnByZXRlci50aHJvd0Vycm9yKCAnY2Fubm90IGNyZWF0ZSBjYWxsIGV4cHJlc3Npb25zJyApO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH06XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZXhwcmVzc2lvblxuICovXG5JbnRlcnByZXRlci5wcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uKCBleHByZXNzaW9uLCBjcmVhdGUgKXtcbiAgICB2YXIgcHJvZ3JhbSA9IGhhc093blByb3BlcnR5KCBjYWNoZSwgZXhwcmVzc2lvbiApID9cbiAgICAgICAgICAgIGNhY2hlWyBleHByZXNzaW9uIF0gOlxuICAgICAgICAgICAgY2FjaGVbIGV4cHJlc3Npb24gXSA9IHRoaXMuYnVpbGRlci5idWlsZCggZXhwcmVzc2lvbiApLFxuICAgICAgICBib2R5ID0gcHJvZ3JhbS5ib2R5LFxuICAgICAgICBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGFzc2lnbiwgZXhwcmVzc2lvbnMsIGZuLCBpbmRleDtcblxuICAgIGlmKCB0eXBlb2YgY3JlYXRlICE9PSAnYm9vbGVhbicgKXtcbiAgICAgICAgY3JlYXRlID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuZGVwdGggPSAtMTtcbiAgICB0aGlzLmlzTGVmdExpc3QgPSBmYWxzZTtcbiAgICB0aGlzLmlzUmlnaHRMaXN0ID0gZmFsc2U7XG4gICAgdGhpcy5hc3NpZ25lciA9IGNyZWF0ZSA/XG4gICAgICAgIHNldHRlciA6XG4gICAgICAgIGdldHRlcjtcblxuICAgIGFzc2lnbiA9IHRoaXMuYXNzaWduZXIudmFsdWU7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICovXG4gICAgaW50ZXJwcmV0ZXIuZXhwcmVzc2lvbiA9IHRoaXMuYnVpbGRlci50ZXh0O1xuICAgIC8vY29uc29sZS5sb2coICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyApO1xuICAgIC8vY29uc29sZS5sb2coICdJbnRlcnByZXRpbmcgJywgZXhwcmVzc2lvbiApO1xuICAgIC8vY29uc29sZS5sb2coICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyApO1xuICAgIC8vY29uc29sZS5sb2coICdQcm9ncmFtJywgcHJvZ3JhbS5yYW5nZSApO1xuXG4gICAgc3dpdGNoKCBib2R5Lmxlbmd0aCApe1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBmbiA9IG5vb3A7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgZm4gPSBpbnRlcnByZXRlci5yZWN1cnNlKCBib2R5WyAwIF0uZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBpbmRleCA9IGJvZHkubGVuZ3RoO1xuICAgICAgICAgICAgZXhwcmVzc2lvbnMgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb25zWyBpbmRleCBdID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggYm9keVsgaW5kZXggXS5leHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVQcm9ncmFtKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgICAgIHZhciBsZW5ndGggPSBleHByZXNzaW9ucy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RWYWx1ZTtcblxuICAgICAgICAgICAgICAgIGZvciggaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xuICAgICAgICAgICAgICAgICAgICBsYXN0VmFsdWUgPSBleHByZXNzaW9uc1sgaW5kZXggXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbGFzdFZhbHVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCAnRk4nLCBmbi5uYW1lICk7XG4gICAgcmV0dXJuIGZuO1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBvYmplY3QsIHByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIENPTVBVVEVEIE1FTUJFUiBFWFBSRVNTSU9OJywgb2JqZWN0LnR5cGUsIHByb3BlcnR5LnR5cGUgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGlzU2FmZSA9IG9iamVjdC50eXBlID09PSBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbixcbiAgICAgICAgbGVmdCA9IHRoaXMucmVjdXJzZSggb2JqZWN0LCBmYWxzZSwgYXNzaWduICksXG4gICAgICAgIHJpZ2h0ID0gdGhpcy5yZWN1cnNlKCBwcm9wZXJ0eSwgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICBmbjtcblxuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQ09NUFVURUQgTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMRUZUIGAsIGxlZnQubmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUklHSFRgLCByaWdodC5uYW1lICk7XG4gICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApLFxuICAgICAgICAgICAgaW5kZXgsIGxlbmd0aCwgcG9zaXRpb24sIHJlc3VsdCwgcmhzO1xuICAgICAgICBpZiggIWlzU2FmZSB8fCAoIGxocyAhPT0gdm9pZCAwICYmIGxocyAhPT0gbnVsbCApICl7XG4gICAgICAgICAgICByaHMgPSByaWdodCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEhTYCwgbGhzICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkhTYCwgcmhzICk7XG4gICAgICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggcmhzICkgKXtcbiAgICAgICAgICAgICAgICBpZiggKCBpbnRlcnByZXRlci5pc0xlZnRMaXN0ICkgJiYgQXJyYXkuaXNBcnJheSggbGhzICkgKXtcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gcmhzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBsaHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBuZXcgQXJyYXkoIGxlbmd0aCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKCBwb3NpdGlvbiA9IDA7IHBvc2l0aW9uIDwgbGVuZ3RoOyBwb3NpdGlvbisrICl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdWyBwb3NpdGlvbiBdID0gYXNzaWduKCBsaHNbIGluZGV4IF0sIHJoc1sgcG9zaXRpb24gXSwgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSByaHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBhc3NpZ24oIGxocywgcmhzWyBpbmRleCBdLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYoICggaW50ZXJwcmV0ZXIuaXNMZWZ0TGlzdCB8fCBpbnRlcnByZXRlci5pc1JpZ2h0TGlzdCApICYmIEFycmF5LmlzQXJyYXkoIGxocyApICl7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBsaHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICAgICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBhc3NpZ24oIGxoc1sgaW5kZXggXSwgcmhzLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIGxocywgcmhzLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxocywgbmFtZTogcmhzLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuZXhpc3RlbnRpYWxFeHByZXNzaW9uID0gZnVuY3Rpb24oIGV4cHJlc3Npb24sIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgRVhJU1RFTlRJQUwgRVhQUkVTU0lPTicsIGV4cHJlc3Npb24udHlwZSApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBleHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICksXG4gICAgICAgIGZuO1xuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVFeGlzdGVudGlhbEV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgRVhJU1RFTlRJQUwgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExFRlRgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgaWYoIHNjb3BlICE9PSB2b2lkIDAgJiYgc2NvcGUgIT09IG51bGwgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGUgKXtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB2b2lkIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5pZGVudGlmaWVyID0gZnVuY3Rpb24oIG5hbWUsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgSURFTlRJRklFUicsIG5hbWUgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBmbjtcbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlSWRlbnRpZmllciggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBJREVOVElGSUVSJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTkFNRWAsIG5hbWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFZBTFVFYCwgdmFsdWUgKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFzc2lnbiggc2NvcGUsIG5hbWUsICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IHNjb3BlLCBuYW1lOiBuYW1lLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUubGlzdEV4cHJlc3Npb24gPSBmdW5jdGlvbiggaXRlbXMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIHZhciBpbmRleCA9IGl0ZW1zLmxlbmd0aCxcbiAgICAgICAgbGlzdCA9IG5ldyBBcnJheSggaW5kZXggKTtcblxuICAgIHN3aXRjaCggaW5kZXggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGxpc3RbIDAgXSA9IHRoaXMubGlzdEV4cHJlc3Npb25FbGVtZW50KCBpdGVtc1sgMCBdLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICBsaXN0WyBpbmRleCBdID0gdGhpcy5saXN0RXhwcmVzc2lvbkVsZW1lbnQoIGl0ZW1zWyBpbmRleCBdLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGlzdDtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5saXN0RXhwcmVzc2lvbkVsZW1lbnQgPSBmdW5jdGlvbiggZWxlbWVudCwgY29udGV4dCwgYXNzaWduICl7XG4gICAgc3dpdGNoKCBlbGVtZW50LnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguTGl0ZXJhbDpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpdGVyYWwoIGVsZW1lbnQudmFsdWUsIGNvbnRleHQgKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb29rdXBFeHByZXNzaW9uKCBlbGVtZW50LmtleSwgZmFsc2UsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yb290RXhwcmVzc2lvbiggZWxlbWVudC5rZXksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguQmxvY2tFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tFeHByZXNzaW9uKCBlbGVtZW50LmJvZHksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnVW5leHBlY3RlZCBsaXN0IGVsZW1lbnQgdHlwZScsIGVsZW1lbnQudHlwZSApO1xuICAgIH1cbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5saXRlcmFsID0gZnVuY3Rpb24oIHZhbHVlLCBjb250ZXh0ICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBMSVRFUkFMJywgdmFsdWUgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBmbjtcbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlTGl0ZXJhbCgpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIExJVEVSQUwnICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCB2YWx1ZSApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IHZvaWQgMCwgbmFtZTogdm9pZCAwLCB2YWx1ZTogdmFsdWUgfSA6XG4gICAgICAgICAgICB2YWx1ZTtcbiAgICB9O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmxvb2t1cEV4cHJlc3Npb24gPSBmdW5jdGlvbigga2V5LCByZXNvbHZlLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIExPT0tVUCBFWFBSRVNTSU9OJywga2V5ICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGlzTGVmdEZ1bmN0aW9uID0gZmFsc2UsXG4gICAgICAgIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgbGhzID0ge30sXG4gICAgICAgIGZuLCBsZWZ0O1xuXG4gICAgc3dpdGNoKCBrZXkudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5JZGVudGlmaWVyOlxuICAgICAgICAgICAgbGVmdCA9IHRoaXMuaWRlbnRpZmllcigga2V5Lm5hbWUsIHRydWUsIGFzc2lnbiApO1xuICAgICAgICAgICAgaXNMZWZ0RnVuY3Rpb24gPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LkxpdGVyYWw6XG4gICAgICAgICAgICBsaHMudmFsdWUgPSBsZWZ0ID0ga2V5LnZhbHVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBrZXksIHRydWUsIGFzc2lnbiApO1xuICAgICAgICAgICAgaXNMZWZ0RnVuY3Rpb24gPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUxvb2t1cEV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgTE9PS1VQIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMRUZUYCwgbGVmdC5uYW1lIHx8IGxlZnQgKTtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYoIGlzTGVmdEZ1bmN0aW9uICl7XG4gICAgICAgICAgICBsaHMgPSBsZWZ0KCBsb29rdXAsIHZhbHVlLCBzY29wZSApO1xuICAgICAgICAgICAgcmVzdWx0ID0gbGhzLnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBsb29rdXAsIGxocy52YWx1ZSwgdm9pZCAwICk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVzb2x2ZSBsb29rdXBzIHRoYXQgYXJlIHRoZSBvYmplY3Qgb2YgYW4gb2JqZWN0LXByb3BlcnR5IHJlbGF0aW9uc2hpcFxuICAgICAgICBpZiggcmVzb2x2ZSApe1xuICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBzY29wZSwgcmVzdWx0LCB2b2lkIDAgKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEhTYCwgbGhzICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogbG9va3VwLCBuYW1lOiBsaHMudmFsdWUsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5yYW5nZUV4cHJlc3Npb24gPSBmdW5jdGlvbiggbmwsIG5yLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFJBTkdFIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBsZWZ0ID0gbmwgIT09IG51bGwgP1xuICAgICAgICAgICAgaW50ZXJwcmV0ZXIucmVjdXJzZSggbmwsIGZhbHNlLCBhc3NpZ24gKSA6XG4gICAgICAgICAgICByZXR1cm5aZXJvLFxuICAgICAgICByaWdodCA9IG5yICE9PSBudWxsID9cbiAgICAgICAgICAgIGludGVycHJldGVyLnJlY3Vyc2UoIG5yLCBmYWxzZSwgYXNzaWduICkgOlxuICAgICAgICAgICAgcmV0dXJuWmVybyxcbiAgICAgICAgZm4sIGluZGV4LCBsaHMsIG1pZGRsZSwgcmVzdWx0LCByaHM7XG5cbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlUmFuZ2VFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFJBTkdFIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMRUZUYCwgbGVmdC5uYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSSUdIVGAsIHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgcmhzID0gcmlnaHQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgICBpbmRleCA9IDE7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSFNgLCBsaHMgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJIU2AsIHJocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICByZXN1bHRbIDAgXSA9IGxocztcbiAgICAgICAgaWYoIGxocyA8IHJocyApe1xuICAgICAgICAgICAgbWlkZGxlID0gbGhzICsgMTtcbiAgICAgICAgICAgIHdoaWxlKCBtaWRkbGUgPCByaHMgKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4KysgXSA9IG1pZGRsZSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYoIGxocyA+IHJocyApe1xuICAgICAgICAgICAgbWlkZGxlID0gbGhzIC0gMTtcbiAgICAgICAgICAgIHdoaWxlKCBtaWRkbGUgPiByaHMgKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4KysgXSA9IG1pZGRsZS0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdFsgcmVzdWx0Lmxlbmd0aCBdID0gcmhzO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuSW50ZXJwcmV0ZXIucHJvdG90eXBlLnJlY3Vyc2UgPSBmdW5jdGlvbiggbm9kZSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ1JlY3Vyc2luZycsIG5vZGUudHlwZSwgbm9kZS5yYW5nZSApO1xuICAgIHZhciBleHByZXNzaW9uID0gbnVsbDtcbiAgICB0aGlzLmRlcHRoKys7XG5cbiAgICBzd2l0Y2goIG5vZGUudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5BcnJheUV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5hcnJheUV4cHJlc3Npb24oIG5vZGUuZWxlbWVudHMsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgdGhpcy5pc0xlZnRMaXN0ID0gbm9kZS5lbGVtZW50cy5sZW5ndGggPiAxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LkNhbGxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuY2FsbEV4cHJlc3Npb24oIG5vZGUuY2FsbGVlLCBub2RlLmFyZ3VtZW50cywgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LkJsb2NrRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmJsb2NrRXhwcmVzc2lvbiggbm9kZS5ib2R5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuZXhpc3RlbnRpYWxFeHByZXNzaW9uKCBub2RlLmV4cHJlc3Npb24sIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LklkZW50aWZpZXI6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5pZGVudGlmaWVyKCBub2RlLm5hbWUsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LkxpdGVyYWw6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5saXRlcmFsKCBub2RlLnZhbHVlLCBjb250ZXh0ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguTWVtYmVyRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBub2RlLmNvbXB1dGVkID9cbiAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggbm9kZS5vYmplY3QsIG5vZGUucHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApIDpcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRpY01lbWJlckV4cHJlc3Npb24oIG5vZGUub2JqZWN0LCBub2RlLnByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cEV4cHJlc3Npb24oIG5vZGUua2V5LCBmYWxzZSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLnJhbmdlRXhwcmVzc2lvbiggbm9kZS5sZWZ0LCBub2RlLnJpZ2h0LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5yb290RXhwcmVzc2lvbiggbm9kZS5rZXksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LlNlcXVlbmNlRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLnNlcXVlbmNlRXhwcmVzc2lvbiggbm9kZS5leHByZXNzaW9ucywgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICB0aGlzLmlzUmlnaHRMaXN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnVW5rbm93biBub2RlIHR5cGUgJyArIG5vZGUudHlwZSApO1xuICAgIH1cbiAgICB0aGlzLmRlcHRoLS07XG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUucm9vdEV4cHJlc3Npb24gPSBmdW5jdGlvbigga2V5LCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFJPT1QgRVhQUkVTU0lPTicgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgbGVmdCA9IHRoaXMucmVjdXJzZSgga2V5LCBmYWxzZSwgYXNzaWduICksXG4gICAgICAgIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgZm47XG5cbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlUm9vdEV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgUk9PVCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEVGVGAsIGxlZnQubmFtZSB8fCBsZWZ0ICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBTQ09QRWAsIHNjb3BlICk7XG4gICAgICAgIHZhciBsaHMsIHJlc3VsdDtcbiAgICAgICAgcmVzdWx0ID0gbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExIU2AsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxvb2t1cCwgbmFtZTogbGhzLnZhbHVlLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuc2VxdWVuY2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIGV4cHJlc3Npb25zLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBmbiwgbGlzdDtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFNFUVVFTkNFIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIGV4cHJlc3Npb25zICkgKXtcbiAgICAgICAgbGlzdCA9IHRoaXMubGlzdEV4cHJlc3Npb24oIGV4cHJlc3Npb25zLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTRVFVRU5DRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExJU1RgLCBsaXN0ICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGV4ZWN1dGVMaXN0KCBsaXN0LCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdCA9IHRoaXMucmVjdXJzZSggZXhwcmVzc2lvbnMsIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgICAgICBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb25XaXRoRXhwcmVzc2lvblJhbmdlKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTRVFVRU5DRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExJU1RgLCBsaXN0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbGlzdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmbjtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5zdGF0aWNNZW1iZXJFeHByZXNzaW9uID0gZnVuY3Rpb24oIG9iamVjdCwgcHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgU1RBVElDIE1FTUJFUiBFWFBSRVNTSU9OJywgb2JqZWN0LnR5cGUsIHByb3BlcnR5LnR5cGUgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGlzUmlnaHRGdW5jdGlvbiA9IGZhbHNlLFxuICAgICAgICBpc1NhZmUgPSBvYmplY3QudHlwZSA9PT0gS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb24sXG4gICAgICAgIGZuLCBsZWZ0LCByaHMsIHJpZ2h0O1xuXG4gICAgc3dpdGNoKCBvYmplY3QudHlwZSApe1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmxvb2t1cEV4cHJlc3Npb24oIG9iamVjdC5rZXksIHRydWUsIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGVmdCA9IHRoaXMucmVjdXJzZSggb2JqZWN0LCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBzd2l0Y2goIHByb3BlcnR5LnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguSWRlbnRpZmllcjpcbiAgICAgICAgICAgIHJocyA9IHJpZ2h0ID0gcHJvcGVydHkubmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmlnaHQgPSB0aGlzLnJlY3Vyc2UoIHByb3BlcnR5LCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgICAgICBpc1JpZ2h0RnVuY3Rpb24gPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFNUQVRJQyBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExFRlRgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJJR0hUYCwgcmhzIHx8IHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICksXG4gICAgICAgICAgICBpbmRleCwgcmVzdWx0O1xuXG4gICAgICAgIGlmKCAhaXNTYWZlIHx8ICggbGhzICE9PSB2b2lkIDAgJiYgbGhzICE9PSBudWxsICkgKXtcbiAgICAgICAgICAgIGlmKCBpc1JpZ2h0RnVuY3Rpb24gKXtcbiAgICAgICAgICAgICAgICByaHMgPSByaWdodCggcHJvcGVydHkudHlwZSA9PT0gS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiA/IHNjb3BlIDogbGhzLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEhTYCwgbGhzICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkhTYCwgcmhzICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgaWYoICggaW50ZXJwcmV0ZXIuaXNMZWZ0TGlzdCB8fCBpbnRlcnByZXRlci5pc1JpZ2h0TGlzdCApICYmIEFycmF5LmlzQXJyYXkoIGxocyApICl7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBsaHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICAgICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBhc3NpZ24oIGxoc1sgaW5kZXggXSwgcmhzLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIGxocywgcmhzLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxocywgbmFtZTogcmhzLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUudGhyb3dFcnJvciA9IGZ1bmN0aW9uKCBtZXNzYWdlICl7XG4gICAgdmFyIGUgPSBuZXcgRXJyb3IoIG1lc3NhZ2UgKTtcbiAgICBlLmNvbHVtbk51bWJlciA9IHRoaXMuY29sdW1uO1xuICAgIHRocm93IGU7XG4gICAgLy90aHJvdyBuZXcgRXJyb3IoIG1lc3NhZ2UgKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuXG5leHBvcnQgdmFyIHByb3RvY29sID0gbmV3IE51bGwoKTtcblxucHJvdG9jb2wuaW5pdCAgICA9ICdAQHRyYW5zZHVjZXIvaW5pdCc7XG5wcm90b2NvbC5zdGVwICAgID0gJ0BAdHJhbnNkdWNlci9zdGVwJztcbnByb3RvY29sLnJlZHVjZWQgPSAnQEB0cmFuc2R1Y2VyL3JlZHVjZWQnO1xucHJvdG9jb2wucmVzdWx0ICA9ICdAQHRyYW5zZHVjZXIvcmVzdWx0JztcbnByb3RvY29sLnZhbHVlICAgPSAnQEB0cmFuc2R1Y2VyL3ZhbHVlJztcblxuLyoqXG4gKiBAY2xhc3MgVHJhbnNkdWNlclxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpGdW5jdGlvbn0geGZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRyYW5zZHVjZXIoIHhmICl7XG4gICAgdGhpcy54ZiA9IHhmO1xufVxuXG5UcmFuc2R1Y2VyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cblRyYW5zZHVjZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVHJhbnNkdWNlcjtcblxuLyoqXG4gKiBAZnVuY3Rpb24gVHJhbnNkdWNlciNAQHRyYW5zZHVjZXIvaW5pdFxuICovXG5UcmFuc2R1Y2VyLnByb3RvdHlwZVsgcHJvdG9jb2wuaW5pdCBdID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy54ZkluaXQoKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIFRyYW5zZHVjZXIjQEB0cmFuc2R1Y2VyL3N0ZXBcbiAqL1xuVHJhbnNkdWNlci5wcm90b3R5cGVbIHByb3RvY29sLnN0ZXAgXSA9IGZ1bmN0aW9uKCB2YWx1ZSwgaW5wdXQgKXtcbiAgICByZXR1cm4gdGhpcy54ZlN0ZXAoIHZhbHVlLCBpbnB1dCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gVHJhbnNkdWNlciNAQHRyYW5zZHVjZXIvcmVzdWx0XG4gKi9cblRyYW5zZHVjZXIucHJvdG90eXBlWyBwcm90b2NvbC5yZXN1bHQgXSA9IGZ1bmN0aW9uKCB2YWx1ZSApe1xuICAgIHJldHVybiB0aGlzLnhmUmVzdWx0KCB2YWx1ZSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuVHJhbnNkdWNlci5wcm90b3R5cGUueGZJbml0ID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy54ZlsgcHJvdG9jb2wuaW5pdCBdKCk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5UcmFuc2R1Y2VyLnByb3RvdHlwZS54ZlN0ZXAgPSBmdW5jdGlvbiggdmFsdWUsIGlucHV0ICl7XG4gICAgcmV0dXJuIHRoaXMueGZbIHByb3RvY29sLnN0ZXAgXSggdmFsdWUsIGlucHV0ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5UcmFuc2R1Y2VyLnByb3RvdHlwZS54ZlJlc3VsdCA9IGZ1bmN0aW9uKCB2YWx1ZSApe1xuICAgIHJldHVybiB0aGlzLnhmWyBwcm90b2NvbC5yZXN1bHQgXSggdmFsdWUgKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0IExleGVyIGZyb20gJy4vbGV4ZXInO1xuaW1wb3J0IEJ1aWxkZXIgZnJvbSAnLi9idWlsZGVyJztcbmltcG9ydCBJbnRlcnByZXRlciBmcm9tICcuL2ludGVycHJldGVyJztcbmltcG9ydCBoYXNPd25Qcm9wZXJ0eSBmcm9tICcuL2hhcy1vd24tcHJvcGVydHknO1xuaW1wb3J0IHsgcHJvdG9jb2wsIFRyYW5zZHVjZXIgfSBmcm9tICcuL3RyYW5zZHVjZXInO1xuXG52YXIgbGV4ZXIgPSBuZXcgTGV4ZXIoKSxcbiAgICBidWlsZGVyID0gbmV3IEJ1aWxkZXIoIGxleGVyICksXG4gICAgaW50cmVwcmV0ZXIgPSBuZXcgSW50ZXJwcmV0ZXIoIGJ1aWxkZXIgKSxcblxuICAgIGNhY2hlID0gbmV3IE51bGwoKTtcblxuLyoqXG4gKiBAY2xhc3MgS2V5cGF0aEV4cFxuICogQGV4dGVuZHMgVHJhbnNkdWNlclxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHBhdHRlcm5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBmbGFnc1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBLZXlwYXRoRXhwKCBwYXR0ZXJuLCBmbGFncyApe1xuICAgIHR5cGVvZiBwYXR0ZXJuICE9PSAnc3RyaW5nJyAmJiAoIHBhdHRlcm4gPSAnJyApO1xuICAgIHR5cGVvZiBmbGFncyAhPT0gJ3N0cmluZycgJiYgKCBmbGFncyA9ICcnICk7XG5cbiAgICB2YXIgdG9rZW5zID0gaGFzT3duUHJvcGVydHkoIGNhY2hlLCBwYXR0ZXJuICkgP1xuICAgICAgICBjYWNoZVsgcGF0dGVybiBdIDpcbiAgICAgICAgY2FjaGVbIHBhdHRlcm4gXSA9IGxleGVyLmxleCggcGF0dGVybiApO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIHRoaXMsIHtcbiAgICAgICAgJ2ZsYWdzJzoge1xuICAgICAgICAgICAgdmFsdWU6IGZsYWdzLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgJ3NvdXJjZSc6IHtcbiAgICAgICAgICAgIHZhbHVlOiBwYXR0ZXJuLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgJ2dldHRlcic6IHtcbiAgICAgICAgICAgIHZhbHVlOiBpbnRyZXByZXRlci5jb21waWxlKCB0b2tlbnMsIGZhbHNlICksXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgJ3NldHRlcic6IHtcbiAgICAgICAgICAgIHZhbHVlOiBpbnRyZXByZXRlci5jb21waWxlKCB0b2tlbnMsIHRydWUgKSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSApO1xufVxuXG5LZXlwYXRoRXhwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRyYW5zZHVjZXIucHJvdG90eXBlICk7XG5cbktleXBhdGhFeHAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gS2V5cGF0aEV4cDtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuS2V5cGF0aEV4cC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oIHRhcmdldCwgbG9va3VwICl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0dGVyKCB0YXJnZXQsIHVuZGVmaW5lZCwgbG9va3VwICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5LZXlwYXRoRXhwLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiggdGFyZ2V0LCBsb29rdXAgKXtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5nZXR0ZXIoIHRhcmdldCwgdW5kZWZpbmVkLCBsb29rdXAgKTtcbiAgICByZXR1cm4gdHlwZW9mIHJlc3VsdCAhPT0gJ3VuZGVmaW5lZCc7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBLZXlwYXRoRXhwI0BAdHJhbnNkdWNlci9zdGVwXG4gKi9cbktleXBhdGhFeHAucHJvdG90eXBlWyBwcm90b2NvbC5zdGVwIF0gPSBmdW5jdGlvbiggdmFsdWUsIGlucHV0ICl7XG4gICAgcmV0dXJuIHRoaXMueGZTdGVwKCB2YWx1ZSwgdGhpcy5nZXQoIGlucHV0ICkgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbktleXBhdGhFeHAucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKCB0YXJnZXQsIHZhbHVlLCBsb29rdXAgKXtcbiAgICByZXR1cm4gdGhpcy5zZXR0ZXIoIHRhcmdldCwgdmFsdWUsIGxvb2t1cCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuS2V5cGF0aEV4cC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLmZsYWdzID0gdGhpcy5mbGFncztcbiAgICBqc29uLnNvdXJjZSA9IHRoaXMuc291cmNlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5LZXlwYXRoRXhwLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlO1xufTtcblxuS2V5cGF0aEV4cC5wcm90b3R5cGUudHIgPSBmdW5jdGlvbigpe1xuICAgIHZhciBrcGV4ID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24oIHhmICl7XG4gICAgICAgIFRyYW5zZHVjZXIuY2FsbCgga3BleCwgeGYgKTtcbiAgICAgICAgcmV0dXJuIGtwZXg7XG4gICAgfTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgS2V5cGF0aEV4cCBmcm9tICcuL2tleXBhdGgtZXhwJztcbmltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5cbnZhciBjYWNoZSA9IG5ldyBOdWxsKCk7XG5cbi8qKlxuICogQHR5cGVkZWYge2V4dGVybmFsOkZ1bmN0aW9ufSBLZXlwYXRoQ2FsbGJhY2tcbiAqIEBwYXJhbSB7Kn0gdGFyZ2V0IFRoZSBvYmplY3Qgb24gd2hpY2ggdGhlIGtleXBhdGggd2lsbCBiZSBleGVjdXRlZFxuICogQHBhcmFtIHsqfSBbdmFsdWVdIFRoZSBvcHRpb25hbCB2YWx1ZSB0aGF0IHdpbGwgYmUgc2V0IGF0IHRoZSBrZXlwYXRoXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHZhbHVlIGF0IHRoZSBlbmQgb2YgdGhlIGtleXBhdGggb3IgdW5kZWZpbmVkIGlmIHRoZSB2YWx1ZSB3YXMgYmVpbmcgc2V0XG4gKi9cblxuLyoqXG4gKiBBIHRlbXBsYXRlIGxpdGVyYWwgdGFnIGZvciBrZXlwYXRoIHByb2Nlc3NpbmcuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXk8ZXh0ZXJuYWw6c3RyaW5nPn0gbGl0ZXJhbHNcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IHZhbHVlc1xuICogQHJldHVybnMge0tleXBhdGhDYWxsYmFja31cbiAqIEBleGFtcGxlXG4gKiBjb25zdCBvYmplY3QgPSB7IGZvbzogeyBiYXI6IHsgcXV4OiB7IGJhejogJ2Z1eicgfSB9IH0gfSxcbiAqICBnZXRCYXogPSAoIHRhcmdldCApID0+IGtwYGZvby5iYXIucXV4LmJhemAoIHRhcmdldCApO1xuICpcbiAqIGNvbnNvbGUubG9nKCBnZXRCYXooIG9iamVjdCApICk7IC8vIFwiZnV6XCJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ga3AoIGxpdGVyYWxzLyosIC4uLnZhbHVlcyovICl7XG4gICAgdmFyIGluZGV4LCBrZXlwYXRoLCBrcGV4LCBsZW5ndGgsIHZhbHVlcztcblxuICAgIGlmKCBhcmd1bWVudHMubGVuZ3RoID4gMSApe1xuICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGggLSAxO1xuXG4gICAgICAgIHZhbHVlcyA9IG5ldyBBcnJheSggbGVuZ3RoICk7XG5cbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgICAgICB2YWx1ZXNbIGluZGV4IF0gPSBhcmd1bWVudHNbIGluZGV4ICsgMSBdO1xuICAgICAgICB9XG5cbiAgICAgICAga2V5cGF0aCA9IGxpdGVyYWxzLnJlZHVjZSggZnVuY3Rpb24oIGFjY3VtdWxhdG9yLCBwYXJ0LCBpbmRleCApe1xuICAgICAgICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yICsgdmFsdWVzWyBpbmRleCAtIDEgXSArIHBhcnQ7XG4gICAgICAgIH0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZXMgPSBbXTtcbiAgICAgICAga2V5cGF0aCA9IGxpdGVyYWxzWyAwIF07XG4gICAgfVxuXG4gICAga3BleCA9IGtleXBhdGggaW4gY2FjaGUgP1xuICAgICAgICBjYWNoZVsga2V5cGF0aCBdIDpcbiAgICAgICAgY2FjaGVbIGtleXBhdGggXSA9IG5ldyBLZXlwYXRoRXhwKCBrZXlwYXRoICk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oIHRhcmdldCwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDEgP1xuICAgICAgICAgICAga3BleC5zZXQoIHRhcmdldCwgdmFsdWUsIGxvb2t1cCApIDpcbiAgICAgICAgICAgIGtwZXguZ2V0KCB0YXJnZXQsIGxvb2t1cCApO1xuICAgIH07XG59Il0sIm5hbWVzIjpbIklkZW50aWZpZXIiLCJOdW1lcmljTGl0ZXJhbCIsIk51bGxMaXRlcmFsIiwiUHVuY3R1YXRvciIsIlN0cmluZ0xpdGVyYWwiLCJHcmFtbWFyLklkZW50aWZpZXIiLCJHcmFtbWFyLk51bWVyaWNMaXRlcmFsIiwiR3JhbW1hci5OdWxsTGl0ZXJhbCIsIkdyYW1tYXIuUHVuY3R1YXRvciIsIkdyYW1tYXIuU3RyaW5nTGl0ZXJhbCIsIlRva2VuLk51bGxMaXRlcmFsIiwiVG9rZW4uSWRlbnRpZmllciIsIlRva2VuLlB1bmN0dWF0b3IiLCJUb2tlbi5TdHJpbmdMaXRlcmFsIiwiVG9rZW4uTnVtZXJpY0xpdGVyYWwiLCJBcnJheUV4cHJlc3Npb24iLCJDYWxsRXhwcmVzc2lvbiIsIkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJMaXRlcmFsIiwiTWVtYmVyRXhwcmVzc2lvbiIsIlByb2dyYW0iLCJTZXF1ZW5jZUV4cHJlc3Npb24iLCJTeW50YXguTGl0ZXJhbCIsIlN5bnRheC5NZW1iZXJFeHByZXNzaW9uIiwiU3ludGF4LlByb2dyYW0iLCJTeW50YXguQXJyYXlFeHByZXNzaW9uIiwiU3ludGF4LkNhbGxFeHByZXNzaW9uIiwiU3ludGF4LkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJTeW50YXguSWRlbnRpZmllciIsIlN5bnRheC5TZXF1ZW5jZUV4cHJlc3Npb24iLCJCbG9ja0V4cHJlc3Npb24iLCJFeGlzdGVudGlhbEV4cHJlc3Npb24iLCJMb29rdXBFeHByZXNzaW9uIiwiUmFuZ2VFeHByZXNzaW9uIiwiUm9vdEV4cHJlc3Npb24iLCJTY29wZUV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguUmFuZ2VFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiIsIk5vZGUuQXJyYXlFeHByZXNzaW9uIiwiS2V5cGF0aE5vZGUuQmxvY2tFeHByZXNzaW9uIiwiTm9kZS5DYWxsRXhwcmVzc2lvbiIsIktleXBhdGhOb2RlLkV4aXN0ZW50aWFsRXhwcmVzc2lvbiIsIk5vZGUuRXhwcmVzc2lvblN0YXRlbWVudCIsIk5vZGUuSWRlbnRpZmllciIsIk5vZGUuTnVtZXJpY0xpdGVyYWwiLCJOb2RlLlN0cmluZ0xpdGVyYWwiLCJOb2RlLk51bGxMaXRlcmFsIiwiS2V5cGF0aE5vZGUuTG9va3VwRXhwcmVzc2lvbiIsIk5vZGUuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIiwiTm9kZS5TdGF0aWNNZW1iZXJFeHByZXNzaW9uIiwiTm9kZS5Qcm9ncmFtIiwiS2V5cGF0aE5vZGUuUmFuZ2VFeHByZXNzaW9uIiwiS2V5cGF0aE5vZGUuUm9vdEV4cHJlc3Npb24iLCJOb2RlLlNlcXVlbmNlRXhwcmVzc2lvbiIsImNhY2hlIiwiS2V5cGF0aFN5bnRheC5CbG9j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LEtBQUssQ0FBQztZQUNGLE1BQU07UUFDVixLQUFLLENBQUM7WUFDRixNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDaEQsTUFBTTtRQUNWLEtBQUssQ0FBQztZQUNGLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUNoRCxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDaEQsTUFBTTtRQUNWLEtBQUssQ0FBQztZQUNGLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUNoRCxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDaEQsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ2hELE1BQU07UUFDVixLQUFLLENBQUM7WUFDRixNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDaEQsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ2hELE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxF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