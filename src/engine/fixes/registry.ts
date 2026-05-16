import { FixRegistryEntry } from "./types";

const entries: FixRegistryEntry[] = [
	{
		ruleId: "js-var-usage",
		safety: "safe",
		kind: "replace",
		titleKey: "fix.js.varUsage.title",
		transform: (line) => {
			if (!/\bvar\b/.test(line)) {
				return null;
			}
			return line.replace(/\bvar\b/, "let");
		},
	},
	{
		ruleId: "js-loose-equality",
		safety: "safe",
		kind: "replace",
		titleKey: "fix.js.looseEquality.title",
		transform: (line) => {
			if (!/[^!=]==[^=]/.test(line)) {
				return null;
			}
			return line.replace(/([^!=])==([^=])/g, "$1===$2");
		},
	},
	{
		ruleId: "js-loose-inequality",
		safety: "safe",
		kind: "replace",
		titleKey: "fix.js.looseInequality.title",
		transform: (line) => {
			if (!/!=[^=]/.test(line)) {
				return null;
			}
			return line.replace(/!=([^=])/g, "!==$1");
		},
	},
	{
		ruleId: "js-debugger",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.js.debugger.title",
		transform: () => "",
	},
	{
		ruleId: "js-console-log",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.js.consoleLog.title",
		transform: () => "",
	},
	{
		ruleId: "js-alert",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.js.alert.title",
		transform: () => "",
	},
	{
		ruleId: "js-eval",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.js.eval.title",
		hintKey: "hint.js.eval",
	},
	{
		ruleId: "js-empty-catch",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.js.emptyCatch.title",
		hintKey: "hint.js.emptyCatch",
	},
	{
		ruleId: "js-nested-ternary",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.js.nestedTernary.title",
		hintKey: "hint.js.nestedTernary",
	},
	{
		ruleId: "js-new-function",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.js.newFunction.title",
		hintKey: "hint.js.newFunction",
	},
	{
		ruleId: "js-document-write",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.js.documentWrite.title",
		hintKey: "hint.js.documentWrite",
	},
	{
		ruleId: "js-settimeout-string",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.js.setTimeoutString.title",
		hintKey: "hint.js.setTimeoutString",
	},
	{
		ruleId: "js-let-array-push",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.js.letArrayPush.title",
		hintKey: "hint.js.letArrayPush",
	},
	{
		ruleId: "js-switch-no-break",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.js.switchNoBreak.title",
		hintKey: "hint.js.switchNoBreak",
	},

	{
		ruleId: "ts-ignore",
		safety: "safe",
		kind: "replace",
		titleKey: "fix.ts.tsIgnore.title",
		transform: (line) => {
			if (!/@ts-ignore/.test(line)) {
				return null;
			}
			return line.replace(/@ts-ignore/, "@ts-expect-error");
		},
	},
	{
		ruleId: "ts-any-type",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.ts.anyType.title",
		hintKey: "hint.ts.anyType",
	},
	{
		ruleId: "ts-as-any",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.ts.asAny.title",
		hintKey: "hint.ts.asAny",
	},
	{
		ruleId: "ts-nocheck",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.ts.tsNocheck.title",
		hintKey: "hint.ts.tsNocheck",
	},
	{
		ruleId: "ts-non-null-assertion",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.ts.nonNullAssertion.title",
		hintKey: "hint.ts.nonNullAssertion",
	},
	{
		ruleId: "ts-expect-error-no-reason",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.ts.expectErrorNoReason.title",
		hintKey: "hint.ts.expectErrorNoReason",
	},

	{
		ruleId: "py-print",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.py.print.title",
		transform: () => "",
	},
	{
		ruleId: "py-bare-except",
		safety: "safe",
		kind: "replace",
		titleKey: "fix.py.bareExcept.title",
		transform: (line) => {
			if (!/\bexcept\s*:/.test(line)) {
				return null;
			}
			return line.replace(/\bexcept\s*:/, "except Exception:");
		},
	},
	{
		ruleId: "py-except-pass",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.py.exceptPass.title",
		hintKey: "hint.py.exceptPass",
	},
	{
		ruleId: "py-import-star",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.py.importStar.title",
		hintKey: "hint.py.importStar",
	},
	{
		ruleId: "py-global",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.py.global.title",
		hintKey: "hint.py.global",
	},
	{
		ruleId: "py-mutable-default",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.py.mutableDefault.title",
		hintKey: "hint.py.mutableDefault",
	},
	{
		ruleId: "py-exec",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.py.exec.title",
		hintKey: "hint.py.exec",
	},
	{
		ruleId: "py-eval",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.py.eval.title",
		hintKey: "hint.py.eval",
	},
	{
		ruleId: "py-hardcoded-password",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.py.hardcodedPassword.title",
		hintKey: "hint.py.hardcodedPassword",
	},
	{
		ruleId: "py-type-ignore",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.py.typeIgnore.title",
		hintKey: "hint.py.typeIgnore",
	},

	{
		ruleId: "java-sysout",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.java.sysout.title",
		transform: () => "",
	},
	{
		ruleId: "java-syserr",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.java.syserr.title",
		transform: () => "",
	},
	{
		ruleId: "java-empty-catch",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.java.emptyCatch.title",
		hintKey: "hint.java.emptyCatch",
	},
	{
		ruleId: "java-system-exit",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.java.systemExit.title",
		hintKey: "hint.java.systemExit",
	},
	{
		ruleId: "java-raw-type",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.java.rawType.title",
		hintKey: "hint.java.rawType",
	},
	{
		ruleId: "java-string-concat-loop",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.java.stringConcatLoop.title",
		hintKey: "hint.java.stringConcatLoop",
	},
	{
		ruleId: "java-thread-sleep",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.java.threadSleep.title",
		hintKey: "hint.java.threadSleep",
	},
	{
		ruleId: "java-suppress-warnings",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.java.suppressWarnings.title",
		hintKey: "hint.java.suppressWarnings",
	},
	{
		ruleId: "java-catch-throwable",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.java.catchThrowable.title",
		hintKey: "hint.java.catchThrowable",
	},

	{
		ruleId: "dart-print",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.dart.print.title",
		transform: () => "",
	},
	{
		ruleId: "dart-debugprint",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.dart.debugPrint.title",
		transform: () => "",
	},
	{
		ruleId: "dart-dynamic",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.dart.dynamic.title",
		hintKey: "hint.dart.dynamic",
	},
	{
		ruleId: "dart-force-unwrap",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.dart.forceUnwrap.title",
		hintKey: "hint.dart.forceUnwrap",
	},
	{
		ruleId: "dart-empty-catch",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.dart.emptyCatch.title",
		hintKey: "hint.dart.emptyCatch",
	},
	{
		ruleId: "dart-runtimetype",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.dart.runtimeType.title",
		hintKey: "hint.dart.runtimeType",
	},
	{
		ruleId: "dart-deep-nesting",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.dart.deepNesting.title",
		hintKey: "hint.dart.deepNesting",
	},

	{
		ruleId: "php-echo",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.php.echo.title",
		transform: () => "",
	},
	{
		ruleId: "php-var-dump",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.php.varDump.title",
		transform: () => "",
	},
	{
		ruleId: "php-print-r",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.php.printR.title",
		transform: () => "",
	},
	{
		ruleId: "php-eval",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.php.eval.title",
		hintKey: "hint.php.eval",
	},
	{
		ruleId: "php-mysql-deprecated",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.php.mysqlDeprecated.title",
		hintKey: "hint.php.mysqlDeprecated",
	},
	{
		ruleId: "php-variable-variables",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.php.variableVariables.title",
		hintKey: "hint.php.variableVariables",
	},
	{
		ruleId: "php-error-suppression",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.php.errorSuppression.title",
		hintKey: "hint.php.errorSuppression",
	},
	{
		ruleId: "php-extract",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.php.extract.title",
		hintKey: "hint.php.extract",
	},
	{
		ruleId: "php-die-exit",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.php.dieExit.title",
		hintKey: "hint.php.dieExit",
	},
	{
		ruleId: "php-global",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.php.global.title",
		hintKey: "hint.php.global",
	},

	{
		ruleId: "html-inline-style",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.html.inlineStyle.title",
		hintKey: "hint.html.inlineStyle",
	},
	{
		ruleId: "html-marquee",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.html.marquee.title",
		hintKey: "hint.html.marquee",
	},
	{
		ruleId: "html-br-tags",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.html.brUsage.title",
		hintKey: "hint.html.brUsage",
	},
	{
		ruleId: "html-center-tag",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.html.centerTag.title",
		hintKey: "hint.html.centerTag",
	},

	{
		ruleId: "css-important",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.css.important.title",
		hintKey: "hint.css.important",
	},
	{
		ruleId: "css-universal-wildcard",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.css.universalWildcard.title",
		hintKey: "hint.css.universalWildcard",
	},

	{
		ruleId: "c-printf",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.c.printf.title",
		transform: () => "",
	},
	{
		ruleId: "c-goto",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.c.goto.title",
		hintKey: "hint.c.goto",
	},
	{
		ruleId: "c-gets",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.c.gets.title",
		hintKey: "hint.c.gets",
	},
	{
		ruleId: "c-malloc",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.c.malloc.title",
		hintKey: "hint.c.malloc",
	},
	{
		ruleId: "c-sprintf",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.c.sprintf.title",
		hintKey: "hint.c.sprintf",
	},
	{
		ruleId: "c-strcpy",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.c.strcpy.title",
		hintKey: "hint.c.strcpy",
	},
	{
		ruleId: "c-strcat",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.c.strcat.title",
		hintKey: "hint.c.strcat",
	},
	{
		ruleId: "c-void-pointer",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.c.voidPointer.title",
		hintKey: "hint.c.voidPointer",
	},

	{
		ruleId: "cpp-printf",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.cpp.printf.title",
		transform: () => "",
	},
	{
		ruleId: "cpp-cout",
		safety: "safe",
		kind: "removeLine",
		titleKey: "fix.cpp.cout.title",
		transform: () => "",
	},
	{
		ruleId: "cpp-goto",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.cpp.goto.title",
		hintKey: "hint.cpp.goto",
	},
	{
		ruleId: "cpp-gets",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.cpp.gets.title",
		hintKey: "hint.cpp.gets",
	},
	{
		ruleId: "cpp-malloc-no-free",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.cpp.malloc.title",
		hintKey: "hint.cpp.malloc",
	},
	{
		ruleId: "cpp-raw-pointer-new",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.cpp.rawPointerNew.title",
		hintKey: "hint.cpp.rawPointerNew",
	},
	{
		ruleId: "cpp-using-namespace-std",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.cpp.usingNamespaceStd.title",
		hintKey: "hint.cpp.usingNamespaceStd",
	},
	{
		ruleId: "cpp-define-constant",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.cpp.defineConstant.title",
		hintKey: "hint.cpp.defineConstant",
	},
	{
		ruleId: "cpp-sprintf",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.cpp.sprintf.title",
		hintKey: "hint.cpp.sprintf",
	},
	{
		ruleId: "cpp-strcpy",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.cpp.strcpy.title",
		hintKey: "hint.cpp.strcpy",
	},

	{
		ruleId: "common-todo",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.common.todo.title",
		hintKey: "hint.common.todo",
	},
	{
		ruleId: "common-fixme",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.common.fixme.title",
		hintKey: "hint.common.fixme",
	},
	{
		ruleId: "common-hack",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.common.hack.title",
		hintKey: "hint.common.hack",
	},
	{
		ruleId: "common-xxx",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.common.xxx.title",
		hintKey: "hint.common.xxx",
	},
	{
		ruleId: "common-nested-loops",
		safety: "review",
		kind: "noOp",
		titleKey: "fix.common.nestedLoops.title",
		hintKey: "hint.common.nestedLoops",
	},
];

const registry: Map<string, FixRegistryEntry> = new Map(
	entries.map((entry) => [entry.ruleId, entry])
);

export function getFixEntry(ruleId: string): FixRegistryEntry | undefined {
	return registry.get(ruleId);
}

export function hasSafeFix(ruleId: string): boolean {
	const entry = registry.get(ruleId);
	return entry?.safety === "safe" && typeof entry.transform === "function";
}

export function hasAnyRecommendation(ruleId: string): boolean {
	return registry.has(ruleId);
}

export function getAllFixEntries(): FixRegistryEntry[] {
	return [...entries];
}

export function getFixedLine(
	ruleId: string,
	lineText: string,
	match: import("../types").ShameMatch
): string | null {
	const entry = registry.get(ruleId);
	if (!entry || entry.safety !== "safe" || !entry.transform) {
		return null;
	}
	const next = entry.transform(lineText, match);
	if (next === null || next === lineText) {
		return null;
	}
	return next;
}
