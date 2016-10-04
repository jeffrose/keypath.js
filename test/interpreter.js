'use strict';

var chai        = require( 'chai' ),
    Builder     = require( '../dist/builder-umd' ),
    Interpreter = require( '../dist/interpreter-umd' ),
    Lexer       = require( '../dist/lexer-umd' ),

    expect      = chai.expect;

describe( 'Interpreter', function(){
    
    it( 'should create instances', function(){
        var lexer = new Lexer(),
            builder = new Builder( lexer ),
            interpreter = new Interpreter( builder );
        
        expect( interpreter ).to.be.instanceOf( Interpreter );
        expect( () => new Interpreter() ).to.throw( TypeError );
    } );

    describe( 'interpreter', function(){
        var lexer = new Lexer(),
            builder = new Builder( lexer ),
            interpreter = new Interpreter( builder );
        
        it( 'should interpret empty string', function(){
            var fn = interpreter.compile( '' );
            
            expect( fn ).to.be.a( 'function' );
            expect( fn( {} ) ).to.be.undefined;
        } );
        
        it( 'should interpret member expressions', function(){
            var object = { foo: { bar: { qux: { baz: true } } } },
                array = {
                    foo: [
                        { bar: { qux: 123 } },
                        { bar: { qux: 456 } }
                    ],
                },
                fn;
            
            fn = interpreter.compile( 'foo.bar.qux.baz' );
            expect( fn( object ) ).to.equal( true );
            
            fn = interpreter.compile( 'foo["bar"]["qux"]["baz"]' );
            expect( fn( object ) ).to.equal( true );
            
            fn = interpreter.compile( '["foo"]["bar"]["qux"]["baz"]' );
            expect( fn( object ) ).to.equal( true );
            
            fn = interpreter.compile( 'foo[0].bar.qux' );
            expect( fn( array ) ).to.equal( 123 );
            
            fn = interpreter.compile( 'foo[1].bar.qux' );
            expect( fn( array ) ).to.equal( 456 );
        } );
        
        it( 'should interpret array expressions', function(){
            var data1 = {
                    foo: { qux: { baz: 1 } },
                    bar: { qux: { baz: 2 } }
                },
                data2 = [
                    { qux: { baz: 1 } },
                    { qux: { baz: 2 } },
                    { qux: { baz: 3 } },
                    { qux: { baz: 4 } }
                ],
                fn, result;
            
            fn = interpreter.compile( '["foo","bar"]qux.baz', false );
            result = fn( data1 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 1 );
            expect( result[ 1 ] ).to.equal( 2 );
            result = undefined;
            
            fn = interpreter.compile( '[0,3]["qux"].baz', false );
            result = fn( data2 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 1 );
            expect( result[ 1 ] ).to.equal( 4 );
            result = undefined;
        } );
        
        it( 'should interpret sequence expressions', function(){
            var data1 = {
                    foo: { baz: 1, qux: 2 }
                },
                data2 = {
                    foo: [
                        { bar: 1 },
                        { bar: 2 },
                        { bar: 3 },
                        { bar: 4 }
                    ]
                },
                fn, result;
            
            fn = interpreter.compile( 'foo["baz","qux"]', false );
            result = fn( data1 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 1 );
            expect( result[ 1 ] ).to.equal( 2 );
            result = undefined;
            
            fn = interpreter.compile( 'foo[0,3]bar', false );
            result = fn( data2 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 1 );
            expect( result[ 1 ] ).to.equal( 4 );
            result = undefined;
        } );
        
        it( 'should interpret call expressions', function(){
            var data = { foo: { bar: { qux: function( value ){ return { baz: value }; } } } },
                fn;
            
            fn = interpreter.compile( 'foo.bar.qux().baz' );
            expect( fn( data ) ).to.be.undefined;
            
            fn = interpreter.compile( 'foo.bar.qux(123)baz' );
            expect( fn( data ) ).to.equal( 123 );
        } );
        
    } );
} );