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

    switch( length ){
        case 0:
            break;
        case 1:
            result[ 0 ] = callback( list[ 0 ], 0, list );
            break;
        case 2:
            result[ 0 ] = callback( list[ 0 ], 0, list );
            result[ 1 ] = callback( list[ 1 ], 1, list );
            break;
        case 3:
            result[ 0 ] = callback( list[ 0 ], 0, list );
            result[ 1 ] = callback( list[ 1 ], 1, list );
            result[ 2 ] = callback( list[ 2 ], 2, list );
            break;
        default:
            for( ; index < length; index++ ){
                result[ index ] = callback( list[ index ], index, list );
            }
            break;
    }

    return result;
}