import { ShamePattern } from "../types";

export const cssRules: ShamePattern[] = [
	{
		id: "css-important",
		pattern: /!important\b/,
		severity: 3,
		category: "style",
		messageKey: "shame.css.important",
		hintKey: "hint.css.important",
	},
	{
		id: "css-universal-wildcard",
		pattern: /\*\s*\{/,
		severity: 2,
		category: "performance",
		messageKey: "shame.css.universalWildcard",
		hintKey: "hint.css.universalWildcard",
	},
	{
		id: "css-z-index-max",
		pattern: /z-index\s*:\s*9999\b/,
		severity: 2,
		category: "style",
		messageKey: "shame.css.zIndexMax",
		hintKey: "hint.css.zIndexMax",
	},
	{
		id: "css-outline-none",
		pattern: /outline\s*:\s*none\b/,
		severity: 3,
		category: "reliability",
		messageKey: "shame.css.outlineNone",
		hintKey: "hint.css.outlineNone",
	},
	{
		id: "css-zero-px",
		pattern: /\b0px\b/,
		severity: 1,
		category: "style",
		messageKey: "shame.css.zeroPx",
		hintKey: "hint.css.zeroPx",
	},
	{
		id: "css-id-overuse",
		pattern: /#[a-zA-Z][\w-]*\s*\{/,
		severity: 2,
		category: "style",
		messageKey: "shame.css.idSelector",
		hintKey: "hint.css.idSelector",
	},
];
