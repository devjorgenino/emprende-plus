import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getAllClients,
  createClient,
  deleteClient,
  type Client,
} from '../../src/services/db/repositories/client.repository';
import { colors } from '../../src/constants/colors';
import { strings } from '../../src/constants/strings';

export default function ClientsScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    try {
      setClients(getAllClients());
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial de clientes desde SQLite (patrón RN estándar de data-loading)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = search.trim()
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : clients;

  function handleAdd() {
    Alert.prompt?.(strings.addClient, strings.clientName, (name) => {
      if (name?.trim()) {
        createClient(name.trim());
        load();
      }
    });
  }

  function handleDelete(client: Client) {
    Alert.alert(
      strings.deleteClient,
      `${strings.deleteClientConfirm} "${client.name}"?`,
      [
        { text: strings.cancel, style: 'cancel' },
        {
          text: strings.deleteClient,
          style: 'destructive',
          onPress: () => {
            deleteClient(client.id);
            load();
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        renderItem={({ item: client }) => (
          <TouchableOpacity
            onPress={() => router.push(`/clients/${client.id}`)}
            accessibilityRole="button"
            accessibilityLabel={client.name}
            className="mx-4 mb-2 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {client.name}
                </Text>
                {client.phone && (
                  <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons
                      name="call-outline"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {client.phone}
                    </Text>
                  </View>
                )}
                {client.email && (
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Ionicons
                      name="mail-outline"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {client.email}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(client)}
                accessibilityRole="button"
                accessibilityLabel={`${strings.deleteClient} ${client.name}`}
                className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 items-center justify-center"
              >
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="px-4 pb-3">
            <View className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
              <Ionicons name="search" size={18} color="#9ca3af" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={strings.clientName}
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-2 text-base text-gray-900 dark:text-gray-100"
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View className="py-12 items-center px-6">
              <Ionicons name="people-outline" size={48} color={colors.border} />
              <Text className="text-gray-400 dark:text-gray-500 text-base mt-3 text-center">
                {strings.emptyClients}
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1 text-center">
                {strings.clientSaved}
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={load}
            tintColor={colors.primary}
          />
        }
      />
      <TouchableOpacity
        onPress={handleAdd}
        accessibilityRole="button"
        accessibilityLabel={strings.addClient}
        className="absolute bottom-6 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
