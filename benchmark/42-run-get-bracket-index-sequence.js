'use strict';

var kp = require( '../dist/kp-umd' ),
    PathToolkit = require( '../dist/path-toolkit-min' ),
    tk = new PathToolkit(),
    
    path = '[2][0,1][0]',
    tkpath = '[2][0,1]<[0]',
    data = [
        [ [ 1 ], [ 2 ] ],// 0
        [ [ 3 ], [ 4 ] ],// 1
        [ [ 5 ], [ 6 ] ],// 2
        [ [ 7 ], [ 8 ] ] // 3
    ];

module.exports = {
    name: 'Runtime:Get:Bracket:Index:Sequence',
    maxTime: 5,
    tests: {
        'kp': function(){
            kp`[2][0,1][0]`( data );
        },
        'tk#get': function(){
            tk.get( data, tkpath );
        }
    }
};
