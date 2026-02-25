const isPositiveInteger = arg =>
	Number.isInteger(arg) && arg >= 0

const isNonEmptyString = arg =>
	typeof arg === 'string' && arg.length

const isObject = arg =>
	arg && typeof arg === 'object' && !Array.isArray(arg)

const isPlaceholder = node =>
	isObject(node) && Object.keys(node).length === 1 && node.value === true

const isPluralMessageNode = node =>
	isPlaceholder(node) || isMessageNode(node)

const isPluralCase = arg => {
	if (!isObject(arg))
		return false
	const { key, ast } = arg
	if ([ 'zero', 'one', 'two', 'few', 'many', 'other' ].includes(key) || isPositiveInteger(key))
		return ast.every(isPluralMessageNode)
}

export const isMessageArg = node => {
	if (!isObject(node))
		return false
	const { arg, type, offset, style, cases } = node
	// Check that arg is a NonEmptyString or a PositiveInteger
	if (!isNonEmptyString(arg) && !isPositiveInteger(arg))
		return false
	// NoneArg
	if (Object.keys(node).length === 1)
		return true
	// If it is a MessageArg other than NoneArg, it must have a type.
	if (!isNonEmptyString(type))
		return false
	// PluralArg
	if (type === 'plural')
		if (offset !== undefined && !isPositiveInteger(offset))
			return false
	if (type === 'plural' || type === 'selectordinal')
		return Array.isArray(cases) && cases.length && cases.every(isPluralCase)
	// SimpleArg
	if (Object.keys(node).length === 2)
		return true
	if (style !== undefined)
		return isNonEmptyString(style)
}

export const isMessageTag = node =>
	isObject(node) && isNonEmptyString(node.tag) && isMessageAST(node.ast)

const isMessageNode = node => [
	isNonEmptyString,
	isMessageTag,
	isMessageArg
].some(isValid => isValid(node))

export const isMessageAST = arg =>
	Array.isArray(arg) && arg.length && arg.every(isMessageNode)
