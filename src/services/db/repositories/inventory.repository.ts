import { getDatabase } from '../../../lib/db';
import type { InventoryItem } from '../../../types';

function mapRow(row: Record<string, unknown>): InventoryItem {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    category: row.category as string,
    quantity: row.quantity as number,
    unit: row.unit as string,
    purchasePriceUSD: row.purchasePriceUSD as number,
    purchasePriceVES: row.purchasePriceVES as number,
    exchangeRateAtPurchase: row.exchangeRateAtPurchase as number,
    supplier: row.supplier as string | undefined,
    purchaseDate: row.purchaseDate as string,
    notes: row.notes as string | undefined,
    photoUri: row.photoUri as string | undefined,
    lowStockThreshold: row.lowStockThreshold as number | undefined,
    createdAt: row.createdAt as string,
  };
}

export function getAllItems(): InventoryItem[] {
  const db = getDatabase();
  const rows = db.getAllSync<Record<string, unknown>>(
    'SELECT * FROM inventory_items ORDER BY createdAt DESC',
  );
  return rows.map(mapRow);
}

export function getItemById(id: string): InventoryItem | undefined {
  const db = getDatabase();
  const row = db.getFirstSync<Record<string, unknown>>(
    'SELECT * FROM inventory_items WHERE id = ?',
    id,
  );
  return row ? mapRow(row) : undefined;
}

export function createItem(item: InventoryItem): void {
  const db = getDatabase();
  db.runSync(
    `INSERT INTO inventory_items (id, name, description, category, quantity, unit, purchasePriceUSD, purchasePriceVES, exchangeRateAtPurchase, supplier, purchaseDate, notes, photoUri, lowStockThreshold, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    item.id,
    item.name,
    item.description ?? null,
    item.category,
    item.quantity,
    item.unit,
    item.purchasePriceUSD,
    item.purchasePriceVES,
    item.exchangeRateAtPurchase,
    item.supplier ?? null,
    item.purchaseDate,
    item.notes ?? null,
    item.photoUri ?? null,
    item.lowStockThreshold ?? null,
    item.createdAt,
  );
}

export function updateItem(item: InventoryItem): void {
  const db = getDatabase();
  db.runSync(
    `UPDATE inventory_items
     SET name = ?, description = ?, category = ?, quantity = ?, unit = ?,
         purchasePriceUSD = ?, purchasePriceVES = ?, exchangeRateAtPurchase = ?,
         supplier = ?, purchaseDate = ?, notes = ?, photoUri = ?, lowStockThreshold = ?
     WHERE id = ?`,
    item.name,
    item.description ?? null,
    item.category,
    item.quantity,
    item.unit,
    item.purchasePriceUSD,
    item.purchasePriceVES,
    item.exchangeRateAtPurchase,
    item.supplier ?? null,
    item.purchaseDate,
    item.notes ?? null,
    item.photoUri ?? null,
    item.lowStockThreshold ?? null,
    item.id,
  );
}

export function deleteItem(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM inventory_items WHERE id = ?', id);
}
