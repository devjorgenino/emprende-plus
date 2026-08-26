import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { useThemeColors } from '../../hooks/useThemeColors';
import { strings } from '../../constants/strings';
import type { Service } from '../../types';

interface ServiceSelectorProps {
  services: Service[];
  onSelect: (service: Service) => void;
  selectedIds: Set<string>;
}

export function ServiceSelector({ services, onSelect, selectedIds }: ServiceSelectorProps) {
  const c = useThemeColors();

  if (services.length === 0) {
    return (
      <View className="py-8 items-center">
        <Ionicons name="cube-outline" size={48} color={c.border} />
        <Text className="text-gray-400 dark:text-gray-500 text-base mt-2">{strings.noActiveServices}</Text>
        <Text className="text-gray-400 dark:text-gray-500 text-sm">{strings.addServicesFirst}</Text>
      </View>
    );
  }

  return (
    <View className="py-2">
      {services.map((item) => {
        const selected = selectedIds.has(item.id);
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onSelect(item)}
            disabled={selected}
            accessibilityRole="button"
            accessibilityLabel={`${item.name} $${item.priceUSD.toFixed(2)}${selected ? ` — ${strings.addServicesFirst}` : ''}`}
            accessibilityState={{ selected }}
          >
            <Card className={`mb-2 ${selected ? 'opacity-50' : ''}`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-base font-medium text-gray-900 dark:text-white">{item.name}</Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">${item.priceUSD.toFixed(2)}</Text>
                </View>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={24} color={c.secondary} />
                ) : (
                  <Ionicons name="add-circle-outline" size={24} color={c.primary} />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}