/**
 * Kredensial login. Username tidak case-sensitive; spasi di pinggir diabaikan.
 * Ganti password di sini kapan saja.
 */
const ACCOUNTS: { username: string; password: string; route: string }[] = [
  // Kredensial lama — tetap ke halaman farewell
  { username: "vie", password: "35", route: "/farewell" },
  // Space interaktif Abel & Puput (buku galeri, dan fitur lain menyusul)
  { username: "fee", password: "16", route: "/space" },
];

const SESSION_KEY = "lovie_space";

export interface AuthResult {
  route: string;
}

export function authenticate(username: string, password: string): AuthResult | null {
  const found = ACCOUNTS.find(
    (a) => a.username === username.trim().toLowerCase() && a.password === password.trim()
  );
  if (!found) return null;
  if (found.route === "/space" && typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, "1");
  }
  return { route: found.route };
}

export function isSpaceUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function clearSession() {
  if (typeof window !== "undefined") sessionStorage.removeItem(SESSION_KEY);
}
