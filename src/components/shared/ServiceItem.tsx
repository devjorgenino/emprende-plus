import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { colors } from '../../constants/colors';
import { strings } from '../../constants/strings';
import type { Service } from '../../types';

interface ServiceItemProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
}

export function ServiceItem({ service, onEdit, onDelete }: ServiceItemProps) {
  return (
    <Card className="mb-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-4">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">{service.name}</Text>
          {service.description && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1" numberOfLines={2}>
              {service.description}
            </Text>
          )}
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {service.isActive ? strings.active : strings.inactive}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">${service.priceUSD.toFixed(2)}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">Bs. {service.priceVES.toFixed(2)}</Text>
        </View>
      </View>
      <View className="flex-row justify-end gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <TouchableOpacity onPress={onEdit} className="flex-row items-center gap-1">
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text className="text-indigo-600 text-sm">{strings.edit}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} className="flex-row items-center gap-1">
          <Ionicons name="trash-outline" size={16} color={colors.error} />
          <Text className="text-red-500 text-sm">{strings.delete}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}
