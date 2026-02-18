# Development instructions

## Requirements

Install development dependencies, without saving

```shell
npm install typescript @types/node --no-save
```

## Indentation

Use EditorConfig, see [.editorconfig file](./.editorconfig).

Basically use tabs everywhere except on JSON files where spaces are used in particular for _package.json_.

No semicolons.

## Tests

Run tests as usual with

```shell
npm test
```

All tests are located in [tests/](./tests) folder.

Check typings with

```shell
npm run tsc
```

## Implementation

The [haicu.js](./haicu.js) implements the `haicu` function which is the ICU parser.

The `haicu` function is the _default export_ so consumer can import it like this

```js
import haicu from 'haicu'
```

Other functions exported by _haicu.js_ are considered as __internal__ and are exported just for testing.

TypeScript is supported however the implementation is in good old JavaScript.

Hence _typing definitions_ which are in [haicu.d.ts](./haicu.d.ts) are not generated.

Tests may be written in TypeScript to ensure that every thing works also for a consumer that is using TS.

## Specification

### MessageFormat

ICU MessageFormat uses patterns of the following form:

```
message = messageText (argument messageText)*
argument = noneArg | simpleArg | complexArg
complexArg = choiceArg | pluralArg | selectArg | selectordinalArg

noneArg = '{' argNameOrNumber '}'
simpleArg = '{' argNameOrNumber ',' argType [',' argStyle] '}'
choiceArg = '{' argNameOrNumber ',' "choice" ',' choiceStyle '}'
pluralArg = '{' argNameOrNumber ',' "plural" ',' pluralStyle '}'
selectArg = '{' argNameOrNumber ',' "select" ',' selectStyle '}'
selectordinalArg = '{' argNameOrNumber ',' "selectordinal" ',' pluralStyle '}'

choiceStyle: see ChoiceFormat
pluralStyle: see PluralFormat
selectStyle: see SelectFormat

argNameOrNumber = argName | argNumber
argName = [^[[:Pattern_Syntax:][:Pattern_White_Space:]]]+
argNumber = '0' | ('1'..'9' ('0'..'9')*)

argType = "number" | "date" | "time" | "spellout" | "ordinal" | "duration"
argStyle = "short" | "medium" | "long" | "full" | "integer" | "currency" | "percent" | argStyleText | "::" argSkeletonText
```

See https://unicode-org.github.io/icu-docs/apidoc/released/icu4j/com/ibm/icu/text/MessageFormat.html

### PluralFormat

```
pluralStyle = [offsetValue] (selector '{' message '}')+
offsetValue = "offset:" number
selector = explicitValue | keyword
explicitValue = '=' number  // adjacent, no white space in between
keyword = [^[[:Pattern_Syntax:][:Pattern_White_Space:]]]+
message: see MessageFormat
```

See https://unicode-org.github.io/icu-docs/apidoc/released/icu4j/com/ibm/icu/text/PluralFormat.html

### SelectFormat

See https://unicode-org.github.io/icu-docs/apidoc/released/icu4j/com/ibm/icu/text/SelectFormat.html

