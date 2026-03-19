export type ShameCategory =
	| "security"
	| "debug"
	| "style"
	| "performance"
	| "maintenance"
	| "reliability";

export interface ShamePattern {
	id: string;
	pattern: RegExp;
	severity: 1 | 2 | 3 | 4 | 5;
	category: ShameCategory;
	messageKey: string;
	multiline?: boolean;
	fixTemplate?: string;
}

export interface ShameMatch {
	pattern: ShamePattern;
	line: number;
	column: number;
	lineText: string;
	filePath: string;
}

export interface FileShameResult {
	filePath: string;
	languageId: string;
	matches: ShameMatch[];
	skippedShames: number;
}

export interface WorkspaceShameResult {
	files: FileShameResult[];
	totalShames: number;
	skippedShames: number;
	byCategory: Record<ShameCategory, number>;
	bySeverity: Record<number, number>;
	timestamp: number;
}

