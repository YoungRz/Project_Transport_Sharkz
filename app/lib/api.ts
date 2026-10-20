export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export type Role = "admin" | "user" | "driver";
export type Kendaraan = "motor" | "mobil";

export interface User {
  id: number;
  nama: string;
  email: string;
  role: Role;
  jenis_kendaraan: Kendaraan | null;
  plat_nomor: string | null;
}

export interface Akun extends User {
  no_hp: string | null;
  created_at: string;
}

export interface Halte {
  id: number;
  rute_id: number;
  nama_halte: string;
  alamat: string | null;
  urutan: number;
}

export interface Rute {
  id: number;
  kode_rute: string;
  nama_rute: string;
  asal: string;
  tujuan: string;
  halte?: Halte[];
}

export type Msg = { kind: "ok" | "bad"; text: string } | null;

/* ---------- sesi login (disimpan di localStorage) ---------- */

export interface Session {
  token: string;
  user: User;
}

const KEY = "tu_session";
const EVENT = "tu-session";

export function readSessionRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function parseSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function loadSession(): Session | null {
  return parseSession(readSessionRaw());
}

export function saveSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(KEY, JSON.stringify(session));
    else localStorage.removeItem(KEY);
  } catch {
    /* penyimpanan diblokir: sesi hanya berlaku di tab ini */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeSession(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/* ---------- pemanggil API ---------- */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function errMsg(e: unknown): string {
  return e instanceof ApiError ? e.message : "Terjadi kesalahan. Coba lagi.";
}

interface Options {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

export async function api<T>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
  const session = loadSession();
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (session) headers.Authorization = `Bearer ${session.token}`;

  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Tidak bisa terhubung ke server. Pastikan backend sedang jalan.", 0);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Token kadaluarsa atau tidak valid: keluarkan dari sesi
    if (res.status === 401 && session && path !== "/auth/login") saveSession(null);
    throw new ApiError(data?.message ?? "Permintaan gagal", res.status);
  }
  return data as T;
}