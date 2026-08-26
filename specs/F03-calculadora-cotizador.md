## SPEC: Calculadora / Cotizador — F03

### Objetivo
Seleccionar servicios del catálogo (F01), ajustar cantidades, ver precios USD/VES en tiempo real usando la tasa BCV (F02), y guardar cotizaciones en SQLite.

### Pantallas / Vistas
- `app/(tabs)/calculator.tsx` — Pantalla principal del cotizador con lista de servicios y carrito
- Modal de selección de servicios

### Dependencias nuevas
- F01 (servicios), F02 (tasa BCV)

### Schema SQLite
- Tablas `quotes` y `quote_items` ya definidas en schema

### Comportamiento esperado

**Flujo feliz:**
1. Usuario ve servicios activos agrupados por categoría.
2. Toca un servicio → lo agrega al carrito con quantity=1.
3. Ajusta cantidades con botones +/- en cada item del carrito.
4. Ve subtotales USD por item y total USD/VES calculado con tasa actual.
5. Opcional: ingresa nombre del cliente y notas.
6. Toca "Guardar Cotización" → persiste en SQLite como Quote (status: `draft`).
7. Navega al detalle de la cotización creada.

**Pantalla de cotizador tiene dos secciones:**
- **Selector de servicios**: lista con todos los servicios activos, al tocar se agregan al carrito
- **Carrito**: items seleccionados con cantidades, subtotales, total USD/VES

**Edge cases:**
- Sin servicios activos: mostrar "Agrega servicios primero" con botón a F01
- Sin tasa BCV: mostrar error y no permitir guardar
- Quantity mínima 1 (no permitir bajar de 1), máxima 999
- Carrito vacío: botón guardar deshabilitado
- Error al guardar: mostrar alerta

### Componentes necesarios
- `src/components/shared/ServiceSelector.tsx` — Lista de servicios para agregar
- `src/components/shared/CartItem.tsx` — Item en carrito con +/- y subtotales
- `src/components/forms/QuoteForm.tsx` — Cliente + notas + botón guardar
- `src/components/shared/CartSummary.tsx` — Resumen de totales USD/VES

### Estado (Zustand store)

**Store: `src/store/quote.store.ts`**

```typescript
interface QuoteState {
  items: QuoteItem[];
  clientName: string;
  notes: string;
}

interface QuoteActions {
  addItem: (service: Service) => void;
  removeItem: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  setClientName: (name: string) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
  saveQuote: (exchangeRate: number) => Promise<string>; // returns quote ID
}
```

### Persistencia
- **SQLite**: Quote completa (tablas `quotes`, `quote_items`) al guardar
- **Store en memoria**: solo durante la sesión del cotizador; se resetea al guardar o salir

### Validaciones
- Carrito no vacío para guardar
- Cantidad entre 1 y 999, entero

### Scorecard de Validación
- [ ] Usuario puede seleccionar servicios y ajustar cantidades
- [ ] Precios USD y VES se actualizan en tiempo real
- [ ] Quote se persiste en SQLite correctamente
- [ ] Sin tasa BCV muestra advertencia y no permite guardar
- [ ] Sin servicios activos muestra mensaje con enlace
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
