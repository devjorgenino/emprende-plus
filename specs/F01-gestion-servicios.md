## SPEC: Gestión de Servicios — F01

### Objetivo
Permitir al usuario crear, editar, listar y eliminar servicios que ofrece su emprendimiento. Cada servicio tiene nombre, descripción opcional, precio en USD, precio en VES (calculado automáticamente desde la tasa BCV actual) y categoría. Los servicios son la base del cotizador (F03) y de las ventas (F05).

### Pantallas / Vistas
- `app/services/index.tsx` — Lista de servicios con botón de agregar
- `app/services/[id].tsx` — Formulario de creación/edición
- Modal de confirmación para eliminar

### Dependencias nuevas
- **F02 (Tasa BCV)**: Necesaria para calcular `priceVES = priceUSD * tasaBCV` al crear/editar servicios

### Schema SQLite
- Tabla `services` con columna adicional `priceVES REAL NOT NULL`:
  ```sql
  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    priceUSD REAL NOT NULL,
    priceVES REAL NOT NULL,
    category TEXT NOT NULL,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
  ```

### Comportamiento esperado

**Consideración multimoneda:**
- El usuario **solo ingresa `priceUSD`** en el formulario.
- `priceVES` se calcula automáticamente como `priceUSD * exchangeRate` usando la tasa BCV actual (F02).
- Si no hay tasa BCV disponible (sin conexión y sin cache), se muestra un mensaje y se pide ingresar la tasa manualmente antes de guardar.

**Flujo feliz (listar):**
1. Al abrir la pantalla de servicios, se cargan todos los servicios desde SQLite vía store.
2. Se muestran en una lista con nombre, precio USD, precio VES y categoría.
3. Cada item tiene botones de editar y eliminar.

**Flujo feliz (crear):**
1. Usuario toca "+" en la lista.
2. Navega a `app/services/new`.
3. Ingresa nombre, descripción, precio USD, categoría.
4. El sistema obtiene la tasa BCV actual (del store F02) y calcula `priceVES` automáticamente.
5. Guarda → persiste en SQLite con `priceVES` incluido → redirige a lista.

**Flujo feliz (editar):**
1. Usuario toca editar en un servicio.
2. Navega a `app/services/[id].tsx` con datos precargados.
3. Modifica campos; el `priceVES` se recalcula si cambia `priceUSD`.
4. Guarda → actualiza en SQLite → redirige a lista.

**Flujo feliz (eliminar):**
1. Usuario toca eliminar.
2. Modal de confirmación.
3. Confirma → se elimina de SQLite → se refresca lista.

**Edge cases a manejar:**
- Lista vacía: mostrar mensaje "No hay servicios registrados"
- Precio USD debe ser > 0
- Nombre obligatorio, no vacío
- Tasa BCV no disponible: mostrar error al intentar guardar
- Error al guardar en DB: mostrar alerta
- Loading state mientras se cargan datos
- Pull-to-refresh en la lista
- Categoría con valores predefinidos: "Desarrollo", "Diseño", "Consultoría", "Otro"

### Componentes necesarios
- **`src/components/ui/Button.tsx`** — Botón reutilizable
- **`src/components/ui/Input.tsx`** — Input de texto reutilizable
- **`src/components/ui/Card.tsx`** — Tarjeta contenedora
- **`src/components/ui/Modal.tsx`** — Modal de confirmación
- **`src/components/ui/Badge.tsx`** — Badge para categoría
- **`src/components/shared/ServiceItem.tsx`** — Item de la lista
- **`src/components/forms/ServiceForm.tsx`** — Formulario de servicio

### Estado (Zustand store)

**Store: `src/store/service.store.ts`**

```typescript
interface ServiceState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
}

interface ServiceActions {
  loadServices: () => Promise<void>;
  createService: (data: CreateServiceInput, exchangeRate: number) => Promise<void>;
  updateService: (id: string, data: UpdateServiceInput, exchangeRate: number) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  getServiceById: (id: string) => Service | undefined;
}
```
- `createService` y `updateService` reciben `exchangeRate` como parámetro y calculan `priceVES = priceUSD * exchangeRate` antes de persistir.

### Persistencia
- **SQLite**: tabla `services` con columna `priceVES`. Lectura al montar la pantalla, escritura en cada CRUD.
- El store mantiene cache en memoria.
- La tasa BCV se obtiene del store F02 (MMKV cache).

### API / Servicios externos
- Ninguno directo. La tasa BCV la proporciona F02 mediante `useExchangeRate` (desde MMKV o API).

### Validaciones (Zod schema)

```typescript
import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
  description: z.string().max(500).optional(),
  priceUSD: z.number().positive('El precio debe ser mayor a 0'),
  category: z.enum(['Desarrollo', 'Diseño', 'Consultoría', 'Otro']),
});

export type CreateServiceInput = z.infer<typeof serviceSchema>;
export type UpdateServiceInput = Partial<CreateServiceInput>;
```
- `priceVES` no está en el schema de entrada porque se calcula automáticamente.

### Scorecard de Validación
- [ ] El usuario puede crear un servicio con todos los campos
- [ ] `priceVES` se calcula y guarda correctamente al crear/editar
- [ ] El usuario puede editar un servicio existente
- [ ] El usuario puede eliminar un servicio con confirmación
- [ ] La lista de servicios es persistente al cerrar y reabrir la app
- [ ] La lista vacía muestra mensaje apropiado
- [ ] Los campos inválidos muestran errores de validación
- [ ] Sin tasa BCV disponible, el formulario muestra error antes de guardar
- [ ] La UI muestra loading/error en todos los estados posibles
- [ ] TypeScript compila sin errores ni warnings (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
