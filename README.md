# haicu

> ICU message parser

## Installation

With [npm](https://npmjs.org/) do

```sh
npm install haicu
```

or just copy the [haicu.js](https://github.com/fibo/haicu/blob/main/haicu.js) code in your project.

## Parser

The `haicu` package _default export_ is an ICU message parser.

```js
import haicu from 'haicu'

haicu('Hello {name}') // [ 'Hello ', { arg: 'name' } ]
```

It returns an _Abstract Syntax Tree_ if an ICU Message where a node can be

- `NonEmptyString`: e.g. `Hello `
- `MessageTag`: an HTML-like tag
- `MessageArg`: an argument like `{ arg: 'name' }`

See [types.ts](https://github.com/fibo/haicu/blob/main/types.ts) for details.

## Errors

The incorrect message `Hello {name` will generate this output

```json
[ 'Hello ', { error: 'No closing bracket' } ]
```

but the `haicu` parser __will not throw any error__.

You should use [validators](#validators) to check your translations before deploying them.

## Validators

To validate an ICU message node or AST you can import a validator from `haicu/validators.js`.

For example, given your translation `messages` you can test that all can be parsed correctly with something like

```js
import haicu from 'haicu'
import { isMessageAST } from 'haicu/validators.js'

export function testTranslations (messages) {
  for (const message of messages) {
    const ast = haicu(message)
    if (isMessageAST(ast))
      continue
    // If there is an error, it has always the shape
    // { error: string }
    const error = ast.find(node => node.error).error
    throw new Error(`Invalid ICU message ${message} with error '${error}'`)
  }
}
```

All validators are type-guards:

- `isMessageAST(arg: unknown): arg is MessageAST`
- `isMessageArg(arg: unknown): arg is MessageArg`
- `isMessageTag(arg: unknown): arg is MessageTag`

