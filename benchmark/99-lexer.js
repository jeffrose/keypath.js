'use strict';

var esprima = require( 'esprima' ),
    Lexer = require( '../dist/lexer-umd' ),
    tk = require('../dist/tk-umd'),
    
    lexer = new Lexer(),
    
    dPath = 'foo.bar.qux.baz',
    bPath = '["foo"]["bar"]["qux"]["baz"]',
    pPath = 'foo(123)(456)(789)';
    
tk.setOptions({cache:false});

module.exports = {
    name: 'Lexing',
    maxTime: 5,
    tests: {
        'Lexer#lex-dot': function(){
            lexer.lex( dPath );
        },
        'esprima#tokenize-dot': function(){
            esprima.tokenize( dPath );
        },
        'tk#getTokens-dot': function(){
            tk.getTokens( dPath );
        },
        'Lexer#lex-bracket': function(){
            lexer.lex( bPath );
        },
        'esprima#tokenize-bracket': function(){
            esprima.tokenize( bPath );
        },
        'tk#getTokens-bracket': function(){
            tk.getTokens( bPath );
        },
        'Lexer#lex-paren': function(){
            lexer.lex( pPath );
        },
        'esprima#tokenize-paren': function(){
            esprima.tokenize( pPath );
        },
        'tk#getTokens-paren': function(){
            tk.getTokens( pPath );
        }
    }
};