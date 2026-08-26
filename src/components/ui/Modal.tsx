import { Modal as RNModal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { strings } from '../../constants/strings';

interface ModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'primary' | 'danger';
}

export function Modal({
  visible,
  title,
  message,
  confirmLabel = strings.modalConfirm,
  cancelLabel = strings.cancel,
  onConfirm,
  onCancel,
  variant = 'primary',
}: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center"
        onPress={onCancel}
        accessibilityRole="none"
      >
        <Pressable
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 mx-6 w-11/12 max-w-sm border border-gray-200 dark:border-gray-700"
          onPress={() => {}}
          accessibilityRole="none"
        >
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-6">{message}</Text>
          <View className="flex-row justify-end gap-3">
            <TouchableOpacity
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              className="py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <Text className="text-gray-700 dark:text-gray-300 font-medium">{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              className={`py-2 px-4 rounded-lg ${variant === 'danger' ? 'bg-red-500' : 'bg-indigo-600'}`}
            >
              <Text className="text-white font-medium">{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
