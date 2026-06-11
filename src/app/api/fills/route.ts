import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// tempel / ganti foto sebuah momen
export async function PUT(req: NextRequest) {
  try {
    await ensureSchema();
    const { side, placeholderId, photoUrl, note } = await req.json();
    if (
      (side !== "vie" && side !== "abel") ||
      typeof placeholderId !== "string" ||
      typeof photoUrl !== "string" ||
      !photoUrl
    ) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    // batas ukuran sederhana (~1.5MB dataURL)
    if (photoUrl.length > 1_500_000) {
      return NextResponse.json({ error: "too_large" }, { status: 413 });
    }
    await getPool().query(
      `INSERT INTO fills (side, placeholder_id, photo_url, note)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (side, placeholder_id)
       DO UPDATE SET photo_url = EXCLUDED.photo_url, note = EXCLUDED.note, filled_at = now()`,
      [side, placeholderId, photoUrl, note?.trim() || null]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/fills:", e);
    return NextResponse.json({ error: "db_error" }, { status: 503 });
  }
}

// lepas foto sebuah momen
export async function DELETE(req: NextRequest) {
  try {
    await ensureSchema();
    const { side, placeholderId } = await req.json();
    if ((side !== "vie" && side !== "abel") || typeof placeholderId !== "string") {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    await getPool().query("DELETE FROM fills WHERE side = $1 AND placeholder_id = $2", [side, placeholderId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/fills:", e);
    return NextResponse.json({ error: "db_error" }, { status: 503 });
  }
}
