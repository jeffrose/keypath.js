'use strict';

var Benchmark = require( 'benchmark' ),
    chalk = require( 'chalk' ),

    KeyPathExp = require( '../dist/keypath-umd' ),
    kp = require( '../dist/kp-umd' ),
    tk = require( '../dist/tk-umd' ),
    loget = require( 'lodash.get' ),
    keypather = require( 'keypather' )(),
    
    path = 'foo.bar.qux.baz',
    data = {
        foo: {
            bar: {
                qux: {
                    'baz': true
                }
            }
        }
    },

    kpex = new KeyPathExp( path ),
    tkTokens = tk.getTokens( path ),
    
    suite = new Benchmark.Suite( 'Dot Notation', {
        onComplete: function( event ){
            var first = this.filter( 'fastest' ),
                second = this.filter( first.slice( 1 ), 'fastest' );
            
            console.info( chalk.green( 'Fastest test is ' + first.map( 'name' ) ) );
        },
        onCycle: function( event ){
            console.info( chalk.green( String( event.target ) ) );
        },
        onStart: function( event ){
            console.info( 'Running suite ' + this.name + ' [' + __filename + ']...' );
        }
    } );

suite.add( 'kp', function(){
    kp`foo.bar.qux.baz`( data );
} );

suite.add( 'KeyPathExp#get', function(){
    kpex.get( data );
} );

suite.add( 'tk#get', function(){
    tk.get( data, path );
} );

suite.add( 'keypather#get', function(){
    keypather.get( data, path );
} );

suite.add( 'lodash#get', function(){
    loget( data, path );
} );

suite.run();
