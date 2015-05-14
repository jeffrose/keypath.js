grammar KeyPath;

NAME : [a-zA-Z_]+ ;

NATURAL_NUMBER : [1-9] [0-9]* ;

WILDCARD : '*' ;

keypath : segment segment* ;

command : '@' NAME ;

segment : function | array | object ;

array : NAME '[' (command | keypath | integer | WILDCARD) ']' ;

function : NAME '(' ')' | NAME '(' param (',' param)* ')' ;

integer : '0' | NATURAL_NUMBER ;

object : (NAME | WILDCARD) ('.' | <EOF>) ;

param : (NAME | integer)+ | var | keypath;

var : '%' NATURAL_NUMBER ;

WS :   [ \t\n\r]+ -> skip ;