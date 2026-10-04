import { getDatabase } from '../../../lib/db';
import type { Service } from '../../../types';

export function getAllServices(): Service[] {
  const db = getDatabase();
  return db.getAllSync<Service>(
    'SELECT * FROM services ORDER BY createdAt DESC',
  );
}

export function getServiceById(id: string): Service | undefined {
  const db = getDatabase();
  return (
    db.getFirstSync<Service>('SELECT * FROM services WHERE id = ?', id) ??
    undefined
  );
}

export function createService(service: Service): void {
  const db = getDatabase();
  db.runSync(
    `INSERT INTO services (id, name, description, priceUSD, priceVES, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    service.id,
    service.name,
    service.description ?? null,
    service.priceUSD,
    service.priceVES,
    service.isActive ? 1 : 0,
    service.createdAt,
    service.updatedAt,
  );
}

export function updateService(service: Service): void {
  const db = getDatabase();
  db.runSync(
    `UPDATE services
     SET name = ?, description = ?, priceUSD = ?, priceVES = ?, isActive = ?, updatedAt = ?
     WHERE id = ?`,
    service.name,
    service.description ?? null,
    service.priceUSD,
    service.priceVES,
    service.isActive ? 1 : 0,
    service.updatedAt,
    service.id,
  );
}

export function deleteService(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM services WHERE id = ?', id);
}
