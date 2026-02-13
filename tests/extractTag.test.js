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
				{ type: 'openTag', tag: 'b' },
				'ok',
				{ type: 'closeTag', tag: 'b' },
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
			input: '<p>nested <b>tag</b></p>',
			output: [
				{ type: 'openTag', tag: 'p' },
				'nested ',
				{ type: 'openTag', tag: 'b' },
				'tag',
				{ type: 'closeTag', tag: 'b' },
				{ type: 'closeTag', tag: 'p' },
			]
		},
		{
			input: 'Unclosed <em>tag',
			output: [
				'Unclosed ',
				{ type: 'openTag', tag: 'em' },
				'tag',
			]
		},
		{
			input: 'Unopened tag</em>',
			output: [
				'Unopened tag',
				{ type: 'closeTag', tag: 'em' },
			]
		},
		{
			input: 'hello <em>{name}</em>',
			output: [
				'hello ',
				{ type: 'openTag', tag: 'em' },
				'{name}',
				{ type: 'closeTag', tag: 'em' },
			]
		},
	])
		assert.deepEqual(extractTag(input), output)
})
