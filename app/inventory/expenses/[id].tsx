import { useState } from 'react';
import { View, Alert, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useExpenseStore } from '../../../src/store/expense.store';
import { useRateStore } from '../../../src/store/rate.store';
import { ExpenseForm } from '../../../src/components/forms/ExpenseForm';
import { strings } from '../../../src/constants/strings';
import type { CreateExpenseInput } from '../../../src/types';

export default function ExpenseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const expense = useExpenseStore((s) => s.getExpenseById(id!));
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const rate = useRateStore((s) => s.rate);

  if (!expense) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  async function handleSubmit(data: CreateExpenseInput) {
    if (!rate) {
      Alert.alert(strings.noRateTitle, strings.noRateMessage);
      return;
    }
    setIsSubmitting(true);
    try {
      await updateExpense(id!, data, rate);
      router.back();
    } catch (e) {
      Alert.alert(strings.errorTitle, e instanceof Error ? e.message : strings.updateExpenseError);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete() {
    Alert.alert(strings.deleteExpense, strings.confirmDeleteExpense, [
      { text: strings.cancel, style: 'cancel' },
      {
        text: strings.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExpense(id!);
            router.back();
          } catch (e) {
            Alert.alert(strings.errorTitle, e instanceof Error ? e.message : strings.deleteExpenseError);
          }
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen
        options={{
          title: strings.editExpense,
          headerShown: true,
          headerRight: () => (
            <HeaderDeleteButton onPress={handleDelete} />
          ),
        }}
      />
      <ExpenseForm
        initialValues={{
          description: expense.description,
          category: expense.category,
          amountUSD: expense.amountUSD,
          paymentMethod: expense.paymentMethod,
          supplier: expense.supplier,
          notes: expense.notes,
        }}
        exchangeRate={rate}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}

function HeaderDeleteButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="mr-2">
      <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '500' }}>{strings.delete}</Text>
    </TouchableOpacity>
  );
}
