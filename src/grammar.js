'use strict';

import Null from './null';

/**
 * @namespace Lexer~Grammar
 */
var Grammar = new Null();

Grammar.Identifier      = 'Identifier';
Grammar.NumericLiteral  = 'Numeric';
Grammar.NullLiteral     = 'Null';
Grammar.Punctuator      = 'Punctuator';
Grammar.StringLiteral   = 'String';

export { Grammar as default };