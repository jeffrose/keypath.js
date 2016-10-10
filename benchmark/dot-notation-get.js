'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
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
    aryPath = 'foo.0.1.0',
    aryData = {
        foo: [
            [ [ 123 ], [ 456 ], [ 789 ] ],
            [ [ 123 ], [ 456 ], [ 789 ] ]
        ]
    },

    kpex = new KeyPathExp( path ),
    tkTokens = tk.getTokens( path ),
    // Enable once KeyPathExp accepts paths of this type
    // aryKpex = new KeyPathExp( aryPath ),
    aryTkTokens = tk.getTokens( aryPath );

module.exports = {
    name: 'Dot Notation: Get',
    maxTime: 5,
    tests: {
        'KeyPathExp#get': function(){
            kpex.get( data );
        },
        'kp': function(){
            kp`foo.bar.qux.baz`( data );
        },
        'tk#get': function(){
            tk.get( data, path );
        },
        'tk#get-tokenized': function(){
            tk.get( data, tkTokens );
        },
        'keypather#get': function(){
            keypather.get( data, path );
        },
        'lodash#get': function(){
            loget( data, path );
        },
        
        // Enable once KeyPathExp and kp accept paths of this type
        // 'KeyPathExp#get - array': function(){
        //     aryKpex.get( aryData );
        // },
        // 'kp - array': function(){
        //     kp`foo.0.1.0`( aryData );
        // },
        'tk#get - array': function(){
            tk.get( aryData, aryPath );
        },
        'tk#get-tokenized - array': function(){
            tk.get( aryData, aryTkTokens );
        },
        'keypather#get - array': function(){
            keypather.get( aryData, aryPath );
        },
        'lodash#get - array': function(){
            loget( aryData, aryPath );
        }
    }
};