let tareas = [];
let config = null;
let diasAvisoTemp = [];
let horariosTemp = [];

function generarId() {
  return (crypto.randomUUID && crypto.randomUUID()) || `t-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function diasRestantes(fechaLimite) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(`${fechaLimite}T00:00:00`);
  return Math.round((limite - hoy) / (1000 * 60 * 60 * 24));
}

// ---------- Tema / color / panel / fondo ----------

async function aplicarTema() {
  let tema = config.tema;
  if (tema === 'sistema') {
    tema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  }
  document.documentElement.setAttribute('data-tema', tema);
}

function colorAplicado() {
  // Lavanda y Tulipanes solo existen como variantes de Lila.
  if (config.colorPrograma === 'lila') {
    return config.varianteLila || 'lila';
  }
  return config.colorPrograma;
}

function aplicarColor() {
  document.documentElement.setAttribute('data-color', colorAplicado());
}

function aplicarPosicionPanel() {
  document.getElementById('app').setAttribute('data-posicion', config.posicionPanel);
}

function aplicarFondo() {
  const body = document.body;
  if (config.fondo.tipo === 'imagen' && config.fondo.valor) {
    body.style.backgroundImage = `url("file://${config.fondo.valor.replace(/\\/g, '/')}")`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundColor = '';
  } else {
    body.style.backgroundImage = 'none';
    body.style.backgroundColor = config.fondo.valor || '';
  }
}

function aplicarConfigVisual() {
  aplicarTema();
  aplicarColor();
  aplicarPosicionPanel();
  aplicarFondo();
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (config && config.tema === 'sistema') aplicarTema();
});

// ---------- Navegación ----------

function cambiarVista(vista) {
  document.querySelectorAll('.vista').forEach((v) => v.setAttribute('hidden', ''));
  document.getElementById(`vista-${vista}`).removeAttribute('hidden');
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('activo', b.dataset.view === vista));
}

// ---------- Render de tareas ----------

function renderTareas() {
  const contenedor = document.getElementById('lista-tareas');
  contenedor.innerHTML = '';

  if (!tareas.length) {
    contenedor.innerHTML = '<p class="vacio">No tienes tareas pendientes. Crea una con "+ Nueva tarea".</p>';
    return;
  }

  const ordenadas = [...tareas].sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite));

  for (const tarea of ordenadas) {
    const restantes = diasRestantes(tarea.fechaLimite);
    const card = document.createElement('div');
    card.className = 'tarjeta-tarea glass' + (tarea.completada ? ' completada' : '');
    card.innerHTML = `
      <div class="tarjeta-cabecera">
        <h3>${escaparHtml(tarea.titulo)}</h3>
        <span class="badge ${restantes < 0 ? 'vencida' : restantes <= 1 ? 'urgente' : ''}">
          ${restantes < 0 ? 'Vencida' : restantes === 0 ? 'Hoy' : `${restantes} día(s)`}
        </span>
      </div>
      <p class="tarjeta-fecha">Último día: ${tarea.fechaLimite}</p>
      ${tarea.notas ? `<p class="tarjeta-notas">${escaparHtml(tarea.notas)}</p>` : ''}
      <div class="tarjeta-chips">
        ${(tarea.avisosPrevios || []).map((d) => `<span class="chip">${d}d antes</span>`).join('')}
        ${(tarea.horarios || []).map((h) => `<span class="chip">${h}</span>`).join('')}
      </div>
      <div class="tarjeta-acciones">
        <button class="btn-secundario btn-completar">${tarea.completada ? 'Reabrir' : 'Completar'}</button>
        <button class="btn-secundario btn-editar">Editar</button>
      </div>
    `;
    card.querySelector('.btn-editar').addEventListener('click', () => abrirModal(tarea));
    card.querySelector('.btn-completar').addEventListener('click', async () => {
      tarea.completada = !tarea.completada;
      tareas = await AgendaStore.guardarTarea(tarea);
      renderTareas();
    });
    contenedor.appendChild(card);
  }
}

function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// ---------- Modal de tarea ----------

function abrirModal(tarea) {
  const modal = document.getElementById('modal-tarea');
  document.getElementById('modal-titulo').textContent = tarea ? 'Editar tarea' : 'Nueva tarea';
  document.getElementById('tarea-id').value = tarea ? tarea.id : '';
  document.getElementById('tarea-titulo').value = tarea ? tarea.titulo : '';
  document.getElementById('tarea-fecha-limite').value = tarea ? tarea.fechaLimite : '';
  document.getElementById('tarea-notas').value = tarea ? tarea.notas || '' : '';
  document.getElementById('btn-eliminar-tarea').hidden = !tarea;

  diasAvisoTemp = tarea ? [...(tarea.avisosPrevios || [])] : [];
  horariosTemp = tarea ? [...(tarea.horarios || [])] : [];
  renderChipsDias();
  renderChipsHorarios();

  modal.hidden = false;
}

function cerrarModal() {
  document.getElementById('modal-tarea').hidden = true;
}

function renderChipsDias() {
  const cont = document.getElementById('lista-dias-aviso');
  cont.innerHTML = diasAvisoTemp
    .map((d, i) => `<span class="chip removible" data-idx="${i}">${d}d antes ✕</span>`)
    .join('');
  cont.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      diasAvisoTemp.splice(Number(chip.dataset.idx), 1);
      renderChipsDias();
    });
  });
}

function renderChipsHorarios() {
  const cont = document.getElementById('lista-horarios');
  cont.innerHTML = horariosTemp
    .map((h, i) => `<span class="chip removible" data-idx="${i}">${h} ✕</span>`)
    .join('');
  cont.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      horariosTemp.splice(Number(chip.dataset.idx), 1);
      renderChipsHorarios();
    });
  });
}

async function guardarTareaDesdeModal() {
  const titulo = document.getElementById('tarea-titulo').value.trim();
  const fechaLimite = document.getElementById('tarea-fecha-limite').value;
  if (!titulo || !fechaLimite) {
    alert('Completa al menos el título y la fecha límite.');
    return;
  }

  const idExistente = document.getElementById('tarea-id').value;
  const existente = tareas.find((t) => t.id === idExistente);

  const tarea = {
    id: idExistente || generarId(),
    titulo,
    fechaLimite,
    notas: document.getElementById('tarea-notas').value.trim(),
    avisosPrevios: [...diasAvisoTemp],
    horarios: [...horariosTemp],
    completada: existente ? existente.completada : false,
    creadaEn: existente ? existente.creadaEn : new Date().toISOString()
  };

  tareas = await AgendaStore.guardarTarea(tarea);
  cerrarModal();
  renderTareas();
}

// ---------- Configuración ----------

function actualizarVisibilidadVariante() {
  const esLila = document.getElementById('cfg-color').value === 'lila';
  document.getElementById('cfg-variante-lila-fila').hidden = !esLila;
}

function cargarFormularioConfig() {
  document.getElementById('cfg-tema').value = config.tema;
  document.getElementById('cfg-color').value = config.colorPrograma;
  document.getElementById('cfg-variante-lila').value = config.varianteLila || 'lila';
  actualizarVisibilidadVariante();
  document.getElementById('cfg-posicion').value = config.posicionPanel;
  document.getElementById('cfg-fondo-tipo').value = config.fondo.tipo;
  document.getElementById('cfg-fondo-color').value = config.fondo.tipo === 'color' && config.fondo.valor ? config.fondo.valor : '#ffffff';

  document.getElementById('cfg-email-direccion').value = config.email.direccion;
  document.getElementById('cfg-email-password').value = config.email.appPassword;
  document.getElementById('cfg-email-host').value = config.email.smtpHost;
  document.getElementById('cfg-email-puerto').value = config.email.smtpPort;

  document.getElementById('cfg-autostart').checked = !!config.iniciarConWindows;

  document.getElementById('cfg-google-clientid').value = config.googleCalendar.clientId;
  document.getElementById('cfg-google-clientsecret').value = config.googleCalendar.clientSecret;
  document.getElementById('google-estado').textContent = config.googleCalendar.tokens ? 'Conectado' : 'No conectado';

  document.getElementById('cfg-icloud-appleid').value = config.icloudReminders.appleId;
  document.getElementById('cfg-icloud-password').value = config.icloudReminders.appPassword;
  document.getElementById('cfg-icloud-activo').checked = !!config.icloudReminders.activo;
}

async function guardarConfigDesdeFormulario() {
  const nuevaConfig = {
    tema: document.getElementById('cfg-tema').value,
    colorPrograma: document.getElementById('cfg-color').value,
    varianteLila: document.getElementById('cfg-variante-lila').value,
    posicionPanel: document.getElementById('cfg-posicion').value,
    fondo: {
      tipo: document.getElementById('cfg-fondo-tipo').value,
      valor: document.getElementById('cfg-fondo-tipo').value === 'color'
        ? document.getElementById('cfg-fondo-color').value
        : config.fondo.valor
    },
    email: {
      direccion: document.getElementById('cfg-email-direccion').value.trim(),
      appPassword: document.getElementById('cfg-email-password').value,
      smtpHost: document.getElementById('cfg-email-host').value.trim() || 'smtp.gmail.com',
      smtpPort: Number(document.getElementById('cfg-email-puerto').value) || 465
    },
    iniciarConWindows: document.getElementById('cfg-autostart').checked,
    googleCalendar: {
      ...config.googleCalendar,
      clientId: document.getElementById('cfg-google-clientid').value.trim(),
      clientSecret: document.getElementById('cfg-google-clientsecret').value.trim()
    },
    icloudReminders: {
      appleId: document.getElementById('cfg-icloud-appleid').value.trim(),
      appPassword: document.getElementById('cfg-icloud-password').value,
      activo: document.getElementById('cfg-icloud-activo').checked
    }
  };

  config = await AgendaStore.guardarConfig(nuevaConfig);
  aplicarConfigVisual();
  alert('Configuración guardada.');
}

// ---------- Inicialización ----------

async function init() {
  config = await AgendaStore.obtenerConfig();
  tareas = await AgendaStore.listarTareas();

  aplicarConfigVisual();
  cargarFormularioConfig();
  renderTareas();

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => cambiarVista(btn.dataset.view));
  });
  cambiarVista('agenda');

  document.getElementById('btn-nueva-tarea').addEventListener('click', () => abrirModal(null));
  document.getElementById('btn-cancelar-tarea').addEventListener('click', cerrarModal);
  document.getElementById('btn-guardar-tarea').addEventListener('click', guardarTareaDesdeModal);
  document.getElementById('btn-eliminar-tarea').addEventListener('click', async () => {
    const id = document.getElementById('tarea-id').value;
    if (id && confirm('¿Eliminar esta tarea?')) {
      tareas = await AgendaStore.eliminarTarea(id);
      cerrarModal();
      renderTareas();
    }
  });

  document.getElementById('btn-agregar-dia').addEventListener('click', () => {
    const input = document.getElementById('nuevo-dia-aviso');
    const valor = Number(input.value);
    if (!Number.isNaN(valor) && valor >= 0 && !diasAvisoTemp.includes(valor)) {
      diasAvisoTemp.push(valor);
      renderChipsDias();
    }
    input.value = '';
  });

  document.getElementById('btn-agregar-horario').addEventListener('click', () => {
    const input = document.getElementById('nuevo-horario');
    if (input.value && !horariosTemp.includes(input.value)) {
      horariosTemp.push(input.value);
      renderChipsHorarios();
    }
    input.value = '';
  });

  document.getElementById('btn-elegir-imagen').addEventListener('click', async () => {
    const ruta = await AgendaStore.elegirImagenFondo();
    if (ruta) {
      config.fondo = { tipo: 'imagen', valor: ruta };
      document.getElementById('cfg-fondo-tipo').value = 'imagen';
      aplicarFondo();
    }
  });

  // Vista previa en vivo del fondo
  document.getElementById('cfg-fondo-color').addEventListener('input', (e) => {
    config.fondo = { tipo: 'color', valor: e.target.value };
    document.getElementById('cfg-fondo-tipo').value = 'color';
    aplicarFondo();
  });
  document.getElementById('cfg-fondo-tipo').addEventListener('change', (e) => {
    if (e.target.value === 'color') {
      config.fondo = { tipo: 'color', valor: document.getElementById('cfg-fondo-color').value };
    } else {
      config.fondo = { tipo: 'imagen', valor: config.fondo.valor };
    }
    aplicarFondo();
  });

  // Vista previa en vivo de tema y color
  document.getElementById('cfg-tema').addEventListener('change', (e) => {
    config.tema = e.target.value;
    aplicarTema();
  });
  document.getElementById('cfg-color').addEventListener('change', (e) => {
    config.colorPrograma = e.target.value;
    aplicarColor();
  });
  document.getElementById('cfg-variante-lila').addEventListener('change', (e) => {
    config.varianteLila = e.target.value;
    aplicarColor();
  });
  document.getElementById('cfg-posicion').addEventListener('change', (e) => {
    config.posicionPanel = e.target.value;
    aplicarPosicionPanel();
  });

  document.getElementById('cfg-color').addEventListener('change', actualizarVisibilidadVariante);

  document.getElementById('btn-guardar-config').addEventListener('click', guardarConfigDesdeFormulario);

  document.getElementById('btn-google-conectar').addEventListener('click', async () => {
    await guardarConfigDesdeFormulario();
    document.getElementById('google-estado').textContent = 'Conectando... revisa el navegador';
    try {
      config = await AgendaStore.autenticarGoogle();
      document.getElementById('google-estado').textContent = 'Conectado';
    } catch (err) {
      document.getElementById('google-estado').textContent = 'Error: ' + err.message;
    }
  });
}

init();
