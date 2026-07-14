import { Locale, UiStrings } from "./types";

const messages: Record<string, string> = {
	"shame.js.consoleLog": "You left console.log() in — production is not your personal diary",
	"shame.js.consoleWarn": "Console noise still hanging around — your users aren't paid to read your debug drama",
	"shame.js.varUsage": "You used 'var' — even Internet Explorer moved on, and that is saying something",
	"shame.js.looseEquality": "You wrote '==' — JavaScript will surprise you, and not in a fun way",
	"shame.js.looseInequality": "You wrote '!=' — same chaos as '==', just with extra confidence",
	"shame.js.eval": "You called eval() — you basically invited arbitrary code to the party",
	"shame.js.debugger": "You left debugger in — did you mean to pause prod, or just your career?",
	"shame.js.emptyCatch": "Empty catch — errors went in, dignity went out",
	"shame.js.alert": "alert() in 2026 — did you time-travel here from a GeoCities popup?",
	"shame.js.magicNumber": "Magic number spotted — name it before it becomes folklore",
	"shame.js.nestedTernary": "Nested ternary — readable code called, you sent it to voicemail",
	"shame.js.newFunction": "new Function() — eval() wearing a fake mustache",
	"shame.js.documentWrite": "document.write() — the DOM did not ask for this vandalism",
	"shame.js.innerHTML": "innerHTML assignment — XSS is lining up to send you a thank-you card",
	"shame.js.setTimeoutString": "setTimeout with a string — eval() cosplaying as a timer",
	"shame.js.letArrayPush": "let + push loop — you can build arrays without the suffering arc",
	"shame.js.switchNoBreak": "Switch fallthrough — unless this is intentional, your future self is already mad",

	"shame.ts.anyType": "': any' — you paid for TypeScript and chose chaos anyway",
	"shame.ts.asAny": "'as any' — type safety left the chat",
	"shame.ts.tsIgnore": "@ts-ignore — world-class strategy: hide the fire, keep the smoke",
	"shame.ts.tsNocheck": "@ts-nocheck — congratulations, you turned TypeScript into JavaScript cosplay",
	"shame.ts.nonNullAssertion": "Non-null assertion (!) — 'trust me bro' is not a type system",
	"shame.ts.expectErrorNoReason": "@ts-expect-error with no reason — future you deserves an apology note",

	"shame.py.print": "print() left in — your logs deserve dignity, not sidewalk chalk",
	"shame.py.bareExcept": "Bare except — catching everything including your dignity",
	"shame.py.exceptPass": "except: pass — the sound of bugs throwing a silent rave",
	"shame.py.importStar": "import * — you imported a whole circus, naming optional",
	"shame.py.global": "global keyword — shared mutable state, everyone's favorite villain",
	"shame.py.mutableDefault": "Mutable default arg — Python's classic 'gotcha' and you walked right in",
	"shame.py.exec": "exec() — running mystery code like it's a trust exercise",
	"shame.py.eval": "eval() — because exec() wasn't reckless enough for you",
	"shame.py.hardcodedPassword": "Hardcoded password — hackers just sent you a heart emoji",
	"shame.py.typeIgnore": "# type: ignore — mypy is screaming, you're pretending it's fine",

	"shame.java.sysout": "System.out.println — the Java dev's print statement",
	"shame.java.syserr": "System.err.println — at least it's stderr",
	"shame.java.emptyCatch": "Empty catch block — exceptions go in, nothing comes out",
	"shame.java.systemExit": "System.exit() — the nuclear option",
	"shame.java.rawType": "Raw type used — generics exist for a reason",
	"shame.java.stringConcatLoop": "String concatenation — StringBuilder sends its regards",
	"shame.java.threadSleep": "Thread.sleep() — the universal 'fix' for race conditions",
	"shame.java.suppressWarnings": "@SuppressWarnings — if you suppress it, it doesn't exist",
	"shame.java.catchThrowable": "Catching Throwable — catching literally everything, including OutOfMemoryError",

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

	"shame.c.printf": "printf() left in code",
	"shame.c.goto": "goto detected — spaghetti code guaranteed",
	"shame.c.gets": "gets() detected — this function was literally removed from C11",
	"shame.c.malloc": "malloc() — don't forget to free()",
	"shame.c.sprintf": "sprintf() detected — snprintf() is safer",
	"shame.c.strcpy": "strcpy() — the buffer overflow special",
	"shame.c.strcat": "strcat() — another buffer overflow classic",
	"shame.c.voidPointer": "void* — type safety? Never heard of it",

	"shame.dart.print": "print() left in code — use a proper logger",
	"shame.dart.dynamic": "'dynamic' type — Dart's any equivalent",
	"shame.dart.forceUnwrap": "Force unwrap (!) — null safety? Who needs it",
	"shame.dart.debugPrint": "debugPrint() left in code",
	"shame.dart.emptyCatch": "Empty catch block — Flutter errors go brr",
	"shame.dart.runtimeType": ".runtimeType — prefer 'is' checks",
	"shame.dart.deepNesting": "Deep widget nesting — extract widgets for readability",

	"shame.php.echo": "echo in prod — did you mean to ship your debug thoughts?",
	"shame.php.varDump": "var_dump() — your variables are on public display, enjoy the show",
	"shame.php.printR": "print_r() — still treating the browser like phpMyAdmin?",
	"shame.php.eval": "eval() in PHP — security auditors just canceled their vacation",
	"shame.php.mysqlDeprecated": "mysql_* in 2026 — this API retired before some interns were born",
	"shame.php.variableVariables": "$$variables — even PHP is judging you right now",
	"shame.php.errorSuppression": "@ suppression — errors are real, your @ is just makeup",
	"shame.php.extract": "extract() — surprise variables for everyone, including future you",
	"shame.php.dieExit": "die()/exit() — graceful shutdown called, you sent it to voicemail",
	"shame.php.global": "global in PHP — dependency injection exists, you know",

	"shame.html.inlineStyle": "Inline styles — CSS files exist, they're not decorative",
	"shame.html.marquee": "<marquee> — welcome back to 1998, please leave again",
	"shame.html.brUsage": "Stacked <br> — layout by line break is not a personality trait",
	"shame.html.centerTag": "<center> — HTML4 called, it wants its relic back",

	"shame.css.important": "!important — you brought a sledgehammer to a specificity debate",
	"shame.css.universalWildcard": "* selector — styling the entire universe because focus is hard",
	"shame.css.zIndexMax": "z-index: 9999 — congratulations, you won the stacking war and lost maintainability",
	"shame.css.outlineNone": "outline: none — keyboard users would like to find your buttons, thanks",
	"shame.css.zeroPx": "0px — the extra pixels are free, your pride is expensive",
	"shame.css.idSelector": "ID selector for styling — classes exist, they're cheaper emotionally",

	"shame.html.imgNoAlt": "Image with no alt — screen readers are staring at you in silence",
	"shame.html.inputNoType": "Input without type — surprise forms are not a UX strategy",
	"shame.html.inlineOnclick": "Inline onclick — HTML is not your junk drawer for JavaScript",
	"shame.html.missingLang": "<html> without lang — accessibility called, you sent it to spam",
	"shame.html.emptyHref": "href='#' — either use a button or commit to the link, pick a lane",
	"shame.html.tableLayout": "Table layout in 2026 — CSS grid exists, it's free, it's modern",

	"shame.js.reactKeyIndex": "key={index} — React will re-render your sins in alphabetical chaos",
	"shame.js.reactDangerousHtml": "dangerouslySetInnerHTML — the name literally warned you, you ignored it",

	"shame.py.openWithoutWith": "open() without with — file handles are not houseplants, they need closing",
	"shame.py.pickleLoads": "pickle.loads() on untrusted data — that's not parsing, that's trust fall",

	"shame.php.requestSuperglobal": "$_REQUEST — you merged GET and POST like it's a smoothie",
	"shame.php.shortTag": "Short PHP tag — portability left the building",

	"shame.vue.vHtml": "v-html — you're serving HTML trust-me-bro style",
	"shame.vue.vForNoKey": "v-for without :key — Vue is guessing; your UI is gambling",
	"shame.vue.optionsData": "data() returning shared state — every component gets the same trauma",

	"shame.svelte.htmlInjection": "{@html} — user input just got VIP access to your DOM",
	"shame.svelte.reactiveStatement": "Another $: line — your data flow is becoming fan fiction",

	"shame.astro.setHtml": "set:html — you invited raw HTML to the server party",
	"shame.astro.clientDirective": "client:* everywhere — hydration budget is crying",

	"shame.angular.innerHtml": "[innerHTML] — XSS RSVP'd yes to your template",
	"shame.angular.ngForNoTrackBy": "*ngFor without trackBy — Angular is re-rendering the whole timeline",
	"shame.angular.anyInTemplate": ": any in Angular — strict templates are available, you chose vibes",

	"shame.common.todo": "TODO — a love letter to future you, who is already tired",
	"shame.common.fixme": "FIXME — at least you're honest that this ships on hope",
	"shame.common.hack": "HACK — technical debt with a street name",
	"shame.common.xxx": "XXX — code alarm bell, and you left it ringing",
	"shame.common.nestedLoops": "Nested loops — O(n²) is not a flex, it's a warning label",
	"shame.common.longLine": "200+ characters on one line — that's a tweet, not code",
	"shame.common.commentedCode": "Commented-out code — git has memory, you don't need the museum exhibit",
	"shame.common.noNewlineEof": "No newline at EOF — POSIX is disappointed, mildly but firmly",
};

const fixes: Record<string, string> = {
	"fix.js.varUsage.title": "Replace 'var' with 'let'",
	"fix.js.looseEquality.title": "Replace '==' with '==='",
	"fix.js.looseInequality.title": "Replace '!=' with '!=='",
	"fix.js.debugger.title": "Remove 'debugger' statement",
	"fix.js.consoleLog.title": "Remove console statement",
	"fix.js.alert.title": "Remove 'alert()' call",
	"fix.js.eval.title": "Review eval() usage",
	"fix.js.emptyCatch.title": "Review empty catch block",
	"fix.js.nestedTernary.title": "Review nested ternary",
	"fix.js.newFunction.title": "Review new Function() usage",
	"fix.js.documentWrite.title": "Review document.write usage",
	"fix.js.setTimeoutString.title": "Review setTimeout with string",
	"fix.js.letArrayPush.title": "Review let-then-push pattern",
	"fix.js.switchNoBreak.title": "Review switch fallthrough",

	"fix.ts.tsIgnore.title": "Replace @ts-ignore with @ts-expect-error",
	"fix.ts.anyType.title": "Replace 'any' with a concrete type",
	"fix.ts.asAny.title": "Avoid 'as any' cast",
	"fix.ts.tsNocheck.title": "Remove @ts-nocheck and fix issues",
	"fix.ts.nonNullAssertion.title": "Replace '!' with a null guard",
	"fix.ts.expectErrorNoReason.title": "Add a reason to @ts-expect-error",

	"fix.py.print.title": "Remove print() statement",
	"fix.py.bareExcept.title": "Replace 'except:' with 'except Exception:'",
	"fix.py.exceptPass.title": "Review 'except: pass' usage",
	"fix.py.importStar.title": "Replace 'import *' with explicit imports",
	"fix.py.global.title": "Replace 'global' with explicit dependency",
	"fix.py.mutableDefault.title": "Replace mutable default argument",
	"fix.py.exec.title": "Review exec() usage",
	"fix.py.eval.title": "Review eval() usage",
	"fix.py.hardcodedPassword.title": "Move password to environment/config",
	"fix.py.typeIgnore.title": "Address the underlying mypy error",

	"fix.java.sysout.title": "Remove System.out.println",
	"fix.java.syserr.title": "Remove System.err.println",
	"fix.java.emptyCatch.title": "Log or rethrow the exception",
	"fix.java.systemExit.title": "Replace System.exit() with proper exit",
	"fix.java.rawType.title": "Use generic type arguments",
	"fix.java.stringConcatLoop.title": "Use StringBuilder",
	"fix.java.threadSleep.title": "Use a proper concurrency primitive",
	"fix.java.suppressWarnings.title": "Address the suppressed warning",
	"fix.java.catchThrowable.title": "Catch a more specific exception",

	"fix.cpp.printf.title": "Remove printf() debug statement",
	"fix.cpp.cout.title": "Remove std::cout debug statement",
	"fix.cpp.goto.title": "Replace goto with structured control flow",
	"fix.cpp.gets.title": "Replace gets() with fgets()",
	"fix.cpp.malloc.title": "Use std::unique_ptr or std::make_unique",
	"fix.cpp.rawPointerNew.title": "Use a smart pointer",
	"fix.cpp.usingNamespaceStd.title": "Qualify identifiers with std::",
	"fix.cpp.defineConstant.title": "Use constexpr instead of #define",
	"fix.cpp.sprintf.title": "Replace sprintf() with snprintf()",
	"fix.cpp.strcpy.title": "Replace strcpy() with strncpy() or std::string",

	"fix.c.printf.title": "Remove printf() debug statement",
	"fix.c.goto.title": "Replace goto with structured control flow",
	"fix.c.gets.title": "Replace gets() with fgets()",
	"fix.c.malloc.title": "Match malloc() with free()",
	"fix.c.sprintf.title": "Replace sprintf() with snprintf()",
	"fix.c.strcpy.title": "Replace strcpy() with strncpy()",
	"fix.c.strcat.title": "Replace strcat() with strncat()",
	"fix.c.voidPointer.title": "Use a typed pointer",

	"fix.dart.print.title": "Remove print() statement",
	"fix.dart.debugPrint.title": "Remove debugPrint() statement",
	"fix.dart.dynamic.title": "Replace 'dynamic' with explicit type",
	"fix.dart.forceUnwrap.title": "Use null-safe access",
	"fix.dart.emptyCatch.title": "Log or rethrow the exception",
	"fix.dart.runtimeType.title": "Use 'is' checks instead",
	"fix.dart.deepNesting.title": "Extract nested widgets",

	"fix.php.echo.title": "Remove echo statement",
	"fix.php.varDump.title": "Remove var_dump() statement",
	"fix.php.printR.title": "Remove print_r() statement",
	"fix.php.eval.title": "Review eval() usage",
	"fix.php.mysqlDeprecated.title": "Replace mysql_* with mysqli_* or PDO",
	"fix.php.variableVariables.title": "Replace variable variables with arrays",
	"fix.php.errorSuppression.title": "Remove '@' suppression",
	"fix.php.extract.title": "Replace extract() with explicit assignment",
	"fix.php.dieExit.title": "Replace die()/exit() with proper flow",
	"fix.php.global.title": "Replace 'global' with dependency injection",

	"fix.html.inlineStyle.title": "Move inline style to a CSS class",
	"fix.html.marquee.title": "Replace <marquee> with CSS animation",
	"fix.html.brUsage.title": "Replace stacked <br> with proper layout",
	"fix.html.centerTag.title": "Replace <center> with CSS",

	"fix.css.important.title": "Refactor selector to avoid !important",
	"fix.css.universalWildcard.title": "Use a more specific selector",

	"fix.common.todo.title": "Address TODO marker",
	"fix.common.fixme.title": "Address FIXME marker",
	"fix.common.hack.title": "Address HACK marker",
	"fix.common.xxx.title": "Address XXX marker",
	"fix.common.nestedLoops.title": "Refactor nested loops",
};

const hints: Record<string, string> = {
	"hint.js.consoleLog": "Remove before commit or use a logger with levels (debug/info/warn).",
	"hint.js.varUsage": "Use let or const; var is function-scoped and hoisted oddly.",
	"hint.js.looseEquality": "Use === so types are not coerced unexpectedly.",
	"hint.js.looseInequality": "Use !== for the same reason as ===.",
	"hint.js.debugger": "Remove debugger statements before shipping to production.",
	"hint.js.alert": "Replace with UI notifications or logging in real applications.",
	"hint.js.innerHTML": "Use textContent, DOMPurify, or framework-safe rendering.",
	"hint.js.reactKeyIndex": "Use item.id or a stable business key instead of the loop index.",
	"hint.js.reactDangerousHtml": "Sanitize with DOMPurify or render plain text when possible.",

	"hint.js.eval": "Avoid eval(); parse JSON, use a switch, or pass functions instead.",
	"hint.js.emptyCatch": "Log the error or rethrow; silently swallowing errors hides bugs.",
	"hint.js.nestedTernary": "Extract to an if/else or named helper for readability.",
	"hint.js.newFunction": "new Function() executes arbitrary code; refactor to use closures.",
	"hint.js.documentWrite": "Use DOM APIs (createElement/appendChild) or a framework.",
	"hint.js.setTimeoutString": "Pass a function reference instead of a string to setTimeout.",
	"hint.js.letArrayPush": "Build the array via map/filter/spread for clarity and immutability.",
	"hint.js.switchNoBreak": "Add an explicit break/return, or document the intentional fallthrough.",

	"hint.ts.anyType": "Replace 'any' with a precise type or 'unknown' plus a guard.",
	"hint.ts.asAny": "Narrow with a type guard or use 'as unknown as T' only as last resort.",
	"hint.ts.tsNocheck": "Remove @ts-nocheck and fix the underlying type errors.",
	"hint.ts.nonNullAssertion": "Use optional chaining (?.) or an explicit null check.",
	"hint.ts.expectErrorNoReason": "Document why this error is expected: @ts-expect-error: <reason>.",
	"hint.ts.tsIgnore": "Prefer @ts-expect-error with a reason, or fix the underlying type error.",

	"hint.py.exceptPass": "At minimum, log the exception; never silently swallow errors.",
	"hint.py.importStar": "List the explicit names you import to avoid namespace pollution.",
	"hint.py.global": "Pass values as arguments or use a class to hold state.",
	"hint.py.mutableDefault": "Use None as default and create the mutable inside the function.",
	"hint.py.exec": "Avoid exec(); refactor to call a known function or use a registry.",
	"hint.py.eval": "Use ast.literal_eval for data, or call a real function for logic.",
	"hint.py.hardcodedPassword": "Read secrets from env vars or a secrets manager.",
	"hint.py.typeIgnore": "Fix the underlying type error or narrow with cast/assert.",

	"hint.java.emptyCatch": "Log via a logger and either rethrow or return a sentinel value.",
	"hint.java.systemExit": "Throw a structured exception or return an exit code from main.",
	"hint.java.rawType": "Use generics: List<String> rather than List.",
	"hint.java.stringConcatLoop": "Use StringBuilder inside loops for O(n) concatenation.",
	"hint.java.threadSleep": "Use scheduled executors or condition variables instead.",
	"hint.java.suppressWarnings": "Address the warning; suppress only when truly necessary.",
	"hint.java.catchThrowable": "Catch a specific subclass; never swallow Errors like OOM.",

	"hint.dart.dynamic": "Use a concrete type or a generic; reserve dynamic for true unknowns.",
	"hint.dart.forceUnwrap": "Use ?., null checks, or pattern matching instead of !.",
	"hint.dart.emptyCatch": "Log via Flutter's logger and rethrow when appropriate.",
	"hint.dart.runtimeType": "Use 'is' checks; runtimeType is slow and brittle.",
	"hint.dart.deepNesting": "Extract widgets into named StatelessWidget subclasses.",

	"hint.php.eval": "Avoid eval(); use a switch or callable map instead.",
	"hint.php.mysqlDeprecated": "Use mysqli_* prepared statements or PDO with parameter binding.",
	"hint.php.variableVariables": "Use an associative array and access by key.",
	"hint.php.errorSuppression": "Handle the error explicitly; @ hides real problems.",
	"hint.php.extract": "Assign variables explicitly to keep code readable and safe.",
	"hint.php.dieExit": "Use proper return paths and exception handling.",
	"hint.php.global": "Inject dependencies via constructor or function parameters.",

	"hint.html.inlineStyle": "Move the rule to a stylesheet and reference it via class.",
	"hint.html.marquee": "Use CSS animations or transitions for motion effects.",
	"hint.html.brUsage": "Use semantic HTML (paragraphs, lists) instead of stacked <br>.",
	"hint.html.centerTag": "Use CSS (text-align/center, margin auto) instead of <center>.",

	"hint.css.important": "Increase specificity or refactor cascading rules instead of !important.",
	"hint.css.universalWildcard": "Target specific elements; '*' affects everything and is slow.",
	"hint.css.zIndexMax": "Use a small scale (1–10) and isolate stacking with a wrapper.",
	"hint.css.outlineNone": "Pair with :focus-visible { outline: ... } for keyboard users.",
	"hint.css.zeroPx": "Write `0` instead of `0px` for margins, padding, and sizes.",
	"hint.css.idSelector": "Prefer BEM-style classes so styles stay reusable and testable.",

	"hint.html.imgNoAlt": "Add alt=\"\" for decorative images or a descriptive alt text.",
	"hint.html.inputNoType": "Set type=\"email|password|number|...\" explicitly.",
	"hint.html.inlineOnclick": "Attach listeners in a script module or framework handler.",
	"hint.html.missingLang": "Add lang=\"en\" (or your locale) on the <html> element.",
	"hint.html.emptyHref": "Use <button type=\"button\"> or href with preventDefault().",
	"hint.html.tableLayout": "Use <div> with CSS grid/flex; reserve tables for tabular data.",

	"hint.py.openWithoutWith": "Use `with open(...) as f:` so files close even on exceptions.",
	"hint.py.pickleLoads": "Never unpickle data from untrusted sources.",

	"hint.php.requestSuperglobal": "Read $_GET/$_POST explicitly to know the input source.",
	"hint.php.shortTag": "Enable only <?php in team style guides and CI.",

	"hint.vue.vHtml": "Sanitize HTML server-side or with a trusted library before v-html.",
	"hint.vue.vForNoKey": "Add :key=\"item.id\" (or similar) on the element with v-for.",
	"hint.vue.optionsData": "Return a new object from data() — never share one instance.",

	"hint.svelte.htmlInjection": "Sanitize HTML; prefer {@render} or escaped text when possible.",
	"hint.svelte.reactiveStatement": "Move complex logic into functions or derived stores.",

	"hint.astro.setHtml": "Sanitize HTML; prefer Astro components over raw HTML injection.",
	"hint.astro.clientDirective": "Hydrate only interactive islands; keep static HTML by default.",

	"hint.angular.innerHtml": "Use DomSanitizer.sanitize or avoid binding raw HTML.",
	"hint.angular.ngForNoTrackBy": "Add trackBy: trackById for stable list reconciliation.",
	"hint.angular.anyInTemplate": "Type template contexts with interfaces or strict templates.",

	"hint.c.goto": "Refactor with structured loops or break/continue.",
	"hint.c.gets": "Replace with fgets(buf, sizeof buf, stdin) for bounded reads.",
	"hint.c.malloc": "Pair every malloc with free; consider RAII patterns or arenas.",
	"hint.c.sprintf": "Use snprintf() with explicit size to avoid overflow.",
	"hint.c.strcpy": "Use strncpy() with bounds, or strlcpy where available.",
	"hint.c.strcat": "Use strncat() with bounds, or build via snprintf().",
	"hint.c.voidPointer": "Prefer typed pointers; void* loses type information.",

	"hint.cpp.goto": "Use structured control flow (loops, break, return).",
	"hint.cpp.gets": "Use std::getline or fgets for bounded reads.",
	"hint.cpp.malloc": "Prefer std::make_unique / std::make_shared.",
	"hint.cpp.rawPointerNew": "Wrap with std::unique_ptr / std::shared_ptr.",
	"hint.cpp.usingNamespaceStd": "Use std:: prefix or import specific names.",
	"hint.cpp.defineConstant": "Use 'constexpr' or 'const' typed constants.",
	"hint.cpp.sprintf": "Use snprintf() or std::format for safe formatting.",
	"hint.cpp.strcpy": "Use std::string or strncpy() with bounds.",

	"hint.common.todo": "Convert to a tracked ticket or remove if obsolete.",
	"hint.common.fixme": "Schedule the fix or remove the marker once addressed.",
	"hint.common.hack": "Plan a refactor; document why the hack is needed for now.",
	"hint.common.xxx": "Investigate the marked code and resolve.",
	"hint.common.nestedLoops": "Refactor to a single pass, hash lookup, or extract a helper.",
};

const roasts: Record<string, string> = {
	"roast.clean.1": "Your code is so clean, it squeaks! What's your secret?",
	"roast.clean.2": "Zero shames? Are you even writing code or just admiring your cursor?",
	"roast.clean.3": "Impeccable. Uncle Bob would shed a tear of joy.",
	"roast.clean.4": "If code could win beauty pageants, yours just took the crown.",
	"roast.clean.5": "Your code is cleaner than my apartment. And that's not saying much, but still.",
	"roast.clean.6": "Spotless. Did you write this or did a linter achieve sentience?",

	"roast.low.1": "A few rough edges, but nothing to lose sleep over.",
	"roast.low.2": "Almost perfect. Just a couple of skeletons in the closet.",
	"roast.low.3": "Minor sins. Your code goes to confession, not prison.",
	"roast.low.4": "A tiny bit of shame, like leaving your turn signal on. Harmless, but noticeable.",
	"roast.low.5": "Your code just needs a light dusting, not a full renovation.",
	"roast.low.6": "You're on the edge of greatness. Just a few console.logs standing in the way.",

	"roast.medium.1": "Your code has... character. Lots of character.",
	"roast.medium.2": "It works, but it's held together with duct tape and prayers.",
	"roast.medium.3": "Not great, not terrible. The 3.6 Roentgen of code quality.",
	"roast.medium.4": "Somewhere between 'it works on my machine' and 'please don't touch anything'.",
	"roast.medium.5": "Your code reads like a mystery novel. Nobody knows what happens next. Including you.",
	"roast.medium.6": "I've seen worse. But I've also seen much, much better.",

	"roast.high.1": "This code needs a support group.",
	"roast.high.2": "I've seen cleaner code in a 2AM hackathon.",
	"roast.high.3": "Your code is so messy, even git blame refuses responsibility.",
	"roast.high.4": "This code doesn't need a review, it needs an intervention.",
	"roast.high.5": "If spaghetti code was a sport, you'd be an Olympic gold medalist.",
	"roast.high.6": "Your code has more issues than a magazine stand.",

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

const ui: UiStrings = {
	scanningWorkspace: "Judging your workspace... please hold.",
	noShamesYet: "No shames yet — either you're clean or we're still loading the roast menu.",
	noShamesInFile: "This file is suspiciously clean. Are you sure you wrote it yourself?",
	cacheCleared: "CodeShamer: Cache cleared. Run scan again.",
	ruleDisabled: (ruleId) =>
		`CodeShamer: Rule '${ruleId}' has been disabled in the workspace.`,
	statusBarScanning: "$(sync~spin) CodeShamer: Scanning workspace...",
	statusBarTooltip: "CodeShamer scan is running",
	achievementBanner: (title) => `CodeShamer Achievement: ${title}`,
	codeActionIgnoreLine: "CodeShamer: Ignore this line",
	codeActionIgnoreFile: "CodeShamer: Ignore this entire file",
	codeActionDisableWorkspace: (ruleId) =>
		`CodeShamer: Disable rule '${ruleId}' for the whole workspace`,
	panelHeaderTitle: (totalShames, fileCount) =>
		`${totalShames} shame${totalShames !== 1 ? "s" : ""} in ${fileCount} file${
			fileCount !== 1 ? "s" : ""
		}`,
	scanningStatusMessage: "CodeShamer is scanning your workspace...",
	scanCompletedStatusMessage: (files, shames) =>
		`CodeShamer: ${shames} shame${shames !== 1 ? "s" : ""} in ${files} file${
			files !== 1 ? "s" : ""
		}`,
};

const en: Locale = {
	id: "en",
	disabled: "Extension disabled",
	languageDisabled: "Language not enabled",
	noCode: "No code to judge",
	scanning: "CodeShamer is analyzing your workspace...",
	scanComplete: (files: number, shames: number) =>
		`CodeShamer: ${shames} shames found in ${files} files`,
	shameTooltip: (score: number) => `Shame level ${score}`,
	details: (score: number, roast: string) =>
		`🔥 Shame ${score}/10 — ${roast}`,
	shameMessage: (messageKey: string) => messages[messageKey] ?? messageKey,
	hintMessage: (hintKey: string) => hints[hintKey] ?? "",
	t: (key: string) => {
		return (
			messages[key] ??
			fixes[key] ??
			hints[key] ??
			roasts[key] ??
			levels[key] ??
			achievements[key] ??
			key
		);
	},
	ui,
	messages,
	roasts,
	levels,
	achievements,
	fixes,
	hints,
};

export default en;
