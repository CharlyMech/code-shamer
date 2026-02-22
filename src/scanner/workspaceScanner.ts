import * as vscode from "vscode";
import { analyzeFile } from "../engine/shameEngine";
import { FileCache } from "./fileCache";
import {
	WorkspaceShameResult,
	FileShameResult,
	ShameCategory,
} from "../engine/types";
import { getSettings } from "../settings";

const LANG_EXTENSIONS: Record<string, string[]> = {
	javascript: ["js", "jsx", "mjs", "cjs"],
	javascriptreact: ["jsx"],
	typescript: ["ts", "tsx", "mts", "cts"],
	typescriptreact: ["tsx"],
	python: ["py"],
	java: ["java"],
	cpp: ["cpp", "cxx", "cc", "hpp", "hxx"],
	c: ["c", "h"],
	dart: ["dart"],
	php: ["php"],
};

export class WorkspaceScanner {
	private cache = new FileCache();
	private _onDidScanComplete =
		new vscode.EventEmitter<WorkspaceShameResult>();
	readonly onDidScanComplete = this._onDidScanComplete.event;
	private _scanning = false;
	private _lastResult: WorkspaceShameResult | undefined;

	get isScanning(): boolean {
		return this._scanning;
	}

	get lastResult(): WorkspaceShameResult | undefined {
		return this._lastResult;
	}

	async scanWorkspace(): Promise<WorkspaceShameResult> {
		if (this._scanning) {
			return this._lastResult ?? this.emptyResult();
		}

		this._scanning = true;

		try {
			const settings = getSettings();
			const enabledLanguages = settings.enabledLanguages;

			const extensions = new Set<string>();
			for (const lang of enabledLanguages) {
				const exts = LANG_EXTENSIONS[lang];
				if (exts) {
					for (const ext of exts) {
						extensions.add(ext);
					}
				}
			}

			if (extensions.size === 0) {
				const result = this.emptyResult();
				this._lastResult = result;
				this._onDidScanComplete.fire(result);
				return result;
			}

			const extArray = [...extensions];
			const includePattern =
				extArray.length === 1
					? `**/*.${extArray[0]}`
					: `**/*.{${extArray.join(",")}}`;
			const excludePattern = `{${settings.excludePatterns.join(",")}}`;

			const uris = await vscode.workspace.findFiles(
				includePattern,
				excludePattern,
				settings.maxFilesToScan
			);

			const files: FileShameResult[] = [];

			for (const uri of uris) {
				try {
					const stat = await vscode.workspace.fs.stat(uri);
					const cached = this.cache.get(uri.fsPath, stat.mtime);

					if (cached) {
						files.push(cached);
					} else {
						const doc =
							await vscode.workspace.openTextDocument(uri);
						const result = analyzeFile(
							doc.getText(),
							doc.languageId,
							uri.fsPath
						);
						this.cache.set(uri.fsPath, stat.mtime, result);
						files.push(result);
					}
				} catch {
					// Skip files that can't be read
				}
			}

			const wsResult = this.aggregateResults(files);
			this._lastResult = wsResult;
			this._onDidScanComplete.fire(wsResult);
			return wsResult;
		} finally {
			this._scanning = false;
		}
	}

	invalidateFile(filePath: string): void {
		this.cache.delete(filePath);
	}

	clearCache(): void {
		this.cache.clear();
	}

	private aggregateResults(files: FileShameResult[]): WorkspaceShameResult {
		const byCategory = {} as Record<ShameCategory, number>;
		const bySeverity: Record<number, number> = {};
		let totalScore = 0;
		let totalShames = 0;

		for (const file of files) {
			totalScore += file.totalScore;
			totalShames += file.matches.length;
			for (const match of file.matches) {
				const cat = match.pattern.category;
				byCategory[cat] = (byCategory[cat] || 0) + 1;
				const sev = match.pattern.severity;
				bySeverity[sev] = (bySeverity[sev] || 0) + 1;
			}
		}

		return {
			files,
			totalScore,
			totalShames,
			byCategory,
			bySeverity,
			timestamp: Date.now(),
		};
	}

	private emptyResult(): WorkspaceShameResult {
		return {
			files: [],
			totalScore: 0,
			totalShames: 0,
			byCategory: {} as Record<ShameCategory, number>,
			bySeverity: {},
			timestamp: Date.now(),
		};
	}

	dispose(): void {
		this._onDidScanComplete.dispose();
	}
}
