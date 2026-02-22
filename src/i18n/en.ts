import { Locale } from "./types";

const messages: Record<string, string> = {
	// JavaScript
	"shame.js.consoleLog": "console.log() left in code — the debugger's graffiti",
	"shame.js.consoleWarn": "console.warn/error() left in code",
	"shame.js.varUsage": "'var' detected — it's not 2015 anymore",
	"shame.js.looseEquality": "'==' used instead of '===' — type coercion is not your friend",
	"shame.js.looseInequality": "'!=' used instead of '!==' — same story, different operator",
	"shame.js.eval": "eval() detected — congratulations, you've opened Pandora's box",
	"shame.js.debugger": "'debugger' statement left in code — hope this isn't production",
	"shame.js.emptyCatch": "Empty catch block — swallowing errors since 1995",
	"shame.js.alert": "alert() in code — are we building a 90s website?",
	"shame.js.magicNumber": "Magic number detected — give it a name, it deserves one",
	"shame.js.nestedTernary": "Nested ternary — because readability is overrated",
	"shame.js.newFunction": "new Function() — eval()'s sneaky cousin",
	"shame.js.documentWrite": "document.write() — time traveling to 1999",
	"shame.js.innerHTML": "innerHTML assignment — XSS says thank you",
	"shame.js.setTimeoutString": "setTimeout with string — eval() in disguise",

	// TypeScript
	"shame.ts.anyType": "': any' detected — TypeScript is crying",
	"shame.ts.asAny": "'as any' — the TypeScript escape hatch of shame",
	"shame.ts.tsIgnore": "@ts-ignore — if you can't fix it, ignore it right?",
	"shame.ts.tsNocheck": "@ts-nocheck — why even use TypeScript at this point?",
	"shame.ts.nonNullAssertion": "Non-null assertion (!) — trust me bro, it's not null",
	"shame.ts.expectErrorNoReason": "@ts-expect-error without explanation — future you will hate you",

	// Python
	"shame.py.print": "print() left in code — the Python console.log",
	"shame.py.bareExcept": "Bare 'except:' — Pokemon exception handling (gotta catch 'em all)",
	"shame.py.exceptPass": "'except: pass' — the sound of errors vanishing into the void",
	"shame.py.importStar": "'import *' — namespace pollution at its finest",
	"shame.py.global": "'global' keyword — sharing state like it's a potluck dinner",
	"shame.py.mutableDefault": "Mutable default argument — a classic Python gotcha",
	"shame.py.exec": "exec() detected — running arbitrary code, what could go wrong?",
	"shame.py.eval": "eval() detected — because exec() wasn't dangerous enough",
	"shame.py.hardcodedPassword": "Hardcoded password — security auditors love this",
	"shame.py.typeIgnore": "'# type: ignore' — the mypy escape hatch",

	// Java
	"shame.java.sysout": "System.out.println — the Java dev's print statement",
	"shame.java.syserr": "System.err.println — at least it's stderr",
	"shame.java.emptyCatch": "Empty catch block — exceptions go in, nothing comes out",
	"shame.java.systemExit": "System.exit() — the nuclear option",
	"shame.java.rawType": "Raw type used — generics exist for a reason",
	"shame.java.stringConcatLoop": "String concatenation — StringBuilder sends its regards",
	"shame.java.threadSleep": "Thread.sleep() — the universal 'fix' for race conditions",
	"shame.java.suppressWarnings": "@SuppressWarnings — if you suppress it, it doesn't exist",
	"shame.java.catchThrowable": "Catching Throwable — catching literally everything, including OutOfMemoryError",

	// C/C++
	"shame.cpp.printf": "printf() left in code",
	"shame.cpp.cout": "std::cout left in code",
	"shame.cpp.goto": "goto detected — Dijkstra is rolling in his grave",
	"shame.cpp.gets": "gets() detected — buffer overflow guaranteed",
	"shame.cpp.malloc": "malloc() without smart pointers — memory leak incoming",
	"shame.cpp.rawPointerNew": "Raw 'new' without smart pointer — who's going to delete this?",
	"shame.cpp.usingNamespaceStd": "'using namespace std' — polluting the global namespace",
	"shame.cpp.defineConstant": "#define for constants — constexpr says hi",
	"shame.cpp.sprintf": "sprintf() detected — use snprintf() for safety",
	"shame.cpp.strcpy": "strcpy() detected — buffer overflow classic",

	// C
	"shame.c.printf": "printf() left in code",
	"shame.c.goto": "goto detected — spaghetti code guaranteed",
	"shame.c.gets": "gets() detected — this function was literally removed from C11",
	"shame.c.malloc": "malloc() — don't forget to free()",
	"shame.c.sprintf": "sprintf() detected — snprintf() is safer",
	"shame.c.strcpy": "strcpy() — the buffer overflow special",
	"shame.c.strcat": "strcat() — another buffer overflow classic",
	"shame.c.voidPointer": "void* — type safety? Never heard of it",

	// Dart
	"shame.dart.print": "print() left in code — use a proper logger",
	"shame.dart.dynamic": "'dynamic' type — Dart's any equivalent",
	"shame.dart.forceUnwrap": "Force unwrap (!) — null safety? Who needs it",
	"shame.dart.debugPrint": "debugPrint() left in code",
	"shame.dart.emptyCatch": "Empty catch block — Flutter errors go brr",
	"shame.dart.runtimeType": ".runtimeType — prefer 'is' checks",

	// PHP
	"shame.php.echo": "echo statement — might be debug output",
	"shame.php.varDump": "var_dump() — the PHP debugger's best friend",
	"shame.php.printR": "print_r() — still debugging?",
	"shame.php.eval": "eval() — because PHP wasn't insecure enough",
	"shame.php.mysqlDeprecated": "mysql_* functions — deprecated since PHP 5.5, removed in 7.0",
	"shame.php.variableVariables": "$$variable — variable variables? Really?",
	"shame.php.errorSuppression": "@ error suppression — hiding problems, one @ at a time",
	"shame.php.extract": "extract() — creating variables out of thin air",
	"shame.php.dieExit": "die()/exit() — graceful shutdown? Never heard of it",
	"shame.php.global": "'global' keyword — dependency injection exists, you know",

	// Common
	"shame.common.todo": "TODO found — a promise to your future self you'll probably break",
	"shame.common.fixme": "FIXME found — at least you're honest about it",
	"shame.common.hack": "HACK marker — technical debt, officially acknowledged",
	"shame.common.xxx": "XXX marker — something's definitely wrong here",
	"shame.common.longLine": "Line exceeds 200 characters — that's a paragraph, not a line of code",
	"shame.common.commentedCode": "Commented-out code — git remembers, you don't have to",
	"shame.common.noNewlineEof": "No newline at end of file — POSIX disapproves",
};

const roasts: Record<string, string> = {
	// Clean (0 shames)
	"roast.clean.1": "Your code is so clean, it squeaks! What's your secret?",
	"roast.clean.2": "Zero shames? Are you even writing code or just admiring your cursor?",
	"roast.clean.3": "Impeccable. Uncle Bob would shed a tear of joy.",
	"roast.clean.4": "If code could win beauty pageants, yours just took the crown.",
	"roast.clean.5": "Your code is cleaner than my apartment. And that's not saying much, but still.",
	"roast.clean.6": "Spotless. Did you write this or did a linter achieve sentience?",

	// Low (1-24 score)
	"roast.low.1": "A few rough edges, but nothing to lose sleep over.",
	"roast.low.2": "Almost perfect. Just a couple of skeletons in the closet.",
	"roast.low.3": "Minor sins. Your code goes to confession, not prison.",
	"roast.low.4": "A tiny bit of shame, like leaving your turn signal on. Harmless, but noticeable.",
	"roast.low.5": "Your code just needs a light dusting, not a full renovation.",
	"roast.low.6": "You're on the edge of greatness. Just a few console.logs standing in the way.",

	// Medium (25-74 score)
	"roast.medium.1": "Your code has... character. Lots of character.",
	"roast.medium.2": "It works, but it's held together with duct tape and prayers.",
	"roast.medium.3": "Not great, not terrible. The 3.6 Roentgen of code quality.",
	"roast.medium.4": "Somewhere between 'it works on my machine' and 'please don't touch anything'.",
	"roast.medium.5": "Your code reads like a mystery novel. Nobody knows what happens next. Including you.",
	"roast.medium.6": "I've seen worse. But I've also seen much, much better.",

	// High (75-149 score)
	"roast.high.1": "This code needs a support group.",
	"roast.high.2": "I've seen cleaner code in a 2AM hackathon.",
	"roast.high.3": "Your code is so messy, even git blame refuses responsibility.",
	"roast.high.4": "This code doesn't need a review, it needs an intervention.",
	"roast.high.5": "If spaghetti code was a sport, you'd be an Olympic gold medalist.",
	"roast.high.6": "Your code has more issues than a magazine stand.",

	// Extreme (150+ score)
	"roast.extreme.1": "Is this code or a cry for help?",
	"roast.extreme.2": "This codebase has more red flags than a Soviet parade.",
	"roast.extreme.3": "Congratulations, you've achieved legendary shame status.",
	"roast.extreme.4": "I've run out of constructive things to say. I'm just here for emotional support now.",
	"roast.extreme.5": "This code violates the Geneva Convention on software engineering.",
	"roast.extreme.6": "Legends say if you stare at this code long enough, it stares back.",
};

const levels: Record<string, string> = {
	"level.cleanCodeGuru": "Clean Code Guru",
	"level.likeAHacker": "Like a Hacker",
	"level.seniorityLevel": "Seniority Level",
	"level.juniorLike": "Junior Like",
	"level.viveCoder": "Vive Coder",
	"level.shameOverlord": "Shame Overlord",
};

const achievements: Record<string, string> = {
	"achievement.firstScan.title": "First Glance",
	"achievement.firstScan.desc": "Run your first workspace scan",
	"achievement.firstFix.title": "First Fix!",
	"achievement.firstFix.desc": "Reduce your shame score for the first time",
	"achievement.halfShame.title": "Halfway There!",
	"achievement.halfShame.desc": "Reduce your shame to 50% of the original",
	"achievement.cleanSlate.title": "Clean Slate",
	"achievement.cleanSlate.desc": "Reach zero shame points",
	"achievement.persistent.title": "Persistent Improver",
	"achievement.persistent.desc": "Run 10 scans on this workspace",
};

const en: Locale = {
	disabled: "Extension disabled",
	languageDisabled: "Language not enabled",
	noCode: "No code to judge",
	scanning: "CodeShamer is analyzing your workspace...",
	scanComplete: (files: number, shames: number) =>
		`CodeShamer: ${shames} shames found in ${files} files`,
	shameTooltip: (score: number) => `Shame level ${score}`,
	details: (score: number, roast: string) =>
		`🔥 Shame ${score}/10 — ${roast}`,
	shameMessage: (messageKey: string) =>
		messages[messageKey] ?? messageKey,
	messages,
	roasts,
	levels,
	achievements,
};

export default en;
