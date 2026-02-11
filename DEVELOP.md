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

