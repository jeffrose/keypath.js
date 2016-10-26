'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
    kp = require( '../dist/kp-umd' ),
    PathToolkit = require( '../dist/path-toolkit-min' ),
    tk = new PathToolkit(),
    tkNoCache = new PathToolkit({cache:false}),
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
    native = function(data){
        return data.foo.bar.qux.baz;
    };

module.exports = {
    name: 'Runtime:Get:Dot:Property',
    maxTime: 5,
    tests: {
        'kp': function(){
            kp`foo.bar.qux.baz`( data );
        },
        'tk#get': function(){
            tk.get( data, path );
        },
        'tkNoCache#get': function(){
            tkNoCache.get( data, path );
        },
        'keypather#get': function(){
            keypather.get( data, path );
        },
        'lodash#get': function(){
            loget( data, path );
        },
        'native#dot': function(){
            native(data);
        }
    }
};