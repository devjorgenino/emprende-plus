import { TouchableOpacity, Text, type ViewStyle } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  className?: string;
}

const textVariants: Record<string, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  danger: 'text-white',
  ghost: 'text-indigo-600 dark:text-indigo-400',
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  className = '',
}: ButtonProps) {
  const c = useThemeColors();

  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: c.primary },
    secondary: { backgroundColor: c.secondary },
    danger: { backgroundColor: c.error },
    ghost: { backgroundColor: 'transparent' },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled ?? false }}
      className={`py-3 px-6 rounded-lg items-center justify-center ${disabled ? 'opacity-50' : ''} ${className}`}
      style={variantStyles[variant]}
    >
      <Text className={`font-semibold text-base ${textVariants[variant]}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
