'use strict';

export default function Null(){}
Null.prototype = Object.create( null );
Null.prototype.constructor =  Null;