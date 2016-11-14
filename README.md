# Keypath Expression

> A high performance keypath resolver.

## Installation

### Git

`git clone https://github.com/jeffrose/keypath-exp keypath-exp`

### NPM

`npm install keypath-exp`

### Bower

`bower install keypath-exp`

## Documentation

* [API](docs/API.md)
*

## Usage

```javascript
const KeypathExp = require( 'keypath-exp' ),
    data = {
        foo: [
            { bar: 12 }
            { bar: 34 }
            { bar: 56 }
            { bar: 78 }
            { bar: 90 }
        ]
    },
    kpex = new KeypathExp( 'foo[0..2]bar' ),

    result = kpex.get( data );

console.log( result ); // [ 12, 34, 56 ]
```