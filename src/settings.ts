import * as vscode from "vscode";

export interface CodeShamerSettings {
	enabled: boolean;
	enableRoasts: boolean;
	enabledLanguages: string[];
	severityThreshold: 1 | 2 | 3 | 4 | 5;
	excludePatterns: string[];
	scanOnSave: boolean;
	maxFilesToScan: number;
	disabledRules: string[];
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
];

export function getSettings(): CodeShamerSettings {
	const config = vscode.workspace.getConfiguration("codeShamer");

	return {
		enabled: config.get<boolean>("enable", true),
		enableRoasts: config.get<boolean>("enableRoasts", true),
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
	};
}
