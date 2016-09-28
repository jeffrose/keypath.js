'use strict';

const gulp = require( 'gulp' ),
    babel = require( 'rollup-plugin-babel' ),
    benchmark = require( 'gulp-bench' ),
    buffer = require( 'vinyl-buffer' ),
    concat = require( 'gulp-concat' ),
    debug = require( 'gulp-debug' ),
    gutil = require( 'gulp-util' ),
    istanbul = require( 'gulp-istanbul' ),
    jsdoc = require( 'gulp-jsdoc-to-markdown' ),
    mocha = require( 'gulp-mocha' ),
    rename = require( 'gulp-rename' ),
    rollup = require( 'rollup-stream' ),
    source = require( 'vinyl-source-stream' ),
    sourcemaps = require( 'gulp-sourcemaps' ),
    mergeStream = require( 'merge-stream' ),
    yargs = require( 'yargs' ),
    
    colors = gutil.colors,
    log = gutil.log;

gulp.task( 'dist', /*[ 'docs' ],*/ () => mergeStream(
    
        rollup( {
            entry: 'src/keypath.js',
            format: 'umd',
            moduleName: 'KeyPathExp',
            sourceMap: true
        } )
        .pipe( source( 'keypath.js', 'src' ) )
        .pipe( buffer() )
        .pipe( sourcemaps.init( { loadMaps: true } ) )
        .pipe( rename( 'keypath-umd.js' ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( 'dist' ) ),
        
        rollup( {
            entry: 'src/interpreter.js',
            format: 'umd',
            moduleName: 'Interpreter',
            sourceMap: true
        } )
        .pipe( source( 'interpreter.js', 'src' ) )
        .pipe( buffer() )
        .pipe( sourcemaps.init( { loadMaps: true } ) )
        .pipe( rename( 'interpreter-umd.js' ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( 'dist' ) ),
        
        rollup( {
            entry: 'src/builder.js',
            format: 'umd',
            moduleName: 'Builder',
            sourceMap: true
        } )
        .pipe( source( 'builder.js', 'src' ) )
        .pipe( buffer() )
        .pipe( sourcemaps.init( { loadMaps: true } ) )
        .pipe( rename( 'builder-umd.js' ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( 'dist' ) ),
        
        rollup( {
            entry: 'src/lexer.js',
            format: 'umd',
            moduleName: 'Lexer',
            sourceMap: true
        } )
        .pipe( source( 'lexer.js', 'src' ) )
        .pipe( buffer() )
        .pipe( sourcemaps.init( { loadMaps: true } ) )
        .pipe( rename( 'lexer-umd.js' ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( 'dist' ) ),
        
        // tk.js does not really need to be bundled
        // but it's easier to just reuse the code
        rollup( {
            entry: 'src/tk.js',
            format: 'umd',
            moduleName: 'tk',
            sourceMap: true
        } )
        .pipe( source( 'tk.js', 'src' ) )
        .pipe( buffer() )
        .pipe( sourcemaps.init( { loadMaps: true } ) )
        .pipe( rename( 'tk-umd.js' ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( 'dist' ) )
    )
);

gulp.task( 'docs', () => {
    return gulp.src( [ 'index.js', 'src/**/*.js' ] )
        .pipe( concat( 'API.md' ) )
        .pipe( jsdoc() )
        .on( 'error', ( error ) => {
            log( colors.red( 'jsdoc failed' ), error.message );
        } )
        .pipe( gulp.dest( 'docs' ) );
} );

gulp.task( 'test', [ 'dist' ], ( done ) => {
    gulp.src( [ 'dist/keypath-umd.js' ] )
        .pipe( istanbul() )
        .pipe( istanbul.hookRequire() )
        .on( 'finish', () => {
            gulp.src( [ 'test/keypath.js' ], { read: false } )
                .pipe( debug() )
                .pipe( mocha( {
                    grep: yargs.argv.grep
                } ) )
                .pipe( istanbul.writeReports( { reporters:[ 'html' ] } ) )
                .on( 'end', done );
        } );
} );

gulp.task( 'test:lexer', [ 'dist' ], ( done ) => {
    gulp.src( [ 'dist/lexer-umd.js' ] )
        .pipe( istanbul() )
        .pipe( istanbul.hookRequire() )
        .on( 'finish', () => {
            gulp.src( [ 'test/lexer.js' ], { read: false } )
                .pipe( debug() )
                .pipe( mocha( {
                    grep: yargs.argv.grep
                } ) )
                .pipe( istanbul.writeReports( { reporters:[ 'html' ] } ) )
                .on( 'end', done );
        } );
} );

gulp.task( 'test:builder', [ 'dist' ], ( done ) => {
    gulp.src( [ 'dist/builder-umd.js' ] )
        .pipe( istanbul() )
        .pipe( istanbul.hookRequire() )
        .on( 'finish', () => {
            gulp.src( [ 'test/builder.js' ], { read: false } )
                .pipe( debug() )
                .pipe( mocha( {
                    grep: yargs.argv.grep
                } ) )
                .pipe( istanbul.writeReports( { reporters:[ 'html' ] } ) )
                .on( 'end', done );
        } );
} );

gulp.task( 'test:interpreter', [ 'dist' ], ( done ) => {
    gulp.src( [ 'dist/interpreter-umd.js' ] )
        .pipe( istanbul() )
        .pipe( istanbul.hookRequire() )
        .on( 'finish', () => {
            gulp.src( [ 'test/interpreter.js' ], { read: false } )
                .pipe( debug() )
                .pipe( mocha( {
                    grep: yargs.argv.grep
                } ) )
                .pipe( istanbul.writeReports( { reporters:[ 'html' ] } ) )
                .on( 'end', done );
        } );
} );

gulp.task( 'test-all', ( done ) => {
    gulp.src( [ 'test/lexer.js', 'test/builder.js', 'test/compiler.js', 'test/interpreter.js', 'test/keypath.js' ] )
        .pipe( debug() )
        .pipe( mocha( {
            grep: yargs.argv.grep
        } ) )
        .on( 'end', done );
} );

gulp.task( 'tk-test', [ 'dist' ], ( done ) => {
    gulp.src( [ 'dist/tk-umd.js' ] )
        .pipe( istanbul() )
        .pipe( istanbul.hookRequire() )
        .on( 'finish', () => {
            gulp.src( [ 'test/tk.js' ], { read: false } )
                .pipe( debug() )
                .pipe( mocha( {
                    grep: yargs.argv.grep
                } ) )
                .pipe( istanbul.writeReports( { reporters:[ 'html' ] } ) )
                .on( 'end', done );
        } );
} );

gulp.task( 'benchmark', [ 'dist' ], () => {
    return gulp.src( [ 'test/benchmark.js' ] )
        .pipe( benchmark() )
        .pipe( gulp.dest( './benchmark' ) );
} );

gulp.task( 'default', [ 'tk-test', 'test' ] );
