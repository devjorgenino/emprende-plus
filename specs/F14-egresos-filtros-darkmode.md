## SPEC: Búsqueda, Filtros y Exportación de Egresos — F14

### Objetivo
Mejorar la pantalla de egresos (F09) con búsqueda textual, filtro por categoría (con chips selectables), resumen de totales filtrados, exportación a CSV de los resultados filtrados y soporte completo de tema oscuro (dark mode) con NativeWind. El objetivo es que la gestión de egresos sea rápida y visualmente consistente con el resto de la app.

### Pantallas / Vistas
- `app/(tabs)/expenses.tsx` — Pantalla de egresos mejorada (misma ruta que F09, con nuevas funcionalidades encima)

### Dependencias nuevas
- `expo-file-system` — Escritura de archivo CSV temporal
- `expo-sharing` — Compartir archivo CSV
- Ninguna adicional para búsqueda/filtros (son nativas de React Native + useMemo)

### Schema SQLite
- No requiere cambios. Usa la tabla `expenses` existente (migración versión 2).

### Comportamiento esperado

**Flujo feliz (Filtros + Dark Mode):**
1. Usuario abre la pestaña "Egresos".
2. Ve la pantalla con fondo `bg-gray-50 dark:bg-gray-900` y elementos con clases `dark:` correspondientes (cards, inputs, textos, bordes, botones).
3. En la barra de búsqueda, escribe texto y se filtran los egresos por descripción, categoría o proveedor en tiempo real.
4. Ve los chips de categorías ordenados por frecuencia de uso (más usada primero). Toca un chip para filtrar por esa categoría; toca de nuevo o toca "Todas" para limpiar el filtro.
5. El resumen de totales (cantidad de egresos, total USD, total VES) se actualiza según el filtro activo.
6. Toca "Exportar CSV" para generar un archivo CSV con los egresos filtrados y compartirlo mediante el Share sheet nativo.
7. La lista de egresos se actualiza con pull-to-refresh.

**Estados de carga/vacio/error:**
- **Loading**: spinner + texto "Cargando egresos…"
- **Error**: icono de alerta + mensaje de error + botón "Reintentar"
- **Vacío sin filtros**: icono de carrito + mensaje + CTA "Registrar egreso" → navega a `/expenses/new`
- **Vacío con filtros**: icono de búsqueda + mensaje "Sin resultados"

**Edge cases:**
- Todas las categorías tienen el mismo peso: orden alfabético como desempate.
- Búsqueda que no coincide con ningún egreso: lista vacía con marca de búsqueda.
- Sin conexión a internet: no requiere, exportación y filtros son 100% locales.
- Dark mode activo: todas las clases NativeWind `dark:` deben renderizar correctamente.
- Exportar CSV sin resultados: se muestra botón pero genera CSV vacío (solo encabezados).

### Componentes necesarios
- `app/(tabs)/expenses.tsx` — Pantalla completa con todas las mejoras (componente inline, no se extraen subcomponentes nuevos)
- `src/utils/csv.ts` — Utilidad `exportExpensesToCSV(expenses)` que genera CSV con columnas: Fecha, Descripción, Categoría, Monto USD, Monto VES, Tasa BCV, Método de Pago, Proveedor, Notas
- `src/components/shared/ExpenseItem.tsx` — Reutilizado (ya existente de F09)

### Estado (Zustand store)
- Reutiliza `useExpenseStore` existente de F09:
  - `expenses`, `isLoading`, `error`, `loadExpenses`
- Estado local en la pantalla (useState):
  - `searchQuery: string` — texto de búsqueda
  - `categoryFilter: string | 'all'` — categoría seleccionada
  - `refreshing: boolean` — estado de pull-to-refresh

### Persistencia
- **SQLite**: solo lectura (la tabla `expenses`). Filtros y búsqueda son en memoria vía `useMemo`.
- **Archivos temporales**: CSV se genera en `FileSystem.cacheDirectory` y se elimina automáticamente.

### API / Servicios externos
- Ninguno. Todo es local.

### Validaciones
- Búsqueda case-insensitive (trim + toLowerCase).
- Categorías se obtienen dinámicamente de los datos existentes, ordenadas por frecuencia descendente.
- Exportación CSV: valores con comas o saltos de línea se escapan con doble comilla y wrapping.

### Dark Mode — Clases NativeWind aplicadas

| Elemento | Clase Light | Clase Dark |
|----------|-------------|------------|
| Fondo | `bg-gray-50` | `dark:bg-gray-900` |
| Cards | `bg-white border-gray-200` | `dark:bg-gray-800 dark:border-gray-700` |
| Texto principal | `text-gray-900` | `dark:text-gray-100` |
| Texto secundario | `text-gray-500` | `dark:text-gray-400` |
| Inputs | `bg-white border-gray-200` | `dark:bg-gray-800 dark:border-gray-700` |
| Chips inactivos | `bg-white border-gray-200` | `dark:bg-gray-800 dark:border-gray-700` |
| Botones ghost | `bg-gray-200` | `dark:bg-gray-700` |

### Scorecard de Validación
- [ ] El usuario puede buscar egresos por descripción, categoría o proveedor
- [ ] El filtro por categoría funciona con chips ordenados por frecuencia
- [ ] El resumen de totales se actualiza según el filtro activo
- [ ] El usuario puede exportar los egresos filtrados a CSV
- [ ] La pantalla respeta el tema oscuro (dark mode) en todos los elementos
- [ ] Los estados loading, error y vacío se muestran correctamente
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%