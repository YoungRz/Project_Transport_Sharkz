"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, errMsg, Rute } from "@/app/lib/api";
import { Alert, Empty, Skeletons } from "@/app/components/ui";

export default function HomePage() {
  const [rute, setRute] = useState<Rute[] | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    api<Rute[]>("/rute")
      .then(setRute)
      .catch((e) => setError(errMsg(e)));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!rute) return [];
    if (!s) return rute;
    return rute.filter((r) =>
      [r.kode_rute, r.nama_rute, r.asal, r.tujuan].some((v) => v.toLowerCase().includes(s))
    );
  }, [rute, q]);

  return (
    <>
      <section className="hero">
        <h1>Mau ke mana hari ini?</h1>
        <p>Cari rute, lihat halte yang dilewati, dan rencanakan perjalananmu.</p>
        <input
          className="input"
          type="search"
          placeholder="Cari kode, nama rute, atau tujuan…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Cari rute"
        />
      </section>

      <Alert>{error}</Alert>
      {!rute && !error && <Skeletons />}

      {rute && filtered.length === 0 && (
        <Empty>{q ? "Tidak ada rute yang cocok dengan pencarianmu." : "Belum ada rute."}</Empty>
      )}

      {filtered.length > 0 && (
        <div className="grid">
          {filtered.map((r) => (
            <Link key={r.id} href={`/rute/${r.id}`} className="card">
              <span className="badge">{r.kode_rute}</span>
              <h2>{r.nama_rute}</h2>
              <div className="route-line">
                <span>{r.asal}</span>
                <span className="arrow">→</span>
                <span>{r.tujuan}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
