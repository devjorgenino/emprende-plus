import { getDatabase } from '../../../lib/db';
import type { Quote, QuoteItem } from '../../../types';
import { generateId } from '../../../utils/id';

function mapQuote(row: Record<string, unknown>): Quote {
  return {
    id: row.id as string,
    items: [],
    totalUSD: row.totalUSD as number,
    totalVES: row.totalVES as number,
    exchangeRate: row.exchangeRate as number,
    exchangeRateDate: row.exchangeRateDate as string,
    clientName: row.clientName as string | undefined,
    notes: row.notes as string | undefined,
    status: row.status as Quote['status'],
    imageUri: row.imageUri as string | undefined,
    createdAt: row.createdAt as string,
  };
}

function mapQuoteItem(row: Record<string, unknown>): QuoteItem {
  return {
    serviceId: row.serviceId as string,
    serviceName: row.serviceName as string,
    priceUSD: row.priceUSD as number,
    quantity: row.quantity as number,
    subtotalUSD: row.subtotalUSD as number,
  };
}

export function getAllQuotes(): Quote[] {
  const db = getDatabase();
  const quoteRows = db.getAllSync<Record<string, unknown>>(
    'SELECT * FROM quotes ORDER BY createdAt DESC',
  );
  return quoteRows.map(mapQuote);
}

export function getQuoteById(id: string): Quote | undefined {
  const db = getDatabase();
  const quoteRow = db.getFirstSync<Record<string, unknown>>(
    'SELECT * FROM quotes WHERE id = ?',
    id,
  );
  if (!quoteRow) return undefined;
  const quote = mapQuote(quoteRow);
  const itemRows = db.getAllSync<Record<string, unknown>>(
    'SELECT * FROM quote_items WHERE quoteId = ?',
    id,
  );
  quote.items = itemRows.map(mapQuoteItem);
  return quote;
}

export function saveQuote(quote: Quote): void {
  const db = getDatabase();

  db.runSync(
    `INSERT OR REPLACE INTO quotes (id, totalUSD, totalVES, exchangeRate, exchangeRateDate, clientName, notes, status, imageUri, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    quote.id,
    quote.totalUSD,
    quote.totalVES,
    quote.exchangeRate,
    quote.exchangeRateDate,
    quote.clientName ?? null,
    quote.notes ?? null,
    quote.status,
    quote.imageUri ?? null,
    quote.createdAt,
  );

  db.runSync('DELETE FROM quote_items WHERE quoteId = ?', quote.id);

  for (const item of quote.items) {
    db.runSync(
      `INSERT INTO quote_items (id, quoteId, serviceId, serviceName, priceUSD, quantity, subtotalUSD)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      generateId(),
      quote.id,
      item.serviceId,
      item.serviceName,
      item.priceUSD,
      item.quantity,
      item.subtotalUSD,
    );
  }
}

export function updateQuoteStatus(id: string, status: Quote['status']): void {
  const db = getDatabase();
  db.runSync('UPDATE quotes SET status = ? WHERE id = ?', status, id);
}

export function deleteQuote(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM quote_items WHERE quoteId = ?', id);
  db.runSync('DELETE FROM quotes WHERE id = ?', id);
}
