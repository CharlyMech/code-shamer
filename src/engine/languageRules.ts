import { ShamePattern } from "./types";
import { javascriptRules } from "./rules/javascript";
import { typescriptRules } from "./rules/typescript";
import { pythonRules } from "./rules/python";
import { javaRules } from "./rules/java";
import { cppRules } from "./rules/cpp";
import { cRules } from "./rules/c";
import { dartRules } from "./rules/dart";
import { phpRules } from "./rules/php";
import { commonRules } from "./rules/common";

const languageSpecificRules: Record<string, ShamePattern[]> = {
	javascript: javascriptRules,
	javascriptreact: javascriptRules,
	typescript: [...javascriptRules, ...typescriptRules],
	typescriptreact: [...javascriptRules, ...typescriptRules],
	python: pythonRules,
	java: javaRules,
	cpp: cppRules,
	c: cRules,
	dart: dartRules,
	php: phpRules,
};

export function getRulesForLanguage(languageId: string): ShamePattern[] {
	const specific = languageSpecificRules[languageId] ?? [];
	return [...specific, ...commonRules];
}

export function getSupportedLanguages(): string[] {
	return Object.keys(languageSpecificRules);
}
