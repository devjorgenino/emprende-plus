# Plan: Persistencia de Cotizaciones (Draft) en AsyncStorage

## Objetivo
Las cotizaciones creadas en el carrito del cotizador deben persistir entre sesiones de la app (AsyncStorage) y solo borrarse cuando el usuario las elimine manualmente o las guarde permanentemente en SQLite.

## Problema Actual
- `quote.store.ts` guarda en SQLite solo cuando el usuario presiona "Guardar" (`saveQuote`).
- El estado del carrito (`items`, `clientName`, `notes`) vive solo en memoria Zustand y se pierde al cerrar la app.
- No hay forma de recuperar una cotización en borrador después de reiniciar la app.

## Arquitectura Propuesta
1. **Nuevo store `draft-quote.store.ts`**: Mantiene el estado del carrito persistente en AsyncStorage (key `draft_quote`).
2. **Modificación `quote.store.ts`**: Agregar acciones `loadDraft()` y `clearDraft()`; `saveQuote()` debe limpiar el borrador.
3. **Modificación `calculator.tsx`**: Al montar, cargar el borrador; al guardar, limpiar borrador; agregar botón para borrar borrador.
4. **Strings**: Agregar strings para los nuevos textos UI.

## Pasos

### Paso 1: Crear store de borrador (`src/store/draft-quote.store.ts`)
```typescript
import { create } from 'zustand';
import { getObject, setObject, removeKey } from '../lib/storage';
import type { QuoteItem } from '../types';

const DRAFT_KEY = 'draft_quote';

interface DraftQuoteState {
  items: QuoteItem[];
  clientName: string;
  notes: string;
}

interface DraftQuoteActions {
  loadDraft: () => Promise<void>;
  saveDraft: (state: Partial<DraftQuoteState>) => Promise<void>;
  clearDraft: () => Promise<void>;
  reset: () => void;
}

export const useDraftQuoteStore = create<DraftQuoteState & DraftQuoteActions>((set) => ({
  items: [],
  clientName: '',
  notes: '',
  
  loadDraft: async () => {
    const draft = await getObject<DraftQuoteState>(DRAFT_KEY);
    if (draft) {
      set(draft);
    }
  },
  
  saveDraft: async (partial) => {
    set((state) => ({ ...state, ...partial }));
    const updated = { ...get().items, clientName: get().clientName, notes: get().notes };
    await setObject(DRAFT_KEY, updated);
  },
  
  clearDraft: async () => {
    set({ items: [], clientName: '', notes: '' });
    await removeKey(DRAFT_KEY);
  },
  
  reset: () => set({ items: [], clientName: '', notes: '' }),
}));
```

### Paso 2: Modificar `quote.store.ts`
- Agregar `loadDraft()` que llame al store de borrador.
- Agregar `clearDraft()` que llame al store de borrador.
- En `saveQuote()`, después de guardar en SQLite, llamar a `clearDraft()`.

### Paso 3: Modificar `calculator.tsx`
- Al montar, cargar el borrador.
- Agregar efecto que sincronice cambios del carrito con el borrador.
- Agregar botón "Borrar borrador" cuando hay items en el carrito.
- Mostrar indicador visual de " Borrador guardado".

### Paso 4: Strings
Agregar a `src/constants/strings.ts`:
```typescript
draftSaved: 'Borrador guardado',
clearDraft: 'Borrar borrador',
draftExists: 'Hay un borrador pendiente',
restoreDraft: 'Restaurar borrador',
```

### Paso 5: Tests
- Test de `draft-quote.store.ts`: carga, guardado, borrado.
- Test de integración con `calculator.tsx`.

## Validación
- `pnpm run typecheck` debe pasar.
- `pnpm run lint` debe pasar.
- `pnpm run test` debe pasar.
- Verificar manualmente: crear cotización → cerrar app → abrir app → cotización restaurada.
