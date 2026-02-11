import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import haicu from 'haicu'
import type { MessageToken } from 'haicu'

test('haicu', () => {
	for (const { input, output } of [
		{
			input: '',
			output: ['']
		},
	] satisfies Array<{
		input: string
		output: MessageToken[]
	}>)
		assert.deepEqual(haicu(input), output)
})
