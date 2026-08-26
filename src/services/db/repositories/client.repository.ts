import { getDatabase } from '../../../lib/db';
import { generateId } from '../../../utils/id';

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

function mapClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string | undefined,
    email: row.email as string | undefined,
    notes: row.notes as string | undefined,
    createdAt: row.createdAt as string,
  };
}

export function getAllClients(): Client[] {
  const db = getDatabase();
  const rows = db.getAllSync<Record<string, unknown>>('SELECT * FROM clients ORDER BY name ASC');
  return rows.map(mapClient);
}

export function getClientById(id: string): Client | undefined {
  const db = getDatabase();
  const row = db.getFirstSync<Record<string, unknown>>('SELECT * FROM clients WHERE id = ?', id);
  return row ? mapClient(row) : undefined;
}

export function getClientByName(name: string): Client | undefined {
  const db = getDatabase();
  const row = db.getFirstSync<Record<string, unknown>>('SELECT * FROM clients WHERE name = ?', name);
  return row ? mapClient(row) : undefined;
}

export function createClient(name: string, phone?: string, email?: string, notes?: string): Client {
  const db = getDatabase();
  const client: Client = {
    id: generateId(),
    name,
    phone,
    email,
    notes,
    createdAt: new Date().toISOString(),
  };
  db.runSync(
    'INSERT INTO clients (id, name, phone, email, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    client.id, client.name, client.phone ?? null, client.email ?? null, client.notes ?? null, client.createdAt,
  );
  return client;
}

export function upsertClientByName(name: string): Client {
  const existing = getClientByName(name);
  if (existing) return existing;
  return createClient(name);
}

export function updateClient(id: string, data: { phone?: string; email?: string; notes?: string }): void {
  const db = getDatabase();
  const existing = getClientById(id);
  if (!existing) return;
  db.runSync(
    'UPDATE clients SET phone = ?, email = ?, notes = ? WHERE id = ?',
    data.phone !== undefined ? data.phone : existing.phone ?? null,
    data.email !== undefined ? data.email : existing.email ?? null,
    data.notes !== undefined ? data.notes : existing.notes ?? null,
    id,
  );
}

export function deleteClient(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM clients WHERE id = ?', id);
}
