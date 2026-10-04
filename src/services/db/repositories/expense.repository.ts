import { getDatabase } from '../../../lib/db';
import type { Expense } from '../../../types';

function mapExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    description: row.description as string,
    category: row.category as string,
    amountUSD: row.amountUSD as number,
    amountVES: row.amountVES as number,
    exchangeRate: row.exchangeRate as number,
    paymentMethod: row.paymentMethod as Expense['paymentMethod'],
    supplier: row.supplier as string | undefined,
    notes: row.notes as string | undefined,
    createdAt: row.createdAt as string,
  };
}

export function getAllExpenses(): Expense[] {
  const db = getDatabase();
  const rows = db.getAllSync<Record<string, unknown>>(
    'SELECT * FROM expenses ORDER BY createdAt DESC',
  );
  return rows.map(mapExpense);
}

export function getExpenseById(id: string): Expense | undefined {
  const db = getDatabase();
  const row = db.getFirstSync<Record<string, unknown>>(
    'SELECT * FROM expenses WHERE id = ?',
    id,
  );
  return row ? mapExpense(row) : undefined;
}

export function createExpense(expense: Expense): void {
  const db = getDatabase();
  db.runSync(
    `INSERT INTO expenses (id, description, category, amountUSD, amountVES, exchangeRate, paymentMethod, supplier, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    expense.id,
    expense.description,
    expense.category,
    expense.amountUSD,
    expense.amountVES,
    expense.exchangeRate,
    expense.paymentMethod,
    expense.supplier ?? null,
    expense.notes ?? null,
    expense.createdAt,
  );
}

export function updateExpense(expense: Expense): void {
  const db = getDatabase();
  db.runSync(
    `UPDATE expenses SET description = ?, category = ?, amountUSD = ?, amountVES = ?, exchangeRate = ?, paymentMethod = ?, supplier = ?, notes = ?
     WHERE id = ?`,
    expense.description,
    expense.category,
    expense.amountUSD,
    expense.amountVES,
    expense.exchangeRate,
    expense.paymentMethod,
    expense.supplier ?? null,
    expense.notes ?? null,
    expense.id,
  );
}

export function deleteExpense(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM expenses WHERE id = ?', id);
}
