'use strict';

import Null from './null';
import Lexer from './lexer';
import Builder from './builder';
import Interpreter from './interpreter';

const lexer = new Lexer(),
    builder = new Builder( lexer ),
    intrepreter = new Interpreter( builder );

export default function KeyPathExp( pattern, flags ){
    Object.defineProperty( this, 'value', {
        value: intrepreter.compile( pattern ),
        configurable: false,
        enumerable: false,
        writable: false
    } );
}

KeyPathExp.prototype = new Null();

KeyPathExp.prototype.constructor = KeyPathExp;

KeyPathExp.prototype.exec = function( target ){
    
};