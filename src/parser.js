'use strict';

import { default as Builder } from './builder';
import { default as Compiler } from './compiler';
import { default as Interpreter } from './interpreter';
import { default as Null } from './null';

export default function Parser( lexer, csp ){
    this.lexer = lexer;
    this.builder = new Builder( this.lexer );
    this.compiler = csp ?
        new Interpreter( this.builder ) :
        new Compiler( this.builder );
}

Parser.prototype = new Null();

Parser.prototype.constructor = Parser;

Parser.prototype.parse = function( text ){
    return this.compiler.compile( text );
};