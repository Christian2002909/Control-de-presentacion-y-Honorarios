const { google } = require('googleapis');
const { shell } = require('electron');
const http = require('http');

const REDIRECT_URI = 'http://127.0.0.1:53682/oauth2callback';

function crearCliente(config) {
  const { clientId, clientSecret, tokens } = config.googleCalendar;
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
  if (tokens) oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

// Solo puede haber un servidor de callback OAuth escuchando a la vez.
let servidorActivo = null;

function cerrarServidorActivo() {
  return new Promise((resolve) => {
    if (servidorActivo) {
      servidorActivo.close(() => resolve());
      servidorActivo = null;
    } else {
      resolve();
    }
  });
}

// Abre el navegador para el consentimiento OAuth y devuelve los tokens obtenidos.
async function autenticar(config) {
  // Si quedó un intento anterior sin terminar (pestaña cerrada, doble clic, etc.),
  // lo cerramos primero para no chocar contra el mismo puerto (EADDRINUSE).
  await cerrarServidorActivo();

  return new Promise((resolve, reject) => {
    const oAuth2Client = crearCliente(config);
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // fuerza obtener un refresh_token para no volver a pedir permiso
      scope: ['https://www.googleapis.com/auth/calendar.events']
    });

    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, REDIRECT_URI);
        const code = url.searchParams.get('code');
        if (!code) return;
        res.end('Autenticacion completa. Ya puedes cerrar esta pestana y volver a la app.');
        server.close();
        servidorActivo = null;
        const { tokens } = await oAuth2Client.getToken(code);
        resolve(tokens);
      } catch (err) {
        res.end('Error de autenticacion: ' + err.message);
        server.close();
        servidorActivo = null;
        reject(err);
      }
    });

    // Si el puerto ya está ocupado por algo externo, no debe tumbar la app:
    // se rechaza la promesa con un mensaje claro en vez de lanzar una excepción sin capturar.
    server.on('error', (err) => {
      servidorActivo = null;
      if (err.code === 'EADDRINUSE') {
        reject(new Error('El puerto 53682 ya está en uso por otro programa. Cierra otras copias de Agenda Personal e inténtalo de nuevo.'));
      } else {
        reject(err);
      }
    });

    servidorActivo = server;
    server.listen(53682, () => {
      shell.openExternal(authUrl);
    });
  });
}

async function crearOActualizarEvento(config, tarea) {
  if (!config.googleCalendar.activo || !config.googleCalendar.tokens) return null;
  const auth = crearCliente(config);
  const calendar = google.calendar({ version: 'v3', auth });

  const evento = {
    summary: tarea.titulo,
    description: tarea.notas || '',
    start: { date: tarea.fechaLimite },
    end: { date: tarea.fechaLimite },
    reminders: {
      useDefault: false,
      overrides: (tarea.avisosPrevios || []).map((d) => ({ method: 'popup', minutes: d * 24 * 60 }))
    }
  };

  if (tarea.googleEventId) {
    const actualizado = await calendar.events.update({ calendarId: 'primary', eventId: tarea.googleEventId, requestBody: evento });
    return actualizado.data.id;
  }
  const creado = await calendar.events.insert({ calendarId: 'primary', requestBody: evento });
  return creado.data.id;
}

module.exports = { autenticar, crearOActualizarEvento };
