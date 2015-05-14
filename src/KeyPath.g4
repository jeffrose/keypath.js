grammar KeyPath;

DIRECTIVE : '%' NATURAL_NUMBER | '%' NAME;

INTEGER : '0' | NATURAL_NUMBER ;

NAME : [a-zA-Z_$]+ ;

NATURAL_NUMBER : [1-9] [0-9]* ;

PARAM : NAME | INTEGER | DIRECTIVE;

WHITESPACE : [ \t\n\r]+ -> skip ;

keypath : command command* ;

command : execute | iterate | traverse ;

// Arrays
iterate : NAME '[' (DIRECTIVE | INTEGER | '*') ']' ;

// Functions
execute : NAME '(' ')' | NAME '(' PARAM (',' PARAM)* ')' ;

// Objects
traverse : NAME ('.' | <EOF>) ;