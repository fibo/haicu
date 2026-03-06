# Development instructions

## Requirements

Install development dependencies without saving them:

```sh
npm install typescript @types/node --no-save
```

## Indentation

Use EditorConfig, see [.editorconfig file](./.editorconfig).

Use tabs everywhere except in JSON files, where spaces are used (in particular for _package.json_).

No semicolons.

## Tests

Run tests as usual with

```sh
npm test
```

All tests are in [test.ts](./test.ts).

Check typings with

```sh
npm run tsc
```

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

## Artwork

The _logo_ and GitHub _social preview_ are implemented by [assets/artwork.html](./assets/artwork.html).

