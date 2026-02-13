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
			input: 'hello {name}',
			output: ['hello {name}']
		},
		{
			input: "I''m fine",
			output: ['I', "'", 'm fine']
		},
		{
			input: "This is '{escaped}'",
			output: [
				'This is ',
				{ type: 'text', text: '{escaped}' }
			]
		},
		{
			input: "first '{escaped one}' second '{escaped2}'.",
			output: [
				'first ',
				{ type: 'text', text: '{escaped one}' },
				' second ',
				{ type: 'text', text: '{escaped2}' },
				'.'
			]
		},
	])
		assert.deepEqual(extractEscaped(input), output)
})
