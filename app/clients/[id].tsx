import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getClientById, updateClient, deleteClient, type Client } from '../../src/services/db/repositories/client.repository';
import { useClientSales } from '../../src/features/clients/useClientSales';
import { SaleItem } from '../../src/components/shared/SaleItem';
import { colors } from '../../src/constants/colors';
import { strings } from '../../src/constants/strings';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | undefined>();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const c = getClientById(id);
    setClient(c);
    setPhone(c?.phone ?? '');
    setEmail(c?.email ?? '');
    setNotes(c?.notes ?? '');
  }, [id]);

  const { sales, totalUSD, totalVES, isLoading } = useClientSales(client?.name);

  if (!client) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Non-null after early return for TypeScript strict
  const currentClient = client;

  function handleSave() {
    updateClient(currentClient.id, { phone: phone.trim() || undefined, email: email.trim() || undefined, notes: notes.trim() || undefined });
    setClient(getClientById(currentClient.id));
    setEditing(false);
  }

  function handleDelete() {
    Alert.alert(strings.deleteClient, `${strings.deleteClientConfirm} "${currentClient.name}"?`, [
      { text: strings.cancel, style: 'cancel' },
      {
        text: strings.deleteClient,
        style: 'destructive',
        onPress: () => { deleteClient(currentClient.id); router.back(); },
      },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" contentContainerStyle={{ padding: 16 }}>
      {/* Encabezado */}
      <View className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-4 border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center gap-3">
          <View className="w-14 h-14 rounded-full bg-indigo-600 items-center justify-center">
            <Text className="text-white text-xl font-bold">
              {client.name.trim().charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">{client.name}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {strings.clientSalesCount}: {sales.length} · {strings.clientTotalSpent}: ${totalUSD.toFixed(2)}
            </Text>
          </View>
        </View>

        {editing ? (
          <View className="mt-4">
            <Text className="text-[13px] text-gray-700 dark:text-gray-300 mb-1">{strings.clientPhone}</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder={strings.phonePlaceholder}
              placeholderTextColor="#9ca3af"
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              keyboardType="phone-pad"
            />
            <Text className="text-[13px] text-gray-700 dark:text-gray-300 mb-1">{strings.clientEmail}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={strings.emailPlaceholder}
              placeholderTextColor="#9ca3af"
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text className="text-[13px] text-gray-700 dark:text-gray-300 mb-1">{strings.clientNotes}</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder={strings.optionalNotes}
              placeholderTextColor="#9ca3af"
              multiline
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[60px]"
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setEditing(false)}
                className="flex-1 py-3 rounded-lg items-center bg-gray-200 dark:bg-gray-700"
              >
                <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium">{strings.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} className="flex-1 py-3 rounded-lg items-center bg-indigo-600">
                <Text className="text-white text-sm font-semibold">{strings.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="mt-4">
            {client.phone || client.email || client.notes ? (
              <View className="gap-1">
                {client.phone && <Text className="text-sm text-gray-600 dark:text-gray-400">{client.phone}</Text>}
                {client.email && <Text className="text-sm text-gray-600 dark:text-gray-400">{client.email}</Text>}
                {client.notes && <Text className="text-sm text-gray-600 dark:text-gray-400">{client.notes}</Text>}
              </View>
            ) : (
              <Text className="text-sm text-gray-400 dark:text-gray-500">{strings.noContactData}</Text>
            )}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => setEditing(true)}
                className="flex-1 py-2.5 rounded-lg items-center bg-indigo-50 dark:bg-indigo-900/40 flex-row justify-center gap-1"
              >
                <Ionicons name="create-outline" size={16} color={colors.primary} />
                <Text className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">{strings.editClient}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                className="flex-1 py-2.5 rounded-lg items-center bg-red-50 dark:bg-red-900/30 flex-row justify-center gap-1"
              >
                <Ionicons name="trash-outline" size={16} color={colors.error} />
                <Text className="text-red-500 text-sm font-medium">{strings.deleteClient}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Totales del cliente */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <Text className="text-xs text-gray-500 dark:text-gray-400">{strings.clientTotalSpent}</Text>
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">${totalUSD.toFixed(2)}</Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Bs. {totalVES.toFixed(2)}</Text>
        </View>
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <Text className="text-xs text-gray-500 dark:text-gray-400">{strings.clientSalesCount}</Text>
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{sales.length}</Text>
        </View>
      </View>

      {/* Historial de ventas */}
      <Text className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">{strings.tabSales}</Text>
      {isLoading && sales.length === 0 ? (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : sales.length === 0 ? (
        <View className="py-8 items-center">
          <Ionicons name="receipt-outline" size={40} color={colors.border} />
          <Text className="text-gray-400 dark:text-gray-500 text-sm mt-2 text-center">{strings.clientNoSales}</Text>
        </View>
      ) : (
        sales.map((sale) => (
          <SaleItem key={sale.id} sale={sale} onPress={() => router.push(`/sales/${sale.id}`)} />
        ))
      )}
    </ScrollView>
  );
}