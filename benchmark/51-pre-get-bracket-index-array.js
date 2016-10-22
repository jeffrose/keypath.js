'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
    PathToolkit = require( '../dist/tk-umd' ),
    tk = new PathToolkit(),
    
    path = '[1,2][1][0]',
    data = [
        [ [ 1 ], [ 2 ] ],// 0
        [ [ 3 ], [ 4 ] ],// 1
        [ [ 5 ], [ 6 ] ],// 2
        [ [ 7 ], [ 8 ] ] // 3
    ],
    
    kpex = new KeyPathExp( path ),
    tkTokens = tk.getTokens( path );
    
module.exports = {
    name: 'Precompiled:Get:Bracket:Index:Array',
    maxTime: 5,
    tests: {
        'KeyPathExp#get': function(){
            kpex.get( data );
        }/*, Is this supported?
        'tk#get-tokenized': function(){
            tk.get( data, tkTokens );
        }
        */
    }
};
