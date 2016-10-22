'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
    kp = require( '../dist/kp-umd' ),
    PathToolkit = require( '../dist/path-toolkit-min' ),
    tk = new PathToolkit(),
    loget = require( 'lodash.get' ),
    keypather = require( 'keypather' )(),
    
    path1 = 'foo.bar()',
    path2 = 'foo.baz(2)',
    data = {
        foo: {
            bar: function(){ return 1; },
            baz: function(x){ return x; }
        }
    },

    kpex1 = new KeyPathExp( path1 ),
    tkTokens1 = tk.getTokens( path1 ),
    kpex2 = new KeyPathExp( path2 ),
    tkTokens2 = tk.getTokens( path2 );

module.exports = {
    name: 'Precompiled:Get:FunctionCall:Property',
    maxTime: 5,
    tests: {
        'KeyPathExp#get()': function(){
            kpex1.get( data );
        },
        'tk#get        ()': function(){
            tk.get( data, path1 );
        },
        'KeyPathExp#get(arg)': function(){
            kpex2.get( data );
        },
        'tk#get        (arg)': function(){
            tk.get( data, path2 );
        }

        // lodash#get does not support this syntax
    }
};
