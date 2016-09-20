'use strict';

import { default as Null } from './null';

let id = 0;

function nextId(){
    return ++id;
}

function toNamedJSON(){
    const json = Node.prototype.toJSON.call( this );
    
    json.name = this.name;
    
    return json;
}

function BuilderError( message ){
    SyntaxError.call( this, message );
    console.log( 'BuilderError', message );
}

BuilderError.prototype = Object.create( SyntaxError.prototype );

BuilderError.prototype.constructor = BuilderError;

function Node( type ){
    this.id = nextId();
    this.type = type;
}

Node.prototype = new Null();

Node.prototype.constructor = Node;

Node.prototype.equals = function( node ){
    return node instanceof Node && this.id === node.id;
};

Node.prototype.is = function( type ){
    return this.type === type;
};

Node.prototype.toJSON = function(){
    const json = new Null();
    
    json.id   = this.id;
    json.type = this.type;
    
    return json;
};

Node.prototype.toString = function(){
    return this.type;
};

Node.prototype.valueOf = function(){
    return this.id;
};

function Program( body ){
    Node.call( this, 'Program' );
    this.body = body;
}

Program.prototype = Object.create( Node.prototype );

Program.prototype.constructor = Program;

Program.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.body = this.body;
    
    return json;
};

function ExpressionStatement( expression ){
    Node.call( this, 'ExpressionStatement' );
    this.expression = expression;
}

ExpressionStatement.prototype = Object.create( Node.prototype );

ExpressionStatement.prototype.constructor = ExpressionStatement;

ExpressionStatement.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.expression = this.expression;
    
    return json;
};

function CallExpression( callee, args ){
    Node.call( this, 'CallExpression' );
    
    this.callee = callee;
    this.args = args;
}

CallExpression.prototype = Object.create( Node.prototype );

CallExpression.prototype.constructor = CallExpression;

CallExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.callee      = this.callee;
    json.args        = this.args;
    
    return json;
};

function MemberExpression( object, property, computed ){
    Node.call( this, 'MemberExpression' );
    
    this.object = object;
    this.property = property;
    this.computed = computed || false;
}

MemberExpression.prototype = Object.create( Node.prototype );

MemberExpression.prototype.constructor = MemberExpression;

MemberExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.object   = this.object;
    json.property = this.property;
    json.computed = this.computed;
    
    return json;
};

function Identifier( name ){
    Node.call( this, 'Identifier' );
    this.name = name;
}

Identifier.prototype = Object.create( Node.prototype );

Identifier.prototype.constructor = Identifier;

Identifier.prototype.toJSON = toNamedJSON;

function Literal( name ){
    Node.call( this, 'Literal' );
    this.name = name;
}

Literal.prototype = Object.create( Node.prototype );

Literal.prototype.constructor = Literal;

Literal.prototype.toJSON = toNamedJSON;

function Numeric( name ){
    Node.call( this, 'Numeric' );
    this.name = name;
}

Numeric.prototype = Object.create( Node.prototype );

Numeric.prototype.constructor = Numeric;

Numeric.prototype.toJSON = toNamedJSON;

function Punctuator( name ){
    Node.call( this, 'Punctuator' );
    this.name = name;
}

Punctuator.prototype = Object.create( Node.prototype );

Punctuator.prototype.constructor = Punctuator;

Punctuator.prototype.toJSON = toNamedJSON;

export default function Builder( lexer ){
    this.lexer = lexer;
}

Builder.prototype = new Null();

Builder.prototype.constructor = Builder;

Builder.prototype.arguments = function(){
    var args = [];
    
    if( this.peek().value !== '(' ){
        do {
            args.push( this.expression() );
        } while( this.expect( ',' ) );
    }
    
    return args;
};

Builder.prototype.build = function( text ){
    this.buffer = text;
    this.tokens = this.lexer.lex( text );
    
    var program = this.program();
    
    if( this.tokens.length ){
        this.throwError( `Unexpected token ${ this.tokens[ 0 ] } remaining` );
    }
    
    return program;
};

Builder.prototype.consume = function( expected ){
    if( !this.tokens.length ){
        this.throwError( 'Unexpected end of expression' );
    }
    
    var token = this.expect( expected );
    
    if( !token ){
        this.throwError( `Unexpected token ${ token.value } consumed` );
    }
    
    return token;
};

Builder.prototype.expect = function( first, second, third, fourth ){
    var token = this.peek( first, second, third, fourth );
    
    if( token ){
        this.tokens.pop();
        return token;
    }
    
    return undefined;
};

// foo.bar[100]qux(123,%,"bleh")baz
// foo.bar.100.qux.123,%,"bleh".baz
Builder.prototype.expression = function(){
    let args, callee, expression, next, object, property;
    
    switch( this.peek().type ){
        case 'identifier':
            expression = this.identifier();
            break;
        case 'literal':
            expression = this.literal();
            break;
        case 'numeric':
            expression = this.numeric();
            break;
        case 'punctuator':
            break;
        default:
            this.throwError( `Unexpected upcoming token ${ this.peek().value }` );
    }
    
    while( next = this.expect( ')', ']', '.' ) ){
        switch( next.value ){
            case '.':
                property = expression;
                object = this.expression();
                expression = new MemberExpression( object, property, false );
                break;
            case ']':
                property = this.numeric();
                this.consume( '[' );
                object = this.expression();
                expression = new MemberExpression( object, property, true );
                break;
            case ')':
                args = this.arguments();
                this.consume( '(' );
                callee = this.expression();
                expression = new CallExpression( callee, args );
                break;
            default:
                this.throwError( `Unexpected token ${ next.value }` );
        }
    }
    
    return expression;
};

Builder.prototype.expressionStatement = function(){
    return new ExpressionStatement( this.expression() );
};

Builder.prototype.identifier = function(){
    var token = this.consume();
    
    if( !( token.type === 'identifier' ) ){
        this.throwError( 'Identifier expected' );
    }
    
    return new Identifier( token.value );
};

Builder.prototype.literal = function(){
    var token = this.consume();
    
    if( !( token.type === 'literal' ) ){
        this.throwError( 'Literal expected' );
    }
    
    return new Literal( token.value );
};

Builder.prototype.numeric = function(){
    var token = this.consume();
    
    if( !( token.type === 'numeric' ) ){
        this.throwError( 'Numeric expected' );
    }
    
    return new Numeric( token.value );
};

Builder.prototype.peek = function( first, second, third, fourth ){
    let length = this.tokens.length;
    if( length ){
        let token = this.tokens[ length - 1 ],
            value = token.value;
        
        if( value === first || value === second || value === third || value === fourth || !arguments.length || ( !first && !second && !third && !fourth ) ){
            return token;
        }
    }
    
    return undefined;
};

Builder.prototype.program = function(){
    var body = [];
    
    while( true ){
        if( this.tokens.length ){
            body.push( this.expressionStatement() );
        } else {
            return new Program( body );
        }
    }
};

Builder.prototype.punctuator = function(){
    var token = this.consume();
    
    if( !( token.type === 'punctuator' ) ){
        throw new BuilderError( 'Punctuator expected' );
    }
    
    return new Punctuator( token.value );
};

Builder.prototype.throwError = function( message ){
    throw new BuilderError( message );
};
