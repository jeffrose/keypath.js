// Parsing, tokeninzing, etc
'use strict';

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
},
prefixList = Object.keys(prefixes);

var separators = {
    '.': {
        'exec': 'property'
        },
    ',': {
        'exec': 'collection'
        }
},
separatorList = Object.keys(separators),
propertySeparator = '.';

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
},
containerList = Object.keys(containers),
containerCloseList = containerList.map(function(key){ return containers[key].closer; });

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
// Find all special characters except .
var specials = '[\\\\' + ['*'].concat(prefixList).concat(separatorList).concat(containerList).join('\\').replace(/\\?\./, '') + ']';
var specialRegEx = new RegExp(specials);

// Find all special characters, including backslash
var allSpecials = '[\\\\\\' + ['*'].concat(prefixList).concat(separatorList).concat(containerList).concat(containerCloseList).join('\\') + ']';
var allSpecialsRegEx = new RegExp(allSpecials, 'g');

// Find all escaped special characters
var escapedSpecialsRegEx = new RegExp('\\'+allSpecials, 'g');
var escapedNonSpecialsRegEx = new RegExp('\\'+allSpecials.replace(/^\[/,'[^'));

var isObject = function(val) {
    if (val === null) { return false;}
    return ( (typeof val === 'function') || (typeof val === 'object') );
};

var flatten = function(ary){
    ary = Array.isArray(ary) ? ary : [ary];
    return ary.reduce(function(a, b) {
      return a.concat(b);
    },[]);
};

var useCache = true,
    cache = {};

/*
 *  Scan input string from left to right, one character at a time. If a special character
 *  is found (one of "separators" or "containers"), either store the accumulated word as
 *  a token or else begin watching input for end of token (finding a closing character for
 *  a container or the end of a collection). If a container is found, call tokenize
 *  recursively on string within container.
 */
var tokenize = function (str){
    // Strip out any unnecessary escaping to simplify processing below
    str = str.replace(escapedNonSpecialsRegEx, '$&'.substr(1));
    if (useCache && cache[str]){ return cache[str]; }

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
        depth = 0,
        escaped = 0;

    // console.log('Parsing:', str);

    for (i = 0; i < strLength; i++){
        if (!escaped && str[i] === '\\'){
            // Next character is the escaped character
            escaped = i+1;
        }
        if (depth > 0){
            // Scan for closer
            !escaped && str[i] === opener && depth++;
            !escaped && str[i] === closer.closer && depth--;

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
        else if (!escaped && str[i] in prefixes){
            mods.has = true;
            if (mods[prefixes[str[i]].exec]) { mods[prefixes[str[i]].exec]++; }
            else { mods[prefixes[str[i]].exec] = 1; }
        }
        else if (!escaped && str[i] in separators){
            separator = separators[str[i]];
            if (!word && mods.has){
                // found a separator, after seeing prefixes, but no token word -> invalid
                return undefined;
            }
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
        else if (!escaped && str[i] in containers){
            // found opener, initiate scan for closer
            closer = containers[str[i]];
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
        if (i === escaped){
            escaped = 0;
        }
    }

    if (escaped){
        // Path ended in an escape character
        return undefined;
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

    // depth != 0 means mismatched containers
    if (depth !== 0){ return undefined; }

    useCache && (cache[str] = tokens);
    return tokens;
};

var resolvePath = function (obj, path, newValue, args, valueStack){
    var change = newValue !== undefined,
        tk = [],
        tkLength = 0,
        tkLastIdx = 0,
        valueStackLength = 1,
        i = 0,
        prev = obj,
        curr = '',
        currLength = 0,
        contextProp,
        idx = 0,
        context = obj,
        ret,
        newValueHere = false;

    // // Strip all escaped characters from path then test for presence of
    // // special characters other than <propertySeparator>. If no other
    // // specials are found, this is a "simple path" that can be evaluated
    // // with a very fast while loop. E.g., "foo.bar.2" or "people.John Q\. Doe.id"
    // if (typeof path === 'string' && !path.replace(escapedSpecialsRegEx,'').match(specialRegEx)){
    //     tk = path.split(propertySeparator);
    //     tkLength = tk.length;
    //     while (prev !== undefined && i < tkLength){
    //         if (tk[i] === EMPTY_STRING){ return undefined; }
    //         else if (change){
    //             if (i === tkLength - 1){
    //                 prev[tk[i]] = newValue;
    //             }
    //         }
    //         prev = prev[tk[i]];
    //         i++;
    //     }
    //     return prev;
    // }

    // Either a full token set was provided or else the path includes
    // some special characters and must be evaluated more carefully.
    tk = typeof path === 'string' ? tokenize(path) : path.t ? path.t : [path];
    if (typeof tk === 'undefined'){ return undefined; }
    tkLength = tk.length;
    if (tkLength === 0) { return undefined; }
    tkLastIdx = tkLength - 1;

    if (typeof valueStack === 'undefined'){
        valueStack = [obj]; // Initialize valueStack with original data object; length already init to 1
    }
    else {
        valueStackLength = valueStack.length;
    }

    // Converted Array.reduce into while loop, still using "prev", "curr", "idx"
    // as loop values
    while (prev !== undefined && idx < tkLength){
        curr = tk[idx];
        newValueHere = (change && (idx === tkLastIdx));

        if (typeof curr === 'string'){
            if (curr.indexOf('*') >-1){
                ret = [];
                for (var prop in context){
                    if (context.hasOwnProperty(prop) && wildCardMatch(curr, prop)){
                        if (newValueHere){ context[prop] = newValue; }
                        ret.push(context[prop]);
                    }
                }
            }
            else {
                if (newValueHere){
                    context[curr] = newValue;
                    if (context[curr] !== newValue){ return undefined; } // new value failed to set
                }
                ret = context[curr];

            }
        }
        else {
            if (Array.isArray(curr)){
                // call resolvePath again with base value as evaluated value so far and
                // each element of array as the path. Concat all the results together.
                ret = [];
                currLength = curr.length
                for (i = 0; i < currLength; i++){
                    contextProp = resolvePath(context, curr[i], newValue, args, valueStack.concat());
                    if (typeof contextProp === 'undefined') { return undefined; }

                    if (newValueHere){
                        if (curr[i].t && curr[i].exec === 'property'){
                            context[contextProp] = newValue;
                        } else {
                            ret = ret.concat(contextProp);
                        }
                    }
                    else {
                        if (curr[i].t && curr[i].exec === 'property'){
                            ret = ret.concat(context[contextProp]);
                        } else {
                            ret = ret.concat(contextProp);
                        }
                    }
                }
            }
            else if (typeof curr === 'undefined'){
                ret = undefined;
            }
            else if (curr.w){
                // this word token has modifiers, modify current context
                if (curr.mods.parent){
                    context = valueStack[valueStackLength - 1 - curr.mods.parent];
                    if (typeof context === 'undefined') { return undefined; }
                }
                if (curr.mods.root){
                    // Reset context and valueStack, start over at root in this context
                    context = valueStack[0];
                    valueStack = [context];
                    valueStackLength = 1;
                }
                if (curr.mods.placeholder){
                    var placeInt = Number.parseInt(curr.w) - 1;
                    if (typeof args[placeInt] === 'undefined'){ return undefined; }
                    // Force args[placeInt] to String, won't attempt to process
                    // arg of type function, array, or plain object
                    curr.w = args[placeInt].toString();
                    delete(curr.mods.placeholder); // Once value has been replaced, don't want to re-process this entry
                    delete(curr.mods.has);
                }

                // Repeat basic string property processing with word and modified context
                if (typeof context[curr.w] !== 'undefined') {
                    if (newValueHere){ context[curr.w] = newValue; }
                    ret = context[curr.w];
                }
                else if (typeof context === 'function'){
                    ret = curr.w;
                }
                else if (curr.w.indexOf('*') >-1){
                    ret = [];
                    for (var prop in context){
                        if (context.hasOwnProperty(prop) && wildCardMatch(curr.w, prop)){
                            if (newValueHere){ context[prop] = newValue; }
                            ret.push(context[prop]);
                        }
                    }
                }
                else { return undefined; }
            }
            else if (curr.exec === 'property'){
                if (newValueHere){
                    context[resolvePath(context, curr, newValue, args, valueStack.concat())] = newValue;
                }
                ret = context[resolvePath(context, curr, newValue, args, valueStack.concat())];
            }
            else if (curr.exec === 'call'){
                // TODO: handle params for function
                var callArgs = resolvePath(context, curr, newValue, args, valueStack.concat());
                if (callArgs === undefined){
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

export var getTokens = function(path){
    var tokens = tokenize(path);
    if (typeof tokens === 'undefined'){ return undefined; }
    return {t: tokenize(path)};
};

export var isValid = function(path){
    return typeof tokenize(path) !== 'undefined';
};

export var escape = function(path){
    return path.replace(allSpecialsRegEx, '\\$&');
};

export var getPath = function (obj, path){
    var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : [];
    return resolvePath(obj, path, undefined, args);
};

export var setPath = function(obj, path, val){
    var args = arguments.length > 3 ? Array.prototype.slice.call(arguments, 3) : [],
        ref = resolvePath(obj, path, val, args);
    if (Array.isArray(ref)){
        return ref.indexOf(undefined) === -1;
    }
    return typeof ref !== 'undefined';
};

export var getPathFor = function(obj, val, oneOrMany){
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

export var setOptions = function(options){
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
    // Reset all special character sets and regular expressions
    specials = ('[\\' + ['*'].concat(prefixList).concat(separatorList).concat(containerList).join('\\') + ']').replace('\\'+propertySeparator, '');
    specialRegEx = new RegExp(specials);
    allSpecials = '[\\\\\\' + ['*'].concat(prefixList).concat(separatorList).concat(containerList).concat(containerCloseList).join('\\') + ']';
    allSpecialsRegEx = new RegExp(allSpecials, 'g');
    escapedSpecialsRegEx = new RegExp('\\'+allSpecials, 'g');
};
