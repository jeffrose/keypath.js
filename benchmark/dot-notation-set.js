'use strict';

var KeyPathExp = require( '../dist/keypath-umd' ),
    kp = require( '../dist/kp-umd' ),
    tk = require( '../dist/tk-umd' ),
    loset = require( 'lodash.set' ),
    keypather = require( 'keypather' )(),
    
    path = 'foo.bar.qux.baz',
    data = {
        
    },

    kpex = new KeyPathExp( path ),
    tkTokens = tk.getTokens( path );

module.exports = {
    name: 'Dot Notation: Set',
    maxTime: 5,
    tests: {
        'KeyPathExp#set': function(){
            kpex.set( data, 123 );
        },
        'kp': function(){
            kp`foo.bar.qux.baz`( data, 123 );
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
        },
    }
};