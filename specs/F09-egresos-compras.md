## SPEC: Gestión de Egresos / Compras — F09

### Objetivo
Registrar egresos (compras, gastos operativos, insumos, servicios contratados) del emprendimiento en USD/VES para llevar control financiero completo: ingresos - egresos = ganancia neta. Integrar los totales en el Dashboard (F08).

### Pantallas / Vistas
- `app/(tabs)/expenses.tsx` — Lista de egresos con filtro por fecha y búsqueda
- `app/expenses/new.tsx` — Formulario para registrar nuevo egreso
- `app/expenses/[id].tsx` — Detalle/editar egreso

### Dependencias nuevas
- Ninguna (usa stack existente: SQLite, Zustand, React Hook Form + Zod)

### Schema SQLite
Nueva tabla `expenses`:

```sql
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amountUSD REAL NOT NULL,
  amountVES REAL NOT NULL,
  exchangeRate REAL NOT NULL,
  paymentMethod TEXT NOT NULL,
  supplier TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL
);
```

### Comportamiento esperado
**Flujo feliz:**
1. Usuario abre pestaña "Egresos" en el tab navegador
2. Ve lista de egresos registrados, ordenados por fecha descendente
3. Toca "+" para registrar nuevo egreso
4. Completa formulario: descripción, categoría, monto USD, método de pago, proveedor (opcional), notas (opcional)
5. El monto en VES se calcula automáticamente con la tasa BCV actual
6. Guarda → vuelve a la lista con el nuevo egreso visible
7. Los totales del Dashboard se actualizan (ingresos - egresos = ganancia neta)

**Edge cases:**
- Sin egresos: mensaje vacío con CTA a registrar
- Sin tasa BCV: mostrar alerta, permitir ingresar tasa manualmente
- Editar egreso: permite cambiar cualquier campo, recalcula VES si cambió USD
- Eliminar egreso: con confirmación

### Componentes necesarios
- `src/components/shared/ExpenseItem.tsx` — Item de la lista (reutiliza patrones de SaleItem)
- `src/components/forms/ExpenseForm.tsx` — Formulario creación/edición (Zod + React Hook Form)
- `src/components/shared/ExpenseList.tsx` — Lista con filtros (opcional, puede ir inline en screen)

### Estado (Zustand store)
`src/store/expense.store.ts`:

```typescript
interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
}

interface ExpenseActions {
  loadExpenses: () => Promise<void>;
  createExpense: (data: CreateExpenseInput, exchangeRate: number) => Promise<string>;
  updateExpense: (id: string, data: UpdateExpenseInput, exchangeRate: number) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpenseById: (id: string) => Expense | undefined;
  getExpensesInRange: (startDate: string, endDate: string) => Expense[];
  searchExpenses: (query: string) => Expense[];
  getTotalUSDInRange: (startDate: string, endDate: string) => number;
  getTotalVESInRange: (startDate: string, endDate: string) => number;
}
```

### Persistencia
- SQLite (`expenses` table) via repositorio `src/services/db/repositories/expense.repository.ts`
- Sigue el mismo patrón que `sale.repository.ts`

### API / Servicios externos
- Ninguno nuevo. Usa `useRateStore` para tasa BCV.

### Validaciones (Zod schema)
```typescript
const expenseSchema = z.object({
  description: z.string().min(1, 'Descripción requerida'),
  category: z.string().min(1, 'Categoría requerida'),
  amountUSD: z.number().positive('Monto debe ser mayor a 0'),
  paymentMethod: z.enum(['usd_cash', 'ves_cash', 'zelle', 'binance', 'transfer_ves', 'other']),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});
```

### Dashboard (F08) — Integración
En `DashboardData` y `useDashboard`, agregar:
- `totalExpensesUSD` — suma de egresos en el período
- `totalExpensesVES` — suma de egresos en VES en el período
- `netIncomeUSD` — `totalIncomeUSD - totalExpensesUSD`
- `netIncomeVES` — `totalIncomeVES - totalExpensesVES`

En el DashboardScreen, agregar tarjetas:
- "Egresos USD" y "Egresos VES"
- "Ganancia Neta USD" y "Ganancia Neta VES" (con color verde si positiva, rojo si negativa)

### Tab Navigator
Agregar pestaña "Egresos" en `app/(tabs)/_layout.tsx` con icono `cart-outline`.

### Scorecard de Validación
- [ ] El usuario puede registrar un egreso con monto USD, categoría, método de pago
- [ ] El VES se calcula automáticamente con la tasa actual
- [ ] El usuario puede editar y eliminar egresos
- [ ] La lista filtra por rango de fechas
- [ ] Los totales aparecen en el Dashboard
- [ ] El Dashboard muestra ganancia neta (ingresos - egresos)
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
