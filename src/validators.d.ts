import type { MessageAST, MessageArg, MessageTag } from './types.ts'

export declare function isMessageAST(arg: unknown): arg is MessageAST

export declare function isMessageArg(arg: unknown): arg is MessageArg

export declare function isMessageTag(arg: unknown): arg is MessageTag

/**
 * Find the first error string in a message AST, if any.
 */
export declare function findError(ast: MessageAST): string | undefined
