import * as assert from "assert";
import en from "../i18n/en";
import es from "../i18n/es";

suite("i18n locales", () => {
	test("EN locale exposes required UI strings", () => {
		assert.strictEqual(typeof en.ui.scanningWorkspace, "string");
		assert.strictEqual(typeof en.ui.noShamesYet, "string");
		assert.strictEqual(typeof en.ui.noShamesInFile, "string");
	});

	test("ES locale provides Spanish translation for known UI strings", () => {
		assert.notStrictEqual(en.ui.scanningWorkspace, es.ui.scanningWorkspace);
		assert.ok(es.ui.scanningWorkspace.length > 0);
		assert.ok(es.ui.noShamesYet.length > 0);
	});

	test("ES locale falls back to EN when key is unknown", () => {
		assert.strictEqual(es.t("definitely.unknown.key"), "definitely.unknown.key");
		assert.strictEqual(es.shameMessage("missing.message"), en.t("missing.message"));
	});

	test("Both locales resolve a common shame message key", () => {
		const key = "shame.js.consoleLog";
		assert.ok(en.shameMessage(key).length > 0);
		assert.ok(es.shameMessage(key).length > 0);
	});

	test("hintMessage returns actionable insight when hint exists", () => {
		const hint = en.hintMessage("hint.js.eval");
		assert.ok(hint.length > 0);
		assert.ok(hint.includes("eval"));
	});

	test("Both locales return formatted scanComplete summary", () => {
		const enSummary = en.scanComplete(3, 5);
		const esSummary = es.scanComplete(3, 5);
		assert.ok(enSummary.includes("5"));
		assert.ok(enSummary.includes("3"));
		assert.ok(esSummary.includes("5"));
		assert.ok(esSummary.includes("3"));
	});
});
