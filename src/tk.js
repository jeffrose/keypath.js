// Parsing, tokeninzing, etc

(function (define) {
	'use strict';
	
    define('tk', function (require, exports) {

    	var prefixes = {
    		'<': {
    			'exec': 'parent'
    		}
    	};

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

		var isObject = function(val) {
			if (val === null) { return false;}
			return ( (typeof val === 'function') || (typeof val === 'object') );
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
				mods = {},
				strLength = str.length,
				word = '',
				substr = '',
				i,
				opener, closer, separator,
				collection = [],
				depth = 0;

			// console.log('Parsing:', str);

			for (i = 0; i < strLength; i++){
				if (depth > 0){
					// Scan for closer
					str[i] === opener && depth++;
					str[i] === closer.closer && depth--;

					if (depth > 0){
						substr += str[i];
					}
					// TODO: handle comma-separated elements when depth === 1, process as function arguments
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
				else if (str[i] in prefixes){
					mods.has = true;
					if (mods[prefixes[str[i]].exec]) { mods[prefixes[str[i]].exec]++; }
					else { mods[prefixes[str[i]].exec] = 1; }
				}
				else if (str[i] in separators){
					separator = separators[str[i]];
					if (word && mods.has){
						word = {'w': word, 'mods': mods};
						mods = {};
					}
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
					if (word && mods.has){
						word = {'w': word, 'mods': mods};
						mods = {};
					}
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
			if (word && mods.has){
				word = {'w': word, 'mods': mods};
				mods = {};
			}
			if (collection[0] !== undefined){
				// we are gathering a collection, so add last word to collection and then store
				word && collection.push(word);
				tokens.push(collection);
			}
			else {
				// word is a plain property
				word && tokens.push(word);
			}
			return depth === 0 ? tokens : undefined; // depth != 0 means mismatched containers
		};

		// var getContext = function getContext(context, valueStack, word){
		// 	if (!prefixes[word[0]]){
		// 		return context;
		// 	}
		// 	var counter = 0,
		// 		prefix,
		// 		newContext;
		// 	while (prefix = prefixes[word[counter]]){
		// 		if (prefix.exec === 'parent'){
		// 			newContext = valueStack[counter + 1];
		// 		}
		// 		counter++;
		// 	}
		// 	return newContext;
		// };

		// var cleanWord = function cleanWord(word){
		// 	if(!prefixes[word[0]]){
		// 		return word;
		// 	}
		// 	var len = word.length;
		// 	for (var i = 1; i < len; i++){
		// 		if (!prefixes[word[i]]){
		// 			return word.substr(i);
		// 		}
		// 	}
		// 	return '';
		// }

		var resolvePath = function (obj, path, newValue, valueStack){
			var root = root ? root : obj,
				change = newValue !== undefined,
				val,
				tk,
				i,
				valueStack = valueStack || [];

			tk = typeof path === 'string' ? tokenize(path) : path.t;

			return tk.reduce(function(prev, curr, idx){
				var context = valueStack.length ? valueStack[0] : root,
					ret,
					lastToken = (idx === (tk.length - 1)),
					newValueHere = (change && lastToken);
				if (typeof curr === 'undefined' || typeof prev === 'undefined'){
					ret = undefined;
				}
				else if (typeof curr === 'string'){
					if (context[curr]) {
						if (newValueHere){ context[curr] = newValue; }
						ret = context[curr];
					}
					else if (curr.indexOf('*') >-1){
						ret = [];
						for (var prop in context){
							if (context.hasOwnProperty(prop) && wildCardMatch(curr, prop)){
								if (newValueHere){ context[prop] = newValue; }
								ret.push(context[prop]);
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
						if (newValueHere){
							if (curr[i].t && curr[i].exec === 'property'){
								context[getPath(context, curr[i], valueStack.concat())] = newValue;
								ret = ret.concat(context[getPath(context, curr[i], valueStack.concat())]);
							} else {
								ret = ret.concat(setPath(context, curr[i], newValue, valueStack.concat()));
							}
						}
						else {
							if (curr[i].t && curr[i].exec === 'property'){
								ret = ret.concat(context[getPath(context, curr[i], valueStack.concat())]);
							} else {
								ret = ret.concat(getPath(context, curr[i], valueStack.concat()));
							}
						}
					}
				}
				else if (curr.w){
					// this word token has modifiers, modify current context
					if (curr.mods.parent){
						context = valueStack[curr.mods.parent];
						if (typeof context === 'undefined') { return undefined; }
					}
					curr = curr.w;

					// Repeat basic string property processing with word and modified context
					if (context[curr]) {
						if (newValueHere){ context[curr] = newValue; }
						ret = context[curr];
					}
					else if (curr.indexOf('*') >-1){
						ret = [];
						for (var prop in context){
							if (context.hasOwnProperty(prop) && wildCardMatch(curr, prop)){
								if (newValueHere){ context[prop] = newValue; }
								ret.push(context[prop]);
							}
						}
					}
					else { return undefined; }
				}
				else if (curr.exec === 'property'){
					if (newValueHere){
						context[getPath(context, curr, valueStack.concat())] = newValue;
					}
					ret = context[getPath(context, curr, valueStack.concat())];
				}
				else if (curr.exec === 'call'){
					// TODO: handle params for function
					ret = context.call(valueStack[1]);
				}
				valueStack.unshift(ret);
				return ret;
			}.bind(this), obj);
		};

		var scanForValue = function(obj, val, savePath, path){
			var i, len, prop, more;

			path = path ? path : '';

			if (obj === val){
				return savePath(path); // true -> keep looking; false -> stop now
			}
			else if (isArray(obj)){
				len = obj.length;
				for(i = 0; i < len; i++){
					more = scanForValue(obj[i], val, savePath, path + '.' + i);
					if (!more){ return; }
				}
				return true; // keep looking
			}
			else if (isObject(obj)) {
				for (prop in obj){
					if (obj.hasOwnProperty(prop)){
						more = scanForValue(obj[prop], val, savePath, path + '.' + prop);
						if (!more){ return; }
					}
				}
				return true; // keep looking
			}
			// Leaf node (string, number, character, boolean, etc.), but didn't match
			return true; // keep looking
		};

		// var Tk = function(opts){
		// 	opts = opts || {};
		// 	separators = opts.separators || _separators;
		// 	containers = opts.containers || _containers;
		// }


		var getPath = function (obj, path, valueStack){
			return resolvePath(obj, path, undefined, valueStack);
		};

		var setPath = function(obj, path, val, valueStack){
			var ref = resolvePath(obj, path, val, valueStack);
			if (isArray(ref)){
				return ref.indexOf(false) === -1;
			}
			return typeof ref !== 'undefined';
		};

		var getPathFor = function(obj, val, oneOrMany){
			var retVal = [];
			var savePath = function(path){
				retVal.push(path.substr(1));
				if(!oneOrMany || oneOrMany === 'one'){
					retVal = retVal[0];
					return false;
				}
				return true;
			}
			scanForValue(obj, val, savePath);
			return retVal[0] ? retVal : undefined;
		};

 
        //Attach properties to exports.
        exports.getPath = getPath;
        exports.setPath = setPath;
        exports.getPathFor = getPathFor;
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
