'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
    tk = require( '../dist/tk-umd' ),
    keypather = require( 'keypather' )(),
    
    path = 'foo.bar.qux.baz',
    data = {
        foo: {
            bar: {
                qux: {
                    baz: true
                }
            }
        }
    },
    
    kpex = new KeyPathExp( path ),
    tkTokens = tk.getTokens( path );

module.exports = {
    name: 'KeyPathExp vs. tk vs. keypather',
    maxTime: 5,
    tests: {
        'KeyPathExp#get': function(){
            kpex.get( data );
        },
        'tk#getPath': function(){
            tk.getPath( data, path );
        },
        'tk#getPath-pre-compiled': function(){
            tk.getPath( data, tkTokens );
        },
        'keypather#get': function(){
            keypather.get( data, path );
        }
    }
};