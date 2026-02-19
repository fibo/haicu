import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { endOfSubTreeIndex } from 'haicu'

test('endOfSubTreeIndex', () => {
	const isOpen = token => token === '('
	const isClose = token => token === ')'

	for (const { input, output } of [
		{
			input: [ 'token', ')' ],
			output: 1
		},
		{
			input: [ 'token', '(', ')', ')' ],
			output: 3
		},
	])
		assert.deepEqual(endOfSubTreeIndex(isOpen, isClose)(input), output)
})
