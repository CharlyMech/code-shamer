import * as vscode from "vscode";
import { WorkspaceShameResult } from "./engine/types";
import { getLocale } from "./i18n";

const DIAGNOSTIC_SOURCE = "CodeShamer";

export class ShameDiagnosticsManager {
	private collection: vscode.DiagnosticCollection;

	constructor() {
		this.collection =
			vscode.languages.createDiagnosticCollection("codeshamer");
	}

	update(result: WorkspaceShameResult): void {
		this.collection.clear();
		const locale = getLocale();

		for (const file of result.files) {
			if (file.matches.length === 0) {
				continue;
			}

			const uri = vscode.Uri.file(file.filePath);
			const diagnostics: vscode.Diagnostic[] = [];

			for (const match of file.matches) {
				const matchLength = Math.max(
					match.lineText.trimEnd().length - match.column,
					1
				);
				const range = new vscode.Range(
					match.line,
					match.column,
					match.line,
					match.column + matchLength
				);

				const message = locale.shameMessage(match.pattern.messageKey);
				const diag = new vscode.Diagnostic(
					range,
					message,
					this.mapSeverity(match.pattern.severity)
				);

				diag.source = DIAGNOSTIC_SOURCE;
				diag.code = match.pattern.id;

				diagnostics.push(diag);
			}

			this.collection.set(uri, diagnostics);
		}
	}

	clear(): void {
		this.collection.clear();
	}

	dispose(): void {
		this.collection.dispose();
	}

	private mapSeverity(severity: number): vscode.DiagnosticSeverity {
		if (severity <= 2) {
			return vscode.DiagnosticSeverity.Hint;
		}
		if (severity === 3) {
			return vscode.DiagnosticSeverity.Warning;
		}
		return vscode.DiagnosticSeverity.Information;
	}
}
