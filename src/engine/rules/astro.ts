import { ShamePattern } from "../types";

export const astroRules: ShamePattern[] = [
	{
		id: "astro-set-html",
		pattern: /set:html\s*=/,
		severity: 5,
		category: "security",
		messageKey: "shame.astro.setHtml",
		hintKey: "hint.astro.setHtml",
	},
	{
		id: "astro-client-load",
		pattern: /client:(load|visible|idle|media)\s*=/,
		severity: 2,
		category: "performance",
		messageKey: "shame.astro.clientDirective",
		hintKey: "hint.astro.clientDirective",
	},
];
