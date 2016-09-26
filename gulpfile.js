'use strict';

const gulp = require( 'gulp' ),
    babel = require( 'rollup-plugin-babel' ),
    benchmark = require( 'gulp-bench' ),
    buffer = require( 'vinyl-buffer' ),
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
    
    colors = gutil.colors,
    log = gutil.log;

gulp.task( 'dist', [ 'docs' ], () => mergeStream(
    
        rollup( {
            entry: 'src/keypath.js',
            format: 'umd',
            moduleName: 'KeyPathExp',
            sourceMap: true,
            plugins: [
                babel( {
                    exclude: 'node_modules/**',
                    presets: [ 'es2015-rollup' ]
                } )
            ]
        } )
        .pipe( source( 'keypath.js', 'src' ) )
        .pipe( buffer() )
        .pipe( sourcemaps.init( { loadMaps: true } ) )
        .pipe( rename( 'keypath-umd.js' ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( 'dist' ) ),
        
        // tk.js does not really need to be bundled
        // but it's easier to just reuse the code
        rollup( {
            entry: 'src/tk.js',
            format: 'umd',
            moduleName: 'tk',
            sourceMap: true,
            plugins: [
                babel( {
                    exclude: 'node_modules/**',
                    presets: [ 'es2015-rollup' ]
                } )
            ]
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
    return gulp.src( [ 'index.js', 'src/**.js' ] )
        .pipe( jsdoc() )
        .on( 'error', ( error ) => {
            log( colors.red( 'jsdoc failed' ), error.message );
        } )
        .pipe( rename( {
            //basename: 'API',
            extname: '.md'
        } ) )
        .pipe( gulp.dest( 'docs' ) );
} );

gulp.task( 'test', [ 'dist' ], ( done ) => {
    gulp.src( [ 'dist/keypath-umd.js' ] )
        .pipe( istanbul() )
        .pipe( istanbul.hookRequire() )
        .on( 'finish', () => {
            gulp.src( [ 'test/keypath.js' ], { read: false } )
                .pipe( debug() )
                .pipe( mocha() )
                .pipe( istanbul.writeReports() )
                .on( 'end', done );
        } );
} );

gulp.task( 'test-all', ( done ) => {
    gulp.src( [ 'test/lexer.js', 'test/builder.js', 'test/compiler.js', 'test/interpreter.js', 'test/keypath.js' ] )
        .pipe( debug() )
        .pipe( mocha() )
        .on( 'end', done );
} );

gulp.task( 'tk-test', ( done ) => {
    gulp.src( [ 'test/tk.js' ] )
        .pipe( debug() )
        .pipe( mocha() )
        .on( 'end', done );
} );

gulp.task( 'benchmark', [ 'dist' ], () => {
    return gulp.src( [ 'test/benchmark.js' ] )
        .pipe( benchmark() )
        .pipe( gulp.dest( './benchmark' ) );
} );

gulp.task( 'default', [ 'tk-test', 'test' ] );
