import * as vscode from "vscode";
import { WorkspaceShameResult, FileShameResult, ShameMatch } from "../engine/types";

export class FolderNode {
    constructor(public name: string, public path: string, public files: FileShameResult[], public subfolders: Map<string, FolderNode>) {}
}
export class FileNode {
    constructor(public file: FileShameResult) {}
}
export class MatchNode {
    constructor(public match: ShameMatch) {}
}

export type ShameTreeNode = FolderNode | FileNode | MatchNode;

export class ShameTreeProvider implements vscode.TreeDataProvider<ShameTreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<ShameTreeNode | undefined | void> = new vscode.EventEmitter<ShameTreeNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ShameTreeNode | undefined | void> = this._onDidChangeTreeData.event;
    private result?: WorkspaceShameResult;

    update(result: WorkspaceShameResult): void {
        this.result = result;
        this._onDidChangeTreeData.fire();
    }

    setLoading() {
        this.result = undefined;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ShameTreeNode): vscode.TreeItem {
        if (element instanceof FolderNode) {
            const sum = element.files.reduce((a, b) => a + b.matches.length, 0) + 
                        Array.from(element.subfolders.values()).reduce((a, b) => a + this.countShames(b), 0);
            const item = new vscode.TreeItem(element.name, vscode.TreeItemCollapsibleState.Expanded);
            item.description = `${sum}`;
            item.resourceUri = vscode.Uri.file(element.path);
            item.iconPath = vscode.ThemeIcon.Folder;
            return item;
        } else if (element instanceof FileNode) {
            const fileName = element.file.filePath.split(/[/\\]/).pop() || "File";
            const item = new vscode.TreeItem(fileName, vscode.TreeItemCollapsibleState.Collapsed);
            item.description = `${element.file.matches.length}`;
            item.resourceUri = vscode.Uri.file(element.file.filePath); 
            item.iconPath = vscode.ThemeIcon.File;
            
            item.contextValue = "shameFile";
            item.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [item.resourceUri]
            };
            return item;
        } else if (element instanceof MatchNode) {
            const preview = element.match.lineText.trim().substring(0, 60);
            const item = new vscode.TreeItem(`L${element.match.line + 1}  ${preview}`, vscode.TreeItemCollapsibleState.None);
            
            const uri = vscode.Uri.file(element.match.filePath);
            const pos = new vscode.Position(element.match.line, element.match.column);
            
            item.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [uri, { selection: new vscode.Range(pos, pos) }]
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

    getChildren(element?: ShameTreeNode): vscode.ProviderResult<ShameTreeNode[]> {
        if (!this.result) {
            return [];
        }
        if (!element) {
            const filesWithShames = this.result.files.filter(f => f.matches.length > 0);
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
                        current.subfolders.set(part, new FolderNode(part, partPath, [], new Map()));
                    }
                    current = current.subfolders.get(part)!;
                }
                current.files.push(f);
            }
            
            return [
                ...Array.from(root.subfolders.values()),
                ...root.files.map(f => new FileNode(f))
            ].sort((a,b) => (a instanceof FolderNode && b instanceof FileNode) ? -1 : (a instanceof FileNode && b instanceof FolderNode) ? 1 : 0);
        } else if (element instanceof FolderNode) {
            return [
                ...Array.from(element.subfolders.values()),
                ...element.files.map(f => new FileNode(f))
            ].sort((a,b) => (a instanceof FolderNode && b instanceof FileNode) ? -1 : (a instanceof FileNode && b instanceof FolderNode) ? 1 : 0);
        } else if (element instanceof FileNode) {
            return element.file.matches.map(m => new MatchNode(m));
        }
        return [];
    }
}
