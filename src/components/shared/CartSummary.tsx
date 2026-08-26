import { View, Text } from 'react-native';
import { Card } from '../ui/Card';

interface CartSummaryProps {
  totalUSD: number;
  totalVES: number;
  itemCount: number;
}

export function CartSummary({ totalUSD, totalVES, itemCount }: CartSummaryProps) {
  return (
    <Card className="bg-indigo-50 border-indigo-200">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-sm text-gray-500">{itemCount} servicio{itemCount !== 1 ? 's' : ''}</Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-gray-900">${totalUSD.toFixed(2)}</Text>
          <Text className="text-sm text-gray-600">Bs. {totalVES.toFixed(2)}</Text>
        </View>
      </View>
    </Card>
  );
}
