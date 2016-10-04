'use strict';

var id = 0;

function nextId(){
    return ++id;
}

export { nextId as default };