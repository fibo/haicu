import { strict as assert } from 'node:assert'
import { describe, test } from 'node:test'
import haicu from 'haicu'
import type { MessageAST } from 'haicu'
import { findError, isMessageAST } from 'haicu/validators.js'

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
		input: "escaped '<tag>",
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
		input: "Made with '<3",
		output: [ 'Made with ',  '<3' ]
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
		input: 'auto-closed <br/> tag',
		output: [
			'auto-closed ',
			{
				tag: 'br',
				ast: []
			},
			' tag'
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
		input: '{increase, number, percent} complete',
		output: [
			{ arg: 'increase', type: 'number', format: 'percent' },
			' complete'
		]
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
	{
		input: '{gender, select, male {his} female {her} other {x}}',
		output: [ {
			arg: 'gender',
			type: 'select',
			cases: [
				{ key: 'male', ast: [ 'his' ] },
				{ key: 'female', ast: [ 'her' ] },
				{ key: 'other', ast: [ 'x' ] }
			]
		} ]
	},
]

const errorsMap = {
	'Expected format': [
		'{num, number, }',
	],

	'Expected type': [
		'{num, }',
		'{num, ,}',
	],

	'Missing case other': [
		'{num, selectordinal, one {missing other}}',
		'{num, plural, one {missing other}}',
		'{gender, select, female {missing other}}',
	],

	'No closing bracket': [
		'Hello {name', // This error is also shown in README.md
		'{count, plural, one{item}',
	],

	'No closing tag': [
		'unclosed <tag>',
	],
}

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
		...Object.values(errorsMap).flat()
	])
		assert.ok(!isMessageAST(haicu(input)), `!isMessageAST(haicu('${input}'))`)
})

describe('error', () => {
	for (const [errorMessage, testData] of Object.entries(errorsMap))
		test(errorMessage, () => {
			for (const input of testData) {
				const ast = haicu(input)
				const error = findError(ast)
				assert.equal(error, errorMessage)
			}
		})
})
