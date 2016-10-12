'use strict';

import Null from '../null';

/**
 * @namespace Lexer~Grammar
 */
var Grammar = new Null();

Grammar.Identifier      = 'Identifier';
Grammar.NumericLiteral  = 'NumericLiteral';
Grammar.NullLiteral     = 'NullLiteral';
Grammar.Punctuator      = 'Punctuator';
Grammar.StringLiteral   = 'StringLiteral';

export { Grammar as default };