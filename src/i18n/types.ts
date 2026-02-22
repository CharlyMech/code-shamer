export interface Locale {
	disabled: string;
	languageDisabled: string;
	noCode: string;
	scanning: string;
	scanComplete: (files: number, shames: number) => string;
	shameTooltip: (score: number) => string;
	details: (score: number, roast: string) => string;
	shameMessage: (messageKey: string) => string;
	messages: Record<string, string>;
	roasts: Record<string, string>;
	levels: Record<string, string>;
	achievements: Record<string, string>;
}
