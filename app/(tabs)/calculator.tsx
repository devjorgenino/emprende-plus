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
  const [searchQuery, setSearchQuery] = useState('');
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
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const activeServices = services.filter((s) => s.isActive);
  const filteredServices = activeServices.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Segmented control */}
      <View className="flex-row mx-4 mt-4 bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
        <TouchableOpacity
          onPress={() => switchMode('select')}
          className={`flex-1 py-2 rounded-md items-center ${mode === 'select' ? 'bg-white dark:bg-gray-700' : 'bg-transparent'}`}
        >
          <Text className={`text-sm font-medium ${mode === 'select' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
            Servicios
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => switchMode('cart')}
          className={`flex-1 py-2 rounded-md items-center flex-row justify-center ${mode === 'cart' ? 'bg-white dark:bg-gray-700' : 'bg-transparent'}`}
        >
          <Text className={`text-sm font-medium ${mode === 'cart' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
            Carrito
          </Text>
          {items.length > 0 && (
            <View className="bg-indigo-600 rounded-full w-5 h-5 items-center justify-center ml-1.5">
              <Text className="text-white text-[11px] font-bold">{items.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="always">
        {mode === 'select' ? (
          <View className="pt-3">
            {/* Buscador de servicios */}
            <View className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-3">
              <Ionicons name="search" size={18} color="#9ca3af" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar servicio..."
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-2 text-base text-gray-900 dark:text-gray-100"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              ) : null}
            </View>

            {filteredServices.length === 0 ? (
              <View className="py-12 items-center">
                <Text className="text-base text-gray-400">
                  {activeServices.length === 0 ? 'No hay servicios activos' : 'Sin resultados para la búsqueda'}
                </Text>
              </View>
            ) : (
              filteredServices.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => handleSelect(s.id, s.name, s.priceUSD)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-2 border border-gray-200 dark:border-gray-700"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1 mr-3">
                      <Text className="text-base font-medium text-gray-900 dark:text-gray-100">{s.name}</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">${s.priceUSD.toFixed(2)}</Text>
                    </View>
                    <View className="bg-indigo-600 rounded-full w-8 h-8 items-center justify-center">
                      <Text className="text-white text-lg font-semibold">+</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <View className="pt-3 pb-16">
            {items.length === 0 ? (
              <View className="py-12 items-center">
                <Text className="text-base text-gray-400">Carrito vacío</Text>
                <Text className="text-sm text-gray-400 mt-1">Selecciona servicios para cotizar</Text>
                <TouchableOpacity
                  onPress={() => switchMode('select')}
                  className="mt-4 bg-indigo-600 px-6 py-3 rounded-lg"
                >
                  <Text className="text-white text-sm font-medium">Ver servicios</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* ViewShot oculto para exportación limpia — estilos fijos claros */}
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
                <View className="pt-3">
                  {items.map((item) => (
                    <View key={item.serviceId} className="bg-white dark:bg-gray-800 rounded-xl p-3 mb-2 border border-gray-200 dark:border-gray-700">
                      <View className="flex-row items-center">
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.serviceName}</Text>
                          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${item.priceUSD.toFixed(2)} c/u</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <TouchableOpacity
                            onPress={() => { if (item.quantity <= 1) { removeItem(item.serviceId); } else { updateQuantity(item.serviceId, item.quantity - 1); } }}
                            className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/40 items-center justify-center"
                          >
                            <Ionicons name="remove" size={18} color="#6366F1" />
                          </TouchableOpacity>
                          <Text className="text-base font-semibold text-gray-900 dark:text-gray-100 min-w-6 text-center">{item.quantity}</Text>
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.serviceId, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/40 items-center justify-center"
                          >
                            <Ionicons name="add" size={18} color="#6366F1" />
                          </TouchableOpacity>
                        </View>
                        <View className="items-end ml-3 min-w-[72px]">
                          <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">${item.subtotalUSD.toFixed(2)}</Text>
                          {rate && (
                            <Text className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Bs. {(item.subtotalUSD * rate).toFixed(2)}</Text>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={() => removeItem(item.serviceId)}
                          className="ml-2 w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 items-center justify-center"
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Totales */}
                <View className="mt-2 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                  <View className="flex-row justify-between">
                    <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">Total USD</Text>
                    <Text className="text-base font-bold text-gray-900 dark:text-gray-100">${totalUSD.toFixed(2)}</Text>
                  </View>
                  {rate && (
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-sm text-gray-500 dark:text-gray-400">Total Bs.</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">Bs. {totalVES.toFixed(2)}</Text>
                    </View>
                  )}
                  {rate && (
                    <Text className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">Tasa: 1 USD = Bs. {rate.toFixed(2)}</Text>
                  )}
                </View>

                {/* Botones acción */}
                <View className="flex-row gap-2 mt-4 mb-3">
                  <TouchableOpacity
                    onPress={handleShare}
                    disabled={isExporting}
                    className="flex-1 bg-white dark:bg-gray-800 py-3.5 rounded-lg items-center border border-gray-200 dark:border-gray-700 flex-row justify-center gap-1.5"
                  >
                    <Ionicons name="share-outline" size={18} color="#6366F1" />
                    <Text className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">{isExporting ? 'Compartiendo...' : 'Compartir'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={!rate || items.length === 0 || isSaving || saved}
                    className={`flex-1 py-3.5 rounded-lg items-center flex-row justify-center gap-1.5 ${!rate || items.length === 0 || isSaving || saved ? 'bg-gray-400' : 'bg-indigo-600'}`}
                  >
                    <Ionicons name="save-outline" size={18} color="#fff" />
                    <Text className="text-white text-sm font-semibold">
                      {saved ? '¡Guardada!' : 'Guardar'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Cliente y notas — colapsable */}
                <TouchableOpacity
                  onPress={() => setShowClientForm(!showClientForm)}
                  className="flex-row items-center justify-between py-3 px-1 mb-1"
                >
                  <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">Cliente y notas (opcional)</Text>
                  <Text className="text-xs text-gray-400">{showClientForm ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {showClientForm && (
                  <View className="mb-3">
                    <View className="mb-3">
                      <Text className="text-[13px] text-gray-700 dark:text-gray-300 mb-1">Nombre del cliente</Text>
                      <ClientPicker value={clientName} onChange={setClientName} />
                    </View>
                    <View>
                      <Text className="text-[13px] text-gray-700 dark:text-gray-300 mb-1">Notas</Text>
                      <View className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 bg-white dark:bg-gray-800">
                        <TextInput
                          value={notes}
                          onChangeText={setNotes}
                          placeholder="Notas adicionales"
                          placeholderTextColor="#9ca3af"
                          multiline
                          className="text-base text-gray-900 dark:text-gray-100 p-0 m-0 min-h-[60px]"
                        />
                      </View>
                    </View>
                  </View>
                )}

                {!rate && (
                  <View className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">
                    <Text className="text-red-600 dark:text-red-400 text-[13px]">No hay tasa BCV disponible. Verifica tu conexión o ingresa la tasa manualmente.</Text>
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
