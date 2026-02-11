export const extractArgs = (message) => {
	return [message]
}

export default function haicu(message) {
	const tokens = extractArgs(message)
	return tokens
}
