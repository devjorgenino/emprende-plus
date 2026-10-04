import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useSaleStore } from '../../src/store/sale.store';
import { ClientPicker } from '../../src/components/shared/ClientPicker';
import { strings } from '../../src/constants/strings';
import type { PaymentMethod } from '../../src/types';

const PAYMENT_METHODS: { key: PaymentMethod; label: string }[] = [
  { key: 'usd_cash', label: strings.paymentUsdCash },
  { key: 'ves_cash', label: strings.paymentVesCash },
  { key: 'pago_movil', label: strings.paymentPagoMovil },
  { key: 'kontigo', label: strings.paymentKontigo },
  { key: 'binance', label: strings.paymentBinance },
  { key: 'transfer_ves', label: strings.paymentTransferVesFull },
  { key: 'other', label: strings.paymentOther },
];

const methodLabels: Record<string, string> = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.key, m.label]),
);

export default function SaleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const sale = useSaleStore((s) => s.sales.find((x) => x.id === id));
  const updateSale = useSaleStore((s) => s.updateSale);
  const deleteSale = useSaleStore((s) => s.deleteSale);

  const [isEditing, setIsEditing] = useState(false);
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('usd_cash');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDateEditor, setShowDateEditor] = useState(false);
  const [dateDay, setDateDay] = useState('');
  const [dateMonth, setDateMonth] = useState('');
  const [dateYear, setDateYear] = useState('');

  function parseDateFromSale(d: string) {
    const dt = new Date(d);
    setDateDay(String(dt.getDate()).padStart(2, '0'));
    setDateMonth(String(dt.getMonth() + 1).padStart(2, '0'));
    setDateYear(String(dt.getFullYear()));
  }

  function startEdit() {
    if (!sale) return;
    setClientName(sale.clientName || '');
    setNotes(sale.notes || '');
    setPaymentMethod(sale.paymentMethod);
    parseDateFromSale(sale.createdAt);
    setShowDateEditor(false);
    setIsEditing(true);
  }

  async function handleSave() {
    if (!sale || !id) return;
    setIsSaving(true);
    try {
      const d = new Date(
        parseInt(dateYear, 10) || new Date().getFullYear(),
        (parseInt(dateMonth, 10) || new Date().getMonth() + 1) - 1,
        parseInt(dateDay, 10) || new Date().getDate(),
      );
      await updateSale({
        ...sale,
        clientName: clientName || strings.defaultClientName,
        notes,
        paymentMethod,
        createdAt: d.toISOString(),
      });
      setIsEditing(false);
    } catch {
      Alert.alert(strings.errorTitle, strings.updateSaleError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert(strings.deleteSale, strings.deleteSaleConfirm, [
      { text: strings.cancel, style: 'cancel' },
      {
        text: strings.delete,
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deleteSale(id!);
            router.back();
          } catch {
            Alert.alert(strings.errorTitle, strings.deleteSaleError);
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  }

  if (!sale) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
        }}
      >
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <Stack.Screen
        options={{
          title: isEditing ? strings.editSale : strings.saleDetailTitle,
        }}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {isEditing ? (
          <>
            {/* Editar cliente */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: 8,
                }}
              >
                {strings.clientSection}
              </Text>
              <ClientPicker value={clientName} onChange={setClientName} />
            </View>

            {/* Editar método de pago */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: 8,
                }}
              >
                {strings.paymentMethodSection}
              </Text>
              <View style={{ gap: 6 }}>
                {PAYMENT_METHODS.map((pm) => (
                  <TouchableOpacity
                    key={pm.key}
                    onPress={() => setPaymentMethod(pm.key)}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor:
                        paymentMethod === pm.key ? '#6366F1' : '#e5e7eb',
                      backgroundColor:
                        paymentMethod === pm.key ? '#EEF2FF' : '#fff',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: paymentMethod === pm.key ? '#6366F1' : '#374151',
                        fontWeight: paymentMethod === pm.key ? '600' : '400',
                      }}
                    >
                      {pm.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Editar fecha */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <TouchableOpacity
                onPress={() => setShowDateEditor(!showDateEditor)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}
                >
                  {strings.dateSection}
                </Text>
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                  {showDateEditor ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 14, color: '#111827', marginTop: 4 }}>
                {dateDay}/{dateMonth}/{dateYear}
              </Text>
              {showDateEditor && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#6b7280',
                        marginBottom: 4,
                      }}
                    >
                      {strings.dayLabel}
                    </Text>
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: '#fff',
                      }}
                    >
                      <TextInput
                        value={dateDay}
                        onChangeText={setDateDay}
                        placeholder="01"
                        placeholderTextColor="#9ca3af"
                        keyboardType="number-pad"
                        maxLength={2}
                        style={{
                          fontSize: 16,
                          color: '#111827',
                          padding: 0,
                          margin: 0,
                        }}
                      />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#6b7280',
                        marginBottom: 4,
                      }}
                    >
                      {strings.monthLabel}
                    </Text>
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: '#fff',
                      }}
                    >
                      <TextInput
                        value={dateMonth}
                        onChangeText={setDateMonth}
                        placeholder="01"
                        placeholderTextColor="#9ca3af"
                        keyboardType="number-pad"
                        maxLength={2}
                        style={{
                          fontSize: 16,
                          color: '#111827',
                          padding: 0,
                          margin: 0,
                        }}
                      />
                    </View>
                  </View>
                  <View style={{ flex: 2 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#6b7280',
                        marginBottom: 4,
                      }}
                    >
                      {strings.yearLabel}
                    </Text>
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: '#fff',
                      }}
                    >
                      <TextInput
                        value={dateYear}
                        onChangeText={setDateYear}
                        placeholder="2026"
                        placeholderTextColor="#9ca3af"
                        keyboardType="number-pad"
                        maxLength={4}
                        style={{
                          fontSize: 16,
                          color: '#111827',
                          padding: 0,
                          margin: 0,
                        }}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Editar notas */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: 8,
                }}
              >
                {strings.notesSection}
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: '#fff',
                }}
              >
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={strings.additionalNotes}
                  placeholderTextColor="#9ca3af"
                  multiline
                  style={{
                    fontSize: 16,
                    color: '#111827',
                    padding: 0,
                    margin: 0,
                    minHeight: 60,
                  }}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Encabezado */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#111827',
                    }}
                  >
                    {sale.clientName || strings.clientNotSpecified}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}
                  >
                    {new Date(sale.createdAt).toLocaleDateString('es-VE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#EEF2FF',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: '#6366F1',
                    }}
                  >
                    {methodLabels[sale.paymentMethod] || sale.paymentMethod}
                  </Text>
                </View>
              </View>
            </View>

            {/* Items */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: 12,
                  textTransform: 'uppercase',
                }}
              >
                {strings.sectionServices}
              </Text>
              {sale.items.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: idx < sale.items.length - 1 ? 1 : 0,
                    borderBottomColor: '#f3f4f6',
                  }}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#111827',
                      }}
                    >
                      {item.serviceName}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>
                      x{item.quantity} · ${item.priceUSD.toFixed(2)}{' '}
                      {strings.perUnit}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#111827',
                    }}
                  >
                    ${item.subtotalUSD.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Totales */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 15, color: '#6b7280' }}>
                  {strings.totalUSDLabel}
                </Text>
                <Text
                  style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}
                >
                  ${sale.totalUSD.toFixed(2)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 15, color: '#6b7280' }}>
                  {strings.totalVESLabel}
                </Text>
                <Text
                  style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}
                >
                  Bs. {sale.totalVES.toFixed(2)}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                {strings.rateLabel} {sale.exchangeRate.toFixed(2)}
              </Text>
            </View>

            {sale.notes && (
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                  }}
                >
                  {strings.notesLabel}
                </Text>
                <Text style={{ fontSize: 14, color: '#374151' }}>
                  {sale.notes}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Botones */}
      <View
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#fff',
          gap: 8,
        }}
      >
        {isEditing ? (
          <>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={{
                backgroundColor: '#6366F1',
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                {isSaving ? strings.saving : strings.saveChanges}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsEditing(false)}
              style={{
                backgroundColor: '#fff',
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <Text
                style={{ color: '#6b7280', fontSize: 16, fontWeight: '600' }}
              >
                {strings.cancel}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={startEdit}
              style={{
                backgroundColor: '#6366F1',
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                {strings.editSale}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: '#fff',
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <Text
                style={{ color: '#6b7280', fontSize: 16, fontWeight: '600' }}
              >
                {strings.back}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              disabled={isDeleting}
              style={{
                backgroundColor: '#FEF2F2',
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#FECACA',
              }}
            >
              <Text
                style={{ color: '#DC2626', fontSize: 16, fontWeight: '600' }}
              >
                {isDeleting ? strings.deleting : strings.deleteSale}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
