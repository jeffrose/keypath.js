'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
    tk = require( '../dist/tk-umd' ),
    _get = require( 'lodash.get' ),
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

    path2 = 'foo[0]',
    data2 = {
        foo: [ 'val' ]
    },

    kpex = new KeyPathExp( path ),
    kpex2 = new KeyPathExp( path2 );

    var tkTokens = tk.getTokens( path2 );

module.exports = {
    name: 'KeyPathExp vs. tk vs. keypather vs. _.get',
    maxTime: 5,
    tests: {
        'KeyPathExp#get': function(){
            kpex.get( data );
        },
        'tk#get': function(){
            tk.get( data, path );
        },
        'keypather#get': function(){
            keypather.get( data, path );
        },
        'lodash#get': function(){
            _get( data, path );
        },

        'bracket KeyPathExp#get': function(){
            kpex2.get( data2 );
        },
        'bracket tk#get': function(){
            tk.get( data2, tkTokens );
        },
        'bracket keypather#get': function(){
            keypather.get( data2, path2 );
        },
        'bracket lodash#get': function(){
            _get( data2, path2 );
        }
    }
};