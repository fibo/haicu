const OPEN = '{'
const CLOSE = '}'

export const extractText = message => message.matchAll(RegExp(
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
