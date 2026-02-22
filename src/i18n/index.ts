import * as vscode from "vscode";
import type { Locale } from "./types";
import en from "./en";
import es from "./es";

export type { Locale };

export function getLocale(): Locale {
	const lang = vscode.env.language;

	if (lang.startsWith("es")) {
		return es;
	}

	return en;
}
