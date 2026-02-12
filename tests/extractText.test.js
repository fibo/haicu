import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { extractText } from 'haicu'

test('extractText', () => {
	for (const { input, output } of [
		{
			input: '',
			output: []
		},
		{
			input: 'text',
			output: [
				{ type: 'text', text: 'text' }
			]
		},
		{
			input: 'hello, {name}',
			output: [
				{ type: 'text', text: 'hello, ' },
				'{name}'
			]
		},
		{
			input: 'hello, {name }',
			output: [
				{ type: 'text', text: 'hello, ' },
				'{name }'
			]
		},
		{
			input: `hello
world`,
			output: [
				{
					type: 'text',
					text: `hello
world`,
				}
			]
		},
		{
			input: `hello {
arg }`,
			output: [
				{ type: 'text', text: 'hello ' },
				`{
arg }`,
			]
		},
	])
		assert.deepEqual(extractText(input), output)
})
