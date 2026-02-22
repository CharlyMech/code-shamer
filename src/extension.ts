import * as vscode from "vscode";
import { createStatusBar } from "./statusBar";
import { WorkspaceScanner } from "./scanner/workspaceScanner";
import { ShameDiagnosticsManager } from "./diagnostics";
import { ShamePanelProvider } from "./sidebar/shamePanelProvider";
import { ShameCodeActionProvider } from "./codeActions/shameCodeActionProvider";
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
	const history = new ShameHistory(context);
	const achievements = new AchievementTracker(context);

	// Register the unified sidebar panel (banner + file list)
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			ShamePanelProvider.viewType,
			panelProvider
		)
	);

	// Status bar
	const statusBar = createStatusBar(context, scanner);

	// Wire scan results to diagnostics, panel, history, achievements
	scanner.onDidScanComplete((result) => {
		diagnostics.update(result);
		panelProvider.update(result);

		history.record({
			totalScore: result.totalScore,
			fileCount: result.files.length,
			shameCount: result.totalShames,
		});

		achievements.checkAndNotify(history);

		// Show roast message if enabled
		if (settings.enableRoasts && result.totalShames > 0) {
			const roastKey = getRandomRoastKey(result.totalScore);
			const roastMessage = locale.roasts[roastKey];
			if (roastMessage) {
				vscode.window.setStatusBarMessage(
					`$(flame) ${roastMessage}`,
					5000
				);
			}
		}
	});

	// Commands
	context.subscriptions.push(
		vscode.commands.registerCommand(
			"code-shamer.scanWorkspace",
			async () => {
				panelProvider.setLoading();
				statusBar.setLoading();
				await scanner.scanWorkspace();
			}
		),

		vscode.commands.registerCommand("code-shamer.showPanel", () => {
			vscode.commands.executeCommand("codeshamer.panelView.focus");
		}),

		vscode.commands.registerCommand("code-shamer.clearCache", () => {
			scanner.clearCache();
			diagnostics.clear();
			vscode.window.showInformationMessage(
				"CodeShamer: Cache cleared. Run scan again."
			);
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
	statusBar.setLoading();
	scanner.scanWorkspace();
}

export function deactivate() {}
