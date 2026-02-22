import * as vscode from "vscode";

export interface ShameSnapshot {
	timestamp: number;
	totalScore: number;
	fileCount: number;
	shameCount: number;
}

const HISTORY_KEY = "codeshamer.history";
const MAX_ENTRIES = 100;

export class ShameHistory {
	constructor(private context: vscode.ExtensionContext) {}

	getHistory(): ShameSnapshot[] {
		return this.context.workspaceState.get<ShameSnapshot[]>(
			HISTORY_KEY,
			[]
		);
	}

	record(snapshot: Omit<ShameSnapshot, "timestamp">): void {
		const history = this.getHistory();
		history.push({ ...snapshot, timestamp: Date.now() });
		if (history.length > MAX_ENTRIES) {
			history.shift();
		}
		this.context.workspaceState.update(HISTORY_KEY, history);
	}

	getTrend(): "improving" | "worsening" | "stable" | "insufficient" {
		const history = this.getHistory();
		if (history.length < 2) {
			return "insufficient";
		}
		const recent = history[history.length - 1].totalScore;
		const previous = history[history.length - 2].totalScore;
		if (recent < previous) {
			return "improving";
		}
		if (recent > previous) {
			return "worsening";
		}
		return "stable";
	}
}
