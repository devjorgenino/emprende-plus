# Spec: Cambio de nombre y logo de la aplicación — F999

## Objetivo
Reemplazar el nombre actual "EmprendePlus" por "Emprende+" y mejorar el icono y logo de la aplicación para lograr una apariencia más profesional y coherente con la nueva identidad.

## Pantallas / Vistas
- app/_layout.tsx (root layout)
- app/(tabs)/_layout.tsx (bottom tab navigator)
- Todos los screens que contengan texto de la app, iconos o logotipo.

## Dependencias nuevas
- Ninguna; se usan los recursos existentes (expo‑vector‑icons, react‑native‑view‑shot, expo‑sharing).

## Schema SQLite
- No se crea ni modifica ninguna tabla, solo se actualizan iconos y recursos estáticos.

## Comportamiento esperado

**Flujo feliz:**
- El texto “EmprendePlus” y cualquier referencia escrita vuelve a “Emprende+”.
- El icono de la app, ubicado en `app/icon.png` y en los manifiestos/`app.json`, refleja la nueva marca.
- El logo (versión PNG) se genera con `react‑native‑view‑shot` y el estilo aplica la nueva tipografía y colores.
- Los tests que verifican títulos, nombres de assets y presencia de iconos pasan.

**Edge cases a manejar:**
- Refugiar la referencia a “EmprendePlus” en comentarios o strings no críticos que puedan romper la aplicación.
- Evitar cambios inesperados en el `bundleId` o `android:icon` que provoquen errores de compilación.

## Componentes necesarios
- **src/components/brand/Logo.tsx** – se actualiza para usar la nueva imagen de logo.
- **src/constants/strings.ts** – actualiza `appName` a "Emprende+".
- **app/_layout.tsx** y **app/(tabs)/_layout.tsx** – actualizan el título de la pantalla y el icono.
- **app.json** – actualiza `name`, `slug`, `android { icon }`, `ios { icon }`.
- **README.md** y **AGENTS.md** – actualizan la referencia al nombre de la app.

## Estado (Zustand store)
- No se modifica la lógica; solo los strings estáticos.

## Persistencia
- No se guarda nada en MMKV o SQLite.

## API / Servicios externos
- No hay llamadas externas.

## Validaciones (Zod schema)
- No necesita validación de datos nuevos.

## Scorecard de Validación
- [ ] El título de la app en la UI muestra "Emprende+" en todos los screens.
- [ ] El icono en los sistemas iOS/Android se actualiza a la versión nueva.
- [ ] El logo renderizado aparece con el nuevo estilo.
- [ ] Todos los tests de la aplicación (si existen) siguen pasando.
- [ ] No quedan referencias obsoletas a "EmprendePlus" en archivos importantes.
- [ ] La `README.md` y `AGENTS.md` reflejan la nueva marca.
- [ ] El proyecto compila sin errores (tsc --noEmit).
- [ ] La generación de `app.json` no rompe el `expo build`.
