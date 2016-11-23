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

/**
 * @class Scanner
 * @extends Null
 */
function Scanner( text ){
    /**
     * @member {external:string}
     * @default ''
     */
    this.source = text || '';
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
            if( !interpreter.isSplit ){
                result = assign( lhs, rhs, value );
            } else if( interpreter.isLeftSplit && !interpreter.isRightSplit ){
                result = map( lhs, function( object ){
                    return assign( object, rhs, value );
                } );
            } else if( !interpreter.isLeftSplit && interpreter.isRightSplit ){
                result = map( rhs, function( key ){
                    return assign( lhs, key, value );
                } );
            } else {
                result = map( lhs, function( object ){
                    return map( rhs, function( key ){
                        return assign( object, key, value );
                    } );
                } );
            }
        }
        //console.log( '- executeComputedMemberExpression RESULT', result );
        return context ?
            { context: lhs, name: rhs, value: result } :
            result;
    };
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

    return function executeStaticMemberExpression( scope, assignment, lookup ){
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
            result = interpreter.isSplit ?
                map( lhs, function( object ){
                    return assign( object, rhs, value );
                } ) :
                assign( lhs, rhs, value );
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VzIjpbIm51bGwuanMiLCJtYXAuanMiLCJjaGFyYWN0ZXIuanMiLCJncmFtbWFyLmpzIiwidG9rZW4uanMiLCJzY2FubmVyLmpzIiwidG8tanNvbi5qcyIsInRvLXN0cmluZy5qcyIsImxleGVyLmpzIiwic3ludGF4LmpzIiwibm9kZS5qcyIsImtleXBhdGgtc3ludGF4LmpzIiwiaGFzLW93bi1wcm9wZXJ0eS5qcyIsImtleXBhdGgtbm9kZS5qcyIsImJ1aWxkZXIuanMiLCJpbnRlcnByZXRlci5qcyIsImV4cC5qcyIsInRyYW5zZm9ybWVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQSBcImNsZWFuXCIsIGVtcHR5IGNvbnRhaW5lci4gSW5zdGFudGlhdGluZyB0aGlzIGlzIGZhc3RlciB0aGFuIGV4cGxpY2l0bHkgY2FsbGluZyBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYC5cbiAqIEBjbGFzcyBOdWxsXG4gKiBAZXh0ZW5kcyBleHRlcm5hbDpudWxsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE51bGwoKXt9XG5OdWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbk51bGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIE51bGw7IiwiLyoqXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6RnVuY3Rpb259IE1hcENhbGxiYWNrXG4gKiBAcGFyYW0geyp9IGl0ZW1cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxuICovXG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0FycmF5LUxpa2V9IGxpc3RcbiAqIEBwYXJhbSB7TWFwQ2FsbGJhY2t9IGNhbGxiYWNrXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1hcCggbGlzdCwgY2FsbGJhY2sgKXtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGgsXG4gICAgICAgIGluZGV4LCByZXN1bHQ7XG5cbiAgICBzd2l0Y2goIGxlbmd0aCApe1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICByZXR1cm4gWyBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICkgXTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIFsgY2FsbGJhY2soIGxpc3RbIDAgXSwgMCwgbGlzdCApLCBjYWxsYmFjayggbGlzdFsgMSBdLCAxLCBsaXN0ICkgXTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIFsgY2FsbGJhY2soIGxpc3RbIDAgXSwgMCwgbGlzdCApLCBjYWxsYmFjayggbGlzdFsgMSBdLCAxLCBsaXN0ICksIGNhbGxiYWNrKCBsaXN0WyAyIF0sIDIsIGxpc3QgKSBdO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBsZW5ndGggKTtcbiAgICAgICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGNhbGxiYWNrKCBsaXN0WyBpbmRleCBdLCBpbmRleCwgbGlzdCApO1xuICAgICAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGlzRG91YmxlUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJ1wiJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSWRlbnRpZmllclBhcnQoIGNoYXIgKXtcbiAgICByZXR1cm4gaXNJZGVudGlmaWVyU3RhcnQoIGNoYXIgKSB8fCBpc051bWVyaWMoIGNoYXIgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICl7XG4gICAgcmV0dXJuICdhJyA8PSBjaGFyICYmIGNoYXIgPD0gJ3onIHx8ICdBJyA8PSBjaGFyICYmIGNoYXIgPD0gJ1onIHx8ICdfJyA9PT0gY2hhciB8fCBjaGFyID09PSAnJCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc051bWVyaWMoIGNoYXIgKXtcbiAgICByZXR1cm4gJzAnIDw9IGNoYXIgJiYgY2hhciA8PSAnOSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1B1bmN0dWF0b3IoIGNoYXIgKXtcbiAgICByZXR1cm4gJy4sPygpW117fSV+OycuaW5kZXhPZiggY2hhciApICE9PSAtMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gaXNEb3VibGVRdW90ZSggY2hhciApIHx8IGlzU2luZ2xlUXVvdGUoIGNoYXIgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2luZ2xlUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gXCInXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1doaXRlc3BhY2UoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJyAnIHx8IGNoYXIgPT09ICdcXHInIHx8IGNoYXIgPT09ICdcXHQnIHx8IGNoYXIgPT09ICdcXG4nIHx8IGNoYXIgPT09ICdcXHYnIHx8IGNoYXIgPT09ICdcXHUwMEEwJztcbn0iLCJleHBvcnQgdmFyIEVuZE9mTGluZSAgICAgICA9ICdFbmRPZkxpbmUnO1xuZXhwb3J0IHZhciBJZGVudGlmaWVyICAgICAgPSAnSWRlbnRpZmllcic7XG5leHBvcnQgdmFyIE51bWVyaWNMaXRlcmFsICA9ICdOdW1lcmljJztcbmV4cG9ydCB2YXIgTnVsbExpdGVyYWwgICAgID0gJ051bGwnO1xuZXhwb3J0IHZhciBQdW5jdHVhdG9yICAgICAgPSAnUHVuY3R1YXRvcic7XG5leHBvcnQgdmFyIFN0cmluZ0xpdGVyYWwgICA9ICdTdHJpbmcnOyIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBHcmFtbWFyIGZyb20gJy4vZ3JhbW1hcic7XG5cbnZhciB0b2tlbklkID0gMDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+VG9rZW5cbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlIFRoZSB0eXBlIG9mIHRoZSB0b2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgdG9rZW5cbiAqL1xuZnVuY3Rpb24gVG9rZW4oIHR5cGUsIHZhbHVlICl7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBMZXhlcn5Ub2tlbiNpZFxuICAgICAqL1xuICAgIHRoaXMuaWQgPSArK3Rva2VuSWQ7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBMZXhlcn5Ub2tlbiN0eXBlXG4gICAgICovXG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IExleGVyflRva2VuI3ZhbHVlXG4gICAgICovXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuXG5Ub2tlbi5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5Ub2tlbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUb2tlbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xuVG9rZW4ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi50eXBlID0gdGhpcy50eXBlO1xuICAgIGpzb24udmFsdWUgPSB0aGlzLnZhbHVlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRva2VuXG4gKi9cblRva2VuLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFN0cmluZyggdGhpcy52YWx1ZSApO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIEVuZE9mTGluZSgpe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuRW5kT2ZMaW5lLCAnJyApO1xufVxuXG5FbmRPZkxpbmUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbkVuZE9mTGluZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbmRPZkxpbmU7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfklkZW50aWZpZXJcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElkZW50aWZpZXIoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5JZGVudGlmaWVyLCB2YWx1ZSApO1xufVxuXG5JZGVudGlmaWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5JZGVudGlmaWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IElkZW50aWZpZXI7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfk51bWVyaWNMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdW1lcmljTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLk51bWVyaWNMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVtZXJpY0xpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfk51bGxMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdWxsTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLk51bGxMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuTnVsbExpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVsbExpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflB1bmN0dWF0b3JcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFB1bmN0dWF0b3IoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5QdW5jdHVhdG9yLCB2YWx1ZSApO1xufVxuXG5QdW5jdHVhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5QdW5jdHVhdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFB1bmN0dWF0b3I7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflN0cmluZ0xpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0cmluZ0xpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5TdHJpbmdMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0cmluZ0xpdGVyYWw7IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIENoYXJhY3RlciBmcm9tICcuL2NoYXJhY3Rlcic7XG5pbXBvcnQgKiBhcyBUb2tlbiBmcm9tICcuL3Rva2VuJztcblxudmFyIHNjYW5uZXJQcm90b3R5cGU7XG5cbmZ1bmN0aW9uIGlzTm90SWRlbnRpZmllciggY2hhciApe1xuICAgIHJldHVybiAhQ2hhcmFjdGVyLmlzSWRlbnRpZmllclBhcnQoIGNoYXIgKTtcbn1cblxuZnVuY3Rpb24gaXNOb3ROdW1lcmljKCBjaGFyICl7XG4gICAgcmV0dXJuICFDaGFyYWN0ZXIuaXNOdW1lcmljKCBjaGFyICk7XG59XG5cbi8qKlxuICogQGNsYXNzIFNjYW5uZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2Nhbm5lciggdGV4dCApe1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnJ1xuICAgICAqL1xuICAgIHRoaXMuc291cmNlID0gdGV4dCB8fCAnJztcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5pbmRleCA9IDA7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMubGVuZ3RoID0gdGV4dC5sZW5ndGg7XG59XG5cbnNjYW5uZXJQcm90b3R5cGUgPSBTY2FubmVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbnNjYW5uZXJQcm90b3R5cGUuY29uc3RydWN0b3IgPSBTY2FubmVyO1xuXG5zY2FubmVyUHJvdG90eXBlLmVvbCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPj0gdGhpcy5sZW5ndGg7XG59O1xuXG5zY2FubmVyUHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKCl7XG4gICAgaWYoIHRoaXMuZW9sKCkgKXtcbiAgICAgICAgcmV0dXJuIG5ldyBUb2tlbi5FbmRPZkxpbmUoKTtcbiAgICB9XG5cbiAgICB2YXIgY2hhciA9IHRoaXMuc291cmNlWyB0aGlzLmluZGV4IF0sXG4gICAgICAgIHdvcmQ7XG5cbiAgICAvLyBJZGVudGlmaWVyXG4gICAgaWYoIENoYXJhY3Rlci5pc0lkZW50aWZpZXJTdGFydCggY2hhciApICl7XG4gICAgICAgIHdvcmQgPSB0aGlzLnNjYW4oIGlzTm90SWRlbnRpZmllciApO1xuXG4gICAgICAgIHJldHVybiB3b3JkID09PSAnbnVsbCcgP1xuICAgICAgICAgICAgbmV3IFRva2VuLk51bGxMaXRlcmFsKCB3b3JkICkgOlxuICAgICAgICAgICAgbmV3IFRva2VuLklkZW50aWZpZXIoIHdvcmQgKTtcblxuICAgIC8vIFB1bmN0dWF0b3JcbiAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc1B1bmN0dWF0b3IoIGNoYXIgKSApe1xuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICAgIHJldHVybiBuZXcgVG9rZW4uUHVuY3R1YXRvciggY2hhciApO1xuXG4gICAgLy8gUXVvdGVkIFN0cmluZ1xuICAgIH0gZWxzZSBpZiggQ2hhcmFjdGVyLmlzUXVvdGUoIGNoYXIgKSApe1xuICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgd29yZCA9IENoYXJhY3Rlci5pc0RvdWJsZVF1b3RlKCBjaGFyICkgP1xuICAgICAgICAgICAgdGhpcy5zY2FuKCBDaGFyYWN0ZXIuaXNEb3VibGVRdW90ZSApIDpcbiAgICAgICAgICAgIHRoaXMuc2NhbiggQ2hhcmFjdGVyLmlzU2luZ2xlUXVvdGUgKTtcblxuICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBUb2tlbi5TdHJpbmdMaXRlcmFsKCBjaGFyICsgd29yZCArIGNoYXIgKTtcblxuICAgIC8vIE51bWVyaWNcbiAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc051bWVyaWMoIGNoYXIgKSApe1xuICAgICAgICB3b3JkID0gdGhpcy5zY2FuKCBpc05vdE51bWVyaWMgKTtcblxuICAgICAgICByZXR1cm4gbmV3IFRva2VuLk51bWVyaWNMaXRlcmFsKCB3b3JkICk7XG5cbiAgICAvLyBXaGl0ZXNwYWNlXG4gICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNXaGl0ZXNwYWNlKCBjaGFyICkgKXtcbiAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgLy8gRXJyb3JcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoICdcIicgKyBjaGFyICsgJ1wiIGlzIGFuIGludmFsaWQgY2hhcmFjdGVyJyApO1xuICAgIH1cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOmZ1bmN0aW9ufSB1bnRpbCBBIGNvbmRpdGlvbiB0aGF0IHdoZW4gbWV0IHdpbGwgc3RvcCB0aGUgc2Nhbm5pbmcgb2YgdGhlIHNvdXJjZVxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gVGhlIHBvcnRpb24gb2YgdGhlIHNvdXJjZSBzY2FubmVkXG4gKi9cbnNjYW5uZXJQcm90b3R5cGUuc2NhbiA9IGZ1bmN0aW9uKCB1bnRpbCApe1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXgsXG4gICAgICAgIGNoYXI7XG5cbiAgICB3aGlsZSggIXRoaXMuZW9sKCkgKXtcbiAgICAgICAgY2hhciA9IHRoaXMuc291cmNlWyB0aGlzLmluZGV4IF07XG5cbiAgICAgICAgaWYoIHVudGlsKCBjaGFyICkgKXtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNvdXJjZS5zbGljZSggc3RhcnQsIHRoaXMuaW5kZXggKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHNjYW5uZXJcbiAqL1xuc2Nhbm5lclByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24uc291cmNlID0gdGhpcy5zb3VyY2U7XG4gICAganNvbi5pbmRleCAgPSB0aGlzLmluZGV4O1xuICAgIGpzb24ubGVuZ3RoID0gdGhpcy5sZW5ndGg7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgc2Nhbm5lclxuICovXG5zY2FubmVyUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2U7XG59OyIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRvSlNPTiggdmFsdWUgKXtcbiAgICByZXR1cm4gdmFsdWUudG9KU09OKCk7XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdG9TdHJpbmcoIHZhbHVlICl7XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG59IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCBtYXAgZnJvbSAnLi9tYXAnO1xuaW1wb3J0IFNjYW5uZXIgZnJvbSAnLi9zY2FubmVyJztcbmltcG9ydCB0b0pTT04gZnJvbSAnLi90by1qc29uJztcbmltcG9ydCB0b1N0cmluZyBmcm9tICcuL3RvLXN0cmluZyc7XG5cbnZhciBsZXhlclByb3RvdHlwZTtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTGV4ZXIoKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtBcnJheTxMZXhlcn5Ub2tlbj59XG4gICAgICovXG4gICAgdGhpcy50b2tlbnMgPSBbXTtcbn1cblxubGV4ZXJQcm90b3R5cGUgPSBMZXhlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5sZXhlclByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExleGVyO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHRleHRcbiAqL1xubGV4ZXJQcm90b3R5cGUubGV4ID0gZnVuY3Rpb24oIHRleHQgKXtcbiAgICB2YXIgc2Nhbm5lciA9IG5ldyBTY2FubmVyKCB0ZXh0ICksXG4gICAgICAgIHRva2VuO1xuXG4gICAgdGhpcy50b2tlbnMgPSBbXTtcblxuICAgIHdoaWxlKCAhc2Nhbm5lci5lb2woKSApe1xuICAgICAgICB0b2tlbiA9IHNjYW5uZXIubGV4KCk7XG4gICAgICAgIGlmKCB0b2tlbiApe1xuICAgICAgICAgICAgdGhpcy50b2tlbnNbIHRoaXMudG9rZW5zLmxlbmd0aCBdID0gdG9rZW47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50b2tlbnM7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsZXhlclxuICovXG5sZXhlclByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24udG9rZW5zID0gbWFwKCB0aGlzLnRva2VucywgdG9KU09OICk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGV4ZXJcbiAqL1xubGV4ZXJQcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBtYXAoIHRoaXMudG9rZW5zLCB0b1N0cmluZyApLmpvaW4oICcnICk7XG59OyIsImV4cG9ydCB2YXIgQXJyYXlFeHByZXNzaW9uICAgICAgID0gJ0FycmF5RXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIENhbGxFeHByZXNzaW9uICAgICAgICA9ICdDYWxsRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIEV4cHJlc3Npb25TdGF0ZW1lbnQgICA9ICdFeHByZXNzaW9uU3RhdGVtZW50JztcbmV4cG9ydCB2YXIgSWRlbnRpZmllciAgICAgICAgICAgID0gJ0lkZW50aWZpZXInO1xuZXhwb3J0IHZhciBMaXRlcmFsICAgICAgICAgICAgICAgPSAnTGl0ZXJhbCc7XG5leHBvcnQgdmFyIE1lbWJlckV4cHJlc3Npb24gICAgICA9ICdNZW1iZXJFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUHJvZ3JhbSAgICAgICAgICAgICAgID0gJ1Byb2dyYW0nO1xuZXhwb3J0IHZhciBTZXF1ZW5jZUV4cHJlc3Npb24gICAgPSAnU2VxdWVuY2VFeHByZXNzaW9uJzsiLCJpbXBvcnQgKiBhcyBDaGFyYWN0ZXIgZnJvbSAnLi9jaGFyYWN0ZXInO1xuaW1wb3J0ICogYXMgU3ludGF4IGZyb20gJy4vc3ludGF4JztcbmltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgbWFwIGZyb20gJy4vbWFwJztcbmltcG9ydCB0b0pTT04gZnJvbSAnLi90by1qc29uJztcblxudmFyIG5vZGVJZCA9IDAsXG4gICAgbGl0ZXJhbFR5cGVzID0gJ2Jvb2xlYW4gbnVtYmVyIHN0cmluZycuc3BsaXQoICcgJyApO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfk5vZGVcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlIEEgbm9kZSB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOb2RlKCB0eXBlICl7XG5cbiAgICBpZiggdHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICd0eXBlIG11c3QgYmUgYSBzdHJpbmcnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBCdWlsZGVyfk5vZGUjaWRcbiAgICAgKi9cbiAgICB0aGlzLmlkID0gKytub2RlSWQ7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBCdWlsZGVyfk5vZGUjdHlwZVxuICAgICAqL1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG59XG5cbk5vZGUucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuTm9kZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOb2RlO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBub2RlXG4gKi9cbk5vZGUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi50eXBlID0gdGhpcy50eXBlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG5vZGVcbiAqL1xuTm9kZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBTdHJpbmcoIHRoaXMudHlwZSApO1xufTtcblxuTm9kZS5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuaWQ7XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+Tm9kZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGV4cHJlc3Npb25UeXBlIEEgbm9kZSB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFeHByZXNzaW9uKCBleHByZXNzaW9uVHlwZSApe1xuICAgIE5vZGUuY2FsbCggdGhpcywgZXhwcmVzc2lvblR5cGUgKTtcbn1cblxuRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBOb2RlLnByb3RvdHlwZSApO1xuXG5FeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEV4cHJlc3Npb247XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+TGl0ZXJhbFxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpudW1iZXJ9IHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgbGl0ZXJhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gTGl0ZXJhbCggdmFsdWUsIHJhdyApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LkxpdGVyYWwgKTtcblxuICAgIGlmKCBsaXRlcmFsVHlwZXMuaW5kZXhPZiggdHlwZW9mIHZhbHVlICkgPT09IC0xICYmIHZhbHVlICE9PSBudWxsICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICd2YWx1ZSBtdXN0IGJlIGEgYm9vbGVhbiwgbnVtYmVyLCBzdHJpbmcsIG9yIG51bGwnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMucmF3ID0gcmF3O1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cbkxpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMaXRlcmFsO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsaXRlcmFsXG4gKi9cbkxpdGVyYWwucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5yYXcgPSB0aGlzLnJhdztcbiAgICBqc29uLnZhbHVlID0gdGhpcy52YWx1ZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsaXRlcmFsXG4gKi9cbkxpdGVyYWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5yYXc7XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfk1lbWJlckV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IG9iamVjdFxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb258QnVpbGRlcn5JZGVudGlmaWVyfSBwcm9wZXJ0eVxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBjb21wdXRlZD1mYWxzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSwgY29tcHV0ZWQgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5NZW1iZXJFeHByZXNzaW9uICk7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5FeHByZXNzaW9ufEJ1aWxkZXJ+SWRlbnRpZmllcn1cbiAgICAgKi9cbiAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmNvbXB1dGVkID0gY29tcHV0ZWQgfHwgZmFsc2U7XG59XG5cbk1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW1iZXJFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtZW1iZXIgZXhwcmVzc2lvblxuICovXG5NZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ub2JqZWN0ICAgPSB0aGlzLm9iamVjdC50b0pTT04oKTtcbiAgICBqc29uLnByb3BlcnR5ID0gdGhpcy5wcm9wZXJ0eS50b0pTT04oKTtcbiAgICBqc29uLmNvbXB1dGVkID0gdGhpcy5jb21wdXRlZDtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5Qcm9ncmFtXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk5vZGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXk8QnVpbGRlcn5TdGF0ZW1lbnQ+fSBib2R5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQcm9ncmFtKCBib2R5ICl7XG4gICAgTm9kZS5jYWxsKCB0aGlzLCBTeW50YXguUHJvZ3JhbSApO1xuXG4gICAgaWYoICFBcnJheS5pc0FycmF5KCBib2R5ICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2JvZHkgbXVzdCBiZSBhbiBhcnJheScgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpBcnJheTxCdWlsZGVyflN0YXRlbWVudD59XG4gICAgICovXG4gICAgdGhpcy5ib2R5ID0gYm9keSB8fCBbXTtcbiAgICB0aGlzLnNvdXJjZVR5cGUgPSAnc2NyaXB0Jztcbn1cblxuUHJvZ3JhbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBOb2RlLnByb3RvdHlwZSApO1xuXG5Qcm9ncmFtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFByb2dyYW07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHByb2dyYW1cbiAqL1xuUHJvZ3JhbS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmJvZHkgPSBtYXAoIHRoaXMuYm9keSwgdG9KU09OICk7XG4gICAganNvbi5zb3VyY2VUeXBlID0gdGhpcy5zb3VyY2VUeXBlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflN0YXRlbWVudFxuICogQGV4dGVuZHMgQnVpbGRlcn5Ob2RlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gc3RhdGVtZW50VHlwZSBBIG5vZGUgdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RhdGVtZW50KCBzdGF0ZW1lbnRUeXBlICl7XG4gICAgTm9kZS5jYWxsKCB0aGlzLCBzdGF0ZW1lbnRUeXBlICk7XG59XG5cblN0YXRlbWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBOb2RlLnByb3RvdHlwZSApO1xuXG5TdGF0ZW1lbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RhdGVtZW50O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkFycmF5RXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufSBlbGVtZW50cyBBIGxpc3Qgb2YgZXhwcmVzc2lvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFycmF5RXhwcmVzc2lvbiggZWxlbWVudHMgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5BcnJheUV4cHJlc3Npb24gKTtcblxuICAgIC8vaWYoICEoIEFycmF5LmlzQXJyYXkoIGVsZW1lbnRzICkgKSAmJiAhKCBlbGVtZW50cyBpbnN0YW5jZW9mIFJhbmdlRXhwcmVzc2lvbiApICl7XG4gICAgLy8gICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2VsZW1lbnRzIG11c3QgYmUgYSBsaXN0IG9mIGV4cHJlc3Npb25zIG9yIGFuIGluc3RhbmNlIG9mIHJhbmdlIGV4cHJlc3Npb24nICk7XG4gICAgLy99XG5cbiAgICAvKlxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ2VsZW1lbnRzJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiggZWxlbWVudHMgKXtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICB0aGlzWyBpbmRleCBdID0gZWxlbWVudHNbIGluZGV4IF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9ICk7XG4gICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50cztcbn1cblxuQXJyYXlFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkFycmF5RXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBcnJheUV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGFycmF5IGV4cHJlc3Npb25cbiAqL1xuQXJyYXlFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uZWxlbWVudHMgPSBBcnJheS5pc0FycmF5KCB0aGlzLmVsZW1lbnRzICkgP1xuICAgICAgICBtYXAoIHRoaXMuZWxlbWVudHMsIHRvSlNPTiApIDpcbiAgICAgICAgdGhpcy5lbGVtZW50cy50b0pTT04oKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5DYWxsRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gY2FsbGVlXG4gKiBAcGFyYW0ge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj59IGFyZ3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENhbGxFeHByZXNzaW9uKCBjYWxsZWUsIGFyZ3MgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5DYWxsRXhwcmVzc2lvbiApO1xuXG4gICAgaWYoICFBcnJheS5pc0FycmF5KCBhcmdzICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2FyZ3VtZW50cyBtdXN0IGJlIGFuIGFycmF5JyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+RXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLmNhbGxlZSA9IGNhbGxlZTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fVxuICAgICAqL1xuICAgIHRoaXMuYXJndW1lbnRzID0gYXJncztcbn1cblxuQ2FsbEV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuQ2FsbEV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2FsbEV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGNhbGwgZXhwcmVzc2lvblxuICovXG5DYWxsRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmNhbGxlZSAgICA9IHRoaXMuY2FsbGVlLnRvSlNPTigpO1xuICAgIGpzb24uYXJndW1lbnRzID0gbWFwKCB0aGlzLmFyZ3VtZW50cywgdG9KU09OICk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+Q29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk1lbWJlckV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBvYmplY3RcbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBwcm9wZXJ0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICl7XG4gICAgaWYoICEoIHByb3BlcnR5IGluc3RhbmNlb2YgRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdwcm9wZXJ0eSBtdXN0IGJlIGFuIGV4cHJlc3Npb24gd2hlbiBjb21wdXRlZCBpcyB0cnVlJyApO1xuICAgIH1cblxuICAgIE1lbWJlckV4cHJlc3Npb24uY2FsbCggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSwgdHJ1ZSApO1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciBCdWlsZGVyfkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiNjb21wdXRlZD10cnVlXG4gICAgICovXG59XG5cbkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkV4cHJlc3Npb25TdGF0ZW1lbnRcbiAqIEBleHRlbmRzIEJ1aWxkZXJ+U3RhdGVtZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFeHByZXNzaW9uU3RhdGVtZW50KCBleHByZXNzaW9uICl7XG4gICAgU3RhdGVtZW50LmNhbGwoIHRoaXMsIFN5bnRheC5FeHByZXNzaW9uU3RhdGVtZW50ICk7XG5cbiAgICBpZiggISggZXhwcmVzc2lvbiBpbnN0YW5jZW9mIEV4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYXJndW1lbnQgbXVzdCBiZSBhbiBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+RXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLmV4cHJlc3Npb24gPSBleHByZXNzaW9uO1xufVxuXG5FeHByZXNzaW9uU3RhdGVtZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFN0YXRlbWVudC5wcm90b3R5cGUgKTtcblxuRXhwcmVzc2lvblN0YXRlbWVudC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFeHByZXNzaW9uU3RhdGVtZW50O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBleHByZXNzaW9uIHN0YXRlbWVudFxuICovXG5FeHByZXNzaW9uU3RhdGVtZW50LnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvbi50b0pTT04oKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5JZGVudGlmaWVyXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBpZGVudGlmaWVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJZGVudGlmaWVyKCBuYW1lICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguSWRlbnRpZmllciApO1xuXG4gICAgaWYoIHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJyApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbmFtZSBtdXN0IGJlIGEgc3RyaW5nJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xufVxuXG5JZGVudGlmaWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbklkZW50aWZpZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSWRlbnRpZmllcjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgaWRlbnRpZmllclxuICovXG5JZGVudGlmaWVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ubmFtZSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIE51bGxMaXRlcmFsKCByYXcgKXtcbiAgICBpZiggcmF3ICE9PSAnbnVsbCcgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JhdyBpcyBub3QgYSBudWxsIGxpdGVyYWwnICk7XG4gICAgfVxuXG4gICAgTGl0ZXJhbC5jYWxsKCB0aGlzLCBudWxsLCByYXcgKTtcbn1cblxuTnVsbExpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTGl0ZXJhbC5wcm90b3R5cGUgKTtcblxuTnVsbExpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVsbExpdGVyYWw7XG5cbmV4cG9ydCBmdW5jdGlvbiBOdW1lcmljTGl0ZXJhbCggcmF3ICl7XG4gICAgdmFyIHZhbHVlID0gcGFyc2VGbG9hdCggcmF3ICk7XG5cbiAgICBpZiggaXNOYU4oIHZhbHVlICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JhdyBpcyBub3QgYSBudW1lcmljIGxpdGVyYWwnICk7XG4gICAgfVxuXG4gICAgTGl0ZXJhbC5jYWxsKCB0aGlzLCB2YWx1ZSwgcmF3ICk7XG59XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExpdGVyYWwucHJvdG90eXBlICk7XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bWVyaWNMaXRlcmFsO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflNlcXVlbmNlRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufSBleHByZXNzaW9ucyBUaGUgZXhwcmVzc2lvbnMgaW4gdGhlIHNlcXVlbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXF1ZW5jZUV4cHJlc3Npb24oIGV4cHJlc3Npb25zICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguU2VxdWVuY2VFeHByZXNzaW9uICk7XG5cbiAgICAvL2lmKCAhKCBBcnJheS5pc0FycmF5KCBleHByZXNzaW9ucyApICkgJiYgISggZXhwcmVzc2lvbnMgaW5zdGFuY2VvZiBSYW5nZUV4cHJlc3Npb24gKSApe1xuICAgIC8vICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdleHByZXNzaW9ucyBtdXN0IGJlIGEgbGlzdCBvZiBleHByZXNzaW9ucyBvciBhbiBpbnN0YW5jZSBvZiByYW5nZSBleHByZXNzaW9uJyApO1xuICAgIC8vfVxuXG4gICAgLypcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdleHByZXNzaW9ucycsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oIGV4cHJlc3Npb25zICl7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmxlbmd0aCA9IGV4cHJlc3Npb25zLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgdGhpc1sgaW5kZXggXSA9IGV4cHJlc3Npb25zWyBpbmRleCBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSApO1xuICAgICovXG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLmV4cHJlc3Npb25zID0gZXhwcmVzc2lvbnM7XG59XG5cblNlcXVlbmNlRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5TZXF1ZW5jZUV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2VxdWVuY2VFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzZXF1ZW5jZSBleHByZXNzaW9uXG4gKi9cblNlcXVlbmNlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmV4cHJlc3Npb25zID0gQXJyYXkuaXNBcnJheSggdGhpcy5leHByZXNzaW9ucyApID9cbiAgICAgICAgbWFwKCB0aGlzLmV4cHJlc3Npb25zLCB0b0pTT04gKSA6XG4gICAgICAgIHRoaXMuZXhwcmVzc2lvbnMudG9KU09OKCk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+U3RhdGljTWVtYmVyRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5NZW1iZXJFeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gb2JqZWN0XG4gKiBAcGFyYW0ge0J1aWxkZXJ+SWRlbnRpZmllcn0gcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0YXRpY01lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHkgKXtcbiAgICAvL2lmKCAhKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIElkZW50aWZpZXIgKSAmJiAhKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIExvb2t1cEV4cHJlc3Npb24gKSAmJiAhKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIEJsb2NrRXhwcmVzc2lvbiApICl7XG4gICAgLy8gICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3Byb3BlcnR5IG11c3QgYmUgYW4gaWRlbnRpZmllciwgZXZhbCBleHByZXNzaW9uLCBvciBsb29rdXAgZXhwcmVzc2lvbiB3aGVuIGNvbXB1dGVkIGlzIGZhbHNlJyApO1xuICAgIC8vfVxuXG4gICAgTWVtYmVyRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5LCBmYWxzZSApO1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciBCdWlsZGVyflN0YXRpY01lbWJlckV4cHJlc3Npb24jY29tcHV0ZWQ9ZmFsc2VcbiAgICAgKi9cbn1cblxuU3RhdGljTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5TdGF0aWNNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0YXRpY01lbWJlckV4cHJlc3Npb247XG5cbmV4cG9ydCBmdW5jdGlvbiBTdHJpbmdMaXRlcmFsKCByYXcgKXtcbiAgICBpZiggIUNoYXJhY3Rlci5pc1F1b3RlKCByYXdbIDAgXSApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyYXcgaXMgbm90IGEgc3RyaW5nIGxpdGVyYWwnICk7XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlID0gcmF3LnN1YnN0cmluZyggMSwgcmF3Lmxlbmd0aCAtIDEgKTtcblxuICAgIExpdGVyYWwuY2FsbCggdGhpcywgdmFsdWUsIHJhdyApO1xufVxuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExpdGVyYWwucHJvdG90eXBlICk7XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RyaW5nTGl0ZXJhbDsiLCJleHBvcnQgdmFyIEJsb2NrRXhwcmVzc2lvbiAgICAgICA9ICdCbG9ja0V4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBFeGlzdGVudGlhbEV4cHJlc3Npb24gPSAnRXhpc3RlbnRpYWxFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgTG9va3VwRXhwcmVzc2lvbiAgICAgID0gJ0xvb2t1cEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBSYW5nZUV4cHJlc3Npb24gICAgICAgPSAnUmFuZ2VFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUm9vdEV4cHJlc3Npb24gICAgICAgID0gJ1Jvb3RFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgU2NvcGVFeHByZXNzaW9uICAgICAgID0gJ1Njb3BlRXhwcmVzc2lvbic7IiwidmFyIF9oYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0geyp9IG9iamVjdFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHByb3BlcnR5XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGhhc093blByb3BlcnR5KCBvYmplY3QsIHByb3BlcnR5ICl7XG4gICAgcmV0dXJuIF9oYXNPd25Qcm9wZXJ0eS5jYWxsKCBvYmplY3QsIHByb3BlcnR5ICk7XG59IiwiaW1wb3J0IHsgQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLCBFeHByZXNzaW9uLCBJZGVudGlmaWVyLCBOb2RlLCBMaXRlcmFsIH0gZnJvbSAnLi9ub2RlJztcbmltcG9ydCAqIGFzIEtleXBhdGhTeW50YXggZnJvbSAnLi9rZXlwYXRoLXN5bnRheCc7XG5pbXBvcnQgaGFzT3duUHJvcGVydHkgZnJvbSAnLi9oYXMtb3duLXByb3BlcnR5JztcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5PcGVyYXRvckV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGV4cHJlc3Npb25UeXBlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gb3BlcmF0b3JcbiAqL1xuZnVuY3Rpb24gT3BlcmF0b3JFeHByZXNzaW9uKCBleHByZXNzaW9uVHlwZSwgb3BlcmF0b3IgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIGV4cHJlc3Npb25UeXBlICk7XG5cbiAgICB0aGlzLm9wZXJhdG9yID0gb3BlcmF0b3I7XG59XG5cbk9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5PcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gT3BlcmF0b3JFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBvcGVyYXRvciBleHByZXNzaW9uXG4gKi9cbk9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLm9wZXJhdG9yID0gdGhpcy5vcGVyYXRvcjtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIEJsb2NrRXhwcmVzc2lvbiggYm9keSApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgJ0Jsb2NrRXhwcmVzc2lvbicgKTtcblxuICAgIC8qXG4gICAgaWYoICEoIGV4cHJlc3Npb24gaW5zdGFuY2VvZiBFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2FyZ3VtZW50IG11c3QgYmUgYW4gZXhwcmVzc2lvbicgKTtcbiAgICB9XG4gICAgKi9cblxuICAgIHRoaXMuYm9keSA9IGJvZHk7XG59XG5cbkJsb2NrRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5CbG9ja0V4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQmxvY2tFeHByZXNzaW9uO1xuXG5leHBvcnQgZnVuY3Rpb24gRXhpc3RlbnRpYWxFeHByZXNzaW9uKCBleHByZXNzaW9uICl7XG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uLCAnPycgKTtcblxuICAgIHRoaXMuZXhwcmVzc2lvbiA9IGV4cHJlc3Npb247XG59XG5cbkV4aXN0ZW50aWFsRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkV4aXN0ZW50aWFsRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFeGlzdGVudGlhbEV4cHJlc3Npb247XG5cbkV4aXN0ZW50aWFsRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvbi50b0pTT04oKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIExvb2t1cEV4cHJlc3Npb24oIGtleSApe1xuICAgIGlmKCAhKCBrZXkgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgISgga2V5IGluc3RhbmNlb2YgSWRlbnRpZmllciApICYmICEoIGtleSBpbnN0YW5jZW9mIEJsb2NrRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdrZXkgbXVzdCBiZSBhIGxpdGVyYWwsIGlkZW50aWZpZXIsIG9yIGV2YWwgZXhwcmVzc2lvbicgKTtcbiAgICB9XG5cbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uLCAnJScgKTtcblxuICAgIHRoaXMua2V5ID0ga2V5O1xufVxuXG5Mb29rdXBFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuTG9va3VwRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMb29rdXBFeHByZXNzaW9uO1xuXG5Mb29rdXBFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0b3IgKyB0aGlzLmtleTtcbn07XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmtleSA9IHRoaXMua2V5O1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflJhbmdlRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5PcGVyYXRvckV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBsZWZ0XG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gcmlnaHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJhbmdlRXhwcmVzc2lvbiggbGVmdCwgcmlnaHQgKXtcbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5SYW5nZUV4cHJlc3Npb24sICcuLicgKTtcblxuICAgIGlmKCAhKCBsZWZ0IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmIGxlZnQgIT09IG51bGwgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xlZnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBsaXRlcmFsIG9yIG51bGwnICk7XG4gICAgfVxuXG4gICAgaWYoICEoIHJpZ2h0IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmIHJpZ2h0ICE9PSBudWxsICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyaWdodCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGxpdGVyYWwgb3IgbnVsbCcgKTtcbiAgICB9XG5cbiAgICBpZiggbGVmdCA9PT0gbnVsbCAmJiByaWdodCA9PT0gbnVsbCApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGVmdCBhbmQgcmlnaHQgY2Fubm90IGVxdWFsIG51bGwgYXQgdGhlIHNhbWUgdGltZScgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uI2xlZnRcbiAgICAgKi9cbiAgICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5MaXRlcmFsfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiMwXG4gICAgICovXG4gICAgdGhpc1sgMCBdID0gdGhpcy5sZWZ0ID0gbGVmdDtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+TGl0ZXJhbH0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jcmlnaHRcbiAgICAgKi9cbiAgICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5MaXRlcmFsfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiMxXG4gICAgICovXG4gICAgdGhpc1sgMSBdID0gdGhpcy5yaWdodCA9IHJpZ2h0O1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiNsZW5ndGg9MlxuICAgICAqL1xuICAgIHRoaXMubGVuZ3RoID0gMjtcbn1cblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblJhbmdlRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSYW5nZUV4cHJlc3Npb247XG5cblJhbmdlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ubGVmdCA9IHRoaXMubGVmdCAhPT0gbnVsbCA/XG4gICAgICAgIHRoaXMubGVmdC50b0pTT04oKSA6XG4gICAgICAgIHRoaXMubGVmdDtcbiAgICBqc29uLnJpZ2h0ID0gdGhpcy5yaWdodCAhPT0gbnVsbCA/XG4gICAgICAgIHRoaXMucmlnaHQudG9KU09OKCkgOlxuICAgICAgICB0aGlzLnJpZ2h0O1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5SYW5nZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5sZWZ0LnRvU3RyaW5nKCkgKyB0aGlzLm9wZXJhdG9yICsgdGhpcy5yaWdodC50b1N0cmluZygpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFJlbGF0aW9uYWxNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5LCBjYXJkaW5hbGl0eSApe1xuICAgIENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5ICk7XG5cbiAgICBpZiggIWhhc093blByb3BlcnR5KCBDYXJkaW5hbGl0eSwgY2FyZGluYWxpdHkgKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnVW5rbm93biBjYXJkaW5hbGl0eSAnICsgY2FyZGluYWxpdHkgKTtcbiAgICB9XG5cbiAgICB0aGlzLmNhcmRpbmFsaXR5ID0gY2FyZGluYWxpdHk7XG59XG5cblJlbGF0aW9uYWxNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb247XG5cbmV4cG9ydCBmdW5jdGlvbiBSb290RXhwcmVzc2lvbigga2V5ICl7XG4gICAgaWYoICEoIGtleSBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISgga2V5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2tleSBtdXN0IGJlIGEgbGl0ZXJhbCwgaWRlbnRpZmllciwgb3IgZXZhbCBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uLCAnficgKTtcblxuICAgIHRoaXMua2V5ID0ga2V5O1xufVxuXG5Sb290RXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJvb3RFeHByZXNzaW9uO1xuXG5Sb290RXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICsgdGhpcy5rZXk7XG59O1xuXG5Sb290RXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ua2V5ID0gdGhpcy5rZXk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBTY29wZUV4cHJlc3Npb24oIG9wZXJhdG9yLCBrZXkgKXtcbiAgICAvL2lmKCAhKCBrZXkgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgISgga2V5IGluc3RhbmNlb2YgSWRlbnRpZmllciApICYmICEoIGtleSBpbnN0YW5jZW9mIEJsb2NrRXhwcmVzc2lvbiApICl7XG4gICAgLy8gICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2tleSBtdXN0IGJlIGEgbGl0ZXJhbCwgaWRlbnRpZmllciwgb3IgZXZhbCBleHByZXNzaW9uJyApO1xuICAgIC8vfVxuXG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguU2NvcGVFeHByZXNzaW9uLCBvcGVyYXRvciApO1xuXG4gICAgdGhpcy5rZXkgPSBrZXk7XG59XG5cblNjb3BlRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblNjb3BlRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTY29wZUV4cHJlc3Npb247XG5cblNjb3BlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICsgdGhpcy5rZXk7XG59O1xuXG5TY29wZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmtleSA9IHRoaXMua2V5O1xuXG4gICAgcmV0dXJuIGpzb247XG59OyIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBHcmFtbWFyIGZyb20gJy4vZ3JhbW1hcic7XG5pbXBvcnQgKiBhcyBOb2RlIGZyb20gJy4vbm9kZSc7XG5pbXBvcnQgKiBhcyBLZXlwYXRoTm9kZSBmcm9tICcuL2tleXBhdGgtbm9kZSc7XG5cbnZhciBidWlsZGVyUHJvdG90eXBlO1xuXG5mdW5jdGlvbiB1bnNoaWZ0KCBsaXN0LCBpdGVtICl7XG4gICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgbGVuZ3RoID0gbGlzdC5sZW5ndGgsXG4gICAgICAgIHQxID0gaXRlbSxcbiAgICAgICAgdDIgPSBpdGVtO1xuXG4gICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgIHQxID0gdDI7XG4gICAgICAgIHQyID0gbGlzdFsgaW5kZXggXTtcbiAgICAgICAgbGlzdFsgaW5kZXggXSA9IHQxO1xuICAgIH1cblxuICAgIGxpc3RbIGxlbmd0aCBdID0gdDI7XG5cbiAgICByZXR1cm4gbGlzdDtcbn1cblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlclxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtMZXhlcn0gbGV4ZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQnVpbGRlciggbGV4ZXIgKXtcbiAgICB0aGlzLmxleGVyID0gbGV4ZXI7XG59XG5cbmJ1aWxkZXJQcm90b3R5cGUgPSBCdWlsZGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbmJ1aWxkZXJQcm90b3R5cGUuY29uc3RydWN0b3IgPSBCdWlsZGVyO1xuXG5idWlsZGVyUHJvdG90eXBlLmFycmF5RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBsaXN0ICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0FSUkFZIEVYUFJFU1NJT04nICk7XG4gICAgdGhpcy5jb25zdW1lKCAnWycgKTtcbiAgICByZXR1cm4gbmV3IE5vZGUuQXJyYXlFeHByZXNzaW9uKCBsaXN0ICk7XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLmJsb2NrRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCB0ZXJtaW5hdG9yICl7XG4gICAgdmFyIGJsb2NrID0gW10sXG4gICAgICAgIGlzb2xhdGVkID0gZmFsc2U7XG4gICAgLy9jb25zb2xlLmxvZyggJ0JMT0NLJywgdGVybWluYXRvciApO1xuICAgIGlmKCAhdGhpcy5wZWVrKCB0ZXJtaW5hdG9yICkgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gRVhQUkVTU0lPTlMnICk7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIHVuc2hpZnQoIGJsb2NrLCB0aGlzLmNvbnN1bWUoKSApO1xuICAgICAgICB9IHdoaWxlKCAhdGhpcy5wZWVrKCB0ZXJtaW5hdG9yICkgKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lKCB0ZXJtaW5hdG9yICk7XG4gICAgLyppZiggdGhpcy5wZWVrKCAnficgKSApe1xuICAgICAgICBpc29sYXRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuY29uc3VtZSggJ34nICk7XG4gICAgfSovXG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5CbG9ja0V4cHJlc3Npb24oIGJsb2NrLCBpc29sYXRlZCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfEFycmF5PEJ1aWxkZXJ+VG9rZW4+fSBpbnB1dFxuICogQHJldHVybnMge1Byb2dyYW19IFRoZSBidWlsdCBhYnN0cmFjdCBzeW50YXggdHJlZVxuICovXG5idWlsZGVyUHJvdG90eXBlLmJ1aWxkID0gZnVuY3Rpb24oIGlucHV0ICl7XG4gICAgaWYoIHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgKXtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudGV4dCA9IGlucHV0O1xuXG4gICAgICAgIGlmKCB0eXBlb2YgdGhpcy5sZXhlciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsZXhlciBpcyBub3QgZGVmaW5lZCcgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpBcnJheTxUb2tlbj59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRva2VucyA9IHRoaXMubGV4ZXIubGV4KCBpbnB1dCApO1xuICAgIH0gZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaW5wdXQgKSApe1xuICAgICAgICB0aGlzLnRva2VucyA9IGlucHV0LnNsaWNlKCk7XG4gICAgICAgIHRoaXMudGV4dCA9IGlucHV0LmpvaW4oICcnICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2ludmFsaWQgaW5wdXQnICk7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coICdCVUlMRCcgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSAnLCB0aGlzLnRleHQubGVuZ3RoLCAnQ0hBUlMnLCB0aGlzLnRleHQgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSAnLCB0aGlzLnRva2Vucy5sZW5ndGgsICdUT0tFTlMnLCB0aGlzLnRva2VucyApO1xuICAgIHRoaXMuY29sdW1uID0gdGhpcy50ZXh0Lmxlbmd0aDtcbiAgICB0aGlzLmxpbmUgPSAxO1xuXG4gICAgdmFyIHByb2dyYW0gPSB0aGlzLnByb2dyYW0oKTtcblxuICAgIGlmKCB0aGlzLnRva2Vucy5sZW5ndGggKXtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAnVW5leHBlY3RlZCB0b2tlbiAnICsgdGhpcy50b2tlbnNbIDAgXSArICcgcmVtYWluaW5nJyApO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9ncmFtO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtDYWxsRXhwcmVzc2lvbn0gVGhlIGNhbGwgZXhwcmVzc2lvbiBub2RlXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuY2FsbEV4cHJlc3Npb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBhcmdzID0gdGhpcy5saXN0KCAnKCcgKSxcbiAgICAgICAgY2FsbGVlO1xuXG4gICAgdGhpcy5jb25zdW1lKCAnKCcgKTtcblxuICAgIGNhbGxlZSA9IHRoaXMuZXhwcmVzc2lvbigpO1xuICAgIC8vY29uc29sZS5sb2coICdDQUxMIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gQ0FMTEVFJywgY2FsbGVlICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gQVJHVU1FTlRTJywgYXJncywgYXJncy5sZW5ndGggKTtcbiAgICByZXR1cm4gbmV3IE5vZGUuQ2FsbEV4cHJlc3Npb24oIGNhbGxlZSwgYXJncyApO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBuZXh0IHRva2VuIGluIHRoZSB0b2tlbiBsaXN0LiBJZiBhIGNvbXBhcmlzb24gaXMgcHJvdmlkZWQsIHRoZSB0b2tlbiB3aWxsIG9ubHkgYmUgcmV0dXJuZWQgaWYgdGhlIHZhbHVlIG1hdGNoZXMuIE90aGVyd2lzZSBhbiBlcnJvciBpcyB0aHJvd24uXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZXhwZWN0ZWRdIEFuIGV4cGVjdGVkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtUb2tlbn0gVGhlIG5leHQgdG9rZW4gaW4gdGhlIGxpc3RcbiAqIEB0aHJvd3Mge1N5bnRheEVycm9yfSBJZiB0b2tlbiBkaWQgbm90IGV4aXN0XG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuY29uc3VtZSA9IGZ1bmN0aW9uKCBleHBlY3RlZCApe1xuICAgIGlmKCAhdGhpcy50b2tlbnMubGVuZ3RoICl7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggJ1VuZXhwZWN0ZWQgZW5kIG9mIGV4cHJlc3Npb24nICk7XG4gICAgfVxuXG4gICAgdmFyIHRva2VuID0gdGhpcy5leHBlY3QoIGV4cGVjdGVkICk7XG5cbiAgICBpZiggIXRva2VuICl7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggJ1VuZXhwZWN0ZWQgdG9rZW4gJyArIHRva2VuLnZhbHVlICsgJyBjb25zdW1lZCcgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdG9rZW47XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLmV4aXN0ZW50aWFsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb24oKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBFWElTVCBFWFBSRVNTSU9OJywgZXhwcmVzc2lvbiApO1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuRXhpc3RlbnRpYWxFeHByZXNzaW9uKCBleHByZXNzaW9uICk7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgdGhlIG5leHQgdG9rZW4gaW4gdGhlIHRva2VuIGxpc3QuIElmIGNvbXBhcmlzb25zIGFyZSBwcm92aWRlZCwgdGhlIHRva2VuIHdpbGwgb25seSBiZSByZXR1cm5lZCBpZiB0aGUgdmFsdWUgbWF0Y2hlcyBvbmUgb2YgdGhlIGNvbXBhcmlzb25zLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZpcnN0XSBUaGUgZmlyc3QgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtzZWNvbmRdIFRoZSBzZWNvbmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFt0aGlyZF0gVGhlIHRoaXJkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZm91cnRoXSBUaGUgZm91cnRoIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtUb2tlbn0gVGhlIG5leHQgdG9rZW4gaW4gdGhlIGxpc3Qgb3IgYHVuZGVmaW5lZGAgaWYgaXQgZGlkIG5vdCBleGlzdFxuICovXG5idWlsZGVyUHJvdG90eXBlLmV4cGVjdCA9IGZ1bmN0aW9uKCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICl7XG4gICAgdmFyIHRva2VuID0gdGhpcy5wZWVrKCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICk7XG5cbiAgICBpZiggdG9rZW4gKXtcbiAgICAgICAgdGhpcy50b2tlbnNbIHRoaXMudG9rZW5zLmxlbmd0aC0tIF07XG4gICAgICAgIHRoaXMuY29sdW1uIC09IHRva2VuLnZhbHVlLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH1cblxuICAgIHJldHVybiB2b2lkIDA7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0V4cHJlc3Npb259IEFuIGV4cHJlc3Npb24gbm9kZVxuICovXG5idWlsZGVyUHJvdG90eXBlLmV4cHJlc3Npb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBleHByZXNzaW9uID0gbnVsbCxcbiAgICAgICAgbGlzdCwgbmV4dCwgdG9rZW47XG5cbiAgICBpZiggdGhpcy5leHBlY3QoICc7JyApICl7XG4gICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICB9XG5cbiAgICBpZiggbmV4dCA9IHRoaXMucGVlaygpICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFWFBSRVNTSU9OJywgbmV4dCApO1xuICAgICAgICBzd2l0Y2goIG5leHQudHlwZSApe1xuICAgICAgICAgICAgY2FzZSBHcmFtbWFyLlB1bmN0dWF0b3I6XG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuZXhwZWN0KCAnXScgKSApe1xuICAgICAgICAgICAgICAgICAgICBsaXN0ID0gdGhpcy5saXN0KCAnWycgKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMudG9rZW5zLmxlbmd0aCA9PT0gMSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuYXJyYXlFeHByZXNzaW9uKCBsaXN0ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggbGlzdC5sZW5ndGggPiAxICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5zZXF1ZW5jZUV4cHJlc3Npb24oIGxpc3QgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSBBcnJheS5pc0FycmF5KCBsaXN0ICkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RbIDAgXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIG5leHQudmFsdWUgPT09ICd9JyApe1xuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXAoIG5leHQgKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggdGhpcy5leHBlY3QoICc/JyApICl7XG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmV4aXN0ZW50aWFsRXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBHcmFtbWFyLk51bGxMaXRlcmFsOlxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxpdGVyYWwoKTtcbiAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyBHcmFtbWFyLklkZW50aWZpZXJcbiAgICAgICAgICAgIC8vIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWxcbiAgICAgICAgICAgIC8vIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbFxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXAoIG5leHQgKTtcbiAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICAgICAgLy8gSW1wbGllZCBtZW1iZXIgZXhwcmVzc2lvbi4gU2hvdWxkIG9ubHkgaGFwcGVuIGFmdGVyIGFuIElkZW50aWZpZXIuXG4gICAgICAgICAgICAgICAgaWYoIG5leHQgJiYgbmV4dC50eXBlID09PSBHcmFtbWFyLlB1bmN0dWF0b3IgJiYgKCBuZXh0LnZhbHVlID09PSAnKScgfHwgbmV4dC52YWx1ZSA9PT0gJ10nIHx8IG5leHQudmFsdWUgPT09ICc/JyApICl7XG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLm1lbWJlckV4cHJlc3Npb24oIGV4cHJlc3Npb24sIGZhbHNlICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUoICggdG9rZW4gPSB0aGlzLmV4cGVjdCggJyknLCAnWycsICcuJyApICkgKXtcbiAgICAgICAgICAgIGlmKCB0b2tlbi52YWx1ZSA9PT0gJyknICl7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuY2FsbEV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdG9rZW4udmFsdWUgPT09ICdbJyApe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLm1lbWJlckV4cHJlc3Npb24oIGV4cHJlc3Npb24sIHRydWUgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdG9rZW4udmFsdWUgPT09ICcuJyApe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLm1lbWJlckV4cHJlc3Npb24oIGV4cHJlc3Npb24sIGZhbHNlICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggJ1VuZXhwZWN0ZWQgdG9rZW46ICcgKyB0b2tlbiApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0V4cHJlc3Npb25TdGF0ZW1lbnR9IEFuIGV4cHJlc3Npb24gc3RhdGVtZW50XG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuZXhwcmVzc2lvblN0YXRlbWVudCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb24oKSxcbiAgICAgICAgZXhwcmVzc2lvblN0YXRlbWVudDtcbiAgICAvL2NvbnNvbGUubG9nKCAnRVhQUkVTU0lPTiBTVEFURU1FTlQgV0lUSCcsIGV4cHJlc3Npb24gKTtcbiAgICBleHByZXNzaW9uU3RhdGVtZW50ID0gbmV3IE5vZGUuRXhwcmVzc2lvblN0YXRlbWVudCggZXhwcmVzc2lvbiApO1xuXG4gICAgcmV0dXJuIGV4cHJlc3Npb25TdGF0ZW1lbnQ7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0lkZW50aWZpZXJ9IEFuIGlkZW50aWZpZXJcbiAqIEB0aHJvd3Mge1N5bnRheEVycm9yfSBJZiB0aGUgdG9rZW4gaXMgbm90IGFuIGlkZW50aWZpZXJcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5pZGVudGlmaWVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgdG9rZW4gPSB0aGlzLmNvbnN1bWUoKTtcblxuICAgIGlmKCAhKCB0b2tlbi50eXBlID09PSBHcmFtbWFyLklkZW50aWZpZXIgKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnSWRlbnRpZmllciBleHBlY3RlZCcgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IE5vZGUuSWRlbnRpZmllciggdG9rZW4udmFsdWUgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdGVybWluYXRvclxuICogQHJldHVybnMge2V4dGVybmFsOkFycmF5PEV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn0gVGhlIGxpc3Qgb2YgZXhwcmVzc2lvbnMgb3IgcmFuZ2UgZXhwcmVzc2lvblxuICovXG5idWlsZGVyUHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbiggdGVybWluYXRvciApe1xuICAgIHZhciBsaXN0ID0gW10sXG4gICAgICAgIGlzTnVtZXJpYyA9IGZhbHNlLFxuICAgICAgICBleHByZXNzaW9uLCBuZXh0O1xuICAgIC8vY29uc29sZS5sb2coICdMSVNUJywgdGVybWluYXRvciApO1xuICAgIGlmKCAhdGhpcy5wZWVrKCB0ZXJtaW5hdG9yICkgKXtcbiAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICBpc051bWVyaWMgPSBuZXh0LnR5cGUgPT09IEdyYW1tYXIuTnVtZXJpY0xpdGVyYWw7XG5cbiAgICAgICAgLy8gRXhhbXBsZXM6IFsxLi4zXSwgWzUuLl0sIFsuLjddXG4gICAgICAgIGlmKCAoIGlzTnVtZXJpYyB8fCBuZXh0LnZhbHVlID09PSAnLicgKSAmJiB0aGlzLnBlZWtBdCggMSwgJy4nICkgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIFJBTkdFIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaXNOdW1lcmljID9cbiAgICAgICAgICAgICAgICB0aGlzLmxvb2t1cCggbmV4dCApIDpcbiAgICAgICAgICAgICAgICBudWxsO1xuICAgICAgICAgICAgbGlzdCA9IHRoaXMucmFuZ2VFeHByZXNzaW9uKCBleHByZXNzaW9uICk7XG5cbiAgICAgICAgLy8gRXhhbXBsZXM6IFsxLDIsM10sIFtcImFiY1wiLFwiZGVmXCJdLCBbZm9vLGJhcl0sIFt7Zm9vLmJhcn1dXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBBUlJBWSBPRiBFWFBSRVNTSU9OUycgKTtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXAoIG5leHQgKTtcbiAgICAgICAgICAgICAgICB1bnNoaWZ0KCBsaXN0LCBleHByZXNzaW9uICk7XG4gICAgICAgICAgICB9IHdoaWxlKCB0aGlzLmV4cGVjdCggJywnICkgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCAnLSBMSVNUIFJFU1VMVCcsIGxpc3QgKTtcbiAgICByZXR1cm4gbGlzdDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7TGl0ZXJhbH0gVGhlIGxpdGVyYWwgbm9kZVxuICovXG5idWlsZGVyUHJvdG90eXBlLmxpdGVyYWwgPSBmdW5jdGlvbigpe1xuICAgIHZhciB0b2tlbiA9IHRoaXMuY29uc3VtZSgpLFxuICAgICAgICByYXcgPSB0b2tlbi52YWx1ZTtcblxuICAgIHN3aXRjaCggdG9rZW4udHlwZSApe1xuICAgICAgICBjYXNlIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWw6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE5vZGUuTnVtZXJpY0xpdGVyYWwoIHJhdyApO1xuICAgICAgICBjYXNlIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTm9kZS5TdHJpbmdMaXRlcmFsKCByYXcgKTtcbiAgICAgICAgY2FzZSBHcmFtbWFyLk51bGxMaXRlcmFsOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOb2RlLk51bGxMaXRlcmFsKCByYXcgKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdMaXRlcmFsIGV4cGVjdGVkJyApO1xuICAgIH1cbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUubG9va3VwID0gZnVuY3Rpb24oIG5leHQgKXtcbiAgICB2YXIgZXhwcmVzc2lvbjtcbiAgICAvL2NvbnNvbGUubG9nKCAnTE9PS1VQJywgbmV4dCApO1xuICAgIHN3aXRjaCggbmV4dC50eXBlICl7XG4gICAgICAgIGNhc2UgR3JhbW1hci5JZGVudGlmaWVyOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuaWRlbnRpZmllcigpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR3JhbW1hci5OdW1lcmljTGl0ZXJhbDpcbiAgICAgICAgY2FzZSBHcmFtbWFyLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5saXRlcmFsKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBHcmFtbWFyLlB1bmN0dWF0b3I6XG4gICAgICAgICAgICBpZiggbmV4dC52YWx1ZSA9PT0gJ30nICl7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdW1lKCAnfScgKTtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5ibG9ja0V4cHJlc3Npb24oICd7JyApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAndG9rZW4gY2Fubm90IGJlIGEgbG9va3VwJyApO1xuICAgIH1cblxuICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcblxuICAgIGlmKCBuZXh0ICYmIG5leHQudmFsdWUgPT09ICclJyApe1xuICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXBFeHByZXNzaW9uKCBleHByZXNzaW9uICk7XG4gICAgfVxuICAgIGlmKCBuZXh0ICYmIG5leHQudmFsdWUgPT09ICd+JyApe1xuICAgICAgICBleHByZXNzaW9uID0gdGhpcy5yb290RXhwcmVzc2lvbiggZXhwcmVzc2lvbiApO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCAnLSBMT09LVVAgUkVTVUxUJywgZXhwcmVzc2lvbiApO1xuICAgIHJldHVybiBleHByZXNzaW9uO1xufTtcblxuYnVpbGRlclByb3RvdHlwZS5sb29rdXBFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSApe1xuICAgIHRoaXMuY29uc3VtZSggJyUnICk7XG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5Mb29rdXBFeHByZXNzaW9uKCBrZXkgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0V4cHJlc3Npb259IHByb3BlcnR5IFRoZSBleHByZXNzaW9uIGFzc2lnbmVkIHRvIHRoZSBwcm9wZXJ0eSBvZiB0aGUgbWVtYmVyIGV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gY29tcHV0ZWQgV2hldGhlciBvciBub3QgdGhlIG1lbWJlciBleHByZXNzaW9uIGlzIGNvbXB1dGVkXG4gKiBAcmV0dXJucyB7TWVtYmVyRXhwcmVzc2lvbn0gVGhlIG1lbWJlciBleHByZXNzaW9uXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUubWVtYmVyRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBwcm9wZXJ0eSwgY29tcHV0ZWQgKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnTUVNQkVSJywgcHJvcGVydHkgKTtcbiAgICB2YXIgb2JqZWN0ID0gdGhpcy5leHByZXNzaW9uKCk7XG4gICAgLy9jb25zb2xlLmxvZyggJ01FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIE9CSkVDVCcsIG9iamVjdCApO1xuICAgIC8vY29uc29sZS5sb2coICctIFBST1BFUlRZJywgcHJvcGVydHkgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBDT01QVVRFRCcsIGNvbXB1dGVkICk7XG4gICAgcmV0dXJuIGNvbXB1dGVkID9cbiAgICAgICAgbmV3IE5vZGUuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICkgOlxuICAgICAgICBuZXcgTm9kZS5TdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICk7XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oIGlucHV0ICl7XG4gICAgdGhpcy50b2tlbnMgPSB0aGlzLmxleGVyLmxleCggaW5wdXQgKTtcbiAgICByZXR1cm4gdGhpcy5idWlsZCggdGhpcy50b2tlbnMgKTtcbn07XG5cbi8qKlxuICogUHJvdmlkZXMgdGhlIG5leHQgdG9rZW4gaW4gdGhlIHRva2VuIGxpc3QgX3dpdGhvdXQgcmVtb3ZpbmcgaXRfLiBJZiBjb21wYXJpc29ucyBhcmUgcHJvdmlkZWQsIHRoZSB0b2tlbiB3aWxsIG9ubHkgYmUgcmV0dXJuZWQgaWYgdGhlIHZhbHVlIG1hdGNoZXMgb25lIG9mIHRoZSBjb21wYXJpc29ucy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmaXJzdF0gVGhlIGZpcnN0IGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbc2Vjb25kXSBUaGUgc2Vjb25kIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbdGhpcmRdIFRoZSB0aGlyZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZvdXJ0aF0gVGhlIGZvdXJ0aCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcmV0dXJucyB7TGV4ZXJ+VG9rZW59IFRoZSBuZXh0IHRva2VuIGluIHRoZSBsaXN0IG9yIGB1bmRlZmluZWRgIGlmIGl0IGRpZCBub3QgZXhpc3RcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKXtcbiAgICByZXR1cm4gdGhpcy5wZWVrQXQoIDAsIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKTtcbn07XG5cbi8qKlxuICogUHJvdmlkZXMgdGhlIHRva2VuIGF0IHRoZSByZXF1ZXN0ZWQgcG9zaXRpb24gX3dpdGhvdXQgcmVtb3ZpbmcgaXRfIGZyb20gdGhlIHRva2VuIGxpc3QuIElmIGNvbXBhcmlzb25zIGFyZSBwcm92aWRlZCwgdGhlIHRva2VuIHdpbGwgb25seSBiZSByZXR1cm5lZCBpZiB0aGUgdmFsdWUgbWF0Y2hlcyBvbmUgb2YgdGhlIGNvbXBhcmlzb25zLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gcG9zaXRpb24gVGhlIHBvc2l0aW9uIHdoZXJlIHRoZSB0b2tlbiB3aWxsIGJlIHBlZWtlZFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmaXJzdF0gVGhlIGZpcnN0IGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbc2Vjb25kXSBUaGUgc2Vjb25kIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbdGhpcmRdIFRoZSB0aGlyZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZvdXJ0aF0gVGhlIGZvdXJ0aCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcmV0dXJucyB7TGV4ZXJ+VG9rZW59IFRoZSB0b2tlbiBhdCB0aGUgcmVxdWVzdGVkIHBvc2l0aW9uIG9yIGB1bmRlZmluZWRgIGlmIGl0IGRpZCBub3QgZXhpc3RcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5wZWVrQXQgPSBmdW5jdGlvbiggcG9zaXRpb24sIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKXtcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy50b2tlbnMubGVuZ3RoLFxuICAgICAgICBpbmRleCwgdG9rZW4sIHZhbHVlO1xuXG4gICAgaWYoIGxlbmd0aCAmJiB0eXBlb2YgcG9zaXRpb24gPT09ICdudW1iZXInICYmIHBvc2l0aW9uID4gLTEgKXtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGEgemVyby1iYXNlZCBpbmRleCBzdGFydGluZyBmcm9tIHRoZSBlbmQgb2YgdGhlIGxpc3RcbiAgICAgICAgaW5kZXggPSBsZW5ndGggLSBwb3NpdGlvbiAtIDE7XG5cbiAgICAgICAgaWYoIGluZGV4ID4gLTEgJiYgaW5kZXggPCBsZW5ndGggKXtcbiAgICAgICAgICAgIHRva2VuID0gdGhpcy50b2tlbnNbIGluZGV4IF07XG4gICAgICAgICAgICB2YWx1ZSA9IHRva2VuLnZhbHVlO1xuXG4gICAgICAgICAgICBpZiggdmFsdWUgPT09IGZpcnN0IHx8IHZhbHVlID09PSBzZWNvbmQgfHwgdmFsdWUgPT09IHRoaXJkIHx8IHZhbHVlID09PSBmb3VydGggfHwgKCAhZmlyc3QgJiYgIXNlY29uZCAmJiAhdGhpcmQgJiYgIWZvdXJ0aCApICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZvaWQgMDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7UHJvZ3JhbX0gQSBwcm9ncmFtIG5vZGVcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5wcm9ncmFtID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgYm9keSA9IFtdO1xuICAgIC8vY29uc29sZS5sb2coICdQUk9HUkFNJyApO1xuICAgIHdoaWxlKCB0cnVlICl7XG4gICAgICAgIGlmKCB0aGlzLnRva2Vucy5sZW5ndGggKXtcbiAgICAgICAgICAgIHVuc2hpZnQoIGJvZHksIHRoaXMuZXhwcmVzc2lvblN0YXRlbWVudCgpICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE5vZGUuUHJvZ3JhbSggYm9keSApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuYnVpbGRlclByb3RvdHlwZS5yYW5nZUV4cHJlc3Npb24gPSBmdW5jdGlvbiggcmlnaHQgKXtcbiAgICB2YXIgbGVmdDtcblxuICAgIHRoaXMuZXhwZWN0KCAnLicgKTtcbiAgICB0aGlzLmV4cGVjdCggJy4nICk7XG5cbiAgICBsZWZ0ID0gdGhpcy5wZWVrKCkudHlwZSA9PT0gR3JhbW1hci5OdW1lcmljTGl0ZXJhbCA/XG4gICAgICAgIGxlZnQgPSB0aGlzLmxpdGVyYWwoKSA6XG4gICAgICAgIG51bGw7XG5cbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLlJhbmdlRXhwcmVzc2lvbiggbGVmdCwgcmlnaHQgKTtcbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUucm9vdEV4cHJlc3Npb24gPSBmdW5jdGlvbigga2V5ICl7XG4gICAgdGhpcy5jb25zdW1lKCAnficgKTtcbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLlJvb3RFeHByZXNzaW9uKCBrZXkgKTtcbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUuc2VxdWVuY2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIGxpc3QgKXtcbiAgICByZXR1cm4gbmV3IE5vZGUuU2VxdWVuY2VFeHByZXNzaW9uKCBsaXN0ICk7XG59OyIsImltcG9ydCBoYXNPd25Qcm9wZXJ0eSBmcm9tICcuL2hhcy1vd24tcHJvcGVydHknO1xuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCBtYXAgZnJvbSAnLi9tYXAnO1xuaW1wb3J0ICogYXMgU3ludGF4IGZyb20gJy4vc3ludGF4JztcbmltcG9ydCAqIGFzIEtleXBhdGhTeW50YXggZnJvbSAnLi9rZXlwYXRoLXN5bnRheCc7XG5cbnZhciBub29wID0gZnVuY3Rpb24oKXt9LFxuXG4gICAgaW50ZXJwcmV0ZXJQcm90b3R5cGU7XG5cbi8qKlxuICogQGZ1bmN0aW9uIEludGVycHJldGVyfmdldHRlclxuICogQHBhcmFtIHtleHRlcm5hbDpPYmplY3R9IG9iamVjdFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGtleVxuICogQHJldHVybnMgeyp9IFRoZSB2YWx1ZSBvZiB0aGUgJ2tleScgcHJvcGVydHkgb24gJ29iamVjdCcuXG4gKi9cbmZ1bmN0aW9uIGdldHRlciggb2JqZWN0LCBrZXkgKXtcbiAgICByZXR1cm4gb2JqZWN0WyBrZXkgXTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gSW50ZXJwcmV0ZXJ+cmV0dXJuVmFsdWVcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBkZXB0aFxuICogQHJldHVybnMgeyp8ZXh0ZXJuYWw6T2JqZWN0fSBUaGUgZGVjaWRlZCB2YWx1ZVxuICovXG5mdW5jdGlvbiByZXR1cm5WYWx1ZSggdmFsdWUsIGRlcHRoICl7XG4gICAgcmV0dXJuICFkZXB0aCA/IHZhbHVlIDoge307XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEludGVycHJldGVyfnJldHVyblplcm9cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IHplcm9cbiAqL1xuZnVuY3Rpb24gcmV0dXJuWmVybygpe1xuICAgIHJldHVybiAwO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBJbnRlcnByZXRlcn5zZXR0ZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6T2JqZWN0fSBvYmplY3RcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm5zIHsqfSBUaGUgdmFsdWUgb2YgdGhlICdrZXknIHByb3BlcnR5IG9uICdvYmplY3QnLlxuICovXG5mdW5jdGlvbiBzZXR0ZXIoIG9iamVjdCwga2V5LCB2YWx1ZSApe1xuICAgIGlmKCAhaGFzT3duUHJvcGVydHkoIG9iamVjdCwga2V5ICkgKXtcbiAgICAgICAgb2JqZWN0WyBrZXkgXSA9IHZhbHVlIHx8IHt9O1xuICAgIH1cbiAgICByZXR1cm4gZ2V0dGVyKCBvYmplY3QsIGtleSApO1xufVxuXG4vKipcbiAqIEBjbGFzcyBJbnRlcnByZXRlclxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtCdWlsZGVyfSBidWlsZGVyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEludGVycHJldGVyKCBidWlsZGVyICl7XG4gICAgaWYoICFhcmd1bWVudHMubGVuZ3RoICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdidWlsZGVyIGNhbm5vdCBiZSB1bmRlZmluZWQnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn0gSW50ZXJwcmV0ZXIjYnVpbGRlclxuICAgICAqL1xuICAgIHRoaXMuYnVpbGRlciA9IGJ1aWxkZXI7XG59XG5cbmludGVycHJldGVyUHJvdG90eXBlID0gSW50ZXJwcmV0ZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuY29uc3RydWN0b3IgPSBJbnRlcnByZXRlcjtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuYXJyYXlFeHByZXNzaW9uID0gZnVuY3Rpb24oIGVsZW1lbnRzLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIEFSUkFZIEVYUFJFU1NJT04nLCBlbGVtZW50cy5sZW5ndGggKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBkZXB0aCA9IGludGVycHJldGVyLmRlcHRoLFxuICAgICAgICBsaXN0O1xuICAgIGlmKCBBcnJheS5pc0FycmF5KCBlbGVtZW50cyApICl7XG4gICAgICAgIGxpc3QgPSBtYXAoIGVsZW1lbnRzLCBmdW5jdGlvbiggZWxlbWVudCApe1xuICAgICAgICAgICAgcmV0dXJuIGludGVycHJldGVyLmxpc3RFeHByZXNzaW9uRWxlbWVudCggZWxlbWVudCwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQVJSQVkgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24gTElTVCcsIGxpc3QgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24gREVQVEgnLCBkZXB0aCApO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gcmV0dXJuVmFsdWUoIGFzc2lnbm1lbnQsIGRlcHRoICksXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbWFwKCBsaXN0LCBmdW5jdGlvbiggZXhwcmVzc2lvbiApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzaWduKCBzY29wZSwgZXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApLCB2YWx1ZSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIHJlc3VsdC5sZW5ndGggPT09IDEgJiYgKCByZXN1bHQgPSByZXN1bHRbIDAgXSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3QgPSBpbnRlcnByZXRlci5yZWN1cnNlKCBlbGVtZW50cywgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlQXJyYXlFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIEFSUkFZIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQXJyYXlFeHByZXNzaW9uIExJU1QnLCBsaXN0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24gREVQVEgnLCBkZXB0aCApO1xuICAgICAgICAgICAgdmFyIGtleXMgPSBsaXN0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICksXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXR1cm5WYWx1ZSggYXNzaWdubWVudCwgZGVwdGggKSxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIGtleXMsIGZ1bmN0aW9uKCBrZXkgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbiggc2NvcGUsIGtleSwgdmFsdWUgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQXJyYXlFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuYmxvY2tFeHByZXNzaW9uID0gZnVuY3Rpb24oIHRva2VucywgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBCTE9DSycsIHRva2Vucy5qb2luKCAnJyApICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgcHJvZ3JhbSA9IGludGVycHJldGVyLmJ1aWxkZXIuYnVpbGQoIHRva2VucyApLFxuICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggcHJvZ3JhbS5ib2R5WyAwIF0uZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVCbG9ja0V4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBCTE9DSycgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUJsb2NrRXhwcmVzc2lvbiBTQ09QRScsIHNjb3BlICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVCbG9ja0V4cHJlc3Npb24gRVhQUkVTU0lPTicsIGV4cHJlc3Npb24ubmFtZSApO1xuICAgICAgICB2YXIgcmVzdWx0ID0gZXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQmxvY2tFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IHNjb3BlLCBuYW1lOiB2b2lkIDAsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmNhbGxFeHByZXNzaW9uID0gZnVuY3Rpb24oIGNhbGxlZSwgYXJncywgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBDQUxMIEVYUFJFU1NJT04nICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgaXNTZXR0aW5nID0gYXNzaWduID09PSBzZXR0ZXIsXG4gICAgICAgIGxlZnQgPSBpbnRlcnByZXRlci5yZWN1cnNlKCBjYWxsZWUsIHRydWUsIGFzc2lnbiApLFxuICAgICAgICBsaXN0ID0gbWFwKCBhcmdzLCBmdW5jdGlvbiggYXJnICl7XG4gICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIubGlzdEV4cHJlc3Npb25FbGVtZW50KCBhcmcsIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgfSApO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVDYWxsRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIENBTEwgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNhbGxFeHByZXNzaW9uIGFyZ3MnLCBhcmdzLmxlbmd0aCApO1xuICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApLFxuICAgICAgICAgICAgYXJncyA9IG1hcCggbGlzdCwgZnVuY3Rpb24oIGFyZyApe1xuICAgICAgICAgICAgICAgIHJldHVybiBhcmcoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgICAgIH0gKSxcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNhbGxFeHByZXNzaW9uIExIUycsIGxocyApO1xuICAgICAgICByZXN1bHQgPSBsaHMudmFsdWUuYXBwbHkoIGxocy5jb250ZXh0LCBhcmdzICk7XG4gICAgICAgIGlmKCBpc1NldHRpbmcgJiYgdHlwZW9mIGxocy52YWx1ZSA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ2Nhbm5vdCBjcmVhdGUgY2FsbCBleHByZXNzaW9ucycgKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ2FsbEV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9OlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGV4cHJlc3Npb25cbiAqL1xuaW50ZXJwcmV0ZXJQcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uKCBleHByZXNzaW9uLCBjcmVhdGUgKXtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBwcm9ncmFtID0gaW50ZXJwcmV0ZXIuYnVpbGRlci5idWlsZCggZXhwcmVzc2lvbiApLFxuICAgICAgICBib2R5ID0gcHJvZ3JhbS5ib2R5LFxuXG4gICAgICAgIGFzc2lnbiwgZXhwcmVzc2lvbnM7XG5cbiAgICBpbnRlcnByZXRlci5kZXB0aCA9IC0xO1xuICAgIGludGVycHJldGVyLmlzU3BsaXQgPSBpbnRlcnByZXRlci5pc0xlZnRTcGxpdCA9IGludGVycHJldGVyLmlzUmlnaHRTcGxpdCA9IGZhbHNlO1xuXG4gICAgaWYoIHR5cGVvZiBjcmVhdGUgIT09ICdib29sZWFuJyApe1xuICAgICAgICBjcmVhdGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBhc3NpZ24gPSBjcmVhdGUgP1xuICAgICAgICBzZXR0ZXIgOlxuICAgICAgICBnZXR0ZXI7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICovXG4gICAgaW50ZXJwcmV0ZXIuZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmJ1aWxkZXIudGV4dDtcbiAgICAvL2NvbnNvbGUubG9nKCAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnSW50ZXJwcmV0aW5nJyApO1xuICAgIC8vY29uc29sZS5sb2coICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyApO1xuICAgIC8vY29uc29sZS5sb2coICdQcm9ncmFtJywgcHJvZ3JhbS5yYW5nZSApO1xuICAgIHN3aXRjaCggYm9keS5sZW5ndGggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlci5yZWN1cnNlKCBib2R5WyAwIF0uZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgZXhwcmVzc2lvbnMgPSBtYXAoIGJvZHksIGZ1bmN0aW9uKCBzdGF0ZW1lbnQgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIucmVjdXJzZSggc3RhdGVtZW50LmV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlUHJvZ3JhbSggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBtYXAoIGV4cHJlc3Npb25zLCBmdW5jdGlvbiggZXhwcmVzc2lvbiApe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZXNbIHZhbHVlcy5sZW5ndGggLSAxIF07XG4gICAgICAgICAgICB9O1xuICAgIH1cbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBvYmplY3QsIHByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIENPTVBVVEVEIE1FTUJFUiBFWFBSRVNTSU9OJywgb2JqZWN0LnR5cGUsIHByb3BlcnR5LnR5cGUgKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBkZXB0aCA9IGludGVycHJldGVyLmRlcHRoLFxuICAgICAgICBpc1NhZmUgPSBvYmplY3QudHlwZSA9PT0gS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb24sXG4gICAgICAgIGxlZnQgPSBpbnRlcnByZXRlci5yZWN1cnNlKCBvYmplY3QsIGZhbHNlLCBhc3NpZ24gKSxcbiAgICAgICAgcmlnaHQgPSBpbnRlcnByZXRlci5yZWN1cnNlKCBwcm9wZXJ0eSwgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBDT01QVVRFRCBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBMRUZUICcsIGxlZnQubmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJJR0hUJywgcmlnaHQubmFtZSApO1xuICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApLFxuICAgICAgICAgICAgdmFsdWUgPSByZXR1cm5WYWx1ZSggYXNzaWdubWVudCwgZGVwdGggKSxcbiAgICAgICAgICAgIHJlc3VsdCwgcmhzO1xuICAgICAgICBpZiggIWlzU2FmZSB8fCBsaHMgKXtcbiAgICAgICAgICAgIHJocyA9IHJpZ2h0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIERFUFRIJywgZGVwdGggKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gTEhTJywgbGhzICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJIUycsIHJocyApO1xuICAgICAgICAgICAgaWYoICFpbnRlcnByZXRlci5pc1NwbGl0ICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBsaHMsIHJocywgdmFsdWUgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggaW50ZXJwcmV0ZXIuaXNMZWZ0U3BsaXQgJiYgIWludGVycHJldGVyLmlzUmlnaHRTcGxpdCApe1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1hcCggbGhzLCBmdW5jdGlvbiggb2JqZWN0ICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIG9iamVjdCwgcmhzLCB2YWx1ZSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggIWludGVycHJldGVyLmlzTGVmdFNwbGl0ICYmIGludGVycHJldGVyLmlzUmlnaHRTcGxpdCApe1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1hcCggcmhzLCBmdW5jdGlvbigga2V5ICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIGxocywga2V5LCB2YWx1ZSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbWFwKCBsaHMsIGZ1bmN0aW9uKCBvYmplY3QgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hcCggcmhzLCBmdW5jdGlvbigga2V5ICl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzaWduKCBvYmplY3QsIGtleSwgdmFsdWUgKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxocywgbmFtZTogcmhzLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5leGlzdGVudGlhbEV4cHJlc3Npb24gPSBmdW5jdGlvbiggZXhwcmVzc2lvbiwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBFWElTVEVOVElBTCBFWFBSRVNTSU9OJywgZXhwcmVzc2lvbi50eXBlICk7XG4gICAgdmFyIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIGV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlRXhpc3RlbnRpYWxFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgRVhJU1RFTlRJQUwgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUV4aXN0ZW50aWFsRXhwcmVzc2lvbiBMRUZUJywgbGVmdC5uYW1lICk7XG4gICAgICAgIGlmKCBzY29wZSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBsZWZ0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdm9pZCAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVFeGlzdGVudGlhbEV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuaWRlbnRpZmllciA9IGZ1bmN0aW9uKCBuYW1lLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIElERU5USUZJRVInLCBuYW1lICk7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlSWRlbnRpZmllciggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIElERU5USUZJRVInICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVJZGVudGlmaWVyIE5BTUUnLCBuYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVJZGVudGlmaWVyIFZBTFVFJywgdmFsdWUgKTtcbiAgICAgICAgdmFyIHZhbHVlID0gcmV0dXJuVmFsdWUoIGFzc2lnbm1lbnQsIGRlcHRoICksXG4gICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIHNjb3BlLCBuYW1lLCB2YWx1ZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlSWRlbnRpZmllciBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBzY29wZSwgbmFtZTogbmFtZSwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUubGlzdEV4cHJlc3Npb25FbGVtZW50ID0gZnVuY3Rpb24oIGVsZW1lbnQsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXM7XG5cbiAgICBzd2l0Y2goIGVsZW1lbnQudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5MaXRlcmFsOlxuICAgICAgICAgICAgcmV0dXJuIGludGVycHJldGVyLmxpdGVyYWwoIGVsZW1lbnQudmFsdWUsIGNvbnRleHQgKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIubG9va3VwRXhwcmVzc2lvbiggZWxlbWVudC5rZXksIGZhbHNlLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIGludGVycHJldGVyLnJvb3RFeHByZXNzaW9uKCBlbGVtZW50LmtleSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5CbG9ja0V4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIuYmxvY2tFeHByZXNzaW9uKCBlbGVtZW50LmJvZHksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAnVW5leHBlY3RlZCBsaXN0IGVsZW1lbnQgdHlwZTogJyArIGVsZW1lbnQudHlwZSApO1xuICAgIH1cbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmxpdGVyYWwgPSBmdW5jdGlvbiggdmFsdWUsIGNvbnRleHQgKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIExJVEVSQUwnLCB2YWx1ZSApO1xuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlTGl0ZXJhbCgpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIExJVEVSQUwnICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVMaXRlcmFsIFJFU1VMVCcsIHZhbHVlICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogdm9pZCAwLCBuYW1lOiB2b2lkIDAsIHZhbHVlOiB2YWx1ZSB9IDpcbiAgICAgICAgICAgIHZhbHVlO1xuICAgIH07XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5sb29rdXBFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSwgcmVzb2x2ZSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBMT09LVVAgRVhQUkVTU0lPTicsIGtleSApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGlzQ29tcHV0ZWQgPSBmYWxzZSxcbiAgICAgICAgbGhzID0ge30sXG4gICAgICAgIGxlZnQ7XG5cbiAgICBzd2l0Y2goIGtleS50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LklkZW50aWZpZXI6XG4gICAgICAgICAgICBsZWZ0ID0gaW50ZXJwcmV0ZXIuaWRlbnRpZmllcigga2V5Lm5hbWUsIHRydWUsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LkxpdGVyYWw6XG4gICAgICAgICAgICBpc0NvbXB1dGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGxocy52YWx1ZSA9IGxlZnQgPSBrZXkudmFsdWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxlZnQgPSBpbnRlcnByZXRlci5yZWN1cnNlKCBrZXksIHRydWUsIGFzc2lnbiApO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlTG9va3VwRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIExPT0tVUCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlTG9va3VwRXhwcmVzc2lvbiBMRUZUJywgbGVmdC5uYW1lIHx8IGxlZnQgKTtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYoICFpc0NvbXB1dGVkICl7XG4gICAgICAgICAgICBsaHMgPSBsZWZ0KCBsb29rdXAsIGFzc2lnbm1lbnQsIHNjb3BlICk7XG4gICAgICAgICAgICByZXN1bHQgPSBsaHMudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIGxvb2t1cCwgbGhzLnZhbHVlLCB2b2lkIDAgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXNvbHZlIGxvb2t1cHMgdGhhdCBhcmUgdGhlIG9iamVjdCBvZiBhbiBvYmplY3QtcHJvcGVydHkgcmVsYXRpb25zaGlwXG4gICAgICAgIGlmKCByZXNvbHZlICl7XG4gICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIHNjb3BlLCByZXN1bHQsIHZvaWQgMCApO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVMb29rdXBFeHByZXNzaW9uIExIUycsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlTG9va3VwRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogbG9va3VwLCBuYW1lOiBsaHMudmFsdWUsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLnJhbmdlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBsb3dlckJvdW5kLCB1cHBlckJvdW5kLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFJBTkdFIEVYUFJFU1NJT04nICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgbGVmdCA9IGxvd2VyQm91bmQgIT09IG51bGwgP1xuICAgICAgICAgICAgaW50ZXJwcmV0ZXIucmVjdXJzZSggbG93ZXJCb3VuZCwgZmFsc2UsIGFzc2lnbiApIDpcbiAgICAgICAgICAgIHJldHVyblplcm8sXG4gICAgICAgIHJpZ2h0ID0gdXBwZXJCb3VuZCAhPT0gbnVsbCA/XG4gICAgICAgICAgICBpbnRlcnByZXRlci5yZWN1cnNlKCB1cHBlckJvdW5kLCBmYWxzZSwgYXNzaWduICkgOlxuICAgICAgICAgICAgcmV0dXJuWmVybyxcbiAgICAgICAgaW5kZXgsIGxocywgbWlkZGxlLCByZXN1bHQsIHJocztcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlUmFuZ2VFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgUkFOR0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiBMRUZUJywgbGVmdC5uYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVSYW5nZUV4cHJlc3Npb24gUklHSFQnLCByaWdodC5uYW1lICk7XG4gICAgICAgIGxocyA9IGxlZnQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgcmhzID0gcmlnaHQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgIGluZGV4ID0gMTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiBMSFMnLCBsaHMgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiBSSFMnLCByaHMgKTtcbiAgICAgICAgcmVzdWx0WyAwIF0gPSBsaHM7XG4gICAgICAgIGlmKCBsaHMgPCByaHMgKXtcbiAgICAgICAgICAgIG1pZGRsZSA9IGxocyArIDE7XG4gICAgICAgICAgICB3aGlsZSggbWlkZGxlIDwgcmhzICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCsrIF0gPSBtaWRkbGUrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmKCBsaHMgPiByaHMgKXtcbiAgICAgICAgICAgIG1pZGRsZSA9IGxocyAtIDE7XG4gICAgICAgICAgICB3aGlsZSggbWlkZGxlID4gcmhzICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCsrIF0gPSBtaWRkbGUtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbIHJlc3VsdC5sZW5ndGggXSA9IHJocztcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5pbnRlcnByZXRlclByb3RvdHlwZS5yZWN1cnNlID0gZnVuY3Rpb24oIG5vZGUsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdSZWN1cnNpbmcnLCBub2RlLnR5cGUgKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBleHByZXNzaW9uID0gbnVsbDtcblxuICAgIGludGVycHJldGVyLmRlcHRoKys7XG5cbiAgICBzd2l0Y2goIG5vZGUudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5BcnJheUV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuYXJyYXlFeHByZXNzaW9uKCBub2RlLmVsZW1lbnRzLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGludGVycHJldGVyLmlzU3BsaXQgPSBpbnRlcnByZXRlci5pc0xlZnRTcGxpdCA9IG5vZGUuZWxlbWVudHMubGVuZ3RoID4gMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5DYWxsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5jYWxsRXhwcmVzc2lvbiggbm9kZS5jYWxsZWUsIG5vZGUuYXJndW1lbnRzLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguQmxvY2tFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmJsb2NrRXhwcmVzc2lvbiggbm9kZS5ib2R5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmV4aXN0ZW50aWFsRXhwcmVzc2lvbiggbm9kZS5leHByZXNzaW9uLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5JZGVudGlmaWVyOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmlkZW50aWZpZXIoIG5vZGUubmFtZSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5saXRlcmFsKCBub2RlLnZhbHVlLCBjb250ZXh0ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguTWVtYmVyRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBub2RlLmNvbXB1dGVkID9cbiAgICAgICAgICAgICAgICBpbnRlcnByZXRlci5jb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIG5vZGUub2JqZWN0LCBub2RlLnByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKSA6XG4gICAgICAgICAgICAgICAgaW50ZXJwcmV0ZXIuc3RhdGljTWVtYmVyRXhwcmVzc2lvbiggbm9kZS5vYmplY3QsIG5vZGUucHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmxvb2t1cEV4cHJlc3Npb24oIG5vZGUua2V5LCBmYWxzZSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5yYW5nZUV4cHJlc3Npb24oIG5vZGUubGVmdCwgbm9kZS5yaWdodCwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLnJvb3RFeHByZXNzaW9uKCBub2RlLmtleSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguU2VxdWVuY2VFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLnNlcXVlbmNlRXhwcmVzc2lvbiggbm9kZS5leHByZXNzaW9ucywgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBpbnRlcnByZXRlci5pc1NwbGl0ID0gaW50ZXJwcmV0ZXIuaXNSaWdodFNwbGl0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAnVW5rbm93biBub2RlIHR5cGU6ICcgKyBub2RlLnR5cGUgKTtcbiAgICB9XG5cbiAgICBpbnRlcnByZXRlci5kZXB0aC0tO1xuXG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5yb290RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXksIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgUk9PVCBFWFBSRVNTSU9OJyApO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBrZXksIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlUm9vdEV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBST09UIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVSb290RXhwcmVzc2lvbiBMRUZUJywgbGVmdC5uYW1lIHx8IGxlZnQgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJvb3RFeHByZXNzaW9uIFNDT1BFJywgc2NvcGUgKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGxlZnQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJvb3RFeHByZXNzaW9uIExIUycsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlUm9vdEV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxvb2t1cCwgbmFtZTogcmVzdWx0LnZhbHVlLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5zZXF1ZW5jZUV4cHJlc3Npb24gPSBmdW5jdGlvbiggZXhwcmVzc2lvbnMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgU0VRVUVOQ0UgRVhQUkVTU0lPTicsIGV4cHJlc3Npb25zLmxlbmd0aCApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGRlcHRoID0gaW50ZXJwcmV0ZXIuZGVwdGgsXG4gICAgICAgIGxpc3Q7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIGV4cHJlc3Npb25zICkgKXtcbiAgICAgICAgbGlzdCA9IG1hcCggZXhwcmVzc2lvbnMsIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIubGlzdEV4cHJlc3Npb25FbGVtZW50KCBleHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTRVFVRU5DRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiBMSVNUJywgbGlzdCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiBERVBUSCcsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSByZXR1cm5WYWx1ZSggYXNzaWdubWVudCwgZGVwdGggKSxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIGxpc3QsIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBleHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0ID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggZXhwcmVzc2lvbnMsIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTRVFVRU5DRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiBMSVNUJywgbGlzdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uIERFUFRIJywgZGVwdGggKTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGxpc3QoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuc3RhdGljTWVtYmVyRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBvYmplY3QsIHByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFNUQVRJQyBNRU1CRVIgRVhQUkVTU0lPTicsIG9iamVjdC50eXBlLCBwcm9wZXJ0eS50eXBlICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgZGVwdGggPSBpbnRlcnByZXRlci5kZXB0aCxcbiAgICAgICAgaXNDb21wdXRlZCA9IGZhbHNlLFxuICAgICAgICBpc1NhZmUgPSBmYWxzZSxcbiAgICAgICAgbGVmdCwgcmhzLCByaWdodDtcblxuICAgIHN3aXRjaCggb2JqZWN0LnR5cGUgKXtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICBsZWZ0ID0gaW50ZXJwcmV0ZXIubG9va3VwRXhwcmVzc2lvbiggb2JqZWN0LmtleSwgdHJ1ZSwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb246XG4gICAgICAgICAgICBpc1NhZmUgPSB0cnVlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGVmdCA9IGludGVycHJldGVyLnJlY3Vyc2UoIG9iamVjdCwgZmFsc2UsIGFzc2lnbiApO1xuICAgIH1cblxuICAgIHN3aXRjaCggcHJvcGVydHkudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5JZGVudGlmaWVyOlxuICAgICAgICAgICAgaXNDb21wdXRlZCA9IHRydWU7XG4gICAgICAgICAgICByaHMgPSByaWdodCA9IHByb3BlcnR5Lm5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJpZ2h0ID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggcHJvcGVydHksIGZhbHNlLCBhc3NpZ24gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTVEFUSUMgTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIExFRlQnLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gUklHSFQnLCByaHMgfHwgcmlnaHQubmFtZSApO1xuICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApLFxuICAgICAgICAgICAgdmFsdWUgPSByZXR1cm5WYWx1ZSggYXNzaWdubWVudCwgZGVwdGggKSxcbiAgICAgICAgICAgIHJlc3VsdDtcblxuICAgICAgICBpZiggIWlzU2FmZSB8fCBsaHMgKXtcbiAgICAgICAgICAgIGlmKCAhaXNDb21wdXRlZCApe1xuICAgICAgICAgICAgICAgIHJocyA9IHJpZ2h0KCBwcm9wZXJ0eS50eXBlID09PSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uID8gc2NvcGUgOiBsaHMsIGFzc2lnbm1lbnQsIGxvb2t1cCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gTEhTJywgbGhzICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiBSSFMnLCByaHMgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIERFUFRIJywgZGVwdGggKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGludGVycHJldGVyLmlzU3BsaXQgP1xuICAgICAgICAgICAgICAgIG1hcCggbGhzLCBmdW5jdGlvbiggb2JqZWN0ICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIG9iamVjdCwgcmhzLCB2YWx1ZSApO1xuICAgICAgICAgICAgICAgIH0gKSA6XG4gICAgICAgICAgICAgICAgYXNzaWduKCBsaHMsIHJocywgdmFsdWUgKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTsiLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0IExleGVyIGZyb20gJy4vbGV4ZXInO1xuaW1wb3J0IEJ1aWxkZXIgZnJvbSAnLi9idWlsZGVyJztcbmltcG9ydCBJbnRlcnByZXRlciBmcm9tICcuL2ludGVycHJldGVyJztcbmltcG9ydCBoYXNPd25Qcm9wZXJ0eSBmcm9tICcuL2hhcy1vd24tcHJvcGVydHknO1xuXG52YXIgbGV4ZXIgPSBuZXcgTGV4ZXIoKSxcbiAgICBidWlsZGVyID0gbmV3IEJ1aWxkZXIoIGxleGVyICksXG4gICAgaW50cmVwcmV0ZXIgPSBuZXcgSW50ZXJwcmV0ZXIoIGJ1aWxkZXIgKSxcblxuICAgIGNhY2hlID0gbmV3IE51bGwoKSxcblxuICAgIGV4cFByb3RvdHlwZTtcblxuLyoqXG4gKiBAY2xhc3MgS2V5cGF0aEV4cFxuICogQGV4dGVuZHMgVHJhbnNkdWNlclxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHBhdHRlcm5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBmbGFnc1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBLZXlwYXRoRXhwKCBwYXR0ZXJuLCBmbGFncyApe1xuICAgIHR5cGVvZiBwYXR0ZXJuICE9PSAnc3RyaW5nJyAmJiAoIHBhdHRlcm4gPSAnJyApO1xuICAgIHR5cGVvZiBmbGFncyAhPT0gJ3N0cmluZycgJiYgKCBmbGFncyA9ICcnICk7XG5cbiAgICB2YXIgdG9rZW5zID0gaGFzT3duUHJvcGVydHkoIGNhY2hlLCBwYXR0ZXJuICkgP1xuICAgICAgICAgICAgY2FjaGVbIHBhdHRlcm4gXSA6XG4gICAgICAgICAgICBjYWNoZVsgcGF0dGVybiBdID0gbGV4ZXIubGV4KCBwYXR0ZXJuICk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyggdGhpcywge1xuICAgICAgICAnZmxhZ3MnOiB7XG4gICAgICAgICAgICB2YWx1ZTogZmxhZ3MsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAnc291cmNlJzoge1xuICAgICAgICAgICAgdmFsdWU6IHBhdHRlcm4sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAnZ2V0dGVyJzoge1xuICAgICAgICAgICAgdmFsdWU6IGludHJlcHJldGVyLmNvbXBpbGUoIHRva2VucywgZmFsc2UgKSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAnc2V0dGVyJzoge1xuICAgICAgICAgICAgdmFsdWU6IGludHJlcHJldGVyLmNvbXBpbGUoIHRva2VucywgdHJ1ZSApLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgIH1cbiAgICB9ICk7XG59XG5cbmV4cFByb3RvdHlwZSA9IEtleXBhdGhFeHAucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuZXhwUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gS2V5cGF0aEV4cDtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwUHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCB0YXJnZXQsIGxvb2t1cCApe1xuICAgIHJldHVybiB0aGlzLmdldHRlciggdGFyZ2V0LCB1bmRlZmluZWQsIGxvb2t1cCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwUHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKCB0YXJnZXQsIGxvb2t1cCApe1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmdldHRlciggdGFyZ2V0LCB1bmRlZmluZWQsIGxvb2t1cCApO1xuICAgIHJldHVybiB0eXBlb2YgcmVzdWx0ICE9PSAndW5kZWZpbmVkJztcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cFByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiggdGFyZ2V0LCB2YWx1ZSwgbG9va3VwICl7XG4gICAgcmV0dXJuIHRoaXMuc2V0dGVyKCB0YXJnZXQsIHZhbHVlLCBsb29rdXAgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cFByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24uZmxhZ3MgPSB0aGlzLmZsYWdzO1xuICAgIGpzb24uc291cmNlID0gdGhpcy5zb3VyY2U7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cFByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlO1xufTsiLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0IEtleXBhdGhFeHAgZnJvbSAnLi9leHAnO1xuXG52YXIgcHJvdG9jb2wgPSBuZXcgTnVsbCgpO1xuXG5wcm90b2NvbC5pbml0ICAgID0gJ0BAdHJhbnNkdWNlci9pbml0JztcbnByb3RvY29sLnN0ZXAgICAgPSAnQEB0cmFuc2R1Y2VyL3N0ZXAnO1xucHJvdG9jb2wucmVkdWNlZCA9ICdAQHRyYW5zZHVjZXIvcmVkdWNlZCc7XG5wcm90b2NvbC5yZXN1bHQgID0gJ0BAdHJhbnNkdWNlci9yZXN1bHQnO1xucHJvdG9jb2wudmFsdWUgICA9ICdAQHRyYW5zZHVjZXIvdmFsdWUnO1xuXG4vKipcbiAqIEEgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgVHJhbnNmb21lciBwcm90b2NvbCB1c2VkIGJ5IFRyYW5zZHVjZXJzXG4gKiBAY2xhc3MgVHJhbnNmb3JtZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6RnVuY3Rpb259IHhmIEEgdHJhbnNmb3JtZXJcbiAqL1xuZnVuY3Rpb24gVHJhbnNmb3JtZXIoIHhmICl7XG4gICAgdGhpcy54ZiA9IHhmO1xufVxuXG5UcmFuc2Zvcm1lci5wcm90b3R5cGUgPSBUcmFuc2Zvcm1lci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5UcmFuc2Zvcm1lci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUcmFuc2Zvcm1lcjtcblxuLyoqXG4gKiBAZnVuY3Rpb24gVHJhbnNmb3JtZXIjQEB0cmFuc2R1Y2VyL2luaXRcbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlWyBwcm90b2NvbC5pbml0IF0gPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnhmSW5pdCgpO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gVHJhbnNmb3JtZXIjQEB0cmFuc2R1Y2VyL3N0ZXBcbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlWyBwcm90b2NvbC5zdGVwIF0gPSBmdW5jdGlvbiggdmFsdWUsIGlucHV0ICl7XG4gICAgcmV0dXJuIHRoaXMueGZTdGVwKCB2YWx1ZSwgaW5wdXQgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIFRyYW5zZm9ybWVyI0BAdHJhbnNkdWNlci9yZXN1bHRcbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlWyBwcm90b2NvbC5yZXN1bHQgXSA9IGZ1bmN0aW9uKCB2YWx1ZSApe1xuICAgIHJldHVybiB0aGlzLnhmUmVzdWx0KCB2YWx1ZSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlLnhmSW5pdCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMueGZbIHByb3RvY29sLmluaXQgXSgpO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlLnhmU3RlcCA9IGZ1bmN0aW9uKCB2YWx1ZSwgaW5wdXQgKXtcbiAgICByZXR1cm4gdGhpcy54ZlsgcHJvdG9jb2wuc3RlcCBdKCB2YWx1ZSwgaW5wdXQgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cblRyYW5zZm9ybWVyLnByb3RvdHlwZS54ZlJlc3VsdCA9IGZ1bmN0aW9uKCB2YWx1ZSApe1xuICAgIHJldHVybiB0aGlzLnhmWyBwcm90b2NvbC5yZXN1bHQgXSggdmFsdWUgKTtcbn07XG5cbi8qKlxuICogQGNsYXNzIEtleXBhdGhUcmFuc2Zvcm1lclxuICogQGV4dGVuZHMgVHJhbnNmb3JtZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBwIEEga2V5cGF0aCBwYXR0ZXJuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkZ1bmN0aW9ufSB4ZiBBIHRyYW5zZm9ybWVyXG4gKi9cbmZ1bmN0aW9uIEtleXBhdGhUcmFuc2Zvcm1lciggcCwgeGYgKXtcbiAgICBUcmFuc2Zvcm1lci5jYWxsKCB0aGlzLCB4ZiApO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0tleXBhdGhFeHB9XG4gICAgICovXG4gICAgdGhpcy5rcGV4ID0gbmV3IEtleXBhdGhFeHAoIHAgKTtcbn1cblxuS2V5cGF0aFRyYW5zZm9ybWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRyYW5zZm9ybWVyLnByb3RvdHlwZSApO1xuXG5LZXlwYXRoVHJhbnNmb3JtZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gS2V5cGF0aFRyYW5zZm9ybWVyO1xuXG5LZXlwYXRoVHJhbnNmb3JtZXIucHJvdG90eXBlWyBwcm90b2NvbC5zdGVwIF0gPSBmdW5jdGlvbiggdmFsdWUsIGlucHV0ICl7XG4gICAgcmV0dXJuIHRoaXMueGZTdGVwKCB2YWx1ZSwgdGhpcy5rcGV4LmdldCggaW5wdXQgKSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBwIEEga2V5cGF0aCBwYXR0ZXJuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6RnVuY3Rpb259XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGtleXBhdGgoIHAgKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oIHhmICl7XG4gICAgICAgIHJldHVybiBuZXcgS2V5cGF0aFRyYW5zZm9ybWVyKCBwLCB4ZiApO1xuICAgIH07XG59Il0sIm5hbWVzIjpbIkVuZE9mTGluZSIsIklkZW50aWZpZXIiLCJOdW1lcmljTGl0ZXJhbCIsIk51bGxMaXRlcmFsIiwiUHVuY3R1YXRvciIsIlN0cmluZ0xpdGVyYWwiLCJHcmFtbWFyLkVuZE9mTGluZSIsIkdyYW1tYXIuSWRlbnRpZmllciIsIkdyYW1tYXIuTnVtZXJpY0xpdGVyYWwiLCJHcmFtbWFyLk51bGxMaXRlcmFsIiwiR3JhbW1hci5QdW5jdHVhdG9yIiwiR3JhbW1hci5TdHJpbmdMaXRlcmFsIiwiQ2hhcmFjdGVyLmlzSWRlbnRpZmllclBhcnQiLCJDaGFyYWN0ZXIuaXNOdW1lcmljIiwiVG9rZW4uRW5kT2ZMaW5lIiwiQ2hhcmFjdGVyLmlzSWRlbnRpZmllclN0YXJ0IiwiVG9rZW4uTnVsbExpdGVyYWwiLCJUb2tlbi5JZGVudGlmaWVyIiwiQ2hhcmFjdGVyLmlzUHVuY3R1YXRvciIsIlRva2VuLlB1bmN0dWF0b3IiLCJDaGFyYWN0ZXIuaXNRdW90ZSIsIkNoYXJhY3Rlci5pc0RvdWJsZVF1b3RlIiwiQ2hhcmFjdGVyLmlzU2luZ2xlUXVvdGUiLCJUb2tlbi5TdHJpbmdMaXRlcmFsIiwiVG9rZW4uTnVtZXJpY0xpdGVyYWwiLCJDaGFyYWN0ZXIuaXNXaGl0ZXNwYWNlIiwiQXJyYXlFeHByZXNzaW9uIiwiQ2FsbEV4cHJlc3Npb24iLCJFeHByZXNzaW9uU3RhdGVtZW50IiwiTGl0ZXJhbCIsIk1lbWJlckV4cHJlc3Npb24iLCJQcm9ncmFtIiwiU2VxdWVuY2VFeHByZXNzaW9uIiwiU3ludGF4LkxpdGVyYWwiLCJTeW50YXguTWVtYmVyRXhwcmVzc2lvbiIsIlN5bnRheC5Qcm9ncmFtIiwiU3ludGF4LkFycmF5RXhwcmVzc2lvbiIsIlN5bnRheC5DYWxsRXhwcmVzc2lvbiIsIlN5bnRheC5FeHByZXNzaW9uU3RhdGVtZW50IiwiU3ludGF4LklkZW50aWZpZXIiLCJTeW50YXguU2VxdWVuY2VFeHByZXNzaW9uIiwiQmxvY2tFeHByZXNzaW9uIiwiRXhpc3RlbnRpYWxFeHByZXNzaW9uIiwiTG9va3VwRXhwcmVzc2lvbiIsIlJhbmdlRXhwcmVzc2lvbiIsIlJvb3RFeHByZXNzaW9uIiwiU2NvcGVFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb24iLCJOb2RlLkFycmF5RXhwcmVzc2lvbiIsIktleXBhdGhOb2RlLkJsb2NrRXhwcmVzc2lvbiIsIk5vZGUuQ2FsbEV4cHJlc3Npb24iLCJLZXlwYXRoTm9kZS5FeGlzdGVudGlhbEV4cHJlc3Npb24iLCJOb2RlLkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJOb2RlLklkZW50aWZpZXIiLCJOb2RlLk51bWVyaWNMaXRlcmFsIiwiTm9kZS5TdHJpbmdMaXRlcmFsIiwiTm9kZS5OdWxsTGl0ZXJhbCIsIktleXBhdGhOb2RlLkxvb2t1cEV4cHJlc3Npb24iLCJOb2RlLkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiIsIk5vZGUuU3RhdGljTWVtYmVyRXhwcmVzc2lvbiIsIk5vZGUuUHJvZ3JhbSIsIktleXBhdGhOb2RlLlJhbmdlRXhwcmVzc2lvbiIsIktleXBhdGhOb2RlLlJvb3RFeHByZXNzaW9uIiwiTm9kZS5TZXF1ZW5jZUV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LkJsb2NrRXhwcmVzc2lvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7O0FBS0EsQUFBZSxTQUFTLElBQUksRUFBRSxFQUFFO0FBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsSUFBSSxJQUFJOztBQ1BsQzs7Ozs7Ozs7Ozs7QUFXQSxBQUFlLFNBQVMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7SUFDekMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU07UUFDcEIsS0FBSyxFQUFFLE1BQU0sQ0FBQzs7SUFFbEIsUUFBUSxNQUFNO1FBQ1YsS0FBSyxDQUFDO1lBQ0YsT0FB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
