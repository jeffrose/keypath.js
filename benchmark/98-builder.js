'use strict';

var acorn = require( 'acorn' ),
    esprima = require( 'esprima' ),
    Lexer = require( '../dist/lexer' ),
    Builder = require( '../dist/builder' ),

    lexer = new Lexer(),
    builder = new Builder( lexer ),

    path = 'foo.bar.qux.baz',

    tokens = lexer.lex( path );

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
        },
        'acorn#parse': function(){
            acorn.parse( path );
        }
    }
};