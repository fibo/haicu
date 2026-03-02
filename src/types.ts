/**
 * Any string, excluding ''.
 */
export type NonEmptyString = string

/**
 * Positive integers, including 0.
 */
export type PositiveInteger = number

/**
 * Plain argument, can be a string with the argument name or a number with argument position.
 */
export type NoneArg = {
	arg: NonEmptyString | PositiveInteger
}

/**
 * An argument with a type and optional format.
 *
 * @example
 * { arg: 'day', type: 'date', format: 'YYYY-MM-DD' }
 */
export type SimpleArg = NoneArg & {
	type: NonEmptyString
	format?: NonEmptyString
}

/**
 * A placeholder is identified by a hash character (#).
 */
export type Placeholder = {
	value: true
}

export type NumericCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

/**
 * Used by plural and selectordinal cases.
 */
export type NumericCase = {
	/**
	 * Numeric category or explicit value.
	 *
	 * @remarks When key is a number it represents an explicit value like '=1'
	 */
	key: PositiveInteger | NumericCategory
	ast: Array<MessageNode | Placeholder>
}

export type PluralArg = NoneArg & {
	type: 'plural'
	offset?: number
	cases: NumericCase[]
}

export type SelectordinalArg = NoneArg & {
	type: 'selectordinal'
	cases: NumericCase[]
}

export type StringCase = {
	key: NonEmptyString
	ast: MessageNode[]
}

export type SelectArg = NoneArg & {
	type: 'select'
	cases: StringCase[]
}

export type MessageArg = NoneArg | SimpleArg | PluralArg | SelectArg | SelectordinalArg

export type MessageTag = {
	tag: NonEmptyString
	ast: MessageNode[]
}

export type MessageNode = NonEmptyString | MessageTag | MessageArg

/**
 * Abstract Syntax Tree of an ICU Message.
 */
export type MessageAST = MessageNode[]

