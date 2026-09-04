import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventoryStore } from '../../../src/store/inventory.store';
import { useServiceStore } from '../../../src/store/service.store';
import { InventoryItem } from '../../../src/components/shared/InventoryItem';
import { Modal } from '../../../src/components/ui/Modal';
import { colors } from '../../../src/constants/colors';
import { strings } from '../../../src/constants/strings';
import type { InventoryItem as InventoryItemType } from '../../../src/types';

export default function InventoryScreen() {
  const router = useRouter();
  const items = useInventoryStore((s) => s.items);
  const isLoading = useInventoryStore((s) => s.isLoading);
  const loadItems = useInventoryStore((s) => s.loadItems);
  const deleteItem = useInventoryStore((s) => s.deleteItem);
  const servicesCount = useServiceStore((s) => s.services.filter((svc) => svc.isActive).length);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItemType | null>(null);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteItem(deleteTarget.id);
    setDeleteTarget(null);
  }

  if (isLoading && items.length === 0) {
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
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <InventoryItem
              item={item}
              onEdit={() => router.push(`/inventory/${item.id}`)}
              onDelete={() => setDeleteTarget(item)}
            />
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <TouchableOpacity
            onPress={() => router.push('/services')}
            accessibilityRole="button"
            accessibilityLabel={strings.manageServices}
            className="mx-4 mb-3 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-lg bg-indigo-500 items-center justify-center">
                <Ionicons name="briefcase-outline" size={20} color="white" />
              </View>
              <View>
                <Text className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">{strings.manageServices}</Text>
                <Text className="text-xs text-indigo-600 dark:text-indigo-400">{servicesCount} servicio{servicesCount !== 1 ? 's' : ''} activo{servicesCount !== 1 ? 's' : ''}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-6">
            <Ionicons name="cube-outline" size={64} color={colors.border} />
            <Text className="text-gray-400 dark:text-gray-500 text-lg mt-4">{strings.emptyInventory}</Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">{strings.addMaterial}</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadItems} tintColor={colors.primary} />
        }
      />
      <TouchableOpacity
        onPress={() => router.push('/inventory/new')}
        accessibilityRole="button"
        accessibilityLabel={strings.addMaterial}
        className="absolute bottom-6 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <Modal
        visible={deleteTarget !== null}
        title={strings.deleteInventory}
        message={strings.confirmDelete}
        confirmLabel={strings.delete}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}
