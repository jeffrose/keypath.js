'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
    
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

    dKpex = new KeyPathExp( dPath ),
    bKpex = new KeyPathExp( bPath );

module.exports = {
    name: 'KeyPathExp',
    maxTime: 5,
    tests: {
        'KeyPathExp#get-dot': function(){
            dKpex.get( data );
        },
        'KeyPathExp#get-bracket': function(){
            bKpex.get( data );
        },
    }
};