'use strict';

var KeypathExp = require( '../dist/exp' ),
    PathToolkit = require( '../dist/path-toolkit' ),
    tk = new PathToolkit(),

    path = 'foo.{ref.prop}.qux.baz',
    data = {
        foo: {
            bar: {
                qux: {
                    'baz': 'output'
                }
            },
            ref: {
                prop: 'bar'
            }
        },
        ref: {
            prop: 'bar'
        }
    },
    kpex = new KeypathExp( path ),
    tkTokens = tk.getTokens( path );

module.exports = {
    name: 'Precompiled:Get:EvalProperty',
    maxTime: 5,
    tests: {
        'KeypathExp#get': function(){
            kpex.get( data );
        },
        'tk#get': function(){
            tk.get( data, tkTokens );
        }
    }
};
