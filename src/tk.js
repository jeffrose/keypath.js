// Parsing, tokeninzing, etc

(function (define) {
	'use strict';
	
    define('tk', function (require, exports) {

		var separators = {
		    '.': {
		        'exec': 'property'
		        },
		    ',': {
		        'exec': 'collection'
		        }
		};

		var containers = {
		    '[': {
		        'closer': ']',
		        'exec': 'property'
		        },
		    '(': {
		        'closer': ')',
		        'exec': 'call'
		        },
		    '{': {
		        'closer': '}',
		        'exec': '??'
		        }
		};

		var wildCardMatch = function(template, str){
			var pos = template.indexOf('*'),
				parts = template.split('*', 2),
				match = true;
			if (parts[0]){
				match = match && str.substr(0, parts[0].length) === parts[0];
			}
			if (parts[1]){
				match = match && str.substr(pos+1) === parts[1];
			}
			return match;
		};

		var isArray = function(object) {
		  return object != null && typeof object === "object" &&
		    'splice' in object && 'join' in object;
		};

		var flatten = function(ary){
			ary = isArray(ary) ? ary : [ary];
			return ary.reduce(function(a, b) {
			  return a.concat(b);
			},[]);
		};

		/*
		 *  Scan input string from left to right, one character at a time. If a special character
		 *  is found (one of "separators" or "containers"), either store the accumulated word as
		 *  a token or else begin watching input for end of token (finding a closing character for
		 *  a container or the end of a collection). If a container is found, call tokenize
		 *  recursively on string within container.
		 */
		var tokenize = function (str){
			var tokens = [],
				strLength = str.length,
				word = '',
				substr = '',
				i,
				opener, closer, separator,
				collection = [],
				depth = 0;

			// console.log('Parsing:', str);

			for (i = 0; i < strLength; i++){
				// console.log(i, str[i]);
				if (depth > 0){
					// Scan for closer
					str[i] === opener && depth++;
					str[i] === closer.closer && depth--;

					if (depth > 0){
						substr += str[i];
					}
					else {
						if (i+1 < strLength && separators[str[i+1]] && separators[str[i+1]].exec === 'collection'){
							collection.push({'t':tokenize(substr), 'exec': closer.exec});
						}
						else if (collection[0]){
							collection.push({'t':tokenize(substr), 'exec': closer.exec});
							tokens.push(collection);
							collection = [];
						}
						else {
							tokens.push({'t':tokenize(substr), 'exec': closer.exec});
						}
						substr = '';
					}
				}
				else if (str[i] in separators){
					separator = separators[str[i]];
					if (separator.exec === 'property'){
						// word is a plain property or end of collection
						if (collection[0] !== undefined){
							// we are gathering a collection, so add last word to collection and then store
							word && collection.push(word);
							tokens.push(collection);
							collection = [];
						}
						else {
							// word is a plain property
							word && tokens.push(word);
						}
					}
					else if (separator.exec === 'collection'){
						// word is a collection
						word && collection.push(word);
					}
					word = '';
				}
				else if (closer = containers[str[i]]){
					// found opener, initiate scan for closer
					if (collection[0] !== undefined){
						// we are gathering a collection, so add last word to collection and then store
						word && collection.push(word);
					}
					else {
						// word is a plain property
						word && tokens.push(word);
					}
					word = '';
					opener = str[i];
					depth++;
				}
				else {
					// still accumulating property name
					word += str[i];
				}
			}
			// add trailing word to tokens, if present
			if (collection[0] !== undefined){
				// we are gathering a collection, so add last word to collection and then store
				word && collection.push(word);
				tokens.push(collection);
			}
			else {
				// word is a plain property
				word && tokens.push(word);
			}
			// console.log('returning:', tokens);
			return depth === 0 ? tokens : undefined; // depth != 0 means mismatched containers
		};

		var resolvePath = function (obj, path, newValue){
			var root = root ? root : obj,
				change = newValue !== undefined,
				val,
				tk,
				preprev,
				i;

			tk = typeof path === 'string' ? tokenize(path) : path.t;
			// console.log('tokenized:', JSON.stringify(tk));

			return tk.reduce(function(prev, curr, idx){
				var ret;
				// console.log('reduce:',prev,curr);
				if (typeof curr === 'undefined' || typeof prev === 'undefined'){
					ret = prev;
				}
				else if (typeof curr === 'string'){
					if (prev[curr]) {
						if (change && idx === (tk.length - 1)){ prev[curr] = newValue; }
						ret = prev[curr];
					}
					else if (curr.indexOf('*') >-1){
						ret = [];
						for (var prop in prev){
							if (prev.hasOwnProperty(prop) && wildCardMatch(curr, prop)){
								if (change && idx === (tk.length -1)){ prev[prop] = newValue; }
								ret.push(prev[prop]);
							}
						}
					}
					else { return undefined; }
				}
				else if (isArray(curr)){
					// call getPath again with base value as evaluated value so far and
					// each element of array as the path. Concat all the results together.
					ret = [];
					for (i = 0; curr[i] !== undefined; i++){
						if (curr[i].t && curr[i].exec === 'property'){
							ret = ret.concat(prev[getPath(root, curr[i])]);
						} else {
							ret = ret.concat(getPath(prev, curr[i]));
						}
					}
				}
				else if (curr.exec === 'property'){
					if (change && idx === (tk.length -1)){
						prev[getPath(root, curr)] = newValue;
					}
					ret = prev[getPath(root, curr)];
				}
				else if (curr.exec === 'call'){
					// TODO: handle params for function
					ret = prev.call(preprev);
				}
				preprev = prev;
				return ret;
			}.bind(this), obj);
		};


		// var Tk = function(opts){
		// 	opts = opts || {};
		// 	separators = opts.separators || _separators;
		// 	containers = opts.containers || _containers;
		// }


		var getPath = function (obj, path){
			return resolvePath(obj, path);
		};

		var setPath = function(obj, path, val){
			var ref = resolvePath(obj, path, val);
			return typeof ref !== 'undefined';
		};

 
        //Attach properties to exports.
        exports.getPath = getPath;
        exports.setPath = setPath;
    });
}(typeof define === 'function' && define.amd ? define : function (id, factory) {
    if (typeof exports !== 'undefined') {
        //commonjs
        factory(require, exports);
    } else {
        //Create a global function. Only works if
        //the code does not have dependencies, or
        //dependencies fit the call pattern below.
        factory(function(value) {
            return window[value];
        }, (window[id] = {}));
    }
}));
