export interface IgnoreState {
	fileIgnored: boolean;
	allRulesIgnoredLines: Set<number>;
	ruleIgnoredLines: Map<number, Set<string>>;
}

const ANY_LINE_IGNORE_PATTERNS = [
	/(?:\/\/|#|--|\/\*|<!--)\s*code-shamer-ignore(?:\s|\*|-->|$)/,
];

const NEXT_LINE_IGNORE_PATTERNS = [
	/(?:\/\/|#|--|\/\*|<!--)\s*code-shamer-ignore-next-line(?:\s|\*|-->|$)/,
];

const RULE_NEXT_LINE_PATTERN =
	/(?:\/\/|#|--|\/\*|<!--)\s*code-shamer-ignore-next-line\s+([a-z0-9-_.]+)(?:\s|\*|-->|$)/i;

const FILE_IGNORE_PATTERN =
	/\bcode-shamer-ignore-file\b/i;

export function getIgnoreState(lines: string[]): IgnoreState {
	const allRulesIgnoredLines = new Set<number>();
	const ruleIgnoredLines = new Map<number, Set<string>>();
	let fileIgnored = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (FILE_IGNORE_PATTERN.test(line)) {
			fileIgnored = true;
		}

		for (const pattern of ANY_LINE_IGNORE_PATTERNS) {
			if (pattern.test(line)) {
				allRulesIgnoredLines.add(i);
				break;
			}
		}

		const ruleMatch = RULE_NEXT_LINE_PATTERN.exec(line);
		if (ruleMatch) {
			const targetLine = i + 1;
			const ids = ruleIgnoredLines.get(targetLine) ?? new Set<string>();
			ids.add(ruleMatch[1]);
			ruleIgnoredLines.set(targetLine, ids);
		}

		for (const pattern of NEXT_LINE_IGNORE_PATTERNS) {
			if (pattern.test(line)) {
				allRulesIgnoredLines.add(i + 1);
				break;
			}
		}
	}

	return {
		fileIgnored,
		allRulesIgnoredLines,
		ruleIgnoredLines,
	};
}

export function isIgnoredByDirective(
	state: IgnoreState,
	line: number,
	ruleId: string
): boolean {
	if (state.fileIgnored || state.allRulesIgnoredLines.has(line)) {
		return true;
	}
	const ignoredRuleIds = state.ruleIgnoredLines.get(line);
	return ignoredRuleIds ? ignoredRuleIds.has(ruleId) : false;
}
