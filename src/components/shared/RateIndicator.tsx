import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRateStore } from '../../store/rate.store';
import { colors } from '../../constants/colors';
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

  const sourceLabel = source === 'bcv' ? 'BCV' : source === 'manual' ? strings.rateSourceManual : strings.rateSourceCache;

  if (!rate && isLoading) {
    return (
      <View className="flex-row items-center px-2 py-1">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <View className="flex-row items-center gap-1">
        {rate ? (
          <>
            <TouchableOpacity onPress={refresh} className="flex-row items-center px-2 py-1 bg-indigo-50 rounded-full">
              <Ionicons name="trending-up" size={14} color={colors.primary} />
              <Text className="text-indigo-700 text-xs font-medium ml-1">Bs. {rate.toFixed(2)}</Text>
              <Text className="text-indigo-400 text-xs ml-1">({sourceLabel})</Text>
              {isLoading && <ActivityIndicator size="small" color={colors.primary} className="ml-1" />}
              {error && <Ionicons name="warning" size={12} color={colors.error} className="ml-1" />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(true)} className="p-1">
              <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => setShowModal(true)} className="flex-row items-center px-2 py-1 bg-red-50 rounded-full">
              <Ionicons name="alert-circle" size={14} color={colors.error} />
              <Text className="text-red-500 text-xs ml-1">{strings.noRateTitle}</Text>
            </TouchableOpacity>
            {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
          </>
        )}
      </View>
      <ManualRateModal visible={showModal} onClose={() => setShowModal(false)} initialValue={rate ?? undefined} />
    </>
  );
}
