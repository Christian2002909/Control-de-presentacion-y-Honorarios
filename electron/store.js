const Store = require('electron-store');

const defaultConfig = {
  tema: 'sistema',
  colorPrograma: 'normal',
  varianteLila: 'lila',
  posicionPanel: 'izquierda',
  fondo: { tipo: 'color', valor: '' },
  email: { direccion: '', appPassword: '', smtpHost: 'smtp.gmail.com', smtpPort: 465 },
  iniciarConWindows: false,
  googleCalendar: { clientId: '', clientSecret: '', tokens: null, activo: false },
  icloudReminders: { appleId: '', appPassword: '', activo: false }
};

const store = new Store({
  name: 'agenda-personal-data',
  defaults: {
    tareas: [],
    config: defaultConfig,
    ultimosAvisos: {}
  }
});

function getTareas() {
  return store.get('tareas', []);
}

function saveTarea(tarea) {
  const tareas = getTareas();
  const idx = tareas.findIndex((t) => t.id === tarea.id);
  if (idx >= 0) {
    tareas[idx] = tarea;
  } else {
    tareas.push(tarea);
  }
  store.set('tareas', tareas);
  return tareas;
}

function deleteTarea(id) {
  const tareas = getTareas().filter((t) => t.id !== id);
  store.set('tareas', tareas);
  return tareas;
}

function getConfig() {
  return { ...defaultConfig, ...store.get('config', defaultConfig) };
}

function saveConfig(config) {
  store.set('config', { ...getConfig(), ...config });
  return getConfig();
}

function getUltimosAvisos() {
  return store.get('ultimosAvisos', {});
}

function marcarAvisoDisparado(clave) {
  const avisos = getUltimosAvisos();
  avisos[clave] = Date.now();
  store.set('ultimosAvisos', avisos);
}

module.exports = {
  getTareas,
  saveTarea,
  deleteTarea,
  getConfig,
  saveConfig,
  getUltimosAvisos,
  marcarAvisoDisparado
};
