import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useInventoryStore } from '../../src/store/inventory.store';
import { useRateStore } from '../../src/store/rate.store';
import { InventoryForm } from '../../src/components/forms/InventoryForm';
import { colors } from '../../src/constants/colors';
import { strings } from '../../src/constants/strings';

export default function InventoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === 'new';

  const existing = useInventoryStore((s) => s.items.find((i) => i.id === id));
  const rate = useRateStore((s) => s.rate);
  const createItem = useInventoryStore((s) => s.createItem);
  const updateItem = useInventoryStore((s) => s.updateItem);

  if (!rate) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-gray-500">{strings.gettingRate}</Text>
      </View>
    );
  }

  const currentRate: number = rate;

  async function handleSubmit(data: Parameters<typeof createItem>[0]) {
    if (isNew) {
      await createItem(data, currentRate);
    } else if (id) {
      await updateItem(id, data, currentRate);
    }
    router.back();
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: isNew ? strings.newMaterialTitle : strings.editMaterialTitle }} />
      <InventoryForm
        initialValues={existing ? {
          name: existing.name,
          description: existing.description,
          category: existing.category,
          quantity: existing.quantity,
          unit: existing.unit,
          purchasePriceUSD: existing.purchasePriceUSD,
          supplier: existing.supplier,
          purchaseDate: existing.purchaseDate,
          notes: existing.notes,
          photoUri: existing.photoUri,
        } : undefined}
        exchangeRate={rate}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={false}
      />
    </View>
  );
}
