import * as vscode from "vscode";
import { analyzeFile } from "../engine/shameEngine";
import { ShameMatch } from "../engine/types";

export interface SuggestedFixLine {
	line: number;
	fixedText: string;
	match: ShameMatch;
}

export function buildSuggestedFixLines(
	originalContent: string,
	languageId: string,
	filePath: string
): { content: string; suggestions: SuggestedFixLine[] } {
	const result = analyzeFile(originalContent, languageId, filePath);
	let lines = originalContent.split(/\r?\n/);
	const suggestions: SuggestedFixLine[] = [];

	const sortedMatches = [...result.matches].sort((a, b) => {
		if (a.line !== b.line) {
			return b.line - a.line;
		}
		return b.column - a.column;
	});

	for (const match of sortedMatches) {
		const id = match.pattern.id;
		const lineText = lines[match.line];
		let fixedText = lineText;

		if (id === "js-var-usage") {
			fixedText = lineText.replace(/\bvar\b/, "let");
		} else if (id === "js-loose-equality") {
			fixedText = lineText.replace(/([^!=])==([^=])/g, "$1===$2");
		} else if (id === "js-loose-inequality") {
			fixedText = lineText.replace(/!=([^=])/g, "!==$1");
		} else if (
			id === "js-debugger" ||
			id === "js-console-log" ||
			id === "js-alert"
		) {
			fixedText = "";
		}

		if (fixedText !== lineText) {
			lines[match.line] = fixedText;
			suggestions.push({
				line: match.line,
				fixedText,
				match,
			});
		}
	}

	return {
		content: lines.join("\n"),
		suggestions,
	};
}

export class CodeShamerFixProvider implements vscode.TextDocumentContentProvider {
    static scheme = "codeshamer-fix";

    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        const originalUri = vscode.Uri.parse(uri.query);
        const doc = await vscode.workspace.openTextDocument(originalUri);
		const suggested = buildSuggestedFixLines(
			doc.getText(),
			doc.languageId,
			doc.uri.fsPath
		);
        const eol = doc.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";
        return suggested.content.split("\n").join(eol);
    }
}
