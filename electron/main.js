const { app, BrowserWindow, Tray, Menu, Notification, ipcMain, nativeTheme, dialog } = require('electron');
const path = require('path');
const nodemailer = require('nodemailer');

const store = require('./store');
const { calcularAvisosPendientes } = require('./scheduler');
const googleSync = require('./google-sync');
const icloudSync = require('./icloud-sync');

let mainWindow = null;
let tray = null;
let saliendo = false;

function crearVentana() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 720,
    minHeight: 520,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

  mainWindow.on('close', (evento) => {
    if (!saliendo) {
      evento.preventDefault();
      mainWindow.hide();
    }
  });
}

function crearBandeja() {
  tray = new Tray(path.join(__dirname, '..', 'assets', 'icon.png'));
  const menu = Menu.buildFromTemplate([
    { label: 'Abrir Agenda Personal', click: () => mainWindow && mainWindow.show() },
    { label: 'Salir', click: () => { saliendo = true; app.quit(); } }
  ]);
  tray.setToolTip('Agenda Personal');
  tray.setContextMenu(menu);
  tray.on('click', () => mainWindow && mainWindow.show());
}

function enviarEmail(config, tarea, dias) {
  if (!config.email.direccion || !config.email.appPassword) return Promise.resolve();
  const transporte = nodemailer.createTransport({
    host: config.email.smtpHost,
    port: config.email.smtpPort,
    secure: config.email.smtpPort === 465,
    auth: { user: config.email.direccion, pass: config.email.appPassword }
  });
  const asunto = dias > 0
    ? `Recordatorio: "${tarea.titulo}" vence en ${dias} dia(s)`
    : `Recordatorio: "${tarea.titulo}" vence hoy`;
  return transporte.sendMail({
    from: config.email.direccion,
    to: config.email.direccion,
    subject: asunto,
    text: `${tarea.titulo}\nFecha limite: ${tarea.fechaLimite}\n\n${tarea.notas || ''}`
  });
}

function dispararAviso(aviso) {
  const config = store.getConfig();
  const { tarea, dias } = aviso;
  const texto = dias > 0 ? `Vence en ${dias} dia(s): ${tarea.fechaLimite}` : `Vence hoy (${tarea.fechaLimite})`;

  if (Notification.isSupported()) {
    new Notification({ title: tarea.titulo, body: texto }).show();
  }

  enviarEmail(config, tarea, dias).catch((err) => console.error('Error enviando email:', err.message));
  store.marcarAvisoDisparado(aviso.clave);
}

function iniciarScheduler() {
  setInterval(() => {
    const tareas = store.getTareas();
    const ultimosAvisos = store.getUltimosAvisos();
    const pendientes = calcularAvisosPendientes(tareas, ultimosAvisos);
    pendientes.forEach(dispararAviso);
  }, 30 * 1000);
}

function registrarIpc() {
  ipcMain.handle('tareas:listar', () => store.getTareas());
  ipcMain.handle('tareas:guardar', async (evento, tarea) => {
    const tareas = store.saveTarea(tarea);
    const config = store.getConfig();
    if (config.googleCalendar.activo) {
      googleSync.crearOActualizarEvento(config, tarea).catch((err) => console.error('Google sync:', err.message));
    }
    if (config.icloudReminders.activo) {
      icloudSync.sincronizarTarea(config, tarea).catch((err) => console.error('iCloud sync:', err.message));
    }
    return tareas;
  });
  ipcMain.handle('tareas:eliminar', (evento, id) => store.deleteTarea(id));

  ipcMain.handle('config:obtener', () => store.getConfig());
  ipcMain.handle('config:guardar', (evento, config) => {
    const guardada = store.saveConfig(config);
    app.setLoginItemSettings({ openAtLogin: !!guardada.iniciarConWindows });
    return guardada;
  });

  ipcMain.handle('config:tema-sistema', () => (nativeTheme.shouldUseDarkColors ? 'oscuro' : 'claro'));

  ipcMain.handle('dialogo:elegir-imagen', async () => {
    const resultado = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Imagenes', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]
    });
    if (resultado.canceled || !resultado.filePaths.length) return null;
    return resultado.filePaths[0];
  });

  ipcMain.handle('google:autenticar', async () => {
    const config = store.getConfig();
    const tokens = await googleSync.autenticar(config);
    config.googleCalendar.tokens = tokens;
    config.googleCalendar.activo = true;
    return store.saveConfig(config);
  });
}

app.whenReady().then(() => {
  crearVentana();
  crearBandeja();
  registrarIpc();
  iniciarScheduler();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) crearVentana();
  });
});

app.on('before-quit', () => { saliendo = true; });

app.on('window-all-closed', () => {
  // La app vive en la bandeja del sistema; no se cierra al cerrar la ventana.
});
