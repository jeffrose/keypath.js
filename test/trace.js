'use strict';

function printStatus( fn ){
    switch( %GetOptimizationStatus( fn ) ){
        case 1: console.log( chalk.green( 'Function is optimized' ) ); break;
        case 2: console.log( chalk.yellow( 'Function is not optimized' ) ); break;
        case 3: console.log( chalk.green( 'Function is always optimized' ) ); break;
        case 4: console.log( chalk.red(  'Function is never optimized' ) ); break;
        case 6: console.log( chalk.yellow( 'Function is maybe deoptimized' ) ); break;
        case 7: console.log( chalk.green( 'Function is optimized by TurboFan' ) ); break;
        default: console.log( chalk.blue( 'Unknown optimization status' ) ); break;
    }
}

const
    chalk = require( 'chalk' ),
    Builder     = require( '../dist/builder-umd' ),
    Interpreter = require( '../dist/interpreter-umd' ),
    Lexer       = require( '../dist/lexer-umd' ),
    
    lexer = new Lexer(),
    builder = new Builder( lexer ),
    interpreter = new Interpreter( builder ),
    
    path = 'foo.bar.qux.baz',
    data = {
        foo: {
            bar: {
                qux: {
                    baz: true
                }
            }
        }
    };

interpreter.compile( path );
interpreter.compile( path );

%OptimizeFunctionOnNextCall( interpreter.compile );

interpreter.compile( path );

console.log( chalk.bold( 'Interpreter#compile' ) );
printStatus( interpreter.compile );
