import { TextInput, Text, View } from 'react-native';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  multiline?: boolean;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  multiline,
}: InputProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={error ?? undefined}
        className={`border rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ${
          error ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
        }`}
        style={{ minHeight: multiline ? 80 : undefined }}
      />
      {error && (
        <Text className="text-red-500 dark:text-red-400 text-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
