'use strict';

var KeypathExp = require( '../dist/keypath-exp-umd' ),
    kp = require( '../dist/kp-umd' ),
    PathToolkit = require( '../dist/path-toolkit-min' ),
    tk = new PathToolkit(),
    loget = require( 'lodash.get' ),
    keypather = require( 'keypather' )(),
    
    path = '[2][0][1][0]',
    data = [ 'a', 'b',
        [
            [ [ 123, 1 ], [ 456, 2 ], [ 789, 3 ] ],
            [ [ 123, 4 ], [ 456, 5 ], [ 789, 6 ] ]
        ]
    ],
    kpex = new KeypathExp( path ),
    tkTokens = tk.getTokens( path );

module.exports = {
    name: 'Precompiled:Get:Bracket:Index',
    maxTime: 5,
    tests: {
        'KeypathExp#get': function(){
            kpex.get( data );
        },
        'tk#get-tokenized': function(){
            tk.get( data, tkTokens );
        }
    }
};
