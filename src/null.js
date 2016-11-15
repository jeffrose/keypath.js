/**
 * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
 * @class Null
 * @extends external:null
 */
export default function Null(){}
Null.prototype = Object.create( null );
Null.prototype.constructor =  Null;