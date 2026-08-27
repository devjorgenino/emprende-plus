import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useExpenseStore } from '../../src/store/expense.store';
import { useRateStore } from '../../src/store/rate.store';
import { ExpenseForm } from '../../src/components/forms/ExpenseForm';
import { strings } from '../../src/constants/strings';
import type { CreateExpenseInput } from '../../src/types';

export default function NewExpenseScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createExpense = useExpenseStore((s) => s.createExpense);
  const rate = useRateStore((s) => s.rate);

  async function handleSubmit(data: CreateExpenseInput) {
    if (!rate) {
      Alert.alert(strings.noRateTitle, strings.noRateNewMessage);
      return;
    }
    setIsSubmitting(true);
    try {
      await createExpense(data, rate);
      router.back();
    } catch (e) {
      Alert.alert(strings.errorTitle, e instanceof Error ? e.message : strings.saveExpenseError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ title: strings.newExpenseTitle, headerShown: true }} />
      <ExpenseForm
        exchangeRate={rate}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}
