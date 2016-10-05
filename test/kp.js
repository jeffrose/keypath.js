'use strict';

var chai       = require( 'chai' ),
    kp = require( '../dist/kp-umd' ),

    expect     = chai.expect;

describe( 'kp', function(){
    
    it( 'should be a string tag', function(){
        var data = { foo: { bar: 123, qux: 456, baz: 789 } };
        
        expect( kp`foo.bar`( data ) ).to.equal( 123 );
    } );
} );