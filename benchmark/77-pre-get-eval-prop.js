'use strict';

var KeypathExp = require( '../dist/keypath-exp-umd' ),
    kp = require( '../dist/kp-umd' ),
    PathToolkit = require( '../dist/path-toolkit-min' ),
    tk = new PathToolkit(),
    loget = require( 'lodash.get' ),
    keypather = require( 'keypather' )(),
    
    path = 'foo.{ref.prop}.qux.baz',
    data = {
        foo: {
            bar: {
                qux: {
                    'baz': 'output'
                }
            },
            ref: {
                prop: 'bar'
            }
        },
        ref: {
            prop: 'bar'
        }
    },
    kpex = new KeypathExp( path ),
    tkTokens = tk.getTokens( path );

module.exports = {
    name: 'Precompiled:Get:EvalProperty',
    maxTime: 5,
    tests: {
        'KeypathExp#get': function(){
            kpex.get( data );
        },
        'tk#get': function(){
            tk.get( data, tkTokens );
        }
    }
};
