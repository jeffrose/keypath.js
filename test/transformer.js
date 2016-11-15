'use strict';

var chai       = require( 'chai' ),
    keypath = require( '../dist/transformer' ),
    transduce  = require( 'transduce' ),

    expect     = chai.expect;

describe( 'keypath', function(){

    it( 'should transduce', function(){
        var result = [];

        transduce.into( result, keypath( 'foo?bar' ), [ { foo: { bar: 123 } }, { foo: { bar: 456 } }, { foo: { bar: 789 } } ] );

        expect( result ).to.deep.equal( [ 123, 456, 789 ] );
    } );
} );