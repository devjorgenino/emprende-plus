import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useServiceList } from '../../src/features/services/useServiceList';
import { useDeleteService } from '../../src/features/services/useDeleteService';
import { ServiceItem } from '../../src/components/shared/ServiceItem';
import { Modal } from '../../src/components/ui/Modal';
import { colors } from '../../src/constants/colors';
import { strings } from '../../src/constants/strings';
import { useState } from 'react';
import type { Service } from '../../src/types';

export default function ServicesListScreen() {
  const router = useRouter();
  const { services, isLoading, error, refresh } = useServiceList();
  const { remove } = useDeleteService();
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  function handleDelete() {
    if (!deleteTarget) return;
    remove(deleteTarget.id);
    setDeleteTarget(null);
  }

  if (isLoading && services.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-gray-500">{strings.loading}</Text>
      </View>
    );
  }

  if (error && services.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text className="text-red-500 text-base mt-4 text-center">{error}</Text>
        <TouchableOpacity
          onPress={refresh}
          className="mt-4 bg-indigo-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">{strings.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ title: strings.servicesTitle }} />
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <ServiceItem
              service={item}
              onEdit={() => router.push(`/services/${item.id}`)}
              onDelete={() => setDeleteTarget(item)}
            />
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-6">
            <Ionicons name="cube-outline" size={64} color={colors.border} />
            <Text className="text-gray-400 text-lg mt-4">
              {strings.emptyServices}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              {strings.addFirstService}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
      />
      <TouchableOpacity
        onPress={() => router.push('/services/new')}
        className="absolute bottom-6 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <Modal
        visible={deleteTarget !== null}
        title={strings.deleteService}
        message={strings.confirmDelete}
        confirmLabel={strings.delete}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}
