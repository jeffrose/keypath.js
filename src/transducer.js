'use strict';

import Null from './null';

export var protocol = new Null();

protocol.init    = '@@transducer/init';
protocol.step    = '@@transducer/step';
protocol.reduced = '@@transducer/reduced';
protocol.result  = '@@transducer/result';
protocol.value   = '@@transducer/value';

/**
 * @class Transducer
 * @extends Null
 * @param {external:Function} xf
 */
export function Transducer( xf ){
    this.xf = xf;
}

Transducer.prototype = new Null();

Transducer.prototype.constructor = Transducer;

/**
 * @function Transducer#@@transducer/init
 */
Transducer.prototype[ protocol.init ] = function(){
    return this.xfInit();
};

/**
 * @function Transducer#@@transducer/step
 */
Transducer.prototype[ protocol.step ] = function( value, input ){
    return this.xfStep( value, input );
};

/**
 * @function Transducer#@@transducer/result
 */
Transducer.prototype[ protocol.result ] = function( value ){
    return this.xfResult( value );
};

/**
 * @function
 */
Transducer.prototype.xfInit = function(){
    return this.xf[ protocol.init ]();
};

/**
 * @function
 */
Transducer.prototype.xfStep = function( value, input ){
    return this.xf[ protocol.step ]( value, input );
};

/**
 * @function
 */
Transducer.prototype.xfResult = function( value ){
    return this.xf[ protocol.result ]( value );
};