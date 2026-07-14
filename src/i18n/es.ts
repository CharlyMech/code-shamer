import { Locale, UiStrings } from "./types";
import en from "./en";

const messages: Record<string, string> = {
	"shame.js.consoleLog": "Dejaste console.log() — produccion no es tu diario personal",
	"shame.js.consoleWarn": "Ruido en consola — tus usuarios no cobran por leer tu drama de debug",
	"shame.js.varUsage": "Usaste 'var' — hasta Internet Explorer avanzo, y eso dice mucho",
	"shame.js.looseEquality": "Escribiste '==' — JavaScript te va a sorprender, y no bonito",
	"shame.js.looseInequality": "Escribiste '!=' — el mismo caos que '==', con mas confianza",
	"shame.js.eval": "Llamaste eval() — invitaste codigo arbitrario a la fiesta",
	"shame.js.debugger": "Dejaste debugger — querias pausar prod o solo tu carrera?",
	"shame.js.emptyCatch": "Catch vacio — entro el error, salio la dignidad",
	"shame.js.alert": "alert() en 2026 — llegaste en metro desde una web GeoCities?",
	"shame.js.magicNumber": "Numero magico — ponle nombre antes de que sea leyenda de equipo",
	"shame.js.nestedTernary": "Ternario anidado — el codigo legible llamo, mandaste a buzon",
	"shame.js.newFunction": "new Function() — eval() con bigote falso",
	"shame.js.documentWrite": "document.write() — el DOM no pidio este vandalismo",
	"shame.js.innerHTML": "innerHTML — XSS ya esta escribiendo tu tarjeta de gracias",
	"shame.js.setTimeoutString": "setTimeout con string — eval() disfrazado de temporizador",
	"shame.js.letArrayPush": "let + push — puedes armar arrays sin arco de sufrimiento",
	"shame.js.switchNoBreak": "Switch sin break — si no fue intencional, tu yo futuro ya esta enojado",

	"shame.ts.anyType": "': any' — pagaste TypeScript y elegiste caos igual",
	"shame.ts.asAny": "'as any' — la seguridad de tipos salio del chat",
	"shame.ts.tsIgnore": "@ts-ignore — estrategia de campeon: esconder el fuego, dejar el humo",
	"shame.ts.tsNocheck": "@ts-nocheck — convertiste TypeScript en JavaScript de disfraz",
	"shame.ts.nonNullAssertion": "Asercion ! — 'creeme bro' no es un sistema de tipos",
	"shame.ts.expectErrorNoReason": "@ts-expect-error sin razon — tu yo futuro merece disculpas",

	"shame.py.print": "print() suelto — tus logs merecen dignidad, no tiza en la acera",
	"shame.py.bareExcept": "except pelado — atrapas todo, incluso tu dignidad",
	"shame.py.exceptPass": "except: pass — los bugs hacen rave silencioso",
	"shame.py.importStar": "import * — importaste un circo entero, nombres opcionales",
	"shame.py.global": "global — estado mutable compartido, el villano favorito",
	"shame.py.mutableDefault": "Default mutable — el gotcha clasico y caiste de pie",
	"shame.py.exec": "exec() — ejecutar codigo misterioso como ejercicio de confianza",
	"shame.py.eval": "eval() — porque exec() no era lo bastante temerario",
	"shame.py.hardcodedPassword": "Password hardcodeada — los hackers te mandaron un corazon",
	"shame.py.typeIgnore": "# type: ignore — mypy grita, tu haces como si no",

	"shame.java.sysout": "System.out.println — el print statement del dev Java",
	"shame.java.syserr": "System.err.println — al menos es stderr",
	"shame.java.emptyCatch": "Catch vacio — las excepciones entran, nada sale",
	"shame.java.systemExit": "System.exit() — la opcion nuclear",
	"shame.java.rawType": "Tipo raw utilizado — los generics existen por algo",
	"shame.java.stringConcatLoop": "Concatenacion de strings — StringBuilder manda saludos",
	"shame.java.threadSleep": "Thread.sleep() — el 'fix' universal para race conditions",
	"shame.java.suppressWarnings": "@SuppressWarnings — si lo suprimes, no existe",
	"shame.java.catchThrowable": "Catch Throwable — atrapando literalmente todo, incluyendo OutOfMemoryError",

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

	"shame.c.printf": "printf() en el codigo",
	"shame.c.goto": "goto detectado — codigo espagueti garantizado",
	"shame.c.gets": "gets() detectado — esta funcion fue eliminada de C11",
	"shame.c.malloc": "malloc() — no olvides hacer free()",
	"shame.c.sprintf": "sprintf() detectado — snprintf() es mas seguro",
	"shame.c.strcpy": "strcpy() — el especial de buffer overflow",
	"shame.c.strcat": "strcat() — otro clasico de buffer overflow",
	"shame.c.voidPointer": "void* — seguridad de tipos? Nunca la conoci",

	"shame.dart.print": "print() en el codigo — usa un logger apropiado",
	"shame.dart.dynamic": "Tipo 'dynamic' — el any de Dart",
	"shame.dart.forceUnwrap": "Force unwrap (!) — null safety? Quien la necesita",
	"shame.dart.debugPrint": "debugPrint() en el codigo",
	"shame.dart.emptyCatch": "Catch vacio — errores de Flutter go brr",
	"shame.dart.runtimeType": ".runtimeType — mejor usa checks con 'is'",
	"shame.dart.deepNesting": "Anidamiento profundo de widgets — extrae widgets para mejor legibilidad",

	"shame.php.echo": "echo en prod — querias shippear tus pensamientos de debug?",
	"shame.php.varDump": "var_dump() — tus variables en escenario publico, disfruta",
	"shame.php.printR": "print_r() — sigues usando el navegador como phpMyAdmin?",
	"shame.php.eval": "eval() en PHP — los auditores cancelaron sus vacaciones",
	"shame.php.mysqlDeprecated": "mysql_* en 2026 — esta API se jubilo antes que algunos pasantes",
	"shame.php.variableVariables": "$$variables — hasta PHP te esta juzgando",
	"shame.php.errorSuppression": "@ de supresion — el error es real, tu @ es maquillaje",
	"shame.php.extract": "extract() — variables sorpresa para todos, incluido tu yo futuro",
	"shame.php.dieExit": "die()/exit() — el apagado elegante llamo, mandaste a buzon",
	"shame.php.global": "global en PHP — la inyeccion de dependencias existe, lo sabes",

	"shame.html.inlineStyle": "Estilos inline — los CSS existen, no son decoracion",
	"shame.html.marquee": "<marquee> — bienvenido a 1998, ahora vete otra vez",
	"shame.html.brUsage": "<br> apilados — layout con saltos no es personalidad",
	"shame.html.centerTag": "<center> — HTML4 llamo, quiere su reliquia de vuelta",

	"shame.css.important": "!important — trajiste martillo a un debate de especificidad",
	"shame.css.universalWildcard": "Selector * — estilas el universo porque enfocarte es dificil",
	"shame.css.zIndexMax": "z-index: 9999 — ganaste la guerra de capas, perdiste mantenibilidad",
	"shame.css.outlineNone": "outline: none — usuarios de teclado quieren encontrar tus botones",
	"shame.css.zeroPx": "0px — los pixeles extra son gratis, tu orgullo no",
	"shame.css.idSelector": "ID para estilos — las clases existen y duelen menos",

	"shame.html.imgNoAlt": "Img sin alt — los lectores de pantalla te miran en silencio",
	"shame.html.inputNoType": "Input sin type — formularios sorpresa no son estrategia UX",
	"shame.html.inlineOnclick": "onclick inline — el HTML no es cajon de basura de JS",
	"shame.html.missingLang": "<html> sin lang — accesibilidad llamo, la mandaste a spam",
	"shame.html.emptyHref": "href='#' — usa boton o un link de verdad, elige carril",
	"shame.html.tableLayout": "Tabla para layout en 2026 — CSS grid existe y es gratis",

	"shame.js.reactKeyIndex": "key={index} — React re-renderizara tus pecados en desorden",
	"shame.js.reactDangerousHtml": "dangerouslySetInnerHTML — el nombre te aviso, lo ignoraste",

	"shame.py.openWithoutWith": "open() sin with — los archivos no son plantas, hay que cerrarlos",
	"shame.py.pickleLoads": "pickle.loads() con datos raros — eso no es parsear, es confiar a ciegas",

	"shame.php.requestSuperglobal": "$_REQUEST — mezclaste GET y POST como smoothie",
	"shame.php.shortTag": "Etiqueta corta PHP — la portabilidad salio por la puerta",

	"shame.vue.vHtml": "v-html — sirves HTML estilo confia-en-mi-bro",
	"shame.vue.vForNoKey": "v-for sin :key — Vue adivina; tu UI apuesta",
	"shame.vue.optionsData": "data() compartiendo estado — trauma grupal por componente",

	"shame.svelte.htmlInjection": "{@html} — el input del usuario entro VIP al DOM",
	"shame.svelte.reactiveStatement": "Otra linea $: — tu flujo de datos es fanfic",

	"shame.astro.setHtml": "set:html — invitaste HTML crudo a la fiesta del servidor",
	"shame.astro.clientDirective": "client:* por todos lados — el presupuesto de hidratacion llora",

	"shame.angular.innerHtml": "[innerHTML] — XSS confirmo asistencia en tu template",
	"shame.angular.ngForNoTrackBy": "*ngFor sin trackBy — Angular re-renderiza toda la linea temporal",
	"shame.angular.anyInTemplate": ": any en Angular — templates estrictos existen, elegiste vibes",

	"shame.common.todo": "TODO — carta de amor a tu yo futuro, que ya esta cansado",
	"shame.common.fixme": "FIXME — por lo menos admites que esto vuela con fe",
	"shame.common.hack": "HACK — deuda tecnica con nombre de calle",
	"shame.common.xxx": "XXX — alarma de codigo, y la dejaste sonando",
	"shame.common.nestedLoops": "Loops anidados — O(n²) no es flex, es etiqueta de advertencia",
	"shame.common.longLine": "200+ caracteres en una linea — eso es un tweet, no codigo",
	"shame.common.commentedCode": "Codigo comentado — git tiene memoria, no necesitas museo",
	"shame.common.noNewlineEof": "Sin newline al final — POSIX decepcionado, con educacion",
};

const fixes: Record<string, string> = {
	"fix.js.varUsage.title": "Reemplazar 'var' con 'let'",
	"fix.js.looseEquality.title": "Reemplazar '==' con '==='",
	"fix.js.looseInequality.title": "Reemplazar '!=' con '!=='",
	"fix.js.debugger.title": "Eliminar el statement 'debugger'",
	"fix.js.consoleLog.title": "Eliminar el console",
	"fix.js.alert.title": "Eliminar la llamada a alert()",
	"fix.js.eval.title": "Revisar el uso de eval()",
	"fix.js.emptyCatch.title": "Revisar el catch vacio",
	"fix.js.nestedTernary.title": "Revisar el ternario anidado",
	"fix.js.newFunction.title": "Revisar el uso de new Function()",
	"fix.js.documentWrite.title": "Revisar el uso de document.write",
	"fix.js.setTimeoutString.title": "Revisar setTimeout con string",
	"fix.js.letArrayPush.title": "Revisar patron let-then-push",
	"fix.js.switchNoBreak.title": "Revisar fallthrough en switch",

	"fix.ts.tsIgnore.title": "Reemplazar @ts-ignore por @ts-expect-error",
	"fix.ts.anyType.title": "Sustituir 'any' por un tipo concreto",
	"fix.ts.asAny.title": "Evitar el cast 'as any'",
	"fix.ts.tsNocheck.title": "Quitar @ts-nocheck y arreglar los errores",
	"fix.ts.nonNullAssertion.title": "Sustituir '!' por una guarda de null",
	"fix.ts.expectErrorNoReason.title": "Anadir un motivo a @ts-expect-error",

	"fix.py.print.title": "Eliminar el print()",
	"fix.py.bareExcept.title": "Reemplazar 'except:' con 'except Exception:'",
	"fix.py.exceptPass.title": "Revisar uso de 'except: pass'",
	"fix.py.importStar.title": "Reemplazar 'import *' por imports explicitos",
	"fix.py.global.title": "Reemplazar 'global' por dependencias explicitas",
	"fix.py.mutableDefault.title": "Reemplazar argumento mutable por defecto",
	"fix.py.exec.title": "Revisar el uso de exec()",
	"fix.py.eval.title": "Revisar el uso de eval()",
	"fix.py.hardcodedPassword.title": "Mover la contrasena a variables de entorno",
	"fix.py.typeIgnore.title": "Resolver el error de mypy subyacente",

	"fix.java.sysout.title": "Eliminar System.out.println",
	"fix.java.syserr.title": "Eliminar System.err.println",
	"fix.java.emptyCatch.title": "Loggear o relanzar la excepcion",
	"fix.java.systemExit.title": "Reemplazar System.exit() por salida controlada",
	"fix.java.rawType.title": "Usar argumentos genericos",
	"fix.java.stringConcatLoop.title": "Usar StringBuilder",
	"fix.java.threadSleep.title": "Usar primitivos de concurrencia adecuados",
	"fix.java.suppressWarnings.title": "Resolver el warning suprimido",
	"fix.java.catchThrowable.title": "Capturar una excepcion mas especifica",

	"fix.cpp.printf.title": "Eliminar printf() de debug",
	"fix.cpp.cout.title": "Eliminar std::cout de debug",
	"fix.cpp.goto.title": "Reemplazar goto por flujo estructurado",
	"fix.cpp.gets.title": "Reemplazar gets() por fgets()",
	"fix.cpp.malloc.title": "Usar std::unique_ptr o std::make_unique",
	"fix.cpp.rawPointerNew.title": "Usar smart pointer",
	"fix.cpp.usingNamespaceStd.title": "Calificar identificadores con std::",
	"fix.cpp.defineConstant.title": "Usar constexpr en lugar de #define",
	"fix.cpp.sprintf.title": "Reemplazar sprintf() por snprintf()",
	"fix.cpp.strcpy.title": "Reemplazar strcpy() por strncpy() o std::string",

	"fix.c.printf.title": "Eliminar printf() de debug",
	"fix.c.goto.title": "Reemplazar goto por flujo estructurado",
	"fix.c.gets.title": "Reemplazar gets() por fgets()",
	"fix.c.malloc.title": "Acompanar malloc() con free()",
	"fix.c.sprintf.title": "Reemplazar sprintf() por snprintf()",
	"fix.c.strcpy.title": "Reemplazar strcpy() por strncpy()",
	"fix.c.strcat.title": "Reemplazar strcat() por strncat()",
	"fix.c.voidPointer.title": "Usar puntero tipado",

	"fix.dart.print.title": "Eliminar print()",
	"fix.dart.debugPrint.title": "Eliminar debugPrint()",
	"fix.dart.dynamic.title": "Reemplazar 'dynamic' por tipo explicito",
	"fix.dart.forceUnwrap.title": "Usar acceso null-safe",
	"fix.dart.emptyCatch.title": "Loggear o relanzar la excepcion",
	"fix.dart.runtimeType.title": "Usar 'is' en su lugar",
	"fix.dart.deepNesting.title": "Extraer widgets anidados",

	"fix.php.echo.title": "Eliminar echo",
	"fix.php.varDump.title": "Eliminar var_dump()",
	"fix.php.printR.title": "Eliminar print_r()",
	"fix.php.eval.title": "Revisar uso de eval()",
	"fix.php.mysqlDeprecated.title": "Reemplazar mysql_* por mysqli_* o PDO",
	"fix.php.variableVariables.title": "Sustituir variables variables por arrays",
	"fix.php.errorSuppression.title": "Eliminar supresion '@'",
	"fix.php.extract.title": "Reemplazar extract() por asignaciones explicitas",
	"fix.php.dieExit.title": "Sustituir die()/exit() por flujo controlado",
	"fix.php.global.title": "Reemplazar 'global' por inyeccion de dependencias",

	"fix.html.inlineStyle.title": "Mover estilo inline a una clase CSS",
	"fix.html.marquee.title": "Reemplazar <marquee> con animaciones CSS",
	"fix.html.brUsage.title": "Sustituir <br> apilados por layout adecuado",
	"fix.html.centerTag.title": "Reemplazar <center> con CSS",

	"fix.css.important.title": "Refactorizar selector para evitar !important",
	"fix.css.universalWildcard.title": "Usar selector mas especifico",

	"fix.common.todo.title": "Atender marcador TODO",
	"fix.common.fixme.title": "Atender marcador FIXME",
	"fix.common.hack.title": "Atender marcador HACK",
	"fix.common.xxx.title": "Atender marcador XXX",
	"fix.common.nestedLoops.title": "Refactorizar loops anidados",
};

const hints: Record<string, string> = {
	"hint.js.eval": "Evita eval(); usa JSON.parse, switch o pasa funciones.",
	"hint.js.emptyCatch": "Loggea el error o relanzalo; tragar errores oculta bugs.",
	"hint.js.nestedTernary": "Extrae a if/else o helper con nombre para mejor legibilidad.",
	"hint.js.newFunction": "new Function() ejecuta codigo arbitrario; usa closures.",
	"hint.js.documentWrite": "Usa APIs DOM (createElement/appendChild) o un framework.",
	"hint.js.setTimeoutString": "Pasa una funcion en vez de un string a setTimeout.",
	"hint.js.letArrayPush": "Construye con map/filter/spread para claridad e inmutabilidad.",
	"hint.js.switchNoBreak": "Anade break/return explicito o documenta el fallthrough.",

	"hint.ts.anyType": "Sustituye 'any' por un tipo preciso o 'unknown' con guarda.",
	"hint.ts.asAny": "Reduce con type guard; usa 'as unknown as T' solo como ultimo recurso.",
	"hint.ts.tsNocheck": "Quita @ts-nocheck y resuelve los errores subyacentes.",
	"hint.ts.nonNullAssertion": "Usa optional chaining (?.) o un null check explicito.",
	"hint.ts.expectErrorNoReason": "Documenta el motivo: @ts-expect-error: <razon>.",

	"hint.py.exceptPass": "Como minimo loggea la excepcion; nunca la silencies.",
	"hint.py.importStar": "Lista los nombres explicitos para evitar polucion.",
	"hint.py.global": "Pasa los valores como argumentos o usa una clase con estado.",
	"hint.py.mutableDefault": "Usa None y crea el mutable dentro de la funcion.",
	"hint.py.exec": "Evita exec(); usa una funcion conocida o un registry.",
	"hint.py.eval": "Usa ast.literal_eval para datos o una funcion real para logica.",
	"hint.py.hardcodedPassword": "Lee secretos desde variables de entorno o un manager.",
	"hint.py.typeIgnore": "Resuelve el error de tipos o usa cast/assert.",

	"hint.java.emptyCatch": "Loggea con un logger y relanza o devuelve un valor centinela.",
	"hint.java.systemExit": "Lanza una excepcion estructurada o devuelve un codigo de salida.",
	"hint.java.rawType": "Usa generics: List<String> en vez de List.",
	"hint.java.stringConcatLoop": "Usa StringBuilder en bucles para concatenacion O(n).",
	"hint.java.threadSleep": "Usa executors o variables de condicion en su lugar.",
	"hint.java.suppressWarnings": "Atiende el warning; suprime solo cuando sea necesario.",
	"hint.java.catchThrowable": "Captura una subclase especifica; nunca tragues OOM.",

	"hint.dart.dynamic": "Usa un tipo concreto o un generico; reserva dynamic para casos reales.",
	"hint.dart.forceUnwrap": "Usa ?., null checks o pattern matching en vez de !.",
	"hint.dart.emptyCatch": "Loggea con el logger de Flutter y relanza si procede.",
	"hint.dart.runtimeType": "Usa 'is'; runtimeType es lento y fragil.",
	"hint.dart.deepNesting": "Extrae widgets a subclases con nombre.",

	"hint.php.eval": "Evita eval(); usa switch o un mapa de callables.",
	"hint.php.mysqlDeprecated": "Usa mysqli_* con prepared statements o PDO con bind.",
	"hint.php.variableVariables": "Usa un array asociativo y accede por clave.",
	"hint.php.errorSuppression": "Maneja el error explicitamente; @ oculta problemas reales.",
	"hint.php.extract": "Asigna variables explicitamente para mantener el codigo seguro.",
	"hint.php.dieExit": "Usa flujos de retorno y manejo de excepciones adecuado.",
	"hint.php.global": "Inyecta dependencias por constructor o parametros.",

	"hint.html.inlineStyle": "Mueve la regla a un stylesheet y referencia por clase.",
	"hint.html.marquee": "Usa animaciones o transiciones CSS para movimiento.",
	"hint.html.brUsage": "Usa HTML semantico (parrafos, listas) en vez de <br> apilados.",
	"hint.html.centerTag": "Usa CSS (text-align/center, margin auto) en vez de <center>.",

	"hint.css.important": "Aumenta especificidad o refactoriza el cascading antes que !important.",
	"hint.css.universalWildcard": "Apunta a elementos especificos; '*' afecta a todo y es lento.",

	"hint.c.goto": "Refactoriza con loops estructurados o break/continue.",
	"hint.c.gets": "Reemplaza por fgets(buf, sizeof buf, stdin) para lecturas acotadas.",
	"hint.c.malloc": "Acompana cada malloc con free; considera RAII o arenas.",
	"hint.c.sprintf": "Usa snprintf() con tamano explicito para evitar overflow.",
	"hint.c.strcpy": "Usa strncpy() acotado o strlcpy donde este disponible.",
	"hint.c.strcat": "Usa strncat() acotado o construye con snprintf().",
	"hint.c.voidPointer": "Prefiere punteros tipados; void* pierde la informacion de tipo.",

	"hint.cpp.goto": "Usa flujo estructurado (loops, break, return).",
	"hint.cpp.gets": "Usa std::getline o fgets para lecturas acotadas.",
	"hint.cpp.malloc": "Prefiere std::make_unique / std::make_shared.",
	"hint.cpp.rawPointerNew": "Envuelve con std::unique_ptr / std::shared_ptr.",
	"hint.cpp.usingNamespaceStd": "Usa el prefijo std:: o importa nombres especificos.",
	"hint.cpp.defineConstant": "Usa constantes 'constexpr' o 'const' tipadas.",
	"hint.cpp.sprintf": "Usa snprintf() o std::format para formateo seguro.",
	"hint.cpp.strcpy": "Usa std::string o strncpy() acotado.",

	"hint.common.todo": "Convierte en ticket o elimina si esta obsoleto.",
	"hint.common.fixme": "Programa el fix o elimina el marcador al resolverlo.",
	"hint.common.hack": "Planifica el refactor; documenta por que es necesario por ahora.",
	"hint.common.xxx": "Investiga el codigo marcado y resuelvelo.",
	"hint.common.nestedLoops": "Refactoriza a una sola pasada, hash lookup o helper.",
};

const roasts: Record<string, string> = {
	"roast.clean.1": "Tu codigo esta tan limpio que brilla! Cual es tu secreto?",
	"roast.clean.2": "Cero shames? Estas escribiendo codigo o solo admirando tu cursor?",
	"roast.clean.3": "Impecable. Uncle Bob lloraria de alegria.",
	"roast.clean.4": "Si el codigo pudiera ganar concursos de belleza, el tuyo se lleva la corona.",
	"roast.clean.5": "Tu codigo esta mas limpio que mi apartamento. Y eso no dice mucho, pero algo es algo.",
	"roast.clean.6": "Inmaculado. Esto lo escribiste tu o un linter cobro consciencia?",

	"roast.low.1": "Unas cuantas asperezas, pero nada que quite el sueno.",
	"roast.low.2": "Casi perfecto. Solo un par de esqueletos en el armario.",
	"roast.low.3": "Pecados menores. Tu codigo va a confesion, no a prision.",
	"roast.low.4": "Un poquito de shame, como dejarte el intermitente puesto. Inofensivo, pero se nota.",
	"roast.low.5": "Tu codigo solo necesita quitarle el polvo, no una reforma integral.",
	"roast.low.6": "Estas al borde de la grandeza. Solo unos console.logs te separan.",

	"roast.medium.1": "Tu codigo tiene... caracter. Mucho caracter.",
	"roast.medium.2": "Funciona, pero esta sostenido con cinta adhesiva y oraciones.",
	"roast.medium.3": "Ni genial ni terrible. El 3.6 Roentgen de la calidad de codigo.",
	"roast.medium.4": "En algun punto entre 'funciona en mi maquina' y 'por favor no toques nada'.",
	"roast.medium.5": "Tu codigo se lee como una novela de misterio. Nadie sabe que pasa despues. Tu incluido.",
	"roast.medium.6": "He visto cosas peores. Pero tambien he visto cosas mucho, mucho mejores.",

	"roast.high.1": "Este codigo necesita un grupo de apoyo.",
	"roast.high.2": "He visto codigo mas limpio en un hackathon a las 2AM.",
	"roast.high.3": "Tu codigo es tan desordenado que hasta git blame rechaza la responsabilidad.",
	"roast.high.4": "Este codigo no necesita una review, necesita una intervencion.",
	"roast.high.5": "Si el codigo espagueti fuera un deporte, serias medallista olimpico.",
	"roast.high.6": "Tu codigo tiene mas problemas que un quiosco de revistas.",

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

const ui: UiStrings = {
	scanningWorkspace: "Juzgando tu workspace... aguanta.",
	noShamesYet: "Sin shames aun — o estas limpio o estamos cargando el menu de roast.",
	noShamesInFile: "Este archivo esta sospechosamente limpio. Lo escribiste tu, seguro?",
	cacheCleared: "CodeShamer: Cache limpiado. Vuelve a ejecutar el escaneo.",
	ruleDisabled: (ruleId) =>
		`CodeShamer: La regla '${ruleId}' ha sido desactivada en el workspace.`,
	statusBarScanning: "$(sync~spin) CodeShamer: Escaneando workspace...",
	statusBarTooltip: "El escaneo de CodeShamer esta en curso",
	achievementBanner: (title) => `Logro de CodeShamer: ${title}`,
	codeActionIgnoreLine: "CodeShamer: Ignorar esta linea",
	codeActionIgnoreFile: "CodeShamer: Ignorar este archivo",
	codeActionDisableWorkspace: (ruleId) =>
		`CodeShamer: Desactivar regla '${ruleId}' en todo el workspace`,
	panelHeaderTitle: (totalShames, fileCount) =>
		`${totalShames} shame${totalShames !== 1 ? "s" : ""} en ${fileCount} archivo${
			fileCount !== 1 ? "s" : ""
		}`,
	scanningStatusMessage: "CodeShamer esta analizando tu workspace...",
	scanCompletedStatusMessage: (files, shames) =>
		`CodeShamer: ${shames} shame${shames !== 1 ? "s" : ""} en ${files} archivo${
			files !== 1 ? "s" : ""
		}`,
};

function fallback<T extends string | undefined>(value: T, key: string): string {
	if (typeof value === "string" && value.length > 0) {
		return value;
	}
	return en.t(key);
}

const es: Locale = {
	id: "es",
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
		fallback(messages[messageKey], messageKey),
	hintMessage: (hintKey: string) =>
		fallback(hints[hintKey], hintKey) || en.hintMessage(hintKey),
	t: (key: string) => {
		const value =
			messages[key] ??
			fixes[key] ??
			hints[key] ??
			roasts[key] ??
			levels[key] ??
			achievements[key];
		return fallback(value, key);
	},
	ui,
	messages,
	roasts,
	levels,
	achievements,
	fixes,
	hints,
};

export default es;
