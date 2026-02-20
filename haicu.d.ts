export type NoneArg = {
	arg: string | number
}

export type SimpleArg = NoneArg & {
	type: string
	style?: string
}

export type PluralCase = {
	/**
	 * Plural category or explicit value
	 *
	 * @remarks When key is a number it represents an explicit value like '=1'
	 */
	key: number | 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'
	ast: MessageNode[]
}

export type PluralFormat = {
	offset?: number
	cases: PluralCase[]
}

export type PluralArg = NoneArg & {
	plural: PluralFormat
}

export type MessageArg = NoneArg | SimpleArg | PluralFormat

export type MessageNode =
	| string
	| MessageArg
	| {
		tag: string
		ast: MessageNode[]
	}

/**
 * Abstract Syntax Tree of an ICU Message
 */
export type MessageAST = MessageNode[]

declare module 'haicu' {
	export default function haicu(message: string): MessageAST
}
