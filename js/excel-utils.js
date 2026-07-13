// js/excel-utils.js
// -----------------------------------------------------------------------
// Funciones puras/compartidas para importar y exportar archivos .xlsx con
// la librería `xlsx` (SheetJS, community edition). Las usan js/clientes.js
// (importar/exportar Clientes) y js/honorarios.js (importar cuotas/pagos,
// exportar Honorarios).
//
// Igual que js/calendario-logica.js, este archivo NUNCA se carga como
// <script> en index.html -- solo se importa con require() desde las
// pantallas que lo necesitan, así que no hace falta envolverlo en un
// (function () { ... })() (el sistema de módulos de Node ya le da un
// alcance propio a sus variables de nivel superior).
//
// No hay IPC ni cambios en main.js: leer un archivo se hace con
// FileReader sobre un <input type="file"> (proceso de renderer, permitido
// por nodeIntegration: true), y descargar un archivo se hace armando un
// Blob + <a download> temporal, dejando que Chromium/el SO manejen el
// diálogo de guardado -- mismo espíritu que la ficha de pago en PDF de
// js/honorarios.js (generarFichaPago -> window.print()).
// -----------------------------------------------------------------------

const XLSX = require('xlsx');

// Lee un archivo .xlsx (el File que entrega un <input type="file">) y
// devuelve una Promise que resuelve a un array de objetos, uno por fila,
// usando la primera fila de la primera hoja como encabezados (columnas).
// `defval: ''` hace que una celda vacía quede como string vacío en vez de
// no aparecer en el objeto (más simple de validar fila por fila).
function leerFilasDeArchivoExcel(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = (evento) => {
      try {
        const datos = new Uint8Array(evento.target.result);
        // cellDates: true -- las celdas con formato de fecha de Excel
        // llegan como objetos Date de JS en vez de números de serie,
        // necesario para la columna "Fecha de Pago" del importador de
        // Historial de Pagos.
        const libro = XLSX.read(datos, { type: 'array', cellDates: true });
        const primeraHoja = libro.Sheets[libro.SheetNames[0]];
        const filas = XLSX.utils.sheet_to_json(primeraHoja, { defval: '' });
        resolve(filas);
      } catch (error) {
        reject(error);
      }
    };
    lector.onerror = () => reject(lector.error || new Error('No se pudo leer el archivo.'));
    lector.readAsArrayBuffer(archivo);
  });
}

// Arma un workbook .xlsx con una o varias hojas y dispara la descarga
// (Blob + <a download> temporal, sin tocar el proceso principal de
// Electron). `hojas` es un array de { nombre, filas } -- filas es un
// array de objetos planos (una fila por objeto, las claves son las
// columnas), mismo formato que arma XLSX.utils.json_to_sheet.
function descargarComoExcel(nombreArchivo, hojas) {
  const libro = XLSX.utils.book_new();

  for (const { nombre, filas } of hojas) {
    const hoja = XLSX.utils.json_to_sheet(filas);
    // Excel no acepta nombres de hoja de más de 31 caracteres.
    XLSX.utils.book_append_sheet(libro, hoja, nombre.slice(0, 31));
  }

  const buffer = XLSX.write(libro, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

// Normaliza el valor de una celda "Sí"/"No" a booleano. Acepta variantes
// razonables (con/sin tilde, mayúsculas, "true"/"1"/"x"); cualquier otra
// cosa (incluida una celda vacía) se interpreta como "No", tal como pide
// el pedido ("Sí"/"No", o vacío = No).
function celdaEsAfirmativa(valor) {
  if (valor === null || valor === undefined) return false;
  const texto = String(valor).trim().toLowerCase();
  return texto === 'sí' || texto === 'si' || texto === 'true' || texto === '1' || texto === 'x';
}

// Texto de una celda, recortado; null/undefined se devuelve como string
// vacío para no tener que repetir el chequeo en cada validación de fila.
function celdaTexto(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

// Número de una celda, o null si está vacía / no es un número válido (en
// vez de NaN, que complica los "if" de validación en cada importador).
function celdaNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

module.exports = {
  leerFilasDeArchivoExcel,
  descargarComoExcel,
  celdaEsAfirmativa,
  celdaTexto,
  celdaNumero,
};
