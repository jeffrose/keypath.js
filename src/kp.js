'use strict';

import KeyPathExp from './keypath';
import Null from './null';

var cache = new Null();

/**
 * @typedef {external:Function} KeyPathCallback
 * @param {*} target The object on which the keypath will be executed
 * @param {*} [value] The optional value that will be set at the keypath
 * @returns {*} The value at the end of the keypath or undefined if the value was being set
 */

/**
 * A template literal tag for keypath processing.
 * @function
 * @param {Array<external:string>} literals
 * @param {external:Array} values
 * @returns {KeyPathCallback}
 * @example
 * const object = { foo: { bar: { qux: { baz: 'fuz' } } } },
 *  getBaz = ( target ) => kp`foo.bar.qux.baz`( target );
 * 
 * console.log( getBaz( object ) ); // "fuz"
 */
function kp( literals/*, ...values*/ ){
    var keypath, kpex, values;
    
    if( arguments.length > 1 ){
        var index = 0,
            length = arguments.length - 1;
        
        values = new Array( length );
        
        for( ; index < length; index++ ){
            values[ index ] = arguments[ index + 1 ];
        }
        
        keypath = literals.reduce( function( accumulator, part, index ){
            return accumulator + values[ index - 1 ] + part;
        } );
    } else {
        values = [];
        keypath = literals[ 0 ];
    }
    
    kpex = keypath in cache ?
        cache[ keypath ] :
        cache[ keypath ] = new KeyPathExp( keypath );
    
    return function( target, value ){
        return arguments.length > 1 ?
            kpex.set( target, value ) :
            kpex.get( target );
    };
}

export { kp as default };
