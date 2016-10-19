'use strict';

import Null from './null';

var Syntax = new Null();

Syntax.ArrayExpression       = 'ArrayExpression';
Syntax.CallExpression        = 'CallExpression';
Syntax.ExpressionStatement   = 'ExpressionStatement';
Syntax.Identifier            = 'Identifier';
Syntax.Literal               = 'Literal';
Syntax.MemberExpression      = 'MemberExpression';
Syntax.Program               = 'Program';
Syntax.SequenceExpression    = 'SequenceExpression';

Syntax.EvalExpression        = 'EvalExpression';
Syntax.LookupExpression      = 'LookupExpression';
Syntax.LookupOperator        = '%';
Syntax.RangeExpression       = 'RangeExpression';
Syntax.RangeOperator         = '..';

export { Syntax as default };