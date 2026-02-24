export type NoneArg = {
	arg: string | number
}

export type SimpleArg = NoneArg & {
	type: string
	style?: string
}

/**
 * A placeholder is identified by a hash character (#).
 */
export type PlaceHolder = {
	value: true
}

export type PluralMessageNode = MessageNode | Placeholder

export type PluralCase = {
	/**
	 * Plural category or explicit value
	 *
	 * @remarks When key is a number it represents an explicit value like '=1'
	 */
	key: number | 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'
	ast: PluralMessageNode[]
}

export type PluralFormat = {
}

export type PluralArg = NoneArg & {
	type: 'plural'
	offset?: number
	cases: PluralCase[]
}

export type SelectordinalArg = NoneArg & {
	type: 'selectordinal'
	cases: PluralCase[]
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
