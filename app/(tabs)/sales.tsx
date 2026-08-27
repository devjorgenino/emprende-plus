import { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSaleStore } from '../../src/store/sale.store';
import { SaleItem } from '../../src/components/shared/SaleItem';
import { SalesSummary } from '../../src/components/shared/SalesSummary';
import { DateRangeFilter } from '../../src/components/shared/DateRangeFilter';
import { colors } from '../../src/constants/colors';
import { strings } from '../../src/constants/strings';
import { exportSalesToCSV } from '../../src/utils/csv';
import type { Sale, PaymentMethod } from '../../src/types';

const PAYMENT_FILTERS: { key: PaymentMethod | 'all'; label: string }[] = [
  { key: 'all', label: strings.all },
  { key: 'usd_cash', label: strings.paymentUSD },
  { key: 'ves_cash', label: strings.paymentVES },
  { key: 'pago_movil', label: strings.paymentPagoMovil },
  { key: 'kontigo', label: strings.paymentKontigo },
  { key: 'binance', label: strings.paymentBinance },
  { key: 'transfer_ves', label: strings.paymentTransferVES },
  { key: 'other', label: strings.paymentOther },
];

export default function SalesScreen() {
  const router = useRouter();
  const sales = useSaleStore((s) => s.sales);
  const isLoading = useSaleStore((s) => s.isLoading);
  const loadSales = useSaleStore((s) => s.loadSales);
  const searchSales = useSaleStore((s) => s.searchSales);

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'all'>('all');
  const [clientFilter, setClientFilter] = useState<string | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(0).toISOString(),
    end: new Date().toISOString(),
  });

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Clientes más frecuentes (top 5) para filtro rápido
  const frequentClients = useMemo(() => {
    const counts = new Map<string, number>();
    sales.forEach((s) => {
      const name = (s.clientName ?? '').trim();
      if (!name) return;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
  }, [sales]);

  const filteredSales = useMemo(() => {
    let result: Sale[];
    if (searchQuery.trim()) {
      result = searchSales(searchQuery);
    } else {
      result = sales;
    }
    return result.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      if (paymentFilter !== 'all' && s.paymentMethod !== paymentFilter) return false;
      if (clientFilter !== 'all' && (s.clientName ?? '').trim() !== clientFilter) return false;
      return t >= new Date(dateRange.start).getTime() && t <= new Date(dateRange.end).getTime();
    });
  }, [sales, searchQuery, dateRange, paymentFilter, clientFilter, searchSales]);

  const totalUSD = filteredSales.reduce((sum, s) => sum + s.totalUSD, 0);
  const totalVES = filteredSales.reduce((sum, s) => sum + s.totalVES, 0);

  async function handleExport() {
    try {
      await exportSalesToCSV(filteredSales);
    } catch {
      Alert.alert(strings.errorTitle, strings.exportError);
    }
  }

  if (isLoading && sales.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">{strings.loading}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlatList
        data={filteredSales}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <SaleItem sale={item} onPress={() => router.push(`/sales/${item.id}`)} />
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="px-4">
            <SalesSummary totalUSD={totalUSD} totalVES={totalVES} saleCount={filteredSales.length} />
            <DateRangeFilter
              onPeriodChange={(start, end) => setDateRange({ start, end })}
            />
            <View className="relative mb-3">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={strings.searchClient}
                accessibilityLabel={strings.searchClient}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 pl-10 text-base text-gray-900 dark:text-gray-100"
                placeholderTextColor={colors.textSecondary}
              />
              <Ionicons name="search" size={18} color={colors.textSecondary} className="absolute left-3 top-3.5" />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityRole="button" accessibilityLabel={strings.cancel} className="absolute right-3 top-3">
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Filtro por método de pago */}
            <View className="flex-row flex-wrap gap-2 mb-3">
              {PAYMENT_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setPaymentFilter(f.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: paymentFilter === f.key }}
                  accessibilityLabel={f.label}
                  className={`px-3 py-1.5 rounded-full border ${paymentFilter === f.key ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'}`}
                >
                  <Text className={`text-xs font-medium ${paymentFilter === f.key ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filtro por cliente */}
            {frequentClients.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-3">
                <TouchableOpacity
                  onPress={() => setClientFilter('all')}
                  accessibilityRole="button"
                  accessibilityState={{ selected: clientFilter === 'all' }}
                  accessibilityLabel={strings.all}
                  className={`px-3 py-1.5 rounded-full border ${clientFilter === 'all' ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'}`}
                >
                  <Text className={`text-xs font-medium ${clientFilter === 'all' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    {strings.all}
                  </Text>
                </TouchableOpacity>
                {frequentClients.map((name) => (
                  <TouchableOpacity
                    key={name}
                    onPress={() => setClientFilter(clientFilter === name ? 'all' : name)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: clientFilter === name }}
                    accessibilityLabel={name}
                    className={`px-3 py-1.5 rounded-full border ${clientFilter === name ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'}`}
                  >
                    <Text className={`text-xs font-medium ${clientFilter === name ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      {name.length > 14 ? `${name.slice(0, 14)}…` : name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Botón exportar */}
            {filteredSales.length > 0 && (
              <TouchableOpacity
                onPress={handleExport}
                accessibilityRole="button"
                accessibilityLabel={strings.exportCSV}
                className="flex-row items-center justify-center mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5"
              >
                <Ionicons name="download-outline" size={18} color={colors.primary} />
                <Text className="text-indigo-600 dark:text-indigo-400 text-sm font-medium ml-2">{strings.exportCSV}</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-6">
            <Ionicons name="cash-outline" size={64} color={colors.border} />
            <Text className="text-gray-400 dark:text-gray-500 text-lg mt-4">{strings.emptySales}</Text>
            {searchQuery && <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">{strings.tryAnother}</Text>}
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadSales} tintColor={colors.primary} />
        }
      />
    </View>
  );
}
