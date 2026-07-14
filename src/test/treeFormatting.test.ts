import * as assert from "assert";
import {
	formatLineDescription,
	formatMatchPreview,
} from "../sidebar/treeFormatting";

suite("Tree formatting", () => {
	test("truncates long previews so line description can sit on the right", () => {
		const long = "a".repeat(80);
		const preview = formatMatchPreview(long);
		assert.ok(preview.length <= 32);
		assert.ok(preview.endsWith("…"));
	});

	test("formats line description as L{n}", () => {
		assert.strictEqual(formatLineDescription(32), "L33");
	});
});
