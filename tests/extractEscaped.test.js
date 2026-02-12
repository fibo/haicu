import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { extractEscaped } from 'haicu'

test('extractEscaped', () => {
	for (const { input, output } of [
		{
			input: '',
			output: []
		},
		{
			input: 'text',
			output: ['text']
		},
		{
			input: "This is '{escaped}'",
			output: [
				'This is ',
				{ type: 'text', text: '{escaped}' }
			]
		},
	])
		assert.deepEqual(extractEscaped(input), output)
})
