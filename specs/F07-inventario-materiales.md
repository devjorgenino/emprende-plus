## SPEC: Inventario de Materiales — F07

### Objetivo
CRUD de materiales/implementos con precio de compra multimoneda (USD + VES), categorías, unidades de medida, proveedor y fecha de compra.

### Pantallas / Vistas
- `app/(tabs)/inventory.tsx` — Lista de materiales con tarjetas
- `app/inventory/[id].tsx` — Formulario de creación/edición
- Modal de confirmación para eliminar

### Dependencias nuevas
- F02 (tasa BCV para calcular `purchasePriceVES` al crear/editar)

### Schema SQLite
- Tabla `inventory_items` ya definida en schema

### Comportamiento esperado

**Análogo a F01 (Servicios) pero con campos adicionales:**
- `unit`: unidad de medida seleccionable ('unidad', 'kg', 'litro', 'metro', 'caja', 'otro')
- `purchasePriceUSD`: precio de compra en USD (ingresado por usuario)
- `purchasePriceVES`: calculado como `purchasePriceUSD * exchangeRate`
- `exchangeRateAtPurchase`: tasa usada al momento del cálculo
- `supplier`: proveedor (texto opcional)
- `purchaseDate`: fecha de compra (date picker)
- `quantity`: puede ser decimal (ej: 0.5 kg)

**Flujo feliz:**
1. Lista de materiales con nombre, cantidad, unidad, precio USD/VES.
2. Tap "+" → formulario con todos los campos.
3. Usuario ingresa `purchasePriceUSD`, la app calcula `purchasePriceVES` con tasa BCV actual.
4. Guarda → SQLite → vuelve a lista.
5. Editar y eliminar funcionan igual que en F01.

**Edge cases:**
- Cantidad 0 o negativa: no permitir
- Precio USD = 0: permitir (puede ser donación o consumo propio)
- Unidad personalizada en "otro": input de texto adicional
- Sin tasa BCV: mostrar advertencia pero permitir ingreso manual de `purchasePriceVES`

### Componentes necesarios
- `src/components/shared/InventoryItem.tsx` — Item de lista
- `src/components/forms/InventoryForm.tsx` — Formulario con todos los campos + date picker

### Estado (Zustand store)

**Store: `src/store/inventory.store.ts`**

```typescript
interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
}

interface InventoryActions {
  loadItems: () => Promise<void>;
  createItem: (data: CreateInventoryInput, exchangeRate: number) => Promise<void>;
  updateItem: (id: string, data: UpdateInventoryInput, exchangeRate: number) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => InventoryItem | undefined;
}
```

### SQLite Repository
- `src/services/db/repositories/inventory.repository.ts`

### Validaciones (Zod schema)
```typescript
export const inventorySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().max(500).optional(),
  category: z.enum(['Materia Prima', 'Herramientas', 'Empaque', 'Oficina', 'Otro']),
  quantity: z.number().min(0, 'La cantidad no puede ser negativa'),
  unit: z.enum(['unidad', 'kg', 'litro', 'metro', 'caja', 'otro']),
  purchasePriceUSD: z.number().min(0),
  supplier: z.string().optional(),
  purchaseDate: z.string(),
  notes: z.string().max(500).optional(),
});
```

### Scorecard de Validación
- [ ] CRUD completo de items de inventario
- [ ] purchasePriceVES se calcula desde la tasa BCV
- [ ] Cantidades decimales funcionan (ej: 0.5 kg)
- [ ] Date picker para fecha de compra funciona
- [ ] Sin tasa BCV permite ingreso manual de VES
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
