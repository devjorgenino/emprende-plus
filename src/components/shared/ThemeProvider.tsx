import { useEffect, type ReactNode } from 'react';
import { Appearance } from 'react-native';
import { useThemeStore } from '../../store/theme.store';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const theme = useThemeStore((s) => s.theme);
  const isLoaded = useThemeStore((s) => s.isLoaded);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      Appearance.setColorScheme(theme);
    }
  }, [theme, isLoaded]);

  return <>{children}</>;
}
