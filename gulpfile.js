'use strict';

const gulp = require( 'gulp' ),
    babel = require( 'rollup-plugin-babel' ),
    benchmark = require( 'gulp-bench' ),
    buffer = require( 'vinyl-buffer' ),
    concat = require( 'gulp-concat' ),
    debug = require( 'gulp-debug' ),
    filter = require( 'gulp-filter' ),
    gutil = require( 'gulp-util' ),
    istanbul = require( 'gulp-istanbul' ),
    jsdoc = require( 'gulp-jsdoc-to-markdown' ),
    mocha = require( 'gulp-mocha' ),
    monitor = require( 'gulp-nodemon' ),
    rename = require( 'gulp-rename' ),
    rollup = require( 'rollup-stream' ),
    source = require( 'vinyl-source-stream' ),
    sourcemaps = require( 'gulp-sourcemaps' ),
    mergeStream = require( 'merge-stream' ),
    uglify = require( 'gulp-uglify' ),
    yargs = require( 'yargs' ),
    
    colors = gutil.colors,
    log = gutil.log,
    
    fgrep = yargs.argv.fgrep ?
        `**/*${ yargs.argv.fgrep }*.js` :
        '**',
    tgrep = yargs.argv.tgrep;

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
            entry: 'src/kp.js',
            format: 'umd',
            moduleName: 'kp',
            sourceMap: true
        } )
        .pipe( source( 'kp.js', 'src' ) )
        .pipe( buffer() )
        .pipe( sourcemaps.init( { loadMaps: true } ) )
        .pipe( rename( 'kp-umd.js' ) )
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
        
        // path-toolkit.js does not really need to be bundled
        // but it's easier to just reuse the code
        rollup( {
            entry: 'src/path-toolkit.js',
            format: 'umd',
            moduleName: 'PathToolkit',
            sourceMap: true
        } )
        .pipe( source( 'path-toolkit.js', 'src' ) )
        .pipe( buffer() )
        .pipe( sourcemaps.init( { loadMaps: true } ) )
        .pipe( rename( 'path-toolkit-umd.js' ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( 'dist' ) ),

        rollup( {
            entry: 'src/path-toolkit.js',
            format: 'umd',
            moduleName: 'PathToolkit',
            sourceMap: true
        } )
        .pipe( source( 'path-toolkit.js', 'src' ) )
        .pipe( buffer() )
        .pipe( uglify() )
        .pipe( sourcemaps.init( { loadMaps: true } ) )
        .pipe( rename( 'path-toolkit-min.js' ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( 'dist' ) )
    )
    .pipe( filter( fgrep ) )
    .pipe( debug( { title: 'Distributing' } ) )
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
    gulp.src( [ 'dist/*.js' ] )
        .pipe( filter( fgrep ) )
        .pipe( debug( { title: 'Testing' } ) )
        .pipe( istanbul() )
        .pipe( istanbul.hookRequire() )
        .on( 'finish', () => {
            gulp.src( [ 'test/*.js' ] )
                .pipe( filter( fgrep ) )
                .pipe( mocha( {
                    grep: tgrep
                } ) )
                .pipe( istanbul.writeReports( { reporters:[ 'html' ] } ) )
                .on( 'end', done );
        } );
} );

gulp.task( 'benchmark', [ 'dist' ], () => {
    return gulp.src( [ 'benchmark/*.js' ] )
        .pipe( filter( fgrep ) )
        .pipe( debug( { title: 'Benchmarking' } ) )
        .pipe( benchmark() )
        .pipe( gulp.dest( './benchmark' ) );
} );

gulp.task( 'monitor', [ 'dist' ], ( done ) => {
    var started = false;
    
    monitor( {
            script: 'app.js',
            args: [ '--fgrep', yargs.argv.fgrep ],
            watch: [ 'src', 'views', 'app.js' ],
            tasks: [ 'dist' ]
        } )
        .on( 'start', () => {
            // to avoid nodemon being started multiple times
            if( !started ){
                done();
                started = true; 
            } 
        } );
} );

gulp.task( 'default', [ 'path-toolkit-test', 'test' ] );
