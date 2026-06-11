import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeId() {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// tambah momen baru
export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const { prompt } = await req.json();
    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "prompt_required" }, { status: 400 });
    }
    const pool = getPool();
    const id = makeId();
    const { rows } = await pool.query<{ max: number | null }>("SELECT max(sort) AS max FROM placeholders");
    const sort = (rows[0].max ?? 0) + 1;
    await pool.query("INSERT INTO placeholders (id, prompt, sort) VALUES ($1, $2, $3)", [id, prompt.trim(), sort]);
    return NextResponse.json({ id, prompt: prompt.trim() });
  } catch (e) {
    console.error("POST /api/placeholders:", e);
    return NextResponse.json({ error: "db_error" }, { status: 503 });
  }
}

// ubah teks momen
export async function PATCH(req: NextRequest) {
  try {
    await ensureSchema();
    const { id, prompt } = await req.json();
    if (typeof id !== "string" || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    await getPool().query("UPDATE placeholders SET prompt = $2 WHERE id = $1", [id, prompt.trim()]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/placeholders:", e);
    return NextResponse.json({ error: "db_error" }, { status: 503 });
  }
}

// hapus momen (+ fill terkait di kedua sisi)
export async function DELETE(req: NextRequest) {
  try {
    await ensureSchema();
    const { id } = await req.json();
    if (typeof id !== "string") {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    const pool = getPool();
    await pool.query("DELETE FROM fills WHERE placeholder_id = $1", [id]);
    await pool.query("DELETE FROM placeholders WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/placeholders:", e);
    return NextResponse.json({ error: "db_error" }, { status: 503 });
  }
}
