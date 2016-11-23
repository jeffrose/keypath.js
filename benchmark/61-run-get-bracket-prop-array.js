'use strict';

var kp = require( '../dist/tag' ),
    PathToolkit = require( '../dist/path-toolkit' ),
    tk = new PathToolkit(),
    
    path = '["foo","bar"]["qux"]["baz"]',
    tkpath = '"foo","bar"<["qux"]<["baz"]',
    tkpathSimplified = 'foo,bar<qux<baz',
    data = {
        foo: {
            qux: {
                baz: 123
            }
        },
        bar: {
            qux: {
                baz: 456
            }
        }
    };

module.exports = {
    name: 'Runtime:Get:Bracket:Property:Array',
    maxTime: 5,
    tests: {
        'kp': function(){
            kp`["foo","bar"]["qux"]["baz"]`.get( data );
        },
        'tk#get': function(){
            tk.get( data, tkpath );
        },
        'tk#get-simplified': function(){
            tk.get( data, tkpathSimplified );
        }
    }
};
