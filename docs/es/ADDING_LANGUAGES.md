<div align="start">
  <a href="../en/ABOUT_LICENSE.md">EN</a>  | <span>ES</span> 
</div>

# Añadir un nuevo lenguaje de programación a CodeShamer

Esta guía te guía para añadir compatibilidad con un nuevo lenguaje de programación. Usaremos **Ruby** como ejemplo.

## Paso 1: Crear el archivo de reglas

Crea un nuevo archivo `src/engine/rules/ruby.ts`:

```typescript
import { ShamePattern } from "../types";

export const rubyRules: ShamePattern[] = [
{
id: "ruby-puts",
patrón: /\bputs\s/,
gravedad: 2,
categoría: "depuración",
clave del mensaje: "shame.ruby.puts",
},
{
id: "ruby-pp",
patrón: /\bpp\s/,
gravedad: 2,
categoría: "depuración",
clave del mensaje: "shame.ruby.pp",
},
{
id: "ruby-eval",
patrón: /\beval\s*[\(\s]/,
gravedad: 5,
categoría: "seguridad",
clave del mensaje: "shame.ruby.eval",
},
{
id: "ruby-rescue-all",
patrón: /rescue\s*$/,
gravedad: 4,
categoría: "fiabilidad",
clave del mensaje: "shame.ruby.rescueAll",
},
{
id: "ruby-global-var",
patrón: /\$\w+\s*=/,
gravedad: 3,
categoría: "estilo",
claveMensaje: "shame.ruby.globalVar",
},
];
```

### Directrices de las reglas

Cada `ShamePattern` tiene estos campos:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | `string` | Identificador único. Formato: `<lang>-<descriptive-name>` |
| `patrón` | `RegExp` | Expresión regular para la coincidencia. **NO use la bandera `g`** — el motor lo gestiona |
| `gravedad` | `1-5` | 1 = quisquilloso, 2 = sugerencia, 3 = advertencia, 4 = importante, 5 = crítico |
| `categoría` | `ShameCategory` | Uno de: `seguridad`, `debug`, `style`, `performance`, `maintenance`, `reliability` |
| `messageKey` | `string` | Clave i18n para el mensaje legible. Formato: `shame.<lang>.<ruleName>` |
| `multiline` | `boolean?` | Establézcalo en `true` si el patrón debe abarcar varias líneas |

### Guía de Gravedad

| Nivel | Cuándo usar | Ejemplo |
| --- | --- | --- |
| 1 | Crítica, cosmética | Números mágicos, líneas largas |
| 2 | Sugerencia, problema menor | Salida de depuración, estilo menor |
| 3 | Advertencia, debería corregirse | Patrones obsoletos, igualdad débil |
| 4 | Importante, probablemente un error | Bloques catch vacíos, `debugger` |
| 5 | Crítico, riesgo de seguridad | `eval()`, contraseñas codificadas |

### Consejos sobre Patrones

-  Mantenga los patrones simples: evite que sean demasiado complejos regex
-  Prueba tanto con coincidencias positivas como con falsos positivos
-  Si un patrón requiere contexto multilínea, configure `multiline: true`
-  El motor ejecuta cada patrón por línea (a menos que sea multilínea), por lo que se prefieren los patrones basados ​​en líneas.

## Paso 2: Registrar el idioma

Abra `src/engine/languageRules.ts` y agregue su idioma:

```typescript
import { rubyRules } from "./rules/ruby";

const languageSpecificRules: Record<string, ShamePattern[]> = {
	// ... idiomas existentes ...
	ruby: rubyRules,
};
```

Agregue también la asignación de glob de archivo en `src/scanner/workspaceScanner.ts`:

```typescript
const LANG_GLOBS: Record<string, string> = {
	// ... asignaciones existentes ...
	ruby: "**/*.rb",
};
```

## Paso 3: Añadir traducciones

### Inglés (`src/i18n/en.ts`)

Añadir entradas al registro `messages`:

```typescript
// Ruby
"shame.ruby.puts": "puts dejados en el código — la ruta de navegación del desarrollador Ruby",
"shame.ruby.pp": "pp() dejados en el código — ¿impresión bonita en producción?",
"shame.ruby.eval": "eval() detectado — la ejecución dinámica de código es peligrosa",
"shame.ruby.rescueAll": "Rescate simple — capturando todas las excepciones silenciosamente",
"shame.ruby.globalVar": "Variable global — el estado mutable compartido es la raíz de todo mal",
```

### Español (`src/i18n/es.ts`)

Añadir las mismas claves con las traducciones al español:

```typescript
// Ruby
"shame.ruby.puts": "puts en el código — la migaja de pan del dev Ruby",
"shame.ruby.pp": "pp() en el codigo — Pretty Printing en produccion?",
"shame.ruby.eval": "eval() detectado — ejecución de código dinámico es peligrosa",
"shame.ruby.rescueAll": "Rescue sin tipo — atrapando todas las excepciones en silencio",
"shame.ruby.globalVar": "Variable global — el estado mutable compartido es la raíz de todo mal",
```

## Paso 4: Agregar a idiomas predeterminados

En `package.json`, agregue el idioma a la lista predeterminada:

```json
"codeShamer.enabledLanguages": {
"por defecto": [
// ... idiomas existentes ...
"rubí"
]
}
```

Actualice también los valores predeterminados en `src/settings.ts`.

## Paso 5: Prueba

1. Compilar: `pnpm run compile`
2. Pulsa `F5` para iniciar el Host de Desarrollo de Extensiones
3. Abre un archivo en tu idioma
4. Verifica que los errores aparezcan en:

-  La vista de árbol de la barra lateral
-  El panel de Problemas (diagnóstico)
-  El contador de la barra de estado

## Paso 6: Enviar una solicitud de extracción

1. Crea una rama: `git checkout -b feature/add-ruby-support`
2. Incluye todos los archivos modificados:

-  `src/engine/rules/ruby.ts` (nuevo)
-  `src/engine/languageRules.ts` (modificado)
-  `src/scanner/workspaceScanner.ts` (modificado)
-  `src/i18n/en.ts` (modificado)
-  `src/i18n/es.ts` (modificado)
-  `src/settings.ts` (modificado)
-  `package.json` (modificado)

3. En tu solicitud de extracción Descripción, incluye:

-  El lenguaje que estás añadiendo
-  Lista de patrones con explicaciones
-  Cómo los probaste

## ¿Qué hace que una regla sea buena?

-  **Actitud**: El desarrollador debe saber cómo solucionarla.
-  **Baja tasa de falsos positivos**: Es mejor pasar por alto algunos casos que marcar el código correcto.
-  **Relevante**: El patrón debe representar una mala práctica.
-  **Mensaje divertido**: ¡Mantén un tono ligero y humorístico!

## ¿Necesitas ayuda?

Abre una incidencia con la etiqueta `new-language` y te ayudaremos a empezar.
