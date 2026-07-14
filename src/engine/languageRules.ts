import { ShamePattern } from "./types";
import { javascriptRules } from "./rules/javascript";
import { typescriptRules } from "./rules/typescript";
import { pythonRules } from "./rules/python";
import { htmlRules } from "./rules/html";
import { cssRules } from "./rules/css";
import { phpRules } from "./rules/php";
import { vueRules } from "./rules/vue";
import { svelteRules } from "./rules/svelte";
import { astroRules } from "./rules/astro";
import { angularRules } from "./rules/angular";
import { commonRules } from "./rules/common";

const angularAugment = [...angularRules];

const languageSpecificRules: Record<string, ShamePattern[]> = {
	javascript: [...javascriptRules, ...angularAugment],
	javascriptreact: [...javascriptRules, ...angularAugment],
	typescript: [...javascriptRules, ...typescriptRules, ...angularAugment],
	typescriptreact: [...javascriptRules, ...typescriptRules, ...angularAugment],
	python: pythonRules,
	php: phpRules,
	html: [...htmlRules, ...angularAugment],
	css: cssRules,
	vue: vueRules,
	svelte: svelteRules,
	astro: astroRules,
};

export function getRulesForLanguage(languageId: string): ShamePattern[] {
	const specific = languageSpecificRules[languageId] ?? [];
	return [...specific, ...commonRules];
}

export function getSupportedLanguages(): string[] {
	return Object.keys(languageSpecificRules);
}
