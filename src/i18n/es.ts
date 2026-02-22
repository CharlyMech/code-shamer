import { Locale } from "./types";

const messages: Record<string, string> = {
	// JavaScript
	"shame.js.consoleLog": "console.log() en el codigo — el graffiti del debugger",
	"shame.js.consoleWarn": "console.warn/error() en el codigo",
	"shame.js.varUsage": "'var' detectado — ya no estamos en 2015",
	"shame.js.looseEquality": "'==' en vez de '===' — la coercion de tipos no es tu amiga",
	"shame.js.looseInequality": "'!=' en vez de '!==' — misma historia, distinto operador",
	"shame.js.eval": "eval() detectado — felicidades, abriste la caja de Pandora",
	"shame.js.debugger": "'debugger' en el codigo — espero que no sea produccion",
	"shame.js.emptyCatch": "Catch vacio — tragando errores desde 1995",
	"shame.js.alert": "alert() en el codigo — estamos haciendo una web de los 90?",
	"shame.js.magicNumber": "Numero magico detectado — dale un nombre, se lo merece",
	"shame.js.nestedTernary": "Ternario anidado — porque la legibilidad esta sobrevalorada",
	"shame.js.newFunction": "new Function() — el primo furtivo de eval()",
	"shame.js.documentWrite": "document.write() — viajando en el tiempo a 1999",
	"shame.js.innerHTML": "Asignacion a innerHTML — XSS te da las gracias",
	"shame.js.setTimeoutString": "setTimeout con string — eval() disfrazado",

	// TypeScript
	"shame.ts.anyType": "': any' detectado — TypeScript esta llorando",
	"shame.ts.asAny": "'as any' — la salida de emergencia de TypeScript",
	"shame.ts.tsIgnore": "@ts-ignore — si no puedes arreglarlo, ignoralo verdad?",
	"shame.ts.tsNocheck": "@ts-nocheck — para que usar TypeScript entonces?",
	"shame.ts.nonNullAssertion": "Asercion non-null (!) — creeme bro, no es null",
	"shame.ts.expectErrorNoReason": "@ts-expect-error sin explicacion — tu yo del futuro te odiara",

	// Python
	"shame.py.print": "print() en el codigo — el console.log de Python",
	"shame.py.bareExcept": "'except:' sin tipo — manejo Pokemon de excepciones (hay que atraparlos todos)",
	"shame.py.exceptPass": "'except: pass' — el sonido de los errores desvaneciendose en el vacio",
	"shame.py.importStar": "'import *' — contaminacion de namespace en su maxima expresion",
	"shame.py.global": "'global' — compartiendo estado como si fuera una cena comunitaria",
	"shame.py.mutableDefault": "Argumento mutable por defecto — un clasico gotcha de Python",
	"shame.py.exec": "exec() detectado — ejecutando codigo arbitrario, que podria salir mal?",
	"shame.py.eval": "eval() detectado — porque exec() no era suficientemente peligroso",
	"shame.py.hardcodedPassword": "Contrasena hardcodeada — los auditores de seguridad adoran esto",
	"shame.py.typeIgnore": "'# type: ignore' — la salida de emergencia de mypy",

	// Java
	"shame.java.sysout": "System.out.println — el print statement del dev Java",
	"shame.java.syserr": "System.err.println — al menos es stderr",
	"shame.java.emptyCatch": "Catch vacio — las excepciones entran, nada sale",
	"shame.java.systemExit": "System.exit() — la opcion nuclear",
	"shame.java.rawType": "Tipo raw utilizado — los generics existen por algo",
	"shame.java.stringConcatLoop": "Concatenacion de strings — StringBuilder manda saludos",
	"shame.java.threadSleep": "Thread.sleep() — el 'fix' universal para race conditions",
	"shame.java.suppressWarnings": "@SuppressWarnings — si lo suprimes, no existe",
	"shame.java.catchThrowable": "Catch Throwable — atrapando literalmente todo, incluyendo OutOfMemoryError",

	// C/C++
	"shame.cpp.printf": "printf() en el codigo",
	"shame.cpp.cout": "std::cout en el codigo",
	"shame.cpp.goto": "goto detectado — Dijkstra se esta revolcando en su tumba",
	"shame.cpp.gets": "gets() detectado — buffer overflow garantizado",
	"shame.cpp.malloc": "malloc() sin smart pointers — memory leak en camino",
	"shame.cpp.rawPointerNew": "'new' sin smart pointer — quien va a hacer delete?",
	"shame.cpp.usingNamespaceStd": "'using namespace std' — contaminando el namespace global",
	"shame.cpp.defineConstant": "#define para constantes — constexpr manda saludos",
	"shame.cpp.sprintf": "sprintf() detectado — usa snprintf() por seguridad",
	"shame.cpp.strcpy": "strcpy() detectado — clasico de buffer overflow",

	// C
	"shame.c.printf": "printf() en el codigo",
	"shame.c.goto": "goto detectado — codigo espagueti garantizado",
	"shame.c.gets": "gets() detectado — esta funcion fue eliminada de C11",
	"shame.c.malloc": "malloc() — no olvides hacer free()",
	"shame.c.sprintf": "sprintf() detectado — snprintf() es mas seguro",
	"shame.c.strcpy": "strcpy() — el especial de buffer overflow",
	"shame.c.strcat": "strcat() — otro clasico de buffer overflow",
	"shame.c.voidPointer": "void* — seguridad de tipos? Nunca la conoci",

	// Dart
	"shame.dart.print": "print() en el codigo — usa un logger apropiado",
	"shame.dart.dynamic": "Tipo 'dynamic' — el any de Dart",
	"shame.dart.forceUnwrap": "Force unwrap (!) — null safety? Quien la necesita",
	"shame.dart.debugPrint": "debugPrint() en el codigo",
	"shame.dart.emptyCatch": "Catch vacio — errores de Flutter go brr",
	"shame.dart.runtimeType": ".runtimeType — mejor usa checks con 'is'",

	// PHP
	"shame.php.echo": "echo — podria ser output de debug",
	"shame.php.varDump": "var_dump() — el mejor amigo del debugger PHP",
	"shame.php.printR": "print_r() — sigues debuggeando?",
	"shame.php.eval": "eval() — porque PHP no era suficientemente inseguro",
	"shame.php.mysqlDeprecated": "Funciones mysql_* — deprecadas desde PHP 5.5, eliminadas en 7.0",
	"shame.php.variableVariables": "$$variable — variables variables? En serio?",
	"shame.php.errorSuppression": "@ supresion de errores — escondiendo problemas, un @ a la vez",
	"shame.php.extract": "extract() — creando variables de la nada",
	"shame.php.dieExit": "die()/exit() — apagado graceful? Nunca escuche de eso",
	"shame.php.global": "'global' — la inyeccion de dependencias existe, sabias?",

	// Common
	"shame.common.todo": "TODO encontrado — una promesa a tu yo del futuro que probablemente romperas",
	"shame.common.fixme": "FIXME encontrado — al menos eres honesto",
	"shame.common.hack": "Marcador HACK — deuda tecnica, oficialmente reconocida",
	"shame.common.xxx": "Marcador XXX — algo esta definitivamente mal aqui",
	"shame.common.longLine": "Linea de mas de 200 caracteres — eso es un parrafo, no una linea de codigo",
	"shame.common.commentedCode": "Codigo comentado — git recuerda, tu no tienes que hacerlo",
	"shame.common.noNewlineEof": "Sin salto de linea al final — POSIX desaprueba",
};

const roasts: Record<string, string> = {
	// Clean (0 shames)
	"roast.clean.1": "Tu codigo esta tan limpio que brilla! Cual es tu secreto?",
	"roast.clean.2": "Cero shames? Estas escribiendo codigo o solo admirando tu cursor?",
	"roast.clean.3": "Impecable. Uncle Bob lloraria de alegria.",
	"roast.clean.4": "Si el codigo pudiera ganar concursos de belleza, el tuyo se lleva la corona.",
	"roast.clean.5": "Tu codigo esta mas limpio que mi apartamento. Y eso no dice mucho, pero algo es algo.",
	"roast.clean.6": "Inmaculado. Esto lo escribiste tu o un linter cobro consciencia?",

	// Low (1-24 score)
	"roast.low.1": "Unas cuantas asperezas, pero nada que quite el sueno.",
	"roast.low.2": "Casi perfecto. Solo un par de esqueletos en el armario.",
	"roast.low.3": "Pecados menores. Tu codigo va a confesion, no a prision.",
	"roast.low.4": "Un poquito de shame, como dejarte el intermitente puesto. Inofensivo, pero se nota.",
	"roast.low.5": "Tu codigo solo necesita quitarle el polvo, no una reforma integral.",
	"roast.low.6": "Estas al borde de la grandeza. Solo unos console.logs te separan.",

	// Medium (25-74 score)
	"roast.medium.1": "Tu codigo tiene... caracter. Mucho caracter.",
	"roast.medium.2": "Funciona, pero esta sostenido con cinta adhesiva y oraciones.",
	"roast.medium.3": "Ni genial ni terrible. El 3.6 Roentgen de la calidad de codigo.",
	"roast.medium.4": "En algun punto entre 'funciona en mi maquina' y 'por favor no toques nada'.",
	"roast.medium.5": "Tu codigo se lee como una novela de misterio. Nadie sabe que pasa despues. Tu incluido.",
	"roast.medium.6": "He visto cosas peores. Pero tambien he visto cosas mucho, mucho mejores.",

	// High (75-149 score)
	"roast.high.1": "Este codigo necesita un grupo de apoyo.",
	"roast.high.2": "He visto codigo mas limpio en un hackathon a las 2AM.",
	"roast.high.3": "Tu codigo es tan desordenado que hasta git blame rechaza la responsabilidad.",
	"roast.high.4": "Este codigo no necesita una review, necesita una intervencion.",
	"roast.high.5": "Si el codigo espagueti fuera un deporte, serias medallista olimpico.",
	"roast.high.6": "Tu codigo tiene mas problemas que un quiosco de revistas.",

	// Extreme (150+ score)
	"roast.extreme.1": "Esto es codigo o un grito de auxilio?",
	"roast.extreme.2": "Este codebase tiene mas red flags que un desfile sovietico.",
	"roast.extreme.3": "Felicidades, has alcanzado el estatus legendario de shame.",
	"roast.extreme.4": "Se me acabaron las cosas constructivas que decir. Solo estoy aqui como apoyo emocional.",
	"roast.extreme.5": "Este codigo viola la Convencion de Ginebra de la ingenieria de software.",
	"roast.extreme.6": "Dicen las leyendas que si miras este codigo el tiempo suficiente, el te devuelve la mirada.",
};

const levels: Record<string, string> = {
	"level.cleanCodeGuru": "Guru del Codigo Limpio",
	"level.likeAHacker": "Como un Hacker",
	"level.seniorityLevel": "Nivel Senior",
	"level.juniorLike": "Modo Junior",
	"level.viveCoder": "Vive Coder",
	"level.shameOverlord": "Overlord de la Verguenza",
};

const achievements: Record<string, string> = {
	"achievement.firstScan.title": "Primera Mirada",
	"achievement.firstScan.desc": "Ejecuta tu primer escaneo de workspace",
	"achievement.firstFix.title": "Primera Correccion!",
	"achievement.firstFix.desc": "Reduce tu puntuacion de shame por primera vez",
	"achievement.halfShame.title": "A Medio Camino!",
	"achievement.halfShame.desc": "Reduce tu shame al 50% del original",
	"achievement.cleanSlate.title": "Borron y Cuenta Nueva",
	"achievement.cleanSlate.desc": "Alcanza cero puntos de shame",
	"achievement.persistent.title": "Mejorador Persistente",
	"achievement.persistent.desc": "Ejecuta 10 escaneos en este workspace",
};

const es: Locale = {
	disabled: "Extension desactivada",
	languageDisabled: "Lenguaje no activado",
	noCode: "No hay codigo para juzgar",
	scanning: "CodeShamer esta analizando tu workspace...",
	scanComplete: (files: number, shames: number) =>
		`CodeShamer: ${shames} shames encontrados en ${files} archivos`,
	shameTooltip: (score: number) => `Nivel de verguenza ${score}`,
	details: (score: number, roast: string) =>
		`🔥 Verguenza ${score}/10 — ${roast}`,
	shameMessage: (messageKey: string) =>
		messages[messageKey] ?? messageKey,
	messages,
	roasts,
	levels,
	achievements,
};

export default es;
