'use strict';

var KeypathExp = require( '../dist/exp' ),
    PathToolkit = require( '../dist/path-toolkit' ),
    tk = new PathToolkit(),

    data = {
        foo: {
            bar: {
                qux: {
                    'baz': true
                }
            }
        }
    },

    kpex = new KeypathExp( 'foo.%1.qux.%0' ),
    tkTokens = tk.getTokens( 'foo.%2.qux.%1' );

module.exports = {
    name: 'Precompiled:Get:Placeholder:Property',
    maxTime: 5,
    tests: {
        'KeypathExp#get': function(){
            kpex.get( data, [ 'baz', 'bar' ] );
        },
        'tk#get-tokenized': function(){
            tk.get( data, tkTokens, 'baz', 'bar' );
        }
    }
};
