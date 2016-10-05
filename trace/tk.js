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
    tk    = require( '../dist/tk-umd' ),
    
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

tk.get( data, path );
tk.get( data, path );

%OptimizeFunctionOnNextCall( tk.get );

tk.get( data, path );

console.log( chalk.bold( 'tk#get' ) );
printStatus( tk.get );

