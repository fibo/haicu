const OPEN_BRACKET = '{'
const CLOSE_BRACKET = '}'
const OPEN_TAG = '<'
const CLOSE_TAG = '>'
const CLOSING_TAG = '/'
const ESCAPE = "'"

const extract = (symbol, matcher, resolver) => arg =>
	typeof arg !== 'string' ? arg : arg.matchAll(RegExp(
	`(?<before>[^${symbol}]*)` +
	`(:?${matcher}` +
	`(?<after>[^${symbol}]*)` +
	'){0,1}',
'g')).reduce((tokens, { groups: { before, after, ...rest } = {} }) =>
	tokens.concat(
		...[before, resolver(rest), after]
		.filter(x => !!x)
	), [])

export const extractEscaped = extract(ESCAPE,
	`${ESCAPE}(?:` +
		`(?<escapedPart>\\${OPEN_BRACKET}[^${CLOSE_BRACKET}${ESCAPE}]*\\${CLOSE_BRACKET})${ESCAPE}` +
		`|(?<doubleQuote>${ESCAPE})` +
	')',
({ escapedPart, doubleQuote }) => {
	if (escapedPart)
		return { type: 'text', text: escapedPart }
	if (doubleQuote)
		return ESCAPE
})

export const extractBracket = extract(`${OPEN_BRACKET}${CLOSE_BRACKET}`,
	`(?<hasOpen>\\${OPEN_BRACKET})?` +
		`(?<text>[^${OPEN_BRACKET}${CLOSE_BRACKET}]*)` +
	`(?<hasClose>\\${CLOSE_BRACKET})?`,
({ hasOpen, text, hasClose }) => {
	const result = []
	if (hasOpen)
		result.push({ type: 'openBracket' })
	if (text) {
		if (hasClose)
			result.push({ type: 'rawArg', text })
		else
			result.push(text)
	}
	if (hasClose)
		result.push({ type: 'closeBracket' })
	return result
})

export const extractTag = extract(OPEN_TAG,
	`${OPEN_TAG}` +
	`(?<isClosing>${CLOSING_TAG})?` +
	`(?<tag>[^${CLOSE_TAG}]+)${CLOSE_TAG}`,
({ tag, isClosing }) => {
	if (tag)
		return { type: isClosing ? 'closeTag' : 'openTag', tag }
})

export const parseArg = str => {
	const parts = str.split(',')
	const [first, second] = parts.map(x => x.trim())
	const third = parts[2]

	const num = +first
	const nameOrNum = isNaN(num) ?
		{ type: 'arg', name: first} :
		{ type: 'arg', num }

	if (parts.length === 1)
		return [nameOrNum]

	if (second === 'choice') {
	}

	if (second === 'plural') {
		const result = [nameOrNum, { type: 'kind', kind: 'plural' }]
		const offsetMatch = /offset:(\d+)/.exec(third)
		if (offsetMatch)
			result.push({ type: 'offset', offset: +offsetMatch[1] })
		return result
	}

	if (second === 'select') {
	}

	if (second === 'selectordinal') {
	}

	if (['number', 'date', 'time', 'spellout', 'ordinal', 'duration'].includes(second)) {
		if (parts.length === 2)
			return [nameOrNum, { type: 'kind', kind: second }]
	}
}

const pipe = fn => (tokens, part) => tokens.concat(fn(part))

export const lexer = arg => extractEscaped(arg)
	.reduce(pipe(extractTag), [])
	.reduce(pipe(extractBracket), [])
	.reduce(pipe(part => (
		typeof part === 'string' ? ({ type: 'text', text: part }) : part
	)), [])

export default function haicu(message) {
	const tokens = lexer(message)
	return tokens
}
