export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:777";

export type Role = "admin" | "user" | "driver";

export interface User {
  id: number;
  nama: string;
  email: string;
  role: Role;
  jenis_kendaraan?: "motor" | "mobil" | null;
  plat_nomor?: string | null;
  no_hp?: string | null;
  created_at?: string;
}

export interface Rute {
  id: number;
  kode_rute: string;
  nama_rute: string;
  asal: string;
  tujuan: string;
}

export interface Halte {
  id: number;
  rute_id: number;
  nama_halte: string;
  alamat: string | null;
  urutan: number;
}

export interface Pesanan {
  id: number;
  status: "diterima" | "selesai" | "dibatalkan";
  jenis_kendaraan: "motor" | "mobil";
  created_at: string;
  kode_rute: string | null;
  nama_rute: string | null;
  halte_asal: string | null;
  halte_tujuan: string | null;
  driver_nama: string | null;
  driver_no_hp: string | null;
  driver_plat: string | null;
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage tidak tersedia */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Terjadi kesalahan");

interface Options {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

export async function api<T = unknown>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Tidak bisa terhubung ke server. Pastikan API Express sudah jalan.", 0);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Token kadaluarsa / tidak valid -> paksa login ulang (kecuali saat memang sedang login)
    if (res.status === 401 && token && path !== "/auth/login") {
      setToken(null);
      try {
        localStorage.removeItem(USER_KEY);
      } catch {
        /* abaikan */
      }
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    throw new ApiError(data?.message ?? "Terjadi kesalahan", res.status);
  }
  return data as T;
}
