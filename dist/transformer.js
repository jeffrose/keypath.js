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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VzIjpbIm51bGwuanMiLCJjaGFyYWN0ZXIuanMiLCJncmFtbWFyLmpzIiwidG9rZW4uanMiLCJsZXhlci5qcyIsInN5bnRheC5qcyIsIm5vZGUuanMiLCJrZXlwYXRoLXN5bnRheC5qcyIsImhhcy1vd24tcHJvcGVydHkuanMiLCJrZXlwYXRoLW5vZGUuanMiLCJidWlsZGVyLmpzIiwiaW50ZXJwcmV0ZXIuanMiLCJleHAuanMiLCJ0cmFuc2Zvcm1lci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEEgXCJjbGVhblwiLCBlbXB0eSBjb250YWluZXIuIEluc3RhbnRpYXRpbmcgdGhpcyBpcyBmYXN0ZXIgdGhhbiBleHBsaWNpdGx5IGNhbGxpbmcgYE9iamVjdC5jcmVhdGUoIG51bGwgKWAuXG4gKiBAY2xhc3MgTnVsbFxuICogQGV4dGVuZHMgZXh0ZXJuYWw6bnVsbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBOdWxsKCl7fVxuTnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5OdWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBOdWxsOyIsImV4cG9ydCBmdW5jdGlvbiBpc0lkZW50aWZpZXJQYXJ0KCBjaGFyICl7XG4gICAgcmV0dXJuIGlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICkgfHwgaXNOdW1lcmljKCBjaGFyICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0lkZW50aWZpZXJTdGFydCggY2hhciApe1xuICAgIHJldHVybiAnYScgPD0gY2hhciAmJiBjaGFyIDw9ICd6JyB8fCAnQScgPD0gY2hhciAmJiBjaGFyIDw9ICdaJyB8fCAnXycgPT09IGNoYXIgfHwgY2hhciA9PT0gJyQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1lcmljKCBjaGFyICl7XG4gICAgcmV0dXJuICcwJyA8PSBjaGFyICYmIGNoYXIgPD0gJzknO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQdW5jdHVhdG9yKCBjaGFyICl7XG4gICAgcmV0dXJuICcuLD8oKVtde30lfjsnLmluZGV4T2YoIGNoYXIgKSAhPT0gLTE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1F1b3RlKCBjaGFyICl7XG4gICAgcmV0dXJuIGNoYXIgPT09ICdcIicgfHwgY2hhciA9PT0gXCInXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1doaXRlc3BhY2UoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJyAnIHx8IGNoYXIgPT09ICdcXHInIHx8IGNoYXIgPT09ICdcXHQnIHx8IGNoYXIgPT09ICdcXG4nIHx8IGNoYXIgPT09ICdcXHYnIHx8IGNoYXIgPT09ICdcXHUwMEEwJztcbn0iLCJleHBvcnQgdmFyIElkZW50aWZpZXIgICAgICA9ICdJZGVudGlmaWVyJztcbmV4cG9ydCB2YXIgTnVtZXJpY0xpdGVyYWwgID0gJ051bWVyaWMnO1xuZXhwb3J0IHZhciBOdWxsTGl0ZXJhbCAgICAgPSAnTnVsbCc7XG5leHBvcnQgdmFyIFB1bmN0dWF0b3IgICAgICA9ICdQdW5jdHVhdG9yJztcbmV4cG9ydCB2YXIgU3RyaW5nTGl0ZXJhbCAgID0gJ1N0cmluZyc7IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIEdyYW1tYXIgZnJvbSAnLi9ncmFtbWFyJztcblxudmFyIHRva2VuSWQgPSAwO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5Ub2tlblxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgdGhlIHRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSB0b2tlblxuICovXG5mdW5jdGlvbiBUb2tlbiggdHlwZSwgdmFsdWUgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IExleGVyflRva2VuI2lkXG4gICAgICovXG4gICAgdGhpcy5pZCA9ICsrdG9rZW5JZDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IExleGVyflRva2VuI3R5cGVcbiAgICAgKi9cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gTGV4ZXJ+VG9rZW4jdmFsdWVcbiAgICAgKi9cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cblRva2VuLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cblRva2VuLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRva2VuO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlblxuICovXG5Ub2tlbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnR5cGUgPSB0aGlzLnR5cGU7XG4gICAganNvbi52YWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xuVG9rZW4ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gU3RyaW5nKCB0aGlzLnZhbHVlICk7XG59O1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5JZGVudGlmaWVyXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJZGVudGlmaWVyKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuSWRlbnRpZmllciwgdmFsdWUgKTtcbn1cblxuSWRlbnRpZmllci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuSWRlbnRpZmllci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJZGVudGlmaWVyO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5OdW1lcmljTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTnVtZXJpY0xpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5OdW1lcmljTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bWVyaWNMaXRlcmFsO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5OdWxsTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTnVsbExpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5OdWxsTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuTnVsbExpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGxMaXRlcmFsO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5QdW5jdHVhdG9yXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQdW5jdHVhdG9yKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuUHVuY3R1YXRvciwgdmFsdWUgKTtcbn1cblxuUHVuY3R1YXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuUHVuY3R1YXRvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQdW5jdHVhdG9yO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5TdHJpbmdMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdHJpbmdMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdHJpbmdMaXRlcmFsOyIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBDaGFyYWN0ZXIgZnJvbSAnLi9jaGFyYWN0ZXInO1xuaW1wb3J0ICogYXMgVG9rZW4gZnJvbSAnLi90b2tlbic7XG5cbnZhciBsZXhlclByb3RvdHlwZTtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTGV4ZXIoKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJydcbiAgICAgKi9cbiAgICB0aGlzLnNvdXJjZSA9ICcnO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sZW5ndGggPSAwO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PExleGVyflRva2VuPn1cbiAgICAgKi9cbiAgICB0aGlzLnRva2VucyA9IFtdO1xufVxuXG5sZXhlclByb3RvdHlwZSA9IExleGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbmxleGVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGV4ZXI7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdGV4dFxuICovXG5sZXhlclByb3RvdHlwZS5sZXggPSBmdW5jdGlvbiggdGV4dCApe1xuICAgIC8vIFJlc2V0IHRoZSBpbmRleCBhbmQgdG9rZW5zXG4gICAgaWYoIHRoaXMuaW5kZXggKXtcbiAgICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgICAgIHRoaXMudG9rZW5zID0gW107XG4gICAgfVxuXG4gICAgdGhpcy5zb3VyY2UgPSB0ZXh0O1xuICAgIHRoaXMubGVuZ3RoID0gdGV4dC5sZW5ndGg7XG5cbiAgICB2YXIgd29yZCA9ICcnLFxuICAgICAgICBjaGFyLCB0b2tlbiwgcXVvdGU7XG5cbiAgICB3aGlsZSggIXRoaXMuZW9sKCkgKXtcbiAgICAgICAgY2hhciA9IHRoaXMuc291cmNlWyB0aGlzLmluZGV4IF07XG5cbiAgICAgICAgLy8gSWRlbnRpZmllclxuICAgICAgICBpZiggQ2hhcmFjdGVyLmlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICkgKXtcbiAgICAgICAgICAgIHdvcmQgPSB0aGlzLnJlYWQoIGZ1bmN0aW9uKCBjaGFyICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFDaGFyYWN0ZXIuaXNJZGVudGlmaWVyUGFydCggY2hhciApO1xuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB0b2tlbiA9IHdvcmQgPT09ICdudWxsJyA/XG4gICAgICAgICAgICAgICAgbmV3IFRva2VuLk51bGxMaXRlcmFsKCB3b3JkICkgOlxuICAgICAgICAgICAgICAgIG5ldyBUb2tlbi5JZGVudGlmaWVyKCB3b3JkICk7XG4gICAgICAgICAgICB0aGlzLnRva2Vucy5wdXNoKCB0b2tlbiApO1xuXG4gICAgICAgIC8vIFB1bmN0dWF0b3JcbiAgICAgICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNQdW5jdHVhdG9yKCBjaGFyICkgKXtcbiAgICAgICAgICAgIHRva2VuID0gbmV3IFRva2VuLlB1bmN0dWF0b3IoIGNoYXIgKTtcbiAgICAgICAgICAgIHRoaXMudG9rZW5zLnB1c2goIHRva2VuICk7XG5cbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICAvLyBRdW90ZWQgU3RyaW5nXG4gICAgICAgIH0gZWxzZSBpZiggQ2hhcmFjdGVyLmlzUXVvdGUoIGNoYXIgKSApe1xuICAgICAgICAgICAgcXVvdGUgPSBjaGFyO1xuXG4gICAgICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgICAgIHdvcmQgPSB0aGlzLnJlYWQoIGZ1bmN0aW9uKCBjaGFyICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoYXIgPT09IHF1b3RlO1xuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB0b2tlbiA9IG5ldyBUb2tlbi5TdHJpbmdMaXRlcmFsKCBxdW90ZSArIHdvcmQgKyBxdW90ZSApO1xuICAgICAgICAgICAgdGhpcy50b2tlbnMucHVzaCggdG9rZW4gKTtcblxuICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgIC8vIE51bWVyaWNcbiAgICAgICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNOdW1lcmljKCBjaGFyICkgKXtcbiAgICAgICAgICAgIHdvcmQgPSB0aGlzLnJlYWQoIGZ1bmN0aW9uKCBjaGFyICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFDaGFyYWN0ZXIuaXNOdW1lcmljKCBjaGFyICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHRva2VuID0gbmV3IFRva2VuLk51bWVyaWNMaXRlcmFsKCB3b3JkICk7XG4gICAgICAgICAgICB0aGlzLnRva2Vucy5wdXNoKCB0b2tlbiApO1xuXG4gICAgICAgIC8vIFdoaXRlc3BhY2VcbiAgICAgICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNXaGl0ZXNwYWNlKCBjaGFyICkgKXtcbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICAvLyBFcnJvclxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAnXCInICsgY2hhciArICdcIiBpcyBhbiBpbnZhbGlkIGNoYXJhY3RlcicgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdvcmQgPSAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50b2tlbnM7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBsZXhlciBpcyBhdCB0aGUgZW5kIG9mIHRoZSBsaW5lXG4gKi9cbmxleGVyUHJvdG90eXBlLmVvbCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPj0gdGhpcy5sZW5ndGg7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpmdW5jdGlvbn0gdW50aWwgQSBjb25kaXRpb24gdGhhdCB3aGVuIG1ldCB3aWxsIHN0b3AgdGhlIHJlYWRpbmcgb2YgdGhlIGJ1ZmZlclxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gVGhlIHBvcnRpb24gb2YgdGhlIGJ1ZmZlciByZWFkXG4gKi9cbmxleGVyUHJvdG90eXBlLnJlYWQgPSBmdW5jdGlvbiggdW50aWwgKXtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4LFxuICAgICAgICBjaGFyO1xuXG4gICAgd2hpbGUoICF0aGlzLmVvbCgpICl7XG4gICAgICAgIGNoYXIgPSB0aGlzLnNvdXJjZVsgdGhpcy5pbmRleCBdO1xuXG4gICAgICAgIGlmKCB1bnRpbCggY2hhciApICl7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zb3VyY2Uuc2xpY2UoIHN0YXJ0LCB0aGlzLmluZGV4ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsZXhlclxuICovXG5sZXhlclByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24uc291cmNlID0gdGhpcy5zb3VyY2U7XG4gICAganNvbi50b2tlbnMgPSB0aGlzLnRva2Vucy5tYXAoIGZ1bmN0aW9uKCB0b2tlbiApe1xuICAgICAgICByZXR1cm4gdG9rZW4udG9KU09OKCk7XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGxleGVyXG4gKi9cbmxleGVyUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2U7XG59OyIsImV4cG9ydCB2YXIgQXJyYXlFeHByZXNzaW9uICAgICAgID0gJ0FycmF5RXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIENhbGxFeHByZXNzaW9uICAgICAgICA9ICdDYWxsRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIEV4cHJlc3Npb25TdGF0ZW1lbnQgICA9ICdFeHByZXNzaW9uU3RhdGVtZW50JztcbmV4cG9ydCB2YXIgSWRlbnRpZmllciAgICAgICAgICAgID0gJ0lkZW50aWZpZXInO1xuZXhwb3J0IHZhciBMaXRlcmFsICAgICAgICAgICAgICAgPSAnTGl0ZXJhbCc7XG5leHBvcnQgdmFyIE1lbWJlckV4cHJlc3Npb24gICAgICA9ICdNZW1iZXJFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUHJvZ3JhbSAgICAgICAgICAgICAgID0gJ1Byb2dyYW0nO1xuZXhwb3J0IHZhciBTZXF1ZW5jZUV4cHJlc3Npb24gICAgPSAnU2VxdWVuY2VFeHByZXNzaW9uJzsiLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgU3ludGF4IGZyb20gJy4vc3ludGF4JztcblxudmFyIG5vZGVJZCA9IDAsXG4gICAgbGl0ZXJhbFR5cGVzID0gJ2Jvb2xlYW4gbnVtYmVyIHN0cmluZycuc3BsaXQoICcgJyApO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfk5vZGVcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlIEEgbm9kZSB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOb2RlKCB0eXBlICl7XG5cbiAgICBpZiggdHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ3R5cGUgbXVzdCBiZSBhIHN0cmluZycsIFR5cGVFcnJvciApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gQnVpbGRlcn5Ob2RlI2lkXG4gICAgICovXG4gICAgdGhpcy5pZCA9ICsrbm9kZUlkO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gQnVpbGRlcn5Ob2RlI3R5cGVcbiAgICAgKi9cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xufVxuXG5Ob2RlLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbk5vZGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTm9kZTtcblxuTm9kZS5wcm90b3R5cGUudGhyb3dFcnJvciA9IGZ1bmN0aW9uKCBtZXNzYWdlLCBFcnJvckNsYXNzICl7XG4gICAgdHlwZW9mIEVycm9yQ2xhc3MgPT09ICd1bmRlZmluZWQnICYmICggRXJyb3JDbGFzcyA9IEVycm9yICk7XG4gICAgdGhyb3cgbmV3IEVycm9yQ2xhc3MoIG1lc3NhZ2UgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIG5vZGVcbiAqL1xuTm9kZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnR5cGUgPSB0aGlzLnR5cGU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbm9kZVxuICovXG5Ob2RlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFN0cmluZyggdGhpcy50eXBlICk7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5pZDtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5Ob2RlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZXhwcmVzc2lvblR5cGUgQSBub2RlIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEV4cHJlc3Npb24oIGV4cHJlc3Npb25UeXBlICl7XG4gICAgTm9kZS5jYWxsKCB0aGlzLCBleHByZXNzaW9uVHlwZSApO1xufVxuXG5FeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE5vZGUucHJvdG90eXBlICk7XG5cbkV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5MaXRlcmFsXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOm51bWJlcn0gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBsaXRlcmFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMaXRlcmFsKCB2YWx1ZSwgcmF3ICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguTGl0ZXJhbCApO1xuXG4gICAgaWYoIGxpdGVyYWxUeXBlcy5pbmRleE9mKCB0eXBlb2YgdmFsdWUgKSA9PT0gLTEgJiYgdmFsdWUgIT09IG51bGwgKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAndmFsdWUgbXVzdCBiZSBhIGJvb2xlYW4sIG51bWJlciwgc3RyaW5nLCBvciBudWxsJywgVHlwZUVycm9yICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMucmF3ID0gcmF3O1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cbkxpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMaXRlcmFsO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsaXRlcmFsXG4gKi9cbkxpdGVyYWwucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5yYXcgPSB0aGlzLnJhdztcbiAgICBqc29uLnZhbHVlID0gdGhpcy52YWx1ZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsaXRlcmFsXG4gKi9cbkxpdGVyYWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5yYXc7XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfk1lbWJlckV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IG9iamVjdFxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb258QnVpbGRlcn5JZGVudGlmaWVyfSBwcm9wZXJ0eVxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBjb21wdXRlZD1mYWxzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSwgY29tcHV0ZWQgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5NZW1iZXJFeHByZXNzaW9uICk7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5FeHByZXNzaW9ufEJ1aWxkZXJ+SWRlbnRpZmllcn1cbiAgICAgKi9cbiAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmNvbXB1dGVkID0gY29tcHV0ZWQgfHwgZmFsc2U7XG59XG5cbk1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW1iZXJFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtZW1iZXIgZXhwcmVzc2lvblxuICovXG5NZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ub2JqZWN0ICAgPSB0aGlzLm9iamVjdC50b0pTT04oKTtcbiAgICBqc29uLnByb3BlcnR5ID0gdGhpcy5wcm9wZXJ0eS50b0pTT04oKTtcbiAgICBqc29uLmNvbXB1dGVkID0gdGhpcy5jb21wdXRlZDtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5Qcm9ncmFtXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk5vZGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXk8QnVpbGRlcn5TdGF0ZW1lbnQ+fSBib2R5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQcm9ncmFtKCBib2R5ICl7XG4gICAgTm9kZS5jYWxsKCB0aGlzLCBTeW50YXguUHJvZ3JhbSApO1xuXG4gICAgaWYoICFBcnJheS5pc0FycmF5KCBib2R5ICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2JvZHkgbXVzdCBiZSBhbiBhcnJheScgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpBcnJheTxCdWlsZGVyflN0YXRlbWVudD59XG4gICAgICovXG4gICAgdGhpcy5ib2R5ID0gYm9keSB8fCBbXTtcbiAgICB0aGlzLnNvdXJjZVR5cGUgPSAnc2NyaXB0Jztcbn1cblxuUHJvZ3JhbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBOb2RlLnByb3RvdHlwZSApO1xuXG5Qcm9ncmFtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFByb2dyYW07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHByb2dyYW1cbiAqL1xuUHJvZ3JhbS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmJvZHkgPSB0aGlzLmJvZHkubWFwKCBmdW5jdGlvbiggbm9kZSApe1xuICAgICAgICByZXR1cm4gbm9kZS50b0pTT04oKTtcbiAgICB9ICk7XG4gICAganNvbi5zb3VyY2VUeXBlID0gdGhpcy5zb3VyY2VUeXBlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflN0YXRlbWVudFxuICogQGV4dGVuZHMgQnVpbGRlcn5Ob2RlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gc3RhdGVtZW50VHlwZSBBIG5vZGUgdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RhdGVtZW50KCBzdGF0ZW1lbnRUeXBlICl7XG4gICAgTm9kZS5jYWxsKCB0aGlzLCBzdGF0ZW1lbnRUeXBlICk7XG59XG5cblN0YXRlbWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBOb2RlLnByb3RvdHlwZSApO1xuXG5TdGF0ZW1lbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RhdGVtZW50O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkFycmF5RXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufSBlbGVtZW50cyBBIGxpc3Qgb2YgZXhwcmVzc2lvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFycmF5RXhwcmVzc2lvbiggZWxlbWVudHMgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5BcnJheUV4cHJlc3Npb24gKTtcblxuICAgIC8vaWYoICEoIEFycmF5LmlzQXJyYXkoIGVsZW1lbnRzICkgKSAmJiAhKCBlbGVtZW50cyBpbnN0YW5jZW9mIFJhbmdlRXhwcmVzc2lvbiApICl7XG4gICAgLy8gICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2VsZW1lbnRzIG11c3QgYmUgYSBsaXN0IG9mIGV4cHJlc3Npb25zIG9yIGFuIGluc3RhbmNlIG9mIHJhbmdlIGV4cHJlc3Npb24nICk7XG4gICAgLy99XG5cbiAgICAvKlxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ2VsZW1lbnRzJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiggZWxlbWVudHMgKXtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICB0aGlzWyBpbmRleCBdID0gZWxlbWVudHNbIGluZGV4IF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9ICk7XG4gICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50cztcbn1cblxuQXJyYXlFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkFycmF5RXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBcnJheUV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGFycmF5IGV4cHJlc3Npb25cbiAqL1xuQXJyYXlFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGlmKCBBcnJheS5pc0FycmF5KCB0aGlzLmVsZW1lbnRzICkgKXtcbiAgICAgICAganNvbi5lbGVtZW50cyA9IHRoaXMuZWxlbWVudHMubWFwKCBmdW5jdGlvbiggZWxlbWVudCApe1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudG9KU09OKCk7XG4gICAgICAgIH0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBqc29uLmVsZW1lbnRzID0gdGhpcy5lbGVtZW50cy50b0pTT04oKTtcbiAgICB9XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+Q2FsbEV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IGNhbGxlZVxuICogQHBhcmFtIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fSBhcmdzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDYWxsRXhwcmVzc2lvbiggY2FsbGVlLCBhcmdzICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguQ2FsbEV4cHJlc3Npb24gKTtcblxuICAgIGlmKCAhQXJyYXkuaXNBcnJheSggYXJncyApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdhcmd1bWVudHMgbXVzdCBiZSBhbiBhcnJheScgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5jYWxsZWUgPSBjYWxsZWU7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPn1cbiAgICAgKi9cbiAgICB0aGlzLmFyZ3VtZW50cyA9IGFyZ3M7XG59XG5cbkNhbGxFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkNhbGxFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENhbGxFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjYWxsIGV4cHJlc3Npb25cbiAqL1xuQ2FsbEV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5jYWxsZWUgICAgPSB0aGlzLmNhbGxlZS50b0pTT04oKTtcbiAgICBqc29uLmFyZ3VtZW50cyA9IHRoaXMuYXJndW1lbnRzLm1hcCggZnVuY3Rpb24oIG5vZGUgKXtcbiAgICAgICAgcmV0dXJuIG5vZGUudG9KU09OKCk7XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5NZW1iZXJFeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gb2JqZWN0XG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApe1xuICAgIGlmKCAhKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIEV4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncHJvcGVydHkgbXVzdCBiZSBhbiBleHByZXNzaW9uIHdoZW4gY29tcHV0ZWQgaXMgdHJ1ZScgKTtcbiAgICB9XG5cbiAgICBNZW1iZXJFeHByZXNzaW9uLmNhbGwoIHRoaXMsIG9iamVjdCwgcHJvcGVydHksIHRydWUgKTtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIgQnVpbGRlcn5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24jY29tcHV0ZWQ9dHJ1ZVxuICAgICAqL1xufVxuXG5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5FeHByZXNzaW9uU3RhdGVtZW50XG4gKiBAZXh0ZW5kcyBCdWlsZGVyflN0YXRlbWVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gRXhwcmVzc2lvblN0YXRlbWVudCggZXhwcmVzc2lvbiApe1xuICAgIFN0YXRlbWVudC5jYWxsKCB0aGlzLCBTeW50YXguRXhwcmVzc2lvblN0YXRlbWVudCApO1xuXG4gICAgaWYoICEoIGV4cHJlc3Npb24gaW5zdGFuY2VvZiBFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2FyZ3VtZW50IG11c3QgYmUgYW4gZXhwcmVzc2lvbicgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbn1cblxuRXhwcmVzc2lvblN0YXRlbWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBTdGF0ZW1lbnQucHJvdG90eXBlICk7XG5cbkV4cHJlc3Npb25TdGF0ZW1lbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXhwcmVzc2lvblN0YXRlbWVudDtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZXhwcmVzc2lvbiBzdGF0ZW1lbnRcbiAqL1xuRXhwcmVzc2lvblN0YXRlbWVudC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb24udG9KU09OKCk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+SWRlbnRpZmllclxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgaWRlbnRpZmllclxuICovXG5leHBvcnQgZnVuY3Rpb24gSWRlbnRpZmllciggbmFtZSApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LklkZW50aWZpZXIgKTtcblxuICAgIGlmKCB0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ25hbWUgbXVzdCBiZSBhIHN0cmluZycgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbn1cblxuSWRlbnRpZmllci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5JZGVudGlmaWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IElkZW50aWZpZXI7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGlkZW50aWZpZXJcbiAqL1xuSWRlbnRpZmllci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLm5hbWUgPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBOdWxsTGl0ZXJhbCggcmF3ICl7XG4gICAgaWYoIHJhdyAhPT0gJ251bGwnICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyYXcgaXMgbm90IGEgbnVsbCBsaXRlcmFsJyApO1xuICAgIH1cblxuICAgIExpdGVyYWwuY2FsbCggdGhpcywgbnVsbCwgcmF3ICk7XG59XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExpdGVyYWwucHJvdG90eXBlICk7XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGxMaXRlcmFsO1xuXG5leHBvcnQgZnVuY3Rpb24gTnVtZXJpY0xpdGVyYWwoIHJhdyApe1xuICAgIHZhciB2YWx1ZSA9IHBhcnNlRmxvYXQoIHJhdyApO1xuXG4gICAgaWYoIGlzTmFOKCB2YWx1ZSApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyYXcgaXMgbm90IGEgbnVtZXJpYyBsaXRlcmFsJyApO1xuICAgIH1cblxuICAgIExpdGVyYWwuY2FsbCggdGhpcywgdmFsdWUsIHJhdyApO1xufVxuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBMaXRlcmFsLnByb3RvdHlwZSApO1xuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdW1lcmljTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5TZXF1ZW5jZUV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn0gZXhwcmVzc2lvbnMgVGhlIGV4cHJlc3Npb25zIGluIHRoZSBzZXF1ZW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2VxdWVuY2VFeHByZXNzaW9uKCBleHByZXNzaW9ucyApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LlNlcXVlbmNlRXhwcmVzc2lvbiApO1xuXG4gICAgLy9pZiggISggQXJyYXkuaXNBcnJheSggZXhwcmVzc2lvbnMgKSApICYmICEoIGV4cHJlc3Npb25zIGluc3RhbmNlb2YgUmFuZ2VFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnZXhwcmVzc2lvbnMgbXVzdCBiZSBhIGxpc3Qgb2YgZXhwcmVzc2lvbnMgb3IgYW4gaW5zdGFuY2Ugb2YgcmFuZ2UgZXhwcmVzc2lvbicgKTtcbiAgICAvL31cblxuICAgIC8qXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB0aGlzLCAnZXhwcmVzc2lvbnMnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKCBleHByZXNzaW9ucyApe1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5sZW5ndGggPSBleHByZXNzaW9ucy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHRoaXNbIGluZGV4IF0gPSBleHByZXNzaW9uc1sgaW5kZXggXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0gKTtcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5leHByZXNzaW9ucyA9IGV4cHJlc3Npb25zO1xufVxuXG5TZXF1ZW5jZUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuU2VxdWVuY2VFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNlcXVlbmNlRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgc2VxdWVuY2UgZXhwcmVzc2lvblxuICovXG5TZXF1ZW5jZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIHRoaXMuZXhwcmVzc2lvbnMgKSApe1xuICAgICAgICBqc29uLmV4cHJlc3Npb25zID0gdGhpcy5leHByZXNzaW9ucy5tYXAoIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvbi50b0pTT04oKTtcbiAgICAgICAgfSApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGpzb24uZXhwcmVzc2lvbnMgPSB0aGlzLmV4cHJlc3Npb25zLnRvSlNPTigpO1xuICAgIH1cblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5TdGF0aWNNZW1iZXJFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk1lbWJlckV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBvYmplY3RcbiAqIEBwYXJhbSB7QnVpbGRlcn5JZGVudGlmaWVyfSBwcm9wZXJ0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RhdGljTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApe1xuICAgIC8vaWYoICEoIHByb3BlcnR5IGluc3RhbmNlb2YgSWRlbnRpZmllciApICYmICEoIHByb3BlcnR5IGluc3RhbmNlb2YgTG9va3VwRXhwcmVzc2lvbiApICYmICEoIHByb3BlcnR5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncHJvcGVydHkgbXVzdCBiZSBhbiBpZGVudGlmaWVyLCBldmFsIGV4cHJlc3Npb24sIG9yIGxvb2t1cCBleHByZXNzaW9uIHdoZW4gY29tcHV0ZWQgaXMgZmFsc2UnICk7XG4gICAgLy99XG5cbiAgICBNZW1iZXJFeHByZXNzaW9uLmNhbGwoIHRoaXMsIG9iamVjdCwgcHJvcGVydHksIGZhbHNlICk7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIEJ1aWxkZXJ+U3RhdGljTWVtYmVyRXhwcmVzc2lvbiNjb21wdXRlZD1mYWxzZVxuICAgICAqL1xufVxuXG5TdGF0aWNNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblN0YXRpY01lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RhdGljTWVtYmVyRXhwcmVzc2lvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIFN0cmluZ0xpdGVyYWwoIHJhdyApe1xuICAgIGlmKCByYXdbIDAgXSAhPT0gJ1wiJyAmJiByYXdbIDAgXSAhPT0gXCInXCIgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JhdyBpcyBub3QgYSBzdHJpbmcgbGl0ZXJhbCcgKTtcbiAgICB9XG5cbiAgICB2YXIgdmFsdWUgPSByYXcuc3Vic3RyaW5nKCAxLCByYXcubGVuZ3RoIC0gMSApO1xuXG4gICAgTGl0ZXJhbC5jYWxsKCB0aGlzLCB2YWx1ZSwgcmF3ICk7XG59XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTGl0ZXJhbC5wcm90b3R5cGUgKTtcblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdHJpbmdMaXRlcmFsOyIsImV4cG9ydCB2YXIgQmxvY2tFeHByZXNzaW9uICAgICAgID0gJ0Jsb2NrRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIEV4aXN0ZW50aWFsRXhwcmVzc2lvbiA9ICdFeGlzdGVudGlhbEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBMb29rdXBFeHByZXNzaW9uICAgICAgPSAnTG9va3VwRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIFJhbmdlRXhwcmVzc2lvbiAgICAgICA9ICdSYW5nZUV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBSb290RXhwcmVzc2lvbiAgICAgICAgPSAnUm9vdEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBTY29wZUV4cHJlc3Npb24gICAgICAgPSAnU2NvcGVFeHByZXNzaW9uJzsiLCJ2YXIgX2hhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7Kn0gb2JqZWN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gcHJvcGVydHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaGFzT3duUHJvcGVydHkoIG9iamVjdCwgcHJvcGVydHkgKXtcbiAgICByZXR1cm4gX2hhc093blByb3BlcnR5LmNhbGwoIG9iamVjdCwgcHJvcGVydHkgKTtcbn0iLCJpbXBvcnQgeyBDb21wdXRlZE1lbWJlckV4cHJlc3Npb24sIEV4cHJlc3Npb24sIElkZW50aWZpZXIsIE5vZGUsIExpdGVyYWwgfSBmcm9tICcuL25vZGUnO1xuaW1wb3J0ICogYXMgS2V5cGF0aFN5bnRheCBmcm9tICcuL2tleXBhdGgtc3ludGF4JztcbmltcG9ydCBoYXNPd25Qcm9wZXJ0eSBmcm9tICcuL2hhcy1vd24tcHJvcGVydHknO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfk9wZXJhdG9yRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZXhwcmVzc2lvblR5cGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBvcGVyYXRvclxuICovXG5mdW5jdGlvbiBPcGVyYXRvckV4cHJlc3Npb24oIGV4cHJlc3Npb25UeXBlLCBvcGVyYXRvciApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgZXhwcmVzc2lvblR5cGUgKTtcblxuICAgIHRoaXMub3BlcmF0b3IgPSBvcGVyYXRvcjtcbn1cblxuT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbk9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBPcGVyYXRvckV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIG9wZXJhdG9yIGV4cHJlc3Npb25cbiAqL1xuT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ub3BlcmF0b3IgPSB0aGlzLm9wZXJhdG9yO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gQmxvY2tFeHByZXNzaW9uKCBib2R5ICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCAnQmxvY2tFeHByZXNzaW9uJyApO1xuXG4gICAgLypcbiAgICBpZiggISggZXhwcmVzc2lvbiBpbnN0YW5jZW9mIEV4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYXJndW1lbnQgbXVzdCBiZSBhbiBleHByZXNzaW9uJyApO1xuICAgIH1cbiAgICAqL1xuXG4gICAgdGhpcy5ib2R5ID0gYm9keTtcbn1cblxuQmxvY2tFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkJsb2NrRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCbG9ja0V4cHJlc3Npb247XG5cbmV4cG9ydCBmdW5jdGlvbiBFeGlzdGVudGlhbEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKXtcbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb24sICc/JyApO1xuXG4gICAgdGhpcy5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbn1cblxuRXhpc3RlbnRpYWxFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuRXhpc3RlbnRpYWxFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEV4aXN0ZW50aWFsRXhwcmVzc2lvbjtcblxuRXhpc3RlbnRpYWxFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5leHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uLnRvSlNPTigpO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gTG9va3VwRXhwcmVzc2lvbigga2V5ICl7XG4gICAgaWYoICEoIGtleSBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISgga2V5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2tleSBtdXN0IGJlIGEgbGl0ZXJhbCwgaWRlbnRpZmllciwgb3IgZXZhbCBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb24sICclJyApO1xuXG4gICAgdGhpcy5rZXkgPSBrZXk7XG59XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5Mb29rdXBFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvb2t1cEV4cHJlc3Npb247XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciArIHRoaXMua2V5O1xufTtcblxuTG9va3VwRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ua2V5ID0gdGhpcy5rZXk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk9wZXJhdG9yRXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IGxlZnRcbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSByaWdodFxuICovXG5leHBvcnQgZnVuY3Rpb24gUmFuZ2VFeHByZXNzaW9uKCBsZWZ0LCByaWdodCApe1xuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbiwgJy4uJyApO1xuXG4gICAgaWYoICEoIGxlZnQgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgbGVmdCAhPT0gbnVsbCApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGVmdCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGxpdGVyYWwgb3IgbnVsbCcgKTtcbiAgICB9XG5cbiAgICBpZiggISggcmlnaHQgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgcmlnaHQgIT09IG51bGwgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JpZ2h0IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgbGl0ZXJhbCBvciBudWxsJyApO1xuICAgIH1cblxuICAgIGlmKCBsZWZ0ID09PSBudWxsICYmIHJpZ2h0ID09PSBudWxsICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsZWZ0IGFuZCByaWdodCBjYW5ub3QgZXF1YWwgbnVsbCBhdCB0aGUgc2FtZSB0aW1lJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+TGl0ZXJhbH0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jbGVmdFxuICAgICAqL1xuICAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uIzBcbiAgICAgKi9cbiAgICB0aGlzWyAwIF0gPSB0aGlzLmxlZnQgPSBsZWZ0O1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5MaXRlcmFsfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiNyaWdodFxuICAgICAqL1xuICAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uIzFcbiAgICAgKi9cbiAgICB0aGlzWyAxIF0gPSB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uI2xlbmd0aD0yXG4gICAgICovXG4gICAgdGhpcy5sZW5ndGggPSAyO1xufVxuXG5SYW5nZUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJhbmdlRXhwcmVzc2lvbjtcblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5sZWZ0ID0gdGhpcy5sZWZ0ICE9PSBudWxsID9cbiAgICAgICAgdGhpcy5sZWZ0LnRvSlNPTigpIDpcbiAgICAgICAgdGhpcy5sZWZ0O1xuICAgIGpzb24ucmlnaHQgPSB0aGlzLnJpZ2h0ICE9PSBudWxsID9cbiAgICAgICAgdGhpcy5yaWdodC50b0pTT04oKSA6XG4gICAgICAgIHRoaXMucmlnaHQ7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cblJhbmdlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmxlZnQudG9TdHJpbmcoKSArIHRoaXMub3BlcmF0b3IgKyB0aGlzLnJpZ2h0LnRvU3RyaW5nKCk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHksIGNhcmRpbmFsaXR5ICl7XG4gICAgQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLmNhbGwoIHRoaXMsIG9iamVjdCwgcHJvcGVydHkgKTtcblxuICAgIGlmKCAhaGFzT3duUHJvcGVydHkoIENhcmRpbmFsaXR5LCBjYXJkaW5hbGl0eSApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdVbmtub3duIGNhcmRpbmFsaXR5ICcgKyBjYXJkaW5hbGl0eSApO1xuICAgIH1cblxuICAgIHRoaXMuY2FyZGluYWxpdHkgPSBjYXJkaW5hbGl0eTtcbn1cblxuUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5SZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIFJvb3RFeHByZXNzaW9uKCBrZXkgKXtcbiAgICBpZiggISgga2V5IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmICEoIGtleSBpbnN0YW5jZW9mIElkZW50aWZpZXIgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBCbG9ja0V4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAna2V5IG11c3QgYmUgYSBsaXRlcmFsLCBpZGVudGlmaWVyLCBvciBldmFsIGV4cHJlc3Npb24nICk7XG4gICAgfVxuXG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb24sICd+JyApO1xuXG4gICAgdGhpcy5rZXkgPSBrZXk7XG59XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuUm9vdEV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUm9vdEV4cHJlc3Npb247XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0b3IgKyB0aGlzLmtleTtcbn07XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5rZXkgPSB0aGlzLmtleTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFNjb3BlRXhwcmVzc2lvbiggb3BlcmF0b3IsIGtleSApe1xuICAgIC8vaWYoICEoIGtleSBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISgga2V5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAna2V5IG11c3QgYmUgYSBsaXRlcmFsLCBpZGVudGlmaWVyLCBvciBldmFsIGV4cHJlc3Npb24nICk7XG4gICAgLy99XG5cbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5TY29wZUV4cHJlc3Npb24sIG9wZXJhdG9yICk7XG5cbiAgICB0aGlzLmtleSA9IGtleTtcbn1cblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNjb3BlRXhwcmVzc2lvbjtcblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0b3IgKyB0aGlzLmtleTtcbn07XG5cblNjb3BlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ua2V5ID0gdGhpcy5rZXk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIEdyYW1tYXIgZnJvbSAnLi9ncmFtbWFyJztcbmltcG9ydCAqIGFzIE5vZGUgZnJvbSAnLi9ub2RlJztcbmltcG9ydCAqIGFzIEtleXBhdGhOb2RlIGZyb20gJy4va2V5cGF0aC1ub2RlJztcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlclxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtMZXhlcn0gbGV4ZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQnVpbGRlciggbGV4ZXIgKXtcbiAgICB0aGlzLmxleGVyID0gbGV4ZXI7XG59XG5cbkJ1aWxkZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuQnVpbGRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCdWlsZGVyO1xuXG5CdWlsZGVyLnByb3RvdHlwZS5hcnJheUV4cHJlc3Npb24gPSBmdW5jdGlvbiggbGlzdCApe1xuICAgIC8vY29uc29sZS5sb2coICdBUlJBWSBFWFBSRVNTSU9OJyApO1xuICAgIHRoaXMuY29uc3VtZSggJ1snICk7XG4gICAgcmV0dXJuIG5ldyBOb2RlLkFycmF5RXhwcmVzc2lvbiggbGlzdCApO1xufTtcblxuQnVpbGRlci5wcm90b3R5cGUuYmxvY2tFeHByZXNzaW9uID0gZnVuY3Rpb24oIHRlcm1pbmF0b3IgKXtcbiAgICB2YXIgYmxvY2sgPSBbXSxcbiAgICAgICAgaXNvbGF0ZWQgPSBmYWxzZTtcbiAgICAvL2NvbnNvbGUubG9nKCAnQkxPQ0snLCB0ZXJtaW5hdG9yICk7XG4gICAgaWYoICF0aGlzLnBlZWsoIHRlcm1pbmF0b3IgKSApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBFWFBSRVNTSU9OUycgKTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgYmxvY2sudW5zaGlmdCggdGhpcy5jb25zdW1lKCkgKTtcbiAgICAgICAgfSB3aGlsZSggIXRoaXMucGVlayggdGVybWluYXRvciApICk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZSggdGVybWluYXRvciApO1xuICAgIC8qaWYoIHRoaXMucGVlayggJ34nICkgKXtcbiAgICAgICAgaXNvbGF0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnN1bWUoICd+JyApO1xuICAgIH0qL1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuQmxvY2tFeHByZXNzaW9uKCBibG9jaywgaXNvbGF0ZWQgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ3xBcnJheTxCdWlsZGVyflRva2VuPn0gaW5wdXRcbiAqIEByZXR1cm5zIHtQcm9ncmFtfSBUaGUgYnVpbHQgYWJzdHJhY3Qgc3ludGF4IHRyZWVcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuYnVpbGQgPSBmdW5jdGlvbiggaW5wdXQgKXtcbiAgICBpZiggdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyApe1xuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50ZXh0ID0gaW5wdXQ7XG5cbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzLmxleGVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnbGV4ZXIgaXMgbm90IGRlZmluZWQnICk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6QXJyYXk8VG9rZW4+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50b2tlbnMgPSB0aGlzLmxleGVyLmxleCggaW5wdXQgKTtcbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGlucHV0ICkgKXtcbiAgICAgICAgdGhpcy50b2tlbnMgPSBpbnB1dC5zbGljZSgpO1xuICAgICAgICB0aGlzLnRleHQgPSBpbnB1dC5qb2luKCAnJyApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ2ludmFsaWQgaW5wdXQnICk7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coICdCVUlMRCcgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSAnLCB0aGlzLnRleHQubGVuZ3RoLCAnQ0hBUlMnLCB0aGlzLnRleHQgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSAnLCB0aGlzLnRva2Vucy5sZW5ndGgsICdUT0tFTlMnLCB0aGlzLnRva2VucyApO1xuICAgIHRoaXMuY29sdW1uID0gdGhpcy50ZXh0Lmxlbmd0aDtcbiAgICB0aGlzLmxpbmUgPSAxO1xuXG4gICAgdmFyIHByb2dyYW0gPSB0aGlzLnByb2dyYW0oKTtcblxuICAgIGlmKCB0aGlzLnRva2Vucy5sZW5ndGggKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnVW5leHBlY3RlZCB0b2tlbiAnICsgdGhpcy50b2tlbnNbIDAgXSArICcgcmVtYWluaW5nJyApO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9ncmFtO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtDYWxsRXhwcmVzc2lvbn0gVGhlIGNhbGwgZXhwcmVzc2lvbiBub2RlXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmNhbGxFeHByZXNzaW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgYXJncyA9IHRoaXMubGlzdCggJygnICksXG4gICAgICAgIGNhbGxlZTtcblxuICAgIHRoaXMuY29uc3VtZSggJygnICk7XG5cbiAgICBjYWxsZWUgPSB0aGlzLmV4cHJlc3Npb24oKTtcblxuICAgIC8vY29uc29sZS5sb2coICdDQUxMIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gQ0FMTEVFJywgY2FsbGVlICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gQVJHVU1FTlRTJywgYXJncywgYXJncy5sZW5ndGggKTtcbiAgICByZXR1cm4gbmV3IE5vZGUuQ2FsbEV4cHJlc3Npb24oIGNhbGxlZSwgYXJncyApO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBuZXh0IHRva2VuIGluIHRoZSB0b2tlbiBsaXN0LiBJZiBhIGNvbXBhcmlzb24gaXMgcHJvdmlkZWQsIHRoZSB0b2tlbiB3aWxsIG9ubHkgYmUgcmV0dXJuZWQgaWYgdGhlIHZhbHVlIG1hdGNoZXMuIE90aGVyd2lzZSBhbiBlcnJvciBpcyB0aHJvd24uXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZXhwZWN0ZWRdIEFuIGV4cGVjdGVkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtUb2tlbn0gVGhlIG5leHQgdG9rZW4gaW4gdGhlIGxpc3RcbiAqIEB0aHJvd3Mge1N5bnRheEVycm9yfSBJZiB0b2tlbiBkaWQgbm90IGV4aXN0XG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmNvbnN1bWUgPSBmdW5jdGlvbiggZXhwZWN0ZWQgKXtcbiAgICBpZiggIXRoaXMudG9rZW5zLmxlbmd0aCApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdVbmV4cGVjdGVkIGVuZCBvZiBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIHZhciB0b2tlbiA9IHRoaXMuZXhwZWN0KCBleHBlY3RlZCApO1xuXG4gICAgaWYoICF0b2tlbiApe1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdVbmV4cGVjdGVkIHRva2VuICcgKyB0b2tlbi52YWx1ZSArICcgY29uc3VtZWQnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRva2VuO1xufTtcblxuQnVpbGRlci5wcm90b3R5cGUuZXhpc3RlbnRpYWxFeHByZXNzaW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvbigpO1xuICAgIC8vY29uc29sZS5sb2coICctIEVYSVNUIEVYUFJFU1NJT04nLCBleHByZXNzaW9uICk7XG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5FeGlzdGVudGlhbEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgbmV4dCB0b2tlbiBpbiB0aGUgdG9rZW4gbGlzdC4gSWYgY29tcGFyaXNvbnMgYXJlIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgY29tcGFyaXNvbnMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZmlyc3RdIFRoZSBmaXJzdCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3NlY29uZF0gVGhlIHNlY29uZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3RoaXJkXSBUaGUgdGhpcmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmb3VydGhdIFRoZSBmb3VydGggY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge1Rva2VufSBUaGUgbmV4dCB0b2tlbiBpbiB0aGUgbGlzdCBvciBgdW5kZWZpbmVkYCBpZiBpdCBkaWQgbm90IGV4aXN0XG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmV4cGVjdCA9IGZ1bmN0aW9uKCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICl7XG4gICAgdmFyIHRva2VuID0gdGhpcy5wZWVrKCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICk7XG5cbiAgICBpZiggdG9rZW4gKXtcbiAgICAgICAgdGhpcy50b2tlbnMucG9wKCk7XG4gICAgICAgIHRoaXMuY29sdW1uIC09IHRva2VuLnZhbHVlLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH1cblxuICAgIHJldHVybiB2b2lkIDA7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0V4cHJlc3Npb259IEFuIGV4cHJlc3Npb24gbm9kZVxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5leHByZXNzaW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IG51bGwsXG4gICAgICAgIGxpc3QsIG5leHQsIHRva2VuO1xuXG4gICAgaWYoIHRoaXMuZXhwZWN0KCAnOycgKSApe1xuICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuXG4gICAgaWYoIG5leHQgPSB0aGlzLnBlZWsoKSApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRVhQUkVTU0lPTicsIG5leHQgKTtcbiAgICAgICAgc3dpdGNoKCBuZXh0LnR5cGUgKXtcbiAgICAgICAgICAgIGNhc2UgR3JhbW1hci5QdW5jdHVhdG9yOlxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmV4cGVjdCggJ10nICkgKXtcbiAgICAgICAgICAgICAgICAgICAgbGlzdCA9IHRoaXMubGlzdCggJ1snICk7XG4gICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLnRva2Vucy5sZW5ndGggPT09IDEgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmFycmF5RXhwcmVzc2lvbiggbGlzdCApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIGxpc3QubGVuZ3RoID4gMSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuc2VxdWVuY2VFeHByZXNzaW9uKCBsaXN0ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gQXJyYXkuaXNBcnJheSggbGlzdCApID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0WyAwIF0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBuZXh0LnZhbHVlID09PSAnfScgKXtcbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwKCBuZXh0ICk7XG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIHRoaXMuZXhwZWN0KCAnPycgKSApe1xuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5leGlzdGVudGlhbEV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgR3JhbW1hci5OdWxsTGl0ZXJhbDpcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5saXRlcmFsKCk7XG4gICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gR3JhbW1hci5JZGVudGlmaWVyXG4gICAgICAgICAgICAvLyBHcmFtbWFyLk51bWVyaWNMaXRlcmFsXG4gICAgICAgICAgICAvLyBHcmFtbWFyLlN0cmluZ0xpdGVyYWxcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwKCBuZXh0ICk7XG4gICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIC8vIEltcGxpZWQgbWVtYmVyIGV4cHJlc3Npb24uIFNob3VsZCBvbmx5IGhhcHBlbiBhZnRlciBhbiBJZGVudGlmaWVyLlxuICAgICAgICAgICAgICAgIGlmKCBuZXh0ICYmIG5leHQudHlwZSA9PT0gR3JhbW1hci5QdW5jdHVhdG9yICYmICggbmV4dC52YWx1ZSA9PT0gJyknIHx8IG5leHQudmFsdWUgPT09ICddJyB8fCBuZXh0LnZhbHVlID09PSAnPycgKSApe1xuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5tZW1iZXJFeHByZXNzaW9uKCBleHByZXNzaW9uLCBmYWxzZSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlKCAoIHRva2VuID0gdGhpcy5leHBlY3QoICcpJywgJ1snLCAnLicgKSApICl7XG4gICAgICAgICAgICBpZiggdG9rZW4udmFsdWUgPT09ICcpJyApe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmNhbGxFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHRva2VuLnZhbHVlID09PSAnWycgKXtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5tZW1iZXJFeHByZXNzaW9uKCBleHByZXNzaW9uLCB0cnVlICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHRva2VuLnZhbHVlID09PSAnLicgKXtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5tZW1iZXJFeHByZXNzaW9uKCBleHByZXNzaW9uLCBmYWxzZSApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoICdVbmV4cGVjdGVkIHRva2VuICcgKyB0b2tlbiApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0V4cHJlc3Npb25TdGF0ZW1lbnR9IEFuIGV4cHJlc3Npb24gc3RhdGVtZW50XG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmV4cHJlc3Npb25TdGF0ZW1lbnQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBleHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uKCksXG4gICAgICAgIGV4cHJlc3Npb25TdGF0ZW1lbnQ7XG4gICAgLy9jb25zb2xlLmxvZyggJ0VYUFJFU1NJT04gU1RBVEVNRU5UIFdJVEgnLCBleHByZXNzaW9uICk7XG4gICAgZXhwcmVzc2lvblN0YXRlbWVudCA9IG5ldyBOb2RlLkV4cHJlc3Npb25TdGF0ZW1lbnQoIGV4cHJlc3Npb24gKTtcblxuICAgIHJldHVybiBleHByZXNzaW9uU3RhdGVtZW50O1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtJZGVudGlmaWVyfSBBbiBpZGVudGlmaWVyXG4gKiBAdGhyb3dzIHtTeW50YXhFcnJvcn0gSWYgdGhlIHRva2VuIGlzIG5vdCBhbiBpZGVudGlmaWVyXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmlkZW50aWZpZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciB0b2tlbiA9IHRoaXMuY29uc3VtZSgpO1xuXG4gICAgaWYoICEoIHRva2VuLnR5cGUgPT09IEdyYW1tYXIuSWRlbnRpZmllciApICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ0lkZW50aWZpZXIgZXhwZWN0ZWQnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBOb2RlLklkZW50aWZpZXIoIHRva2VuLnZhbHVlICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHRlcm1pbmF0b3JcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpBcnJheTxFeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259IFRoZSBsaXN0IG9mIGV4cHJlc3Npb25zIG9yIHJhbmdlIGV4cHJlc3Npb25cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uKCB0ZXJtaW5hdG9yICl7XG4gICAgdmFyIGxpc3QgPSBbXSxcbiAgICAgICAgaXNOdW1lcmljID0gZmFsc2UsXG4gICAgICAgIGV4cHJlc3Npb24sIG5leHQ7XG4gICAgLy9jb25zb2xlLmxvZyggJ0xJU1QnLCB0ZXJtaW5hdG9yICk7XG4gICAgaWYoICF0aGlzLnBlZWsoIHRlcm1pbmF0b3IgKSApe1xuICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgIGlzTnVtZXJpYyA9IG5leHQudHlwZSA9PT0gR3JhbW1hci5OdW1lcmljTGl0ZXJhbDtcblxuICAgICAgICAvLyBFeGFtcGxlczogWzEuLjNdLCBbNS4uXSwgWy4uN11cbiAgICAgICAgaWYoICggaXNOdW1lcmljIHx8IG5leHQudmFsdWUgPT09ICcuJyApICYmIHRoaXMucGVla0F0KCAxLCAnLicgKSApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gUkFOR0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpc051bWVyaWMgP1xuICAgICAgICAgICAgICAgIHRoaXMubG9va3VwKCBuZXh0ICkgOlxuICAgICAgICAgICAgICAgIG51bGw7XG4gICAgICAgICAgICBsaXN0ID0gdGhpcy5yYW5nZUV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcblxuICAgICAgICAvLyBFeGFtcGxlczogWzEsMiwzXSwgW1wiYWJjXCIsXCJkZWZcIl0sIFtmb28sYmFyXSwgW3tmb28uYmFyfV1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICctIEFSUkFZIE9GIEVYUFJFU1NJT05TJyApO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cCggbmV4dCApO1xuICAgICAgICAgICAgICAgIGxpc3QudW5zaGlmdCggZXhwcmVzc2lvbiApO1xuICAgICAgICAgICAgfSB3aGlsZSggdGhpcy5leHBlY3QoICcsJyApICk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJy0gTElTVCBSRVNVTFQnLCBsaXN0ICk7XG4gICAgcmV0dXJuIGxpc3Q7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0xpdGVyYWx9IFRoZSBsaXRlcmFsIG5vZGVcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUubGl0ZXJhbCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRva2VuID0gdGhpcy5jb25zdW1lKCksXG4gICAgICAgIHJhdyA9IHRva2VuLnZhbHVlLFxuICAgICAgICBleHByZXNzaW9uO1xuXG4gICAgc3dpdGNoKCB0b2tlbi50eXBlICl7XG4gICAgICAgIGNhc2UgR3JhbW1hci5OdW1lcmljTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBuZXcgTm9kZS5OdW1lcmljTGl0ZXJhbCggcmF3ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBHcmFtbWFyLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gbmV3IE5vZGUuU3RyaW5nTGl0ZXJhbCggcmF3ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBHcmFtbWFyLk51bGxMaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IG5ldyBOb2RlLk51bGxMaXRlcmFsKCByYXcgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnTGl0ZXJhbCBleHBlY3RlZCcgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbkJ1aWxkZXIucHJvdG90eXBlLmxvb2t1cCA9IGZ1bmN0aW9uKCBuZXh0ICl7XG4gICAgdmFyIGV4cHJlc3Npb247XG4gICAgLy9jb25zb2xlLmxvZyggJ0xPT0tVUCcsIG5leHQgKTtcbiAgICBzd2l0Y2goIG5leHQudHlwZSApe1xuICAgICAgICBjYXNlIEdyYW1tYXIuSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmlkZW50aWZpZXIoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWw6XG4gICAgICAgIGNhc2UgR3JhbW1hci5TdHJpbmdMaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubGl0ZXJhbCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR3JhbW1hci5QdW5jdHVhdG9yOlxuICAgICAgICAgICAgaWYoIG5leHQudmFsdWUgPT09ICd9JyApe1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZSggJ30nICk7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuYmxvY2tFeHByZXNzaW9uKCAneycgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvciggJ3Rva2VuIGNhbm5vdCBiZSBhIGxvb2t1cCcgKTtcbiAgICB9XG5cbiAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG5cbiAgICBpZiggbmV4dCAmJiBuZXh0LnZhbHVlID09PSAnJScgKXtcbiAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApO1xuICAgIH1cbiAgICBpZiggbmV4dCAmJiBuZXh0LnZhbHVlID09PSAnficgKXtcbiAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMucm9vdEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJy0gTE9PS1VQIFJFU1VMVCcsIGV4cHJlc3Npb24gKTtcbiAgICByZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbkJ1aWxkZXIucHJvdG90eXBlLmxvb2t1cEV4cHJlc3Npb24gPSBmdW5jdGlvbigga2V5ICl7XG4gICAgdGhpcy5jb25zdW1lKCAnJScgKTtcbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLkxvb2t1cEV4cHJlc3Npb24oIGtleSApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7RXhwcmVzc2lvbn0gcHJvcGVydHkgVGhlIGV4cHJlc3Npb24gYXNzaWduZWQgdG8gdGhlIHByb3BlcnR5IG9mIHRoZSBtZW1iZXIgZXhwcmVzc2lvblxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBjb21wdXRlZCBXaGV0aGVyIG9yIG5vdCB0aGUgbWVtYmVyIGV4cHJlc3Npb24gaXMgY29tcHV0ZWRcbiAqIEByZXR1cm5zIHtNZW1iZXJFeHByZXNzaW9ufSBUaGUgbWVtYmVyIGV4cHJlc3Npb25cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUubWVtYmVyRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBwcm9wZXJ0eSwgY29tcHV0ZWQgKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnTUVNQkVSJywgcHJvcGVydHkgKTtcbiAgICB2YXIgb2JqZWN0ID0gdGhpcy5leHByZXNzaW9uKCk7XG4gICAgLy9jb25zb2xlLmxvZyggJ01FTUJFUiBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIE9CSkVDVCcsIG9iamVjdCApO1xuICAgIC8vY29uc29sZS5sb2coICctIFBST1BFUlRZJywgcHJvcGVydHkgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBDT01QVVRFRCcsIGNvbXB1dGVkICk7XG4gICAgcmV0dXJuIGNvbXB1dGVkID9cbiAgICAgICAgbmV3IE5vZGUuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICkgOlxuICAgICAgICBuZXcgTm9kZS5TdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBvYmplY3QsIHByb3BlcnR5ICk7XG59O1xuXG5CdWlsZGVyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKCBpbnB1dCApe1xuICAgIHRoaXMudG9rZW5zID0gdGhpcy5sZXhlci5sZXgoIGlucHV0ICk7XG4gICAgcmV0dXJuIHRoaXMuYnVpbGQoIHRoaXMudG9rZW5zICk7XG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIHRoZSBuZXh0IHRva2VuIGluIHRoZSB0b2tlbiBsaXN0IF93aXRob3V0IHJlbW92aW5nIGl0Xy4gSWYgY29tcGFyaXNvbnMgYXJlIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgY29tcGFyaXNvbnMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZmlyc3RdIFRoZSBmaXJzdCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3NlY29uZF0gVGhlIHNlY29uZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3RoaXJkXSBUaGUgdGhpcmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmb3VydGhdIFRoZSBmb3VydGggY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge0xleGVyflRva2VufSBUaGUgbmV4dCB0b2tlbiBpbiB0aGUgbGlzdCBvciBgdW5kZWZpbmVkYCBpZiBpdCBkaWQgbm90IGV4aXN0XG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbiggZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApe1xuICAgIHJldHVybiB0aGlzLnBlZWtBdCggMCwgZmlyc3QsIHNlY29uZCwgdGhpcmQsIGZvdXJ0aCApO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyB0aGUgdG9rZW4gYXQgdGhlIHJlcXVlc3RlZCBwb3NpdGlvbiBfd2l0aG91dCByZW1vdmluZyBpdF8gZnJvbSB0aGUgdG9rZW4gbGlzdC4gSWYgY29tcGFyaXNvbnMgYXJlIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgY29tcGFyaXNvbnMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBwb3NpdGlvbiBUaGUgcG9zaXRpb24gd2hlcmUgdGhlIHRva2VuIHdpbGwgYmUgcGVla2VkXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZpcnN0XSBUaGUgZmlyc3QgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtzZWNvbmRdIFRoZSBzZWNvbmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFt0aGlyZF0gVGhlIHRoaXJkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZm91cnRoXSBUaGUgZm91cnRoIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtMZXhlcn5Ub2tlbn0gVGhlIHRva2VuIGF0IHRoZSByZXF1ZXN0ZWQgcG9zaXRpb24gb3IgYHVuZGVmaW5lZGAgaWYgaXQgZGlkIG5vdCBleGlzdFxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5wZWVrQXQgPSBmdW5jdGlvbiggcG9zaXRpb24sIGZpcnN0LCBzZWNvbmQsIHRoaXJkLCBmb3VydGggKXtcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy50b2tlbnMubGVuZ3RoLFxuICAgICAgICBpbmRleCwgdG9rZW4sIHZhbHVlO1xuXG4gICAgaWYoIGxlbmd0aCAmJiB0eXBlb2YgcG9zaXRpb24gPT09ICdudW1iZXInICYmIHBvc2l0aW9uID4gLTEgKXtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGEgemVyby1iYXNlZCBpbmRleCBzdGFydGluZyBmcm9tIHRoZSBlbmQgb2YgdGhlIGxpc3RcbiAgICAgICAgaW5kZXggPSBsZW5ndGggLSBwb3NpdGlvbiAtIDE7XG5cbiAgICAgICAgaWYoIGluZGV4ID4gLTEgJiYgaW5kZXggPCBsZW5ndGggKXtcbiAgICAgICAgICAgIHRva2VuID0gdGhpcy50b2tlbnNbIGluZGV4IF07XG4gICAgICAgICAgICB2YWx1ZSA9IHRva2VuLnZhbHVlO1xuXG4gICAgICAgICAgICBpZiggdmFsdWUgPT09IGZpcnN0IHx8IHZhbHVlID09PSBzZWNvbmQgfHwgdmFsdWUgPT09IHRoaXJkIHx8IHZhbHVlID09PSBmb3VydGggfHwgKCAhZmlyc3QgJiYgIXNlY29uZCAmJiAhdGhpcmQgJiYgIWZvdXJ0aCApICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZvaWQgMDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7UHJvZ3JhbX0gQSBwcm9ncmFtIG5vZGVcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUucHJvZ3JhbSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGJvZHkgPSBbXTtcbiAgICAvL2NvbnNvbGUubG9nKCAnUFJPR1JBTScgKTtcbiAgICB3aGlsZSggdHJ1ZSApe1xuICAgICAgICBpZiggdGhpcy50b2tlbnMubGVuZ3RoICl7XG4gICAgICAgICAgICBib2R5LnVuc2hpZnQoIHRoaXMuZXhwcmVzc2lvblN0YXRlbWVudCgpICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE5vZGUuUHJvZ3JhbSggYm9keSApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuQnVpbGRlci5wcm90b3R5cGUucmFuZ2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIHJpZ2h0ICl7XG4gICAgdmFyIGxlZnQ7XG5cbiAgICB0aGlzLmV4cGVjdCggJy4nICk7XG4gICAgdGhpcy5leHBlY3QoICcuJyApO1xuXG4gICAgbGVmdCA9IHRoaXMucGVlaygpLnR5cGUgPT09IEdyYW1tYXIuTnVtZXJpY0xpdGVyYWwgP1xuICAgICAgICBsZWZ0ID0gdGhpcy5saXRlcmFsKCkgOlxuICAgICAgICBudWxsO1xuXG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5SYW5nZUV4cHJlc3Npb24oIGxlZnQsIHJpZ2h0ICk7XG59O1xuXG5CdWlsZGVyLnByb3RvdHlwZS5yb290RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXkgKXtcbiAgICB0aGlzLmNvbnN1bWUoICd+JyApO1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuUm9vdEV4cHJlc3Npb24oIGtleSApO1xufTtcblxuQnVpbGRlci5wcm90b3R5cGUuc2VxdWVuY2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIGxpc3QgKXtcbiAgICByZXR1cm4gbmV3IE5vZGUuU2VxdWVuY2VFeHByZXNzaW9uKCBsaXN0ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2VcbiAqIEB0aHJvd3Mge2V4dGVybmFsOlN5bnRheEVycm9yfSBXaGVuIGl0IGV4ZWN1dGVzXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnRocm93RXJyb3IgPSBmdW5jdGlvbiggbWVzc2FnZSApe1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvciggbWVzc2FnZSApO1xufTsiLCJpbXBvcnQgaGFzT3duUHJvcGVydHkgZnJvbSAnLi9oYXMtb3duLXByb3BlcnR5JztcbmltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBTeW50YXggZnJvbSAnLi9zeW50YXgnO1xuaW1wb3J0ICogYXMgS2V5cGF0aFN5bnRheCBmcm9tICcuL2tleXBhdGgtc3ludGF4JztcblxudmFyIG5vb3AgPSBmdW5jdGlvbigpe30sXG5cbiAgICBjYWNoZSA9IG5ldyBOdWxsKCksXG4gICAgZ2V0dGVyID0gbmV3IE51bGwoKSxcbiAgICBzZXR0ZXIgPSBuZXcgTnVsbCgpO1xuXG5mdW5jdGlvbiBleGVjdXRlTGlzdCggbGlzdCwgc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICB2YXIgaW5kZXggPSBsaXN0Lmxlbmd0aCxcbiAgICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KCBpbmRleCApO1xuICAgIHN3aXRjaCggbGlzdC5sZW5ndGggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gbGlzdFsgMCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gbGlzdFsgMCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgcmVzdWx0WyAxIF0gPSBsaXN0WyAxIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBsaXN0WyAwIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICByZXN1bHRbIDEgXSA9IGxpc3RbIDEgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIHJlc3VsdFsgMiBdID0gbGlzdFsgMiBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gbGlzdFsgMCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgcmVzdWx0WyAxIF0gPSBsaXN0WyAxIF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICByZXN1bHRbIDIgXSA9IGxpc3RbIDIgXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIHJlc3VsdFsgMyBdID0gbGlzdFsgMyBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGxpc3RbIGluZGV4IF0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZ2V0dGVyLnZhbHVlID0gZnVuY3Rpb24oIG9iamVjdCwga2V5ICl7XG4gICAgcmV0dXJuIG9iamVjdFsga2V5IF07XG59O1xuXG5nZXR0ZXIubGlzdCA9IGZ1bmN0aW9uKCBvYmplY3QsIGtleSApe1xuICAgIHZhciBpbmRleCA9IG9iamVjdC5sZW5ndGgsXG4gICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcblxuICAgIHN3aXRjaCggaW5kZXggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBvYmplY3RbIDAgXVsga2V5IF07XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IG9iamVjdFsgMCBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJlc3VsdFsgMSBdID0gb2JqZWN0WyAxIF1bIGtleSBdO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBvYmplY3RbIDAgXVsga2V5IF07XG4gICAgICAgICAgICByZXN1bHRbIDEgXSA9IG9iamVjdFsgMSBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJlc3VsdFsgMiBdID0gb2JqZWN0WyAyIF1bIGtleSBdO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBvYmplY3RbIDAgXVsga2V5IF07XG4gICAgICAgICAgICByZXN1bHRbIDEgXSA9IG9iamVjdFsgMSBdWyBrZXkgXTtcbiAgICAgICAgICAgIHJlc3VsdFsgMiBdID0gb2JqZWN0WyAyIF1bIGtleSBdO1xuICAgICAgICAgICAgcmVzdWx0WyAzIF0gPSBvYmplY3RbIDMgXVsga2V5IF07XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBvYmplY3RbIGluZGV4IF1bIGtleSBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5zZXR0ZXIudmFsdWUgPSBmdW5jdGlvbiggb2JqZWN0LCBrZXksIHZhbHVlICl7XG4gICAgaWYoICFoYXNPd25Qcm9wZXJ0eSggb2JqZWN0LCBrZXkgKSApe1xuICAgICAgICBvYmplY3RbIGtleSBdID0gdmFsdWUgfHwge307XG4gICAgfVxuICAgIHJldHVybiBnZXR0ZXIudmFsdWUoIG9iamVjdCwga2V5ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBJbnRlcnByZXRlcn5yZXR1cm5aZXJvXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSB6ZXJvXG4gKi9cbmZ1bmN0aW9uIHJldHVyblplcm8oKXtcbiAgICByZXR1cm4gMDtcbn1cblxuLyoqXG4gKiBAY2xhc3MgSW50ZXJwcmV0ZXJFcnJvclxuICogQGV4dGVuZHMgZXh0ZXJuYWw6U3ludGF4RXJyb3JcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBtZXNzYWdlXG4gKi9cbmZ1bmN0aW9uIEludGVycHJldGVyRXJyb3IoIG1lc3NhZ2UgKXtcbiAgICBTeW50YXhFcnJvci5jYWxsKCB0aGlzLCBtZXNzYWdlICk7XG59XG5cbkludGVycHJldGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFN5bnRheEVycm9yLnByb3RvdHlwZSApO1xuXG4vKipcbiAqIEBjbGFzcyBJbnRlcnByZXRlclxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtCdWlsZGVyfSBidWlsZGVyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEludGVycHJldGVyKCBidWlsZGVyICl7XG4gICAgaWYoICFhcmd1bWVudHMubGVuZ3RoICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ2J1aWxkZXIgY2Fubm90IGJlIHVuZGVmaW5lZCcsIFR5cGVFcnJvciApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ9IEludGVycHJldGVyI2J1aWxkZXJcbiAgICAgKi9cbiAgICB0aGlzLmJ1aWxkZXIgPSBidWlsZGVyO1xufVxuXG5JbnRlcnByZXRlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJbnRlcnByZXRlcjtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmFycmF5RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBlbGVtZW50cywgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBBUlJBWSBFWFBSRVNTSU9OJywgZWxlbWVudHMubGVuZ3RoICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgZm4sIGxpc3Q7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIGVsZW1lbnRzICkgKXtcbiAgICAgICAgbGlzdCA9IHRoaXMubGlzdEV4cHJlc3Npb24oIGVsZW1lbnRzLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlQXJyYXlFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBBUlJBWSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExJU1RgLCBsaXN0ICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gbGlzdC5sZW5ndGgsXG4gICAgICAgICAgICAgICAga2V5cywgcmVzdWx0O1xuICAgICAgICAgICAgc3dpdGNoKCBpbmRleCApe1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICBrZXlzID0gbGlzdFsgMCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIHNjb3BlLCBrZXlzLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGtleXMgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleXNbIGluZGV4IF0gPSBsaXN0WyBpbmRleCBdKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdID0gYXNzaWduKCBzY29wZSwga2V5c1sgaW5kZXggXSwgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IEtFWVNgLCBrZXlzICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0ID0gdGhpcy5yZWN1cnNlKCBlbGVtZW50cywgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgICAgIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbldpdGhFbGVtZW50UmFuZ2UoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIEFSUkFZIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTElTVGAsIGxpc3QubmFtZSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgIHZhciBrZXlzID0gbGlzdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICBpbmRleCA9IGtleXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICAgICAgICAgIGlmKCBpbmRleCA9PT0gMSApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgMCBdID0gYXNzaWduKCBzY29wZSwga2V5c1sgMCBdLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGFzc2lnbiggc2NvcGUsIGtleXNbIGluZGV4IF0sICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZm47XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuYmxvY2tFeHByZXNzaW9uID0gZnVuY3Rpb24oIHRva2VucywgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBCTE9DSycsIHRva2Vucy5qb2luKCAnJyApICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgdGV4dCA9IHRva2Vucy5qb2luKCAnJyApLFxuICAgICAgICBwcm9ncmFtID0gaGFzT3duUHJvcGVydHkoIGNhY2hlLCB0ZXh0ICkgP1xuICAgICAgICAgICAgY2FjaGVbIHRleHQgXSA6XG4gICAgICAgICAgICBjYWNoZVsgdGV4dCBdID0gdGhpcy5idWlsZGVyLmJ1aWxkKCB0b2tlbnMgKSxcbiAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMucmVjdXJzZSggcHJvZ3JhbS5ib2R5WyAwIF0uZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICBmbjtcbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlQmxvY2tFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIEJMT0NLJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gU0NPUEVgLCBzY29wZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gRVhQUkVTU0lPTmAsIGV4cHJlc3Npb24ubmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICB2YXIgcmVzdWx0ID0gZXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IHNjb3BlLCBuYW1lOiB2b2lkIDAsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5jYWxsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBjYWxsZWUsIGFyZ3MsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQ0FMTCBFWFBSRVNTSU9OJyApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgaXNTZXR0aW5nID0gYXNzaWduID09PSBzZXR0ZXIudmFsdWUsXG4gICAgICAgIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIGNhbGxlZSwgdHJ1ZSwgYXNzaWduICksXG4gICAgICAgIGxpc3QgPSB0aGlzLmxpc3RFeHByZXNzaW9uKCBhcmdzLCBmYWxzZSwgYXNzaWduICksXG4gICAgICAgIGZuO1xuXG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUNhbGxFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIENBTEwgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IGFyZ3NgLCBhcmdzLmxlbmd0aCApO1xuICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgIHZhbHVlcyA9IGV4ZWN1dGVMaXN0KCBsaXN0LCBzY29wZSwgdmFsdWUsIGxvb2t1cCApLFxuICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEhTYCwgbGhzICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgIHJlc3VsdCA9IGxocy52YWx1ZS5hcHBseSggbGhzLmNvbnRleHQsIHZhbHVlcyApO1xuICAgICAgICBpZiggaXNTZXR0aW5nICYmIHR5cGVvZiBsaHMudmFsdWUgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBpbnRlcnByZXRlci50aHJvd0Vycm9yKCAnY2Fubm90IGNyZWF0ZSBjYWxsIGV4cHJlc3Npb25zJyApO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH06XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZXhwcmVzc2lvblxuICovXG5JbnRlcnByZXRlci5wcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uKCBleHByZXNzaW9uLCBjcmVhdGUgKXtcbiAgICB2YXIgcHJvZ3JhbSA9IGhhc093blByb3BlcnR5KCBjYWNoZSwgZXhwcmVzc2lvbiApID9cbiAgICAgICAgICAgIGNhY2hlWyBleHByZXNzaW9uIF0gOlxuICAgICAgICAgICAgY2FjaGVbIGV4cHJlc3Npb24gXSA9IHRoaXMuYnVpbGRlci5idWlsZCggZXhwcmVzc2lvbiApLFxuICAgICAgICBib2R5ID0gcHJvZ3JhbS5ib2R5LFxuICAgICAgICBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGFzc2lnbiwgZXhwcmVzc2lvbnMsIGZuLCBpbmRleDtcblxuICAgIGlmKCB0eXBlb2YgY3JlYXRlICE9PSAnYm9vbGVhbicgKXtcbiAgICAgICAgY3JlYXRlID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuZGVwdGggPSAtMTtcbiAgICB0aGlzLmlzTGVmdExpc3QgPSBmYWxzZTtcbiAgICB0aGlzLmlzUmlnaHRMaXN0ID0gZmFsc2U7XG4gICAgdGhpcy5hc3NpZ25lciA9IGNyZWF0ZSA/XG4gICAgICAgIHNldHRlciA6XG4gICAgICAgIGdldHRlcjtcblxuICAgIGFzc2lnbiA9IHRoaXMuYXNzaWduZXIudmFsdWU7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICovXG4gICAgaW50ZXJwcmV0ZXIuZXhwcmVzc2lvbiA9IHRoaXMuYnVpbGRlci50ZXh0O1xuICAgIC8vY29uc29sZS5sb2coICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyApO1xuICAgIC8vY29uc29sZS5sb2coICdJbnRlcnByZXRpbmcgJywgZXhwcmVzc2lvbiApO1xuICAgIC8vY29uc29sZS5sb2coICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyApO1xuICAgIC8vY29uc29sZS5sb2coICdQcm9ncmFtJywgcHJvZ3JhbS5yYW5nZSApO1xuXG4gICAgc3dpdGNoKCBib2R5Lmxlbmd0aCApe1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBmbiA9IG5vb3A7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgZm4gPSBpbnRlcnByZXRlci5yZWN1cnNlKCBib2R5WyAwIF0uZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBpbmRleCA9IGJvZHkubGVuZ3RoO1xuICAgICAgICAgICAgZXhwcmVzc2lvbnMgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb25zWyBpbmRleCBdID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggYm9keVsgaW5kZXggXS5leHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVQcm9ncmFtKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgICAgIHZhciBsZW5ndGggPSBleHByZXNzaW9ucy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RWYWx1ZTtcblxuICAgICAgICAgICAgICAgIGZvciggaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xuICAgICAgICAgICAgICAgICAgICBsYXN0VmFsdWUgPSBleHByZXNzaW9uc1sgaW5kZXggXSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbGFzdFZhbHVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCAnRk4nLCBmbi5uYW1lICk7XG4gICAgcmV0dXJuIGZuO1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBvYmplY3QsIHByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIENPTVBVVEVEIE1FTUJFUiBFWFBSRVNTSU9OJywgb2JqZWN0LnR5cGUsIHByb3BlcnR5LnR5cGUgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGlzU2FmZSA9IG9iamVjdC50eXBlID09PSBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbixcbiAgICAgICAgbGVmdCA9IHRoaXMucmVjdXJzZSggb2JqZWN0LCBmYWxzZSwgYXNzaWduICksXG4gICAgICAgIHJpZ2h0ID0gdGhpcy5yZWN1cnNlKCBwcm9wZXJ0eSwgZmFsc2UsIGFzc2lnbiApLFxuICAgICAgICBmbjtcblxuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQ09NUFVURUQgTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMRUZUIGAsIGxlZnQubmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUklHSFRgLCByaWdodC5uYW1lICk7XG4gICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApLFxuICAgICAgICAgICAgaW5kZXgsIGxlbmd0aCwgcG9zaXRpb24sIHJlc3VsdCwgcmhzO1xuICAgICAgICBpZiggIWlzU2FmZSB8fCAoIGxocyAhPT0gdm9pZCAwICYmIGxocyAhPT0gbnVsbCApICl7XG4gICAgICAgICAgICByaHMgPSByaWdodCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEhTYCwgbGhzICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkhTYCwgcmhzICk7XG4gICAgICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggcmhzICkgKXtcbiAgICAgICAgICAgICAgICBpZiggKCBpbnRlcnByZXRlci5pc0xlZnRMaXN0ICkgJiYgQXJyYXkuaXNBcnJheSggbGhzICkgKXtcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gcmhzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBsaHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBuZXcgQXJyYXkoIGxlbmd0aCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKCBwb3NpdGlvbiA9IDA7IHBvc2l0aW9uIDwgbGVuZ3RoOyBwb3NpdGlvbisrICl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCBdWyBwb3NpdGlvbiBdID0gYXNzaWduKCBsaHNbIGluZGV4IF0sIHJoc1sgcG9zaXRpb24gXSwgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSByaHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgQXJyYXkoIGluZGV4ICk7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBhc3NpZ24oIGxocywgcmhzWyBpbmRleCBdLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYoICggaW50ZXJwcmV0ZXIuaXNMZWZ0TGlzdCB8fCBpbnRlcnByZXRlci5pc1JpZ2h0TGlzdCApICYmIEFycmF5LmlzQXJyYXkoIGxocyApICl7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBsaHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICAgICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBhc3NpZ24oIGxoc1sgaW5kZXggXSwgcmhzLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIGxocywgcmhzLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxocywgbmFtZTogcmhzLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuZXhpc3RlbnRpYWxFeHByZXNzaW9uID0gZnVuY3Rpb24oIGV4cHJlc3Npb24sIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgRVhJU1RFTlRJQUwgRVhQUkVTU0lPTicsIGV4cHJlc3Npb24udHlwZSApO1xuICAgIC8vY29uc29sZS5sb2coICctIERFUFRIJywgdGhpcy5kZXB0aCApO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBleHByZXNzaW9uLCBmYWxzZSwgYXNzaWduICksXG4gICAgICAgIGZuO1xuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVFeGlzdGVudGlhbEV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgRVhJU1RFTlRJQUwgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExFRlRgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgaWYoIHNjb3BlICE9PSB2b2lkIDAgJiYgc2NvcGUgIT09IG51bGwgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGUgKXtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB2b2lkIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5pZGVudGlmaWVyID0gZnVuY3Rpb24oIG5hbWUsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgSURFTlRJRklFUicsIG5hbWUgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBmbjtcbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlSWRlbnRpZmllciggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBJREVOVElGSUVSJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTkFNRWAsIG5hbWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFZBTFVFYCwgdmFsdWUgKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFzc2lnbiggc2NvcGUsIG5hbWUsICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IHNjb3BlLCBuYW1lOiBuYW1lLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUubGlzdEV4cHJlc3Npb24gPSBmdW5jdGlvbiggaXRlbXMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIHZhciBpbmRleCA9IGl0ZW1zLmxlbmd0aCxcbiAgICAgICAgbGlzdCA9IG5ldyBBcnJheSggaW5kZXggKTtcblxuICAgIHN3aXRjaCggaW5kZXggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGxpc3RbIDAgXSA9IHRoaXMubGlzdEV4cHJlc3Npb25FbGVtZW50KCBpdGVtc1sgMCBdLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICBsaXN0WyBpbmRleCBdID0gdGhpcy5saXN0RXhwcmVzc2lvbkVsZW1lbnQoIGl0ZW1zWyBpbmRleCBdLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGlzdDtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5saXN0RXhwcmVzc2lvbkVsZW1lbnQgPSBmdW5jdGlvbiggZWxlbWVudCwgY29udGV4dCwgYXNzaWduICl7XG4gICAgc3dpdGNoKCBlbGVtZW50LnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguTGl0ZXJhbDpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpdGVyYWwoIGVsZW1lbnQudmFsdWUsIGNvbnRleHQgKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb29rdXBFeHByZXNzaW9uKCBlbGVtZW50LmtleSwgZmFsc2UsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yb290RXhwcmVzc2lvbiggZWxlbWVudC5rZXksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguQmxvY2tFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tFeHByZXNzaW9uKCBlbGVtZW50LmJvZHksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnVW5leHBlY3RlZCBsaXN0IGVsZW1lbnQgdHlwZScsIGVsZW1lbnQudHlwZSApO1xuICAgIH1cbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5saXRlcmFsID0gZnVuY3Rpb24oIHZhbHVlLCBjb250ZXh0ICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBMSVRFUkFMJywgdmFsdWUgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBmbjtcbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlTGl0ZXJhbCgpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIExJVEVSQUwnICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCB2YWx1ZSApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IHZvaWQgMCwgbmFtZTogdm9pZCAwLCB2YWx1ZTogdmFsdWUgfSA6XG4gICAgICAgICAgICB2YWx1ZTtcbiAgICB9O1xufTtcblxuSW50ZXJwcmV0ZXIucHJvdG90eXBlLmxvb2t1cEV4cHJlc3Npb24gPSBmdW5jdGlvbigga2V5LCByZXNvbHZlLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIExPT0tVUCBFWFBSRVNTSU9OJywga2V5ICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGlzTGVmdEZ1bmN0aW9uID0gZmFsc2UsXG4gICAgICAgIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgbGhzID0ge30sXG4gICAgICAgIGZuLCBsZWZ0O1xuXG4gICAgc3dpdGNoKCBrZXkudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5JZGVudGlmaWVyOlxuICAgICAgICAgICAgbGVmdCA9IHRoaXMuaWRlbnRpZmllcigga2V5Lm5hbWUsIHRydWUsIGFzc2lnbiApO1xuICAgICAgICAgICAgaXNMZWZ0RnVuY3Rpb24gPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LkxpdGVyYWw6XG4gICAgICAgICAgICBsaHMudmFsdWUgPSBsZWZ0ID0ga2V5LnZhbHVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBrZXksIHRydWUsIGFzc2lnbiApO1xuICAgICAgICAgICAgaXNMZWZ0RnVuY3Rpb24gPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUxvb2t1cEV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgTE9PS1VQIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMRUZUYCwgbGVmdC5uYW1lIHx8IGxlZnQgKTtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYoIGlzTGVmdEZ1bmN0aW9uICl7XG4gICAgICAgICAgICBsaHMgPSBsZWZ0KCBsb29rdXAsIHZhbHVlLCBzY29wZSApO1xuICAgICAgICAgICAgcmVzdWx0ID0gbGhzLnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBsb29rdXAsIGxocy52YWx1ZSwgdm9pZCAwICk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVzb2x2ZSBsb29rdXBzIHRoYXQgYXJlIHRoZSBvYmplY3Qgb2YgYW4gb2JqZWN0LXByb3BlcnR5IHJlbGF0aW9uc2hpcFxuICAgICAgICBpZiggcmVzb2x2ZSApe1xuICAgICAgICAgICAgcmVzdWx0ID0gYXNzaWduKCBzY29wZSwgcmVzdWx0LCB2b2lkIDAgKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEhTYCwgbGhzICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogbG9va3VwLCBuYW1lOiBsaHMudmFsdWUsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5yYW5nZUV4cHJlc3Npb24gPSBmdW5jdGlvbiggbmwsIG5yLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFJBTkdFIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBsZWZ0ID0gbmwgIT09IG51bGwgP1xuICAgICAgICAgICAgaW50ZXJwcmV0ZXIucmVjdXJzZSggbmwsIGZhbHNlLCBhc3NpZ24gKSA6XG4gICAgICAgICAgICByZXR1cm5aZXJvLFxuICAgICAgICByaWdodCA9IG5yICE9PSBudWxsID9cbiAgICAgICAgICAgIGludGVycHJldGVyLnJlY3Vyc2UoIG5yLCBmYWxzZSwgYXNzaWduICkgOlxuICAgICAgICAgICAgcmV0dXJuWmVybyxcbiAgICAgICAgZm4sIGluZGV4LCBsaHMsIG1pZGRsZSwgcmVzdWx0LCByaHM7XG5cbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlUmFuZ2VFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFJBTkdFIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMRUZUYCwgbGVmdC5uYW1lICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSSUdIVGAsIHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgcmhzID0gcmlnaHQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgICBpbmRleCA9IDE7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBMSFNgLCBsaHMgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJIU2AsIHJocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICByZXN1bHRbIDAgXSA9IGxocztcbiAgICAgICAgaWYoIGxocyA8IHJocyApe1xuICAgICAgICAgICAgbWlkZGxlID0gbGhzICsgMTtcbiAgICAgICAgICAgIHdoaWxlKCBtaWRkbGUgPCByaHMgKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4KysgXSA9IG1pZGRsZSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYoIGxocyA+IHJocyApe1xuICAgICAgICAgICAgbWlkZGxlID0gbGhzIC0gMTtcbiAgICAgICAgICAgIHdoaWxlKCBtaWRkbGUgPiByaHMgKXtcbiAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4KysgXSA9IG1pZGRsZS0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdFsgcmVzdWx0Lmxlbmd0aCBdID0gcmhzO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuSW50ZXJwcmV0ZXIucHJvdG90eXBlLnJlY3Vyc2UgPSBmdW5jdGlvbiggbm9kZSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ1JlY3Vyc2luZycsIG5vZGUudHlwZSwgbm9kZS5yYW5nZSApO1xuICAgIHZhciBleHByZXNzaW9uID0gbnVsbDtcbiAgICB0aGlzLmRlcHRoKys7XG5cbiAgICBzd2l0Y2goIG5vZGUudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5BcnJheUV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5hcnJheUV4cHJlc3Npb24oIG5vZGUuZWxlbWVudHMsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgdGhpcy5pc0xlZnRMaXN0ID0gbm9kZS5lbGVtZW50cy5sZW5ndGggPiAxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LkNhbGxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuY2FsbEV4cHJlc3Npb24oIG5vZGUuY2FsbGVlLCBub2RlLmFyZ3VtZW50cywgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LkJsb2NrRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmJsb2NrRXhwcmVzc2lvbiggbm9kZS5ib2R5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuZXhpc3RlbnRpYWxFeHByZXNzaW9uKCBub2RlLmV4cHJlc3Npb24sIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LklkZW50aWZpZXI6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5pZGVudGlmaWVyKCBub2RlLm5hbWUsIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LkxpdGVyYWw6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5saXRlcmFsKCBub2RlLnZhbHVlLCBjb250ZXh0ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguTWVtYmVyRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBub2RlLmNvbXB1dGVkID9cbiAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggbm9kZS5vYmplY3QsIG5vZGUucHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApIDpcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRpY01lbWJlckV4cHJlc3Npb24oIG5vZGUub2JqZWN0LCBub2RlLnByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxvb2t1cEV4cHJlc3Npb24oIG5vZGUua2V5LCBmYWxzZSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLnJhbmdlRXhwcmVzc2lvbiggbm9kZS5sZWZ0LCBub2RlLnJpZ2h0LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5yb290RXhwcmVzc2lvbiggbm9kZS5rZXksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgU3ludGF4LlNlcXVlbmNlRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLnNlcXVlbmNlRXhwcmVzc2lvbiggbm9kZS5leHByZXNzaW9ucywgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICB0aGlzLmlzUmlnaHRMaXN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAnVW5rbm93biBub2RlIHR5cGUgJyArIG5vZGUudHlwZSApO1xuICAgIH1cbiAgICB0aGlzLmRlcHRoLS07XG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUucm9vdEV4cHJlc3Npb24gPSBmdW5jdGlvbigga2V5LCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFJPT1QgRVhQUkVTU0lPTicgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgbGVmdCA9IHRoaXMucmVjdXJzZSgga2V5LCBmYWxzZSwgYXNzaWduICksXG4gICAgICAgIGRlcHRoID0gdGhpcy5kZXB0aCxcbiAgICAgICAgZm47XG5cbiAgICByZXR1cm4gZm4gPSBmdW5jdGlvbiBleGVjdXRlUm9vdEV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgUk9PVCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEVGVGAsIGxlZnQubmFtZSB8fCBsZWZ0ICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBTQ09QRWAsIHNjb3BlICk7XG4gICAgICAgIHZhciBsaHMsIHJlc3VsdDtcbiAgICAgICAgcmVzdWx0ID0gbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExIU2AsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkVTVUxUYCwgcmVzdWx0ICApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxvb2t1cCwgbmFtZTogbGhzLnZhbHVlLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUuc2VxdWVuY2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIGV4cHJlc3Npb25zLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBmbiwgbGlzdDtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFNFUVVFTkNFIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gREVQVEgnLCB0aGlzLmRlcHRoICk7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIGV4cHJlc3Npb25zICkgKXtcbiAgICAgICAgbGlzdCA9IHRoaXMubGlzdEV4cHJlc3Npb24oIGV4cHJlc3Npb25zLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTRVFVRU5DRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExJU1RgLCBsaXN0ICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGV4ZWN1dGVMaXN0KCBsaXN0LCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdCA9IHRoaXMucmVjdXJzZSggZXhwcmVzc2lvbnMsIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgICAgICBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb25XaXRoRXhwcmVzc2lvblJhbmdlKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTRVFVRU5DRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExJU1RgLCBsaXN0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbGlzdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtICR7IGZuLm5hbWUgfSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmbjtcbn07XG5cbkludGVycHJldGVyLnByb3RvdHlwZS5zdGF0aWNNZW1iZXJFeHByZXNzaW9uID0gZnVuY3Rpb24oIG9iamVjdCwgcHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgU1RBVElDIE1FTUJFUiBFWFBSRVNTSU9OJywgb2JqZWN0LnR5cGUsIHByb3BlcnR5LnR5cGUgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBERVBUSCcsIHRoaXMuZGVwdGggKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGlzUmlnaHRGdW5jdGlvbiA9IGZhbHNlLFxuICAgICAgICBpc1NhZmUgPSBvYmplY3QudHlwZSA9PT0gS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb24sXG4gICAgICAgIGZuLCBsZWZ0LCByaHMsIHJpZ2h0O1xuXG4gICAgc3dpdGNoKCBvYmplY3QudHlwZSApe1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmxvb2t1cEV4cHJlc3Npb24oIG9iamVjdC5rZXksIHRydWUsIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGVmdCA9IHRoaXMucmVjdXJzZSggb2JqZWN0LCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBzd2l0Y2goIHByb3BlcnR5LnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguSWRlbnRpZmllcjpcbiAgICAgICAgICAgIHJocyA9IHJpZ2h0ID0gcHJvcGVydHkubmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmlnaHQgPSB0aGlzLnJlY3Vyc2UoIHByb3BlcnR5LCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgICAgICBpc1JpZ2h0RnVuY3Rpb24gPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmbiA9IGZ1bmN0aW9uIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFNUQVRJQyBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IExFRlRgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJJR0hUYCwgcmhzIHx8IHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICksXG4gICAgICAgICAgICBpbmRleCwgcmVzdWx0O1xuXG4gICAgICAgIGlmKCAhaXNTYWZlIHx8ICggbGhzICE9PSB2b2lkIDAgJiYgbGhzICE9PSBudWxsICkgKXtcbiAgICAgICAgICAgIGlmKCBpc1JpZ2h0RnVuY3Rpb24gKXtcbiAgICAgICAgICAgICAgICByaHMgPSByaWdodCggcHJvcGVydHkudHlwZSA9PT0gS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiA/IHNjb3BlIDogbGhzLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gTEhTYCwgbGhzICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gUkhTYCwgcmhzICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSAkeyBmbi5uYW1lIH0gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgaWYoICggaW50ZXJwcmV0ZXIuaXNMZWZ0TGlzdCB8fCBpbnRlcnByZXRlci5pc1JpZ2h0TGlzdCApICYmIEFycmF5LmlzQXJyYXkoIGxocyApICl7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBsaHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggaW5kZXggKTtcbiAgICAgICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbIGluZGV4IF0gPSBhc3NpZ24oIGxoc1sgaW5kZXggXSwgcmhzLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIGxocywgcmhzLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gJHsgZm4ubmFtZSB9IFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxocywgbmFtZTogcmhzLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5JbnRlcnByZXRlci5wcm90b3R5cGUudGhyb3dFcnJvciA9IGZ1bmN0aW9uKCBtZXNzYWdlICl7XG4gICAgdmFyIGUgPSBuZXcgRXJyb3IoIG1lc3NhZ2UgKTtcbiAgICBlLmNvbHVtbk51bWJlciA9IHRoaXMuY29sdW1uO1xuICAgIHRocm93IGU7XG4gICAgLy90aHJvdyBuZXcgRXJyb3IoIG1lc3NhZ2UgKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0IExleGVyIGZyb20gJy4vbGV4ZXInO1xuaW1wb3J0IEJ1aWxkZXIgZnJvbSAnLi9idWlsZGVyJztcbmltcG9ydCBJbnRlcnByZXRlciBmcm9tICcuL2ludGVycHJldGVyJztcbmltcG9ydCBoYXNPd25Qcm9wZXJ0eSBmcm9tICcuL2hhcy1vd24tcHJvcGVydHknO1xuXG52YXIgbGV4ZXIgPSBuZXcgTGV4ZXIoKSxcbiAgICBidWlsZGVyID0gbmV3IEJ1aWxkZXIoIGxleGVyICksXG4gICAgaW50cmVwcmV0ZXIgPSBuZXcgSW50ZXJwcmV0ZXIoIGJ1aWxkZXIgKSxcblxuICAgIGNhY2hlID0gbmV3IE51bGwoKTtcblxuLyoqXG4gKiBAY2xhc3MgS2V5cGF0aEV4cFxuICogQGV4dGVuZHMgVHJhbnNkdWNlclxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHBhdHRlcm5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBmbGFnc1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBLZXlwYXRoRXhwKCBwYXR0ZXJuLCBmbGFncyApe1xuICAgIHR5cGVvZiBwYXR0ZXJuICE9PSAnc3RyaW5nJyAmJiAoIHBhdHRlcm4gPSAnJyApO1xuICAgIHR5cGVvZiBmbGFncyAhPT0gJ3N0cmluZycgJiYgKCBmbGFncyA9ICcnICk7XG5cbiAgICB2YXIgdG9rZW5zID0gaGFzT3duUHJvcGVydHkoIGNhY2hlLCBwYXR0ZXJuICkgP1xuICAgICAgICBjYWNoZVsgcGF0dGVybiBdIDpcbiAgICAgICAgY2FjaGVbIHBhdHRlcm4gXSA9IGxleGVyLmxleCggcGF0dGVybiApO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIHRoaXMsIHtcbiAgICAgICAgJ2ZsYWdzJzoge1xuICAgICAgICAgICAgdmFsdWU6IGZsYWdzLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgJ3NvdXJjZSc6IHtcbiAgICAgICAgICAgIHZhbHVlOiBwYXR0ZXJuLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgJ2dldHRlcic6IHtcbiAgICAgICAgICAgIHZhbHVlOiBpbnRyZXByZXRlci5jb21waWxlKCB0b2tlbnMsIGZhbHNlICksXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgJ3NldHRlcic6IHtcbiAgICAgICAgICAgIHZhbHVlOiBpbnRyZXByZXRlci5jb21waWxlKCB0b2tlbnMsIHRydWUgKSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSApO1xufVxuXG5LZXlwYXRoRXhwLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbktleXBhdGhFeHAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gS2V5cGF0aEV4cDtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuS2V5cGF0aEV4cC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oIHRhcmdldCwgbG9va3VwICl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0dGVyKCB0YXJnZXQsIHVuZGVmaW5lZCwgbG9va3VwICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5LZXlwYXRoRXhwLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiggdGFyZ2V0LCBsb29rdXAgKXtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5nZXR0ZXIoIHRhcmdldCwgdW5kZWZpbmVkLCBsb29rdXAgKTtcbiAgICByZXR1cm4gdHlwZW9mIHJlc3VsdCAhPT0gJ3VuZGVmaW5lZCc7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5LZXlwYXRoRXhwLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiggdGFyZ2V0LCB2YWx1ZSwgbG9va3VwICl7XG4gICAgcmV0dXJuIHRoaXMuc2V0dGVyKCB0YXJnZXQsIHZhbHVlLCBsb29rdXAgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbktleXBhdGhFeHAucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBuZXcgTnVsbCgpO1xuXG4gICAganNvbi5mbGFncyA9IHRoaXMuZmxhZ3M7XG4gICAganNvbi5zb3VyY2UgPSB0aGlzLnNvdXJjZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuS2V5cGF0aEV4cC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbn07IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCBLZXlwYXRoRXhwIGZyb20gJy4vZXhwJztcblxudmFyIHByb3RvY29sID0gbmV3IE51bGwoKTtcblxucHJvdG9jb2wuaW5pdCAgICA9ICdAQHRyYW5zZHVjZXIvaW5pdCc7XG5wcm90b2NvbC5zdGVwICAgID0gJ0BAdHJhbnNkdWNlci9zdGVwJztcbnByb3RvY29sLnJlZHVjZWQgPSAnQEB0cmFuc2R1Y2VyL3JlZHVjZWQnO1xucHJvdG9jb2wucmVzdWx0ICA9ICdAQHRyYW5zZHVjZXIvcmVzdWx0JztcbnByb3RvY29sLnZhbHVlICAgPSAnQEB0cmFuc2R1Y2VyL3ZhbHVlJztcblxuLyoqXG4gKiBBIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgdGhlIFRyYW5zZm9tZXIgcHJvdG9jb2wgdXNlZCBieSBUcmFuc2R1Y2Vyc1xuICogQGNsYXNzIFRyYW5zZm9ybWVyXG4gKiBAZXh0ZW5kcyBOdWxsXG4gKiBAcGFyYW0ge2V4dGVybmFsOkZ1bmN0aW9ufSB4ZiBBIHRyYW5zZm9ybWVyXG4gKi9cbmZ1bmN0aW9uIFRyYW5zZm9ybWVyKCB4ZiApe1xuICAgIHRoaXMueGYgPSB4Zjtcbn1cblxuVHJhbnNmb3JtZXIucHJvdG90eXBlID0gVHJhbnNmb3JtZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuVHJhbnNmb3JtZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVHJhbnNmb3JtZXI7XG5cbi8qKlxuICogQGZ1bmN0aW9uIFRyYW5zZm9ybWVyI0BAdHJhbnNkdWNlci9pbml0XG4gKi9cblRyYW5zZm9ybWVyLnByb3RvdHlwZVsgcHJvdG9jb2wuaW5pdCBdID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy54ZkluaXQoKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIFRyYW5zZm9ybWVyI0BAdHJhbnNkdWNlci9zdGVwXG4gKi9cblRyYW5zZm9ybWVyLnByb3RvdHlwZVsgcHJvdG9jb2wuc3RlcCBdID0gZnVuY3Rpb24oIHZhbHVlLCBpbnB1dCApe1xuICAgIHJldHVybiB0aGlzLnhmU3RlcCggdmFsdWUsIGlucHV0ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBUcmFuc2Zvcm1lciNAQHRyYW5zZHVjZXIvcmVzdWx0XG4gKi9cblRyYW5zZm9ybWVyLnByb3RvdHlwZVsgcHJvdG9jb2wucmVzdWx0IF0gPSBmdW5jdGlvbiggdmFsdWUgKXtcbiAgICByZXR1cm4gdGhpcy54ZlJlc3VsdCggdmFsdWUgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cblRyYW5zZm9ybWVyLnByb3RvdHlwZS54ZkluaXQgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnhmWyBwcm90b2NvbC5pbml0IF0oKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cblRyYW5zZm9ybWVyLnByb3RvdHlwZS54ZlN0ZXAgPSBmdW5jdGlvbiggdmFsdWUsIGlucHV0ICl7XG4gICAgcmV0dXJuIHRoaXMueGZbIHByb3RvY29sLnN0ZXAgXSggdmFsdWUsIGlucHV0ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5UcmFuc2Zvcm1lci5wcm90b3R5cGUueGZSZXN1bHQgPSBmdW5jdGlvbiggdmFsdWUgKXtcbiAgICByZXR1cm4gdGhpcy54ZlsgcHJvdG9jb2wucmVzdWx0IF0oIHZhbHVlICk7XG59O1xuXG4vKipcbiAqIEBjbGFzcyBLZXlwYXRoVHJhbnNmb3JtZXJcbiAqIEBleHRlbmRzIFRyYW5zZm9ybWVyXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gcCBBIGtleXBhdGggcGF0dGVyblxuICogQHBhcmFtIHtleHRlcm5hbDpGdW5jdGlvbn0geGYgQSB0cmFuc2Zvcm1lclxuICovXG5mdW5jdGlvbiBLZXlwYXRoVHJhbnNmb3JtZXIoIHAsIHhmICl7XG4gICAgVHJhbnNmb3JtZXIuY2FsbCggdGhpcywgeGYgKTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtLZXlwYXRoRXhwfVxuICAgICAqL1xuICAgIHRoaXMua3BleCA9IG5ldyBLZXlwYXRoRXhwKCBwICk7XG59XG5cbktleXBhdGhUcmFuc2Zvcm1lci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUcmFuc2Zvcm1lci5wcm90b3R5cGUgKTtcblxuS2V5cGF0aFRyYW5zZm9ybWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEtleXBhdGhUcmFuc2Zvcm1lcjtcblxuS2V5cGF0aFRyYW5zZm9ybWVyLnByb3RvdHlwZVsgcHJvdG9jb2wuc3RlcCBdID0gZnVuY3Rpb24oIHZhbHVlLCBpbnB1dCApe1xuICAgIHJldHVybiB0aGlzLnhmU3RlcCggdmFsdWUsIHRoaXMua3BleC5nZXQoIGlucHV0ICkgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gcCBBIGtleXBhdGggcGF0dGVyblxuICogQHJldHVybnMge2V4dGVybmFsOkZ1bmN0aW9ufVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBrZXlwYXRoKCBwICl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCB4ZiApe1xuICAgICAgICByZXR1cm4gbmV3IEtleXBhdGhUcmFuc2Zvcm1lciggcCwgeGYgKTtcbiAgICB9O1xufSJdLCJuYW1lcyI6WyJJZGVudGlmaWVyIiwiTnVtZXJpY0xpdGVyYWwiLCJOdWxsTGl0ZXJhbCIsIlB1bmN0dWF0b3IiLCJTdHJpbmdMaXRlcmFsIiwiR3JhbW1hci5JZGVudGlmaWVyIiwiR3JhbW1hci5OdW1lcmljTGl0ZXJhbCIsIkdyYW1tYXIuTnVsbExpdGVyYWwiLCJHcmFtbWFyLlB1bmN0dWF0b3IiLCJHcmFtbWFyLlN0cmluZ0xpdGVyYWwiLCJDaGFyYWN0ZXIuaXNJZGVudGlmaWVyU3RhcnQiLCJDaGFyYWN0ZXIuaXNJZGVudGlmaWVyUGFydCIsIlRva2VuLk51bGxMaXRlcmFsIiwiVG9rZW4uSWRlbnRpZmllciIsIkNoYXJhY3Rlci5pc1B1bmN0dWF0b3IiLCJUb2tlbi5QdW5jdHVhdG9yIiwiQ2hhcmFjdGVyLmlzUXVvdGUiLCJUb2tlbi5TdHJpbmdMaXRlcmFsIiwiQ2hhcmFjdGVyLmlzTnVtZXJpYyIsIlRva2VuLk51bWVyaWNMaXRlcmFsIiwiQ2hhcmFjdGVyLmlzV2hpdGVzcGFjZSIsIkFycmF5RXhwcmVzc2lvbiIsIkNhbGxFeHByZXNzaW9uIiwiRXhwcmVzc2lvblN0YXRlbWVudCIsIkxpdGVyYWwiLCJNZW1iZXJFeHByZXNzaW9uIiwiUHJvZ3JhbSIsIlNlcXVlbmNlRXhwcmVzc2lvbiIsIlN5bnRheC5MaXRlcmFsIiwiU3ludGF4Lk1lbWJlckV4cHJlc3Npb24iLCJTeW50YXguUHJvZ3JhbSIsIlN5bnRheC5BcnJheUV4cHJlc3Npb24iLCJTeW50YXguQ2FsbEV4cHJlc3Npb24iLCJTeW50YXguRXhwcmVzc2lvblN0YXRlbWVudCIsIlN5bnRheC5JZGVudGlmaWVyIiwiU3ludGF4LlNlcXVlbmNlRXhwcmVzc2lvbiIsIkJsb2NrRXhwcmVzc2lvbiIsIkV4aXN0ZW50aWFsRXhwcmVzc2lvbiIsIkxvb2t1cEV4cHJlc3Npb24iLCJSYW5nZUV4cHJlc3Npb24iLCJSb290RXhwcmVzc2lvbiIsIlNjb3BlRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5SYW5nZUV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uIiwiTm9kZS5BcnJheUV4cHJlc3Npb24iLCJLZXlwYXRoTm9kZS5CbG9ja0V4cHJlc3Npb24iLCJOb2RlLkNhbGxFeHByZXNzaW9uIiwiS2V5cGF0aE5vZGUuRXhpc3RlbnRpYWxFeHByZXNzaW9uIiwiTm9kZS5FeHByZXNzaW9uU3RhdGVtZW50IiwiTm9kZS5JZGVudGlmaWVyIiwiTm9kZS5OdW1lcmljTGl0ZXJhbCIsIk5vZGUuU3RyaW5nTGl0ZXJhbCIsIk5vZGUuTnVsbExpdGVyYWwiLCJLZXlwYXRoTm9kZS5Mb29rdXBFeHByZXNzaW9uIiwiTm9kZS5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24iLCJOb2RlLlN0YXRpY01lbWJlckV4cHJlc3Npb24iLCJOb2RlLlByb2dyYW0iLCJLZXlwYXRoTm9kZS5SYW5nZUV4cHJlc3Npb24iLCJLZXlwYXRoTm9kZS5Sb290RXhwcmVzc2lvbiIsIk5vZGUuU2VxdWVuY2VFeHByZXNzaW9uIiwiY2FjaGUiLCJLZXlwYXRoU3ludGF4LkJsb2NrRXhwcmVzc2lvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7O0FBS0EsQUFBZSxTQUFTLElBQUksRUFBRSxFQUFFO0FBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsSUFBSSxJQUFJOztBQ1AzQixTQUFTLGdCQUFnQixFQUFFLElBQUksRUFBRTtJQUNwQyxPQUFPLGlCQUFpQixFQUFFLElBQUksRUFBRSxJQUFJLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQztDQUN6RDs7QUFFRCxBQUFPLFNBQVMsaUJBQWlCLEVBQUUsSUFBSSxFQUFFO0lBQ3JDLE9BQU8sR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxHQUFHLENBQUM7Q0FDbkc7O0FBRUQsQUFBTyxTQUFTLFNBQVMsRUFBRSxJQUFJLEVBQUU7SUFDN0IsT0FBTyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLENBQUM7Q0FDckM7O0FBRUQsQUFBTyxTQUFTLFlBQVksRUFBRSxJQUFJLEVBQUU7SUFDaEMsT0FBTyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxD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
