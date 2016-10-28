'use strict';

var KeypathExp = require( '../dist/keypath-exp-umd' ),
    kp = require( '../dist/kp-umd' ),
    PathToolkit = require( '../dist/path-toolkit-min' ),
    tk = new PathToolkit(),
    tkNoCache = new PathToolkit({cache:false}),
    loget = require( 'lodash.get' ),
    keypather = require( 'keypather' )(),
    
    path = '2.0.1.0',
    data = [ 'a', 'b',
        [
            [ [ 123, 1 ], [ 456, 2 ], [ 789, 3 ] ],
            [ [ 123, 4 ], [ 456, 5 ], [ 789, 6 ] ]
        ]
    ],
    native = function(data){
        return data[2][0][1][0];
    };

module.exports = {
    name: 'Runtime:Get:Dot:Index',
    maxTime: 5,
    tests: {
        // Enable when kp supports paths of this type
        // 'kp': function(){
        //     kp`2.0.1.0`( data );
        // },
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
        'native': function(){
            native(data);
        }
        
    }
};