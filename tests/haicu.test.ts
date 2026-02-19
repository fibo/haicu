import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import haicu from 'haicu'
import type { HaicuNode } from 'haicu'

type TestData = {
	input: string
	output: HaicuNode[]
}

test('haicu', () => {
	for (const { input, output } of [
		{
			input: '',
			output: []
		},
		{
			input: 'hello',
			output: ['hello']
		},
		{
			input: "This is '{escaped}'",
			output: [
				'This is ',
				'{escaped}'
			]
		},
		{
			input: 'hello <em>world</em>',
			output: [
				'hello ',
				{ type: 'openTag', tag: 'em' },
				'world',
				{ type: 'closeTag', tag: 'em' },
			]
		},
		{
			input: 'hello {name}',
			output: [
				'hello ',
				{ type: '{' },
				'name',
				{ type: '}' },
			]
		},
		{
			input: 'Hello <em>{name}</em>',
			output: [
				'Hello ',
				{ type: 'openTag', tag: 'em' },
				{ type: '{' },
				'name',
				{ type: '}' },
				{ type: 'closeTag', tag: 'em' },
			]
		},
	] satisfies TestData[])
		assert.deepEqual(haicu(input), output)
})
