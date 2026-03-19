import { ShamePattern } from "../types";

export const cssRules: ShamePattern[] = [
	{
		id: "css-important",
		pattern: /!important\b/,
		severity: 3,
		category: "style",
		messageKey: "shame.css.important",
	},
	{
		id: "css-universal-wildcard",
		pattern: /\*\s*\{/,
		severity: 2,
		category: "performance",
		messageKey: "shame.css.universalWildcard",
	},
];
