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

export const endOfSubTreeIndex = (isOpen, isClose) => tokens => {
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

const findCloseBracketIndex = endOfSubTreeIndex(
	token => token === OPEN_BRACKET,
	token => token === CLOSE_BRACKET
)

const findCloseTagIndex = (tag) => endOfSubTreeIndex(
	token => token.openTag === tag,
	token => token.closeTag === tag
)

const argReducer = (tree, token, index, list) => {
	const parts = token.split(',')
	const [first, second] = parts.map(x => x.trim())
	const third = parts[2]

	const num = +first
	const arg = { arg: isNaN(num) ? first : num }

	if (!second)
		return tree.concat(arg)
	arg.type = second

	if (second === 'plural') {
		let firstKey = third.trim()
		const offsetMatch = /offset:(\d+)/.exec(third)
		if (offsetMatch) {
			const offset = +offsetMatch[1]
			arg.offset = offset
			firstKey = firstKey.slice(`offset:${offset}`.length).trim()
		}
		const firstSubTree = list.slice(index + 2)
		const closeIndex = findCloseBracketIndex(firstSubTree)
	    const firstSubTreeTokens = firstSubTree.slice(0, closeIndex)
		const firstCase = {
			key: firstKey,
			ast: firstSubTreeTokens.reduce(treeReducer, { tree: [] }).tree
		}
		arg.cases = [firstCase]
		return tree.concat(arg)
	}

	if (!third)
		return tree.concat(arg)
}

const subTree = (tree, index, list, findCloseIndex, growSubTree) => {
	const closeIndex = findCloseIndex(list.slice(index + 1))
	const subTreeTokens = list.slice(index + 1, index + closeIndex + 1)
	return {
		skip: index + closeIndex + 1,
		tree: tree.concat(growSubTree(subTreeTokens))
	}
}

const treeReducer = ({ skip, tree }, token, index, list) => {
	if (skip)
		return { tree, skip: skip === index ? undefined : skip }

	if (token.escaped)
		return { tree: tree.concat(token.escaped) }

	if (token.openTag) {
		const tag = token.openTag
		return subTree(tree, index, list, findCloseTagIndex(tag),
			subTreeTokens => ({
				tag,
				ast: subTreeTokens
					.reduce(treeReducer, { tree: [] })
					.tree
			})
		)
	}

	if (token === OPEN_BRACKET)
		return subTree(tree, index, list, findCloseBracketIndex,
			subTreeTokens => subTreeTokens.reduce(argReducer, [])
		)

	return { tree: tree.concat(token) }
}

const pipe = fn => (tokens, part) => tokens.concat(fn(part))

const haicu = message => extractEscaped(message)
	.reduce(pipe(extractTag), [])
	.reduce(pipe(extractBracket), [])
	.reduce(treeReducer, { tree: [] }).tree

export default haicu
