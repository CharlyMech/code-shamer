<div align="start">
  <span>EN</span> | <a href="../es/ARCHITECTURE.md">ES</a> 
</div>

# Architecture & Internal Guide — CodeShamer

This document covers the technical internals of CodeShamer: how the code is structured, how the analysis pipeline works, how CI/CD is configured, and how to add new things.

---

## Project Structure

```
src/
  extension.ts              # Entry point — wires everything together
  settings.ts               # Reads codeShamer.* configuration from VS Code
  statusBar.ts              # Bottom status bar item (emoji + count)
  diagnostics.ts            # Feeds shames into VS Code's Problems panel

  engine/
    types.ts                # Core types: ShamePattern, ShameMatch, FileShameResult, etc.
    shameEngine.ts          # Analyzes a single file → returns ShameMatch[]
    languageRules.ts        # Rule registry: merges language-specific + common rules
    ignoreParser.ts         # Handles `code-shamer-ignore` comments
    rules/
      common.ts             # Cross-language patterns (TODO, FIXME, HACK, XXX)
      javascript.ts         # JS patterns (console.log, var, ==, eval, debugger…)
      typescript.ts         # TS-specific (: any, @ts-ignore…) — added ON TOP of JS
      python.ts             # Python patterns (print, bare except, import *…)
      java.ts               # Java patterns
      cpp.ts                # C++ patterns
      c.ts                  # C patterns
      dart.ts               # Dart patterns
      php.ts                # PHP patterns

  scanner/
    workspaceScanner.ts     # Scans all workspace files, caches results, emits events
    fileCache.ts            # Cache by file mtime — avoids re-analyzing unchanged files

  sidebar/
    shameTreeProvider.ts    # TreeDataProvider for the Activity Bar sidebar
    shameTreeItems.ts       # TreeItem classes (summary, file, match)
    shameHeaderProvider.ts  # Webview header above the tree
    shamePanelProvider.ts   # Full webview panel

  codeActions/
    shameCodeActionProvider.ts  # Quick fixes (var→let, ==→===, remove console.log…)

  roasts/
    shameLevels.ts          # Shame level thresholds, titles, and colors
    roastMessages.ts        # Humorous messages mapped to score ranges

  history/
    shameHistory.ts         # Tracks shame score over time (workspaceState)
    achievements.ts         # Achievement system

  i18n/
    types.ts                # Locale interface definition
    index.ts                # Detects VS Code display language, returns locale
    en.ts                   # English translations (messages, roasts, levels, achievements)
    es.ts                   # Spanish translations
```

---

## How the Analysis Pipeline Works

```
Activation
    │
    ▼
WorkspaceScanner.scanWorkspace()
    │  workspace.findFiles() → filters by enabled languages + excludePatterns
    │
    ▼  for each file
FileCache.get(path, mtime)
    │  cache hit → use cached FileShameResult
    │  cache miss → analyzeFile()
    │
    ▼
shameEngine.analyzeFile(content, languageId, filePath)
    │  1. getRulesForLanguage() → language rules + common rules
    │  2. Filter by disabledRules and severityThreshold
    │  3. getIgnoredLines() → parse code-shamer-ignore comments
    │  4. Per-line scan: test each single-line rule regex
    │  5. Full-content scan: test each multiline rule regex
    │  6. Sum severities → totalScore
    │
    ▼
FileShameResult { filePath, matches[], totalScore }
    │
    ▼  aggregated into WorkspaceShameResult
    ├─► DiagnosticsManager → VS Code Problems panel
    ├─► ShameTreeProvider  → Activity Bar sidebar
    ├─► StatusBar          → emoji + count
    └─► ShameHistory       → history tracking + achievements
```

On file save (`scanOnSave: true`), the saved file is invalidated in the cache and a full re-scan runs.

---

## Shame Score & Levels

Each matched pattern contributes its `severity` (1–5) to the file's `totalScore`. The workspace `totalScore` is the sum across all files.

| Score | Level           |
| ----- | --------------- |
| 0     | Clean Code Guru |
| 5+    | Like a Hacker   |
| 25+   | Seniority Level |
| 75+   | Junior Like     |
| 150+  | Vive Coder      |
| 300+  | Shame Overlord  |

Roast messages are bucketed separately: `< 25` low, `< 75` medium, `< 150` high, `≥ 150` extreme.

---

## Adding a New Rule to an Existing Language

1. Open `src/engine/rules/<language>.ts`
2. Add a `ShamePattern` entry:
   ```typescript
   {
     id: "js-my-rule",           // <lang>-<descriptive-kebab-name>
     pattern: /myRegex/,          // No `g` flag — the engine handles it
     severity: 2,                 // 1 (nitpick) to 5 (critical)
     category: "style",           // security | debug | style | performance | maintenance | reliability
     messageKey: "shame.js.myRule",
   }
   ```
3. Add the message string to `src/i18n/en.ts` and `src/i18n/es.ts`
4. Compile and test: `pnpm run compile`, then `F5`

For multiline patterns (spanning multiple lines), add `multiline: true`. The engine will run them against the full file content with the `g` flag.

---

## Adding a New Language

See [ADDING_LANGUAGES.md](./ADDING_LANGUAGES.md) for a full step-by-step walkthrough.

Summary:

1. Create `src/engine/rules/<lang>.ts` with a `ShamePattern[]` export
2. Register it in `src/engine/languageRules.ts`
3. Add file extensions to `LANG_EXTENSIONS` in `src/scanner/workspaceScanner.ts`
4. Add i18n messages to `en.ts` and `es.ts`
5. Add the language ID to `DEFAULT_LANGUAGES` in `src/settings.ts` and to the `package.json` default array

---

## Adding a Quick Fix

Edit `src/codeActions/shameCodeActionProvider.ts` and add an entry to the `FIXABLE_RULES` map, providing the replacement text or transformation logic.

---

## Adding a New i18n Locale

1. Create `src/i18n/<code>.ts` implementing the `Locale` interface from `src/i18n/types.ts`
2. Copy `src/i18n/en.ts` as the starting point and translate all strings
3. Register the new locale in `src/i18n/index.ts`

---

## Configuration System

All settings use the `codeShamer.*` prefix. They are declared in **two places** — both must be kept in sync:

-  `package.json` → `contributes.configuration.properties` (declares defaults, types, descriptions for VS Code UI)
-  `src/settings.ts` → `getSettings()` and the `CodeShamerSettings` interface (runtime access)

---

## CI/CD

### Branch Strategy

```
feature/feat-xxx  ──PR──►  dev  ──PR──►  main
                             │               │
                      auto-version      auto-publish
                      auto-changelog    marketplace
                                        github release
                                        git tag
```

### Workflows

#### `ci.yml`

**Trigger**: push to `dev`, PR to `dev` or `main` **Does**: lint + compile (+ tests when they exist)

#### `version-bump.yml`

**Trigger**: merge commit to `dev` **Does**: reads the merged branch name, determines bump type by prefix:

| Branch prefix                                   | Bump  |
| ----------------------------------------------- | ----- |
| `chore/*`, `refactor/*`, `perf/*`, `build/*`    | major |
| `feat/*`, `feature/*`, `style/*`                | minor |
| `fix/*`, `docs/*`, `test/*`, `ci/*`, `hotfix/*` | patch |

Commits automatically: `chore: bump version to vX.Y.Z [skip ci]`

#### `publish.yml`

**Trigger**: merge to `main` **Does**:

1. Lint + compile
2. Reads version from `package.json`
3. Packages the VSIX
4. Publishes to VS Code Marketplace
5. Publishes to Open VSX Registry (optional, `continue-on-error`)
6. Creates git tag `vX.Y.Z`
7. Creates GitHub Release with the VSIX as asset and auto-generated changelog
8. Updates `CHANGELOG.md`

### Required Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Where to get it | Purpose |
| --- | --- | --- |
| `GH_PAT` | GitHub → Settings → Developer settings → Fine-grained PAT → `contents: write` | Push version bump and changelog commits |
| `VSCE_PAT` | Azure DevOps → User settings → Personal access tokens → Marketplace > Manage | Publish to VS Code Marketplace |
| `OVSX_PAT` | https://open-vsx.org → User settings → Access tokens | Publish to Open VSX (optional) |

### Commit Convention

The auto-changelog categorizes commits by prefix:

| Prefix                                   | Category                    |
| ---------------------------------------- | --------------------------- |
| `feat:`                                  | New Features                |
| `fix:`, `hotfix:`                        | Bug Fixes                   |
| `docs:`                                  | Documentation               |
| `chore:`, `refactor:`, `perf:`, `build:` | Breaking Changes / Internal |

Use descriptive commit messages for readable changelogs:

```
feat: add Ruby language support with 8 detection rules
fix: false positive on == inside string literals
docs: add screenshot for sidebar panel
```

Commits containing `[skip ci]` do not trigger workflows (prevents loops).

---

## Troubleshooting

**Extension doesn't appear in sidebar** Check that `package.json` has valid `viewsContainers.activitybar` and `views.codeshamer` entries, and that `media/codeshamer-activity.svg` exists.

**No shames detected**

-  Verify the file language is in `codeShamer.enabledLanguages`
-  Check the language ID VS Code reports (bottom bar language indicator)
-  Make sure `codeShamer.enable` is `true`
-  Check that the file path is not matched by `codeShamer.excludePatterns`

**Scan is slow**

-  Reduce `codeShamer.maxFilesToScan`
-  Add patterns to `codeShamer.excludePatterns`
-  Large workspaces take longer on first scan; subsequent scans hit the cache

**TypeScript errors**

-  Run `pnpm install` to ensure all type packages are present
-  Make sure `@types/vscode` version matches `engines.vscode` in `package.json`
