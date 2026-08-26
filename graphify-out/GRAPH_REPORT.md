# Graph Report - emprende-plus  (2026-08-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 509 nodes · 978 edges · 48 communities (22 shown, 26 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `52b5ea85`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- colors.ts
- quotes/[id].tsx
- devDependencies
- useRateStore
- service.store.ts
- getDatabase
- paths
- types/index.ts
- Button.tsx
- expo
- client.repository.ts
- inventory.store.ts
- dependencies
- ErrorBoundary
- DateRangeFilter.tsx
- constants/index.ts
- plugins
- metro.config.js
- Toast.tsx
- expo
- expo-constants
- expo-crypto
- expo-file-system
- expo-linking
- @expo/metro-runtime
- expo-sharing
- expo-status-bar
- @expo/vector-icons
- @hookform/resolvers
- react
- react-dom
- react-hook-form
- react-native
- @react-native-async-storage/async-storage
- react-native-gesture-handler
- react-native-reanimated
- react-native-safe-area-context
- react-native-screens
- react-native-view-shot
- react-native-web
- react-native-worklets
- zod
- zustand
- css.d.ts

## God Nodes (most connected - your core abstractions)
1. `getDatabase()` - 40 edges
2. `colors` - 24 edges
3. `useServiceStore` - 21 edges
4. `generateId()` - 18 edges
5. `useRateStore` - 18 edges
6. `expo-router` - 16 edges
7. `useSaleStore` - 13 edges
8. `useExpenseStore` - 13 edges
9. `expo` - 13 edges
10. `Service` - 12 edges

## Surprising Connections (you probably didn't know these)
- `StatusBarHandler()` --calls--> `useThemeStore`  [EXTRACTED]
  app/_layout.tsx → src/store/theme.store.ts
- `ExpensesScreen()` --calls--> `useExpenseStore`  [EXTRACTED]
  app/(tabs)/expenses.tsx → src/store/expense.store.ts
- `SalesScreen()` --calls--> `useSaleStore`  [EXTRACTED]
  app/(tabs)/sales.tsx → src/store/sale.store.ts
- `QuoteDetailScreen()` --calls--> `useSaleStore`  [EXTRACTED]
  app/quotes/[id].tsx → src/store/sale.store.ts
- `CalculatorScreen()` --calls--> `useRateStore`  [EXTRACTED]
  app/(tabs)/calculator.tsx → src/store/rate.store.ts

## Import Cycles
- None detected.

## Communities (48 total, 26 thin omitted)

### Community 0 - "colors.ts"
Cohesion: 0.07
Nodes (33): ExpensesScreen(), handleExport(), PAYMENT_FILTERS, SalesScreen(), handleExport(), expo-router, CartSummaryProps, DashboardCard() (+25 more)

### Community 1 - "quotes/[id].tsx"
Cohesion: 0.07
Nodes (36): QuoteDetailScreen(), handleShare(), CalculatorScreen(), PAYMENT_METHODS, SaleForm(), SaleFormProps, CartItemProps, QuoteImage() (+28 more)

### Community 2 - "devDependencies"
Cohesion: 0.05
Nodes (42): @babel/core, eslint, jest, jest-expo, nativewind, devDependencies, @babel/core, eslint (+34 more)

### Community 3 - "useRateStore"
Cohesion: 0.08
Nodes (24): InventoryDetailScreen(), TabLayout(), RateIndicator(), RateProvider(), RateProviderProps, ThemeProvider(), ThemeProviderProps, ThemeToggle() (+16 more)

### Community 4 - "service.store.ts"
Cohesion: 0.11
Nodes (23): ServiceDetailScreen(), ServicesListScreen(), InventoryScreen(), ServiceItem(), ServiceItemProps, ServiceSelectorProps, Modal(), ModalProps (+15 more)

### Community 5 - "getDatabase"
Cohesion: 0.13
Nodes (23): RootLayout(), StatusBarHandler(), getDatabase(), MIGRATIONS, runMigrations(), createExpense(), deleteExpense(), getAllExpenses() (+15 more)

### Community 6 - "paths"
Cohesion: 0.07
Nodes (28): expo/tsconfig.base, nativewind-env.d.ts, src/components/*, src/constants/*, src/features/*, src/hooks/*, src/lib/*, src/services/* (+20 more)

### Community 7 - "types/index.ts"
Cohesion: 0.14
Nodes (18): ExpenseDetailScreen(), NewExpenseScreen(), CATEGORIES, ExpenseForm(), handleSubmit(), validate(), ExpenseFormProps, PAYMENT_METHODS (+10 more)

### Community 8 - "Button.tsx"
Cohesion: 0.11
Nodes (21): CATEGORIES, InventoryForm(), handlePickPhoto(), handleSubmit(), pickImage(), takePhoto(), validate(), InventoryFormProps (+13 more)

### Community 9 - "expo"
Cohesion: 0.08
Nodes (24): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, expo, android (+16 more)

### Community 10 - "client.repository.ts"
Cohesion: 0.15
Nodes (16): methodLabels, PAYMENT_METHODS, SaleDetailScreen(), parseDateFromSale(), startEdit(), ClientPicker(), handleCreate(), load() (+8 more)

### Community 11 - "inventory.store.ts"
Cohesion: 0.14
Nodes (18): DashboardScreen(), InventoryItemProps, PERIODS, PeriodSelector(), PeriodSelectorProps, DashboardData, getPeriodDates(), Period (+10 more)

### Community 12 - "dependencies"
Cohesion: 0.20
Nodes (10): date-fns, expo-image-picker, expo-splash-screen, dependencies, date-fns, expo-image-picker, expo-router, expo-splash-screen (+2 more)

### Community 13 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, Props, State

### Community 14 - "DateRangeFilter.tsx"
Cohesion: 0.40
Nodes (5): DateRangeFilter(), handlePeriod(), DateRangeFilterProps, getPeriodDates(), QuickPeriod

### Community 15 - "constants/index.ts"
Cohesion: 0.53
Nodes (3): spacing, borderRadius, typography

### Community 16 - "plugins"
Cohesion: 0.40
Nodes (5): plugins, expo-font, expo-sqlite, expo-font, expo-sqlite

### Community 17 - "metro.config.js"
Cohesion: 0.50
Nodes (3): config, { getDefaultConfig }, { withNativeWind }

## Knowledge Gaps
- **145 isolated node(s):** `ManualRateModalProps`, `DashboardCardProps`, `BarItem`, `SimpleBarChartProps`, `BadgeProps` (+140 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `expo-router` connect `colors.ts` to `quotes/[id].tsx`, `useRateStore`, `service.store.ts`, `getDatabase`, `types/index.ts`, `client.repository.ts`, `dependencies`, `plugins`?**
  _High betweenness centrality (0.330) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`, `plugins`, `expo`, `expo-constants`, `expo-crypto`, `expo-file-system`, `expo-linking`, `@expo/metro-runtime`, `expo-sharing`, `expo-status-bar`, `@expo/vector-icons`, `@hookform/resolvers`, `react`, `react-dom`, `react-hook-form`, `react-native`, `@react-native-async-storage/async-storage`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`, `react-native-view-shot`, `react-native-web`, `react-native-worklets`, `zod`, `zustand`?**
  _High betweenness centrality (0.308) - this node is a cross-community bridge._
- **Why does `expo-router` connect `dependencies` to `colors.ts`?**
  _High betweenness centrality (0.230) - this node is a cross-community bridge._
- **What connects `ManualRateModalProps`, `DashboardCardProps`, `BarItem` to the rest of the system?**
  _145 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `colors.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06836055656382335 - nodes in this community are weakly interconnected._
- **Should `quotes/[id].tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07039187227866474 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._