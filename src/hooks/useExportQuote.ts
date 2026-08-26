import { useRef, useState, useCallback } from 'react';
import { View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as quoteRepository from '../services/db/repositories/quote.repository';
import type { Quote } from '../types';

export function useExportQuote() {
  const viewShotRef = useRef<ViewShot>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportQuote = useCallback(async (quote: Quote) => {
    setIsExporting(true);
    setError(null);
    try {
      if (!viewShotRef.current) {
        throw new Error('Referencia de captura no disponible');
      }
      const uri = await viewShotRef.current.capture?.();
      if (!uri) {
        throw new Error('No se pudo capturar la imagen');
      }
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Compartir no está disponible en este dispositivo');
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartir Cotización',
        UTI: 'public.png',
      });
      quoteRepository.updateQuoteStatus(quote.id, 'sent');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al exportar';
      setError(message);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { viewShotRef, exportQuote, isExporting, error };
}
