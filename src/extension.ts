import * as vscode from "vscode";
import { WorkspaceScanner } from "./scanner/workspaceScanner";
import { ShameDiagnosticsManager } from "./diagnostics";
import { ShamePanelProvider } from "./sidebar/shamePanelProvider";
import { ShameTreeProvider } from "./sidebar/shameTreeProvider";
import { ShameCodeActionProvider } from "./codeActions/shameCodeActionProvider";
import { ShameDiffCodeLensProvider } from "./codeActions/shameDiffCodeLensProvider";
import { CodeShamerFixProvider, buildSuggestedFixLines } from "./diff/fixProvider";
import { ShameHistory } from "./history/shameHistory";
import { AchievementTracker } from "./history/achievements";
import { getSettings } from "./settings";
import { getLocale } from "./i18n";
import { getRandomRoastKey } from "./roasts/roastMessages";
import { analyzeFile } from "./engine/shameEngine";

const REFRESH_ON_CHANGE_DEBOUNCE_MS = 600;

interface ExtensionDisposables {
	output: vscode.OutputChannel;
	disposables: vscode.Disposable[];
}

const lifecycle: ExtensionDisposables = {
	output: undefined as unknown as vscode.OutputChannel,
	disposables: [],
};

export function activate(context: vscode.ExtensionContext) {
	try {
		_activate(context);
	} catch (err) {
		vscode.window.showErrorMessage(`CodeShamer failed to activate: ${err}`);
	}
}

function _activate(context: vscode.ExtensionContext) {
	const settings = getSettings();

	if (!settings.enabled) {
		return;
	}

	const output = vscode.window.createOutputChannel("CodeShamer");
	lifecycle.output = output;
	lifecycle.disposables.push(output);
	context.subscriptions.push(output);

	const locale = getLocale();
	const scanner = new WorkspaceScanner();
	const diagnostics = new ShameDiagnosticsManager();
	const panelProvider = new ShamePanelProvider(context.extensionUri);
	const treeProvider = new ShameTreeProvider();
	const history = new ShameHistory(context);
	const achievements = new AchievementTracker(context);

	const treeView = vscode.window.createTreeView("codeshamer.treeView", {
		treeDataProvider: treeProvider,
	});
	treeView.message = locale.ui.scanningWorkspace;
	context.subscriptions.push(treeView);
	treeProvider.attachTreeView(treeView);

	const statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		1000
	);
	statusBarItem.name = "CodeShamer Scan";
	statusBarItem.text = locale.ui.statusBarScanning;
	statusBarItem.tooltip = locale.ui.statusBarTooltip;
	context.subscriptions.push(statusBarItem);
	let scanContext: "startup" | "manual" | "save" | "edit" = "manual";

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			ShamePanelProvider.viewType,
			panelProvider
		),
		vscode.workspace.registerTextDocumentContentProvider(
			CodeShamerFixProvider.scheme,
			new CodeShamerFixProvider()
		)
	);

	const handleScanState = (active: boolean) => {
		vscode.commands.executeCommand("setContext", "codeShamer.isScanning", active);
		if (active) {
			statusBarItem.show();
		} else {
			statusBarItem.hide();
		}
	};

	const showOptionalCompletionStatus = (message: string): void => {
		if (!settings.showScanCompletionStatusMessage) {
			return;
		}
		if (!settings.showStatusBarOnlyWhileScanning) {
			vscode.window.setStatusBarMessage(message, 5000);
		}
	};

	const runWorkspaceScan = async (
		origin: "startup" | "manual" | "save" | "edit"
	): Promise<void> => {
		scanContext = origin;
		handleScanState(true);
		await scanner.scanWorkspace();
		handleScanState(false);
		scanContext = "manual";
	};

	const closeStaleFixTabsForCleanFiles = async (): Promise<void> => {
		const result = scanner.lastResult;
		if (!result) {
			return;
		}
		const cleanPaths = new Set(
			result.files
				.filter((f) => f.matches.length === 0)
				.map((f) => f.filePath)
		);
		const tabsToClose: vscode.Tab[] = [];
		for (const group of vscode.window.tabGroups.all) {
			for (const tab of group.tabs) {
				if (!(tab.input instanceof vscode.TabInputTextDiff)) {
					continue;
				}
				const modified = tab.input.modified;
				if (modified.scheme !== CodeShamerFixProvider.scheme) {
					continue;
				}
				try {
					const targetUri = vscode.Uri.parse(modified.query);
					if (cleanPaths.has(targetUri.fsPath)) {
						tabsToClose.push(tab);
					}
				} catch {
					// ignore parse errors
				}
			}
		}
		for (const tab of tabsToClose) {
			try {
				await vscode.window.tabGroups.close(tab);
			} catch (err) {
				output.appendLine(`Failed to close stale fix tab: ${err}`);
			}
		}
	};

	scanner.onDidScanComplete((result) => {
		diagnostics.update(result);
		panelProvider.update(result);
		treeProvider.update(result);

		history.record({
			totalShames: result.totalShames,
			skippedShames: result.skippedShames,
			fileCount: result.files.length,
		});

		const allowStartupNoise = settings.showStartupNotifications;
		const isStartupScan = scanContext === "startup";
		const isEditScan = scanContext === "edit";
		const allowNotifications =
			!isEditScan && (!isStartupScan || allowStartupNoise);
		const allowAchievements =
			settings.showAchievementNotifications && allowNotifications;
		achievements.checkAndNotify(history, allowAchievements);

		if (
			settings.enableRoasts &&
			result.totalShames > 0 &&
			allowNotifications
		) {
			const roastKey = getRandomRoastKey(result.totalShames);
			const roastMessage = locale.roasts[roastKey];
			if (roastMessage) {
				showOptionalCompletionStatus(`$(flame) ${roastMessage}`);
			}
		}

		void closeStaleFixTabsForCleanFiles();
	});

	async function closeDiffTabAndRescan(uri: vscode.Uri) {
		const fixUriStr = `${CodeShamerFixProvider.scheme}:${uri.path}?${uri.toString()}`;
		diagnostics.clearDocumentDiagnostics(vscode.Uri.parse(fixUriStr));
		const existingTab = vscode.window.tabGroups.all
			.flatMap((g) => g.tabs)
			.find((t) => {
				if (t.input instanceof vscode.TabInputTextDiff) {
					return t.input.modified.toString() === fixUriStr;
				}
				return false;
			});

		if (existingTab) {
			await vscode.window.tabGroups.close(existingTab);
		}

		scanner.invalidateFile(uri.fsPath);
		await runWorkspaceScan("manual");
	}

	const getOriginalUriFromFixEditor = (
		editor?: vscode.TextEditor
	): vscode.Uri | undefined => {
		const active = editor ?? vscode.window.activeTextEditor;
		if (!active || active.document.uri.scheme !== CodeShamerFixProvider.scheme) {
			return undefined;
		}
		return vscode.Uri.parse(active.document.uri.query);
	};

	const resolveOriginalUriArg = (
		arg: vscode.Uri | undefined
	): vscode.Uri | undefined => {
		if (arg instanceof vscode.Uri) {
			if (arg.scheme === CodeShamerFixProvider.scheme) {
				return vscode.Uri.parse(arg.query);
			}
			return arg;
		}
		return getOriginalUriFromFixEditor();
	};

	const applySuggestionAtLine = async (
		originalUri: vscode.Uri,
		line: number
	): Promise<{ applied: boolean; ruleId?: string }> => {
		const doc = await vscode.workspace.openTextDocument(originalUri);
		const suggested = buildSuggestedFixLines(
			doc.getText(),
			doc.languageId,
			doc.uri.fsPath
		);
		const suggestion = suggested.suggestions.find((item) => item.line === line);
		if (!suggestion) {
			return { applied: false };
		}

		const edit = new vscode.WorkspaceEdit();
		const lineLength =
			line < doc.lineCount ? doc.lineAt(line).text.length : 0;
		edit.replace(
			originalUri,
			new vscode.Range(line, 0, line, lineLength),
			suggestion.fixedText
		);
		if (await vscode.workspace.applyEdit(edit)) {
			await doc.save();
			return { applied: true, ruleId: suggestion.match.pattern.id };
		}
		return { applied: false };
	};

	context.subscriptions.push(
		vscode.commands.registerCommand("code-shamer.scanWorkspace", async () => {
			panelProvider.setLoading();
			treeProvider.setLoading();
			await runWorkspaceScan("manual");
		}),

		vscode.commands.registerCommand("code-shamer.showPanel", () => {
			vscode.commands.executeCommand("codeshamer.panelView.focus");
		}),

		vscode.commands.registerCommand("code-shamer.clearCache", () => {
			scanner.clearCache();
			diagnostics.clear();
			vscode.window.showInformationMessage(locale.ui.cacheCleared);
		}),

		vscode.commands.registerCommand(
			"code-shamer.disableRuleWorkspace",
			async (ruleId: string) => {
				if (!ruleId) {
					return;
				}
				const config = vscode.workspace.getConfiguration("codeShamer");
				const disabled = config.get<string[]>("disabledRules") || [];
				if (!disabled.includes(ruleId)) {
					await config.update(
						"disabledRules",
						[...disabled, ruleId],
						vscode.ConfigurationTarget.Workspace
					);
					vscode.window.showInformationMessage(
						locale.ui.ruleDisabled(ruleId)
					);
					scanner.clearCache();
					runWorkspaceScan("manual");
				}
			}
		),

		vscode.commands.registerCommand(
			"code-shamer.scanCurrentFile",
			async (fileUri?: vscode.Uri) => {
				let uri = fileUri || vscode.window.activeTextEditor?.document.uri;
				if (!uri) {
					return;
				}

				if (uri.scheme === CodeShamerFixProvider.scheme) {
					uri = vscode.Uri.parse(uri.query);
				}

				handleScanState(true);

				const fixUri = vscode.Uri.parse(
					`${CodeShamerFixProvider.scheme}:${uri.path}?${uri.toString()}`
				);
				const relativePath = vscode.workspace.asRelativePath(uri);
				const originalDoc = await vscode.workspace.openTextDocument(uri);
				const analysis = buildSuggestedFixLines(
					originalDoc.getText(),
					originalDoc.languageId,
					originalDoc.uri.fsPath
				);
				const hasSafe = analysis.suggestions.length > 0;
				const hasReview = analysis.reviews.length > 0;
				if (!hasSafe && !hasReview) {
					handleScanState(false);
					vscode.window.showInformationMessage(
						locale.ui.noRecommendedFixes
					);
					return;
				}

				const existingTab = vscode.window.tabGroups.all
					.flatMap((g) => g.tabs)
					.find((t) => {
						if (t.input instanceof vscode.TabInputTextDiff) {
							return t.input.modified.toString() === fixUri.toString();
						}
						return false;
					});

				if (existingTab) {
					await vscode.window.tabGroups.close(existingTab);
				}

				await vscode.commands.executeCommand(
					"vscode.diff",
					uri,
					fixUri,
					locale.ui.diffTitle(relativePath)
				);
				const scanResult = analyzeFile(
					originalDoc.getText(),
					originalDoc.languageId,
					originalDoc.uri.fsPath
				);
				const suggestionByLine = new Map<number, string>();
				for (const suggestion of analysis.suggestions) {
					if (!suggestionByLine.has(suggestion.line)) {
						suggestionByLine.set(suggestion.line, suggestion.fixedText);
					}
				}
				const reviewLines = new Set<number>();
				for (const review of analysis.reviews) {
					reviewLines.add(review.line);
				}
				const reviewMatches = scanResult.matches
					.filter(
						(match) =>
							suggestionByLine.has(match.line) ||
							reviewLines.has(match.line)
					)
					.map((match) => ({
						...match,
						filePath: uri.fsPath,
						sourceUri: fixUri.toString(),
						lineText:
							suggestionByLine.get(match.line) ?? match.lineText,
						column: 0,
						endColumn: Math.max(
							1,
							(suggestionByLine.get(match.line) ?? match.lineText)
								.length
						),
					}));
				diagnostics.setDocumentDiagnostics(fixUri, reviewMatches);

				handleScanState(false);
				const lastResult = scanner.lastResult?.files.find(
					(f) => f.filePath === uri.fsPath
				);
				const hasShames = lastResult
					? lastResult.matches.length > 0
					: false;
				vscode.commands.executeCommand(
					"setContext",
					"codeShamer.fileState",
					hasShames ? "shames" : "clean"
				);
			}
		),

		vscode.commands.registerCommand(
			"code-shamer.showFileShames",
			(uri?: vscode.Uri) => {
				vscode.commands.executeCommand("code-shamer.scanCurrentFile", uri);
			}
		),

		vscode.commands.registerCommand("code-shamer.reviewFixes", (arg?: any) => {
			let uri: vscode.Uri | undefined;
			if (arg instanceof vscode.Uri) {
				uri = arg;
			} else if (arg && arg.resourceUri instanceof vscode.Uri) {
				uri = arg.resourceUri;
			} else if (arg && arg.file && typeof arg.file.filePath === "string") {
				uri = vscode.Uri.file(arg.file.filePath);
			}
			vscode.commands.executeCommand("code-shamer.scanCurrentFile", uri);
		}),

		vscode.commands.registerCommand(
			"code-shamer.applyFixInline",
			async (uri: vscode.Uri, lineIndex: number, fixedText: string) => {
				if (!(uri instanceof vscode.Uri)) {
					vscode.window.showInformationMessage(
						locale.ui.openCodeShamerDiff
					);
					return;
				}
				const edit = new vscode.WorkspaceEdit();
				const doc = await vscode.workspace.openTextDocument(uri);
				const lineLength = doc.lineAt(lineIndex).text.length;
				edit.replace(
					uri,
					new vscode.Range(lineIndex, 0, lineIndex, lineLength),
					fixedText
				);

				if (await vscode.workspace.applyEdit(edit)) {
					await doc.save();
					await closeDiffTabAndRescan(uri);
				}
			}
		),

		vscode.commands.registerCommand(
			"code-shamer.applySuggestionAtCursor",
			async (originalUriArg?: vscode.Uri) => {
				const activeEditor = vscode.window.activeTextEditor;
				const originalUri = originalUriArg instanceof vscode.Uri
					? originalUriArg
					: getOriginalUriFromFixEditor(activeEditor);
				if (!activeEditor || !originalUri) {
					vscode.window.showInformationMessage(
						locale.ui.openCodeShamerDiff
					);
					return;
				}
				const fixUri = activeEditor.document.uri;
				if (
					fixUri.scheme === CodeShamerFixProvider.scheme &&
					fixUri.query !== originalUri.toString()
				) {
					vscode.window.showInformationMessage(
						locale.ui.openCodeShamerDiff
					);
					return;
				}
				const line = activeEditor.selection.active.line;
				const result = await applySuggestionAtLine(originalUri, line);
				if (!result.applied) {
					vscode.window.showInformationMessage(
						locale.ui.noSuggestedChange
					);
					return;
				}
				await closeDiffTabAndRescan(originalUri);
				vscode.commands.executeCommand(
					"code-shamer.scanCurrentFile",
					originalUri
				);
			}
		),

		vscode.commands.registerCommand(
			"code-shamer.applyAllSuggestionsInFile",
			async (originalUriArg?: vscode.Uri) => {
				const originalUri =
					originalUriArg instanceof vscode.Uri
						? originalUriArg
						: getOriginalUriFromFixEditor();
				if (!originalUri) {
					vscode.window.showInformationMessage(
						locale.ui.openCodeShamerDiff
					);
					return;
				}
				const activeEditor = vscode.window.activeTextEditor;
				if (
					activeEditor &&
					activeEditor.document.uri.scheme ===
						CodeShamerFixProvider.scheme &&
					activeEditor.document.uri.query !== originalUri.toString()
				) {
					vscode.window.showInformationMessage(
						locale.ui.openCodeShamerDiff
					);
					return;
				}
				const doc = await vscode.workspace.openTextDocument(originalUri);
				const suggested = buildSuggestedFixLines(
					doc.getText(),
					doc.languageId,
					doc.uri.fsPath
				);
				if (suggested.suggestions.length === 0) {
					vscode.window.showInformationMessage(
						locale.ui.noSuggestedChangesToApply
					);
					return;
				}

				const sorted = [...suggested.suggestions].sort(
					(a, b) => b.line - a.line
				);
				const edit = new vscode.WorkspaceEdit();
				for (const item of sorted) {
					const lineLength =
						item.line < doc.lineCount
							? doc.lineAt(item.line).text.length
							: 0;
					edit.replace(
						originalUri,
						new vscode.Range(item.line, 0, item.line, lineLength),
						item.fixedText
					);
				}
				if (await vscode.workspace.applyEdit(edit)) {
					await doc.save();
					await closeDiffTabAndRescan(originalUri);
					vscode.commands.executeCommand(
						"code-shamer.scanCurrentFile",
						originalUri
					);
				}
			}
		),

		vscode.commands.registerCommand(
			"code-shamer.ignoreSuggestionAtCursor",
			async (originalUriArg?: vscode.Uri) => {
				const activeEditor = vscode.window.activeTextEditor;
				const originalUri = originalUriArg instanceof vscode.Uri
					? originalUriArg
					: getOriginalUriFromFixEditor(activeEditor);
				if (!activeEditor || !originalUri) {
					vscode.window.showInformationMessage(
						locale.ui.openCodeShamerDiff
					);
					return;
				}
				const line = activeEditor.selection.active.line;
				const doc = await vscode.workspace.openTextDocument(originalUri);
				const suggested = buildSuggestedFixLines(
					doc.getText(),
					doc.languageId,
					doc.uri.fsPath
				);
				const candidate =
					suggested.suggestions.find((item) => item.line === line) ??
					suggested.reviews.find((item) => item.line === line);
				if (!candidate) {
					vscode.window.showInformationMessage(
						locale.ui.noSuggestedChange
					);
					return;
				}
				await vscode.commands.executeCommand(
					"code-shamer.ignoreInline",
					originalUri,
					line,
					candidate.match.pattern.id
				);
			}
		),

		vscode.commands.registerCommand(
			"code-shamer.ignoreInline",
			async (uri: vscode.Uri, lineIndex: number, ruleId?: string) => {
				if (!(uri instanceof vscode.Uri)) {
					return;
				}
				const edit = new vscode.WorkspaceEdit();
				const doc = await vscode.workspace.openTextDocument(uri);

				const commentPrefix =
					doc.languageId === "html"
						? "<!--"
						: doc.languageId === "css"
							? "/*"
							: "//";
				const commentSuffix =
					doc.languageId === "html"
						? " -->"
						: doc.languageId === "css"
							? " */"
							: "";
				const eol = doc.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";

				const directive = ruleId
					? `code-shamer-ignore-next-line ${ruleId}`
					: "code-shamer-ignore-next-line";
				edit.insert(
					uri,
					new vscode.Position(lineIndex, 0),
					`${commentPrefix} ${directive}${commentSuffix}${eol}`
				);

				if (await vscode.workspace.applyEdit(edit)) {
					await doc.save();
					await closeDiffTabAndRescan(uri);
				}
			}
		),

		vscode.commands.registerCommand(
			"code-shamer.ignoreFileFromDiff",
			async (arg?: any) => {
				const resolved = resolveOriginalUriArg(arg);
				if (!resolved) {
					return;
				}

				const edit = new vscode.WorkspaceEdit();
				const doc = await vscode.workspace.openTextDocument(resolved);

				const commentPrefix =
					doc.languageId === "html"
						? "<!--"
						: doc.languageId === "css"
							? "/*"
							: "//";
				const commentSuffix =
					doc.languageId === "html"
						? " -->"
						: doc.languageId === "css"
							? " */"
							: "";
				const eol = doc.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";

				edit.insert(
					resolved,
					new vscode.Position(0, 0),
					`${commentPrefix} code-shamer-ignore-file${commentSuffix}${eol}`
				);

				if (await vscode.workspace.applyEdit(edit)) {
					await doc.save();
					await closeDiffTabAndRescan(resolved);
				}
			}
		),

		vscode.commands.registerCommand("code-shamer.scanning", () => { })
	);

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				const result = scanner.lastResult?.files.find(
					(f) => f.filePath === editor.document.uri.fsPath
				);
				const hasShames = result ? result.matches.length > 0 : false;
				vscode.commands.executeCommand(
					"setContext",
					"codeShamer.fileState",
					hasShames ? "shames" : "clean"
				);
			}
		})
	);

	for (const lang of settings.enabledLanguages) {
		context.subscriptions.push(
			vscode.languages.registerCodeActionsProvider(
				{ language: lang, scheme: "file" },
				new ShameCodeActionProvider(),
				{
					providedCodeActionKinds:
						ShameCodeActionProvider.providedCodeActionKinds,
				}
			)
		);
	}

	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider(
			{ scheme: "codeshamer-fix" },
			new ShameDiffCodeLensProvider()
		)
	);

	if (settings.scanOnSave) {
		context.subscriptions.push(
			vscode.workspace.onDidSaveTextDocument((doc) => {
				if (settings.enabledLanguages.includes(doc.languageId)) {
					scanner.invalidateFile(doc.uri.fsPath);
					runWorkspaceScan("save");
				}
			})
		);
	}

	const editTimers = new Map<string, NodeJS.Timeout>();
	if (settings.scanOnEdit) {
		context.subscriptions.push(
			vscode.workspace.onDidChangeTextDocument((event) => {
				const doc = event.document;
				if (doc.uri.scheme !== "file") {
					return;
				}
				if (!settings.enabledLanguages.includes(doc.languageId)) {
					return;
				}
				const key = doc.uri.toString();
				const existing = editTimers.get(key);
				if (existing) {
					clearTimeout(existing);
				}
				const timer = setTimeout(() => {
					editTimers.delete(key);
					scanner.invalidateFile(doc.uri.fsPath);
					runWorkspaceScan("edit").catch((err) => {
						output.appendLine(
							`Edit refresh scan failed: ${err}`
						);
					});
				}, REFRESH_ON_CHANGE_DEBOUNCE_MS);
				editTimers.set(key, timer);
			}),
			{
				dispose: () => {
					for (const timer of editTimers.values()) {
						clearTimeout(timer);
					}
					editTimers.clear();
				},
			}
		);
	}

	context.subscriptions.push(diagnostics, scanner);

	panelProvider.setLoading();
	runWorkspaceScan("startup");
}

export function deactivate() {
	try {
		for (const disposable of lifecycle.disposables) {
			try {
				disposable.dispose();
			} catch (err) {
				if (isCancellationError(err)) {
					continue;
				}
				lifecycle.output?.appendLine(
					`CodeShamer deactivate: dispose error ${String(err)}`
				);
			}
		}
		lifecycle.disposables.length = 0;
	} catch (err) {
		if (!isCancellationError(err)) {
			console.error("CodeShamer: deactivate failed", err);
		}
	}
}

function isCancellationError(err: unknown): boolean {
	if (!err) {
		return false;
	}
	const name = (err as { name?: string }).name;
	const message = (err as { message?: string }).message;
	return (
		name === "Canceled" ||
		name === "CancellationError" ||
		message === "Canceled" ||
		message === "Operation cancelled"
	);
}
