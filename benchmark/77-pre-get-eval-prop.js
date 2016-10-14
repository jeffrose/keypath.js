'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
    kp = require( '../dist/kp-umd' ),
    tk = require( '../dist/tk-umd' ),
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
        }
    },
    kpex = new KeyPathExp( path ),
    tkTokens = tk.getTokens( path );

module.exports = {
    name: 'Precompiled:Get:EvalProperty',
    maxTime: 5,
    tests: {
        // This path does not seem to work. Help?
        // 'KeyPathExp#get': function(){
        //     kpex.get( data );
        // },
        'tk#get': function(){
            tk.get( data, tkTokens );
        }
    }
};
