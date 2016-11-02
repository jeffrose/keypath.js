'use strict';

var chai       = require( 'chai' ),
    KeypathExp = require( '../dist/keypath-exp-umd' ),
    transduce  = require( 'transduce' ),

    expect     = chai.expect;

describe( 'KeypathExp', function(){

    it( 'should create instances', function(){
        var kpex = new KeypathExp();

        expect( kpex ).to.be.instanceOf( KeypathExp );
    } );

    describe( 'kpex', function(){
        var kpex;

        afterEach( function(){
            kpex = undefined;
        } );

        beforeEach( function(){

        } );

        it( 'should have functions and proprties', function(){
            kpex = new KeypathExp( 'foo.bar' );

            expect( kpex ).to.have.property( 'source', 'foo.bar' );
            expect( kpex ).to.have.property( 'flags', '' );
            expect( kpex.get ).to.be.a( 'function' );
            expect( kpex.set ).to.be.a( 'function' );
            expect( kpex.toJSON ).to.be.a( 'function' );
            expect( kpex.toString ).to.be.a( 'function' );
        } );

        it( 'should have a JSON representation', function(){
            kpex = new KeypathExp( 'foo.bar' );

            var json = kpex.toJSON();

            expect( json ).to.have.property( 'source', 'foo.bar' );
            expect( json ).to.have.property( 'flags', '' );
        } );

        it( 'should have a string representation', function(){
            kpex = new KeypathExp( 'foo.bar' );

            expect( kpex.toString() ).to.equal( 'foo.bar' );
            expect( '' + kpex ).to.equal( 'foo.bar' );
            expect( String( kpex ) ).to.equal( 'foo.bar' );
        } );

        it( 'should get values', function(){
            kpex = new KeypathExp( 'foo.bar' );

            var data = { foo: { bar: 123, qux: 456, baz: 789 } };

            expect( kpex.get( data ) ).to.equal( 123 );
        } );

        it( 'should set values', function(){
            kpex = new KeypathExp( 'foo.bar' );

            var data = { foo: { qux: 456, baz: 789 } };

            kpex.set( data, 123 );
            expect( kpex.get( data ) ).to.equal( 123 );
        } );

        it( 'should transduce', function(){
            var kpex = new KeypathExp( 'foo?bar' ),
                result = [];

            transduce.into( result, kpex.tr(), [ { foo: { bar: 123 } }, { foo: { bar: 456 } }, { foo: { bar: 789 } } ] );

            expect( result ).to.deep.equal( [ 123, 456, 789 ] );
        } );
    } );
} );