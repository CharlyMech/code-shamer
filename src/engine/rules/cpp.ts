import { ShamePattern } from "../types";

export const cppRules: ShamePattern[] = [
	{
		id: "cpp-printf",
		pattern: /\bprintf\s*\(/,
		severity: 2,
		category: "debug",
		messageKey: "shame.cpp.printf",
	},
	{
		id: "cpp-cout",
		pattern: /std::cout\s*<</,
		severity: 2,
		category: "debug",
		messageKey: "shame.cpp.cout",
	},
	{
		id: "cpp-goto",
		pattern: /\bgoto\s+\w/,
		severity: 5,
		category: "style",
		messageKey: "shame.cpp.goto",
	},
	{
		id: "cpp-gets",
		pattern: /\bgets\s*\(/,
		severity: 5,
		category: "security",
		messageKey: "shame.cpp.gets",
	},
	{
		id: "cpp-malloc-no-free",
		pattern: /\bmalloc\s*\(/,
		severity: 3,
		category: "reliability",
		messageKey: "shame.cpp.malloc",
	},
	{
		id: "cpp-raw-pointer-new",
		pattern: /\bnew\s+\w+(?!\s*\(.*std::(unique|shared)_ptr)/,
		severity: 2,
		category: "reliability",
		messageKey: "shame.cpp.rawPointerNew",
	},
	{
		id: "cpp-using-namespace-std",
		pattern: /using\s+namespace\s+std\s*;/,
		severity: 2,
		category: "style",
		messageKey: "shame.cpp.usingNamespaceStd",
	},
	{
		id: "cpp-define-constant",
		pattern: /#define\s+[A-Z_]+\s+\d+/,
		severity: 1,
		category: "style",
		messageKey: "shame.cpp.defineConstant",
	},
	{
		id: "cpp-sprintf",
		pattern: /\bsprintf\s*\(/,
		severity: 4,
		category: "security",
		messageKey: "shame.cpp.sprintf",
	},
	{
		id: "cpp-strcpy",
		pattern: /\bstrcpy\s*\(/,
		severity: 4,
		category: "security",
		messageKey: "shame.cpp.strcpy",
	},
];
