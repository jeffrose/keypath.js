'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
    PathToolkit = require( '../dist/path-toolkit-min' ),
    tk = new PathToolkit(),
    
    path = '["foo","bar"]["qux"]["baz"]',
    tkpath = '["foo","bar"]<["qux"]<["baz"]',
    tkpathSimplified = 'foo,bar<qux<baz',
    data = {
        foo: {
            qux: {
                baz: 123
            }
        },
        bar: {
            qux: {
                baz: 456
            }
        }
    },

    kpex = new KeyPathExp( path ),
    tkTokens = tk.getTokens( tkpath ),
    tkTokensSimplified = tk.getTokens( tkpathSimplified );

module.exports = {
    name: 'Precompiled:Get:Bracket:Property:Array',
    maxTime: 5,
    tests: {
        'KeyPathExp#get': function(){
            kpex.get( data );
        },
        'tk#get-tokenized': function(){
            tk.get( data, tkTokens );
        },
        'tk#get-tokenized-simplified': function(){
            tk.get( data, tkTokensSimplified );
        }
    }
};
