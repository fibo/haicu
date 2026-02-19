type NoneArg = {
	arg: string | number
}

type SimpleArg = NoneArg & {
	type: string
	style?: string
}

type PluralCase = {
	/**
	 * @remarks When key is a numbers it represents an explit value like '=1'
	 */
	key: number | 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'
	ast: HaicuNode[]
}

type PluralFormat = {
	offset?: number
	cases: PluralCase[]
}

type PluralArg = NoneArg & {
	plural: PluralFormat
}

type Arg = NoneArg | SimpleArg | PluralFormat

/**
 * A child of an ICU Abstract Syntax Tree.
 */
export type HaicuNode =
	| string
	| Arg
	| {
		tag: string
		ast: HaicuNode[]
	}

declare module 'haicu' {
	export default function haicu(message: string): HaicuNode[]
}
