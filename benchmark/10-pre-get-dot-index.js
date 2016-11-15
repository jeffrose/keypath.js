'use strict';

var KeypathExp = require( '../dist/exp' ),
    kp = require( '../dist/tag' ),
    PathToolkit = require( '../dist/path-toolkit' ),
    tk = new PathToolkit(),
    loget = require( 'lodash.get' ),
    keypather = require( 'keypather' )(),
    
    path = '2.0.1.0',
    data = [ 'a', 'b',
        [
            [ [ 123, 1 ], [ 456, 2 ], [ 789, 3 ] ],
            [ [ 123, 4 ], [ 456, 5 ], [ 789, 6 ] ]
        ]
    ],
    // Enable once KeypathExp supports this type of path
    // kpex = new KeypathExp( path ),
    tkTokens = tk.getTokens( path ),
    pathAry = path.split('.');

module.exports = {
    name: 'Precompiled:Get:Dot:Index',
    maxTime: 5,
    tests: {
        // 'KeypathExp#get': function(){
        //     kpex.get( data );
        // },
        'tk#get': function(){
            tk.get( data, tkTokens );
        },
        'lodash#get': function(){
            loget( data, pathAry );
        }
    }
};