'use strict';

var KeypathExp = require( '../dist/exp' ),
    kp = require( '../dist/tag' ),
    PathToolkit = require( '../dist/path-toolkit' ),
    tk = new PathToolkit(),
    loset = require( 'lodash.set' ),
    keypather = require( 'keypather' )(),

    path = 'foo.bar.qux.baz',
    data = {},

    kpex = new KeypathExp( path ),
    tkTokens = tk.getTokens( path );

module.exports = {
    name: 'Dot Notation: Set',
    maxTime: 5,
    tests: {
        'KeypathExp#set': function(){
            kpex.set( data, 123 );
        },
        'kp': function(){
            kp`foo.bar.qux.baz`.set( data, 123 );
        },
        'tk#set': function(){
            tk.set( data, path, 123 );
        },
        'tk#set-tokenized': function(){
            tk.set( data, tkTokens, 123 );
        },
        'keypather#set': function(){
            keypather.set( data, path, 123 );
        },
        'lodash#set': function(){
            loset( data, path, 123 );
        }
    }
};