import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useThemeColors } from '../../hooks/useThemeColors';
import { strings } from '../../constants/strings';
import type { Sale } from '../../types';

const methodLabels: Record<string, string> = {
  usd_cash: strings.paymentUsdCash,
  ves_cash: strings.paymentVesCash,
  pago_movil: strings.paymentPagoMovil,
  kontigo: strings.paymentKontigo,
  binance: strings.paymentBinance,
  transfer_ves: strings.paymentTransferShort,
  other: strings.paymentOther,
};

interface SaleItemProps {
  sale: Sale;
  onPress: () => void;
}

export function SaleItem({ sale, onPress }: SaleItemProps) {
  const c = useThemeColors();
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button">
      <Card className="mb-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {sale.clientName || strings.clientNotSpecified}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Badge label={methodLabels[sale.paymentMethod] || sale.paymentMethod} variant="secondary" />
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(sale.createdAt).toLocaleDateString('es-VE')}
              </Text>
            </View>
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sale.items.length} servicio{sale.items.length !== 1 ? 's' : ''}</Text>
          </View>
          <View className="items-end">
            <Text className="text-base font-bold text-gray-900 dark:text-gray-100">${sale.totalUSD.toFixed(2)}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">Bs. {sale.totalVES.toFixed(2)}</Text>
          </View>
        </View>
        <View className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex-row justify-end">
          <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}
