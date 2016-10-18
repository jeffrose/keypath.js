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
    while (i < path.length){
        if ( /[.\[\]]/.test(path[i]) ){
            if (word.length){
                tokens.push(word);
                word = '';
            }
        }
        else {
            word = word + path[i];
        }
        i++;
    }
    if (word.length){
        tokens.push(word);
    }
    
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

console.log('dotTokens:', dotTokens.t);
console.log('dotSplit:', dotSplit);
console.log('bracketTokens:', bracketTokens.t);
console.log('builtTokens:', builtTokens);

module.exports = {
    name: 'WTF',
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