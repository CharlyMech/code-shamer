import * as assert from "assert";
import { analyzeFile } from "../engine/shameEngine";
import { LANG_EXTENSIONS } from "../scanner/workspaceScanner";

suite("Shame Engine", () => {
	test("finds multiple regex matches on the same line", () => {
		const source = "const a = foo == bar || baz == qux;";
		const result = analyzeFile(source, "javascript", "/tmp/sample.js");
		const eqMatches = result.matches.filter(
			(match) => match.pattern.id === "js-loose-equality"
		);
		assert.ok(eqMatches.length >= 2);
	});

	test("respects rule-scoped ignore-next-line directive", () => {
		const source = [
			"// code-shamer-ignore-next-line js-console-log",
			"console.log('x'); debugger;",
		].join("\n");
		const result = analyzeFile(source, "javascript", "/tmp/sample.js");
		assert.strictEqual(
			result.matches.some((match) => match.pattern.id === "js-console-log"),
			false
		);
		assert.strictEqual(
			result.matches.some((match) => match.pattern.id === "js-debugger"),
			true
		);
	});

	test("uses AST detection for TypeScript any usage", () => {
		const source = "const value: any = getValue();";
		const result = analyzeFile(source, "typescript", "/tmp/sample.ts");
		assert.strictEqual(
			result.matches.some((match) => match.pattern.id === "ts-any-type"),
			true
		);
	});

	test("detects img without alt in HTML", () => {
		const source = '<img src="logo.png">';
		const result = analyzeFile(source, "html", "/tmp/page.html");
		assert.strictEqual(
			result.matches.some((m) => m.pattern.id === "html-img-no-alt"),
			true
		);
	});

	test("detects v-html in Vue SFC", () => {
		const source = '<div v-html="raw"></div>';
		const result = analyzeFile(source, "vue", "/tmp/Comp.vue");
		assert.strictEqual(
			result.matches.some((m) => m.pattern.id === "vue-v-html"),
			true
		);
	});

	test("skips console.log in test files", () => {
		const source = "console.log('debug');";
		const result = analyzeFile(
			source,
			"javascript",
			"/tmp/foo.test.js"
		);
		assert.strictEqual(
			result.matches.some((m) => m.pattern.id === "js-console-log"),
			false
		);
	});

	test("LANG_EXTENSIONS includes html and css for workspace scan", () => {
		assert.ok(LANG_EXTENSIONS.html?.includes("html"));
		assert.ok(LANG_EXTENSIONS.css?.includes("css"));
		assert.ok(LANG_EXTENSIONS.vue?.includes("vue"));
	});
});
