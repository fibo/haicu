import type { MessageAST, MessageArg, MessageTag } from './types.ts'

export declare function isMessageAST(arg: unknown): arg is MessageAST

export declare function isMessageArg(arg: unknown): arg is MessageArg

export declare function isMessageTag(arg: unknown): arg is MessageTag
