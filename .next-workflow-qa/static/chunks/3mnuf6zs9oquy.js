(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,359445,(e,t,s)=>{"use strict";Object.defineProperty(s,"__esModule",{value:!0});class r{constructor(e,t,s){this.line=void 0,this.column=void 0,this.index=void 0,this.line=e,this.column=t,this.index=s}}class i{constructor(e,t){this.start=void 0,this.end=void 0,this.filename=void 0,this.identifierName=void 0,this.start=e,this.end=t}}function a(e,t){let{line:s,column:i,index:a}=e;return new r(s,i+t,a+t)}let o="BABEL_PARSER_SOURCETYPE_MODULE_REQUIRED",n={ArrayPattern:"array destructuring pattern",AssignmentExpression:"assignment expression",AssignmentPattern:"assignment expression",ArrowFunctionExpression:"arrow function expression",ConditionalExpression:"conditional expression",CatchClause:"catch clause",ForOfStatement:"for-of statement",ForInStatement:"for-in statement",ForStatement:"for-loop",FormalParameters:"function parameter list",Identifier:"identifier",ImportSpecifier:"import specifier",ImportDefaultSpecifier:"import default specifier",ImportNamespaceSpecifier:"import namespace specifier",ObjectPattern:"object destructuring pattern",ParenthesizedExpression:"parenthesized expression",RestElement:"rest element",UpdateExpression:{true:"prefix operation",false:"postfix operation"},VariableDeclarator:"variable declaration",YieldExpression:"yield expression"},l=e=>"UpdateExpression"===e.type?n.UpdateExpression[`${e.prefix}`]:n[e.type],p=new Set(["ArrowFunctionExpression","AssignmentExpression","ConditionalExpression","YieldExpression"]);var c=Object.assign({PipeBodyIsTighter:"Unexpected yield after pipeline body; any yield expression acting as Hack-style pipe body must be parenthesized due to its loose operator precedence.",PipeTopicRequiresHackPipes:'Topic reference is used, but the pipelineOperator plugin was not passed a "proposal": "hack" or "smart" option.',PipeTopicUnbound:"Topic reference is unbound; it must be inside a pipe body.",PipeTopicUnconfiguredToken:({token:e})=>`Invalid topic token ${e}. In order to use ${e} as a topic reference, the pipelineOperator plugin must be configured with { "proposal": "hack", "topicToken": "${e}" }.`,PipeTopicUnused:"Hack-style pipe body does not contain a topic reference; Hack-style pipes must use topic at least once.",PipeUnparenthesizedBody:({type:e})=>`Hack-style pipe body cannot be an unparenthesized ${l({type:e})}; please wrap it in parentheses.`},{PipelineBodyNoArrow:'Unexpected arrow "=>" after pipeline body; arrow function in pipeline body must be parenthesized.',PipelineBodySequenceExpression:"Pipeline body may not be a comma-separated sequence expression.",PipelineHeadSequenceExpression:"Pipeline head should not be a comma-separated sequence expression.",PipelineTopicUnused:"Pipeline is in topic style but does not use topic reference.",PrimaryTopicNotAllowed:"Topic reference was used in a lexical context without topic binding.",PrimaryTopicRequiresSmartPipeline:'Topic reference is used, but the pipelineOperator plugin was not passed a "proposal": "hack" or "smart" option.'});let h=["message"];function d(e,t,s){Object.defineProperty(e,t,{enumerable:!1,configurable:!0,value:s})}function u(e,t){if(Array.isArray(e))return t=>u(t,e[0]);let s={};for(let i of Object.keys(e)){let a=e[i],o="string"==typeof a?{message:()=>a}:"function"==typeof a?{message:a}:a,{message:n}=o,l=function(e,t){if(null==e)return{};var s={};for(var r in e)if(({}).hasOwnProperty.call(e,r)){if(-1!==t.indexOf(r))continue;s[r]=e[r]}return s}(o,h),p="string"==typeof n?()=>n:n;s[i]=function({toMessage:e,code:t,reasonCode:s,syntaxPlugin:i}){let a="MissingPlugin"===s||"MissingOneOfPlugins"===s,o={AccessorCannotDeclareThisParameter:"AccesorCannotDeclareThisParameter",AccessorCannotHaveTypeParameters:"AccesorCannotHaveTypeParameters",ConstInitializerMustBeStringOrNumericLiteralOrLiteralEnumReference:"ConstInitiailizerMustBeStringOrNumericLiteralOrLiteralEnumReference",SetAccessorCannotHaveOptionalParameter:"SetAccesorCannotHaveOptionalParameter",SetAccessorCannotHaveRestParameter:"SetAccesorCannotHaveRestParameter",SetAccessorCannotHaveReturnType:"SetAccesorCannotHaveReturnType"};return o[s]&&(s=o[s]),function o(n,l){let p=SyntaxError();return p.code=t,p.reasonCode=s,p.loc=n,p.pos=n.index,p.syntaxPlugin=i,a&&(p.missingPlugin=l.missingPlugin),d(p,"clone",function(e={}){var t;let{line:s,column:i,index:a}=null!=(t=e.loc)?t:n;return o(new r(s,i,a),Object.assign({},l,e.details))}),d(p,"details",l),Object.defineProperty(p,"message",{configurable:!0,get(){let t=`${e(l)} (${n.line}:${n.column})`;return this.message=t,t},set(e){Object.defineProperty(this,"message",{value:e,writable:!0})}}),p}}(Object.assign({code:"BABEL_PARSER_SYNTAX_ERROR",reasonCode:i,toMessage:p},t?{syntaxPlugin:t}:{},l))}return s}let m=Object.assign({},u({ImportMetaOutsideModule:{message:"import.meta may appear only with 'sourceType: \"module\"'",code:o},ImportOutsideModule:{message:"'import' and 'export' may appear only with 'sourceType: \"module\"'",code:o}}),u({AccessorIsGenerator:({kind:e})=>`A ${e}ter cannot be a generator.`,ArgumentsInClass:"'arguments' is only allowed in functions and class methods.",AsyncFunctionInSingleStatementContext:"Async functions can only be declared at the top level or inside a block.",AwaitBindingIdentifier:"Can not use 'await' as identifier inside an async function.",AwaitBindingIdentifierInStaticBlock:"Can not use 'await' as identifier inside a static block.",AwaitExpressionFormalParameter:"'await' is not allowed in async function parameters.",AwaitUsingNotInAsyncContext:"'await using' is only allowed within async functions and at the top levels of modules.",AwaitNotInAsyncContext:"'await' is only allowed within async functions and at the top levels of modules.",BadGetterArity:"A 'get' accessor must not have any formal parameters.",BadSetterArity:"A 'set' accessor must have exactly one formal parameter.",BadSetterRestParameter:"A 'set' accessor function argument must not be a rest parameter.",ConstructorClassField:"Classes may not have a field named 'constructor'.",ConstructorClassPrivateField:"Classes may not have a private field named '#constructor'.",ConstructorIsAccessor:"Class constructor may not be an accessor.",ConstructorIsAsync:"Constructor can't be an async function.",ConstructorIsGenerator:"Constructor can't be a generator.",DeclarationMissingInitializer:({kind:e})=>`Missing initializer in ${e} declaration.`,DecoratorArgumentsOutsideParentheses:"Decorator arguments must be moved inside parentheses: use '@(decorator(args))' instead of '@(decorator)(args)'.",DecoratorBeforeExport:"Decorators must be placed *before* the 'export' keyword. Remove the 'decoratorsBeforeExport: true' option to use the 'export @decorator class {}' syntax.",DecoratorsBeforeAfterExport:"Decorators can be placed *either* before or after the 'export' keyword, but not in both locations at the same time.",DecoratorConstructor:"Decorators can't be used with a constructor. Did you mean '@dec class { ... }'?",DecoratorExportClass:"Decorators must be placed *after* the 'export' keyword. Remove the 'decoratorsBeforeExport: false' option to use the '@decorator export class {}' syntax.",DecoratorSemicolon:"Decorators must not be followed by a semicolon.",DecoratorStaticBlock:"Decorators can't be used with a static block.",DeferImportRequiresNamespace:'Only `import defer * as x from "./module"` is valid.',DeletePrivateField:"Deleting a private field is not allowed.",DestructureNamedImport:"ES2015 named imports do not destructure. Use another statement for destructuring after the import.",DuplicateConstructor:"Duplicate constructor in the same class.",DuplicateDefaultExport:"Only one default export allowed per module.",DuplicateExport:({exportName:e})=>`\`${e}\` has already been exported. Exported identifiers must be unique.`,DuplicateProto:"Redefinition of __proto__ property.",DuplicateRegExpFlags:"Duplicate regular expression flag.",ElementAfterRest:"Rest element must be last element.",EscapedCharNotAnIdentifier:"Invalid Unicode escape.",ExportBindingIsString:({localName:e,exportName:t})=>`A string literal cannot be used as an exported binding without \`from\`.
- Did you mean \`export { '${e}' as '${t}' } from 'some-module'\`?`,ExportDefaultFromAsIdentifier:"'from' is not allowed as an identifier after 'export default'.",ForInOfLoopInitializer:({type:e})=>`'${"ForInStatement"===e?"for-in":"for-of"}' loop variable declaration may not have an initializer.`,ForInUsing:"For-in loop may not start with 'using' declaration.",ForOfAsync:"The left-hand side of a for-of loop may not be 'async'.",ForOfLet:"The left-hand side of a for-of loop may not start with 'let'.",GeneratorInSingleStatementContext:"Generators can only be declared at the top level or inside a block.",IllegalBreakContinue:({type:e})=>`Unsyntactic ${"BreakStatement"===e?"break":"continue"}.`,IllegalLanguageModeDirective:"Illegal 'use strict' directive in function with non-simple parameter list.",IllegalReturn:"'return' outside of function.",ImportAttributesUseAssert:"The `assert` keyword in import attributes is deprecated and it has been replaced by the `with` keyword. You can enable the `deprecatedImportAssert` parser plugin to suppress this error.",ImportBindingIsString:({importName:e})=>`A string literal cannot be used as an imported binding.
- Did you mean \`import { "${e}" as foo }\`?`,ImportCallArity:"`import()` requires exactly one or two arguments.",ImportCallNotNewExpression:"Cannot use new with import(...).",ImportCallSpreadArgument:"`...` is not allowed in `import()`.",ImportJSONBindingNotDefault:"A JSON module can only be imported with `default`.",ImportReflectionHasAssertion:"`import module x` cannot have assertions.",ImportReflectionNotBinding:'Only `import module x from "./module"` is valid.',IncompatibleRegExpUVFlags:"The 'u' and 'v' regular expression flags cannot be enabled at the same time.",InvalidBigIntLiteral:"Invalid BigIntLiteral.",InvalidCodePoint:"Code point out of bounds.",InvalidCoverDiscardElement:"'void' must be followed by an expression when not used in a binding position.",InvalidCoverInitializedName:"Invalid shorthand property initializer.",InvalidDecimal:"Invalid decimal.",InvalidDigit:({radix:e})=>`Expected number in radix ${e}.`,InvalidEscapeSequence:"Bad character escape sequence.",InvalidEscapeSequenceTemplate:"Invalid escape sequence in template.",InvalidEscapedReservedWord:({reservedWord:e})=>`Escape sequence in keyword ${e}.`,InvalidIdentifier:({identifierName:e})=>`Invalid identifier ${e}.`,InvalidLhs:({ancestor:e})=>`Invalid left-hand side in ${l(e)}.`,InvalidLhsBinding:({ancestor:e})=>`Binding invalid left-hand side in ${l(e)}.`,InvalidLhsOptionalChaining:({ancestor:e})=>`Invalid optional chaining in the left-hand side of ${l(e)}.`,InvalidNumber:"Invalid number.",InvalidOrMissingExponent:"Floating-point numbers require a valid exponent after the 'e'.",InvalidOrUnexpectedToken:({unexpected:e})=>`Unexpected character '${e}'.`,InvalidParenthesizedAssignment:"Invalid parenthesized assignment pattern.",InvalidPrivateFieldResolution:({identifierName:e})=>`Private name #${e} is not defined.`,InvalidPropertyBindingPattern:"Binding member expression.",InvalidRecordProperty:"Only properties and spread elements are allowed in record definitions.",InvalidRestAssignmentPattern:"Invalid rest operator's argument.",LabelRedeclaration:({labelName:e})=>`Label '${e}' is already declared.`,LetInLexicalBinding:"'let' is disallowed as a lexically bound name.",LineTerminatorBeforeArrow:"No line break is allowed before '=>'.",MalformedRegExpFlags:"Invalid regular expression flag.",MissingClassName:"A class name is required.",MissingEqInAssignment:"Only '=' operator can be used for specifying default value.",MissingSemicolon:"Missing semicolon.",MissingPlugin:({missingPlugin:e})=>`This experimental syntax requires enabling the parser plugin: ${e.map(e=>JSON.stringify(e)).join(", ")}.`,MissingOneOfPlugins:({missingPlugin:e})=>`This experimental syntax requires enabling one of the following parser plugin(s): ${e.map(e=>JSON.stringify(e)).join(", ")}.`,MissingUnicodeEscape:"Expecting Unicode escape sequence \\uXXXX.",MixingCoalesceWithLogical:"Nullish coalescing operator(??) requires parens when mixing with logical operators.",ModuleAttributeDifferentFromType:"The only accepted module attribute is `type`.",ModuleAttributeInvalidValue:"Only string literals are allowed as module attribute values.",ModuleAttributesWithDuplicateKeys:({key:e})=>`Duplicate key "${e}" is not allowed in module attributes.`,ModuleExportNameHasLoneSurrogate:({surrogateCharCode:e})=>`An export name cannot include a lone surrogate, found '\\u${e.toString(16)}'.`,ModuleExportUndefined:({localName:e})=>`Export '${e}' is not defined.`,MultipleDefaultsInSwitch:"Multiple default clauses.",NewlineAfterThrow:"Illegal newline after throw.",NoCatchOrFinally:"Missing catch or finally clause.",NumberIdentifier:"Identifier directly after number.",NumericSeparatorInEscapeSequence:"Numeric separators are not allowed inside unicode escape sequences or hex escape sequences.",ObsoleteAwaitStar:"'await*' has been removed from the async functions proposal. Use Promise.all() instead.",OptionalChainingNoNew:"Constructors in/after an Optional Chain are not allowed.",OptionalChainingNoTemplate:"Tagged Template Literals are not allowed in optionalChain.",OverrideOnConstructor:"'override' modifier cannot appear on a constructor declaration.",ParamDupe:"Argument name clash.",PatternHasAccessor:"Object pattern can't contain getter or setter.",PatternHasMethod:"Object pattern can't contain methods.",PrivateInExpectedIn:({identifierName:e})=>`Private names are only allowed in property accesses (\`obj.#${e}\`) or in \`in\` expressions (\`#${e} in obj\`).`,PrivateNameRedeclaration:({identifierName:e})=>`Duplicate private name #${e}.`,RecordExpressionBarIncorrectEndSyntaxType:"Record expressions ending with '|}' are only allowed when the 'syntaxType' option of the 'recordAndTuple' plugin is set to 'bar'.",RecordExpressionBarIncorrectStartSyntaxType:"Record expressions starting with '{|' are only allowed when the 'syntaxType' option of the 'recordAndTuple' plugin is set to 'bar'.",RecordExpressionHashIncorrectStartSyntaxType:"Record expressions starting with '#{' are only allowed when the 'syntaxType' option of the 'recordAndTuple' plugin is set to 'hash'.",RecordNoProto:"'__proto__' is not allowed in Record expressions.",RestTrailingComma:"Unexpected trailing comma after rest element.",SloppyFunction:"In non-strict mode code, functions can only be declared at top level or inside a block.",SloppyFunctionAnnexB:"In non-strict mode code, functions can only be declared at top level, inside a block, or as the body of an if statement.",SourcePhaseImportRequiresDefault:'Only `import source x from "./module"` is valid.',StaticPrototype:"Classes may not have static property named prototype.",SuperNotAllowed:"`super()` is only valid inside a class constructor of a subclass. Maybe a typo in the method name ('constructor') or not extending another class?",SuperPrivateField:"Private fields can't be accessed on super.",TrailingDecorator:"Decorators must be attached to a class element.",TupleExpressionBarIncorrectEndSyntaxType:"Tuple expressions ending with '|]' are only allowed when the 'syntaxType' option of the 'recordAndTuple' plugin is set to 'bar'.",TupleExpressionBarIncorrectStartSyntaxType:"Tuple expressions starting with '[|' are only allowed when the 'syntaxType' option of the 'recordAndTuple' plugin is set to 'bar'.",TupleExpressionHashIncorrectStartSyntaxType:"Tuple expressions starting with '#[' are only allowed when the 'syntaxType' option of the 'recordAndTuple' plugin is set to 'hash'.",UnexpectedArgumentPlaceholder:"Unexpected argument placeholder.",UnexpectedAwaitAfterPipelineBody:'Unexpected "await" after pipeline body; await must have parentheses in minimal proposal.',UnexpectedDigitAfterHash:"Unexpected digit after hash token.",UnexpectedImportExport:"'import' and 'export' may only appear at the top level.",UnexpectedKeyword:({keyword:e})=>`Unexpected keyword '${e}'.`,UnexpectedLeadingDecorator:"Leading decorators must be attached to a class declaration.",UnexpectedLexicalDeclaration:"Lexical declaration cannot appear in a single-statement context.",UnexpectedNewTarget:"`new.target` can only be used in functions or class properties.",UnexpectedNumericSeparator:"A numeric separator is only allowed between two digits.",UnexpectedPrivateField:"Unexpected private name.",UnexpectedReservedWord:({reservedWord:e})=>`Unexpected reserved word '${e}'.`,UnexpectedSuper:"'super' is only allowed in object methods and classes.",UnexpectedToken:({expected:e,unexpected:t})=>`Unexpected token${t?` '${t}'.`:""}${e?`, expected "${e}"`:""}`,UnexpectedTokenUnaryExponentiation:"Illegal expression. Wrap left hand side or entire exponentiation in parentheses.",UnexpectedUsingDeclaration:"Using declaration cannot appear in the top level when source type is `script` or in the bare case statement.",UnexpectedVoidPattern:"Unexpected void binding.",UnsupportedBind:"Binding should be performed on object property.",UnsupportedDecoratorExport:"A decorated export must export a class declaration.",UnsupportedDefaultExport:"Only expressions, functions or classes are allowed as the `default` export.",UnsupportedImport:"`import` can only be used in `import()` or `import.meta`.",UnsupportedMetaProperty:({target:e,onlyValidPropertyName:t})=>`The only valid meta property for ${e} is ${e}.${t}.`,UnsupportedParameterDecorator:"Decorators cannot be used to decorate parameters.",UnsupportedPropertyDecorator:"Decorators cannot be used to decorate object literal properties.",UnsupportedSuper:"'super' can only be used with function calls (i.e. super()) or in property accesses (i.e. super.prop or super[prop]).",UnterminatedComment:"Unterminated comment.",UnterminatedRegExp:"Unterminated regular expression.",UnterminatedString:"Unterminated string constant.",UnterminatedTemplate:"Unterminated template.",UsingDeclarationExport:"Using declaration cannot be exported.",UsingDeclarationHasBindingPattern:"Using declaration cannot have destructuring patterns.",VarRedeclaration:({identifierName:e})=>`Identifier '${e}' has already been declared.`,VoidPatternCatchClauseParam:"A void binding can not be the catch clause parameter. Use `try { ... } catch { ... }` if you want to discard the caught error.",VoidPatternInitializer:"A void binding may not have an initializer.",YieldBindingIdentifier:"Can not use 'yield' as identifier inside a generator.",YieldInParameter:"Yield expression is not allowed in formal parameters.",YieldNotInGeneratorFunction:"'yield' is only allowed within generator functions.",ZeroDigitNumericSeparator:"Numeric separator can not be used after leading 0."}),u({StrictDelete:"Deleting local variable in strict mode.",StrictEvalArguments:({referenceName:e})=>`Assigning to '${e}' in strict mode.`,StrictEvalArgumentsBinding:({bindingName:e})=>`Binding '${e}' in strict mode.`,StrictFunction:"In strict mode code, functions can only be declared at top level or inside a block.",StrictNumericEscape:"The only valid numeric escape in strict mode is '\\0'.",StrictOctalLiteral:"Legacy octal literals are not allowed in strict mode.",StrictWith:"'with' in strict mode."}),u({ParseExpressionEmptyInput:"Unexpected parseExpression() input: The input is empty or contains only comments.",ParseExpressionExpectsEOF:({unexpected:e})=>`Unexpected parseExpression() input: The input should contain exactly one expression, but the first expression is followed by the unexpected character \`${String.fromCodePoint(e)}\`.`}),u`pipelineOperator`(c)),{defineProperty:f}=Object,y=(e,t)=>{e&&f(e,t,{enumerable:!1,value:e[t]})};function g(e){return y(e.loc.start,"index"),y(e.loc.end,"index"),e}class x{constructor(e,t){this.token=void 0,this.preserveSpace=void 0,this.token=e,this.preserveSpace=!!t}}let b={brace:new x("{"),j_oTag:new x("<tag"),j_cTag:new x("</tag"),j_expr:new x("<tag>...</tag>",!0)};b.template=new x("`",!0);class P{constructor(e,t={}){this.label=void 0,this.keyword=void 0,this.beforeExpr=void 0,this.startsExpr=void 0,this.rightAssociative=void 0,this.isLoop=void 0,this.isAssign=void 0,this.prefix=void 0,this.postfix=void 0,this.binop=void 0,this.label=e,this.keyword=t.keyword,this.beforeExpr=!!t.beforeExpr,this.startsExpr=!!t.startsExpr,this.rightAssociative=!!t.rightAssociative,this.isLoop=!!t.isLoop,this.isAssign=!!t.isAssign,this.prefix=!!t.prefix,this.postfix=!!t.postfix,this.binop=null!=t.binop?t.binop:null,this.updateContext=null}}let v=new Map;function T(e,t={}){t.keyword=e;let s=R(e,t);return v.set(e,s),s}function w(e,t){return R(e,{beforeExpr:!0,binop:t})}let A=-1,N=[],S=[],C=[],E=[],I=[],k=[];function R(e,t={}){var s,r,i,a;return++A,S.push(e),C.push(null!=(s=t.binop)?s:-1),E.push(null!=(r=t.beforeExpr)&&r),I.push(null!=(i=t.startsExpr)&&i),k.push(null!=(a=t.prefix)&&a),N.push(new P(e,t)),A}function M(e,t={}){var s,r,i,a;return++A,v.set(e,A),S.push(e),C.push(null!=(s=t.binop)?s:-1),E.push(null!=(r=t.beforeExpr)&&r),I.push(null!=(i=t.startsExpr)&&i),k.push(null!=(a=t.prefix)&&a),N.push(new P("name",t)),A}let D={bracketL:R("[",{beforeExpr:!0,startsExpr:!0}),bracketHashL:R("#[",{beforeExpr:!0,startsExpr:!0}),bracketBarL:R("[|",{beforeExpr:!0,startsExpr:!0}),bracketR:R("]"),bracketBarR:R("|]"),braceL:R("{",{beforeExpr:!0,startsExpr:!0}),braceBarL:R("{|",{beforeExpr:!0,startsExpr:!0}),braceHashL:R("#{",{beforeExpr:!0,startsExpr:!0}),braceR:R("}"),braceBarR:R("|}"),parenL:R("(",{beforeExpr:!0,startsExpr:!0}),parenR:R(")"),comma:R(",",{beforeExpr:!0}),semi:R(";",{beforeExpr:!0}),colon:R(":",{beforeExpr:!0}),doubleColon:R("::",{beforeExpr:!0}),dot:R("."),question:R("?",{beforeExpr:!0}),questionDot:R("?."),arrow:R("=>",{beforeExpr:!0}),template:R("template"),ellipsis:R("...",{beforeExpr:!0}),backQuote:R("`",{startsExpr:!0}),dollarBraceL:R("${",{beforeExpr:!0,startsExpr:!0}),templateTail:R("...`",{startsExpr:!0}),templateNonTail:R("...${",{beforeExpr:!0,startsExpr:!0}),at:R("@"),hash:R("#",{startsExpr:!0}),interpreterDirective:R("#!..."),eq:R("=",{beforeExpr:!0,isAssign:!0}),assign:R("_=",{beforeExpr:!0,isAssign:!0}),slashAssign:R("_=",{beforeExpr:!0,isAssign:!0}),xorAssign:R("_=",{beforeExpr:!0,isAssign:!0}),moduloAssign:R("_=",{beforeExpr:!0,isAssign:!0}),incDec:R("++/--",{prefix:!0,postfix:!0,startsExpr:!0}),bang:R("!",{beforeExpr:!0,prefix:!0,startsExpr:!0}),tilde:R("~",{beforeExpr:!0,prefix:!0,startsExpr:!0}),doubleCaret:R("^^",{startsExpr:!0}),doubleAt:R("@@",{startsExpr:!0}),pipeline:w("|>",0),nullishCoalescing:w("??",1),logicalOR:w("||",1),logicalAND:w("&&",2),bitwiseOR:w("|",3),bitwiseXOR:w("^",4),bitwiseAND:w("&",5),equality:w("==/!=/===/!==",6),lt:w("</>/<=/>=",7),gt:w("</>/<=/>=",7),relational:w("</>/<=/>=",7),bitShift:w("<</>>/>>>",8),bitShiftL:w("<</>>/>>>",8),bitShiftR:w("<</>>/>>>",8),plusMin:R("+/-",{beforeExpr:!0,binop:9,prefix:!0,startsExpr:!0}),modulo:R("%",{binop:10,startsExpr:!0}),star:R("*",{binop:10}),slash:w("/",10),exponent:R("**",{beforeExpr:!0,binop:11,rightAssociative:!0}),_in:T("in",{beforeExpr:!0,binop:7}),_instanceof:T("instanceof",{beforeExpr:!0,binop:7}),_break:T("break"),_case:T("case",{beforeExpr:!0}),_catch:T("catch"),_continue:T("continue"),_debugger:T("debugger"),_default:T("default",{beforeExpr:!0}),_else:T("else",{beforeExpr:!0}),_finally:T("finally"),_function:T("function",{startsExpr:!0}),_if:T("if"),_return:T("return",{beforeExpr:!0}),_switch:T("switch"),_throw:T("throw",{beforeExpr:!0,prefix:!0,startsExpr:!0}),_try:T("try"),_var:T("var"),_const:T("const"),_with:T("with"),_new:T("new",{beforeExpr:!0,startsExpr:!0}),_this:T("this",{startsExpr:!0}),_super:T("super",{startsExpr:!0}),_class:T("class",{startsExpr:!0}),_extends:T("extends",{beforeExpr:!0}),_export:T("export"),_import:T("import",{startsExpr:!0}),_null:T("null",{startsExpr:!0}),_true:T("true",{startsExpr:!0}),_false:T("false",{startsExpr:!0}),_typeof:T("typeof",{beforeExpr:!0,prefix:!0,startsExpr:!0}),_void:T("void",{beforeExpr:!0,prefix:!0,startsExpr:!0}),_delete:T("delete",{beforeExpr:!0,prefix:!0,startsExpr:!0}),_do:T("do",{isLoop:!0,beforeExpr:!0}),_for:T("for",{isLoop:!0}),_while:T("while",{isLoop:!0}),_as:M("as",{startsExpr:!0}),_assert:M("assert",{startsExpr:!0}),_async:M("async",{startsExpr:!0}),_await:M("await",{startsExpr:!0}),_defer:M("defer",{startsExpr:!0}),_from:M("from",{startsExpr:!0}),_get:M("get",{startsExpr:!0}),_let:M("let",{startsExpr:!0}),_meta:M("meta",{startsExpr:!0}),_of:M("of",{startsExpr:!0}),_sent:M("sent",{startsExpr:!0}),_set:M("set",{startsExpr:!0}),_source:M("source",{startsExpr:!0}),_static:M("static",{startsExpr:!0}),_using:M("using",{startsExpr:!0}),_yield:M("yield",{startsExpr:!0}),_asserts:M("asserts",{startsExpr:!0}),_checks:M("checks",{startsExpr:!0}),_exports:M("exports",{startsExpr:!0}),_global:M("global",{startsExpr:!0}),_implements:M("implements",{startsExpr:!0}),_intrinsic:M("intrinsic",{startsExpr:!0}),_infer:M("infer",{startsExpr:!0}),_is:M("is",{startsExpr:!0}),_mixins:M("mixins",{startsExpr:!0}),_proto:M("proto",{startsExpr:!0}),_require:M("require",{startsExpr:!0}),_satisfies:M("satisfies",{startsExpr:!0}),_keyof:M("keyof",{startsExpr:!0}),_readonly:M("readonly",{startsExpr:!0}),_unique:M("unique",{startsExpr:!0}),_abstract:M("abstract",{startsExpr:!0}),_declare:M("declare",{startsExpr:!0}),_enum:M("enum",{startsExpr:!0}),_module:M("module",{startsExpr:!0}),_namespace:M("namespace",{startsExpr:!0}),_interface:M("interface",{startsExpr:!0}),_type:M("type",{startsExpr:!0}),_opaque:M("opaque",{startsExpr:!0}),name:R("name",{startsExpr:!0}),placeholder:R("%%",{startsExpr:!0}),string:R("string",{startsExpr:!0}),num:R("num",{startsExpr:!0}),bigint:R("bigint",{startsExpr:!0}),decimal:R("decimal",{startsExpr:!0}),regexp:R("regexp",{startsExpr:!0}),privateName:R("#name",{startsExpr:!0}),eof:R("eof"),jsxName:R("jsxName"),jsxText:R("jsxText",{beforeExpr:!0}),jsxTagStart:R("jsxTagStart",{startsExpr:!0}),jsxTagEnd:R("jsxTagEnd")};function L(e){return e>=93&&e<=133}function O(e){return e>=58&&e<=133}function F(e){return e>=58&&e<=137}function B(e){return e>=129&&e<=131}function U(e){return e>=58&&e<=92}function j(e){return e>=24&&e<=25}N[8].updateContext=e=>{e.pop()},N[5].updateContext=N[7].updateContext=N[23].updateContext=e=>{e.push(b.brace)},N[22].updateContext=e=>{e[e.length-1]===b.template?e.pop():e.push(b.template)},N[143].updateContext=e=>{e.push(b.j_expr,b.j_oTag)};let _="ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙՠ-ֈא-תׯ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࡠ-ࡪࡰ-ࢇࢉ-࢏ࢠ-ࣉऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱৼਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚ౜ౝౠౡಀಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽ೜-ೞೠೡೱೲഄ-ഌഎ-ഐഒ-ഺഽൎൔ-ൖൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄຆ-ຊຌ-ຣລວ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜑᜟ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡸᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭌᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᲀ-ᲊᲐ-ᲺᲽ-Ჿᳩ-ᳬᳮ-ᳳᳵᳶᳺᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄯㄱ-ㆎㆠ-ㆿㇰ-ㇿ㐀-䶿一-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-Ƛ꟱-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꣾꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭩꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ",H="·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߽߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࢗ-࢟࣊-ࣣ࣡-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯৾ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ૺ-૿ଁ-ଃ଼ା-ୄେୈୋ-୍୕-ୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఄ఼ా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ೳഀ-ഃ഻഼ാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ඁ-ඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ຼ່-໎໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜕ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠏-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᪿ-᫝᫠-᫫ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭᳴᳷-᳹᷀-᷿‌‍‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯・꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧ꠬ꢀꢁꢴ-ꣅ꣐-꣙꣠-꣱ꣿ-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿･",z=RegExp("["+_+"]"),V=RegExp("["+_+H+"]");_=H=null;let $=[0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,14,29,6,37,11,29,3,35,5,7,2,4,43,157,19,35,5,35,5,39,9,51,13,10,2,14,2,6,2,1,2,10,2,14,2,6,2,1,4,51,13,310,10,21,11,7,25,5,2,41,2,8,70,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,66,18,2,1,11,21,11,25,7,25,39,55,7,1,65,0,16,3,2,2,2,28,43,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,56,50,14,50,14,35,39,27,10,22,251,41,7,1,17,5,57,28,11,0,9,21,43,17,47,20,28,22,13,52,58,1,3,0,14,44,33,24,27,35,30,0,3,0,9,34,4,0,13,47,15,3,22,0,2,0,36,17,2,24,20,1,64,6,2,0,2,3,2,14,2,9,8,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,19,0,13,4,31,9,2,0,3,0,2,37,2,0,26,0,2,0,45,52,19,3,21,2,31,47,21,1,2,0,185,46,42,3,37,47,21,0,60,42,14,0,72,26,38,6,186,43,117,63,32,7,3,0,3,7,2,1,2,23,16,0,2,0,95,7,3,38,17,0,2,0,29,0,11,39,8,0,22,0,12,45,20,0,19,72,200,32,32,8,2,36,18,0,50,29,113,6,2,1,2,37,22,0,26,5,2,1,2,31,15,0,24,43,261,18,16,0,2,12,2,33,125,0,80,921,103,110,18,195,2637,96,16,1071,18,5,26,3994,6,582,6842,29,1763,568,8,30,18,78,18,29,19,47,17,3,32,20,6,18,433,44,212,63,33,24,3,24,45,74,6,0,67,12,65,1,2,0,15,4,10,7381,42,31,98,114,8702,3,2,6,2,1,2,290,16,0,30,2,3,0,15,3,9,395,2309,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,1845,30,7,5,262,61,147,44,11,6,17,0,322,29,19,43,485,27,229,29,3,0,208,30,2,2,2,1,2,6,3,4,10,1,225,6,2,3,2,1,2,14,2,196,60,67,8,0,1205,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42719,33,4381,3,5773,3,7472,16,621,2467,541,1507,4938,6,8489],q=[509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,574,3,9,9,7,9,32,4,318,1,78,5,71,10,50,3,123,2,54,14,32,10,3,1,11,3,46,10,8,0,46,9,7,2,37,13,2,9,6,1,45,0,13,2,49,13,9,3,2,11,83,11,7,0,3,0,158,11,6,9,7,3,56,1,2,6,3,1,3,2,10,0,11,1,3,6,4,4,68,8,2,0,3,0,2,3,2,4,2,0,15,1,83,17,10,9,5,0,82,19,13,9,214,6,3,8,28,1,83,16,16,9,82,12,9,9,7,19,58,14,5,9,243,14,166,9,71,5,2,1,3,3,2,0,2,1,13,9,120,6,3,6,4,0,29,9,41,6,2,3,9,0,10,10,47,15,199,7,137,9,54,7,2,7,17,9,57,21,2,13,123,5,4,0,2,1,2,6,2,0,9,9,49,4,2,1,2,4,9,9,55,9,266,3,10,1,2,0,49,6,4,4,14,10,5350,0,7,14,11465,27,2343,9,87,9,39,4,60,6,26,9,535,9,470,0,2,54,8,3,82,0,12,1,19628,1,4178,9,519,45,3,22,543,4,4,5,9,7,3,6,31,3,149,2,1418,49,513,54,5,49,9,0,15,0,23,4,2,14,1361,6,2,16,3,6,2,1,2,4,101,0,161,6,10,9,357,0,62,13,499,13,245,1,2,9,233,0,3,0,8,1,6,0,475,6,110,6,6,9,4759,9,787719,239];function W(e,t){let s=65536;for(let r=0,i=t.length;r<i&&!((s+=t[r])>e);r+=2)if((s+=t[r+1])>=e)return!0;return!1}function G(e){return e<65?36===e:e<=90||(e<97?95===e:e<=122||(e<=65535?e>=170&&z.test(String.fromCharCode(e)):W(e,$)))}function K(e){return e<48?36===e:e<58||!(e<65)&&(e<=90||(e<97?95===e:e<=122||(e<=65535?e>=170&&V.test(String.fromCharCode(e)):W(e,$)||W(e,q))))}let J=new Set(["break","case","catch","continue","debugger","default","do","else","finally","for","function","if","return","switch","throw","try","var","const","while","with","new","this","super","class","extends","export","import","null","true","false","in","instanceof","typeof","void","delete"]),X=new Set(["implements","interface","let","package","private","protected","public","static","yield"]),Y=new Set(["eval","arguments"]);function Z(e,t){return t&&"await"===e||"enum"===e}function Q(e,t){return Z(e,t)||X.has(e)}function ee(e,t){return Q(e,t)||Y.has(e)}let et=new Set(["break","case","catch","continue","debugger","default","do","else","finally","for","function","if","return","switch","throw","try","var","const","while","with","new","this","super","class","extends","export","import","null","true","false","in","instanceof","typeof","void","delete","implements","interface","let","package","private","protected","public","static","yield","eval","arguments","enum","await"]);class es{constructor(e){this.flags=0,this.names=new Map,this.firstLexicalName="",this.flags=e}}class er{constructor(e,t){this.parser=void 0,this.scopeStack=[],this.inModule=void 0,this.undefinedExports=new Map,this.parser=e,this.inModule=t}get inTopLevel(){return(1&this.currentScope().flags)>0}get inFunction(){return(2&this.currentVarScopeFlags())>0}get allowSuper(){return(16&this.currentThisScopeFlags())>0}get allowDirectSuper(){return(32&this.currentThisScopeFlags())>0}get allowNewTarget(){return(512&this.currentThisScopeFlags())>0}get inClass(){return(64&this.currentThisScopeFlags())>0}get inClassAndNotInNonArrowFunction(){let e=this.currentThisScopeFlags();return(64&e)>0&&(2&e)==0}get inStaticBlock(){for(let e=this.scopeStack.length-1;;e--){let{flags:t}=this.scopeStack[e];if(128&t)return!0;if(1731&t)return!1}}get inNonArrowFunction(){return(2&this.currentThisScopeFlags())>0}get inBareCaseStatement(){return(256&this.currentScope().flags)>0}get treatFunctionsAsVar(){return this.treatFunctionsAsVarInScope(this.currentScope())}createScope(e){return new es(e)}enter(e){this.scopeStack.push(this.createScope(e))}exit(){return this.scopeStack.pop().flags}treatFunctionsAsVarInScope(e){return!!(130&e.flags||!this.parser.inModule&&1&e.flags)}declareName(e,t,s){let r=this.currentScope();if(8&t||16&t){this.checkRedeclarationInScope(r,e,t,s);let i=r.names.get(e)||0;16&t?i|=4:(r.firstLexicalName||(r.firstLexicalName=e),i|=2),r.names.set(e,i),8&t&&this.maybeExportDefined(r,e)}else if(4&t)for(let i=this.scopeStack.length-1;i>=0&&(r=this.scopeStack[i],this.checkRedeclarationInScope(r,e,t,s),r.names.set(e,1|(r.names.get(e)||0)),this.maybeExportDefined(r,e),!(1667&r.flags));--i);this.parser.inModule&&1&r.flags&&this.undefinedExports.delete(e)}maybeExportDefined(e,t){this.parser.inModule&&1&e.flags&&this.undefinedExports.delete(t)}checkRedeclarationInScope(e,t,s,r){this.isRedeclaredInScope(e,t,s)&&this.parser.raise(m.VarRedeclaration,r,{identifierName:t})}isRedeclaredInScope(e,t,s){if(!(1&s))return!1;if(8&s)return e.names.has(t);let r=e.names.get(t)||0;return 16&s?(2&r)>0||!this.treatFunctionsAsVarInScope(e)&&(1&r)>0:(2&r)>0&&!(8&e.flags&&e.firstLexicalName===t)||!this.treatFunctionsAsVarInScope(e)&&(4&r)>0}checkLocalExport(e){let{name:t}=e;this.scopeStack[0].names.has(t)||this.undefinedExports.set(t,e.loc.start)}currentScope(){return this.scopeStack[this.scopeStack.length-1]}currentVarScopeFlags(){for(let e=this.scopeStack.length-1;;e--){let{flags:t}=this.scopeStack[e];if(1667&t)return t}}currentThisScopeFlags(){for(let e=this.scopeStack.length-1;;e--){let{flags:t}=this.scopeStack[e];if(1731&t&&!(4&t))return t}}}class ei extends es{constructor(...e){super(...e),this.declareFunctions=new Set}}class ea extends er{createScope(e){return new ei(e)}declareName(e,t,s){let r=this.currentScope();if(2048&t){this.checkRedeclarationInScope(r,e,t,s),this.maybeExportDefined(r,e),r.declareFunctions.add(e);return}super.declareName(e,t,s)}isRedeclaredInScope(e,t,s){if(super.isRedeclaredInScope(e,t,s))return!0;if(2048&s&&!e.declareFunctions.has(t)){let s=e.names.get(t);return(4&s)>0||(2&s)>0}return!1}checkLocalExport(e){this.scopeStack[0].declareFunctions.has(e.name)||super.checkLocalExport(e)}}let eo=new Set(["_","any","bool","boolean","empty","extends","false","interface","mixed","null","number","static","string","true","typeof","void"]),en=u`flow`({AmbiguousConditionalArrow:"Ambiguous expression: wrap the arrow functions in parentheses to disambiguate.",AmbiguousDeclareModuleKind:"Found both `declare module.exports` and `declare export` in the same module. Modules can only have 1 since they are either an ES module or they are a CommonJS module.",AssignReservedType:({reservedType:e})=>`Cannot overwrite reserved type ${e}.`,DeclareClassElement:"The `declare` modifier can only appear on class fields.",DeclareClassFieldInitializer:"Initializers are not allowed in fields with the `declare` modifier.",DuplicateDeclareModuleExports:"Duplicate `declare module.exports` statement.",EnumBooleanMemberNotInitialized:({memberName:e,enumName:t})=>`Boolean enum members need to be initialized. Use either \`${e} = true,\` or \`${e} = false,\` in enum \`${t}\`.`,EnumDuplicateMemberName:({memberName:e,enumName:t})=>`Enum member names need to be unique, but the name \`${e}\` has already been used before in enum \`${t}\`.`,EnumInconsistentMemberValues:({enumName:e})=>`Enum \`${e}\` has inconsistent member initializers. Either use no initializers, or consistently use literals (either booleans, numbers, or strings) for all member initializers.`,EnumInvalidExplicitType:({invalidEnumType:e,enumName:t})=>`Enum type \`${e}\` is not valid. Use one of \`boolean\`, \`number\`, \`string\`, or \`symbol\` in enum \`${t}\`.`,EnumInvalidExplicitTypeUnknownSupplied:({enumName:e})=>`Supplied enum type is not valid. Use one of \`boolean\`, \`number\`, \`string\`, or \`symbol\` in enum \`${e}\`.`,EnumInvalidMemberInitializerPrimaryType:({enumName:e,memberName:t,explicitType:s})=>`Enum \`${e}\` has type \`${s}\`, so the initializer of \`${t}\` needs to be a ${s} literal.`,EnumInvalidMemberInitializerSymbolType:({enumName:e,memberName:t})=>`Symbol enum members cannot be initialized. Use \`${t},\` in enum \`${e}\`.`,EnumInvalidMemberInitializerUnknownType:({enumName:e,memberName:t})=>`The enum member initializer for \`${t}\` needs to be a literal (either a boolean, number, or string) in enum \`${e}\`.`,EnumInvalidMemberName:({enumName:e,memberName:t,suggestion:s})=>`Enum member names cannot start with lowercase 'a' through 'z'. Instead of using \`${t}\`, consider using \`${s}\`, in enum \`${e}\`.`,EnumNumberMemberNotInitialized:({enumName:e,memberName:t})=>`Number enum members need to be initialized, e.g. \`${t} = 1\` in enum \`${e}\`.`,EnumStringMemberInconsistentlyInitialized:({enumName:e})=>`String enum members need to consistently either all use initializers, or use no initializers, in enum \`${e}\`.`,GetterMayNotHaveThisParam:"A getter cannot have a `this` parameter.",ImportReflectionHasImportType:"An `import module` declaration can not use `type` or `typeof` keyword.",ImportTypeShorthandOnlyInPureImport:"The `type` and `typeof` keywords on named imports can only be used on regular `import` statements. It cannot be used with `import type` or `import typeof` statements.",InexactInsideExact:"Explicit inexact syntax cannot appear inside an explicit exact object type.",InexactInsideNonObject:"Explicit inexact syntax cannot appear in class or interface definitions.",InexactVariance:"Explicit inexact syntax cannot have variance.",InvalidNonTypeImportInDeclareModule:"Imports within a `declare module` body must always be `import type` or `import typeof`.",MissingTypeParamDefault:"Type parameter declaration needs a default, since a preceding type parameter declaration has a default.",NestedDeclareModule:"`declare module` cannot be used inside another `declare module`.",NestedFlowComment:"Cannot have a flow comment inside another flow comment.",PatternIsOptional:Object.assign({message:"A binding pattern parameter cannot be optional in an implementation signature."},{reasonCode:"OptionalBindingPattern"}),SetterMayNotHaveThisParam:"A setter cannot have a `this` parameter.",SpreadVariance:"Spread properties cannot have variance.",ThisParamAnnotationRequired:"A type annotation is required for the `this` parameter.",ThisParamBannedInConstructor:"Constructors cannot have a `this` parameter; constructors don't bind `this` like other functions.",ThisParamMayNotBeOptional:"The `this` parameter cannot be optional.",ThisParamMustBeFirst:"The `this` parameter must be the first function parameter.",ThisParamNoDefault:"The `this` parameter may not have a default value.",TypeBeforeInitializer:"Type annotations must come before default assignments, e.g. instead of `age = 25: number` use `age: number = 25`.",TypeCastInPattern:"The type cast expression is expected to be wrapped with parenthesis.",UnexpectedExplicitInexactInObject:"Explicit inexact syntax must appear at the end of an inexact object.",UnexpectedReservedType:({reservedType:e})=>`Unexpected reserved type ${e}.`,UnexpectedReservedUnderscore:"`_` is only allowed as a type argument to call or new.",UnexpectedSpaceBetweenModuloChecks:"Spaces between `%` and `checks` are not allowed here.",UnexpectedSpreadType:"Spread operator cannot appear in class or interface definitions.",UnexpectedSubtractionOperand:'Unexpected token, expected "number" or "bigint".',UnexpectedTokenAfterTypeParameter:"Expected an arrow function after this type parameter declaration.",UnexpectedTypeParameterBeforeAsyncArrowFunction:"Type parameters must come after the async keyword, e.g. instead of `<T> async () => {}`, use `async <T>() => {}`.",UnsupportedDeclareExportKind:({unsupportedExportKind:e,suggestion:t})=>`\`declare export ${e}\` is not supported. Use \`${t}\` instead.`,UnsupportedStatementInDeclareModule:"Only declares and type imports are allowed inside declare module.",UnterminatedFlowComment:"Unterminated flow-comment."});function el(e){return"type"===e.importKind||"typeof"===e.importKind}let ep={const:"declare export var",let:"declare export var",type:"export type",interface:"export interface"},ec=/\*?\s*@((?:no)?flow)\b/,eh={__proto__:null,quot:'"',amp:"&",apos:"'",lt:"<",gt:">",nbsp:" ",iexcl:"¡",cent:"¢",pound:"£",curren:"¤",yen:"¥",brvbar:"¦",sect:"§",uml:"¨",copy:"©",ordf:"ª",laquo:"«",not:"¬",shy:"­",reg:"®",macr:"¯",deg:"°",plusmn:"±",sup2:"²",sup3:"³",acute:"´",micro:"µ",para:"¶",middot:"·",cedil:"¸",sup1:"¹",ordm:"º",raquo:"»",frac14:"¼",frac12:"½",frac34:"¾",iquest:"¿",Agrave:"À",Aacute:"Á",Acirc:"Â",Atilde:"Ã",Auml:"Ä",Aring:"Å",AElig:"Æ",Ccedil:"Ç",Egrave:"È",Eacute:"É",Ecirc:"Ê",Euml:"Ë",Igrave:"Ì",Iacute:"Í",Icirc:"Î",Iuml:"Ï",ETH:"Ð",Ntilde:"Ñ",Ograve:"Ò",Oacute:"Ó",Ocirc:"Ô",Otilde:"Õ",Ouml:"Ö",times:"×",Oslash:"Ø",Ugrave:"Ù",Uacute:"Ú",Ucirc:"Û",Uuml:"Ü",Yacute:"Ý",THORN:"Þ",szlig:"ß",agrave:"à",aacute:"á",acirc:"â",atilde:"ã",auml:"ä",aring:"å",aelig:"æ",ccedil:"ç",egrave:"è",eacute:"é",ecirc:"ê",euml:"ë",igrave:"ì",iacute:"í",icirc:"î",iuml:"ï",eth:"ð",ntilde:"ñ",ograve:"ò",oacute:"ó",ocirc:"ô",otilde:"õ",ouml:"ö",divide:"÷",oslash:"ø",ugrave:"ù",uacute:"ú",ucirc:"û",uuml:"ü",yacute:"ý",thorn:"þ",yuml:"ÿ",OElig:"Œ",oelig:"œ",Scaron:"Š",scaron:"š",Yuml:"Ÿ",fnof:"ƒ",circ:"ˆ",tilde:"˜",Alpha:"Α",Beta:"Β",Gamma:"Γ",Delta:"Δ",Epsilon:"Ε",Zeta:"Ζ",Eta:"Η",Theta:"Θ",Iota:"Ι",Kappa:"Κ",Lambda:"Λ",Mu:"Μ",Nu:"Ν",Xi:"Ξ",Omicron:"Ο",Pi:"Π",Rho:"Ρ",Sigma:"Σ",Tau:"Τ",Upsilon:"Υ",Phi:"Φ",Chi:"Χ",Psi:"Ψ",Omega:"Ω",alpha:"α",beta:"β",gamma:"γ",delta:"δ",epsilon:"ε",zeta:"ζ",eta:"η",theta:"θ",iota:"ι",kappa:"κ",lambda:"λ",mu:"μ",nu:"ν",xi:"ξ",omicron:"ο",pi:"π",rho:"ρ",sigmaf:"ς",sigma:"σ",tau:"τ",upsilon:"υ",phi:"φ",chi:"χ",psi:"ψ",omega:"ω",thetasym:"ϑ",upsih:"ϒ",piv:"ϖ",ensp:" ",emsp:" ",thinsp:" ",zwnj:"‌",zwj:"‍",lrm:"‎",rlm:"‏",ndash:"–",mdash:"—",lsquo:"‘",rsquo:"’",sbquo:"‚",ldquo:"“",rdquo:"”",bdquo:"„",dagger:"†",Dagger:"‡",bull:"•",hellip:"…",permil:"‰",prime:"′",Prime:"″",lsaquo:"‹",rsaquo:"›",oline:"‾",frasl:"⁄",euro:"€",image:"ℑ",weierp:"℘",real:"ℜ",trade:"™",alefsym:"ℵ",larr:"←",uarr:"↑",rarr:"→",darr:"↓",harr:"↔",crarr:"↵",lArr:"⇐",uArr:"⇑",rArr:"⇒",dArr:"⇓",hArr:"⇔",forall:"∀",part:"∂",exist:"∃",empty:"∅",nabla:"∇",isin:"∈",notin:"∉",ni:"∋",prod:"∏",sum:"∑",minus:"−",lowast:"∗",radic:"√",prop:"∝",infin:"∞",ang:"∠",and:"∧",or:"∨",cap:"∩",cup:"∪",int:"∫",there4:"∴",sim:"∼",cong:"≅",asymp:"≈",ne:"≠",equiv:"≡",le:"≤",ge:"≥",sub:"⊂",sup:"⊃",nsub:"⊄",sube:"⊆",supe:"⊇",oplus:"⊕",otimes:"⊗",perp:"⊥",sdot:"⋅",lceil:"⌈",rceil:"⌉",lfloor:"⌊",rfloor:"⌋",lang:"〈",rang:"〉",loz:"◊",spades:"♠",clubs:"♣",hearts:"♥",diams:"♦"},ed=RegExp(/\r\n|[\r\n\u2028\u2029]/.source,"g");function eu(e){switch(e){case 10:case 13:case 8232:case 8233:return!0;default:return!1}}function em(e,t,s){for(let r=t;r<s;r++)if(eu(e.charCodeAt(r)))return!0;return!1}let ef=/(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g,ey=/(?:[^\S\n\r\u2028\u2029]|\/\/.*|\/\*.*?\*\/)*/g,eg=u`jsx`({AttributeIsEmpty:"JSX attributes must only be assigned a non-empty expression.",MissingClosingTagElement:({openingTagName:e})=>`Expected corresponding JSX closing tag for <${e}>.`,MissingClosingTagFragment:"Expected corresponding JSX closing tag for <>.",UnexpectedSequenceExpression:"Sequence expressions cannot be directly nested inside JSX. Did you mean to wrap it in parentheses (...)?",UnexpectedToken:({unexpected:e,HTMLEntity:t})=>`Unexpected token \`${e}\`. Did you mean \`${t}\` or \`{'${e}'}\`?`,UnsupportedJsxValue:"JSX value should be either an expression or a quoted JSX text.",UnterminatedJsxContent:"Unterminated JSX contents.",UnwrappedAdjacentJSXElements:"Adjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>?"});function ex(e){return!!e&&("JSXOpeningFragment"===e.type||"JSXClosingFragment"===e.type)}function eb(e){if("JSXIdentifier"===e.type)return e.name;if("JSXNamespacedName"===e.type)return e.namespace.name+":"+e.name.name;if("JSXMemberExpression"===e.type)return eb(e.object)+"."+eb(e.property);throw Error("Node had unexpected type: "+e.type)}class eP extends es{constructor(...e){super(...e),this.tsNames=new Map}}class ev extends er{constructor(...e){super(...e),this.importsStack=[]}createScope(e){return this.importsStack.push(new Set),new eP(e)}enter(e){1024===e&&this.importsStack.push(new Set),super.enter(e)}exit(){let e=super.exit();return 1024===e&&this.importsStack.pop(),e}hasImport(e,t){let s=this.importsStack.length;if(this.importsStack[s-1].has(e))return!0;if(!t&&s>1){for(let t=0;t<s-1;t++)if(this.importsStack[t].has(e))return!0}return!1}declareName(e,t,s){if(4096&t){this.hasImport(e,!0)&&this.parser.raise(m.VarRedeclaration,s,{identifierName:e}),this.importsStack[this.importsStack.length-1].add(e);return}let r=this.currentScope(),i=r.tsNames.get(e)||0;if(1024&t){this.maybeExportDefined(r,e),r.tsNames.set(e,16|i);return}super.declareName(e,t,s),2&t&&(1&t||(this.checkRedeclarationInScope(r,e,t,s),this.maybeExportDefined(r,e)),i|=1),256&t&&(i|=2),512&t&&(i|=4),128&t&&(i|=8),i&&r.tsNames.set(e,i)}isRedeclaredInScope(e,t,s){let r=e.tsNames.get(t);if((2&r)>0)return!(256&s)||!!(512&s)!=(4&r)>0;if(128&s&&(8&r)>0)if(2&e.names.get(t))return!!(1&s);else return!1;return!!(2&s)&&(1&r)>0||super.isRedeclaredInScope(e,t,s)}checkLocalExport(e){let{name:t}=e;if(this.hasImport(t))return;let s=this.scopeStack.length;for(let e=s-1;e>=0;e--){let s=this.scopeStack[e].tsNames.get(t);if((1&s)>0||(16&s)>0)return}super.checkLocalExport(e)}}class eT{constructor(){this.stacks=[]}enter(e){this.stacks.push(e)}exit(){this.stacks.pop()}currentFlags(){return this.stacks[this.stacks.length-1]}get hasAwait(){return(2&this.currentFlags())>0}get hasYield(){return(1&this.currentFlags())>0}get hasReturn(){return(4&this.currentFlags())>0}get hasIn(){return(8&this.currentFlags())>0}}function ew(e,t){return 2*!!e|!!t}class eA{constructor(){this.sawUnambiguousESM=!1,this.ambiguousScriptDifferentAst=!1}sourceToOffsetPos(e){return e+this.startIndex}offsetToSourcePos(e){return e-this.startIndex}hasPlugin(e){if("string"==typeof e)return this.plugins.has(e);{let[t,s]=e;if(!this.hasPlugin(t))return!1;let r=this.plugins.get(t);for(let e of Object.keys(s))if((null==r?void 0:r[e])!==s[e])return!1;return!0}}getPluginOption(e,t){var s;return null==(s=this.plugins.get(e))?void 0:s[t]}}function eN(e,t){void 0===e.trailingComments?e.trailingComments=t:e.trailingComments.unshift(...t)}function eS(e,t){void 0===e.innerComments?e.innerComments=t:e.innerComments.unshift(...t)}function eC(e,t,s){let r=null,i=t.length;for(;null===r&&i>0;)r=t[--i];null===r||r.start>s.start?eS(e,s.comments):eN(r,s.comments)}class eE extends eA{addComment(e){this.filename&&(e.loc.filename=this.filename);let{commentsLen:t}=this.state;this.comments.length!==t&&(this.comments.length=t),this.comments.push(e),this.state.commentsLen++}processComment(e){let{commentStack:t}=this.state,s=t.length;if(0===s)return;let r=s-1,i=t[r];i.start===e.end&&(i.leadingNode=e,r--);let{start:a}=e;for(;r>=0;r--){let s=t[r],i=s.end;if(i>a)s.containingNode=e,this.finalizeComment(s),t.splice(r,1);else{i===a&&(s.trailingNode=e);break}}}finalizeComment(e){var t,s;let{comments:r}=e;if(null!==e.leadingNode||null!==e.trailingNode)null!==e.leadingNode&&eN(e.leadingNode,r),null!==e.trailingNode&&(s=e.trailingNode,void 0===s.leadingComments?s.leadingComments=r:s.leadingComments.unshift(...r));else{let s=e.containingNode,i=e.start;if(44===this.input.charCodeAt(this.offsetToSourcePos(i)-1))switch(s.type){case"ObjectExpression":case"ObjectPattern":eC(s,s.properties,e);break;case"CallExpression":case"NewExpression":case"OptionalCallExpression":eC(s,s.arguments,e);break;case"ImportExpression":eC(s,[s.source,null!=(t=s.options)?t:null],e);break;case"FunctionDeclaration":case"FunctionExpression":case"ArrowFunctionExpression":case"ObjectMethod":case"ClassMethod":case"ClassPrivateMethod":case"TSTypeParameterDeclaration":eC(s,s.params,e);break;case"ArrayExpression":case"ArrayPattern":eC(s,s.elements,e);break;case"ExportNamedDeclaration":case"ImportDeclaration":eC(s,s.specifiers,e);break;case"TSEnumDeclaration":case"TSEnumBody":eC(s,s.members,e);break;case"TSInterfaceBody":eC(s,s.body,e);break;default:if("RecordExpression"===s.type){eC(s,s.properties,e);break}if("TupleExpression"===s.type){eC(s,s.elements,e);break}eS(s,r)}else eS(s,r)}}finalizeRemainingComments(){let{commentStack:e}=this.state;for(let t=e.length-1;t>=0;t--)this.finalizeComment(e[t]);this.state.commentStack=[]}resetPreviousNodeTrailingComments(e){let{commentStack:t}=this.state,{length:s}=t;if(0===s)return;let r=t[s-1];r.leadingNode===e&&(r.leadingNode=null)}takeSurroundingComments(e,t,s){let{commentStack:r}=this.state,i=r.length;if(0===i)return;let a=i-1;for(;a>=0;a--){let i=r[a],o=i.end;if(i.start===s)i.leadingNode=e;else if(o===t)i.trailingNode=e;else if(o<t)break}}}class eI{constructor(){this.flags=1024,this.startIndex=void 0,this.curLine=void 0,this.lineStart=void 0,this.startLoc=void 0,this.endLoc=void 0,this.errors=[],this.potentialArrowAt=-1,this.noArrowAt=[],this.noArrowParamsConversionAt=[],this.topicContext={maxNumOfResolvableTopics:0,maxTopicIndex:null},this.labels=[],this.commentsLen=0,this.commentStack=[],this.pos=0,this.type=140,this.value=null,this.start=0,this.end=0,this.lastTokEndLoc=null,this.lastTokStartLoc=null,this.context=[b.brace],this.firstInvalidTemplateEscapePos=null,this.strictErrors=new Map,this.tokensLength=0}get strict(){return(1&this.flags)>0}set strict(e){e?this.flags|=1:this.flags&=-2}init({strictMode:e,sourceType:t,startIndex:s,startLine:i,startColumn:a}){this.strict=!1!==e&&(!0===e||"module"===t),this.startIndex=s,this.curLine=i,this.lineStart=-a,this.startLoc=this.endLoc=new r(i,a,s)}get maybeInArrowParameters(){return(2&this.flags)>0}set maybeInArrowParameters(e){e?this.flags|=2:this.flags&=-3}get inType(){return(4&this.flags)>0}set inType(e){e?this.flags|=4:this.flags&=-5}get noAnonFunctionType(){return(8&this.flags)>0}set noAnonFunctionType(e){e?this.flags|=8:this.flags&=-9}get hasFlowComment(){return(16&this.flags)>0}set hasFlowComment(e){e?this.flags|=16:this.flags&=-17}get isAmbientContext(){return(32&this.flags)>0}set isAmbientContext(e){e?this.flags|=32:this.flags&=-33}get inAbstractClass(){return(64&this.flags)>0}set inAbstractClass(e){e?this.flags|=64:this.flags&=-65}get inDisallowConditionalTypesContext(){return(128&this.flags)>0}set inDisallowConditionalTypesContext(e){e?this.flags|=128:this.flags&=-129}get soloAwait(){return(256&this.flags)>0}set soloAwait(e){e?this.flags|=256:this.flags&=-257}get inFSharpPipelineDirectBody(){return(512&this.flags)>0}set inFSharpPipelineDirectBody(e){e?this.flags|=512:this.flags&=-513}get canStartJSXElement(){return(1024&this.flags)>0}set canStartJSXElement(e){e?this.flags|=1024:this.flags&=-1025}get containsEsc(){return(2048&this.flags)>0}set containsEsc(e){e?this.flags|=2048:this.flags&=-2049}get hasTopLevelAwait(){return(4096&this.flags)>0}set hasTopLevelAwait(e){e?this.flags|=4096:this.flags&=-4097}curPosition(){return new r(this.curLine,this.pos-this.lineStart,this.pos+this.startIndex)}clone(){let e=new eI;return e.flags=this.flags,e.startIndex=this.startIndex,e.curLine=this.curLine,e.lineStart=this.lineStart,e.startLoc=this.startLoc,e.endLoc=this.endLoc,e.errors=this.errors.slice(),e.potentialArrowAt=this.potentialArrowAt,e.noArrowAt=this.noArrowAt.slice(),e.noArrowParamsConversionAt=this.noArrowParamsConversionAt.slice(),e.topicContext=this.topicContext,e.labels=this.labels.slice(),e.commentsLen=this.commentsLen,e.commentStack=this.commentStack.slice(),e.pos=this.pos,e.type=this.type,e.value=this.value,e.start=this.start,e.end=this.end,e.lastTokEndLoc=this.lastTokEndLoc,e.lastTokStartLoc=this.lastTokStartLoc,e.context=this.context.slice(),e.firstInvalidTemplateEscapePos=this.firstInvalidTemplateEscapePos,e.strictErrors=this.strictErrors,e.tokensLength=this.tokensLength,e}}let ek={decBinOct:new Set([46,66,69,79,95,98,101,111]),hex:new Set([46,88,95,120])},eR=e=>48===e||49===e,eM=e=>e>=48&&e<=55,eD=e=>e>=48&&e<=57,eL=e=>e>=48&&e<=57||e>=65&&e<=70||e>=97&&e<=102;function eO(e,t,s,r,i,a){let o=s,n=r,l=i,p="",c=null,h=s,{length:d}=t;for(;;){var u,m,f,y;if(s>=d){a.unterminated(o,n,l),p+=t.slice(h,s);break}let g=t.charCodeAt(s);if(u=e,m=g,f=t,y=s,"template"===u?96===m||36===m&&123===f.charCodeAt(y+1):m===("double"===u?34:39)){p+=t.slice(h,s);break}if(92===g){p+=t.slice(h,s);let o=function(e,t,s,r,i,a){let o=!i;t++;let n=e=>({pos:t,ch:e,lineStart:s,curLine:r}),l=e.charCodeAt(t++);switch(l){case 110:return n("\n");case 114:return n("\r");case 120:{let i;return{code:i,pos:t}=eF(e,t,s,r,2,!1,o,a),n(null===i?null:String.fromCharCode(i))}case 117:{let i;return{code:i,pos:t}=eU(e,t,s,r,o,a),n(null===i?null:String.fromCodePoint(i))}case 116:return n("	");case 98:return n("\b");case 118:return n("\v");case 102:return n("\f");case 13:10===e.charCodeAt(t)&&++t;case 10:s=t,++r;case 8232:case 8233:return n("");case 56:case 57:if(i)return n(null);a.strictNumericEscape(t-1,s,r);default:if(l>=48&&l<=55){let o=t-1,l=/^[0-7]+/.exec(e.slice(o,t+2))[0],p=parseInt(l,8);p>255&&(p=parseInt(l=l.slice(0,-1),8)),t+=l.length-1;let c=e.charCodeAt(t);if("0"!==l||56===c||57===c)if(i)return n(null);else a.strictNumericEscape(o,s,r);return n(String.fromCharCode(p))}return n(String.fromCharCode(l))}}(t,s,r,i,"template"===e,a);null!==o.ch||c?p+=o.ch:c={pos:s,lineStart:r,curLine:i},({pos:s,lineStart:r,curLine:i}=o),h=s}else 8232===g||8233===g?(++s,++i,r=s):10===g||13===g?"template"===e?(p+=t.slice(h,s)+"\n",++s,13===g&&10===t.charCodeAt(s)&&++s,++i,h=r=s):a.unterminated(o,n,l):++s}return{pos:s,str:p,firstInvalidLoc:c,lineStart:r,curLine:i,containsInvalid:!!c}}function eF(e,t,s,r,i,a,o,n){let l,p=t;return{n:l,pos:t}=eB(e,t,s,r,16,i,a,!1,n,!o),null===l&&(o?n.invalidEscapeSequence(p,s,r):t=p-1),{code:l,pos:t}}function eB(e,t,s,r,i,a,o,n,l,p){let c=t,h=16===i?ek.hex:ek.decBinOct,d=16===i?eL:10===i?eD:8===i?eM:eR,u=!1,m=0;for(let c=0,f=null==a?1/0:a;c<f;++c){let a,c=e.charCodeAt(t);if(95===c&&"bail"!==n){let i=e.charCodeAt(t-1),a=e.charCodeAt(t+1);if(n){if(Number.isNaN(a)||!d(a)||h.has(i)||h.has(a)){if(p)return{n:null,pos:t};l.unexpectedNumericSeparator(t,s,r)}}else{if(p)return{n:null,pos:t};l.numericSeparatorInEscapeSequence(t,s,r)}++t;continue}if(c>=97)a=c-97+10;else if(c>=65)a=c-65+10;else a=c>=48&&c<=57?c-48:1/0;if(a>=i)if(a<=9&&p)return{n:null,pos:t};else if(a<=9&&l.invalidDigit(t,s,r,i))a=0;else if(o)a=0,u=!0;else break;++t,m=m*i+a}return t===c||null!=a&&t-c!==a||u?{n:null,pos:t}:{n:m,pos:t}}function eU(e,t,s,r,i,a){let o;if(123===e.charCodeAt(t)){if(++t,{code:o,pos:t}=eF(e,t,s,r,e.indexOf("}",t)-t,!0,i,a),++t,null!==o&&o>1114111)if(!i)return{code:null,pos:t};else a.invalidCodePoint(t,s,r)}else({code:o,pos:t}=eF(e,t,s,r,4,!1,i,a));return{code:o,pos:t}}function ej(e,t,s){return new r(s,e-t,e)}let e_=new Set([103,109,115,105,121,117,100,118]);class eH{constructor(e){const t=e.startIndex||0;this.type=e.type,this.value=e.value,this.start=t+e.start,this.end=t+e.end,this.loc=new i(e.startLoc,e.endLoc)}}class ez extends eE{constructor(e,t){super(),this.isLookahead=void 0,this.tokens=[],this.errorHandlers_readInt={invalidDigit:(e,t,s,r)=>!!(2048&this.optionFlags)&&(this.raise(m.InvalidDigit,ej(e,t,s),{radix:r}),!0),numericSeparatorInEscapeSequence:this.errorBuilder(m.NumericSeparatorInEscapeSequence),unexpectedNumericSeparator:this.errorBuilder(m.UnexpectedNumericSeparator)},this.errorHandlers_readCodePoint=Object.assign({},this.errorHandlers_readInt,{invalidEscapeSequence:this.errorBuilder(m.InvalidEscapeSequence),invalidCodePoint:this.errorBuilder(m.InvalidCodePoint)}),this.errorHandlers_readStringContents_string=Object.assign({},this.errorHandlers_readCodePoint,{strictNumericEscape:(e,t,s)=>{this.recordStrictModeErrors(m.StrictNumericEscape,ej(e,t,s))},unterminated:(e,t,s)=>{throw this.raise(m.UnterminatedString,ej(e-1,t,s))}}),this.errorHandlers_readStringContents_template=Object.assign({},this.errorHandlers_readCodePoint,{strictNumericEscape:this.errorBuilder(m.StrictNumericEscape),unterminated:(e,t,s)=>{throw this.raise(m.UnterminatedTemplate,ej(e,t,s))}}),this.state=new eI,this.state.init(e),this.input=t,this.length=t.length,this.comments=[],this.isLookahead=!1}pushToken(e){this.tokens.length=this.state.tokensLength,this.tokens.push(e),++this.state.tokensLength}next(){this.checkKeywordEscapes(),256&this.optionFlags&&this.pushToken(new eH(this.state)),this.state.lastTokEndLoc=this.state.endLoc,this.state.lastTokStartLoc=this.state.startLoc,this.nextToken()}eat(e){return!!this.match(e)&&(this.next(),!0)}match(e){return this.state.type===e}createLookaheadState(e){return{pos:e.pos,value:null,type:e.type,start:e.start,end:e.end,context:[this.curContext()],inType:e.inType,startLoc:e.startLoc,lastTokEndLoc:e.lastTokEndLoc,curLine:e.curLine,lineStart:e.lineStart,curPosition:e.curPosition}}lookahead(){let e=this.state;this.state=this.createLookaheadState(e),this.isLookahead=!0,this.nextToken(),this.isLookahead=!1;let t=this.state;return this.state=e,t}nextTokenStart(){return this.nextTokenStartSince(this.state.pos)}nextTokenStartSince(e){return ef.lastIndex=e,ef.test(this.input)?ef.lastIndex:e}lookaheadCharCode(){return this.lookaheadCharCodeSince(this.state.pos)}lookaheadCharCodeSince(e){return this.input.charCodeAt(this.nextTokenStartSince(e))}nextTokenInLineStart(){return this.nextTokenInLineStartSince(this.state.pos)}nextTokenInLineStartSince(e){return ey.lastIndex=e,ey.test(this.input)?ey.lastIndex:e}lookaheadInLineCharCode(){return this.input.charCodeAt(this.nextTokenInLineStart())}codePointAtPos(e){let t=this.input.charCodeAt(e);if((64512&t)==55296&&++e<this.input.length){let s=this.input.charCodeAt(e);(64512&s)==56320&&(t=65536+((1023&t)<<10)+(1023&s))}return t}setStrict(e){this.state.strict=e,e&&(this.state.strictErrors.forEach(([e,t])=>this.raise(e,t)),this.state.strictErrors.clear())}curContext(){return this.state.context[this.state.context.length-1]}nextToken(){(this.skipSpace(),this.state.start=this.state.pos,this.isLookahead||(this.state.startLoc=this.state.curPosition()),this.state.pos>=this.length)?this.finishToken(140):this.getTokenFromCode(this.codePointAtPos(this.state.pos))}skipBlockComment(e){let t;this.isLookahead||(t=this.state.curPosition());let s=this.state.pos,r=this.input.indexOf(e,s+2);if(-1===r)throw this.raise(m.UnterminatedComment,this.state.curPosition());for(this.state.pos=r+e.length,ed.lastIndex=s+2;ed.test(this.input)&&ed.lastIndex<=r;)++this.state.curLine,this.state.lineStart=ed.lastIndex;if(this.isLookahead)return;let a={type:"CommentBlock",value:this.input.slice(s+2,r),start:this.sourceToOffsetPos(s),end:this.sourceToOffsetPos(r+e.length),loc:new i(t,this.state.curPosition())};return 256&this.optionFlags&&this.pushToken(a),a}skipLineComment(e){let t,s=this.state.pos;this.isLookahead||(t=this.state.curPosition());let r=this.input.charCodeAt(this.state.pos+=e);if(this.state.pos<this.length)for(;!eu(r)&&++this.state.pos<this.length;)r=this.input.charCodeAt(this.state.pos);if(this.isLookahead)return;let a=this.state.pos,o={type:"CommentLine",value:this.input.slice(s+e,a),start:this.sourceToOffsetPos(s),end:this.sourceToOffsetPos(a),loc:new i(t,this.state.curPosition())};return 256&this.optionFlags&&this.pushToken(o),o}skipSpace(){let e=this.state.pos,t=4096&this.optionFlags?[]:null;e:for(;this.state.pos<this.length;){let s=this.input.charCodeAt(this.state.pos);switch(s){case 32:case 160:case 9:++this.state.pos;break;case 13:10===this.input.charCodeAt(this.state.pos+1)&&++this.state.pos;case 10:case 8232:case 8233:++this.state.pos,++this.state.curLine,this.state.lineStart=this.state.pos;break;case 47:switch(this.input.charCodeAt(this.state.pos+1)){case 42:{let e=this.skipBlockComment("*/");void 0!==e&&(this.addComment(e),null==t||t.push(e));break}case 47:{let e=this.skipLineComment(2);void 0!==e&&(this.addComment(e),null==t||t.push(e));break}default:break e}break;default:if(function(e){switch(e){case 9:case 11:case 12:case 32:case 160:case 5760:case 8192:case 8193:case 8194:case 8195:case 8196:case 8197:case 8198:case 8199:case 8200:case 8201:case 8202:case 8239:case 8287:case 12288:case 65279:return!0;default:return!1}}(s))++this.state.pos;else if(45===s&&!this.inModule&&8192&this.optionFlags){let s=this.state.pos;if(45===this.input.charCodeAt(s+1)&&62===this.input.charCodeAt(s+2)&&(0===e||this.state.lineStart>e)){let e=this.skipLineComment(3);void 0!==e&&(this.addComment(e),null==t||t.push(e))}else break e}else if(60===s&&!this.inModule&&8192&this.optionFlags){let e=this.state.pos;if(33===this.input.charCodeAt(e+1)&&45===this.input.charCodeAt(e+2)&&45===this.input.charCodeAt(e+3)){let e=this.skipLineComment(4);void 0!==e&&(this.addComment(e),null==t||t.push(e))}else break e}else break e}}if((null==t?void 0:t.length)>0){let s=this.state.pos,r={start:this.sourceToOffsetPos(e),end:this.sourceToOffsetPos(s),comments:t,leadingNode:null,trailingNode:null,containingNode:null};this.state.commentStack.push(r)}}finishToken(e,t){this.state.end=this.state.pos,this.state.endLoc=this.state.curPosition();let s=this.state.type;this.state.type=e,this.state.value=t,this.isLookahead||this.updateContext(s)}replaceToken(e){this.state.type=e,this.updateContext()}readToken_numberSign(){if(0===this.state.pos&&this.readToken_interpreter())return;let e=this.state.pos+1,t=this.codePointAtPos(e);if(t>=48&&t<=57)throw this.raise(m.UnexpectedDigitAfterHash,this.state.curPosition());if(123===t||91===t&&this.hasPlugin("recordAndTuple")){if(this.expectPlugin("recordAndTuple"),"bar"===this.getPluginOption("recordAndTuple","syntaxType"))throw this.raise(123===t?m.RecordExpressionHashIncorrectStartSyntaxType:m.TupleExpressionHashIncorrectStartSyntaxType,this.state.curPosition());this.state.pos+=2,123===t?this.finishToken(7):this.finishToken(1)}else G(t)?(++this.state.pos,this.finishToken(139,this.readWord1(t))):92===t?(++this.state.pos,this.finishToken(139,this.readWord1())):this.finishOp(27,1)}readToken_dot(){let e=this.input.charCodeAt(this.state.pos+1);e>=48&&e<=57?this.readNumber(!0):46===e&&46===this.input.charCodeAt(this.state.pos+2)?(this.state.pos+=3,this.finishToken(21)):(++this.state.pos,this.finishToken(16))}readToken_slash(){61===this.input.charCodeAt(this.state.pos+1)?this.finishOp(31,2):this.finishOp(56,1)}readToken_interpreter(){if(0!==this.state.pos||this.length<2)return!1;let e=this.input.charCodeAt(this.state.pos+1);if(33!==e)return!1;let t=this.state.pos;for(this.state.pos+=1;!eu(e)&&++this.state.pos<this.length;)e=this.input.charCodeAt(this.state.pos);let s=this.input.slice(t+2,this.state.pos);return this.finishToken(28,s),!0}readToken_mult_modulo(e){let t=42===e?55:54,s=1,r=this.input.charCodeAt(this.state.pos+1);42===e&&42===r&&(s++,r=this.input.charCodeAt(this.state.pos+2),t=57),61!==r||this.state.inType||(s++,t=37===e?33:30),this.finishOp(t,s)}readToken_pipe_amp(e){let t=this.input.charCodeAt(this.state.pos+1);if(t===e)return void(61===this.input.charCodeAt(this.state.pos+2)?this.finishOp(30,3):this.finishOp(124===e?41:42,2));if(124===e){if(62===t)return void this.finishOp(39,2);if(this.hasPlugin("recordAndTuple")&&125===t){if("bar"!==this.getPluginOption("recordAndTuple","syntaxType"))throw this.raise(m.RecordExpressionBarIncorrectEndSyntaxType,this.state.curPosition());this.state.pos+=2,this.finishToken(9);return}if(this.hasPlugin("recordAndTuple")&&93===t){if("bar"!==this.getPluginOption("recordAndTuple","syntaxType"))throw this.raise(m.TupleExpressionBarIncorrectEndSyntaxType,this.state.curPosition());this.state.pos+=2,this.finishToken(4);return}}61===t?this.finishOp(30,2):this.finishOp(124===e?43:45,1)}readToken_caret(){let e=this.input.charCodeAt(this.state.pos+1);61!==e||this.state.inType?94===e&&this.hasPlugin(["pipelineOperator",{proposal:"hack",topicToken:"^^"}])?(this.finishOp(37,2),94===this.input.codePointAt(this.state.pos)&&this.unexpected()):this.finishOp(44,1):this.finishOp(32,2)}readToken_atSign(){64===this.input.charCodeAt(this.state.pos+1)&&this.hasPlugin(["pipelineOperator",{proposal:"hack",topicToken:"@@"}])?this.finishOp(38,2):this.finishOp(26,1)}readToken_plus_min(e){let t=this.input.charCodeAt(this.state.pos+1);t===e?this.finishOp(34,2):61===t?this.finishOp(30,2):this.finishOp(53,1)}readToken_lt(){let{pos:e}=this.state,t=this.input.charCodeAt(e+1);60===t?61===this.input.charCodeAt(e+2)?this.finishOp(30,3):this.finishOp(51,2):61===t?this.finishOp(49,2):this.finishOp(47,1)}readToken_gt(){let{pos:e}=this.state,t=this.input.charCodeAt(e+1);if(62===t){let t=62===this.input.charCodeAt(e+2)?3:2;return 61===this.input.charCodeAt(e+t)?void this.finishOp(30,t+1):void this.finishOp(52,t)}61===t?this.finishOp(49,2):this.finishOp(48,1)}readToken_eq_excl(e){let t=this.input.charCodeAt(this.state.pos+1);if(61===t)return void this.finishOp(46,61===this.input.charCodeAt(this.state.pos+2)?3:2);if(61===e&&62===t){this.state.pos+=2,this.finishToken(19);return}this.finishOp(61===e?29:35,1)}readToken_question(){let e=this.input.charCodeAt(this.state.pos+1),t=this.input.charCodeAt(this.state.pos+2);63===e?61===t?this.finishOp(30,3):this.finishOp(40,2):46!==e||t>=48&&t<=57?(++this.state.pos,this.finishToken(17)):(this.state.pos+=2,this.finishToken(18))}getTokenFromCode(e){switch(e){case 46:this.readToken_dot();return;case 40:++this.state.pos,this.finishToken(10);return;case 41:++this.state.pos,this.finishToken(11);return;case 59:++this.state.pos,this.finishToken(13);return;case 44:++this.state.pos,this.finishToken(12);return;case 91:if(this.hasPlugin("recordAndTuple")&&124===this.input.charCodeAt(this.state.pos+1)){if("bar"!==this.getPluginOption("recordAndTuple","syntaxType"))throw this.raise(m.TupleExpressionBarIncorrectStartSyntaxType,this.state.curPosition());this.state.pos+=2,this.finishToken(2)}else++this.state.pos,this.finishToken(0);return;case 93:++this.state.pos,this.finishToken(3);return;case 123:if(this.hasPlugin("recordAndTuple")&&124===this.input.charCodeAt(this.state.pos+1)){if("bar"!==this.getPluginOption("recordAndTuple","syntaxType"))throw this.raise(m.RecordExpressionBarIncorrectStartSyntaxType,this.state.curPosition());this.state.pos+=2,this.finishToken(6)}else++this.state.pos,this.finishToken(5);return;case 125:++this.state.pos,this.finishToken(8);return;case 58:this.hasPlugin("functionBind")&&58===this.input.charCodeAt(this.state.pos+1)?this.finishOp(15,2):(++this.state.pos,this.finishToken(14));return;case 63:this.readToken_question();return;case 96:this.readTemplateToken();return;case 48:{let e=this.input.charCodeAt(this.state.pos+1);if(120===e||88===e)return void this.readRadixNumber(16);if(111===e||79===e)return void this.readRadixNumber(8);if(98===e||66===e)return void this.readRadixNumber(2)}case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:this.readNumber(!1);return;case 34:case 39:this.readString(e);return;case 47:this.readToken_slash();return;case 37:case 42:this.readToken_mult_modulo(e);return;case 124:case 38:this.readToken_pipe_amp(e);return;case 94:this.readToken_caret();return;case 43:case 45:this.readToken_plus_min(e);return;case 60:this.readToken_lt();return;case 62:this.readToken_gt();return;case 61:case 33:this.readToken_eq_excl(e);return;case 126:this.finishOp(36,1);return;case 64:this.readToken_atSign();return;case 35:this.readToken_numberSign();return;case 92:this.readWord();return;default:if(G(e))return void this.readWord(e)}throw this.raise(m.InvalidOrUnexpectedToken,this.state.curPosition(),{unexpected:String.fromCodePoint(e)})}finishOp(e,t){let s=this.input.slice(this.state.pos,this.state.pos+t);this.state.pos+=t,this.finishToken(e,s)}readRegexp(){let e,t,s=this.state.startLoc,r=this.state.start+1,{pos:i}=this.state;for(;;++i){if(i>=this.length)throw this.raise(m.UnterminatedRegExp,a(s,1));let r=this.input.charCodeAt(i);if(eu(r))throw this.raise(m.UnterminatedRegExp,a(s,1));if(e)e=!1;else{if(91===r)t=!0;else if(93===r&&t)t=!1;else if(47===r&&!t)break;e=92===r}}let o=this.input.slice(r,i);++i;let n="",l=()=>a(s,i+2-r);for(;i<this.length;){let e=this.codePointAtPos(i),t=String.fromCharCode(e);if(e_.has(e))118===e?n.includes("u")&&this.raise(m.IncompatibleRegExpUVFlags,l()):117===e&&n.includes("v")&&this.raise(m.IncompatibleRegExpUVFlags,l()),n.includes(t)&&this.raise(m.DuplicateRegExpFlags,l());else if(K(e)||92===e)this.raise(m.MalformedRegExpFlags,l());else break;++i,n+=t}this.state.pos=i,this.finishToken(138,{pattern:o,flags:n})}readInt(e,t,s=!1,r=!0){let{n:i,pos:a}=eB(this.input,this.state.pos,this.state.lineStart,this.state.curLine,e,t,s,r,this.errorHandlers_readInt,!1);return this.state.pos=a,i}readRadixNumber(e){let t=this.state.pos,s=this.state.curPosition(),r=!1;this.state.pos+=2;let i=this.readInt(e);null==i&&this.raise(m.InvalidDigit,a(s,2),{radix:e});let o=this.input.charCodeAt(this.state.pos);if(110===o)++this.state.pos,r=!0;else if(109===o)throw this.raise(m.InvalidDecimal,s);if(G(this.codePointAtPos(this.state.pos)))throw this.raise(m.NumberIdentifier,this.state.curPosition());if(r){let e=this.input.slice(t,this.state.pos).replace(/[_n]/g,"");this.finishToken(136,e);return}this.finishToken(135,i)}readNumber(e){let t=this.state.pos,s=this.state.curPosition(),r=!1,i=!1,o=!1,n=!1;e||null!==this.readInt(10)||this.raise(m.InvalidNumber,this.state.curPosition());let l=this.state.pos-t>=2&&48===this.input.charCodeAt(t);if(l){let e=this.input.slice(t,this.state.pos);if(this.recordStrictModeErrors(m.StrictOctalLiteral,s),!this.state.strict){let t=e.indexOf("_");t>0&&this.raise(m.ZeroDigitNumericSeparator,a(s,t))}n=l&&!/[89]/.test(e)}let p=this.input.charCodeAt(this.state.pos);if(46!==p||n||(++this.state.pos,this.readInt(10),r=!0,p=this.input.charCodeAt(this.state.pos)),69!==p&&101!==p||n||((43===(p=this.input.charCodeAt(++this.state.pos))||45===p)&&++this.state.pos,null===this.readInt(10)&&this.raise(m.InvalidOrMissingExponent,s),r=!0,o=!0,p=this.input.charCodeAt(this.state.pos)),110===p&&((r||l)&&this.raise(m.InvalidBigIntLiteral,s),++this.state.pos,i=!0),109===p){this.expectPlugin("decimal",this.state.curPosition()),(o||l)&&this.raise(m.InvalidDecimal,s),++this.state.pos;var c=!0}if(G(this.codePointAtPos(this.state.pos)))throw this.raise(m.NumberIdentifier,this.state.curPosition());let h=this.input.slice(t,this.state.pos).replace(/[_mn]/g,"");if(i)return void this.finishToken(136,h);if(c)return void this.finishToken(137,h);let d=n?parseInt(h,8):parseFloat(h);this.finishToken(135,d)}readCodePoint(e){let{code:t,pos:s}=eU(this.input,this.state.pos,this.state.lineStart,this.state.curLine,e,this.errorHandlers_readCodePoint);return this.state.pos=s,t}readString(e){let{str:t,pos:s,curLine:r,lineStart:i}=eO(34===e?"double":"single",this.input,this.state.pos+1,this.state.lineStart,this.state.curLine,this.errorHandlers_readStringContents_string);this.state.pos=s+1,this.state.lineStart=i,this.state.curLine=r,this.finishToken(134,t)}readTemplateContinuation(){this.match(8)||this.unexpected(null,8),this.state.pos--,this.readTemplateToken()}readTemplateToken(){let e=this.input[this.state.pos],{str:t,firstInvalidLoc:s,pos:i,curLine:a,lineStart:o}=eO("template",this.input,this.state.pos+1,this.state.lineStart,this.state.curLine,this.errorHandlers_readStringContents_template);this.state.pos=i+1,this.state.lineStart=o,this.state.curLine=a,s&&(this.state.firstInvalidTemplateEscapePos=new r(s.curLine,s.pos-s.lineStart,this.sourceToOffsetPos(s.pos))),96===this.input.codePointAt(i)?this.finishToken(24,s?null:e+t+"`"):(this.state.pos++,this.finishToken(25,s?null:e+t+"${"))}recordStrictModeErrors(e,t){let s=t.index;this.state.strict&&!this.state.strictErrors.has(s)?this.raise(e,t):this.state.strictErrors.set(s,[e,t])}readWord1(e){this.state.containsEsc=!1;let t="",s=this.state.pos,r=this.state.pos;for(void 0!==e&&(this.state.pos+=e<=65535?1:2);this.state.pos<this.length;){let e=this.codePointAtPos(this.state.pos);if(K(e))this.state.pos+=e<=65535?1:2;else if(92===e){this.state.containsEsc=!0,t+=this.input.slice(r,this.state.pos);let e=this.state.curPosition(),i=this.state.pos===s?G:K;if(117!==this.input.charCodeAt(++this.state.pos)){this.raise(m.MissingUnicodeEscape,this.state.curPosition()),r=this.state.pos-1;continue}++this.state.pos;let a=this.readCodePoint(!0);null!==a&&(i(a)||this.raise(m.EscapedCharNotAnIdentifier,e),t+=String.fromCodePoint(a)),r=this.state.pos}else break}return t+this.input.slice(r,this.state.pos)}readWord(e){let t=this.readWord1(e),s=v.get(t);void 0!==s?this.finishToken(s,S[s]):this.finishToken(132,t)}checkKeywordEscapes(){let{type:e}=this.state;U(e)&&this.state.containsEsc&&this.raise(m.InvalidEscapedReservedWord,this.state.startLoc,{reservedWord:S[e]})}raise(e,t,s={}){let i=e(t instanceof r?t:t.loc.start,s);if(!(2048&this.optionFlags))throw i;return this.isLookahead||this.state.errors.push(i),i}raiseOverwrite(e,t,s={}){let i=t instanceof r?t:t.loc.start,a=i.index,o=this.state.errors;for(let t=o.length-1;t>=0;t--){let r=o[t];if(r.loc.index===a)return o[t]=e(i,s);if(r.loc.index<a)break}return this.raise(e,t,s)}updateContext(e){}unexpected(e,t){throw this.raise(m.UnexpectedToken,null!=e?e:this.state.startLoc,{expected:t?S[t]:null})}expectPlugin(e,t){if(this.hasPlugin(e))return!0;throw this.raise(m.MissingPlugin,null!=t?t:this.state.startLoc,{missingPlugin:[e]})}expectOnePlugin(e){if(!e.some(e=>this.hasPlugin(e)))throw this.raise(m.MissingOneOfPlugins,this.state.startLoc,{missingPlugin:e})}errorBuilder(e){return(t,s,r)=>{this.raise(e,ej(t,s,r))}}}class eV{constructor(){this.privateNames=new Set,this.loneAccessors=new Map,this.undefinedPrivateNames=new Map}}class e${constructor(e){this.parser=void 0,this.stack=[],this.undefinedPrivateNames=new Map,this.parser=e}current(){return this.stack[this.stack.length-1]}enter(){this.stack.push(new eV)}exit(){let e=this.stack.pop(),t=this.current();for(let[s,r]of Array.from(e.undefinedPrivateNames))t?t.undefinedPrivateNames.has(s)||t.undefinedPrivateNames.set(s,r):this.parser.raise(m.InvalidPrivateFieldResolution,r,{identifierName:s})}declarePrivateName(e,t,s){let{privateNames:r,loneAccessors:i,undefinedPrivateNames:a}=this.current(),o=r.has(e);if(3&t){let s=o&&i.get(e);if(s){let r=4&t;(o=(3&s)==(3&t)||(4&s)!==r)||i.delete(e)}else o||i.set(e,t)}o&&this.parser.raise(m.PrivateNameRedeclaration,s,{identifierName:e}),r.add(e),a.delete(e)}usePrivateName(e,t){let s;for(s of this.stack)if(s.privateNames.has(e))return;s?s.undefinedPrivateNames.set(e,t):this.parser.raise(m.InvalidPrivateFieldResolution,t,{identifierName:e})}}class eq{constructor(e=0){this.type=e}canBeArrowParameterDeclaration(){return 2===this.type||1===this.type}isCertainlyParameterDeclaration(){return 3===this.type}}class eW extends eq{constructor(e){super(e),this.declarationErrors=new Map}recordDeclarationError(e,t){let s=t.index;this.declarationErrors.set(s,[e,t])}clearDeclarationError(e){this.declarationErrors.delete(e)}iterateErrors(e){this.declarationErrors.forEach(e)}}class eG{constructor(e){this.parser=void 0,this.stack=[new eq],this.parser=e}enter(e){this.stack.push(e)}exit(){this.stack.pop()}recordParameterInitializerError(e,t){let s=t.loc.start,{stack:r}=this,i=r.length-1,a=r[i];for(;!a.isCertainlyParameterDeclaration();){if(!a.canBeArrowParameterDeclaration())return;a.recordDeclarationError(e,s),a=r[--i]}this.parser.raise(e,s)}recordArrowParameterBindingError(e,t){let{stack:s}=this,r=s[s.length-1],i=t.loc.start;if(r.isCertainlyParameterDeclaration())this.parser.raise(e,i);else{if(!r.canBeArrowParameterDeclaration())return;r.recordDeclarationError(e,i)}}recordAsyncArrowParametersError(e){let{stack:t}=this,s=t.length-1,r=t[s];for(;r.canBeArrowParameterDeclaration();)2===r.type&&r.recordDeclarationError(m.AwaitBindingIdentifier,e),r=t[--s]}validateAsPattern(){let{stack:e}=this,t=e[e.length-1];t.canBeArrowParameterDeclaration()&&t.iterateErrors(([t,s])=>{this.parser.raise(t,s);let r=e.length-2,i=e[r];for(;i.canBeArrowParameterDeclaration();)i.clearDeclarationError(s.index),i=e[--r]})}}class eK extends ez{addExtra(e,t,s,r=!0){if(!e)return;let{extra:i}=e;null==i&&(e.extra=i={}),r?i[t]=s:Object.defineProperty(i,t,{enumerable:r,value:s})}isContextual(e){return this.state.type===e&&!this.state.containsEsc}isUnparsedContextual(e,t){if(this.input.startsWith(t,e)){let s=this.input.charCodeAt(e+t.length);return!(K(s)||(64512&s)==55296)}return!1}isLookaheadContextual(e){let t=this.nextTokenStart();return this.isUnparsedContextual(t,e)}eatContextual(e){return!!this.isContextual(e)&&(this.next(),!0)}expectContextual(e,t){if(!this.eatContextual(e)){if(null!=t)throw this.raise(t,this.state.startLoc);this.unexpected(null,e)}}canInsertSemicolon(){return this.match(140)||this.match(8)||this.hasPrecedingLineBreak()}hasPrecedingLineBreak(){return em(this.input,this.offsetToSourcePos(this.state.lastTokEndLoc.index),this.state.start)}hasFollowingLineBreak(){return em(this.input,this.state.end,this.nextTokenStart())}isLineTerminator(){return this.eat(13)||this.canInsertSemicolon()}semicolon(e=!0){(e?this.isLineTerminator():this.eat(13))||this.raise(m.MissingSemicolon,this.state.lastTokEndLoc)}expect(e,t){this.eat(e)||this.unexpected(t,e)}tryParse(e,t=this.state.clone()){let s={node:null};try{let r=e((e=null)=>{throw s.node=e,s});if(this.state.errors.length>t.errors.length){let e=this.state;return this.state=t,this.state.tokensLength=e.tokensLength,{node:r,error:e.errors[t.errors.length],thrown:!1,aborted:!1,failState:e}}return{node:r,error:null,thrown:!1,aborted:!1,failState:null}}catch(r){let e=this.state;if(this.state=t,r instanceof SyntaxError)return{node:null,error:r,thrown:!0,aborted:!1,failState:e};if(r===s)return{node:s.node,error:null,thrown:!1,aborted:!0,failState:e};throw r}}checkExpressionErrors(e,t){if(!e)return!1;let{shorthandAssignLoc:s,doubleProtoLoc:r,privateKeyLoc:i,optionalParametersLoc:a,voidPatternLoc:o}=e,n=!!s||!!r||!!a||!!i||!!o;if(!t)return n;null!=s&&this.raise(m.InvalidCoverInitializedName,s),null!=r&&this.raise(m.DuplicateProto,r),null!=i&&this.raise(m.UnexpectedPrivateField,i),null!=a&&this.unexpected(a),null!=o&&this.raise(m.InvalidCoverDiscardElement,o)}isLiteralPropertyName(){return F(this.state.type)}isPrivateName(e){return"PrivateName"===e.type}getPrivateNameSV(e){return e.id.name}hasPropertyAsPrivateName(e){return("MemberExpression"===e.type||"OptionalMemberExpression"===e.type)&&this.isPrivateName(e.property)}isObjectProperty(e){return"ObjectProperty"===e.type}isObjectMethod(e){return"ObjectMethod"===e.type}initializeScopes(e="module"===this.options.sourceType){let t=this.state.labels;this.state.labels=[];let s=this.exportedIdentifiers;this.exportedIdentifiers=new Set;let r=this.inModule;this.inModule=e;let i=this.scope,a=this.getScopeHandler();this.scope=new a(this,e);let o=this.prodParam;this.prodParam=new eT;let n=this.classScope;this.classScope=new e$(this);let l=this.expressionScope;return this.expressionScope=new eG(this),()=>{this.state.labels=t,this.exportedIdentifiers=s,this.inModule=r,this.scope=i,this.prodParam=o,this.classScope=n,this.expressionScope=l}}enterInitialScopes(){let e=0;(this.inModule||1&this.optionFlags)&&(e|=2),32&this.optionFlags&&(e|=1);let t=!this.inModule&&"commonjs"===this.options.sourceType;(t||2&this.optionFlags)&&(e|=4),this.prodParam.enter(e);let s=t?514:1;4&this.optionFlags&&(s|=512),this.scope.enter(s)}checkDestructuringPrivate(e){let{privateKeyLoc:t}=e;null!==t&&this.expectPlugin("destructuringPrivate",t)}}class eJ{constructor(){this.shorthandAssignLoc=null,this.doubleProtoLoc=null,this.privateKeyLoc=null,this.optionalParametersLoc=null,this.voidPatternLoc=null}}class eX{constructor(e,t,s){this.type="",this.start=t,this.end=0,this.loc=new i(s),(null==e?void 0:e.optionFlags)&128&&(this.range=[t,0]),null!=e&&e.filename&&(this.loc.filename=e.filename)}}let eY=eX.prototype;eY.__clone=function(){let e=new eX(void 0,this.start,this.loc.start),t=Object.keys(this);for(let s=0,r=t.length;s<r;s++){let r=t[s];"leadingComments"!==r&&"trailingComments"!==r&&"innerComments"!==r&&(e[r]=this[r])}return e};class eZ extends eK{startNode(){let e=this.state.startLoc;return new eX(this,e.index,e)}startNodeAt(e){return new eX(this,e.index,e)}startNodeAtNode(e){return this.startNodeAt(e.loc.start)}finishNode(e,t){return this.finishNodeAt(e,t,this.state.lastTokEndLoc)}finishNodeAt(e,t,s){return e.type=t,e.end=s.index,e.loc.end=s,128&this.optionFlags&&(e.range[1]=s.index),4096&this.optionFlags&&this.processComment(e),e}resetStartLocation(e,t){e.start=t.index,e.loc.start=t,128&this.optionFlags&&(e.range[0]=t.index)}resetEndLocation(e,t=this.state.lastTokEndLoc){e.end=t.index,e.loc.end=t,128&this.optionFlags&&(e.range[1]=t.index)}resetStartLocationFromNode(e,t){this.resetStartLocation(e,t.loc.start)}castNodeTo(e,t){return e.type=t,e}cloneIdentifier(e){let{type:t,start:s,end:r,loc:i,range:a,name:o}=e,n=Object.create(eY);return n.type=t,n.start=s,n.end=r,n.loc=i,n.range=a,n.name=o,e.extra&&(n.extra=e.extra),n}cloneStringLiteral(e){let{type:t,start:s,end:r,loc:i,range:a,extra:o}=e,n=Object.create(eY);return n.type=t,n.start=s,n.end=r,n.loc=i,n.range=a,n.extra=o,n.value=e.value,n}}let eQ=e=>"ParenthesizedExpression"===e.type?eQ(e.expression):e;class e0 extends eZ{toAssignable(e,t=!1){var s,r,i;let a;switch(("ParenthesizedExpression"===e.type||null!=(s=e.extra)&&s.parenthesized)&&(a=eQ(e),t?"Identifier"===a.type?this.expressionScope.recordArrowParameterBindingError(m.InvalidParenthesizedAssignment,e):"CallExpression"!==a.type&&"MemberExpression"!==a.type&&!this.isOptionalMemberExpression(a)&&this.raise(m.InvalidParenthesizedAssignment,e):this.raise(m.InvalidParenthesizedAssignment,e)),e.type){case"Identifier":case"ObjectPattern":case"ArrayPattern":case"AssignmentPattern":case"RestElement":case"VoidPattern":break;case"ObjectExpression":this.castNodeTo(e,"ObjectPattern");for(let s=0,r=e.properties.length,a=r-1;s<r;s++){let r=e.properties[s],o=s===a;this.toAssignableObjectExpressionProp(r,o,t),o&&"RestElement"===r.type&&null!=(i=e.extra)&&i.trailingCommaLoc&&this.raise(m.RestTrailingComma,e.extra.trailingCommaLoc)}break;case"ObjectProperty":{let{key:s,value:r}=e;this.isPrivateName(s)&&this.classScope.usePrivateName(this.getPrivateNameSV(s),s.loc.start),this.toAssignable(r,t);break}case"SpreadElement":throw Error("Internal @babel/parser error (this is a bug, please report it). SpreadElement should be converted by .toAssignable's caller.");case"ArrayExpression":this.castNodeTo(e,"ArrayPattern"),this.toAssignableList(e.elements,null==(r=e.extra)?void 0:r.trailingCommaLoc,t);break;case"AssignmentExpression":"="!==e.operator&&this.raise(m.MissingEqInAssignment,e.left.loc.end),this.castNodeTo(e,"AssignmentPattern"),delete e.operator,"VoidPattern"===e.left.type&&this.raise(m.VoidPatternInitializer,e.left),this.toAssignable(e.left,t);break;case"ParenthesizedExpression":this.toAssignable(a,t)}}toAssignableObjectExpressionProp(e,t,s){if("ObjectMethod"===e.type)this.raise("get"===e.kind||"set"===e.kind?m.PatternHasAccessor:m.PatternHasMethod,e.key);else if("SpreadElement"===e.type){this.castNodeTo(e,"RestElement");let r=e.argument;this.checkToRestConversion(r,!1),this.toAssignable(r,s),t||this.raise(m.RestTrailingComma,e)}else this.toAssignable(e,s)}toAssignableList(e,t,s){let r=e.length-1;for(let i=0;i<=r;i++){let a=e[i];a&&(this.toAssignableListItem(e,i,s),"RestElement"===a.type&&(i<r?this.raise(m.RestTrailingComma,a):t&&this.raise(m.RestTrailingComma,t)))}}toAssignableListItem(e,t,s){let r=e[t];if("SpreadElement"===r.type){this.castNodeTo(r,"RestElement");let e=r.argument;this.checkToRestConversion(e,!0),this.toAssignable(e,s)}else this.toAssignable(r,s)}isAssignable(e,t){switch(e.type){case"Identifier":case"ObjectPattern":case"ArrayPattern":case"AssignmentPattern":case"RestElement":case"VoidPattern":return!0;case"ObjectExpression":{let t=e.properties.length-1;return e.properties.every((e,s)=>"ObjectMethod"!==e.type&&(s===t||"SpreadElement"!==e.type)&&this.isAssignable(e))}case"ObjectProperty":return this.isAssignable(e.value);case"SpreadElement":return this.isAssignable(e.argument);case"ArrayExpression":return e.elements.every(e=>null===e||this.isAssignable(e));case"AssignmentExpression":return"="===e.operator;case"ParenthesizedExpression":return this.isAssignable(e.expression);case"MemberExpression":case"OptionalMemberExpression":return!t;default:return!1}}toReferencedList(e,t){return e}toReferencedListDeep(e,t){for(let s of(this.toReferencedList(e,t),e))(null==s?void 0:s.type)==="ArrayExpression"&&this.toReferencedListDeep(s.elements)}parseSpread(e){let t=this.startNode();return this.next(),t.argument=this.parseMaybeAssignAllowIn(e,void 0),this.finishNode(t,"SpreadElement")}parseRestBinding(){let e=this.startNode();this.next();let t=this.parseBindingAtom();return"VoidPattern"===t.type&&this.raise(m.UnexpectedVoidPattern,t),e.argument=t,this.finishNode(e,"RestElement")}parseBindingAtom(){switch(this.state.type){case 0:{let e=this.startNode();return this.next(),e.elements=this.parseBindingList(3,93,1),this.finishNode(e,"ArrayPattern")}case 5:return this.parseObjectLike(8,!0);case 88:return this.parseVoidPattern(null)}return this.parseIdentifier()}parseBindingList(e,t,s){let r=1&s,i=[],a=!0;for(;!this.eat(e);)if(a?a=!1:this.expect(12),r&&this.match(12))i.push(null);else if(this.eat(e))break;else if(this.match(21)){let r=this.parseRestBinding();if((this.hasPlugin("flow")||2&s)&&(r=this.parseFunctionParamType(r)),i.push(r),!this.checkCommaAfterRest(t)){this.expect(e);break}}else{let e=[];if(2&s)for(this.match(26)&&this.hasPlugin("decorators")&&this.raise(m.UnsupportedParameterDecorator,this.state.startLoc);this.match(26);)e.push(this.parseDecorator());i.push(this.parseBindingElement(s,e))}return i}parseBindingRestProperty(e){return this.next(),this.hasPlugin("discardBinding")&&this.match(88)?(e.argument=this.parseVoidPattern(null),this.raise(m.UnexpectedVoidPattern,e.argument)):e.argument=this.parseIdentifier(),this.checkCommaAfterRest(125),this.finishNode(e,"RestElement")}parseBindingProperty(){let{type:e,startLoc:t}=this.state;if(21===e)return this.parseBindingRestProperty(this.startNode());let s=this.startNode();return 139===e?(this.expectPlugin("destructuringPrivate",t),this.classScope.usePrivateName(this.state.value,t),s.key=this.parsePrivateName()):this.parsePropertyName(s),s.method=!1,this.parseObjPropValue(s,t,!1,!1,!0,!1)}parseBindingElement(e,t){let s=this.parseMaybeDefault();return(this.hasPlugin("flow")||2&e)&&this.parseFunctionParamType(s),t.length&&(s.decorators=t,this.resetStartLocationFromNode(s,t[0])),this.parseMaybeDefault(s.loc.start,s)}parseFunctionParamType(e){return e}parseMaybeDefault(e,t){if(null!=e||(e=this.state.startLoc),t=null!=t?t:this.parseBindingAtom(),!this.eat(29))return t;let s=this.startNodeAt(e);return"VoidPattern"===t.type&&this.raise(m.VoidPatternInitializer,t),s.left=t,s.right=this.parseMaybeAssignAllowIn(),this.finishNode(s,"AssignmentPattern")}isValidLVal(e,t,s,r){switch(e){case"AssignmentPattern":return"left";case"RestElement":return"argument";case"ObjectProperty":return"value";case"ParenthesizedExpression":return"expression";case"ArrayPattern":return"elements";case"ObjectPattern":return"properties";case"VoidPattern":return!0;case"CallExpression":if(!t&&!this.state.strict&&8192&this.optionFlags)return!0}return!1}isOptionalMemberExpression(e){return"OptionalMemberExpression"===e.type}checkLVal(e,t,s=64,r=!1,i=!1,a=!1,o=!1){var n;let l,p,c=e.type;if(this.isObjectMethod(e))return;let h=this.isOptionalMemberExpression(e);if(h||"MemberExpression"===c){h&&(this.expectPlugin("optionalChainingAssign",e.loc.start),"AssignmentExpression"!==t.type&&this.raise(m.InvalidLhsOptionalChaining,e,{ancestor:t})),64!==s&&this.raise(m.InvalidPropertyBindingPattern,e);return}if("Identifier"===c){this.checkIdentifier(e,s,i);let{name:t}=e;r&&(r.has(t)?this.raise(m.ParamDupe,e):r.add(t));return}"VoidPattern"===c&&"CatchClause"===t.type&&this.raise(m.VoidPatternCatchClauseParam,e);let d=eQ(e);o||(o="CallExpression"===d.type&&("Import"===d.callee.type||"Super"===d.callee.type));let u=this.isValidLVal(c,o,!(a||null!=(n=e.extra)&&n.parenthesized)&&"AssignmentExpression"===t.type,s);if(!0===u)return;if(!1===u){let r=64===s?m.InvalidLhs:m.InvalidLhsBinding;this.raise(r,e,{ancestor:t});return}"string"==typeof u?(l=u,p="ParenthesizedExpression"===c):[l,p]=u;let f="ArrayPattern"===c||"ObjectPattern"===c?{type:c}:t,y=e[l];if(Array.isArray(y))for(let e of y)e&&this.checkLVal(e,f,s,r,i,p,!0);else y&&this.checkLVal(y,f,s,r,i,p,o)}checkIdentifier(e,t,s=!1){var r;this.state.strict&&(s?ee(e.name,this.inModule):(r=e.name,Y.has(r)))&&(64===t?this.raise(m.StrictEvalArguments,e,{referenceName:e.name}):this.raise(m.StrictEvalArgumentsBinding,e,{bindingName:e.name})),8192&t&&"let"===e.name&&this.raise(m.LetInLexicalBinding,e),64&t||this.declareNameFromIdentifier(e,t)}declareNameFromIdentifier(e,t){this.scope.declareName(e.name,t,e.loc.start)}checkToRestConversion(e,t){switch(e.type){case"ParenthesizedExpression":this.checkToRestConversion(e.expression,t);break;case"Identifier":case"MemberExpression":break;case"ArrayExpression":case"ObjectExpression":if(t)break;default:this.raise(m.InvalidRestAssignmentPattern,e)}}checkCommaAfterRest(e){return!!this.match(12)&&(this.raise(this.lookaheadCharCode()===e?m.RestTrailingComma:m.ElementAfterRest,this.state.startLoc),!0)}}let e1=/in(?:stanceof)?|as|satisfies/y;function e2(e){if(!e)throw Error("Assert fail")}let e4=u`typescript`({AbstractMethodHasImplementation:({methodName:e})=>`Method '${e}' cannot have an implementation because it is marked abstract.`,AbstractPropertyHasInitializer:({propertyName:e})=>`Property '${e}' cannot have an initializer because it is marked abstract.`,AccessorCannotBeOptional:"An 'accessor' property cannot be declared optional.",AccessorCannotDeclareThisParameter:"'get' and 'set' accessors cannot declare 'this' parameters.",AccessorCannotHaveTypeParameters:"An accessor cannot have type parameters.",ClassMethodHasDeclare:"Class methods cannot have the 'declare' modifier.",ClassMethodHasReadonly:"Class methods cannot have the 'readonly' modifier.",ConstInitializerMustBeStringOrNumericLiteralOrLiteralEnumReference:"A 'const' initializer in an ambient context must be a string or numeric literal or literal enum reference.",ConstructorHasTypeParameters:"Type parameters cannot appear on a constructor declaration.",DeclareAccessor:({kind:e})=>`'declare' is not allowed in ${e}ters.`,DeclareClassFieldHasInitializer:"Initializers are not allowed in ambient contexts.",DeclareFunctionHasImplementation:"An implementation cannot be declared in ambient contexts.",DuplicateAccessibilityModifier:({modifier:e})=>`Accessibility modifier already seen: '${e}'.`,DuplicateModifier:({modifier:e})=>`Duplicate modifier: '${e}'.`,EmptyHeritageClauseType:({token:e})=>`'${e}' list cannot be empty.`,EmptyTypeArguments:"Type argument list cannot be empty.",EmptyTypeParameters:"Type parameter list cannot be empty.",ExpectedAmbientAfterExportDeclare:"'export declare' must be followed by an ambient declaration.",ImportAliasHasImportType:"An import alias can not use 'import type'.",ImportReflectionHasImportType:"An `import module` declaration can not use `type` modifier",IncompatibleModifiers:({modifiers:e})=>`'${e[0]}' modifier cannot be used with '${e[1]}' modifier.`,IndexSignatureHasAbstract:"Index signatures cannot have the 'abstract' modifier.",IndexSignatureHasAccessibility:({modifier:e})=>`Index signatures cannot have an accessibility modifier ('${e}').`,IndexSignatureHasDeclare:"Index signatures cannot have the 'declare' modifier.",IndexSignatureHasOverride:"'override' modifier cannot appear on an index signature.",IndexSignatureHasStatic:"Index signatures cannot have the 'static' modifier.",InitializerNotAllowedInAmbientContext:"Initializers are not allowed in ambient contexts.",InvalidHeritageClauseType:({token:e})=>`'${e}' list can only include identifiers or qualified-names with optional type arguments.`,InvalidModifierOnAwaitUsingDeclaration:e=>`'${e}' modifier cannot appear on an await using declaration.`,InvalidModifierOnTypeMember:({modifier:e})=>`'${e}' modifier cannot appear on a type member.`,InvalidModifierOnTypeParameter:({modifier:e})=>`'${e}' modifier cannot appear on a type parameter.`,InvalidModifierOnTypeParameterPositions:({modifier:e})=>`'${e}' modifier can only appear on a type parameter of a class, interface or type alias.`,InvalidModifierOnUsingDeclaration:e=>`'${e}' modifier cannot appear on a using declaration.`,InvalidModifiersOrder:({orderedModifiers:e})=>`'${e[0]}' modifier must precede '${e[1]}' modifier.`,InvalidPropertyAccessAfterInstantiationExpression:"Invalid property access after an instantiation expression. You can either wrap the instantiation expression in parentheses, or delete the type arguments.",InvalidTupleMemberLabel:"Tuple members must be labeled with a simple identifier.",MissingInterfaceName:"'interface' declarations must be followed by an identifier.",NonAbstractClassHasAbstractMethod:"Abstract methods can only appear within an abstract class.",NonClassMethodPropertyHasAbstractModifier:"'abstract' modifier can only appear on a class, method, or property declaration.",OptionalTypeBeforeRequired:"A required element cannot follow an optional element.",OverrideNotInSubClass:"This member cannot have an 'override' modifier because its containing class does not extend another class.",PatternIsOptional:"A binding pattern parameter cannot be optional in an implementation signature.",PrivateElementHasAbstract:"Private elements cannot have the 'abstract' modifier.",PrivateElementHasAccessibility:({modifier:e})=>`Private elements cannot have an accessibility modifier ('${e}').`,ReadonlyForMethodSignature:"'readonly' modifier can only appear on a property declaration or index signature.",ReservedArrowTypeParam:"This syntax is reserved in files with the .mts or .cts extension. Add a trailing comma, as in `<T,>() => ...`.",ReservedTypeAssertion:"This syntax is reserved in files with the .mts or .cts extension. Use an `as` expression instead.",SetAccessorCannotHaveOptionalParameter:"A 'set' accessor cannot have an optional parameter.",SetAccessorCannotHaveRestParameter:"A 'set' accessor cannot have rest parameter.",SetAccessorCannotHaveReturnType:"A 'set' accessor cannot have a return type annotation.",SingleTypeParameterWithoutTrailingComma:({typeParameterName:e})=>`Single type parameter ${e} should have a trailing comma. Example usage: <${e},>.`,StaticBlockCannotHaveModifier:"Static class blocks cannot have any modifier.",TupleOptionalAfterType:"A labeled tuple optional element must be declared using a question mark after the name and before the colon (`name?: type`), rather than after the type (`name: type?`).",TypeAnnotationAfterAssign:"Type annotations must come before default assignments, e.g. instead of `age = 25: number` use `age: number = 25`.",TypeImportCannotSpecifyDefaultAndNamed:"A type-only import can specify a default import or named bindings, but not both.",TypeModifierIsUsedInTypeExports:"The 'type' modifier cannot be used on a named export when 'export type' is used on its export statement.",TypeModifierIsUsedInTypeImports:"The 'type' modifier cannot be used on a named import when 'import type' is used on its import statement.",UnexpectedParameterModifier:"A parameter property is only allowed in a constructor implementation.",UnexpectedReadonly:"'readonly' type modifier is only permitted on array and tuple literal types.",UnexpectedTypeAnnotation:"Did not expect a type annotation here.",UnexpectedTypeCastInParameter:"Unexpected type cast in parameter position.",UnsupportedImportTypeArgument:"Argument in a type import must be a string literal.",UnsupportedParameterPropertyKind:"A parameter property may not be declared using a binding pattern.",UnsupportedSignatureParameterKind:({type:e})=>`Name in a signature must be an Identifier, ObjectPattern or ArrayPattern, instead got ${e}.`,UsingDeclarationInAmbientContext:e=>`'${e}' declarations are not allowed in ambient contexts.`});function e5(e){return"private"===e||"public"===e||"protected"===e}function e3(e,t){return t?"Literal"===e.type&&("number"==typeof e.value||"bigint"in e):"NumericLiteral"===e.type||"BigIntLiteral"===e.type}let e8=u`placeholders`({ClassNameIsRequired:"A class name is required.",UnexpectedSpace:"Unexpected space in placeholder."}),e9=["minimal","fsharp","hack","smart"],e6=["^^","@@","^","%","#"],e7={estree:e=>class extends e{parse(){let e=g(super.parse());return 256&this.optionFlags&&(e.tokens=e.tokens.map(g)),e}parseRegExpLiteral({pattern:e,flags:t}){let s=null;try{s=new RegExp(e,t)}catch(e){}let r=this.estreeParseLiteral(s);return r.regex={pattern:e,flags:t},r}parseBigIntLiteral(e){let t;try{t=BigInt(e)}catch(e){t=null}let s=this.estreeParseLiteral(t);return s.bigint=String(s.value||e),s}parseDecimalLiteral(e){let t=this.estreeParseLiteral(null);return t.decimal=String(t.value||e),t}estreeParseLiteral(e){return this.parseLiteral(e,"Literal")}parseStringLiteral(e){return this.estreeParseLiteral(e)}parseNumericLiteral(e){return this.estreeParseLiteral(e)}parseNullLiteral(){return this.estreeParseLiteral(null)}parseBooleanLiteral(e){return this.estreeParseLiteral(e)}estreeParseChainExpression(e,t){let s=this.startNodeAtNode(e);return s.expression=e,this.finishNodeAt(s,"ChainExpression",t)}directiveToStmt(e){let t=e.value;delete e.value,this.castNodeTo(t,"Literal"),t.raw=t.extra.raw,t.value=t.extra.expressionValue;let s=this.castNodeTo(e,"ExpressionStatement");return s.expression=t,s.directive=t.extra.rawValue,delete t.extra,s}fillOptionalPropertiesForTSESLint(e){}cloneEstreeStringLiteral(e){let{start:t,end:s,loc:r,range:i,raw:a,value:o}=e,n=Object.create(e.constructor.prototype);return n.type="Literal",n.start=t,n.end=s,n.loc=r,n.range=i,n.raw=a,n.value=o,n}initFunction(e,t){super.initFunction(e,t),e.expression=!1}checkDeclaration(e){null!=e&&this.isObjectProperty(e)?this.checkDeclaration(e.value):super.checkDeclaration(e)}getObjectOrClassMethodParams(e){return e.value.params}isValidDirective(e){var t;return"ExpressionStatement"===e.type&&"Literal"===e.expression.type&&"string"==typeof e.expression.value&&!(null!=(t=e.expression.extra)&&t.parenthesized)}parseBlockBody(e,t,s,r,i){super.parseBlockBody(e,t,s,r,i);let a=e.directives.map(e=>this.directiveToStmt(e));e.body=a.concat(e.body),delete e.directives}parsePrivateName(){let e=super.parsePrivateName();return this.getPluginOption("estree","classFeatures")?this.convertPrivateNameToPrivateIdentifier(e):e}convertPrivateNameToPrivateIdentifier(e){let t=super.getPrivateNameSV(e);return delete e.id,e.name=t,this.castNodeTo(e,"PrivateIdentifier")}isPrivateName(e){return this.getPluginOption("estree","classFeatures")?"PrivateIdentifier"===e.type:super.isPrivateName(e)}getPrivateNameSV(e){return this.getPluginOption("estree","classFeatures")?e.name:super.getPrivateNameSV(e)}parseLiteral(e,t){let s=super.parseLiteral(e,t);return s.raw=s.extra.raw,delete s.extra,s}parseFunctionBody(e,t,s=!1){super.parseFunctionBody(e,t,s),e.expression="BlockStatement"!==e.body.type}parseMethod(e,t,s,r,i,a,o=!1){let n=this.startNode();n.kind=e.kind,n=super.parseMethod(n,t,s,r,i,a,o),delete n.kind;let{typeParameters:l}=e;return(l&&(delete e.typeParameters,n.typeParameters=l,this.resetStartLocationFromNode(n,l)),e.value=this.castNodeTo(n,"FunctionExpression"),"ClassPrivateMethod"===a&&(e.computed=!1),"ObjectMethod"===a)?("method"===e.kind&&(e.kind="init"),e.shorthand=!1,this.finishNode(e,"Property")):this.finishNode(e,"MethodDefinition")}nameIsConstructor(e){return"Literal"===e.type?"constructor"===e.value:super.nameIsConstructor(e)}parseClassProperty(...e){let t=super.parseClassProperty(...e);return this.getPluginOption("estree","classFeatures")&&this.castNodeTo(t,"PropertyDefinition"),t}parseClassPrivateProperty(...e){let t=super.parseClassPrivateProperty(...e);return this.getPluginOption("estree","classFeatures")&&(this.castNodeTo(t,"PropertyDefinition"),t.computed=!1),t}parseClassAccessorProperty(e){let t=super.parseClassAccessorProperty(e);return this.getPluginOption("estree","classFeatures")&&(t.abstract&&this.hasPlugin("typescript")?(delete t.abstract,this.castNodeTo(t,"TSAbstractAccessorProperty")):this.castNodeTo(t,"AccessorProperty")),t}parseObjectProperty(e,t,s,r){let i=super.parseObjectProperty(e,t,s,r);return i&&(i.kind="init",this.castNodeTo(i,"Property")),i}finishObjectProperty(e){return e.kind="init",this.finishNode(e,"Property")}isValidLVal(e,t,s,r){return"Property"===e?"value":super.isValidLVal(e,t,s,r)}isAssignable(e,t){return null!=e&&this.isObjectProperty(e)?this.isAssignable(e.value,t):super.isAssignable(e,t)}toAssignable(e,t=!1){if(null!=e&&this.isObjectProperty(e)){let{key:s,value:r}=e;this.isPrivateName(s)&&this.classScope.usePrivateName(this.getPrivateNameSV(s),s.loc.start),this.toAssignable(r,t)}else super.toAssignable(e,t)}toAssignableObjectExpressionProp(e,t,s){"Property"===e.type&&("get"===e.kind||"set"===e.kind)?this.raise(m.PatternHasAccessor,e.key):"Property"===e.type&&e.method?this.raise(m.PatternHasMethod,e.key):super.toAssignableObjectExpressionProp(e,t,s)}finishCallExpression(e,t){let s=super.finishCallExpression(e,t);if("Import"===s.callee.type){var r,i;this.castNodeTo(s,"ImportExpression"),s.source=s.arguments[0],s.options=null!=(r=s.arguments[1])?r:null,s.attributes=null!=(i=s.arguments[1])?i:null,delete s.arguments,delete s.callee}else"OptionalCallExpression"===s.type?this.castNodeTo(s,"CallExpression"):s.optional=!1;return s}toReferencedArguments(e){"ImportExpression"!==e.type&&super.toReferencedArguments(e)}parseExport(e,t){let s=this.state.lastTokStartLoc,r=super.parseExport(e,t);switch(r.type){case"ExportAllDeclaration":r.exported=null;break;case"ExportNamedDeclaration":1===r.specifiers.length&&"ExportNamespaceSpecifier"===r.specifiers[0].type&&(this.castNodeTo(r,"ExportAllDeclaration"),r.exported=r.specifiers[0].exported,delete r.specifiers);case"ExportDefaultDeclaration":{var i;let{declaration:e}=r;(null==e?void 0:e.type)==="ClassDeclaration"&&(null==(i=e.decorators)?void 0:i.length)>0&&e.start===r.start&&this.resetStartLocation(r,s)}}return r}stopParseSubscript(e,t){let s=super.stopParseSubscript(e,t);return t.optionalChainMember?this.estreeParseChainExpression(s,e.loc.end):s}parseMember(e,t,s,r,i){let a=super.parseMember(e,t,s,r,i);return"OptionalMemberExpression"===a.type?this.castNodeTo(a,"MemberExpression"):a.optional=!1,a}isOptionalMemberExpression(e){return"ChainExpression"===e.type?"MemberExpression"===e.expression.type:super.isOptionalMemberExpression(e)}hasPropertyAsPrivateName(e){return"ChainExpression"===e.type&&(e=e.expression),super.hasPropertyAsPrivateName(e)}isObjectProperty(e){return"Property"===e.type&&"init"===e.kind&&!e.method}isObjectMethod(e){return"Property"===e.type&&(e.method||"get"===e.kind||"set"===e.kind)}castNodeTo(e,t){let s=super.castNodeTo(e,t);return this.fillOptionalPropertiesForTSESLint(s),s}cloneIdentifier(e){let t=super.cloneIdentifier(e);return this.fillOptionalPropertiesForTSESLint(t),t}cloneStringLiteral(e){return"Literal"===e.type?this.cloneEstreeStringLiteral(e):super.cloneStringLiteral(e)}finishNodeAt(e,t,s){return g(super.finishNodeAt(e,t,s))}finishNode(e,t){let s=super.finishNode(e,t);return this.fillOptionalPropertiesForTSESLint(s),s}resetStartLocation(e,t){super.resetStartLocation(e,t),g(e)}resetEndLocation(e,t=this.state.lastTokEndLoc){super.resetEndLocation(e,t),g(e)}},jsx:e=>class extends e{jsxReadToken(){let e="",t=this.state.pos;for(;;){if(this.state.pos>=this.length)throw this.raise(eg.UnterminatedJsxContent,this.state.startLoc);let s=this.input.charCodeAt(this.state.pos);switch(s){case 60:case 123:if(this.state.pos===this.state.start)return void(60===s&&this.state.canStartJSXElement?(++this.state.pos,this.finishToken(143)):super.getTokenFromCode(s));e+=this.input.slice(t,this.state.pos),this.finishToken(142,e);return;case 38:e+=this.input.slice(t,this.state.pos),e+=this.jsxReadEntity(),t=this.state.pos;break;default:eu(s)?(e+=this.input.slice(t,this.state.pos),e+=this.jsxReadNewLine(!0),t=this.state.pos):++this.state.pos}}}jsxReadNewLine(e){let t,s=this.input.charCodeAt(this.state.pos);return++this.state.pos,13===s&&10===this.input.charCodeAt(this.state.pos)?(++this.state.pos,t=e?"\n":"\r\n"):t=String.fromCharCode(s),++this.state.curLine,this.state.lineStart=this.state.pos,t}jsxReadString(e){let t="",s=++this.state.pos;for(;;){if(this.state.pos>=this.length)throw this.raise(m.UnterminatedString,this.state.startLoc);let r=this.input.charCodeAt(this.state.pos);if(r===e)break;38===r?(t+=this.input.slice(s,this.state.pos),t+=this.jsxReadEntity(),s=this.state.pos):eu(r)?(t+=this.input.slice(s,this.state.pos),t+=this.jsxReadNewLine(!1),s=this.state.pos):++this.state.pos}t+=this.input.slice(s,this.state.pos++),this.finishToken(134,t)}jsxReadEntity(){let e=++this.state.pos;if(35===this.codePointAtPos(this.state.pos)){++this.state.pos;let e=10;120===this.codePointAtPos(this.state.pos)&&(e=16,++this.state.pos);let t=this.readInt(e,void 0,!1,"bail");if(null!==t&&59===this.codePointAtPos(this.state.pos))return++this.state.pos,String.fromCodePoint(t)}else{let t=0,s=!1;for(;t++<10&&this.state.pos<this.length&&!(s=59===this.codePointAtPos(this.state.pos));)++this.state.pos;if(s){let t=eh[this.input.slice(e,this.state.pos)];if(++this.state.pos,t)return t}}return this.state.pos=e,"&"}jsxReadWord(){let e,t=this.state.pos;do e=this.input.charCodeAt(++this.state.pos);while(K(e)||45===e)this.finishToken(141,this.input.slice(t,this.state.pos))}jsxParseIdentifier(){let e=this.startNode();return this.match(141)?e.name=this.state.value:U(this.state.type)?e.name=S[this.state.type]:this.unexpected(),this.next(),this.finishNode(e,"JSXIdentifier")}jsxParseNamespacedName(){let e=this.state.startLoc,t=this.jsxParseIdentifier();if(!this.eat(14))return t;let s=this.startNodeAt(e);return s.namespace=t,s.name=this.jsxParseIdentifier(),this.finishNode(s,"JSXNamespacedName")}jsxParseElementName(){let e=this.state.startLoc,t=this.jsxParseNamespacedName();if("JSXNamespacedName"===t.type)return t;for(;this.eat(16);){let s=this.startNodeAt(e);s.object=t,s.property=this.jsxParseIdentifier(),t=this.finishNode(s,"JSXMemberExpression")}return t}jsxParseAttributeValue(){let e;switch(this.state.type){case 5:return e=this.startNode(),this.setContext(b.brace),this.next(),"JSXEmptyExpression"===(e=this.jsxParseExpressionContainer(e,b.j_oTag)).expression.type&&this.raise(eg.AttributeIsEmpty,e),e;case 143:case 134:return this.parseExprAtom();default:throw this.raise(eg.UnsupportedJsxValue,this.state.startLoc)}}jsxParseEmptyExpression(){let e=this.startNodeAt(this.state.lastTokEndLoc);return this.finishNodeAt(e,"JSXEmptyExpression",this.state.startLoc)}jsxParseSpreadChild(e){return this.next(),e.expression=this.parseExpression(),this.setContext(b.j_expr),this.state.canStartJSXElement=!0,this.expect(8),this.finishNode(e,"JSXSpreadChild")}jsxParseExpressionContainer(e,t){return this.match(8)?e.expression=this.jsxParseEmptyExpression():e.expression=this.parseExpression(),this.setContext(t),this.state.canStartJSXElement=!0,this.expect(8),this.finishNode(e,"JSXExpressionContainer")}jsxParseAttribute(){let e=this.startNode();return this.match(5)?(this.setContext(b.brace),this.next(),this.expect(21),e.argument=this.parseMaybeAssignAllowIn(),this.setContext(b.j_oTag),this.state.canStartJSXElement=!0,this.expect(8),this.finishNode(e,"JSXSpreadAttribute")):(e.name=this.jsxParseNamespacedName(),e.value=this.eat(29)?this.jsxParseAttributeValue():null,this.finishNode(e,"JSXAttribute"))}jsxParseOpeningElementAt(e){let t=this.startNodeAt(e);return this.eat(144)?this.finishNode(t,"JSXOpeningFragment"):(t.name=this.jsxParseElementName(),this.jsxParseOpeningElementAfterName(t))}jsxParseOpeningElementAfterName(e){let t=[];for(;!this.match(56)&&!this.match(144);)t.push(this.jsxParseAttribute());return e.attributes=t,e.selfClosing=this.eat(56),this.expect(144),this.finishNode(e,"JSXOpeningElement")}jsxParseClosingElementAt(e){let t=this.startNodeAt(e);return this.eat(144)?this.finishNode(t,"JSXClosingFragment"):(t.name=this.jsxParseElementName(),this.expect(144),this.finishNode(t,"JSXClosingElement"))}jsxParseElementAt(e){let t=this.startNodeAt(e),s=[],r=this.jsxParseOpeningElementAt(e),i=null;if(!r.selfClosing){t:for(;;)switch(this.state.type){case 143:if(e=this.state.startLoc,this.next(),this.eat(56)){i=this.jsxParseClosingElementAt(e);break t}s.push(this.jsxParseElementAt(e));break;case 142:s.push(this.parseLiteral(this.state.value,"JSXText"));break;case 5:{let e=this.startNode();this.setContext(b.brace),this.next(),this.match(21)?s.push(this.jsxParseSpreadChild(e)):s.push(this.jsxParseExpressionContainer(e,b.j_expr));break}default:this.unexpected()}ex(r)&&!ex(i)&&null!==i?this.raise(eg.MissingClosingTagFragment,i):!ex(r)&&ex(i)?this.raise(eg.MissingClosingTagElement,i,{openingTagName:eb(r.name)}):ex(r)||ex(i)||eb(i.name)===eb(r.name)||this.raise(eg.MissingClosingTagElement,i,{openingTagName:eb(r.name)})}if(ex(r)?(t.openingFragment=r,t.closingFragment=i):(t.openingElement=r,t.closingElement=i),t.children=s,this.match(47))throw this.raise(eg.UnwrappedAdjacentJSXElements,this.state.startLoc);return ex(r)?this.finishNode(t,"JSXFragment"):this.finishNode(t,"JSXElement")}jsxParseElement(){let e=this.state.startLoc;return this.next(),this.jsxParseElementAt(e)}setContext(e){let{context:t}=this.state;t[t.length-1]=e}parseExprAtom(e){return this.match(143)?this.jsxParseElement():this.match(47)&&33!==this.input.charCodeAt(this.state.pos)?(this.replaceToken(143),this.jsxParseElement()):super.parseExprAtom(e)}skipSpace(){this.curContext().preserveSpace||super.skipSpace()}getTokenFromCode(e){let t=this.curContext();if(t===b.j_expr)return void this.jsxReadToken();if(t===b.j_oTag||t===b.j_cTag){if(G(e))return void this.jsxReadWord();if(62===e){++this.state.pos,this.finishToken(144);return}if((34===e||39===e)&&t===b.j_oTag)return void this.jsxReadString(e)}if(60===e&&this.state.canStartJSXElement&&33!==this.input.charCodeAt(this.state.pos+1)){++this.state.pos,this.finishToken(143);return}super.getTokenFromCode(e)}updateContext(e){let{context:t,type:s}=this.state;if(56===s&&143===e)t.splice(-2,2,b.j_cTag),this.state.canStartJSXElement=!1;else if(143===s)t.push(b.j_oTag);else if(144===s){let s=t[t.length-1];s===b.j_oTag&&56===e||s===b.j_cTag?(t.pop(),this.state.canStartJSXElement=t[t.length-1]===b.j_expr):(this.setContext(b.j_expr),this.state.canStartJSXElement=!0)}else this.state.canStartJSXElement=E[s]}},flow:e=>class extends e{constructor(...e){super(...e),this.flowPragma=void 0}getScopeHandler(){return ea}shouldParseTypes(){return this.getPluginOption("flow","all")||"flow"===this.flowPragma}finishToken(e,t){134!==e&&13!==e&&28!==e&&void 0===this.flowPragma&&(this.flowPragma=null),super.finishToken(e,t)}addComment(e){if(void 0===this.flowPragma){let t=ec.exec(e.value);if(t)if("flow"===t[1])this.flowPragma="flow";else if("noflow"===t[1])this.flowPragma="noflow";else throw Error("Unexpected flow pragma")}super.addComment(e)}flowParseTypeInitialiser(e){let t=this.state.inType;this.state.inType=!0,this.expect(e||14);let s=this.flowParseType();return this.state.inType=t,s}flowParsePredicate(){let e=this.startNode(),t=this.state.startLoc;return(this.next(),this.expectContextual(110),this.state.lastTokStartLoc.index>t.index+1&&this.raise(en.UnexpectedSpaceBetweenModuloChecks,t),this.eat(10))?(e.value=super.parseExpression(),this.expect(11),this.finishNode(e,"DeclaredPredicate")):this.finishNode(e,"InferredPredicate")}flowParseTypeAndPredicateInitialiser(){let e=this.state.inType;this.state.inType=!0,this.expect(14);let t=null,s=null;return this.match(54)?(this.state.inType=e,s=this.flowParsePredicate()):(t=this.flowParseType(),this.state.inType=e,this.match(54)&&(s=this.flowParsePredicate())),[t,s]}flowParseDeclareClass(e){return this.next(),this.flowParseInterfaceish(e,!0),this.finishNode(e,"DeclareClass")}flowParseDeclareFunction(e){this.next();let t=e.id=this.parseIdentifier(),s=this.startNode(),r=this.startNode();this.match(47)?s.typeParameters=this.flowParseTypeParameterDeclaration():s.typeParameters=null,this.expect(10);let i=this.flowParseFunctionTypeParams();return s.params=i.params,s.rest=i.rest,s.this=i._this,this.expect(11),[s.returnType,e.predicate]=this.flowParseTypeAndPredicateInitialiser(),r.typeAnnotation=this.finishNode(s,"FunctionTypeAnnotation"),t.typeAnnotation=this.finishNode(r,"TypeAnnotation"),this.resetEndLocation(t),this.semicolon(),this.scope.declareName(e.id.name,2048,e.id.loc.start),this.finishNode(e,"DeclareFunction")}flowParseDeclare(e,t){if(this.match(80))return this.flowParseDeclareClass(e);if(this.match(68))return this.flowParseDeclareFunction(e);if(this.match(74))return this.flowParseDeclareVariable(e);if(this.eatContextual(127))if(this.match(16))return this.flowParseDeclareModuleExports(e);else return t&&this.raise(en.NestedDeclareModule,this.state.lastTokStartLoc),this.flowParseDeclareModule(e);if(this.isContextual(130))return this.flowParseDeclareTypeAlias(e);else if(this.isContextual(131))return this.flowParseDeclareOpaqueType(e);else if(this.isContextual(129))return this.flowParseDeclareInterface(e);else if(this.match(82))return this.flowParseDeclareExportDeclaration(e,t);throw this.unexpected()}flowParseDeclareVariable(e){return this.next(),e.id=this.flowParseTypeAnnotatableIdentifier(),this.scope.declareName(e.id.name,5,e.id.loc.start),this.semicolon(),this.finishNode(e,"DeclareVariable")}flowParseDeclareModule(e){this.scope.enter(0),this.match(134)?e.id=super.parseExprAtom():e.id=this.parseIdentifier();let t=e.body=this.startNode(),s=t.body=[];for(this.expect(5);!this.match(8);){let e=this.startNode();this.match(83)?(this.next(),this.isContextual(130)||this.match(87)||this.raise(en.InvalidNonTypeImportInDeclareModule,this.state.lastTokStartLoc),s.push(super.parseImport(e))):(this.expectContextual(125,en.UnsupportedStatementInDeclareModule),s.push(this.flowParseDeclare(e,!0)))}this.scope.exit(),this.expect(8),this.finishNode(t,"BlockStatement");let r=null,i=!1;return s.forEach(e=>{"DeclareExportAllDeclaration"!==e.type&&("DeclareExportDeclaration"!==e.type||e.declaration&&("TypeAlias"===e.declaration.type||"InterfaceDeclaration"===e.declaration.type))?"DeclareModuleExports"===e.type&&(i&&this.raise(en.DuplicateDeclareModuleExports,e),"ES"===r&&this.raise(en.AmbiguousDeclareModuleKind,e),r="CommonJS",i=!0):("CommonJS"===r&&this.raise(en.AmbiguousDeclareModuleKind,e),r="ES")}),e.kind=r||"CommonJS",this.finishNode(e,"DeclareModule")}flowParseDeclareExportDeclaration(e,t){if(this.expect(82),this.eat(65))return this.match(68)||this.match(80)?e.declaration=this.flowParseDeclare(this.startNode()):(e.declaration=this.flowParseType(),this.semicolon()),e.default=!0,this.finishNode(e,"DeclareExportDeclaration");if(this.match(75)||this.isLet()||(this.isContextual(130)||this.isContextual(129))&&!t){let e=this.state.value;throw this.raise(en.UnsupportedDeclareExportKind,this.state.startLoc,{unsupportedExportKind:e,suggestion:ep[e]})}if(this.match(74)||this.match(68)||this.match(80)||this.isContextual(131))return e.declaration=this.flowParseDeclare(this.startNode()),e.default=!1,this.finishNode(e,"DeclareExportDeclaration");if(this.match(55)||this.match(5)||this.isContextual(129)||this.isContextual(130)||this.isContextual(131))return"ExportNamedDeclaration"===(e=this.parseExport(e,null)).type?(e.default=!1,delete e.exportKind,this.castNodeTo(e,"DeclareExportDeclaration")):this.castNodeTo(e,"DeclareExportAllDeclaration");throw this.unexpected()}flowParseDeclareModuleExports(e){return this.next(),this.expectContextual(111),e.typeAnnotation=this.flowParseTypeAnnotation(),this.semicolon(),this.finishNode(e,"DeclareModuleExports")}flowParseDeclareTypeAlias(e){this.next();let t=this.flowParseTypeAlias(e);return this.castNodeTo(t,"DeclareTypeAlias"),t}flowParseDeclareOpaqueType(e){this.next();let t=this.flowParseOpaqueType(e,!0);return this.castNodeTo(t,"DeclareOpaqueType"),t}flowParseDeclareInterface(e){return this.next(),this.flowParseInterfaceish(e,!1),this.finishNode(e,"DeclareInterface")}flowParseInterfaceish(e,t){if(e.id=this.flowParseRestrictedIdentifier(!t,!0),this.scope.declareName(e.id.name,t?17:8201,e.id.loc.start),this.match(47)?e.typeParameters=this.flowParseTypeParameterDeclaration():e.typeParameters=null,e.extends=[],this.eat(81))do e.extends.push(this.flowParseInterfaceExtends());while(!t&&this.eat(12))if(t){if(e.implements=[],e.mixins=[],this.eatContextual(117))do e.mixins.push(this.flowParseInterfaceExtends());while(this.eat(12))if(this.eatContextual(113))do e.implements.push(this.flowParseInterfaceExtends());while(this.eat(12))}e.body=this.flowParseObjectType({allowStatic:t,allowExact:!1,allowSpread:!1,allowProto:t,allowInexact:!1})}flowParseInterfaceExtends(){let e=this.startNode();return e.id=this.flowParseQualifiedTypeIdentifier(),this.match(47)?e.typeParameters=this.flowParseTypeParameterInstantiation():e.typeParameters=null,this.finishNode(e,"InterfaceExtends")}flowParseInterface(e){return this.flowParseInterfaceish(e,!1),this.finishNode(e,"InterfaceDeclaration")}checkNotUnderscore(e){"_"===e&&this.raise(en.UnexpectedReservedUnderscore,this.state.startLoc)}checkReservedType(e,t,s){eo.has(e)&&this.raise(s?en.AssignReservedType:en.UnexpectedReservedType,t,{reservedType:e})}flowParseRestrictedIdentifierName(e,t){return this.checkReservedType(this.state.value,this.state.startLoc,t),this.parseIdentifierName(e)}flowParseRestrictedIdentifier(e,t){let s=this.startNode(),r=this.flowParseRestrictedIdentifierName(e,t);return this.createIdentifier(s,r)}flowParseTypeAlias(e){return e.id=this.flowParseRestrictedIdentifier(!1,!0),this.scope.declareName(e.id.name,8201,e.id.loc.start),this.match(47)?e.typeParameters=this.flowParseTypeParameterDeclaration():e.typeParameters=null,e.right=this.flowParseTypeInitialiser(29),this.semicolon(),this.finishNode(e,"TypeAlias")}flowParseOpaqueType(e,t){return this.expectContextual(130),e.id=this.flowParseRestrictedIdentifier(!0,!0),this.scope.declareName(e.id.name,8201,e.id.loc.start),this.match(47)?e.typeParameters=this.flowParseTypeParameterDeclaration():e.typeParameters=null,e.supertype=null,this.match(14)&&(e.supertype=this.flowParseTypeInitialiser(14)),e.impltype=null,t||(e.impltype=this.flowParseTypeInitialiser(29)),this.semicolon(),this.finishNode(e,"OpaqueType")}flowParseTypeParameterBound(){if(this.match(14)||this.isContextual(81)){let e=this.startNode();return this.next(),e.typeAnnotation=this.flowParseType(),this.finishNode(e,"TypeAnnotation")}}flowParseTypeParameter(e=!1){let t=this.state.startLoc,s=this.startNode(),r=this.flowParseVariance();return s.name=this.flowParseRestrictedIdentifierName(),s.variance=r,s.bound=this.flowParseTypeParameterBound(),this.match(29)?(this.eat(29),s.default=this.flowParseType()):e&&this.raise(en.MissingTypeParamDefault,t),this.finishNode(s,"TypeParameter")}flowParseTypeParameterDeclaration(){let e=this.state.inType,t=this.startNode();t.params=[],this.state.inType=!0,this.match(47)||this.match(143)?this.next():this.unexpected();let s=!1;do{let e=this.flowParseTypeParameter(s);t.params.push(e),e.default&&(s=!0),this.match(48)||this.expect(12)}while(!this.match(48))return this.expect(48),this.state.inType=e,this.finishNode(t,"TypeParameterDeclaration")}flowInTopLevelContext(e){if(this.curContext()===b.brace)return e();{let t=this.state.context;this.state.context=[t[0]];try{return e()}finally{this.state.context=t}}}flowParseTypeParameterInstantiationInExpression(){if(47===this.reScan_lt())return this.flowParseTypeParameterInstantiation()}flowParseTypeParameterInstantiation(){let e=this.startNode(),t=this.state.inType;return this.state.inType=!0,e.params=[],this.flowInTopLevelContext(()=>{this.expect(47);let t=this.state.noAnonFunctionType;for(this.state.noAnonFunctionType=!1;!this.match(48);)e.params.push(this.flowParseType()),this.match(48)||this.expect(12);this.state.noAnonFunctionType=t}),this.state.inType=t,this.state.inType||this.curContext()!==b.brace||this.reScan_lt_gt(),this.expect(48),this.finishNode(e,"TypeParameterInstantiation")}flowParseTypeParameterInstantiationCallOrNew(){if(47!==this.reScan_lt())return null;let e=this.startNode(),t=this.state.inType;for(e.params=[],this.state.inType=!0,this.expect(47);!this.match(48);)e.params.push(this.flowParseTypeOrImplicitInstantiation()),this.match(48)||this.expect(12);return this.expect(48),this.state.inType=t,this.finishNode(e,"TypeParameterInstantiation")}flowParseInterfaceType(){let e=this.startNode();if(this.expectContextual(129),e.extends=[],this.eat(81))do e.extends.push(this.flowParseInterfaceExtends());while(this.eat(12))return e.body=this.flowParseObjectType({allowStatic:!1,allowExact:!1,allowSpread:!1,allowProto:!1,allowInexact:!1}),this.finishNode(e,"InterfaceTypeAnnotation")}flowParseObjectPropertyKey(){return this.match(135)||this.match(134)?super.parseExprAtom():this.parseIdentifier(!0)}flowParseObjectTypeIndexer(e,t,s){return e.static=t,14===this.lookahead().type?(e.id=this.flowParseObjectPropertyKey(),e.key=this.flowParseTypeInitialiser()):(e.id=null,e.key=this.flowParseType()),this.expect(3),e.value=this.flowParseTypeInitialiser(),e.variance=s,this.finishNode(e,"ObjectTypeIndexer")}flowParseObjectTypeInternalSlot(e,t){return e.static=t,e.id=this.flowParseObjectPropertyKey(),this.expect(3),this.expect(3),this.match(47)||this.match(10)?(e.method=!0,e.optional=!1,e.value=this.flowParseObjectTypeMethodish(this.startNodeAt(e.loc.start))):(e.method=!1,this.eat(17)&&(e.optional=!0),e.value=this.flowParseTypeInitialiser()),this.finishNode(e,"ObjectTypeInternalSlot")}flowParseObjectTypeMethodish(e){for(e.params=[],e.rest=null,e.typeParameters=null,e.this=null,this.match(47)&&(e.typeParameters=this.flowParseTypeParameterDeclaration()),this.expect(10),this.match(78)&&(e.this=this.flowParseFunctionTypeParam(!0),e.this.name=null,this.match(11)||this.expect(12));!this.match(11)&&!this.match(21);)e.params.push(this.flowParseFunctionTypeParam(!1)),this.match(11)||this.expect(12);return this.eat(21)&&(e.rest=this.flowParseFunctionTypeParam(!1)),this.expect(11),e.returnType=this.flowParseTypeInitialiser(),this.finishNode(e,"FunctionTypeAnnotation")}flowParseObjectTypeCallProperty(e,t){let s=this.startNode();return e.static=t,e.value=this.flowParseObjectTypeMethodish(s),this.finishNode(e,"ObjectTypeCallProperty")}flowParseObjectType({allowStatic:e,allowExact:t,allowSpread:s,allowProto:r,allowInexact:i}){let a,o,n=this.state.inType;this.state.inType=!0;let l=this.startNode();l.callProperties=[],l.properties=[],l.indexers=[],l.internalSlots=[];let p=!1;for(t&&this.match(6)?(this.expect(6),a=9,o=!0):(this.expect(5),a=8,o=!1),l.exact=o;!this.match(a);){let t=!1,a=null,n=null,c=this.startNode();if(r&&this.isContextual(118)){let t=this.lookahead();14!==t.type&&17!==t.type&&(this.next(),a=this.state.startLoc,e=!1)}if(e&&this.isContextual(106)){let e=this.lookahead();14!==e.type&&17!==e.type&&(this.next(),t=!0)}let h=this.flowParseVariance();if(this.eat(0))null!=a&&this.unexpected(a),this.eat(0)?(h&&this.unexpected(h.loc.start),l.internalSlots.push(this.flowParseObjectTypeInternalSlot(c,t))):l.indexers.push(this.flowParseObjectTypeIndexer(c,t,h));else if(this.match(10)||this.match(47))null!=a&&this.unexpected(a),h&&this.unexpected(h.loc.start),l.callProperties.push(this.flowParseObjectTypeCallProperty(c,t));else{let e="init";(this.isContextual(99)||this.isContextual(104))&&F(this.lookahead().type)&&(e=this.state.value,this.next());let r=this.flowParseObjectTypeProperty(c,t,a,h,e,s,null!=i?i:!o);null===r?(p=!0,n=this.state.lastTokStartLoc):l.properties.push(r)}this.flowObjectTypeSemicolon(),!n||this.match(8)||this.match(9)||this.raise(en.UnexpectedExplicitInexactInObject,n)}this.expect(a),s&&(l.inexact=p);let c=this.finishNode(l,"ObjectTypeAnnotation");return this.state.inType=n,c}flowParseObjectTypeProperty(e,t,s,r,i,a,o){if(this.eat(21))return this.match(12)||this.match(13)||this.match(8)||this.match(9)?(a?o||this.raise(en.InexactInsideExact,this.state.lastTokStartLoc):this.raise(en.InexactInsideNonObject,this.state.lastTokStartLoc),r&&this.raise(en.InexactVariance,r),null):(a||this.raise(en.UnexpectedSpreadType,this.state.lastTokStartLoc),null!=s&&this.unexpected(s),r&&this.raise(en.SpreadVariance,r),e.argument=this.flowParseType(),this.finishNode(e,"ObjectTypeSpreadProperty"));{e.key=this.flowParseObjectPropertyKey(),e.static=t,e.proto=null!=s,e.kind=i;let o=!1;return this.match(47)||this.match(10)?(e.method=!0,null!=s&&this.unexpected(s),r&&this.unexpected(r.loc.start),e.value=this.flowParseObjectTypeMethodish(this.startNodeAt(e.loc.start)),("get"===i||"set"===i)&&this.flowCheckGetterSetterParams(e),!a&&"constructor"===e.key.name&&e.value.this&&this.raise(en.ThisParamBannedInConstructor,e.value.this)):("init"!==i&&this.unexpected(),e.method=!1,this.eat(17)&&(o=!0),e.value=this.flowParseTypeInitialiser(),e.variance=r),e.optional=o,this.finishNode(e,"ObjectTypeProperty")}}flowCheckGetterSetterParams(e){let t=+("get"!==e.kind),s=e.value.params.length+ +!!e.value.rest;e.value.this&&this.raise("get"===e.kind?en.GetterMayNotHaveThisParam:en.SetterMayNotHaveThisParam,e.value.this),s!==t&&this.raise("get"===e.kind?m.BadGetterArity:m.BadSetterArity,e),"set"===e.kind&&e.value.rest&&this.raise(m.BadSetterRestParameter,e)}flowObjectTypeSemicolon(){this.eat(13)||this.eat(12)||this.match(8)||this.match(9)||this.unexpected()}flowParseQualifiedTypeIdentifier(e,t){null!=e||(e=this.state.startLoc);let s=t||this.flowParseRestrictedIdentifier(!0);for(;this.eat(16);){let t=this.startNodeAt(e);t.qualification=s,t.id=this.flowParseRestrictedIdentifier(!0),s=this.finishNode(t,"QualifiedTypeIdentifier")}return s}flowParseGenericType(e,t){let s=this.startNodeAt(e);return s.typeParameters=null,s.id=this.flowParseQualifiedTypeIdentifier(e,t),this.match(47)&&(s.typeParameters=this.flowParseTypeParameterInstantiation()),this.finishNode(s,"GenericTypeAnnotation")}flowParseTypeofType(){let e=this.startNode();return this.expect(87),e.argument=this.flowParsePrimaryType(),this.finishNode(e,"TypeofTypeAnnotation")}flowParseTupleType(){let e=this.startNode();for(e.types=[],this.expect(0);this.state.pos<this.length&&!this.match(3)&&(e.types.push(this.flowParseType()),!this.match(3));)this.expect(12);return this.expect(3),this.finishNode(e,"TupleTypeAnnotation")}flowParseFunctionTypeParam(e){let t=null,s=!1,r=null,i=this.startNode(),a=this.lookahead(),o=78===this.state.type;return 14===a.type||17===a.type?(o&&!e&&this.raise(en.ThisParamMustBeFirst,i),t=this.parseIdentifier(o),this.eat(17)&&(s=!0,o&&this.raise(en.ThisParamMayNotBeOptional,i)),r=this.flowParseTypeInitialiser()):r=this.flowParseType(),i.name=t,i.optional=s,i.typeAnnotation=r,this.finishNode(i,"FunctionTypeParam")}reinterpretTypeAsFunctionTypeParam(e){let t=this.startNodeAt(e.loc.start);return t.name=null,t.optional=!1,t.typeAnnotation=e,this.finishNode(t,"FunctionTypeParam")}flowParseFunctionTypeParams(e=[]){let t=null,s=null;for(this.match(78)&&((s=this.flowParseFunctionTypeParam(!0)).name=null,this.match(11)||this.expect(12));!this.match(11)&&!this.match(21);)e.push(this.flowParseFunctionTypeParam(!1)),this.match(11)||this.expect(12);return this.eat(21)&&(t=this.flowParseFunctionTypeParam(!1)),{params:e,rest:t,_this:s}}flowIdentToTypeAnnotation(e,t,s){switch(s.name){case"any":return this.finishNode(t,"AnyTypeAnnotation");case"bool":case"boolean":return this.finishNode(t,"BooleanTypeAnnotation");case"mixed":return this.finishNode(t,"MixedTypeAnnotation");case"empty":return this.finishNode(t,"EmptyTypeAnnotation");case"number":return this.finishNode(t,"NumberTypeAnnotation");case"string":return this.finishNode(t,"StringTypeAnnotation");case"symbol":return this.finishNode(t,"SymbolTypeAnnotation");default:return this.checkNotUnderscore(s.name),this.flowParseGenericType(e,s)}}flowParsePrimaryType(){let e,t,s=this.state.startLoc,r=this.startNode(),i=!1,a=this.state.noAnonFunctionType;switch(this.state.type){case 5:return this.flowParseObjectType({allowStatic:!1,allowExact:!1,allowSpread:!0,allowProto:!1,allowInexact:!0});case 6:return this.flowParseObjectType({allowStatic:!1,allowExact:!0,allowSpread:!0,allowProto:!1,allowInexact:!1});case 0:return this.state.noAnonFunctionType=!1,t=this.flowParseTupleType(),this.state.noAnonFunctionType=a,t;case 47:{let t=this.startNode();return t.typeParameters=this.flowParseTypeParameterDeclaration(),this.expect(10),t.params=(e=this.flowParseFunctionTypeParams()).params,t.rest=e.rest,t.this=e._this,this.expect(11),this.expect(19),t.returnType=this.flowParseType(),this.finishNode(t,"FunctionTypeAnnotation")}case 10:{let s=this.startNode();if(this.next(),!this.match(11)&&!this.match(21))if(L(this.state.type)||this.match(78)){let e=this.lookahead().type;i=17!==e&&14!==e}else i=!0;if(i){if(this.state.noAnonFunctionType=!1,t=this.flowParseType(),this.state.noAnonFunctionType=a,this.state.noAnonFunctionType||!(this.match(12)||this.match(11)&&19===this.lookahead().type))return this.expect(11),t;this.eat(12)}return s.params=(e=t?this.flowParseFunctionTypeParams([this.reinterpretTypeAsFunctionTypeParam(t)]):this.flowParseFunctionTypeParams()).params,s.rest=e.rest,s.this=e._this,this.expect(11),this.expect(19),s.returnType=this.flowParseType(),s.typeParameters=null,this.finishNode(s,"FunctionTypeAnnotation")}case 134:return this.parseLiteral(this.state.value,"StringLiteralTypeAnnotation");case 85:case 86:return r.value=this.match(85),this.next(),this.finishNode(r,"BooleanLiteralTypeAnnotation");case 53:if("-"===this.state.value){if(this.next(),this.match(135))return this.parseLiteralAtNode(-this.state.value,"NumberLiteralTypeAnnotation",r);if(this.match(136))return this.parseLiteralAtNode(-this.state.value,"BigIntLiteralTypeAnnotation",r);throw this.raise(en.UnexpectedSubtractionOperand,this.state.startLoc)}break;case 135:return this.parseLiteral(this.state.value,"NumberLiteralTypeAnnotation");case 136:return this.parseLiteral(this.state.value,"BigIntLiteralTypeAnnotation");case 88:return this.next(),this.finishNode(r,"VoidTypeAnnotation");case 84:return this.next(),this.finishNode(r,"NullLiteralTypeAnnotation");case 78:return this.next(),this.finishNode(r,"ThisTypeAnnotation");case 55:return this.next(),this.finishNode(r,"ExistsTypeAnnotation");case 87:return this.flowParseTypeofType();default:if(U(this.state.type)){let e=S[this.state.type];return this.next(),super.createIdentifier(r,e)}if(L(this.state.type)){if(this.isContextual(129))return this.flowParseInterfaceType();return this.flowIdentToTypeAnnotation(s,r,this.parseIdentifier())}}throw this.unexpected()}flowParsePostfixType(){let e=this.state.startLoc,t=this.flowParsePrimaryType(),s=!1;for(;(this.match(0)||this.match(18))&&!this.canInsertSemicolon();){let r=this.startNodeAt(e),i=this.eat(18);s=s||i,this.expect(0),!i&&this.match(3)?(r.elementType=t,this.next(),t=this.finishNode(r,"ArrayTypeAnnotation")):(r.objectType=t,r.indexType=this.flowParseType(),this.expect(3),s?(r.optional=i,t=this.finishNode(r,"OptionalIndexedAccessType")):t=this.finishNode(r,"IndexedAccessType"))}return t}flowParsePrefixType(){let e=this.startNode();return this.eat(17)?(e.typeAnnotation=this.flowParsePrefixType(),this.finishNode(e,"NullableTypeAnnotation")):this.flowParsePostfixType()}flowParseAnonFunctionWithoutParens(){let e=this.flowParsePrefixType();if(!this.state.noAnonFunctionType&&this.eat(19)){let t=this.startNodeAt(e.loc.start);return t.params=[this.reinterpretTypeAsFunctionTypeParam(e)],t.rest=null,t.this=null,t.returnType=this.flowParseType(),t.typeParameters=null,this.finishNode(t,"FunctionTypeAnnotation")}return e}flowParseIntersectionType(){let e=this.startNode();this.eat(45);let t=this.flowParseAnonFunctionWithoutParens();for(e.types=[t];this.eat(45);)e.types.push(this.flowParseAnonFunctionWithoutParens());return 1===e.types.length?t:this.finishNode(e,"IntersectionTypeAnnotation")}flowParseUnionType(){let e=this.startNode();this.eat(43);let t=this.flowParseIntersectionType();for(e.types=[t];this.eat(43);)e.types.push(this.flowParseIntersectionType());return 1===e.types.length?t:this.finishNode(e,"UnionTypeAnnotation")}flowParseType(){let e=this.state.inType;this.state.inType=!0;let t=this.flowParseUnionType();return this.state.inType=e,t}flowParseTypeOrImplicitInstantiation(){if(132!==this.state.type||"_"!==this.state.value)return this.flowParseType();{let e=this.state.startLoc,t=this.parseIdentifier();return this.flowParseGenericType(e,t)}}flowParseTypeAnnotation(){let e=this.startNode();return e.typeAnnotation=this.flowParseTypeInitialiser(),this.finishNode(e,"TypeAnnotation")}flowParseTypeAnnotatableIdentifier(){let e=this.startNode(),t=this.parseIdentifierName();return this.match(14)&&(e.typeAnnotation=this.flowParseTypeAnnotation()),this.createIdentifier(e,t)}typeCastToParameter(e){return e.expression.typeAnnotation=e.typeAnnotation,this.resetEndLocation(e.expression,e.typeAnnotation.loc.end),e.expression}flowParseVariance(){let e=null;return this.match(53)?(e=this.startNode(),"+"===this.state.value?e.kind="plus":e.kind="minus",this.next(),this.finishNode(e,"Variance")):e}parseFunctionBody(e,t,s=!1){t?this.forwardNoArrowParamsConversionAt(e,()=>super.parseFunctionBody(e,!0,s)):super.parseFunctionBody(e,!1,s)}parseFunctionBodyAndFinish(e,t,s=!1){if(this.match(14)){let t=this.startNode();[t.typeAnnotation,e.predicate]=this.flowParseTypeAndPredicateInitialiser(),e.returnType=t.typeAnnotation?this.finishNode(t,"TypeAnnotation"):null}return super.parseFunctionBodyAndFinish(e,t,s)}parseStatementLike(e){if(this.state.strict&&this.isContextual(129)){if(O(this.lookahead().type)){let e=this.startNode();return this.next(),this.flowParseInterface(e)}}else if(this.isContextual(126)){let e=this.startNode();return this.next(),this.flowParseEnumDeclaration(e)}let t=super.parseStatementLike(e);return void 0!==this.flowPragma||this.isValidDirective(t)||(this.flowPragma=null),t}parseExpressionStatement(e,t,s){if("Identifier"===t.type){if("declare"===t.name){if(this.match(80)||L(this.state.type)||this.match(68)||this.match(74)||this.match(82))return this.flowParseDeclare(e)}else if(L(this.state.type)){if("interface"===t.name)return this.flowParseInterface(e);else if("type"===t.name)return this.flowParseTypeAlias(e);else if("opaque"===t.name)return this.flowParseOpaqueType(e,!1)}}return super.parseExpressionStatement(e,t,s)}shouldParseExportDeclaration(){let{type:e}=this.state;return 126===e||B(e)?!this.state.containsEsc:super.shouldParseExportDeclaration()}isExportDefaultSpecifier(){let{type:e}=this.state;return 126===e||B(e)?this.state.containsEsc:super.isExportDefaultSpecifier()}parseExportDefaultExpression(){if(this.isContextual(126)){let e=this.startNode();return this.next(),this.flowParseEnumDeclaration(e)}return super.parseExportDefaultExpression()}parseConditional(e,t,s){if(!this.match(17))return e;if(this.state.maybeInArrowParameters){let t=this.lookaheadCharCode();if(44===t||61===t||58===t||41===t)return this.setOptionalParametersError(s),e}this.expect(17);let r=this.state.clone(),i=this.state.noArrowAt,a=this.startNodeAt(t),{consequent:o,failed:n}=this.tryParseConditionalConsequent(),[l,p]=this.getArrowLikeExpressions(o);if(n||p.length>0){let e=[...i];if(p.length>0){this.state=r,this.state.noArrowAt=e;for(let t=0;t<p.length;t++)e.push(p[t].start);({consequent:o,failed:n}=this.tryParseConditionalConsequent()),[l,p]=this.getArrowLikeExpressions(o)}n&&l.length>1&&this.raise(en.AmbiguousConditionalArrow,r.startLoc),n&&1===l.length&&(this.state=r,e.push(l[0].start),this.state.noArrowAt=e,{consequent:o,failed:n}=this.tryParseConditionalConsequent())}return this.getArrowLikeExpressions(o,!0),this.state.noArrowAt=i,this.expect(14),a.test=e,a.consequent=o,a.alternate=this.forwardNoArrowParamsConversionAt(a,()=>this.parseMaybeAssign(void 0,void 0)),this.finishNode(a,"ConditionalExpression")}tryParseConditionalConsequent(){this.state.noArrowParamsConversionAt.push(this.state.start);let e=this.parseMaybeAssignAllowIn(),t=!this.match(14);return this.state.noArrowParamsConversionAt.pop(),{consequent:e,failed:t}}getArrowLikeExpressions(e,t){let s=[e],r=[];for(;0!==s.length;){let e=s.pop();"ArrowFunctionExpression"===e.type&&"BlockStatement"!==e.body.type?(e.typeParameters||!e.returnType?this.finishArrowValidation(e):r.push(e),s.push(e.body)):"ConditionalExpression"===e.type&&(s.push(e.consequent),s.push(e.alternate))}return t?(r.forEach(e=>this.finishArrowValidation(e)),[r,[]]):function(e,t){let s=[],r=[];for(let i=0;i<e.length;i++)(t(e[i],i,e)?s:r).push(e[i]);return[s,r]}(r,e=>e.params.every(e=>this.isAssignable(e,!0)))}finishArrowValidation(e){var t;this.toAssignableList(e.params,null==(t=e.extra)?void 0:t.trailingCommaLoc,!1),this.scope.enter(518),super.checkParams(e,!1,!0),this.scope.exit()}forwardNoArrowParamsConversionAt(e,t){let s;return this.state.noArrowParamsConversionAt.includes(this.offsetToSourcePos(e.start))?(this.state.noArrowParamsConversionAt.push(this.state.start),s=t(),this.state.noArrowParamsConversionAt.pop()):s=t(),s}parseParenItem(e,t){let s=super.parseParenItem(e,t);if(this.eat(17)&&(s.optional=!0,this.resetEndLocation(e)),this.match(14)){let e=this.startNodeAt(t);return e.expression=s,e.typeAnnotation=this.flowParseTypeAnnotation(),this.finishNode(e,"TypeCastExpression")}return s}assertModuleNodeAllowed(e){("ImportDeclaration"!==e.type||"type"!==e.importKind&&"typeof"!==e.importKind)&&("ExportNamedDeclaration"!==e.type||"type"!==e.exportKind)&&("ExportAllDeclaration"!==e.type||"type"!==e.exportKind)&&super.assertModuleNodeAllowed(e)}parseExportDeclaration(e){if(this.isContextual(130)){e.exportKind="type";let t=this.startNode();return(this.next(),this.match(5))?(e.specifiers=this.parseExportSpecifiers(!0),super.parseExportFrom(e),null):this.flowParseTypeAlias(t)}if(this.isContextual(131)){e.exportKind="type";let t=this.startNode();return this.next(),this.flowParseOpaqueType(t,!1)}if(this.isContextual(129)){e.exportKind="type";let t=this.startNode();return this.next(),this.flowParseInterface(t)}{if(!this.isContextual(126))return super.parseExportDeclaration(e);e.exportKind="value";let t=this.startNode();return this.next(),this.flowParseEnumDeclaration(t)}}eatExportStar(e){return!!super.eatExportStar(e)||!!this.isContextual(130)&&55===this.lookahead().type&&(e.exportKind="type",this.next(),this.next(),!0)}maybeParseExportNamespaceSpecifier(e){let{startLoc:t}=this.state,s=super.maybeParseExportNamespaceSpecifier(e);return s&&"type"===e.exportKind&&this.unexpected(t),s}parseClassId(e,t,s){super.parseClassId(e,t,s),this.match(47)&&(e.typeParameters=this.flowParseTypeParameterDeclaration())}parseClassMember(e,t,s){let{startLoc:r}=this.state;if(this.isContextual(125)){if(super.parseClassMemberFromModifier(e,t))return;t.declare=!0}super.parseClassMember(e,t,s),t.declare&&("ClassProperty"!==t.type&&"ClassPrivateProperty"!==t.type&&"PropertyDefinition"!==t.type?this.raise(en.DeclareClassElement,r):t.value&&this.raise(en.DeclareClassFieldInitializer,t.value))}isIterator(e){return"iterator"===e||"asyncIterator"===e}readIterator(){let e=super.readWord1(),t="@@"+e;this.isIterator(e)&&this.state.inType||this.raise(m.InvalidIdentifier,this.state.curPosition(),{identifierName:t}),this.finishToken(132,t)}getTokenFromCode(e){let t=this.input.charCodeAt(this.state.pos+1);if(123===e&&124===t)this.finishOp(6,2);else if(this.state.inType&&(62===e||60===e))this.finishOp(62===e?48:47,1);else if(this.state.inType&&63===e)46===t?this.finishOp(18,2):this.finishOp(17,1);else{var s;(s=this.input.charCodeAt(this.state.pos+2),64===e&&64===t&&G(s))?(this.state.pos+=2,this.readIterator()):super.getTokenFromCode(e)}}isAssignable(e,t){return"TypeCastExpression"===e.type?this.isAssignable(e.expression,t):super.isAssignable(e,t)}toAssignable(e,t=!1){t||"AssignmentExpression"!==e.type||"TypeCastExpression"!==e.left.type||(e.left=this.typeCastToParameter(e.left)),super.toAssignable(e,t)}toAssignableList(e,t,s){for(let t=0;t<e.length;t++){let s=e[t];(null==s?void 0:s.type)==="TypeCastExpression"&&(e[t]=this.typeCastToParameter(s))}super.toAssignableList(e,t,s)}toReferencedList(e,t){for(let r=0;r<e.length;r++){var s;let i=e[r];i&&"TypeCastExpression"===i.type&&!(null!=(s=i.extra)&&s.parenthesized)&&(e.length>1||!t)&&this.raise(en.TypeCastInPattern,i.typeAnnotation)}return e}parseArrayLike(e,t,s){let r=super.parseArrayLike(e,t,s);return null==s||this.state.maybeInArrowParameters||this.toReferencedList(r.elements),r}isValidLVal(e,t,s,r){return"TypeCastExpression"===e||super.isValidLVal(e,t,s,r)}parseClassProperty(e){return this.match(14)&&(e.typeAnnotation=this.flowParseTypeAnnotation()),super.parseClassProperty(e)}parseClassPrivateProperty(e){return this.match(14)&&(e.typeAnnotation=this.flowParseTypeAnnotation()),super.parseClassPrivateProperty(e)}isClassMethod(){return this.match(47)||super.isClassMethod()}isClassProperty(){return this.match(14)||super.isClassProperty()}isNonstaticConstructor(e){return!this.match(14)&&super.isNonstaticConstructor(e)}pushClassMethod(e,t,s,r,i,a){if(t.variance&&this.unexpected(t.variance.loc.start),delete t.variance,this.match(47)&&(t.typeParameters=this.flowParseTypeParameterDeclaration()),super.pushClassMethod(e,t,s,r,i,a),t.params&&i){let e=t.params;e.length>0&&this.isThisParam(e[0])&&this.raise(en.ThisParamBannedInConstructor,t)}else if("MethodDefinition"===t.type&&i&&t.value.params){let e=t.value.params;e.length>0&&this.isThisParam(e[0])&&this.raise(en.ThisParamBannedInConstructor,t)}}pushClassPrivateMethod(e,t,s,r){t.variance&&this.unexpected(t.variance.loc.start),delete t.variance,this.match(47)&&(t.typeParameters=this.flowParseTypeParameterDeclaration()),super.pushClassPrivateMethod(e,t,s,r)}parseClassSuper(e){if(super.parseClassSuper(e),e.superClass&&(this.match(47)||this.match(51))&&(e.superTypeParameters=this.flowParseTypeParameterInstantiationInExpression()),this.isContextual(113)){this.next();let t=e.implements=[];do{let e=this.startNode();e.id=this.flowParseRestrictedIdentifier(!0),this.match(47)?e.typeParameters=this.flowParseTypeParameterInstantiation():e.typeParameters=null,t.push(this.finishNode(e,"ClassImplements"))}while(this.eat(12))}}checkGetterSetterParams(e){super.checkGetterSetterParams(e);let t=this.getObjectOrClassMethodParams(e);if(t.length>0){let s=t[0];this.isThisParam(s)&&"get"===e.kind?this.raise(en.GetterMayNotHaveThisParam,s):this.isThisParam(s)&&this.raise(en.SetterMayNotHaveThisParam,s)}}parsePropertyNamePrefixOperator(e){e.variance=this.flowParseVariance()}parseObjPropValue(e,t,s,r,i,a,o){let n;e.variance&&this.unexpected(e.variance.loc.start),delete e.variance,this.match(47)&&!a&&(n=this.flowParseTypeParameterDeclaration(),this.match(10)||this.unexpected());let l=super.parseObjPropValue(e,t,s,r,i,a,o);return n&&((l.value||l).typeParameters=n),l}parseFunctionParamType(e){return this.eat(17)&&("Identifier"!==e.type&&this.raise(en.PatternIsOptional,e),this.isThisParam(e)&&this.raise(en.ThisParamMayNotBeOptional,e),e.optional=!0),this.match(14)?e.typeAnnotation=this.flowParseTypeAnnotation():this.isThisParam(e)&&this.raise(en.ThisParamAnnotationRequired,e),this.match(29)&&this.isThisParam(e)&&this.raise(en.ThisParamNoDefault,e),this.resetEndLocation(e),e}parseMaybeDefault(e,t){let s=super.parseMaybeDefault(e,t);return"AssignmentPattern"===s.type&&s.typeAnnotation&&s.right.start<s.typeAnnotation.start&&this.raise(en.TypeBeforeInitializer,s.typeAnnotation),s}checkImportReflection(e){super.checkImportReflection(e),e.module&&"value"!==e.importKind&&this.raise(en.ImportReflectionHasImportType,e.specifiers[0].loc.start)}parseImportSpecifierLocal(e,t,s){t.local=el(e)?this.flowParseRestrictedIdentifier(!0,!0):this.parseIdentifier(),e.specifiers.push(this.finishImportSpecifier(t,s))}isPotentialImportPhase(e){if(super.isPotentialImportPhase(e))return!0;if(this.isContextual(130)){if(!e)return!0;let t=this.lookaheadCharCode();return 123===t||42===t}return!e&&this.isContextual(87)}applyImportPhase(e,t,s,r){(super.applyImportPhase(e,t,s,r),t)?!s&&this.match(65)||(e.exportKind="type"===s?s:"value"):("type"===s&&this.match(55)&&this.unexpected(),e.importKind="type"===s||"typeof"===s?s:"value")}parseImportSpecifier(e,t,s,r,i){let a=e.imported,o=null;"Identifier"===a.type&&("type"===a.name?o="type":"typeof"===a.name&&(o="typeof"));let n=!1;if(this.isContextual(93)&&!this.isLookaheadContextual("as")){let t=this.parseIdentifier(!0);null===o||O(this.state.type)?(e.imported=a,e.importKind=null,e.local=this.parseIdentifier()):(e.imported=t,e.importKind=o,e.local=this.cloneIdentifier(t))}else{if(null!==o&&O(this.state.type))e.imported=this.parseIdentifier(!0),e.importKind=o;else{if(t)throw this.raise(m.ImportBindingIsString,e,{importName:a.value});e.imported=a,e.importKind=null}this.eatContextual(93)?e.local=this.parseIdentifier():(n=!0,e.local=this.cloneIdentifier(e.imported))}let l=el(e);return s&&l&&this.raise(en.ImportTypeShorthandOnlyInPureImport,e),(s||l)&&this.checkReservedType(e.local.name,e.local.loc.start,!0),!n||s||l||this.checkReservedWord(e.local.name,e.loc.start,!0,!0),this.finishImportSpecifier(e,"ImportSpecifier")}parseBindingAtom(){return 78===this.state.type?this.parseIdentifier(!0):super.parseBindingAtom()}parseFunctionParams(e,t){let s=e.kind;"get"!==s&&"set"!==s&&this.match(47)&&(e.typeParameters=this.flowParseTypeParameterDeclaration()),super.parseFunctionParams(e,t)}parseVarId(e,t){super.parseVarId(e,t),this.match(14)&&(e.id.typeAnnotation=this.flowParseTypeAnnotation(),this.resetEndLocation(e.id))}parseAsyncArrowFromCallExpression(e,t){if(this.match(14)){let t=this.state.noAnonFunctionType;this.state.noAnonFunctionType=!0,e.returnType=this.flowParseTypeAnnotation(),this.state.noAnonFunctionType=t}return super.parseAsyncArrowFromCallExpression(e,t)}shouldParseAsyncArrow(){return this.match(14)||super.shouldParseAsyncArrow()}parseMaybeAssign(e,t){var s,r,i;let a,o=null;if(this.hasPlugin("jsx")&&(this.match(143)||this.match(47))){if(o=this.state.clone(),!(a=this.tryParse(()=>super.parseMaybeAssign(e,t),o)).error)return a.node;let{context:s}=this.state,r=s[s.length-1];(r===b.j_oTag||r===b.j_expr)&&s.pop()}if(null!=(s=a)&&s.error||this.match(47)){let s;o=o||this.state.clone();let n=this.tryParse(r=>{var i;s=this.flowParseTypeParameterDeclaration();let a=this.forwardNoArrowParamsConversionAt(s,()=>{let r=super.parseMaybeAssign(e,t);return this.resetStartLocationFromNode(r,s),r});null!=(i=a.extra)&&i.parenthesized&&r();let o=this.maybeUnwrapTypeCastExpression(a);return"ArrowFunctionExpression"!==o.type&&r(),o.typeParameters=s,this.resetStartLocationFromNode(o,s),a},o),l=null;if(n.node&&"ArrowFunctionExpression"===this.maybeUnwrapTypeCastExpression(n.node).type){if(!n.error&&!n.aborted)return n.node.async&&this.raise(en.UnexpectedTypeParameterBeforeAsyncArrowFunction,s),n.node;l=n.node}if(null!=(r=a)&&r.node)return this.state=a.failState,a.node;if(l)return this.state=n.failState,l;if(null!=(i=a)&&i.thrown)throw a.error;if(n.thrown)throw n.error;throw this.raise(en.UnexpectedTokenAfterTypeParameter,s)}return super.parseMaybeAssign(e,t)}parseArrow(e){if(this.match(14)){let t=this.tryParse(()=>{let t=this.state.noAnonFunctionType;this.state.noAnonFunctionType=!0;let s=this.startNode();return[s.typeAnnotation,e.predicate]=this.flowParseTypeAndPredicateInitialiser(),this.state.noAnonFunctionType=t,this.canInsertSemicolon()&&this.unexpected(),this.match(19)||this.unexpected(),s});if(t.thrown)return null;t.error&&(this.state=t.failState),e.returnType=t.node.typeAnnotation?this.finishNode(t.node,"TypeAnnotation"):null}return super.parseArrow(e)}shouldParseArrow(e){return this.match(14)||super.shouldParseArrow(e)}setArrowFunctionParameters(e,t){this.state.noArrowParamsConversionAt.includes(this.offsetToSourcePos(e.start))?e.params=t:super.setArrowFunctionParameters(e,t)}checkParams(e,t,s,r=!0){if(!(s&&this.state.noArrowParamsConversionAt.includes(this.offsetToSourcePos(e.start)))){for(let t=0;t<e.params.length;t++)this.isThisParam(e.params[t])&&t>0&&this.raise(en.ThisParamMustBeFirst,e.params[t]);super.checkParams(e,t,s,r)}}parseParenAndDistinguishExpression(e){return super.parseParenAndDistinguishExpression(e&&!this.state.noArrowAt.includes(this.sourceToOffsetPos(this.state.start)))}parseSubscripts(e,t,s){if("Identifier"===e.type&&"async"===e.name&&this.state.noArrowAt.includes(t.index)){this.next();let s=this.startNodeAt(t);s.callee=e,s.arguments=super.parseCallExpressionArguments(),e=this.finishNode(s,"CallExpression")}else if("Identifier"===e.type&&"async"===e.name&&this.match(47)){let r=this.state.clone(),i=this.tryParse(e=>this.parseAsyncArrowWithTypeParameters(t)||e(),r);if(!i.error&&!i.aborted)return i.node;let a=this.tryParse(()=>super.parseSubscripts(e,t,s),r);if(a.node&&!a.error)return a.node;if(i.node)return this.state=i.failState,i.node;if(a.node)return this.state=a.failState,a.node;throw i.error||a.error}return super.parseSubscripts(e,t,s)}parseSubscript(e,t,s,r){if(this.match(18)&&this.isLookaheadToken_lt()){if(r.optionalChainMember=!0,s)return r.stop=!0,e;this.next();let i=this.startNodeAt(t);return i.callee=e,i.typeArguments=this.flowParseTypeParameterInstantiationInExpression(),this.expect(10),i.arguments=this.parseCallExpressionArguments(),i.optional=!0,this.finishCallExpression(i,!0)}if(!s&&this.shouldParseTypes()&&(this.match(47)||this.match(51))){let s=this.startNodeAt(t);s.callee=e;let i=this.tryParse(()=>(s.typeArguments=this.flowParseTypeParameterInstantiationCallOrNew(),this.expect(10),s.arguments=super.parseCallExpressionArguments(),r.optionalChainMember&&(s.optional=!1),this.finishCallExpression(s,r.optionalChainMember)));if(i.node)return i.error&&(this.state=i.failState),i.node}return super.parseSubscript(e,t,s,r)}parseNewCallee(e){super.parseNewCallee(e);let t=null;this.shouldParseTypes()&&this.match(47)&&(t=this.tryParse(()=>this.flowParseTypeParameterInstantiationCallOrNew()).node),e.typeArguments=t}parseAsyncArrowWithTypeParameters(e){let t=this.startNodeAt(e);if(this.parseFunctionParams(t,!1),this.parseArrow(t))return super.parseArrowExpression(t,void 0,!0)}readToken_mult_modulo(e){let t=this.input.charCodeAt(this.state.pos+1);if(42===e&&47===t&&this.state.hasFlowComment){this.state.hasFlowComment=!1,this.state.pos+=2,this.nextToken();return}super.readToken_mult_modulo(e)}readToken_pipe_amp(e){let t=this.input.charCodeAt(this.state.pos+1);124===e&&125===t?this.finishOp(9,2):super.readToken_pipe_amp(e)}parseTopLevel(e,t){let s=super.parseTopLevel(e,t);return this.state.hasFlowComment&&this.raise(en.UnterminatedFlowComment,this.state.curPosition()),s}skipBlockComment(){if(this.hasPlugin("flowComments")&&this.skipFlowComment()){if(this.state.hasFlowComment)throw this.raise(en.NestedFlowComment,this.state.startLoc);this.hasFlowCommentCompletion();let e=this.skipFlowComment();e&&(this.state.pos+=e,this.state.hasFlowComment=!0);return}return super.skipBlockComment(this.state.hasFlowComment?"*-/":"*/")}skipFlowComment(){let{pos:e}=this.state,t=2;for(;[32,9].includes(this.input.charCodeAt(e+t));)t++;let s=this.input.charCodeAt(t+e),r=this.input.charCodeAt(t+e+1);return 58===s&&58===r?t+2:"flow-include"===this.input.slice(t+e,t+e+12)?t+12:58===s&&58!==r&&t}hasFlowCommentCompletion(){if(-1===this.input.indexOf("*/",this.state.pos))throw this.raise(m.UnterminatedComment,this.state.curPosition())}flowEnumErrorBooleanMemberNotInitialized(e,{enumName:t,memberName:s}){this.raise(en.EnumBooleanMemberNotInitialized,e,{memberName:s,enumName:t})}flowEnumErrorInvalidMemberInitializer(e,t){return this.raise(t.explicitType?"symbol"===t.explicitType?en.EnumInvalidMemberInitializerSymbolType:en.EnumInvalidMemberInitializerPrimaryType:en.EnumInvalidMemberInitializerUnknownType,e,t)}flowEnumErrorNumberMemberNotInitialized(e,t){this.raise(en.EnumNumberMemberNotInitialized,e,t)}flowEnumErrorStringMemberInconsistentlyInitialized(e,t){this.raise(en.EnumStringMemberInconsistentlyInitialized,e,t)}flowEnumMemberInit(){let e=this.state.startLoc,t=()=>this.match(12)||this.match(8);switch(this.state.type){case 135:{let s=this.parseNumericLiteral(this.state.value);if(t())return{type:"number",loc:s.loc.start,value:s};return{type:"invalid",loc:e}}case 134:{let s=this.parseStringLiteral(this.state.value);if(t())return{type:"string",loc:s.loc.start,value:s};return{type:"invalid",loc:e}}case 85:case 86:{let s=this.parseBooleanLiteral(this.match(85));if(t())return{type:"boolean",loc:s.loc.start,value:s};return{type:"invalid",loc:e}}default:return{type:"invalid",loc:e}}}flowEnumMemberRaw(){let e=this.state.startLoc;return{id:this.parseIdentifier(!0),init:this.eat(29)?this.flowEnumMemberInit():{type:"none",loc:e}}}flowEnumCheckExplicitTypeMismatch(e,t,s){let{explicitType:r}=t;null!==r&&r!==s&&this.flowEnumErrorInvalidMemberInitializer(e,t)}flowEnumMembers({enumName:e,explicitType:t}){let s=new Set,r={booleanMembers:[],numberMembers:[],stringMembers:[],defaultedMembers:[]},i=!1;for(;!this.match(8);){if(this.eat(21)){i=!0;break}let a=this.startNode(),{id:o,init:n}=this.flowEnumMemberRaw(),l=o.name;if(""===l)continue;/^[a-z]/.test(l)&&this.raise(en.EnumInvalidMemberName,o,{memberName:l,suggestion:l[0].toUpperCase()+l.slice(1),enumName:e}),s.has(l)&&this.raise(en.EnumDuplicateMemberName,o,{memberName:l,enumName:e}),s.add(l);let p={enumName:e,explicitType:t,memberName:l};switch(a.id=o,n.type){case"boolean":this.flowEnumCheckExplicitTypeMismatch(n.loc,p,"boolean"),a.init=n.value,r.booleanMembers.push(this.finishNode(a,"EnumBooleanMember"));break;case"number":this.flowEnumCheckExplicitTypeMismatch(n.loc,p,"number"),a.init=n.value,r.numberMembers.push(this.finishNode(a,"EnumNumberMember"));break;case"string":this.flowEnumCheckExplicitTypeMismatch(n.loc,p,"string"),a.init=n.value,r.stringMembers.push(this.finishNode(a,"EnumStringMember"));break;case"invalid":throw this.flowEnumErrorInvalidMemberInitializer(n.loc,p);case"none":switch(t){case"boolean":this.flowEnumErrorBooleanMemberNotInitialized(n.loc,p);break;case"number":this.flowEnumErrorNumberMemberNotInitialized(n.loc,p);break;default:r.defaultedMembers.push(this.finishNode(a,"EnumDefaultedMember"))}}this.match(8)||this.expect(12)}return{members:r,hasUnknownMembers:i}}flowEnumStringMembers(e,t,{enumName:s}){if(0===e.length)return t;if(0===t.length)return e;if(t.length>e.length){for(let t of e)this.flowEnumErrorStringMemberInconsistentlyInitialized(t,{enumName:s});return t}for(let e of t)this.flowEnumErrorStringMemberInconsistentlyInitialized(e,{enumName:s});return e}flowEnumParseExplicitType({enumName:e}){if(!this.eatContextual(102))return null;if(!L(this.state.type))throw this.raise(en.EnumInvalidExplicitTypeUnknownSupplied,this.state.startLoc,{enumName:e});let{value:t}=this.state;return this.next(),"boolean"!==t&&"number"!==t&&"string"!==t&&"symbol"!==t&&this.raise(en.EnumInvalidExplicitType,this.state.startLoc,{enumName:e,invalidEnumType:t}),t}flowEnumBody(e,t){let s=t.name,r=t.loc.start,i=this.flowEnumParseExplicitType({enumName:s});this.expect(5);let{members:a,hasUnknownMembers:o}=this.flowEnumMembers({enumName:s,explicitType:i});switch(e.hasUnknownMembers=o,i){case"boolean":return e.explicitType=!0,e.members=a.booleanMembers,this.expect(8),this.finishNode(e,"EnumBooleanBody");case"number":return e.explicitType=!0,e.members=a.numberMembers,this.expect(8),this.finishNode(e,"EnumNumberBody");case"string":return e.explicitType=!0,e.members=this.flowEnumStringMembers(a.stringMembers,a.defaultedMembers,{enumName:s}),this.expect(8),this.finishNode(e,"EnumStringBody");case"symbol":return e.members=a.defaultedMembers,this.expect(8),this.finishNode(e,"EnumSymbolBody");default:{let t=()=>(e.members=[],this.expect(8),this.finishNode(e,"EnumStringBody"));e.explicitType=!1;let i=a.booleanMembers.length,o=a.numberMembers.length,n=a.stringMembers.length,l=a.defaultedMembers.length;if(!i&&!o&&!n&&!l)return t();if(!i&&!o)return e.members=this.flowEnumStringMembers(a.stringMembers,a.defaultedMembers,{enumName:s}),this.expect(8),this.finishNode(e,"EnumStringBody");if(o||n||!(i>=l))if(i||n||!(o>=l))return this.raise(en.EnumInconsistentMemberValues,r,{enumName:s}),t();else{for(let e of a.defaultedMembers)this.flowEnumErrorNumberMemberNotInitialized(e.loc.start,{enumName:s,memberName:e.id.name});return e.members=a.numberMembers,this.expect(8),this.finishNode(e,"EnumNumberBody")}else{for(let e of a.defaultedMembers)this.flowEnumErrorBooleanMemberNotInitialized(e.loc.start,{enumName:s,memberName:e.id.name});return e.members=a.booleanMembers,this.expect(8),this.finishNode(e,"EnumBooleanBody")}}}}flowParseEnumDeclaration(e){let t=this.parseIdentifier();return e.id=t,e.body=this.flowEnumBody(this.startNode(),t),this.finishNode(e,"EnumDeclaration")}jsxParseOpeningElementAfterName(e){return this.shouldParseTypes()&&(this.match(47)||this.match(51))&&(e.typeArguments=this.flowParseTypeParameterInstantiationInExpression()),super.jsxParseOpeningElementAfterName(e)}isLookaheadToken_lt(){let e=this.nextTokenStart();if(60===this.input.charCodeAt(e)){let t=this.input.charCodeAt(e+1);return 60!==t&&61!==t}return!1}reScan_lt_gt(){let{type:e}=this.state;47===e?(this.state.pos-=1,this.readToken_lt()):48===e&&(this.state.pos-=1,this.readToken_gt())}reScan_lt(){let{type:e}=this.state;return 51===e?(this.state.pos-=2,this.finishOp(47,1),47):e}maybeUnwrapTypeCastExpression(e){return"TypeCastExpression"===e.type?e.expression:e}},typescript:e=>class extends e{constructor(...e){super(...e),this.tsParseInOutModifiers=this.tsParseModifiers.bind(this,{allowedModifiers:["in","out"],disallowedModifiers:["const","public","private","protected","readonly","declare","abstract","override"],errorTemplate:e4.InvalidModifierOnTypeParameter}),this.tsParseConstModifier=this.tsParseModifiers.bind(this,{allowedModifiers:["const"],disallowedModifiers:["in","out"],errorTemplate:e4.InvalidModifierOnTypeParameterPositions}),this.tsParseInOutConstModifiers=this.tsParseModifiers.bind(this,{allowedModifiers:["in","out","const"],disallowedModifiers:["public","private","protected","readonly","declare","abstract","override"],errorTemplate:e4.InvalidModifierOnTypeParameter})}getScopeHandler(){return ev}tsIsIdentifier(){return L(this.state.type)}tsTokenCanFollowModifier(){return this.match(0)||this.match(5)||this.match(55)||this.match(21)||this.match(139)||this.isLiteralPropertyName()}tsNextTokenOnSameLineAndCanFollowModifier(){return this.next(),!this.hasPrecedingLineBreak()&&this.tsTokenCanFollowModifier()}tsNextTokenCanFollowModifier(){return this.match(106)?(this.next(),this.tsTokenCanFollowModifier()):this.tsNextTokenOnSameLineAndCanFollowModifier()}tsParseModifier(e,t,s){if(!L(this.state.type)&&58!==this.state.type&&75!==this.state.type)return;let r=this.state.value;if(e.includes(r)){if(s&&this.match(106)||t&&this.tsIsStartOfStaticBlocks())return;if(this.tsTryParse(this.tsNextTokenCanFollowModifier.bind(this)))return r}}tsParseModifiers({allowedModifiers:e,disallowedModifiers:t,stopOnStartOfClassStaticBlock:s,errorTemplate:r=e4.InvalidModifierOnTypeMember},i){let a=(e,t,s,r)=>{t===s&&i[r]&&this.raise(e4.InvalidModifiersOrder,e,{orderedModifiers:[s,r]})},o=(e,t,s,r)=>{(i[s]&&t===r||i[r]&&t===s)&&this.raise(e4.IncompatibleModifiers,e,{modifiers:[s,r]})};for(;;){let{startLoc:n}=this.state,l=this.tsParseModifier(e.concat(null!=t?t:[]),s,i.static);if(!l)break;if(e5(l))i.accessibility?this.raise(e4.DuplicateAccessibilityModifier,n,{modifier:l}):(a(n,l,l,"override"),a(n,l,l,"static"),a(n,l,l,"readonly"),i.accessibility=l);else"in"===l||"out"===l?(i[l]&&this.raise(e4.DuplicateModifier,n,{modifier:l}),i[l]=!0,a(n,l,"in","out")):(hasOwnProperty.call(i,l)?this.raise(e4.DuplicateModifier,n,{modifier:l}):(a(n,l,"static","readonly"),a(n,l,"static","override"),a(n,l,"override","readonly"),a(n,l,"abstract","override"),o(n,l,"declare","override"),o(n,l,"static","abstract")),i[l]=!0);null!=t&&t.includes(l)&&this.raise(r,n,{modifier:l})}}tsIsListTerminator(e){switch(e){case"EnumMembers":case"TypeMembers":return this.match(8);case"HeritageClauseElement":return this.match(5);case"TupleElementTypes":return this.match(3);case"TypeParametersOrArguments":return this.match(48)}}tsParseList(e,t){let s=[];for(;!this.tsIsListTerminator(e);)s.push(t());return s}tsParseDelimitedList(e,t,s){var r=this.tsParseDelimitedListWorker(e,t,!0,s);if(null==r)throw Error(`Unexpected ${r} value.`);return r}tsParseDelimitedListWorker(e,t,s,r){let i=[],a=-1;for(;!this.tsIsListTerminator(e);){a=-1;let r=t();if(null==r)return;if(i.push(r),this.eat(12)){a=this.state.lastTokStartLoc.index;continue}if(this.tsIsListTerminator(e))break;s&&this.expect(12);return}return r&&(r.value=a),i}tsParseBracketedList(e,t,s,r,i){r||(s?this.expect(0):this.expect(47));let a=this.tsParseDelimitedList(e,t,i);return s?this.expect(3):this.expect(48),a}tsParseImportType(){let e=this.startNode();return this.expect(83),this.expect(10),this.match(134)?e.argument=this.parseStringLiteral(this.state.value):(this.raise(e4.UnsupportedImportTypeArgument,this.state.startLoc),e.argument=super.parseExprAtom()),this.eat(12)?e.options=this.tsParseImportTypeOptions():e.options=null,this.expect(11),this.eat(16)&&(e.qualifier=this.tsParseEntityName(3)),this.match(47)&&(e.typeParameters=this.tsParseTypeArguments()),this.finishNode(e,"TSImportType")}tsParseImportTypeOptions(){let e=this.startNode();this.expect(5);let t=this.startNode();return this.isContextual(76)?(t.method=!1,t.key=this.parseIdentifier(!0),t.computed=!1,t.shorthand=!1):this.unexpected(null,76),this.expect(14),t.value=this.tsParseImportTypeWithPropertyValue(),e.properties=[this.finishObjectProperty(t)],this.eat(12),this.expect(8),this.finishNode(e,"ObjectExpression")}tsParseImportTypeWithPropertyValue(){let e=this.startNode(),t=[];for(this.expect(5);!this.match(8);){let e=this.state.type;L(e)||134===e?t.push(super.parsePropertyDefinition(null)):this.unexpected(),this.eat(12)}return e.properties=t,this.next(),this.finishNode(e,"ObjectExpression")}tsParseEntityName(e){let t;if(1&e&&this.match(78))if(2&e)t=this.parseIdentifier(!0);else{let e=this.startNode();this.next(),t=this.finishNode(e,"ThisExpression")}else t=this.parseIdentifier(!!(1&e));for(;this.eat(16);){let s=this.startNodeAtNode(t);s.left=t,s.right=this.parseIdentifier(!!(1&e)),t=this.finishNode(s,"TSQualifiedName")}return t}tsParseTypeReference(){let e=this.startNode();return e.typeName=this.tsParseEntityName(1),!this.hasPrecedingLineBreak()&&this.match(47)&&(e.typeParameters=this.tsParseTypeArguments()),this.finishNode(e,"TSTypeReference")}tsParseThisTypePredicate(e){this.next();let t=this.startNodeAtNode(e);return t.parameterName=e,t.typeAnnotation=this.tsParseTypeAnnotation(!1),t.asserts=!1,this.finishNode(t,"TSTypePredicate")}tsParseThisTypeNode(){let e=this.startNode();return this.next(),this.finishNode(e,"TSThisType")}tsParseTypeQuery(){let e=this.startNode();return this.expect(87),this.match(83)?e.exprName=this.tsParseImportType():e.exprName=this.tsParseEntityName(3),!this.hasPrecedingLineBreak()&&this.match(47)&&(e.typeParameters=this.tsParseTypeArguments()),this.finishNode(e,"TSTypeQuery")}tsParseTypeParameter(e){let t=this.startNode();return e(t),t.name=this.tsParseTypeParameterName(),t.constraint=this.tsEatThenParseType(81),t.default=this.tsEatThenParseType(29),this.finishNode(t,"TSTypeParameter")}tsTryParseTypeParameters(e){if(this.match(47))return this.tsParseTypeParameters(e)}tsParseTypeParameters(e){let t=this.startNode();this.match(47)||this.match(143)?this.next():this.unexpected();let s={value:-1};return t.params=this.tsParseBracketedList("TypeParametersOrArguments",this.tsParseTypeParameter.bind(this,e),!1,!0,s),0===t.params.length&&this.raise(e4.EmptyTypeParameters,t),-1!==s.value&&this.addExtra(t,"trailingComma",s.value),this.finishNode(t,"TSTypeParameterDeclaration")}tsFillSignature(e,t){let s=19===e,r="typeAnnotation";t.typeParameters=this.tsTryParseTypeParameters(this.tsParseConstModifier),this.expect(10),t.parameters=this.tsParseBindingListForSignature(),s?t[r]=this.tsParseTypeOrTypePredicateAnnotation(e):this.match(e)&&(t[r]=this.tsParseTypeOrTypePredicateAnnotation(e))}tsParseBindingListForSignature(){let e=super.parseBindingList(11,41,2);for(let t of e){let{type:e}=t;("AssignmentPattern"===e||"TSParameterProperty"===e)&&this.raise(e4.UnsupportedSignatureParameterKind,t,{type:e})}return e}tsParseTypeMemberSemicolon(){this.eat(12)||this.isLineTerminator()||this.expect(13)}tsParseSignatureMember(e,t){return this.tsFillSignature(14,t),this.tsParseTypeMemberSemicolon(),this.finishNode(t,e)}tsIsUnambiguouslyIndexSignature(){return this.next(),!!L(this.state.type)&&(this.next(),this.match(14))}tsTryParseIndexSignature(e){if(!(this.match(0)&&this.tsLookAhead(this.tsIsUnambiguouslyIndexSignature.bind(this))))return;this.expect(0);let t=this.parseIdentifier();t.typeAnnotation=this.tsParseTypeAnnotation(),this.resetEndLocation(t),this.expect(3),e.parameters=[t];let s=this.tsTryParseTypeAnnotation();return s&&(e.typeAnnotation=s),this.tsParseTypeMemberSemicolon(),this.finishNode(e,"TSIndexSignature")}tsParsePropertyOrMethodSignature(e,t){if(this.eat(17)&&(e.optional=!0),this.match(10)||this.match(47)){t&&this.raise(e4.ReadonlyForMethodSignature,e),e.kind&&this.match(47)&&this.raise(e4.AccessorCannotHaveTypeParameters,this.state.curPosition()),this.tsFillSignature(14,e),this.tsParseTypeMemberSemicolon();let s="parameters",r="typeAnnotation";if("get"===e.kind)e[s].length>0&&(this.raise(m.BadGetterArity,this.state.curPosition()),this.isThisParam(e[s][0])&&this.raise(e4.AccessorCannotDeclareThisParameter,this.state.curPosition()));else if("set"===e.kind){if(1!==e[s].length)this.raise(m.BadSetterArity,this.state.curPosition());else{let t=e[s][0];this.isThisParam(t)&&this.raise(e4.AccessorCannotDeclareThisParameter,this.state.curPosition()),"Identifier"===t.type&&t.optional&&this.raise(e4.SetAccessorCannotHaveOptionalParameter,this.state.curPosition()),"RestElement"===t.type&&this.raise(e4.SetAccessorCannotHaveRestParameter,this.state.curPosition())}e[r]&&this.raise(e4.SetAccessorCannotHaveReturnType,e[r])}else e.kind="method";return this.finishNode(e,"TSMethodSignature")}{t&&(e.readonly=!0);let s=this.tsTryParseTypeAnnotation();return s&&(e.typeAnnotation=s),this.tsParseTypeMemberSemicolon(),this.finishNode(e,"TSPropertySignature")}}tsParseTypeMember(){let e=this.startNode();if(this.match(10)||this.match(47))return this.tsParseSignatureMember("TSCallSignatureDeclaration",e);if(this.match(77)){let t=this.startNode();return(this.next(),this.match(10)||this.match(47))?this.tsParseSignatureMember("TSConstructSignatureDeclaration",e):(e.key=this.createIdentifier(t,"new"),this.tsParsePropertyOrMethodSignature(e,!1))}this.tsParseModifiers({allowedModifiers:["readonly"],disallowedModifiers:["declare","abstract","private","protected","public","static","override"]},e);let t=this.tsTryParseIndexSignature(e);return t||(super.parsePropertyName(e),!e.computed&&"Identifier"===e.key.type&&("get"===e.key.name||"set"===e.key.name)&&this.tsTokenCanFollowModifier()&&(e.kind=e.key.name,super.parsePropertyName(e),this.match(10)||this.match(47)||this.unexpected(null,10)),this.tsParsePropertyOrMethodSignature(e,!!e.readonly))}tsParseTypeLiteral(){let e=this.startNode();return e.members=this.tsParseObjectTypeMembers(),this.finishNode(e,"TSTypeLiteral")}tsParseObjectTypeMembers(){this.expect(5);let e=this.tsParseList("TypeMembers",this.tsParseTypeMember.bind(this));return this.expect(8),e}tsIsStartOfMappedType(){return(this.next(),this.eat(53))?this.isContextual(122):(this.isContextual(122)&&this.next(),!!this.match(0)&&(this.next(),!!this.tsIsIdentifier()&&(this.next(),this.match(58))))}tsParseMappedType(){let e=this.startNode();this.expect(5),this.match(53)?(e.readonly=this.state.value,this.next(),this.expectContextual(122)):this.eatContextual(122)&&(e.readonly=!0),this.expect(0);let t=this.startNode();return t.name=this.tsParseTypeParameterName(),t.constraint=this.tsExpectThenParseType(58),e.typeParameter=this.finishNode(t,"TSTypeParameter"),e.nameType=this.eatContextual(93)?this.tsParseType():null,this.expect(3),this.match(53)?(e.optional=this.state.value,this.next(),this.expect(17)):this.eat(17)&&(e.optional=!0),e.typeAnnotation=this.tsTryParseType(),this.semicolon(),this.expect(8),this.finishNode(e,"TSMappedType")}tsParseTupleType(){let e=this.startNode();e.elementTypes=this.tsParseBracketedList("TupleElementTypes",this.tsParseTupleElementType.bind(this),!0,!1);let t=!1;return e.elementTypes.forEach(e=>{let{type:s}=e;t&&"TSRestType"!==s&&"TSOptionalType"!==s&&!("TSNamedTupleMember"===s&&e.optional)&&this.raise(e4.OptionalTypeBeforeRequired,e),t||(t="TSNamedTupleMember"===s&&e.optional||"TSOptionalType"===s)}),this.finishNode(e,"TSTupleType")}tsParseTupleElementType(){let e,t,s,r,i=this.state.startLoc,a=this.eat(21),{startLoc:o}=this.state,n=O(this.state.type)?this.lookaheadCharCode():null;if(58===n)e=!0,s=!1,t=this.parseIdentifier(!0),this.expect(14),r=this.tsParseType();else if(63===n){s=!0;let i=this.state.value,a=this.tsParseNonArrayType();58===this.lookaheadCharCode()?(e=!0,t=this.createIdentifier(this.startNodeAt(o),i),this.expect(17),this.expect(14),r=this.tsParseType()):(e=!1,r=a,this.expect(17))}else r=this.tsParseType(),s=this.eat(17),e=this.eat(14);if(e){let e;t?((e=this.startNodeAt(o)).optional=s,e.label=t,e.elementType=r,this.eat(17)&&(e.optional=!0,this.raise(e4.TupleOptionalAfterType,this.state.lastTokStartLoc))):((e=this.startNodeAt(o)).optional=s,this.raise(e4.InvalidTupleMemberLabel,r),e.label=r,e.elementType=this.tsParseType()),r=this.finishNode(e,"TSNamedTupleMember")}else if(s){let e=this.startNodeAt(o);e.typeAnnotation=r,r=this.finishNode(e,"TSOptionalType")}if(a){let e=this.startNodeAt(i);e.typeAnnotation=r,r=this.finishNode(e,"TSRestType")}return r}tsParseParenthesizedType(){let e=this.startNode();return this.expect(10),e.typeAnnotation=this.tsParseType(),this.expect(11),this.finishNode(e,"TSParenthesizedType")}tsParseFunctionOrConstructorType(e,t){let s=this.startNode();return"TSConstructorType"===e&&(s.abstract=!!t,t&&this.next(),this.next()),this.tsInAllowConditionalTypesContext(()=>this.tsFillSignature(19,s)),this.finishNode(s,e)}tsParseLiteralTypeNode(){let e=this.startNode();switch(this.state.type){case 135:case 136:case 134:case 85:case 86:e.literal=super.parseExprAtom();break;default:this.unexpected()}return this.finishNode(e,"TSLiteralType")}tsParseTemplateLiteralType(){let e=this.startNode();return e.literal=super.parseTemplate(!1),this.finishNode(e,"TSLiteralType")}parseTemplateSubstitution(){return this.state.inType?this.tsParseType():super.parseTemplateSubstitution()}tsParseThisTypeOrThisTypePredicate(){let e=this.tsParseThisTypeNode();return this.isContextual(116)&&!this.hasPrecedingLineBreak()?this.tsParseThisTypePredicate(e):e}tsParseNonArrayType(){switch(this.state.type){case 134:case 135:case 136:case 85:case 86:return this.tsParseLiteralTypeNode();case 53:if("-"===this.state.value){let e=this.startNode(),t=this.lookahead();return 135!==t.type&&136!==t.type&&this.unexpected(),e.literal=this.parseMaybeUnary(),this.finishNode(e,"TSLiteralType")}break;case 78:return this.tsParseThisTypeOrThisTypePredicate();case 87:return this.tsParseTypeQuery();case 83:return this.tsParseImportType();case 5:return this.tsLookAhead(this.tsIsStartOfMappedType.bind(this))?this.tsParseMappedType():this.tsParseTypeLiteral();case 0:return this.tsParseTupleType();case 10:return this.tsParseParenthesizedType();case 25:case 24:return this.tsParseTemplateLiteralType();default:{let{type:e}=this.state;if(L(e)||88===e||84===e){let t=88===e?"TSVoidKeyword":84===e?"TSNullKeyword":function(e){switch(e){case"any":return"TSAnyKeyword";case"boolean":return"TSBooleanKeyword";case"bigint":return"TSBigIntKeyword";case"never":return"TSNeverKeyword";case"number":return"TSNumberKeyword";case"object":return"TSObjectKeyword";case"string":return"TSStringKeyword";case"symbol":return"TSSymbolKeyword";case"undefined":return"TSUndefinedKeyword";case"unknown":return"TSUnknownKeyword";default:return}}(this.state.value);if(void 0!==t&&46!==this.lookaheadCharCode()){let e=this.startNode();return this.next(),this.finishNode(e,t)}return this.tsParseTypeReference()}}}throw this.unexpected()}tsParseArrayTypeOrHigher(){let{startLoc:e}=this.state,t=this.tsParseNonArrayType();for(;!this.hasPrecedingLineBreak()&&this.eat(0);)if(this.match(3)){let s=this.startNodeAt(e);s.elementType=t,this.expect(3),t=this.finishNode(s,"TSArrayType")}else{let s=this.startNodeAt(e);s.objectType=t,s.indexType=this.tsParseType(),this.expect(3),t=this.finishNode(s,"TSIndexedAccessType")}return t}tsParseTypeOperator(){let e=this.startNode(),t=this.state.value;return this.next(),e.operator=t,e.typeAnnotation=this.tsParseTypeOperatorOrHigher(),"readonly"===t&&this.tsCheckTypeAnnotationForReadOnly(e),this.finishNode(e,"TSTypeOperator")}tsCheckTypeAnnotationForReadOnly(e){switch(e.typeAnnotation.type){case"TSTupleType":case"TSArrayType":return;default:this.raise(e4.UnexpectedReadonly,e)}}tsParseInferType(){let e=this.startNode();this.expectContextual(115);let t=this.startNode();return t.name=this.tsParseTypeParameterName(),t.constraint=this.tsTryParse(()=>this.tsParseConstraintForInferType()),e.typeParameter=this.finishNode(t,"TSTypeParameter"),this.finishNode(e,"TSInferType")}tsParseConstraintForInferType(){if(this.eat(81)){let e=this.tsInDisallowConditionalTypesContext(()=>this.tsParseType());if(this.state.inDisallowConditionalTypesContext||!this.match(17))return e}}tsParseTypeOperatorOrHigher(){var e;return(e=this.state.type)>=121&&e<=123&&!this.state.containsEsc?this.tsParseTypeOperator():this.isContextual(115)?this.tsParseInferType():this.tsInAllowConditionalTypesContext(()=>this.tsParseArrayTypeOrHigher())}tsParseUnionOrIntersectionType(e,t,s){let r=this.startNode(),i=this.eat(s),a=[];do a.push(t());while(this.eat(s))return 1!==a.length||i?(r.types=a,this.finishNode(r,e)):a[0]}tsParseIntersectionTypeOrHigher(){return this.tsParseUnionOrIntersectionType("TSIntersectionType",this.tsParseTypeOperatorOrHigher.bind(this),45)}tsParseUnionTypeOrHigher(){return this.tsParseUnionOrIntersectionType("TSUnionType",this.tsParseIntersectionTypeOrHigher.bind(this),43)}tsIsStartOfFunctionType(){return!!this.match(47)||this.match(10)&&this.tsLookAhead(this.tsIsUnambiguouslyStartOfFunctionType.bind(this))}tsSkipParameterStart(){if(L(this.state.type)||this.match(78))return this.next(),!0;if(this.match(5)){let{errors:e}=this.state,t=e.length;try{return this.parseObjectLike(8,!0),e.length===t}catch(e){return!1}}if(this.match(0)){this.next();let{errors:e}=this.state,t=e.length;try{return super.parseBindingList(3,93,1),e.length===t}catch(e){}}return!1}tsIsUnambiguouslyStartOfFunctionType(){if(this.next(),this.match(11)||this.match(21))return!0;if(this.tsSkipParameterStart()&&(this.match(14)||this.match(12)||this.match(17)||this.match(29)||this.match(11)&&(this.next(),this.match(19))))return!0;return!1}tsParseTypeOrTypePredicateAnnotation(e){return this.tsInType(()=>{let t=this.startNode();this.expect(e);let s=this.startNode(),r=!!this.tsTryParse(this.tsParseTypePredicateAsserts.bind(this));if(r&&this.match(78)){let e=this.tsParseThisTypeOrThisTypePredicate();return"TSThisType"===e.type?(s.parameterName=e,s.asserts=!0,s.typeAnnotation=null,e=this.finishNode(s,"TSTypePredicate")):(this.resetStartLocationFromNode(e,s),e.asserts=!0),t.typeAnnotation=e,this.finishNode(t,"TSTypeAnnotation")}let i=this.tsIsIdentifier()&&this.tsTryParse(this.tsParseTypePredicatePrefix.bind(this));if(!i)return r?(s.parameterName=this.parseIdentifier(),s.asserts=r,s.typeAnnotation=null,t.typeAnnotation=this.finishNode(s,"TSTypePredicate"),this.finishNode(t,"TSTypeAnnotation")):this.tsParseTypeAnnotation(!1,t);let a=this.tsParseTypeAnnotation(!1);return s.parameterName=i,s.typeAnnotation=a,s.asserts=r,t.typeAnnotation=this.finishNode(s,"TSTypePredicate"),this.finishNode(t,"TSTypeAnnotation")})}tsTryParseTypeOrTypePredicateAnnotation(){if(this.match(14))return this.tsParseTypeOrTypePredicateAnnotation(14)}tsTryParseTypeAnnotation(){if(this.match(14))return this.tsParseTypeAnnotation()}tsTryParseType(){return this.tsEatThenParseType(14)}tsParseTypePredicatePrefix(){let e=this.parseIdentifier();if(this.isContextual(116)&&!this.hasPrecedingLineBreak())return this.next(),e}tsParseTypePredicateAsserts(){if(109!==this.state.type)return!1;let e=this.state.containsEsc;return this.next(),(!!L(this.state.type)||!!this.match(78))&&(e&&this.raise(m.InvalidEscapedReservedWord,this.state.lastTokStartLoc,{reservedWord:"asserts"}),!0)}tsParseTypeAnnotation(e=!0,t=this.startNode()){return this.tsInType(()=>{e&&this.expect(14),t.typeAnnotation=this.tsParseType()}),this.finishNode(t,"TSTypeAnnotation")}tsParseType(){e2(this.state.inType);let e=this.tsParseNonConditionalType();if(this.state.inDisallowConditionalTypesContext||this.hasPrecedingLineBreak()||!this.eat(81))return e;let t=this.startNodeAtNode(e);return t.checkType=e,t.extendsType=this.tsInDisallowConditionalTypesContext(()=>this.tsParseNonConditionalType()),this.expect(17),t.trueType=this.tsInAllowConditionalTypesContext(()=>this.tsParseType()),this.expect(14),t.falseType=this.tsInAllowConditionalTypesContext(()=>this.tsParseType()),this.finishNode(t,"TSConditionalType")}isAbstractConstructorSignature(){return this.isContextual(124)&&this.isLookaheadContextual("new")}tsParseNonConditionalType(){return this.tsIsStartOfFunctionType()?this.tsParseFunctionOrConstructorType("TSFunctionType"):this.match(77)?this.tsParseFunctionOrConstructorType("TSConstructorType"):this.isAbstractConstructorSignature()?this.tsParseFunctionOrConstructorType("TSConstructorType",!0):this.tsParseUnionTypeOrHigher()}tsParseTypeAssertion(){this.getPluginOption("typescript","disallowAmbiguousJSXLike")&&this.raise(e4.ReservedTypeAssertion,this.state.startLoc);let e=this.startNode();return e.typeAnnotation=this.tsInType(()=>(this.next(),this.match(75)?this.tsParseTypeReference():this.tsParseType())),this.expect(48),e.expression=this.parseMaybeUnary(),this.finishNode(e,"TSTypeAssertion")}tsParseHeritageClause(e){let t=this.state.startLoc,s=this.tsParseDelimitedList("HeritageClauseElement",()=>{let e=this.startNode();return e.expression=this.tsParseEntityName(3),this.match(47)&&(e.typeParameters=this.tsParseTypeArguments()),this.finishNode(e,"TSExpressionWithTypeArguments")});return s.length||this.raise(e4.EmptyHeritageClauseType,t,{token:e}),s}tsParseInterfaceDeclaration(e,t={}){if(this.hasFollowingLineBreak())return null;this.expectContextual(129),t.declare&&(e.declare=!0),L(this.state.type)?(e.id=this.parseIdentifier(),this.checkIdentifier(e.id,130)):(e.id=null,this.raise(e4.MissingInterfaceName,this.state.startLoc)),e.typeParameters=this.tsTryParseTypeParameters(this.tsParseInOutConstModifiers),this.eat(81)&&(e.extends=this.tsParseHeritageClause("extends"));let s=this.startNode();return s.body=this.tsInType(this.tsParseObjectTypeMembers.bind(this)),e.body=this.finishNode(s,"TSInterfaceBody"),this.finishNode(e,"TSInterfaceDeclaration")}tsParseTypeAliasDeclaration(e){return e.id=this.parseIdentifier(),this.checkIdentifier(e.id,2),e.typeAnnotation=this.tsInType(()=>{if(e.typeParameters=this.tsTryParseTypeParameters(this.tsParseInOutModifiers),this.expect(29),this.isContextual(114)&&46!==this.lookaheadCharCode()){let e=this.startNode();return this.next(),this.finishNode(e,"TSIntrinsicKeyword")}return this.tsParseType()}),this.semicolon(),this.finishNode(e,"TSTypeAliasDeclaration")}tsInTopLevelContext(e){if(this.curContext()===b.brace)return e();{let t=this.state.context;this.state.context=[t[0]];try{return e()}finally{this.state.context=t}}}tsInType(e){let t=this.state.inType;this.state.inType=!0;try{return e()}finally{this.state.inType=t}}tsInDisallowConditionalTypesContext(e){let t=this.state.inDisallowConditionalTypesContext;this.state.inDisallowConditionalTypesContext=!0;try{return e()}finally{this.state.inDisallowConditionalTypesContext=t}}tsInAllowConditionalTypesContext(e){let t=this.state.inDisallowConditionalTypesContext;this.state.inDisallowConditionalTypesContext=!1;try{return e()}finally{this.state.inDisallowConditionalTypesContext=t}}tsEatThenParseType(e){if(this.match(e))return this.tsNextThenParseType()}tsExpectThenParseType(e){return this.tsInType(()=>(this.expect(e),this.tsParseType()))}tsNextThenParseType(){return this.tsInType(()=>(this.next(),this.tsParseType()))}tsParseEnumMember(){let e=this.startNode();return e.id=this.match(134)?super.parseStringLiteral(this.state.value):this.parseIdentifier(!0),this.eat(29)&&(e.initializer=super.parseMaybeAssignAllowIn()),this.finishNode(e,"TSEnumMember")}tsParseEnumDeclaration(e,t={}){return t.const&&(e.const=!0),t.declare&&(e.declare=!0),this.expectContextual(126),e.id=this.parseIdentifier(),this.checkIdentifier(e.id,e.const?8971:8459),this.expect(5),e.members=this.tsParseDelimitedList("EnumMembers",this.tsParseEnumMember.bind(this)),this.expect(8),this.finishNode(e,"TSEnumDeclaration")}tsParseEnumBody(){let e=this.startNode();return this.expect(5),e.members=this.tsParseDelimitedList("EnumMembers",this.tsParseEnumMember.bind(this)),this.expect(8),this.finishNode(e,"TSEnumBody")}tsParseModuleBlock(){let e=this.startNode();return this.scope.enter(0),this.expect(5),super.parseBlockOrModuleBlockBody(e.body=[],void 0,!0,8),this.scope.exit(),this.finishNode(e,"TSModuleBlock")}tsParseModuleOrNamespaceDeclaration(e,t=!1){if(e.id=this.parseIdentifier(),t||this.checkIdentifier(e.id,1024),this.eat(16)){let t=this.startNode();this.tsParseModuleOrNamespaceDeclaration(t,!0),e.body=t}else this.scope.enter(1024),this.prodParam.enter(0),e.body=this.tsParseModuleBlock(),this.prodParam.exit(),this.scope.exit();return this.finishNode(e,"TSModuleDeclaration")}tsParseAmbientExternalModuleDeclaration(e){return this.isContextual(112)?(e.kind="global",e.global=!0,e.id=this.parseIdentifier()):this.match(134)?(e.kind="module",e.id=super.parseStringLiteral(this.state.value)):this.unexpected(),this.match(5)?(this.scope.enter(1024),this.prodParam.enter(0),e.body=this.tsParseModuleBlock(),this.prodParam.exit(),this.scope.exit()):this.semicolon(),this.finishNode(e,"TSModuleDeclaration")}tsParseImportEqualsDeclaration(e,t,s){e.isExport=s||!1,e.id=t||this.parseIdentifier(),this.checkIdentifier(e.id,4096),this.expect(29);let r=this.tsParseModuleReference();return"type"===e.importKind&&"TSExternalModuleReference"!==r.type&&this.raise(e4.ImportAliasHasImportType,r),e.moduleReference=r,this.semicolon(),this.finishNode(e,"TSImportEqualsDeclaration")}tsIsExternalModuleReference(){return this.isContextual(119)&&40===this.lookaheadCharCode()}tsParseModuleReference(){return this.tsIsExternalModuleReference()?this.tsParseExternalModuleReference():this.tsParseEntityName(0)}tsParseExternalModuleReference(){let e=this.startNode();return this.expectContextual(119),this.expect(10),this.match(134)||this.unexpected(),e.expression=super.parseExprAtom(),this.expect(11),this.sawUnambiguousESM=!0,this.finishNode(e,"TSExternalModuleReference")}tsLookAhead(e){let t=this.state.clone(),s=e();return this.state=t,s}tsTryParseAndCatch(e){let t=this.tryParse(t=>e()||t());if(!t.aborted&&t.node)return t.error&&(this.state=t.failState),t.node}tsTryParse(e){let t=this.state.clone(),s=e();if(void 0!==s&&!1!==s)return s;this.state=t}tsTryParseDeclare(e){if(this.isLineTerminator())return;let t=this.state.type;return this.tsInAmbientContext(()=>{switch(t){case 68:return e.declare=!0,super.parseFunctionStatement(e,!1,!1);case 80:return e.declare=!0,this.parseClass(e,!0,!1);case 126:return this.tsParseEnumDeclaration(e,{declare:!0});case 112:return this.tsParseAmbientExternalModuleDeclaration(e);case 100:if(this.state.containsEsc)return;case 75:case 74:if(!this.match(75)||!this.isLookaheadContextual("enum"))return e.declare=!0,this.parseVarStatement(e,this.state.value,!0);return this.expect(75),this.tsParseEnumDeclaration(e,{const:!0,declare:!0});case 107:if(this.isUsing())return this.raise(e4.InvalidModifierOnUsingDeclaration,this.state.startLoc,"declare"),e.declare=!0,this.parseVarStatement(e,"using",!0);break;case 96:if(this.isAwaitUsing())return this.raise(e4.InvalidModifierOnAwaitUsingDeclaration,this.state.startLoc,"declare"),e.declare=!0,this.next(),this.parseVarStatement(e,"await using",!0);break;case 129:{let t=this.tsParseInterfaceDeclaration(e,{declare:!0});if(t)return t}default:if(L(t))return this.tsParseDeclaration(e,this.state.type,!0,null)}})}tsTryParseExportDeclaration(){return this.tsParseDeclaration(this.startNode(),this.state.type,!0,null)}tsParseDeclaration(e,t,s,r){switch(t){case 124:if(this.tsCheckLineTerminator(s)&&(this.match(80)||L(this.state.type)))return this.tsParseAbstractDeclaration(e,r);break;case 127:if(this.tsCheckLineTerminator(s)){if(this.match(134))return this.tsParseAmbientExternalModuleDeclaration(e);else if(L(this.state.type))return e.kind="module",this.tsParseModuleOrNamespaceDeclaration(e)}break;case 128:if(this.tsCheckLineTerminator(s)&&L(this.state.type))return e.kind="namespace",this.tsParseModuleOrNamespaceDeclaration(e);break;case 130:if(this.tsCheckLineTerminator(s)&&L(this.state.type))return this.tsParseTypeAliasDeclaration(e)}}tsCheckLineTerminator(e){return e?!this.hasFollowingLineBreak()&&(this.next(),!0):!this.isLineTerminator()}tsTryParseGenericAsyncArrowFunction(e){if(!this.match(47))return;let t=this.state.maybeInArrowParameters;this.state.maybeInArrowParameters=!0;let s=this.tsTryParseAndCatch(()=>{let t=this.startNodeAt(e);return t.typeParameters=this.tsParseTypeParameters(this.tsParseConstModifier),super.parseFunctionParams(t),t.returnType=this.tsTryParseTypeOrTypePredicateAnnotation(),this.expect(19),t});if(this.state.maybeInArrowParameters=t,s)return super.parseArrowExpression(s,null,!0)}tsParseTypeArgumentsInExpression(){if(47===this.reScan_lt())return this.tsParseTypeArguments()}tsParseTypeArguments(){let e=this.startNode();return e.params=this.tsInType(()=>this.tsInTopLevelContext(()=>(this.expect(47),this.tsParseDelimitedList("TypeParametersOrArguments",this.tsParseType.bind(this))))),0===e.params.length?this.raise(e4.EmptyTypeArguments,e):this.state.inType||this.curContext()!==b.brace||this.reScan_lt_gt(),this.expect(48),this.finishNode(e,"TSTypeParameterInstantiation")}tsIsDeclarationStart(){var e;return(e=this.state.type)>=124&&e<=130}isExportDefaultSpecifier(){return!this.tsIsDeclarationStart()&&super.isExportDefaultSpecifier()}parseBindingElement(e,t){let s=t.length?t[0].loc.start:this.state.startLoc,r={};this.tsParseModifiers({allowedModifiers:["public","private","protected","override","readonly"]},r);let i=r.accessibility,a=r.override,o=r.readonly;!(4&e)&&(i||o||a)&&this.raise(e4.UnexpectedParameterModifier,s);let n=this.parseMaybeDefault();2&e&&this.parseFunctionParamType(n);let l=this.parseMaybeDefault(n.loc.start,n);if(i||o||a){let e=this.startNodeAt(s);return t.length&&(e.decorators=t),i&&(e.accessibility=i),o&&(e.readonly=o),a&&(e.override=a),"Identifier"!==l.type&&"AssignmentPattern"!==l.type&&this.raise(e4.UnsupportedParameterPropertyKind,e),e.parameter=l,this.finishNode(e,"TSParameterProperty")}return t.length&&(n.decorators=t),l}isSimpleParameter(e){return"TSParameterProperty"===e.type&&super.isSimpleParameter(e.parameter)||super.isSimpleParameter(e)}tsDisallowOptionalPattern(e){for(let t of e.params)"Identifier"!==t.type&&t.optional&&!this.state.isAmbientContext&&this.raise(e4.PatternIsOptional,t)}setArrowFunctionParameters(e,t,s){super.setArrowFunctionParameters(e,t,s),this.tsDisallowOptionalPattern(e)}parseFunctionBodyAndFinish(e,t,s=!1){this.match(14)&&(e.returnType=this.tsParseTypeOrTypePredicateAnnotation(14));let r="FunctionDeclaration"===t?"TSDeclareFunction":"ClassMethod"===t||"ClassPrivateMethod"===t?"TSDeclareMethod":void 0;return r&&!this.match(5)&&this.isLineTerminator()?this.finishNode(e,r):"TSDeclareFunction"===r&&this.state.isAmbientContext&&(this.raise(e4.DeclareFunctionHasImplementation,e),e.declare)?super.parseFunctionBodyAndFinish(e,r,s):(this.tsDisallowOptionalPattern(e),super.parseFunctionBodyAndFinish(e,t,s))}registerFunctionStatementId(e){!e.body&&e.id?this.checkIdentifier(e.id,1024):super.registerFunctionStatementId(e)}tsCheckForInvalidTypeCasts(e){e.forEach(e=>{(null==e?void 0:e.type)==="TSTypeCastExpression"&&this.raise(e4.UnexpectedTypeAnnotation,e.typeAnnotation)})}toReferencedList(e,t){return this.tsCheckForInvalidTypeCasts(e),e}parseArrayLike(e,t,s){let r=super.parseArrayLike(e,t,s);return"ArrayExpression"===r.type&&this.tsCheckForInvalidTypeCasts(r.elements),r}parseSubscript(e,t,s,r){if(!this.hasPrecedingLineBreak()&&this.match(35)){this.state.canStartJSXElement=!1,this.next();let s=this.startNodeAt(t);return s.expression=e,this.finishNode(s,"TSNonNullExpression")}let i=!1;if(this.match(18)&&60===this.lookaheadCharCode()){if(s)return r.stop=!0,e;r.optionalChainMember=i=!0,this.next()}if(this.match(47)||this.match(51)){let a,o=this.tsTryParseAndCatch(()=>{if(!s&&this.atPossibleAsyncArrow(e)){let e=this.tsTryParseGenericAsyncArrowFunction(t);if(e)return r.stop=!0,e}let o=this.tsParseTypeArgumentsInExpression();if(!o)return;if(i&&!this.match(10)){a=this.state.curPosition();return}if(j(this.state.type)){let s=super.parseTaggedTemplateExpression(e,t,r);return s.typeParameters=o,s}if(!s&&this.eat(10)){let s=this.startNodeAt(t);return s.callee=e,s.arguments=this.parseCallExpressionArguments(),this.tsCheckForInvalidTypeCasts(s.arguments),s.typeParameters=o,r.optionalChainMember&&(s.optional=i),this.finishCallExpression(s,r.optionalChainMember)}let n=this.state.type;if(48===n||52===n||10!==n&&93!==n&&120!==n&&I[n]&&!this.hasPrecedingLineBreak())return;let l=this.startNodeAt(t);return l.expression=e,l.typeParameters=o,this.finishNode(l,"TSInstantiationExpression")});if(a&&this.unexpected(a,10),o)return"TSInstantiationExpression"===o.type&&((this.match(16)||this.match(18)&&40!==this.lookaheadCharCode())&&this.raise(e4.InvalidPropertyAccessAfterInstantiationExpression,this.state.startLoc),this.match(16)||this.match(18)||(o.expression=super.stopParseSubscript(e,r))),o}return super.parseSubscript(e,t,s,r)}parseNewCallee(e){var t;super.parseNewCallee(e);let{callee:s}=e;"TSInstantiationExpression"!==s.type||null!=(t=s.extra)&&t.parenthesized||(e.typeParameters=s.typeParameters,e.callee=s.expression)}parseExprOp(e,t,s){let r;if(C[58]>s&&!this.hasPrecedingLineBreak()&&(this.isContextual(93)||(r=this.isContextual(120)))){let i=this.startNodeAt(t);return i.expression=e,i.typeAnnotation=this.tsInType(()=>(this.next(),this.match(75))?(r&&this.raise(m.UnexpectedKeyword,this.state.startLoc,{keyword:"const"}),this.tsParseTypeReference()):this.tsParseType()),this.finishNode(i,r?"TSSatisfiesExpression":"TSAsExpression"),this.reScan_lt_gt(),this.parseExprOp(i,t,s)}return super.parseExprOp(e,t,s)}checkReservedWord(e,t,s,r){this.state.isAmbientContext||super.checkReservedWord(e,t,s,r)}checkImportReflection(e){super.checkImportReflection(e),e.module&&"value"!==e.importKind&&this.raise(e4.ImportReflectionHasImportType,e.specifiers[0].loc.start)}checkDuplicateExports(){}isPotentialImportPhase(e){if(super.isPotentialImportPhase(e))return!0;if(this.isContextual(130)){let t=this.lookaheadCharCode();return e?123===t||42===t:61!==t}return!e&&this.isContextual(87)}applyImportPhase(e,t,s,r){super.applyImportPhase(e,t,s,r),t?e.exportKind="type"===s?"type":"value":e.importKind="type"===s||"typeof"===s?s:"value"}parseImport(e){let t;if(this.match(134))return e.importKind="value",super.parseImport(e);if(L(this.state.type)&&61===this.lookaheadCharCode())return e.importKind="value",this.tsParseImportEqualsDeclaration(e);if(this.isContextual(130)){let s=this.parseMaybeImportPhase(e,!1);if(61===this.lookaheadCharCode())return this.tsParseImportEqualsDeclaration(e,s);t=super.parseImportSpecifiersAndAfter(e,s)}else t=super.parseImport(e);return"type"===t.importKind&&t.specifiers.length>1&&"ImportDefaultSpecifier"===t.specifiers[0].type&&this.raise(e4.TypeImportCannotSpecifyDefaultAndNamed,t),t}parseExport(e,t){if(this.match(83)){this.next();let t=null;return this.isContextual(130)&&this.isPotentialImportPhase(!1)?t=this.parseMaybeImportPhase(e,!1):e.importKind="value",this.tsParseImportEqualsDeclaration(e,t,!0)}return this.eat(29)?(e.expression=super.parseExpression(),this.semicolon(),this.sawUnambiguousESM=!0,this.finishNode(e,"TSExportAssignment")):this.eatContextual(93)?(this.expectContextual(128),e.id=this.parseIdentifier(),this.semicolon(),this.finishNode(e,"TSNamespaceExportDeclaration")):super.parseExport(e,t)}isAbstractClass(){return this.isContextual(124)&&this.isLookaheadContextual("class")}parseExportDefaultExpression(){if(this.isAbstractClass()){let e=this.startNode();return this.next(),e.abstract=!0,this.parseClass(e,!0,!0)}if(this.match(129)){let e=this.tsParseInterfaceDeclaration(this.startNode());if(e)return e}return super.parseExportDefaultExpression()}parseVarStatement(e,t,s=!1){let{isAmbientContext:r}=this.state,i=super.parseVarStatement(e,t,s||r);if(!r)return i;if(!e.declare&&("using"===t||"await using"===t))return this.raiseOverwrite(e4.UsingDeclarationInAmbientContext,e,t),i;for(let{id:e,init:s}of i.declarations)s&&("var"===t||"let"===t||e.typeAnnotation?this.raise(e4.InitializerNotAllowedInAmbientContext,s):!function(e,t){var s;let{type:r}=e;if(null!=(s=e.extra)&&s.parenthesized)return!1;if(t){if("Literal"===r){let{value:t}=e;if("string"==typeof t||"boolean"==typeof t)return!0}}else if("StringLiteral"===r||"BooleanLiteral"===r)return!0;return!!(e3(e,t)||function(e,t){if("UnaryExpression"===e.type){let{operator:s,argument:r}=e;if("-"===s&&e3(r,t))return!0}return!1}(e,t)||"TemplateLiteral"===r&&0===e.expressions.length||function(e){if("MemberExpression"!==e.type)return!1;let{computed:t,property:s}=e;return(!t||"StringLiteral"===s.type||"TemplateLiteral"===s.type&&!(s.expressions.length>0))&&function e(t){return"Identifier"===t.type||"MemberExpression"===t.type&&!t.computed&&e(t.object)}(e.object)}(e))}(s,this.hasPlugin("estree"))&&this.raise(e4.ConstInitializerMustBeStringOrNumericLiteralOrLiteralEnumReference,s));return i}parseStatementContent(e,t){if(!this.state.containsEsc)switch(this.state.type){case 75:if(this.isLookaheadContextual("enum")){let e=this.startNode();return this.expect(75),this.tsParseEnumDeclaration(e,{const:!0})}break;case 124:case 125:if(this.nextTokenIsIdentifierAndNotTSRelationalOperatorOnSameLine()){let e=this.state.type,s=this.startNode();this.next();let r=125===e?this.tsTryParseDeclare(s):this.tsParseAbstractDeclaration(s,t);if(r)return 125===e&&(r.declare=!0),r;return s.expression=this.createIdentifier(this.startNodeAt(s.loc.start),125===e?"declare":"abstract"),this.semicolon(!1),this.finishNode(s,"ExpressionStatement")}break;case 126:return this.tsParseEnumDeclaration(this.startNode());case 112:if(123===this.lookaheadCharCode()){let e=this.startNode();return this.tsParseAmbientExternalModuleDeclaration(e)}break;case 129:{let e=this.tsParseInterfaceDeclaration(this.startNode());if(e)return e;break}case 127:if(this.nextTokenIsIdentifierOrStringLiteralOnSameLine()){let e=this.startNode();return this.next(),this.tsParseDeclaration(e,127,!1,t)}break;case 128:if(this.nextTokenIsIdentifierOnSameLine()){let e=this.startNode();return this.next(),this.tsParseDeclaration(e,128,!1,t)}break;case 130:if(this.nextTokenIsIdentifierOnSameLine()){let e=this.startNode();return this.next(),this.tsParseTypeAliasDeclaration(e)}}return super.parseStatementContent(e,t)}parseAccessModifier(){return this.tsParseModifier(["public","protected","private"])}tsHasSomeModifiers(e,t){return t.some(t=>e5(t)?e.accessibility===t:!!e[t])}tsIsStartOfStaticBlocks(){return this.isContextual(106)&&123===this.lookaheadCharCode()}parseClassMember(e,t,s){let r=["declare","private","public","protected","override","abstract","readonly","static"];this.tsParseModifiers({allowedModifiers:r,disallowedModifiers:["in","out"],stopOnStartOfClassStaticBlock:!0,errorTemplate:e4.InvalidModifierOnTypeParameterPositions},t);let i=()=>{this.tsIsStartOfStaticBlocks()?(this.next(),this.next(),this.tsHasSomeModifiers(t,r)&&this.raise(e4.StaticBlockCannotHaveModifier,this.state.curPosition()),super.parseClassStaticBlock(e,t)):this.parseClassMemberWithIsStatic(e,t,s,!!t.static)};t.declare?this.tsInAmbientContext(i):i()}parseClassMemberWithIsStatic(e,t,s,r){let i=this.tsTryParseIndexSignature(t);if(i){e.body.push(i),t.abstract&&this.raise(e4.IndexSignatureHasAbstract,t),t.accessibility&&this.raise(e4.IndexSignatureHasAccessibility,t,{modifier:t.accessibility}),t.declare&&this.raise(e4.IndexSignatureHasDeclare,t),t.override&&this.raise(e4.IndexSignatureHasOverride,t);return}!this.state.inAbstractClass&&t.abstract&&this.raise(e4.NonAbstractClassHasAbstractMethod,t),t.override&&!s.hadSuperClass&&this.raise(e4.OverrideNotInSubClass,t),super.parseClassMemberWithIsStatic(e,t,s,r)}parsePostMemberNameModifiers(e){this.eat(17)&&(e.optional=!0),e.readonly&&this.match(10)&&this.raise(e4.ClassMethodHasReadonly,e),e.declare&&this.match(10)&&this.raise(e4.ClassMethodHasDeclare,e)}shouldParseExportDeclaration(){return!!this.tsIsDeclarationStart()||super.shouldParseExportDeclaration()}parseConditional(e,t,s){if(!this.match(17))return e;if(this.state.maybeInArrowParameters){let t=this.lookaheadCharCode();if(44===t||61===t||58===t||41===t)return this.setOptionalParametersError(s),e}return super.parseConditional(e,t,s)}parseParenItem(e,t){let s=super.parseParenItem(e,t);if(this.eat(17)&&(s.optional=!0,this.resetEndLocation(e)),this.match(14)){let s=this.startNodeAt(t);return s.expression=e,s.typeAnnotation=this.tsParseTypeAnnotation(),this.finishNode(s,"TSTypeCastExpression")}return e}parseExportDeclaration(e){if(!this.state.isAmbientContext&&this.isContextual(125))return this.tsInAmbientContext(()=>this.parseExportDeclaration(e));let t=this.state.startLoc,s=this.eatContextual(125);if(s&&(this.isContextual(125)||!this.shouldParseExportDeclaration()))throw this.raise(e4.ExpectedAmbientAfterExportDeclare,this.state.startLoc);let r=L(this.state.type)&&this.tsTryParseExportDeclaration()||super.parseExportDeclaration(e);return r?(("TSInterfaceDeclaration"===r.type||"TSTypeAliasDeclaration"===r.type||s)&&(e.exportKind="type"),s&&"TSImportEqualsDeclaration"!==r.type&&(this.resetStartLocation(r,t),r.declare=!0),r):null}parseClassId(e,t,s,r){if((!t||s)&&this.isContextual(113))return;super.parseClassId(e,t,s,e.declare?1024:8331);let i=this.tsTryParseTypeParameters(this.tsParseInOutConstModifiers);i&&(e.typeParameters=i)}parseClassPropertyAnnotation(e){!e.optional&&(this.eat(35)?e.definite=!0:this.eat(17)&&(e.optional=!0));let t=this.tsTryParseTypeAnnotation();t&&(e.typeAnnotation=t)}parseClassProperty(e){if(this.parseClassPropertyAnnotation(e),this.state.isAmbientContext&&!(e.readonly&&!e.typeAnnotation)&&this.match(29)&&this.raise(e4.DeclareClassFieldHasInitializer,this.state.startLoc),e.abstract&&this.match(29)){let{key:t}=e;this.raise(e4.AbstractPropertyHasInitializer,this.state.startLoc,{propertyName:"Identifier"!==t.type||e.computed?`[${this.input.slice(this.offsetToSourcePos(t.start),this.offsetToSourcePos(t.end))}]`:t.name})}return super.parseClassProperty(e)}parseClassPrivateProperty(e){return e.abstract&&this.raise(e4.PrivateElementHasAbstract,e),e.accessibility&&this.raise(e4.PrivateElementHasAccessibility,e,{modifier:e.accessibility}),this.parseClassPropertyAnnotation(e),super.parseClassPrivateProperty(e)}parseClassAccessorProperty(e){return this.parseClassPropertyAnnotation(e),e.optional&&this.raise(e4.AccessorCannotBeOptional,e),super.parseClassAccessorProperty(e)}pushClassMethod(e,t,s,r,i,a){let o=this.tsTryParseTypeParameters(this.tsParseConstModifier);o&&i&&this.raise(e4.ConstructorHasTypeParameters,o);let{declare:n=!1,kind:l}=t;n&&("get"===l||"set"===l)&&this.raise(e4.DeclareAccessor,t,{kind:l}),o&&(t.typeParameters=o),super.pushClassMethod(e,t,s,r,i,a)}pushClassPrivateMethod(e,t,s,r){let i=this.tsTryParseTypeParameters(this.tsParseConstModifier);i&&(t.typeParameters=i),super.pushClassPrivateMethod(e,t,s,r)}declareClassPrivateMethodInScope(e,t){"TSDeclareMethod"===e.type||("MethodDefinition"!==e.type||null!=e.value.body)&&super.declareClassPrivateMethodInScope(e,t)}parseClassSuper(e){if(super.parseClassSuper(e),e.superClass)if("TSInstantiationExpression"===e.superClass.type){let t=e.superClass,s=t.expression;this.takeSurroundingComments(s,s.start,s.end);let r=t.typeParameters;this.takeSurroundingComments(r,r.start,r.end),e.superClass=s,e.superTypeParameters=r}else(this.match(47)||this.match(51))&&(e.superTypeParameters=this.tsParseTypeArgumentsInExpression());this.eatContextual(113)&&(e.implements=this.tsParseHeritageClause("implements"))}parseObjPropValue(e,t,s,r,i,a,o){let n=this.tsTryParseTypeParameters(this.tsParseConstModifier);return n&&(e.typeParameters=n),super.parseObjPropValue(e,t,s,r,i,a,o)}parseFunctionParams(e,t){let s=this.tsTryParseTypeParameters(this.tsParseConstModifier);s&&(e.typeParameters=s),super.parseFunctionParams(e,t)}parseVarId(e,t){super.parseVarId(e,t),"Identifier"===e.id.type&&!this.hasPrecedingLineBreak()&&this.eat(35)&&(e.definite=!0);let s=this.tsTryParseTypeAnnotation();s&&(e.id.typeAnnotation=s,this.resetEndLocation(e.id))}parseAsyncArrowFromCallExpression(e,t){return this.match(14)&&(e.returnType=this.tsParseTypeAnnotation()),super.parseAsyncArrowFromCallExpression(e,t)}parseMaybeAssign(e,t){var s,r,i,a,o;let n,l,p,c;if(this.hasPlugin("jsx")&&(this.match(143)||this.match(47))){if(n=this.state.clone(),!(l=this.tryParse(()=>super.parseMaybeAssign(e,t),n)).error)return l.node;let{context:s}=this.state,r=s[s.length-1];(r===b.j_oTag||r===b.j_expr)&&s.pop()}if(!(null!=(s=l)&&s.error)&&!this.match(47))return super.parseMaybeAssign(e,t);n&&n!==this.state||(n=this.state.clone());let h=this.tryParse(s=>{var r,i;c=this.tsParseTypeParameters(this.tsParseConstModifier);let a=super.parseMaybeAssign(e,t);return("ArrowFunctionExpression"!==a.type||null!=(r=a.extra)&&r.parenthesized)&&s(),(null==(i=c)?void 0:i.params.length)!==0&&this.resetStartLocationFromNode(a,c),a.typeParameters=c,a},n);if(!h.error&&!h.aborted)return c&&this.reportReservedArrowTypeParam(c),h.node;if(!l&&(e2(!this.hasPlugin("jsx")),!(p=this.tryParse(()=>super.parseMaybeAssign(e,t),n)).error))return p.node;if(null!=(r=l)&&r.node)return this.state=l.failState,l.node;if(h.node)return this.state=h.failState,c&&this.reportReservedArrowTypeParam(c),h.node;if(null!=(i=p)&&i.node)return this.state=p.failState,p.node;throw(null==(a=l)?void 0:a.error)||h.error||(null==(o=p)?void 0:o.error)}reportReservedArrowTypeParam(e){var t;1===e.params.length&&!e.params[0].constraint&&!(null!=(t=e.extra)&&t.trailingComma)&&this.getPluginOption("typescript","disallowAmbiguousJSXLike")&&this.raise(e4.ReservedArrowTypeParam,e)}parseMaybeUnary(e,t){return!this.hasPlugin("jsx")&&this.match(47)?this.tsParseTypeAssertion():super.parseMaybeUnary(e,t)}parseArrow(e){if(this.match(14)){let t=this.tryParse(e=>{let t=this.tsParseTypeOrTypePredicateAnnotation(14);return(this.canInsertSemicolon()||!this.match(19))&&e(),t});if(t.aborted)return;t.thrown||(t.error&&(this.state=t.failState),e.returnType=t.node)}return super.parseArrow(e)}parseFunctionParamType(e){this.eat(17)&&(e.optional=!0);let t=this.tsTryParseTypeAnnotation();return t&&(e.typeAnnotation=t),this.resetEndLocation(e),e}isAssignable(e,t){switch(e.type){case"TSTypeCastExpression":return this.isAssignable(e.expression,t);case"TSParameterProperty":return!0;default:return super.isAssignable(e,t)}}toAssignable(e,t=!1){switch(e.type){case"ParenthesizedExpression":this.toAssignableParenthesizedExpression(e,t);break;case"TSAsExpression":case"TSSatisfiesExpression":case"TSNonNullExpression":case"TSTypeAssertion":t?this.expressionScope.recordArrowParameterBindingError(e4.UnexpectedTypeCastInParameter,e):this.raise(e4.UnexpectedTypeCastInParameter,e),this.toAssignable(e.expression,t);break;case"AssignmentExpression":t||"TSTypeCastExpression"!==e.left.type||(e.left=this.typeCastToParameter(e.left));default:super.toAssignable(e,t)}}toAssignableParenthesizedExpression(e,t){switch(e.expression.type){case"TSAsExpression":case"TSSatisfiesExpression":case"TSNonNullExpression":case"TSTypeAssertion":case"ParenthesizedExpression":this.toAssignable(e.expression,t);break;default:super.toAssignable(e,t)}}checkToRestConversion(e,t){switch(e.type){case"TSAsExpression":case"TSSatisfiesExpression":case"TSTypeAssertion":case"TSNonNullExpression":this.checkToRestConversion(e.expression,!1);break;default:super.checkToRestConversion(e,t)}}isValidLVal(e,t,s,r){switch(e){case"TSTypeCastExpression":return!0;case"TSParameterProperty":return"parameter";case"TSNonNullExpression":return"expression";case"TSAsExpression":case"TSSatisfiesExpression":case"TSTypeAssertion":return(64!==r||!s)&&["expression",!0];default:return super.isValidLVal(e,t,s,r)}}parseBindingAtom(){return 78===this.state.type?this.parseIdentifier(!0):super.parseBindingAtom()}parseMaybeDecoratorArguments(e,t){if(this.match(47)||this.match(51)){let s=this.tsParseTypeArgumentsInExpression();if(this.match(10)){let r=super.parseMaybeDecoratorArguments(e,t);return r.typeParameters=s,r}this.unexpected(null,10)}return super.parseMaybeDecoratorArguments(e,t)}checkCommaAfterRest(e){return this.state.isAmbientContext&&this.match(12)&&this.lookaheadCharCode()===e?(this.next(),!1):super.checkCommaAfterRest(e)}isClassMethod(){return this.match(47)||super.isClassMethod()}isClassProperty(){return this.match(35)||this.match(14)||super.isClassProperty()}parseMaybeDefault(e,t){let s=super.parseMaybeDefault(e,t);return"AssignmentPattern"===s.type&&s.typeAnnotation&&s.right.start<s.typeAnnotation.start&&this.raise(e4.TypeAnnotationAfterAssign,s.typeAnnotation),s}getTokenFromCode(e){if(this.state.inType){if(62===e)return void this.finishOp(48,1);if(60===e)return void this.finishOp(47,1)}super.getTokenFromCode(e)}reScan_lt_gt(){let{type:e}=this.state;47===e?(this.state.pos-=1,this.readToken_lt()):48===e&&(this.state.pos-=1,this.readToken_gt())}reScan_lt(){let{type:e}=this.state;return 51===e?(this.state.pos-=2,this.finishOp(47,1),47):e}toAssignableListItem(e,t,s){let r=e[t];"TSTypeCastExpression"===r.type&&(e[t]=this.typeCastToParameter(r)),super.toAssignableListItem(e,t,s)}typeCastToParameter(e){return e.expression.typeAnnotation=e.typeAnnotation,this.resetEndLocation(e.expression,e.typeAnnotation.loc.end),e.expression}shouldParseArrow(e){return this.match(14)?e.every(e=>this.isAssignable(e,!0)):super.shouldParseArrow(e)}shouldParseAsyncArrow(){return this.match(14)||super.shouldParseAsyncArrow()}canHaveLeadingDecorator(){return super.canHaveLeadingDecorator()||this.isAbstractClass()}jsxParseOpeningElementAfterName(e){if(this.match(47)||this.match(51)){let t=this.tsTryParseAndCatch(()=>this.tsParseTypeArgumentsInExpression());t&&(e.typeParameters=t)}return super.jsxParseOpeningElementAfterName(e)}getGetterSetterExpectedParamCount(e){let t=super.getGetterSetterExpectedParamCount(e),s=this.getObjectOrClassMethodParams(e)[0];return s&&this.isThisParam(s)?t+1:t}parseCatchClauseParam(){let e=super.parseCatchClauseParam(),t=this.tsTryParseTypeAnnotation();return t&&(e.typeAnnotation=t,this.resetEndLocation(e)),e}tsInAmbientContext(e){let{isAmbientContext:t,strict:s}=this.state;this.state.isAmbientContext=!0,this.state.strict=!1;try{return e()}finally{this.state.isAmbientContext=t,this.state.strict=s}}parseClass(e,t,s){let r=this.state.inAbstractClass;this.state.inAbstractClass=!!e.abstract;try{return super.parseClass(e,t,s)}finally{this.state.inAbstractClass=r}}tsParseAbstractDeclaration(e,t){if(this.match(80))return e.abstract=!0,this.maybeTakeDecorators(t,this.parseClass(e,!0,!1));if(this.isContextual(129))if(!this.hasFollowingLineBreak())return e.abstract=!0,this.raise(e4.NonClassMethodPropertyHasAbstractModifier,e),this.tsParseInterfaceDeclaration(e);else return null;throw this.unexpected(null,80)}parseMethod(e,t,s,r,i,a,o){let n=super.parseMethod(e,t,s,r,i,a,o);if((n.abstract||"TSAbstractMethodDefinition"===n.type)&&(this.hasPlugin("estree")?n.value:n).body){let{key:e}=n;this.raise(e4.AbstractMethodHasImplementation,n,{methodName:"Identifier"!==e.type||n.computed?`[${this.input.slice(this.offsetToSourcePos(e.start),this.offsetToSourcePos(e.end))}]`:e.name})}return n}tsParseTypeParameterName(){return this.parseIdentifier().name}shouldParseAsAmbientContext(){return!!this.getPluginOption("typescript","dts")}parse(){return this.shouldParseAsAmbientContext()&&(this.state.isAmbientContext=!0),super.parse()}getExpression(){return this.shouldParseAsAmbientContext()&&(this.state.isAmbientContext=!0),super.getExpression()}parseExportSpecifier(e,t,s,r){return!t&&r?(this.parseTypeOnlyImportExportSpecifier(e,!1,s),this.finishNode(e,"ExportSpecifier")):(e.exportKind="value",super.parseExportSpecifier(e,t,s,r))}parseImportSpecifier(e,t,s,r,i){return!t&&r?(this.parseTypeOnlyImportExportSpecifier(e,!0,s),this.finishNode(e,"ImportSpecifier")):(e.importKind="value",super.parseImportSpecifier(e,t,s,r,s?4098:4096))}parseTypeOnlyImportExportSpecifier(e,t,s){let r,i=t?"imported":"local",a=t?"local":"exported",o=e[i],n=!1,l=!0,p=o.loc.start;if(this.isContextual(93)){let e=this.parseIdentifier();if(this.isContextual(93)){let s=this.parseIdentifier();O(this.state.type)?(n=!0,o=e,r=t?this.parseIdentifier():this.parseModuleExportName()):r=s,l=!1}else O(this.state.type)?(l=!1,r=t?this.parseIdentifier():this.parseModuleExportName()):(n=!0,o=e)}else O(this.state.type)&&(n=!0,t?(o=this.parseIdentifier(!0),this.isContextual(93)||this.checkReservedWord(o.name,o.loc.start,!0,!0)):o=this.parseModuleExportName());n&&s&&this.raise(t?e4.TypeModifierIsUsedInTypeImports:e4.TypeModifierIsUsedInTypeExports,p),e[i]=o,e[a]=r,e[t?"importKind":"exportKind"]=n?"type":"value",l&&this.eatContextual(93)&&(e[a]=t?this.parseIdentifier():this.parseModuleExportName()),e[a]||(e[a]=this.cloneIdentifier(e[i])),t&&this.checkIdentifier(e[a],n?4098:4096)}fillOptionalPropertiesForTSESLint(e){switch(e.type){case"ExpressionStatement":null!=e.directive||(e.directive=void 0);return;case"RestElement":e.value=void 0;case"Identifier":case"ArrayPattern":case"AssignmentPattern":case"ObjectPattern":null!=e.decorators||(e.decorators=[]),null!=e.optional||(e.optional=!1),null!=e.typeAnnotation||(e.typeAnnotation=void 0);return;case"TSParameterProperty":null!=e.accessibility||(e.accessibility=void 0),null!=e.decorators||(e.decorators=[]),null!=e.override||(e.override=!1),null!=e.readonly||(e.readonly=!1),null!=e.static||(e.static=!1);return;case"TSEmptyBodyFunctionExpression":e.body=null;case"TSDeclareFunction":case"FunctionDeclaration":case"FunctionExpression":case"ClassMethod":case"ClassPrivateMethod":null!=e.declare||(e.declare=!1),null!=e.returnType||(e.returnType=void 0),null!=e.typeParameters||(e.typeParameters=void 0);return;case"Property":null!=e.optional||(e.optional=!1);return;case"TSMethodSignature":case"TSPropertySignature":null!=e.optional||(e.optional=!1);case"TSIndexSignature":null!=e.accessibility||(e.accessibility=void 0),null!=e.readonly||(e.readonly=!1),null!=e.static||(e.static=!1);return;case"TSAbstractPropertyDefinition":case"PropertyDefinition":case"TSAbstractAccessorProperty":case"AccessorProperty":null!=e.declare||(e.declare=!1),null!=e.definite||(e.definite=!1),null!=e.readonly||(e.readonly=!1),null!=e.typeAnnotation||(e.typeAnnotation=void 0);case"TSAbstractMethodDefinition":case"MethodDefinition":null!=e.accessibility||(e.accessibility=void 0),null!=e.decorators||(e.decorators=[]),null!=e.override||(e.override=!1),null!=e.optional||(e.optional=!1);return;case"ClassExpression":null!=e.id||(e.id=null);case"ClassDeclaration":null!=e.abstract||(e.abstract=!1),null!=e.declare||(e.declare=!1),null!=e.decorators||(e.decorators=[]),null!=e.implements||(e.implements=[]),null!=e.superTypeArguments||(e.superTypeArguments=void 0),null!=e.typeParameters||(e.typeParameters=void 0);return;case"TSTypeAliasDeclaration":case"VariableDeclaration":null!=e.declare||(e.declare=!1);return;case"VariableDeclarator":null!=e.definite||(e.definite=!1);return;case"TSEnumDeclaration":null!=e.const||(e.const=!1),null!=e.declare||(e.declare=!1);return;case"TSEnumMember":null!=e.computed||(e.computed=!1);return;case"TSImportType":null!=e.qualifier||(e.qualifier=null),null!=e.options||(e.options=null);return;case"TSInterfaceDeclaration":null!=e.declare||(e.declare=!1),null!=e.extends||(e.extends=[]);return;case"TSMappedType":null!=e.optional||(e.optional=!1),null!=e.readonly||(e.readonly=void 0);return;case"TSModuleDeclaration":null!=e.declare||(e.declare=!1),null!=e.global||(e.global="global"===e.kind);return;case"TSTypeParameter":null!=e.const||(e.const=!1),null!=e.in||(e.in=!1),null!=e.out||(e.out=!1);return}}chStartsBindingIdentifierAndNotRelationalOperator(e,t){if(G(e)){if(e1.lastIndex=t,e1.test(this.input)){let e=this.codePointAtPos(e1.lastIndex);if(!K(e)&&92!==e)return!1}return!0}return 92===e||!1}nextTokenIsIdentifierAndNotTSRelationalOperatorOnSameLine(){let e=this.nextTokenInLineStart(),t=this.codePointAtPos(e);return this.chStartsBindingIdentifierAndNotRelationalOperator(t,e)}nextTokenIsIdentifierOrStringLiteralOnSameLine(){let e=this.nextTokenInLineStart(),t=this.codePointAtPos(e);return this.chStartsBindingIdentifier(t,e)||34===t||39===t}},v8intrinsic:e=>class extends e{parseV8Intrinsic(){if(this.match(54)){let e=this.state.startLoc,t=this.startNode();if(this.next(),L(this.state.type)){let e=this.parseIdentifierName(),s=this.createIdentifier(t,e);if(this.castNodeTo(s,"V8IntrinsicIdentifier"),this.match(10))return s}this.unexpected(e)}}parseExprAtom(e){return this.parseV8Intrinsic()||super.parseExprAtom(e)}},placeholders:e=>class extends e{parsePlaceholder(e){if(this.match(133)){let t=this.startNode();return this.next(),this.assertNoSpace(),t.name=super.parseIdentifier(!0),this.assertNoSpace(),this.expect(133),this.finishPlaceholder(t,e)}}finishPlaceholder(e,t){let s=e;return s.expectedNode&&s.type||(s=this.finishNode(s,"Placeholder")),s.expectedNode=t,s}getTokenFromCode(e){37===e&&37===this.input.charCodeAt(this.state.pos+1)?this.finishOp(133,2):super.getTokenFromCode(e)}parseExprAtom(e){return this.parsePlaceholder("Expression")||super.parseExprAtom(e)}parseIdentifier(e){return this.parsePlaceholder("Identifier")||super.parseIdentifier(e)}checkReservedWord(e,t,s,r){void 0!==e&&super.checkReservedWord(e,t,s,r)}cloneIdentifier(e){let t=super.cloneIdentifier(e);return"Placeholder"===t.type&&(t.expectedNode=e.expectedNode),t}cloneStringLiteral(e){return"Placeholder"===e.type?this.cloneIdentifier(e):super.cloneStringLiteral(e)}parseBindingAtom(){return this.parsePlaceholder("Pattern")||super.parseBindingAtom()}isValidLVal(e,t,s,r){return"Placeholder"===e||super.isValidLVal(e,t,s,r)}toAssignable(e,t){e&&"Placeholder"===e.type&&"Expression"===e.expectedNode?e.expectedNode="Pattern":super.toAssignable(e,t)}chStartsBindingIdentifier(e,t){if(super.chStartsBindingIdentifier(e,t))return!0;let s=this.nextTokenStart();return 37===this.input.charCodeAt(s)&&37===this.input.charCodeAt(s+1)}verifyBreakContinue(e,t){var s;(null==(s=e.label)?void 0:s.type)!=="Placeholder"&&super.verifyBreakContinue(e,t)}parseExpressionStatement(e,t){var s;return"Placeholder"!==t.type||null!=(s=t.extra)&&s.parenthesized?super.parseExpressionStatement(e,t):this.match(14)?(e.label=this.finishPlaceholder(t,"Identifier"),this.next(),e.body=super.parseStatementOrSloppyAnnexBFunctionDeclaration(),this.finishNode(e,"LabeledStatement")):(this.semicolon(),e.name=t.name,this.finishPlaceholder(e,"Statement"))}parseBlock(e,t,s){return this.parsePlaceholder("BlockStatement")||super.parseBlock(e,t,s)}parseFunctionId(e){return this.parsePlaceholder("Identifier")||super.parseFunctionId(e)}parseClass(e,t,s){let r=t?"ClassDeclaration":"ClassExpression";this.next();let i=this.state.strict,a=this.parsePlaceholder("Identifier");if(a)if(this.match(81)||this.match(133)||this.match(5))e.id=a;else if(s||!t)return e.id=null,e.body=this.finishPlaceholder(a,"ClassBody"),this.finishNode(e,r);else throw this.raise(e8.ClassNameIsRequired,this.state.startLoc);else this.parseClassId(e,t,s);return super.parseClassSuper(e),e.body=this.parsePlaceholder("ClassBody")||super.parseClassBody(!!e.superClass,i),this.finishNode(e,r)}parseExport(e,t){let s=this.parsePlaceholder("Identifier");if(!s)return super.parseExport(e,t);if(!this.isContextual(98)&&!this.match(12))return e.specifiers=[],e.source=null,e.declaration=this.finishPlaceholder(s,"Declaration"),this.finishNode(e,"ExportNamedDeclaration");this.expectPlugin("exportDefaultFrom");let r=this.startNode();return r.exported=s,e.specifiers=[this.finishNode(r,"ExportDefaultSpecifier")],super.parseExport(e,t)}isExportDefaultSpecifier(){if(this.match(65)){let e=this.nextTokenStart();if(this.isUnparsedContextual(e,"from")&&this.input.startsWith(S[133],this.nextTokenStartSince(e+4)))return!0}return super.isExportDefaultSpecifier()}maybeParseExportDefaultSpecifier(e,t){var s;return null!=(s=e.specifiers)&&!!s.length||super.maybeParseExportDefaultSpecifier(e,t)}checkExport(e){let{specifiers:t}=e;null!=t&&t.length&&(e.specifiers=t.filter(e=>"Placeholder"===e.exported.type)),super.checkExport(e),e.specifiers=t}parseImport(e){let t=this.parsePlaceholder("Identifier");if(!t)return super.parseImport(e);if(e.specifiers=[],!this.isContextual(98)&&!this.match(12))return e.source=this.finishPlaceholder(t,"StringLiteral"),this.semicolon(),this.finishNode(e,"ImportDeclaration");let s=this.startNodeAtNode(t);return s.local=t,e.specifiers.push(this.finishNode(s,"ImportDefaultSpecifier")),this.eat(12)&&(this.maybeParseStarImportSpecifier(e)||this.parseNamedImportSpecifiers(e)),this.expectContextual(98),e.source=this.parseImportSource(),this.semicolon(),this.finishNode(e,"ImportDeclaration")}parseImportSource(){return this.parsePlaceholder("StringLiteral")||super.parseImportSource()}assertNoSpace(){this.state.start>this.offsetToSourcePos(this.state.lastTokEndLoc.index)&&this.raise(e8.UnexpectedSpace,this.state.lastTokEndLoc)}}},te=Object.keys(e7);class tt extends e0{checkProto(e,t,s,r){if("SpreadElement"===e.type||this.isObjectMethod(e)||e.computed||e.shorthand)return s;let i=e.key;return"__proto__"===("Identifier"===i.type?i.name:i.value)?(t?this.raise(m.RecordNoProto,i):s&&(r?null===r.doubleProtoLoc&&(r.doubleProtoLoc=i.loc.start):this.raise(m.DuplicateProto,i)),!0):s}shouldExitDescending(e,t){return"ArrowFunctionExpression"===e.type&&this.offsetToSourcePos(e.start)===t}getExpression(){if(this.enterInitialScopes(),this.nextToken(),this.match(140))throw this.raise(m.ParseExpressionEmptyInput,this.state.startLoc);let e=this.parseExpression();if(!this.match(140))throw this.raise(m.ParseExpressionExpectsEOF,this.state.startLoc,{unexpected:this.input.codePointAt(this.state.start)});return this.finalizeRemainingComments(),e.comments=this.comments,e.errors=this.state.errors,256&this.optionFlags&&(e.tokens=this.tokens),e}parseExpression(e,t){return e?this.disallowInAnd(()=>this.parseExpressionBase(t)):this.allowInAnd(()=>this.parseExpressionBase(t))}parseExpressionBase(e){let t=this.state.startLoc,s=this.parseMaybeAssign(e);if(this.match(12)){let r=this.startNodeAt(t);for(r.expressions=[s];this.eat(12);)r.expressions.push(this.parseMaybeAssign(e));return this.toReferencedList(r.expressions),this.finishNode(r,"SequenceExpression")}return s}parseMaybeAssignDisallowIn(e,t){return this.disallowInAnd(()=>this.parseMaybeAssign(e,t))}parseMaybeAssignAllowIn(e,t){return this.allowInAnd(()=>this.parseMaybeAssign(e,t))}setOptionalParametersError(e){e.optionalParametersLoc=this.state.startLoc}parseMaybeAssign(e,t){var s;let r,i=this.state.startLoc,a=this.isContextual(108);if(a&&this.prodParam.hasYield){this.next();let e=this.parseYield(i);return t&&(e=t.call(this,e,i)),e}e?r=!1:(e=new eJ,r=!0);let{type:o}=this.state;(10===o||L(o))&&(this.state.potentialArrowAt=this.state.start);let n=this.parseMaybeConditional(e);if(t&&(n=t.call(this,n,i)),(s=this.state.type)>=29&&s<=33){let t=this.startNodeAt(i),s=this.state.value;if(t.operator=s,this.match(29)){this.toAssignable(n,!0),t.left=n;let s=i.index;null!=e.doubleProtoLoc&&e.doubleProtoLoc.index>=s&&(e.doubleProtoLoc=null),null!=e.shorthandAssignLoc&&e.shorthandAssignLoc.index>=s&&(e.shorthandAssignLoc=null),null!=e.privateKeyLoc&&e.privateKeyLoc.index>=s&&(this.checkDestructuringPrivate(e),e.privateKeyLoc=null),null!=e.voidPatternLoc&&e.voidPatternLoc.index>=s&&(e.voidPatternLoc=null)}else t.left=n;return this.next(),t.right=this.parseMaybeAssign(),this.checkLVal(n,this.finishNode(t,"AssignmentExpression"),void 0,void 0,void 0,void 0,"||="===s||"&&="===s||"??="===s),t}if(r&&this.checkExpressionErrors(e,!0),a){let{type:e}=this.state;if((this.hasPlugin("v8intrinsic")?I[e]:I[e]&&!this.match(54))&&!this.isAmbiguousPrefixOrIdentifier())return this.raiseOverwrite(m.YieldNotInGeneratorFunction,i),this.parseYield(i)}return n}parseMaybeConditional(e){let t=this.state.startLoc,s=this.state.potentialArrowAt,r=this.parseExprOps(e);return this.shouldExitDescending(r,s)?r:this.parseConditional(r,t,e)}parseConditional(e,t,s){if(this.eat(17)){let s=this.startNodeAt(t);return s.test=e,s.consequent=this.parseMaybeAssignAllowIn(),this.expect(14),s.alternate=this.parseMaybeAssign(),this.finishNode(s,"ConditionalExpression")}return e}parseMaybeUnaryOrPrivate(e){return this.match(139)?this.parsePrivateName():this.parseMaybeUnary(e)}parseExprOps(e){let t=this.state.startLoc,s=this.state.potentialArrowAt,r=this.parseMaybeUnaryOrPrivate(e);return this.shouldExitDescending(r,s)?r:this.parseExprOp(r,t,-1)}parseExprOp(e,t,s){if(this.isPrivateName(e)){let t=this.getPrivateNameSV(e);!(s>=C[58])&&this.prodParam.hasIn&&this.match(58)||this.raise(m.PrivateInExpectedIn,e,{identifierName:t}),this.classScope.usePrivateName(t,e.loc.start)}let r=this.state.type;if(r>=39&&r<=59&&(this.prodParam.hasIn||!this.match(58))){let i=C[r];if(i>s){if(39===r){if(this.expectPlugin("pipelineOperator"),this.state.inFSharpPipelineDirectBody)return e;this.checkPipelineAtInfixOperator(e,t)}let a=this.startNodeAt(t);a.left=e,a.operator=this.state.value;let o=41===r||42===r,n=40===r;if(n&&(i=C[42]),this.next(),39===r&&this.hasPlugin(["pipelineOperator",{proposal:"minimal"}])&&96===this.state.type&&this.prodParam.hasAwait)throw this.raise(m.UnexpectedAwaitAfterPipelineBody,this.state.startLoc);a.right=this.parseExprOpRightExpr(r,i);let l=this.finishNode(a,o||n?"LogicalExpression":"BinaryExpression"),p=this.state.type;if(n&&(41===p||42===p)||o&&40===p)throw this.raise(m.MixingCoalesceWithLogical,this.state.startLoc);return this.parseExprOp(l,t,s)}}return e}parseExprOpRightExpr(e,t){let s=this.state.startLoc;if(39===e){switch(this.getPluginOption("pipelineOperator","proposal")){case"hack":return this.withTopicBindingContext(()=>this.parseHackPipeBody());case"fsharp":return this.withSoloAwaitPermittingContext(()=>this.parseFSharpPipelineBody(t))}if("smart"===this.getPluginOption("pipelineOperator","proposal"))return this.withTopicBindingContext(()=>{if(this.prodParam.hasYield&&this.isContextual(108))throw this.raise(m.PipeBodyIsTighter,this.state.startLoc);return this.parseSmartPipelineBodyInStyle(this.parseExprOpBaseRightExpr(e,t),s)})}return this.parseExprOpBaseRightExpr(e,t)}parseExprOpBaseRightExpr(e,t){let s=this.state.startLoc;return this.parseExprOp(this.parseMaybeUnaryOrPrivate(),s,57===e?t-1:t)}parseHackPipeBody(){var e;let{startLoc:t}=this.state,s=this.parseMaybeAssign();return p.has(s.type)&&!(null!=(e=s.extra)&&e.parenthesized)&&this.raise(m.PipeUnparenthesizedBody,t,{type:s.type}),this.topicReferenceWasUsedInCurrentContext()||this.raise(m.PipeTopicUnused,t),s}checkExponentialAfterUnary(e){this.match(57)&&this.raise(m.UnexpectedTokenUnaryExponentiation,e.argument)}parseMaybeUnary(e,t){let s=this.state.startLoc,r=this.isContextual(96);if(r&&this.recordAwaitIfAllowed()){this.next();let e=this.parseAwait(s);return t||this.checkExponentialAfterUnary(e),e}let i=this.match(34),a=this.startNode();if(k[this.state.type]){a.operator=this.state.value,a.prefix=!0,this.match(72)&&this.expectPlugin("throwExpressions");let s=this.match(89);if(this.next(),a.argument=this.parseMaybeUnary(null,!0),this.checkExpressionErrors(e,!0),this.state.strict&&s){let e=a.argument;"Identifier"===e.type?this.raise(m.StrictDelete,a):this.hasPropertyAsPrivateName(e)&&this.raise(m.DeletePrivateField,a)}if(!i)return t||this.checkExponentialAfterUnary(a),this.finishNode(a,"UnaryExpression")}let o=this.parseUpdate(a,i,e);if(r){let{type:e}=this.state;if((this.hasPlugin("v8intrinsic")?I[e]:I[e]&&!this.match(54))&&!this.isAmbiguousPrefixOrIdentifier())return this.raiseOverwrite(m.AwaitNotInAsyncContext,s),this.parseAwait(s)}return o}parseUpdate(e,t,s){if(t)return this.checkLVal(e.argument,this.finishNode(e,"UpdateExpression")),e;let r=this.state.startLoc,i=this.parseExprSubscripts(s);if(this.checkExpressionErrors(s,!1))return i;for(;34===this.state.type&&!this.canInsertSemicolon();){let e=this.startNodeAt(r);e.operator=this.state.value,e.prefix=!1,e.argument=i,this.next(),this.checkLVal(i,i=this.finishNode(e,"UpdateExpression"))}return i}parseExprSubscripts(e){let t=this.state.startLoc,s=this.state.potentialArrowAt,r=this.parseExprAtom(e);return this.shouldExitDescending(r,s)?r:this.parseSubscripts(r,t)}parseSubscripts(e,t,s){let r={optionalChainMember:!1,maybeAsyncArrow:this.atPossibleAsyncArrow(e),stop:!1};do e=this.parseSubscript(e,t,s,r),r.maybeAsyncArrow=!1;while(!r.stop)return e}parseSubscript(e,t,s,r){let{type:i}=this.state;if(!s&&15===i)return this.parseBind(e,t,s,r);if(j(i))return this.parseTaggedTemplateExpression(e,t,r);let a=!1;if(18===i){if(s&&(this.raise(m.OptionalChainingNoNew,this.state.startLoc),40===this.lookaheadCharCode()))return this.stopParseSubscript(e,r);r.optionalChainMember=a=!0,this.next()}if(!s&&this.match(10))return this.parseCoverCallAndAsyncArrowHead(e,t,r,a);{let s=this.eat(0);return s||a||this.eat(16)?this.parseMember(e,t,r,s,a):this.stopParseSubscript(e,r)}}stopParseSubscript(e,t){return t.stop=!0,e}parseMember(e,t,s,r,i){let a=this.startNodeAt(t);return(a.object=e,a.computed=r,r?(a.property=this.parseExpression(),this.expect(3)):this.match(139)?("Super"===e.type&&this.raise(m.SuperPrivateField,t),this.classScope.usePrivateName(this.state.value,this.state.startLoc),a.property=this.parsePrivateName()):a.property=this.parseIdentifier(!0),s.optionalChainMember)?(a.optional=i,this.finishNode(a,"OptionalMemberExpression")):this.finishNode(a,"MemberExpression")}parseBind(e,t,s,r){let i=this.startNodeAt(t);return i.object=e,this.next(),i.callee=this.parseNoCallExpr(),r.stop=!0,this.parseSubscripts(this.finishNode(i,"BindExpression"),t,s)}parseCoverCallAndAsyncArrowHead(e,t,s,r){let i=this.state.maybeInArrowParameters,a=null;this.state.maybeInArrowParameters=!0,this.next();let o=this.startNodeAt(t);o.callee=e;let{maybeAsyncArrow:n,optionalChainMember:l}=s;n&&(this.expressionScope.enter(new eW(2)),a=new eJ),l&&(o.optional=r),r?o.arguments=this.parseCallExpressionArguments():o.arguments=this.parseCallExpressionArguments("Super"!==e.type,o,a);let p=this.finishCallExpression(o,l);return n&&this.shouldParseAsyncArrow()&&!r?(s.stop=!0,this.checkDestructuringPrivate(a),this.expressionScope.validateAsPattern(),this.expressionScope.exit(),p=this.parseAsyncArrowFromCallExpression(this.startNodeAt(t),p)):(n&&(this.checkExpressionErrors(a,!0),this.expressionScope.exit()),this.toReferencedArguments(p)),this.state.maybeInArrowParameters=i,p}toReferencedArguments(e,t){this.toReferencedListDeep(e.arguments,t)}parseTaggedTemplateExpression(e,t,s){let r=this.startNodeAt(t);return r.tag=e,r.quasi=this.parseTemplate(!0),s.optionalChainMember&&this.raise(m.OptionalChainingNoTemplate,t),this.finishNode(r,"TaggedTemplateExpression")}atPossibleAsyncArrow(e){return"Identifier"===e.type&&"async"===e.name&&this.state.lastTokEndLoc.index===e.end&&!this.canInsertSemicolon()&&e.end-e.start==5&&this.offsetToSourcePos(e.start)===this.state.potentialArrowAt}finishCallExpression(e,t){if("Import"===e.callee.type)if(0===e.arguments.length||e.arguments.length>2)this.raise(m.ImportCallArity,e);else for(let t of e.arguments)"SpreadElement"===t.type&&this.raise(m.ImportCallSpreadArgument,t);return this.finishNode(e,t?"OptionalCallExpression":"CallExpression")}parseCallExpressionArguments(e,t,s){let r=[],i=!0,a=this.state.inFSharpPipelineDirectBody;for(this.state.inFSharpPipelineDirectBody=!1;!this.eat(11);){if(i)i=!1;else if(this.expect(12),this.match(11)){t&&this.addTrailingCommaExtraToNode(t),this.next();break}r.push(this.parseExprListItem(11,!1,s,e))}return this.state.inFSharpPipelineDirectBody=a,r}shouldParseAsyncArrow(){return this.match(19)&&!this.canInsertSemicolon()}parseAsyncArrowFromCallExpression(e,t){var s;return this.resetPreviousNodeTrailingComments(t),this.expect(19),this.parseArrowExpression(e,t.arguments,!0,null==(s=t.extra)?void 0:s.trailingCommaLoc),t.innerComments&&eS(e,t.innerComments),t.callee.trailingComments&&eS(e,t.callee.trailingComments),e}parseNoCallExpr(){let e=this.state.startLoc;return this.parseSubscripts(this.parseExprAtom(),e,!0)}parseExprAtom(e){let t,s=null,{type:r}=this.state;switch(r){case 79:return this.parseSuper();case 83:if(t=this.startNode(),this.next(),this.match(16))return this.parseImportMetaPropertyOrPhaseCall(t);if(!this.match(10))return this.raise(m.UnsupportedImport,this.state.lastTokStartLoc),this.finishNode(t,"Import");if(512&this.optionFlags)return this.parseImportCall(t);return this.finishNode(t,"Import");case 78:return t=this.startNode(),this.next(),this.finishNode(t,"ThisExpression");case 90:return this.parseDo(this.startNode(),!1);case 56:case 31:return this.readRegexp(),this.parseRegExpLiteral(this.state.value);case 135:return this.parseNumericLiteral(this.state.value);case 136:return this.parseBigIntLiteral(this.state.value);case 134:return this.parseStringLiteral(this.state.value);case 84:return this.parseNullLiteral();case 85:return this.parseBooleanLiteral(!0);case 86:return this.parseBooleanLiteral(!1);case 10:{let e=this.state.potentialArrowAt===this.state.start;return this.parseParenAndDistinguishExpression(e)}case 0:return this.parseArrayLike(3,!1,e);case 5:return this.parseObjectLike(8,!1,!1,e);case 68:return this.parseFunctionOrFunctionSent();case 26:s=this.parseDecorators();case 80:return this.parseClass(this.maybeTakeDecorators(s,this.startNode()),!1);case 77:return this.parseNewOrNewTarget();case 25:case 24:return this.parseTemplate(!1);case 15:{t=this.startNode(),this.next(),t.object=null;let e=t.callee=this.parseNoCallExpr();if("MemberExpression"===e.type)return this.finishNode(t,"BindExpression");throw this.raise(m.UnsupportedBind,e)}case 139:return this.raise(m.PrivateInExpectedIn,this.state.startLoc,{identifierName:this.state.value}),this.parsePrivateName();case 33:return this.parseTopicReferenceThenEqualsSign(54,"%");case 32:return this.parseTopicReferenceThenEqualsSign(44,"^");case 37:case 38:return this.parseTopicReference("hack");case 44:case 54:case 27:{let e=this.getPluginOption("pipelineOperator","proposal");if(e)return this.parseTopicReference(e);throw this.unexpected()}case 47:{let e=this.input.codePointAt(this.nextTokenStart());if(G(e)||62===e)throw this.expectOnePlugin(["jsx","flow","typescript"]);throw this.unexpected()}default:if(137===r)return this.parseDecimalLiteral(this.state.value);if(2===r||1===r)return this.parseArrayLike(2===this.state.type?4:3,!0);if(6===r||7===r)return this.parseObjectLike(6===this.state.type?9:8,!1,!0);if(L(r)){if(this.isContextual(127)&&123===this.lookaheadInLineCharCode())return this.parseModuleExpression();let e=this.state.potentialArrowAt===this.state.start,t=this.state.containsEsc,s=this.parseIdentifier();if(!t&&"async"===s.name&&!this.canInsertSemicolon()){let{type:t}=this.state;if(68===t)return this.resetPreviousNodeTrailingComments(s),this.next(),this.parseAsyncFunctionExpression(this.startNodeAtNode(s));if(L(t))if(e&&61===this.lookaheadCharCode())return this.parseAsyncArrowUnaryFunction(this.startNodeAtNode(s));else return s;if(90===t)return this.resetPreviousNodeTrailingComments(s),this.parseDo(this.startNodeAtNode(s),!0)}if(e&&this.match(19)&&!this.canInsertSemicolon())return this.next(),this.parseArrowExpression(this.startNodeAtNode(s),[s],!1);return s}throw this.unexpected()}}parseTopicReferenceThenEqualsSign(e,t){let s=this.getPluginOption("pipelineOperator","proposal");if(s)return this.state.type=e,this.state.value=t,this.state.pos--,this.state.end--,this.state.endLoc=a(this.state.endLoc,-1),this.parseTopicReference(s);throw this.unexpected()}parseTopicReference(e){let t=this.startNode(),s=this.state.startLoc,r=this.state.type;return this.next(),this.finishTopicReference(t,s,e,r)}finishTopicReference(e,t,s,r){if(this.testTopicReferenceConfiguration(s,t,r))if("hack"===s)return this.topicReferenceIsAllowedInCurrentContext()||this.raise(m.PipeTopicUnbound,t),this.registerTopicReference(),this.finishNode(e,"TopicReference");else return this.topicReferenceIsAllowedInCurrentContext()||this.raise(m.PrimaryTopicNotAllowed,t),this.registerTopicReference(),this.finishNode(e,"PipelinePrimaryTopicReference");throw this.raise(m.PipeTopicUnconfiguredToken,t,{token:S[r]})}testTopicReferenceConfiguration(e,t,s){switch(e){case"hack":return this.hasPlugin(["pipelineOperator",{topicToken:S[s]}]);case"smart":return 27===s;default:throw this.raise(m.PipeTopicRequiresHackPipes,t)}}parseAsyncArrowUnaryFunction(e){this.prodParam.enter(ew(!0,this.prodParam.hasYield));let t=[this.parseIdentifier()];return this.prodParam.exit(),this.hasPrecedingLineBreak()&&this.raise(m.LineTerminatorBeforeArrow,this.state.curPosition()),this.expect(19),this.parseArrowExpression(e,t,!0)}parseDo(e,t){this.expectPlugin("doExpressions"),t&&this.expectPlugin("asyncDoExpressions"),e.async=t,this.next();let s=this.state.labels;return this.state.labels=[],t?(this.prodParam.enter(2),e.body=this.parseBlock(),this.prodParam.exit()):e.body=this.parseBlock(),this.state.labels=s,this.finishNode(e,"DoExpression")}parseSuper(){let e=this.startNode();return this.next(),this.match(10)&&!this.scope.allowDirectSuper?16&this.optionFlags||this.raise(m.SuperNotAllowed,e):this.scope.allowSuper||16&this.optionFlags||this.raise(m.UnexpectedSuper,e),this.match(10)||this.match(0)||this.match(16)||this.raise(m.UnsupportedSuper,e),this.finishNode(e,"Super")}parsePrivateName(){let e=this.startNode(),t=this.startNodeAt(a(this.state.startLoc,1)),s=this.state.value;return this.next(),e.id=this.createIdentifier(t,s),this.finishNode(e,"PrivateName")}parseFunctionOrFunctionSent(){let e=this.startNode();if(this.next(),this.prodParam.hasYield&&this.match(16)){let t=this.createIdentifier(this.startNodeAtNode(e),"function");return this.next(),this.match(103)?this.expectPlugin("functionSent"):this.hasPlugin("functionSent")||this.unexpected(),this.parseMetaProperty(e,t,"sent")}return this.parseFunction(e)}parseMetaProperty(e,t,s){e.meta=t;let r=this.state.containsEsc;return e.property=this.parseIdentifier(!0),(e.property.name!==s||r)&&this.raise(m.UnsupportedMetaProperty,e.property,{target:t.name,onlyValidPropertyName:s}),this.finishNode(e,"MetaProperty")}parseImportMetaPropertyOrPhaseCall(e){if(this.next(),this.isContextual(105)||this.isContextual(97)){let t=this.isContextual(105);return this.expectPlugin(t?"sourcePhaseImports":"deferredImportEvaluation"),this.next(),e.phase=t?"source":"defer",this.parseImportCall(e)}{let t=this.createIdentifierAt(this.startNodeAtNode(e),"import",this.state.lastTokStartLoc);return this.isContextual(101)&&(this.inModule||this.raise(m.ImportMetaOutsideModule,t),this.sawUnambiguousESM=!0),this.parseMetaProperty(e,t,"meta")}}parseLiteralAtNode(e,t,s){return this.addExtra(s,"rawValue",e),this.addExtra(s,"raw",this.input.slice(this.offsetToSourcePos(s.start),this.state.end)),s.value=e,this.next(),this.finishNode(s,t)}parseLiteral(e,t){let s=this.startNode();return this.parseLiteralAtNode(e,t,s)}parseStringLiteral(e){return this.parseLiteral(e,"StringLiteral")}parseNumericLiteral(e){return this.parseLiteral(e,"NumericLiteral")}parseBigIntLiteral(e){return this.parseLiteral(e,"BigIntLiteral")}parseDecimalLiteral(e){return this.parseLiteral(e,"DecimalLiteral")}parseRegExpLiteral(e){let t=this.startNode();return this.addExtra(t,"raw",this.input.slice(this.offsetToSourcePos(t.start),this.state.end)),t.pattern=e.pattern,t.flags=e.flags,this.next(),this.finishNode(t,"RegExpLiteral")}parseBooleanLiteral(e){let t=this.startNode();return t.value=e,this.next(),this.finishNode(t,"BooleanLiteral")}parseNullLiteral(){let e=this.startNode();return this.next(),this.finishNode(e,"NullLiteral")}parseParenAndDistinguishExpression(e){let t,s,r,i=this.state.startLoc;this.next(),this.expressionScope.enter(new eW(1));let a=this.state.maybeInArrowParameters,o=this.state.inFSharpPipelineDirectBody;this.state.maybeInArrowParameters=!0,this.state.inFSharpPipelineDirectBody=!1;let n=this.state.startLoc,l=[],p=new eJ,c=!0;for(;!this.match(11);){if(c)c=!1;else if(this.expect(12,null===p.optionalParametersLoc?null:p.optionalParametersLoc),this.match(11)){r=this.state.startLoc;break}if(this.match(21)){let e=this.state.startLoc;if(s=this.state.startLoc,l.push(this.parseParenItem(this.parseRestBinding(),e)),!this.checkCommaAfterRest(41))break}else l.push(this.parseMaybeAssignAllowInOrVoidPattern(11,p,this.parseParenItem))}let h=this.state.lastTokEndLoc;this.expect(11),this.state.maybeInArrowParameters=a,this.state.inFSharpPipelineDirectBody=o;let d=this.startNodeAt(i);return e&&this.shouldParseArrow(l)&&(d=this.parseArrow(d))?(this.checkDestructuringPrivate(p),this.expressionScope.validateAsPattern(),this.expressionScope.exit(),this.parseArrowExpression(d,l,!1),d):(this.expressionScope.exit(),l.length||this.unexpected(this.state.lastTokStartLoc),r&&this.unexpected(r),s&&this.unexpected(s),this.checkExpressionErrors(p,!0),this.toReferencedListDeep(l,!0),l.length>1?((t=this.startNodeAt(n)).expressions=l,this.finishNode(t,"SequenceExpression"),this.resetEndLocation(t,h)):t=l[0],this.wrapParenthesis(i,t))}wrapParenthesis(e,t){if(!(1024&this.optionFlags))return this.addExtra(t,"parenthesized",!0),this.addExtra(t,"parenStart",e.index),this.takeSurroundingComments(t,e.index,this.state.lastTokEndLoc.index),t;let s=this.startNodeAt(e);return s.expression=t,this.finishNode(s,"ParenthesizedExpression")}shouldParseArrow(e){return!this.canInsertSemicolon()}parseArrow(e){if(this.eat(19))return e}parseParenItem(e,t){return e}parseNewOrNewTarget(){let e=this.startNode();if(this.next(),this.match(16)){let t=this.createIdentifier(this.startNodeAtNode(e),"new");this.next();let s=this.parseMetaProperty(e,t,"target");return this.scope.allowNewTarget||this.raise(m.UnexpectedNewTarget,s),s}return this.parseNew(e)}parseNew(e){if(this.parseNewCallee(e),this.eat(10)){let t=this.parseExprList(11);this.toReferencedList(t),e.arguments=t}else e.arguments=[];return this.finishNode(e,"NewExpression")}parseNewCallee(e){let t=this.match(83),s=this.parseNoCallExpr();e.callee=s,t&&("Import"===s.type||"ImportExpression"===s.type)&&this.raise(m.ImportCallNotNewExpression,s)}parseTemplateElement(e){let{start:t,startLoc:s,end:r,value:i}=this.state,o=this.startNodeAt(a(s,1));null!==i||e||this.raise(m.InvalidEscapeSequenceTemplate,a(this.state.firstInvalidTemplateEscapePos,1));let n=this.match(24),l=n?-1:-2,p=r+l;o.value={raw:this.input.slice(t+1,p).replace(/\r\n?/g,"\n"),cooked:null===i?null:i.slice(1,l)},o.tail=n,this.next();let c=this.finishNode(o,"TemplateElement");return this.resetEndLocation(c,a(this.state.lastTokEndLoc,l)),c}parseTemplate(e){let t=this.startNode(),s=this.parseTemplateElement(e),r=[s],i=[];for(;!s.tail;)i.push(this.parseTemplateSubstitution()),this.readTemplateContinuation(),r.push(s=this.parseTemplateElement(e));return t.expressions=i,t.quasis=r,this.finishNode(t,"TemplateLiteral")}parseTemplateSubstitution(){return this.parseExpression()}parseObjectLike(e,t,s,r){s&&this.expectPlugin("recordAndTuple");let i=this.state.inFSharpPipelineDirectBody;this.state.inFSharpPipelineDirectBody=!1;let a=!1,o=!0,n=this.startNode();for(n.properties=[],this.next();!this.match(e);){let i;if(o)o=!1;else if(this.expect(12),this.match(e)){this.addTrailingCommaExtraToNode(n);break}t?i=this.parseBindingProperty():(i=this.parsePropertyDefinition(r),a=this.checkProto(i,s,a,r)),s&&!this.isObjectProperty(i)&&"SpreadElement"!==i.type&&this.raise(m.InvalidRecordProperty,i),i.shorthand&&this.addExtra(i,"shorthand",!0),n.properties.push(i)}this.next(),this.state.inFSharpPipelineDirectBody=i;let l="ObjectExpression";return t?l="ObjectPattern":s&&(l="RecordExpression"),this.finishNode(n,l)}addTrailingCommaExtraToNode(e){this.addExtra(e,"trailingComma",this.state.lastTokStartLoc.index),this.addExtra(e,"trailingCommaLoc",this.state.lastTokStartLoc,!1)}maybeAsyncOrAccessorProp(e){return!e.computed&&"Identifier"===e.key.type&&(this.isLiteralPropertyName()||this.match(0)||this.match(55))}parsePropertyDefinition(e){let t,s=[];if(this.match(26))for(this.hasPlugin("decorators")&&this.raise(m.UnsupportedPropertyDecorator,this.state.startLoc);this.match(26);)s.push(this.parseDecorator());let r=this.startNode(),i=!1,a=!1;if(this.match(21))return s.length&&this.unexpected(),this.parseSpread();s.length&&(r.decorators=s,s=[]),r.method=!1,e&&(t=this.state.startLoc);let o=this.eat(55);this.parsePropertyNamePrefixOperator(r);let n=this.state.containsEsc;if(this.parsePropertyName(r,e),!o&&!n&&this.maybeAsyncOrAccessorProp(r)){let{key:e}=r,t=e.name;"async"!==t||this.hasPrecedingLineBreak()||(i=!0,this.resetPreviousNodeTrailingComments(e),o=this.eat(55),this.parsePropertyName(r)),("get"===t||"set"===t)&&(a=!0,this.resetPreviousNodeTrailingComments(e),r.kind=t,this.match(55)&&(o=!0,this.raise(m.AccessorIsGenerator,this.state.curPosition(),{kind:t}),this.next()),this.parsePropertyName(r))}return this.parseObjPropValue(r,t,o,i,!1,a,e)}getGetterSetterExpectedParamCount(e){return+("get"!==e.kind)}getObjectOrClassMethodParams(e){return e.params}checkGetterSetterParams(e){var t;let s=this.getGetterSetterExpectedParamCount(e),r=this.getObjectOrClassMethodParams(e);r.length!==s&&this.raise("get"===e.kind?m.BadGetterArity:m.BadSetterArity,e),"set"===e.kind&&(null==(t=r[r.length-1])?void 0:t.type)==="RestElement"&&this.raise(m.BadSetterRestParameter,e)}parseObjectMethod(e,t,s,r,i){if(i){let s=this.parseMethod(e,t,!1,!1,!1,"ObjectMethod");return this.checkGetterSetterParams(s),s}if(s||t||this.match(10))return r&&this.unexpected(),e.kind="method",e.method=!0,this.parseMethod(e,t,s,!1,!1,"ObjectMethod")}parseObjectProperty(e,t,s,r){if(e.shorthand=!1,this.eat(14))return e.value=s?this.parseMaybeDefault(this.state.startLoc):this.parseMaybeAssignAllowInOrVoidPattern(8,r),this.finishObjectProperty(e);if(!e.computed&&"Identifier"===e.key.type){if(this.checkReservedWord(e.key.name,e.key.loc.start,!0,!1),s)e.value=this.parseMaybeDefault(t,this.cloneIdentifier(e.key));else if(this.match(29)){let s=this.state.startLoc;null!=r?null===r.shorthandAssignLoc&&(r.shorthandAssignLoc=s):this.raise(m.InvalidCoverInitializedName,s),e.value=this.parseMaybeDefault(t,this.cloneIdentifier(e.key))}else e.value=this.cloneIdentifier(e.key);return e.shorthand=!0,this.finishObjectProperty(e)}}finishObjectProperty(e){return this.finishNode(e,"ObjectProperty")}parseObjPropValue(e,t,s,r,i,a,o){let n=this.parseObjectMethod(e,s,r,i,a)||this.parseObjectProperty(e,t,i,o);return n||this.unexpected(),n}parsePropertyName(e,t){if(this.eat(0))e.computed=!0,e.key=this.parseMaybeAssignAllowIn(),this.expect(3);else{let s,{type:r,value:i}=this.state;if(O(r))s=this.parseIdentifier(!0);else switch(r){case 135:s=this.parseNumericLiteral(i);break;case 134:s=this.parseStringLiteral(i);break;case 136:s=this.parseBigIntLiteral(i);break;case 139:{let e=this.state.startLoc;null!=t?null===t.privateKeyLoc&&(t.privateKeyLoc=e):this.raise(m.UnexpectedPrivateField,e),s=this.parsePrivateName();break}default:if(137===r){s=this.parseDecimalLiteral(i);break}this.unexpected()}e.key=s,139!==r&&(e.computed=!1)}}initFunction(e,t){e.id=null,e.generator=!1,e.async=t}parseMethod(e,t,s,r,i,a,o=!1){this.initFunction(e,s),e.generator=t,this.scope.enter(530|576*!!o|32*!!i),this.prodParam.enter(ew(s,e.generator)),this.parseFunctionParams(e,r);let n=this.parseFunctionBodyAndFinish(e,a,!0);return this.prodParam.exit(),this.scope.exit(),n}parseArrayLike(e,t,s){t&&this.expectPlugin("recordAndTuple");let r=this.state.inFSharpPipelineDirectBody;this.state.inFSharpPipelineDirectBody=!1;let i=this.startNode();return this.next(),i.elements=this.parseExprList(e,!t,s,i),this.state.inFSharpPipelineDirectBody=r,this.finishNode(i,t?"TupleExpression":"ArrayExpression")}parseArrowExpression(e,t,s,r){this.scope.enter(518);let i=ew(s,!1);!this.match(5)&&this.prodParam.hasIn&&(i|=8),this.prodParam.enter(i),this.initFunction(e,s);let a=this.state.maybeInArrowParameters;return t&&(this.state.maybeInArrowParameters=!0,this.setArrowFunctionParameters(e,t,r)),this.state.maybeInArrowParameters=!1,this.parseFunctionBody(e,!0),this.prodParam.exit(),this.scope.exit(),this.state.maybeInArrowParameters=a,this.finishNode(e,"ArrowFunctionExpression")}setArrowFunctionParameters(e,t,s){this.toAssignableList(t,s,!1),e.params=t}parseFunctionBodyAndFinish(e,t,s=!1){return this.parseFunctionBody(e,!1,s),this.finishNode(e,t)}parseFunctionBody(e,t,s=!1){let r=t&&!this.match(5);if(this.expressionScope.enter(new eq),r)e.body=this.parseMaybeAssign(),this.checkParams(e,!1,t,!1);else{let r=this.state.strict,i=this.state.labels;this.state.labels=[],this.prodParam.enter(4|this.prodParam.currentFlags()),e.body=this.parseBlock(!0,!1,i=>{let a=!this.isSimpleParamList(e.params);i&&a&&this.raise(m.IllegalLanguageModeDirective,("method"===e.kind||"constructor"===e.kind)&&e.key?e.key.loc.end:e);let o=!r&&this.state.strict;this.checkParams(e,!this.state.strict&&!t&&!s&&!a,t,o),this.state.strict&&e.id&&this.checkIdentifier(e.id,65,o)}),this.prodParam.exit(),this.state.labels=i}this.expressionScope.exit()}isSimpleParameter(e){return"Identifier"===e.type}isSimpleParamList(e){for(let t=0,s=e.length;t<s;t++)if(!this.isSimpleParameter(e[t]))return!1;return!0}checkParams(e,t,s,r=!0){let i=!t&&new Set,a={type:"FormalParameters"};for(let t of e.params)this.checkLVal(t,a,5,i,r)}parseExprList(e,t,s,r){let i=[],a=!0;for(;!this.eat(e);){if(a)a=!1;else if(this.expect(12),this.match(e)){r&&this.addTrailingCommaExtraToNode(r),this.next();break}i.push(this.parseExprListItem(e,t,s))}return i}parseExprListItem(e,t,s,r){let i;if(this.match(12))t||this.raise(m.UnexpectedToken,this.state.curPosition(),{unexpected:","}),i=null;else if(this.match(21)){let e=this.state.startLoc;i=this.parseParenItem(this.parseSpread(s),e)}else if(this.match(17)){this.expectPlugin("partialApplication"),r||this.raise(m.UnexpectedArgumentPlaceholder,this.state.startLoc);let e=this.startNode();this.next(),i=this.finishNode(e,"ArgumentPlaceholder")}else i=this.parseMaybeAssignAllowInOrVoidPattern(e,s,this.parseParenItem);return i}parseIdentifier(e){let t=this.startNode(),s=this.parseIdentifierName(e);return this.createIdentifier(t,s)}createIdentifier(e,t){return e.name=t,e.loc.identifierName=t,this.finishNode(e,"Identifier")}createIdentifierAt(e,t,s){return e.name=t,e.loc.identifierName=t,this.finishNodeAt(e,"Identifier",s)}parseIdentifierName(e){let t,{startLoc:s,type:r}=this.state;O(r)?t=this.state.value:this.unexpected();let i=r<=92;return e?i&&this.replaceToken(132):this.checkReservedWord(t,s,i,!1),this.next(),t}checkReservedWord(e,t,s,r){if(!(e.length>10)){if(et.has(e)){if(s&&J.has(e))return void this.raise(m.UnexpectedKeyword,t,{keyword:e});if((this.state.strict?r?ee:Q:Z)(e,this.inModule))return void this.raise(m.UnexpectedReservedWord,t,{reservedWord:e});if("yield"===e){if(this.prodParam.hasYield)return void this.raise(m.YieldBindingIdentifier,t)}else if("await"===e){if(this.prodParam.hasAwait)return void this.raise(m.AwaitBindingIdentifier,t);if(this.scope.inStaticBlock)return void this.raise(m.AwaitBindingIdentifierInStaticBlock,t);this.expressionScope.recordAsyncArrowParametersError(t)}else if("arguments"===e&&this.scope.inClassAndNotInNonArrowFunction)return void this.raise(m.ArgumentsInClass,t)}}}recordAwaitIfAllowed(){let e=this.prodParam.hasAwait;return e&&!this.scope.inFunction&&(this.state.hasTopLevelAwait=!0),e}parseAwait(e){let t=this.startNodeAt(e);return this.expressionScope.recordParameterInitializerError(m.AwaitExpressionFormalParameter,t),this.eat(55)&&this.raise(m.ObsoleteAwaitStar,t),this.scope.inFunction||1&this.optionFlags||(this.isAmbiguousPrefixOrIdentifier()?this.ambiguousScriptDifferentAst=!0:this.sawUnambiguousESM=!0),this.state.soloAwait||(t.argument=this.parseMaybeUnary(null,!0)),this.finishNode(t,"AwaitExpression")}isAmbiguousPrefixOrIdentifier(){if(this.hasPrecedingLineBreak())return!0;let{type:e}=this.state;return 53===e||10===e||0===e||j(e)||102===e&&!this.state.containsEsc||138===e||56===e||this.hasPlugin("v8intrinsic")&&54===e}parseYield(e){let t=this.startNodeAt(e);this.expressionScope.recordParameterInitializerError(m.YieldInParameter,t);let s=!1,r=null;if(!this.hasPrecedingLineBreak())switch(s=this.eat(55),this.state.type){case 13:case 140:case 8:case 11:case 3:case 9:case 14:case 12:if(!s)break;default:r=this.parseMaybeAssign()}return t.delegate=s,t.argument=r,this.finishNode(t,"YieldExpression")}parseImportCall(e){if(this.next(),e.source=this.parseMaybeAssignAllowIn(),e.options=null,this.eat(12)){if(this.match(11))this.addTrailingCommaExtraToNode(e.source);else if(e.options=this.parseMaybeAssignAllowIn(),this.eat(12)&&(this.addTrailingCommaExtraToNode(e.options),!this.match(11))){do this.parseMaybeAssignAllowIn();while(this.eat(12)&&!this.match(11))this.raise(m.ImportCallArity,e)}}return this.expect(11),this.finishNode(e,"ImportExpression")}checkPipelineAtInfixOperator(e,t){this.hasPlugin(["pipelineOperator",{proposal:"smart"}])&&"SequenceExpression"===e.type&&this.raise(m.PipelineHeadSequenceExpression,t)}parseSmartPipelineBodyInStyle(e,t){if(this.isSimpleReference(e)){let s=this.startNodeAt(t);return s.callee=e,this.finishNode(s,"PipelineBareFunction")}{let s=this.startNodeAt(t);return this.checkSmartPipeTopicBodyEarlyErrors(t),s.expression=e,this.finishNode(s,"PipelineTopicExpression")}}isSimpleReference(e){switch(e.type){case"MemberExpression":return!e.computed&&this.isSimpleReference(e.object);case"Identifier":return!0;default:return!1}}checkSmartPipeTopicBodyEarlyErrors(e){if(this.match(19))throw this.raise(m.PipelineBodyNoArrow,this.state.startLoc);this.topicReferenceWasUsedInCurrentContext()||this.raise(m.PipelineTopicUnused,e)}withTopicBindingContext(e){let t=this.state.topicContext;this.state.topicContext={maxNumOfResolvableTopics:1,maxTopicIndex:null};try{return e()}finally{this.state.topicContext=t}}withSmartMixTopicForbiddingContext(e){if(!this.hasPlugin(["pipelineOperator",{proposal:"smart"}]))return e();{let t=this.state.topicContext;this.state.topicContext={maxNumOfResolvableTopics:0,maxTopicIndex:null};try{return e()}finally{this.state.topicContext=t}}}withSoloAwaitPermittingContext(e){let t=this.state.soloAwait;this.state.soloAwait=!0;try{return e()}finally{this.state.soloAwait=t}}allowInAnd(e){let t=this.prodParam.currentFlags();if(8&~t){this.prodParam.enter(8|t);try{return e()}finally{this.prodParam.exit()}}return e()}disallowInAnd(e){let t=this.prodParam.currentFlags();if(8&t){this.prodParam.enter(-9&t);try{return e()}finally{this.prodParam.exit()}}return e()}registerTopicReference(){this.state.topicContext.maxTopicIndex=0}topicReferenceIsAllowedInCurrentContext(){return this.state.topicContext.maxNumOfResolvableTopics>=1}topicReferenceWasUsedInCurrentContext(){return null!=this.state.topicContext.maxTopicIndex&&this.state.topicContext.maxTopicIndex>=0}parseFSharpPipelineBody(e){let t=this.state.startLoc;this.state.potentialArrowAt=this.state.start;let s=this.state.inFSharpPipelineDirectBody;this.state.inFSharpPipelineDirectBody=!0;let r=this.parseExprOp(this.parseMaybeUnaryOrPrivate(),t,e);return this.state.inFSharpPipelineDirectBody=s,r}parseModuleExpression(){this.expectPlugin("moduleBlocks");let e=this.startNode();this.next(),this.match(5)||this.unexpected(null,5);let t=this.startNodeAt(this.state.endLoc);this.next();let s=this.initializeScopes(!0);this.enterInitialScopes();try{e.body=this.parseProgram(t,8,"module")}finally{s()}return this.finishNode(e,"ModuleExpression")}parseVoidPattern(e){this.expectPlugin("discardBinding");let t=this.startNode();return null!=e&&(e.voidPatternLoc=this.state.startLoc),this.next(),this.finishNode(t,"VoidPattern")}parseMaybeAssignAllowInOrVoidPattern(e,t,s){if(null!=t&&this.match(88)){let s=this.lookaheadCharCode();if(44===s||s===(3===e?93:8===e?125:41)||61===s)return this.parseMaybeDefault(this.state.startLoc,this.parseVoidPattern(t))}return this.parseMaybeAssignAllowIn(t,s)}parsePropertyNamePrefixOperator(e){}}let ts={kind:1},tr={kind:2},ti=/[\uD800-\uDFFF]/u,ta=/in(?:stanceof)?/y;class to extends tt{parseTopLevel(e,t){return e.program=this.parseProgram(t,140,"module"===this.options.sourceType?"module":"script"),e.comments=this.comments,256&this.optionFlags&&(e.tokens=function(e,t,s){for(let r=0;r<e.length;r++){let i=e[r],{type:o}=i;if("number"==typeof o){if(139===o){let{loc:t,start:s,value:o,end:n}=i,l=s+1,p=a(t.start,1);e.splice(r,1,new eH({type:N[27],value:"#",start:s,end:l,startLoc:t.start,endLoc:p}),new eH({type:N[132],value:o,start:l,end:n,startLoc:p,endLoc:t.end})),r++;continue}if(j(o)){let n,l,p,c,h,{loc:d,start:u,value:m,end:f}=i,y=u+1,g=a(d.start,1);n=new eH(96===t.charCodeAt(u-s)?{type:N[22],value:"`",start:u,end:y,startLoc:d.start,endLoc:g}:{type:N[8],value:"}",start:u,end:y,startLoc:d.start,endLoc:g}),24===o?(p=f-1,c=a(d.end,-1),l=null===m?null:m.slice(1,-1),h=new eH({type:N[22],value:"`",start:p,end:f,startLoc:c,endLoc:d.end})):(p=f-2,c=a(d.end,-2),l=null===m?null:m.slice(1,-2),h=new eH({type:N[23],value:"${",start:p,end:f,startLoc:c,endLoc:d.end})),e.splice(r,1,n,new eH({type:N[20],value:l,start:y,end:p,startLoc:g,endLoc:c}),h),r+=2;continue}i.type=N[o]}}return e}(this.tokens,this.input,this.startIndex)),this.finishNode(e,"File")}parseProgram(e,t,s){if(e.sourceType=s,e.interpreter=this.parseInterpreterDirective(),this.parseBlockBody(e,!0,!0,t),this.inModule){if(!(64&this.optionFlags)&&this.scope.undefinedExports.size>0)for(let[e,t]of Array.from(this.scope.undefinedExports))this.raise(m.ModuleExportUndefined,t,{localName:e});this.addExtra(e,"topLevelAwait",this.state.hasTopLevelAwait)}return 140===t?this.finishNode(e,"Program"):this.finishNodeAt(e,"Program",a(this.state.startLoc,-1))}stmtToDirective(e){let t=this.castNodeTo(e,"Directive"),s=this.castNodeTo(e.expression,"DirectiveLiteral"),r=s.value,i=this.input.slice(this.offsetToSourcePos(s.start),this.offsetToSourcePos(s.end)),a=s.value=i.slice(1,-1);return this.addExtra(s,"raw",i),this.addExtra(s,"rawValue",a),this.addExtra(s,"expressionValue",r),t.value=s,delete e.expression,t}parseInterpreterDirective(){if(!this.match(28))return null;let e=this.startNode();return e.value=this.state.value,this.next(),this.finishNode(e,"InterpreterDirective")}isLet(){return!!this.isContextual(100)&&this.hasFollowingBindingAtom()}isUsing(){return!!this.isContextual(107)&&this.nextTokenIsIdentifierOnSameLine()}isForUsing(){if(!this.isContextual(107))return!1;let e=this.nextTokenInLineStart(),t=this.codePointAtPos(e);if(this.isUnparsedContextual(e,"of")){let t=this.lookaheadCharCodeSince(e+2);if(61!==t&&58!==t&&59!==t)return!1}return!!(this.chStartsBindingIdentifier(t,e)||this.isUnparsedContextual(e,"void"))}nextTokenIsIdentifierOnSameLine(){let e=this.nextTokenInLineStart(),t=this.codePointAtPos(e);return this.chStartsBindingIdentifier(t,e)}isAwaitUsing(){if(!this.isContextual(96))return!1;let e=this.nextTokenInLineStart();if(this.isUnparsedContextual(e,"using")){e=this.nextTokenInLineStartSince(e+5);let t=this.codePointAtPos(e);if(this.chStartsBindingIdentifier(t,e))return!0}return!1}chStartsBindingIdentifier(e,t){if(G(e)){if(ta.lastIndex=t,ta.test(this.input)){let e=this.codePointAtPos(ta.lastIndex);if(!K(e)&&92!==e)return!1}return!0}return 92===e||!1}chStartsBindingPattern(e){return 91===e||123===e}hasFollowingBindingAtom(){let e=this.nextTokenStart(),t=this.codePointAtPos(e);return this.chStartsBindingPattern(t)||this.chStartsBindingIdentifier(t,e)}hasInLineFollowingBindingIdentifierOrBrace(){let e=this.nextTokenInLineStart(),t=this.codePointAtPos(e);return 123===t||this.chStartsBindingIdentifier(t,e)}allowsUsing(){return(this.scope.inModule||!this.scope.inTopLevel)&&!this.scope.inBareCaseStatement}parseModuleItem(){return this.parseStatementLike(15)}parseStatementListItem(){return this.parseStatementLike(6|(!this.options.annexB||this.state.strict?0:8))}parseStatementOrSloppyAnnexBFunctionDeclaration(e=!1){let t=0;return this.options.annexB&&!this.state.strict&&(t|=4,e&&(t|=8)),this.parseStatementLike(t)}parseStatement(){return this.parseStatementLike(0)}parseStatementLike(e){let t=null;return this.match(26)&&(t=this.parseDecorators(!0)),this.parseStatementContent(e,t)}parseStatementContent(e,t){let s=this.state.type,r=this.startNode(),i=!!(2&e),a=!!(4&e),o=1&e;switch(s){case 60:return this.parseBreakContinueStatement(r,!0);case 63:return this.parseBreakContinueStatement(r,!1);case 64:return this.parseDebuggerStatement(r);case 90:return this.parseDoWhileStatement(r);case 91:return this.parseForStatement(r);case 68:if(46===this.lookaheadCharCode())break;return a||this.raise(this.state.strict?m.StrictFunction:this.options.annexB?m.SloppyFunctionAnnexB:m.SloppyFunction,this.state.startLoc),this.parseFunctionStatement(r,!1,!i&&a);case 80:return i||this.unexpected(),this.parseClass(this.maybeTakeDecorators(t,r),!0);case 69:return this.parseIfStatement(r);case 70:return this.parseReturnStatement(r);case 71:return this.parseSwitchStatement(r);case 72:return this.parseThrowStatement(r);case 73:return this.parseTryStatement(r);case 96:if(this.isAwaitUsing())return this.allowsUsing()?i?this.recordAwaitIfAllowed()||this.raise(m.AwaitUsingNotInAsyncContext,r):this.raise(m.UnexpectedLexicalDeclaration,r):this.raise(m.UnexpectedUsingDeclaration,r),this.next(),this.parseVarStatement(r,"await using");break;case 107:if(this.state.containsEsc||!this.hasInLineFollowingBindingIdentifierOrBrace())break;return this.allowsUsing()?i||this.raise(m.UnexpectedLexicalDeclaration,this.state.startLoc):this.raise(m.UnexpectedUsingDeclaration,this.state.startLoc),this.parseVarStatement(r,"using");case 100:{if(this.state.containsEsc)break;let e=this.nextTokenStart(),t=this.codePointAtPos(e);if(91!==t&&(!i&&this.hasFollowingLineBreak()||!this.chStartsBindingIdentifier(t,e)&&123!==t))break}case 75:i||this.raise(m.UnexpectedLexicalDeclaration,this.state.startLoc);case 74:{let e=this.state.value;return this.parseVarStatement(r,e)}case 92:return this.parseWhileStatement(r);case 76:return this.parseWithStatement(r);case 5:return this.parseBlock();case 13:return this.parseEmptyStatement(r);case 83:{let e=this.lookaheadCharCode();if(40===e||46===e)break}case 82:{let e;return 8&this.optionFlags||o||this.raise(m.UnexpectedImportExport,this.state.startLoc),this.next(),e=83===s?this.parseImport(r):this.parseExport(r,t),this.assertModuleNodeAllowed(e),e}default:if(this.isAsyncFunction())return i||this.raise(m.AsyncFunctionInSingleStatementContext,this.state.startLoc),this.next(),this.parseFunctionStatement(r,!0,!i&&a)}let n=this.state.value,l=this.parseExpression();return L(s)&&"Identifier"===l.type&&this.eat(14)?this.parseLabeledStatement(r,n,l,e):this.parseExpressionStatement(r,l,t)}assertModuleNodeAllowed(e){8&this.optionFlags||this.inModule||this.raise(m.ImportOutsideModule,e)}decoratorsEnabledBeforeExport(){return!!this.hasPlugin("decorators-legacy")||this.hasPlugin("decorators")&&!1!==this.getPluginOption("decorators","decoratorsBeforeExport")}maybeTakeDecorators(e,t,s){if(e){var r;null!=(r=t.decorators)&&r.length?("boolean"!=typeof this.getPluginOption("decorators","decoratorsBeforeExport")&&this.raise(m.DecoratorsBeforeAfterExport,t.decorators[0]),t.decorators.unshift(...e)):t.decorators=e,this.resetStartLocationFromNode(t,e[0]),s&&this.resetStartLocationFromNode(s,t)}return t}canHaveLeadingDecorator(){return this.match(80)}parseDecorators(e){let t=[];do t.push(this.parseDecorator());while(this.match(26))if(this.match(82))e||this.unexpected(),this.decoratorsEnabledBeforeExport()||this.raise(m.DecoratorExportClass,this.state.startLoc);else if(!this.canHaveLeadingDecorator())throw this.raise(m.UnexpectedLeadingDecorator,this.state.startLoc);return t}parseDecorator(){this.expectOnePlugin(["decorators","decorators-legacy"]);let e=this.startNode();if(this.next(),this.hasPlugin("decorators")){let t,s=this.state.startLoc;if(this.match(10)){let s=this.state.startLoc;this.next(),t=this.parseExpression(),this.expect(11),t=this.wrapParenthesis(s,t);let r=this.state.startLoc;e.expression=this.parseMaybeDecoratorArguments(t,s),!1===this.getPluginOption("decorators","allowCallParenthesized")&&e.expression!==t&&this.raise(m.DecoratorArgumentsOutsideParentheses,r)}else{for(t=this.parseIdentifier(!1);this.eat(16);){let e=this.startNodeAt(s);e.object=t,this.match(139)?(this.classScope.usePrivateName(this.state.value,this.state.startLoc),e.property=this.parsePrivateName()):e.property=this.parseIdentifier(!0),e.computed=!1,t=this.finishNode(e,"MemberExpression")}e.expression=this.parseMaybeDecoratorArguments(t,s)}}else e.expression=this.parseExprSubscripts();return this.finishNode(e,"Decorator")}parseMaybeDecoratorArguments(e,t){if(this.eat(10)){let s=this.startNodeAt(t);return s.callee=e,s.arguments=this.parseCallExpressionArguments(),this.toReferencedList(s.arguments),this.finishNode(s,"CallExpression")}return e}parseBreakContinueStatement(e,t){return this.next(),this.isLineTerminator()?e.label=null:(e.label=this.parseIdentifier(),this.semicolon()),this.verifyBreakContinue(e,t),this.finishNode(e,t?"BreakStatement":"ContinueStatement")}verifyBreakContinue(e,t){let s;for(s=0;s<this.state.labels.length;++s){let r=this.state.labels[s];if((null==e.label||r.name===e.label.name)&&(null!=r.kind&&(t||1===r.kind)||e.label&&t))break}s===this.state.labels.length&&this.raise(m.IllegalBreakContinue,e,{type:t?"BreakStatement":"ContinueStatement"})}parseDebuggerStatement(e){return this.next(),this.semicolon(),this.finishNode(e,"DebuggerStatement")}parseHeaderExpression(){this.expect(10);let e=this.parseExpression();return this.expect(11),e}parseDoWhileStatement(e){return this.next(),this.state.labels.push(ts),e.body=this.withSmartMixTopicForbiddingContext(()=>this.parseStatement()),this.state.labels.pop(),this.expect(92),e.test=this.parseHeaderExpression(),this.eat(13),this.finishNode(e,"DoWhileStatement")}parseForStatement(e){this.next(),this.state.labels.push(ts);let t=null;if(this.isContextual(96)&&this.recordAwaitIfAllowed()&&(t=this.state.startLoc,this.next()),this.scope.enter(0),this.expect(10),this.match(13))return null!==t&&this.unexpected(t),this.parseFor(e,null);let s=this.isContextual(100);{let r=this.isAwaitUsing(),i=r||this.isForUsing(),a=s&&this.hasFollowingBindingAtom()||i;if(this.match(74)||this.match(75)||a){let s,a=this.startNode();r?(s="await using",this.recordAwaitIfAllowed()||this.raise(m.AwaitUsingNotInAsyncContext,this.state.startLoc),this.next()):s=this.state.value,this.next(),this.parseVar(a,!0,s);let o=this.finishNode(a,"VariableDeclaration"),n=this.match(58);return(n&&i&&this.raise(m.ForInUsing,o),(n||this.isContextual(102))&&1===o.declarations.length)?this.parseForIn(e,o,t):(null!==t&&this.unexpected(t),this.parseFor(e,o))}}let r=this.isContextual(95),i=new eJ,a=this.parseExpression(!0,i),o=this.isContextual(102);return(o&&(s&&this.raise(m.ForOfLet,a),null===t&&r&&"Identifier"===a.type&&this.raise(m.ForOfAsync,a)),o||this.match(58))?(this.checkDestructuringPrivate(i),this.toAssignable(a,!0),this.checkLVal(a,{type:o?"ForOfStatement":"ForInStatement"}),this.parseForIn(e,a,t)):(this.checkExpressionErrors(i,!0),null!==t&&this.unexpected(t),this.parseFor(e,a))}parseFunctionStatement(e,t,s){return this.next(),this.parseFunction(e,1|2*!!s|8*!!t)}parseIfStatement(e){return this.next(),e.test=this.parseHeaderExpression(),e.consequent=this.parseStatementOrSloppyAnnexBFunctionDeclaration(),e.alternate=this.eat(66)?this.parseStatementOrSloppyAnnexBFunctionDeclaration():null,this.finishNode(e,"IfStatement")}parseReturnStatement(e){return this.prodParam.hasReturn||this.raise(m.IllegalReturn,this.state.startLoc),this.next(),this.isLineTerminator()?e.argument=null:(e.argument=this.parseExpression(),this.semicolon()),this.finishNode(e,"ReturnStatement")}parseSwitchStatement(e){let t,s;this.next(),e.discriminant=this.parseHeaderExpression();let r=e.cases=[];for(this.expect(5),this.state.labels.push(tr),this.scope.enter(256);!this.match(8);)if(this.match(61)||this.match(65)){let e=this.match(61);t&&this.finishNode(t,"SwitchCase"),r.push(t=this.startNode()),t.consequent=[],this.next(),e?t.test=this.parseExpression():(s&&this.raise(m.MultipleDefaultsInSwitch,this.state.lastTokStartLoc),s=!0,t.test=null),this.expect(14)}else t?t.consequent.push(this.parseStatementListItem()):this.unexpected();return this.scope.exit(),t&&this.finishNode(t,"SwitchCase"),this.next(),this.state.labels.pop(),this.finishNode(e,"SwitchStatement")}parseThrowStatement(e){return this.next(),this.hasPrecedingLineBreak()&&this.raise(m.NewlineAfterThrow,this.state.lastTokEndLoc),e.argument=this.parseExpression(),this.semicolon(),this.finishNode(e,"ThrowStatement")}parseCatchClauseParam(){let e=this.parseBindingAtom();return this.scope.enter(this.options.annexB&&"Identifier"===e.type?8:0),this.checkLVal(e,{type:"CatchClause"},9),e}parseTryStatement(e){if(this.next(),e.block=this.parseBlock(),e.handler=null,this.match(62)){let t=this.startNode();this.next(),this.match(10)?(this.expect(10),t.param=this.parseCatchClauseParam(),this.expect(11)):(t.param=null,this.scope.enter(0)),t.body=this.withSmartMixTopicForbiddingContext(()=>this.parseBlock(!1,!1)),this.scope.exit(),e.handler=this.finishNode(t,"CatchClause")}return e.finalizer=this.eat(67)?this.parseBlock():null,e.handler||e.finalizer||this.raise(m.NoCatchOrFinally,e),this.finishNode(e,"TryStatement")}parseVarStatement(e,t,s=!1){return this.next(),this.parseVar(e,!1,t,s),this.semicolon(),this.finishNode(e,"VariableDeclaration")}parseWhileStatement(e){return this.next(),e.test=this.parseHeaderExpression(),this.state.labels.push(ts),e.body=this.withSmartMixTopicForbiddingContext(()=>this.parseStatement()),this.state.labels.pop(),this.finishNode(e,"WhileStatement")}parseWithStatement(e){return this.state.strict&&this.raise(m.StrictWith,this.state.startLoc),this.next(),e.object=this.parseHeaderExpression(),e.body=this.withSmartMixTopicForbiddingContext(()=>this.parseStatement()),this.finishNode(e,"WithStatement")}parseEmptyStatement(e){return this.next(),this.finishNode(e,"EmptyStatement")}parseLabeledStatement(e,t,s,r){var i;for(let e of this.state.labels)e.name===t&&this.raise(m.LabelRedeclaration,s,{labelName:t});let a=(i=this.state.type)>=90&&i<=92?1:this.match(71)?2:null;for(let t=this.state.labels.length-1;t>=0;t--){let s=this.state.labels[t];if(s.statementStart===e.start)s.statementStart=this.sourceToOffsetPos(this.state.start),s.kind=a;else break}return this.state.labels.push({name:t,kind:a,statementStart:this.sourceToOffsetPos(this.state.start)}),e.body=8&r?this.parseStatementOrSloppyAnnexBFunctionDeclaration(!0):this.parseStatement(),this.state.labels.pop(),e.label=s,this.finishNode(e,"LabeledStatement")}parseExpressionStatement(e,t,s){return e.expression=t,this.semicolon(),this.finishNode(e,"ExpressionStatement")}parseBlock(e=!1,t=!0,s){let r=this.startNode();return e&&this.state.strictErrors.clear(),this.expect(5),t&&this.scope.enter(0),this.parseBlockBody(r,e,!1,8,s),t&&this.scope.exit(),this.finishNode(r,"BlockStatement")}isValidDirective(e){return"ExpressionStatement"===e.type&&"StringLiteral"===e.expression.type&&!e.expression.extra.parenthesized}parseBlockBody(e,t,s,r,i){let a=e.body=[],o=e.directives=[];this.parseBlockOrModuleBlockBody(a,t?o:void 0,s,r,i)}parseBlockOrModuleBlockBody(e,t,s,r,i){let a=this.state.strict,o=!1,n=!1;for(;!this.match(r);){let r=s?this.parseModuleItem():this.parseStatementListItem();if(t&&!n){if(this.isValidDirective(r)){let e=this.stmtToDirective(r);t.push(e),o||"use strict"!==e.value.value||(o=!0,this.setStrict(!0));continue}n=!0,this.state.strictErrors.clear()}e.push(r)}null==i||i.call(this,o),a||this.setStrict(!1),this.next()}parseFor(e,t){return e.init=t,this.semicolon(!1),e.test=this.match(13)?null:this.parseExpression(),this.semicolon(!1),e.update=this.match(11)?null:this.parseExpression(),this.expect(11),e.body=this.withSmartMixTopicForbiddingContext(()=>this.parseStatement()),this.scope.exit(),this.state.labels.pop(),this.finishNode(e,"ForStatement")}parseForIn(e,t,s){let r=this.match(58);return this.next(),r?null!==s&&this.unexpected(s):e.await=null!==s,"VariableDeclaration"!==t.type||null==t.declarations[0].init||r&&this.options.annexB&&!this.state.strict&&"var"===t.kind&&"Identifier"===t.declarations[0].id.type||this.raise(m.ForInOfLoopInitializer,t,{type:r?"ForInStatement":"ForOfStatement"}),"AssignmentPattern"===t.type&&this.raise(m.InvalidLhs,t,{ancestor:{type:"ForStatement"}}),e.left=t,e.right=r?this.parseExpression():this.parseMaybeAssignAllowIn(),this.expect(11),e.body=this.withSmartMixTopicForbiddingContext(()=>this.parseStatement()),this.scope.exit(),this.state.labels.pop(),this.finishNode(e,r?"ForInStatement":"ForOfStatement")}parseVar(e,t,s,r=!1){let i=e.declarations=[];for(e.kind=s;;){let e=this.startNode();if(this.parseVarId(e,s),e.init=this.eat(29)?t?this.parseMaybeAssignDisallowIn():this.parseMaybeAssignAllowIn():null,null===e.init&&!r&&("Identifier"===e.id.type||t&&(this.match(58)||this.isContextual(102))?"const"!==s&&"using"!==s&&"await using"!==s||this.match(58)||this.isContextual(102)||this.raise(m.DeclarationMissingInitializer,this.state.lastTokEndLoc,{kind:s}):this.raise(m.DeclarationMissingInitializer,this.state.lastTokEndLoc,{kind:"destructuring"})),i.push(this.finishNode(e,"VariableDeclarator")),!this.eat(12))break}return e}parseVarId(e,t){let s=this.parseBindingAtom();"using"===t||"await using"===t?("ArrayPattern"===s.type||"ObjectPattern"===s.type)&&this.raise(m.UsingDeclarationHasBindingPattern,s.loc.start):"VoidPattern"===s.type&&this.raise(m.UnexpectedVoidPattern,s.loc.start),this.checkLVal(s,{type:"VariableDeclarator"},"var"===t?5:8201),e.id=s}parseAsyncFunctionExpression(e){return this.parseFunction(e,8)}parseFunction(e,t=0){let s=2&t,r=!!(1&t),i=!!(8&t);this.initFunction(e,i),this.match(55)&&(s&&this.raise(m.GeneratorInSingleStatementContext,this.state.startLoc),this.next(),e.generator=!0),r&&(e.id=this.parseFunctionId(r&&!(4&t)));let a=this.state.maybeInArrowParameters;return this.state.maybeInArrowParameters=!1,this.scope.enter(514),this.prodParam.enter(ew(i,e.generator)),r||(e.id=this.parseFunctionId()),this.parseFunctionParams(e,!1),this.withSmartMixTopicForbiddingContext(()=>{this.parseFunctionBodyAndFinish(e,r?"FunctionDeclaration":"FunctionExpression")}),this.prodParam.exit(),this.scope.exit(),r&&!s&&this.registerFunctionStatementId(e),this.state.maybeInArrowParameters=a,e}parseFunctionId(e){return e||L(this.state.type)?this.parseIdentifier():null}parseFunctionParams(e,t){this.expect(10),this.expressionScope.enter(new eq(3)),e.params=this.parseBindingList(11,41,2|4*!!t),this.expressionScope.exit()}registerFunctionStatementId(e){e.id&&this.scope.declareName(e.id.name,!this.options.annexB||this.state.strict||e.generator||e.async?this.scope.treatFunctionsAsVar?5:8201:17,e.id.loc.start)}parseClass(e,t,s){this.next();let r=this.state.strict;return this.state.strict=!0,this.parseClassId(e,t,s),this.parseClassSuper(e),e.body=this.parseClassBody(!!e.superClass,r),this.finishNode(e,t?"ClassDeclaration":"ClassExpression")}isClassProperty(){return this.match(29)||this.match(13)||this.match(8)}isClassMethod(){return this.match(10)}nameIsConstructor(e){return"Identifier"===e.type&&"constructor"===e.name||"StringLiteral"===e.type&&"constructor"===e.value}isNonstaticConstructor(e){return!e.computed&&!e.static&&this.nameIsConstructor(e.key)}parseClassBody(e,t){this.classScope.enter();let s={hadConstructor:!1,hadSuperClass:e},r=[],i=this.startNode();if(i.body=[],this.expect(5),this.withSmartMixTopicForbiddingContext(()=>{for(;!this.match(8);){if(this.eat(13)){if(r.length>0)throw this.raise(m.DecoratorSemicolon,this.state.lastTokEndLoc);continue}if(this.match(26)){r.push(this.parseDecorator());continue}let e=this.startNode();r.length&&(e.decorators=r,this.resetStartLocationFromNode(e,r[0]),r=[]),this.parseClassMember(i,e,s),"constructor"===e.kind&&e.decorators&&e.decorators.length>0&&this.raise(m.DecoratorConstructor,e)}}),this.state.strict=t,this.next(),r.length)throw this.raise(m.TrailingDecorator,this.state.startLoc);return this.classScope.exit(),this.finishNode(i,"ClassBody")}parseClassMemberFromModifier(e,t){let s=this.parseIdentifier(!0);return this.isClassMethod()?(t.kind="method",t.computed=!1,t.key=s,t.static=!1,this.pushClassMethod(e,t,!1,!1,!1,!1),!0):this.isClassProperty()?(t.computed=!1,t.key=s,t.static=!1,e.body.push(this.parseClassProperty(t)),!0):(this.resetPreviousNodeTrailingComments(s),!1)}parseClassMember(e,t,s){let r=this.isContextual(106);if(r){if(this.parseClassMemberFromModifier(e,t))return;if(this.eat(5))return void this.parseClassStaticBlock(e,t)}this.parseClassMemberWithIsStatic(e,t,s,r)}parseClassMemberWithIsStatic(e,t,s,r){if(t.static=r,this.parsePropertyNamePrefixOperator(t),this.eat(55)){t.kind="method";let s=this.match(139);return(this.parseClassElementName(t),this.parsePostMemberNameModifiers(t),s)?void this.pushClassPrivateMethod(e,t,!0,!1):(this.isNonstaticConstructor(t)&&this.raise(m.ConstructorIsGenerator,t.key),void this.pushClassMethod(e,t,!0,!1,!1,!1))}let i=!this.state.containsEsc&&L(this.state.type),a=this.parseClassElementName(t),o=i?a.name:null,n=this.isPrivateName(a),l=this.state.startLoc;if(this.parsePostMemberNameModifiers(t),this.isClassMethod()){if(t.kind="method",n)return void this.pushClassPrivateMethod(e,t,!1,!1);let r=this.isNonstaticConstructor(t),i=!1;r&&(t.kind="constructor",s.hadConstructor&&!this.hasPlugin("typescript")&&this.raise(m.DuplicateConstructor,a),r&&this.hasPlugin("typescript")&&t.override&&this.raise(m.OverrideOnConstructor,a),s.hadConstructor=!0,i=s.hadSuperClass),this.pushClassMethod(e,t,!1,!1,r,i)}else if(this.isClassProperty())n?this.pushClassPrivateProperty(e,t):this.pushClassProperty(e,t);else if("async"!==o||this.isLineTerminator())if("get"!==o&&"set"!==o||this.match(55)&&this.isLineTerminator())if("accessor"!==o||this.isLineTerminator())this.isLineTerminator()?n?this.pushClassPrivateProperty(e,t):this.pushClassProperty(e,t):this.unexpected();else{this.expectPlugin("decoratorAutoAccessors"),this.resetPreviousNodeTrailingComments(a);let s=this.match(139);this.parseClassElementName(t),this.pushClassAccessorProperty(e,t,s)}else{this.resetPreviousNodeTrailingComments(a),t.kind=o;let s=this.match(139);this.parseClassElementName(t),s?this.pushClassPrivateMethod(e,t,!1,!1):(this.isNonstaticConstructor(t)&&this.raise(m.ConstructorIsAccessor,t.key),this.pushClassMethod(e,t,!1,!1,!1,!1)),this.checkGetterSetterParams(t)}else{this.resetPreviousNodeTrailingComments(a);let s=this.eat(55);t.optional&&this.unexpected(l),t.kind="method";let r=this.match(139);this.parseClassElementName(t),this.parsePostMemberNameModifiers(t),r?this.pushClassPrivateMethod(e,t,s,!0):(this.isNonstaticConstructor(t)&&this.raise(m.ConstructorIsAsync,t.key),this.pushClassMethod(e,t,s,!0,!1,!1))}}parseClassElementName(e){let{type:t,value:s}=this.state;if((132===t||134===t)&&e.static&&"prototype"===s&&this.raise(m.StaticPrototype,this.state.startLoc),139===t){"constructor"===s&&this.raise(m.ConstructorClassPrivateField,this.state.startLoc);let t=this.parsePrivateName();return e.key=t,t}return this.parsePropertyName(e),e.key}parseClassStaticBlock(e,t){var s;this.scope.enter(720);let r=this.state.labels;this.state.labels=[],this.prodParam.enter(0);let i=t.body=[];this.parseBlockOrModuleBlockBody(i,void 0,!1,8),this.prodParam.exit(),this.scope.exit(),this.state.labels=r,e.body.push(this.finishNode(t,"StaticBlock")),null!=(s=t.decorators)&&s.length&&this.raise(m.DecoratorStaticBlock,t)}pushClassProperty(e,t){!t.computed&&this.nameIsConstructor(t.key)&&this.raise(m.ConstructorClassField,t.key),e.body.push(this.parseClassProperty(t))}pushClassPrivateProperty(e,t){let s=this.parseClassPrivateProperty(t);e.body.push(s),this.classScope.declarePrivateName(this.getPrivateNameSV(s.key),0,s.key.loc.start)}pushClassAccessorProperty(e,t,s){!s&&!t.computed&&this.nameIsConstructor(t.key)&&this.raise(m.ConstructorClassField,t.key);let r=this.parseClassAccessorProperty(t);e.body.push(r),s&&this.classScope.declarePrivateName(this.getPrivateNameSV(r.key),0,r.key.loc.start)}pushClassMethod(e,t,s,r,i,a){e.body.push(this.parseMethod(t,s,r,i,a,"ClassMethod",!0))}pushClassPrivateMethod(e,t,s,r){let i=this.parseMethod(t,s,r,!1,!1,"ClassPrivateMethod",!0);e.body.push(i);let a="get"===i.kind?i.static?6:2:"set"===i.kind?i.static?5:1:0;this.declareClassPrivateMethodInScope(i,a)}declareClassPrivateMethodInScope(e,t){this.classScope.declarePrivateName(this.getPrivateNameSV(e.key),t,e.key.loc.start)}parsePostMemberNameModifiers(e){}parseClassPrivateProperty(e){return this.parseInitializer(e),this.semicolon(),this.finishNode(e,"ClassPrivateProperty")}parseClassProperty(e){return this.parseInitializer(e),this.semicolon(),this.finishNode(e,"ClassProperty")}parseClassAccessorProperty(e){return this.parseInitializer(e),this.semicolon(),this.finishNode(e,"ClassAccessorProperty")}parseInitializer(e){this.scope.enter(592),this.expressionScope.enter(new eq),this.prodParam.enter(0),e.value=this.eat(29)?this.parseMaybeAssignAllowIn():null,this.expressionScope.exit(),this.prodParam.exit(),this.scope.exit()}parseClassId(e,t,s,r=8331){if(L(this.state.type))e.id=this.parseIdentifier(),t&&this.declareNameFromIdentifier(e.id,r);else if(s||!t)e.id=null;else throw this.raise(m.MissingClassName,this.state.startLoc)}parseClassSuper(e){e.superClass=this.eat(81)?this.parseExprSubscripts():null}parseExport(e,t){let s,r=this.parseMaybeImportPhase(e,!0),i=this.maybeParseExportDefaultSpecifier(e,r),a=!i||this.eat(12),o=a&&this.eatExportStar(e),n=o&&this.maybeParseExportNamespaceSpecifier(e),l=a&&(!n||this.eat(12)),p=i||o;if(o&&!n){if(i&&this.unexpected(),t)throw this.raise(m.UnsupportedDecoratorExport,e);return this.parseExportFrom(e,!0),this.sawUnambiguousESM=!0,this.finishNode(e,"ExportAllDeclaration")}let c=this.maybeParseExportNamedSpecifiers(e);if(i&&a&&!o&&!c&&this.unexpected(null,5),n&&l&&this.unexpected(null,98),p||c){if(s=!1,t)throw this.raise(m.UnsupportedDecoratorExport,e);this.parseExportFrom(e,p)}else s=this.maybeParseExportDeclaration(e);if(p||c||s){var h;if(this.checkExport(e,!0,!1,!!e.source),(null==(h=e.declaration)?void 0:h.type)==="ClassDeclaration")this.maybeTakeDecorators(t,e.declaration,e);else if(t)throw this.raise(m.UnsupportedDecoratorExport,e);return this.sawUnambiguousESM=!0,this.finishNode(e,"ExportNamedDeclaration")}if(this.eat(65)){let s=this.parseExportDefaultExpression();if(e.declaration=s,"ClassDeclaration"===s.type)this.maybeTakeDecorators(t,s,e);else if(t)throw this.raise(m.UnsupportedDecoratorExport,e);return this.checkExport(e,!0,!0),this.sawUnambiguousESM=!0,this.finishNode(e,"ExportDefaultDeclaration")}throw this.unexpected(null,5)}eatExportStar(e){return this.eat(55)}maybeParseExportDefaultSpecifier(e,t){if(t||this.isExportDefaultSpecifier()){this.expectPlugin("exportDefaultFrom",null==t?void 0:t.loc.start);let s=t||this.parseIdentifier(!0),r=this.startNodeAtNode(s);return r.exported=s,e.specifiers=[this.finishNode(r,"ExportDefaultSpecifier")],!0}return!1}maybeParseExportNamespaceSpecifier(e){if(this.isContextual(93)){null!=e.specifiers||(e.specifiers=[]);let t=this.startNodeAt(this.state.lastTokStartLoc);return this.next(),t.exported=this.parseModuleExportName(),e.specifiers.push(this.finishNode(t,"ExportNamespaceSpecifier")),!0}return!1}maybeParseExportNamedSpecifiers(e){if(this.match(5)){e.specifiers||(e.specifiers=[]);let t="type"===e.exportKind;return e.specifiers.push(...this.parseExportSpecifiers(t)),e.source=null,this.hasPlugin("importAssertions")?e.assertions=[]:e.attributes=[],e.declaration=null,!0}return!1}maybeParseExportDeclaration(e){return!!this.shouldParseExportDeclaration()&&(e.specifiers=[],e.source=null,this.hasPlugin("importAssertions")?e.assertions=[]:e.attributes=[],e.declaration=this.parseExportDeclaration(e),!0)}isAsyncFunction(){if(!this.isContextual(95))return!1;let e=this.nextTokenInLineStart();return this.isUnparsedContextual(e,"function")}parseExportDefaultExpression(){let e=this.startNode();if(this.match(68))return this.next(),this.parseFunction(e,5);if(this.isAsyncFunction())return this.next(),this.next(),this.parseFunction(e,13);if(this.match(80))return this.parseClass(e,!0,!0);if(this.match(26))return this.hasPlugin("decorators")&&!0===this.getPluginOption("decorators","decoratorsBeforeExport")&&this.raise(m.DecoratorBeforeExport,this.state.startLoc),this.parseClass(this.maybeTakeDecorators(this.parseDecorators(!1),this.startNode()),!0,!0);if(this.match(75)||this.match(74)||this.isLet()||this.isUsing()||this.isAwaitUsing())throw this.raise(m.UnsupportedDefaultExport,this.state.startLoc);let t=this.parseMaybeAssignAllowIn();return this.semicolon(),t}parseExportDeclaration(e){return this.match(80)?this.parseClass(this.startNode(),!0,!1):this.parseStatementListItem()}isExportDefaultSpecifier(){let{type:e}=this.state;if(L(e)){if(95===e&&!this.state.containsEsc||100===e)return!1;if((130===e||129===e)&&!this.state.containsEsc){let e=this.nextTokenStart(),t=this.input.charCodeAt(e);if(123===t||this.chStartsBindingIdentifier(t,e)&&!this.input.startsWith("from",e))return this.expectOnePlugin(["flow","typescript"]),!1}}else if(!this.match(65))return!1;let t=this.nextTokenStart(),s=this.isUnparsedContextual(t,"from");if(44===this.input.charCodeAt(t)||L(this.state.type)&&s)return!0;if(this.match(65)&&s){let e=this.input.charCodeAt(this.nextTokenStartSince(t+4));return 34===e||39===e}return!1}parseExportFrom(e,t){this.eatContextual(98)?(e.source=this.parseImportSource(),this.checkExport(e),this.maybeParseImportAttributes(e),this.checkJSONModuleImport(e)):t&&this.unexpected(),this.semicolon()}shouldParseExportDeclaration(){let{type:e}=this.state;return 26===e&&(this.expectOnePlugin(["decorators","decorators-legacy"]),this.hasPlugin("decorators"))?(!0===this.getPluginOption("decorators","decoratorsBeforeExport")&&this.raise(m.DecoratorBeforeExport,this.state.startLoc),!0):this.isUsing()||this.isAwaitUsing()?(this.raise(m.UsingDeclarationExport,this.state.startLoc),!0):74===e||75===e||68===e||80===e||this.isLet()||this.isAsyncFunction()}checkExport(e,t,s,r){if(t){var i,a;if(s){if(this.checkDuplicateExports(e,"default"),this.hasPlugin("exportDefaultFrom")){let t=e.declaration;"Identifier"!==t.type||"from"!==t.name||t.end-t.start!=4||null!=(a=t.extra)&&a.parenthesized||this.raise(m.ExportDefaultFromAsIdentifier,t)}}else if(null!=(i=e.specifiers)&&i.length)for(let t of e.specifiers){let{exported:e}=t,s="Identifier"===e.type?e.name:e.value;if(this.checkDuplicateExports(t,s),!r&&t.local){let{local:e}=t;"Identifier"!==e.type?this.raise(m.ExportBindingIsString,t,{localName:e.value,exportName:s}):(this.checkReservedWord(e.name,e.loc.start,!0,!1),this.scope.checkLocalExport(e))}}else if(e.declaration){let t=e.declaration;if("FunctionDeclaration"===t.type||"ClassDeclaration"===t.type){let{id:s}=t;if(!s)throw Error("Assertion failure");this.checkDuplicateExports(e,s.name)}else if("VariableDeclaration"===t.type)for(let e of t.declarations)this.checkDeclaration(e.id)}}}checkDeclaration(e){if("Identifier"===e.type)this.checkDuplicateExports(e,e.name);else if("ObjectPattern"===e.type)for(let t of e.properties)this.checkDeclaration(t);else if("ArrayPattern"===e.type)for(let t of e.elements)t&&this.checkDeclaration(t);else"ObjectProperty"===e.type?this.checkDeclaration(e.value):"RestElement"===e.type?this.checkDeclaration(e.argument):"AssignmentPattern"===e.type&&this.checkDeclaration(e.left)}checkDuplicateExports(e,t){this.exportedIdentifiers.has(t)&&("default"===t?this.raise(m.DuplicateDefaultExport,e):this.raise(m.DuplicateExport,e,{exportName:t})),this.exportedIdentifiers.add(t)}parseExportSpecifiers(e){let t=[],s=!0;for(this.expect(5);!this.eat(8);){if(s)s=!1;else if(this.expect(12),this.eat(8))break;let r=this.isContextual(130),i=this.match(134),a=this.startNode();a.local=this.parseModuleExportName(),t.push(this.parseExportSpecifier(a,i,e,r))}return t}parseExportSpecifier(e,t,s,r){return this.eatContextual(93)?e.exported=this.parseModuleExportName():t?e.exported=this.cloneStringLiteral(e.local):e.exported||(e.exported=this.cloneIdentifier(e.local)),this.finishNode(e,"ExportSpecifier")}parseModuleExportName(){if(this.match(134)){let e=this.parseStringLiteral(this.state.value),t=ti.exec(e.value);return t&&this.raise(m.ModuleExportNameHasLoneSurrogate,e,{surrogateCharCode:t[0].charCodeAt(0)}),e}return this.parseIdentifier(!0)}isJSONModuleImport(e){return null!=e.assertions&&e.assertions.some(({key:e,value:t})=>"json"===t.value&&("Identifier"===e.type?"type"===e.name:"type"===e.value))}checkImportReflection(e){let{specifiers:t}=e,s=1===t.length?t[0].type:null;if("source"===e.phase)"ImportDefaultSpecifier"!==s&&this.raise(m.SourcePhaseImportRequiresDefault,t[0].loc.start);else if("defer"===e.phase)"ImportNamespaceSpecifier"!==s&&this.raise(m.DeferImportRequiresNamespace,t[0].loc.start);else if(e.module){var r;"ImportDefaultSpecifier"!==s&&this.raise(m.ImportReflectionNotBinding,t[0].loc.start),(null==(r=e.assertions)?void 0:r.length)>0&&this.raise(m.ImportReflectionHasAssertion,t[0].loc.start)}}checkJSONModuleImport(e){if(this.isJSONModuleImport(e)&&"ExportAllDeclaration"!==e.type){let{specifiers:t}=e;if(null!=t){let e=t.find(e=>{let t;if("ExportSpecifier"===e.type?t=e.local:"ImportSpecifier"===e.type&&(t=e.imported),void 0!==t)return"Identifier"===t.type?"default"!==t.name:"default"!==t.value});void 0!==e&&this.raise(m.ImportJSONBindingNotDefault,e.loc.start)}}}isPotentialImportPhase(e){return!e&&(this.isContextual(105)||this.isContextual(97)||this.isContextual(127))}applyImportPhase(e,t,s,r){!t&&("module"===s?(this.expectPlugin("importReflection",r),e.module=!0):this.hasPlugin("importReflection")&&(e.module=!1),"source"===s?(this.expectPlugin("sourcePhaseImports",r),e.phase="source"):"defer"===s?(this.expectPlugin("deferredImportEvaluation",r),e.phase="defer"):this.hasPlugin("sourcePhaseImports")&&(e.phase=null))}parseMaybeImportPhase(e,t){if(!this.isPotentialImportPhase(t))return this.applyImportPhase(e,t,null),null;let s=this.startNode(),r=this.parseIdentifierName(!0),{type:i}=this.state;return(O(i)?98!==i||102===this.lookaheadCharCode():12!==i)?(this.applyImportPhase(e,t,r,s.loc.start),null):(this.applyImportPhase(e,t,null),this.createIdentifier(s,r))}isPrecedingIdImportPhase(e){let{type:t}=this.state;return L(t)?98!==t||102===this.lookaheadCharCode():12!==t}parseImport(e){return this.match(134)?this.parseImportSourceAndAttributes(e):this.parseImportSpecifiersAndAfter(e,this.parseMaybeImportPhase(e,!1))}parseImportSpecifiersAndAfter(e,t){e.specifiers=[];let s=!this.maybeParseDefaultImportSpecifier(e,t)||this.eat(12),r=s&&this.maybeParseStarImportSpecifier(e);return s&&!r&&this.parseNamedImportSpecifiers(e),this.expectContextual(98),this.parseImportSourceAndAttributes(e)}parseImportSourceAndAttributes(e){return null!=e.specifiers||(e.specifiers=[]),e.source=this.parseImportSource(),this.maybeParseImportAttributes(e),this.checkImportReflection(e),this.checkJSONModuleImport(e),this.semicolon(),this.sawUnambiguousESM=!0,this.finishNode(e,"ImportDeclaration")}parseImportSource(){return this.match(134)||this.unexpected(),this.parseExprAtom()}parseImportSpecifierLocal(e,t,s){t.local=this.parseIdentifier(),e.specifiers.push(this.finishImportSpecifier(t,s))}finishImportSpecifier(e,t,s=8201){return this.checkLVal(e.local,{type:t},s),this.finishNode(e,t)}parseImportAttributes(){this.expect(5);let e=[],t=new Set;do{if(this.match(8))break;let s=this.startNode(),r=this.state.value;if(t.has(r)&&this.raise(m.ModuleAttributesWithDuplicateKeys,this.state.startLoc,{key:r}),t.add(r),this.match(134)?s.key=this.parseStringLiteral(r):s.key=this.parseIdentifier(!0),this.expect(14),!this.match(134))throw this.raise(m.ModuleAttributeInvalidValue,this.state.startLoc);s.value=this.parseStringLiteral(this.state.value),e.push(this.finishNode(s,"ImportAttribute"))}while(this.eat(12))return this.expect(8),e}parseModuleAttributes(){let e=[],t=new Set;do{let s=this.startNode();if(s.key=this.parseIdentifier(!0),"type"!==s.key.name&&this.raise(m.ModuleAttributeDifferentFromType,s.key),t.has(s.key.name)&&this.raise(m.ModuleAttributesWithDuplicateKeys,s.key,{key:s.key.name}),t.add(s.key.name),this.expect(14),!this.match(134))throw this.raise(m.ModuleAttributeInvalidValue,this.state.startLoc);s.value=this.parseStringLiteral(this.state.value),e.push(this.finishNode(s,"ImportAttribute"))}while(this.eat(12))return e}maybeParseImportAttributes(e){let t;var s=!1;if(this.match(76)){if(this.hasPrecedingLineBreak()&&40===this.lookaheadCharCode())return;this.next(),this.hasPlugin("moduleAttributes")?(t=this.parseModuleAttributes(),this.addExtra(e,"deprecatedWithLegacySyntax",!0)):t=this.parseImportAttributes(),s=!0}else this.isContextual(94)&&!this.hasPrecedingLineBreak()?(this.hasPlugin("deprecatedImportAssert")||this.hasPlugin("importAssertions")||this.raise(m.ImportAttributesUseAssert,this.state.startLoc),this.hasPlugin("importAssertions")||this.addExtra(e,"deprecatedAssertSyntax",!0),this.next(),t=this.parseImportAttributes()):t=[];!s&&this.hasPlugin("importAssertions")?e.assertions=t:e.attributes=t}maybeParseDefaultImportSpecifier(e,t){if(t){let s=this.startNodeAtNode(t);return s.local=t,e.specifiers.push(this.finishImportSpecifier(s,"ImportDefaultSpecifier")),!0}return!!O(this.state.type)&&(this.parseImportSpecifierLocal(e,this.startNode(),"ImportDefaultSpecifier"),!0)}maybeParseStarImportSpecifier(e){if(this.match(55)){let t=this.startNode();return this.next(),this.expectContextual(93),this.parseImportSpecifierLocal(e,t,"ImportNamespaceSpecifier"),!0}return!1}parseNamedImportSpecifiers(e){let t=!0;for(this.expect(5);!this.eat(8);){if(t)t=!1;else{if(this.eat(14))throw this.raise(m.DestructureNamedImport,this.state.startLoc);if(this.expect(12),this.eat(8))break}let s=this.startNode(),r=this.match(134),i=this.isContextual(130);s.imported=this.parseModuleExportName();let a=this.parseImportSpecifier(s,r,"type"===e.importKind||"typeof"===e.importKind,i,void 0);e.specifiers.push(a)}}parseImportSpecifier(e,t,s,r,i){if(this.eatContextual(93))e.local=this.parseIdentifier();else{let{imported:s}=e;if(t)throw this.raise(m.ImportBindingIsString,e,{importName:s.value});this.checkReservedWord(s.name,e.loc.start,!0,!0),e.local||(e.local=this.cloneIdentifier(s))}return this.finishImportSpecifier(e,"ImportSpecifier",i)}isThisParam(e){return"Identifier"===e.type&&"this"===e.name}}class tn extends to{constructor(e,t,s){const r=function(e){let t={sourceType:"script",sourceFilename:void 0,startIndex:0,startColumn:0,startLine:1,allowAwaitOutsideFunction:!1,allowReturnOutsideFunction:!1,allowNewTargetOutsideFunction:!1,allowImportExportEverywhere:!1,allowSuperOutsideMethod:!1,allowUndeclaredExports:!1,allowYieldOutsideFunction:!1,plugins:[],strictMode:void 0,ranges:!1,tokens:!1,createImportExpressions:!1,createParenthesizedExpressions:!1,errorRecovery:!1,attachComment:!0,annexB:!0};if(null==e)return t;if(null!=e.annexB&&!1!==e.annexB)throw Error("The `annexB` option can only be set to `false`.");for(let s of Object.keys(t))null!=e[s]&&(t[s]=e[s]);if(1===t.startLine)null==e.startIndex&&t.startColumn>0?t.startIndex=t.startColumn:null==e.startColumn&&t.startIndex>0&&(t.startColumn=t.startIndex);else if((null==e.startColumn||null==e.startIndex)&&null!=e.startIndex)throw Error("With a `startLine > 1` you must also specify `startIndex` and `startColumn`.");if("commonjs"===t.sourceType){if(null!=e.allowAwaitOutsideFunction)throw Error("The `allowAwaitOutsideFunction` option cannot be used with `sourceType: 'commonjs'`.");if(null!=e.allowReturnOutsideFunction)throw Error("`sourceType: 'commonjs'` implies `allowReturnOutsideFunction: true`, please remove the `allowReturnOutsideFunction` option or use `sourceType: 'script'`.");if(null!=e.allowNewTargetOutsideFunction)throw Error("`sourceType: 'commonjs'` implies `allowNewTargetOutsideFunction: true`, please remove the `allowNewTargetOutsideFunction` option or use `sourceType: 'script'`.")}return t}(e);super(r,t),this.options=r,this.initializeScopes(),this.plugins=s,this.filename=r.sourceFilename,this.startIndex=r.startIndex;let i=0;r.allowAwaitOutsideFunction&&(i|=1),r.allowReturnOutsideFunction&&(i|=2),r.allowImportExportEverywhere&&(i|=8),r.allowSuperOutsideMethod&&(i|=16),r.allowUndeclaredExports&&(i|=64),r.allowNewTargetOutsideFunction&&(i|=4),r.allowYieldOutsideFunction&&(i|=32),r.ranges&&(i|=128),r.tokens&&(i|=256),r.createImportExpressions&&(i|=512),r.createParenthesizedExpressions&&(i|=1024),r.errorRecovery&&(i|=2048),r.attachComment&&(i|=4096),r.annexB&&(i|=8192),this.optionFlags=i}getScopeHandler(){return er}parse(){this.enterInitialScopes();let e=this.startNode(),t=this.startNode();this.nextToken(),e.errors=null;let s=this.parseTopLevel(e,t);return s.errors=this.state.errors,s.comments.length=this.state.commentsLen,s}}let tl=function(e){let t={};for(let s of Object.keys(e))t[s]=N[e[s]];return t}(D);function tp(e,t){let s=tn,r=new Map;if(null!=e&&e.plugins){for(let t of e.plugins){let e,s;"string"==typeof t?e=t:[e,s]=t,r.has(e)||r.set(e,s||{})}!function(e){if(e.has("decorators")){if(e.has("decorators-legacy"))throw Error("Cannot use the decorators and decorators-legacy plugin together");let t=e.get("decorators").decoratorsBeforeExport;if(null!=t&&"boolean"!=typeof t)throw Error("'decoratorsBeforeExport' must be a boolean, if specified.");let s=e.get("decorators").allowCallParenthesized;if(null!=s&&"boolean"!=typeof s)throw Error("'allowCallParenthesized' must be a boolean.")}if(e.has("flow")&&e.has("typescript"))throw Error("Cannot combine flow and typescript plugins.");if(e.has("placeholders")&&e.has("v8intrinsic"))throw Error("Cannot combine placeholders and v8intrinsic plugins.");if(e.has("pipelineOperator")){var t,s;let r=e.get("pipelineOperator").proposal;if(!e9.includes(r)){let e=e9.map(e=>`"${e}"`).join(", ");throw Error(`"pipelineOperator" requires "proposal" option whose value must be one of: ${e}.`)}if("hack"===r){if(e.has("placeholders"))throw Error("Cannot combine placeholders plugin and Hack-style pipes.");if(e.has("v8intrinsic"))throw Error("Cannot combine v8intrinsic plugin and Hack-style pipes.");let t=e.get("pipelineOperator").topicToken;if(!e6.includes(t)){let e=e6.map(e=>`"${e}"`).join(", ");throw Error(`"pipelineOperator" in "proposal": "hack" mode also requires a "topicToken" option whose value must be one of: ${e}.`)}if("#"===t&&(null==(s=e.get("recordAndTuple"))?void 0:s.syntaxType)==="hash")throw Error(`Plugin conflict between \`["pipelineOperator", { proposal: "hack", topicToken: "#" }]\` and \`${JSON.stringify(["recordAndTuple",e.get("recordAndTuple")])}\`.`)}else if("smart"===r&&(null==(t=e.get("recordAndTuple"))?void 0:t.syntaxType)==="hash")throw Error(`Plugin conflict between \`["pipelineOperator", { proposal: "smart" }]\` and \`${JSON.stringify(["recordAndTuple",e.get("recordAndTuple")])}\`.`)}if(e.has("moduleAttributes")){if(e.has("deprecatedImportAssert")||e.has("importAssertions"))throw Error("Cannot combine importAssertions, deprecatedImportAssert and moduleAttributes plugins.");if("may-2020"!==e.get("moduleAttributes").version)throw Error("The 'moduleAttributes' plugin requires a 'version' option, representing the last proposal update. Currently, the only supported value is 'may-2020'.")}if(e.has("importAssertions")&&e.has("deprecatedImportAssert"))throw Error("Cannot combine importAssertions and deprecatedImportAssert plugins.");if(e.has("deprecatedImportAssert")||e.has("importAttributes")&&e.get("importAttributes").deprecatedAssertSyntax&&e.set("deprecatedImportAssert",{}),e.has("recordAndTuple")){let t=e.get("recordAndTuple").syntaxType;if(null!=t){let e=["hash","bar"];if(!e.includes(t))throw Error("The 'syntaxType' option of the 'recordAndTuple' plugin must be one of: "+e.map(e=>`'${e}'`).join(", "))}}if(e.has("asyncDoExpressions")&&!e.has("doExpressions")){let e=Error("'asyncDoExpressions' requires 'doExpressions', please add 'doExpressions' to parser plugins.");throw e.missingPlugins="doExpressions",e}if(e.has("optionalChainingAssign")&&"2023-07"!==e.get("optionalChainingAssign").version)throw Error("The 'optionalChainingAssign' plugin requires a 'version' option, representing the last proposal update. Currently, the only supported value is '2023-07'.");if(e.has("discardBinding")&&"void"!==e.get("discardBinding").syntaxType)throw Error("The 'discardBinding' plugin requires a 'syntaxType' option. Currently the only supported value is 'void'.")}(r),s=function(e){let t=[];for(let s of te)e.has(s)&&t.push(s);let s=t.join("|"),r=tc.get(s);if(!r){for(let e of(r=tn,t))r=e7[e](r);tc.set(s,r)}return r}(r)}return new s(e,t,r)}let tc=new Map;s.parse=function(e,t){var s;if((null==(s=t)?void 0:s.sourceType)!=="unambiguous")return tp(t,e).parse();t=Object.assign({},t);try{t.sourceType="module";let s=tp(t,e),r=s.parse();if(s.sawUnambiguousESM)return r;if(s.ambiguousScriptDifferentAst)try{return t.sourceType="script",tp(t,e).parse()}catch(e){}else r.program.sourceType="script";return r}catch(s){try{return t.sourceType="script",tp(t,e).parse()}catch(e){}throw s}},s.parseExpression=function(e,t){let s=tp(t,e);return s.options.strictMode&&(s.state.strict=!0),s.getExpression()},s.tokTypes=tl},686690,148468,687621,e=>{"use strict";var t=e.i(647163),s=e.i(359445);let r={"lucide-react":{version:"0.563.0",capabilities:["ui"]},recharts:{version:"2.9.0",capabilities:["visualization"]},"react-router-dom":{version:"6.30.4"},"@radix-ui/react-accordion":{version:"^1.2.0",capabilities:["ui"]},"@radix-ui/react-alert-dialog":{version:"^1.1.1",capabilities:["ui"]},"@radix-ui/react-aspect-ratio":{version:"^1.1.0"},"@radix-ui/react-avatar":{version:"^1.1.0"},"@radix-ui/react-checkbox":{version:"^1.1.1"},"@radix-ui/react-collapsible":{version:"^1.1.0"},"@radix-ui/react-dialog":{version:"^1.1.1",capabilities:["ui"]},"@radix-ui/react-dropdown-menu":{version:"^2.1.1"},"@radix-ui/react-hover-card":{version:"^1.1.1"},"@radix-ui/react-label":{version:"^2.1.0"},"@radix-ui/react-menubar":{version:"^1.1.1"},"@radix-ui/react-navigation-menu":{version:"^1.2.0"},"@radix-ui/react-popover":{version:"^1.1.1"},"@radix-ui/react-progress":{version:"^1.1.0"},"@radix-ui/react-radio-group":{version:"^1.2.0"},"@radix-ui/react-scroll-area":{version:"^1.2.10"},"@radix-ui/react-select":{version:"^2.1.1"},"@radix-ui/react-separator":{version:"^1.1.0"},"@radix-ui/react-slider":{version:"^1.2.0"},"@radix-ui/react-slot":{version:"^1.1.0"},"@radix-ui/react-switch":{version:"^1.1.0"},"@radix-ui/react-tabs":{version:"^1.1.0"},"@radix-ui/react-toast":{version:"^1.2.1"},"@radix-ui/react-toggle":{version:"^1.1.0"},"@radix-ui/react-toggle-group":{version:"^1.1.0"},"@radix-ui/react-tooltip":{version:"^1.1.2"},"@hookform/resolvers":{version:"5.4.0",capabilities:["forms"]},"@tanstack/react-query":{version:"5.101.2",capabilities:["data"]},"@tanstack/react-table":{version:"8.21.3",capabilities:["data","ui"]},"@xyflow/react":{version:"12.11.2",capabilities:["ui","visualization"]},"class-variance-authority":{version:"^0.7.0"},clsx:{version:"^2.1.1"},"date-fns":{version:"^3.6.0"},"embla-carousel-react":{version:"^8.1.8"},"framer-motion":{version:"^11.15.0",capabilities:["animation"]},motion:{version:"12.43.0",capabilities:["animation"]},gsap:{version:"3.14.2",capabilities:["animation"]},"@types/gsap":{version:"3.0.0"},"fuse.js":{version:"7.5.0",capabilities:["data"]},"qrcode.react":{version:"4.2.0",capabilities:["visualization"]},"react-colorful":{version:"5.8.0",capabilities:["ui"]},"react-day-picker":{version:"^8.10.1"},"react-dnd":{version:"16.0.1",capabilities:["ui"]},"react-dnd-html5-backend":{version:"16.0.1"},"react-dnd-touch-backend":{version:"16.0.1"},"@supabase/supabase-js":{version:"2.110.8",capabilities:["data"]},"@supabase/ssr":{version:"0.12.3",capabilities:["data"]},"react-dropzone":{version:"17.0.0",capabilities:["ui"]},"react-hook-form":{version:"7.81.0",capabilities:["forms"]},"react-markdown":{version:"10.1.0",capabilities:["ui"]},"react-resizable-panels":{version:"4.12.2",capabilities:["ui"]},"remark-gfm":{version:"4.0.1"},"tailwind-merge":{version:"^2.4.0"},"tailwindcss-animate":{version:"^1.0.7",capabilities:["animation"]},vaul:{version:"^0.9.1",capabilities:["ui"]},three:{version:"0.177.0",capabilities:["three-dimensional"]},"@types/three":{version:"0.177.0"},"@react-three/fiber":{version:"9.6.1",capabilities:["three-dimensional"]},"@react-three/drei":{version:"10.7.7",capabilities:["three-dimensional"]},"@react-three/postprocessing":{version:"3.0.4",capabilities:["three-dimensional"]},"@react-three/rapier":{version:"2.2.0",capabilities:["three-dimensional"]},"@react-three/cannon":{version:"6.6.0",capabilities:["three-dimensional"]},"@splinetool/react-spline":{version:"4.1.0",companions:["@splinetool/runtime"],capabilities:["three-dimensional"]},"@splinetool/runtime":{version:"1.12.98",capabilities:["three-dimensional"]},"three-stdlib":{version:"2.36.1",capabilities:["three-dimensional"]},maath:{version:"0.10.8",capabilities:["three-dimensional"]},postprocessing:{version:"6.39.3",capabilities:["three-dimensional"]},leva:{version:"0.10.1",capabilities:["three-dimensional","ui"]},"@paper-design/shaders-react":{version:"0.0.77",capabilities:["three-dimensional","visualization"]},sonner:{version:"2.0.7",capabilities:["ui"]},"react-leaflet":{version:"5.0.0",capabilities:["mapping"]},leaflet:{version:"1.9.4",capabilities:["mapping"]},"@types/leaflet":{version:"1.9.21"},"react-syntax-highlighter":{version:"15.8.0",capabilities:["ui"]},"react-intersection-observer":{version:"9.16.0"},cmdk:{version:"1.1.1",capabilities:["ui"]},"hls.js":{version:"1.6.16",capabilities:["media"]},"@uiw/react-md-editor":{version:"4.0.6",capabilities:["ui"]},"@use-gesture/react":{version:"10.3.1",capabilities:["ui"]},"react-countup":{version:"6.5.3",capabilities:["animation"]},"react-resizable":{version:"3.0.4",capabilities:["ui"]},"@types/react-resizable":{version:"3.0.8"},"@tanstack/react-virtual":{version:"3.14.7",capabilities:["ui"]},jspdf:{version:"4.2.1",capabilities:["media"]},"@react-pdf/renderer":{version:"4.5.1",capabilities:["media"]},howler:{version:"2.2.4",capabilities:["media"]},"react-arborist":{version:"3.15.0",capabilities:["ui"]},"react-masonry-css":{version:"1.0.16",capabilities:["ui"]},"yet-another-react-lightbox":{version:"3.32.1",capabilities:["media"]},"@tsparticles/react":{version:"4.3.2",capabilities:["animation","visualization"]},"@tsparticles/engine":{version:"4.3.2",capabilities:["animation","visualization"]},"@tsparticles/slim":{version:"4.3.2",capabilities:["animation","visualization"]},"react-parallax":{version:"3.5.2",capabilities:["animation"]},zod:{version:"4.4.3",capabilities:["data","forms"]},zustand:{version:"5.0.14",capabilities:["state"]}},i=Object.freeze(Object.fromEntries(Object.entries(r).map(([e,t])=>[e,t.version]))),a=new Set(["react","react-dom"]),o=new Set(["assert","buffer","child_process","cluster","crypto","dgram","dns","events","fs","http","https","module","net","os","path","perf_hooks","process","querystring","readline","stream","string_decoder","timers","tls","tty","url","util","v8","vm","worker_threads","zlib"]);function n(e){let t=new Set,i=new Set,n=[],d=new Set;for(let h of e){let e="string"==typeof h?void 0:h.path,m=function(e){try{let t=(0,s.parse)(e,{sourceType:"module",plugins:["jsx","typescript","importAttributes"],createImportExpressions:!0}),r=new Set,i=!1;return function e(t,s){if(Array.isArray(t)){for(let r of t)e(r,s);return}if(l(t))for(let[r,i]of(s(t),Object.entries(t)))"loc"!==r&&"extra"!==r&&"leadingComments"!==r&&"innerComments"!==r&&"trailingComments"!==r&&"object"==typeof i&&null!==i&&e(i,s)}(t,e=>{if("ImportDeclaration"===e.type||"ExportNamedDeclaration"===e.type||"ExportAllDeclaration"===e.type){let t=p(e.source);t&&r.add(t);return}if("ImportExpression"===e.type){let t=p(e.source);t?r.add(t):i=!0;return}if("CallExpression"===e.type&&l(e.callee)&&"Import"===e.callee.type){let t=Array.isArray(e.arguments)?p(e.arguments[0]):null;t?r.add(t):i=!0}}),{sources:Array.from(r),hasNonLiteralDynamicImport:i}}catch{return{sources:[],hasNonLiteralDynamicImport:!1}}}("string"==typeof h?h:h.code);for(let s of(m.hasNonLiteralDynamicImport&&c(n,d,{path:e,code:"NON_LITERAL_DYNAMIC_IMPORT",message:"Dynamic imports must use a string literal so Squid can select dependencies deterministically before the preview starts."}),m.sources)){var u;if(i.add(s),(u=s).startsWith(".")||u.startsWith("/")||u.startsWith("@/"))continue;let l=s.startsWith("@")?s.split("/").slice(0,2).join("/"):s.split("/")[0];if(!a.has(l)){if(s.startsWith("node:")||o.has(l)){c(n,d,{path:e,source:s,packageName:l,code:"UNSUPPORTED_NODE_BUILTIN",message:`Node.js built-in module "${s}" is unavailable in Squid's browser preview. Remove it or use a browser-safe API.`});continue}if(function(e){try{return!!new URL(e).protocol}catch{return!1}}(s)){c(n,d,{path:e,source:s,packageName:l,code:"UNSUPPORTED_URL_IMPORT",message:`URL import "${s}" is unsupported. Import an allowlisted package by name or include the source in the generated app.`});continue}if(!(l in r)){c(n,d,{path:e,source:s,packageName:l,code:"UNSUPPORTED_EXTERNAL_IMPORT",message:`Unsupported external package "${l}" imported from "${s}". Use a package supported by Squid or remove the import.`});continue}!function e(t,s){if(!s.has(t))for(let i of(s.add(t),r[t].companions??[]))e(i,s)}(l,t)}}}return{dependencies:Object.fromEntries(Array.from(t).sort().map(e=>[e,r[e].version])),diagnostics:n.sort(h),importSources:Array.from(i).sort()}}function l(e){return"object"==typeof e&&null!==e&&"type"in e&&"string"==typeof e.type}function p(e){return l(e)&&"StringLiteral"===e.type&&"string"==typeof e.value?e.value:null}function c(e,t,s){let r=[s.path,s.code,s.source].join(":");t.has(r)||(t.add(r),e.push(s))}function h(e,t){return`${e.path??""}:${e.code}:${e.source??""}`.localeCompare(`${t.path??""}:${t.code}:${t.source??""}`)}e.s(["generatedAppDependencies",0,i,"getRequiredGeneratedAppDependencies",0,function(e){return n(e).dependencies},"preflightGeneratedAppImports",0,n],148468);var d=e.i(513116);let u=/\bfetch\s*\(/g,m=/https?:\/\/[^\s"'`)<>{]+/g,f=/\bimport\.meta\.env\.([A-Z][A-Z0-9_]*)\b/g,y=/(?:SECRET|PRIVATE|SERVER|ADMIN|SERVICE_ROLE|PASSWORD)/i,g=/\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|secret|password|private[_-]?key)\b\s*[:=]\s*["'`]([A-Za-z0-9_\-./+=]{12,})["'`]/gi,x=/\b(?:authorization|x-api-key|api-key)\b\s*[:=]\s*["'`](?:Bearer\s+)?([A-Za-z0-9_\-./+=]{12,})["'`]/gi,b=/["'`](?:User-Agent|Origin|Host|Referer|Cookie|Content-Length)["'`]\s*:/gi;function P(e){return Array.from(new Set(e)).sort()}function v(e,t){return t.lastIndex=0,t.test(e)}function T(e,t,s=0){let r,i=[];for(t.lastIndex=0;null!==(r=t.exec(e));)i.push(r[s]);return i}function w(e){let t=e.map(e=>e.code).join("\n"),s=T(t,u).length,r=P(T(t,m)),i=P(T(t,f,1)),a=[],o=[],n=new Map;for(let e of r){let t=(0,d.findIntegrationProviderByUrl)(e);if(!t)continue;let s=n.get(t.id);if(s){s.matchedEndpoints=P([...s.matchedEndpoints,e]);continue}n.set(t.id,{id:t.id,name:t.name,policyStatus:t.policyStatus,runtime:t.runtime,commercialUse:t.commercialUse,docsUrl:t.docsUrl,matchedEndpoints:[e]})}for(let e of n.values()){if("blocked"===e.policyStatus){a.push({message:`${e.name} is blocked by Squid's integration policy. Choose a compliant provider or a user-controlled deployment instead.`});continue}"conditional"===e.policyStatus&&o.push(`${e.name} requires setup or policy review before production use.`),"server"===e.runtime&&o.push(`${e.name} requires a server-side integration for reliable or authenticated use.`),"allowed"!==e.commercialUse&&o.push(`${e.name} commercial-use terms must be reviewed before deployment.`)}let l=Array.from(n.values()).sort((e,t)=>e.name.localeCompare(t.name));for(let t of e)v(t.code,u)&&(/\bresponse\.ok\b|\b[a-zA-Z_$][\w$]*\.ok\b/.test(t.code)||a.push({path:t.path,message:"Live API requests must reject non-success HTTP responses before reading data."}),/\bAbortController\b/.test(t.code)||a.push({path:t.path,message:"Live API requests must use AbortController to enforce a timeout."}),/\b(?:retry|retries|attempt|attempts|maxAttempts|MAX_ATTEMPTS|MAX_RETRIES|RETRY_COUNT|backoff|tries)\b/i.test(t.code)||a.push({path:t.path,message:"Live API requests must include a bounded retry path."}),/\b(?:is[A-Z][A-Za-z0-9]*|validate[A-Z][A-Za-z0-9]*|safeParse|Array\.isArray)\b/.test(t.code)||a.push({path:t.path,message:"Live API responses must be validated at runtime before rendering."}),v(t.code,b)&&a.push({path:t.path,message:"Browser fetch must not set forbidden request headers such as User-Agent, Origin, Host, Referer, Cookie, or Content-Length."}));for(let t of e){for(let e of T(t.code,g,1))a.push({path:t.path,message:"Hard-coded API credentials are forbidden in generated browser code."});for(let e of T(t.code,x,1))a.push({path:t.path,message:"Secret-bearing authorization headers are forbidden in generated browser code."})}for(let e of i)e.startsWith("VITE_")||a.push({message:`Browser environment variable ${e} must use the VITE_ prefix.`}),y.test(e)&&a.push({message:`Environment variable ${e} appears secret-bearing and cannot be exposed to the browser.`});return 0===s?{status:a.length>0?"blocked":i.length>0||o.length>0?"setup_required":"not_detected",requestsDetected:s,endpoints:r,environmentVariables:i,providers:l,policyWarnings:P(o),issues:a}:{status:a.length>0?"blocked":i.length>0||o.length>0?"setup_required":"verified",requestsDetected:s,endpoints:r,environmentVariables:i,providers:l,policyWarnings:P(o),issues:a}}function A(e){return e.replace(/\/+$/,"")||"/"}function N(e,t){let s=Array.from(new Set(t));if(0===s.length)return[];let r=w(e),i=e.find(e=>/(^|\/)integrations\.(?:ts|tsx|js|jsx)$/i.test(e.path)),a=[];for(let t of s){let s=(0,d.getIntegrationProvider)(t);if(!s){a.push({message:`Selected API ${t} is not present in Squid's reviewed integration registry.`});continue}if("blocked"===s.policyStatus){a.push({message:`${s.name} is selected but blocked by Squid's integration policy.`});continue}let o=RegExp(`["']${s.id.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}["']`);if(i&&o.test(i.code)||a.push({path:i?.path,message:`Selected API ${s.name} [${s.id}] must be declared in integrations.ts with its exact providerId.`}),"supabase"===s.id){e.some(e=>/\bimport\s*{[^}]*\bsupabase\b[^}]*}\s*from\s*["']@\/lib\/supabase["']/.test(e.code))||a.push({message:'Selected API Supabase [supabase] must import its protected browser client from "@/lib/supabase".'});continue}if("browser"!==s.runtime||"none"!==s.auth)continue;let n=r.providers.find(e=>e.id===s.id);if(!n||0===n.matchedEndpoints.length){a.push({message:`Selected API ${s.name} [${s.id}] must be called at runtime from its reviewed endpoint contract; mock or static data is not allowed.`});continue}let l=new URL(s.baseUrl);for(let e of n.matchedEndpoints){let t;try{t=new URL(e)}catch{continue}let r=t.origin===l.origin,i="/"===l.pathname||t.pathname===l.pathname||t.pathname.startsWith(`${l.pathname.replace(/\/$/,"")}/`);r&&!i&&a.push({message:`${s.name} endpoint ${e} is outside the reviewed base URL ${s.baseUrl}. Do not invent or use legacy API versions.`});let o=s.endpointContracts,n=A(t.pathname)===A(l.pathname)&&0===t.search.length;if(!r||n||!o?.length)continue;let p=o.find(e=>(function(e,t){let s=A(e).split("/"),r=A(t).split("/");return s.length===r.length&&r.every((e,t)=>/^\{[^{}]+\}$/.test(e)?s[t].length>0:s[t]===e)})(t.pathname,e.path));if(!p){a.push({message:`${s.name} endpoint ${e} is not in the reviewed endpoint contract. Use only ${o.map(e=>`${e.method} ${e.path}`).join(", ")}.`});continue}let c=new Set(p.parameters.filter(e=>"query"===e.in).map(e=>e.name)),h=Array.from(t.searchParams.keys()).filter(e=>!c.has(e));h.length>0&&a.push({message:`${s.name} endpoint ${e} uses undocumented query parameter${1===h.length?"":"s"}: ${h.join(", ")}.`});let d=p.parameters.filter(e=>"query"===e.in&&e.required&&!t.searchParams.has(e.name)).map(e=>e.name);d.length>0&&a.push({message:`${s.name} endpoint ${e} is missing required query parameter${1===d.length?"":"s"}: ${d.join(", ")}.`})}}return a}e.s(["analyzeGeneratedApiIntegration",0,w,"validateSelectedApiUsage",0,N],687621);let S=new Set(["components/ui/accordion","components/ui/alert","components/ui/alert-dialog","components/ui/avatar","components/ui/badge","components/ui/breadcrumb","components/ui/button","components/ui/calendar","components/ui/card","components/ui/carousel","components/ui/checkbox","components/ui/collapsible","components/ui/dialog","components/ui/drawer","components/ui/dropdown-menu","components/ui/form","components/ui/hover-card","components/ui/input","components/ui/label","components/ui/menubar","components/ui/navigation-menu","components/ui/pagination","components/ui/popover","components/ui/progress","components/ui/radio-group","components/ui/resizable","components/ui/scroll-area","components/ui/select","components/ui/separator","components/ui/skeleton","components/ui/slider","components/ui/switch","components/ui/table","components/ui/tabs","components/ui/textarea","components/ui/toast","components/ui/toaster","components/ui/toggle","components/ui/toggle-group","components/ui/tooltip","components/ui/use-toast","components/ui/index","lib/supabase","lib/utils","squid-runtime/supabase"]),C=new Set([...S].filter(e=>"components/ui/button"!==e&&"components/ui/badge"!==e&&"components/ui/navigation-menu"!==e&&"components/ui/toggle"!==e));function E(e){return S.has(e)}let I=/\b(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,k=/\bimport\s+(type\s+)?([\s\S]*?)\s+from\s+["']([^"']+)["'];?/g;function R(e){return e.replace(/\.(tsx|ts|jsx|js|json|css)$/i,"")}function M(e){var t=e.replace(/^@\//,"").replace(/^\//,"").replace(/^\.\//,"").replace(/\\/g,"/").replace(/\/+/g,"/").replace(/^src\//,"").replace(/^app\//,"");let s=[];for(let e of t.split("/"))if(e&&"."!==e){if(".."===e){s.pop();continue}s.push(e)}return s.join("/")}function D(e,t){return Object.defineProperty(e,"protectedPathsBlocked",{value:t.protectedPathsBlocked,enumerable:!1,configurable:!0}),e}function L(e){return{protectedPathsBlocked:"number"==typeof e.protectedPathsBlocked?e.protectedPathsBlocked:0}}function O(e,t=[]){let s=[];for(let t of(e.find(e=>"App.tsx"===e.path)||s.push({message:"Missing App.tsx entry file."}),s.push(...n(e).diagnostics.map(({path:e,message:t})=>({path:e,message:t}))),e)){for(let i of B(t.code))if(_(i)){var r;E(R(M(i)))||(r=t.path,H(r,i,e)||s.push({path:t.path,message:`Unresolved internal import "${i}". Generate the imported file or remove the import.`}))}for(let r of U(t.code)){let{source:i}=r;if(!_(i)||E(R(M(i)))&&!H(t.path,i,e))continue;let a=H(t.path,i,e);a&&s.push(...function(e,t,s){if(!/\.(tsx|ts|jsx|js)$/i.test(s.path))return[];let r=[],i=function(e){let t,s=j(e),r=new Set,i=/\bexport\s+default\b/.test(s),a=s.match(/\bexport\s+default\s+(?:async\s+)?(?:function|class)?\s*([A-Za-z_$][\w$]*)?/)?.[1];for(let e of[/\bexport\s+(?:declare\s+)?(?:async\s+)?(?:function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g,/\bexport\s+(?:declare\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g]){let t;for(e.lastIndex=0;null!==(t=e.exec(s));)r.add(t[1])}let o=/\bexport\s*{([\s\S]*?)}(?:\s*from\s*["'][^"']+["'])?\s*;?/g;for(;null!==(t=o.exec(s));)for(let e of t[1].split(",")){let t=e.trim().replace(/^type\s+/,"");if(!t)continue;let[s,o=s]=t.split(/\s+as\s+/).map(e=>e.trim());s&&o&&("default"===o?(i=!0,a="default"===s?a:s):/^[A-Za-z_$][\w$]*$/.test(o)&&r.add(o))}return{hasDefault:i,defaultName:a,namedExports:r}}(s.code);if(t.defaultImport&&!i.hasDefault){let a=i.namedExports.has(t.defaultImport);r.push({path:e,message:a?`Default import "${t.defaultImport}" from "${t.source}" is invalid because ${s.path} exports "${t.defaultImport}" only as a named export. Use import { ${t.defaultImport} } from "${t.source}" or add a default export.`:`Default import "${t.defaultImport}" from "${t.source}" is invalid because ${s.path} has no default export. Add a default export or change the import to match its named exports.`})}for(let a of t.namedImports){if("default"===a.imported){i.hasDefault||r.push({path:e,message:`Named default import "${a.local}" from "${t.source}" is invalid because ${s.path} has no default export.`});continue}if(i.namedExports.has(a.imported))continue;let o=i.hasDefault&&(!i.defaultName||i.defaultName===a.imported)?` It has a default export; use import ${a.local} from "${t.source}" or export "${a.imported}" by name.`:"";r.push({path:e,message:`Named import "${a.imported}" from "${t.source}" is invalid because ${s.path} does not export "${a.imported}".${o}`})}return r}(t.path,r,a))}}return s.push(...function(e){let t=[];for(let s of e){if(!/\.(tsx|jsx)$/i.test(s.path))continue;let e=j(s.code);/\bon(?:Click|Submit|Change|CheckedChange|ValueChange)\s*=\s*\{\s*\([^)]*\)\s*=>\s*(?:\{\s*\}|undefined|null)\s*\}/.test(e)&&t.push({path:s.path,message:"Empty event handler. Implement a real visible outcome or remove the inert control."})}return t}(e)),s.push(...function(e){let t=e.filter(e=>/\.(tsx|ts|jsx|js)$/i.test(e.path)),s=t.map(e=>e.code).join("\n"),r=/document\.documentElement\.classList\.add\(\s*["'`]dark["'`]/.test(s),i=/document\.documentElement\.classList\.remove\(\s*["'`]dark["'`]/.test(s),a=/document\.documentElement\.classList\.toggle\(\s*["'`]dark["'`]/.test(s),o=/\bdark:[\w\-\[\]/.:%]+/.test(s),n=/\b(?:setIsDark|setDarkMode|setTheme|toggleTheme)\b/.test(s);if(!(a||r&&i||o&&n))return[];let l=/localStorage\.getItem\(/.test(s)&&/localStorage\.setItem\(/.test(s),p=/matchMedia\(\s*["'`]\(prefers-color-scheme:\s*dark\)["'`]\s*\)/.test(s),c=/document\.documentElement\.style\.colorScheme\s*=/.test(s)||/document\.documentElement\.style\.setProperty\(\s*["'`]color-scheme["'`]/.test(s);if((a||r&&i)&&l&&p&&c)return[];let h=t.find(e=>{let t=e.code;return/document\.documentElement\.classList\.toggle\(\s*["'`]dark["'`]/.test(t)||/document\.documentElement\.classList\.add\(\s*["'`]dark["'`]/.test(t)&&/document\.documentElement\.classList\.remove\(\s*["'`]dark["'`]/.test(t)||/\b(?:setIsDark|setDarkMode|setTheme|toggleTheme)\b/.test(t)});return[{path:h?.path,message:"Theme control is incomplete. Initialize from a persisted localStorage preference with a prefers-color-scheme fallback, persist changes, and update document.documentElement.style.colorScheme together with the root dark class."}]}(e)),s.push(...w(e).issues),s.push(...N(e,t)),s}function F(e){let s=e.split(".").pop()?.toLowerCase();return"tsx"===s||"jsx"===s?s:"ts"===s?"ts":"css"===s?"css":"json"===s?"json":(0,t.getExtensionForLanguage)((0,t.getLanguageOfFile)(e))}function B(e){let t,s=new Set;for(I.lastIndex=0;null!==(t=I.exec(e));)s.add(t[1]);return Array.from(s)}function U(e){let t,s=[];for(k.lastIndex=0;null!==(t=k.exec(e));){let e=t[2].trim(),r=t[3],i=function(e){let t=e.match(/{([\s\S]*?)}/)?.[1];return t?t.split(",").map(e=>e.trim().replace(/^type\s+/,"")).filter(Boolean).map(e=>{let[t,s]=e.split(/\s+as\s+/).map(e=>e.trim());return{imported:t,local:s||t}}).filter(({imported:e,local:t})=>[e,t].every(e=>/^[A-Za-z_$][\w$]*$/.test(e))):[]}(e),a=function(e){if(e.startsWith("{")||e.startsWith("*"))return;let t=e.replace(/{[\s\S]*}/g,"").replace(/\*\s+as\s+\w+/g,""),s=t.split(",")[0]?.trim();return s&&/^[A-Za-z_$][\w$]*$/.test(s)?s:void 0}(e);(a||0!==i.length)&&s.push({source:r,defaultImport:a,namedImports:i})}return s}function j(e){return e.replace(/\/\*[\s\S]*?\*\//g,"").replace(/(^|[^:])\/\/.*$/gm,"$1")}function _(e){return e.startsWith("@/")||e.startsWith("/")||e.startsWith("./")||e.startsWith("../")}function H(e,t,s){let r=z(e,t);for(let e of s)if(r.includes(R(e.path)))return e;return null}function z(e,t){let s=e.includes("/")?e.slice(0,e.lastIndexOf("/")):"",r=R(t.startsWith("./")||t.startsWith("../")?M(`${s}/${t}`):M(t));return[r,`${r}/index`]}e.s(["attachGeneratedFilesStats",0,D,"buildGeneratedFilesQualityReport",0,function(e){let t=O(e),s=t.filter(e=>e.message.startsWith("Unresolved internal import")),r=function(e){let t=[];for(let s of e)if(/\.(tsx|jsx)$/i.test(s.path)){for(let e of s.code.matchAll(/<button\b(?![^>]*aria-label=)[^>]*>\s*(?:<[^>]+>\s*)*<\/button>/g))t.push({path:s.path,message:"Button appears to have no visible text or aria-label."});for(let e of s.code.matchAll(/<input\b([^>]*)>/g)){let r=e[1]||"";/\b(?:aria-label|aria-labelledby|id|placeholder)=/.test(r)||function(e,t){let s=e.slice(0,t);return s.lastIndexOf("<label")>s.lastIndexOf("</label>")&&-1!==e.indexOf("</label>",t)}(s.code,e.index)||t.push({path:s.path,message:"Input appears to be missing an accessible name, id, or placeholder."})}for(let e of s.code.matchAll(/<img\b([^>]*)>/g)){let r=e[1]||"";/\balt=/.test(r)||t.push({path:s.path,message:"Image appears to be missing alt text."})}}return t}(e),i=function(e){let t=0;for(let r of e)for(let i of B(r.code))if(_(i)){var s;if(E(R(M(i)))){t+=1;continue}s=r.path,H(s,i,e)&&(t+=1)}return t}(e),{protectedPathsBlocked:a}=L(e),o=e.filter(e=>/\.(tsx|ts|jsx|js)$/i.test(e.path)).length,n=t.length+r.length,l=w(e);return{generatedAt:new Date().toISOString(),filesGenerated:e.length,sourceFiles:o,importsResolved:i,unresolvedImports:s,protectedPathsBlocked:a,accessibilityWarnings:r,diagnostics:t,apiIntegration:l,status:0===n?"passed":"warning"}},"formatGeneratedFileDiagnostics",0,function(e){return["Generated app validation failed. Repair every issue before returning the changed files:",...e.map(e=>`- ${e.path?`${e.path}: `:""}${e.message}`)].join("\n")},"formatGeneratedFilesMarkdown",0,function(e){return e.map(e=>`\`\`\`${e.language||F(e.path)}{path=${e.path}}
${e.code}
\`\`\``).join("\n\n")},"normalizeGeneratedFiles",0,function(e){let t=new Map,s=0;for(let r of e){let e=function(e){let t=e.trim().replace(/^["'`]+|["'`]+$/g,"").replace(/\\/g,"/").replace(/\/+/g,"/").replace(/^@\//,"").replace(/^\//,"").replace(/^\.\//,"").replace(/^src\//,"");if(!t||t.includes(".."))return null;if(/^app\.tsx$/i.test(t))return"App.tsx";let s=R(t);return C.has(s)?null:t}(r.path);if(!e){s+=1;continue}let i=r.code??r.content??"";i.trim()&&t.set(e,{path:e,code:function(e){return function(e){var t;if(!/\bcn\s*\(/.test(e)||U(t=e).some(e=>"cn"===e.defaultImport||e.namedImports.some(e=>"cn"===e.local))||/\b(?:const|let|var|function|class)\s+cn\b/.test(j(t)))return e;let s=/import\s*{([\s\S]*?)}\s*from\s*["']@\/lib\/utils["'];?/;return s.test(e)?e.replace(s,(e,t)=>{let s=t.split(",").map(e=>e.trim()).filter(Boolean);return s.some(e=>/^cn(?:\s+as\s+cn)?$/.test(e))||s.push("cn"),`import { ${s.join(", ")} } from "@/lib/utils";`}):function(e,t){let s=e.split("\n"),r=0;for(;r<s.length&&(/^\s*$/.test(s[r])||/^\s*["']use\s+\w+["'];?\s*$/.test(s[r]));)r+=1;return s.splice(r,0,t),s.join("\n")}(e,'import { cn } from "@/lib/utils";')}(e.replace(/import\s*{\s*Motion\s*}\s*from\s*["']framer-motion["'];?/g,'import { motion } from "framer-motion";').replace(/<Motion(\s|>)/g,"<motion.div$1").replace(/<\/Motion>/g,"</motion.div>").replace(/await\s+(?:window\.)?navigator\.clipboard\.writeText\(([^;\n]+)\);/g,"await (navigator?.clipboard?.writeText?.($1) ?? Promise.resolve()).catch(() => {});").replace(/(^|[^a-zA-Z0-9_$])(?:window\.)?navigator\.clipboard\.writeText\(([^;\n]+)\);/g,"$1(navigator?.clipboard?.writeText?.($2) ?? Promise.resolve()).catch(() => {});").replace(/from\s*["']@\/components\/ui\/sonner["']/g,'from "sonner"').replace(/import\s*{([\s\S]*?)}\s*from\s*["']@\/components\/ui\/select["'];?/g,(e,t)=>{if(!/SelectItemText/.test(t))return e;let s=t.split(",").map(e=>e.trim()).filter(Boolean).filter(e=>!/^SelectItemText(?:\s+as\s+.*)?$/.test(e));return s.includes("SelectItem")||s.push("SelectItem"),`import { ${s.join(", ")} } from "@/components/ui/select";`}).replace(/<\s*SelectItemText\b([^>]*)>/g,"<SelectItem$1>").replace(/<\/\s*SelectItemText\s*>/g,"</SelectItem>").replace(/<\s*Select\.ItemText\b([^>]*)>/g,"<Select.Item$1>").replace(/<\/\s*Select\.ItemText\s*>/g,"</Select.Item>"))}(i),language:function(e,t){let s=t.split(".").pop()?.toLowerCase();return"tsx"===s||"ts"===s||"jsx"===s||"js"===s||"css"===s||"json"===s?s:e&&"text"!==e?"typescript"===e?"ts":"javascript"===e?"js":e:F(t)}(r.language,e),fullMatch:r.fullMatch})}let r=Array.from(t.values()).map(e=>{var s,r;return{...e,code:(s=e,r=t,s.code.replace(/(["'])(@\/(?:components|lib|utils|types)\/[^"']+)\1/g,(e,t,i)=>{if(E(R(M(i))))return e;let a=function(e,t,s){let r=z(e,t);for(let[e]of s)if(r.includes(R(e)))return e;return null}(s.path,i,r);return a?`${t}${function(e,t){let s=e.split("/").slice(0,-1),r=R(t).split("/");for(;s.length&&r.length&&s[0]===r[0];)s.shift(),r.shift();let i=[...s.map(()=>".."),...r].join("/")||".";return i.startsWith(".")?i:`./${i}`}(s.path,a)}${t}`:e}))}});return D(r,{protectedPathsBlocked:s}),r},"parseStoredGeneratedFiles",0,function(e){return Array.isArray(e)?e.filter(e=>!!e&&"object"==typeof e&&"string"==typeof e.path&&("string"==typeof e.code||"string"==typeof e.content)):[]},"readGeneratedFilesStats",0,L,"validateGeneratedFiles",0,O],686690)},236139,e=>{"use strict";let t=`
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`,s=`import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "../../lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
`,r=`import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "../../lib/utils"
import { buttonVariants } from "./button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 text-foreground shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
`,i=`import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border border-gray-200 p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-gray-950 dark:border-gray-800 dark:[&>svg]:text-gray-50",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-950 dark:bg-gray-950 dark:text-gray-50",
        destructive:
          "border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500 dark:border-red-900/50 dark:text-red-900 dark:dark:border-red-900 dark:[&>svg]:text-red-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }

`,a=`import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "../../lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }

`,o=`import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

`,n=`import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "../../lib/utils"

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-gray-500 sm:gap-2.5 dark:text-gray-400",
      className
    )}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      className={cn("transition-colors hover:text-gray-950 dark:hover:text-gray-50", className)}
      {...props}
    />
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-gray-950 dark:text-gray-50", className)}
    {...props}
  />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:size-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}

`,l=`import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Semantic tokens only. Outline/ghost keep resting text-foreground so a
        // secondary CTA with bg-background stays readable when nested in a dark
        // hero that inherits light text. They intentionally omit hover:text-* so
        // custom className text colors (nav Login, branded secondary CTAs) are
        // not forced to gray-900/white on hover via twMerge leaving hover:text.
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background text-foreground hover:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-accent",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
`,p=`import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "../../lib/utils"
import { buttonVariants } from "./button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-gray-400",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-100/50 [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected].day-outside)]:bg-gray-800/50 dark:[&:has([aria-selected])]:bg-gray-800",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gray-900 text-gray-50 hover:bg-gray-900 hover:text-gray-50 focus:bg-gray-900 focus:text-gray-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50 dark:hover:text-gray-900 dark:focus:bg-gray-50 dark:focus:text-gray-900",
        day_today: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
        day_outside:
          "day-outside text-gray-500 opacity-50 aria-selected:bg-gray-100/50 aria-selected:text-gray-500 aria-selected:opacity-30 dark:text-gray-400 dark:aria-selected:bg-gray-800/50 dark:aria-selected:text-gray-400",
        day_disabled: "text-gray-500 opacity-50 dark:text-gray-400",
        day_range_middle:
          "aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

`,c=`import * as React from 'react';

import { cn } from '../../lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
`,h=`import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      return () => {
        api?.off("select", onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute  h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}

`,d=`import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "../../lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-gray-200 dark:border-gray-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gray-900 data-[state=checked]:text-gray-50  dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=checked]:bg-gray-50 dark:data-[state=checked]:text-gray-900",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

`,u=`import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

`,m=`import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "../../lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 text-foreground shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

`,f=`import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "../../lib/utils"

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
)
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-gray-100 dark:bg-gray-800" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}

`,y=`import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "../../lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-gray-100 data-[state=open]:bg-gray-100 dark:focus:bg-gray-800 dark:data-[state=open]:bg-gray-800",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-950 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-100 dark:bg-gray-800", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}

`,g=`import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "../../lib/utils"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border border-gray-200 bg-white p-4 text-gray-950 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
      className
    )}
    {...props}
  />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }

`,x=`import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
`,b=`import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
`,P=`
import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "../../lib/utils"

const MenubarMenu = MenubarPrimitive.Menu

const MenubarGroup = MenubarPrimitive.Group

const MenubarPortal = MenubarPrimitive.Portal

const MenubarSub = MenubarPrimitive.Sub

const MenubarRadioGroup = MenubarPrimitive.RadioGroup

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-10 items-center space-x-1 rounded-md border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-950",
      className
    )}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-gray-100 focus:text-gray-900 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-50",
      className
    )}
    {...props}
  />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-50",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-950 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-950 shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
)
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-100 dark:bg-gray-800", className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-gray-500 dark:text-gray-400",
        className
      )}
      {...props}
    />
  )
}
MenubarShortcut.displayname = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}

`,v=`import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "../../lib/utils"

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props}
  />
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus:bg-accent focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
)

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{""}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
      className
    )}
    {...props}
  />
))
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)] dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
))
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-gray-200 shadow-md dark:bg-gray-800" />
  </NavigationMenuPrimitive.Indicator>
))
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}

`,T=`import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "../../lib/utils"
import { ButtonProps, buttonVariants } from "./button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}

`,w=`import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "../../lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border border-gray-200 bg-white p-4 text-gray-950 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }

`,A=`import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "../../lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-gray-900 transition-all dark:bg-gray-50"
      style={{ transform: \`translateX(-\${100 - (value || 0)}%)\` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
`,N=`import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "../../lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-gray-200 dark:border-gray-900 text-gray-900 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50  dark:text-gray-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }

`,S=`import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "../../lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}

`,C=`import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "../../lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-gray-200 dark:bg-gray-800",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

`,E=`import { cn } from "../../lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-100 dark:bg-gray-800", className)}
      {...props}
    />
  )
}

export { Skeleton }
`,I=`import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "../../lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <SliderPrimitive.Range className="absolute h-full bg-gray-900 dark:bg-gray-50" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-gray-900 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-50 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }

`,k=`import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "../../lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gray-900 data-[state=unchecked]:bg-gray-200 dark:focus-visible:ring-gray-300 dark:focus-visible:ring-offset-gray-950 dark:data-[state=checked]:bg-gray-50 dark:data-[state=unchecked]:bg-gray-800",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 dark:bg-gray-950"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }

`,R=`import * as React from "react"

import { cn } from "../../lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-gray-100/50 font-medium [&>tr]:last:border-b-0 dark:bg-gray-800/50",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-gray-100/50 data-[state=selected]:bg-gray-100 dark:hover:bg-gray-800/50 dark:data-[state=selected]:bg-gray-800",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 dark:text-gray-400",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

`,M=`import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "../../lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-50",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

`,D=`import * as React from "react"

import { cn } from "../../lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

`,L=`import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "../../lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-gray-200 p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full dark:border-gray-800",
  {
    variants: {
      variant: {
        default: "border bg-white text-gray-950 dark:bg-gray-950 dark:text-gray-50",
        destructive:
          "destructive group border-red-500 bg-red-500 text-gray-50 dark:border-red-900 dark:bg-red-900 dark:text-gray-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-transparent px-3 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-gray-100/40 group-[.destructive]:hover:border-red-500/30 group-[.destructive]:hover:bg-red-500 group-[.destructive]:hover:text-gray-50 group-[.destructive]:focus:ring-red-500 dark:border-gray-800 dark:ring-offset-gray-950 dark:hover:bg-gray-800 dark:focus:ring-gray-300 dark:group-[.destructive]:border-gray-800/40 dark:group-[.destructive]:hover:border-red-900/30 dark:group-[.destructive]:hover:bg-red-900 dark:group-[.destructive]:hover:text-gray-50 dark:group-[.destructive]:focus:ring-red-900",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-gray-950/50 opacity-0 transition-opacity hover:text-gray-950 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600 dark:text-gray-50/50 dark:hover:text-gray-50",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}

`,O=`import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast"
import { useToast } from "./use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

`,F=`import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { toggleVariants } from "./toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }

`,B=`import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }

`,U=`import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "../../lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-950 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

`,j=`import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "./toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
`,_=`"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
)

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null)

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }
  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>")
  }

  const fieldState = getFieldState(fieldContext.name, formState)
  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: \`\${id}-form-item\`,
    formDescriptionId: \`\${id}-form-item-description\`,
    formMessageId: \`\${id}-form-item-message\`,
    ...fieldState,
  }
}

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        error
          ? \`\${formDescriptionId} \${formMessageId}\`
          : formDescriptionId
      }
      aria-invalid={Boolean(error)}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error.message ?? "") : children

  if (!body) return null

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
`,H=`"use client"

import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  )
}

function ResizablePanel(props: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & { withHandle?: boolean }) {
  return (
    <ResizablePrimitive.Separator
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle ? (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      ) : null}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
`,z=`"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-px",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-px",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
`;e.s(["accordian",0,s,"alert",0,i,"alertDialog",0,r,"avatar",0,a,"badge",0,o,"breadcrumb",0,n,"button",0,l,"calendar",0,p,"card",0,c,"carousel",0,h,"checkbox",0,d,"collapsible",0,u,"dialog",0,m,"drawer",0,f,"dropdownMenu",0,y,"form",0,_,"hoverCard",0,g,"input",0,x,"label",0,b,"menuBar",0,P,"navigationMenu",0,v,"pagination",0,T,"popover",0,w,"progress",0,A,"radioGroup",0,N,"resizable",0,H,"scrollArea",0,z,"select",0,S,"separator",0,C,"skeleton",0,E,"slider",0,I,"switchComponent",0,k,"table",0,R,"tabs",0,M,"textarea",0,D,"toast",0,L,"toaster",0,O,"toggle",0,B,"toggleGroup",0,F,"tooltip",0,U,"useToast",0,j,"utils",0,t])},240662,e=>{"use strict";let t={background:"0 0% 100%",foreground:"0 0% 3.9%",card:"0 0% 100%","card-foreground":"0 0% 3.9%",popover:"0 0% 100%","popover-foreground":"0 0% 3.9%",primary:"0 0% 9%","primary-foreground":"0 0% 98%",secondary:"0 0% 96.1%","secondary-foreground":"0 0% 9%",muted:"0 0% 96.1%","muted-foreground":"0 0% 45.1%",accent:"0 0% 96.1%","accent-foreground":"0 0% 9%",destructive:"0 84.2% 60.2%","destructive-foreground":"0 0% 98%",border:"0 0% 89.8%",input:"0 0% 89.8%",ring:"0 0% 3.9%",radius:"0.5rem"},s={background:"0 0% 3.9%",foreground:"0 0% 98%",card:"0 0% 3.9%","card-foreground":"0 0% 98%",popover:"0 0% 3.9%","popover-foreground":"0 0% 98%",primary:"0 0% 98%","primary-foreground":"0 0% 9%",secondary:"0 0% 14.9%","secondary-foreground":"0 0% 98%",muted:"0 0% 14.9%","muted-foreground":"0 0% 63.9%",accent:"0 0% 14.9%","accent-foreground":"0 0% 98%",destructive:"0 62.8% 30.6%","destructive-foreground":"0 0% 98%",border:"0 0% 14.9%",input:"0 0% 14.9%",ring:"0 0% 83.1%",radius:"0.5rem"},r={colors:{border:"hsl(var(--border))",input:"hsl(var(--input))",ring:"hsl(var(--ring))",background:"hsl(var(--background))",foreground:"hsl(var(--foreground))",primary:{DEFAULT:"hsl(var(--primary))",foreground:"hsl(var(--primary-foreground))"},secondary:{DEFAULT:"hsl(var(--secondary))",foreground:"hsl(var(--secondary-foreground))"},destructive:{DEFAULT:"hsl(var(--destructive))",foreground:"hsl(var(--destructive-foreground))"},muted:{DEFAULT:"hsl(var(--muted))",foreground:"hsl(var(--muted-foreground))"},accent:{DEFAULT:"hsl(var(--accent))",foreground:"hsl(var(--accent-foreground))"},popover:{DEFAULT:"hsl(var(--popover))",foreground:"hsl(var(--popover-foreground))"},card:{DEFAULT:"hsl(var(--card))",foreground:"hsl(var(--card-foreground))"}},borderRadius:{lg:"var(--radius)",md:"calc(var(--radius) - 2px)",sm:"calc(var(--radius) - 4px)"}};function i(e,t){return[`${e} {`,...Object.entries(t).map(([e,t])=>`  --${e}: ${t};`),"}"]}e.s(["buildGeneratedThemeCss",0,function({includeTailwindDirectives:e=!1}={}){return[...e?["@tailwind base;","@tailwind components;","@tailwind utilities;",""]:[],...i(":root",t),"",...i(".dark",s),"",":root { color-scheme: light; }",".dark { color-scheme: dark; }","","* {","  border-color: hsl(var(--border));","}","","html {","  background-color: hsl(var(--background));","  color: hsl(var(--foreground));","}","","body {","  margin: 0;","  min-width: 320px;","  min-height: 100vh;","  background-color: hsl(var(--background));","  color: hsl(var(--foreground));","}"].join("\n")},"serializeGeneratedTailwindThemeExtension",0,function(){return JSON.stringify(r,null,2)}])},484622,e=>{"use strict";var t=e.i(207653);let s=t.z.string().trim().url().superRefine((e,s)=>{let r=new URL(e);(!("https:"===r.protocol&&/^[a-z0-9-]+\.supabase\.co$/i.test(r.hostname))||r.username||r.password||r.port||"/"!==r.pathname&&""!==r.pathname||r.search||r.hash)&&s.addIssue({code:t.z.ZodIssueCode.custom,message:"Expected an HTTPS Supabase project URL."})}).transform(e=>e.replace(/\/$/,"")),r=t.z.object({url:s,publishableKey:t.z.string().trim().min(1)}).strict().superRefine((e,s)=>{let r;(r=e.publishableKey.trim()).startsWith("sb_publishable_")||"anon"===function(e){let t=e.split(".");if(3!==t.length)return null;try{let e=t[1].replace(/-/g,"+").replace(/_/g,"/").padEnd(4*Math.ceil(t[1].length/4),"="),s=JSON.parse(globalThis.atob(e));if(!s||"object"!=typeof s||!("role"in s))return null;return"string"==typeof s.role?s.role:null}catch{return null}}(r.trim())||s.addIssue({code:t.z.ZodIssueCode.custom,path:["publishableKey"],message:"Expected a browser-safe Supabase publishable or legacy anon key."})}),i=t.z.discriminatedUnion("status",[t.z.object({status:t.z.literal("not_connected")}).strict(),t.z.object({status:t.z.literal("provisioning")}).strict(),t.z.object({status:t.z.literal("missing_browser_key")}).strict(),t.z.object({status:t.z.literal("invalid_browser_key")}).strict(),t.z.object({status:t.z.literal("invalid_project_url")}).strict(),t.z.object({status:t.z.literal("ready"),config:r}).strict()]);e.s(["SUPABASE_CLIENT_ADAPTER_IMPORT",0,"@/lib/supabase","SUPABASE_CLIENT_ADAPTER_PATH",0,"/lib/supabase.ts","SUPABASE_EXPORT_ENVIRONMENT_VARIABLES",0,["VITE_SUPABASE_URL","VITE_SUPABASE_PUBLISHABLE_KEY"],"SUPABASE_PREVIEW_RUNTIME_PATH",0,"/squid-runtime/supabase.ts","buildSupabaseClientAdapterModule",0,function(){return`import { createClient } from "@supabase/supabase-js";
import { publishableKey, url } from "@/squid-runtime/supabase";

export const supabase = createClient(url, publishableKey);
`},"buildSupabaseExportRuntimeModule",0,function(){return`const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function isLegacyAnonKey(value: string) {
  const parts = value.split(".");
  if (parts.length !== 3) return false;

  try {
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    return JSON.parse(globalThis.atob(payload)).role === "anon";
  } catch {
    return false;
  }
}

function isValidProjectUrl(value: string) {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      /^[a-z0-9-]+\\.supabase\\.co$/i.test(parsed.hostname) &&
      !parsed.username &&
      !parsed.password &&
      !parsed.port &&
      (parsed.pathname === "/" || parsed.pathname === "") &&
      !parsed.search &&
      !parsed.hash
    );
  } catch {
    return false;
  }
}

if (!url || !isValidProjectUrl(url)) {
  throw new Error("Supabase setup required: set a valid VITE_SUPABASE_URL.");
}

if (
  !publishableKey ||
  (!publishableKey.startsWith("sb_publishable_") &&
    !isLegacyAnonKey(publishableKey))
) {
  throw new Error(
    "Supabase setup required: set a browser-safe VITE_SUPABASE_PUBLISHABLE_KEY.",
  );
}

export { publishableKey, url };
`},"getSupabaseRuntimeSetupMessage",0,function(e){switch(e.status){case"not_connected":return"Supabase setup required: no Supabase project is connected.";case"provisioning":return"Supabase setup required: the connected project is still provisioning.";case"missing_browser_key":return"Supabase setup required: no browser-safe publishable key was found.";case"invalid_browser_key":return"Supabase setup required: an invalid or privileged API key was rejected.";case"invalid_project_url":return"Supabase setup required: the connected project URL is invalid."}},"resolveSupabaseBrowserRuntimeForPreview",0,function({runtime:e,generatedAppUsesSupabase:t,workspaceResolved:s}){return e||(t&&s?{status:"not_connected"}:void 0)},"supabaseBrowserRuntimeStateSchema",0,i])},166548,e=>{"use strict";var t=e.i(236139),s=e.i(686690),r=e.i(148468),i=e.i(240662),a=e.i(484622);r.generatedAppDependencies;let o={"/lib/utils.ts":t.utils,"/components/ui/accordion.tsx":t.accordian,"/components/ui/alert-dialog.tsx":t.alertDialog,"/components/ui/alert.tsx":t.alert,"/components/ui/avatar.tsx":t.avatar,"/components/ui/badge.tsx":t.badge,"/components/ui/breadcrumb.tsx":t.breadcrumb,"/components/ui/button.tsx":t.button,"/components/ui/calendar.tsx":t.calendar,"/components/ui/card.tsx":t.card,"/components/ui/carousel.tsx":t.carousel,"/components/ui/checkbox.tsx":t.checkbox,"/components/ui/collapsible.tsx":t.collapsible,"/components/ui/dialog.tsx":t.dialog,"/components/ui/drawer.tsx":t.drawer,"/components/ui/dropdown-menu.tsx":t.dropdownMenu,"/components/ui/form.tsx":t.form,"/components/ui/hover-card.tsx":t.hoverCard,"/components/ui/input.tsx":t.input,"/components/ui/label.tsx":t.label,"/components/ui/menubar.tsx":t.menuBar,"/components/ui/navigation-menu.tsx":t.navigationMenu,"/components/ui/pagination.tsx":t.pagination,"/components/ui/popover.tsx":t.popover,"/components/ui/progress.tsx":t.progress,"/components/ui/radio-group.tsx":t.radioGroup,"/components/ui/resizable.tsx":t.resizable,"/components/ui/scroll-area.tsx":t.scrollArea,"/components/ui/select.tsx":t.select,"/components/ui/separator.tsx":t.separator,"/components/ui/skeleton.tsx":t.skeleton,"/components/ui/slider.tsx":t.slider,"/components/ui/switch.tsx":t.switchComponent,"/components/ui/table.tsx":t.table,"/components/ui/tabs.tsx":t.tabs,"/components/ui/textarea.tsx":t.textarea,"/components/ui/toast.tsx":t.toast,"/components/ui/toaster.tsx":t.toaster,"/components/ui/toggle-group.tsx":t.toggleGroup,"/components/ui/toggle.tsx":t.toggle,"/components/ui/tooltip.tsx":t.tooltip,"/components/ui/use-toast.tsx":t.useToast,"/components/ui/index.tsx":`
  export * from "./button"
  export * from "./card"
  export * from "./input"
  export * from "./label"
  export * from "./select"
  export * from "./textarea"
  export * from "./avatar"
  export * from "./radio-group"
  `,"/public/index.html":`<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
  `},n=`type TailwindRuntime = {
  config: unknown;
};

const configureTailwind = () => {
  const runtime = (window as Window & { tailwind?: TailwindRuntime }).tailwind;
  if (!runtime) return false;

  runtime.config = {
    darkMode: "class",
    theme: {
      extend: ${(0,i.serializeGeneratedTailwindThemeExtension)()},
    },
  };
  return true;
};

const styleId = "squid-generated-theme";
if (!document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = ${JSON.stringify((0,i.buildGeneratedThemeCss)())};
  document.head.appendChild(style);
}

if (!configureTailwind()) {
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (configureTailwind() || attempts >= 40) {
      window.clearInterval(timer);
    }
  }, 25);
}

export {};
`,l=/\b(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;function p(e){let t={"/public/index.html":o["/public/index.html"]},s=[],r=(e,r)=>{let i;for(l.lastIndex=0;null!==(i=l.exec(r));){let r=function(e,t){let s;if(t.startsWith("@/"))s=`/${t.slice(2)}`;else if(t.startsWith("/"))s=t;else{if(!(t.startsWith("./")||t.startsWith("../")))return null;let r=e.slice(0,e.lastIndexOf("/"));s=function(e){let t=[];for(let s of e.split("/"))s&&"."!==s&&(".."===s?t.pop():t.push(s));return`/${t.join("/")}`}(`${r}/${t}`)}return(/\.[a-z]+$/i.test(s)?[s]:[s,`${s}.tsx`,`${s}.ts`,`${s}/index.tsx`]).find(e=>e in o)??null}(e,i[1]);!r||r in t||(t[r]=o[r],s.push(r))}};for(let t of e)r(`/${t.path}`,t.code);for(;s.length>0;){let e=s.shift();e&&r(e,t[e])}return t}let c=`"use client";

import { useEffect } from "react";

const PREVIEW_SOURCE = "squid-preview-inspector";
const PARENT_SOURCE = "squid-preview-parent";
const READY_ANNOUNCEMENT_TIMEOUT_MS = 60_000;

export function SquidPreviewInspector() {
  useEffect(() => {
    let selectionMode = false;
    let readyAnnouncementTimer: number | undefined;

    function ensureSelectionStyles() {
      if (document.getElementById("squid-preview-selection-style")) return;

      const style = document.createElement("style");
      style.id = "squid-preview-selection-style";
      style.textContent = [
        "body.squid-preview-selecting,",
        "body.squid-preview-selecting * {",
        "  cursor: crosshair !important;",
        "}",
        "body.squid-preview-selecting *:hover {",
        "  outline: 2px solid #2563eb !important;",
        "  outline-offset: 2px !important;",
        "}",
      ].join("\\n");
      document.head.appendChild(style);
    }

    function setSelectionMode(enabled: boolean) {
      selectionMode = enabled;
      ensureSelectionStyles();
      document.body?.classList.toggle("squid-preview-selecting", enabled);
    }

    function getDomPath(element: Element) {
      const segments: string[] = [];
      let current: Element | null = element;

      while (current && current !== document.body) {
        const parent: Element | null = current.parentElement;
        const tag = current.tagName.toLowerCase();
        const id = current.id ? "#" + current.id : "";
        const className =
          typeof current.className === "string" && current.className.trim()
            ? "." + current.className.trim().split(/\\s+/).slice(0, 3).join(".")
            : "";
        const index = parent
          ? Array.from(parent.children)
              .filter((child) => child.tagName === current?.tagName)
              .indexOf(current) + 1
          : 1;

        segments.unshift(tag + id + className + ":nth-of-type(" + index + ")");
        current = parent;
      }

      return segments.join(" > ");
    }

    function getSelectionAttributes(element: Element) {
      const attributeNames = [
        "type",
        "name",
        "placeholder",
        "title",
        "data-testid",
        "aria-current",
        "aria-expanded",
        "aria-pressed",
      ];
      const attributes: Record<string, string> = {};

      for (const name of attributeNames) {
        const value = element.getAttribute(name);
        if (value) attributes[name] = value.slice(0, 160);
      }

      return Object.keys(attributes).length > 0 ? attributes : undefined;
    }

    function getElementRect(element: Element) {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    }

    function serializeSelection(target: Element) {
      return {
        tagName: target.tagName.toLowerCase(),
        domPath: getDomPath(target),
        text:
          target.textContent?.replace(/\\s+/g, " ").trim().slice(0, 240) ||
          "",
        id: target.id || undefined,
        className:
          typeof target.className === "string"
            ? target.className.slice(0, 240)
            : undefined,
        role: target.getAttribute("role") || undefined,
        ariaLabel: target.getAttribute("aria-label") || undefined,
        href: target instanceof HTMLAnchorElement ? target.href : undefined,
        imageAlt:
          target instanceof HTMLImageElement ? target.alt || undefined : undefined,
        attributes: getSelectionAttributes(target),
        rect: getElementRect(target),
        html: target.outerHTML.replace(/\\s+/g, " ").trim().slice(0, 600),
      };
    }

    function postReady() {
      window.parent?.postMessage({ source: PREVIEW_SOURCE, type: "ready" }, "*");
    }

    async function captureWithSafeCanvasPatterns<T>(
      capture: () => Promise<T>,
    ) {
      const prototype = CanvasRenderingContext2D.prototype;
      const originalCreatePattern = prototype.createPattern;

      prototype.createPattern = function (
        image: CanvasImageSource,
        repetition: string | null,
      ) {
        const source = image as CanvasImageSource & {
          width?: number;
          height?: number;
          getContext?: unknown;
        };
        const isZeroSizedCanvas =
          typeof source.getContext === "function" &&
          (source.width === 0 || source.height === 0);

        if (isZeroSizedCanvas) {
          // html2canvas 1.4.1 can round a subpixel gradient surface down to
          // zero before creating its pattern. A transparent pixel preserves
          // the screenshot while omitting only that unrenderable surface.
          const fallback = this.canvas.ownerDocument.createElement("canvas");
          fallback.width = 1;
          fallback.height = 1;
          return originalCreatePattern.call(this, fallback, repetition);
        }

        return originalCreatePattern.call(this, image, repetition);
      };

      try {
        return await capture();
      } finally {
        prototype.createPattern = originalCreatePattern;
      }
    }

    async function captureScreenshot(message: {
      requestId?: string;
      width?: number;
      height?: number;
      quality?: number;
    }) {
      const requestId = String(message.requestId ?? "");
      const width = Number(message.width) || 1280;
      const height = Number(message.height) || 720;
      const quality = Number(message.quality) || 78;

      try {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await captureWithSafeCanvasPatterns(() =>
          html2canvas(document.documentElement, {
            width,
            height,
            windowWidth: width,
            windowHeight: height,
            scale: 1,
            logging: false,
            useCORS: true,
            backgroundColor:
              getComputedStyle(document.body).backgroundColor || "#ffffff",
            onclone: (doc) => {
              doc.querySelector("[data-squid-preview-inspector]")?.remove();
            },
          }),
        );
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (result) =>
              result
                ? resolve(result)
                : reject(new Error("Screenshot encoding failed")),
            "image/jpeg",
            quality / 100,
          );
        });
        const buffer = await blob.arrayBuffer();
        window.parent?.postMessage(
          {
            source: PREVIEW_SOURCE,
            type: "screenshot",
            requestId,
            buffer,
            mimeType: "image/jpeg",
          },
          "*",
          [buffer],
        );
      } catch (error) {
        window.parent?.postMessage(
          {
            source: PREVIEW_SOURCE,
            type: "screenshot",
            requestId,
            error:
              error instanceof Error ? error.message : "Screenshot capture failed",
          },
          "*",
        );
      }
    }

    function runRuntimeTest(requestId: number) {
      const clickableElements = Array.from(
        document.querySelectorAll(
          "button, a, input, select, textarea, [role='button']",
        ),
      );
      const unnamedClickableElements = clickableElements.filter((element) => {
        const labelledBy = element.getAttribute("aria-labelledby");
        const labelledByText = labelledBy
          ? labelledBy
              .split(/\\s+/)
              .map((id) => document.getElementById(id)?.textContent || "")
              .join(" ")
          : "";
        const label =
          element.getAttribute("aria-label") ||
          labelledByText ||
          element.getAttribute("title") ||
          element.getAttribute("placeholder") ||
          element.textContent;

        return !label?.replace(/\\s+/g, " ").trim();
      }).length;
      const horizontalOverflow =
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 8;

      window.parent?.postMessage(
        {
          source: PREVIEW_SOURCE,
          type: "runtime-test-report",
          requestId,
          report: {
            status:
              unnamedClickableElements > 0 || horizontalOverflow
                ? "review"
                : "passed",
            viewport: {
              width: Math.max(1, document.documentElement.clientWidth),
              height: Math.max(1, document.documentElement.clientHeight),
            },
            clickableElements: clickableElements.length,
            unnamedClickableElements,
            horizontalOverflow,
            runtimeError: null,
            checkedAt: new Date().toISOString(),
          },
        },
        "*",
      );
    }

    function onMessage(event: MessageEvent) {
      const message = event.data;
      if (!message || message.source !== PARENT_SOURCE) return;

      if (message.type === "set-selection-mode") {
        setSelectionMode(Boolean(message.enabled));
      }

      if (message.type === "ping") {
        postReady();
      }

      if (message.type === "ready-ack" && readyAnnouncementTimer !== undefined) {
        window.clearInterval(readyAnnouncementTimer);
      }

      if (message.type === "run-runtime-test") {
        runRuntimeTest(Number(message.requestId) || 0);
      }

      if (message.type === "capture-screenshot") {
        void captureScreenshot(message);
      }
    }

    function onClick(event: MouseEvent) {
      if (!selectionMode) return;
      if (!(event.target instanceof Element)) return;

      event.preventDefault();
      event.stopPropagation();
      setSelectionMode(false);
      window.parent?.postMessage(
        {
          source: PREVIEW_SOURCE,
          type: "selected",
          selection: serializeSelection(event.target),
        },
        "*",
      );
    }

    window.addEventListener("message", onMessage);
    window.addEventListener("click", onClick, true);
    ensureSelectionStyles();
    postReady();
    readyAnnouncementTimer = window.setInterval(postReady, 500);
    const stopReadyAnnouncementTimer = window.setTimeout(
      () => window.clearInterval(readyAnnouncementTimer),
      READY_ANNOUNCEMENT_TIMEOUT_MS,
    );

    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("click", onClick, true);
      window.clearInterval(readyAnnouncementTimer);
      window.clearTimeout(stopReadyAnnouncementTimer);
      document.body?.classList.remove("squid-preview-selecting");
    };
  }, []);

  return <div data-squid-preview-inspector hidden aria-hidden="true" />;
}
`;e.s(["getRequiredShadcnFiles",0,p,"getSandpackConfig",0,function(e,t){var i,o;let l=(0,s.normalizeGeneratedFiles)(e),h={...p(l)};for(let e of(h["/tsconfig.json"]=`{
    "include": [
      "./**/*"
    ],
    "compilerOptions": {
      "strict": true,
      "esModuleInterop": true,
      "lib": [ "dom", "es2015" ],
      "jsx": "react-jsx",
      "baseUrl": "./",
      "paths": {
        "@/components/*": ["components/*"],
        "@/lib/*": ["lib/*"],
        "@/squid-runtime/*": ["squid-runtime/*"],
        "@/utils/*": ["utils/*"],
        "@/types/*": ["types/*"]
      }
    }
  }`,l))"App.tsx"===e.path?h["/App.generated.tsx"]=e.code:h[`/${e.path}`]=e.code;if(h["/squid-preview-inspector.tsx"]=c,h["/squid-preview-theme.ts"]=n,t&&(h[a.SUPABASE_PREVIEW_RUNTIME_PATH]={code:"ready"!==(i=t).status?`throw new Error(${JSON.stringify((0,a.getSupabaseRuntimeSetupMessage)(i))});

export const url = "";
export const publishableKey = "";
`:`export const url = ${JSON.stringify(i.config.url)};
export const publishableKey = ${JSON.stringify(i.config.publishableKey)};
`,hidden:!0,readOnly:!0},h[a.SUPABASE_CLIENT_ADAPTER_PATH]={code:(0,a.buildSupabaseClientAdapterModule)(),hidden:!0,readOnly:!0}),h["/App.generated.tsx"])h["/App.tsx"]=`import "./squid-preview-theme";
import GeneratedApp from "./App.generated";
import { SquidPreviewInspector } from "./squid-preview-inspector";

export default function App() {
  return (
    <>
      <SquidPreviewInspector />
      <GeneratedApp />
    </>
  );
}`;else if(l.length>0){let e=(l.find(e=>e.path.endsWith(".tsx")||e.path.endsWith(".jsx"))||l[0]).path.replace(/\.(tsx?|jsx?)$/,"");h["/App.tsx"]=`import "./squid-preview-theme";
import React from 'react';
import MainComponent from './${e}';
import { SquidPreviewInspector } from "./squid-preview-inspector";

export default function App() {
  return (
    <>
      <SquidPreviewInspector />
      <MainComponent />
    </>
  );
}`}return{template:"react-ts",files:h,options:{externalResources:["https://cdn.tailwindcss.com"]},customSetup:{dependencies:{...(o=h,(0,r.getRequiredGeneratedAppDependencies)(Object.values(o).map(e=>"string"==typeof e?e:e.code))),html2canvas:"1.4.1"}}}}])}]);