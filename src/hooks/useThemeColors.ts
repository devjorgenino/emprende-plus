import { useThemeStore } from '../store/theme.store';
import { colors, darkColors } from '../constants/colors';
import type { ColorKey } from '../constants/colors';

export function useThemeColors(): Record<ColorKey, string> {
  const theme = useThemeStore((s) => s.theme);
  return theme === 'dark' ? darkColors : colors;
}
