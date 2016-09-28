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

export { Parser as default };