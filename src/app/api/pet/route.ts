import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOUR = 3600_000;
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

interface PetRow {
  last_fed: string;
  last_coffee: string | null;
  happiness: number;
  growth: number;
  updated_at: string;
  lasagna: number;
  stuffed_until: string | null;
  born_at: string;
}

type Mood = "happy" | "hungry" | "ngambek";
type Phase = "kitten" | "teen" | "adult";

function derive(row: PetRow) {
  const now = Date.now();
  const fedAgoH = (now - new Date(row.last_fed).getTime()) / HOUR;
  const updAgoH = (now - new Date(row.updated_at).getTime()) / HOUR;
  const coffeeAgoH = row.last_coffee ? (now - new Date(row.last_coffee).getTime()) / HOUR : Infinity;
  const stuffed = !!row.stuffed_until && new Date(row.stuffed_until).getTime() > now;

  const fullness = clamp(100 - (fedAgoH / 24) * 100);
  const happiness = clamp(row.happiness - updAgoH);
  const mood: Mood = fedAgoH < 24 ? "happy" : fedAgoH < 36 ? "hungry" : "ngambek";
  const phase: Phase = row.growth < 6 ? "kitten" : row.growth < 18 ? "teen" : "adult";
  const caffeinated = coffeeAgoH < 2;
  const ageDays = Math.max(0, Math.floor((now - new Date(row.born_at).getTime()) / 86400_000));

  return {
    fullness,
    happiness,
    mood,
    phase,
    caffeinated,
    stuffed,
    lasagna: row.lasagna,
    growth: row.growth,
    ageDays,
    fedAgoH: Math.round(fedAgoH),
  };
}

// kata-kata WOWO yang tengil & ngeselin (tulisan orisinal)
const DIARY: Record<string, string[]> = {
  feed: [
    "Manusia ini akhirnya guna juga. Lasagna kuterima. Pujian? Nggak ada.",
    "Aku makan, dia seneng. Lucu, padahal aku yang ngatur dia.",
    "Porsinya kurang dikit. Tapi gengsi komplain. Aku embat aja.",
  ],
  cook: [
    "Dia menang main kartu demi aku. Ya wajar. Aku kan worth it.",
    "Capek mikir angka cuma buat masak aku. Kasian. Lanjutin.",
  ],
  coffee: [
    "Kopi. Bukan berarti aku terkesan ya. Dikit doang.",
    "Melek bentar. Terus mikir, ngapain juga aku melek.",
  ],
  pet: [
    "Dielus. Aku diem aja biar dia ngerasa beruntung.",
    "Lumayan. Tangannya nggak bego-bego amat.",
    "Aku purr dikit. ANGGAP AJA nggak denger.",
  ],
  stuffed: [
    "Kebanyakan dijejelin makan. Sekarang aku cuma bisa guling. Salah kamu.",
    "Kenyang parah. Aku tidur. Jangan diganggu, atau kucakar.",
  ],
};

const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

async function loadState() {
  const pool = getPool();
  const [{ rows: pr }, { rows: dr }] = await Promise.all([
    pool.query<PetRow>("SELECT last_fed, last_coffee, happiness, growth, updated_at, lasagna, stuffed_until, born_at FROM pet WHERE id = 1"),
    pool.query<{ entry: string; created_at: string }>("SELECT entry, created_at FROM pet_diary ORDER BY id DESC LIMIT 6"),
  ]);
  const d = derive(pr[0]);
  return { ...d, diary: dr.map((r) => ({ entry: r.entry, at: new Date(r.created_at).getTime() })) };
}

export async function GET() {
  try {
    await ensureSchema();
    return NextResponse.json(await loadState());
  } catch (e) {
    console.error("GET /api/pet:", e);
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const { action } = await req.json();
    if (!["feed", "coffee", "pet", "cook"].includes(action)) {
      return NextResponse.json({ error: "bad_action" }, { status: 400 });
    }
    const pool = getPool();
    const { rows } = await pool.query<PetRow>("SELECT last_fed, last_coffee, happiness, growth, updated_at, lasagna, stuffed_until, born_at FROM pet WHERE id = 1");
    const before = derive(rows[0]);

    let happiness = before.happiness;
    let growth = rows[0].growth;
    let lasagna = rows[0].lasagna;
    let setFed = false;
    let setCoffee = false;
    let setStuffedUntil: "keep" | "set" | "clear" = "keep";
    let diaryKey = action;

    if (action === "cook") {
      lasagna = Math.min(9, lasagna + 1); // menang game 24 → +1 lasagna
    } else if (action === "feed") {
      if (before.stuffed) {
        return NextResponse.json({ error: "stuffed" }, { status: 409 });
      }
      if (lasagna <= 0) {
        return NextResponse.json({ error: "no_food" }, { status: 409 });
      }
      lasagna -= 1;
      setFed = true;
      growth += before.fullness >= 80 ? 2 : 1;
      happiness = clamp(happiness + 12);
      // kebanyakan makan pas udah kenyang → kekenyangan, ketiduran
      if (before.fullness >= 85) {
        setStuffedUntil = "set";
        diaryKey = "stuffed";
      }
    } else if (action === "coffee") {
      setCoffee = true;
      happiness = clamp(happiness + 8);
      setStuffedUntil = "clear"; // kopi bikin melek lagi
    } else {
      happiness = clamp(happiness + 8);
    }

    await pool.query(
      `UPDATE pet SET
         happiness = $1, growth = $2, lasagna = $3,
         last_fed = CASE WHEN $4 THEN now() ELSE last_fed END,
         last_coffee = CASE WHEN $5 THEN now() ELSE last_coffee END,
         stuffed_until = CASE WHEN $6 = 'set' THEN now() + interval '2 hours'
                              WHEN $6 = 'clear' THEN NULL ELSE stuffed_until END,
         updated_at = now()
       WHERE id = 1`,
      [happiness, growth, lasagna, setFed, setCoffee, setStuffedUntil]
    );

    const line = pick(DIARY[diaryKey] ?? DIARY.pet);
    await pool.query("INSERT INTO pet_diary (entry) VALUES ($1)", [line]);
    await pool.query("DELETE FROM pet_diary WHERE id NOT IN (SELECT id FROM pet_diary ORDER BY id DESC LIMIT 30)");

    return NextResponse.json(await loadState());
  } catch (e) {
    console.error("POST /api/pet:", e);
    return NextResponse.json({ error: "db_error" }, { status: 503 });
  }
}
