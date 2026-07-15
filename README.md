# Agenda Personal

Aplicación de escritorio (Windows) para gestionar tus tareas y recordatorios personales.
No requiere usuario ni inicio de sesión: todo se guarda localmente en tu equipo.

## Características

- **Tareas pendientes** con:
  - Fecha límite ("último día").
  - Aviso configurable **N días antes** (puedes agregar varios: 1, 3, 7...).
  - **Varios horarios de aviso** para una misma tarea (ej. 09:00 y 18:30).
  - Notas.
- **Avisos** por:
  - Notificación nativa de Windows.
  - Correo electrónico (opcional, configurable).
- **Apariencia**:
  - Tema **Claro / Oscuro / Sistema**.
  - Color del programa: **Normal, Verde, Coral, Naranja, Turquesa, Lila**.
    - Al elegir **Lila** aparecen sus variantes: **Lila, Lavanda, Tulipanes**.
  - **Panel reubicable**: arriba, abajo, izquierda o derecha.
  - **Fondo personalizable**: color sólido o imagen.
  - Diseño **Liquid Glass** con reflejos de luz en movimiento (no estático).
- **Ejecución en segundo plano**: vive en la bandeja del sistema y puede **iniciar con Windows**, para que los recordatorios se disparen aunque la ventana esté cerrada.
- **Sincronización opcional** de cada tarea con **Google Calendar** y **Apple Reminders (iCloud)**.
- Interfaz completamente en **español**.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior.

## Cómo ejecutar (modo desarrollo)

```bash
npm install
npm start
```

> Nota: `npm install` descarga el binario de Electron desde internet. Si estás en
> una red que bloquea esa descarga, puedes usar un mirror:
> `ELECTRON_MIRROR="https://registry.npmmirror.com/-/binary/electron/" npm install`

## Cómo generar el instalador `.exe` (Windows)

En una PC con Windows:

```bash
npm install
npm run build:win
```

El instalador quedará en la carpeta `dist/`.

## Configuración de avisos por correo

En **Configuración → Avisos por correo**:

1. Escribe tu correo.
2. En "Contraseña de aplicación" pega una **contraseña de aplicación** (no tu
   contraseña normal). Para Gmail se genera en la configuración de seguridad de
   tu cuenta de Google (requiere verificación en dos pasos).
3. Servidor SMTP por defecto: `smtp.gmail.com`, puerto `465`.

Los avisos se enviarán a tu propio correo.

## Sincronización opcional

Ambas integraciones son **opcionales**. Si no cargas credenciales, la app funciona
igual con notificaciones locales y correo.

### Google Calendar

1. Crea unas credenciales OAuth (tipo "Aplicación de escritorio") en
   [Google Cloud Console](https://console.cloud.google.com/) y habilita la API de
   Google Calendar.
2. Pega el **Client ID** y **Client Secret** en Configuración.
3. Pulsa **Conectar con Google** y autoriza en el navegador.

Cada tarea creará/actualizará un evento en tu calendario principal.

### Apple Reminders (iCloud)

Apple no ofrece API para Windows; se usa el protocolo estándar **CalDAV**:

1. Genera una **contraseña de aplicación** en
   [appleid.apple.com](https://appleid.apple.com/) (requiere verificación en dos pasos).
2. En Configuración escribe tu **Apple ID** y esa contraseña de aplicación.
3. Activa la sincronización con iCloud.

Cada tarea creará un recordatorio (VTODO) en tu lista de Recordatorios de iCloud.

## Estructura del proyecto

```
electron/       Proceso principal de Electron (ventana, bandeja, avisos, sync)
  main.js
  preload.js
  store.js        Persistencia local (electron-store)
  scheduler.js    Lógica de cuándo disparar cada aviso
  google-sync.js  Integración con Google Calendar
  icloud-sync.js  Integración con Apple Reminders vía CalDAV
src/            Interfaz (renderer)
  index.html
  app.js
  store.js
  styles/         base, themes (temas y colores), liquid-glass (animado)
```
