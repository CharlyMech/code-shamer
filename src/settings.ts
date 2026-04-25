import * as vscode from "vscode";

export interface CodeShamerSettings {
	enabled: boolean;
	enableRoasts: boolean;
	showStartupNotifications: boolean;
	showAchievementNotifications: boolean;
	showScanCompletionStatusMessage: boolean;
	showStatusBarOnlyWhileScanning: boolean;
	enabledLanguages: string[];
	severityThreshold: 1 | 2 | 3 | 4 | 5;
	excludePatterns: string[];
	scanOnSave: boolean;
	maxFilesToScan: number;
	disabledRules: string[];
	inlineShameUnderlineColors: Record<string, string>;
}

const DEFAULT_LANGUAGES = [
	"javascript",
	"javascriptreact",
	"typescript",
	"typescriptreact",
	"python",
	"java",
	"cpp",
	"c",
	"dart",
	"php",
	"html",
	"css",
];

export function getSettings(): CodeShamerSettings {
	const config = vscode.workspace.getConfiguration("codeShamer");

	return {
		enabled: config.get<boolean>("enable", true),
		enableRoasts: config.get<boolean>("enableRoasts", true),
		showStartupNotifications: config.get<boolean>(
			"showStartupNotifications",
			true
		),
		showAchievementNotifications: config.get<boolean>(
			"showAchievementNotifications",
			true
		),
		showScanCompletionStatusMessage: config.get<boolean>(
			"showScanCompletionStatusMessage",
			true
		),
		showStatusBarOnlyWhileScanning: config.get<boolean>(
			"showStatusBarOnlyWhileScanning",
			false
		),
		enabledLanguages: config.get<string[]>(
			"enabledLanguages",
			DEFAULT_LANGUAGES
		),
		severityThreshold: config.get<1 | 2 | 3 | 4 | 5>(
			"severityThreshold",
			1
		),
		excludePatterns: config.get<string[]>("excludePatterns", [
			// Package managers & dependencies
			"**/node_modules/**",
			"**/vendor/**",
			"**/.pnp/**",

			// Build outputs
			"**/dist/**",
			"**/build/**",
			"**/out/**",
			"**/.output/**",
			"**/.vercel/**",
			"**/.netlify/**",

			// Framework generated dirs
			"**/.astro/**",
			"**/.next/**",
			"**/.nuxt/**",
			"**/.svelte-kit/**",
			"**/.remix/**",
			"**/.solid/**",
			"**/.expo/**",
			"**/.angular/**",
			"**/.gatsby/**",
			"**/.docusaurus/**",
			"**/.storybook-out/**",

			// Cache dirs
			"**/.cache/**",
			"**/.turbo/**",
			"**/.parcel-cache/**",
			"**/.rollup.cache/**",
			"**/.vite/**",
			"**/.esbuild/**",
			"**/.webpack/**",

			// Testing & coverage
			"**/coverage/**",
			"**/.nyc_output/**",

			// VCS
			"**/.git/**",
			"**/.svn/**",
			"**/.hg/**",

			// IDE & tool dirs
			"**/.claude/**",
			"**/.cursor/**",
			"**/.idea/**",
			"**/.vscode-test/**",
			"**/.devcontainer/**",

			// Minified files
			"**/*.min.js",
			"**/*.min.css",

			// Misc generated
			"**/.terraform/**",
			"**/__pycache__/**",
			"**/.pytest_cache/**",
			"**/.mypy_cache/**",
			"**/.ruff_cache/**",
			"**/.tox/**",
		]),
		scanOnSave: config.get<boolean>("scanOnSave", true),
		maxFilesToScan: config.get<number>("maxFilesToScan", 5000),
		disabledRules: config.get<string[]>("disabledRules", []),
		inlineShameUnderlineColors: config.get<Record<string, string>>(
			"inlineShameUnderlineColors",
			{
				"1": "#E5C07B",
				"2": "#E5B567",
				"3": "#E59F5A",
				"4": "#E06C75",
				"5": "#BE5046",
			}
		),
	};
}
