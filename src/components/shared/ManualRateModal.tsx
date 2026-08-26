import { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRateStore } from '../../store/rate.store';
import { colors } from '../../constants/colors';
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
    <Modal visible={visible} transparent animationType="fade">
      <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="w-11/12 max-w-sm">
          <Pressable className="bg-white rounded-2xl p-6" onPress={() => {}}>
            <Text className="text-lg font-bold text-gray-900 mb-2">{strings.manualRateTitle}</Text>
            <Text className="text-sm text-gray-500 mb-4">
              {strings.manualRateDescription}
            </Text>
            <TextInput
              value={inputValue}
              onChangeText={(t) => { setInputValue(t); setInputError(null); }}
              placeholder={strings.ratePlaceholder}
              keyboardType="decimal-pad"
              className={`border rounded-xl px-4 py-3 text-lg text-center font-bold text-gray-900 ${inputError ? 'border-red-500' : 'border-gray-200'}`}
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            {inputError && (
              <Text className="text-red-500 text-sm mt-2 text-center">{inputError}</Text>
            )}
            <View className="flex-row justify-end gap-3 mt-6">
              <TouchableOpacity onPress={onClose} className="py-2 px-4 rounded-lg border border-gray-200">
                <Text className="text-gray-700 font-medium">{strings.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} className="py-2 px-4 rounded-lg bg-indigo-600">
                <Text className="text-white font-medium">{strings.accept}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
