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
    <RNModal visible={visible} transparent animationType="fade">
      <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={onCancel}>
        <Pressable className="bg-white rounded-2xl p-6 mx-6 w-11/12 max-w-sm" onPress={() => {}}>
          <Text className="text-lg font-bold text-gray-900 mb-2">{title}</Text>
          <Text className="text-gray-600 mb-6">{message}</Text>
          <View className="flex-row justify-end gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className="py-2 px-4 rounded-lg border border-gray-200"
            >
              <Text className="text-gray-700 font-medium">{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
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
