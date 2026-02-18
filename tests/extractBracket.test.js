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
				{ type: 'openBracket' },
				{ type: 'arg', arg: 'arg1' },
				{ type: 'closeBracket' }
			]
		},
		{
			input: '{arg1} {arg2}',
			output: [
				{ type: 'openBracket' },
				{ type: 'arg', arg: 'arg1' },
				{ type: 'closeBracket' },
				' ',
				{ type: 'openBracket' },
				{ type: 'arg', arg: 'arg2' },
				{ type: 'closeBracket' }
			]
		},
		{
			input: 'hello, {name}',
			output: [
				'hello, ',
				{ type: 'openBracket' },
				{ type: 'arg', arg: 'name' },
				{ type: 'closeBracket' }
			]
		},
		{
			input: 'hello, {name }',
			output: [
				'hello, ',
				{ type: 'openBracket' },
				{ type: 'arg', arg: 'name ' },
				{ type: 'closeBracket' },
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
				{ type: 'openBracket' },
				{ type: 'arg', arg: `
arg ` },
				{ type: 'closeBracket' }
			]
		},
		{
			input: 'hello <em>{name}</em>',
			output: [
				'hello <em>',
				{ type: 'openBracket' },
				{ type: 'arg', arg: 'name' },
				{ type: 'closeBracket' },
				'</em>'
			]
		},
		{
			input: `{itemCount, plural,
  one {Cart: {itemCount, number} item}
  other {Cart: {itemCount, number} items}
}`,
			output: [
				{ type: 'openBracket' },
				`itemCount, plural,
  one `,
				{ type: 'openBracket' },
				'Cart: ',
				{ type: 'openBracket' },
				{ type: 'arg', arg: 'itemCount, number' },
				{ type: 'closeBracket' },
				' item',
				{ type: 'closeBracket' },
				`
  other `,
				{ type: 'openBracket' },
				'Cart: ',
				{ type: 'openBracket' },
				{ type: 'arg', arg: 'itemCount, number' },
				{ type: 'closeBracket' },
				' items',
				{ type: 'closeBracket' },
				'\n',
				{ type: 'closeBracket' }
			]
		},
	])
		assert.deepEqual(extractBracket(input), output)
})
