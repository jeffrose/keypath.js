(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.KeypathExp = factory());
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

return KeypathExp;

})));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5cGF0aC1leHAtdW1kLmpzIiwic291cmNlcyI6WyJudWxsLmpzIiwiZ3JhbW1hci5qcyIsInRva2VuLmpzIiwibGV4ZXIuanMiLCJzeW50YXguanMiLCJub2RlLmpzIiwia2V5cGF0aC1zeW50YXguanMiLCJoYXMtb3duLXByb3BlcnR5LmpzIiwia2V5cGF0aC1ub2RlLmpzIiwiYnVpbGRlci5qcyIsImludGVycHJldGVyLmpzIiwidHJhbnNkdWNlci5qcyIsImtleXBhdGgtZXhwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIFwiY2xlYW5cIiwgZW1wdHkgY29udGFpbmVyLiBJbnN0YW50aWF0aW5nIHRoaXMgaXMgZmFzdGVyIHRoYW4gZXhwbGljaXRseSBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKCBudWxsIClgLlxuICogQGNsYXNzIE51bGxcbiAqIEBleHRlbmRzIGV4dGVybmFsOm51bGxcbiAqL1xuZnVuY3Rpb24gTnVsbCgpe31cbk51bGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuTnVsbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgTnVsbDtcblxuZXhwb3J0IHsgTnVsbCBhcyBkZWZhdWx0IH07IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnQgdmFyIElkZW50aWZpZXIgICAgICA9ICdJZGVudGlmaWVyJztcbmV4cG9ydCB2YXIgTnVtZXJpY0xpdGVyYWwgID0gJ051bWVyaWMnO1xuZXhwb3J0IHZhciBOdWxsTGl0ZXJhbCAgICAgPSAnTnVsbCc7XG5leHBvcnQgdmFyIFB1bmN0dWF0b3IgICAgICA9ICdQdW5jdHVhdG9yJztcbmV4cG9ydCB2YXIgU3RyaW5nTGl0ZXJhbCAgID0gJ1N0cmluZyc7IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgR3JhbW1hciBmcm9tICcuL2dyYW1tYXInO1xuXG52YXIgdG9rZW5JZCA9IDA7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflRva2VuXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdHlwZSBUaGUgdHlwZSBvZiB0aGUgdG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIHRva2VuXG4gKi9cbmZ1bmN0aW9uIFRva2VuKCB0eXBlLCB2YWx1ZSApe1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gTGV4ZXJ+VG9rZW4jaWRcbiAgICAgKi9cbiAgICB0aGlzLmlkID0gKyt0b2tlbklkO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gTGV4ZXJ+VG9rZW4jdHlwZVxuICAgICAqL1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBMZXhlcn5Ub2tlbiN2YWx1ZVxuICAgICAqL1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuVG9rZW4ucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuVG9rZW4ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVG9rZW47XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHRva2VuXG4gKi9cblRva2VuLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24udHlwZSA9IHRoaXMudHlwZTtcbiAgICBqc29uLnZhbHVlID0gdGhpcy52YWx1ZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlblxuICovXG5Ub2tlbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBTdHJpbmcoIHRoaXMudmFsdWUgKTtcbn07XG5cbi8qKlxuICogQGNsYXNzIExleGVyfklkZW50aWZpZXJcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElkZW50aWZpZXIoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5JZGVudGlmaWVyLCB2YWx1ZSApO1xufVxuXG5JZGVudGlmaWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5JZGVudGlmaWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IElkZW50aWZpZXI7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfk51bWVyaWNMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdW1lcmljTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLk51bWVyaWNMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVtZXJpY0xpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfk51bGxMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdWxsTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLk51bGxMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuTnVsbExpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVsbExpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflB1bmN0dWF0b3JcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFB1bmN0dWF0b3IoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5QdW5jdHVhdG9yLCB2YWx1ZSApO1xufVxuXG5QdW5jdHVhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5QdW5jdHVhdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFB1bmN0dWF0b3I7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflN0cmluZ0xpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0cmluZ0xpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5TdHJpbmdMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0cmluZ0xpdGVyYWw7IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgVG9rZW4gZnJvbSAnLi90b2tlbic7XG5cbnZhciBsZXhlclByb3RvdHlwZTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gTGV4ZXJ+aXNJZGVudGlmaWVyXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gY2hhclxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBjaGFyYWN0ZXIgaXMgYW4gaWRlbnRpZmllciBjaGFyYWN0ZXJcbiAqL1xuZnVuY3Rpb24gaXNJZGVudGlmaWVyKCBjaGFyICl7XG4gICAgcmV0dXJuICdhJyA8PSBjaGFyICYmIGNoYXIgPD0gJ3onIHx8ICdBJyA8PSBjaGFyICYmIGNoYXIgPD0gJ1onIHx8ICdfJyA9PT0gY2hhciB8fCBjaGFyID09PSAnJCc7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIExleGVyfmlzTnVtZXJpY1xuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGNoYXJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgY2hhcmFjdGVyIGlzIGEgbnVtZXJpYyBjaGFyYWN0ZXJcbiAqL1xuZnVuY3Rpb24gaXNOdW1lcmljKCBjaGFyICl7XG4gICAgcmV0dXJuICcwJyA8PSBjaGFyICYmIGNoYXIgPD0gJzknO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBMZXhlcn5pc1B1bmN0dWF0b3JcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBjaGFyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGNoYXJhY3RlciBpcyBhIHB1bmN0dWF0b3IgY2hhcmFjdGVyXG4gKi9cbmZ1bmN0aW9uIGlzUHVuY3R1YXRvciggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSAnLicgfHwgY2hhciA9PT0gJygnIHx8IGNoYXIgPT09ICcpJyB8fCBjaGFyID09PSAnWycgfHwgY2hhciA9PT0gJ10nIHx8IGNoYXIgPT09ICd7JyB8fCBjaGFyID09PSAnfScgfHwgY2hhciA9PT0gJywnIHx8IGNoYXIgPT09ICclJyB8fCBjaGFyID09PSAnPycgfHwgY2hhciA9PT0gJzsnIHx8IGNoYXIgPT09ICd+Jztcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gTGV4ZXJ+aXNRdW90ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGNoYXJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgY2hhcmFjdGVyIGlzIGEgcXVvdGUgY2hhcmFjdGVyXG4gKi9cbmZ1bmN0aW9uIGlzUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJ1wiJyB8fCBjaGFyID09PSBcIidcIjtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gTGV4ZXJ+aXNXaGl0ZXNwYWNlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gY2hhclxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBjaGFyYWN0ZXIgaXMgYSB3aGl0ZXNwYWNlIGNoYXJhY3RlclxuICovXG5mdW5jdGlvbiBpc1doaXRlc3BhY2UoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJyAnIHx8IGNoYXIgPT09ICdcXHInIHx8IGNoYXIgPT09ICdcXHQnIHx8IGNoYXIgPT09ICdcXG4nIHx8IGNoYXIgPT09ICdcXHYnIHx8IGNoYXIgPT09ICdcXHUwMEEwJztcbn1cblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTGV4ZXIoKXtcbiAgICB0aGlzLmJ1ZmZlciA9ICcnO1xufVxuXG5sZXhlclByb3RvdHlwZSA9IExleGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbmxleGVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGV4ZXI7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdGV4dFxuICovXG5sZXhlclByb3RvdHlwZS5sZXggPSBmdW5jdGlvbiggdGV4dCApe1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnJ1xuICAgICAqL1xuICAgIHRoaXMuYnVmZmVyID0gdGV4dDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5pbmRleCA9IDA7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8TGV4ZXJ+VG9rZW4+fVxuICAgICAqL1xuICAgIHRoaXMudG9rZW5zID0gW107XG5cbiAgICB2YXIgbGVuZ3RoID0gdGhpcy5idWZmZXIubGVuZ3RoLFxuICAgICAgICB3b3JkID0gJycsXG4gICAgICAgIGNoYXIsIHRva2VuLCBxdW90ZTtcblxuICAgIHdoaWxlKCB0aGlzLmluZGV4IDwgbGVuZ3RoICl7XG4gICAgICAgIGNoYXIgPSB0aGlzLmJ1ZmZlclsgdGhpcy5pbmRleCBdO1xuXG4gICAgICAgIC8vIElkZW50aWZpZXJcbiAgICAgICAgaWYoIGlzSWRlbnRpZmllciggY2hhciApICl7XG4gICAgICAgICAgICB3b3JkID0gdGhpcy5yZWFkKCBmdW5jdGlvbiggY2hhciApe1xuICAgICAgICAgICAgICAgIHJldHVybiAhaXNJZGVudGlmaWVyKCBjaGFyICkgJiYgIWlzTnVtZXJpYyggY2hhciApO1xuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB0b2tlbiA9IHdvcmQgPT09ICdudWxsJyA/XG4gICAgICAgICAgICAgICAgbmV3IFRva2VuLk51bGxMaXRlcmFsKCB3b3JkICkgOlxuICAgICAgICAgICAgICAgIG5ldyBUb2tlbi5JZGVudGlmaWVyKCB3b3JkICk7XG4gICAgICAgICAgICB0aGlzLnRva2Vucy5wdXNoKCB0b2tlbiApO1xuXG4gICAgICAgIC8vIFB1bmN0dWF0b3JcbiAgICAgICAgfSBlbHNlIGlmKCBpc1B1bmN0dWF0b3IoIGNoYXIgKSApe1xuICAgICAgICAgICAgdG9rZW4gPSBuZXcgVG9rZW4uUHVuY3R1YXRvciggY2hhciApO1xuICAgICAgICAgICAgdGhpcy50b2tlbnMucHVzaCggdG9rZW4gKTtcblxuICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgIC8vIFF1b3RlZCBTdHJpbmdcbiAgICAgICAgfSBlbHNlIGlmKCBpc1F1b3RlKCBjaGFyICkgKXtcbiAgICAgICAgICAgIHF1b3RlID0gY2hhcjtcblxuICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgICAgICB3b3JkID0gdGhpcy5yZWFkKCBmdW5jdGlvbiggY2hhciApe1xuICAgICAgICAgICAgICAgIHJldHVybiBjaGFyID09PSBxdW90ZTtcbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgdG9rZW4gPSBuZXcgVG9rZW4uU3RyaW5nTGl0ZXJhbCggcXVvdGUgKyB3b3JkICsgcXVvdGUgKTtcbiAgICAgICAgICAgIHRoaXMudG9rZW5zLnB1c2goIHRva2VuICk7XG5cbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICAvLyBOdW1lcmljXG4gICAgICAgIH0gZWxzZSBpZiggaXNOdW1lcmljKCBjaGFyICkgKXtcbiAgICAgICAgICAgIHdvcmQgPSB0aGlzLnJlYWQoIGZ1bmN0aW9uKCBjaGFyICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFpc051bWVyaWMoIGNoYXIgKTtcbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgdG9rZW4gPSBuZXcgVG9rZW4uTnVtZXJpY0xpdGVyYWwoIHdvcmQgKTtcbiAgICAgICAgICAgIHRoaXMudG9rZW5zLnB1c2goIHRva2VuICk7XG5cbiAgICAgICAgLy8gV2hpdGVzcGFjZVxuICAgICAgICB9IGVsc2UgaWYoIGlzV2hpdGVzcGFjZSggY2hhciApICl7XG4gICAgICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgLy8gRXJyb3JcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggJ1wiJyArIGNoYXIgKyAnXCIgaXMgYW4gaW52YWxpZCBjaGFyYWN0ZXInICk7XG4gICAgICAgIH1cblxuICAgICAgICB3b3JkID0gJyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudG9rZW5zO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6ZnVuY3Rpb259IHVudGlsIEEgY29uZGl0aW9uIHRoYXQgd2hlbiBtZXQgd2lsbCBzdG9wIHRoZSByZWFkaW5nIG9mIHRoZSBidWZmZXJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IFRoZSBwb3J0aW9uIG9mIHRoZSBidWZmZXIgcmVhZFxuICovXG5sZXhlclByb3RvdHlwZS5yZWFkID0gZnVuY3Rpb24oIHVudGlsICl7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleCxcbiAgICAgICAgY2hhcjtcblxuICAgIHdoaWxlKCB0aGlzLmluZGV4IDwgdGhpcy5idWZmZXIubGVuZ3RoICl7XG4gICAgICAgIGNoYXIgPSB0aGlzLmJ1ZmZlclsgdGhpcy5pbmRleCBdO1xuXG4gICAgICAgIGlmKCB1bnRpbCggY2hhciApICl7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5idWZmZXIuc2xpY2UoIHN0YXJ0LCB0aGlzLmluZGV4ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsZXhlclxuICovXG5sZXhlclByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24uYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAganNvbi50b2tlbnMgPSB0aGlzLnRva2Vucy5tYXAoIGZ1bmN0aW9uKCB0b2tlbiApe1xuICAgICAgICByZXR1cm4gdG9rZW4udG9KU09OKCk7XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGxleGVyXG4gKi9cbmxleGVyUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5idWZmZXI7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IHZhciBBcnJheUV4cHJlc3Npb24gICAgICAgPSAnQXJyYXlFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgQ2FsbEV4cHJlc3Npb24gICAgICAgID0gJ0NhbGxFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgRXhwcmVzc2lvblN0YXRlbWVudCAgID0gJ0V4cHJlc3Npb25TdGF0ZW1lbnQnO1xuZXhwb3J0IHZhciBJZGVudGlmaWVyICAgICAgICAgICAgPSAnSWRlbnRpZmllcic7XG5leHBvcnQgdmFyIExpdGVyYWwgICAgICAgICAgICAgICA9ICdMaXRlcmFsJztcbmV4cG9ydCB2YXIgTWVtYmVyRXhwcmVzc2lvbiAgICAgID0gJ01lbWJlckV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBQcm9ncmFtICAgICAgICAgICAgICAgPSAnUHJvZ3JhbSc7XG5leHBvcnQgdmFyIFNlcXVlbmNlRXhwcmVzc2lvbiAgICA9ICdTZXF1ZW5jZUV4cHJlc3Npb24nOyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIFN5bnRheCBmcm9tICcuL3N5bnRheCc7XG5cbnZhciBub2RlSWQgPSAwLFxuICAgIGxpdGVyYWxUeXBlcyA9ICdib29sZWFuIG51bWJlciBzdHJpbmcnLnNwbGl0KCAnICcgKTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5Ob2RlXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdHlwZSBBIG5vZGUgdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTm9kZSggdHlwZSApe1xuXG4gICAgaWYoIHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJyApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICd0eXBlIG11c3QgYmUgYSBzdHJpbmcnLCBUeXBlRXJyb3IgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEJ1aWxkZXJ+Tm9kZSNpZFxuICAgICAqL1xuICAgIHRoaXMuaWQgPSArK25vZGVJZDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IEJ1aWxkZXJ+Tm9kZSN0eXBlXG4gICAgICovXG4gICAgdGhpcy50eXBlID0gdHlwZTtcbn1cblxuTm9kZS5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5Ob2RlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE5vZGU7XG5cbk5vZGUucHJvdG90eXBlLnRocm93RXJyb3IgPSBmdW5jdGlvbiggbWVzc2FnZSwgRXJyb3JDbGFzcyApe1xuICAgIHR5cGVvZiBFcnJvckNsYXNzID09PSAndW5kZWZpbmVkJyAmJiAoIEVycm9yQ2xhc3MgPSBFcnJvciApO1xuICAgIHRocm93IG5ldyBFcnJvckNsYXNzKCBtZXNzYWdlICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBub2RlXG4gKi9cbk5vZGUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi50eXBlID0gdGhpcy50eXBlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG5vZGVcbiAqL1xuTm9kZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBTdHJpbmcoIHRoaXMudHlwZSApO1xufTtcblxuTm9kZS5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuaWQ7XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+Tm9kZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGV4cHJlc3Npb25UeXBlIEEgbm9kZSB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFeHByZXNzaW9uKCBleHByZXNzaW9uVHlwZSApe1xuICAgIE5vZGUuY2FsbCggdGhpcywgZXhwcmVzc2lvblR5cGUgKTtcbn1cblxuRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBOb2RlLnByb3RvdHlwZSApO1xuXG5FeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEV4cHJlc3Npb247XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+TGl0ZXJhbFxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpudW1iZXJ9IHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgbGl0ZXJhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gTGl0ZXJhbCggdmFsdWUsIHJhdyApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LkxpdGVyYWwgKTtcblxuICAgIGlmKCBsaXRlcmFsVHlwZXMuaW5kZXhPZiggdHlwZW9mIHZhbHVlICkgPT09IC0xICYmIHZhbHVlICE9PSBudWxsICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ3ZhbHVlIG11c3QgYmUgYSBib29sZWFuLCBudW1iZXIsIHN0cmluZywgb3IgbnVsbCcsIFR5cGVFcnJvciApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLnJhdyA9IHJhdztcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuXG5MaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkxpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGl0ZXJhbDtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGl0ZXJhbFxuICovXG5MaXRlcmFsLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ucmF3ID0gdGhpcy5yYXc7XG4gICAganNvbi52YWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGl0ZXJhbFxuICovXG5MaXRlcmFsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMucmF3O1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5NZW1iZXJFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBvYmplY3RcbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufEJ1aWxkZXJ+SWRlbnRpZmllcn0gcHJvcGVydHlcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gY29tcHV0ZWQ9ZmFsc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHksIGNvbXB1dGVkICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguTWVtYmVyRXhwcmVzc2lvbiApO1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5FeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+RXhwcmVzc2lvbnxCdWlsZGVyfklkZW50aWZpZXJ9XG4gICAgICovXG4gICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOmJvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5jb21wdXRlZCA9IGNvbXB1dGVkIHx8IGZhbHNlO1xufVxuXG5NZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbk1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVtYmVyRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWVtYmVyIGV4cHJlc3Npb25cbiAqL1xuTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLm9iamVjdCAgID0gdGhpcy5vYmplY3QudG9KU09OKCk7XG4gICAganNvbi5wcm9wZXJ0eSA9IHRoaXMucHJvcGVydHkudG9KU09OKCk7XG4gICAganNvbi5jb21wdXRlZCA9IHRoaXMuY29tcHV0ZWQ7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+UHJvZ3JhbVxuICogQGV4dGVuZHMgQnVpbGRlcn5Ob2RlXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5PEJ1aWxkZXJ+U3RhdGVtZW50Pn0gYm9keVxuICovXG5leHBvcnQgZnVuY3Rpb24gUHJvZ3JhbSggYm9keSApe1xuICAgIE5vZGUuY2FsbCggdGhpcywgU3ludGF4LlByb2dyYW0gKTtcblxuICAgIGlmKCAhQXJyYXkuaXNBcnJheSggYm9keSApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdib2R5IG11c3QgYmUgYW4gYXJyYXknICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6QXJyYXk8QnVpbGRlcn5TdGF0ZW1lbnQ+fVxuICAgICAqL1xuICAgIHRoaXMuYm9keSA9IGJvZHkgfHwgW107XG4gICAgdGhpcy5zb3VyY2VUeXBlID0gJ3NjcmlwdCc7XG59XG5cblByb2dyYW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTm9kZS5wcm90b3R5cGUgKTtcblxuUHJvZ3JhbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQcm9ncmFtO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwcm9ncmFtXG4gKi9cblByb2dyYW0ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5ib2R5ID0gdGhpcy5ib2R5Lm1hcCggZnVuY3Rpb24oIG5vZGUgKXtcbiAgICAgICAgcmV0dXJuIG5vZGUudG9KU09OKCk7XG4gICAgfSApO1xuICAgIGpzb24uc291cmNlVHlwZSA9IHRoaXMuc291cmNlVHlwZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5TdGF0ZW1lbnRcbiAqIEBleHRlbmRzIEJ1aWxkZXJ+Tm9kZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHN0YXRlbWVudFR5cGUgQSBub2RlIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0YXRlbWVudCggc3RhdGVtZW50VHlwZSApe1xuICAgIE5vZGUuY2FsbCggdGhpcywgc3RhdGVtZW50VHlwZSApO1xufVxuXG5TdGF0ZW1lbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTm9kZS5wcm90b3R5cGUgKTtcblxuU3RhdGVtZW50LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0YXRlbWVudDtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5BcnJheUV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn0gZWxlbWVudHMgQSBsaXN0IG9mIGV4cHJlc3Npb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcnJheUV4cHJlc3Npb24oIGVsZW1lbnRzICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguQXJyYXlFeHByZXNzaW9uICk7XG5cbiAgICAvL2lmKCAhKCBBcnJheS5pc0FycmF5KCBlbGVtZW50cyApICkgJiYgISggZWxlbWVudHMgaW5zdGFuY2VvZiBSYW5nZUV4cHJlc3Npb24gKSApe1xuICAgIC8vICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdlbGVtZW50cyBtdXN0IGJlIGEgbGlzdCBvZiBleHByZXNzaW9ucyBvciBhbiBpbnN0YW5jZSBvZiByYW5nZSBleHByZXNzaW9uJyApO1xuICAgIC8vfVxuXG4gICAgLypcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdlbGVtZW50cycsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oIGVsZW1lbnRzICl7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgdGhpc1sgaW5kZXggXSA9IGVsZW1lbnRzWyBpbmRleCBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSApO1xuICAgICovXG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudHM7XG59XG5cbkFycmF5RXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5BcnJheUV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQXJyYXlFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhcnJheSBleHByZXNzaW9uXG4gKi9cbkFycmF5RXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBpZiggQXJyYXkuaXNBcnJheSggdGhpcy5lbGVtZW50cyApICl7XG4gICAgICAgIGpzb24uZWxlbWVudHMgPSB0aGlzLmVsZW1lbnRzLm1hcCggZnVuY3Rpb24oIGVsZW1lbnQgKXtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnRvSlNPTigpO1xuICAgICAgICB9ICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAganNvbi5lbGVtZW50cyA9IHRoaXMuZWxlbWVudHMudG9KU09OKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkNhbGxFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBjYWxsZWVcbiAqIEBwYXJhbSB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPn0gYXJnc1xuICovXG5leHBvcnQgZnVuY3Rpb24gQ2FsbEV4cHJlc3Npb24oIGNhbGxlZSwgYXJncyApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LkNhbGxFeHByZXNzaW9uICk7XG5cbiAgICBpZiggIUFycmF5LmlzQXJyYXkoIGFyZ3MgKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYXJndW1lbnRzIG11c3QgYmUgYW4gYXJyYXknICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5FeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMuY2FsbGVlID0gY2FsbGVlO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj59XG4gICAgICovXG4gICAgdGhpcy5hcmd1bWVudHMgPSBhcmdzO1xufVxuXG5DYWxsRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5DYWxsRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDYWxsRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgY2FsbCBleHByZXNzaW9uXG4gKi9cbkNhbGxFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uY2FsbGVlICAgID0gdGhpcy5jYWxsZWUudG9KU09OKCk7XG4gICAganNvbi5hcmd1bWVudHMgPSB0aGlzLmFyZ3VtZW50cy5tYXAoIGZ1bmN0aW9uKCBub2RlICl7XG4gICAgICAgIHJldHVybiBub2RlLnRvSlNPTigpO1xuICAgIH0gKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5Db21wdXRlZE1lbWJlckV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+TWVtYmVyRXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IG9iamVjdFxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHkgKXtcbiAgICBpZiggISggcHJvcGVydHkgaW5zdGFuY2VvZiBFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3Byb3BlcnR5IG11c3QgYmUgYW4gZXhwcmVzc2lvbiB3aGVuIGNvbXB1dGVkIGlzIHRydWUnICk7XG4gICAgfVxuXG4gICAgTWVtYmVyRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5LCB0cnVlICk7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIEJ1aWxkZXJ+Q29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uI2NvbXB1dGVkPXRydWVcbiAgICAgKi9cbn1cblxuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb21wdXRlZE1lbWJlckV4cHJlc3Npb247XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+RXhwcmVzc2lvblN0YXRlbWVudFxuICogQGV4dGVuZHMgQnVpbGRlcn5TdGF0ZW1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEV4cHJlc3Npb25TdGF0ZW1lbnQoIGV4cHJlc3Npb24gKXtcbiAgICBTdGF0ZW1lbnQuY2FsbCggdGhpcywgU3ludGF4LkV4cHJlc3Npb25TdGF0ZW1lbnQgKTtcblxuICAgIGlmKCAhKCBleHByZXNzaW9uIGluc3RhbmNlb2YgRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdhcmd1bWVudCBtdXN0IGJlIGFuIGV4cHJlc3Npb24nICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5FeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMuZXhwcmVzc2lvbiA9IGV4cHJlc3Npb247XG59XG5cbkV4cHJlc3Npb25TdGF0ZW1lbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggU3RhdGVtZW50LnByb3RvdHlwZSApO1xuXG5FeHByZXNzaW9uU3RhdGVtZW50LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEV4cHJlc3Npb25TdGF0ZW1lbnQ7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGV4cHJlc3Npb24gc3RhdGVtZW50XG4gKi9cbkV4cHJlc3Npb25TdGF0ZW1lbnQucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5leHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uLnRvSlNPTigpO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfklkZW50aWZpZXJcbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGlkZW50aWZpZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElkZW50aWZpZXIoIG5hbWUgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5JZGVudGlmaWVyICk7XG5cbiAgICBpZiggdHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICduYW1lIG11c3QgYmUgYSBzdHJpbmcnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG59XG5cbklkZW50aWZpZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuSWRlbnRpZmllci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJZGVudGlmaWVyO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBpZGVudGlmaWVyXG4gKi9cbklkZW50aWZpZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5uYW1lID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gTnVsbExpdGVyYWwoIHJhdyApe1xuICAgIGlmKCByYXcgIT09ICdudWxsJyApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncmF3IGlzIG5vdCBhIG51bGwgbGl0ZXJhbCcgKTtcbiAgICB9XG5cbiAgICBMaXRlcmFsLmNhbGwoIHRoaXMsIG51bGwsIHJhdyApO1xufVxuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBMaXRlcmFsLnByb3RvdHlwZSApO1xuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdWxsTGl0ZXJhbDtcblxuZXhwb3J0IGZ1bmN0aW9uIE51bWVyaWNMaXRlcmFsKCByYXcgKXtcbiAgICB2YXIgdmFsdWUgPSBwYXJzZUZsb2F0KCByYXcgKTtcblxuICAgIGlmKCBpc05hTiggdmFsdWUgKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncmF3IGlzIG5vdCBhIG51bWVyaWMgbGl0ZXJhbCcgKTtcbiAgICB9XG5cbiAgICBMaXRlcmFsLmNhbGwoIHRoaXMsIHZhbHVlLCByYXcgKTtcbn1cblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTGl0ZXJhbC5wcm90b3R5cGUgKTtcblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVtZXJpY0xpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+U2VxdWVuY2VFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259IGV4cHJlc3Npb25zIFRoZSBleHByZXNzaW9ucyBpbiB0aGUgc2VxdWVuY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNlcXVlbmNlRXhwcmVzc2lvbiggZXhwcmVzc2lvbnMgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5TZXF1ZW5jZUV4cHJlc3Npb24gKTtcblxuICAgIC8vaWYoICEoIEFycmF5LmlzQXJyYXkoIGV4cHJlc3Npb25zICkgKSAmJiAhKCBleHByZXNzaW9ucyBpbnN0YW5jZW9mIFJhbmdlRXhwcmVzc2lvbiApICl7XG4gICAgLy8gICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2V4cHJlc3Npb25zIG11c3QgYmUgYSBsaXN0IG9mIGV4cHJlc3Npb25zIG9yIGFuIGluc3RhbmNlIG9mIHJhbmdlIGV4cHJlc3Npb24nICk7XG4gICAgLy99XG5cbiAgICAvKlxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ2V4cHJlc3Npb25zJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiggZXhwcmVzc2lvbnMgKXtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoID0gZXhwcmVzc2lvbnMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICB0aGlzWyBpbmRleCBdID0gZXhwcmVzc2lvbnNbIGluZGV4IF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9ICk7XG4gICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMuZXhwcmVzc2lvbnMgPSBleHByZXNzaW9ucztcbn1cblxuU2VxdWVuY2VFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblNlcXVlbmNlRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTZXF1ZW5jZUV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHNlcXVlbmNlIGV4cHJlc3Npb25cbiAqL1xuU2VxdWVuY2VFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGlmKCBBcnJheS5pc0FycmF5KCB0aGlzLmV4cHJlc3Npb25zICkgKXtcbiAgICAgICAganNvbi5leHByZXNzaW9ucyA9IHRoaXMuZXhwcmVzc2lvbnMubWFwKCBmdW5jdGlvbiggZXhwcmVzc2lvbiApe1xuICAgICAgICAgICAgcmV0dXJuIGV4cHJlc3Npb24udG9KU09OKCk7XG4gICAgICAgIH0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBqc29uLmV4cHJlc3Npb25zID0gdGhpcy5leHByZXNzaW9ucy50b0pTT04oKTtcbiAgICB9XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+U3RhdGljTWVtYmVyRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5NZW1iZXJFeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gb2JqZWN0XG4gKiBAcGFyYW0ge0J1aWxkZXJ+SWRlbnRpZmllcn0gcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0YXRpY01lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHkgKXtcbiAgICAvL2lmKCAhKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIElkZW50aWZpZXIgKSAmJiAhKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIExvb2t1cEV4cHJlc3Npb24gKSAmJiAhKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIEJsb2NrRXhwcmVzc2lvbiApICl7XG4gICAgLy8gICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3Byb3BlcnR5IG11c3QgYmUgYW4gaWRlbnRpZmllciwgZXZhbCBleHByZXNzaW9uLCBvciBsb29rdXAgZXhwcmVzc2lvbiB3aGVuIGNvbXB1dGVkIGlzIGZhbHNlJyApO1xuICAgIC8vfVxuXG4gICAgTWVtYmVyRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5LCBmYWxzZSApO1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciBCdWlsZGVyflN0YXRpY01lbWJlckV4cHJlc3Npb24jY29tcHV0ZWQ9ZmFsc2VcbiAgICAgKi9cbn1cblxuU3RhdGljTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5TdGF0aWNNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0YXRpY01lbWJlckV4cHJlc3Npb247XG5cbmV4cG9ydCBmdW5jdGlvbiBTdHJpbmdMaXRlcmFsKCByYXcgKXtcbiAgICBpZiggcmF3WyAwIF0gIT09ICdcIicgJiYgcmF3WyAwIF0gIT09IFwiJ1wiICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyYXcgaXMgbm90IGEgc3RyaW5nIGxpdGVyYWwnICk7XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlID0gcmF3LnN1YnN0cmluZyggMSwgcmF3Lmxlbmd0aCAtIDEgKTtcblxuICAgIExpdGVyYWwuY2FsbCggdGhpcywgdmFsdWUsIHJhdyApO1xufVxuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExpdGVyYWwucHJvdG90eXBlICk7XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RyaW5nTGl0ZXJhbDsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydCB2YXIgQmxvY2tFeHByZXNzaW9uICAgICAgID0gJ0Jsb2NrRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIEV4aXN0ZW50aWFsRXhwcmVzc2lvbiA9ICdFeGlzdGVudGlhbEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBMb29rdXBFeHByZXNzaW9uICAgICAgPSAnTG9va3VwRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIFJhbmdlRXhwcmVzc2lvbiAgICAgICA9ICdSYW5nZUV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBSb290RXhwcmVzc2lvbiAgICAgICAgPSAnUm9vdEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBTY29wZUV4cHJlc3Npb24gICAgICAgPSAnU2NvcGVFeHByZXNzaW9uJzsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHsqfSBvYmplY3RcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBwcm9wZXJ0eVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eSggb2JqZWN0LCBwcm9wZXJ0eSApe1xuICAgIHJldHVybiBfaGFzT3duUHJvcGVydHkuY2FsbCggb2JqZWN0LCBwcm9wZXJ0eSApO1xufSIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLCBFeHByZXNzaW9uLCBJZGVudGlmaWVyLCBOb2RlLCBMaXRlcmFsIH0gZnJvbSAnLi9ub2RlJztcbmltcG9ydCAqIGFzIEtleXBhdGhTeW50YXggZnJvbSAnLi9rZXlwYXRoLXN5bnRheCc7XG5pbXBvcnQgaGFzT3duUHJvcGVydHkgZnJvbSAnLi9oYXMtb3duLXByb3BlcnR5J1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfk9wZXJhdG9yRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZXhwcmVzc2lvblR5cGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBvcGVyYXRvclxuICovXG5mdW5jdGlvbiBPcGVyYXRvckV4cHJlc3Npb24oIGV4cHJlc3Npb25UeXBlLCBvcGVyYXRvciApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgZXhwcmVzc2lvblR5cGUgKTtcblxuICAgIHRoaXMub3BlcmF0b3IgPSBvcGVyYXRvcjtcbn1cblxuT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbk9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBPcGVyYXRvckV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIG9wZXJhdG9yIGV4cHJlc3Npb25cbiAqL1xuT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ub3BlcmF0b3IgPSB0aGlzLm9wZXJhdG9yO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gQmxvY2tFeHByZXNzaW9uKCBib2R5ICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCAnQmxvY2tFeHByZXNzaW9uJyApO1xuXG4gICAgLypcbiAgICBpZiggISggZXhwcmVzc2lvbiBpbnN0YW5jZW9mIEV4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYXJndW1lbnQgbXVzdCBiZSBhbiBleHByZXNzaW9uJyApO1xuICAgIH1cbiAgICAqL1xuXG4gICAgdGhpcy5ib2R5ID0gYm9keTtcbn1cblxuQmxvY2tFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkJsb2NrRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCbG9ja0V4cHJlc3Npb247XG5cbmV4cG9ydCBmdW5jdGlvbiBFeGlzdGVudGlhbEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKXtcbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb24sICc/JyApO1xuXG4gICAgdGhpcy5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbn1cblxuRXhpc3RlbnRpYWxFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuRXhpc3RlbnRpYWxFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEV4aXN0ZW50aWFsRXhwcmVzc2lvbjtcblxuRXhpc3RlbnRpYWxFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5leHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uLnRvSlNPTigpO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gTG9va3VwRXhwcmVzc2lvbigga2V5ICl7XG4gICAgaWYoICEoIGtleSBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISgga2V5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2tleSBtdXN0IGJlIGEgbGl0ZXJhbCwgaWRlbnRpZmllciwgb3IgZXZhbCBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb24sICclJyApO1xuXG4gICAgdGhpcy5rZXkgPSBrZXk7XG59XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5Mb29rdXBFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvb2t1cEV4cHJlc3Npb247XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciArIHRoaXMua2V5O1xufTtcblxuTG9va3VwRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ua2V5ID0gdGhpcy5rZXk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk9wZXJhdG9yRXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IGxlZnRcbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSByaWdodFxuICovXG5leHBvcnQgZnVuY3Rpb24gUmFuZ2VFeHByZXNzaW9uKCBsZWZ0LCByaWdodCApe1xuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbiwgJy4uJyApO1xuXG4gICAgaWYoICEoIGxlZnQgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgbGVmdCAhPT0gbnVsbCApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGVmdCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGxpdGVyYWwgb3IgbnVsbCcgKTtcbiAgICB9XG5cbiAgICBpZiggISggcmlnaHQgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgcmlnaHQgIT09IG51bGwgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JpZ2h0IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgbGl0ZXJhbCBvciBudWxsJyApO1xuICAgIH1cblxuICAgIGlmKCBsZWZ0ID09PSBudWxsICYmIHJpZ2h0ID09PSBudWxsICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsZWZ0IGFuZCByaWdodCBjYW5ub3QgZXF1YWwgbnVsbCBhdCB0aGUgc2FtZSB0aW1lJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+TGl0ZXJhbH0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jbGVmdFxuICAgICAqL1xuICAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uIzBcbiAgICAgKi9cbiAgICB0aGlzWyAwIF0gPSB0aGlzLmxlZnQgPSBsZWZ0O1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5MaXRlcmFsfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiNyaWdodFxuICAgICAqL1xuICAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uIzFcbiAgICAgKi9cbiAgICB0aGlzWyAxIF0gPSB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uI2xlbmd0aD0yXG4gICAgICovXG4gICAgdGhpcy5sZW5ndGggPSAyO1xufVxuXG5SYW5nZUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJhbmdlRXhwcmVzc2lvbjtcblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5sZWZ0ID0gdGhpcy5sZWZ0ICE9PSBudWxsID9cbiAgICAgICAgdGhpcy5sZWZ0LnRvSlNPTigpIDpcbiAgICAgICAgdGhpcy5sZWZ0O1xuICAgIGpzb24ucmlnaHQgPSB0aGlzLnJpZ2h0ICE9PSBudWxsID9cbiAgICAgICAgdGhpcy5yaWdodC50b0pTT04oKSA6XG4gICAgICAgIHRoaXMucmlnaHQ7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cblJhbmdlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmxlZnQudG9TdHJpbmcoKSArIHRoaXMub3BlcmF0b3IgKyB0aGlzLnJpZ2h0LnRvU3RyaW5nKCk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHksIGNhcmRpbmFsaXR5ICl7XG4gICAgQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLmNhbGwoIHRoaXMsIG9iamVjdCwgcHJvcGVydHkgKTtcblxuICAgIGlmKCAhaGFzT3duUHJvcGVydHkoIENhcmRpbmFsaXR5LCBjYXJkaW5hbGl0eSApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdVbmtub3duIGNhcmRpbmFsaXR5ICcgKyBjYXJkaW5hbGl0eSApO1xuICAgIH1cblxuICAgIHRoaXMuY2FyZGluYWxpdHkgPSBjYXJkaW5hbGl0eTtcbn1cblxuUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5SZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIFJvb3RFeHByZXNzaW9uKCBrZXkgKXtcbiAgICBpZiggISgga2V5IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmICEoIGtleSBpbnN0YW5jZW9mIElkZW50aWZpZXIgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBCbG9ja0V4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAna2V5IG11c3QgYmUgYSBsaXRlcmFsLCBpZGVudGlmaWVyLCBvciBldmFsIGV4cHJlc3Npb24nICk7XG4gICAgfVxuXG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb24sICd+JyApO1xuXG4gICAgdGhpcy5rZXkgPSBrZXk7XG59XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuUm9vdEV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUm9vdEV4cHJlc3Npb247XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0b3IgKyB0aGlzLmtleTtcbn07XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5rZXkgPSB0aGlzLmtleTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFNjb3BlRXhwcmVzc2lvbiggb3BlcmF0b3IsIGtleSApe1xuICAgIC8vaWYoICEoIGtleSBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISgga2V5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAna2V5IG11c3QgYmUgYSBsaXRlcmFsLCBpZGVudGlmaWVyLCBvciBldmFsIGV4cHJlc3Npb24nICk7XG4gICAgLy99XG5cbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5TY29wZUV4cHJlc3Npb24sIG9wZXJhdG9yICk7XG5cbiAgICB0aGlzLmtleSA9IGtleTtcbn1cblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNjb3BlRXhwcmVzc2lvbjtcblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0b3IgKyB0aGlzLmtleTtcbn07XG5cblNjb3BlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ua2V5ID0gdGhpcy5rZXk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgR3JhbW1hciBmcm9tICcuL2dyYW1tYXInO1xuaW1wb3J0ICogYXMgTm9kZSBmcm9tICcuL25vZGUnO1xuaW1wb3J0ICogYXMgS2V5cGF0aE5vZGUgZnJvbSAnLi9rZXlwYXRoLW5vZGUnO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge0xleGVyfSBsZXhlclxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBCdWlsZGVyKCBsZXhlciApe1xuICAgIHRoaXMubGV4ZXIgPSBsZXhlcjtcbn1cblxuQnVpbGRlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5CdWlsZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJ1aWxkZXI7XG5cbkJ1aWxkZXIucHJvdG90eXBlLmFycmF5RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBsaXN0ICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0FSUkFZIEVYUFJFU1NJT04nICk7XG4gICAgdGhpcy5jb25zdW1lKCAnWycgKTtcbiAgICByZXR1cm4gbmV3IE5vZGUuQXJyYXlFeHByZXNzaW9uKCBsaXN0ICk7XG59O1xuXG5CdWlsZGVyLnByb3RvdHlwZS5ibG9ja0V4cHJlc3Npb24gPSBmdW5jdGlvbiggdGVybWluYXRvciApe1xuICAgIHZhciBibG9jayA9IFtdLFxuICAgICAgICBpc29sYXRlZCA9IGZhbHNlO1xuICAgIC8vY29uc29sZS5sb2coICdCTE9DSycsIHRlcm1pbmF0b3IgKTtcbiAgICBpZiggIXRoaXMucGVlayggdGVybWluYXRvciApICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIEVYUFJFU1NJT05TJyApO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBibG9jay51bnNoaWZ0KCB0aGlzLmNvbnN1bWUoKSApO1xuICAgICAgICB9IHdoaWxlKCAhdGhpcy5wZWVrKCB0ZXJtaW5hdG9yICkgKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lKCB0ZXJtaW5hdG9yICk7XG4gICAgLyppZiggdGhpcy5wZWVrKCAnficgKSApe1xuICAgICAgICBpc29sYXRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuY29uc3VtZSggJ34nICk7XG4gICAgfSovXG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5CbG9ja0V4cHJlc3Npb24oIGJsb2NrLCBpc29sYXRlZCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfEFycmF5PEJ1aWxkZXJ+VG9rZW4+fSBpbnB1dFxuICogQHJldHVybnMge1Byb2dyYW19IFRoZSBidWlsdCBhYnN0cmFjdCBzeW50YXggdHJlZVxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5idWlsZCA9IGZ1bmN0aW9uKCBpbnB1dCApe1xuICAgIGlmKCB0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnICl7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRleHQgPSBpbnB1dDtcblxuICAgICAgICBpZiggdHlwZW9mIHRoaXMubGV4ZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoICdsZXhlciBpcyBub3QgZGVmaW5lZCcgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpBcnJheTxUb2tlbj59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRva2VucyA9IHRoaXMubGV4ZXIubGV4KCBpbnB1dCApO1xuICAgIH0gZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaW5wdXQgKSApe1xuICAgICAgICB0aGlzLnRva2VucyA9IGlucHV0LnNsaWNlKCk7XG4gICAgICAgIHRoaXMudGV4dCA9IGlucHV0LmpvaW4oICcnICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnaW52YWxpZCBpbnB1dCcgKTtcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJ0JVSUxEJyApO1xuICAgIC8vY29uc29sZS5sb2coICctICcsIHRoaXMudGV4dC5sZW5ndGgsICdDSEFSUycsIHRoaXMudGV4dCApO1xuICAgIC8vY29uc29sZS5sb2coICctICcsIHRoaXMudG9rZW5zLmxlbmd0aCwgJ1RPS0VOUycsIHRoaXMudG9rZW5zICk7XG4gICAgdGhpcy5jb2x1bW4gPSB0aGlzLnRleHQubGVuZ3RoO1xuICAgIHRoaXMubGluZSA9IDE7XG5cbiAgICB2YXIgcHJvZ3JhbSA9IHRoaXMucHJvZ3JhbSgpO1xuXG4gICAgaWYoIHRoaXMudG9rZW5zLmxlbmd0aCApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdVbmV4cGVjdGVkIHRva2VuICcgKyB0aGlzLnRva2Vuc1sgMCBdICsgJyByZW1haW5pbmcnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2dyYW07XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0NhbGxFeHByZXNzaW9ufSBUaGUgY2FsbCBleHByZXNzaW9uIG5vZGVcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuY2FsbEV4cHJlc3Npb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBhcmdzID0gdGhpcy5saXN0KCAnKCcgKSxcbiAgICAgICAgY2FsbGVlO1xuXG4gICAgdGhpcy5jb25zdW1lKCAnKCcgKTtcblxuICAgIGNhbGxlZSA9IHRoaXMuZXhwcmVzc2lvbigpO1xuXG4gICAgLy9jb25zb2xlLmxvZyggJ0NBTEwgRVhQUkVTU0lPTicgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBDQUxMRUUnLCBjYWxsZWUgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBBUkdVTUVOVFMnLCBhcmdzLCBhcmdzLmxlbmd0aCApO1xuICAgIHJldHVybiBuZXcgTm9kZS5DYWxsRXhwcmVzc2lvbiggY2FsbGVlLCBhcmdzICk7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgdGhlIG5leHQgdG9rZW4gaW4gdGhlIHRva2VuIGxpc3QuIElmIGEgY29tcGFyaXNvbiBpcyBwcm92aWRlZCwgdGhlIHRva2VuIHdpbGwgb25seSBiZSByZXR1cm5lZCBpZiB0aGUgdmFsdWUgbWF0Y2hlcy4gT3RoZXJ3aXNlIGFuIGVycm9yIGlzIHRocm93bi5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtleHBlY3RlZF0gQW4gZXhwZWN0ZWQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge1Rva2VufSBUaGUgbmV4dCB0b2tlbiBpbiB0aGUgbGlzdFxuICogQHRocm93cyB7U3ludGF4RXJyb3J9IElmIHRva2VuIGRpZCBub3QgZXhpc3RcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuY29uc3VtZSA9IGZ1bmN0aW9uKCBleHBlY3RlZCApe1xuICAgIGlmKCAhdGhpcy50b2tlbnMubGVuZ3RoICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ1VuZXhwZWN0ZWQgZW5kIG9mIGV4cHJlc3Npb24nICk7XG4gICAgfVxuXG4gICAgdmFyIHRva2VuID0gdGhpcy5leHBlY3QoIGV4cGVjdGVkICk7XG5cbiAgICBpZiggIXRva2VuICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ1VuZXhwZWN0ZWQgdG9rZW4gJyArIHRva2VuLnZhbHVlICsgJyBjb25zdW1lZCcgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdG9rZW47XG59O1xuXG5CdWlsZGVyLnByb3RvdHlwZS5leGlzdGVudGlhbEV4cHJlc3Npb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBleHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uKCk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gRVhJU1QgRVhQUkVTU0lPTicsIGV4cHJlc3Npb24gKTtcbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLkV4aXN0ZW50aWFsRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBuZXh0IHRva2VuIGluIHRoZSB0b2tlbiBsaXN0LiBJZiBjb21wYXJpc29ucyBhcmUgcHJvdmlkZWQsIHRoZSB0b2tlbiB3aWxsIG9ubHkgYmUgcmV0dXJuZWQgaWYgdGhlIHZhbHVlIG1hdGNoZXMgb25lIG9mIHRoZSBjb21wYXJpc29ucy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmaXJzdF0gVGhlIGZpcnN0IGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbc2Vjb25kXSBUaGUgc2Vjb25kIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbdGhpcmRdIFRoZSB0aGlyZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZvdXJ0aF0gVGhlIGZvdXJ0aCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcmV0dXJucyB7VG9rZW59IFRoZSBuZXh0IHRva2VuIGluIHRoZSBsaXN0IG9yIGB1bmRlZmluZWRgIGlmIGl0IGRpZCBub3QgZXhpc3RcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZXhwZWN0ID0gZnVuY3Rpb24oIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKXtcbiAgICB2YXIgdG9rZW4gPSB0aGlzLnBlZWsoIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKTtcblxuICAgIGlmKCB0b2tlbiApe1xuICAgICAgICB0aGlzLnRva2Vucy5wb3AoKTtcbiAgICAgICAgdGhpcy5jb2x1bW4gLT0gdG9rZW4udmFsdWUubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgfVxuXG4gICAgcmV0dXJuIHZvaWQgMDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7RXhwcmVzc2lvbn0gQW4gZXhwcmVzc2lvbiBub2RlXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmV4cHJlc3Npb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBleHByZXNzaW9uID0gbnVsbCxcbiAgICAgICAgbGlzdCwgbmV4dCwgdG9rZW47XG5cbiAgICBpZiggdGhpcy5leHBlY3QoICc7JyApICl7XG4gICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICB9XG5cbiAgICBpZiggbmV4dCA9IHRoaXMucGVlaygpICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFWFBSRVNTSU9OJywgbmV4dCApO1xuICAgICAgICBzd2l0Y2goIG5leHQudHlwZSApe1xuICAgICAgICAgICAgY2FzZSBHcmFtbWFyLlB1bmN0dWF0b3I6XG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuZXhwZWN0KCAnXScgKSApe1xuICAgICAgICAgICAgICAgICAgICBsaXN0ID0gdGhpcy5saXN0KCAnWycgKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMudG9rZW5zLmxlbmd0aCA9PT0gMSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuYXJyYXlFeHByZXNzaW9uKCBsaXN0ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggbGlzdC5sZW5ndGggPiAxICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5zZXF1ZW5jZUV4cHJlc3Npb24oIGxpc3QgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSBBcnJheS5pc0FycmF5KCBsaXN0ICkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RbIDAgXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIG5leHQudmFsdWUgPT09ICd9JyApe1xuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXAoIG5leHQgKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggdGhpcy5leHBlY3QoICc/JyApICl7XG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmV4aXN0ZW50aWFsRXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBHcmFtbWFyLk51bGxMaXRlcmFsOlxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxpdGVyYWwoKTtcbiAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyBHcmFtbWFyLklkZW50aWZpZXJcbiAgICAgICAgICAgIC8vIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWxcbiAgICAgICAgICAgIC8vIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbFxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXAoIG5leHQgKTtcbiAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICAgICAgLy8gSW1wbGllZCBtZW1iZXIgZXhwcmVzc2lvbi4gU2hvdWxkIG9ubHkgaGFwcGVuIGFmdGVyIGFuIElkZW50aWZpZXIuXG4gICAgICAgICAgICAgICAgaWYoIG5leHQgJiYgbmV4dC50eXBlID09PSBHcmFtbWFyLlB1bmN0dWF0b3IgJiYgKCBuZXh0LnZhbHVlID09PSAnKScgfHwgbmV4dC52YWx1ZSA9PT0gJ10nIHx8IG5leHQudmFsdWUgPT09ICc/JyApICl7XG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLm1lbWJlckV4cHJlc3Npb24oIGV4cHJlc3Npb24sIGZhbHNlICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUoICggdG9rZW4gPSB0aGlzLmV4cGVjdCggJyknLCAnWycsICcuJyApICkgKXtcbiAgICAgICAgICAgIGlmKCB0b2tlbi52YWx1ZSA9PT0gJyknICl7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuY2FsbEV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdG9rZW4udmFsdWUgPT09ICdbJyApe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLm1lbWJlckV4cHJlc3Npb24oIGV4cHJlc3Npb24sIHRydWUgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdG9rZW4udmFsdWUgPT09ICcuJyApe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLm1lbWJlckV4cHJlc3Npb24oIGV4cHJlc3Npb24sIGZhbHNlICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvciggJ1VuZXhwZWN0ZWQgdG9rZW4gJyArIHRva2VuICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7RXhwcmVzc2lvblN0YXRlbWVudH0gQW4gZXhwcmVzc2lvbiBzdGF0ZW1lbnRcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZXhwcmVzc2lvblN0YXRlbWVudCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb24oKSxcbiAgICAgICAgZXhwcmVzc2lvblN0YXRlbWVudDtcbiAgICAvL2NvbnNvbGUubG9nKCAnRVhQUkVTU0lPTiBTVEFURU1FTlQgV0lUSCcsIGV4cHJlc3Npb24gKTtcbiAgICBleHByZXNzaW9uU3RhdGVtZW50ID0gbmV3IE5vZGUuRXhwcmVzc2lvblN0YXRlbWVudCggZXhwcmVzc2lvbiApO1xuXG4gICAgcmV0dXJuIGV4cHJlc3Npb25TdGF0ZW1lbnQ7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0lkZW50aWZpZXJ9IEFuIGlkZW50aWZpZXJcbiAqIEB0aHJvd3Mge1N5bnRheEVycm9yfSBJZiB0aGUgdG9rZW4gaXMgbm90IGFuIGlkZW50aWZpZXJcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuaWRlbnRpZmllciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRva2VuID0gdGhpcy5jb25zdW1lKCk7XG5cbiAgICBpZiggISggdG9rZW4udHlwZSA9PT0gR3JhbW1hci5JZGVudGlmaWVyICkgKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnSWRlbnRpZmllciBleHBlY3RlZCcgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IE5vZGUuSWRlbnRpZmllciggdG9rZW4udmFsdWUgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdGVybWluYXRvclxuICogQHJldHVybnMge2V4dGVybmFsOkFycmF5PEV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn0gVGhlIGxpc3Qgb2YgZXhwcmVzc2lvbnMgb3IgcmFuZ2UgZXhwcmVzc2lvblxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5saXN0ID0gZnVuY3Rpb24oIHRlcm1pbmF0b3IgKXtcbiAgICB2YXIgbGlzdCA9IFtdLFxuICAgICAgICBpc051bWVyaWMgPSBmYWxzZSxcbiAgICAgICAgZXhwcmVzc2lvbiwgbmV4dDtcbiAgICAvL2NvbnNvbGUubG9nKCAnTElTVCcsIHRlcm1pbmF0b3IgKTtcbiAgICBpZiggIXRoaXMucGVlayggdGVybWluYXRvciApICl7XG4gICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgaXNOdW1lcmljID0gbmV4dC50eXBlID09PSBHcmFtbWFyLk51bWVyaWNMaXRlcmFsO1xuXG4gICAgICAgIC8vIEV4YW1wbGVzOiBbMS4uM10sIFs1Li5dLCBbLi43XVxuICAgICAgICBpZiggKCBpc051bWVyaWMgfHwgbmV4dC52YWx1ZSA9PT0gJy4nICkgJiYgdGhpcy5wZWVrQXQoIDEsICcuJyApICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBSQU5HRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGlzTnVtZXJpYyA/XG4gICAgICAgICAgICAgICAgdGhpcy5sb29rdXAoIG5leHQgKSA6XG4gICAgICAgICAgICAgICAgbnVsbDtcbiAgICAgICAgICAgIGxpc3QgPSB0aGlzLnJhbmdlRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApO1xuXG4gICAgICAgIC8vIEV4YW1wbGVzOiBbMSwyLDNdLCBbXCJhYmNcIixcImRlZlwiXSwgW2ZvbyxiYXJdLCBbe2Zvby5iYXJ9XVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gQVJSQVkgT0YgRVhQUkVTU0lPTlMnICk7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwKCBuZXh0ICk7XG4gICAgICAgICAgICAgICAgbGlzdC51bnNoaWZ0KCBleHByZXNzaW9uICk7XG4gICAgICAgICAgICB9IHdoaWxlKCB0aGlzLmV4cGVjdCggJywnICkgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCAnLSBMSVNUIFJFU1VMVCcsIGxpc3QgKTtcbiAgICByZXR1cm4gbGlzdDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7TGl0ZXJhbH0gVGhlIGxpdGVyYWwgbm9kZVxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5saXRlcmFsID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgdG9rZW4gPSB0aGlzLmNvbnN1bWUoKSxcbiAgICAgICAgcmF3ID0gdG9rZW4udmFsdWUsXG4gICAgICAgIGV4cHJlc3Npb247XG5cbiAgICBzd2l0Y2goIHRva2VuLnR5cGUgKXtcbiAgICAgICAgY2FzZSBHcmFtbWFyLk51bWVyaWNMaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IG5ldyBOb2RlLk51bWVyaWNMaXRlcmFsKCByYXcgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBuZXcgTm9kZS5TdHJpbmdMaXRlcmFsKCByYXcgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEdyYW1tYXIuTnVsbExpdGVyYWw6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gbmV3IE5vZGUuTnVsbExpdGVyYWwoIHJhdyApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoICdMaXRlcmFsIGV4cGVjdGVkJyApO1xuICAgIH1cblxuICAgIHJldHVybiBleHByZXNzaW9uO1xufTtcblxuQnVpbGRlci5wcm90b3R5cGUubG9va3VwID0gZnVuY3Rpb24oIG5leHQgKXtcbiAgICB2YXIgZXhwcmVzc2lvbjtcbiAgICAvL2NvbnNvbGUubG9nKCAnTE9PS1VQJywgbmV4dCApO1xuICAgIHN3aXRjaCggbmV4dC50eXBlICl7XG4gICAgICAgIGNhc2UgR3JhbW1hci5JZGVudGlmaWVyOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuaWRlbnRpZmllcigpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR3JhbW1hci5OdW1lcmljTGl0ZXJhbDpcbiAgICAgICAgY2FzZSBHcmFtbWFyLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5saXRlcmFsKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBHcmFtbWFyLlB1bmN0dWF0b3I6XG4gICAgICAgICAgICBpZiggbmV4dC52YWx1ZSA9PT0gJ30nICl7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdW1lKCAnfScgKTtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5ibG9ja0V4cHJlc3Npb24oICd7JyApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAndG9rZW4gY2Fubm90IGJlIGEgbG9va3VwJyApO1xuICAgIH1cblxuICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcblxuICAgIGlmKCBuZXh0ICYmIG5leHQudmFsdWUgPT09ICclJyApe1xuICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXBFeHByZXNzaW9uKCBleHByZXNzaW9uICk7XG4gICAgfVxuICAgIGlmKCBuZXh0ICYmIG5leHQudmFsdWUgPT09ICd+JyApe1xuICAgICAgICBleHByZXNzaW9uID0gdGhpcy5yb290RXhwcmVzc2lvbiggZXhwcmVzc2lvbiApO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCAnLSBMT09LVVAgUkVTVUxUJywgZXhwcmVzc2lvbiApO1xuICAgIHJldHVybiBleHByZXNzaW9uO1xufTtcblxuQnVpbGRlci5wcm90b3R5cGUubG9va3VwRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXkgKXtcbiAgICB0aGlzLmNvbnN1bWUoICclJyApO1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuTG9va3VwRXhwcmVzc2lvbigga2V5ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtFeHByZXNzaW9ufSBwcm9wZXJ0eSBUaGUgZXhwcmVzc2lvbiBhc3NpZ25lZCB0byB0aGUgcHJvcGVydHkgb2YgdGhlIG1lbWJlciBleHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGNvbXB1dGVkIFdoZXRoZXIgb3Igbm90IHRoZSBtZW1iZXIgZXhwcmVzc2lvbiBpcyBjb21wdXRlZFxuICogQHJldHVybnMge01lbWJlckV4cHJlc3Npb259IFRoZSBtZW1iZXIgZXhwcmVzc2lvblxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5tZW1iZXJFeHByZXNzaW9uID0gZnVuY3Rpb24oIHByb3BlcnR5LCBjb21wdXRlZCApe1xuICAgIC8vY29uc29sZS5sb2coICdNRU1CRVInLCBwcm9wZXJ0eSApO1xuICAgIHZhciBvYmplY3QgPSB0aGlzLmV4cHJlc3Npb24oKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gT0JKRUNUJywgb2JqZWN0ICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gUFJPUEVSVFknLCBwcm9wZXJ0eSApO1xuICAgIC8vY29uc29sZS5sb2coICctIENPTVBVVEVEJywgY29tcHV0ZWQgKTtcbiAgICByZXR1cm4gY29tcHV0ZWQgP1xuICAgICAgICBuZXcgTm9kZS5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHkgKSA6XG4gICAgICAgIG5ldyBOb2RlLlN0YXRpY01lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHkgKTtcbn07XG5cbkJ1aWxkZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oIGlucHV0ICl7XG4gICAgdGhpcy50b2tlbnMgPSB0aGlzLmxleGVyLmxleCggaW5wdXQgKTtcbiAgICByZXR1cm4gdGhpcy5idWlsZCggdGhpcy50b2tlbnMgKTtcbn07XG5cbi8qKlxuICogUHJvdmlkZXMgdGhlIG5leHQgdG9rZW4gaW4gdGhlIHRva2VuIGxpc3QgX3dpdGhvdXQgcmVtb3ZpbmcgaXRfLiBJZiBjb21wYXJpc29ucyBhcmUgcHJvdmlkZWQsIHRoZSB0b2tlbiB3aWxsIG9ubHkgYmUgcmV0dXJuZWQgaWYgdGhlIHZhbHVlIG1hdGNoZXMgb25lIG9mIHRoZSBjb21wYXJpc29ucy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmaXJzdF0gVGhlIGZpcnN0IGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbc2Vjb25kXSBUaGUgc2Vjb25kIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbdGhpcmRdIFRoZSB0aGlyZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZvdXJ0aF0gVGhlIGZvdXJ0aCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcmV0dXJucyB7TGV4ZXJ+VG9rZW59IFRoZSBuZXh0IHRva2VuIGluIHRoZSBsaXN0IG9yIGB1bmRlZmluZWRgIGlmIGl0IGRpZCBub3QgZXhpc3RcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICl7XG4gICAgcmV0dXJuIHRoaXMucGVla0F0KCAwLCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICk7XG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIHRoZSB0b2tlbiBhdCB0aGUgcmVxdWVzdGVkIHBvc2l0aW9uIF93aXRob3V0IHJlbW92aW5nIGl0XyBmcm9tIHRoZSB0b2tlbiBsaXN0LiBJZiBjb21wYXJpc29ucyBhcmUgcHJvdmlkZWQsIHRoZSB0b2tlbiB3aWxsIG9ubHkgYmUgcmV0dXJuZWQgaWYgdGhlIHZhbHVlIG1hdGNoZXMgb25lIG9mIHRoZSBjb21wYXJpc29ucy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IHBvc2l0aW9uIFRoZSBwb3NpdGlvbiB3aGVyZSB0aGUgdG9rZW4gd2lsbCBiZSBwZWVrZWRcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZmlyc3RdIFRoZSBmaXJzdCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3NlY29uZF0gVGhlIHNlY29uZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3RoaXJkXSBUaGUgdGhpcmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmb3VydGhdIFRoZSBmb3VydGggY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge0xleGVyflRva2VufSBUaGUgdG9rZW4gYXQgdGhlIHJlcXVlc3RlZCBwb3NpdGlvbiBvciBgdW5kZWZpbmVkYCBpZiBpdCBkaWQgbm90IGV4aXN0XG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnBlZWtBdCA9IGZ1bmN0aW9uKCBwb3NpdGlvbiwgZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApe1xuICAgIHZhciBsZW5ndGggPSB0aGlzLnRva2Vucy5sZW5ndGgsXG4gICAgICAgIGluZGV4LCB0b2tlbiwgdmFsdWU7XG5cbiAgICBpZiggbGVuZ3RoICYmIHR5cGVvZiBwb3NpdGlvbiA9PT0gJ251bWJlcicgJiYgcG9zaXRpb24gPiAtMSApe1xuICAgICAgICAvLyBDYWxjdWxhdGUgYSB6ZXJvLWJhc2VkIGluZGV4IHN0YXJ0aW5nIGZyb20gdGhlIGVuZCBvZiB0aGUgbGlzdFxuICAgICAgICBpbmRleCA9IGxlbmd0aCAtIHBvc2l0aW9uIC0gMTtcblxuICAgICAgICBpZiggaW5kZXggPiAtMSAmJiBpbmRleCA8IGxlbmd0aCApe1xuICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRva2Vuc1sgaW5kZXggXTtcbiAgICAgICAgICAgIHZhbHVlID0gdG9rZW4udmFsdWU7XG5cbiAgICAgICAgICAgIGlmKCB2YWx1ZSA9PT0gZmlyc3QgfHwgdmFsdWUgPT09IHNlY29uZCB8fCB2YWx1ZSA9PT0gdGhpcmQgfHwgdmFsdWUgPT09IGZvdXJ0aCB8fCAoICFmaXJzdCAmJiAhc2Vjb25kICYmICF0aGlyZCAmJiAhZm91cnRoICkgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdm9pZCAwO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtQcm9ncmFtfSBBIHByb2dyYW0gbm9kZVxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5wcm9ncmFtID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgYm9keSA9IFtdO1xuICAgIC8vY29uc29sZS5sb2coICdQUk9HUkFNJyApO1xuICAgIHdoaWxlKCB0cnVlICl7XG4gICAgICAgIGlmKCB0aGlzLnRva2Vucy5sZW5ndGggKXtcbiAgICAgICAgICAgIGJvZHkudW5zaGlmdCggdGhpcy5leHByZXNzaW9uU3RhdGVtZW50KCkgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTm9kZS5Qcm9ncmFtKCBib2R5ICk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5CdWlsZGVyLnByb3RvdHlwZS5yYW5nZUV4cHJlc3Npb24gPSBmdW5jdGlvbiggcmlnaHQgKXtcbiAgICB2YXIgbGVmdDtcblxuICAgIHRoaXMuZXhwZWN0KCAnLicgKTtcbiAgICB0aGlzLmV4cGVjdCggJy4nICk7XG5cbiAgICBsZWZ0ID0gdGhpcy5wZWVrKCkudHlwZSA9PT0gR3JhbW1hci5OdW1lcmljTGl0ZXJhbCA/XG4gICAgICAgIGxlZnQgPSB0aGlzLmxpdGVyYWwoKSA6XG4gICAgICAgIG51bGw7XG5cbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLlJhbmdlRXhwcmVzc2lvbiggbGVmdCwgcmlnaHQgKTtcbn07XG5cbkJ1aWxkZXIucHJvdG90eXBlLnJvb3RFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSApe1xuICAgIHRoaXMuY29uc3VtZSggJ34nICk7XG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5Sb290RXhwcmVzc2lvbigga2V5ICk7XG59O1xuXG5CdWlsZGVyLnByb3RvdHlwZS5zZXF1ZW5jZUV4cHJlc3Npb24gPSBmdW5jdGlvbiggbGlzdCApe1xuICAgIHJldHVybiBuZXcgTm9kZS5TZXF1ZW5jZUV4cHJlc3Npb24oIGxpc3QgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZVxuICogQHRocm93cyB7ZXh0ZXJuYWw6U3ludGF4RXJyb3J9IFdoZW4gaXQgZXhlY3V0ZXNcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUudGhyb3dFcnJvciA9IGZ1bmN0aW9uKCBtZXNzYWdlICl7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCBtZXNzYWdlICk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGhhc093blByb3BlcnR5IGZyb20gJy4vaGFzLW93bi1wcm9wZXJ0eSc7XG5pbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgU3ludGF4IGZyb20gJy4vc3ludGF4JztcbmltcG9ydCAqIGFzIEtleXBhdGhTeW50YXggZnJvbSAnLi9rZXlwYXRoLXN5bnRheCc7XG5cbnZhciBub29wID0gZnVuY3Rpb24oKXt9LFxuXG4gICAgY2FjaGUgPSBuZXcgTnVsbCgpLFxuICAgIGdldHRlciA9IG5ldyBOdWxsKCksXG4gICAgc2V0dGVyID0gbmV3IE51bGwoKTtcblxuZnVuY3Rpb24gZXhlY3V0ZUxpc3QoIGxpc3QsIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgdmFyIGluZGV4ID0gbGlzdC5sZW5ndGgsXG4gICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICBzd2l0Y2goIGxpc3QubGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IGxpc3RbIDAgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IGxpc3RbIDAgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIHJlc3VsdFsgMSBdID0gbGlzdFsgMSBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gbGlzdFsgMCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgcmVzdWx0WyAxIF0gPSBsaXN0WyAxIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICByZXN1bHRbIDIgXSA9IGxpc3RbIDIgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IGxpc3RbIDAgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIHJlc3VsdFsgMSBdID0gbGlzdFsgMSBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgcmVzdWx0WyAyIF0gPSBsaXN0WyAyIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICByZXN1bHRbIDMgXSA9IGxpc3RbIDMgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBsaXN0WyBpbmRleCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmdldHRlci52YWx1ZSA9IGZ1bmN0aW9uKCBvYmplY3QsIGtleSApe1xuICAgIHJldHVybiBvYmplY3RbIGtleSBdO1xufTtcblxuZ2V0dGVyLmxpc3QgPSBmdW5jdGlvbiggb2JqZWN0LCBrZXkgKXtcbiAgICB2YXIgaW5kZXggPSBvYmplY3QubGVuZ3RoLFxuICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG5cbiAgICBzd2l0Y2goIGluZGV4ICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gb2JqZWN0WyAwIF1bIGtleSBdO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBvYmplY3RbIDAgXVsga2V5IF07XG4gICAgICAgICAgICByZXN1bHRbIDEgXSA9IG9iamVjdFsgMSBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gb2JqZWN0WyAwIF1bIGtleSBdO1xuICAgICAgICAgICAgcmVzdWx0WyAxIF0gPSBvYmplY3RbIDEgXVsga2V5IF07XG4gICAgICAgICAgICByZXN1bHRbIDIgXSA9IG9iamVjdFsgMiBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gb2JqZWN0WyAwIF1bIGtleSBdO1xuICAgICAgICAgICAgcmVzdWx0WyAxIF0gPSBvYmplY3RbIDEgXVsga2V5IF07XG4gICAgICAgICAgICByZXN1bHRbIDIgXSA9IG9iamVjdFsgMiBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJlc3VsdFsgMyBdID0gb2JqZWN0WyAzIF1bIGtleSBdO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gb2JqZWN0WyBpbmRleCBdWyBrZXkgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxuc2V0dGVyLnZhbHVlID0gZnVuY3Rpb24oIG9iamVjdCwga2V5LCB2YWx1ZSApe1xuICAgIGlmKCAhaGFzT3duUHJvcGVydHkoIG9iamVjdCwga2V5ICkgKXtcbiAgICAgICAgb2JqZWN0WyBrZXkgXSA9IHZhbHVlIHx8IHt9O1xuICAgIH1cbiAgICByZXR1cm4gZ2V0dGVyLnZhbHVlKCBvYmplY3QsIGtleSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gSW50ZXJwcmV0ZXJ+cmV0dXJuWmVyb1xuICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gemVyb1xuICovXG5mdW5jdGlvbiByZXR1cm5aZXJvKCl7XG4gICAgcmV0dXJuIDA7XG59XG5cbi8qKlxuICogQGNsYXNzIEludGVycHJldGVyRXJyb3JcbiAqIEBleHRlbmRzIGV4dGVybmFsOlN5bnRheEVycm9yXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gbWVzc2FnZVxuICovXG5mdW5jdGlvbiBJbnRlcnByZXRlckVycm9yKCBtZXNzYWdlICl7XG4gICAgU3ludGF4RXJyb3IuY2FsbCggdGhpcywgbWVzc2FnZSApO1xufVxuXG5JbnRlcnByZXRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBTeW50YXhFcnJvci5wcm90b3R5cGUgKTtcblxuLyoqXG4gKiBAY2xhc3MgSW50ZXJwcmV0ZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7QnVpbGRlcn0gYnVpbGRlclxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBJbnRlcnByZXRlciggYnVpbGRlciApe1xuICAgIGlmKCAhYXJndW1lbnRzLmxlbmd0aCApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdidWlsZGVyIGNhbm5vdCBiZSB1bmRlZmluZWQnLCBUeXBlRXJyb3IgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfSBJbnRlcnByZXRlciNidWlsZGVyXG4gICAgICovXG4gICAgdGhpcy5idWlsZGVyID0gYnVpbGRlcjtcbn1cblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSW50ZXJwcmV0ZXI7XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5hcnJheUV4cHJlc3Npb24gPSBmdW5jdGlvbiggZWxlbWVudHMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQVJSQVkgRVhQUkVTU0lPTicsIGVsZW1lbnRzLmxlbmd0aCApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGZuLCBsaXN0O1xuICAgIGlmKCBBcnJheS5pc0FycmF5KCBlbGVtZW50cyApICl7XG4gICAgICAgIGxpc3QgPSB0aGlzLmxpc3RFeHByZXNzaW9uKCBlbGVtZW50cywgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgICAgIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQVJSQVkgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSVNUYCwgbGlzdCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGxpc3QubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGtleXMsIHJlc3VsdDtcbiAgICAgICAgICAgIHN3aXRjaCggaW5kZXggKXtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAga2V5cyA9IGxpc3RbIDAgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBzY29wZSwga2V5cywgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBrZXlzID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzWyBpbmRleCBdID0gbGlzdFsgaW5kZXggXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGFzc2lnbiggc2NvcGUsIGtleXNbIGluZGV4IF0sICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBLRVlTYCwga2V5cyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdCA9IHRoaXMucmVjdXJzZSggZWxlbWVudHMsIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgICAgICBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVBcnJheUV4cHJlc3Npb25XaXRoRWxlbWVudFJhbmdlKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBBUlJBWSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExJU1RgLCBsaXN0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIga2V5cyA9IGxpc3QoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICksXG4gICAgICAgICAgICAgICAgaW5kZXggPSBrZXlzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICBpZiggaW5kZXggPT09IDEgKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIDAgXSA9IGFzc2lnbiggc2NvcGUsIGtleXNbIDAgXSwgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBhc3NpZ24oIHNjb3BlLCBrZXlzWyBpbmRleCBdLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZuO1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmJsb2NrRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCB0b2tlbnMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQkxPQ0snLCB0b2tlbnMuam9pbiggJycgKSApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIHRleHQgPSB0b2tlbnMuam9pbiggJycgKSxcbiAgICAgICAgcHJvZ3JhbSA9IGhhc093blByb3BlcnR5KCBjYWNoZSwgdGV4dCApID9cbiAgICAgICAgICAgIGNhY2hlWyB0ZXh0IF0gOlxuICAgICAgICAgICAgY2FjaGVbIHRleHQgXSA9IHRoaXMuYnVpbGRlci5idWlsZCggdG9rZW5zICksXG4gICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLnJlY3Vyc2UoIHByb2dyYW0uYm9keVsgMCBdLmV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKSxcbiAgICAgICAgZm47XG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUJsb2NrRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBCTE9DSycgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFNDT1BFYCwgc2NvcGUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IEVYUFJFU1NJT05gLCBleHByZXNzaW9uLm5hbWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBzY29wZSwgbmFtZTogdm9pZCAwLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuY2FsbEV4cHJlc3Npb24gPSBmdW5jdGlvbiggY2FsbGVlLCBhcmdzLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIENBTEwgRVhQUkVTU0lPTicgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGlzU2V0dGluZyA9IGFzc2lnbiA9PT0gc2V0dGVyLnZhbHVlLFxuICAgICAgICBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBjYWxsZWUsIHRydWUsIGFzc2lnbiApLFxuICAgICAgICBsaXN0ID0gdGhpcy5saXN0RXhwcmVzc2lvbiggYXJncywgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICBmbjtcblxuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVDYWxsRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBDQUxMIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBhcmdzYCwgYXJncy5sZW5ndGggKTtcbiAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICksXG4gICAgICAgICAgICB2YWx1ZXMgPSBleGVjdXRlTGlzdCggbGlzdCwgc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExIU2AsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICByZXN1bHQgPSBsaHMudmFsdWUuYXBwbHkoIGxocy5jb250ZXh0LCB2YWx1ZXMgKTtcbiAgICAgICAgaWYoIGlzU2V0dGluZyAmJiB0eXBlb2YgbGhzLnZhbHVlID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgaW50ZXJwcmV0ZXIudGhyb3dFcnJvciggJ2Nhbm5vdCBjcmVhdGUgY2FsbCBleHByZXNzaW9ucycgKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9OlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGV4cHJlc3Npb25cbiAqL1xuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmNvbXBpbGUgPSBmdW5jdGlvbiggZXhwcmVzc2lvbiwgY3JlYXRlICl7XG4gICAgdmFyIHByb2dyYW0gPSBoYXNPd25Qcm9wZXJ0eSggY2FjaGUsIGV4cHJlc3Npb24gKSA/XG4gICAgICAgICAgICBjYWNoZVsgZXhwcmVzc2lvbiBdIDpcbiAgICAgICAgICAgIGNhY2hlWyBleHByZXNzaW9uIF0gPSB0aGlzLmJ1aWxkZXIuYnVpbGQoIGV4cHJlc3Npb24gKSxcbiAgICAgICAgYm9keSA9IHByb2dyYW0uYm9keSxcbiAgICAgICAgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBhc3NpZ24sIGV4cHJlc3Npb25zLCBmbiwgaW5kZXg7XG5cbiAgICBpZiggdHlwZW9mIGNyZWF0ZSAhPT0gJ2Jvb2xlYW4nICl7XG4gICAgICAgIGNyZWF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLmRlcHRoID0gLTE7XG4gICAgdGhpcy5pc0xlZnRMaXN0ID0gZmFsc2U7XG4gICAgdGhpcy5pc1JpZ2h0TGlzdCA9IGZhbHNlO1xuICAgIHRoaXMuYXNzaWduZXIgPSBjcmVhdGUgP1xuICAgICAgICBzZXR0ZXIgOlxuICAgICAgICBnZXR0ZXI7XG5cbiAgICBhc3NpZ24gPSB0aGlzLmFzc2lnbmVyLnZhbHVlO1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqL1xuICAgIGludGVycHJldGVyLmV4cHJlc3Npb24gPSB0aGlzLmJ1aWxkZXIudGV4dDtcbiAgICAvL2NvbnNvbGUubG9nKCAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnSW50ZXJwcmV0aW5nICcsIGV4cHJlc3Npb24gKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnUHJvZ3JhbScsIHByb2dyYW0ucmFuZ2UgKTtcblxuICAgIHN3aXRjaCggYm9keS5sZW5ndGggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgZm4gPSBub29wO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGZuID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggYm9keVsgMCBdLmV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaW5kZXggPSBib2R5Lmxlbmd0aDtcbiAgICAgICAgICAgIGV4cHJlc3Npb25zID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uc1sgaW5kZXggXSA9IGludGVycHJldGVyLnJlY3Vyc2UoIGJvZHlbIGluZGV4IF0uZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlUHJvZ3JhbSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoID0gZXhwcmVzc2lvbnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBsYXN0VmFsdWU7XG5cbiAgICAgICAgICAgICAgICBmb3IoIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KysgKXtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFZhbHVlID0gZXhwcmVzc2lvbnNbIGluZGV4IF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhc3RWYWx1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJ0ZOJywgZm4ubmFtZSApO1xuICAgIHJldHVybiBmbjtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5jb21wdXRlZE1lbWJlckV4cHJlc3Npb24gPSBmdW5jdGlvbiggb2JqZWN0LCBwcm9wZXJ0eSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBDT01QVVRFRCBNRU1CRVIgRVhQUkVTU0lPTicsIG9iamVjdC50eXBlLCBwcm9wZXJ0eS50eXBlICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBpc1NhZmUgPSBvYmplY3QudHlwZSA9PT0gS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb24sXG4gICAgICAgIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIG9iamVjdCwgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICByaWdodCA9IHRoaXMucmVjdXJzZSggcHJvcGVydHksIGZhbHNlLCBhc3NpZ24gKSxcbiAgICAgICAgZm47XG5cbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIENPTVBVVEVEIE1FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEVGVCBgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJJR0hUYCwgcmlnaHQubmFtZSApO1xuICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgIGluZGV4LCBsZW5ndGgsIHBvc2l0aW9uLCByZXN1bHQsIHJocztcbiAgICAgICAgaWYoICFpc1NhZmUgfHwgKCBsaHMgIT09IHZvaWQgMCAmJiBsaHMgIT09IG51bGwgKSApe1xuICAgICAgICAgICAgcmhzID0gcmlnaHQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExIU2AsIGxocyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJIU2AsIHJocyApO1xuICAgICAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIHJocyApICl7XG4gICAgICAgICAgICAgICAgaWYoICggaW50ZXJwcmV0ZXIuaXNMZWZ0TGlzdCApICYmIEFycmF5LmlzQXJyYXkoIGxocyApICl7XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aCA9IHJocy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gbGhzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gbmV3IEFycmF5KCBsZW5ndGggKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciggcG9zaXRpb24gPSAwOyBwb3NpdGlvbiA8IGxlbmd0aDsgcG9zaXRpb24rKyApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXVsgcG9zaXRpb24gXSA9IGFzc2lnbiggbGhzWyBpbmRleCBdLCByaHNbIHBvc2l0aW9uIF0sICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gcmhzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gYXNzaWduKCBsaHMsIHJoc1sgaW5kZXggXSwgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmKCAoIGludGVycHJldGVyLmlzTGVmdExpc3QgfHwgaW50ZXJwcmV0ZXIuaXNSaWdodExpc3QgKSAmJiBBcnJheS5pc0FycmF5KCBsaHMgKSApe1xuICAgICAgICAgICAgICAgIGluZGV4ID0gbGhzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gYXNzaWduKCBsaHNbIGluZGV4IF0sIHJocywgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBsaHMsIHJocywgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmV4aXN0ZW50aWFsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBleHByZXNzaW9uLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIEVYSVNURU5USUFMIEVYUFJFU1NJT04nLCBleHByZXNzaW9uLnR5cGUgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgbGVmdCA9IHRoaXMucmVjdXJzZSggZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICBmbjtcbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlRXhpc3RlbnRpYWxFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIEVYSVNURU5USUFMIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMRUZUYCwgbGVmdC5uYW1lICk7XG4gICAgICAgIGlmKCBzY29wZSAhPT0gdm9pZCAwICYmIHNjb3BlICE9PSBudWxsICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdm9pZCAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuaWRlbnRpZmllciA9IGZ1bmN0aW9uKCBuYW1lLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIElERU5USUZJRVInLCBuYW1lICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgZm47XG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUlkZW50aWZpZXIoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgSURFTlRJRklFUicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IE5BTUVgLCBuYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBWQUxVRWAsIHZhbHVlICk7XG4gICAgICAgIHZhciByZXN1bHQgPSBhc3NpZ24oIHNjb3BlLCBuYW1lLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBzY29wZSwgbmFtZTogbmFtZSwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmxpc3RFeHByZXNzaW9uID0gZnVuY3Rpb24oIGl0ZW1zLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICB2YXIgaW5kZXggPSBpdGVtcy5sZW5ndGgsXG4gICAgICAgIGxpc3QgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG5cbiAgICBzd2l0Y2goIGluZGV4ICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBsaXN0WyAwIF0gPSB0aGlzLmxpc3RFeHByZXNzaW9uRWxlbWVudCggaXRlbXNbIDAgXSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgbGlzdFsgaW5kZXggXSA9IHRoaXMubGlzdEV4cHJlc3Npb25FbGVtZW50KCBpdGVtc1sgaW5kZXggXSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpc3Q7XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUubGlzdEV4cHJlc3Npb25FbGVtZW50ID0gZnVuY3Rpb24oIGVsZW1lbnQsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIHN3aXRjaCggZWxlbWVudC50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LkxpdGVyYWw6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXRlcmFsKCBlbGVtZW50LnZhbHVlLCBjb250ZXh0ICk7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9va3VwRXhwcmVzc2lvbiggZWxlbWVudC5rZXksIGZhbHNlLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucm9vdEV4cHJlc3Npb24oIGVsZW1lbnQua2V5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LkJsb2NrRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJsb2NrRXhwcmVzc2lvbiggZWxlbWVudC5ib2R5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvciggJ1VuZXhwZWN0ZWQgbGlzdCBlbGVtZW50IHR5cGUnLCBlbGVtZW50LnR5cGUgKTtcbiAgICB9XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUubGl0ZXJhbCA9IGZ1bmN0aW9uKCB2YWx1ZSwgY29udGV4dCApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgTElURVJBTCcsIHZhbHVlICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgZm47XG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUxpdGVyYWwoKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBMSVRFUkFMJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgdmFsdWUgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiB2b2lkIDAsIG5hbWU6IHZvaWQgMCwgdmFsdWU6IHZhbHVlIH0gOlxuICAgICAgICAgICAgdmFsdWU7XG4gICAgfTtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5sb29rdXBFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSwgcmVzb2x2ZSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBMT09LVVAgRVhQUkVTU0lPTicsIGtleSApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBpc0xlZnRGdW5jdGlvbiA9IGZhbHNlLFxuICAgICAgICBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGxocyA9IHt9LFxuICAgICAgICBmbiwgbGVmdDtcblxuICAgIHN3aXRjaCgga2V5LnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmlkZW50aWZpZXIoIGtleS5uYW1lLCB0cnVlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGlzTGVmdEZ1bmN0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5MaXRlcmFsOlxuICAgICAgICAgICAgbGhzLnZhbHVlID0gbGVmdCA9IGtleS52YWx1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGVmdCA9IHRoaXMucmVjdXJzZSgga2V5LCB0cnVlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGlzTGVmdEZ1bmN0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVMb29rdXBFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIExPT0tVUCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEVGVGAsIGxlZnQubmFtZSB8fCBsZWZ0ICk7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmKCBpc0xlZnRGdW5jdGlvbiApe1xuICAgICAgICAgICAgbGhzID0gbGVmdCggbG9va3VwLCB2YWx1ZSwgc2NvcGUgKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGxocy52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggbG9va3VwLCBsaHMudmFsdWUsIHZvaWQgMCApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlc29sdmUgbG9va3VwcyB0aGF0IGFyZSB0aGUgb2JqZWN0IG9mIGFuIG9iamVjdC1wcm9wZXJ0eSByZWxhdGlvbnNoaXBcbiAgICAgICAgaWYoIHJlc29sdmUgKXtcbiAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggc2NvcGUsIHJlc3VsdCwgdm9pZCAwICk7XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExIU2AsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxvb2t1cCwgbmFtZTogbGhzLnZhbHVlLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUucmFuZ2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIG5sLCBuciwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBSQU5HRSBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgbGVmdCA9IG5sICE9PSBudWxsID9cbiAgICAgICAgICAgIGludGVycHJldGVyLnJlY3Vyc2UoIG5sLCBmYWxzZSwgYXNzaWduICkgOlxuICAgICAgICAgICAgcmV0dXJuWmVybyxcbiAgICAgICAgcmlnaHQgPSBuciAhPT0gbnVsbCA/XG4gICAgICAgICAgICBpbnRlcnByZXRlci5yZWN1cnNlKCBuciwgZmFsc2UsIGFzc2lnbiApIDpcbiAgICAgICAgICAgIHJldHVyblplcm8sXG4gICAgICAgIGZuLCBpbmRleCwgbGhzLCBtaWRkbGUsIHJlc3VsdCwgcmhzO1xuXG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBSQU5HRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEVGVGAsIGxlZnQubmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUklHSFRgLCByaWdodC5uYW1lICk7XG4gICAgICAgIGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgIHJocyA9IHJpZ2h0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgaW5kZXggPSAxO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEhTYCwgbGhzICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSSFNgLCByaHMgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgcmVzdWx0WyAwIF0gPSBsaHM7XG4gICAgICAgIGlmKCBsaHMgPCByaHMgKXtcbiAgICAgICAgICAgIG1pZGRsZSA9IGxocyArIDE7XG4gICAgICAgICAgICB3aGlsZSggbWlkZGxlIDwgcmhzICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCsrIF0gPSBtaWRkbGUrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmKCBsaHMgPiByaHMgKXtcbiAgICAgICAgICAgIG1pZGRsZSA9IGxocyAtIDE7XG4gICAgICAgICAgICB3aGlsZSggbWlkZGxlID4gcmhzICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCsrIF0gPSBtaWRkbGUtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbIHJlc3VsdC5sZW5ndGggXSA9IHJocztcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbkludGVycHJldGVyLnByb3RvdHlwZS5yZWN1cnNlID0gZnVuY3Rpb24oIG5vZGUsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdSZWN1cnNpbmcnLCBub2RlLnR5cGUsIG5vZGUucmFuZ2UgKTtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IG51bGw7XG4gICAgdGhpcy5kZXB0aCsrO1xuXG4gICAgc3dpdGNoKCBub2RlLnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguQXJyYXlFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuYXJyYXlFeHByZXNzaW9uKCBub2RlLmVsZW1lbnRzLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIHRoaXMuaXNMZWZ0TGlzdCA9IG5vZGUuZWxlbWVudHMubGVuZ3RoID4gMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5DYWxsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmNhbGxFeHByZXNzaW9uKCBub2RlLmNhbGxlZSwgbm9kZS5hcmd1bWVudHMsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5CbG9ja0V4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5ibG9ja0V4cHJlc3Npb24oIG5vZGUuYm9keSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmV4aXN0ZW50aWFsRXhwcmVzc2lvbiggbm9kZS5leHByZXNzaW9uLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5JZGVudGlmaWVyOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuaWRlbnRpZmllciggbm9kZS5uYW1lLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5MaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubGl0ZXJhbCggbm9kZS52YWx1ZSwgY29udGV4dCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4Lk1lbWJlckV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gbm9kZS5jb21wdXRlZCA/XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIG5vZGUub2JqZWN0LCBub2RlLnByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKSA6XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBub2RlLm9iamVjdCwgbm9kZS5wcm9wZXJ0eSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXBFeHByZXNzaW9uKCBub2RlLmtleSwgZmFsc2UsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5SYW5nZUV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5yYW5nZUV4cHJlc3Npb24oIG5vZGUubGVmdCwgbm9kZS5yaWdodCwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMucm9vdEV4cHJlc3Npb24oIG5vZGUua2V5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5TZXF1ZW5jZUV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5zZXF1ZW5jZUV4cHJlc3Npb24oIG5vZGUuZXhwcmVzc2lvbnMsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgdGhpcy5pc1JpZ2h0TGlzdCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvciggJ1Vua25vd24gbm9kZSB0eXBlICcgKyBub2RlLnR5cGUgKTtcbiAgICB9XG4gICAgdGhpcy5kZXB0aC0tO1xuICAgIHJldHVybiBleHByZXNzaW9uO1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLnJvb3RFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBST09UIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIGtleSwgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGZuO1xuXG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZVJvb3RFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFJPT1QgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExFRlRgLCBsZWZ0Lm5hbWUgfHwgbGVmdCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gU0NPUEVgLCBzY29wZSApO1xuICAgICAgICB2YXIgbGhzLCByZXN1bHQ7XG4gICAgICAgIHJlc3VsdCA9IGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSFNgLCBsaHMgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCAgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBsb29rdXAsIG5hbWU6IGxocy52YWx1ZSwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNlcXVlbmNlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBleHByZXNzaW9ucywgY29udGV4dCwgYXNzaWduICl7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgZm4sIGxpc3Q7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBTRVFVRU5DRSBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIGlmKCBBcnJheS5pc0FycmF5KCBleHByZXNzaW9ucyApICl7XG4gICAgICAgIGxpc3QgPSB0aGlzLmxpc3RFeHByZXNzaW9uKCBleHByZXNzaW9ucywgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgICAgIGZuID0gZnVuY3Rpb24gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgU0VRVUVOQ0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSVNUYCwgbGlzdCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBleGVjdXRlTGlzdCggbGlzdCwgc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3QgPSB0aGlzLnJlY3Vyc2UoIGV4cHJlc3Npb25zLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uV2l0aEV4cHJlc3Npb25SYW5nZSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgU0VRVUVOQ0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSVNUYCwgbGlzdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGxpc3QoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZm47XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuc3RhdGljTWVtYmVyRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBvYmplY3QsIHByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFNUQVRJQyBNRU1CRVIgRVhQUkVTU0lPTicsIG9iamVjdC50eXBlLCBwcm9wZXJ0eS50eXBlICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBpc1JpZ2h0RnVuY3Rpb24gPSBmYWxzZSxcbiAgICAgICAgaXNTYWZlID0gb2JqZWN0LnR5cGUgPT09IEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uLFxuICAgICAgICBmbiwgbGVmdCwgcmhzLCByaWdodDtcblxuICAgIHN3aXRjaCggb2JqZWN0LnR5cGUgKXtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5sb29rdXBFeHByZXNzaW9uKCBvYmplY3Qua2V5LCB0cnVlLCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIG9iamVjdCwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgc3dpdGNoKCBwcm9wZXJ0eS50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LklkZW50aWZpZXI6XG4gICAgICAgICAgICByaHMgPSByaWdodCA9IHByb3BlcnR5Lm5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJpZ2h0ID0gdGhpcy5yZWN1cnNlKCBwcm9wZXJ0eSwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgaXNSaWdodEZ1bmN0aW9uID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTVEFUSUMgTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMRUZUYCwgbGVmdC5uYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSSUdIVGAsIHJocyB8fCByaWdodC5uYW1lICk7XG4gICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApLFxuICAgICAgICAgICAgaW5kZXgsIHJlc3VsdDtcblxuICAgICAgICBpZiggIWlzU2FmZSB8fCAoIGxocyAhPT0gdm9pZCAwICYmIGxocyAhPT0gbnVsbCApICl7XG4gICAgICAgICAgICBpZiggaXNSaWdodEZ1bmN0aW9uICl7XG4gICAgICAgICAgICAgICAgcmhzID0gcmlnaHQoIHByb3BlcnR5LnR5cGUgPT09IEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb24gPyBzY29wZSA6IGxocywgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExIU2AsIGxocyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJIU2AsIHJocyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgIGlmKCAoIGludGVycHJldGVyLmlzTGVmdExpc3QgfHwgaW50ZXJwcmV0ZXIuaXNSaWdodExpc3QgKSAmJiBBcnJheS5pc0FycmF5KCBsaHMgKSApe1xuICAgICAgICAgICAgICAgIGluZGV4ID0gbGhzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gYXNzaWduKCBsaHNbIGluZGV4IF0sIHJocywgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBsaHMsIHJocywgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLnRocm93RXJyb3IgPSBmdW5jdGlvbiggbWVzc2FnZSApe1xuICAgIHZhciBlID0gbmV3IEVycm9yKCBtZXNzYWdlICk7XG4gICAgZS5jb2x1bW5OdW1iZXIgPSB0aGlzLmNvbHVtbjtcbiAgICB0aHJvdyBlO1xuICAgIC8vdGhyb3cgbmV3IEVycm9yKCBtZXNzYWdlICk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcblxuZXhwb3J0IHZhciBwcm90b2NvbCA9IG5ldyBOdWxsKCk7XG5cbnByb3RvY29sLmluaXQgICAgPSAnQEB0cmFuc2R1Y2VyL2luaXQnO1xucHJvdG9jb2wuc3RlcCAgICA9ICdAQHRyYW5zZHVjZXIvc3RlcCc7XG5wcm90b2NvbC5yZWR1Y2VkID0gJ0BAdHJhbnNkdWNlci9yZWR1Y2VkJztcbnByb3RvY29sLnJlc3VsdCAgPSAnQEB0cmFuc2R1Y2VyL3Jlc3VsdCc7XG5wcm90b2NvbC52YWx1ZSAgID0gJ0BAdHJhbnNkdWNlci92YWx1ZSc7XG5cbi8qKlxuICogQGNsYXNzIFRyYW5zZHVjZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6RnVuY3Rpb259IHhmXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUcmFuc2R1Y2VyKCB4ZiApe1xuICAgIHRoaXMueGYgPSB4Zjtcbn1cblxuVHJhbnNkdWNlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5UcmFuc2R1Y2VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRyYW5zZHVjZXI7XG5cbi8qKlxuICogQGZ1bmN0aW9uIFRyYW5zZHVjZXIjQEB0cmFuc2R1Y2VyL2luaXRcbiAqL1xuVHJhbnNkdWNlci5wcm90b3R5cGVbIHByb3RvY29sLmluaXQgXSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMueGZJbml0KCk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBUcmFuc2R1Y2VyI0BAdHJhbnNkdWNlci9zdGVwXG4gKi9cblRyYW5zZHVjZXIucHJvdG90eXBlWyBwcm90b2NvbC5zdGVwIF0gPSBmdW5jdGlvbiggdmFsdWUsIGlucHV0ICl7XG4gICAgcmV0dXJuIHRoaXMueGZTdGVwKCB2YWx1ZSwgaW5wdXQgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIFRyYW5zZHVjZXIjQEB0cmFuc2R1Y2VyL3Jlc3VsdFxuICovXG5UcmFuc2R1Y2VyLnByb3RvdHlwZVsgcHJvdG9jb2wucmVzdWx0IF0gPSBmdW5jdGlvbiggdmFsdWUgKXtcbiAgICByZXR1cm4gdGhpcy54ZlJlc3VsdCggdmFsdWUgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cblRyYW5zZHVjZXIucHJvdG90eXBlLnhmSW5pdCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMueGZbIHByb3RvY29sLmluaXQgXSgpO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuVHJhbnNkdWNlci5wcm90b3R5cGUueGZTdGVwID0gZnVuY3Rpb24oIHZhbHVlLCBpbnB1dCApe1xuICAgIHJldHVybiB0aGlzLnhmWyBwcm90b2NvbC5zdGVwIF0oIHZhbHVlLCBpbnB1dCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuVHJhbnNkdWNlci5wcm90b3R5cGUueGZSZXN1bHQgPSBmdW5jdGlvbiggdmFsdWUgKXtcbiAgICByZXR1cm4gdGhpcy54ZlsgcHJvdG9jb2wucmVzdWx0IF0oIHZhbHVlICk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCBMZXhlciBmcm9tICcuL2xleGVyJztcbmltcG9ydCBCdWlsZGVyIGZyb20gJy4vYnVpbGRlcic7XG5pbXBvcnQgSW50ZXJwcmV0ZXIgZnJvbSAnLi9pbnRlcnByZXRlcic7XG5pbXBvcnQgaGFzT3duUHJvcGVydHkgZnJvbSAnLi9oYXMtb3duLXByb3BlcnR5JztcbmltcG9ydCB7IHByb3RvY29sLCBUcmFuc2R1Y2VyIH0gZnJvbSAnLi90cmFuc2R1Y2VyJztcblxudmFyIGxleGVyID0gbmV3IExleGVyKCksXG4gICAgYnVpbGRlciA9IG5ldyBCdWlsZGVyKCBsZXhlciApLFxuICAgIGludHJlcHJldGVyID0gbmV3IEludGVycHJldGVyKCBidWlsZGVyICksXG5cbiAgICBjYWNoZSA9IG5ldyBOdWxsKCk7XG5cbi8qKlxuICogQGNsYXNzIEtleXBhdGhFeHBcbiAqIEBleHRlbmRzIFRyYW5zZHVjZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBwYXR0ZXJuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZmxhZ3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gS2V5cGF0aEV4cCggcGF0dGVybiwgZmxhZ3MgKXtcbiAgICB0eXBlb2YgcGF0dGVybiAhPT0gJ3N0cmluZycgJiYgKCBwYXR0ZXJuID0gJycgKTtcbiAgICB0eXBlb2YgZmxhZ3MgIT09ICdzdHJpbmcnICYmICggZmxhZ3MgPSAnJyApO1xuXG4gICAgdmFyIHRva2VucyA9IGhhc093blByb3BlcnR5KCBjYWNoZSwgcGF0dGVybiApID9cbiAgICAgICAgY2FjaGVbIHBhdHRlcm4gXSA6XG4gICAgICAgIGNhY2hlWyBwYXR0ZXJuIF0gPSBsZXhlci5sZXgoIHBhdHRlcm4gKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCB0aGlzLCB7XG4gICAgICAgICdmbGFncyc6IHtcbiAgICAgICAgICAgIHZhbHVlOiBmbGFncyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICdzb3VyY2UnOiB7XG4gICAgICAgICAgICB2YWx1ZTogcGF0dGVybixcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICdnZXR0ZXInOiB7XG4gICAgICAgICAgICB2YWx1ZTogaW50cmVwcmV0ZXIuY29tcGlsZSggdG9rZW5zLCBmYWxzZSApLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICdzZXR0ZXInOiB7XG4gICAgICAgICAgICB2YWx1ZTogaW50cmVwcmV0ZXIuY29tcGlsZSggdG9rZW5zLCB0cnVlICksXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfVxuICAgIH0gKTtcbn1cblxuS2V5cGF0aEV4cC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUcmFuc2R1Y2VyLnByb3RvdHlwZSApO1xuXG5LZXlwYXRoRXhwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEtleXBhdGhFeHA7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbktleXBhdGhFeHAucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCB0YXJnZXQsIGxvb2t1cCApe1xuICAgIHJldHVybiB0aGlzLmdldHRlciggdGFyZ2V0LCB1bmRlZmluZWQsIGxvb2t1cCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuS2V5cGF0aEV4cC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24oIHRhcmdldCwgbG9va3VwICl7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuZ2V0dGVyKCB0YXJnZXQsIHVuZGVmaW5lZCwgbG9va3VwICk7XG4gICAgcmV0dXJuIHR5cGVvZiByZXN1bHQgIT09ICd1bmRlZmluZWQnO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gS2V5cGF0aEV4cCNAQHRyYW5zZHVjZXIvc3RlcFxuICovXG5LZXlwYXRoRXhwLnByb3RvdHlwZVsgcHJvdG9jb2wuc3RlcCBdID0gZnVuY3Rpb24oIHZhbHVlLCBpbnB1dCApe1xuICAgIHJldHVybiB0aGlzLnhmU3RlcCggdmFsdWUsIHRoaXMuZ2V0KCBpbnB1dCApICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5LZXlwYXRoRXhwLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiggdGFyZ2V0LCB2YWx1ZSwgbG9va3VwICl7XG4gICAgcmV0dXJuIHRoaXMuc2V0dGVyKCB0YXJnZXQsIHZhbHVlLCBsb29rdXAgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbktleXBhdGhFeHAucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi5mbGFncyA9IHRoaXMuZmxhZ3M7XG4gICAganNvbi5zb3VyY2UgPSB0aGlzLnNvdXJjZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuS2V5cGF0aEV4cC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbn07XG5cbktleXBhdGhFeHAucHJvdG90eXBlLnRyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIga3BleCA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCB4ZiApe1xuICAgICAgICBUcmFuc2R1Y2VyLmNhbGwoIGtwZXgsIHhmICk7XG4gICAgICAgIHJldHVybiBrcGV4O1xuICAgIH07XG59OyJdLCJuYW1lcyI6WyJJZGVudGlmaWVyIiwiTnVtZXJpY0xpdGVyYWwiLCJOdWxsTGl0ZXJhbCIsIlB1bmN0dWF0b3IiLCJTdHJpbmdMaXRlcmFsIiwiR3JhbW1hci5JZGVudGlmaWVyIiwiR3JhbW1hci5OdW1lcmljTGl0ZXJhbCIsIkdyYW1tYXIuTnVsbExpdGVyYWwiLCJHcmFtbWFyLlB1bmN0dWF0b3IiLCJHcmFtbWFyLlN0cmluZ0xpdGVyYWwiLCJUb2tlbi5OdWxsTGl0ZXJhbCIsIlRva2VuLklkZW50aWZpZXIiLCJUb2tlbi5QdW5jdHVhdG9yIiwiVG9rZW4uU3RyaW5nTGl0ZXJhbCIsIlRva2VuLk51bWVyaWNMaXRlcmFsIiwiQXJyYXlFeHByZXNzaW9uIiwiQ2FsbEV4cHJlc3Npb24iLCJFeHByZXNzaW9uU3RhdGVtZW50IiwiTGl0ZXJhbCIsIk1lbWJlckV4cHJlc3Npb24iLCJQcm9ncmFtIiwiU2VxdWVuY2VFeHByZXNzaW9uIiwiU3ludGF4LkxpdGVyYWwiLCJTeW50YXguTWVtYmVyRXhwcmVzc2lvbiIsIlN5bnRheC5Qcm9ncmFtIiwiU3ludGF4LkFycmF5RXhwcmVzc2lvbiIsIlN5bnRheC5DYWxsRXhwcmVzc2lvbiIsIlN5bnRheC5FeHByZXNzaW9uU3RhdGVtZW50IiwiU3ludGF4LklkZW50aWZpZXIiLCJTeW50YXguU2VxdWVuY2VFeHByZXNzaW9uIiwiQmxvY2tFeHByZXNzaW9uIiwiRXhpc3RlbnRpYWxFeHByZXNzaW9uIiwiTG9va3VwRXhwcmVzc2lvbiIsIlJhbmdlRXhwcmVzc2lvbiIsIlJvb3RFeHByZXNzaW9uIiwiU2NvcGVFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb24iLCJOb2RlLkFycmF5RXhwcmVzc2lvbiIsIktleXBhdGhOb2RlLkJsb2NrRXhwcmVzc2lvbiIsIk5vZGUuQ2FsbEV4cHJlc3Npb24iLCJLZXlwYXRoTm9kZS5FeGlzdGVudGlhbEV4cHJlc3Npb24iLCJOb2RlLkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJOb2RlLklkZW50aWZpZXIiLCJOb2RlLk51bWVyaWNMaXRlcmFsIiwiTm9kZS5TdHJpbmdMaXRlcmFsIiwiTm9kZS5OdWxsTGl0ZXJhbCIsIktleXBhdGhOb2RlLkxvb2t1cEV4cHJlc3Npb24iLCJOb2RlLkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiIsIk5vZGUuU3RhdGljTWVtYmVyRXhwcmVzc2lvbiIsIk5vZGUuUHJvZ3JhbSIsIktleXBhdGhOb2RlLlJhbmdlRXhwcmVzc2lvbiIsIktleXBhdGhOb2RlLlJvb3RFeHByZXNzaW9uIiwiTm9kZS5TZXF1ZW5jZUV4cHJlc3Npb24iLCJjYWNoZSIsIktleXBhdGhTeW50YXguQmxvY2tFeHByZXNzaW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7Ozs7QUFLQSxTQUFTLElBQUksRUFBRSxFQUFFO0FBQ2pCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsQUFFbkM7O0FDVE8sSUFBSUEsWUFBVSxRQUFRLFlBQVksQ0FBQztBQUMxQyxBQUFPLElBQUlDLGdCQUFjLElBQUksU0FBUyxDQUFDO0FBQ3ZDLEFBQU8sSUFBSUMsYUFBVyxPQUFPLE1BQU0sQ0FBQztBQUNwQyxBQUFPLElBQUlDLFlBQVUsUUFBUSxZQUFZLENBQUM7QUFDMUMsQUFBTyxJQUFJQyxlQUFhLEtBQUssUUFBUTs7QUNEckMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7OztBQVFoQixTQUFTLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFOzs7O0lBSXpCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUM7Ozs7SUFJcEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Ozs7SUFJakIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Q0FDdEI7O0FBRUQsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDOztBQUU3QixLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7Ozs7OztBQU1wQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVO0lBQy9CLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7O0lBRXRCLElBQUksQ0FBQyxJQUFJLEdBQUcs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QUssRUFBRSxNQUFNLEVBQUU7SUFDOUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU07UUFDbkIsTUFBTSxHQUFHLElBQUksS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDO0lBQ2hDLFFBQVEsSUFBSSxDQUFDLE1BQU07UUFDZixLQUFLLENBQUM7WUFDRixNQUFNO1FBQ1YsS0FBSyxDQUFDO1lBQ0YsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ2hELE1BQU07UUFDVixLQUFLLENBQUM7WUFDRixNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDaEQsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ2hELE1BQU07UUFDVixLQUFLLENBQUM7WUFDRixNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDaEQsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ2hELE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUNoRCxNQUFNO1FBQ1YsS0FBSyxDQUFDO1lBQ0YsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ2hELE1BQU0sRUFBRSxDQUFDLEVB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