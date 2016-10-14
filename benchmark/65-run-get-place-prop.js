'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
    kp = require( '../dist/kp-umd' ),
    tk = require( '../dist/tk-umd' ),
    loget = require( 'lodash.get' ),
    keypather = require( 'keypather' )(),
    
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
        'kp': function(){
            kp`foo.%1.qux.%0`( data, null, [ 'baz', 'bar' ] );
        },
        'tk#get': function(){
            tk.get( data, 'foo.%2.qux.%1', 'baz', 'bar' );
        }
    }
};
