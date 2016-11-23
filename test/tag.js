'use strict';

var chai = require( 'chai' ),
    kp = require( '../dist/tag' ),

    expect = chai.expect;

describe( 'kp', function(){
    var data = { foo: { bar: 123, qux: 456, baz: 789 } };

    it( 'should work as a string tag', function(){
        var foo = 'foo', bar = 'bar';
        expect( kp`foo.bar`.get( data ) ).to.equal( 123 );
        expect( kp`foo.qux`.get( data ) ).to.equal( 456 );
        expect( kp`foo.baz`.get( data ) ).to.equal( 789 );
        expect( kp`${ foo }.${ bar }`.get( data ) ).to.equal( 123 );
    } );

} );