## SPEC: Gestión de Clientes — F13

### Objetivo
Permitir al usuario gestionar una lista de clientes del emprendimiento (crear, buscar, editar y eliminar), con una pantalla de detalle que muestra el historial de ventas del cliente y el total gastado en USD/VES. Los clientes se asocian a las ventas por nombre (normalizado, case-insensitive).

### Pantallas / Vistas
- `app/(tabs)/clients.tsx` — Lista de clientes con búsqueda y alta rápida
- `app/clients/[id].tsx` — Detalle del cliente: contacto, edición, eliminación, totales y ventas
- Tab `clients` en `app/(tabs)/_layout.tsx` (icono `people`)

### Dependencias nuevas
- Ninguna (usa el stack existente: SQLite, Zustand, expo-router).

### Schema SQLite
Nueva tabla `clients` (migración versión 5):

```sql
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL
);
```

### Comportamiento esperado

**Flujo feliz:**
1. Usuario abre la pestaña "Clientes".
2. Ve la lista de clientes ordenada por nombre (A-Z) con pull-to-refresh.
3. Busca clientes por nombre en el campo de búsqueda.
4. Toca el FAB "+" para agregar un cliente: se solicita el nombre (Alert.prompt) y se crea al instante.
5. Toca un cliente para abrir su detalle: avatar con inicial, teléfono/email/notas, total gastado (USD y VES), número de ventas e historial de ventas (reutilizando `SaleItem`).
6. En el detalle puede editar contacto (teléfono, email, notas) o eliminar el cliente con confirmación.
7. Tocar una venta del historial navega al detalle de esa venta.

**Edge cases:**
- Sin clientes: mensaje vacío con CTA.
- Nombre vacío en el prompt: no se crea el cliente.
- Búsqueda sin resultados: lista vacía filtrada.
- Cliente sin ventas: totales en cero y mensaje "sin ventas registradas".
- Cliente sin datos de contacto: mensaje "sin datos de contacto".
- Eliminar cliente: confirmación destructiva antes de borrar.
- Asociación por nombre: la venta se asocia al cliente si `clientName` coincide (trim + lowercase); se crea el cliente automáticamente al registrar una venta con `upsertClientByName`.

### Componentes necesarios
- `src/components/shared/SaleItem.tsx` — Reutilizado para el historial de ventas del cliente
- Lista de clientes inline en `app/(tabs)/clients.tsx`
- Detalle inline en `app/clients/[id].tsx`

### Estado (Zustand store)
- No requiere store de clientes propio: la lista se maneja con `useState` local + repositorio síncrono.
- Se reutiliza `sale.store.ts` (`loadSales`, `sales`, `isLoading`) para el historial del cliente vía el hook `useClientSales`.

### Persistencia
- **SQLite** (`clients` table) vía repositorio `src/services/db/repositories/client.repository.ts`:
  - `getAllClients(): Client[]`
  - `getClientById(id: string): Client | undefined`
  - `getClientByName(name: string): Client | undefined`
  - `createClient(name, phone?, email?, notes?): Client`
  - `upsertClientByName(name: string): Client`
  - `updateClient(id, { phone?, email?, notes? }): void`
  - `deleteClient(id: string): void`
- IDs generados con `crypto.randomUUID()` (vía `generateId()`).

### API / Servicios externos
- Ninguno. Todo local.

### Validaciones
- `name` es obligatorio y no vacío.
- `phone` y `email` opcionales; se guardan como `undefined` si están vacíos.
- `email` con `autoCapitalize="none"` y teclado `email-address` (validación de formato a nivel de UI).

### Scorecard de Validación
- [ ] El usuario puede crear, buscar, editar y eliminar clientes
- [ ] El detalle muestra contacto, total gastado (USD/VES) y conteo de ventas
- [ ] El historial de ventas del cliente es correcto y navegable
- [ ] Los datos persisten al cerrar y reabrir la app
- [ ] Al registrar una venta con un cliente nuevo, se crea/vincula automáticamente
- [ ] La UI muestra estados vacíos y de carga
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
