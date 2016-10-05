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
    Lexer       = require( '../dist/lexer-umd' ),
    
    lexer = new Lexer(),
    builder = new Builder( lexer ),
    
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

builder.build( path );
builder.build( path );

%OptimizeFunctionOnNextCall( builder.build );
%OptimizeFunctionOnNextCall( builder.consume );
%OptimizeFunctionOnNextCall( builder.expect );
%OptimizeFunctionOnNextCall( builder.expression );
%OptimizeFunctionOnNextCall( builder.expressionStatement );
%OptimizeFunctionOnNextCall( builder.identifier );
%OptimizeFunctionOnNextCall( builder.memberExpression );
%OptimizeFunctionOnNextCall( builder.peek );
%OptimizeFunctionOnNextCall( builder.peekAt );
%OptimizeFunctionOnNextCall( builder.program );

builder.build( path );

console.log( chalk.bold( 'Builder#build' ) );
printStatus( builder.build );

console.log( chalk.bold( 'Builder#consume' ) );
printStatus( builder.consume );

console.log( chalk.bold( 'Builder#expect' ) );
printStatus( builder.expect );

console.log( chalk.bold( 'Builder#expression' ) );
printStatus( builder.expression );

console.log( chalk.bold( 'Builder#expressionStatement' ) );
printStatus( builder.expressionStatement );

console.log( chalk.bold( 'Builder#identifier' ) );
printStatus( builder.identifier );

console.log( chalk.bold( 'Builder#memberExpression' ) );
printStatus( builder.memberExpression );

console.log( chalk.bold( 'Builder#peek' ) );
printStatus( builder.peek );

console.log( chalk.bold( 'Builder#peekAt' ) );
printStatus( builder.peekAt );

console.log( chalk.bold( 'Builder#program' ) );
printStatus( builder.program );
