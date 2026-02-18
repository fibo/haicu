import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { parseArg } from 'haicu'

test('parseArg', () => {
	for (const { input, output } of [
		{
			input: 'count',
			output: [{ type: 'arg', name: 'count' }]
		},
		{
			input: '0',
			output: [{ type: 'arg', num: 0 }]
		},
		{
			input: 'count, number',
			output: [
				{ type: 'arg', name: 'count' },
				{ type: 'kind', kind: 'number' },
			]
		},
		{
			input: 'count, plural, offset:1',
			output: [
				{ type: 'arg', name: 'count' },
				{ type: 'kind', kind: 'plural' },
				{ type: 'offset', offset: 1 }
			]
		},
	])
		assert.deepEqual(parseArg(input), output)
})
