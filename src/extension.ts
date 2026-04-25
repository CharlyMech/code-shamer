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

	const locale = getLocale();
	const scanner = new WorkspaceScanner();
	const diagnostics = new ShameDiagnosticsManager();
	const panelProvider = new ShamePanelProvider(context.extensionUri);
	const treeProvider = new ShameTreeProvider();
	const history = new ShameHistory(context);
	const achievements = new AchievementTracker(context);
	const statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		1000
	);
	statusBarItem.name = "CodeShamer Scan";
	statusBarItem.text = "$(sync~spin) CodeShamer: Scanning workspace...";
	statusBarItem.tooltip = "CodeShamer scan is running";
	context.subscriptions.push(statusBarItem);
	let scanContext: "startup" | "manual" | "save" = "manual";

	// Register the unified sidebar panel (banner + file list)
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			ShamePanelProvider.viewType,
			panelProvider
		),
		vscode.workspace.registerTextDocumentContentProvider(
			CodeShamerFixProvider.scheme,
			new CodeShamerFixProvider()
		),
		vscode.window.registerTreeDataProvider(
			"codeshamer.treeView",
			treeProvider
		)
	);

	// Wire scan results to diagnostics, panel, history, achievements
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
		origin: "startup" | "manual" | "save"
	): Promise<void> => {
		scanContext = origin;
		handleScanState(true);
		await scanner.scanWorkspace();
		handleScanState(false);
		scanContext = "manual";
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
		const allowNotifications = !isStartupScan || allowStartupNoise;
		const allowAchievements =
			settings.showAchievementNotifications && allowNotifications;
		achievements.checkAndNotify(history, allowAchievements);

		// Show roast message if enabled
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
	});

	// Commands
	
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
			vscode.window.showInformationMessage(
				"CodeShamer: Cache cleared. Run scan again."
			);
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
						`CodeShamer: Rule '${ruleId}' has been disabled in the workspace.`
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
				const fileName = uri.path.split("/").pop() || "File";
				const originalDoc = await vscode.workspace.openTextDocument(uri);
				const suggestedFixes = buildSuggestedFixLines(
					originalDoc.getText(),
					originalDoc.languageId,
					originalDoc.uri.fsPath
				);
				if (suggestedFixes.suggestions.length === 0) {
					handleScanState(false);
					vscode.window.showInformationMessage(
						"CodeShamer: No recommended auto-fixes available for this file yet."
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
					`CodeShamer: ${fileName} ↔ Fixed`
				);
				const scanResult = analyzeFile(
					originalDoc.getText(),
					originalDoc.languageId,
					originalDoc.uri.fsPath
				);
				const suggestionByLine = new Map<number, string>();
				for (const suggestion of suggestedFixes.suggestions) {
					if (!suggestionByLine.has(suggestion.line)) {
						suggestionByLine.set(suggestion.line, suggestion.fixedText);
					}
				}
				const reviewMatches = scanResult.matches
					.filter((match) => suggestionByLine.has(match.line))
					.map((match) => ({
						...match,
						filePath: uri.fsPath,
						sourceUri: fixUri.toString(),
						lineText: suggestionByLine.get(match.line) ?? match.lineText,
						column: 0,
						endColumn:
							Math.max(
								1,
								(suggestionByLine.get(match.line) ?? "").length
							),
					}));
				diagnostics.setDocumentDiagnostics(fixUri, reviewMatches);

				handleScanState(false);
				const result = scanner.lastResult?.files.find(
					(f) => f.filePath === uri.fsPath
				);
				const hasShames = result ? result.matches.length > 0 : false;
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

		vscode.commands.registerCommand(
			"code-shamer.reviewFixes",
			(arg?: any) => {
				let uri: vscode.Uri | undefined;
				if (arg instanceof vscode.Uri) {
					uri = arg;
				} else if (arg && arg.resourceUri instanceof vscode.Uri) {
					uri = arg.resourceUri;
				} else if (arg && arg.file && typeof arg.file.filePath === "string") {
					uri = vscode.Uri.file(arg.file.filePath);
				}
				vscode.commands.executeCommand("code-shamer.scanCurrentFile", uri);
			}
		),

		vscode.commands.registerCommand("code-shamer.applyFixInline", async (uri: vscode.Uri, lineIndex: number, fixedText: string) => {
			const edit = new vscode.WorkspaceEdit();
			const doc = await vscode.workspace.openTextDocument(uri);
			const lineLength = doc.lineAt(lineIndex).text.length;
			edit.replace(uri, new vscode.Range(lineIndex, 0, lineIndex, lineLength), fixedText);
			
			if (await vscode.workspace.applyEdit(edit)) {
				await doc.save();
				await closeDiffTabAndRescan(uri);
			}
		}),

		vscode.commands.registerCommand("code-shamer.applySuggestionAtCursor", async () => {
			const activeEditor = vscode.window.activeTextEditor;
			const originalUri = getOriginalUriFromFixEditor(activeEditor);
			if (!activeEditor || !originalUri) {
				vscode.window.showInformationMessage(
					"CodeShamer: Open a CodeShamer fixes diff to apply suggestions."
				);
				return;
			}
			const line = activeEditor.selection.active.line;
			const result = await applySuggestionAtLine(originalUri, line);
			if (!result.applied) {
				vscode.window.showInformationMessage(
					"CodeShamer: No suggested change for the current line."
				);
				return;
			}
			await closeDiffTabAndRescan(originalUri);
			vscode.commands.executeCommand("code-shamer.scanCurrentFile", originalUri);
		}),

		vscode.commands.registerCommand("code-shamer.applyAllSuggestionsInFile", async () => {
			const originalUri = getOriginalUriFromFixEditor();
			if (!originalUri) {
				vscode.window.showInformationMessage(
					"CodeShamer: Open a CodeShamer fixes diff to apply all suggestions."
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
					"CodeShamer: No suggested changes to apply."
				);
				return;
			}

			const sorted = [...suggested.suggestions].sort((a, b) => b.line - a.line);
			const edit = new vscode.WorkspaceEdit();
			for (const item of sorted) {
				const lineLength =
					item.line < doc.lineCount ? doc.lineAt(item.line).text.length : 0;
				edit.replace(
					originalUri,
					new vscode.Range(item.line, 0, item.line, lineLength),
					item.fixedText
				);
			}
			if (await vscode.workspace.applyEdit(edit)) {
				await doc.save();
				await closeDiffTabAndRescan(originalUri);
				vscode.commands.executeCommand("code-shamer.scanCurrentFile", originalUri);
			}
		}),

		vscode.commands.registerCommand("code-shamer.ignoreSuggestionAtCursor", async () => {
			const activeEditor = vscode.window.activeTextEditor;
			const originalUri = getOriginalUriFromFixEditor(activeEditor);
			if (!activeEditor || !originalUri) {
				vscode.window.showInformationMessage(
					"CodeShamer: Open a CodeShamer fixes diff to ignore a suggestion."
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
			const suggestion = suggested.suggestions.find((item) => item.line === line);
			if (!suggestion) {
				vscode.window.showInformationMessage(
					"CodeShamer: No suggested change on the current line."
				);
				return;
			}
			await vscode.commands.executeCommand(
				"code-shamer.ignoreInline",
				originalUri,
				line,
				suggestion.match.pattern.id
			);
		}),

		vscode.commands.registerCommand("code-shamer.ignoreInline", async (uri: vscode.Uri, lineIndex: number, ruleId?: string) => {
			const edit = new vscode.WorkspaceEdit();
			const doc = await vscode.workspace.openTextDocument(uri);
			
			const commentPrefix = doc.languageId === "html" ? "<!--" : doc.languageId === "css" ? "/*" : "//";
			const commentSuffix = doc.languageId === "html" ? " -->" : doc.languageId === "css" ? " */" : "";
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
		}),

		vscode.commands.registerCommand("code-shamer.ignoreFileFromDiff", async (arg?: any) => {
			let activeDiffUri: vscode.Uri | undefined;
			
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor && activeEditor.document.uri.scheme === "codeshamer-fix") {
				activeDiffUri = vscode.Uri.parse(activeEditor.document.uri.query);
			} else if (arg && arg.query) {
				activeDiffUri = vscode.Uri.parse(arg.query);
			}
			
			if (!activeDiffUri) {
				return;
			}
			
			const edit = new vscode.WorkspaceEdit();
			const doc = await vscode.workspace.openTextDocument(activeDiffUri);
			
			const commentPrefix = doc.languageId === "html" ? "<!--" : doc.languageId === "css" ? "/*" : "//";
			const commentSuffix = doc.languageId === "html" ? " -->" : doc.languageId === "css" ? " */" : "";
			const eol = doc.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";
			
			edit.insert(activeDiffUri, new vscode.Position(0, 0), `${commentPrefix} code-shamer-ignore-file${commentSuffix}${eol}`);
			
			if (await vscode.workspace.applyEdit(edit)) {
				await doc.save();
				await closeDiffTabAndRescan(activeDiffUri);
			}
		}),

		vscode.commands.registerCommand("code-shamer.scanning", () => {})
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

	// Register code action provider for all enabled languages
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

	// Register Diff Codelens Provider
	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider(
			{ scheme: "codeshamer-fix" },
			new ShameDiffCodeLensProvider()
		)
	);

	// File watcher: re-scan on save
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

	// Disposables
	context.subscriptions.push(diagnostics, scanner);

	// Auto-scan on activation
	panelProvider.setLoading();
	runWorkspaceScan("startup");
}

export function deactivate() {}
