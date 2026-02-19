const OPEN_BRACKET = '{'
const CLOSE_BRACKET = '}'
const OPEN_TAG = '<'
const CLOSE_TAG = '>'
const SLASH = '/'
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
		`(?<escaped>\\${OPEN_BRACKET}[^${CLOSE_BRACKET}${ESCAPE}]*\\${CLOSE_BRACKET})${ESCAPE}` +
		`|(?<doubleQuote>${ESCAPE})` +
	')',
({ escaped, doubleQuote }) => {
	if (escaped)
		return { escaped }
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
		result.push({ type: OPEN_BRACKET })
	if (text)
			result.push(text)
	if (hasClose)
		result.push({ type: CLOSE_BRACKET })
	return result
})

export const extractTag = extract(OPEN_TAG,
	`${OPEN_TAG}` +
	`(?<isClosing>${SLASH})?` +
	`(?<tag>[^${CLOSE_TAG}]+)${CLOSE_TAG}`,
({ tag, isClosing }) => {
	if (tag)
		return isClosing ? { closeTag: tag } : { openTag: tag }
})

export const endOfSubtreeIndex = (isOpen, isClose) => tokens => {
	let level = 0
	return tokens.findIndex(token => {
		if (isClose(token)) {
			if (level === 0)
				return true
			level--
		}
		if (isOpen(token))
			level++
	})
}

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

const pickSubtree = (index, list, findCloseIndex) => {
	const closeIndex = findCloseIndex(list.slice(index + 1))
	return {
		subtreeTokens: list.slice(index + 1, index + closeIndex + 1),
		context: { skipToIndex: index + closeIndex + 1 },
	}
}

export const growAST = ({ context, tokens }, token, index, list) => {
	if (context.skipToIndex) {
		if (context.skipToIndex === index)
			delete context.skipToIndex
		return { context, tokens }
	}

	if (typeof token === 'string')
		return { context, tokens: tokens.concat(token) }

	if (token.escaped)
		return { context, tokens: tokens.concat(token.escaped) }

	if (token.openTag) {
		const tag = token.openTag
		const { context, subtreeTokens } = pickSubtree(index, list,
			endOfSubtreeIndex(token => token.openTag === tag, token => token.closeTag === tag)
		)
		return {
			context,
			tokens: tokens.concat({
				tag,
				children: subtreeTokens
					.reduce(growAST, { context: {}, tokens: [] })
					.tokens
			})
		}
	}

	return { context, tokens: tokens.concat(token) }
}

const pipe = fn => (tokens, part) => tokens.concat(fn(part))

const haicu = message => extractEscaped(message)
	.reduce(pipe(extractTag), [])
	.reduce(pipe(extractBracket), [])
	.reduce(growAST, { context: {}, tokens: [] })
	.tokens

export default haicu
