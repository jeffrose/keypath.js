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

/**
 * @namespace Lexer~Grammar
 */
var Grammar = new Null();

Grammar.Identifier      = 'Identifier';
Grammar.NumericLiteral  = 'NumericLiteral';
Grammar.NullLiteral     = 'NullLiteral';
Grammar.Punctuator      = 'Punctuator';
Grammar.StringLiteral   = 'StringLiteral';

var tokenId = 0;

/**
 * @class Lexer~Token
 * @extends Null
 * @param {external:string} type The type of the token
 * @param {external:string} value The value of the token
 * @throws {external:TypeError} If `type` is not a string
 * @throws {external:TypeError} If `value` is not a string
 */
function Token( type, value ){
    if( typeof type !== 'string' ){
        throw new TypeError( 'type must be a string' );
    }
    
    if( typeof value !== 'string' ){
        throw new TypeError( 'value must be a string' );
    }
    
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
    /**
     * The length of the token value
     * @member {external:number} Lexer~Token#length
     */
    this.length = value.length;
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
function Identifier( value ){
    Token.call( this, Grammar.Identifier, value );
}

Identifier.prototype = Object.create( Token.prototype );

Identifier.prototype.constructor = Identifier;

/**
 * @class Lexer~NumericLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function NumericLiteral( value ){
    Token.call( this, Grammar.NumericLiteral, value );
}

NumericLiteral.prototype = Object.create( Token.prototype );

NumericLiteral.prototype.constructor = NumericLiteral;

/**
 * @class Lexer~NullLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function NullLiteral( value ){
    Token.call( this, Grammar.NullLiteral, value );
}

NullLiteral.prototype = Object.create( Token.prototype );

NullLiteral.prototype.constructor = NullLiteral;

/**
 * @class Lexer~Punctuator
 * @extends Lexer~Token
 * @param {external:string} value
 */
function Punctuator( value ){
    Token.call( this, Grammar.Punctuator, value );
}

Punctuator.prototype = Object.create( Token.prototype );

Punctuator.prototype.constructor = Punctuator;

/**
 * @class Lexer~StringLiteral
 * @extends Lexer~Token
 * @param {external:string} value
 */
function StringLiteral( value ){
    Token.call( this, Grammar.StringLiteral, value );
}

StringLiteral.prototype = Object.create( Token.prototype );

StringLiteral.prototype.constructor = StringLiteral;

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
    return char === '.' || char === '(' || char === ')' || char === '[' || char === ']' || char === '{' || char === '}' || char === ',' || char === '%';
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
 * @class Lexer~LexerError
 * @extends external:SyntaxError
 * @param {external:string} message The error message
 */
function LexerError( message ){
    SyntaxError.call( this, message );    
}

LexerError.prototype = Object.create( SyntaxError.prototype );

/**
 * @class Lexer
 * @extends Null
 */
function Lexer(){
    this.buffer = '';
}

Lexer.prototype = new Null();

Lexer.prototype.constructor = Lexer;

/**
 * @function
 * @param {external:string} text
 */
Lexer.prototype.lex = function( text ){
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
        char, quote;
    
    while( this.index < length ){
        char = this.buffer[ this.index ];
        
        // Identifier
        if( isIdentifier( char ) ){
            word = this.read( function( char ){
                return !isIdentifier( char ) && !isNumeric( char );
            } );
            
            word === 'null' ?
                this.tokens.push( new NullLiteral( word ) ) :
                this.tokens.push( new Identifier( word ) );
        
        // Punctuator
        } else if( isPunctuator( char ) ){
            this.tokens.push( new Punctuator( char ) );
            this.index++;
        
        // Quoted String
        } else if( isQuote( char ) ){
            quote = char;
            
            this.index++;
            
            word = this.read( function( char ){
                return char === quote;
            } );
            
            this.tokens.push( new StringLiteral( quote + word + quote ) );
            
            this.index++;
        
        // Numeric
        } else if( isNumeric( char ) ){
            word = this.read( function( char ){
                return !isNumeric( char );
            } );
            
            this.tokens.push( new NumericLiteral( word ) );
        
        // Whitespace
        } else if( isWhitespace( char ) ){
            this.index++;
        
        // Error
        } else {
            this.throwError( '"' + char + '" is an invalid character' );
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
Lexer.prototype.read = function( until ){
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
 * @throws {Lexer~LexerError} When it executes
 */
Lexer.prototype.throwError = function( message ){
    throw new LexerError( message );
};

/**
 * @function
 * @returns {external:Object} A JSON representation of the lexer
 */
Lexer.prototype.toJSON = function(){
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
Lexer.prototype.toString = function(){
    return this.buffer;
};

var Syntax = new Null();

Syntax.ArrayExpression       = 'ArrayExpression';
Syntax.CallExpression        = 'CallExpression';
Syntax.EvalExpression        = 'EvalExpression';
Syntax.ExpressionStatement   = 'ExpressionStatement';
Syntax.Identifier            = 'Identifier';
Syntax.Literal               = 'Literal';
Syntax.MemberExpression      = 'MemberExpression';
Syntax.LookupExpression      = 'LookupExpression';
Syntax.LookupOperator        = '%';
Syntax.Program               = 'Program';
Syntax.RangeExpression       = 'RangeExpression';
Syntax.RangeOperator         = '..';
Syntax.SequenceExpression    = 'SequenceExpression';

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
    const json = new Null();
    
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
function Literal( value, raw ){
    Expression.call( this, Syntax.Literal );
    
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

Literal.prototype = Object.create( Expression.prototype );

Literal.prototype.constructor = Literal;

/**
 * @function
 * @returns {external:Object} A JSON representation of the literal
 */
Literal.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.raw = this.raw;
    json.value = this.value;
    
    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the literal
 */
Literal.prototype.toString = function(){
    return this.raw;
};

/**
 * @class Builder~MemberExpression
 * @extends Builder~Expression
 * @param {Builder~Expression} object
 * @param {Builder~Expression|Builder~Identifier} property
 * @param {external:boolean} computed=false
 */
function MemberExpression( object, property, computed ){
    Expression.call( this, Syntax.MemberExpression );
    
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

MemberExpression.prototype = Object.create( Expression.prototype );

MemberExpression.prototype.constructor = MemberExpression;

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

/**
 * @function
 * @returns {external:Object} A JSON representation of the member expression
 */
MemberExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
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
function Program( body ){
    Node.call( this, Syntax.Program );
    
    if( !Array.isArray( body ) ){
        throw new TypeError( 'body must be an array' );
    }
    
    /**
     * @member {external:Array<Builder~Statement>}
     */
    this.body = body || [];
}

Program.prototype = Object.create( Node.prototype );

Program.prototype.constructor = Program;

/**
 * @function
 * @returns {external:Object} A JSON representation of the program
 */
Program.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.body = this.body.map( ( node ) => node.toJSON() );
    
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
function ArrayExpression( elements ){
    Expression.call( this, Syntax.ArrayExpression );
    
    if( !( Array.isArray( elements ) ) && !( elements instanceof RangeExpression ) ){
        throw new TypeError( 'elements must be a list of expressions or an instance of range expression' );
    }
    
    /**
     * @member {Array<Builder~Expression>|RangeExpression}
     */
    this.elements = elements;
}

ArrayExpression.prototype = Object.create( Expression.prototype );

ArrayExpression.prototype.constructor = ArrayExpression;

/**
 * @function
 * @returns {external:Object} A JSON representation of the array expression
 */
ArrayExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
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
function CallExpression( callee, args ){
    Expression.call( this, Syntax.CallExpression );
    
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

CallExpression.prototype = Object.create( Expression.prototype );

CallExpression.prototype.constructor = CallExpression;

/**
 * @function
 * @returns {external:Object} A JSON representation of the call expression
 */
CallExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.callee    = this.callee.toJSON();
    json.arguments = this.arguments.map( ( node ) => node.toJSON() );
    
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
        
    MemberExpression.call( this, object, property, true );
    
    /**
     * @member Builder~ComputedMemberExpression#computed=true
     */
}

ComputedMemberExpression.prototype = Object.create( MemberExpression.prototype );

ComputedMemberExpression.prototype.constructor = ComputedMemberExpression;

function EvalExpression( body ){
    Expression.call( this, 'EvalExpression' );
    
    /*
    if( !( expression instanceof Expression ) ){
        throw new TypeError( 'argument must be an expression' );
    }
    */
    
    this.body = body;
}

EvalExpression.prototype = Object.create( Expression.prototype );

EvalExpression.prototype.constructor = EvalExpression;

/**
 * @class Builder~ExpressionStatement
 * @extends Builder~Statement
 */
function ExpressionStatement( expression ){
    Statement.call( this, Syntax.ExpressionStatement );
    
    if( !( expression instanceof Expression ) ){
        throw new TypeError( 'argument must be an expression' );
    }
    
    /**
     * @member {Builder~Expression}
     */
    this.expression = expression;
}

ExpressionStatement.prototype = Object.create( Statement.prototype );

ExpressionStatement.prototype.constructor = ExpressionStatement;

/**
 * @function
 * @returns {external:Object} A JSON representation of the expression statement
 */
ExpressionStatement.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.expression = this.expression.toJSON();
    
    return json;
};

/**
 * @class Builder~Identifier
 * @extends Builder~Expression
 * @param {external:string} name The name of the identifier
 */
function Identifier$1( name ){
    Expression.call( this, Syntax.Identifier );
    
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
    const json = Node.prototype.toJSON.call( this );
    
    json.name = this.name;
    
    return json;
};

function NullLiteral$1( raw ){
    if( raw !== 'null' ){
        throw new TypeError( 'raw is not a null literal' );
    }
    
    Literal.call( this, null, raw );
}

NullLiteral$1.prototype = Object.create( Literal.prototype );

NullLiteral$1.prototype.constructor = NullLiteral$1;

function NumericLiteral$1( raw ){
    var value = parseFloat( raw );
    
    if( isNaN( value ) ){
        throw new TypeError( 'raw is not a numeric literal' );
    }
    
    Literal.call( this, value, raw );
}

NumericLiteral$1.prototype = Object.create( Literal.prototype );

NumericLiteral$1.prototype.constructor = NumericLiteral$1;

function LookupExpression( key ){
    if( !( key instanceof Literal ) && !( key instanceof Identifier$1 ) && !( key instanceof EvalExpression ) ){
        throw new TypeError( 'key must be a literal, identifier, or eval expression' );
    }
    
    OperatorExpression.call( this, Syntax.LookupExpression, Syntax.LookupOperator );
    
    this.key = key;
}

LookupExpression.prototype = Object.create( OperatorExpression.prototype );

LookupExpression.prototype.constructor = LookupExpression;

LookupExpression.prototype.toString = function(){
    return this.operator + this.key;
};

LookupExpression.prototype.toJSON = function(){
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
function RangeExpression( left, right ){
    OperatorExpression.call( this, Syntax.RangeExpression, Syntax.RangeOperator );
    
    if( !( left instanceof Literal ) && left !== null ){
        throw new TypeError( 'left must be an instance of literal or null' );
    }
    
    if( !( right instanceof Literal ) && right !== null ){
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

RangeExpression.prototype = Object.create( Expression.prototype );

RangeExpression.prototype.constructor = RangeExpression;

RangeExpression.prototype.toJSON = function(){
    var json = OperatorExpression.prototype.toJSON.call( this );
    
    json.left = this.left !== null ?
        this.left.toJSON() :
        this.left;
    json.right = this.right !== null ?
        this.right.toJSON() :
        this.right;
    
    return json;
};

RangeExpression.prototype.toString = function(){
    return this.left.toString() + this.operator + this.right.toString();
};

/**
 * @class Builder~SequenceExpression
 * @extends Builder~Expression
 * @param {Array<Builder~Expression>|RangeExpression} expressions The expressions in the sequence
 */
function SequenceExpression( expressions ){
    Expression.call( this, Syntax.SequenceExpression );
    
    if( !( Array.isArray( expressions ) ) && !( expressions instanceof RangeExpression ) ){
        throw new TypeError( 'expressions must be a list of expressions or an instance of range expression' );
    }
    
    /**
     * @member {Array<Builder~Expression>|RangeExpression}
     */
    this.expressions = expressions;
}

SequenceExpression.prototype = Object.create( Expression.prototype );

SequenceExpression.prototype.constructor = SequenceExpression;

/**
 * @function
 * @returns {external:Object} A JSON representation of the sequence expression
 */
SequenceExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
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
    if( !( property instanceof Identifier$1 ) && !( property instanceof LookupExpression ) && !( property instanceof EvalExpression ) ){
        throw new TypeError( 'property must be an identifier, eval expression, or lookup expression when computed is false' );
    }
        
    MemberExpression.call( this, object, property, false );
    
    /**
     * @member Builder~StaticMemberExpression#computed=false
     */
}

StaticMemberExpression.prototype = Object.create( MemberExpression.prototype );

StaticMemberExpression.prototype.constructor = StaticMemberExpression;

function StringLiteral$1( raw ){
    if( raw[ 0 ] !== '"' && raw[ 0 ] !== "'" ){
        throw new TypeError( 'raw is not a string literal' );
    }
    
    var value = raw.substring( 1, raw.length - 1 );
    
    Literal.call( this, value, raw );
}

StringLiteral$1.prototype = Object.create( Literal.prototype );

StringLiteral$1.prototype.constructor = StringLiteral$1;

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
    var end = ( Array.isArray( list ) ? list.length ? list[ list.length - 1 ].range[ 1 ] : 1 : list.range[ 1 ] ) + 1,
        node;
        
    this.consume( '[' );
    
    node = new ArrayExpression( list );
    node.range = [ this.column, end ];
    //console.log( '- RANGE', node.range );
    return node;
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
    var end = this.column + 1,
        args = this.list( '(' ),
        callee, node, start;
        
    this.consume( '(' );
    
    callee = this.expression();
    
    start = this.column;
    //console.log( 'CALL EXPRESSION' );
    //console.log( '- CALLEE', callee );
    //console.log( '- ARGUMENTS', args, args.length );
    node = new CallExpression( callee, args );
    node.range = [ start, end ];
    
    return node;
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
        this.column -= token.length;
        return token;
    }
    
    return undefined;
};

/**
 * @function
 * @returns {Expression} An expression node
 */
Builder.prototype.expression = function(){
    var expression = null,
        list, next, token;
    
    if( next = this.peek() ){
        switch( next.type ){
            case Grammar.Punctuator:
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
                }
                break;
            case Grammar.NullLiteral:
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
                if( next && next.type === Grammar.Punctuator && ( next.value === ')' || next.value === ']' ) ){
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

Builder.prototype.evalExpression = function( terminator ){
    var end = this.column,
        block = [],
        expression, start;
    //console.log( 'EVAL', terminator );
    if( !this.peek( terminator ) ){
        //console.log( '- EXPRESSIONS' );
        do {
            block.unshift( this.consume() );
        } while( !this.peek( terminator ) );
    }
    start = this.column;
    this.consume( terminator );
    expression = new EvalExpression( block );
    expression.range = [ start, end ];
    //console.log( '- EVAL RESULT', expression );
    return expression;
};

/**
 * @function
 * @returns {ExpressionStatement} An expression statement
 */
Builder.prototype.expressionStatement = function(){
    var end = this.column,
        node = this.expression(),
        start = this.column,
        expressionStatement;
    //console.log( 'EXPRESSION STATEMENT WITH', node );
    expressionStatement = new ExpressionStatement( node );
    expressionStatement.range = [ start, end ];
    
    return expressionStatement;
};

/**
 * @function
 * @returns {Identifier} An identifier
 * @throws {SyntaxError} If the token is not an identifier
 */
Builder.prototype.identifier = function(){
    var end = this.column,
        token = this.consume(),
        start = this.column,
        node;
    
    if( !( token.type === Grammar.Identifier ) ){
        this.throwError( 'Identifier expected' );
    }
    
    node = new Identifier$1( token.value );
    node.range = [ start, end ];
    
    return node;
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
        isNumeric = next.type === Grammar.NumericLiteral;
        
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
    var end = this.column,
        token = this.consume(),
        start = this.column,
        node, raw;
    
    raw = token.value;
    
    switch( token.type ){
        case Grammar.NumericLiteral:
            node = new NumericLiteral$1( raw );
            break;
        case Grammar.StringLiteral:
            node = new StringLiteral$1( raw );
            break;
        case Grammar.NullLiteral:
            node = new NullLiteral$1( raw );
            break;
        default:
            this.throwError( 'Literal expected' );
    }
    
    node.range = [ start, end ];
    
    return node;
};

Builder.prototype.lookup = function( next ){
    var expression;
    //console.log( 'LOOKUP', next );
    switch( next.type ){
        case Grammar.Identifier:
            expression = this.identifier();
            break;
        case Grammar.NumericLiteral:
        case Grammar.StringLiteral:
            expression = this.literal();
            break;
        case Grammar.Punctuator:
            if( next.value === '}' ){
                this.consume( '}' );
                expression = this.evalExpression( '{' );
                break;
            }
        default:
            this.throwError( 'token cannot be a lookup' );
    }
    
    next = this.peek();
    
    if( next && next.value === '%' ){
        expression = this.lookupExpression( expression );
    }
    //console.log( '- LOOKUP RESULT', expression );
    return expression;
};

Builder.prototype.lookupExpression = function( key ){
    var end = key.range[ 1 ],
        node, start;
        
    this.consume( '%' );
    
    start = this.column;
    node = new LookupExpression( key );
    node.range = [ start, end ];
    
    return node;
};

/**
 * @function
 * @param {Expression} property The expression assigned to the property of the member expression
 * @param {external:boolean} computed Whether or not the member expression is computed
 * @returns {MemberExpression} The member expression
 */
Builder.prototype.memberExpression = function( property, computed ){
    //console.log( 'MEMBER', property );
    var end = property.range[ 1 ] + ( computed ? 1 : 0 ),
        object = this.expression(),
        start = this.column,
        node;
    //console.log( 'MEMBER EXPRESSION' );
    //console.log( '- OBJECT', object );
    //console.log( '- PROPERTY', property );
    //console.log( '- COMPUTED', computed );
    node = computed ?
        new ComputedMemberExpression( object, property ) :
        new StaticMemberExpression( object, property );
    
    node.range = [ start, end ];
    
    return node;
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
    
    return undefined;
};

/**
 * @function
 * @returns {Program} A program node
 */
Builder.prototype.program = function(){
    var end = this.column,
        body = [],
        node;
    //console.log( 'PROGRAM' );
    while( true ){
        if( this.tokens.length ){
            body.unshift( this.expressionStatement() );
        } else {
            node = new Program( body );
            node.range = [ this.column, end ];
            return node;
        }
    }
};

Builder.prototype.rangeExpression = function( right ){
    var end = right !== null ? right.range[ 1 ] : this.column,
        left, node;
    
    this.expect( '.' );
    this.expect( '.' );
    
    left = this.peek().type === Grammar.NumericLiteral ?
        left = this.literal() :
        null;
    
    node = new RangeExpression( left, right );
    node.range = [ this.column, end ];
    
    return node;
};

Builder.prototype.sequenceExpression = function( list ){
    var end, node;
    
    if( Array.isArray( list ) ){
        end = list[ list.length - 1 ].range[ 1 ];
    } else if( list instanceof RangeExpression ){
        end = list.range[ 1 ];
    }
    
    node = new SequenceExpression( list );
    node.range = [ this.column, end ];
    
    return node;
};

/**
 * @function
 * @param {external:string} message The error message
 * @throws {external:SyntaxError} When it executes
 */
Builder.prototype.throwError = function( message ){
    throw new SyntaxError( message );
};

/**
 * @typedef {external:Function} ForEachCallback
 * @param {*} item
 * @param {external:number} index
 */

/**
 * @function
 * @param {Array-Like} list
 * @param {ForEachCallback} callback
 */
function forEach( list, callback ){
    /*
    var index = 0,
        length = list.length,
        item;
    
    for( ; index < length; index++ ){
        item = list[ index ];
        callback( item, index );
    }
    */
    var index = list.length,
        item;
    
    while( index-- ){
        item = list[ index ];
        callback( item, index );
    }
}

var _hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * @function
 * @param {*} object
 * @param {external:string} property
 */
function hasOwnProperty( object, property ){
    return _hasOwnProperty.call( object, property );
}

var noop = function(){};
var cache$2 = new Null();

/**
 * @function Interceptor~getValue
 * @param {external:Object} scope
 * @param {external:string} name
 * @returns {*} The value of the `name` in `scope`
 */
function getValue( scope, name ){
    return scope[ name ];
}

/**
 * @function Interceptor~setValue
 * @param {external:Object} scope
 * @param {external:string} name
 * @param {*} value
 * @returns {*} The value of the `name` in `scope`
 */
function setValue( scope, name, value ){
    if( !( hasOwnProperty( scope, name ) ) ){
        scope[ name ] = value;
    }
    return scope[ name ];
}

/**
 * @function Interceptor~returnZero
 * @returns {external:number} zero
 */
function returnZero(){
    return 0;
}

/**
 * @class InterpreterError
 * @extends external:SyntaxError
 * @param {external:string} message
 */
function InterpreterError( message ){
    SyntaxError.call( this, message );
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

Interpreter.prototype.arrayExpression = function( elements, context, assign, isRightMost ){
    var interpreter = this,
        isFunction = false,
        defaultValue, element, fn, index, item, list, name, names, result;
    
    // List of elements
    if( Array.isArray( elements ) ){
        if( elements.length === 1 ){
            element = elements[ 0 ];
            
            switch( element.type ){
                case Syntax.Identifier:
                    item = element.name;
                    break;
                case Syntax.Literal:
                    item = element.value;
                    break;
                default:
                    item = interpreter.recurse( element, context, assign );
                    isFunction = true;
                    break;
            }
            
            fn = function getArrayExpression( scope, value, lookup ){
                //console.log( 'Getting ARRAY EXPRESSION' );
                result = [];
                defaultValue = isRightMost ? value : {};
                name = !isFunction ? item : item( scope, value, lookup );
                result[ 0 ] = assign( scope, name, defaultValue );
                //console.log( '- ARRAY EXPRESSION RESULT', result );
                return context ?
                    { value: result } :
                    result;
            };
        } else {
            list = interpreter.recurseList( elements, false, assign );
            
            fn = function getArrayExpressionWithElementList( scope, value, lookup ){
                //console.log( 'Getting ARRAY EXPRESSION' );
                result = [];
                defaultValue = isRightMost ? value : {};
                index = list.length;
                while( index-- ){
                    name = list[ 0 ]( scope, value, lookup );
                    result[ index ] = assign( scope, name, defaultValue );
                }
                //console.log( '- ARRAY EXPRESSION RESULT', result );
                return context ?
                    { value: result } :
                    result;
            };
        }
    // Range of elements
    } else {
        list = interpreter.recurse( elements, false, assign );
        
        fn = function getArrayExpressionWithElementRange( scope, value, lookup ){
            //console.log( 'Getting ARRAY EXPRESSION' );
            result = [];
            defaultValue = isRightMost ? value : {};
            names = list( scope, value, lookup );
            if( names.length === 1 ){
                result[ 0 ] = assign( scope, names[ 0 ], defaultValue );
            } else {
                forEach( names, function( name, index ){
                    result[ index ] = assign( scope, name, defaultValue );
                } );
            }
            //console.log( '- ARRAY EXPRESSION RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    }
    
    return fn;
};

Interpreter.prototype.callExpression = function( callee, args, context, assign ){
    var interpreter = this,
        isSetting = assign === setValue,
        list = interpreter.recurseList( args, false, assign ),
        fn = interpreter.recurse( callee, true, assign );
    
    return function getCallExpression( scope, value, lookup ){
        //console.log( 'Getting CALL EXPRESSION' );
        //console.log( '- CALL FN', fn.name );
        var values = [],
            rhs = fn( scope, value, lookup ),
            result;
        //console.log( '- CALL RHS', rhs );
        if( typeof rhs.value === 'function' ){
            values = [];
            switch( list.length ){
                case 0:
                    break;
                case 1:
                    values[ 0 ] = list[ 0 ]( scope, value, lookup );
                    break;
                default:
                    forEach( list, function( arg, index ){
                        values[ index ] = arg( scope, value, lookup );
                    } );
                    break;
            }
            result = rhs.value.apply( rhs.context, values );
        } else if( isSetting && typeof rhs.value === 'undefined' ){
            throw new Error( 'cannot create call expressions' );
        } else {
            throw new TypeError( 'call expression must be a function' );
        }
        //console.log( '- CALL RESULT', result );
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
        assign, expressions, fn;
    
    if( typeof create !== 'boolean' ){
        create = false;
    }
    
    assign = create ?
        setValue :
        getValue;
    
    /**
     * @member {external:string}
     */
    interpreter.expression = this.builder.text;
    //console.log( '-------------------------------------------------' );
    //console.log( 'Interpreting ', expression );
    //console.log( '-------------------------------------------------' );
    //console.log( 'Program', program.range );
    interpreter.eol = program.range[ 1 ];
    
    switch( body.length ){
        case 0:
            fn = noop;
            break;
        case 1:
            fn = interpreter.recurse( body[ 0 ].expression, false, assign );
            break;
        default:
            expressions = [];
            forEach( body, function( expressionStatement, index ){
                expressions[ index ] = interpreter.recurse( expressionStatement.expression, false, assign );
            } );
            fn = function getProgram( scope, value, lookup ){
                var lastValue;
                
                forEach( expressions, function( expression ){
                    lastValue = expression( scope, value, lookup );
                } );
                
                return lastValue;
            };
            break;
    }
    //console.log( 'FN', fn.name );
    return fn;
};

Interpreter.prototype.computedMemberExpression = function( object, property, context, assign ){
    var interpreter = this,
        isFunction = false,
        isRightMost = property.range[ 1 ] + 1 === interpreter.eol,
        left = interpreter.recurse( object, false, assign ),
        //right = compileNode( interpreter, property, false, assign, isRightMost ),
        defaultValue, fn, lhs, result, rhs, right;
    
    switch( property.type ){
        case Syntax.Identifier:
            rhs = right = property.name;
            break;
        case Syntax.Literal:
            rhs = right = property.value;
            break;
        default:
            right = interpreter.recurse( property, false, assign );
            isFunction = true;
            break;
    }
    
    // Sequence property
    if( property.type === Syntax.SequenceExpression ){
        fn = function getComputedMemberExpressionWithSequenceProperty( scope, value, lookup ){
            //console.log( 'Getting COMPUTED MEMBER' );
            //console.log( '- COMPUTED LEFT', left.name );
            //console.log( '- COMPUTED RIGHT', right.name );
            lhs = left( scope, value, lookup );
            defaultValue = isRightMost ? value : {};
            result = [];
            //console.log( '- COMPUTED LHS', lhs );
            if( typeof lhs !== 'undefined' ){
                if( isFunction ){
                    rhs = right( scope, value, lookup );
                }
                //console.log( '- COMPUTED RHS', rhs );
                if( Array.isArray( rhs ) ){
                    forEach( rhs, function( item, index ){
                        result[ index ] = assign( lhs, item, defaultValue );
                    } );
                    //console.log( '-- LIST|VALUE:LIST', result );
                }
            }
            //console.log( '- COMPUTED RESULT', result );
            return context ?
                { context: lhs, name: rhs, value: result } :
                result;
        };
    // Property
    } else {
        // Array object
        if( object.type === Syntax.ArrayExpression ){
            fn = function getComputedMemberExpressionWithArrayObject( scope, value, lookup ){
                //console.log( 'Getting COMPUTED MEMBER' );
                //console.log( '- COMPUTED LEFT', left.name );
                //console.log( '- COMPUTED RIGHT', right.name );
                lhs = left( scope, value, lookup );
                defaultValue = isRightMost ? value : {};
                //console.log( '- COMPUTED LHS', lhs );
                if( Array.isArray( lhs ) ){
                    if( isFunction ){
                        rhs = right( scope, value, lookup );
                    }
                    //console.log( '- COMPUTED RHS', rhs );
                    if( typeof rhs === 'number' ){
                        result = assign( lhs, rhs, defaultValue );
                    } else {
                        if( lhs.length === 1 ){
                            result = assign( lhs[ 0 ], rhs, defaultValue );
                        } else {
                            result = [];
                            forEach( lhs, function( item, index ){
                                result[ index ] = assign( item, rhs, defaultValue );
                            } );
                        }
                    }
                    //console.log( '-- LIST:VALUE', result );
                }
                //console.log( '- COMPUTED RESULT', result );
                return context ?
                    { context: lhs, name: rhs, value: result } :
                    result;
            };
        // Object
        } else {
            fn = function getComputedMemberExpression( scope, value, lookup ){
                //console.log( 'Getting COMPUTED MEMBER' );
                //console.log( '- COMPUTED LEFT', left.name );
                //console.log( '- COMPUTED RIGHT', right.name );
                lhs = left( scope, value, lookup );
                defaultValue = isRightMost ? value : {};
                //console.log( '- COMPUTED LHS', lhs );
                if( typeof lhs !== 'undefined' ){
                    if( isFunction ){
                        rhs = right( scope, value, lookup );
                    }
                    //console.log( '- COMPUTED RHS', rhs );
                    result = assign( lhs, rhs, defaultValue );
                    //console.log( '-- VALUE:VALUE', result );
                }
                //console.log( '- COMPUTED RESULT', result );
                return context ?
                    { context: lhs, name: rhs, value: result } :
                    result;
            };
        }
    }
    
    return fn;
};

Interpreter.prototype.evalExpression = function( tokens, context, assign ){
    var interpreter = this,
        program = interpreter.builder.build( tokens ),
        expression = interpreter.recurse( program.body[ 0 ].expression, false, assign ),
        result;
    
    return function getEvalExpression( scope, value, lookup ){
        //console.log( 'Getting EVAL' );
        //console.log( '- EVAL LEFT', expression.name );
        result = expression( scope, value, lookup );
        //console.log( '- EVAL RESULT', result );
        return context ?
            { context: scope, name: undefined, value: result } :
            result;
    };
};

Interpreter.prototype.identifier = function( name, context, assign, isRightMost ){
    var defaultValue, result;
    return function getIdentifier( scope, value, lookup ){
        //console.log( 'Getting IDENTIFIER' );
        defaultValue = isRightMost ? value : {};
        if( typeof scope !== 'undefined' ){
            result = assign( scope, name, defaultValue );
        }
        //console.log( '- NAME', name );
        //console.log( '- IDENTIFIER RESULT', result );
        return context ?
            { context: scope, name: name, value: result } :
            result;
    };
};

Interpreter.prototype.literal = function( value, context ){
    return function getLiteral(){
        //console.log( 'Getting LITERAL' );
        //console.log( '- LITERAL RESULT', value );
        return context ?
            { context: undefined, name: undefined, value: value } :
            value;
    };
};

Interpreter.prototype.lookupExpression = function( key, context, assign ){
    var interpreter = this,
        left = interpreter.recurse( key, true, assign ),
        lhs, result;
            
    return function getLookupExpression( scope, value, lookup ){
        //console.log( 'Getting LOOKUP EXPRESSION' );
        //console.log( '- LOOKUP LEFT', left.name );
        lhs = left( lookup, value, scope );
        //console.log( '- LOOKUP LHS', lhs );
        result = typeof lhs.value === 'number' ?
            lookup[ lhs.value ] :
            lhs.value;
        //console.log( '- LOOKUP LHS', lhs );
        //console.log( '- LOOKUP EXPRESSION RESULT', result );
        return context ?
            { value: result } :
            result;
    };
};

Interpreter.prototype.rangeExpression = function( nl, nr, context, assign ){
    var interpreter = this,
        left = nl !== null ?
            interpreter.recurse( nl, false, assign ) :
            returnZero,
        right = nr !== null ?
            interpreter.recurse( nr, false, assign ) :
            returnZero,
        index, lhs, middle, result, rhs;
        
    return function getRangeExpression( scope, value, lookup ){
        //console.log( 'Getting RANGE EXPRESSION' );
        //console.log( '- RANGE LEFT', left.name );
        //console.log( '- RANGE RIGHT', right.name );
        lhs = left( scope, value, lookup );
        rhs = right( scope, value, lookup );
        result = [];
        index = 1;
        //console.log( '- RANGE LHS', lhs );
        //console.log( '- RANGE RHS', rhs );
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
        //console.log( '- RANGE EXPRESSION RESULT', result );
        return context ?
            { value: result } :
            result;
    };
};

/**
 * @function
 */
Interpreter.prototype.recurse = function( node, context, assign ){
    var isRightMost = node.range[ 1 ] === this.eol;
    //console.log( 'Recursing on', node.type );
    switch( node.type ){
        
        case Syntax.ArrayExpression: {
            return this.arrayExpression( node.elements, context, assign, isRightMost );
        }
        
        case Syntax.CallExpression: {
            return this.callExpression( node.callee, node.arguments, context, assign );
        }
        
        case Syntax.EvalExpression: {
            return this.evalExpression( node.body, context, assign );
        }
        
        case Syntax.Identifier: {
            return this.identifier( node.name, context, assign, isRightMost );
        }
        
        case Syntax.Literal: {
            return this.literal( node.value, context );
        }
        
        case Syntax.MemberExpression: {
            return node.computed ?
                this.computedMemberExpression( node.object, node.property, context, assign ) :
                this.staticMemberExpression( node.object, node.property, context, assign );
        }
        
        case Syntax.LookupExpression: {
            return this.lookupExpression( node.key, context, assign );
        }
        
        case Syntax.RangeExpression: {
            return this.rangeExpression( node.left, node.right, context, assign );
        }
        
        case Syntax.SequenceExpression: {
            return this.sequenceExpression( node.expressions, context, assign );
        }
        
        default:
            this.throwError( 'Unknown node type ' + node.type );
    }
};

Interpreter.prototype.recurseList = function( nodes, context, assign ){
    var interpreter = this,
        result = [];
        
    forEach( nodes, function( expression, index ){
        result[ index ] = interpreter.recurse( expression, context, assign );
    } );
    
    return result;
};

Interpreter.prototype.sequenceExpression = function( expressions, context, assign ){
    var interpreter = this,
        fn, list;
    // Expression List
    if( Array.isArray( expressions ) ){
        list = interpreter.recurseList( expressions, false, assign );
        
        fn = function getSequenceExpressionWithExpressionList( scope, value, lookup ){
            //console.log( 'Getting SEQUENCE EXPRESSION' );
            var result = [];
            forEach( list, function( arg, index ){
                result[ index ] = arg( scope );
            } );
            //console.log( '- SEQUENCE RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    // Expression Range
    } else {
        list = interpreter.recurse( expressions, false, assign );
        
        fn = function getSequenceExpressionWithExpressionRange( scope, value, lookup ){
            //console.log( 'Getting SEQUENCE EXPRESSION' );
            var result = list( scope, value, lookup );
            //console.log( '- SEQUENCE RESULT', result );
            return context ?
                { value: result } :
                result;
        };
    }
    
    return fn;
};

Interpreter.prototype.staticMemberExpression = function( object, property, context, assign ){
    var interpreter = this,
        isFunction = false,
        isRightMost = property.range[ 1 ] === interpreter.eol,
        left = interpreter.recurse( object, false, assign ),
        defaultValue, lhs, rhs, result, right;
    
    switch( property.type ){
        case Syntax.Identifier:
            rhs = right = property.name;
            break;
        case Syntax.Literal:
            rhs = right = property.value;
            break;
        default:
            right = interpreter.recurse( property, false, assign );
            isFunction = true;
            break;
    }
    
    return function getStaticMemberExpression( scope, value, lookup ){
        //console.log( 'Getting NON-COMPUTED MEMBER' );
        //console.log( '- NON-COMPUTED LEFT', left.name );
        //console.log( '- NON-COMPUTED RIGHT', right.name || right );
        lhs = left( scope, value, lookup );
        if( isFunction ){
            rhs = right( scope, value, lookup );
        }
        defaultValue = isRightMost ? value : {};
        //console.log( '- NON-COMPUTED LHS', lhs );
        //console.log( '- NON-COMPUTED RHS', rhs );
        if( typeof lhs !== 'undefined' ){
            if( typeof lhs === 'string' ){
                lhs = assign( scope, lhs, defaultValue );
            }
            if( !Array.isArray( lhs ) ){
                result = assign( lhs, rhs, defaultValue );
                //console.log( '-- VALUE:VALUE', result );
            } else {
                if( lhs.length === 1 ){
                    result = assign( lhs[ 0 ], rhs, defaultValue );
                } else {
                    result = [];
                    forEach( lhs, function( item, index ){
                        result[ index ] = assign( item, rhs, defaultValue );
                    } );
                }
                //console.log( '-- LIST:VALUE', result );
            }
        }
        //console.log( '- NON-COMPUTED RESULT', result );
        return context ?
            { context: lhs, name: rhs, value: result } :
            result;
    };
};

Interpreter.prototype.throwError = function( message, ErrorClass ){
    typeof ErrorClass === 'undefined' && ( ErrorClass = InterpreterError );
    throw new ErrorClass( message );
};

var lexer = new Lexer();
var builder = new Builder( lexer );
var intrepreter = new Interpreter( builder );
var cache$1 = {};

/**
 * @class KeyPathExp
 * @extends Null
 * @param {external:string} pattern
 * @param {external:string} flags
 */
function KeyPathExp( pattern, flags ){
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

KeyPathExp.prototype = new Null();

KeyPathExp.prototype.constructor = KeyPathExp;

/**
 * @function
 */
KeyPathExp.prototype.get = function( target, lookup ){
    return this.getter( target, undefined, lookup );
};

/**
 * @function
 */
KeyPathExp.prototype.has = function( target, lookup ){
    var result = this.getter( target, undefined, lookup );
    return typeof result !== 'undefined';
};

/**
 * @function
 */
KeyPathExp.prototype.set = function( target, value, lookup ){
    return this.setter( target, value, lookup );
};

/**
 * @function
 */
KeyPathExp.prototype.toJSON = function(){
    var json = new Null();
    
    json.flags = this.flags;
    json.source = this.source;
    
    return json;
};

/**
 * @function
 */
KeyPathExp.prototype.toString = function(){
    return this.source;
};

var cache = new Null();

/**
 * @typedef {external:Function} KeyPathCallback
 * @param {*} target The object on which the keypath will be executed
 * @param {*} [value] The optional value that will be set at the keypath
 * @returns {*} The value at the end of the keypath or undefined if the value was being set
 */

/**
 * A template literal tag for keypath processing.
 * @function
 * @param {Array<external:string>} literals
 * @param {external:Array} values
 * @returns {KeyPathCallback}
 * @example
 * const object = { foo: { bar: { qux: { baz: 'fuz' } } } },
 *  getBaz = ( target ) => kp`foo.bar.qux.baz`( target );
 * 
 * console.log( getBaz( object ) ); // "fuz"
 */
function kp( literals/*, ...values*/ ){
    var keypath, kpex, values;
    
    if( arguments.length > 1 ){
        var index = 0,
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
        cache[ keypath ] = new KeyPathExp( keypath );
    
    return function( target, value, lookup ){
        return arguments.length > 1 ?
            kpex.set( target, value, lookup ) :
            kpex.get( target, lookup );
    };
}

return kp;

})));

//# sourceMappingURL=kp-umd.js.map