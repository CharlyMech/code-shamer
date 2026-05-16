import * as vscode from "vscode";
import { ShameHistory } from "./shameHistory";
import { getLocale } from "../i18n";

interface Achievement {
	id: string;
	titleKey: string;
	descriptionKey: string;
	icon: string;
	check: (history: ShameHistory) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
	{
		id: "first-scan",
		titleKey: "achievement.firstScan.title",
		descriptionKey: "achievement.firstScan.desc",
		icon: "🏅",
		check: (h) => h.getHistory().length >= 1,
	},
	{
		id: "first-fix",
		titleKey: "achievement.firstFix.title",
		descriptionKey: "achievement.firstFix.desc",
		icon: "🏆",
		check: (h) => {
			const hist = h.getHistory();
			return (
				hist.length >= 2 &&
				hist[hist.length - 1].totalShames <
					hist[hist.length - 2].totalShames
			);
		},
	},
	{
		id: "half-shame",
		titleKey: "achievement.halfShame.title",
		descriptionKey: "achievement.halfShame.desc",
		icon: "🚀",
		check: (h) => {
			const hist = h.getHistory();
			if (hist.length < 2) {
				return false;
			}
			return (
				hist[hist.length - 1].totalShames <=
				hist[0].totalShames * 0.5
			);
		},
	},
	{
		id: "clean-slate",
		titleKey: "achievement.cleanSlate.title",
		descriptionKey: "achievement.cleanSlate.desc",
		icon: "⭐",
		check: (h) => {
			const hist = h.getHistory();
			return hist.length > 0 && hist[hist.length - 1].totalShames === 0;
		},
	},
	{
		id: "persistent",
		titleKey: "achievement.persistent.title",
		descriptionKey: "achievement.persistent.desc",
		icon: "❤️",
		check: (h) => h.getHistory().length >= 10,
	},
];

const UNLOCKED_KEY = "codeshamer.achievements";

export class AchievementTracker {
	constructor(private context: vscode.ExtensionContext) {}

	checkAndNotify(history: ShameHistory, notificationsEnabled = true): void {
		const locale = getLocale();
		const unlocked = this.context.workspaceState.get<string[]>(
			UNLOCKED_KEY,
			[]
		);

		for (const ach of ACHIEVEMENTS) {
			if (unlocked.includes(ach.id)) {
				continue;
			}

			if (ach.check(history)) {
				unlocked.push(ach.id);
				if (notificationsEnabled) {
					const title =
						locale.achievements[ach.titleKey] ?? ach.titleKey;
					const banner = locale.ui.achievementBanner(title);
					vscode.window.showInformationMessage(`${ach.icon} ${banner}`);
				}
			}
		}

		this.context.workspaceState.update(UNLOCKED_KEY, unlocked);
	}
}
