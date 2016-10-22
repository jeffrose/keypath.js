'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
    PathToolkit = require( '../dist/tk-umd' ),
    tk = new PathToolkit(),
    
    path = '["foo","bar"]["qux"]["baz"]',
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
    tkTokens = tk.getTokens( path );

module.exports = {
    name: 'Precompiled:Get:Bracket:Property:Array',
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
