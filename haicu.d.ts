export type ICUMessageToken = string | {
	type: 'arg';
	arg: string;
}

declare module 'haicu' {
	export default function haicu(message: string): ICUMessageToken[];
}
