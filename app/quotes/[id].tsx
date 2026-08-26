import { useRef, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { getQuoteById, updateQuoteStatus } from '../../src/services/db/repositories/quote.repository';
import { useSaleStore } from '../../src/store/sale.store';
import { QuoteImage } from '../../src/components/shared/QuoteImage';
import { SaleForm } from '../../src/components/forms/SaleForm';
import { Button } from '../../src/components/ui/Button';
import { colors } from '../../src/constants/colors';
import { shareQuotePdf } from '../../src/services/pdf/quotePdf';
import type { Quote, PaymentMethod } from '../../src/types';

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const viewShotRef = useRef<ViewShot>(null);
  const [quote, setQuote] = useState<Quote | undefined>(() => (id ? getQuoteById(id) : undefined));
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [isSavingSale, setIsSavingSale] = useState(false);
  const [saleSuccess, setSaleSuccess] = useState(false);
  const createSaleFromQuote = useSaleStore((s) => s.createSaleFromQuote);

  async function handleShare() {
    if (!quote || !viewShotRef.current) return;
    const captureFn = viewShotRef.current.capture;
    if (!captureFn) return;
    setIsExporting(true);
    setExportError(null);
    try {
      const uri = await captureFn();
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        setExportError('Compartir no está disponible en este dispositivo');
        setIsExporting(false);
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartir Cotización',
      });
      updateQuoteStatus(quote.id, 'sent');
      setQuote({ ...quote, status: 'sent' });
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Error al compartir');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportPdf() {
    if (!quote) return;
    setIsExportingPdf(true);
    setPdfError(null);
    try {
      await shareQuotePdf(quote);
      updateQuoteStatus(quote.id, 'sent');
      setQuote({ ...quote, status: 'sent' });
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : 'Error al exportar PDF');
    } finally {
      setIsExportingPdf(false);
    }
  }

  async function handleRegisterSale(paymentMethod: PaymentMethod) {
    if (!quote) return;
    setIsSavingSale(true);
    try {
      const saleId = await createSaleFromQuote(quote, paymentMethod);
      setSaleSuccess(true);
      setShowSaleForm(false);
      setQuote({ ...quote, status: 'accepted' });
      setTimeout(() => {
        setSaleSuccess(false);
        router.back();
      }, 1500);
    } catch {
      // Error manejado por el store
    } finally {
      setIsSavingSale(false);
    }
  }

  if (!quote) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-gray-500">Cargando cotización...</Text>
      </View>
    );
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Borrador', color: colors.textSecondary },
    sent: { label: 'Enviada', color: colors.primary },
    accepted: { label: 'Aceptada', color: colors.secondary },
    rejected: { label: 'Rechazada', color: colors.error },
  };
  const statusInfo = statusLabels[quote.status] || statusLabels.draft;

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: 'Detalle de Cotización' }} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="flex-row items-center gap-2 mb-4">
          <View className="rounded-full px-3 py-1" style={{ backgroundColor: statusInfo.color + '20' }}>
            <Text style={{ color: statusInfo.color }} className="text-xs font-semibold">{statusInfo.label}</Text>
          </View>
          <Text className="text-xs text-gray-400">{new Date(quote.createdAt).toLocaleDateString('es-VE')}</Text>
        </View>

        {quote.clientName && (
          <Text className="text-lg font-semibold text-gray-900 mb-4">Cliente: {quote.clientName}</Text>
        )}

        <View className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
          <Text className="text-sm font-semibold text-gray-500 uppercase mb-3">Servicios</Text>
          {quote.items.map((item, idx) => (
            <View key={idx} className="flex-row justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <View className="flex-1 mr-3">
                <Text className="text-sm text-gray-900">{item.serviceName}</Text>
                <Text className="text-xs text-gray-400">x{item.quantity} · ${item.priceUSD.toFixed(2)} c/u</Text>
              </View>
              <Text className="text-sm font-medium text-gray-900">${item.subtotalUSD.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-base text-gray-600">Total USD</Text>
            <Text className="text-base font-bold text-gray-900">${quote.totalUSD.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-base text-gray-600">Total VES</Text>
            <Text className="text-base font-bold text-gray-900">Bs. {quote.totalVES.toFixed(2)}</Text>
          </View>
          <Text className="text-xs text-gray-400 mt-2">
            Tasa: 1 USD = Bs. {quote.exchangeRate.toFixed(2)}
          </Text>
        </View>

        {quote.notes && (
          <View className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
            <Text className="text-sm font-semibold text-gray-500 uppercase mb-1">Notas</Text>
            <Text className="text-sm text-gray-700">{quote.notes}</Text>
          </View>
        )}

        {/* Hidden view shot for export */}
        <View className="absolute -left-[9999px]">
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
            <QuoteImage quote={quote} />
          </ViewShot>
        </View>

        {exportError && (
          <View className="p-3 bg-red-50 rounded-lg mb-4">
            <Text className="text-red-600 text-sm">{exportError}</Text>
          </View>
        )}

        {pdfError && (
          <View className="p-3 bg-red-50 rounded-lg mb-4">
            <Text className="text-red-600 text-sm">{pdfError}</Text>
          </View>
        )}

        {saleSuccess && (
          <View className="p-3 bg-emerald-50 rounded-lg mb-4">
            <Text className="text-emerald-700 text-sm font-medium">¡Venta registrada exitosamente!</Text>
          </View>
        )}
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200 gap-3">
        {quote.status !== 'accepted' && quote.status !== 'rejected' && (
          <>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button title={isExporting ? 'Exportando...' : 'Compartir'} onPress={handleShare} disabled={isExporting} variant="ghost" />
              </View>
              <View className="flex-1">
                <Button title={isExportingPdf ? 'Exportando...' : 'Exportar PDF'} onPress={handleExportPdf} disabled={isExportingPdf} variant="ghost" />
              </View>
            </View>
            <Button
              title={quote.status === 'draft' ? 'Registrar Venta' : 'Venta ya registrada'}
              onPress={() => setShowSaleForm(true)}
              disabled={quote.status !== 'draft'}
            />
          </>
        )}
      </View>

      {showSaleForm && (
        <View className="absolute inset-0 bg-black/50 justify-center">
          <View className="bg-white rounded-2xl mx-4">
            <SaleForm
              totalUSD={quote.totalUSD}
              totalVES={quote.totalVES}
              onConfirm={handleRegisterSale}
              onCancel={() => setShowSaleForm(false)}
              isSubmitting={isSavingSale}
            />
          </View>
        </View>
      )}
    </View>
  );
}
