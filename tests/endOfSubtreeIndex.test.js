import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { endOfSubtreeIndex } from 'haicu'

test('endOfSubtreeIndex', () => {
	const isOpen = token => token === '('
	const isClose = token => token === ')'

	for (const { input, output } of [
		{
			input: ['token', ')'],
			output: 1
		},
		{
			input: ['token', '(', ')', ')'],
			output: 3
		},
	])
		assert.deepEqual(endOfSubtreeIndex(isOpen, isClose)(input), output)
})
