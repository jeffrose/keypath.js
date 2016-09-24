'use strict';

var chai       = require( 'chai' ),
    KeyPathExp = require( '../src/keypath' ),

    expect     = chai.expect;

describe( 'KeyPathExp', function(){
    
    it( 'should compile an AST', function(){
        var kpex = new KeyPathExp( 'foo.bar[0]baz' ),
            empty = {};
            
        // foo.bar[0]qux(123,"bleh")baz
        
        kpex.set( empty, 'FUZ' );
        console.log( 'EMPTY', empty );
        console.log( 'GET', kpex.get( empty ) );
    } );
} );