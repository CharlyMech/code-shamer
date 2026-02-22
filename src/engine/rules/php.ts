import { ShamePattern } from "../types";

export const phpRules: ShamePattern[] = [
	{
		id: "php-echo",
		pattern: /\becho\s+/,
		severity: 1,
		category: "debug",
		messageKey: "shame.php.echo",
	},
	{
		id: "php-var-dump",
		pattern: /\bvar_dump\s*\(/,
		severity: 3,
		category: "debug",
		messageKey: "shame.php.varDump",
	},
	{
		id: "php-print-r",
		pattern: /\bprint_r\s*\(/,
		severity: 3,
		category: "debug",
		messageKey: "shame.php.printR",
	},
	{
		id: "php-eval",
		pattern: /\beval\s*\(/,
		severity: 5,
		category: "security",
		messageKey: "shame.php.eval",
	},
	{
		id: "php-mysql-deprecated",
		pattern: /\bmysql_\w+\s*\(/,
		severity: 5,
		category: "security",
		messageKey: "shame.php.mysqlDeprecated",
	},
	{
		id: "php-variable-variables",
		pattern: /\$\$\w+/,
		severity: 4,
		category: "reliability",
		messageKey: "shame.php.variableVariables",
	},
	{
		id: "php-error-suppression",
		pattern: /@\$?\w+/,
		severity: 3,
		category: "reliability",
		messageKey: "shame.php.errorSuppression",
	},
	{
		id: "php-extract",
		pattern: /\bextract\s*\(/,
		severity: 4,
		category: "security",
		messageKey: "shame.php.extract",
	},
	{
		id: "php-die-exit",
		pattern: /\b(die|exit)\s*\(/,
		severity: 3,
		category: "reliability",
		messageKey: "shame.php.dieExit",
	},
	{
		id: "php-global",
		pattern: /\bglobal\s+\$/,
		severity: 3,
		category: "style",
		messageKey: "shame.php.global",
	},
];
