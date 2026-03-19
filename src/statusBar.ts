import * as vscode from "vscode";
import { WorkspaceScanner } from "./scanner/workspaceScanner";
import { getLocale } from "./i18n";
import { getShameLevel } from "./roasts/shameLevels";

export interface StatusBarHandle {
	setLoading(): void;
	setText(text: string, tooltip: string | vscode.MarkdownString): void;
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
	item.text = "$(circle-filled) CodeShamer";
	item.tooltip = locale.noCode;
	item.show();

	context.subscriptions.push(item);

	scanner.onDidScanComplete((result) => {
		const level = getShameLevel(result.totalShames);
		
		item.text = `$(circle-filled) ${result.totalShames} shames`;
		item.color = undefined;

		const title = locale.levels[level.titleKey] ?? level.titleKey;
		const imageUri = vscode.Uri.joinPath(
			context.extensionUri,
			"media",
			"shames",
			`${level.imageIndex}.png`
		);

		const tooltip = new vscode.MarkdownString();
		tooltip.supportHtml = true;
		tooltip.isTrusted = true;
		
		tooltip.appendMarkdown(`<p align="center"><img src="${imageUri.toString()}" width="150" /></p>\n\n`);
		tooltip.appendMarkdown(`## <span style="color:${level.color};">${level.emoji} ${title}</span>\n\n`);
		
		const infectedFiles = result.files.filter(f => f.matches.length > 0).length;
		tooltip.appendMarkdown(`**${result.totalShames} shames** in **${infectedFiles} files**\n\n`);
		tooltip.appendMarkdown(`*Skipped ${result.skippedShames} ignored shames*`);

		item.tooltip = tooltip;
	});

	return {
		setLoading() {
			item.text = `$(sync~spin) ${locale.scanning}`;
			item.color = undefined;
			item.tooltip = locale.scanning;
		},
		setText(text: string, tooltip: string | vscode.MarkdownString) {
			item.text = text;
			item.tooltip = tooltip;
		},
	};
}
