'use strict';

const gulp = require( 'gulp' ),
    benchmark = require( 'gulp-bench' ),
    buffer = require( 'vinyl-buffer' ),
    concat = require( 'gulp-concat' ),
    debug = require( 'gulp-debug' ),
    filter = require( 'gulp-filter' ),
    flatmap = require( 'gulp-flatmap' ),
    gutil = require( 'gulp-util' ),
    istanbul = require( 'gulp-istanbul' ),
    jsdoc = require( 'gulp-jsdoc-to-markdown' ),
    mocha = require( 'gulp-mocha' ),
    path = require( 'path' ),
    rollup = require( 'rollup-stream' ),
    size = require( 'gulp-size' ),
    source = require( 'vinyl-source-stream' ),
    sourcemaps = require( 'gulp-sourcemaps' ),
    yargs = require( 'yargs' ),

    colors = gutil.colors,
    log = gutil.log,

    fgrep = yargs.argv.fgrep ?
        `**/*${ yargs.argv.fgrep }*.js` :
        '**',
    tgrep = yargs.argv.tgrep;

gulp.task( 'dist', () => {
    var distributions = 'builder exp interpreter lexer path-toolkit tag transformer'.split( ' ' ).map( ( name ) => `**/${ name }.js` ),
        moduleNames = {
            builder     : 'KeypathBuilder',
            exp         : 'KeypathExp',
            interpreter : 'KeypathInterpreter',
            lexer       : 'KeypathLexer',
            'path-toolkit'  : 'PathToolkit',
            tag         : 'kp',
            transformer : 'KeypathTransformer'
        },
        dgrep = filter( distributions );

    return gulp.src( 'src/*.js' )
        .pipe( dgrep )
        .pipe( debug( { title: 'Distributing' } ) )
        .pipe( flatmap( ( stream, file ) => {
            var parsed = path.parse( file.path ),
                fileName = parsed.name,
                moduleName = moduleNames[ fileName ];

            return rollup( {
                entry: file.path,
                format: 'umd',
                moduleName: moduleName,
                sourceMap: true
            } )
            .pipe( source( parsed.base, parsed.dir ) )
            .pipe( buffer() )
            .pipe( sourcemaps.init( { loadMaps: true } ) )
            .pipe( sourcemaps.write() )
            .pipe( size( { title: fileName } ) );
        } ) )
        .pipe( gulp.dest( 'dist' ) );
} );

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

gulp.task( 'default', [ 'path-toolkit-test', 'test' ] );
