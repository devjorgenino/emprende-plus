import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initializeDatabase } from '../src/services/db/schema';
import { runMigrations } from '../src/services/db/migrations';
import { RateProvider } from '../src/components/shared/RateProvider';
import { ThemeProvider } from '../src/components/shared/ThemeProvider';
import { ToastProvider } from '../src/components/shared/ToastProvider';
import { useThemeStore } from '../src/store/theme.store';
import '../src/styles.css';

function StatusBarHandler() {
  const theme = useThemeStore((s) => s.theme);
  return <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase();
    runMigrations();
  }, []);

  return (
    <ThemeProvider>
      <RateProvider>
        <StatusBarHandler />
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="services/index" options={{ headerShown: true }} />
            <Stack.Screen name="services/[id]" options={{ headerShown: true }} />
            <Stack.Screen name="quotes/[id]" options={{ headerShown: true }} />
            <Stack.Screen name="sales/[id]" options={{ headerShown: true }} />
            <Stack.Screen name="inventory/[id]" options={{ headerShown: true }} />
            <Stack.Screen name="expenses/[id]" options={{ headerShown: true }} />
            <Stack.Screen name="expenses/new" options={{ headerShown: true }} />
            <Stack.Screen name="clients/[id]" options={{ headerShown: true }} />
          </Stack>
        </ToastProvider>
      </RateProvider>
    </ThemeProvider>
  );
}
