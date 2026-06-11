import { NextResponse } from "next/server";
import { ensureSchema, getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PlaceholderRow {
  id: string;
  prompt: string;
}
interface FillRow {
  side: string;
  placeholder_id: string;
  photo_url: string;
  note: string | null;
  filled_at: string;
}

export async function GET() {
  try {
    await ensureSchema();
    const pool = getPool();
    const [ph, fl] = await Promise.all([
      pool.query<PlaceholderRow>("SELECT id, prompt FROM placeholders ORDER BY sort, created_at"),
      pool.query<FillRow>("SELECT side, placeholder_id, photo_url, note, filled_at FROM fills"),
    ]);
    return NextResponse.json({
      placeholders: ph.rows.map((r) => ({ id: r.id, prompt: r.prompt })),
      fills: fl.rows.map((r) => ({
        side: r.side,
        placeholderId: r.placeholder_id,
        photoUrl: r.photo_url,
        note: r.note ?? undefined,
        filledAt: new Date(r.filled_at).getTime(),
      })),
    });
  } catch (e) {
    console.error("GET /api/space:", e);
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}
