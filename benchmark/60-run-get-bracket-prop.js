'use strict';

var KeypathExp = require( '../dist/exp' ),
    kp = require( '../dist/tag' ),
    PathToolkit = require( '../dist/path-toolkit' ),
    tk = new PathToolkit(),
    loget = require( 'lodash.get' ),
    keypather = require( 'keypather' )(),
    
    path = '["foo"]["bar"]["qux"]["baz"]',
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
    name: 'Runtime:Get:Bracket:Property',
    maxTime: 5,
    tests: {
        'kp': function(){
            kp`["foo"]["bar"]["qux"]["baz"]`( data );
        },
        'tk#get': function(){
            tk.get( data, path );
        },
        'keypather#get': function(){
            keypather.get( data, path );
        },
        'lodash#get': function(){
            loget( data, path );
        }
    }
};
