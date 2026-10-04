import { getDatabase } from '../../../lib/db';
import type { Sale, QuoteItem } from '../../../types';
import { generateId } from '../../../utils/id';

function mapSale(row: Record<string, unknown>, items: QuoteItem[] = []): Sale {
  return {
    id: row.id as string,
    quoteId: row.quoteId as string | undefined,
    items,
    totalUSD: row.totalUSD as number,
    totalVES: row.totalVES as number,
    exchangeRate: row.exchangeRate as number,
    clientName: row.clientName as string | undefined,
    paymentMethod: row.paymentMethod as Sale['paymentMethod'],
    notes: row.notes as string | undefined,
    createdAt: row.createdAt as string,
  };
}

export function getAllSales(): Sale[] {
  const db = getDatabase();
  const rows = db.getAllSync<Record<string, unknown>>(
    'SELECT * FROM sales ORDER BY createdAt DESC',
  );
  return rows.map((row) => {
    const items = db
      .getAllSync<
        Record<string, unknown>
      >('SELECT * FROM sale_items WHERE saleId = ?', row.id as string)
      .map(mapSaleItem);
    return mapSale(row, items);
  });
}

function mapSaleItem(row: Record<string, unknown>): QuoteItem {
  return {
    serviceId: row.serviceId as string,
    serviceName: row.serviceName as string,
    priceUSD: row.priceUSD as number,
    quantity: row.quantity as number,
    subtotalUSD: row.subtotalUSD as number,
  };
}

export function getSaleById(id: string): Sale | undefined {
  const db = getDatabase();
  const row = db.getFirstSync<Record<string, unknown>>(
    'SELECT * FROM sales WHERE id = ?',
    id,
  );
  if (!row) return undefined;
  const items = db
    .getAllSync<
      Record<string, unknown>
    >('SELECT * FROM sale_items WHERE saleId = ?', id)
    .map(mapSaleItem);
  return mapSale(row, items);
}

export function createSale(sale: Sale): void {
  const db = getDatabase();
  db.runSync(
    `INSERT INTO sales (id, quoteId, totalUSD, totalVES, exchangeRate, clientName, paymentMethod, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    sale.id,
    sale.quoteId ?? null,
    sale.totalUSD,
    sale.totalVES,
    sale.exchangeRate,
    sale.clientName ?? null,
    sale.paymentMethod,
    sale.notes ?? null,
    sale.createdAt,
  );
  for (const item of sale.items) {
    db.runSync(
      `INSERT INTO sale_items (id, saleId, serviceId, serviceName, priceUSD, quantity, subtotalUSD)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      generateId(),
      sale.id,
      item.serviceId,
      item.serviceName,
      item.priceUSD,
      item.quantity,
      item.subtotalUSD,
    );
  }
}

export function updateSale(sale: Sale): void {
  const db = getDatabase();
  db.runSync(
    `UPDATE sales SET totalUSD = ?, totalVES = ?, exchangeRate = ?, clientName = ?, paymentMethod = ?, notes = ?, createdAt = ? WHERE id = ?`,
    sale.totalUSD,
    sale.totalVES,
    sale.exchangeRate,
    sale.clientName ?? null,
    sale.paymentMethod,
    sale.notes ?? null,
    sale.createdAt,
    sale.id,
  );
  db.runSync('DELETE FROM sale_items WHERE saleId = ?', sale.id);
  for (const item of sale.items) {
    db.runSync(
      `INSERT INTO sale_items (id, saleId, serviceId, serviceName, priceUSD, quantity, subtotalUSD)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      generateId(),
      sale.id,
      item.serviceId,
      item.serviceName,
      item.priceUSD,
      item.quantity,
      item.subtotalUSD,
    );
  }
}

export function deleteSale(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM sale_items WHERE saleId = ?', id);
  db.runSync('DELETE FROM sales WHERE id = ?', id);
}
