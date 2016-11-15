'use strict';

var KeypathExp = require( '../dist/exp' ),
    kp = require( '../dist/tag' ),
    PathToolkit = require( '../dist/path-toolkit' ),
    tk = new PathToolkit(),
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
