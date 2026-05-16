import * as vscode from "vscode";
import { buildSuggestedFixLines } from "../diff/fixProvider";
import { getLocale } from "../i18n";

export class ShameDiffCodeLensProvider implements vscode.CodeLensProvider {
	async provideCodeLenses(
		document: vscode.TextDocument,
		_token: vscode.CancellationToken
	): Promise<vscode.CodeLens[]> {
		if (document.uri.scheme !== "codeshamer-fix") {
			return [];
		}

		const originalUriStr = document.uri.query;
		if (!originalUriStr) {
			return [];
		}

		try {
			const originalUri = vscode.Uri.parse(originalUriStr);
			const originalDoc = await vscode.workspace.openTextDocument(originalUri);
			const originalContent = originalDoc.getText();
			const analysis = buildSuggestedFixLines(
				originalContent,
				originalDoc.languageId,
				originalDoc.uri.fsPath
			);
			const fixByLine = new Map<number, string>();
			for (const suggestion of analysis.suggestions) {
				if (!fixByLine.has(suggestion.line)) {
					fixByLine.set(suggestion.line, suggestion.fixedText);
				}
			}

			const locale = getLocale();
			const lenses: vscode.CodeLens[] = [];
			const topRange = new vscode.Range(0, 0, 0, 0);
			const relativePath = vscode.workspace.asRelativePath(originalUri);
			lenses.push(
				new vscode.CodeLens(topRange, {
					title: `📄 ${locale.ui.previewTitlePath(relativePath)}`,
					command: "code-shamer.scanning",
				})
			);
			lenses.push(
				new vscode.CodeLens(topRange, {
					title: `✅ ${locale.ui.codeLensApplyAll}`,
					command: "code-shamer.applyAllSuggestionsInFile",
					arguments: [originalUri],
				})
			);
			lenses.push(
				new vscode.CodeLens(topRange, {
					title: `✨ ${locale.ui.codeLensApplyCursor}`,
					command: "code-shamer.applySuggestionAtCursor",
					arguments: [originalUri],
				})
			);
			lenses.push(
				new vscode.CodeLens(topRange, {
					title: `🙈 ${locale.ui.codeLensIgnoreLine}`,
					command: "code-shamer.ignoreSuggestionAtCursor",
					arguments: [originalUri],
				})
			);
			lenses.push(
				new vscode.CodeLens(topRange, {
					title: `🙈 ${locale.ui.codeLensIgnoreFile}`,
					command: "code-shamer.ignoreFileFromDiff",
					arguments: [originalUri],
				})
			);

			const processedSafeLines = new Set<number>();
			for (const suggestion of analysis.suggestions) {
				if (processedSafeLines.has(suggestion.line)) {
					continue;
				}
				processedSafeLines.add(suggestion.line);

				const range = new vscode.Range(suggestion.line, 0, suggestion.line, 0);
				lenses.push(
					new vscode.CodeLens(range, {
						title: `✨ ${locale.ui.codeLensApplyInline}`,
						command: "code-shamer.applyFixInline",
						arguments: [
							originalUri,
							suggestion.line,
							suggestion.fixedText,
						],
					})
				);
				lenses.push(
					new vscode.CodeLens(range, {
						title: `🙈 ${locale.ui.codeLensIgnoreInline}`,
						command: "code-shamer.ignoreInline",
						arguments: [
							originalUri,
							suggestion.line,
							suggestion.match.pattern.id,
						],
					})
				);
			}

			const processedReviewLines = new Set<number>();
			for (const review of analysis.reviews) {
				if (
					processedSafeLines.has(review.line) ||
					processedReviewLines.has(review.line)
				) {
					continue;
				}
				processedReviewLines.add(review.line);

				const range = new vscode.Range(review.line, 0, review.line, 0);
				const hintText = locale.t(review.hintKey);
				const titleText = locale.t(review.titleKey);
				lenses.push(
					new vscode.CodeLens(range, {
						title: `💡 ${locale.ui.codeLensReviewHint}: ${titleText} — ${hintText}`,
						command: "code-shamer.scanning",
					})
				);
				lenses.push(
					new vscode.CodeLens(range, {
						title: `🙈 ${locale.ui.codeLensIgnoreInline}`,
						command: "code-shamer.ignoreInline",
						arguments: [
							originalUri,
							review.line,
							review.match.pattern.id,
						],
					})
				);
			}

			return lenses;
		} catch (e) {
			console.error("CodeShamer: Error providing diff lens", e);
			return [];
		}
	}
}
