const OPEN_BRACKET = '{'
const CLOSE_BRACKET = '}'
const OPEN_TAG = '<'
const CLOSE_TAG = '>'
const SLASH = '/'
const HASH = '#'
const ESCAPE = "'"

const empty = x => !!x

const error = {
	bracket: { error: 'No closing bracket' },
	format: { error: 'Expected format' },
	other: { error: 'Missing case other' },
	tag: { error: 'No closing tag' },
	type: { error: 'Expected type' },
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

const extractEscaped = extract(ESCAPE,
	`${ESCAPE}(?:` +
		`(?<arg>\\${OPEN_BRACKET}[^${CLOSE_BRACKET}${ESCAPE}]*\\${CLOSE_BRACKET})` +
		`|(?<quote>${ESCAPE})` +
		`|(?<hash>${HASH})` +
		`|(?<tag>${OPEN_TAG}${SLASH}?[^${CLOSE_TAG}]+${SLASH}?${CLOSE_TAG}?)` +
	')',
({ quote, arg, hash, tag }) => {
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
	OPEN_TAG +
	`(?<closing>${SLASH})?` +
	`(?<tag>[^${CLOSE_TAG}${SLASH}]+)` +
	`(?<autoClosed>${SLASH})?` +
	CLOSE_TAG,
({ tag, autoClosed, closing }) => {
	if (!tag)
		return
	if (closing)
		return { closeTag: tag }
	if (autoClosed)
		return { autoClosedTag: tag }
	return { openTag: tag }
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

	const parts = token.split(',').map(x => x.trim())
	const numParts = parts.length

	const num = +parts[0]
	const arg = { arg: isNaN(num) ? parts[0] : num }

	if (numParts === 1)
		return { done: true, tree: tree.concat(arg) }

	const type = parts[1]

	if (type === '' && numParts >= 2)
		return { done: true, tree: tree.concat({ ...arg, ...error.type }) }

	arg.type = type

	if (numParts === 2)
		return { done: true, tree: tree.concat(arg) }

	let info = parts[2]
	const isPlural = type === 'plural'
	const isSelectordinal = type === 'selectordinal'
	let hasOtherCase = false

	if (numParts === 3 && !isPlural && !isSelectordinal && type !== 'select') {
		if (info === '')
			return { done: true, tree: tree.concat({ ...arg, ...error.format }) }
		return { done: true, tree: tree.concat({ ...arg, format: info }) }
	}

	if (isPlural) {
		const offsetMatch = /offset:(\d+)/.exec(info)
		if (offsetMatch) {
			const offset = +offsetMatch[1]
			arg.offset = offset
			info = info.slice(`offset:${offset}`.length).trim()
		}
	}

	arg.cases = [info, ...list.slice(index + 1)].reduce(({ cases, skip }, part, index, array) => {
		if (skip)
			return { cases, skip: skip === index ? undefined : skip }

		let key = part.trim()

		if (isPlural || isSelectordinal) {
			const explicitValueMatch = /=(\d+)/.exec(key)
			if (explicitValueMatch)
				key = +explicitValueMatch[1]
		}

		if (key === '' || key === OPEN_BRACKET || key === CLOSE_BRACKET)
			return { cases }

		if (key === 'other')
			hasOtherCase = true

		const openBracketIndex = array.slice(index).findIndex(token => token === OPEN_BRACKET)
		const rest = array.slice(openBracketIndex + 1)
		const closeBracketIndex = findCloseBracketIndex(rest)

		if (closeBracketIndex === -1)
			return error.bracket

		const astTokens = array.slice(index + openBracketIndex + 1).slice(0, closeBracketIndex)
		return {
			skip: index + openBracketIndex + closeBracketIndex,
			cases: cases.concat({
				key,
				ast: astTokens.reduce(toAST, { isArg: true, tree: [] }).tree
			})
		}
	}, { cases: [] }).cases

	if (!hasOtherCase)
		arg.cases.push(error.other)

	return { done: true, tree: tree.concat(arg) }
}

const toAST = ({ isArg, skip, tree }, token, index, list) => {
	if (skip)
		return { tree, skip: skip === index ? undefined : skip }

	if (token.escaped)
		return { isArg, tree: tree.concat(token.escaped) }

	if (token.autoClosedTag)
		return {
			isArg,
			tree: tree.concat({ tag: token.autoClosedTag, ast: [] })
		}

	if (token.openTag) {
		const tag = token.openTag
		const { tokens, closeIndex } = subTree(findCloseTagIndex(tag), list, index + 1)
		if (closeIndex === -1)
			return { isArg, tree: tree.concat(error.tag) }
		return {
			isArg,
			skip: index + closeIndex + 1,
			tree: tree.concat({
				tag,
				ast: tokens.reduce(toAST, { tree: [] }).tree
			})
		}
	}

	if (token === OPEN_BRACKET) {
		const { tokens, closeIndex } = subTree(findCloseBracketIndex, list, index + 1)
		if (closeIndex === -1)
			return { isArg, tree: tree.concat(error.bracket) }
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
