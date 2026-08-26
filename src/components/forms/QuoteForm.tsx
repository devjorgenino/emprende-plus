import { View, Text } from 'react-native';
import { Input } from '../ui/Input';
import { strings } from '../../constants/strings';

interface QuoteFormProps {
  clientName: string;
  notes: string;
  onClientNameChange: (name: string) => void;
  onNotesChange: (notes: string) => void;
}

export function QuoteForm({ clientName, notes, onClientNameChange, onNotesChange }: QuoteFormProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-3">{strings.additionalInfo}</Text>
      <Input
        label={strings.clientNameOptional}
        value={clientName}
        onChangeText={onClientNameChange}
        placeholder={strings.clientNamePlaceholder}
      />
      <Input
        label={strings.notesOptional}
        value={notes}
        onChangeText={onNotesChange}
        placeholder={strings.quoteNotesPlaceholder}
        multiline
      />
    </View>
  );
}
