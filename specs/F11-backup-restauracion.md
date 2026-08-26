## SPEC: Backup y Restauración de Datos — F11

### Objetivo
Permitir al usuario exportar un respaldo completo de la base de datos (JSON) con todos los datos del emprendimiento y restaurarlo desde un archivo, para proteger la información ante pérdida, cambio de dispositivo o reinstalación. Se comparte mediante el Share sheet nativo y se restaura desde el selector de documentos del sistema.

### Pantallas / Vistas
- `app/(tabs)/settings.tsx` — Sección "Backup" dentro de la pestaña Ajustes
  - Botón "Exportar respaldo" (export backup)
  - Botón "Restaurar respaldo" (restore backup)
- Share sheet nativo del SO para compartir/guardar el archivo
- `DocumentPicker` del sistema para seleccionar el archivo de respaldo

### Dependencias nuevas
- `expo-file-system` — Escritura/lectura del archivo JSON en caché
- `expo-sharing` — Compartir el archivo de respaldo
- `expo-document-picker` — Seleccionar el archivo de respaldo a restaurar

### Schema SQLite
- No crea tablas nuevas. El respaldo exporta un snapshot JSON de todas las tablas existentes.
- Tablas incluidas: `services`, `quotes`, `quote_items`, `sales`, `sale_items`, `expenses`, `inventory_items`, `clients`.

### Comportamiento esperado

**Flujo feliz (Backup):**
1. Usuario abre la pestaña "Ajustes" → sección "Backup".
2. Toca "Exportar respaldo".
3. El sistema consulta todas las tablas de SQLite y las serializa en un objeto `{ [table]: rows[] }`.
4. Escribe el JSON formateado en `FileSystem.cacheDirectory` con nombre `emprendeplus-backup-<timestamp>.json`.
5. Abre el Share sheet nativo para compartir o guardar el archivo.
6. Muestra estado de carga ("Exportando…") mientras se procesa y feedback de éxito/error.

**Flujo feliz (Restaurar):**
1. Usuario toca "Restaurar respaldo".
2. Se muestra una alerta de confirmación con advertencia de que los datos actuales serán reemplazados.
3. Si confirma, se abre `DocumentPicker` filtrando archivos `application/json`.
4. El sistema lee el JSON y reinserta las filas en cada tabla con `INSERT OR REPLACE`.
5. Muestra confirmación de éxito ("Restauración completada").

**Edge cases:**
- Share sheet no disponible: mostrar alerta con la ruta del archivo guardado.
- Archivo inválido o corrupto (JSON mal formado): mostrar error, no tocar la base de datos.
- Tabla ausente en el respaldo: tratarla como vacía, no fallar.
- Fila sin todas las columnas: derivar columnas de las claves de la fila, valores `null` para campos ausentes.
- Orden de restauración: primero tablas hijas (`quote_items`, `sale_items`) y luego las padre (`sales`, `quotes`, etc.) para respetar las FK.

### Componentes necesarios
- `src/services/db/backup.ts` — Servicio de backup/restore:
  - `exportBackup(): Promise<string>` — exporta el JSON y devuelve la URI del archivo
  - `restoreBackup(uri: string): Promise<void>` — lee y restaura las tablas desde el archivo
- Sección "Backup" dentro de `app/(tabs)/settings.tsx` (componente inline)

### Estado (Zustand store)
- No requiere store propio. Operaciones síncronas/async locales gestionadas con `useState` en la pantalla (`isBackingUp`, `isRestoring`).

### Persistencia
- **SQLite**: fuente y destino de los datos (snapshot/restore de todas las tablas).
- **Archivos temporales**: el respaldo se genera en `FileSystem.cacheDirectory`; el SO puede limpiarlo, por eso se comparte/guarda explícitamente.

### API / Servicios externos
- Ninguno. Todo es local (lectura/escritura de SQLite + FileSystem + Sharing + DocumentPicker).

### Validaciones
- El archivo seleccionado debe ser JSON válido y con estructura de tabla.
- El usuario debe confirmar explícitamente la restauración (destructiva).
- Campos opcionales (`undefined`/`null`) se guardan como `NULL`.

### Scorecard de Validación
- [ ] El usuario puede exportar un respaldo completo de todas las tablas
- [ ] El respaldo se comparte/guarda mediante el Share sheet nativo
- [ ] El usuario puede restaurar desde un archivo JSON seleccionado
- [ ] La restauración pide confirmación antes de reemplazar datos
- [ ] Un archivo inválido muestra error sin corromper la base de datos
- [ ] Los datos persisten tras restaurar y reabrir la app
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
