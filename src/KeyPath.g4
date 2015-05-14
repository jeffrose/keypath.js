grammar KeyPath;

NAME : [a-zA-Z_]+ ;

NATURAL_NUMBER : [1-9] [0-9]* ;

WILDCARD : '*' ;

WHITESPACE : [ \t\n\r]+ -> skip ;

keypath : segment segment* ;

directive : '@' NAME ;

segment : function | array | object ;

array : NAME '[' (directive | keypath | integer | WILDCARD) ']' ;

function : NAME '(' ')' | NAME '(' param (',' param)* ')' ;

integer : '0' | NATURAL_NUMBER ;

object : (NAME | WILDCARD) ('.' | <EOF>) ;

param : (NAME | integer)+ | var | keypath;

var : '%' NATURAL_NUMBER ;