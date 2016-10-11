'use strict';
require(['../dist/tk-umd' /* other stuff here */], function(tk){
    tk.setOptions({cache:false});
	var modules = {
		'tk': tk
		/* other stuff here */
	};

    var data = {
            'undef': undefined,
            'propA': 'one',
            'propB': 'two',
            'propC': 'three',
            'accounts': [
                /* 0 */ { 'ary': [9,8,7,6] },
                /* 1 */ {
                            'checking': {
                                'balance': 123.00,
                                'id': '12345',
                                'fn': function(){ return 'Function return value'; },
                                'fnArg': function(){ var args = Array.prototype.slice.call(arguments); return args.join(','); },
                                'repeat': 'propA'
                            },
                            'indices': [0,1,2,3],
                            'savX': 'X',
                            'savY': 'Y',
                            'savZ': 'Z',
                            'savAa': 'aa',
                            'savAb': 'ab',
                            'savAc': 'ac',
                            'savBa': 'ba',
                            'savBb': 'bb',
                            'savBc': 'bc',
                            'test1': 'propA',
                            'test2': 'propB',
                            'test3': 'propC'
                        },
                /* 2 */ function(){ return 1;},
                /* 3 */ { 'propAry': ['savBa', 'savBb'] }
            ]
        };

    var button = document.getElementById('go');
    var content = document.getElementById('results');

    var count = 1;

    var simplePathGet = function(){
	    for (var i = count; i > 0; i--){
	    	tk.get(data, 'accounts.1.checking.id');
	    }
	    content.innerHTML = 'simplePathGet done.';
    };

    var complexPathGet = function(){
	    for (var i = count; i > 0; i--){
	    	tk.get(data, 'accounts.0.ary{<<1.indices.0}');
	    }
	    content.innerHTML = 'complexPathGet done.';
    };

    var execute = function(){
    	var path = document.getElementById('path').value || '';
    	var module = document.getElementById('module').value || '';
    	var func = document.getElementById('func').value || '';
    	var fn, retVal;
    	if (path && module && func && modules[module] && modules[module][func]){
    		fn = modules[module][func];
		    for (var i = count; i > 0; i--){
		    	modules[module][func]
		    	// retVal = fn(path);
                retVal = fn(data, path);
		    }
		    content.innerHTML = module + '.' + func + ' done: ' + retVal;
    	}
    };

    var tokenize = function(){
	    for (var i = count; i > 0; i--){
	    	tk.getTokens('accounts.1.checking.id');
	    }
    };

    button.addEventListener('click', execute);
});
