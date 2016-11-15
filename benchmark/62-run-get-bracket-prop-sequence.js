'use strict';

var kp = require( '../dist/tag' ),
    PathToolkit = require( '../dist/path-toolkit' ),
    tk = new PathToolkit(),
    
    path = '["foo"]["bar","qux"]["baz"]',
    tkpath = '["foo"]"bar","qux"<["baz"]',
    tkpathSimplified = 'foo.bar,qux<baz',
    data = {
        foo: {
            bar: {
                baz: 123
            },
            qux: {
                baz: 456
            }
        }
    };

module.exports = {
    name: 'Runtime:Get:Bracket:Property:Sequence',
    maxTime: 5,
    tests: {
        'kp': function(){
            kp`["foo"]["bar","qux"]["baz"]`( data );
        },
        'tk#get': function(){
            tk.get( data, tkpath );
        },
        'tk#get-simplified': function(){
            tk.get( data, tkpathSimplified );
        }
    }
};
