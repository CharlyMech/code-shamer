import * as vscode from "vscode";

type FixFactory = (
	doc: vscode.TextDocument,
	range: vscode.Range
) => vscode.CodeAction | undefined;

const FIXABLE_RULES: Record<string, FixFactory> = {
	"js-var-usage": (doc, range) => {
		const line = doc.lineAt(range.start.line);
		const varMatch = /\bvar\b/.exec(line.text);
		if (!varMatch) {
			return undefined;
		}

		const fix = new vscode.CodeAction(
			"CodeShamer: Replace 'var' with 'let'",
			vscode.CodeActionKind.QuickFix
		);
		fix.edit = new vscode.WorkspaceEdit();
		fix.edit.replace(
			doc.uri,
			new vscode.Range(
				range.start.line,
				varMatch.index,
				range.start.line,
				varMatch.index + 3
			),
			"let"
		);
		fix.isPreferred = true;
		return fix;
	},

	"js-loose-equality": (doc, range) => {
		const line = doc.lineAt(range.start.line);
		const idx = line.text.search(/[^!=]==[^=]/);
		if (idx < 0) {
			return undefined;
		}

		const fix = new vscode.CodeAction(
			"CodeShamer: Replace '==' with '==='",
			vscode.CodeActionKind.QuickFix
		);
		fix.edit = new vscode.WorkspaceEdit();
		fix.edit.replace(
			doc.uri,
			new vscode.Range(
				range.start.line,
				idx + 1,
				range.start.line,
				idx + 3
			),
			"==="
		);
		fix.isPreferred = true;
		return fix;
	},

	"js-loose-inequality": (doc, range) => {
		const line = doc.lineAt(range.start.line);
		const idx = line.text.search(/!=[^=]/);
		if (idx < 0) {
			return undefined;
		}

		const fix = new vscode.CodeAction(
			"CodeShamer: Replace '!=' with '!=='",
			vscode.CodeActionKind.QuickFix
		);
		fix.edit = new vscode.WorkspaceEdit();
		fix.edit.replace(
			doc.uri,
			new vscode.Range(
				range.start.line,
				idx,
				range.start.line,
				idx + 2
			),
			"!=="
		);
		return fix;
	},

	"js-debugger": (doc, range) => {
		const fix = new vscode.CodeAction(
			"CodeShamer: Remove 'debugger' statement",
			vscode.CodeActionKind.QuickFix
		);
		fix.edit = new vscode.WorkspaceEdit();
		const line = doc.lineAt(range.start.line);
		fix.edit.delete(doc.uri, line.rangeIncludingLineBreak);
		fix.isPreferred = true;
		return fix;
	},

	"js-console-log": (doc, range) => {
		const fix = new vscode.CodeAction(
			"CodeShamer: Remove console statement",
			vscode.CodeActionKind.QuickFix
		);
		fix.edit = new vscode.WorkspaceEdit();
		const line = doc.lineAt(range.start.line);
		fix.edit.delete(doc.uri, line.rangeIncludingLineBreak);
		return fix;
	},

	"js-alert": (doc, range) => {
		const fix = new vscode.CodeAction(
			"CodeShamer: Remove 'alert()' call",
			vscode.CodeActionKind.QuickFix
		);
		fix.edit = new vscode.WorkspaceEdit();
		const line = doc.lineAt(range.start.line);
		fix.edit.delete(doc.uri, line.rangeIncludingLineBreak);
		return fix;
	},
};

export class ShameCodeActionProvider implements vscode.CodeActionProvider {
	static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix,
	];

	provideCodeActions(
		document: vscode.TextDocument,
		_range: vscode.Range,
		context: vscode.CodeActionContext
	): vscode.CodeAction[] {
		const actions: vscode.CodeAction[] = [];

		for (const diag of context.diagnostics) {
			if (diag.source !== "CodeShamer") {
				continue;
			}

			const ruleId = String(diag.code);
			const factory = FIXABLE_RULES[ruleId];
			if (factory) {
				const action = factory(document, diag.range);
				if (action) {
					action.diagnostics = [diag];
					actions.push(action);
				}
			}
		}

		return actions;
	}
}
