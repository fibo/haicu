import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import haicu from 'haicu'
import type { MessageAST } from 'haicu'
import { isMessageAST } from 'haicu/validators.js'

const testData: Array<{
	input: string
	output: MessageAST
}> = [
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
		input: "escaped '<tag>'",
		output: [ 'escaped ', '<tag>' ]
	},
	{
		input: "escaped '<tag>' with children '</tag>'",
		output: [ 'escaped ', '<tag>', ' with children ', '</tag>' ]
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
		output: [ `hello
world` ]
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
]

const noClosingBrackets = [
	'Hello {name',
	'{count, plural, one{item}',
]

test('haicu', () => {
	for (const { input, output } of testData)
		assert.deepEqual(haicu(input), output, `haicu('${input}') == ${JSON.stringify(output)}`)
})

test('validators', () => {
	for (const { output } of testData)
		assert.ok(isMessageAST(output), `isMessageAST(${JSON.stringify(output)})`)
})

test('invalid messages', () => {
	for (const input of [
		'',
		...noClosingBrackets
	])
		assert.ok(!isMessageAST(haicu(input)), `!isMessageAST(haicu('${input}'))`)
})

// This error message is also shown in README.md
test('error: No closing bracket', () => {
	for (const input of noClosingBrackets)
		assert.ok(haicu(input).some(
			node => {
				if (typeof node !== 'object')
					return
				return (node as unknown as { error: string }).error = 'No closing bracket'
			}
		))
})
