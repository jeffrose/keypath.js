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

return KeypathExp;

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwLmpzIiwic291cmNlcyI6WyJudWxsLmpzIiwibWFwLmpzIiwiY2hhcmFjdGVyLmpzIiwiZ3JhbW1hci5qcyIsInRva2VuLmpzIiwic2Nhbm5lci5qcyIsInRvLWpzb24uanMiLCJ0by1zdHJpbmcuanMiLCJsZXhlci5qcyIsInN5bnRheC5qcyIsIm5vZGUuanMiLCJrZXlwYXRoLXN5bnRheC5qcyIsImhhcy1vd24tcHJvcGVydHkuanMiLCJrZXlwYXRoLW5vZGUuanMiLCJidWlsZGVyLmpzIiwiaW50ZXJwcmV0ZXIuanMiLCJleHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBIFwiY2xlYW5cIiwgZW1wdHkgY29udGFpbmVyLiBJbnN0YW50aWF0aW5nIHRoaXMgaXMgZmFzdGVyIHRoYW4gZXhwbGljaXRseSBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKCBudWxsIClgLlxuICogQGNsYXNzIE51bGxcbiAqIEBleHRlbmRzIGV4dGVybmFsOm51bGxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTnVsbCgpe31cbk51bGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuTnVsbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgTnVsbDsiLCIvKipcbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpGdW5jdGlvbn0gTWFwQ2FsbGJhY2tcbiAqIEBwYXJhbSB7Kn0gaXRlbVxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4XG4gKi9cblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXktTGlrZX0gbGlzdFxuICogQHBhcmFtIHtNYXBDYWxsYmFja30gY2FsbGJhY2tcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWFwKCBsaXN0LCBjYWxsYmFjayApe1xuICAgIHZhciBsZW5ndGggPSBsaXN0Lmxlbmd0aCxcbiAgICAgICAgaW5kZXgsIHJlc3VsdDtcblxuICAgIHN3aXRjaCggbGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJldHVybiBbIGNhbGxiYWNrKCBsaXN0WyAwIF0sIDAsIGxpc3QgKSBdO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gWyBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICksIGNhbGxiYWNrKCBsaXN0WyAxIF0sIDEsIGxpc3QgKSBdO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gWyBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICksIGNhbGxiYWNrKCBsaXN0WyAxIF0sIDEsIGxpc3QgKSwgY2FsbGJhY2soIGxpc3RbIDIgXSwgMiwgbGlzdCApIF07XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGxlbmd0aCApO1xuICAgICAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gY2FsbGJhY2soIGxpc3RbIGluZGV4IF0sIGluZGV4LCBsaXN0ICk7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn0iLCJleHBvcnQgZnVuY3Rpb24gaXNEb3VibGVRdW90ZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSAnXCInO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJZGVudGlmaWVyUGFydCggY2hhciApe1xuICAgIHJldHVybiBpc0lkZW50aWZpZXJTdGFydCggY2hhciApIHx8IGlzTnVtZXJpYyggY2hhciApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJZGVudGlmaWVyU3RhcnQoIGNoYXIgKXtcbiAgICByZXR1cm4gJ2EnIDw9IGNoYXIgJiYgY2hhciA8PSAneicgfHwgJ0EnIDw9IGNoYXIgJiYgY2hhciA8PSAnWicgfHwgJ18nID09PSBjaGFyIHx8IGNoYXIgPT09ICckJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtZXJpYyggY2hhciApe1xuICAgIHJldHVybiAnMCcgPD0gY2hhciAmJiBjaGFyIDw9ICc5Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHVuY3R1YXRvciggY2hhciApe1xuICAgIHJldHVybiAnLiw/KClbXXt9JX47Jy5pbmRleE9mKCBjaGFyICkgIT09IC0xO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNRdW90ZSggY2hhciApe1xuICAgIHJldHVybiBpc0RvdWJsZVF1b3RlKCBjaGFyICkgfHwgaXNTaW5nbGVRdW90ZSggY2hhciApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTaW5nbGVRdW90ZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSBcIidcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzV2hpdGVzcGFjZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSAnICcgfHwgY2hhciA9PT0gJ1xccicgfHwgY2hhciA9PT0gJ1xcdCcgfHwgY2hhciA9PT0gJ1xcbicgfHwgY2hhciA9PT0gJ1xcdicgfHwgY2hhciA9PT0gJ1xcdTAwQTAnO1xufSIsImV4cG9ydCB2YXIgRW5kT2ZMaW5lICAgICAgID0gJ0VuZE9mTGluZSc7XG5leHBvcnQgdmFyIElkZW50aWZpZXIgICAgICA9ICdJZGVudGlmaWVyJztcbmV4cG9ydCB2YXIgTnVtZXJpY0xpdGVyYWwgID0gJ051bWVyaWMnO1xuZXhwb3J0IHZhciBOdWxsTGl0ZXJhbCAgICAgPSAnTnVsbCc7XG5leHBvcnQgdmFyIFB1bmN0dWF0b3IgICAgICA9ICdQdW5jdHVhdG9yJztcbmV4cG9ydCB2YXIgU3RyaW5nTGl0ZXJhbCAgID0gJ1N0cmluZyc7IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIEdyYW1tYXIgZnJvbSAnLi9ncmFtbWFyJztcblxudmFyIHRva2VuSWQgPSAwO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5Ub2tlblxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgdGhlIHRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSB0b2tlblxuICovXG5mdW5jdGlvbiBUb2tlbiggdHlwZSwgdmFsdWUgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IExleGVyflRva2VuI2lkXG4gICAgICovXG4gICAgdGhpcy5pZCA9ICsrdG9rZW5JZDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IExleGVyflRva2VuI3R5cGVcbiAgICAgKi9cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gTGV4ZXJ+VG9rZW4jdmFsdWVcbiAgICAgKi9cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cblRva2VuLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cblRva2VuLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRva2VuO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlblxuICovXG5Ub2tlbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnR5cGUgPSB0aGlzLnR5cGU7XG4gICAganNvbi52YWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xuVG9rZW4ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gU3RyaW5nKCB0aGlzLnZhbHVlICk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gRW5kT2ZMaW5lKCl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5FbmRPZkxpbmUsICcnICk7XG59XG5cbkVuZE9mTGluZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuRW5kT2ZMaW5lLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVuZE9mTGluZTtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+SWRlbnRpZmllclxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gSWRlbnRpZmllciggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLklkZW50aWZpZXIsIHZhbHVlICk7XG59XG5cbklkZW50aWZpZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbklkZW50aWZpZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSWRlbnRpZmllcjtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+TnVtZXJpY0xpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE51bWVyaWNMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWwsIHZhbHVlICk7XG59XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdW1lcmljTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+TnVsbExpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE51bGxMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuTnVsbExpdGVyYWwsIHZhbHVlICk7XG59XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdWxsTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+UHVuY3R1YXRvclxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gUHVuY3R1YXRvciggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLlB1bmN0dWF0b3IsIHZhbHVlICk7XG59XG5cblB1bmN0dWF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cblB1bmN0dWF0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUHVuY3R1YXRvcjtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJ+U3RyaW5nTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RyaW5nTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLlN0cmluZ0xpdGVyYWwsIHZhbHVlICk7XG59XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RyaW5nTGl0ZXJhbDsiLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgQ2hhcmFjdGVyIGZyb20gJy4vY2hhcmFjdGVyJztcbmltcG9ydCAqIGFzIFRva2VuIGZyb20gJy4vdG9rZW4nO1xuXG52YXIgc2Nhbm5lclByb3RvdHlwZTtcblxuZnVuY3Rpb24gaXNOb3RJZGVudGlmaWVyKCBjaGFyICl7XG4gICAgcmV0dXJuICFDaGFyYWN0ZXIuaXNJZGVudGlmaWVyUGFydCggY2hhciApO1xufVxuXG5mdW5jdGlvbiBpc05vdE51bWVyaWMoIGNoYXIgKXtcbiAgICByZXR1cm4gIUNoYXJhY3Rlci5pc051bWVyaWMoIGNoYXIgKTtcbn1cblxuLyoqXG4gKiBAY2xhc3MgU2Nhbm5lclxuICogQGV4dGVuZHMgTnVsbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTY2FubmVyKCB0ZXh0ICl7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqIEBkZWZhdWx0ICcnXG4gICAgICovXG4gICAgdGhpcy5zb3VyY2UgPSB0ZXh0IHx8ICcnO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sZW5ndGggPSB0ZXh0Lmxlbmd0aDtcbn1cblxuc2Nhbm5lclByb3RvdHlwZSA9IFNjYW5uZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuc2Nhbm5lclByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNjYW5uZXI7XG5cbnNjYW5uZXJQcm90b3R5cGUuZW9sID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5pbmRleCA+PSB0aGlzLmxlbmd0aDtcbn07XG5cbnNjYW5uZXJQcm90b3R5cGUubGV4ID0gZnVuY3Rpb24oKXtcbiAgICBpZiggdGhpcy5lb2woKSApe1xuICAgICAgICByZXR1cm4gbmV3IFRva2VuLkVuZE9mTGluZSgpO1xuICAgIH1cblxuICAgIHZhciBjaGFyID0gdGhpcy5zb3VyY2VbIHRoaXMuaW5kZXggXSxcbiAgICAgICAgd29yZDtcblxuICAgIC8vIElkZW50aWZpZXJcbiAgICBpZiggQ2hhcmFjdGVyLmlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICkgKXtcbiAgICAgICAgd29yZCA9IHRoaXMuc2NhbiggaXNOb3RJZGVudGlmaWVyICk7XG5cbiAgICAgICAgcmV0dXJuIHdvcmQgPT09ICdudWxsJyA/XG4gICAgICAgICAgICBuZXcgVG9rZW4uTnVsbExpdGVyYWwoIHdvcmQgKSA6XG4gICAgICAgICAgICBuZXcgVG9rZW4uSWRlbnRpZmllciggd29yZCApO1xuXG4gICAgLy8gUHVuY3R1YXRvclxuICAgIH0gZWxzZSBpZiggQ2hhcmFjdGVyLmlzUHVuY3R1YXRvciggY2hhciApICl7XG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgcmV0dXJuIG5ldyBUb2tlbi5QdW5jdHVhdG9yKCBjaGFyICk7XG5cbiAgICAvLyBRdW90ZWQgU3RyaW5nXG4gICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNRdW90ZSggY2hhciApICl7XG4gICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICB3b3JkID0gQ2hhcmFjdGVyLmlzRG91YmxlUXVvdGUoIGNoYXIgKSA/XG4gICAgICAgICAgICB0aGlzLnNjYW4oIENoYXJhY3Rlci5pc0RvdWJsZVF1b3RlICkgOlxuICAgICAgICAgICAgdGhpcy5zY2FuKCBDaGFyYWN0ZXIuaXNTaW5nbGVRdW90ZSApO1xuXG4gICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICByZXR1cm4gbmV3IFRva2VuLlN0cmluZ0xpdGVyYWwoIGNoYXIgKyB3b3JkICsgY2hhciApO1xuXG4gICAgLy8gTnVtZXJpY1xuICAgIH0gZWxzZSBpZiggQ2hhcmFjdGVyLmlzTnVtZXJpYyggY2hhciApICl7XG4gICAgICAgIHdvcmQgPSB0aGlzLnNjYW4oIGlzTm90TnVtZXJpYyApO1xuXG4gICAgICAgIHJldHVybiBuZXcgVG9rZW4uTnVtZXJpY0xpdGVyYWwoIHdvcmQgKTtcblxuICAgIC8vIFdoaXRlc3BhY2VcbiAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc1doaXRlc3BhY2UoIGNoYXIgKSApe1xuICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAvLyBFcnJvclxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggJ1wiJyArIGNoYXIgKyAnXCIgaXMgYW4gaW52YWxpZCBjaGFyYWN0ZXInICk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6ZnVuY3Rpb259IHVudGlsIEEgY29uZGl0aW9uIHRoYXQgd2hlbiBtZXQgd2lsbCBzdG9wIHRoZSBzY2FubmluZyBvZiB0aGUgc291cmNlXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBUaGUgcG9ydGlvbiBvZiB0aGUgc291cmNlIHNjYW5uZWRcbiAqL1xuc2Nhbm5lclByb3RvdHlwZS5zY2FuID0gZnVuY3Rpb24oIHVudGlsICl7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleCxcbiAgICAgICAgY2hhcjtcblxuICAgIHdoaWxlKCAhdGhpcy5lb2woKSApe1xuICAgICAgICBjaGFyID0gdGhpcy5zb3VyY2VbIHRoaXMuaW5kZXggXTtcblxuICAgICAgICBpZiggdW50aWwoIGNoYXIgKSApe1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc291cmNlLnNsaWNlKCBzdGFydCwgdGhpcy5pbmRleCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgc2Nhbm5lclxuICovXG5zY2FubmVyUHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi5zb3VyY2UgPSB0aGlzLnNvdXJjZTtcbiAgICBqc29uLmluZGV4ICA9IHRoaXMuaW5kZXg7XG4gICAganNvbi5sZW5ndGggPSB0aGlzLmxlbmd0aDtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzY2FubmVyXG4gKi9cbnNjYW5uZXJQcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbn07IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdG9KU09OKCB2YWx1ZSApe1xuICAgIHJldHVybiB2YWx1ZS50b0pTT04oKTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0b1N0cmluZyggdmFsdWUgKXtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbn0iLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0IG1hcCBmcm9tICcuL21hcCc7XG5pbXBvcnQgU2Nhbm5lciBmcm9tICcuL3NjYW5uZXInO1xuaW1wb3J0IHRvSlNPTiBmcm9tICcuL3RvLWpzb24nO1xuaW1wb3J0IHRvU3RyaW5nIGZyb20gJy4vdG8tc3RyaW5nJztcblxudmFyIGxleGVyUHJvdG90eXBlO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlclxuICogQGV4dGVuZHMgTnVsbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMZXhlcigpe1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PExleGVyflRva2VuPn1cbiAgICAgKi9cbiAgICB0aGlzLnRva2VucyA9IFtdO1xufVxuXG5sZXhlclByb3RvdHlwZSA9IExleGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbmxleGVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGV4ZXI7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdGV4dFxuICovXG5sZXhlclByb3RvdHlwZS5sZXggPSBmdW5jdGlvbiggdGV4dCApe1xuICAgIHZhciBzY2FubmVyID0gbmV3IFNjYW5uZXIoIHRleHQgKSxcbiAgICAgICAgdG9rZW47XG5cbiAgICB0aGlzLnRva2VucyA9IFtdO1xuXG4gICAgd2hpbGUoICFzY2FubmVyLmVvbCgpICl7XG4gICAgICAgIHRva2VuID0gc2Nhbm5lci5sZXgoKTtcbiAgICAgICAgaWYoIHRva2VuICl7XG4gICAgICAgICAgICB0aGlzLnRva2Vuc1sgdGhpcy50b2tlbnMubGVuZ3RoIF0gPSB0b2tlbjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRva2Vucztcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGxleGVyXG4gKi9cbmxleGVyUHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi50b2tlbnMgPSBtYXAoIHRoaXMudG9rZW5zLCB0b0pTT04gKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsZXhlclxuICovXG5sZXhlclByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIG1hcCggdGhpcy50b2tlbnMsIHRvU3RyaW5nICkuam9pbiggJycgKTtcbn07IiwiZXhwb3J0IHZhciBBcnJheUV4cHJlc3Npb24gICAgICAgPSAnQXJyYXlFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgQ2FsbEV4cHJlc3Npb24gICAgICAgID0gJ0NhbGxFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgRXhwcmVzc2lvblN0YXRlbWVudCAgID0gJ0V4cHJlc3Npb25TdGF0ZW1lbnQnO1xuZXhwb3J0IHZhciBJZGVudGlmaWVyICAgICAgICAgICAgPSAnSWRlbnRpZmllcic7XG5leHBvcnQgdmFyIExpdGVyYWwgICAgICAgICAgICAgICA9ICdMaXRlcmFsJztcbmV4cG9ydCB2YXIgTWVtYmVyRXhwcmVzc2lvbiAgICAgID0gJ01lbWJlckV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBQcm9ncmFtICAgICAgICAgICAgICAgPSAnUHJvZ3JhbSc7XG5leHBvcnQgdmFyIFNlcXVlbmNlRXhwcmVzc2lvbiAgICA9ICdTZXF1ZW5jZUV4cHJlc3Npb24nOyIsImltcG9ydCAqIGFzIENoYXJhY3RlciBmcm9tICcuL2NoYXJhY3Rlcic7XG5pbXBvcnQgKiBhcyBTeW50YXggZnJvbSAnLi9zeW50YXgnO1xuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCBtYXAgZnJvbSAnLi9tYXAnO1xuaW1wb3J0IHRvSlNPTiBmcm9tICcuL3RvLWpzb24nO1xuXG52YXIgbm9kZUlkID0gMCxcbiAgICBsaXRlcmFsVHlwZXMgPSAnYm9vbGVhbiBudW1iZXIgc3RyaW5nJy5zcGxpdCggJyAnICk7XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+Tm9kZVxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHR5cGUgQSBub2RlIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE5vZGUoIHR5cGUgKXtcblxuICAgIGlmKCB0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3R5cGUgbXVzdCBiZSBhIHN0cmluZycgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEJ1aWxkZXJ+Tm9kZSNpZFxuICAgICAqL1xuICAgIHRoaXMuaWQgPSArK25vZGVJZDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IEJ1aWxkZXJ+Tm9kZSN0eXBlXG4gICAgICovXG4gICAgdGhpcy50eXBlID0gdHlwZTtcbn1cblxuTm9kZS5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5Ob2RlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE5vZGU7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIG5vZGVcbiAqL1xuTm9kZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnR5cGUgPSB0aGlzLnR5cGU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbm9kZVxuICovXG5Ob2RlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFN0cmluZyggdGhpcy50eXBlICk7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5pZDtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5Ob2RlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZXhwcmVzc2lvblR5cGUgQSBub2RlIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEV4cHJlc3Npb24oIGV4cHJlc3Npb25UeXBlICl7XG4gICAgTm9kZS5jYWxsKCB0aGlzLCBleHByZXNzaW9uVHlwZSApO1xufVxuXG5FeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE5vZGUucHJvdG90eXBlICk7XG5cbkV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5MaXRlcmFsXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOm51bWJlcn0gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBsaXRlcmFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMaXRlcmFsKCB2YWx1ZSwgcmF3ICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguTGl0ZXJhbCApO1xuXG4gICAgaWYoIGxpdGVyYWxUeXBlcy5pbmRleE9mKCB0eXBlb2YgdmFsdWUgKSA9PT0gLTEgJiYgdmFsdWUgIT09IG51bGwgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3ZhbHVlIG11c3QgYmUgYSBib29sZWFuLCBudW1iZXIsIHN0cmluZywgb3IgbnVsbCcgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5yYXcgPSByYXc7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5MaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExpdGVyYWw7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGxpdGVyYWxcbiAqL1xuTGl0ZXJhbC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLnJhdyA9IHRoaXMucmF3O1xuICAgIGpzb24udmFsdWUgPSB0aGlzLnZhbHVlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGxpdGVyYWxcbiAqL1xuTGl0ZXJhbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnJhdztcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+TWVtYmVyRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gb2JqZWN0XG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbnxCdWlsZGVyfklkZW50aWZpZXJ9IHByb3BlcnR5XG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGNvbXB1dGVkPWZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5LCBjb21wdXRlZCApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4Lk1lbWJlckV4cHJlc3Npb24gKTtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+RXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLm9iamVjdCA9IG9iamVjdDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb258QnVpbGRlcn5JZGVudGlmaWVyfVxuICAgICAqL1xuICAgIHRoaXMucHJvcGVydHkgPSBwcm9wZXJ0eTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuY29tcHV0ZWQgPSBjb21wdXRlZCB8fCBmYWxzZTtcbn1cblxuTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5NZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1lbWJlckV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIG1lbWJlciBleHByZXNzaW9uXG4gKi9cbk1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5vYmplY3QgICA9IHRoaXMub2JqZWN0LnRvSlNPTigpO1xuICAgIGpzb24ucHJvcGVydHkgPSB0aGlzLnByb3BlcnR5LnRvSlNPTigpO1xuICAgIGpzb24uY29tcHV0ZWQgPSB0aGlzLmNvbXB1dGVkO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflByb2dyYW1cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+Tm9kZVxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheTxCdWlsZGVyflN0YXRlbWVudD59IGJvZHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFByb2dyYW0oIGJvZHkgKXtcbiAgICBOb2RlLmNhbGwoIHRoaXMsIFN5bnRheC5Qcm9ncmFtICk7XG5cbiAgICBpZiggIUFycmF5LmlzQXJyYXkoIGJvZHkgKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYm9keSBtdXN0IGJlIGFuIGFycmF5JyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOkFycmF5PEJ1aWxkZXJ+U3RhdGVtZW50Pn1cbiAgICAgKi9cbiAgICB0aGlzLmJvZHkgPSBib2R5IHx8IFtdO1xuICAgIHRoaXMuc291cmNlVHlwZSA9ICdzY3JpcHQnO1xufVxuXG5Qcm9ncmFtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE5vZGUucHJvdG90eXBlICk7XG5cblByb2dyYW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUHJvZ3JhbTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgcHJvZ3JhbVxuICovXG5Qcm9ncmFtLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uYm9keSA9IG1hcCggdGhpcy5ib2R5LCB0b0pTT04gKTtcbiAgICBqc29uLnNvdXJjZVR5cGUgPSB0aGlzLnNvdXJjZVR5cGU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+U3RhdGVtZW50XG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk5vZGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBzdGF0ZW1lbnRUeXBlIEEgbm9kZSB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdGF0ZW1lbnQoIHN0YXRlbWVudFR5cGUgKXtcbiAgICBOb2RlLmNhbGwoIHRoaXMsIHN0YXRlbWVudFR5cGUgKTtcbn1cblxuU3RhdGVtZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE5vZGUucHJvdG90eXBlICk7XG5cblN0YXRlbWVudC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdGF0ZW1lbnQ7XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+QXJyYXlFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259IGVsZW1lbnRzIEEgbGlzdCBvZiBleHByZXNzaW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gQXJyYXlFeHByZXNzaW9uKCBlbGVtZW50cyApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LkFycmF5RXhwcmVzc2lvbiApO1xuXG4gICAgLy9pZiggISggQXJyYXkuaXNBcnJheSggZWxlbWVudHMgKSApICYmICEoIGVsZW1lbnRzIGluc3RhbmNlb2YgUmFuZ2VFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnZWxlbWVudHMgbXVzdCBiZSBhIGxpc3Qgb2YgZXhwcmVzc2lvbnMgb3IgYW4gaW5zdGFuY2Ugb2YgcmFuZ2UgZXhwcmVzc2lvbicgKTtcbiAgICAvL31cblxuICAgIC8qXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB0aGlzLCAnZWxlbWVudHMnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKCBlbGVtZW50cyApe1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5sZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHRoaXNbIGluZGV4IF0gPSBlbGVtZW50c1sgaW5kZXggXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0gKTtcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5lbGVtZW50cyA9IGVsZW1lbnRzO1xufVxuXG5BcnJheUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuQXJyYXlFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFycmF5RXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgYXJyYXkgZXhwcmVzc2lvblxuICovXG5BcnJheUV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5lbGVtZW50cyA9IEFycmF5LmlzQXJyYXkoIHRoaXMuZWxlbWVudHMgKSA/XG4gICAgICAgIG1hcCggdGhpcy5lbGVtZW50cywgdG9KU09OICkgOlxuICAgICAgICB0aGlzLmVsZW1lbnRzLnRvSlNPTigpO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkNhbGxFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBjYWxsZWVcbiAqIEBwYXJhbSB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPn0gYXJnc1xuICovXG5leHBvcnQgZnVuY3Rpb24gQ2FsbEV4cHJlc3Npb24oIGNhbGxlZSwgYXJncyApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LkNhbGxFeHByZXNzaW9uICk7XG5cbiAgICBpZiggIUFycmF5LmlzQXJyYXkoIGFyZ3MgKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYXJndW1lbnRzIG11c3QgYmUgYW4gYXJyYXknICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5FeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMuY2FsbGVlID0gY2FsbGVlO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj59XG4gICAgICovXG4gICAgdGhpcy5hcmd1bWVudHMgPSBhcmdzO1xufVxuXG5DYWxsRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5DYWxsRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDYWxsRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgY2FsbCBleHByZXNzaW9uXG4gKi9cbkNhbGxFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uY2FsbGVlICAgID0gdGhpcy5jYWxsZWUudG9KU09OKCk7XG4gICAganNvbi5hcmd1bWVudHMgPSBtYXAoIHRoaXMuYXJndW1lbnRzLCB0b0pTT04gKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5Db21wdXRlZE1lbWJlckV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+TWVtYmVyRXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IG9iamVjdFxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHkgKXtcbiAgICBpZiggISggcHJvcGVydHkgaW5zdGFuY2VvZiBFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3Byb3BlcnR5IG11c3QgYmUgYW4gZXhwcmVzc2lvbiB3aGVuIGNvbXB1dGVkIGlzIHRydWUnICk7XG4gICAgfVxuXG4gICAgTWVtYmVyRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5LCB0cnVlICk7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIEJ1aWxkZXJ+Q29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uI2NvbXB1dGVkPXRydWVcbiAgICAgKi9cbn1cblxuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb21wdXRlZE1lbWJlckV4cHJlc3Npb247XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+RXhwcmVzc2lvblN0YXRlbWVudFxuICogQGV4dGVuZHMgQnVpbGRlcn5TdGF0ZW1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEV4cHJlc3Npb25TdGF0ZW1lbnQoIGV4cHJlc3Npb24gKXtcbiAgICBTdGF0ZW1lbnQuY2FsbCggdGhpcywgU3ludGF4LkV4cHJlc3Npb25TdGF0ZW1lbnQgKTtcblxuICAgIGlmKCAhKCBleHByZXNzaW9uIGluc3RhbmNlb2YgRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdhcmd1bWVudCBtdXN0IGJlIGFuIGV4cHJlc3Npb24nICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5FeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMuZXhwcmVzc2lvbiA9IGV4cHJlc3Npb247XG59XG5cbkV4cHJlc3Npb25TdGF0ZW1lbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggU3RhdGVtZW50LnByb3RvdHlwZSApO1xuXG5FeHByZXNzaW9uU3RhdGVtZW50LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEV4cHJlc3Npb25TdGF0ZW1lbnQ7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGV4cHJlc3Npb24gc3RhdGVtZW50XG4gKi9cbkV4cHJlc3Npb25TdGF0ZW1lbnQucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5leHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uLnRvSlNPTigpO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfklkZW50aWZpZXJcbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGlkZW50aWZpZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElkZW50aWZpZXIoIG5hbWUgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5JZGVudGlmaWVyICk7XG5cbiAgICBpZiggdHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICduYW1lIG11c3QgYmUgYSBzdHJpbmcnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG59XG5cbklkZW50aWZpZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuSWRlbnRpZmllci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJZGVudGlmaWVyO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBpZGVudGlmaWVyXG4gKi9cbklkZW50aWZpZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5uYW1lID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gTnVsbExpdGVyYWwoIHJhdyApe1xuICAgIGlmKCByYXcgIT09ICdudWxsJyApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncmF3IGlzIG5vdCBhIG51bGwgbGl0ZXJhbCcgKTtcbiAgICB9XG5cbiAgICBMaXRlcmFsLmNhbGwoIHRoaXMsIG51bGwsIHJhdyApO1xufVxuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBMaXRlcmFsLnByb3RvdHlwZSApO1xuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdWxsTGl0ZXJhbDtcblxuZXhwb3J0IGZ1bmN0aW9uIE51bWVyaWNMaXRlcmFsKCByYXcgKXtcbiAgICB2YXIgdmFsdWUgPSBwYXJzZUZsb2F0KCByYXcgKTtcblxuICAgIGlmKCBpc05hTiggdmFsdWUgKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncmF3IGlzIG5vdCBhIG51bWVyaWMgbGl0ZXJhbCcgKTtcbiAgICB9XG5cbiAgICBMaXRlcmFsLmNhbGwoIHRoaXMsIHZhbHVlLCByYXcgKTtcbn1cblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTGl0ZXJhbC5wcm90b3R5cGUgKTtcblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVtZXJpY0xpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+U2VxdWVuY2VFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259IGV4cHJlc3Npb25zIFRoZSBleHByZXNzaW9ucyBpbiB0aGUgc2VxdWVuY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNlcXVlbmNlRXhwcmVzc2lvbiggZXhwcmVzc2lvbnMgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5TZXF1ZW5jZUV4cHJlc3Npb24gKTtcblxuICAgIC8vaWYoICEoIEFycmF5LmlzQXJyYXkoIGV4cHJlc3Npb25zICkgKSAmJiAhKCBleHByZXNzaW9ucyBpbnN0YW5jZW9mIFJhbmdlRXhwcmVzc2lvbiApICl7XG4gICAgLy8gICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2V4cHJlc3Npb25zIG11c3QgYmUgYSBsaXN0IG9mIGV4cHJlc3Npb25zIG9yIGFuIGluc3RhbmNlIG9mIHJhbmdlIGV4cHJlc3Npb24nICk7XG4gICAgLy99XG5cbiAgICAvKlxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ2V4cHJlc3Npb25zJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiggZXhwcmVzc2lvbnMgKXtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoID0gZXhwcmVzc2lvbnMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICB0aGlzWyBpbmRleCBdID0gZXhwcmVzc2lvbnNbIGluZGV4IF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9ICk7XG4gICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMuZXhwcmVzc2lvbnMgPSBleHByZXNzaW9ucztcbn1cblxuU2VxdWVuY2VFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblNlcXVlbmNlRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTZXF1ZW5jZUV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHNlcXVlbmNlIGV4cHJlc3Npb25cbiAqL1xuU2VxdWVuY2VFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uZXhwcmVzc2lvbnMgPSBBcnJheS5pc0FycmF5KCB0aGlzLmV4cHJlc3Npb25zICkgP1xuICAgICAgICBtYXAoIHRoaXMuZXhwcmVzc2lvbnMsIHRvSlNPTiApIDpcbiAgICAgICAgdGhpcy5leHByZXNzaW9ucy50b0pTT04oKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5TdGF0aWNNZW1iZXJFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk1lbWJlckV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBvYmplY3RcbiAqIEBwYXJhbSB7QnVpbGRlcn5JZGVudGlmaWVyfSBwcm9wZXJ0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RhdGljTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApe1xuICAgIC8vaWYoICEoIHByb3BlcnR5IGluc3RhbmNlb2YgSWRlbnRpZmllciApICYmICEoIHByb3BlcnR5IGluc3RhbmNlb2YgTG9va3VwRXhwcmVzc2lvbiApICYmICEoIHByb3BlcnR5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncHJvcGVydHkgbXVzdCBiZSBhbiBpZGVudGlmaWVyLCBldmFsIGV4cHJlc3Npb24sIG9yIGxvb2t1cCBleHByZXNzaW9uIHdoZW4gY29tcHV0ZWQgaXMgZmFsc2UnICk7XG4gICAgLy99XG5cbiAgICBNZW1iZXJFeHByZXNzaW9uLmNhbGwoIHRoaXMsIG9iamVjdCwgcHJvcGVydHksIGZhbHNlICk7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIEJ1aWxkZXJ+U3RhdGljTWVtYmVyRXhwcmVzc2lvbiNjb21wdXRlZD1mYWxzZVxuICAgICAqL1xufVxuXG5TdGF0aWNNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblN0YXRpY01lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RhdGljTWVtYmVyRXhwcmVzc2lvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIFN0cmluZ0xpdGVyYWwoIHJhdyApe1xuICAgIGlmKCAhQ2hhcmFjdGVyLmlzUXVvdGUoIHJhd1sgMCBdICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JhdyBpcyBub3QgYSBzdHJpbmcgbGl0ZXJhbCcgKTtcbiAgICB9XG5cbiAgICB2YXIgdmFsdWUgPSByYXcuc3Vic3RyaW5nKCAxLCByYXcubGVuZ3RoIC0gMSApO1xuXG4gICAgTGl0ZXJhbC5jYWxsKCB0aGlzLCB2YWx1ZSwgcmF3ICk7XG59XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTGl0ZXJhbC5wcm90b3R5cGUgKTtcblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdHJpbmdMaXRlcmFsOyIsImV4cG9ydCB2YXIgQmxvY2tFeHByZXNzaW9uICAgICAgID0gJ0Jsb2NrRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIEV4aXN0ZW50aWFsRXhwcmVzc2lvbiA9ICdFeGlzdGVudGlhbEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBMb29rdXBFeHByZXNzaW9uICAgICAgPSAnTG9va3VwRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIFJhbmdlRXhwcmVzc2lvbiAgICAgICA9ICdSYW5nZUV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBSb290RXhwcmVzc2lvbiAgICAgICAgPSAnUm9vdEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBTY29wZUV4cHJlc3Npb24gICAgICAgPSAnU2NvcGVFeHByZXNzaW9uJzsiLCJ2YXIgX2hhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7Kn0gb2JqZWN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gcHJvcGVydHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaGFzT3duUHJvcGVydHkoIG9iamVjdCwgcHJvcGVydHkgKXtcbiAgICByZXR1cm4gX2hhc093blByb3BlcnR5LmNhbGwoIG9iamVjdCwgcHJvcGVydHkgKTtcbn0iLCJpbXBvcnQgeyBDb21wdXRlZE1lbWJlckV4cHJlc3Npb24sIEV4cHJlc3Npb24sIElkZW50aWZpZXIsIE5vZGUsIExpdGVyYWwgfSBmcm9tICcuL25vZGUnO1xuaW1wb3J0ICogYXMgS2V5cGF0aFN5bnRheCBmcm9tICcuL2tleXBhdGgtc3ludGF4JztcbmltcG9ydCBoYXNPd25Qcm9wZXJ0eSBmcm9tICcuL2hhcy1vd24tcHJvcGVydHknO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfk9wZXJhdG9yRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZXhwcmVzc2lvblR5cGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBvcGVyYXRvclxuICovXG5mdW5jdGlvbiBPcGVyYXRvckV4cHJlc3Npb24oIGV4cHJlc3Npb25UeXBlLCBvcGVyYXRvciApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgZXhwcmVzc2lvblR5cGUgKTtcblxuICAgIHRoaXMub3BlcmF0b3IgPSBvcGVyYXRvcjtcbn1cblxuT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbk9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBPcGVyYXRvckV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIG9wZXJhdG9yIGV4cHJlc3Npb25cbiAqL1xuT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ub3BlcmF0b3IgPSB0aGlzLm9wZXJhdG9yO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gQmxvY2tFeHByZXNzaW9uKCBib2R5ICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCAnQmxvY2tFeHByZXNzaW9uJyApO1xuXG4gICAgLypcbiAgICBpZiggISggZXhwcmVzc2lvbiBpbnN0YW5jZW9mIEV4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYXJndW1lbnQgbXVzdCBiZSBhbiBleHByZXNzaW9uJyApO1xuICAgIH1cbiAgICAqL1xuXG4gICAgdGhpcy5ib2R5ID0gYm9keTtcbn1cblxuQmxvY2tFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkJsb2NrRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCbG9ja0V4cHJlc3Npb247XG5cbmV4cG9ydCBmdW5jdGlvbiBFeGlzdGVudGlhbEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKXtcbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb24sICc/JyApO1xuXG4gICAgdGhpcy5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbn1cblxuRXhpc3RlbnRpYWxFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuRXhpc3RlbnRpYWxFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEV4aXN0ZW50aWFsRXhwcmVzc2lvbjtcblxuRXhpc3RlbnRpYWxFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5leHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uLnRvSlNPTigpO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gTG9va3VwRXhwcmVzc2lvbigga2V5ICl7XG4gICAgaWYoICEoIGtleSBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISgga2V5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2tleSBtdXN0IGJlIGEgbGl0ZXJhbCwgaWRlbnRpZmllciwgb3IgZXZhbCBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb24sICclJyApO1xuXG4gICAgdGhpcy5rZXkgPSBrZXk7XG59XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5Mb29rdXBFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvb2t1cEV4cHJlc3Npb247XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciArIHRoaXMua2V5O1xufTtcblxuTG9va3VwRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ua2V5ID0gdGhpcy5rZXk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk9wZXJhdG9yRXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IGxlZnRcbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSByaWdodFxuICovXG5leHBvcnQgZnVuY3Rpb24gUmFuZ2VFeHByZXNzaW9uKCBsZWZ0LCByaWdodCApe1xuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbiwgJy4uJyApO1xuXG4gICAgaWYoICEoIGxlZnQgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgbGVmdCAhPT0gbnVsbCApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGVmdCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGxpdGVyYWwgb3IgbnVsbCcgKTtcbiAgICB9XG5cbiAgICBpZiggISggcmlnaHQgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgcmlnaHQgIT09IG51bGwgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JpZ2h0IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgbGl0ZXJhbCBvciBudWxsJyApO1xuICAgIH1cblxuICAgIGlmKCBsZWZ0ID09PSBudWxsICYmIHJpZ2h0ID09PSBudWxsICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsZWZ0IGFuZCByaWdodCBjYW5ub3QgZXF1YWwgbnVsbCBhdCB0aGUgc2FtZSB0aW1lJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+TGl0ZXJhbH0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jbGVmdFxuICAgICAqL1xuICAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uIzBcbiAgICAgKi9cbiAgICB0aGlzWyAwIF0gPSB0aGlzLmxlZnQgPSBsZWZ0O1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5MaXRlcmFsfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiNyaWdodFxuICAgICAqL1xuICAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uIzFcbiAgICAgKi9cbiAgICB0aGlzWyAxIF0gPSB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uI2xlbmd0aD0yXG4gICAgICovXG4gICAgdGhpcy5sZW5ndGggPSAyO1xufVxuXG5SYW5nZUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJhbmdlRXhwcmVzc2lvbjtcblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5sZWZ0ID0gdGhpcy5sZWZ0ICE9PSBudWxsID9cbiAgICAgICAgdGhpcy5sZWZ0LnRvSlNPTigpIDpcbiAgICAgICAgdGhpcy5sZWZ0O1xuICAgIGpzb24ucmlnaHQgPSB0aGlzLnJpZ2h0ICE9PSBudWxsID9cbiAgICAgICAgdGhpcy5yaWdodC50b0pTT04oKSA6XG4gICAgICAgIHRoaXMucmlnaHQ7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cblJhbmdlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmxlZnQudG9TdHJpbmcoKSArIHRoaXMub3BlcmF0b3IgKyB0aGlzLnJpZ2h0LnRvU3RyaW5nKCk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHksIGNhcmRpbmFsaXR5ICl7XG4gICAgQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLmNhbGwoIHRoaXMsIG9iamVjdCwgcHJvcGVydHkgKTtcblxuICAgIGlmKCAhaGFzT3duUHJvcGVydHkoIENhcmRpbmFsaXR5LCBjYXJkaW5hbGl0eSApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdVbmtub3duIGNhcmRpbmFsaXR5ICcgKyBjYXJkaW5hbGl0eSApO1xuICAgIH1cblxuICAgIHRoaXMuY2FyZGluYWxpdHkgPSBjYXJkaW5hbGl0eTtcbn1cblxuUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5SZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIFJvb3RFeHByZXNzaW9uKCBrZXkgKXtcbiAgICBpZiggISgga2V5IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmICEoIGtleSBpbnN0YW5jZW9mIElkZW50aWZpZXIgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBCbG9ja0V4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAna2V5IG11c3QgYmUgYSBsaXRlcmFsLCBpZGVudGlmaWVyLCBvciBldmFsIGV4cHJlc3Npb24nICk7XG4gICAgfVxuXG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb24sICd+JyApO1xuXG4gICAgdGhpcy5rZXkgPSBrZXk7XG59XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuUm9vdEV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUm9vdEV4cHJlc3Npb247XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0b3IgKyB0aGlzLmtleTtcbn07XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5rZXkgPSB0aGlzLmtleTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFNjb3BlRXhwcmVzc2lvbiggb3BlcmF0b3IsIGtleSApe1xuICAgIC8vaWYoICEoIGtleSBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISgga2V5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAna2V5IG11c3QgYmUgYSBsaXRlcmFsLCBpZGVudGlmaWVyLCBvciBldmFsIGV4cHJlc3Npb24nICk7XG4gICAgLy99XG5cbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5TY29wZUV4cHJlc3Npb24sIG9wZXJhdG9yICk7XG5cbiAgICB0aGlzLmtleSA9IGtleTtcbn1cblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNjb3BlRXhwcmVzc2lvbjtcblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0b3IgKyB0aGlzLmtleTtcbn07XG5cblNjb3BlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ua2V5ID0gdGhpcy5rZXk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIEdyYW1tYXIgZnJvbSAnLi9ncmFtbWFyJztcbmltcG9ydCAqIGFzIE5vZGUgZnJvbSAnLi9ub2RlJztcbmltcG9ydCAqIGFzIEtleXBhdGhOb2RlIGZyb20gJy4va2V5cGF0aC1ub2RlJztcblxudmFyIGJ1aWxkZXJQcm90b3R5cGU7XG5cbmZ1bmN0aW9uIHVuc2hpZnQoIGxpc3QsIGl0ZW0gKXtcbiAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICBsZW5ndGggPSBsaXN0Lmxlbmd0aCxcbiAgICAgICAgdDEgPSBpdGVtLFxuICAgICAgICB0MiA9IGl0ZW07XG5cbiAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KysgKXtcbiAgICAgICAgdDEgPSB0MjtcbiAgICAgICAgdDIgPSBsaXN0WyBpbmRleCBdO1xuICAgICAgICBsaXN0WyBpbmRleCBdID0gdDE7XG4gICAgfVxuXG4gICAgbGlzdFsgbGVuZ3RoIF0gPSB0MjtcblxuICAgIHJldHVybiBsaXN0O1xufVxuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge0xleGVyfSBsZXhlclxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBCdWlsZGVyKCBsZXhlciApe1xuICAgIHRoaXMubGV4ZXIgPSBsZXhlcjtcbn1cblxuYnVpbGRlclByb3RvdHlwZSA9IEJ1aWxkZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuYnVpbGRlclByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJ1aWxkZXI7XG5cbmJ1aWxkZXJQcm90b3R5cGUuYXJyYXlFeHByZXNzaW9uID0gZnVuY3Rpb24oIGxpc3QgKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQVJSQVkgRVhQUkVTU0lPTicgKTtcbiAgICB0aGlzLmNvbnN1bWUoICdbJyApO1xuICAgIHJldHVybiBuZXcgTm9kZS5BcnJheUV4cHJlc3Npb24oIGxpc3QgKTtcbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUuYmxvY2tFeHByZXNzaW9uID0gZnVuY3Rpb24oIHRlcm1pbmF0b3IgKXtcbiAgICB2YXIgYmxvY2sgPSBbXSxcbiAgICAgICAgaXNvbGF0ZWQgPSBmYWxzZTtcbiAgICAvL2NvbnNvbGUubG9nKCAnQkxPQ0snLCB0ZXJtaW5hdG9yICk7XG4gICAgaWYoICF0aGlzLnBlZWsoIHRlcm1pbmF0b3IgKSApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBFWFBSRVNTSU9OUycgKTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgdW5zaGlmdCggYmxvY2ssIHRoaXMuY29uc3VtZSgpICk7XG4gICAgICAgIH0gd2hpbGUoICF0aGlzLnBlZWsoIHRlcm1pbmF0b3IgKSApO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWUoIHRlcm1pbmF0b3IgKTtcbiAgICAvKmlmKCB0aGlzLnBlZWsoICd+JyApICl7XG4gICAgICAgIGlzb2xhdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb25zdW1lKCAnficgKTtcbiAgICB9Ki9cbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLkJsb2NrRXhwcmVzc2lvbiggYmxvY2ssIGlzb2xhdGVkICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd8QXJyYXk8QnVpbGRlcn5Ub2tlbj59IGlucHV0XG4gKiBAcmV0dXJucyB7UHJvZ3JhbX0gVGhlIGJ1aWx0IGFic3RyYWN0IHN5bnRheCB0cmVlXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuYnVpbGQgPSBmdW5jdGlvbiggaW5wdXQgKXtcbiAgICBpZiggdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyApe1xuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50ZXh0ID0gaW5wdXQ7XG5cbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzLmxleGVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xleGVyIGlzIG5vdCBkZWZpbmVkJyApO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZW1iZXIge2V4dGVybmFsOkFycmF5PFRva2VuPn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudG9rZW5zID0gdGhpcy5sZXhlci5sZXgoIGlucHV0ICk7XG4gICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBpbnB1dCApICl7XG4gICAgICAgIHRoaXMudG9rZW5zID0gaW5wdXQuc2xpY2UoKTtcbiAgICAgICAgdGhpcy50ZXh0ID0gaW5wdXQuam9pbiggJycgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnaW52YWxpZCBpbnB1dCcgKTtcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJ0JVSUxEJyApO1xuICAgIC8vY29uc29sZS5sb2coICctICcsIHRoaXMudGV4dC5sZW5ndGgsICdDSEFSUycsIHRoaXMudGV4dCApO1xuICAgIC8vY29uc29sZS5sb2coICctICcsIHRoaXMudG9rZW5zLmxlbmd0aCwgJ1RPS0VOUycsIHRoaXMudG9rZW5zICk7XG4gICAgdGhpcy5jb2x1bW4gPSB0aGlzLnRleHQubGVuZ3RoO1xuICAgIHRoaXMubGluZSA9IDE7XG5cbiAgICB2YXIgcHJvZ3JhbSA9IHRoaXMucHJvZ3JhbSgpO1xuXG4gICAgaWYoIHRoaXMudG9rZW5zLmxlbmd0aCApe1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoICdVbmV4cGVjdGVkIHRva2VuICcgKyB0aGlzLnRva2Vuc1sgMCBdICsgJyByZW1haW5pbmcnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2dyYW07XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0NhbGxFeHByZXNzaW9ufSBUaGUgY2FsbCBleHByZXNzaW9uIG5vZGVcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5jYWxsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGFyZ3MgPSB0aGlzLmxpc3QoICcoJyApLFxuICAgICAgICBjYWxsZWU7XG5cbiAgICB0aGlzLmNvbnN1bWUoICcoJyApO1xuXG4gICAgY2FsbGVlID0gdGhpcy5leHByZXNzaW9uKCk7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NBTEwgRVhQUkVTU0lPTicgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBDQUxMRUUnLCBjYWxsZWUgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBBUkdVTUVOVFMnLCBhcmdzLCBhcmdzLmxlbmd0aCApO1xuICAgIHJldHVybiBuZXcgTm9kZS5DYWxsRXhwcmVzc2lvbiggY2FsbGVlLCBhcmdzICk7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgdGhlIG5leHQgdG9rZW4gaW4gdGhlIHRva2VuIGxpc3QuIElmIGEgY29tcGFyaXNvbiBpcyBwcm92aWRlZCwgdGhlIHRva2VuIHdpbGwgb25seSBiZSByZXR1cm5lZCBpZiB0aGUgdmFsdWUgbWF0Y2hlcy4gT3RoZXJ3aXNlIGFuIGVycm9yIGlzIHRocm93bi5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtleHBlY3RlZF0gQW4gZXhwZWN0ZWQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge1Rva2VufSBUaGUgbmV4dCB0b2tlbiBpbiB0aGUgbGlzdFxuICogQHRocm93cyB7U3ludGF4RXJyb3J9IElmIHRva2VuIGRpZCBub3QgZXhpc3RcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5jb25zdW1lID0gZnVuY3Rpb24oIGV4cGVjdGVkICl7XG4gICAgaWYoICF0aGlzLnRva2Vucy5sZW5ndGggKXtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAnVW5leHBlY3RlZCBlbmQgb2YgZXhwcmVzc2lvbicgKTtcbiAgICB9XG5cbiAgICB2YXIgdG9rZW4gPSB0aGlzLmV4cGVjdCggZXhwZWN0ZWQgKTtcblxuICAgIGlmKCAhdG9rZW4gKXtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAnVW5leHBlY3RlZCB0b2tlbiAnICsgdG9rZW4udmFsdWUgKyAnIGNvbnN1bWVkJyApO1xuICAgIH1cblxuICAgIHJldHVybiB0b2tlbjtcbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUuZXhpc3RlbnRpYWxFeHByZXNzaW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvbigpO1xuICAgIC8vY29uc29sZS5sb2coICctIEVYSVNUIEVYUFJFU1NJT04nLCBleHByZXNzaW9uICk7XG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5FeGlzdGVudGlhbEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgbmV4dCB0b2tlbiBpbiB0aGUgdG9rZW4gbGlzdC4gSWYgY29tcGFyaXNvbnMgYXJlIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgY29tcGFyaXNvbnMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZmlyc3RdIFRoZSBmaXJzdCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3NlY29uZF0gVGhlIHNlY29uZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3RoaXJkXSBUaGUgdGhpcmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmb3VydGhdIFRoZSBmb3VydGggY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge1Rva2VufSBUaGUgbmV4dCB0b2tlbiBpbiB0aGUgbGlzdCBvciBgdW5kZWZpbmVkYCBpZiBpdCBkaWQgbm90IGV4aXN0XG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuZXhwZWN0ID0gZnVuY3Rpb24oIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKXtcbiAgICB2YXIgdG9rZW4gPSB0aGlzLnBlZWsoIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKTtcblxuICAgIGlmKCB0b2tlbiApe1xuICAgICAgICB0aGlzLnRva2Vuc1sgdGhpcy50b2tlbnMubGVuZ3RoLS0gXTtcbiAgICAgICAgdGhpcy5jb2x1bW4gLT0gdG9rZW4udmFsdWUubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgfVxuXG4gICAgcmV0dXJuIHZvaWQgMDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7RXhwcmVzc2lvbn0gQW4gZXhwcmVzc2lvbiBub2RlXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuZXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGV4cHJlc3Npb24gPSBudWxsLFxuICAgICAgICBsaXN0LCBuZXh0LCB0b2tlbjtcblxuICAgIGlmKCB0aGlzLmV4cGVjdCggJzsnICkgKXtcbiAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgIH1cblxuICAgIGlmKCBuZXh0ID0gdGhpcy5wZWVrKCkgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0VYUFJFU1NJT04nLCBuZXh0ICk7XG4gICAgICAgIHN3aXRjaCggbmV4dC50eXBlICl7XG4gICAgICAgICAgICBjYXNlIEdyYW1tYXIuUHVuY3R1YXRvcjpcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5leHBlY3QoICddJyApICl7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QgPSB0aGlzLmxpc3QoICdbJyApO1xuICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy50b2tlbnMubGVuZ3RoID09PSAxICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5hcnJheUV4cHJlc3Npb24oIGxpc3QgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBsaXN0Lmxlbmd0aCA+IDEgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLnNlcXVlbmNlRXhwcmVzc2lvbiggbGlzdCApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IEFycmF5LmlzQXJyYXkoIGxpc3QgKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdFsgMCBdIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggbmV4dC52YWx1ZSA9PT0gJ30nICl7XG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cCggbmV4dCApO1xuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCB0aGlzLmV4cGVjdCggJz8nICkgKXtcbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuZXhpc3RlbnRpYWxFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEdyYW1tYXIuTnVsbExpdGVyYWw6XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubGl0ZXJhbCgpO1xuICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIEdyYW1tYXIuSWRlbnRpZmllclxuICAgICAgICAgICAgLy8gR3JhbW1hci5OdW1lcmljTGl0ZXJhbFxuICAgICAgICAgICAgLy8gR3JhbW1hci5TdHJpbmdMaXRlcmFsXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cCggbmV4dCApO1xuICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgICAgICAvLyBJbXBsaWVkIG1lbWJlciBleHByZXNzaW9uLiBTaG91bGQgb25seSBoYXBwZW4gYWZ0ZXIgYW4gSWRlbnRpZmllci5cbiAgICAgICAgICAgICAgICBpZiggbmV4dCAmJiBuZXh0LnR5cGUgPT09IEdyYW1tYXIuUHVuY3R1YXRvciAmJiAoIG5leHQudmFsdWUgPT09ICcpJyB8fCBuZXh0LnZhbHVlID09PSAnXScgfHwgbmV4dC52YWx1ZSA9PT0gJz8nICkgKXtcbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubWVtYmVyRXhwcmVzc2lvbiggZXhwcmVzc2lvbiwgZmFsc2UgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSggKCB0b2tlbiA9IHRoaXMuZXhwZWN0KCAnKScsICdbJywgJy4nICkgKSApe1xuICAgICAgICAgICAgaWYoIHRva2VuLnZhbHVlID09PSAnKScgKXtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5jYWxsRXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0b2tlbi52YWx1ZSA9PT0gJ1snICl7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubWVtYmVyRXhwcmVzc2lvbiggZXhwcmVzc2lvbiwgdHJ1ZSApO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0b2tlbi52YWx1ZSA9PT0gJy4nICl7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubWVtYmVyRXhwcmVzc2lvbiggZXhwcmVzc2lvbiwgZmFsc2UgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAnVW5leHBlY3RlZCB0b2tlbjogJyArIHRva2VuICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7RXhwcmVzc2lvblN0YXRlbWVudH0gQW4gZXhwcmVzc2lvbiBzdGF0ZW1lbnRcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5leHByZXNzaW9uU3RhdGVtZW50ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvbigpLFxuICAgICAgICBleHByZXNzaW9uU3RhdGVtZW50O1xuICAgIC8vY29uc29sZS5sb2coICdFWFBSRVNTSU9OIFNUQVRFTUVOVCBXSVRIJywgZXhwcmVzc2lvbiApO1xuICAgIGV4cHJlc3Npb25TdGF0ZW1lbnQgPSBuZXcgTm9kZS5FeHByZXNzaW9uU3RhdGVtZW50KCBleHByZXNzaW9uICk7XG5cbiAgICByZXR1cm4gZXhwcmVzc2lvblN0YXRlbWVudDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7SWRlbnRpZmllcn0gQW4gaWRlbnRpZmllclxuICogQHRocm93cyB7U3ludGF4RXJyb3J9IElmIHRoZSB0b2tlbiBpcyBub3QgYW4gaWRlbnRpZmllclxuICovXG5idWlsZGVyUHJvdG90eXBlLmlkZW50aWZpZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciB0b2tlbiA9IHRoaXMuY29uc3VtZSgpO1xuXG4gICAgaWYoICEoIHRva2VuLnR5cGUgPT09IEdyYW1tYXIuSWRlbnRpZmllciApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdJZGVudGlmaWVyIGV4cGVjdGVkJyApO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTm9kZS5JZGVudGlmaWVyKCB0b2tlbi52YWx1ZSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0ZXJtaW5hdG9yXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6QXJyYXk8RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufSBUaGUgbGlzdCBvZiBleHByZXNzaW9ucyBvciByYW5nZSBleHByZXNzaW9uXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uKCB0ZXJtaW5hdG9yICl7XG4gICAgdmFyIGxpc3QgPSBbXSxcbiAgICAgICAgaXNOdW1lcmljID0gZmFsc2UsXG4gICAgICAgIGV4cHJlc3Npb24sIG5leHQ7XG4gICAgLy9jb25zb2xlLmxvZyggJ0xJU1QnLCB0ZXJtaW5hdG9yICk7XG4gICAgaWYoICF0aGlzLnBlZWsoIHRlcm1pbmF0b3IgKSApe1xuICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgIGlzTnVtZXJpYyA9IG5leHQudHlwZSA9PT0gR3JhbW1hci5OdW1lcmljTGl0ZXJhbDtcblxuICAgICAgICAvLyBFeGFtcGxlczogWzEuLjNdLCBbNS4uXSwgWy4uN11cbiAgICAgICAgaWYoICggaXNOdW1lcmljIHx8IG5leHQudmFsdWUgPT09ICcuJyApICYmIHRoaXMucGVla0F0KCAxLCAnLicgKSApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gUkFOR0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpc051bWVyaWMgP1xuICAgICAgICAgICAgICAgIHRoaXMubG9va3VwKCBuZXh0ICkgOlxuICAgICAgICAgICAgICAgIG51bGw7XG4gICAgICAgICAgICBsaXN0ID0gdGhpcy5yYW5nZUV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcblxuICAgICAgICAvLyBFeGFtcGxlczogWzEsMiwzXSwgW1wiYWJjXCIsXCJkZWZcIl0sIFtmb28sYmFyXSwgW3tmb28uYmFyfV1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIEFSUkFZIE9GIEVYUFJFU1NJT05TJyApO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cCggbmV4dCApO1xuICAgICAgICAgICAgICAgIHVuc2hpZnQoIGxpc3QsIGV4cHJlc3Npb24gKTtcbiAgICAgICAgICAgIH0gd2hpbGUoIHRoaXMuZXhwZWN0KCAnLCcgKSApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coICctIExJU1QgUkVTVUxUJywgbGlzdCApO1xuICAgIHJldHVybiBsaXN0O1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtMaXRlcmFsfSBUaGUgbGl0ZXJhbCBub2RlXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUubGl0ZXJhbCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRva2VuID0gdGhpcy5jb25zdW1lKCksXG4gICAgICAgIHJhdyA9IHRva2VuLnZhbHVlO1xuXG4gICAgc3dpdGNoKCB0b2tlbi50eXBlICl7XG4gICAgICAgIGNhc2UgR3JhbW1hci5OdW1lcmljTGl0ZXJhbDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTm9kZS5OdW1lcmljTGl0ZXJhbCggcmF3ICk7XG4gICAgICAgIGNhc2UgR3JhbW1hci5TdHJpbmdMaXRlcmFsOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOb2RlLlN0cmluZ0xpdGVyYWwoIHJhdyApO1xuICAgICAgICBjYXNlIEdyYW1tYXIuTnVsbExpdGVyYWw6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE5vZGUuTnVsbExpdGVyYWwoIHJhdyApO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ0xpdGVyYWwgZXhwZWN0ZWQnICk7XG4gICAgfVxufTtcblxuYnVpbGRlclByb3RvdHlwZS5sb29rdXAgPSBmdW5jdGlvbiggbmV4dCApe1xuICAgIHZhciBleHByZXNzaW9uO1xuICAgIC8vY29uc29sZS5sb2coICdMT09LVVAnLCBuZXh0ICk7XG4gICAgc3dpdGNoKCBuZXh0LnR5cGUgKXtcbiAgICAgICAgY2FzZSBHcmFtbWFyLklkZW50aWZpZXI6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5pZGVudGlmaWVyKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBHcmFtbWFyLk51bWVyaWNMaXRlcmFsOlxuICAgICAgICBjYXNlIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxpdGVyYWwoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEdyYW1tYXIuUHVuY3R1YXRvcjpcbiAgICAgICAgICAgIGlmKCBuZXh0LnZhbHVlID09PSAnfScgKXtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWUoICd9JyApO1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmJsb2NrRXhwcmVzc2lvbiggJ3snICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoICd0b2tlbiBjYW5ub3QgYmUgYSBsb29rdXAnICk7XG4gICAgfVxuXG4gICAgbmV4dCA9IHRoaXMucGVlaygpO1xuXG4gICAgaWYoIG5leHQgJiYgbmV4dC52YWx1ZSA9PT0gJyUnICl7XG4gICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcbiAgICB9XG4gICAgaWYoIG5leHQgJiYgbmV4dC52YWx1ZSA9PT0gJ34nICl7XG4gICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLnJvb3RFeHByZXNzaW9uKCBleHByZXNzaW9uICk7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coICctIExPT0tVUCBSRVNVTFQnLCBleHByZXNzaW9uICk7XG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLmxvb2t1cEV4cHJlc3Npb24gPSBmdW5jdGlvbigga2V5ICl7XG4gICAgdGhpcy5jb25zdW1lKCAnJScgKTtcbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLkxvb2t1cEV4cHJlc3Npb24oIGtleSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7RXhwcmVzc2lvbn0gcHJvcGVydHkgVGhlIGV4cHJlc3Npb24gYXNzaWduZWQgdG8gdGhlIHByb3BlcnR5IG9mIHRoZSBtZW1iZXIgZXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBjb21wdXRlZCBXaGV0aGVyIG9yIG5vdCB0aGUgbWVtYmVyIGV4cHJlc3Npb24gaXMgY29tcHV0ZWRcbiAqIEByZXR1cm5zIHtNZW1iZXJFeHByZXNzaW9ufSBUaGUgbWVtYmVyIGV4cHJlc3Npb25cbiAqL1xuYnVpbGRlclByb3RvdHlwZS5tZW1iZXJFeHByZXNzaW9uID0gZnVuY3Rpb24oIHByb3BlcnR5LCBjb21wdXRlZCApe1xuICAgIC8vY29uc29sZS5sb2coICdNRU1CRVInLCBwcm9wZXJ0eSApO1xuICAgIHZhciBvYmplY3QgPSB0aGlzLmV4cHJlc3Npb24oKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gT0JKRUNUJywgb2JqZWN0ICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gUFJPUEVSVFknLCBwcm9wZXJ0eSApO1xuICAgIC8vY29uc29sZS5sb2coICctIENPTVBVVEVEJywgY29tcHV0ZWQgKTtcbiAgICByZXR1cm4gY29tcHV0ZWQgP1xuICAgICAgICBuZXcgTm9kZS5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHkgKSA6XG4gICAgICAgIG5ldyBOb2RlLlN0YXRpY01lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHkgKTtcbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiggaW5wdXQgKXtcbiAgICB0aGlzLnRva2VucyA9IHRoaXMubGV4ZXIubGV4KCBpbnB1dCApO1xuICAgIHJldHVybiB0aGlzLmJ1aWxkKCB0aGlzLnRva2VucyApO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyB0aGUgbmV4dCB0b2tlbiBpbiB0aGUgdG9rZW4gbGlzdCBfd2l0aG91dCByZW1vdmluZyBpdF8uIElmIGNvbXBhcmlzb25zIGFyZSBwcm92aWRlZCwgdGhlIHRva2VuIHdpbGwgb25seSBiZSByZXR1cm5lZCBpZiB0aGUgdmFsdWUgbWF0Y2hlcyBvbmUgb2YgdGhlIGNvbXBhcmlzb25zLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZpcnN0XSBUaGUgZmlyc3QgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtzZWNvbmRdIFRoZSBzZWNvbmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFt0aGlyZF0gVGhlIHRoaXJkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZm91cnRoXSBUaGUgZm91cnRoIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtMZXhlcn5Ub2tlbn0gVGhlIG5leHQgdG9rZW4gaW4gdGhlIGxpc3Qgb3IgYHVuZGVmaW5lZGAgaWYgaXQgZGlkIG5vdCBleGlzdFxuICovXG5idWlsZGVyUHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbiggZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApe1xuICAgIHJldHVybiB0aGlzLnBlZWtBdCggMCwgZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyB0aGUgdG9rZW4gYXQgdGhlIHJlcXVlc3RlZCBwb3NpdGlvbiBfd2l0aG91dCByZW1vdmluZyBpdF8gZnJvbSB0aGUgdG9rZW4gbGlzdC4gSWYgY29tcGFyaXNvbnMgYXJlIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgY29tcGFyaXNvbnMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBwb3NpdGlvbiBUaGUgcG9zaXRpb24gd2hlcmUgdGhlIHRva2VuIHdpbGwgYmUgcGVla2VkXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZpcnN0XSBUaGUgZmlyc3QgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtzZWNvbmRdIFRoZSBzZWNvbmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFt0aGlyZF0gVGhlIHRoaXJkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZm91cnRoXSBUaGUgZm91cnRoIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtMZXhlcn5Ub2tlbn0gVGhlIHRva2VuIGF0IHRoZSByZXF1ZXN0ZWQgcG9zaXRpb24gb3IgYHVuZGVmaW5lZGAgaWYgaXQgZGlkIG5vdCBleGlzdFxuICovXG5idWlsZGVyUHJvdG90eXBlLnBlZWtBdCA9IGZ1bmN0aW9uKCBwb3NpdGlvbiwgZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApe1xuICAgIHZhciBsZW5ndGggPSB0aGlzLnRva2Vucy5sZW5ndGgsXG4gICAgICAgIGluZGV4LCB0b2tlbiwgdmFsdWU7XG5cbiAgICBpZiggbGVuZ3RoICYmIHR5cGVvZiBwb3NpdGlvbiA9PT0gJ251bWJlcicgJiYgcG9zaXRpb24gPiAtMSApe1xuICAgICAgICAvLyBDYWxjdWxhdGUgYSB6ZXJvLWJhc2VkIGluZGV4IHN0YXJ0aW5nIGZyb20gdGhlIGVuZCBvZiB0aGUgbGlzdFxuICAgICAgICBpbmRleCA9IGxlbmd0aCAtIHBvc2l0aW9uIC0gMTtcblxuICAgICAgICBpZiggaW5kZXggPiAtMSAmJiBpbmRleCA8IGxlbmd0aCApe1xuICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRva2Vuc1sgaW5kZXggXTtcbiAgICAgICAgICAgIHZhbHVlID0gdG9rZW4udmFsdWU7XG5cbiAgICAgICAgICAgIGlmKCB2YWx1ZSA9PT0gZmlyc3QgfHwgdmFsdWUgPT09IHNlY29uZCB8fCB2YWx1ZSA9PT0gdGhpcmQgfHwgdmFsdWUgPT09IGZvdXJ0aCB8fCAoICFmaXJzdCAmJiAhc2Vjb25kICYmICF0aGlyZCAmJiAhZm91cnRoICkgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdm9pZCAwO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtQcm9ncmFtfSBBIHByb2dyYW0gbm9kZVxuICovXG5idWlsZGVyUHJvdG90eXBlLnByb2dyYW0gPSBmdW5jdGlvbigpe1xuICAgIHZhciBib2R5ID0gW107XG4gICAgLy9jb25zb2xlLmxvZyggJ1BST0dSQU0nICk7XG4gICAgd2hpbGUoIHRydWUgKXtcbiAgICAgICAgaWYoIHRoaXMudG9rZW5zLmxlbmd0aCApe1xuICAgICAgICAgICAgdW5zaGlmdCggYm9keSwgdGhpcy5leHByZXNzaW9uU3RhdGVtZW50KCkgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTm9kZS5Qcm9ncmFtKCBib2R5ICk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLnJhbmdlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCByaWdodCApe1xuICAgIHZhciBsZWZ0O1xuXG4gICAgdGhpcy5leHBlY3QoICcuJyApO1xuICAgIHRoaXMuZXhwZWN0KCAnLicgKTtcblxuICAgIGxlZnQgPSB0aGlzLnBlZWsoKS50eXBlID09PSBHcmFtbWFyLk51bWVyaWNMaXRlcmFsID9cbiAgICAgICAgbGVmdCA9IHRoaXMubGl0ZXJhbCgpIDpcbiAgICAgICAgbnVsbDtcblxuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuUmFuZ2VFeHByZXNzaW9uKCBsZWZ0LCByaWdodCApO1xufTtcblxuYnVpbGRlclByb3RvdHlwZS5yb290RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXkgKXtcbiAgICB0aGlzLmNvbnN1bWUoICd+JyApO1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuUm9vdEV4cHJlc3Npb24oIGtleSApO1xufTtcblxuYnVpbGRlclByb3RvdHlwZS5zZXF1ZW5jZUV4cHJlc3Npb24gPSBmdW5jdGlvbiggbGlzdCApe1xuICAgIHJldHVybiBuZXcgTm9kZS5TZXF1ZW5jZUV4cHJlc3Npb24oIGxpc3QgKTtcbn07IiwiaW1wb3J0IGhhc093blByb3BlcnR5IGZyb20gJy4vaGFzLW93bi1wcm9wZXJ0eSc7XG5pbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0IG1hcCBmcm9tICcuL21hcCc7XG5pbXBvcnQgKiBhcyBTeW50YXggZnJvbSAnLi9zeW50YXgnO1xuaW1wb3J0ICogYXMgS2V5cGF0aFN5bnRheCBmcm9tICcuL2tleXBhdGgtc3ludGF4JztcblxudmFyIG5vb3AgPSBmdW5jdGlvbigpe30sXG5cbiAgICBpbnRlcnByZXRlclByb3RvdHlwZTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gSW50ZXJwcmV0ZXJ+Z2V0dGVyXG4gKiBAcGFyYW0ge2V4dGVybmFsOk9iamVjdH0gb2JqZWN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30ga2V5XG4gKiBAcmV0dXJucyB7Kn0gVGhlIHZhbHVlIG9mIHRoZSAna2V5JyBwcm9wZXJ0eSBvbiAnb2JqZWN0Jy5cbiAqL1xuZnVuY3Rpb24gZ2V0dGVyKCBvYmplY3QsIGtleSApe1xuICAgIHJldHVybiBvYmplY3RbIGtleSBdO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBJbnRlcnByZXRlcn5yZXR1cm5WYWx1ZVxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGRlcHRoXG4gKiBAcmV0dXJucyB7KnxleHRlcm5hbDpPYmplY3R9IFRoZSBkZWNpZGVkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIHJldHVyblZhbHVlKCB2YWx1ZSwgZGVwdGggKXtcbiAgICByZXR1cm4gIWRlcHRoID8gdmFsdWUgOiB7fTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gSW50ZXJwcmV0ZXJ+cmV0dXJuWmVyb1xuICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gemVyb1xuICovXG5mdW5jdGlvbiByZXR1cm5aZXJvKCl7XG4gICAgcmV0dXJuIDA7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEludGVycHJldGVyfnNldHRlclxuICogQHBhcmFtIHtleHRlcm5hbDpPYmplY3R9IG9iamVjdFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGtleVxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybnMgeyp9IFRoZSB2YWx1ZSBvZiB0aGUgJ2tleScgcHJvcGVydHkgb24gJ29iamVjdCcuXG4gKi9cbmZ1bmN0aW9uIHNldHRlciggb2JqZWN0LCBrZXksIHZhbHVlICl7XG4gICAgaWYoICFoYXNPd25Qcm9wZXJ0eSggb2JqZWN0LCBrZXkgKSApe1xuICAgICAgICBvYmplY3RbIGtleSBdID0gdmFsdWUgfHwge307XG4gICAgfVxuICAgIHJldHVybiBnZXR0ZXIoIG9iamVjdCwga2V5ICk7XG59XG5cbi8qKlxuICogQGNsYXNzIEludGVycHJldGVyXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge0J1aWxkZXJ9IGJ1aWxkZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSW50ZXJwcmV0ZXIoIGJ1aWxkZXIgKXtcbiAgICBpZiggIWFyZ3VtZW50cy5sZW5ndGggKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2J1aWxkZXIgY2Fubm90IGJlIHVuZGVmaW5lZCcgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfSBJbnRlcnByZXRlciNidWlsZGVyXG4gICAgICovXG4gICAgdGhpcy5idWlsZGVyID0gYnVpbGRlcjtcbn1cblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUgPSBJbnRlcnByZXRlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEludGVycHJldGVyO1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5hcnJheUV4cHJlc3Npb24gPSBmdW5jdGlvbiggZWxlbWVudHMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQVJSQVkgRVhQUkVTU0lPTicsIGVsZW1lbnRzLmxlbmd0aCApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGRlcHRoID0gaW50ZXJwcmV0ZXIuZGVwdGgsXG4gICAgICAgIGxpc3Q7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIGVsZW1lbnRzICkgKXtcbiAgICAgICAgbGlzdCA9IG1hcCggZWxlbWVudHMsIGZ1bmN0aW9uKCBlbGVtZW50ICl7XG4gICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIubGlzdEV4cHJlc3Npb25FbGVtZW50KCBlbGVtZW50LCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBBUlJBWSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiBMSVNUJywgbGlzdCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiBERVBUSCcsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSByZXR1cm5WYWx1ZSggYXNzaWdubWVudCwgZGVwdGggKSxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIGxpc3QsIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIHNjb3BlLCBleHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICksIHZhbHVlICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgcmVzdWx0Lmxlbmd0aCA9PT0gMSAmJiAoIHJlc3VsdCA9IHJlc3VsdFsgMCBdICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQXJyYXlFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdCA9IGludGVycHJldGVyLnJlY3Vyc2UoIGVsZW1lbnRzLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQVJSQVkgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24gTElTVCcsIGxpc3QubmFtZSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiBERVBUSCcsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIga2V5cyA9IGxpc3QoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1hcCgga2V5cywgZnVuY3Rpb24oIGtleSApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzaWduKCBzY29wZSwga2V5LCB2YWx1ZSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5ibG9ja0V4cHJlc3Npb24gPSBmdW5jdGlvbiggdG9rZW5zLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIEJMT0NLJywgdG9rZW5zLmpvaW4oICcnICkgKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBwcm9ncmFtID0gaW50ZXJwcmV0ZXIuYnVpbGRlci5idWlsZCggdG9rZW5zICksXG4gICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5yZWN1cnNlKCBwcm9ncmFtLmJvZHlbIDAgXS5leHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUJsb2NrRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIEJMT0NLJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQmxvY2tFeHByZXNzaW9uIFNDT1BFJywgc2NvcGUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUJsb2NrRXhwcmVzc2lvbiBFWFBSRVNTSU9OJywgZXhwcmVzc2lvbi5uYW1lICk7XG4gICAgICAgIHZhciByZXN1bHQgPSBleHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVCbG9ja0V4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogc2NvcGUsIG5hbWU6IHZvaWQgMCwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuY2FsbEV4cHJlc3Npb24gPSBmdW5jdGlvbiggY2FsbGVlLCBhcmdzLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIENBTEwgRVhQUkVTU0lPTicgKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBpc1NldHRpbmcgPSBhc3NpZ24gPT09IHNldHRlcixcbiAgICAgICAgbGVmdCA9IGludGVycHJldGVyLnJlY3Vyc2UoIGNhbGxlZSwgdHJ1ZSwgYXNzaWduICksXG4gICAgICAgIGxpc3QgPSBtYXAoIGFyZ3MsIGZ1bmN0aW9uKCBhcmcgKXtcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlci5saXN0RXhwcmVzc2lvbkVsZW1lbnQoIGFyZywgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICB9ICk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUNhbGxFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQ0FMTCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ2FsbEV4cHJlc3Npb24gYXJncycsIGFyZ3MubGVuZ3RoICk7XG4gICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICksXG4gICAgICAgICAgICBhcmdzID0gbWFwKCBsaXN0LCBmdW5jdGlvbiggYXJnICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZyggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApO1xuICAgICAgICAgICAgfSApLFxuICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ2FsbEV4cHJlc3Npb24gTEhTJywgbGhzICk7XG4gICAgICAgIHJlc3VsdCA9IGxocy52YWx1ZS5hcHBseSggbGhzLmNvbnRleHQsIGFyZ3MgKTtcbiAgICAgICAgaWYoIGlzU2V0dGluZyAmJiB0eXBlb2YgbGhzLnZhbHVlID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnY2Fubm90IGNyZWF0ZSBjYWxsIGV4cHJlc3Npb25zJyApO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDYWxsRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH06XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZXhwcmVzc2lvblxuICovXG5pbnRlcnByZXRlclByb3RvdHlwZS5jb21waWxlID0gZnVuY3Rpb24oIGV4cHJlc3Npb24sIGNyZWF0ZSApe1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIHByb2dyYW0gPSBpbnRlcnByZXRlci5idWlsZGVyLmJ1aWxkKCBleHByZXNzaW9uICksXG4gICAgICAgIGJvZHkgPSBwcm9ncmFtLmJvZHksXG5cbiAgICAgICAgYXNzaWduLCBleHByZXNzaW9ucztcblxuICAgIGludGVycHJldGVyLmRlcHRoID0gLTE7XG4gICAgaW50ZXJwcmV0ZXIuaXNTcGxpdCA9IGludGVycHJldGVyLmlzTGVmdFNwbGl0ID0gaW50ZXJwcmV0ZXIuaXNSaWdodFNwbGl0ID0gZmFsc2U7XG5cbiAgICBpZiggdHlwZW9mIGNyZWF0ZSAhPT0gJ2Jvb2xlYW4nICl7XG4gICAgICAgIGNyZWF0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGFzc2lnbiA9IGNyZWF0ZSA/XG4gICAgICAgIHNldHRlciA6XG4gICAgICAgIGdldHRlcjtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKi9cbiAgICBpbnRlcnByZXRlci5leHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuYnVpbGRlci50ZXh0O1xuICAgIC8vY29uc29sZS5sb2coICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyApO1xuICAgIC8vY29uc29sZS5sb2coICdJbnRlcnByZXRpbmcnICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJ1Byb2dyYW0nLCBwcm9ncmFtLnJhbmdlICk7XG4gICAgc3dpdGNoKCBib2R5Lmxlbmd0aCApe1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICByZXR1cm4gbm9vcDtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgcmV0dXJuIGludGVycHJldGVyLnJlY3Vyc2UoIGJvZHlbIDAgXS5leHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBleHByZXNzaW9ucyA9IG1hcCggYm9keSwgZnVuY3Rpb24oIHN0YXRlbWVudCApe1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlci5yZWN1cnNlKCBzdGF0ZW1lbnQuZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVQcm9ncmFtKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlcyA9IG1hcCggZXhwcmVzc2lvbnMsIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlc1sgdmFsdWVzLmxlbmd0aCAtIDEgXTtcbiAgICAgICAgICAgIH07XG4gICAgfVxufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuY29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uID0gZnVuY3Rpb24oIG9iamVjdCwgcHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQ09NUFVURUQgTUVNQkVSIEVYUFJFU1NJT04nLCBvYmplY3QudHlwZSwgcHJvcGVydHkudHlwZSApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGRlcHRoID0gaW50ZXJwcmV0ZXIuZGVwdGgsXG4gICAgICAgIGlzU2FmZSA9IG9iamVjdC50eXBlID09PSBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbixcbiAgICAgICAgbGVmdCA9IGludGVycHJldGVyLnJlY3Vyc2UoIG9iamVjdCwgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICByaWdodCA9IGludGVycHJldGVyLnJlY3Vyc2UoIHByb3BlcnR5LCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIENPTVBVVEVEIE1FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIExFRlQgJywgbGVmdC5uYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUklHSFQnLCByaWdodC5uYW1lICk7XG4gICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICksXG4gICAgICAgICAgICB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgcmVzdWx0LCByaHM7XG4gICAgICAgIGlmKCAhaXNTYWZlIHx8IGxocyApe1xuICAgICAgICAgICAgcmhzID0gcmlnaHQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gREVQVEgnLCBkZXB0aCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBMSFMnLCBsaHMgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkhTJywgcmhzICk7XG4gICAgICAgICAgICBpZiggIWludGVycHJldGVyLmlzU3BsaXQgKXtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIGxocywgcmhzLCB2YWx1ZSApO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCBpbnRlcnByZXRlci5pc0xlZnRTcGxpdCAmJiAhaW50ZXJwcmV0ZXIuaXNSaWdodFNwbGl0ICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbWFwKCBsaHMsIGZ1bmN0aW9uKCBvYmplY3QgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbiggb2JqZWN0LCByaHMsIHZhbHVlICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCAhaW50ZXJwcmV0ZXIuaXNMZWZ0U3BsaXQgJiYgaW50ZXJwcmV0ZXIuaXNSaWdodFNwbGl0ICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbWFwKCByaHMsIGZ1bmN0aW9uKCBrZXkgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbiggbGhzLCBrZXksIHZhbHVlICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIGxocywgZnVuY3Rpb24oIG9iamVjdCApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWFwKCByaHMsIGZ1bmN0aW9uKCBrZXkgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIG9iamVjdCwga2V5LCB2YWx1ZSApO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogbGhzLCBuYW1lOiByaHMsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmV4aXN0ZW50aWFsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBleHByZXNzaW9uLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIEVYSVNURU5USUFMIEVYUFJFU1NJT04nLCBleHByZXNzaW9uLnR5cGUgKTtcbiAgICB2YXIgbGVmdCA9IHRoaXMucmVjdXJzZSggZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVFeGlzdGVudGlhbEV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBFWElTVEVOVElBTCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlRXhpc3RlbnRpYWxFeHByZXNzaW9uIExFRlQnLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgaWYoIHNjb3BlICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGxlZnQoIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGUgKXtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB2b2lkIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUV4aXN0ZW50aWFsRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5pZGVudGlmaWVyID0gZnVuY3Rpb24oIG5hbWUsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgSURFTlRJRklFUicsIG5hbWUgKTtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmRlcHRoO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVJZGVudGlmaWVyKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgSURFTlRJRklFUicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUlkZW50aWZpZXIgTkFNRScsIG5hbWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUlkZW50aWZpZXIgVkFMVUUnLCB2YWx1ZSApO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXR1cm5WYWx1ZSggYXNzaWdubWVudCwgZGVwdGggKSxcbiAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggc2NvcGUsIG5hbWUsIHZhbHVlICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVJZGVudGlmaWVyIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IHNjb3BlLCBuYW1lOiBuYW1lLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5saXN0RXhwcmVzc2lvbkVsZW1lbnQgPSBmdW5jdGlvbiggZWxlbWVudCwgY29udGV4dCwgYXNzaWduICl7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcztcblxuICAgIHN3aXRjaCggZWxlbWVudC50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LkxpdGVyYWw6XG4gICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIubGl0ZXJhbCggZWxlbWVudC52YWx1ZSwgY29udGV4dCApO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlci5sb29rdXBFeHByZXNzaW9uKCBlbGVtZW50LmtleSwgZmFsc2UsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIucm9vdEV4cHJlc3Npb24oIGVsZW1lbnQua2V5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LkJsb2NrRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlci5ibG9ja0V4cHJlc3Npb24oIGVsZW1lbnQuYm9keSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoICdVbmV4cGVjdGVkIGxpc3QgZWxlbWVudCB0eXBlOiAnICsgZWxlbWVudC50eXBlICk7XG4gICAgfVxufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUubGl0ZXJhbCA9IGZ1bmN0aW9uKCB2YWx1ZSwgY29udGV4dCApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgTElURVJBTCcsIHZhbHVlICk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVMaXRlcmFsKCl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgTElURVJBTCcgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUxpdGVyYWwgUkVTVUxUJywgdmFsdWUgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiB2b2lkIDAsIG5hbWU6IHZvaWQgMCwgdmFsdWU6IHZhbHVlIH0gOlxuICAgICAgICAgICAgdmFsdWU7XG4gICAgfTtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmxvb2t1cEV4cHJlc3Npb24gPSBmdW5jdGlvbigga2V5LCByZXNvbHZlLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIExPT0tVUCBFWFBSRVNTSU9OJywga2V5ICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgaXNDb21wdXRlZCA9IGZhbHNlLFxuICAgICAgICBsaHMgPSB7fSxcbiAgICAgICAgbGVmdDtcblxuICAgIHN3aXRjaCgga2V5LnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGxlZnQgPSBpbnRlcnByZXRlci5pZGVudGlmaWVyKCBrZXkubmFtZSwgdHJ1ZSwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguTGl0ZXJhbDpcbiAgICAgICAgICAgIGlzQ29tcHV0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgbGhzLnZhbHVlID0gbGVmdCA9IGtleS52YWx1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGVmdCA9IGludGVycHJldGVyLnJlY3Vyc2UoIGtleSwgdHJ1ZSwgYXNzaWduICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVMb29rdXBFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgTE9PS1VQIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVMb29rdXBFeHByZXNzaW9uIExFRlQnLCBsZWZ0Lm5hbWUgfHwgbGVmdCApO1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiggIWlzQ29tcHV0ZWQgKXtcbiAgICAgICAgICAgIGxocyA9IGxlZnQoIGxvb2t1cCwgYXNzaWdubWVudCwgc2NvcGUgKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGxocy52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggbG9va3VwLCBsaHMudmFsdWUsIHZvaWQgMCApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlc29sdmUgbG9va3VwcyB0aGF0IGFyZSB0aGUgb2JqZWN0IG9mIGFuIG9iamVjdC1wcm9wZXJ0eSByZWxhdGlvbnNoaXBcbiAgICAgICAgaWYoIHJlc29sdmUgKXtcbiAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggc2NvcGUsIHJlc3VsdCwgdm9pZCAwICk7XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZUxvb2t1cEV4cHJlc3Npb24gTEhTJywgbGhzICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVMb29rdXBFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCAgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBsb29rdXAsIG5hbWU6IGxocy52YWx1ZSwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUucmFuZ2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIGxvd2VyQm91bmQsIHVwcGVyQm91bmQsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgUkFOR0UgRVhQUkVTU0lPTicgKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBsZWZ0ID0gbG93ZXJCb3VuZCAhPT0gbnVsbCA/XG4gICAgICAgICAgICBpbnRlcnByZXRlci5yZWN1cnNlKCBsb3dlckJvdW5kLCBmYWxzZSwgYXNzaWduICkgOlxuICAgICAgICAgICAgcmV0dXJuWmVybyxcbiAgICAgICAgcmlnaHQgPSB1cHBlckJvdW5kICE9PSBudWxsID9cbiAgICAgICAgICAgIGludGVycHJldGVyLnJlY3Vyc2UoIHVwcGVyQm91bmQsIGZhbHNlLCBhc3NpZ24gKSA6XG4gICAgICAgICAgICByZXR1cm5aZXJvLFxuICAgICAgICBpbmRleCwgbGhzLCBtaWRkbGUsIHJlc3VsdCwgcmhzO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVSYW5nZUV4cHJlc3Npb24oIHNjb3BlLCBhc3NpZ25tZW50LCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBSQU5HRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlUmFuZ2VFeHByZXNzaW9uIExFRlQnLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiBSSUdIVCcsIHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgbGhzID0gbGVmdCggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApO1xuICAgICAgICByaHMgPSByaWdodCggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApO1xuICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgaW5kZXggPSAxO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlUmFuZ2VFeHByZXNzaW9uIExIUycsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlUmFuZ2VFeHByZXNzaW9uIFJIUycsIHJocyApO1xuICAgICAgICByZXN1bHRbIDAgXSA9IGxocztcbiAgICAgICAgaWYoIGxocyA8IHJocyApe1xuICAgICAgICAgICAgbWlkZGxlID0gbGhzICsgMTtcbiAgICAgICAgICAgIHdoaWxlKCBtaWRkbGUgPCByaHMgKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4KysgXSA9IG1pZGRsZSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYoIGxocyA+IHJocyApe1xuICAgICAgICAgICAgbWlkZGxlID0gbGhzIC0gMTtcbiAgICAgICAgICAgIHdoaWxlKCBtaWRkbGUgPiByaHMgKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4KysgXSA9IG1pZGRsZS0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdFsgcmVzdWx0Lmxlbmd0aCBdID0gcmhzO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlUmFuZ2VFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbmludGVycHJldGVyUHJvdG90eXBlLnJlY3Vyc2UgPSBmdW5jdGlvbiggbm9kZSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ1JlY3Vyc2luZycsIG5vZGUudHlwZSApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGV4cHJlc3Npb24gPSBudWxsO1xuXG4gICAgaW50ZXJwcmV0ZXIuZGVwdGgrKztcblxuICAgIHN3aXRjaCggbm9kZS50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LkFycmF5RXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5hcnJheUV4cHJlc3Npb24oIG5vZGUuZWxlbWVudHMsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgaW50ZXJwcmV0ZXIuaXNTcGxpdCA9IGludGVycHJldGVyLmlzTGVmdFNwbGl0ID0gbm9kZS5lbGVtZW50cy5sZW5ndGggPiAxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LkNhbGxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmNhbGxFeHByZXNzaW9uKCBub2RlLmNhbGxlZSwgbm9kZS5hcmd1bWVudHMsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5CbG9ja0V4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuYmxvY2tFeHByZXNzaW9uKCBub2RlLmJvZHksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuZXhpc3RlbnRpYWxFeHByZXNzaW9uKCBub2RlLmV4cHJlc3Npb24sIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LklkZW50aWZpZXI6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuaWRlbnRpZmllciggbm9kZS5uYW1lLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5MaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmxpdGVyYWwoIG5vZGUudmFsdWUsIGNvbnRleHQgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5NZW1iZXJFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IG5vZGUuY29tcHV0ZWQgP1xuICAgICAgICAgICAgICAgIGludGVycHJldGVyLmNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggbm9kZS5vYmplY3QsIG5vZGUucHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApIDpcbiAgICAgICAgICAgICAgICBpbnRlcnByZXRlci5zdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBub2RlLm9iamVjdCwgbm9kZS5wcm9wZXJ0eSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIubG9va3VwRXhwcmVzc2lvbiggbm9kZS5rZXksIGZhbHNlLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguUmFuZ2VFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLnJhbmdlRXhwcmVzc2lvbiggbm9kZS5sZWZ0LCBub2RlLnJpZ2h0LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIucm9vdEV4cHJlc3Npb24oIG5vZGUua2V5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5TZXF1ZW5jZUV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuc2VxdWVuY2VFeHByZXNzaW9uKCBub2RlLmV4cHJlc3Npb25zLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGludGVycHJldGVyLmlzU3BsaXQgPSBpbnRlcnByZXRlci5pc1JpZ2h0U3BsaXQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoICdVbmtub3duIG5vZGUgdHlwZTogJyArIG5vZGUudHlwZSApO1xuICAgIH1cblxuICAgIGludGVycHJldGVyLmRlcHRoLS07XG5cbiAgICByZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLnJvb3RFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBST09UIEVYUFJFU1NJT04nICk7XG4gICAgdmFyIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIGtleSwgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVSb290RXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFJPT1QgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVJvb3RFeHByZXNzaW9uIExFRlQnLCBsZWZ0Lm5hbWUgfHwgbGVmdCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlUm9vdEV4cHJlc3Npb24gU0NPUEUnLCBzY29wZSApO1xuICAgICAgICB2YXIgcmVzdWx0ID0gbGVmdCggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlUm9vdEV4cHJlc3Npb24gTEhTJywgbGhzICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVSb290RXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogbG9va3VwLCBuYW1lOiByZXN1bHQudmFsdWUsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLnNlcXVlbmNlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBleHByZXNzaW9ucywgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBTRVFVRU5DRSBFWFBSRVNTSU9OJywgZXhwcmVzc2lvbnMubGVuZ3RoICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgZGVwdGggPSBpbnRlcnByZXRlci5kZXB0aCxcbiAgICAgICAgbGlzdDtcbiAgICBpZiggQXJyYXkuaXNBcnJheSggZXhwcmVzc2lvbnMgKSApe1xuICAgICAgICBsaXN0ID0gbWFwKCBleHByZXNzaW9ucywgZnVuY3Rpb24oIGV4cHJlc3Npb24gKXtcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlci5saXN0RXhwcmVzc2lvbkVsZW1lbnQoIGV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFNFUVVFTkNFIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uIExJU1QnLCBsaXN0ICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uIERFUFRIJywgZGVwdGggKTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1hcCggbGlzdCwgZnVuY3Rpb24oIGV4cHJlc3Npb24gKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiBSRVNVTFQnLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3QgPSBpbnRlcnByZXRlci5yZWN1cnNlKCBleHByZXNzaW9ucywgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uKCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFNFUVVFTkNFIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uIExJU1QnLCBsaXN0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb24gREVQVEgnLCBkZXB0aCApO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gcmV0dXJuVmFsdWUoIGFzc2lnbm1lbnQsIGRlcHRoICksXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbGlzdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb24gUkVTVUxUJywgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5zdGF0aWNNZW1iZXJFeHByZXNzaW9uID0gZnVuY3Rpb24oIG9iamVjdCwgcHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgU1RBVElDIE1FTUJFUiBFWFBSRVNTSU9OJywgb2JqZWN0LnR5cGUsIHByb3BlcnR5LnR5cGUgKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBkZXB0aCA9IGludGVycHJldGVyLmRlcHRoLFxuICAgICAgICBpc0NvbXB1dGVkID0gZmFsc2UsXG4gICAgICAgIGlzU2FmZSA9IGZhbHNlLFxuICAgICAgICBsZWZ0LCByaHMsIHJpZ2h0O1xuXG4gICAgc3dpdGNoKCBvYmplY3QudHlwZSApe1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGxlZnQgPSBpbnRlcnByZXRlci5sb29rdXBFeHByZXNzaW9uKCBvYmplY3Qua2V5LCB0cnVlLCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGlzU2FmZSA9IHRydWU7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZWZ0ID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggb2JqZWN0LCBmYWxzZSwgYXNzaWduICk7XG4gICAgfVxuXG4gICAgc3dpdGNoKCBwcm9wZXJ0eS50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LklkZW50aWZpZXI6XG4gICAgICAgICAgICBpc0NvbXB1dGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJocyA9IHJpZ2h0ID0gcHJvcGVydHkubmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmlnaHQgPSBpbnRlcnByZXRlci5yZWN1cnNlKCBwcm9wZXJ0eSwgZmFsc2UsIGFzc2lnbiApO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiggc2NvcGUsIGFzc2lnbm1lbnQsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFNUQVRJQyBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gTEVGVCcsIGxlZnQubmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiBSSUdIVCcsIHJocyB8fCByaWdodC5uYW1lICk7XG4gICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgYXNzaWdubWVudCwgbG9va3VwICksXG4gICAgICAgICAgICB2YWx1ZSA9IHJldHVyblZhbHVlKCBhc3NpZ25tZW50LCBkZXB0aCApLFxuICAgICAgICAgICAgcmVzdWx0O1xuXG4gICAgICAgIGlmKCAhaXNTYWZlIHx8IGxocyApe1xuICAgICAgICAgICAgaWYoICFpc0NvbXB1dGVkICl7XG4gICAgICAgICAgICAgICAgcmhzID0gcmlnaHQoIHByb3BlcnR5LnR5cGUgPT09IEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb24gPyBzY29wZSA6IGxocywgYXNzaWdubWVudCwgbG9va3VwICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiBMSFMnLCBsaHMgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIFJIUycsIHJocyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gREVQVEgnLCBkZXB0aCApO1xuICAgICAgICAgICAgcmVzdWx0ID0gaW50ZXJwcmV0ZXIuaXNTcGxpdCA/XG4gICAgICAgICAgICAgICAgbWFwKCBsaHMsIGZ1bmN0aW9uKCBvYmplY3QgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbiggb2JqZWN0LCByaHMsIHZhbHVlICk7XG4gICAgICAgICAgICAgICAgfSApIDpcbiAgICAgICAgICAgICAgICBhc3NpZ24oIGxocywgcmhzLCB2YWx1ZSApO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIFJFU1VMVCcsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxocywgbmFtZTogcmhzLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59OyIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgTGV4ZXIgZnJvbSAnLi9sZXhlcic7XG5pbXBvcnQgQnVpbGRlciBmcm9tICcuL2J1aWxkZXInO1xuaW1wb3J0IEludGVycHJldGVyIGZyb20gJy4vaW50ZXJwcmV0ZXInO1xuaW1wb3J0IGhhc093blByb3BlcnR5IGZyb20gJy4vaGFzLW93bi1wcm9wZXJ0eSc7XG5cbnZhciBsZXhlciA9IG5ldyBMZXhlcigpLFxuICAgIGJ1aWxkZXIgPSBuZXcgQnVpbGRlciggbGV4ZXIgKSxcbiAgICBpbnRyZXByZXRlciA9IG5ldyBJbnRlcnByZXRlciggYnVpbGRlciApLFxuXG4gICAgY2FjaGUgPSBuZXcgTnVsbCgpLFxuXG4gICAgZXhwUHJvdG90eXBlO1xuXG4vKipcbiAqIEBjbGFzcyBLZXlwYXRoRXhwXG4gKiBAZXh0ZW5kcyBUcmFuc2R1Y2VyXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gcGF0dGVyblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGZsYWdzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEtleXBhdGhFeHAoIHBhdHRlcm4sIGZsYWdzICl7XG4gICAgdHlwZW9mIHBhdHRlcm4gIT09ICdzdHJpbmcnICYmICggcGF0dGVybiA9ICcnICk7XG4gICAgdHlwZW9mIGZsYWdzICE9PSAnc3RyaW5nJyAmJiAoIGZsYWdzID0gJycgKTtcblxuICAgIHZhciB0b2tlbnMgPSBoYXNPd25Qcm9wZXJ0eSggY2FjaGUsIHBhdHRlcm4gKSA/XG4gICAgICAgICAgICBjYWNoZVsgcGF0dGVybiBdIDpcbiAgICAgICAgICAgIGNhY2hlWyBwYXR0ZXJuIF0gPSBsZXhlci5sZXgoIHBhdHRlcm4gKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCB0aGlzLCB7XG4gICAgICAgICdmbGFncyc6IHtcbiAgICAgICAgICAgIHZhbHVlOiBmbGFncyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICdzb3VyY2UnOiB7XG4gICAgICAgICAgICB2YWx1ZTogcGF0dGVybixcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICdnZXR0ZXInOiB7XG4gICAgICAgICAgICB2YWx1ZTogaW50cmVwcmV0ZXIuY29tcGlsZSggdG9rZW5zLCBmYWxzZSApLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICdzZXR0ZXInOiB7XG4gICAgICAgICAgICB2YWx1ZTogaW50cmVwcmV0ZXIuY29tcGlsZSggdG9rZW5zLCB0cnVlICksXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfVxuICAgIH0gKTtcbn1cblxuZXhwUHJvdG90eXBlID0gS2V5cGF0aEV4cC5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5leHBQcm90b3R5cGUuY29uc3RydWN0b3IgPSBLZXlwYXRoRXhwO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5leHBQcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oIHRhcmdldCwgbG9va3VwICl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0dGVyKCB0YXJnZXQsIHVuZGVmaW5lZCwgbG9va3VwICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5leHBQcm90b3R5cGUuaGFzID0gZnVuY3Rpb24oIHRhcmdldCwgbG9va3VwICl7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuZ2V0dGVyKCB0YXJnZXQsIHVuZGVmaW5lZCwgbG9va3VwICk7XG4gICAgcmV0dXJuIHR5cGVvZiByZXN1bHQgIT09ICd1bmRlZmluZWQnO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwUHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKCB0YXJnZXQsIHZhbHVlLCBsb29rdXAgKXtcbiAgICByZXR1cm4gdGhpcy5zZXR0ZXIoIHRhcmdldCwgdmFsdWUsIGxvb2t1cCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwUHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi5mbGFncyA9IHRoaXMuZmxhZ3M7XG4gICAganNvbi5zb3VyY2UgPSB0aGlzLnNvdXJjZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2U7XG59OyJdLCJuYW1lcyI6WyJFbmRPZkxpbmUiLCJJZGVudGlmaWVyIiwiTnVtZXJpY0xpdGVyYWwiLCJOdWxsTGl0ZXJhbCIsIlB1bmN0dWF0b3IiLCJTdHJpbmdMaXRlcmFsIiwiR3JhbW1hci5FbmRPZkxpbmUiLCJHcmFtbWFyLklkZW50aWZpZXIiLCJHcmFtbWFyLk51bWVyaWNMaXRlcmFsIiwiR3JhbW1hci5OdWxsTGl0ZXJhbCIsIkdyYW1tYXIuUHVuY3R1YXRvciIsIkdyYW1tYXIuU3RyaW5nTGl0ZXJhbCIsIkNoYXJhY3Rlci5pc0lkZW50aWZpZXJQYXJ0IiwiQ2hhcmFjdGVyLmlzTnVtZXJpYyIsIlRva2VuLkVuZE9mTGluZSIsIkNoYXJhY3Rlci5pc0lkZW50aWZpZXJTdGFydCIsIlRva2VuLk51bGxMaXRlcmFsIiwiVG9rZW4uSWRlbnRpZmllciIsIkNoYXJhY3Rlci5pc1B1bmN0dWF0b3IiLCJUb2tlbi5QdW5jdHVhdG9yIiwiQ2hhcmFjdGVyLmlzUXVvdGUiLCJDaGFyYWN0ZXIuaXNEb3VibGVRdW90ZSIsIkNoYXJhY3Rlci5pc1NpbmdsZVF1b3RlIiwiVG9rZW4uU3RyaW5nTGl0ZXJhbCIsIlRva2VuLk51bWVyaWNMaXRlcmFsIiwiQ2hhcmFjdGVyLmlzV2hpdGVzcGFjZSIsIkFycmF5RXhwcmVzc2lvbiIsIkNhbGxFeHByZXNzaW9uIiwiRXhwcmVzc2lvblN0YXRlbWVudCIsIkxpdGVyYWwiLCJNZW1iZXJFeHByZXNzaW9uIiwiUHJvZ3JhbSIsIlNlcXVlbmNlRXhwcmVzc2lvbiIsIlN5bnRheC5MaXRlcmFsIiwiU3ludGF4Lk1lbWJlckV4cHJlc3Npb24iLCJTeW50YXguUHJvZ3JhbSIsIlN5bnRheC5BcnJheUV4cHJlc3Npb24iLCJTeW50YXguQ2FsbEV4cHJlc3Npb24iLCJTeW50YXguRXhwcmVzc2lvblN0YXRlbWVudCIsIlN5bnRheC5JZGVudGlmaWVyIiwiU3ludGF4LlNlcXVlbmNlRXhwcmVzc2lvbiIsIkJsb2NrRXhwcmVzc2lvbiIsIkV4aXN0ZW50aWFsRXhwcmVzc2lvbiIsIkxvb2t1cEV4cHJlc3Npb24iLCJSYW5nZUV4cHJlc3Npb24iLCJSb290RXhwcmVzc2lvbiIsIlNjb3BlRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5SYW5nZUV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uIiwiTm9kZS5BcnJheUV4cHJlc3Npb24iLCJLZXlwYXRoTm9kZS5CbG9ja0V4cHJlc3Npb24iLCJOb2RlLkNhbGxFeHByZXNzaW9uIiwiS2V5cGF0aE5vZGUuRXhpc3RlbnRpYWxFeHByZXNzaW9uIiwiTm9kZS5FeHByZXNzaW9uU3RhdGVtZW50IiwiTm9kZS5JZGVudGlmaWVyIiwiTm9kZS5OdW1lcmljTGl0ZXJhbCIsIk5vZGUuU3RyaW5nTGl0ZXJhbCIsIk5vZGUuTnVsbExpdGVyYWwiLCJLZXlwYXRoTm9kZS5Mb29rdXBFeHByZXNzaW9uIiwiTm9kZS5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24iLCJOb2RlLlN0YXRpY01lbWJlckV4cHJlc3Npb24iLCJOb2RlLlByb2dyYW0iLCJLZXlwYXRoTm9kZS5SYW5nZUV4cHJlc3Npb24iLCJLZXlwYXRoTm9kZS5Sb290RXhwcmVzc2lvbiIsIk5vZGUuU2VxdWVuY2VFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5CbG9ja0V4cHJl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
