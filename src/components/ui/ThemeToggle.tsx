import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/theme.store';
import { useThemeColors } from '../../hooks/useThemeColors';

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const c = useThemeColors();

  return (
    <TouchableOpacity onPress={toggleTheme} className="p-1">
      <Ionicons
        name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'}
        size={20}
        color={c.textSecondary}
      />
    </TouchableOpacity>
  );
}
