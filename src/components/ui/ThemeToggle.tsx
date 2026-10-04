import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/theme.store';
import { useThemeColors } from '../../hooks/useThemeColors';
import { strings } from '../../constants/strings';

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const c = useThemeColors();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={
        theme === 'dark' ? strings.lightMode : strings.darkMode
      }
      accessibilityState={{ selected: theme === 'dark' }}
      className="flex-row items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full"
    >
      <Ionicons
        name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'}
        size={18}
        color={c.primary}
      />
      <Text className="text-xs font-medium ml-1.5 text-gray-700 dark:text-gray-300">
        {theme === 'dark' ? strings.lightMode : strings.darkMode}
      </Text>
    </TouchableOpacity>
  );
}
