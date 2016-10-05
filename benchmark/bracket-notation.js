'use strict';

var Benchmark = require( 'benchmark' ),
    chalk = require( 'chalk' ),

    KeyPathExp = require( '../dist/keypath-umd' ),
    kp = require( '../dist/kp-umd' ),
    tk = require( '../dist/tk-umd' ),
    loget = require( 'lodash.get' ),
    keypather = require( 'keypather' )(),
    
    path = 'foo[0][1][0]',
    data = {
        foo: [
            [ [ 123 ], [ 456 ], [ 789 ] ],
            [ [ 123 ], [ 456 ], [ 789 ] ]
        ]
    },

    kpex = new KeyPathExp( path ),
    tkTokens = tk.getTokens( path ),
    
    suite = new Benchmark.Suite( 'Bracket Notation', {
        onComplete: function( event ){
            var first = this.filter( 'fastest' );
            
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
    kp`foo[0][1][0]`( data );
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
