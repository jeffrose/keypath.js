'use strict';

var chai   = require( 'chai' ),
    Lexer  = require( '../dist/lexer' ),

    expect = chai.expect;

describe( 'Lexer', function(){
    var lexer = new Lexer(),
        tokens;

    afterEach( function(){
        tokens = undefined;
    } );

    it( 'should lex identifiers', function(){
        tokens = lexer.lex( 'abc' );

        expect( tokens ).to.be.an( 'array' );
        expect( tokens ).to.have.lengthOf( 1 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'Identifier' );
        expect( tokens[ 0 ] ).to.have.property( 'value', 'abc' );

        tokens = lexer.lex( 'abc123' );

        expect( tokens ).to.be.an( 'array' );
        expect( tokens ).to.have.lengthOf( 1 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'Identifier' );
        expect( tokens[ 0 ] ).to.have.property( 'value', 'abc123' );
    } );

    it( 'should lex literals', function(){
        tokens = lexer.lex( '123' );

        expect( tokens ).to.be.an( 'array' );
        expect( tokens ).to.have.lengthOf( 1 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'Numeric' );
        expect( tokens[ 0 ] ).to.have.property( 'value', '123' );

        tokens = lexer.lex( '"abc"' );

        expect( tokens ).to.be.an( 'array' );
        expect( tokens ).to.have.lengthOf( 1 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'String' );
        expect( tokens[ 0 ] ).to.have.property( 'value', '"abc"' );

        tokens = lexer.lex( "'abc'" );

        expect( tokens ).to.be.an( 'array' );
        expect( tokens ).to.have.lengthOf( 1 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'String' );
        expect( tokens[ 0 ] ).to.have.property( 'value', "'abc'" );

        tokens = lexer.lex( "null" );

        expect( tokens ).to.be.an( 'array' );
        expect( tokens ).to.have.lengthOf( 1 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'Null' );
        expect( tokens[ 0 ] ).to.have.property( 'value', "null" );

        tokens = lexer.lex( '"abc""def"' );

        expect( tokens ).to.be.an( 'array' );
        expect( tokens ).to.have.lengthOf( 2 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'String' );
        expect( tokens[ 0 ] ).to.have.property( 'value', '"abc"' );
        expect( tokens[ 1 ] ).to.have.property( 'type', 'String' );
        expect( tokens[ 1 ] ).to.have.property( 'value', '"def"' );

        tokens = lexer.lex( '"abc"123' );

        expect( tokens ).to.be.an( 'array' );
        expect( tokens ).to.have.lengthOf( 2 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'String' );
        expect( tokens[ 0 ] ).to.have.property( 'value', '"abc"' );
        expect( tokens[ 1 ] ).to.have.property( 'type', 'Numeric' );
        expect( tokens[ 1 ] ).to.have.property( 'value', '123' );
    } );

    it( 'should lex punctuators', function(){
        tokens = lexer.lex( '.,[]()%?' );

        expect( tokens ).to.be.an( 'array' );
        expect( tokens ).to.have.lengthOf( 8 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'Punctuator' );
        expect( tokens[ 0 ] ).to.have.property( 'value', '.' );
        expect( tokens[ 1 ] ).to.have.property( 'type', 'Punctuator' );
        expect( tokens[ 1 ] ).to.have.property( 'value', ',' );
        expect( tokens[ 2 ] ).to.have.property( 'type', 'Punctuator' );
        expect( tokens[ 2 ] ).to.have.property( 'value', '[' );
        expect( tokens[ 3 ] ).to.have.property( 'type', 'Punctuator' );
        expect( tokens[ 3 ] ).to.have.property( 'value', ']' );
        expect( tokens[ 4 ] ).to.have.property( 'type', 'Punctuator' );
        expect( tokens[ 4 ] ).to.have.property( 'value', '(' );
        expect( tokens[ 5 ] ).to.have.property( 'type', 'Punctuator' );
        expect( tokens[ 5 ] ).to.have.property( 'value', ')' );
        expect( tokens[ 6 ] ).to.have.property( 'type', 'Punctuator' );
        expect( tokens[ 6 ] ).to.have.property( 'value', '%' );
        expect( tokens[ 7 ] ).to.have.property( 'type', 'Punctuator' );
        expect( tokens[ 7 ] ).to.have.property( 'value', '?' );
    } );

    it( 'should not permit invalid characters', function(){
        expect( () => lexer.lex( '!' ) ).to.throw( SyntaxError );
        expect( () => lexer.lex( '@' ) ).to.throw( SyntaxError );
        expect( () => lexer.lex( '#' ) ).to.throw( SyntaxError );
        expect( () => lexer.lex( '^' ) ).to.throw( SyntaxError );
        expect( () => lexer.lex( '&' ) ).to.throw( SyntaxError );
        expect( () => lexer.lex( '*' ) ).to.throw( SyntaxError );
        expect( () => lexer.lex( '<' ) ).to.throw( SyntaxError );
        expect( () => lexer.lex( '>' ) ).to.throw( SyntaxError );
    } );

    it( 'should ignore whitespace', function(){
        tokens = lexer.lex( ' ' );

        expect( tokens ).to.be.an( 'array' );
        expect( tokens ).to.have.lengthOf( 0 );

        tokens = lexer.lex( ' abc def ' );

        expect( tokens ).to.be.an( 'array' );
        expect( tokens ).to.have.lengthOf( 2 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'Identifier' );
        expect( tokens[ 0 ] ).to.have.property( 'value', 'abc' );
        expect( tokens[ 1 ] ).to.have.property( 'type', 'Identifier' );
        expect( tokens[ 1 ] ).to.have.property( 'value', 'def' );
    } );

    it( 'should provide a JSON representation', function(){
        tokens = lexer.lex( 'abc' );

        const json = lexer.toJSON();

        expect( json ).to.have.property( 'tokens' );
    } );

    it( 'should provide a string representation', function(){
        tokens = lexer.lex( 'abc' );

        const string = lexer.toString();

        expect( string ).to.equal( 'abc' );
    } );
} );