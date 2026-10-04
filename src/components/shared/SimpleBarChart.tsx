import { View, Text } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: BarItem[];
  height?: number;
  prefix?: string;
}

export function SimpleBarChart({
  data,
  height = 120,
  prefix = '',
}: SimpleBarChartProps) {
  const c = useThemeColors();
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 6 }}
    >
      {data.map((item, idx) => {
        const barHeight = (item.value / maxVal) * (height - 20);
        return (
          <View key={idx} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{ fontSize: 10, color: c.textSecondary, marginBottom: 4 }}
            >
              {prefix}
              {item.value.toFixed(0)}
            </Text>
            <View
              style={{
                width: '100%',
                height: Math.max(barHeight, 4),
                backgroundColor: item.color || c.primary,
                borderRadius: 4,
                minWidth: 20,
              }}
            />
            <Text
              style={{
                fontSize: 10,
                color: c.textSecondary,
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
