import { ShamePattern } from "../types";

export const vueRules: ShamePattern[] = [
	{
		id: "vue-v-html",
		pattern: /v-html\s*=/,
		severity: 5,
		category: "security",
		messageKey: "shame.vue.vHtml",
		hintKey: "hint.vue.vHtml",
	},
	{
		id: "vue-v-for-no-key",
		pattern: /v-for\s*=[^>]+>(?![\s\S]*?:key\s*=)/,
		severity: 3,
		category: "reliability",
		messageKey: "shame.vue.vForNoKey",
		hintKey: "hint.vue.vForNoKey",
		multiline: true,
	},
	{
		id: "vue-options-data-object",
		pattern: /\bdata\s*\(\s*\)\s*\{[^}]*return\s*\{/,
		severity: 2,
		category: "style",
		messageKey: "shame.vue.optionsData",
		hintKey: "hint.vue.optionsData",
		multiline: true,
	},
];
