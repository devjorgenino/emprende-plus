## SPEC: Historial de Tasas de Cambio — F12

### Objetivo
Mostrar al usuario un historial de las tasas de cambio USD/VES utilizadas en sus operaciones (ventas, cotizaciones y egresos), para dar trazabilidad y transparencia sobre qué tasa se aplicó a cada registro. Se agrega como sección dentro de la pestaña Ajustes.

### Pantallas / Vistas
- `app/(tabs)/settings.tsx` — Sección "Historial de tasas" dentro de la pestaña Ajustes
- Lista de registros: tasa, fuente (venta / cotización / egreso) y fecha

### Dependencias nuevas
- Ninguna (usa el stack existente: SQLite + React Native).

### Schema SQLite
- No crea tablas nuevas. Lee los campos `exchangeRate` y `createdAt` de las tablas existentes:
  - `sales` (fuente: 'venta')
  - `quotes` (fuente: 'cotización')
  - `expenses` (fuente: 'egreso')

### Comportamiento esperado

**Flujo feliz:**
1. Usuario abre la pestaña "Ajustes" → sección "Historial de tasas".
2. El sistema consulta las últimas 10 tasas de cada tabla (ventas, cotizaciones, egresos) ordenadas por fecha descendente.
3. Combina los tres conjuntos, los ordena por fecha descendente y muestra hasta 20 registros.
4. Cada fila muestra: tasa (`Bs. X.XX`), fecha (formato `es-VE`) y una etiqueta de fuente (venta / cotización / egreso).
5. Si no hay registros, se muestra mensaje vacío "No hay tasas registradas".

**Edge cases:**
- Tabla vacía o sin datos: tratarla como vacía, no fallar.
- Error al leer SQLite: manejo silencioso (la sección no es crítica, no bloquea Ajustes).
- Formato de fecha inválido: protegido por el manejo de errores global.
- Fuente desconocida: se muestra tal cual; no rompe el renderizado.

### Componentes necesarios
- Sección "Historial de tasas" dentro de `app/(tabs)/settings.tsx` (componente inline)
- Tipo local `RateRecord { rate: number; source: string; date: string }`

### Estado (Zustand store)
- No requiere store propio. Se usa `useState` en la pantalla para la lista `RateRecord[]`, cargada una vez al montar el componente.

### Persistencia
- **SQLite**: solo lectura (query de `exchangeRate`/`createdAt` en `sales`, `quotes`, `expenses`).
- No escribe ni modifica datos.

### API / Servicios externos
- Ninguno. Datos provenientes de la base de datos local.

### Validaciones
- Límite de 20 registros combinados para mantener la lista legible.
- Límite de 10 registros por tabla para acotar la query.

### Scorecard de Validación
- [ ] El usuario ve un historial de tasas con fecha y fuente
- [ ] Las tasas provienen de ventas, cotizaciones y egresos combinados
- [ ] La lista está ordenada por fecha descendente
- [ ] Estado vacío muestra mensaje cuando no hay tasas
- [ ] La sección no rompe la pantalla de Ajustes si falla la lectura
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
