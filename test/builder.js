'use strict';

var chai        = require( 'chai' ),
    Builder     = require( '../src/builder' ),
    Lexer       = require( '../src/lexer' ),

    expect      = chai.expect;

describe( 'Builder', function(){
    
var expected = {
    "type": "Program",
    "body": [
        {
            "type": "ExpressionStatement",
            "expression": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                    "type": "expression",
                    "callee": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                            "type": "MemberExpression",
                            "computed": true,
                            "object": {
                                "type": "MemberExpression",
                                "computed": false,
                                "object": {
                                    "type": "Identifier",
                                    "name": "foo"
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "bar"
                                }
                            },
                            "property": {
                                "type": "Numeric",
                                "name": 100
                            }
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "qux"
                        }
                    },
                    "arguments": [
                        {
                            "type": "Numeric",
                            "name": 123
                        },
                        {
                            "type": "Literal",
                            "name": "abc"
                        }
                    ]
                },
                "property": {
                    "type": "Identifier",
                    "name": "baz"
                }
            }
        }
    ]
};

    var lexer = new Lexer(),
        builder = new Builder( lexer ),
        expression, program;
    
    it( 'should parse call expressions', function(){
        program = builder.build( 'foo()' ),
        expression = program.body[ 0 ].expression;
        
        expect( expression.type ).to.equal( 'CallExpression' );
        expect( expression.callee.type ).to.equal( 'Identifier' );
        expect( expression.callee.name ).to.equal( 'foo' );
        expect( expression.arguments.length ).to.equal( 0 );
        
        program = builder.build( 'foo(123,456,789)' );
        expression = program.body[ 0 ].expression;

        expect( expression.type ).to.equal( 'CallExpression' );
        expect( expression.callee.type ).to.equal( 'Identifier' );
        expect( expression.callee.name ).to.equal( 'foo' );
        expect( expression.arguments.length ).to.equal( 3 );
        expect( expression.arguments[ 0 ].type ).to.equal( 'Literal' );
        expect( expression.arguments[ 0 ].value ).to.equal( 123 );
        expect( expression.arguments[ 1 ].type ).to.equal( 'Literal' );
        expect( expression.arguments[ 1 ].value ).to.equal( 456 );
        expect( expression.arguments[ 2 ].type ).to.equal( 'Literal' );
        expect( expression.arguments[ 2 ].value ).to.equal( 789 );
        
        program = builder.build( 'foo()()' );
        expression = program.body[ 0 ].expression;

        expect( expression.type ).to.equal( 'CallExpression' );
        expect( expression.callee.type ).to.equal( 'CallExpression' );
        expect( expression.arguments.length ).to.equal( 0 );
        expect( expression.callee.callee.type ).to.equal( 'Identifier' );
        expect( expression.callee.callee.name ).to.equal( 'foo' );
        expect( expression.callee.arguments.length ).to.equal( 0 );
        
        program = builder.build( '()' );
        expression = program.body[ 0 ].expression;

        expect( expression.type ).to.equal( 'CallExpression' );
        expect( expression.callee ).to.equal( null );
        expect( expression.arguments.length ).to.equal( 0 );
    } );

    it( 'should parse computed member expressions', function(){
        program = builder.build( 'foo[123]' ),
        expression = program.body[ 0 ].expression;
        
        expect( expression.type ).to.equal( 'MemberExpression' );
        expect( expression.computed ).to.equal( true );
        expect( expression.object.type ).to.equal( 'Identifier' );
        expect( expression.object.name ).to.equal( 'foo' );
        
        program = builder.build( 'foo[123][456]' ),
        expression = program.body[ 0 ].expression;
        
        expect( expression.type ).to.equal( 'MemberExpression' );
        expect( expression.computed ).to.equal( true );
        expect( expression.object.type ).to.equal( 'MemberExpression' );
        expect( expression.object.computed ).to.equal( true );
        expect( expression.object.object.type ).to.equal( 'Identifier' );
        expect( expression.object.object.name ).to.equal( 'foo' );
        expect( expression.object.property.type ).to.equal( 'Literal' );
        expect( expression.object.property.value ).to.equal( 123 );
        expect( expression.property.type ).to.equal( 'Literal' );
        expect( expression.property.value ).to.equal( 456 );
        
        program = builder.build( '["foo"]' ),
        expression = program.body[ 0 ].expression;
        
        expect( expression.type ).to.equal( 'MemberExpression' );
        expect( expression.computed ).to.equal( true );
        expect( expression.object ).to.equal( null );
        expect( expression.property.type ).to.equal( 'Literal' );
        expect( expression.property.value ).to.equal( 'foo' );
    } );
    
    it( 'should parse non-computed member expressions', function(){
        program = builder.build( 'foo.bar' ),
        expression = program.body[ 0 ].expression;
        
        expect( expression.type ).to.equal( 'MemberExpression' );
        expect( expression.computed ).to.equal( false );
        expect( expression.object.type ).to.equal( 'Identifier' );
        expect( expression.object.name ).to.equal( 'foo' );
        expect( expression.property.type ).to.equal( 'Identifier' );
        expect( expression.property.name ).to.equal( 'bar' );
        
        program = builder.build( 'foo()bar' ),
        expression = program.body[ 0 ].expression;
        
        expect( expression.type ).to.equal( 'MemberExpression' );
        expect( expression.computed ).to.equal( false );
        
        program = builder.build( '["foo"]bar' ),
        expression = program.body[ 0 ].expression;
        
        expect( expression.type ).to.equal( 'MemberExpression' );
        expect( expression.computed ).to.equal( false );
    } );

    it( 'should build an AST', function(){
        var program = builder.build( 'foo.bar[100]qux(123,"abc")baz' ),
            bazExpression, expressionStatement;
        
        //console.log( lexer.lex( 'foo.bar[0].qux(123,"bleh").baz' ) );
        
        // foo.bar[100]qux(123,"bleh")baz
        
        //expect( program.toJSON() ).to.deep.equal( expected );
        
        //console.log( program.body[ 0 ].expression.toJSON() );
        
        expect( program ).to.be.an( 'object' );
        expect( program.type ).to.equal( 'Program' );
        expect( program.body ).to.be.an( 'array' );
        
        expressionStatement = program.body[ 0 ];
        
        expect( expressionStatement ).to.be.an( 'object' );
        expect( expressionStatement.type ).to.equal( 'ExpressionStatement' );
        expect( expressionStatement.expression ).to.be.an( 'object' );
        
        bazExpression = expressionStatement.expression;
        
        expect( bazExpression ).to.be.an( 'object' );
        expect( bazExpression.type ).to.equal( 'MemberExpression' );
        expect( bazExpression.computed ).to.equal( false );
        expect( bazExpression.property ).to.be.an( 'object' );
        expect( bazExpression.property.type ).to.equal( 'Identifier' );
        expect( bazExpression.property.name ).to.equal( 'baz' );
        
        expect( expressionStatement ).to.have.deep.property( 'expression.object.type', 'CallExpression' );
        expect( expressionStatement ).to.have.deep.property( 'expression.object.callee.type', 'MemberExpression' );
        expect( expressionStatement ).to.have.deep.property( 'expression.object.callee.computed', false );
    } );
} );