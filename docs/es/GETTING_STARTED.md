<div align="start">
  <a href="../en/GETTING_STARTED.md">EN</a>  | <span>ES</span> 
</div>

# Primeros pasos: Uso local de CodeShamer

Esta guía explica cómo ejecutar y usar CodeShamer en VS Code **sin publicar en el Marketplace**. Lo ejecutarás directamente desde el código fuente utilizando el Host de desarrollo de extensiones de VS Code.

---

## Requisitos previos

-  [VS Code](https://code.visualstudio.com/) 1.109.0 o posterior
-  [Node.js](https://nodejs.org/) 18+
-  [pnpm](https://pnpm.io/) — Instalar con `npm install -g pnpm`

---

## Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/charlymech/code-shamer.git
cd code-shamer
```

---

## Paso 2 — Instalar dependencias

```bash
pnpm install
```

---

## Paso 3 — Compilar la extensión

```bash
pnpm run compile
```

---

## Paso 4 — Iniciar el host de desarrollo de la extensión

Abrir la carpeta del proyecto en VS Code y luego presiona **`F5`**.

Se abrirá una nueva ventana de VS Code: el **Host de Desarrollo de Extensiones**, una instancia de VS Code en un entorno aislado con CodeShamer ya cargado y activo.

---

## Paso 5: Abre un Proyecto y Comienza el Análisis de Vergüenza

1. En la ventana del Host de Desarrollo de Extensiones, abre cualquier carpeta de proyecto (`Archivo → Abrir Carpeta`) que use los lenguajes que quieres analizar (JS, TS, Python, etc.).
2. CodeShamer escaneará automáticamente el espacio de trabajo al iniciarse.
3. Busca el **icono de la llama** en la Barra de Actividad (barra lateral izquierda); haz clic en él para abrir el Informe de Vergüenza.

Listo. CodeShamer está monitoreando tu código.

> **Consejo:** Si realiza cambios en el código fuente de la extensión, guarde el archivo (con `pnpm run compile` o `pnpm run watch` ejecutándose) y luego presione `Ctrl+Shift+F5` / `Cmd+Shift+F5` en la ventana principal para recargar el Host de Desarrollo de Extensiones.

---

## Qué verá

### Barra de actividad — Informe de vergüenza

Haga clic en el icono de la llama para abrir el panel. Muestra:

-  Su **nivel de vergüenza** (desde "Gurú del código limpio" hasta "Señor de la vergüenza")
-  Un **desglose por categoría** (depuración, seguridad, estilo, fiabilidad…)
-  Una **lista archivo por archivo** de todos los problemas detectados
-  Haga clic en cualquier elemento para **ir directamente a la línea problemática**

### Barra de estado (inferior)

La barra inferior muestra su nivel de emojis y el recuento total de vergüenza. Haga clic en ella para abrir el panel Informe de vergüenza.

### Panel de Problemas

Todos los errores también aparecen en el panel de Problemas de VS Code (`Ctrl+Shift+M` / `Cmd+Shift+M`), como cualquier otro linter. Haga clic en cualquier entrada para navegar a la línea.

### Soluciones Rápidas

Para algunos patrones, CodeShamer ofrece soluciones con un solo clic. Coloque el cursor en una línea marcada y presione `Ctrl+.` / `Cmd+.`:

-  `var` → `let`
-  `==` → `===`
-  `!=` → `!==`
-  Eliminar sentencias `debugger`
-  Eliminar llamadas a `console.log()`

---

## Ignorar Líneas Específicas

Si CodeShamer marca algo intencional, suprímalo con un comentario:

```javascript
// code-shamer-ignore-next-line
console.log("intentional debug output");
eval(trustedCode); // code-shamer-ignore
```

Funciona en todos los idiomas compatibles con la sintaxis de comentarios adecuada (`//`, `#`, `--`).

---

## Configuración

Abre la configuración de VS Code (`Ctrl+,` / `Cmd+,`) y busca **CodeShamer**.

| Configuración | Predeterminado | Descripción |
| --- | --- | --- |
| `codeShamer.enable` | `true` | Habilitar o deshabilitar la extensión |
| `codeShamer.enableRoasts` | `true` | Mostrar mensajes de burla humorística después de los escaneos |
| `codeShamer.enabledLanguages` | all | Idiomas a analizar |
| `codeShamer.severityThreshold` | `1` | Gravedad mínima a reportar (1 = todo, 5 = solo crítico) |
| `codeShamer.excludePatterns` | ver abajo | Patrones globales para rutas a omitir |
| `codeShamer.scanOnSave` | `true` | Volver a escanear al guardar un archivo |
| `codeShamer.maxFilesToScan` | `5000` | Máximo de archivos por escaneo del espacio de trabajo |
| `codeShamer.disabledRules` | `[]` | ID de reglas para silenciar completamente |

### Desactivación de reglas específicas

Agregue los ID de reglas a `codeShamer.disabledRules` en su `settings.json`:

```json
{
	"codeShamer.disabledRules": ["common-todo", "js-console-log"]
}
```

Los ID de reglas se muestran en el panel de Problemas y en la barra lateral del Informe de Vergüenza.

### Rutas Excluidas

De forma predeterminada, CodeShamer ignora los directorios generados y de dependencia: `node_modules`, `dist`, `build`, `.astro`, `.next`, `.nuxt`, `.svelte-kit`, `.cache`, `.turbo`, `.git`, `.claude`, `.cursor` y más.

Puede agregar los suyos propios:

```json
{
	"codeShamer.excludePatterns": [
		"**/node_modules/**",
		"**/my-generated-dir/**"
	]
}
```

> **Nota:** Configurar `excludePatterns` en la configuración de su espacio de trabajo **reemplaza** los valores predeterminados por completo. Copie primero la lista completa de valores predeterminados si desea extenderla en lugar de reemplazarla.

---

## Mantenerse actualizado

Para obtener una versión más reciente, descargue y recompila:

```bash
git pull origin main
pnpm install
pnpm run compile
```

Luego presione `F5` de nuevo para reiniciar el Host de Desarrollo de Extensiones.

---

## Solución de problemas

**El icono de la llama no aparece en la Barra de actividades** Recargue VS Code (`Ctrl+Shift+P` → `Developer: Reload Window`). Si sigue sin aparecer, compruebe que la extensión esté habilitada en el panel Extensiones.

**No se detectan errores**

-  Asegúrese de que el idioma del archivo esté en `codeShamer.enabledLanguages`
-  Compruebe que `codeShamer.enable` sea `true`
-  Verifique que el archivo no coincida con una entrada `excludePatterns`.
-  Intente ejecutar `CodeShamer: Scan Workspace` desde la paleta de comandos.

**Demasiados o muy pocos errores de verificación** Aumente `codeShamer.severityThreshold` (por ejemplo, a `3`) para ver solo los problemas de gravedad media o superior. O deshabilite reglas con ruido específicas con `codeShamer.disabledRules`.

**El análisis es lento** Reduzca `codeShamer.maxFilesToScan` o agregue directorios generados grandes a `codeShamer.excludePatterns`. El primer análisis de un espacio de trabajo grande tarda más; los análisis posteriores usan la caché y son mucho más rápidos.
