# tk
The tk keypath interpreter supports dot notation ('foo.bar.2') for object/array property lookup. It also supports relative paths, referencing other property values as a key within a path, function calls (with arguments), numbered placeholders within keypaths, wildcard paths, collections, and escaped keypaths. In addition, the operators in the interpreter may be configured if, for example, it's more convenient to use : instead of . as the separator.

## Examples
### get
```javascript
var val1 = tk.get(obj, path);
var val2 = tk.get(obj, path, arg1, arg2,..., argN);
```

If the keypath is invalid or does not exist within the target object, `get` returns `undefined`. The `get` function will short circuit and return as soon as `undefined` is detected to prevent unexpected object reference exceptions.

Simple keypaths with dot notation and no special operators are optimally executed in standalone code for high performance.
```javascript
var data = {
    foo: {
        bar: ['a','b','c']
    }
};
tk.get(data, 'foo.bar.2'); // 'c'
```

Object properties and array indices may be indicated with `[]`. Any text inside the brackets will be treated as a literal and no further syntax evaluation will be done on that text. This is one of several ways to safely include a property with reserved keypath characters inside. Use of the separator character (`.` by default) is optional adjacent to the `[]` container.
```javascript
var data = {
    foo: {
        bar: ['a','b','c'],
        'abc.xyz': 12
    }
};
tk.get(data, 'foo.[bar].2'); // 'c'
tk.get(data, 'foo[bar]2'); // 'c'
tk.get(data, 'foo[bar][2]'); // 'c'
tk.get(data, 'foo[abc.xyz]'); // 12
```

Collections are implemented with `,`.
```javascript
var data = {
    foo: {
        bar: ['a','b','c']
    }
};
tk.get(data, 'foo.bar.0,2'); // ['a', 'c']
```

Functions may be called with `()`.
```javascript
var data = {
    foo: {
        bar: ['a','b','c']
    }
};
tk.get(data, 'foo.bar.2,0.sort()'); // ['a', 'c']
tk.get(data, 'foo.bar.2,0.sort().0'); // 'a'
```

Indirect property references are implemented with `{}`. Use of these can be confusing at times, and they don't work quite the same way as the javascript `[]` object property operator. A `{}` container is expected to contain a valid keypath. This keypath is interpreted from the context of the evaluated value at that point in the keypath, and the result is **then** interpreted as the property of the preceding path. Once the sub-keypath has been evaluated, the context is returned to the evaluation point before proceeding. Here are some examples to illustrate.
```javascript
var data = {
    foo: {
        bar: ['a','b','c'],
        a: 'one',
        b: 'two'
    }
};
tk.get(data, 'foo.bar.0'); // 'a'
tk.get(data, 'foo.a'); // 'one'
// Use the value at "foo.bar.0" as a property of "foo"...
tk.get(data, 'foo{bar.0}'); // 'one'
tk.get(data, 'foo{bar.0,2.sort().0}'); // 'one'
```

Object context can be shifted upwards using prefixes `<` for 'parent' and `~` for 'root'. These prefixes apply in the base keypath as well as internal sub-keypaths.
```javascript
var data = {
    foo: {
        bar: ['a','b','c'],
        a: 'one',
        b: 'two'
    }
};
tk.get(data, 'foo.bar.0'); // 'a'
tk.get(data, 'foo.a'); // 'one'
tk.get(data, 'foo.bar.<a'); // 'one'
tk.get(data, 'foo.bar.~foo.bar.0'); // 'a'
```

Numbered placeholders, indicated with `%n`, are supported as extra arguments to `get`. By numbering the placeholders according to their place in the args list, these values may be used in multiple places within the keypath. Using placeholders is another way to include string values which may contain reserved keypath characters since the placeholder values are not interpreted further; they are used as-is. **The numbering sequence begins at 1.**
```javascript
var data = {
    foo: {
        bar: ['a','b','c'],
        a: 'one',
        b: 'two'
    }
};
tk.get(data, 'foo.bar.0'); // 'a'
tk.get(data, 'foo.%1.%2', 'bar', (2-2)); // 'a'
tk.get(data, 'foo{%1.0,%1.1', 'bar'); // ['one','two']
tk.get(data, 'foo.bar.~foo.bar.0'); // 'a'
```

### set
```javascript
var result1 = tk.set(obj, path, newVal);
var result2 = tk.set(obj, path, newVal, arg1, arg2,..., argN);
```

Any property specified in a keypath may be set to a new value. The set function returns the newValue if the set was successful, `undefined` if not. Only the final property in the keypath may be set - any intermediate properties must be defined and valid or `set` will fail. The final property does not need to exist prior to `set`, it will be created if necessary. This behavior is equivalent to setting an object property in plain javascript code.

All keypaths that are valid for `get` will behave in the same way for `set`. One special case is worth noting: If the final path segment is a collection, then every property in that collection will be set to the new value.
```javascript
var data = {
    foo: {
        bar: ['a','b','c']
    }
};
tk.set(data, 'foo.bar.0,1', 'xxx'); // 'xxx'
tk.get(data, 'foo.bar.0,1,2'); // ['xxx', 'xxx', 'c']
```

### find
```javascript
var path = tk.find(obj, val); // first found path to value
var allPaths = tk.find(obj, val, 'all'); // all paths to value
```

Does a seep scan through the data object, executing a `===` test on each node against the provided value. If the equals test returns true, the path is returned. By default, only one path is returned and the `find` function aborts as soon as it succeeds. If the last argument is 'all', `find` will scan the full object and return all paths with matching values.

**Note:** Object keys will be iterated in an unpredictable order, so if the same value is found in more than one place in the object, the default execution of `find` may not always return the same path as a result.

```javascript
var data = {
    foo: {
        bar: ['a','b','c']
    },
    xyz: 'b'
};
tk.find(data, 'b'); // either 'foo.bar.1' or 'xyz'
tk.find(data, 'b', 'all'); // ['foo.bar.1','xyz'] with array order unknown
```

### setOptions
```javascript
tk.setOptions(opts);
```

Sets new operator characters for path interpretation. Can also be used to govern caching. For any path beyond the simple case (see `get` above), a tokenizing function parses the path before it is resolved. By default, the results of the tokenizing function are cached so repeated calls for the same path string can skip the tokenizing step. This cache behavior can be disabled with the `setOptions` function. The operator characters come in three categories: separators, prefixes, and containers. Any or all of these may be set when calling `setOptions`, the function will simply overwrite the existing values with whatever is found in the provided options object. The default options are:

```javascript
{
    cache: true,
    separators: {
        '.': {
            'exec': 'property'
            },
        ',': {
            'exec': 'collection'
            }
    },
    prefixes: {
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
    containers: {
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
            'exec': 'evalProperty'
            }
    }
}
```

When dealing with data where these operators appear frequently, it may be convenient to switch to new operators that don't conflict with the data.

**Note:** Setting a new option for a different separator, for example, only adds the new separator. It does **not** disable the existing one. To disable a special character, set it with an empty value.

```javascript
tk.setOptions({
    separators: {
        '.': {},
        '|': {
            'exec': 'property'
        }
    });
```

### escape
```javascript
var str = 'John Q. Doe';
var escapedPathSegment = tk.escape(str);
tk.get(data, ['people', escapedPathSegment, 'address'].join('.'));
```

The path interpreter supports escaped characters using backslash (`\`). This is another way to deal with data where operators may be present in the data object as property names. For example, an object that uses full names as keys may include `.` or an object using phone numbers as keys may include `()`. By pre-processing the path segment with `escape`, these operators will all be prepended with `\`, making the path safe for execution.

**Important:** Do **not** execute `escape` on your full keypath, since it will escape all the separators (`.`), turning your keypath into a single property name. This function is meant to be executed on only a single keypath segment, and is most useful when building a keypath dynamically using unknown values.

The `escape` function will obey whatever characters are currently defined as operators at the time of execution. If using non-standard operators, simply call `setOptions` before executing `escape` to make sure `escape` is looking for the correct operators.

### isValid
```javascript
var bool = tk.isValid(keypath);
```

Returns a boolean value: true if the keypath is syntactically valid, false if not. This `isValid` does not take a data object; it does not test whether the keypath exists in an object. It merely evaluates the syntax and indicates if it is improper. This can help when dynamically building a keypath or using complex nested structures. `isValid` will identify mismatched containers and a keypath that ends in `\`, with no characters following to escape.

### getTokens
```javascript
var tokens = tk.getTokens(keypath);
```

Returns the tokenized object representing the keypath. This tokens object may be used when calling `get` or `set` in place of a string keypath. When used, those functions will skip the tokenizing step. `getTokens` may be used to pre-compile a keypath for later use, making the `get` and `set` functions slightly more efficient for some keypaths.

**Note** The simple case keypaths (see `get`) should **not** be pre-compiled, since this will prevent `get` and `set` from being able to use the optimized code for that class of keypaths. If any operator character is present other than the separator (`.` by default, see `setOptions`), or `*` or `/`, then the path is considered 'complex' and may benefit from pre-compilation. If none of these characters are present in the keypath then `getTokens` should **not** be used. The simple vs. complex test does account for custom separator characters, so it is safe to re-define the separator without sacrificing performance.
