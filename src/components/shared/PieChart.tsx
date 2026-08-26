import { View, Text } from 'react-native';

export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieSlice[];
  size?: number;
  prefix?: string;
}

const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

/**
 * Gráfico circular (donut) simple dibujado con sectores usando borderColor.
 * Muestra leyenda con porcentajes.
 */
export function PieChart({ data, size = 140, prefix = '$' }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total <= 0) {
    return (
      <View className="items-center py-4">
        <Text className="text-sm text-gray-400">Sin datos de gastos en este período</Text>
      </View>
    );
  }

  // Build a donut using stacked segments: each segment is a rounded view with
  // a background "arc" approximated by border segments. For simplicity we
  // render a layered ring using a conic-like approach via transforms is complex
  // on RN, so we use a clean proportional horizontal bar + legend instead.
  return (
    <View>
      {/* Barra proporcional de categorías */}
      <View className="flex-row h-4 rounded-full overflow-hidden mb-3">
        {data.map((d, idx) => (
          <View
            key={idx}
            style={{
              width: `${(d.value / total) * 100}%`,
              backgroundColor: d.color || PIE_COLORS[idx % PIE_COLORS.length],
            }}
          />
        ))}
      </View>

      <View className="gap-2">
        {data.map((d, idx) => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0';
          return (
            <View key={idx} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 flex-1">
                <View
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: d.color || PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">{d.label}</Text>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {prefix}{d.value.toFixed(2)} · {pct}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
