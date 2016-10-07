'use strict';

import Null from '../null';
import Position from './position';

function SourceLocation( start, end ){
    if( !( start instanceof Position ) ){
        throw new TypeError( 'start must be a position' );
    }
    
    if( !( end instanceof Position ) ){
        throw new TypeError( 'end must be a position' );
    }
    
    this.source = null;
    this.start = start;
    this.end = end;
}

SourceLocation.prototype = new Null();

SourceLocation.prototype.constructor = SourceLocation;

SourceLocation.prototype.toJSON = function(){
    var json = new Null();
    
    json.start = this.start.toJSON();
    json.end = this.end.toJSON();
    
    return json;
};

SourceLocation.prototype.toString = function(){
    return this.start.toString() + ':' + this.end.toString();
};

export { SourceLocation as default };