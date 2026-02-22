<div align="start">
  <span>EN</span> | <a href="../es/ABOUT_LICENSE.md">ES</a> 
</div>

# Adding a New Programming Language to CodeShamer

This guide walks you through adding support for a new programming language. We'll use **Ruby** as an example.

## Step 1: Create the Rules File

Create a new file `src/engine/rules/ruby.ts`:

```typescript
import { ShamePattern } from "../types";

export const rubyRules: ShamePattern[] = [
	{
		id: "ruby-puts",
		pattern: /\bputs\s/,
		severity: 2,
		category: "debug",
		messageKey: "shame.ruby.puts",
	},
	{
		id: "ruby-pp",
		pattern: /\bpp\s/,
		severity: 2,
		category: "debug",
		messageKey: "shame.ruby.pp",
	},
	{
		id: "ruby-eval",
		pattern: /\beval\s*[\(\s]/,
		severity: 5,
		category: "security",
		messageKey: "shame.ruby.eval",
	},
	{
		id: "ruby-rescue-all",
		pattern: /rescue\s*$/,
		severity: 4,
		category: "reliability",
		messageKey: "shame.ruby.rescueAll",
	},
	{
		id: "ruby-global-var",
		pattern: /\$\w+\s*=/,
		severity: 3,
		category: "style",
		messageKey: "shame.ruby.globalVar",
	},
];
```

### Rules Guidelines

Each `ShamePattern` has these fields:

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier. Format: `<lang>-<descriptive-name>` |
| `pattern` | `RegExp` | Regex to match. **Do NOT use the `g` flag** — the engine handles that |
| `severity` | `1-5` | 1 = nitpick, 2 = suggestion, 3 = warning, 4 = important, 5 = critical |
| `category` | `ShameCategory` | One of: `security`, `debug`, `style`, `performance`, `maintenance`, `reliability` |
| `messageKey` | `string` | i18n key for the human-readable message. Format: `shame.<lang>.<ruleName>` |
| `multiline` | `boolean?` | Set to `true` if the pattern needs to span multiple lines |

### Severity Guide

| Level | When to use             | Example                             |
| ----- | ----------------------- | ----------------------------------- |
| 1     | Nitpick, cosmetic       | Magic numbers, long lines           |
| 2     | Suggestion, minor issue | Debug output, minor style           |
| 3     | Warning, should fix     | Deprecated patterns, loose equality |
| 4     | Important, likely a bug | Empty catch blocks, `debugger`      |
| 5     | Critical, security risk | `eval()`, hardcoded passwords       |

### Pattern Tips

-  Keep patterns simple — avoid overly complex regex
-  Test against both positive matches and false positives
-  If a pattern needs multi-line context, set `multiline: true`
-  The engine runs each pattern per line (unless multiline), so line-based patterns are preferred

## Step 2: Register the Language

Open `src/engine/languageRules.ts` and add your language:

```typescript
import { rubyRules } from "./rules/ruby";

const languageSpecificRules: Record<string, ShamePattern[]> = {
	// ... existing languages ...
	ruby: rubyRules,
};
```

Also add the file glob mapping in `src/scanner/workspaceScanner.ts`:

```typescript
const LANG_GLOBS: Record<string, string> = {
	// ... existing mappings ...
	ruby: "**/*.rb",
};
```

## Step 3: Add Translations

### English (`src/i18n/en.ts`)

Add entries to the `messages` record:

```typescript
// Ruby
"shame.ruby.puts": "puts left in code — the Ruby developer's breadcrumb",
"shame.ruby.pp": "pp() left in code — pretty printing in production?",
"shame.ruby.eval": "eval() detected — dynamic code execution is dangerous",
"shame.ruby.rescueAll": "Bare rescue — catching all exceptions silently",
"shame.ruby.globalVar": "Global variable — shared mutable state is the root of all evil",
```

### Spanish (`src/i18n/es.ts`)

Add the same keys with Spanish translations:

```typescript
// Ruby
"shame.ruby.puts": "puts en el codigo — la migaja de pan del dev Ruby",
"shame.ruby.pp": "pp() en el codigo — pretty printing en produccion?",
"shame.ruby.eval": "eval() detectado — ejecucion de codigo dinamico es peligrosa",
"shame.ruby.rescueAll": "Rescue sin tipo — atrapando todas las excepciones en silencio",
"shame.ruby.globalVar": "Variable global — el estado mutable compartido es la raiz de todo mal",
```

## Step 4: Add to Default Languages

In `package.json`, add the language to the default list:

```json
"codeShamer.enabledLanguages": {
  "default": [
    // ... existing languages ...
    "ruby"
  ]
}
```

Also update the defaults in `src/settings.ts`.

## Step 5: Test

1. Compile: `pnpm run compile`
2. Press `F5` to launch Extension Development Host
3. Open a file in your language
4. Verify that shames appear in:
   -  The sidebar tree view
   -  The Problems panel (diagnostics)
   -  The status bar count

## Step 6: Submit a Pull Request

1. Create a branch: `git checkout -b feature/add-ruby-support`
2. Include all modified files:
   -  `src/engine/rules/ruby.ts` (new)
   -  `src/engine/languageRules.ts` (modified)
   -  `src/scanner/workspaceScanner.ts` (modified)
   -  `src/i18n/en.ts` (modified)
   -  `src/i18n/es.ts` (modified)
   -  `src/settings.ts` (modified)
   -  `package.json` (modified)
3. In your PR description, include:
   -  The language you're adding
   -  List of patterns with explanations
   -  How you tested them

## What Makes a Good Rule?

-  **Actionable** — The developer should know what to do to fix it
-  **Low false positive rate** — Better to miss some cases than flag correct code
-  **Relevant** — The pattern should represent a genuinely bad practice
-  **Funny message** — Keep the tone light and humorous!

## Need Help?

Open an issue with the `new-language` label and we'll help you get started!
