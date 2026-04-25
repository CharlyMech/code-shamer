import * as vscode from "vscode";
import { WorkspaceShameResult, FileShameResult } from "../engine/types";
import { getShameLevel } from "../roasts/shameLevels";
import { getRandomRoastKey } from "../roasts/roastMessages";
import { getLocale } from "../i18n";

export interface TreeNode {
	name: string;
	path: string;
	isDirectory: boolean;
	matchesCount: number;
	children: Map<string, TreeNode>;
	fileResult?: FileShameResult;
}

export class ShamePanelProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = "codeshamer.panelView";

	private _view?: vscode.WebviewView;
	private _result?: WorkspaceShameResult;
	private _extensionUri: vscode.Uri;

	constructor(extensionUri: vscode.Uri) {
		this._extensionUri = extensionUri;
	}

	resolveWebviewView(webviewView: vscode.WebviewView): void {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "media")],
		};

		webviewView.webview.onDidReceiveMessage((msg) => {
			if (msg.type === "openFile") {
				const uri = vscode.Uri.file(msg.filePath);
				const line = msg.line ?? 0;
				vscode.window.showTextDocument(uri, {
					selection: new vscode.Range(line, 0, line, 0),
				});
			} else if (msg.type === "openDiff") {
				const uri = vscode.Uri.file(msg.filePath);
				vscode.commands.executeCommand("code-shamer.scanCurrentFile", uri);
			}
		});

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
<html><head><meta charset="UTF-8">
<style>
body { display:flex; align-items:center; justify-content:center; height:100vh; margin:0;
  font-family:var(--vscode-font-family); color:var(--vscode-foreground); background:var(--vscode-sideBar-background); }
.loading { opacity:.7; font-size:13px; }
</style></head>
<body><div class="loading">Scanning workspace...</div></body></html>`;
	}

	private _getHtml(result: WorkspaceShameResult): string {
		const level = getShameLevel(result.totalShames);
		const locale = getLocale();
		const levelTitle = locale.levels[level.titleKey] ?? level.titleKey;
		const roastKey = getRandomRoastKey(result.totalShames);
		const roastMessage = locale.roasts[roastKey] ?? "";

		const imageUri = this._view!.webview.asWebviewUri(
			vscode.Uri.joinPath(
				this._extensionUri,
				"media",
				"shames",
				`${level.imageIndex}.png`
			)
		);

		const filesWithShames = result.files.filter((f) => f.matches.length > 0);
		return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  font-family: var(--vscode-font-family);
  font-size: 12px;
  color: var(--vscode-foreground);
  background: var(--vscode-sideBar-background);
  display: flex;
  flex-direction: column;
}

/* === FLOATING CARD HEADER === */
.header-wrapper {
  width: 100%;
  padding: 0;
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}
.floating-card {
  width: 100%;
  min-width: 260px;
  max-width: 480px;
  height: 120px;
  background: var(--vscode-editorWidget-background);
  border: 1px solid var(--vscode-widget-border);
  border-radius: 12px;
  padding: 5px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 12px;
}
.banner-image {
  width: 110px;
  border-radius: 6px;
  border: 1.5px solid ${level.color};
  object-fit: cover;
  flex-shrink: 0;
}
.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding: 4px 6px 4px 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2px;
}
.level-title {
  font-size: 14px;
  font-weight: bold;
  color: ${level.color};
}
.roast {
  font-size: 11px;
  font-style: italic;
  opacity: 0.8;
  margin-bottom: 6px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.stats {
  font-size: 10px;
  opacity: 0.6;
  font-weight: 600;
}
</style></head>
<body>
  <div class="header-wrapper">
    <div class="floating-card">
      <img src="${imageUri}" alt="level" class="banner-image" />
      <div class="card-content">
        <div class="card-header">
          <div class="level-title">${level.emoji} ${this._esc(levelTitle)}</div>
        </div>
        <div class="roast">"${this._esc(roastMessage)}"</div>
        <div class="stats">${result.totalShames} shame${
			result.totalShames !== 1 ? "s" : ""
		} in ${filesWithShames.length} file${
			filesWithShames.length !== 1 ? "s" : ""
		}</div>
      </div>
    </div>
  </div>
</body></html>`;
	}

	private _esc(text: string): string {
		return text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}
}
