import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { extractBracket } from 'haicu'

test('extractBracket', () => {
	for (const { input, output } of [
		{
			input: '',
			output: []
		},
		{
			input: 'no bracket',
			output: [ 'no bracket' ]
		},
		{
			input: '{arg1}',
			output: [ '{', 'arg1', '}' ]
		},
		{
			input: '{arg1} {arg2}',
			output: [ '{', 'arg1', '}', ' ', '{', 'arg2', '}' ]
		},
		{
			input: 'hello, {name}',
			output: [ 'hello, ', '{', 'name', '}' ]
		},
		{
			input: 'hello, {name }',
			output: [ 'hello, ', '{', 'name ', '}' ]
		},
		{
			input: `hello
world`,
			output: [`hello
world`]
		},
		{
			input: `hello {
arg }`,
			output: [
				'hello ',
				'{',
				`
arg `,
				'}'
			]
		},
		{
			input: 'hello <em>{name}</em>',
			output: [ 'hello <em>', '{', 'name', '}', '</em>' ]
		},
		{
			input: `{itemCount, plural,
  one {Cart: {itemCount, number} item}
  other {Cart: {itemCount, number} items}
}`,
			output: [
				'{',
				`itemCount, plural,
  one `,
				'{',
				'Cart: ',
				'{',
				'itemCount, number',
				'}',
				' item',
				'}',
				`
  other `,
				'{',
				'Cart: ',
				'{',
				'itemCount, number',
				'}',
				' items',
				'}',
				'\n',
				'}'
			]
		},
	])
		assert.deepEqual(extractBracket(input), output)
})
