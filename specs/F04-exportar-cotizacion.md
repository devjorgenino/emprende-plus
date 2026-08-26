## SPEC: Exportar Cotización como Imagen — F04

### Objetivo
Generar una imagen PNG de la cotización con servicios, precios, total USD/VES, fecha, tasa y nombre del cliente, y compartirla mediante el share sheet nativo.

### Pantallas / Vistas
- Botón "Exportar" en la pantalla de detalle de cotización (`app/quotes/[id].tsx`)
- Preview/share sheet nativo vía expo-sharing

### Dependencias nuevas
- Instaladas: react-native-view-shot, expo-sharing

### Comportamiento esperado

**Flujo feliz:**
1. Desde el detalle de una cotización, usuario toca "Exportar".
2. Se renderiza `QuoteImage` en un View oculto con diseño limpio y profesional.
3. `react-native-view-shot` captura el View como PNG (calidad 1.0).
4. `expo-sharing` abre el share sheet nativo (WhatsApp, email, Telegram, etc.).
5. La URI del archivo generado se guarda en `Quote.imageUri`.

**Diseño de la imagen:**
- Header: logo "EmprendePlus" + fecha
- Tabla con: servicio, cantidad, precio unitario USD, subtotal USD
- Totales: USD y VES con tasa aplicada
- Footer: nombre del cliente, notas, tasa BCV + fuente
- Colores: blanco/gris oscuro con acento índigo (profesional, imprimible)

**Edge cases:**
- Error al capturar la imagen: mostrar alerta con reintentar
- Usuario cancela el share: no persiste imageUri
- Cotización sin items (no debería ocurrir): mostrar error

### Componentes necesarios
- `src/components/shared/QuoteImage.tsx` — Layout visual optimizado para captura
- `src/hooks/useExportQuote.ts` — Lógica de captura + share

### Store
- No necesita store nuevo. Usa `Quote` directamente desde el store de F03.

### Persistencia
- **SQLite**: se actualiza `Quote.imageUri` después de exportar exitosamente

### Scorecard de Validación
- [ ] La imagen se genera con todos los datos de la cotización
- [ ] El share sheet se abre con la imagen PNG
- [ ] `imageUri` se persiste en la cotización tras compartir
- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] Tests unitarios con cobertura >70%
