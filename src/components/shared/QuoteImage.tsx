import { View, Text } from 'react-native';
import { strings } from '../../constants/strings';
import type { Quote } from '../../types';

interface QuoteImageProps {
  quote: Quote;
}

export function QuoteImage({ quote }: QuoteImageProps) {
  return (
    <View className="bg-white p-6" style={{ width: 390 }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <View>
          <Text className="text-2xl font-bold text-indigo-600">{strings.appName}</Text>
          <Text className="text-xs text-gray-400 mt-1">{strings.quoteTitle}</Text>
        </View>
        <Text className="text-sm text-gray-500">{new Date(quote.createdAt).toLocaleDateString('es-VE')}</Text>
      </View>

      {/* Client */}
      {quote.clientName && (
        <Text className="text-base font-medium text-gray-900 mb-4">{strings.clientPrefix}{quote.clientName}</Text>
      )}

      {/* Items Table */}
      <View className="mb-4">
        <View className="flex-row pb-2 border-b border-gray-200 mb-2">
          <Text className="flex-[3] text-xs font-semibold text-gray-500 uppercase">{strings.serviceColumn}</Text>
          <Text className="flex-1 text-xs font-semibold text-gray-500 uppercase text-center">{strings.quantityColumn}</Text>
          <Text className="flex-1 text-xs font-semibold text-gray-500 uppercase text-right">{strings.priceColumn}</Text>
          <Text className="flex-1 text-xs font-semibold text-gray-500 uppercase text-right">{strings.subtotalColumn}</Text>
        </View>
        {quote.items.map((item, idx) => (
          <View key={idx} className="flex-row py-2 border-b border-gray-100">
            <Text className="flex-[3] text-sm text-gray-900">{item.serviceName}</Text>
            <Text className="flex-1 text-sm text-gray-900 text-center">{item.quantity}</Text>
            <Text className="flex-1 text-sm text-gray-900 text-right">${item.priceUSD.toFixed(2)}</Text>
            <Text className="flex-1 text-sm text-gray-900 text-right">${item.subtotalUSD.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View className="bg-gray-50 p-4 rounded-lg mb-4">
        <View className="flex-row justify-between mb-1">
          <Text className="text-base text-gray-600">{strings.totalUSDLabel}</Text>
          <Text className="text-base font-bold text-gray-900">${quote.totalUSD.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-base text-gray-600">{strings.totalVESLabel}</Text>
          <Text className="text-base font-bold text-gray-900">Bs. {quote.totalVES.toFixed(2)}</Text>
        </View>
      </View>

      {/* Exchange Rate + Notes */}
      <View className="mb-4">
        <Text className="text-xs text-gray-400">
          {strings.rateBcvLabel} {quote.exchangeRate.toFixed(2)} ({new Date(quote.exchangeRateDate).toLocaleDateString('es-VE')})
        </Text>
        {quote.notes && (
          <Text className="text-xs text-gray-500 mt-2 italic">{strings.notesPrefix}{quote.notes}</Text>
        )}
      </View>

      {/* Footer */}
      <View className="pt-4 border-t border-gray-200 items-center">
        <Text className="text-xs text-gray-400">{strings.generatedBy} {strings.appName}</Text>
      </View>
    </View>
  );
}
