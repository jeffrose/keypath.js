'use strict';

/**
 * @typedef {external:Function} ForEachCallback
 * @param {*} item
 * @param {external:number} index
 */

/**
 * @function
 * @param {Array-Like} list
 * @param {ForEachCallback} callback
 */
function forEach( list, callback ){
    /*
    var index = 0,
        length = list.length,
        item;
    
    for( ; index < length; index++ ){
        item = list[ index ];
        callback( item, index );
    }
    */
    var index = list.length,
        item;
    
    while( index-- ){
        item = list[ index ];
        callback( item, index );
    }
}

export { forEach as default };