import * as assert from "assert";
import {
	getFixEntry,
	hasAnyRecommendation,
	hasSafeFix,
	getFixedLine,
	getAllFixEntries,
} from "../engine/fixes/registry";
import { javascriptRules } from "../engine/rules/javascript";
import { typescriptRules } from "../engine/rules/typescript";
import { pythonRules } from "../engine/rules/python";
import { javaRules } from "../engine/rules/java";
import { dartRules } from "../engine/rules/dart";
import { phpRules } from "../engine/rules/php";
import { htmlRules } from "../engine/rules/html";
import { cssRules } from "../engine/rules/css";
import { cRules } from "../engine/rules/c";
import { cppRules } from "../engine/rules/cpp";
import { commonRules } from "../engine/rules/common";
import { ShameMatch, ShamePattern } from "../engine/types";
import en from "../i18n/en";
import es from "../i18n/es";

function fakeMatch(pattern: ShamePattern, lineText: string): ShameMatch {
	return {
		pattern,
		line: 0,
		column: 0,
		lineText,
		filePath: "/tmp/sample",
	};
}

suite("Fix Registry coverage", () => {
	const allRules: ShamePattern[] = [
		...javascriptRules,
		...typescriptRules,
		...pythonRules,
		...javaRules,
		...dartRules,
		...phpRules,
		...htmlRules,
		...cssRules,
		...cRules,
		...cppRules,
		...commonRules,
	];

	test("every supported rule has a registry recommendation", () => {
		const missing = allRules
			.map((rule) => rule.id)
			.filter((id) => !hasAnyRecommendation(id));
		assert.deepStrictEqual(
			missing,
			[],
			`Missing registry entries for rule ids: ${missing.join(", ")}`
		);
	});

	test("registry entries have title keys resolvable in EN locale", () => {
		const unresolved = getAllFixEntries().filter(
			(entry) => en.t(entry.titleKey) === entry.titleKey
		);
		assert.deepStrictEqual(
			unresolved.map((entry) => entry.titleKey),
			[]
		);
	});

	test("review entries have hint keys resolvable in EN locale", () => {
		const reviews = getAllFixEntries().filter(
			(entry) => entry.safety === "review"
		);
		const unresolvedHints = reviews.filter(
			(entry) =>
				!entry.hintKey || en.t(entry.hintKey) === entry.hintKey
		);
		assert.deepStrictEqual(
			unresolvedHints.map((entry) => entry.ruleId),
			[]
		);
	});

	test("ES locale falls back to EN when translation is missing", () => {
		assert.strictEqual(
			es.t("non.existent.key"),
			"non.existent.key"
		);
		const sampleKey = getAllFixEntries()[0]?.titleKey ?? "fix.js.varUsage.title";
		const enValue = en.t(sampleKey);
		const esValue = es.t(sampleKey);
		assert.ok(esValue.length > 0);
		assert.ok(enValue.length > 0);
	});
});

suite("Fix Registry safe transforms", () => {
	test("js-var-usage replaces var with let", () => {
		const entry = getFixEntry("js-var-usage");
		assert.ok(entry);
		const fixed = getFixedLine(
			"js-var-usage",
			"var name = 1;",
			fakeMatch({ id: "js-var-usage" } as ShamePattern, "var name = 1;")
		);
		assert.strictEqual(fixed, "let name = 1;");
	});

	test("js-loose-equality replaces == with ===", () => {
		const fixed = getFixedLine(
			"js-loose-equality",
			"if (a == b) {",
			fakeMatch(
				{ id: "js-loose-equality" } as ShamePattern,
				"if (a == b) {"
			)
		);
		assert.strictEqual(fixed, "if (a === b) {");
	});

	test("js-loose-inequality replaces != with !==", () => {
		const fixed = getFixedLine(
			"js-loose-inequality",
			"if (a != b) {",
			fakeMatch(
				{ id: "js-loose-inequality" } as ShamePattern,
				"if (a != b) {"
			)
		);
		assert.strictEqual(fixed, "if (a !== b) {");
	});

	test("py-print is marked safe and resolves to empty replacement", () => {
		assert.strictEqual(hasSafeFix("py-print"), true);
		const fixed = getFixedLine(
			"py-print",
			'    print("hello")',
			fakeMatch({ id: "py-print" } as ShamePattern, '    print("hello")')
		);
		assert.strictEqual(fixed, "");
	});

	test("dart-print is safe and resolves to empty replacement", () => {
		assert.strictEqual(hasSafeFix("dart-print"), true);
		const fixed = getFixedLine(
			"dart-print",
			"  print('debug');",
			fakeMatch({ id: "dart-print" } as ShamePattern, "  print('debug');")
		);
		assert.strictEqual(fixed, "");
	});

	test("review-only entries do not produce a safe fix line", () => {
		assert.strictEqual(hasSafeFix("js-eval"), false);
		const result = getFixedLine(
			"js-eval",
			"eval('1');",
			fakeMatch({ id: "js-eval" } as ShamePattern, "eval('1');")
		);
		assert.strictEqual(result, null);
	});

	test("ts-ignore is replaced by ts-expect-error", () => {
		const fixed = getFixedLine(
			"ts-ignore",
			"// @ts-ignore: legacy",
			fakeMatch(
				{ id: "ts-ignore" } as ShamePattern,
				"// @ts-ignore: legacy"
			)
		);
		assert.strictEqual(fixed, "// @ts-expect-error: legacy");
	});

	test("py-bare-except becomes except Exception:", () => {
		const fixed = getFixedLine(
			"py-bare-except",
			"    except:",
			fakeMatch(
				{ id: "py-bare-except" } as ShamePattern,
				"    except:"
			)
		);
		assert.strictEqual(fixed, "    except Exception:");
	});
});
