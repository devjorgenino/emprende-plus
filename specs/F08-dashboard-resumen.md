## SPEC: Dashboard / Resumen — F08

### Objetivo
Mostrar en la pantalla de inicio un resumen del período: ingresos totales USD/VES, cantidad de servicios activos, items en inventario y materiales comprados. Es el centro de comando de la app.

### Pantallas / Vistas
- `app/(tabs)/index.tsx` — Tab de inicio (Home), que es la pantalla principal al abrir la app

### Dependencias nuevas
- F01 (servicios), F05+F06 (ventas), F07 (inventario)

### Comportamiento esperado

**Flujo feliz:**
1. Al abrir la app o navegar a la pestaña Home, se cargan datos de servicios activos, ventas del período e inventario.
2. Se muestran tarjetas de resumen en grid (2x2):
   - **Ingresos USD**: suma de `totalUSD` de ventas en el período
   - **Ingresos VES**: suma de `totalVES` de ventas en el período
   - **Servicios Activos**: cantidad de servicios con `isActive: true`
   - **Items en Inventario**: cantidad total de items (suma de quantities)
3. Selector de período: Hoy, Esta Semana, Este Mes, Personalizado (date picker).
4. Lista de últimas 5 ventas debajo de las tarjetas.
5. Pull-to-refresh para recargar todos los datos.

**Edge cases:**
- Sin ventas en el período: mostrar "0.00 USD / 0.00 VES"
- Sin servicios activos: mostrar "0" con sugerencia de crear
- Error al cargar un feature: mostrar el resto de la info y error parcial
- Al cambiar de período, se recalculan todos los totales

### Componentes necesarios
- `src/components/shared/DashboardCard.tsx` — Tarjeta individual (ícono, label, valor)
- `src/components/shared/DashboardGrid.tsx` — Grid 2x2 de tarjetas
- `src/components/shared/PeriodSelector.tsx` — Selector de período (Hoy/Semana/Mes/Personalizado)

### Estado
- No necesita store propio. Reutiliza stores de F01, F06, F07.
- Hook `useDashboard` en `src/features/dashboard/useDashboard.ts` que combina datos de todos los stores.

```typescript
// src/features/dashboard/useDashboard.ts
interface DashboardData {
  totalIncomeUSD: number;
  totalIncomeVES: number;
  activeServicesCount: number;
  inventoryItemsCount: number;
  recentSales: Sale[];
  isLoading: boolean;
  error: string | null;
}

function useDashboard(period: Period): DashboardData {
  // Combina datos de useServiceStore, useSaleStore, useInventoryStore
  // Filtra por período
  // Retorna datos agregados
}
```

### Scorecard de Validación
- [ ] Dashboard muestra datos correctos del período
- [ ] Selector de período (Hoy/Semana/Mes) cambia los datos correctamente
- [ ] Últimas 5 ventas se muestran correctamente
- [ ] Pull-to-refresh refresca todos los datos
- [ ] Error parcial no bloquea toda la pantalla
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
