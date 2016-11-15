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
export default function forEach( list, callback ){
    var index = list.length,
        item;

    while( index-- ){
        item = list[ index ];
        callback( item, index );
    }
}