import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useThemeColors } from '../../hooks/useThemeColors';
import { strings } from '../../constants/strings';
import type { InventoryItem as InventoryItemType } from '../../types';

interface InventoryItemProps {
  item: InventoryItemType;
  onEdit: () => void;
  onDelete: () => void;
}

export function InventoryItem({ item, onEdit, onDelete }: InventoryItemProps) {
  const isLowStock = item.lowStockThreshold && item.quantity <= item.lowStockThreshold;
  const c = useThemeColors();

  return (
    <Card className="mb-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">{item.name}</Text>
            {isLowStock && (
              <View className="bg-red-100 dark:bg-red-900/40 rounded-full px-2 py-0.5">
                <Text className="text-[11px] font-semibold text-red-600 dark:text-red-400">{strings.lowStock}</Text>
              </View>
            )}
          </View>
          {item.description && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1" numberOfLines={2}>{item.description}</Text>
          )}
          <View className="flex-row items-center gap-2 mt-2">
            <Badge label={item.category} variant="primary" />
            <Text className="text-xs text-gray-400 dark:text-gray-500">{item.unit}</Text>
          </View>
          {item.supplier && (
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">{strings.supplierPrefix}{item.supplier}</Text>
          )}
          {item.lowStockThreshold && (
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {strings.alertPrefix}{item.lowStockThreshold} {item.unit}
            </Text>
          )}
        </View>
        <View className="items-end">
          <Text className={`text-lg font-bold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {item.quantity} {item.unit}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">${item.purchasePriceUSD.toFixed(2)}</Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500">Bs. {item.purchasePriceVES.toFixed(2)}</Text>
        </View>
      </View>
      <View className="flex-row justify-end gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <TouchableOpacity onPress={onEdit} accessibilityRole="button" accessibilityLabel={`${strings.edit} ${item.name}`} className="flex-row items-center gap-1">
          <Ionicons name="create-outline" size={16} color={c.primary} />
          <Text className="text-indigo-600 dark:text-indigo-400 text-sm">{strings.edit}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} accessibilityRole="button" accessibilityLabel={`${strings.delete} ${item.name}`} className="flex-row items-center gap-1">
          <Ionicons name="trash-outline" size={16} color={c.error} />
          <Text className="text-red-500 dark:text-red-400 text-sm">{strings.delete}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}
