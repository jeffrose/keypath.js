
function ASTError( message ){
    SyntaxError.call( this, message );
    console.log( 'ASTError', message );
}

ASTError.prototype = Object.create( SyntaxError.prototype );

function Node( type ){
    this.type = type;
}

Node.prototype = Object.create( null );

Node.prototype[ Symbol.toStringTag ] = 'Node';

function Program( body ){
    Node.call( this, 'Program' );
    this.body = body;
}

Program.prototype = Object.create( Node.prototype );

Program.prototype[ Symbol.toStringTag ] = 'Program';

function ExpressionStatement( expression ){
    Node.call( this, 'ExpressionStatement' );
    this.expression = expression;
}

ExpressionStatement.prototype = Object.create( Node.prototype );

ExpressionStatement.prototype[ Symbol.toStringTag ] = 'ExpressionStatement';

function CallExpression( callee, args, returnValue ){
    Node.call( this, 'CallExpression' );
    
    this.callee = callee;
    this.args = args;
    this.returnValue = returnValue;
}

CallExpression.prototype = Object.create( Node.prototype );

CallExpression.prototype[ Symbol.toStringTag ] = 'CallExpression';

var id = 0;

function MemberExpression( object, property, computed ){
    Node.call( this, 'MemberExpression' );
    
    this.id = ++id;
    this.object = object;
    this.property = property;
    this.computed = computed || false;
}

MemberExpression.prototype = Object.create( Node.prototype );

MemberExpression.prototype[ Symbol.toStringTag ] = 'MemberExpression';

function Identifier( name ){
    Node.call( this, 'Identifier' );
    this.name = name;
}

Identifier.prototype = Object.create( null );

Identifier.prototype[ Symbol.toStringTag ] = 'Identifier';

function Literal( name ){
    Node.call( this, 'Literal' );
    this.name = name;
}

Literal.prototype = Object.create( null );

Literal.prototype[ Symbol.toStringTag ] = 'Literal';

function Numeric( name ){
    Node.call( this, 'Numeric' );
    this.name = name;
}

Numeric.prototype = Object.create( null );

Numeric.prototype[ Symbol.toStringTag ] = 'Numeric';

function Punctuator( name ){
    Node.call( this, 'Punctuator' );
    this.name = name;
}

Punctuator.prototype = Object.create( null );

Punctuator.prototype[ Symbol.toStringTag ] = 'Punctuator';

export default function AST( lexer ){
    this.lexer = lexer;
}

AST.prototype = Object.create( null );

AST.prototype[ Symbol.toStringTag ] = 'AST';

AST.prototype.constructor = AST;

AST.prototype.args = function(){
    var args = [];
    
    if( this.peek().value !== ')' ){
        do {
            args.push( this.expression() );
        } while( this.expect( ',' ) )
    }
    
    return args;
};

AST.prototype.ast = function( text ){
    this.buffer = text;
    this.tokens = this.lexer.lex( text );
    
    var program = this.program();
    
    if( this.tokens.length ){
        throw new ASTError( `Unexpected token ${ this.tokens[ 0 ] } remaining.` );
    }
    
    return program;
};

AST.prototype.consume = function( expected ){
    if( !this.tokens.length ){
        throw new ASTError( 'Unexpected end of expression' );
    }
    
    var token = this.expect( expected );
    
    if( !token ){
        throw new ASTError( `Unexpected token ${ token.value } consumed` );
    }
    
    return token;
};

AST.prototype.expect = function( first, second, third, fourth ){
    var token = this.peek( first, second, third, fourth );
    
    if( token ){
        this.tokens.shift();
        return token;
    }
    
    return undefined;
};

AST.prototype.expression = function(){
    var expression, next;
        
    if( this.peek().type === 'numeric' ){
        expression = this.numeric();
    } else if( this.peek().type === 'identifier' ){
        expression = this.identifier();
    } else if( this.peek().type === 'literal' ){
        expression = this.literal();
    } else if( this.peek().value === '%' ){
        expression = this.punctuator();
    }
    //foo.bar[100]qux(123,%,"bleh")baz
    while( next = this.expect( '(', '[', '.' ) ){
        if( next.value === '(' ){
            expression = new CallExpression( expression, this.args() );
            this.consume( ')' );
            let returnValue = this.expression();
            expression.returnValue = returnValue;
            console.log( 'Making new CallExpression', expression );
        } else if( next.value === '[' ){
            console.log( 'Making new computed MemberExpression', expression, next.value );
            expression = new MemberExpression( expression, this.expression(), true );
            this.consume( ']' );
        } else if( next.value === '.' ){
            console.log( 'Making new non-computed MemberExpression', expression, next.value );
            expression = new MemberExpression( expression, this.expression(), false );
        } else {
            throw new ASTError( `Unexpected token ${ next.value }` );
        }
        console.log( 'NEXT', next );
    }
    
    console.log( 'RETURNING', expression );
    
    return expression;
    
    /*
    var object, token, expression;
    
    if( this.peek().type === 'numeric' ){
        object = this.numeric();
    } else if( this.peek().type === 'identifier' ){
        object = this.identifier();
    } else if( this.peek().type === 'literal' ){
        object = this.literal();
    } else if( this.peek().value === '%' ){
        object = this.punctuator();
    }
    
    expression = object;
    
    while( ( token = this.expect( '(', '[', '.' ) ) ){
        if( token.value === '(' ){
            console.log( 'Making new CallExpression', object, token.value );
            expression = new CallExpression( object, this.args(), this.expression() );
            this.consume( ')' );
            let returnValue = this.expression();
            expression.returnValue = returnValue;
        } else if( token.value === '[' ){
            console.log( 'Making new computed MemberExpression', object, token.value );
            expression = new MemberExpression( object, this.expression(), true );
            this.consume( ']' );
        } else if( token.value === '.' ){
            console.log( 'Making new non-computed MemberExpression', object, token.value );
            expression = new MemberExpression( object, this.expression(), false );
        } else {
            throw new ASTError( `Unexpected token ${ token.value }` );
        }
    }
    
    console.log( 'expression', expression );
    
    return expression;
    */
};

AST.prototype.expressionStatement = function(){
    console.log( 'RETURNING EXPRESSION STATEMENT' );
    return new ExpressionStatement( this.expression() );
};

AST.prototype.identifier = function(){
    var token = this.consume();
    
    if( !( token.type === 'identifier' ) ){
        throw new ASTError( 'Identifier expected' );
    }
    
    return new Identifier( token.value );
};

AST.prototype.literal = function(){
    var token = this.consume();
    
    if( !( token.type === 'literal' ) ){
        throw new ASTError( 'Literal expected' );
    }
    
    return new Literal( token.value );
};

AST.prototype.numeric = function(){
    var token = this.consume();
    
    if( !( token.type === 'numeric' ) ){
        throw new ASTError( 'Numeric expected' );
    }
    
    return new Numeric( token.value );
};

AST.prototype.peek = function( first, second, third, fourth ){
    if( this.tokens.length ){
        let token = this.tokens[ 0 ],
            value = token.value;
        
        if( value === first || value === second || value === third || value === fourth || !arguments.length || ( !first && !second && !third && !fourth ) ){
            return token;
        }
    }
    
    return undefined;
};

AST.prototype.program = function(){
    var body = [];
    
    while( true ){
        if( this.tokens.length ){
            body.push( this.expressionStatement() );
        } else {
            return new Program( body );
        }
    }
};

AST.prototype.punctuator = function(){
    var token = this.consume();
    
    if( !( token.type === 'punctuator' ) ){
        throw new ASTError( 'Punctuator expected' );
    }
    
    return new Punctuator( token.value );
};