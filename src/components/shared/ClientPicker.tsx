import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, Alert } from 'react-native';
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
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <View style={{ flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 16, color: value ? '#111827' : '#9ca3af' }}>
            {value || strings.selectClient}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#6b7280" style={{ marginLeft: 8 }} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>{strings.tabClients}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {clients.length === 0 ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Ionicons name="people-outline" size={40} color="#d1d5db" />
                <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
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
                    style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
                  >
                    <Text style={{ fontSize: 16, color: '#111827' }}>{item.name}</Text>
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
