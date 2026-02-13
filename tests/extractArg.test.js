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
			input: 'no arg',
			output: ['no arg']
		},
		{
			input: '{arg}',
			output: [
				{ type: 'arg', arg: 'arg' }
			]
		},
		{
			input: '{arg1} {arg2}',
			output: [
				{ type: 'arg', arg: 'arg1' },
				' ',
				{ type: 'arg', arg: 'arg2' }
			]
		},
		{
			input: 'hello, {name}',
			output: [
				'hello, ',
				{ type: 'arg', arg: 'name' }
			]
		},
		{
			input: 'hello, {name }',
			output: [
				'hello, ',
				{ type: 'arg', arg: 'name ' },
			]
		},
		{
			input: `hello
world`,
			output: [`hello
world`]
		},
		{
			input: `hello {
arg }`,
			output: [
				'hello ',
				{ type: 'arg', arg: `
arg ` }
			]
		},
		{
			input: 'hello <em>{name}</em>',
			output: [
				'hello <em>',
				{ type: 'arg', arg: 'name' },
				'</em>'
			]
		},
	])
		assert.deepEqual(extractArg(input), output)
})
