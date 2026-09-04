# EmprendePlus — Prompt Maestro SDD para React Native

> **Metodología:** Spec-Driven Development (SDD)  
> **Stack:** React Native + Expo + TypeScript  
> **Propósito:** App de gestión para emprendimiento creativo con calculadora multimoneda USD/VES, registro de ventas e inventario de materiales.

---

## CONSTITUTION — La Fuente de Verdad del Proyecto

> La Constitution es el documento raíz. Toda decisión técnica, toda spec y todo componente debe ser coherente con ella. Si necesitas cambiar algo de la Constitution, propón el cambio primero y espera aprobación antes de codear.

### Misión de la App

Aplicación móvil multiplataforma (iOS/Android) para gestionar un emprendimiento de servicios creativos y de desarrollo. Permite calcular y cotizar servicios en multimoneda (USD/VES), registrar ventas, y llevar inventario de materiales/implementos.

---

## Stack Técnico (PINEADO — No cambiar sin revisar la Constitution)

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | React Native + Expo | RN 0.76+ / Expo SDK 52+ |
| Lenguaje | TypeScript estricto | `strict: true` en tsconfig |
| Routing | Expo Router | v4 (file-based routing) |
| Estado global | Zustand | 4+ |
| Persistencia rápida | MMKV | react-native-mmkv |
| Persistencia estructurada | SQLite | expo-sqlite (API síncrona SDK 52) |
| UI / Estilos | NativeWind | v4 (Tailwind para RN) |
| Exportar cotización | react-native-view-shot + expo-sharing | latest |
| Tasa de cambio BCV | REST API pública | Ver sección APIs |
| Iconos | @expo/vector-icons | Ionicons |
| Formularios | React Hook Form + Zod | latest |
| Fechas | date-fns | latest |
| Testing | Jest + React Native Testing Library | latest |
| Linter | ESLint + Prettier | latest (flat config) |
| Package Manager | pnpm | latest |
| ID Generation | crypto.randomUUID() | nativo |

---

## Estructura de Directorios

```
emprende-plus/
├── app/                        # Expo Router (file-based routing)
│   ├── _layout.tsx             # Root layout (providers, fonts, splash)
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Bottom tab navigator
│   │   ├── index.tsx           # Dashboard / Resumen (F08)
│   │   ├── calculator.tsx      # Calculadora / Cotizador (F03)
│   │   ├── sales.tsx           # Historial de Ventas (F06)
│   │   └── inventory.tsx       # Inventario (F07)
│   ├── services/
│   │   ├── index.tsx           # Lista de servicios (F01)
│   │   └── [id].tsx            # Detalle/Editar servicio
│   └── quotes/
│       └── [id].tsx            # Detalle de cotización
├── src/
│   ├── components/
│   │   ├── ui/                 # Átomos: Button, Input, Card, Badge, Modal
│   │   ├── forms/              # Formularios reutilizables
│   │   └── shared/             # Organismos: QuoteCard, ServiceItem, etc.
│   ├── features/               # Lógica de negocio compuesta (hooks complejos)
│   │   ├── calculator/
│   │   ├── services/
│   │   ├── sales/
│   │   └── inventory/
│   ├── hooks/                  # Custom hooks genéricos: useAsync, useExchangeRate, etc.
│   ├── services/               # API calls y servicios externos
│   │   ├── api/
│   │   │   └── bcv.service.ts
│   │   └── db/                 # Capa de acceso a SQLite
│   │       ├── schema.ts       # Definición de tablas
│   │       ├── migrations.ts   # Migraciones
│   │       └── repositories/   # Repos por entidad
│   ├── store/                  # Zustand stores (uno por feature, estado puro)
│   │   ├── service.store.ts
│   │   ├── quote.store.ts
│   │   ├── sale.store.ts
│   │   └── inventory.store.ts
│   ├── types/                  # Interfaces y tipos TypeScript globales
│   │   └── index.ts
│   ├── utils/                  # Helpers: formatCurrency, formatDate, etc.
│   ├── constants/              # Theme, colors, strings, layout
│   │   ├── theme.ts
│   │   ├── colors.ts
│   │   ├── strings.ts
│   │   └── layout.ts
│   └── lib/                    # Inicialización de servicios (db, mmkv)
│       ├── db.ts
│       └── storage.ts
├── app.json                    # Expo config
├── tsconfig.json               # TypeScript config
├── metro.config.js             # Metro bundler config (NativeWind)
├── nativewind-env.d.ts         # NativeWind type declarations
├── eslint.config.js            # ESLint flat config
├── prettier.config.js          # Prettier config
├── .env                        # Variables de entorno locales
├── .gitignore
└── package.json
```

### Arquitectura de Capas

```
Screen (app/) → Component (components/) → Hook (features/) → Store (store/) → DB/SQLite (services/db/)
                                                              → API (services/api/)
                                                              → MMKV (lib/storage.ts)
```

- **`features/`**: hooks complejos que combinan store + servicios externos + lógica de negocio. Un hook por operación significativa (ej. `useServiceList`, `useCreateService`).
- **`store/`**: Zustand stores puros. Solo estado + acciones síncronas. Sin efectos secundarios. Los llamados a API/DB ocurren en `features/`.

---

## Persistencia: MMKV vs SQLite

| Almacena en MMKV | Almacena en SQLite |
|-----------------|-------------------|
| Tasa de cambio cacheada (BCV) | Servicios (Service) |
| Preferencias del usuario | Cotizaciones (Quote, QuoteItem) |
| Última fecha de sync | Ventas (Sale) |
| Configuración de la app | Items de inventario (InventoryItem) |

- **MMKV** (`lib/storage.ts`): lectura/escritura síncrona ultra-rápida para datos clave-valor pequeños.
- **SQLite** (`lib/db.ts` + `services/db/`): datos estructurados que requieren queries, filtros, joins. Se accede mediante repositorios.

---

## Modelos de Datos (TypeScript Interfaces)

> NOTA: Todos los campos `Date` en las interfaces se serializan como string ISO 8601 para compatibilidad con JSON/MMKV. Se convierten con `date-fns` en runtime.

```typescript
// src/types/index.ts

interface Service {
  id: string;                    // crypto.randomUUID()
  name: string;
  description?: string;
  priceUSD: number;              // > 0, hasta 2 decimales
  category: string;
  isActive: boolean;
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}

interface QuoteItem {
  serviceId: string;
  serviceName: string;
  priceUSD: number;
  quantity: number;              // entero > 0
  subtotalUSD: number;           // priceUSD * quantity
}

interface Quote {
  id: string;
  items: QuoteItem[];
  totalUSD: number;
  totalVES: number;
  exchangeRate: number;
  exchangeRateDate: string;      // ISO 8601
  clientName?: string;
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  imageUri?: string;
  createdAt: string;             // ISO 8601
}

interface Sale {
  id: string;
  quoteId?: string;
  items: QuoteItem[];
  totalUSD: number;
  totalVES: number;
  exchangeRate: number;
  clientName?: string;
  paymentMethod:
    | 'usd_cash'
    | 'ves_cash'
    | 'zelle'
    | 'binance'
    | 'transfer_ves'
    | 'other';
  notes?: string;
  createdAt: string;             // ISO 8601
}

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;              // puede ser decimal (ej. 0.5 kg)
  unit: string;                  // 'unidad', 'kg', 'litro', 'metro', etc.
  purchasePriceUSD: number;
  purchasePriceVES: number;      // = purchasePriceUSD * exchangeRateAtPurchase (o manual)
  exchangeRateAtPurchase: number;
  supplier?: string;
  purchaseDate: string;          // ISO 8601
  notes?: string;
  createdAt: string;             // ISO 8601
}

interface ExchangeRate {
  rate: number;
  fetchedAt: string;             // ISO 8601
  source: 'bcv' | 'manual' | 'cached';
}

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}
```

---

## Roadmap de Features (Priorizado)

### Fase 1 — MVP Core *(Implementar primero)*

| ID | Feature | Descripción |
|----|---------|-------------|
| F01 | Gestión de Servicios | CRUD completo de servicios con precio USD y categoría |
| F02 | Tasa BCV | Fetch automático con cache local (6h) + entrada manual |
| F03 | Calculadora / Cotizador | Seleccionar servicios, ver precios USD/VES en tiempo real |
| F04 | Exportar Cotización como Imagen | Imagen con servicios, precios, total USD/VES, fecha y tasa |
| F05 | Registro de Ventas | Guardar cotización como venta confirmada con método de pago |

### Fase 2 — Control y Registro

| ID | Feature | Descripción |
|----|---------|-------------|
| F06 | Historial de Ventas | Lista con filtros por fecha, búsqueda, totales acumulados |
| F07 | Inventario de Materiales | CRUD de materiales/implementos con precio de compra multimoneda |
| F08 | Dashboard / Resumen | Totales del período: ingresos USD/VES, materiales comprados |

### Fase 3 — Backlog Futuro

- Exportar historial a CSV/Excel
- Múltiples clientes y contactos
- Fotos de materiales del inventario
- Backup en la nube
- Estadísticas y gráficas por período

---

## APIs para la Tasa de Cambio BCV

| Prioridad | Servicio | Endpoint | Notas |
|-----------|---------|----------|-------|
| Principal | bcv-api.rafnixg.dev | `GET /v1/exchange-rates/latest/USD` | REST, JSON limpio |
| Fallback | cotizave.com | `GET /api/v1/rates` | BCV + paralelo + USDT/VES |

**Estrategia de cache (MMKV):**
1. Al abrir la app, verificar si la tasa en MMKV tiene menos de 6 horas.
2. Si es reciente, usar la tasa cacheada (fuente: `'cached'`).
3. Si es vieja o no existe, hacer fetch a la API principal.
4. Si la API falla, intentar el fallback.
5. Si ambas fallan, mostrar alerta y permitir al usuario ingresar la tasa manualmente (fuente: `'manual'`).
6. Siempre guardar la tasa usada junto a cada cotización/venta para trazabilidad histórica.

---

## Reglas Inmutables del Proyecto

1. **TypeScript estricto siempre** — No usar `any`. Tipar todo explícitamente. `tsc --noEmit` debe pasar sin errores.
2. **Componentes "dumb"** — Los screens/components solo renderizan UI. La lógica va en hooks (`features/`) o servicios.
3. **Un store por feature** — No un store global monolítico. Zustand con stores separados.
4. **Nunca hardcodear strings en componentes** — Usar constantes en `src/constants/strings.ts`.
5. **Multimoneda siempre** — Toda función que muestre precios debe recibir la tasa como parámetro. Nunca asumir moneda.
6. **Manejo de errores robusto** — Toda operación async tiene tres estados: `loading`, `success`, `error`. Usar `AsyncState<T>` en stores. La UI siempre refleja los tres estados.
7. **Commits por feature** — Un commit semántico por tarea completada. Nunca mezclar trabajo de distintos features.
8. **Specs antes de código** — Cada feature tiene su spec aprobada antes de que se escriba una línea de implementación.
9. **Cobertura de tests** — Cada feature debe tener tests unitarios para la lógica de negocio con cobertura >70%.
10. **IDs con crypto.randomUUID()** — Consistente en todas las entidades.

---

## Estrategia de Testing

- **Runner**: Jest via `jest-expo` preset
- **Librería**: React Native Testing Library (RNTL)
- **Cobertura mínima**: >70% (branches, functions, lines, statements)
- **Mocks globales**:
  - `react-native-mmkv` → mock automático en `__mocks__/`
  - `expo-sqlite` → mock con base de datos en memoria
  - `expo-sharing`, `react-native-view-shot` → mocks básicos
- **Qué testear**:
  - Stores de Zustand (estado puro, sin RNTL)
  - Hooks en `features/` (lógica de negocio)
  - Componentes UI críticos (con RNTL)
  - Repositorios de SQLite
- **Qué NO testear**:
  - Layouts de Expo Router (son declarativos)
  - Constantes y strings

---

## Spec Template — Usar para cada Feature

```markdown
## SPEC: [Nombre del Feature] — [F0X]

### Objetivo
[Qué problema resuelve este feature para el usuario]

### Pantallas / Vistas
- [Rutas de Expo Router involucradas]

### Dependencias nuevas
- [Paquetes npm a instalar, si aplica]

### Schema SQLite
- [Tablas nuevas o modificadas, columnas, tipos]

### Comportamiento esperado
**Flujo feliz:**
- [Descripción paso a paso]

**Edge cases a manejar:**
- [Casos borde, errores esperados, estados vacíos]

### Componentes necesarios
- [Componentes UI nuevos o reutilizados de src/components/]

### Estado (Zustand store)
- [Qué datos viven en el store]
- [Qué acciones expone el store]

### Persistencia
- [MMKV o SQLite, qué se guarda, cuándo se lee/escribe]

### API / Servicios externos
- [Endpoints a consumir, parámetros, respuesta esperada]

### Validaciones (Zod schema)
- [Reglas de validación de cada campo del formulario]

### Scorecard de Validación
- [ ] El usuario puede [acción principal] sin errores
- [ ] Los datos persisten al cerrar y reabrir la app
- [ ] Los precios en VES se recalculan correctamente con la tasa BCV
- [ ] La UI muestra loading/error en todos los estados posibles
- [ ] TypeScript compila sin errores ni warnings (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
```

---

## Design Tokens

### Colores (`src/constants/colors.ts`)

| Token | Valor | Uso |
|-------|-------|-----|
| `primary` | `#6366F1` (Indigo) | Acciones principales, botones |
| `primaryDark` | `#4F46E5` | Hover/pressed states |
| `secondary` | `#10B981` (Emerald) | Éxito, confirmación |
| `background` | `#F9FAFB` | Fondo general |
| `surface` | `#FFFFFF` | Tarjetas, modales |
| `text` | `#111827` | Texto principal |
| `textSecondary` | `#6B7280` | Texto secundario |
| `error` | `#EF4444` | Errores, alerts |
| `border` | `#E5E7EB` | Bordes de inputs/cards |

### Tipografía (`src/constants/theme.ts`)

- Font family: System (SF Pro en iOS, Roboto en Android)
- Scale: 12 / 14 / 16 / 18 / 20 / 24 / 30

### Spacing (`src/constants/layout.ts`)

- Escala 4-8-12-16-24-32-48-64

---

## Flujo de Trabajo SDD (Referencia Rápida)

```
┌─────────────────────────────────────────────────────┐
│                   CONSTITUTION                      │
│         (Stack, modelos, reglas, roadmap)           │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │   Generar SPEC (F0X)    │
          │   usando el template    │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │   Revisión y aprobación │ ← Usuario revisa
          │   de la spec            │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │   Implementación        │
          │   (código, tests)       │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │   Scorecard de          │ ← Usuario valida
          │   Validación            │   en dispositivo
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │   Commit semántico      │
          │   → siguiente feature   │
          └─────────────────────────┘
```

---

## Instrucción al Agente de IA

Estás construyendo **EmprendePlus** siguiendo estrictamente la metodología **Spec-Driven Development (SDD)**. Estas son tus reglas de comportamiento:

1. **NO escribas código hasta que el usuario apruebe la spec del feature actual.**
2. Para cada feature del roadmap: primero genera la spec usando el template de arriba, espera revisión, luego implementa.
3. Si encuentras ambigüedades en la spec, pregunta **antes** de codear. Nunca asumas.
4. Mantén todos los archivos en sync con la Constitution. Si necesitas cambiar el stack, propón el cambio en la Constitution primero y espera aprobación.
5. Después de implementar cada feature, presenta el **Scorecard de Validación** completo para que el usuario lo verifique manualmente en el dispositivo.
6. Si el usuario reporta un fallo en el scorecard, corrígelo en el mismo feature antes de avanzar al siguiente.
7. Nunca arregles errores de forma directa en el código sin actualizar la spec. Los artefactos deben mantenerse siempre en sync.

**Primer paso al recibir esta Constitution:**
Configura el proyecto Expo con la estructura de directorios completa, instala todas las dependencias del stack, crea el archivo de theme/design tokens en `src/constants/`, y genera la **spec de F01 (Gestión de Servicios)** para aprobación.

---

*Documento generado el 24 de junio de 2026. Versión 2.0 — Constitution revisada con mejoras de arquitectura.*

---

## 🔗 Segundo Cerebro
Al completar una sesión de trabajo, reporta al Segundo Cerebro:
```bash
python "C:/Users/jorge/Documents/Segundo Cerebro/scripts/agent_hook.py" --project "EmprendePlus" --agent "<tu-nombre>" --summary "<resumen>" --files "<archivos>"
```
