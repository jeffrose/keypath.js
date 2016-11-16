/**
 * @typedef {external:Function} MapCallback
 * @param {*} item
 * @param {external:number} index
 */

/**
 * @function
 * @param {Array-Like} list
 * @param {MapCallback} callback
 */
export default function map( list, callback ){
    var index = 0,
        length = list.length,
        result = new Array( length );

    for( ; index < length; index++ ){
        result[ index ] = callback( list[ index ], index, list );
    }

    return result;
}