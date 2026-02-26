<div align="center">
  <br>
  <br>
  <img src="media/logo.png" alt="haicu" height="300">
  <br>
  <br>
  <em>tiny ICU message parser</em>
  <br>
  <br>
  <hr>
</div>
<br>

## Installation

With [npm](https://npmjs.org/) do

```sh
npm install haicu
```

or just copy the [haicu.js](./haicu.js) code in your project.

## Parser

The `haicu` package _default export_ is an ICU message parser.

```js
import haicu from 'haicu'

haicu('Hello {name}') // [ 'Hello ', { arg: 'name' } ]
```

It returns an _Abstract Syntax Tree_ (AST) of an ICU message where a node can be

- `NonEmptyString`: e.g. `Hello `
- `MessageTag`: an HTML-like tag
- `MessageArg`: an argument like `{ arg: 'name' }`

See [types.ts](./types.ts) for details.

## Errors

The invalid message `Hello {name` produces this output

```js
[ 'Hello ', { error: 'No closing bracket' } ]
```

but the `haicu` parser __does not throw errors__.

You should use [validators](#validators) to check your translations before deploying them.

## Validators

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
    const error = ast.find(node => node.error).error
    throw new Error(`Invalid ICU message ${message} with error '${error}'`)
  }
}
```

All validators are type-guards:

- `isMessageAST(arg: unknown): arg is MessageAST`
- `isMessageArg(arg: unknown): arg is MessageArg`
- `isMessageTag(arg: unknown): arg is MessageTag`
