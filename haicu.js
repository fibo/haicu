const OPEN_BRACKET = '{'
const CLOSE_BRACKET = '}'
const OPEN_TAG = '<'
const CLOSE_TAG = '>'
const CLOSING_TAG = '/'
const ESCAPE = "'"

export const extractEscaped = arg => arg.matchAll(RegExp(
	`(?<before>[^${ESCAPE}]*)` +
	'(:?' +
	`${ESCAPE}(?:` +
		`(?<escapedPart>\\${OPEN_BRACKET}[^${CLOSE_BRACKET}${ESCAPE}]*\\${CLOSE_BRACKET})${ESCAPE}` +
		`|(?<doubleQuote>${ESCAPE})` +
	`)` +
	`(?<after>[^${ESCAPE}]*)` +
	'){0,1}',
'g'))
	.reduce((tokens, { groups = {} }) => {
		const { before, escapedPart, doubleQuote, after } = groups
		if (before)
			tokens.push(before)
		if (escapedPart)
			tokens.push({ type: 'text', text: escapedPart })
		else if (doubleQuote)
			tokens.push(ESCAPE)
		if (after)
			tokens.push(after)
		return tokens
	}, [])

export const extractArg = arg => arg.matchAll(RegExp(
	`(?<before>[^${OPEN_BRACKET}]*)` +
	'(:?' +
	`\\${OPEN_BRACKET}(?<messageArg>[^${CLOSE_BRACKET}]*)\\${CLOSE_BRACKET}` +
	`(?<after>[^${OPEN_BRACKET}]*)` +
	'){0,1}',
'g'))
	.reduce((tokens, { groups = {} }) => {
		const { before, messageArg, after } = groups
		if (before)
			tokens.push(before)
		if (messageArg)
			tokens.push({ type: 'arg', arg: messageArg })
		if (after)
			tokens.push(after)
		return tokens
	}, [])

export const extractTag = arg => arg.matchAll(RegExp(
	`(?<before>[^${OPEN_TAG}]*)` +
	'(:?' +
	`${OPEN_TAG}(?<isClosing>${CLOSING_TAG})?(?<tag>[^${CLOSE_TAG}]+)${CLOSE_TAG}` +
	`(?<after>[^${OPEN_TAG}]*)` +
	'){0,1}',
'g'))
	.reduce((tokens, { groups = {} }) => {
		const { before, isClosing, tag, after } = groups
		if (before)
			tokens.push(before)
		if (tag)
			tokens.push({ type: isClosing ? 'closeTag' : 'openTag', tag })
		if (after)
			tokens.push(after)
		return tokens
	}, [])

export const lexer = arg => extractEscaped(arg)
	.reduce((tokens, result) => tokens.concat(
		typeof result === 'string' ? extractTag(result) : result
	), [])
	.reduce((tokens, result) => tokens.concat(
		typeof result === 'string' ? extractArg(result) : result
	), [])
	.reduce((tokens, result) => tokens.concat(
		typeof result === 'string' ? ({ type: 'text', text: result }) : result
	), [])

export default function haicu(message) {
	const tokens = extractArg(message)
	return tokens
}
