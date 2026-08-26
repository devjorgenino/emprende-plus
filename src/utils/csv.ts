import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Sale, Expense } from '../types';

function escapeCSV(val: string | number | undefined | null): string {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function salesToCSV(sales: Sale[]): string {
  const header = 'Fecha,Cliente,Total USD,Total VES,Tasa BCV,Método de Pago,Notas,Items';
  const rows = sales.map((s) => {
    const itemsStr = s.items
      .map((i) => `${escapeCSV(i.serviceName)}(x${i.quantity} $${i.subtotalUSD.toFixed(2)})`)
      .join('; ');
    return [
      escapeCSV(new Date(s.createdAt).toLocaleDateString('es-VE')),
      escapeCSV(s.clientName ?? ''),
      escapeCSV(s.totalUSD.toFixed(2)),
      escapeCSV(s.totalVES.toFixed(2)),
      escapeCSV(s.exchangeRate.toFixed(2)),
      escapeCSV(s.paymentMethod),
      escapeCSV(s.notes ?? ''),
      itemsStr,
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

export async function exportSalesToCSV(sales: Sale[]): Promise<void> {
  const csv = salesToCSV(sales);
  const uri = FileSystem.cacheDirectory + `ventas_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Exportar Ventas' });
  }
}

function expensesToCSV(expenses: Expense[]): string {
  const header = 'Fecha,Descripción,Categoría,Monto USD,Monto VES,Tasa BCV,Método de Pago,Proveedor,Notas';
  const rows = expenses.map((e) => [
    escapeCSV(new Date(e.createdAt).toLocaleDateString('es-VE')),
    escapeCSV(e.description),
    escapeCSV(e.category),
    escapeCSV(e.amountUSD.toFixed(2)),
    escapeCSV(e.amountVES.toFixed(2)),
    escapeCSV(e.exchangeRate.toFixed(2)),
    escapeCSV(e.paymentMethod),
    escapeCSV(e.supplier ?? ''),
    escapeCSV(e.notes ?? ''),
  ].join(','));
  return [header, ...rows].join('\n');
}

export async function exportExpensesToCSV(expenses: Expense[]): Promise<void> {
  const csv = expensesToCSV(expenses);
  const uri = FileSystem.cacheDirectory + `egresos_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Exportar Egresos' });
  }
}
