import { randomUUID } from 'crypto';
import { db } from './index.js';

type OrderMode = 'created_desc' | 'created_asc' | 'sort_order';

interface CollectionOptions<T> {
  table: string;
  idPrefix: string;
  order: OrderMode;
  /**
   * A few tables (e.g. volunteers.event_id) keep one field as a real column
   * outside the `data` JSON blob, for a fast indexed lookup/join. Return the
   * column -> value pairs to persist alongside `data` on every insert/update
   * so that column never drifts from (or is left NULL relative to) the JSON.
   */
  extraColumns?: (item: T) => Record<string, string | number>;
}

/**
 * Thin wrapper around a `{id, created_at?, sort_order?, data JSON}` table —
 * every dbService collection (events, news, partners, ...) has this exact
 * shape, so one generic helper covers all of them instead of hand-writing
 * near-identical SQL per resource.
 */
export function makeCollection<T extends { id: string }>(opts: CollectionOptions<T>) {
  const { table, idPrefix, order, extraColumns } = opts;
  const orderSql =
    order === 'sort_order' ? 'ORDER BY sort_order ASC' :
    order === 'created_asc' ? 'ORDER BY created_at ASC' :
    'ORDER BY created_at DESC';

  const extraColsFor = (item: T): { names: string[]; values: (string | number)[] } => {
    const cols = extraColumns ? extraColumns(item) : {};
    const names = Object.keys(cols);
    return { names, values: names.map((n) => cols[n]) };
  };

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
      const { names, values } = extraColsFor(item);
      if (order === 'sort_order') {
        const sortOrder = extra?.sortOrder ?? nextSortOrder(table);
        const cols = ['id', 'sort_order', ...names, 'data'];
        db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`)
          .run(id, sortOrder, ...values, JSON.stringify(item));
      } else {
        const cols = ['id', 'created_at', ...names, 'data'];
        db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`)
          .run(id, Date.now(), ...values, JSON.stringify(item));
      }
      return item;
    },

    update(id: string, updates: Partial<T>): T | null {
      const existing = this.getById(id);
      if (!existing) return null;
      const merged = { ...existing, ...updates, id } as T;
      const { names, values } = extraColsFor(merged);
      const setCols = [...names.map((n) => `${n} = ?`), 'data = ?'];
      db.prepare(`UPDATE ${table} SET ${setCols.join(', ')} WHERE id = ?`).run(...values, JSON.stringify(merged), id);
      return merged;
    },

    replaceAll(items: T[]): void {
      const insert = db.prepare(`INSERT INTO ${table} (id, sort_order, data) VALUES (?, ?, ?)`);
      const clear = db.prepare(`DELETE FROM ${table}`);
      const tx = db.transaction((rows: T[]) => {
        clear.run();
        rows.forEach((item, index) => insert.run(item.id, index, JSON.stringify(item)));
      });
      tx(items);
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
      const { names, values } = extraColsFor(item);
      if (order === 'sort_order') {
        const cols = ['id', 'sort_order', ...names, 'data'];
        db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`)
          .run(item.id, rank, ...values, JSON.stringify(item));
      } else if (order === 'created_asc') {
        const cols = ['id', 'created_at', ...names, 'data'];
        db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`)
          .run(item.id, rank, ...values, JSON.stringify(item));
      } else {
        // created_desc: earlier array entries must sort first, i.e. need the
        // largest created_at, so rank counts down.
        const cols = ['id', 'created_at', ...names, 'data'];
        db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`)
          .run(item.id, -rank, ...values, JSON.stringify(item));
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
