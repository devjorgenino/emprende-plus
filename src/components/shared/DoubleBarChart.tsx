import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export interface DoubleBarData {
  label: string;
  income: number;
  expense: number;
}

interface DoubleBarChartProps {
  data: DoubleBarData[];
  height?: number;
  prefix?: string;
  incomeColor?: string;
  expenseColor?: string;
}

/**
 * Gráfico de doble barra (ingresos vs egresos) con tooltip al tocar.
 * Utiliza NativeWind para el layout y colores inline para las barras.
 */
export function DoubleBarChart({
  data,
  height = 140,
  prefix = '$',
  incomeColor = '#6366F1',
  expenseColor = '#EF4444',
}: DoubleBarChartProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const maxVal = Math.max(
    ...data.flatMap((d) => [d.income, d.expense]),
    1
  );

  return (
    <View>
      {/* Leyenda */}
      <View className="flex-row gap-4 mb-2">
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: incomeColor }} />
          <Text className="text-xs text-gray-500 dark:text-gray-400">Ingresos</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: expenseColor }} />
          <Text className="text-xs text-gray-500 dark:text-gray-400">Egresos</Text>
        </View>
      </View>

      <View className="flex-row items-end" style={{ height, gap: 8 }}>
        {data.map((item, idx) => {
          const incomeHeight = (item.income / maxVal) * (height - 24);
          const expenseHeight = (item.expense / maxVal) * (height - 24);
          const isSelected = selected === idx;
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelected(isSelected ? null : idx)}
              className="flex-1 items-center"
              activeOpacity={0.7}
            >
              {isSelected && (
                <Text className="text-[10px] text-gray-700 dark:text-gray-300 mb-1 text-center">
                  {prefix}{item.income.toFixed(2)} / {prefix}{item.expense.toFixed(2)}
                </Text>
              )}
              <View className="flex-row items-end gap-0.5" style={{ height: height - 24 }}>
                <View
                  style={{
                    width: 10,
                    height: Math.max(incomeHeight, 3),
                    backgroundColor: incomeColor,
                    borderRadius: 3,
                  }}
                />
                <View
                  style={{
                    width: 10,
                    height: Math.max(expenseHeight, 3),
                    backgroundColor: expenseColor,
                    borderRadius: 3,
                  }}
                />
              </View>
              <Text className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 text-center">
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
