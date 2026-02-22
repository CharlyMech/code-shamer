# Changelog

All notable changes to CodeShamer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.0.1] - 2026-02-22

### Added

-  Workspace-wide analysis with file caching and background scanning
-  Activity bar sidebar with full shame report (tree view)
-  VSCode Diagnostics integration — shames appear in the Problems panel
-  Clickable shame references — navigate directly to the offending line
-  80+ detection patterns across 8 languages (JS, TS, Python, Java, C, C++, Dart, PHP)
-  Pattern categories: security, debug, style, performance, maintenance, reliability
-  Severity levels 1-5 for each pattern
-  Quick fixes for common issues (var→let, ==→===, remove debugger)
-  Ignore comments: `// code-shamer-ignore` and `// code-shamer-ignore-next-line`
-  Shame levels with titles: Clean Code Guru, Apprentice Hacker, Code Rebel, Chaos Engineer, Legacy Lord, Shame Overlord
-  Humorous roast messages based on shame score
-  Shame history tracking per workspace (improving/worsening/stable trend)
-  Achievement system: First Glance, First Fix!, Halfway There!, Clean Slate, Persistent Improver
-  Configurable severity threshold, exclude patterns, disabled rules
-  Auto-scan on save (configurable)
-  Full i18n support: English and Spanish
-  Status bar with loading indicator and shame count

## [0.0.1] - 2025-XX-XX

### Added

-  Initial prototype with basic console.log and TODO detection
-  Status bar shame counter
-  Support for 8 programming languages
