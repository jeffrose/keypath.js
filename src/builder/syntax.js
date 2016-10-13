'use strict';

import Null from '../null';

var Syntax = new Null();

Syntax.ArrayExpression       = 'ArrayExpression';
Syntax.CallExpression        = 'CallExpression';
Syntax.ExpressionStatement   = 'ExpressionStatement';
Syntax.Identifier            = 'Identifier';
Syntax.Literal               = 'Literal';
Syntax.MemberExpression      = 'MemberExpression';
Syntax.LookupExpression      = 'LookupExpression';
Syntax.LookupOperator        = '%';
Syntax.Program               = 'Program';
Syntax.RangeExpression       = 'RangeExpression';
Syntax.RangeOperator         = '..';
Syntax.SequenceExpression    = 'SequenceExpression';

export { Syntax as default };