import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import haicu from 'haicu'
import type { MessageToken } from 'haicu'

type TestData = {
	input: string
	output: MessageToken[]
}

test('haicu', () => {
	for (const { input, output } of [
		{
			input: '',
			output: []
		},
	] satisfies TestData[])
		assert.deepEqual(haicu(input), output)
})
