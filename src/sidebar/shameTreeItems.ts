import * as vscode from "vscode";
import { ShameMatch, FileShameResult, ShameCategory } from "../engine/types";

const CATEGORY_ICONS: Record<ShameCategory, string> = {
	security: "shield",
	debug: "debug",
	style: "paintcan",
	performance: "dashboard",
	maintenance: "tools",
	reliability: "warning",
};

export class ShameSummaryItem extends vscode.TreeItem {
	constructor(label: string, description: string, icon: string = "flame") {
		super(label, vscode.TreeItemCollapsibleState.None);
		this.description = description;
		this.iconPath = new vscode.ThemeIcon(icon);
		this.contextValue = "shameSummary";
	}
}

export class ShameFileItem extends vscode.TreeItem {
	constructor(
		public readonly fileResult: FileShameResult,
		color?: string
	) {
		super(
			vscode.workspace.asRelativePath(fileResult.filePath),
			vscode.TreeItemCollapsibleState.Collapsed
		);

		const shameCount = fileResult.matches.length;
		this.description = `${shameCount} shame${shameCount !== 1 ? "s" : ""} (${fileResult.totalScore} pts)`;
		this.resourceUri = vscode.Uri.file(fileResult.filePath);
		this.contextValue = "shameFile";

		if (color) {
			this.iconPath = new vscode.ThemeIcon(
				"circle-filled",
				new vscode.ThemeColor("codeshamer.fileIndicator")
			);
		}

		const md = new vscode.MarkdownString();
		md.appendMarkdown(
			`**${shameCount} shame${shameCount !== 1 ? "s" : ""}** | ${fileResult.totalScore} points\n\n`
		);
		const categories = new Map<string, number>();
		for (const m of fileResult.matches) {
			categories.set(
				m.pattern.category,
				(categories.get(m.pattern.category) || 0) + 1
			);
		}
		for (const [cat, count] of categories) {
			md.appendMarkdown(`- ${cat}: ${count}\n`);
		}
		this.tooltip = md;
	}
}

export class ShameMatchItem extends vscode.TreeItem {
	constructor(public readonly match: ShameMatch) {
		super(
			`L${match.line + 1}: ${match.pattern.id}`,
			vscode.TreeItemCollapsibleState.None
		);
		this.description = match.lineText.trim().substring(0, 80);
		this.iconPath = new vscode.ThemeIcon(
			CATEGORY_ICONS[match.pattern.category] || "circle-filled"
		);
		this.command = {
			command: "vscode.open",
			title: "Go to shame",
			arguments: [
				vscode.Uri.file(match.filePath),
				{
					selection: new vscode.Range(
						match.line,
						match.column,
						match.line,
						match.column
					),
				},
			],
		};
		this.tooltip = new vscode.MarkdownString(
			`**${match.pattern.category}** | Severity ${match.pattern.severity}/5\n\n\`${match.lineText.trim()}\``
		);
		this.contextValue = "shameMatch";
	}
}
