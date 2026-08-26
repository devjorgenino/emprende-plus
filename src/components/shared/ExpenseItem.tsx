import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { colors } from '../../constants/colors';
import { strings } from '../../constants/strings';
import type { Expense } from '../../types';

interface ExpenseItemProps {
  expense: Expense;
  onPress?: () => void;
}

const PAYMENT_LABELS: Record<string, string> = {
  usd_cash: strings.paymentUsdCashShort,
  ves_cash: strings.paymentVesCashShort,
  pago_movil: strings.paymentPagoMovil,
  kontigo: strings.paymentKontigo,
  binance: strings.paymentBinance,
  transfer_ves: strings.paymentTransferShort,
  other: strings.paymentOther,
};

export function ExpenseItem({ expense, onPress }: ExpenseItemProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card className="mb-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-base font-medium text-gray-900 dark:text-white">{expense.description}</Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Badge label={expense.category} variant="primary" />
              <Badge label={PAYMENT_LABELS[expense.paymentMethod] ?? expense.paymentMethod} variant="secondary" />
            </View>
            {expense.supplier && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="business-outline" size={12} color={colors.textSecondary} />
                <Text className="text-xs text-gray-500 ml-1">{expense.supplier}</Text>
              </View>
            )}
          </View>
          <View className="items-end">
            <Text className="text-base font-bold text-red-600">- ${expense.amountUSD.toFixed(2)}</Text>
            <Text className="text-xs text-gray-500">Bs. {expense.amountVES.toFixed(2)}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
