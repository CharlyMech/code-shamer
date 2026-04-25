import * as vscode from "vscode";
import { analyzeFile } from "../engine/shameEngine";
import { buildSuggestedFixLines } from "../diff/fixProvider";

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
			const result = analyzeFile(
				originalContent,
				originalDoc.languageId,
				originalDoc.uri.fsPath
			);
			const suggestedFixes = buildSuggestedFixLines(
				originalContent,
				originalDoc.languageId,
				originalDoc.uri.fsPath
			);
			const fixByLine = new Map<number, string>();
			for (const suggestion of suggestedFixes.suggestions) {
				if (!fixByLine.has(suggestion.line)) {
					fixByLine.set(suggestion.line, suggestion.fixedText);
				}
			}

			const lenses: vscode.CodeLens[] = [];
			const topRange = new vscode.Range(0, 0, 0, 0);
			lenses.push(
				new vscode.CodeLens(topRange, {
					title: "✅ Apply all fixes",
					command: "code-shamer.applyAllSuggestionsInFile",
				})
			);
			lenses.push(
				new vscode.CodeLens(topRange, {
					title: "✨ Apply this fix (cursor line)",
					command: "code-shamer.applySuggestionAtCursor",
				})
			);
			lenses.push(
				new vscode.CodeLens(topRange, {
					title: "🙈 Not shame this line",
					command: "code-shamer.ignoreSuggestionAtCursor",
				})
			);
			lenses.push(
				new vscode.CodeLens(topRange, {
					title: "🙈 Not shame this file",
					command: "code-shamer.ignoreFileFromDiff",
				})
			);

			const processedLines = new Set<number>();

			for (const match of result.matches) {
				if (processedLines.has(match.line)) {
					continue;
				}
				processedLines.add(match.line);

				const range = new vscode.Range(match.line, 0, match.line, 0);

				// Get the suggested fixed text from the codeshamer-fix document
				// Because fixProvider maps lines 1:1 (using empty strings for removals),
				// the line numbers perfectly align.
				const fixedText = fixByLine.get(match.line);
				if (typeof fixedText !== "string") {
					continue;
				}

				lenses.push(
					new vscode.CodeLens(range, {
						title: "✨ Corregir con sugerencia",
						command: "code-shamer.applyFixInline",
						arguments: [originalUri, match.line, fixedText],
					})
				);

				lenses.push(
					new vscode.CodeLens(range, {
						title: "🙈 Ignorar shame inline",
						command: "code-shamer.ignoreInline",
						arguments: [originalUri, match.line, match.pattern.id],
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
