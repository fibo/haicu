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
({ hasOpen, text, hasClose }) => ([
	hasOpen && OPEN_BRACKET,
	text,
	hasClose && CLOSE_BRACKET
].filter(x => !!x)))

export const extractTag = extract(OPEN_TAG,
	`${OPEN_TAG}` +
	`(?<isClosing>${SLASH})?` +
	`(?<tag>[^${CLOSE_TAG}]+)${CLOSE_TAG}`,
({ tag, isClosing }) => {
	if (tag)
		return isClosing ? { closeTag: tag } : { openTag: tag }
})

const findClosingIndex = (isOpen, isClose) => tokens => {
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

const findCloseBracketIndex = findClosingIndex(
	token => token === OPEN_BRACKET,
	token => token === CLOSE_BRACKET
)

const findCloseTagIndex = (tag) => findClosingIndex(
	token => token.openTag === tag,
	token => token.closeTag === tag
)

const subTree = (findCloseIndex, list, index) => {
	const closeIndex = findCloseIndex(list.slice(index))
	return {
		closeIndex,
		tokens: list.slice(index, index + closeIndex)
	}
}

const toArg = ({ done, tree }, token, index, list) => {
	if (done)
		return { done, tree }

	const parts = token.split(',')
	const [first, second] = parts.map(x => x.trim())
	const third = parts[2]

	const num = +first
	const arg = { arg: isNaN(num) ? first : num }

	if (!second)
		return { done: true, tree: tree.concat(arg) }
	arg.type = second

	if (second === 'plural') {
		let key = third.trim()
		const offsetMatch = /offset:(\d+)/.exec(third)
		if (offsetMatch) {
			const offset = +offsetMatch[1]
			arg.offset = offset
			key = key.slice(`offset:${offset}`.length).trim()
		}
		arg.cases = []
		let rest = list.slice(index)
		while (rest.length) {
			const openIndex = rest.findIndex(token => token === OPEN_BRACKET)
			if (openIndex < 0)
				return { done: true, tree: tree.concat(arg) }

			const { closeIndex, tokens } = subTree(findCloseBracketIndex, rest, openIndex)
			if (closeIndex < 0)
				return { done: true, tree: tree.concat(arg) }

			arg.cases.push({
				key,
				ast: tokens.reduce(toAST, { tree: [] }).tree
			})

			rest = rest.slice(8)
		}

		return { done: true, tree: tree.concat(arg) }
	}

	if (!third)
		return { done: true, tree: tree.concat(arg) }
}

const toAST = ({ skip, tree }, token, index, list) => {
	if (skip)
		return { tree, skip: skip === index ? undefined : skip }

	if (token.escaped)
		return { tree: tree.concat(token.escaped) }

	if (token.openTag) {
		const tag = token.openTag
		const { tokens, closeIndex } = subTree(findCloseTagIndex(tag), list, index + 1)
		return {
			skip: index + closeIndex + 1,
			tree: tree.concat({
				tag,
				ast: tokens.reduce(toAST, { tree: [] }).tree
			})
		}
	}

	if (token === OPEN_BRACKET) {
		const { tokens, closeIndex } = subTree(findCloseBracketIndex, list, index + 1)
		return {
			skip: index + 1 + closeIndex,
			tree: tree.concat(tokens.reduce(toArg, { tree: [] }).tree)
		}
	}

	return { tree: tree.concat(token) }
}

const pipe = fn => (tokens, part) => tokens.concat(fn(part))

const haicu = message => extractEscaped(message)
	.reduce(pipe(extractTag), [])
	.reduce(pipe(extractBracket), [])
	.reduce(toAST, { tree: [] }).tree

export default haicu
