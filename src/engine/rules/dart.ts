import { ShamePattern } from "../types";

export const dartRules: ShamePattern[] = [
	{
		id: "dart-print",
		pattern: /\bprint\s*\(/,
		severity: 2,
		category: "debug",
		messageKey: "shame.dart.print",
	},
	{
		id: "dart-dynamic",
		pattern: /\bdynamic\s+\w/,
		severity: 3,
		category: "reliability",
		messageKey: "shame.dart.dynamic",
	},
	{
		id: "dart-force-unwrap",
		pattern: /\w+!\./,
		severity: 3,
		category: "reliability",
		messageKey: "shame.dart.forceUnwrap",
	},
	{
		id: "dart-debugprint",
		pattern: /\bdebugPrint\s*\(/,
		severity: 2,
		category: "debug",
		messageKey: "shame.dart.debugPrint",
	},
	{
		id: "dart-empty-catch",
		pattern: /catch\s*\([^)]*\)\s*\{\s*\}/,
		severity: 4,
		category: "reliability",
		messageKey: "shame.dart.emptyCatch",
	},
	{
		id: "dart-runtimetype",
		pattern: /\.runtimeType\b/,
		severity: 2,
		category: "style",
		messageKey: "shame.dart.runtimeType",
	},
];
