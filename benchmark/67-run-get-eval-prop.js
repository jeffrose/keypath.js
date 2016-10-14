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
    };

module.exports = {
    name: 'Runtime:Get:EvalProperty',
    maxTime: 5,
    tests: {
        // This path does not seem to work. Help?
        // 'kp': function(){
        //     kp`foo.{ref.prop}.qux.baz`( data );
        // },
        'tk#get': function(){
            tk.get( data, path );
        }
    }
};
