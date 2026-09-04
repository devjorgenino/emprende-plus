import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { strings } from '../../src/constants/strings';
import { RateIndicator } from '../../src/components/shared/RateIndicator';
import { ThemeToggle } from '../../src/components/ui/ThemeToggle';

export default function TabLayout() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textSecondary,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          height: 64 + (Platform.OS === 'ios' ? insets.bottom : 8),
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 1,
        },
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        headerShadowVisible: false,
        headerRight: () => (
          <View className="flex-row items-center mr-3 gap-2">
            <ThemeToggle />
            <RateIndicator />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: strings.tabDashboard,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: strings.tabCalculator,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: strings.tabSales,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: strings.tabInventory,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: strings.tabClients,
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: strings.tabSettings,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
