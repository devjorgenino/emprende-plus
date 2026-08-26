## SPEC: Pantalla de Ajustes / Configuración — F15

### Objetivo
Proveer una pantalla central de Ajustes/Configuración dentro de la app que agrupe las opciones de gestión de datos y de información del sistema, sirviendo como contenedor de las secciones de Backup/Restauración (F11) e Historial de Tasas (F12), junto con una sección "Acerca de" con los datos de la app. Es el punto de entrada para el mantenimiento y la trazabilidad del emprendimiento.

### Pantallas / Vistas
- `app/(tabs)/settings.tsx` — Pestaña "Ajustes" (nueva pestaña en el tab navegador)
- Secciones internas:
  1. **Backup** — Exportar y restaurar respaldo (F11)
  2. **Historial de Tasas** — Tasas usadas en ventas/cotizaciones/egresos (F12)
  3. **Acerca de** — Información de la app (nombre, versión, SDK, RN)

### Dependencias nuevas
- `expo-file-system`, `expo-sharing`, `expo-document-picker` (usados por la sección Backup, F11)
- Ninguna adicional para el contenedor en sí.

### Schema SQLite
- No crea tablas. Lee datos de `sales`, `quotes` y `expenses` para el historial de tasas (F12) y todas las tablas para el backup (F11).

### Comportamiento esperado

**Flujo feliz:**
1. Usuario abre la pestaña "Ajustes" desde el tab navegador (icono `settings` / `settings-outline`).
2. Ve tres secciones apiladas:
   - **Backup**: botones "Exportar respaldo" y "Restaurar respaldo" con estados de carga y feedback (ver F11).
   - **Historial de tasas**: lista de tasas recientes con fecha y fuente (ver F12).
   - **Acerca de**: filas con `appName`, versión, versión de Expo SDK y versión de React Native.
3. La pantalla respeta el tema claro/oscuro (NativeWind `dark:` clases).

**Edge cases:**
- Error de lectura en el historial de tasas: manejo silencioso, la sección muestra vacío.
- Backup/restore fallido: alerta de error en la sección Backup.
- Sin datos en alguna sección: estado vacío (ej. "No hay tasas registradas").
- Pantalla larga: contenido en `ScrollView` para soportar scroll.

### Componentes necesarios
- `app/(tabs)/settings.tsx` — Pantalla completa con las tres secciones.
- `src/constants/strings.ts` — Textos de las secciones (backup, restore, rate history, about).
- Tipo local `RateRecord { rate; source; date }` para el historial.

### Estado (Zustand store)
- No requiere store global. Estado local con `useState`:
  - `rates: RateRecord[]` — historial de tasas
  - `isBackingUp: boolean` — estado de carga del backup
  - `isRestoring: boolean` — estado de carga del restore

### Persistencia
- **SQLite**: fuente de datos para backup y historial de tasas.
- **Archivos temporales**: generación de respaldo en `FileSystem.cacheDirectory` (F11).

### API / Servicios externos
- Ninguno. Todo es local.

### Validaciones
- Acciones destructivas (restaurar) requieren confirmación explícita.
- Estados de carga evitan doble toque en botones de backup/restore.
- Formato de moneda/fecha consistente con el resto de la app.

### Integración con otras features
- **F11 (Backup)** y **F12 (Historial de Tasas)**: secciones alojadas en esta pantalla.
- Tema oscuro: la pantalla usa clases NativeWind `dark:` coherentes con el resto de la app.

### Tab Navigator
Agregar pestaña "Ajustes" en `app/(tabs)/_layout.tsx` con icono `settings-outline`.

### Scorecard de Validación
- [ ] El usuario accede a Ajustes desde la pestaña del tab navegador
- [ ] La pantalla muestra las secciones Backup, Historial de Tasas y Acerca de
- [ ] La sección Backup funciona (exportar/restaurar) sin errores
- [ ] La sección Historial de Tasas muestra tasas con fecha y fuente
- [ ] La sección Acerca de muestra datos de la app (versión, SDK, RN)
- [ ] La pantalla respeta el tema claro/oscuro
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
