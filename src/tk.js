// Parsing, tokeninzing, etc
'use strict';

// Some constants for convenience
var UNDEF = (function(u){return u;})();
var WILDCARD = '*';

// Object for storing cached tokenized paths.
// Key = string path
// Value = tokens
var cache = {};

// Default settings
var useCache = true,  // cache tokenized paths for repeated use
    advanced = false, // not yet implemented
    force = false;    // create intermediate properties during `set` operation

    // Default prefix special characters
var prefixes = {
        '<': {
            'exec': 'parent'
        },
        '~': {
            'exec': 'root'
        },
        '%': {
            'exec': 'placeholder'
        },
        '@': {
            'exec': 'context'
        }
    },
    // Default separator special characters
    separators = {
        '.': {
            'exec': 'property'
            },
        ',': {
            'exec': 'collection'
            }
    },
    // Default container special characters
    containers = {
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

// Lists of special characters for use in regular expressions
var prefixList = Object.keys(prefixes),
    propertySeparator = '.',
    separatorList = Object.keys(separators),
    containerList = Object.keys(containers),
    containerCloseList = containerList.map(function(key){ return containers[key].closer; });

// Find all special characters except property separator (. by default)
var simplePathChars = '[\\\\' + [WILDCARD].concat(prefixList).concat(separatorList).concat(containerList).join('\\').replace(/\\?\./, '') + ']';
var simplePathRegEx = new RegExp(simplePathChars);

// Find all special characters, including backslash
var allSpecials = '[\\\\\\' + [WILDCARD].concat(prefixList).concat(separatorList).concat(containerList).concat(containerCloseList).join('\\') + ']';
var allSpecialsRegEx = new RegExp(allSpecials, 'g');

// Find all escaped special characters
var escapedSpecialsRegEx = new RegExp('\\'+allSpecials, 'g');
// Find all escaped non-special characters, i.e. unnecessary escapes
var escapedNonSpecialsRegEx = new RegExp('\\'+allSpecials.replace(/^\[/,'[^'));

// Find wildcard character
var wildcardRegEx = new RegExp('\\'+WILDCARD);

/**
 * Private Function
 * Tests whether a wildcard templates matches a given string.
 * ```javascript
 * var str = 'aaabbbxxxcccddd';
 * wildCardMatch('aaabbbxxxcccddd'); // true
 * wildCardMatch('*', str); // true
 * wildCardMatch('*', ''); // true
 * wildCardMatch('a*', str); // true
 * wildCardMatch('aa*ddd', str); // true
 * wildCardMatch('*d', str); // true
 * wildCardMatch('*a', str); // false
 * wildCardMatch('a*z', str); // false
 * ```
 * @param  {String} template Wildcard pattern
 * @param  {String} str      String to match against wildcard pattern
 * @return {Boolean}          True if pattern matches string; False if not
 */
var wildCardMatch = function(template, str){
    var pos = template.indexOf(WILDCARD),
        parts = template.split(WILDCARD, 2),
        match = true;
    if (parts[0]){
        // If no wildcard present, return simple string comparison
        if (parts[0] === template){
            return parts[0] === str;
        }
        else {
            match = match && str.substr(0, parts[0].length) === parts[0];
        }
    }
    if (parts[1]){
        match = match && str.substr(-1*parts[1].length) === parts[1];
    }
    return match;
};

/**
 * Private Function
 * Inspect input value and determine whether it is an Object or not.
 * Values of undefined and null will return "false", otherwise
 * must be of type "object" or "function".
 * @param  {Object}  val Thing to examine, may be of any type
 * @return {Boolean}     True if thing is of type "object" or "function"
 */
var isObject = function(val) {
    if (typeof val === 'undefined' || val === null) { return false;}
    return ( (typeof val === 'function') || (typeof val === 'object') );
};

/*
 *  Scan input string from left to right, one character at a time. If a special character
 *  is found (one of "separators" or "containers"), either store the accumulated word as
 *  a token or else begin watching input for end of token (finding a closing character for
 *  a container or the end of a collection). If a con
 tainer is found, call tokenize

 *  recursively on string within container.
 */

/**
 * Private Function
 * Scan input string from left to right, one character at a time. If a special character
 * is found (one of "separators", "containers", or "prefixes"), either store the accumulated
 * word as a token or else begin watching input for end of token (finding a closing character
 * for a container or the end of a collection). If a container is found, capture the substring
 * within the container and recursively call `tokenize` on that substring. Final output will
 * be an array of tokens. A complex token (not a simple property or index) will be represented
 * as an object carrying metadata for processing.
 * @param  {String} str Path string
 * @return {Array}     Array of tokens found in the input path
 */
var tokenize = function (str){
    var path = '',
        tokens = [],
        recur = [],
        mods = {},
        pathLength = 0,
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

    if (useCache && cache[str] !== UNDEF){ return cache[str]; }

    // Strip out any unnecessary escaping to simplify processing below
    path = str.replace(escapedNonSpecialsRegEx, '$&'.substr(1));
    pathLength = path.length;

    for (i = 0; i < pathLength; i++){
        // Skip escape character (`\`) and set "escaped" to the index value
        // of the character to be treated as a literal
        if (!escaped && path[i] === '\\'){
            // Next character is the escaped character
            escaped = i+1;
            i++;
        }
        // If a wildcard character is found, mark this token as having a wildcard
        if (path[i] === WILDCARD) {
            hasWildcard = true;
        }
        // If we have already processed a container opener, treat this subpath specially
        if (depth > 0){
            // Is this character another opener from the same container? If so, add to
            // the depth level so we can match the closers correctly. (Except for quotes
            // which cannot be nested)
            // Is this character the closer? If so, back out one level of depth.
            // Be careful: quote container uses same character for opener and closer.
            !escaped && path[i] === opener && opener !== closer.closer && depth++;
            !escaped && path[i] === closer.closer && depth--;

            // While still inside the container, just add to the subpath
            if (depth > 0){
                subpath += path[i];
            }
            // When we close off the container, time to process the subpath and add results to our tokens
            else {
                // Handle subpath "[bar]" in foo.[bar],[baz] - we must process subpath and create a new collection
                if (i+1 < pathLength && separators[path[i+1]] && separators[path[i+1]].exec === 'collection'){
                    recur = tokenize(subpath);
                    if (recur === UNDEF){ return undefined; }
                    collection.push({'t':recur, 'exec': closer.exec});
                }
                // Handle subpath "[baz]" in foo.[bar],[baz] - we must process subpath and add to collection
                else if (collection[0]){
                    recur = tokenize(subpath);
                    if (recur === UNDEF){ return undefined; }
                    collection.push({'t':recur, 'exec': closer.exec});
                    tokens.push(collection);
                    collection = [];
                }
                // Simple property container is equivalent to dot-separated token. Just add this token to tokens.
                else if (closer.exec === 'property'){
                    recur = tokenize(subpath);
                    if (recur === UNDEF){ return undefined; }
                    tokens = tokens.concat(recur);
                }
                // Quoted subpath is all taken literally without token evaluation. Just add subpath to tokens as-is.
                else if (closer.exec === 'quote'){
                    tokens.push(subpath);
                }
                // Otherwise, create token object to hold tokenized subpath, add to tokens.
                else {
                    recur = tokenize(subpath);
                    if (recur === UNDEF){ return undefined; }
                    tokens.push({'t':recur, 'exec': closer.exec});
                }
                subpath = ''; // reset subpath
            }
        }
        // If a prefix character is found, store it in `mods` for later reference.
        // Must keep count due to `parent` prefix that can be used multiple times in one token.
        else if (!escaped && path[i] in prefixes && prefixes[path[i]].exec){
            mods.has = true;
            if (mods[prefixes[path[i]].exec]) { mods[prefixes[path[i]].exec]++; }
            else { mods[prefixes[path[i]].exec] = 1; }
        }
        // If a separator is found, time to store the token we've been accumulating. If
        // this token had a prefix, we store the token as an object with modifier data.
        // If the separator is the collection separator, we must either create or add
        // to a collection for this token. For simple separator, we either add the token
        // to the token list or else add to the existing collection if it exists.
        else if (!escaped && separators.hasOwnProperty(path[i]) && separators[path[i]].exec){
            separator = separators[path[i]];
            if (!word && (mods.has || hasWildcard)){
                // found a separator, after seeing prefixes, but no token word -> invalid
                return undefined;
            }
            // This token will require special interpreter processing due to prefix or wildcard.
            if (word && (mods.has || hasWildcard)){
                word = {'w': word, 'mods': mods};
                mods = {};
            }
            // word is a plain property or end of collection
            if (separator.exec === 'property'){
                // we are gathering a collection, so add last word to collection and then store
                if (collection[0] !== UNDEF){
                    word && collection.push(word);
                    tokens.push(collection);
                    collection = []; // reset
                }
                // word is a plain property
                else {
                    word && tokens.push(word);
                }
            }
            // word is a collection
            else if (separator.exec === 'collection'){
                word && collection.push(word);
            }
            word = ''; // reset
            hasWildcard = false; // reset
        }
        // Found a container opening character. A container opening is equivalent to
        // finding a separator, so "foo.bar" is equivalent to "foo[bar]", so apply similar
        // process as separator above with respect to token we have accumulated so far.
        // Except in case collections - path may have a collection of containers, so
        // in "foo[bar],[baz]", the "[bar]" marks the end of token "foo", but "[baz]" is
        // merely another entry in the collection, so we don't close off the collection token
        // yet.
        // Set depth value for further processing.
        else if (!escaped && containers.hasOwnProperty(path[i]) && containers[path[i]].exec){
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
        // Otherwise, this is just another character to add to the current token
        else if (i < pathLength) {
            word += path[i];
        }

        // If current path index matches the escape index value, reset `escaped`
        if (i < pathLength && i === escaped){
            escaped = 0;
        }
    }

    // Path ended in an escape character
    if (escaped){
        return undefined;
    }

    // Add trailing word to tokens, if present
    if (word && (mods.has || hasWildcard)){
        word = {'w': word, 'mods': mods};
        mods = {};
    }
    // We are gathering a collection, so add last word to collection and then store
    if (collection[0] !== UNDEF){
        word && collection.push(word);
        tokens.push(collection);
    }
    // Word is a plain property
    else {
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
        wordCopy = '',
        contextProp,
        idx = 0,
        context = obj,
        ret,
        newValueHere = false,
        placeInt = 0,
        prop = '',
        callArgs;

    if (typeof path === 'string' && !simplePathRegEx.test(path)){
        tk = path.split(propertySeparator);
        tkLength = tk.length;
        while (prev !== UNDEF && i < tkLength){
            if (tk[i] === ''){ return undefined; }
            else if (change){
                if (i === tkLength - 1){
                    prev[tk[i]] = newValue;
                }
                // For arrays, test current context against undefined to avoid parsing this segment as a number.
                // For anything else, use hasOwnProperty.
                else if (force && (prev.constructor === Array ? prev[tk[i]] !== UNDEF : !prev.hasOwnProperty(tk[i]))) {
                    prev[tk[i]] = {};
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

        // Handle most common simple path scenario first
        if (typeof curr === 'string'){
            if (change){
                if (newValueHere){
                    context[curr] = newValue;
                    if (context[curr] !== newValue){ return undefined; } // new value failed to set
                }
                else if (force && (prev.constructor === Array ? context[curr] !== UNDEF : !context.hasOwnProperty(curr))) {
                    context[curr] = {};
                }
            }
            ret = context[curr];
        }
        else {
            if (curr === UNDEF){
                ret = undefined;
            }
            else if (curr.constructor === Array){
                // call resolvePath again with base value as evaluated value so far and
                // each element of array as the path. Concat all the results together.
                ret = [];
                currLength = curr.length
                for (i = 0; i < currLength; i++){
                    contextProp = resolvePath(context, curr[i], newValue, args, valueStack.slice());
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
            else if (curr.w){
                wordCopy = curr.w + '';
                // this word token has modifiers, modify current context
                if (curr.mods.parent){
                    context = valueStack[valueStackLength - 1 - curr.mods.parent];
                    if (context === UNDEF) { return undefined; }
                }
                if (curr.mods.root){
                    // Reset context and valueStack, start over at root in this context
                    context = valueStack[0];
                    valueStack = [context];
                    valueStackLength = 1;
                }
                if (curr.mods.placeholder){
                    placeInt = wordCopy - 1;
                    if (args[placeInt] === UNDEF){ return undefined; }
                    // Force args[placeInt] to String, won't atwordCopyt to process
                    // arg of type function, array, or plain object
                    wordCopy = args[placeInt].toString();
                }
                
                // "context" modifier ("@" by default) replaces current context with a value from
                // the arguments.
                if (curr.mods.context){
                    placeInt = wordCopy - 1;
                    if (args[placeInt] === UNDEF){ return undefined; }
                    // Force args[placeInt] to String, won't atwordCopyt to process
                    // arg of type function, array, or plain object
                    ret = args[placeInt];
                }
                else {
                    // Repeat basic string property processing with word and modified context
                    if (context[wordCopy] !== UNDEF) {
                        if (newValueHere){ context[wordCopy] = newValue; }
                        ret = context[wordCopy];
                    }
                    else if (typeof context === 'function'){
                        ret = wordCopy;
                    }
                    else if (wildcardRegEx.test(wordCopy) >-1){
                        ret = [];
                        for (prop in context){
                            if (context.hasOwnProperty(prop) && wildCardMatch(wordCopy, prop)){
                                if (newValueHere){ context[prop] = newValue; }
                                ret.push(context[prop]);
                            }
                        }
                    }
                    else { return undefined; }
                }
            }
            else if (curr.exec === 'evalProperty'){
                if (newValueHere){
                    context[resolvePath(context, curr, UNDEF, args, valueStack.slice())] = newValue;
                }
                ret = context[resolvePath(context, curr, UNDEF, args, valueStack.slice())];
            }
            else if (curr.exec === 'call'){
                // If function call has arguments, process those arguments as a new path
                if (curr.t && curr.t.length){
                    callArgs = resolvePath(context, curr, UNDEF, args);
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
                else {
                    ret = context.call(valueStack[valueStackLength - 2]);
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
    return {t: tokens};
};

export var isValid = function(path){
    return typeof tokenize(path) !== 'undefined';
};

export var escape = function(path){
    return path.replace(allSpecialsRegEx, '\\$&');
};

export var get = function (obj, path){
    var i = 0,
        len = arguments.length,
        args = len > 2 ? new Array(len - 2) : [];
    if (len > 2){
        for (i = 2; i < len; i++) { args[i-2] = arguments[i]; }
    }
    return resolvePath(obj, path, undefined, args);
};

export var set = function(obj, path, val){
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

export var find = function(obj, val, oneOrMany){
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
    if (typeof options.advanced !== 'undefined'){
        advanced = !!options.advanced;
    }
    if (typeof options.force !== 'undefined'){
        force = !!options.force;
    }
    // Reset all special character sets and regular expressions
    simplePathChars = ('[\\\\' + [WILDCARD].concat(prefixList).concat(separatorList).concat(containerList).join('\\') + ']').replace('\\'+propertySeparator, '');
    simplePathRegEx = new RegExp(simplePathChars);
    allSpecials = '[\\\\\\' + [WILDCARD].concat(prefixList).concat(separatorList).concat(containerList).concat(containerCloseList).join('\\') + ']';
    allSpecialsRegEx = new RegExp(allSpecials, 'g');
    escapedSpecialsRegEx = new RegExp('\\'+allSpecials, 'g');
};
