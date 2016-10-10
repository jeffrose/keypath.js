'use strict';

var tk = require( '../dist/tk-umd' ),
    
    dPath = 'foo.bar.qux.baz',
    bPath = '["foo"]["bar"]["qux"]["baz"]',
    data = {
        foo: {
            bar: {
                qux: {
                    'baz': true
                }
            }
        }
    },

    dTokens = tk.getTokens( dPath ),
    bTokens = tk.getTokens( bPath );

// tk.setOptions({cache:false});

module.exports = {
    name: 'tk',
    maxTime: 5,
    tests: {
        'tk#get-dot': function(){
            tk.get( data, dPath );
        },
        'tk#get-tokenized-dot': function(){
            tk.get( data, dTokens );
        },
        'tk#get-bracket': function(){
            tk.get( data, bPath );
        },
        'tk#get-tokenized-bracket': function(){
            tk.get( data, bTokens );
        }
    }
};