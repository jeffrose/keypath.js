'use strict';

var chai        = require( 'chai' ),
    //sinon       = require( 'sinon' ),
    //sinon_chai  = require( 'sinon-chai' ),
    Lexer     = require( '../src/lexer' ),

    expect      = chai.expect;

//chai.use( sinon_chai );

describe( 'Lexer', function(){
    var target = {
        foo: {
            bar: [
                {
                    qux: function( value ){
                        return {
                            baz: value
                        };
                    }
                },
                {
                    qux: function( value ){
                        return {
                            baz: value
                        };
                    }
                }
            ]
        }
    };
    
    it( 'should parse', function(){
        var lexer = new Lexer();
        
        //console.log( lexer.lex( 'foo.bar.100.qux.baz' ) );
        console.log( lexer.lex( 'foo.bar[100]qux(123,%,"bleh")baz' ) );
        
        /*var lexer = new Lexer( {
            traverse: function( word, char ){
                return /^[a-zA-Z0-9]+\.$/.test( word ) || char === undefined;
            }
        } );
        
        lexer.addRule( 'traverse', function( word, char ){
            return /^[a-zA-Z0-9]+\.$/.test( word ) || char === undefined;
        } );
        
        lexer.addRule( 'execute', function( word, char ){
            return char === '(';
        } );// /^[a-zA-Z]+\(.*\)$/ );
        
        lexer.addParser( 'execute', function( word, char ){
            var index = this.buffer.indexOf( ')', this.index ),
                value = this.buffer.substring( 0, index + 1 );
            
            console.log( 'EXECUTE', value );
            return value;
        } );
        
        lexer.addRule( 'iterate', /^[a-zA-Z]+\[.+\]$/ );
        
        lexer.on( 'traverse', function( token ){
            console.log( 'traverse', token );
        } );
        
        lexer.on( 'execute', function( token ){
            console.log( 'execute', token );
        } );
        
        lexer.on( 'iterate', function( token ){
            console.log( 'iterate', token );
        } );
        
        lexer.on( 'end', function(){
            console.log( 'END', arguments );
        } );
        
        lexer.on( 'finish', function(){
            console.log( 'FINISH', arguments );
        } );
        
        //console.log( lexer.lex( 'foo.bar.100.qux.baz' ) );
        lexer.lex( 'foo.bar[100]qux(123)baz' );
        
        lexer.flush();
        */
        
        //expect( keyPath.get( 'foo.bar.100.qux.baz' ) ).to.be.undefined;
        //expect( keyPath.get( 'foo.bar[100]qux(123)baz' ) ).to.equal( 123 );
    } );
} );