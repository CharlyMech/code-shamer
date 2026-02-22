const ROAST_KEYS_BY_RANGE: Record<string, string[]> = {
	clean: [
		"roast.clean.1",
		"roast.clean.2",
		"roast.clean.3",
		"roast.clean.4",
		"roast.clean.5",
		"roast.clean.6",
	],
	low: [
		"roast.low.1",
		"roast.low.2",
		"roast.low.3",
		"roast.low.4",
		"roast.low.5",
		"roast.low.6",
	],
	medium: [
		"roast.medium.1",
		"roast.medium.2",
		"roast.medium.3",
		"roast.medium.4",
		"roast.medium.5",
		"roast.medium.6",
	],
	high: [
		"roast.high.1",
		"roast.high.2",
		"roast.high.3",
		"roast.high.4",
		"roast.high.5",
		"roast.high.6",
	],
	extreme: [
		"roast.extreme.1",
		"roast.extreme.2",
		"roast.extreme.3",
		"roast.extreme.4",
		"roast.extreme.5",
		"roast.extreme.6",
	],
};

export function getRandomRoastKey(score: number): string {
	let bracket: string;
	if (score === 0) {
		bracket = "clean";
	} else if (score < 25) {
		bracket = "low";
	} else if (score < 75) {
		bracket = "medium";
	} else if (score < 150) {
		bracket = "high";
	} else {
		bracket = "extreme";
	}

	const keys = ROAST_KEYS_BY_RANGE[bracket];
	return keys[Math.floor(Math.random() * keys.length)];
}
