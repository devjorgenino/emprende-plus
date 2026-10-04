import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { strings } from '../../constants/strings';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { QuoteItem } from '../../types';

interface CartItemProps {
  item: QuoteItem;
  exchangeRate: number | null;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function CartItem({
  item,
  exchangeRate,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemProps) {
  const subtotalVES = exchangeRate ? item.subtotalUSD * exchangeRate : 0;
  const c = useThemeColors();

  return (
    <Card className="mb-2">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
            {item.serviceName}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            ${item.priceUSD.toFixed(2)} {strings.perUnit}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`${strings.delete} ${item.serviceName}`}
          className="p-1"
        >
          <Ionicons name="close-circle" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={onDecrement}
            accessibilityRole="button"
            accessibilityLabel={`${strings.delete} ${item.serviceName}`}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
          >
            <Ionicons name="remove" size={18} color={c.text} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 min-w-[24px] text-center">
            {item.quantity}
          </Text>
          <TouchableOpacity
            onPress={onIncrement}
            accessibilityRole="button"
            accessibilityLabel={`${strings.add} ${item.serviceName}`}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
          >
            <Ionicons name="add" size={18} color={c.text} />
          </TouchableOpacity>
        </View>
        <View className="items-end">
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
            ${item.subtotalUSD.toFixed(2)}
          </Text>
          {exchangeRate && (
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Bs. {subtotalVES.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
}
