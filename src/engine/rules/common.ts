import { ShamePattern } from "../types";

export const commonRules: ShamePattern[] = [
	{
		id: "common-todo",
		pattern: /\bTODO\b/i,
		severity: 1,
		category: "maintenance",
		messageKey: "shame.common.todo",
	},
	{
		id: "common-fixme",
		pattern: /\bFIXME\b/i,
		severity: 1,
		category: "maintenance",
		messageKey: "shame.common.fixme",
	},
	{
		id: "common-hack",
		pattern: /\bHACK\b/i,
		severity: 2,
		category: "maintenance",
		messageKey: "shame.common.hack",
	},
	{
		id: "common-xxx",
		pattern: /\bXXX\b/,
		severity: 1,
		category: "maintenance",
		messageKey: "shame.common.xxx",
	},
];
