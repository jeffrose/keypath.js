'use strict';

var KeypathExp = require( '../dist/exp' ),
    kp = require( '../dist/tag' ),
    PathToolkit = require( '../dist/path-toolkit' ),
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
    };

module.exports = {
    name: 'Runtime:Get:EvalProperty',
    maxTime: 5,
    tests: {
        'kp': function(){
            kp`foo.{ref.prop}.qux.baz`( data );
        },
        'tk#get': function(){
            tk.get( data, path );
        }
    }
};
