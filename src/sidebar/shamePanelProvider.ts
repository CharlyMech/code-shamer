import * as vscode from "vscode";
import { WorkspaceShameResult, FileShameResult } from "../engine/types";
import { getShameLevel } from "../roasts/shameLevels";
import { getRandomRoastKey } from "../roasts/roastMessages";
import { getLocale } from "../i18n";

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
			localResourceRoots: [
				vscode.Uri.joinPath(this._extensionUri, "media"),
			],
		};

		webviewView.webview.onDidReceiveMessage((msg) => {
			if (msg.type === "openFile") {
				const uri = vscode.Uri.file(msg.filePath);
				const line = msg.line ?? 0;
				vscode.window.showTextDocument(uri, {
					selection: new vscode.Range(line, 0, line, 0),
				});
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
body { display:flex; align-items:center; justify-content:center; height:200px; margin:0;
  font-family:var(--vscode-font-family); color:var(--vscode-foreground); background:var(--vscode-sideBar-background); }
.loading { opacity:.7; font-size:13px; }
</style></head>
<body><div class="loading">Scanning workspace...</div></body></html>`;
	}

	private _getHtml(result: WorkspaceShameResult): string {
		const level = getShameLevel(result.totalScore);
		const locale = getLocale();
		const levelTitle = locale.levels[level.titleKey] ?? level.titleKey;
		const roastKey = getRandomRoastKey(result.totalScore);
		const roastMessage = locale.roasts[roastKey] ?? "";

		const imageUri = this._view!.webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "shames", `${level.imageIndex}.png`)
		);

		const filesWithShames = result.files
			.filter((f) => f.matches.length > 0)
			.sort((a, b) => b.totalScore - a.totalScore);

		const maxScore = filesWithShames.length > 0 ? filesWithShames[0].totalScore : 1;

		const fileListHtml = filesWithShames.length > 0
			? filesWithShames.map((f) => this._renderFile(f, maxScore)).join("")
			: `<div class="empty">&#10024; No shames found! Your code is clean.</div>`;

		const categoriesHtml = this._renderCategories(result);

		return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  font-family: var(--vscode-font-family);
  font-size: 12px;
  color: var(--vscode-foreground);
  background: var(--vscode-sideBar-background);
  overflow-x: hidden;
}

/* === BANNER === */
.banner {
  width: 100%;
  background: ${level.color}18;
  border-bottom: 2px solid ${level.color}50;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
}
.banner-image {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  border: 3px solid ${level.color};
  box-shadow: 0 2px 12px ${level.color}30;
}
.banner-image img { width:100%; height:100%; object-fit:cover; }
.level-title {
  font-size: 15px;
  font-weight: 700;
  color: ${level.color};
}
.stats { font-size: 11px; opacity: .75; }
.roast {
  font-size: 11px;
  font-style: italic;
  opacity: .65;
  max-width: 260px;
  line-height: 1.4;
}

/* === CATEGORIES === */
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  margin-top: 4px;
}
.cat-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  background: var(--vscode-badge-background);
  color: var(--vscode-badge-foreground);
}

/* === FILE LIST === */
.file-list { padding: 6px 0; }
.file-item {
  padding: 5px 12px 5px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 3px solid transparent;
}
.file-item:hover { background: var(--vscode-list-hoverBackground); }
.file-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.file-info { flex:1; min-width:0; }
.file-name {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-stats {
  font-size: 10px;
  opacity: .6;
}
.file-score {
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

/* Expandable matches */
.matches { display:none; padding-left:28px; }
.file-item.expanded + .matches { display:block; }
.match-item {
  padding: 3px 8px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  gap: 6px;
  opacity: .8;
}
.match-item:hover { background: var(--vscode-list-hoverBackground); opacity:1; }
.match-line { color: ${level.color}; font-weight:600; flex-shrink:0; }
.match-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: .7;
}

.empty { text-align:center; padding:20px; opacity:.6; }
</style></head>
<body>
  <div class="banner">
    <div class="banner-image"><img src="${imageUri}" alt="${this._esc(levelTitle)}" /></div>
    <div class="level-title">${level.emoji} ${this._esc(levelTitle)}</div>
    <div class="stats">${result.totalScore} pts &middot; ${result.totalShames} shames &middot; ${filesWithShames.length} files</div>
    <div class="roast">&ldquo;${this._esc(roastMessage)}&rdquo;</div>
    ${categoriesHtml}
  </div>

  <div class="file-list">
    ${fileListHtml}
  </div>

<script>
const vscode = acquireVsCodeApi();

document.querySelectorAll('.file-item').forEach(el => {
  el.addEventListener('click', () => {
    el.classList.toggle('expanded');
  });
});

document.querySelectorAll('.match-item').forEach(el => {
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    vscode.postMessage({
      type: 'openFile',
      filePath: el.dataset.file,
      line: parseInt(el.dataset.line, 10)
    });
  });
});
</script>
</body></html>`;
	}

	private _renderCategories(result: WorkspaceShameResult): string {
		const cats = Object.entries(result.byCategory);
		if (cats.length === 0) {
			return "";
		}
		const badges = cats
			.sort(([, a], [, b]) => b - a)
			.map(([cat, count]) => `<span class="cat-badge">${this._esc(cat)}: ${count}</span>`)
			.join("");
		return `<div class="categories">${badges}</div>`;
	}

	private _renderFile(file: FileShameResult, maxScore: number): string {
		const ratio = maxScore > 0 ? file.totalScore / maxScore : 0;
		const color = this._scoreColor(ratio);
		const relPath = vscode.workspace.asRelativePath(file.filePath);

		const matchesHtml = file.matches
			.map(
				(m) =>
					`<div class="match-item" data-file="${this._esc(file.filePath)}" data-line="${m.line}">
						<span class="match-line">L${m.line + 1}</span>
						<span class="match-id">${this._esc(m.pattern.id)}</span>
						<span class="match-text">${this._esc(m.lineText.trim().substring(0, 60))}</span>
					</div>`
			)
			.join("");

		return `<div class="file-item" style="border-left-color:${color}">
			<div class="file-dot" style="background:${color}"></div>
			<div class="file-info">
				<div class="file-name" title="${this._esc(relPath)}">${this._esc(relPath)}</div>
				<div class="file-stats">${file.matches.length} shame${file.matches.length !== 1 ? "s" : ""}</div>
			</div>
			<div class="file-score" style="color:${color}">${file.totalScore}</div>
		</div>
		<div class="matches">${matchesHtml}</div>`;
	}

	private _scoreColor(ratio: number): string {
		if (ratio < 0.25) {
			return "#4caf50";
		}
		if (ratio < 0.5) {
			return "#8bc34a";
		}
		if (ratio < 0.75) {
			return "#ff9800";
		}
		return "#f44336";
	}

	private _esc(text: string): string {
		return text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}
}
