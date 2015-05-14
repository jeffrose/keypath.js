grammar KeyPath;

fragment NATURAL_NUMBER : [1-9] [0-9]* ;

INTEGER : '0' | NATURAL_NUMBER ;

NAME : [a-zA-Z_]+ ;

keypath : segment segment* ;

command : '@' NAME ;

segment : function | array | object ;

array : NAME '[' (command|keypath|INTEGER) ']' ;

function : NAME '(' ')' | NAME '(' param (',' param)* ')' ;

object : NAME ('.' | <EOF>) ;

param : (NAME|INTEGER)+ | var | keypath;

var : '%' NATURAL_NUMBER ;

WS :   [ \t\n\r]+ -> skip ;