import { ShamePattern } from "../types";

export const cRules: ShamePattern[] = [
	{
		id: "c-printf",
		pattern: /\bprintf\s*\(/,
		severity: 2,
		category: "debug",
		messageKey: "shame.c.printf",
	},
	{
		id: "c-goto",
		pattern: /\bgoto\s+\w/,
		severity: 5,
		category: "style",
		messageKey: "shame.c.goto",
	},
	{
		id: "c-gets",
		pattern: /\bgets\s*\(/,
		severity: 5,
		category: "security",
		messageKey: "shame.c.gets",
	},
	{
		id: "c-malloc",
		pattern: /\bmalloc\s*\(/,
		severity: 3,
		category: "reliability",
		messageKey: "shame.c.malloc",
	},
	{
		id: "c-sprintf",
		pattern: /\bsprintf\s*\(/,
		severity: 4,
		category: "security",
		messageKey: "shame.c.sprintf",
	},
	{
		id: "c-strcpy",
		pattern: /\bstrcpy\s*\(/,
		severity: 4,
		category: "security",
		messageKey: "shame.c.strcpy",
	},
	{
		id: "c-strcat",
		pattern: /\bstrcat\s*\(/,
		severity: 4,
		category: "security",
		messageKey: "shame.c.strcat",
	},
	{
		id: "c-void-pointer",
		pattern: /void\s*\*/,
		severity: 2,
		category: "reliability",
		messageKey: "shame.c.voidPointer",
	},
];
