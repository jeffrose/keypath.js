'use strict';

export default function typecast( string ){
    let value;
    
    if( string === null || string === 'null' ){
        value = null;
    } else if( string === 'true' ){
        value = true;
    } else if( string === 'false' ){
        value = false;
    } else if( string === undefined || string === 'undefined' ){
        value = undefined;
    } else if( string === '' || isNaN( string ) ){
        value = string;
    } else {
        value = parseFloat( string );
    }
    
    return value;
}