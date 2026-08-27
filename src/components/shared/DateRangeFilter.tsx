import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { strings } from '../../constants/strings';

type QuickPeriod = 'today' | 'week' | 'month' | 'all' | 'custom';

interface DateRangeFilterProps {
  onPeriodChange: (startDate: string, endDate: string) => void;
}

function getPeriodDates(period: QuickPeriod): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString();

  switch (period) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start: start.toISOString(), end };
    }
    case 'week': {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      return { start: start.toISOString(), end };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: start.toISOString(), end };
    }
    case 'all':
    default:
      return { start: new Date(0).toISOString(), end };
  }
}

export function DateRangeFilter({ onPeriodChange }: DateRangeFilterProps) {
  const [activePeriod, setActivePeriod] = useState<QuickPeriod>('all');

  function handlePeriod(period: QuickPeriod) {
    setActivePeriod(period);
    if (period !== 'custom') {
      const { start, end } = getPeriodDates(period);
      onPeriodChange(start, end);
    }
  }

  const periods: { key: QuickPeriod; label: string }[] = [
    { key: 'today', label: strings.periodToday },
    { key: 'week', label: strings.periodWeek },
    { key: 'month', label: strings.periodMonth },
    { key: 'all', label: strings.periodAll },
  ];

  return (
    <View className="flex-row gap-2 mb-4" accessibilityRole="tablist">
      {periods.map((p) => (
        <TouchableOpacity
          key={p.key}
          onPress={() => handlePeriod(p.key)}
          accessibilityRole="tab"
          accessibilityState={{ selected: activePeriod === p.key }}
          accessibilityLabel={p.label}
          className={`px-4 py-2 rounded-full ${
            activePeriod === p.key ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <Text className={`text-sm font-medium ${
            activePeriod === p.key ? 'text-white' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {p.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
