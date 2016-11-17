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
    var index = 0,
        length = list.length;

    switch( length ){
        case 0:
            break;
        case 1:
            callback( list[ 0 ], 0, list );
            break;
        default:
            for( ; index < length; index++ ){
                callback( list[ index ], index, list );
            }
            break;
    }
}