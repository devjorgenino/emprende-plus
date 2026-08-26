import { getDatabase } from '../../lib/db';

const MIGRATIONS: Array<{ version: number; sql: string }> = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        priceUSD REAL NOT NULL,
        priceVES REAL NOT NULL,
        category TEXT NOT NULL,
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS quotes (
        id TEXT PRIMARY KEY,
        totalUSD REAL NOT NULL,
        totalVES REAL NOT NULL,
        exchangeRate REAL NOT NULL,
        exchangeRateDate TEXT NOT NULL,
        clientName TEXT,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        imageUri TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS quote_items (
        id TEXT PRIMARY KEY,
        quoteId TEXT NOT NULL,
        serviceId TEXT NOT NULL,
        serviceName TEXT NOT NULL,
        priceUSD REAL NOT NULL,
        quantity INTEGER NOT NULL,
        subtotalUSD REAL NOT NULL,
        FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        quoteId TEXT,
        totalUSD REAL NOT NULL,
        totalVES REAL NOT NULL,
        exchangeRate REAL NOT NULL,
        clientName TEXT,
        paymentMethod TEXT NOT NULL,
        notes TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        saleId TEXT NOT NULL,
        serviceId TEXT NOT NULL,
        serviceName TEXT NOT NULL,
        priceUSD REAL NOT NULL,
        quantity INTEGER NOT NULL,
        subtotalUSD REAL NOT NULL,
        FOREIGN KEY (saleId) REFERENCES sales(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS inventory_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        purchasePriceUSD REAL NOT NULL,
        purchasePriceVES REAL NOT NULL,
        exchangeRateAtPurchase REAL NOT NULL,
        supplier TEXT,
        purchaseDate TEXT NOT NULL,
        notes TEXT,
        createdAt TEXT NOT NULL
      );
    `,
  },
  {
    version: 2,
    sql: `
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        amountUSD REAL NOT NULL,
        amountVES REAL NOT NULL,
        exchangeRate REAL NOT NULL,
        paymentMethod TEXT NOT NULL,
        supplier TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL
      );
    `,
  },
  {
    version: 3,
    sql: `
      CREATE TABLE IF NOT EXISTS services_v2 (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        priceUSD REAL NOT NULL,
        priceVES REAL NOT NULL,
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      INSERT INTO services_v2 SELECT id, name, description, priceUSD, priceVES, isActive, createdAt, updatedAt FROM services;
      DROP TABLE services;
      ALTER TABLE services_v2 RENAME TO services;
    `,
  },
  {
    version: 4,
    sql: `
      CREATE INDEX IF NOT EXISTS idx_quote_items_quoteId ON quote_items(quoteId);
      CREATE INDEX IF NOT EXISTS idx_sale_items_saleId ON sale_items(saleId);
      CREATE INDEX IF NOT EXISTS idx_quotes_createdAt ON quotes(createdAt);
      CREATE INDEX IF NOT EXISTS idx_sales_createdAt ON sales(createdAt);
      CREATE INDEX IF NOT EXISTS idx_expenses_createdAt ON expenses(createdAt);
      CREATE INDEX IF NOT EXISTS idx_inventory_items_createdAt ON inventory_items(createdAt);
    `,
  },
  {
    version: 5,
    sql: `
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL
      );
    `,
  },
  {
    version: 6,
    sql: `
      ALTER TABLE inventory_items ADD COLUMN photoUri TEXT;
    `,
  },
  {
    version: 7,
    sql: `
      ALTER TABLE inventory_items ADD COLUMN lowStockThreshold REAL DEFAULT 0;
    `,
  },
];

export function runMigrations(): void {
  const db = getDatabase();

  db.execSync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY
    );
  `);

  const currentVersion = db
    .getAllSync<{ version: number }>('SELECT MAX(version) as version FROM _migrations')
    .map((r) => r.version)[0] ?? 0;

  const pending = MIGRATIONS.filter((m) => m.version > currentVersion);
  for (const migration of pending) {
    db.execSync(migration.sql);
    db.runSync('INSERT INTO _migrations (version) VALUES (?)', migration.version);
  }
}
