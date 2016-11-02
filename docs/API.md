## Classes

<dl>
<dt><a href="#Null">Null</a> ⇐ <code><a href="#external_null">null</a></code></dt>
<dd></dd>
<dt><a href="#Lexer">Lexer</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
<dt><a href="#Builder">Builder</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
<dt><a href="#Interpreter">Interpreter</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
<dt><a href="#Transducer">Transducer</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
<dt><a href="#KeypathExp">KeypathExp</a> ⇐ <code><a href="#Transducer">Transducer</a></code></dt>
<dd></dd>
<dt><a href="#Builder">Builder</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
<dt><a href="#InterpreterError">InterpreterError</a> ⇐ <code><a href="#external_SyntaxError">SyntaxError</a></code></dt>
<dd></dd>
<dt><a href="#Interpreter">Interpreter</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
<dt><a href="#KeypathExp">KeypathExp</a> ⇐ <code><a href="#Transducer">Transducer</a></code></dt>
<dd></dd>
<dt><a href="#Lexer">Lexer</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
<dt><a href="#Null">Null</a> ⇐ <code><a href="#external_null">null</a></code></dt>
<dd></dd>
<dt><a href="#PathToolkit">PathToolkit</a></dt>
<dd></dd>
<dt><a href="#Transducer">Transducer</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#KeypathCallback">KeypathCallback</a> ⇒ <code>*</code></dt>
<dd></dd>
<dt><a href="#ForEachCallback">ForEachCallback</a> : <code><a href="#external_Function">Function</a></code></dt>
<dd></dd>
<dt><a href="#Array-Like">Array-Like</a> : <code><a href="#external_Array">Array</a></code> | <code><a href="#external_Arguments">Arguments</a></code> | <code><a href="#external_string">string</a></code></dt>
<dd><p>JavaScript Array-Like</p>
</dd>
<dt><a href="#KeypathCallback">KeypathCallback</a> ⇒ <code>*</code></dt>
<dd></dd>
</dl>

## External

<dl>
<dt><a href="#external_Arguments">Arguments</a></dt>
<dd><p>JavaScript Arguments</p>
</dd>
<dt><a href="#external_Array">Array</a></dt>
<dd><p>JavaScript Array</p>
</dd>
<dt><a href="#external_boolean">boolean</a></dt>
<dd><p>JavaScript <a href="https://developer.mozilla.org/en-US/docs/Glossary/Prm454mun3!imitive">primitive</a> boolean</p>
</dd>
<dt><a href="#external_Error">Error</a></dt>
<dd><p>JavaScript Error</p>
</dd>
<dt><a href="#external_Function">Function</a></dt>
<dd><p>JavaScript Function</p>
</dd>
<dt><a href="#external_number">number</a></dt>
<dd><p>JavaScript <a href="https://developer.mozilla.org/en-US/docs/Glossary/Primitive">primitive</a> number</p>
</dd>
<dt><a href="#external_null">null</a></dt>
<dd><p>JavaScript null</p>
</dd>
<dt><a href="#external_Object">Object</a></dt>
<dd><p>JavaScript Object</p>
</dd>
<dt><a href="#external_Promise">Promise</a></dt>
<dd><p>JavaScript Promise</p>
</dd>
<dt><a href="#external_string">string</a></dt>
<dd><p>JavaScript <a href="https://developer.mozilla.org/en-US/docs/Glossary/Primitive">primitive</a> string</p>
</dd>
<dt><a href="#external_symbol">symbol</a></dt>
<dd><p>JavaScript <a href="https://developer.mozilla.org/en-US/docs/Glossary/Primitive">primitive</a> symbol</p>
</dd>
<dt><a href="#external_SyntaxError">SyntaxError</a> ⇐ <code><a href="#external_Error">Error</a></code></dt>
<dd><p>JavaScript SyntaxError</p>
</dd>
<dt><a href="#external_TypeError">TypeError</a> ⇐ <code><a href="#external_Error">Error</a></code></dt>
<dd><p>JavaScript TypeError</p>
</dd>
</dl>

<a name="Null"></a>

## Null ⇐ <code>[null](#external_null)</code>
**Kind**: global class  
**Extends:** <code>[null](#external_null)</code>  

* [Null](#Null) ⇐ <code>[null](#external_null)</code>
    * [new Null()](#new_Null_new)
    * [new Null()](#new_Null_new)

<a name="new_Null_new"></a>

### new Null()
A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.

<a name="new_Null_new"></a>

### new Null()
A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.

<a name="Lexer"></a>

## Lexer ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  

* [Lexer](#Lexer) ⇐ <code>[Null](#Null)</code>
    * _instance_
        * [.lex(text)](#Lexer+lex)
            * [.buffer](#Lexer+lex+buffer) : <code>[string](#external_string)</code>
            * [.index](#Lexer+lex+index) : <code>[number](#external_number)</code>
            * [.tokens](#Lexer+lex+tokens) : <code>[Array.&lt;Token&gt;](#Lexer..Token)</code>
        * [.read(until)](#Lexer+read) ⇒ <code>[string](#external_string)</code>
        * [.throwError()](#Lexer+throwError)
        * [.toJSON()](#Lexer+toJSON) ⇒ <code>[Object](#external_Object)</code>
        * [.toString()](#Lexer+toString) ⇒ <code>[string](#external_string)</code>
    * _inner_
        * [~Token](#Lexer..Token) ⇐ <code>[Null](#Null)</code>
            * [new Token(type, value)](#new_Lexer..Token_new)
            * [new Token(type, value)](#new_Lexer..Token_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~Identifier](#Lexer..Identifier) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new Identifier(value)](#new_Lexer..Identifier_new)
            * [new Identifier(value)](#new_Lexer..Identifier_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~NumericLiteral](#Lexer..NumericLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
            * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~NullLiteral](#Lexer..NullLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
            * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~Punctuator](#Lexer..Punctuator) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new Punctuator(value)](#new_Lexer..Punctuator_new)
            * [new Punctuator(value)](#new_Lexer..Punctuator_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~StringLiteral](#Lexer..StringLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
            * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~LexerError](#Lexer..LexerError) ⇐ <code>[SyntaxError](#external_SyntaxError)</code>
            * [new LexerError(message)](#new_Lexer..LexerError_new)
            * [new LexerError(message)](#new_Lexer..LexerError_new)
        * [~LexerError](#Lexer..LexerError) ⇐ <code>[SyntaxError](#external_SyntaxError)</code>
            * [new LexerError(message)](#new_Lexer..LexerError_new)
            * [new LexerError(message)](#new_Lexer..LexerError_new)
        * [~Token](#Lexer..Token) ⇐ <code>[Null](#Null)</code>
            * [new Token(type, value)](#new_Lexer..Token_new)
            * [new Token(type, value)](#new_Lexer..Token_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~Identifier](#Lexer..Identifier) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new Identifier(value)](#new_Lexer..Identifier_new)
            * [new Identifier(value)](#new_Lexer..Identifier_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~NumericLiteral](#Lexer..NumericLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
            * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~NullLiteral](#Lexer..NullLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
            * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~Punctuator](#Lexer..Punctuator) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new Punctuator(value)](#new_Lexer..Punctuator_new)
            * [new Punctuator(value)](#new_Lexer..Punctuator_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~StringLiteral](#Lexer..StringLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
            * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~isIdentifier(char)](#Lexer..isIdentifier) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isNumeric(char)](#Lexer..isNumeric) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isPunctuator(char)](#Lexer..isPunctuator) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isQuote(char)](#Lexer..isQuote) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isWhitespace(char)](#Lexer..isWhitespace) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isIdentifier(char)](#Lexer..isIdentifier) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isNumeric(char)](#Lexer..isNumeric) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isPunctuator(char)](#Lexer..isPunctuator) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isQuote(char)](#Lexer..isQuote) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isWhitespace(char)](#Lexer..isWhitespace) ⇒ <code>[boolean](#external_boolean)</code>

<a name="Lexer+lex"></a>

### lexer.lex(text)
**Kind**: instance method of <code>[Lexer](#Lexer)</code>  

| Param | Type |
| --- | --- |
| text | <code>[string](#external_string)</code> | 


* [.lex(text)](#Lexer+lex)
    * [.buffer](#Lexer+lex+buffer) : <code>[string](#external_string)</code>
    * [.index](#Lexer+lex+index) : <code>[number](#external_number)</code>
    * [.tokens](#Lexer+lex+tokens) : <code>[Array.&lt;Token&gt;](#Lexer..Token)</code>

<a name="Lexer+lex+buffer"></a>

#### lex.buffer : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[lex](#Lexer+lex)</code>  
**Default**: <code>&#x27;&#x27;</code>  
<a name="Lexer+lex+index"></a>

#### lex.index : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[lex](#Lexer+lex)</code>  
<a name="Lexer+lex+tokens"></a>

#### lex.tokens : <code>[Array.&lt;Token&gt;](#Lexer..Token)</code>
**Kind**: instance property of <code>[lex](#Lexer+lex)</code>  
<a name="Lexer+read"></a>

### lexer.read(until) ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[string](#external_string)</code> - The portion of the buffer read  

| Param | Type | Description |
| --- | --- | --- |
| until | <code>external:function</code> | A condition that when met will stop the reading of the buffer |

<a name="Lexer+throwError"></a>

### lexer.throwError()
**Kind**: instance method of <code>[Lexer](#Lexer)</code>  
**Throws**:

- <code>[LexerError](#Lexer..LexerError)</code> When it executes

<a name="Lexer+toJSON"></a>

### lexer.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the lexer  
<a name="Lexer+toString"></a>

### lexer.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the lexer  
<a name="Lexer..Token"></a>

### Lexer~Token ⇐ <code>[Null](#Null)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Null](#Null)</code>  

* [~Token](#Lexer..Token) ⇐ <code>[Null](#Null)</code>
    * [new Token(type, value)](#new_Lexer..Token_new)
    * [new Token(type, value)](#new_Lexer..Token_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..Token_new"></a>

#### new Token(type, value)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | The type of the token |
| value | <code>[string](#external_string)</code> | The value of the token |

<a name="new_Lexer..Token_new"></a>

#### new Token(type, value)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | The type of the token |
| value | <code>[string](#external_string)</code> | The value of the token |

<a name="Lexer..Token+id"></a>

#### token.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+type"></a>

#### token.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+value"></a>

#### token.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+id"></a>

#### token.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+type"></a>

#### token.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+value"></a>

#### token.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Identifier"></a>

### Lexer~Identifier ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~Identifier](#Lexer..Identifier) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new Identifier(value)](#new_Lexer..Identifier_new)
    * [new Identifier(value)](#new_Lexer..Identifier_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..Identifier_new"></a>

#### new Identifier(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..Identifier_new"></a>

#### new Identifier(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### identifier.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Identifier](#Lexer..Identifier)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### identifier.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Identifier](#Lexer..Identifier)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### identifier.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Identifier](#Lexer..Identifier)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..NumericLiteral"></a>

### Lexer~NumericLiteral ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~NumericLiteral](#Lexer..NumericLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
    * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..NumericLiteral_new"></a>

#### new NumericLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..NumericLiteral_new"></a>

#### new NumericLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### numericLiteral.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[NumericLiteral](#Lexer..NumericLiteral)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### numericLiteral.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NumericLiteral](#Lexer..NumericLiteral)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### numericLiteral.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NumericLiteral](#Lexer..NumericLiteral)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..NullLiteral"></a>

### Lexer~NullLiteral ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~NullLiteral](#Lexer..NullLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
    * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..NullLiteral_new"></a>

#### new NullLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..NullLiteral_new"></a>

#### new NullLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### nullLiteral.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[NullLiteral](#Lexer..NullLiteral)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### nullLiteral.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NullLiteral](#Lexer..NullLiteral)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### nullLiteral.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NullLiteral](#Lexer..NullLiteral)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..Punctuator"></a>

### Lexer~Punctuator ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~Punctuator](#Lexer..Punctuator) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new Punctuator(value)](#new_Lexer..Punctuator_new)
    * [new Punctuator(value)](#new_Lexer..Punctuator_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..Punctuator_new"></a>

#### new Punctuator(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..Punctuator_new"></a>

#### new Punctuator(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### punctuator.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Punctuator](#Lexer..Punctuator)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### punctuator.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Punctuator](#Lexer..Punctuator)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### punctuator.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Punctuator](#Lexer..Punctuator)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..StringLiteral"></a>

### Lexer~StringLiteral ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~StringLiteral](#Lexer..StringLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
    * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..StringLiteral_new"></a>

#### new StringLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..StringLiteral_new"></a>

#### new StringLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### stringLiteral.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[StringLiteral](#Lexer..StringLiteral)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### stringLiteral.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[StringLiteral](#Lexer..StringLiteral)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### stringLiteral.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[StringLiteral](#Lexer..StringLiteral)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..LexerError"></a>

### Lexer~LexerError ⇐ <code>[SyntaxError](#external_SyntaxError)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[SyntaxError](#external_SyntaxError)</code>  

* [~LexerError](#Lexer..LexerError) ⇐ <code>[SyntaxError](#external_SyntaxError)</code>
    * [new LexerError(message)](#new_Lexer..LexerError_new)
    * [new LexerError(message)](#new_Lexer..LexerError_new)

<a name="new_Lexer..LexerError_new"></a>

#### new LexerError(message)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>[string](#external_string)</code> | The error message |

<a name="new_Lexer..LexerError_new"></a>

#### new LexerError(message)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>[string](#external_string)</code> | The error message |

<a name="Lexer..LexerError"></a>

### Lexer~LexerError ⇐ <code>[SyntaxError](#external_SyntaxError)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[SyntaxError](#external_SyntaxError)</code>  

* [~LexerError](#Lexer..LexerError) ⇐ <code>[SyntaxError](#external_SyntaxError)</code>
    * [new LexerError(message)](#new_Lexer..LexerError_new)
    * [new LexerError(message)](#new_Lexer..LexerError_new)

<a name="new_Lexer..LexerError_new"></a>

#### new LexerError(message)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>[string](#external_string)</code> | The error message |

<a name="new_Lexer..LexerError_new"></a>

#### new LexerError(message)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>[string](#external_string)</code> | The error message |

<a name="Lexer..Token"></a>

### Lexer~Token ⇐ <code>[Null](#Null)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Null](#Null)</code>  

* [~Token](#Lexer..Token) ⇐ <code>[Null](#Null)</code>
    * [new Token(type, value)](#new_Lexer..Token_new)
    * [new Token(type, value)](#new_Lexer..Token_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..Token_new"></a>

#### new Token(type, value)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | The type of the token |
| value | <code>[string](#external_string)</code> | The value of the token |

<a name="new_Lexer..Token_new"></a>

#### new Token(type, value)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | The type of the token |
| value | <code>[string](#external_string)</code> | The value of the token |

<a name="Lexer..Token+id"></a>

#### token.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+type"></a>

#### token.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+value"></a>

#### token.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+id"></a>

#### token.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+type"></a>

#### token.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+value"></a>

#### token.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Identifier"></a>

### Lexer~Identifier ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~Identifier](#Lexer..Identifier) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new Identifier(value)](#new_Lexer..Identifier_new)
    * [new Identifier(value)](#new_Lexer..Identifier_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..Identifier_new"></a>

#### new Identifier(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..Identifier_new"></a>

#### new Identifier(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### identifier.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Identifier](#Lexer..Identifier)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### identifier.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Identifier](#Lexer..Identifier)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### identifier.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Identifier](#Lexer..Identifier)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..NumericLiteral"></a>

### Lexer~NumericLiteral ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~NumericLiteral](#Lexer..NumericLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
    * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..NumericLiteral_new"></a>

#### new NumericLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..NumericLiteral_new"></a>

#### new NumericLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### numericLiteral.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[NumericLiteral](#Lexer..NumericLiteral)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### numericLiteral.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NumericLiteral](#Lexer..NumericLiteral)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### numericLiteral.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NumericLiteral](#Lexer..NumericLiteral)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..NullLiteral"></a>

### Lexer~NullLiteral ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~NullLiteral](#Lexer..NullLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
    * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..NullLiteral_new"></a>

#### new NullLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..NullLiteral_new"></a>

#### new NullLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### nullLiteral.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[NullLiteral](#Lexer..NullLiteral)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### nullLiteral.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NullLiteral](#Lexer..NullLiteral)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### nullLiteral.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NullLiteral](#Lexer..NullLiteral)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..Punctuator"></a>

### Lexer~Punctuator ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~Punctuator](#Lexer..Punctuator) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new Punctuator(value)](#new_Lexer..Punctuator_new)
    * [new Punctuator(value)](#new_Lexer..Punctuator_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..Punctuator_new"></a>

#### new Punctuator(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..Punctuator_new"></a>

#### new Punctuator(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### punctuator.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Punctuator](#Lexer..Punctuator)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### punctuator.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Punctuator](#Lexer..Punctuator)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### punctuator.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Punctuator](#Lexer..Punctuator)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..StringLiteral"></a>

### Lexer~StringLiteral ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~StringLiteral](#Lexer..StringLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
    * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..StringLiteral_new"></a>

#### new StringLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..StringLiteral_new"></a>

#### new StringLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### stringLiteral.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[StringLiteral](#Lexer..StringLiteral)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### stringLiteral.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[StringLiteral](#Lexer..StringLiteral)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### stringLiteral.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[StringLiteral](#Lexer..StringLiteral)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..isIdentifier"></a>

### Lexer~isIdentifier(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is an identifier character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isNumeric"></a>

### Lexer~isNumeric(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a numeric character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isPunctuator"></a>

### Lexer~isPunctuator(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a punctuator character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isQuote"></a>

### Lexer~isQuote(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a quote character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isWhitespace"></a>

### Lexer~isWhitespace(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a whitespace character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isIdentifier"></a>

### Lexer~isIdentifier(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is an identifier character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isNumeric"></a>

### Lexer~isNumeric(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a numeric character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isPunctuator"></a>

### Lexer~isPunctuator(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a punctuator character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isQuote"></a>

### Lexer~isQuote(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a quote character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isWhitespace"></a>

### Lexer~isWhitespace(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a whitespace character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Builder"></a>

## Builder ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  

* [Builder](#Builder) ⇐ <code>[Null](#Null)</code>
    * [new Builder(lexer)](#new_Builder_new)
    * [new Builder(lexer)](#new_Builder_new)
    * _instance_
        * [.build(input)](#Builder+build) ⇒ <code>Program</code>
            * [.text](#Builder+build+text) : <code>[string](#external_string)</code>
            * [.tokens](#Builder+build+tokens) : <code>external:Array.&lt;Token&gt;</code>
        * [.callExpression()](#Builder+callExpression) ⇒ <code>CallExpression</code>
        * [.consume([expected])](#Builder+consume) ⇒ <code>Token</code>
        * [.expect([first], [second], [third], [fourth])](#Builder+expect) ⇒ <code>Token</code>
        * [.expression()](#Builder+expression) ⇒ <code>Expression</code>
        * [.expressionStatement()](#Builder+expressionStatement) ⇒ <code>ExpressionStatement</code>
        * [.identifier()](#Builder+identifier) ⇒ <code>Identifier</code>
        * [.list(terminator)](#Builder+list) ⇒ <code>external:Array.&lt;Expression&gt;</code> &#124; <code>RangeExpression</code>
        * [.literal()](#Builder+literal) ⇒ <code>Literal</code>
        * [.memberExpression(property, computed)](#Builder+memberExpression) ⇒ <code>MemberExpression</code>
        * [.peek([first], [second], [third], [fourth])](#Builder+peek) ⇒ <code>[Token](#Lexer..Token)</code>
        * [.peekAt(position, [first], [second], [third], [fourth])](#Builder+peekAt) ⇒ <code>[Token](#Lexer..Token)</code>
        * [.program()](#Builder+program) ⇒ <code>Program</code>
        * [.throwError(message)](#Builder+throwError)
    * _inner_
        * [~Node](#Builder..Node) ⇐ <code>[Null](#Null)</code>
            * [new Node(type)](#new_Builder..Node_new)
            * [new Node(type)](#new_Builder..Node_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Expression](#Builder..Expression) ⇐ <code>[Node](#Builder..Node)</code>
            * [new Expression(expressionType)](#new_Builder..Expression_new)
            * [new Expression(expressionType)](#new_Builder..Expression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Literal](#Builder..Literal) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new Literal(value)](#new_Builder..Literal_new)
            * [new Literal(value)](#new_Builder..Literal_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~MemberExpression](#Builder..MemberExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
            * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Program](#Builder..Program) ⇐ <code>[Node](#Builder..Node)</code>
            * [new Program(body)](#new_Builder..Program_new)
            * [new Program(body)](#new_Builder..Program_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Statement](#Builder..Statement) ⇐ <code>[Node](#Builder..Node)</code>
            * [new Statement(statementType)](#new_Builder..Statement_new)
            * [new Statement(statementType)](#new_Builder..Statement_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~ArrayExpression](#Builder..ArrayExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
            * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~CallExpression](#Builder..CallExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
            * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~ComputedMemberExpression](#Builder..ComputedMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
            * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
            * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
            * [.computed](#Builder..ComputedMemberExpression+computed)
            * [.computed](#Builder..ComputedMemberExpression+computed)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~ExpressionStatement](#Builder..ExpressionStatement) ⇐ <code>[Statement](#Builder..Statement)</code>
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Identifier](#Builder..Identifier) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new Identifier(name)](#new_Builder..Identifier_new)
            * [new Identifier(name)](#new_Builder..Identifier_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~SequenceExpression](#Builder..SequenceExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
            * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~StaticMemberExpression](#Builder..StaticMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
            * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
            * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
            * [.computed](#Builder..StaticMemberExpression+computed)
            * [.computed](#Builder..StaticMemberExpression+computed)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~OperatorExpression](#Builder..OperatorExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
            * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~RangeExpression](#Builder..RangeExpression) ⇐ <code>[OperatorExpression](#Builder..OperatorExpression)</code>
            * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
            * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
            * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
            * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
            * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
            * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
            * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
            * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
            * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
            * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
            * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
            * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~OperatorExpression](#Builder..OperatorExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
            * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~RangeExpression](#Builder..RangeExpression) ⇐ <code>[OperatorExpression](#Builder..OperatorExpression)</code>
            * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
            * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
            * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
            * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
            * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
            * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
            * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
            * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
            * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
            * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
            * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
            * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Node](#Builder..Node) ⇐ <code>[Null](#Null)</code>
            * [new Node(type)](#new_Builder..Node_new)
            * [new Node(type)](#new_Builder..Node_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Expression](#Builder..Expression) ⇐ <code>[Node](#Builder..Node)</code>
            * [new Expression(expressionType)](#new_Builder..Expression_new)
            * [new Expression(expressionType)](#new_Builder..Expression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Literal](#Builder..Literal) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new Literal(value)](#new_Builder..Literal_new)
            * [new Literal(value)](#new_Builder..Literal_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~MemberExpression](#Builder..MemberExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
            * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Program](#Builder..Program) ⇐ <code>[Node](#Builder..Node)</code>
            * [new Program(body)](#new_Builder..Program_new)
            * [new Program(body)](#new_Builder..Program_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Statement](#Builder..Statement) ⇐ <code>[Node](#Builder..Node)</code>
            * [new Statement(statementType)](#new_Builder..Statement_new)
            * [new Statement(statementType)](#new_Builder..Statement_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~ArrayExpression](#Builder..ArrayExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
            * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~CallExpression](#Builder..CallExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
            * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~ComputedMemberExpression](#Builder..ComputedMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
            * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
            * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
            * [.computed](#Builder..ComputedMemberExpression+computed)
            * [.computed](#Builder..ComputedMemberExpression+computed)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~ExpressionStatement](#Builder..ExpressionStatement) ⇐ <code>[Statement](#Builder..Statement)</code>
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Identifier](#Builder..Identifier) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new Identifier(name)](#new_Builder..Identifier_new)
            * [new Identifier(name)](#new_Builder..Identifier_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~SequenceExpression](#Builder..SequenceExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
            * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~StaticMemberExpression](#Builder..StaticMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
            * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
            * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
            * [.computed](#Builder..StaticMemberExpression+computed)
            * [.computed](#Builder..StaticMemberExpression+computed)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder_new"></a>

### new Builder(lexer)

| Param | Type |
| --- | --- |
| lexer | <code>[Lexer](#Lexer)</code> | 

<a name="new_Builder_new"></a>

### new Builder(lexer)

| Param | Type |
| --- | --- |
| lexer | <code>[Lexer](#Lexer)</code> | 

<a name="Builder+build"></a>

### builder.build(input) ⇒ <code>Program</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Program</code> - The built abstract syntax tree  

| Param | Type |
| --- | --- |
| input | <code>[string](#external_string)</code> &#124; <code>Array.&lt;Builder~Token&gt;</code> | 


* [.build(input)](#Builder+build) ⇒ <code>Program</code>
    * [.text](#Builder+build+text) : <code>[string](#external_string)</code>
    * [.tokens](#Builder+build+tokens) : <code>external:Array.&lt;Token&gt;</code>

<a name="Builder+build+text"></a>

#### build.text : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[build](#Builder+build)</code>  
<a name="Builder+build+tokens"></a>

#### build.tokens : <code>external:Array.&lt;Token&gt;</code>
**Kind**: instance property of <code>[build](#Builder+build)</code>  
<a name="Builder+callExpression"></a>

### builder.callExpression() ⇒ <code>CallExpression</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>CallExpression</code> - The call expression node  
<a name="Builder+consume"></a>

### builder.consume([expected]) ⇒ <code>Token</code>
Removes the next token in the token list. If a comparison is provided, the token will only be returned if the value matches. Otherwise an error is thrown.

**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Token</code> - The next token in the list  
**Throws**:

- <code>SyntaxError</code> If token did not exist


| Param | Type | Description |
| --- | --- | --- |
| [expected] | <code>[string](#external_string)</code> | An expected comparison value |

<a name="Builder+expect"></a>

### builder.expect([first], [second], [third], [fourth]) ⇒ <code>Token</code>
Removes the next token in the token list. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.

**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Token</code> - The next token in the list or `undefined` if it did not exist  

| Param | Type | Description |
| --- | --- | --- |
| [first] | <code>[string](#external_string)</code> | The first comparison value |
| [second] | <code>[string](#external_string)</code> | The second comparison value |
| [third] | <code>[string](#external_string)</code> | The third comparison value |
| [fourth] | <code>[string](#external_string)</code> | The fourth comparison value |

<a name="Builder+expression"></a>

### builder.expression() ⇒ <code>Expression</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Expression</code> - An expression node  
<a name="Builder+expressionStatement"></a>

### builder.expressionStatement() ⇒ <code>ExpressionStatement</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>ExpressionStatement</code> - An expression statement  
<a name="Builder+identifier"></a>

### builder.identifier() ⇒ <code>Identifier</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Identifier</code> - An identifier  
**Throws**:

- <code>SyntaxError</code> If the token is not an identifier

<a name="Builder+list"></a>

### builder.list(terminator) ⇒ <code>external:Array.&lt;Expression&gt;</code> &#124; <code>RangeExpression</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>external:Array.&lt;Expression&gt;</code> &#124; <code>RangeExpression</code> - The list of expressions or range expression  

| Param | Type |
| --- | --- |
| terminator | <code>[string](#external_string)</code> | 

<a name="Builder+literal"></a>

### builder.literal() ⇒ <code>Literal</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Literal</code> - The literal node  
<a name="Builder+memberExpression"></a>

### builder.memberExpression(property, computed) ⇒ <code>MemberExpression</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>MemberExpression</code> - The member expression  

| Param | Type | Description |
| --- | --- | --- |
| property | <code>Expression</code> | The expression assigned to the property of the member expression |
| computed | <code>[boolean](#external_boolean)</code> | Whether or not the member expression is computed |

<a name="Builder+peek"></a>

### builder.peek([first], [second], [third], [fourth]) ⇒ <code>[Token](#Lexer..Token)</code>
Provides the next token in the token list _without removing it_. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.

**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>[Token](#Lexer..Token)</code> - The next token in the list or `undefined` if it did not exist  

| Param | Type | Description |
| --- | --- | --- |
| [first] | <code>[string](#external_string)</code> | The first comparison value |
| [second] | <code>[string](#external_string)</code> | The second comparison value |
| [third] | <code>[string](#external_string)</code> | The third comparison value |
| [fourth] | <code>[string](#external_string)</code> | The fourth comparison value |

<a name="Builder+peekAt"></a>

### builder.peekAt(position, [first], [second], [third], [fourth]) ⇒ <code>[Token](#Lexer..Token)</code>
Provides the token at the requested position _without removing it_ from the token list. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.

**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>[Token](#Lexer..Token)</code> - The token at the requested position or `undefined` if it did not exist  

| Param | Type | Description |
| --- | --- | --- |
| position | <code>[number](#external_number)</code> | The position where the token will be peeked |
| [first] | <code>[string](#external_string)</code> | The first comparison value |
| [second] | <code>[string](#external_string)</code> | The second comparison value |
| [third] | <code>[string](#external_string)</code> | The third comparison value |
| [fourth] | <code>[string](#external_string)</code> | The fourth comparison value |

<a name="Builder+program"></a>

### builder.program() ⇒ <code>Program</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Program</code> - A program node  
<a name="Builder+throwError"></a>

### builder.throwError(message)
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Throws**:

- <code>[SyntaxError](#external_SyntaxError)</code> When it executes


| Param | Type | Description |
| --- | --- | --- |
| message | <code>[string](#external_string)</code> | The error message |

<a name="Builder..Node"></a>

### Builder~Node ⇐ <code>[Null](#Null)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Null](#Null)</code>  

* [~Node](#Builder..Node) ⇐ <code>[Null](#Null)</code>
    * [new Node(type)](#new_Builder..Node_new)
    * [new Node(type)](#new_Builder..Node_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Node_new"></a>

#### new Node(type)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | A node type |

<a name="new_Builder..Node_new"></a>

#### new Node(type)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | A node type |

<a name="Builder..Node+id"></a>

#### node.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Node+type"></a>

#### node.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Node+id"></a>

#### node.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Node+type"></a>

#### node.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Expression"></a>

### Builder~Expression ⇐ <code>[Node](#Builder..Node)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Node](#Builder..Node)</code>  

* [~Expression](#Builder..Expression) ⇐ <code>[Node](#Builder..Node)</code>
    * [new Expression(expressionType)](#new_Builder..Expression_new)
    * [new Expression(expressionType)](#new_Builder..Expression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Expression_new"></a>

#### new Expression(expressionType)

| Param | Type | Description |
| --- | --- | --- |
| expressionType | <code>[string](#external_string)</code> | A node type |

<a name="new_Builder..Expression_new"></a>

#### new Expression(expressionType)

| Param | Type | Description |
| --- | --- | --- |
| expressionType | <code>[string](#external_string)</code> | A node type |

<a name="Builder..Node+id"></a>

#### expression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Expression](#Builder..Expression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### expression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Expression](#Builder..Expression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Literal"></a>

### Builder~Literal ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~Literal](#Builder..Literal) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new Literal(value)](#new_Builder..Literal_new)
    * [new Literal(value)](#new_Builder..Literal_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Literal_new"></a>

#### new Literal(value)

| Param | Type | Description |
| --- | --- | --- |
| value | <code>[string](#external_string)</code> &#124; <code>[number](#external_number)</code> | The value of the literal |

<a name="new_Builder..Literal_new"></a>

#### new Literal(value)

| Param | Type | Description |
| --- | --- | --- |
| value | <code>[string](#external_string)</code> &#124; <code>[number](#external_number)</code> | The value of the literal |

<a name="Builder..Node+id"></a>

#### literal.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Literal](#Builder..Literal)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### literal.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Literal](#Builder..Literal)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..MemberExpression"></a>

### Builder~MemberExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~MemberExpression](#Builder..MemberExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
    * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..MemberExpression_new"></a>

#### new MemberExpression(object, property, computed)

| Param | Type | Default |
| --- | --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> |  | 
| property | <code>[Expression](#Builder..Expression)</code> &#124; <code>[Identifier](#Builder..Identifier)</code> |  | 
| computed | <code>[boolean](#external_boolean)</code> | <code>false</code> | 

<a name="new_Builder..MemberExpression_new"></a>

#### new MemberExpression(object, property, computed)

| Param | Type | Default |
| --- | --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> |  | 
| property | <code>[Expression](#Builder..Expression)</code> &#124; <code>[Identifier](#Builder..Identifier)</code> |  | 
| computed | <code>[boolean](#external_boolean)</code> | <code>false</code> | 

<a name="Builder..Node+id"></a>

#### memberExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[MemberExpression](#Builder..MemberExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### memberExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[MemberExpression](#Builder..MemberExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Program"></a>

### Builder~Program ⇐ <code>[Node](#Builder..Node)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Node](#Builder..Node)</code>  

* [~Program](#Builder..Program) ⇐ <code>[Node](#Builder..Node)</code>
    * [new Program(body)](#new_Builder..Program_new)
    * [new Program(body)](#new_Builder..Program_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Program_new"></a>

#### new Program(body)

| Param | Type |
| --- | --- |
| body | <code>[external:Array.&lt;Statement&gt;](#Builder..Statement)</code> | 

<a name="new_Builder..Program_new"></a>

#### new Program(body)

| Param | Type |
| --- | --- |
| body | <code>[external:Array.&lt;Statement&gt;](#Builder..Statement)</code> | 

<a name="Builder..Node+id"></a>

#### program.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Program](#Builder..Program)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### program.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Program](#Builder..Program)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Statement"></a>

### Builder~Statement ⇐ <code>[Node](#Builder..Node)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Node](#Builder..Node)</code>  

* [~Statement](#Builder..Statement) ⇐ <code>[Node](#Builder..Node)</code>
    * [new Statement(statementType)](#new_Builder..Statement_new)
    * [new Statement(statementType)](#new_Builder..Statement_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Statement_new"></a>

#### new Statement(statementType)

| Param | Type | Description |
| --- | --- | --- |
| statementType | <code>[string](#external_string)</code> | A node type |

<a name="new_Builder..Statement_new"></a>

#### new Statement(statementType)

| Param | Type | Description |
| --- | --- | --- |
| statementType | <code>[string](#external_string)</code> | A node type |

<a name="Builder..Node+id"></a>

#### statement.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Statement](#Builder..Statement)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### statement.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Statement](#Builder..Statement)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..ArrayExpression"></a>

### Builder~ArrayExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~ArrayExpression](#Builder..ArrayExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
    * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..ArrayExpression_new"></a>

#### new ArrayExpression(elements)

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>[external:Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | A list of expressions |

<a name="new_Builder..ArrayExpression_new"></a>

#### new ArrayExpression(elements)

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>[external:Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | A list of expressions |

<a name="Builder..Node+id"></a>

#### arrayExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[ArrayExpression](#Builder..ArrayExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### arrayExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[ArrayExpression](#Builder..ArrayExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..CallExpression"></a>

### Builder~CallExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~CallExpression](#Builder..CallExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
    * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..CallExpression_new"></a>

#### new CallExpression(callee, args)

| Param | Type |
| --- | --- |
| callee | <code>[Expression](#Builder..Expression)</code> | 
| args | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> | 

<a name="new_Builder..CallExpression_new"></a>

#### new CallExpression(callee, args)

| Param | Type |
| --- | --- |
| callee | <code>[Expression](#Builder..Expression)</code> | 
| args | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> | 

<a name="Builder..Node+id"></a>

#### callExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[CallExpression](#Builder..CallExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### callExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[CallExpression](#Builder..CallExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..ComputedMemberExpression"></a>

### Builder~ComputedMemberExpression ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[MemberExpression](#Builder..MemberExpression)</code>  

* [~ComputedMemberExpression](#Builder..ComputedMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
    * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
    * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
    * [.computed](#Builder..ComputedMemberExpression+computed)
    * [.computed](#Builder..ComputedMemberExpression+computed)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..ComputedMemberExpression_new"></a>

#### new ComputedMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Expression](#Builder..Expression)</code> | 

<a name="new_Builder..ComputedMemberExpression_new"></a>

#### new ComputedMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Expression](#Builder..Expression)</code> | 

<a name="Builder..ComputedMemberExpression+computed"></a>

#### computedMemberExpression.computed
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
<a name="Builder..ComputedMemberExpression+computed"></a>

#### computedMemberExpression.computed
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
<a name="Builder..Node+id"></a>

#### computedMemberExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### computedMemberExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..ExpressionStatement"></a>

### Builder~ExpressionStatement ⇐ <code>[Statement](#Builder..Statement)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Statement](#Builder..Statement)</code>  

* [~ExpressionStatement](#Builder..ExpressionStatement) ⇐ <code>[Statement](#Builder..Statement)</code>
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="Builder..Node+id"></a>

#### expressionStatement.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[ExpressionStatement](#Builder..ExpressionStatement)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### expressionStatement.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[ExpressionStatement](#Builder..ExpressionStatement)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Identifier"></a>

### Builder~Identifier ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~Identifier](#Builder..Identifier) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new Identifier(name)](#new_Builder..Identifier_new)
    * [new Identifier(name)](#new_Builder..Identifier_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Identifier_new"></a>

#### new Identifier(name)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>[string](#external_string)</code> | The name of the identifier |

<a name="new_Builder..Identifier_new"></a>

#### new Identifier(name)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>[string](#external_string)</code> | The name of the identifier |

<a name="Builder..Node+id"></a>

#### identifier.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Identifier](#Builder..Identifier)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### identifier.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Identifier](#Builder..Identifier)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..SequenceExpression"></a>

### Builder~SequenceExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~SequenceExpression](#Builder..SequenceExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
    * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..SequenceExpression_new"></a>

#### new SequenceExpression(expressions)

| Param | Type | Description |
| --- | --- | --- |
| expressions | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | The expressions in the sequence |

<a name="new_Builder..SequenceExpression_new"></a>

#### new SequenceExpression(expressions)

| Param | Type | Description |
| --- | --- | --- |
| expressions | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | The expressions in the sequence |

<a name="Builder..Node+id"></a>

#### sequenceExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[SequenceExpression](#Builder..SequenceExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### sequenceExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[SequenceExpression](#Builder..SequenceExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..StaticMemberExpression"></a>

### Builder~StaticMemberExpression ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[MemberExpression](#Builder..MemberExpression)</code>  

* [~StaticMemberExpression](#Builder..StaticMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
    * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
    * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
    * [.computed](#Builder..StaticMemberExpression+computed)
    * [.computed](#Builder..StaticMemberExpression+computed)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..StaticMemberExpression_new"></a>

#### new StaticMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Identifier](#Builder..Identifier)</code> | 

<a name="new_Builder..StaticMemberExpression_new"></a>

#### new StaticMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Identifier](#Builder..Identifier)</code> | 

<a name="Builder..StaticMemberExpression+computed"></a>

#### staticMemberExpression.computed
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
<a name="Builder..StaticMemberExpression+computed"></a>

#### staticMemberExpression.computed
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
<a name="Builder..Node+id"></a>

#### staticMemberExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### staticMemberExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..OperatorExpression"></a>

### Builder~OperatorExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~OperatorExpression](#Builder..OperatorExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
    * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..OperatorExpression_new"></a>

#### new OperatorExpression(expressionType, operator)

| Param | Type |
| --- | --- |
| expressionType | <code>[string](#external_string)</code> | 
| operator | <code>[string](#external_string)</code> | 

<a name="new_Builder..OperatorExpression_new"></a>

#### new OperatorExpression(expressionType, operator)

| Param | Type |
| --- | --- |
| expressionType | <code>[string](#external_string)</code> | 
| operator | <code>[string](#external_string)</code> | 

<a name="Builder..Node+id"></a>

#### operatorExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[OperatorExpression](#Builder..OperatorExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### operatorExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[OperatorExpression](#Builder..OperatorExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..RangeExpression"></a>

### Builder~RangeExpression ⇐ <code>[OperatorExpression](#Builder..OperatorExpression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[OperatorExpression](#Builder..OperatorExpression)</code>  

* [~RangeExpression](#Builder..RangeExpression) ⇐ <code>[OperatorExpression](#Builder..OperatorExpression)</code>
    * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
    * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
    * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
    * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
    * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
    * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
    * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
    * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
    * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
    * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
    * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
    * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..RangeExpression_new"></a>

#### new RangeExpression(left, right)

| Param | Type |
| --- | --- |
| left | <code>[Expression](#Builder..Expression)</code> | 
| right | <code>[Expression](#Builder..Expression)</code> | 

<a name="new_Builder..RangeExpression_new"></a>

#### new RangeExpression(left, right)

| Param | Type |
| --- | --- |
| left | <code>[Expression](#Builder..Expression)</code> | 
| right | <code>[Expression](#Builder..Expression)</code> | 

<a name="Builder..RangeExpression+left"></a>

#### rangeExpression.left : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+0"></a>

#### rangeExpression.0 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+right"></a>

#### rangeExpression.right : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+1"></a>

#### rangeExpression.1 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+length"></a>

#### rangeExpression.length : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Default**: <code>2</code>  
<a name="Builder..RangeExpression+left"></a>

#### rangeExpression.left : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+0"></a>

#### rangeExpression.0 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+right"></a>

#### rangeExpression.right : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+1"></a>

#### rangeExpression.1 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+length"></a>

#### rangeExpression.length : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Default**: <code>2</code>  
<a name="Builder..Node+id"></a>

#### rangeExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### rangeExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..OperatorExpression"></a>

### Builder~OperatorExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~OperatorExpression](#Builder..OperatorExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
    * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..OperatorExpression_new"></a>

#### new OperatorExpression(expressionType, operator)

| Param | Type |
| --- | --- |
| expressionType | <code>[string](#external_string)</code> | 
| operator | <code>[string](#external_string)</code> | 

<a name="new_Builder..OperatorExpression_new"></a>

#### new OperatorExpression(expressionType, operator)

| Param | Type |
| --- | --- |
| expressionType | <code>[string](#external_string)</code> | 
| operator | <code>[string](#external_string)</code> | 

<a name="Builder..Node+id"></a>

#### operatorExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[OperatorExpression](#Builder..OperatorExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### operatorExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[OperatorExpression](#Builder..OperatorExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..RangeExpression"></a>

### Builder~RangeExpression ⇐ <code>[OperatorExpression](#Builder..OperatorExpression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[OperatorExpression](#Builder..OperatorExpression)</code>  

* [~RangeExpression](#Builder..RangeExpression) ⇐ <code>[OperatorExpression](#Builder..OperatorExpression)</code>
    * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
    * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
    * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
    * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
    * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
    * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
    * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
    * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
    * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
    * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
    * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
    * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..RangeExpression_new"></a>

#### new RangeExpression(left, right)

| Param | Type |
| --- | --- |
| left | <code>[Expression](#Builder..Expression)</code> | 
| right | <code>[Expression](#Builder..Expression)</code> | 

<a name="new_Builder..RangeExpression_new"></a>

#### new RangeExpression(left, right)

| Param | Type |
| --- | --- |
| left | <code>[Expression](#Builder..Expression)</code> | 
| right | <code>[Expression](#Builder..Expression)</code> | 

<a name="Builder..RangeExpression+left"></a>

#### rangeExpression.left : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+0"></a>

#### rangeExpression.0 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+right"></a>

#### rangeExpression.right : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+1"></a>

#### rangeExpression.1 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+length"></a>

#### rangeExpression.length : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Default**: <code>2</code>  
<a name="Builder..RangeExpression+left"></a>

#### rangeExpression.left : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+0"></a>

#### rangeExpression.0 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+right"></a>

#### rangeExpression.right : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+1"></a>

#### rangeExpression.1 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+length"></a>

#### rangeExpression.length : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Default**: <code>2</code>  
<a name="Builder..Node+id"></a>

#### rangeExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### rangeExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Node"></a>

### Builder~Node ⇐ <code>[Null](#Null)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Null](#Null)</code>  

* [~Node](#Builder..Node) ⇐ <code>[Null](#Null)</code>
    * [new Node(type)](#new_Builder..Node_new)
    * [new Node(type)](#new_Builder..Node_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Node_new"></a>

#### new Node(type)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | A node type |

<a name="new_Builder..Node_new"></a>

#### new Node(type)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | A node type |

<a name="Builder..Node+id"></a>

#### node.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Node+type"></a>

#### node.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Node+id"></a>

#### node.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Node+type"></a>

#### node.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Expression"></a>

### Builder~Expression ⇐ <code>[Node](#Builder..Node)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Node](#Builder..Node)</code>  

* [~Expression](#Builder..Expression) ⇐ <code>[Node](#Builder..Node)</code>
    * [new Expression(expressionType)](#new_Builder..Expression_new)
    * [new Expression(expressionType)](#new_Builder..Expression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Expression_new"></a>

#### new Expression(expressionType)

| Param | Type | Description |
| --- | --- | --- |
| expressionType | <code>[string](#external_string)</code> | A node type |

<a name="new_Builder..Expression_new"></a>

#### new Expression(expressionType)

| Param | Type | Description |
| --- | --- | --- |
| expressionType | <code>[string](#external_string)</code> | A node type |

<a name="Builder..Node+id"></a>

#### expression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Expression](#Builder..Expression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### expression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Expression](#Builder..Expression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Literal"></a>

### Builder~Literal ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~Literal](#Builder..Literal) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new Literal(value)](#new_Builder..Literal_new)
    * [new Literal(value)](#new_Builder..Literal_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Literal_new"></a>

#### new Literal(value)

| Param | Type | Description |
| --- | --- | --- |
| value | <code>[string](#external_string)</code> &#124; <code>[number](#external_number)</code> | The value of the literal |

<a name="new_Builder..Literal_new"></a>

#### new Literal(value)

| Param | Type | Description |
| --- | --- | --- |
| value | <code>[string](#external_string)</code> &#124; <code>[number](#external_number)</code> | The value of the literal |

<a name="Builder..Node+id"></a>

#### literal.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Literal](#Builder..Literal)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### literal.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Literal](#Builder..Literal)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..MemberExpression"></a>

### Builder~MemberExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~MemberExpression](#Builder..MemberExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
    * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..MemberExpression_new"></a>

#### new MemberExpression(object, property, computed)

| Param | Type | Default |
| --- | --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> |  | 
| property | <code>[Expression](#Builder..Expression)</code> &#124; <code>[Identifier](#Builder..Identifier)</code> |  | 
| computed | <code>[boolean](#external_boolean)</code> | <code>false</code> | 

<a name="new_Builder..MemberExpression_new"></a>

#### new MemberExpression(object, property, computed)

| Param | Type | Default |
| --- | --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> |  | 
| property | <code>[Expression](#Builder..Expression)</code> &#124; <code>[Identifier](#Builder..Identifier)</code> |  | 
| computed | <code>[boolean](#external_boolean)</code> | <code>false</code> | 

<a name="Builder..Node+id"></a>

#### memberExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[MemberExpression](#Builder..MemberExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### memberExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[MemberExpression](#Builder..MemberExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Program"></a>

### Builder~Program ⇐ <code>[Node](#Builder..Node)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Node](#Builder..Node)</code>  

* [~Program](#Builder..Program) ⇐ <code>[Node](#Builder..Node)</code>
    * [new Program(body)](#new_Builder..Program_new)
    * [new Program(body)](#new_Builder..Program_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Program_new"></a>

#### new Program(body)

| Param | Type |
| --- | --- |
| body | <code>[external:Array.&lt;Statement&gt;](#Builder..Statement)</code> | 

<a name="new_Builder..Program_new"></a>

#### new Program(body)

| Param | Type |
| --- | --- |
| body | <code>[external:Array.&lt;Statement&gt;](#Builder..Statement)</code> | 

<a name="Builder..Node+id"></a>

#### program.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Program](#Builder..Program)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### program.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Program](#Builder..Program)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Statement"></a>

### Builder~Statement ⇐ <code>[Node](#Builder..Node)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Node](#Builder..Node)</code>  

* [~Statement](#Builder..Statement) ⇐ <code>[Node](#Builder..Node)</code>
    * [new Statement(statementType)](#new_Builder..Statement_new)
    * [new Statement(statementType)](#new_Builder..Statement_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Statement_new"></a>

#### new Statement(statementType)

| Param | Type | Description |
| --- | --- | --- |
| statementType | <code>[string](#external_string)</code> | A node type |

<a name="new_Builder..Statement_new"></a>

#### new Statement(statementType)

| Param | Type | Description |
| --- | --- | --- |
| statementType | <code>[string](#external_string)</code> | A node type |

<a name="Builder..Node+id"></a>

#### statement.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Statement](#Builder..Statement)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### statement.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Statement](#Builder..Statement)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..ArrayExpression"></a>

### Builder~ArrayExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~ArrayExpression](#Builder..ArrayExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
    * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..ArrayExpression_new"></a>

#### new ArrayExpression(elements)

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>[external:Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | A list of expressions |

<a name="new_Builder..ArrayExpression_new"></a>

#### new ArrayExpression(elements)

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>[external:Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | A list of expressions |

<a name="Builder..Node+id"></a>

#### arrayExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[ArrayExpression](#Builder..ArrayExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### arrayExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[ArrayExpression](#Builder..ArrayExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..CallExpression"></a>

### Builder~CallExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~CallExpression](#Builder..CallExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
    * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..CallExpression_new"></a>

#### new CallExpression(callee, args)

| Param | Type |
| --- | --- |
| callee | <code>[Expression](#Builder..Expression)</code> | 
| args | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> | 

<a name="new_Builder..CallExpression_new"></a>

#### new CallExpression(callee, args)

| Param | Type |
| --- | --- |
| callee | <code>[Expression](#Builder..Expression)</code> | 
| args | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> | 

<a name="Builder..Node+id"></a>

#### callExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[CallExpression](#Builder..CallExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### callExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[CallExpression](#Builder..CallExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..ComputedMemberExpression"></a>

### Builder~ComputedMemberExpression ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[MemberExpression](#Builder..MemberExpression)</code>  

* [~ComputedMemberExpression](#Builder..ComputedMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
    * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
    * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
    * [.computed](#Builder..ComputedMemberExpression+computed)
    * [.computed](#Builder..ComputedMemberExpression+computed)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..ComputedMemberExpression_new"></a>

#### new ComputedMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Expression](#Builder..Expression)</code> | 

<a name="new_Builder..ComputedMemberExpression_new"></a>

#### new ComputedMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Expression](#Builder..Expression)</code> | 

<a name="Builder..ComputedMemberExpression+computed"></a>

#### computedMemberExpression.computed
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
<a name="Builder..ComputedMemberExpression+computed"></a>

#### computedMemberExpression.computed
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
<a name="Builder..Node+id"></a>

#### computedMemberExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### computedMemberExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..ExpressionStatement"></a>

### Builder~ExpressionStatement ⇐ <code>[Statement](#Builder..Statement)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Statement](#Builder..Statement)</code>  

* [~ExpressionStatement](#Builder..ExpressionStatement) ⇐ <code>[Statement](#Builder..Statement)</code>
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="Builder..Node+id"></a>

#### expressionStatement.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[ExpressionStatement](#Builder..ExpressionStatement)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### expressionStatement.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[ExpressionStatement](#Builder..ExpressionStatement)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Identifier"></a>

### Builder~Identifier ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~Identifier](#Builder..Identifier) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new Identifier(name)](#new_Builder..Identifier_new)
    * [new Identifier(name)](#new_Builder..Identifier_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Identifier_new"></a>

#### new Identifier(name)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>[string](#external_string)</code> | The name of the identifier |

<a name="new_Builder..Identifier_new"></a>

#### new Identifier(name)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>[string](#external_string)</code> | The name of the identifier |

<a name="Builder..Node+id"></a>

#### identifier.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Identifier](#Builder..Identifier)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### identifier.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Identifier](#Builder..Identifier)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..SequenceExpression"></a>

### Builder~SequenceExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~SequenceExpression](#Builder..SequenceExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
    * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..SequenceExpression_new"></a>

#### new SequenceExpression(expressions)

| Param | Type | Description |
| --- | --- | --- |
| expressions | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | The expressions in the sequence |

<a name="new_Builder..SequenceExpression_new"></a>

#### new SequenceExpression(expressions)

| Param | Type | Description |
| --- | --- | --- |
| expressions | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | The expressions in the sequence |

<a name="Builder..Node+id"></a>

#### sequenceExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[SequenceExpression](#Builder..SequenceExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### sequenceExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[SequenceExpression](#Builder..SequenceExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..StaticMemberExpression"></a>

### Builder~StaticMemberExpression ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[MemberExpression](#Builder..MemberExpression)</code>  

* [~StaticMemberExpression](#Builder..StaticMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
    * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
    * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
    * [.computed](#Builder..StaticMemberExpression+computed)
    * [.computed](#Builder..StaticMemberExpression+computed)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..StaticMemberExpression_new"></a>

#### new StaticMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Identifier](#Builder..Identifier)</code> | 

<a name="new_Builder..StaticMemberExpression_new"></a>

#### new StaticMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Identifier](#Builder..Identifier)</code> | 

<a name="Builder..StaticMemberExpression+computed"></a>

#### staticMemberExpression.computed
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
<a name="Builder..StaticMemberExpression+computed"></a>

#### staticMemberExpression.computed
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
<a name="Builder..Node+id"></a>

#### staticMemberExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### staticMemberExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Interpreter"></a>

## Interpreter ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  

* [Interpreter](#Interpreter) ⇐ <code>[Null](#Null)</code>
    * [new Interpreter(builder)](#new_Interpreter_new)
    * [new Interpreter(builder)](#new_Interpreter_new)
    * _instance_
        * [.builder](#Interpreter+builder) : <code>[Builder](#Builder)</code>
        * [.builder](#Interpreter+builder) : <code>[Builder](#Builder)</code>
        * [.compile(expression)](#Interpreter+compile)
        * [.recurse()](#Interpreter+recurse)
    * _inner_
        * [~returnZero()](#Interpreter..returnZero) ⇒ <code>[number](#external_number)</code>
        * [~returnZero()](#Interpreter..returnZero) ⇒ <code>[number](#external_number)</code>

<a name="new_Interpreter_new"></a>

### new Interpreter(builder)

| Param | Type |
| --- | --- |
| builder | <code>[Builder](#Builder)</code> | 

<a name="new_Interpreter_new"></a>

### new Interpreter(builder)

| Param | Type |
| --- | --- |
| builder | <code>[Builder](#Builder)</code> | 

<a name="Interpreter+builder"></a>

### interpreter.builder : <code>[Builder](#Builder)</code>
**Kind**: instance property of <code>[Interpreter](#Interpreter)</code>  
<a name="Interpreter+builder"></a>

### interpreter.builder : <code>[Builder](#Builder)</code>
**Kind**: instance property of <code>[Interpreter](#Interpreter)</code>  
<a name="Interpreter+compile"></a>

### interpreter.compile(expression)
**Kind**: instance method of <code>[Interpreter](#Interpreter)</code>  

| Param | Type |
| --- | --- |
| expression | <code>[string](#external_string)</code> | 

<a name="Interpreter+recurse"></a>

### interpreter.recurse()
**Kind**: instance method of <code>[Interpreter](#Interpreter)</code>  
<a name="Interpreter..returnZero"></a>

### Interpreter~returnZero() ⇒ <code>[number](#external_number)</code>
**Kind**: inner method of <code>[Interpreter](#Interpreter)</code>  
**Returns**: <code>[number](#external_number)</code> - zero  
<a name="Interpreter..returnZero"></a>

### Interpreter~returnZero() ⇒ <code>[number](#external_number)</code>
**Kind**: inner method of <code>[Interpreter](#Interpreter)</code>  
**Returns**: <code>[number](#external_number)</code> - zero  
<a name="Transducer"></a>

## Transducer ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  

* [Transducer](#Transducer) ⇐ <code>[Null](#Null)</code>
    * [new Transducer(xf)](#new_Transducer_new)
    * [new Transducer(xf)](#new_Transducer_new)
    * [.@@transducer/init()](#Transducer+@@transducer/init)
    * [.@@transducer/step()](#Transducer+@@transducer/step)
    * [.@@transducer/result()](#Transducer+@@transducer/result)
    * [.@@transducer/init()](#Transducer+@@transducer/init)
    * [.@@transducer/step()](#Transducer+@@transducer/step)
    * [.@@transducer/result()](#Transducer+@@transducer/result)
    * [.xfInit()](#Transducer+xfInit)
    * [.xfStep()](#Transducer+xfStep)
    * [.xfResult()](#Transducer+xfResult)

<a name="new_Transducer_new"></a>

### new Transducer(xf)

| Param | Type |
| --- | --- |
| xf | <code>[Function](#external_Function)</code> | 

<a name="new_Transducer_new"></a>

### new Transducer(xf)

| Param | Type |
| --- | --- |
| xf | <code>[Function](#external_Function)</code> | 

<a name="Transducer+@@transducer/init"></a>

### transducer.@@transducer/init()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+@@transducer/step"></a>

### transducer.@@transducer/step()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+@@transducer/result"></a>

### transducer.@@transducer/result()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+@@transducer/init"></a>

### transducer.@@transducer/init()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+@@transducer/step"></a>

### transducer.@@transducer/step()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+@@transducer/result"></a>

### transducer.@@transducer/result()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+xfInit"></a>

### transducer.xfInit()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+xfStep"></a>

### transducer.xfStep()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+xfResult"></a>

### transducer.xfResult()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="KeypathExp"></a>

## KeypathExp ⇐ <code>[Transducer](#Transducer)</code>
**Kind**: global class  
**Extends:** <code>[Transducer](#Transducer)</code>  

* [KeypathExp](#KeypathExp) ⇐ <code>[Transducer](#Transducer)</code>
    * [new KeypathExp(pattern, flags)](#new_KeypathExp_new)
    * [new KeypathExp(pattern, flags)](#new_KeypathExp_new)
    * [.@@transducer/step()](#KeypathExp+@@transducer/step)
    * [.get()](#KeypathExp+get)
    * [.has()](#KeypathExp+has)
    * [.@@transducer/step()](#KeypathExp+@@transducer/step)
    * [.set()](#KeypathExp+set)
    * [.toJSON()](#KeypathExp+toJSON)
    * [.toString()](#KeypathExp+toString)
    * [.@@transducer/init()](#Transducer+@@transducer/init)
    * [.@@transducer/result()](#Transducer+@@transducer/result)
    * [.xfInit()](#Transducer+xfInit)
    * [.xfStep()](#Transducer+xfStep)
    * [.xfResult()](#Transducer+xfResult)

<a name="new_KeypathExp_new"></a>

### new KeypathExp(pattern, flags)

| Param | Type |
| --- | --- |
| pattern | <code>[string](#external_string)</code> | 
| flags | <code>[string](#external_string)</code> | 

<a name="new_KeypathExp_new"></a>

### new KeypathExp(pattern, flags)

| Param | Type |
| --- | --- |
| pattern | <code>[string](#external_string)</code> | 
| flags | <code>[string](#external_string)</code> | 

<a name="KeypathExp+@@transducer/step"></a>

### keypathExp.@@transducer/step()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[@@transducer/step](#Transducer+@@transducer/step)</code>  
<a name="KeypathExp+get"></a>

### keypathExp.get()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
<a name="KeypathExp+has"></a>

### keypathExp.has()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
<a name="KeypathExp+@@transducer/step"></a>

### keypathExp.@@transducer/step()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[@@transducer/step](#Transducer+@@transducer/step)</code>  
<a name="KeypathExp+set"></a>

### keypathExp.set()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
<a name="KeypathExp+toJSON"></a>

### keypathExp.toJSON()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
<a name="KeypathExp+toString"></a>

### keypathExp.toString()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
<a name="Transducer+@@transducer/init"></a>

### keypathExp.@@transducer/init()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[@@transducer/init](#Transducer+@@transducer/init)</code>  
<a name="Transducer+@@transducer/result"></a>

### keypathExp.@@transducer/result()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[@@transducer/result](#Transducer+@@transducer/result)</code>  
<a name="Transducer+xfInit"></a>

### keypathExp.xfInit()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[xfInit](#Transducer+xfInit)</code>  
<a name="Transducer+xfStep"></a>

### keypathExp.xfStep()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[xfStep](#Transducer+xfStep)</code>  
<a name="Transducer+xfResult"></a>

### keypathExp.xfResult()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[xfResult](#Transducer+xfResult)</code>  
<a name="Builder"></a>

## Builder ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  

* [Builder](#Builder) ⇐ <code>[Null](#Null)</code>
    * [new Builder(lexer)](#new_Builder_new)
    * [new Builder(lexer)](#new_Builder_new)
    * _instance_
        * [.build(input)](#Builder+build) ⇒ <code>Program</code>
            * [.text](#Builder+build+text) : <code>[string](#external_string)</code>
            * [.tokens](#Builder+build+tokens) : <code>external:Array.&lt;Token&gt;</code>
        * [.callExpression()](#Builder+callExpression) ⇒ <code>CallExpression</code>
        * [.consume([expected])](#Builder+consume) ⇒ <code>Token</code>
        * [.expect([first], [second], [third], [fourth])](#Builder+expect) ⇒ <code>Token</code>
        * [.expression()](#Builder+expression) ⇒ <code>Expression</code>
        * [.expressionStatement()](#Builder+expressionStatement) ⇒ <code>ExpressionStatement</code>
        * [.identifier()](#Builder+identifier) ⇒ <code>Identifier</code>
        * [.list(terminator)](#Builder+list) ⇒ <code>external:Array.&lt;Expression&gt;</code> &#124; <code>RangeExpression</code>
        * [.literal()](#Builder+literal) ⇒ <code>Literal</code>
        * [.memberExpression(property, computed)](#Builder+memberExpression) ⇒ <code>MemberExpression</code>
        * [.peek([first], [second], [third], [fourth])](#Builder+peek) ⇒ <code>[Token](#Lexer..Token)</code>
        * [.peekAt(position, [first], [second], [third], [fourth])](#Builder+peekAt) ⇒ <code>[Token](#Lexer..Token)</code>
        * [.program()](#Builder+program) ⇒ <code>Program</code>
        * [.throwError(message)](#Builder+throwError)
    * _inner_
        * [~Node](#Builder..Node) ⇐ <code>[Null](#Null)</code>
            * [new Node(type)](#new_Builder..Node_new)
            * [new Node(type)](#new_Builder..Node_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Expression](#Builder..Expression) ⇐ <code>[Node](#Builder..Node)</code>
            * [new Expression(expressionType)](#new_Builder..Expression_new)
            * [new Expression(expressionType)](#new_Builder..Expression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Literal](#Builder..Literal) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new Literal(value)](#new_Builder..Literal_new)
            * [new Literal(value)](#new_Builder..Literal_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~MemberExpression](#Builder..MemberExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
            * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Program](#Builder..Program) ⇐ <code>[Node](#Builder..Node)</code>
            * [new Program(body)](#new_Builder..Program_new)
            * [new Program(body)](#new_Builder..Program_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Statement](#Builder..Statement) ⇐ <code>[Node](#Builder..Node)</code>
            * [new Statement(statementType)](#new_Builder..Statement_new)
            * [new Statement(statementType)](#new_Builder..Statement_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~ArrayExpression](#Builder..ArrayExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
            * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~CallExpression](#Builder..CallExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
            * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~ComputedMemberExpression](#Builder..ComputedMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
            * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
            * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
            * [.computed](#Builder..ComputedMemberExpression+computed)
            * [.computed](#Builder..ComputedMemberExpression+computed)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~ExpressionStatement](#Builder..ExpressionStatement) ⇐ <code>[Statement](#Builder..Statement)</code>
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Identifier](#Builder..Identifier) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new Identifier(name)](#new_Builder..Identifier_new)
            * [new Identifier(name)](#new_Builder..Identifier_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~SequenceExpression](#Builder..SequenceExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
            * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~StaticMemberExpression](#Builder..StaticMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
            * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
            * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
            * [.computed](#Builder..StaticMemberExpression+computed)
            * [.computed](#Builder..StaticMemberExpression+computed)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~OperatorExpression](#Builder..OperatorExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
            * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~RangeExpression](#Builder..RangeExpression) ⇐ <code>[OperatorExpression](#Builder..OperatorExpression)</code>
            * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
            * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
            * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
            * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
            * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
            * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
            * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
            * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
            * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
            * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
            * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
            * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~OperatorExpression](#Builder..OperatorExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
            * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~RangeExpression](#Builder..RangeExpression) ⇐ <code>[OperatorExpression](#Builder..OperatorExpression)</code>
            * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
            * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
            * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
            * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
            * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
            * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
            * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
            * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
            * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
            * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
            * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
            * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Node](#Builder..Node) ⇐ <code>[Null](#Null)</code>
            * [new Node(type)](#new_Builder..Node_new)
            * [new Node(type)](#new_Builder..Node_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Expression](#Builder..Expression) ⇐ <code>[Node](#Builder..Node)</code>
            * [new Expression(expressionType)](#new_Builder..Expression_new)
            * [new Expression(expressionType)](#new_Builder..Expression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Literal](#Builder..Literal) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new Literal(value)](#new_Builder..Literal_new)
            * [new Literal(value)](#new_Builder..Literal_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~MemberExpression](#Builder..MemberExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
            * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Program](#Builder..Program) ⇐ <code>[Node](#Builder..Node)</code>
            * [new Program(body)](#new_Builder..Program_new)
            * [new Program(body)](#new_Builder..Program_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Statement](#Builder..Statement) ⇐ <code>[Node](#Builder..Node)</code>
            * [new Statement(statementType)](#new_Builder..Statement_new)
            * [new Statement(statementType)](#new_Builder..Statement_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~ArrayExpression](#Builder..ArrayExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
            * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~CallExpression](#Builder..CallExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
            * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~ComputedMemberExpression](#Builder..ComputedMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
            * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
            * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
            * [.computed](#Builder..ComputedMemberExpression+computed)
            * [.computed](#Builder..ComputedMemberExpression+computed)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~ExpressionStatement](#Builder..ExpressionStatement) ⇐ <code>[Statement](#Builder..Statement)</code>
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~Identifier](#Builder..Identifier) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new Identifier(name)](#new_Builder..Identifier_new)
            * [new Identifier(name)](#new_Builder..Identifier_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~SequenceExpression](#Builder..SequenceExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
            * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
            * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
        * [~StaticMemberExpression](#Builder..StaticMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
            * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
            * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
            * [.computed](#Builder..StaticMemberExpression+computed)
            * [.computed](#Builder..StaticMemberExpression+computed)
            * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
            * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder_new"></a>

### new Builder(lexer)

| Param | Type |
| --- | --- |
| lexer | <code>[Lexer](#Lexer)</code> | 

<a name="new_Builder_new"></a>

### new Builder(lexer)

| Param | Type |
| --- | --- |
| lexer | <code>[Lexer](#Lexer)</code> | 

<a name="Builder+build"></a>

### builder.build(input) ⇒ <code>Program</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Program</code> - The built abstract syntax tree  

| Param | Type |
| --- | --- |
| input | <code>[string](#external_string)</code> &#124; <code>Array.&lt;Builder~Token&gt;</code> | 


* [.build(input)](#Builder+build) ⇒ <code>Program</code>
    * [.text](#Builder+build+text) : <code>[string](#external_string)</code>
    * [.tokens](#Builder+build+tokens) : <code>external:Array.&lt;Token&gt;</code>

<a name="Builder+build+text"></a>

#### build.text : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[build](#Builder+build)</code>  
<a name="Builder+build+tokens"></a>

#### build.tokens : <code>external:Array.&lt;Token&gt;</code>
**Kind**: instance property of <code>[build](#Builder+build)</code>  
<a name="Builder+callExpression"></a>

### builder.callExpression() ⇒ <code>CallExpression</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>CallExpression</code> - The call expression node  
<a name="Builder+consume"></a>

### builder.consume([expected]) ⇒ <code>Token</code>
Removes the next token in the token list. If a comparison is provided, the token will only be returned if the value matches. Otherwise an error is thrown.

**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Token</code> - The next token in the list  
**Throws**:

- <code>SyntaxError</code> If token did not exist


| Param | Type | Description |
| --- | --- | --- |
| [expected] | <code>[string](#external_string)</code> | An expected comparison value |

<a name="Builder+expect"></a>

### builder.expect([first], [second], [third], [fourth]) ⇒ <code>Token</code>
Removes the next token in the token list. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.

**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Token</code> - The next token in the list or `undefined` if it did not exist  

| Param | Type | Description |
| --- | --- | --- |
| [first] | <code>[string](#external_string)</code> | The first comparison value |
| [second] | <code>[string](#external_string)</code> | The second comparison value |
| [third] | <code>[string](#external_string)</code> | The third comparison value |
| [fourth] | <code>[string](#external_string)</code> | The fourth comparison value |

<a name="Builder+expression"></a>

### builder.expression() ⇒ <code>Expression</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Expression</code> - An expression node  
<a name="Builder+expressionStatement"></a>

### builder.expressionStatement() ⇒ <code>ExpressionStatement</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>ExpressionStatement</code> - An expression statement  
<a name="Builder+identifier"></a>

### builder.identifier() ⇒ <code>Identifier</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Identifier</code> - An identifier  
**Throws**:

- <code>SyntaxError</code> If the token is not an identifier

<a name="Builder+list"></a>

### builder.list(terminator) ⇒ <code>external:Array.&lt;Expression&gt;</code> &#124; <code>RangeExpression</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>external:Array.&lt;Expression&gt;</code> &#124; <code>RangeExpression</code> - The list of expressions or range expression  

| Param | Type |
| --- | --- |
| terminator | <code>[string](#external_string)</code> | 

<a name="Builder+literal"></a>

### builder.literal() ⇒ <code>Literal</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Literal</code> - The literal node  
<a name="Builder+memberExpression"></a>

### builder.memberExpression(property, computed) ⇒ <code>MemberExpression</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>MemberExpression</code> - The member expression  

| Param | Type | Description |
| --- | --- | --- |
| property | <code>Expression</code> | The expression assigned to the property of the member expression |
| computed | <code>[boolean](#external_boolean)</code> | Whether or not the member expression is computed |

<a name="Builder+peek"></a>

### builder.peek([first], [second], [third], [fourth]) ⇒ <code>[Token](#Lexer..Token)</code>
Provides the next token in the token list _without removing it_. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.

**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>[Token](#Lexer..Token)</code> - The next token in the list or `undefined` if it did not exist  

| Param | Type | Description |
| --- | --- | --- |
| [first] | <code>[string](#external_string)</code> | The first comparison value |
| [second] | <code>[string](#external_string)</code> | The second comparison value |
| [third] | <code>[string](#external_string)</code> | The third comparison value |
| [fourth] | <code>[string](#external_string)</code> | The fourth comparison value |

<a name="Builder+peekAt"></a>

### builder.peekAt(position, [first], [second], [third], [fourth]) ⇒ <code>[Token](#Lexer..Token)</code>
Provides the token at the requested position _without removing it_ from the token list. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.

**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>[Token](#Lexer..Token)</code> - The token at the requested position or `undefined` if it did not exist  

| Param | Type | Description |
| --- | --- | --- |
| position | <code>[number](#external_number)</code> | The position where the token will be peeked |
| [first] | <code>[string](#external_string)</code> | The first comparison value |
| [second] | <code>[string](#external_string)</code> | The second comparison value |
| [third] | <code>[string](#external_string)</code> | The third comparison value |
| [fourth] | <code>[string](#external_string)</code> | The fourth comparison value |

<a name="Builder+program"></a>

### builder.program() ⇒ <code>Program</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>Program</code> - A program node  
<a name="Builder+throwError"></a>

### builder.throwError(message)
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Throws**:

- <code>[SyntaxError](#external_SyntaxError)</code> When it executes


| Param | Type | Description |
| --- | --- | --- |
| message | <code>[string](#external_string)</code> | The error message |

<a name="Builder..Node"></a>

### Builder~Node ⇐ <code>[Null](#Null)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Null](#Null)</code>  

* [~Node](#Builder..Node) ⇐ <code>[Null](#Null)</code>
    * [new Node(type)](#new_Builder..Node_new)
    * [new Node(type)](#new_Builder..Node_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Node_new"></a>

#### new Node(type)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | A node type |

<a name="new_Builder..Node_new"></a>

#### new Node(type)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | A node type |

<a name="Builder..Node+id"></a>

#### node.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Node+type"></a>

#### node.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Node+id"></a>

#### node.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Node+type"></a>

#### node.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Expression"></a>

### Builder~Expression ⇐ <code>[Node](#Builder..Node)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Node](#Builder..Node)</code>  

* [~Expression](#Builder..Expression) ⇐ <code>[Node](#Builder..Node)</code>
    * [new Expression(expressionType)](#new_Builder..Expression_new)
    * [new Expression(expressionType)](#new_Builder..Expression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Expression_new"></a>

#### new Expression(expressionType)

| Param | Type | Description |
| --- | --- | --- |
| expressionType | <code>[string](#external_string)</code> | A node type |

<a name="new_Builder..Expression_new"></a>

#### new Expression(expressionType)

| Param | Type | Description |
| --- | --- | --- |
| expressionType | <code>[string](#external_string)</code> | A node type |

<a name="Builder..Node+id"></a>

#### expression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Expression](#Builder..Expression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### expression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Expression](#Builder..Expression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Literal"></a>

### Builder~Literal ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~Literal](#Builder..Literal) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new Literal(value)](#new_Builder..Literal_new)
    * [new Literal(value)](#new_Builder..Literal_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Literal_new"></a>

#### new Literal(value)

| Param | Type | Description |
| --- | --- | --- |
| value | <code>[string](#external_string)</code> &#124; <code>[number](#external_number)</code> | The value of the literal |

<a name="new_Builder..Literal_new"></a>

#### new Literal(value)

| Param | Type | Description |
| --- | --- | --- |
| value | <code>[string](#external_string)</code> &#124; <code>[number](#external_number)</code> | The value of the literal |

<a name="Builder..Node+id"></a>

#### literal.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Literal](#Builder..Literal)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### literal.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Literal](#Builder..Literal)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..MemberExpression"></a>

### Builder~MemberExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~MemberExpression](#Builder..MemberExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
    * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..MemberExpression_new"></a>

#### new MemberExpression(object, property, computed)

| Param | Type | Default |
| --- | --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> |  | 
| property | <code>[Expression](#Builder..Expression)</code> &#124; <code>[Identifier](#Builder..Identifier)</code> |  | 
| computed | <code>[boolean](#external_boolean)</code> | <code>false</code> | 

<a name="new_Builder..MemberExpression_new"></a>

#### new MemberExpression(object, property, computed)

| Param | Type | Default |
| --- | --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> |  | 
| property | <code>[Expression](#Builder..Expression)</code> &#124; <code>[Identifier](#Builder..Identifier)</code> |  | 
| computed | <code>[boolean](#external_boolean)</code> | <code>false</code> | 

<a name="Builder..Node+id"></a>

#### memberExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[MemberExpression](#Builder..MemberExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### memberExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[MemberExpression](#Builder..MemberExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Program"></a>

### Builder~Program ⇐ <code>[Node](#Builder..Node)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Node](#Builder..Node)</code>  

* [~Program](#Builder..Program) ⇐ <code>[Node](#Builder..Node)</code>
    * [new Program(body)](#new_Builder..Program_new)
    * [new Program(body)](#new_Builder..Program_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Program_new"></a>

#### new Program(body)

| Param | Type |
| --- | --- |
| body | <code>[external:Array.&lt;Statement&gt;](#Builder..Statement)</code> | 

<a name="new_Builder..Program_new"></a>

#### new Program(body)

| Param | Type |
| --- | --- |
| body | <code>[external:Array.&lt;Statement&gt;](#Builder..Statement)</code> | 

<a name="Builder..Node+id"></a>

#### program.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Program](#Builder..Program)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### program.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Program](#Builder..Program)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Statement"></a>

### Builder~Statement ⇐ <code>[Node](#Builder..Node)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Node](#Builder..Node)</code>  

* [~Statement](#Builder..Statement) ⇐ <code>[Node](#Builder..Node)</code>
    * [new Statement(statementType)](#new_Builder..Statement_new)
    * [new Statement(statementType)](#new_Builder..Statement_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Statement_new"></a>

#### new Statement(statementType)

| Param | Type | Description |
| --- | --- | --- |
| statementType | <code>[string](#external_string)</code> | A node type |

<a name="new_Builder..Statement_new"></a>

#### new Statement(statementType)

| Param | Type | Description |
| --- | --- | --- |
| statementType | <code>[string](#external_string)</code> | A node type |

<a name="Builder..Node+id"></a>

#### statement.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Statement](#Builder..Statement)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### statement.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Statement](#Builder..Statement)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..ArrayExpression"></a>

### Builder~ArrayExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~ArrayExpression](#Builder..ArrayExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
    * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..ArrayExpression_new"></a>

#### new ArrayExpression(elements)

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>[external:Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | A list of expressions |

<a name="new_Builder..ArrayExpression_new"></a>

#### new ArrayExpression(elements)

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>[external:Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | A list of expressions |

<a name="Builder..Node+id"></a>

#### arrayExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[ArrayExpression](#Builder..ArrayExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### arrayExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[ArrayExpression](#Builder..ArrayExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..CallExpression"></a>

### Builder~CallExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~CallExpression](#Builder..CallExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
    * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..CallExpression_new"></a>

#### new CallExpression(callee, args)

| Param | Type |
| --- | --- |
| callee | <code>[Expression](#Builder..Expression)</code> | 
| args | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> | 

<a name="new_Builder..CallExpression_new"></a>

#### new CallExpression(callee, args)

| Param | Type |
| --- | --- |
| callee | <code>[Expression](#Builder..Expression)</code> | 
| args | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> | 

<a name="Builder..Node+id"></a>

#### callExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[CallExpression](#Builder..CallExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### callExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[CallExpression](#Builder..CallExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..ComputedMemberExpression"></a>

### Builder~ComputedMemberExpression ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[MemberExpression](#Builder..MemberExpression)</code>  

* [~ComputedMemberExpression](#Builder..ComputedMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
    * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
    * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
    * [.computed](#Builder..ComputedMemberExpression+computed)
    * [.computed](#Builder..ComputedMemberExpression+computed)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..ComputedMemberExpression_new"></a>

#### new ComputedMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Expression](#Builder..Expression)</code> | 

<a name="new_Builder..ComputedMemberExpression_new"></a>

#### new ComputedMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Expression](#Builder..Expression)</code> | 

<a name="Builder..ComputedMemberExpression+computed"></a>

#### computedMemberExpression.computed
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
<a name="Builder..ComputedMemberExpression+computed"></a>

#### computedMemberExpression.computed
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
<a name="Builder..Node+id"></a>

#### computedMemberExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### computedMemberExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..ExpressionStatement"></a>

### Builder~ExpressionStatement ⇐ <code>[Statement](#Builder..Statement)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Statement](#Builder..Statement)</code>  

* [~ExpressionStatement](#Builder..ExpressionStatement) ⇐ <code>[Statement](#Builder..Statement)</code>
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="Builder..Node+id"></a>

#### expressionStatement.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[ExpressionStatement](#Builder..ExpressionStatement)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### expressionStatement.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[ExpressionStatement](#Builder..ExpressionStatement)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Identifier"></a>

### Builder~Identifier ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~Identifier](#Builder..Identifier) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new Identifier(name)](#new_Builder..Identifier_new)
    * [new Identifier(name)](#new_Builder..Identifier_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Identifier_new"></a>

#### new Identifier(name)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>[string](#external_string)</code> | The name of the identifier |

<a name="new_Builder..Identifier_new"></a>

#### new Identifier(name)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>[string](#external_string)</code> | The name of the identifier |

<a name="Builder..Node+id"></a>

#### identifier.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Identifier](#Builder..Identifier)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### identifier.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Identifier](#Builder..Identifier)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..SequenceExpression"></a>

### Builder~SequenceExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~SequenceExpression](#Builder..SequenceExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
    * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..SequenceExpression_new"></a>

#### new SequenceExpression(expressions)

| Param | Type | Description |
| --- | --- | --- |
| expressions | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | The expressions in the sequence |

<a name="new_Builder..SequenceExpression_new"></a>

#### new SequenceExpression(expressions)

| Param | Type | Description |
| --- | --- | --- |
| expressions | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | The expressions in the sequence |

<a name="Builder..Node+id"></a>

#### sequenceExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[SequenceExpression](#Builder..SequenceExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### sequenceExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[SequenceExpression](#Builder..SequenceExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..StaticMemberExpression"></a>

### Builder~StaticMemberExpression ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[MemberExpression](#Builder..MemberExpression)</code>  

* [~StaticMemberExpression](#Builder..StaticMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
    * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
    * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
    * [.computed](#Builder..StaticMemberExpression+computed)
    * [.computed](#Builder..StaticMemberExpression+computed)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..StaticMemberExpression_new"></a>

#### new StaticMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Identifier](#Builder..Identifier)</code> | 

<a name="new_Builder..StaticMemberExpression_new"></a>

#### new StaticMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Identifier](#Builder..Identifier)</code> | 

<a name="Builder..StaticMemberExpression+computed"></a>

#### staticMemberExpression.computed
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
<a name="Builder..StaticMemberExpression+computed"></a>

#### staticMemberExpression.computed
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
<a name="Builder..Node+id"></a>

#### staticMemberExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### staticMemberExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..OperatorExpression"></a>

### Builder~OperatorExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~OperatorExpression](#Builder..OperatorExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
    * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..OperatorExpression_new"></a>

#### new OperatorExpression(expressionType, operator)

| Param | Type |
| --- | --- |
| expressionType | <code>[string](#external_string)</code> | 
| operator | <code>[string](#external_string)</code> | 

<a name="new_Builder..OperatorExpression_new"></a>

#### new OperatorExpression(expressionType, operator)

| Param | Type |
| --- | --- |
| expressionType | <code>[string](#external_string)</code> | 
| operator | <code>[string](#external_string)</code> | 

<a name="Builder..Node+id"></a>

#### operatorExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[OperatorExpression](#Builder..OperatorExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### operatorExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[OperatorExpression](#Builder..OperatorExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..RangeExpression"></a>

### Builder~RangeExpression ⇐ <code>[OperatorExpression](#Builder..OperatorExpression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[OperatorExpression](#Builder..OperatorExpression)</code>  

* [~RangeExpression](#Builder..RangeExpression) ⇐ <code>[OperatorExpression](#Builder..OperatorExpression)</code>
    * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
    * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
    * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
    * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
    * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
    * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
    * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
    * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
    * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
    * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
    * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
    * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..RangeExpression_new"></a>

#### new RangeExpression(left, right)

| Param | Type |
| --- | --- |
| left | <code>[Expression](#Builder..Expression)</code> | 
| right | <code>[Expression](#Builder..Expression)</code> | 

<a name="new_Builder..RangeExpression_new"></a>

#### new RangeExpression(left, right)

| Param | Type |
| --- | --- |
| left | <code>[Expression](#Builder..Expression)</code> | 
| right | <code>[Expression](#Builder..Expression)</code> | 

<a name="Builder..RangeExpression+left"></a>

#### rangeExpression.left : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+0"></a>

#### rangeExpression.0 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+right"></a>

#### rangeExpression.right : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+1"></a>

#### rangeExpression.1 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+length"></a>

#### rangeExpression.length : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Default**: <code>2</code>  
<a name="Builder..RangeExpression+left"></a>

#### rangeExpression.left : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+0"></a>

#### rangeExpression.0 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+right"></a>

#### rangeExpression.right : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+1"></a>

#### rangeExpression.1 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+length"></a>

#### rangeExpression.length : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Default**: <code>2</code>  
<a name="Builder..Node+id"></a>

#### rangeExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### rangeExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..OperatorExpression"></a>

### Builder~OperatorExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~OperatorExpression](#Builder..OperatorExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
    * [new OperatorExpression(expressionType, operator)](#new_Builder..OperatorExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..OperatorExpression_new"></a>

#### new OperatorExpression(expressionType, operator)

| Param | Type |
| --- | --- |
| expressionType | <code>[string](#external_string)</code> | 
| operator | <code>[string](#external_string)</code> | 

<a name="new_Builder..OperatorExpression_new"></a>

#### new OperatorExpression(expressionType, operator)

| Param | Type |
| --- | --- |
| expressionType | <code>[string](#external_string)</code> | 
| operator | <code>[string](#external_string)</code> | 

<a name="Builder..Node+id"></a>

#### operatorExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[OperatorExpression](#Builder..OperatorExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### operatorExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[OperatorExpression](#Builder..OperatorExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..RangeExpression"></a>

### Builder~RangeExpression ⇐ <code>[OperatorExpression](#Builder..OperatorExpression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[OperatorExpression](#Builder..OperatorExpression)</code>  

* [~RangeExpression](#Builder..RangeExpression) ⇐ <code>[OperatorExpression](#Builder..OperatorExpression)</code>
    * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
    * [new RangeExpression(left, right)](#new_Builder..RangeExpression_new)
    * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
    * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
    * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
    * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
    * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
    * [.left](#Builder..RangeExpression+left) : <code>[Literal](#Builder..Literal)</code>
    * [.0](#Builder..RangeExpression+0) : <code>[Literal](#Builder..Literal)</code>
    * [.right](#Builder..RangeExpression+right) : <code>[Literal](#Builder..Literal)</code>
    * [.1](#Builder..RangeExpression+1) : <code>[Literal](#Builder..Literal)</code>
    * [.length](#Builder..RangeExpression+length) : <code>[number](#external_number)</code>
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..RangeExpression_new"></a>

#### new RangeExpression(left, right)

| Param | Type |
| --- | --- |
| left | <code>[Expression](#Builder..Expression)</code> | 
| right | <code>[Expression](#Builder..Expression)</code> | 

<a name="new_Builder..RangeExpression_new"></a>

#### new RangeExpression(left, right)

| Param | Type |
| --- | --- |
| left | <code>[Expression](#Builder..Expression)</code> | 
| right | <code>[Expression](#Builder..Expression)</code> | 

<a name="Builder..RangeExpression+left"></a>

#### rangeExpression.left : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+0"></a>

#### rangeExpression.0 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+right"></a>

#### rangeExpression.right : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+1"></a>

#### rangeExpression.1 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+length"></a>

#### rangeExpression.length : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Default**: <code>2</code>  
<a name="Builder..RangeExpression+left"></a>

#### rangeExpression.left : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+0"></a>

#### rangeExpression.0 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+right"></a>

#### rangeExpression.right : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+1"></a>

#### rangeExpression.1 : <code>[Literal](#Builder..Literal)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
<a name="Builder..RangeExpression+length"></a>

#### rangeExpression.length : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Default**: <code>2</code>  
<a name="Builder..Node+id"></a>

#### rangeExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### rangeExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[RangeExpression](#Builder..RangeExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Node"></a>

### Builder~Node ⇐ <code>[Null](#Null)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Null](#Null)</code>  

* [~Node](#Builder..Node) ⇐ <code>[Null](#Null)</code>
    * [new Node(type)](#new_Builder..Node_new)
    * [new Node(type)](#new_Builder..Node_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Node_new"></a>

#### new Node(type)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | A node type |

<a name="new_Builder..Node_new"></a>

#### new Node(type)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | A node type |

<a name="Builder..Node+id"></a>

#### node.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Node+type"></a>

#### node.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Node+id"></a>

#### node.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Node+type"></a>

#### node.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Node](#Builder..Node)</code>  
<a name="Builder..Expression"></a>

### Builder~Expression ⇐ <code>[Node](#Builder..Node)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Node](#Builder..Node)</code>  

* [~Expression](#Builder..Expression) ⇐ <code>[Node](#Builder..Node)</code>
    * [new Expression(expressionType)](#new_Builder..Expression_new)
    * [new Expression(expressionType)](#new_Builder..Expression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Expression_new"></a>

#### new Expression(expressionType)

| Param | Type | Description |
| --- | --- | --- |
| expressionType | <code>[string](#external_string)</code> | A node type |

<a name="new_Builder..Expression_new"></a>

#### new Expression(expressionType)

| Param | Type | Description |
| --- | --- | --- |
| expressionType | <code>[string](#external_string)</code> | A node type |

<a name="Builder..Node+id"></a>

#### expression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Expression](#Builder..Expression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### expression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Expression](#Builder..Expression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Literal"></a>

### Builder~Literal ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~Literal](#Builder..Literal) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new Literal(value)](#new_Builder..Literal_new)
    * [new Literal(value)](#new_Builder..Literal_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Literal_new"></a>

#### new Literal(value)

| Param | Type | Description |
| --- | --- | --- |
| value | <code>[string](#external_string)</code> &#124; <code>[number](#external_number)</code> | The value of the literal |

<a name="new_Builder..Literal_new"></a>

#### new Literal(value)

| Param | Type | Description |
| --- | --- | --- |
| value | <code>[string](#external_string)</code> &#124; <code>[number](#external_number)</code> | The value of the literal |

<a name="Builder..Node+id"></a>

#### literal.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Literal](#Builder..Literal)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### literal.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Literal](#Builder..Literal)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..MemberExpression"></a>

### Builder~MemberExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~MemberExpression](#Builder..MemberExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
    * [new MemberExpression(object, property, computed)](#new_Builder..MemberExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..MemberExpression_new"></a>

#### new MemberExpression(object, property, computed)

| Param | Type | Default |
| --- | --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> |  | 
| property | <code>[Expression](#Builder..Expression)</code> &#124; <code>[Identifier](#Builder..Identifier)</code> |  | 
| computed | <code>[boolean](#external_boolean)</code> | <code>false</code> | 

<a name="new_Builder..MemberExpression_new"></a>

#### new MemberExpression(object, property, computed)

| Param | Type | Default |
| --- | --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> |  | 
| property | <code>[Expression](#Builder..Expression)</code> &#124; <code>[Identifier](#Builder..Identifier)</code> |  | 
| computed | <code>[boolean](#external_boolean)</code> | <code>false</code> | 

<a name="Builder..Node+id"></a>

#### memberExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[MemberExpression](#Builder..MemberExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### memberExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[MemberExpression](#Builder..MemberExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Program"></a>

### Builder~Program ⇐ <code>[Node](#Builder..Node)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Node](#Builder..Node)</code>  

* [~Program](#Builder..Program) ⇐ <code>[Node](#Builder..Node)</code>
    * [new Program(body)](#new_Builder..Program_new)
    * [new Program(body)](#new_Builder..Program_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Program_new"></a>

#### new Program(body)

| Param | Type |
| --- | --- |
| body | <code>[external:Array.&lt;Statement&gt;](#Builder..Statement)</code> | 

<a name="new_Builder..Program_new"></a>

#### new Program(body)

| Param | Type |
| --- | --- |
| body | <code>[external:Array.&lt;Statement&gt;](#Builder..Statement)</code> | 

<a name="Builder..Node+id"></a>

#### program.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Program](#Builder..Program)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### program.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Program](#Builder..Program)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Statement"></a>

### Builder~Statement ⇐ <code>[Node](#Builder..Node)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Node](#Builder..Node)</code>  

* [~Statement](#Builder..Statement) ⇐ <code>[Node](#Builder..Node)</code>
    * [new Statement(statementType)](#new_Builder..Statement_new)
    * [new Statement(statementType)](#new_Builder..Statement_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Statement_new"></a>

#### new Statement(statementType)

| Param | Type | Description |
| --- | --- | --- |
| statementType | <code>[string](#external_string)</code> | A node type |

<a name="new_Builder..Statement_new"></a>

#### new Statement(statementType)

| Param | Type | Description |
| --- | --- | --- |
| statementType | <code>[string](#external_string)</code> | A node type |

<a name="Builder..Node+id"></a>

#### statement.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Statement](#Builder..Statement)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### statement.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Statement](#Builder..Statement)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..ArrayExpression"></a>

### Builder~ArrayExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~ArrayExpression](#Builder..ArrayExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
    * [new ArrayExpression(elements)](#new_Builder..ArrayExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..ArrayExpression_new"></a>

#### new ArrayExpression(elements)

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>[external:Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | A list of expressions |

<a name="new_Builder..ArrayExpression_new"></a>

#### new ArrayExpression(elements)

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>[external:Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | A list of expressions |

<a name="Builder..Node+id"></a>

#### arrayExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[ArrayExpression](#Builder..ArrayExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### arrayExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[ArrayExpression](#Builder..ArrayExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..CallExpression"></a>

### Builder~CallExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~CallExpression](#Builder..CallExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
    * [new CallExpression(callee, args)](#new_Builder..CallExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..CallExpression_new"></a>

#### new CallExpression(callee, args)

| Param | Type |
| --- | --- |
| callee | <code>[Expression](#Builder..Expression)</code> | 
| args | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> | 

<a name="new_Builder..CallExpression_new"></a>

#### new CallExpression(callee, args)

| Param | Type |
| --- | --- |
| callee | <code>[Expression](#Builder..Expression)</code> | 
| args | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> | 

<a name="Builder..Node+id"></a>

#### callExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[CallExpression](#Builder..CallExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### callExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[CallExpression](#Builder..CallExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..ComputedMemberExpression"></a>

### Builder~ComputedMemberExpression ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[MemberExpression](#Builder..MemberExpression)</code>  

* [~ComputedMemberExpression](#Builder..ComputedMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
    * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
    * [new ComputedMemberExpression(object, property)](#new_Builder..ComputedMemberExpression_new)
    * [.computed](#Builder..ComputedMemberExpression+computed)
    * [.computed](#Builder..ComputedMemberExpression+computed)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..ComputedMemberExpression_new"></a>

#### new ComputedMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Expression](#Builder..Expression)</code> | 

<a name="new_Builder..ComputedMemberExpression_new"></a>

#### new ComputedMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Expression](#Builder..Expression)</code> | 

<a name="Builder..ComputedMemberExpression+computed"></a>

#### computedMemberExpression.computed
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
<a name="Builder..ComputedMemberExpression+computed"></a>

#### computedMemberExpression.computed
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
<a name="Builder..Node+id"></a>

#### computedMemberExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### computedMemberExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[ComputedMemberExpression](#Builder..ComputedMemberExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..ExpressionStatement"></a>

### Builder~ExpressionStatement ⇐ <code>[Statement](#Builder..Statement)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Statement](#Builder..Statement)</code>  

* [~ExpressionStatement](#Builder..ExpressionStatement) ⇐ <code>[Statement](#Builder..Statement)</code>
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="Builder..Node+id"></a>

#### expressionStatement.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[ExpressionStatement](#Builder..ExpressionStatement)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### expressionStatement.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[ExpressionStatement](#Builder..ExpressionStatement)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..Identifier"></a>

### Builder~Identifier ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~Identifier](#Builder..Identifier) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new Identifier(name)](#new_Builder..Identifier_new)
    * [new Identifier(name)](#new_Builder..Identifier_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..Identifier_new"></a>

#### new Identifier(name)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>[string](#external_string)</code> | The name of the identifier |

<a name="new_Builder..Identifier_new"></a>

#### new Identifier(name)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>[string](#external_string)</code> | The name of the identifier |

<a name="Builder..Node+id"></a>

#### identifier.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Identifier](#Builder..Identifier)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### identifier.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Identifier](#Builder..Identifier)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..SequenceExpression"></a>

### Builder~SequenceExpression ⇐ <code>[Expression](#Builder..Expression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[Expression](#Builder..Expression)</code>  

* [~SequenceExpression](#Builder..SequenceExpression) ⇐ <code>[Expression](#Builder..Expression)</code>
    * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
    * [new SequenceExpression(expressions)](#new_Builder..SequenceExpression_new)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..SequenceExpression_new"></a>

#### new SequenceExpression(expressions)

| Param | Type | Description |
| --- | --- | --- |
| expressions | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | The expressions in the sequence |

<a name="new_Builder..SequenceExpression_new"></a>

#### new SequenceExpression(expressions)

| Param | Type | Description |
| --- | --- | --- |
| expressions | <code>[Array.&lt;Expression&gt;](#Builder..Expression)</code> &#124; <code>RangeExpression</code> | The expressions in the sequence |

<a name="Builder..Node+id"></a>

#### sequenceExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[SequenceExpression](#Builder..SequenceExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### sequenceExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[SequenceExpression](#Builder..SequenceExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="Builder..StaticMemberExpression"></a>

### Builder~StaticMemberExpression ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
**Kind**: inner class of <code>[Builder](#Builder)</code>  
**Extends:** <code>[MemberExpression](#Builder..MemberExpression)</code>  

* [~StaticMemberExpression](#Builder..StaticMemberExpression) ⇐ <code>[MemberExpression](#Builder..MemberExpression)</code>
    * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
    * [new StaticMemberExpression(object, property)](#new_Builder..StaticMemberExpression_new)
    * [.computed](#Builder..StaticMemberExpression+computed)
    * [.computed](#Builder..StaticMemberExpression+computed)
    * [.id](#Builder..Node+id) : <code>[number](#external_number)</code>
    * [.type](#Builder..Node+type) : <code>[string](#external_string)</code>

<a name="new_Builder..StaticMemberExpression_new"></a>

#### new StaticMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Identifier](#Builder..Identifier)</code> | 

<a name="new_Builder..StaticMemberExpression_new"></a>

#### new StaticMemberExpression(object, property)

| Param | Type |
| --- | --- |
| object | <code>[Expression](#Builder..Expression)</code> | 
| property | <code>[Identifier](#Builder..Identifier)</code> | 

<a name="Builder..StaticMemberExpression+computed"></a>

#### staticMemberExpression.computed
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
<a name="Builder..StaticMemberExpression+computed"></a>

#### staticMemberExpression.computed
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
<a name="Builder..Node+id"></a>

#### staticMemberExpression.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
**Overrides:** <code>[id](#Builder..Node+id)</code>  
<a name="Builder..Node+type"></a>

#### staticMemberExpression.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[StaticMemberExpression](#Builder..StaticMemberExpression)</code>  
**Overrides:** <code>[type](#Builder..Node+type)</code>  
<a name="InterpreterError"></a>

## InterpreterError ⇐ <code>[SyntaxError](#external_SyntaxError)</code>
**Kind**: global class  
**Extends:** <code>[SyntaxError](#external_SyntaxError)</code>  
<a name="new_InterpreterError_new"></a>

### new InterpreterError(message)

| Param | Type |
| --- | --- |
| message | <code>[string](#external_string)</code> | 

<a name="Interpreter"></a>

## Interpreter ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  

* [Interpreter](#Interpreter) ⇐ <code>[Null](#Null)</code>
    * [new Interpreter(builder)](#new_Interpreter_new)
    * [new Interpreter(builder)](#new_Interpreter_new)
    * _instance_
        * [.builder](#Interpreter+builder) : <code>[Builder](#Builder)</code>
        * [.builder](#Interpreter+builder) : <code>[Builder](#Builder)</code>
        * [.compile(expression)](#Interpreter+compile)
        * [.recurse()](#Interpreter+recurse)
    * _inner_
        * [~returnZero()](#Interpreter..returnZero) ⇒ <code>[number](#external_number)</code>
        * [~returnZero()](#Interpreter..returnZero) ⇒ <code>[number](#external_number)</code>

<a name="new_Interpreter_new"></a>

### new Interpreter(builder)

| Param | Type |
| --- | --- |
| builder | <code>[Builder](#Builder)</code> | 

<a name="new_Interpreter_new"></a>

### new Interpreter(builder)

| Param | Type |
| --- | --- |
| builder | <code>[Builder](#Builder)</code> | 

<a name="Interpreter+builder"></a>

### interpreter.builder : <code>[Builder](#Builder)</code>
**Kind**: instance property of <code>[Interpreter](#Interpreter)</code>  
<a name="Interpreter+builder"></a>

### interpreter.builder : <code>[Builder](#Builder)</code>
**Kind**: instance property of <code>[Interpreter](#Interpreter)</code>  
<a name="Interpreter+compile"></a>

### interpreter.compile(expression)
**Kind**: instance method of <code>[Interpreter](#Interpreter)</code>  

| Param | Type |
| --- | --- |
| expression | <code>[string](#external_string)</code> | 

<a name="Interpreter+recurse"></a>

### interpreter.recurse()
**Kind**: instance method of <code>[Interpreter](#Interpreter)</code>  
<a name="Interpreter..returnZero"></a>

### Interpreter~returnZero() ⇒ <code>[number](#external_number)</code>
**Kind**: inner method of <code>[Interpreter](#Interpreter)</code>  
**Returns**: <code>[number](#external_number)</code> - zero  
<a name="Interpreter..returnZero"></a>

### Interpreter~returnZero() ⇒ <code>[number](#external_number)</code>
**Kind**: inner method of <code>[Interpreter](#Interpreter)</code>  
**Returns**: <code>[number](#external_number)</code> - zero  
<a name="KeypathExp"></a>

## KeypathExp ⇐ <code>[Transducer](#Transducer)</code>
**Kind**: global class  
**Extends:** <code>[Transducer](#Transducer)</code>  

* [KeypathExp](#KeypathExp) ⇐ <code>[Transducer](#Transducer)</code>
    * [new KeypathExp(pattern, flags)](#new_KeypathExp_new)
    * [new KeypathExp(pattern, flags)](#new_KeypathExp_new)
    * [.@@transducer/step()](#KeypathExp+@@transducer/step)
    * [.get()](#KeypathExp+get)
    * [.has()](#KeypathExp+has)
    * [.@@transducer/step()](#KeypathExp+@@transducer/step)
    * [.set()](#KeypathExp+set)
    * [.toJSON()](#KeypathExp+toJSON)
    * [.toString()](#KeypathExp+toString)
    * [.@@transducer/init()](#Transducer+@@transducer/init)
    * [.@@transducer/result()](#Transducer+@@transducer/result)
    * [.xfInit()](#Transducer+xfInit)
    * [.xfStep()](#Transducer+xfStep)
    * [.xfResult()](#Transducer+xfResult)

<a name="new_KeypathExp_new"></a>

### new KeypathExp(pattern, flags)

| Param | Type |
| --- | --- |
| pattern | <code>[string](#external_string)</code> | 
| flags | <code>[string](#external_string)</code> | 

<a name="new_KeypathExp_new"></a>

### new KeypathExp(pattern, flags)

| Param | Type |
| --- | --- |
| pattern | <code>[string](#external_string)</code> | 
| flags | <code>[string](#external_string)</code> | 

<a name="KeypathExp+@@transducer/step"></a>

### keypathExp.@@transducer/step()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[@@transducer/step](#Transducer+@@transducer/step)</code>  
<a name="KeypathExp+get"></a>

### keypathExp.get()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
<a name="KeypathExp+has"></a>

### keypathExp.has()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
<a name="KeypathExp+@@transducer/step"></a>

### keypathExp.@@transducer/step()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[@@transducer/step](#Transducer+@@transducer/step)</code>  
<a name="KeypathExp+set"></a>

### keypathExp.set()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
<a name="KeypathExp+toJSON"></a>

### keypathExp.toJSON()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
<a name="KeypathExp+toString"></a>

### keypathExp.toString()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
<a name="Transducer+@@transducer/init"></a>

### keypathExp.@@transducer/init()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[@@transducer/init](#Transducer+@@transducer/init)</code>  
<a name="Transducer+@@transducer/result"></a>

### keypathExp.@@transducer/result()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[@@transducer/result](#Transducer+@@transducer/result)</code>  
<a name="Transducer+xfInit"></a>

### keypathExp.xfInit()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[xfInit](#Transducer+xfInit)</code>  
<a name="Transducer+xfStep"></a>

### keypathExp.xfStep()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[xfStep](#Transducer+xfStep)</code>  
<a name="Transducer+xfResult"></a>

### keypathExp.xfResult()
**Kind**: instance method of <code>[KeypathExp](#KeypathExp)</code>  
**Overrides:** <code>[xfResult](#Transducer+xfResult)</code>  
<a name="Lexer"></a>

## Lexer ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  

* [Lexer](#Lexer) ⇐ <code>[Null](#Null)</code>
    * _instance_
        * [.lex(text)](#Lexer+lex)
            * [.buffer](#Lexer+lex+buffer) : <code>[string](#external_string)</code>
            * [.index](#Lexer+lex+index) : <code>[number](#external_number)</code>
            * [.tokens](#Lexer+lex+tokens) : <code>[Array.&lt;Token&gt;](#Lexer..Token)</code>
        * [.read(until)](#Lexer+read) ⇒ <code>[string](#external_string)</code>
        * [.throwError()](#Lexer+throwError)
        * [.toJSON()](#Lexer+toJSON) ⇒ <code>[Object](#external_Object)</code>
        * [.toString()](#Lexer+toString) ⇒ <code>[string](#external_string)</code>
    * _inner_
        * [~Token](#Lexer..Token) ⇐ <code>[Null](#Null)</code>
            * [new Token(type, value)](#new_Lexer..Token_new)
            * [new Token(type, value)](#new_Lexer..Token_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~Identifier](#Lexer..Identifier) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new Identifier(value)](#new_Lexer..Identifier_new)
            * [new Identifier(value)](#new_Lexer..Identifier_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~NumericLiteral](#Lexer..NumericLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
            * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~NullLiteral](#Lexer..NullLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
            * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~Punctuator](#Lexer..Punctuator) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new Punctuator(value)](#new_Lexer..Punctuator_new)
            * [new Punctuator(value)](#new_Lexer..Punctuator_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~StringLiteral](#Lexer..StringLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
            * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~LexerError](#Lexer..LexerError) ⇐ <code>[SyntaxError](#external_SyntaxError)</code>
            * [new LexerError(message)](#new_Lexer..LexerError_new)
            * [new LexerError(message)](#new_Lexer..LexerError_new)
        * [~LexerError](#Lexer..LexerError) ⇐ <code>[SyntaxError](#external_SyntaxError)</code>
            * [new LexerError(message)](#new_Lexer..LexerError_new)
            * [new LexerError(message)](#new_Lexer..LexerError_new)
        * [~Token](#Lexer..Token) ⇐ <code>[Null](#Null)</code>
            * [new Token(type, value)](#new_Lexer..Token_new)
            * [new Token(type, value)](#new_Lexer..Token_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~Identifier](#Lexer..Identifier) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new Identifier(value)](#new_Lexer..Identifier_new)
            * [new Identifier(value)](#new_Lexer..Identifier_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~NumericLiteral](#Lexer..NumericLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
            * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~NullLiteral](#Lexer..NullLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
            * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~Punctuator](#Lexer..Punctuator) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new Punctuator(value)](#new_Lexer..Punctuator_new)
            * [new Punctuator(value)](#new_Lexer..Punctuator_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~StringLiteral](#Lexer..StringLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
            * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
            * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
            * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
            * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
            * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
        * [~isIdentifier(char)](#Lexer..isIdentifier) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isNumeric(char)](#Lexer..isNumeric) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isPunctuator(char)](#Lexer..isPunctuator) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isQuote(char)](#Lexer..isQuote) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isWhitespace(char)](#Lexer..isWhitespace) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isIdentifier(char)](#Lexer..isIdentifier) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isNumeric(char)](#Lexer..isNumeric) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isPunctuator(char)](#Lexer..isPunctuator) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isQuote(char)](#Lexer..isQuote) ⇒ <code>[boolean](#external_boolean)</code>
        * [~isWhitespace(char)](#Lexer..isWhitespace) ⇒ <code>[boolean](#external_boolean)</code>

<a name="Lexer+lex"></a>

### lexer.lex(text)
**Kind**: instance method of <code>[Lexer](#Lexer)</code>  

| Param | Type |
| --- | --- |
| text | <code>[string](#external_string)</code> | 


* [.lex(text)](#Lexer+lex)
    * [.buffer](#Lexer+lex+buffer) : <code>[string](#external_string)</code>
    * [.index](#Lexer+lex+index) : <code>[number](#external_number)</code>
    * [.tokens](#Lexer+lex+tokens) : <code>[Array.&lt;Token&gt;](#Lexer..Token)</code>

<a name="Lexer+lex+buffer"></a>

#### lex.buffer : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[lex](#Lexer+lex)</code>  
**Default**: <code>&#x27;&#x27;</code>  
<a name="Lexer+lex+index"></a>

#### lex.index : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[lex](#Lexer+lex)</code>  
<a name="Lexer+lex+tokens"></a>

#### lex.tokens : <code>[Array.&lt;Token&gt;](#Lexer..Token)</code>
**Kind**: instance property of <code>[lex](#Lexer+lex)</code>  
<a name="Lexer+read"></a>

### lexer.read(until) ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[string](#external_string)</code> - The portion of the buffer read  

| Param | Type | Description |
| --- | --- | --- |
| until | <code>external:function</code> | A condition that when met will stop the reading of the buffer |

<a name="Lexer+throwError"></a>

### lexer.throwError()
**Kind**: instance method of <code>[Lexer](#Lexer)</code>  
**Throws**:

- <code>[LexerError](#Lexer..LexerError)</code> When it executes

<a name="Lexer+toJSON"></a>

### lexer.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the lexer  
<a name="Lexer+toString"></a>

### lexer.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the lexer  
<a name="Lexer..Token"></a>

### Lexer~Token ⇐ <code>[Null](#Null)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Null](#Null)</code>  

* [~Token](#Lexer..Token) ⇐ <code>[Null](#Null)</code>
    * [new Token(type, value)](#new_Lexer..Token_new)
    * [new Token(type, value)](#new_Lexer..Token_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..Token_new"></a>

#### new Token(type, value)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | The type of the token |
| value | <code>[string](#external_string)</code> | The value of the token |

<a name="new_Lexer..Token_new"></a>

#### new Token(type, value)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | The type of the token |
| value | <code>[string](#external_string)</code> | The value of the token |

<a name="Lexer..Token+id"></a>

#### token.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+type"></a>

#### token.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+value"></a>

#### token.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+id"></a>

#### token.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+type"></a>

#### token.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+value"></a>

#### token.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Identifier"></a>

### Lexer~Identifier ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~Identifier](#Lexer..Identifier) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new Identifier(value)](#new_Lexer..Identifier_new)
    * [new Identifier(value)](#new_Lexer..Identifier_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..Identifier_new"></a>

#### new Identifier(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..Identifier_new"></a>

#### new Identifier(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### identifier.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Identifier](#Lexer..Identifier)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### identifier.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Identifier](#Lexer..Identifier)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### identifier.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Identifier](#Lexer..Identifier)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..NumericLiteral"></a>

### Lexer~NumericLiteral ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~NumericLiteral](#Lexer..NumericLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
    * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..NumericLiteral_new"></a>

#### new NumericLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..NumericLiteral_new"></a>

#### new NumericLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### numericLiteral.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[NumericLiteral](#Lexer..NumericLiteral)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### numericLiteral.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NumericLiteral](#Lexer..NumericLiteral)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### numericLiteral.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NumericLiteral](#Lexer..NumericLiteral)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..NullLiteral"></a>

### Lexer~NullLiteral ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~NullLiteral](#Lexer..NullLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
    * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..NullLiteral_new"></a>

#### new NullLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..NullLiteral_new"></a>

#### new NullLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### nullLiteral.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[NullLiteral](#Lexer..NullLiteral)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### nullLiteral.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NullLiteral](#Lexer..NullLiteral)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### nullLiteral.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NullLiteral](#Lexer..NullLiteral)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..Punctuator"></a>

### Lexer~Punctuator ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~Punctuator](#Lexer..Punctuator) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new Punctuator(value)](#new_Lexer..Punctuator_new)
    * [new Punctuator(value)](#new_Lexer..Punctuator_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..Punctuator_new"></a>

#### new Punctuator(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..Punctuator_new"></a>

#### new Punctuator(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### punctuator.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Punctuator](#Lexer..Punctuator)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### punctuator.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Punctuator](#Lexer..Punctuator)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### punctuator.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Punctuator](#Lexer..Punctuator)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..StringLiteral"></a>

### Lexer~StringLiteral ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~StringLiteral](#Lexer..StringLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
    * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..StringLiteral_new"></a>

#### new StringLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..StringLiteral_new"></a>

#### new StringLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### stringLiteral.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[StringLiteral](#Lexer..StringLiteral)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### stringLiteral.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[StringLiteral](#Lexer..StringLiteral)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### stringLiteral.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[StringLiteral](#Lexer..StringLiteral)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..LexerError"></a>

### Lexer~LexerError ⇐ <code>[SyntaxError](#external_SyntaxError)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[SyntaxError](#external_SyntaxError)</code>  

* [~LexerError](#Lexer..LexerError) ⇐ <code>[SyntaxError](#external_SyntaxError)</code>
    * [new LexerError(message)](#new_Lexer..LexerError_new)
    * [new LexerError(message)](#new_Lexer..LexerError_new)

<a name="new_Lexer..LexerError_new"></a>

#### new LexerError(message)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>[string](#external_string)</code> | The error message |

<a name="new_Lexer..LexerError_new"></a>

#### new LexerError(message)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>[string](#external_string)</code> | The error message |

<a name="Lexer..LexerError"></a>

### Lexer~LexerError ⇐ <code>[SyntaxError](#external_SyntaxError)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[SyntaxError](#external_SyntaxError)</code>  

* [~LexerError](#Lexer..LexerError) ⇐ <code>[SyntaxError](#external_SyntaxError)</code>
    * [new LexerError(message)](#new_Lexer..LexerError_new)
    * [new LexerError(message)](#new_Lexer..LexerError_new)

<a name="new_Lexer..LexerError_new"></a>

#### new LexerError(message)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>[string](#external_string)</code> | The error message |

<a name="new_Lexer..LexerError_new"></a>

#### new LexerError(message)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>[string](#external_string)</code> | The error message |

<a name="Lexer..Token"></a>

### Lexer~Token ⇐ <code>[Null](#Null)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Null](#Null)</code>  

* [~Token](#Lexer..Token) ⇐ <code>[Null](#Null)</code>
    * [new Token(type, value)](#new_Lexer..Token_new)
    * [new Token(type, value)](#new_Lexer..Token_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..Token_new"></a>

#### new Token(type, value)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | The type of the token |
| value | <code>[string](#external_string)</code> | The value of the token |

<a name="new_Lexer..Token_new"></a>

#### new Token(type, value)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | The type of the token |
| value | <code>[string](#external_string)</code> | The value of the token |

<a name="Lexer..Token+id"></a>

#### token.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+type"></a>

#### token.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+value"></a>

#### token.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+id"></a>

#### token.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+type"></a>

#### token.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Token+value"></a>

#### token.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Token](#Lexer..Token)</code>  
<a name="Lexer..Identifier"></a>

### Lexer~Identifier ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~Identifier](#Lexer..Identifier) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new Identifier(value)](#new_Lexer..Identifier_new)
    * [new Identifier(value)](#new_Lexer..Identifier_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..Identifier_new"></a>

#### new Identifier(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..Identifier_new"></a>

#### new Identifier(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### identifier.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Identifier](#Lexer..Identifier)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### identifier.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Identifier](#Lexer..Identifier)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### identifier.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Identifier](#Lexer..Identifier)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..NumericLiteral"></a>

### Lexer~NumericLiteral ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~NumericLiteral](#Lexer..NumericLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
    * [new NumericLiteral(value)](#new_Lexer..NumericLiteral_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..NumericLiteral_new"></a>

#### new NumericLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..NumericLiteral_new"></a>

#### new NumericLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### numericLiteral.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[NumericLiteral](#Lexer..NumericLiteral)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### numericLiteral.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NumericLiteral](#Lexer..NumericLiteral)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### numericLiteral.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NumericLiteral](#Lexer..NumericLiteral)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..NullLiteral"></a>

### Lexer~NullLiteral ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~NullLiteral](#Lexer..NullLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
    * [new NullLiteral(value)](#new_Lexer..NullLiteral_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..NullLiteral_new"></a>

#### new NullLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..NullLiteral_new"></a>

#### new NullLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### nullLiteral.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[NullLiteral](#Lexer..NullLiteral)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### nullLiteral.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NullLiteral](#Lexer..NullLiteral)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### nullLiteral.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[NullLiteral](#Lexer..NullLiteral)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..Punctuator"></a>

### Lexer~Punctuator ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~Punctuator](#Lexer..Punctuator) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new Punctuator(value)](#new_Lexer..Punctuator_new)
    * [new Punctuator(value)](#new_Lexer..Punctuator_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..Punctuator_new"></a>

#### new Punctuator(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..Punctuator_new"></a>

#### new Punctuator(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### punctuator.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Punctuator](#Lexer..Punctuator)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### punctuator.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Punctuator](#Lexer..Punctuator)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### punctuator.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Punctuator](#Lexer..Punctuator)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..StringLiteral"></a>

### Lexer~StringLiteral ⇐ <code>[Token](#Lexer..Token)</code>
**Kind**: inner class of <code>[Lexer](#Lexer)</code>  
**Extends:** <code>[Token](#Lexer..Token)</code>  

* [~StringLiteral](#Lexer..StringLiteral) ⇐ <code>[Token](#Lexer..Token)</code>
    * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
    * [new StringLiteral(value)](#new_Lexer..StringLiteral_new)
    * [.id](#Lexer..Token+id) : <code>[number](#external_number)</code>
    * [.type](#Lexer..Token+type) : <code>[string](#external_string)</code>
    * [.value](#Lexer..Token+value) : <code>[string](#external_string)</code>

<a name="new_Lexer..StringLiteral_new"></a>

#### new StringLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="new_Lexer..StringLiteral_new"></a>

#### new StringLiteral(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Lexer..Token+id"></a>

#### stringLiteral.id : <code>[number](#external_number)</code>
**Kind**: instance property of <code>[StringLiteral](#Lexer..StringLiteral)</code>  
**Overrides:** <code>[id](#Lexer..Token+id)</code>  
<a name="Lexer..Token+type"></a>

#### stringLiteral.type : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[StringLiteral](#Lexer..StringLiteral)</code>  
**Overrides:** <code>[type](#Lexer..Token+type)</code>  
<a name="Lexer..Token+value"></a>

#### stringLiteral.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[StringLiteral](#Lexer..StringLiteral)</code>  
**Overrides:** <code>[value](#Lexer..Token+value)</code>  
<a name="Lexer..isIdentifier"></a>

### Lexer~isIdentifier(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is an identifier character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isNumeric"></a>

### Lexer~isNumeric(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a numeric character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isPunctuator"></a>

### Lexer~isPunctuator(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a punctuator character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isQuote"></a>

### Lexer~isQuote(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a quote character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isWhitespace"></a>

### Lexer~isWhitespace(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a whitespace character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isIdentifier"></a>

### Lexer~isIdentifier(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is an identifier character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isNumeric"></a>

### Lexer~isNumeric(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a numeric character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isPunctuator"></a>

### Lexer~isPunctuator(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a punctuator character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isQuote"></a>

### Lexer~isQuote(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a quote character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Lexer..isWhitespace"></a>

### Lexer~isWhitespace(char) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Lexer](#Lexer)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the character is a whitespace character  

| Param | Type |
| --- | --- |
| char | <code>[string](#external_string)</code> | 

<a name="Null"></a>

## Null ⇐ <code>[null](#external_null)</code>
**Kind**: global class  
**Extends:** <code>[null](#external_null)</code>  

* [Null](#Null) ⇐ <code>[null](#external_null)</code>
    * [new Null()](#new_Null_new)
    * [new Null()](#new_Null_new)

<a name="new_Null_new"></a>

### new Null()
A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.

<a name="new_Null_new"></a>

### new Null()
A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.

<a name="PathToolkit"></a>

## PathToolkit
**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Optional. Collection of configuration settings for this instance of PathToolkit. See `setOptions` function below for detailed documentation. |


* [PathToolkit](#PathToolkit)
    * [new PathToolkit()](#new_PathToolkit_new)
    * [~isQuoted(str)](#PathToolkit..isQuoted) ⇒ <code>Boolean</code>
    * [~stripQuotes(str)](#PathToolkit..stripQuotes) ⇒ <code>String</code>

<a name="new_PathToolkit_new"></a>

### new PathToolkit()
PathToolkit base object. Includes all instance-specific data (options, cache)
as local variables. May be passed an options hash to pre-configure the
instance prior to use.

<a name="PathToolkit..isQuoted"></a>

### PathToolkit~isQuoted(str) ⇒ <code>Boolean</code>
Test string to see if it is surrounded by single- or double-quote, using the
current configuration definition for those characters. If no quote container
is defined, this function will return false since it's not possible to quote
the string if there are no quotes in the syntax. Also ignores escaped quote
characters.

**Kind**: inner method of <code>[PathToolkit](#PathToolkit)</code>  
**Returns**: <code>Boolean</code> - true = string is enclosed in quotes; false = not quoted  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>String</code> | The string to test for enclosing quotes |

<a name="PathToolkit..stripQuotes"></a>

### PathToolkit~stripQuotes(str) ⇒ <code>String</code>
Remove enclosing quotes from a string. The isQuoted function will determine
if any change is needed. If the string is quoted, we know the first and last
characters are quote marks, so simply do a string slice. If the input value is
not quoted, return the input value unchanged. Because isQuoted is used, if
no quote marks are defined in the syntax, this function will return the input value.

**Kind**: inner method of <code>[PathToolkit](#PathToolkit)</code>  
**Returns**: <code>String</code> - The input string without any enclosing quote marks.  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>String</code> | The string to un-quote |

<a name="Transducer"></a>

## Transducer ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  

* [Transducer](#Transducer) ⇐ <code>[Null](#Null)</code>
    * [new Transducer(xf)](#new_Transducer_new)
    * [new Transducer(xf)](#new_Transducer_new)
    * [.@@transducer/init()](#Transducer+@@transducer/init)
    * [.@@transducer/step()](#Transducer+@@transducer/step)
    * [.@@transducer/result()](#Transducer+@@transducer/result)
    * [.@@transducer/init()](#Transducer+@@transducer/init)
    * [.@@transducer/step()](#Transducer+@@transducer/step)
    * [.@@transducer/result()](#Transducer+@@transducer/result)
    * [.xfInit()](#Transducer+xfInit)
    * [.xfStep()](#Transducer+xfStep)
    * [.xfResult()](#Transducer+xfResult)

<a name="new_Transducer_new"></a>

### new Transducer(xf)

| Param | Type |
| --- | --- |
| xf | <code>[Function](#external_Function)</code> | 

<a name="new_Transducer_new"></a>

### new Transducer(xf)

| Param | Type |
| --- | --- |
| xf | <code>[Function](#external_Function)</code> | 

<a name="Transducer+@@transducer/init"></a>

### transducer.@@transducer/init()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+@@transducer/step"></a>

### transducer.@@transducer/step()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+@@transducer/result"></a>

### transducer.@@transducer/result()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+@@transducer/init"></a>

### transducer.@@transducer/init()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+@@transducer/step"></a>

### transducer.@@transducer/step()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+@@transducer/result"></a>

### transducer.@@transducer/result()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+xfInit"></a>

### transducer.xfInit()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+xfStep"></a>

### transducer.xfStep()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="Transducer+xfResult"></a>

### transducer.xfResult()
**Kind**: instance method of <code>[Transducer](#Transducer)</code>  
<a name="KeypathCallback"></a>

## KeypathCallback ⇒ <code>\*</code>
**Kind**: global typedef  
**Returns**: <code>\*</code> - The value at the end of the keypath or undefined if the value was being set  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>\*</code> | The object on which the keypath will be executed |
| [value] | <code>\*</code> | The optional value that will be set at the keypath |

<a name="ForEachCallback"></a>

## ForEachCallback : <code>[Function](#external_Function)</code>
**Kind**: global typedef  

| Param | Type |
| --- | --- |
| item | <code>\*</code> | 
| index | <code>[number](#external_number)</code> | 

<a name="Array-Like"></a>

## Array-Like : <code>[Array](#external_Array)</code> &#124; <code>[Arguments](#external_Arguments)</code> &#124; <code>[string](#external_string)</code>
JavaScript Array-Like

**Kind**: global typedef  
**See**: [http://www.2ality.com/2013/05/quirk-array-like-objects.html](http://www.2ality.com/2013/05/quirk-array-like-objects.html)  
<a name="KeypathCallback"></a>

## KeypathCallback ⇒ <code>\*</code>
**Kind**: global typedef  
**Returns**: <code>\*</code> - The value at the end of the keypath or undefined if the value was being set  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>\*</code> | The object on which the keypath will be executed |
| [value] | <code>\*</code> | The optional value that will be set at the keypath |

<a name="external_Arguments"></a>

## Arguments
JavaScript Arguments

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments)  
<a name="external_Array"></a>

## Array
JavaScript Array

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)  
<a name="external_boolean"></a>

## boolean
JavaScript [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Prm454mun3!imitive) boolean

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)  
<a name="external_Error"></a>

## Error
JavaScript Error

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)  
<a name="external_Function"></a>

## Function
JavaScript Function

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)  
<a name="external_number"></a>

## number
JavaScript [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) number

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)  
<a name="external_null"></a>

## null
JavaScript null

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null)  
<a name="external_Object"></a>

## Object
JavaScript Object

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)  
<a name="external_Promise"></a>

## Promise
JavaScript Promise

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)  
<a name="external_string"></a>

## string
JavaScript [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) string

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)  
<a name="external_symbol"></a>

## symbol
JavaScript [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) symbol

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)  
<a name="external_SyntaxError"></a>

## SyntaxError ⇐ <code>[Error](#external_Error)</code>
JavaScript SyntaxError

**Kind**: global external  
**Extends:** <code>[Error](#external_Error)</code>  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError)  
<a name="external_TypeError"></a>

## TypeError ⇐ <code>[Error](#external_Error)</code>
JavaScript TypeError

**Kind**: global external  
**Extends:** <code>[Error](#external_Error)</code>  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)  
