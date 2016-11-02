'use strict';

var _hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * @function
 * @param {*} object
 * @param {external:string} property
 */
export default function hasOwnProperty( object, property ){
    return _hasOwnProperty.call( object, property );
}