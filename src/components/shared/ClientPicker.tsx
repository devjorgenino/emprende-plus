import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllClients, createClient, type Client } from '../../services/db/repositories/client.repository';
import { strings } from '../../constants/strings';

interface ClientPickerProps {
  value: string;
  onChange: (name: string) => void;
}

export function ClientPicker({ value, onChange }: ClientPickerProps) {
  const [visible, setVisible] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  function load() {
    setClients(getAllClients());
  }

  useEffect(() => { if (visible) load(); }, [visible]);

  function handleSelect(client: Client) {
    onChange(client.name);
    setVisible(false);
  }

  function handleCreate() {
    Alert.prompt?.(strings.newClient, strings.clientName, (name) => {
      if (name?.trim()) {
        createClient(name.trim());
        load();
      }
    });
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`${strings.selectClient}: ${value || strings.selectClient}`}
        className="flex-row items-center"
      >
        <View className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800">
          <Text className={`text-base ${value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
            {value || strings.selectClient}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#6b7280" className="ml-2" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-t-3xl p-5 max-h-[70%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">{strings.tabClients}</Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={strings.cancel}
                className="p-1"
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {clients.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="people-outline" size={40} color="#9ca3af" />
                <Text className="text-sm text-gray-400 dark:text-gray-500 mt-2 text-center">
                  {strings.clientsAutoSave}
                </Text>
              </View>
            ) : (
              <FlatList
                data={clients}
                keyExtractor={(c) => c.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    accessibilityRole="button"
                    accessibilityLabel={item.name}
                    className="py-3.5 border-b border-gray-100 dark:border-gray-700"
                  >
                    <Text className="text-base text-gray-900 dark:text-gray-100">{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
