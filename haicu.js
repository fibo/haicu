const OPEN_BRACKET = '{'
const CLOSE_BRACKET = '}'
const OPEN_TAG = '<'
const CLOSE_TAG = '>'
const SLASH = '/'
const HASH = '#'
const ESCAPE = "'"

const empty = x => !!x

const error = {
	noClosingBracket: { error: 'No closing bracket' }
}

const extract = (symbol, matcher, resolver) => arg =>
	typeof arg !== 'string' ? arg : arg.matchAll(RegExp(
	`(?<before>[^${symbol}]*)` +
	`(:?${matcher}` +
	`(?<after>[^${symbol}]*)` +
	'){0,1}',
'g')).reduce((tokens, { groups: { before, after, ...rest } = {} }) =>
	tokens.concat(
		...[before, resolver(rest), after]
		.filter(empty)
	), [])

export const extractEscaped = extract(ESCAPE,
	`${ESCAPE}(?:` +
		`(?<arg>\\${OPEN_BRACKET}[^${CLOSE_BRACKET}${ESCAPE}]*\\${CLOSE_BRACKET})` +
		`|(?<quote>${ESCAPE})` +
		`|(?<hash>${HASH})` +
		`|(?<tag>${OPEN_TAG}${SLASH}?[^${CLOSE_TAG}]+${CLOSE_TAG})` +
	')',
({ arg, quote, hash, tag }) => {
	if (quote)
		return ESCAPE
	const escaped = arg ?? hash ?? tag
	if (escaped)
		return { escaped }
})

const extractBracket = extract(`${OPEN_BRACKET}${CLOSE_BRACKET}`,
	`(?<hasOpen>\\${OPEN_BRACKET})?` +
		`(?<text>[^${OPEN_BRACKET}${CLOSE_BRACKET}]*)` +
	`(?<hasClose>\\${CLOSE_BRACKET})?`,
({ hasOpen, text, hasClose }) => ([
	hasOpen && OPEN_BRACKET,
	text,
	hasClose && CLOSE_BRACKET
].filter(empty)))

const extractTag = extract(OPEN_TAG,
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

	if (!third)
		return { done: true, tree: tree.concat(arg) }

	const isPlural = second === 'plural'
	const isSelectordinal = second === 'selectordinal'
	let key = third.trim()

	if (isPlural) {
		const offsetMatch = /offset:(\d+)/.exec(third)
		if (offsetMatch) {
			const offset = +offsetMatch[1]
			arg.offset = offset
			key = key.slice(`offset:${offset}`.length).trim()
		}
	}

	arg.cases = [key, ...list.slice(index + 1)].reduce(({ cases, skip }, part, index, array) => {
		if (skip)
			return { cases, skip: skip === index ? undefined : skip }

		let key = part.trim()

		if (isPlural || isSelectordinal) {
			const explicitValueMatch = /=(\d+)/.exec(key)
			if (explicitValueMatch)
				key = +explicitValueMatch[1]
		}

		if ((isPlural || isSelectordinal) && ['zero', 'one', 'two', 'few', 'many', 'other'].includes(key) || typeof key === 'number') {
			const openBracketIndex = array.slice(index).findIndex(token => token === OPEN_BRACKET)
			const rest = array.slice(openBracketIndex + 1)
			const closeBracketIndex = findCloseBracketIndex(rest)

			if (closeBracketIndex === -1)
				return error.noClosingBracket

			const astTokens = array.slice(index + openBracketIndex + 1).slice(0, closeBracketIndex)
			return {
				skip: index + openBracketIndex + closeBracketIndex,
				cases: cases.concat({
					key,
					ast: astTokens.reduce(toAST, { isArg: isPlural || isSelectordinal, tree: [] }).tree
				})
			}
		}
		return { cases }
	}, { cases: [] }).cases

	return { done: true, tree: tree.concat(arg) }
}

const toAST = ({ isArg, skip, tree }, token, index, list) => {
	if (skip)
		return { tree, skip: skip === index ? undefined : skip }

	if (token.escaped)
		return { isArg, tree: tree.concat(token.escaped) }

	if (token.openTag) {
		const tag = token.openTag
		const { tokens, closeIndex } = subTree(findCloseTagIndex(tag), list, index + 1)
		return {
			isArg,
			skip: index + closeIndex + 1,
			tree: tree.concat({
				tag,
				ast: tokens.reduce(toAST, { tree: [] }).tree
			}),
		}
	}

	if (token === OPEN_BRACKET) {
		const { tokens, closeIndex } = subTree(findCloseBracketIndex, list, index + 1)
		if (closeIndex === -1)
			return {
				isArg,
				skip: list.length,
				tree: tree.concat(error.noClosingBracket)
			}
		return {
			isArg,
			skip: index + 1 + closeIndex,
			tree: tree.concat(tokens.reduce(toArg, { tree: [] }).tree)
		}
	}

	if (isArg && typeof token === 'string' && token.includes(HASH))
		return {
			isArg,
			tree: tree.concat(token.split(HASH).reduce(
				(acc, part, index) => index % 2 === 1 ? acc.concat({ value: true }, part) : acc.concat(part), []
			).filter(empty))
		}

	return { isArg, tree: tree.concat(token) }
}

const pipe = fn => (tokens, part) => tokens.concat(fn(part))

const haicu = message => extractEscaped(message)
	.reduce(pipe(extractTag), [])
	.reduce(pipe(extractBracket), [])
	.reduce(toAST, { tree: [] }).tree

export default haicu
