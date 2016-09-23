'use strict';

var chai        = require( 'chai' ),
    Builder     = require( '../src/builder' ),
    Interpreter     = require( '../src/interpreter' ),
    Lexer       = require( '../src/lexer' ),

    expect      = chai.expect;

describe( 'Interpreter', function(){
    
    it( 'should compile an AST', function(){
        var lexer = new Lexer(),
            builder = new Builder( lexer ),
            interpreter = new Interpreter( builder ),
            fn = interpreter.compile( 'foo.bar[0]qux(123,"bleh")baz' ),
            object = {
                foo: {
                    bar: [
                        {
                            qux: function(){
                                console.log( 'qux', arguments );
                                return {
                                    baz: 'BAZ'
                                };
                            }
                        }
                    ]
                }
            };
            
        // foo.bar[0]qux(123,"bleh")baz
        
        expect( fn ).to.be.a( 'function' );
        
        console.log( fn( object ) );
    } );
} );