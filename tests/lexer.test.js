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
			output: [{ type: 'text', text: 'hello' }]
		},
		{
			input: "This is '{escaped}'",
			output: [
				{ type: 'text', text: 'This is ' },
				{ type: 'text', text: '{escaped}' }
			]
		},
	])
		assert.deepEqual(lexer(input), output)
})
