import { TouchableOpacity, Text, type ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  className?: string;
}

const variantStyles: Record<string, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  danger: { backgroundColor: colors.error },
  ghost: { backgroundColor: 'transparent' },
};

const textVariants: Record<string, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  danger: 'text-white',
  ghost: 'text-indigo-600',
};

export function Button({ title, onPress, variant = 'primary', disabled, className = '' }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`py-3 px-6 rounded-lg items-center justify-center ${disabled ? 'opacity-50' : ''} ${className}`}
      style={variantStyles[variant]}
    >
      <Text className={`font-semibold text-base ${textVariants[variant]}`}>{title}</Text>
    </TouchableOpacity>
  );
}
