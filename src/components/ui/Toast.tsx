import { useEffect, useMemo } from 'react';
import { Animated, Text, View, AccessibilityInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  type?: ToastType;
}

const ICONS: Record<
  ToastType,
  {
    name: 'checkmark-circle' | 'alert-circle' | 'information-circle';
    color: string;
  }
> = {
  success: { name: 'checkmark-circle', color: '#10B981' },
  error: { name: 'alert-circle', color: '#EF4444' },
  info: { name: 'information-circle', color: '#6366F1' },
};

// Altura de la barra de tabs inferior definida en app/(tabs)/_layout.tsx
const TAB_BAR_HEIGHT = 64;
const TOAST_BOTTOM_GAP = 12;

export function Toast({
  message,
  visible,
  onHide,
  duration = 2200,
  type = 'success',
}: ToastProps) {
  const insets = useSafeAreaInsets();
  // Animated.Values estables (creados una sola vez) para el ciclo de vida del toast
  const opacity = useMemo(() => new Animated.Value(0), []);
  const translateY = useMemo(() => new Animated.Value(12), []);
  const icon = ICONS[type];

  useEffect(() => {
    if (visible) {
      // Anunciar a lectores de pantalla (accesibilidad)
      AccessibilityInfo.announceForAccessibility(message);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 12,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, message, duration, onHide, opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
        bottom: insets.bottom + TAB_BAR_HEIGHT + TOAST_BOTTOM_GAP,
      }}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
      className="absolute left-4 right-4 z-50 flex-row items-center gap-2 bg-gray-800 dark:bg-gray-900 dark:border dark:border-gray-700 rounded-lg py-3 px-4 shadow-lg"
    >
      <Ionicons name={icon.name} size={18} color={icon.color} />
      <View className="flex-1">
        <Text className="text-white text-center font-medium">{message}</Text>
      </View>
    </Animated.View>
  );
}
