import * as vscode from "vscode";
import { analyzeFile } from "../engine/shameEngine";

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
			
			// We analyze the ORIGINAL document to find the lines that need fixes
			const result = analyzeFile(
				originalDoc.getText(),
				originalDoc.languageId,
				originalDoc.uri.fsPath
			);

			const lenses: vscode.CodeLens[] = [];
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
				const fixedText =
					match.line < document.lineCount
						? document.lineAt(match.line).text
						: "";

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
						arguments: [originalUri, match.line],
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
