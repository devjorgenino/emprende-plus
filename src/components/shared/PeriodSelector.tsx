import { View, Text, TouchableOpacity } from 'react-native';
import { strings } from '../../constants/strings';
import type { Period } from '../../features/dashboard/useDashboard';

interface PeriodSelectorProps {
  selected: Period;
  onChange: (period: Period) => void;
}

const PERIODS: Array<{ key: Period; label: string }> = [
  { key: 'today', label: strings.periodToday },
  { key: 'week', label: strings.periodWeek },
  { key: 'month', label: strings.periodMonth },
  { key: 'all', label: strings.periodAll },
];

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  return (
    <View className="flex-row gap-2 mb-4">
      {PERIODS.map((p) => (
        <TouchableOpacity
          key={p.key}
          onPress={() => onChange(p.key)}
          className={`px-4 py-2 rounded-full ${
            selected === p.key ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <Text className={`text-sm font-medium ${
            selected === p.key ? 'text-white' : 'text-gray-700'
          }`}>
            {p.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
