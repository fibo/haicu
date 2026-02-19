import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { lexer } from 'haicu'

test('lexer', () => {
	for (const { input, output } of [
		{
			input: '',
			output: []
		},
		{
			input: 'hello',
			output: [
				{ type: 'text', text: 'hello' }
			]
		},
		{
			input: "This is '{escaped}'",
			output: [
				{ type: 'text', text: 'This is ' },
				{ type: 'text', text: '{escaped}' }
			]
		},
		{
			input: 'hello <em>world</em>',
			output: [
				{ type: 'text', text: 'hello ' },
				{ type: 'openTag', tag: 'em' },
				{ type: 'text', text: 'world' },
				{ type: 'closeTag', tag: 'em' },
			]
		},
		{
			input: 'hello {name}',
			output: [
				{ type: 'text', text: 'hello ' },
				{ type: '{' },
				{ type: 'text', text: 'name' },
				{ type: '}' },
			]
		},
		{
			input: 'Hello <em>{name}</em>',
			output: [
				{ type: 'text', text: 'Hello ' },
				{ type: 'openTag', tag: 'em' },
				{ type: '{' },
				{ type: 'text', text: 'name' },
				{ type: '}' },
				{ type: 'closeTag', tag: 'em' },
			]
		},
	])
		assert.deepEqual(lexer(input), output)
})
