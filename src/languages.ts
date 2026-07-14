/** Language IDs CodeShamer analyzes (keep in sync with package.json editor/title when clauses). */
export const CODE_SHAMER_LANGUAGE_IDS = [
	"javascript",
	"javascriptreact",
	"typescript",
	"typescriptreact",
	"python",
	"php",
	"html",
	"css",
	"vue",
	"svelte",
	"astro",
] as const;

export type CodeShamerLanguageId = (typeof CODE_SHAMER_LANGUAGE_IDS)[number];

const LANGUAGE_ID_SET = new Set<string>(CODE_SHAMER_LANGUAGE_IDS);

/** Regex fragment for VS Code menu `when` clauses (resourceLangId =~ /(...)/). */
export const CODE_SHAMER_LANG_WHEN_REGEX =
	CODE_SHAMER_LANGUAGE_IDS.join("|");

export function isCodeShamerLanguage(languageId: string): boolean {
	return LANGUAGE_ID_SET.has(languageId);
}
