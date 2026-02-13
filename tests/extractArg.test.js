import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { extractArg } from 'haicu'

test('extractArg', () => {
	for (const { input, output } of [
		{
			input: '',
			output: []
		},
		{
			input: 'hello',
			output: [{ type: 'text', text: 'hello' }]
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
				{ type: 'text', text: `hello
world` }
			]
		},
		{
			input: `hello {
arg }`,
			output: [
				{ type: 'text', text: 'hello ' },
				`{
arg }`
			]
		},
	])
		assert.deepEqual(extractArg(input), output)
})
