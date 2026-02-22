<div align="start">
  <a href="../en/CONTRIBUTING.md">EN</a>  | <span>ES</span> 
</div>

# Contribuyendo a CodeShamer

¡Gracias por tu interés en contribuir! CodeShamer fue creado por desarrolladores que se cansaron de revisar los mismos patrones incorrectos una y otra vez. Aquí te explicamos cómo puedes ayudar a mejorarlo.

---

## Índice

-  [Código de Conducta](#code-of-conduct)
-  [Formas de Contribuir](#ways-to-contribute)
-  [Reportar Incidencias](#reporting-issues)
-  [Enviar Solicitudes de Extracción](#submitting-pull-requests)
-  [Añadir tu Idioma Favorito](#adding-your-favourite-language)
-  [Configuración del Desarrollo](#development-setup)
-  [Estilo del Código](#code-style)

---

## Código de Conducta

Este proyecto sigue el [Código de Conducta del Pacto del Colaborador](./CODE_OF_CONDUCT.md). Al participar, te comprometes a cumplirlo. Por favor, reporta cualquier comportamiento inaceptable a los encargados del repositorio a través de GitHub Issues.

---

## Formas de contribuir

-  **Reportar un error**: ¿Encontraste un falso positivo, un patrón que no se detectó o algo que no funciona?
-  **Sugerir una regla**: ¿Conoces un patrón incorrecto que aún no estemos detectando?
-  **Añadir un idioma**: ¿CodeShamer no es compatible con tu stack? ¡Añádelo!
-  **Mejorar los mensajes**: haz que las burlas sean más graciosas o que las descripciones de las burlas sean más claras.
-  **Añadir una traducción**: adaptar CodeShamer a un nuevo idioma (i18n).
-  **Corregir un error**: elige un problema abierto y lánzate.
-  **Mejorar la documentación**: ¿Hay algo que no esté claro? Aclarar las cosas

---

## Reportar incidencias

Usa [GitHub Issues](https://github.com/charlymech/code-shamer/issues) e incluye:

**Para errores:**

-  Versión de VS Code
-  Versión de CodeShamer
-  Pasos para reproducir
-  Comportamiento esperado vs. real
-  El fragmento de código que desencadenó la incidencia (si corresponde)

**Para falsos positivos** (algo que no debería estar marcado):

-  El ID de la regla (visible en el panel de Problemas o en la barra lateral)
-  El fragmento de código
-  Por qué no debería marcarse

**Para reglas o solicitudes de funciones faltantes:**

-  Usa la etiqueta "mejora"
-  Describe el patrón incorrecto, por qué es perjudicial y un ejemplo
-  Menciona a qué lenguaje(s) se aplica

---

## Enviar solicitudes de incorporación de cambios

1. **Bifurca** el repositorio y clona tu bifurcación:

```bash
git clone https://github.com/charlymech/code-shamer.git
cd code-shamer
```

2. **Instalar las dependencias** y compilar:

```bash
pnpm install
pnpm run compile
```

3. **Crear una rama** desde `dev` (no desde `main`):

```bash
git checkout dev
git pull origin dev
git checkout -b feat/add-ruby-support
```

Usar los prefijos que la CI entiende: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`

4. **Realizar los cambios** siguiendo las directrices de [Estilo de código](#code-style).

5. **Verificar** que todo funcione:

```bash
pnpm run compile # Debe compilar sin errores
pnpm run lint # Debe pasar el linting
```

Luego, presiona `F5` en VS Code para probar en el Host de Desarrollo de Extensiones.

6. **Confirmar** usando mensajes descriptivos:

```
Feat: añadir compatibilidad con Ruby con 8 reglas de detección
Fix: falso positivo en `=` dentro de literales de cadena
Documentación: aclarar la sintaxis de ignorar comentarios
```

7. **Abrir una solicitud de modificación** dirigida a la rama `dev` con:

-  Un título claro
-  Qué cambió y por qué
-  Capturas de pantalla si afecta a la interfaz de usuario

> Las solicitudes de modificación a `main` son solo para fusiones de versiones desde `dev`. Las contribuciones regulares siempre van a `dev`.

---

## Añadir tu lenguaje favorito

¿Quieres que CodeShamer sea compatible con Rust, Go, Ruby, Swift, Kotlin o cualquier otro lenguaje? Nos encantaría.

Consulta [ADDING_LANGUAGES.md](./ADDING_LANGUAGES.md) para ver la guía completa paso a paso. Abarca:

-  Creación del archivo de reglas
-  Registro del idioma
-  Adición de extensiones de archivo
-  Escritura de mensajes i18n
-  Pruebas completas

La guía utiliza Ruby como ejemplo práctico, pero los pasos son idénticos para cualquier idioma.

**Antes de empezar**, abre una incidencia para debatir el idioma que quieres añadir, para evitar duplicaciones y acordar qué reglas son más adecuadas.

---

## Configuración de desarrollo

**Requisitos previos:**

-  [Node.js](https://nodejs.org/) 18+
-  [pnpm](https://pnpm.io/)
-  [VS Code](https://code.visualstudio.com/) 1.109.0+

```bash
# Instalar dependencias
pnpm install

# Compilar
pnpm run compile

# Modo de observación (recompilación automática al guardar)
pnpm run watch

# Iniciar el host de desarrollo de extensiones
# → Abrir el proyecto en VS Code y presionar F5
```

Para obtener una guía detallada sobre las pruebas locales (qué comprobar, cómo depurar, fragmentos de archivo de prueba), consulte [GETTING_STARTED.md](./GETTING_STARTED.md). Está escrito para usuarios finales, pero la sección de pruebas locales de VSIX es igualmente útil para los colaboradores.

Para conocer los aspectos internos de la arquitectura (cómo funciona el flujo de análisis, cómo se configura la CI/CD), consulte [ARCHITECTURE.md](./ARCHITECTURE.md).

| Comando            | Descripción                                   |
| ------------------ | --------------------------------------------- |
| `pnpm run compile` | Compilar la extensión                         |
| `pnpm run watch`   | Compilar y supervisar cambios                 |
| `pnpm run lint`    | Ejecutar ESLint                               |
| `pnpm run test`    | Ejecutar pruebas                              |
| `pnpm run package` | Crear compilación de producción               |
| `F5` en VS Code    | Iniciar el host de desarrollo de la extensión |

---

## Estilo de código

-  **TypeScript** con modo estricto habilitado
-  **Tabulación** para sangría
-  **Punto y coma** obligatorio
-  Usar `===` en lugar de `==`
-  Se requieren llaves para todos los bloques de flujo de control
-  CamelCase para variables y funciones, PascalCase para tipos y clases
-  Los ID de las reglas siguen el patrón `<lang>-<descriptive-kebab-name>` (p. ej., `js-empty-catch`, `py-bare-except`)

Al contribuir, acepta que sus contribuciones estarán licenciadas bajo la [Licencia MIT](../../LICENSE).
