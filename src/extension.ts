import * as vscode from "vscode";
import { WorkspaceScanner } from "./scanner/workspaceScanner";
import { ShameDiagnosticsManager } from "./diagnostics";
import { ShamePanelProvider } from "./sidebar/shamePanelProvider";
import { ShameTreeProvider } from "./sidebar/shameTreeProvider";
import { ShameCodeActionProvider } from "./codeActions/shameCodeActionProvider";
import { ShameHistory } from "./history/shameHistory";
import { AchievementTracker } from "./history/achievements";
import { getSettings } from "./settings";
import { getLocale } from "./i18n";
import { getRandomRoastKey } from "./roasts/roastMessages";
import { isCodeShamerLanguage } from "./languages";
import {
	missingLanguageExtensions,
	refreshInstalledTooling,
	suggestMissingToolingOnce,
} from "./integrations/workspaceTooling";

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
		showCollapseAll: true,
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
	let scanContext: "startup" | "manual" | "save" | "edit" | "file" = "manual";

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			ShamePanelProvider.viewType,
			panelProvider
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

	const rescanFile = async (uri: vscode.Uri): Promise<void> => {
		scanner.invalidateFile(uri.fsPath);
		await scanner.scanFile(uri);
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
		const isFileScan = scanContext === "file";
		const allowNotifications =
			!isEditScan &&
			!isFileScan &&
			(!isStartupScan || allowStartupNoise);
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
				showOptionalCompletionStatus(roastMessage);
			}
		}
	});

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
			"code-shamer.shameThisFile",
			async (fileUri?: vscode.Uri | { resourceUri?: vscode.Uri }) => {
				let uri: vscode.Uri | undefined;
				if (fileUri instanceof vscode.Uri) {
					uri = fileUri;
				} else if (
					fileUri &&
					"resourceUri" in fileUri &&
					fileUri.resourceUri instanceof vscode.Uri
				) {
					uri = fileUri.resourceUri;
				} else {
					uri = vscode.window.activeTextEditor?.document.uri;
				}

				if (!uri || uri.scheme !== "file") {
					return;
				}

				const doc = await vscode.workspace.openTextDocument(uri);
				if (!isCodeShamerLanguage(doc.languageId)) {
					vscode.window.showInformationMessage(
						locale.languageDisabled
					);
					return;
				}

				const missingExts = missingLanguageExtensions(doc.languageId);
				if (missingExts.length > 0) {
					const extList = missingExts.join(", ");
					const action = await vscode.window.showWarningMessage(
						`CodeShamer needs ${extList} to roast ${doc.languageId} files properly (and get real snippets).`,
						"Show extensions"
					);
					if (action === "Show extensions") {
						await vscode.commands.executeCommand(
							"workbench.extensions.search",
							extList.split(",")[0]?.trim()
						);
					}
				}

				scanContext = "file";
				handleScanState(true);
				const result = await scanner.scanFile(uri);
				handleScanState(false);
				scanContext = "manual";

				if (result.matches.length === 0) {
					vscode.window.showInformationMessage(locale.ui.noShamesInFile);
					return;
				}

				const first = result.matches[0];
				const pos = new vscode.Position(first.line, first.column);
				await vscode.window.showTextDocument(uri, {
					selection: new vscode.Range(pos, pos),
					preview: false,
				});

				await vscode.commands.executeCommand(
					"codeshamer.treeView.focus"
				);
				await treeProvider.revealFirstMatch(treeView, uri.fsPath);
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
					await rescanFile(uri);
				}
			}
		),

		vscode.commands.registerCommand("code-shamer.scanning", () => {})
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

	if (settings.scanOnSave) {
		context.subscriptions.push(
			vscode.workspace.onDidSaveTextDocument((doc) => {
				if (isCodeShamerLanguage(doc.languageId)) {
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
				if (!isCodeShamerLanguage(doc.languageId)) {
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

	context.subscriptions.push(
		diagnostics,
		scanner,
		vscode.extensions.onDidChange(() => {
			refreshInstalledTooling();
		})
	);

	panelProvider.setLoading();
	void suggestMissingToolingOnce(context);
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
