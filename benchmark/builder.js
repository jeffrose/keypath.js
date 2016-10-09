'use strict';

var esprima = require( 'esprima' ),
    Lexer = require( '../dist/lexer-umd' ),
    Builder = require( '../dist/builder-umd' ),
    
    lexer = new Lexer(),
    builder = new Builder( lexer ),
    
    dPath = 'foo.bar.qux.baz',
    bPath = '["foo"]["bar"]["qux"]["baz"]';

module.exports = {
    name: 'Builder vs. esprima',
    maxTime: 5,
    tests: {
        'Builder#build-dot': function(){
            builder.build( dPath );
        },
        'esprima#parse-dot': function(){
            esprima.parse( dPath );
        },
        'Builder#build-bracket': function(){
            builder.build( bPath );
        },
        'esprima#parse-bracket': function(){
            esprima.parse( bPath );
        }
    }
};