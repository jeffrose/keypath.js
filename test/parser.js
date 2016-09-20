'use strict';

var chai        = require( 'chai' ),
    //sinon       = require( 'sinon' ),
    //sinon_chai  = require( 'sinon-chai' ),
    Parser     = require( '../src/parser' ),
    Lexer       = require( '../src/lexer' ),

    expect      = chai.expect;

//chai.use( sinon_chai );

describe( 'Parser', function(){
    
    it( 'should parse a keypath expression', function(){
        var lexer = new Lexer(),
            parser = new Parser( lexer ),
            fn = parser.parse( 'foo.bar[0].qux(123,"bleh").baz' ),
            object = {
                foo: {
                    bar: []
                }
            };
        
        object.foo.bar[ 0 ] = {
            qux: function(){
                console.log( 'qux', arguments );
                return {
                    baz: 'BAZ'
                };
            }
        };
            
        // foo.bar[0]qux(123,"bleh")baz
        
        expect( fn ).to.be.a( 'function' );
        
        console.log( fn( object ) );
    } );
} );