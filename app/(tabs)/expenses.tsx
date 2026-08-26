import { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseStore } from '../../src/store/expense.store';
import { ExpenseItem } from '../../src/components/shared/ExpenseItem';
import { colors } from '../../src/constants/colors';
import { strings } from '../../src/constants/strings';
import { exportExpensesToCSV } from '../../src/utils/csv';

export default function ExpensesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const expenses = useExpenseStore((s) => s.expenses);
  const isLoading = useExpenseStore((s) => s.isLoading);
  const error = useExpenseStore((s) => s.error);
  const loadExpenses = useExpenseStore((s) => s.loadExpenses);

  useEffect(() => {
    loadExpenses();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  }

  // Categorías disponibles ordenadas por frecuencia de uso
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    expenses.forEach((e) => counts.set(e.category, (counts.get(e.category) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);
  }, [expenses]);

  const filtered = useMemo(() => {
    let result = expenses;
    if (searchQuery.trim()) {
      result = expenses.filter(
        (e) =>
          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter((e) => e.category === categoryFilter);
    }
    return result;
  }, [expenses, searchQuery, categoryFilter]);

  const totalUSD = filtered.reduce((sum, e) => sum + e.amountUSD, 0);
  const totalVES = filtered.reduce((sum, e) => sum + e.amountVES, 0);

  async function handleExport() {
    try {
      await exportExpensesToCSV(filtered);
    } catch {
      Alert.alert(strings.errorTitle, strings.exportError);
    }
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <View className="p-4">
          {isLoading && expenses.length === 0 ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="mt-4 text-gray-500">{strings.loadingExpenses}</Text>
            </View>
          ) : error && expenses.length === 0 ? (
            <View className="py-12 items-center">
              <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
              <Text className="text-red-500 text-base mt-2">{error}</Text>
              <TouchableOpacity onPress={loadExpenses} className="mt-4">
                <Text className="text-indigo-600 font-medium">{strings.retry}</Text>
              </TouchableOpacity>
            </View>
          ) : expenses.length === 0 ? (
            <View className="py-12 items-center">
              <Ionicons name="cart-outline" size={48} color={colors.border} />
              <Text className="text-gray-400 text-base mt-2">{strings.noExpenses}</Text>
              <Text className="text-gray-400 text-sm mt-1">{strings.addFirstExpense}</Text>
              <TouchableOpacity
                onPress={() => router.push('/expenses/new')}
                className="mt-6 bg-indigo-600 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-medium">{strings.registerExpense}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Search bar */}
              <View className="relative mb-4">
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={strings.searchExpense}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 text-base text-gray-900 dark:text-gray-100"
                  placeholderTextColor={colors.textSecondary}
                />
                <Ionicons name="search" size={18} color={colors.textSecondary} className="absolute left-3 top-3.5" />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')} className="absolute right-3 top-3">
                    <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Filtro por categoría */}
              <View className="flex-row flex-wrap gap-2 mb-4">
                <TouchableOpacity
                  onPress={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-full border ${categoryFilter === 'all' ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                >
                  <Text className={`text-xs font-medium ${categoryFilter === 'all' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    {strings.all}
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
                    className={`px-3 py-1.5 rounded-full border ${categoryFilter === cat ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                  >
                    <Text className={`text-xs font-medium ${categoryFilter === cat ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {filtered.length > 0 && (
                <>
                  {/* Summary */}
                  <View className="p-3 bg-white dark:bg-gray-800 rounded-lg mb-4 shadow-sm">
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {filtered.length} egreso{filtered.length !== 1 ? 's' : ''}
                    </Text>
                    <View className="flex-row gap-4 mt-1">
                      <Text className="text-base font-bold text-red-600">- ${totalUSD.toFixed(2)}</Text>
                      <Text className="text-base font-bold text-gray-700 dark:text-gray-200">Bs. {totalVES.toFixed(2)}</Text>
                    </View>
                  </View>

                  {/* Export button */}
                  <TouchableOpacity
                    onPress={handleExport}
                    className="flex-row items-center justify-center mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5"
                  >
                    <Ionicons name="download-outline" size={18} color={colors.primary} />
                    <Text className="text-indigo-600 dark:text-indigo-400 text-sm font-medium ml-2">{strings.exportCSV}</Text>
                  </TouchableOpacity>
                </>
              )}

              {filtered.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="search-outline" size={36} color={colors.border} />
                  <Text className="text-gray-400 text-base mt-2">{strings.noResults}</Text>
                </View>
              ) : (
                filtered.map((expense) => (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    onPress={() => router.push(`/expenses/${expense.id}`)}
                  />
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.push('/expenses/new')}
        className="absolute bottom-6 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
