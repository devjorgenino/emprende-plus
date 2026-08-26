import { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRateStore } from '../../store/rate.store';
import { strings } from '../../constants/strings';

interface ManualRateModalProps {
  visible: boolean;
  onClose: () => void;
  initialValue?: number;
}

export function ManualRateModal({ visible, onClose, initialValue }: ManualRateModalProps) {
  const [inputValue, setInputValue] = useState(initialValue?.toFixed(2) ?? '');
  const [inputError, setInputError] = useState<string | null>(null);
  const setManualRate = useRateStore((s) => s.setManualRate);

  async function handleSubmit() {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setInputError(strings.enterValue);
      return;
    }
    const parsed = parseFloat(trimmed.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      setInputError(strings.enterValidNumber);
      return;
    }
    await setManualRate(Math.round(parsed * 100) / 100);
    setInputValue('');
    setInputError(null);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="w-11/12 max-w-sm">
          <Pressable
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            onPress={() => {}}
            accessibilityRole="none"
          >
            <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{strings.manualRateTitle}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {strings.manualRateDescription}
            </Text>
            <TextInput
              value={inputValue}
              onChangeText={(t) => { setInputValue(t); setInputError(null); }}
              placeholder={strings.ratePlaceholder}
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
              accessibilityLabel={strings.manualRateTitle}
              autoFocus
              className={`border rounded-xl px-4 py-3 text-lg text-center font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 ${
                inputError ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
              }`}
            />
            {inputError && (
              <Text className="text-red-500 dark:text-red-400 text-sm mt-2 text-center">{inputError}</Text>
            )}
            <View className="flex-row justify-end gap-3 mt-6">
              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={strings.cancel}
                className="py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <Text className="text-gray-700 dark:text-gray-300 font-medium">{strings.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                accessibilityRole="button"
                accessibilityLabel={strings.accept}
                className="py-2 px-4 rounded-lg bg-indigo-600"
              >
                <Text className="text-white font-medium">{strings.accept}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
