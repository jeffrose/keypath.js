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
                    baz: true
                }
            }
        }
    },
    
    kpex = new KeyPathExp( path );

module.exports = {
    name: 'KeyPathExp vs. tk vs. keypather vs. _.get',
    maxTime: 5,
    tests: {
        'KeyPathExp#get': function(){
            kpex.get( data );
        },
        'tk#getPath': function(){
            tk.getPath( data, path );
        },
        'keypather#get': function(){
            keypather.get( data, path );
        },
        'lodash#get': function(){
            _get( data, path );
        }
    }
};