import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { extractArgs } from 'haicu'

test('extractArgs', () => {
	for (const { input, output } of [
		{
			input: '',
			output: ['']
		},
	])
		assert.deepEqual(extractArgs(input), output)
})
