import { generateId } from '../src/utils/id';
import { exportSalesToCSV, exportExpensesToCSV } from '../src/utils/csv';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as ExpoCrypto from 'expo-crypto';
import type { Sale, Expense } from '../src/types';

// Test-only helpers injected by jest.setup.js factories.
const fsMock = FileSystem as unknown as {
  __clearWritten: () => void;
  __getLastWrite: () => { uri: string; content: string } | null;
};
const sharingMock = Sharing as unknown as {
  __getLastShareArgs: () => { uri: string; options: unknown } | null;
  __reset: () => void;
  __setAvailable: (v: boolean) => void;
};
const cryptoMock = ExpoCrypto as unknown as { __resetCounter: () => void };

describe('generateId', () => {
  beforeEach(() => cryptoMock.__resetCounter());

  it('genera UUIDs únicos', () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('CSV export', () => {
  beforeEach(() => {
    fsMock.__clearWritten();
    sharingMock.__reset();
  });

  const sale: Sale = {
    id: 's1',
    items: [
      {
        serviceId: 'sv1',
        serviceName: 'Diseño, Premium',
        priceUSD: 100,
        quantity: 2,
        subtotalUSD: 200,
      },
    ],
    totalUSD: 200,
    totalVES: 7300,
    exchangeRate: 36.5,
    clientName: 'Cliente, S.A.',
    paymentMethod: 'pago_movil',
    createdAt: '2026-01-15T12:00:00.000Z',
  };

  it('exporta ventas a CSV con escaping correcto', async () => {
    await exportSalesToCSV([sale]);
    const shareArgs = sharingMock.__getLastShareArgs();
    expect(shareArgs).not.toBeNull();
    const csv = fsMock.__getLastWrite()?.content;
    expect(csv).toBeDefined();
    expect(csv).toContain('Fecha,Cliente,Total USD,Total VES');
    expect(csv).toContain('"Cliente, S.A."');
    expect(csv).toContain('"Diseño, Premium"');
    expect(csv).toContain('(x2 $200.00)');
  });

  it('no comparte si el sharing no está disponible', async () => {
    sharingMock.__setAvailable(false);
    await exportSalesToCSV([sale]);
    expect(sharingMock.__getLastShareArgs()).toBeNull();
  });

  it('exporta egresos a CSV', async () => {
    const expense: Expense = {
      id: 'e1',
      description: 'Compra, insumos',
      category: 'Insumos',
      amountUSD: 50,
      amountVES: 1825,
      exchangeRate: 36.5,
      paymentMethod: 'usd_cash',
      createdAt: '2026-01-15T12:00:00.000Z',
    };
    await exportExpensesToCSV([expense]);
    expect(sharingMock.__getLastShareArgs()).not.toBeNull();
    const csv = fsMock.__getLastWrite()?.content;
    expect(csv).toContain('Fecha,Descripción,Categoría');
    expect(csv).toContain('"Compra, insumos"');
  });
});
