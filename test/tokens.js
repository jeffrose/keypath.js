'use strict';

var chai   = require( 'chai' ),
    Tokens  = require( '../dist/tokens' ),

    expect = chai.expect;

describe( 'Tokens', function(){
    var tokens;

    afterEach( function(){
        tokens = undefined;
    } );

    it( 'should tokenize identifiers', function(){
        tokens = new Tokens( 'abc' );

        expect( tokens ).to.have.lengthOf( 1 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'Identifier' );
        expect( tokens[ 0 ] ).to.have.property( 'value', 'abc' );

        tokens = new Tokens( 'abc123' );

        expect( tokens ).to.have.lengthOf( 1 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'Identifier' );
        expect( tokens[ 0 ] ).to.have.property( 'value', 'abc123' );
    } );

    it( 'should tokenize literals', function(){
        tokens = new Tokens( '123' );

        expect( tokens ).to.have.lengthOf( 1 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'Numeric' );
        expect( tokens[ 0 ] ).to.have.property( 'value', '123' );

        tokens = new Tokens( '"abc"' );

        expect( tokens ).to.have.lengthOf( 1 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'String' );
        expect( tokens[ 0 ] ).to.have.property( 'value', '"abc"' );

        tokens = new Tokens( "'abc'" );

        expect( tokens ).to.have.lengthOf( 1 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'String' );
        expect( tokens[ 0 ] ).to.have.property( 'value', "'abc'" );

        tokens = new Tokens( "null" );

        expect( tokens ).to.have.lengthOf( 1 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'Null' );
        expect( tokens[ 0 ] ).to.have.property( 'value', "null" );

        tokens = new Tokens( '"abc""def"' );

        expect( tokens ).to.have.lengthOf( 2 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'String' );
        expect( tokens[ 0 ] ).to.have.property( 'value', '"abc"' );
        expect( tokens[ 1 ] ).to.have.property( 'type', 'String' );
        expect( tokens[ 1 ] ).to.have.property( 'value', '"def"' );

        tokens = new Tokens( '"abc"123' );

        expect( tokens ).to.have.lengthOf( 2 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'String' );
        expect( tokens[ 0 ] ).to.have.property( 'value', '"abc"' );
        expect( tokens[ 1 ] ).to.have.property( 'type', 'Numeric' );
        expect( tokens[ 1 ] ).to.have.property( 'value', '123' );
    } );

    it( 'should tokenize punctuators', function(){
        tokens = new Tokens( '.,[]()%?' );

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
        expect( () => new Tokens( '!' ) ).to.throw( SyntaxError );
        expect( () => new Tokens( '@' ) ).to.throw( SyntaxError );
        expect( () => new Tokens( '#' ) ).to.throw( SyntaxError );
        expect( () => new Tokens( '^' ) ).to.throw( SyntaxError );
        expect( () => new Tokens( '&' ) ).to.throw( SyntaxError );
        expect( () => new Tokens( '*' ) ).to.throw( SyntaxError );
        expect( () => new Tokens( '<' ) ).to.throw( SyntaxError );
        expect( () => new Tokens( '>' ) ).to.throw( SyntaxError );
    } );

    it( 'should ignore whitespace', function(){
        tokens = new Tokens( ' ' );

        expect( tokens ).to.have.lengthOf( 0 );

        tokens = new Tokens( ' abc def ' );

        expect( tokens ).to.have.lengthOf( 2 );
        expect( tokens[ 0 ] ).to.have.property( 'type', 'Identifier' );
        expect( tokens[ 0 ] ).to.have.property( 'value', 'abc' );
        expect( tokens[ 1 ] ).to.have.property( 'type', 'Identifier' );
        expect( tokens[ 1 ] ).to.have.property( 'value', 'def' );
    } );

    it( 'should provide a JSON representation', function(){
        tokens = new Tokens( 'abc' );

        const json = tokens.toJSON();

        expect( json ).to.have.property( 'source', 'abc' );
        expect( json ).to.have.property( '0' );
    } );
} );