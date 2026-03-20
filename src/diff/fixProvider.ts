import * as vscode from "vscode";
import { analyzeFile } from "../engine/shameEngine";

export class CodeShamerFixProvider implements vscode.TextDocumentContentProvider {
    static scheme = "codeshamer-fix";

    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        const originalUri = vscode.Uri.parse(uri.query);
        const doc = await vscode.workspace.openTextDocument(originalUri);
        
        const result = analyzeFile(doc.getText(), doc.languageId, doc.uri.fsPath);
        
        let contentStr = doc.getText();
        let lines = contentStr.split(/\r?\n/);
        
        const sortedMatches = [...result.matches].sort((a, b) => {
            if (a.line !== b.line) {
				return b.line - a.line;
			}
            return b.column - a.column;
        });

        for (const match of sortedMatches) {
            const id = match.pattern.id;
            const lineText = lines[match.line];
			
            if (id === "js-var-usage") {
                lines[match.line] = lineText.replace(/\bvar\b/, "let");
            } else if (id === "js-loose-equality") {
                lines[match.line] = lineText.replace(/([^!=])==([^=])/, "$1===$2");
            } else if (id === "js-loose-inequality") {
                lines[match.line] = lineText.replace(/!=([^=])/, "!==$1");
            } else if (id === "js-debugger" || id === "js-console-log" || id === "js-alert") {
                lines[match.line] = ""; // Completely remove instead of commenting
            }
        }
        
        const eol = doc.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";
        return lines.join(eol);
    }
}
