import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'primary' | 'secondary';
}

const variantClasses: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-indigo-100 text-indigo-700',
  secondary: 'bg-emerald-100 text-emerald-700',
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const [bgClass, textClass] = variantClasses[variant].split(' ');
  return (
    <View className={`self-start px-3 py-1 rounded-full ${bgClass}`}>
      <Text className={`text-xs font-medium ${textClass}`}>{label}</Text>
    </View>
  );
}
