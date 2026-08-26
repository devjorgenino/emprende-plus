import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'primary' | 'secondary';
}

const variantClasses: Record<string, string> = {
  default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  primary: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  secondary: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const classes = variantClasses[variant];
  return (
    <View className={`self-start px-3 py-1 rounded-full ${classes}`}>
      <Text className={`text-xs font-medium`}>{label}</Text>
    </View>
  );
}
