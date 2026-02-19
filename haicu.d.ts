export type HaicuNode =
	| string
	| {
		tag: string
		children: HaicuNode[]
	}
	| { type: 'arg'; arg: string }
	| { type: '{' }
	| { type: '}' }

declare module 'haicu' {
	export default function haicu(message: string): HaicuNode[]
}
