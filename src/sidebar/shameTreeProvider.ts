import * as vscode from "vscode";
import { WorkspaceShameResult } from "../engine/types";
import {
	ShameSummaryItem,
	ShameFileItem,
	ShameMatchItem,
} from "./shameTreeItems";
import { getLocale } from "../i18n";

type TreeElement = ShameSummaryItem | ShameFileItem | ShameMatchItem;

export class ShameTreeProvider
	implements vscode.TreeDataProvider<TreeElement>
{
	private _onDidChangeTreeData = new vscode.EventEmitter<void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	private result: WorkspaceShameResult | undefined;
	private _loading = false;

	setLoading(loading: boolean): void {
		this._loading = loading;
		this._onDidChangeTreeData.fire();
	}

	update(result: WorkspaceShameResult): void {
		this.result = result;
		this._loading = false;
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: TreeElement): vscode.TreeItem {
		return element;
	}

	getChildren(element?: TreeElement): TreeElement[] {
		if (this._loading) {
			return [
				new ShameSummaryItem(
					"Scanning workspace...",
					"Please wait",
					"loading~spin"
				),
			];
		}

		if (!this.result) {
			return [
				new ShameSummaryItem(
					"No scan results yet",
					"Click refresh to scan",
					"info"
				),
			];
		}

		if (!element) {
			return this.getRootChildren();
		}

		if (element instanceof ShameFileItem) {
			return element.fileResult.matches.map(
				(m) => new ShameMatchItem(m)
			);
		}

		return [];
	}

	private getRootChildren(): TreeElement[] {
		const result = this.result!;
		const items: TreeElement[] = [];

		// Category summary
		const categories = Object.entries(result.byCategory);
		if (categories.length > 0) {
			const categorySummary = categories
				.sort(([, a], [, b]) => b - a)
				.map(([cat, count]) => `${cat}: ${count}`)
				.join(", ");
			items.push(
				new ShameSummaryItem(
					"By Category",
					categorySummary,
					"tag"
				)
			);
		}

		// Files sorted by score (worst first), with color indicators
		const filesWithShames = result.files
			.filter((f) => f.matches.length > 0)
			.sort((a, b) => b.totalScore - a.totalScore);

		const maxScore = filesWithShames.length > 0 ? filesWithShames[0].totalScore : 0;

		for (const file of filesWithShames) {
			const ratio = maxScore > 0 ? file.totalScore / maxScore : 0;
			const color = ratio > 0.66 ? "red" : ratio > 0.33 ? "orange" : "green";
			items.push(new ShameFileItem(file, color));
		}

		if (filesWithShames.length === 0) {
			items.push(
				new ShameSummaryItem(
					"\u2728 No shames found!",
					"Your code is clean",
					"check"
				)
			);
		}

		return items;
	}
}
