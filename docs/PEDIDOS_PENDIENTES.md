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

## General (todo el sistema)

- [ ] **Sacar todos los textos de ayuda/explicación** (clase `texto-ayuda`, hay 8 bloques en `index.html`: Honorarios ×2, Calendario ×2, y 4 más en otras pantallas a repasar uno por uno) — no tienen que estar en el sistema.
- [ ] **Placeholders de ejemplo genéricos, no información real**: revisar el resto de los placeholders del sistema por si hay otros casos con nombres/datos reales en vez de ejemplos genéricos (el caso de "Responsable" ya queda resuelto por el ítem de arriba, al pasar a ser una lista en vez de texto libre).

- [ ] **Corrector ortográfico**: que todos los campos de texto de la aplicación (no solo login) tengan corrección/sugerencia de palabras mientras se escribe, como en un navegador normal.
- [ ] **Formato de miles con punto en montos**: los campos de dinero (cuota mensual/anual de honorarios, monto de cada pago) deben mostrarse y/o escribirse con el punto separador de miles para que se lea claro cuánto es — ejemplo: `100.000` en vez de `100000`.
