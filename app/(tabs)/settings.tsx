import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { closeDatabase, getDatabase } from '../../src/lib/db';
import { colors } from '../../src/constants/colors';
import { strings } from '../../src/constants/strings';

interface RateRecord {
  rate: number;
  source: string;
  date: string;
}

export default function SettingsScreen() {
  const [rates, setRates] = useState<RateRecord[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    // Extract rates from sales, quotes, and expenses
    try {
      const db = getDatabase();
      const sales = db.getAllSync<Record<string, unknown>>(
        "SELECT exchangeRate, 'venta' as source, createdAt FROM sales ORDER BY createdAt DESC LIMIT 10"
      );
      const quotes = db.getAllSync<Record<string, unknown>>(
        "SELECT exchangeRate, 'cotización' as source, createdAt FROM quotes ORDER BY createdAt DESC LIMIT 10"
      );
      const expenses = db.getAllSync<Record<string, unknown>>(
        "SELECT exchangeRate, 'egreso' as source, createdAt FROM expenses ORDER BY createdAt DESC LIMIT 10"
      );

      const all = [...sales, ...quotes, ...expenses]
        .map((r) => ({
          rate: r.exchangeRate as number,
          source: r.source as string,
          date: r.createdAt as string,
        }))
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 20);

      setRates(all);
    } catch (e) {
      // Silently handle — rates are not critical
    }
  }, []);

  async function handleBackup() {
    setIsBackingUp(true);
    try {
      const db = getDatabase();
      // Export a JSON snapshot of all tables
      const tables = ['services', 'quotes', 'quote_items', 'sales', 'sale_items', 'expenses', 'inventory_items', 'clients'];
      const backup: Record<string, unknown[]> = {};

      for (const table of tables) {
        try {
          backup[table] = db.getAllSync<Record<string, unknown>>(`SELECT * FROM ${table}`);
        } catch {
          backup[table] = [];
        }
      }

      const json = JSON.stringify(backup, null, 2);
      const uri = `${FileSystem.cacheDirectory}emprendeplus-backup-${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(uri, json);

      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: strings.appName + ' Backup' });
      } else {
        Alert.alert(strings.backupCreated, `${strings.backupSavedTo} ${uri}`);
      }
    } catch (e) {
      Alert.alert(strings.errorTitle, strings.backupError);
    } finally {
      setIsBackingUp(false);
    }
  }

  async function handleRestore() {
    Alert.alert(
      strings.restoreBackup,
      strings.restoreWarning,
      [
        { text: strings.cancel, style: 'cancel' },
        {
          text: strings.restore,
          style: 'destructive',
          onPress: async () => {
            setIsRestoring(true);
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
              });
              if (result.canceled || !result.assets?.[0]?.uri) {
                return;
              }

              const json = await FileSystem.readAsStringAsync(result.assets[0].uri);
              const backup = JSON.parse(json) as Record<string, Array<Record<string, unknown>>>;

              const db = getDatabase();
              const tables = ['quote_items', 'sale_items', 'sales', 'quotes', 'expenses', 'inventory_items', 'services', 'clients'];

              // Rebuild tables from backup
              for (const table of tables) {
                const rows = backup[table] ?? [];
                if (rows.length > 0) {
                  // Derive columns from the first row (keys)
                  const columns = Object.keys(rows[0]);
                  for (const row of rows) {
                    const placeholders = columns.map(() => '?').join(', ');
                    const values = columns.map((col) => {
                      const v = row[col];
                      if (v === undefined || v === null) return null;
                      return typeof v === 'number' ? v : String(v);
                    });
                    db.runSync(
                      `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
                      ...values
                    );
                  }
                }
              }

              Alert.alert(strings.done, strings.restoreSuccess);
            } catch (e) {
              Alert.alert(strings.errorTitle, strings.restoreError);
            } finally {
              setIsRestoring(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" contentContainerStyle={{ padding: 16 }}>
      {/* Sección: Backup */}
      <View className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-4 border border-gray-200 dark:border-gray-700">
        <Text className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">{strings.dataBackup}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {strings.dataBackupDesc}
        </Text>

        <TouchableOpacity
          onPress={handleBackup}
          disabled={isBackingUp}
          className="py-3 rounded-lg items-center bg-indigo-600 flex-row justify-center gap-2 mb-3"
        >
          {isBackingUp ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="cloud-upload-outline" size={18} color="white" />
          )}
          <Text className="text-white text-sm font-semibold">
            {isBackingUp ? strings.exporting : strings.exportBackup}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRestore}
          disabled={isRestoring}
          className="py-3 rounded-lg items-center bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 flex-row justify-center gap-2"
        >
          <Ionicons name="cloud-download-outline" size={18} color="#D97706" />
          <Text className="text-amber-700 dark:text-amber-300 text-sm font-semibold">
            {isRestoring ? strings.restoring : strings.restoreBackup}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sección: Historial de Tasas */}
      <View className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-4 border border-gray-200 dark:border-gray-700">
        <Text className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">{strings.rateHistory}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {strings.rateHistoryDesc}
        </Text>

        {rates.length === 0 ? (
          <Text className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            {strings.noRates}
          </Text>
        ) : (
          <View className="gap-1">
            {rates.map((r, idx) => (
              <View key={idx} className="flex-row justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700">
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  {strings.rateShortLabel} {r.rate.toFixed(2)}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(r.date).toLocaleDateString('es-VE')}
                  </Text>
                  <Text className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                    {r.source}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Sección: Info de la App */}
      <View className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 mb-8">
        <Text className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">{strings.about}</Text>
        <View className="gap-1 mt-2">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500 dark:text-gray-400">{strings.appName}</Text>
            <Text className="text-sm text-gray-700 dark:text-gray-300">{strings.version}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500 dark:text-gray-400">{strings.sdk}</Text>
            <Text className="text-sm text-gray-700 dark:text-gray-300">{strings.expoVersion}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500 dark:text-gray-400">{strings.framework}</Text>
            <Text className="text-sm text-gray-700 dark:text-gray-300">{strings.reactNativeVersion}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}