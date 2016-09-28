(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.tk = global.tk || {})));
}(this, (function (exports) { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};















var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

// Parsing, tokeninzing, etc
var EMPTY_STRING = '';

var prefixes = {
    '<': {
        'exec': 'parent'
    },
    '~': {
        'exec': 'root'
    },
    '%': {
        'exec': 'placeholder'
    }
};
var prefixList = Object.keys(prefixes);

var separators = {
    '.': {
        'exec': 'property'
    },
    ',': {
        'exec': 'collection'
    }
};
var separatorList = Object.keys(separators);

var containers = {
    // '[': {
    //     'closer': ']',
    //     'exec': '??'
    //     },
    '(': {
        'closer': ')',
        'exec': 'call'
    },
    '{': {
        'closer': '}',
        'exec': 'property'
    }
};
var containerList = Object.keys(containers);

var wildCardMatch = function wildCardMatch(template, str) {
    var pos = template.indexOf('*'),
        parts = template.split('*', 2),
        match = true;
    if (parts[0]) {
        match = match && str.substr(0, parts[0].length) === parts[0];
    }
    if (parts[1]) {
        match = match && str.substr(pos + 1) === parts[1];
    }
    return match;
};
var specials = '[\\' + ['*'].concat(prefixList).concat(separatorList).concat(containerList).join('\\').replace(/\\?\./, '') + ']';
var specialRegEx = new RegExp(specials);

var isObject = function isObject(val) {
    if (val === null) {
        return false;
    }
    return typeof val === 'function' || (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object';
};

var useCache = true;
var cache = {};

/*
 *  Scan input string from left to right, one character at a time. If a special character
 *  is found (one of "separators" or "containers"), either store the accumulated word as
 *  a token or else begin watching input for end of token (finding a closing character for
 *  a container or the end of a collection). If a container is found, call tokenize
 *  recursively on string within container.
 */
var tokenize = function tokenize(str) {
    if (useCache && cache[str]) {
        return cache[str];
    }

    var tokens = [],
        mods = {},
        strLength = str.length,
        word = '',
        substr = '',
        i = 0,
        opener = '',
        closer = '',
        separator = '',
        collection = [],
        depth = 0;

    // console.log('Parsing:', str);

    for (i = 0; i < strLength; i++) {
        if (depth > 0) {
            // Scan for closer
            str[i] === opener && depth++;
            str[i] === closer.closer && depth--;

            if (depth > 0) {
                substr += str[i];
            }
            // TODO: handle comma-separated elements when depth === 1, process as function arguments
            else {
                    if (i + 1 < strLength && separators[str[i + 1]] && separators[str[i + 1]].exec === 'collection') {
                        collection.push({ 't': tokenize(substr), 'exec': closer.exec });
                    } else if (collection[0]) {
                        collection.push({ 't': tokenize(substr), 'exec': closer.exec });
                        tokens.push(collection);
                        collection = [];
                    } else {
                        tokens.push({ 't': tokenize(substr), 'exec': closer.exec });
                    }
                    substr = '';
                }
        } else if (str[i] in prefixes) {
            mods.has = true;
            if (mods[prefixes[str[i]].exec]) {
                mods[prefixes[str[i]].exec]++;
            } else {
                mods[prefixes[str[i]].exec] = 1;
            }
        } else if (str[i] in separators) {
            separator = separators[str[i]];
            if (word && mods.has) {
                word = { 'w': word, 'mods': mods };
                mods = {};
            }
            if (separator.exec === 'property') {
                // word is a plain property or end of collection
                if (collection[0] !== undefined) {
                    // we are gathering a collection, so add last word to collection and then store
                    word && collection.push(word);
                    tokens.push(collection);
                    collection = [];
                } else {
                    // word is a plain property
                    word && tokens.push(word);
                }
            } else if (separator.exec === 'collection') {
                // word is a collection
                word && collection.push(word);
            }
            word = '';
        } else if (str[i] in containers) {
            // found opener, initiate scan for closer
            closer = containers[str[i]];
            if (word && mods.has) {
                word = { 'w': word, 'mods': mods };
                mods = {};
            }
            if (collection[0] !== undefined) {
                // we are gathering a collection, so add last word to collection and then store
                word && collection.push(word);
            } else {
                // word is a plain property
                word && tokens.push(word);
            }
            word = '';
            opener = str[i];
            depth++;
        } else {
            // still accumulating property name
            word += str[i];
        }
    }
    // add trailing word to tokens, if present
    if (word && mods.has) {
        word = { 'w': word, 'mods': mods };
        mods = {};
    }
    if (collection[0] !== undefined) {
        // we are gathering a collection, so add last word to collection and then store
        word && collection.push(word);
        tokens.push(collection);
    } else {
        // word is a plain property
        word && tokens.push(word);
    }

    // depth != 0 means mismatched containers
    if (depth !== 0) {
        return undefined;
    }

    useCache && (cache[str] = tokens);
    return tokens;
};

// var getContext = function getContext(context, valueStack, word){
//  if (!prefixes[word[0]]){
//      return context;
//  }
//  var counter = 0,
//      prefix,
//      newContext;
//  while (prefix = prefixes[word[counter]]){
//      if (prefix.exec === 'parent'){
//          newContext = valueStack[counter + 1];
//      }
//      counter++;
//  }
//  return newContext;
// };

// var cleanWord = function cleanWord(word){
//  if(!prefixes[word[0]]){
//      return word;
//  }
//  var len = word.length;
//  for (var i = 1; i < len; i++){
//      if (!prefixes[word[i]]){
//          return word.substr(i);
//      }
//  }
//  return '';
// }

var resolvePath = function resolvePath(obj, path, newValue, args, valueStack) {
    var change = newValue !== undefined,
        tk = typeof path === 'string' ? tokenize(path) : path.t ? path.t : [path],
        tkLength = tk.length,
        tkLastIdx = tkLength - 1,
        i = 0,
        prev = obj,
        curr = '',
        idx = 0,
        context = obj,
        ret,
        newValueHere = false;

    if (tkLength === 0) {
        return undefined;
    }

    if (typeof path === 'string' && typeof newValue === 'undefined' && !path.match(specialRegEx)) {
        while (prev !== undefined && i < tkLength) {
            if (i === EMPTY_STRING) {
                prev = undefined;
            } else {
                prev = prev[tk[i]];
            }
            i++;
        }
        return prev;
    }

    valueStack = valueStack || [obj]; // Initialize valueStack with original data object
    args = args || []; // args defaults to empty array

    // Converted Array.reduce into while loop, still using "prev", "curr", "idx"
    // as loop values
    while (prev !== undefined && idx < tkLength) {
        curr = tk[idx];
        newValueHere = change && idx === tkLastIdx;

        if (typeof curr === 'string') {
            // Cannot do ".hasOwnProperty" here since that breaks when testing
            // for functions defined on prototypes (e.g. [1,2,3].sort())
            if (typeof context[curr] !== 'undefined') {
                if (newValueHere) {
                    context[curr] = newValue;
                }
                ret = context[curr];
            } else if (curr.indexOf('*') > -1) {
                ret = [];
                for (var prop in context) {
                    if (context.hasOwnProperty(prop) && wildCardMatch(curr, prop)) {
                        if (newValueHere) {
                            context[prop] = newValue;
                        }
                        ret.push(context[prop]);
                    }
                }
            } else {
                return undefined;
            }
        } else if (Array.isArray(curr)) {
            // call resolvePath again with base value as evaluated value so far and
            // each element of array as the path. Concat all the results together.
            ret = [];
            for (i = 0; curr[i] !== undefined; i++) {
                if (newValueHere) {
                    if (curr[i].t && curr[i].exec === 'property') {
                        context[resolvePath(context, curr[i], newValue, args, valueStack.concat())] = newValue;
                        ret = ret.concat(context[resolvePath(context, curr[i], newValue, args, valueStack.concat())]);
                    } else {
                        ret = ret.concat(resolvePath(context, curr[i], newValue, args, valueStack.concat()));
                    }
                } else {
                    if (curr[i].t && curr[i].exec === 'property') {
                        ret = ret.concat(context[resolvePath(context, curr[i], newValue, args, valueStack.concat())]);
                    } else {
                        ret = ret.concat(resolvePath(context, curr[i], newValue, args, valueStack.concat()));
                    }
                }
            }
        } else if (typeof curr === 'undefined' || typeof prev === 'undefined') {
            ret = undefined;
        } else if (curr.w) {
            // this word token has modifiers, modify current context
            if (curr.mods.parent) {
                context = valueStack[curr.mods.parent];
                if (typeof context === 'undefined') {
                    return undefined;
                }
            }
            if (curr.mods.root) {
                // Reset context and valueStack, start over at root in this context
                context = valueStack[valueStack.length - 1];
                valueStack = [context];
            }
            if (curr.mods.placeholder) {
                if (curr.w.length === 0) {
                    return undefined;
                }
                var placeInt = Number.parseInt(curr.w) - 1;
                if (typeof args[placeInt] === 'undefined') {
                    return undefined;
                }
                // Force args[placeInt] to String, won't attempt to process
                // arg of type function, array, or plain object
                curr.w = args[placeInt].toString();
                delete curr.mods.placeholder; // Once value has been replaced, don't want to re-process this entry
                delete curr.mods.has;
            }

            // Repeat basic string property processing with word and modified context
            if (context.hasOwnProperty(curr.w)) {
                if (newValueHere) {
                    context[curr.w] = newValue;
                }
                ret = context[curr.w];
            } else if (typeof context === 'function') {
                ret = curr.w;
            } else if (curr.w.indexOf('*') > -1) {
                ret = [];
                for (var prop in context) {
                    if (context.hasOwnProperty(prop) && wildCardMatch(curr.w, prop)) {
                        if (newValueHere) {
                            context[prop] = newValue;
                        }
                        ret.push(context[prop]);
                    }
                }
            } else {
                return undefined;
            }
        } else if (curr.exec === 'property') {
            if (newValueHere) {
                context[resolvePath(context, curr, newValue, args, valueStack.concat())] = newValue;
            }
            ret = context[resolvePath(context, curr, newValue, args, valueStack.concat())];
        } else if (curr.exec === 'call') {
            // TODO: handle params for function
            var callArgs = resolvePath(context, curr, newValue, args, valueStack.concat());
            if (callArgs === undefined) {
                ret = context.apply(valueStack[1]);
            } else if (Array.isArray(callArgs)) {
                ret = context.apply(valueStack[1], callArgs);
            } else {
                ret = context.call(valueStack[1], callArgs);
            }
        }
        valueStack.unshift(ret);
        context = ret;
        prev = ret;
        idx++;
    }
    return context;
};

var scanForValue = function scanForValue(obj, val, savePath, path) {
    var i, len, prop, more;

    path = path ? path : '';

    if (obj === val) {
        return savePath(path); // true -> keep looking; false -> stop now
    } else if (Array.isArray(obj)) {
        len = obj.length;
        for (i = 0; i < len; i++) {
            more = scanForValue(obj[i], val, savePath, path + '.' + i);
            if (!more) {
                return;
            }
        }
        return true; // keep looking
    } else if (isObject(obj)) {
        for (prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                more = scanForValue(obj[prop], val, savePath, path + '.' + prop);
                if (!more) {
                    return;
                }
            }
        }
        return true; // keep looking
    }
    // Leaf node (string, number, character, boolean, etc.), but didn't match
    return true; // keep looking
};

var getTokens = function getTokens(path) {
    return { t: tokenize(path) };
};

var getPath = function getPath(obj, path) {
    var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : [];
    return resolvePath(obj, path, undefined, args);
};

var setPath = function setPath(obj, path, val) {
    var args = arguments.length > 3 ? Array.prototype.slice.call(arguments, 3) : [],
        ref = resolvePath(obj, path, val, args);
    if (Array.isArray(ref)) {
        return ref.indexOf(undefined) === -1;
    }
    return typeof ref !== 'undefined';
};

var getPathFor = function getPathFor(obj, val, oneOrMany) {
    var retVal = [];
    var savePath = function savePath(path) {
        retVal.push(path.substr(1));
        if (!oneOrMany || oneOrMany === 'one') {
            retVal = retVal[0];
            return false;
        }
        return true;
    };
    scanForValue(obj, val, savePath);
    return retVal[0] ? retVal : undefined;
};

var setOptions = function setOptions(options) {
    if (options.prefixes) {
        for (var p in options.prefixes) {
            if (options.prefixes.hasOwnProperty(p)) {
                prefixes[p] = options.prefixes[p];
            }
        }
    }
    if (options.separators) {
        for (var s in options.separators) {
            if (options.separators.hasOwnProperty(s)) {
                separators[s] = options.separators[s];
            }
        }
    }
    if (options.containers) {
        for (var c in options.containers) {
            if (options.containers.hasOwnProperty(c)) {
                containers[c] = options.containers[c];
            }
        }
    }
    if (typeof options.cache !== 'undefined') {
        useCache = !!options.cache;
    }
};

exports.getTokens = getTokens;
exports.getPath = getPath;
exports.setPath = setPath;
exports.getPathFor = getPathFor;
exports.setOptions = setOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=tk-umd.js.map