import { ShameMatch, FileShameResult } from "./types";
import { getRulesForLanguage } from "./languageRules";
import { getIgnoreState, isIgnoredByDirective } from "./ignoreParser";
import { getSettings } from "../settings";
import { analyzeAstRules } from "./astRules";

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
	const ignoreState = getIgnoreState(lines);
	const matches: ShameMatch[] = [];
	const seen = new Set<string>();
	let skippedShames = 0;

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		const lineText = lines[lineIndex];
		const maskedLine = maskedLines[lineIndex];

		for (const rule of activeRules) {
			if (rule.multiline || rule.engine === "ast") {
				continue;
			}

			const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
			const hasGlobal = regex.flags.includes("g");
			let matchRegex: RegExpExecArray | null;
			while ((matchRegex = regex.exec(maskedLine)) !== null) {
				if (isIgnoredByDirective(ignoreState, lineIndex, rule.id)) {
					skippedShames++;
				} else {
					const endColumn = matchRegex.index + Math.max(matchRegex[0].length, 1);
					const key = `${rule.id}:${lineIndex}:${matchRegex.index}:${endColumn}`;
					if (seen.has(key)) {
						if (!hasGlobal) {
							break;
						}
						continue;
					}
					seen.add(key);
					matches.push({
						pattern: rule,
						line: lineIndex,
						column: matchRegex.index,
						endLine: lineIndex,
						endColumn,
						lineText,
						filePath,
					});
				}
				if (!hasGlobal) {
					break;
				}
				if (matchRegex[0].length === 0) {
					regex.lastIndex++;
				}
			}
		}
	}

	for (const rule of activeRules) {
		if (!rule.multiline || rule.engine === "ast") {
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
			const before = content.substring(0, match.index);
			const line = before.split("\n").length - 1;
			const column = before.length - before.lastIndexOf("\n") - 1;
			const length = Math.max(match[0]?.length ?? 0, 1);
			const endOffset = match.index + length;
			const beforeEnd = content.substring(0, endOffset);
			const endLine = beforeEnd.split("\n").length - 1;
			const endColumn = beforeEnd.length - beforeEnd.lastIndexOf("\n") - 1;
			if (isIgnoredByDirective(ignoreState, line, rule.id)) {
				skippedShames++;
			} else {
				const key = `${rule.id}:${line}:${column}:${endLine}:${endColumn}`;
				if (seen.has(key)) {
					continue;
				}
				seen.add(key);
				matches.push({
					pattern: rule,
					line,
					column,
					endLine,
					endColumn,
					lineText: lines[line],
					filePath,
				});
			}
			if (match[0].length === 0) {
				regex.lastIndex++;
			}
		}
	}

	for (const astMatch of analyzeAstRules(
		content,
		languageId,
		filePath,
		activeRules
	)) {
		if (
			isIgnoredByDirective(
				ignoreState,
				astMatch.line,
				astMatch.pattern.id
			)
		) {
			skippedShames++;
			continue;
		}
		const endLine = astMatch.endLine ?? astMatch.line;
		const endColumn = astMatch.endColumn ?? astMatch.column + 1;
		const key = `${astMatch.pattern.id}:${astMatch.line}:${astMatch.column}:${endLine}:${endColumn}`;
		if (!seen.has(key)) {
			seen.add(key);
			matches.push(astMatch);
		}
	}

	return { filePath, languageId, matches, skippedShames };
}
