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

        it( 'should parse programs', function(){
            program = builder.parse( 'foo' );
            program = builder.parse( 'foo.bar[100]' );
        } );

        'foo foo123'.split( ' ' ).forEach( ( pattern ) => {
            it( `should parse identifiers (${ pattern })`, function(){
                program = builder.parse( pattern );
                expression = program.body[ 0 ].expression;

                expect( expression.type ).to.equal( 'Identifier' );
                expect( expression.name ).to.equal( pattern );
            } );
        } );

        '"foo" 123 null'.split( ' ' ).forEach( ( pattern ) => {
            it( `should parse literals (${ pattern })`, function(){
                program = builder.parse( pattern );
                expression = program.body[ 0 ].expression;

                expect( expression.type ).to.equal( 'Literal' );
                expect( expression.raw ).to.equal( pattern );
            } );
        } );

        it( 'should parse array expressions', function(){
            program = builder.parse( '[]' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression ).to.have.property( 'elements' );
            expect( expression.elements.length ).to.equal( 0 );

            program = builder.parse( '[123]' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression ).to.have.property( 'elements' );
            expect( expression.elements.length ).to.equal( 1 );
            expect( expression.elements[ 0 ].type ).to.equal( 'Literal' );
            expect( expression.elements[ 0 ].value ).to.equal( 123 );

            program = builder.parse( '[123,456]' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression ).to.have.property( 'elements' );
            expect( expression.elements.length ).to.equal( 2 );
            expect( expression.elements[ 0 ].type ).to.equal( 'Literal' );
            expect( expression.elements[ 0 ].value ).to.equal( 123 );
            expect( expression.elements[ 1 ].type ).to.equal( 'Literal' );
            expect( expression.elements[ 1 ].value ).to.equal( 456 );

            program = builder.parse( '["foo"]' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression ).to.have.property( 'elements' );
            expect( expression.elements.length ).to.equal( 1 );
            expect( expression.elements[ 0 ].type ).to.equal( 'Literal' );
            expect( expression.elements[ 0 ].value ).to.equal( 'foo' );

            program = builder.parse( '["foo","bar"]' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression ).to.have.property( 'elements' );
            expect( expression.elements.length ).to.equal( 2 );
            expect( expression.elements[ 0 ].type ).to.equal( 'Literal' );
            expect( expression.elements[ 0 ].value ).to.equal( 'foo' );
            expect( expression.elements[ 1 ].type ).to.equal( 'Literal' );
            expect( expression.elements[ 1 ].value ).to.equal( 'bar' );
        } );

        it( 'should parse call expressions', function(){
            program = builder.parse( '()' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'CallExpression' );
            expect( expression.callee ).to.equal( null );
            expect( expression.arguments.length ).to.equal( 0 );

            program = builder.parse( '()()' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'CallExpression' );
            expect( expression.arguments.length ).to.equal( 0 );
            expect( expression.callee.type ).to.equal( 'CallExpression' );
            expect( expression.callee.callee ).to.equal( null );
            expect( expression.callee.arguments.length ).to.equal( 0 );

            program = builder.parse( 'foo()' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'CallExpression' );
            expect( expression.callee.type ).to.equal( 'Identifier' );
            expect( expression.callee.name ).to.equal( 'foo' );
            expect( expression.arguments.length ).to.equal( 0 );

            program = builder.parse( 'foo(123,456,789)' );
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

            program = builder.parse( 'foo()()' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'CallExpression' );
            expect( expression.arguments.length ).to.equal( 0 );
            expect( expression.callee.type ).to.equal( 'CallExpression' );
            expect( expression.callee.arguments.length ).to.equal( 0 );
            expect( expression.callee.callee.type ).to.equal( 'Identifier' );
            expect( expression.callee.callee.name ).to.equal( 'foo' );
        } );

        it( 'should parse computed member expressions', function(){
            program = builder.parse( 'foo[123]' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( true );
            expect( expression.object.type ).to.equal( 'Identifier' );
            expect( expression.object.name ).to.equal( 'foo' );
            expect( expression.property.type ).to.equal( 'Literal' );
            expect( expression.property.value ).to.equal( 123 );

            program = builder.parse( 'foo[123][456]' ),
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

            program = builder.parse( 'foo["bar"]' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( true );
            expect( expression.object.type ).to.equal( 'Identifier' );
            expect( expression.object.name ).to.equal( 'foo' );
            expect( expression.property.type ).to.equal( 'Literal' );
            expect( expression.property.value ).to.equal( 'bar' );

            program = builder.parse( 'foo[bar]' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( true );
            expect( expression.object.type ).to.equal( 'Identifier' );
            expect( expression.object.name ).to.equal( 'foo' );
            expect( expression.property.type ).to.equal( 'Identifier' );
            expect( expression.property.name ).to.equal( 'bar' );
        } );

        it( 'should parse sequence expressions', function(){
            program = builder.parse( 'foo[123,456]' );
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
        } );

        it( 'should parse range expressions', function(){
            program = builder.parse( '[1..10]' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression.elements.type ).to.equal( 'RangeExpression' );
            expect( expression.elements.left.type ).to.equal( 'Literal' );
            expect( expression.elements.left.value ).to.equal( 1 );
            expect( expression.elements.right.type ).to.equal( 'Literal' );
            expect( expression.elements.right.value ).to.equal( 10 );

            program = builder.parse( '[6..2]' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression.elements.type ).to.equal( 'RangeExpression' );
            expect( expression.elements.left.type ).to.equal( 'Literal' );
            expect( expression.elements.left.value ).to.equal( 6 );
            expect( expression.elements.right.type ).to.equal( 'Literal' );
            expect( expression.elements.right.value ).to.equal( 2 );

            program = builder.parse( '[..3]' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression.elements.type ).to.equal( 'RangeExpression' );
            expect( expression.elements.left ).to.equal( null );
            expect( expression.elements.right.type ).to.equal( 'Literal' );
            expect( expression.elements.right.value ).to.equal( 3 );

            program = builder.parse( '[7..]' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'ArrayExpression' );
            expect( expression.elements.type ).to.equal( 'RangeExpression' );
            expect( expression.elements.left.type ).to.equal( 'Literal' );
            expect( expression.elements.left.value ).to.equal( 7 );
            expect( expression.elements.right ).to.equal( null );
        } );

        it( 'should parse non-computed member expressions', function(){
            program = builder.parse( 'foo.bar' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'Identifier' );
            expect( expression.object.name ).to.equal( 'foo' );
            expect( expression.property.type ).to.equal( 'Identifier' );
            expect( expression.property.name ).to.equal( 'bar' );

            program = builder.parse( '["foo","bar"].qux' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'ArrayExpression' );
            expect( expression.property.type ).to.equal( 'Identifier' );
            expect( expression.property.name ).to.equal( 'qux' );
        } );

        it( 'should parse block expressions', function(){
            program = builder.parse( '{foo.bar}' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'BlockExpression' );

            program = builder.parse( 'foo.{bar.qux}' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );

            program = builder.parse( 'foo[{bar.qux}]' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
        } );

        it( 'should parse lookup expression', function(){
            program = builder.parse( 'foo.%1' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'Identifier' );
            expect( expression.object.name ).to.equal( 'foo' );
            expect( expression.property.type ).to.equal( 'LookupExpression' );
            expect( expression.property.key.type ).to.equal( 'Literal' );
            expect( expression.property.key.value ).to.equal( 1 );

            program = builder.parse( 'foo.%bar' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'Identifier' );
            expect( expression.object.name ).to.equal( 'foo' );
            expect( expression.property.type ).to.equal( 'LookupExpression' );
            expect( expression.property.key.type ).to.equal( 'Identifier' );
            expect( expression.property.key.name ).to.equal( 'bar' );

            program = builder.parse( 'foo[%1]' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( true );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'Identifier' );
            expect( expression.object.name ).to.equal( 'foo' );
            expect( expression.property.type ).to.equal( 'LookupExpression' );
            expect( expression.property.key.type ).to.equal( 'Literal' );
            expect( expression.property.key.value ).to.equal( 1 );

            program = builder.parse( 'foo.%{bar.qux}' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'Identifier' );
            expect( expression.object.name ).to.equal( 'foo' );
            expect( expression.property.type ).to.equal( 'LookupExpression' );
            expect( expression.property.key.type ).to.equal( 'BlockExpression' );
        } );

        it( 'should parse existential expressions', function(){
            program = builder.parse( 'foo?' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'ExistentialExpression' );
            expect( expression ).to.have.property( 'expression' );
            expect( expression.expression.type ).to.equal( 'Identifier' );
            expect( expression.expression.name ).to.equal( 'foo' );

            program = builder.parse( 'foo?.bar' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'ExistentialExpression' );

            program = builder.parse( '["foo"]?["bar"]' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( true );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'ExistentialExpression' );

            program = builder.parse( 'foo()?.bar' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'ExistentialExpression' );

            program = builder.parse( '{foo.bar}?.qux' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'ExistentialExpression' );

            program = builder.parse( '%{foo}?.bar' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'ExistentialExpression' );
        } );

        it( 'should parse implied member expressions', function(){
            program = builder.parse( 'foo()bar' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );

            program = builder.parse( '["foo"]bar' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );

            program = builder.parse( '["foo","bar"]qux' );
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'ArrayExpression' );
            expect( expression.property.type ).to.equal( 'Identifier' );
            expect( expression.property.name ).to.equal( 'qux' );

            program = builder.parse( 'foo?bar' ),
            expression = program.body[ 0 ].expression;

            expect( expression.type ).to.equal( 'MemberExpression' );
            expect( expression.computed ).to.equal( false );
            expect( expression ).to.have.property( 'object' );
            expect( expression ).to.have.property( 'property' );
            expect( expression.object.type ).to.equal( 'ExistentialExpression' )
        } );

        it( 'should not consume non-existent tokens', function(){
            builder.parse( 'foo.bar[100]qux(123,"abc")baz' );

            expect( builder.expression() ).to.equal( null );
            expect( builder.peek() ).to.equal( undefined );
            expect( builder.peekAt() ).to.equal( undefined );
            expect( () => builder.consume() ).to.throw( SyntaxError );
            expect( () => builder.identifier() ).to.throw( SyntaxError );
            expect( () => builder.literal() ).to.throw( SyntaxError );
        } );

        it( 'should parse multiple expression statements', function(){
            program = builder.parse( 'foo;bar' );

            expression = program.body[ 0 ].expression;
            expect( expression.type ).to.equal( 'Identifier' );

            expression = program.body[ 1 ].expression;
            expect( expression.type ).to.equal( 'Identifier' );

            program = builder.parse( 'foo;bar;' );

            expression = program.body[ 0 ].expression;
            expect( expression.type ).to.equal( 'Identifier' );

            expression = program.body[ 1 ].expression;
            expect( expression.type ).to.equal( 'Identifier' );
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
            program = builder.parse( 'foo.bar[100]qux(123,"abc")baz' );

            expect( JSON.stringify( program ) ).to.be.a( 'string' );
        } );
    } );
} );