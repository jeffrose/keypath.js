(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.KeypathTransformer = factory());
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
var cache$1 = new Null();
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
        program = hasOwnProperty( cache$1, text ) ?
            cache$1[ text ] :
            cache$1[ text ] = this.builder.build( tokens ),
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
    var program = hasOwnProperty( cache$1, expression ) ?
            cache$1[ expression ] :
            cache$1[ expression ] = this.builder.build( expression ),
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

var lexer = new Lexer();
var builder = new Builder( lexer );
var intrepreter = new Interpreter( builder );
var cache = new Null();

/**
 * @class KeypathExp
 * @extends Transducer
 * @param {external:string} pattern
 * @param {external:string} flags
 */
function KeypathExp( pattern, flags ){
    typeof pattern !== 'string' && ( pattern = '' );
    typeof flags !== 'string' && ( flags = '' );

    var tokens = hasOwnProperty( cache, pattern ) ?
        cache[ pattern ] :
        cache[ pattern ] = lexer.lex( pattern );

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

KeypathExp.prototype = new Null();

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

var protocol = new Null();

protocol.init    = '@@transducer/init';
protocol.step    = '@@transducer/step';
protocol.reduced = '@@transducer/reduced';
protocol.result  = '@@transducer/result';
protocol.value   = '@@transducer/value';

/**
 * A base implementation of the Transfomer protocol used by Transducers
 * @class Transformer
 * @extends Null
 * @param {external:Function} xf A transformer
 */
function Transformer( xf ){
    this.xf = xf;
}

Transformer.prototype = Transformer.prototype = new Null();

Transformer.prototype.constructor = Transformer;

/**
 * @function Transformer#@@transducer/init
 */
Transformer.prototype[ protocol.init ] = function(){
    return this.xfInit();
};

/**
 * @function Transformer#@@transducer/step
 */
Transformer.prototype[ protocol.step ] = function( value, input ){
    return this.xfStep( value, input );
};

/**
 * @function Transformer#@@transducer/result
 */
Transformer.prototype[ protocol.result ] = function( value ){
    return this.xfResult( value );
};

/**
 * @function
 */
Transformer.prototype.xfInit = function(){
    return this.xf[ protocol.init ]();
};

/**
 * @function
 */
Transformer.prototype.xfStep = function( value, input ){
    return this.xf[ protocol.step ]( value, input );
};

/**
 * @function
 */
Transformer.prototype.xfResult = function( value ){
    return this.xf[ protocol.result ]( value );
};

/**
 * @class KeypathTransformer
 * @extends Transformer
 * @param {external:string} p A keypath pattern
 * @param {external:Function} xf A transformer
 */
function KeypathTransformer( p, xf ){
    Transformer.call( this, xf );
    /**
     * @member {KeypathExp}
     */
    this.kpex = new KeypathExp( p );
}

KeypathTransformer.prototype = Object.create( Transformer.prototype );

KeypathTransformer.prototype.constructor = KeypathTransformer;

KeypathTransformer.prototype[ protocol.step ] = function( value, input ){
    return this.xfStep( value, this.kpex.get( input ) );
};

/**
 * @function
 * @param {external:string} p A keypath pattern
 * @returns {external:Function}
 */
function keypath( p ){
    return function( xf ){
        return new KeypathTransformer( p, xf );
    };
}

return keypath;

})));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VzIjpbIm51bGwuanMiLCJncmFtbWFyLmpzIiwidG9rZW4uanMiLCJsZXhlci5qcyIsInN5bnRheC5qcyIsIm5vZGUuanMiLCJrZXlwYXRoLXN5bnRheC5qcyIsImhhcy1vd24tcHJvcGVydHkuanMiLCJrZXlwYXRoLW5vZGUuanMiLCJidWlsZGVyLmpzIiwiaW50ZXJwcmV0ZXIuanMiLCJleHAuanMiLCJ0cmFuc2Zvcm1lci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBcImNsZWFuXCIsIGVtcHR5IGNvbnRhaW5lci4gSW5zdGFudGlhdGluZyB0aGlzIGlzIGZhc3RlciB0aGFuIGV4cGxpY2l0bHkgY2FsbGluZyBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYC5cbiAqIEBjbGFzcyBOdWxsXG4gKiBAZXh0ZW5kcyBleHRlcm5hbDpudWxsXG4gKi9cbmZ1bmN0aW9uIE51bGwoKXt9XG5OdWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbk51bGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIE51bGw7XG5cbmV4cG9ydCB7IE51bGwgYXMgZGVmYXVsdCB9OyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IHZhciBJZGVudGlmaWVyICAgICAgPSAnSWRlbnRpZmllcic7XG5leHBvcnQgdmFyIE51bWVyaWNMaXRlcmFsICA9ICdOdW1lcmljJztcbmV4cG9ydCB2YXIgTnVsbExpdGVyYWwgICAgID0gJ051bGwnO1xuZXhwb3J0IHZhciBQdW5jdHVhdG9yICAgICAgPSAnUHVuY3R1YXRvcic7XG5leHBvcnQgdmFyIFN0cmluZ0xpdGVyYWwgICA9ICdTdHJpbmcnOyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIEdyYW1tYXIgZnJvbSAnLi9ncmFtbWFyJztcblxudmFyIHRva2VuSWQgPSAwO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5Ub2tlblxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgdGhlIHRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSB0b2tlblxuICovXG5mdW5jdGlvbiBUb2tlbiggdHlwZSwgdmFsdWUgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IExleGVyflRva2VuI2lkXG4gICAgICovXG4gICAgdGhpcy5pZCA9ICsrdG9rZW5JZDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IExleGVyflRva2VuI3R5cGVcbiAgICAgKi9cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gTGV4ZXJ+VG9rZW4jdmFsdWVcbiAgICAgKi9cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cblRva2VuLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cblRva2VuLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRva2VuO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlblxuICovXG5Ub2tlbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnR5cGUgPSB0aGlzLnR5cGU7XG4gICAganNvbi52YWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xuVG9rZW4ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gU3RyaW5nKCB0aGlzLnZhbHVlICk7XG59O1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5JZGVudGlmaWVyXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJZGVudGlmaWVyKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuSWRlbnRpZmllciwgdmFsdWUgKTtcbn1cblxuSWRlbnRpZmllci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuSWRlbnRpZmllci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJZGVudGlmaWVyO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5OdW1lcmljTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTnVtZXJpY0xpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5OdW1lcmljTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bWVyaWNMaXRlcmFsO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5OdWxsTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTnVsbExpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5OdWxsTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuTnVsbExpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGxMaXRlcmFsO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5QdW5jdHVhdG9yXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQdW5jdHVhdG9yKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuUHVuY3R1YXRvciwgdmFsdWUgKTtcbn1cblxuUHVuY3R1YXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuUHVuY3R1YXRvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQdW5jdHVhdG9yO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5TdHJpbmdMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdHJpbmdMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdHJpbmdMaXRlcmFsOyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIFRva2VuIGZyb20gJy4vdG9rZW4nO1xuXG52YXIgbGV4ZXJQcm90b3R5cGU7XG5cbi8qKlxuICogQGZ1bmN0aW9uIExleGVyfmlzSWRlbnRpZmllclxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGNoYXJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgY2hhcmFjdGVyIGlzIGFuIGlkZW50aWZpZXIgY2hhcmFjdGVyXG4gKi9cbmZ1bmN0aW9uIGlzSWRlbnRpZmllciggY2hhciApe1xuICAgIHJldHVybiAnYScgPD0gY2hhciAmJiBjaGFyIDw9ICd6JyB8fCAnQScgPD0gY2hhciAmJiBjaGFyIDw9ICdaJyB8fCAnXycgPT09IGNoYXIgfHwgY2hhciA9PT0gJyQnO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBMZXhlcn5pc051bWVyaWNcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBjaGFyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGNoYXJhY3RlciBpcyBhIG51bWVyaWMgY2hhcmFjdGVyXG4gKi9cbmZ1bmN0aW9uIGlzTnVtZXJpYyggY2hhciApe1xuICAgIHJldHVybiAnMCcgPD0gY2hhciAmJiBjaGFyIDw9ICc5Jztcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gTGV4ZXJ+aXNQdW5jdHVhdG9yXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gY2hhclxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBjaGFyYWN0ZXIgaXMgYSBwdW5jdHVhdG9yIGNoYXJhY3RlclxuICovXG5mdW5jdGlvbiBpc1B1bmN0dWF0b3IoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJy4nIHx8IGNoYXIgPT09ICcoJyB8fCBjaGFyID09PSAnKScgfHwgY2hhciA9PT0gJ1snIHx8IGNoYXIgPT09ICddJyB8fCBjaGFyID09PSAneycgfHwgY2hhciA9PT0gJ30nIHx8IGNoYXIgPT09ICcsJyB8fCBjaGFyID09PSAnJScgfHwgY2hhciA9PT0gJz8nIHx8IGNoYXIgPT09ICc7JyB8fCBjaGFyID09PSAnfic7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIExleGVyfmlzUXVvdGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBjaGFyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGNoYXJhY3RlciBpcyBhIHF1b3RlIGNoYXJhY3RlclxuICovXG5mdW5jdGlvbiBpc1F1b3RlKCBjaGFyICl7XG4gICAgcmV0dXJuIGNoYXIgPT09ICdcIicgfHwgY2hhciA9PT0gXCInXCI7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIExleGVyfmlzV2hpdGVzcGFjZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGNoYXJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgY2hhcmFjdGVyIGlzIGEgd2hpdGVzcGFjZSBjaGFyYWN0ZXJcbiAqL1xuZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKCBjaGFyICl7XG4gICAgcmV0dXJuIGNoYXIgPT09ICcgJyB8fCBjaGFyID09PSAnXFxyJyB8fCBjaGFyID09PSAnXFx0JyB8fCBjaGFyID09PSAnXFxuJyB8fCBjaGFyID09PSAnXFx2JyB8fCBjaGFyID09PSAnXFx1MDBBMCc7XG59XG5cbi8qKlxuICogQGNsYXNzIExleGVyXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIExleGVyKCl7XG4gICAgdGhpcy5idWZmZXIgPSAnJztcbn1cblxubGV4ZXJQcm90b3R5cGUgPSBMZXhlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5sZXhlclByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExleGVyO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHRleHRcbiAqL1xubGV4ZXJQcm90b3R5cGUubGV4ID0gZnVuY3Rpb24oIHRleHQgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJydcbiAgICAgKi9cbiAgICB0aGlzLmJ1ZmZlciA9IHRleHQ7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuaW5kZXggPSAwO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PExleGVyflRva2VuPn1cbiAgICAgKi9cbiAgICB0aGlzLnRva2VucyA9IFtdO1xuXG4gICAgdmFyIGxlbmd0aCA9IHRoaXMuYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgd29yZCA9ICcnLFxuICAgICAgICBjaGFyLCB0b2tlbiwgcXVvdGU7XG5cbiAgICB3aGlsZSggdGhpcy5pbmRleCA8IGxlbmd0aCApe1xuICAgICAgICBjaGFyID0gdGhpcy5idWZmZXJbIHRoaXMuaW5kZXggXTtcblxuICAgICAgICAvLyBJZGVudGlmaWVyXG4gICAgICAgIGlmKCBpc0lkZW50aWZpZXIoIGNoYXIgKSApe1xuICAgICAgICAgICAgd29yZCA9IHRoaXMucmVhZCggZnVuY3Rpb24oIGNoYXIgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gIWlzSWRlbnRpZmllciggY2hhciApICYmICFpc051bWVyaWMoIGNoYXIgKTtcbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgdG9rZW4gPSB3b3JkID09PSAnbnVsbCcgP1xuICAgICAgICAgICAgICAgIG5ldyBUb2tlbi5OdWxsTGl0ZXJhbCggd29yZCApIDpcbiAgICAgICAgICAgICAgICBuZXcgVG9rZW4uSWRlbnRpZmllciggd29yZCApO1xuICAgICAgICAgICAgdGhpcy50b2tlbnMucHVzaCggdG9rZW4gKTtcblxuICAgICAgICAvLyBQdW5jdHVhdG9yXG4gICAgICAgIH0gZWxzZSBpZiggaXNQdW5jdHVhdG9yKCBjaGFyICkgKXtcbiAgICAgICAgICAgIHRva2VuID0gbmV3IFRva2VuLlB1bmN0dWF0b3IoIGNoYXIgKTtcbiAgICAgICAgICAgIHRoaXMudG9rZW5zLnB1c2goIHRva2VuICk7XG5cbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICAvLyBRdW90ZWQgU3RyaW5nXG4gICAgICAgIH0gZWxzZSBpZiggaXNRdW90ZSggY2hhciApICl7XG4gICAgICAgICAgICBxdW90ZSA9IGNoYXI7XG5cbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICAgICAgd29yZCA9IHRoaXMucmVhZCggZnVuY3Rpb24oIGNoYXIgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hhciA9PT0gcXVvdGU7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHRva2VuID0gbmV3IFRva2VuLlN0cmluZ0xpdGVyYWwoIHF1b3RlICsgd29yZCArIHF1b3RlICk7XG4gICAgICAgICAgICB0aGlzLnRva2Vucy5wdXNoKCB0b2tlbiApO1xuXG4gICAgICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgLy8gTnVtZXJpY1xuICAgICAgICB9IGVsc2UgaWYoIGlzTnVtZXJpYyggY2hhciApICl7XG4gICAgICAgICAgICB3b3JkID0gdGhpcy5yZWFkKCBmdW5jdGlvbiggY2hhciApe1xuICAgICAgICAgICAgICAgIHJldHVybiAhaXNOdW1lcmljKCBjaGFyICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHRva2VuID0gbmV3IFRva2VuLk51bWVyaWNMaXRlcmFsKCB3b3JkICk7XG4gICAgICAgICAgICB0aGlzLnRva2Vucy5wdXNoKCB0b2tlbiApO1xuXG4gICAgICAgIC8vIFdoaXRlc3BhY2VcbiAgICAgICAgfSBlbHNlIGlmKCBpc1doaXRlc3BhY2UoIGNoYXIgKSApe1xuICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgIC8vIEVycm9yXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoICdcIicgKyBjaGFyICsgJ1wiIGlzIGFuIGludmFsaWQgY2hhcmFjdGVyJyApO1xuICAgICAgICB9XG5cbiAgICAgICAgd29yZCA9ICcnO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRva2Vucztcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOmZ1bmN0aW9ufSB1bnRpbCBBIGNvbmRpdGlvbiB0aGF0IHdoZW4gbWV0IHdpbGwgc3RvcCB0aGUgcmVhZGluZyBvZiB0aGUgYnVmZmVyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBUaGUgcG9ydGlvbiBvZiB0aGUgYnVmZmVyIHJlYWRcbiAqL1xubGV4ZXJQcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uKCB1bnRpbCApe1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXgsXG4gICAgICAgIGNoYXI7XG5cbiAgICB3aGlsZSggdGhpcy5pbmRleCA8IHRoaXMuYnVmZmVyLmxlbmd0aCApe1xuICAgICAgICBjaGFyID0gdGhpcy5idWZmZXJbIHRoaXMuaW5kZXggXTtcblxuICAgICAgICBpZiggdW50aWwoIGNoYXIgKSApe1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLnNsaWNlKCBzdGFydCwgdGhpcy5pbmRleCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGV4ZXJcbiAqL1xubGV4ZXJQcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLmJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgIGpzb24udG9rZW5zID0gdGhpcy50b2tlbnMubWFwKCBmdW5jdGlvbiggdG9rZW4gKXtcbiAgICAgICAgcmV0dXJuIHRva2VuLnRvSlNPTigpO1xuICAgIH0gKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsZXhlclxuICovXG5sZXhlclByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydCB2YXIgQXJyYXlFeHByZXNzaW9uICAgICAgID0gJ0FycmF5RXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIENhbGxFeHByZXNzaW9uICAgICAgICA9ICdDYWxsRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIEV4cHJlc3Npb25TdGF0ZW1lbnQgICA9ICdFeHByZXNzaW9uU3RhdGVtZW50JztcbmV4cG9ydCB2YXIgSWRlbnRpZmllciAgICAgICAgICAgID0gJ0lkZW50aWZpZXInO1xuZXhwb3J0IHZhciBMaXRlcmFsICAgICAgICAgICAgICAgPSAnTGl0ZXJhbCc7XG5leHBvcnQgdmFyIE1lbWJlckV4cHJlc3Npb24gICAgICA9ICdNZW1iZXJFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUHJvZ3JhbSAgICAgICAgICAgICAgID0gJ1Byb2dyYW0nO1xuZXhwb3J0IHZhciBTZXF1ZW5jZUV4cHJlc3Npb24gICAgPSAnU2VxdWVuY2VFeHByZXNzaW9uJzsiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBTeW50YXggZnJvbSAnLi9zeW50YXgnO1xuXG52YXIgbm9kZUlkID0gMCxcbiAgICBsaXRlcmFsVHlwZXMgPSAnYm9vbGVhbiBudW1iZXIgc3RyaW5nJy5zcGxpdCggJyAnICk7XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+Tm9kZVxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHR5cGUgQSBub2RlIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE5vZGUoIHR5cGUgKXtcblxuICAgIGlmKCB0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycgKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAndHlwZSBtdXN0IGJlIGEgc3RyaW5nJywgVHlwZUVycm9yICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBCdWlsZGVyfk5vZGUjaWRcbiAgICAgKi9cbiAgICB0aGlzLmlkID0gKytub2RlSWQ7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBCdWlsZGVyfk5vZGUjdHlwZVxuICAgICAqL1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG59XG5cbk5vZGUucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuTm9kZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOb2RlO1xuXG5Ob2RlLnByb3RvdHlwZS50aHJvd0Vycm9yID0gZnVuY3Rpb24oIG1lc3NhZ2UsIEVycm9yQ2xhc3MgKXtcbiAgICB0eXBlb2YgRXJyb3JDbGFzcyA9PT0gJ3VuZGVmaW5lZCcgJiYgKCBFcnJvckNsYXNzID0gRXJyb3IgKTtcbiAgICB0aHJvdyBuZXcgRXJyb3JDbGFzcyggbWVzc2FnZSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgbm9kZVxuICovXG5Ob2RlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24udHlwZSA9IHRoaXMudHlwZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBub2RlXG4gKi9cbk5vZGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gU3RyaW5nKCB0aGlzLnR5cGUgKTtcbn07XG5cbk5vZGUucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmlkO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk5vZGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBleHByZXNzaW9uVHlwZSBBIG5vZGUgdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gRXhwcmVzc2lvbiggZXhwcmVzc2lvblR5cGUgKXtcbiAgICBOb2RlLmNhbGwoIHRoaXMsIGV4cHJlc3Npb25UeXBlICk7XG59XG5cbkV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTm9kZS5wcm90b3R5cGUgKTtcblxuRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkxpdGVyYWxcbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6bnVtYmVyfSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIGxpdGVyYWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExpdGVyYWwoIHZhbHVlLCByYXcgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5MaXRlcmFsICk7XG5cbiAgICBpZiggbGl0ZXJhbFR5cGVzLmluZGV4T2YoIHR5cGVvZiB2YWx1ZSApID09PSAtMSAmJiB2YWx1ZSAhPT0gbnVsbCApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICd2YWx1ZSBtdXN0IGJlIGEgYm9vbGVhbiwgbnVtYmVyLCBzdHJpbmcsIG9yIG51bGwnLCBUeXBlRXJyb3IgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5yYXcgPSByYXc7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5MaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExpdGVyYWw7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGxpdGVyYWxcbiAqL1xuTGl0ZXJhbC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLnJhdyA9IHRoaXMucmF3O1xuICAgIGpzb24udmFsdWUgPSB0aGlzLnZhbHVlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGxpdGVyYWxcbiAqL1xuTGl0ZXJhbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnJhdztcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+TWVtYmVyRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gb2JqZWN0XG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbnxCdWlsZGVyfklkZW50aWZpZXJ9IHByb3BlcnR5XG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGNvbXB1dGVkPWZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5LCBjb21wdXRlZCApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4Lk1lbWJlckV4cHJlc3Npb24gKTtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+RXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLm9iamVjdCA9IG9iamVjdDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb258QnVpbGRlcn5JZGVudGlmaWVyfVxuICAgICAqL1xuICAgIHRoaXMucHJvcGVydHkgPSBwcm9wZXJ0eTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuY29tcHV0ZWQgPSBjb21wdXRlZCB8fCBmYWxzZTtcbn1cblxuTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5NZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1lbWJlckV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIG1lbWJlciBleHByZXNzaW9uXG4gKi9cbk1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5vYmplY3QgICA9IHRoaXMub2JqZWN0LnRvSlNPTigpO1xuICAgIGpzb24ucHJvcGVydHkgPSB0aGlzLnByb3BlcnR5LnRvSlNPTigpO1xuICAgIGpzb24uY29tcHV0ZWQgPSB0aGlzLmNvbXB1dGVkO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflByb2dyYW1cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+Tm9kZVxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheTxCdWlsZGVyflN0YXRlbWVudD59IGJvZHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFByb2dyYW0oIGJvZHkgKXtcbiAgICBOb2RlLmNhbGwoIHRoaXMsIFN5bnRheC5Qcm9ncmFtICk7XG5cbiAgICBpZiggIUFycmF5LmlzQXJyYXkoIGJvZHkgKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYm9keSBtdXN0IGJlIGFuIGFycmF5JyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOkFycmF5PEJ1aWxkZXJ+U3RhdGVtZW50Pn1cbiAgICAgKi9cbiAgICB0aGlzLmJvZHkgPSBib2R5IHx8IFtdO1xuICAgIHRoaXMuc291cmNlVHlwZSA9ICdzY3JpcHQnO1xufVxuXG5Qcm9ncmFtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE5vZGUucHJvdG90eXBlICk7XG5cblByb2dyYW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUHJvZ3JhbTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgcHJvZ3JhbVxuICovXG5Qcm9ncmFtLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uYm9keSA9IHRoaXMuYm9keS5tYXAoIGZ1bmN0aW9uKCBub2RlICl7XG4gICAgICAgIHJldHVybiBub2RlLnRvSlNPTigpO1xuICAgIH0gKTtcbiAgICBqc29uLnNvdXJjZVR5cGUgPSB0aGlzLnNvdXJjZVR5cGU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+U3RhdGVtZW50XG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk5vZGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBzdGF0ZW1lbnRUeXBlIEEgbm9kZSB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdGF0ZW1lbnQoIHN0YXRlbWVudFR5cGUgKXtcbiAgICBOb2RlLmNhbGwoIHRoaXMsIHN0YXRlbWVudFR5cGUgKTtcbn1cblxuU3RhdGVtZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE5vZGUucHJvdG90eXBlICk7XG5cblN0YXRlbWVudC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdGF0ZW1lbnQ7XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+QXJyYXlFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259IGVsZW1lbnRzIEEgbGlzdCBvZiBleHByZXNzaW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gQXJyYXlFeHByZXNzaW9uKCBlbGVtZW50cyApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LkFycmF5RXhwcmVzc2lvbiApO1xuXG4gICAgLy9pZiggISggQXJyYXkuaXNBcnJheSggZWxlbWVudHMgKSApICYmICEoIGVsZW1lbnRzIGluc3RhbmNlb2YgUmFuZ2VFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnZWxlbWVudHMgbXVzdCBiZSBhIGxpc3Qgb2YgZXhwcmVzc2lvbnMgb3IgYW4gaW5zdGFuY2Ugb2YgcmFuZ2UgZXhwcmVzc2lvbicgKTtcbiAgICAvL31cblxuICAgIC8qXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB0aGlzLCAnZWxlbWVudHMnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKCBlbGVtZW50cyApe1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5sZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHRoaXNbIGluZGV4IF0gPSBlbGVtZW50c1sgaW5kZXggXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0gKTtcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5lbGVtZW50cyA9IGVsZW1lbnRzO1xufVxuXG5BcnJheUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuQXJyYXlFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFycmF5RXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgYXJyYXkgZXhwcmVzc2lvblxuICovXG5BcnJheUV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIHRoaXMuZWxlbWVudHMgKSApe1xuICAgICAgICBqc29uLmVsZW1lbnRzID0gdGhpcy5lbGVtZW50cy5tYXAoIGZ1bmN0aW9uKCBlbGVtZW50ICl7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC50b0pTT04oKTtcbiAgICAgICAgfSApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGpzb24uZWxlbWVudHMgPSB0aGlzLmVsZW1lbnRzLnRvSlNPTigpO1xuICAgIH1cblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5DYWxsRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gY2FsbGVlXG4gKiBAcGFyYW0ge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj59IGFyZ3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENhbGxFeHByZXNzaW9uKCBjYWxsZWUsIGFyZ3MgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5DYWxsRXhwcmVzc2lvbiApO1xuXG4gICAgaWYoICFBcnJheS5pc0FycmF5KCBhcmdzICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2FyZ3VtZW50cyBtdXN0IGJlIGFuIGFycmF5JyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+RXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLmNhbGxlZSA9IGNhbGxlZTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fVxuICAgICAqL1xuICAgIHRoaXMuYXJndW1lbnRzID0gYXJncztcbn1cblxuQ2FsbEV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuQ2FsbEV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2FsbEV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGNhbGwgZXhwcmVzc2lvblxuICovXG5DYWxsRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmNhbGxlZSAgICA9IHRoaXMuY2FsbGVlLnRvSlNPTigpO1xuICAgIGpzb24uYXJndW1lbnRzID0gdGhpcy5hcmd1bWVudHMubWFwKCBmdW5jdGlvbiggbm9kZSApe1xuICAgICAgICByZXR1cm4gbm9kZS50b0pTT04oKTtcbiAgICB9ICk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+Q29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk1lbWJlckV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBvYmplY3RcbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBwcm9wZXJ0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICl7XG4gICAgaWYoICEoIHByb3BlcnR5IGluc3RhbmNlb2YgRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdwcm9wZXJ0eSBtdXN0IGJlIGFuIGV4cHJlc3Npb24gd2hlbiBjb21wdXRlZCBpcyB0cnVlJyApO1xuICAgIH1cblxuICAgIE1lbWJlckV4cHJlc3Npb24uY2FsbCggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSwgdHJ1ZSApO1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciBCdWlsZGVyfkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiNjb21wdXRlZD10cnVlXG4gICAgICovXG59XG5cbkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkV4cHJlc3Npb25TdGF0ZW1lbnRcbiAqIEBleHRlbmRzIEJ1aWxkZXJ+U3RhdGVtZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFeHByZXNzaW9uU3RhdGVtZW50KCBleHByZXNzaW9uICl7XG4gICAgU3RhdGVtZW50LmNhbGwoIHRoaXMsIFN5bnRheC5FeHByZXNzaW9uU3RhdGVtZW50ICk7XG5cbiAgICBpZiggISggZXhwcmVzc2lvbiBpbnN0YW5jZW9mIEV4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYXJndW1lbnQgbXVzdCBiZSBhbiBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+RXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLmV4cHJlc3Npb24gPSBleHByZXNzaW9uO1xufVxuXG5FeHByZXNzaW9uU3RhdGVtZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFN0YXRlbWVudC5wcm90b3R5cGUgKTtcblxuRXhwcmVzc2lvblN0YXRlbWVudC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFeHByZXNzaW9uU3RhdGVtZW50O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBleHByZXNzaW9uIHN0YXRlbWVudFxuICovXG5FeHByZXNzaW9uU3RhdGVtZW50LnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvbi50b0pTT04oKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5JZGVudGlmaWVyXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBpZGVudGlmaWVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJZGVudGlmaWVyKCBuYW1lICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguSWRlbnRpZmllciApO1xuXG4gICAgaWYoIHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJyApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbmFtZSBtdXN0IGJlIGEgc3RyaW5nJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xufVxuXG5JZGVudGlmaWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbklkZW50aWZpZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSWRlbnRpZmllcjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgaWRlbnRpZmllclxuICovXG5JZGVudGlmaWVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ubmFtZSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIE51bGxMaXRlcmFsKCByYXcgKXtcbiAgICBpZiggcmF3ICE9PSAnbnVsbCcgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JhdyBpcyBub3QgYSBudWxsIGxpdGVyYWwnICk7XG4gICAgfVxuXG4gICAgTGl0ZXJhbC5jYWxsKCB0aGlzLCBudWxsLCByYXcgKTtcbn1cblxuTnVsbExpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTGl0ZXJhbC5wcm90b3R5cGUgKTtcblxuTnVsbExpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVsbExpdGVyYWw7XG5cbmV4cG9ydCBmdW5jdGlvbiBOdW1lcmljTGl0ZXJhbCggcmF3ICl7XG4gICAgdmFyIHZhbHVlID0gcGFyc2VGbG9hdCggcmF3ICk7XG5cbiAgICBpZiggaXNOYU4oIHZhbHVlICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JhdyBpcyBub3QgYSBudW1lcmljIGxpdGVyYWwnICk7XG4gICAgfVxuXG4gICAgTGl0ZXJhbC5jYWxsKCB0aGlzLCB2YWx1ZSwgcmF3ICk7XG59XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExpdGVyYWwucHJvdG90eXBlICk7XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bWVyaWNMaXRlcmFsO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflNlcXVlbmNlRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufSBleHByZXNzaW9ucyBUaGUgZXhwcmVzc2lvbnMgaW4gdGhlIHNlcXVlbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXF1ZW5jZUV4cHJlc3Npb24oIGV4cHJlc3Npb25zICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguU2VxdWVuY2VFeHByZXNzaW9uICk7XG5cbiAgICAvL2lmKCAhKCBBcnJheS5pc0FycmF5KCBleHByZXNzaW9ucyApICkgJiYgISggZXhwcmVzc2lvbnMgaW5zdGFuY2VvZiBSYW5nZUV4cHJlc3Npb24gKSApe1xuICAgIC8vICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdleHByZXNzaW9ucyBtdXN0IGJlIGEgbGlzdCBvZiBleHByZXNzaW9ucyBvciBhbiBpbnN0YW5jZSBvZiByYW5nZSBleHByZXNzaW9uJyApO1xuICAgIC8vfVxuXG4gICAgLypcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdleHByZXNzaW9ucycsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oIGV4cHJlc3Npb25zICl7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmxlbmd0aCA9IGV4cHJlc3Npb25zLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgdGhpc1sgaW5kZXggXSA9IGV4cHJlc3Npb25zWyBpbmRleCBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSApO1xuICAgICovXG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLmV4cHJlc3Npb25zID0gZXhwcmVzc2lvbnM7XG59XG5cblNlcXVlbmNlRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5TZXF1ZW5jZUV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2VxdWVuY2VFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzZXF1ZW5jZSBleHByZXNzaW9uXG4gKi9cblNlcXVlbmNlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBpZiggQXJyYXkuaXNBcnJheSggdGhpcy5leHByZXNzaW9ucyApICl7XG4gICAgICAgIGpzb24uZXhwcmVzc2lvbnMgPSB0aGlzLmV4cHJlc3Npb25zLm1hcCggZnVuY3Rpb24oIGV4cHJlc3Npb24gKXtcbiAgICAgICAgICAgIHJldHVybiBleHByZXNzaW9uLnRvSlNPTigpO1xuICAgICAgICB9ICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAganNvbi5leHByZXNzaW9ucyA9IHRoaXMuZXhwcmVzc2lvbnMudG9KU09OKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflN0YXRpY01lbWJlckV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+TWVtYmVyRXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IG9iamVjdFxuICogQHBhcmFtIHtCdWlsZGVyfklkZW50aWZpZXJ9IHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICl7XG4gICAgLy9pZiggISggcHJvcGVydHkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISggcHJvcGVydHkgaW5zdGFuY2VvZiBMb29rdXBFeHByZXNzaW9uICkgJiYgISggcHJvcGVydHkgaW5zdGFuY2VvZiBCbG9ja0V4cHJlc3Npb24gKSApe1xuICAgIC8vICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdwcm9wZXJ0eSBtdXN0IGJlIGFuIGlkZW50aWZpZXIsIGV2YWwgZXhwcmVzc2lvbiwgb3IgbG9va3VwIGV4cHJlc3Npb24gd2hlbiBjb21wdXRlZCBpcyBmYWxzZScgKTtcbiAgICAvL31cblxuICAgIE1lbWJlckV4cHJlc3Npb24uY2FsbCggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSwgZmFsc2UgKTtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIgQnVpbGRlcn5TdGF0aWNNZW1iZXJFeHByZXNzaW9uI2NvbXB1dGVkPWZhbHNlXG4gICAgICovXG59XG5cblN0YXRpY01lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuU3RhdGljTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdGF0aWNNZW1iZXJFeHByZXNzaW9uO1xuXG5leHBvcnQgZnVuY3Rpb24gU3RyaW5nTGl0ZXJhbCggcmF3ICl7XG4gICAgaWYoIHJhd1sgMCBdICE9PSAnXCInICYmIHJhd1sgMCBdICE9PSBcIidcIiApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncmF3IGlzIG5vdCBhIHN0cmluZyBsaXRlcmFsJyApO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IHJhdy5zdWJzdHJpbmcoIDEsIHJhdy5sZW5ndGggLSAxICk7XG5cbiAgICBMaXRlcmFsLmNhbGwoIHRoaXMsIHZhbHVlLCByYXcgKTtcbn1cblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBMaXRlcmFsLnByb3RvdHlwZSApO1xuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0cmluZ0xpdGVyYWw7IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnQgdmFyIEJsb2NrRXhwcmVzc2lvbiAgICAgICA9ICdCbG9ja0V4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBFeGlzdGVudGlhbEV4cHJlc3Npb24gPSAnRXhpc3RlbnRpYWxFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgTG9va3VwRXhwcmVzc2lvbiAgICAgID0gJ0xvb2t1cEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBSYW5nZUV4cHJlc3Npb24gICAgICAgPSAnUmFuZ2VFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUm9vdEV4cHJlc3Npb24gICAgICAgID0gJ1Jvb3RFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgU2NvcGVFeHByZXNzaW9uICAgICAgID0gJ1Njb3BlRXhwcmVzc2lvbic7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2hhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7Kn0gb2JqZWN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gcHJvcGVydHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaGFzT3duUHJvcGVydHkoIG9iamVjdCwgcHJvcGVydHkgKXtcbiAgICByZXR1cm4gX2hhc093blByb3BlcnR5LmNhbGwoIG9iamVjdCwgcHJvcGVydHkgKTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiwgRXhwcmVzc2lvbiwgSWRlbnRpZmllciwgTm9kZSwgTGl0ZXJhbCB9IGZyb20gJy4vbm9kZSc7XG5pbXBvcnQgKiBhcyBLZXlwYXRoU3ludGF4IGZyb20gJy4va2V5cGF0aC1zeW50YXgnO1xuaW1wb3J0IGhhc093blByb3BlcnR5IGZyb20gJy4vaGFzLW93bi1wcm9wZXJ0eSdcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5PcGVyYXRvckV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGV4cHJlc3Npb25UeXBlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gb3BlcmF0b3JcbiAqL1xuZnVuY3Rpb24gT3BlcmF0b3JFeHByZXNzaW9uKCBleHByZXNzaW9uVHlwZSwgb3BlcmF0b3IgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIGV4cHJlc3Npb25UeXBlICk7XG5cbiAgICB0aGlzLm9wZXJhdG9yID0gb3BlcmF0b3I7XG59XG5cbk9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5PcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gT3BlcmF0b3JFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBvcGVyYXRvciBleHByZXNzaW9uXG4gKi9cbk9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLm9wZXJhdG9yID0gdGhpcy5vcGVyYXRvcjtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIEJsb2NrRXhwcmVzc2lvbiggYm9keSApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgJ0Jsb2NrRXhwcmVzc2lvbicgKTtcblxuICAgIC8qXG4gICAgaWYoICEoIGV4cHJlc3Npb24gaW5zdGFuY2VvZiBFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2FyZ3VtZW50IG11c3QgYmUgYW4gZXhwcmVzc2lvbicgKTtcbiAgICB9XG4gICAgKi9cblxuICAgIHRoaXMuYm9keSA9IGJvZHk7XG59XG5cbkJsb2NrRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5CbG9ja0V4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQmxvY2tFeHByZXNzaW9uO1xuXG5leHBvcnQgZnVuY3Rpb24gRXhpc3RlbnRpYWxFeHByZXNzaW9uKCBleHByZXNzaW9uICl7XG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uLCAnPycgKTtcblxuICAgIHRoaXMuZXhwcmVzc2lvbiA9IGV4cHJlc3Npb247XG59XG5cbkV4aXN0ZW50aWFsRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkV4aXN0ZW50aWFsRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFeGlzdGVudGlhbEV4cHJlc3Npb247XG5cbkV4aXN0ZW50aWFsRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvbi50b0pTT04oKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIExvb2t1cEV4cHJlc3Npb24oIGtleSApe1xuICAgIGlmKCAhKCBrZXkgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgISgga2V5IGluc3RhbmNlb2YgSWRlbnRpZmllciApICYmICEoIGtleSBpbnN0YW5jZW9mIEJsb2NrRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdrZXkgbXVzdCBiZSBhIGxpdGVyYWwsIGlkZW50aWZpZXIsIG9yIGV2YWwgZXhwcmVzc2lvbicgKTtcbiAgICB9XG5cbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uLCAnJScgKTtcblxuICAgIHRoaXMua2V5ID0ga2V5O1xufVxuXG5Mb29rdXBFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuTG9va3VwRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMb29rdXBFeHByZXNzaW9uO1xuXG5Mb29rdXBFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0b3IgKyB0aGlzLmtleTtcbn07XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmtleSA9IHRoaXMua2V5O1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflJhbmdlRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5PcGVyYXRvckV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBsZWZ0XG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gcmlnaHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJhbmdlRXhwcmVzc2lvbiggbGVmdCwgcmlnaHQgKXtcbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5SYW5nZUV4cHJlc3Npb24sICcuLicgKTtcblxuICAgIGlmKCAhKCBsZWZ0IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmIGxlZnQgIT09IG51bGwgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xlZnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBsaXRlcmFsIG9yIG51bGwnICk7XG4gICAgfVxuXG4gICAgaWYoICEoIHJpZ2h0IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmIHJpZ2h0ICE9PSBudWxsICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyaWdodCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGxpdGVyYWwgb3IgbnVsbCcgKTtcbiAgICB9XG5cbiAgICBpZiggbGVmdCA9PT0gbnVsbCAmJiByaWdodCA9PT0gbnVsbCApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGVmdCBhbmQgcmlnaHQgY2Fubm90IGVxdWFsIG51bGwgYXQgdGhlIHNhbWUgdGltZScgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uI2xlZnRcbiAgICAgKi9cbiAgICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5MaXRlcmFsfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiMwXG4gICAgICovXG4gICAgdGhpc1sgMCBdID0gdGhpcy5sZWZ0ID0gbGVmdDtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+TGl0ZXJhbH0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jcmlnaHRcbiAgICAgKi9cbiAgICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5MaXRlcmFsfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiMxXG4gICAgICovXG4gICAgdGhpc1sgMSBdID0gdGhpcy5yaWdodCA9IHJpZ2h0O1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiNsZW5ndGg9MlxuICAgICAqL1xuICAgIHRoaXMubGVuZ3RoID0gMjtcbn1cblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblJhbmdlRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSYW5nZUV4cHJlc3Npb247XG5cblJhbmdlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ubGVmdCA9IHRoaXMubGVmdCAhPT0gbnVsbCA/XG4gICAgICAgIHRoaXMubGVmdC50b0pTT04oKSA6XG4gICAgICAgIHRoaXMubGVmdDtcbiAgICBqc29uLnJpZ2h0ID0gdGhpcy5yaWdodCAhPT0gbnVsbCA/XG4gICAgICAgIHRoaXMucmlnaHQudG9KU09OKCkgOlxuICAgICAgICB0aGlzLnJpZ2h0O1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5SYW5nZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5sZWZ0LnRvU3RyaW5nKCkgKyB0aGlzLm9wZXJhdG9yICsgdGhpcy5yaWdodC50b1N0cmluZygpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFJlbGF0aW9uYWxNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5LCBjYXJkaW5hbGl0eSApe1xuICAgIENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5ICk7XG5cbiAgICBpZiggIWhhc093blByb3BlcnR5KCBDYXJkaW5hbGl0eSwgY2FyZGluYWxpdHkgKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnVW5rbm93biBjYXJkaW5hbGl0eSAnICsgY2FyZGluYWxpdHkgKTtcbiAgICB9XG5cbiAgICB0aGlzLmNhcmRpbmFsaXR5ID0gY2FyZGluYWxpdHk7XG59XG5cblJlbGF0aW9uYWxNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb247XG5cbmV4cG9ydCBmdW5jdGlvbiBSb290RXhwcmVzc2lvbigga2V5ICl7XG4gICAgaWYoICEoIGtleSBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISgga2V5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2tleSBtdXN0IGJlIGEgbGl0ZXJhbCwgaWRlbnRpZmllciwgb3IgZXZhbCBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uLCAnficgKTtcblxuICAgIHRoaXMua2V5ID0ga2V5O1xufVxuXG5Sb290RXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJvb3RFeHByZXNzaW9uO1xuXG5Sb290RXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICsgdGhpcy5rZXk7XG59O1xuXG5Sb290RXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ua2V5ID0gdGhpcy5rZXk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBTY29wZUV4cHJlc3Npb24oIG9wZXJhdG9yLCBrZXkgKXtcbiAgICAvL2lmKCAhKCBrZXkgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgISgga2V5IGluc3RhbmNlb2YgSWRlbnRpZmllciApICYmICEoIGtleSBpbnN0YW5jZW9mIEJsb2NrRXhwcmVzc2lvbiApICl7XG4gICAgLy8gICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2tleSBtdXN0IGJlIGEgbGl0ZXJhbCwgaWRlbnRpZmllciwgb3IgZXZhbCBleHByZXNzaW9uJyApO1xuICAgIC8vfVxuXG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguU2NvcGVFeHByZXNzaW9uLCBvcGVyYXRvciApO1xuXG4gICAgdGhpcy5rZXkgPSBrZXk7XG59XG5cblNjb3BlRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblNjb3BlRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTY29wZUV4cHJlc3Npb247XG5cblNjb3BlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICsgdGhpcy5rZXk7XG59O1xuXG5TY29wZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmtleSA9IHRoaXMua2V5O1xuXG4gICAgcmV0dXJuIGpzb247XG59OyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIEdyYW1tYXIgZnJvbSAnLi9ncmFtbWFyJztcbmltcG9ydCAqIGFzIE5vZGUgZnJvbSAnLi9ub2RlJztcbmltcG9ydCAqIGFzIEtleXBhdGhOb2RlIGZyb20gJy4va2V5cGF0aC1ub2RlJztcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlclxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtMZXhlcn0gbGV4ZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQnVpbGRlciggbGV4ZXIgKXtcbiAgICB0aGlzLmxleGVyID0gbGV4ZXI7XG59XG5cbkJ1aWxkZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuQnVpbGRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCdWlsZGVyO1xuXG5CdWlsZGVyLnByb3RvdHlwZS5hcnJheUV4cHJlc3Npb24gPSBmdW5jdGlvbiggbGlzdCApe1xuICAgIC8vY29uc29sZS5sb2coICdBUlJBWSBFWFBSRVNTSU9OJyApO1xuICAgIHRoaXMuY29uc3VtZSggJ1snICk7XG4gICAgcmV0dXJuIG5ldyBOb2RlLkFycmF5RXhwcmVzc2lvbiggbGlzdCApO1xufTtcblxuQnVpbGRlci5wcm90b3R5cGUuYmxvY2tFeHByZXNzaW9uID0gZnVuY3Rpb24oIHRlcm1pbmF0b3IgKXtcbiAgICB2YXIgYmxvY2sgPSBbXSxcbiAgICAgICAgaXNvbGF0ZWQgPSBmYWxzZTtcbiAgICAvL2NvbnNvbGUubG9nKCAnQkxPQ0snLCB0ZXJtaW5hdG9yICk7XG4gICAgaWYoICF0aGlzLnBlZWsoIHRlcm1pbmF0b3IgKSApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBFWFBSRVNTSU9OUycgKTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgYmxvY2sudW5zaGlmdCggdGhpcy5jb25zdW1lKCkgKTtcbiAgICAgICAgfSB3aGlsZSggIXRoaXMucGVlayggdGVybWluYXRvciApICk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZSggdGVybWluYXRvciApO1xuICAgIC8qaWYoIHRoaXMucGVlayggJ34nICkgKXtcbiAgICAgICAgaXNvbGF0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnN1bWUoICd+JyApO1xuICAgIH0qL1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuQmxvY2tFeHByZXNzaW9uKCBibG9jaywgaXNvbGF0ZWQgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ3xBcnJheTxCdWlsZGVyflRva2VuPn0gaW5wdXRcbiAqIEByZXR1cm5zIHtQcm9ncmFtfSBUaGUgYnVpbHQgYWJzdHJhY3Qgc3ludGF4IHRyZWVcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuYnVpbGQgPSBmdW5jdGlvbiggaW5wdXQgKXtcbiAgICBpZiggdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyApe1xuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50ZXh0ID0gaW5wdXQ7XG5cbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzLmxleGVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnbGV4ZXIgaXMgbm90IGRlZmluZWQnICk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6QXJyYXk8VG9rZW4+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50b2tlbnMgPSB0aGlzLmxleGVyLmxleCggaW5wdXQgKTtcbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGlucHV0ICkgKXtcbiAgICAgICAgdGhpcy50b2tlbnMgPSBpbnB1dC5zbGljZSgpO1xuICAgICAgICB0aGlzLnRleHQgPSBpbnB1dC5qb2luKCAnJyApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ2ludmFsaWQgaW5wdXQnICk7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coICdCVUlMRCcgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSAnLCB0aGlzLnRleHQubGVuZ3RoLCAnQ0hBUlMnLCB0aGlzLnRleHQgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSAnLCB0aGlzLnRva2Vucy5sZW5ndGgsICdUT0tFTlMnLCB0aGlzLnRva2VucyApO1xuICAgIHRoaXMuY29sdW1uID0gdGhpcy50ZXh0Lmxlbmd0aDtcbiAgICB0aGlzLmxpbmUgPSAxO1xuXG4gICAgdmFyIHByb2dyYW0gPSB0aGlzLnByb2dyYW0oKTtcblxuICAgIGlmKCB0aGlzLnRva2Vucy5sZW5ndGggKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnVW5leHBlY3RlZCB0b2tlbiAnICsgdGhpcy50b2tlbnNbIDAgXSArICcgcmVtYWluaW5nJyApO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9ncmFtO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtDYWxsRXhwcmVzc2lvbn0gVGhlIGNhbGwgZXhwcmVzc2lvbiBub2RlXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmNhbGxFeHByZXNzaW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgYXJncyA9IHRoaXMubGlzdCggJygnICksXG4gICAgICAgIGNhbGxlZTtcblxuICAgIHRoaXMuY29uc3VtZSggJygnICk7XG5cbiAgICBjYWxsZWUgPSB0aGlzLmV4cHJlc3Npb24oKTtcblxuICAgIC8vY29uc29sZS5sb2coICdDQUxMIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gQ0FMTEVFJywgY2FsbGVlICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gQVJHVU1FTlRTJywgYXJncywgYXJncy5sZW5ndGggKTtcbiAgICByZXR1cm4gbmV3IE5vZGUuQ2FsbEV4cHJlc3Npb24oIGNhbGxlZSwgYXJncyApO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBuZXh0IHRva2VuIGluIHRoZSB0b2tlbiBsaXN0LiBJZiBhIGNvbXBhcmlzb24gaXMgcHJvdmlkZWQsIHRoZSB0b2tlbiB3aWxsIG9ubHkgYmUgcmV0dXJuZWQgaWYgdGhlIHZhbHVlIG1hdGNoZXMuIE90aGVyd2lzZSBhbiBlcnJvciBpcyB0aHJvd24uXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZXhwZWN0ZWRdIEFuIGV4cGVjdGVkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtUb2tlbn0gVGhlIG5leHQgdG9rZW4gaW4gdGhlIGxpc3RcbiAqIEB0aHJvd3Mge1N5bnRheEVycm9yfSBJZiB0b2tlbiBkaWQgbm90IGV4aXN0XG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmNvbnN1bWUgPSBmdW5jdGlvbiggZXhwZWN0ZWQgKXtcbiAgICBpZiggIXRoaXMudG9rZW5zLmxlbmd0aCApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdVbmV4cGVjdGVkIGVuZCBvZiBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIHZhciB0b2tlbiA9IHRoaXMuZXhwZWN0KCBleHBlY3RlZCApO1xuXG4gICAgaWYoICF0b2tlbiApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdVbmV4cGVjdGVkIHRva2VuICcgKyB0b2tlbi52YWx1ZSArICcgY29uc3VtZWQnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRva2VuO1xufTtcblxuQnVpbGRlci5wcm90b3R5cGUuZXhpc3RlbnRpYWxFeHByZXNzaW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvbigpO1xuICAgIC8vY29uc29sZS5sb2coICctIEVYSVNUIEVYUFJFU1NJT04nLCBleHByZXNzaW9uICk7XG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5FeGlzdGVudGlhbEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgbmV4dCB0b2tlbiBpbiB0aGUgdG9rZW4gbGlzdC4gSWYgY29tcGFyaXNvbnMgYXJlIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgY29tcGFyaXNvbnMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZmlyc3RdIFRoZSBmaXJzdCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3NlY29uZF0gVGhlIHNlY29uZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3RoaXJkXSBUaGUgdGhpcmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmb3VydGhdIFRoZSBmb3VydGggY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge1Rva2VufSBUaGUgbmV4dCB0b2tlbiBpbiB0aGUgbGlzdCBvciBgdW5kZWZpbmVkYCBpZiBpdCBkaWQgbm90IGV4aXN0XG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmV4cGVjdCA9IGZ1bmN0aW9uKCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICl7XG4gICAgdmFyIHRva2VuID0gdGhpcy5wZWVrKCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICk7XG5cbiAgICBpZiggdG9rZW4gKXtcbiAgICAgICAgdGhpcy50b2tlbnMucG9wKCk7XG4gICAgICAgIHRoaXMuY29sdW1uIC09IHRva2VuLnZhbHVlLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH1cblxuICAgIHJldHVybiB2b2lkIDA7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0V4cHJlc3Npb259IEFuIGV4cHJlc3Npb24gbm9kZVxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5leHByZXNzaW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IG51bGwsXG4gICAgICAgIGxpc3QsIG5leHQsIHRva2VuO1xuXG4gICAgaWYoIHRoaXMuZXhwZWN0KCAnOycgKSApe1xuICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuXG4gICAgaWYoIG5leHQgPSB0aGlzLnBlZWsoKSApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRVhQUkVTU0lPTicsIG5leHQgKTtcbiAgICAgICAgc3dpdGNoKCBuZXh0LnR5cGUgKXtcbiAgICAgICAgICAgIGNhc2UgR3JhbW1hci5QdW5jdHVhdG9yOlxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmV4cGVjdCggJ10nICkgKXtcbiAgICAgICAgICAgICAgICAgICAgbGlzdCA9IHRoaXMubGlzdCggJ1snICk7XG4gICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLnRva2Vucy5sZW5ndGggPT09IDEgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmFycmF5RXhwcmVzc2lvbiggbGlzdCApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIGxpc3QubGVuZ3RoID4gMSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuc2VxdWVuY2VFeHByZXNzaW9uKCBsaXN0ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gQXJyYXkuaXNBcnJheSggbGlzdCApID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0WyAwIF0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBuZXh0LnZhbHVlID09PSAnfScgKXtcbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwKCBuZXh0ICk7XG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIHRoaXMuZXhwZWN0KCAnPycgKSApe1xuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5leGlzdGVudGlhbEV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgR3JhbW1hci5OdWxsTGl0ZXJhbDpcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5saXRlcmFsKCk7XG4gICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gR3JhbW1hci5JZGVudGlmaWVyXG4gICAgICAgICAgICAvLyBHcmFtbWFyLk51bWVyaWNMaXRlcmFsXG4gICAgICAgICAgICAvLyBHcmFtbWFyLlN0cmluZ0xpdGVyYWxcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwKCBuZXh0ICk7XG4gICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIC8vIEltcGxpZWQgbWVtYmVyIGV4cHJlc3Npb24uIFNob3VsZCBvbmx5IGhhcHBlbiBhZnRlciBhbiBJZGVudGlmaWVyLlxuICAgICAgICAgICAgICAgIGlmKCBuZXh0ICYmIG5leHQudHlwZSA9PT0gR3JhbW1hci5QdW5jdHVhdG9yICYmICggbmV4dC52YWx1ZSA9PT0gJyknIHx8IG5leHQudmFsdWUgPT09ICddJyB8fCBuZXh0LnZhbHVlID09PSAnPycgKSApe1xuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5tZW1iZXJFeHByZXNzaW9uKCBleHByZXNzaW9uLCBmYWxzZSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlKCAoIHRva2VuID0gdGhpcy5leHBlY3QoICcpJywgJ1snLCAnLicgKSApICl7XG4gICAgICAgICAgICBpZiggdG9rZW4udmFsdWUgPT09ICcpJyApe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmNhbGxFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHRva2VuLnZhbHVlID09PSAnWycgKXtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5tZW1iZXJFeHByZXNzaW9uKCBleHByZXNzaW9uLCB0cnVlICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHRva2VuLnZhbHVlID09PSAnLicgKXtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5tZW1iZXJFeHByZXNzaW9uKCBleHByZXNzaW9uLCBmYWxzZSApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoICdVbmV4cGVjdGVkIHRva2VuICcgKyB0b2tlbiApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0V4cHJlc3Npb25TdGF0ZW1lbnR9IEFuIGV4cHJlc3Npb24gc3RhdGVtZW50XG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmV4cHJlc3Npb25TdGF0ZW1lbnQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBleHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uKCksXG4gICAgICAgIGV4cHJlc3Npb25TdGF0ZW1lbnQ7XG4gICAgLy9jb25zb2xlLmxvZyggJ0VYUFJFU1NJT04gU1RBVEVNRU5UIFdJVEgnLCBleHByZXNzaW9uICk7XG4gICAgZXhwcmVzc2lvblN0YXRlbWVudCA9IG5ldyBOb2RlLkV4cHJlc3Npb25TdGF0ZW1lbnQoIGV4cHJlc3Npb24gKTtcblxuICAgIHJldHVybiBleHByZXNzaW9uU3RhdGVtZW50O1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtJZGVudGlmaWVyfSBBbiBpZGVudGlmaWVyXG4gKiBAdGhyb3dzIHtTeW50YXhFcnJvcn0gSWYgdGhlIHRva2VuIGlzIG5vdCBhbiBpZGVudGlmaWVyXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmlkZW50aWZpZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciB0b2tlbiA9IHRoaXMuY29uc3VtZSgpO1xuXG4gICAgaWYoICEoIHRva2VuLnR5cGUgPT09IEdyYW1tYXIuSWRlbnRpZmllciApICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ0lkZW50aWZpZXIgZXhwZWN0ZWQnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBOb2RlLklkZW50aWZpZXIoIHRva2VuLnZhbHVlICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHRlcm1pbmF0b3JcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpBcnJheTxFeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259IFRoZSBsaXN0IG9mIGV4cHJlc3Npb25zIG9yIHJhbmdlIGV4cHJlc3Npb25cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uKCB0ZXJtaW5hdG9yICl7XG4gICAgdmFyIGxpc3QgPSBbXSxcbiAgICAgICAgaXNOdW1lcmljID0gZmFsc2UsXG4gICAgICAgIGV4cHJlc3Npb24sIG5leHQ7XG4gICAgLy9jb25zb2xlLmxvZyggJ0xJU1QnLCB0ZXJtaW5hdG9yICk7XG4gICAgaWYoICF0aGlzLnBlZWsoIHRlcm1pbmF0b3IgKSApe1xuICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgIGlzTnVtZXJpYyA9IG5leHQudHlwZSA9PT0gR3JhbW1hci5OdW1lcmljTGl0ZXJhbDtcblxuICAgICAgICAvLyBFeGFtcGxlczogWzEuLjNdLCBbNS4uXSwgWy4uN11cbiAgICAgICAgaWYoICggaXNOdW1lcmljIHx8IG5leHQudmFsdWUgPT09ICcuJyApICYmIHRoaXMucGVla0F0KCAxLCAnLicgKSApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gUkFOR0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpc051bWVyaWMgP1xuICAgICAgICAgICAgICAgIHRoaXMubG9va3VwKCBuZXh0ICkgOlxuICAgICAgICAgICAgICAgIG51bGw7XG4gICAgICAgICAgICBsaXN0ID0gdGhpcy5yYW5nZUV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcblxuICAgICAgICAvLyBFeGFtcGxlczogWzEsMiwzXSwgW1wiYWJjXCIsXCJkZWZcIl0sIFtmb28sYmFyXSwgW3tmb28uYmFyfV1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIEFSUkFZIE9GIEVYUFJFU1NJT05TJyApO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cCggbmV4dCApO1xuICAgICAgICAgICAgICAgIGxpc3QudW5zaGlmdCggZXhwcmVzc2lvbiApO1xuICAgICAgICAgICAgfSB3aGlsZSggdGhpcy5leHBlY3QoICcsJyApICk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJy0gTElTVCBSRVNVTFQnLCBsaXN0ICk7XG4gICAgcmV0dXJuIGxpc3Q7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0xpdGVyYWx9IFRoZSBsaXRlcmFsIG5vZGVcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUubGl0ZXJhbCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRva2VuID0gdGhpcy5jb25zdW1lKCksXG4gICAgICAgIHJhdyA9IHRva2VuLnZhbHVlLFxuICAgICAgICBleHByZXNzaW9uO1xuXG4gICAgc3dpdGNoKCB0b2tlbi50eXBlICl7XG4gICAgICAgIGNhc2UgR3JhbW1hci5OdW1lcmljTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBuZXcgTm9kZS5OdW1lcmljTGl0ZXJhbCggcmF3ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBHcmFtbWFyLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gbmV3IE5vZGUuU3RyaW5nTGl0ZXJhbCggcmF3ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBHcmFtbWFyLk51bGxMaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IG5ldyBOb2RlLk51bGxMaXRlcmFsKCByYXcgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnTGl0ZXJhbCBleHBlY3RlZCcgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbkJ1aWxkZXIucHJvdG90eXBlLmxvb2t1cCA9IGZ1bmN0aW9uKCBuZXh0ICl7XG4gICAgdmFyIGV4cHJlc3Npb247XG4gICAgLy9jb25zb2xlLmxvZyggJ0xPT0tVUCcsIG5leHQgKTtcbiAgICBzd2l0Y2goIG5leHQudHlwZSApe1xuICAgICAgICBjYXNlIEdyYW1tYXIuSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmlkZW50aWZpZXIoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWw6XG4gICAgICAgIGNhc2UgR3JhbW1hci5TdHJpbmdMaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubGl0ZXJhbCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR3JhbW1hci5QdW5jdHVhdG9yOlxuICAgICAgICAgICAgaWYoIG5leHQudmFsdWUgPT09ICd9JyApe1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZSggJ30nICk7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuYmxvY2tFeHByZXNzaW9uKCAneycgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvciggJ3Rva2VuIGNhbm5vdCBiZSBhIGxvb2t1cCcgKTtcbiAgICB9XG5cbiAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG5cbiAgICBpZiggbmV4dCAmJiBuZXh0LnZhbHVlID09PSAnJScgKXtcbiAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApO1xuICAgIH1cbiAgICBpZiggbmV4dCAmJiBuZXh0LnZhbHVlID09PSAnficgKXtcbiAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMucm9vdEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJy0gTE9PS1VQIFJFU1VMVCcsIGV4cHJlc3Npb24gKTtcbiAgICByZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbkJ1aWxkZXIucHJvdG90eXBlLmxvb2t1cEV4cHJlc3Npb24gPSBmdW5jdGlvbigga2V5ICl7XG4gICAgdGhpcy5jb25zdW1lKCAnJScgKTtcbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLkxvb2t1cEV4cHJlc3Npb24oIGtleSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7RXhwcmVzc2lvbn0gcHJvcGVydHkgVGhlIGV4cHJlc3Npb24gYXNzaWduZWQgdG8gdGhlIHByb3BlcnR5IG9mIHRoZSBtZW1iZXIgZXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBjb21wdXRlZCBXaGV0aGVyIG9yIG5vdCB0aGUgbWVtYmVyIGV4cHJlc3Npb24gaXMgY29tcHV0ZWRcbiAqIEByZXR1cm5zIHtNZW1iZXJFeHByZXNzaW9ufSBUaGUgbWVtYmVyIGV4cHJlc3Npb25cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUubWVtYmVyRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBwcm9wZXJ0eSwgY29tcHV0ZWQgKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnTUVNQkVSJywgcHJvcGVydHkgKTtcbiAgICB2YXIgb2JqZWN0ID0gdGhpcy5leHByZXNzaW9uKCk7XG4gICAgLy9jb25zb2xlLmxvZyggJ01FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIE9CSkVDVCcsIG9iamVjdCApO1xuICAgIC8vY29uc29sZS5sb2coICctIFBST1BFUlRZJywgcHJvcGVydHkgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBDT01QVVRFRCcsIGNvbXB1dGVkICk7XG4gICAgcmV0dXJuIGNvbXB1dGVkID9cbiAgICAgICAgbmV3IE5vZGUuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICkgOlxuICAgICAgICBuZXcgTm9kZS5TdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICk7XG59O1xuXG5CdWlsZGVyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKCBpbnB1dCApe1xuICAgIHRoaXMudG9rZW5zID0gdGhpcy5sZXhlci5sZXgoIGlucHV0ICk7XG4gICAgcmV0dXJuIHRoaXMuYnVpbGQoIHRoaXMudG9rZW5zICk7XG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIHRoZSBuZXh0IHRva2VuIGluIHRoZSB0b2tlbiBsaXN0IF93aXRob3V0IHJlbW92aW5nIGl0Xy4gSWYgY29tcGFyaXNvbnMgYXJlIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgY29tcGFyaXNvbnMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZmlyc3RdIFRoZSBmaXJzdCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3NlY29uZF0gVGhlIHNlY29uZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3RoaXJkXSBUaGUgdGhpcmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmb3VydGhdIFRoZSBmb3VydGggY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge0xleGVyflRva2VufSBUaGUgbmV4dCB0b2tlbiBpbiB0aGUgbGlzdCBvciBgdW5kZWZpbmVkYCBpZiBpdCBkaWQgbm90IGV4aXN0XG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbiggZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApe1xuICAgIHJldHVybiB0aGlzLnBlZWtBdCggMCwgZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyB0aGUgdG9rZW4gYXQgdGhlIHJlcXVlc3RlZCBwb3NpdGlvbiBfd2l0aG91dCByZW1vdmluZyBpdF8gZnJvbSB0aGUgdG9rZW4gbGlzdC4gSWYgY29tcGFyaXNvbnMgYXJlIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgY29tcGFyaXNvbnMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBwb3NpdGlvbiBUaGUgcG9zaXRpb24gd2hlcmUgdGhlIHRva2VuIHdpbGwgYmUgcGVla2VkXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZpcnN0XSBUaGUgZmlyc3QgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtzZWNvbmRdIFRoZSBzZWNvbmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFt0aGlyZF0gVGhlIHRoaXJkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZm91cnRoXSBUaGUgZm91cnRoIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtMZXhlcn5Ub2tlbn0gVGhlIHRva2VuIGF0IHRoZSByZXF1ZXN0ZWQgcG9zaXRpb24gb3IgYHVuZGVmaW5lZGAgaWYgaXQgZGlkIG5vdCBleGlzdFxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5wZWVrQXQgPSBmdW5jdGlvbiggcG9zaXRpb24sIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKXtcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy50b2tlbnMubGVuZ3RoLFxuICAgICAgICBpbmRleCwgdG9rZW4sIHZhbHVlO1xuXG4gICAgaWYoIGxlbmd0aCAmJiB0eXBlb2YgcG9zaXRpb24gPT09ICdudW1iZXInICYmIHBvc2l0aW9uID4gLTEgKXtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGEgemVyby1iYXNlZCBpbmRleCBzdGFydGluZyBmcm9tIHRoZSBlbmQgb2YgdGhlIGxpc3RcbiAgICAgICAgaW5kZXggPSBsZW5ndGggLSBwb3NpdGlvbiAtIDE7XG5cbiAgICAgICAgaWYoIGluZGV4ID4gLTEgJiYgaW5kZXggPCBsZW5ndGggKXtcbiAgICAgICAgICAgIHRva2VuID0gdGhpcy50b2tlbnNbIGluZGV4IF07XG4gICAgICAgICAgICB2YWx1ZSA9IHRva2VuLnZhbHVlO1xuXG4gICAgICAgICAgICBpZiggdmFsdWUgPT09IGZpcnN0IHx8IHZhbHVlID09PSBzZWNvbmQgfHwgdmFsdWUgPT09IHRoaXJkIHx8IHZhbHVlID09PSBmb3VydGggfHwgKCAhZmlyc3QgJiYgIXNlY29uZCAmJiAhdGhpcmQgJiYgIWZvdXJ0aCApICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZvaWQgMDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7UHJvZ3JhbX0gQSBwcm9ncmFtIG5vZGVcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUucHJvZ3JhbSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGJvZHkgPSBbXTtcbiAgICAvL2NvbnNvbGUubG9nKCAnUFJPR1JBTScgKTtcbiAgICB3aGlsZSggdHJ1ZSApe1xuICAgICAgICBpZiggdGhpcy50b2tlbnMubGVuZ3RoICl7XG4gICAgICAgICAgICBib2R5LnVuc2hpZnQoIHRoaXMuZXhwcmVzc2lvblN0YXRlbWVudCgpICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE5vZGUuUHJvZ3JhbSggYm9keSApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuQnVpbGRlci5wcm90b3R5cGUucmFuZ2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIHJpZ2h0ICl7XG4gICAgdmFyIGxlZnQ7XG5cbiAgICB0aGlzLmV4cGVjdCggJy4nICk7XG4gICAgdGhpcy5leHBlY3QoICcuJyApO1xuXG4gICAgbGVmdCA9IHRoaXMucGVlaygpLnR5cGUgPT09IEdyYW1tYXIuTnVtZXJpY0xpdGVyYWwgP1xuICAgICAgICBsZWZ0ID0gdGhpcy5saXRlcmFsKCkgOlxuICAgICAgICBudWxsO1xuXG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5SYW5nZUV4cHJlc3Npb24oIGxlZnQsIHJpZ2h0ICk7XG59O1xuXG5CdWlsZGVyLnByb3RvdHlwZS5yb290RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXkgKXtcbiAgICB0aGlzLmNvbnN1bWUoICd+JyApO1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuUm9vdEV4cHJlc3Npb24oIGtleSApO1xufTtcblxuQnVpbGRlci5wcm90b3R5cGUuc2VxdWVuY2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIGxpc3QgKXtcbiAgICByZXR1cm4gbmV3IE5vZGUuU2VxdWVuY2VFeHByZXNzaW9uKCBsaXN0ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2VcbiAqIEB0aHJvd3Mge2V4dGVybmFsOlN5bnRheEVycm9yfSBXaGVuIGl0IGV4ZWN1dGVzXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnRocm93RXJyb3IgPSBmdW5jdGlvbiggbWVzc2FnZSApe1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggbWVzc2FnZSApO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBoYXNPd25Qcm9wZXJ0eSBmcm9tICcuL2hhcy1vd24tcHJvcGVydHknO1xuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIFN5bnRheCBmcm9tICcuL3N5bnRheCc7XG5pbXBvcnQgKiBhcyBLZXlwYXRoU3ludGF4IGZyb20gJy4va2V5cGF0aC1zeW50YXgnO1xuXG52YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fSxcblxuICAgIGNhY2hlID0gbmV3IE51bGwoKSxcbiAgICBnZXR0ZXIgPSBuZXcgTnVsbCgpLFxuICAgIHNldHRlciA9IG5ldyBOdWxsKCk7XG5cbmZ1bmN0aW9uIGV4ZWN1dGVMaXN0KCBsaXN0LCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgIHZhciBpbmRleCA9IGxpc3QubGVuZ3RoLFxuICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgc3dpdGNoKCBsaXN0Lmxlbmd0aCApe1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBsaXN0WyAwIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBsaXN0WyAwIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICByZXN1bHRbIDEgXSA9IGxpc3RbIDEgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IGxpc3RbIDAgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIHJlc3VsdFsgMSBdID0gbGlzdFsgMSBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgcmVzdWx0WyAyIF0gPSBsaXN0WyAyIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBsaXN0WyAwIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICByZXN1bHRbIDEgXSA9IGxpc3RbIDEgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIHJlc3VsdFsgMiBdID0gbGlzdFsgMiBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgcmVzdWx0WyAzIF0gPSBsaXN0WyAzIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gbGlzdFsgaW5kZXggXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5nZXR0ZXIudmFsdWUgPSBmdW5jdGlvbiggb2JqZWN0LCBrZXkgKXtcbiAgICByZXR1cm4gb2JqZWN0WyBrZXkgXTtcbn07XG5cbmdldHRlci5saXN0ID0gZnVuY3Rpb24oIG9iamVjdCwga2V5ICl7XG4gICAgdmFyIGluZGV4ID0gb2JqZWN0Lmxlbmd0aCxcbiAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBpbmRleCApO1xuXG4gICAgc3dpdGNoKCBpbmRleCApe1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IG9iamVjdFsgMCBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gb2JqZWN0WyAwIF1bIGtleSBdO1xuICAgICAgICAgICAgcmVzdWx0WyAxIF0gPSBvYmplY3RbIDEgXVsga2V5IF07XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IG9iamVjdFsgMCBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJlc3VsdFsgMSBdID0gb2JqZWN0WyAxIF1bIGtleSBdO1xuICAgICAgICAgICAgcmVzdWx0WyAyIF0gPSBvYmplY3RbIDIgXVsga2V5IF07XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IG9iamVjdFsgMCBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJlc3VsdFsgMSBdID0gb2JqZWN0WyAxIF1bIGtleSBdO1xuICAgICAgICAgICAgcmVzdWx0WyAyIF0gPSBvYmplY3RbIDIgXVsga2V5IF07XG4gICAgICAgICAgICByZXN1bHRbIDMgXSA9IG9iamVjdFsgMyBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IG9iamVjdFsgaW5kZXggXVsga2V5IF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cbnNldHRlci52YWx1ZSA9IGZ1bmN0aW9uKCBvYmplY3QsIGtleSwgdmFsdWUgKXtcbiAgICBpZiggIWhhc093blByb3BlcnR5KCBvYmplY3QsIGtleSApICl7XG4gICAgICAgIG9iamVjdFsga2V5IF0gPSB2YWx1ZSB8fCB7fTtcbiAgICB9XG4gICAgcmV0dXJuIGdldHRlci52YWx1ZSggb2JqZWN0LCBrZXkgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIEludGVycHJldGVyfnJldHVyblplcm9cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IHplcm9cbiAqL1xuZnVuY3Rpb24gcmV0dXJuWmVybygpe1xuICAgIHJldHVybiAwO1xufVxuXG4vKipcbiAqIEBjbGFzcyBJbnRlcnByZXRlckVycm9yXG4gKiBAZXh0ZW5kcyBleHRlcm5hbDpTeW50YXhFcnJvclxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IG1lc3NhZ2VcbiAqL1xuZnVuY3Rpb24gSW50ZXJwcmV0ZXJFcnJvciggbWVzc2FnZSApe1xuICAgIFN5bnRheEVycm9yLmNhbGwoIHRoaXMsIG1lc3NhZ2UgKTtcbn1cblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggU3ludGF4RXJyb3IucHJvdG90eXBlICk7XG5cbi8qKlxuICogQGNsYXNzIEludGVycHJldGVyXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge0J1aWxkZXJ9IGJ1aWxkZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSW50ZXJwcmV0ZXIoIGJ1aWxkZXIgKXtcbiAgICBpZiggIWFyZ3VtZW50cy5sZW5ndGggKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnYnVpbGRlciBjYW5ub3QgYmUgdW5kZWZpbmVkJywgVHlwZUVycm9yICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn0gSW50ZXJwcmV0ZXIjYnVpbGRlclxuICAgICAqL1xuICAgIHRoaXMuYnVpbGRlciA9IGJ1aWxkZXI7XG59XG5cbkludGVycHJldGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEludGVycHJldGVyO1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuYXJyYXlFeHByZXNzaW9uID0gZnVuY3Rpb24oIGVsZW1lbnRzLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIEFSUkFZIEVYUFJFU1NJT04nLCBlbGVtZW50cy5sZW5ndGggKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBmbiwgbGlzdDtcbiAgICBpZiggQXJyYXkuaXNBcnJheSggZWxlbWVudHMgKSApe1xuICAgICAgICBsaXN0ID0gdGhpcy5saXN0RXhwcmVzc2lvbiggZWxlbWVudHMsIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgICAgICBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIEFSUkFZIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTElTVGAsIGxpc3QgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBsaXN0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICBrZXlzLCByZXN1bHQ7XG4gICAgICAgICAgICBzd2l0Y2goIGluZGV4ICl7XG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIGtleXMgPSBsaXN0WyAwIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggc2NvcGUsIGtleXMsICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAga2V5cyA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5c1sgaW5kZXggXSA9IGxpc3RbIGluZGV4IF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBhc3NpZ24oIHNjb3BlLCBrZXlzWyBpbmRleCBdLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gS0VZU2AsIGtleXMgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3QgPSB0aGlzLnJlY3Vyc2UoIGVsZW1lbnRzLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlQXJyYXlFeHByZXNzaW9uV2l0aEVsZW1lbnRSYW5nZSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQVJSQVkgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSVNUYCwgbGlzdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgdmFyIGtleXMgPSBsaXN0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApLFxuICAgICAgICAgICAgICAgIGluZGV4ID0ga2V5cy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgICAgICAgICAgaWYoIGluZGV4ID09PSAxICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBhc3NpZ24oIHNjb3BlLCBrZXlzWyAwIF0sICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gYXNzaWduKCBzY29wZSwga2V5c1sgaW5kZXggXSwgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmbjtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5ibG9ja0V4cHJlc3Npb24gPSBmdW5jdGlvbiggdG9rZW5zLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIEJMT0NLJywgdG9rZW5zLmpvaW4oICcnICkgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICB0ZXh0ID0gdG9rZW5zLmpvaW4oICcnICksXG4gICAgICAgIHByb2dyYW0gPSBoYXNPd25Qcm9wZXJ0eSggY2FjaGUsIHRleHQgKSA/XG4gICAgICAgICAgICBjYWNoZVsgdGV4dCBdIDpcbiAgICAgICAgICAgIGNhY2hlWyB0ZXh0IF0gPSB0aGlzLmJ1aWxkZXIuYnVpbGQoIHRva2VucyApLFxuICAgICAgICBleHByZXNzaW9uID0gdGhpcy5yZWN1cnNlKCBwcm9ncmFtLmJvZHlbIDAgXS5leHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICksXG4gICAgICAgIGZuO1xuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVCbG9ja0V4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQkxPQ0snICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBTQ09QRWAsIHNjb3BlICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBFWFBSRVNTSU9OYCwgZXhwcmVzc2lvbi5uYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgIHZhciByZXN1bHQgPSBleHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogc2NvcGUsIG5hbWU6IHZvaWQgMCwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmNhbGxFeHByZXNzaW9uID0gZnVuY3Rpb24oIGNhbGxlZSwgYXJncywgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBDQUxMIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBpc1NldHRpbmcgPSBhc3NpZ24gPT09IHNldHRlci52YWx1ZSxcbiAgICAgICAgbGVmdCA9IHRoaXMucmVjdXJzZSggY2FsbGVlLCB0cnVlLCBhc3NpZ24gKSxcbiAgICAgICAgbGlzdCA9IHRoaXMubGlzdEV4cHJlc3Npb24oIGFyZ3MsIGZhbHNlLCBhc3NpZ24gKSxcbiAgICAgICAgZm47XG5cbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlQ2FsbEV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQ0FMTCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gYXJnc2AsIGFyZ3MubGVuZ3RoICk7XG4gICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApLFxuICAgICAgICAgICAgdmFsdWVzID0gZXhlY3V0ZUxpc3QoIGxpc3QsIHNjb3BlLCB2YWx1ZSwgbG9va3VwICksXG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSFNgLCBsaHMgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgcmVzdWx0ID0gbGhzLnZhbHVlLmFwcGx5KCBsaHMuY29udGV4dCwgdmFsdWVzICk7XG4gICAgICAgIGlmKCBpc1NldHRpbmcgJiYgdHlwZW9mIGxocy52YWx1ZSA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGludGVycHJldGVyLnRocm93RXJyb3IoICdjYW5ub3QgY3JlYXRlIGNhbGwgZXhwcmVzc2lvbnMnICk7XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfTpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBleHByZXNzaW9uXG4gKi9cbkludGVycHJldGVyLnByb3RvdHlwZS5jb21waWxlID0gZnVuY3Rpb24oIGV4cHJlc3Npb24sIGNyZWF0ZSApe1xuICAgIHZhciBwcm9ncmFtID0gaGFzT3duUHJvcGVydHkoIGNhY2hlLCBleHByZXNzaW9uICkgP1xuICAgICAgICAgICAgY2FjaGVbIGV4cHJlc3Npb24gXSA6XG4gICAgICAgICAgICBjYWNoZVsgZXhwcmVzc2lvbiBdID0gdGhpcy5idWlsZGVyLmJ1aWxkKCBleHByZXNzaW9uICksXG4gICAgICAgIGJvZHkgPSBwcm9ncmFtLmJvZHksXG4gICAgICAgIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgYXNzaWduLCBleHByZXNzaW9ucywgZm4sIGluZGV4O1xuXG4gICAgaWYoIHR5cGVvZiBjcmVhdGUgIT09ICdib29sZWFuJyApe1xuICAgICAgICBjcmVhdGUgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5kZXB0aCA9IC0xO1xuICAgIHRoaXMuaXNMZWZ0TGlzdCA9IGZhbHNlO1xuICAgIHRoaXMuaXNSaWdodExpc3QgPSBmYWxzZTtcbiAgICB0aGlzLmFzc2lnbmVyID0gY3JlYXRlID9cbiAgICAgICAgc2V0dGVyIDpcbiAgICAgICAgZ2V0dGVyO1xuXG4gICAgYXNzaWduID0gdGhpcy5hc3NpZ25lci52YWx1ZTtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKi9cbiAgICBpbnRlcnByZXRlci5leHByZXNzaW9uID0gdGhpcy5idWlsZGVyLnRleHQ7XG4gICAgLy9jb25zb2xlLmxvZyggJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJ0ludGVycHJldGluZyAnLCBleHByZXNzaW9uICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJ1Byb2dyYW0nLCBwcm9ncmFtLnJhbmdlICk7XG5cbiAgICBzd2l0Y2goIGJvZHkubGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGZuID0gbm9vcDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBmbiA9IGludGVycHJldGVyLnJlY3Vyc2UoIGJvZHlbIDAgXS5leHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGluZGV4ID0gYm9keS5sZW5ndGg7XG4gICAgICAgICAgICBleHByZXNzaW9ucyA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbnNbIGluZGV4IF0gPSBpbnRlcnByZXRlci5yZWN1cnNlKCBib2R5WyBpbmRleCBdLmV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZuID0gZnVuY3Rpb24gZXhlY3V0ZVByb2dyYW0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgICAgICAgICAgdmFyIGxlbmd0aCA9IGV4cHJlc3Npb25zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgbGFzdFZhbHVlO1xuXG4gICAgICAgICAgICAgICAgZm9yKCBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RWYWx1ZSA9IGV4cHJlc3Npb25zWyBpbmRleCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBsYXN0VmFsdWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coICdGTicsIGZuLm5hbWUgKTtcbiAgICByZXR1cm4gZm47XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuY29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uID0gZnVuY3Rpb24oIG9iamVjdCwgcHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQ09NUFVURUQgTUVNQkVSIEVYUFJFU1NJT04nLCBvYmplY3QudHlwZSwgcHJvcGVydHkudHlwZSApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgaXNTYWZlID0gb2JqZWN0LnR5cGUgPT09IEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uLFxuICAgICAgICBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBvYmplY3QsIGZhbHNlLCBhc3NpZ24gKSxcbiAgICAgICAgcmlnaHQgPSB0aGlzLnJlY3Vyc2UoIHByb3BlcnR5LCBmYWxzZSwgYXNzaWduICksXG4gICAgICAgIGZuO1xuXG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBDT01QVVRFRCBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExFRlQgYCwgbGVmdC5uYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSSUdIVGAsIHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICksXG4gICAgICAgICAgICBpbmRleCwgbGVuZ3RoLCBwb3NpdGlvbiwgcmVzdWx0LCByaHM7XG4gICAgICAgIGlmKCAhaXNTYWZlIHx8ICggbGhzICE9PSB2b2lkIDAgJiYgbGhzICE9PSBudWxsICkgKXtcbiAgICAgICAgICAgIHJocyA9IHJpZ2h0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSFNgLCBsaHMgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSSFNgLCByaHMgKTtcbiAgICAgICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCByaHMgKSApe1xuICAgICAgICAgICAgICAgIGlmKCAoIGludGVycHJldGVyLmlzTGVmdExpc3QgKSAmJiBBcnJheS5pc0FycmF5KCBsaHMgKSApe1xuICAgICAgICAgICAgICAgICAgICBsZW5ndGggPSByaHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IGxocy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IG5ldyBBcnJheSggbGVuZ3RoICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IoIHBvc2l0aW9uID0gMDsgcG9zaXRpb24gPCBsZW5ndGg7IHBvc2l0aW9uKysgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF1bIHBvc2l0aW9uIF0gPSBhc3NpZ24oIGxoc1sgaW5kZXggXSwgcmhzWyBwb3NpdGlvbiBdLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IHJocy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGFzc2lnbiggbGhzLCByaHNbIGluZGV4IF0sICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiggKCBpbnRlcnByZXRlci5pc0xlZnRMaXN0IHx8IGludGVycHJldGVyLmlzUmlnaHRMaXN0ICkgJiYgQXJyYXkuaXNBcnJheSggbGhzICkgKXtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGxocy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgICAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGFzc2lnbiggbGhzWyBpbmRleCBdLCByaHMsICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggbGhzLCByaHMsICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogbGhzLCBuYW1lOiByaHMsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5leGlzdGVudGlhbEV4cHJlc3Npb24gPSBmdW5jdGlvbiggZXhwcmVzc2lvbiwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBFWElTVEVOVElBTCBFWFBSRVNTSU9OJywgZXhwcmVzc2lvbi50eXBlICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIGV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKSxcbiAgICAgICAgZm47XG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUV4aXN0ZW50aWFsRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBFWElTVEVOVElBTCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEVGVGAsIGxlZnQubmFtZSApO1xuICAgICAgICBpZiggc2NvcGUgIT09IHZvaWQgMCAmJiBzY29wZSAhPT0gbnVsbCApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgfSBjYXRjaCggZSApe1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZvaWQgMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmlkZW50aWZpZXIgPSBmdW5jdGlvbiggbmFtZSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBJREVOVElGSUVSJywgbmFtZSApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGZuO1xuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVJZGVudGlmaWVyKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIElERU5USUZJRVInICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBOQU1FYCwgbmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gVkFMVUVgLCB2YWx1ZSApO1xuICAgICAgICB2YXIgcmVzdWx0ID0gYXNzaWduKCBzY29wZSwgbmFtZSwgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogc2NvcGUsIG5hbWU6IG5hbWUsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5saXN0RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBpdGVtcywgY29udGV4dCwgYXNzaWduICl7XG4gICAgdmFyIGluZGV4ID0gaXRlbXMubGVuZ3RoLFxuICAgICAgICBsaXN0ID0gbmV3IEFycmF5KCBpbmRleCApO1xuXG4gICAgc3dpdGNoKCBpbmRleCApe1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgbGlzdFsgMCBdID0gdGhpcy5saXN0RXhwcmVzc2lvbkVsZW1lbnQoIGl0ZW1zWyAwIF0sIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIGxpc3RbIGluZGV4IF0gPSB0aGlzLmxpc3RFeHByZXNzaW9uRWxlbWVudCggaXRlbXNbIGluZGV4IF0sIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaXN0O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmxpc3RFeHByZXNzaW9uRWxlbWVudCA9IGZ1bmN0aW9uKCBlbGVtZW50LCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICBzd2l0Y2goIGVsZW1lbnQudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5MaXRlcmFsOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGl0ZXJhbCggZWxlbWVudC52YWx1ZSwgY29udGV4dCApO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvb2t1cEV4cHJlc3Npb24oIGVsZW1lbnQua2V5LCBmYWxzZSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJvb3RFeHByZXNzaW9uKCBlbGVtZW50LmtleSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5CbG9ja0V4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ibG9ja0V4cHJlc3Npb24oIGVsZW1lbnQuYm9keSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoICdVbmV4cGVjdGVkIGxpc3QgZWxlbWVudCB0eXBlJywgZWxlbWVudC50eXBlICk7XG4gICAgfVxufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmxpdGVyYWwgPSBmdW5jdGlvbiggdmFsdWUsIGNvbnRleHQgKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIExJVEVSQUwnLCB2YWx1ZSApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGZuO1xuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVMaXRlcmFsKCl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgTElURVJBTCcgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHZhbHVlICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogdm9pZCAwLCBuYW1lOiB2b2lkIDAsIHZhbHVlOiB2YWx1ZSB9IDpcbiAgICAgICAgICAgIHZhbHVlO1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUubG9va3VwRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXksIHJlc29sdmUsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgTE9PS1VQIEVYUFJFU1NJT04nLCBrZXkgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgaXNMZWZ0RnVuY3Rpb24gPSBmYWxzZSxcbiAgICAgICAgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBsaHMgPSB7fSxcbiAgICAgICAgZm4sIGxlZnQ7XG5cbiAgICBzd2l0Y2goIGtleS50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LklkZW50aWZpZXI6XG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5pZGVudGlmaWVyKCBrZXkubmFtZSwgdHJ1ZSwgYXNzaWduICk7XG4gICAgICAgICAgICBpc0xlZnRGdW5jdGlvbiA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguTGl0ZXJhbDpcbiAgICAgICAgICAgIGxocy52YWx1ZSA9IGxlZnQgPSBrZXkudmFsdWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIGtleSwgdHJ1ZSwgYXNzaWduICk7XG4gICAgICAgICAgICBpc0xlZnRGdW5jdGlvbiA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlTG9va3VwRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBMT09LVVAgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExFRlRgLCBsZWZ0Lm5hbWUgfHwgbGVmdCApO1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiggaXNMZWZ0RnVuY3Rpb24gKXtcbiAgICAgICAgICAgIGxocyA9IGxlZnQoIGxvb2t1cCwgdmFsdWUsIHNjb3BlICk7XG4gICAgICAgICAgICByZXN1bHQgPSBsaHMudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIGxvb2t1cCwgbGhzLnZhbHVlLCB2b2lkIDAgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXNvbHZlIGxvb2t1cHMgdGhhdCBhcmUgdGhlIG9iamVjdCBvZiBhbiBvYmplY3QtcHJvcGVydHkgcmVsYXRpb25zaGlwXG4gICAgICAgIGlmKCByZXNvbHZlICl7XG4gICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIHNjb3BlLCByZXN1bHQsIHZvaWQgMCApO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSFNgLCBsaHMgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCAgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBsb29rdXAsIG5hbWU6IGxocy52YWx1ZSwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLnJhbmdlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBubCwgbnIsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgUkFOR0UgRVhQUkVTU0lPTicgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGxlZnQgPSBubCAhPT0gbnVsbCA/XG4gICAgICAgICAgICBpbnRlcnByZXRlci5yZWN1cnNlKCBubCwgZmFsc2UsIGFzc2lnbiApIDpcbiAgICAgICAgICAgIHJldHVyblplcm8sXG4gICAgICAgIHJpZ2h0ID0gbnIgIT09IG51bGwgP1xuICAgICAgICAgICAgaW50ZXJwcmV0ZXIucmVjdXJzZSggbnIsIGZhbHNlLCBhc3NpZ24gKSA6XG4gICAgICAgICAgICByZXR1cm5aZXJvLFxuICAgICAgICBmbiwgaW5kZXgsIGxocywgbWlkZGxlLCByZXN1bHQsIHJocztcblxuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVSYW5nZUV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgUkFOR0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExFRlRgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJJR0hUYCwgcmlnaHQubmFtZSApO1xuICAgICAgICBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICByaHMgPSByaWdodCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgIGluZGV4ID0gMTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExIU2AsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkhTYCwgcmhzICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgIHJlc3VsdFsgMCBdID0gbGhzO1xuICAgICAgICBpZiggbGhzIDwgcmhzICl7XG4gICAgICAgICAgICBtaWRkbGUgPSBsaHMgKyAxO1xuICAgICAgICAgICAgd2hpbGUoIG1pZGRsZSA8IHJocyApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXgrKyBdID0gbWlkZGxlKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiggbGhzID4gcmhzICl7XG4gICAgICAgICAgICBtaWRkbGUgPSBsaHMgLSAxO1xuICAgICAgICAgICAgd2hpbGUoIG1pZGRsZSA+IHJocyApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXgrKyBdID0gbWlkZGxlLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0WyByZXN1bHQubGVuZ3RoIF0gPSByaHM7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5JbnRlcnByZXRlci5wcm90b3R5cGUucmVjdXJzZSA9IGZ1bmN0aW9uKCBub2RlLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnUmVjdXJzaW5nJywgbm9kZS50eXBlLCBub2RlLnJhbmdlICk7XG4gICAgdmFyIGV4cHJlc3Npb24gPSBudWxsO1xuICAgIHRoaXMuZGVwdGgrKztcblxuICAgIHN3aXRjaCggbm9kZS50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LkFycmF5RXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmFycmF5RXhwcmVzc2lvbiggbm9kZS5lbGVtZW50cywgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICB0aGlzLmlzTGVmdExpc3QgPSBub2RlLmVsZW1lbnRzLmxlbmd0aCA+IDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguQ2FsbEV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5jYWxsRXhwcmVzc2lvbiggbm9kZS5jYWxsZWUsIG5vZGUuYXJndW1lbnRzLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguQmxvY2tFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuYmxvY2tFeHByZXNzaW9uKCBub2RlLmJvZHksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5leGlzdGVudGlhbEV4cHJlc3Npb24oIG5vZGUuZXhwcmVzc2lvbiwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmlkZW50aWZpZXIoIG5vZGUubmFtZSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxpdGVyYWwoIG5vZGUudmFsdWUsIGNvbnRleHQgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5NZW1iZXJFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IG5vZGUuY29tcHV0ZWQgP1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBub2RlLm9iamVjdCwgbm9kZS5wcm9wZXJ0eSwgY29udGV4dCwgYXNzaWduICkgOlxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGljTWVtYmVyRXhwcmVzc2lvbiggbm9kZS5vYmplY3QsIG5vZGUucHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwRXhwcmVzc2lvbiggbm9kZS5rZXksIGZhbHNlLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguUmFuZ2VFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMucmFuZ2VFeHByZXNzaW9uKCBub2RlLmxlZnQsIG5vZGUucmlnaHQsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLnJvb3RFeHByZXNzaW9uKCBub2RlLmtleSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguU2VxdWVuY2VFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuc2VxdWVuY2VFeHByZXNzaW9uKCBub2RlLmV4cHJlc3Npb25zLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIHRoaXMuaXNSaWdodExpc3QgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoICdVbmtub3duIG5vZGUgdHlwZSAnICsgbm9kZS50eXBlICk7XG4gICAgfVxuICAgIHRoaXMuZGVwdGgtLTtcbiAgICByZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5yb290RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXksIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgUk9PVCBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBrZXksIGZhbHNlLCBhc3NpZ24gKSxcbiAgICAgICAgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBmbjtcblxuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVSb290RXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBST09UIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMRUZUYCwgbGVmdC5uYW1lIHx8IGxlZnQgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFNDT1BFYCwgc2NvcGUgKTtcbiAgICAgICAgdmFyIGxocywgcmVzdWx0O1xuICAgICAgICByZXN1bHQgPSBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEhTYCwgbGhzICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogbG9va3VwLCBuYW1lOiBsaHMudmFsdWUsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5zZXF1ZW5jZUV4cHJlc3Npb24gPSBmdW5jdGlvbiggZXhwcmVzc2lvbnMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIHZhciBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGZuLCBsaXN0O1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgU0VRVUVOQ0UgRVhQUkVTU0lPTicgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICBpZiggQXJyYXkuaXNBcnJheSggZXhwcmVzc2lvbnMgKSApe1xuICAgICAgICBsaXN0ID0gdGhpcy5saXN0RXhwcmVzc2lvbiggZXhwcmVzc2lvbnMsIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgICAgICBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFNFUVVFTkNFIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTElTVGAsIGxpc3QgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZXhlY3V0ZUxpc3QoIGxpc3QsIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0ID0gdGhpcy5yZWN1cnNlKCBleHByZXNzaW9ucywgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgICAgIGZuID0gZnVuY3Rpb24gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbldpdGhFeHByZXNzaW9uUmFuZ2UoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFNFUVVFTkNFIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTElTVGAsIGxpc3QubmFtZSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBsaXN0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZuO1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLnN0YXRpY01lbWJlckV4cHJlc3Npb24gPSBmdW5jdGlvbiggb2JqZWN0LCBwcm9wZXJ0eSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBTVEFUSUMgTUVNQkVSIEVYUFJFU1NJT04nLCBvYmplY3QudHlwZSwgcHJvcGVydHkudHlwZSApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgaXNSaWdodEZ1bmN0aW9uID0gZmFsc2UsXG4gICAgICAgIGlzU2FmZSA9IG9iamVjdC50eXBlID09PSBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbixcbiAgICAgICAgZm4sIGxlZnQsIHJocywgcmlnaHQ7XG5cbiAgICBzd2l0Y2goIG9iamVjdC50eXBlICl7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uOlxuICAgICAgICAgICAgbGVmdCA9IHRoaXMubG9va3VwRXhwcmVzc2lvbiggb2JqZWN0LmtleSwgdHJ1ZSwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBvYmplY3QsIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHN3aXRjaCggcHJvcGVydHkudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5JZGVudGlmaWVyOlxuICAgICAgICAgICAgcmhzID0gcmlnaHQgPSBwcm9wZXJ0eS5uYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByaWdodCA9IHRoaXMucmVjdXJzZSggcHJvcGVydHksIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGlzUmlnaHRGdW5jdGlvbiA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgU1RBVElDIE1FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEVGVGAsIGxlZnQubmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUklHSFRgLCByaHMgfHwgcmlnaHQubmFtZSApO1xuICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgIGluZGV4LCByZXN1bHQ7XG5cbiAgICAgICAgaWYoICFpc1NhZmUgfHwgKCBsaHMgIT09IHZvaWQgMCAmJiBsaHMgIT09IG51bGwgKSApe1xuICAgICAgICAgICAgaWYoIGlzUmlnaHRGdW5jdGlvbiApe1xuICAgICAgICAgICAgICAgIHJocyA9IHJpZ2h0KCBwcm9wZXJ0eS50eXBlID09PSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uID8gc2NvcGUgOiBsaHMsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSFNgLCBsaHMgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSSFNgLCByaHMgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgICAgICBpZiggKCBpbnRlcnByZXRlci5pc0xlZnRMaXN0IHx8IGludGVycHJldGVyLmlzUmlnaHRMaXN0ICkgJiYgQXJyYXkuaXNBcnJheSggbGhzICkgKXtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGxocy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgICAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGFzc2lnbiggbGhzWyBpbmRleCBdLCByaHMsICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggbGhzLCByaHMsICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogbGhzLCBuYW1lOiByaHMsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS50aHJvd0Vycm9yID0gZnVuY3Rpb24oIG1lc3NhZ2UgKXtcbiAgICB2YXIgZSA9IG5ldyBFcnJvciggbWVzc2FnZSApO1xuICAgIGUuY29sdW1uTnVtYmVyID0gdGhpcy5jb2x1bW47XG4gICAgdGhyb3cgZTtcbiAgICAvL3Rocm93IG5ldyBFcnJvciggbWVzc2FnZSApO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgTGV4ZXIgZnJvbSAnLi9sZXhlcic7XG5pbXBvcnQgQnVpbGRlciBmcm9tICcuL2J1aWxkZXInO1xuaW1wb3J0IEludGVycHJldGVyIGZyb20gJy4vaW50ZXJwcmV0ZXInO1xuaW1wb3J0IGhhc093blByb3BlcnR5IGZyb20gJy4vaGFzLW93bi1wcm9wZXJ0eSc7XG5cbnZhciBsZXhlciA9IG5ldyBMZXhlcigpLFxuICAgIGJ1aWxkZXIgPSBuZXcgQnVpbGRlciggbGV4ZXIgKSxcbiAgICBpbnRyZXByZXRlciA9IG5ldyBJbnRlcnByZXRlciggYnVpbGRlciApLFxuXG4gICAgY2FjaGUgPSBuZXcgTnVsbCgpO1xuXG4vKipcbiAqIEBjbGFzcyBLZXlwYXRoRXhwXG4gKiBAZXh0ZW5kcyBUcmFuc2R1Y2VyXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gcGF0dGVyblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGZsYWdzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEtleXBhdGhFeHAoIHBhdHRlcm4sIGZsYWdzICl7XG4gICAgdHlwZW9mIHBhdHRlcm4gIT09ICdzdHJpbmcnICYmICggcGF0dGVybiA9ICcnICk7XG4gICAgdHlwZW9mIGZsYWdzICE9PSAnc3RyaW5nJyAmJiAoIGZsYWdzID0gJycgKTtcblxuICAgIHZhciB0b2tlbnMgPSBoYXNPd25Qcm9wZXJ0eSggY2FjaGUsIHBhdHRlcm4gKSA/XG4gICAgICAgIGNhY2hlWyBwYXR0ZXJuIF0gOlxuICAgICAgICBjYWNoZVsgcGF0dGVybiBdID0gbGV4ZXIubGV4KCBwYXR0ZXJuICk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyggdGhpcywge1xuICAgICAgICAnZmxhZ3MnOiB7XG4gICAgICAgICAgICB2YWx1ZTogZmxhZ3MsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAnc291cmNlJzoge1xuICAgICAgICAgICAgdmFsdWU6IHBhdHRlcm4sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAnZ2V0dGVyJzoge1xuICAgICAgICAgICAgdmFsdWU6IGludHJlcHJldGVyLmNvbXBpbGUoIHRva2VucywgZmFsc2UgKSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAnc2V0dGVyJzoge1xuICAgICAgICAgICAgdmFsdWU6IGludHJlcHJldGVyLmNvbXBpbGUoIHRva2VucywgdHJ1ZSApLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgIH1cbiAgICB9ICk7XG59XG5cbktleXBhdGhFeHAucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuS2V5cGF0aEV4cC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBLZXlwYXRoRXhwO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5LZXlwYXRoRXhwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiggdGFyZ2V0LCBsb29rdXAgKXtcbiAgICByZXR1cm4gdGhpcy5nZXR0ZXIoIHRhcmdldCwgdW5kZWZpbmVkLCBsb29rdXAgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbktleXBhdGhFeHAucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKCB0YXJnZXQsIGxvb2t1cCApe1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmdldHRlciggdGFyZ2V0LCB1bmRlZmluZWQsIGxvb2t1cCApO1xuICAgIHJldHVybiB0eXBlb2YgcmVzdWx0ICE9PSAndW5kZWZpbmVkJztcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbktleXBhdGhFeHAucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKCB0YXJnZXQsIHZhbHVlLCBsb29rdXAgKXtcbiAgICByZXR1cm4gdGhpcy5zZXR0ZXIoIHRhcmdldCwgdmFsdWUsIGxvb2t1cCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuS2V5cGF0aEV4cC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLmZsYWdzID0gdGhpcy5mbGFncztcbiAgICBqc29uLnNvdXJjZSA9IHRoaXMuc291cmNlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5LZXlwYXRoRXhwLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlO1xufTsiLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0IEtleXBhdGhFeHAgZnJvbSAnLi9leHAnO1xuXG52YXIgcHJvdG9jb2wgPSBuZXcgTnVsbCgpO1xuXG5wcm90b2NvbC5pbml0ICAgID0gJ0BAdHJhbnNkdWNlci9pbml0JztcbnByb3RvY29sLnN0ZXAgICAgPSAnQEB0cmFuc2R1Y2VyL3N0ZXAnO1xucHJvdG9jb2wucmVkdWNlZCA9ICdAQHRyYW5zZHVjZXIvcmVkdWNlZCc7XG5wcm90b2NvbC5yZXN1bHQgID0gJ0BAdHJhbnNkdWNlci9yZXN1bHQnO1xucHJvdG9jb2wudmFsdWUgICA9ICdAQHRyYW5zZHVjZXIvdmFsdWUnO1xuXG4vKipcbiAqIEEgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgVHJhbnNmb21lciBwcm90b2NvbCB1c2VkIGJ5IFRyYW5zZHVjZXJzXG4gKiBAY2xhc3MgVHJhbnNmb3JtZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6RnVuY3Rpb259IHhmIEEgdHJhbnNmb3JtZXJcbiAqL1xuZnVuY3Rpb24gVHJhbnNmb3JtZXIoIHhmICl7XG4gICAgdGhpcy54ZiA9IHhmO1xufVxuXG5UcmFuc2Zvcm1lci5wcm90b3R5cGUgPSBUcmFuc2Zvcm1lci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5UcmFuc2Zvcm1lci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUcmFuc2Zvcm1lcjtcblxuLyoqXG4gKiBAZnVuY3Rpb24gVHJhbnNmb3JtZXIjQEB0cmFuc2R1Y2VyL2luaXRcbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlWyBwcm90b2NvbC5pbml0IF0gPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnhmSW5pdCgpO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gVHJhbnNmb3JtZXIjQEB0cmFuc2R1Y2VyL3N0ZXBcbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlWyBwcm90b2NvbC5zdGVwIF0gPSBmdW5jdGlvbiggdmFsdWUsIGlucHV0ICl7XG4gICAgcmV0dXJuIHRoaXMueGZTdGVwKCB2YWx1ZSwgaW5wdXQgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIFRyYW5zZm9ybWVyI0BAdHJhbnNkdWNlci9yZXN1bHRcbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlWyBwcm90b2NvbC5yZXN1bHQgXSA9IGZ1bmN0aW9uKCB2YWx1ZSApe1xuICAgIHJldHVybiB0aGlzLnhmUmVzdWx0KCB2YWx1ZSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlLnhmSW5pdCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMueGZbIHByb3RvY29sLmluaXQgXSgpO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlLnhmU3RlcCA9IGZ1bmN0aW9uKCB2YWx1ZSwgaW5wdXQgKXtcbiAgICByZXR1cm4gdGhpcy54ZlsgcHJvdG9jb2wuc3RlcCBdKCB2YWx1ZSwgaW5wdXQgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cblRyYW5zZm9ybWVyLnByb3RvdHlwZS54ZlJlc3VsdCA9IGZ1bmN0aW9uKCB2YWx1ZSApe1xuICAgIHJldHVybiB0aGlzLnhmWyBwcm90b2NvbC5yZXN1bHQgXSggdmFsdWUgKTtcbn07XG5cbi8qKlxuICogQGNsYXNzIEtleXBhdGhUcmFuc2Zvcm1lclxuICogQGV4dGVuZHMgVHJhbnNmb3JtZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBwIEEga2V5cGF0aCBwYXR0ZXJuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkZ1bmN0aW9ufSB4ZiBBIHRyYW5zZm9ybWVyXG4gKi9cbmZ1bmN0aW9uIEtleXBhdGhUcmFuc2Zvcm1lciggcCwgeGYgKXtcbiAgICBUcmFuc2Zvcm1lci5jYWxsKCB0aGlzLCB4ZiApO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0tleXBhdGhFeHB9XG4gICAgICovXG4gICAgdGhpcy5rcGV4ID0gbmV3IEtleXBhdGhFeHAoIHAgKTtcbn1cblxuS2V5cGF0aFRyYW5zZm9ybWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRyYW5zZm9ybWVyLnByb3RvdHlwZSApO1xuXG5LZXlwYXRoVHJhbnNmb3JtZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gS2V5cGF0aFRyYW5zZm9ybWVyO1xuXG5LZXlwYXRoVHJhbnNmb3JtZXIucHJvdG90eXBlWyBwcm90b2NvbC5zdGVwIF0gPSBmdW5jdGlvbiggdmFsdWUsIGlucHV0ICl7XG4gICAgcmV0dXJuIHRoaXMueGZTdGVwKCB2YWx1ZSwgdGhpcy5rcGV4LmdldCggaW5wdXQgKSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBwIEEga2V5cGF0aCBwYXR0ZXJuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6RnVuY3Rpb259XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGtleXBhdGgoIHAgKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oIHhmICl7XG4gICAgICAgIHJldHVybiBuZXcgS2V5cGF0aFRyYW5zZm9ybWVyKCBwLCB4ZiApO1xuICAgIH07XG59Il0sIm5hbWVzIjpbIklkZW50aWZpZXIiLCJOdW1lcmljTGl0ZXJhbCIsIk51bGxMaXRlcmFsIiwiUHVuY3R1YXRvciIsIlN0cmluZ0xpdGVyYWwiLCJHcmFtbWFyLklkZW50aWZpZXIiLCJHcmFtbWFyLk51bWVyaWNMaXRlcmFsIiwiR3JhbW1hci5OdWxsTGl0ZXJhbCIsIkdyYW1tYXIuUHVuY3R1YXRvciIsIkdyYW1tYXIuU3RyaW5nTGl0ZXJhbCIsIlRva2VuLk51bGxMaXRlcmFsIiwiVG9rZW4uSWRlbnRpZmllciIsIlRva2VuLlB1bmN0dWF0b3IiLCJUb2tlbi5TdHJpbmdMaXRlcmFsIiwiVG9rZW4uTnVtZXJpY0xpdGVyYWwiLCJBcnJheUV4cHJlc3Npb24iLCJDYWxsRXhwcmVzc2lvbiIsIkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJMaXRlcmFsIiwiTWVtYmVyRXhwcmVzc2lvbiIsIlByb2dyYW0iLCJTZXF1ZW5jZUV4cHJlc3Npb24iLCJTeW50YXguTGl0ZXJhbCIsIlN5bnRheC5NZW1iZXJFeHByZXNzaW9uIiwiU3ludGF4LlByb2dyYW0iLCJTeW50YXguQXJyYXlFeHByZXNzaW9uIiwiU3ludGF4LkNhbGxFeHByZXNzaW9uIiwiU3ludGF4LkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJTeW50YXguSWRlbnRpZmllciIsIlN5bnRheC5TZXF1ZW5jZUV4cHJlc3Npb24iLCJCbG9ja0V4cHJlc3Npb24iLCJFeGlzdGVudGlhbEV4cHJlc3Npb24iLCJMb29rdXBFeHByZXNzaW9uIiwiUmFuZ2VFeHByZXNzaW9uIiwiUm9vdEV4cHJlc3Npb24iLCJTY29wZUV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguUmFuZ2VFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiIsIk5vZGUuQXJyYXlFeHByZXNzaW9uIiwiS2V5cGF0aE5vZGUuQmxvY2tFeHByZXNzaW9uIiwiTm9kZS5DYWxsRXhwcmVzc2lvbiIsIktleXBhdGhOb2RlLkV4aXN0ZW50aWFsRXhwcmVzc2lvbiIsIk5vZGUuRXhwcmVzc2lvblN0YXRlbWVudCIsIk5vZGUuSWRlbnRpZmllciIsIk5vZGUuTnVtZXJpY0xpdGVyYWwiLCJOb2RlLlN0cmluZ0xpdGVyYWwiLCJOb2RlLk51bGxMaXRlcmFsIiwiS2V5cGF0aE5vZGUuTG9va3VwRXhwcmVzc2lvbiIsIk5vZGUuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIiwiTm9kZS5TdGF0aWNNZW1iZXJFeHByZXNzaW9uIiwiTm9kZS5Qcm9ncmFtIiwiS2V5cGF0aE5vZGUuUmFuZ2VFeHByZXNzaW9uIiwiS2V5cGF0aE5vZGUuUm9vdEV4cHJlc3Npb24iLCJOb2RlLlNlcXVlbmNlRXhwcmVzc2lvbiIsImNhY2hlIiwiS2V5cGF0aFN5bnRheC5CbG9ja0V4cHJlc3Npb24iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBOzs7OztBQUtBLFNBQVMsSUFBSSxFQUFFLEVBQUU7QUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxBQUVuQzs7QUNUTyxJQUFJQSxZQUFVLFFBQVEsWUFBWSxDQUFDO0FBQzFDLEFBQU8sSUFBSUMsZ0JBQWMsSUFB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Q0FBQztZQUNoRCxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDaEQsTUFBTTtRQUNWLEtBQUssQ0FBQztZQUNGLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUNoRCxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDaEQsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ2hELE1BQU07UUFDVixLQUFLLENBQUM7WUFDRixNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDaEQsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ2hELE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUNoRCxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDaEQsTUFBTTtRQUNWO1lBQ0ksT0FBTyxLQUFLLEVBQUUsRUFBRTtnQkFDWixNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUs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RSxHQUFHLFVBQVUsS0FBSyxFQUFFO0lBQ3hELE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQztDQUNqQyxDQUFDOzs7OztBQUtGLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVU7SUFDckMsT0FBTyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO0NBQ3JDLENBQUM7Ozs7O0FBS0YsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxLQUFLLEVBQUUsS0FBSyxFQUFFO0lBQ25ELE9BQU8sSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDO0NBQ25ELENBQUM7Ozs7O0FBS0YsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBVSxLQUFLLEVBQUU7SUFDOUMsT0FBTyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQztDQUM5QyxDQUFDOzs7Ozs7OztBQVFGLFNBQVMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRTtJQUNoQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQzs7OztJQUk3QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQ25DOztBQUVELGtCQUFrQixDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFdEUsa0JBQWtCLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQzs7QUFFOUQsa0JBQWtCLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxVQUFVLEtBQUssRUFBRSxLQUFLLEVBQUU7SUFDcEUsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO0NBQ3ZELENBQUM7Ozs7Ozs7QUFPRixBQUFlLFNBQVMsT0FBTyxFQUFFLENBQUMsRUFBRTtJQUNoQyxPQUFPLFVBQVUsRUFBRSxFQUFFO1FBQ2pCLE9BQU8sSUFBSSxrQkFBa0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7S0FDMUMsQ0FBQzssOzssOzsiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==