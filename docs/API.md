## Classes

<dl>
<dt><a href="#Builder">Builder</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
<dt><a href="#Interpreter">Interpreter</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
<dt><a href="#KeyPathExp">KeyPathExp</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
<dt><a href="#LexerError">LexerError</a> ⇐ <code>SyntaxError</code></dt>
<dd></dd>
<dt><a href="#Lexer">Lexer</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
<dt><a href="#Null">Null</a> ⇐ <code><a href="#external_null">null</a></code></dt>
<dd></dd>
<dt><a href="#Node">Node</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
<dt><a href="#Statement">Statement</a> ⇐ <code><a href="#Node">Node</a></code></dt>
<dd></dd>
<dt><a href="#Expression">Expression</a> ⇐ <code><a href="#Node">Node</a></code></dt>
<dd></dd>
<dt><a href="#Program">Program</a> ⇐ <code><a href="#Node">Node</a></code></dt>
<dd></dd>
<dt><a href="#ArrayExpression">ArrayExpression</a> ⇐ <code><a href="#Expression">Expression</a></code></dt>
<dd></dd>
<dt><a href="#ExpressionStatement">ExpressionStatement</a> ⇐ <code><a href="#Statement">Statement</a></code></dt>
<dd></dd>
<dt><a href="#CallExpression">CallExpression</a> ⇐ <code><a href="#Expression">Expression</a></code></dt>
<dd></dd>
<dt><a href="#MemberExpression">MemberExpression</a> ⇐ <code><a href="#Expression">Expression</a></code></dt>
<dd></dd>
<dt><a href="#Identifier">Identifier</a> ⇐ <code><a href="#Expression">Expression</a></code></dt>
<dd></dd>
<dt><a href="#Literal">Literal</a> ⇐ <code><a href="#Expression">Expression</a></code></dt>
<dd></dd>
<dt><a href="#SequenceExpression">SequenceExpression</a> ⇐ <code><a href="#Expression">Expression</a></code></dt>
<dd></dd>
<dt><a href="#Punctuator">Punctuator</a> ⇐ <code><a href="#Node">Node</a></code></dt>
<dd></dd>
<dt><a href="#Token">Token</a> ⇐ <code><a href="#Null">Null</a></code></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#id">id</a> : <code><a href="#external_number">number</a></code></dt>
<dd></dd>
<dt><a href="#type">type</a> : <code><a href="#NodeType">NodeType</a></code></dt>
<dd></dd>
</dl>

## Objects

<dl>
<dt><a href="#interpret">interpret</a> : <code>object</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#kp">kp(literals, ...values)</a> ⇒ <code><a href="#kpCallback">kpCallback</a></code></dt>
<dd><p>A template literal tag for keypath processing.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#kpCallback">kpCallback</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#NodeType">NodeType</a> : <code><a href="#external_string">string</a></code></dt>
<dd></dd>
</dl>

## External

<dl>
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

<a name="Builder"></a>

## Builder ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  

* [Builder](#Builder) ⇐ <code>[Null](#Null)</code>
    * [new Builder(lexer)](#new_Builder_new)
    * [.build(text)](#Builder+build) ⇒ <code>[Program](#Program)</code>
    * [.callExpression()](#Builder+callExpression) ⇒ <code>[CallExpression](#CallExpression)</code>
    * [.consume([expected])](#Builder+consume) ⇒ <code>[Token](#Token)</code>
    * [.expect([first], [second], [third], [fourth])](#Builder+expect) ⇒ <code>[Token](#Token)</code>
    * [.expression()](#Builder+expression) ⇒ <code>[Expression](#Expression)</code>
    * [.literal()](#Builder+literal) ⇒ <code>[Literal](#Literal)</code>
    * [.list(terminator)](#Builder+list) ⇒ <code>[external:Array.&lt;Literal&gt;](#Literal)</code>
    * [.memberExpression(property, computed)](#Builder+memberExpression) ⇒ <code>[MemberExpression](#MemberExpression)</code>
    * [.program()](#Builder+program) ⇒ <code>[Program](#Program)</code>
    * [.throwError(message)](#Builder+throwError)

<a name="new_Builder_new"></a>

### new Builder(lexer)

| Param | Type |
| --- | --- |
| lexer | <code>[Lexer](#Lexer)</code> | 

<a name="Builder+build"></a>

### builder.build(text) ⇒ <code>[Program](#Program)</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>[Program](#Program)</code> - The built abstract syntax tree  

| Param | Type |
| --- | --- |
| text | <code>[string](#external_string)</code> | 

<a name="Builder+callExpression"></a>

### builder.callExpression() ⇒ <code>[CallExpression](#CallExpression)</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>[CallExpression](#CallExpression)</code> - The call expression node  
<a name="Builder+consume"></a>

### builder.consume([expected]) ⇒ <code>[Token](#Token)</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>[Token](#Token)</code> - The next token in the list  

| Param | Type |
| --- | --- |
| [expected] | <code>[string](#external_string)</code> | 

<a name="Builder+expect"></a>

### builder.expect([first], [second], [third], [fourth]) ⇒ <code>[Token](#Token)</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>[Token](#Token)</code> - The next token in the list  

| Param | Type |
| --- | --- |
| [first] | <code>[string](#external_string)</code> | 
| [second] | <code>[string](#external_string)</code> | 
| [third] | <code>[string](#external_string)</code> | 
| [fourth] | <code>[string](#external_string)</code> | 

<a name="Builder+expression"></a>

### builder.expression() ⇒ <code>[Expression](#Expression)</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>[Expression](#Expression)</code> - An expression node  
<a name="Builder+literal"></a>

### builder.literal() ⇒ <code>[Literal](#Literal)</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>[Literal](#Literal)</code> - The literal node  
<a name="Builder+list"></a>

### builder.list(terminator) ⇒ <code>[external:Array.&lt;Literal&gt;](#Literal)</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>[external:Array.&lt;Literal&gt;](#Literal)</code> - The list of literals  

| Param | Type |
| --- | --- |
| terminator | <code>[string](#external_string)</code> | 

<a name="Builder+memberExpression"></a>

### builder.memberExpression(property, computed) ⇒ <code>[MemberExpression](#MemberExpression)</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>[MemberExpression](#MemberExpression)</code> - The member expression  

| Param | Type | Description |
| --- | --- | --- |
| property | <code>[Expression](#Expression)</code> | The expression assigned to the property of the member expression |
| computed | <code>[boolean](#external_boolean)</code> | Whether or not the member expression is computed |

<a name="Builder+program"></a>

### builder.program() ⇒ <code>[Program](#Program)</code>
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Returns**: <code>[Program](#Program)</code> - A program node  
<a name="Builder+throwError"></a>

### builder.throwError(message)
**Kind**: instance method of <code>[Builder](#Builder)</code>  
**Throws**:

- <code>[SyntaxError](#external_SyntaxError)</code> When it executes


| Param | Type | Description |
| --- | --- | --- |
| message | <code>[string](#external_string)</code> | The error message |

<a name="Interpreter"></a>

## Interpreter ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  

* [Interpreter](#Interpreter) ⇐ <code>[Null](#Null)</code>
    * [new Interpreter(builder)](#new_Interpreter_new)
    * [.compile(expression)](#Interpreter+compile)

<a name="new_Interpreter_new"></a>

### new Interpreter(builder)

| Param | Type |
| --- | --- |
| builder | <code>[Builder](#Builder)</code> | 

<a name="Interpreter+compile"></a>

### interpreter.compile(expression)
**Kind**: instance method of <code>[Interpreter](#Interpreter)</code>  

| Param | Type |
| --- | --- |
| expression | <code>[string](#external_string)</code> | 

<a name="KeyPathExp"></a>

## KeyPathExp ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  
<a name="new_KeyPathExp_new"></a>

### new KeyPathExp(pattern, flags)

| Param | Type |
| --- | --- |
| pattern | <code>[string](#external_string)</code> | 
| flags | <code>[string](#external_string)</code> | 

<a name="LexerError"></a>

## LexerError ⇐ <code>SyntaxError</code>
**Kind**: global class  
**Extends:** <code>SyntaxError</code>  
<a name="new_LexerError_new"></a>

### new LexerError(message)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>[string](#external_string)</code> | The error message |

<a name="Lexer"></a>

## Lexer ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  
<a name="Null"></a>

## Null ⇐ <code>[null](#external_null)</code>
**Kind**: global class  
**Extends:** <code>[null](#external_null)</code>  
<a name="new_Null_new"></a>

### new Null()
A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.

<a name="Node"></a>

## Node ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  

* [Node](#Node) ⇐ <code>[Null](#Null)</code>
    * [new Node(type)](#new_Node_new)
    * [.is(type)](#Node+is) ⇒ <code>[boolean](#external_boolean)</code>
    * [.toJSON()](#Node+toJSON) ⇒ <code>[Object](#external_Object)</code>
    * [.toString()](#Node+toString) ⇒ <code>[string](#external_string)</code>

<a name="new_Node_new"></a>

### new Node(type)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+is"></a>

### node.is(type) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: instance method of <code>[Node](#Node)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the node is of the type provided.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+toJSON"></a>

### node.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[Node](#Node)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the node  
<a name="Node+toString"></a>

### node.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[Node](#Node)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the node  
<a name="Statement"></a>

## Statement ⇐ <code>[Node](#Node)</code>
**Kind**: global class  
**Extends:** <code>[Node](#Node)</code>  

* [Statement](#Statement) ⇐ <code>[Node](#Node)</code>
    * [new Statement(statementType)](#new_Statement_new)
    * [.is(type)](#Node+is) ⇒ <code>[boolean](#external_boolean)</code>
    * [.toJSON()](#Node+toJSON) ⇒ <code>[Object](#external_Object)</code>
    * [.toString()](#Node+toString) ⇒ <code>[string](#external_string)</code>

<a name="new_Statement_new"></a>

### new Statement(statementType)

| Param | Type | Description |
| --- | --- | --- |
| statementType | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+is"></a>

### statement.is(type) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: instance method of <code>[Statement](#Statement)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the node is of the type provided.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+toJSON"></a>

### statement.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[Statement](#Statement)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the node  
<a name="Node+toString"></a>

### statement.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[Statement](#Statement)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the node  
<a name="Expression"></a>

## Expression ⇐ <code>[Node](#Node)</code>
**Kind**: global class  
**Extends:** <code>[Node](#Node)</code>  

* [Expression](#Expression) ⇐ <code>[Node](#Node)</code>
    * [new Expression(expressionType)](#new_Expression_new)
    * [.is(type)](#Node+is) ⇒ <code>[boolean](#external_boolean)</code>
    * [.toJSON()](#Node+toJSON) ⇒ <code>[Object](#external_Object)</code>
    * [.toString()](#Node+toString) ⇒ <code>[string](#external_string)</code>

<a name="new_Expression_new"></a>

### new Expression(expressionType)

| Param | Type | Description |
| --- | --- | --- |
| expressionType | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+is"></a>

### expression.is(type) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: instance method of <code>[Expression](#Expression)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the node is of the type provided.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+toJSON"></a>

### expression.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[Expression](#Expression)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the node  
<a name="Node+toString"></a>

### expression.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[Expression](#Expression)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the node  
<a name="Program"></a>

## Program ⇐ <code>[Node](#Node)</code>
**Kind**: global class  
**Extends:** <code>[Node](#Node)</code>  

* [Program](#Program) ⇐ <code>[Node](#Node)</code>
    * [new Program(body)](#new_Program_new)
    * [.body](#Program+body) : <code>[external:Array.&lt;Statement&gt;](#Statement)</code>
    * [.toJSON()](#Program+toJSON) ⇒ <code>[Object](#external_Object)</code>
    * [.is(type)](#Node+is) ⇒ <code>[boolean](#external_boolean)</code>
    * [.toString()](#Node+toString) ⇒ <code>[string](#external_string)</code>

<a name="new_Program_new"></a>

### new Program(body)

| Param | Type |
| --- | --- |
| body | <code>[external:Array.&lt;Statement&gt;](#Statement)</code> | 

<a name="Program+body"></a>

### program.body : <code>[external:Array.&lt;Statement&gt;](#Statement)</code>
**Kind**: instance property of <code>[Program](#Program)</code>  
<a name="Program+toJSON"></a>

### program.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[Program](#Program)</code>  
**Overrides:** <code>[toJSON](#Node+toJSON)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the program  
<a name="Node+is"></a>

### program.is(type) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: instance method of <code>[Program](#Program)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the node is of the type provided.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+toString"></a>

### program.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[Program](#Program)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the node  
<a name="ArrayExpression"></a>

## ArrayExpression ⇐ <code>[Expression](#Expression)</code>
**Kind**: global class  
**Extends:** <code>[Expression](#Expression)</code>  

* [ArrayExpression](#ArrayExpression) ⇐ <code>[Expression](#Expression)</code>
    * [new ArrayExpression(elements)](#new_ArrayExpression_new)
    * [.elements](#ArrayExpression+elements) : <code>[external:Array.&lt;Expression&gt;](#Expression)</code>
    * [.toJSON()](#ArrayExpression+toJSON) ⇒ <code>[Object](#external_Object)</code>
    * [.is(type)](#Node+is) ⇒ <code>[boolean](#external_boolean)</code>
    * [.toString()](#Node+toString) ⇒ <code>[string](#external_string)</code>

<a name="new_ArrayExpression_new"></a>

### new ArrayExpression(elements)

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>[external:Array.&lt;Expression&gt;](#Expression)</code> | A list of expressions |

<a name="ArrayExpression+elements"></a>

### arrayExpression.elements : <code>[external:Array.&lt;Expression&gt;](#Expression)</code>
**Kind**: instance property of <code>[ArrayExpression](#ArrayExpression)</code>  
<a name="ArrayExpression+toJSON"></a>

### arrayExpression.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[ArrayExpression](#ArrayExpression)</code>  
**Overrides:** <code>[toJSON](#Node+toJSON)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the array expression  
<a name="Node+is"></a>

### arrayExpression.is(type) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: instance method of <code>[ArrayExpression](#ArrayExpression)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the node is of the type provided.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+toString"></a>

### arrayExpression.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[ArrayExpression](#ArrayExpression)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the node  
<a name="ExpressionStatement"></a>

## ExpressionStatement ⇐ <code>[Statement](#Statement)</code>
**Kind**: global class  
**Extends:** <code>[Statement](#Statement)</code>  

* [ExpressionStatement](#ExpressionStatement) ⇐ <code>[Statement](#Statement)</code>
    * [.expression](#ExpressionStatement+expression) : <code>[Expression](#Expression)</code>
    * [.toJSON()](#ExpressionStatement+toJSON) ⇒ <code>[Object](#external_Object)</code>
    * [.is(type)](#Node+is) ⇒ <code>[boolean](#external_boolean)</code>
    * [.toString()](#Node+toString) ⇒ <code>[string](#external_string)</code>

<a name="ExpressionStatement+expression"></a>

### expressionStatement.expression : <code>[Expression](#Expression)</code>
**Kind**: instance property of <code>[ExpressionStatement](#ExpressionStatement)</code>  
<a name="ExpressionStatement+toJSON"></a>

### expressionStatement.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[ExpressionStatement](#ExpressionStatement)</code>  
**Overrides:** <code>[toJSON](#Node+toJSON)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the expression statement  
<a name="Node+is"></a>

### expressionStatement.is(type) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: instance method of <code>[ExpressionStatement](#ExpressionStatement)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the node is of the type provided.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+toString"></a>

### expressionStatement.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[ExpressionStatement](#ExpressionStatement)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the node  
<a name="CallExpression"></a>

## CallExpression ⇐ <code>[Expression](#Expression)</code>
**Kind**: global class  
**Extends:** <code>[Expression](#Expression)</code>  

* [CallExpression](#CallExpression) ⇐ <code>[Expression](#Expression)</code>
    * [new CallExpression(callee, args)](#new_CallExpression_new)
    * [.callee](#CallExpression+callee) : <code>[Expression](#Expression)</code>
    * [.arguments](#CallExpression+arguments) : <code>[external:Array.&lt;Expression&gt;](#Expression)</code>
    * [.toJSON()](#CallExpression+toJSON) ⇒ <code>[Object](#external_Object)</code>
    * [.is(type)](#Node+is) ⇒ <code>[boolean](#external_boolean)</code>
    * [.toString()](#Node+toString) ⇒ <code>[string](#external_string)</code>

<a name="new_CallExpression_new"></a>

### new CallExpression(callee, args)

| Param | Type |
| --- | --- |
| callee | <code>[Expression](#Expression)</code> | 
| args | <code>[external:Array.&lt;Expression&gt;](#Expression)</code> | 

<a name="CallExpression+callee"></a>

### callExpression.callee : <code>[Expression](#Expression)</code>
**Kind**: instance property of <code>[CallExpression](#CallExpression)</code>  
<a name="CallExpression+arguments"></a>

### callExpression.arguments : <code>[external:Array.&lt;Expression&gt;](#Expression)</code>
**Kind**: instance property of <code>[CallExpression](#CallExpression)</code>  
<a name="CallExpression+toJSON"></a>

### callExpression.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[CallExpression](#CallExpression)</code>  
**Overrides:** <code>[toJSON](#Node+toJSON)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the call expression  
<a name="Node+is"></a>

### callExpression.is(type) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: instance method of <code>[CallExpression](#CallExpression)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the node is of the type provided.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+toString"></a>

### callExpression.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[CallExpression](#CallExpression)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the node  
<a name="MemberExpression"></a>

## MemberExpression ⇐ <code>[Expression](#Expression)</code>
**Kind**: global class  
**Extends:** <code>[Expression](#Expression)</code>  

* [MemberExpression](#MemberExpression) ⇐ <code>[Expression](#Expression)</code>
    * [new MemberExpression(object, property, computed)](#new_MemberExpression_new)
    * [.object](#MemberExpression+object) : <code>[Expression](#Expression)</code>
    * [.property](#MemberExpression+property) : <code>[Expression](#Expression)</code> &#124; <code>[Identifier](#Identifier)</code>
    * [.computed](#MemberExpression+computed) : <code>[boolean](#external_boolean)</code>
    * [.toJSON()](#MemberExpression+toJSON) ⇒ <code>[Object](#external_Object)</code>
    * [.is(type)](#Node+is) ⇒ <code>[boolean](#external_boolean)</code>
    * [.toString()](#Node+toString) ⇒ <code>[string](#external_string)</code>

<a name="new_MemberExpression_new"></a>

### new MemberExpression(object, property, computed)

| Param | Type | Default |
| --- | --- | --- |
| object | <code>[Expression](#Expression)</code> |  | 
| property | <code>[Expression](#Expression)</code> &#124; <code>[Identifier](#Identifier)</code> |  | 
| computed | <code>[boolean](#external_boolean)</code> | <code>false</code> | 

<a name="MemberExpression+object"></a>

### memberExpression.object : <code>[Expression](#Expression)</code>
**Kind**: instance property of <code>[MemberExpression](#MemberExpression)</code>  
<a name="MemberExpression+property"></a>

### memberExpression.property : <code>[Expression](#Expression)</code> &#124; <code>[Identifier](#Identifier)</code>
**Kind**: instance property of <code>[MemberExpression](#MemberExpression)</code>  
<a name="MemberExpression+computed"></a>

### memberExpression.computed : <code>[boolean](#external_boolean)</code>
**Kind**: instance property of <code>[MemberExpression](#MemberExpression)</code>  
<a name="MemberExpression+toJSON"></a>

### memberExpression.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[MemberExpression](#MemberExpression)</code>  
**Overrides:** <code>[toJSON](#Node+toJSON)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the member expression  
<a name="Node+is"></a>

### memberExpression.is(type) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: instance method of <code>[MemberExpression](#MemberExpression)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the node is of the type provided.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+toString"></a>

### memberExpression.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[MemberExpression](#MemberExpression)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the node  
<a name="Identifier"></a>

## Identifier ⇐ <code>[Expression](#Expression)</code>
**Kind**: global class  
**Extends:** <code>[Expression](#Expression)</code>  

* [Identifier](#Identifier) ⇐ <code>[Expression](#Expression)</code>
    * [new Identifier(name)](#new_Identifier_new)
    * [.name](#Identifier+name) : <code>[string](#external_string)</code>
    * [.toJSON()](#Identifier+toJSON) ⇒ <code>[Object](#external_Object)</code>
    * [.is(type)](#Node+is) ⇒ <code>[boolean](#external_boolean)</code>
    * [.toString()](#Node+toString) ⇒ <code>[string](#external_string)</code>

<a name="new_Identifier_new"></a>

### new Identifier(name)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>[string](#external_string)</code> | The name of the identifier |

<a name="Identifier+name"></a>

### identifier.name : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Identifier](#Identifier)</code>  
<a name="Identifier+toJSON"></a>

### identifier.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[Identifier](#Identifier)</code>  
**Overrides:** <code>[toJSON](#Node+toJSON)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the identifier  
<a name="Node+is"></a>

### identifier.is(type) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: instance method of <code>[Identifier](#Identifier)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the node is of the type provided.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+toString"></a>

### identifier.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[Identifier](#Identifier)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the node  
<a name="Literal"></a>

## Literal ⇐ <code>[Expression](#Expression)</code>
**Kind**: global class  
**Extends:** <code>[Expression](#Expression)</code>  

* [Literal](#Literal) ⇐ <code>[Expression](#Expression)</code>
    * [new Literal(value)](#new_Literal_new)
    * [.value](#Literal+value) : <code>[string](#external_string)</code> &#124; <code>[number](#external_number)</code>
    * [.toJSON()](#Literal+toJSON) ⇒ <code>[Object](#external_Object)</code>
    * [.is(type)](#Node+is) ⇒ <code>[boolean](#external_boolean)</code>
    * [.toString()](#Node+toString) ⇒ <code>[string](#external_string)</code>

<a name="new_Literal_new"></a>

### new Literal(value)

| Param | Type | Description |
| --- | --- | --- |
| value | <code>[string](#external_string)</code> &#124; <code>[number](#external_number)</code> | The value of the literal |

<a name="Literal+value"></a>

### literal.value : <code>[string](#external_string)</code> &#124; <code>[number](#external_number)</code>
**Kind**: instance property of <code>[Literal](#Literal)</code>  
<a name="Literal+toJSON"></a>

### literal.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[Literal](#Literal)</code>  
**Overrides:** <code>[toJSON](#Node+toJSON)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the literal  
<a name="Node+is"></a>

### literal.is(type) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: instance method of <code>[Literal](#Literal)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the node is of the type provided.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+toString"></a>

### literal.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[Literal](#Literal)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the node  
<a name="SequenceExpression"></a>

## SequenceExpression ⇐ <code>[Expression](#Expression)</code>
**Kind**: global class  
**Extends:** <code>[Expression](#Expression)</code>  

* [SequenceExpression](#SequenceExpression) ⇐ <code>[Expression](#Expression)</code>
    * [new SequenceExpression(expressions)](#new_SequenceExpression_new)
    * [.expressions](#SequenceExpression+expressions) : <code>[external:Array.&lt;Expression&gt;](#Expression)</code>
    * [.toJSON()](#SequenceExpression+toJSON) ⇒ <code>[Object](#external_Object)</code>
    * [.is(type)](#Node+is) ⇒ <code>[boolean](#external_boolean)</code>
    * [.toString()](#Node+toString) ⇒ <code>[string](#external_string)</code>

<a name="new_SequenceExpression_new"></a>

### new SequenceExpression(expressions)

| Param | Type | Description |
| --- | --- | --- |
| expressions | <code>[external:Array.&lt;Expression&gt;](#Expression)</code> | The expressions in the sequence |

<a name="SequenceExpression+expressions"></a>

### sequenceExpression.expressions : <code>[external:Array.&lt;Expression&gt;](#Expression)</code>
**Kind**: instance property of <code>[SequenceExpression](#SequenceExpression)</code>  
<a name="SequenceExpression+toJSON"></a>

### sequenceExpression.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[SequenceExpression](#SequenceExpression)</code>  
**Overrides:** <code>[toJSON](#Node+toJSON)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the sequence expression  
<a name="Node+is"></a>

### sequenceExpression.is(type) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: instance method of <code>[SequenceExpression](#SequenceExpression)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the node is of the type provided.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+toString"></a>

### sequenceExpression.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[SequenceExpression](#SequenceExpression)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the node  
<a name="Punctuator"></a>

## Punctuator ⇐ <code>[Node](#Node)</code>
**Kind**: global class  
**Extends:** <code>[Node](#Node)</code>  

* [Punctuator](#Punctuator) ⇐ <code>[Node](#Node)</code>
    * [new Punctuator(value)](#new_Punctuator_new)
    * [.value](#Punctuator+value) : <code>[string](#external_string)</code>
    * [.toJSON()](#Punctuator+toJSON) ⇒ <code>[Object](#external_Object)</code>
    * [.is(type)](#Node+is) ⇒ <code>[boolean](#external_boolean)</code>
    * [.toString()](#Node+toString) ⇒ <code>[string](#external_string)</code>

<a name="new_Punctuator_new"></a>

### new Punctuator(value)

| Param | Type |
| --- | --- |
| value | <code>[string](#external_string)</code> | 

<a name="Punctuator+value"></a>

### punctuator.value : <code>[string](#external_string)</code>
**Kind**: instance property of <code>[Punctuator](#Punctuator)</code>  
<a name="Punctuator+toJSON"></a>

### punctuator.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[Punctuator](#Punctuator)</code>  
**Overrides:** <code>[toJSON](#Node+toJSON)</code>  
**Returns**: <code>[Object](#external_Object)</code> - A JSON representation of the punctuator  
<a name="Node+is"></a>

### punctuator.is(type) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: instance method of <code>[Punctuator](#Punctuator)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the node is of the type provided.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[NodeType](#NodeType)</code> | A node type |

<a name="Node+toString"></a>

### punctuator.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[Punctuator](#Punctuator)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the node  
<a name="Token"></a>

## Token ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  

* [Token](#Token) ⇐ <code>[Null](#Null)</code>
    * [new Token(type, value)](#new_Token_new)
    * [.is(type)](#Token+is) ⇒ <code>[boolean](#external_boolean)</code>

<a name="new_Token_new"></a>

### new Token(type, value)
**Throws**:

- <code>[TypeError](#external_TypeError)</code> If `type` is not a string
- <code>[TypeError](#external_TypeError)</code> If `value` is undefined.


| Param | Type | Description |
| --- | --- | --- |
| type | <code>[string](#external_string)</code> | The type of the token |
| value | <code>\*</code> | The value of the token |

<a name="Token+is"></a>

### token.is(type) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: instance method of <code>[Token](#Token)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the token is the `type` provided.  

| Param | Type |
| --- | --- |
| type | <code>[string](#external_string)</code> | 

<a name="id"></a>

## id : <code>[number](#external_number)</code>
**Kind**: global variable  
<a name="type"></a>

## type : <code>[NodeType](#NodeType)</code>
**Kind**: global variable  
<a name="interpret"></a>

## interpret : <code>object</code>
**Kind**: global namespace  

* [interpret](#interpret) : <code>object</code>
    * [.ArrayExpression(interpeter, node, context)](#interpret.ArrayExpression) ⇒ <code>[Function](#external_Function)</code>
    * [.CallExpression(interpeter, node, context)](#interpret.CallExpression) ⇒ <code>[Function](#external_Function)</code>
    * [.Identifier(interpeter, node, context)](#interpret.Identifier) ⇒ <code>[Function](#external_Function)</code>
    * [.Literal(interpeter, node, context)](#interpret.Literal) ⇒ <code>[Function](#external_Function)</code>
    * [.MemberExpression(interpeter, node, context)](#interpret.MemberExpression) ⇒ <code>[Function](#external_Function)</code>
    * [.SequenceExpression(interpeter, node, context)](#interpret.SequenceExpression) ⇒ <code>[Function](#external_Function)</code>

<a name="interpret.ArrayExpression"></a>

### interpret.ArrayExpression(interpeter, node, context) ⇒ <code>[Function](#external_Function)</code>
**Kind**: static method of <code>[interpret](#interpret)</code>  
**Returns**: <code>[Function](#external_Function)</code> - The interpreted expression.  

| Param | Type |
| --- | --- |
| interpeter | <code>[Interpreter](#Interpreter)</code> | 
| node | <code>[Node](#Node)</code> | 
| context | <code>[boolean](#external_boolean)</code> | 

<a name="interpret.CallExpression"></a>

### interpret.CallExpression(interpeter, node, context) ⇒ <code>[Function](#external_Function)</code>
**Kind**: static method of <code>[interpret](#interpret)</code>  
**Returns**: <code>[Function](#external_Function)</code> - The interpreted expression.  

| Param | Type |
| --- | --- |
| interpeter | <code>[Interpreter](#Interpreter)</code> | 
| node | <code>[Node](#Node)</code> | 
| context | <code>[boolean](#external_boolean)</code> | 

<a name="interpret.Identifier"></a>

### interpret.Identifier(interpeter, node, context) ⇒ <code>[Function](#external_Function)</code>
**Kind**: static method of <code>[interpret](#interpret)</code>  
**Returns**: <code>[Function](#external_Function)</code> - The interpreted expression.  

| Param | Type |
| --- | --- |
| interpeter | <code>[Interpreter](#Interpreter)</code> | 
| node | <code>[Node](#Node)</code> | 
| context | <code>[boolean](#external_boolean)</code> | 

<a name="interpret.Literal"></a>

### interpret.Literal(interpeter, node, context) ⇒ <code>[Function](#external_Function)</code>
**Kind**: static method of <code>[interpret](#interpret)</code>  
**Returns**: <code>[Function](#external_Function)</code> - The interpreted expression.  

| Param | Type |
| --- | --- |
| interpeter | <code>[Interpreter](#Interpreter)</code> | 
| node | <code>[Node](#Node)</code> | 
| context | <code>[boolean](#external_boolean)</code> | 

<a name="interpret.MemberExpression"></a>

### interpret.MemberExpression(interpeter, node, context) ⇒ <code>[Function](#external_Function)</code>
**Kind**: static method of <code>[interpret](#interpret)</code>  
**Returns**: <code>[Function](#external_Function)</code> - The interpreted expression.  

| Param | Type |
| --- | --- |
| interpeter | <code>[Interpreter](#Interpreter)</code> | 
| node | <code>[Node](#Node)</code> | 
| context | <code>[boolean](#external_boolean)</code> | 

<a name="interpret.SequenceExpression"></a>

### interpret.SequenceExpression(interpeter, node, context) ⇒ <code>[Function](#external_Function)</code>
**Kind**: static method of <code>[interpret](#interpret)</code>  
**Returns**: <code>[Function](#external_Function)</code> - The interpreted expression.  

| Param | Type |
| --- | --- |
| interpeter | <code>[Interpreter](#Interpreter)</code> | 
| node | <code>[Node](#Node)</code> | 
| context | <code>[boolean](#external_boolean)</code> | 

<a name="kp"></a>

## kp(literals, ...values) ⇒ <code>[kpCallback](#kpCallback)</code>
A template literal tag for keypath processing.

**Kind**: global function  

| Param | Type |
| --- | --- |
| literals | <code>external:Array.&lt;string&gt;</code> | 
| ...values | <code>[Array](#external_Array)</code> | 

**Example**  
```js
const object = { foo: { bar: { qux: { baz: 'fuz' } } } },
 getBaz = ( target ) => kp`foo.bar.qux.baz`( target );

console.log( getBaz( object ) ); // "fuz"
```
<a name="kpCallback"></a>

## kpCallback : <code>function</code>
**Kind**: global typedef  

| Param | Type |
| --- | --- |
| target | <code>\*</code> | 
| [value] | <code>\*</code> | 

<a name="NodeType"></a>

## NodeType : <code>[string](#external_string)</code>
**Kind**: global typedef  
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
