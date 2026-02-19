import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { extractTag } from 'haicu'

test('extractTag', () => {
	for (const { input, output } of [
		{
			input: '',
			output: []
		},
		{
			input: 'no tag',
			output: ['no tag']
		},
		{
			input: '<b>ok</b>',
			output: [
				{ openTag: 'b' },
				'ok',
				{ closeTag: 'b' }
			]
		},
		{
			input: 'hello <em>world</em>',
			output: [
				'hello ',
				{ openTag: 'em' },
				'world',
				{ closeTag: 'em' }
			]
		},
		{
			input: '<p>nested <b>tag</b></p>',
			output: [
				{ openTag: 'p' },
				'nested ',
				{ openTag: 'b' },
				'tag',
				{ closeTag: 'b' },
				{ closeTag: 'p' }
			]
		},
		{
			input: 'Unclosed <em>tag',
			output: [
				'Unclosed ',
				{ openTag: 'em' },
				'tag',
			]
		},
		{
			input: 'Unopened tag</em>',
			output: [
				'Unopened tag',
				{ closeTag: 'em' }
			]
		},
		{
			input: 'hello <em>{name}</em>',
			output: [
				'hello ',
				{ openTag: 'em' },
				'{name}',
				{ closeTag: 'em' }
			]
		},
	])
		assert.deepEqual(extractTag(input), output)
})
