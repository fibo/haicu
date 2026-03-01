type NonEmptyString = string

/**
 * Positive integers including zero.
 */
type PositiveInteger = number

export type NoneArg = {
	arg: NonEmptyString | PositiveInteger
}

export type SimpleArg = NoneArg & {
	type: NonEmptyString
	style?: NonEmptyString
}

/**
 * A placeholder is identified by a hash character (#).
 */
export type Placeholder = {
	value: true
}

export type PluralMessageNode = MessageNode | Placeholder

export type PluralCase = {
	/**
	 * Plural category or explicit value.
	 *
	 * @remarks When key is a number it represents an explicit value like '=1'
	 */
	key: PositiveInteger | 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'
	ast: PluralMessageNode[]
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

export type MessageArg = NoneArg | SimpleArg | PluralArg | SelectordinalArg

export type MessageTag = {
	tag: NonEmptyString
	ast: MessageNode[]
}

export type MessageNode = NonEmptyString | MessageTag | MessageArg

/**
 * Abstract Syntax Tree of an ICU Message.
 */
export type MessageAST = MessageNode[]

