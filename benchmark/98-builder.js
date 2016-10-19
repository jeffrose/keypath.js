'use strict';

var esprima = require( 'esprima' ),
    Lexer = require( '../dist/lexer-umd' ),
    Builder = require( '../dist/builder-umd' ),
    
    lexer = new Lexer(),
    builder = new Builder( lexer ),
    
    path = 'foo.bar.qux.baz',
    
    tokens = lexer.lex( path );

console.log( esprima.parse( path ) );

module.exports = {
    name: 'Building',
    maxTime: 5,
    tests: {
        'Builder#build': function(){
            builder.build( path );
        },
        'Builder#build-tokenized': function(){
            builder.build( tokens );
        },
        'esprima#parse': function(){
            esprima.parse( path );
        }
    }
};