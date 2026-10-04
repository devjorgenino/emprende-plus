import { View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { strings } from '../../constants/strings';

interface SalesSummaryProps {
  totalUSD: number;
  totalVES: number;
  saleCount: number;
}

export function SalesSummary({
  totalUSD,
  totalVES,
  saleCount,
}: SalesSummaryProps) {
  return (
    <View className="flex-row gap-3 mb-4">
      <Card className="flex-1">
        <Text className="text-xs text-gray-500 dark:text-gray-400 uppercase">
          {strings.totalUSDLabel}
        </Text>
        <Text className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
          ${totalUSD.toFixed(2)}
        </Text>
      </Card>
      <Card className="flex-1">
        <Text className="text-xs text-gray-500 dark:text-gray-400 uppercase">
          {strings.totalVESLabel}
        </Text>
        <Text className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
          Bs. {totalVES.toFixed(2)}
        </Text>
      </Card>
      <Card className="flex-1">
        <Text className="text-xs text-gray-500 dark:text-gray-400 uppercase">
          {strings.salesLabel}
        </Text>
        <Text className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
          {saleCount}
        </Text>
      </Card>
    </View>
  );
}
