import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import haicu from 'haicu'
import type { MessageAST } from 'haicu'

type TestData = {
	input: string
	output: MessageAST
}

test('haicu', () => {
	for (const { input, output } of [
		{
			input: '',
			output: []
		},
		{
			input: 'hello',
			output: [ 'hello' ]
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
					ast: [ 'world' ]
				}
			]
		},
		{
			input: 'hello {name}',
			output: [ 'hello ', { arg: 'name' } ]
		},
		{
			input: 'index {0}',
			output: [ 'index ', { arg: 0 } ]
		},
		{
			input: '{count, number}',
			output: [ { arg: 'count', type: 'number' } ]
		},
		{
			input: 'Today is {today, date}',
			output: [ 'Today is ', { arg: 'today', type: 'date' } ]
		},
		{
			input: 'Hello <em>{name}</em>',
			output: [
				'Hello ',
				{
					tag: 'em',
					ast: [ { arg: 'name' } ]
				}
			]
		},
		/*
		{
			input: 'count, plural, one{item} other{items}',
			output: [{
				arg: 'index',
				type: 'plural',
				cases: [
					{ key: 'one', ast: [ 'item' ] },
					{ key: 'other', ast: [ 'items' ] }
				]
			}]
		},
		{
			// TODO complete input
			input: [ 'index, plural, offset:1 ' ],
			output: [{
				arg: 'index',
				type: 'plural',
				offset: 1,
			}]
		},
		*/
	] satisfies TestData[])
		assert.deepEqual(haicu(input), output)
})
