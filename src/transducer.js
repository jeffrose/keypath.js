'use strict';

import Null from './null';

export var protocols = new Null();

protocols.iterator = typeof Symbol !== 'undefined' ?
    Symbol.iterator :
    '@@iterator';

protocols.transducer = new Null();
protocols.transducer.init    = '@@transducer/init';
protocols.transducer.step    = '@@transducer/step';
protocols.transducer.reduced = '@@transducer/reduced';
protocols.transducer.result  = '@@transducer/result';
protocols.transducer.value   = '@@transducer/value';

export default function Transducer( xf ){
    this.xf = xf;
}

Transducer.prototype = new Null();

Transducer.prototype.constructor = Transducer;

Transducer.prototype[ protocols.transducer.init ] = function(){
    return this.xfInit();
};

Transducer.prototype[ protocols.transducer.step ] = function( value, input ){
    return this.xfStep( value, input );
};

Transducer.prototype[ protocols.transducer.result ] = function( value ){
    return this.xfResult( value );
};

Transducer.prototype.xfInit = function(){
    return this.xf[ protocols.transducer.init ]();
};

Transducer.prototype.xfStep = function( value, input ){
    return this.xf[ protocols.transducer.step ]( value, input );
};

Transducer.prototype.xfResult = function( value ){
    return this.xf[ protocols.transducer.result ]( value );
};