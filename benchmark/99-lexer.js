'use strict';

var esprima = require( 'esprima' ),
    Lexer = require( '../dist/lexer' ),
    Tokens = require( '../dist/tokens' ),
    PathToolkit = require( '../dist/path-toolkit' ),
    tk = new PathToolkit(),

    lexer = new Lexer(),

    dPath = 'foo.bar.qux.baz';

tk.setOptions( { cache:false } );

module.exports = {
    name: 'Lexing',
    maxTime: 5,
    tests: {
        'Lexer#lex': function(){
            lexer.lex( dPath );
        },
        'Tokens#new': function(){
            new Tokens( dPath );
        },
        'esprima#tokenize': function(){
            esprima.tokenize( dPath );
        },
        'tk#getTokens': function(){
            tk.getTokens( dPath );
        }
    }
};