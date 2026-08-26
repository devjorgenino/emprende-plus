import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { strings } from '../../constants/strings';
import type { CreateServiceInput } from '../../types';

interface ServiceFormProps {
  initialValues?: Partial<CreateServiceInput & { priceVES?: number }>;
  exchangeRate: number | null;
  onSubmit: (data: CreateServiceInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ServiceForm({ initialValues, exchangeRate, onSubmit, onCancel, isSubmitting }: ServiceFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [priceUSD, setPriceUSD] = useState(initialValues?.priceUSD?.toString() ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const priceUSDNum = parseFloat(priceUSD) || 0;
  const priceVES = exchangeRate ? priceUSDNum * exchangeRate : 0;

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = strings.nameRequired;
    const price = parseFloat(priceUSD);
    if (isNaN(price) || price <= 0) newErrors.priceUSD = strings.priceMustBePositive;
    if (!exchangeRate) newErrors.exchangeRate = strings.noRateConnectivity;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      priceUSD: parseFloat(priceUSD),
    });
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <Input
          label={strings.serviceName}
          value={name}
          onChangeText={setName}
          placeholder={strings.servicePlaceholder}
          error={errors.name}
        />

        <Input
          label={strings.serviceDescription}
          value={description}
          onChangeText={setDescription}
          placeholder={strings.serviceDescriptionPlaceholder}
          multiline
        />

        <Input
          label={strings.servicePrice}
          value={priceUSD}
          onChangeText={setPriceUSD}
          placeholder="0.00"
          keyboardType="decimal-pad"
          error={errors.priceUSD}
        />

        {exchangeRate && (
          <View className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              {strings.priceInVES} <Text className="font-bold text-indigo-700 dark:text-indigo-300">Bs. {priceVES.toFixed(2)}</Text>
            </Text>
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {strings.rateBcvLabel} {exchangeRate.toFixed(2)}
            </Text>
          </View>
        )}

        {errors.exchangeRate && (
          <View className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
            <Text className="text-red-600 dark:text-red-400 text-sm">{errors.exchangeRate}</Text>
          </View>
        )}

        <View className="flex-row gap-3 mt-4">
          <View className="flex-1">
            <Button title={strings.cancel} onPress={onCancel} variant="ghost" />
          </View>
          <View className="flex-1">
            <Button
              title={strings.save}
              onPress={handleSubmit}
              disabled={isSubmitting || !exchangeRate}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
