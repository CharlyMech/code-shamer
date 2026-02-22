<div align="start">
  <span>EN</span> | <a href="../es/GETTING_STARTED.md">ES</a> 
</div>

# Getting Started — Using CodeShamer Locally

This guide explains how to run and use CodeShamer in your VS Code **without publishing to the Marketplace**. You'll run it directly from source using the VS Code Extension Development Host.

---

## Prerequisites

-  [VS Code](https://code.visualstudio.com/) 1.109.0 or later
-  [Node.js](https://nodejs.org/) 18+
-  [pnpm](https://pnpm.io/) — install with `npm install -g pnpm`

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/charlymech/code-shamer.git
cd code-shamer
```

---

## Step 2 — Install Dependencies

```bash
pnpm install
```

---

## Step 3 — Build the Extension

```bash
pnpm run compile
```

---

## Step 4 — Launch the Extension Development Host

Open the project folder in VS Code, then press **`F5`**.

A new VS Code window will open — this is the **Extension Development Host**, a sandboxed VS Code instance with CodeShamer already loaded and active.

---

## Step 5 — Open a Project and Start Shaming

1. In the Extension Development Host window, open any project folder (`File → Open Folder`) that uses the languages you want to analyse (JS, TS, Python, etc.)
2. CodeShamer will automatically scan the workspace on startup
3. Look for the **flame icon** in the Activity Bar (left sidebar) — click it to open the Shame Report

That's it. CodeShamer is now watching your code.

> **Tip:** If you make changes to the extension source, save the file (with `pnpm run compile` or `pnpm run watch` running), then press `Ctrl+Shift+F5` / `Cmd+Shift+F5` in the main window to reload the Extension Development Host.

---

## What You'll See

### Activity Bar — Shame Report

Click the flame icon to open the panel. It shows:

-  Your **shame level** (from "Clean Code Guru" to "Shame Overlord")
-  A **breakdown by category** (debug, security, style, reliability…)
-  A **file-by-file list** of all detected issues
-  Click any item to **jump directly to the offending line**

### Status Bar (Bottom)

The bottom bar shows your emoji level and total shame count. Click it to open the Shame Report panel.

### Problems Panel

All shames also appear in VS Code's Problems panel (`Ctrl+Shift+M` / `Cmd+Shift+M`), just like any other linter. Click any entry to navigate to the line.

### Quick Fixes

For some patterns, CodeShamer offers one-click fixes. Place your cursor on a flagged line and press `Ctrl+.` / `Cmd+.`:

-  `var` → `let`
-  `==` → `===`
-  `!=` → `!==`
-  Remove `debugger` statements
-  Remove `console.log()` calls

---

## Ignoring Specific Lines

If CodeShamer flags something intentional, suppress it with a comment:

```javascript
// code-shamer-ignore-next-line
console.log("intentional debug output");

eval(trustedCode); // code-shamer-ignore
```

Works in all supported languages using the appropriate comment syntax (`//`, `#`, `--`).

---

## Configuration

Open VS Code Settings (`Ctrl+,` / `Cmd+,`) and search for **CodeShamer**.

| Setting | Default | Description |
| --- | --- | --- |
| `codeShamer.enable` | `true` | Enable or disable the extension |
| `codeShamer.enableRoasts` | `true` | Show humorous roast messages after scans |
| `codeShamer.enabledLanguages` | all | Languages to analyse |
| `codeShamer.severityThreshold` | `1` | Minimum severity to report (1 = everything, 5 = critical only) |
| `codeShamer.excludePatterns` | see below | Glob patterns for paths to skip |
| `codeShamer.scanOnSave` | `true` | Re-scan when you save a file |
| `codeShamer.maxFilesToScan` | `5000` | Maximum files per workspace scan |
| `codeShamer.disabledRules` | `[]` | Rule IDs to silence entirely |

### Disabling Specific Rules

Add rule IDs to `codeShamer.disabledRules` in your `settings.json`:

```json
{
	"codeShamer.disabledRules": ["common-todo", "js-console-log"]
}
```

Rule IDs are shown in the Problems panel and in the Shame Report sidebar.

### Excluded Paths

By default, CodeShamer ignores generated and dependency directories: `node_modules`, `dist`, `build`, `.astro`, `.next`, `.nuxt`, `.svelte-kit`, `.cache`, `.turbo`, `.git`, `.claude`, `.cursor`, and more.

You can add your own:

```json
{
	"codeShamer.excludePatterns": [
		"**/node_modules/**",
		"**/my-generated-dir/**"
	]
}
```

> **Note:** Setting `excludePatterns` in your workspace settings **replaces** the defaults entirely. Copy the full default list first if you want to extend it rather than replace it.

---

## Keeping Up to Date

To get a newer version, pull and recompile:

```bash
git pull origin main
pnpm install
pnpm run compile
```

Then press `F5` again to relaunch the Extension Development Host.

---

## Troubleshooting

**The flame icon doesn't appear in the Activity Bar** Reload VS Code (`Ctrl+Shift+P` → `Developer: Reload Window`). If it still doesn't appear, check that the extension is listed as enabled in the Extensions panel.

**No shames are detected**

-  Make sure the file's language is in `codeShamer.enabledLanguages`
-  Check that `codeShamer.enable` is `true`
-  Verify the file isn't matched by an `excludePatterns` entry
-  Try running `CodeShamer: Scan Workspace` from the Command Palette

**Too many or too few shames** Raise the `codeShamer.severityThreshold` (e.g. to `3`) to only see medium-and-above severity issues. Or disable specific noisy rules with `codeShamer.disabledRules`.

**Scan is slow** Reduce `codeShamer.maxFilesToScan` or add large generated directories to `codeShamer.excludePatterns`. The first scan of a large workspace takes longer; subsequent scans use the cache and are much faster.
