import { ShameMatch } from "../types";

export type FixSafety = "safe" | "review";

export type FixKind =
	| "replace"
	| "removeLine"
	| "wrapLine"
	| "noOp";

export interface FixRegistryEntry {
	ruleId: string;
	safety: FixSafety;
	kind: FixKind;
	titleKey: string;
	hintKey?: string;
	transform?: (lineText: string, match: ShameMatch) => string | null;
}

export interface RecommendedFix {
	ruleId: string;
	titleKey: string;
	safety: FixSafety;
	kind: FixKind;
	fixedText?: string;
	hintKey?: string;
}
