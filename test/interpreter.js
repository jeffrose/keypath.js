'use strict';

var chai             = require( 'chai' ),
    chai_as_promised = require( 'chai-as-promised' ),
    Builder          = require( '../dist/builder-umd' ),
    Interpreter      = require( '../dist/interpreter-umd' ),
    Lexer            = require( '../dist/lexer-umd' ),

    expect           = chai.expect;

chai.use( chai_as_promised );

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
        
        it( 'should interpret identifiers', function(){
                var pattern = 'foo',
                    object = {},
                get, set;
            
            get = interpreter.compile( pattern, false );
            set = interpreter.compile( pattern, true );
            set( object, 123, [] );
            expect( get( object ) ).to.equal( 123 );
        } );
        
        [ 'foo.bar.qux.baz', 'foo["bar"]["qux"]["baz"]', 'foo[1].bar.qux' ].forEach( ( pattern ) => {
            it( `should interpret member expressions (${ pattern })`, function(){
                var object = {},
                    get, set;
                
                get = interpreter.compile( pattern, false );
                set = interpreter.compile( pattern, true );
                set( object, 123 );
                expect( get( object ) ).to.equal( 123 );
            } );
        } );
        
        it( 'should interpret array expressions', function(){
            var data1 = {
                    foo: { qux: { baz: 123 } },
                    bar: { qux: { baz: 456 } }
                },
                data2 = [
                    { qux: { baz: 12 } },
                    { qux: { baz: 34 } },
                    { qux: { baz: 56 } },
                    { qux: { baz: 78 } }
                ],
                data3 = [
                    [ [ 1 ], [ 2 ] ],// 0
                    [ [ 3 ], [ 4 ] ],// 1
                    [ [ 5 ], [ 6 ] ],// 2
                    [ [ 7 ], [ 8 ] ] // 3
                ],
                empty, get, set, result;
            
            get = interpreter.compile( '["foo"]["qux"]["baz"]', false );
            result = get( data1 );
            expect( result ).to.equal( 123 );
            result = undefined;
            
            empty = {};
            set = interpreter.compile( '["foo"]["qux"]["baz"]', true );
            set( empty, 123 );
            expect( data1.foo ).to.deep.equal( empty.foo );
            
            get = interpreter.compile( '["foo","bar"]["qux"]["baz"]', false );
            result = get( data1 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 123 );
            expect( result[ 1 ] ).to.equal( 456 );
            result = undefined;
            
            get = interpreter.compile( '[0,3]["qux"].baz', false );
            //set = interpreter.compile( '[0,3]["qux"].baz', true );
            //set( data2, 123 );
            result = get( data2 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 12 );
            expect( result[ 1 ] ).to.equal( 78 );
            result = undefined;
            
            get = interpreter.compile( '[1,2][1][0]', false );
            result = get( data3 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 4 );
            expect( result[ 1 ] ).to.equal( 6 );
            result = undefined;
        } );
        
        it( 'should interpret sequence expressions', function(){
            var pattern1 = 'foo["baz","qux"]',
                pattern2 = 'foo[0,3]bar',
                data1 = {
                    foo: { baz: 123, qux: 456 }
                },
                data2 = {
                    foo: [
                        { bar: 12 },
                        { bar: 34 },
                        { bar: 56 },
                        { bar: 78 }
                    ]
                },
                get, set, result;
            
            get = interpreter.compile( pattern1, false );
            //set = interpreter.compile( pattern1, true );
            //set( data1, 123 );
            result = get( data1 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 123 );
            expect( result[ 1 ] ).to.equal( 456 );
            //result = undefined;
            
            get = interpreter.compile( pattern2, false );
            //set = interpreter.compile( pattern2, true );
            //set( data2, 456 );
            result = get( data2 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 12 );
            expect( result[ 1 ] ).to.equal( 78 );
            //result = undefined;
        } );
        
        it( 'should interpret call expressions', function(){
            var data = { foo: { bar: { qux: function( value ){ return { baz: value }; } } } },
                fn;
            
            fn = interpreter.compile( 'foo.bar.qux().baz' );
            expect( fn( data ) ).to.be.undefined;
            
            fn = interpreter.compile( 'foo.bar.qux(123)baz' );
            expect( fn( data ) ).to.equal( 123 );
        } );
        
        it( 'should interpret eval expressions', function(){
            var data1 = { foo: { bar: 123 }, qux: { baz: 'bar' } },
                data2 = { foo: { bar: { fuz: 456 } }, qux: { baz: 'bar' } },
                fn, result;
                
            fn = interpreter.compile( 'foo.{qux.baz}', false ),
            result = fn( data1 );
            
            expect( result ).to.equal( 123 );
            
            fn = interpreter.compile( 'foo.{qux.baz}.fuz', false ),
            result = fn( data2 );
            
            expect( result ).to.equal( 456 );
        } );
        
        it( 'should interpret lookup expressions', function(){
            var data = { foo: { bar: 123, qux: 456, baz: 789 } },
                data2 = { foo: function(){
                    return new Promise( function( resolve, reject ){
                        setTimeout( function(){
                            resolve( 999 );
                        }, 5 );
                    } );
                } },
                fn, result;
             
            fn = interpreter.compile( '%0.%1', false ),
            result = fn( data, undefined, [ 'foo', 'qux' ] );
            
            expect( result ).to.equal( 456 );
            
            fn = interpreter.compile( '%f.%b', false ),
            result = fn( data, undefined, { f: 'foo', b: 'baz' } );
            
            expect( result ).to.equal( 789 );
            
            fn = interpreter.compile( 'foo.%{qux.baz}', false ),
            result = fn( data, undefined, { qux: { baz: 'bar' } } );
            
            fn = interpreter.compile( 'foo().then(%success)', false ),
            result = fn( data2, undefined, { success: function( data ){
                return data;
            } } );
            
            expect( result ).to.eventually.equal( 999 );
        } );
        
        it( 'should interpret range expressions', function(){
            var array = [
                    { foo: 12 },
                    { foo: 34 },
                    { foo: 56 },
                    { foo: 78 },
                    { foo: 90 }
                ],
                object = {
                    foo: [
                        12,
                        34,
                        56,
                        78,
                        90
                    ]
                },
                fn, result;
            
            fn = interpreter.compile( '[1..3]foo' );
            result = fn( array );
            expect( result ).to.be.an( 'array' );
            expect( result[ 0 ] ).to.equal( 34 );
            expect( result[ 1 ] ).to.equal( 56 );
            expect( result[ 2 ] ).to.equal( 78 );
            result = undefined;
            
            fn = interpreter.compile( '[..2]foo' );
            result = fn( array );
            expect( result ).to.be.an( 'array' );
            expect( result[ 0 ] ).to.equal( 12 );
            expect( result[ 1 ] ).to.equal( 34 );
            expect( result[ 2 ] ).to.equal( 56 );
            result = undefined;
            
            fn = interpreter.compile( 'foo[1..3]' );
            result = fn( object );
            expect( result ).to.be.an( 'array' );
            expect( result[ 0 ] ).to.equal( 34 );
            expect( result[ 1 ] ).to.equal( 56 );
            expect( result[ 2 ] ).to.equal( 78 );
            result = undefined;
            
            fn = interpreter.compile( 'foo[3..1]' );
            result = fn( object );
            expect( result ).to.be.an( 'array' );
            expect( result[ 0 ] ).to.equal( 78 );
            expect( result[ 1 ] ).to.equal( 56 );
            expect( result[ 2 ] ).to.equal( 34 );
            
            fn = interpreter.compile( 'foo[2..]' );
            result = fn( object );
            expect( result ).to.be.an( 'array' );
            expect( result[ 0 ] ).to.equal( 56 );
            expect( result[ 1 ] ).to.equal( 34 );
            expect( result[ 2 ] ).to.equal( 12 );
        } );
        
    } );
} );