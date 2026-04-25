import * as assert from "assert";
import { analyzeFile } from "../engine/shameEngine";

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
});
