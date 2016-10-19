'use strict';

var tk = require( '../dist/tk-umd' ),
    loget = require( 'lodash.get' ),
    
    dotPath = 'foo.bar.qux.baz',
    bracketPath = 'foo[bar]qux.baz',
    data = {
        foo: {
            bar: {
                qux: {
                    'baz': true
                }
            }
        }
    },
    dotTokens = tk.getTokens( dotPath ),
    dotSplit = dotPath.split('.'),
    bracketTokens = tk.getTokens( bracketPath );
    
var buildTokens = function(path){
    var i = 0,
        word = '',
        len = path.length,
        tokens = [];
        
    path.split('.').forEach(function(word){
        tokens.push(word.split('').join(''));
        // tokens.push(word);
    });  
    return tokens;
};

var simpleGet = function(obj, tokens){
    var i = 0,
        len = tokens.length;
    while(i < len){
        obj = obj[tokens[i++]];
    }
    return obj;
};

var builtTokens = buildTokens(dotPath);

module.exports = {
    name: 'WTF - Chrome V8 string.split optimization',
    maxTime: 5,
    tests: {
        'tk#dotSplit': function(){
            tk.get( data, {t: dotSplit} );
        },
        'tk#builtTokens': function(){
            tk.get(data, {t: builtTokens});
        },
        'lodash#dotSplit': function(){
            loget( data, dotSplit );
        },
        'lodash#builtTokens': function(){
            loget(data, builtTokens);
        },
        'simpleGet#dotSplit': function(){
            simpleGet( data, dotSplit );
        },
        'simpleGet#builtTokens': function(){
            simpleGet(data, builtTokens);
        }
    }
};