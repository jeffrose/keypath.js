'use strict';

var esprima = require( 'esprima' ),
    Lexer = require( '../dist/lexer-umd' ),
    
    lexer = new Lexer(),
    
    dPath = 'foo.bar.qux.baz',
    bPath = '["foo"]["bar"]["qux"]["baz"]';

module.exports = {
    name: 'Lexer vs. esprima',
    maxTime: 5,
    tests: {
        'Lexer#lex-dot': function(){
            lexer.lex( dPath );
        },
        'esprima#tokenize-dot': function(){
            esprima.tokenize( dPath );
        },
        'Lexer#lex-bracket': function(){
            lexer.lex( bPath );
        },
        'esprima#tokenize-bracket': function(){
            esprima.tokenize( bPath );
        }
    }
};