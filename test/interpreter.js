'use strict';

var chai             = require( 'chai' ),
    chai_as_promised = require( 'chai-as-promised' ),
    Builder          = require( '../dist/builder' ),
    Interpreter      = require( '../dist/interpreter' ),
    Lexer            = require( '../dist/lexer' ),

    expect           = chai.expect;

chai.use( chai_as_promised );

describe( 'Interpreter', function(){

    it( 'should create instances', function(){
        var lexer = new Lexer(),
            builder = new Builder( lexer ),
            interpreter = new Interpreter( builder );

        expect( interpreter ).to.be.instanceOf( Interpreter );
        expect( () => new Interpreter() ).to.throw( Error );
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
                empty = {},
                object = { foo: 123 },
                get = interpreter.compile( pattern, false ),
                set = interpreter.compile( pattern, true );

            expect( get( object ) ).to.equal( 123 );
            expect( get( empty ) ).to.be.undefined;
            expect( () => get( void 0 ) ).to.throw( TypeError );

            set( empty, 123 );
            expect( empty ).to.deep.equal( object );
        } );

        [ 'foo.bar.qux', 'foo.bar["qux"]', 'foo["bar"]["qux"]' ].forEach( ( pattern ) => {
            it( `should interpret member expressions (${ pattern })`, function(){
                var object = {
                        foo: {
                            bar: {
                                qux: 123
                            }
                        }
                    },
                    empty = {},
                    get = interpreter.compile( pattern, false ),
                    set = interpreter.compile( pattern, true );
                expect( get( object ) ).to.equal( 123 );
                expect( () => get( empty ) ).to.throw( TypeError );
                expect( () => get( { foo: void 0 } ) ).to.throw( TypeError );
                expect( () => get( { foo: { bar: void 0 } } ) ).to.throw( TypeError );
                set( empty, 123 );
                expect( empty ).to.deep.equal( object );
            } );
        } );

        it( 'should interpret array expressions', function(){
            var data1 = {
                    foo: { baz: { fuz: 123 } },
                    bar: { baz: { fuz: 123 } },
                    qux: { baz: { fuz: 123 } }
                },
                data2 = [
                    { qux: { baz: 123 } },
                    { qux: { baz: 123 } },
                    { qux: { baz: 123 } },
                    { qux: { baz: 123 } }
                ],
                data3 = [
                    [ [ 1 ], [ 2 ] ],// 0
                    [ [ 3 ], [ 4 ] ],// 1
                    [ [ 5 ], [ 6 ] ],// 2
                    [ [ 7 ], [ 8 ] ] // 3
                ],
                empty = {},
                get, set, result;

            get = interpreter.compile( '["foo"]["baz"]["fuz"]', false );
            set = interpreter.compile( '["foo"]["baz"]["fuz"]', true );
            result = get( data1 );
            expect( result ).to.equal( 123 );
            set( empty, 123 );
            expect( empty.foo ).to.deep.equal( data1.foo );
            empty = {};
            result = void 0;

            get = interpreter.compile( '["foo","bar"]["baz"]["fuz"]', false );
            set = interpreter.compile( '["foo","bar"]["baz"]["fuz"]', true );
            result = get( data1 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 123 );
            expect( result[ 1 ] ).to.equal( 123 );
            set( empty, 123 );
            expect( empty.foo ).to.deep.equal( data1.foo );
            expect( empty.bar ).to.deep.equal( data1.bar );
            empty = {};
            result = void 0;

            get = interpreter.compile( '[0,3]["qux"].baz', false );
            set = interpreter.compile( '[0,3]["qux"].baz', true );
            result = get( data2 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 123 );
            expect( result[ 1 ] ).to.equal( 123 );
            set( empty, 123 );
            expect( empty[ 0 ] ).to.deep.equal( data2[ 0 ] );
            expect( empty[ 3 ] ).to.deep.equal( data2[ 3 ] );
            empty = {};
            result = void 0;

            get = interpreter.compile( '[1,2][1][0]', false );
            set = interpreter.compile( '[1,2][1][0]', true );
            result = get( data3 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 4 );
            expect( result[ 1 ] ).to.equal( 6 );
        } );

        it( 'should interpret sequence expressions', function(){
            var data1 = {
                    foo: { baz: 123, qux: 456 },
                    bar: { baz: 123, qux: 456 }
                },
                data2 = {
                    foo: [
                        { bar: 12 },
                        { bar: 34 },
                        { bar: 56 },
                        { bar: 78 }
                    ]
                },
                get, result;

            get = interpreter.compile( 'foo["baz","qux"]', false );
            result = get( data1 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 123 );
            expect( result[ 1 ] ).to.equal( 456 );
            result = void 0;

            get = interpreter.compile( 'foo[0,3]bar', false );
            result = get( data2 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.equal( 12 );
            expect( result[ 1 ] ).to.equal( 78 );
            result = void 0;

            get = interpreter.compile( '["foo","bar"]["qux","baz"]', false );
            result = get( data1 );
            expect( result ).to.instanceOf( Array );
            expect( result[ 0 ] ).to.instanceOf( Array );
            expect( result[ 1 ] ).to.instanceOf( Array );
            expect( result[ 0 ][ 0 ] ).to.equal( 456 );
            expect( result[ 1 ][ 0 ] ).to.equal( 456 );
            expect( result[ 0 ][ 1 ] ).to.equal( 123 );
            expect( result[ 1 ][ 1 ] ).to.equal( 123 );
            result = void 0;
        } );

        it( 'should interpret call expressions', function(){
            var data = { foo: { bar: {
                    qux: function( value ){ return { baz: value }; },
                    fuz: [ 123, 456, 789 ]
                } } },
                fn;

            fn = interpreter.compile( 'foo.bar.qux().baz' );
            expect( fn( data ) ).to.be.undefined;

            fn = interpreter.compile( 'foo.bar.qux(123)baz' );
            expect( fn( data ) ).to.equal( 123 );

            fn = interpreter.compile( 'foo.bar.fuz.pop()' );
            expect( fn( data ) ).to.equal( 789 );

            expect( () => fn( { foo: void 0 } ) ).to.throw( Error );
            expect( () => fn( { foo: { bar: void 0 } } ) ).to.throw( Error );
        } );

        it( 'should interpret block expressions', function(){
            var data1 = { foo: { bar: 123, baz: 'bar' }, qux: { baz: 'bar' } },
                data2 = { foo: { bar: { fuz: 456 } }, qux: { baz: 'bar' } },
                fn, result;

            fn = interpreter.compile( 'foo.{baz}', false ),
            result = fn( data1 );

            expect( result ).to.equal( 123 );

            //expect( () => fn( { foo: void 0 } ) ).to.throw( Error );
            //expect( () => fn( { foo: { qux: void 0 } } ) ).to.throw( Error );
        } );

        it( 'should interpret root expressions', function(){
            var data1 = { foo: { bar: 123 }, qux: { baz: 'bar' }, baz: 'bar' },
                fn, result;

            fn = interpreter.compile( 'foo.~baz', false ),
            result = fn( data1 );

            expect( result ).to.equal( 123 );

            fn = interpreter.compile( 'foo.~{qux.baz}', false ),
            result = fn( data1 );

            expect( result ).to.equal( 123 );

            //expect( () => fn( { foo: void 0 } ) ).to.throw( Error );
            //expect( () => fn( { foo: { qux: void 0 } } ) ).to.throw( Error );
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
                data3 = { foo: [ 123, 456, 789 ] },
                fn, result;

            fn = interpreter.compile( '%0.%1', false ),
            result = fn( data, void 0, [ 'foo', 'qux' ] );

            expect( result ).to.equal( 456 );

            fn = interpreter.compile( '%f.%b', false ),
            result = fn( data, void 0, { f: 'foo', b: 'baz' } );

            expect( result ).to.equal( 789 );

            fn = interpreter.compile( 'foo.%{qux.baz}', false ),
            result = fn( data, void 0, { qux: { baz: 'bar' } } );

            fn = interpreter.compile( 'foo().then(%success)', false ),
            result = fn( data2, void 0, { success: function( data ){
                return data;
            } } );

            expect( result ).to.eventually.equal( 999 );

            fn = interpreter.compile( 'foo.forEach(%fn,%ctx)', false ),
            result = fn( data3, void 0, {
                ctx: { foo: 777 },
                fn: function( data ){
                    expect( this.foo ).to.equal( 777 );
                    expect( data ).to.be.oneOf( data3.foo );
                }
            } );
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
            result = void 0;

            fn = interpreter.compile( '[..2]foo' );
            result = fn( array );
            expect( result ).to.be.an( 'array' );
            expect( result[ 0 ] ).to.equal( 12 );
            expect( result[ 1 ] ).to.equal( 34 );
            expect( result[ 2 ] ).to.equal( 56 );
            result = void 0;

            fn = interpreter.compile( 'foo[1..3]' );
            result = fn( object );
            expect( result ).to.be.an( 'array' );
            expect( result[ 0 ] ).to.equal( 34 );
            expect( result[ 1 ] ).to.equal( 56 );
            expect( result[ 2 ] ).to.equal( 78 );
            result = void 0;

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

        it( 'should interpret existential expressions', function(){
            var data = { foo: 123, bar: function(){ return { qux: 456 }; } },
                empty = {},
                fn;

            fn = interpreter.compile( 'foo?' );
            expect( fn( data ) ).to.equal( 123 );
            expect( fn( empty ) ).to.be.undefined;
            expect( fn( void 0 ) ).to.be.undefined;

            fn = interpreter.compile( 'foo?.bar' );
            expect( fn( data ) ).to.be.undefined;
            expect( fn( empty ) ).to.be.undefined;
            expect( fn( void 0 ) ).to.be.undefined;

            fn = interpreter.compile( 'bar()?qux' );
            expect( fn( data ) ).to.equal( 456 );
            expect( fn( empty ) ).to.be.undefined;
            expect( fn( void 0 ) ).to.be.undefined;

            fn = interpreter.compile( 'bar()?baz' );
            expect( fn( data ) ).to.be.undefined;
            expect( fn( empty ) ).to.be.undefined;
            expect( fn( void 0 ) ).to.be.undefined;
        } );

        it( 'should interpret multiple expression statements', function(){
            var object = { foo: 123, bar: 456 },
                fn;

            fn = interpreter.compile( 'foo;bar', false );
            expect( fn( object ) ).to.equal( 456 );

            fn = interpreter.compile( 'foo;bar;', false );
            expect( fn( object ) ).to.equal( 456 );
        } );
    } );
} );