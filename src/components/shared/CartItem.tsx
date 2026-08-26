import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { colors } from '../../constants/colors';
import type { QuoteItem } from '../../types';

interface CartItemProps {
  item: QuoteItem;
  exchangeRate: number | null;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function CartItem({ item, exchangeRate, onIncrement, onDecrement, onRemove }: CartItemProps) {
  const subtotalVES = exchangeRate ? item.subtotalUSD * exchangeRate : 0;

  return (
    <Card className="mb-2">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text className="text-base font-medium text-gray-900">{item.serviceName}</Text>
          <Text className="text-sm text-gray-500">${item.priceUSD.toFixed(2)} c/u</Text>
        </View>
        <TouchableOpacity onPress={onRemove}>
          <Ionicons name="close-circle" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={onDecrement} className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
            <Ionicons name="remove" size={18} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 min-w-[24px] text-center">{item.quantity}</Text>
          <TouchableOpacity onPress={onIncrement} className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
            <Ionicons name="add" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View className="items-end">
          <Text className="text-base font-semibold text-gray-900">${item.subtotalUSD.toFixed(2)}</Text>
          {exchangeRate && (
            <Text className="text-xs text-gray-500">Bs. {subtotalVES.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </Card>
  );
}
