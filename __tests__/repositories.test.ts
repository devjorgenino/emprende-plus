import { closeDatabase } from '../src/lib/db';
import { initializeDatabase } from '../src/services/db/schema';
import { runMigrations } from '../src/services/db/migrations';
import { generateId } from '../src/utils/id';
import * as serviceRepository from '../src/services/db/repositories/service.repository';
import * as inventoryRepository from '../src/services/db/repositories/inventory.repository';
import * as expenseRepository from '../src/services/db/repositories/expense.repository';
import type { Service, InventoryItem, Expense } from '../src/types';
import { __resetCounter } from '../__mocks__/expo-crypto';

function resetDb(): void {
  closeDatabase();
  initializeDatabase();
  runMigrations();
  __resetCounter();
}

function makeService(overrides: Partial<Service> = {}): Service {
  return {
    id: generateId(),
    name: 'Servicio Test',
    description: undefined,
    priceUSD: 100,
    priceVES: 3650,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeInventory(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: generateId(),
    name: 'Material Test',
    description: undefined,
    category: 'General',
    quantity: 5,
    unit: 'unidad',
    purchasePriceUSD: 10,
    purchasePriceVES: 365,
    exchangeRateAtPurchase: 36.5,
    supplier: undefined,
    purchaseDate: new Date().toISOString(),
    notes: undefined,
    photoUri: undefined,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: generateId(),
    description: 'Gasto Test',
    category: 'Insumos',
    amountUSD: 20,
    amountVES: 730,
    exchangeRate: 36.5,
    paymentMethod: 'usd_cash',
    supplier: undefined,
    notes: undefined,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('ServiceRepository', () => {
  beforeEach(resetDb);

  it('guarda y recupera un servicio por id', () => {
    const s = makeService({ name: 'Logo' });
    serviceRepository.createService(s);
    const found = serviceRepository.getServiceById(s.id);
    expect(found?.name).toBe('Logo');
    expect(found?.priceUSD).toBe(100);
  });

  it('listar todos ordena por createdAt DESC', () => {
    const old = makeService({ name: 'Viejo', createdAt: '2020-01-01T00:00:00.000Z' });
    const recent = makeService({ name: 'Nuevo', createdAt: '2026-01-01T00:00:00.000Z' });
    serviceRepository.createService(old);
    serviceRepository.createService(recent);
    const all = serviceRepository.getAllServices();
    expect(all[0].name).toBe('Nuevo');
  });

  it('actualiza un servicio', () => {
    const s = makeService({ name: 'A', priceUSD: 10 });
    serviceRepository.createService(s);
    serviceRepository.updateService({ ...s, name: 'B', priceUSD: 99, priceVES: 99 * 36.5, updatedAt: new Date().toISOString() });
    expect(serviceRepository.getServiceById(s.id)?.name).toBe('B');
    expect(serviceRepository.getServiceById(s.id)?.priceUSD).toBe(99);
  });

  it('elimina un servicio', () => {
    const s = makeService();
    serviceRepository.createService(s);
    serviceRepository.deleteService(s.id);
    expect(serviceRepository.getServiceById(s.id)).toBeUndefined();
  });
});

describe('InventoryRepository', () => {
  beforeEach(resetDb);

  it('guarda y recupera un item', () => {
    const item = makeInventory({ name: 'Tinta', quantity: 2.5, unit: 'litro' });
    inventoryRepository.createItem(item);
    const found = inventoryRepository.getItemById(item.id);
    expect(found?.name).toBe('Tinta');
    expect(found?.quantity).toBe(2.5);
    expect(found?.unit).toBe('litro');
  });

  it('actualiza la cantidad de un item', () => {
    const item = makeInventory({ quantity: 1 });
    inventoryRepository.createItem(item);
    inventoryRepository.updateItem({ ...item, quantity: 10 });
    expect(inventoryRepository.getItemById(item.id)?.quantity).toBe(10);
  });

  it('persiste el umbral de stock bajo', () => {
    const item = makeInventory({ quantity: 2, lowStockThreshold: 5 });
    inventoryRepository.createItem(item);
    expect(inventoryRepository.getItemById(item.id)?.lowStockThreshold).toBe(5);
    inventoryRepository.updateItem({ ...item, lowStockThreshold: 3 });
    expect(inventoryRepository.getItemById(item.id)?.lowStockThreshold).toBe(3);
  });

  it('elimina un item', () => {
    const item = makeInventory();
    inventoryRepository.createItem(item);
    inventoryRepository.deleteItem(item.id);
    expect(inventoryRepository.getItemById(item.id)).toBeUndefined();
  });
});

describe('ExpenseRepository', () => {
  beforeEach(resetDb);

  it('guarda y recupera un egreso', () => {
    const e = makeExpense({ description: 'Compra' });
    expenseRepository.createExpense(e);
    const found = expenseRepository.getExpenseById(e.id);
    expect(found?.description).toBe('Compra');
    expect(found?.amountUSD).toBe(20);
  });

  it('listar todos ordena por createdAt DESC', () => {
    const old = makeExpense({ description: 'Viejo', createdAt: '2020-01-01T00:00:00.000Z' });
    const recent = makeExpense({ description: 'Nuevo', createdAt: '2026-01-01T00:00:00.000Z' });
    expenseRepository.createExpense(old);
    expenseRepository.createExpense(recent);
    expect(expenseRepository.getAllExpenses()[0].description).toBe('Nuevo');
  });
});
