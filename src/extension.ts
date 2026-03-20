import * as vscode from "vscode";
import { WorkspaceScanner } from "./scanner/workspaceScanner";
import { ShameDiagnosticsManager } from "./diagnostics";
import { ShamePanelProvider } from "./sidebar/shamePanelProvider";
import { ShameTreeProvider } from "./sidebar/shameTreeProvider";
import { ShameCodeActionProvider } from "./codeActions/shameCodeActionProvider";
import { ShameDiffCodeLensProvider } from "./codeActions/shameDiffCodeLensProvider";
import { CodeShamerFixProvider } from "./diff/fixProvider";
import { ShameHistory } from "./history/shameHistory";
import { AchievementTracker } from "./history/achievements";
import { getSettings } from "./settings";
import { getLocale } from "./i18n";
import { getRandomRoastKey } from "./roasts/roastMessages";

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
	scanner.onDidScanComplete((result) => {
		diagnostics.update(result);
		panelProvider.update(result);
		treeProvider.update(result);

		history.record({
			totalShames: result.totalShames,
			skippedShames: result.skippedShames,
			fileCount: result.files.length,
		});

		achievements.checkAndNotify(history);

		// Show roast message if enabled
		if (settings.enableRoasts && result.totalShames > 0) {
			const roastKey = getRandomRoastKey(result.totalShames);
			const roastMessage = locale.roasts[roastKey];
			if (roastMessage) {
				vscode.window.setStatusBarMessage(`$(flame) ${roastMessage}`, 5000);
			}
		}
	});

	// Commands
	
	async function closeDiffTabAndRescan(uri: vscode.Uri) {
		const existingTab = vscode.window.tabGroups.all
			.flatMap((g) => g.tabs)
			.find((t) => {
				if (t.input instanceof vscode.TabInputTextDiff) {
					const fixUriStr = `${CodeShamerFixProvider.scheme}:${uri.path}?${uri.toString()}`;
					return t.input.modified.toString() === fixUriStr;
				}
				return false;
			});

		if (existingTab) {
			await vscode.window.tabGroups.close(existingTab);
		}
		
		scanner.invalidateFile(uri.fsPath);
		scanner.scanWorkspace();
	}

	context.subscriptions.push(
		vscode.commands.registerCommand("code-shamer.scanWorkspace", async () => {
			panelProvider.setLoading();
			treeProvider.setLoading();
			vscode.commands.executeCommand("setContext", "codeShamer.isScanning", true);
			await scanner.scanWorkspace();
			vscode.commands.executeCommand("setContext", "codeShamer.isScanning", false);
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

				vscode.commands.executeCommand(
					"setContext",
					"codeShamer.isScanning",
					true
				);

				const fixUri = vscode.Uri.parse(
					`${CodeShamerFixProvider.scheme}:${uri.path}?${uri.toString()}`
				);
				const fileName = uri.path.split("/").pop() || "File";

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

				vscode.commands.executeCommand(
					"setContext",
					"codeShamer.isScanning",
					false
				);
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

		vscode.commands.registerCommand("code-shamer.ignoreInline", async (uri: vscode.Uri, lineIndex: number) => {
			const edit = new vscode.WorkspaceEdit();
			const doc = await vscode.workspace.openTextDocument(uri);
			
			const commentPrefix = doc.languageId === "html" ? "<!--" : doc.languageId === "css" ? "/*" : "//";
			const commentSuffix = doc.languageId === "html" ? " -->" : doc.languageId === "css" ? " */" : "";
			const eol = doc.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";
			
			edit.insert(uri, new vscode.Position(lineIndex, 0), `${commentPrefix} code-shamer-ignore-next-line${commentSuffix}${eol}`);
			
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
					scanner.scanWorkspace();
				}
			})
		);
	}

	// Disposables
	context.subscriptions.push(diagnostics, scanner);

	// Auto-scan on activation
	panelProvider.setLoading();
	vscode.commands.executeCommand("setContext", "codeShamer.isScanning", true);
	scanner.scanWorkspace().then(() => {
		vscode.commands.executeCommand("setContext", "codeShamer.isScanning", false);
	});
}

export function deactivate() {}
