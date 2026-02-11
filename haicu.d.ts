export type MessageToken = string | {
	type: 'arg'
	arg: string
}

declare module 'haicu' {
	export default function haicu(message: string): MessageToken[]
}
