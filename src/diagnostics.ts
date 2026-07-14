import * as vscode from "vscode";
import { WorkspaceShameResult, ShameMatch } from "./engine/types";
import { getLocale } from "./i18n";
import { getSettings } from "./settings";
import {
	findOverlappingExternalDiagnostic,
	linterHintForRule,
} from "./integrations/workspaceTooling";

const DIAGNOSTIC_SOURCE = "CodeShamer";

function resolveHintKey(
	pattern: import("./engine/types").ShamePattern
): string | undefined {
	if (pattern.hintKey) {
		return pattern.hintKey;
	}
	const dash = pattern.id.indexOf("-");
	if (dash === -1) {
		return undefined;
	}
	return `hint.${pattern.id.slice(0, dash)}.${pattern.id.slice(dash + 1).replace(/-/g, ".")}`;
}

export class ShameDiagnosticsManager {
	private collection: vscode.DiagnosticCollection;
	private decorationBySeverity: Map<number, vscode.TextEditorDecorationType> =
		new Map();
	private decorationRangesByUri: Map<string, Map<number, vscode.Range[]>> =
		new Map();
	private visibleEditorSub: vscode.Disposable;

	constructor() {
		this.collection =
			vscode.languages.createDiagnosticCollection("codeshamer");
		this.visibleEditorSub = vscode.window.onDidChangeVisibleTextEditors(() => {
			this.refreshDecorations();
		});
		this.rebuildDecorationTypes();
	}

	update(result: WorkspaceShameResult): void {
		this.collection.clear();
		this.decorationRangesByUri.clear();
		this.rebuildDecorationTypes();
		const locale = getLocale();

		for (const file of result.files) {
			if (file.matches.length === 0) {
				continue;
			}

			const fileUri = vscode.Uri.file(file.filePath);
			const diagnostics: vscode.Diagnostic[] = [];
			const perSeverity = new Map<number, vscode.Range[]>();

			for (const match of file.matches) {
				this.addMatchArtifacts(diagnostics, perSeverity, locale, match);
			}

			this.collection.set(fileUri, diagnostics);
			this.decorationRangesByUri.set(fileUri.toString(), perSeverity);
		}
		this.refreshDecorations();
	}

	setDocumentDiagnostics(uri: vscode.Uri, matches: ShameMatch[]): void {
		const locale = getLocale();
		const diagnostics: vscode.Diagnostic[] = [];
		const perSeverity = new Map<number, vscode.Range[]>();
		for (const match of matches) {
			this.addMatchArtifacts(diagnostics, perSeverity, locale, match);
		}
		this.collection.set(uri, diagnostics);
		this.decorationRangesByUri.set(uri.toString(), perSeverity);
		this.refreshDecorations();
	}

	clearDocumentDiagnostics(uri: vscode.Uri): void {
		this.collection.delete(uri);
		this.decorationRangesByUri.delete(uri.toString());
		this.refreshDecorations();
	}

	clear(): void {
		this.collection.clear();
	}

	dispose(): void {
		this.visibleEditorSub.dispose();
		for (const decorationType of this.decorationBySeverity.values()) {
			decorationType.dispose();
		}
		this.decorationBySeverity.clear();
		this.collection.dispose();
	}

	private mapSeverity(severity: number): vscode.DiagnosticSeverity {
		if (severity >= 4) {
			return vscode.DiagnosticSeverity.Error;
		}
		if (severity >= 2) {
			return vscode.DiagnosticSeverity.Warning;
		}
		return vscode.DiagnosticSeverity.Information;
	}

	private rebuildDecorationTypes(): void {
		for (const decorationType of this.decorationBySeverity.values()) {
			decorationType.dispose();
		}
		this.decorationBySeverity.clear();
		const colors = getSettings().inlineShameUnderlineColors;

		for (const severity of [1, 2, 3, 4, 5]) {
			const color = colors[String(severity)];
			if (!color) {
				continue;
			}
			this.decorationBySeverity.set(
				severity,
				vscode.window.createTextEditorDecorationType({
					textDecoration: `underline wavy ${color}`,
				})
			);
		}
	}

	private refreshDecorations(): void {
		for (const editor of vscode.window.visibleTextEditors) {
			const rangesForEditor =
				this.decorationRangesByUri.get(editor.document.uri.toString()) ??
				new Map<number, vscode.Range[]>();
			for (const [severity, decorationType] of this.decorationBySeverity) {
				editor.setDecorations(
					decorationType,
					rangesForEditor.get(severity) ?? []
				);
			}
		}
	}

	private addMatchArtifacts(
		diagnostics: vscode.Diagnostic[],
		perSeverity: Map<number, vscode.Range[]>,
		locale: ReturnType<typeof getLocale>,
		match: ShameMatch
	): void {
		const startLine = match.line;
		const startCol = match.column;
		const endLine = match.endLine ?? match.line;
		const endCol =
			match.endColumn ??
			Math.max(match.column + 1, match.lineText.trimEnd().length);
		const range = new vscode.Range(startLine, startCol, endLine, endCol);
		let message = locale.shameMessage(match.pattern.messageKey);
		const hintKey = resolveHintKey(match.pattern);
		if (hintKey) {
			const hint = locale.hintMessage(hintKey);
			if (hint && hint !== hintKey) {
				message = `${message}\n${hint}`;
			}
		}
		const linterHint = linterHintForRule(match.pattern.id);
		if (linterHint) {
			message = `${message}\n${linterHint}`;
		}

		const diag = new vscode.Diagnostic(
			range,
			message,
			this.mapSeverity(match.pattern.severity)
		);
		diag.source = DIAGNOSTIC_SOURCE;
		diag.code = match.pattern.id;

		const fileUri = vscode.Uri.file(match.filePath);
		const external = findOverlappingExternalDiagnostic(
			fileUri,
			range,
			match.pattern.id
		);
		if (external?.source && external.message) {
			diag.relatedInformation = [
				new vscode.DiagnosticRelatedInformation(
					new vscode.Location(fileUri, external.range),
					`${external.source}: ${external.message}`
				),
			];
		}

		diagnostics.push(diag);
		const severityRanges = perSeverity.get(match.pattern.severity) ?? [];
		severityRanges.push(range);
		perSeverity.set(match.pattern.severity, severityRanges);
	}
}
