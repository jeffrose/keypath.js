'use strict';

import KeyPathExp from './keypath';
import Null from './null';

var cache = new Null();

/**
 * @callback kpCallback
 * @param {*} target
 * @param {*} [value]
 */

/**
 * A template literal tag for keypath processing.
 * @function
 * @param {external:Array<string>} literals
 * @param {external:Array} values
 * @returns {kpCallback}
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
    } else {
        values = [];
    }
    
    keypath = literals.length > 1 && !values.length ?
        literals.reduce( function( accumulator, part, index ){
            return accumulator + values[ index - 1 ] + part;
        } ) :
        literals[ 0 ],
    
    kpex = keypath in cache ?
        cache[ keypath ] :
        cache[ keypath ] = new KeyPathExp( keypath );
    
    return function( target, value ){
        var result;
        
        // Clear cache for the given keypath
        if( target === false && keypath in cache ){
            delete cache[ keypath ];
        
        // Execute keypath on target
        } else {
            result = arguments.length > 1 ?
                kpex.set( target, value ) :
                kpex.get( target );
        }
        
        return result;
    };
}

export { kp as default };
