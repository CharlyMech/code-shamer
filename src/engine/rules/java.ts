import { ShamePattern } from "../types";

export const javaRules: ShamePattern[] = [
	{
		id: "java-sysout",
		pattern: /System\.out\.print(ln)?\s*\(/,
		severity: 2,
		category: "debug",
		messageKey: "shame.java.sysout",
	},
	{
		id: "java-syserr",
		pattern: /System\.err\.print(ln)?\s*\(/,
		severity: 1,
		category: "debug",
		messageKey: "shame.java.syserr",
	},
	{
		id: "java-empty-catch",
		pattern: /catch\s*\([^)]*\)\s*\{\s*\}/,
		severity: 4,
		category: "reliability",
		messageKey: "shame.java.emptyCatch",
	},
	{
		id: "java-system-exit",
		pattern: /System\.exit\s*\(/,
		severity: 4,
		category: "reliability",
		messageKey: "shame.java.systemExit",
	},
	{
		id: "java-raw-type",
		pattern: /\b(ArrayList|HashMap|HashSet|LinkedList|List|Map|Set)\s*[^<\w]/,
		severity: 2,
		category: "style",
		messageKey: "shame.java.rawType",
	},
	{
		id: "java-string-concat-loop",
		pattern: /\+=\s*"[^"]*"\s*\+|"\s*\+\s*\w+\s*\+\s*"/,
		severity: 2,
		category: "performance",
		messageKey: "shame.java.stringConcatLoop",
	},
	{
		id: "java-thread-sleep",
		pattern: /Thread\.sleep\s*\(/,
		severity: 2,
		category: "performance",
		messageKey: "shame.java.threadSleep",
	},
	{
		id: "java-suppress-warnings",
		pattern: /@SuppressWarnings/,
		severity: 2,
		category: "maintenance",
		messageKey: "shame.java.suppressWarnings",
	},
	{
		id: "java-catch-throwable",
		pattern: /catch\s*\(\s*Throwable\b/,
		severity: 3,
		category: "reliability",
		messageKey: "shame.java.catchThrowable",
	},
];
