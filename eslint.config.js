// ESLint flat config (v9) para Emprende+.
// Combina eslint-config-expo (React Native + Expo + TypeScript) con
// eslint-config-prettier (desactiva reglas de formato que maneja Prettier).
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = defineConfig([
  ...expoConfig,
  prettierConfig,
  {
    // Las reglas del "React Compiler" (react-hooks v7) marcan como error
    // patrones estándar de React Native: Animated via useRef(...).current,
    // Date.now() dentro de event handlers, y data-loading en useEffect.
    // Se bajan a warning para no bloquear el lint con falsos positivos.
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    ignores: [
      'node_modules/*',
      '.expo/*',
      '.pnpm-store/*',
      'dist/*',
      'android/*',
      'ios/*',
      'keystores/*',
      'assets/*',
      'graphify-out/*',
      'patches/*',
      'scripts/*',
      '.agents/*',
      '__mocks__/*',
      '*.config.js',
      'jest.setup.js',
    ],
  },
  {
    // Globals de Jest para los tests (describir/it/expect/jest, etc.)
    files: ['**/*.test.ts', '**/*.test.tsx', '__tests__/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]);
