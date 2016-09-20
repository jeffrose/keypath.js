'use strict';

import { default as forEach } from './forEach';
import { default as Null } from './null';

const noop = function(){};

function generate( body ){
    return `( function( object ){ return object.${ body }; } )();`;
}

function CompilerError( message ){
    SyntaxError.call( this, message );
    console.log( 'CompilerError', message );
}

CompilerError.prototype = Object.create( SyntaxError.prototype );

CompilerError.prototype.constructor = CompilerError;

export default function Compiler( builder ){
    this.builder = builder;
}

Compiler.prototype = new Null();

Compiler.prototype.constructor = Compiler;

Compiler.prototype.compile = function( expression ){
    var ast = this.builder.build( expression ),
        fn;
    
    this.recurse( ast, function( program ){
        fn = generate( program );
    } );
    
    console.log( fn );
    
    return new Function( fn );
};

Compiler.prototype.computedMember = function( left, right ){
    return `${ left }[${ right }]`;
};

Compiler.prototype.member = function( left, right, computed ){
    return computed ?
        this.computedMember( left, right ) :
        this.nonComputedMember( left, right );
};

Compiler.prototype.nonComputedMember = function( left, right ){
    return `${ left }.${ right }`;
};

Compiler.prototype.recurse = function( node, callback = noop ){
    let compiler = this,
        args;
        
    switch( node.type ){
        case 'CallExpression':
            args = [];
            compiler.recurse( node.callee, function( key ){
                forEach( node.args, function( arg ){
                    compiler.recurse( arg, function( value ){
                        args.push( value );
                    } );
                } );
                callback( `${ key }(${ args.join( ',' ) })` );
            } );
            break;
        case 'Identifier':
            callback( node.name );
            break;
        case 'Literal':
            callback( `"${ node.name }"` );
            break;
        case 'MemberExpression':
            compiler.recurse( node.object, function( key ){
                compiler.recurse( node.property, function( value ){
                    callback( compiler.member( key, value, node.computed ) );
                } );
            } );
            break;
        case 'Numeric':
            callback( node.name );
            break;
        case 'Program':
            // Not safe to forEach directly on ast.body
            forEach( node.body, function( statement ){
                compiler.recurse( statement.expression, function( expr ){
                    callback( expr );
                } );
            } );
            break;
        default:
            this.throwError( `Unknown node type ${ node.type }` );
            break;
    }
};

Compiler.prototype.throwError = function( message ){
    throw new CompilerError( message );
};