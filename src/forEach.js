'use strict';

export default function forEach( arrayLike, callback ){
    let index = 0,
        length = arrayLike.length,
        item;
    
    for( ; index < length; index++ ){
        item = arrayLike[ index ];
        callback( item, index );
    }
}