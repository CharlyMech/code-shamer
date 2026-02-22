import { ShameMatch, FileShameResult } from "./types";
import { getRulesForLanguage } from "./languageRules";
import { getIgnoredLines } from "./ignoreParser";
import { getSettings } from "../settings";

export function analyzeFile(
	content: string,
	languageId: string,
	filePath: string
): FileShameResult {
	const settings = getSettings();
	const rules = getRulesForLanguage(languageId);
	const disabledRules = new Set(settings.disabledRules);
	const activeRules = rules.filter(
		(r) =>
			!disabledRules.has(r.id) &&
			r.severity >= settings.severityThreshold
	);

	const lines = content.split("\n");
	const ignoredLines = getIgnoredLines(lines);
	const matches: ShameMatch[] = [];

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		if (ignoredLines.has(lineIndex)) {
			continue;
		}

		const lineText = lines[lineIndex];

		for (const rule of activeRules) {
			if (rule.multiline) {
				continue;
			}

			const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
			const match = regex.exec(lineText);
			if (match) {
				matches.push({
					pattern: rule,
					line: lineIndex,
					column: match.index,
					lineText,
					filePath,
				});
			}
		}
	}

	for (const rule of activeRules) {
		if (!rule.multiline) {
			continue;
		}

		const regex = new RegExp(
			rule.pattern.source,
			rule.pattern.flags.includes("g")
				? rule.pattern.flags
				: rule.pattern.flags + "g"
		);
		let match: RegExpExecArray | null;
		while ((match = regex.exec(content)) !== null) {
			const line =
				content.substring(0, match.index).split("\n").length - 1;
			if (!ignoredLines.has(line)) {
				matches.push({
					pattern: rule,
					line,
					column: 0,
					lineText: lines[line],
					filePath,
				});
			}
		}
	}

	const totalScore = matches.reduce((sum, m) => sum + m.pattern.severity, 0);

	return { filePath, languageId, matches, totalScore };
}
