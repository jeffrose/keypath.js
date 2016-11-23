'use strict';

var KeypathExp = require( '../dist/exp' ),
    PathToolkit = require( '../dist/path-toolkit' ),
    tk = new PathToolkit(),
    loget = require( 'lodash.get' ),
    keypather = require( 'keypather' )(),

    path = 'foo.bar.qux.baz',
    data = {
        foo: {
            bar: {
                qux: {
                    'baz': true
                }
            }
        }
    },
    kpex = new KeypathExp( path ),
    tkTokens = tk.getTokens( path );

module.exports = {
    name: 'Precompiled:Get:Dot:Property',
    maxTime: 5,
    tests: {
        'KeypathExp#get': function(){
            kpex.get( data );
        },
        'tk#get-tokenized': function(){
            tk.get( data, tkTokens );
        },
        'lodash#get': function(){
            loget( data, tkTokens.t );
        }
    }
};