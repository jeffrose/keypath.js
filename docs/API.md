## Classes

<dl>
<dt><a href="#BuilderError">BuilderError</a> ⇐ <code>SyntaxError</code></dt>
<dd></dd>
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
</dl>

<a name="BuilderError"></a>

## BuilderError ⇐ <code>SyntaxError</code>
**Kind**: global class  
**Extends:** <code>SyntaxError</code>  
<a name="new_BuilderError_new"></a>

### new BuilderError(message)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>[string](#external_string)</code> | The error message |

<a name="Builder"></a>

## Builder ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  
<a name="new_Builder_new"></a>

### new Builder(lexer)

| Param | Type |
| --- | --- |
| lexer | <code>[Lexer](#Lexer)</code> | 

<a name="Interpreter"></a>

## Interpreter ⇐ <code>[Null](#Null)</code>
**Kind**: global class  
**Extends:** <code>[Null](#Null)</code>  
<a name="new_Interpreter_new"></a>

### new Interpreter(builder)

| Param | Type |
| --- | --- |
| builder | <code>[Builder](#Builder)</code> | 

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
