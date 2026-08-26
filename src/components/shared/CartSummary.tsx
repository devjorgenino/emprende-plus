import { View, Text } from 'react-native';

interface CartSummaryProps {
  totalUSD: number;
  totalVES: number;
  itemCount: number;
}

export function CartSummary({ totalUSD, totalVES, itemCount }: CartSummaryProps) {
  return (
    <View className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-sm text-gray-500 dark:text-gray-400">{itemCount} servicio{itemCount !== 1 ? 's' : ''}</Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">${totalUSD.toFixed(2)}</Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">Bs. {totalVES.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}