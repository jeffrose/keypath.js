(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.PathToolkit = factory());
}(this, (function () { 'use strict';

/**
 * @fileOverview PathToolkit evaluates string paths as property/index sequences within objects and arrays
 * @author Aaron Brown
 * @version 1.0.0
 */

// Parsing, tokeninzing, etc
// Some constants for convenience
var UNDEF = (function(u){return u;})();

// Static strings, assigned to aid code minification
var $WILDCARD     = '*';
var $UNDEFINED    = 'undefined';
var $STRING       = 'string';
var $PARENT       = 'parent';
var $ROOT         = 'root';
var $PLACEHOLDER  = 'placeholder';
var $CONTEXT      = 'context';
var $PROPERTY     = 'property';
var $COLLECTION   = 'collection';
var $EACH         = 'each';
var $SINGLEQUOTE  = 'singlequote';
var $DOUBLEQUOTE  = 'doublequote';
var $CALL         = 'call';
var $EVALPROPERTY = 'evalProperty';
    
/**
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
 * @private
 * @param  {String} template Wildcard pattern
 * @param  {String} str      String to match against wildcard pattern
 * @return {Boolean}          True if pattern matches string; False if not
 */
var wildCardMatch = function(template, str){
    var pos = template.indexOf($WILDCARD),
        parts = template.split($WILDCARD, 2),
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
 * Inspect input value and determine whether it is an Object or not.
 * Values of undefined and null will return "false", otherwise
 * must be of type "object" or "function".
 * @private
 * @param  {Object}  val Thing to examine, may be of any type
 * @return {Boolean}     True if thing is of type "object" or "function"
 */
var isObject = function(val){
    if (typeof val === $UNDEFINED || val === null) { return false;}
    return ( (typeof val === 'function') || (typeof val === 'object') );
};

/**
 * Convert various values to true boolean `true` or `false`.
 * For non-string values, the native javascript idea of "true" will apply.
 * For string values, the words "true", "yes", and "on" will all return `true`.
 * All other strings return `false`. The string match is non-case-sensitive.
 * @private
 */
var truthify = function(val){
    var v;
    if (typeof val !== $STRING){
        return val && true; // Use native javascript notion of "truthy"
    }
    v = val.toUpperCase();
    if (v === 'TRUE' || v === 'YES' || v === 'ON'){
        return true;
    }
    return false;
};

/**
 * Using provided quote character as prefix and suffix, escape any instances
 * of the quote character within the string and return quote+string+quote.
 * The character defined as "singlequote" may be altered by custom options,
 * so a general-purpose function is needed to quote path segments correctly.
 * @private
 * @param  {String} q   Single-character string to use as quote character
 * @param  {String} str String to be quoted.
 * @return {String}     Original string, surrounded by the quote character, possibly modified internally if the quote character exists within the string.
 */
var quoteString = function(q, str){
    var qRegEx = new RegExp(q, 'g');
    return q + str.replace(qRegEx, '\\' + q) + q;
};

/**
 * PathToolkit base object. Includes all instance-specific data (options, cache)
 * as local variables. May be passed an options hash to pre-configure the
 * instance prior to use.
 * @constructor
 * @property {Object} options Optional. Collection of configuration settings for this instance of PathToolkit. See `setOptions` function below for detailed documentation.
 */
var PathToolkit = function(options){
    var _this = this,
        cache = {},
        opt = {},
        prefixList, separatorList, containerList, containerCloseList,
        propertySeparator,
        singlequote, doublequote,
        simplePathChars, simplePathRegEx,
        allSpecials, allSpecialsRegEx,
        escapedNonSpecialsRegEx,
        escapedQuotes,
        wildcardRegEx;

    /**
     * Several regular expressions are pre-compiled for use in path interpretation.
     * These expressions are built from the current syntax configuration, so they
     * must be re-built every time the syntax changes.
     * @private
     */
    var updateRegEx = function(){
        // Lists of special characters for use in regular expressions
        prefixList = Object.keys(opt.prefixes);
        separatorList = Object.keys(opt.separators);
        containerList = Object.keys(opt.containers);
        containerCloseList = containerList.map(function(key){ return opt.containers[key].closer; });
        
        propertySeparator = '';
        Object.keys(opt.separators).forEach(function(sep){ if (opt.separators[sep].exec === $PROPERTY){ propertySeparator = sep; } });
        singlequote = '';
        doublequote = '';
        Object.keys(opt.containers).forEach(function(sep){
            if (opt.containers[sep].exec === $SINGLEQUOTE){ singlequote = sep;}
            if (opt.containers[sep].exec === $DOUBLEQUOTE){ doublequote = sep;}
        });

        // Find all special characters except property separator (. by default)
        simplePathChars = '[\\\\' + [$WILDCARD].concat(prefixList).concat(separatorList).concat(containerList).join('\\').replace('\\'+propertySeparator, '') + ']';
        simplePathRegEx = new RegExp(simplePathChars);
        
        // Find all special characters, including backslash
        allSpecials = '[\\\\\\' + [$WILDCARD].concat(prefixList).concat(separatorList).concat(containerList).concat(containerCloseList).join('\\') + ']';
        allSpecialsRegEx = new RegExp(allSpecials, 'g');
        
        // Find all escaped special characters
        // escapedSpecialsRegEx = new RegExp('\\'+allSpecials, 'g');
        // Find all escaped non-special characters, i.e. unnecessary escapes
        escapedNonSpecialsRegEx = new RegExp('\\'+allSpecials.replace(/^\[/,'[^'));
        if (singlequote || doublequote){
            escapedQuotes = new RegExp('\\['+singlequote+doublequote+']', 'g');
        }
        else {
            escapedQuotes = '';
        }
        
        // Find wildcard character
        wildcardRegEx = new RegExp('\\'+$WILDCARD);
    };

    /**
     * Sets all the default options for interpreter behavior and syntax.
     * @private
     */
    var setDefaultOptions = function(){
        opt = opt || {};
        // Default settings
        opt.useCache = true;  // cache tokenized paths for repeated use
        opt.simple = false;   // only support dot-separated paths, no other special characters
        opt.force = false;    // create intermediate properties during `set` operation

        // Default prefix special characters
        opt.prefixes = {
            '^': {
                'exec': $PARENT
            },
            '~': {
                'exec': $ROOT
            },
            '%': {
                'exec': $PLACEHOLDER
            },
            '@': {
                'exec': $CONTEXT
            }
        };
        // Default separator special characters
        opt.separators = {
            '.': {
                'exec': $PROPERTY
                },
            ',': {
                'exec': $COLLECTION
                },
            '<': {
                'exec': $EACH
            }
        };
        // Default container special characters
        opt.containers = {
            '[': {
                'closer': ']',
                'exec': $PROPERTY
                },
            '\'': {
                'closer': '\'',
                'exec': $SINGLEQUOTE
                },
            '"': {
                'closer': '"',
                'exec': $DOUBLEQUOTE
                },
            '(': {
                'closer': ')',
                'exec': $CALL
                },
            '{': {
                'closer': '}',
                'exec': $EVALPROPERTY
                }
        };
    };

    /**
     * Test string to see if it is surrounded by single- or double-quote, using the
     * current configuration definition for those characters. If no quote container
     * is defined, this function will return false since it's not possible to quote
     * the string if there are no quotes in the syntax. Also ignores escaped quote
     * characters.
     * @param {String} str The string to test for enclosing quotes
     * @return {Boolean} true = string is enclosed in quotes; false = not quoted
     */
    var isQuoted = function(str){
        var cleanStr = str.replace(escapedQuotes, '');
        var strLen = cleanStr.length;
        if (strLen < 2){ return false; }
        return  (cleanStr[0] === cleanStr[strLen - 1]) &&
                (cleanStr[0] === singlequote || cleanStr[0] === doublequote);
    };
    
    /**
     * Remove enclosing quotes from a string. The isQuoted function will determine
     * if any change is needed. If the string is quoted, we know the first and last
     * characters are quote marks, so simply do a string slice. If the input value is
     * not quoted, return the input value unchanged. Because isQuoted is used, if
     * no quote marks are defined in the syntax, this function will return the input value.
     * @param {String} str The string to un-quote
     * @return {String} The input string without any enclosing quote marks.
     */
    var stripQuotes = function(str){
        if (isQuoted(str)){
            return str.slice(1, -1);
        }
        return str;
    };
    
    /**
     * Scan input string from left to right, one character at a time. If a special character
     * is found (one of "separators", "containers", or "prefixes"), either store the accumulated
     * word as a token or else begin watching input for end of token (finding a closing character
     * for a container or the end of a collection). If a container is found, capture the substring
     * within the container and recursively call `tokenize` on that substring. Final output will
     * be an array of tokens. A complex token (not a simple property or index) will be represented
     * as an object carrying metadata for processing.
     * @private
     * @param  {String} str Path string
     * @return {Array}     Array of tokens found in the input path
     */
    var tokenize = function (str){
        var path = '',
            simplePath = true, // path is assumed "simple" until proven otherwise
            tokens = [],
            recur = [],
            mods = {},
            pathLength = 0,
            word = '',
            hasWildcard = false,
            doEach = false, // must remember the "each" operator into the following token
            subpath = '',
            i = 0,
            opener = '',
            closer = '',
            separator = '',
            collection = [],
            depth = 0,
            escaped = 0;

        if (opt.useCache && cache[str] !== UNDEF){ return cache[str]; }

        // Strip out any unnecessary escaping to simplify processing below
        path = str.replace(escapedNonSpecialsRegEx, '$&'.substr(1));
        pathLength = path.length;

        if (typeof str === $STRING && !simplePathRegEx.test(str)){
            tokens = path.split(propertySeparator);
            opt.useCache && (cache[str] = {t: tokens, simple: simplePath});
            return {t: tokens, simple: simplePath};
        }

        for (i = 0; i < pathLength; i++){
            // Skip escape character (`\`) and set "escaped" to the index value
            // of the character to be treated as a literal
            if (!escaped && path[i] === '\\'){
                // Next character is the escaped character
                escaped = i+1;
                i++;
            }
            // If a wildcard character is found, mark this token as having a wildcard
            if (path[i] === $WILDCARD) {
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
                    if (i+1 < pathLength && opt.separators[path[i+1]] && opt.separators[path[i+1]].exec === $COLLECTION){
                        if (subpath.length && closer.exec === $PROPERTY){
                            recur = stripQuotes(subpath);
                        }
                        else if (closer.exec === $SINGLEQUOTE || closer.exec === $DOUBLEQUOTE){
                            recur = subpath;
                        }
                        else {
                            recur = tokenize(subpath);
                            if (recur === UNDEF){ return undefined; }
                            recur.exec = closer.exec;
                            recur.doEach = doEach;
                        }
                        // collection.push(closer.exec === $PROPERTY ? recur.t[0] : recur);
                        collection.push(recur);
                    }
                    // Handle subpath "[baz]" in foo.[bar],[baz] - we must process subpath and add to collection
                    else if (collection[0]){
                        if (subpath.length && closer.exec === $PROPERTY){
                            recur = stripQuotes(subpath);
                        }
                        else if (closer.exec === $SINGLEQUOTE || closer.exec === $DOUBLEQUOTE){
                            recur = subpath;
                        }
                        else {
                            recur = tokenize(subpath);
                            if (recur === UNDEF){ return undefined; }
                            recur.exec = closer.exec;
                            recur.doEach = doEach;
                        }
                        collection.push(recur);
                        tokens.push({'tt':collection, 'doEach':doEach});
                        collection = [];
                        simplePath &= false;
                    }
                    // Simple property container is equivalent to dot-separated token. Just add this token to tokens.
                    else if (closer.exec === $PROPERTY){
                        recur = {t:[stripQuotes(subpath)]};
                        if (doEach){
                            tokens.push({'w':recur.t[0], 'mods':{}, 'doEach':true});
                            simplePath &= false;
                            doEach = false; // reset
                        }
                        else {
                            tokens.push(recur.t[0]);
                            simplePath &= true;
                        }
                    }
                    // Quoted subpath is all taken literally without token evaluation. Just add subpath to tokens as-is.
                    else if (closer.exec === $SINGLEQUOTE || closer.exec === $DOUBLEQUOTE){
                        tokens.push(subpath);
                        simplePath &= true;
                    }
                    // Otherwise, create token object to hold tokenized subpath, add to tokens.
                    else {
                        if (subpath === ''){
                            recur = {t:[],simple:true};
                        }
                        else {
                            recur = tokenize(subpath);
                        }
                        if (recur === UNDEF){ return undefined; }
                        recur.exec = closer.exec;
                        recur.doEach = doEach;
                        tokens.push(recur);
                        simplePath &= false;
                    }
                    subpath = ''; // reset subpath
                }
            }
            // If a prefix character is found, store it in `mods` for later reference.
            // Must keep count due to `parent` prefix that can be used multiple times in one token.
            else if (!escaped && path[i] in opt.prefixes && opt.prefixes[path[i]].exec){
                mods.has = true;
                if (mods[opt.prefixes[path[i]].exec]) { mods[opt.prefixes[path[i]].exec]++; }
                else { mods[opt.prefixes[path[i]].exec] = 1; }
            }
            // If a separator is found, time to store the token we've been accumulating. If
            // this token had a prefix, we store the token as an object with modifier data.
            // If the separator is the collection separator, we must either create or add
            // to a collection for this token. For simple separator, we either add the token
            // to the token list or else add to the existing collection if it exists.
            else if (!escaped && opt.separators[path[i]] && opt.separators[path[i]].exec){
                separator = opt.separators[path[i]];
                if (!word && (mods.has || hasWildcard)){
                    // found a separator, after seeing prefixes, but no token word -> invalid
                    return undefined;
                }
                // This token will require special interpreter processing due to prefix or wildcard.
                if (word && (mods.has || hasWildcard || doEach)){
                    word = {'w': word, 'mods': mods, 'doEach': doEach};
                    mods = {};
                    simplePath &= false;
                }
                // word is a plain property or end of collection
                if (separator.exec === $PROPERTY || separator.exec === $EACH){
                    // we are gathering a collection, so add last word to collection and then store
                    if (collection[0] !== UNDEF){
                        word && collection.push(word);
                        tokens.push({'tt':collection, 'doEach':doEach});
                        collection = []; // reset
                        simplePath &= false;
                    }
                    // word is a plain property
                    else {
                        word && tokens.push(word);
                        simplePath &= true;
                    }
                    // If the separator is the "each" separtor, the following word will be evaluated differently.
                    // If it's not the "each" separator, then reset "doEach"
                    doEach = separator.exec === $EACH; // reset
                }
                // word is a collection
                else if (separator.exec === $COLLECTION){
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
            else if (!escaped && opt.containers[path[i]] && opt.containers[path[i]].exec){
                closer = opt.containers[path[i]];
                if (word && (mods.has || hasWildcard || doEach)){
                    if (typeof word === 'string'){
                        word = {'w': word, 'mods': mods, 'doEach':doEach};
                    }
                    else {
                        word.mods = mods;
                        word.doEach = doEach;
                    }
                    mods = {};
                }
                if (collection[0] !== UNDEF){
                    // we are gathering a collection, so add last word to collection and then store
                    word && collection.push(word);
                }
                else {
                    // word is a plain property
                    word && tokens.push(word);
                    simplePath &= true;
                }
                opener = path[i];
                // 1) don't reset doEach for empty word because this is [foo]<[bar]
                // 2) don't reset doEach for opening Call because this is a,b<fn()
                if (word && opt.containers[opener].exec !== $CALL){
                    doEach = false;
                }
                word = '';
                hasWildcard = false;
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
        if (typeof word === 'string' && word && (mods.has || hasWildcard || doEach)){
            word = {'w': word, 'mods': mods, 'doEach': doEach};
            mods = {};
            simplePath &= false;
        }
        else if (word && word.mods){
            word.mods = mods;
        }
        // We are gathering a collection, so add last word to collection and then store
        if (collection[0] !== UNDEF){
            word && collection.push(word);
            tokens.push({'tt':collection, 'doEach':doEach});
            simplePath &= false;
        }
        // Word is a plain property
        else {
            word && tokens.push(word);
            simplePath &= true;
        }

        // depth != 0 means mismatched containers
        if (depth !== 0){ return undefined; }

        // If path was valid, cache the result
        opt.useCache && (cache[str] = {t: tokens, simple: simplePath});

        return {t: tokens, simple: simplePath};
    };

    /**
     * It is `resolvePath`'s job to traverse an object according to the tokens
     * derived from the keypath and either return the value found there or set
     * a new value in that location.
     * The tokens are a simple array and `reoslvePath` loops through the list
     * with a simple "while" loop. A token may itself be a nested token array,
     * which is processed through recursion.
     * As each successive value is resolved within `obj`, the current value is
     * pushed onto the "valueStack", enabling backward references (upwards in `obj`)
     * through path prefixes like "<" for "parent" and "~" for "root". The loop
     * short-circuits by returning `undefined` if the path is invalid at any point,
     * except in `set` scenario with `force` enabled.
     * @private
     * @param  {Object} obj        The data object to be read/written
     * @param  {String} path       The keypath which `resolvePath` will evaluate against `obj`. May be a pre-compiled Tokens set instead of a string.
     * @param  {Any} newValue   The new value to set at the point described by `path`. Undefined if used in `get` scenario.
     * @param  {Array} args       Array of extra arguments which may be referenced by placeholders. Undefined if no extra arguments were given.
     * @param  {Array} valueStack Stack of object contexts accumulated as the path tokens are processed in `obj`
     * @return {Any}            In `get`, returns the value found in `obj` at `path`. In `set`, returns the new value that was set in `obj`. If `get` or `set` are nto successful, returns `undefined`
     */
    var resolvePath = function (obj, path, newValue, args, valueStack){
        var change = newValue !== UNDEF, // are we setting a new value?
            tk = [],
            tkLength = 0,
            tkLastIdx = 0,
            valueStackLength = 1,
            i = 0, j = 0,
            prev = obj,
            curr = '',
            currLength = 0,
            eachLength = 0,
            wordCopy = '',
            contextProp,
            idx = 0,
            context = obj,
            ret,
            newValueHere = false,
            placeInt = 0,
            prop = '',
            callArgs;

        // For String path, either fetch tokens from cache or from `tokenize`.
        if (typeof path === $STRING){
            if (opt.useCache && cache[path]) { tk = cache[path].t; }
            else {
                tk = tokenize(path);
                if (tk === UNDEF){ return undefined; }
                tk = tk.t;
            }
        }
        // For a non-string, assume a pre-compiled token array
        else {
            tk = path.t ? path.t : [path];
        }

        tkLength = tk.length;
        if (tkLength === 0) { return undefined; }
        tkLastIdx = tkLength - 1;

        // valueStack will be an array if we are within a recursive call to `resolvePath`
        if (valueStack){
            valueStackLength = valueStack.length;
        }
        // On original entry to `resolvePath`, initialize valueStack with the base object.
        // valueStackLength was already initialized to 1.
        else {
            valueStack = [obj];
        }

        // Converted Array.reduce into while loop, still using "prev", "curr", "idx"
        // as loop values
        while (prev !== UNDEF && idx < tkLength){
            curr = tk[idx];

            // If we are setting a new value and this token is the last token, this
            // is the point where the new value must be set.
            newValueHere = (change && (idx === tkLastIdx));

            // Handle most common simple path scenario first
            if (typeof curr === $STRING){
                // If we are setting...
                if (change){
                    // If this is the final token where the new value goes, set it
                    if (newValueHere){
                        context[curr] = newValue;
                        if (context[curr] !== newValue){ return undefined; } // new value failed to set
                    }
                    // For earlier tokens, create object properties if "force" is enabled
                    else if (opt.force && typeof context[curr] === 'undefined') {
                        context[curr] = {};
                    }
                }
                // Return value is assigned as value of this object property
                ret = context[curr];

                // This basic structure is repeated in other scenarios below, so the logic
                // pattern is only documented here for brevity.
            }
            else {
                if (curr === UNDEF){
                    ret = undefined;
                }
                else if (curr.tt){
                    // Call resolvePath again with base value as evaluated value so far and
                    // each element of array as the path. Concat all the results together.
                    ret = [];
                    if (curr.doEach){
                        if (!Array.isArray(context)){
                            return undefined;
                        }
                        j = 0;
                        eachLength = context.length;
                        
                        // Path like Array->Each->Array requires a nested for loop
                        // to process the two array layers.
                        while(j < eachLength){
                            i = 0;
                            ret.push([]);
                            currLength = curr.tt.length;
                            while(i < currLength){
                                curr.tt[i].doEach = false; // This is a hack, don't know how else to disable "doEach" for collection members
                                if (newValueHere){
                                    contextProp = resolvePath(context[j], curr.tt[i], newValue, args, valueStack);
                                }
                                else if (typeof curr.tt[i] === 'string'){
                                    contextProp = context[j][curr.tt[i]];
                                }
                                else {
                                    contextProp = resolvePath(context[j], curr.tt[i], undefined, args, valueStack);
                                }
                                if (contextProp === UNDEF) { return undefined; }
        
                                if (newValueHere){
                                    if (curr.tt[i].t && curr.tt[i].exec === $EVALPROPERTY){
                                        context[j][contextProp] = newValue;
                                    } else {
                                        ret[j].push(contextProp);
                                    }
                                }
                                else {
                                    if (curr.tt[i].t && curr.tt[i].exec === $EVALPROPERTY){
                                        ret[j].push(context[j][contextProp]);
                                    } else {
                                        ret[j].push(contextProp);
                                    }
                                }
                                i++;
                            }
                            j++;
                        }
                    }
                    else {
                        i = 0;
                        currLength = curr.tt.length;
                        while(i < currLength){
                            if (newValueHere){
                                contextProp = resolvePath(context, curr.tt[i], newValue, args, valueStack);
                            }
                            else if (typeof curr.tt[i] === 'string'){
                                contextProp = context[curr.tt[i]];
                            }
                            else {
                                contextProp = resolvePath(context, curr.tt[i], undefined, args, valueStack);
                            }
                            if (contextProp === UNDEF) { return undefined; }
    
                            if (newValueHere){
                                if (curr.tt[i].t && curr.tt[i].exec === $EVALPROPERTY){
                                    context[contextProp] = newValue;
                                } else {
                                    ret.push(contextProp);
                                }
                            }
                            else {
                                if (curr.tt[i].t && curr.tt[i].exec === $EVALPROPERTY){
                                    ret.push(context[contextProp]);
                                } else {
                                    ret.push(contextProp);
                                }
                            }
                            i++;
                        }
                    }
                }
                else if (curr.w){
                    // this word token has modifiers
                    wordCopy = curr.w;
                    if (curr.mods.has){
                        if (curr.mods.parent){
                            // modify current context, shift upwards in base object one level
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
                    }

                    // doEach option means to take all values in context (must be an array), apply
                    // "curr" to each one, and return the new array. Operates like Array.map.
                    if (curr.doEach){
                        if (!Array.isArray(context)){
                            return undefined;
                        }
                        ret = [];
                        i = 0;
                        eachLength = context.length;
                        while(i < eachLength){
                            // "context" modifier ("@" by default) replaces current context with a value from
                            // the arguments.
                            if (curr.mods.context){
                                placeInt = wordCopy - 1;
                                if (args[placeInt] === UNDEF){ return undefined; }
                                // Force args[placeInt] to String, won't atwordCopyt to process
                                // arg of type function, array, or plain object
                                ret.push(args[placeInt]);
                            }
                            else {
                                // Repeat basic string property processing with word and modified context
                                if (context[i][wordCopy] !== UNDEF) {
                                    if (newValueHere){ context[i][wordCopy] = newValue; }
                                    ret.push(context[i][wordCopy]);
                                }
                                else if (typeof context[i] === 'function'){
                                    ret.push(wordCopy);
                                }
                                // Plain property tokens are listed as special word tokens whenever
                                // a wildcard is found within the property string. A wildcard in a
                                // property causes an array of matching properties to be returned,
                                // so loop through all properties and evaluate token for every
                                // property where `wildCardMatch` returns true.
                                else if (wildcardRegEx.test(wordCopy)){
                                    ret.push([]);
                                    for (prop in context[i]){
                                        if (wildCardMatch(wordCopy, prop)){
                                            if (newValueHere){ context[i][prop] = newValue; }
                                            ret[i].push(context[i][prop]);
                                        }
                                    }
                                }
                                else { return undefined; }
                            }
                            i++;
                        }
                    }
                    else {
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
                            // Plain property tokens are listed as special word tokens whenever
                            // a wildcard is found within the property string. A wildcard in a
                            // property causes an array of matching properties to be returned,
                            // so loop through all properties and evaluate token for every
                            // property where `wildCardMatch` returns true.
                            else if (wildcardRegEx.test(wordCopy)){
                                ret = [];
                                for (prop in context){
                                    if (wildCardMatch(wordCopy, prop)){
                                        if (newValueHere){ context[prop] = newValue; }
                                        ret.push(context[prop]);
                                    }
                                }
                            }
                            else { return undefined; }
                        }
                    }
                }
                // Eval Property tokens operate on a temporary context created by
                // recursively calling `resolvePath` with a copy of the valueStack.
                else if (curr.exec === $EVALPROPERTY){
                    if (curr.doEach){
                        if (!Array.isArray(context)){
                            return undefined;
                        }
                        ret = [];
                        i = 0;
                        eachLength = context.length;
                        while(i < eachLength){
                            if (curr.simple){
                                if (newValueHere){
                                    context[i][_this.get(context[i], {t:curr.t, simple:true})] = newValue;
                                }
                                ret.push(context[i][_this.get(context[i], {t:curr.t, simple:true})]);
                            }
                            else {
                                if (newValueHere){
                                    context[i][resolvePath(context[i], curr, UNDEF, args, valueStack)] = newValue;
                                }
                                ret.push(context[i][resolvePath(context[i], curr, UNDEF, args, valueStack)]);
                            }
                            i++;
                        }
                    }
                    else {
                        if (curr.simple){
                            if (newValueHere){
                                context[_this.get(context, {t: curr.t, simple:true})] = newValue;
                            }
                            ret = context[_this.get(context, {t:curr.t, simple:true})];
                        }
                        else {
                            if (newValueHere){
                                context[resolvePath(context, curr, UNDEF, args, valueStack)] = newValue;
                            }
                            ret = context[resolvePath(context, curr, UNDEF, args, valueStack)];
                        }
                    }
                }
                // Functions are called using `call` or `apply`, depending on the state of
                // the arguments within the ( ) container. Functions are executed with "this"
                // set to the context immediately prior to the function in the stack.
                // For example, "a.b.c.fn()" is equivalent to obj.a.b.c.fn.call(obj.a.b.c)
                else if (curr.exec === $CALL){
                    if (curr.doEach){
                        if (!Array.isArray(valueStack[valueStackLength - 2])){
                            return undefined;
                        }
                        ret = [];
                        i = 0;
                        eachLength = context.length;
                        while(i < eachLength){
                            // If function call has arguments, process those arguments as a new path
                            if (curr.t && curr.t.length){
                                callArgs = resolvePath(context, curr, UNDEF, args, valueStack);
                                if (callArgs === UNDEF){
                                    ret.push(context[i].apply(valueStack[valueStackLength - 2][i]));
                                }
                                else if (Array.isArray(callArgs)){
                                    ret.push(context[i].apply(valueStack[valueStackLength - 2][i], callArgs));
                                }
                                else {
                                    ret.push(context[i].call(valueStack[valueStackLength - 2][i], callArgs));
                                }
                            }
                            else {
                                ret.push(context[i].call(valueStack[valueStackLength - 2][i]));
                            }
                            i++;
                        }
                    }
                    else {
                        // If function call has arguments, process those arguments as a new path
                        if (curr.t && curr.t.length){
                            if (curr.simple){
                                callArgs = _this.get(context, curr);
                            }
                            else {
                                callArgs = resolvePath(context, curr, UNDEF, args, valueStack);
                            }
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
            }
            // Add the return value to the stack in case we must loop again.
            // Recursive calls pass the same valueStack array around, but we don't want to
            // push entries on the stack inside a recursion, so instead use fixed array
            // index references based on what **this** execution knows the valueStackLength
            // should be. That way, if a recursion adds new elements, and then we back out,
            // this context will remember the old stack length and will merely overwrite
            // those added entries, ignoring that they were there in the first place.
            valueStack[valueStackLength++] = ret;
            context = ret;
            prev = ret;
            idx++;
        }
        return context;
    };

    /**
     * Simplified path evaluation heavily optimized for performance when
     * processing paths with only property names or indices and separators.
     * If the path can be correctly processed with "path.split(separator)",
     * this function will do so. Any other special characters found in the
     * path will cause the path to be evaluated with the full `resolvePath`
     * function instead.
     * @private
     * @param  {Object} obj        The data object to be read/written
     * @param  {String} path       The keypath which `resolvePath` will evaluate against `obj`.
     * @param  {Any} newValue   The new value to set at the point described by `path`. Undefined if used in `get` scenario.
     * @return {Any}            In `get`, returns the value found in `obj` at `path`. In `set`, returns the new value that was set in `obj`. If `get` or `set` are nto successful, returns `undefined`
     */
    var quickResolveString = function(obj, path, newValue){
        var change = newValue !== UNDEF,
            tk = [],
            i = 0,
            tkLength = 0;

        tk = path.split(propertySeparator);
        opt.useCache && (cache[path] = {t: tk, simple: true});
        tkLength = tk.length;
        while (obj !== UNDEF && i < tkLength){
            if (tk[i] === ''){ return undefined; }
            else if (change){
                if (i === tkLength - 1){
                    obj[tk[i]] = newValue;
                }
                // For arrays, test current context against undefined to avoid parsing this segment as a number.
                // For anything else, use hasOwnProperty.
                else if (opt.force && typeof obj[tk[i]] === 'undefined') {
                    obj[tk[i]] = {};
                }
            }
            obj = obj[tk[i++]];
        }
        return obj;
    };

    /**
     * Simplified path evaluation heavily optimized for performance when
     * processing array of simple path tokens (plain property names).
     * This function is essentially the same as `quickResolveString` except
     * `quickResolveTokenArray` does nto need to execute path.split.
     * @private
     * @param  {Object} obj        The data object to be read/written
     * @param  {Array} tk       The token array which `resolvePath` will evaluate against `obj`.
     * @param  {Any} newValue   The new value to set at the point described by `path`. Undefined if used in `get` scenario.
     * @return {Any}            In `get`, returns the value found in `obj` at `path`. In `set`, returns the new value that was set in `obj`. If `get` or `set` are nto successful, returns `undefined`
     */
    var quickResolveTokenArray = function(obj, tk, newValue){
        var change = newValue !== UNDEF,
            i = 0,
            tkLength = tk.length;

        while (obj != null && i < tkLength){
            if (tk[i] === ''){ return undefined; }
            else if (change){
                if (i === tkLength - 1){
                    obj[tk[i]] = newValue;
                }
                // For arrays, test current context against undefined to avoid parsing this segment as a number.
                // For anything else, use hasOwnProperty.
                else if (opt.force && typeof obj[tk[i]] === 'undefined') {
                    obj[tk[i]] = {};
                }
            }
            obj = obj[tk[i++]];
        }
        return obj;
    };

    /**
     * Searches an object or array for a value, accumulating the keypath to the value along
     * the way. Operates in a recursive way until either all keys/indices have been
     * exhausted or a match is found. Return value "true" means "keep scanning", "false"
     * means "stop now". If a match is found, instead of returning a simple "false", a
     * callback function (savePath) is called which will decide whether or not to continue
     * the scan. This allows the function to find one instance of value or all instances,
     * based on logic in the callback.
     * @private
     * @param {Object} obj    The data object to scan
     * @param {Any} val The value we are looking for within `obj`
     * @param {Function} savePath Callback function which will store accumulated paths and indicate whether to continue
     * @param {String} path Accumulated keypath; undefined at first, populated in recursive calls
     * @return {Boolean} Indicates whether scan process should continue ("true"->yes, "false"->no)
     */
    var scanForValue = function(obj, val, savePath, path){
        var i, len, more, keys, prop;

        path = path ? path : '';

        // If we found the value we're looking for
        if (obj === val){
            return savePath(path); // Save the accumulated path, ask whether to continue
        }
        // This object is an array, so examine each index separately
        else if (Array.isArray(obj)){
            len = obj.length;
            for(i = 0; i < len; i++){
                // Call `scanForValue` recursively
                more = scanForValue(obj[i], val, savePath, path + propertySeparator + i);
                // Halt if that recursive call returned "false"
                if (!more){ return; }
            }
            return true; // keep looking
        }
        // This object is an object, so examine each local property separately
        else if (isObject(obj)) {
            keys = Object.keys(obj);
            len = keys.length;
            if (len > 1){ keys = keys.sort(); } // Force order of object keys to produce repeatable results
            for (i = 0; i < len; i++){
                if (obj.hasOwnProperty(keys[i])){
                    prop = keys[i];
                    // Property may include the separator character or some other special character,
                    // so quote this path segment and escape any separators within.
                    if (allSpecialsRegEx.test(prop)){
                        prop = quoteString(singlequote, prop);
                    }
                    more = scanForValue(obj[keys[i]], val, savePath, path + propertySeparator + prop);
                    if (!more){ return; }
                }
            }
            return true; // keep looking
        }
        // Leaf node (string, number, character, boolean, etc.), but didn't match
        return true; // keep looking
    };

    /**
     * Get tokenized representation of string keypath.
     * @public
     * @param {String} path Keypath
     * @return {Object} Object including the array of path tokens and a boolean indicating "simple". Simple token sets have no special operators or nested tokens, only a plain array of strings for fast evaluation.
     */
    _this.getTokens = function(path){
        var tokens = tokenize(path);
        if (typeof tokens === $UNDEFINED){ return undefined; }
        return tokens;
    };

    /**
     * Informs whether the string path has valid syntax. The path is NOT evaluated against a
     * data object, only the syntax is checked.
     * @public
     * @param {String} path Keypath
     * @return {Boolean} valid syntax -> "true"; not valid -> "false"
     */
    _this.isValid = function(path){
        return typeof tokenize(path) !== $UNDEFINED;
    };

    /**
     * Escapes any special characters found in the input string using backslash, preventing
     * these characters from causing unintended processing by PathToolkit. This function
     * DOES respect the current configured syntax, even if it has been altered from the default.
     * @public
     * @param {String} segment Segment of a keypath
     * @return {String} The original segment string with all PathToolkit special characters prepended with "\"
     */
    _this.escape = function(segment){
        return segment.replace(allSpecialsRegEx, '\\$&');
    };

    /**
     * Evaluates keypath in object and returns the value found there, if available. If the path
     * does not exist in the provided data object, returns `undefined`. For "simple" paths, which
     * don't include any operations beyond property separators, optimized resolvers will be used
     * which are more lightweight than the full-featured `resolvePath`.
     * @public
     * @param {Any} obj Source data object
     * @param {String} path Keypath to evaluate within "obj". Also accepts token array in place of a string path.
     * @return {Any} If the keypath exists in "obj", return the value at that location; If not, return `undefined`.
     */
    _this.get = function (obj, path){
        var i = 0,
            len = arguments.length,
            args;
        // For string paths, first see if path has already been cached and if the token set is simple. If
        // so, we can use the optimized token array resolver using the cached token set.
        // If there is no cached entry, use RegEx to look for special characters apart from the separator.
        // If none are found, we can use the optimized string resolver.
        if (typeof path === $STRING){
            if (opt.useCache && cache[path] && cache[path].simple){
                return quickResolveTokenArray(obj, cache[path].t);
            }
            else if (!simplePathRegEx.test(path)){
                return quickResolveString(obj, path);
            }
        }
        // For array paths (pre-compiled token sets), check for simplicity so we can use the optimized resolver.
        else if (Array.isArray(path.t) && path.simple){
            return quickResolveTokenArray(obj, path.t);
        }
        
        // If we made it this far, the path is complex and may include placeholders. Gather up any
        // extra arguments and call the full `resolvePath` function.
        args = [];
        if (len > 2){
            for (i = 2; i < len; i++) { args[i-2] = arguments[i]; }
        }
        return resolvePath(obj, path, undefined, args);
    };

    /**
     * Evaluates a keypath in object and sets a new value at the point described in the keypath. If
     * "force" is disabled, the full path must exist up to the final property, which may be created
     * by the set operation. If "force" is enabled, any missing intermediate properties will be created
     * in order to set the value on the final property. If `set` succeeds, returns "true", otherwise "false".
     * @public
     * @param {Any} obj Source data object
     * @param {String} path Keypath to evaluate within "obj". Also accepts token array in place of a string path.
     * @param {Any} val New value to set at the location described in "path"
     * @return {Boolean} "true" if the set operation succeeds; "false" if it does not succeed
     */
    _this.set = function(obj, path, val){
        var i = 0,
            len = arguments.length,
            args,
            ref,
            done = false;
            
        // Path resolution follows the same logic as `get` above, with one difference: `get` will
        // abort by returning the value as soon as it's found. `set` does not abort so the if-else
        // structure is slightly different to dictate when/if the final case should execute.
        if (typeof path === $STRING){
            if (opt.useCache && cache[path] && cache[path].simple){
                ref = quickResolveTokenArray(obj, cache[path].t, val);
                done |= true;
            }
            else if (!simplePathRegEx.test(path)){
                ref = quickResolveString(obj, path, val);
                done |= true;
            }
        }
        else if (Array.isArray(path.t) && path.simple){
            ref = quickResolveTokenArray(obj, path.t, val);
            done |= true;
        }
        
        // Path was (probably) a string and it contained complex path characters
        if (!done) {
            if (len > 3){
                args = [];
                for (i = 3; i < len; i++) { args[i-3] = arguments[i]; }
            }
            ref = resolvePath(obj, path, val, args);
        }
        
        // `set` can set a new value in multiple places if the final path segment is an array.
        // If any of those value assignments fail, `set` will return "false" indicating failure.
        if (Array.isArray(ref)){
            return ref.indexOf(undefined) === -1;
        }
        return ref !== UNDEF;
    };

    /**
     * Locate a value within an object or array. This is the publicly exposed interface to the
     * private `scanForValue` function defined above.
     * @public
     * @param {Any} obj Source data object
     * @param {Any} val The value to search for within "obj"
     * @param {String} oneOrMany Optional; If missing or "one", `find` will only return the first valid path. If "onOrMany" is any other string, `find` will scan the full object looking for all valid paths to all cases where "val" appears.
     * @return {Array} Array of keypaths to "val" or `undefined` if "val" is not found.
     */
    _this.find = function(obj, val, oneOrMany){
        var retVal = [];
        // savePath is the callback which will accumulate any found paths in a local array
        // variable.
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

    /**
     * For a given special character group (e.g., separators) and character type (e.g., "property"),
     * replace an existing separator with a new character. This creates a new special character for
     * that purpose anwithin the character group and removes the old one. Also takes a "closer" argument
     * for cases where the special character is a container set.
     * @private
     * @param {Object} optionGroup Reference to current configuration for a certain type of special characters
     * @param {String} charType The type of special character to be replaced
     * @param {String} val New special character string
     * @param {String} closer Optional; New special character closer string, only used for "containers" group
     */
    var updateOptionChar = function(optionGroup, charType, val, closer){
        var oldVal = '';
        Object.keys(optionGroup).forEach(function(str){ if (optionGroup[str].exec === charType){ oldVal = str; } });

        delete optionGroup[oldVal];
        optionGroup[val] = {exec: charType};
        if (closer){ optionGroup[val].closer = closer; }
    };

    /**
     * Sets "simple" syntax in special character groups. This syntax only supports a separator
     * character and no other operators. A custom separator may be provided as an argument.
     * @private
     * @param {String} sep Optional; Separator string. If missing, the default separator (".") is used.
     */
    var setSimpleOptions = function(sep){
        var sepOpts = {};
        if (!(typeof sep === $STRING && sep.length === 1)){
            sep = '.';
        }
        sepOpts[sep] = {exec: $PROPERTY};
        opt.prefixes = {};
        opt.containers = {};
        opt.separators = sepOpts;
    };

    /**
     * Alter PathToolkit configuration. Takes an options hash which may include
     * multiple settings to change at once. If the path syntax is changed by
     * changing special characters, the cache is wiped. Each option group is
     * REPLACED by the new option group passed in. If an option group is not
     * included in the options hash, it is not changed.
     * @public
     * @param {Object} options Option hash. For sample input, see `setDefaultOptions` above.
     */
    _this.setOptions = function(options){
        if (options.prefixes){
            opt.prefixes = options.prefixes;
            cache = {};
        }
        if (options.separators){
            opt.separators = options.separators;
            cache = {};
        }
        if (options.containers){
            opt.containers = options.containers;
            cache = {};
        }
        if (typeof options.cache !== $UNDEFINED){
            opt.useCache = !!options.cache;
        }
        if (typeof options.simple !== $UNDEFINED){
            var tempCache = opt.useCache; // preserve these two options after "setDefaultOptions"
            var tempForce = opt.force;
            
            opt.simple = truthify(options.simple);
            if (opt.simple){
                setSimpleOptions();
            }
            else {
                setDefaultOptions();
                opt.useCache = tempCache;
                opt.force = tempForce;
            }
            cache = {};
        }
        if (typeof options.force !== $UNDEFINED){
            opt.force = truthify(options.force);
        }
        updateRegEx();
    };

    /**
     * Sets use of keypath cache to enabled or disabled, depending on input value.
     * @public
     * @param {Any} val Value which will be interpreted as a boolean using `truthify`. "true" will enable cache; "false" will disable.
     */
    _this.setCache = function(val){
        opt.useCache = truthify(val);
    };
    /**
     * Enables use of keypath cache.
     * @public
     */
    _this.setCacheOn = function(){
        opt.useCache = true;
    };
    /**
     * Disables use of keypath cache.
     * @public
     */
    _this.setCacheOff = function(){
        opt.useCache = false;
    };

    /**
     * Sets "force" option when setting values in an object, depending on input value.
     * @public
     * @param {Any} val Value which will be interpreted as a boolean using `truthify`. "true" enables "force"; "false" disables.
     */
    _this.setForce = function(val){
        opt.force = truthify(val);
    };
    /**
     * Enables "force" option when setting values in an object.
     * @public
     */
    _this.setForceOn = function(){
        opt.force = true;
    };
    /**
     * Disables "force" option when setting values in an object.
     * @public
     */
    _this.setForceOff = function(){
        opt.force = false;
    };

    /**
     * Shortcut function to alter PathToolkit syntax to a "simple" mode that only uses
     * separators and no other operators. "Simple" mode is enabled or disabled according
     * to the first argument and the separator may be customized with the second
     * argument when enabling "simple" mode.
     * @public
     * @param {Any} val Value which will be interpreted as a boolean using `truthify`. "true" enables "simple" mode; "false" disables.
     * @param {String} sep Separator string to use in place of the default "."
     */
    _this.setSimple = function(val, sep){
        var tempCache = opt.useCache; // preserve these two options after "setDefaultOptions"
        var tempForce = opt.force;
        opt.simple = truthify(val);
        if (opt.simple){
            setSimpleOptions(sep);
            updateRegEx();
        }
        else {
            setDefaultOptions();
            updateRegEx();
            opt.useCache = tempCache;
            opt.force = tempForce;
        }
        cache = {};
    };
    
    /**
     * Enables "simple" mode
     * @public
     * @param {String} sep Separator string to use in place of the default "."
     * @see setSimple
     */
    _this.setSimpleOn = function(sep){
        opt.simple = true;
        setSimpleOptions(sep);
        updateRegEx();
        cache = {};
    };
    
    /**
     * Disables "simple" mode, restores default PathToolkit syntax
     * @public
     * @see setSimple
     * @see setDefaultOptions
     */
    _this.setSimpleOff = function(){
        var tempCache = opt.useCache; // preserve these two options after "setDefaultOptions"
        var tempForce = opt.force;
        opt.simple = false;
        setDefaultOptions();
        updateRegEx();
        opt.useCache = tempCache;
        opt.force = tempForce;
        cache = {};
    };

    /**
     * Modify the property separator in the PathToolkit syntax.
     * @public
     * @param {String} val New character to use for this operation.
     */
    _this.setSeparatorProperty = function(val){
        if (typeof val === $STRING && val.length === 1){
            if (val !== $WILDCARD && (!opt.separators[val] || opt.separators[val].exec === $PROPERTY) && !(opt.prefixes[val] || opt.containers[val])){
                updateOptionChar(opt.separators, $PROPERTY, val);
                updateRegEx();
                cache = {};
            }
            else {
                throw new Error('setSeparatorProperty - value already in use');
            }
        }
        else {
            throw new Error('setSeparatorProperty - invalid value');
        }
    };

    /**
     * Modify the collection separator in the PathToolkit syntax.
     * @public
     * @param {String} val New character to use for this operation.
     */
    _this.setSeparatorCollection = function(val){
        if (typeof val === $STRING && val.length === 1){
            if (val !== $WILDCARD && (!opt.separators[val] || opt.separators[val].exec === $COLLECTION) && !(opt.prefixes[val] || opt.containers[val])){
                updateOptionChar(opt.separators, $COLLECTION, val);
                updateRegEx();
                cache = {};
            }
            else {
                throw new Error('setSeparatorCollection - value already in use');
            }
        }
        else {
            throw new Error('setSeparatorCollection - invalid value');
        }
    };

    /**
     * Modify the parent prefix in the PathToolkit syntax.
     * @public
     * @param {String} val New character to use for this operation.
     */
    _this.setPrefixParent = function(val){
        if (typeof val === $STRING && val.length === 1){
            if (val !== $WILDCARD && (!opt.prefixes[val] || opt.prefixes[val].exec === $PARENT) && !(opt.separators[val] || opt.containers[val])){
                updateOptionChar(opt.prefixes, $PARENT, val);
                updateRegEx();
                cache = {};
            }
            else {
                throw new Error('setPrefixParent - value already in use');
            }
        }
        else {
            throw new Error('setPrefixParent - invalid value');
        }
    };

    /**
     * Modify the root prefix in the PathToolkit syntax.
     * @public
     * @param {String} val New character to use for this operation.
     */
    _this.setPrefixRoot = function(val){
        if (typeof val === $STRING && val.length === 1){
            if (val !== $WILDCARD && (!opt.prefixes[val] || opt.prefixes[val].exec === $ROOT) && !(opt.separators[val] || opt.containers[val])){
                updateOptionChar(opt.prefixes, $ROOT, val);
                updateRegEx();
                cache = {};
            }
            else {
                throw new Error('setPrefixRoot - value already in use');
            }
        }
        else {
            throw new Error('setPrefixRoot - invalid value');
        }
    };

    /**
     * Modify the placeholder prefix in the PathToolkit syntax.
     * @public
     * @param {String} val New character to use for this operation.
     */
    _this.setPrefixPlaceholder = function(val){
        if (typeof val === $STRING && val.length === 1){
            if (val !== $WILDCARD && (!opt.prefixes[val] || opt.prefixes[val].exec === $PLACEHOLDER) && !(opt.separators[val] || opt.containers[val])){
                updateOptionChar(opt.prefixes, $PLACEHOLDER, val);
                updateRegEx();
                cache = {};
            }
            else {
                throw new Error('setPrefixPlaceholder - value already in use');
            }
        }
        else {
            throw new Error('setPrefixPlaceholder - invalid value');
        }
    };

    /**
     * Modify the context prefix in the PathToolkit syntax.
     * @public
     * @param {String} val New character to use for this operation.
     */
    _this.setPrefixContext = function(val){
        if (typeof val === $STRING && val.length === 1){
            if (val !== $WILDCARD && (!opt.prefixes[val] || opt.prefixes[val].exec === $CONTEXT) && !(opt.separators[val] || opt.containers[val])){
                updateOptionChar(opt.prefixes, $CONTEXT, val);
                updateRegEx();
                cache = {};
            }
            else {
                throw new Error('setPrefixContext - value already in use');
            }
        }
        else {
            throw new Error('setPrefixContext - invalid value');
        }
    };

    /**
     * Modify the property container characters in the PathToolkit syntax.
     * @public
     * @param {String} val New character to use for the container opener.
     * @param {String} closer New character to use for the container closer.
     */
    _this.setContainerProperty = function(val, closer){
        if (typeof val === $STRING && val.length === 1 && typeof closer === $STRING && closer.length === 1){
            if (val !== $WILDCARD && (!opt.containers[val] || opt.containers[val].exec === $PROPERTY) && !(opt.separators[val] || opt.prefixes[val])){
                updateOptionChar(opt.containers, $PROPERTY, val, closer);
                updateRegEx();
                cache = {};
            }
            else {
                throw new Error('setContainerProperty - value already in use');
            }
        }
        else {
            throw new Error('setContainerProperty - invalid value');
        }
    };

    /**
     * Modify the single quote container characters in the PathToolkit syntax.
     * @public
     * @param {String} val New character to use for the container opener.
     * @param {String} closer New character to use for the container closer.
     */
    _this.setContainerSinglequote = function(val, closer){
        if (typeof val === $STRING && val.length === 1 && typeof closer === $STRING && closer.length === 1){
            if (val !== $WILDCARD && (!opt.containers[val] || opt.containers[val].exec === $SINGLEQUOTE) && !(opt.separators[val] || opt.prefixes[val])){
                updateOptionChar(opt.containers, $SINGLEQUOTE, val, closer);
                updateRegEx();
                cache = {};
            }
            else {
                throw new Error('setContainerSinglequote - value already in use');
            }
        }
        else {
            throw new Error('setContainerSinglequote - invalid value');
        }
    };

    /**
     * Modify the double quote container characters in the PathToolkit syntax.
     * @public
     * @param {String} val New character to use for the container opener.
     * @param {String} closer New character to use for the container closer.
     */
    _this.setContainerDoublequote = function(val, closer){
        if (typeof val === $STRING && val.length === 1 && typeof closer === $STRING && closer.length === 1){
            if (val !== $WILDCARD && (!opt.containers[val] || opt.containers[val].exec === $DOUBLEQUOTE) && !(opt.separators[val] || opt.prefixes[val])){
                updateOptionChar(opt.containers, $DOUBLEQUOTE, val, closer);
                updateRegEx();
                cache = {};
            }
            else {
                throw new Error('setContainerDoublequote - value already in use');
            }
        }
        else {
            throw new Error('setContainerDoublequote - invalid value');
        }
    };

    /**
     * Modify the function call container characters in the PathToolkit syntax.
     * @public
     * @param {String} val New character to use for the container opener.
     * @param {String} closer New character to use for the container closer.
     */
    _this.setContainerCall = function(val, closer){
        if (typeof val === $STRING && val.length === 1 && typeof closer === $STRING && closer.length === 1){
            if (val !== $WILDCARD && (!opt.containers[val] || opt.containers[val].exec === $CALL) && !(opt.separators[val] || opt.prefixes[val])){
                updateOptionChar(opt.containers, $CALL, val, closer);
                updateRegEx();
                cache = {};
            }
            else {
                throw new Error('setContainerCall - value already in use');
            }
        }
        else {
            throw new Error('setContainerCall - invalid value');
        }
    };

    /**
     * Modify the eval property container characters in the PathToolkit syntax.
     * @public
     * @param {String} val New character to use for the container opener.
     * @param {String} closer New character to use for the container closer.
     */
    _this.setContainerEvalProperty = function(val, closer){
        if (typeof val === $STRING && val.length === 1 && typeof closer === $STRING && closer.length === 1){
            if (val !== $WILDCARD && (!opt.containers[val] || opt.containers[val].exec === $EVALPROPERTY) && !(opt.separators[val] || opt.prefixes[val])){
                updateOptionChar(opt.containers, $EVALPROPERTY, val, closer);
                updateRegEx();
                cache = {};
            }
            else {
                throw new Error('setContainerEvalProperty - value already in use');
            }
        }
        else {
            throw new Error('setContainerProperty - invalid value');
        }
    };

    /**
     * Reset all PathToolkit options to their default values.
     * @public
     */
    _this.resetOptions = function(){
        setDefaultOptions();
        updateRegEx();
        cache = {};
    };

    // Initialize option set
    setDefaultOptions();
    updateRegEx();

    // Apply custom options if provided as argument to constructor
    options && _this.setOptions(options);

};

return PathToolkit;

})));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC10b29sa2l0LmpzIiwic291cmNlcyI6WyJwYXRoLXRvb2xraXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZU92ZXJ2aWV3IFBhdGhUb29sa2l0IGV2YWx1YXRlcyBzdHJpbmcgcGF0aHMgYXMgcHJvcGVydHkvaW5kZXggc2VxdWVuY2VzIHdpdGhpbiBvYmplY3RzIGFuZCBhcnJheXNcbiAqIEBhdXRob3IgQWFyb24gQnJvd25cbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKi9cblxuLy8gUGFyc2luZywgdG9rZW5pbnppbmcsIGV0Y1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyBTb21lIGNvbnN0YW50cyBmb3IgY29udmVuaWVuY2VcbnZhciBVTkRFRiA9IChmdW5jdGlvbih1KXtyZXR1cm4gdTt9KSgpO1xuXG4vLyBTdGF0aWMgc3RyaW5ncywgYXNzaWduZWQgdG8gYWlkIGNvZGUgbWluaWZpY2F0aW9uXG52YXIgJFdJTERDQVJEICAgICA9ICcqJyxcbiAgICAkVU5ERUZJTkVEICAgID0gJ3VuZGVmaW5lZCcsXG4gICAgJFNUUklORyAgICAgICA9ICdzdHJpbmcnLFxuICAgICRQQVJFTlQgICAgICAgPSAncGFyZW50JyxcbiAgICAkUk9PVCAgICAgICAgID0gJ3Jvb3QnLFxuICAgICRQTEFDRUhPTERFUiAgPSAncGxhY2Vob2xkZXInLFxuICAgICRDT05URVhUICAgICAgPSAnY29udGV4dCcsXG4gICAgJFBST1BFUlRZICAgICA9ICdwcm9wZXJ0eScsXG4gICAgJENPTExFQ1RJT04gICA9ICdjb2xsZWN0aW9uJyxcbiAgICAkRUFDSCAgICAgICAgID0gJ2VhY2gnLFxuICAgICRTSU5HTEVRVU9URSAgPSAnc2luZ2xlcXVvdGUnLFxuICAgICRET1VCTEVRVU9URSAgPSAnZG91YmxlcXVvdGUnLFxuICAgICRDQUxMICAgICAgICAgPSAnY2FsbCcsXG4gICAgJEVWQUxQUk9QRVJUWSA9ICdldmFsUHJvcGVydHknO1xuICAgIFxuLyoqXG4gKiBUZXN0cyB3aGV0aGVyIGEgd2lsZGNhcmQgdGVtcGxhdGVzIG1hdGNoZXMgYSBnaXZlbiBzdHJpbmcuXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgc3RyID0gJ2FhYWJiYnh4eGNjY2RkZCc7XG4gKiB3aWxkQ2FyZE1hdGNoKCdhYWFiYmJ4eHhjY2NkZGQnKTsgLy8gdHJ1ZVxuICogd2lsZENhcmRNYXRjaCgnKicsIHN0cik7IC8vIHRydWVcbiAqIHdpbGRDYXJkTWF0Y2goJyonLCAnJyk7IC8vIHRydWVcbiAqIHdpbGRDYXJkTWF0Y2goJ2EqJywgc3RyKTsgLy8gdHJ1ZVxuICogd2lsZENhcmRNYXRjaCgnYWEqZGRkJywgc3RyKTsgLy8gdHJ1ZVxuICogd2lsZENhcmRNYXRjaCgnKmQnLCBzdHIpOyAvLyB0cnVlXG4gKiB3aWxkQ2FyZE1hdGNoKCcqYScsIHN0cik7IC8vIGZhbHNlXG4gKiB3aWxkQ2FyZE1hdGNoKCdhKnonLCBzdHIpOyAvLyBmYWxzZVxuICogYGBgXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtICB7U3RyaW5nfSB0ZW1wbGF0ZSBXaWxkY2FyZCBwYXR0ZXJuXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciAgICAgIFN0cmluZyB0byBtYXRjaCBhZ2FpbnN0IHdpbGRjYXJkIHBhdHRlcm5cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgIFRydWUgaWYgcGF0dGVybiBtYXRjaGVzIHN0cmluZzsgRmFsc2UgaWYgbm90XG4gKi9cbnZhciB3aWxkQ2FyZE1hdGNoID0gZnVuY3Rpb24odGVtcGxhdGUsIHN0cil7XG4gICAgdmFyIHBvcyA9IHRlbXBsYXRlLmluZGV4T2YoJFdJTERDQVJEKSxcbiAgICAgICAgcGFydHMgPSB0ZW1wbGF0ZS5zcGxpdCgkV0lMRENBUkQsIDIpLFxuICAgICAgICBtYXRjaCA9IHRydWU7XG4gICAgaWYgKHBhcnRzWzBdKXtcbiAgICAgICAgLy8gSWYgbm8gd2lsZGNhcmQgcHJlc2VudCwgcmV0dXJuIHNpbXBsZSBzdHJpbmcgY29tcGFyaXNvblxuICAgICAgICBpZiAocGFydHNbMF0gPT09IHRlbXBsYXRlKXtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0c1swXSA9PT0gc3RyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbWF0Y2ggPSBtYXRjaCAmJiBzdHIuc3Vic3RyKDAsIHBhcnRzWzBdLmxlbmd0aCkgPT09IHBhcnRzWzBdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChwYXJ0c1sxXSl7XG4gICAgICAgIG1hdGNoID0gbWF0Y2ggJiYgc3RyLnN1YnN0cigtMSpwYXJ0c1sxXS5sZW5ndGgpID09PSBwYXJ0c1sxXTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoO1xufTtcblxuLyoqXG4gKiBJbnNwZWN0IGlucHV0IHZhbHVlIGFuZCBkZXRlcm1pbmUgd2hldGhlciBpdCBpcyBhbiBPYmplY3Qgb3Igbm90LlxuICogVmFsdWVzIG9mIHVuZGVmaW5lZCBhbmQgbnVsbCB3aWxsIHJldHVybiBcImZhbHNlXCIsIG90aGVyd2lzZVxuICogbXVzdCBiZSBvZiB0eXBlIFwib2JqZWN0XCIgb3IgXCJmdW5jdGlvblwiLlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSAge09iamVjdH0gIHZhbCBUaGluZyB0byBleGFtaW5lLCBtYXkgYmUgb2YgYW55IHR5cGVcbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICBUcnVlIGlmIHRoaW5nIGlzIG9mIHR5cGUgXCJvYmplY3RcIiBvciBcImZ1bmN0aW9uXCJcbiAqL1xudmFyIGlzT2JqZWN0ID0gZnVuY3Rpb24odmFsKXtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJFVOREVGSU5FRCB8fCB2YWwgPT09IG51bGwpIHsgcmV0dXJuIGZhbHNlO31cbiAgICByZXR1cm4gKCAodHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykgfHwgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSApO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IHZhcmlvdXMgdmFsdWVzIHRvIHRydWUgYm9vbGVhbiBgdHJ1ZWAgb3IgYGZhbHNlYC5cbiAqIEZvciBub24tc3RyaW5nIHZhbHVlcywgdGhlIG5hdGl2ZSBqYXZhc2NyaXB0IGlkZWEgb2YgXCJ0cnVlXCIgd2lsbCBhcHBseS5cbiAqIEZvciBzdHJpbmcgdmFsdWVzLCB0aGUgd29yZHMgXCJ0cnVlXCIsIFwieWVzXCIsIGFuZCBcIm9uXCIgd2lsbCBhbGwgcmV0dXJuIGB0cnVlYC5cbiAqIEFsbCBvdGhlciBzdHJpbmdzIHJldHVybiBgZmFsc2VgLiBUaGUgc3RyaW5nIG1hdGNoIGlzIG5vbi1jYXNlLXNlbnNpdGl2ZS5cbiAqIEBwcml2YXRlXG4gKi9cbnZhciB0cnV0aGlmeSA9IGZ1bmN0aW9uKHZhbCl7XG4gICAgdmFyIHY7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICRTVFJJTkcpe1xuICAgICAgICByZXR1cm4gdmFsICYmIHRydWU7IC8vIFVzZSBuYXRpdmUgamF2YXNjcmlwdCBub3Rpb24gb2YgXCJ0cnV0aHlcIlxuICAgIH1cbiAgICB2ID0gdmFsLnRvVXBwZXJDYXNlKCk7XG4gICAgaWYgKHYgPT09ICdUUlVFJyB8fCB2ID09PSAnWUVTJyB8fCB2ID09PSAnT04nKXtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogVXNpbmcgcHJvdmlkZWQgcXVvdGUgY2hhcmFjdGVyIGFzIHByZWZpeCBhbmQgc3VmZml4LCBlc2NhcGUgYW55IGluc3RhbmNlc1xuICogb2YgdGhlIHF1b3RlIGNoYXJhY3RlciB3aXRoaW4gdGhlIHN0cmluZyBhbmQgcmV0dXJuIHF1b3RlK3N0cmluZytxdW90ZS5cbiAqIFRoZSBjaGFyYWN0ZXIgZGVmaW5lZCBhcyBcInNpbmdsZXF1b3RlXCIgbWF5IGJlIGFsdGVyZWQgYnkgY3VzdG9tIG9wdGlvbnMsXG4gKiBzbyBhIGdlbmVyYWwtcHVycG9zZSBmdW5jdGlvbiBpcyBuZWVkZWQgdG8gcXVvdGUgcGF0aCBzZWdtZW50cyBjb3JyZWN0bHkuXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtICB7U3RyaW5nfSBxICAgU2luZ2xlLWNoYXJhY3RlciBzdHJpbmcgdG8gdXNlIGFzIHF1b3RlIGNoYXJhY3RlclxuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgU3RyaW5nIHRvIGJlIHF1b3RlZC5cbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIE9yaWdpbmFsIHN0cmluZywgc3Vycm91bmRlZCBieSB0aGUgcXVvdGUgY2hhcmFjdGVyLCBwb3NzaWJseSBtb2RpZmllZCBpbnRlcm5hbGx5IGlmIHRoZSBxdW90ZSBjaGFyYWN0ZXIgZXhpc3RzIHdpdGhpbiB0aGUgc3RyaW5nLlxuICovXG52YXIgcXVvdGVTdHJpbmcgPSBmdW5jdGlvbihxLCBzdHIpe1xuICAgIHZhciBxUmVnRXggPSBuZXcgUmVnRXhwKHEsICdnJyk7XG4gICAgcmV0dXJuIHEgKyBzdHIucmVwbGFjZShxUmVnRXgsICdcXFxcJyArIHEpICsgcTtcbn07XG5cbi8qKlxuICogUGF0aFRvb2xraXQgYmFzZSBvYmplY3QuIEluY2x1ZGVzIGFsbCBpbnN0YW5jZS1zcGVjaWZpYyBkYXRhIChvcHRpb25zLCBjYWNoZSlcbiAqIGFzIGxvY2FsIHZhcmlhYmxlcy4gTWF5IGJlIHBhc3NlZCBhbiBvcHRpb25zIGhhc2ggdG8gcHJlLWNvbmZpZ3VyZSB0aGVcbiAqIGluc3RhbmNlIHByaW9yIHRvIHVzZS5cbiAqIEBjb25zdHJ1Y3RvclxuICogQHByb3BlcnR5IHtPYmplY3R9IG9wdGlvbnMgT3B0aW9uYWwuIENvbGxlY3Rpb24gb2YgY29uZmlndXJhdGlvbiBzZXR0aW5ncyBmb3IgdGhpcyBpbnN0YW5jZSBvZiBQYXRoVG9vbGtpdC4gU2VlIGBzZXRPcHRpb25zYCBmdW5jdGlvbiBiZWxvdyBmb3IgZGV0YWlsZWQgZG9jdW1lbnRhdGlvbi5cbiAqL1xudmFyIFBhdGhUb29sa2l0ID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgY2FjaGUgPSB7fSxcbiAgICAgICAgb3B0ID0ge30sXG4gICAgICAgIHByZWZpeExpc3QsIHNlcGFyYXRvckxpc3QsIGNvbnRhaW5lckxpc3QsIGNvbnRhaW5lckNsb3NlTGlzdCxcbiAgICAgICAgcHJvcGVydHlTZXBhcmF0b3IsXG4gICAgICAgIHNpbmdsZXF1b3RlLCBkb3VibGVxdW90ZSxcbiAgICAgICAgc2ltcGxlUGF0aENoYXJzLCBzaW1wbGVQYXRoUmVnRXgsXG4gICAgICAgIGFsbFNwZWNpYWxzLCBhbGxTcGVjaWFsc1JlZ0V4LFxuICAgICAgICBlc2NhcGVkTm9uU3BlY2lhbHNSZWdFeCxcbiAgICAgICAgZXNjYXBlZFF1b3RlcyxcbiAgICAgICAgd2lsZGNhcmRSZWdFeDtcblxuICAgIC8qKlxuICAgICAqIFNldmVyYWwgcmVndWxhciBleHByZXNzaW9ucyBhcmUgcHJlLWNvbXBpbGVkIGZvciB1c2UgaW4gcGF0aCBpbnRlcnByZXRhdGlvbi5cbiAgICAgKiBUaGVzZSBleHByZXNzaW9ucyBhcmUgYnVpbHQgZnJvbSB0aGUgY3VycmVudCBzeW50YXggY29uZmlndXJhdGlvbiwgc28gdGhleVxuICAgICAqIG11c3QgYmUgcmUtYnVpbHQgZXZlcnkgdGltZSB0aGUgc3ludGF4IGNoYW5nZXMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB2YXIgdXBkYXRlUmVnRXggPSBmdW5jdGlvbigpe1xuICAgICAgICAvLyBMaXN0cyBvZiBzcGVjaWFsIGNoYXJhY3RlcnMgZm9yIHVzZSBpbiByZWd1bGFyIGV4cHJlc3Npb25zXG4gICAgICAgIHByZWZpeExpc3QgPSBPYmplY3Qua2V5cyhvcHQucHJlZml4ZXMpO1xuICAgICAgICBzZXBhcmF0b3JMaXN0ID0gT2JqZWN0LmtleXMob3B0LnNlcGFyYXRvcnMpO1xuICAgICAgICBjb250YWluZXJMaXN0ID0gT2JqZWN0LmtleXMob3B0LmNvbnRhaW5lcnMpO1xuICAgICAgICBjb250YWluZXJDbG9zZUxpc3QgPSBjb250YWluZXJMaXN0Lm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gb3B0LmNvbnRhaW5lcnNba2V5XS5jbG9zZXI7IH0pO1xuICAgICAgICBcbiAgICAgICAgcHJvcGVydHlTZXBhcmF0b3IgPSAnJztcbiAgICAgICAgT2JqZWN0LmtleXMob3B0LnNlcGFyYXRvcnMpLmZvckVhY2goZnVuY3Rpb24oc2VwKXsgaWYgKG9wdC5zZXBhcmF0b3JzW3NlcF0uZXhlYyA9PT0gJFBST1BFUlRZKXsgcHJvcGVydHlTZXBhcmF0b3IgPSBzZXA7IH0gfSk7XG4gICAgICAgIHNpbmdsZXF1b3RlID0gJyc7XG4gICAgICAgIGRvdWJsZXF1b3RlID0gJyc7XG4gICAgICAgIE9iamVjdC5rZXlzKG9wdC5jb250YWluZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKHNlcCl7XG4gICAgICAgICAgICBpZiAob3B0LmNvbnRhaW5lcnNbc2VwXS5leGVjID09PSAkU0lOR0xFUVVPVEUpeyBzaW5nbGVxdW90ZSA9IHNlcDt9XG4gICAgICAgICAgICBpZiAob3B0LmNvbnRhaW5lcnNbc2VwXS5leGVjID09PSAkRE9VQkxFUVVPVEUpeyBkb3VibGVxdW90ZSA9IHNlcDt9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEZpbmQgYWxsIHNwZWNpYWwgY2hhcmFjdGVycyBleGNlcHQgcHJvcGVydHkgc2VwYXJhdG9yICguIGJ5IGRlZmF1bHQpXG4gICAgICAgIHNpbXBsZVBhdGhDaGFycyA9ICdbXFxcXFxcXFwnICsgWyRXSUxEQ0FSRF0uY29uY2F0KHByZWZpeExpc3QpLmNvbmNhdChzZXBhcmF0b3JMaXN0KS5jb25jYXQoY29udGFpbmVyTGlzdCkuam9pbignXFxcXCcpLnJlcGxhY2UoJ1xcXFwnK3Byb3BlcnR5U2VwYXJhdG9yLCAnJykgKyAnXSc7XG4gICAgICAgIHNpbXBsZVBhdGhSZWdFeCA9IG5ldyBSZWdFeHAoc2ltcGxlUGF0aENoYXJzKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEZpbmQgYWxsIHNwZWNpYWwgY2hhcmFjdGVycywgaW5jbHVkaW5nIGJhY2tzbGFzaFxuICAgICAgICBhbGxTcGVjaWFscyA9ICdbXFxcXFxcXFxcXFxcJyArIFskV0lMRENBUkRdLmNvbmNhdChwcmVmaXhMaXN0KS5jb25jYXQoc2VwYXJhdG9yTGlzdCkuY29uY2F0KGNvbnRhaW5lckxpc3QpLmNvbmNhdChjb250YWluZXJDbG9zZUxpc3QpLmpvaW4oJ1xcXFwnKSArICddJztcbiAgICAgICAgYWxsU3BlY2lhbHNSZWdFeCA9IG5ldyBSZWdFeHAoYWxsU3BlY2lhbHMsICdnJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBGaW5kIGFsbCBlc2NhcGVkIHNwZWNpYWwgY2hhcmFjdGVyc1xuICAgICAgICAvLyBlc2NhcGVkU3BlY2lhbHNSZWdFeCA9IG5ldyBSZWdFeHAoJ1xcXFwnK2FsbFNwZWNpYWxzLCAnZycpO1xuICAgICAgICAvLyBGaW5kIGFsbCBlc2NhcGVkIG5vbi1zcGVjaWFsIGNoYXJhY3RlcnMsIGkuZS4gdW5uZWNlc3NhcnkgZXNjYXBlc1xuICAgICAgICBlc2NhcGVkTm9uU3BlY2lhbHNSZWdFeCA9IG5ldyBSZWdFeHAoJ1xcXFwnK2FsbFNwZWNpYWxzLnJlcGxhY2UoL15cXFsvLCdbXicpKTtcbiAgICAgICAgaWYgKHNpbmdsZXF1b3RlIHx8IGRvdWJsZXF1b3RlKXtcbiAgICAgICAgICAgIGVzY2FwZWRRdW90ZXMgPSBuZXcgUmVnRXhwKCdcXFxcWycrc2luZ2xlcXVvdGUrZG91YmxlcXVvdGUrJ10nLCAnZycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZXNjYXBlZFF1b3RlcyA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBGaW5kIHdpbGRjYXJkIGNoYXJhY3RlclxuICAgICAgICB3aWxkY2FyZFJlZ0V4ID0gbmV3IFJlZ0V4cCgnXFxcXCcrJFdJTERDQVJEKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyBhbGwgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgaW50ZXJwcmV0ZXIgYmVoYXZpb3IgYW5kIHN5bnRheC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHZhciBzZXREZWZhdWx0T3B0aW9ucyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIG9wdCA9IG9wdCB8fCB7fTtcbiAgICAgICAgLy8gRGVmYXVsdCBzZXR0aW5nc1xuICAgICAgICBvcHQudXNlQ2FjaGUgPSB0cnVlOyAgLy8gY2FjaGUgdG9rZW5pemVkIHBhdGhzIGZvciByZXBlYXRlZCB1c2VcbiAgICAgICAgb3B0LnNpbXBsZSA9IGZhbHNlOyAgIC8vIG9ubHkgc3VwcG9ydCBkb3Qtc2VwYXJhdGVkIHBhdGhzLCBubyBvdGhlciBzcGVjaWFsIGNoYXJhY3RlcnNcbiAgICAgICAgb3B0LmZvcmNlID0gZmFsc2U7ICAgIC8vIGNyZWF0ZSBpbnRlcm1lZGlhdGUgcHJvcGVydGllcyBkdXJpbmcgYHNldGAgb3BlcmF0aW9uXG5cbiAgICAgICAgLy8gRGVmYXVsdCBwcmVmaXggc3BlY2lhbCBjaGFyYWN0ZXJzXG4gICAgICAgIG9wdC5wcmVmaXhlcyA9IHtcbiAgICAgICAgICAgICdeJzoge1xuICAgICAgICAgICAgICAgICdleGVjJzogJFBBUkVOVFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICd+Jzoge1xuICAgICAgICAgICAgICAgICdleGVjJzogJFJPT1RcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnJSc6IHtcbiAgICAgICAgICAgICAgICAnZXhlYyc6ICRQTEFDRUhPTERFUlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdAJzoge1xuICAgICAgICAgICAgICAgICdleGVjJzogJENPTlRFWFRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gRGVmYXVsdCBzZXBhcmF0b3Igc3BlY2lhbCBjaGFyYWN0ZXJzXG4gICAgICAgIG9wdC5zZXBhcmF0b3JzID0ge1xuICAgICAgICAgICAgJy4nOiB7XG4gICAgICAgICAgICAgICAgJ2V4ZWMnOiAkUFJPUEVSVFlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgJywnOiB7XG4gICAgICAgICAgICAgICAgJ2V4ZWMnOiAkQ09MTEVDVElPTlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnPCc6IHtcbiAgICAgICAgICAgICAgICAnZXhlYyc6ICRFQUNIXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIERlZmF1bHQgY29udGFpbmVyIHNwZWNpYWwgY2hhcmFjdGVyc1xuICAgICAgICBvcHQuY29udGFpbmVycyA9IHtcbiAgICAgICAgICAgICdbJzoge1xuICAgICAgICAgICAgICAgICdjbG9zZXInOiAnXScsXG4gICAgICAgICAgICAgICAgJ2V4ZWMnOiAkUFJPUEVSVFlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ1xcJyc6IHtcbiAgICAgICAgICAgICAgICAnY2xvc2VyJzogJ1xcJycsXG4gICAgICAgICAgICAgICAgJ2V4ZWMnOiAkU0lOR0xFUVVPVEVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ1wiJzoge1xuICAgICAgICAgICAgICAgICdjbG9zZXInOiAnXCInLFxuICAgICAgICAgICAgICAgICdleGVjJzogJERPVUJMRVFVT1RFXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICcoJzoge1xuICAgICAgICAgICAgICAgICdjbG9zZXInOiAnKScsXG4gICAgICAgICAgICAgICAgJ2V4ZWMnOiAkQ0FMTFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAneyc6IHtcbiAgICAgICAgICAgICAgICAnY2xvc2VyJzogJ30nLFxuICAgICAgICAgICAgICAgICdleGVjJzogJEVWQUxQUk9QRVJUWVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGVzdCBzdHJpbmcgdG8gc2VlIGlmIGl0IGlzIHN1cnJvdW5kZWQgYnkgc2luZ2xlLSBvciBkb3VibGUtcXVvdGUsIHVzaW5nIHRoZVxuICAgICAqIGN1cnJlbnQgY29uZmlndXJhdGlvbiBkZWZpbml0aW9uIGZvciB0aG9zZSBjaGFyYWN0ZXJzLiBJZiBubyBxdW90ZSBjb250YWluZXJcbiAgICAgKiBpcyBkZWZpbmVkLCB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIGZhbHNlIHNpbmNlIGl0J3Mgbm90IHBvc3NpYmxlIHRvIHF1b3RlXG4gICAgICogdGhlIHN0cmluZyBpZiB0aGVyZSBhcmUgbm8gcXVvdGVzIGluIHRoZSBzeW50YXguIEFsc28gaWdub3JlcyBlc2NhcGVkIHF1b3RlXG4gICAgICogY2hhcmFjdGVycy5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdG8gdGVzdCBmb3IgZW5jbG9zaW5nIHF1b3Rlc1xuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgPSBzdHJpbmcgaXMgZW5jbG9zZWQgaW4gcXVvdGVzOyBmYWxzZSA9IG5vdCBxdW90ZWRcbiAgICAgKi9cbiAgICB2YXIgaXNRdW90ZWQgPSBmdW5jdGlvbihzdHIpe1xuICAgICAgICB2YXIgY2xlYW5TdHIgPSBzdHIucmVwbGFjZShlc2NhcGVkUXVvdGVzLCAnJyk7XG4gICAgICAgIHZhciBzdHJMZW4gPSBjbGVhblN0ci5sZW5ndGg7XG4gICAgICAgIGlmIChzdHJMZW4gPCAyKXsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgIHJldHVybiAgKGNsZWFuU3RyWzBdID09PSBjbGVhblN0cltzdHJMZW4gLSAxXSkgJiZcbiAgICAgICAgICAgICAgICAoY2xlYW5TdHJbMF0gPT09IHNpbmdsZXF1b3RlIHx8IGNsZWFuU3RyWzBdID09PSBkb3VibGVxdW90ZSk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZW1vdmUgZW5jbG9zaW5nIHF1b3RlcyBmcm9tIGEgc3RyaW5nLiBUaGUgaXNRdW90ZWQgZnVuY3Rpb24gd2lsbCBkZXRlcm1pbmVcbiAgICAgKiBpZiBhbnkgY2hhbmdlIGlzIG5lZWRlZC4gSWYgdGhlIHN0cmluZyBpcyBxdW90ZWQsIHdlIGtub3cgdGhlIGZpcnN0IGFuZCBsYXN0XG4gICAgICogY2hhcmFjdGVycyBhcmUgcXVvdGUgbWFya3MsIHNvIHNpbXBseSBkbyBhIHN0cmluZyBzbGljZS4gSWYgdGhlIGlucHV0IHZhbHVlIGlzXG4gICAgICogbm90IHF1b3RlZCwgcmV0dXJuIHRoZSBpbnB1dCB2YWx1ZSB1bmNoYW5nZWQuIEJlY2F1c2UgaXNRdW90ZWQgaXMgdXNlZCwgaWZcbiAgICAgKiBubyBxdW90ZSBtYXJrcyBhcmUgZGVmaW5lZCBpbiB0aGUgc3ludGF4LCB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIHRoZSBpbnB1dCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdG8gdW4tcXVvdGVcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSBpbnB1dCBzdHJpbmcgd2l0aG91dCBhbnkgZW5jbG9zaW5nIHF1b3RlIG1hcmtzLlxuICAgICAqL1xuICAgIHZhciBzdHJpcFF1b3RlcyA9IGZ1bmN0aW9uKHN0cil7XG4gICAgICAgIGlmIChpc1F1b3RlZChzdHIpKXtcbiAgICAgICAgICAgIHJldHVybiBzdHIuc2xpY2UoMSwgLTEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBTY2FuIGlucHV0IHN0cmluZyBmcm9tIGxlZnQgdG8gcmlnaHQsIG9uZSBjaGFyYWN0ZXIgYXQgYSB0aW1lLiBJZiBhIHNwZWNpYWwgY2hhcmFjdGVyXG4gICAgICogaXMgZm91bmQgKG9uZSBvZiBcInNlcGFyYXRvcnNcIiwgXCJjb250YWluZXJzXCIsIG9yIFwicHJlZml4ZXNcIiksIGVpdGhlciBzdG9yZSB0aGUgYWNjdW11bGF0ZWRcbiAgICAgKiB3b3JkIGFzIGEgdG9rZW4gb3IgZWxzZSBiZWdpbiB3YXRjaGluZyBpbnB1dCBmb3IgZW5kIG9mIHRva2VuIChmaW5kaW5nIGEgY2xvc2luZyBjaGFyYWN0ZXJcbiAgICAgKiBmb3IgYSBjb250YWluZXIgb3IgdGhlIGVuZCBvZiBhIGNvbGxlY3Rpb24pLiBJZiBhIGNvbnRhaW5lciBpcyBmb3VuZCwgY2FwdHVyZSB0aGUgc3Vic3RyaW5nXG4gICAgICogd2l0aGluIHRoZSBjb250YWluZXIgYW5kIHJlY3Vyc2l2ZWx5IGNhbGwgYHRva2VuaXplYCBvbiB0aGF0IHN1YnN0cmluZy4gRmluYWwgb3V0cHV0IHdpbGxcbiAgICAgKiBiZSBhbiBhcnJheSBvZiB0b2tlbnMuIEEgY29tcGxleCB0b2tlbiAobm90IGEgc2ltcGxlIHByb3BlcnR5IG9yIGluZGV4KSB3aWxsIGJlIHJlcHJlc2VudGVkXG4gICAgICogYXMgYW4gb2JqZWN0IGNhcnJ5aW5nIG1ldGFkYXRhIGZvciBwcm9jZXNzaW5nLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBzdHIgUGF0aCBzdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gICAgIEFycmF5IG9mIHRva2VucyBmb3VuZCBpbiB0aGUgaW5wdXQgcGF0aFxuICAgICAqL1xuICAgIHZhciB0b2tlbml6ZSA9IGZ1bmN0aW9uIChzdHIpe1xuICAgICAgICB2YXIgcGF0aCA9ICcnLFxuICAgICAgICAgICAgc2ltcGxlUGF0aCA9IHRydWUsIC8vIHBhdGggaXMgYXNzdW1lZCBcInNpbXBsZVwiIHVudGlsIHByb3ZlbiBvdGhlcndpc2VcbiAgICAgICAgICAgIHRva2VucyA9IFtdLFxuICAgICAgICAgICAgcmVjdXIgPSBbXSxcbiAgICAgICAgICAgIG1vZHMgPSB7fSxcbiAgICAgICAgICAgIHBhdGhMZW5ndGggPSAwLFxuICAgICAgICAgICAgd29yZCA9ICcnLFxuICAgICAgICAgICAgaGFzV2lsZGNhcmQgPSBmYWxzZSxcbiAgICAgICAgICAgIGRvRWFjaCA9IGZhbHNlLCAvLyBtdXN0IHJlbWVtYmVyIHRoZSBcImVhY2hcIiBvcGVyYXRvciBpbnRvIHRoZSBmb2xsb3dpbmcgdG9rZW5cbiAgICAgICAgICAgIHN1YnBhdGggPSAnJyxcbiAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgb3BlbmVyID0gJycsXG4gICAgICAgICAgICBjbG9zZXIgPSAnJyxcbiAgICAgICAgICAgIHNlcGFyYXRvciA9ICcnLFxuICAgICAgICAgICAgY29sbGVjdGlvbiA9IFtdLFxuICAgICAgICAgICAgZGVwdGggPSAwLFxuICAgICAgICAgICAgZXNjYXBlZCA9IDA7XG5cbiAgICAgICAgaWYgKG9wdC51c2VDYWNoZSAmJiBjYWNoZVtzdHJdICE9PSBVTkRFRil7IHJldHVybiBjYWNoZVtzdHJdOyB9XG5cbiAgICAgICAgLy8gU3RyaXAgb3V0IGFueSB1bm5lY2Vzc2FyeSBlc2NhcGluZyB0byBzaW1wbGlmeSBwcm9jZXNzaW5nIGJlbG93XG4gICAgICAgIHBhdGggPSBzdHIucmVwbGFjZShlc2NhcGVkTm9uU3BlY2lhbHNSZWdFeCwgJyQmJy5zdWJzdHIoMSkpO1xuICAgICAgICBwYXRoTGVuZ3RoID0gcGF0aC5sZW5ndGg7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgPT09ICRTVFJJTkcgJiYgIXNpbXBsZVBhdGhSZWdFeC50ZXN0KHN0cikpe1xuICAgICAgICAgICAgdG9rZW5zID0gcGF0aC5zcGxpdChwcm9wZXJ0eVNlcGFyYXRvcik7XG4gICAgICAgICAgICBvcHQudXNlQ2FjaGUgJiYgKGNhY2hlW3N0cl0gPSB7dDogdG9rZW5zLCBzaW1wbGU6IHNpbXBsZVBhdGh9KTtcbiAgICAgICAgICAgIHJldHVybiB7dDogdG9rZW5zLCBzaW1wbGU6IHNpbXBsZVBhdGh9O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHBhdGhMZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAvLyBTa2lwIGVzY2FwZSBjaGFyYWN0ZXIgKGBcXGApIGFuZCBzZXQgXCJlc2NhcGVkXCIgdG8gdGhlIGluZGV4IHZhbHVlXG4gICAgICAgICAgICAvLyBvZiB0aGUgY2hhcmFjdGVyIHRvIGJlIHRyZWF0ZWQgYXMgYSBsaXRlcmFsXG4gICAgICAgICAgICBpZiAoIWVzY2FwZWQgJiYgcGF0aFtpXSA9PT0gJ1xcXFwnKXtcbiAgICAgICAgICAgICAgICAvLyBOZXh0IGNoYXJhY3RlciBpcyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICBlc2NhcGVkID0gaSsxO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIGEgd2lsZGNhcmQgY2hhcmFjdGVyIGlzIGZvdW5kLCBtYXJrIHRoaXMgdG9rZW4gYXMgaGF2aW5nIGEgd2lsZGNhcmRcbiAgICAgICAgICAgIGlmIChwYXRoW2ldID09PSAkV0lMRENBUkQpIHtcbiAgICAgICAgICAgICAgICBoYXNXaWxkY2FyZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGFscmVhZHkgcHJvY2Vzc2VkIGEgY29udGFpbmVyIG9wZW5lciwgdHJlYXQgdGhpcyBzdWJwYXRoIHNwZWNpYWxseVxuICAgICAgICAgICAgaWYgKGRlcHRoID4gMCl7XG4gICAgICAgICAgICAgICAgLy8gSXMgdGhpcyBjaGFyYWN0ZXIgYW5vdGhlciBvcGVuZXIgZnJvbSB0aGUgc2FtZSBjb250YWluZXI/IElmIHNvLCBhZGQgdG9cbiAgICAgICAgICAgICAgICAvLyB0aGUgZGVwdGggbGV2ZWwgc28gd2UgY2FuIG1hdGNoIHRoZSBjbG9zZXJzIGNvcnJlY3RseS4gKEV4Y2VwdCBmb3IgcXVvdGVzXG4gICAgICAgICAgICAgICAgLy8gd2hpY2ggY2Fubm90IGJlIG5lc3RlZClcbiAgICAgICAgICAgICAgICAvLyBJcyB0aGlzIGNoYXJhY3RlciB0aGUgY2xvc2VyPyBJZiBzbywgYmFjayBvdXQgb25lIGxldmVsIG9mIGRlcHRoLlxuICAgICAgICAgICAgICAgIC8vIEJlIGNhcmVmdWw6IHF1b3RlIGNvbnRhaW5lciB1c2VzIHNhbWUgY2hhcmFjdGVyIGZvciBvcGVuZXIgYW5kIGNsb3Nlci5cbiAgICAgICAgICAgICAgICAhZXNjYXBlZCAmJiBwYXRoW2ldID09PSBvcGVuZXIgJiYgb3BlbmVyICE9PSBjbG9zZXIuY2xvc2VyICYmIGRlcHRoKys7XG4gICAgICAgICAgICAgICAgIWVzY2FwZWQgJiYgcGF0aFtpXSA9PT0gY2xvc2VyLmNsb3NlciAmJiBkZXB0aC0tO1xuXG4gICAgICAgICAgICAgICAgLy8gV2hpbGUgc3RpbGwgaW5zaWRlIHRoZSBjb250YWluZXIsIGp1c3QgYWRkIHRvIHRoZSBzdWJwYXRoXG4gICAgICAgICAgICAgICAgaWYgKGRlcHRoID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIHN1YnBhdGggKz0gcGF0aFtpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gV2hlbiB3ZSBjbG9zZSBvZmYgdGhlIGNvbnRhaW5lciwgdGltZSB0byBwcm9jZXNzIHRoZSBzdWJwYXRoIGFuZCBhZGQgcmVzdWx0cyB0byBvdXIgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBzdWJwYXRoIFwiW2Jhcl1cIiBpbiBmb28uW2Jhcl0sW2Jhel0gLSB3ZSBtdXN0IHByb2Nlc3Mgc3VicGF0aCBhbmQgY3JlYXRlIGEgbmV3IGNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgaWYgKGkrMSA8IHBhdGhMZW5ndGggJiYgb3B0LnNlcGFyYXRvcnNbcGF0aFtpKzFdXSAmJiBvcHQuc2VwYXJhdG9yc1twYXRoW2krMV1dLmV4ZWMgPT09ICRDT0xMRUNUSU9OKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdWJwYXRoLmxlbmd0aCAmJiBjbG9zZXIuZXhlYyA9PT0gJFBST1BFUlRZKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN1ciA9IHN0cmlwUXVvdGVzKHN1YnBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY2xvc2VyLmV4ZWMgPT09ICRTSU5HTEVRVU9URSB8fCBjbG9zZXIuZXhlYyA9PT0gJERPVUJMRVFVT1RFKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN1ciA9IHN1YnBhdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN1ciA9IHRva2VuaXplKHN1YnBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWN1ciA9PT0gVU5ERUYpeyByZXR1cm4gdW5kZWZpbmVkOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjdXIuZXhlYyA9IGNsb3Nlci5leGVjO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY3VyLmRvRWFjaCA9IGRvRWFjaDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbGxlY3Rpb24ucHVzaChjbG9zZXIuZXhlYyA9PT0gJFBST1BFUlRZID8gcmVjdXIudFswXSA6IHJlY3VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24ucHVzaChyZWN1cik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHN1YnBhdGggXCJbYmF6XVwiIGluIGZvby5bYmFyXSxbYmF6XSAtIHdlIG11c3QgcHJvY2VzcyBzdWJwYXRoIGFuZCBhZGQgdG8gY29sbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjb2xsZWN0aW9uWzBdKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdWJwYXRoLmxlbmd0aCAmJiBjbG9zZXIuZXhlYyA9PT0gJFBST1BFUlRZKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN1ciA9IHN0cmlwUXVvdGVzKHN1YnBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY2xvc2VyLmV4ZWMgPT09ICRTSU5HTEVRVU9URSB8fCBjbG9zZXIuZXhlYyA9PT0gJERPVUJMRVFVT1RFKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN1ciA9IHN1YnBhdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN1ciA9IHRva2VuaXplKHN1YnBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWN1ciA9PT0gVU5ERUYpeyByZXR1cm4gdW5kZWZpbmVkOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjdXIuZXhlYyA9IGNsb3Nlci5leGVjO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY3VyLmRvRWFjaCA9IGRvRWFjaDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24ucHVzaChyZWN1cik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7J3R0Jzpjb2xsZWN0aW9uLCAnZG9FYWNoJzpkb0VhY2h9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpbXBsZVBhdGggJj0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gU2ltcGxlIHByb3BlcnR5IGNvbnRhaW5lciBpcyBlcXVpdmFsZW50IHRvIGRvdC1zZXBhcmF0ZWQgdG9rZW4uIEp1c3QgYWRkIHRoaXMgdG9rZW4gdG8gdG9rZW5zLlxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjbG9zZXIuZXhlYyA9PT0gJFBST1BFUlRZKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY3VyID0ge3Q6W3N0cmlwUXVvdGVzKHN1YnBhdGgpXX07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9FYWNoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh7J3cnOnJlY3VyLnRbMF0sICdtb2RzJzp7fSwgJ2RvRWFjaCc6dHJ1ZX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpbXBsZVBhdGggJj0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9FYWNoID0gZmFsc2U7IC8vIHJlc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaChyZWN1ci50WzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaW1wbGVQYXRoICY9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gUXVvdGVkIHN1YnBhdGggaXMgYWxsIHRha2VuIGxpdGVyYWxseSB3aXRob3V0IHRva2VuIGV2YWx1YXRpb24uIEp1c3QgYWRkIHN1YnBhdGggdG8gdG9rZW5zIGFzLWlzLlxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjbG9zZXIuZXhlYyA9PT0gJFNJTkdMRVFVT1RFIHx8IGNsb3Nlci5leGVjID09PSAkRE9VQkxFUVVPVEUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goc3VicGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaW1wbGVQYXRoICY9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBjcmVhdGUgdG9rZW4gb2JqZWN0IHRvIGhvbGQgdG9rZW5pemVkIHN1YnBhdGgsIGFkZCB0byB0b2tlbnMuXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN1YnBhdGggPT09ICcnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN1ciA9IHt0OltdLHNpbXBsZTp0cnVlfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY3VyID0gdG9rZW5pemUoc3VicGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVjdXIgPT09IFVOREVGKXsgcmV0dXJuIHVuZGVmaW5lZDsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVjdXIuZXhlYyA9IGNsb3Nlci5leGVjO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVjdXIuZG9FYWNoID0gZG9FYWNoO1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2gocmVjdXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2ltcGxlUGF0aCAmPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzdWJwYXRoID0gJyc7IC8vIHJlc2V0IHN1YnBhdGhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiBhIHByZWZpeCBjaGFyYWN0ZXIgaXMgZm91bmQsIHN0b3JlIGl0IGluIGBtb2RzYCBmb3IgbGF0ZXIgcmVmZXJlbmNlLlxuICAgICAgICAgICAgLy8gTXVzdCBrZWVwIGNvdW50IGR1ZSB0byBgcGFyZW50YCBwcmVmaXggdGhhdCBjYW4gYmUgdXNlZCBtdWx0aXBsZSB0aW1lcyBpbiBvbmUgdG9rZW4uXG4gICAgICAgICAgICBlbHNlIGlmICghZXNjYXBlZCAmJiBwYXRoW2ldIGluIG9wdC5wcmVmaXhlcyAmJiBvcHQucHJlZml4ZXNbcGF0aFtpXV0uZXhlYyl7XG4gICAgICAgICAgICAgICAgbW9kcy5oYXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChtb2RzW29wdC5wcmVmaXhlc1twYXRoW2ldXS5leGVjXSkgeyBtb2RzW29wdC5wcmVmaXhlc1twYXRoW2ldXS5leGVjXSsrOyB9XG4gICAgICAgICAgICAgICAgZWxzZSB7IG1vZHNbb3B0LnByZWZpeGVzW3BhdGhbaV1dLmV4ZWNdID0gMTsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgYSBzZXBhcmF0b3IgaXMgZm91bmQsIHRpbWUgdG8gc3RvcmUgdGhlIHRva2VuIHdlJ3ZlIGJlZW4gYWNjdW11bGF0aW5nLiBJZlxuICAgICAgICAgICAgLy8gdGhpcyB0b2tlbiBoYWQgYSBwcmVmaXgsIHdlIHN0b3JlIHRoZSB0b2tlbiBhcyBhbiBvYmplY3Qgd2l0aCBtb2RpZmllciBkYXRhLlxuICAgICAgICAgICAgLy8gSWYgdGhlIHNlcGFyYXRvciBpcyB0aGUgY29sbGVjdGlvbiBzZXBhcmF0b3IsIHdlIG11c3QgZWl0aGVyIGNyZWF0ZSBvciBhZGRcbiAgICAgICAgICAgIC8vIHRvIGEgY29sbGVjdGlvbiBmb3IgdGhpcyB0b2tlbi4gRm9yIHNpbXBsZSBzZXBhcmF0b3IsIHdlIGVpdGhlciBhZGQgdGhlIHRva2VuXG4gICAgICAgICAgICAvLyB0byB0aGUgdG9rZW4gbGlzdCBvciBlbHNlIGFkZCB0byB0aGUgZXhpc3RpbmcgY29sbGVjdGlvbiBpZiBpdCBleGlzdHMuXG4gICAgICAgICAgICBlbHNlIGlmICghZXNjYXBlZCAmJiBvcHQuc2VwYXJhdG9yc1twYXRoW2ldXSAmJiBvcHQuc2VwYXJhdG9yc1twYXRoW2ldXS5leGVjKXtcbiAgICAgICAgICAgICAgICBzZXBhcmF0b3IgPSBvcHQuc2VwYXJhdG9yc1twYXRoW2ldXTtcbiAgICAgICAgICAgICAgICBpZiAoIXdvcmQgJiYgKG1vZHMuaGFzIHx8IGhhc1dpbGRjYXJkKSl7XG4gICAgICAgICAgICAgICAgICAgIC8vIGZvdW5kIGEgc2VwYXJhdG9yLCBhZnRlciBzZWVpbmcgcHJlZml4ZXMsIGJ1dCBubyB0b2tlbiB3b3JkIC0+IGludmFsaWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVGhpcyB0b2tlbiB3aWxsIHJlcXVpcmUgc3BlY2lhbCBpbnRlcnByZXRlciBwcm9jZXNzaW5nIGR1ZSB0byBwcmVmaXggb3Igd2lsZGNhcmQuXG4gICAgICAgICAgICAgICAgaWYgKHdvcmQgJiYgKG1vZHMuaGFzIHx8IGhhc1dpbGRjYXJkIHx8IGRvRWFjaCkpe1xuICAgICAgICAgICAgICAgICAgICB3b3JkID0geyd3Jzogd29yZCwgJ21vZHMnOiBtb2RzLCAnZG9FYWNoJzogZG9FYWNofTtcbiAgICAgICAgICAgICAgICAgICAgbW9kcyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBzaW1wbGVQYXRoICY9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyB3b3JkIGlzIGEgcGxhaW4gcHJvcGVydHkgb3IgZW5kIG9mIGNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICBpZiAoc2VwYXJhdG9yLmV4ZWMgPT09ICRQUk9QRVJUWSB8fCBzZXBhcmF0b3IuZXhlYyA9PT0gJEVBQ0gpe1xuICAgICAgICAgICAgICAgICAgICAvLyB3ZSBhcmUgZ2F0aGVyaW5nIGEgY29sbGVjdGlvbiwgc28gYWRkIGxhc3Qgd29yZCB0byBjb2xsZWN0aW9uIGFuZCB0aGVuIHN0b3JlXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2xsZWN0aW9uWzBdICE9PSBVTkRFRil7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JkICYmIGNvbGxlY3Rpb24ucHVzaCh3b3JkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHsndHQnOmNvbGxlY3Rpb24sICdkb0VhY2gnOmRvRWFjaH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbiA9IFtdOyAvLyByZXNldFxuICAgICAgICAgICAgICAgICAgICAgICAgc2ltcGxlUGF0aCAmPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyB3b3JkIGlzIGEgcGxhaW4gcHJvcGVydHlcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JkICYmIHRva2Vucy5wdXNoKHdvcmQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2ltcGxlUGF0aCAmPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzZXBhcmF0b3IgaXMgdGhlIFwiZWFjaFwiIHNlcGFydG9yLCB0aGUgZm9sbG93aW5nIHdvcmQgd2lsbCBiZSBldmFsdWF0ZWQgZGlmZmVyZW50bHkuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGl0J3Mgbm90IHRoZSBcImVhY2hcIiBzZXBhcmF0b3IsIHRoZW4gcmVzZXQgXCJkb0VhY2hcIlxuICAgICAgICAgICAgICAgICAgICBkb0VhY2ggPSBzZXBhcmF0b3IuZXhlYyA9PT0gJEVBQ0g7IC8vIHJlc2V0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIHdvcmQgaXMgYSBjb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc2VwYXJhdG9yLmV4ZWMgPT09ICRDT0xMRUNUSU9OKXtcbiAgICAgICAgICAgICAgICAgICAgd29yZCAmJiBjb2xsZWN0aW9uLnB1c2god29yZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHdvcmQgPSAnJzsgLy8gcmVzZXRcbiAgICAgICAgICAgICAgICBoYXNXaWxkY2FyZCA9IGZhbHNlOyAvLyByZXNldFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRm91bmQgYSBjb250YWluZXIgb3BlbmluZyBjaGFyYWN0ZXIuIEEgY29udGFpbmVyIG9wZW5pbmcgaXMgZXF1aXZhbGVudCB0b1xuICAgICAgICAgICAgLy8gZmluZGluZyBhIHNlcGFyYXRvciwgc28gXCJmb28uYmFyXCIgaXMgZXF1aXZhbGVudCB0byBcImZvb1tiYXJdXCIsIHNvIGFwcGx5IHNpbWlsYXJcbiAgICAgICAgICAgIC8vIHByb2Nlc3MgYXMgc2VwYXJhdG9yIGFib3ZlIHdpdGggcmVzcGVjdCB0byB0b2tlbiB3ZSBoYXZlIGFjY3VtdWxhdGVkIHNvIGZhci5cbiAgICAgICAgICAgIC8vIEV4Y2VwdCBpbiBjYXNlIGNvbGxlY3Rpb25zIC0gcGF0aCBtYXkgaGF2ZSBhIGNvbGxlY3Rpb24gb2YgY29udGFpbmVycywgc29cbiAgICAgICAgICAgIC8vIGluIFwiZm9vW2Jhcl0sW2Jhel1cIiwgdGhlIFwiW2Jhcl1cIiBtYXJrcyB0aGUgZW5kIG9mIHRva2VuIFwiZm9vXCIsIGJ1dCBcIltiYXpdXCIgaXNcbiAgICAgICAgICAgIC8vIG1lcmVseSBhbm90aGVyIGVudHJ5IGluIHRoZSBjb2xsZWN0aW9uLCBzbyB3ZSBkb24ndCBjbG9zZSBvZmYgdGhlIGNvbGxlY3Rpb24gdG9rZW5cbiAgICAgICAgICAgIC8vIHlldC5cbiAgICAgICAgICAgIC8vIFNldCBkZXB0aCB2YWx1ZSBmb3IgZnVydGhlciBwcm9jZXNzaW5nLlxuICAgICAgICAgICAgZWxzZSBpZiAoIWVzY2FwZWQgJiYgb3B0LmNvbnRhaW5lcnNbcGF0aFtpXV0gJiYgb3B0LmNvbnRhaW5lcnNbcGF0aFtpXV0uZXhlYyl7XG4gICAgICAgICAgICAgICAgY2xvc2VyID0gb3B0LmNvbnRhaW5lcnNbcGF0aFtpXV07XG4gICAgICAgICAgICAgICAgaWYgKHdvcmQgJiYgKG1vZHMuaGFzIHx8IGhhc1dpbGRjYXJkIHx8IGRvRWFjaCkpe1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHdvcmQgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmQgPSB7J3cnOiB3b3JkLCAnbW9kcyc6IG1vZHMsICdkb0VhY2gnOmRvRWFjaH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JkLm1vZHMgPSBtb2RzO1xuICAgICAgICAgICAgICAgICAgICAgICAgd29yZC5kb0VhY2ggPSBkb0VhY2g7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbW9kcyA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29sbGVjdGlvblswXSAhPT0gVU5ERUYpe1xuICAgICAgICAgICAgICAgICAgICAvLyB3ZSBhcmUgZ2F0aGVyaW5nIGEgY29sbGVjdGlvbiwgc28gYWRkIGxhc3Qgd29yZCB0byBjb2xsZWN0aW9uIGFuZCB0aGVuIHN0b3JlXG4gICAgICAgICAgICAgICAgICAgIHdvcmQgJiYgY29sbGVjdGlvbi5wdXNoKHdvcmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd29yZCBpcyBhIHBsYWluIHByb3BlcnR5XG4gICAgICAgICAgICAgICAgICAgIHdvcmQgJiYgdG9rZW5zLnB1c2god29yZCk7XG4gICAgICAgICAgICAgICAgICAgIHNpbXBsZVBhdGggJj0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb3BlbmVyID0gcGF0aFtpXTtcbiAgICAgICAgICAgICAgICAvLyAxKSBkb24ndCByZXNldCBkb0VhY2ggZm9yIGVtcHR5IHdvcmQgYmVjYXVzZSB0aGlzIGlzIFtmb29dPFtiYXJdXG4gICAgICAgICAgICAgICAgLy8gMikgZG9uJ3QgcmVzZXQgZG9FYWNoIGZvciBvcGVuaW5nIENhbGwgYmVjYXVzZSB0aGlzIGlzIGEsYjxmbigpXG4gICAgICAgICAgICAgICAgaWYgKHdvcmQgJiYgb3B0LmNvbnRhaW5lcnNbb3BlbmVyXS5leGVjICE9PSAkQ0FMTCl7XG4gICAgICAgICAgICAgICAgICAgIGRvRWFjaCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3b3JkID0gJyc7XG4gICAgICAgICAgICAgICAgaGFzV2lsZGNhcmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBkZXB0aCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCB0aGlzIGlzIGp1c3QgYW5vdGhlciBjaGFyYWN0ZXIgdG8gYWRkIHRvIHRoZSBjdXJyZW50IHRva2VuXG4gICAgICAgICAgICBlbHNlIGlmIChpIDwgcGF0aExlbmd0aCkge1xuICAgICAgICAgICAgICAgIHdvcmQgKz0gcGF0aFtpXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgY3VycmVudCBwYXRoIGluZGV4IG1hdGNoZXMgdGhlIGVzY2FwZSBpbmRleCB2YWx1ZSwgcmVzZXQgYGVzY2FwZWRgXG4gICAgICAgICAgICBpZiAoaSA8IHBhdGhMZW5ndGggJiYgaSA9PT0gZXNjYXBlZCl7XG4gICAgICAgICAgICAgICAgZXNjYXBlZCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQYXRoIGVuZGVkIGluIGFuIGVzY2FwZSBjaGFyYWN0ZXJcbiAgICAgICAgaWYgKGVzY2FwZWQpe1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCB0cmFpbGluZyB3b3JkIHRvIHRva2VucywgaWYgcHJlc2VudFxuICAgICAgICBpZiAodHlwZW9mIHdvcmQgPT09ICdzdHJpbmcnICYmIHdvcmQgJiYgKG1vZHMuaGFzIHx8IGhhc1dpbGRjYXJkIHx8IGRvRWFjaCkpe1xuICAgICAgICAgICAgd29yZCA9IHsndyc6IHdvcmQsICdtb2RzJzogbW9kcywgJ2RvRWFjaCc6IGRvRWFjaH07XG4gICAgICAgICAgICBtb2RzID0ge307XG4gICAgICAgICAgICBzaW1wbGVQYXRoICY9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHdvcmQgJiYgd29yZC5tb2RzKXtcbiAgICAgICAgICAgIHdvcmQubW9kcyA9IG1vZHM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gV2UgYXJlIGdhdGhlcmluZyBhIGNvbGxlY3Rpb24sIHNvIGFkZCBsYXN0IHdvcmQgdG8gY29sbGVjdGlvbiBhbmQgdGhlbiBzdG9yZVxuICAgICAgICBpZiAoY29sbGVjdGlvblswXSAhPT0gVU5ERUYpe1xuICAgICAgICAgICAgd29yZCAmJiBjb2xsZWN0aW9uLnB1c2god29yZCk7XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh7J3R0Jzpjb2xsZWN0aW9uLCAnZG9FYWNoJzpkb0VhY2h9KTtcbiAgICAgICAgICAgIHNpbXBsZVBhdGggJj0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gV29yZCBpcyBhIHBsYWluIHByb3BlcnR5XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd29yZCAmJiB0b2tlbnMucHVzaCh3b3JkKTtcbiAgICAgICAgICAgIHNpbXBsZVBhdGggJj0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRlcHRoICE9IDAgbWVhbnMgbWlzbWF0Y2hlZCBjb250YWluZXJzXG4gICAgICAgIGlmIChkZXB0aCAhPT0gMCl7IHJldHVybiB1bmRlZmluZWQ7IH1cblxuICAgICAgICAvLyBJZiBwYXRoIHdhcyB2YWxpZCwgY2FjaGUgdGhlIHJlc3VsdFxuICAgICAgICBvcHQudXNlQ2FjaGUgJiYgKGNhY2hlW3N0cl0gPSB7dDogdG9rZW5zLCBzaW1wbGU6IHNpbXBsZVBhdGh9KTtcblxuICAgICAgICByZXR1cm4ge3Q6IHRva2Vucywgc2ltcGxlOiBzaW1wbGVQYXRofTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSXQgaXMgYHJlc29sdmVQYXRoYCdzIGpvYiB0byB0cmF2ZXJzZSBhbiBvYmplY3QgYWNjb3JkaW5nIHRvIHRoZSB0b2tlbnNcbiAgICAgKiBkZXJpdmVkIGZyb20gdGhlIGtleXBhdGggYW5kIGVpdGhlciByZXR1cm4gdGhlIHZhbHVlIGZvdW5kIHRoZXJlIG9yIHNldFxuICAgICAqIGEgbmV3IHZhbHVlIGluIHRoYXQgbG9jYXRpb24uXG4gICAgICogVGhlIHRva2VucyBhcmUgYSBzaW1wbGUgYXJyYXkgYW5kIGByZW9zbHZlUGF0aGAgbG9vcHMgdGhyb3VnaCB0aGUgbGlzdFxuICAgICAqIHdpdGggYSBzaW1wbGUgXCJ3aGlsZVwiIGxvb3AuIEEgdG9rZW4gbWF5IGl0c2VsZiBiZSBhIG5lc3RlZCB0b2tlbiBhcnJheSxcbiAgICAgKiB3aGljaCBpcyBwcm9jZXNzZWQgdGhyb3VnaCByZWN1cnNpb24uXG4gICAgICogQXMgZWFjaCBzdWNjZXNzaXZlIHZhbHVlIGlzIHJlc29sdmVkIHdpdGhpbiBgb2JqYCwgdGhlIGN1cnJlbnQgdmFsdWUgaXNcbiAgICAgKiBwdXNoZWQgb250byB0aGUgXCJ2YWx1ZVN0YWNrXCIsIGVuYWJsaW5nIGJhY2t3YXJkIHJlZmVyZW5jZXMgKHVwd2FyZHMgaW4gYG9iamApXG4gICAgICogdGhyb3VnaCBwYXRoIHByZWZpeGVzIGxpa2UgXCI8XCIgZm9yIFwicGFyZW50XCIgYW5kIFwiflwiIGZvciBcInJvb3RcIi4gVGhlIGxvb3BcbiAgICAgKiBzaG9ydC1jaXJjdWl0cyBieSByZXR1cm5pbmcgYHVuZGVmaW5lZGAgaWYgdGhlIHBhdGggaXMgaW52YWxpZCBhdCBhbnkgcG9pbnQsXG4gICAgICogZXhjZXB0IGluIGBzZXRgIHNjZW5hcmlvIHdpdGggYGZvcmNlYCBlbmFibGVkLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBvYmogICAgICAgIFRoZSBkYXRhIG9iamVjdCB0byBiZSByZWFkL3dyaXR0ZW5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggICAgICAgVGhlIGtleXBhdGggd2hpY2ggYHJlc29sdmVQYXRoYCB3aWxsIGV2YWx1YXRlIGFnYWluc3QgYG9iamAuIE1heSBiZSBhIHByZS1jb21waWxlZCBUb2tlbnMgc2V0IGluc3RlYWQgb2YgYSBzdHJpbmcuXG4gICAgICogQHBhcmFtICB7QW55fSBuZXdWYWx1ZSAgIFRoZSBuZXcgdmFsdWUgdG8gc2V0IGF0IHRoZSBwb2ludCBkZXNjcmliZWQgYnkgYHBhdGhgLiBVbmRlZmluZWQgaWYgdXNlZCBpbiBgZ2V0YCBzY2VuYXJpby5cbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gYXJncyAgICAgICBBcnJheSBvZiBleHRyYSBhcmd1bWVudHMgd2hpY2ggbWF5IGJlIHJlZmVyZW5jZWQgYnkgcGxhY2Vob2xkZXJzLiBVbmRlZmluZWQgaWYgbm8gZXh0cmEgYXJndW1lbnRzIHdlcmUgZ2l2ZW4uXG4gICAgICogQHBhcmFtICB7QXJyYXl9IHZhbHVlU3RhY2sgU3RhY2sgb2Ygb2JqZWN0IGNvbnRleHRzIGFjY3VtdWxhdGVkIGFzIHRoZSBwYXRoIHRva2VucyBhcmUgcHJvY2Vzc2VkIGluIGBvYmpgXG4gICAgICogQHJldHVybiB7QW55fSAgICAgICAgICAgIEluIGBnZXRgLCByZXR1cm5zIHRoZSB2YWx1ZSBmb3VuZCBpbiBgb2JqYCBhdCBgcGF0aGAuIEluIGBzZXRgLCByZXR1cm5zIHRoZSBuZXcgdmFsdWUgdGhhdCB3YXMgc2V0IGluIGBvYmpgLiBJZiBgZ2V0YCBvciBgc2V0YCBhcmUgbnRvIHN1Y2Nlc3NmdWwsIHJldHVybnMgYHVuZGVmaW5lZGBcbiAgICAgKi9cbiAgICB2YXIgcmVzb2x2ZVBhdGggPSBmdW5jdGlvbiAob2JqLCBwYXRoLCBuZXdWYWx1ZSwgYXJncywgdmFsdWVTdGFjayl7XG4gICAgICAgIHZhciBjaGFuZ2UgPSBuZXdWYWx1ZSAhPT0gVU5ERUYsIC8vIGFyZSB3ZSBzZXR0aW5nIGEgbmV3IHZhbHVlP1xuICAgICAgICAgICAgdGsgPSBbXSxcbiAgICAgICAgICAgIHRrTGVuZ3RoID0gMCxcbiAgICAgICAgICAgIHRrTGFzdElkeCA9IDAsXG4gICAgICAgICAgICB2YWx1ZVN0YWNrTGVuZ3RoID0gMSxcbiAgICAgICAgICAgIGkgPSAwLCBqID0gMCxcbiAgICAgICAgICAgIHByZXYgPSBvYmosXG4gICAgICAgICAgICBjdXJyID0gJycsXG4gICAgICAgICAgICBjdXJyTGVuZ3RoID0gMCxcbiAgICAgICAgICAgIGVhY2hMZW5ndGggPSAwLFxuICAgICAgICAgICAgd29yZENvcHkgPSAnJyxcbiAgICAgICAgICAgIGNvbnRleHRQcm9wLFxuICAgICAgICAgICAgaWR4ID0gMCxcbiAgICAgICAgICAgIGNvbnRleHQgPSBvYmosXG4gICAgICAgICAgICByZXQsXG4gICAgICAgICAgICBuZXdWYWx1ZUhlcmUgPSBmYWxzZSxcbiAgICAgICAgICAgIHBsYWNlSW50ID0gMCxcbiAgICAgICAgICAgIHByb3AgPSAnJyxcbiAgICAgICAgICAgIGNhbGxBcmdzO1xuXG4gICAgICAgIC8vIEZvciBTdHJpbmcgcGF0aCwgZWl0aGVyIGZldGNoIHRva2VucyBmcm9tIGNhY2hlIG9yIGZyb20gYHRva2VuaXplYC5cbiAgICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAkU1RSSU5HKXtcbiAgICAgICAgICAgIGlmIChvcHQudXNlQ2FjaGUgJiYgY2FjaGVbcGF0aF0pIHsgdGsgPSBjYWNoZVtwYXRoXS50OyB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ayA9IHRva2VuaXplKHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICh0ayA9PT0gVU5ERUYpeyByZXR1cm4gdW5kZWZpbmVkOyB9XG4gICAgICAgICAgICAgICAgdGsgPSB0ay50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEZvciBhIG5vbi1zdHJpbmcsIGFzc3VtZSBhIHByZS1jb21waWxlZCB0b2tlbiBhcnJheVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRrID0gcGF0aC50ID8gcGF0aC50IDogW3BhdGhdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGtMZW5ndGggPSB0ay5sZW5ndGg7XG4gICAgICAgIGlmICh0a0xlbmd0aCA9PT0gMCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9XG4gICAgICAgIHRrTGFzdElkeCA9IHRrTGVuZ3RoIC0gMTtcblxuICAgICAgICAvLyB2YWx1ZVN0YWNrIHdpbGwgYmUgYW4gYXJyYXkgaWYgd2UgYXJlIHdpdGhpbiBhIHJlY3Vyc2l2ZSBjYWxsIHRvIGByZXNvbHZlUGF0aGBcbiAgICAgICAgaWYgKHZhbHVlU3RhY2spe1xuICAgICAgICAgICAgdmFsdWVTdGFja0xlbmd0aCA9IHZhbHVlU3RhY2subGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uIG9yaWdpbmFsIGVudHJ5IHRvIGByZXNvbHZlUGF0aGAsIGluaXRpYWxpemUgdmFsdWVTdGFjayB3aXRoIHRoZSBiYXNlIG9iamVjdC5cbiAgICAgICAgLy8gdmFsdWVTdGFja0xlbmd0aCB3YXMgYWxyZWFkeSBpbml0aWFsaXplZCB0byAxLlxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlU3RhY2sgPSBbb2JqXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnZlcnRlZCBBcnJheS5yZWR1Y2UgaW50byB3aGlsZSBsb29wLCBzdGlsbCB1c2luZyBcInByZXZcIiwgXCJjdXJyXCIsIFwiaWR4XCJcbiAgICAgICAgLy8gYXMgbG9vcCB2YWx1ZXNcbiAgICAgICAgd2hpbGUgKHByZXYgIT09IFVOREVGICYmIGlkeCA8IHRrTGVuZ3RoKXtcbiAgICAgICAgICAgIGN1cnIgPSB0a1tpZHhdO1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSBhcmUgc2V0dGluZyBhIG5ldyB2YWx1ZSBhbmQgdGhpcyB0b2tlbiBpcyB0aGUgbGFzdCB0b2tlbiwgdGhpc1xuICAgICAgICAgICAgLy8gaXMgdGhlIHBvaW50IHdoZXJlIHRoZSBuZXcgdmFsdWUgbXVzdCBiZSBzZXQuXG4gICAgICAgICAgICBuZXdWYWx1ZUhlcmUgPSAoY2hhbmdlICYmIChpZHggPT09IHRrTGFzdElkeCkpO1xuXG4gICAgICAgICAgICAvLyBIYW5kbGUgbW9zdCBjb21tb24gc2ltcGxlIHBhdGggc2NlbmFyaW8gZmlyc3RcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VyciA9PT0gJFNUUklORyl7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgYXJlIHNldHRpbmcuLi5cbiAgICAgICAgICAgICAgICBpZiAoY2hhbmdlKXtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyB0aGUgZmluYWwgdG9rZW4gd2hlcmUgdGhlIG5ldyB2YWx1ZSBnb2VzLCBzZXQgaXRcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlSGVyZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0W2N1cnJdID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGV4dFtjdXJyXSAhPT0gbmV3VmFsdWUpeyByZXR1cm4gdW5kZWZpbmVkOyB9IC8vIG5ldyB2YWx1ZSBmYWlsZWQgdG8gc2V0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGVhcmxpZXIgdG9rZW5zLCBjcmVhdGUgb2JqZWN0IHByb3BlcnRpZXMgaWYgXCJmb3JjZVwiIGlzIGVuYWJsZWRcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAob3B0LmZvcmNlICYmIHR5cGVvZiBjb250ZXh0W2N1cnJdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dFtjdXJyXSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFJldHVybiB2YWx1ZSBpcyBhc3NpZ25lZCBhcyB2YWx1ZSBvZiB0aGlzIG9iamVjdCBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgIHJldCA9IGNvbnRleHRbY3Vycl07XG5cbiAgICAgICAgICAgICAgICAvLyBUaGlzIGJhc2ljIHN0cnVjdHVyZSBpcyByZXBlYXRlZCBpbiBvdGhlciBzY2VuYXJpb3MgYmVsb3csIHNvIHRoZSBsb2dpY1xuICAgICAgICAgICAgICAgIC8vIHBhdHRlcm4gaXMgb25seSBkb2N1bWVudGVkIGhlcmUgZm9yIGJyZXZpdHkuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoY3VyciA9PT0gVU5ERUYpe1xuICAgICAgICAgICAgICAgICAgICByZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGN1cnIudHQpe1xuICAgICAgICAgICAgICAgICAgICAvLyBDYWxsIHJlc29sdmVQYXRoIGFnYWluIHdpdGggYmFzZSB2YWx1ZSBhcyBldmFsdWF0ZWQgdmFsdWUgc28gZmFyIGFuZFxuICAgICAgICAgICAgICAgICAgICAvLyBlYWNoIGVsZW1lbnQgb2YgYXJyYXkgYXMgdGhlIHBhdGguIENvbmNhdCBhbGwgdGhlIHJlc3VsdHMgdG9nZXRoZXIuXG4gICAgICAgICAgICAgICAgICAgIHJldCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3Vyci5kb0VhY2gpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbnRleHQpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaiA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBlYWNoTGVuZ3RoID0gY29udGV4dC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBhdGggbGlrZSBBcnJheS0+RWFjaC0+QXJyYXkgcmVxdWlyZXMgYSBuZXN0ZWQgZm9yIGxvb3BcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvIHByb2Nlc3MgdGhlIHR3byBhcnJheSBsYXllcnMuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZShqIDwgZWFjaExlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goW10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJMZW5ndGggPSBjdXJyLnR0Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZShpIDwgY3Vyckxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIudHRbaV0uZG9FYWNoID0gZmFsc2U7IC8vIFRoaXMgaXMgYSBoYWNrLCBkb24ndCBrbm93IGhvdyBlbHNlIHRvIGRpc2FibGUgXCJkb0VhY2hcIiBmb3IgY29sbGVjdGlvbiBtZW1iZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZUhlcmUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dFByb3AgPSByZXNvbHZlUGF0aChjb250ZXh0W2pdLCBjdXJyLnR0W2ldLCBuZXdWYWx1ZSwgYXJncywgdmFsdWVTdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGN1cnIudHRbaV0gPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRQcm9wID0gY29udGV4dFtqXVtjdXJyLnR0W2ldXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRQcm9wID0gcmVzb2x2ZVBhdGgoY29udGV4dFtqXSwgY3Vyci50dFtpXSwgdW5kZWZpbmVkLCBhcmdzLCB2YWx1ZVN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGV4dFByb3AgPT09IFVOREVGKSB7IHJldHVybiB1bmRlZmluZWQ7IH1cbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZUhlcmUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnIudHRbaV0udCAmJiBjdXJyLnR0W2ldLmV4ZWMgPT09ICRFVkFMUFJPUEVSVFkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRbal1bY29udGV4dFByb3BdID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldFtqXS5wdXNoKGNvbnRleHRQcm9wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyLnR0W2ldLnQgJiYgY3Vyci50dFtpXS5leGVjID09PSAkRVZBTFBST1BFUlRZKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRbal0ucHVzaChjb250ZXh0W2pdW2NvbnRleHRQcm9wXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldFtqXS5wdXNoKGNvbnRleHRQcm9wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGorKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyckxlbmd0aCA9IGN1cnIudHQubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUoaSA8IGN1cnJMZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZUhlcmUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0UHJvcCA9IHJlc29sdmVQYXRoKGNvbnRleHQsIGN1cnIudHRbaV0sIG5ld1ZhbHVlLCBhcmdzLCB2YWx1ZVN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGN1cnIudHRbaV0gPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dFByb3AgPSBjb250ZXh0W2N1cnIudHRbaV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dFByb3AgPSByZXNvbHZlUGF0aChjb250ZXh0LCBjdXJyLnR0W2ldLCB1bmRlZmluZWQsIGFyZ3MsIHZhbHVlU3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGV4dFByb3AgPT09IFVOREVGKSB7IHJldHVybiB1bmRlZmluZWQ7IH1cbiAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWVIZXJlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnIudHRbaV0udCAmJiBjdXJyLnR0W2ldLmV4ZWMgPT09ICRFVkFMUFJPUEVSVFkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dFtjb250ZXh0UHJvcF0gPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGNvbnRleHRQcm9wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnIudHRbaV0udCAmJiBjdXJyLnR0W2ldLmV4ZWMgPT09ICRFVkFMUFJPUEVSVFkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goY29udGV4dFtjb250ZXh0UHJvcF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goY29udGV4dFByb3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjdXJyLncpe1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHdvcmQgdG9rZW4gaGFzIG1vZGlmaWVyc1xuICAgICAgICAgICAgICAgICAgICB3b3JkQ29weSA9IGN1cnIudztcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnIubW9kcy5oYXMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnIubW9kcy5wYXJlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1vZGlmeSBjdXJyZW50IGNvbnRleHQsIHNoaWZ0IHVwd2FyZHMgaW4gYmFzZSBvYmplY3Qgb25lIGxldmVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCA9IHZhbHVlU3RhY2tbdmFsdWVTdGFja0xlbmd0aCAtIDEgLSBjdXJyLm1vZHMucGFyZW50XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGV4dCA9PT0gVU5ERUYpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnIubW9kcy5yb290KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCBjb250ZXh0IGFuZCB2YWx1ZVN0YWNrLCBzdGFydCBvdmVyIGF0IHJvb3QgaW4gdGhpcyBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCA9IHZhbHVlU3RhY2tbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVTdGFjayA9IFtjb250ZXh0XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVN0YWNrTGVuZ3RoID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyLm1vZHMucGxhY2Vob2xkZXIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlSW50ID0gd29yZENvcHkgLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmdzW3BsYWNlSW50XSA9PT0gVU5ERUYpeyByZXR1cm4gdW5kZWZpbmVkOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yY2UgYXJnc1twbGFjZUludF0gdG8gU3RyaW5nLCB3b24ndCBhdHdvcmRDb3B5dCB0byBwcm9jZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXJnIG9mIHR5cGUgZnVuY3Rpb24sIGFycmF5LCBvciBwbGFpbiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JkQ29weSA9IGFyZ3NbcGxhY2VJbnRdLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBkb0VhY2ggb3B0aW9uIG1lYW5zIHRvIHRha2UgYWxsIHZhbHVlcyBpbiBjb250ZXh0IChtdXN0IGJlIGFuIGFycmF5KSwgYXBwbHlcbiAgICAgICAgICAgICAgICAgICAgLy8gXCJjdXJyXCIgdG8gZWFjaCBvbmUsIGFuZCByZXR1cm4gdGhlIG5ldyBhcnJheS4gT3BlcmF0ZXMgbGlrZSBBcnJheS5tYXAuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyLmRvRWFjaCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoY29udGV4dCkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWFjaExlbmd0aCA9IGNvbnRleHQubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUoaSA8IGVhY2hMZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwiY29udGV4dFwiIG1vZGlmaWVyIChcIkBcIiBieSBkZWZhdWx0KSByZXBsYWNlcyBjdXJyZW50IGNvbnRleHQgd2l0aCBhIHZhbHVlIGZyb21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgYXJndW1lbnRzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyLm1vZHMuY29udGV4dCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlSW50ID0gd29yZENvcHkgLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJnc1twbGFjZUludF0gPT09IFVOREVGKXsgcmV0dXJuIHVuZGVmaW5lZDsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3JjZSBhcmdzW3BsYWNlSW50XSB0byBTdHJpbmcsIHdvbid0IGF0d29yZENvcHl0IHRvIHByb2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXJnIG9mIHR5cGUgZnVuY3Rpb24sIGFycmF5LCBvciBwbGFpbiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goYXJnc1twbGFjZUludF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVwZWF0IGJhc2ljIHN0cmluZyBwcm9wZXJ0eSBwcm9jZXNzaW5nIHdpdGggd29yZCBhbmQgbW9kaWZpZWQgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGV4dFtpXVt3b3JkQ29weV0gIT09IFVOREVGKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWVIZXJlKXsgY29udGV4dFtpXVt3b3JkQ29weV0gPSBuZXdWYWx1ZTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goY29udGV4dFtpXVt3b3JkQ29weV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBjb250ZXh0W2ldID09PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKHdvcmRDb3B5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQbGFpbiBwcm9wZXJ0eSB0b2tlbnMgYXJlIGxpc3RlZCBhcyBzcGVjaWFsIHdvcmQgdG9rZW5zIHdoZW5ldmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEgd2lsZGNhcmQgaXMgZm91bmQgd2l0aGluIHRoZSBwcm9wZXJ0eSBzdHJpbmcuIEEgd2lsZGNhcmQgaW4gYVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcm9wZXJ0eSBjYXVzZXMgYW4gYXJyYXkgb2YgbWF0Y2hpbmcgcHJvcGVydGllcyB0byBiZSByZXR1cm5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gbG9vcCB0aHJvdWdoIGFsbCBwcm9wZXJ0aWVzIGFuZCBldmFsdWF0ZSB0b2tlbiBmb3IgZXZlcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJvcGVydHkgd2hlcmUgYHdpbGRDYXJkTWF0Y2hgIHJldHVybnMgdHJ1ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAod2lsZGNhcmRSZWdFeC50ZXN0KHdvcmRDb3B5KSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHByb3AgaW4gY29udGV4dFtpXSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdpbGRDYXJkTWF0Y2god29yZENvcHksIHByb3ApKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlSGVyZSl7IGNvbnRleHRbaV1bcHJvcF0gPSBuZXdWYWx1ZTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRbaV0ucHVzaChjb250ZXh0W2ldW3Byb3BdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7IHJldHVybiB1bmRlZmluZWQ7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gXCJjb250ZXh0XCIgbW9kaWZpZXIgKFwiQFwiIGJ5IGRlZmF1bHQpIHJlcGxhY2VzIGN1cnJlbnQgY29udGV4dCB3aXRoIGEgdmFsdWUgZnJvbVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGFyZ3VtZW50cy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyLm1vZHMuY29udGV4dCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VJbnQgPSB3b3JkQ29weSAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3NbcGxhY2VJbnRdID09PSBVTkRFRil7IHJldHVybiB1bmRlZmluZWQ7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3JjZSBhcmdzW3BsYWNlSW50XSB0byBTdHJpbmcsIHdvbid0IGF0d29yZENvcHl0IHRvIHByb2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhcmcgb2YgdHlwZSBmdW5jdGlvbiwgYXJyYXksIG9yIHBsYWluIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldCA9IGFyZ3NbcGxhY2VJbnRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVwZWF0IGJhc2ljIHN0cmluZyBwcm9wZXJ0eSBwcm9jZXNzaW5nIHdpdGggd29yZCBhbmQgbW9kaWZpZWQgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXh0W3dvcmRDb3B5XSAhPT0gVU5ERUYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlSGVyZSl7IGNvbnRleHRbd29yZENvcHldID0gbmV3VmFsdWU7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0ID0gY29udGV4dFt3b3JkQ29weV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBjb250ZXh0ID09PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldCA9IHdvcmRDb3B5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQbGFpbiBwcm9wZXJ0eSB0b2tlbnMgYXJlIGxpc3RlZCBhcyBzcGVjaWFsIHdvcmQgdG9rZW5zIHdoZW5ldmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYSB3aWxkY2FyZCBpcyBmb3VuZCB3aXRoaW4gdGhlIHByb3BlcnR5IHN0cmluZy4gQSB3aWxkY2FyZCBpbiBhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJvcGVydHkgY2F1c2VzIGFuIGFycmF5IG9mIG1hdGNoaW5nIHByb3BlcnRpZXMgdG8gYmUgcmV0dXJuZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gbG9vcCB0aHJvdWdoIGFsbCBwcm9wZXJ0aWVzIGFuZCBldmFsdWF0ZSB0b2tlbiBmb3IgZXZlcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcm9wZXJ0eSB3aGVyZSBgd2lsZENhcmRNYXRjaGAgcmV0dXJucyB0cnVlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHdpbGRjYXJkUmVnRXgudGVzdCh3b3JkQ29weSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChwcm9wIGluIGNvbnRleHQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdpbGRDYXJkTWF0Y2god29yZENvcHksIHByb3ApKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWVIZXJlKXsgY29udGV4dFtwcm9wXSA9IG5ld1ZhbHVlOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goY29udGV4dFtwcm9wXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7IHJldHVybiB1bmRlZmluZWQ7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBFdmFsIFByb3BlcnR5IHRva2VucyBvcGVyYXRlIG9uIGEgdGVtcG9yYXJ5IGNvbnRleHQgY3JlYXRlZCBieVxuICAgICAgICAgICAgICAgIC8vIHJlY3Vyc2l2ZWx5IGNhbGxpbmcgYHJlc29sdmVQYXRoYCB3aXRoIGEgY29weSBvZiB0aGUgdmFsdWVTdGFjay5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjdXJyLmV4ZWMgPT09ICRFVkFMUFJPUEVSVFkpe1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3Vyci5kb0VhY2gpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbnRleHQpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVhY2hMZW5ndGggPSBjb250ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlKGkgPCBlYWNoTGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3Vyci5zaW1wbGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWVIZXJlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRbaV1bX3RoaXMuZ2V0KGNvbnRleHRbaV0sIHt0OmN1cnIudCwgc2ltcGxlOnRydWV9KV0gPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChjb250ZXh0W2ldW190aGlzLmdldChjb250ZXh0W2ldLCB7dDpjdXJyLnQsIHNpbXBsZTp0cnVlfSldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZUhlcmUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dFtpXVtyZXNvbHZlUGF0aChjb250ZXh0W2ldLCBjdXJyLCBVTkRFRiwgYXJncywgdmFsdWVTdGFjayldID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goY29udGV4dFtpXVtyZXNvbHZlUGF0aChjb250ZXh0W2ldLCBjdXJyLCBVTkRFRiwgYXJncywgdmFsdWVTdGFjayldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnIuc2ltcGxlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWVIZXJlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dFtfdGhpcy5nZXQoY29udGV4dCwge3Q6IGN1cnIudCwgc2ltcGxlOnRydWV9KV0gPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0ID0gY29udGV4dFtfdGhpcy5nZXQoY29udGV4dCwge3Q6Y3Vyci50LCBzaW1wbGU6dHJ1ZX0pXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZUhlcmUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0W3Jlc29sdmVQYXRoKGNvbnRleHQsIGN1cnIsIFVOREVGLCBhcmdzLCB2YWx1ZVN0YWNrKV0gPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0ID0gY29udGV4dFtyZXNvbHZlUGF0aChjb250ZXh0LCBjdXJyLCBVTkRFRiwgYXJncywgdmFsdWVTdGFjayldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEZ1bmN0aW9ucyBhcmUgY2FsbGVkIHVzaW5nIGBjYWxsYCBvciBgYXBwbHlgLCBkZXBlbmRpbmcgb24gdGhlIHN0YXRlIG9mXG4gICAgICAgICAgICAgICAgLy8gdGhlIGFyZ3VtZW50cyB3aXRoaW4gdGhlICggKSBjb250YWluZXIuIEZ1bmN0aW9ucyBhcmUgZXhlY3V0ZWQgd2l0aCBcInRoaXNcIlxuICAgICAgICAgICAgICAgIC8vIHNldCB0byB0aGUgY29udGV4dCBpbW1lZGlhdGVseSBwcmlvciB0byB0aGUgZnVuY3Rpb24gaW4gdGhlIHN0YWNrLlxuICAgICAgICAgICAgICAgIC8vIEZvciBleGFtcGxlLCBcImEuYi5jLmZuKClcIiBpcyBlcXVpdmFsZW50IHRvIG9iai5hLmIuYy5mbi5jYWxsKG9iai5hLmIuYylcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjdXJyLmV4ZWMgPT09ICRDQUxMKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnIuZG9FYWNoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZVN0YWNrW3ZhbHVlU3RhY2tMZW5ndGggLSAyXSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWFjaExlbmd0aCA9IGNvbnRleHQubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUoaSA8IGVhY2hMZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGZ1bmN0aW9uIGNhbGwgaGFzIGFyZ3VtZW50cywgcHJvY2VzcyB0aG9zZSBhcmd1bWVudHMgYXMgYSBuZXcgcGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyLnQgJiYgY3Vyci50Lmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxBcmdzID0gcmVzb2x2ZVBhdGgoY29udGV4dCwgY3VyciwgVU5ERUYsIGFyZ3MsIHZhbHVlU3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbEFyZ3MgPT09IFVOREVGKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGNvbnRleHRbaV0uYXBwbHkodmFsdWVTdGFja1t2YWx1ZVN0YWNrTGVuZ3RoIC0gMl1baV0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KGNhbGxBcmdzKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChjb250ZXh0W2ldLmFwcGx5KHZhbHVlU3RhY2tbdmFsdWVTdGFja0xlbmd0aCAtIDJdW2ldLCBjYWxsQXJncykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goY29udGV4dFtpXS5jYWxsKHZhbHVlU3RhY2tbdmFsdWVTdGFja0xlbmd0aCAtIDJdW2ldLCBjYWxsQXJncykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChjb250ZXh0W2ldLmNhbGwodmFsdWVTdGFja1t2YWx1ZVN0YWNrTGVuZ3RoIC0gMl1baV0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgZnVuY3Rpb24gY2FsbCBoYXMgYXJndW1lbnRzLCBwcm9jZXNzIHRob3NlIGFyZ3VtZW50cyBhcyBhIG5ldyBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3Vyci50ICYmIGN1cnIudC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyLnNpbXBsZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxBcmdzID0gX3RoaXMuZ2V0KGNvbnRleHQsIGN1cnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbEFyZ3MgPSByZXNvbHZlUGF0aChjb250ZXh0LCBjdXJyLCBVTkRFRiwgYXJncywgdmFsdWVTdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsQXJncyA9PT0gVU5ERUYpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBjb250ZXh0LmFwcGx5KHZhbHVlU3RhY2tbdmFsdWVTdGFja0xlbmd0aCAtIDJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjYWxsQXJncykpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBjb250ZXh0LmFwcGx5KHZhbHVlU3RhY2tbdmFsdWVTdGFja0xlbmd0aCAtIDJdLCBjYWxsQXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBjb250ZXh0LmNhbGwodmFsdWVTdGFja1t2YWx1ZVN0YWNrTGVuZ3RoIC0gMl0sIGNhbGxBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBjb250ZXh0LmNhbGwodmFsdWVTdGFja1t2YWx1ZVN0YWNrTGVuZ3RoIC0gMl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQWRkIHRoZSByZXR1cm4gdmFsdWUgdG8gdGhlIHN0YWNrIGluIGNhc2Ugd2UgbXVzdCBsb29wIGFnYWluLlxuICAgICAgICAgICAgLy8gUmVjdXJzaXZlIGNhbGxzIHBhc3MgdGhlIHNhbWUgdmFsdWVTdGFjayBhcnJheSBhcm91bmQsIGJ1dCB3ZSBkb24ndCB3YW50IHRvXG4gICAgICAgICAgICAvLyBwdXNoIGVudHJpZXMgb24gdGhlIHN0YWNrIGluc2lkZSBhIHJlY3Vyc2lvbiwgc28gaW5zdGVhZCB1c2UgZml4ZWQgYXJyYXlcbiAgICAgICAgICAgIC8vIGluZGV4IHJlZmVyZW5jZXMgYmFzZWQgb24gd2hhdCAqKnRoaXMqKiBleGVjdXRpb24ga25vd3MgdGhlIHZhbHVlU3RhY2tMZW5ndGhcbiAgICAgICAgICAgIC8vIHNob3VsZCBiZS4gVGhhdCB3YXksIGlmIGEgcmVjdXJzaW9uIGFkZHMgbmV3IGVsZW1lbnRzLCBhbmQgdGhlbiB3ZSBiYWNrIG91dCxcbiAgICAgICAgICAgIC8vIHRoaXMgY29udGV4dCB3aWxsIHJlbWVtYmVyIHRoZSBvbGQgc3RhY2sgbGVuZ3RoIGFuZCB3aWxsIG1lcmVseSBvdmVyd3JpdGVcbiAgICAgICAgICAgIC8vIHRob3NlIGFkZGVkIGVudHJpZXMsIGlnbm9yaW5nIHRoYXQgdGhleSB3ZXJlIHRoZXJlIGluIHRoZSBmaXJzdCBwbGFjZS5cbiAgICAgICAgICAgIHZhbHVlU3RhY2tbdmFsdWVTdGFja0xlbmd0aCsrXSA9IHJldDtcbiAgICAgICAgICAgIGNvbnRleHQgPSByZXQ7XG4gICAgICAgICAgICBwcmV2ID0gcmV0O1xuICAgICAgICAgICAgaWR4Kys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNpbXBsaWZpZWQgcGF0aCBldmFsdWF0aW9uIGhlYXZpbHkgb3B0aW1pemVkIGZvciBwZXJmb3JtYW5jZSB3aGVuXG4gICAgICogcHJvY2Vzc2luZyBwYXRocyB3aXRoIG9ubHkgcHJvcGVydHkgbmFtZXMgb3IgaW5kaWNlcyBhbmQgc2VwYXJhdG9ycy5cbiAgICAgKiBJZiB0aGUgcGF0aCBjYW4gYmUgY29ycmVjdGx5IHByb2Nlc3NlZCB3aXRoIFwicGF0aC5zcGxpdChzZXBhcmF0b3IpXCIsXG4gICAgICogdGhpcyBmdW5jdGlvbiB3aWxsIGRvIHNvLiBBbnkgb3RoZXIgc3BlY2lhbCBjaGFyYWN0ZXJzIGZvdW5kIGluIHRoZVxuICAgICAqIHBhdGggd2lsbCBjYXVzZSB0aGUgcGF0aCB0byBiZSBldmFsdWF0ZWQgd2l0aCB0aGUgZnVsbCBgcmVzb2x2ZVBhdGhgXG4gICAgICogZnVuY3Rpb24gaW5zdGVhZC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSAge09iamVjdH0gb2JqICAgICAgICBUaGUgZGF0YSBvYmplY3QgdG8gYmUgcmVhZC93cml0dGVuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoICAgICAgIFRoZSBrZXlwYXRoIHdoaWNoIGByZXNvbHZlUGF0aGAgd2lsbCBldmFsdWF0ZSBhZ2FpbnN0IGBvYmpgLlxuICAgICAqIEBwYXJhbSAge0FueX0gbmV3VmFsdWUgICBUaGUgbmV3IHZhbHVlIHRvIHNldCBhdCB0aGUgcG9pbnQgZGVzY3JpYmVkIGJ5IGBwYXRoYC4gVW5kZWZpbmVkIGlmIHVzZWQgaW4gYGdldGAgc2NlbmFyaW8uXG4gICAgICogQHJldHVybiB7QW55fSAgICAgICAgICAgIEluIGBnZXRgLCByZXR1cm5zIHRoZSB2YWx1ZSBmb3VuZCBpbiBgb2JqYCBhdCBgcGF0aGAuIEluIGBzZXRgLCByZXR1cm5zIHRoZSBuZXcgdmFsdWUgdGhhdCB3YXMgc2V0IGluIGBvYmpgLiBJZiBgZ2V0YCBvciBgc2V0YCBhcmUgbnRvIHN1Y2Nlc3NmdWwsIHJldHVybnMgYHVuZGVmaW5lZGBcbiAgICAgKi9cbiAgICB2YXIgcXVpY2tSZXNvbHZlU3RyaW5nID0gZnVuY3Rpb24ob2JqLCBwYXRoLCBuZXdWYWx1ZSl7XG4gICAgICAgIHZhciBjaGFuZ2UgPSBuZXdWYWx1ZSAhPT0gVU5ERUYsXG4gICAgICAgICAgICB0ayA9IFtdLFxuICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICB0a0xlbmd0aCA9IDA7XG5cbiAgICAgICAgdGsgPSBwYXRoLnNwbGl0KHByb3BlcnR5U2VwYXJhdG9yKTtcbiAgICAgICAgb3B0LnVzZUNhY2hlICYmIChjYWNoZVtwYXRoXSA9IHt0OiB0aywgc2ltcGxlOiB0cnVlfSk7XG4gICAgICAgIHRrTGVuZ3RoID0gdGsubGVuZ3RoO1xuICAgICAgICB3aGlsZSAob2JqICE9PSBVTkRFRiAmJiBpIDwgdGtMZW5ndGgpe1xuICAgICAgICAgICAgaWYgKHRrW2ldID09PSAnJyl7IHJldHVybiB1bmRlZmluZWQ7IH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoYW5nZSl7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IHRrTGVuZ3RoIC0gMSl7XG4gICAgICAgICAgICAgICAgICAgIG9ialt0a1tpXV0gPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRm9yIGFycmF5cywgdGVzdCBjdXJyZW50IGNvbnRleHQgYWdhaW5zdCB1bmRlZmluZWQgdG8gYXZvaWQgcGFyc2luZyB0aGlzIHNlZ21lbnQgYXMgYSBudW1iZXIuXG4gICAgICAgICAgICAgICAgLy8gRm9yIGFueXRoaW5nIGVsc2UsIHVzZSBoYXNPd25Qcm9wZXJ0eS5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvcHQuZm9yY2UgJiYgdHlwZW9mIG9ialt0a1tpXV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialt0a1tpXV0gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYmogPSBvYmpbdGtbaSsrXV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2ltcGxpZmllZCBwYXRoIGV2YWx1YXRpb24gaGVhdmlseSBvcHRpbWl6ZWQgZm9yIHBlcmZvcm1hbmNlIHdoZW5cbiAgICAgKiBwcm9jZXNzaW5nIGFycmF5IG9mIHNpbXBsZSBwYXRoIHRva2VucyAocGxhaW4gcHJvcGVydHkgbmFtZXMpLlxuICAgICAqIFRoaXMgZnVuY3Rpb24gaXMgZXNzZW50aWFsbHkgdGhlIHNhbWUgYXMgYHF1aWNrUmVzb2x2ZVN0cmluZ2AgZXhjZXB0XG4gICAgICogYHF1aWNrUmVzb2x2ZVRva2VuQXJyYXlgIGRvZXMgbnRvIG5lZWQgdG8gZXhlY3V0ZSBwYXRoLnNwbGl0LlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBvYmogICAgICAgIFRoZSBkYXRhIG9iamVjdCB0byBiZSByZWFkL3dyaXR0ZW5cbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gdGsgICAgICAgVGhlIHRva2VuIGFycmF5IHdoaWNoIGByZXNvbHZlUGF0aGAgd2lsbCBldmFsdWF0ZSBhZ2FpbnN0IGBvYmpgLlxuICAgICAqIEBwYXJhbSAge0FueX0gbmV3VmFsdWUgICBUaGUgbmV3IHZhbHVlIHRvIHNldCBhdCB0aGUgcG9pbnQgZGVzY3JpYmVkIGJ5IGBwYXRoYC4gVW5kZWZpbmVkIGlmIHVzZWQgaW4gYGdldGAgc2NlbmFyaW8uXG4gICAgICogQHJldHVybiB7QW55fSAgICAgICAgICAgIEluIGBnZXRgLCByZXR1cm5zIHRoZSB2YWx1ZSBmb3VuZCBpbiBgb2JqYCBhdCBgcGF0aGAuIEluIGBzZXRgLCByZXR1cm5zIHRoZSBuZXcgdmFsdWUgdGhhdCB3YXMgc2V0IGluIGBvYmpgLiBJZiBgZ2V0YCBvciBgc2V0YCBhcmUgbnRvIHN1Y2Nlc3NmdWwsIHJldHVybnMgYHVuZGVmaW5lZGBcbiAgICAgKi9cbiAgICB2YXIgcXVpY2tSZXNvbHZlVG9rZW5BcnJheSA9IGZ1bmN0aW9uKG9iaiwgdGssIG5ld1ZhbHVlKXtcbiAgICAgICAgdmFyIGNoYW5nZSA9IG5ld1ZhbHVlICE9PSBVTkRFRixcbiAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgdGtMZW5ndGggPSB0ay5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKG9iaiAhPSBudWxsICYmIGkgPCB0a0xlbmd0aCl7XG4gICAgICAgICAgICBpZiAodGtbaV0gPT09ICcnKXsgcmV0dXJuIHVuZGVmaW5lZDsgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hhbmdlKXtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gdGtMZW5ndGggLSAxKXtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3RrW2ldXSA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBGb3IgYXJyYXlzLCB0ZXN0IGN1cnJlbnQgY29udGV4dCBhZ2FpbnN0IHVuZGVmaW5lZCB0byBhdm9pZCBwYXJzaW5nIHRoaXMgc2VnbWVudCBhcyBhIG51bWJlci5cbiAgICAgICAgICAgICAgICAvLyBGb3IgYW55dGhpbmcgZWxzZSwgdXNlIGhhc093blByb3BlcnR5LlxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9wdC5mb3JjZSAmJiB0eXBlb2Ygb2JqW3RrW2ldXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3RrW2ldXSA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9iaiA9IG9ialt0a1tpKytdXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZWFyY2hlcyBhbiBvYmplY3Qgb3IgYXJyYXkgZm9yIGEgdmFsdWUsIGFjY3VtdWxhdGluZyB0aGUga2V5cGF0aCB0byB0aGUgdmFsdWUgYWxvbmdcbiAgICAgKiB0aGUgd2F5LiBPcGVyYXRlcyBpbiBhIHJlY3Vyc2l2ZSB3YXkgdW50aWwgZWl0aGVyIGFsbCBrZXlzL2luZGljZXMgaGF2ZSBiZWVuXG4gICAgICogZXhoYXVzdGVkIG9yIGEgbWF0Y2ggaXMgZm91bmQuIFJldHVybiB2YWx1ZSBcInRydWVcIiBtZWFucyBcImtlZXAgc2Nhbm5pbmdcIiwgXCJmYWxzZVwiXG4gICAgICogbWVhbnMgXCJzdG9wIG5vd1wiLiBJZiBhIG1hdGNoIGlzIGZvdW5kLCBpbnN0ZWFkIG9mIHJldHVybmluZyBhIHNpbXBsZSBcImZhbHNlXCIsIGFcbiAgICAgKiBjYWxsYmFjayBmdW5jdGlvbiAoc2F2ZVBhdGgpIGlzIGNhbGxlZCB3aGljaCB3aWxsIGRlY2lkZSB3aGV0aGVyIG9yIG5vdCB0byBjb250aW51ZVxuICAgICAqIHRoZSBzY2FuLiBUaGlzIGFsbG93cyB0aGUgZnVuY3Rpb24gdG8gZmluZCBvbmUgaW5zdGFuY2Ugb2YgdmFsdWUgb3IgYWxsIGluc3RhbmNlcyxcbiAgICAgKiBiYXNlZCBvbiBsb2dpYyBpbiB0aGUgY2FsbGJhY2suXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqICAgIFRoZSBkYXRhIG9iamVjdCB0byBzY2FuXG4gICAgICogQHBhcmFtIHtBbnl9IHZhbCBUaGUgdmFsdWUgd2UgYXJlIGxvb2tpbmcgZm9yIHdpdGhpbiBgb2JqYFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHNhdmVQYXRoIENhbGxiYWNrIGZ1bmN0aW9uIHdoaWNoIHdpbGwgc3RvcmUgYWNjdW11bGF0ZWQgcGF0aHMgYW5kIGluZGljYXRlIHdoZXRoZXIgdG8gY29udGludWVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBBY2N1bXVsYXRlZCBrZXlwYXRoOyB1bmRlZmluZWQgYXQgZmlyc3QsIHBvcHVsYXRlZCBpbiByZWN1cnNpdmUgY2FsbHNcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBJbmRpY2F0ZXMgd2hldGhlciBzY2FuIHByb2Nlc3Mgc2hvdWxkIGNvbnRpbnVlIChcInRydWVcIi0+eWVzLCBcImZhbHNlXCItPm5vKVxuICAgICAqL1xuICAgIHZhciBzY2FuRm9yVmFsdWUgPSBmdW5jdGlvbihvYmosIHZhbCwgc2F2ZVBhdGgsIHBhdGgpe1xuICAgICAgICB2YXIgaSwgbGVuLCBtb3JlLCBrZXlzLCBwcm9wO1xuXG4gICAgICAgIHBhdGggPSBwYXRoID8gcGF0aCA6ICcnO1xuXG4gICAgICAgIC8vIElmIHdlIGZvdW5kIHRoZSB2YWx1ZSB3ZSdyZSBsb29raW5nIGZvclxuICAgICAgICBpZiAob2JqID09PSB2YWwpe1xuICAgICAgICAgICAgcmV0dXJuIHNhdmVQYXRoKHBhdGgpOyAvLyBTYXZlIHRoZSBhY2N1bXVsYXRlZCBwYXRoLCBhc2sgd2hldGhlciB0byBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIC8vIFRoaXMgb2JqZWN0IGlzIGFuIGFycmF5LCBzbyBleGFtaW5lIGVhY2ggaW5kZXggc2VwYXJhdGVseVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9iaikpe1xuICAgICAgICAgICAgbGVuID0gb2JqLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpID0gMDsgaSA8IGxlbjsgaSsrKXtcbiAgICAgICAgICAgICAgICAvLyBDYWxsIGBzY2FuRm9yVmFsdWVgIHJlY3Vyc2l2ZWx5XG4gICAgICAgICAgICAgICAgbW9yZSA9IHNjYW5Gb3JWYWx1ZShvYmpbaV0sIHZhbCwgc2F2ZVBhdGgsIHBhdGggKyBwcm9wZXJ0eVNlcGFyYXRvciArIGkpO1xuICAgICAgICAgICAgICAgIC8vIEhhbHQgaWYgdGhhdCByZWN1cnNpdmUgY2FsbCByZXR1cm5lZCBcImZhbHNlXCJcbiAgICAgICAgICAgICAgICBpZiAoIW1vcmUpeyByZXR1cm47IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBrZWVwIGxvb2tpbmdcbiAgICAgICAgfVxuICAgICAgICAvLyBUaGlzIG9iamVjdCBpcyBhbiBvYmplY3QsIHNvIGV4YW1pbmUgZWFjaCBsb2NhbCBwcm9wZXJ0eSBzZXBhcmF0ZWx5XG4gICAgICAgIGVsc2UgaWYgKGlzT2JqZWN0KG9iaikpIHtcbiAgICAgICAgICAgIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgICAgICAgICAgbGVuID0ga2V5cy5sZW5ndGg7XG4gICAgICAgICAgICBpZiAobGVuID4gMSl7IGtleXMgPSBrZXlzLnNvcnQoKTsgfSAvLyBGb3JjZSBvcmRlciBvZiBvYmplY3Qga2V5cyB0byBwcm9kdWNlIHJlcGVhdGFibGUgcmVzdWx0c1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKXtcbiAgICAgICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleXNbaV0pKXtcbiAgICAgICAgICAgICAgICAgICAgcHJvcCA9IGtleXNbaV07XG4gICAgICAgICAgICAgICAgICAgIC8vIFByb3BlcnR5IG1heSBpbmNsdWRlIHRoZSBzZXBhcmF0b3IgY2hhcmFjdGVyIG9yIHNvbWUgb3RoZXIgc3BlY2lhbCBjaGFyYWN0ZXIsXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvIHF1b3RlIHRoaXMgcGF0aCBzZWdtZW50IGFuZCBlc2NhcGUgYW55IHNlcGFyYXRvcnMgd2l0aGluLlxuICAgICAgICAgICAgICAgICAgICBpZiAoYWxsU3BlY2lhbHNSZWdFeC50ZXN0KHByb3ApKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3AgPSBxdW90ZVN0cmluZyhzaW5nbGVxdW90ZSwgcHJvcCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbW9yZSA9IHNjYW5Gb3JWYWx1ZShvYmpba2V5c1tpXV0sIHZhbCwgc2F2ZVBhdGgsIHBhdGggKyBwcm9wZXJ0eVNlcGFyYXRvciArIHByb3ApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW1vcmUpeyByZXR1cm47IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8ga2VlcCBsb29raW5nXG4gICAgICAgIH1cbiAgICAgICAgLy8gTGVhZiBub2RlIChzdHJpbmcsIG51bWJlciwgY2hhcmFjdGVyLCBib29sZWFuLCBldGMuKSwgYnV0IGRpZG4ndCBtYXRjaFxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8ga2VlcCBsb29raW5nXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdldCB0b2tlbml6ZWQgcmVwcmVzZW50YXRpb24gb2Ygc3RyaW5nIGtleXBhdGguXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIEtleXBhdGhcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IE9iamVjdCBpbmNsdWRpbmcgdGhlIGFycmF5IG9mIHBhdGggdG9rZW5zIGFuZCBhIGJvb2xlYW4gaW5kaWNhdGluZyBcInNpbXBsZVwiLiBTaW1wbGUgdG9rZW4gc2V0cyBoYXZlIG5vIHNwZWNpYWwgb3BlcmF0b3JzIG9yIG5lc3RlZCB0b2tlbnMsIG9ubHkgYSBwbGFpbiBhcnJheSBvZiBzdHJpbmdzIGZvciBmYXN0IGV2YWx1YXRpb24uXG4gICAgICovXG4gICAgX3RoaXMuZ2V0VG9rZW5zID0gZnVuY3Rpb24ocGF0aCl7XG4gICAgICAgIHZhciB0b2tlbnMgPSB0b2tlbml6ZShwYXRoKTtcbiAgICAgICAgaWYgKHR5cGVvZiB0b2tlbnMgPT09ICRVTkRFRklORUQpeyByZXR1cm4gdW5kZWZpbmVkOyB9XG4gICAgICAgIHJldHVybiB0b2tlbnM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEluZm9ybXMgd2hldGhlciB0aGUgc3RyaW5nIHBhdGggaGFzIHZhbGlkIHN5bnRheC4gVGhlIHBhdGggaXMgTk9UIGV2YWx1YXRlZCBhZ2FpbnN0IGFcbiAgICAgKiBkYXRhIG9iamVjdCwgb25seSB0aGUgc3ludGF4IGlzIGNoZWNrZWQuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIEtleXBhdGhcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSB2YWxpZCBzeW50YXggLT4gXCJ0cnVlXCI7IG5vdCB2YWxpZCAtPiBcImZhbHNlXCJcbiAgICAgKi9cbiAgICBfdGhpcy5pc1ZhbGlkID0gZnVuY3Rpb24ocGF0aCl7XG4gICAgICAgIHJldHVybiB0eXBlb2YgdG9rZW5pemUocGF0aCkgIT09ICRVTkRFRklORUQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEVzY2FwZXMgYW55IHNwZWNpYWwgY2hhcmFjdGVycyBmb3VuZCBpbiB0aGUgaW5wdXQgc3RyaW5nIHVzaW5nIGJhY2tzbGFzaCwgcHJldmVudGluZ1xuICAgICAqIHRoZXNlIGNoYXJhY3RlcnMgZnJvbSBjYXVzaW5nIHVuaW50ZW5kZWQgcHJvY2Vzc2luZyBieSBQYXRoVG9vbGtpdC4gVGhpcyBmdW5jdGlvblxuICAgICAqIERPRVMgcmVzcGVjdCB0aGUgY3VycmVudCBjb25maWd1cmVkIHN5bnRheCwgZXZlbiBpZiBpdCBoYXMgYmVlbiBhbHRlcmVkIGZyb20gdGhlIGRlZmF1bHQuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzZWdtZW50IFNlZ21lbnQgb2YgYSBrZXlwYXRoXG4gICAgICogQHJldHVybiB7U3RyaW5nfSBUaGUgb3JpZ2luYWwgc2VnbWVudCBzdHJpbmcgd2l0aCBhbGwgUGF0aFRvb2xraXQgc3BlY2lhbCBjaGFyYWN0ZXJzIHByZXBlbmRlZCB3aXRoIFwiXFxcIlxuICAgICAqL1xuICAgIF90aGlzLmVzY2FwZSA9IGZ1bmN0aW9uKHNlZ21lbnQpe1xuICAgICAgICByZXR1cm4gc2VnbWVudC5yZXBsYWNlKGFsbFNwZWNpYWxzUmVnRXgsICdcXFxcJCYnKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRXZhbHVhdGVzIGtleXBhdGggaW4gb2JqZWN0IGFuZCByZXR1cm5zIHRoZSB2YWx1ZSBmb3VuZCB0aGVyZSwgaWYgYXZhaWxhYmxlLiBJZiB0aGUgcGF0aFxuICAgICAqIGRvZXMgbm90IGV4aXN0IGluIHRoZSBwcm92aWRlZCBkYXRhIG9iamVjdCwgcmV0dXJucyBgdW5kZWZpbmVkYC4gRm9yIFwic2ltcGxlXCIgcGF0aHMsIHdoaWNoXG4gICAgICogZG9uJ3QgaW5jbHVkZSBhbnkgb3BlcmF0aW9ucyBiZXlvbmQgcHJvcGVydHkgc2VwYXJhdG9ycywgb3B0aW1pemVkIHJlc29sdmVycyB3aWxsIGJlIHVzZWRcbiAgICAgKiB3aGljaCBhcmUgbW9yZSBsaWdodHdlaWdodCB0aGFuIHRoZSBmdWxsLWZlYXR1cmVkIGByZXNvbHZlUGF0aGAuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7QW55fSBvYmogU291cmNlIGRhdGEgb2JqZWN0XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggS2V5cGF0aCB0byBldmFsdWF0ZSB3aXRoaW4gXCJvYmpcIi4gQWxzbyBhY2NlcHRzIHRva2VuIGFycmF5IGluIHBsYWNlIG9mIGEgc3RyaW5nIHBhdGguXG4gICAgICogQHJldHVybiB7QW55fSBJZiB0aGUga2V5cGF0aCBleGlzdHMgaW4gXCJvYmpcIiwgcmV0dXJuIHRoZSB2YWx1ZSBhdCB0aGF0IGxvY2F0aW9uOyBJZiBub3QsIHJldHVybiBgdW5kZWZpbmVkYC5cbiAgICAgKi9cbiAgICBfdGhpcy5nZXQgPSBmdW5jdGlvbiAob2JqLCBwYXRoKXtcbiAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aCxcbiAgICAgICAgICAgIGFyZ3M7XG4gICAgICAgIC8vIEZvciBzdHJpbmcgcGF0aHMsIGZpcnN0IHNlZSBpZiBwYXRoIGhhcyBhbHJlYWR5IGJlZW4gY2FjaGVkIGFuZCBpZiB0aGUgdG9rZW4gc2V0IGlzIHNpbXBsZS4gSWZcbiAgICAgICAgLy8gc28sIHdlIGNhbiB1c2UgdGhlIG9wdGltaXplZCB0b2tlbiBhcnJheSByZXNvbHZlciB1c2luZyB0aGUgY2FjaGVkIHRva2VuIHNldC5cbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gY2FjaGVkIGVudHJ5LCB1c2UgUmVnRXggdG8gbG9vayBmb3Igc3BlY2lhbCBjaGFyYWN0ZXJzIGFwYXJ0IGZyb20gdGhlIHNlcGFyYXRvci5cbiAgICAgICAgLy8gSWYgbm9uZSBhcmUgZm91bmQsIHdlIGNhbiB1c2UgdGhlIG9wdGltaXplZCBzdHJpbmcgcmVzb2x2ZXIuXG4gICAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJFNUUklORyl7XG4gICAgICAgICAgICBpZiAob3B0LnVzZUNhY2hlICYmIGNhY2hlW3BhdGhdICYmIGNhY2hlW3BhdGhdLnNpbXBsZSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHF1aWNrUmVzb2x2ZVRva2VuQXJyYXkob2JqLCBjYWNoZVtwYXRoXS50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFzaW1wbGVQYXRoUmVnRXgudGVzdChwYXRoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHF1aWNrUmVzb2x2ZVN0cmluZyhvYmosIHBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEZvciBhcnJheSBwYXRocyAocHJlLWNvbXBpbGVkIHRva2VuIHNldHMpLCBjaGVjayBmb3Igc2ltcGxpY2l0eSBzbyB3ZSBjYW4gdXNlIHRoZSBvcHRpbWl6ZWQgcmVzb2x2ZXIuXG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocGF0aC50KSAmJiBwYXRoLnNpbXBsZSl7XG4gICAgICAgICAgICByZXR1cm4gcXVpY2tSZXNvbHZlVG9rZW5BcnJheShvYmosIHBhdGgudCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIElmIHdlIG1hZGUgaXQgdGhpcyBmYXIsIHRoZSBwYXRoIGlzIGNvbXBsZXggYW5kIG1heSBpbmNsdWRlIHBsYWNlaG9sZGVycy4gR2F0aGVyIHVwIGFueVxuICAgICAgICAvLyBleHRyYSBhcmd1bWVudHMgYW5kIGNhbGwgdGhlIGZ1bGwgYHJlc29sdmVQYXRoYCBmdW5jdGlvbi5cbiAgICAgICAgYXJncyA9IFtdO1xuICAgICAgICBpZiAobGVuID4gMil7XG4gICAgICAgICAgICBmb3IgKGkgPSAyOyBpIDwgbGVuOyBpKyspIHsgYXJnc1tpLTJdID0gYXJndW1lbnRzW2ldOyB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc29sdmVQYXRoKG9iaiwgcGF0aCwgdW5kZWZpbmVkLCBhcmdzKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRXZhbHVhdGVzIGEga2V5cGF0aCBpbiBvYmplY3QgYW5kIHNldHMgYSBuZXcgdmFsdWUgYXQgdGhlIHBvaW50IGRlc2NyaWJlZCBpbiB0aGUga2V5cGF0aC4gSWZcbiAgICAgKiBcImZvcmNlXCIgaXMgZGlzYWJsZWQsIHRoZSBmdWxsIHBhdGggbXVzdCBleGlzdCB1cCB0byB0aGUgZmluYWwgcHJvcGVydHksIHdoaWNoIG1heSBiZSBjcmVhdGVkXG4gICAgICogYnkgdGhlIHNldCBvcGVyYXRpb24uIElmIFwiZm9yY2VcIiBpcyBlbmFibGVkLCBhbnkgbWlzc2luZyBpbnRlcm1lZGlhdGUgcHJvcGVydGllcyB3aWxsIGJlIGNyZWF0ZWRcbiAgICAgKiBpbiBvcmRlciB0byBzZXQgdGhlIHZhbHVlIG9uIHRoZSBmaW5hbCBwcm9wZXJ0eS4gSWYgYHNldGAgc3VjY2VlZHMsIHJldHVybnMgXCJ0cnVlXCIsIG90aGVyd2lzZSBcImZhbHNlXCIuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7QW55fSBvYmogU291cmNlIGRhdGEgb2JqZWN0XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggS2V5cGF0aCB0byBldmFsdWF0ZSB3aXRoaW4gXCJvYmpcIi4gQWxzbyBhY2NlcHRzIHRva2VuIGFycmF5IGluIHBsYWNlIG9mIGEgc3RyaW5nIHBhdGguXG4gICAgICogQHBhcmFtIHtBbnl9IHZhbCBOZXcgdmFsdWUgdG8gc2V0IGF0IHRoZSBsb2NhdGlvbiBkZXNjcmliZWQgaW4gXCJwYXRoXCJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBcInRydWVcIiBpZiB0aGUgc2V0IG9wZXJhdGlvbiBzdWNjZWVkczsgXCJmYWxzZVwiIGlmIGl0IGRvZXMgbm90IHN1Y2NlZWRcbiAgICAgKi9cbiAgICBfdGhpcy5zZXQgPSBmdW5jdGlvbihvYmosIHBhdGgsIHZhbCl7XG4gICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGgsXG4gICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgcmVmLFxuICAgICAgICAgICAgZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgIC8vIFBhdGggcmVzb2x1dGlvbiBmb2xsb3dzIHRoZSBzYW1lIGxvZ2ljIGFzIGBnZXRgIGFib3ZlLCB3aXRoIG9uZSBkaWZmZXJlbmNlOiBgZ2V0YCB3aWxsXG4gICAgICAgIC8vIGFib3J0IGJ5IHJldHVybmluZyB0aGUgdmFsdWUgYXMgc29vbiBhcyBpdCdzIGZvdW5kLiBgc2V0YCBkb2VzIG5vdCBhYm9ydCBzbyB0aGUgaWYtZWxzZVxuICAgICAgICAvLyBzdHJ1Y3R1cmUgaXMgc2xpZ2h0bHkgZGlmZmVyZW50IHRvIGRpY3RhdGUgd2hlbi9pZiB0aGUgZmluYWwgY2FzZSBzaG91bGQgZXhlY3V0ZS5cbiAgICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAkU1RSSU5HKXtcbiAgICAgICAgICAgIGlmIChvcHQudXNlQ2FjaGUgJiYgY2FjaGVbcGF0aF0gJiYgY2FjaGVbcGF0aF0uc2ltcGxlKXtcbiAgICAgICAgICAgICAgICByZWYgPSBxdWlja1Jlc29sdmVUb2tlbkFycmF5KG9iaiwgY2FjaGVbcGF0aF0udCwgdmFsKTtcbiAgICAgICAgICAgICAgICBkb25lIHw9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghc2ltcGxlUGF0aFJlZ0V4LnRlc3QocGF0aCkpe1xuICAgICAgICAgICAgICAgIHJlZiA9IHF1aWNrUmVzb2x2ZVN0cmluZyhvYmosIHBhdGgsIHZhbCk7XG4gICAgICAgICAgICAgICAgZG9uZSB8PSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocGF0aC50KSAmJiBwYXRoLnNpbXBsZSl7XG4gICAgICAgICAgICByZWYgPSBxdWlja1Jlc29sdmVUb2tlbkFycmF5KG9iaiwgcGF0aC50LCB2YWwpO1xuICAgICAgICAgICAgZG9uZSB8PSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBQYXRoIHdhcyAocHJvYmFibHkpIGEgc3RyaW5nIGFuZCBpdCBjb250YWluZWQgY29tcGxleCBwYXRoIGNoYXJhY3RlcnNcbiAgICAgICAgaWYgKCFkb25lKSB7XG4gICAgICAgICAgICBpZiAobGVuID4gMyl7XG4gICAgICAgICAgICAgICAgYXJncyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDM7IGkgPCBsZW47IGkrKykgeyBhcmdzW2ktM10gPSBhcmd1bWVudHNbaV07IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlZiA9IHJlc29sdmVQYXRoKG9iaiwgcGF0aCwgdmFsLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gYHNldGAgY2FuIHNldCBhIG5ldyB2YWx1ZSBpbiBtdWx0aXBsZSBwbGFjZXMgaWYgdGhlIGZpbmFsIHBhdGggc2VnbWVudCBpcyBhbiBhcnJheS5cbiAgICAgICAgLy8gSWYgYW55IG9mIHRob3NlIHZhbHVlIGFzc2lnbm1lbnRzIGZhaWwsIGBzZXRgIHdpbGwgcmV0dXJuIFwiZmFsc2VcIiBpbmRpY2F0aW5nIGZhaWx1cmUuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlZikpe1xuICAgICAgICAgICAgcmV0dXJuIHJlZi5pbmRleE9mKHVuZGVmaW5lZCkgPT09IC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWYgIT09IFVOREVGO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBMb2NhdGUgYSB2YWx1ZSB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LiBUaGlzIGlzIHRoZSBwdWJsaWNseSBleHBvc2VkIGludGVyZmFjZSB0byB0aGVcbiAgICAgKiBwcml2YXRlIGBzY2FuRm9yVmFsdWVgIGZ1bmN0aW9uIGRlZmluZWQgYWJvdmUuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7QW55fSBvYmogU291cmNlIGRhdGEgb2JqZWN0XG4gICAgICogQHBhcmFtIHtBbnl9IHZhbCBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvciB3aXRoaW4gXCJvYmpcIlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvbmVPck1hbnkgT3B0aW9uYWw7IElmIG1pc3Npbmcgb3IgXCJvbmVcIiwgYGZpbmRgIHdpbGwgb25seSByZXR1cm4gdGhlIGZpcnN0IHZhbGlkIHBhdGguIElmIFwib25Pck1hbnlcIiBpcyBhbnkgb3RoZXIgc3RyaW5nLCBgZmluZGAgd2lsbCBzY2FuIHRoZSBmdWxsIG9iamVjdCBsb29raW5nIGZvciBhbGwgdmFsaWQgcGF0aHMgdG8gYWxsIGNhc2VzIHdoZXJlIFwidmFsXCIgYXBwZWFycy5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gQXJyYXkgb2Yga2V5cGF0aHMgdG8gXCJ2YWxcIiBvciBgdW5kZWZpbmVkYCBpZiBcInZhbFwiIGlzIG5vdCBmb3VuZC5cbiAgICAgKi9cbiAgICBfdGhpcy5maW5kID0gZnVuY3Rpb24ob2JqLCB2YWwsIG9uZU9yTWFueSl7XG4gICAgICAgIHZhciByZXRWYWwgPSBbXTtcbiAgICAgICAgLy8gc2F2ZVBhdGggaXMgdGhlIGNhbGxiYWNrIHdoaWNoIHdpbGwgYWNjdW11bGF0ZSBhbnkgZm91bmQgcGF0aHMgaW4gYSBsb2NhbCBhcnJheVxuICAgICAgICAvLyB2YXJpYWJsZS5cbiAgICAgICAgdmFyIHNhdmVQYXRoID0gZnVuY3Rpb24ocGF0aCl7XG4gICAgICAgICAgICByZXRWYWwucHVzaChwYXRoLnN1YnN0cigxKSk7XG4gICAgICAgICAgICBpZighb25lT3JNYW55IHx8IG9uZU9yTWFueSA9PT0gJ29uZScpe1xuICAgICAgICAgICAgICAgIHJldFZhbCA9IHJldFZhbFswXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgc2NhbkZvclZhbHVlKG9iaiwgdmFsLCBzYXZlUGF0aCk7XG4gICAgICAgIHJldHVybiByZXRWYWxbMF0gPyByZXRWYWwgOiB1bmRlZmluZWQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZvciBhIGdpdmVuIHNwZWNpYWwgY2hhcmFjdGVyIGdyb3VwIChlLmcuLCBzZXBhcmF0b3JzKSBhbmQgY2hhcmFjdGVyIHR5cGUgKGUuZy4sIFwicHJvcGVydHlcIiksXG4gICAgICogcmVwbGFjZSBhbiBleGlzdGluZyBzZXBhcmF0b3Igd2l0aCBhIG5ldyBjaGFyYWN0ZXIuIFRoaXMgY3JlYXRlcyBhIG5ldyBzcGVjaWFsIGNoYXJhY3RlciBmb3JcbiAgICAgKiB0aGF0IHB1cnBvc2UgYW53aXRoaW4gdGhlIGNoYXJhY3RlciBncm91cCBhbmQgcmVtb3ZlcyB0aGUgb2xkIG9uZS4gQWxzbyB0YWtlcyBhIFwiY2xvc2VyXCIgYXJndW1lbnRcbiAgICAgKiBmb3IgY2FzZXMgd2hlcmUgdGhlIHNwZWNpYWwgY2hhcmFjdGVyIGlzIGEgY29udGFpbmVyIHNldC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25Hcm91cCBSZWZlcmVuY2UgdG8gY3VycmVudCBjb25maWd1cmF0aW9uIGZvciBhIGNlcnRhaW4gdHlwZSBvZiBzcGVjaWFsIGNoYXJhY3RlcnNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY2hhclR5cGUgVGhlIHR5cGUgb2Ygc3BlY2lhbCBjaGFyYWN0ZXIgdG8gYmUgcmVwbGFjZWRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsIE5ldyBzcGVjaWFsIGNoYXJhY3RlciBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY2xvc2VyIE9wdGlvbmFsOyBOZXcgc3BlY2lhbCBjaGFyYWN0ZXIgY2xvc2VyIHN0cmluZywgb25seSB1c2VkIGZvciBcImNvbnRhaW5lcnNcIiBncm91cFxuICAgICAqL1xuICAgIHZhciB1cGRhdGVPcHRpb25DaGFyID0gZnVuY3Rpb24ob3B0aW9uR3JvdXAsIGNoYXJUeXBlLCB2YWwsIGNsb3Nlcil7XG4gICAgICAgIHZhciBvbGRWYWwgPSAnJztcbiAgICAgICAgT2JqZWN0LmtleXMob3B0aW9uR3JvdXApLmZvckVhY2goZnVuY3Rpb24oc3RyKXsgaWYgKG9wdGlvbkdyb3VwW3N0cl0uZXhlYyA9PT0gY2hhclR5cGUpeyBvbGRWYWwgPSBzdHI7IH0gfSk7XG5cbiAgICAgICAgZGVsZXRlIG9wdGlvbkdyb3VwW29sZFZhbF07XG4gICAgICAgIG9wdGlvbkdyb3VwW3ZhbF0gPSB7ZXhlYzogY2hhclR5cGV9O1xuICAgICAgICBpZiAoY2xvc2VyKXsgb3B0aW9uR3JvdXBbdmFsXS5jbG9zZXIgPSBjbG9zZXI7IH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyBcInNpbXBsZVwiIHN5bnRheCBpbiBzcGVjaWFsIGNoYXJhY3RlciBncm91cHMuIFRoaXMgc3ludGF4IG9ubHkgc3VwcG9ydHMgYSBzZXBhcmF0b3JcbiAgICAgKiBjaGFyYWN0ZXIgYW5kIG5vIG90aGVyIG9wZXJhdG9ycy4gQSBjdXN0b20gc2VwYXJhdG9yIG1heSBiZSBwcm92aWRlZCBhcyBhbiBhcmd1bWVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzZXAgT3B0aW9uYWw7IFNlcGFyYXRvciBzdHJpbmcuIElmIG1pc3NpbmcsIHRoZSBkZWZhdWx0IHNlcGFyYXRvciAoXCIuXCIpIGlzIHVzZWQuXG4gICAgICovXG4gICAgdmFyIHNldFNpbXBsZU9wdGlvbnMgPSBmdW5jdGlvbihzZXApe1xuICAgICAgICB2YXIgc2VwT3B0cyA9IHt9O1xuICAgICAgICBpZiAoISh0eXBlb2Ygc2VwID09PSAkU1RSSU5HICYmIHNlcC5sZW5ndGggPT09IDEpKXtcbiAgICAgICAgICAgIHNlcCA9ICcuJztcbiAgICAgICAgfVxuICAgICAgICBzZXBPcHRzW3NlcF0gPSB7ZXhlYzogJFBST1BFUlRZfTtcbiAgICAgICAgb3B0LnByZWZpeGVzID0ge307XG4gICAgICAgIG9wdC5jb250YWluZXJzID0ge307XG4gICAgICAgIG9wdC5zZXBhcmF0b3JzID0gc2VwT3B0cztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWx0ZXIgUGF0aFRvb2xraXQgY29uZmlndXJhdGlvbi4gVGFrZXMgYW4gb3B0aW9ucyBoYXNoIHdoaWNoIG1heSBpbmNsdWRlXG4gICAgICogbXVsdGlwbGUgc2V0dGluZ3MgdG8gY2hhbmdlIGF0IG9uY2UuIElmIHRoZSBwYXRoIHN5bnRheCBpcyBjaGFuZ2VkIGJ5XG4gICAgICogY2hhbmdpbmcgc3BlY2lhbCBjaGFyYWN0ZXJzLCB0aGUgY2FjaGUgaXMgd2lwZWQuIEVhY2ggb3B0aW9uIGdyb3VwIGlzXG4gICAgICogUkVQTEFDRUQgYnkgdGhlIG5ldyBvcHRpb24gZ3JvdXAgcGFzc2VkIGluLiBJZiBhbiBvcHRpb24gZ3JvdXAgaXMgbm90XG4gICAgICogaW5jbHVkZWQgaW4gdGhlIG9wdGlvbnMgaGFzaCwgaXQgaXMgbm90IGNoYW5nZWQuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIE9wdGlvbiBoYXNoLiBGb3Igc2FtcGxlIGlucHV0LCBzZWUgYHNldERlZmF1bHRPcHRpb25zYCBhYm92ZS5cbiAgICAgKi9cbiAgICBfdGhpcy5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICAgIGlmIChvcHRpb25zLnByZWZpeGVzKXtcbiAgICAgICAgICAgIG9wdC5wcmVmaXhlcyA9IG9wdGlvbnMucHJlZml4ZXM7XG4gICAgICAgICAgICBjYWNoZSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLnNlcGFyYXRvcnMpe1xuICAgICAgICAgICAgb3B0LnNlcGFyYXRvcnMgPSBvcHRpb25zLnNlcGFyYXRvcnM7XG4gICAgICAgICAgICBjYWNoZSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmNvbnRhaW5lcnMpe1xuICAgICAgICAgICAgb3B0LmNvbnRhaW5lcnMgPSBvcHRpb25zLmNvbnRhaW5lcnM7XG4gICAgICAgICAgICBjYWNoZSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5jYWNoZSAhPT0gJFVOREVGSU5FRCl7XG4gICAgICAgICAgICBvcHQudXNlQ2FjaGUgPSAhIW9wdGlvbnMuY2FjaGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnNpbXBsZSAhPT0gJFVOREVGSU5FRCl7XG4gICAgICAgICAgICB2YXIgdGVtcENhY2hlID0gb3B0LnVzZUNhY2hlOyAvLyBwcmVzZXJ2ZSB0aGVzZSB0d28gb3B0aW9ucyBhZnRlciBcInNldERlZmF1bHRPcHRpb25zXCJcbiAgICAgICAgICAgIHZhciB0ZW1wRm9yY2UgPSBvcHQuZm9yY2U7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9wdC5zaW1wbGUgPSB0cnV0aGlmeShvcHRpb25zLnNpbXBsZSk7XG4gICAgICAgICAgICBpZiAob3B0LnNpbXBsZSl7XG4gICAgICAgICAgICAgICAgc2V0U2ltcGxlT3B0aW9ucygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0RGVmYXVsdE9wdGlvbnMoKTtcbiAgICAgICAgICAgICAgICBvcHQudXNlQ2FjaGUgPSB0ZW1wQ2FjaGU7XG4gICAgICAgICAgICAgICAgb3B0LmZvcmNlID0gdGVtcEZvcmNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FjaGUgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuZm9yY2UgIT09ICRVTkRFRklORUQpe1xuICAgICAgICAgICAgb3B0LmZvcmNlID0gdHJ1dGhpZnkob3B0aW9ucy5mb3JjZSk7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlUmVnRXgoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB1c2Ugb2Yga2V5cGF0aCBjYWNoZSB0byBlbmFibGVkIG9yIGRpc2FibGVkLCBkZXBlbmRpbmcgb24gaW5wdXQgdmFsdWUuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7QW55fSB2YWwgVmFsdWUgd2hpY2ggd2lsbCBiZSBpbnRlcnByZXRlZCBhcyBhIGJvb2xlYW4gdXNpbmcgYHRydXRoaWZ5YC4gXCJ0cnVlXCIgd2lsbCBlbmFibGUgY2FjaGU7IFwiZmFsc2VcIiB3aWxsIGRpc2FibGUuXG4gICAgICovXG4gICAgX3RoaXMuc2V0Q2FjaGUgPSBmdW5jdGlvbih2YWwpe1xuICAgICAgICBvcHQudXNlQ2FjaGUgPSB0cnV0aGlmeSh2YWwpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRW5hYmxlcyB1c2Ugb2Yga2V5cGF0aCBjYWNoZS5cbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgX3RoaXMuc2V0Q2FjaGVPbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIG9wdC51c2VDYWNoZSA9IHRydWU7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBEaXNhYmxlcyB1c2Ugb2Yga2V5cGF0aCBjYWNoZS5cbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgX3RoaXMuc2V0Q2FjaGVPZmYgPSBmdW5jdGlvbigpe1xuICAgICAgICBvcHQudXNlQ2FjaGUgPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyBcImZvcmNlXCIgb3B0aW9uIHdoZW4gc2V0dGluZyB2YWx1ZXMgaW4gYW4gb2JqZWN0LCBkZXBlbmRpbmcgb24gaW5wdXQgdmFsdWUuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7QW55fSB2YWwgVmFsdWUgd2hpY2ggd2lsbCBiZSBpbnRlcnByZXRlZCBhcyBhIGJvb2xlYW4gdXNpbmcgYHRydXRoaWZ5YC4gXCJ0cnVlXCIgZW5hYmxlcyBcImZvcmNlXCI7IFwiZmFsc2VcIiBkaXNhYmxlcy5cbiAgICAgKi9cbiAgICBfdGhpcy5zZXRGb3JjZSA9IGZ1bmN0aW9uKHZhbCl7XG4gICAgICAgIG9wdC5mb3JjZSA9IHRydXRoaWZ5KHZhbCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFbmFibGVzIFwiZm9yY2VcIiBvcHRpb24gd2hlbiBzZXR0aW5nIHZhbHVlcyBpbiBhbiBvYmplY3QuXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIF90aGlzLnNldEZvcmNlT24gPSBmdW5jdGlvbigpe1xuICAgICAgICBvcHQuZm9yY2UgPSB0cnVlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRGlzYWJsZXMgXCJmb3JjZVwiIG9wdGlvbiB3aGVuIHNldHRpbmcgdmFsdWVzIGluIGFuIG9iamVjdC5cbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgX3RoaXMuc2V0Rm9yY2VPZmYgPSBmdW5jdGlvbigpe1xuICAgICAgICBvcHQuZm9yY2UgPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2hvcnRjdXQgZnVuY3Rpb24gdG8gYWx0ZXIgUGF0aFRvb2xraXQgc3ludGF4IHRvIGEgXCJzaW1wbGVcIiBtb2RlIHRoYXQgb25seSB1c2VzXG4gICAgICogc2VwYXJhdG9ycyBhbmQgbm8gb3RoZXIgb3BlcmF0b3JzLiBcIlNpbXBsZVwiIG1vZGUgaXMgZW5hYmxlZCBvciBkaXNhYmxlZCBhY2NvcmRpbmdcbiAgICAgKiB0byB0aGUgZmlyc3QgYXJndW1lbnQgYW5kIHRoZSBzZXBhcmF0b3IgbWF5IGJlIGN1c3RvbWl6ZWQgd2l0aCB0aGUgc2Vjb25kXG4gICAgICogYXJndW1lbnQgd2hlbiBlbmFibGluZyBcInNpbXBsZVwiIG1vZGUuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7QW55fSB2YWwgVmFsdWUgd2hpY2ggd2lsbCBiZSBpbnRlcnByZXRlZCBhcyBhIGJvb2xlYW4gdXNpbmcgYHRydXRoaWZ5YC4gXCJ0cnVlXCIgZW5hYmxlcyBcInNpbXBsZVwiIG1vZGU7IFwiZmFsc2VcIiBkaXNhYmxlcy5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc2VwIFNlcGFyYXRvciBzdHJpbmcgdG8gdXNlIGluIHBsYWNlIG9mIHRoZSBkZWZhdWx0IFwiLlwiXG4gICAgICovXG4gICAgX3RoaXMuc2V0U2ltcGxlID0gZnVuY3Rpb24odmFsLCBzZXApe1xuICAgICAgICB2YXIgdGVtcENhY2hlID0gb3B0LnVzZUNhY2hlOyAvLyBwcmVzZXJ2ZSB0aGVzZSB0d28gb3B0aW9ucyBhZnRlciBcInNldERlZmF1bHRPcHRpb25zXCJcbiAgICAgICAgdmFyIHRlbXBGb3JjZSA9IG9wdC5mb3JjZTtcbiAgICAgICAgb3B0LnNpbXBsZSA9IHRydXRoaWZ5KHZhbCk7XG4gICAgICAgIGlmIChvcHQuc2ltcGxlKXtcbiAgICAgICAgICAgIHNldFNpbXBsZU9wdGlvbnMoc2VwKTtcbiAgICAgICAgICAgIHVwZGF0ZVJlZ0V4KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzZXREZWZhdWx0T3B0aW9ucygpO1xuICAgICAgICAgICAgdXBkYXRlUmVnRXgoKTtcbiAgICAgICAgICAgIG9wdC51c2VDYWNoZSA9IHRlbXBDYWNoZTtcbiAgICAgICAgICAgIG9wdC5mb3JjZSA9IHRlbXBGb3JjZTtcbiAgICAgICAgfVxuICAgICAgICBjYWNoZSA9IHt9O1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRW5hYmxlcyBcInNpbXBsZVwiIG1vZGVcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNlcCBTZXBhcmF0b3Igc3RyaW5nIHRvIHVzZSBpbiBwbGFjZSBvZiB0aGUgZGVmYXVsdCBcIi5cIlxuICAgICAqIEBzZWUgc2V0U2ltcGxlXG4gICAgICovXG4gICAgX3RoaXMuc2V0U2ltcGxlT24gPSBmdW5jdGlvbihzZXApe1xuICAgICAgICBvcHQuc2ltcGxlID0gdHJ1ZTtcbiAgICAgICAgc2V0U2ltcGxlT3B0aW9ucyhzZXApO1xuICAgICAgICB1cGRhdGVSZWdFeCgpO1xuICAgICAgICBjYWNoZSA9IHt9O1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRGlzYWJsZXMgXCJzaW1wbGVcIiBtb2RlLCByZXN0b3JlcyBkZWZhdWx0IFBhdGhUb29sa2l0IHN5bnRheFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAc2VlIHNldFNpbXBsZVxuICAgICAqIEBzZWUgc2V0RGVmYXVsdE9wdGlvbnNcbiAgICAgKi9cbiAgICBfdGhpcy5zZXRTaW1wbGVPZmYgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdGVtcENhY2hlID0gb3B0LnVzZUNhY2hlOyAvLyBwcmVzZXJ2ZSB0aGVzZSB0d28gb3B0aW9ucyBhZnRlciBcInNldERlZmF1bHRPcHRpb25zXCJcbiAgICAgICAgdmFyIHRlbXBGb3JjZSA9IG9wdC5mb3JjZTtcbiAgICAgICAgb3B0LnNpbXBsZSA9IGZhbHNlO1xuICAgICAgICBzZXREZWZhdWx0T3B0aW9ucygpO1xuICAgICAgICB1cGRhdGVSZWdFeCgpO1xuICAgICAgICBvcHQudXNlQ2FjaGUgPSB0ZW1wQ2FjaGU7XG4gICAgICAgIG9wdC5mb3JjZSA9IHRlbXBGb3JjZTtcbiAgICAgICAgY2FjaGUgPSB7fTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTW9kaWZ5IHRoZSBwcm9wZXJ0eSBzZXBhcmF0b3IgaW4gdGhlIFBhdGhUb29sa2l0IHN5bnRheC5cbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbCBOZXcgY2hhcmFjdGVyIHRvIHVzZSBmb3IgdGhpcyBvcGVyYXRpb24uXG4gICAgICovXG4gICAgX3RoaXMuc2V0U2VwYXJhdG9yUHJvcGVydHkgPSBmdW5jdGlvbih2YWwpe1xuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJFNUUklORyAmJiB2YWwubGVuZ3RoID09PSAxKXtcbiAgICAgICAgICAgIGlmICh2YWwgIT09ICRXSUxEQ0FSRCAmJiAoIW9wdC5zZXBhcmF0b3JzW3ZhbF0gfHwgb3B0LnNlcGFyYXRvcnNbdmFsXS5leGVjID09PSAkUFJPUEVSVFkpICYmICEob3B0LnByZWZpeGVzW3ZhbF0gfHwgb3B0LmNvbnRhaW5lcnNbdmFsXSkpe1xuICAgICAgICAgICAgICAgIHVwZGF0ZU9wdGlvbkNoYXIob3B0LnNlcGFyYXRvcnMsICRQUk9QRVJUWSwgdmFsKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVSZWdFeCgpO1xuICAgICAgICAgICAgICAgIGNhY2hlID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFNlcGFyYXRvclByb3BlcnR5IC0gdmFsdWUgYWxyZWFkeSBpbiB1c2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2V0U2VwYXJhdG9yUHJvcGVydHkgLSBpbnZhbGlkIHZhbHVlJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTW9kaWZ5IHRoZSBjb2xsZWN0aW9uIHNlcGFyYXRvciBpbiB0aGUgUGF0aFRvb2xraXQgc3ludGF4LlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsIE5ldyBjaGFyYWN0ZXIgdG8gdXNlIGZvciB0aGlzIG9wZXJhdGlvbi5cbiAgICAgKi9cbiAgICBfdGhpcy5zZXRTZXBhcmF0b3JDb2xsZWN0aW9uID0gZnVuY3Rpb24odmFsKXtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09ICRTVFJJTkcgJiYgdmFsLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgICAgICBpZiAodmFsICE9PSAkV0lMRENBUkQgJiYgKCFvcHQuc2VwYXJhdG9yc1t2YWxdIHx8IG9wdC5zZXBhcmF0b3JzW3ZhbF0uZXhlYyA9PT0gJENPTExFQ1RJT04pICYmICEob3B0LnByZWZpeGVzW3ZhbF0gfHwgb3B0LmNvbnRhaW5lcnNbdmFsXSkpe1xuICAgICAgICAgICAgICAgIHVwZGF0ZU9wdGlvbkNoYXIob3B0LnNlcGFyYXRvcnMsICRDT0xMRUNUSU9OLCB2YWwpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZVJlZ0V4KCk7XG4gICAgICAgICAgICAgICAgY2FjaGUgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2V0U2VwYXJhdG9yQ29sbGVjdGlvbiAtIHZhbHVlIGFscmVhZHkgaW4gdXNlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFNlcGFyYXRvckNvbGxlY3Rpb24gLSBpbnZhbGlkIHZhbHVlJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTW9kaWZ5IHRoZSBwYXJlbnQgcHJlZml4IGluIHRoZSBQYXRoVG9vbGtpdCBzeW50YXguXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB2YWwgTmV3IGNoYXJhY3RlciB0byB1c2UgZm9yIHRoaXMgb3BlcmF0aW9uLlxuICAgICAqL1xuICAgIF90aGlzLnNldFByZWZpeFBhcmVudCA9IGZ1bmN0aW9uKHZhbCl7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09PSAkU1RSSU5HICYmIHZhbC5sZW5ndGggPT09IDEpe1xuICAgICAgICAgICAgaWYgKHZhbCAhPT0gJFdJTERDQVJEICYmICghb3B0LnByZWZpeGVzW3ZhbF0gfHwgb3B0LnByZWZpeGVzW3ZhbF0uZXhlYyA9PT0gJFBBUkVOVCkgJiYgIShvcHQuc2VwYXJhdG9yc1t2YWxdIHx8IG9wdC5jb250YWluZXJzW3ZhbF0pKXtcbiAgICAgICAgICAgICAgICB1cGRhdGVPcHRpb25DaGFyKG9wdC5wcmVmaXhlcywgJFBBUkVOVCwgdmFsKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVSZWdFeCgpO1xuICAgICAgICAgICAgICAgIGNhY2hlID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFByZWZpeFBhcmVudCAtIHZhbHVlIGFscmVhZHkgaW4gdXNlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFByZWZpeFBhcmVudCAtIGludmFsaWQgdmFsdWUnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNb2RpZnkgdGhlIHJvb3QgcHJlZml4IGluIHRoZSBQYXRoVG9vbGtpdCBzeW50YXguXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB2YWwgTmV3IGNoYXJhY3RlciB0byB1c2UgZm9yIHRoaXMgb3BlcmF0aW9uLlxuICAgICAqL1xuICAgIF90aGlzLnNldFByZWZpeFJvb3QgPSBmdW5jdGlvbih2YWwpe1xuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJFNUUklORyAmJiB2YWwubGVuZ3RoID09PSAxKXtcbiAgICAgICAgICAgIGlmICh2YWwgIT09ICRXSUxEQ0FSRCAmJiAoIW9wdC5wcmVmaXhlc1t2YWxdIHx8IG9wdC5wcmVmaXhlc1t2YWxdLmV4ZWMgPT09ICRST09UKSAmJiAhKG9wdC5zZXBhcmF0b3JzW3ZhbF0gfHwgb3B0LmNvbnRhaW5lcnNbdmFsXSkpe1xuICAgICAgICAgICAgICAgIHVwZGF0ZU9wdGlvbkNoYXIob3B0LnByZWZpeGVzLCAkUk9PVCwgdmFsKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVSZWdFeCgpO1xuICAgICAgICAgICAgICAgIGNhY2hlID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFByZWZpeFJvb3QgLSB2YWx1ZSBhbHJlYWR5IGluIHVzZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXRQcmVmaXhSb290IC0gaW52YWxpZCB2YWx1ZScpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE1vZGlmeSB0aGUgcGxhY2Vob2xkZXIgcHJlZml4IGluIHRoZSBQYXRoVG9vbGtpdCBzeW50YXguXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB2YWwgTmV3IGNoYXJhY3RlciB0byB1c2UgZm9yIHRoaXMgb3BlcmF0aW9uLlxuICAgICAqL1xuICAgIF90aGlzLnNldFByZWZpeFBsYWNlaG9sZGVyID0gZnVuY3Rpb24odmFsKXtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09ICRTVFJJTkcgJiYgdmFsLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgICAgICBpZiAodmFsICE9PSAkV0lMRENBUkQgJiYgKCFvcHQucHJlZml4ZXNbdmFsXSB8fCBvcHQucHJlZml4ZXNbdmFsXS5leGVjID09PSAkUExBQ0VIT0xERVIpICYmICEob3B0LnNlcGFyYXRvcnNbdmFsXSB8fCBvcHQuY29udGFpbmVyc1t2YWxdKSl7XG4gICAgICAgICAgICAgICAgdXBkYXRlT3B0aW9uQ2hhcihvcHQucHJlZml4ZXMsICRQTEFDRUhPTERFUiwgdmFsKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVSZWdFeCgpO1xuICAgICAgICAgICAgICAgIGNhY2hlID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFByZWZpeFBsYWNlaG9sZGVyIC0gdmFsdWUgYWxyZWFkeSBpbiB1c2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2V0UHJlZml4UGxhY2Vob2xkZXIgLSBpbnZhbGlkIHZhbHVlJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTW9kaWZ5IHRoZSBjb250ZXh0IHByZWZpeCBpbiB0aGUgUGF0aFRvb2xraXQgc3ludGF4LlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsIE5ldyBjaGFyYWN0ZXIgdG8gdXNlIGZvciB0aGlzIG9wZXJhdGlvbi5cbiAgICAgKi9cbiAgICBfdGhpcy5zZXRQcmVmaXhDb250ZXh0ID0gZnVuY3Rpb24odmFsKXtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09ICRTVFJJTkcgJiYgdmFsLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgICAgICBpZiAodmFsICE9PSAkV0lMRENBUkQgJiYgKCFvcHQucHJlZml4ZXNbdmFsXSB8fCBvcHQucHJlZml4ZXNbdmFsXS5leGVjID09PSAkQ09OVEVYVCkgJiYgIShvcHQuc2VwYXJhdG9yc1t2YWxdIHx8IG9wdC5jb250YWluZXJzW3ZhbF0pKXtcbiAgICAgICAgICAgICAgICB1cGRhdGVPcHRpb25DaGFyKG9wdC5wcmVmaXhlcywgJENPTlRFWFQsIHZhbCk7XG4gICAgICAgICAgICAgICAgdXBkYXRlUmVnRXgoKTtcbiAgICAgICAgICAgICAgICBjYWNoZSA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXRQcmVmaXhDb250ZXh0IC0gdmFsdWUgYWxyZWFkeSBpbiB1c2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2V0UHJlZml4Q29udGV4dCAtIGludmFsaWQgdmFsdWUnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNb2RpZnkgdGhlIHByb3BlcnR5IGNvbnRhaW5lciBjaGFyYWN0ZXJzIGluIHRoZSBQYXRoVG9vbGtpdCBzeW50YXguXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB2YWwgTmV3IGNoYXJhY3RlciB0byB1c2UgZm9yIHRoZSBjb250YWluZXIgb3BlbmVyLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjbG9zZXIgTmV3IGNoYXJhY3RlciB0byB1c2UgZm9yIHRoZSBjb250YWluZXIgY2xvc2VyLlxuICAgICAqL1xuICAgIF90aGlzLnNldENvbnRhaW5lclByb3BlcnR5ID0gZnVuY3Rpb24odmFsLCBjbG9zZXIpe1xuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJFNUUklORyAmJiB2YWwubGVuZ3RoID09PSAxICYmIHR5cGVvZiBjbG9zZXIgPT09ICRTVFJJTkcgJiYgY2xvc2VyLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgICAgICBpZiAodmFsICE9PSAkV0lMRENBUkQgJiYgKCFvcHQuY29udGFpbmVyc1t2YWxdIHx8IG9wdC5jb250YWluZXJzW3ZhbF0uZXhlYyA9PT0gJFBST1BFUlRZKSAmJiAhKG9wdC5zZXBhcmF0b3JzW3ZhbF0gfHwgb3B0LnByZWZpeGVzW3ZhbF0pKXtcbiAgICAgICAgICAgICAgICB1cGRhdGVPcHRpb25DaGFyKG9wdC5jb250YWluZXJzLCAkUFJPUEVSVFksIHZhbCwgY2xvc2VyKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVSZWdFeCgpO1xuICAgICAgICAgICAgICAgIGNhY2hlID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldENvbnRhaW5lclByb3BlcnR5IC0gdmFsdWUgYWxyZWFkeSBpbiB1c2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2V0Q29udGFpbmVyUHJvcGVydHkgLSBpbnZhbGlkIHZhbHVlJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTW9kaWZ5IHRoZSBzaW5nbGUgcXVvdGUgY29udGFpbmVyIGNoYXJhY3RlcnMgaW4gdGhlIFBhdGhUb29sa2l0IHN5bnRheC5cbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbCBOZXcgY2hhcmFjdGVyIHRvIHVzZSBmb3IgdGhlIGNvbnRhaW5lciBvcGVuZXIuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNsb3NlciBOZXcgY2hhcmFjdGVyIHRvIHVzZSBmb3IgdGhlIGNvbnRhaW5lciBjbG9zZXIuXG4gICAgICovXG4gICAgX3RoaXMuc2V0Q29udGFpbmVyU2luZ2xlcXVvdGUgPSBmdW5jdGlvbih2YWwsIGNsb3Nlcil7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09PSAkU1RSSU5HICYmIHZhbC5sZW5ndGggPT09IDEgJiYgdHlwZW9mIGNsb3NlciA9PT0gJFNUUklORyAmJiBjbG9zZXIubGVuZ3RoID09PSAxKXtcbiAgICAgICAgICAgIGlmICh2YWwgIT09ICRXSUxEQ0FSRCAmJiAoIW9wdC5jb250YWluZXJzW3ZhbF0gfHwgb3B0LmNvbnRhaW5lcnNbdmFsXS5leGVjID09PSAkU0lOR0xFUVVPVEUpICYmICEob3B0LnNlcGFyYXRvcnNbdmFsXSB8fCBvcHQucHJlZml4ZXNbdmFsXSkpe1xuICAgICAgICAgICAgICAgIHVwZGF0ZU9wdGlvbkNoYXIob3B0LmNvbnRhaW5lcnMsICRTSU5HTEVRVU9URSwgdmFsLCBjbG9zZXIpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZVJlZ0V4KCk7XG4gICAgICAgICAgICAgICAgY2FjaGUgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2V0Q29udGFpbmVyU2luZ2xlcXVvdGUgLSB2YWx1ZSBhbHJlYWR5IGluIHVzZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXRDb250YWluZXJTaW5nbGVxdW90ZSAtIGludmFsaWQgdmFsdWUnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNb2RpZnkgdGhlIGRvdWJsZSBxdW90ZSBjb250YWluZXIgY2hhcmFjdGVycyBpbiB0aGUgUGF0aFRvb2xraXQgc3ludGF4LlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsIE5ldyBjaGFyYWN0ZXIgdG8gdXNlIGZvciB0aGUgY29udGFpbmVyIG9wZW5lci5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY2xvc2VyIE5ldyBjaGFyYWN0ZXIgdG8gdXNlIGZvciB0aGUgY29udGFpbmVyIGNsb3Nlci5cbiAgICAgKi9cbiAgICBfdGhpcy5zZXRDb250YWluZXJEb3VibGVxdW90ZSA9IGZ1bmN0aW9uKHZhbCwgY2xvc2VyKXtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09ICRTVFJJTkcgJiYgdmFsLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgY2xvc2VyID09PSAkU1RSSU5HICYmIGNsb3Nlci5sZW5ndGggPT09IDEpe1xuICAgICAgICAgICAgaWYgKHZhbCAhPT0gJFdJTERDQVJEICYmICghb3B0LmNvbnRhaW5lcnNbdmFsXSB8fCBvcHQuY29udGFpbmVyc1t2YWxdLmV4ZWMgPT09ICRET1VCTEVRVU9URSkgJiYgIShvcHQuc2VwYXJhdG9yc1t2YWxdIHx8IG9wdC5wcmVmaXhlc1t2YWxdKSl7XG4gICAgICAgICAgICAgICAgdXBkYXRlT3B0aW9uQ2hhcihvcHQuY29udGFpbmVycywgJERPVUJMRVFVT1RFLCB2YWwsIGNsb3Nlcik7XG4gICAgICAgICAgICAgICAgdXBkYXRlUmVnRXgoKTtcbiAgICAgICAgICAgICAgICBjYWNoZSA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXRDb250YWluZXJEb3VibGVxdW90ZSAtIHZhbHVlIGFscmVhZHkgaW4gdXNlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldENvbnRhaW5lckRvdWJsZXF1b3RlIC0gaW52YWxpZCB2YWx1ZScpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE1vZGlmeSB0aGUgZnVuY3Rpb24gY2FsbCBjb250YWluZXIgY2hhcmFjdGVycyBpbiB0aGUgUGF0aFRvb2xraXQgc3ludGF4LlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsIE5ldyBjaGFyYWN0ZXIgdG8gdXNlIGZvciB0aGUgY29udGFpbmVyIG9wZW5lci5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY2xvc2VyIE5ldyBjaGFyYWN0ZXIgdG8gdXNlIGZvciB0aGUgY29udGFpbmVyIGNsb3Nlci5cbiAgICAgKi9cbiAgICBfdGhpcy5zZXRDb250YWluZXJDYWxsID0gZnVuY3Rpb24odmFsLCBjbG9zZXIpe1xuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJFNUUklORyAmJiB2YWwubGVuZ3RoID09PSAxICYmIHR5cGVvZiBjbG9zZXIgPT09ICRTVFJJTkcgJiYgY2xvc2VyLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgICAgICBpZiAodmFsICE9PSAkV0lMRENBUkQgJiYgKCFvcHQuY29udGFpbmVyc1t2YWxdIHx8IG9wdC5jb250YWluZXJzW3ZhbF0uZXhlYyA9PT0gJENBTEwpICYmICEob3B0LnNlcGFyYXRvcnNbdmFsXSB8fCBvcHQucHJlZml4ZXNbdmFsXSkpe1xuICAgICAgICAgICAgICAgIHVwZGF0ZU9wdGlvbkNoYXIob3B0LmNvbnRhaW5lcnMsICRDQUxMLCB2YWwsIGNsb3Nlcik7XG4gICAgICAgICAgICAgICAgdXBkYXRlUmVnRXgoKTtcbiAgICAgICAgICAgICAgICBjYWNoZSA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXRDb250YWluZXJDYWxsIC0gdmFsdWUgYWxyZWFkeSBpbiB1c2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2V0Q29udGFpbmVyQ2FsbCAtIGludmFsaWQgdmFsdWUnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNb2RpZnkgdGhlIGV2YWwgcHJvcGVydHkgY29udGFpbmVyIGNoYXJhY3RlcnMgaW4gdGhlIFBhdGhUb29sa2l0IHN5bnRheC5cbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbCBOZXcgY2hhcmFjdGVyIHRvIHVzZSBmb3IgdGhlIGNvbnRhaW5lciBvcGVuZXIuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNsb3NlciBOZXcgY2hhcmFjdGVyIHRvIHVzZSBmb3IgdGhlIGNvbnRhaW5lciBjbG9zZXIuXG4gICAgICovXG4gICAgX3RoaXMuc2V0Q29udGFpbmVyRXZhbFByb3BlcnR5ID0gZnVuY3Rpb24odmFsLCBjbG9zZXIpe1xuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJFNUUklORyAmJiB2YWwubGVuZ3RoID09PSAxICYmIHR5cGVvZiBjbG9zZXIgPT09ICRTVFJJTkcgJiYgY2xvc2VyLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgICAgICBpZiAodmFsICE9PSAkV0lMRENBUkQgJiYgKCFvcHQuY29udGFpbmVyc1t2YWxdIHx8IG9wdC5jb250YWluZXJzW3ZhbF0uZXhlYyA9PT0gJEVWQUxQUk9QRVJUWSkgJiYgIShvcHQuc2VwYXJhdG9yc1t2YWxdIHx8IG9wdC5wcmVmaXhlc1t2YWxdKSl7XG4gICAgICAgICAgICAgICAgdXBkYXRlT3B0aW9uQ2hhcihvcHQuY29udGFpbmVycywgJEVWQUxQUk9QRVJUWSwgdmFsLCBjbG9zZXIpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZVJlZ0V4KCk7XG4gICAgICAgICAgICAgICAgY2FjaGUgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2V0Q29udGFpbmVyRXZhbFByb3BlcnR5IC0gdmFsdWUgYWxyZWFkeSBpbiB1c2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2V0Q29udGFpbmVyUHJvcGVydHkgLSBpbnZhbGlkIHZhbHVlJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVzZXQgYWxsIFBhdGhUb29sa2l0IG9wdGlvbnMgdG8gdGhlaXIgZGVmYXVsdCB2YWx1ZXMuXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIF90aGlzLnJlc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHNldERlZmF1bHRPcHRpb25zKCk7XG4gICAgICAgIHVwZGF0ZVJlZ0V4KCk7XG4gICAgICAgIGNhY2hlID0ge307XG4gICAgfTtcblxuICAgIC8vIEluaXRpYWxpemUgb3B0aW9uIHNldFxuICAgIHNldERlZmF1bHRPcHRpb25zKCk7XG4gICAgdXBkYXRlUmVnRXgoKTtcblxuICAgIC8vIEFwcGx5IGN1c3RvbSBvcHRpb25zIGlmIHByb3ZpZGVkIGFzIGFyZ3VtZW50IHRvIGNvbnN0cnVjdG9yXG4gICAgb3B0aW9ucyAmJiBfdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBQYXRoVG9vbGtpdDtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7OztBQU9BLEFBRUE7QUFDQSxJQUFJLEtBQUssR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7O0FBR3ZDLElBQUksU0FBUyxPQUFPLEdBQUc7SUFDbkIsVUFBVSxNQUFNLFdBQVc7SUFDM0IsT0FBTyxTQUFTLFFBQVE7SUFDeEIsT0FBTyxTQUFTLFFBQVE7SUFDeEIsS0FBSyxXQUFXLE1BQU07SUFDdEIsWUFBWSxJQUFJLGFBQWE7SUFDN0IsUUFBUSxRQUFRLFNBQVM7SUFDekIsU0FBUyxPQUFPLFVBQVU7SUFDMUIsV0FBVyxLQUFLLFlBQVk7SUFDNUIsS0FBSyxXQUFXLE1BQU07SUFDdEIsWUFBWSxJQUFJLGFBQWE7SUFDN0IsWUFBWSxJQUFJLGFBQWE7SUFDN0IsS0FBSyxXQUFXLE1BQU07SUFDdEIsYUFBYSxHQUFHLGNBQWMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQm5DLElBQUksYUFBYSxHQUFHLFNBQVMsUUFBUSxFQUFFLEdBQUcsQ0FBQztJQUN2QyxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNqQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDakIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7O1FBRVQsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDO1lBQ3RCLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQztTQUMzQjthQUNJO1lBQ0QsS0FBSyxHQUFHLEtBQUssSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hFO0tBQ0o7SUFDRCxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNULEtBQUssR0FBRyxLQUFLLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2hFO0lBQ0QsT0FBTyxLQUFLLENBQUM7Q0FDaEIsQ0FBQzs7Ozs7Ozs7OztBQVVGLElBQUksUUFBUSxHQUFHLFNBQVMsR0FBRyxDQUFDO0lBQ3hCLElBQUksT0FBTyxHQUFHLEtBQUssVUFBVSxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUUsRUFBRSxPQUFPLEtBQUssQ0FBQyxDQUFDO0lBQy9ELE9BQU8sRUFBRSxDQUFDLE9BQU8sR0FBRyxLQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQztDQUN2RSxDQUFDOzs7Ozs7Ozs7QUFTRixJQUFJLFFBQVEsR0FBRyxTQUFTLEdBQUcsQ0FBQztJQUN4QixJQUFJLENBQUMsQ0FBQztJQUNOLElBQUksT0FBTyxHQUFHLEtBQUssT0FBTyxDQUFDO1FBQ3ZCLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQztLQUN0QjtJQUNELENBQUMsR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdEIsSUFBSSxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQztRQUMxQyxPQUFPLElBQUksQ0FBQztLQUNmO0lBQ0QsT0FBTyxLQUFLLENBQUM7Q0FDaEIsQ0FBQzs7Ozs7Ozs7Ozs7O0FBWUYsSUFBSSxXQUFXLEdBQUcsU0FBUyxDQUFDLEVBQUUsR0FBRyxDQUFDO0lBQzlCLElBQUksTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNoQyxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2hELENBQUM7Ozs7Ozs7OztBQVNGLElBQUksV0FBVyxHQUFHLFNBQVMsT0FBTyxDQUFDO0lBQy9CLElBQUksS0FBSyxHQUFHLElBQUk7UUFDWixLQUFLLEdBQUcsRUFBRTtRQUNWLEdBQUcsR0FBRyxFQUFFO1FBQ1IsVUFBVSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsa0JBQWtCO1FBQzVELGlCQUFpQjtRQUNqQixXQUFXLEVBQUUsV0FBVztRQUN4QixlQUFlLEVBQUUsZUFBZTtRQUNoQyxXQUFXLEVBQUUsZ0JBQWdCO1FBQzdCLHVCQUF1QjtRQUN2QixhQUFhO1FBQ2IsYUFBYSxDQUFDOzs7Ozs7OztJQVFsQixJQUFJLFdBQVcsR0FBRyxVQUFVOztRQUV4QixVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzVDLGFBQWEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM1QyxrQkFBa0IsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQzs7UUFFNUYsaUJBQWlCLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLEVBQUUsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUgsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUNqQixXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQztZQUM3QyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxFQUFFLFdBQVcsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNuRSxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxFQUFFLFdBQVcsR0FBRyxHQUFHLENBQUMsQ0FBQztTQUN0RSxDQUFDLENBQUM7OztRQUdILGVBQWUsR0FBRyxPQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDNUosZUFBZSxHQUFHLElBQUksTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDOzs7UUFHOUMsV0FBVyxHQUFHLFNBQVMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDakosZ0JBQWdCLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzs7OztRQUtoRCx1QkFBdUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMzRSxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUM7WUFDM0IsYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN0RTthQUNJO1lBQ0QsYUFBYSxHQUFHLEVBQUUsQ0FBQztTQUN0Qjs7O1FBR0QsYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUM5QyxDQUFDOzs7Ozs7SUFNRixJQUFJLGlCQUFpQixHQUFHLFVBQVU7UUFDOUIsR0FBRyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7O1FBRWhCLEdBQUcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ25CLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDOzs7UUFHbEIsR0FBRyxDQUFDLFFBQVEsR0FBRztZQUNYLEdBQUcsRUFBRTtnQkFDRCxNQUFNLEVBQUUsT0FBTzthQUNsQjtZQUNELEdBQUcsRUFBRTtnQkFDRCxNQUFNLEVBQUUsS0FBSzthQUNoQjtZQUNELEdBQUcsRUFBRTtnQkFDRCxNQUFNLEVBQUUsWUFBWTthQUN2QjtZQUNELEdBQUcsRUFBRTtnQkFDRCxNQUFNLEVBQUUsUUFBUTthQUNuQjtTQUNKLENBQUM7O1FBRUYsR0FBRyxDQUFDLFVBQVUsR0FBRztZQUNiLEdBQUcsRUFBRTtnQkFDRCxNQUFNLEVBQUUsU0FBUztpQkFDaEI7WUFDTCxHQUFHLEVBQUU7Z0JBQ0QsTUFBTSxFQUFFLFdBQVc7aUJBQ2xCO1lBQ0wsR0FBRyxFQUFFO2dCQUNELE1BQU0sRUFBRSxLQUFLO2FBQ2hCO1NBQ0osQ0FBQzs7UUFFRixHQUFHLENBQUMsVUFBVSxHQUFHO1lBQ2IsR0FBRyxFQUFFO2dCQUNELFFBQVEsRUFBRSxHQUFHO2dCQUNiLE1BQU0sRUFBRSxTQUFTO2lCQUNoQjtZQUNMLElBQUksRUFBRTtnQkFDRixRQUFRLEVBQUUsSUFBSTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtpQkFDbkI7WUFDTCxHQUFHLEVBQUU7Z0JBQ0QsUUFBUSxFQUFFLEdBQUc7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7aUJBQ25CO1lBQ0wsR0FBRyxFQUFFO2dCQUNELFFBQVEsRUFBRSxHQUFHO2dCQUNiLE1BQU0sRUFBRSxLQUFLO2lCQUNaO1lBQ0wsR0FBRyxFQUFFO2dCQUNELFFBQVEsRUFBRSxHQUFHO2dCQUNiLE1BQU0sRUFBRSxhQUFhO2lCQUNwQjtTQUNSLENBQUM7S0FDTCxDQUFDOzs7Ozs7Ozs7OztJQVdGLElBQUksUUFBUSxHQUFHLFNBQVMsR0FBRyxDQUFDO1FBQ3hCLElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDN0IsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsT0FBTyxLQUFLLENBQUMsRUFBRTtRQUNoQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLFdBQVcsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUM7S0FDeEUsQ0FBQzs7Ozs7Ozs7Ozs7SUFXRixJQUFJLFdBQVcsR0FBRyxTQUFTLEdBQUcsQ0FBQztRQUMzQixJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzQjtRQUNELE9BQU8sR0FBRyxDQUFDO0tBQ2QsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7SUFjRixJQUFJLFFBQVEsR0FBRyxVQUFVLEdBQUcsQ0FBQztRQUN6QixJQUFJLElBQUksR0FBRyxFQUFFO1lBQ1QsVUFBVSxHQUFHLElBQUk7WUFDakIsTUFBTSxHQUFHLEVBQUU7WUFDWCxLQUFLLEdBQUcsRUFBRTtZQUNWLElBQUksR0FBRyxFQUFFO1lBQ1QsVUFBVSxHQUFHLENBQUM7WUFDZCxJQUFJLEdBQUcsRUFBRTtZQUNULFdBQVcsR0FBRyxLQUFLO1lBQ25CLE1BQU0sR0FBRyxLQUFLO1lBQ2QsT0FBTyxHQUFHLEVBQUU7WUFDWixDQUFDLEdBQUcsQ0FBQztZQUNMLE1BQU0sR0FBRyxFQUFFO1lBQ1gsTUFBTSxHQUFHLEVBQUU7WUFDWCxTQUFTLEdBQUcsRUFBRTtZQUNkLFVBQVUsR0FBRyxFQUFFO1lBQ2YsS0FBSyxHQUFHLENBQUM7WUFDVCxPQUFPLEdBQUcsQ0FBQyxDQUFDOztRQUVoQixJQUFJLEdBQUcsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7OztRQUcvRCxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O1FBRXpCLElBQUksT0FBTyxHQUFHLEtBQUssT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyRCxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3ZDLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQy9ELE9BQU8sQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztTQUMxQzs7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQzs7O1lBRzVCLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQzs7Z0JBRTdCLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNkLENBQUMsRUFBRSxDQUFDO2FBQ1A7O1lBRUQsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO2dCQUN2QixXQUFXLEdBQUcsSUFBSSxDQUFDO2FBQ3RCOztZQUVELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQzs7Ozs7O2dCQU1WLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLElBQUksTUFBTSxLQUFLLE1BQU0sQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ3RFLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDOzs7Z0JBR2pELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztvQkFDVixPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN0Qjs7cUJBRUk7O29CQUVELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQzt3QkFDaEcsSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDOzRCQUM1QyxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3lCQUNoQzs2QkFDSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssWUFBWSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDOzRCQUNsRSxLQUFLLEdBQUcsT0FBTyxDQUFDO3lCQUNuQjs2QkFDSTs0QkFDRCxLQUFLLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUMxQixJQUFJLEtBQUssS0FBSyxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFOzRCQUN6QyxLQUFLLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7NEJBQ3pCLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO3lCQUN6Qjs7d0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDMUI7O3lCQUVJLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNuQixJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7NEJBQzVDLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7eUJBQ2hDOzZCQUNJLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxZQUFZLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxZQUFZLENBQUM7NEJBQ2xFLEtBQUssR0FBRyxPQUFPLENBQUM7eUJBQ25COzZCQUNJOzRCQUNELEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBQzFCLElBQUksS0FBSyxLQUFLLEtBQUssQ0FBQyxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUU7NEJBQ3pDLEtBQUssQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQzs0QkFDekIsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7eUJBQ3pCO3dCQUNELFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO3dCQUNoRCxVQUFVLEdBQUcsRUFBRSxDQUFDO3dCQUNoQixVQUFVLElBQUksS0FBSyxDQUFDO3FCQUN2Qjs7eUJBRUksSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQzt3QkFDL0IsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbkMsSUFBSSxNQUFNLENBQUM7NEJBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQ3hELFVBQVUsSUFBSSxLQUFLLENBQUM7NEJBQ3BCLE1BQU0sR0FBRyxLQUFLLENBQUM7eUJBQ2xCOzZCQUNJOzRCQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN4QixVQUFVLElBQUksSUFBSSxDQUFDO3lCQUN0QjtxQkFDSjs7eUJBRUksSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFlBQVksSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQzt3QkFDbEUsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDckIsVUFBVSxJQUFJLElBQUksQ0FBQztxQkFDdEI7O3lCQUVJO3dCQUNELElBQUksT0FBTyxLQUFLLEVBQUUsQ0FBQzs0QkFDZixLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzt5QkFDOUI7NkJBQ0k7NEJBQ0QsS0FBSyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQzt5QkFDN0I7d0JBQ0QsSUFBSSxLQUFLLEtBQUssS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRTt3QkFDekMsS0FBSyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO3dCQUN6QixLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzt3QkFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDbkIsVUFBVSxJQUFJLEtBQUssQ0FBQztxQkFDdkI7b0JBQ0QsT0FBTyxHQUFHLEVBQUUsQ0FBQztpQkFDaEI7YUFDSjs7O2lCQUdJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3ZFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO2dCQUNoQixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO3FCQUN4RSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO2FBQ2pEOzs7Ozs7aUJBTUksSUFBSSxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUN6RSxTQUFTLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksV0FBVyxDQUFDLENBQUM7O29CQUVuQyxPQUFPLFNBQVMsQ0FBQztpQkFDcEI7O2dCQUVELElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxXQUFXLElBQUksTUFBTSxDQUFDLENBQUM7b0JBQzVDLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ25ELElBQUksR0FBRyxFQUFFLENBQUM7b0JBQ1YsVUFBVSxJQUFJLEtBQUssQ0FBQztpQkFDdkI7O2dCQUVELElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUM7O29CQUV6RCxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUM7d0JBQ3hCLElBQUksSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDaEQsVUFBVSxHQUFHLEVBQUUsQ0FBQzt3QkFDaEIsVUFBVSxJQUFJLEtBQUssQ0FBQztxQkFDdkI7O3lCQUVJO3dCQUNELElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUMxQixVQUFVLElBQUksSUFBSSxDQUFDO3FCQUN0Qjs7O29CQUdELE1BQU0sR0FBRyxTQUFTLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQztpQkFDckM7O3FCQUVJLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxXQUFXLENBQUM7b0JBQ3BDLElBQUksSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNqQztnQkFDRCxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNWLFdBQVcsR0FBRyxLQUFLLENBQUM7YUFDdkI7Ozs7Ozs7OztpQkFTSSxJQUFJLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3pFLE1BQU0sR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksV0FBVyxJQUFJLE1BQU0sQ0FBQyxDQUFDO29CQUM1QyxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsQ0FBQzt3QkFDekIsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDckQ7eUJBQ0k7d0JBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7d0JBQ2pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO3FCQUN4QjtvQkFDRCxJQUFJLEdBQUcsRUFBRSxDQUFDO2lCQUNiO2dCQUNELElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQzs7b0JBRXhCLElBQUksSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNqQztxQkFDSTs7b0JBRUQsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzFCLFVBQVUsSUFBSSxJQUFJLENBQUM7aUJBQ3RCO2dCQUNELE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7OztnQkFHakIsSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDO29CQUM5QyxNQUFNLEdBQUcsS0FBSyxDQUFDO2lCQUNsQjtnQkFDRCxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNWLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0JBQ3BCLEtBQUssRUFBRSxDQUFDO2FBQ1g7O2lCQUVJLElBQUksQ0FBQyxHQUFHLFVBQVUsRUFBRTtnQkFDckIsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNuQjs7O1lBR0QsSUFBSSxDQUFDLEdBQUcsVUFBVSxJQUFJLENBQUMsS0FBSyxPQUFPLENBQUM7Z0JBQ2hDLE9BQU8sR0FBRyxDQUFDLENBQUM7YUFDZjtTQUNKOzs7UUFHRCxJQUFJLE9BQU8sQ0FBQztZQUNSLE9BQU8sU0FBUyxDQUFDO1NBQ3BCOzs7UUFHRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLFdBQVcsSUFBSSxNQUFNLENBQUMsQ0FBQztZQUN4RSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ25ELElBQUksR0FBRyxFQUFFLENBQUM7WUFDVixVQUFVLElBQUksS0FBSyxDQUFDO1NBQ3ZCO2FBQ0ksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztTQUNwQjs7UUFFRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUM7WUFDeEIsSUFBSSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDaEQsVUFBVSxJQUFJLEtBQUssQ0FBQztTQUN2Qjs7YUFFSTtZQUNELElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFCLFVBQVUsSUFBSSxJQUFJLENBQUM7U0FDdEI7OztRQUdELElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUU7OztRQUdyQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQzs7UUFFL0QsT0FBTyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQzFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFzQkYsSUFBSSxXQUFXLEdBQUcsVUFBVSxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDO1FBQzlELElBQUksTUFBTSxHQUFHLFFBQVEsS0FBSyxLQUFLO1lBQzNCLEVBQUUsR0FBRyxFQUFFO1lBQ1AsUUFBUSxHQUFHLENBQUM7WUFDWixTQUFTLEdBQUcsQ0FBQztZQUNiLGdCQUFnQixHQUFHLENBQUM7WUFDcEIsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLElBQUksR0FBRyxHQUFHO1lBQ1YsSUFBSSxHQUFHLEVBQUU7WUFDVCxVQUFVLEdBQUcsQ0FBQztZQUNkLFVBQVUsR0FBRyxDQUFDO1lBQ2QsUUFBUSxHQUFHLEVBQUU7WUFDYixXQUFXO1lBQ1gsR0FBRyxHQUFHLENBQUM7WUFDUCxPQUFPLEdBQUcsR0FBRztZQUNiLEdBQUc7WUFDSCxZQUFZLEdBQUcsS0FBSztZQUNwQixRQUFRLEdBQUcsQ0FBQztZQUNaLElBQUksR0FBRyxFQUFFO1lBQ1QsUUFBUSxDQUFDOzs7UUFHYixJQUFJLE9BQU8sSUFBSSxLQUFLLE9BQU8sQ0FBQztZQUN4QixJQUFJLEdBQUcsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtpQkFDbkQ7Z0JBQ0QsRUFBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDcEIsSUFBSSxFQUFFLEtBQUssS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRTtnQkFDdEMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDYjtTQUNKOzthQUVJO1lBQ0QsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2pDOztRQUVELFFBQVEsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBQ3JCLElBQUksUUFBUSxLQUFLLENBQUMsRUFBRSxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUU7UUFDekMsU0FBUyxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUM7OztRQUd6QixJQUFJLFVBQVUsQ0FBQztZQUNYLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7U0FDeEM7OzthQUdJO1lBQ0QsVUFBVSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEI7Ozs7UUFJRCxPQUFPLElBQUksS0FBSyxLQUFLLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQztZQUNwQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzs7O1lBSWYsWUFBWSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7OztZQUcvQyxJQUFJLE9BQU8sSUFBSSxLQUFLLE9BQU8sQ0FBQzs7Z0JBRXhCLElBQUksTUFBTSxDQUFDOztvQkFFUCxJQUFJLFlBQVksQ0FBQzt3QkFDYixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO3dCQUN6QixJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFO3FCQUN2RDs7eUJBRUksSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLFdBQVcsRUFBRTt3QkFDeEQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztxQkFDdEI7aUJBQ0o7O2dCQUVELEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Ozs7YUFJdkI7aUJBQ0k7Z0JBQ0QsSUFBSSxJQUFJLEtBQUssS0FBSyxDQUFDO29CQUNmLEdBQUcsR0FBRyxTQUFTLENBQUM7aUJBQ25CO3FCQUNJLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQzs7O29CQUdiLEdBQUcsR0FBRyxFQUFFLENBQUM7b0JBQ1QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDO3dCQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUN4QixPQUFPLFNBQVMsQ0FBQzt5QkFDcEI7d0JBQ0QsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDTixVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7Ozt3QkFJNUIsTUFBTSxDQUFDLEdBQUcsVUFBVSxDQUFDOzRCQUNqQixDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUNOLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7NEJBQ2IsVUFBVSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDOzRCQUM1QixNQUFNLENBQUMsR0FBRyxVQUFVLENBQUM7Z0NBQ2pCLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQ0FDMUIsSUFBSSxZQUFZLENBQUM7b0NBQ2IsV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2lDQUNqRjtxQ0FDSSxJQUFJLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUM7b0NBQ3BDLFdBQVcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lDQUN4QztxQ0FDSTtvQ0FDRCxXQUFXLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7aUNBQ2xGO2dDQUNELElBQUksV0FBVyxLQUFLLEtBQUssRUFBRSxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUU7O2dDQUVoRCxJQUFJLFlBQVksQ0FBQztvQ0FDYixJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLGFBQWEsQ0FBQzt3Q0FDbEQsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLFFBQVEsQ0FBQztxQ0FDdEMsTUFBTTt3Q0FDSCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO3FDQUM1QjtpQ0FDSjtxQ0FDSTtvQ0FDRCxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLGFBQWEsQ0FBQzt3Q0FDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztxQ0FDeEMsTUFBTTt3Q0FDSCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO3FDQUM1QjtpQ0FDSjtnQ0FDRCxDQUFDLEVBQUUsQ0FBQzs2QkFDUDs0QkFDRCxDQUFDLEVBQUUsQ0FBQzt5QkFDUDtxQkFDSjt5QkFDSTt3QkFDRCxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNOLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQzt3QkFDNUIsTUFBTSxDQUFDLEdBQUcsVUFBVSxDQUFDOzRCQUNqQixJQUFJLFlBQVksQ0FBQztnQ0FDYixXQUFXLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7NkJBQzlFO2lDQUNJLElBQUksT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQztnQ0FDcEMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ3JDO2lDQUNJO2dDQUNELFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQzs2QkFDL0U7NEJBQ0QsSUFBSSxXQUFXLEtBQUssS0FBSyxFQUFFLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRTs7NEJBRWhELElBQUksWUFBWSxDQUFDO2dDQUNiLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssYUFBYSxDQUFDO29DQUNsRCxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsUUFBUSxDQUFDO2lDQUNuQyxNQUFNO29DQUNILEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7aUNBQ3pCOzZCQUNKO2lDQUNJO2dDQUNELElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssYUFBYSxDQUFDO29DQUNsRCxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2lDQUNsQyxNQUFNO29DQUNILEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7aUNBQ3pCOzZCQUNKOzRCQUNELENBQUMsRUFBRSxDQUFDO3lCQUNQO3FCQUNKO2lCQUNKO3FCQUNJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQzs7b0JBRVosUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7d0JBQ2QsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7NEJBRWpCLE9BQU8sR0FBRyxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQzlELElBQUksT0FBTyxLQUFLLEtBQUssRUFBRSxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUU7eUJBQy9DO3dCQUNELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7OzRCQUVmLE9BQU8sR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3hCLFVBQVUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUN2QixnQkFBZ0IsR0FBRyxDQUFDLENBQUM7eUJBQ3hCO3dCQUNELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7NEJBQ3RCLFFBQVEsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDOzRCQUN4QixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFOzs7NEJBR2xELFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7eUJBQ3hDO3FCQUNKOzs7O29CQUlELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQzt3QkFDWixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDeEIsT0FBTyxTQUFTLENBQUM7eUJBQ3BCO3dCQUNELEdBQUcsR0FBRyxFQUFFLENBQUM7d0JBQ1QsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDTixVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDNUIsTUFBTSxDQUFDLEdBQUcsVUFBVSxDQUFDOzs7NEJBR2pCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7Z0NBQ2xCLFFBQVEsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dDQUN4QixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFOzs7Z0NBR2xELEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7NkJBQzVCO2lDQUNJOztnQ0FFRCxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxLQUFLLEVBQUU7b0NBQ2hDLElBQUksWUFBWSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxFQUFFO29DQUNyRCxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2lDQUNsQztxQ0FDSSxJQUFJLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLFVBQVUsQ0FBQztvQ0FDdEMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQ0FDdEI7Ozs7OztxQ0FNSSxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0NBQ2xDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7b0NBQ2IsS0FBSyxJQUFJLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dDQUNwQixJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7NENBQzlCLElBQUksWUFBWSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxFQUFFOzRDQUNqRCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3lDQUNqQztxQ0FDSjtpQ0FDSjtxQ0FDSSxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUU7NkJBQzdCOzRCQUNELENBQUMsRUFBRSxDQUFDO3lCQUNQO3FCQUNKO3lCQUNJOzs7d0JBR0QsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzs0QkFDbEIsUUFBUSxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUM7NEJBQ3hCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUU7Ozs0QkFHbEQsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzt5QkFDeEI7NkJBQ0k7OzRCQUVELElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssRUFBRTtnQ0FDN0IsSUFBSSxZQUFZLENBQUMsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsUUFBUSxDQUFDLEVBQUU7Z0NBQ2xELEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7NkJBQzNCO2lDQUNJLElBQUksT0FBTyxPQUFPLEtBQUssVUFBVSxDQUFDOztnQ0FFbkMsR0FBRyxHQUFHLFFBQVEsQ0FBQzs2QkFDbEI7Ozs7OztpQ0FNSSxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0NBQ2xDLEdBQUcsR0FBRyxFQUFFLENBQUM7Z0NBQ1QsS0FBSyxJQUFJLElBQUksT0FBTyxDQUFDO29DQUNqQixJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7d0NBQzlCLElBQUksWUFBWSxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxFQUFFO3dDQUM5QyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3FDQUMzQjtpQ0FDSjs2QkFDSjtpQ0FDSSxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUU7eUJBQzdCO3FCQUNKO2lCQUNKOzs7cUJBR0ksSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLGFBQWEsQ0FBQztvQkFDakMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDO3dCQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUN4QixPQUFPLFNBQVMsQ0FBQzt5QkFDcEI7d0JBQ0QsR0FBRyxHQUFHLEVBQUUsQ0FBQzt3QkFDVCxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNOLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUM1QixNQUFNLENBQUMsR0FBRyxVQUFVLENBQUM7NEJBQ2pCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQztnQ0FDWixJQUFJLFlBQVksQ0FBQztvQ0FDYixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztpQ0FDekU7Z0NBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ3hFO2lDQUNJO2dDQUNELElBQUksWUFBWSxDQUFDO29DQUNiLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDO2lDQUNqRjtnQ0FDRCxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs2QkFDaEY7NEJBQ0QsQ0FBQyxFQUFFLENBQUM7eUJBQ1A7cUJBQ0o7eUJBQ0k7d0JBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDOzRCQUNaLElBQUksWUFBWSxDQUFDO2dDQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDOzZCQUNwRTs0QkFDRCxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDOUQ7NkJBQ0k7NEJBQ0QsSUFBSSxZQUFZLENBQUM7Z0NBQ2IsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUM7NkJBQzNFOzRCQUNELEdBQUcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO3lCQUN0RTtxQkFDSjtpQkFDSjs7Ozs7cUJBS0ksSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQztvQkFDekIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDO3dCQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNqRCxPQUFPLFNBQVMsQ0FBQzt5QkFDcEI7d0JBQ0QsR0FBRyxHQUFHLEVBQUUsQ0FBQzt3QkFDVCxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNOLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUM1QixNQUFNLENBQUMsR0FBRyxVQUFVLENBQUM7OzRCQUVqQixJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0NBQ3hCLFFBQVEsR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dDQUMvRCxJQUFJLFFBQVEsS0FBSyxLQUFLLENBQUM7b0NBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lDQUNuRTtxQ0FDSSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7b0NBQzdCLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztpQ0FDN0U7cUNBQ0k7b0NBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO2lDQUM1RTs2QkFDSjtpQ0FDSTtnQ0FDRCxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs2QkFDbEU7NEJBQ0QsQ0FBQyxFQUFFLENBQUM7eUJBQ1A7cUJBQ0o7eUJBQ0k7O3dCQUVELElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQzs0QkFDeEIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDO2dDQUNaLFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzs2QkFDdkM7aUNBQ0k7Z0NBQ0QsUUFBUSxHQUFHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7NkJBQ2xFOzRCQUNELElBQUksUUFBUSxLQUFLLEtBQUssQ0FBQztnQ0FDbkIsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ3pEO2lDQUNJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQ0FDN0IsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDOzZCQUNuRTtpQ0FDSTtnQ0FDRCxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7NkJBQ2xFO3lCQUNKOzZCQUNJOzRCQUNELEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUN4RDtxQkFDSjtpQkFDSjthQUNKOzs7Ozs7OztZQVFELFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQ3JDLE9BQU8sR0FBRyxHQUFHLENBQUM7WUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDO1lBQ1gsR0FBRyxFQUFFLENBQUM7U0FDVDtRQUNELE9BQU8sT0FBTyxDQUFDO0tBQ2xCLENBQUM7Ozs7Ozs7Ozs7Ozs7OztJQWVGLElBQUksa0JBQWtCLEdBQUcsU0FBUyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQztRQUNsRCxJQUFJLE1BQU0sR0FBRyxRQUFRLEtBQUssS0FBSztZQUMzQixFQUFFLEdBQUcsRUFBRTtZQUNQLENBQUMsR0FBRyxDQUFDO1lBQ0wsUUFBUSxHQUFHLENBQUMsQ0FBQzs7UUFFakIsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNuQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0RCxRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNyQixPQUFPLEdBQUcsS0FBSyxLQUFLLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQztZQUNqQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFO2lCQUNqQyxJQUFJLE1BQU0sQ0FBQztnQkFDWixJQUFJLENBQUMsS0FBSyxRQUFRLEdBQUcsQ0FBQyxDQUFDO29CQUNuQixHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDO2lCQUN6Qjs7O3FCQUdJLElBQUksR0FBRyxDQUFDLEtBQUssSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxXQUFXLEVBQUU7b0JBQ3JELEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7aUJBQ25CO2FBQ0o7WUFDRCxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDdEI7UUFDRCxPQUFPLEdBQUcsQ0FBQztLQUNkLENBQUM7Ozs7Ozs7Ozs7Ozs7SUFhRixJQUFJLHNCQUFzQixHQUFHLFNBQVMsR0FBRyxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUM7UUFDcEQsSUFBSSxNQUFNLEdBQUcsUUFBUSxLQUFLLEtBQUs7WUFDM0IsQ0FBQyxHQUFHLENBQUM7WUFDTCxRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQzs7UUFFekIsT0FBTyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7WUFDL0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRTtpQkFDakMsSUFBSSxNQUFNLENBQUM7Z0JBQ1osSUFBSSxDQUFDLEtBQUssUUFBUSxHQUFHLENBQUMsQ0FBQztvQkFDbkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztpQkFDekI7OztxQkFHSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssV0FBVyxFQUFFO29CQUNyRCxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2lCQUNuQjthQUNKO1lBQ0QsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3RCO1FBQ0QsT0FBTyxHQUFHLENBQUM7S0FDZCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztJQWlCRixJQUFJLFlBQVksR0FBRyxTQUFTLEdBQUcsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQztRQUNqRCxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7O1FBRTdCLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7O1FBR3hCLElBQUksR0FBRyxLQUFLLEdBQUcsQ0FBQztZQUNaLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCOzthQUVJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QixHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQzs7Z0JBRXBCLElBQUksR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxHQUFHLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxDQUFDOztnQkFFekUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRTthQUN4QjtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7O2FBRUksSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDcEIsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDbEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFO1lBQ25DLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNyQixJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVCLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7OztvQkFHZixJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDNUIsSUFBSSxHQUFHLFdBQVcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7cUJBQ3pDO29CQUNELElBQUksR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxHQUFHLGlCQUFpQixHQUFHLElBQUksQ0FBQyxDQUFDO29CQUNsRixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFO2lCQUN4QjthQUNKO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDZjs7UUFFRCxPQUFPLElBQUksQ0FBQztLQUNmLENBQUM7Ozs7Ozs7O0lBUUYsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLElBQUksQ0FBQztRQUM1QixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsSUFBSSxPQUFPLE1BQU0sS0FBSyxVQUFVLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFO1FBQ3RELE9BQU8sTUFBTSxDQUFDO0tBQ2pCLENBQUM7Ozs7Ozs7OztJQVNGLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxJQUFJLENBQUM7UUFDMUIsT0FBTyxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFVLENBQUM7S0FDL0MsQ0FBQzs7Ozs7Ozs7OztJQVVGLEtBQUssQ0FBQyxNQUFNLEdBQUcsU0FBUyxPQUFPLENBQUM7UUFDNUIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3BELENBQUM7Ozs7Ozs7Ozs7OztJQVlGLEtBQUssQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUUsSUFBSSxDQUFDO1FBQzVCLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDTCxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU07WUFDdEIsSUFBSSxDQUFDOzs7OztRQUtULElBQUksT0FBTyxJQUFJLEtBQUssT0FBTyxDQUFDO1lBQ3hCLElBQUksR0FBRyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQztnQkFDbEQsT0FBTyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3JEO2lCQUNJLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN4QztTQUNKOzthQUVJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMxQyxPQUFPLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDOUM7Ozs7UUFJRCxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ1YsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ1IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQzFEO1FBQ0QsT0FBTyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDbEQsQ0FBQzs7Ozs7Ozs7Ozs7OztJQWFGLEtBQUssQ0FBQyxHQUFHLEdBQUcsU0FBUyxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQztRQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ0wsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNO1lBQ3RCLElBQUk7WUFDSixHQUFHO1lBQ0gsSUFBSSxHQUFHLEtBQUssQ0FBQzs7Ozs7UUFLakIsSUFBSSxPQUFPLElBQUksS0FBSyxPQUFPLENBQUM7WUFDeEIsSUFBSSxHQUFHLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUNsRCxHQUFHLEdBQUcsc0JBQXNCLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3RELElBQUksSUFBSSxJQUFJLENBQUM7YUFDaEI7aUJBQ0ksSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLElBQUksSUFBSSxDQUFDO2FBQ2hCO1NBQ0o7YUFDSSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDMUMsR0FBRyxHQUFHLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQy9DLElBQUksSUFBSSxJQUFJLENBQUM7U0FDaEI7OztRQUdELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ1IsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDVixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7YUFDMUQ7WUFDRCxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzNDOzs7O1FBSUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUN4QztRQUNELE9BQU8sR0FBRyxLQUFLLEtBQUssQ0FBQztLQUN4QixDQUFDOzs7Ozs7Ozs7OztJQVdGLEtBQUssQ0FBQyxJQUFJLEdBQUcsU0FBUyxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQztRQUN0QyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7OztRQUdoQixJQUFJLFFBQVEsR0FBRyxTQUFTLElBQUksQ0FBQztZQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixHQUFHLENBQUMsU0FBUyxJQUFJLFNBQVMsS0FBSyxLQUFLLENBQUM7Z0JBQ2pDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDZixDQUFDO1FBQ0YsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDakMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQztLQUN6QyxDQUFDOzs7Ozs7Ozs7Ozs7O0lBYUYsSUFBSSxnQkFBZ0IsR0FBRyxTQUFTLFdBQVcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQztRQUMvRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLEVBQUUsTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDOztRQUU1RyxPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQixXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDcEMsSUFBSSxNQUFNLENBQUMsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxFQUFFO0tBQ25ELENBQUM7Ozs7Ozs7O0lBUUYsSUFBSSxnQkFBZ0IsR0FBRyxTQUFTLEdBQUcsQ0FBQztRQUNoQyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLEtBQUssT0FBTyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDOUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztTQUNiO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2pDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEdBQUcsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO0tBQzVCLENBQUM7Ozs7Ozs7Ozs7O0lBV0YsS0FBSyxDQUFDLFVBQVUsR0FBRyxTQUFTLE9BQU8sQ0FBQztRQUNoQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUM7WUFDakIsR0FBRyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1lBQ2hDLEtBQUssR0FBRyxFQUFFLENBQUM7U0FDZDtRQUNELElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQztZQUNuQixHQUFHLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFDcEMsS0FBSyxHQUFHLEVBQUUsQ0FBQztTQUNkO1FBQ0QsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDO1lBQ25CLEdBQUcsQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztZQUNwQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1NBQ2Q7UUFDRCxJQUFJLE9BQU8sT0FBTyxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUM7WUFDcEMsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztTQUNsQztRQUNELElBQUksT0FBTyxPQUFPLENBQUMsTUFBTSxLQUFLLFVBQVUsQ0FBQztZQUNyQyxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO1lBQzdCLElBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7O1lBRTFCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0QyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQ1gsZ0JBQWdCLEVBQUUsQ0FBQzthQUN0QjtpQkFDSTtnQkFDRCxpQkFBaUIsRUFBRSxDQUFDO2dCQUNwQixHQUFHLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztnQkFDekIsR0FBRyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7YUFDekI7WUFDRCxLQUFLLEdBQUcsRUFBRSxDQUFDO1NBQ2Q7UUFDRCxJQUFJLE9BQU8sT0FBTyxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUM7WUFDcEMsR0FBRyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsV0FBVyxFQUFFLENBQUM7S0FDakIsQ0FBQzs7Ozs7OztJQU9GLEtBQUssQ0FBQyxRQUFRLEdBQUcsU0FBUyxHQUFHLENBQUM7UUFDMUIsR0FBRyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDaEMsQ0FBQzs7Ozs7SUFLRixLQUFLLENBQUMsVUFBVSxHQUFHLFVBQVU7UUFDekIsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7S0FDdkIsQ0FBQzs7Ozs7SUFLRixLQUFLLENBQUMsV0FBVyxHQUFHLFVBQVU7UUFDMUIsR0FBRyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7S0FDeEIsQ0FBQzs7Ozs7OztJQU9GLEtBQUssQ0FBQyxRQUFRLEdBQUcsU0FBUyxHQUFHLENBQUM7UUFDMUIsR0FBRyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDN0IsQ0FBQzs7Ozs7SUFLRixLQUFLLENBQUMsVUFBVSxHQUFHLFVBQVU7UUFDekIsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7S0FDcEIsQ0FBQzs7Ozs7SUFLRixLQUFLLENBQUMsV0FBVyxHQUFHLFVBQVU7UUFDMUIsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7S0FDckIsQ0FBQzs7Ozs7Ozs7Ozs7SUFXRixLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsR0FBRyxFQUFFLEdBQUcsQ0FBQztRQUNoQyxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQzdCLElBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDMUIsR0FBRyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDO1lBQ1gsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEIsV0FBVyxFQUFFLENBQUM7U0FDakI7YUFDSTtZQUNELGlCQUFpQixFQUFFLENBQUM7WUFDcEIsV0FBVyxFQUFFLENBQUM7WUFDZCxHQUFHLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztZQUN6QixHQUFHLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztTQUN6QjtRQUNELEtBQUssR0FBRyxFQUFFLENBQUM7S0FDZCxDQUFDOzs7Ozs7OztJQVFGLEtBQUssQ0FBQyxXQUFXLEdBQUcsU0FBUyxHQUFHLENBQUM7UUFDN0IsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDbEIsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsV0FBVyxFQUFFLENBQUM7UUFDZCxLQUFLLEdBQUcsRUFBRSxDQUFDO0tBQ2QsQ0FBQzs7Ozs7Ozs7SUFRRixLQUFLLENBQUMsWUFBWSxHQUFHLFVBQVU7UUFDM0IsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztRQUM3QixJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQzFCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ25CLGlCQUFpQixFQUFFLENBQUM7UUFDcEIsV0FBVyxFQUFFLENBQUM7UUFDZCxHQUFHLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztRQUN6QixHQUFHLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztRQUN0QixLQUFLLEdBQUcsRUFBRSxDQUFDO0tBQ2QsQ0FBQzs7Ozs7OztJQU9GLEtBQUssQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLEdBQUcsQ0FBQztRQUN0QyxJQUFJLE9BQU8sR0FBRyxLQUFLLE9BQU8sSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztZQUMzQyxJQUFJLEdBQUcsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNySSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDakQsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsS0FBSyxHQUFHLEVBQUUsQ0FBQzthQUNkO2lCQUNJO2dCQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQzthQUNsRTtTQUNKO2FBQ0k7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7U0FDM0Q7S0FDSixDQUFDOzs7Ozs7O0lBT0YsS0FBSyxDQUFDLHNCQUFzQixHQUFHLFNBQVMsR0FBRyxDQUFDO1FBQ3hDLElBQUksT0FBTyxHQUFHLEtBQUssT0FBTyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQzNDLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNuRCxXQUFXLEVBQUUsQ0FBQztnQkFDZCxLQUFLLEdBQUcsRUFBRSxDQUFDO2FBQ2Q7aUJBQ0k7Z0JBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO2FBQ3BFO1NBQ0o7YUFDSTtZQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztTQUM3RDtLQUNKLENBQUM7Ozs7Ozs7SUFPRixLQUFLLENBQUMsZUFBZSxHQUFHLFNBQVMsR0FBRyxDQUFDO1FBQ2pDLElBQUksT0FBTyxHQUFHLEtBQUssT0FBTyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQzNDLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QyxXQUFXLEVBQUUsQ0FBQztnQkFDZCxLQUFLLEdBQUcsRUFBRSxDQUFDO2FBQ2Q7aUJBQ0k7Z0JBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO2FBQzdEO1NBQ0o7YUFDSTtZQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztTQUN0RDtLQUNKLENBQUM7Ozs7Ozs7SUFPRixLQUFLLENBQUMsYUFBYSxHQUFHLFNBQVMsR0FBRyxDQUFDO1FBQy9CLElBQUksT0FBTyxHQUFHLEtBQUssT0FBTyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQzNDLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQy9ILGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUMzQyxXQUFXLEVBQUUsQ0FBQztnQkFDZCxLQUFLLEdBQUcsRUFBRSxDQUFDO2FBQ2Q7aUJBQ0k7Z0JBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO2FBQzNEO1NBQ0o7YUFDSTtZQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztTQUNwRDtLQUNKLENBQUM7Ozs7Ozs7SUFPRixLQUFLLENBQUMsb0JBQW9CLEdBQUcsU0FBUyxHQUFHLENBQUM7UUFDdEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxPQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7WUFDM0MsSUFBSSxHQUFHLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDdEksZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2xELFdBQVcsRUFBRSxDQUFDO2dCQUNkLEtBQUssR0FBRyxFQUFFLENBQUM7YUFDZDtpQkFDSTtnQkFDRCxNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7YUFDbEU7U0FDSjthQUNJO1lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1NBQzNEO0tBQ0osQ0FBQzs7Ozs7OztJQU9GLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLEdBQUcsQ0FBQztRQUNsQyxJQUFJLE9BQU8sR0FBRyxLQUFLLE9BQU8sSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztZQUMzQyxJQUFJLEdBQUcsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNsSSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDOUMsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsS0FBSyxHQUFHLEVBQUUsQ0FBQzthQUNkO2lCQUNJO2dCQUNELE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQzthQUM5RDtTQUNKO2FBQ0k7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7U0FDdkQ7S0FDSixDQUFDOzs7Ozs7OztJQVFGLEtBQUssQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLEdBQUcsRUFBRSxNQUFNLENBQUM7UUFDOUMsSUFBSSxPQUFPLEdBQUcsS0FBSyxPQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksT0FBTyxNQUFNLEtBQUssT0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQy9GLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDekQsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsS0FBSyxHQUFHLEVBQUUsQ0FBQzthQUNkO2lCQUNJO2dCQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQzthQUNsRTtTQUNKO2FBQ0k7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7U0FDM0Q7S0FDSixDQUFDOzs7Ozs7OztJQVFGLEtBQUssQ0FBQyx1QkFBdUIsR0FBRyxTQUFTLEdBQUcsRUFBRSxNQUFNLENBQUM7UUFDakQsSUFBSSxPQUFPLEdBQUcsS0FBSyxPQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksT0FBTyxNQUFNLEtBQUssT0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQy9GLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDNUQsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsS0FBSyxHQUFHLEVBQUUsQ0FBQzthQUNkO2lCQUNJO2dCQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQzthQUNyRTtTQUNKO2FBQ0k7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7U0FDOUQ7S0FDSixDQUFDOzs7Ozs7OztJQVFGLEtBQUssQ0FBQyx1QkFBdUIsR0FBRyxTQUFTLEdBQUcsRUFBRSxNQUFNLENBQUM7UUFDakQsSUFBSSxPQUFPLEdBQUcsS0FBSyxPQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksT0FBTyxNQUFNLEtBQUssT0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQy9GLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDNUQsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsS0FBSyxHQUFHLEVBQUUsQ0FBQzthQUNkO2lCQUNJO2dCQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQzthQUNyRTtTQUNKO2FBQ0k7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7U0FDOUQ7S0FDSixDQUFDOzs7Ozs7OztJQVFGLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLEdBQUcsRUFBRSxNQUFNLENBQUM7UUFDMUMsSUFBSSxPQUFPLEdBQUcsS0FBSyxPQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksT0FBTyxNQUFNLEtBQUssT0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQy9GLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDckQsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsS0FBSyxHQUFHLEVBQUUsQ0FBQzthQUNkO2lCQUNJO2dCQUNELE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQzthQUM5RDtTQUNKO2FBQ0k7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7U0FDdkQ7S0FDSixDQUFDOzs7Ozs7OztJQVFGLEtBQUssQ0FBQyx3QkFBd0IsR0FBRyxTQUFTLEdBQUcsRUFBRSxNQUFNLENBQUM7UUFDbEQsSUFBSSxPQUFPLEdBQUcsS0FBSyxPQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksT0FBTyxNQUFNLEtBQUssT0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQy9GLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDN0QsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsS0FBSyxHQUFHLEVBQUUsQ0FBQzthQUNkO2lCQUNJO2dCQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQzthQUN0RTtTQUNKO2FBQ0k7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7U0FDM0Q7S0FDSixDQUFDOzs7Ozs7SUFNRixLQUFLLENBQUMsWUFBWSxHQUFHLFVBQVU7UUFDM0IsaUJBQWlCLEVBQUUsQ0FBQztRQUNwQixXQUFXLEVBQUUsQ0FBQztRQUNkLEtBQUssR0FBRyxFQUFFLENBQUM7S0FDZCxDQUFDOzs7SUFHRixpQkFBaUIsRUFBRSxDQUFDO0lBQ3BCLFdBQVcsRUFBRSxDQUFDOzs7SUFHZCxPQUFPLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7Q0FFeEMsQ0FBQyxBQUVGLEFBQTJCLDs7LDs7Iiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=