import { useServiceStore } from '../src/store/service.store';
import { useSaleStore } from '../src/store/sale.store';
import { useInventoryStore } from '../src/store/inventory.store';
import { useExpenseStore } from '../src/store/expense.store';
import { closeDatabase } from '../src/lib/db';
import { initializeDatabase } from '../src/services/db/schema';
import { runMigrations } from '../src/services/db/migrations';
import { useRateStore } from '../src/store/rate.store';
import { useToastStore } from '../src/store/toast.store';
import { __resetCounter } from '../__mocks__/expo-crypto';
import * as serviceRepository from '../src/services/db/repositories/service.repository';

function resetDb(): void {
  closeDatabase(); // clears the singleton cache in src/lib/db.ts
  initializeDatabase();
  runMigrations();
  __resetCounter();
}

const RATE = 36.5;

describe('ServiceStore', () => {
  beforeEach(() => {
    resetDb();
    useServiceStore.setState({ services: [], isLoading: false, error: null });
  });

  it('crea un servicio y lo agrega a la lista', async () => {
    await useServiceStore.getState().createService({ name: 'Diseño Logo', priceUSD: 50 }, RATE);
    const state = useServiceStore.getState();
    expect(state.services).toHaveLength(1);
    expect(state.services[0].name).toBe('Diseño Logo');
    expect(state.services[0].priceUSD).toBe(50);
    expect(state.services[0].priceVES).toBeCloseTo(50 * RATE, 2);
    expect(state.services[0].isActive).toBe(true);
  });

  it('actualiza un servicio y recalcula el precio VES', async () => {
    await useServiceStore.getState().createService({ name: 'Logo', priceUSD: 50 }, RATE);
    const id = useServiceStore.getState().services[0].id;
    await useServiceStore.getState().updateService(id, { priceUSD: 75 }, RATE);
    const updated = useServiceStore.getState().services[0];
    expect(updated.priceUSD).toBe(75);
    expect(updated.priceVES).toBeCloseTo(75 * RATE, 2);
  });

  it('elimina un servicio de la lista', async () => {
    await useServiceStore.getState().createService({ name: 'Logo', priceUSD: 50 }, RATE);
    const id = useServiceStore.getState().services[0].id;
    await useServiceStore.getState().deleteService(id);
    expect(useServiceStore.getState().services).toHaveLength(0);
  });

  it('persiste en SQLite: un segundo load recupera los datos', async () => {
    await useServiceStore.getState().createService({ name: 'Persistente', priceUSD: 10 }, RATE);
    useServiceStore.setState({ services: [] });
    await useServiceStore.getState().loadServices();
    expect(useServiceStore.getState().services).toHaveLength(1);
    expect(useServiceStore.getState().services[0].name).toBe('Persistente');
  });

  it('maneja el error al crear con repositorio caído', async () => {
    const spy = jest.spyOn(serviceRepository, 'createService').mockImplementation(() => {
      throw new Error('db down');
    });
    await expect(
      useServiceStore.getState().createService({ name: 'X', priceUSD: 1 }, RATE)
    ).rejects.toThrow('db down');
    expect(useServiceStore.getState().error).toBeTruthy();
    spy.mockRestore();
  });
});

describe('SaleStore', () => {
  beforeEach(() => {
    resetDb();
    useSaleStore.setState({ sales: [], isLoading: false, error: null });
  });

  function makeQuote() {
    return {
      id: 'quote-1',
      items: [{ serviceId: 's1', serviceName: 'Logo', priceUSD: 100, quantity: 1, subtotalUSD: 100 }],
      totalUSD: 100,
      totalVES: 3650,
      exchangeRate: 36.5,
      exchangeRateDate: new Date().toISOString(),
      clientName: 'Cliente A',
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
    };
  }

  it('crea una venta desde una cotización', async () => {
    const id = await useSaleStore.getState().createSaleFromQuote(makeQuote(), 'pago_movil');
    expect(id).toBeTruthy();
    const sale = useSaleStore.getState().getSaleById(id);
    expect(sale).toBeDefined();
    expect(sale!.paymentMethod).toBe('pago_movil');
    expect(sale!.clientName).toBe('Cliente A');
  });

  it('busca ventas por cliente (case-insensitive)', async () => {
    await useSaleStore.getState().createSaleFromQuote(makeQuote(), 'usd_cash');
    const results = useSaleStore.getState().searchSales('cliente a');
    expect(results).toHaveLength(1);
  });

  it('filtra ventas por rango de fechas', async () => {
    await useSaleStore.getState().createSaleFromQuote(makeQuote(), 'usd_cash');
    const start = new Date(Date.now() - 1000).toISOString();
    const end = new Date(Date.now() + 1000).toISOString();
    const total = useSaleStore.getState().getTotalUSDInRange(start, end);
    expect(total).toBe(100);
  });

  it('elimina una venta', async () => {
    const id = await useSaleStore.getState().createSaleFromQuote(makeQuote(), 'usd_cash');
    await useSaleStore.getState().deleteSale(id);
    expect(useSaleStore.getState().sales).toHaveLength(0);
  });
});

describe('InventoryStore', () => {
  beforeEach(() => {
    resetDb();
    useInventoryStore.setState({ items: [], isLoading: false, error: null });
  });

  it('crea un item y calcula VES con la tasa', async () => {
    await useInventoryStore
      .getState()
      .createItem(
        { name: 'Papel', category: 'Papelería', quantity: 10, unit: 'unidad', purchasePriceUSD: 2, purchaseDate: new Date().toISOString() },
        RATE
      );
    const item = useInventoryStore.getState().items[0];
    expect(item.name).toBe('Papel');
    expect(item.purchasePriceVES).toBeCloseTo(2 * RATE, 2);
    expect(item.exchangeRateAtPurchase).toBe(RATE);
  });

  it('actualiza cantidad de un item', async () => {
    await useInventoryStore
      .getState()
      .createItem(
        { name: 'Tinta', category: 'Impresión', quantity: 1, unit: 'litro', purchasePriceUSD: 5, purchaseDate: new Date().toISOString() },
        RATE
      );
    const id = useInventoryStore.getState().items[0].id;
    await useInventoryStore.getState().updateItem(id, { quantity: 3 }, RATE);
    expect(useInventoryStore.getState().items[0].quantity).toBe(3);
  });
});

describe('ExpenseStore', () => {
  beforeEach(() => {
    resetDb();
    useExpenseStore.setState({ expenses: [], isLoading: false, error: null });
  });

  it('crea un egreso con montos USD y VES', async () => {
    const id = await useExpenseStore
      .getState()
      .createExpense({ description: 'Compra de tinta', category: 'Insumos', amountUSD: 20, paymentMethod: 'usd_cash' }, RATE);
    const expense = useExpenseStore.getState().getExpenseById(id);
    expect(expense).toBeDefined();
    expect(expense!.amountVES).toBeCloseTo(20 * RATE, 2);
  });

  it('suma egresos en un rango', async () => {
    await useExpenseStore
      .getState()
      .createExpense({ description: 'A', category: 'C', amountUSD: 10, paymentMethod: 'usd_cash' }, RATE);
    await useExpenseStore
      .getState()
      .createExpense({ description: 'B', category: 'C', amountUSD: 15, paymentMethod: 'usd_cash' }, RATE);
    const start = new Date(Date.now() - 5000).toISOString();
    const end = new Date(Date.now() + 5000).toISOString();
    expect(useExpenseStore.getState().getTotalUSDInRange(start, end)).toBe(25);
  });
});

describe('RateStore', () => {
  beforeEach(() => {
    useRateStore.setState({ rate: null, source: null, fetchedAt: null, isLoading: false, error: null });
  });

  it('obtiene la tasa de la primera API disponible', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ precio: 36.5 }),
    } as Response) as unknown as typeof fetch;
    const rate = await useRateStore.getState().fetchRate();
    expect(rate).toBe(36.5);
  });

  it('cae a la siguiente API si la primera falla', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ USD: 37.2 }) } as unknown as Response) as unknown as typeof fetch;
    const rate = await useRateStore.getState().fetchRate();
    expect(rate).toBe(37.2);
  });

  it('permite fijar la tasa manualmente', async () => {
    await useRateStore.getState().setManualRate(40);
    const state = useRateStore.getState();
    expect(state.rate).toBe(40);
    expect(state.source).toBe('manual');
  });

  afterEach(() => {
    // @ts-expect-error cleanup restores the real fetch
    delete globalThis.fetch;
  });
});

describe('ToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toast: null });
  });

  it('muestra un toast con tipo por defecto success', () => {
    useToastStore.getState().showToast('Guardado');
    const toast = useToastStore.getState().toast;
    expect(toast).not.toBeNull();
    expect(toast!.message).toBe('Guardado');
    expect(toast!.type).toBe('success');
    expect(toast!.id).toBeGreaterThan(0);
  });

  it('muestra un toast con tipo explícito', () => {
    useToastStore.getState().showToast('Hubo un error', 'error');
    expect(useToastStore.getState().toast!.type).toBe('error');
  });

  it('oculta el toast actual', () => {
    useToastStore.getState().showToast('Info', 'info');
    useToastStore.getState().hideToast();
    expect(useToastStore.getState().toast).toBeNull();
  });

  it('cada toast nuevo recibe un id incremental', () => {
    useToastStore.getState().showToast('Uno');
    const firstId = useToastStore.getState().toast!.id;
    useToastStore.getState().showToast('Dos');
    const secondId = useToastStore.getState().toast!.id;
    expect(secondId).toBeGreaterThan(firstId);
  });
});
