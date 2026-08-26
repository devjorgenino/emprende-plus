## SPEC: Registro de Ventas — F05

### Objetivo
Convertir una cotización en venta confirmada con método de pago y persistirla en el historial. La cotización asociada cambia a estado `accepted`.

### Pantallas / Vistas
- Modal/form desde el detalle de cotización (`app/quotes/[id].tsx`)
- Confirmación y redirección al detalle de venta

### Dependencias nuevas
- F03 (cotizaciones), F02 (tasa BCV)

### Schema SQLite
- Tablas `sales` y `sale_items` ya definidas en schema

### Comportamiento esperado

**Flujo feliz:**
1. Desde el detalle de cotización (F03/F04), usuario toca "Registrar Venta".
2. Se abre modal con selector de método de pago.
3. Usuario selecciona método: `usd_cash`, `ves_cash`, `zelle`, `binance`, `transfer_ves`, `other`.
4. Confirmación: se crea Sale con los mismos items + totales + tasa del momento.
5. La cotización fuente cambia de `draft` a `accepted`.
6. Redirige al detalle de la venta o al historial (F06).

**Edge cases:**
- Cotización ya está en estado `accepted`: mostrar "Venta ya registrada"
- Error al guardar Sale: mostrar alerta, no cambiar estado de Quote
- Sin conexión: funciona offline (todo es local)
- Método de pago no seleccionado: validar antes de guardar

### Componentes necesarios
- `src/components/forms/SaleForm.tsx` — Selector de método de pago + confirmación

### Estado (Zustand store)

**Store: `src/store/sale.store.ts`**

```typescript
interface SaleState {
  sales: Sale[];
  isLoading: boolean;
  error: string | null;
}

interface SaleActions {
  loadSales: () => Promise<void>;
  createSaleFromQuote: (quote: Quote, paymentMethod: PaymentMethod) => Promise<string>;
  getSaleById: (id: string) => Sale | undefined;
}
```

### Persistencia
- **SQLite**: tablas `sales` y `sale_items` al crear venta
- **SQLite**: actualiza `quotes.status` a `accepted`

### Validaciones
- Método de pago es requerido (campo obligatorio)
- Quote debe tener status `draft` para poder registrar venta

### Scorecard de Validación
- [ ] Venta se crea correctamente desde cotización
- [ ] Método de pago se guarda correctamente
- [ ] Cotización asociada cambia a `accepted`
- [ ] Cotización ya aceptada muestra mensaje apropiado
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
