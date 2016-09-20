'use strict';

var chai        = require( 'chai' ),
    //sinon       = require( 'sinon' ),
    //sinon_chai  = require( 'sinon-chai' ),
    Builder     = require( '../src/builder' ),
    Lexer       = require( '../src/lexer' ),

    expect      = chai.expect;

//chai.use( sinon_chai );

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
                    "type": "CallExpression",
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
                                "type": "Literal",
                                "value": 100,
                                "raw": "100"
                            }
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "qux"
                        }
                    },
                    "arguments": [
                        {
                            "type": "Literal",
                            "value": 123,
                            "raw": "123"
                        },
                        {
                            "type": "Literal",
                            "value": "abc",
                            "raw": "\"abc\""
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
    
    it( 'should build an AST', function(){
        var lexer = new Lexer(),
            builder = new Builder( lexer ),
            program = builder.build( 'foo.bar[100].qux(123,"bleh").baz' ),
            bazExpression, expressionStatement;
            
        // foo.bar[100]qux(123,"bleh")baz
        
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