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
			output: [ 'This is ', '{escaped}' ]
		},
		{
			input: "escaped '#' hash",
			output: [ 'escaped ', '#', ' hash' ]
		},
		{
			input: "I''m fine",
			output: [ 'I', "'", 'm fine' ]
		},
		{
			input: "first '{escaped one}' second '{escaped2}'.",
			output: [
				'first ',
				'{escaped one}',
				' second ',
				'{escaped2}',
				'.'
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
			input: '<b>ok</b>',
			output: [
				{
					tag: 'b',
					ast: [ 'ok' ]
				},
			]
		},
		{
			input: 'hello {name}',
			output: [ 'hello ', { arg: 'name' } ]
		},
		{
			input: '{arg1} {arg2}',
			output: [ { arg: 'arg1' }, ' ', { arg: 'arg2' } ]
		},
		{
			input: `hello
world`,
			output: [`hello
world`]
		},
		{
			input: '<p>nested <b>tag</b></p>',
			output: [
				{
					tag: 'p',
					ast: [
						'nested ',
						{ tag: 'b', ast: [ 'tag' ] }
					]
				}
			]
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
		{
			input: '{count, plural, one{item} other{items}}',
			output: [ {
				arg: 'count',
				type: 'plural',
				cases: [
					{ key: 'one', ast: [ 'item' ] },
					{ key: 'other', ast: [ 'items' ] }
				]
			} ]
		},
		{
			input: '{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} place',
			output: [
				{
					arg: 'rank',
					type: 'selectordinal',
					cases: [
						{ key: 'one', ast: [ { value: true }, 'st' ] },
						{ key: 'two', ast: [ { value: true }, 'nd' ] },
						{ key: 'few', ast: [ { value: true }, 'rd' ] },
						{ key: 'other', ast: [ { value: true }, 'th' ] },
					]
				},
				' place'
			]
		},
		{
			input: `{itemCount, plural, offset:1
  one {Cart: {itemCount, number} item}
  other {Cart: {itemCount, number} items}
}`,
			output: [ {
				arg: 'itemCount',
				type: 'plural',
				offset: 1,
				cases: [
					{
						ast: [
							'Cart: ',
							{ arg: 'itemCount', type: 'number' },
							' item'
						],
						key: 'one'
					},
					{
						ast: [
							'Cart: ',
							{ arg: 'itemCount', type: 'number' },
							' items'
						],
						key: 'other'
					}
				],
			} ]
		},
		{
			input: `{ COUNT, plural,
    =0 {There are no results.}
    one {There is one result.}
    other {There are # results.}
}`,
			output: [ {
				arg: 'COUNT',
				type: 'plural',
				cases: [
					{
						key: 0,
						ast: [ 'There are no results.' ]
					},
					{
						key: 'one',
						ast: [ 'There is one result.' ]
					},
					{
						key: 'other',
						ast: [
							'There are ',
							{ value: true },
							' results.'
						]
					}
				]
			} ]
		},
	] satisfies TestData[])
		assert.deepEqual(haicu(input), output)
})
