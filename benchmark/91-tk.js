'use strict';

var PathToolkit = require( '../dist/tk-umd' ),
    tk = new PathToolkit(),
    
    data = {
        'undef': undefined,
        'propA': 'one',
        'propB': 'two',
        'propC': 'three',
        'foo.bar': 'FooBar',
        'blah': 'quoted',
        'John "Johnny" Doe': 'a name',
        'accounts': [
            /* 0 */ { 'ary': [9,8,7,6] },
            /* 1 */ {
                        'checking': {
                            'balance': 123.00,
                            'id': '12345',
                            'fn': function(){ return 'Function return value'; },
                            'fnArg': function(){ var args = Array.prototype.slice.call(arguments); return args.join(','); },
                            'repeat': 'propA'
                        },
                        'indices': [0,1,2,3],
                        'savX': 'X',
                        'savY': 'Y',
                        'savZ': 'Z',
                        'savAa': 'aa',
                        'savAb': 'ab',
                        'savAc': 'ac',
                        'savBa': 'ba',
                        'savBb': 'bb',
                        'savBc': 'bc',
                        'test1': 'propA',
                        'test2': 'propB',
                        'test3': 'propC'
                    },
            /* 2 */ function(){ return 1;},
            /* 3 */ { 'propAry': ['savBa', 'savBb'] }
        ]
    },
    
    other = {
        'x': 'propA',
        'y': 'propB',
        'z': 'checking'
    };


var ary = ['one', {two: true}, 3, 4, ['a', 'b']];
var x = [];

module.exports = {
    name: 'tk',
    maxTime: 5,
    tests: {
        'simple path - dot only': function(){
            tk.get( data, 'accounts.0.ary.2' );
        },
        'simple path - specials': function(){
            tk.get( data, 'accounts[0]."ary".2' );
        },
        'simple path - 1 placeholder': function(){
            tk.get( data, 'accounts.0.%1.2', 'ary' );
        },
        'simple path - 2 placeholders': function(){
            tk.get( data, 'accounts.%2.%1.2', 'ary', 0 );
        },
        'simple path - 1 context prefix': function(){
            tk.get( data, 'accounts.1.<0.ary.2' );
        },
        'function execution - no fn args': function(){
            tk.get( data, 'accounts.1.checking.fn()' );
        },
        'function execution - one fn arg': function(){
            tk.get( data, 'accounts.1.checking.fn(5)' );
        },
        'indirect property reference': function(){
            tk.get( data, 'accounts.0.ary{<<1.indices.0}')
        }
    }
};