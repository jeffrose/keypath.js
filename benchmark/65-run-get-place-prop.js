'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
    kp = require( '../dist/kp-umd' ),
    tk = require( '../dist/tk-umd' ),
    loget = require( 'lodash.get' ),
    keypather = require( 'keypather' )(),
    
    path = 'foo.%2.qux.%1',
    data = {
        foo: {
            bar: {
                qux: {
                    'baz': true
                }
            }
        }
    };

module.exports = {
    name: 'Runtime:Get:Placeholder:Property',
    maxTime: 5,
    tests: {
        // Is this supported at all?
        // 'kp': function(){
        //     kp`foo.%2.qux.%1`( data );
        // },
        'tk#get': function(){
            tk.get( data, path, 'baz', 'bar' );
        }
    }
};
