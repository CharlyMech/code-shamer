import * as ts from "typescript";
import { ShameMatch, ShamePattern } from "./types";

type RuleIndex = Map<string, ShamePattern>;

function getLineAndColumn(
	sourceFile: ts.SourceFile,
	pos: number
): { line: number; column: number } {
	const lc = sourceFile.getLineAndCharacterOfPosition(pos);
	return { line: lc.line, column: lc.character };
}

function getTextLine(content: string, line: number): string {
	const lines = content.split(/\r?\n/);
	return lines[line] ?? "";
}

export function analyzeAstRules(
	content: string,
	languageId: string,
	filePath: string,
	activeRules: ShamePattern[]
): ShameMatch[] {
	if (
		![
			"javascript",
			"javascriptreact",
			"typescript",
			"typescriptreact",
		].includes(languageId)
	) {
		return [];
	}

	const ruleIndex: RuleIndex = new Map(
		activeRules.map((rule) => [rule.id, rule] as const)
	);

	const scriptKind =
		languageId === "typescript"
			? ts.ScriptKind.TS
			: languageId === "typescriptreact"
				? ts.ScriptKind.TSX
				: languageId === "javascriptreact"
					? ts.ScriptKind.JSX
					: ts.ScriptKind.JS;
	const sourceFile = ts.createSourceFile(
		filePath,
		content,
		ts.ScriptTarget.Latest,
		true,
		scriptKind
	);
	const matches: ShameMatch[] = [];
	const seen = new Set<string>();

	const pushMatch = (ruleId: string, node: ts.Node) => {
		const pattern = ruleIndex.get(ruleId);
		if (!pattern) {
			return;
		}
		const start = getLineAndColumn(sourceFile, node.getStart(sourceFile));
		const end = getLineAndColumn(sourceFile, node.getEnd());
		const key = `${ruleId}:${start.line}:${start.column}:${end.line}:${end.column}`;
		if (seen.has(key)) {
			return;
		}
		seen.add(key);
		matches.push({
			pattern,
			line: start.line,
			column: start.column,
			endLine: end.line,
			endColumn: end.column,
			lineText: getTextLine(content, start.line),
			filePath,
		});
	};

	const visit = (node: ts.Node): void => {
		if (ts.isDebuggerStatement(node)) {
			pushMatch("js-debugger", node);
		}

		if (ts.isCallExpression(node)) {
			if (
				ts.isIdentifier(node.expression) &&
				node.expression.text === "eval"
			) {
				pushMatch("js-eval", node);
			}

			if (
				ts.isIdentifier(node.expression) &&
				node.expression.text === "alert"
			) {
				pushMatch("js-alert", node);
			}

			if (
				ts.isPropertyAccessExpression(node.expression) &&
				ts.isIdentifier(node.expression.expression) &&
				node.expression.expression.text === "console" &&
				["log", "debug", "info", "trace", "table"].includes(
					node.expression.name.text
				)
			) {
				pushMatch("js-console-log", node);
			}
		}

		if (
			ts.isVariableDeclarationList(node) &&
			(node.flags & ts.NodeFlags.BlockScoped) === 0
		) {
			pushMatch("js-var-usage", node);
		}

		if (
			ts.isBinaryExpression(node) &&
			node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken
		) {
			pushMatch("js-loose-equality", node);
		}

		if (
			ts.isBinaryExpression(node) &&
			node.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken
		) {
			pushMatch("js-loose-inequality", node);
		}

		if (ts.isTypeNode(node) && node.kind === ts.SyntaxKind.AnyKeyword) {
			pushMatch("ts-any-type", node);
		}

		if (
			ts.isAsExpression(node) &&
			node.type.kind === ts.SyntaxKind.AnyKeyword
		) {
			pushMatch("ts-as-any", node);
		}

		if (ts.isNonNullExpression(node)) {
			pushMatch("ts-non-null-assertion", node);
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return matches;
}
