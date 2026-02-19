export type HaicuNode =
	| string
	| { type: 'arg'; arg: string }
	| { type: 'openTag'; tag: string }
	| { type: 'closeTag'; tag: string }
	| { type: '{' }
	| { type: '}' }

declare module 'haicu' {
	export default function haicu(message: string): HaicuNode[]
}
