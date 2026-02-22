import * as vscode from "vscode";
import { WorkspaceScanner } from "./scanner/workspaceScanner";
import { getShameLevel } from "./roasts/shameLevels";
import { getLocale } from "./i18n";

export interface StatusBarHandle {
	setLoading(): void;
	setText(text: string, tooltip: string): void;
}

export function createStatusBar(
	context: vscode.ExtensionContext,
	scanner: WorkspaceScanner
): StatusBarHandle {
	const locale = getLocale();

	const item = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		100
	);

	item.command = "code-shamer.showPanel";
	item.text = "$(flame) CodeShamer";
	item.tooltip = locale.noCode;
	item.show();
	context.subscriptions.push(item);

	scanner.onDidScanComplete((result) => {
		const level = getShameLevel(result.totalScore);
		item.text = `${level.emoji} ${result.totalShames}`;
		item.tooltip = locale.scanComplete(
			result.files.length,
			result.totalShames
		);
	});

	return {
		setLoading() {
			item.text = "$(loading~spin) Scanning...";
			item.tooltip = locale.scanning;
		},
		setText(text: string, tooltip: string) {
			item.text = text;
			item.tooltip = tooltip;
		},
	};
}
