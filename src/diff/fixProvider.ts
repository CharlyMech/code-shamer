import * as vscode from "vscode";
import { analyzeFile } from "../engine/shameEngine";
import { ShameMatch } from "../engine/types";
import {
	getFixedLine,
	getFixEntry,
} from "../engine/fixes/registry";

export interface SuggestedFixLine {
	line: number;
	fixedText: string;
	match: ShameMatch;
}

export interface ReviewSuggestion {
	line: number;
	hintKey: string;
	titleKey: string;
	match: ShameMatch;
}

export interface FixAnalysis {
	content: string;
	suggestions: SuggestedFixLine[];
	reviews: ReviewSuggestion[];
}

export function buildSuggestedFixLines(
	originalContent: string,
	languageId: string,
	filePath: string
): FixAnalysis {
	const result = analyzeFile(originalContent, languageId, filePath);
	const lines = originalContent.split(/\r?\n/);
	const suggestions: SuggestedFixLine[] = [];
	const reviews: ReviewSuggestion[] = [];
	const reviewSeen = new Set<string>();

	const sortedMatches = [...result.matches].sort((a, b) => {
		if (a.line !== b.line) {
			return b.line - a.line;
		}
		return b.column - a.column;
	});

	for (const match of sortedMatches) {
		const ruleId = match.pattern.id;
		const entry = getFixEntry(ruleId);
		if (!entry) {
			continue;
		}

		if (entry.safety === "safe" && entry.transform) {
			const lineText = lines[match.line];
			if (typeof lineText !== "string") {
				continue;
			}
			const fixedText = getFixedLine(ruleId, lineText, match);
			if (fixedText === null) {
				continue;
			}
			lines[match.line] = fixedText;
			suggestions.push({
				line: match.line,
				fixedText,
				match,
			});
		} else if (entry.safety === "review" && entry.hintKey) {
			const reviewKey = `${ruleId}:${match.line}`;
			if (reviewSeen.has(reviewKey)) {
				continue;
			}
			reviewSeen.add(reviewKey);
			reviews.push({
				line: match.line,
				hintKey: entry.hintKey,
				titleKey: entry.titleKey,
				match,
			});
		}
	}

	return {
		content: lines.join("\n"),
		suggestions,
		reviews,
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
