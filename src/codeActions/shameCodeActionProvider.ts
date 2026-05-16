import * as vscode from "vscode";
import {
	getFixEntry,
	hasAnyRecommendation,
} from "../engine/fixes/registry";
import { getLocale } from "../i18n";

interface FixContext {
	doc: vscode.TextDocument;
	range: vscode.Range;
	ruleId: string;
}

function buildSafeFixAction(
	ctx: FixContext,
	titleKey: string
): vscode.CodeAction | undefined {
	const locale = getLocale();
	const title = `CodeShamer: ${locale.t(titleKey)}`;
	const entry = getFixEntry(ctx.ruleId);
	if (!entry || !entry.transform) {
		return undefined;
	}

	const line = ctx.doc.lineAt(ctx.range.start.line);
	const fixed = entry.transform(line.text, {
		pattern: { id: ctx.ruleId } as never,
		line: ctx.range.start.line,
		column: ctx.range.start.character,
		lineText: line.text,
		filePath: ctx.doc.uri.fsPath,
	});
	if (fixed === null || fixed === line.text) {
		return undefined;
	}

	const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
	action.edit = new vscode.WorkspaceEdit();

	if (entry.kind === "removeLine") {
		action.edit.delete(ctx.doc.uri, line.rangeIncludingLineBreak);
	} else {
		action.edit.replace(
			ctx.doc.uri,
			new vscode.Range(line.range.start, line.range.end),
			fixed
		);
	}
	action.isPreferred = true;
	return action;
}

export class ShameCodeActionProvider implements vscode.CodeActionProvider {
	static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

	provideCodeActions(
		document: vscode.TextDocument,
		_range: vscode.Range,
		context: vscode.CodeActionContext
	): vscode.CodeAction[] {
		const actions: vscode.CodeAction[] = [];
		const locale = getLocale();

		for (const diag of context.diagnostics) {
			if (diag.source !== "CodeShamer") {
				continue;
			}

			const ruleId = String(diag.code);
			const entry = getFixEntry(ruleId);

			if (entry && entry.safety === "safe") {
				const safe = buildSafeFixAction(
					{ doc: document, range: diag.range, ruleId },
					entry.titleKey
				);
				if (safe) {
					safe.diagnostics = [diag];
					actions.push(safe);
				}
			}

			const commentPrefix =
				document.languageId === "html"
					? "<!--"
					: document.languageId === "css"
						? "/*"
						: "//";
			const commentSuffix =
				document.languageId === "html"
					? " -->"
					: document.languageId === "css"
						? " */"
						: "";
			const eol = document.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";

			const ignoreLineAction = new vscode.CodeAction(
				locale.ui.codeActionIgnoreLine,
				vscode.CodeActionKind.QuickFix
			);
			ignoreLineAction.edit = new vscode.WorkspaceEdit();
			ignoreLineAction.edit.insert(
				document.uri,
				new vscode.Position(diag.range.start.line, 0),
				`${commentPrefix} code-shamer-ignore-next-line ${ruleId}${commentSuffix}${eol}`
			);
			ignoreLineAction.diagnostics = [diag];
			actions.push(ignoreLineAction);

			const ignoreFileAction = new vscode.CodeAction(
				locale.ui.codeActionIgnoreFile,
				vscode.CodeActionKind.QuickFix
			);
			ignoreFileAction.edit = new vscode.WorkspaceEdit();
			ignoreFileAction.edit.insert(
				document.uri,
				new vscode.Position(0, 0),
				`${commentPrefix} code-shamer-ignore-file${commentSuffix}${eol}`
			);
			ignoreFileAction.diagnostics = [diag];
			actions.push(ignoreFileAction);

			const disableWorkspaceAction = new vscode.CodeAction(
				locale.ui.codeActionDisableWorkspace(ruleId),
				vscode.CodeActionKind.QuickFix
			);
			disableWorkspaceAction.command = {
				command: "code-shamer.disableRuleWorkspace",
				title: locale.ui.codeActionDisableWorkspace(ruleId),
				arguments: [ruleId],
			};
			disableWorkspaceAction.diagnostics = [diag];
			actions.push(disableWorkspaceAction);

			if (hasAnyRecommendation(ruleId)) {
				const showFixAction = new vscode.CodeAction(
					locale.ui.codeActionShowRecommendedFix,
					vscode.CodeActionKind.QuickFix
				);
				showFixAction.command = {
					command: "code-shamer.reviewFixes",
					title: locale.ui.codeActionShowRecommendedFix,
					arguments: [document.uri],
				};
				showFixAction.diagnostics = [diag];
				if (!entry || entry.safety !== "safe") {
					showFixAction.isPreferred = true;
				}
				actions.push(showFixAction);
			}
		}

		return actions;
	}
}
