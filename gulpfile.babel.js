'use strict';

import gulp from 'gulp';
import debug from 'gulp-debug';
import mocha from 'gulp-mocha';

gulp.task( 'test', function( done ){
    gulp.src( [ 'test/lexer.js', 'test/builder.js', 'test/compiler.js', 'test/interpreter.js' ] )
        .pipe( debug() )
        .pipe( mocha() )
        .on( 'end', done );
} );

gulp.task( 'default', [ 'test' ] );
