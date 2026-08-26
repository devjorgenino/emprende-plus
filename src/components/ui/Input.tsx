import { TextInput, Text, View } from 'react-native';
import { colors } from '../../constants/colors';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  multiline?: boolean;
}

export function Input({ label, value, onChangeText, placeholder, error, keyboardType = 'default', multiline }: InputProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        className={`border rounded-lg px-4 py-3 text-base text-gray-900 bg-white ${error ? 'border-red-500' : 'border-gray-200'}`}
        placeholderTextColor={colors.textSecondary}
        style={{ minHeight: multiline ? 80 : undefined }}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
