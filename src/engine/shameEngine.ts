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

	// Mask string literals to avoid false positives in strings, preserving newlines
	const maskedContent = content.replace(/(["'`])(?:(?=(\\?))\2[\s\S])*?\1/g, match => {
		return match.replace(/[^\r\n]/g, " ");
	});

	const lines = content.split("\n");
	const maskedLines = maskedContent.split("\n");
	const ignoredLines = getIgnoredLines(lines);
	const isFileIgnored = lines.some(l => /\bcode-shamer-ignore-file\b/.test(l));
	const matches: ShameMatch[] = [];
	let skippedShames = 0;

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		const lineText = lines[lineIndex];
		const maskedLine = maskedLines[lineIndex];
		const isIgnored = isFileIgnored || ignoredLines.has(lineIndex);

		for (const rule of activeRules) {
			if (rule.multiline) {
				continue;
			}

			const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
			const matchRegex = regex.exec(maskedLine);
			if (matchRegex) {
				if (isIgnored) {
					skippedShames++;
				} else {
					matches.push({
						pattern: rule,
						line: lineIndex,
						column: matchRegex.index,
						lineText,
						filePath,
					});
				}
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
		while ((match = regex.exec(maskedContent)) !== null) {
			const line =
				content.substring(0, match.index).split("\n").length - 1;
			if (isFileIgnored || ignoredLines.has(line)) {
				skippedShames++;
			} else {
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

	return { filePath, languageId, matches, skippedShames };
}
