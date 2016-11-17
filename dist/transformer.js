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
var cache;

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
        if( !cache ){
            cache = new Null();
        }
        tokens = hasOwnProperty( cache, pattern ) ?
            cache[ pattern ] :
            cache[ pattern ] = lexer.lex( pattern );
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VzIjpbIm51bGwuanMiLCJjaGFyYWN0ZXIuanMiLCJncmFtbWFyLmpzIiwidG9rZW4uanMiLCJsZXhlci5qcyIsInN5bnRheC5qcyIsIm5vZGUuanMiLCJrZXlwYXRoLXN5bnRheC5qcyIsImhhcy1vd24tcHJvcGVydHkuanMiLCJrZXlwYXRoLW5vZGUuanMiLCJidWlsZGVyLmpzIiwibWFwLmpzIiwiaW50ZXJwcmV0ZXIuanMiLCJleHAuanMiLCJ0cmFuc2Zvcm1lci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEEgXCJjbGVhblwiLCBlbXB0eSBjb250YWluZXIuIEluc3RhbnRpYXRpbmcgdGhpcyBpcyBmYXN0ZXIgdGhhbiBleHBsaWNpdGx5IGNhbGxpbmcgYE9iamVjdC5jcmVhdGUoIG51bGwgKWAuXG4gKiBAY2xhc3MgTnVsbFxuICogQGV4dGVuZHMgZXh0ZXJuYWw6bnVsbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBOdWxsKCl7fVxuTnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5OdWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBOdWxsOyIsImV4cG9ydCBmdW5jdGlvbiBpc0lkZW50aWZpZXJQYXJ0KCBjaGFyICl7XG4gICAgcmV0dXJuIGlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICkgfHwgaXNOdW1lcmljKCBjaGFyICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0lkZW50aWZpZXJTdGFydCggY2hhciApe1xuICAgIHJldHVybiAnYScgPD0gY2hhciAmJiBjaGFyIDw9ICd6JyB8fCAnQScgPD0gY2hhciAmJiBjaGFyIDw9ICdaJyB8fCAnXycgPT09IGNoYXIgfHwgY2hhciA9PT0gJyQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1lcmljKCBjaGFyICl7XG4gICAgcmV0dXJuICcwJyA8PSBjaGFyICYmIGNoYXIgPD0gJzknO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQdW5jdHVhdG9yKCBjaGFyICl7XG4gICAgcmV0dXJuICcuLD8oKVtde30lfjsnLmluZGV4T2YoIGNoYXIgKSAhPT0gLTE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1F1b3RlKCBjaGFyICl7XG4gICAgcmV0dXJuIGNoYXIgPT09ICdcIicgfHwgY2hhciA9PT0gXCInXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1doaXRlc3BhY2UoIGNoYXIgKXtcbiAgICByZXR1cm4gY2hhciA9PT0gJyAnIHx8IGNoYXIgPT09ICdcXHInIHx8IGNoYXIgPT09ICdcXHQnIHx8IGNoYXIgPT09ICdcXG4nIHx8IGNoYXIgPT09ICdcXHYnIHx8IGNoYXIgPT09ICdcXHUwMEEwJztcbn0iLCJleHBvcnQgdmFyIElkZW50aWZpZXIgICAgICA9ICdJZGVudGlmaWVyJztcbmV4cG9ydCB2YXIgTnVtZXJpY0xpdGVyYWwgID0gJ051bWVyaWMnO1xuZXhwb3J0IHZhciBOdWxsTGl0ZXJhbCAgICAgPSAnTnVsbCc7XG5leHBvcnQgdmFyIFB1bmN0dWF0b3IgICAgICA9ICdQdW5jdHVhdG9yJztcbmV4cG9ydCB2YXIgU3RyaW5nTGl0ZXJhbCAgID0gJ1N0cmluZyc7IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIEdyYW1tYXIgZnJvbSAnLi9ncmFtbWFyJztcblxudmFyIHRva2VuSWQgPSAwO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5Ub2tlblxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgdGhlIHRva2VuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSB0b2tlblxuICovXG5mdW5jdGlvbiBUb2tlbiggdHlwZSwgdmFsdWUgKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IExleGVyflRva2VuI2lkXG4gICAgICovXG4gICAgdGhpcy5pZCA9ICsrdG9rZW5JZDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IExleGVyflRva2VuI3R5cGVcbiAgICAgKi9cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gTGV4ZXJ+VG9rZW4jdmFsdWVcbiAgICAgKi9cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cblRva2VuLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cblRva2VuLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRva2VuO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlblxuICovXG5Ub2tlbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnR5cGUgPSB0aGlzLnR5cGU7XG4gICAganNvbi52YWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9rZW5cbiAqL1xuVG9rZW4ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gU3RyaW5nKCB0aGlzLnZhbHVlICk7XG59O1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5JZGVudGlmaWVyXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJZGVudGlmaWVyKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuSWRlbnRpZmllciwgdmFsdWUgKTtcbn1cblxuSWRlbnRpZmllci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuSWRlbnRpZmllci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJZGVudGlmaWVyO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5OdW1lcmljTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTnVtZXJpY0xpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5OdW1lcmljTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuTnVtZXJpY0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbk51bWVyaWNMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bWVyaWNMaXRlcmFsO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5OdWxsTGl0ZXJhbFxuICogQGV4dGVuZHMgTGV4ZXJ+VG9rZW5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTnVsbExpdGVyYWwoIHZhbHVlICl7XG4gICAgVG9rZW4uY2FsbCggdGhpcywgR3JhbW1hci5OdWxsTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuTnVsbExpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVG9rZW4ucHJvdG90eXBlICk7XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGxMaXRlcmFsO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5QdW5jdHVhdG9yXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQdW5jdHVhdG9yKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuUHVuY3R1YXRvciwgdmFsdWUgKTtcbn1cblxuUHVuY3R1YXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuUHVuY3R1YXRvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQdW5jdHVhdG9yO1xuXG4vKipcbiAqIEBjbGFzcyBMZXhlcn5TdHJpbmdMaXRlcmFsXG4gKiBAZXh0ZW5kcyBMZXhlcn5Ub2tlblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdHJpbmdMaXRlcmFsKCB2YWx1ZSApe1xuICAgIFRva2VuLmNhbGwoIHRoaXMsIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbCwgdmFsdWUgKTtcbn1cblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUb2tlbi5wcm90b3R5cGUgKTtcblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdHJpbmdMaXRlcmFsOyIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgKiBhcyBDaGFyYWN0ZXIgZnJvbSAnLi9jaGFyYWN0ZXInO1xuaW1wb3J0ICogYXMgVG9rZW4gZnJvbSAnLi90b2tlbic7XG5cbnZhciBsZXhlclByb3RvdHlwZTtcblxuLyoqXG4gKiBAY2xhc3MgTGV4ZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTGV4ZXIoKXtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICogQGRlZmF1bHQgJydcbiAgICAgKi9cbiAgICB0aGlzLnNvdXJjZSA9ICcnO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sZW5ndGggPSAwO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PExleGVyflRva2VuPn1cbiAgICAgKi9cbiAgICB0aGlzLnRva2VucyA9IFtdO1xufVxuXG5sZXhlclByb3RvdHlwZSA9IExleGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbmxleGVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGV4ZXI7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gdGV4dFxuICovXG5sZXhlclByb3RvdHlwZS5sZXggPSBmdW5jdGlvbiggdGV4dCApe1xuICAgIC8vIFJlc2V0IHRoZSBpbmRleCBhbmQgdG9rZW5zXG4gICAgaWYoIHRoaXMuaW5kZXggKXtcbiAgICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgICAgIHRoaXMudG9rZW5zID0gW107XG4gICAgfVxuXG4gICAgdGhpcy5zb3VyY2UgPSB0ZXh0O1xuICAgIHRoaXMubGVuZ3RoID0gdGV4dC5sZW5ndGg7XG5cbiAgICB2YXIgd29yZCA9ICcnLFxuICAgICAgICBjaGFyLCB0b2tlbiwgcXVvdGU7XG5cbiAgICB3aGlsZSggIXRoaXMuZW9sKCkgKXtcbiAgICAgICAgY2hhciA9IHRoaXMuc291cmNlWyB0aGlzLmluZGV4IF07XG5cbiAgICAgICAgLy8gSWRlbnRpZmllclxuICAgICAgICBpZiggQ2hhcmFjdGVyLmlzSWRlbnRpZmllclN0YXJ0KCBjaGFyICkgKXtcbiAgICAgICAgICAgIHdvcmQgPSB0aGlzLnJlYWQoIGZ1bmN0aW9uKCBjaGFyICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFDaGFyYWN0ZXIuaXNJZGVudGlmaWVyUGFydCggY2hhciApO1xuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB0b2tlbiA9IHdvcmQgPT09ICdudWxsJyA/XG4gICAgICAgICAgICAgICAgbmV3IFRva2VuLk51bGxMaXRlcmFsKCB3b3JkICkgOlxuICAgICAgICAgICAgICAgIG5ldyBUb2tlbi5JZGVudGlmaWVyKCB3b3JkICk7XG4gICAgICAgICAgICB0aGlzLnRva2Vucy5wdXNoKCB0b2tlbiApO1xuXG4gICAgICAgIC8vIFB1bmN0dWF0b3JcbiAgICAgICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNQdW5jdHVhdG9yKCBjaGFyICkgKXtcbiAgICAgICAgICAgIHRva2VuID0gbmV3IFRva2VuLlB1bmN0dWF0b3IoIGNoYXIgKTtcbiAgICAgICAgICAgIHRoaXMudG9rZW5zLnB1c2goIHRva2VuICk7XG5cbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICAvLyBRdW90ZWQgU3RyaW5nXG4gICAgICAgIH0gZWxzZSBpZiggQ2hhcmFjdGVyLmlzUXVvdGUoIGNoYXIgKSApe1xuICAgICAgICAgICAgcXVvdGUgPSBjaGFyO1xuXG4gICAgICAgICAgICB0aGlzLmluZGV4Kys7XG5cbiAgICAgICAgICAgIHdvcmQgPSB0aGlzLnJlYWQoIGZ1bmN0aW9uKCBjaGFyICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoYXIgPT09IHF1b3RlO1xuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB0b2tlbiA9IG5ldyBUb2tlbi5TdHJpbmdMaXRlcmFsKCBxdW90ZSArIHdvcmQgKyBxdW90ZSApO1xuICAgICAgICAgICAgdGhpcy50b2tlbnMucHVzaCggdG9rZW4gKTtcblxuICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xuXG4gICAgICAgIC8vIE51bWVyaWNcbiAgICAgICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNOdW1lcmljKCBjaGFyICkgKXtcbiAgICAgICAgICAgIHdvcmQgPSB0aGlzLnJlYWQoIGZ1bmN0aW9uKCBjaGFyICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFDaGFyYWN0ZXIuaXNOdW1lcmljKCBjaGFyICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHRva2VuID0gbmV3IFRva2VuLk51bWVyaWNMaXRlcmFsKCB3b3JkICk7XG4gICAgICAgICAgICB0aGlzLnRva2Vucy5wdXNoKCB0b2tlbiApO1xuXG4gICAgICAgIC8vIFdoaXRlc3BhY2VcbiAgICAgICAgfSBlbHNlIGlmKCBDaGFyYWN0ZXIuaXNXaGl0ZXNwYWNlKCBjaGFyICkgKXtcbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcblxuICAgICAgICAvLyBFcnJvclxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCAnXCInICsgY2hhciArICdcIiBpcyBhbiBpbnZhbGlkIGNoYXJhY3RlcicgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdvcmQgPSAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50b2tlbnM7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBsZXhlciBpcyBhdCB0aGUgZW5kIG9mIHRoZSBsaW5lXG4gKi9cbmxleGVyUHJvdG90eXBlLmVvbCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPj0gdGhpcy5sZW5ndGg7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpmdW5jdGlvbn0gdW50aWwgQSBjb25kaXRpb24gdGhhdCB3aGVuIG1ldCB3aWxsIHN0b3AgdGhlIHJlYWRpbmcgb2YgdGhlIGJ1ZmZlclxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gVGhlIHBvcnRpb24gb2YgdGhlIGJ1ZmZlciByZWFkXG4gKi9cbmxleGVyUHJvdG90eXBlLnJlYWQgPSBmdW5jdGlvbiggdW50aWwgKXtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4LFxuICAgICAgICBjaGFyO1xuXG4gICAgd2hpbGUoICF0aGlzLmVvbCgpICl7XG4gICAgICAgIGNoYXIgPSB0aGlzLnNvdXJjZVsgdGhpcy5pbmRleCBdO1xuXG4gICAgICAgIGlmKCB1bnRpbCggY2hhciApICl7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zb3VyY2Uuc2xpY2UoIHN0YXJ0LCB0aGlzLmluZGV4ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsZXhlclxuICovXG5sZXhlclByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24uc291cmNlID0gdGhpcy5zb3VyY2U7XG4gICAganNvbi50b2tlbnMgPSB0aGlzLnRva2Vucy5tYXAoIGZ1bmN0aW9uKCB0b2tlbiApe1xuICAgICAgICByZXR1cm4gdG9rZW4udG9KU09OKCk7XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGxleGVyXG4gKi9cbmxleGVyUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2U7XG59OyIsImV4cG9ydCB2YXIgQXJyYXlFeHByZXNzaW9uICAgICAgID0gJ0FycmF5RXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIENhbGxFeHByZXNzaW9uICAgICAgICA9ICdDYWxsRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIEV4cHJlc3Npb25TdGF0ZW1lbnQgICA9ICdFeHByZXNzaW9uU3RhdGVtZW50JztcbmV4cG9ydCB2YXIgSWRlbnRpZmllciAgICAgICAgICAgID0gJ0lkZW50aWZpZXInO1xuZXhwb3J0IHZhciBMaXRlcmFsICAgICAgICAgICAgICAgPSAnTGl0ZXJhbCc7XG5leHBvcnQgdmFyIE1lbWJlckV4cHJlc3Npb24gICAgICA9ICdNZW1iZXJFeHByZXNzaW9uJztcbmV4cG9ydCB2YXIgUHJvZ3JhbSAgICAgICAgICAgICAgID0gJ1Byb2dyYW0nO1xuZXhwb3J0IHZhciBTZXF1ZW5jZUV4cHJlc3Npb24gICAgPSAnU2VxdWVuY2VFeHByZXNzaW9uJzsiLCJpbXBvcnQgTnVsbCBmcm9tICcuL251bGwnO1xuaW1wb3J0ICogYXMgU3ludGF4IGZyb20gJy4vc3ludGF4JztcblxudmFyIG5vZGVJZCA9IDAsXG4gICAgbGl0ZXJhbFR5cGVzID0gJ2Jvb2xlYW4gbnVtYmVyIHN0cmluZycuc3BsaXQoICcgJyApO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfk5vZGVcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlIEEgbm9kZSB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOb2RlKCB0eXBlICl7XG5cbiAgICBpZiggdHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ3R5cGUgbXVzdCBiZSBhIHN0cmluZycsIFR5cGVFcnJvciApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gQnVpbGRlcn5Ob2RlI2lkXG4gICAgICovXG4gICAgdGhpcy5pZCA9ICsrbm9kZUlkO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gQnVpbGRlcn5Ob2RlI3R5cGVcbiAgICAgKi9cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xufVxuXG5Ob2RlLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbk5vZGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTm9kZTtcblxuTm9kZS5wcm90b3R5cGUudGhyb3dFcnJvciA9IGZ1bmN0aW9uKCBtZXNzYWdlLCBFcnJvckNsYXNzICl7XG4gICAgdHlwZW9mIEVycm9yQ2xhc3MgPT09ICd1bmRlZmluZWQnICYmICggRXJyb3JDbGFzcyA9IEVycm9yICk7XG4gICAgdGhyb3cgbmV3IEVycm9yQ2xhc3MoIG1lc3NhZ2UgKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIG5vZGVcbiAqL1xuTm9kZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBOdWxsKCk7XG5cbiAgICBqc29uLnR5cGUgPSB0aGlzLnR5cGU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbm9kZVxuICovXG5Ob2RlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFN0cmluZyggdGhpcy50eXBlICk7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5pZDtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5Ob2RlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZXhwcmVzc2lvblR5cGUgQSBub2RlIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEV4cHJlc3Npb24oIGV4cHJlc3Npb25UeXBlICl7XG4gICAgTm9kZS5jYWxsKCB0aGlzLCBleHByZXNzaW9uVHlwZSApO1xufVxuXG5FeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE5vZGUucHJvdG90eXBlICk7XG5cbkV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5MaXRlcmFsXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfkV4cHJlc3Npb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOm51bWJlcn0gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBsaXRlcmFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMaXRlcmFsKCB2YWx1ZSwgcmF3ICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguTGl0ZXJhbCApO1xuXG4gICAgaWYoIGxpdGVyYWxUeXBlcy5pbmRleE9mKCB0eXBlb2YgdmFsdWUgKSA9PT0gLTEgJiYgdmFsdWUgIT09IG51bGwgKXtcbiAgICAgICAgdGhpcy50aHJvd0Vycm9yKCAndmFsdWUgbXVzdCBiZSBhIGJvb2xlYW4sIG51bWJlciwgc3RyaW5nLCBvciBudWxsJywgVHlwZUVycm9yICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMucmF3ID0gcmF3O1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cbkxpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMaXRlcmFsO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsaXRlcmFsXG4gKi9cbkxpdGVyYWwucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5yYXcgPSB0aGlzLnJhdztcbiAgICBqc29uLnZhbHVlID0gdGhpcy52YWx1ZTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsaXRlcmFsXG4gKi9cbkxpdGVyYWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5yYXc7XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfk1lbWJlckV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IG9iamVjdFxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb258QnVpbGRlcn5JZGVudGlmaWVyfSBwcm9wZXJ0eVxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBjb21wdXRlZD1mYWxzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSwgY29tcHV0ZWQgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5NZW1iZXJFeHByZXNzaW9uICk7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5FeHByZXNzaW9ufEJ1aWxkZXJ+SWRlbnRpZmllcn1cbiAgICAgKi9cbiAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmNvbXB1dGVkID0gY29tcHV0ZWQgfHwgZmFsc2U7XG59XG5cbk1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW1iZXJFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtZW1iZXIgZXhwcmVzc2lvblxuICovXG5NZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ub2JqZWN0ICAgPSB0aGlzLm9iamVjdC50b0pTT04oKTtcbiAgICBqc29uLnByb3BlcnR5ID0gdGhpcy5wcm9wZXJ0eS50b0pTT04oKTtcbiAgICBqc29uLmNvbXB1dGVkID0gdGhpcy5jb21wdXRlZDtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5Qcm9ncmFtXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk5vZGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXk8QnVpbGRlcn5TdGF0ZW1lbnQ+fSBib2R5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQcm9ncmFtKCBib2R5ICl7XG4gICAgTm9kZS5jYWxsKCB0aGlzLCBTeW50YXguUHJvZ3JhbSApO1xuXG4gICAgaWYoICFBcnJheS5pc0FycmF5KCBib2R5ICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2JvZHkgbXVzdCBiZSBhbiBhcnJheScgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpBcnJheTxCdWlsZGVyflN0YXRlbWVudD59XG4gICAgICovXG4gICAgdGhpcy5ib2R5ID0gYm9keSB8fCBbXTtcbiAgICB0aGlzLnNvdXJjZVR5cGUgPSAnc2NyaXB0Jztcbn1cblxuUHJvZ3JhbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBOb2RlLnByb3RvdHlwZSApO1xuXG5Qcm9ncmFtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFByb2dyYW07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHByb2dyYW1cbiAqL1xuUHJvZ3JhbS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmJvZHkgPSB0aGlzLmJvZHkubWFwKCBmdW5jdGlvbiggbm9kZSApe1xuICAgICAgICByZXR1cm4gbm9kZS50b0pTT04oKTtcbiAgICB9ICk7XG4gICAganNvbi5zb3VyY2VUeXBlID0gdGhpcy5zb3VyY2VUeXBlO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyflN0YXRlbWVudFxuICogQGV4dGVuZHMgQnVpbGRlcn5Ob2RlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gc3RhdGVtZW50VHlwZSBBIG5vZGUgdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RhdGVtZW50KCBzdGF0ZW1lbnRUeXBlICl7XG4gICAgTm9kZS5jYWxsKCB0aGlzLCBzdGF0ZW1lbnRUeXBlICk7XG59XG5cblN0YXRlbWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBOb2RlLnByb3RvdHlwZSApO1xuXG5TdGF0ZW1lbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RhdGVtZW50O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkFycmF5RXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufSBlbGVtZW50cyBBIGxpc3Qgb2YgZXhwcmVzc2lvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFycmF5RXhwcmVzc2lvbiggZWxlbWVudHMgKXtcbiAgICBFeHByZXNzaW9uLmNhbGwoIHRoaXMsIFN5bnRheC5BcnJheUV4cHJlc3Npb24gKTtcblxuICAgIC8vaWYoICEoIEFycmF5LmlzQXJyYXkoIGVsZW1lbnRzICkgKSAmJiAhKCBlbGVtZW50cyBpbnN0YW5jZW9mIFJhbmdlRXhwcmVzc2lvbiApICl7XG4gICAgLy8gICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2VsZW1lbnRzIG11c3QgYmUgYSBsaXN0IG9mIGV4cHJlc3Npb25zIG9yIGFuIGluc3RhbmNlIG9mIHJhbmdlIGV4cHJlc3Npb24nICk7XG4gICAgLy99XG5cbiAgICAvKlxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ2VsZW1lbnRzJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiggZWxlbWVudHMgKXtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICB0aGlzWyBpbmRleCBdID0gZWxlbWVudHNbIGluZGV4IF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9ICk7XG4gICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0FycmF5PEJ1aWxkZXJ+RXhwcmVzc2lvbj58UmFuZ2VFeHByZXNzaW9ufVxuICAgICAqL1xuICAgIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50cztcbn1cblxuQXJyYXlFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkFycmF5RXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBcnJheUV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGFycmF5IGV4cHJlc3Npb25cbiAqL1xuQXJyYXlFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGlmKCBBcnJheS5pc0FycmF5KCB0aGlzLmVsZW1lbnRzICkgKXtcbiAgICAgICAganNvbi5lbGVtZW50cyA9IHRoaXMuZWxlbWVudHMubWFwKCBmdW5jdGlvbiggZWxlbWVudCApe1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudG9KU09OKCk7XG4gICAgICAgIH0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBqc29uLmVsZW1lbnRzID0gdGhpcy5lbGVtZW50cy50b0pTT04oKTtcbiAgICB9XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+Q2FsbEV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IGNhbGxlZVxuICogQHBhcmFtIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fSBhcmdzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDYWxsRXhwcmVzc2lvbiggY2FsbGVlLCBhcmdzICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBTeW50YXguQ2FsbEV4cHJlc3Npb24gKTtcblxuICAgIGlmKCAhQXJyYXkuaXNBcnJheSggYXJncyApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdhcmd1bWVudHMgbXVzdCBiZSBhbiBhcnJheScgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5jYWxsZWUgPSBjYWxsZWU7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPn1cbiAgICAgKi9cbiAgICB0aGlzLmFyZ3VtZW50cyA9IGFyZ3M7XG59XG5cbkNhbGxFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkNhbGxFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENhbGxFeHByZXNzaW9uO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjYWxsIGV4cHJlc3Npb25cbiAqL1xuQ2FsbEV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5jYWxsZWUgICAgPSB0aGlzLmNhbGxlZS50b0pTT04oKTtcbiAgICBqc29uLmFyZ3VtZW50cyA9IHRoaXMuYXJndW1lbnRzLm1hcCggZnVuY3Rpb24oIG5vZGUgKXtcbiAgICAgICAgcmV0dXJuIG5vZGUudG9KU09OKCk7XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5NZW1iZXJFeHByZXNzaW9uXG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gb2JqZWN0XG4gKiBAcGFyYW0ge0J1aWxkZXJ+RXhwcmVzc2lvbn0gcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApe1xuICAgIGlmKCAhKCBwcm9wZXJ0eSBpbnN0YW5jZW9mIEV4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncHJvcGVydHkgbXVzdCBiZSBhbiBleHByZXNzaW9uIHdoZW4gY29tcHV0ZWQgaXMgdHJ1ZScgKTtcbiAgICB9XG5cbiAgICBNZW1iZXJFeHByZXNzaW9uLmNhbGwoIHRoaXMsIG9iamVjdCwgcHJvcGVydHksIHRydWUgKTtcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIgQnVpbGRlcn5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24jY29tcHV0ZWQ9dHJ1ZVxuICAgICAqL1xufVxuXG5Db21wdXRlZE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5FeHByZXNzaW9uU3RhdGVtZW50XG4gKiBAZXh0ZW5kcyBCdWlsZGVyflN0YXRlbWVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gRXhwcmVzc2lvblN0YXRlbWVudCggZXhwcmVzc2lvbiApe1xuICAgIFN0YXRlbWVudC5jYWxsKCB0aGlzLCBTeW50YXguRXhwcmVzc2lvblN0YXRlbWVudCApO1xuXG4gICAgaWYoICEoIGV4cHJlc3Npb24gaW5zdGFuY2VvZiBFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2FyZ3VtZW50IG11c3QgYmUgYW4gZXhwcmVzc2lvbicgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbn1cblxuRXhwcmVzc2lvblN0YXRlbWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBTdGF0ZW1lbnQucHJvdG90eXBlICk7XG5cbkV4cHJlc3Npb25TdGF0ZW1lbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRXhwcmVzc2lvblN0YXRlbWVudDtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZXhwcmVzc2lvbiBzdGF0ZW1lbnRcbiAqL1xuRXhwcmVzc2lvblN0YXRlbWVudC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLmV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb24udG9KU09OKCk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+SWRlbnRpZmllclxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgaWRlbnRpZmllclxuICovXG5leHBvcnQgZnVuY3Rpb24gSWRlbnRpZmllciggbmFtZSApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LklkZW50aWZpZXIgKTtcblxuICAgIGlmKCB0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ25hbWUgbXVzdCBiZSBhIHN0cmluZycgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbn1cblxuSWRlbnRpZmllci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5JZGVudGlmaWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IElkZW50aWZpZXI7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGlkZW50aWZpZXJcbiAqL1xuSWRlbnRpZmllci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE5vZGUucHJvdG90eXBlLnRvSlNPTi5jYWxsKCB0aGlzICk7XG5cbiAgICBqc29uLm5hbWUgPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBOdWxsTGl0ZXJhbCggcmF3ICl7XG4gICAgaWYoIHJhdyAhPT0gJ251bGwnICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyYXcgaXMgbm90IGEgbnVsbCBsaXRlcmFsJyApO1xuICAgIH1cblxuICAgIExpdGVyYWwuY2FsbCggdGhpcywgbnVsbCwgcmF3ICk7XG59XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExpdGVyYWwucHJvdG90eXBlICk7XG5cbk51bGxMaXRlcmFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGxMaXRlcmFsO1xuXG5leHBvcnQgZnVuY3Rpb24gTnVtZXJpY0xpdGVyYWwoIHJhdyApe1xuICAgIHZhciB2YWx1ZSA9IHBhcnNlRmxvYXQoIHJhdyApO1xuXG4gICAgaWYoIGlzTmFOKCB2YWx1ZSApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdyYXcgaXMgbm90IGEgbnVtZXJpYyBsaXRlcmFsJyApO1xuICAgIH1cblxuICAgIExpdGVyYWwuY2FsbCggdGhpcywgdmFsdWUsIHJhdyApO1xufVxuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBMaXRlcmFsLnByb3RvdHlwZSApO1xuXG5OdW1lcmljTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdW1lcmljTGl0ZXJhbDtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5TZXF1ZW5jZUV4cHJlc3Npb25cbiAqIEBleHRlbmRzIEJ1aWxkZXJ+RXhwcmVzc2lvblxuICogQHBhcmFtIHtBcnJheTxCdWlsZGVyfkV4cHJlc3Npb24+fFJhbmdlRXhwcmVzc2lvbn0gZXhwcmVzc2lvbnMgVGhlIGV4cHJlc3Npb25zIGluIHRoZSBzZXF1ZW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2VxdWVuY2VFeHByZXNzaW9uKCBleHByZXNzaW9ucyApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgU3ludGF4LlNlcXVlbmNlRXhwcmVzc2lvbiApO1xuXG4gICAgLy9pZiggISggQXJyYXkuaXNBcnJheSggZXhwcmVzc2lvbnMgKSApICYmICEoIGV4cHJlc3Npb25zIGluc3RhbmNlb2YgUmFuZ2VFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnZXhwcmVzc2lvbnMgbXVzdCBiZSBhIGxpc3Qgb2YgZXhwcmVzc2lvbnMgb3IgYW4gaW5zdGFuY2Ugb2YgcmFuZ2UgZXhwcmVzc2lvbicgKTtcbiAgICAvL31cblxuICAgIC8qXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB0aGlzLCAnZXhwcmVzc2lvbnMnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKCBleHByZXNzaW9ucyApe1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5sZW5ndGggPSBleHByZXNzaW9ucy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHRoaXNbIGluZGV4IF0gPSBleHByZXNzaW9uc1sgaW5kZXggXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0gKTtcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QXJyYXk8QnVpbGRlcn5FeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259XG4gICAgICovXG4gICAgdGhpcy5leHByZXNzaW9ucyA9IGV4cHJlc3Npb25zO1xufVxuXG5TZXF1ZW5jZUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuU2VxdWVuY2VFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNlcXVlbmNlRXhwcmVzc2lvbjtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgc2VxdWVuY2UgZXhwcmVzc2lvblxuICovXG5TZXF1ZW5jZUV4cHJlc3Npb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGpzb24gPSBOb2RlLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIHRoaXMuZXhwcmVzc2lvbnMgKSApe1xuICAgICAgICBqc29uLmV4cHJlc3Npb25zID0gdGhpcy5leHByZXNzaW9ucy5tYXAoIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvbi50b0pTT04oKTtcbiAgICAgICAgfSApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGpzb24uZXhwcmVzc2lvbnMgPSB0aGlzLmV4cHJlc3Npb25zLnRvSlNPTigpO1xuICAgIH1cblxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgQnVpbGRlcn5TdGF0aWNNZW1iZXJFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk1lbWJlckV4cHJlc3Npb25cbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSBvYmplY3RcbiAqIEBwYXJhbSB7QnVpbGRlcn5JZGVudGlmaWVyfSBwcm9wZXJ0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RhdGljTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApe1xuICAgIC8vaWYoICEoIHByb3BlcnR5IGluc3RhbmNlb2YgSWRlbnRpZmllciApICYmICEoIHByb3BlcnR5IGluc3RhbmNlb2YgTG9va3VwRXhwcmVzc2lvbiApICYmICEoIHByb3BlcnR5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAncHJvcGVydHkgbXVzdCBiZSBhbiBpZGVudGlmaWVyLCBldmFsIGV4cHJlc3Npb24sIG9yIGxvb2t1cCBleHByZXNzaW9uIHdoZW4gY29tcHV0ZWQgaXMgZmFsc2UnICk7XG4gICAgLy99XG5cbiAgICBNZW1iZXJFeHByZXNzaW9uLmNhbGwoIHRoaXMsIG9iamVjdCwgcHJvcGVydHksIGZhbHNlICk7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIEJ1aWxkZXJ+U3RhdGljTWVtYmVyRXhwcmVzc2lvbiNjb21wdXRlZD1mYWxzZVxuICAgICAqL1xufVxuXG5TdGF0aWNNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cblN0YXRpY01lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RhdGljTWVtYmVyRXhwcmVzc2lvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIFN0cmluZ0xpdGVyYWwoIHJhdyApe1xuICAgIGlmKCByYXdbIDAgXSAhPT0gJ1wiJyAmJiByYXdbIDAgXSAhPT0gXCInXCIgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JhdyBpcyBub3QgYSBzdHJpbmcgbGl0ZXJhbCcgKTtcbiAgICB9XG5cbiAgICB2YXIgdmFsdWUgPSByYXcuc3Vic3RyaW5nKCAxLCByYXcubGVuZ3RoIC0gMSApO1xuXG4gICAgTGl0ZXJhbC5jYWxsKCB0aGlzLCB2YWx1ZSwgcmF3ICk7XG59XG5cblN0cmluZ0xpdGVyYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTGl0ZXJhbC5wcm90b3R5cGUgKTtcblxuU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdHJpbmdMaXRlcmFsOyIsImV4cG9ydCB2YXIgQmxvY2tFeHByZXNzaW9uICAgICAgID0gJ0Jsb2NrRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIEV4aXN0ZW50aWFsRXhwcmVzc2lvbiA9ICdFeGlzdGVudGlhbEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBMb29rdXBFeHByZXNzaW9uICAgICAgPSAnTG9va3VwRXhwcmVzc2lvbic7XG5leHBvcnQgdmFyIFJhbmdlRXhwcmVzc2lvbiAgICAgICA9ICdSYW5nZUV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBSb290RXhwcmVzc2lvbiAgICAgICAgPSAnUm9vdEV4cHJlc3Npb24nO1xuZXhwb3J0IHZhciBTY29wZUV4cHJlc3Npb24gICAgICAgPSAnU2NvcGVFeHByZXNzaW9uJzsiLCJ2YXIgX2hhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7Kn0gb2JqZWN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gcHJvcGVydHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaGFzT3duUHJvcGVydHkoIG9iamVjdCwgcHJvcGVydHkgKXtcbiAgICByZXR1cm4gX2hhc093blByb3BlcnR5LmNhbGwoIG9iamVjdCwgcHJvcGVydHkgKTtcbn0iLCJpbXBvcnQgeyBDb21wdXRlZE1lbWJlckV4cHJlc3Npb24sIEV4cHJlc3Npb24sIElkZW50aWZpZXIsIE5vZGUsIExpdGVyYWwgfSBmcm9tICcuL25vZGUnO1xuaW1wb3J0ICogYXMgS2V5cGF0aFN5bnRheCBmcm9tICcuL2tleXBhdGgtc3ludGF4JztcbmltcG9ydCBoYXNPd25Qcm9wZXJ0eSBmcm9tICcuL2hhcy1vd24tcHJvcGVydHknO1xuXG4vKipcbiAqIEBjbGFzcyBCdWlsZGVyfk9wZXJhdG9yRXhwcmVzc2lvblxuICogQGV4dGVuZHMgQnVpbGRlcn5FeHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZXhwcmVzc2lvblR5cGVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBvcGVyYXRvclxuICovXG5mdW5jdGlvbiBPcGVyYXRvckV4cHJlc3Npb24oIGV4cHJlc3Npb25UeXBlLCBvcGVyYXRvciApe1xuICAgIEV4cHJlc3Npb24uY2FsbCggdGhpcywgZXhwcmVzc2lvblR5cGUgKTtcblxuICAgIHRoaXMub3BlcmF0b3IgPSBvcGVyYXRvcjtcbn1cblxuT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbk9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBPcGVyYXRvckV4cHJlc3Npb247XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIG9wZXJhdG9yIGV4cHJlc3Npb25cbiAqL1xuT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gTm9kZS5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ub3BlcmF0b3IgPSB0aGlzLm9wZXJhdG9yO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gQmxvY2tFeHByZXNzaW9uKCBib2R5ICl7XG4gICAgRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCAnQmxvY2tFeHByZXNzaW9uJyApO1xuXG4gICAgLypcbiAgICBpZiggISggZXhwcmVzc2lvbiBpbnN0YW5jZW9mIEV4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnYXJndW1lbnQgbXVzdCBiZSBhbiBleHByZXNzaW9uJyApO1xuICAgIH1cbiAgICAqL1xuXG4gICAgdGhpcy5ib2R5ID0gYm9keTtcbn1cblxuQmxvY2tFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV4cHJlc3Npb24ucHJvdG90eXBlICk7XG5cbkJsb2NrRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCbG9ja0V4cHJlc3Npb247XG5cbmV4cG9ydCBmdW5jdGlvbiBFeGlzdGVudGlhbEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKXtcbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5FeGlzdGVudGlhbEV4cHJlc3Npb24sICc/JyApO1xuXG4gICAgdGhpcy5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbn1cblxuRXhpc3RlbnRpYWxFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuRXhpc3RlbnRpYWxFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEV4aXN0ZW50aWFsRXhwcmVzc2lvbjtcblxuRXhpc3RlbnRpYWxFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5leHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uLnRvSlNPTigpO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gTG9va3VwRXhwcmVzc2lvbigga2V5ICl7XG4gICAgaWYoICEoIGtleSBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISgga2V5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2tleSBtdXN0IGJlIGEgbGl0ZXJhbCwgaWRlbnRpZmllciwgb3IgZXZhbCBleHByZXNzaW9uJyApO1xuICAgIH1cblxuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb24sICclJyApO1xuXG4gICAgdGhpcy5rZXkgPSBrZXk7XG59XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5Mb29rdXBFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvb2t1cEV4cHJlc3Npb247XG5cbkxvb2t1cEV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciArIHRoaXMua2V5O1xufTtcblxuTG9va3VwRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ua2V5ID0gdGhpcy5rZXk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uXG4gKiBAZXh0ZW5kcyBCdWlsZGVyfk9wZXJhdG9yRXhwcmVzc2lvblxuICogQHBhcmFtIHtCdWlsZGVyfkV4cHJlc3Npb259IGxlZnRcbiAqIEBwYXJhbSB7QnVpbGRlcn5FeHByZXNzaW9ufSByaWdodFxuICovXG5leHBvcnQgZnVuY3Rpb24gUmFuZ2VFeHByZXNzaW9uKCBsZWZ0LCByaWdodCApe1xuICAgIE9wZXJhdG9yRXhwcmVzc2lvbi5jYWxsKCB0aGlzLCBLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbiwgJy4uJyApO1xuXG4gICAgaWYoICEoIGxlZnQgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgbGVmdCAhPT0gbnVsbCApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGVmdCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGxpdGVyYWwgb3IgbnVsbCcgKTtcbiAgICB9XG5cbiAgICBpZiggISggcmlnaHQgaW5zdGFuY2VvZiBMaXRlcmFsICkgJiYgcmlnaHQgIT09IG51bGwgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3JpZ2h0IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgbGl0ZXJhbCBvciBudWxsJyApO1xuICAgIH1cblxuICAgIGlmKCBsZWZ0ID09PSBudWxsICYmIHJpZ2h0ID09PSBudWxsICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsZWZ0IGFuZCByaWdodCBjYW5ub3QgZXF1YWwgbnVsbCBhdCB0aGUgc2FtZSB0aW1lJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge0J1aWxkZXJ+TGl0ZXJhbH0gQnVpbGRlcn5SYW5nZUV4cHJlc3Npb24jbGVmdFxuICAgICAqL1xuICAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uIzBcbiAgICAgKi9cbiAgICB0aGlzWyAwIF0gPSB0aGlzLmxlZnQgPSBsZWZ0O1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn5MaXRlcmFsfSBCdWlsZGVyflJhbmdlRXhwcmVzc2lvbiNyaWdodFxuICAgICAqL1xuICAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtCdWlsZGVyfkxpdGVyYWx9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uIzFcbiAgICAgKi9cbiAgICB0aGlzWyAxIF0gPSB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEJ1aWxkZXJ+UmFuZ2VFeHByZXNzaW9uI2xlbmd0aD0yXG4gICAgICovXG4gICAgdGhpcy5sZW5ndGggPSAyO1xufVxuXG5SYW5nZUV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJhbmdlRXhwcmVzc2lvbjtcblxuUmFuZ2VFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5sZWZ0ID0gdGhpcy5sZWZ0ICE9PSBudWxsID9cbiAgICAgICAgdGhpcy5sZWZ0LnRvSlNPTigpIDpcbiAgICAgICAgdGhpcy5sZWZ0O1xuICAgIGpzb24ucmlnaHQgPSB0aGlzLnJpZ2h0ICE9PSBudWxsID9cbiAgICAgICAgdGhpcy5yaWdodC50b0pTT04oKSA6XG4gICAgICAgIHRoaXMucmlnaHQ7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cblJhbmdlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmxlZnQudG9TdHJpbmcoKSArIHRoaXMub3BlcmF0b3IgKyB0aGlzLnJpZ2h0LnRvU3RyaW5nKCk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb24oIG9iamVjdCwgcHJvcGVydHksIGNhcmRpbmFsaXR5ICl7XG4gICAgQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLmNhbGwoIHRoaXMsIG9iamVjdCwgcHJvcGVydHkgKTtcblxuICAgIGlmKCAhaGFzT3duUHJvcGVydHkoIENhcmRpbmFsaXR5LCBjYXJkaW5hbGl0eSApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdVbmtub3duIGNhcmRpbmFsaXR5ICcgKyBjYXJkaW5hbGl0eSApO1xuICAgIH1cblxuICAgIHRoaXMuY2FyZGluYWxpdHkgPSBjYXJkaW5hbGl0eTtcbn1cblxuUmVsYXRpb25hbE1lbWJlckV4cHJlc3Npb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uLnByb3RvdHlwZSApO1xuXG5SZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZWxhdGlvbmFsTWVtYmVyRXhwcmVzc2lvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIFJvb3RFeHByZXNzaW9uKCBrZXkgKXtcbiAgICBpZiggISgga2V5IGluc3RhbmNlb2YgTGl0ZXJhbCApICYmICEoIGtleSBpbnN0YW5jZW9mIElkZW50aWZpZXIgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBCbG9ja0V4cHJlc3Npb24gKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAna2V5IG11c3QgYmUgYSBsaXRlcmFsLCBpZGVudGlmaWVyLCBvciBldmFsIGV4cHJlc3Npb24nICk7XG4gICAgfVxuXG4gICAgT3BlcmF0b3JFeHByZXNzaW9uLmNhbGwoIHRoaXMsIEtleXBhdGhTeW50YXguUm9vdEV4cHJlc3Npb24sICd+JyApO1xuXG4gICAgdGhpcy5rZXkgPSBrZXk7XG59XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuUm9vdEV4cHJlc3Npb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUm9vdEV4cHJlc3Npb247XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0b3IgKyB0aGlzLmtleTtcbn07XG5cblJvb3RFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gT3BlcmF0b3JFeHByZXNzaW9uLnByb3RvdHlwZS50b0pTT04uY2FsbCggdGhpcyApO1xuXG4gICAganNvbi5rZXkgPSB0aGlzLmtleTtcblxuICAgIHJldHVybiBqc29uO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFNjb3BlRXhwcmVzc2lvbiggb3BlcmF0b3IsIGtleSApe1xuICAgIC8vaWYoICEoIGtleSBpbnN0YW5jZW9mIExpdGVyYWwgKSAmJiAhKCBrZXkgaW5zdGFuY2VvZiBJZGVudGlmaWVyICkgJiYgISgga2V5IGluc3RhbmNlb2YgQmxvY2tFeHByZXNzaW9uICkgKXtcbiAgICAvLyAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAna2V5IG11c3QgYmUgYSBsaXRlcmFsLCBpZGVudGlmaWVyLCBvciBldmFsIGV4cHJlc3Npb24nICk7XG4gICAgLy99XG5cbiAgICBPcGVyYXRvckV4cHJlc3Npb24uY2FsbCggdGhpcywgS2V5cGF0aFN5bnRheC5TY29wZUV4cHJlc3Npb24sIG9wZXJhdG9yICk7XG5cbiAgICB0aGlzLmtleSA9IGtleTtcbn1cblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUgKTtcblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNjb3BlRXhwcmVzc2lvbjtcblxuU2NvcGVFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0b3IgKyB0aGlzLmtleTtcbn07XG5cblNjb3BlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IE9wZXJhdG9yRXhwcmVzc2lvbi5wcm90b3R5cGUudG9KU09OLmNhbGwoIHRoaXMgKTtcblxuICAgIGpzb24ua2V5ID0gdGhpcy5rZXk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07IiwiaW1wb3J0IE51bGwgZnJvbSAnLi9udWxsJztcbmltcG9ydCAqIGFzIEdyYW1tYXIgZnJvbSAnLi9ncmFtbWFyJztcbmltcG9ydCAqIGFzIE5vZGUgZnJvbSAnLi9ub2RlJztcbmltcG9ydCAqIGFzIEtleXBhdGhOb2RlIGZyb20gJy4va2V5cGF0aC1ub2RlJztcblxudmFyIGJ1aWxkZXJQcm90b3R5cGU7XG5cbi8qKlxuICogQGNsYXNzIEJ1aWxkZXJcbiAqIEBleHRlbmRzIE51bGxcbiAqIEBwYXJhbSB7TGV4ZXJ9IGxleGVyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEJ1aWxkZXIoIGxleGVyICl7XG4gICAgdGhpcy5sZXhlciA9IGxleGVyO1xufVxuXG5idWlsZGVyUHJvdG90eXBlID0gQnVpbGRlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5idWlsZGVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVpbGRlcjtcblxuYnVpbGRlclByb3RvdHlwZS5hcnJheUV4cHJlc3Npb24gPSBmdW5jdGlvbiggbGlzdCApe1xuICAgIC8vY29uc29sZS5sb2coICdBUlJBWSBFWFBSRVNTSU9OJyApO1xuICAgIHRoaXMuY29uc3VtZSggJ1snICk7XG4gICAgcmV0dXJuIG5ldyBOb2RlLkFycmF5RXhwcmVzc2lvbiggbGlzdCApO1xufTtcblxuYnVpbGRlclByb3RvdHlwZS5ibG9ja0V4cHJlc3Npb24gPSBmdW5jdGlvbiggdGVybWluYXRvciApe1xuICAgIHZhciBibG9jayA9IFtdLFxuICAgICAgICBpc29sYXRlZCA9IGZhbHNlO1xuICAgIC8vY29uc29sZS5sb2coICdCTE9DSycsIHRlcm1pbmF0b3IgKTtcbiAgICBpZiggIXRoaXMucGVlayggdGVybWluYXRvciApICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICctIEVYUFJFU1NJT05TJyApO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBibG9jay51bnNoaWZ0KCB0aGlzLmNvbnN1bWUoKSApO1xuICAgICAgICB9IHdoaWxlKCAhdGhpcy5wZWVrKCB0ZXJtaW5hdG9yICkgKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lKCB0ZXJtaW5hdG9yICk7XG4gICAgLyppZiggdGhpcy5wZWVrKCAnficgKSApe1xuICAgICAgICBpc29sYXRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuY29uc3VtZSggJ34nICk7XG4gICAgfSovXG4gICAgcmV0dXJuIG5ldyBLZXlwYXRoTm9kZS5CbG9ja0V4cHJlc3Npb24oIGJsb2NrLCBpc29sYXRlZCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfEFycmF5PEJ1aWxkZXJ+VG9rZW4+fSBpbnB1dFxuICogQHJldHVybnMge1Byb2dyYW19IFRoZSBidWlsdCBhYnN0cmFjdCBzeW50YXggdHJlZVxuICovXG5idWlsZGVyUHJvdG90eXBlLmJ1aWxkID0gZnVuY3Rpb24oIGlucHV0ICl7XG4gICAgaWYoIHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgKXtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudGV4dCA9IGlucHV0O1xuXG4gICAgICAgIGlmKCB0eXBlb2YgdGhpcy5sZXhlciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvciggJ2xleGVyIGlzIG5vdCBkZWZpbmVkJyApO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZW1iZXIge2V4dGVybmFsOkFycmF5PFRva2VuPn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudG9rZW5zID0gdGhpcy5sZXhlci5sZXgoIGlucHV0ICk7XG4gICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBpbnB1dCApICl7XG4gICAgICAgIHRoaXMudG9rZW5zID0gaW5wdXQuc2xpY2UoKTtcbiAgICAgICAgdGhpcy50ZXh0ID0gaW5wdXQuam9pbiggJycgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRocm93RXJyb3IoICdpbnZhbGlkIGlucHV0JyApO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCAnQlVJTEQnICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gJywgdGhpcy50ZXh0Lmxlbmd0aCwgJ0NIQVJTJywgdGhpcy50ZXh0ICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gJywgdGhpcy50b2tlbnMubGVuZ3RoLCAnVE9LRU5TJywgdGhpcy50b2tlbnMgKTtcbiAgICB0aGlzLmNvbHVtbiA9IHRoaXMudGV4dC5sZW5ndGg7XG4gICAgdGhpcy5saW5lID0gMTtcblxuICAgIHZhciBwcm9ncmFtID0gdGhpcy5wcm9ncmFtKCk7XG5cbiAgICBpZiggdGhpcy50b2tlbnMubGVuZ3RoICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ1VuZXhwZWN0ZWQgdG9rZW4gJyArIHRoaXMudG9rZW5zWyAwIF0gKyAnIHJlbWFpbmluZycgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvZ3JhbTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7Q2FsbEV4cHJlc3Npb259IFRoZSBjYWxsIGV4cHJlc3Npb24gbm9kZVxuICovXG5idWlsZGVyUHJvdG90eXBlLmNhbGxFeHByZXNzaW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgYXJncyA9IHRoaXMubGlzdCggJygnICksXG4gICAgICAgIGNhbGxlZTtcblxuICAgIHRoaXMuY29uc3VtZSggJygnICk7XG5cbiAgICBjYWxsZWUgPSB0aGlzLmV4cHJlc3Npb24oKTtcblxuICAgIC8vY29uc29sZS5sb2coICdDQUxMIEVYUFJFU1NJT04nICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gQ0FMTEVFJywgY2FsbGVlICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gQVJHVU1FTlRTJywgYXJncywgYXJncy5sZW5ndGggKTtcbiAgICByZXR1cm4gbmV3IE5vZGUuQ2FsbEV4cHJlc3Npb24oIGNhbGxlZSwgYXJncyApO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBuZXh0IHRva2VuIGluIHRoZSB0b2tlbiBsaXN0LiBJZiBhIGNvbXBhcmlzb24gaXMgcHJvdmlkZWQsIHRoZSB0b2tlbiB3aWxsIG9ubHkgYmUgcmV0dXJuZWQgaWYgdGhlIHZhbHVlIG1hdGNoZXMuIE90aGVyd2lzZSBhbiBlcnJvciBpcyB0aHJvd24uXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZXhwZWN0ZWRdIEFuIGV4cGVjdGVkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtUb2tlbn0gVGhlIG5leHQgdG9rZW4gaW4gdGhlIGxpc3RcbiAqIEB0aHJvd3Mge1N5bnRheEVycm9yfSBJZiB0b2tlbiBkaWQgbm90IGV4aXN0XG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUuY29uc3VtZSA9IGZ1bmN0aW9uKCBleHBlY3RlZCApe1xuICAgIGlmKCAhdGhpcy50b2tlbnMubGVuZ3RoICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ1VuZXhwZWN0ZWQgZW5kIG9mIGV4cHJlc3Npb24nICk7XG4gICAgfVxuXG4gICAgdmFyIHRva2VuID0gdGhpcy5leHBlY3QoIGV4cGVjdGVkICk7XG5cbiAgICBpZiggIXRva2VuICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ1VuZXhwZWN0ZWQgdG9rZW4gJyArIHRva2VuLnZhbHVlICsgJyBjb25zdW1lZCcgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdG9rZW47XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLmV4aXN0ZW50aWFsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb24oKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBFWElTVCBFWFBSRVNTSU9OJywgZXhwcmVzc2lvbiApO1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuRXhpc3RlbnRpYWxFeHByZXNzaW9uKCBleHByZXNzaW9uICk7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgdGhlIG5leHQgdG9rZW4gaW4gdGhlIHRva2VuIGxpc3QuIElmIGNvbXBhcmlzb25zIGFyZSBwcm92aWRlZCwgdGhlIHRva2VuIHdpbGwgb25seSBiZSByZXR1cm5lZCBpZiB0aGUgdmFsdWUgbWF0Y2hlcyBvbmUgb2YgdGhlIGNvbXBhcmlzb25zLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW2ZpcnN0XSBUaGUgZmlyc3QgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtzZWNvbmRdIFRoZSBzZWNvbmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFt0aGlyZF0gVGhlIHRoaXJkIGNvbXBhcmlzb24gdmFsdWVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZm91cnRoXSBUaGUgZm91cnRoIGNvbXBhcmlzb24gdmFsdWVcbiAqIEByZXR1cm5zIHtUb2tlbn0gVGhlIG5leHQgdG9rZW4gaW4gdGhlIGxpc3Qgb3IgYHVuZGVmaW5lZGAgaWYgaXQgZGlkIG5vdCBleGlzdFxuICovXG5idWlsZGVyUHJvdG90eXBlLmV4cGVjdCA9IGZ1bmN0aW9uKCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICl7XG4gICAgdmFyIHRva2VuID0gdGhpcy5wZWVrKCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICk7XG5cbiAgICBpZiggdG9rZW4gKXtcbiAgICAgICAgdGhpcy50b2tlbnMucG9wKCk7XG4gICAgICAgIHRoaXMuY29sdW1uIC09IHRva2VuLnZhbHVlLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH1cblxuICAgIHJldHVybiB2b2lkIDA7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge0V4cHJlc3Npb259IEFuIGV4cHJlc3Npb24gbm9kZVxuICovXG5idWlsZGVyUHJvdG90eXBlLmV4cHJlc3Npb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBleHByZXNzaW9uID0gbnVsbCxcbiAgICAgICAgbGlzdCwgbmV4dCwgdG9rZW47XG5cbiAgICBpZiggdGhpcy5leHBlY3QoICc7JyApICl7XG4gICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICB9XG5cbiAgICBpZiggbmV4dCA9IHRoaXMucGVlaygpICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFWFBSRVNTSU9OJywgbmV4dCApO1xuICAgICAgICBzd2l0Y2goIG5leHQudHlwZSApe1xuICAgICAgICAgICAgY2FzZSBHcmFtbWFyLlB1bmN0dWF0b3I6XG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuZXhwZWN0KCAnXScgKSApe1xuICAgICAgICAgICAgICAgICAgICBsaXN0ID0gdGhpcy5saXN0KCAnWycgKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMudG9rZW5zLmxlbmd0aCA9PT0gMSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuYXJyYXlFeHByZXNzaW9uKCBsaXN0ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggbGlzdC5sZW5ndGggPiAxICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5zZXF1ZW5jZUV4cHJlc3Npb24oIGxpc3QgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSBBcnJheS5pc0FycmF5KCBsaXN0ICkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RbIDAgXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIG5leHQudmFsdWUgPT09ICd9JyApe1xuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXAoIG5leHQgKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggdGhpcy5leHBlY3QoICc/JyApICl7XG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmV4aXN0ZW50aWFsRXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBHcmFtbWFyLk51bGxMaXRlcmFsOlxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmxpdGVyYWwoKTtcbiAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyBHcmFtbWFyLklkZW50aWZpZXJcbiAgICAgICAgICAgIC8vIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWxcbiAgICAgICAgICAgIC8vIEdyYW1tYXIuU3RyaW5nTGl0ZXJhbFxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gdGhpcy5sb29rdXAoIG5leHQgKTtcbiAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICAgICAgLy8gSW1wbGllZCBtZW1iZXIgZXhwcmVzc2lvbi4gU2hvdWxkIG9ubHkgaGFwcGVuIGFmdGVyIGFuIElkZW50aWZpZXIuXG4gICAgICAgICAgICAgICAgaWYoIG5leHQgJiYgbmV4dC50eXBlID09PSBHcmFtbWFyLlB1bmN0dWF0b3IgJiYgKCBuZXh0LnZhbHVlID09PSAnKScgfHwgbmV4dC52YWx1ZSA9PT0gJ10nIHx8IG5leHQudmFsdWUgPT09ICc/JyApICl7XG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLm1lbWJlckV4cHJlc3Npb24oIGV4cHJlc3Npb24sIGZhbHNlICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUoICggdG9rZW4gPSB0aGlzLmV4cGVjdCggJyknLCAnWycsICcuJyApICkgKXtcbiAgICAgICAgICAgIGlmKCB0b2tlbi52YWx1ZSA9PT0gJyknICl7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuY2FsbEV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdG9rZW4udmFsdWUgPT09ICdbJyApe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLm1lbWJlckV4cHJlc3Npb24oIGV4cHJlc3Npb24sIHRydWUgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdG9rZW4udmFsdWUgPT09ICcuJyApe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLm1lbWJlckV4cHJlc3Npb24oIGV4cHJlc3Npb24sIGZhbHNlICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvciggJ1VuZXhwZWN0ZWQgdG9rZW4gJyArIHRva2VuICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7RXhwcmVzc2lvblN0YXRlbWVudH0gQW4gZXhwcmVzc2lvbiBzdGF0ZW1lbnRcbiAqL1xuYnVpbGRlclByb3RvdHlwZS5leHByZXNzaW9uU3RhdGVtZW50ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvbigpLFxuICAgICAgICBleHByZXNzaW9uU3RhdGVtZW50O1xuICAgIC8vY29uc29sZS5sb2coICdFWFBSRVNTSU9OIFNUQVRFTUVOVCBXSVRIJywgZXhwcmVzc2lvbiApO1xuICAgIGV4cHJlc3Npb25TdGF0ZW1lbnQgPSBuZXcgTm9kZS5FeHByZXNzaW9uU3RhdGVtZW50KCBleHByZXNzaW9uICk7XG5cbiAgICByZXR1cm4gZXhwcmVzc2lvblN0YXRlbWVudDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7SWRlbnRpZmllcn0gQW4gaWRlbnRpZmllclxuICogQHRocm93cyB7U3ludGF4RXJyb3J9IElmIHRoZSB0b2tlbiBpcyBub3QgYW4gaWRlbnRpZmllclxuICovXG5idWlsZGVyUHJvdG90eXBlLmlkZW50aWZpZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciB0b2tlbiA9IHRoaXMuY29uc3VtZSgpO1xuXG4gICAgaWYoICEoIHRva2VuLnR5cGUgPT09IEdyYW1tYXIuSWRlbnRpZmllciApICl7XG4gICAgICAgIHRoaXMudGhyb3dFcnJvciggJ0lkZW50aWZpZXIgZXhwZWN0ZWQnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBOb2RlLklkZW50aWZpZXIoIHRva2VuLnZhbHVlICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHRlcm1pbmF0b3JcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpBcnJheTxFeHByZXNzaW9uPnxSYW5nZUV4cHJlc3Npb259IFRoZSBsaXN0IG9mIGV4cHJlc3Npb25zIG9yIHJhbmdlIGV4cHJlc3Npb25cbiAqL1xuYnVpbGRlclByb3RvdHlwZS5saXN0ID0gZnVuY3Rpb24oIHRlcm1pbmF0b3IgKXtcbiAgICB2YXIgbGlzdCA9IFtdLFxuICAgICAgICBpc051bWVyaWMgPSBmYWxzZSxcbiAgICAgICAgZXhwcmVzc2lvbiwgbmV4dDtcbiAgICAvL2NvbnNvbGUubG9nKCAnTElTVCcsIHRlcm1pbmF0b3IgKTtcbiAgICBpZiggIXRoaXMucGVlayggdGVybWluYXRvciApICl7XG4gICAgICAgIG5leHQgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgaXNOdW1lcmljID0gbmV4dC50eXBlID09PSBHcmFtbWFyLk51bWVyaWNMaXRlcmFsO1xuXG4gICAgICAgIC8vIEV4YW1wbGVzOiBbMS4uM10sIFs1Li5dLCBbLi43XVxuICAgICAgICBpZiggKCBpc051bWVyaWMgfHwgbmV4dC52YWx1ZSA9PT0gJy4nICkgJiYgdGhpcy5wZWVrQXQoIDEsICcuJyApICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnLSBSQU5HRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGlzTnVtZXJpYyA/XG4gICAgICAgICAgICAgICAgdGhpcy5sb29rdXAoIG5leHQgKSA6XG4gICAgICAgICAgICAgICAgbnVsbDtcbiAgICAgICAgICAgIGxpc3QgPSB0aGlzLnJhbmdlRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApO1xuXG4gICAgICAgIC8vIEV4YW1wbGVzOiBbMSwyLDNdLCBbXCJhYmNcIixcImRlZlwiXSwgW2ZvbyxiYXJdLCBbe2Zvby5iYXJ9XVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJy0gQVJSQVkgT0YgRVhQUkVTU0lPTlMnICk7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwKCBuZXh0ICk7XG4gICAgICAgICAgICAgICAgbGlzdC51bnNoaWZ0KCBleHByZXNzaW9uICk7XG4gICAgICAgICAgICB9IHdoaWxlKCB0aGlzLmV4cGVjdCggJywnICkgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCAnLSBMSVNUIFJFU1VMVCcsIGxpc3QgKTtcbiAgICByZXR1cm4gbGlzdDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7TGl0ZXJhbH0gVGhlIGxpdGVyYWwgbm9kZVxuICovXG5idWlsZGVyUHJvdG90eXBlLmxpdGVyYWwgPSBmdW5jdGlvbigpe1xuICAgIHZhciB0b2tlbiA9IHRoaXMuY29uc3VtZSgpLFxuICAgICAgICByYXcgPSB0b2tlbi52YWx1ZSxcbiAgICAgICAgZXhwcmVzc2lvbjtcblxuICAgIHN3aXRjaCggdG9rZW4udHlwZSApe1xuICAgICAgICBjYXNlIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWw6XG4gICAgICAgICAgICBleHByZXNzaW9uID0gbmV3IE5vZGUuTnVtZXJpY0xpdGVyYWwoIHJhdyApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR3JhbW1hci5TdHJpbmdMaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IG5ldyBOb2RlLlN0cmluZ0xpdGVyYWwoIHJhdyApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR3JhbW1hci5OdWxsTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBuZXcgTm9kZS5OdWxsTGl0ZXJhbCggcmF3ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvciggJ0xpdGVyYWwgZXhwZWN0ZWQnICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG5idWlsZGVyUHJvdG90eXBlLmxvb2t1cCA9IGZ1bmN0aW9uKCBuZXh0ICl7XG4gICAgdmFyIGV4cHJlc3Npb247XG4gICAgLy9jb25zb2xlLmxvZyggJ0xPT0tVUCcsIG5leHQgKTtcbiAgICBzd2l0Y2goIG5leHQudHlwZSApe1xuICAgICAgICBjYXNlIEdyYW1tYXIuSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSB0aGlzLmlkZW50aWZpZXIoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEdyYW1tYXIuTnVtZXJpY0xpdGVyYWw6XG4gICAgICAgIGNhc2UgR3JhbW1hci5TdHJpbmdMaXRlcmFsOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubGl0ZXJhbCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR3JhbW1hci5QdW5jdHVhdG9yOlxuICAgICAgICAgICAgaWYoIG5leHQudmFsdWUgPT09ICd9JyApe1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZSggJ30nICk7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMuYmxvY2tFeHByZXNzaW9uKCAneycgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvciggJ3Rva2VuIGNhbm5vdCBiZSBhIGxvb2t1cCcgKTtcbiAgICB9XG5cbiAgICBuZXh0ID0gdGhpcy5wZWVrKCk7XG5cbiAgICBpZiggbmV4dCAmJiBuZXh0LnZhbHVlID09PSAnJScgKXtcbiAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMubG9va3VwRXhwcmVzc2lvbiggZXhwcmVzc2lvbiApO1xuICAgIH1cbiAgICBpZiggbmV4dCAmJiBuZXh0LnZhbHVlID09PSAnficgKXtcbiAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMucm9vdEV4cHJlc3Npb24oIGV4cHJlc3Npb24gKTtcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJy0gTE9PS1VQIFJFU1VMVCcsIGV4cHJlc3Npb24gKTtcbiAgICByZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUubG9va3VwRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXkgKXtcbiAgICB0aGlzLmNvbnN1bWUoICclJyApO1xuICAgIHJldHVybiBuZXcgS2V5cGF0aE5vZGUuTG9va3VwRXhwcmVzc2lvbigga2V5ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtFeHByZXNzaW9ufSBwcm9wZXJ0eSBUaGUgZXhwcmVzc2lvbiBhc3NpZ25lZCB0byB0aGUgcHJvcGVydHkgb2YgdGhlIG1lbWJlciBleHByZXNzaW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGNvbXB1dGVkIFdoZXRoZXIgb3Igbm90IHRoZSBtZW1iZXIgZXhwcmVzc2lvbiBpcyBjb21wdXRlZFxuICogQHJldHVybnMge01lbWJlckV4cHJlc3Npb259IFRoZSBtZW1iZXIgZXhwcmVzc2lvblxuICovXG5idWlsZGVyUHJvdG90eXBlLm1lbWJlckV4cHJlc3Npb24gPSBmdW5jdGlvbiggcHJvcGVydHksIGNvbXB1dGVkICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ01FTUJFUicsIHByb3BlcnR5ICk7XG4gICAgdmFyIG9iamVjdCA9IHRoaXMuZXhwcmVzc2lvbigpO1xuICAgIC8vY29uc29sZS5sb2coICdNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBPQkpFQ1QnLCBvYmplY3QgKTtcbiAgICAvL2NvbnNvbGUubG9nKCAnLSBQUk9QRVJUWScsIHByb3BlcnR5ICk7XG4gICAgLy9jb25zb2xlLmxvZyggJy0gQ09NUFVURUQnLCBjb21wdXRlZCApO1xuICAgIHJldHVybiBjb21wdXRlZCA/XG4gICAgICAgIG5ldyBOb2RlLkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApIDpcbiAgICAgICAgbmV3IE5vZGUuU3RhdGljTWVtYmVyRXhwcmVzc2lvbiggb2JqZWN0LCBwcm9wZXJ0eSApO1xufTtcblxuYnVpbGRlclByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKCBpbnB1dCApe1xuICAgIHRoaXMudG9rZW5zID0gdGhpcy5sZXhlci5sZXgoIGlucHV0ICk7XG4gICAgcmV0dXJuIHRoaXMuYnVpbGQoIHRoaXMudG9rZW5zICk7XG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIHRoZSBuZXh0IHRva2VuIGluIHRoZSB0b2tlbiBsaXN0IF93aXRob3V0IHJlbW92aW5nIGl0Xy4gSWYgY29tcGFyaXNvbnMgYXJlIHByb3ZpZGVkLCB0aGUgdG9rZW4gd2lsbCBvbmx5IGJlIHJldHVybmVkIGlmIHRoZSB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgY29tcGFyaXNvbnMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZmlyc3RdIFRoZSBmaXJzdCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3NlY29uZF0gVGhlIHNlY29uZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3RoaXJkXSBUaGUgdGhpcmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmb3VydGhdIFRoZSBmb3VydGggY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge0xleGVyflRva2VufSBUaGUgbmV4dCB0b2tlbiBpbiB0aGUgbGlzdCBvciBgdW5kZWZpbmVkYCBpZiBpdCBkaWQgbm90IGV4aXN0XG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICl7XG4gICAgcmV0dXJuIHRoaXMucGVla0F0KCAwLCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICk7XG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIHRoZSB0b2tlbiBhdCB0aGUgcmVxdWVzdGVkIHBvc2l0aW9uIF93aXRob3V0IHJlbW92aW5nIGl0XyBmcm9tIHRoZSB0b2tlbiBsaXN0LiBJZiBjb21wYXJpc29ucyBhcmUgcHJvdmlkZWQsIHRoZSB0b2tlbiB3aWxsIG9ubHkgYmUgcmV0dXJuZWQgaWYgdGhlIHZhbHVlIG1hdGNoZXMgb25lIG9mIHRoZSBjb21wYXJpc29ucy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IHBvc2l0aW9uIFRoZSBwb3NpdGlvbiB3aGVyZSB0aGUgdG9rZW4gd2lsbCBiZSBwZWVrZWRcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBbZmlyc3RdIFRoZSBmaXJzdCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3NlY29uZF0gVGhlIHNlY29uZCBjb21wYXJpc29uIHZhbHVlXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gW3RoaXJkXSBUaGUgdGhpcmQgY29tcGFyaXNvbiB2YWx1ZVxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IFtmb3VydGhdIFRoZSBmb3VydGggY29tcGFyaXNvbiB2YWx1ZVxuICogQHJldHVybnMge0xleGVyflRva2VufSBUaGUgdG9rZW4gYXQgdGhlIHJlcXVlc3RlZCBwb3NpdGlvbiBvciBgdW5kZWZpbmVkYCBpZiBpdCBkaWQgbm90IGV4aXN0XG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUucGVla0F0ID0gZnVuY3Rpb24oIHBvc2l0aW9uLCBmaXJzdCwgc2Vjb25kLCB0aGlyZCwgZm91cnRoICl7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMudG9rZW5zLmxlbmd0aCxcbiAgICAgICAgaW5kZXgsIHRva2VuLCB2YWx1ZTtcblxuICAgIGlmKCBsZW5ndGggJiYgdHlwZW9mIHBvc2l0aW9uID09PSAnbnVtYmVyJyAmJiBwb3NpdGlvbiA+IC0xICl7XG4gICAgICAgIC8vIENhbGN1bGF0ZSBhIHplcm8tYmFzZWQgaW5kZXggc3RhcnRpbmcgZnJvbSB0aGUgZW5kIG9mIHRoZSBsaXN0XG4gICAgICAgIGluZGV4ID0gbGVuZ3RoIC0gcG9zaXRpb24gLSAxO1xuXG4gICAgICAgIGlmKCBpbmRleCA+IC0xICYmIGluZGV4IDwgbGVuZ3RoICl7XG4gICAgICAgICAgICB0b2tlbiA9IHRoaXMudG9rZW5zWyBpbmRleCBdO1xuICAgICAgICAgICAgdmFsdWUgPSB0b2tlbi52YWx1ZTtcblxuICAgICAgICAgICAgaWYoIHZhbHVlID09PSBmaXJzdCB8fCB2YWx1ZSA9PT0gc2Vjb25kIHx8IHZhbHVlID09PSB0aGlyZCB8fCB2YWx1ZSA9PT0gZm91cnRoIHx8ICggIWZpcnN0ICYmICFzZWNvbmQgJiYgIXRoaXJkICYmICFmb3VydGggKSApe1xuICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2b2lkIDA7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge1Byb2dyYW19IEEgcHJvZ3JhbSBub2RlXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUucHJvZ3JhbSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGJvZHkgPSBbXTtcbiAgICAvL2NvbnNvbGUubG9nKCAnUFJPR1JBTScgKTtcbiAgICB3aGlsZSggdHJ1ZSApe1xuICAgICAgICBpZiggdGhpcy50b2tlbnMubGVuZ3RoICl7XG4gICAgICAgICAgICBib2R5LnVuc2hpZnQoIHRoaXMuZXhwcmVzc2lvblN0YXRlbWVudCgpICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE5vZGUuUHJvZ3JhbSggYm9keSApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuYnVpbGRlclByb3RvdHlwZS5yYW5nZUV4cHJlc3Npb24gPSBmdW5jdGlvbiggcmlnaHQgKXtcbiAgICB2YXIgbGVmdDtcblxuICAgIHRoaXMuZXhwZWN0KCAnLicgKTtcbiAgICB0aGlzLmV4cGVjdCggJy4nICk7XG5cbiAgICBsZWZ0ID0gdGhpcy5wZWVrKCkudHlwZSA9PT0gR3JhbW1hci5OdW1lcmljTGl0ZXJhbCA/XG4gICAgICAgIGxlZnQgPSB0aGlzLmxpdGVyYWwoKSA6XG4gICAgICAgIG51bGw7XG5cbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLlJhbmdlRXhwcmVzc2lvbiggbGVmdCwgcmlnaHQgKTtcbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUucm9vdEV4cHJlc3Npb24gPSBmdW5jdGlvbigga2V5ICl7XG4gICAgdGhpcy5jb25zdW1lKCAnficgKTtcbiAgICByZXR1cm4gbmV3IEtleXBhdGhOb2RlLlJvb3RFeHByZXNzaW9uKCBrZXkgKTtcbn07XG5cbmJ1aWxkZXJQcm90b3R5cGUuc2VxdWVuY2VFeHByZXNzaW9uID0gZnVuY3Rpb24oIGxpc3QgKXtcbiAgICByZXR1cm4gbmV3IE5vZGUuU2VxdWVuY2VFeHByZXNzaW9uKCBsaXN0ICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2VcbiAqIEB0aHJvd3Mge2V4dGVybmFsOlN5bnRheEVycm9yfSBXaGVuIGl0IGV4ZWN1dGVzXG4gKi9cbmJ1aWxkZXJQcm90b3R5cGUudGhyb3dFcnJvciA9IGZ1bmN0aW9uKCBtZXNzYWdlICl7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCBtZXNzYWdlICk7XG59OyIsIi8qKlxuICogQHR5cGVkZWYge2V4dGVybmFsOkZ1bmN0aW9ufSBNYXBDYWxsYmFja1xuICogQHBhcmFtIHsqfSBpdGVtXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXhcbiAqL1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtBcnJheS1MaWtlfSBsaXN0XG4gKiBAcGFyYW0ge01hcENhbGxiYWNrfSBjYWxsYmFja1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYXAoIGxpc3QsIGNhbGxiYWNrICl7XG4gICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgbGVuZ3RoID0gbGlzdC5sZW5ndGgsXG4gICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheSggbGVuZ3RoICk7XG5cbiAgICBzd2l0Y2goIGxlbmd0aCApe1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmVzdWx0WyAwIF0gPSBjYWxsYmFjayggbGlzdFsgMCBdLCAwLCBsaXN0ICk7XG4gICAgICAgICAgICByZXN1bHRbIDEgXSA9IGNhbGxiYWNrKCBsaXN0WyAxIF0sIDEsIGxpc3QgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXN1bHRbIDAgXSA9IGNhbGxiYWNrKCBsaXN0WyAwIF0sIDAsIGxpc3QgKTtcbiAgICAgICAgICAgIHJlc3VsdFsgMSBdID0gY2FsbGJhY2soIGxpc3RbIDEgXSwgMSwgbGlzdCApO1xuICAgICAgICAgICAgcmVzdWx0WyAyIF0gPSBjYWxsYmFjayggbGlzdFsgMiBdLCAyLCBsaXN0ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xuICAgICAgICAgICAgICAgIHJlc3VsdFsgaW5kZXggXSA9IGNhbGxiYWNrKCBsaXN0WyBpbmRleCBdLCBpbmRleCwgbGlzdCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn0iLCJpbXBvcnQgaGFzT3duUHJvcGVydHkgZnJvbSAnLi9oYXMtb3duLXByb3BlcnR5JztcbmltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgbWFwIGZyb20gJy4vbWFwJztcbmltcG9ydCAqIGFzIFN5bnRheCBmcm9tICcuL3N5bnRheCc7XG5pbXBvcnQgKiBhcyBLZXlwYXRoU3ludGF4IGZyb20gJy4va2V5cGF0aC1zeW50YXgnO1xuXG52YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fSxcblxuICAgIGludGVycHJldGVyUHJvdG90eXBlO1xuXG4vKipcbiAqIEBmdW5jdGlvbiBJbnRlcnByZXRlcn5nZXR0ZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6T2JqZWN0fSBvYmplY3RcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBrZXlcbiAqIEByZXR1cm5zIHsqfSBUaGUgdmFsdWUgb2YgdGhlIGBrZXlgIHByb3BlcnR5IG9uIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBnZXR0ZXIoIG9iamVjdCwga2V5ICl7XG4gICAgcmV0dXJuIG9iamVjdFsga2V5IF07XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEludGVycHJldGVyfnJldHVyblplcm9cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IHplcm9cbiAqL1xuZnVuY3Rpb24gcmV0dXJuWmVybygpe1xuICAgIHJldHVybiAwO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBJbnRlcnByZXRlcn5zZXR0ZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6T2JqZWN0fSBvYmplY3RcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm5zIHsqfSBUaGUgdmFsdWUgb2YgdGhlIGBrZXlgIHByb3BlcnR5IG9uIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBzZXR0ZXIoIG9iamVjdCwga2V5LCB2YWx1ZSApe1xuICAgIGlmKCAhaGFzT3duUHJvcGVydHkoIG9iamVjdCwga2V5ICkgKXtcbiAgICAgICAgb2JqZWN0WyBrZXkgXSA9IHZhbHVlIHx8IHt9O1xuICAgIH1cbiAgICByZXR1cm4gZ2V0dGVyKCBvYmplY3QsIGtleSApO1xufVxuXG4vKipcbiAqIEBjbGFzcyBJbnRlcnByZXRlclxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtCdWlsZGVyfSBidWlsZGVyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEludGVycHJldGVyKCBidWlsZGVyICl7XG4gICAgaWYoICFhcmd1bWVudHMubGVuZ3RoICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdidWlsZGVyIGNhbm5vdCBiZSB1bmRlZmluZWQnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7QnVpbGRlcn0gSW50ZXJwcmV0ZXIjYnVpbGRlclxuICAgICAqL1xuICAgIHRoaXMuYnVpbGRlciA9IGJ1aWxkZXI7XG59XG5cbmludGVycHJldGVyUHJvdG90eXBlID0gSW50ZXJwcmV0ZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuY29uc3RydWN0b3IgPSBJbnRlcnByZXRlcjtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuYXJyYXlFeHByZXNzaW9uID0gZnVuY3Rpb24oIGVsZW1lbnRzLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIEFSUkFZIEVYUFJFU1NJT04nLCBlbGVtZW50cy5sZW5ndGggKTtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBmbiwgbGlzdDtcblxuICAgIGlmKCBBcnJheS5pc0FycmF5KCBlbGVtZW50cyApICl7XG4gICAgICAgIGxpc3QgPSB0aGlzLmxpc3RFeHByZXNzaW9uKCBlbGVtZW50cywgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgICAgIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQVJSQVkgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24gTElTVGAsIGxpc3QgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgdmFyIGtleSxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIGxpc3QsIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IGV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIHNjb3BlLCBrZXksICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICByZXN1bHQubGVuZ3RoID09PSAxICYmICggcmVzdWx0ID0gcmVzdWx0WyAwIF0gKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVBcnJheUV4cHJlc3Npb24gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0ID0gdGhpcy5yZWN1cnNlKCBlbGVtZW50cywgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgICAgIGZuID0gZnVuY3Rpb24gZXhlY3V0ZUFycmF5RXhwcmVzc2lvbldpdGhFbGVtZW50UmFuZ2UoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIEFSUkFZIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQXJyYXlFeHByZXNzaW9uV2l0aEVsZW1lbnRSYW5nZSBMSVNUYCwgbGlzdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQXJyYXlFeHByZXNzaW9uV2l0aEVsZW1lbnRSYW5nZSBERVBUSGAsIGRlcHRoICk7XG4gICAgICAgICAgICB2YXIga2V5cyA9IGxpc3QoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICksXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbWFwKCBrZXlzLCBmdW5jdGlvbigga2V5ICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIHNjb3BlLCBrZXksICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQXJyYXlFeHByZXNzaW9uV2l0aEVsZW1lbnRSYW5nZSBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmbjtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmJsb2NrRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCB0b2tlbnMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgQkxPQ0snLCB0b2tlbnMuam9pbiggJycgKSApO1xuICAgIHZhciBwcm9ncmFtID0gdGhpcy5idWlsZGVyLmJ1aWxkKCB0b2tlbnMgKSxcbiAgICAgICAgZXhwcmVzc2lvbiA9IHRoaXMucmVjdXJzZSggcHJvZ3JhbS5ib2R5WyAwIF0uZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVCbG9ja0V4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQkxPQ0snICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVCbG9ja0V4cHJlc3Npb24gU0NPUEVgLCBzY29wZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQmxvY2tFeHByZXNzaW9uIEVYUFJFU1NJT05gLCBleHByZXNzaW9uLm5hbWUgKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVCbG9ja0V4cHJlc3Npb24gUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogc2NvcGUsIG5hbWU6IHZvaWQgMCwgdmFsdWU6IHJlc3VsdCB9IDpcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICB9O1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUuY2FsbEV4cHJlc3Npb24gPSBmdW5jdGlvbiggY2FsbGVlLCBhcmdzLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIENBTEwgRVhQUkVTU0lPTicgKTtcbiAgICB2YXIgaXNTZXR0aW5nID0gYXNzaWduID09PSBzZXR0ZXIsXG4gICAgICAgIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIGNhbGxlZSwgdHJ1ZSwgYXNzaWduICksXG4gICAgICAgIGxpc3QgPSB0aGlzLmxpc3RFeHByZXNzaW9uKCBhcmdzLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUNhbGxFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIENBTEwgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNhbGxFeHByZXNzaW9uIGFyZ3NgLCBhcmdzLmxlbmd0aCApO1xuICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgIGFyZ3MgPSBtYXAoIGxpc3QsIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICB9ICksXG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDYWxsRXhwcmVzc2lvbiBMSFNgLCBsaHMgKTtcbiAgICAgICAgcmVzdWx0ID0gbGhzLnZhbHVlLmFwcGx5KCBsaHMuY29udGV4dCwgYXJncyApO1xuICAgICAgICBpZiggaXNTZXR0aW5nICYmIHR5cGVvZiBsaHMudmFsdWUgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnY2Fubm90IGNyZWF0ZSBjYWxsIGV4cHJlc3Npb25zJyApO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDYWxsRXhwcmVzc2lvbiBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH06XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZXhwcmVzc2lvblxuICovXG5pbnRlcnByZXRlclByb3RvdHlwZS5jb21waWxlID0gZnVuY3Rpb24oIGV4cHJlc3Npb24sIGNyZWF0ZSApe1xuICAgIHZhciBwcm9ncmFtID0gdGhpcy5idWlsZGVyLmJ1aWxkKCBleHByZXNzaW9uICksXG4gICAgICAgIGJvZHkgPSBwcm9ncmFtLmJvZHksXG4gICAgICAgIGludGVycHJldGVyID0gdGhpcyxcbiAgICAgICAgYXNzaWduLCBleHByZXNzaW9ucywgZm47XG5cbiAgICBpZiggdHlwZW9mIGNyZWF0ZSAhPT0gJ2Jvb2xlYW4nICl7XG4gICAgICAgIGNyZWF0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGludGVycHJldGVyLmRlcHRoID0gLTE7XG4gICAgaW50ZXJwcmV0ZXIuaXNMZWZ0U3BsaXQgPSBmYWxzZTtcbiAgICBpbnRlcnByZXRlci5pc1JpZ2h0U3BsaXQgPSBmYWxzZTtcbiAgICBpbnRlcnByZXRlci5pc1NwbGl0ID0gZmFsc2U7XG5cbiAgICBhc3NpZ24gPSBjcmVhdGUgP1xuICAgICAgICBzZXR0ZXIgOlxuICAgICAgICBnZXR0ZXI7XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9XG4gICAgICovXG4gICAgaW50ZXJwcmV0ZXIuZXhwcmVzc2lvbiA9IHRoaXMuYnVpbGRlci50ZXh0O1xuICAgIC8vY29uc29sZS5sb2coICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyApO1xuICAgIC8vY29uc29sZS5sb2coICdJbnRlcnByZXRpbmcgJywgZXhwcmVzc2lvbiApO1xuICAgIC8vY29uc29sZS5sb2coICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyApO1xuICAgIC8vY29uc29sZS5sb2coICdQcm9ncmFtJywgcHJvZ3JhbS5yYW5nZSApO1xuICAgIHN3aXRjaCggYm9keS5sZW5ndGggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgZm4gPSBub29wO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGZuID0gaW50ZXJwcmV0ZXIucmVjdXJzZSggYm9keVsgMCBdLmV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgZXhwcmVzc2lvbnMgPSBtYXAoIGJvZHksIGZ1bmN0aW9uKCBzdGF0ZW1lbnQgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW50ZXJwcmV0ZXIucmVjdXJzZSggc3RhdGVtZW50LmV4cHJlc3Npb24sIGZhbHNlLCBhc3NpZ24gKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIGZuID0gZnVuY3Rpb24gZXhlY3V0ZVByb2dyYW0oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlcyA9IG1hcCggZXhwcmVzc2lvbnMsIGZ1bmN0aW9uKCBleHByZXNzaW9uICl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlc1sgdmFsdWVzLmxlbmd0aCAtIDEgXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyggJ0ZOJywgZm4ubmFtZSApO1xuICAgIHJldHVybiBmbjtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBvYmplY3QsIHByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIENPTVBVVEVEIE1FTUJFUiBFWFBSRVNTSU9OJywgb2JqZWN0LnR5cGUsIHByb3BlcnR5LnR5cGUgKTtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmRlcHRoLFxuICAgICAgICBpbnRlcnByZXRlciA9IHRoaXMsXG4gICAgICAgIGlzU2FmZSA9IG9iamVjdC50eXBlID09PSBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbixcbiAgICAgICAgbGVmdCA9IHRoaXMucmVjdXJzZSggb2JqZWN0LCBmYWxzZSwgYXNzaWduICksXG4gICAgICAgIHJpZ2h0ID0gdGhpcy5yZWN1cnNlKCBwcm9wZXJ0eSwgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgaWYoICFpbnRlcnByZXRlci5pc1NwbGl0ICl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBDT01QVVRFRCBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gTEVGVCBgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUklHSFRgLCByaWdodC5uYW1lICk7XG4gICAgICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICByZXN1bHQsIHJocztcbiAgICAgICAgICAgIGlmKCAhaXNTYWZlIHx8IGxocyApe1xuICAgICAgICAgICAgICAgIHJocyA9IHJpZ2h0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gTEhTYCwgbGhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSSFNgLCByaHMgKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIGxocywgcmhzLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgY29udGV4dDogbGhzLCBuYW1lOiByaHMsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiggaW50ZXJwcmV0ZXIuaXNMZWZ0U3BsaXQgJiYgIWludGVycHJldGVyLmlzUmlnaHRTcGxpdCApe1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQ09NUFVURUQgTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIExFRlQgYCwgbGVmdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJJR0hUYCwgcmlnaHQubmFtZSApO1xuICAgICAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICksXG4gICAgICAgICAgICAgICAgcmVzdWx0LCByaHM7XG4gICAgICAgICAgICBpZiggIWlzU2FmZSB8fCBsaHMgKXtcbiAgICAgICAgICAgICAgICByaHMgPSByaWdodCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIExIU2AsIGxocyApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkhTYCwgcmhzICk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbWFwKCBsaHMsIGZ1bmN0aW9uKCBvYmplY3QgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbiggb2JqZWN0LCByaHMsICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgY29udGV4dDogbGhzLCBuYW1lOiByaHMsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiggIWludGVycHJldGVyLmlzTGVmdFNwbGl0ICYmIGludGVycHJldGVyLmlzUmlnaHRTcGxpdCApe1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgQ09NUFVURUQgTUVNQkVSIEVYUFJFU1NJT04nICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIExFRlQgYCwgbGVmdC5uYW1lICk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJJR0hUYCwgcmlnaHQubmFtZSApO1xuICAgICAgICAgICAgdmFyIGxocyA9IGxlZnQoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICksXG4gICAgICAgICAgICAgICAgcmVzdWx0LCByaHM7XG4gICAgICAgICAgICBpZiggIWlzU2FmZSB8fCBsaHMgKXtcbiAgICAgICAgICAgICAgICByaHMgPSByaWdodCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIExIU2AsIGxocyApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUkhTYCwgcmhzICk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbWFwKCByaHMsIGZ1bmN0aW9uKCBrZXkgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbiggbGhzLCBrZXksICFkZXB0aCA/IHZhbHVlIDoge30gKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgY29udGV4dDogbGhzLCBuYW1lOiByaHMsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBDT01QVVRFRCBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gTEVGVCBgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gUklHSFRgLCByaWdodC5uYW1lICk7XG4gICAgICAgICAgICB2YXIgbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKSxcbiAgICAgICAgICAgICAgICByZXN1bHQsIHJocztcbiAgICAgICAgICAgIGlmKCAhaXNTYWZlIHx8IGxocyApe1xuICAgICAgICAgICAgICAgIHJocyA9IHJpZ2h0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVDb21wdXRlZE1lbWJlckV4cHJlc3Npb24gTEhTYCwgbGhzICk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbiBSSFNgLCByaHMgKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIGxocywgZnVuY3Rpb24oIG9iamVjdCApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWFwKCByaHMsIGZ1bmN0aW9uKCBrZXkgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NpZ24oIG9iamVjdCwga2V5LCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgY29udGV4dDogbGhzLCBuYW1lOiByaHMsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmV4aXN0ZW50aWFsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBleHByZXNzaW9uLCBjb250ZXh0LCBhc3NpZ24gKXtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIEVYSVNURU5USUFMIEVYUFJFU1NJT04nLCBleHByZXNzaW9uLnR5cGUgKTtcbiAgICB2YXIgbGVmdCA9IHRoaXMucmVjdXJzZSggZXhwcmVzc2lvbiwgZmFsc2UsIGFzc2lnbiApO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV4ZWN1dGVFeGlzdGVudGlhbEV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgRVhJU1RFTlRJQUwgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUV4aXN0ZW50aWFsRXhwcmVzc2lvbiBMRUZUYCwgbGVmdC5uYW1lICk7XG4gICAgICAgIGlmKCBzY29wZSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgfSBjYXRjaCggZSApe1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZvaWQgMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlRXhpc3RlbnRpYWxFeHByZXNzaW9uIFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLmlkZW50aWZpZXIgPSBmdW5jdGlvbiggbmFtZSwgY29udGV4dCwgYXNzaWduICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBJREVOVElGSUVSJywgbmFtZSApO1xuICAgIHZhciBkZXB0aCA9IHRoaXMuZGVwdGg7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUlkZW50aWZpZXIoIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgSURFTlRJRklFUicgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUlkZW50aWZpZXIgTkFNRWAsIG5hbWUgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZUlkZW50aWZpZXIgREVQVEhgLCBkZXB0aCApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlSWRlbnRpZmllciBWQUxVRWAsIHZhbHVlICk7XG4gICAgICAgIHZhciByZXN1bHQgPSBhc3NpZ24oIHNjb3BlLCBuYW1lLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVJZGVudGlmaWVyIFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IHNjb3BlLCBuYW1lOiBuYW1lLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5saXN0RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBpdGVtcywgY29udGV4dCwgYXNzaWduICl7XG4gICAgdmFyIGludGVycHJldGVyID0gdGhpcztcbiAgICByZXR1cm4gbWFwKCBpdGVtcywgZnVuY3Rpb24oIGl0ZW0gKXtcbiAgICAgICAgcmV0dXJuIGludGVycHJldGVyLmxpc3RFeHByZXNzaW9uRWxlbWVudCggaXRlbSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgfSApO1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUubGlzdEV4cHJlc3Npb25FbGVtZW50ID0gZnVuY3Rpb24oIGVsZW1lbnQsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIHN3aXRjaCggZWxlbWVudC50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LkxpdGVyYWw6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXRlcmFsKCBlbGVtZW50LnZhbHVlLCBjb250ZXh0ICk7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9va3VwRXhwcmVzc2lvbiggZWxlbWVudC5rZXksIGZhbHNlLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucm9vdEV4cHJlc3Npb24oIGVsZW1lbnQua2V5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LkJsb2NrRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJsb2NrRXhwcmVzc2lvbiggZWxlbWVudC5ib2R5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdVbmV4cGVjdGVkIGxpc3QgZWxlbWVudCB0eXBlICcgKyBlbGVtZW50LnR5cGUgKTtcbiAgICB9XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5saXRlcmFsID0gZnVuY3Rpb24oIHZhbHVlLCBjb250ZXh0ICl7XG4gICAgLy9jb25zb2xlLmxvZyggJ0NvbXBvc2luZyBMSVRFUkFMJywgdmFsdWUgKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUxpdGVyYWwoKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBMSVRFUkFMJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlTGl0ZXJhbCBSRVNVTFRgLCB2YWx1ZSApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IHZvaWQgMCwgbmFtZTogdm9pZCAwLCB2YWx1ZTogdmFsdWUgfSA6XG4gICAgICAgICAgICB2YWx1ZTtcbiAgICB9O1xufTtcblxuaW50ZXJwcmV0ZXJQcm90b3R5cGUubG9va3VwRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXksIHJlc29sdmUsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgTE9PS1VQIEVYUFJFU1NJT04nLCBrZXkgKTtcbiAgICB2YXIgaXNMZWZ0RnVuY3Rpb24gPSBmYWxzZSxcbiAgICAgICAgbGhzID0ge30sXG4gICAgICAgIGxlZnQ7XG5cbiAgICBzd2l0Y2goIGtleS50eXBlICl7XG4gICAgICAgIGNhc2UgU3ludGF4LklkZW50aWZpZXI6XG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5pZGVudGlmaWVyKCBrZXkubmFtZSwgdHJ1ZSwgYXNzaWduICk7XG4gICAgICAgICAgICBpc0xlZnRGdW5jdGlvbiA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguTGl0ZXJhbDpcbiAgICAgICAgICAgIGxocy52YWx1ZSA9IGxlZnQgPSBrZXkudmFsdWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLnJlY3Vyc2UoIGtleSwgdHJ1ZSwgYXNzaWduICk7XG4gICAgICAgICAgICBpc0xlZnRGdW5jdGlvbiA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZUxvb2t1cEV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgTE9PS1VQIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVMb29rdXBFeHByZXNzaW9uIExFRlRgLCBsZWZ0Lm5hbWUgfHwgbGVmdCApO1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiggaXNMZWZ0RnVuY3Rpb24gKXtcbiAgICAgICAgICAgIGxocyA9IGxlZnQoIGxvb2t1cCwgdmFsdWUsIHNjb3BlICk7XG4gICAgICAgICAgICByZXN1bHQgPSBsaHMudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIGxvb2t1cCwgbGhzLnZhbHVlLCB2b2lkIDAgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXNvbHZlIGxvb2t1cHMgdGhhdCBhcmUgdGhlIG9iamVjdCBvZiBhbiBvYmplY3QtcHJvcGVydHkgcmVsYXRpb25zaGlwXG4gICAgICAgIGlmKCByZXNvbHZlICl7XG4gICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIHNjb3BlLCByZXN1bHQsIHZvaWQgMCApO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVMb29rdXBFeHByZXNzaW9uIExIU2AsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlTG9va3VwRXhwcmVzc2lvbiBSRVNVTFRgLCByZXN1bHQgICk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgIHsgY29udGV4dDogbG9va3VwLCBuYW1lOiBsaHMudmFsdWUsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgfTtcbn07XG5cbmludGVycHJldGVyUHJvdG90eXBlLnJhbmdlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBsb3dlciwgdXBwZXIsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgUkFOR0UgRVhQUkVTU0lPTicgKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBsZWZ0ID0gbG93ZXIgIT09IG51bGwgP1xuICAgICAgICAgICAgaW50ZXJwcmV0ZXIucmVjdXJzZSggbG93ZXIsIGZhbHNlLCBhc3NpZ24gKSA6XG4gICAgICAgICAgICByZXR1cm5aZXJvLFxuICAgICAgICByaWdodCA9IHVwcGVyICE9PSBudWxsID9cbiAgICAgICAgICAgIGludGVycHJldGVyLnJlY3Vyc2UoIHVwcGVyLCBmYWxzZSwgYXNzaWduICkgOlxuICAgICAgICAgICAgcmV0dXJuWmVybyxcbiAgICAgICAgaW5kZXgsIGxocywgbWlkZGxlLCByZXN1bHQsIHJocztcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlUmFuZ2VFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFJBTkdFIEVYUFJFU1NJT04nICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVSYW5nZUV4cHJlc3Npb24gTEVGVGAsIGxlZnQubmFtZSApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlUmFuZ2VFeHByZXNzaW9uIFJJR0hUYCwgcmlnaHQubmFtZSApO1xuICAgICAgICBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICByaHMgPSByaWdodCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgIGluZGV4ID0gMTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiBMSFNgLCBsaHMgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiBSSFNgLCByaHMgKTtcbiAgICAgICAgcmVzdWx0WyAwIF0gPSBsaHM7XG4gICAgICAgIGlmKCBsaHMgPCByaHMgKXtcbiAgICAgICAgICAgIG1pZGRsZSA9IGxocyArIDE7XG4gICAgICAgICAgICB3aGlsZSggbWlkZGxlIDwgcmhzICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCsrIF0gPSBtaWRkbGUrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmKCBsaHMgPiByaHMgKXtcbiAgICAgICAgICAgIG1pZGRsZSA9IGxocyAtIDE7XG4gICAgICAgICAgICB3aGlsZSggbWlkZGxlID4gcmhzICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0WyBpbmRleCsrIF0gPSBtaWRkbGUtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbIHJlc3VsdC5sZW5ndGggXSA9IHJocztcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVJhbmdlRXhwcmVzc2lvbiBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5pbnRlcnByZXRlclByb3RvdHlwZS5yZWN1cnNlID0gZnVuY3Rpb24oIG5vZGUsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdSZWN1cnNpbmcnLCBub2RlLnR5cGUgKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBleHByZXNzaW9uID0gbnVsbDtcblxuICAgIGludGVycHJldGVyLmRlcHRoKys7XG5cbiAgICBzd2l0Y2goIG5vZGUudHlwZSApe1xuICAgICAgICBjYXNlIFN5bnRheC5BcnJheUV4cHJlc3Npb246XG4gICAgICAgICAgICBleHByZXNzaW9uID0gaW50ZXJwcmV0ZXIuYXJyYXlFeHByZXNzaW9uKCBub2RlLmVsZW1lbnRzLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGludGVycHJldGVyLmlzU3BsaXQgPSBpbnRlcnByZXRlci5pc0xlZnRTcGxpdCA9IG5vZGUuZWxlbWVudHMubGVuZ3RoID4gMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5DYWxsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5jYWxsRXhwcmVzc2lvbiggbm9kZS5jYWxsZWUsIG5vZGUuYXJndW1lbnRzLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguQmxvY2tFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmJsb2NrRXhwcmVzc2lvbiggbm9kZS5ib2R5LCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleXBhdGhTeW50YXguRXhpc3RlbnRpYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmV4aXN0ZW50aWFsRXhwcmVzc2lvbiggbm9kZS5leHByZXNzaW9uLCBjb250ZXh0LCBhc3NpZ24gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFN5bnRheC5JZGVudGlmaWVyOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmlkZW50aWZpZXIoIG5vZGUubmFtZSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguTGl0ZXJhbDpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5saXRlcmFsKCBub2RlLnZhbHVlLCBjb250ZXh0ICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguTWVtYmVyRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBub2RlLmNvbXB1dGVkID9cbiAgICAgICAgICAgICAgICBpbnRlcnByZXRlci5jb21wdXRlZE1lbWJlckV4cHJlc3Npb24oIG5vZGUub2JqZWN0LCBub2RlLnByb3BlcnR5LCBjb250ZXh0LCBhc3NpZ24gKSA6XG4gICAgICAgICAgICAgICAgaW50ZXJwcmV0ZXIuc3RhdGljTWVtYmVyRXhwcmVzc2lvbiggbm9kZS5vYmplY3QsIG5vZGUucHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5cGF0aFN5bnRheC5Mb29rdXBFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLmxvb2t1cEV4cHJlc3Npb24oIG5vZGUua2V5LCBmYWxzZSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJhbmdlRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBpbnRlcnByZXRlci5yYW5nZUV4cHJlc3Npb24oIG5vZGUubGVmdCwgbm9kZS5yaWdodCwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LlJvb3RFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLnJvb3RFeHByZXNzaW9uKCBub2RlLmtleSwgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTeW50YXguU2VxdWVuY2VFeHByZXNzaW9uOlxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGludGVycHJldGVyLnNlcXVlbmNlRXhwcmVzc2lvbiggbm9kZS5leHByZXNzaW9ucywgY29udGV4dCwgYXNzaWduICk7XG4gICAgICAgICAgICBpbnRlcnByZXRlci5pc1NwbGl0ID0gaW50ZXJwcmV0ZXIuaXNSaWdodFNwbGl0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ1Vua25vd24gbm9kZSB0eXBlICcgKyBub2RlLnR5cGUgKTtcbiAgICB9XG5cbiAgICBpbnRlcnByZXRlci5kZXB0aC0tO1xuXG4gICAgcmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5yb290RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCBrZXksIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgUk9PVCBFWFBSRVNTSU9OJyApO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBrZXksIGZhbHNlLCBhc3NpZ24gKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiBleGVjdXRlUm9vdEV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgUk9PVCBFWFBSRVNTSU9OJyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlUm9vdEV4cHJlc3Npb24gTEVGVGAsIGxlZnQubmFtZSB8fCBsZWZ0ICk7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVSb290RXhwcmVzc2lvbiBTQ09QRWAsIHNjb3BlICk7XG4gICAgICAgIHZhciBsaHMsIHJlc3VsdDtcbiAgICAgICAgcmVzdWx0ID0gbGhzID0gbGVmdCggc2NvcGUsIHZhbHVlLCBsb29rdXAgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVJvb3RFeHByZXNzaW9uIExIU2AsIGxocyApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlUm9vdEV4cHJlc3Npb24gUkVTVUxUYCwgcmVzdWx0ICApO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICB7IGNvbnRleHQ6IGxvb2t1cCwgbmFtZTogbGhzLnZhbHVlLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgcmVzdWx0O1xuICAgIH07XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5zZXF1ZW5jZUV4cHJlc3Npb24gPSBmdW5jdGlvbiggZXhwcmVzc2lvbnMsIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIHZhciBmbiwgbGlzdDtcbiAgICAvL2NvbnNvbGUubG9nKCAnQ29tcG9zaW5nIFNFUVVFTkNFIEVYUFJFU1NJT04nICk7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIGV4cHJlc3Npb25zICkgKXtcbiAgICAgICAgbGlzdCA9IHRoaXMubGlzdEV4cHJlc3Npb24oIGV4cHJlc3Npb25zLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uKCBzY29wZSwgdmFsdWUsIGxvb2t1cCApe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ0V4ZWN1dGluZyBTRVFVRU5DRSBFWFBSRVNTSU9OJyApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiBMSVNUYCwgbGlzdCApO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG1hcCggbGlzdCwgZnVuY3Rpb24oIGV4cHJlc3Npb24gKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbiBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3QgPSB0aGlzLnJlY3Vyc2UoIGV4cHJlc3Npb25zLCBmYWxzZSwgYXNzaWduICk7XG5cbiAgICAgICAgZm4gPSBmdW5jdGlvbiBleGVjdXRlU2VxdWVuY2VFeHByZXNzaW9uV2l0aEV4cHJlc3Npb25SYW5nZSggc2NvcGUsIHZhbHVlLCBsb29rdXAgKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdFeGVjdXRpbmcgU0VRVUVOQ0UgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVTZXF1ZW5jZUV4cHJlc3Npb25XaXRoRXhwcmVzc2lvblJhbmdlIExJU1RgLCBsaXN0Lm5hbWUgKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBsaXN0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggYC0gZXhlY3V0ZVNlcXVlbmNlRXhwcmVzc2lvbldpdGhFeHByZXNzaW9uUmFuZ2UgUkVTVUxUYCwgcmVzdWx0ICk7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/XG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZm47XG59O1xuXG5pbnRlcnByZXRlclByb3RvdHlwZS5zdGF0aWNNZW1iZXJFeHByZXNzaW9uID0gZnVuY3Rpb24oIG9iamVjdCwgcHJvcGVydHksIGNvbnRleHQsIGFzc2lnbiApe1xuICAgIC8vY29uc29sZS5sb2coICdDb21wb3NpbmcgU1RBVElDIE1FTUJFUiBFWFBSRVNTSU9OJywgb2JqZWN0LnR5cGUsIHByb3BlcnR5LnR5cGUgKTtcbiAgICB2YXIgaW50ZXJwcmV0ZXIgPSB0aGlzLFxuICAgICAgICBkZXB0aCA9IHRoaXMuZGVwdGgsXG4gICAgICAgIGlzUmlnaHRGdW5jdGlvbiA9IGZhbHNlLFxuICAgICAgICBpc1NhZmUgPSBmYWxzZSxcbiAgICAgICAgbGVmdCwgcmhzLCByaWdodDtcblxuICAgIHN3aXRjaCggb2JqZWN0LnR5cGUgKXtcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4Lkxvb2t1cEV4cHJlc3Npb246XG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5sb29rdXBFeHByZXNzaW9uKCBvYmplY3Qua2V5LCB0cnVlLCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGlzU2FmZSA9IHRydWU7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5yZWN1cnNlKCBvYmplY3QsIGZhbHNlLCBhc3NpZ24gKTtcbiAgICB9XG5cbiAgICBzd2l0Y2goIHByb3BlcnR5LnR5cGUgKXtcbiAgICAgICAgY2FzZSBTeW50YXguSWRlbnRpZmllcjpcbiAgICAgICAgICAgIHJocyA9IHJpZ2h0ID0gcHJvcGVydHkubmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmlnaHQgPSB0aGlzLnJlY3Vyc2UoIHByb3BlcnR5LCBmYWxzZSwgYXNzaWduICk7XG4gICAgICAgICAgICBpc1JpZ2h0RnVuY3Rpb24gPSB0cnVlO1xuICAgIH1cblxuICAgIGlmKCAhaW50ZXJwcmV0ZXIuaXNTcGxpdCApe1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFNUQVRJQyBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIExFRlRgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIFJJR0hUYCwgcmhzIHx8IHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdDtcblxuICAgICAgICAgICAgaWYoICFpc1NhZmUgfHwgbGhzICl7XG4gICAgICAgICAgICAgICAgaWYoIGlzUmlnaHRGdW5jdGlvbiApe1xuICAgICAgICAgICAgICAgICAgICByaHMgPSByaWdodCggcHJvcGVydHkudHlwZSA9PT0gS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiA/IHNjb3BlIDogbGhzLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIExIU2AsIGxocyApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIFJIU2AsIHJocyApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhc3NpZ24oIGxocywgcmhzLCAhZGVwdGggPyB2YWx1ZSA6IHt9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBgLSBleGVjdXRlU3RhdGljTWVtYmVyRXhwcmVzc2lvbiBSRVNVTFRgLCByZXN1bHQgKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0ID9cbiAgICAgICAgICAgICAgICB7IGNvbnRleHQ6IGxocywgbmFtZTogcmhzLCB2YWx1ZTogcmVzdWx0IH0gOlxuICAgICAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZVN0YXRpY01lbWJlckV4cHJlc3Npb24oIHNjb3BlLCB2YWx1ZSwgbG9va3VwICl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnRXhlY3V0aW5nIFNUQVRJQyBNRU1CRVIgRVhQUkVTU0lPTicgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIExFRlRgLCBsZWZ0Lm5hbWUgKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIFJJR0hUYCwgcmhzIHx8IHJpZ2h0Lm5hbWUgKTtcbiAgICAgICAgICAgIHZhciBsaHMgPSBsZWZ0KCBzY29wZSwgdmFsdWUsIGxvb2t1cCApLFxuICAgICAgICAgICAgICAgIHJlc3VsdDtcblxuICAgICAgICAgICAgaWYoICFpc1NhZmUgfHwgbGhzICl7XG4gICAgICAgICAgICAgICAgaWYoIGlzUmlnaHRGdW5jdGlvbiApe1xuICAgICAgICAgICAgICAgICAgICByaHMgPSByaWdodCggcHJvcGVydHkudHlwZSA9PT0gS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiA/IHNjb3BlIDogbGhzLCB2YWx1ZSwgbG9va3VwICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIExIU2AsIGxocyApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIFJIU2AsIHJocyApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIERFUFRIYCwgZGVwdGggKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBtYXAoIGxocywgZnVuY3Rpb24oIG9iamVjdCApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzaWduKCBvYmplY3QsIHJocywgIWRlcHRoID8gdmFsdWUgOiB7fSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGAtIGV4ZWN1dGVTdGF0aWNNZW1iZXJFeHByZXNzaW9uIFJFU1VMVGAsIHJlc3VsdCApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQgP1xuICAgICAgICAgICAgICAgIHsgY29udGV4dDogbGhzLCBuYW1lOiByaHMsIHZhbHVlOiByZXN1bHQgfSA6XG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgTGV4ZXIgZnJvbSAnLi9sZXhlcic7XG5pbXBvcnQgQnVpbGRlciBmcm9tICcuL2J1aWxkZXInO1xuaW1wb3J0IEludGVycHJldGVyIGZyb20gJy4vaW50ZXJwcmV0ZXInO1xuaW1wb3J0IGhhc093blByb3BlcnR5IGZyb20gJy4vaGFzLW93bi1wcm9wZXJ0eSc7XG5cbnZhciBsZXhlciA9IG5ldyBMZXhlcigpLFxuICAgIGJ1aWxkZXIgPSBuZXcgQnVpbGRlciggbGV4ZXIgKSxcbiAgICBpbnRyZXByZXRlciA9IG5ldyBJbnRlcnByZXRlciggYnVpbGRlciApLFxuXG4gICAgY2FjaGU7XG5cbi8qKlxuICogQGNsYXNzIEtleXBhdGhFeHBcbiAqIEBleHRlbmRzIFRyYW5zZHVjZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6c3RyaW5nfSBwYXR0ZXJuXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ30gZmxhZ3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gS2V5cGF0aEV4cCggcGF0dGVybiwgZmxhZ3MgKXtcbiAgICB0eXBlb2YgcGF0dGVybiAhPT0gJ3N0cmluZycgJiYgKCBwYXR0ZXJuID0gJycgKTtcbiAgICB0eXBlb2YgZmxhZ3MgIT09ICdzdHJpbmcnICYmICggZmxhZ3MgPSAnJyApO1xuXG4gICAgdmFyIHRva2VucztcblxuICAgIGlmKCBmbGFncy5pbmRleE9mKCAnYycgKSAhPT0gLTEgKXtcbiAgICAgICAgaWYoICFjYWNoZSApe1xuICAgICAgICAgICAgY2FjaGUgPSBuZXcgTnVsbCgpO1xuICAgICAgICB9XG4gICAgICAgIHRva2VucyA9IGhhc093blByb3BlcnR5KCBjYWNoZSwgcGF0dGVybiApID9cbiAgICAgICAgICAgIGNhY2hlWyBwYXR0ZXJuIF0gOlxuICAgICAgICAgICAgY2FjaGVbIHBhdHRlcm4gXSA9IGxleGVyLmxleCggcGF0dGVybiApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRva2VucyA9IGxleGVyLmxleCggcGF0dGVybiApO1xuICAgIH1cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCB0aGlzLCB7XG4gICAgICAgICdmbGFncyc6IHtcbiAgICAgICAgICAgIHZhbHVlOiBmbGFncyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICdzb3VyY2UnOiB7XG4gICAgICAgICAgICB2YWx1ZTogcGF0dGVybixcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICdnZXR0ZXInOiB7XG4gICAgICAgICAgICB2YWx1ZTogaW50cmVwcmV0ZXIuY29tcGlsZSggdG9rZW5zLCBmYWxzZSApLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICdzZXR0ZXInOiB7XG4gICAgICAgICAgICB2YWx1ZTogaW50cmVwcmV0ZXIuY29tcGlsZSggdG9rZW5zLCB0cnVlICksXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgfVxuICAgIH0gKTtcbn1cblxuS2V5cGF0aEV4cC5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5LZXlwYXRoRXhwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEtleXBhdGhFeHA7XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbktleXBhdGhFeHAucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCB0YXJnZXQsIGxvb2t1cCApe1xuICAgIHJldHVybiB0aGlzLmdldHRlciggdGFyZ2V0LCB1bmRlZmluZWQsIGxvb2t1cCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuS2V5cGF0aEV4cC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24oIHRhcmdldCwgbG9va3VwICl7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuZ2V0dGVyKCB0YXJnZXQsIHVuZGVmaW5lZCwgbG9va3VwICk7XG4gICAgcmV0dXJuIHR5cGVvZiByZXN1bHQgIT09ICd1bmRlZmluZWQnO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuS2V5cGF0aEV4cC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oIHRhcmdldCwgdmFsdWUsIGxvb2t1cCApe1xuICAgIHJldHVybiB0aGlzLnNldHRlciggdGFyZ2V0LCB2YWx1ZSwgbG9va3VwICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5LZXlwYXRoRXhwLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IE51bGwoKTtcblxuICAgIGpzb24uZmxhZ3MgPSB0aGlzLmZsYWdzO1xuICAgIGpzb24uc291cmNlID0gdGhpcy5zb3VyY2U7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKi9cbktleXBhdGhFeHAucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2U7XG59OyIsImltcG9ydCBOdWxsIGZyb20gJy4vbnVsbCc7XG5pbXBvcnQgS2V5cGF0aEV4cCBmcm9tICcuL2V4cCc7XG5cbnZhciBwcm90b2NvbCA9IG5ldyBOdWxsKCk7XG5cbnByb3RvY29sLmluaXQgICAgPSAnQEB0cmFuc2R1Y2VyL2luaXQnO1xucHJvdG9jb2wuc3RlcCAgICA9ICdAQHRyYW5zZHVjZXIvc3RlcCc7XG5wcm90b2NvbC5yZWR1Y2VkID0gJ0BAdHJhbnNkdWNlci9yZWR1Y2VkJztcbnByb3RvY29sLnJlc3VsdCAgPSAnQEB0cmFuc2R1Y2VyL3Jlc3VsdCc7XG5wcm90b2NvbC52YWx1ZSAgID0gJ0BAdHJhbnNkdWNlci92YWx1ZSc7XG5cbi8qKlxuICogQSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIHRoZSBUcmFuc2ZvbWVyIHByb3RvY29sIHVzZWQgYnkgVHJhbnNkdWNlcnNcbiAqIEBjbGFzcyBUcmFuc2Zvcm1lclxuICogQGV4dGVuZHMgTnVsbFxuICogQHBhcmFtIHtleHRlcm5hbDpGdW5jdGlvbn0geGYgQSB0cmFuc2Zvcm1lclxuICovXG5mdW5jdGlvbiBUcmFuc2Zvcm1lciggeGYgKXtcbiAgICB0aGlzLnhmID0geGY7XG59XG5cblRyYW5zZm9ybWVyLnByb3RvdHlwZSA9IFRyYW5zZm9ybWVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cblRyYW5zZm9ybWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRyYW5zZm9ybWVyO1xuXG4vKipcbiAqIEBmdW5jdGlvbiBUcmFuc2Zvcm1lciNAQHRyYW5zZHVjZXIvaW5pdFxuICovXG5UcmFuc2Zvcm1lci5wcm90b3R5cGVbIHByb3RvY29sLmluaXQgXSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMueGZJbml0KCk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBUcmFuc2Zvcm1lciNAQHRyYW5zZHVjZXIvc3RlcFxuICovXG5UcmFuc2Zvcm1lci5wcm90b3R5cGVbIHByb3RvY29sLnN0ZXAgXSA9IGZ1bmN0aW9uKCB2YWx1ZSwgaW5wdXQgKXtcbiAgICByZXR1cm4gdGhpcy54ZlN0ZXAoIHZhbHVlLCBpbnB1dCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gVHJhbnNmb3JtZXIjQEB0cmFuc2R1Y2VyL3Jlc3VsdFxuICovXG5UcmFuc2Zvcm1lci5wcm90b3R5cGVbIHByb3RvY29sLnJlc3VsdCBdID0gZnVuY3Rpb24oIHZhbHVlICl7XG4gICAgcmV0dXJuIHRoaXMueGZSZXN1bHQoIHZhbHVlICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5UcmFuc2Zvcm1lci5wcm90b3R5cGUueGZJbml0ID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy54ZlsgcHJvdG9jb2wuaW5pdCBdKCk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICovXG5UcmFuc2Zvcm1lci5wcm90b3R5cGUueGZTdGVwID0gZnVuY3Rpb24oIHZhbHVlLCBpbnB1dCApe1xuICAgIHJldHVybiB0aGlzLnhmWyBwcm90b2NvbC5zdGVwIF0oIHZhbHVlLCBpbnB1dCApO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqL1xuVHJhbnNmb3JtZXIucHJvdG90eXBlLnhmUmVzdWx0ID0gZnVuY3Rpb24oIHZhbHVlICl7XG4gICAgcmV0dXJuIHRoaXMueGZbIHByb3RvY29sLnJlc3VsdCBdKCB2YWx1ZSApO1xufTtcblxuLyoqXG4gKiBAY2xhc3MgS2V5cGF0aFRyYW5zZm9ybWVyXG4gKiBAZXh0ZW5kcyBUcmFuc2Zvcm1lclxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHAgQSBrZXlwYXRoIHBhdHRlcm5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6RnVuY3Rpb259IHhmIEEgdHJhbnNmb3JtZXJcbiAqL1xuZnVuY3Rpb24gS2V5cGF0aFRyYW5zZm9ybWVyKCBwLCB4ZiApe1xuICAgIFRyYW5zZm9ybWVyLmNhbGwoIHRoaXMsIHhmICk7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7S2V5cGF0aEV4cH1cbiAgICAgKi9cbiAgICB0aGlzLmtwZXggPSBuZXcgS2V5cGF0aEV4cCggcCApO1xufVxuXG5LZXlwYXRoVHJhbnNmb3JtZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVHJhbnNmb3JtZXIucHJvdG90eXBlICk7XG5cbktleXBhdGhUcmFuc2Zvcm1lci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBLZXlwYXRoVHJhbnNmb3JtZXI7XG5cbktleXBhdGhUcmFuc2Zvcm1lci5wcm90b3R5cGVbIHByb3RvY29sLnN0ZXAgXSA9IGZ1bmN0aW9uKCB2YWx1ZSwgaW5wdXQgKXtcbiAgICByZXR1cm4gdGhpcy54ZlN0ZXAoIHZhbHVlLCB0aGlzLmtwZXguZ2V0KCBpbnB1dCApICk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd9IHAgQSBrZXlwYXRoIHBhdHRlcm5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpGdW5jdGlvbn1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ga2V5cGF0aCggcCApe1xuICAgIHJldHVybiBmdW5jdGlvbiggeGYgKXtcbiAgICAgICAgcmV0dXJuIG5ldyBLZXlwYXRoVHJhbnNmb3JtZXIoIHAsIHhmICk7XG4gICAgfTtcbn0iXSwibmFtZXMiOlsiSWRlbnRpZmllciIsIk51bWVyaWNMaXRlcmFsIiwiTnVsbExpdGVyYWwiLCJQdW5jdHVhdG9yIiwiU3RyaW5nTGl0ZXJhbCIsIkdyYW1tYXIuSWRlbnRpZmllciIsIkdyYW1tYXIuTnVtZXJpY0xpdGVyYWwiLCJHcmFtbWFyLk51bGxMaXRlcmFsIiwiR3JhbW1hci5QdW5jdHVhdG9yIiwiR3JhbW1hci5TdHJpbmdMaXRlcmFsIiwiQ2hhcmFjdGVyLmlzSWRlbnRpZmllclN0YXJ0IiwiQ2hhcmFjdGVyLmlzSWRlbnRpZmllclBhcnQiLCJUb2tlbi5OdWxsTGl0ZXJhbCIsIlRva2VuLklkZW50aWZpZXIiLCJDaGFyYWN0ZXIuaXNQdW5jdHVhdG9yIiwiVG9rZW4uUHVuY3R1YXRvciIsIkNoYXJhY3Rlci5pc1F1b3RlIiwiVG9rZW4uU3RyaW5nTGl0ZXJhbCIsIkNoYXJhY3Rlci5pc051bWVyaWMiLCJUb2tlbi5OdW1lcmljTGl0ZXJhbCIsIkNoYXJhY3Rlci5pc1doaXRlc3BhY2UiLCJBcnJheUV4cHJlc3Npb24iLCJDYWxsRXhwcmVzc2lvbiIsIkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJMaXRlcmFsIiwiTWVtYmVyRXhwcmVzc2lvbiIsIlByb2dyYW0iLCJTZXF1ZW5jZUV4cHJlc3Npb24iLCJTeW50YXguTGl0ZXJhbCIsIlN5bnRheC5NZW1iZXJFeHByZXNzaW9uIiwiU3ludGF4LlByb2dyYW0iLCJTeW50YXguQXJyYXlFeHByZXNzaW9uIiwiU3ludGF4LkNhbGxFeHByZXNzaW9uIiwiU3ludGF4LkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJTeW50YXguSWRlbnRpZmllciIsIlN5bnRheC5TZXF1ZW5jZUV4cHJlc3Npb24iLCJCbG9ja0V4cHJlc3Npb24iLCJFeGlzdGVudGlhbEV4cHJlc3Npb24iLCJMb29rdXBFeHByZXNzaW9uIiwiUmFuZ2VFeHByZXNzaW9uIiwiUm9vdEV4cHJlc3Npb24iLCJTY29wZUV4cHJlc3Npb24iLCJLZXlwYXRoU3ludGF4LkV4aXN0ZW50aWFsRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguTG9va3VwRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguUmFuZ2VFeHByZXNzaW9uIiwiS2V5cGF0aFN5bnRheC5Sb290RXhwcmVzc2lvbiIsIk5vZGUuQXJyYXlFeHByZXNzaW9uIiwiS2V5cGF0aE5vZGUuQmxvY2tFeHByZXNzaW9uIiwiTm9kZS5DYWxsRXhwcmVzc2lvbiIsIktleXBhdGhOb2RlLkV4aXN0ZW50aWFsRXhwcmVzc2lvbiIsIk5vZGUuRXhwcmVzc2lvblN0YXRlbWVudCIsIk5vZGUuSWRlbnRpZmllciIsIk5vZGUuTnVtZXJpY0xpdGVyYWwiLCJOb2RlLlN0cmluZ0xpdGVyYWwiLCJOb2RlLk51bGxMaXRlcmFsIiwiS2V5cGF0aE5vZGUuTG9va3VwRXhwcmVzc2lvbiIsIk5vZGUuQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIiwiTm9kZS5TdGF0aWNNZW1iZXJFeHByZXNzaW9uIiwiTm9kZS5Qcm9ncmFtIiwiS2V5cGF0aE5vZGUuUmFuZ2VFeHByZXNzaW9uIiwiS2V5cGF0aE5vZGUuUm9vdEV4cHJlc3Npb24iLCJOb2RlLlNlcXVlbmNlRXhwcmVzc2lvbiIsIktleXBhdGhTeW50YXguQmxvY2tFeHByZXNzaW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7QUFLQSxBQUFlLFNBQVMsSUFBSSxFQUFFLEVBQUU7QUFDaEMs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
