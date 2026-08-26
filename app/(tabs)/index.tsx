import { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useServiceStore } from '../../src/store/service.store';
import { useSaleStore } from '../../src/store/sale.store';
import { useInventoryStore } from '../../src/store/inventory.store';
import { useExpenseStore } from '../../src/store/expense.store';
import { useDashboard, type Period } from '../../src/features/dashboard/useDashboard';
import type { Sale } from '../../src/types';
import { DashboardCard } from '../../src/components/shared/DashboardCard';
import { PeriodSelector } from '../../src/components/shared/PeriodSelector';
import { SaleItem } from '../../src/components/shared/SaleItem';
import { ExpenseItem } from '../../src/components/shared/ExpenseItem';
import { DoubleBarChart } from '../../src/components/shared/DoubleBarChart';
import { PieChart } from '../../src/components/shared/PieChart';
import { colors } from '../../src/constants/colors';
import { strings } from '../../src/constants/strings';

export default function DashboardScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [chartCurrency, setChartCurrency] = useState<'USD' | 'VES'>('USD');

  const loadServices = useServiceStore((s) => s.loadServices);
  const loadSales = useSaleStore((s) => s.loadSales);
  const loadInventory = useInventoryStore((s) => s.loadItems);
  const loadExpenses = useExpenseStore((s) => s.loadExpenses);
  const sales = useSaleStore((s) => s.sales);
  const expenses = useExpenseStore((s) => s.expenses);
  const inventoryItems = useInventoryStore((s) => s.items);
  const isLoadingServices = useServiceStore((s) => s.isLoading);
  const isLoadingSales = useSaleStore((s) => s.isLoading);
  const isLoadingInventory = useInventoryStore((s) => s.isLoading);
  const isLoadingExpenses = useExpenseStore((s) => s.isLoading);

  const data = useDashboard(period);
  const isLoading = isLoadingServices || isLoadingSales || isLoadingInventory || isLoadingExpenses;

  useEffect(() => {
    loadServices();
    loadSales();
    loadInventory();
    loadExpenses();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([loadServices(), loadSales(), loadInventory(), loadExpenses()]);
    setRefreshing(false);
  }

  const recentSales = sales.slice(0, 5);
  const recentExpenses = expenses.slice(0, 5);
  const lowStockItems = inventoryItems.filter((i) => i.quantity <= 1 && i.quantity > 0);

  const chartData = useMemo(() => {
    const months: { label: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth();
      const start = new Date(y, m, 1).getTime();
      const end = new Date(y, m + 1, 0, 23, 59, 59).getTime();

      const filterByDate = (items: Sale[]) =>
        items.filter((x) => {
          const t = new Date(x.createdAt).getTime();
          return t >= start && t <= end;
        });

      const income = filterByDate(sales).reduce(
        (sum, s) => sum + (chartCurrency === 'USD' ? s.totalUSD : s.totalVES),
        0
      );
      const expense = expenses
        .filter((e) => {
          const t = new Date(e.createdAt).getTime();
          return t >= start && t <= end;
        })
        .reduce(
          (sum, e) => sum + (chartCurrency === 'USD' ? e.amountUSD : e.amountVES),
          0
        );

      months.push({
        label: d.toLocaleDateString('es-VE', { month: 'short' }),
        income,
        expense,
      });
    }
    return months;
  }, [sales, expenses, chartCurrency]);

  const expensePieData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    const { start, end } = (() => {
      const now = new Date();
      const end = now.toISOString();
      switch (period) {
        case 'today': {
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          return { start: start.toISOString(), end };
        }
        case 'week': {
          const start = new Date(now);
          start.setDate(now.getDate() - now.getDay());
          start.setHours(0, 0, 0, 0);
          return { start: start.toISOString(), end };
        }
        case 'month': {
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          return { start: start.toISOString(), end };
        }
        default:
          return { start: new Date(0).toISOString(), end };
      }
    })();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    expenses
      .filter((e) => {
        const t = new Date(e.createdAt).getTime();
        return t >= startTime && t <= endTime;
      })
      .forEach((e) => {
        byCategory[e.category] = (byCategory[e.category] || 0) + (chartCurrency === 'USD' ? e.amountUSD : e.amountVES);
      });

    const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];
    return Object.entries(byCategory)
      .map(([label, value], idx) => ({ label, value, color: PIE_COLORS[idx % PIE_COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, period, chartCurrency]);

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
    >
      <View className="p-4">
        <PeriodSelector selected={period} onChange={setPeriod} />

        {isLoading && data.saleCount === 0 ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Grid de tarjetas */}
            <View className="flex-row flex-wrap">
              <View className="w-1/2 pr-2 mb-2">
                <DashboardCard
                  icon="trending-up"
                  label="Ingresos USD"
                  value={`$${data.totalIncomeUSD.toFixed(2)}`}
                  color="#6366F1"
                />
              </View>
              <View className="w-1/2 pl-2 mb-2">
                <DashboardCard
                  icon="trending-up"
                  label="Ingresos Bs."
                  value={`Bs. ${data.totalIncomeVES.toFixed(2)}`}
                  color="#6366F1"
                />
              </View>
              <View className="w-1/2 pr-2 mb-2">
                <DashboardCard
                  icon="cart"
                  label="Egresos USD"
                  value={`$${data.totalExpensesUSD.toFixed(2)}`}
                  color="#EF4444"
                />
              </View>
              <View className="w-1/2 pl-2 mb-2">
                <DashboardCard
                  icon="cart"
                  label="Egresos Bs."
                  value={`Bs. ${data.totalExpensesVES.toFixed(2)}`}
                  color="#EF4444"
                />
              </View>
              <View className="w-1/2 pr-2 mb-2">
                <DashboardCard
                  icon="calculator"
                  label="Ganancia Neta USD"
                  value={`$${data.netIncomeUSD.toFixed(2)}`}
                  color={data.netIncomeUSD >= 0 ? '#10B981' : '#EF4444'}
                />
              </View>
              <View className="w-1/2 pl-2 mb-2">
                <DashboardCard
                  icon="cube"
                  label="Items Inventario"
                  value={String(data.inventoryItemsCount)}
                  color="#F59E0B"
                />
              </View>
            </View>

            {/* Selector de moneda para gráficos */}
            <View className="flex-row items-center justify-end gap-2 mb-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400">Gráfico en:</Text>
              <TouchableOpacity
                onPress={() => setChartCurrency('USD')}
                className={`px-2.5 py-1 rounded-full ${chartCurrency === 'USD' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
              >
                <Text className={`text-xs font-medium ${chartCurrency === 'USD' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  USD
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChartCurrency('VES')}
                className={`px-2.5 py-1 rounded-full ${chartCurrency === 'VES' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
              >
                <Text className={`text-xs font-medium ${chartCurrency === 'VES' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  Bs.
                </Text>
              </TouchableOpacity>
            </View>

            {/* Gráfico de doble barra */}
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
              <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Ingresos vs Egresos (6 meses)
              </Text>
              <DoubleBarChart
                data={chartData}
                prefix={chartCurrency === 'USD' ? '$' : 'Bs. '}
              />
            </View>

            {/* Gráfico circular de gastos por categoría */}
            {expensePieData.length > 0 && (
              <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
                <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Gastos por Categoría
                </Text>
                <PieChart data={expensePieData} prefix={chartCurrency === 'USD' ? '$' : 'Bs. '} />
              </View>
            )}

            {/* Stock bajo */}
            {lowStockItems.length > 0 && (
              <View className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4 mb-4 border border-amber-200 dark:border-amber-800">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="alert-circle" size={18} color="#F59E0B" />
                  <Text className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Stock bajo ({lowStockItems.length})
                  </Text>
                </View>
                {lowStockItems.slice(0, 3).map((item) => (
                  <Text key={item.id} className="text-sm text-amber-700 dark:text-amber-300 ml-1">
                    • {item.name}: {item.quantity} {item.unit}
                  </Text>
                ))}
                {lowStockItems.length > 3 && (
                  <Text className="text-xs text-amber-600 dark:text-amber-400 mt-1 ml-1">
                    +{lowStockItems.length - 3} más
                  </Text>
                )}
              </View>
            )}

            {/* Últimas ventas */}
            {recentSales.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">Últimas ventas</Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/sales')}>
                    <Text className="text-sm text-indigo-600 dark:text-indigo-400">Ver más</Text>
                  </TouchableOpacity>
                </View>
                {recentSales.map((sale) => (
                  <SaleItem
                    key={sale.id}
                    sale={sale}
                    onPress={() => router.push(`/sales/${sale.id}`)}
                  />
                ))}
              </View>
            )}

            {/* Últimos egresos */}
            {recentExpenses.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">Últimos egresos</Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/expenses')}>
                    <Text className="text-sm text-indigo-600 dark:text-indigo-400">Ver más</Text>
                  </TouchableOpacity>
                </View>
                {recentExpenses.map((expense) => (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    onPress={() => router.push(`/expenses/${expense.id}`)}
                  />
                ))}
              </View>
            )}

            {data.saleCount === 0 && data.expenseCount === 0 && (
              <View className="py-8 items-center">
                <Ionicons name="bar-chart-outline" size={48} color={colors.border} />
                <Text className="text-gray-400 dark:text-gray-500 text-base mt-2">Sin datos en este período</Text>
                <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  Registra ventas y egresos para ver tu resumen
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}