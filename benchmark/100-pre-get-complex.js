'use strict';

var KeypathExp = require( '../dist/exp' ),
    tk = new ( require( '../dist/path-toolkit' ) )(),

    path = 'foo.bar[1]qux(123,"abc")baz["fuz"]',
    data = {
        foo: {
            bar: [
                {
                    qux: function( p1, p2 ){
                        return {
                            baz: {
                                fuz: 456
                            }
                        };
                    }
                },
                {
                    qux: function( p1, p2 ){
                        return {
                            baz: {
                                fuz: 456
                            }
                        };
                    }
                },
                {
                    qux: function( p1, p2 ){
                        return {
                            baz: {
                                fuz: 456
                            }
                        };
                    }
                }
            ]
        }
    },
    kpex = new KeypathExp( path ),
    tkTokens = tk.getTokens( path );

module.exports = {
    name: 'Precompiled:Get:Complex',
    maxTime: 5,
    tests: {
        'KeypathExp#get': function(){
            kpex.get( data );
        },
        'tk#get-tokenized': function(){
            tk.get( data, tkTokens );
        }
    }
};