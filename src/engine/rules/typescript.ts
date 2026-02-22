import { ShamePattern } from "../types";

export const typescriptRules: ShamePattern[] = [
	{
		id: "ts-any-type",
		pattern: /:\s*any\b/,
		severity: 2,
		category: "reliability",
		messageKey: "shame.ts.anyType",
	},
	{
		id: "ts-as-any",
		pattern: /\bas\s+any\b/,
		severity: 3,
		category: "reliability",
		messageKey: "shame.ts.asAny",
	},
	{
		id: "ts-ignore",
		pattern: /@ts-ignore/,
		severity: 2,
		category: "maintenance",
		messageKey: "shame.ts.tsIgnore",
	},
	{
		id: "ts-nocheck",
		pattern: /@ts-nocheck/,
		severity: 4,
		category: "maintenance",
		messageKey: "shame.ts.tsNocheck",
	},
	{
		id: "ts-non-null-assertion",
		pattern: /\w+!\./,
		severity: 1,
		category: "reliability",
		messageKey: "shame.ts.nonNullAssertion",
	},
	{
		id: "ts-expect-error-no-reason",
		pattern: /@ts-expect-error$/,
		severity: 2,
		category: "maintenance",
		messageKey: "shame.ts.expectErrorNoReason",
	},
];
