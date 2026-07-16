# Guía: generar el `.exe` y configurar las notificaciones

## Parte 1 — Generar el instalador `.exe` (Windows)

Esto se hace **en tu PC con Windows** (no en la nube).

### Requisitos
- **Node.js 18 o superior** instalado (https://nodejs.org).

### Pasos
1. Abre una terminal (PowerShell) dentro de la carpeta del proyecto:
   ```
   cd C:\Users\Usuario\agenda_personal
   ```
2. Asegúrate de tener el código más reciente:
   ```
   git fetch origin claude/ecc-skill-install-4v2vz0
   git reset --hard origin/claude/ecc-skill-install-4v2vz0
   ```
3. Instala dependencias (si no lo hiciste antes):
   ```
   npm install
   ```
4. Genera el instalador:
   ```
   npm run build:win
   ```
5. Cuando termine, el instalador queda en la carpeta:
   ```
   C:\Users\Usuario\agenda_personal\dist\
   ```
   Busca un archivo tipo **`Agenda Personal Setup 1.0.0.exe`**. Ese es tu instalador:
   haz doble clic para instalar la app en tu PC (o pásalo a otra PC con Windows).

### Notas
- La primera vez, `build:win` descarga unas herramientas; puede tardar unos minutos.
- Las fotos de fondo (lavanda / tulipanes) y el icono ya vienen incluidos dentro del `.exe`.
- Si aparece un aviso de Windows SmartScreen al instalar (porque la app no está
  firmada digitalmente), pulsa "Más información" → "Ejecutar de todas formas". Es
  normal en apps propias sin certificado de firma.

---

## Parte 2 — Configurar las notificaciones

La app avisa de dos formas: **notificación de Windows** y **correo electrónico** (opcional).

### Cómo funcionan los recordatorios
Para cada tarea defines:
- **Fecha límite** ("último día").
- **Avisarme (días antes)**: cuántos días antes del último día quieres el aviso.
  Puedes poner varios (ej. `7`, `3`, `1`, `0`). `0` = el mismo día.
- **Horarios del aviso**: una o varias horas del día (ej. `09:00` y `18:30`).

La app revisa la hora **cada 30 segundos**; cuando coincide un día×horario, dispara
el aviso. Un mismo aviso no se repite.

### A) Notificación de Windows

Para que aparezcan, revisa esto **una sola vez**:

1. **La app debe estar corriendo.** Puede estar en la ventana o minimizada en la
   bandeja del sistema (junto al reloj). Si la cierras del todo, no avisa.
2. **Que inicie con Windows** (recomendado): en la app → **Configuración** →
   marca **"Iniciar Agenda Personal con Windows"** → **Guardar**. Así siempre está
   lista para avisarte.
3. **Permitir notificaciones en Windows:**
   - Windows → **Configuración** → **Sistema** → **Notificaciones**.
   - Verifica que las notificaciones estén **activadas** en general.
   - Busca **"Agenda Personal"** en la lista y actívala (aparece después del
     primer aviso).
4. **Desactiva "No molestar" / "Asistente de concentración":**
   - Windows → Configuración → Sistema → **Asistente de concentración** (o
     "No molestar") → ponlo en **Desactivado**, o las notificaciones se silencian.

### B) Aviso por correo electrónico (opcional)

En la app → **Configuración** → sección **"Avisos por correo"**:

1. **Correo electrónico**: tu dirección (ej. `tucorreo@gmail.com`). Los avisos te
   llegan a ti mismo.
2. **Contraseña de aplicación**: **NO es tu contraseña normal**. Es una clave
   especial que genera tu proveedor:
   - **Gmail**: activa la **verificación en 2 pasos** en tu cuenta de Google, luego
     ve a https://myaccount.google.com/apppasswords y genera una "contraseña de
     aplicación". Pega esos 16 caracteres aquí.
   - **Outlook/Hotmail**: similar, genera una contraseña de aplicación en la
     seguridad de tu cuenta Microsoft.
3. **Servidor SMTP** y **Puerto**: por defecto `smtp.gmail.com` y `465` (Gmail).
   - Outlook: `smtp.office365.com`, puerto `587`.
4. Pulsa **Guardar**.

### Prueba rápida (para no esperar días)
1. Crea una tarea nueva.
2. Fecha límite = **hoy**.
3. En "Avisarme (días antes)" agrega **`0`**.
4. En "Horarios" agrega una hora **1 o 2 minutos en el futuro** (mira tu reloj).
5. Guarda y espera. Debe saltar la notificación de Windows (y el correo si lo
   configuraste).

### Si no aparece la notificación — revisa:
- [ ] ¿La app está abierta o en la bandeja del sistema?
- [ ] ¿Las notificaciones de Windows están activadas para la app?
- [ ] ¿"Asistente de concentración / No molestar" está desactivado?
- [ ] ¿La hora del aviso ya pasó y la fecha/días son correctos?
- [ ] Para el correo: ¿usaste una **contraseña de aplicación** (no la normal) y el
      SMTP/puerto correctos? Usa el botón **"Probar correo"** para ver el error exacto.

> **Tip:** en Configuración → Avisos por correo hay dos botones: **"Probar correo"**
> y **"Probar notificación"**. Úsalos para verificar al instante que cada cosa funciona.

---

## Parte 3 — Sincronizar con Google Calendar y Apple Recordatorios

Las dos son **opcionales** e independientes. Puedes activar una, la otra, o ambas.
Una vez configuradas, **cada tarea que crees se guarda sola** en el calendario/
recordatorio, sin que tengas que confirmar nada más en tu dispositivo.

Aclaración importante:
- El **correo** usa una **contraseña de aplicación** (la que ya creaste en Google). Eso
  es SOLO para el correo.
- El **calendario de Google** NO usa contraseña de aplicación: usa unas credenciales
  llamadas **OAuth (Client ID / Client Secret)**. Es gratis y se hace una sola vez.

### A) Google Calendar (una sola vez)

1. Entra a **Google Cloud Console**: https://console.cloud.google.com/
2. Arriba, crea un **proyecto nuevo** (nombre cualquiera, ej. "Agenda Personal").
3. En el buscador escribe **"Google Calendar API"** → ábrela → pulsa **Habilitar**.
4. Menú → **APIs y servicios** → **Pantalla de consentimiento de OAuth**:
   - Tipo de usuario: **Externo** → Crear.
   - Pon un nombre de app y tu correo donde lo pida.
   - En **Usuarios de prueba**, agrega **tu propio correo de Gmail**. (Importante, si no
     no te dejará autorizar.)
   - Guarda.
5. Menú → **APIs y servicios** → **Credenciales** → **Crear credenciales** →
   **ID de cliente de OAuth**:
   - Tipo de aplicación: **Aplicación de escritorio**.
   - Crear. Se mostrará un **Client ID** y un **Client Secret** → cópialos.
6. En la app → **Configuración** → **Sincronización con Google Calendar**:
   - Pega el **Client ID** y el **Client Secret**.
   - Pulsa **"Conectar con Google"** → se abre el navegador → inicia sesión y **Permitir**.
     (Si sale un aviso de "app no verificada", pulsa "Continuar" → es tu propia app.)
   - Cuando diga **"Conectado"**, listo.
7. A partir de ahí, **cada tarea nueva crea un evento** en tu Google Calendar
   automáticamente, sin volver a pedir permiso.

### B) Apple Recordatorios / iCloud (una sola vez)

Apple no tiene API en Windows, pero funciona con el protocolo estándar CalDAV:

1. Entra a **https://appleid.apple.com/** e inicia sesión.
2. Asegúrate de tener activada la **verificación en dos pasos** (autenticación de dos
   factores). Es obligatorio para el siguiente paso.
3. Busca **"Contraseñas de aplicaciones"** → **Generar una contraseña específica**
   (ponle un nombre, ej. "Agenda") → te dará una clave tipo `abcd-efgh-ijkl-mnop`.
4. En la app → **Configuración** → **Sincronización con Apple Reminders / iCloud**:
   - **Apple ID**: tu correo de iCloud/Apple.
   - **Contraseña de aplicación**: la clave que acabas de generar.
   - Marca **"Activar sincronización con iCloud"**.
   - Pulsa **Guardar configuración**.
5. A partir de ahí, **cada tarea nueva crea un recordatorio** en tu app Recordatorios
   de iCloud (visible en iPhone, Mac, etc.), automáticamente.

### Si la sincronización falla
La app ahora te muestra un **aviso con el error** cuando no logra sincronizar una
tarea. Errores comunes:
- **Google**: "invalid_client" → Client ID/Secret mal copiados. "access_denied" →
  falta agregar tu correo como usuario de prueba en la pantalla de consentimiento.
- **iCloud**: error de autenticación → revisa el Apple ID y usa la **contraseña de
  aplicación** (no tu contraseña normal), con la verificación en dos pasos activada.
