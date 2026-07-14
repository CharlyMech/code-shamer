import { ShamePattern } from "../types";

export const svelteRules: ShamePattern[] = [
	{
		id: "svelte-html-injection",
		pattern: /\{@html\s+/,
		severity: 5,
		category: "security",
		messageKey: "shame.svelte.htmlInjection",
		hintKey: "hint.svelte.htmlInjection",
	},
	{
		id: "svelte-reactive-overuse",
		pattern: /^\s*\$:\s+/m,
		severity: 2,
		category: "style",
		messageKey: "shame.svelte.reactiveStatement",
		hintKey: "hint.svelte.reactiveStatement",
	},
];
