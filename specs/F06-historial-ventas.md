## SPEC: Historial de Ventas — F06

### Objetivo
Listar todas las ventas registradas con filtros por fecha, búsqueda por cliente y totales acumulados USD/VES.

### Pantallas / Vistas
- `app/(tabs)/sales.tsx` — Pantalla de historial (tab de Ventas)

### Dependencias nuevas
- F05 (ventas)

### Comportamiento esperado

**Flujo feliz:**
1. Al abrir la pestaña Ventas, se cargan todas las ventas desde SQLite.
2. Se muestran en lista cronológica inversa (más reciente primero).
3. Cada item muestra: cliente, total USD, total VES, método de pago, fecha.
4. Sección de resumen en la parte superior: Total USD y Total VES del período actual.
5. Filtros: selector de rango de fechas, búsqueda por texto (cliente).
6. Tap en item → navega a `app/quotes/[id].tsx` (reutiliza detalle de cotización como detalle de venta).

**Edge cases:**
- Sin ventas: mostrar "No hay ventas registradas"
- Filtro sin resultados: mostrar "No se encontraron ventas para este período"
- Búsqueda vacía después de filtrar: mostrar mensaje apropiado
- Pull-to-refresh para recargar

### Componentes necesarios
- `src/components/shared/SaleItem.tsx` — Item de la lista de ventas
- `src/components/shared/SalesSummary.tsx` — Totales acumulados
- `src/components/shared/DateRangeFilter.tsx` — Filtro de fechas

### Estado (Zustand store)
- Reutiliza `src/store/sale.store.ts` de F05 (se agregan métodos de filtro)

```typescript
// Extensiones al store de F05
interface SaleActions {
  // ... existing
  getSalesInRange: (startDate: string, endDate: string) => Sale[];
  searchSales: (query: string) => Sale[];
  getTotalUSDInRange: (startDate: string, endDate: string) => number;
  getTotalVESInRange: (startDate: string, endDate: string) => number;
}
```

### Persistencia
- **SQLite**: solo lectura de `sales` (escritura viene de F05)

### Scorecard de Validación
- [ ] Lista carga y muestra ventas correctamente
- [ ] Filtros por rango de fechas funcionan
- [ ] Búsqueda por cliente funciona
- [ ] Totales acumulados USD/VES se calculan correctamente
- [ ] Pull-to-refresh recarga datos
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
