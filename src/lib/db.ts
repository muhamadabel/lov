import { Pool } from "pg";

/**
 * Koneksi Postgres (mis. Render.com). Connection string diambil dari env
 * DATABASE_URL — JANGAN ditaruh di kode/komponen klien. Pool di-cache di global
 * supaya hot-reload dev tidak bikin koneksi numpuk.
 */

const DEFAULT_PROMPTS = [
  "lagi makan",
  "di jalan",
  "bareng temen-temen",
  "makanan favorit",
  "tempat favorit",
  "lagi badmood",
  "lagi produktif",
  "si paling ngeselin",
];

declare global {
  // eslint-disable-next-line no-var
  var _loviePool: Pool | undefined;
  // eslint-disable-next-line no-var
  var _lovieSchemaReady: Promise<void> | undefined;
}

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diatur (isi di .env.local)");
  }
  if (!global._loviePool) {
    global._loviePool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Render & Postgres terkelola umumnya butuh SSL
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return global._loviePool;
}

/** Bikin tabel kalau belum ada + seed placeholder default sekali. Idempoten. */
export function ensureSchema(): Promise<void> {
  if (!global._lovieSchemaReady) {
    global._lovieSchemaReady = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS placeholders (
          id text PRIMARY KEY,
          prompt text NOT NULL,
          sort integer NOT NULL DEFAULT 0,
          created_at timestamptz NOT NULL DEFAULT now()
        );
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS fills (
          side text NOT NULL,
          placeholder_id text NOT NULL,
          photo_url text NOT NULL,
          note text,
          filled_at timestamptz NOT NULL DEFAULT now(),
          PRIMARY KEY (side, placeholder_id)
        );
      `);
      // seed sekali kalau masih kosong
      const { rows } = await pool.query<{ count: string }>("SELECT count(*) FROM placeholders");
      if (Number(rows[0].count) === 0) {
        const values = DEFAULT_PROMPTS.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2}, ${i})`).join(", ");
        const params = DEFAULT_PROMPTS.flatMap((p, i) => [`seed-${i}`, p]);
        await pool.query(`INSERT INTO placeholders (id, prompt, sort) VALUES ${values}`, params);
      }
    })().catch((e) => {
      // reset supaya percobaan berikutnya bisa coba lagi
      global._lovieSchemaReady = undefined;
      throw e;
    });
  }
  return global._lovieSchemaReady;
}
