'use strict';

var chai        = require( 'chai' ),
    Builder     = require( '../dist/builder-umd' ),
    Lexer       = require( '../dist/lexer-umd' ),

    expect      = chai.expect;

describe( 'Builder', function(){
    var builder, expression, lexer, program;
    
    it( 'should create builders', function(){
        lexer = new Lexer();
        builder = new Builder( lexer );
        
        expect( builder ).to.have.property( 'lexer' );
        expect( builder.lexer ).to.be.instanceOf( Lexer );
        expect( function(){ var b = new Builder(); b.lex( '' ); } ).to.throw( Error );
    } );
    
    describe( 'builder', function(){
        
        beforeEach( function(){
            lexer = new Lexer();
            builder = new Builder( lexer );
        } );
        
        afterEach( function(){
            lexer = builder = expression = program = undefined;
        } );
        
        it( 'should build programs', function(){
            program = builder.build( 'foo' );
            expect( program.range ).to.deep.equal( [ 0, 3 ] );
            
            program = builder.build( 'foo.bar[100]' );
            expect( program.range ).to.deep.equal( [ 0, 12 ] );
        } );
        
        it( 'should build identifiers', function(){
            program = builder.build( 'foo' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'Identifier' );
            expect( expression.name ).to.equal( 'foo' );
            expect( expression.range ).to.deep.equal( [ 0, 3 ] );
        } );
        
        it( 'should build literals', function(){
            program = builder.build( '"foo"' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'Literal' );
            expect( expression.value ).to.equal( 'foo' );
            expect( expression.range ).to.deep.equal( [ 0, 5 ] );
            
            program = builder.build( '123' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'Literal' );
            expect( expression.value ).to.equal( 123 );
            expect( expression.range ).to.deep.equal( [ 0, 3 ] );
        } );
        
        it( 'should build array expressions', function(){
            program = builder.build( '[]' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression ).to.have.property( 'elements' );
            expect( expression.elements.length ).to.equal( 0 );
            expect( expression.range ).to.deep.equal( [ 0, 2 ] );
            
            program = builder.build( '["foo"]' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression ).to.have.property( 'elements' );
            expect( expression.elements[ 0 ].type ).to.equal( 'Literal' );
            expect( expression.elements[ 0 ].value ).to.equal( 'foo' );
            expect( expression.range ).to.deep.equal( [ 0, 7 ] );
            
            program = builder.build( '["foo","bar"]' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression ).to.have.property( 'elements' );
            expect( expression.elements[ 0 ].type ).to.equal( 'Literal' );
            expect( expression.elements[ 0 ].value ).to.equal( 'foo' );
            expect( expression.elements[ 1 ].type ).to.equal( 'Literal' );
            expect( expression.elements[ 1 ].value ).to.equal( 'bar' );
            expect( expression.range ).to.deep.equal( [ 0, 13 ] );
        } );
    
        it( 'should parse call expressions', function(){
            program = builder.build( 'foo()' ),
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'CallExpression' );
            expect( expression.callee.type ).to.equal( 'Identifier' );
            expect( expression.callee.name ).to.equal( 'foo' );
            expect( expression.arguments.length ).to.equal( 0 );
            expect( expression.range ).to.deep.equal( [ 0, 5 ] );
            
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
            expect( expression.range ).to.deep.equal( [ 0, 16 ] );
            
            program = builder.build( 'foo()()' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'CallExpression' );
            expect( expression.arguments.length ).to.equal( 0 );
            expect( expression.callee.type ).to.equal( 'CallExpression' );
            expect( expression.callee.arguments.length ).to.equal( 0 );
            expect( expression.callee.callee.type ).to.equal( 'Identifier' );
            expect( expression.callee.callee.name ).to.equal( 'foo' );
            expect( expression.range ).to.deep.equal( [ 0, 7 ] );
            
            program = builder.build( '()' );
            expression = program.body[ 0 ].expression;
    
            expect( expression.type ).to.equal( 'CallExpression' );
            expect( expression.callee ).to.equal( null );
            expect( expression.arguments.length ).to.equal( 0 );
            expect( expression.range ).to.deep.equal( [ 0, 2 ] );
            
            program = builder.build( '()()' );
            expression = program.body[ 0 ].expression;
    
            expect( expression.type ).to.equal( 'CallExpression' );
            expect( expression.arguments.length ).to.equal( 0 );
            expect( expression.callee.type ).to.equal( 'CallExpression' );
            expect( expression.callee.callee ).to.equal( null );
            expect( expression.callee.arguments.length ).to.equal( 0 );
            expect( expression.range ).to.deep.equal( [ 0, 4 ] );
        } );
    
        it( 'should parse computed member expressions', function(){
            program = builder.build( 'foo[123]' ),
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( true );
            expect( expression.object.type ).to.equal( 'Identifier' );
            expect( expression.object.name ).to.equal( 'foo' );
            expect( expression.property.type ).to.equal( 'Literal' );
            expect( expression.property.value ).to.equal( 123 );
            expect( expression.range ).to.deep.equal( [ 0, 8 ] );
            
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
            expect( expression.range ).to.deep.equal( [ 0, 13 ] );
        } );
        
        it( 'should build sequence expressions', function(){
            program = builder.build( 'foo[123,456]' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( true );
            expect( expression.object.type ).to.equal( 'Identifier' );
            expect( expression.object.name ).to.equal( 'foo' );
            expect( expression.property.type ).to.equal( 'SequenceExpression' );
            expect( expression.property ).to.have.property( 'expressions' );
            expect( expression.property.expressions[ 0 ].type ).to.equal( 'Literal' );
            expect( expression.property.expressions[ 0 ].value ).to.equal( 123 );
            expect( expression.property.expressions[ 1 ].type ).to.equal( 'Literal' );
            expect( expression.property.expressions[ 1 ].value ).to.equal( 456 );
            expect( expression.property.range ).to.deep.equal( [ 4, 11 ] );
        } );
        
        it( 'should parse non-computed member expressions', function(){
            program = builder.build( 'foo.bar' ),
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'Identifier' );
            expect( expression.object.name ).to.equal( 'foo' );
            expect( expression.property.type ).to.equal( 'Identifier' );
            expect( expression.property.name ).to.equal( 'bar' );
            expect( expression.range ).to.deep.equal( [ 0, 7 ] );
            
            program = builder.build( '["foo","bar"].qux' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'ArrayExpression' );
            expect( expression.property.type ).to.equal( 'Identifier' );
            expect( expression.property.name ).to.equal( 'qux' );
            expect( expression.range ).to.deep.equal( [ 0, 17 ] );
        } );
        
        it( 'should parse implied member expressions', function(){
            program = builder.build( 'foo()bar' ),
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression.range ).to.deep.equal( [ 0, 8 ] );
            
            program = builder.build( '["foo"]bar' ),
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression.range ).to.deep.equal( [ 0, 10 ] );
            
            program = builder.build( '["foo","bar"]qux' );
            expression = program.body[ 0 ].expression;
            
            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'ArrayExpression' );
            expect( expression.property.type ).to.equal( 'Identifier' );
            expect( expression.property.name ).to.equal( 'qux' );
            expect( expression.range ).to.deep.equal( [ 0, 16 ] );
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
    
    describe( 'AST', function(){
        beforeEach( function(){
            lexer = new Lexer();
            builder = new Builder( lexer );
        } );
        
        afterEach( function(){
            lexer = builder = expression = program = undefined;
        } );
        
        it( 'should provide a JSON reprsentation', function(){
            program = builder.build( 'foo.bar[100]qux(123,"abc")baz' );
            
            expect( JSON.stringify( program ) ).to.be.a( 'string' );
        } );
    } );
} );