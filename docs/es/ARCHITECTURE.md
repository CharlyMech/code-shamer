<div align="start">
  <a href="../en/ARCHITECTURE.md">EN</a>  | <span>ES</span> 
</div>

# Guía de Arquitectura e Interno — CodeShamer

Este documento cubre los aspectos técnicos internos de CodeShamer: cómo se estructura el código, cómo funciona el flujo de análisis, cómo se configura la CI/CD y cómo añadir nuevos elementos.

---

## Estructura del proyecto

```
src/
extension.ts # Punto de entrada: conecta todo
settings.ts # Lee la configuración de codeShamer.* desde VS Code
statusBar.ts # Elemento inferior de la barra de estado (emoji + contador)
diagnostics.ts # Introduce los valores de verificación en el panel de problemas de VS Code

engine/
types.ts # Tipos principales: ShamePattern, ShameMatch, FileShameResult, etc.
shamEngine.ts # Analiza un solo archivo → devuelve ShameMatch[]
languageRules.ts # Registro de reglas: combina reglas específicas del lenguaje y comunes
ignoreParser.ts # Gestiona comentarios `code-shamer-ignore`
rules/
common.ts # Patrones multilenguaje (TODO, FIXME, HACK, XXX)
javascript.ts # Patrones JS (console.log, var, ==, eval, debugger…)
typescript.ts # Específico de TS (: any, @ts-ignore…) — añadido SOBRE JS
python.ts # Patrones de Python (print, bare except, import *…)
java.ts # Patrones de Java
cpp.ts # Patrones de C++
c.ts # Patrones de C
dart.ts # Patrones de Dart
php.ts # Patrones de PHP

scanner/
workspaceScanner.ts # Escanea todos los archivos del espacio de trabajo, almacena en caché los resultados y emite eventos
fileCache.ts # Almacena en caché por tiempo de archivo — evita volver a analizar archivos sin cambios

sidebar/
shameTreeProvider.ts # TreeDataProvider para la barra lateral de la barra de actividades
shameTreeItems.ts # Clases de TreeItem (summary, file, match)
shameHeaderProvider.ts # Encabezado de la vista web sobre el árbol
shamePanelProvider.ts # Panel de vista web completo

codeActions/
shameCodeActionProvider.ts # Soluciones rápidas (var→let, ==→===, remove console.log…)

roasts/
shamilevels.ts # Umbrales, títulos y colores de los niveles de vergüenza
roastMessages.ts # Mensajes humorísticos asignados a rangos de puntuación

history/
shamileHistory.ts # Rastrea la puntuación de vergüenza a lo largo del tiempo (workspaceState)
achievements.ts # Sistema de logros

i18n/
types.ts # Definición de la interfaz de configuración regional
index.ts # Detecta el idioma de visualización de VS Code y devuelve la configuración regional
en.ts # Traducciones al inglés (mensajes, asados, niveles, logros)
es.ts # Traducciones al español
```

---

## Cómo funciona el pipeline de análisis

```
Activación
│
▼
WorkspaceScanner.scanWorkspace()
│ workspace.findFiles() → filtra por idiomas habilitados + excludePatterns
│
▼ para cada archivo
FileCache.get(path, mtime)
│ acierto de caché → usar FileShameResult en caché
│ error de caché → analyseFile()
│
▼
shameEngine.analyzeFile(content, languageId, filePath)
│ 1. getRulesForLanguage() → reglas de idioma + reglas comunes
│ 2. Filtrar por disabledRules y severeThreshold
│ 3. getIgnoredLines() → analizar comentarios de code-shamer-ignore
│ 4. Escaneo por línea: probar cada expresión regular de regla de una sola línea
│ 5. Escaneo de contenido completo: probar cada expresión regular de regla de varias líneas
│ 6. Sumar severidades → totalScore
│
▼
FileShameResult { filePath, matches[], totalScore }
│
▼ agregado en Resultado de Vergüenza del Espacio de Trabajo
├─► Administrador de Diagnósticos → Panel de Problemas de VS Code
├─► Proveedor de Árbol de Vergüenza → Barra lateral de la Barra de Actividad
├─► Barra de Estado → Emoji + Contador
└─► Historial de Vergüenza → Seguimiento del historial + Logros
```

Al guardar un archivo (`scanOnSave: true`), el archivo guardado se invalida en la caché y se ejecuta un nuevo análisis completo.

---

## Puntuación y Niveles de Vergüenza

Cada patrón coincidente contribuye con su `severidad` (1–5) a la `puntuación total` del archivo. La `puntuación total` del espacio de trabajo es la suma de todos los archivos.

| Puntuación | Nivel               |
| ---------- | ------------------- |
| 0          | Clean Code Guru     |
| 5+         | Like a Hacker       |
| Más de 25  | Nivel de antigüedad |
| Más de 75  | Como júnior         |
| Más de 150 | Vive Coder          |
| Más de 300 | Shame Overlord      |

Los mensajes de asombro se agrupan por separado: `< 25` bajo, `< 75` medio, `< 150` alto, `≥ 150` extremo.

---

## Añadir una nueva regla a un lenguaje existente

1. Abrir `src/engine/rules/<language>.ts`
2. Añadir una entrada `ShamePattern`:

```typescript
{
id: "js-my-rule", // <lang>-<descriptive-kebab-name>
patrón: /myRegex/, // Sin indicador `g` — el motor lo gestiona
gravedad: 2, // 1 (quisquilloso) a 5 (crítico)
categoría: "style", // seguridad | depuración | estilo | rendimiento | mantenimiento | fiabilidad
messageKey: "shame.js.myRule",
}
```

3. Agregue la cadena de mensaje a `src/i18n/en.ts` y `src/i18n/es.ts`
4. Compilar y probar: `pnpm run compile`, luego `F5`

Para patrones multilínea (que abarcan varias líneas), agregue `multiline: true`. El motor los ejecutará con el contenido completo del archivo con el indicador `g`.

---

## Agregar un nuevo idioma

Consulte [ADDING_LANGUAGES.md](./ADDING_LANGUAGES.md) para una guía paso a paso completa.

Resumen:

1. Cree `src/engine/rules/<lang>.ts` con una exportación `ShamePattern[]`.
2. Regístrelo en `src/engine/languageRules.ts`.
3. Añada las extensiones de archivo `LANG_EXTENSIONS` en `src/scanner/workspaceScanner.ts`.
4. Añada mensajes i18n a `en.ts` y `es.ts`.
5. Añada el ID del idioma a `DEFAULT_LANGUAGES` en `src/settings.ts` y a la matriz predeterminada `package.json`.

---

## Añadiendo una solución rápida

Edite `src/codeActions/shameCodeActionProvider.ts` y añada una entrada al mapa `FIXABLE_RULES`, proporcionando el texto de reemplazo o la lógica de transformación.

---

## Añadir una nueva configuración regional i18n

1. Cree `src/i18n/<code>.ts` implementando la interfaz `Locale` desde `src/i18n/types.ts`
2. Copie `src/i18n/en.ts` como punto de partida y traduzca todas las cadenas
3. Registre la nueva configuración regional en `src/i18n/index.ts`

---

## Sistema de configuración

Todas las configuraciones usan el prefijo `codeShamer.*`. Se declaran en **dos lugares**; ambos deben mantenerse sincronizados:

-  `package.json` → `contributes.configuration.properties` (declara valores predeterminados, tipos y descripciones para la interfaz de usuario de VS Code)
-  `src/settings.ts` → `getSettings()` y la interfaz `CodeShamerSettings` (acceso en tiempo de ejecución)

---

## CI/CD

### Estrategia de rama

```
feature/feat-xxx ──PR──► dev ──PR──► main
│ │
auto-version auto-publish
auto-changelog marketplace
github release
git tag
```

### Flujos de trabajo

#### `ci.yml`

**Trigger**: push a `dev`, PR a `dev` o `main` **Funciona**: lint + compilación (+ pruebas cuando existen)

#### `version-bump.yml`

**Activador**: fusionar commit con `dev` **Funciona**: lee el nombre de la rama fusionada, determina el tipo de actualización por prefijo:

| Prefijo de rama                                 | Actualización |
| ----------------------------------------------- | ------------- |
| `chore/*`, `refactor/*`, `perf/*`, `build/*`    | major         |
| `feat/*`, `feature/*`, `style/*`                | minor         |
| `fix/*`, `docs/*`, `test/*`, `ci/*`, `hotfix/*` | patch         |

Confirmación automática: `chore: bump version to vX.Y.Z [skip ci]`

#### `publish.yml`

**Desencadenador**: fusionar con `main` **Hace**:

1. Lint + compilación
2. Lee la versión de `package.json`
3. Empaqueta el VSIX
4. Publica en VS Code Marketplace
5. Publica en Open VSX Registry (opcional, `continue-on-error`)
6. Crea la etiqueta de Git `vX.Y.Z`
7. Crea una versión de GitHub con el VSIX como activo y un registro de cambios generado automáticamente
8. Actualiza `CHANGELOG.md`

### Secretos obligatorios

Configúrelos en **Ajustes → Secretos y variables → Acciones**:

| Secreto | Dónde obtenerlo | Propósito |
| --- | --- | --- |
| `GH_PAT` | GitHub → Configuración → Configuración del desarrollador → PAT detallada → `contents: write` | Enviar actualizaciones de versión y confirmaciones del registro de cambios |
| `VSCE_PAT` | Azure DevOps → Configuración de usuario → Tokens de acceso personal → Marketplace > Administrar | Publicar en VS Code Marketplace |
| `OVSX_PAT` | https://open-vsx.org → Configuración de usuario → Tokens de acceso | Publicar en Open VSX (opcional) |

## Convención de confirmaciones

El registro de cambios automático categoriza las confirmaciones por prefijo:

| Prefijo                                  | Categoría                      |
| ---------------------------------------- | ------------------------------ |
| `feat:`                                  | Nuevas características         |
| `fix:`, `hotfix:`                        | Correcciones de errores        |
| `docs:`                                  | Documentación                  |
| `chore:`, `refactor:`, `perf:`, `build:` | Cambios importantes / Internos |

Usar mensajes de confirmación descriptivos para registros de cambios legibles:

```
Feat: añadir compatibilidad con el lenguaje Ruby con 8 reglas de detección
Corrección: falso positivo en == dentro de literales de cadena
Documentación: añadir captura de pantalla para el panel lateral
```

Las confirmaciones que contienen `[skip ci]` no activan flujos de trabajo (evita bucles).

--

## Solución de problemas

**La extensión no aparece en la barra lateral** Comprueba que `package.json` tenga entradas `viewsContainers.activitybar` y `views.codeshamer` válidas, y que `media/codeshamer-activity.svg` exista.

**No se detectaron errores**

-  Verificar que el archivo de idioma esté en `codeShamer.enabledLanguages`
-  Verificar el ID de idioma que VS Code informa (indicador de idioma en la barra inferior)
-  Asegurarse de que `codeShamer.enable` sea `true`
-  Verificar que la ruta del archivo no coincida con `codeShamer.excludePatterns`

**El escaneo es lento**

-  Reducir `codeShamer.maxFilesToScan`
-  Añadir patrones a `codeShamer.excludePatterns`
-  Los espacios de trabajo grandes tardan más en el primer escaneo; los escaneos posteriores agotan la caché

**Errores de TypeScript**

-  Ejecutar `pnpm install` para asegurar que todos los paquetes de tipos estén presentes
-  Asegurarse de que la versión de `@types/vscode` coincida con `engines.vscode` en `package.json`
