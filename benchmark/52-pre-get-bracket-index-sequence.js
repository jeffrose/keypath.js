'use strict';

var KeypathExp = require( '../dist/exp' ),
    PathToolkit = require( '../dist/path-toolkit' ),
    tk = new PathToolkit(),
    
    path = '[2][0,1][0]',
    tkpath = '[2]0,1[0]',
    data = [
        [ [ 1 ], [ 2 ] ],// 0
        [ [ 3 ], [ 4 ] ],// 1
        [ [ 5 ], [ 6 ] ],// 2
        [ [ 7 ], [ 8 ] ] // 3
    ],
    
    kpex = new KeypathExp( path ),
    tkTokens = tk.getTokens( tkpath );
    
module.exports = {
    name: 'Precompiled:Get:Bracket:Index:Sequence',
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
