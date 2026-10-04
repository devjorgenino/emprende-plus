import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useServiceStore } from '../../src/store/service.store';
import { useExchangeRate } from '../../src/hooks/useExchangeRate';
import { useCreateService } from '../../src/features/services/useCreateService';
import { useUpdateService } from '../../src/features/services/useUpdateService';
import { ServiceForm } from '../../src/components/forms/ServiceForm';
import { colors } from '../../src/constants/colors';
import { strings } from '../../src/constants/strings';
import type { CreateServiceInput } from '../../src/types';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === 'new';

  const existing =
    useServiceStore((s) => s.services.find((svc) => svc.id === id)) ??
    undefined;
  const { rate, isLoading: rateLoading, error: rateError } = useExchangeRate();
  const { submit: create, isSubmitting: isCreating } = useCreateService(rate);
  const { submit: update, isSubmitting: isUpdating } = useUpdateService(rate);

  if (rateLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-gray-500">{strings.gettingRate}</Text>
      </View>
    );
  }

  async function handleSubmit(data: CreateServiceInput) {
    if (isNew) {
      await create(data);
    } else if (id) {
      await update(id, data);
    }
    router.back();
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen
        options={{
          title: isNew ? strings.newServiceTitle : strings.editService,
        }}
      />
      {rateError && (
        <View className="mx-4 mt-4 p-3 bg-red-50 rounded-lg">
          <Text className="text-red-600 text-sm">{rateError}</Text>
        </View>
      )}
      <ServiceForm
        initialValues={
          existing
            ? {
                name: existing.name,
                description: existing.description,
                priceUSD: existing.priceUSD,
                priceVES: existing.priceVES,
              }
            : undefined
        }
        exchangeRate={rate}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={isCreating || isUpdating}
      />
    </View>
  );
}
