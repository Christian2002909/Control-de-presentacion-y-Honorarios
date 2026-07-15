const { DAVClient } = require('tsdav');

function crearCliente(config) {
  const { appleId, appPassword } = config.icloudReminders;
  return new DAVClient({
    serverUrl: 'https://caldav.icloud.com',
    credentials: { username: appleId, password: appPassword },
    authMethod: 'Basic',
    defaultAccountType: 'caldav'
  });
}

function tareaAVTodo(tarea) {
  const fecha = tarea.fechaLimite.replace(/-/g, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VTODO',
    `UID:${tarea.id}@agenda-personal`,
    `SUMMARY:${tarea.titulo}`,
    `DUE;VALUE=DATE:${fecha}`,
    `DESCRIPTION:${(tarea.notas || '').replace(/\n/g, '\\n')}`,
    `STATUS:${tarea.completada ? 'COMPLETED' : 'NEEDS-ACTION'}`,
    'END:VTODO',
    'END:VCALENDAR'
  ].join('\r\n');
}

async function sincronizarTarea(config, tarea) {
  if (!config.icloudReminders.activo || !config.icloudReminders.appleId) return null;
  const client = crearCliente(config);
  await client.login();
  const calendars = await client.fetchCalendars();
  const listaRecordatorios = calendars.find((c) => c.components && c.components.includes('VTODO')) || calendars[0];
  if (!listaRecordatorios) throw new Error('No se encontro una lista de Recordatorios en iCloud');

  return client.createCalendarObject({
    calendar: listaRecordatorios,
    filename: `${tarea.id}.ics`,
    iCalString: tareaAVTodo(tarea)
  });
}

module.exports = { sincronizarTarea };
