#!/usr/bin/env node

'use strict';

var express = require( 'express' ),
    http = require( 'http' ),
    yargs = require( 'yargs' ),
    
    app = express(),
    server = http.createServer( app ),
    fgrep = yargs.argv.fgrep;

app.set( 'view engine', 'jade' );
app.set( 'views', './views' );
app.locals.pretty = true;

app.get( '/', function( request, response ){
  response.render( fgrep, {
      file: `${ fgrep }-umd.js`
  } );
} );

app.use( express.static( 'dist' ) );
app.use( function( error, request, response, next ){
    response.status( error.status || 500 );
    response.render( 'error', {
        message: error.message,
        error: error
    } );
} );
 
server.listen( process.env.PORT || 3000, process.env.IP || 'localhost' );
server.on( 'listening', function(){
  console.log( 'Express server started on port %s at %s', server.address().port, server.address().address );
} );