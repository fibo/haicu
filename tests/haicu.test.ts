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
				{
					tag: 'em',
					children: ['world']
				}
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
				{
					tag: 'em',
					children: [
						{ type: '{' },
						'name',
						{ type: '}' },
					]
				}
			]
		},
	] satisfies TestData[])
		assert.deepEqual(haicu(input), output)
})
