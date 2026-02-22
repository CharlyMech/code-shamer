export interface ShameLevel {
	minScore: number;
	titleKey: string;
	emoji: string;
	/** Index of the image in media/shames/ (0.png - 5.png) */
	imageIndex: number;
	/** Hex color for this level */
	color: string;
}

const SHAME_LEVELS: ShameLevel[] = [
	{ minScore: 0, titleKey: "level.cleanCodeGuru", emoji: "\u2728", imageIndex: 0, color: "#4caf50" },
	{ minScore: 5, titleKey: "level.likeAHacker", emoji: "\ud83d\udcbb", imageIndex: 1, color: "#8bc34a" },
	{ minScore: 25, titleKey: "level.seniorityLevel", emoji: "\ud83e\uddd1\u200d\ud83d\udcbb", imageIndex: 2, color: "#ffeb3b" },
	{ minScore: 75, titleKey: "level.juniorLike", emoji: "\ud83d\udc76", imageIndex: 3, color: "#ff9800" },
	{ minScore: 150, titleKey: "level.viveCoder", emoji: "\ud83d\ude48", imageIndex: 4, color: "#f44336" },
	{ minScore: 300, titleKey: "level.shameOverlord", emoji: "\ud83d\udd25", imageIndex: 5, color: "#b71c1c" },
];

export function getShameLevel(score: number): ShameLevel {
	let level = SHAME_LEVELS[0];
	for (const l of SHAME_LEVELS) {
		if (score >= l.minScore) {
			level = l;
		}
	}
	return level;
}

export function getShameLevelTitle(score: number): string {
	const level = getShameLevel(score);
	return `${level.emoji} ${level.titleKey}`;
}

/**
 * Get a color between green and red based on file score relative to max.
 */
export function getFileColor(fileScore: number, maxScore: number): string {
	if (maxScore === 0) {
		return "#4caf50";
	}
	const ratio = Math.min(fileScore / maxScore, 1);
	// Green -> Yellow -> Orange -> Red
	if (ratio < 0.33) {
		return "#4caf50";
	} else if (ratio < 0.66) {
		return "#ff9800";
	}
	return "#f44336";
}
