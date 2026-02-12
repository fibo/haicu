const OPEN = '{'
const CLOSE = '}'
const ESCAPE = "'"

export const extractEscaped = arg => arg.matchAll(RegExp(
	`(?<textBefore>[^${ESCAPE}${OPEN}]*)` +
	'(:?' +
	`${ESCAPE}(?<escapedPart>\\${OPEN}[^${CLOSE}${ESCAPE}]*\\${CLOSE})${ESCAPE}` +
	`(?<textAfter>[^${CLOSE}${ESCAPE}]*)` +
	'){0,1}',
'g'))
	.map(match => match.groups ?? {})
	.reduce((accumulator, { textBefore, escapedPart, textAfter }) => {
		const tokens = []

		if (textBefore)
			tokens.push(textBefore)
		if (escapedPart)
			tokens.push({ type: 'text', text: escapedPart })
		if (textAfter)
			tokens.push(textAfter)

		return accumulator.concat(tokens)
	}, [])

export const extractText = arg => arg.matchAll(RegExp(
	`(?<textBefore>[^${OPEN}]*)` +
	'(:?' +
	`(?<messageArg>\\${OPEN}[^${CLOSE}]*\\${CLOSE})` +
	`(?<textAfter>[^${CLOSE}]*)` +
	'){0,1}',
'g'))
	.map(match => match.groups ?? {})
	.reduce((accumulator, { textBefore, messageArg, textAfter }) => {
		const tokens = []

		if (textBefore)
			tokens.push({ type: 'text', text: textBefore })
		if (messageArg)
			tokens.push(messageArg)
		if (textAfter)
			tokens.push({ type: 'text', text: textAfter })

		return accumulator.concat(tokens)
	}, [])

export default function haicu(message) {
	const tokens = extractText(message)
	return tokens
}
