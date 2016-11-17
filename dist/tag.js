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
    return char === '"' || char === "'";
}

function isWhitespace( char ){
    return char === ' ' || char === '\r' || char === '\t' || char === '\n' || char === '\v' || char === '\u00A0';
}

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
 * @class Lexer
 * @extends Null
 */
function Lexer(){
    /**
     * @member {external:string}
     * @default ''
     */
    this.source = '';
    /**
     * @member {external:number}
     */
    this.index = 0;
    /**
     * @member {external:number}
     */
    this.length = 0;
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
    // Reset the index and tokens
    if( this.index ){
        this.index = 0;
        this.tokens = [];
    }

    this.source = text;
    this.length = text.length;

    var word = '',
        char, token, quote;

    while( !this.eol() ){
        char = this.source[ this.index ];

        // Identifier
        if( isIdentifierStart( char ) ){
            word = this.read( function( char ){
                return !isIdentifierPart( char );
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
 * @returns {external:boolean} Whether or not the lexer is at the end of the line
 */
lexerPrototype.eol = function(){
    return this.index >= this.length;
};

/**
 * @function
 * @param {external:function} until A condition that when met will stop the reading of the buffer
 * @returns {external:string} The portion of the buffer read
 */
lexerPrototype.read = function( until ){
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
 * @returns {external:Object} A JSON representation of the lexer
 */
lexerPrototype.toJSON = function(){
    var json = new Null();

    json.source = this.source;
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
    return this.source;
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
        this.throwError( 'Identifier expected' );
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

/**
 * @function
 * @param {external:string} message The error message
 * @throws {external:SyntaxError} When it executes
 */
builderPrototype.throwError = function( message ){
    throw new SyntaxError( message );
};

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
    var index = 0,
        length = list.length,
        result = new Array( length );

    switch( length ){
        case 0:
            break;
        case 1:
            result[ 0 ] = callback( list[ 0 ], 0, list );
            break;
        case 2:
            result[ 0 ] = callback( list[ 0 ], 0, list );
            result[ 1 ] = callback( list[ 1 ], 1, list );
            break;
        case 3:
            result[ 0 ] = callback( list[ 0 ], 0, list );
            result[ 1 ] = callback( list[ 1 ], 1, list );
            result[ 2 ] = callback( list[ 2 ], 2, list );
            break;
        default:
            for( ; index < length; index++ ){
                result[ index ] = callback( list[ index ], index, list );
            }
            break;
    }

    return result;
}

var noop = function(){};
var interpreterPrototype;

/**
 * @function Interpreter~getter
 * @param {external:Object} object
 * @param {external:string} key
 * @returns {*} The value of the `key` property on `object`.
 */
function getter( object, key ){
    return object[ key ];
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
 * @returns {*} The value of the `key` property on `object`.
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
    var depth = this.depth,
        fn, list;

    if( Array.isArray( elements ) ){
        list = this.listExpression( elements, false, assign );

        fn = function executeArrayExpression( scope, value, lookup ){
            //console.log( 'Executing ARRAY EXPRESSION' );
            //console.log( `- executeArrayExpression LIST`, list );
            //console.log( `- executeArrayExpression DEPTH`, depth );
            var key,
                result = map( list, function( expression ){
                    key = expression( scope, value, lookup );
                    return assign( scope, key, !depth ? value : {} );
                } );
            result.length === 1 && ( result = result[ 0 ] );
            //console.log( `- executeArrayExpression RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    } else {
        list = this.recurse( elements, false, assign );

        fn = function executeArrayExpressionWithElementRange( scope, value, lookup ){
            //console.log( 'Executing ARRAY EXPRESSION' );
            //console.log( `- executeArrayExpressionWithElementRange LIST`, list.name );
            //console.log( `- executeArrayExpressionWithElementRange DEPTH`, depth );
            var keys = list( scope, value, lookup ),
                result = map( keys, function( key ){
                    return assign( scope, key, !depth ? value : {} );
                } );
            //console.log( `- executeArrayExpressionWithElementRange RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    }

    return fn;
};

interpreterPrototype.blockExpression = function( tokens, context, assign ){
    //console.log( 'Composing BLOCK', tokens.join( '' ) );
    var program = this.builder.build( tokens ),
        expression = this.recurse( program.body[ 0 ].expression, false, assign );

    return function executeBlockExpression( scope, value, lookup ){
        //console.log( 'Executing BLOCK' );
        //console.log( `- executeBlockExpression SCOPE`, scope );
        //console.log( `- executeBlockExpression EXPRESSION`, expression.name );
        var result = expression( scope, value, lookup );
        //console.log( `- executeBlockExpression RESULT`, result );
        return context ?
            { context: scope, name: void 0, value: result } :
            result;
    };
};

interpreterPrototype.callExpression = function( callee, args, context, assign ){
    //console.log( 'Composing CALL EXPRESSION' );
    var isSetting = assign === setter,
        left = this.recurse( callee, true, assign ),
        list = this.listExpression( args, false, assign );

    return function executeCallExpression( scope, value, lookup ){
        //console.log( 'Executing CALL EXPRESSION' );
        //console.log( `- executeCallExpression args`, args.length );
        var lhs = left( scope, value, lookup ),
            args = map( list, function( expression ){
                return expression( scope, value, lookup );
            } ),
            result;
        //console.log( `- executeCallExpression LHS`, lhs );
        result = lhs.value.apply( lhs.context, args );
        if( isSetting && typeof lhs.value === 'undefined' ){
            throw new TypeError( 'cannot create call expressions' );
        }
        //console.log( `- executeCallExpression RESULT`, result );
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
    var program = this.builder.build( expression ),
        body = program.body,
        interpreter = this,
        assign, expressions, fn;

    if( typeof create !== 'boolean' ){
        create = false;
    }

    interpreter.depth = -1;
    interpreter.isLeftSplit = false;
    interpreter.isRightSplit = false;
    interpreter.isSplit = false;

    assign = create ?
        setter :
        getter;

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
            expressions = map( body, function( statement ){
                return interpreter.recurse( statement.expression, false, assign );
            } );
            fn = function executeProgram( scope, value, lookup ){
                var values = map( expressions, function( expression ){
                        return expression( scope, value, lookup );
                    } );

                return values[ values.length - 1 ];
            };
            break;
    }
    //console.log( 'FN', fn.name );
    return fn;
};

interpreterPrototype.computedMemberExpression = function( object, property, context, assign ){
    //console.log( 'Composing COMPUTED MEMBER EXPRESSION', object.type, property.type );
    var depth = this.depth,
        interpreter = this,
        isSafe = object.type === ExistentialExpression$1,
        left = this.recurse( object, false, assign ),
        right = this.recurse( property, false, assign );

    if( !interpreter.isSplit ){
        return function executeComputedMemberExpression( scope, value, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( `- executeComputedMemberExpression LEFT `, left.name );
            //console.log( `- executeComputedMemberExpression RIGHT`, right.name );
            var lhs = left( scope, value, lookup ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, value, lookup );
                //console.log( `- executeComputedMemberExpression DEPTH`, depth );
                //console.log( `- executeComputedMemberExpression LHS`, lhs );
                //console.log( `- executeComputedMemberExpression RHS`, rhs );
                result = assign( lhs, rhs, !depth ? value : {} );
            }
            //console.log( `- executeComputedMemberExpression RESULT`, result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else if( interpreter.isLeftSplit && !interpreter.isRightSplit ){
        return function executeComputedMemberExpression( scope, value, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( `- executeComputedMemberExpression LEFT `, left.name );
            //console.log( `- executeComputedMemberExpression RIGHT`, right.name );
            var lhs = left( scope, value, lookup ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, value, lookup );
                //console.log( `- executeComputedMemberExpression DEPTH`, depth );
                //console.log( `- executeComputedMemberExpression LHS`, lhs );
                //console.log( `- executeComputedMemberExpression RHS`, rhs );
                result = map( lhs, function( object ){
                    return assign( object, rhs, !depth ? value : {} );
                } );
            }
            //console.log( `- executeComputedMemberExpression RESULT`, result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else if( !interpreter.isLeftSplit && interpreter.isRightSplit ){
        return function executeComputedMemberExpression( scope, value, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( `- executeComputedMemberExpression LEFT `, left.name );
            //console.log( `- executeComputedMemberExpression RIGHT`, right.name );
            var lhs = left( scope, value, lookup ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, value, lookup );
                //console.log( `- executeComputedMemberExpression DEPTH`, depth );
                //console.log( `- executeComputedMemberExpression LHS`, lhs );
                //console.log( `- executeComputedMemberExpression RHS`, rhs );
                result = map( rhs, function( key ){
                    return assign( lhs, key, !depth ? value : {} );
                } );
            }
            //console.log( `- executeComputedMemberExpression RESULT`, result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else {
        return function executeComputedMemberExpression( scope, value, lookup ){
            //console.log( 'Executing COMPUTED MEMBER EXPRESSION' );
            //console.log( `- executeComputedMemberExpression LEFT `, left.name );
            //console.log( `- executeComputedMemberExpression RIGHT`, right.name );
            var lhs = left( scope, value, lookup ),
                result, rhs;
            if( !isSafe || lhs ){
                rhs = right( scope, value, lookup );
                //console.log( `- executeComputedMemberExpression DEPTH`, depth );
                //console.log( `- executeComputedMemberExpression LHS`, lhs );
                //console.log( `- executeComputedMemberExpression RHS`, rhs );
                result = map( lhs, function( object ){
                    return map( rhs, function( key ){
                        return assign( object, key, !depth ? value : {} );
                    } );
                } );
            }
            //console.log( `- executeComputedMemberExpression RESULT`, result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    }
};

interpreterPrototype.existentialExpression = function( expression, context, assign ){
    //console.log( 'Composing EXISTENTIAL EXPRESSION', expression.type );
    var left = this.recurse( expression, false, assign );

    return function executeExistentialExpression( scope, value, lookup ){
        var result;
        //console.log( 'Executing EXISTENTIAL EXPRESSION' );
        //console.log( `- executeExistentialExpression LEFT`, left.name );
        if( scope ){
            try {
                result = left( scope, value, lookup );
            } catch( e ){
                result = void 0;
            }
        }
        //console.log( `- executeExistentialExpression RESULT`, result );
        return context ?
            { value: result } :
            result;
    };
};

interpreterPrototype.identifier = function( name, context, assign ){
    //console.log( 'Composing IDENTIFIER', name );
    var depth = this.depth;

    return function executeIdentifier( scope, value, lookup ){
        //console.log( 'Executing IDENTIFIER' );
        //console.log( `- executeIdentifier NAME`, name );
        //console.log( `- executeIdentifier DEPTH`, depth );
        //console.log( `- executeIdentifier VALUE`, value );
        var result = assign( scope, name, !depth ? value : {} );
        //console.log( `- executeIdentifier RESULT`, result );
        return context ?
            { context: scope, name: name, value: result } :
            result;
    };
};

interpreterPrototype.listExpression = function( items, context, assign ){
    var interpreter = this;
    return map( items, function( item ){
        return interpreter.listExpressionElement( item, context, assign );
    } );
};

interpreterPrototype.listExpressionElement = function( element, context, assign ){
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
            throw new TypeError( 'Unexpected list element type ' + element.type );
    }
};

interpreterPrototype.literal = function( value, context ){
    //console.log( 'Composing LITERAL', value );
    return function executeLiteral(){
        //console.log( 'Executing LITERAL' );
        //console.log( `- executeLiteral RESULT`, value );
        return context ?
            { context: void 0, name: void 0, value: value } :
            value;
    };
};

interpreterPrototype.lookupExpression = function( key, resolve, context, assign ){
    //console.log( 'Composing LOOKUP EXPRESSION', key );
    var isLeftFunction = false,
        lhs = {},
        left;

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

    return function executeLookupExpression( scope, value, lookup ){
        //console.log( 'Executing LOOKUP EXPRESSION' );
        //console.log( `- executeLookupExpression LEFT`, left.name || left );
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
        //console.log( `- executeLookupExpression LHS`, lhs );
        //console.log( `- executeLookupExpression RESULT`, result  );
        return context ?
            { context: lookup, name: lhs.value, value: result } :
            result;
    };
};

interpreterPrototype.rangeExpression = function( lower, upper, context, assign ){
    //console.log( 'Composing RANGE EXPRESSION' );
    var interpreter = this,
        left = lower !== null ?
            interpreter.recurse( lower, false, assign ) :
            returnZero,
        right = upper !== null ?
            interpreter.recurse( upper, false, assign ) :
            returnZero,
        index, lhs, middle, result, rhs;

    return function executeRangeExpression( scope, value, lookup ){
        //console.log( 'Executing RANGE EXPRESSION' );
        //console.log( `- executeRangeExpression LEFT`, left.name );
        //console.log( `- executeRangeExpression RIGHT`, right.name );
        lhs = left( scope, value, lookup );
        rhs = right( scope, value, lookup );
        result = [];
        index = 1;
        //console.log( `- executeRangeExpression LHS`, lhs );
        //console.log( `- executeRangeExpression RHS`, rhs );
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
        //console.log( `- executeRangeExpression RESULT`, result );
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
            throw new TypeError( 'Unknown node type ' + node.type );
    }

    interpreter.depth--;

    return expression;
};

interpreterPrototype.rootExpression = function( key, context, assign ){
    //console.log( 'Composing ROOT EXPRESSION' );
    var left = this.recurse( key, false, assign );

    return function executeRootExpression( scope, value, lookup ){
        //console.log( 'Executing ROOT EXPRESSION' );
        //console.log( `- executeRootExpression LEFT`, left.name || left );
        //console.log( `- executeRootExpression SCOPE`, scope );
        var lhs, result;
        result = lhs = left( scope, value, lookup );
        //console.log( `- executeRootExpression LHS`, lhs );
        //console.log( `- executeRootExpression RESULT`, result  );
        return context ?
            { context: lookup, name: lhs.value, value: result } :
            result;
    };
};

interpreterPrototype.sequenceExpression = function( expressions, context, assign ){
    var fn, list;
    //console.log( 'Composing SEQUENCE EXPRESSION' );
    if( Array.isArray( expressions ) ){
        list = this.listExpression( expressions, false, assign );

        fn = function executeSequenceExpression( scope, value, lookup ){
            //console.log( 'Executing SEQUENCE EXPRESSION' );
            //console.log( `- executeSequenceExpression LIST`, list );
            var result = map( list, function( expression ){
                    return expression( scope, value, lookup );
                } );
            //console.log( `- executeSequenceExpression RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    } else {
        list = this.recurse( expressions, false, assign );

        fn = function executeSequenceExpressionWithExpressionRange( scope, value, lookup ){
            //console.log( 'Executing SEQUENCE EXPRESSION' );
            //console.log( `- executeSequenceExpressionWithExpressionRange LIST`, list.name );
            var result = list( scope, value, lookup );
            //console.log( `- executeSequenceExpressionWithExpressionRange RESULT`, result );
            return context ?
                { value: result } :
                result;
        };
    }

    return fn;
};

interpreterPrototype.staticMemberExpression = function( object, property, context, assign ){
    //console.log( 'Composing STATIC MEMBER EXPRESSION', object.type, property.type );
    var interpreter = this,
        depth = this.depth,
        isRightFunction = false,
        isSafe = false,
        left, rhs, right;

    switch( object.type ){
        case LookupExpression$1:
            left = this.lookupExpression( object.key, true, false, assign );
            break;
        case ExistentialExpression$1:
            isSafe = true;
        default:
            left = this.recurse( object, false, assign );
    }

    switch( property.type ){
        case Identifier$3:
            rhs = right = property.name;
            break;
        default:
            right = this.recurse( property, false, assign );
            isRightFunction = true;
    }

    if( !interpreter.isSplit ){
        return function executeStaticMemberExpression( scope, value, lookup ){
            //console.log( 'Executing STATIC MEMBER EXPRESSION' );
            //console.log( `- executeStaticMemberExpression LEFT`, left.name );
            //console.log( `- executeStaticMemberExpression RIGHT`, rhs || right.name );
            var lhs = left( scope, value, lookup ),
                result;

            if( !isSafe || lhs ){
                if( isRightFunction ){
                    rhs = right( property.type === RootExpression$1 ? scope : lhs, value, lookup );
                }
                //console.log( `- executeStaticMemberExpression LHS`, lhs );
                //console.log( `- executeStaticMemberExpression RHS`, rhs );
                //console.log( `- executeStaticMemberExpression DEPTH`, depth );
                result = assign( lhs, rhs, !depth ? value : {} );
            }
            //console.log( `- executeStaticMemberExpression RESULT`, result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    } else {
        return function executeStaticMemberExpression( scope, value, lookup ){
            //console.log( 'Executing STATIC MEMBER EXPRESSION' );
            //console.log( `- executeStaticMemberExpression LEFT`, left.name );
            //console.log( `- executeStaticMemberExpression RIGHT`, rhs || right.name );
            var lhs = left( scope, value, lookup ),
                result;

            if( !isSafe || lhs ){
                if( isRightFunction ){
                    rhs = right( property.type === RootExpression$1 ? scope : lhs, value, lookup );
                }
                //console.log( `- executeStaticMemberExpression LHS`, lhs );
                //console.log( `- executeStaticMemberExpression RHS`, rhs );
                //console.log( `- executeStaticMemberExpression DEPTH`, depth );
                result = map( lhs, function( object ){
                    return assign( object, rhs, !depth ? value : {} );
                } );
            }
            //console.log( `- executeStaticMemberExpression RESULT`, result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    }
};

var lexer = new Lexer();
var builder = new Builder( lexer );
var intrepreter = new Interpreter( builder );
var cache$1;

/**
 * @class KeypathExp
 * @extends Transducer
 * @param {external:string} pattern
 * @param {external:string} flags
 */
function KeypathExp( pattern, flags ){
    typeof pattern !== 'string' && ( pattern = '' );
    typeof flags !== 'string' && ( flags = '' );

    var tokens;

    if( flags.indexOf( 'c' ) !== -1 ){
        if( !cache$1 ){
            cache$1 = new Null();
        }
        tokens = hasOwnProperty( cache$1, pattern ) ?
            cache$1[ pattern ] :
            cache$1[ pattern ] = lexer.lex( pattern );
    } else {
        tokens = lexer.lex( pattern );
    }

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFnLmpzIiwic291cmNlcyI6WyJudWxsLmpzIiwiY2hhcmFjdGVyLmpzIiwiZ3JhbW1hci5qcyIsInRva2VuLmpzIiwibGV4ZXIuanMiLCJzeW50YXguanMiLCJub2RlLmpzIiwia2V5cGF0aC1zeW50YXguanMiLCJoYXMtb3duLXByb3BlcnR5LmpzIiwia2V5cGF0aC1ub2RlLmpzIiwiYnVpbGRlci5qcyIsIm1hcC5qcyIsImludGVycHJldGVyLmpzIiwiZXhwLmpzIiwidGFnLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQSBcImNsZWFuXCIsIGVtcHR5IGNvbnRhaW5lci4gSW5zdGFudGlhdGluZyB0aGlzIGlzIGZhc3RlciB0aGFuIGV4cGxpY2l0bHkgY2FsbGluZyBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYC5cbiAqIEBjbGFzcyBOdWxsXG4gKiBAZXh0ZW5kcyBleHRlcm5hbDpudWxsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE51bGwoKXt9XG5OdWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbk51bGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIE51bGw7IiwiZXhwb3J0IGZ1bmN0aW9uIGlzSWRlbnRpZmllclBhcnQoIGNoYXIgKXtcbiAgICByZXR1cm4gaXNJZGVudGlmaWVyU3RhcnQoIGNoYXIgKSB8fCBpc051bWVyaWMoIGNoYXIgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICl7XG4gICAgcmV0dXJuICdhJyA8PSBjaGFyICYmIGNoYXIgPD0gJ3onIHx8ICdBJyA8PSBjaGFyICYmIGNoYXIgPD0gJ1onIHx8ICdfJyA9PT0gY2hhciB8fCBjaGFyID09PSAnJCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc051bWVyaWMoIGNoYXIgKXtcbiAgICByZXR1cm4gJzAnIDw9IGNoYXIgJiYgY2hhciA8PSAnOSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1B1bmN0dWF0b3IoIGNoYXIgKXtcbiAgICByZXR1cm4gJy4sPygpW117fSV+OycuaW5kZXhPZiggY2hhciApICE9PSAtMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUXVvdGUoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJ1wiJyB8fCBjaGFyID09PSBcIidcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzV2hpdGVzcGFjZSggY2hhciApe1xuICAgIHJldHVybiBjaGFyID09PSAnICcgfHwgY2hhciA9PT0gJ1xccicgfHwgY2hhciA9PT0gJ1xcdCcgfHwgY2hhciA9PT0gJ1xcbicgfHwgY2hhciA9PT0gJ1xcdicgfHwgY2hhciA9PT0gJ1xcdTAwQTAnO1xufSIsImV4cG9ydCB2YXIgSWRlbnRpZmllciAgICAgID0gJ0lkZW50aWZpZXInO1xuZXhwb3J0IHZhciBOdW1lcmljTGl0ZXJhbCAgPSAnTnVtZXJpYyc7XG5leHBvcnQgdmFyIE51bGxMaXRlcmFsICAgICA9ICdOdWxsJztcbmV4cG9ydCB2YXIgUHVuY3R1YXRvciAgICAgID0gJ1B1bmN0dWF0b3InO1xuZXhwb3J0IHZhciBTdHJpbmdMaXRlcmFsICAgPSAnU3RyaW5nJzsiLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgR3JhbW1hciBmcm9tICcuL2dyYW1tYXInO1xuXG52YXIgdG9rZW5JZCA9IDA7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflRva2VuXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdHlwZSBUaGUgdHlwZSBvZiB0aGUgdG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIHRva2VuXG4gKi9cbmZ1bmN0aW9uIFRva2VuKCB0eXBlLCB2YWx1ZSApe1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gTGV4ZXJ+VG9rZW4jaWRcbiAgICAgKi9cbiAgICB0aGlzLmlkID0gKyt0b2tlbklkO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gTGV4ZXJ+VG9rZW4jdHlwZVxuICAgICAqL1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBMZXhlcn5Ub2tlbiN2YWx1ZVxuICAgICAqL1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuVG9rZW4ucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuVG9rZW4ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVG9rZW47XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHRva2VuXG4gKi9cblRva2VuLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24udHlwZSA9IHRoaXMudHlwZTtcbiAgICBqc29uLnZhbHVlID0gdGhpcy52YWx1ZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlblxuICovXG5Ub2tlbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBTdHJpbmcoIHRoaXMudmFsdWUgKTtcbn07XG5cbi8qKlxuICogQGNsYXNzIExleGVyfklkZW50aWZpZXJcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElkZW50aWZpZXIoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5JZGVudGlmaWVyLCB2YWx1ZSApO1xufVxuXG5JZGVudGlmaWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5JZGVudGlmaWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IElkZW50aWZpZXI7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfk51bWVyaWNMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdW1lcmljTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLk51bWVyaWNMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVtZXJpY0xpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIExleGVyfk51bGxMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdWxsTGl0ZXJhbCggdmFsdWUgKXtcbiAgICBUb2tlbi5jYWxsKCB0aGlzLCBHcmFtbWFyLk51bGxMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5OdWxsTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuTnVsbExpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVsbExpdGVyYWw7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflB1bmN0dWF0b3JcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFB1bmN0dWF0b3IoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5QdW5jdHVhdG9yLCB2YWx1ZSApO1xufVxuXG5QdW5jdHVhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5QdW5jdHVhdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFB1bmN0dWF0b3I7XG5cbi8qKlxuICogQGNsYXNzIExleGVyflN0cmluZ0xpdGVyYWxcbiAqIEBleHRlbmRzIExleGVyflRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0cmluZ0xpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5TdHJpbmdMaXRlcmFsLCB2YWx1ZSApO1xufVxuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRva2VuLnByb3RvdHlwZSApO1xuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0cmluZ0xpdGVyYWw7IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIENoYXJhY3RlciBmcm9tICcuL2NoYXJhY3Rlcic7XG5pbXBvcnQgKiBhcyBUb2tlbiBmcm9tICcuL3Rva2VuJztcblxudmFyIGxleGVyUHJvdG90eXBlO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlclxuICogQGV4dGVuZHMgTnVsbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMZXhlcigpe1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKiBAZGVmYXVsdCAnJ1xuICAgICAqL1xuICAgIHRoaXMuc291cmNlID0gJyc7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuaW5kZXggPSAwO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8TGV4ZXJ+VG9rZW4+fVxuICAgICAqL1xuICAgIHRoaXMudG9rZW5zID0gW107XG59XG5cbmxleGVyUHJvdG90eXBlID0gTGV4ZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxubGV4ZXJQcm90b3R5cGUuY29uc3RydWN0b3IgPSBMZXhlcjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0ZXh0XG4gKi9cbmxleGVyUHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKCB0ZXh0ICl7XG4gICAgLy8gUmVzZXQgdGhlIGluZGV4IGFuZCB0b2tlbnNcbiAgICBpZiggdGhpcy5pbmRleCApe1xuICAgICAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAgICAgdGhpcy50b2tlbnMgPSBbXTtcbiAgICB9XG5cbiAgICB0aGlzLnNvdXJjZSA9IHRleHQ7XG4gICAgdGhpcy5sZW5ndGggPSB0ZXh0Lmxlbmd0aDtcblxuICAgIHZhciB3b3JkID0gJycsXG4gICAgICAgIGNoYXIsIHRva2VuLCBxdW90ZTtcblxuICAgIHdoaWxlKCAhdGhpcy5lb2woKSApe1xuICAgICAgICBjaGFyID0gdGhpcy5zb3VyY2VbIHRoaXMuaW5kZXggXTtcblxuICAgICAgICAvLyBJZGVudGlmaWVyXG4gICAgICAgIGlmKCBDaGFyYWN0ZXIuaXNJZGVudGlmaWVyU3RhcnQoIGNoYXIgKSApe1xuICAgICAgICAgICAgd29yZCA9IHRoaXMucmVhZCggZnVuY3Rpb24oIGNoYXIgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gIUNoYXJhY3Rlci5pc0lkZW50aWZpZXJQYXJ0KCBjaGFyICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHRva2VuID0gd29yZCA9PT0gJ251bGwnID9cbiAgICAgICAgICAgICAgICBuZXcgVG9rZW4uTnVsbExpdGVyYWwoIHdvcmQgKSA6XG4gICAgICAgICAgICAgICAgbmV3IFRva2VuLklkZW50aWZpZXIoIHdvcmQgKTtcbiAgICAgICAgICAgIHRoaXMudG9rZW5zLnB1c2goIHRva2VuICk7XG5cbiAgICAgICAgLy8gUHVuY3R1YXRvclxuICAgICAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc1B1bmN0dWF0b3IoIGNoYXIgKSApe1xuICAgICAgICAgICAgdG9rZW4gPSBuZXcgVG9rZW4uUHVuY3R1YXRvciggY2hhciApO1xuICAgICAgICAgICAgdGhpcy50b2tlbnMucHVzaCggdG9rZW4gKTtcblxuICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgIC8vIFF1b3RlZCBTdHJpbmdcbiAgICAgICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNRdW90ZSggY2hhciApICl7XG4gICAgICAgICAgICBxdW90ZSA9IGNoYXI7XG5cbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICAgICAgd29yZCA9IHRoaXMucmVhZCggZnVuY3Rpb24oIGNoYXIgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hhciA9PT0gcXVvdGU7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHRva2VuID0gbmV3IFRva2VuLlN0cmluZ0xpdGVyYWwoIHF1b3RlICsgd29yZCArIHF1b3RlICk7XG4gICAgICAgICAgICB0aGlzLnRva2Vucy5wdXNoKCB0b2tlbiApO1xuXG4gICAgICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgLy8gTnVtZXJpY1xuICAgICAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc051bWVyaWMoIGNoYXIgKSApe1xuICAgICAgICAgICAgd29yZCA9IHRoaXMucmVhZCggZnVuY3Rpb24oIGNoYXIgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gIUNoYXJhY3Rlci5pc051bWVyaWMoIGNoYXIgKTtcbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgdG9rZW4gPSBuZXcgVG9rZW4uTnVtZXJpY0xpdGVyYWwoIHdvcmQgKTtcbiAgICAgICAgICAgIHRoaXMudG9rZW5zLnB1c2goIHRva2VuICk7XG5cbiAgICAgICAgLy8gV2hpdGVzcGFjZVxuICAgICAgICB9IGVsc2UgaWYoIENoYXJhY3Rlci5pc1doaXRlc3BhY2UoIGNoYXIgKSApe1xuICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgIC8vIEVycm9yXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoICdcIicgKyBjaGFyICsgJ1wiIGlzIGFuIGludmFsaWQgY2hhcmFjdGVyJyApO1xuICAgICAgICB9XG5cbiAgICAgICAgd29yZCA9ICcnO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRva2Vucztcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGxleGVyIGlzIGF0IHRoZSBlbmQgb2YgdGhlIGxpbmVcbiAqL1xubGV4ZXJQcm90b3R5cGUuZW9sID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5pbmRleCA+PSB0aGlzLmxlbmd0aDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOmZ1bmN0aW9ufSB1bnRpbCBBIGNvbmRpdGlvbiB0aGF0IHdoZW4gbWV0IHdpbGwgc3RvcCB0aGUgcmVhZGluZyBvZiB0aGUgYnVmZmVyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBUaGUgcG9ydGlvbiBvZiB0aGUgYnVmZmVyIHJlYWRcbiAqL1xubGV4ZXJQcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uKCB1bnRpbCApe1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXgsXG4gICAgICAgIGNoYXI7XG5cbiAgICB3aGlsZSggIXRoaXMuZW9sKCkgKXtcbiAgICAgICAgY2hhciA9IHRoaXMuc291cmNlWyB0aGlzLmluZGV4IF07XG5cbiAgICAgICAgaWYoIHVudGlsKCBjaGFyICkgKXtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNvdXJjZS5zbGljZSggc3RhcnQsIHRoaXMuaW5kZXggKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGxleGVyXG4gKi9cbmxleGVyUHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi5zb3VyY2UgPSB0aGlzLnNvdXJjZTtcbiAgICBqc29uLnRva2VucyA9IHRoaXMudG9rZW5zLm1hcCggZnVuY3Rpb24oIHRva2VuICl7XG4gICAgICAgIHJldHVybiB0b2tlbi50b0pTT04oKTtcbiAgICB9ICk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGV4ZXJcbiAqL1xubGV4ZXJQcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbn07IiwiZXhwb3J0IHZhciBBcnJheUV4cHJlc3Npb24gICAgICAgPSAnQXJyYXlFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgQ2FsbEV4cHJlc3Npb24gICAgICAgID0gJ0NhbGxFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgRXhwcmVzc2lvblN0YXRlbWVudCAgID0gJ0V4cHJlc3Npb25TdGF0ZW1lbnQnO1xuZXhwb3J0IHZhciBJZGVudGlmaWVyICAgICAgICAgICAgPSAnSWRlbnRpZmllcic7XG5leHBvcnQgdmFyIExpdGVyYWwgICAgICAgICAgICAgICA9ICdMaXRlcmFsJztcbmV4cG9ydCB2YXIgTWVtYmVyRXhwcmVzc2lvbiAgICAgID0gJ01lbWJlckV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBQcm9ncmFtICAgICAgICAgICAgICAgPSAnUHJvZ3JhbSc7XG5leHBvcnQgdmFyIFNlcXVlbmNlRXhwcmVzc2lvbiAgICA9ICdTZXF1ZW5jZUV4cHJlc3Npb24nOyIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBTeW50YXggZnJvbSAnLi9zeW50YXgnO1xuXG52YXIgbm9kZUlkID0gMCxcbiAgICBsaXRlcmFsVHlwZXMgPSAnYm9vbGVhbiBudW1iZXIgc3RyaW5nJy5zcGxpdCggJyAnICk7XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+Tm9kZVxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHR5cGUgQSBub2RlIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE5vZGUoIHR5cGUgKXtcblxuICAgIGlmKCB0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycgKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAndHlwZSBtdXN0IGJlIGEgc3RyaW5nJywgVHlwZUVycm9yICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBCdWlsZGVyfk5vZGUjaWRcbiAgICAgKi9cbiAgICB0aGlzLmlkID0gKytub2RlSWQ7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBCdWlsZGVyfk5vZGUjdHlwZVxuICAgICAqL1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG59XG5cbk5vZGUucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuTm9kZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOb2RlO1xuXG5Ob2RlLnByb3RvdHlwZS50aHJvd0Vycm9yID0gZnVuY3Rpb24oIG1lc3NhZ2UsIEVycm9yQ2xhc3MgKXtcbiAgICB0eXBlb2YgRXJyb3JDbGFzcyA9PT0gJ3VuZGVmaW5lZCcgJiYgKCBFcnJvckNsYXNzID0gRXJyb3IgKTtcbiAgICB0aHJvdyBuZXcgRXJyb3JDbGFzcyggbWVzc2FnZSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgbm9kZVxuICovXG5Ob2RlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24udHlwZSA9IHRoaXMudHlwZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBub2RlXG4gKi9cbk5vZGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gU3RyaW5nKCB0aGlzLnR5cGUgKTtcbn07XG5cbk5vZGUucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmlkO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk5vZGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBleHByZXNzaW9uVHlwZSBBIG5vZGUgdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gRXhwcmVzc2lvbiggZXhwcmVzc2lvblR5cGUgKXtcbiAgICBOb2RlLmNhbGwoIHRoaXMsIGV4cHJlc3Npb25UeXBlICk7XG59XG5cbkV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTm9kZS5wcm90b3R5cGUgKTtcblxuRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkxpdGVyYWxcbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6bnVtYmVyfSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIGxpdGVyYWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExpdGVyYWwoIHZhbHVlLCByYXcgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5MaXRlcmFsICk7XG5cbiAgICBpZiggbGl0ZXJhbFR5cGVzLmluZGV4T2YoIHR5cGVvZiB2YWx1ZSApID09PSAtMSAmJiB2YWx1ZSAhPT0gbnVsbCApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICd2YWx1ZSBtdXN0IGJlIGEgYm9vbGVhbiwgbnVtYmVyLCBzdHJpbmcsIG9yIG51bGwnLCBUeXBlRXJyb3IgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5yYXcgPSByYXc7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5MaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExpdGVyYWw7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGxpdGVyYWxcbiAqL1xuTGl0ZXJhbC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLnJhdyA9IHRoaXMucmF3O1xuICAgIGpzb24udmFsdWUgPSB0aGlzLnZhbHVlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGxpdGVyYWxcbiAqL1xuTGl0ZXJhbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnJhdztcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+TWVtYmVyRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gb2JqZWN0XG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbnxCdWlsZGVyfklkZW50aWZpZXJ9IHByb3BlcnR5XG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGNvbXB1dGVkPWZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5LCBjb21wdXRlZCApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4Lk1lbWJlckV4cHJlc3Npb24gKTtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+RXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLm9iamVjdCA9IG9iamVjdDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb258QnVpbGRlcn5JZGVudGlmaWVyfVxuICAgICAqL1xuICAgIHRoaXMucHJvcGVydHkgPSBwcm9wZXJ0eTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuY29tcHV0ZWQgPSBjb21wdXRlZCB8fCBmYWxzZTtcbn1cblxuTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5NZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1lbWJlckV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIG1lbWJlciBleHByZXNzaW9uXG4gKi9cbk1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5vYmplY3QgICA9IHRoaXMub2JqZWN0LnRvSlNPTigpO1xuICAgIGpzb24ucHJvcGVydHkgPSB0aGlzLnByb3BlcnR5LnRvSlNPTigpO1xuICAgIGpzb24uY29tcHV0ZWQgPSB0aGlzLmNvbXB1dGVkO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflByb2dyYW1cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+Tm9kZVxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheTxCdWlsZGVyflN0YXRlbWVudD59IGJvZHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFByb2dyYW0oIGJvZHkgKXtcbiAgICBOb2RlLmNhbGwoIHRoaXMsIFN5bnRheC5Qcm9ncmFtICk7XG5cbiAgICBpZiggIUFycmF5LmlzQXJyYXkoIGJvZHkgKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYm9keSBtdXN0IGJlIGFuIGFycmF5JyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOkFycmF5PEJ1aWxkZXJ+U3RhdGVtZW50Pn1cbiAgICAgKi9cbiAgICB0aGlzLmJvZHkgPSBib2R5IHx8IFtdO1xuICAgIHRoaXMuc291cmNlVHlwZSA9ICdzY3JpcHQnO1xufVxuXG5Qcm9ncmFtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE5vZGUucHJvdG90eXBlICk7XG5cblByb2dyYW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUHJvZ3JhbTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgcHJvZ3JhbVxuICovXG5Qcm9ncmFtLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uYm9keSA9IHRoaXMuYm9keS5tYXAoIGZ1bmN0aW9uKCBub2RlICl7XG4gICAgICAgIHJldHVybiBub2RlLnRvSlNPTigpO1xuICAgIH0gKTtcbiAgICBqc29uLnNvdXJjZVR5cGUgPSB0aGlzLnNvdXJjZVR5cGU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+U3RhdGVtZW50XG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk5vZGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBzdGF0ZW1lbnRUeXBlIEEgbm9kZSB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdGF0ZW1lbnQoIHN0YXRlbWVudFR5cGUgKXtcbiAgICBOb2RlLmNhbGwoIHRoaXMsIHN0YXRlbWVudFR5cGUgKTtcbn1cblxuU3RhdGVtZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE5vZGUucHJvdG90eXBlICk7XG5cblN0YXRlbWVudC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdGF0ZW1lbnQ7XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+QXJyYXlFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259IGVsZW1lbnRzIEEgbGlzdCBvZiBleHByZXNzaW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gQXJyYXlFeHByZXNzaW9uKCBlbGVtZW50cyApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LkFycmF5RXhwcmVzc2lvbiApO1xuXG4gICAgLy9pZiggISggQXJyYXkuaXNBcnJheSggZWxlbWVudHMgKSApICYmICEoIGVsZW1lbnRzIGluc3RhbmNlb2YgUmFuZ2VFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnZWxlbWVudHMgbXVzdCBiZSBhIGxpc3Qgb2YgZXhwcmVzc2lvbnMgb3IgYW4gaW5zdGFuY2Ugb2YgcmFuZ2UgZXhwcmVzc2lvbicgKTtcbiAgICAvL31cblxuICAgIC8qXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB0aGlzLCAnZWxlbWVudHMnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKCBlbGVtZW50cyApe1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5sZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHRoaXNbIGluZGV4IF0gPSBlbGVtZW50c1sgaW5kZXggXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0gKTtcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5lbGVtZW50cyA9IGVsZW1lbnRzO1xufVxuXG5BcnJheUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuQXJyYXlFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFycmF5RXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgYXJyYXkgZXhwcmVzc2lvblxuICovXG5BcnJheUV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIHRoaXMuZWxlbWVudHMgKSApe1xuICAgICAgICBqc29uLmVsZW1lbnRzID0gdGhpcy5lbGVtZW50cy5tYXAoIGZ1bmN0aW9uKCBlbGVtZW50ICl7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC50b0pTT04oKTtcbiAgICAgICAgfSApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGpzb24uZWxlbWVudHMgPSB0aGlzLmVsZW1lbnRzLnRvSlNPTigpO1xuICAgIH1cblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5DYWxsRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gY2FsbGVlXG4gKiBAcGFyYW0ge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj59IGFyZ3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENhbGxFeHByZXNzaW9uKCBjYWxsZWUsIGFyZ3MgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5DYWxsRXhwcmVzc2lvbiApO1xuXG4gICAgaWYoICFBcnJheS5pc0FycmF5KCBhcmdzICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2FyZ3VtZW50cyBtdXN0IGJlIGFuIGFycmF5JyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+RXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLmNhbGxlZSA9IGNhbGxlZTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fVxuICAgICAqL1xuICAgIHRoaXMuYXJndW1lbnRzID0gYXJncztcbn1cblxuQ2FsbEV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuQ2FsbEV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2FsbEV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGNhbGwgZXhwcmVzc2lvblxuICovXG5DYWxsRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmNhbGxlZSAgICA9IHRoaXMuY2FsbGVlLnRvSlNPTigpO1xuICAgIGpzb24uYXJndW1lbnRzID0gdGhpcy5hcmd1bWVudHMubWFwKCBmdW5jdGlvbiggbm9kZSApe1xuICAgICAgICByZXR1cm4gbm9kZS50b0pTT04oKTtcbiAgICB9ICk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+Q29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk1lbWJlckV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBvYmplY3RcbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBwcm9wZXJ0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICl7XG4gICAgaWYoICEoIHByb3BlcnR5IGluc3RhbmNlb2YgRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdwcm9wZXJ0eSBtdXN0IGJlIGFuIGV4cHJlc3Npb24gd2hlbiBjb21wdXRlZCBpcyB0cnVlJyApO1xuICAgIH1cblxuICAgIE1lbWJlckV4cHJlc3Npb24uY2FsbCggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSwgdHJ1ZSApO1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciBCdWlsZGVyfkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiNjb21wdXRlZD10cnVlXG4gICAgICovXG59XG5cbkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkV4cHJlc3Npb25TdGF0ZW1lbnRcbiAqIEBleHRlbmRzIEJ1aWxkZXJ+U3RhdGVtZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFeHByZXNzaW9uU3RhdGVtZW50KCBleHByZXNzaW9uICl7XG4gICAgU3RhdGVtZW50LmNhbGwoIHRoaXMsIFN5bnRheC5FeHByZXNzaW9uU3RhdGVtZW50ICk7XG5cbiAgICBpZiggISggZXhwcmVzc2lvbiBpbnN0YW5jZW9mIEV4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYXJndW1lbnQgbXVzdCBiZSBhbiBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+RXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLmV4cHJlc3Npb24gPSBleHByZXNzaW9uO1xufVxuXG5FeHByZXNzaW9uU3RhdGVtZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFN0YXRlbWVudC5wcm90b3R5cGUgKTtcblxuRXhwcmVzc2lvblN0YXRlbWVudC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFeHByZXNzaW9uU3RhdGVtZW50O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBleHByZXNzaW9uIHN0YXRlbWVudFxuICovXG5FeHByZXNzaW9uU3RhdGVtZW50LnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24uZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvbi50b0pTT04oKTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5JZGVudGlmaWVyXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBpZGVudGlmaWVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJZGVudGlmaWVyKCBuYW1lICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguSWRlbnRpZmllciApO1xuXG4gICAgaWYoIHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJyApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbmFtZSBtdXN0IGJlIGEgc3RyaW5nJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xufVxuXG5JZGVudGlmaWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbklkZW50aWZpZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSWRlbnRpZmllcjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgaWRlbnRpZmllclxuICovXG5JZGVudGlmaWVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ubmFtZSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIE51bGxMaXRlcmFsKCByYXcgKXtcbiAgICBpZiggcmF3ICE9PSAnbnVsbCcgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JhdyBpcyBub3QgYSBudWxsIGxpdGVyYWwnICk7XG4gICAgfVxuXG4gICAgTGl0ZXJhbC5jYWxsKCB0aGlzLCBudWxsLCByYXcgKTtcbn1cblxuTnVsbExpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTGl0ZXJhbC5wcm90b3R5cGUgKTtcblxuTnVsbExpdGVyYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVsbExpdGVyYWw7XG5cbmV4cG9ydCBmdW5jdGlvbiBOdW1lcmljTGl0ZXJhbCggcmF3ICl7XG4gICAgdmFyIHZhbHVlID0gcGFyc2VGbG9hdCggcmF3ICk7XG5cbiAgICBpZiggaXNOYU4oIHZhbHVlICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JhdyBpcyBub3QgYSBudW1lcmljIGxpdGVyYWwnICk7XG4gICAgfVxuXG4gICAgTGl0ZXJhbC5jYWxsKCB0aGlzLCB2YWx1ZSwgcmF3ICk7XG59XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExpdGVyYWwucHJvdG90eXBlICk7XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bWVyaWNMaXRlcmFsO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflNlcXVlbmNlRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufSBleHByZXNzaW9ucyBUaGUgZXhwcmVzc2lvbnMgaW4gdGhlIHNlcXVlbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXF1ZW5jZUV4cHJlc3Npb24oIGV4cHJlc3Npb25zICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguU2VxdWVuY2VFeHByZXNzaW9uICk7XG5cbiAgICAvL2lmKCAhKCBBcnJheS5pc0FycmF5KCBleHByZXNzaW9ucyApICkgJiYgISggZXhwcmVzc2lvbnMgaW5zdGFuY2VvZiBSYW5nZUV4cHJlc3Npb24gKSApe1xuICAgIC8vICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdleHByZXNzaW9ucyBtdXN0IGJlIGEgbGlzdCBvZiBleHByZXNzaW9ucyBvciBhbiBpbnN0YW5jZSBvZiByYW5nZSBleHByZXNzaW9uJyApO1xuICAgIC8vfVxuXG4gICAgLypcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdleHByZXNzaW9ucycsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oIGV4cHJlc3Npb25zICl7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmxlbmd0aCA9IGV4cHJlc3Npb25zLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgdGhpc1sgaW5kZXggXSA9IGV4cHJlc3Npb25zWyBpbmRleCBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSApO1xuICAgICovXG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn1cbiAgICAgKi9cbiAgICB0aGlzLmV4cHJlc3Npb25zID0gZXhwcmVzc2lvbnM7XG59XG5cblNlcXVlbmNlRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5TZXF1ZW5jZUV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2VxdWVuY2VFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzZXF1ZW5jZSBleHByZXNzaW9uXG4gKi9cblNlcXVlbmNlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBpZiggQXJyYXkuaXNBcnJheSggdGhpcy5leHByZXNzaW9ucyApICl7XG4gICAgICAgIGpzb24uZXhwcmVzc2lvbnMgPSB0aGlzLmV4cHJlc3Npb25zLm1hcCggZnVuY3Rpb24oIGV4cHJlc3Npb24gKXtcbiAgICAgICAgICAgIHJldHVybiBleHByZXNzaW9uLnRvSlNPTigpO1xuICAgICAgICB9ICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAganNvbi5leHByZXNzaW9ucyA9IHRoaXMuZXhwcmVzc2lvbnMudG9KU09OKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflN0YXRpY01lbWJlckV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+TWVtYmVyRXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IG9iamVjdFxuICogQHBhcmFtIHtCdWlsZGVyfklkZW50aWZpZXJ9IHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICl7XG4gICAgLy9pZiggISggcHJvcGVydHkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISggcHJvcGVydHkgaW5zdGFuY2VvZiBMb29rdXBFeHByZXNzaW9uICkgJiYgISggcHJvcGVydHkgaW5zdGFuY2VvZiBCbG9ja0V4cHJlc3Npb24gKSApe1xuICAgIC8vICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdwcm9wZXJ0eSBtdXN0IGJlIGFuIGlkZW50aWZpZXIsIGV2YWwgZXhwcmVzc2lvbiwgb3IgbG9va3VwIGV4cHJlc3Npb24gd2hlbiBjb21wdXRlZCBpcyBmYWxzZScgKTtcbiAgICAvL31cblxuICAgIE1lbWJlckV4cHJlc3Npb24uY2FsbCggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSwgZmFsc2UgKTtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIgQnVpbGRlcn5TdGF0aWNNZW1iZXJFeHByZXNzaW9uI2NvbXB1dGVkPWZhbHNlXG4gICAgICovXG59XG5cblN0YXRpY01lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuU3RhdGljTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdGF0aWNNZW1iZXJFeHByZXNzaW9uO1xuXG5leHBvcnQgZnVuY3Rpb24gU3RyaW5nTGl0ZXJhbCggcmF3ICl7XG4gICAgaWYoIHJhd1sgMCBdICE9PSAnXCInICYmIHJhd1sgMCBdICE9PSBcIidcIiApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncmF3IGlzIG5vdCBhIHN0cmluZyBsaXRlcmFsJyApO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IHJhdy5zdWJzdHJpbmcoIDEsIHJhdy5sZW5ndGggLSAxICk7XG5cbiAgICBMaXRlcmFsLmNhbGwoIHRoaXMsIHZhbHVlLCByYXcgKTtcbn1cblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBMaXRlcmFsLnByb3RvdHlwZSApO1xuXG5TdHJpbmdMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0cmluZ0xpdGVyYWw7IiwiZXhwb3J0IHZhciBCbG9ja0V4cHJlc3Npb24gICAgICAgPSAnQmxvY2tFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgRXhpc3RlbnRpYWxFeHByZXNzaW9uID0gJ0V4aXN0ZW50aWFsRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIExvb2t1cEV4cHJlc3Npb24gICAgICA9ICdMb29rdXBFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUmFuZ2VFeHByZXNzaW9uICAgICAgID0gJ1JhbmdlRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIFJvb3RFeHByZXNzaW9uICAgICAgICA9ICdSb290RXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIFNjb3BlRXhwcmVzc2lvbiAgICAgICA9ICdTY29wZUV4cHJlc3Npb24nOyIsInZhciBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHsqfSBvYmplY3RcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBwcm9wZXJ0eVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eSggb2JqZWN0LCBwcm9wZXJ0eSApe1xuICAgIHJldHVybiBfaGFzT3duUHJvcGVydHkuY2FsbCggb2JqZWN0LCBwcm9wZXJ0eSApO1xufSIsImltcG9ydCB7IENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiwgRXhwcmVzc2lvbiwgSWRlbnRpZmllciwgTm9kZSwgTGl0ZXJhbCB9IGZyb20gJy4vbm9kZSc7XG5pbXBvcnQgKiBhcyBLZXlwYXRoU3ludGF4IGZyb20gJy4va2V5cGF0aC1zeW50YXgnO1xuaW1wb3J0IGhhc093blByb3BlcnR5IGZyb20gJy4vaGFzLW93bi1wcm9wZXJ0eSc7XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+T3BlcmF0b3JFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBleHByZXNzaW9uVHlwZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IG9wZXJhdG9yXG4gKi9cbmZ1bmN0aW9uIE9wZXJhdG9yRXhwcmVzc2lvbiggZXhwcmVzc2lvblR5cGUsIG9wZXJhdG9yICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBleHByZXNzaW9uVHlwZSApO1xuXG4gICAgdGhpcy5vcGVyYXRvciA9IG9wZXJhdG9yO1xufVxuXG5PcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE9wZXJhdG9yRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgb3BlcmF0b3IgZXhwcmVzc2lvblxuICovXG5PcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5vcGVyYXRvciA9IHRoaXMub3BlcmF0b3I7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBCbG9ja0V4cHJlc3Npb24oIGJvZHkgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsICdCbG9ja0V4cHJlc3Npb24nICk7XG5cbiAgICAvKlxuICAgIGlmKCAhKCBleHByZXNzaW9uIGluc3RhbmNlb2YgRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdhcmd1bWVudCBtdXN0IGJlIGFuIGV4cHJlc3Npb24nICk7XG4gICAgfVxuICAgICovXG5cbiAgICB0aGlzLmJvZHkgPSBib2R5O1xufVxuXG5CbG9ja0V4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuQmxvY2tFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJsb2NrRXhwcmVzc2lvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIEV4aXN0ZW50aWFsRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApe1xuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbiwgJz8nICk7XG5cbiAgICB0aGlzLmV4cHJlc3Npb24gPSBleHByZXNzaW9uO1xufVxuXG5FeGlzdGVudGlhbEV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5FeGlzdGVudGlhbEV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXhpc3RlbnRpYWxFeHByZXNzaW9uO1xuXG5FeGlzdGVudGlhbEV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb24udG9KU09OKCk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBMb29rdXBFeHByZXNzaW9uKCBrZXkgKXtcbiAgICBpZiggISgga2V5IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmICEoIGtleSBpbnN0YW5jZW9mIElkZW50aWZpZXIgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBCbG9ja0V4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAna2V5IG11c3QgYmUgYSBsaXRlcmFsLCBpZGVudGlmaWVyLCBvciBldmFsIGV4cHJlc3Npb24nICk7XG4gICAgfVxuXG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbiwgJyUnICk7XG5cbiAgICB0aGlzLmtleSA9IGtleTtcbn1cblxuTG9va3VwRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTG9va3VwRXhwcmVzc2lvbjtcblxuTG9va3VwRXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICsgdGhpcy5rZXk7XG59O1xuXG5Mb29rdXBFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5rZXkgPSB0aGlzLmtleTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5SYW5nZUV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+T3BlcmF0b3JFeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gbGVmdFxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IHJpZ2h0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSYW5nZUV4cHJlc3Npb24oIGxlZnQsIHJpZ2h0ICl7XG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguUmFuZ2VFeHByZXNzaW9uLCAnLi4nICk7XG5cbiAgICBpZiggISggbGVmdCBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiBsZWZ0ICE9PSBudWxsICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsZWZ0IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgbGl0ZXJhbCBvciBudWxsJyApO1xuICAgIH1cblxuICAgIGlmKCAhKCByaWdodCBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiByaWdodCAhPT0gbnVsbCApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncmlnaHQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBsaXRlcmFsIG9yIG51bGwnICk7XG4gICAgfVxuXG4gICAgaWYoIGxlZnQgPT09IG51bGwgJiYgcmlnaHQgPT09IG51bGwgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xlZnQgYW5kIHJpZ2h0IGNhbm5vdCBlcXVhbCBudWxsIGF0IHRoZSBzYW1lIHRpbWUnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5MaXRlcmFsfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiNsZWZ0XG4gICAgICovXG4gICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+TGl0ZXJhbH0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jMFxuICAgICAqL1xuICAgIHRoaXNbIDAgXSA9IHRoaXMubGVmdCA9IGxlZnQ7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uI3JpZ2h0XG4gICAgICovXG4gICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+TGl0ZXJhbH0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jMVxuICAgICAqL1xuICAgIHRoaXNbIDEgXSA9IHRoaXMucmlnaHQgPSByaWdodDtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jbGVuZ3RoPTJcbiAgICAgKi9cbiAgICB0aGlzLmxlbmd0aCA9IDI7XG59XG5cblJhbmdlRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5SYW5nZUV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmFuZ2VFeHByZXNzaW9uO1xuXG5SYW5nZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmxlZnQgPSB0aGlzLmxlZnQgIT09IG51bGwgP1xuICAgICAgICB0aGlzLmxlZnQudG9KU09OKCkgOlxuICAgICAgICB0aGlzLmxlZnQ7XG4gICAganNvbi5yaWdodCA9IHRoaXMucmlnaHQgIT09IG51bGwgP1xuICAgICAgICB0aGlzLnJpZ2h0LnRvSlNPTigpIDpcbiAgICAgICAgdGhpcy5yaWdodDtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMubGVmdC50b1N0cmluZygpICsgdGhpcy5vcGVyYXRvciArIHRoaXMucmlnaHQudG9TdHJpbmcoKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBSZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSwgY2FyZGluYWxpdHkgKXtcbiAgICBDb21wdXRlZE1lbWJlckV4cHJlc3Npb24uY2FsbCggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSApO1xuXG4gICAgaWYoICFoYXNPd25Qcm9wZXJ0eSggQ2FyZGluYWxpdHksIGNhcmRpbmFsaXR5ICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ1Vua25vd24gY2FyZGluYWxpdHkgJyArIGNhcmRpbmFsaXR5ICk7XG4gICAgfVxuXG4gICAgdGhpcy5jYXJkaW5hbGl0eSA9IGNhcmRpbmFsaXR5O1xufVxuXG5SZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBDb21wdXRlZE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblJlbGF0aW9uYWxNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlbGF0aW9uYWxNZW1iZXJFeHByZXNzaW9uO1xuXG5leHBvcnQgZnVuY3Rpb24gUm9vdEV4cHJlc3Npb24oIGtleSApe1xuICAgIGlmKCAhKCBrZXkgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgISgga2V5IGluc3RhbmNlb2YgSWRlbnRpZmllciApICYmICEoIGtleSBpbnN0YW5jZW9mIEJsb2NrRXhwcmVzc2lvbiApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdrZXkgbXVzdCBiZSBhIGxpdGVyYWwsIGlkZW50aWZpZXIsIG9yIGV2YWwgZXhwcmVzc2lvbicgKTtcbiAgICB9XG5cbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiwgJ34nICk7XG5cbiAgICB0aGlzLmtleSA9IGtleTtcbn1cblxuUm9vdEV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5Sb290RXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSb290RXhwcmVzc2lvbjtcblxuUm9vdEV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciArIHRoaXMua2V5O1xufTtcblxuUm9vdEV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBPcGVyYXRvckV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmtleSA9IHRoaXMua2V5O1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gU2NvcGVFeHByZXNzaW9uKCBvcGVyYXRvciwga2V5ICl7XG4gICAgLy9pZiggISgga2V5IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmICEoIGtleSBpbnN0YW5jZW9mIElkZW50aWZpZXIgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBCbG9ja0V4cHJlc3Npb24gKSApe1xuICAgIC8vICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdrZXkgbXVzdCBiZSBhIGxpdGVyYWwsIGlkZW50aWZpZXIsIG9yIGV2YWwgZXhwcmVzc2lvbicgKTtcbiAgICAvL31cblxuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4LlNjb3BlRXhwcmVzc2lvbiwgb3BlcmF0b3IgKTtcblxuICAgIHRoaXMua2V5ID0ga2V5O1xufVxuXG5TY29wZUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5TY29wZUV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2NvcGVFeHByZXNzaW9uO1xuXG5TY29wZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciArIHRoaXMua2V5O1xufTtcblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5rZXkgPSB0aGlzLmtleTtcblxuICAgIHJldHVybiBqc29uO1xufTsiLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgR3JhbW1hciBmcm9tICcuL2dyYW1tYXInO1xuaW1wb3J0ICogYXMgTm9kZSBmcm9tICcuL25vZGUnO1xuaW1wb3J0ICogYXMgS2V5cGF0aE5vZGUgZnJvbSAnLi9rZXlwYXRoLW5vZGUnO1xuXG52YXIgYnVpbGRlclByb3RvdHlwZTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlclxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtMZXhlcn0gbGV4ZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQnVpbGRlciggbGV4ZXIgKXtcbiAgICB0aGlzLmxleGVyID0gbGV4ZXI7XG59XG5cbmJ1aWxkZXJQcm90b3R5cGUgPSBCdWlsZGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbmJ1aWxkZXJQcm90b3R5cGUuY29uc3RydWN0b3IgPSBCdWlsZGVyO1xuXG5idWlsZGVyUHJvdG90eXBlLmFycmF5RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBsaXN0ICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0FSUkFZIEVYUFJFU1NJT04nICk7XG4gICAgdGhpcy5jb25zdW1lKCAnWycgKTtcbiAgICByZXR1cm4gbmV3IE5vZGUuQXJyYXlFeHByZXNzaW9uKCBsaXN0ICk7XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLmJsb2NrRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCB0ZXJtaW5hdG9yICl7XG4gICAgdmFyIGJsb2NrID0gW10sXG4gICAgICAgIGlzb2xhdGVkID0gZmFsc2U7XG4gICAgLy9jb25zb2xlLmxvZyggJ0JMT0NLJywgdGVybWluYXRvciApO1xuICAgIGlmKCAhdGhpcy5wZWVrKCB0ZXJtaW5hdG9yICkgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gRVhQUkVTU0lPTlMnICk7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGJsb2NrLnVuc2hpZnQoIHRoaXMuY29uc3VtZSgpICk7XG4gICAgICAgIH0gd2hpbGUoICF0aGlzLnBlZWsoIHRlcm1pbmF0b3IgKSApO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWUoIHRlcm1pbmF0b3IgKTtcbiAgICAvKmlmKCB0aGlzLnBlZWsoICd+JyApICl7XG4gICAgICAgIGlzb2xhdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb25zdW1lKCAnficgKTtcbiAgICB9Ki9cbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLkJsb2NrRXhwcmVzc2lvbiggYmxvY2ssIGlzb2xhdGVkICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd8QXJyYXk8QnVpbGRlcn5Ub2tlbj59IGlucHV0XG4gKiBAcmV0dXJucyB7UHJvZ3JhbX0gVGhlIGJ1aWx0IGFic3RyYWN0IHN5bnRheCB0cmVlXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuYnVpbGQgPSBmdW5jdGlvbiggaW5wdXQgKXtcbiAgICBpZiggdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyApe1xuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50ZXh0ID0gaW5wdXQ7XG5cbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzLmxleGVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnbGV4ZXIgaXMgbm90IGRlZmluZWQnICk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6QXJyYXk8VG9rZW4+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50b2tlbnMgPSB0aGlzLmxleGVyLmxleCggaW5wdXQgKTtcbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGlucHV0ICkgKXtcbiAgICAgICAgdGhpcy50b2tlbnMgPSBpbnB1dC5zbGljZSgpO1xuICAgICAgICB0aGlzLnRleHQgPSBpbnB1dC5qb2luKCAnJyApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ2ludmFsaWQgaW5wdXQnICk7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coICdCVUlMRCcgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSAnLCB0aGlzLnRleHQubGVuZ3RoLCAnQ0hBUlMnLCB0aGlzLnRleHQgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSAnLCB0aGlzLnRva2Vucy5sZW5ndGgsICdUT0tFTlMnLCB0aGlzLnRva2VucyApO1xuICAgIHRoaXMuY29sdW1uID0gdGhpcy50ZXh0Lmxlbmd0aDtcbiAgICB0aGlzLmxpbmUgPSAxO1xuXG4gICAgdmFyIHByb2dyYW0gPSB0aGlzLnByb2dyYW0oKTtcblxuICAgIGlmKCB0aGlzLnRva2Vucy5sZW5ndGggKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnVW5leHBlY3RlZCB0b2tlbiAnICsgdGhpcy50b2tlbnNbIDAgXSArICcgcmVtYWluaW5nJyApO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9ncmFtO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtDYWxsRXhwcmVzc2lvbn0gVGhlIGNhbGwgZXhwcmVzc2lvbiBub2RlXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuY2FsbEV4cHJlc3Npb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBhcmdzID0gdGhpcy5saXN0KCAnKCcgKSxcbiAgICAgICAgY2FsbGVlO1xuXG4gICAgdGhpcy5jb25zdW1lKCAnKCcgKTtcblxuICAgIGNhbGxlZSA9IHRoaXMuZXhwcmVzc2lvbigpO1xuXG4gICAgLy9jb25zb2xlLmxvZyggJ0NBTEwgRVhQUkVTU0lPTicgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBDQUxMRUUnLCBjYWxsZWUgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBBUkdVTUVOVFMnLCBhcmdzLCBhcmdzLmxlbmd0aCApO1xuICAgIHJldHVybiBuZXcgTm9kZS5DYWxsRXhwcmVzc2lvbiggY2FsbGVlLCBhcmdzICk7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgdGhlIG5leHQgdG9rZW4gaW4gdGhlIHRva2VuIGxpc3QuIElmIGEgY29tcGFyaXNvbiBpcyBwcm92aWRlZCwgdGhlIHRva2VuIHdpbGwgb25seSBiZSByZXR1cm5lZCBpZiB0aGUgdmFsdWUgbWF0Y2hlcy4gT3RoZXJ3aXNlIGFuIGVycm9yIGlzIHRocm93bi5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtleHBlY3RlZF0gQW4gZXhwZWN0ZWQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge1Rva2VufSBUaGUgbmV4dCB0b2tlbiBpbiB0aGUgbGlzdFxuICogQHRocm93cyB7U3ludGF4RXJyb3J9IElmIHRva2VuIGRpZCBub3QgZXhpc3RcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5jb25zdW1lID0gZnVuY3Rpb24oIGV4cGVjdGVkICl7XG4gICAgaWYoICF0aGlzLnRva2Vucy5sZW5ndGggKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnVW5leHBlY3RlZCBlbmQgb2YgZXhwcmVzc2lvbicgKTtcbiAgICB9XG5cbiAgICB2YXIgdG9rZW4gPSB0aGlzLmV4cGVjdCggZXhwZWN0ZWQgKTtcblxuICAgIGlmKCAhdG9rZW4gKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnVW5leHBlY3RlZCB0b2tlbiAnICsgdG9rZW4udmFsdWUgKyAnIGNvbnN1bWVkJyApO1xuICAgIH1cblxuICAgIHJldHVybiB0b2tlbjtcbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUuZXhpc3RlbnRpYWxFeHByZXNzaW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvbigpO1xuICAgIC8vY29uc29sZS5sb2coICctIEVYSVNUIEVYUFJFU1NJT04nLCBleHByZXNzaW9uICk7XG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5FeGlzdGVudGlhbEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgbmV4dCB0b2tlbiBpbiB0aGUgdG9rZW4gbGlzdC4gSWYgY29tcGFyaXNvbnMgYXJlIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgY29tcGFyaXNvbnMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZmlyc3RdIFRoZSBmaXJzdCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3NlY29uZF0gVGhlIHNlY29uZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3RoaXJkXSBUaGUgdGhpcmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmb3VydGhdIFRoZSBmb3VydGggY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge1Rva2VufSBUaGUgbmV4dCB0b2tlbiBpbiB0aGUgbGlzdCBvciBgdW5kZWZpbmVkYCBpZiBpdCBkaWQgbm90IGV4aXN0XG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuZXhwZWN0ID0gZnVuY3Rpb24oIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKXtcbiAgICB2YXIgdG9rZW4gPSB0aGlzLnBlZWsoIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKTtcblxuICAgIGlmKCB0b2tlbiApe1xuICAgICAgICB0aGlzLnRva2Vucy5wb3AoKTtcbiAgICAgICAgdGhpcy5jb2x1bW4gLT0gdG9rZW4udmFsdWUubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgfVxuXG4gICAgcmV0dXJuIHZvaWQgMDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7RXhwcmVzc2lvbn0gQW4gZXhwcmVzc2lvbiBub2RlXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuZXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGV4cHJlc3Npb24gPSBudWxsLFxuICAgICAgICBsaXN0LCBuZXh0LCB0b2tlbjtcblxuICAgIGlmKCB0aGlzLmV4cGVjdCggJzsnICkgKXtcbiAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgIH1cblxuICAgIGlmKCBuZXh0ID0gdGhpcy5wZWVrKCkgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0VYUFJFU1NJT04nLCBuZXh0ICk7XG4gICAgICAgIHN3aXRjaCggbmV4dC50eXBlICl7XG4gICAgICAgICAgICBjYXNlIEdyYW1tYXIuUHVuY3R1YXRvcjpcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5leHBlY3QoICddJyApICl7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QgPSB0aGlzLmxpc3QoICdbJyApO1xuICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy50b2tlbnMubGVuZ3RoID09PSAxICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5hcnJheUV4cHJlc3Npb24oIGxpc3QgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBsaXN0Lmxlbmd0aCA+IDEgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLnNlcXVlbmNlRXhwcmVzc2lvbiggbGlzdCApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IEFycmF5LmlzQXJyYXkoIGxpc3QgKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdFsgMCBdIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggbmV4dC52YWx1ZSA9PT0gJ30nICl7XG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cCggbmV4dCApO1xuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCB0aGlzLmV4cGVjdCggJz8nICkgKXtcbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuZXhpc3RlbnRpYWxFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEdyYW1tYXIuTnVsbExpdGVyYWw6XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubGl0ZXJhbCgpO1xuICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIEdyYW1tYXIuSWRlbnRpZmllclxuICAgICAgICAgICAgLy8gR3JhbW1hci5OdW1lcmljTGl0ZXJhbFxuICAgICAgICAgICAgLy8gR3JhbW1hci5TdHJpbmdMaXRlcmFsXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cCggbmV4dCApO1xuICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgICAgICAvLyBJbXBsaWVkIG1lbWJlciBleHByZXNzaW9uLiBTaG91bGQgb25seSBoYXBwZW4gYWZ0ZXIgYW4gSWRlbnRpZmllci5cbiAgICAgICAgICAgICAgICBpZiggbmV4dCAmJiBuZXh0LnR5cGUgPT09IEdyYW1tYXIuUHVuY3R1YXRvciAmJiAoIG5leHQudmFsdWUgPT09ICcpJyB8fCBuZXh0LnZhbHVlID09PSAnXScgfHwgbmV4dC52YWx1ZSA9PT0gJz8nICkgKXtcbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubWVtYmVyRXhwcmVzc2lvbiggZXhwcmVzc2lvbiwgZmFsc2UgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSggKCB0b2tlbiA9IHRoaXMuZXhwZWN0KCAnKScsICdbJywgJy4nICkgKSApe1xuICAgICAgICAgICAgaWYoIHRva2VuLnZhbHVlID09PSAnKScgKXtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5jYWxsRXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0b2tlbi52YWx1ZSA9PT0gJ1snICl7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubWVtYmVyRXhwcmVzc2lvbiggZXhwcmVzc2lvbiwgdHJ1ZSApO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0b2tlbi52YWx1ZSA9PT0gJy4nICl7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubWVtYmVyRXhwcmVzc2lvbiggZXhwcmVzc2lvbiwgZmFsc2UgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnVW5leHBlY3RlZCB0b2tlbiAnICsgdG9rZW4gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBleHByZXNzaW9uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtFeHByZXNzaW9uU3RhdGVtZW50fSBBbiBleHByZXNzaW9uIHN0YXRlbWVudFxuICovXG5idWlsZGVyUHJvdG90eXBlLmV4cHJlc3Npb25TdGF0ZW1lbnQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBleHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uKCksXG4gICAgICAgIGV4cHJlc3Npb25TdGF0ZW1lbnQ7XG4gICAgLy9jb25zb2xlLmxvZyggJ0VYUFJFU1NJT04gU1RBVEVNRU5UIFdJVEgnLCBleHByZXNzaW9uICk7XG4gICAgZXhwcmVzc2lvblN0YXRlbWVudCA9IG5ldyBOb2RlLkV4cHJlc3Npb25TdGF0ZW1lbnQoIGV4cHJlc3Npb24gKTtcblxuICAgIHJldHVybiBleHByZXNzaW9uU3RhdGVtZW50O1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtJZGVudGlmaWVyfSBBbiBpZGVudGlmaWVyXG4gKiBAdGhyb3dzIHtTeW50YXhFcnJvcn0gSWYgdGhlIHRva2VuIGlzIG5vdCBhbiBpZGVudGlmaWVyXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuaWRlbnRpZmllciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRva2VuID0gdGhpcy5jb25zdW1lKCk7XG5cbiAgICBpZiggISggdG9rZW4udHlwZSA9PT0gR3JhbW1hci5JZGVudGlmaWVyICkgKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnSWRlbnRpZmllciBleHBlY3RlZCcgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IE5vZGUuSWRlbnRpZmllciggdG9rZW4udmFsdWUgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdGVybWluYXRvclxuICogQHJldHVybnMge2V4dGVybmFsOkFycmF5PEV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn0gVGhlIGxpc3Qgb2YgZXhwcmVzc2lvbnMgb3IgcmFuZ2UgZXhwcmVzc2lvblxuICovXG5idWlsZGVyUHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbiggdGVybWluYXRvciApe1xuICAgIHZhciBsaXN0ID0gW10sXG4gICAgICAgIGlzTnVtZXJpYyA9IGZhbHNlLFxuICAgICAgICBleHByZXNzaW9uLCBuZXh0O1xuICAgIC8vY29uc29sZS5sb2coICdMSVNUJywgdGVybWluYXRvciApO1xuICAgIGlmKCAhdGhpcy5wZWVrKCB0ZXJtaW5hdG9yICkgKXtcbiAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICBpc051bWVyaWMgPSBuZXh0LnR5cGUgPT09IEdyYW1tYXIuTnVtZXJpY0xpdGVyYWw7XG5cbiAgICAgICAgLy8gRXhhbXBsZXM6IFsxLi4zXSwgWzUuLl0sIFsuLjddXG4gICAgICAgIGlmKCAoIGlzTnVtZXJpYyB8fCBuZXh0LnZhbHVlID09PSAnLicgKSAmJiB0aGlzLnBlZWtBdCggMSwgJy4nICkgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIFJBTkdFIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaXNOdW1lcmljID9cbiAgICAgICAgICAgICAgICB0aGlzLmxvb2t1cCggbmV4dCApIDpcbiAgICAgICAgICAgICAgICBudWxsO1xuICAgICAgICAgICAgbGlzdCA9IHRoaXMucmFuZ2VFeHByZXNzaW9uKCBleHByZXNzaW9uICk7XG5cbiAgICAgICAgLy8gRXhhbXBsZXM6IFsxLDIsM10sIFtcImFiY1wiLFwiZGVmXCJdLCBbZm9vLGJhcl0sIFt7Zm9vLmJhcn1dXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBBUlJBWSBPRiBFWFBSRVNTSU9OUycgKTtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXAoIG5leHQgKTtcbiAgICAgICAgICAgICAgICBsaXN0LnVuc2hpZnQoIGV4cHJlc3Npb24gKTtcbiAgICAgICAgICAgIH0gd2hpbGUoIHRoaXMuZXhwZWN0KCAnLCcgKSApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coICctIExJU1QgUkVTVUxUJywgbGlzdCApO1xuICAgIHJldHVybiBsaXN0O1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtMaXRlcmFsfSBUaGUgbGl0ZXJhbCBub2RlXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUubGl0ZXJhbCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRva2VuID0gdGhpcy5jb25zdW1lKCksXG4gICAgICAgIHJhdyA9IHRva2VuLnZhbHVlLFxuICAgICAgICBleHByZXNzaW9uO1xuXG4gICAgc3dpdGNoKCB0b2tlbi50eXBlICl7XG4gICAgICAgIGNhc2UgR3JhbW1hci5OdW1lcmljTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBuZXcgTm9kZS5OdW1lcmljTGl0ZXJhbCggcmF3ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBHcmFtbWFyLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gbmV3IE5vZGUuU3RyaW5nTGl0ZXJhbCggcmF3ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBHcmFtbWFyLk51bGxMaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IG5ldyBOb2RlLk51bGxMaXRlcmFsKCByYXcgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnTGl0ZXJhbCBleHBlY3RlZCcgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUubG9va3VwID0gZnVuY3Rpb24oIG5leHQgKXtcbiAgICB2YXIgZXhwcmVzc2lvbjtcbiAgICAvL2NvbnNvbGUubG9nKCAnTE9PS1VQJywgbmV4dCApO1xuICAgIHN3aXRjaCggbmV4dC50eXBlICl7XG4gICAgICAgIGNhc2UgR3JhbW1hci5JZGVudGlmaWVyOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuaWRlbnRpZmllcigpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR3JhbW1hci5OdW1lcmljTGl0ZXJhbDpcbiAgICAgICAgY2FzZSBHcmFtbWFyLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5saXRlcmFsKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBHcmFtbWFyLlB1bmN0dWF0b3I6XG4gICAgICAgICAgICBpZiggbmV4dC52YWx1ZSA9PT0gJ30nICl7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdW1lKCAnfScgKTtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5ibG9ja0V4cHJlc3Npb24oICd7JyApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAndG9rZW4gY2Fubm90IGJlIGEgbG9va3VwJyApO1xuICAgIH1cblxuICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcblxuICAgIGlmKCBuZXh0ICYmIG5leHQudmFsdWUgPT09ICclJyApe1xuICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXBFeHByZXNzaW9uKCBleHByZXNzaW9uICk7XG4gICAgfVxuICAgIGlmKCBuZXh0ICYmIG5leHQudmFsdWUgPT09ICd+JyApe1xuICAgICAgICBleHByZXNzaW9uID0gdGhpcy5yb290RXhwcmVzc2lvbiggZXhwcmVzc2lvbiApO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCAnLSBMT09LVVAgUkVTVUxUJywgZXhwcmVzc2lvbiApO1xuICAgIHJldHVybiBleHByZXNzaW9uO1xufTtcblxuYnVpbGRlclByb3RvdHlwZS5sb29rdXBFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSApe1xuICAgIHRoaXMuY29uc3VtZSggJyUnICk7XG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5Mb29rdXBFeHByZXNzaW9uKCBrZXkgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0V4cHJlc3Npb259IHByb3BlcnR5IFRoZSBleHByZXNzaW9uIGFzc2lnbmVkIHRvIHRoZSBwcm9wZXJ0eSBvZiB0aGUgbWVtYmVyIGV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gY29tcHV0ZWQgV2hldGhlciBvciBub3QgdGhlIG1lbWJlciBleHByZXNzaW9uIGlzIGNvbXB1dGVkXG4gKiBAcmV0dXJucyB7TWVtYmVyRXhwcmVzc2lvbn0gVGhlIG1lbWJlciBleHByZXNzaW9uXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUubWVtYmVyRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBwcm9wZXJ0eSwgY29tcHV0ZWQgKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnTUVNQkVSJywgcHJvcGVydHkgKTtcbiAgICB2YXIgb2JqZWN0ID0gdGhpcy5leHByZXNzaW9uKCk7XG4gICAgLy9jb25zb2xlLmxvZyggJ01FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIE9CSkVDVCcsIG9iamVjdCApO1xuICAgIC8vY29uc29sZS5sb2coICctIFBST1BFUlRZJywgcHJvcGVydHkgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBDT01QVVRFRCcsIGNvbXB1dGVkICk7XG4gICAgcmV0dXJuIGNvbXB1dGVkID9cbiAgICAgICAgbmV3IE5vZGUuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICkgOlxuICAgICAgICBuZXcgTm9kZS5TdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICk7XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oIGlucHV0ICl7XG4gICAgdGhpcy50b2tlbnMgPSB0aGlzLmxleGVyLmxleCggaW5wdXQgKTtcbiAgICByZXR1cm4gdGhpcy5idWlsZCggdGhpcy50b2tlbnMgKTtcbn07XG5cbi8qKlxuICogUHJvdmlkZXMgdGhlIG5leHQgdG9rZW4gaW4gdGhlIHRva2VuIGxpc3QgX3dpdGhvdXQgcmVtb3ZpbmcgaXRfLiBJZiBjb21wYXJpc29ucyBhcmUgcHJvdmlkZWQsIHRoZSB0b2tlbiB3aWxsIG9ubHkgYmUgcmV0dXJuZWQgaWYgdGhlIHZhbHVlIG1hdGNoZXMgb25lIG9mIHRoZSBjb21wYXJpc29ucy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmaXJzdF0gVGhlIGZpcnN0IGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbc2Vjb25kXSBUaGUgc2Vjb25kIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbdGhpcmRdIFRoZSB0aGlyZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZvdXJ0aF0gVGhlIGZvdXJ0aCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcmV0dXJucyB7TGV4ZXJ+VG9rZW59IFRoZSBuZXh0IHRva2VuIGluIHRoZSBsaXN0IG9yIGB1bmRlZmluZWRgIGlmIGl0IGRpZCBub3QgZXhpc3RcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKXtcbiAgICByZXR1cm4gdGhpcy5wZWVrQXQoIDAsIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKTtcbn07XG5cbi8qKlxuICogUHJvdmlkZXMgdGhlIHRva2VuIGF0IHRoZSByZXF1ZXN0ZWQgcG9zaXRpb24gX3dpdGhvdXQgcmVtb3ZpbmcgaXRfIGZyb20gdGhlIHRva2VuIGxpc3QuIElmIGNvbXBhcmlzb25zIGFyZSBwcm92aWRlZCwgdGhlIHRva2VuIHdpbGwgb25seSBiZSByZXR1cm5lZCBpZiB0aGUgdmFsdWUgbWF0Y2hlcyBvbmUgb2YgdGhlIGNvbXBhcmlzb25zLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gcG9zaXRpb24gVGhlIHBvc2l0aW9uIHdoZXJlIHRoZSB0b2tlbiB3aWxsIGJlIHBlZWtlZFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmaXJzdF0gVGhlIGZpcnN0IGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbc2Vjb25kXSBUaGUgc2Vjb25kIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbdGhpcmRdIFRoZSB0aGlyZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZvdXJ0aF0gVGhlIGZvdXJ0aCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcmV0dXJucyB7TGV4ZXJ+VG9rZW59IFRoZSB0b2tlbiBhdCB0aGUgcmVxdWVzdGVkIHBvc2l0aW9uIG9yIGB1bmRlZmluZWRgIGlmIGl0IGRpZCBub3QgZXhpc3RcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5wZWVrQXQgPSBmdW5jdGlvbiggcG9zaXRpb24sIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKXtcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy50b2tlbnMubGVuZ3RoLFxuICAgICAgICBpbmRleCwgdG9rZW4sIHZhbHVlO1xuXG4gICAgaWYoIGxlbmd0aCAmJiB0eXBlb2YgcG9zaXRpb24gPT09ICdudW1iZXInICYmIHBvc2l0aW9uID4gLTEgKXtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGEgemVyby1iYXNlZCBpbmRleCBzdGFydGluZyBmcm9tIHRoZSBlbmQgb2YgdGhlIGxpc3RcbiAgICAgICAgaW5kZXggPSBsZW5ndGggLSBwb3NpdGlvbiAtIDE7XG5cbiAgICAgICAgaWYoIGluZGV4ID4gLTEgJiYgaW5kZXggPCBsZW5ndGggKXtcbiAgICAgICAgICAgIHRva2VuID0gdGhpcy50b2tlbnNbIGluZGV4IF07XG4gICAgICAgICAgICB2YWx1ZSA9IHRva2VuLnZhbHVlO1xuXG4gICAgICAgICAgICBpZiggdmFsdWUgPT09IGZpcnN0IHx8IHZhbHVlID09PSBzZWNvbmQgfHwgdmFsdWUgPT09IHRoaXJkIHx8IHZhbHVlID09PSBmb3VydGggfHwgKCAhZmlyc3QgJiYgIXNlY29uZCAmJiAhdGhpcmQgJiYgIWZvdXJ0aCApICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZvaWQgMDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7UHJvZ3JhbX0gQSBwcm9ncmFtIG5vZGVcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5wcm9ncmFtID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgYm9keSA9IFtdO1xuICAgIC8vY29uc29sZS5sb2coICdQUk9HUkFNJyApO1xuICAgIHdoaWxlKCB0cnVlICl7XG4gICAgICAgIGlmKCB0aGlzLnRva2Vucy5sZW5ndGggKXtcbiAgICAgICAgICAgIGJvZHkudW5zaGlmdCggdGhpcy5leHByZXNzaW9uU3RhdGVtZW50KCkgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTm9kZS5Qcm9ncmFtKCBib2R5ICk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLnJhbmdlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCByaWdodCApe1xuICAgIHZhciBsZWZ0O1xuXG4gICAgdGhpcy5leHBlY3QoICcuJyApO1xuICAgIHRoaXMuZXhwZWN0KCAnLicgKTtcblxuICAgIGxlZnQgPSB0aGlzLnBlZWsoKS50eXBlID09PSBHcmFtbWFyLk51bWVyaWNMaXRlcmFsID9cbiAgICAgICAgbGVmdCA9IHRoaXMubGl0ZXJhbCgpIDpcbiAgICAgICAgbnVsbDtcblxuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuUmFuZ2VFeHByZXNzaW9uKCBsZWZ0LCByaWdodCApO1xufTtcblxuYnVpbGRlclByb3RvdHlwZS5yb290RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXkgKXtcbiAgICB0aGlzLmNvbnN1bWUoICd+JyApO1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuUm9vdEV4cHJlc3Npb24oIGtleSApO1xufTtcblxuYnVpbGRlclByb3RvdHlwZS5zZXF1ZW5jZUV4cHJlc3Npb24gPSBmdW5jdGlvbiggbGlzdCApe1xuICAgIHJldHVybiBuZXcgTm9kZS5TZXF1ZW5jZUV4cHJlc3Npb24oIGxpc3QgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZVxuICogQHRocm93cyB7ZXh0ZXJuYWw6U3ludGF4RXJyb3J9IFdoZW4gaXQgZXhlY3V0ZXNcbiAqL1xuYnVpbGRlclByb3RvdHlwZS50aHJvd0Vycm9yID0gZnVuY3Rpb24oIG1lc3NhZ2UgKXtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoIG1lc3NhZ2UgKTtcbn07IiwiLyoqXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6RnVuY3Rpb259IE1hcENhbGxiYWNrXG4gKiBAcGFyYW0geyp9IGl0ZW1cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxuICovXG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0FycmF5LUxpa2V9IGxpc3RcbiAqIEBwYXJhbSB7TWFwQ2FsbGJhY2t9IGNhbGxiYWNrXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1hcCggbGlzdCwgY2FsbGJhY2sgKXtcbiAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICBsZW5ndGggPSBsaXN0Lmxlbmd0aCxcbiAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBsZW5ndGggKTtcblxuICAgIHN3aXRjaCggbGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IGNhbGxiYWNrKCBsaXN0WyAwIF0sIDAsIGxpc3QgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IGNhbGxiYWNrKCBsaXN0WyAwIF0sIDAsIGxpc3QgKTtcbiAgICAgICAgICAgIHJlc3VsdFsgMSBdID0gY2FsbGJhY2soIGxpc3RbIDEgXSwgMSwgbGlzdCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gY2FsbGJhY2soIGxpc3RbIDAgXSwgMCwgbGlzdCApO1xuICAgICAgICAgICAgcmVzdWx0WyAxIF0gPSBjYWxsYmFjayggbGlzdFsgMSBdLCAxLCBsaXN0ICk7XG4gICAgICAgICAgICByZXN1bHRbIDIgXSA9IGNhbGxiYWNrKCBsaXN0WyAyIF0sIDIsIGxpc3QgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gY2FsbGJhY2soIGxpc3RbIGluZGV4IF0sIGluZGV4LCBsaXN0ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufSIsImltcG9ydCBoYXNPd25Qcm9wZXJ0eSBmcm9tICcuL2hhcy1vd24tcHJvcGVydHknO1xuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCBtYXAgZnJvbSAnLi9tYXAnO1xuaW1wb3J0ICogYXMgU3ludGF4IGZyb20gJy4vc3ludGF4JztcbmltcG9ydCAqIGFzIEtleXBhdGhTeW50YXggZnJvbSAnLi9rZXlwYXRoLXN5bnRheCc7XG5cbnZhciBub29wID0gZnVuY3Rpb24oKXt9LFxuXG4gICAgaW50ZXJwcmV0ZXJQcm90b3R5cGU7XG5cbi8qKlxuICogQGZ1bmN0aW9uIEludGVycHJldGVyfmdldHRlclxuICogQHBhcmFtIHtleHRlcm5hbDpPYmplY3R9IG9iamVjdFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGtleVxuICogQHJldHVybnMgeyp9IFRoZSB2YWx1ZSBvZiB0aGUgYGtleWAgcHJvcGVydHkgb24gYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGdldHRlciggb2JqZWN0LCBrZXkgKXtcbiAgICByZXR1cm4gb2JqZWN0WyBrZXkgXTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gSW50ZXJwcmV0ZXJ+cmV0dXJuWmVyb1xuICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gemVyb1xuICovXG5mdW5jdGlvbiByZXR1cm5aZXJvKCl7XG4gICAgcmV0dXJuIDA7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEludGVycHJldGVyfnNldHRlclxuICogQHBhcmFtIHtleHRlcm5hbDpPYmplY3R9IG9iamVjdFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IGtleVxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybnMgeyp9IFRoZSB2YWx1ZSBvZiB0aGUgYGtleWAgcHJvcGVydHkgb24gYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIHNldHRlciggb2JqZWN0LCBrZXksIHZhbHVlICl7XG4gICAgaWYoICFoYXNPd25Qcm9wZXJ0eSggb2JqZWN0LCBrZXkgKSApe1xuICAgICAgICBvYmplY3RbIGtleSBdID0gdmFsdWUgfHwge307XG4gICAgfVxuICAgIHJldHVybiBnZXR0ZXIoIG9iamVjdCwga2V5ICk7XG59XG5cbi8qKlxuICogQGNsYXNzIEludGVycHJldGVyXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge0J1aWxkZXJ9IGJ1aWxkZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSW50ZXJwcmV0ZXIoIGJ1aWxkZXIgKXtcbiAgICBpZiggIWFyZ3VtZW50cy5sZW5ndGggKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2J1aWxkZXIgY2Fubm90IGJlIHVuZGVmaW5lZCcgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfSBJbnRlcnByZXRlciNidWlsZGVyXG4gICAgICovXG4gICAgdGhpcy5idWlsZGVyID0gYnVpbGRlcjtcbn1cblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUgPSBJbnRlcnByZXRlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEludGVycHJldGVyO1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5hcnJheUV4cHJlc3Npb24gPSBmdW5jdGlvbiggZWxlbWVudHMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQVJSQVkgRVhQUkVTU0lPTicsIGVsZW1lbnRzLmxlbmd0aCApO1xuICAgIHZhciBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGZuLCBsaXN0O1xuXG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIGVsZW1lbnRzICkgKXtcbiAgICAgICAgbGlzdCA9IHRoaXMubGlzdEV4cHJlc3Npb24oIGVsZW1lbnRzLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlQXJyYXlFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBBUlJBWSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiBMSVNUYCwgbGlzdCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIga2V5LFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1hcCggbGlzdCwgZnVuY3Rpb24oIGV4cHJlc3Npb24gKXtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gZXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbiggc2NvcGUsIGtleSwgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIHJlc3VsdC5sZW5ndGggPT09IDEgJiYgKCByZXN1bHQgPSByZXN1bHRbIDAgXSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3QgPSB0aGlzLnJlY3Vyc2UoIGVsZW1lbnRzLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlQXJyYXlFeHByZXNzaW9uV2l0aEVsZW1lbnRSYW5nZSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQVJSQVkgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVBcnJheUV4cHJlc3Npb25XaXRoRWxlbWVudFJhbmdlIExJU1RgLCBsaXN0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVBcnJheUV4cHJlc3Npb25XaXRoRWxlbWVudFJhbmdlIERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgIHZhciBrZXlzID0gbGlzdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIGtleXMsIGZ1bmN0aW9uKCBrZXkgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbiggc2NvcGUsIGtleSwgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVBcnJheUV4cHJlc3Npb25XaXRoRWxlbWVudFJhbmdlIFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZuO1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuYmxvY2tFeHByZXNzaW9uID0gZnVuY3Rpb24oIHRva2VucywgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBCTE9DSycsIHRva2Vucy5qb2luKCAnJyApICk7XG4gICAgdmFyIHByb2dyYW0gPSB0aGlzLmJ1aWxkZXIuYnVpbGQoIHRva2VucyApLFxuICAgICAgICBleHByZXNzaW9uID0gdGhpcy5yZWN1cnNlKCBwcm9ncmFtLmJvZHlbIDAgXS5leHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUJsb2NrRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBCTE9DSycgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUJsb2NrRXhwcmVzc2lvbiBTQ09QRWAsIHNjb3BlICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVCbG9ja0V4cHJlc3Npb24gRVhQUkVTU0lPTmAsIGV4cHJlc3Npb24ubmFtZSApO1xuICAgICAgICB2YXIgcmVzdWx0ID0gZXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUJsb2NrRXhwcmVzc2lvbiBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBzY29wZSwgbmFtZTogdm9pZCAwLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5jYWxsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBjYWxsZWUsIGFyZ3MsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQ0FMTCBFWFBSRVNTSU9OJyApO1xuICAgIHZhciBpc1NldHRpbmcgPSBhc3NpZ24gPT09IHNldHRlcixcbiAgICAgICAgbGVmdCA9IHRoaXMucmVjdXJzZSggY2FsbGVlLCB0cnVlLCBhc3NpZ24gKSxcbiAgICAgICAgbGlzdCA9IHRoaXMubGlzdEV4cHJlc3Npb24oIGFyZ3MsIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlQ2FsbEV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQ0FMTCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ2FsbEV4cHJlc3Npb24gYXJnc2AsIGFyZ3MubGVuZ3RoICk7XG4gICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApLFxuICAgICAgICAgICAgYXJncyA9IG1hcCggbGlzdCwgZnVuY3Rpb24oIGV4cHJlc3Npb24gKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIH0gKSxcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNhbGxFeHByZXNzaW9uIExIU2AsIGxocyApO1xuICAgICAgICByZXN1bHQgPSBsaHMudmFsdWUuYXBwbHkoIGxocy5jb250ZXh0LCBhcmdzICk7XG4gICAgICAgIGlmKCBpc1NldHRpbmcgJiYgdHlwZW9mIGxocy52YWx1ZSA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdjYW5ub3QgY3JlYXRlIGNhbGwgZXhwcmVzc2lvbnMnICk7XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNhbGxFeHByZXNzaW9uIFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfTpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBleHByZXNzaW9uXG4gKi9cbmludGVycHJldGVyUHJvdG90eXBlLmNvbXBpbGUgPSBmdW5jdGlvbiggZXhwcmVzc2lvbiwgY3JlYXRlICl7XG4gICAgdmFyIHByb2dyYW0gPSB0aGlzLmJ1aWxkZXIuYnVpbGQoIGV4cHJlc3Npb24gKSxcbiAgICAgICAgYm9keSA9IHByb2dyYW0uYm9keSxcbiAgICAgICAgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBhc3NpZ24sIGV4cHJlc3Npb25zLCBmbjtcblxuICAgIGlmKCB0eXBlb2YgY3JlYXRlICE9PSAnYm9vbGVhbicgKXtcbiAgICAgICAgY3JlYXRlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaW50ZXJwcmV0ZXIuZGVwdGggPSAtMTtcbiAgICBpbnRlcnByZXRlci5pc0xlZnRTcGxpdCA9IGZhbHNlO1xuICAgIGludGVycHJldGVyLmlzUmlnaHRTcGxpdCA9IGZhbHNlO1xuICAgIGludGVycHJldGVyLmlzU3BsaXQgPSBmYWxzZTtcblxuICAgIGFzc2lnbiA9IGNyZWF0ZSA/XG4gICAgICAgIHNldHRlciA6XG4gICAgICAgIGdldHRlcjtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgKi9cbiAgICBpbnRlcnByZXRlci5leHByZXNzaW9uID0gdGhpcy5idWlsZGVyLnRleHQ7XG4gICAgLy9jb25zb2xlLmxvZyggJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJ0ludGVycHJldGluZyAnLCBleHByZXNzaW9uICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJ1Byb2dyYW0nLCBwcm9ncmFtLnJhbmdlICk7XG4gICAgc3dpdGNoKCBib2R5Lmxlbmd0aCApe1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBmbiA9IG5vb3A7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgZm4gPSBpbnRlcnByZXRlci5yZWN1cnNlKCBib2R5WyAwIF0uZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBleHByZXNzaW9ucyA9IG1hcCggYm9keSwgZnVuY3Rpb24oIHN0YXRlbWVudCApe1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlci5yZWN1cnNlKCBzdGF0ZW1lbnQuZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlUHJvZ3JhbSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWVzID0gbWFwKCBleHByZXNzaW9ucywgZnVuY3Rpb24oIGV4cHJlc3Npb24gKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBleHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVzWyB2YWx1ZXMubGVuZ3RoIC0gMSBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCAnRk4nLCBmbi5uYW1lICk7XG4gICAgcmV0dXJuIGZuO1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuY29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uID0gZnVuY3Rpb24oIG9iamVjdCwgcHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQ09NUFVURUQgTUVNQkVSIEVYUFJFU1NJT04nLCBvYmplY3QudHlwZSwgcHJvcGVydHkudHlwZSApO1xuICAgIHZhciBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgaXNTYWZlID0gb2JqZWN0LnR5cGUgPT09IEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uLFxuICAgICAgICBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBvYmplY3QsIGZhbHNlLCBhc3NpZ24gKSxcbiAgICAgICAgcmlnaHQgPSB0aGlzLnJlY3Vyc2UoIHByb3BlcnR5LCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICBpZiggIWludGVycHJldGVyLmlzU3BsaXQgKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIENPTVBVVEVEIE1FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBMRUZUIGAsIGxlZnQubmFtZSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSSUdIVGAsIHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdCwgcmhzO1xuICAgICAgICAgICAgaWYoICFpc1NhZmUgfHwgbGhzICl7XG4gICAgICAgICAgICAgICAgcmhzID0gcmlnaHQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBMSFNgLCBsaHMgKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJIU2AsIHJocyApO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggbGhzLCByaHMsICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmKCBpbnRlcnByZXRlci5pc0xlZnRTcGxpdCAmJiAhaW50ZXJwcmV0ZXIuaXNSaWdodFNwbGl0ICl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBDT01QVVRFRCBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gTEVGVCBgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUklHSFRgLCByaWdodC5uYW1lICk7XG4gICAgICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICByZXN1bHQsIHJocztcbiAgICAgICAgICAgIGlmKCAhaXNTYWZlIHx8IGxocyApe1xuICAgICAgICAgICAgICAgIHJocyA9IHJpZ2h0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gTEhTYCwgbGhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSSFNgLCByaHMgKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIGxocywgZnVuY3Rpb24oIG9iamVjdCApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzaWduKCBvYmplY3QsIHJocywgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmKCAhaW50ZXJwcmV0ZXIuaXNMZWZ0U3BsaXQgJiYgaW50ZXJwcmV0ZXIuaXNSaWdodFNwbGl0ICl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBDT01QVVRFRCBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gTEVGVCBgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUklHSFRgLCByaWdodC5uYW1lICk7XG4gICAgICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICByZXN1bHQsIHJocztcbiAgICAgICAgICAgIGlmKCAhaXNTYWZlIHx8IGxocyApe1xuICAgICAgICAgICAgICAgIHJocyA9IHJpZ2h0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gTEhTYCwgbGhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSSFNgLCByaHMgKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIHJocywgZnVuY3Rpb24oIGtleSApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzaWduKCBsaHMsIGtleSwgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIENPTVBVVEVEIE1FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBMRUZUIGAsIGxlZnQubmFtZSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSSUdIVGAsIHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdCwgcmhzO1xuICAgICAgICAgICAgaWYoICFpc1NhZmUgfHwgbGhzICl7XG4gICAgICAgICAgICAgICAgcmhzID0gcmlnaHQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBMSFNgLCBsaHMgKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJIU2AsIHJocyApO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1hcCggbGhzLCBmdW5jdGlvbiggb2JqZWN0ICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXAoIHJocywgZnVuY3Rpb24oIGtleSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbiggb2JqZWN0LCBrZXksICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuZXhpc3RlbnRpYWxFeHByZXNzaW9uID0gZnVuY3Rpb24oIGV4cHJlc3Npb24sIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgRVhJU1RFTlRJQUwgRVhQUkVTU0lPTicsIGV4cHJlc3Npb24udHlwZSApO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBleHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUV4aXN0ZW50aWFsRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBFWElTVEVOVElBTCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlRXhpc3RlbnRpYWxFeHByZXNzaW9uIExFRlRgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgaWYoIHNjb3BlICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdm9pZCAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVFeGlzdGVudGlhbEV4cHJlc3Npb24gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuaWRlbnRpZmllciA9IGZ1bmN0aW9uKCBuYW1lLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIElERU5USUZJRVInLCBuYW1lICk7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlSWRlbnRpZmllciggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBJREVOVElGSUVSJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlSWRlbnRpZmllciBOQU1FYCwgbmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlSWRlbnRpZmllciBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVJZGVudGlmaWVyIFZBTFVFYCwgdmFsdWUgKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFzc2lnbiggc2NvcGUsIG5hbWUsICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUlkZW50aWZpZXIgUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogc2NvcGUsIG5hbWU6IG5hbWUsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmxpc3RFeHByZXNzaW9uID0gZnVuY3Rpb24oIGl0ZW1zLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzO1xuICAgIHJldHVybiBtYXAoIGl0ZW1zLCBmdW5jdGlvbiggaXRlbSApe1xuICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIubGlzdEV4cHJlc3Npb25FbGVtZW50KCBpdGVtLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICB9ICk7XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5saXN0RXhwcmVzc2lvbkVsZW1lbnQgPSBmdW5jdGlvbiggZWxlbWVudCwgY29udGV4dCwgYXNzaWduICl7XG4gICAgc3dpdGNoKCBlbGVtZW50LnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguTGl0ZXJhbDpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpdGVyYWwoIGVsZW1lbnQudmFsdWUsIGNvbnRleHQgKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb29rdXBFeHByZXNzaW9uKCBlbGVtZW50LmtleSwgZmFsc2UsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yb290RXhwcmVzc2lvbiggZWxlbWVudC5rZXksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguQmxvY2tFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tFeHByZXNzaW9uKCBlbGVtZW50LmJvZHksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ1VuZXhwZWN0ZWQgbGlzdCBlbGVtZW50IHR5cGUgJyArIGVsZW1lbnQudHlwZSApO1xuICAgIH1cbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmxpdGVyYWwgPSBmdW5jdGlvbiggdmFsdWUsIGNvbnRleHQgKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIExJVEVSQUwnLCB2YWx1ZSApO1xuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlTGl0ZXJhbCgpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIExJVEVSQUwnICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVMaXRlcmFsIFJFU1VMVGAsIHZhbHVlICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogdm9pZCAwLCBuYW1lOiB2b2lkIDAsIHZhbHVlOiB2YWx1ZSB9IDpcbiAgICAgICAgICAgIHZhbHVlO1xuICAgIH07XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5sb29rdXBFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSwgcmVzb2x2ZSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBMT09LVVAgRVhQUkVTU0lPTicsIGtleSApO1xuICAgIHZhciBpc0xlZnRGdW5jdGlvbiA9IGZhbHNlLFxuICAgICAgICBsaHMgPSB7fSxcbiAgICAgICAgbGVmdDtcblxuICAgIHN3aXRjaCgga2V5LnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmlkZW50aWZpZXIoIGtleS5uYW1lLCB0cnVlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGlzTGVmdEZ1bmN0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5MaXRlcmFsOlxuICAgICAgICAgICAgbGhzLnZhbHVlID0gbGVmdCA9IGtleS52YWx1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGVmdCA9IHRoaXMucmVjdXJzZSgga2V5LCB0cnVlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGlzTGVmdEZ1bmN0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlTG9va3VwRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBMT09LVVAgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUxvb2t1cEV4cHJlc3Npb24gTEVGVGAsIGxlZnQubmFtZSB8fCBsZWZ0ICk7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmKCBpc0xlZnRGdW5jdGlvbiApe1xuICAgICAgICAgICAgbGhzID0gbGVmdCggbG9va3VwLCB2YWx1ZSwgc2NvcGUgKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGxocy52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggbG9va3VwLCBsaHMudmFsdWUsIHZvaWQgMCApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlc29sdmUgbG9va3VwcyB0aGF0IGFyZSB0aGUgb2JqZWN0IG9mIGFuIG9iamVjdC1wcm9wZXJ0eSByZWxhdGlvbnNoaXBcbiAgICAgICAgaWYoIHJlc29sdmUgKXtcbiAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggc2NvcGUsIHJlc3VsdCwgdm9pZCAwICk7XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUxvb2t1cEV4cHJlc3Npb24gTEhTYCwgbGhzICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVMb29rdXBFeHByZXNzaW9uIFJFU1VMVGAsIHJlc3VsdCAgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyBjb250ZXh0OiBsb29rdXAsIG5hbWU6IGxocy52YWx1ZSwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUucmFuZ2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIGxvd2VyLCB1cHBlciwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBSQU5HRSBFWFBSRVNTSU9OJyApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGxlZnQgPSBsb3dlciAhPT0gbnVsbCA/XG4gICAgICAgICAgICBpbnRlcnByZXRlci5yZWN1cnNlKCBsb3dlciwgZmFsc2UsIGFzc2lnbiApIDpcbiAgICAgICAgICAgIHJldHVyblplcm8sXG4gICAgICAgIHJpZ2h0ID0gdXBwZXIgIT09IG51bGwgP1xuICAgICAgICAgICAgaW50ZXJwcmV0ZXIucmVjdXJzZSggdXBwZXIsIGZhbHNlLCBhc3NpZ24gKSA6XG4gICAgICAgICAgICByZXR1cm5aZXJvLFxuICAgICAgICBpbmRleCwgbGhzLCBtaWRkbGUsIHJlc3VsdCwgcmhzO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVSYW5nZUV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgUkFOR0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiBMRUZUYCwgbGVmdC5uYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVSYW5nZUV4cHJlc3Npb24gUklHSFRgLCByaWdodC5uYW1lICk7XG4gICAgICAgIGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgIHJocyA9IHJpZ2h0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgaW5kZXggPSAxO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlUmFuZ2VFeHByZXNzaW9uIExIU2AsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlUmFuZ2VFeHByZXNzaW9uIFJIU2AsIHJocyApO1xuICAgICAgICByZXN1bHRbIDAgXSA9IGxocztcbiAgICAgICAgaWYoIGxocyA8IHJocyApe1xuICAgICAgICAgICAgbWlkZGxlID0gbGhzICsgMTtcbiAgICAgICAgICAgIHdoaWxlKCBtaWRkbGUgPCByaHMgKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4KysgXSA9IG1pZGRsZSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYoIGxocyA+IHJocyApe1xuICAgICAgICAgICAgbWlkZGxlID0gbGhzIC0gMTtcbiAgICAgICAgICAgIHdoaWxlKCBtaWRkbGUgPiByaHMgKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4KysgXSA9IG1pZGRsZS0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdFsgcmVzdWx0Lmxlbmd0aCBdID0gcmhzO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlUmFuZ2VFeHByZXNzaW9uIFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbmludGVycHJldGVyUHJvdG90eXBlLnJlY3Vyc2UgPSBmdW5jdGlvbiggbm9kZSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ1JlY3Vyc2luZycsIG5vZGUudHlwZSApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGV4cHJlc3Npb24gPSBudWxsO1xuXG4gICAgaW50ZXJwcmV0ZXIuZGVwdGgrKztcblxuICAgIHN3aXRjaCggbm9kZS50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LkFycmF5RXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5hcnJheUV4cHJlc3Npb24oIG5vZGUuZWxlbWVudHMsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgaW50ZXJwcmV0ZXIuaXNTcGxpdCA9IGludGVycHJldGVyLmlzTGVmdFNwbGl0ID0gbm9kZS5lbGVtZW50cy5sZW5ndGggPiAxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LkNhbGxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmNhbGxFeHByZXNzaW9uKCBub2RlLmNhbGxlZSwgbm9kZS5hcmd1bWVudHMsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5CbG9ja0V4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuYmxvY2tFeHByZXNzaW9uKCBub2RlLmJvZHksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuZXhpc3RlbnRpYWxFeHByZXNzaW9uKCBub2RlLmV4cHJlc3Npb24sIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LklkZW50aWZpZXI6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuaWRlbnRpZmllciggbm9kZS5uYW1lLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5MaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmxpdGVyYWwoIG5vZGUudmFsdWUsIGNvbnRleHQgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5NZW1iZXJFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IG5vZGUuY29tcHV0ZWQgP1xuICAgICAgICAgICAgICAgIGludGVycHJldGVyLmNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggbm9kZS5vYmplY3QsIG5vZGUucHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApIDpcbiAgICAgICAgICAgICAgICBpbnRlcnByZXRlci5zdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBub2RlLm9iamVjdCwgbm9kZS5wcm9wZXJ0eSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIubG9va3VwRXhwcmVzc2lvbiggbm9kZS5rZXksIGZhbHNlLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguUmFuZ2VFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLnJhbmdlRXhwcmVzc2lvbiggbm9kZS5sZWZ0LCBub2RlLnJpZ2h0LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIucm9vdEV4cHJlc3Npb24oIG5vZGUua2V5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5TZXF1ZW5jZUV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuc2VxdWVuY2VFeHByZXNzaW9uKCBub2RlLmV4cHJlc3Npb25zLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGludGVycHJldGVyLmlzU3BsaXQgPSBpbnRlcnByZXRlci5pc1JpZ2h0U3BsaXQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnVW5rbm93biBub2RlIHR5cGUgJyArIG5vZGUudHlwZSApO1xuICAgIH1cblxuICAgIGludGVycHJldGVyLmRlcHRoLS07XG5cbiAgICByZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLnJvb3RFeHByZXNzaW9uID0gZnVuY3Rpb24oIGtleSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBST09UIEVYUFJFU1NJT04nICk7XG4gICAgdmFyIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIGtleSwgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVSb290RXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBST09UIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVSb290RXhwcmVzc2lvbiBMRUZUYCwgbGVmdC5uYW1lIHx8IGxlZnQgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVJvb3RFeHByZXNzaW9uIFNDT1BFYCwgc2NvcGUgKTtcbiAgICAgICAgdmFyIGxocywgcmVzdWx0O1xuICAgICAgICByZXN1bHQgPSBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlUm9vdEV4cHJlc3Npb24gTEhTYCwgbGhzICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVSb290RXhwcmVzc2lvbiBSRVNVTFRgLCByZXN1bHQgICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogbG9va3VwLCBuYW1lOiBsaHMudmFsdWUsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLnNlcXVlbmNlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBleHByZXNzaW9ucywgY29udGV4dCwgYXNzaWduICl7XG4gICAgdmFyIGZuLCBsaXN0O1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgU0VRVUVOQ0UgRVhQUkVTU0lPTicgKTtcbiAgICBpZiggQXJyYXkuaXNBcnJheSggZXhwcmVzc2lvbnMgKSApe1xuICAgICAgICBsaXN0ID0gdGhpcy5saXN0RXhwcmVzc2lvbiggZXhwcmVzc2lvbnMsIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgICAgICBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFNFUVVFTkNFIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uIExJU1RgLCBsaXN0ICk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbWFwKCBsaXN0LCBmdW5jdGlvbiggZXhwcmVzc2lvbiApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uIFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdCA9IHRoaXMucmVjdXJzZSggZXhwcmVzc2lvbnMsIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgICAgICBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb25XaXRoRXhwcmVzc2lvblJhbmdlKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTRVFVRU5DRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbldpdGhFeHByZXNzaW9uUmFuZ2UgTElTVGAsIGxpc3QubmFtZSApO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGxpc3QoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uV2l0aEV4cHJlc3Npb25SYW5nZSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmbjtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLnN0YXRpY01lbWJlckV4cHJlc3Npb24gPSBmdW5jdGlvbiggb2JqZWN0LCBwcm9wZXJ0eSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBTVEFUSUMgTUVNQkVSIEVYUFJFU1NJT04nLCBvYmplY3QudHlwZSwgcHJvcGVydHkudHlwZSApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgaXNSaWdodEZ1bmN0aW9uID0gZmFsc2UsXG4gICAgICAgIGlzU2FmZSA9IGZhbHNlLFxuICAgICAgICBsZWZ0LCByaHMsIHJpZ2h0O1xuXG4gICAgc3dpdGNoKCBvYmplY3QudHlwZSApe1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmxvb2t1cEV4cHJlc3Npb24oIG9iamVjdC5rZXksIHRydWUsIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgaXNTYWZlID0gdHJ1ZTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIG9iamVjdCwgZmFsc2UsIGFzc2lnbiApO1xuICAgIH1cblxuICAgIHN3aXRjaCggcHJvcGVydHkudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5JZGVudGlmaWVyOlxuICAgICAgICAgICAgcmhzID0gcmlnaHQgPSBwcm9wZXJ0eS5uYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByaWdodCA9IHRoaXMucmVjdXJzZSggcHJvcGVydHksIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGlzUmlnaHRGdW5jdGlvbiA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYoICFpbnRlcnByZXRlci5pc1NwbGl0ICl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgU1RBVElDIE1FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gTEVGVGAsIGxlZnQubmFtZSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gUklHSFRgLCByaHMgfHwgcmlnaHQubmFtZSApO1xuICAgICAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICksXG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuXG4gICAgICAgICAgICBpZiggIWlzU2FmZSB8fCBsaHMgKXtcbiAgICAgICAgICAgICAgICBpZiggaXNSaWdodEZ1bmN0aW9uICl7XG4gICAgICAgICAgICAgICAgICAgIHJocyA9IHJpZ2h0KCBwcm9wZXJ0eS50eXBlID09PSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uID8gc2NvcGUgOiBsaHMsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gTEhTYCwgbGhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gUkhTYCwgcmhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGFzc2lnbiggbGhzLCByaHMsICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgY29udGV4dDogbGhzLCBuYW1lOiByaHMsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgU1RBVElDIE1FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gTEVGVGAsIGxlZnQubmFtZSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gUklHSFRgLCByaHMgfHwgcmlnaHQubmFtZSApO1xuICAgICAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICksXG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuXG4gICAgICAgICAgICBpZiggIWlzU2FmZSB8fCBsaHMgKXtcbiAgICAgICAgICAgICAgICBpZiggaXNSaWdodEZ1bmN0aW9uICl7XG4gICAgICAgICAgICAgICAgICAgIHJocyA9IHJpZ2h0KCBwcm9wZXJ0eS50eXBlID09PSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uID8gc2NvcGUgOiBsaHMsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gTEhTYCwgbGhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gUkhTYCwgcmhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1hcCggbGhzLCBmdW5jdGlvbiggb2JqZWN0ICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIG9iamVjdCwgcmhzLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyBjb250ZXh0OiBsaHMsIG5hbWU6IHJocywgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCBMZXhlciBmcm9tICcuL2xleGVyJztcbmltcG9ydCBCdWlsZGVyIGZyb20gJy4vYnVpbGRlcic7XG5pbXBvcnQgSW50ZXJwcmV0ZXIgZnJvbSAnLi9pbnRlcnByZXRlcic7XG5pbXBvcnQgaGFzT3duUHJvcGVydHkgZnJvbSAnLi9oYXMtb3duLXByb3BlcnR5JztcblxudmFyIGxleGVyID0gbmV3IExleGVyKCksXG4gICAgYnVpbGRlciA9IG5ldyBCdWlsZGVyKCBsZXhlciApLFxuICAgIGludHJlcHJldGVyID0gbmV3IEludGVycHJldGVyKCBidWlsZGVyICksXG5cbiAgICBjYWNoZTtcblxuLyoqXG4gKiBAY2xhc3MgS2V5cGF0aEV4cFxuICogQGV4dGVuZHMgVHJhbnNkdWNlclxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHBhdHRlcm5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBmbGFnc1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBLZXlwYXRoRXhwKCBwYXR0ZXJuLCBmbGFncyApe1xuICAgIHR5cGVvZiBwYXR0ZXJuICE9PSAnc3RyaW5nJyAmJiAoIHBhdHRlcm4gPSAnJyApO1xuICAgIHR5cGVvZiBmbGFncyAhPT0gJ3N0cmluZycgJiYgKCBmbGFncyA9ICcnICk7XG5cbiAgICB2YXIgdG9rZW5zO1xuXG4gICAgaWYoIGZsYWdzLmluZGV4T2YoICdjJyApICE9PSAtMSApe1xuICAgICAgICBpZiggIWNhY2hlICl7XG4gICAgICAgICAgICBjYWNoZSA9IG5ldyBOdWxsKCk7XG4gICAgICAgIH1cbiAgICAgICAgdG9rZW5zID0gaGFzT3duUHJvcGVydHkoIGNhY2hlLCBwYXR0ZXJuICkgP1xuICAgICAgICAgICAgY2FjaGVbIHBhdHRlcm4gXSA6XG4gICAgICAgICAgICBjYWNoZVsgcGF0dGVybiBdID0gbGV4ZXIubGV4KCBwYXR0ZXJuICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdG9rZW5zID0gbGV4ZXIubGV4KCBwYXR0ZXJuICk7XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIHRoaXMsIHtcbiAgICAgICAgJ2ZsYWdzJzoge1xuICAgICAgICAgICAgdmFsdWU6IGZsYWdzLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgJ3NvdXJjZSc6IHtcbiAgICAgICAgICAgIHZhbHVlOiBwYXR0ZXJuLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgJ2dldHRlcic6IHtcbiAgICAgICAgICAgIHZhbHVlOiBpbnRyZXByZXRlci5jb21waWxlKCB0b2tlbnMsIGZhbHNlICksXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgJ3NldHRlcic6IHtcbiAgICAgICAgICAgIHZhbHVlOiBpbnRyZXByZXRlci5jb21waWxlKCB0b2tlbnMsIHRydWUgKSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSApO1xufVxuXG5LZXlwYXRoRXhwLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbktleXBhdGhFeHAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gS2V5cGF0aEV4cDtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuS2V5cGF0aEV4cC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oIHRhcmdldCwgbG9va3VwICl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0dGVyKCB0YXJnZXQsIHVuZGVmaW5lZCwgbG9va3VwICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5LZXlwYXRoRXhwLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiggdGFyZ2V0LCBsb29rdXAgKXtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5nZXR0ZXIoIHRhcmdldCwgdW5kZWZpbmVkLCBsb29rdXAgKTtcbiAgICByZXR1cm4gdHlwZW9mIHJlc3VsdCAhPT0gJ3VuZGVmaW5lZCc7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5LZXlwYXRoRXhwLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiggdGFyZ2V0LCB2YWx1ZSwgbG9va3VwICl7XG4gICAgcmV0dXJuIHRoaXMuc2V0dGVyKCB0YXJnZXQsIHZhbHVlLCBsb29rdXAgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbktleXBhdGhFeHAucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi5mbGFncyA9IHRoaXMuZmxhZ3M7XG4gICAganNvbi5zb3VyY2UgPSB0aGlzLnNvdXJjZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuS2V5cGF0aEV4cC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbn07IiwiaW1wb3J0IEtleXBhdGhFeHAgZnJvbSAnLi9leHAnO1xuaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcblxudmFyIGNhY2hlID0gbmV3IE51bGwoKTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6RnVuY3Rpb259IEtleXBhdGhDYWxsYmFja1xuICogQHBhcmFtIHsqfSB0YXJnZXQgVGhlIG9iamVjdCBvbiB3aGljaCB0aGUga2V5cGF0aCB3aWxsIGJlIGV4ZWN1dGVkXG4gKiBAcGFyYW0geyp9IFt2YWx1ZV0gVGhlIG9wdGlvbmFsIHZhbHVlIHRoYXQgd2lsbCBiZSBzZXQgYXQgdGhlIGtleXBhdGhcbiAqIEByZXR1cm5zIHsqfSBUaGUgdmFsdWUgYXQgdGhlIGVuZCBvZiB0aGUga2V5cGF0aCBvciB1bmRlZmluZWQgaWYgdGhlIHZhbHVlIHdhcyBiZWluZyBzZXRcbiAqL1xuXG4vKipcbiAqIEEgdGVtcGxhdGUgbGl0ZXJhbCB0YWcgZm9yIGtleXBhdGggcHJvY2Vzc2luZy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtBcnJheTxleHRlcm5hbDpzdHJpbmc+fSBsaXRlcmFsc1xuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gdmFsdWVzXG4gKiBAcmV0dXJucyB7S2V5cGF0aENhbGxiYWNrfVxuICogQGV4YW1wbGVcbiAqIGNvbnN0IG9iamVjdCA9IHsgZm9vOiB7IGJhcjogeyBxdXg6IHsgYmF6OiAnZnV6JyB9IH0gfSB9LFxuICogIGdldEJheiA9ICggdGFyZ2V0ICkgPT4ga3BgZm9vLmJhci5xdXguYmF6YCggdGFyZ2V0ICk7XG4gKlxuICogY29uc29sZS5sb2coIGdldEJheiggb2JqZWN0ICkgKTsgLy8gXCJmdXpcIlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBrcCggbGl0ZXJhbHMvKiwgLi4udmFsdWVzKi8gKXtcbiAgICB2YXIgaW5kZXgsIGtleXBhdGgsIGtwZXgsIGxlbmd0aCwgdmFsdWVzO1xuXG4gICAgaWYoIGFyZ3VtZW50cy5sZW5ndGggPiAxICl7XG4gICAgICAgIGluZGV4ID0gMCxcbiAgICAgICAgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgdmFsdWVzID0gbmV3IEFycmF5KCBsZW5ndGggKTtcblxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KysgKXtcbiAgICAgICAgICAgIHZhbHVlc1sgaW5kZXggXSA9IGFyZ3VtZW50c1sgaW5kZXggKyAxIF07XG4gICAgICAgIH1cblxuICAgICAgICBrZXlwYXRoID0gbGl0ZXJhbHMucmVkdWNlKCBmdW5jdGlvbiggYWNjdW11bGF0b3IsIHBhcnQsIGluZGV4ICl7XG4gICAgICAgICAgICByZXR1cm4gYWNjdW11bGF0b3IgKyB2YWx1ZXNbIGluZGV4IC0gMSBdICsgcGFydDtcbiAgICAgICAgfSApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlcyA9IFtdO1xuICAgICAgICBrZXlwYXRoID0gbGl0ZXJhbHNbIDAgXTtcbiAgICB9XG5cbiAgICBrcGV4ID0ga2V5cGF0aCBpbiBjYWNoZSA/XG4gICAgICAgIGNhY2hlWyBrZXlwYXRoIF0gOlxuICAgICAgICBjYWNoZVsga2V5cGF0aCBdID0gbmV3IEtleXBhdGhFeHAoIGtleXBhdGggKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiggdGFyZ2V0LCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMSA/XG4gICAgICAgICAgICBrcGV4LnNldCggdGFyZ2V0LCB2YWx1ZSwgbG9va3VwICkgOlxuICAgICAgICAgICAga3BleC5nZXQoIHRhcmdldCwgbG9va3VwICk7XG4gICAgfTtcbn0iXSwibmFtZXMiOlsiSWRlbnRpZmllciIsIk51bWVyaWNMaXRlcmFsIiwiTnVsbExpdGVyYWwiLCJQdW5jdHVhdG9yIiwiU3RyaW5nTGl0ZXJhbCIsIkdyYW1tYXIuSWRlbnRpZmllciIsIkdyYW1tYXIuTnVtZXJpY0xpdGVyYWwiLCJHcmFtbWFyLk51bGxMaXRlcmFsIiwiR3JhbW1hci5QdW5jdHVhdG9yIiwiR3JhbW1hci5TdHJpbmdMaXRlcmFsIiwiQ2hhcmFjdGVyLmlzSWRlbnRpZmllclN0YXJ0IiwiQ2hhcmFjdGVyLmlzSWRlbnRpZmllclBhcnQiLCJUb2tlbi5OdWxsTGl0ZXJhbCIsIlRva2VuLklkZW50aWZpZXIiLCJDaGFyYWN0ZXIuaXNQdW5jdHVhdG9yIiwiVG9rZW4uUHVuY3R1YXRvciIsIkNoYXJhY3Rlci5pc1F1b3RlIiwiVG9rZW4uU3RyaW5nTGl0ZXJhbCIsIkNoYXJhY3Rlci5pc051bWVyaWMiLCJUb2tlbi5OdW1lcmljTGl0ZXJhbCIsIkNoYXJhY3Rlci5pc1doaXRlc3BhY2UiLCJBcnJheUV4cHJlc3Npb24iLCJDYWxsRXhwcmVzc2lvbiIsIkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJMaXRlcmFsIiwiTWVtYmVyRXhwcmVzc2lvbiIsIlByb2dyYW0iLCJTZXF1ZW5jZUV4cHJlc3Npb24iLCJTeW50YXguTGl0ZXJhbCIsIlN5bnRheC5NZW1iZXJFeHByZXNzaW9uIiwiU3ludGF4LlByb2dyYW0iLCJTeW50YXguQXJyYXlFeHByZXNzaW9uIiwiU3ludGF4LkNhbGxFeHByZXNzaW9uIiwiU3ludGF4LkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJTeW50YXguSWRlbnRpZmllciIsIlN5bnRheC5TZXF1ZW5jZUV4cHJlc3Npb24iLCJCbG9ja0V4cHJlc3Npb24iLCJFeGlzdGVudGlhbEV4cHJlc3Npb24iLCJMb29rdXBFeHByZXNzaW9uIiwiUmFuZ2VFeHByZXNzaW9uIiwiUm9vdEV4cHJlc3Npb24iLCJTY29wZUV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguUmFuZ2VFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiIsIk5vZGUuQXJyYXlFeHByZXNzaW9uIiwiS2V5cGF0aE5vZGUuQmxvY2tFeHByZXNzaW9uIiwiTm9kZS5DYWxsRXhwcmVzc2lvbiIsIktleXBhdGhOb2RlLkV4aXN0ZW50aWFsRXhwcmVzc2lvbiIsIk5vZGUuRXhwcmVzc2lvblN0YXRlbWVudCIsIk5vZGUuSWRlbnRpZmllciIsIk5vZGUuTnVtZXJpY0xpdGVyYWwiLCJOb2RlLlN0cmluZ0xpdGVyYWwiLCJOb2RlLk51bGxMaXRlcmFsIiwiS2V5cGF0aE5vZGUuTG9va3VwRXhwcmVzc2lvbiIsIk5vZGUuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIiwiTm9kZS5TdGF0aWNNZW1iZXJFeHByZXNzaW9uIiwiTm9kZS5Qcm9ncmFtIiwiS2V5cGF0aE5vZGUuUmFuZ2VFeHByZXNzaW9uIiwiS2V5cGF0aE5vZGUuUm9vdEV4cHJlc3Npb24iLCJOb2RlLlNlcXVlbmNlRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguQmxvY2tFeHByZXNzaW9uIiwiY2FjaGUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7OztBQUtBLEFBQWUsU0FBUyxJQUFJLEVBQUUsRUFBRTtBQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDdkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLElBQUksSUFBSTs7QUNQM0IsU0FBUyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUU7SUFDcEMsT0FBTyxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7Q0FDekQ7O0FBRUQsQUFBTyxTQUFTLGlCQUFpQixFQUFFLElBQUksRUFBRTtJQUNyQyxPQUFPLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssR0FBRyxDQUFDO0NBQ25HOztBQUVELEFBQU8sU0FBUyxTQUFTLEVBQUUsSUFBSSxFQUFFO0lBQzdCLE9BQU8sR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDO0NBQ3JDOztBQUVELEFBQU8sU0FBUyxZQUFZLEVBQUUsSUFBSSxFQUFFO0lBQ2hDLE9BQU8sY0FBYyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztDQUNoRDs7QUFFRCxBQUFPLFNBQVMsT0FBTyxFQUFFLElBQUksRUFBRTtJQUMzQixPQUFPLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxLQUFLLEdBQUcsQ0FBQztDQUN2Qzs7QUFFRCxBQUFPLFNBQVMsWUFBWSxFQUFFLElBQUksRUFBRTtJQUNoQyxP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
