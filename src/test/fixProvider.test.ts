import * as assert from "assert";
import { buildSuggestedFixLines } from "../diff/fixProvider";

suite("Fix Provider — buildSuggestedFixLines", () => {
	test("returns safe suggestions for JS console.log + var", () => {
		const source = [
			"function greet(name) {",
			'  console.log("hello", name);',
			"  var msg = name;",
			"  return msg;",
			"}",
			"",
		].join("\n");
		const analysis = buildSuggestedFixLines(
			source,
			"javascript",
			"/tmp/sample.js"
		);
		const ruleIds = analysis.suggestions.map((s) => s.match.pattern.id);
		assert.ok(
			ruleIds.includes("js-console-log"),
			"expected js-console-log safe suggestion"
		);
		assert.ok(
			ruleIds.includes("js-var-usage"),
			"expected js-var-usage safe suggestion"
		);
	});

	test("returns review hints for JS eval and TS any", () => {
		const source = [
			"function exec(value: any) {",
			"  eval(value);",
			"}",
			"",
		].join("\n");
		const analysis = buildSuggestedFixLines(
			source,
			"typescript",
			"/tmp/sample.ts"
		);
		const reviewIds = analysis.reviews.map((r) => r.match.pattern.id);
		assert.ok(reviewIds.includes("js-eval"));
		assert.ok(reviewIds.includes("ts-any-type"));
	});

	test("py-print and dart-print produce safe suggestions", () => {
		const pyAnalysis = buildSuggestedFixLines(
			'print("hello")\n',
			"python",
			"/tmp/sample.py"
		);
		assert.ok(
			pyAnalysis.suggestions.some(
				(item) => item.match.pattern.id === "py-print"
			),
			"py-print safe suggestion expected"
		);

		const dartAnalysis = buildSuggestedFixLines(
			"void main() {\n  print('debug');\n}\n",
			"dart",
			"/tmp/sample.dart"
		);
		assert.ok(
			dartAnalysis.suggestions.some(
				(item) => item.match.pattern.id === "dart-print"
			),
			"dart-print safe suggestion expected"
		);
	});

	test("apply-all derives fixes only from the analyzed source", () => {
		const source = [
			'console.log("a");',
			"var x = 1;",
			"// nothing here",
			"",
		].join("\n");
		const analysis = buildSuggestedFixLines(
			source,
			"javascript",
			"/tmp/sample.js"
		);
		const lines = analysis.suggestions.map((s) => s.line).sort();
		assert.deepStrictEqual(lines, [0, 1]);
	});
});
