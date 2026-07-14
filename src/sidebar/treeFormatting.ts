import * as vscode from "vscode";

/** Max primary label length so VS Code can place description (e.g. L33) on the far right. */
const MATCH_PREVIEW_MAX = 32;

export function formatMatchPreview(lineText: string): string {
	const raw = lineText.trim();
	if (!raw) {
		return "(empty line)";
	}
	if (raw.length <= MATCH_PREVIEW_MAX) {
		return raw;
	}
	return `${raw.slice(0, MATCH_PREVIEW_MAX - 1)}…`;
}

export function formatLineDescription(line: number): string {
	return `L${line + 1}`;
}

export function severityTreeIcon(severity: number): vscode.ThemeIcon {
	if (severity >= 4) {
		return new vscode.ThemeIcon(
			"error",
			new vscode.ThemeColor("errorForeground")
		);
	}
	if (severity >= 2) {
		return new vscode.ThemeIcon(
			"warning",
			new vscode.ThemeColor("editorWarning.foreground")
		);
	}
	return new vscode.ThemeIcon(
		"info",
		new vscode.ThemeColor("editorInfo.foreground")
	);
}
