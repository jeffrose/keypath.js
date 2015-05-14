grammar KeyPath;

//
// Tokens
//

// %1, %2, %foo, %bar
DIRECTIVE : '%' NATURAL_NUMBER | '%' NAME;

// 0, 1, 2, 3, 4...
INTEGER : '0' | NATURAL_NUMBER ;

// foo, $bar, _qux
NAME : [a-zA-Z_$]+ ;

// 1, 2, 3, 4...
NATURAL_NUMBER : [1-9] [0-9]* ;

PARAM : NAME | INTEGER | DIRECTIVE;

WHITESPACE : [ \t\n\r]+ -> skip ;

//
// Rules
//

// foo.bar.qux.100.baz
// foo.bar(%1)qux[100]baz
keypath : command command* ;

command : execute | iterate | traverse ;

// Arrays
// foo[ 100 ], bar[ * ], qux[ %last ]
iterate : NAME '[' (DIRECTIVE | INTEGER | '*') ']' ;

// Functions
// foo(), bar( qux ), baz( %1, %2 )
execute : NAME '(' ')' | NAME '(' PARAM (',' PARAM)* ')' ;

// Objects
// foo., bar, 100
traverse : (NAME | INTEGER) ('.' | <EOF>);