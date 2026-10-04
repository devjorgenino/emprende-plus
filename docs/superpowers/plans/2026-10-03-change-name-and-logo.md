# Cambio de nombre y logo de la aplicación Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the application from "EmprendePlus" to "Emprende+" and update the icon and logo to reflect the new brand.

**Architecture:** Update string constants, app configuration, layout components, and branding assets to consistently use the new name and visual identity.

**Tech Stack:** React Native, Expo, TypeScript, NativeWind, Expo Vector Icons

**Spec:** docs/superpowers/specs/2026-10-03-change-name-and-logo-design.md

## Global Constraints
- TypeScript estricto siempre — `tsc --noEmit` debe pasar sin errores
- Nunca hardcodear strings en componentes — usar constantes en `src/constants/strings.ts`
- Mantener la estructura de directorios existente
- No cambiar el stack técnico sin revisar la Constitution

## Review Focus
- Referencias obsoletas a "EmprendePlus" en código y configuración
- Consistencia del nombre "Emprende+" en toda la aplicación
- Correctitud del icono y logo en los manifiestos de la app
- Pasar todas las pruebas existentes
- Compilación exitosa para iOS y Android

---
### Task 1: Actualizar constante de nombre de la app

**Files:**
- Modify: `src/constants/strings.ts`

**Interfaces:**
- Consumes: Ninguno
- Produces: `appName` constante actualizada a "Emprende+"

- [ ] **Step 1: Escribir prueba que falle** (opcional, ya que es una constante)
  - No se requiere prueba para constantes simples, pero verificaremos en el build

- [ ] **Step 2: Modificar la constante**
  ```typescript
  export const appName = "Emprende+";
  ```

- [ ] **Step 3: Verificar que el cambio no rompe el TypeScript**
  - Ejecutar: `npx tsc --noEmit`

- [ ] **Step 4: Commit**
  ```bash
  git add src/constants/strings.ts
  git commit -m "feat: update app name constant to Emprende+"
  ```

### Task 2: Actualizar app.json con nuevo nombre y configuración de icono

**Files:**
- Modify: `app.json`

**Interfaces:**
- Consumes: Ninguno
- Produces: `app.json` con nombre actualizado y configuración de icono

- [ ] **Step 1: Actualizar los campos name y slug**
  ```json
  {
    "name": "Emprende+",
    "slug": "emprende-plus",
    // ... resto de la configuración
  }
  ```

- [ ] **Step 2: Actualizar la configuración de icono para Android e iOS**
  - Vamos a usar un vector icon de Ionicons (ya disponible en el proyecto) o mantener el existente pero asegurar que refleje la nueva marca.
  - Por ahora, mantendremos el mismo icono pero verificaremos que la referencia sea correcta.
  - Si se requiere un nuevo icono, se colocará en `assets/icon.png` y se referirá desde aquí.
  - Como no se especifica un nuevo diseño de icono, asumimos que usaremos el mismo pero con el nombre actualizado en la cadena.

  ```json
  "icon": "./assets/icon.png",
  ```

  (O si usamos un vector icon desde el código, no se necesita cambiar aquí, pero dejaremos el campo como está.)

- [ ] **Step 3: Validar que el JSON es sintácticamente correcto**
  - Usar `jsonlint app.json` o simplemente intentar leerlo con Node.

- [ ] **Step 4: Commit**
  ```bash
  git add app.json
  git commit -m "feat: update app.json with new name and icon configuration"
  ```

### Task 3: Actualizar el layout raíz y el layout de tabs para usar el nuevo nombre

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `app/(tabs)/_layout.tsx`

**Interfaces:**
- Consumes: `appName` desde `src/constants/strings.ts`
- Produces: Layouts que muestran el nuevo nombre en la barra de título o en el header

- [ ] **Step 1: Importar la constante de nombre de la app**
  ```typescript
  import { appName } from '@/constants/strings';
  ```

- [ ] **Step 2: Reemplazar cualquier texto hardcodeado "EmprendePlus" por {appName}**
  - En `_layout.tsx` y `(tabs)/_layout.tsx`, buscar y reemplazar.

- [ ] **Step 3: Verificar que el icono de la app (si se muestra en el layout) se actualice correctamente**
  - Si el layout usa un componente que muestra el icono de la app, asegúrate de que refleje el nuevo asset o vector icon.

- [ ] **Step 4: Ejecutar pruebas rápidas de lint y TypeScript**
  - `npm run lint` (si existe) y `npx tsc --noEmit`

- [ ] **Step 5: Commit**
  ```bash
  git add app/_layout.tsx app/(tabs)/_layout.tsx
  git commit -m "feat: update layouts to use new app name"
  ```

### Task 4: Actualizar el componente Logo para reflejar la nueva marca

**Files:**
- Modify: `src/components/brand/Logo.tsx`

**Interfaces:**
- Consumes: Ninguno (pero puede usar la constante de nombre o estilos actualizados)
- Produces: Logo component que muestra el nuevo nombre o estilo

- [ ] **Step 1: Revisar el componente Logo.tsx**
  - Si el componente muestra texto, reemplazar "EmprendePlus" por "Emprende+".
  - Si muestra una imagen, asegurarse de que la imagen refleje la nueva marca (puede requerir un nuevo asset).

- [ ] **Step 2: Actualizar el texto o la imagen**
  - Opción A (texto): Cambiar el contenido a "Emprende+".
  - Opción B (imagen): Si se tiene un nuevo logo, colocarlo en `assets/logo.png` y actualizar la referencia.

- [ ] **Step 3: Aplicar estilos de marca (colores, tipografía) si es necesario**
  - Verificar que el uso de NativeWind y los constants de color estén actualizados (no cambiamos los constants en este feature, pero asegurarnos de que se usan correctamente).

- [ ] **Step 4: Ejecutar pruebas del componente (si existen)**
  - Si hay tests para Logo.tsx, asegurarse de que pasen.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/brand/Logo.tsx
  git commit -m "feat: update Logo component for new branding"
  ```

### Task 5: Actualizar documentación y archivos varios

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- (Opcional) Modify: cualquier otro archivo que mencione el nombre antiguo

**Interfaces:**
- Consumes: Ninguno
- Produces: Documentación actualizada con el nuevo nombre

- [ ] **Step 1: Reemplazar "EmprendePlus" por "Emprende+" en README.md y AGENTS.md**
  - Usar búsqueda y reemplazo cuidadoso para no romper enlaces o código de ejemplo.

- [ ] **Step 2: Verificar que no queden referencias obsoletas en archivos de configuración o scripts**
  - Buscar en el proyecto: `grep -r "EmprendePlus" . --exclude-dir=.git`
  - Reemplazar las ocurrencias que no sean parte de comentarios o documentación que se quiera mantener (pero en este caso, queremos cambiar todas las referencias visibles).

- [ ] **Step 3: Commit**
  ```bash
  git add README.md AGENTS.md
  git commit -m "docs: update documentation with new app name"
  ```

### Task 6: Ejecutar pruebas y verificar la compilación

**Files:**
- (Ninguna modificación, solo verificaciones)

**Interfaces:**
- Consumes: Todo el código modificado
- Produces: Estado verificado de la aplicación

- [ ] **Step 1: Ejecutar pruebas unitarias (si existen)**
  - `npm test` o `yarn test`

- [ ] **Step 2: Ejecutar lint para asegurar calidad de código**
  - `npm run lint` (o el comando configurado en package.json)

- [ ] **Step 3: Verificar que TypeScript compile sin errores**
  - `npx tsc --noEmit`

- [ ] **Step 4: Intentar construir el proyecto para iOS y Android (simulado)**
  - Para Expo, podemos intentar: `expo prebuild` para verificar que los archivos de configuración son correctos.
  - O simplemente: `expo export:web` para asegurar que el bundle se puede generar.

- [ ] **Step 5: Commit de cualquier ajuste menor proveniente de la verificación**
  ```bash
  git add -u
  git commit -m "chore: minor fixes from verification"
  ```

### Task 7: Revisión final y preparación para release

**Files:**
- (Ninguna modificación, solo revisión)

**Interfaces:**
- Consumes: Todo el trabajo realizado
- Produces: Aplicación lista con nuevo nombre y branding

- [ ] **Step 1: Revisar que el scorecard de la spec esté completo**
  - Verificar cada ítem del scorecard en la spec.

- [ ] **Step 2: Crear una nota de release o changelog (opcional)**
  - Actualizar CHANGELOG.md si existe.

- [ ] **Step 3: Commit final**
  ```bash
  git add -u
  git commit -m "feat: rename app to Emprende+ and update branding"
  ```
