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
			output: [ 'text' ]
		},
		{
			input: 'hello {name}',
			output: [ 'hello {name}' ]
		},
		{
			input: "I''m fine",
			output: [ 'I', "'", 'm fine' ]
		},
		{
			input: "This is '{escaped}'",
			output: [
				'This is ',
				{ escaped: '{escaped}' }
			]
		},
		{
			input: "first '{escaped one}' second '{escaped2}'.",
			output: [
				'first ',
				{ escaped: '{escaped one}' },
				' second ',
				{ escaped: '{escaped2}' },
				'.'
			]
		},
	])
		assert.deepEqual(extractEscaped(input), output)
})
