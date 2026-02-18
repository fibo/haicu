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
		`(?<content>[^${OPEN_BRACKET}${CLOSE_BRACKET}]*)` +
	`(?<hasClose>\\${CLOSE_BRACKET})?`,
({ hasOpen, content, hasClose }) => {
	const result = []
	if (hasOpen)
		result.push({ type: 'openBracket' })
	if (content) {
		if (hasClose)
			result.push({ type: 'arg', arg: content })
		else
			result.push(content)
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
