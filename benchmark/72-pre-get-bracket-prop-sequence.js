'use strict';

var KeypathExp = require( '../dist/keypath-exp-umd' ),
    PathToolkit = require( '../dist/path-toolkit-min' ),
    tk = new PathToolkit(),
    
    path = '["foo"]["bar","qux"]["baz"]',
    tkpath = '["foo"]["bar","qux"]<["baz"]',
    tkpathSimplified = 'foo.bar,qux<baz',
    data = {
        foo: {
            bar: {
                baz: 123
            },
            qux: {
                baz: 456
            }
        }
    },

    kpex = new KeypathExp( path ),
    tkTokens = tk.getTokens( tkpath ),
    tkTokensSimplified = tk.getTokens( tkpathSimplified );

module.exports = {
    name: 'Precompiled:Get:Bracket:Property:Sequence',
    maxTime: 5,
    tests: {
        'KeypathExp#get': function(){
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
