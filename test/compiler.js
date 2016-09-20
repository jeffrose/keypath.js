'use strict';

var chai        = require( 'chai' ),
    //sinon       = require( 'sinon' ),
    //sinon_chai  = require( 'sinon-chai' ),
    Builder     = require( '../src/builder' ),
    Compiler     = require( '../src/compiler' ),
    Lexer       = require( '../src/lexer' ),

    expect      = chai.expect;

//chai.use( sinon_chai );

describe( 'Compiler', function(){
    
    it( 'should compile an AST', function(){
        var lexer = new Lexer(),
            builder = new Builder( lexer ),
            compiler = new Compiler( builder ),
            fn = compiler.compile( 'foo.bar[100].qux(123,"bleh").baz' );
            
        // foo.bar[100]qux(123,"bleh")baz
        
        expect( fn ).to.be.a( 'function' );
        
    } );
} );