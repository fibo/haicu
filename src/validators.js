const isPositiveInteger = arg =>
	Number.isInteger(arg) && arg >= 0

const isNonEmptyString = arg =>
	typeof arg === 'string' && arg.length

const isObject = arg =>
	arg && typeof arg === 'object' && !Array.isArray(arg)

const isPlaceholder = node =>
	isObject(node) && Object.keys(node).length === 1 && node.value === true

const isNumericCase = arg => {
	if (!isObject(arg))
		return false
	const { key, ast } = arg
	return ([ 'zero', 'one', 'two', 'few', 'many', 'other' ].includes(key) || isPositiveInteger(key)) &&
		Array.isArray(ast) &&
		ast.every(node => isPlaceholder(node) || isMessageNode(node))
}

const isStringCase = arg => {
	if (!isObject(arg))
		return false
	const { key, ast } = arg
	return typeof key === 'string' &&
		Array.isArray(ast) &&
		ast.every(isMessageNode)
}

const hasOtherCaseKey = arg => arg.key === 'other'

export const findError = list => {
	for (const node of list) {
		if (node.error)
			return node.error
		const sublist = node.ast ?? node.cases
		if (!sublist)
			continue
		const error = findError(sublist)
		if (error)
			return error
	}
}

export const isMessageArg = node => {
	if (!isObject(node))
		return false
	const { arg, type, offset, format, cases } = node
	// Check that arg is a NonEmptyString or a PositiveInteger
	if (!isNonEmptyString(arg) && !isPositiveInteger(arg))
		return false
	// NoneArg
	if (Object.keys(node).length === 1)
		return true
	// If it is a MessageArg other than NoneArg, it must have a type.
	if (!isNonEmptyString(type))
		return false
	// SelectArg
	if (type === 'select')
		return Array.isArray(cases) &&
			cases.every(isStringCase) &&
			cases.some(hasOtherCaseKey)
	// PluralArg
	if (type === 'plural')
		if (offset !== undefined && !isPositiveInteger(offset))
			return false
	// PluralArg | SelectordinalArg
	if (type === 'plural' || type === 'selectordinal')
		return Array.isArray(cases) &&
			cases.every(isNumericCase) &&
			cases.some(hasOtherCaseKey)
	// SimpleArg
	if (Object.keys(node).length === 2)
		return true
	return isNonEmptyString(format)
}

export const isMessageTag = node => {
	if (!isObject(node))
		return false
	const { tag, ast } = node
	return isNonEmptyString(tag) &&
		Array.isArray(ast) &&
		(ast.length === 0 || isMessageAST(node.ast))
}

const isMessageNode = node => [
	isNonEmptyString,
	isMessageTag,
	isMessageArg
].some(isValid => isValid(node))

export const isMessageAST = arg =>
	Array.isArray(arg) &&
	arg.length &&
	arg.every(isMessageNode)
