'use strict';

var kp = require( '../dist/tag' ),
    PathToolkit = require( '../dist/path-toolkit' ),
    tk = new PathToolkit(),
    keypather = require( 'keypather' )(),

    path1 = 'foo.bar()',
    path2 = 'foo.baz(2)',
    data = {
        foo: {
            bar: function(){ return 1; },
            baz: function(x){ return x; }
        }
    };

module.exports = {
    name: 'Runtime:Get:FunctionCall:Property',
    maxTime: 5,
    tests: {
        'kp            ()': function(){
            kp`foo.bar()`.get( data );
        },
        'tk#get        ()': function(){
            tk.get( data, path1 );
        },
        'keypather#get ()': function(){
            keypather.get( data, path1 );
        },
        'kp            (arg)': function(){
            kp`foo.baz(2)`.get( data );
        },
        'tk#get        (arg)': function(){
            tk.get( data, path2 );
        },
        'keypather#get (arg)': function(){
            keypather.get( data, path2 );
        }

        // lodash#get does not support this syntax
    }
};
