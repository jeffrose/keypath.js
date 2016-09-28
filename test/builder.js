'use strict';

var chai        = require( 'chai' ),
    Builder     = require( '../dist/builder-umd' ),
    Lexer       = require( '../dist/lexer-umd' ),

    expect      = chai.expect;

describe( 'Builder', function(){

    var lexer = new Lexer(),
        builder = new Builder( lexer ),
        expression, program;
    
    it( 'should create builders', function(){
        expect( builder ).to.have.property( 'lexer' );
        expect( builder.lexer ).to.be.instanceOf( Lexer );
        expect( () => new Builder() ).to.throw( TypeError );
    } );
    
    describe( 'builder', function(){
        
        it( 'should build identifiers', function(){
            program = builder.build( 'foo' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'Identifier' );
            expect( expression.name ).to.equal( 'foo' );
        } );
        
        it( 'should build literals', function(){
            program = builder.build( '"foo"' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'Literal' );
            expect( expression.value ).to.equal( 'foo' );
            
            program = builder.build( '123' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'Literal' );
            expect( expression.value ).to.equal( 123 );
        } );
        
        it( 'should build array expressions', function(){
            program = builder.build( '["foo"]' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression ).to.have.property( 'elements' );
            expect( expression.elements[ 0 ].type ).to.equal( 'Literal' );
            expect( expression.elements[ 0 ].value ).to.equal( 'foo' );
            
            program = builder.build( '["foo","bar"]' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression ).to.have.property( 'elements' );
            expect( expression.elements[ 0 ].type ).to.equal( 'Literal' );
            expect( expression.elements[ 0 ].value ).to.equal( 'foo' );
            expect( expression.elements[ 1 ].type ).to.equal( 'Literal' );
            expect( expression.elements[ 1 ].value ).to.equal( 'bar' );
        } );
    
        it( 'should parse call expressions', function(){
            program = builder.build( 'foo()' ),
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'CallExpression' );
            expect( expression.callee.type ).to.equal( 'Identifier' );
            expect( expression.callee.name ).to.equal( 'foo' );
            expect( expression.arguments.length ).to.equal( 0 );
            
            program = builder.build( 'foo(123,456,789)' );
            expression = program.body[ 0 ].expression;
    
            expect( expression.type ).to.equal( 'CallExpression' );
            expect( expression.callee.type ).to.equal( 'Identifier' );
            expect( expression.callee.name ).to.equal( 'foo' );
            expect( expression.arguments.length ).to.equal( 3 );
            expect( expression.arguments[ 0 ].type ).to.equal( 'Literal' );
            expect( expression.arguments[ 0 ].value ).to.equal( 123 );
            expect( expression.arguments[ 1 ].type ).to.equal( 'Literal' );
            expect( expression.arguments[ 1 ].value ).to.equal( 456 );
            expect( expression.arguments[ 2 ].type ).to.equal( 'Literal' );
            expect( expression.arguments[ 2 ].value ).to.equal( 789 );
            
            program = builder.build( 'foo()()' );
            expression = program.body[ 0 ].expression;
            
            
            expect( expression.type ).to.equal( 'CallExpression' );
            expect( expression.callee.type ).to.equal( 'CallExpression' );
            expect( expression.arguments.length ).to.equal( 0 );
            expect( expression.callee.callee.type ).to.equal( 'Identifier' );
            expect( expression.callee.callee.name ).to.equal( 'foo' );
            expect( expression.callee.arguments.length ).to.equal( 0 );
            
            program = builder.build( '()' );
            expression = program.body[ 0 ].expression;
    
            expect( expression.type ).to.equal( 'CallExpression' );
            expect( expression.callee ).to.equal( null );
            expect( expression.arguments.length ).to.equal( 0 );
            
            program = builder.build( '()()' );
            expression = program.body[ 0 ].expression;
    
            expect( expression.type ).to.equal( 'CallExpression' );
            expect( expression.callee.type ).to.equal( 'CallExpression' );
            expect( expression.arguments.length ).to.equal( 0 );
            expect( expression.callee.callee ).to.equal( null );
            expect( expression.callee.arguments.length ).to.equal( 0 );
        } );
    
        it( 'should parse computed member expressions', function(){
            program = builder.build( 'foo[123]' ),
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( true );
            expect( expression.object.type ).to.equal( 'Identifier' );
            expect( expression.object.name ).to.equal( 'foo' );
            
            program = builder.build( 'foo[123][456]' ),
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( true );
            expect( expression.object.type ).to.equal( 'MemberExpression' );
            expect( expression.object.computed ).to.equal( true );
            expect( expression.object.object.type ).to.equal( 'Identifier' );
            expect( expression.object.object.name ).to.equal( 'foo' );
            expect( expression.object.property.type ).to.equal( 'Literal' );
            expect( expression.object.property.value ).to.equal( 123 );
            expect( expression.property.type ).to.equal( 'Literal' );
            expect( expression.property.value ).to.equal( 456 );
            
            program = builder.build( 'foo[123][456,789]' ),
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( true );
            expect( expression.object.type ).to.equal( 'MemberExpression' );
            expect( expression.object.computed ).to.equal( true );
            expect( expression.object.object.type ).to.equal( 'Identifier' );
            expect( expression.object.object.name ).to.equal( 'foo' );
            expect( expression.object.property.type ).to.equal( 'Literal' );
            expect( expression.object.property.value ).to.equal( 123 );
            expect( expression.property.type ).to.equal( 'SequenceExpression' );
            expect( expression.property ).to.have.property( 'expressions' );
            expect( expression.property.expressions[ 0 ].type ).to.equal( 'Literal' );
            expect( expression.property.expressions[ 0 ].value ).to.equal( 456 );
            expect( expression.property.expressions[ 1 ].type ).to.equal( 'Literal' );
            expect( expression.property.expressions[ 1 ].value ).to.equal( 789 );
        } );
        
        it( 'should parse non-computed member expressions', function(){
            program = builder.build( 'foo.bar' ),
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression.object.type ).to.equal( 'Identifier' );
            expect( expression.object.name ).to.equal( 'foo' );
            expect( expression.property.type ).to.equal( 'Identifier' );
            expect( expression.property.name ).to.equal( 'bar' );
        } );
        
        it( 'should parse implied member expressions', function(){
            program = builder.build( 'foo()bar' ),
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            
            program = builder.build( '["foo"]bar' ),
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
        } );
        
        it( 'should not consume non-existent tokens', function(){
            builder.build( 'foo.bar[100]qux(123,"abc")baz' );
            
            expect( builder.expression() ).to.equal( null );
            expect( builder.peek() ).to.equal( undefined );
            expect( builder.peekAt() ).to.equal( undefined );
            expect( () => builder.consume() ).to.throw( SyntaxError );
            expect( () => builder.identifier() ).to.throw( SyntaxError );
            expect( () => builder.literal() ).to.throw( SyntaxError );
        } );
    
    } );
} );