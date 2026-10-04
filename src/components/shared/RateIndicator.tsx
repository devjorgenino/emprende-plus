import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRateStore } from '../../store/rate.store';
import { useThemeColors } from '../../hooks/useThemeColors';
import { strings } from '../../constants/strings';
import { useState } from 'react';
import { ManualRateModal } from './ManualRateModal';

export function RateIndicator() {
  const rate = useRateStore((s) => s.rate);
  const source = useRateStore((s) => s.source);
  const isLoading = useRateStore((s) => s.isLoading);
  const error = useRateStore((s) => s.error);
  const refresh = useRateStore((s) => s.refresh);
  const [showModal, setShowModal] = useState(false);
  const c = useThemeColors();

  const sourceLabel =
    source === 'bcv'
      ? 'BCV'
      : source === 'manual'
        ? strings.rateSourceManual
        : strings.rateSourceCache;

  if (!rate && isLoading) {
    return (
      <View className="flex-row items-center px-2 py-1">
        <ActivityIndicator size="small" color={c.primary} />
      </View>
    );
  }

  return (
    <>
      <View className="flex-row items-center gap-1">
        {rate ? (
          <>
            <TouchableOpacity
              onPress={refresh}
              accessibilityRole="button"
              accessibilityLabel={`${strings.rateLabel} ${rate.toFixed(2)}. ${strings.retry}`}
              className="flex-row items-center px-2 py-1 bg-indigo-50 dark:bg-indigo-900/40 rounded-full"
            >
              <Ionicons name="trending-up" size={14} color={c.primary} />
              <Text className="text-indigo-700 dark:text-indigo-300 text-xs font-medium ml-1">
                Bs. {rate.toFixed(2)}
              </Text>
              <Text className="text-indigo-400 dark:text-indigo-500 text-xs ml-1">
                ({sourceLabel})
              </Text>
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color={c.primary}
                  className="ml-1"
                />
              )}
              {error && (
                <Ionicons
                  name="warning"
                  size={12}
                  color={c.error}
                  className="ml-1"
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              accessibilityRole="button"
              accessibilityLabel={strings.manualRateTitle}
              className="p-1"
            >
              <Ionicons
                name="create-outline"
                size={16}
                color={c.textSecondary}
              />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              accessibilityRole="button"
              accessibilityLabel={strings.noRateTitle}
              className="flex-row items-center px-2 py-1 bg-red-50 dark:bg-red-900/30 rounded-full"
            >
              <Ionicons name="alert-circle" size={14} color={c.error} />
              <Text className="text-red-500 dark:text-red-400 text-xs ml-1">
                {strings.noRateTitle}
              </Text>
            </TouchableOpacity>
            {isLoading && <ActivityIndicator size="small" color={c.primary} />}
          </>
        )}
      </View>
      <ManualRateModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        initialValue={rate ?? undefined}
      />
    </>
  );
}
