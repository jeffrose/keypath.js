'use strict';

import Null from '../null';

function Position( line, column ){
    if( typeof line !== 'number' || line < 1 ){
        throw new TypeError( 'line must be a positive number' );
    }
    
    if( typeof column !== 'number' || column < 0 ){
        throw new TypeError( 'column must be a positive number or 0' );
    }
    
    this.line = line;
    this.column = column;
}

Position.prototype = new Null();

Position.prototype.constructor = Position;

Position.prototype.toJSON = function(){
    var json = new Null();
    
    json.line = this.line;
    json.column = this.column;
    
    return json;
};

Position.prototype.toString = function(){
    return this.line + ',' + this.column;
};

export { Position as default };