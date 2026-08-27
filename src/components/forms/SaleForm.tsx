import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from '../ui/Button';
import { strings } from '../../constants/strings';
import type { PaymentMethod } from '../../types';

const PAYMENT_METHODS: { key: PaymentMethod; label: string }[] = [
  { key: 'usd_cash', label: strings.paymentUsdCash },
  { key: 'ves_cash', label: strings.paymentVesCash },
  { key: 'pago_movil', label: strings.paymentPagoMovil },
  { key: 'kontigo', label: strings.paymentKontigo },
  { key: 'binance', label: strings.paymentBinance },
  { key: 'transfer_ves', label: strings.paymentTransferVesFull },
  { key: 'other', label: strings.paymentOther },
];

interface SaleFormProps {
  totalUSD: number;
  totalVES: number;
  onConfirm: (paymentMethod: PaymentMethod) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function SaleForm({ totalUSD, totalVES, onConfirm, onCancel, isSubmitting }: SaleFormProps) {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    if (!selected) {
      setError(strings.selectPaymentMethod);
      return;
    }
    onConfirm(selected);
  }

  return (
    <View className="p-4">
      <Text className="text-lg font-bold text-gray-900 mb-2">{strings.registerSale}</Text>
      <Text className="text-sm text-gray-500 mb-4">
        {strings.confirmSaleAmount} ${totalUSD.toFixed(2)} (Bs. {totalVES.toFixed(2)})
      </Text>

      <Text className="text-sm font-medium text-gray-700 mb-3">{strings.paymentMethod}</Text>
      <View className="gap-2 mb-6">
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.key}
            onPress={() => { setSelected(method.key); setError(null); }}
            className={`p-3 rounded-lg border ${
              selected === method.key
                ? 'bg-indigo-50 border-indigo-500'
                : 'bg-white border-gray-200'
            }`}
          >
            <Text className={`text-base ${
              selected === method.key ? 'text-indigo-700 font-medium' : 'text-gray-700'
            }`}>
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && <Text className="text-red-500 text-sm mb-4">{error}</Text>}

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button title={strings.cancel} onPress={onCancel} variant="ghost" />
        </View>
        <View className="flex-1">
          <Button title={strings.confirmSale} onPress={handleConfirm} disabled={isSubmitting} variant="primary" />
        </View>
      </View>
    </View>
  );
}
