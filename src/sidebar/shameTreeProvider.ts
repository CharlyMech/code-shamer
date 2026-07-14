import * as vscode from "vscode";
import { WorkspaceShameResult, FileShameResult, ShameMatch } from "../engine/types";
import { getLocale } from "../i18n";
import {
	formatLineDescription,
	formatMatchPreview,
	severityTreeIcon,
} from "./treeFormatting";

export class FolderNode {
	constructor(
		public name: string,
		public path: string,
		public files: FileShameResult[],
		public subfolders: Map<string, FolderNode>
	) {}
}
export class FileNode {
	constructor(public file: FileShameResult) {}
}
export class MatchNode {
	constructor(public match: ShameMatch) {}
}

export type ShameTreeNode = FolderNode | FileNode | MatchNode;

export class ShameTreeProvider implements vscode.TreeDataProvider<ShameTreeNode> {
	private _onDidChangeTreeData: vscode.EventEmitter<ShameTreeNode | undefined | void> =
		new vscode.EventEmitter<ShameTreeNode | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<ShameTreeNode | undefined | void> =
		this._onDidChangeTreeData.event;
	private result?: WorkspaceShameResult;
	private treeView?: vscode.TreeView<ShameTreeNode>;
	private state: "loading" | "empty" | "ready" = "loading";

	attachTreeView(view: vscode.TreeView<ShameTreeNode>): void {
		this.treeView = view;
		this.refreshMessage();
	}

	update(result: WorkspaceShameResult): void {
		this.result = result;
		const filesWithShames = result.files.filter((f) => f.matches.length > 0);
		this.state = filesWithShames.length === 0 ? "empty" : "ready";
		this.refreshMessage();
		this._onDidChangeTreeData.fire();
	}

	setLoading() {
		this.result = undefined;
		this.state = "loading";
		this.refreshMessage();
		this._onDidChangeTreeData.fire();
	}

	private refreshMessage(): void {
		if (!this.treeView) {
			return;
		}
		const locale = getLocale();
		if (this.state === "loading") {
			this.treeView.message = locale.ui.scanningWorkspace;
			return;
		}
		if (this.state === "empty") {
			this.treeView.message = locale.ui.noShamesYet;
			return;
		}
		this.treeView.message = undefined;
	}

	getTreeItem(element: ShameTreeNode): vscode.TreeItem {
		if (element instanceof FolderNode) {
			const sum =
				element.files.reduce((a, b) => a + b.matches.length, 0) +
				Array.from(element.subfolders.values()).reduce(
					(a, b) => a + this.countShames(b),
					0
				);
			const item = new vscode.TreeItem(
				element.name,
				vscode.TreeItemCollapsibleState.Expanded
			);
			item.description = `${sum}`;
			item.resourceUri = vscode.Uri.file(element.path);
			item.iconPath = vscode.ThemeIcon.Folder;
			return item;
		} else if (element instanceof FileNode) {
			const fileName =
				element.file.filePath.split(/[/\\]/).pop() || "File";
			const count = element.file.matches.length;
			const item = new vscode.TreeItem(
				fileName,
				vscode.TreeItemCollapsibleState.Collapsed
			);
			item.description = `${count}`;
			item.resourceUri = vscode.Uri.file(element.file.filePath);
			// Use workspace file icon (React, TS, etc.) from the file icon theme.

			item.contextValue = "shameFile";
			item.tooltip = `${fileName} — ${count} shame${count !== 1 ? "s" : ""}`;
			item.command = {
				command: "vscode.open",
				title: "Open File",
				arguments: [item.resourceUri],
			};
			return item;
		} else if (element instanceof MatchNode) {
			const item = new vscode.TreeItem(
				formatMatchPreview(element.match.lineText),
				vscode.TreeItemCollapsibleState.None
			);
			item.description = formatLineDescription(element.match.line);
			item.iconPath = severityTreeIcon(element.match.pattern.severity);
			item.tooltip = `${formatLineDescription(element.match.line)}: ${element.match.lineText.trim()}`;

			const uri = vscode.Uri.file(element.match.filePath);
			const pos = new vscode.Position(
				element.match.line,
				element.match.column
			);

			item.command = {
				command: "vscode.open",
				title: "Open File",
				arguments: [uri, { selection: new vscode.Range(pos, pos) }],
			};
			return item;
		}
		return new vscode.TreeItem("");
	}

	private countShames(folder: FolderNode): number {
		let sum = folder.files.reduce((a, b) => a + b.matches.length, 0);
		for (const sub of folder.subfolders.values()) {
			sum += this.countShames(sub);
		}
		return sum;
	}

	async revealFirstMatch(
		treeView: vscode.TreeView<ShameTreeNode>,
		filePath: string
	): Promise<void> {
		if (!this.result) {
			return;
		}
		const file = this.result.files.find(
			(f) => f.filePath === filePath && f.matches.length > 0
		);
		if (!file) {
			return;
		}
		const fileNode = new FileNode(file);
		try {
			await treeView.reveal(fileNode, {
				select: true,
				expand: true,
				focus: false,
			});
			const matchNode = new MatchNode(file.matches[0]);
			await treeView.reveal(matchNode, {
				select: true,
				expand: false,
				focus: false,
			});
		} catch {
			// tree may still be refreshing
		}
	}

	getChildren(element?: ShameTreeNode): vscode.ProviderResult<ShameTreeNode[]> {
		if (!this.result) {
			return [];
		}
		if (!element) {
			const filesWithShames = this.result.files.filter(
				(f) => f.matches.length > 0
			);
			if (filesWithShames.length === 0) {
				return [];
			}

			const root = new FolderNode("root", "", [], new Map());

			for (const f of filesWithShames) {
				const relPath = vscode.workspace.asRelativePath(f.filePath);
				const parts = relPath.split(/[/\\]/);
				let current = root;
				for (let i = 0; i < parts.length - 1; i++) {
					const part = parts[i];
					const partPath = parts.slice(0, i + 1).join("/");
					if (!current.subfolders.has(part)) {
						current.subfolders.set(
							part,
							new FolderNode(part, partPath, [], new Map())
						);
					}
					current = current.subfolders.get(part)!;
				}
				current.files.push(f);
			}

			return [
				...Array.from(root.subfolders.values()),
				...root.files.map((f) => new FileNode(f)),
			].sort((a, b) =>
				a instanceof FolderNode && b instanceof FileNode
					? -1
					: a instanceof FileNode && b instanceof FolderNode
						? 1
						: 0
			);
		} else if (element instanceof FolderNode) {
			return [
				...Array.from(element.subfolders.values()),
				...element.files.map((f) => new FileNode(f)),
			].sort((a, b) =>
				a instanceof FolderNode && b instanceof FileNode
					? -1
					: a instanceof FileNode && b instanceof FolderNode
						? 1
						: 0
			);
		} else if (element instanceof FileNode) {
			return element.file.matches.map((m) => new MatchNode(m));
		}
		return [];
	}
}
