<div align="start">
  <span>EN</span> | <a href="../es/CONTRIBUTING.md">ES</a> 
</div>

# Contributing to CodeShamer

Thank you for your interest in contributing! CodeShamer is built by developers who got tired of reviewing the same bad patterns over and over. Here's how you can help make it better.

---

## Table of Contents

-  [Code of Conduct](#code-of-conduct)
-  [Ways to Contribute](#ways-to-contribute)
-  [Reporting Issues](#reporting-issues)
-  [Submitting Pull Requests](#submitting-pull-requests)
-  [Adding Your Favourite Language](#adding-your-favourite-language)
-  [Development Setup](#development-setup)
-  [Code Style](#code-style)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it. Please report unacceptable behaviour to the repository maintainers via GitHub Issues.

---

## Ways to Contribute

-  **Report a bug** — found a false positive, a missed pattern, or something broken?
-  **Suggest a rule** — know a bad pattern we're not catching yet?
-  **Add a language** — CodeShamer doesn't support your stack? Add it!
-  **Improve messages** — make the roasts funnier or the shame descriptions clearer
-  **Add a translation** — bring CodeShamer to a new language (i18n)
-  **Fix a bug** — pick an open issue and go for it
-  **Improve docs** — something unclear? Make it clearer

---

## Reporting Issues

Use [GitHub Issues](https://github.com/charlymech/code-shamer/issues) and include:

**For bugs:**

-  VS Code version
-  CodeShamer version
-  Steps to reproduce
-  Expected vs actual behaviour
-  The code snippet that triggered the issue (if applicable)

**For false positives** (something flagged that shouldn't be):

-  The rule ID (visible in the Problems panel or sidebar)
-  The code snippet
-  Why it shouldn't be flagged

**For missing rules / feature requests:**

-  Use the `enhancement` label
-  Describe the bad pattern, why it's harmful, and an example
-  Mention which language(s) it applies to

---

## Submitting Pull Requests

1. **Fork** the repository and clone your fork:

   ```bash
   git clone https://github.com/charlymech/code-shamer.git
   cd code-shamer
   ```

2. **Install dependencies** and compile:

   ```bash
   pnpm install
   pnpm run compile
   ```

3. **Create a branch** from `dev` (not `main`):

   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feat/add-ruby-support
   ```

   Use the prefixes the CI understands: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`

4. **Make your changes**, following the [Code Style](#code-style) guidelines.

5. **Verify** everything works:

   ```bash
   pnpm run compile   # Must compile without errors
   pnpm run lint      # Must pass linting
   ```

   Then press `F5` in VS Code to test in the Extension Development Host.

6. **Commit** using descriptive messages:

   ```
   feat: add Ruby language support with 8 detection rules
   fix: false positive on == inside string literals
   docs: clarify ignore comment syntax
   ```

7. **Open a PR** targeting the `dev` branch with:
   -  A clear title
   -  What changed and why
   -  Screenshots if it affects the UI

> PRs to `main` are only for release merges from `dev`. Regular contributions always go to `dev`.

---

## Adding Your Favourite Language

Want CodeShamer to support Rust, Go, Ruby, Swift, Kotlin, or any other language? We'd love that.

See [ADDING_LANGUAGES.md](./ADDING_LANGUAGES.md) for the full step-by-step guide. It covers:

-  Creating the rule file
-  Registering the language
-  Adding file extensions
-  Writing i18n messages
-  Testing it end to end

The guide uses Ruby as a worked example, but the steps are identical for any language.

**Before starting**, open an issue to discuss the language you want to add — to avoid duplicate work and to agree on which rules make sense.

---

## Development Setup

**Prerequisites:**

-  [Node.js](https://nodejs.org/) 18+
-  [pnpm](https://pnpm.io/)
-  [VS Code](https://code.visualstudio.com/) 1.109.0+

```bash
# Install dependencies
pnpm install

# Compile
pnpm run compile

# Watch mode (auto-recompile on save)
pnpm run watch

# Launch Extension Development Host
# → Open the project in VS Code and press F5
```

For a detailed guide on testing locally (what to check, how to debug, test file snippets), see [GETTING_STARTED.md](./GETTING_STARTED.md) — it's written for end users but the local VSIX testing section is equally useful for contributors.

For architecture internals (how the analysis pipeline works, how CI/CD is configured), see [ARCHITECTURE.md](./ARCHITECTURE.md).

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `pnpm run compile` | Build the extension               |
| `pnpm run watch`   | Build and watch for changes       |
| `pnpm run lint`    | Run ESLint                        |
| `pnpm run test`    | Run tests                         |
| `pnpm run package` | Create production build           |
| `F5` in VS Code    | Launch Extension Development Host |

---

## Code Style

-  **TypeScript** with strict mode enabled
-  **Tabs** for indentation
-  **Semicolons** required
-  Use `===` over `==`
-  Curly braces required for all control flow blocks
-  camelCase for variables and functions, PascalCase for types and classes
-  Rule IDs follow the pattern `<lang>-<descriptive-kebab-name>` (e.g. `js-empty-catch`, `py-bare-except`)

By contributing, you agree that your contributions will be licensed under the [MIT License](../../LICENSE).
