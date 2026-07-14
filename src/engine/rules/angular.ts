import { ShamePattern } from "../types";

const isAngularFile = (ctx: { filePath: string }) =>
	/\.component\.(ts|html)$/.test(ctx.filePath) ||
	/@angular\//.test(ctx.filePath) ||
	/\.module\.ts$/.test(ctx.filePath);

export const angularRules: ShamePattern[] = [
	{
		id: "ng-inner-html",
		pattern: /\[innerHTML\]\s*=|innerHTML\s*=/,
		severity: 5,
		category: "security",
		messageKey: "shame.angular.innerHtml",
		hintKey: "hint.angular.innerHtml",
		when: isAngularFile,
	},
	{
		id: "ng-for-no-trackby",
		pattern: /\*ngFor\s*=(?![^;]*trackBy)[^;]*;/,
		severity: 3,
		category: "performance",
		messageKey: "shame.angular.ngForNoTrackBy",
		hintKey: "hint.angular.ngForNoTrackBy",
		when: isAngularFile,
	},
	{
		id: "ng-any-in-template",
		pattern: /:\s*any\b|as\s+any\b/,
		severity: 2,
		category: "style",
		messageKey: "shame.angular.anyInTemplate",
		hintKey: "hint.angular.anyInTemplate",
		when: (ctx) =>
			isAngularFile(ctx) && /\.(ts|html)$/.test(ctx.filePath),
	},
];
