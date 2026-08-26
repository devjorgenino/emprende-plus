## SPEC: Exportar Cotización a PDF — F10

### Objetivo
Permitir al usuario exportar una cotización guardada a un archivo PDF profesional con diseño tipográfico (tabla de servicios, totales USD/VES, tasa de cambio, datos del cliente, notas) y compartirlo mediante las opciones nativas del dispositivo (Share sheet).

### Pantallas / Vistas
- `app/quotes/[id].tsx` — Detalle de cotización con botón "Exportar PDF"
- Modal de compartir nativo del SO (Share sheet)

### Dependencias nuevas
- `expo-print` — Generación de PDF desde HTML
- `expo-sharing` — Compartir archivo

### Schema SQLite
- No requiere cambios. Usa las tablas existentes `quotes` y `quote_items`.

### Comportamiento esperado

**Flujo feliz:**
1. Usuario abre detalle de una cotización guardada.
2. Toca botón "Exportar PDF".
3. El sistema genera un PDF con:
   - Encabezado: nombre de la app (EmprendePlus), número de cotización, fecha
   - Datos del cliente (si aplica)
   - Tabla de servicios: nombre, cantidad, precio USD, subtotal USD, subtotal Bs.
   - Total USD y Total Bs. (con la tasa del momento de la cotización)
   - Notas adicionales (si aplica)
   - Pie de página: "Generado por EmprendePlus"
4. Se abre el Share sheet nativo para compartir o guardar el PDF.
5. La cotización cambia automáticamente a estado `sent`.

**Edge cases:**
- Sin conexión: no requiere internet, la generación es 100% local
- Cotización vacía: no debería ocurrir porque se valida al guardar, pero se maneja con error
- Share sheet no disponible: mostrar error al usuario
- Error de generación: mostrar alerta de error

### Componentes necesarios
- `src/services/pdf/quotePdf.ts` — Servicio que genera el HTML con estilos y lo convierte a PDF usando `expo-print`
  - `generateQuotePdf(quote, exchangeRate): Promise<string>` — genera el PDF y devuelve la URI
  - `shareQuotePdf(quote): Promise<void>` — genera y comparte el PDF

### Estado (Zustand store)
- No requiere store propio. Usa `quote.store.ts` existente para obtener los datos de la cotización.
- Hook `useExportQuote` en `src/hooks/useExportQuote.ts` para exportar como imagen (F04 alternativo).

### Persistencia
- **SQLite**: La cotización se actualiza a estado `sent` después de exportar.
- **Archivos temporales**: El PDF se genera en caché y se elimina automáticamente por el SO.

### API / Servicios externos
- Ninguno. Generación local vía `expo-print`.

### Validaciones
- Cotización debe existir y tener al menos un item
- Share sheet debe estar disponible en el dispositivo

### Scorecard de Validación
- [ ] El usuario puede exportar una cotización a PDF
- [ ] El PDF incluye todos los datos (servicios, precios, totales, tasa, cliente, notas)
- [ ] El PDF tiene diseño profesional con colores de la app
- [ ] Al exportar, la cotización cambia a estado `sent`
- [ ] Sin Share sheet disponible, muestra error
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%