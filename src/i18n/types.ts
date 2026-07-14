export interface UiStrings {
	scanningWorkspace: string;
	noShamesYet: string;
	noShamesInFile: string;
	cacheCleared: string;
	ruleDisabled: (ruleId: string) => string;
	statusBarScanning: string;
	statusBarTooltip: string;
	achievementBanner: (title: string) => string;
	codeActionIgnoreLine: string;
	codeActionIgnoreFile: string;
	codeActionDisableWorkspace: (ruleId: string) => string;
	panelHeaderTitle: (totalShames: number, fileCount: number) => string;
	scanningStatusMessage: string;
	scanCompletedStatusMessage: (files: number, shames: number) => string;
}

export interface Locale {
	id: string;
	disabled: string;
	languageDisabled: string;
	noCode: string;
	scanning: string;
	scanComplete: (files: number, shames: number) => string;
	shameTooltip: (score: number) => string;
	details: (score: number, roast: string) => string;
	shameMessage: (messageKey: string) => string;
	hintMessage: (hintKey: string) => string;
	t: (key: string) => string;
	ui: UiStrings;
	messages: Record<string, string>;
	roasts: Record<string, string>;
	levels: Record<string, string>;
	achievements: Record<string, string>;
	fixes: Record<string, string>;
	hints: Record<string, string>;
}
