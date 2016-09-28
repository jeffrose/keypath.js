'use strict';

var chai        = require( 'chai' ),
    Builder     = require( '../dist/builder-umd' ),
    Interpreter = require( '../dist/interpreter-umd' ),
    Lexer       = require( '../dist/lexer-umd' ),

    expect      = chai.expect;

/*
RECURSE { [Number: 7]
  id: 7,
  type: 'MemberExpression',
  object: 
   { [Number: 6]
     id: 6,
     type: 'MemberExpression',
     object: 
      { [Number: 5]
        id: 5,
        type: 'MemberExpression',
        object: [Object],
        property: [Object],
        computed: true },
     property: { [Number: 2] id: 2, type: 'Literal', value: 'qux' },
     computed: true },
  property: { [Number: 1] id: 1, type: 'Literal', value: 'baz' },
  computed: true }
RECURSE { [Number: 6]
  id: 6,
  type: 'MemberExpression',
  object: 
   { [Number: 5]
     id: 5,
     type: 'MemberExpression',
     object: { [Number: 4] id: 4, type: 'Identifier', name: 'foo' },
     property: { [Number: 3] id: 3, type: 'Literal', value: 'bar' },
     computed: true },
  property: { [Number: 2] id: 2, type: 'Literal', value: 'qux' },
  computed: true }
RECURSE { [Number: 5]
  id: 5,
  type: 'MemberExpression',
  object: { [Number: 4] id: 4, type: 'Identifier', name: 'foo' },
  property: { [Number: 3] id: 3, type: 'Literal', value: 'bar' },
  computed: true }
RECURSE { [Number: 4] id: 4, type: 'Identifier', name: 'foo' }
RECURSE { [Number: 3] id: 3, type: 'Literal', value: 'bar' }
RECURSE { [Number: 2] id: 2, type: 'Literal', value: 'qux' }
RECURSE { [Number: 1] id: 1, type: 'Literal', value: 'baz' }
*/

describe( 'Interpreter', function(){

    describe( 'interpreter', function(){
        var lexer = new Lexer(),
            builder = new Builder( lexer ),
            interpreter = new Interpreter( builder );
        
        it( 'should compile member expressions', function(){
            var data = { foo: { bar: { qux: { baz: true } } } },
                fn;
            
            fn = interpreter.compile( 'foo.bar.qux.baz' );
            expect( fn( data ) ).to.equal( true );
            
            console.log( '------------------------' );
            
            fn = interpreter.compile( 'foo["bar"]["qux"]["baz"]' );
            expect( fn( data ) ).to.equal( true );
            
            console.log( '------------------------' );
            
            fn = interpreter.compile( '["foo"]["bar"]["qux"]["baz"]' );
            expect( fn( data ) ).to.equal( true );
        } );
        
        it( 'should compile an expression', function(){
            var fn = interpreter.compile( 'foo[1,2]bar' ),
                object = {
                    foo: [ { bar: 'a' }, { bar: 'b' }, { bar: 'c' }, { bar: 'd' } ]
                };
            
            expect( fn ).to.be.a( 'function' );
            
            console.log( fn( object ) );
        } );
        
        xit( 'should create', function(){
            var fn = interpreter.compile( 'foo[0]baz' ),
                empty = {};
            
            fn( empty, 'EMPTY' );
            //console.log( 'GET' );
            //console.log( fn( empty ) );
        } );
    } );
} );