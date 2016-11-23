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

/**
 * @typedef {external:Function} MapCallback
 * @param {*} item
 * @param {external:number} index
 */

/**
 * @function
 * @param {Array-Like} list
 * @param {MapCallback} callback
 */
function map( list, callback ){
    var length = list.length,
        index, result;

    switch( length ){
        case 1:
            return [ callback( list[ 0 ], 0, list ) ];
        case 2:
            return [ callback( list[ 0 ], 0, list ), callback( list[ 1 ], 1, list ) ];
        case 3:
            return [ callback( list[ 0 ], 0, list ), callback( list[ 1 ], 1, list ), callback( list[ 2 ], 2, list ) ];
        default:
            index = 0;
            result = new Array( length );
            for( ; index < length; index++ ){
                result[ index ] = callback( list[ index ], index, list );
            }
    }

    return result;
}

function isDoubleQuote( char ){
    return char === '"';
}

function isIdentifierPart( char ){
    return isIdentifierStart( char ) || isNumeric( char );
}

function isIdentifierStart( char ){
    return 'a' <= char && char <= 'z' || 'A' <= char && char <= 'Z' || '_' === char || char === '$';
}

function isNumeric( char ){
    return '0' <= char && char <= '9';
}

function isPunctuator( char ){
    return '.,?()[]{}%~;'.indexOf( char ) !== -1;
}

function isQuote( char ){
    return isDoubleQuote( char ) || isSingleQuote( char );
}

function isSingleQuote( char ){
    return char === "'";
}

function isWhitespace( char ){
    return char === ' ' || char === '\r' || char === '\t' || char === '\n' || char === '\v' || char === '\u00A0';
}

var EndOfLine$1       = 'EndOfLine';
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

function EndOfLine$$1(){
    Token.call( this, EndOfLine$1, '' );
}

EndOfLine$$1.prototype = Object.create( Token.prototype );

EndOfLine$$1.prototype.constructor = EndOfLine$$1;

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

var scannerPrototype;

function isNotIdentifier( char ){
    return !isIdentifierPart( char );
}

function isNotNumeric( char ){
    return !isNumeric( char );
}

function Scanner( text ){
    /**
     * @member {external:string}
     * @default ''
     */
    this.source = text;
    /**
     * @member {external:number}
     */
    this.index = 0;
    /**
     * @member {external:number}
     */
    this.length = text.length;
}

scannerPrototype = Scanner.prototype = new Null();

scannerPrototype.constructor = Scanner;

scannerPrototype.eol = function(){
    return this.index >= this.length;
};

scannerPrototype.lex = function(){
    if( this.eol() ){
        return new EndOfLine$$1();
    }

    var char = this.source[ this.index ],
        word;

    // Identifier
    if( isIdentifierStart( char ) ){
        word = this.scan( isNotIdentifier );

        return word === 'null' ?
            new NullLiteral$$1( word ) :
            new Identifier$$1( word );

    // Punctuator
    } else if( isPunctuator( char ) ){
        this.index++;
        return new Punctuator$$1( char );

    // Quoted String
    } else if( isQuote( char ) ){
        this.index++;

        word = isDoubleQuote( char ) ?
            this.scan( isDoubleQuote ) :
            this.scan( isSingleQuote );

        this.index++;

        return new StringLiteral$$1( char + word + char );

    // Numeric
    } else if( isNumeric( char ) ){
        word = this.scan( isNotNumeric );

        return new NumericLiteral$$1( word );

    // Whitespace
    } else if( isWhitespace( char ) ){
        this.index++;

    // Error
    } else {
        throw new SyntaxError( '"' + char + '" is an invalid character' );
    }
};

/**
 * @function
 * @param {external:function} until A condition that when met will stop the scanning of the source
 * @returns {external:string} The portion of the source scanned
 */
scannerPrototype.scan = function( until ){
    var start = this.index,
        char;

    while( !this.eol() ){
        char = this.source[ this.index ];

        if( until( char ) ){
            break;
        }

        this.index++;
    }

    return this.source.slice( start, this.index );
};

/**
 * @function
 * @returns {external:Object} A JSON representation of the scanner
 */
scannerPrototype.toJSON = function(){
    var json = new Null();

    json.source = this.source;
    json.index  = this.index;
    json.length = this.length;

    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the scanner
 */
scannerPrototype.toString = function(){
    return this.source;
};

function toJSON( value ){
    return value.toJSON();
}

function toString( value ){
    return value.toString();
}

var lexerPrototype;

/**
 * @class Lexer
 * @extends Null
 */
function Lexer(){
    /**
     * @member {Array<Lexer~Token>}
     */
    this.tokens = [];
}

lexerPrototype = Lexer.prototype = new Null();

lexerPrototype.constructor = Lexer;

/**
 * @function
 * @param {external:string} text
 */
lexerPrototype.lex = function( text ){
    var scanner = new Scanner( text ),
        token;

    this.tokens = [];

    while( !scanner.eol() ){
        token = scanner.lex();
        if( token ){
            this.tokens[ this.tokens.length ] = token;
        }
    }

    return this.tokens;
};

/**
 * @function
 * @returns {external:Object} A JSON representation of the lexer
 */
lexerPrototype.toJSON = function(){
    var json = new Null();

    json.tokens = map( this.tokens, toJSON );

    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the lexer
 */
lexerPrototype.toString = function(){
    return map( this.tokens, toString ).join( '' );
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

    json.body = map( this.body, toJSON );
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

    json.elements = Array.isArray( this.elements ) ?
        map( this.elements, toJSON ) :
        this.elements.toJSON();

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
    json.arguments = map( this.arguments, toJSON );

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

    json.expressions = Array.isArray( this.expressions ) ?
        map( this.expressions, toJSON ) :
        this.expressions.toJSON();

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
    if( !isQuote( raw[ 0 ] ) ){
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

var builderPrototype;

function unshift( list, item ){
    var index = 0,
        length = list.length,
        t1 = item,
        t2 = item;

    for( ; index < length; index++ ){
        t1 = t2;
        t2 = list[ index ];
        list[ index ] = t1;
    }

    list[ length ] = t2;

    return list;
}

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
            unshift( block, this.consume() );
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
            throw new TypeError( 'lexer is not defined' );
        }

        /**
         * @member {external:Array<Token>}
         */
        this.tokens = this.lexer.lex( input );
    } else if( Array.isArray( input ) ){
        this.tokens = input.slice();
        this.text = input.join( '' );
    } else {
        throw new TypeError( 'invalid input' );
    }
    //console.log( 'BUILD' );
    //console.log( '- ', this.text.length, 'CHARS', this.text );
    //console.log( '- ', this.tokens.length, 'TOKENS', this.tokens );
    this.column = this.text.length;
    this.line = 1;

    var program = this.program();

    if( this.tokens.length ){
        throw new SyntaxError( 'Unexpected token ' + this.tokens[ 0 ] + ' remaining' );
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
        throw new SyntaxError( 'Unexpected end of expression' );
    }

    var token = this.expect( expected );

    if( !token ){
        throw new SyntaxError( 'Unexpected token ' + token.value + ' consumed' );
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
        this.tokens[ this.tokens.length-- ];
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
                throw new SyntaxError( 'Unexpected token: ' + token );
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

    if( !( token.type === Identifier$1 ) ){
        throw new TypeError( 'Identifier expected' );
    }

    return new Identifier$2( token.value );
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
                unshift( list, expression );
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
        raw = token.value;

    switch( token.type ){
        case NumericLiteral$1:
            return new NumericLiteral$2( raw );
        case StringLiteral$1:
            return new StringLiteral$2( raw );
        case NullLiteral$1:
            return new NullLiteral$2( raw );
        default:
            throw new TypeError( 'Literal expected' );
    }
};

builderPrototype.lookup = function( next ){
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
            throw new SyntaxError( 'token cannot be a lookup' );
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
            unshift( body, this.expressionStatement() );
        } else {
            return new Program$$1( body );
        }
    }
};

builderPrototype.rangeExpression = function( right ){
    var left;

    this.expect( '.' );
    this.expect( '.' );

    left = this.peek().type === NumericLiteral$1 ?
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

var noop = function(){};
var interpreterPrototype;

/**
 * @function Interpreter~getter
 * @param {external:Object} object
 * @param {external:string} key
 * @returns {*} The value of the 'key' property on 'object'.
 */
function getter( object, key ){
    return object[ key ];
}

/**
 * @function Interpreter~returnValue
 * @param {*} value
 * @param {external:number} depth
 * @returns {*|external:Object} The decided value
 */
function returnValue( value, depth ){
    return !depth ? value : {};
}

/**
 * @function Interpreter~returnZero
 * @returns {external:number} zero
 */
function returnZero(){
    return 0;
}

/**
 * @function Interpreter~setter
 * @param {external:Object} object
 * @param {external:string} key
 * @param {*} value
 * @returns {*} The value of the 'key' property on 'object'.
 */
function setter( object, key, value ){
    if( !hasOwnProperty( object, key ) ){
        object[ key ] = value || {};
    }
    return getter( object, key );
}

/**
 * @class Interpreter
 * @extends Null
 * @param {Builder} builder
 */
function Interpreter( builder ){
    if( !arguments.length ){
        throw new TypeError( 'builder cannot be undefined' );
    }

    /**
     * @member {Builder} Interpreter#builder
     */
    this.builder = builder;
}

interpreterPrototype = Interpreter.prototype = new Null();

interpreterPrototype.constructor = Interpreter;

interpreterPrototype.arrayExpression = function( elements, context, assign ){
    //console.log( 'Composing ARRAY EXPRESSION', elements.length );
    var interpreter = this,
        depth = interpreter.depth,
        list;
    if( Array.isArray( elements ) ){
        list = map( elements, function( element ){
            return interpreter.listExpressionElement( element, false, assign );
        } );

        return function executeArrayExpression( scope, assignment, lookup ){
            //console.log( 'Executing ARRAY EXPRESSION' );
            //console.log( '- executeArrayExpression LIST', list );
            //console.log( '- executeArrayExpression DEPTH', depth );
            var value = returnValue( assignment, depth ),
                result = map( list, function( expression ){
                    return assign( scope, expression( scope, assignment, lookup ), value );
                } );
            result.length === 1 && ( result = result[ 0 ] );
            //console.log( '- executeArrayExpression RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    } else {
        list = interpreter.recurse( elements, false, assign );

        return function executeArrayExpression( scope, assignment, lookup ){
            //console.log( 'Executing ARRAY EXPRESSION' );
            //console.log( '- executeArrayExpression LIST', list.name );
            //console.log( '- executeArrayExpression DEPTH', depth );
            var keys = list( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result = map( keys, function( key ){
                    return assign( scope, key, value );
                } );
            //console.log( '- executeArrayExpression RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    }
};

interpreterPrototype.blockExpression = function( tokens, context, assign ){
    //console.log( 'Composing BLOCK', tokens.join( '' ) );
    var interpreter = this,
        program = interpreter.builder.build( tokens ),
        expression = interpreter.recurse( program.body[ 0 ].expression, false, assign );

    return function executeBlockExpression( scope, assignment, lookup ){
        //console.log( 'Executing BLOCK' );
        //console.log( '- executeBlockExpression SCOPE', scope );
        //console.log( '- executeBlockExpression EXPRESSION', expression.name );
        var result = expression( scope, assignment, lookup );
        //console.log( '- executeBlockExpression RESULT', result );
        return context ?
            { context: scope, name: void 0, value: result } :
            result;
    };
};

interpreterPrototype.callExpression = function( callee, args, context, assign ){
    //console.log( 'Composing CALL EXPRESSION' );
    var interpreter = this,
        isSetting = assign === setter,
        left = interpreter.recurse( callee, true, assign ),
        list = map( args, function( arg ){
            return interpreter.listExpressionElement( arg, false, assign );
        } );

    return function executeCallExpression( scope, assignment, lookup ){
        //console.log( 'Executing CALL EXPRESSION' );
        //console.log( '- executeCallExpression args', args.length );
        var lhs = left( scope, assignment, lookup ),
            args = map( list, function( arg ){
                return arg( scope, assignment, lookup );
            } ),
            result;
        //console.log( '- executeCallExpression LHS', lhs );
        result = lhs.value.apply( lhs.context, args );
        if( isSetting && typeof lhs.value === 'undefined' ){
            throw new Error( 'cannot create call expressions' );
        }
        //console.log( '- executeCallExpression RESULT', result );
        return context ?
            { value: result }:
            result;
    };
};

/**
 * @function
 * @param {external:string} expression
 */
interpreterPrototype.compile = function( expression, create ){
    var interpreter = this,
        program = interpreter.builder.build( expression ),
        body = program.body,

        assign, expressions;

    interpreter.depth = -1;
    interpreter.isSplit = interpreter.isLeftSplit = interpreter.isRightSplit = false;

    if( typeof create !== 'boolean' ){
        create = false;
    }

    assign = create ?
        setter :
        getter;

    /**
     * @member {external:string}
     */
    interpreter.expression = interpreter.builder.text;
    //console.log( '-------------------------------------------------' );
    //console.log( 'Interpreting' );
    //console.log( '-------------------------------------------------' );
    //console.log( 'Program', program.range );
    switch( body.length ){
        case 0:
            return noop;
        case 1:
            return interpreter.recurse( body[ 0 ].expression, false, assign );
        default:
            expressions = map( body, function( statement ){
                return interpreter.recurse( statement.expression, false, assign );
            } );
            return function executeProgram( scope, assignment, lookup ){
                var values = map( expressions, function( expression ){
                        return expression( scope, assignment, lookup );
                    } );
                return values[ values.length - 1 ];
            };
    }
};

interpreterPrototype.computedMemberExpression = function( object, property, context, assign ){
    //console.log( 'Composing COMPUTED MEMBER EXPRESSION', object.type, property.type );
    var interpreter = this,
        depth = interpreter.depth,
        isSafe = object.type === ExistentialExpression$1,
        left = interpreter.recurse( object, false, assign ),
        right = interpreter.recurse( property, false, assign );

    if( !interpreter.isSplit ){
        return function executeComputedMemberExpression( scope, assignment, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( '- executeComputedMemberExpression LEFT ', left.name );
            //console.log( '- executeComputedMemberExpression RIGHT', right.name );
            var lhs = left( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, assignment, lookup );
                //console.log( '- executeComputedMemberExpression DEPTH', depth );
                //console.log( '- executeComputedMemberExpression LHS', lhs );
                //console.log( '- executeComputedMemberExpression RHS', rhs );
                result = assign( lhs, rhs, value );
            }
            //console.log( '- executeComputedMemberExpression RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else if( interpreter.isLeftSplit && !interpreter.isRightSplit ){
        return function executeComputedMemberExpression( scope, assignment, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( '- executeComputedMemberExpression LEFT ', left.name );
            //console.log( '- executeComputedMemberExpression RIGHT', right.name );
            var lhs = left( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, assignment, lookup );
                //console.log( '- executeComputedMemberExpression DEPTH', depth );
                //console.log( '- executeComputedMemberExpression LHS', lhs );
                //console.log( '- executeComputedMemberExpression RHS', rhs );
                result = map( lhs, function( object ){
                    return assign( object, rhs, value );
                } );
            }
            //console.log( '- executeComputedMemberExpression RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else if( !interpreter.isLeftSplit && interpreter.isRightSplit ){
        return function executeComputedMemberExpression( scope, assignment, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( '- executeComputedMemberExpression LEFT ', left.name );
            //console.log( '- executeComputedMemberExpression RIGHT', right.name );
            var lhs = left( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, assignment, lookup );
                //console.log( '- executeComputedMemberExpression DEPTH', depth );
                //console.log( '- executeComputedMemberExpression LHS', lhs );
                //console.log( '- executeComputedMemberExpression RHS', rhs );
                result = map( rhs, function( key ){
                    return assign( lhs, key, value );
                } );
            }
            //console.log( '- executeComputedMemberExpression RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else {
        return function executeComputedMemberExpression( scope, assignment, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( '- executeComputedMemberExpression LEFT ', left.name );
            //console.log( '- executeComputedMemberExpression RIGHT', right.name );
            var lhs = left( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, assignment, lookup );
                //console.log( '- executeComputedMemberExpression DEPTH', depth );
                //console.log( '- executeComputedMemberExpression LHS', lhs );
                //console.log( '- executeComputedMemberExpression RHS', rhs );
                result = map( lhs, function( object ){
                    return map( rhs, function( key ){
                        return assign( object, key, value );
                    } );
                } );
            }
            //console.log( '- executeComputedMemberExpression RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    }
};

interpreterPrototype.existentialExpression = function( expression, context, assign ){
    //console.log( 'Composing EXISTENTIAL EXPRESSION', expression.type );
    var left = this.recurse( expression, false, assign );

    return function executeExistentialExpression( scope, assignment, lookup ){
        var result;
        //console.log( 'Executing EXISTENTIAL EXPRESSION' );
        //console.log( '- executeExistentialExpression LEFT', left.name );
        if( scope ){
            try {
                result = left( scope, assignment, lookup );
            } catch( e ){
                result = void 0;
            }
        }
        //console.log( '- executeExistentialExpression RESULT', result );
        return context ?
            { value: result } :
            result;
    };
};

interpreterPrototype.identifier = function( name, context, assign ){
    //console.log( 'Composing IDENTIFIER', name );
    var depth = this.depth;

    return function executeIdentifier( scope, assignment, lookup ){
        //console.log( 'Executing IDENTIFIER' );
        //console.log( '- executeIdentifier NAME', name );
        //console.log( '- executeIdentifier VALUE', value );
        var value = returnValue( assignment, depth ),
            result = assign( scope, name, value );
        //console.log( '- executeIdentifier RESULT', result );
        return context ?
            { context: scope, name: name, value: result } :
            result;
    };
};

interpreterPrototype.listExpressionElement = function( element, context, assign ){
    var interpreter = this;

    switch( element.type ){
        case Literal$1:
            return interpreter.literal( element.value, context );
        case LookupExpression$1:
            return interpreter.lookupExpression( element.key, false, context, assign );
        case RootExpression$1:
            return interpreter.rootExpression( element.key, context, assign );
        case BlockExpression$1:
            return interpreter.blockExpression( element.body, context, assign );
        default:
            throw new SyntaxError( 'Unexpected list element type: ' + element.type );
    }
};

interpreterPrototype.literal = function( value, context ){
    //console.log( 'Composing LITERAL', value );
    return function executeLiteral(){
        //console.log( 'Executing LITERAL' );
        //console.log( '- executeLiteral RESULT', value );
        return context ?
            { context: void 0, name: void 0, value: value } :
            value;
    };
};

interpreterPrototype.lookupExpression = function( key, resolve, context, assign ){
    //console.log( 'Composing LOOKUP EXPRESSION', key );
    var interpreter = this,
        isComputed = false,
        lhs = {},
        left;

    switch( key.type ){
        case Identifier$3:
            left = interpreter.identifier( key.name, true, assign );
            break;
        case Literal$1:
            isComputed = true;
            lhs.value = left = key.value;
            break;
        default:
            left = interpreter.recurse( key, true, assign );
    }

    return function executeLookupExpression( scope, assignment, lookup ){
        //console.log( 'Executing LOOKUP EXPRESSION' );
        //console.log( '- executeLookupExpression LEFT', left.name || left );
        var result;
        if( !isComputed ){
            lhs = left( lookup, assignment, scope );
            result = lhs.value;
        } else {
            result = assign( lookup, lhs.value, void 0 );
        }
        // Resolve lookups that are the object of an object-property relationship
        if( resolve ){
            result = assign( scope, result, void 0 );
        }
        //console.log( '- executeLookupExpression LHS', lhs );
        //console.log( '- executeLookupExpression RESULT', result  );
        return context ?
            { context: lookup, name: lhs.value, value: result } :
            result;
    };
};

interpreterPrototype.rangeExpression = function( lowerBound, upperBound, context, assign ){
    //console.log( 'Composing RANGE EXPRESSION' );
    var interpreter = this,
        left = lowerBound !== null ?
            interpreter.recurse( lowerBound, false, assign ) :
            returnZero,
        right = upperBound !== null ?
            interpreter.recurse( upperBound, false, assign ) :
            returnZero,
        index, lhs, middle, result, rhs;

    return function executeRangeExpression( scope, assignment, lookup ){
        //console.log( 'Executing RANGE EXPRESSION' );
        //console.log( '- executeRangeExpression LEFT', left.name );
        //console.log( '- executeRangeExpression RIGHT', right.name );
        lhs = left( scope, assignment, lookup );
        rhs = right( scope, assignment, lookup );
        result = [];
        index = 1;
        //console.log( '- executeRangeExpression LHS', lhs );
        //console.log( '- executeRangeExpression RHS', rhs );
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
        //console.log( '- executeRangeExpression RESULT', result );
        return context ?
            { value: result } :
            result;
    };
};

/**
 * @function
 */
interpreterPrototype.recurse = function( node, context, assign ){
    //console.log( 'Recursing', node.type );
    var interpreter = this,
        expression = null;

    interpreter.depth++;

    switch( node.type ){
        case ArrayExpression$1:
            expression = interpreter.arrayExpression( node.elements, context, assign );
            interpreter.isSplit = interpreter.isLeftSplit = node.elements.length > 1;
            break;
        case CallExpression$1:
            expression = interpreter.callExpression( node.callee, node.arguments, context, assign );
            break;
        case BlockExpression$1:
            expression = interpreter.blockExpression( node.body, context, assign );
            break;
        case ExistentialExpression$1:
            expression = interpreter.existentialExpression( node.expression, context, assign );
            break;
        case Identifier$3:
            expression = interpreter.identifier( node.name, context, assign );
            break;
        case Literal$1:
            expression = interpreter.literal( node.value, context );
            break;
        case MemberExpression$1:
            expression = node.computed ?
                interpreter.computedMemberExpression( node.object, node.property, context, assign ) :
                interpreter.staticMemberExpression( node.object, node.property, context, assign );
            break;
        case LookupExpression$1:
            expression = interpreter.lookupExpression( node.key, false, context, assign );
            break;
        case RangeExpression$1:
            expression = interpreter.rangeExpression( node.left, node.right, context, assign );
            break;
        case RootExpression$1:
            expression = interpreter.rootExpression( node.key, context, assign );
            break;
        case SequenceExpression$1:
            expression = interpreter.sequenceExpression( node.expressions, context, assign );
            interpreter.isSplit = interpreter.isRightSplit = true;
            break;
        default:
            throw new SyntaxError( 'Unknown node type: ' + node.type );
    }

    interpreter.depth--;

    return expression;
};

interpreterPrototype.rootExpression = function( key, context, assign ){
    //console.log( 'Composing ROOT EXPRESSION' );
    var left = this.recurse( key, false, assign );

    return function executeRootExpression( scope, assignment, lookup ){
        //console.log( 'Executing ROOT EXPRESSION' );
        //console.log( '- executeRootExpression LEFT', left.name || left );
        //console.log( '- executeRootExpression SCOPE', scope );
        var result = left( scope, assignment, lookup );
        //console.log( '- executeRootExpression LHS', lhs );
        //console.log( '- executeRootExpression RESULT', result  );
        return context ?
            { context: lookup, name: result.value, value: result } :
            result;
    };
};

interpreterPrototype.sequenceExpression = function( expressions, context, assign ){
    //console.log( 'Composing SEQUENCE EXPRESSION', expressions.length );
    var interpreter = this,
        depth = interpreter.depth,
        list;
    if( Array.isArray( expressions ) ){
        list = map( expressions, function( expression ){
            return interpreter.listExpressionElement( expression, false, assign );
        } );

        return function executeSequenceExpression( scope, assignment, lookup ){
            //console.log( 'Executing SEQUENCE EXPRESSION' );
            //console.log( '- executeSequenceExpression LIST', list );
            //console.log( '- executeSequenceExpression DEPTH', depth );
            var value = returnValue( assignment, depth ),
                result = map( list, function( expression ){
                    return expression( scope, value, lookup );
                } );
            //console.log( '- executeSequenceExpression RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    } else {
        list = interpreter.recurse( expressions, false, assign );

        return function executeSequenceExpression( scope, assignment, lookup ){
            //console.log( 'Executing SEQUENCE EXPRESSION' );
            //console.log( '- executeSequenceExpression LIST', list.name );
            //console.log( '- executeSequenceExpression DEPTH', depth );
            var value = returnValue( assignment, depth ),
                result = list( scope, value, lookup );
            //console.log( '- executeSequenceExpression RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    }
};

interpreterPrototype.staticMemberExpression = function( object, property, context, assign ){
    //console.log( 'Composing STATIC MEMBER EXPRESSION', object.type, property.type );
    var interpreter = this,
        depth = interpreter.depth,
        isComputed = false,
        isSafe = false,
        left, rhs, right;

    switch( object.type ){
        case LookupExpression$1:
            left = interpreter.lookupExpression( object.key, true, false, assign );
            break;
        case ExistentialExpression$1:
            isSafe = true;
        default:
            left = interpreter.recurse( object, false, assign );
    }

    switch( property.type ){
        case Identifier$3:
            isComputed = true;
            rhs = right = property.name;
            break;
        default:
            right = interpreter.recurse( property, false, assign );
    }

    return interpreter.isSplit ?
        function executeStaticMemberExpression( scope, assignment, lookup ){
            //console.log( 'Executing STATIC MEMBER EXPRESSION' );
            //console.log( '- executeStaticMemberExpression LEFT', left.name );
            //console.log( '- executeStaticMemberExpression RIGHT', rhs || right.name );
            var lhs = left( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result;

            if( !isSafe || lhs ){
                if( !isComputed ){
                    rhs = right( property.type === RootExpression$1 ? scope : lhs, assignment, lookup );
                }
                //console.log( '- executeStaticMemberExpression LHS', lhs );
                //console.log( '- executeStaticMemberExpression RHS', rhs );
                //console.log( '- executeStaticMemberExpression DEPTH', depth );
                result = map( lhs, function( object ){
                    return assign( object, rhs, value );
                } );
            }
            //console.log( '- executeStaticMemberExpression RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        } :
        function executeStaticMemberExpression( scope, assignment, lookup ){
            //console.log( 'Executing STATIC MEMBER EXPRESSION' );
            //console.log( '- executeStaticMemberExpression LEFT', left.name );
            //console.log( '- executeStaticMemberExpression RIGHT', rhs || right.name );
            var lhs = left( scope, assignment, lookup ),
                value = returnValue( assignment, depth ),
                result;

            if( !isSafe || lhs ){
                if( !isComputed ){
                    rhs = right( property.type === RootExpression$1 ? scope : lhs, assignment, lookup );
                }
                //console.log( '- executeStaticMemberExpression LHS', lhs );
                //console.log( '- executeStaticMemberExpression RHS', rhs );
                //console.log( '- executeStaticMemberExpression DEPTH', depth );
                result = assign( lhs, rhs, value );
            }
            //console.log( '- executeStaticMemberExpression RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
};

var lexer = new Lexer();
var builder = new Builder( lexer );
var intrepreter = new Interpreter( builder );
var cache = new Null();
var expPrototype;

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

expPrototype = KeypathExp.prototype = new Null();

expPrototype.constructor = KeypathExp;

/**
 * @function
 */
expPrototype.get = function( target, lookup ){
    return this.getter( target, undefined, lookup );
};

/**
 * @function
 */
expPrototype.has = function( target, lookup ){
    var result = this.getter( target, undefined, lookup );
    return typeof result !== 'undefined';
};

/**
 * @function
 */
expPrototype.set = function( target, value, lookup ){
    return this.setter( target, value, lookup );
};

/**
 * @function
 */
expPrototype.toJSON = function(){
    var json = new Null();

    json.flags = this.flags;
    json.source = this.source;

    return json;
};

/**
 * @function
 */
expPrototype.toString = function(){
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VzIjpbIm51bGwuanMiLCJtYXAuanMiLCJjaGFyYWN0ZXIuanMiLCJncmFtbWFyLmpzIiwidG9rZW4uanMiLCJzY2FubmVyLmpzIiwidG8tanNvbi5qcyIsInRvLXN0cmluZy5qcyIsImxleGVyLmpzIiwic3ludGF4LmpzIiwibm9kZS5qcyIsImtleXBhdGgtc3ludGF4LmpzIiwiaGFzLW93bi1wcm9wZXJ0eS5qcyIsImtleXBhdGgtbm9kZS5qcyIsImJ1aWxkZXIuanMiLCJpbnRlcnByZXRlci5qcyIsImV4cC5qcyIsInRyYW5zZm9ybWVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQSBcImNsZWFuXCIsIGVtcHR5IGNvbnRhaW5lci4gSW5zdGFudGlhdGluZyB0aGlzIGlzIGZhc3RlciB0aGFuIGV4cGxpY2l0bHkgY2FsbGluZyBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYC5cbiAqIEBjbGFzcyBOdWxsXG4gKiBAZXh0ZW5kcyBleHRlcm5hbDpudWxsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE51bGwoKXt9XG5OdWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbk51bGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIE51bGw7IiwiLyoqXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6RnVuY3Rpb259IE1hcENhbGxiYWNrXG4gKiBAcGFyYW0geyp9IGl0ZW1cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxuICovXG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0FycmF5LUxpa2V9IGxpc3RcbiAqIEBwYXJhbSB7TWFwQ2FsbGJhY2t9IGNhbGxiYWNrXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1hcCggbGlzdCwgY2FsbGJhY2sgKXtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGgsXG4gICAgICAgIGluZGV4LCByZXN1bHQ7XG5cbiAgICBzd2l0Y2goIGxlbmd0aCApe1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICByZXR1cm4gWyBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICkgXTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIFsgY2FsbGJhY2soIGxpc3RbIDAgXSwgMCwgbGlzdCApLCBjYWxsYmFjayggbGlzdFsgMSBdLCAxLCBsaXN0ICkgXTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIFsgY2FsbGJhY2soIGxpc3RbIDAgXSwgMCwgbGlzdCApLCBjYWxsYmFjayggbGlzdFsgMSBdLCAxLCBsaXN0ICksIGNhbGxiYWNrKCBsaXN0WyAyIF0sIDIsIGxpc3QgKSBdO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBsZW5ndGggKTtcbiAgICAgICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGNhbGxiYWNrKCBsaXN0WyBpbmRleCBdLCBpbmRleCwgbGlzdCApO1xuICAgICAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGlzRG91YmxlUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJ1wiJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSWRlbnRpZmllclBhcnQoIGNoYXIgKXtcbiAgICByZXR1cm4gaXNJZGVudGlmaWVyU3RhcnQoIGNoYXIgKSB8fCBpc051bWVyaWMoIGNoYXIgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICl7XG4gICAgcmV0dXJuICdhJyA8PSBjaGFyICYmIGNoYXIgPD0gJ3onIHx8ICdBJyA8PSBjaGFyICYmIGNoYXIgPD0gJ1onIHx8ICdfJyA9PT0gY2hhciB8fCBjaGFyID09PSAnJCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc051bWVyaWMoIGNoYXIgKXtcbiAgICByZXR1cm4gJzAnIDw9IGNoYXIgJiYgY2hhciA8PSAnOSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1B1bmN0dWF0b3IoIGNoYXIgKXtcbiAgICByZXR1cm4gJy4sPygpW117fSV+OycuaW5kZXhPZiggY2hhciApICE9PSAtMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gaXNEb3VibGVRdW90ZSggY2hhciApIHx8IGlzU2luZ2xlUXVvdGUoIGNoYXIgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2luZ2xlUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gXCInXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1doaXRlc3BhY2UoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJyAnIHx8IGNoYXIgPT09ICdcXHInIHx8IGNoYXIgPT09ICdcXHQnIHx8IGNoYXIgPT09ICdcXG4nIHx8IGNoYXIgPT09ICdcXHYnIHx8IGNoYXIgPT09ICdcXHUwMEEwJztcbn0iLCJleHBvcnQgdmFyIEVuZE9mTGluZSAgICAgICA9ICdFbmRPZkxpbmUnO1xuZXhwb3J0IHZhciBJZGVudGlmaWVyICAgICAgPSAnSWRlbnRpZmllcic7XG5leHBvcnQgdmFyIE51bWVyaWNMaXRlcmFsICA9ICdOdW1lcmljJztcbmV4cG9ydCB2YXIgTnVsbExpdGVyYWwgICAgID0gJ051bGwnO1xuZXhwb3J0IHZhciBQdW5jdHVhdG9yICAgICAgPSAnUHVuY3R1YXRvcic7XG5leHBvcnQgdmFyIFN0cmluZ0xpdGVyYWwgICA9ICdTdHJpbmcnOyIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBHcmFtbWFyIGZyb20gJy4vZ3JhbW1hcic7XG5cbnZhciB0b2tlbklkID0gMDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+VG9rZW5cbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlIFRoZSB0eXBlIG9mIHRoZSB0b2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgdG9rZW5cbiAqL1xuZnVuY3Rpb24gVG9rZW4oIHR5cGUsIHZhbHVlICl7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBMZXhlcn5Ub2tlbiNpZFxuICAgICAqL1xuICAgIHRoaXMuaWQgPSArK3Rva2VuSWQ7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBMZXhlcn5Ub2tlbiN0eXBlXG4gICAgICovXG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IExleGVyflRva2VuI3ZhbHVlXG4gICAgICovXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuXG5Ub2tlbi5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5Ub2tlbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUb2tlbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xuVG9rZW4ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi50eXBlID0gdGhpcy50eXBlO1xuICAgIGpzb24udmFsdWUgPSB0aGlzLnZhbHVlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRva2VuXG4gKi9cblRva2VuLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFN0cmluZyggdGhpcy52YWx1ZSApO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIEVuZE9mTGluZSgpe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuRW5kT2ZMaW5lLCAnJyApO1xufVxuXG5FbmRPZkxpbmUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbkVuZE9mTGluZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbmRPZkxpbmU7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfklkZW50aWZpZXJcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElkZW50aWZpZXIoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5JZGVudGlmaWVyLCB2YWx1ZSApO1xufVxuXG5JZGVudGlmaWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5JZGVudGlmaWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IElkZW50aWZpZXI7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfk51bWVyaWNMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdW1lcmljTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLk51bWVyaWNMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVtZXJpY0xpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfk51bGxMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdWxsTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLk51bGxMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuTnVsbExpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVsbExpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflB1bmN0dWF0b3JcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFB1bmN0dWF0b3IoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5QdW5jdHVhdG9yLCB2YWx1ZSApO1xufVxuXG5QdW5jdHVhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5QdW5jdHVhdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFB1bmN0dWF0b3I7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflN0cmluZ0xpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0cmluZ0xpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5TdHJpbmdMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0cmluZ0xpdGVyYWw7IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIENoYXJhY3RlciBmcm9tICcuL2NoYXJhY3Rlcic7XG5pbXBvcnQgKiBhcyBUb2tlbiBmcm9tICcuL3Rva2VuJztcblxudmFyIHNjYW5uZXJQcm90b3R5cGU7XG5cbmZ1bmN0aW9uIGlzTm90SWRlbnRpZmllciggY2hhciApe1xuICAgIHJldHVybiAhQ2hhcmFjdGVyLmlzSWRlbnRpZmllclBhcnQoIGNoYXIgKTtcbn1cblxuZnVuY3Rpb24gaXNOb3ROdW1lcmljKCBjaGFyICl7XG4gICAgcmV0dXJuICFDaGFyYWN0ZXIuaXNOdW1lcmljKCBjaGFyICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNjYW5uZXIoIHRleHQgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJydcbiAgICAgKi9cbiAgICB0aGlzLnNvdXJjZSA9IHRleHQ7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuaW5kZXggPSAwO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxlbmd0aCA9IHRleHQubGVuZ3RoO1xufVxuXG5zY2FubmVyUHJvdG90eXBlID0gU2Nhbm5lci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5zY2FubmVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2Nhbm5lcjtcblxuc2Nhbm5lclByb3RvdHlwZS5lb2wgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmluZGV4ID49IHRoaXMubGVuZ3RoO1xufTtcblxuc2Nhbm5lclByb3RvdHlwZS5sZXggPSBmdW5jdGlvbigpe1xuICAgIGlmKCB0aGlzLmVvbCgpICl7XG4gICAgICAgIHJldHVybiBuZXcgVG9rZW4uRW5kT2ZMaW5lKCk7XG4gICAgfVxuXG4gICAgdmFyIGNoYXIgPSB0aGlzLnNvdXJjZVsgdGhpcy5pbmRleCBdLFxuICAgICAgICB3b3JkO1xuXG4gICAgLy8gSWRlbnRpZmllclxuICAgIGlmKCBDaGFyYWN0ZXIuaXNJZGVudGlmaWVyU3RhcnQoIGNoYXIgKSApe1xuICAgICAgICB3b3JkID0gdGhpcy5zY2FuKCBpc05vdElkZW50aWZpZXIgKTtcblxuICAgICAgICByZXR1cm4gd29yZCA9PT0gJ251bGwnID9cbiAgICAgICAgICAgIG5ldyBUb2tlbi5OdWxsTGl0ZXJhbCggd29yZCApIDpcbiAgICAgICAgICAgIG5ldyBUb2tlbi5JZGVudGlmaWVyKCB3b3JkICk7XG5cbiAgICAvLyBQdW5jdHVhdG9yXG4gICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNQdW5jdHVhdG9yKCBjaGFyICkgKXtcbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICByZXR1cm4gbmV3IFRva2VuLlB1bmN0dWF0b3IoIGNoYXIgKTtcblxuICAgIC8vIFF1b3RlZCBTdHJpbmdcbiAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc1F1b3RlKCBjaGFyICkgKXtcbiAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgIHdvcmQgPSBDaGFyYWN0ZXIuaXNEb3VibGVRdW90ZSggY2hhciApID9cbiAgICAgICAgICAgIHRoaXMuc2NhbiggQ2hhcmFjdGVyLmlzRG91YmxlUXVvdGUgKSA6XG4gICAgICAgICAgICB0aGlzLnNjYW4oIENoYXJhY3Rlci5pc1NpbmdsZVF1b3RlICk7XG5cbiAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgIHJldHVybiBuZXcgVG9rZW4uU3RyaW5nTGl0ZXJhbCggY2hhciArIHdvcmQgKyBjaGFyICk7XG5cbiAgICAvLyBOdW1lcmljXG4gICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNOdW1lcmljKCBjaGFyICkgKXtcbiAgICAgICAgd29yZCA9IHRoaXMuc2NhbiggaXNOb3ROdW1lcmljICk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBUb2tlbi5OdW1lcmljTGl0ZXJhbCggd29yZCApO1xuXG4gICAgLy8gV2hpdGVzcGFjZVxuICAgIH0gZWxzZSBpZiggQ2hhcmFjdGVyLmlzV2hpdGVzcGFjZSggY2hhciApICl7XG4gICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgIC8vIEVycm9yXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAnXCInICsgY2hhciArICdcIiBpcyBhbiBpbnZhbGlkIGNoYXJhY3RlcicgKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpmdW5jdGlvbn0gdW50aWwgQSBjb25kaXRpb24gdGhhdCB3aGVuIG1ldCB3aWxsIHN0b3AgdGhlIHNjYW5uaW5nIG9mIHRoZSBzb3VyY2VcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IFRoZSBwb3J0aW9uIG9mIHRoZSBzb3VyY2Ugc2Nhbm5lZFxuICovXG5zY2FubmVyUHJvdG90eXBlLnNjYW4gPSBmdW5jdGlvbiggdW50aWwgKXtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4LFxuICAgICAgICBjaGFyO1xuXG4gICAgd2hpbGUoICF0aGlzLmVvbCgpICl7XG4gICAgICAgIGNoYXIgPSB0aGlzLnNvdXJjZVsgdGhpcy5pbmRleCBdO1xuXG4gICAgICAgIGlmKCB1bnRpbCggY2hhciApICl7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zb3VyY2Uuc2xpY2UoIHN0YXJ0LCB0aGlzLmluZGV4ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzY2FubmVyXG4gKi9cbnNjYW5uZXJQcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnNvdXJjZSA9IHRoaXMuc291cmNlO1xuICAgIGpzb24uaW5kZXggID0gdGhpcy5pbmRleDtcbiAgICBqc29uLmxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHNjYW5uZXJcbiAqL1xuc2Nhbm5lclByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlO1xufTsiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0b0pTT04oIHZhbHVlICl7XG4gICAgcmV0dXJuIHZhbHVlLnRvSlNPTigpO1xufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRvU3RyaW5nKCB2YWx1ZSApe1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xufSIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgbWFwIGZyb20gJy4vbWFwJztcbmltcG9ydCBTY2FubmVyIGZyb20gJy4vc2Nhbm5lcic7XG5pbXBvcnQgdG9KU09OIGZyb20gJy4vdG8tanNvbic7XG5pbXBvcnQgdG9TdHJpbmcgZnJvbSAnLi90by1zdHJpbmcnO1xuXG52YXIgbGV4ZXJQcm90b3R5cGU7XG5cbi8qKlxuICogQGNsYXNzIExleGVyXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIExleGVyKCl7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8TGV4ZXJ+VG9rZW4+fVxuICAgICAqL1xuICAgIHRoaXMudG9rZW5zID0gW107XG59XG5cbmxleGVyUHJvdG90eXBlID0gTGV4ZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxubGV4ZXJQcm90b3R5cGUuY29uc3RydWN0b3IgPSBMZXhlcjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0ZXh0XG4gKi9cbmxleGVyUHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKCB0ZXh0ICl7XG4gICAgdmFyIHNjYW5uZXIgPSBuZXcgU2Nhbm5lciggdGV4dCApLFxuICAgICAgICB0b2tlbjtcblxuICAgIHRoaXMudG9rZW5zID0gW107XG5cbiAgICB3aGlsZSggIXNjYW5uZXIuZW9sKCkgKXtcbiAgICAgICAgdG9rZW4gPSBzY2FubmVyLmxleCgpO1xuICAgICAgICBpZiggdG9rZW4gKXtcbiAgICAgICAgICAgIHRoaXMudG9rZW5zWyB0aGlzLnRva2Vucy5sZW5ndGggXSA9IHRva2VuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudG9rZW5zO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGV4ZXJcbiAqL1xubGV4ZXJQcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnRva2VucyA9IG1hcCggdGhpcy50b2tlbnMsIHRvSlNPTiApO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGxleGVyXG4gKi9cbmxleGVyUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gbWFwKCB0aGlzLnRva2VucywgdG9TdHJpbmcgKS5qb2luKCAnJyApO1xufTsiLCJleHBvcnQgdmFyIEFycmF5RXhwcmVzc2lvbiAgICAgICA9ICdBcnJheUV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBDYWxsRXhwcmVzc2lvbiAgICAgICAgPSAnQ2FsbEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBFeHByZXNzaW9uU3RhdGVtZW50ICAgPSAnRXhwcmVzc2lvblN0YXRlbWVudCc7XG5leHBvcnQgdmFyIElkZW50aWZpZXIgICAgICAgICAgICA9ICdJZGVudGlmaWVyJztcbmV4cG9ydCB2YXIgTGl0ZXJhbCAgICAgICAgICAgICAgID0gJ0xpdGVyYWwnO1xuZXhwb3J0IHZhciBNZW1iZXJFeHByZXNzaW9uICAgICAgPSAnTWVtYmVyRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIFByb2dyYW0gICAgICAgICAgICAgICA9ICdQcm9ncmFtJztcbmV4cG9ydCB2YXIgU2VxdWVuY2VFeHByZXNzaW9uICAgID0gJ1NlcXVlbmNlRXhwcmVzc2lvbic7IiwiaW1wb3J0ICogYXMgQ2hhcmFjdGVyIGZyb20gJy4vY2hhcmFjdGVyJztcbmltcG9ydCAqIGFzIFN5bnRheCBmcm9tICcuL3N5bnRheCc7XG5pbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0IG1hcCBmcm9tICcuL21hcCc7XG5pbXBvcnQgdG9KU09OIGZyb20gJy4vdG8tanNvbic7XG5cbnZhciBub2RlSWQgPSAwLFxuICAgIGxpdGVyYWxUeXBlcyA9ICdib29sZWFuIG51bWJlciBzdHJpbmcnLnNwbGl0KCAnICcgKTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5Ob2RlXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdHlwZSBBIG5vZGUgdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTm9kZSggdHlwZSApe1xuXG4gICAgaWYoIHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJyApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAndHlwZSBtdXN0IGJlIGEgc3RyaW5nJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gQnVpbGRlcn5Ob2RlI2lkXG4gICAgICovXG4gICAgdGhpcy5pZCA9ICsrbm9kZUlkO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gQnVpbGRlcn5Ob2RlI3R5cGVcbiAgICAgKi9cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xufVxuXG5Ob2RlLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbk5vZGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTm9kZTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgbm9kZVxuICovXG5Ob2RlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24udHlwZSA9IHRoaXMudHlwZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBub2RlXG4gKi9cbk5vZGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gU3RyaW5nKCB0aGlzLnR5cGUgKTtcbn07XG5cbk5vZGUucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmlkO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk5vZGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBleHByZXNzaW9uVHlwZSBBIG5vZGUgdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gRXhwcmVzc2lvbiggZXhwcmVzc2lvblR5cGUgKXtcbiAgICBOb2RlLmNhbGwoIHRoaXMsIGV4cHJlc3Npb25UeXBlICk7XG59XG5cbkV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTm9kZS5wcm90b3R5cGUgKTtcblxuRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkxpdGVyYWxcbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6bnVtYmVyfSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIGxpdGVyYWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExpdGVyYWwoIHZhbHVlLCByYXcgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5MaXRlcmFsICk7XG5cbiAgICBpZiggbGl0ZXJhbFR5cGVzLmluZGV4T2YoIHR5cGVvZiB2YWx1ZSApID09PSAtMSAmJiB2YWx1ZSAhPT0gbnVsbCApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAndmFsdWUgbXVzdCBiZSBhIGJvb2xlYW4sIG51bWJlciwgc3RyaW5nLCBvciBudWxsJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLnJhdyA9IHJhdztcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuXG5MaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkxpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGl0ZXJhbDtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGl0ZXJhbFxuICovXG5MaXRlcmFsLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ucmF3ID0gdGhpcy5yYXc7XG4gICAganNvbi52YWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGl0ZXJhbFxuICovXG5MaXRlcmFsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMucmF3O1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5NZW1iZXJFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBvYmplY3RcbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufEJ1aWxkZXJ+SWRlbnRpZmllcn0gcHJvcGVydHlcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gY29tcHV0ZWQ9ZmFsc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHksIGNvbXB1dGVkICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguTWVtYmVyRXhwcmVzc2lvbiApO1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5FeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+RXhwcmVzc2lvbnxCdWlsZGVyfklkZW50aWZpZXJ9XG4gICAgICovXG4gICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOmJvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5jb21wdXRlZCA9IGNvbXB1dGVkIHx8IGZhbHNlO1xufVxuXG5NZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbk1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVtYmVyRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWVtYmVyIGV4cHJlc3Npb25cbiAqL1xuTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLm9iamVjdCAgID0gdGhpcy5vYmplY3QudG9KU09OKCk7XG4gICAganNvbi5wcm9wZXJ0eSA9IHRoaXMucHJvcGVydHkudG9KU09OKCk7XG4gICAganNvbi5jb21wdXRlZCA9IHRoaXMuY29tcHV0ZWQ7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+UHJvZ3JhbVxuICogQGV4dGVuZHMgQnVpbGRlcn5Ob2RlXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5PEJ1aWxkZXJ+U3RhdGVtZW50Pn0gYm9keVxuICovXG5leHBvcnQgZnVuY3Rpb24gUHJvZ3JhbSggYm9keSApe1xuICAgIE5vZGUuY2FsbCggdGhpcywgU3ludGF4LlByb2dyYW0gKTtcblxuICAgIGlmKCAhQXJyYXkuaXNBcnJheSggYm9keSApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdib2R5IG11c3QgYmUgYW4gYXJyYXknICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6QXJyYXk8QnVpbGRlcn5TdGF0ZW1lbnQ+fVxuICAgICAqL1xuICAgIHRoaXMuYm9keSA9IGJvZHkgfHwgW107XG4gICAgdGhpcy5zb3VyY2VUeXBlID0gJ3NjcmlwdCc7XG59XG5cblByb2dyYW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTm9kZS5wcm90b3R5cGUgKTtcblxuUHJvZ3JhbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQcm9ncmFtO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwcm9ncmFtXG4gKi9cblByb2dyYW0ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5ib2R5ID0gbWFwKCB0aGlzLmJvZHksIHRvSlNPTiApO1xuICAgIGpzb24uc291cmNlVHlwZSA9IHRoaXMuc291cmNlVHlwZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5TdGF0ZW1lbnRcbiAqIEBleHRlbmRzIEJ1aWxkZXJ+Tm9kZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHN0YXRlbWVudFR5cGUgQSBub2RlIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0YXRlbWVudCggc3RhdGVtZW50VHlwZSApe1xuICAgIE5vZGUuY2FsbCggdGhpcywgc3RhdGVtZW50VHlwZSApO1xufVxuXG5TdGF0ZW1lbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTm9kZS5wcm90b3R5cGUgKTtcblxuU3RhdGVtZW50LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0YXRlbWVudDtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5BcnJheUV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn0gZWxlbWVudHMgQSBsaXN0IG9mIGV4cHJlc3Npb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcnJheUV4cHJlc3Npb24oIGVsZW1lbnRzICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguQXJyYXlFeHByZXNzaW9uICk7XG5cbiAgICAvL2lmKCAhKCBBcnJheS5pc0FycmF5KCBlbGVtZW50cyApICkgJiYgISggZWxlbWVudHMgaW5zdGFuY2VvZiBSYW5nZUV4cHJlc3Npb24gKSApe1xuICAgIC8vICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdlbGVtZW50cyBtdXN0IGJlIGEgbGlzdCBvZiBleHByZXNzaW9ucyBvciBhbiBpbnN0YW5jZSBvZiByYW5nZSBleHByZXNzaW9uJyApO1xuICAgIC8vfVxuXG4gICAgLypcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdlbGVtZW50cycsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oIGVsZW1lbnRzICl7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgdGhpc1sgaW5kZXggXSA9IGVsZW1lbnRzWyBpbmRleCBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSApO1xuICAgICovXG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudHM7XG59XG5cbkFycmF5RXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5BcnJheUV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQXJyYXlFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhcnJheSBleHByZXNzaW9uXG4gKi9cbkFycmF5RXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmVsZW1lbnRzID0gQXJyYXkuaXNBcnJheSggdGhpcy5lbGVtZW50cyApID9cbiAgICAgICAgbWFwKCB0aGlzLmVsZW1lbnRzLCB0b0pTT04gKSA6XG4gICAgICAgIHRoaXMuZWxlbWVudHMudG9KU09OKCk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+Q2FsbEV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IGNhbGxlZVxuICogQHBhcmFtIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fSBhcmdzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDYWxsRXhwcmVzc2lvbiggY2FsbGVlLCBhcmdzICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguQ2FsbEV4cHJlc3Npb24gKTtcblxuICAgIGlmKCAhQXJyYXkuaXNBcnJheSggYXJncyApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdhcmd1bWVudHMgbXVzdCBiZSBhbiBhcnJheScgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5jYWxsZWUgPSBjYWxsZWU7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPn1cbiAgICAgKi9cbiAgICB0aGlzLmFyZ3VtZW50cyA9IGFyZ3M7XG59XG5cbkNhbGxFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkNhbGxFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENhbGxFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjYWxsIGV4cHJlc3Npb25cbiAqL1xuQ2FsbEV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5jYWxsZWUgICAgPSB0aGlzLmNhbGxlZS50b0pTT04oKTtcbiAgICBqc29uLmFyZ3VtZW50cyA9IG1hcCggdGhpcy5hcmd1bWVudHMsIHRvSlNPTiApO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5NZW1iZXJFeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gb2JqZWN0XG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApe1xuICAgIGlmKCAhKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIEV4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncHJvcGVydHkgbXVzdCBiZSBhbiBleHByZXNzaW9uIHdoZW4gY29tcHV0ZWQgaXMgdHJ1ZScgKTtcbiAgICB9XG5cbiAgICBNZW1iZXJFeHByZXNzaW9uLmNhbGwoIHRoaXMsIG9iamVjdCwgcHJvcGVydHksIHRydWUgKTtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIgQnVpbGRlcn5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24jY29tcHV0ZWQ9dHJ1ZVxuICAgICAqL1xufVxuXG5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5FeHByZXNzaW9uU3RhdGVtZW50XG4gKiBAZXh0ZW5kcyBCdWlsZGVyflN0YXRlbWVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gRXhwcmVzc2lvblN0YXRlbWVudCggZXhwcmVzc2lvbiApe1xuICAgIFN0YXRlbWVudC5jYWxsKCB0aGlzLCBTeW50YXguRXhwcmVzc2lvblN0YXRlbWVudCApO1xuXG4gICAgaWYoICEoIGV4cHJlc3Npb24gaW5zdGFuY2VvZiBFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2FyZ3VtZW50IG11c3QgYmUgYW4gZXhwcmVzc2lvbicgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbn1cblxuRXhwcmVzc2lvblN0YXRlbWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBTdGF0ZW1lbnQucHJvdG90eXBlICk7XG5cbkV4cHJlc3Npb25TdGF0ZW1lbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXhwcmVzc2lvblN0YXRlbWVudDtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZXhwcmVzc2lvbiBzdGF0ZW1lbnRcbiAqL1xuRXhwcmVzc2lvblN0YXRlbWVudC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb24udG9KU09OKCk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+SWRlbnRpZmllclxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgaWRlbnRpZmllclxuICovXG5leHBvcnQgZnVuY3Rpb24gSWRlbnRpZmllciggbmFtZSApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LklkZW50aWZpZXIgKTtcblxuICAgIGlmKCB0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ25hbWUgbXVzdCBiZSBhIHN0cmluZycgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbn1cblxuSWRlbnRpZmllci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5JZGVudGlmaWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IElkZW50aWZpZXI7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGlkZW50aWZpZXJcbiAqL1xuSWRlbnRpZmllci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLm5hbWUgPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBOdWxsTGl0ZXJhbCggcmF3ICl7XG4gICAgaWYoIHJhdyAhPT0gJ251bGwnICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyYXcgaXMgbm90IGEgbnVsbCBsaXRlcmFsJyApO1xuICAgIH1cblxuICAgIExpdGVyYWwuY2FsbCggdGhpcywgbnVsbCwgcmF3ICk7XG59XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExpdGVyYWwucHJvdG90eXBlICk7XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGxMaXRlcmFsO1xuXG5leHBvcnQgZnVuY3Rpb24gTnVtZXJpY0xpdGVyYWwoIHJhdyApe1xuICAgIHZhciB2YWx1ZSA9IHBhcnNlRmxvYXQoIHJhdyApO1xuXG4gICAgaWYoIGlzTmFOKCB2YWx1ZSApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyYXcgaXMgbm90IGEgbnVtZXJpYyBsaXRlcmFsJyApO1xuICAgIH1cblxuICAgIExpdGVyYWwuY2FsbCggdGhpcywgdmFsdWUsIHJhdyApO1xufVxuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBMaXRlcmFsLnByb3RvdHlwZSApO1xuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdW1lcmljTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5TZXF1ZW5jZUV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn0gZXhwcmVzc2lvbnMgVGhlIGV4cHJlc3Npb25zIGluIHRoZSBzZXF1ZW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2VxdWVuY2VFeHByZXNzaW9uKCBleHByZXNzaW9ucyApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LlNlcXVlbmNlRXhwcmVzc2lvbiApO1xuXG4gICAgLy9pZiggISggQXJyYXkuaXNBcnJheSggZXhwcmVzc2lvbnMgKSApICYmICEoIGV4cHJlc3Npb25zIGluc3RhbmNlb2YgUmFuZ2VFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnZXhwcmVzc2lvbnMgbXVzdCBiZSBhIGxpc3Qgb2YgZXhwcmVzc2lvbnMgb3IgYW4gaW5zdGFuY2Ugb2YgcmFuZ2UgZXhwcmVzc2lvbicgKTtcbiAgICAvL31cblxuICAgIC8qXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB0aGlzLCAnZXhwcmVzc2lvbnMnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKCBleHByZXNzaW9ucyApe1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5sZW5ndGggPSBleHByZXNzaW9ucy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHRoaXNbIGluZGV4IF0gPSBleHByZXNzaW9uc1sgaW5kZXggXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0gKTtcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5leHByZXNzaW9ucyA9IGV4cHJlc3Npb25zO1xufVxuXG5TZXF1ZW5jZUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuU2VxdWVuY2VFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNlcXVlbmNlRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgc2VxdWVuY2UgZXhwcmVzc2lvblxuICovXG5TZXF1ZW5jZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5leHByZXNzaW9ucyA9IEFycmF5LmlzQXJyYXkoIHRoaXMuZXhwcmVzc2lvbnMgKSA/XG4gICAgICAgIG1hcCggdGhpcy5leHByZXNzaW9ucywgdG9KU09OICkgOlxuICAgICAgICB0aGlzLmV4cHJlc3Npb25zLnRvSlNPTigpO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflN0YXRpY01lbWJlckV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+TWVtYmVyRXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IG9iamVjdFxuICogQHBhcmFtIHtCdWlsZGVyfklkZW50aWZpZXJ9IHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICl7XG4gICAgLy9pZiggISggcHJvcGVydHkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISggcHJvcGVydHkgaW5zdGFuY2VvZiBMb29rdXBFeHByZXNzaW9uICkgJiYgISggcHJvcGVydHkgaW5zdGFuY2VvZiBCbG9ja0V4cHJlc3Npb24gKSApe1xuICAgIC8vICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdwcm9wZXJ0eSBtdXN0IGJlIGFuIGlkZW50aWZpZXIsIGV2YWwgZXhwcmVzc2lvbiwgb3IgbG9va3VwIGV4cHJlc3Npb24gd2hlbiBjb21wdXRlZCBpcyBmYWxzZScgKTtcbiAgICAvL31cblxuICAgIE1lbWJlckV4cHJlc3Npb24uY2FsbCggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSwgZmFsc2UgKTtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIgQnVpbGRlcn5TdGF0aWNNZW1iZXJFeHByZXNzaW9uI2NvbXB1dGVkPWZhbHNlXG4gICAgICovXG59XG5cblN0YXRpY01lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuU3RhdGljTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdGF0aWNNZW1iZXJFeHByZXNzaW9uO1xuXG5leHBvcnQgZnVuY3Rpb24gU3RyaW5nTGl0ZXJhbCggcmF3ICl7XG4gICAgaWYoICFDaGFyYWN0ZXIuaXNRdW90ZSggcmF3WyAwIF0gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncmF3IGlzIG5vdCBhIHN0cmluZyBsaXRlcmFsJyApO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IHJhdy5zdWJzdHJpbmcoIDEsIHJhdy5sZW5ndGggLSAxICk7XG5cbiAgICBMaXRlcmFsLmNhbGwoIHRoaXMsIHZhbHVlLCByYXcgKTtcbn1cblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBMaXRlcmFsLnByb3RvdHlwZSApO1xuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0cmluZ0xpdGVyYWw7IiwiZXhwb3J0IHZhciBCbG9ja0V4cHJlc3Npb24gICAgICAgPSAnQmxvY2tFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgRXhpc3RlbnRpYWxFeHByZXNzaW9uID0gJ0V4aXN0ZW50aWFsRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIExvb2t1cEV4cHJlc3Npb24gICAgICA9ICdMb29rdXBFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUmFuZ2VFeHByZXNzaW9uICAgICAgID0gJ1JhbmdlRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIFJvb3RFeHByZXNzaW9uICAgICAgICA9ICdSb290RXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIFNjb3BlRXhwcmVzc2lvbiAgICAgICA9ICdTY29wZUV4cHJlc3Npb24nOyIsInZhciBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHsqfSBvYmplY3RcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBwcm9wZXJ0eVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eSggb2JqZWN0LCBwcm9wZXJ0eSApe1xuICAgIHJldHVybiBfaGFzT3duUHJvcGVydHkuY2FsbCggb2JqZWN0LCBwcm9wZXJ0eSApO1xufSIsImltcG9ydCB7IENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiwgRXhwcmVzc2lvbiwgSWRlbnRpZmllciwgTm9kZSwgTGl0ZXJhbCB9IGZyb20gJy4vbm9kZSc7XG5pbXBvcnQgKiBhcyBLZXlwYXRoU3ludGF4IGZyb20gJy4va2V5cGF0aC1zeW50YXgnO1xuaW1wb3J0IGhhc093blByb3BlcnR5IGZyb20gJy4vaGFzLW93bi1wcm9wZXJ0eSc7XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+T3BlcmF0b3JFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBleHByZXNzaW9uVHlwZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IG9wZXJhdG9yXG4gKi9cbmZ1bmN0aW9uIE9wZXJhdG9yRXhwcmVzc2lvbiggZXhwcmVzc2lvblR5cGUsIG9wZXJhdG9yICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBleHByZXNzaW9uVHlwZSApO1xuXG4gICAgdGhpcy5vcGVyYXRvciA9IG9wZXJhdG9yO1xufVxuXG5PcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE9wZXJhdG9yRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgb3BlcmF0b3IgZXhwcmVzc2lvblxuICovXG5PcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5vcGVyYXRvciA9IHRoaXMub3BlcmF0b3I7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBCbG9ja0V4cHJlc3Npb24oIGJvZHkgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsICdCbG9ja0V4cHJlc3Npb24nICk7XG5cbiAgICAvKlxuICAgIGlmKCAhKCBleHByZXNzaW9uIGluc3RhbmNlb2YgRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdhcmd1bWVudCBtdXN0IGJlIGFuIGV4cHJlc3Npb24nICk7XG4gICAgfVxuICAgICovXG5cbiAgICB0aGlzLmJvZHkgPSBib2R5O1xufVxuXG5CbG9ja0V4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuQmxvY2tFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJsb2NrRXhwcmVzc2lvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIEV4aXN0ZW50aWFsRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApe1xuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbiwgJz8nICk7XG5cbiAgICB0aGlzLmV4cHJlc3Npb24gPSBleHByZXNzaW9uO1xufVxuXG5FeGlzdGVudGlhbEV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5FeGlzdGVudGlhbEV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXhpc3RlbnRpYWxFeHByZXNzaW9uO1xuXG5FeGlzdGVudGlhbEV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb24udG9KU09OKCk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBMb29rdXBFeHByZXNzaW9uKCBrZXkgKXtcbiAgICBpZiggISgga2V5IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmICEoIGtleSBpbnN0YW5jZW9mIElkZW50aWZpZXIgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBCbG9ja0V4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAna2V5IG11c3QgYmUgYSBsaXRlcmFsLCBpZGVudGlmaWVyLCBvciBldmFsIGV4cHJlc3Npb24nICk7XG4gICAgfVxuXG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbiwgJyUnICk7XG5cbiAgICB0aGlzLmtleSA9IGtleTtcbn1cblxuTG9va3VwRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTG9va3VwRXhwcmVzc2lvbjtcblxuTG9va3VwRXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICsgdGhpcy5rZXk7XG59O1xuXG5Mb29rdXBFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5rZXkgPSB0aGlzLmtleTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5SYW5nZUV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+T3BlcmF0b3JFeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gbGVmdFxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IHJpZ2h0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSYW5nZUV4cHJlc3Npb24oIGxlZnQsIHJpZ2h0ICl7XG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguUmFuZ2VFeHByZXNzaW9uLCAnLi4nICk7XG5cbiAgICBpZiggISggbGVmdCBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiBsZWZ0ICE9PSBudWxsICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsZWZ0IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgbGl0ZXJhbCBvciBudWxsJyApO1xuICAgIH1cblxuICAgIGlmKCAhKCByaWdodCBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiByaWdodCAhPT0gbnVsbCApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncmlnaHQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBsaXRlcmFsIG9yIG51bGwnICk7XG4gICAgfVxuXG4gICAgaWYoIGxlZnQgPT09IG51bGwgJiYgcmlnaHQgPT09IG51bGwgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xlZnQgYW5kIHJpZ2h0IGNhbm5vdCBlcXVhbCBudWxsIGF0IHRoZSBzYW1lIHRpbWUnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5MaXRlcmFsfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiNsZWZ0XG4gICAgICovXG4gICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+TGl0ZXJhbH0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jMFxuICAgICAqL1xuICAgIHRoaXNbIDAgXSA9IHRoaXMubGVmdCA9IGxlZnQ7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uI3JpZ2h0XG4gICAgICovXG4gICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+TGl0ZXJhbH0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jMVxuICAgICAqL1xuICAgIHRoaXNbIDEgXSA9IHRoaXMucmlnaHQgPSByaWdodDtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jbGVuZ3RoPTJcbiAgICAgKi9cbiAgICB0aGlzLmxlbmd0aCA9IDI7XG59XG5cblJhbmdlRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5SYW5nZUV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmFuZ2VFeHByZXNzaW9uO1xuXG5SYW5nZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmxlZnQgPSB0aGlzLmxlZnQgIT09IG51bGwgP1xuICAgICAgICB0aGlzLmxlZnQudG9KU09OKCkgOlxuICAgICAgICB0aGlzLmxlZnQ7XG4gICAganNvbi5yaWdodCA9IHRoaXMucmlnaHQgIT09IG51bGwgP1xuICAgICAgICB0aGlzLnJpZ2h0LnRvSlNPTigpIDpcbiAgICAgICAgdGhpcy5yaWdodDtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMubGVmdC50b1N0cmluZygpICsgdGhpcy5vcGVyYXRvciArIHRoaXMucmlnaHQudG9TdHJpbmcoKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBSZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSwgY2FyZGluYWxpdHkgKXtcbiAgICBDb21wdXRlZE1lbWJlckV4cHJlc3Npb24uY2FsbCggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSApO1xuXG4gICAgaWYoICFoYXNPd25Qcm9wZXJ0eSggQ2FyZGluYWxpdHksIGNhcmRpbmFsaXR5ICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ1Vua25vd24gY2FyZGluYWxpdHkgJyArIGNhcmRpbmFsaXR5ICk7XG4gICAgfVxuXG4gICAgdGhpcy5jYXJkaW5hbGl0eSA9IGNhcmRpbmFsaXR5O1xufVxuXG5SZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBDb21wdXRlZE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblJlbGF0aW9uYWxNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlbGF0aW9uYWxNZW1iZXJFeHByZXNzaW9uO1xuXG5leHBvcnQgZnVuY3Rpb24gUm9vdEV4cHJlc3Npb24oIGtleSApe1xuICAgIGlmKCAhKCBrZXkgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgISgga2V5IGluc3RhbmNlb2YgSWRlbnRpZmllciApICYmICEoIGtleSBpbnN0YW5jZW9mIEJsb2NrRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdrZXkgbXVzdCBiZSBhIGxpdGVyYWwsIGlkZW50aWZpZXIsIG9yIGV2YWwgZXhwcmVzc2lvbicgKTtcbiAgICB9XG5cbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiwgJ34nICk7XG5cbiAgICB0aGlzLmtleSA9IGtleTtcbn1cblxuUm9vdEV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5Sb290RXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSb290RXhwcmVzc2lvbjtcblxuUm9vdEV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciArIHRoaXMua2V5O1xufTtcblxuUm9vdEV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmtleSA9IHRoaXMua2V5O1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gU2NvcGVFeHByZXNzaW9uKCBvcGVyYXRvciwga2V5ICl7XG4gICAgLy9pZiggISgga2V5IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmICEoIGtleSBpbnN0YW5jZW9mIElkZW50aWZpZXIgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBCbG9ja0V4cHJlc3Npb24gKSApe1xuICAgIC8vICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdrZXkgbXVzdCBiZSBhIGxpdGVyYWwsIGlkZW50aWZpZXIsIG9yIGV2YWwgZXhwcmVzc2lvbicgKTtcbiAgICAvL31cblxuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4LlNjb3BlRXhwcmVzc2lvbiwgb3BlcmF0b3IgKTtcblxuICAgIHRoaXMua2V5ID0ga2V5O1xufVxuXG5TY29wZUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5TY29wZUV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2NvcGVFeHByZXNzaW9uO1xuXG5TY29wZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciArIHRoaXMua2V5O1xufTtcblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5rZXkgPSB0aGlzLmtleTtcblxuICAgIHJldHVybiBqc29uO1xufTsiLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgR3JhbW1hciBmcm9tICcuL2dyYW1tYXInO1xuaW1wb3J0ICogYXMgTm9kZSBmcm9tICcuL25vZGUnO1xuaW1wb3J0ICogYXMgS2V5cGF0aE5vZGUgZnJvbSAnLi9rZXlwYXRoLW5vZGUnO1xuXG52YXIgYnVpbGRlclByb3RvdHlwZTtcblxuZnVuY3Rpb24gdW5zaGlmdCggbGlzdCwgaXRlbSApe1xuICAgIHZhciBpbmRleCA9IDAsXG4gICAgICAgIGxlbmd0aCA9IGxpc3QubGVuZ3RoLFxuICAgICAgICB0MSA9IGl0ZW0sXG4gICAgICAgIHQyID0gaXRlbTtcblxuICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xuICAgICAgICB0MSA9IHQyO1xuICAgICAgICB0MiA9IGxpc3RbIGluZGV4IF07XG4gICAgICAgIGxpc3RbIGluZGV4IF0gPSB0MTtcbiAgICB9XG5cbiAgICBsaXN0WyBsZW5ndGggXSA9IHQyO1xuXG4gICAgcmV0dXJuIGxpc3Q7XG59XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7TGV4ZXJ9IGxleGVyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEJ1aWxkZXIoIGxleGVyICl7XG4gICAgdGhpcy5sZXhlciA9IGxleGVyO1xufVxuXG5idWlsZGVyUHJvdG90eXBlID0gQnVpbGRlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5idWlsZGVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVpbGRlcjtcblxuYnVpbGRlclByb3RvdHlwZS5hcnJheUV4cHJlc3Npb24gPSBmdW5jdGlvbiggbGlzdCApe1xuICAgIC8vY29uc29sZS5sb2coICdBUlJBWSBFWFBSRVNTSU9OJyApO1xuICAgIHRoaXMuY29uc3VtZSggJ1snICk7XG4gICAgcmV0dXJuIG5ldyBOb2RlLkFycmF5RXhwcmVzc2lvbiggbGlzdCApO1xufTtcblxuYnVpbGRlclByb3RvdHlwZS5ibG9ja0V4cHJlc3Npb24gPSBmdW5jdGlvbiggdGVybWluYXRvciApe1xuICAgIHZhciBibG9jayA9IFtdLFxuICAgICAgICBpc29sYXRlZCA9IGZhbHNlO1xuICAgIC8vY29uc29sZS5sb2coICdCTE9DSycsIHRlcm1pbmF0b3IgKTtcbiAgICBpZiggIXRoaXMucGVlayggdGVybWluYXRvciApICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIEVYUFJFU1NJT05TJyApO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICB1bnNoaWZ0KCBibG9jaywgdGhpcy5jb25zdW1lKCkgKTtcbiAgICAgICAgfSB3aGlsZSggIXRoaXMucGVlayggdGVybWluYXRvciApICk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZSggdGVybWluYXRvciApO1xuICAgIC8qaWYoIHRoaXMucGVlayggJ34nICkgKXtcbiAgICAgICAgaXNvbGF0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnN1bWUoICd+JyApO1xuICAgIH0qL1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuQmxvY2tFeHByZXNzaW9uKCBibG9jaywgaXNvbGF0ZWQgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ3xBcnJheTxCdWlsZGVyflRva2VuPn0gaW5wdXRcbiAqIEByZXR1cm5zIHtQcm9ncmFtfSBUaGUgYnVpbHQgYWJzdHJhY3Qgc3ludGF4IHRyZWVcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5idWlsZCA9IGZ1bmN0aW9uKCBpbnB1dCApe1xuICAgIGlmKCB0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnICl7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRleHQgPSBpbnB1dDtcblxuICAgICAgICBpZiggdHlwZW9mIHRoaXMubGV4ZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGV4ZXIgaXMgbm90IGRlZmluZWQnICk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6QXJyYXk8VG9rZW4+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50b2tlbnMgPSB0aGlzLmxleGVyLmxleCggaW5wdXQgKTtcbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGlucHV0ICkgKXtcbiAgICAgICAgdGhpcy50b2tlbnMgPSBpbnB1dC5zbGljZSgpO1xuICAgICAgICB0aGlzLnRleHQgPSBpbnB1dC5qb2luKCAnJyApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdpbnZhbGlkIGlucHV0JyApO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCAnQlVJTEQnICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gJywgdGhpcy50ZXh0Lmxlbmd0aCwgJ0NIQVJTJywgdGhpcy50ZXh0ICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gJywgdGhpcy50b2tlbnMubGVuZ3RoLCAnVE9LRU5TJywgdGhpcy50b2tlbnMgKTtcbiAgICB0aGlzLmNvbHVtbiA9IHRoaXMudGV4dC5sZW5ndGg7XG4gICAgdGhpcy5saW5lID0gMTtcblxuICAgIHZhciBwcm9ncmFtID0gdGhpcy5wcm9ncmFtKCk7XG5cbiAgICBpZiggdGhpcy50b2tlbnMubGVuZ3RoICl7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggJ1VuZXhwZWN0ZWQgdG9rZW4gJyArIHRoaXMudG9rZW5zWyAwIF0gKyAnIHJlbWFpbmluZycgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvZ3JhbTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7Q2FsbEV4cHJlc3Npb259IFRoZSBjYWxsIGV4cHJlc3Npb24gbm9kZVxuICovXG5idWlsZGVyUHJvdG90eXBlLmNhbGxFeHByZXNzaW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgYXJncyA9IHRoaXMubGlzdCggJygnICksXG4gICAgICAgIGNhbGxlZTtcblxuICAgIHRoaXMuY29uc3VtZSggJygnICk7XG5cbiAgICBjYWxsZWUgPSB0aGlzLmV4cHJlc3Npb24oKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ0FMTCBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIENBTExFRScsIGNhbGxlZSApO1xuICAgIC8vY29uc29sZS5sb2coICctIEFSR1VNRU5UUycsIGFyZ3MsIGFyZ3MubGVuZ3RoICk7XG4gICAgcmV0dXJuIG5ldyBOb2RlLkNhbGxFeHByZXNzaW9uKCBjYWxsZWUsIGFyZ3MgKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgbmV4dCB0b2tlbiBpbiB0aGUgdG9rZW4gbGlzdC4gSWYgYSBjb21wYXJpc29uIGlzIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzLiBPdGhlcndpc2UgYW4gZXJyb3IgaXMgdGhyb3duLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2V4cGVjdGVkXSBBbiBleHBlY3RlZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcmV0dXJucyB7VG9rZW59IFRoZSBuZXh0IHRva2VuIGluIHRoZSBsaXN0XG4gKiBAdGhyb3dzIHtTeW50YXhFcnJvcn0gSWYgdG9rZW4gZGlkIG5vdCBleGlzdFxuICovXG5idWlsZGVyUHJvdG90eXBlLmNvbnN1bWUgPSBmdW5jdGlvbiggZXhwZWN0ZWQgKXtcbiAgICBpZiggIXRoaXMudG9rZW5zLmxlbmd0aCApe1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoICdVbmV4cGVjdGVkIGVuZCBvZiBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIHZhciB0b2tlbiA9IHRoaXMuZXhwZWN0KCBleHBlY3RlZCApO1xuXG4gICAgaWYoICF0b2tlbiApe1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoICdVbmV4cGVjdGVkIHRva2VuICcgKyB0b2tlbi52YWx1ZSArICcgY29uc3VtZWQnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRva2VuO1xufTtcblxuYnVpbGRlclByb3RvdHlwZS5leGlzdGVudGlhbEV4cHJlc3Npb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBleHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uKCk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gRVhJU1QgRVhQUkVTU0lPTicsIGV4cHJlc3Npb24gKTtcbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLkV4aXN0ZW50aWFsRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBuZXh0IHRva2VuIGluIHRoZSB0b2tlbiBsaXN0LiBJZiBjb21wYXJpc29ucyBhcmUgcHJvdmlkZWQsIHRoZSB0b2tlbiB3aWxsIG9ubHkgYmUgcmV0dXJuZWQgaWYgdGhlIHZhbHVlIG1hdGNoZXMgb25lIG9mIHRoZSBjb21wYXJpc29ucy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmaXJzdF0gVGhlIGZpcnN0IGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbc2Vjb25kXSBUaGUgc2Vjb25kIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbdGhpcmRdIFRoZSB0aGlyZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZvdXJ0aF0gVGhlIGZvdXJ0aCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcmV0dXJucyB7VG9rZW59IFRoZSBuZXh0IHRva2VuIGluIHRoZSBsaXN0IG9yIGB1bmRlZmluZWRgIGlmIGl0IGRpZCBub3QgZXhpc3RcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5leHBlY3QgPSBmdW5jdGlvbiggZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApe1xuICAgIHZhciB0b2tlbiA9IHRoaXMucGVlayggZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApO1xuXG4gICAgaWYoIHRva2VuICl7XG4gICAgICAgIHRoaXMudG9rZW5zWyB0aGlzLnRva2Vucy5sZW5ndGgtLSBdO1xuICAgICAgICB0aGlzLmNvbHVtbiAtPSB0b2tlbi52YWx1ZS5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9XG5cbiAgICByZXR1cm4gdm9pZCAwO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtFeHByZXNzaW9ufSBBbiBleHByZXNzaW9uIG5vZGVcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5leHByZXNzaW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IG51bGwsXG4gICAgICAgIGxpc3QsIG5leHQsIHRva2VuO1xuXG4gICAgaWYoIHRoaXMuZXhwZWN0KCAnOycgKSApe1xuICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuXG4gICAgaWYoIG5leHQgPSB0aGlzLnBlZWsoKSApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRVhQUkVTU0lPTicsIG5leHQgKTtcbiAgICAgICAgc3dpdGNoKCBuZXh0LnR5cGUgKXtcbiAgICAgICAgICAgIGNhc2UgR3JhbW1hci5QdW5jdHVhdG9yOlxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmV4cGVjdCggJ10nICkgKXtcbiAgICAgICAgICAgICAgICAgICAgbGlzdCA9IHRoaXMubGlzdCggJ1snICk7XG4gICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLnRva2Vucy5sZW5ndGggPT09IDEgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmFycmF5RXhwcmVzc2lvbiggbGlzdCApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIGxpc3QubGVuZ3RoID4gMSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuc2VxdWVuY2VFeHByZXNzaW9uKCBsaXN0ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gQXJyYXkuaXNBcnJheSggbGlzdCApID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0WyAwIF0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBuZXh0LnZhbHVlID09PSAnfScgKXtcbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwKCBuZXh0ICk7XG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIHRoaXMuZXhwZWN0KCAnPycgKSApe1xuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5leGlzdGVudGlhbEV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgR3JhbW1hci5OdWxsTGl0ZXJhbDpcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5saXRlcmFsKCk7XG4gICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gR3JhbW1hci5JZGVudGlmaWVyXG4gICAgICAgICAgICAvLyBHcmFtbWFyLk51bWVyaWNMaXRlcmFsXG4gICAgICAgICAgICAvLyBHcmFtbWFyLlN0cmluZ0xpdGVyYWxcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwKCBuZXh0ICk7XG4gICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIC8vIEltcGxpZWQgbWVtYmVyIGV4cHJlc3Npb24uIFNob3VsZCBvbmx5IGhhcHBlbiBhZnRlciBhbiBJZGVudGlmaWVyLlxuICAgICAgICAgICAgICAgIGlmKCBuZXh0ICYmIG5leHQudHlwZSA9PT0gR3JhbW1hci5QdW5jdHVhdG9yICYmICggbmV4dC52YWx1ZSA9PT0gJyknIHx8IG5leHQudmFsdWUgPT09ICddJyB8fCBuZXh0LnZhbHVlID09PSAnPycgKSApe1xuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5tZW1iZXJFeHByZXNzaW9uKCBleHByZXNzaW9uLCBmYWxzZSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlKCAoIHRva2VuID0gdGhpcy5leHBlY3QoICcpJywgJ1snLCAnLicgKSApICl7XG4gICAgICAgICAgICBpZiggdG9rZW4udmFsdWUgPT09ICcpJyApe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmNhbGxFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHRva2VuLnZhbHVlID09PSAnWycgKXtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5tZW1iZXJFeHByZXNzaW9uKCBleHByZXNzaW9uLCB0cnVlICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHRva2VuLnZhbHVlID09PSAnLicgKXtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5tZW1iZXJFeHByZXNzaW9uKCBleHByZXNzaW9uLCBmYWxzZSApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoICdVbmV4cGVjdGVkIHRva2VuOiAnICsgdG9rZW4gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBleHByZXNzaW9uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtFeHByZXNzaW9uU3RhdGVtZW50fSBBbiBleHByZXNzaW9uIHN0YXRlbWVudFxuICovXG5idWlsZGVyUHJvdG90eXBlLmV4cHJlc3Npb25TdGF0ZW1lbnQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBleHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uKCksXG4gICAgICAgIGV4cHJlc3Npb25TdGF0ZW1lbnQ7XG4gICAgLy9jb25zb2xlLmxvZyggJ0VYUFJFU1NJT04gU1RBVEVNRU5UIFdJVEgnLCBleHByZXNzaW9uICk7XG4gICAgZXhwcmVzc2lvblN0YXRlbWVudCA9IG5ldyBOb2RlLkV4cHJlc3Npb25TdGF0ZW1lbnQoIGV4cHJlc3Npb24gKTtcblxuICAgIHJldHVybiBleHByZXNzaW9uU3RhdGVtZW50O1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtJZGVudGlmaWVyfSBBbiBpZGVudGlmaWVyXG4gKiBAdGhyb3dzIHtTeW50YXhFcnJvcn0gSWYgdGhlIHRva2VuIGlzIG5vdCBhbiBpZGVudGlmaWVyXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuaWRlbnRpZmllciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRva2VuID0gdGhpcy5jb25zdW1lKCk7XG5cbiAgICBpZiggISggdG9rZW4udHlwZSA9PT0gR3JhbW1hci5JZGVudGlmaWVyICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ0lkZW50aWZpZXIgZXhwZWN0ZWQnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBOb2RlLklkZW50aWZpZXIoIHRva2VuLnZhbHVlICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHRlcm1pbmF0b3JcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpBcnJheTxFeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259IFRoZSBsaXN0IG9mIGV4cHJlc3Npb25zIG9yIHJhbmdlIGV4cHJlc3Npb25cbiAqL1xuYnVpbGRlclByb3RvdHlwZS5saXN0ID0gZnVuY3Rpb24oIHRlcm1pbmF0b3IgKXtcbiAgICB2YXIgbGlzdCA9IFtdLFxuICAgICAgICBpc051bWVyaWMgPSBmYWxzZSxcbiAgICAgICAgZXhwcmVzc2lvbiwgbmV4dDtcbiAgICAvL2NvbnNvbGUubG9nKCAnTElTVCcsIHRlcm1pbmF0b3IgKTtcbiAgICBpZiggIXRoaXMucGVlayggdGVybWluYXRvciApICl7XG4gICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgaXNOdW1lcmljID0gbmV4dC50eXBlID09PSBHcmFtbWFyLk51bWVyaWNMaXRlcmFsO1xuXG4gICAgICAgIC8vIEV4YW1wbGVzOiBbMS4uM10sIFs1Li5dLCBbLi43XVxuICAgICAgICBpZiggKCBpc051bWVyaWMgfHwgbmV4dC52YWx1ZSA9PT0gJy4nICkgJiYgdGhpcy5wZWVrQXQoIDEsICcuJyApICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBSQU5HRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGlzTnVtZXJpYyA/XG4gICAgICAgICAgICAgICAgdGhpcy5sb29rdXAoIG5leHQgKSA6XG4gICAgICAgICAgICAgICAgbnVsbDtcbiAgICAgICAgICAgIGxpc3QgPSB0aGlzLnJhbmdlRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApO1xuXG4gICAgICAgIC8vIEV4YW1wbGVzOiBbMSwyLDNdLCBbXCJhYmNcIixcImRlZlwiXSwgW2ZvbyxiYXJdLCBbe2Zvby5iYXJ9XVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gQVJSQVkgT0YgRVhQUkVTU0lPTlMnICk7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwKCBuZXh0ICk7XG4gICAgICAgICAgICAgICAgdW5zaGlmdCggbGlzdCwgZXhwcmVzc2lvbiApO1xuICAgICAgICAgICAgfSB3aGlsZSggdGhpcy5leHBlY3QoICcsJyApICk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJy0gTElTVCBSRVNVTFQnLCBsaXN0ICk7XG4gICAgcmV0dXJuIGxpc3Q7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0xpdGVyYWx9IFRoZSBsaXRlcmFsIG5vZGVcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5saXRlcmFsID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgdG9rZW4gPSB0aGlzLmNvbnN1bWUoKSxcbiAgICAgICAgcmF3ID0gdG9rZW4udmFsdWU7XG5cbiAgICBzd2l0Y2goIHRva2VuLnR5cGUgKXtcbiAgICAgICAgY2FzZSBHcmFtbWFyLk51bWVyaWNMaXRlcmFsOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOb2RlLk51bWVyaWNMaXRlcmFsKCByYXcgKTtcbiAgICAgICAgY2FzZSBHcmFtbWFyLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE5vZGUuU3RyaW5nTGl0ZXJhbCggcmF3ICk7XG4gICAgICAgIGNhc2UgR3JhbW1hci5OdWxsTGl0ZXJhbDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTm9kZS5OdWxsTGl0ZXJhbCggcmF3ICk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnTGl0ZXJhbCBleHBlY3RlZCcgKTtcbiAgICB9XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLmxvb2t1cCA9IGZ1bmN0aW9uKCBuZXh0ICl7XG4gICAgdmFyIGV4cHJlc3Npb247XG4gICAgLy9jb25zb2xlLmxvZyggJ0xPT0tVUCcsIG5leHQgKTtcbiAgICBzd2l0Y2goIG5leHQudHlwZSApe1xuICAgICAgICBjYXNlIEdyYW1tYXIuSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmlkZW50aWZpZXIoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWw6XG4gICAgICAgIGNhc2UgR3JhbW1hci5TdHJpbmdMaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubGl0ZXJhbCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR3JhbW1hci5QdW5jdHVhdG9yOlxuICAgICAgICAgICAgaWYoIG5leHQudmFsdWUgPT09ICd9JyApe1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZSggJ30nICk7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuYmxvY2tFeHByZXNzaW9uKCAneycgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggJ3Rva2VuIGNhbm5vdCBiZSBhIGxvb2t1cCcgKTtcbiAgICB9XG5cbiAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG5cbiAgICBpZiggbmV4dCAmJiBuZXh0LnZhbHVlID09PSAnJScgKXtcbiAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApO1xuICAgIH1cbiAgICBpZiggbmV4dCAmJiBuZXh0LnZhbHVlID09PSAnficgKXtcbiAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMucm9vdEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJy0gTE9PS1VQIFJFU1VMVCcsIGV4cHJlc3Npb24gKTtcbiAgICByZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUubG9va3VwRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXkgKXtcbiAgICB0aGlzLmNvbnN1bWUoICclJyApO1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuTG9va3VwRXhwcmVzc2lvbigga2V5ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtFeHByZXNzaW9ufSBwcm9wZXJ0eSBUaGUgZXhwcmVzc2lvbiBhc3NpZ25lZCB0byB0aGUgcHJvcGVydHkgb2YgdGhlIG1lbWJlciBleHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGNvbXB1dGVkIFdoZXRoZXIgb3Igbm90IHRoZSBtZW1iZXIgZXhwcmVzc2lvbiBpcyBjb21wdXRlZFxuICogQHJldHVybnMge01lbWJlckV4cHJlc3Npb259IFRoZSBtZW1iZXIgZXhwcmVzc2lvblxuICovXG5idWlsZGVyUHJvdG90eXBlLm1lbWJlckV4cHJlc3Npb24gPSBmdW5jdGlvbiggcHJvcGVydHksIGNvbXB1dGVkICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ01FTUJFUicsIHByb3BlcnR5ICk7XG4gICAgdmFyIG9iamVjdCA9IHRoaXMuZXhwcmVzc2lvbigpO1xuICAgIC8vY29uc29sZS5sb2coICdNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBPQkpFQ1QnLCBvYmplY3QgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBQUk9QRVJUWScsIHByb3BlcnR5ICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gQ09NUFVURUQnLCBjb21wdXRlZCApO1xuICAgIHJldHVybiBjb21wdXRlZCA/XG4gICAgICAgIG5ldyBOb2RlLkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApIDpcbiAgICAgICAgbmV3IE5vZGUuU3RhdGljTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApO1xufTtcblxuYnVpbGRlclByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKCBpbnB1dCApe1xuICAgIHRoaXMudG9rZW5zID0gdGhpcy5sZXhlci5sZXgoIGlucHV0ICk7XG4gICAgcmV0dXJuIHRoaXMuYnVpbGQoIHRoaXMudG9rZW5zICk7XG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIHRoZSBuZXh0IHRva2VuIGluIHRoZSB0b2tlbiBsaXN0IF93aXRob3V0IHJlbW92aW5nIGl0Xy4gSWYgY29tcGFyaXNvbnMgYXJlIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgY29tcGFyaXNvbnMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZmlyc3RdIFRoZSBmaXJzdCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3NlY29uZF0gVGhlIHNlY29uZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3RoaXJkXSBUaGUgdGhpcmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmb3VydGhdIFRoZSBmb3VydGggY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge0xleGVyflRva2VufSBUaGUgbmV4dCB0b2tlbiBpbiB0aGUgbGlzdCBvciBgdW5kZWZpbmVkYCBpZiBpdCBkaWQgbm90IGV4aXN0XG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICl7XG4gICAgcmV0dXJuIHRoaXMucGVla0F0KCAwLCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICk7XG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIHRoZSB0b2tlbiBhdCB0aGUgcmVxdWVzdGVkIHBvc2l0aW9uIF93aXRob3V0IHJlbW92aW5nIGl0XyBmcm9tIHRoZSB0b2tlbiBsaXN0LiBJZiBjb21wYXJpc29ucyBhcmUgcHJvdmlkZWQsIHRoZSB0b2tlbiB3aWxsIG9ubHkgYmUgcmV0dXJuZWQgaWYgdGhlIHZhbHVlIG1hdGNoZXMgb25lIG9mIHRoZSBjb21wYXJpc29ucy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IHBvc2l0aW9uIFRoZSBwb3NpdGlvbiB3aGVyZSB0aGUgdG9rZW4gd2lsbCBiZSBwZWVrZWRcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZmlyc3RdIFRoZSBmaXJzdCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3NlY29uZF0gVGhlIHNlY29uZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3RoaXJkXSBUaGUgdGhpcmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmb3VydGhdIFRoZSBmb3VydGggY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge0xleGVyflRva2VufSBUaGUgdG9rZW4gYXQgdGhlIHJlcXVlc3RlZCBwb3NpdGlvbiBvciBgdW5kZWZpbmVkYCBpZiBpdCBkaWQgbm90IGV4aXN0XG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUucGVla0F0ID0gZnVuY3Rpb24oIHBvc2l0aW9uLCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICl7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMudG9rZW5zLmxlbmd0aCxcbiAgICAgICAgaW5kZXgsIHRva2VuLCB2YWx1ZTtcblxuICAgIGlmKCBsZW5ndGggJiYgdHlwZW9mIHBvc2l0aW9uID09PSAnbnVtYmVyJyAmJiBwb3NpdGlvbiA+IC0xICl7XG4gICAgICAgIC8vIENhbGN1bGF0ZSBhIHplcm8tYmFzZWQgaW5kZXggc3RhcnRpbmcgZnJvbSB0aGUgZW5kIG9mIHRoZSBsaXN0XG4gICAgICAgIGluZGV4ID0gbGVuZ3RoIC0gcG9zaXRpb24gLSAxO1xuXG4gICAgICAgIGlmKCBpbmRleCA+IC0xICYmIGluZGV4IDwgbGVuZ3RoICl7XG4gICAgICAgICAgICB0b2tlbiA9IHRoaXMudG9rZW5zWyBpbmRleCBdO1xuICAgICAgICAgICAgdmFsdWUgPSB0b2tlbi52YWx1ZTtcblxuICAgICAgICAgICAgaWYoIHZhbHVlID09PSBmaXJzdCB8fCB2YWx1ZSA9PT0gc2Vjb25kIHx8IHZhbHVlID09PSB0aGlyZCB8fCB2YWx1ZSA9PT0gZm91cnRoIHx8ICggIWZpcnN0ICYmICFzZWNvbmQgJiYgIXRoaXJkICYmICFmb3VydGggKSApe1xuICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2b2lkIDA7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge1Byb2dyYW19IEEgcHJvZ3JhbSBub2RlXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUucHJvZ3JhbSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGJvZHkgPSBbXTtcbiAgICAvL2NvbnNvbGUubG9nKCAnUFJPR1JBTScgKTtcbiAgICB3aGlsZSggdHJ1ZSApe1xuICAgICAgICBpZiggdGhpcy50b2tlbnMubGVuZ3RoICl7XG4gICAgICAgICAgICB1bnNoaWZ0KCBib2R5LCB0aGlzLmV4cHJlc3Npb25TdGF0ZW1lbnQoKSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBOb2RlLlByb2dyYW0oIGJvZHkgKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUucmFuZ2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIHJpZ2h0ICl7XG4gICAgdmFyIGxlZnQ7XG5cbiAgICB0aGlzLmV4cGVjdCggJy4nICk7XG4gICAgdGhpcy5leHBlY3QoICcuJyApO1xuXG4gICAgbGVmdCA9IHRoaXMucGVlaygpLnR5cGUgPT09IEdyYW1tYXIuTnVtZXJpY0xpdGVyYWwgP1xuICAgICAgICBsZWZ0ID0gdGhpcy5saXRlcmFsKCkgOlxuICAgICAgICBudWxsO1xuXG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5SYW5nZUV4cHJlc3Npb24oIGxlZnQsIHJpZ2h0ICk7XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLnJvb3RFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSApe1xuICAgIHRoaXMuY29uc3VtZSggJ34nICk7XG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5Sb290RXhwcmVzc2lvbigga2V5ICk7XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLnNlcXVlbmNlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBsaXN0ICl7XG4gICAgcmV0dXJuIG5ldyBOb2RlLlNlcXVlbmNlRXhwcmVzc2lvbiggbGlzdCApO1xufTsiLCJpbXBvcnQgaGFzT3duUHJvcGVydHkgZnJvbSAnLi9oYXMtb3duLXByb3BlcnR5JztcbmltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgbWFwIGZyb20gJy4vbWFwJztcbmltcG9ydCAqIGFzIFN5bnRheCBmcm9tICcuL3N5bnRheCc7XG5pbXBvcnQgKiBhcyBLZXlwYXRoU3ludGF4IGZyb20gJy4va2V5cGF0aC1zeW50YXgnO1xuXG52YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fSxcblxuICAgIGludGVycHJldGVyUHJvdG90eXBlO1xuXG4vKipcbiAqIEBmdW5jdGlvbiBJbnRlcnByZXRlcn5nZXR0ZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6T2JqZWN0fSBvYmplY3RcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBrZXlcbiAqIEByZXR1cm5zIHsqfSBUaGUgdmFsdWUgb2YgdGhlICdrZXknIHByb3BlcnR5IG9uICdvYmplY3QnLlxuICovXG5mdW5jdGlvbiBnZXR0ZXIoIG9iamVjdCwga2V5ICl7XG4gICAgcmV0dXJuIG9iamVjdFsga2V5IF07XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEludGVycHJldGVyfnJldHVyblZhbHVlXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gZGVwdGhcbiAqIEByZXR1cm5zIHsqfGV4dGVybmFsOk9iamVjdH0gVGhlIGRlY2lkZWQgdmFsdWVcbiAqL1xuZnVuY3Rpb24gcmV0dXJuVmFsdWUoIHZhbHVlLCBkZXB0aCApe1xuICAgIHJldHVybiAhZGVwdGggPyB2YWx1ZSA6IHt9O1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBJbnRlcnByZXRlcn5yZXR1cm5aZXJvXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSB6ZXJvXG4gKi9cbmZ1bmN0aW9uIHJldHVyblplcm8oKXtcbiAgICByZXR1cm4gMDtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gSW50ZXJwcmV0ZXJ+c2V0dGVyXG4gKiBAcGFyYW0ge2V4dGVybmFsOk9iamVjdH0gb2JqZWN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30ga2V5XG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHZhbHVlIG9mIHRoZSAna2V5JyBwcm9wZXJ0eSBvbiAnb2JqZWN0Jy5cbiAqL1xuZnVuY3Rpb24gc2V0dGVyKCBvYmplY3QsIGtleSwgdmFsdWUgKXtcbiAgICBpZiggIWhhc093blByb3BlcnR5KCBvYmplY3QsIGtleSApICl7XG4gICAgICAgIG9iamVjdFsga2V5IF0gPSB2YWx1ZSB8fCB7fTtcbiAgICB9XG4gICAgcmV0dXJuIGdldHRlciggb2JqZWN0LCBrZXkgKTtcbn1cblxuLyoqXG4gKiBAY2xhc3MgSW50ZXJwcmV0ZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7QnVpbGRlcn0gYnVpbGRlclxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBJbnRlcnByZXRlciggYnVpbGRlciApe1xuICAgIGlmKCAhYXJndW1lbnRzLmxlbmd0aCApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYnVpbGRlciBjYW5ub3QgYmUgdW5kZWZpbmVkJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ9IEludGVycHJldGVyI2J1aWxkZXJcbiAgICAgKi9cbiAgICB0aGlzLmJ1aWxkZXIgPSBidWlsZGVyO1xufVxuXG5pbnRlcnByZXRlclByb3RvdHlwZSA9IEludGVycHJldGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbmludGVycHJldGVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSW50ZXJwcmV0ZXI7XG5cbmludGVycHJldGVyUHJvdG90eXBlLmFycmF5RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBlbGVtZW50cywgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBBUlJBWSBFWFBSRVNTSU9OJywgZWxlbWVudHMubGVuZ3RoICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgZGVwdGggPSBpbnRlcnByZXRlci5kZXB0aCxcbiAgICAgICAgbGlzdDtcbiAgICBpZiggQXJyYXkuaXNBcnJheSggZWxlbWVudHMgKSApe1xuICAgICAgICBsaXN0ID0gbWFwKCBlbGVtZW50cywgZnVuY3Rpb24oIGVsZW1lbnQgKXtcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlci5saXN0RXhwcmVzc2lvbkVsZW1lbnQoIGVsZW1lbnQsIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlQXJyYXlFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIEFSUkFZIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQXJyYXlFeHByZXNzaW9uIExJU1QnLCBsaXN0ICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQXJyYXlFeHByZXNzaW9uIERFUFRIJywgZGVwdGggKTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1hcCggbGlzdCwgZnVuY3Rpb24oIGV4cHJlc3Npb24gKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbiggc2NvcGUsIGV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKSwgdmFsdWUgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICByZXN1bHQubGVuZ3RoID09PSAxICYmICggcmVzdWx0ID0gcmVzdWx0WyAwIF0gKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0ID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggZWxlbWVudHMsIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBBUlJBWSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiBMSVNUJywgbGlzdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQXJyYXlFeHByZXNzaW9uIERFUFRIJywgZGVwdGggKTtcbiAgICAgICAgICAgIHZhciBrZXlzID0gbGlzdCggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gcmV0dXJuVmFsdWUoIGFzc2lnbm1lbnQsIGRlcHRoICksXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbWFwKCBrZXlzLCBmdW5jdGlvbigga2V5ICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIHNjb3BlLCBrZXksIHZhbHVlICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmJsb2NrRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCB0b2tlbnMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQkxPQ0snLCB0b2tlbnMuam9pbiggJycgKSApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIHByb2dyYW0gPSBpbnRlcnByZXRlci5idWlsZGVyLmJ1aWxkKCB0b2tlbnMgKSxcbiAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLnJlY3Vyc2UoIHByb2dyYW0uYm9keVsgMCBdLmV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlQmxvY2tFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQkxPQ0snICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVCbG9ja0V4cHJlc3Npb24gU0NPUEUnLCBzY29wZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQmxvY2tFeHByZXNzaW9uIEVYUFJFU1NJT04nLCBleHByZXNzaW9uLm5hbWUgKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUJsb2NrRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBzY29wZSwgbmFtZTogdm9pZCAwLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5jYWxsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBjYWxsZWUsIGFyZ3MsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQ0FMTCBFWFBSRVNTSU9OJyApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGlzU2V0dGluZyA9IGFzc2lnbiA9PT0gc2V0dGVyLFxuICAgICAgICBsZWZ0ID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggY2FsbGVlLCB0cnVlLCBhc3NpZ24gKSxcbiAgICAgICAgbGlzdCA9IG1hcCggYXJncywgZnVuY3Rpb24oIGFyZyApe1xuICAgICAgICAgICAgcmV0dXJuIGludGVycHJldGVyLmxpc3RFeHByZXNzaW9uRWxlbWVudCggYXJnLCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgIH0gKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlQ2FsbEV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBDQUxMIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDYWxsRXhwcmVzc2lvbiBhcmdzJywgYXJncy5sZW5ndGggKTtcbiAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKSxcbiAgICAgICAgICAgIGFyZ3MgPSBtYXAoIGxpc3QsIGZ1bmN0aW9uKCBhcmcgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJnKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgICAgICB9ICksXG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDYWxsRXhwcmVzc2lvbiBMSFMnLCBsaHMgKTtcbiAgICAgICAgcmVzdWx0ID0gbGhzLnZhbHVlLmFwcGx5KCBsaHMuY29udGV4dCwgYXJncyApO1xuICAgICAgICBpZiggaXNTZXR0aW5nICYmIHR5cGVvZiBsaHMudmFsdWUgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdjYW5ub3QgY3JlYXRlIGNhbGwgZXhwcmVzc2lvbnMnICk7XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNhbGxFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfTpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBleHByZXNzaW9uXG4gKi9cbmludGVycHJldGVyUHJvdG90eXBlLmNvbXBpbGUgPSBmdW5jdGlvbiggZXhwcmVzc2lvbiwgY3JlYXRlICl7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgcHJvZ3JhbSA9IGludGVycHJldGVyLmJ1aWxkZXIuYnVpbGQoIGV4cHJlc3Npb24gKSxcbiAgICAgICAgYm9keSA9IHByb2dyYW0uYm9keSxcblxuICAgICAgICBhc3NpZ24sIGV4cHJlc3Npb25zO1xuXG4gICAgaW50ZXJwcmV0ZXIuZGVwdGggPSAtMTtcbiAgICBpbnRlcnByZXRlci5pc1NwbGl0ID0gaW50ZXJwcmV0ZXIuaXNMZWZ0U3BsaXQgPSBpbnRlcnByZXRlci5pc1JpZ2h0U3BsaXQgPSBmYWxzZTtcblxuICAgIGlmKCB0eXBlb2YgY3JlYXRlICE9PSAnYm9vbGVhbicgKXtcbiAgICAgICAgY3JlYXRlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgYXNzaWduID0gY3JlYXRlID9cbiAgICAgICAgc2V0dGVyIDpcbiAgICAgICAgZ2V0dGVyO1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqL1xuICAgIGludGVycHJldGVyLmV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5idWlsZGVyLnRleHQ7XG4gICAgLy9jb25zb2xlLmxvZyggJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJ0ludGVycHJldGluZycgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnUHJvZ3JhbScsIHByb2dyYW0ucmFuZ2UgKTtcbiAgICBzd2l0Y2goIGJvZHkubGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHJldHVybiBub29wO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIucmVjdXJzZSggYm9keVsgMCBdLmV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGV4cHJlc3Npb25zID0gbWFwKCBib2R5LCBmdW5jdGlvbiggc3RhdGVtZW50ICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGludGVycHJldGVyLnJlY3Vyc2UoIHN0YXRlbWVudC5leHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZVByb2dyYW0oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWVzID0gbWFwKCBleHByZXNzaW9ucywgZnVuY3Rpb24oIGV4cHJlc3Npb24gKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBleHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVzWyB2YWx1ZXMubGVuZ3RoIC0gMSBdO1xuICAgICAgICAgICAgfTtcbiAgICB9XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5jb21wdXRlZE1lbWJlckV4cHJlc3Npb24gPSBmdW5jdGlvbiggb2JqZWN0LCBwcm9wZXJ0eSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBDT01QVVRFRCBNRU1CRVIgRVhQUkVTU0lPTicsIG9iamVjdC50eXBlLCBwcm9wZXJ0eS50eXBlICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgZGVwdGggPSBpbnRlcnByZXRlci5kZXB0aCxcbiAgICAgICAgaXNTYWZlID0gb2JqZWN0LnR5cGUgPT09IEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uLFxuICAgICAgICBsZWZ0ID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggb2JqZWN0LCBmYWxzZSwgYXNzaWduICksXG4gICAgICAgIHJpZ2h0ID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggcHJvcGVydHksIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgIGlmKCAhaW50ZXJwcmV0ZXIuaXNTcGxpdCApe1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBDT01QVVRFRCBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gTEVGVCAnLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUklHSFQnLCByaWdodC5uYW1lICk7XG4gICAgICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gcmV0dXJuVmFsdWUoIGFzc2lnbm1lbnQsIGRlcHRoICksXG4gICAgICAgICAgICAgICAgcmVzdWx0LCByaHM7XG4gICAgICAgICAgICBpZiggIWlzU2FmZSB8fCBsaHMgKXtcbiAgICAgICAgICAgICAgICByaHMgPSByaWdodCggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gREVQVEgnLCBkZXB0aCApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gTEhTJywgbGhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSSFMnLCByaHMgKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIGxocywgcmhzLCB2YWx1ZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IGNvbnRleHQ6IGxocywgbmFtZTogcmhzLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYoIGludGVycHJldGVyLmlzTGVmdFNwbGl0ICYmICFpbnRlcnByZXRlci5pc1JpZ2h0U3BsaXQgKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQ09NUFVURUQgTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIExFRlQgJywgbGVmdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJJR0hUJywgcmlnaHQubmFtZSApO1xuICAgICAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdCwgcmhzO1xuICAgICAgICAgICAgaWYoICFpc1NhZmUgfHwgbGhzICl7XG4gICAgICAgICAgICAgICAgcmhzID0gcmlnaHQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIERFUFRIJywgZGVwdGggKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIExIUycsIGxocyApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkhTJywgcmhzICk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbWFwKCBsaHMsIGZ1bmN0aW9uKCBvYmplY3QgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbiggb2JqZWN0LCByaHMsIHZhbHVlICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IGNvbnRleHQ6IGxocywgbmFtZTogcmhzLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYoICFpbnRlcnByZXRlci5pc0xlZnRTcGxpdCAmJiBpbnRlcnByZXRlci5pc1JpZ2h0U3BsaXQgKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQ09NUFVURUQgTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIExFRlQgJywgbGVmdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJJR0hUJywgcmlnaHQubmFtZSApO1xuICAgICAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdCwgcmhzO1xuICAgICAgICAgICAgaWYoICFpc1NhZmUgfHwgbGhzICl7XG4gICAgICAgICAgICAgICAgcmhzID0gcmlnaHQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIERFUFRIJywgZGVwdGggKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIExIUycsIGxocyApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkhTJywgcmhzICk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbWFwKCByaHMsIGZ1bmN0aW9uKCBrZXkgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbiggbGhzLCBrZXksIHZhbHVlICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IGNvbnRleHQ6IGxocywgbmFtZTogcmhzLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBDT01QVVRFRCBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gTEVGVCAnLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUklHSFQnLCByaWdodC5uYW1lICk7XG4gICAgICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gcmV0dXJuVmFsdWUoIGFzc2lnbm1lbnQsIGRlcHRoICksXG4gICAgICAgICAgICAgICAgcmVzdWx0LCByaHM7XG4gICAgICAgICAgICBpZiggIWlzU2FmZSB8fCBsaHMgKXtcbiAgICAgICAgICAgICAgICByaHMgPSByaWdodCggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gREVQVEgnLCBkZXB0aCApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gTEhTJywgbGhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSSFMnLCByaHMgKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIGxocywgZnVuY3Rpb24oIG9iamVjdCApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWFwKCByaHMsIGZ1bmN0aW9uKCBrZXkgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIG9iamVjdCwga2V5LCB2YWx1ZSApO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IGNvbnRleHQ6IGxocywgbmFtZTogcmhzLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5leGlzdGVudGlhbEV4cHJlc3Npb24gPSBmdW5jdGlvbiggZXhwcmVzc2lvbiwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBFWElTVEVOVElBTCBFWFBSRVNTSU9OJywgZXhwcmVzc2lvbi50eXBlICk7XG4gICAgdmFyIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIGV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlRXhpc3RlbnRpYWxFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgRVhJU1RFTlRJQUwgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUV4aXN0ZW50aWFsRXhwcmVzc2lvbiBMRUZUJywgbGVmdC5uYW1lICk7XG4gICAgICAgIGlmKCBzY29wZSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBsZWZ0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdm9pZCAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVFeGlzdGVudGlhbEV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuaWRlbnRpZmllciA9IGZ1bmN0aW9uKCBuYW1lLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIElERU5USUZJRVInLCBuYW1lICk7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlSWRlbnRpZmllciggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIElERU5USUZJRVInICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVJZGVudGlmaWVyIE5BTUUnLCBuYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVJZGVudGlmaWVyIFZBTFVFJywgdmFsdWUgKTtcbiAgICAgICAgdmFyIHZhbHVlID0gcmV0dXJuVmFsdWUoIGFzc2lnbm1lbnQsIGRlcHRoICksXG4gICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIHNjb3BlLCBuYW1lLCB2YWx1ZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlSWRlbnRpZmllciBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBzY29wZSwgbmFtZTogbmFtZSwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUubGlzdEV4cHJlc3Npb25FbGVtZW50ID0gZnVuY3Rpb24oIGVsZW1lbnQsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXM7XG5cbiAgICBzd2l0Y2goIGVsZW1lbnQudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5MaXRlcmFsOlxuICAgICAgICAgICAgcmV0dXJuIGludGVycHJldGVyLmxpdGVyYWwoIGVsZW1lbnQudmFsdWUsIGNvbnRleHQgKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIubG9va3VwRXhwcmVzc2lvbiggZWxlbWVudC5rZXksIGZhbHNlLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIGludGVycHJldGVyLnJvb3RFeHByZXNzaW9uKCBlbGVtZW50LmtleSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5CbG9ja0V4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIuYmxvY2tFeHByZXNzaW9uKCBlbGVtZW50LmJvZHksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAnVW5leHBlY3RlZCBsaXN0IGVsZW1lbnQgdHlwZTogJyArIGVsZW1lbnQudHlwZSApO1xuICAgIH1cbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmxpdGVyYWwgPSBmdW5jdGlvbiggdmFsdWUsIGNvbnRleHQgKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIExJVEVSQUwnLCB2YWx1ZSApO1xuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlTGl0ZXJhbCgpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIExJVEVSQUwnICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVMaXRlcmFsIFJFU1VMVCcsIHZhbHVlICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogdm9pZCAwLCBuYW1lOiB2b2lkIDAsIHZhbHVlOiB2YWx1ZSB9IDpcbiAgICAgICAgICAgIHZhbHVlO1xuICAgIH07XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5sb29rdXBFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSwgcmVzb2x2ZSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBMT09LVVAgRVhQUkVTU0lPTicsIGtleSApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGlzQ29tcHV0ZWQgPSBmYWxzZSxcbiAgICAgICAgbGhzID0ge30sXG4gICAgICAgIGxlZnQ7XG5cbiAgICBzd2l0Y2goIGtleS50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LklkZW50aWZpZXI6XG4gICAgICAgICAgICBsZWZ0ID0gaW50ZXJwcmV0ZXIuaWRlbnRpZmllcigga2V5Lm5hbWUsIHRydWUsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LkxpdGVyYWw6XG4gICAgICAgICAgICBpc0NvbXB1dGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGxocy52YWx1ZSA9IGxlZnQgPSBrZXkudmFsdWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxlZnQgPSBpbnRlcnByZXRlci5yZWN1cnNlKCBrZXksIHRydWUsIGFzc2lnbiApO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlTG9va3VwRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIExPT0tVUCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlTG9va3VwRXhwcmVzc2lvbiBMRUZUJywgbGVmdC5uYW1lIHx8IGxlZnQgKTtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYoICFpc0NvbXB1dGVkICl7XG4gICAgICAgICAgICBsaHMgPSBsZWZ0KCBsb29rdXAsIGFzc2lnbm1lbnQsIHNjb3BlICk7XG4gICAgICAgICAgICByZXN1bHQgPSBsaHMudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIGxvb2t1cCwgbGhzLnZhbHVlLCB2b2lkIDAgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXNvbHZlIGxvb2t1cHMgdGhhdCBhcmUgdGhlIG9iamVjdCBvZiBhbiBvYmplY3QtcHJvcGVydHkgcmVsYXRpb25zaGlwXG4gICAgICAgIGlmKCByZXNvbHZlICl7XG4gICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIHNjb3BlLCByZXN1bHQsIHZvaWQgMCApO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVMb29rdXBFeHByZXNzaW9uIExIUycsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlTG9va3VwRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogbG9va3VwLCBuYW1lOiBsaHMudmFsdWUsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLnJhbmdlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBsb3dlckJvdW5kLCB1cHBlckJvdW5kLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFJBTkdFIEVYUFJFU1NJT04nICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgbGVmdCA9IGxvd2VyQm91bmQgIT09IG51bGwgP1xuICAgICAgICAgICAgaW50ZXJwcmV0ZXIucmVjdXJzZSggbG93ZXJCb3VuZCwgZmFsc2UsIGFzc2lnbiApIDpcbiAgICAgICAgICAgIHJldHVyblplcm8sXG4gICAgICAgIHJpZ2h0ID0gdXBwZXJCb3VuZCAhPT0gbnVsbCA/XG4gICAgICAgICAgICBpbnRlcnByZXRlci5yZWN1cnNlKCB1cHBlckJvdW5kLCBmYWxzZSwgYXNzaWduICkgOlxuICAgICAgICAgICAgcmV0dXJuWmVybyxcbiAgICAgICAgaW5kZXgsIGxocywgbWlkZGxlLCByZXN1bHQsIHJocztcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlUmFuZ2VFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgUkFOR0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiBMRUZUJywgbGVmdC5uYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVSYW5nZUV4cHJlc3Npb24gUklHSFQnLCByaWdodC5uYW1lICk7XG4gICAgICAgIGxocyA9IGxlZnQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgcmhzID0gcmlnaHQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgIGluZGV4ID0gMTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiBMSFMnLCBsaHMgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiBSSFMnLCByaHMgKTtcbiAgICAgICAgcmVzdWx0WyAwIF0gPSBsaHM7XG4gICAgICAgIGlmKCBsaHMgPCByaHMgKXtcbiAgICAgICAgICAgIG1pZGRsZSA9IGxocyArIDE7XG4gICAgICAgICAgICB3aGlsZSggbWlkZGxlIDwgcmhzICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCsrIF0gPSBtaWRkbGUrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmKCBsaHMgPiByaHMgKXtcbiAgICAgICAgICAgIG1pZGRsZSA9IGxocyAtIDE7XG4gICAgICAgICAgICB3aGlsZSggbWlkZGxlID4gcmhzICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCsrIF0gPSBtaWRkbGUtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbIHJlc3VsdC5sZW5ndGggXSA9IHJocztcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5pbnRlcnByZXRlclByb3RvdHlwZS5yZWN1cnNlID0gZnVuY3Rpb24oIG5vZGUsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdSZWN1cnNpbmcnLCBub2RlLnR5cGUgKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBleHByZXNzaW9uID0gbnVsbDtcblxuICAgIGludGVycHJldGVyLmRlcHRoKys7XG5cbiAgICBzd2l0Y2goIG5vZGUudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5BcnJheUV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuYXJyYXlFeHByZXNzaW9uKCBub2RlLmVsZW1lbnRzLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGludGVycHJldGVyLmlzU3BsaXQgPSBpbnRlcnByZXRlci5pc0xlZnRTcGxpdCA9IG5vZGUuZWxlbWVudHMubGVuZ3RoID4gMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5DYWxsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5jYWxsRXhwcmVzc2lvbiggbm9kZS5jYWxsZWUsIG5vZGUuYXJndW1lbnRzLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguQmxvY2tFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmJsb2NrRXhwcmVzc2lvbiggbm9kZS5ib2R5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmV4aXN0ZW50aWFsRXhwcmVzc2lvbiggbm9kZS5leHByZXNzaW9uLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5JZGVudGlmaWVyOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmlkZW50aWZpZXIoIG5vZGUubmFtZSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5saXRlcmFsKCBub2RlLnZhbHVlLCBjb250ZXh0ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguTWVtYmVyRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBub2RlLmNvbXB1dGVkID9cbiAgICAgICAgICAgICAgICBpbnRlcnByZXRlci5jb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIG5vZGUub2JqZWN0LCBub2RlLnByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKSA6XG4gICAgICAgICAgICAgICAgaW50ZXJwcmV0ZXIuc3RhdGljTWVtYmVyRXhwcmVzc2lvbiggbm9kZS5vYmplY3QsIG5vZGUucHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmxvb2t1cEV4cHJlc3Npb24oIG5vZGUua2V5LCBmYWxzZSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5yYW5nZUV4cHJlc3Npb24oIG5vZGUubGVmdCwgbm9kZS5yaWdodCwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLnJvb3RFeHByZXNzaW9uKCBub2RlLmtleSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguU2VxdWVuY2VFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLnNlcXVlbmNlRXhwcmVzc2lvbiggbm9kZS5leHByZXNzaW9ucywgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBpbnRlcnByZXRlci5pc1NwbGl0ID0gaW50ZXJwcmV0ZXIuaXNSaWdodFNwbGl0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAnVW5rbm93biBub2RlIHR5cGU6ICcgKyBub2RlLnR5cGUgKTtcbiAgICB9XG5cbiAgICBpbnRlcnByZXRlci5kZXB0aC0tO1xuXG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5yb290RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXksIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgUk9PVCBFWFBSRVNTSU9OJyApO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBrZXksIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlUm9vdEV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBST09UIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVSb290RXhwcmVzc2lvbiBMRUZUJywgbGVmdC5uYW1lIHx8IGxlZnQgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJvb3RFeHByZXNzaW9uIFNDT1BFJywgc2NvcGUgKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGxlZnQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJvb3RFeHByZXNzaW9uIExIUycsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlUm9vdEV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxvb2t1cCwgbmFtZTogcmVzdWx0LnZhbHVlLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5zZXF1ZW5jZUV4cHJlc3Npb24gPSBmdW5jdGlvbiggZXhwcmVzc2lvbnMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgU0VRVUVOQ0UgRVhQUkVTU0lPTicsIGV4cHJlc3Npb25zLmxlbmd0aCApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGRlcHRoID0gaW50ZXJwcmV0ZXIuZGVwdGgsXG4gICAgICAgIGxpc3Q7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIGV4cHJlc3Npb25zICkgKXtcbiAgICAgICAgbGlzdCA9IG1hcCggZXhwcmVzc2lvbnMsIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIubGlzdEV4cHJlc3Npb25FbGVtZW50KCBleHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTRVFVRU5DRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiBMSVNUJywgbGlzdCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiBERVBUSCcsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSByZXR1cm5WYWx1ZSggYXNzaWdubWVudCwgZGVwdGggKSxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIGxpc3QsIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBleHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0ID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggZXhwcmVzc2lvbnMsIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTRVFVRU5DRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiBMSVNUJywgbGlzdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uIERFUFRIJywgZGVwdGggKTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGxpc3QoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuc3RhdGljTWVtYmVyRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBvYmplY3QsIHByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFNUQVRJQyBNRU1CRVIgRVhQUkVTU0lPTicsIG9iamVjdC50eXBlLCBwcm9wZXJ0eS50eXBlICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgZGVwdGggPSBpbnRlcnByZXRlci5kZXB0aCxcbiAgICAgICAgaXNDb21wdXRlZCA9IGZhbHNlLFxuICAgICAgICBpc1NhZmUgPSBmYWxzZSxcbiAgICAgICAgbGVmdCwgcmhzLCByaWdodDtcblxuICAgIHN3aXRjaCggb2JqZWN0LnR5cGUgKXtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICBsZWZ0ID0gaW50ZXJwcmV0ZXIubG9va3VwRXhwcmVzc2lvbiggb2JqZWN0LmtleSwgdHJ1ZSwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb246XG4gICAgICAgICAgICBpc1NhZmUgPSB0cnVlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGVmdCA9IGludGVycHJldGVyLnJlY3Vyc2UoIG9iamVjdCwgZmFsc2UsIGFzc2lnbiApO1xuICAgIH1cblxuICAgIHN3aXRjaCggcHJvcGVydHkudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5JZGVudGlmaWVyOlxuICAgICAgICAgICAgaXNDb21wdXRlZCA9IHRydWU7XG4gICAgICAgICAgICByaHMgPSByaWdodCA9IHByb3BlcnR5Lm5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJpZ2h0ID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggcHJvcGVydHksIGZhbHNlLCBhc3NpZ24gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW50ZXJwcmV0ZXIuaXNTcGxpdCA/XG4gICAgICAgIGZ1bmN0aW9uIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFNUQVRJQyBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIExFRlQnLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIFJJR0hUJywgcmhzIHx8IHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICksXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXR1cm5WYWx1ZSggYXNzaWdubWVudCwgZGVwdGggKSxcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG5cbiAgICAgICAgICAgIGlmKCAhaXNTYWZlIHx8IGxocyApe1xuICAgICAgICAgICAgICAgIGlmKCAhaXNDb21wdXRlZCApe1xuICAgICAgICAgICAgICAgICAgICByaHMgPSByaWdodCggcHJvcGVydHkudHlwZSA9PT0gS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiA/IHNjb3BlIDogbGhzLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gTEhTJywgbGhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gUkhTJywgcmhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gREVQVEgnLCBkZXB0aCApO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1hcCggbGhzLCBmdW5jdGlvbiggb2JqZWN0ICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIG9iamVjdCwgcmhzLCB2YWx1ZSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgY29udGV4dDogbGhzLCBuYW1lOiByaHMsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9IDpcbiAgICAgICAgZnVuY3Rpb24gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgU1RBVElDIE1FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gTEVGVCcsIGxlZnQubmFtZSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gUklHSFQnLCByaHMgfHwgcmlnaHQubmFtZSApO1xuICAgICAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdDtcblxuICAgICAgICAgICAgaWYoICFpc1NhZmUgfHwgbGhzICl7XG4gICAgICAgICAgICAgICAgaWYoICFpc0NvbXB1dGVkICl7XG4gICAgICAgICAgICAgICAgICAgIHJocyA9IHJpZ2h0KCBwcm9wZXJ0eS50eXBlID09PSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uID8gc2NvcGUgOiBsaHMsIGFzc2lnbm1lbnQsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiBMSFMnLCBsaHMgKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiBSSFMnLCByaHMgKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiBERVBUSCcsIGRlcHRoICk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBsaHMsIHJocywgdmFsdWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgY29udGV4dDogbGhzLCBuYW1lOiByaHMsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xufTsiLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0IExleGVyIGZyb20gJy4vbGV4ZXInO1xuaW1wb3J0IEJ1aWxkZXIgZnJvbSAnLi9idWlsZGVyJztcbmltcG9ydCBJbnRlcnByZXRlciBmcm9tICcuL2ludGVycHJldGVyJztcbmltcG9ydCBoYXNPd25Qcm9wZXJ0eSBmcm9tICcuL2hhcy1vd24tcHJvcGVydHknO1xuXG52YXIgbGV4ZXIgPSBuZXcgTGV4ZXIoKSxcbiAgICBidWlsZGVyID0gbmV3IEJ1aWxkZXIoIGxleGVyICksXG4gICAgaW50cmVwcmV0ZXIgPSBuZXcgSW50ZXJwcmV0ZXIoIGJ1aWxkZXIgKSxcblxuICAgIGNhY2hlID0gbmV3IE51bGwoKSxcblxuICAgIGV4cFByb3RvdHlwZTtcblxuLyoqXG4gKiBAY2xhc3MgS2V5cGF0aEV4cFxuICogQGV4dGVuZHMgVHJhbnNkdWNlclxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHBhdHRlcm5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBmbGFnc1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBLZXlwYXRoRXhwKCBwYXR0ZXJuLCBmbGFncyApe1xuICAgIHR5cGVvZiBwYXR0ZXJuICE9PSAnc3RyaW5nJyAmJiAoIHBhdHRlcm4gPSAnJyApO1xuICAgIHR5cGVvZiBmbGFncyAhPT0gJ3N0cmluZycgJiYgKCBmbGFncyA9ICcnICk7XG5cbiAgICB2YXIgdG9rZW5zID0gaGFzT3duUHJvcGVydHkoIGNhY2hlLCBwYXR0ZXJuICkgP1xuICAgICAgICAgICAgY2FjaGVbIHBhdHRlcm4gXSA6XG4gICAgICAgICAgICBjYWNoZVsgcGF0dGVybiBdID0gbGV4ZXIubGV4KCBwYXR0ZXJuICk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyggdGhpcywge1xuICAgICAgICAnZmxhZ3MnOiB7XG4gICAgICAgICAgICB2YWx1ZTogZmxhZ3MsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAnc291cmNlJzoge1xuICAgICAgICAgICAgdmFsdWU6IHBhdHRlcm4sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAnZ2V0dGVyJzoge1xuICAgICAgICAgICAgdmFsdWU6IGludHJlcHJldGVyLmNvbXBpbGUoIHRva2VucywgZmFsc2UgKSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAnc2V0dGVyJzoge1xuICAgICAgICAgICAgdmFsdWU6IGludHJlcHJldGVyLmNvbXBpbGUoIHRva2VucywgdHJ1ZSApLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgIH1cbiAgICB9ICk7XG59XG5cbmV4cFByb3RvdHlwZSA9IEtleXBhdGhFeHAucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuZXhwUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gS2V5cGF0aEV4cDtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwUHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCB0YXJnZXQsIGxvb2t1cCApe1xuICAgIHJldHVybiB0aGlzLmdldHRlciggdGFyZ2V0LCB1bmRlZmluZWQsIGxvb2t1cCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwUHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKCB0YXJnZXQsIGxvb2t1cCApe1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmdldHRlciggdGFyZ2V0LCB1bmRlZmluZWQsIGxvb2t1cCApO1xuICAgIHJldHVybiB0eXBlb2YgcmVzdWx0ICE9PSAndW5kZWZpbmVkJztcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cFByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiggdGFyZ2V0LCB2YWx1ZSwgbG9va3VwICl7XG4gICAgcmV0dXJuIHRoaXMuc2V0dGVyKCB0YXJnZXQsIHZhbHVlLCBsb29rdXAgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cFByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24uZmxhZ3MgPSB0aGlzLmZsYWdzO1xuICAgIGpzb24uc291cmNlID0gdGhpcy5zb3VyY2U7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cFByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlO1xufTsiLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0IEtleXBhdGhFeHAgZnJvbSAnLi9leHAnO1xuXG52YXIgcHJvdG9jb2wgPSBuZXcgTnVsbCgpO1xuXG5wcm90b2NvbC5pbml0ICAgID0gJ0BAdHJhbnNkdWNlci9pbml0JztcbnByb3RvY29sLnN0ZXAgICAgPSAnQEB0cmFuc2R1Y2VyL3N0ZXAnO1xucHJvdG9jb2wucmVkdWNlZCA9ICdAQHRyYW5zZHVjZXIvcmVkdWNlZCc7XG5wcm90b2NvbC5yZXN1bHQgID0gJ0BAdHJhbnNkdWNlci9yZXN1bHQnO1xucHJvdG9jb2wudmFsdWUgICA9ICdAQHRyYW5zZHVjZXIvdmFsdWUnO1xuXG4vKipcbiAqIEEgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgVHJhbnNmb21lciBwcm90b2NvbCB1c2VkIGJ5IFRyYW5zZHVjZXJzXG4gKiBAY2xhc3MgVHJhbnNmb3JtZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6RnVuY3Rpb259IHhmIEEgdHJhbnNmb3JtZXJcbiAqL1xuZnVuY3Rpb24gVHJhbnNmb3JtZXIoIHhmICl7XG4gICAgdGhpcy54ZiA9IHhmO1xufVxuXG5UcmFuc2Zvcm1lci5wcm90b3R5cGUgPSBUcmFuc2Zvcm1lci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5UcmFuc2Zvcm1lci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUcmFuc2Zvcm1lcjtcblxuLyoqXG4gKiBAZnVuY3Rpb24gVHJhbnNmb3JtZXIjQEB0cmFuc2R1Y2VyL2luaXRcbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlWyBwcm90b2NvbC5pbml0IF0gPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnhmSW5pdCgpO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gVHJhbnNmb3JtZXIjQEB0cmFuc2R1Y2VyL3N0ZXBcbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlWyBwcm90b2NvbC5zdGVwIF0gPSBmdW5jdGlvbiggdmFsdWUsIGlucHV0ICl7XG4gICAgcmV0dXJuIHRoaXMueGZTdGVwKCB2YWx1ZSwgaW5wdXQgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIFRyYW5zZm9ybWVyI0BAdHJhbnNkdWNlci9yZXN1bHRcbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlWyBwcm90b2NvbC5yZXN1bHQgXSA9IGZ1bmN0aW9uKCB2YWx1ZSApe1xuICAgIHJldHVybiB0aGlzLnhmUmVzdWx0KCB2YWx1ZSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlLnhmSW5pdCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMueGZbIHByb3RvY29sLmluaXQgXSgpO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlLnhmU3RlcCA9IGZ1bmN0aW9uKCB2YWx1ZSwgaW5wdXQgKXtcbiAgICByZXR1cm4gdGhpcy54ZlsgcHJvdG9jb2wuc3RlcCBdKCB2YWx1ZSwgaW5wdXQgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cblRyYW5zZm9ybWVyLnByb3RvdHlwZS54ZlJlc3VsdCA9IGZ1bmN0aW9uKCB2YWx1ZSApe1xuICAgIHJldHVybiB0aGlzLnhmWyBwcm90b2NvbC5yZXN1bHQgXSggdmFsdWUgKTtcbn07XG5cbi8qKlxuICogQGNsYXNzIEtleXBhdGhUcmFuc2Zvcm1lclxuICogQGV4dGVuZHMgVHJhbnNmb3JtZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBwIEEga2V5cGF0aCBwYXR0ZXJuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkZ1bmN0aW9ufSB4ZiBBIHRyYW5zZm9ybWVyXG4gKi9cbmZ1bmN0aW9uIEtleXBhdGhUcmFuc2Zvcm1lciggcCwgeGYgKXtcbiAgICBUcmFuc2Zvcm1lci5jYWxsKCB0aGlzLCB4ZiApO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0tleXBhdGhFeHB9XG4gICAgICovXG4gICAgdGhpcy5rcGV4ID0gbmV3IEtleXBhdGhFeHAoIHAgKTtcbn1cblxuS2V5cGF0aFRyYW5zZm9ybWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRyYW5zZm9ybWVyLnByb3RvdHlwZSApO1xuXG5LZXlwYXRoVHJhbnNmb3JtZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gS2V5cGF0aFRyYW5zZm9ybWVyO1xuXG5LZXlwYXRoVHJhbnNmb3JtZXIucHJvdG90eXBlWyBwcm90b2NvbC5zdGVwIF0gPSBmdW5jdGlvbiggdmFsdWUsIGlucHV0ICl7XG4gICAgcmV0dXJuIHRoaXMueGZTdGVwKCB2YWx1ZSwgdGhpcy5rcGV4LmdldCggaW5wdXQgKSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBwIEEga2V5cGF0aCBwYXR0ZXJuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6RnVuY3Rpb259XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGtleXBhdGgoIHAgKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oIHhmICl7XG4gICAgICAgIHJldHVybiBuZXcgS2V5cGF0aFRyYW5zZm9ybWVyKCBwLCB4ZiApO1xuICAgIH07XG59Il0sIm5hbWVzIjpbIkVuZE9mTGluZSIsIklkZW50aWZpZXIiLCJOdW1lcmljTGl0ZXJhbCIsIk51bGxMaXRlcmFsIiwiUHVuY3R1YXRvciIsIlN0cmluZ0xpdGVyYWwiLCJHcmFtbWFyLkVuZE9mTGluZSIsIkdyYW1tYXIuSWRlbnRpZmllciIsIkdyYW1tYXIuTnVtZXJpY0xpdGVyYWwiLCJHcmFtbWFyLk51bGxMaXRlcmFsIiwiR3JhbW1hci5QdW5jdHVhdG9yIiwiR3JhbW1hci5TdHJpbmdMaXRlcmFsIiwiQ2hhcmFjdGVyLmlzSWRlbnRpZmllclBhcnQiLCJDaGFyYWN0ZXIuaXNOdW1lcmljIiwiVG9rZW4uRW5kT2ZMaW5lIiwiQ2hhcmFjdGVyLmlzSWRlbnRpZmllclN0YXJ0IiwiVG9rZW4uTnVsbExpdGVyYWwiLCJUb2tlbi5JZGVudGlmaWVyIiwiQ2hhcmFjdGVyLmlzUHVuY3R1YXRvciIsIlRva2VuLlB1bmN0dWF0b3IiLCJDaGFyYWN0ZXIuaXNRdW90ZSIsIkNoYXJhY3Rlci5pc0RvdWJsZVF1b3RlIiwiQ2hhcmFjdGVyLmlzU2luZ2xlUXVvdGUiLCJUb2tlbi5TdHJpbmdMaXRlcmFsIiwiVG9rZW4uTnVtZXJpY0xpdGVyYWwiLCJDaGFyYWN0ZXIuaXNXaGl0ZXNwYWNlIiwiQXJyYXlFeHByZXNzaW9uIiwiQ2FsbEV4cHJlc3Npb24iLCJFeHByZXNzaW9uU3RhdGVtZW50IiwiTGl0ZXJhbCIsIk1lbWJlckV4cHJlc3Npb24iLCJQcm9ncmFtIiwiU2VxdWVuY2VFeHByZXNzaW9uIiwiU3ludGF4LkxpdGVyYWwiLCJTeW50YXguTWVtYmVyRXhwcmVzc2lvbiIsIlN5bnRheC5Qcm9ncmFtIiwiU3ludGF4LkFycmF5RXhwcmVzc2lvbiIsIlN5bnRheC5DYWxsRXhwcmVzc2lvbiIsIlN5bnRheC5FeHByZXNzaW9uU3RhdGVtZW50IiwiU3ludGF4LklkZW50aWZpZXIiLCJTeW50YXguU2VxdWVuY2VFeHByZXNzaW9uIiwiQmxvY2tFeHByZXNzaW9uIiwiRXhpc3RlbnRpYWxFeHByZXNzaW9uIiwiTG9va3VwRXhwcmVzc2lvbiIsIlJhbmdlRXhwcmVzc2lvbiIsIlJvb3RFeHByZXNzaW9uIiwiU2NvcGVFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb24iLCJOb2RlLkFycmF5RXhwcmVzc2lvbiIsIktleXBhdGhOb2RlLkJsb2NrRXhwcmVzc2lvbiIsIk5vZGUuQ2FsbEV4cHJlc3Npb24iLCJLZXlwYXRoTm9kZS5FeGlzdGVudGlhbEV4cHJlc3Npb24iLCJOb2RlLkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJOb2RlLklkZW50aWZpZXIiLCJOb2RlLk51bWVyaWNMaXRlcmFsIiwiTm9kZS5TdHJpbmdMaXRlcmFsIiwiTm9kZS5OdWxsTGl0ZXJhbCIsIktleXBhdGhOb2RlLkxvb2t1cEV4cHJlc3Npb24iLCJOb2RlLkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiIsIk5vZGUuU3RhdGljTWVtYmVyRXhwcmVzc2lvbiIsIk5vZGUuUHJvZ3JhbSIsIktleXBhdGhOb2RlLlJhbmdlRXhwcmVzc2lvbiIsIktleXBhdGhOb2RlLlJvb3RFeHByZXNzaW9uIiwiTm9kZS5TZXF1ZW5jZUV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LkJsb2NrRXhwcmVzc2lvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7O0FBS0EsQUFBZSxTQUFTLElBQUksRUFBRSxFQUFFO0FBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsSUFBSSxJQUFJOztBQ1BsQzs7Ozs7Ozs7Ozs7QUFXQSxBQUFlLFNBQVMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7SUFDekMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU07UUFDcEIsS0FBSyxFQUFFLE1BQU0sQ0FBQzs7SUFFbEIsUUFBUSxNQUFNO1FBQ1YsS0FBSyxDQUFDO1lBQ0YsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUM7UUFDOUMsS0FBSyxDQUFDO1lBQ0YsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUs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
