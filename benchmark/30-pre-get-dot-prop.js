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
    kpex = new KeyPathExp( path ),
    tkTokens = tk.getTokens( path ),
    pathAry = path.split('.');

module.exports = {
    name: 'Precompiled:Get:Dot:Property',
    maxTime: 5,
    tests: {
        'KeyPathExp#get': function(){
            kpex.get( data );
        },
        'tk#get-tokenized': function(){
            tk.get( data, tkTokens );
        },
        'lodash#get': function(){
            loget( data, pathAry );
        }
    }
};