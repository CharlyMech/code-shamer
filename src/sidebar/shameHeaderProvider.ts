import * as vscode from "vscode";
import { WorkspaceShameResult } from "../engine/types";
import { getShameLevel } from "../roasts/shameLevels";
import { getRandomRoastKey } from "../roasts/roastMessages";
import { getLocale } from "../i18n";

export class ShameHeaderProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = "codeshamer.headerView";

	private _view?: vscode.WebviewView;
	private _result?: WorkspaceShameResult;
	private _extensionUri: vscode.Uri;

	constructor(extensionUri: vscode.Uri) {
		this._extensionUri = extensionUri;
	}

	resolveWebviewView(webviewView: vscode.WebviewView): void {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: false,
			localResourceRoots: [
				vscode.Uri.joinPath(this._extensionUri, "media"),
			],
		};

		this._updateWebview();
	}

	update(result: WorkspaceShameResult): void {
		this._result = result;
		this._updateWebview();
	}

	setLoading(): void {
		this._result = undefined;
		if (this._view) {
			this._view.webview.html = this._getLoadingHtml();
		}
	}

	private _updateWebview(): void {
		if (!this._view) {
			return;
		}

		if (!this._result) {
			this._view.webview.html = this._getLoadingHtml();
			return;
		}

		this._view.webview.html = this._getHtml(this._result);
	}

	private _getLoadingHtml(): string {
		return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
	body { display: flex; align-items: center; justify-content: center; height: 100px; margin: 0; font-family: var(--vscode-font-family); color: var(--vscode-foreground); }
	.loading { opacity: 0.7; font-size: 13px; }
</style>
</head>
<body><div class="loading">Scanning workspace...</div></body>
</html>`;
	}

	private _getHtml(result: WorkspaceShameResult): string {
		const level = getShameLevel(result.totalScore);
		const locale = getLocale();
		const levelTitle = locale.levels[level.titleKey] ?? level.titleKey;

		const roastKey = getRandomRoastKey(result.totalScore);
		const roastMessage = locale.roasts[roastKey] ?? "";

		const imageUri = this._view!.webview.asWebviewUri(
			vscode.Uri.joinPath(
				this._extensionUri,
				"media",
				"shames",
				`${level.imageIndex}.png`
			)
		);

		return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body {
		font-family: var(--vscode-font-family);
		color: var(--vscode-foreground);
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 8px;
	}
	.image-container {
		width: 120px;
		height: 120px;
		border-radius: 12px;
		overflow: hidden;
		border: 3px solid ${level.color};
		box-shadow: 0 0 12px ${level.color}40;
	}
	.image-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.level-title {
		font-size: 16px;
		font-weight: 700;
		color: ${level.color};
		margin-top: 4px;
	}
	.stats {
		font-size: 12px;
		opacity: 0.8;
	}
	.roast {
		font-size: 12px;
		font-style: italic;
		opacity: 0.7;
		max-width: 280px;
		line-height: 1.4;
		margin-top: 2px;
	}
	.divider {
		width: 80%;
		height: 1px;
		background: var(--vscode-panel-border);
		margin-top: 4px;
	}
</style>
</head>
<body>
	<div class="image-container">
		<img src="${imageUri}" alt="${levelTitle}" />
	</div>
	<div class="level-title">${level.emoji} ${this._escapeHtml(levelTitle)}</div>
	<div class="stats">${result.totalScore} pts | ${result.totalShames} shames | ${result.files.filter(f => f.matches.length > 0).length} files</div>
	<div class="roast">"${this._escapeHtml(roastMessage)}"</div>
	<div class="divider"></div>
</body>
</html>`;
	}

	private _escapeHtml(text: string): string {
		return text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}
}
