# Pedidos pendientes

Este documento junta, en las palabras del usuario, todo lo que falta implementar. Se va completando ANTES de escribir código — cada pedido se anota acá tal cual se pidió, y recién cuando el usuario dice "arrancamos" se pasa a codificar. No borrar ítems de acá salvo que el usuario lo pida explícitamente; al implementar uno, marcarlo como hecho en vez de borrarlo.

## Pantalla de Login

- [ ] **Guardar la información / autocompletado**: que el navegador/Electron pueda recordar y autocompletar el email (y posiblemente la contraseña) al escribir en el login, para no tener que tipearlos cada vez. Hoy los campos del formulario de login no lo permiten.
- [ ] **"Olvidé mi contraseña"**: agregar un link/flujo de recuperación de contraseña en la pantalla de login (Supabase Auth ya lo soporta por mail, hoy la app no lo expone).

## Pantalla Presentaciones (y probablemente otras — ver bug de fondo)

- [ ] **[BUG] Cartel rojo "No se pudieron cargar las presentaciones" queda pegado aunque la tabla cargue bien.** Causa encontrada: cada pantalla intenta cargar datos apenas arranca la app, antes de terminar de loguearse (a propósito, así está documentado); ese primer intento falla porque todavía no hay sesión, y muestra el cartel de error — pero el código nunca lo vuelve a OCULTAR cuando la carga real después del login sale bien. Afecta al menos a Presentaciones (`presentaciones-mensaje`) y Calendario (`calendario-mensaje`); hay que revisar si también pasa en Historial/Honorarios/Configuración y corregir en todas: ocultar el mensaje de error apenas una carga se complete con éxito.
- [ ] **Sacar la columna "Fecha"** de la tabla de Presentaciones (fecha en que se marcó presentado) — no hace falta mostrarla ahí.

## Pantalla Clientes

- [ ] **Campo "Responsable" pasa de texto libre a lista desplegable**: en vez de tipear el nombre a mano (hoy `placeholder="Ej: Christian"`), mostrar un `<select>` con los nombres de la gente que ya tiene su usuario creado en el sistema (se lee de la tabla `perfiles`). Alcance confirmado por el usuario: SOLO este cambio de campo — no incluye (todavía) filtrar/ver la cartera de cada uno, eso sigue pausado aparte.
- [ ] **Sacar la sección "Membrete para la ficha de pago (opcional)" de este formulario** (el override por cliente individual, con nombre/dirección/teléfono). Se reemplaza por un membrete único para todos, configurado desde Honorarios (ver más abajo) — **PENDIENTE DE CONFIRMAR**: si ese membrete único reemplaza al que hoy vive en Configuración ("Membrete General") o si queda duplicado en las dos pantallas. El usuario todavía no respondió esta pregunta, no asumir ninguna de las dos antes de que la conteste.

## Pantalla Honorarios

- [ ] **Agregar configuración de membrete** (nombre/dirección/teléfono + **logo**, como imagen) para la ficha de pago — uno solo para todos los clientes, sin opción de elegir por cliente (reemplaza el override por cliente que se saca de Clientes, ver arriba). Falta confirmar si reemplaza o convive con el membrete de Configuración (ver ítem de arriba).
- [ ] **Soporte de logo**: hoy el membrete (tanto el general como el que se saca de Clientes) es solo texto (nombre/dirección/teléfono) — agregar la posibilidad de subir/mostrar una imagen de logo en la ficha de pago.

## Pantalla Calendario

- [ ] **Volver a mostrar la columna "Obligación"** en la tabla del Calendario — ATENCIÓN: esto es lo contrario de lo que se había pedido antes (`docs/ESTADO_DEL_PROYECTO.md` dice "el Calendario ya no muestra la columna Obligación, pedido explícito del usuario"). Confirmado de nuevo ahora: agregarla de vuelta.
- [ ] **Nueva obligación: RG 90 (Registro de Comprobantes, Marangatu)** — investigado (DNIT, Resolución General N° 90/2021): registro electrónico de comprobantes de ventas/compras/ingresos/egresos, con dos variantes/códigos: **955 mensual** y **956 anual**. Quien tiene IVA + IRP-RSP o IVA + IRE SIMPLE debe registrar y confirmar mensualmente, dentro del plazo de IVA; los que solo tienen IRP-RSP confirman de forma anual (según el mes de cierre). Al confirmarse, Marangatu genera un "Comprobante de Presentación" — el sistema debería tener recordatorio (aparecer en Calendario/Presentaciones) y una forma de marcar "confirmado" igual que las demás obligaciones. **Falta precisar el día exacto de vencimiento** (para la variante mensual coincidiría con la fecha de IVA por terminación de RUC; para la anual hay que confirmar la regla exacta del día según cierre fiscal) antes de poder programar el cálculo — no inventar la fecha, investigar más a fondo primero.
  - Fuentes: [RG N° 90 — DNIT](https://www.dnit.gov.py/documents/d/global/rg-n-90-registro-de-comprobantes-de-ingresos-ventas-egresos-y-compras_07_05_2021), [Guía paso a paso — confirmar presentación de comprobantes (DNIT)](https://www.dnit.gov.py/documents/20123/224724/Guia+Paso+a+Paso+-+C%C3%B3mo+confirmar+la+presentaci%C3%B3n+de+los+comprobantes+registrados.pdf), [Registro electrónico de comprobantes — Resolución 90/2021 (Estudio Contable Lic. Elisabeth Neufeld de Mueller)](https://www.ecmueller.com.py/es/registro-electronico-de-comprobantes-res-90-2021/)

## General (todo el sistema)

- [ ] **Sacar todos los textos de ayuda/explicación** (clase `texto-ayuda`, hay 8 bloques en `index.html`: Honorarios ×2, Calendario ×2, y 4 más en otras pantallas a repasar uno por uno) — no tienen que estar en el sistema.
- [ ] **Placeholders de ejemplo genéricos, no información real**: revisar el resto de los placeholders del sistema por si hay otros casos con nombres/datos reales en vez de ejemplos genéricos (el caso de "Responsable" ya queda resuelto por el ítem de arriba, al pasar a ser una lista en vez de texto libre).

- [ ] **Corrector ortográfico**: que todos los campos de texto de la aplicación (no solo login) tengan corrección/sugerencia de palabras mientras se escribe, como en un navegador normal.
- [ ] **Formato de miles con punto en montos**: los campos de dinero (cuota mensual/anual de honorarios, monto de cada pago) deben mostrarse y/o escribirse con el punto separador de miles para que se lea claro cuánto es — ejemplo: `100.000` en vez de `100000`.
