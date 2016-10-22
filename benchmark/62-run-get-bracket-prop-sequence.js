'use strict';

var kp = require( '../dist/kp-umd' ),
    PathToolkit = require( '../dist/tk-umd' ),
    tk = new PathToolkit(),
    
    path = '["foo"]["bar","qux"]["baz"]',
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

    tkTokens = tk.getTokens( path );
    
module.exports = {
    name: 'Run:Get:Bracket:Property:Sequence',
    maxTime: 5,
    tests: {
        'kp': function(){
            kp`["foo"]["bar","qux"]["baz"]`( data );
        }/*, Is this supported?
        'tk#get-tokenized': function(){
            tk.get( data, tkTokens );
        }
        */
    }
};
