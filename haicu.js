const OPEN_BRACKET = '{'
const CLOSE_BRACKET = '}'
const OPEN_TAG = '<'
const CLOSE_TAG = '>'
const CLOSING_TAG = '/'
const ESCAPE = "'"

const extract = (startSymbol, matcher, resolver) => arg =>
	typeof arg !== 'string' ? arg : arg.matchAll(RegExp(
	`(?<before>[^${startSymbol}]*)` +
	`(:?${matcher}` +
	`(?<after>[^${startSymbol}]*)` +
	'){0,1}',
'g')).reduce((tokens, { groups: { before, after, ...rest } = {} }) =>
	tokens.concat(
		[before, resolver(rest), after]
		.filter(x => !!x)
	)
, [])

export const extractEscaped = extract(
	ESCAPE,
	`${ESCAPE}(?:` +
		`(?<escapedPart>\\${OPEN_BRACKET}[^${CLOSE_BRACKET}${ESCAPE}]*\\${CLOSE_BRACKET})${ESCAPE}` +
		`|(?<doubleQuote>${ESCAPE})` +
	')',
	({ escapedPart, doubleQuote }) => {
		if (escapedPart)
			return { type: 'text', text: escapedPart }
		if (doubleQuote)
			return ESCAPE
	}
)

export const extractArg = extract(
	OPEN_BRACKET,
	`\\${OPEN_BRACKET}(?<messageArg>[^${CLOSE_BRACKET}]*)\\${CLOSE_BRACKET}`,
	({ messageArg }) =>
		messageArg && { type: 'arg', arg: messageArg }
)

export const extractTag = extract(
	OPEN_TAG,
	`${OPEN_TAG}(?<isClosing>${CLOSING_TAG})?(?<tag>[^${CLOSE_TAG}]+)${CLOSE_TAG}`,
	({ tag, isClosing }) =>
		tag && { type: isClosing ? 'closeTag' : 'openTag', tag }
)

export const lexer = arg => extractEscaped(arg)
	.reduce((tokens, result) => tokens.concat(
		extractTag(result)
	), [])
	.reduce((tokens, result) => tokens.concat(
		extractArg(result)
	), [])
	.reduce((tokens, result) => tokens.concat(
		typeof result === 'string' ? ({ type: 'text', text: result }) : result
	), [])

export default function haicu(message) {
	const tokens = extractArg(message)
	return tokens
}
