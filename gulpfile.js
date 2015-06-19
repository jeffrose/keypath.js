'use strict';

var gulp = require( 'gulp' ),
    debug = require( 'gulp-debug' ),
    mocha = require( 'gulp-mocha' );

gulp.task( 'test', function( done ){
    require( 'babel-core/register' )( {
        //ignore: /ee\.js\/dist\/ee$/
    } );

    gulp.src( [ 'test/**/*.js' ] )
        .pipe( debug() )
        .pipe( mocha() )
        .on( 'end', done );
} );

gulp.task( 'default', [ 'test' ] );
