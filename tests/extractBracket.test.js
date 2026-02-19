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
			output: ['no bracket']
		},
		{
			input: '{arg1}',
			output: [
				{ type: '{' },
				'arg1',
				{ type: '}' }
			]
		},
		{
			input: '{arg1} {arg2}',
			output: [
				{ type: '{' },
				'arg1',
				{ type: '}' },
				' ',
				{ type: '{' },
				'arg2',
				{ type: '}' }
			]
		},
		{
			input: 'hello, {name}',
			output: [
				'hello, ',
				{ type: '{' },
				'name',
				{ type: '}' }
			]
		},
		{
			input: 'hello, {name }',
			output: [
				'hello, ',
				{ type: '{' },
				'name ',
				{ type: '}' },
			]
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
				{ type: '{' },
				`
arg `,
				{ type: '}' }
			]
		},
		{
			input: 'hello <em>{name}</em>',
			output: [
				'hello <em>',
				{ type: '{' },
				'name',
				{ type: '}' },
				'</em>'
			]
		},
		{
			input: `{itemCount, plural,
  one {Cart: {itemCount, number} item}
  other {Cart: {itemCount, number} items}
}`,
			output: [
				{ type: '{' },
				`itemCount, plural,
  one `,
				{ type: '{' },
				'Cart: ',
				{ type: '{' },
				'itemCount, number',
				{ type: '}' },
				' item',
				{ type: '}' },
				`
  other `,
				{ type: '{' },
				'Cart: ',
				{ type: '{' },
				'itemCount, number',
				{ type: '}' },
				' items',
				{ type: '}' },
				'\n',
				{ type: '}' }
			]
		},
	])
		assert.deepEqual(extractBracket(input), output)
})
