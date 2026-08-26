## SPEC: Tasa BCV — F02

### Objetivo
Obtener automáticamente la tasa de cambio USD/VES del BCV con cache local de 6h y permitir ingreso manual como fallback. Proveer la tasa a todos los demás features mediante un store global.

### Pantallas / Vistas
- Modal de ingreso manual de tasa (cuando falla la API)
- Indicador visual de tasa en el header de la app (badge con tasa + fuente)

### Dependencias nuevas
- Ninguna (todo instalado: MMKV, fetch nativo)

### Schema SQLite
- Ninguno. La tasa se persiste en MMKV.

### Comportamiento esperado

**Flujo feliz:**
1. Al iniciar la app (o al navegar al cotizador), se verifica cache en MMKV (<6h).
2. Si hay cache vigente, se usa (`source: 'cached'`).
3. Si no, se fetch a `bcv-api.rafnixg.dev`.
4. Si falla, fallback a `cotizave.com`.
5. Se guarda en MMKV con timestamp + fuente.
6. El store emite la tasa actualizada para que todos los features la consuman.

**Edge cases:**
- Sin conexión y sin cache: mostrar modal pidiendo tasa manual
- API devuelve formato inesperado: log + fallback
- Tasa manual vence a las 6h igual que la automática
- Usuario puede forzar refresco desde la UI

### Componentes necesarios
- `src/components/shared/RateIndicator.tsx` — Badge en header con tasa + fuente + botón refrescar
- `src/components/shared/ManualRateModal.tsx` — Modal para ingreso manual de tasa
- `src/components/shared/RateProvider.tsx` — Provider que inicializa tasa al montar la app

### Estado (Zustand store)

**Store: `src/store/rate.store.ts`**

```typescript
interface RateState {
  rate: number | null;
  source: 'bcv' | 'manual' | 'cached';
  fetchedAt: string | null;
  isLoading: boolean;
  error: string | null;
}

interface RateActions {
  loadRate: () => Promise<void>;
  setManualRate: (rate: number) => void;
  refresh: () => Promise<void>;
}
```

### Persistencia
- **MMKV**: clave `bcv_exchange_rate` con `{ rate, fetchedAt, source }`
- TTL: 6 horas (configurable en constantes)
- Se lee al inicializar el store; se escribe tras cada fetch exitoso o entrada manual

### API / Servicios externos
| Prioridad | Servicio | Endpoint |
|-----------|---------|----------|
| Principal | bcv-api.rafnixg.dev | `GET /v1/exchange-rates/latest/USD` |
| Fallback | cotizave.com | `GET /api/v1/rates` |

### Validaciones
- Tasa manual: debe ser número positivo > 0
- Tasa manual: máximo 2 decimales

### Scorecard de Validación
- [ ] La app obtiene la tasa automáticamente al iniciar
- [ ] La tasa se cachea en MMKV por 6h
- [ ] Al fallar la API, permite ingreso manual
- [ ] El indicador visual muestra tasa + fuente correctamente
- [ ] Todos los features (F03-F08) ven la tasa actualizada
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
