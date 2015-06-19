'use strict';

var chai        = require( 'chai' ),
    //sinon       = require( 'sinon' ),
    //sinon_chai  = require( 'sinon-chai' ),
    AST         = require( '../src/ast' ),
    Lexer       = require( '../src/lexer' ),

    expect      = chai.expect;

//chai.use( sinon_chai );

describe( 'AST', function(){
    var tree = {
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
    
    it( 'should parse', function(){
        var lexer = new Lexer(),
            ast = new AST( lexer );
        
        //console.log( lexer.lex( 'foo.bar.100.qux.baz' ) );
        try{
            var program = ast.ast( 'foo.bar[100]qux(123,%,"bleh")baz' );
            console.log( JSON.stringify( program ) );
        } catch( e ){
            console.log( 'Error', e );
        }
    } );
} );