'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
    tk = require( '../dist/tk-umd' ),
    
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

console.log( kpex.get( data ) );
    
module.exports = {
    name: 'Precompiled:Get:Bracket:Array',
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
