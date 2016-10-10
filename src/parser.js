'use strict';

import KeyPathExp from './keypath';
import Null from './null';

const cache = new Null();

function Parser(){
    
}

Parser.prototype = new Null();

Parser.prototype.constructor = Parser;

Parser.prototype.get = function( keypath, target ){
    const kpex = keypath in cache ?
        cache[ keypath ] :
        cache[ keypath ] = new KeyPathExp( keypath );
    
    return kpex.get( target );
};

Parser.prototype.parse = function( keypath ){
    
};

Parser.prototype.tokenize = function( keypath ){
    
};

export { Parser as default };