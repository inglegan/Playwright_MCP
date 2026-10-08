# Automatizacion con Playwright

Suite E2E para [Automation Exercise](https://www.automationexercise.com/). Incluye registro, login, validaciones negativas, categorias de productos, carrito y checkout usando Playwright Test y Page Object Model (POM).

## Requisitos

- Node.js 20 o superior y npm.
- Git para clonar el repositorio.
- Conexion a Internet: las pruebas interactuan con el sitio publico y sus resultados dependen de su disponibilidad.
- Para Jenkins: Docker con contenedores Linux, un agente Linux/Docker y los plugins Pipeline, Docker Pipeline y JUnit.

La configuracion activa Chromium y Firefox. WebKit esta deshabilitado. La ejecucion usa un worker para reducir interferencias con el sitio externo.

## Instalacion local

1. Clona el repositorio y entra en la carpeta del proyecto:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd mcp_playwright_project
   ```

2. Instala las dependencias bloqueadas por `package-lock.json`:

   ```bash
   npm ci
   ```

3. Instala los navegadores configurados:

   ```bash
   npx playwright install chromium firefox
   ```

   En Linux, si faltan bibliotecas del sistema, usa:

   ```bash
   npx playwright install --with-deps chromium firefox
   ```

## Ejecutar las pruebas

Para ejecutar todas las pruebas en Chromium y Firefox:

```bash
npx playwright test
```

El proyecto contiene 17 casos; el comando completo los ejecuta en los dos navegadores configurados.

### Comandos por flujo

Todos los siguientes scripts seleccionan Chromium:

| Comando | Cobertura |
| --- | --- |
| `npm run test:register` | Todos los casos de registro y compra de `register-user.spec.js` |
| `npm run test:register:classic` | Registro exitoso clasico |
| `npm run test:register:gherkin` | Escenarios Gherkin de registro, incluidos casos negativos |
| `npm run test:register:invalid-email` | Validacion de email invalido |
| `npm run test:login` | Login exitoso, correo inexistente y contrasena incorrecta |
| `npm run test:login:success` | Login exitoso |
| `npm run test:login:unregistered` | Rechazo de correo no registrado |
| `npm run test:login:wrong-password` | Rechazo de contrasena incorrecta |
| `npm run test:pom` | Los nueve casos ordenados con POM |

Se puede limitar Playwright a una prueba por su nombre, por ejemplo:

```bash
npx playwright test tests/login-user.spec.js --project=chromium --grep "correo no registrado"
```

### Reportes

La ejecucion normal genera el reporte HTML:

```bash
npx playwright show-report
```

El comando usado por CI genera reporte HTML y JUnit. Para guardar el archivo JUnit desde PowerShell:

```powershell
$env:PLAYWRIGHT_JUNIT_OUTPUT_FILE = "results.xml"
npm run test:ci
```

En Bash o Linux:

```bash
PLAYWRIGHT_JUNIT_OUTPUT_FILE=results.xml npm run test:ci
```

Los reportes se generan localmente y estan excluidos de Git por `.gitignore`.

### Reporte Allure

Allure muestra el total de pruebas, nombre de cada caso, estado, duracion, reintentos y navegador/proyecto (`chromium` o `firefox`). Su dashboard incluye graficas de resultados y duracion para la ejecucion actual. El pipeline limpia los datos previos, por lo que no conserva tendencias historicas entre builds.

Para ejecutar las pruebas y generar un reporte nuevo desde PowerShell, CMD, Bash o Linux:

```bash
npm run test:allure
```

El comando elimina los resultados Allure anteriores para evitar mezclar ejecuciones, ejecuta `test:ci` y genera `allure-report/`, incluso si Playwright informa fallos. El codigo de salida conserva el resultado de las pruebas para que CI marque correctamente el build.

Para generar el HTML manualmente despues de ejecutar pruebas que producen `allure-results/`:

```bash
npm run report:allure
```

Para abrir el dashboard local:

```bash
npm run open:allure
```

En Jenkins, el pipeline ejecuta `test:allure` y publica `allure-report/`, `allure-results/`, `playwright-report/`, `test-results/` y `results.xml` como artefactos del build.

## Jenkins local

El `Jenkinsfile` de la raiz usa la imagen oficial `mcr.microsoft.com/playwright:v1.63.0-noble`, instala dependencias con `npm ci`, ejecuta `npm run test:ci` y publica JUnit y los artefactos HTML/resultados.

1. Sube el proyecto a un repositorio Git accesible por Jenkins. Incluye `Jenkinsfile`, `package.json` y `package-lock.json`; no subas `node_modules`, resultados, reportes ni archivos `.env`.
2. Confirma que Docker este instalado y que el servicio/usuario de Jenkins tenga permiso para ejecutar contenedores Linux.
3. Instala los plugins Jenkins Pipeline, Docker Pipeline y JUnit.
4. Crea un job de tipo **Pipeline** y selecciona **Pipeline script from SCM**.
5. Configura Git, URL del repositorio y rama. Deja `Jenkinsfile` como ruta del script.
6. Guarda y ejecuta **Build Now**.
7. Consulta el resultado JUnit en la pagina del build y descarga el reporte HTML o los resultados desde **Artifacts**.

El pipeline serializa builds concurrentes, aplica un limite de 60 minutos y conserva los ultimos 10 builds y 5 conjuntos de artefactos. Jenkins establece `CI=true`, usa un worker y permite dos reintentos.

## Estructura

```text
fixtures/
  test.js          Fixtures compartidas de Playwright
  testData.js      Datos de prueba y generacion de email
pages/
  homePage.js      Navegacion principal
  loginPage.js     Registro, login y formulario de cuenta
  productsPage.js  Categorias y agregado de productos
  cartPage.js      Carrito y checkout
tests/
  register-user.spec.js
  login-user.spec.js
  automation-exercise-pom.spec.js
playwright.config.js
Jenkinsfile
scripts/
  run-allure.cjs  Ejecucion y generacion del reporte Allure
```

## Consideraciones

- Las pruebas crean cuentas y agregan productos en un sitio publico externo. El sitio puede estar temporalmente lento o no disponible; algunos tests pueden reintentarse.
- Los datos son sinteticos y la contrasena compartida del fixture es solo para estas cuentas de prueba. No la reutilices para una cuenta real.
- El sitio no siempre elimina las cuentas creadas por la suite, por lo que las ejecuciones repetidas pueden dejar usuarios de prueba registrados.
- No hay un servidor de aplicacion que levantar: Playwright navega directamente al sitio externo.