<div align="center">
  <br>
  <br>
  <img src="assets/logo.png" alt="haICU" height="300">
  <br>
  <br>
  tiny ICU message parser
  <br>
  <br>
  <hr>
</div>
<br>

## Introduction

This `haicu` package provides an ICU message parser you can use to translate messages for example in a multi-lingual web site.

You can use messages with arguments, plurals, HTML-like tags, etc.

I have been using for years tools like [FormatJS](https://formatjs.github.io/) and others but they all come with a bloated implementation that increases a lot the bundle of your webapp. Packages like `react-intl`, `react-i18next`, `messageformat` are great software and a good starting point if you want to learn the best practices. However the only core part that you actually need nowadays is an ICU message parser, everything else can be done with few custom lines of code tailored on your needs.

There are also other use cases where you may want something lighter, for instance if you want to translate a desktop app menu or an automatic email.

The goal of `haicu` is to have a tiny and minimal implementation (it is below 3kb when minified) of an ICU message parser as well as documented examples about how to implement translated content.

The package name comes from [Haiku](https://en.wikipedia.org/wiki/Haiku) which is a type of short form poetry that originated in Japan.

For example

> 寺の鐘消ゆる
> 花の香は撞く
> 夕べかな

by Matsuo Bashō

> The temple bell stops
> but the sound keeps coming out of the flowers.

## Status and roadmap

Implementation of ICU message parser is complete.
Even if `haicu` has still a 0.x version, API will probably not change.
The package will reach a stable 1.0 version once there are enough tests and documentation.
After 1.0 the API will be freezed and the package will be updated only for bug fixes.

## Installation

With [npm](https://npmjs.org/) do

```sh
npm install haicu
```

or just copy the [haicu.js](./src/haicu.js) code in your project.

## Usage

The `haicu` package _default export_ is an ICU message parser.

```js
import haicu from 'haicu'

haicu('Hello {name}')
// [ 'Hello ', { arg: 'name' } ]
```

It returns an _Abstract Syntax Tree_ (AST) of an ICU message where a node can be

- `NonEmptyString`: e.g. `Hello `
- `MessageTag`: an HTML-like tag
- `MessageArg`: an argument like `{ arg: 'name' }`

See [types.ts](./src/types.ts) for details.

### Tags

_HTML-like_ tags can be used inside messages.

```js
haicu('<p>nested <b>tag</b></p>')
// [ { tag: 'p', ast: [ 'nested ', { tag: 'b', ast: [ 'tag' ] } ] } ]
```

Notice that tag arguments are __not supported__.
In particular it is a best practice in translations to not hardcode links.
For example

- __bad__: `Click <a href="http://example.com">here</a>`
- __good__: `Click <a>here</a>`

Just add the `href` at runtime, it could depend on the locale and it should not be hardcoded anyways.
Remember you can use any name for your tags, so for example if you have two links this translation is fine

```
<link1>Learn more</link1> or <link2>download<link2>
```

Tags can be _auto-closed_, for example

```js
haicu('auto-closed <br/> tag')
// [ 'auto-closed ', { tag: 'br', ast: [] }, ' tag' ]
```

### Errors

The invalid message `Hello {name` produces this output

```js
[ 'Hello ', { error: 'No closing bracket' } ]
```

but the `haicu` parser __does not throw errors__.

You should use [validators](#validators) to check your translations before deploying them.

### Escape

The escape character is quote: `'`.

It can be used to escape:

- brackets: `This is '{escaped}'`
- tags or `<` (opening angular bracket):
    - `escaped '<tag>'`
    - `Made with '<3`
- another quote: `I''m fine`
- hashes: `escaped '#' hash`

### Validators

To validate an ICU message node or AST, import a validator from `haicu/validators.js`.

For example, to test that all your messages parse correctly:

```js
import haicu from 'haicu'
import { isMessageAST } from 'haicu/validators.js'

export function testTranslations (messages) {
  for (const message of messages) {
    const ast = haicu(message)
    if (isMessageAST(ast))
      continue
    const error = findError(ast)
    throw new Error(`Invalid ICU message ${message} with error '${error}'`)
  }
}
```

The `haicu/validators.js` exports these _type-guards_:

- `isMessageAST(arg: unknown): arg is MessageAST`
- `isMessageArg(arg: unknown): arg is MessageArg`
- `isMessageTag(arg: unknown): arg is MessageTag`

And a `findError(ast: MessageAST): string` util.

