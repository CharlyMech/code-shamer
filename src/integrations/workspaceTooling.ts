import * as vscode from "vscode";

export interface InstalledTooling {
	eslint: boolean;
	prettier: boolean;
	pylance: boolean;
	python: boolean;
	php: boolean;
	volar: boolean;
	svelte: boolean;
	astro: boolean;
	html: boolean;
	css: boolean;
}

/** Extension IDs that improve language IDs, snippets, and lint overlap with CodeShamer. */
const TOOL_EXTENSION_IDS: Record<keyof InstalledTooling, string[]> = {
	eslint: ["dbaeumer.vscode-eslint"],
	prettier: ["esbenp.prettier-vscode"],
	pylance: ["ms-python.vscode-pylance"],
	python: ["ms-python.python"],
	php: ["bmewburn.vscode-intelephense-client", "xdebug.php-debug"],
	volar: ["Vue.volar"],
	svelte: ["svelte.svelte-vscode"],
	astro: ["astro-build.astro-vscode"],
	html: ["vscode.html-language-features"],
	css: ["vscode.css-language-features"],
};

/** CodeShamer rules commonly covered when ESLint is enabled with recommended rules. */
const ESLINT_OVERLAPPING_RULES = new Set([
	"js-console-log",
	"js-var-usage",
	"js-loose-equality",
	"js-loose-inequality",
	"js-debugger",
	"js-alert",
	"js-eval",
	"js-new-function",
	"js-inner-html",
	"ts-any-type",
	"ts-as-any",
	"ts-ignore",
	"ts-nocheck",
	"ts-non-null-assertion",
]);

const PYLANCE_OVERLAPPING_RULES = new Set([
	"py-print",
	"py-bare-except",
	"py-import-star",
	"py-mutable-default",
	"py-type-ignore",
]);

let cached: InstalledTooling | undefined;

export function getInstalledTooling(): InstalledTooling {
	if (cached) {
		return cached;
	}
	cached = detectInstalledTooling();
	return cached;
}

export function refreshInstalledTooling(): InstalledTooling {
	cached = detectInstalledTooling();
	return cached;
}

function isExtensionActive(id: string): boolean {
	const ext = vscode.extensions.getExtension(id);
	return Boolean(ext?.isActive || ext?.exports);
}

function detectInstalledTooling(): InstalledTooling {
	const result = {} as InstalledTooling;
	for (const key of Object.keys(TOOL_EXTENSION_IDS) as (keyof InstalledTooling)[]) {
		result[key] = TOOL_EXTENSION_IDS[key].some((id) =>
			Boolean(vscode.extensions.getExtension(id))
		);
	}
	return result;
}

export function shouldDeferRuleToInstalledLinter(ruleId: string): boolean {
	const tools = getInstalledTooling();
	if (tools.eslint && ESLINT_OVERLAPPING_RULES.has(ruleId)) {
		return true;
	}
	if (tools.pylance && PYLANCE_OVERLAPPING_RULES.has(ruleId)) {
		return true;
	}
	return false;
}

export function linterHintForRule(ruleId: string): string | undefined {
	const tools = getInstalledTooling();
	if (tools.eslint && ESLINT_OVERLAPPING_RULES.has(ruleId)) {
		return "ESLint will bully you about this too — align eslint.config.* so we don't roast twice.";
	}
	if (tools.pylance && PYLANCE_OVERLAPPING_RULES.has(ruleId)) {
		return "Pylance is probably already side-eyeing this line in Problems.";
	}
	if (tools.php && ruleId.startsWith("php-")) {
		return "Intelephense may pile on — install it if you enjoy constructive suffering.";
	}
	if (tools.volar && (ruleId.startsWith("vue-") || ruleId.startsWith("ts-"))) {
		return "Volar can nag you harder on Vue templates — let the pros handle template sins.";
	}
	return undefined;
}

export function missingLanguageExtensions(
	languageId: string
): string[] {
	const tools = getInstalledTooling();
	const missing: string[] = [];
	switch (languageId) {
		case "vue":
			if (!tools.volar) {
				missing.push("Vue.volar");
			}
			break;
		case "svelte":
			if (!tools.svelte) {
				missing.push("svelte.svelte-vscode");
			}
			break;
		case "astro":
			if (!tools.astro) {
				missing.push("astro-build.astro-vscode");
			}
			break;
		case "python":
			if (!tools.python) {
				missing.push("ms-python.python");
			}
			break;
		case "php":
			if (!tools.php) {
				missing.push("bmewburn.vscode-intelephense-client");
			}
			break;
		default:
			break;
	}
	return missing;
}

export async function suggestMissingToolingOnce(
	context: vscode.ExtensionContext
): Promise<void> {
	const key = "codeShamer.toolingPrompted";
	if (context.globalState.get<boolean>(key)) {
		return;
	}
	const tools = getInstalledTooling();
	const gaps: string[] = [];
	if (!tools.eslint) {
		gaps.push("ESLint (dbaeumer.vscode-eslint)");
	}
	if (!tools.volar) {
		gaps.push("Vue - Official (Vue.volar)");
	}
	if (!tools.svelte) {
		gaps.push("Svelte (svelte.svelte-vscode)");
	}
	if (!tools.astro) {
		gaps.push("Astro (astro-build.astro-vscode)");
	}
	if (gaps.length === 0) {
		await context.globalState.update(key, true);
		return;
	}
	const pick = await vscode.window.showInformationMessage(
		`CodeShamer roasts better with real language tooling installed: ${gaps.slice(0, 3).join(", ")}${gaps.length > 3 ? "…" : ""}.`,
		"Show recommendations",
		"Dismiss"
	);
	if (pick === "Show recommendations") {
		await vscode.commands.executeCommand(
			"workbench.extensions.action.showRecommendedExtensions"
		);
	}
	await context.globalState.update(key, true);
}

export function findOverlappingExternalDiagnostic(
	uri: vscode.Uri,
	range: vscode.Range,
	ruleId: string
): vscode.Diagnostic | undefined {
	if (!shouldDeferRuleToInstalledLinter(ruleId)) {
		return undefined;
	}
	const all = vscode.languages.getDiagnostics(uri);
	for (const diag of all) {
		if (diag.source === "CodeShamer" || !diag.source) {
			continue;
		}
		if (!rangesOverlap(diag.range, range)) {
			continue;
		}
		const src = diag.source.toLowerCase();
		if (src.includes("eslint") || src.includes("pylance") || src.includes("pyright")) {
			return diag;
		}
	}
	return undefined;
}

function rangesOverlap(a: vscode.Range, b: vscode.Range): boolean {
	return !(
		a.end.isBefore(b.start) ||
		b.end.isBefore(a.start)
	);
}
