import type { MessageAST } from './types.ts'

export * from './types.ts'

declare module 'haicu' {
	export default function haicu(message: string): MessageAST
}
