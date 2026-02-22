const IGNORE_PATTERNS = [
	/\/\/\s*code-shamer-ignore\s*$/,
	/#\s*code-shamer-ignore\s*$/,
	/--\s*code-shamer-ignore\s*$/,
];

const IGNORE_NEXT_PATTERNS = [
	/\/\/\s*code-shamer-ignore-next-line\s*$/,
	/#\s*code-shamer-ignore-next-line\s*$/,
	/--\s*code-shamer-ignore-next-line\s*$/,
];

export function getIgnoredLines(lines: string[]): Set<number> {
	const ignored = new Set<number>();

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		for (const pattern of IGNORE_PATTERNS) {
			if (pattern.test(line)) {
				ignored.add(i);
				break;
			}
		}

		for (const pattern of IGNORE_NEXT_PATTERNS) {
			if (pattern.test(line)) {
				ignored.add(i + 1);
				break;
			}
		}
	}

	return ignored;
}
