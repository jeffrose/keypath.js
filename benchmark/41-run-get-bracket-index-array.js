'use strict';

var kp = require( '../dist/kp-umd' ),
    PathToolkit = require( '../dist/path-toolkit-min' ),
    tk = new PathToolkit(),
    
    path = '[1,2][1][0]',
    tkpath = '[1],[2]<[1]<[0]',
    tkpathSimplified = '1,2<1<0',
    data = [
        [ [ 1 ], [ 2 ] ],// 0
        [ [ 3 ], [ 4 ] ],// 1
        [ [ 5 ], [ 6 ] ],// 2
        [ [ 7 ], [ 8 ] ] // 3
    ];

module.exports = {
    name: 'Runtime:Get:Bracket:Index:Array',
    maxTime: 5,
    tests: {
        'kp': function(){
            kp`[1,2][1][0]`( data );
        },
        'tk#get': function(){
            tk.get( data, tkpath );
        },
        'tk#get-simplified': function(){
            tk.get( data, tkpathSimplified );
        }
    }
};
