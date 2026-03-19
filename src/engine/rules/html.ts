import { ShamePattern } from "../types";

export const htmlRules: ShamePattern[] = [
	{
		id: "html-inline-style",
		pattern: /\bstyle=["'][^"']*["']/,
		severity: 3,
		category: "style",
		messageKey: "shame.html.inlineStyle",
		fixTemplate: "",
	},
	{
		id: "html-marquee",
		pattern: /<marquee\b/,
		severity: 4,
		category: "style",
		messageKey: "shame.html.marquee",
	},
	{
		id: "html-br-tags",
		pattern: /<br\s*\/?>\s*<br\s*\/?>/,
		severity: 2,
		category: "style",
		messageKey: "shame.html.brUsage",
	},
	{
		id: "html-center-tag",
		pattern: /<center\b/,
		severity: 3,
		category: "style",
		messageKey: "shame.html.centerTag",
	},
];
