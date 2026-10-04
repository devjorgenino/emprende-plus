import { View, Text, TouchableOpacity } from 'react-native';
import { strings } from '../../constants/strings';
import type { Period } from '../../features/dashboard/useDashboard';

interface PeriodSelectorProps {
  selected: Period;
  onChange: (period: Period) => void;
}

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: strings.periodToday },
  { key: 'week', label: strings.periodWeek },
  { key: 'month', label: strings.periodMonth },
  { key: 'all', label: strings.periodAll },
];

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  return (
    <View className="flex-row gap-2 mb-4" accessibilityRole="tablist">
      {PERIODS.map((p) => (
        <TouchableOpacity
          key={p.key}
          onPress={() => onChange(p.key)}
          accessibilityRole="tab"
          accessibilityState={{ selected: selected === p.key }}
          accessibilityLabel={p.label}
          className={`px-4 py-2 rounded-full ${
            selected === p.key
              ? 'bg-indigo-600'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              selected === p.key
                ? 'text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {p.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
