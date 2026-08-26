import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, InteractionManager, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useServiceStore } from '../../src/store/service.store';
import { useQuoteStore } from '../../src/store/quote.store';
import { useRateStore } from '../../src/store/rate.store';
import { ClientPicker } from '../../src/components/shared/ClientPicker';

export default function CalculatorScreen() {
  const router = useRouter();
  const services = useServiceStore((s) => s.services);
  const isLoading = useServiceStore((s) => s.isLoading);
  const loadServices = useServiceStore((s) => s.loadServices);
  const rate = useRateStore((s) => s.rate);
  const items = useQuoteStore((s) => s.items);
  const addItem = useQuoteStore((s) => s.addItem);
  const removeItem = useQuoteStore((s) => s.removeItem);
  const updateQuantity = useQuoteStore((s) => s.updateQuantity);
  const clientName = useQuoteStore((s) => s.clientName);
  const notes = useQuoteStore((s) => s.notes);
  const setClientName = useQuoteStore((s) => s.setClientName);
  const setNotes = useQuoteStore((s) => s.setNotes);
  const saveQuote = useQuoteStore((s) => s.saveQuote);

  useEffect(() => { loadServices(); }, []);

  const [mode, setMode] = useState('select');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const savedToastRef = useRef(false);
  const viewShotRef = useRef<ViewShot>(null);

  function switchMode(m: string) {
    if (m === 'cart' && !clientName) {
      setClientName('Servicio de Papeleria');
    }
    InteractionManager.runAfterInteractions(() => setMode(m));
  }

  function handleSelect(id: string, name: string, priceUSD: number) {
    addItem({ id, name, priceUSD });
  }

  const totalUSD = items.reduce((sum, i) => sum + i.subtotalUSD, 0);
  const totalVES = rate ? totalUSD * rate : 0;

  async function handleSave() {
    if (!rate || items.length === 0) return;
    setIsSaving(true);
    try {
      const quoteId = await saveQuote(rate, new Date().toISOString());
      savedToastRef.current = true;
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        savedToastRef.current = false;
        if (quoteId) {
          router.push(`/quotes/${quoteId}`);
        }
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleShare() {
    if (!viewShotRef.current || items.length === 0) return;
    const captureFn = viewShotRef.current.capture;
    if (!captureFn) return;
    setIsExporting(true);
    try {
      const uri = await captureFn();
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Compartir no disponible', 'Compartir no está disponible en este dispositivo');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartir Cotización' });
    } catch (e) {
      Alert.alert('Error', 'No se pudo compartir la cotización');
    } finally {
      setIsExporting(false);
    }
  }

  if (isLoading && services.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const activeServices = services.filter((s) => s.isActive);

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 16, backgroundColor: '#e5e7eb', borderRadius: 8, padding: 4 }}>
        <TouchableOpacity
          onPress={() => switchMode('select')}
          style={{ flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center', backgroundColor: mode === 'select' ? '#fff' : 'transparent' }}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: mode === 'select' ? '#6366F1' : '#6b7280' }}>Servicios</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => switchMode('cart')}
          style={{ flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center', backgroundColor: mode === 'cart' ? '#fff' : 'transparent' }}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: mode === 'cart' ? '#6366F1' : '#6b7280' }}>Carrito</Text>
          {items.length > 0 && (
            <View style={{ backgroundColor: '#6366F1', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 6 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{items.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} keyboardShouldPersistTaps="always">
        {mode === 'select' ? (
          <View style={{ paddingTop: 12 }}>
            {activeServices.length === 0 ? (
              <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#9ca3af' }}>No hay servicios activos</Text>
              </View>
            ) : (
              activeServices.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => handleSelect(s.id, s.name, s.priceUSD)}
                  style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>{s.name}</Text>
                      <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>${s.priceUSD.toFixed(2)}</Text>
                    </View>
                    <View style={{ backgroundColor: '#6366F1', borderRadius: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', lineHeight: 20 }}>+</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <View style={{ paddingTop: 12, paddingBottom: 64 }}>
            {items.length === 0 ? (
              <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#9ca3af' }}>Carrito vacío</Text>
                <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>Selecciona servicios para cotizar</Text>
                <TouchableOpacity onPress={() => switchMode('select')} style={{ marginTop: 16, backgroundColor: '#6366F1', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>Ver servicios</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
              {/* ViewShot oculto para exportación limpia */}
              <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
                  <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>Cotización</Text>
                    <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
                      {new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {clientName ? ` · ${clientName}` : ''}
                    </Text>
                    {items.map((item) => (
                      <View key={item.serviceId} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                          <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827' }}>{item.serviceName}</Text>
                          <Text style={{ fontSize: 12, color: '#6b7280' }}>x{item.quantity} · ${item.priceUSD.toFixed(2)} c/u</Text>
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>${item.subtotalUSD.toFixed(2)}</Text>
                      </View>
                    ))}
                    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 2, borderTopColor: '#e5e7eb' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Total</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>${totalUSD.toFixed(2)}</Text>
                      </View>
                      {rate && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                          <Text style={{ fontSize: 14, color: '#6b7280' }}>Total Bs.</Text>
                          <Text style={{ fontSize: 14, color: '#6b7280' }}>Bs. {totalVES.toFixed(2)}</Text>
                        </View>
                      )}
                      {rate && (
                        <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>Tasa: 1 USD = Bs. {rate.toFixed(2)}</Text>
                      )}
                    </View>
                  </View>
                </ViewShot>
              </View>

              {/* Items editables */}
              <View style={{ paddingTop: 12 }}>
                {items.map((item) => (
                  <View key={item.serviceId} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827' }}>{item.serviceName}</Text>
                        <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>${item.priceUSD.toFixed(2)} c/u</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity onPress={() => { if (item.quantity <= 1) { removeItem(item.serviceId); } else { updateQuantity(item.serviceId, item.quantity - 1); } }} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="remove" size={18} color="#6366F1" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', minWidth: 24, textAlign: 'center' }}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => updateQuantity(item.serviceId, item.quantity + 1)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="add" size={18} color="#6366F1" />
                        </TouchableOpacity>
                      </View>
                      <View style={{ alignItems: 'flex-end', marginLeft: 12, minWidth: 72 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>${item.subtotalUSD.toFixed(2)}</Text>
                        {rate && (
                          <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>Bs. {(item.subtotalUSD * rate).toFixed(2)}</Text>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => removeItem(item.serviceId)} style={{ marginLeft: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Totales */}
              <View style={{ marginTop: 8, paddingTop: 16, borderTopWidth: 2, borderTopColor: '#e5e7eb' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Total USD</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>${totalUSD.toFixed(2)}</Text>
                </View>
                {rate && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ fontSize: 14, color: '#6b7280' }}>Total Bs.</Text>
                    <Text style={{ fontSize: 14, color: '#6b7280' }}>Bs. {totalVES.toFixed(2)}</Text>
                  </View>
                )}
                {rate && (
                  <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>Tasa: 1 USD = Bs. {rate.toFixed(2)}</Text>
                )}
              </View>

              {/* Botones acción */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 12 }}>
                <TouchableOpacity
                  onPress={handleShare}
                  disabled={isExporting}
                  style={{ flex: 1, backgroundColor: '#fff', paddingVertical: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                >
                  <Ionicons name="share-outline" size={18} color="#6366F1" />
                  <Text style={{ color: '#6366F1', fontSize: 14, fontWeight: '500' }}>{isExporting ? 'Compartiendo...' : 'Compartir'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!rate || items.length === 0 || isSaving || saved}
                  style={{ flex: 1, backgroundColor: !rate || items.length === 0 || isSaving || saved ? '#9ca3af' : '#6366F1', paddingVertical: 14, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                >
                  <Ionicons name="save-outline" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                    {saved ? '¡Guardada!' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Cliente y notas — colapsable */}
              <TouchableOpacity
                onPress={() => setShowClientForm(!showClientForm)}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 4, marginBottom: 4 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>Cliente y notas (opcional)</Text>
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>{showClientForm ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showClientForm && (
                <View style={{ marginBottom: 12 }}>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>Nombre del cliente</Text>
                    <ClientPicker value={clientName} onChange={setClientName} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>Notas</Text>
                    <View style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' }}>
                      <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Notas adicionales"
                        placeholderTextColor="#9ca3af"
                        multiline
                        style={{ fontSize: 16, color: '#111827', padding: 0, margin: 0, minHeight: 60 }}
                      />
                    </View>
                  </View>
                </View>
              )}

              {!rate && (
                <View style={{ padding: 12, backgroundColor: '#FEF2F2', borderRadius: 8, marginBottom: 16 }}>
                  <Text style={{ color: '#DC2626', fontSize: 13 }}>No hay tasa BCV disponible. Verifica tu conexión o ingresa la tasa manualmente.</Text>
                </View>
              )}
            </>
          )}
        </View>
      )}
    </ScrollView>
    </View>
  );
}
