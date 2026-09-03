import { randomUUID } from 'crypto';
import { db } from './index.js';

type OrderMode = 'created_desc' | 'created_asc' | 'sort_order';

interface CollectionOptions {
  table: string;
  idPrefix: string;
  order: OrderMode;
  /** For a table with an extra required column outside the {id, created_at, data} shape (e.g. volunteers.event_id, indexed for lookups). */
  extraColumn?: { name: string; getValue: (item: any) => string };
}

/**
 * Thin wrapper around a `{id, created_at?, sort_order?, data JSON}` table —
 * every dbService collection (events, news, partners, ...) has this exact
 * shape, so one generic helper covers all of them instead of hand-writing
 * near-identical SQL per resource.
 */
export function makeCollection<T extends { id: string }>(opts: CollectionOptions) {
  const { table, idPrefix, order, extraColumn } = opts;
  const orderSql =
    order === 'sort_order' ? 'ORDER BY sort_order ASC' :
    order === 'created_asc' ? 'ORDER BY created_at ASC' :
    'ORDER BY created_at DESC';

  return {
    getAll(): T[] {
      const rows = db.prepare(`SELECT data FROM ${table} ${orderSql}`).all() as { data: string }[];
      return rows.map((r) => JSON.parse(r.data));
    },

    getById(id: string): T | null {
      const row = db.prepare(`SELECT data FROM ${table} WHERE id = ?`).get(id) as { data: string } | undefined;
      return row ? JSON.parse(row.data) : null;
    },

    insert(partial: Omit<T, 'id'>, extra?: { sortOrder?: number }): T {
      const id = `${idPrefix}-${Date.now()}-${randomUUID().slice(0, 6)}`;
      const item = { ...partial, id } as T;
      if (order === 'sort_order') {
        const sortOrder = extra?.sortOrder ?? nextSortOrder(table);
        db.prepare(`INSERT INTO ${table} (id, sort_order, data) VALUES (?, ?, ?)`).run(id, sortOrder, JSON.stringify(item));
      } else if (extraColumn) {
        db.prepare(`INSERT INTO ${table} (id, ${extraColumn.name}, created_at, data) VALUES (?, ?, ?, ?)`)
          .run(id, extraColumn.getValue(item), Date.now(), JSON.stringify(item));
      } else {
        db.prepare(`INSERT INTO ${table} (id, created_at, data) VALUES (?, ?, ?)`).run(id, Date.now(), JSON.stringify(item));
      }
      return item;
    },

    update(id: string, updates: Partial<T>): T | null {
      const existing = this.getById(id);
      if (!existing) return null;
      const merged = { ...existing, ...updates, id } as T;
      db.prepare(`UPDATE ${table} SET data = ? WHERE id = ?`).run(JSON.stringify(merged), id);
      return merged;
    },

    replaceAll(items: T[]): void {
      const insert = db.prepare(`INSERT INTO ${table} (id, sort_order, data) VALUES (?, ?, ?)`);
      const clear = db.prepare(`DELETE FROM ${table}`);
      db.exec('BEGIN');
      try {
        clear.run();
        items.forEach((item, index) => insert.run(item.id, index, JSON.stringify(item)));
        db.exec('COMMIT');
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },

    delete(id: string): boolean {
      const res = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
      return res.changes > 0;
    },

    /**
     * Seed-only: insert a full item, preserving its original id (some ids,
     * like the default featured event, are hardcoded elsewhere in the app).
     * `rank` is the item's 0-based position in its seed array — translated
     * into whatever ordering column this collection actually sorts by, so
     * seeded rows come back in the same order they were authored in.
     */
    seedRaw(item: T, rank: number): void {
      if (order === 'sort_order') {
        db.prepare(`INSERT INTO ${table} (id, sort_order, data) VALUES (?, ?, ?)`).run(item.id, rank, JSON.stringify(item));
      } else if (order === 'created_asc') {
        if (extraColumn) {
          db.prepare(`INSERT INTO ${table} (id, ${extraColumn.name}, created_at, data) VALUES (?, ?, ?, ?)`)
            .run(item.id, extraColumn.getValue(item), rank, JSON.stringify(item));
        } else {
          db.prepare(`INSERT INTO ${table} (id, created_at, data) VALUES (?, ?, ?)`).run(item.id, rank, JSON.stringify(item));
        }
      } else if (extraColumn) {
        // created_desc: earlier array entries must sort first, i.e. need the
        // largest created_at, so rank counts down.
        db.prepare(`INSERT INTO ${table} (id, ${extraColumn.name}, created_at, data) VALUES (?, ?, ?, ?)`)
          .run(item.id, extraColumn.getValue(item), -rank, JSON.stringify(item));
      } else {
        // created_desc: earlier array entries must sort first, i.e. need the
        // largest created_at, so rank counts down.
        db.prepare(`INSERT INTO ${table} (id, created_at, data) VALUES (?, ?, ?)`).run(item.id, -rank, JSON.stringify(item));
      }
    },

    count(): number {
      const row = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number };
      return row.c;
    },
  };
}

function nextSortOrder(table: string): number {
  const row = db.prepare(`SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM ${table}`).get() as { maxOrder: number };
  return row.maxOrder + 1;
}
