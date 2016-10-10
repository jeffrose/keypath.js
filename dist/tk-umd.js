(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.tk = global.tk || {})));
}(this, (function (exports) { 'use strict';

// Parsing, tokeninzing, etc
var EMPTY_STRING = '';
var UNDEF = (function(u){return u;})();
var WILDCARD = '*';

var useCache = true;
var advanced = false;
var force = false;

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
var propertySeparator = '.';

var containers = {
    '[': {
        'closer': ']',
        'exec': 'property'
        },
    '\'': {
        'closer': '\'',
        'exec': 'quote'
        },
    '"': {
        'closer': '"',
        'exec': 'quote'
        },
    '(': {
        'closer': ')',
        'exec': 'call'
        },
    '{': {
        'closer': '}',
        'exec': 'evalProperty'
        }
};
var containerList = Object.keys(containers);
var containerCloseList = containerList.map(function(key){ return containers[key].closer; });

var wildCardMatch = function(template, str){
    var pos = template.indexOf(WILDCARD),
        parts = template.split(WILDCARD, 2),
        match = true;
    if (parts[0]){
        match = match && str.substr(0, parts[0].length) === parts[0];
    }
    if (parts[1]){
        match = match && str.substr(pos+1) === parts[1];
    }
    return match;
};
// Find all special characters except .
var specials = '[\\\\' + [WILDCARD].concat(prefixList).concat(separatorList).concat(containerList).join('\\').replace(/\\?\./, '') + ']';
var specialRegEx = new RegExp(specials);

// Find all special characters, including backslash
var allSpecials = '[\\\\\\' + [WILDCARD].concat(prefixList).concat(separatorList).concat(containerList).concat(containerCloseList).join('\\') + ']';
var allSpecialsRegEx = new RegExp(allSpecials, 'g');

// Find all escaped special characters
var escapedSpecialsRegEx = new RegExp('\\'+allSpecials, 'g');
var escapedNonSpecialsRegEx = new RegExp('\\'+allSpecials.replace(/^\[/,'[^'));

// Find wildcard character
var wildcardRegEx = new RegExp('\\'+WILDCARD);

var isObject = function(val) {
    if (typeof val === 'undefined' || val === null) { return false;}
    return ( (typeof val === 'function') || (typeof val === 'object') );
};

var cache = {};

/*
 *  Scan input string from left to right, one character at a time. If a special character
 *  is found (one of "separators" or "containers"), either store the accumulated word as
 *  a token or else begin watching input for end of token (finding a closing character for
 *  a container or the end of a collection). If a con
 tainer is found, call tokenize

 *  recursively on string within container.
 */
var tokenize = function (str){
    var path = '';
    if (useCache && cache[str] !== UNDEF){ return cache[str]; }

    // Strip out any unnecessary escaping to simplify processing below
    path = str.replace(escapedNonSpecialsRegEx, '$&'.substr(1));

    var tokens = [],
        mods = {},
        pathLength = path.length,
        word = '',
        hasWildcard = false,
        subpath = '',
        i = 0,
        opener = '',
        closer = '',
        separator = '',
        collection = [],
        depth = 0,
        escaped = 0;

    for (i = 0; i < pathLength; i++){
        if (!escaped && path[i] === '\\'){
            // Next character is the escaped character
            escaped = i+1;
            i++;
        }
        if (path[i] === WILDCARD) {
            hasWildcard = true;
        }
        if (depth > 0){
            // Scan for closer
            !escaped && path[i] === opener && depth++;
            !escaped && path[i] === closer.closer && depth--;

            if (depth > 0){
                subpath += path[i];
            }
            // TODO: handle comma-separated elements when depth === 1, process as function arguments
            else {
                if (i+1 < pathLength && separators[path[i+1]] && separators[path[i+1]].exec === 'collection'){
                    collection.push({'t':tokenize(subpath), 'exec': closer.exec});
                }
                else if (collection[0]){
                    collection.push({'t':tokenize(subpath), 'exec': closer.exec});
                    tokens.push(collection);
                    collection = [];
                }
                else if (closer.exec === 'property'){
                    // Simple property container means to take contents as literal property,
                    // without processing special characters inside
                    if (subpath.length && containers[subpath[0]] && containers[subpath[0]].exec === 'quote' ){
                        if (subpath[subpath.length-1] === containers[subpath[0]].closer){
                            // pathip leading and trailing quote
                            tokens.push(subpath.substr(1, subpath.length - 2));
                        }
                        else {
                            // Mismatched quote inside [ ]
                            return undefined;
                        }
                    }
                    else {
                        tokens.push(subpath);
                    }
                }
                else {
                    tokens.push({'t':tokenize(subpath), 'exec': closer.exec});
                }
                subpath = '';
            }
        }
        else if (!escaped && path[i] in prefixes && prefixes[path[i]].exec){
            mods.has = true;
            if (mods[prefixes[path[i]].exec]) { mods[prefixes[path[i]].exec]++; }
            else { mods[prefixes[path[i]].exec] = 1; }
        }
        else if (!escaped && path[i] in separators && separators[path[i]].exec){
            separator = separators[path[i]];
            if (!word && (mods.has || hasWildcard)){
                // found a separator, after seeing prefixes, but no token word -> invalid
                return undefined;
            }
            if (word && (mods.has || hasWildcard)){
                word = {'w': word, 'mods': mods};
                mods = {};
            }
            if (separator.exec === 'property'){
                // word is a plain property or end of collection
                if (collection[0] !== UNDEF){
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
            hasWildcard = false;
        }
        else if (!escaped && path[i] in containers && containers[path[i]].exec && containers[path[i]].exec !== 'quote'){
            // found opener, initiate scan for closer
            closer = containers[path[i]];
            if (word && (mods.has || hasWildcard)){
                word = {'w': word, 'mods': mods};
                mods = {};
            }
            if (collection[0] !== UNDEF){
                // we are gathering a collection, so add last word to collection and then store
                word && collection.push(word);
            }
            else {
                // word is a plain property
                word && tokens.push(word);
            }
            word = '';
            hasWildcard = false;
            opener = path[i];
            depth++;
        }
        else if (i < pathLength) {
            // still accumulating property name
            word += path[i];
        }
        if (i < pathLength && i === escaped){
            escaped = 0;
        }
    }

    if (escaped){
        // Path ended in an escape character
        return undefined;
    }

    // add trailing word to tokens, if present
    if (word && (mods.has || hasWildcard)){
        word = {'w': word, 'mods': mods};
        mods = {};
    }
    if (collection[0] !== UNDEF){
        // we are gathering a collection, so add last word to collection and then store
        word && collection.push(word);
        tokens.push(collection);
    }
    else {
        // word is a plain property
        word && tokens.push(word);
    }

    // depth != 0 means mismatched containers
    if (depth !== 0){ return undefined; }

    // If path was valid, cache the result
    useCache && (cache[str] = tokens);
    return tokens;
};

var resolvePath = function (obj, path, newValue, args, valueStack){
    var change = newValue !== UNDEF,
        tk = [],
        tkLength = 0,
        tkLastIdx = 0,
        valueStackLength = 1,
        i = 0,
        prev = obj,
        curr = '',
        currLength = 0,
        temp = {},
        contextProp,
        idx = 0,
        context = obj,
        ret,
        newValueHere = false,
        placeInt = 0,
        prop = '',
        callArgs;

    if (typeof path === 'string' && !specialRegEx.test(path)){
        tk = path.split(propertySeparator);
        tkLength = tk.length;
        while (prev !== UNDEF && i < tkLength){
            if (tk[i] === EMPTY_STRING){ return undefined; }
            else if (change){
                if (i === tkLength - 1){
                    prev[tk[i]] = newValue;
                }
            }
            prev = prev[tk[i]];
            i++;
        }
        return prev;
    }


    // Either a full token set was provided or else the path includes
    // some special characters and must be evaluated more carefully.
    // tk = typeof path === 'string' ? tokenize(path) : path.t ? path.t : [path];
    if (typeof path === 'string'){
        if (useCache && cache[path]) { tk = cache[path]; }
        else {
            tk = tokenize(path);
            if (tk === UNDEF){ return undefined; }
        }
    }
    else {
        tk = path.t ? path.t : [path];
    }

    tkLength = tk.length;
    if (tkLength === 0) { return undefined; }
    tkLastIdx = tkLength - 1;

    // if (typeof valueStack === 'undefined'){
    if (valueStack){
        valueStackLength = valueStack.length;
    }
    else {
        valueStack = [obj]; // Initialize valueStack with original data object; length already init to 1
    }

    // Converted Array.reduce into while loop, still using "prev", "curr", "idx"
    // as loop values
    while (prev !== UNDEF && idx < tkLength){
        curr = tk[idx];
        newValueHere = (change && (idx === tkLastIdx));

        if (typeof curr === 'string'){
            if (newValueHere){
                context[curr] = newValue;
                if (context[curr] !== newValue){ return undefined; } // new value failed to set
            }
            ret = context[curr];
        }
        else {
            if (Array.isArray(curr)){
                // call resolvePath again with base value as evaluated value so far and
                // each element of array as the path. Concat all the results together.
                ret = [];
                currLength = curr.length
                for (i = 0; i < currLength; i++){
                    contextProp = resolvePath(context, curr[i], newValue, args, valueStack.concat());
                    if (contextProp === UNDEF) { return undefined; }

                    if (newValueHere){
                        if (curr[i].t && curr[i].exec === 'evalProperty'){
                            context[contextProp] = newValue;
                        } else {
                            ret = ret.concat(contextProp);
                        }
                    }
                    else {
                        if (curr[i].t && curr[i].exec === 'evalProperty'){
                            ret = ret.concat(context[contextProp]);
                        } else {
                            ret = ret.concat(contextProp);
                        }
                    }
                }
            }
            else if (curr === UNDEF){
                ret = undefined;
            }
            else if (curr.w){
                temp = {
                    w: curr.w + '',
                    exec: curr.exec,
                    mods: {
                        parent: curr.mods.parent,
                        root: curr.mods.root,
                        placeholder: curr.mods.placeholder
                    }
                };
                // this word token has modifiers, modify current context
                if (temp.mods.parent){
                    context = valueStack[valueStackLength - 1 - temp.mods.parent];
                    if (context === UNDEF) { return undefined; }
                }
                if (temp.mods.root){
                    // Reset context and valueStack, start over at root in this context
                    context = valueStack[0];
                    valueStack = [context];
                    valueStackLength = 1;
                }
                if (temp.mods.placeholder){
                    placeInt = Number.parseInt(temp.w) - 1;
                    if (args[placeInt] === UNDEF){ return undefined; }
                    // Force args[placeInt] to String, won't attempt to process
                    // arg of type function, array, or plain object
                    temp.w = args[placeInt].toString();
                    delete(temp.mods.placeholder); // Once value has been replaced, don't want to re-process this entry
                    delete(temp.mods.has);
                }

                // Repeat basic string property processing with word and modified context
                if (context[temp.w] !== UNDEF) {
                    if (newValueHere){ context[temp.w] = newValue; }
                    ret = context[temp.w];
                }
                else if (typeof context === 'function'){
                    ret = temp.w;
                }
                else if (wildcardRegEx.test(temp.w) >-1){
                    ret = [];
                    for (prop in context){
                        if (context.hasOwnProperty(prop) && wildCardMatch(temp.w, prop)){
                            if (newValueHere){ context[prop] = newValue; }
                            ret.push(context[prop]);
                        }
                    }
                }
                else { return undefined; }
            }
            else if (curr.exec === 'evalProperty'){
                if (newValueHere){
                    context[resolvePath(context, curr, newValue, args, valueStack.concat())] = newValue;
                }
                ret = context[resolvePath(context, curr, newValue, args, valueStack.concat())];
            }
            else if (curr.exec === 'call'){
                // TODO: handle params for function
                callArgs = resolvePath(context, curr, newValue, args, valueStack.concat());
                if (callArgs === UNDEF){
                    ret = context.apply(valueStack[valueStackLength - 2]);
                }
                else if (Array.isArray(callArgs)){
                    ret = context.apply(valueStack[valueStackLength - 2], callArgs);
                }
                else {
                    ret = context.call(valueStack[valueStackLength - 2], callArgs);
                }
            }
        }
        valueStack.push(ret);
        valueStackLength++;
        context = ret;
        prev = ret;
        idx++;
    }
    return context;
};

var scanForValue = function(obj, val, savePath, path){
    var i, len, prop, more;

    path = path ? path : '';

    if (obj === val){
        return savePath(path); // true -> keep looking; false -> stop now
    }
    else if (Array.isArray(obj)){
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

var getTokens = function(path){
    var tokens = tokenize(path);
    if (typeof tokens === 'undefined'){ return undefined; }
    return {t: tokens};
};

var isValid = function(path){
    return typeof tokenize(path) !== 'undefined';
};

var escape = function(path){
    return path.replace(allSpecialsRegEx, '\\$&');
};

var get = function (obj, path){
    var i = 0,
        len = arguments.length,
        args = len > 2 ? new Array(len - 2) : [];
    if (len > 2){
        for (i = 2; i < len; i++) { args[i-2] = arguments[i]; }
    }
    return resolvePath(obj, path, undefined, args);
};

var set = function(obj, path, val){
    var i = 0,
        len = arguments.length,
        args = len > 3 ? new Array(len - 3) : [],
        ref;
    if (len > 3){
        for (i = 3; i < len; i++) { args[i-3] = arguments[i]; }
    }
    ref = resolvePath(obj, path, val, args);
    if (Array.isArray(ref)){
        return ref.indexOf(undefined) === -1;
    }
    return ref !== UNDEF;
};

var find = function(obj, val, oneOrMany){
    var retVal = [];
    var savePath = function(path){
        retVal.push(path.substr(1));
        if(!oneOrMany || oneOrMany === 'one'){
            retVal = retVal[0];
            return false;
        }
        return true;
    };
    scanForValue(obj, val, savePath);
    return retVal[0] ? retVal : undefined;
};

var setOptions = function(options){
    if (options.prefixes){
        for (var p in options.prefixes){
            if (options.prefixes.hasOwnProperty(p)){
                prefixes[p] = options.prefixes[p];
            }
        }
        prefixList = Object.keys(prefixes);
    }
    if (options.separators){
        for (var s in options.separators){
            if (options.separators.hasOwnProperty(s)){
                separators[s] = options.separators[s];
                if (separators[s].exec === 'property'){
                    propertySeparator = s;
                }
            }
        }
        separatorList = Object.keys(separators);
    }
    if (options.containers){
        for (var c in options.containers){
            if (options.containers.hasOwnProperty(c)){
                containers[c] = options.containers[c];
            }
        }
        containerList = Object.keys(containers);
    }
    if (typeof options.cache !== 'undefined'){
        useCache = !!options.cache;
    }
    if (typeof options.advanced !== 'undefined'){
        advanced = !!options.advanced;
    }
    if (typeof options.force !== 'undefined'){
        force = !!options.force;
    }
    // Reset all special character sets and regular expressions
    specials = ('[\\\\' + [WILDCARD].concat(prefixList).concat(separatorList).concat(containerList).join('\\') + ']').replace('\\'+propertySeparator, '');
    specialRegEx = new RegExp(specials);
    allSpecials = '[\\\\\\' + [WILDCARD].concat(prefixList).concat(separatorList).concat(containerList).concat(containerCloseList).join('\\') + ']';
    allSpecialsRegEx = new RegExp(allSpecials, 'g');
    escapedSpecialsRegEx = new RegExp('\\'+allSpecials, 'g');
};

exports.getTokens = getTokens;
exports.isValid = isValid;
exports.escape = escape;
exports.get = get;
exports.set = set;
exports.find = find;
exports.setOptions = setOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=tk-umd.js.map