const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('agenda', {
  listarTareas: () => ipcRenderer.invoke('tareas:listar'),
  guardarTarea: (tarea) => ipcRenderer.invoke('tareas:guardar', tarea),
  eliminarTarea: (id) => ipcRenderer.invoke('tareas:eliminar', id),

  obtenerConfig: () => ipcRenderer.invoke('config:obtener'),
  guardarConfig: (config) => ipcRenderer.invoke('config:guardar', config),
  temaSistema: () => ipcRenderer.invoke('config:tema-sistema'),

  elegirImagenFondo: () => ipcRenderer.invoke('dialogo:elegir-imagen'),

  autenticarGoogle: () => ipcRenderer.invoke('google:autenticar')
});
