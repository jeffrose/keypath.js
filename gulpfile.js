'use strict';

var System = require( 'systemjs' );

System.config( {
    babelOptions: {
        ignore: false
    },
    map: {
        'bower:'    : 'bower_components/*.js',
        'npm:'      : 'node_modules/*.js'
    },
    paths: {
        'babel'     : 'npm:babel-core/browser'
    },
    transpiler: 'babel'
} );

var gulp = require( 'gulp' ),
    debug = require( 'gulp-debug' ),
    mocha = require( 'gulp-mocha' );

gulp.task( 'test', function( done ){
    require( 'babel/register' )( {
        ignore: false
    } );
    
    gulp.src( [ 'test/**/*.js' ] )
        .pipe( debug() )
        .pipe( mocha() )
        .on( 'end', done );
} );

gulp.task( 'default', [ 'test' ] );