import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { colors } from '../../constants/colors';
import { strings } from '../../constants/strings';
import type { CreateExpenseInput, PaymentMethod } from '../../types';

const CATEGORIES = [strings.categoryMaterials, strings.categorySupplies, strings.categoryServices, strings.categoryTransport, strings.categoryMarketing, strings.paymentOther];
const PAYMENT_METHODS: { key: PaymentMethod; label: string }[] = [
  { key: 'usd_cash', label: strings.paymentUsdCash },
  { key: 'ves_cash', label: strings.paymentVesCash },
  { key: 'pago_movil', label: strings.paymentPagoMovil },
  { key: 'kontigo', label: strings.paymentKontigo },
  { key: 'binance', label: strings.paymentBinance },
  { key: 'transfer_ves', label: strings.paymentTransferVesFull },
  { key: 'other', label: strings.paymentOther },
];

interface ExpenseFormProps {
  initialValues?: Partial<CreateExpenseInput>;
  exchangeRate: number | null;
  onSubmit: (data: CreateExpenseInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ExpenseForm({ initialValues, exchangeRate, onSubmit, onCancel, isSubmitting }: ExpenseFormProps) {
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? CATEGORIES[0]);
  const [amountUSD, setAmountUSD] = useState(initialValues?.amountUSD?.toString() ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialValues?.paymentMethod ?? 'usd_cash');
  const [supplier, setSupplier] = useState(initialValues?.supplier ?? '');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const amountUSDNum = parseFloat(amountUSD) || 0;
  const amountVES = exchangeRate ? amountUSDNum * exchangeRate : 0;

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) newErrors.description = strings.descriptionRequired;
    const amount = parseFloat(amountUSD);
    if (isNaN(amount) || amount <= 0) newErrors.amountUSD = strings.amountMustBePositive;
    if (!exchangeRate) newErrors.exchangeRate = strings.noRateAvailableShort;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSubmit({
      description: description.trim(),
      category,
      amountUSD: parseFloat(amountUSD),
      paymentMethod,
      supplier: supplier.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <Input
          label={strings.description}
          value={description}
          onChangeText={setDescription}
          placeholder={strings.expenseDescriptionPlaceholder}
          error={errors.description}
        />

        <Text className="text-sm font-medium text-gray-700 mb-2">{strings.category}</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full border ${
                category === cat
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text className={`text-sm ${category === cat ? 'text-white' : 'text-gray-700'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label={strings.amountLabel}
          value={amountUSD}
          onChangeText={setAmountUSD}
          placeholder="0.00"
          keyboardType="decimal-pad"
          error={errors.amountUSD}
        />

        {exchangeRate && (
          <View className="mb-4 p-3 bg-indigo-50 rounded-lg">
            <Text className="text-sm text-gray-600">
              {strings.amountInVES} <Text className="font-bold text-indigo-700">Bs. {amountVES.toFixed(2)}</Text>
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              {strings.rateLabel} {exchangeRate.toFixed(2)}
            </Text>
          </View>
        )}

        {errors.exchangeRate && (
          <View className="mb-4 p-3 bg-red-50 rounded-lg">
            <Text className="text-red-600 text-sm">{errors.exchangeRate}</Text>
          </View>
        )}

        <Text className="text-sm font-medium text-gray-700 mb-2">{strings.paymentMethod}</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {PAYMENT_METHODS.map((pm) => (
            <TouchableOpacity
              key={pm.key}
              onPress={() => setPaymentMethod(pm.key)}
              className={`px-4 py-2 rounded-full border ${
                paymentMethod === pm.key
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text className={`text-sm ${paymentMethod === pm.key ? 'text-white' : 'text-gray-700'}`}>
                {pm.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label={strings.supplierOptional}
          value={supplier}
          onChangeText={setSupplier}
          placeholder={strings.supplierPlaceholder}
        />

        <Input
          label={strings.notesOptional}
          value={notes}
          onChangeText={setNotes}
          placeholder={strings.additionalNotes}
          multiline
        />

        <View className="flex-row gap-3 mt-2">
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
