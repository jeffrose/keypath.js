'use strict';

import Null from './null';

var KeyPathSyntax = new Null();

KeyPathSyntax.EvalExpression        = 'EvalExpression';
KeyPathSyntax.LookupExpression      = 'LookupExpression';
KeyPathSyntax.LookupOperator        = '%';
KeyPathSyntax.RangeExpression       = 'RangeExpression';
KeyPathSyntax.RangeOperator         = '..';

export { KeyPathSyntax as default };